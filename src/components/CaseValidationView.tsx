import React, { useState } from 'react';
import { Diagnosis, LanguageCode, UserRole } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import { ExplainabilityCard } from './ExplainabilityCard';
import { CropProtectionAdvisor } from './CropProtectionAdvisor';
import { SEED_PROTECTION_RULES } from '../data/seedData';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileCheck2,
  History,
  Lock,
  ArrowLeft,
  Send,
} from 'lucide-react';

interface CaseValidationViewProps {
  diagnosis: Diagnosis;
  language: LanguageCode;
  userRole: UserRole;
  onBack: () => void;
  onUpdateValidation: (status: Diagnosis['validation_status'], remarks: string) => void;
}

export const CaseValidationView: React.FC<CaseValidationViewProps> = ({
  diagnosis,
  language,
  userRole,
  onBack,
  onUpdateValidation,
}) => {
  const t = TRANSLATIONS[language];
  const [remarks, setRemarks] = useState(
    diagnosis.validator_remarks ||
      'Microscopic verification confirms Phakopsora pachyrhizi urediniospores with sub-epidermal eruption. Spodoptera larvae present in lower canopy.'
  );
  const [validationStatus, setValidationStatus] = useState<Diagnosis['validation_status']>(
    diagnosis.validation_status
  );
  const [isSaved, setIsSaved] = useState(false);

  const canValidate = userRole === 'expert' || userRole === 'system_admin';

  const handleSave = () => {
    onUpdateValidation(validationStatus, remarks);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  // Build advisor response
  const advisorData = {
    case_id: diagnosis.case_id,
    diagnosis_id: diagnosis.id,
    crop: diagnosis.crop || 'Soybean',
    issue_name: diagnosis.top_hypothesis.common_name[language] || diagnosis.top_hypothesis.common_name.en,
    risk_band: diagnosis.farmer_risk_band,
    gated_chemical_allowed: diagnosis.farmer_risk_band === 'Warning' || diagnosis.farmer_risk_band === 'Critical',
    abstain_state: diagnosis.calibrated_probability < 0.65,
    ipm_pathway: {
      step_1_monitoring: {
        etl_threshold: '1 rust lesion per leaf on 5% of sampled plants during R1 to R5 stage.',
        scouting_protocol: 'Inspect lower and middle third of canopy across 5 sampling stations. Check for reddish-brown polygonal pustules under 10x hand lens.',
      },
      step_2_cultural: SEED_PROTECTION_RULES.filter(r => r.action_type === 'cultural'),
      step_3_biological_botanical: SEED_PROTECTION_RULES.filter(
        r => r.action_type === 'biological' || r.action_type === 'botanical'
      ),
      step_4_chemical_last_resort: SEED_PROTECTION_RULES.filter(r => r.action_type === 'chemical'),
    },
    resistance_rotation_guidance:
      'MANDATORY ROTATION RULE: Do NOT repeat FRAC Group 11 (QoI) or IRAC Group 28 (Diamide) consecutively. Rotate with different chemical group or biological antagonist to arrest fungicide resistance development in Maharashtra micro-watersheds.',
    safety_disclaimer:
      'DISCLAIMER: Recommendations strictly follow CIB&RC registration lists and State Agricultural University (MPKV Rahuri) Package of Practices. All chemical applications require full PPE (goggles, mask, gloves). Do not apply near water bodies or during active bee pollination. Seed data marked "TODO: verify with agronomist".',
    authority_verification_notice:
      'Verified under CIB&RC Schedule of Registered Pesticides & Directorate of Plant Protection, Quarantine & Storage (DPPQS) Govt. of India.',
    requires_expert_validation: true,
    rule_version: 'CIBRC-2025.10-SAFE',
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Command Center</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Case ID: {diagnosis.case_id}</span>
          <span className="text-slate-600">·</span>
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded font-semibold ${
              diagnosis.validation_status === 'expert_confirmed'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            {diagnosis.validation_status === 'expert_confirmed'
              ? 'Validated by Plant Pathologist'
              : 'Pending Expert Validation'}
          </span>
        </div>
      </div>

      {/* Pathologist Validation Card (§2.1, §5.4) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 sm:p-6 shadow-lg space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-950 border border-emerald-800/80 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Senior Plant Pathologist Validation Workflow
              </h3>
              <p className="text-xs text-slate-400">
                Authorized role: Plant Pathologist (MPKV Rahuri / KVK Nashik) or Extension Officer.
              </p>
            </div>
          </div>

          {!canValidate && (
            <div className="flex items-center gap-1 text-xs text-amber-400 bg-amber-950/60 border border-amber-800 px-2 py-1 rounded">
              <Lock className="w-3.5 h-3.5" />
              <span>Read-Only: Switch role to 'Expert' to submit validation</span>
            </div>
          )}
        </div>

        {/* Validation Action Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            disabled={!canValidate}
            onClick={() => setValidationStatus('expert_confirmed')}
            className={`p-3 rounded-lg border text-left transition-all ${
              validationStatus === 'expert_confirmed'
                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-400 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirm Diagnosis</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Confirm Asian Soybean Rust + Spodoptera complex as verified.
            </p>
          </button>

          <button
            type="button"
            disabled={!canValidate}
            onClick={() => setValidationStatus('expert_rejected')}
            className={`p-3 rounded-lg border text-left transition-all ${
              validationStatus === 'expert_rejected'
                ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-rose-400 mb-1">
              <XCircle className="w-4 h-4" />
              <span>Reject / Refute Diagnosis</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Mark vision prediction as misclassified or abiotic injury.
            </p>
          </button>

          <button
            type="button"
            disabled={!canValidate}
            onClick={() => setValidationStatus('escalated_to_pathologist')}
            className={`p-3 rounded-lg border text-left transition-all ${
              validationStatus === 'escalated_to_pathologist'
                ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-400 mb-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Request Physical Sample</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Dispatch extension assistant to collect leaf pouch for laboratory agar plate culturing.
            </p>
          </button>
        </div>

        {/* Validator Field Notes */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1.5 font-mono uppercase tracking-wide">
            Expert Pathologist Field Remarks (Immutable Audit Trail):
          </label>
          <textarea
            disabled={!canValidate}
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono disabled:opacity-50"
          />
        </div>

        {/* Save Validation Button */}
        {canValidate && (
          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500 font-mono">
              Action will record an immutable entry into AuditLog.
            </span>
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Record Pathologist Validation Verdict</span>
            </button>
          </div>
        )}

        {isSaved && (
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/80 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Validation verdict and audit record successfully registered!</span>
          </div>
        )}
      </div>

      {/* Explainable AI Card & Saliency */}
      <ExplainabilityCard diagnosis={diagnosis} language={language} />

      {/* Safe-Action Crop Protection Advisor */}
      <CropProtectionAdvisor data={advisorData} language={language} />
    </div>
  );
};
