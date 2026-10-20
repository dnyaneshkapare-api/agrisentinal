import React from 'react';
import { LanguageCode } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import { Radar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface MetricCardsProps {
  language: LanguageCode;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ language }) => {
  const t = TRANSLATIONS[language];

  const metrics = [
    {
      label: t.activeClusters,
      value: '01',
      unit: 'Corridor',
      detail: 'Niphad-Dindori border (4 linked plots)',
      icon: Radar,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/40 border-amber-800/40',
    },
    {
      label: t.highPriorityCases,
      value: '03',
      unit: 'Cases',
      detail: 'Triage score > 80 (Rapid humidity surge)',
      icon: AlertCircle,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/40 border-rose-800/40',
    },
    {
      label: t.validatedCases,
      value: '02',
      unit: 'Confirmed',
      detail: 'Dr. V. R. Shinde (Senior Pathologist)',
      icon: CheckCircle2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/40 border-emerald-800/40',
    },
    {
      label: t.leadTimeMetric,
      value: '5–7',
      unit: 'Days',
      detail: t.leadTimeSub,
      icon: Clock,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/40 border-sky-800/40',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-xl border bg-slate-900/60 ${m.bgColor} flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">{m.label}</span>
              <Icon className={`w-4 h-4 ${m.color}`} />
            </div>

            <div className="flex items-baseline gap-1.5 my-1">
              <span className="text-2xl sm:text-3xl font-bold text-white font-mono tabular-nums tracking-tight">
                {m.value}
              </span>
              <span className="text-xs text-slate-400 font-medium">{m.unit}</span>
            </div>

            <p className="text-[11px] text-slate-400 line-clamp-1 mt-1">{m.detail}</p>
          </div>
        );
      })}
    </div>
  );
};
