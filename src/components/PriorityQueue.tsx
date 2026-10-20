import React from 'react';
import { PriorityQueueItem, RiskBand, LanguageCode } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import { ListFilter, ChevronRight, CheckCircle2, AlertCircle } from 'lucide-react';

interface PriorityQueueProps {
  items: PriorityQueueItem[];
  selectedCaseId: string;
  onSelectCase: (caseId: string) => void;
  language: LanguageCode;
  onOpenCase: (caseId: string) => void;
}

export const PriorityQueue: React.FC<PriorityQueueProps> = ({
  items,
  selectedCaseId,
  onSelectCase,
  language,
  onOpenCase,
}) => {
  const t = TRANSLATIONS[language];

  const getRiskBadge = (band: RiskBand) => {
    switch (band) {
      case 'Critical':
        return 'bg-rose-950/80 text-rose-300 border-rose-800';
      case 'Warning':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'Watch':
        return 'bg-yellow-950/80 text-yellow-300 border-yellow-800';
      case 'Monitor':
      default:
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <ListFilter className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">{t.priorityQueueTitle}</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Formula: Impact × Uncertainty × Spread
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950 text-slate-400 font-mono border-b border-slate-800">
            <tr>
              <th className="py-2.5 px-3">Case / Plot</th>
              <th className="py-2.5 px-3">Crop</th>
              <th className="py-2.5 px-3">Suspected Issue</th>
              <th className="py-2.5 px-3">Risk Band</th>
              <th className="py-2.5 px-3 text-right">Raw Prob</th>
              <th className="py-2.5 px-3 text-right">Priority Score</th>
              <th className="py-2.5 px-3">Validation Status</th>
              <th className="py-2.5 px-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {items.map(item => {
              const isSelected = item.case_id === selectedCaseId;

              return (
                <tr
                  key={item.case_id}
                  onClick={() => onSelectCase(item.case_id)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-slate-800/90' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3 px-3">
                    <div className="font-semibold text-white">{item.case_id}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.village} · {item.farmer_name}
                    </div>
                  </td>

                  <td className="py-3 px-3 text-slate-200">{item.crop}</td>

                  <td className="py-3 px-3 font-medium text-slate-200">{item.suspected_issue}</td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-mono border ${getRiskBadge(
                        item.risk_band
                      )}`}
                    >
                      {item.risk_band}
                    </span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono tabular-nums text-slate-300">
                    {(item.raw_probability * 100).toFixed(0)}%
                  </td>

                  <td className="py-3 px-3 text-right">
                    <span className="font-mono font-bold tabular-nums text-amber-400">
                      {item.priority_score.toFixed(1)}
                    </span>
                  </td>

                  <td className="py-3 px-3">
                    {item.validation_status === 'expert_confirmed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirmed</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-medium">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Unvalidated</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCase(item.case_id);
                      }}
                      className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors"
                      title="Inspect case"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
