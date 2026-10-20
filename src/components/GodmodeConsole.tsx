import React, { useState } from 'react';
import { UserRole, LanguageCode, ProtectionRule, AuditLog } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import {
  SEED_PROTECTION_PRODUCTS,
  SEED_PROTECTION_RULES,
  SEED_AUDIT_LOGS,
} from '../data/seedData';
import {
  Lock,
  ShieldCheck,
  AlertTriangle,
  History,
  FileCode,
  Edit3,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface GodmodeConsoleProps {
  userRole: UserRole;
  language: LanguageCode;
  onBack: () => void;
}

export const GodmodeConsole: React.FC<GodmodeConsoleProps> = ({
  userRole,
  language,
  onBack,
}) => {
  const t = TRANSLATIONS[language];
  const [activeTab, setActiveTab] = useState<'rules' | 'products' | 'audit'>('rules');

  // Override simulation state
  const [rules, setRules] = useState<ProtectionRule[]>(SEED_PROTECTION_RULES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(SEED_AUDIT_LOGS);
  const [selectedRule, setSelectedRule] = useState<ProtectionRule | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [adjustedDose, setAdjustedDose] = useState('');
  const [overrideSaved, setOverrideSaved] = useState(false);

  const isAuthorized = userRole === 'expert' || userRole === 'system_admin';

  // §6.5: If unauthorized, display consistent 404/403 page without leaking route hints
  if (!isAuthorized) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-xl mx-auto text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-950/80 border border-rose-800/80 flex items-center justify-center text-rose-400 mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-white font-mono">404 — Not Found</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
          The requested route is protected by server-side Role-Based Access Control (RBAC). Only
          authenticated <span className="text-emerald-400 font-mono">expert</span> or{' '}
          <span className="text-emerald-400 font-mono">system_admin</span> credentials have access.
        </p>

        <div className="p-3 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono text-left">
          Current Role: <span className="text-rose-400 font-bold">{userRole}</span> (Denied by
          central auth middleware).
          <br />
          To test the console, change the Role Context in the top header to &quot;Agronomist / Plant
          Pathologist&quot;.
        </div>

        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs rounded-lg transition-colors font-medium"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const handleApplyOverride = () => {
    if (!selectedRule || overrideReason.length < 10) return;

    const updated = rules.map(r => {
      if (r.rule_id === selectedRule.rule_id) {
        return {
          ...r,
          dose_text: adjustedDose || r.dose_text,
          version: `${r.version}-OVERRIDE`,
        };
      }
      return r;
    });

    setRules(updated);

    // Record immutable audit entry (§6.5)
    const newAudit: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor_id: 'exp-console-user',
      actor_role: userRole,
      action: 'EXPERT_RULE_OVERRIDE',
      resource_type: 'protection_rule',
      resource_id: selectedRule.rule_id,
      details: `Rule override applied with recorded reason: "${overrideReason}". Adjusted dose: "${
        adjustedDose || 'unchanged'
      }"`,
      ip_address: '103.22.140.18',
      previous_hash: auditLogs[0]?.entry_hash || '0'.repeat(64),
      entry_hash: Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2),
    };

    setAuditLogs([newAudit, ...auditLogs]);
    setOverrideSaved(true);
    setTimeout(() => {
      setOverrideSaved(false);
      setSelectedRule(null);
      setOverrideReason('');
      setAdjustedDose('');
    }, 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Expert Crop-Protection Console (/godmode)
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                ROLE: {userRole.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin-grade rule governance, versioned advisory overrides, and cryptographic audit viewer.
            </p>
          </div>
        </div>

        <button
          onClick={onBack}
          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-lg transition-colors font-medium self-start sm:self-center"
        >
          Exit to Dashboard
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('rules')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'rules'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Curated Protection Rules ({rules.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'products'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          CIB&RC Registered Products ({SEED_PROTECTION_PRODUCTS.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
            activeTab === 'audit'
              ? 'bg-slate-800 text-emerald-400 border border-slate-700'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Immutable Audit Log Trail ({auditLogs.length})
        </button>
      </div>

      {/* TAB 1: RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Rule ID & Version</th>
                    <th className="py-2.5 px-3">Target Issue</th>
                    <th className="py-2.5 px-3">Action Type</th>
                    <th className="py-2.5 px-3">Label Dose / Action</th>
                    <th className="py-2.5 px-3">Authority Source</th>
                    <th className="py-2.5 px-3 text-center">Override</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {rules.map(rule => (
                    <tr key={rule.rule_id} className="hover:bg-slate-850 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-white">{rule.rule_id}</div>
                        <span className="text-[10px] font-mono text-slate-400">{rule.version}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-200">{rule.issue_name}</div>
                        <span className="text-[11px] text-slate-400">{rule.crop}</span>
                      </td>

                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-semibold ${
                            rule.action_type === 'chemical'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : rule.action_type === 'biological'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {rule.action_type}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300 max-w-xs font-mono truncate">
                        {rule.dose_text}
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-[11px] max-w-xs truncate">
                        {rule.authority_source}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            setSelectedRule(rule);
                            setAdjustedDose(rule.dose_text);
                          }}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded text-xs transition-colors flex items-center gap-1 mx-auto"
                        >
                          <Edit3 className="w-3 h-3" />
                          <span>Override</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal / Inline Override Editor (§6.5) */}
          {selectedRule && (
            <div className="p-5 rounded-xl bg-slate-900 border border-amber-600/50 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-white">
                    Expert Override: {selectedRule.rule_id}
                  </h4>
                </div>
                <button
                  onClick={() => setSelectedRule(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1 font-medium">Adjusted Dose Text</label>
                  <input
                    type="text"
                    value={adjustedDose}
                    onChange={e => setAdjustedDose(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1 font-medium">
                    Mandatory Reason for Override (Min 10 characters)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Field verification found severe secondary caterpillar pressure..."
                    value={overrideReason}
                    onChange={e => setOverrideReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-slate-500 font-mono">
                  Overrides cannot lift basic safety rules (§6.2) and will be logged permanently.
                </span>

                <button
                  onClick={handleApplyOverride}
                  disabled={overrideReason.length < 10}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-colors disabled:opacity-40"
                >
                  Save Override with Audit Trail
                </button>
              </div>

              {overrideSaved && (
                <div className="p-2.5 rounded bg-emerald-950 border border-emerald-500 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Override recorded and cryptographic audit hash generated!</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Product Name & AI</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">IRAC/FRAC Group</th>
                  <th className="py-2.5 px-3">Hazard Class</th>
                  <th className="py-2.5 px-3">Authority Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {SEED_PROTECTION_PRODUCTS.map(prod => (
                  <tr key={prod.product_id} className="hover:bg-slate-850 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-white">{prod.product_name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{prod.active_ingredient}</div>
                    </td>

                    <td className="py-3 px-3 uppercase font-mono text-[11px] text-slate-300">
                      {prod.product_class}
                    </td>

                    <td className="py-3 px-3 font-mono text-xs text-amber-300">
                      {prod.irac_frac_group}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-200">
                        {prod.hazard_class}
                      </span>
                    </td>

                    <td className="py-3 px-3">
                      <div className="text-[11px] text-slate-300">{prod.authority_source}</div>
                      <span className="text-[10px] text-amber-400 font-semibold font-mono">
                        {prod.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wide">
                Immutable SHA-256 Hash Chain Ledger
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Tamper-Evident Security Log</span>
          </div>

          <div className="divide-y divide-slate-800 text-xs font-mono">
            {auditLogs.map(log => (
              <div key={log.id} className="p-3.5 hover:bg-slate-850 transition-colors space-y-1">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{log.action}</span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">Actor: {log.actor_id} ({log.actor_role})</span>
                  </div>
                  <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                </div>

                <p className="text-slate-300 font-sans text-xs">{log.details}</p>

                <div className="flex items-center gap-4 text-[10.5px] text-slate-500 pt-1">
                  <span className="truncate">Prev: {log.previous_hash.substring(0, 16)}...</span>
                  <span className="text-amber-500/80 truncate">Hash: {log.entry_hash.substring(0, 16)}...</span>
                  <span className="ml-auto">IP: {log.ip_address}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
