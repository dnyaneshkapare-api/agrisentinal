import React, { useState } from 'react';
import { DigitalTwinTimelineEvent, LanguageCode, RiskBand } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import { GitCommit, Calendar, Activity, ChevronDown, ChevronUp } from 'lucide-react';

interface DigitalTwinTimelineProps {
  events: DigitalTwinTimelineEvent[];
  language: LanguageCode;
}

export const DigitalTwinTimeline: React.FC<DigitalTwinTimelineProps> = ({ events, language }) => {
  const t = TRANSLATIONS[language];
  const [expandedOffset, setExpandedOffset] = useState<number | null>(0); // Default expand Day 0

  const getSeverityStyle = (severity: RiskBand) => {
    switch (severity) {
      case 'Critical':
        return 'border-rose-500/60 bg-rose-950/30 text-rose-300';
      case 'Warning':
        return 'border-amber-500/60 bg-amber-950/30 text-amber-300';
      case 'Watch':
        return 'border-yellow-500/60 bg-yellow-950/30 text-yellow-300';
      case 'Monitor':
      default:
        return 'border-emerald-500/60 bg-emerald-950/30 text-emerald-300';
    }
  };

  const getBadgeColor = (severity: RiskBand) => {
    switch (severity) {
      case 'Critical':
        return 'bg-rose-500 text-white';
      case 'Warning':
        return 'bg-amber-500 text-slate-950';
      case 'Watch':
        return 'bg-yellow-500 text-slate-950';
      case 'Monitor':
      default:
        return 'bg-emerald-500 text-white';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">{t.digitalTwinTitle}</h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">Plot: Dindori Gat No. 142 (Soybean)</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="relative border-l-2 border-slate-800 ml-3 sm:ml-4 pl-4 sm:pl-6 space-y-6">
          {events.map((event) => {
            const isExpanded = expandedOffset === event.day_offset;

            return (
              <div key={event.day_offset} className="relative group">
                {/* Timeline node pip */}
                <div
                  className={`absolute -left-[27px] sm:-left-[35px] top-1.5 w-5 h-5 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold font-mono ${getBadgeColor(
                    event.severity
                  )} shadow-sm`}
                >
                  {event.day_offset === 0 ? '0' : Math.abs(event.day_offset)}
                </div>

                <div
                  onClick={() => setExpandedOffset(isExpanded ? null : event.day_offset)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isExpanded
                      ? getSeverityStyle(event.severity)
                      : 'border-slate-800 bg-slate-950/60 hover:bg-slate-850'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[11px] font-mono font-bold text-white uppercase tracking-wider">
                          Day {event.day_offset > 0 ? `+${event.day_offset}` : event.day_offset}
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          <span>{event.date}</span>
                        </span>
                        <span className="text-slate-600">·</span>
                        <span className="text-[11px] font-mono text-slate-400">{event.actor}</span>
                      </div>

                      <h4 className="text-sm font-semibold text-white tracking-tight">
                        {event.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${getBadgeColor(
                          event.severity
                        )}`}
                      >
                        {event.severity}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {event.description}
                  </p>

                  {/* Expanded Telemetry metrics */}
                  {isExpanded && event.metrics && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {event.metrics.map((m, i) => (
                        <div key={i} className="p-2 rounded bg-slate-900/90 border border-slate-800/60">
                          <span className="text-[10px] text-slate-400 block font-medium">
                            {m.label}
                          </span>
                          <span className="text-xs font-mono font-bold text-white tabular-nums">
                            {m.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
