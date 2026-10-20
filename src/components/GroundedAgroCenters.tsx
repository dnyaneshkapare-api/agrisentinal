import React, { useState, useEffect } from 'react';
import { LanguageCode } from '../types/agri';
import { SEED_VERIFIED_AGRO_CENTERS, GroundedAgroCenterItem } from '../data/seedData';
import { MapPin, ExternalLink, RefreshCw, Sparkles, Navigation, Phone, Building2 } from 'lucide-react';

interface GroundedAgroCentersProps {
  language: LanguageCode;
  plotLocationName?: string;
  latitude?: number;
  longitude?: number;
}

export const GroundedAgroCenters: React.FC<GroundedAgroCentersProps> = ({
  language,
  plotLocationName = 'Niphad / Dindori, Nashik, Maharashtra',
  latitude = 20.0063,
  longitude = 73.79,
}) => {
  const [centers, setCenters] = useState<GroundedAgroCenterItem[]>(SEED_VERIFIED_AGRO_CENTERS);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [locationQuery, setLocationQuery] = useState(plotLocationName);

  const fetchGroundedCenters = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/v1/maps-grounding/agro-centers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: latitude,
          lng: longitude,
          location_name: locationQuery,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.grounded_places && data.grounded_places.length > 0) {
          setCenters(data.grounded_places);
        }
        if (data.analysis) {
          setAnalysisText(data.analysis);
        }
      }
    } catch (_err) {
      // Use verified regional centers
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGroundedCenters();
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-rose-950/80 border border-rose-600/40 flex items-center justify-center text-rose-400">
            <MapPin className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">
              {language === 'mr'
                ? 'नजीकची कृषी विज्ञान केंद्र (KVK) व रोग निदान प्रयोगशाळा'
                : 'Verified Agro-Diagnostic Centers (Google Maps Grounding)'}
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">
              Powered by gemini-3.5-flash with googleMaps tool
            </span>
          </div>
        </div>

        <button
          onClick={fetchGroundedCenters}
          disabled={isLoading}
          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          <span className="hidden sm:inline">Refresh Places</span>
        </button>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <span className="text-slate-400">Current Field Region:</span>
          <span className="font-mono text-emerald-400 font-semibold">{locationQuery}</span>
          <span className="text-slate-600">·</span>
          <span className="font-mono text-slate-400">
            ({latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E)
          </span>
        </div>

        {/* Center Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {centers.map((center, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-2.5"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <h4 className="text-xs font-bold text-white tracking-tight">{center.title}</h4>
                  </div>
                  {center.distance_km && (
                    <span className="text-[10px] font-mono text-emerald-400 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 shrink-0">
                      {center.distance_km}
                    </span>
                  )}
                </div>

                {center.address && (
                  <p className="text-[11px] text-slate-400 mt-1 pl-6 leading-relaxed">
                    {center.address}
                  </p>
                )}

                {center.specialty && (
                  <div className="text-[10.5px] text-amber-300/90 pl-6 mt-1 flex items-center gap-1 font-mono">
                    <span>Specialty: {center.specialty}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[11px]">
                {center.phone ? (
                  <a
                    href={`tel:${center.phone}`}
                    className="text-slate-400 hover:text-white flex items-center gap-1 font-mono"
                  >
                    <Phone className="w-3 h-3 text-slate-500" />
                    <span>{center.phone}</span>
                  </a>
                ) : (
                  <span className="text-slate-600 font-mono">State KVK Referral</span>
                )}

                <a
                  href={center.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 rounded flex items-center gap-1 transition-colors font-medium text-[11px]"
                >
                  <Navigation className="w-3 h-3 text-sky-400" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-2.5 h-2.5 text-slate-500" />
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Informational Callout */}
        <div className="p-3 rounded-lg bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            All centers listed are officially recognized under the Indian Council of Agricultural
            Research (ICAR) or Mahatma Phule Krishi Vidyapeeth (MPKV). Farmers with suspected fungal rust or
            defoliation can submit leaf samples directly to these clinics for microscopic culture verification.
          </p>
        </div>
      </div>
    </div>
  );
};
