import React, { useState } from 'react';
import { CropProtectionResponse, LanguageCode } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle,
  ExternalLink,
  Printer,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface CropProtectionAdvisorProps {
  data: CropProtectionResponse;
  language: LanguageCode;
  onFollowupSchedule?: () => void;
}

export const CropProtectionAdvisor: React.FC<CropProtectionAdvisorProps> = ({
  data,
  language,
  onFollowupSchedule,
}) => {
  const t = TRANSLATIONS[language];
  const [scheduled, setScheduled] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">{t.cropProtectionTitle}</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded transition-colors flex items-center gap-1.5"
            title="Print or export advisory"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export / Print</span>
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-5">
        {/* Strict Safety Disclaimer Banner (§6.2 Rule 5) */}
        <div className="p-3.5 rounded-lg bg-amber-950/60 border border-amber-600/50 flex items-start gap-3">
          <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-bold text-amber-300 font-mono uppercase tracking-wide block mb-0.5">
              {t.safetyNotice}
            </span>
            {data.safety_disclaimer}
          </div>
        </div>

        {/* Safe Refusal / Abstain State (§6.2 Rule 3) */}
        {data.abstain_state && (
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <AlertOctagon className="w-4 h-4" />
              <span>Chemical Pathways Locked (Uncertain Evidence / Quality Gate Failed)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              {data.abstain_reason ||
                'To prevent indiscriminate chemical usage, synthetic fungicides/insecticides are withheld until verified on-site by an extension officer.'}
            </p>
          </div>
        )}

        {/* IPM 4-STEP LADDER HIERARCHY */}
        <div className="space-y-4">
          {/* STEP 1: Monitoring & Scouting (ETL) */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                {t.ipmLadder.step1}
              </span>
              <span className="text-[11px] font-mono text-slate-400">Step 1 of 4</span>
            </div>
            <div className="text-xs space-y-1.5 text-slate-300">
              <div>
                <span className="text-slate-400 font-medium">Economic Threshold Level (ETL): </span>
                <span className="text-white font-mono">{data.ipm_pathway.step_1_monitoring.etl_threshold}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium">Field Scouting Protocol: </span>
                <span>{data.ipm_pathway.step_1_monitoring.scouting_protocol}</span>
              </div>
            </div>
          </div>

          {/* STEP 2: Cultural & Mechanical */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                {t.ipmLadder.step2}
              </span>
              <span className="text-[11px] font-mono text-slate-400">Step 2 of 4</span>
            </div>

            <div className="space-y-3">
              {data.ipm_pathway.step_2_cultural.map(rule => (
                <div key={rule.rule_id} className="text-xs border-l-2 border-emerald-500 pl-3 py-0.5">
                  <h5 className="font-semibold text-white">
                    {rule.action_title[language] || rule.action_title.en}
                  </h5>
                  <p className="text-slate-400 mt-0.5">{rule.dose_text}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-mono">
                    <span>Source: {rule.authority_source}</span>
                    <span>·</span>
                    <span className="text-amber-400 font-semibold">{t.todoAgronomistTag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 3: Biological & Botanical */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                {t.ipmLadder.step3}
              </span>
              <span className="text-[11px] font-mono text-slate-400">Step 3 of 4</span>
            </div>

            <div className="space-y-3">
              {data.ipm_pathway.step_3_biological_botanical.map(rule => (
                <div key={rule.rule_id} className="text-xs border-l-2 border-emerald-500 pl-3 py-1 space-y-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h5 className="font-semibold text-white">
                      {rule.action_title[language] || rule.action_title.en}
                    </h5>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {rule.product?.hazard_class || 'Green (Cautionary)'}
                    </span>
                  </div>

                  <div className="text-slate-300">
                    <span className="text-slate-400">Label Dose: </span>
                    <span className="font-mono text-white">{rule.dose_text}</span>
                  </div>

                  <div className="text-slate-400 text-[11px]">
                    Water volume: {rule.water_volume_text} · Interval: {rule.interval_days} days
                  </div>

                  <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400 flex-wrap">
                    <span>IRAC/FRAC: {rule.product?.irac_frac_group}</span>
                    <span>·</span>
                    <span className="text-amber-400 font-semibold">{t.todoAgronomistTag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* STEP 4: Chemical Intervention (LAST RESORT) (§6.2 Rule 2 & Rule 5) */}
          <div
            className={`p-4 rounded-xl border ${
              data.gated_chemical_allowed
                ? 'bg-rose-950/20 border-rose-800/40'
                : 'bg-slate-950/40 border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-400 font-mono uppercase tracking-wider">
                {t.ipmLadder.step4}
              </span>
              <span className="text-[11px] font-mono text-slate-400">Step 4 of 4</span>
            </div>

            {!data.gated_chemical_allowed ? (
              <p className="text-xs text-slate-400 italic">
                Chemical pathways are locked for lower risk bands (Monitor/Watch) to protect natural predators.
              </p>
            ) : (
              <div className="space-y-4">
                {data.ipm_pathway.step_4_chemical_last_resort.map(rule => (
                  <div key={rule.rule_id} className="text-xs border-l-2 border-rose-500 pl-3 py-1 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <h5 className="font-bold text-rose-200">
                        {rule.action_title[language] || rule.action_title.en}
                      </h5>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        {rule.product?.hazard_class}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 rounded bg-slate-950 border border-slate-800">
                      <div>
                        <span className="text-[11px] text-slate-400 block">{t.phiLabel}:</span>
                        <span className="font-mono font-bold text-white text-xs">{rule.phi_days} Days</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-slate-400 block">{t.reiLabel}:</span>
                        <span className="font-mono font-bold text-white text-xs">{rule.rei_hours} Hours</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[11px] text-slate-400 block">Dose & Water Volume:</span>
                        <span className="font-mono text-emerald-400 font-bold">{rule.dose_text}</span>
                        <span className="text-slate-400 ml-1">in {rule.water_volume_text}</span>
                      </div>
                    </div>

                    {/* Mandatory PPE (§6.2 Rule 5) */}
                    <div className="text-[11px] text-slate-300">
                      <span className="text-slate-400 font-medium">{t.ppeLabel}: </span>
                      <span>{rule.ppe_text}</span>
                    </div>

                    {/* Resistance Rotation Rule (§6.2 Rule 5) */}
                    <div className="text-[11px] text-amber-300 bg-amber-950/40 border border-amber-800/40 p-2 rounded">
                      <span className="font-bold">{t.resistanceRotation}: </span>
                      <span>{rule.resistance_rotation_hint}</span>
                    </div>

                    {/* Toxicity Warning */}
                    <div className="text-[11px] text-rose-300">
                      <span className="font-semibold text-rose-400">Toxicity Notice: </span>
                      <span>{rule.toxicity_warning}</span>
                    </div>

                    {/* Authority Reference */}
                    <div className="flex items-center justify-between text-[10.5px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                      <a
                        href={rule.product?.source_url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:text-emerald-400 flex items-center gap-1"
                      >
                        <span>{rule.authority_source}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <span className="text-amber-400 font-semibold">{t.todoAgronomistTag}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Follow-Up Action Creation (§6.4) */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            Follow-up protocol: Automated field re-observation scheduled in 7 days to verify canopy recovery.
          </div>

          <button
            onClick={() => {
              setScheduled(true);
              if (onFollowupSchedule) onFollowupSchedule();
            }}
            disabled={scheduled}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center ${
              scheduled
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{scheduled ? 'Follow-Up Task Created' : 'Schedule Day +7 Re-Observation'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
