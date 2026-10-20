import React, { useState } from 'react';
import { Diagnosis, LanguageCode } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import {
  HelpCircle,
  CloudSun,
  Sprout,
  Users,
  History,
  CheckCircle,
  AlertTriangle,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface ExplainabilityCardProps {
  diagnosis: Diagnosis;
  language: LanguageCode;
  onValidateClick?: () => void;
}

export const ExplainabilityCard: React.FC<ExplainabilityCardProps> = ({
  diagnosis,
  language,
  onValidateClick,
}) => {
  const t = TRANSLATIONS[language];
  const [showHeatmap, setShowHeatmap] = useState(true);

  const topName =
    diagnosis.top_hypothesis.common_name[language] || diagnosis.top_hypothesis.common_name.en;

  const isAbstainState = diagnosis.calibrated_probability < 0.65 || !diagnosis.quality_gate_passed;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">{t.explainabilityCardTitle}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>Case: {diagnosis.case_id}</span>
          <span>·</span>
          <span>Model: v1.4</span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Abstain / Human Escalation Banner if low confidence (§2.5) */}
        {isAbstainState && (
          <div className="bg-amber-950/80 border border-amber-600/50 rounded-lg p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-amber-200 uppercase tracking-wide font-mono">
                {t.abstainBanner}
              </h4>
              <p className="text-xs text-amber-300/90 mt-1 leading-relaxed">
                {t.abstainExplanation}
              </p>
            </div>
          </div>
        )}

        {/* Top Hypothesis & Probabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
          <div className="md:col-span-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
              {t.topHypothesis}
            </span>
            <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">{topName}</h4>
            <div className="text-xs italic text-slate-400 font-serif mt-0.5">
              {diagnosis.top_hypothesis.scientific_name}
            </div>

            {/* Differential Alternatives */}
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <span className="text-[11px] font-medium text-slate-400 block mb-1.5">
                {t.alternativeHypotheses}:
              </span>
              <div className="space-y-1.5">
                {diagnosis.alternative_hypotheses.map(alt => (
                  <div key={alt.issue_id} className="flex items-center justify-between text-xs">
                    <span className="text-slate-300">
                      {alt.common_name[language] || alt.common_name.en}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400">
                      {(alt.confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Probabilities & Uncertainty Box */}
          <div className="flex flex-col justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
            <div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Calibrated P:</span>
                <span className="font-mono text-emerald-400 font-bold tabular-nums">
                  {(diagnosis.calibrated_probability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>Raw Vision P:</span>
                <span className="font-mono text-slate-300 tabular-nums">
                  {(diagnosis.raw_probability * 100).toFixed(0)}%
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{t.uncertainty}:</span>
                <span className="font-mono text-amber-400 tabular-nums">
                  {diagnosis.uncertainty_score.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <span className="text-[10px] text-slate-400 block">Farmer Risk Band:</span>
              <span className="text-xs font-bold font-mono text-amber-400 uppercase tracking-wide">
                {diagnosis.farmer_risk_band}
              </span>
            </div>
          </div>
        </div>

        {/* Evidence Region / Saliency Map (§2.6) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-300">{t.evidenceRegion}</span>
            </div>
            <button
              onClick={() => setShowHeatmap(!showHeatmap)}
              className="text-[11px] text-slate-400 hover:text-white transition-colors underline"
            >
              {showHeatmap ? 'Hide Saliency Overlay' : 'Show Saliency Overlay'}
            </button>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 aspect-[16/9] max-h-56">
            <img
              src="https://images.unsplash.com/photo-1592417817098-8f3d6910985b?auto=format&fit=crop&w=800&q=80"
              alt="Soybean Leaf Inspection"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />

            {/* Saliency Overlay */}
            {showHeatmap && (
              <div className="absolute inset-0 pointer-events-none">
                {diagnosis.saliency_regions.map((reg, idx) => (
                  <div
                    key={idx}
                    style={{
                      left: `${reg.x}%`,
                      top: `${reg.y}%`,
                      width: `${reg.width}%`,
                      height: `${reg.height}%`,
                    }}
                    className="absolute border-2 border-dashed border-amber-400 bg-amber-500/20 rounded shadow-xs"
                  >
                    <span className="absolute -top-5 left-0 text-[10px] font-mono bg-slate-900/90 text-amber-300 px-1 py-0.5 rounded whitespace-nowrap border border-amber-500/40">
                      Region {idx + 1}: {reg.label}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5 italic leading-normal">
            {t.saliencyDisclaimer}
          </p>
        </div>

        {/* Structured "Why This Alert" Drivers */}
        <div>
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 font-mono">
            {t.whyThisAlert}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Weather Anomaly */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
              <CloudSun className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">
                  {language === 'mr' ? 'हवामान अनुकूलता' : 'Weather Anomaly (Germination)'}
                </span>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  {diagnosis.evidence_fusion.weather_anomaly.anomaly_summary}
                </p>
              </div>
            </div>

            {/* Crop Stage */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
              <Sprout className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">
                  {language === 'mr' ? 'पिकाची संवेदनशील अवस्था' : 'Critical Crop Stage (Pod Formation)'}
                </span>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  {diagnosis.evidence_fusion.crop_stage_vulnerability.description}
                </p>
              </div>
            </div>

            {/* Nearby Cluster */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
              <Users className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">
                  {language === 'mr' ? 'स्थानिक प्रादुर्भाव क्लस्टर' : 'Spatial Cluster Exposure (7.4 km)'}
                </span>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  {diagnosis.evidence_fusion.spatial_clustering.nearby_validated_cases_count} nearby
                  validated cases downwind along Niphad border corridor.
                </p>
              </div>
            </div>

            {/* Plot History */}
            <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5">
              <History className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-white block">
                  {language === 'mr' ? 'मागील वर्षाचा इतिहास' : 'Plot Recurrence History'}
                </span>
                <p className="text-slate-400 mt-0.5 leading-relaxed">
                  {diagnosis.evidence_fusion.plot_history.last_season_issue}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Next Step & Validation Button */}
        <div className="p-3.5 rounded-lg bg-emerald-950/40 border border-emerald-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-mono text-emerald-300 uppercase tracking-wide block">
              {t.nextStep}
            </span>
            <p className="text-xs text-white mt-0.5">
              {diagnosis.validation_status === 'expert_confirmed'
                ? 'Expert validation confirmed. Proceed with source-linked IPM advisory below.'
                : 'Request expert pathologist field verification before deploying chemical intervention.'}
            </p>
          </div>

          {onValidateClick && (
            <button
              onClick={onValidateClick}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            >
              <span>{language === 'mr' ? 'तपासणी प्रमाणित करा' : 'Validate Case'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
