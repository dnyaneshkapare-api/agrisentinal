import React from 'react';
import { LanguageCode } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import { AlertTriangle, CloudRain, Activity, MapPin, ArrowRight } from 'lucide-react';

interface AlertBannerProps {
  language: LanguageCode;
  onExploreHotspot: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ language, onExploreHotspot }) => {
  const t = TRANSLATIONS[language];

  return (
    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/70 border border-amber-500/30 rounded-xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-full bg-amber-500/5 blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
                {language === 'mr' ? 'धोका इशारा: चेतावणी' : 'Risk Forecast: Warning Level'}
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-slate-300 font-mono">
                Raw Model P: 81% · Band: Warning
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-xs text-emerald-400 font-mono">
                3 Converging Signals
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              {t.alertBannerTitle}: Niphad-Dindori Soybean Corridor
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              {t.alertBannerSubtitle}
            </p>

            {/* Evidence Chips */}
            <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 flex-wrap">
              <span className="flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-sky-400" />
                <span>Rain: 52 mm / RH 89.2%</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                <span>R3 Pod Fill Stage (High Vulnerability)</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-400" />
                <span>3 Validated Cases in 7.4 km</span>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
          <button
            onClick={onExploreHotspot}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>{language === 'mr' ? 'प्रादुर्भाव नकाशा पहा' : 'View Hotspot Map'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
