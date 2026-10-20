import React, { useState } from 'react';
import { SpatialHotspotNode, OutbreakExposureEdge, RiskBand, LanguageCode } from '../types/agri';
import { TRANSLATIONS } from '../data/translations';
import { Map, Share2, Wind, Droplets, ShieldAlert, ArrowUpRight } from 'lucide-react';

interface SpatialHotspotMapProps {
  nodes: SpatialHotspotNode[];
  edges: OutbreakExposureEdge[];
  selectedNodeId: string;
  onSelectNode: (nodeId: string) => void;
  language: LanguageCode;
  onOpenCase: (caseId: string) => void;
}

export const SpatialHotspotMap: React.FC<SpatialHotspotMapProps> = ({
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  language,
  onOpenCase,
}) => {
  const t = TRANSLATIONS[language];
  const [viewMode, setViewMode] = useState<'map' | 'graph'>('map');

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  const getRiskColor = (band: RiskBand) => {
    switch (band) {
      case 'Critical':
        return { bg: 'bg-rose-500', text: 'text-rose-400', stroke: '#f43f5e', fill: '#881337' };
      case 'Warning':
        return { bg: 'bg-amber-500', text: 'text-amber-400', stroke: '#f59e0b', fill: '#78350f' };
      case 'Watch':
        return { bg: 'bg-yellow-500', text: 'text-yellow-400', stroke: '#eab308', fill: '#713f12' };
      case 'Monitor':
      default:
        return { bg: 'bg-emerald-500', text: 'text-emerald-400', stroke: '#10b981', fill: '#064e3b' };
    }
  };

  // Coordinates normalized to 800x420 SVG canvas
  // Lat range: 19.80 to 20.25 -> Y inverted
  // Lng range: 73.80 to 74.00 -> X
  const minLat = 19.82;
  const maxLat = 20.24;
  const minLng = 73.80;
  const maxLng = 74.00;

  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng)) * 680 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 320 + 50;
    return { x, y };
  };

  // Node positions for Graph Mode (clustered representation)
  const graphPositions: Record<string, { x: number; y: number }> = {
    'node-1': { x: 300, y: 150 }, // Focal case (Khedgaon)
    'node-2': { x: 500, y: 160 }, // Pimpalgaon Baswant
    'node-3': { x: 560, y: 280 }, // Saikheda
    'node-4': { x: 220, y: 90 },  // Palsan (Tomato)
    'node-5': { x: 620, y: 340 }, // Sinnar (Cotton)
    'node-6': { x: 260, y: 240 }, // Khedgaon West (Healthy)
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top Header Bar */}
      <div className="px-4 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/80">
        <div className="flex items-center gap-2">
          <Map className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-semibold text-white">
            {viewMode === 'map' ? t.tabs.mapView : t.tabs.graphView}
          </h3>
          <span className="text-slate-600">·</span>
          <span className="text-xs text-slate-400 font-mono">Nashik District, Maharashtra</span>
        </div>

        {/* View Mode Segmented Switcher */}
        <div className="flex items-center gap-1 bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'map'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{t.tabs.mapView}</span>
          </button>
          <button
            onClick={() => setViewMode('graph')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              viewMode === 'graph'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{t.tabs.graphView}</span>
          </button>
        </div>
      </div>

      {/* SVG Canvas Map / Graph */}
      <div className="relative w-full h-[380px] bg-slate-950 overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <svg className="w-full h-full" viewBox="0 0 800 420">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="clusterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Topographic water contour (Godavari River basin simulation) */}
          <path
            d="M 50 180 Q 250 210 420 190 T 780 260"
            fill="none"
            stroke="#0369a1"
            strokeWidth="3"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <text x="700" y="250" fill="#0284c7" fontSize="10" fontFamily="sans-serif" opacity="0.6">
            Godavari River Basin
          </text>

          {/* Wind Vector Overlay */}
          <g opacity="0.7">
            <line x1="80" y1="60" x2="160" y2="75" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" />
            <polygon points="160,75 148,70 152,78" fill="#38bdf8" />
            <text x="80" y="52" fill="#7dd3fc" fontSize="10" fontFamily="sans-serif">
              Wind: WSW 14 km/h (Spore Corridor)
            </text>
          </g>

          {/* Cluster Epidemic Envelope (Niphad-Dindori Corridor) */}
          <ellipse
            cx="400"
            cy="190"
            rx="180"
            ry="90"
            fill="url(#clusterGlow)"
            stroke="#f59e0b"
            strokeWidth="1"
            strokeDasharray="5 5"
            opacity="0.8"
          />
          <text x="340" y="105" fill="#f59e0b" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
            Cluster: Dindori-Niphad Rust Corridor (7.4 km)
          </text>

          {/* Edges / Exposure Vectors */}
          {edges.map(edge => {
            const srcNode = nodes.find(n => n.plot_id === edge.source_plot_id);
            const tgtNode = nodes.find(n => n.plot_id === edge.target_plot_id);
            if (!srcNode || !tgtNode) return null;

            const p1 = viewMode === 'map'
              ? projectCoords(srcNode.coordinates.lat, srcNode.coordinates.lng)
              : graphPositions[srcNode.id];
            const p2 = viewMode === 'map'
              ? projectCoords(tgtNode.coordinates.lat, tgtNode.coordinates.lng)
              : graphPositions[tgtNode.id];

            const strokeColor = edge.exposure_vector === 'wind_corridor'
              ? '#f59e0b'
              : edge.exposure_vector === 'irrigation_drainage'
              ? '#0284c7'
              : '#64748b';

            return (
              <g key={edge.id}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={strokeColor}
                  strokeWidth={edge.exposure_weight * 2.5}
                  strokeDasharray={edge.exposure_vector === 'wind_corridor' ? '4 3' : undefined}
                  opacity="0.75"
                />
                <circle
                  cx={(p1.x + p2.x) / 2}
                  cy={(p1.y + p2.y) / 2}
                  r="3"
                  fill={strokeColor}
                />
              </g>
            );
          })}

          {/* Nodes (Plots / Villages) */}
          {nodes.map(node => {
            const pos = viewMode === 'map'
              ? projectCoords(node.coordinates.lat, node.coordinates.lng)
              : graphPositions[node.id];
            const isSelected = node.id === selectedNodeId;
            const colors = getRiskColor(node.risk_band);

            return (
              <g
                key={node.id}
                onClick={() => onSelectNode(node.id)}
                className="cursor-pointer transition-transform hover:scale-110"
              >
                {/* Pulse halo if selected or critical */}
                {(isSelected || node.risk_band === 'Critical' || node.risk_band === 'Warning') && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isSelected ? '24' : '18'}
                    fill={colors.fill}
                    opacity={isSelected ? '0.4' : '0.2'}
                    className={node.risk_band === 'Critical' ? 'animate-ping' : ''}
                  />
                )}

                {/* Node Outer Ring */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? '14' : '11'}
                  fill="#0f172a"
                  stroke={colors.stroke}
                  strokeWidth={isSelected ? '3' : '2'}
                />

                {/* Node Center Dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={isSelected ? '6' : '4.5'}
                  fill={colors.stroke}
                />

                {/* Label */}
                <text
                  x={pos.x}
                  y={pos.y + 24}
                  textAnchor="middle"
                  fill="#f1f5f9"
                  fontSize="11"
                  fontWeight={isSelected ? '700' : '500'}
                  fontFamily="sans-serif"
                >
                  {node.village}
                </text>
                <text
                  x={pos.x}
                  y={pos.y + 36}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="9.5"
                  fontFamily="sans-serif"
                >
                  {node.crop.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay */}
        <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-sm shadow-md text-xs">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            {language === 'mr' ? 'धोका पातळी' : 'Risk Bands'}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
              <span>{t.riskLevels.Monitor}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 shrink-0" />
              <span>{t.riskLevels.Watch}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
              <span>{t.riskLevels.Warning}</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0" />
              <span>{t.riskLevels.Critical}</span>
            </span>
          </div>
        </div>

        {/* Exposure Vector Legend */}
        <div className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-sm shadow-md text-xs hidden sm:block">
          <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Exposure Vectors
          </div>
          <div className="space-y-1 text-[11px] text-slate-300">
            <div className="flex items-center gap-1.5">
              <Wind className="w-3.5 h-3.5 text-amber-400" />
              <span>Wind Corridor (Spore drift)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-sky-400" />
              <span>Irrigation Canal Drainage</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Node Drawer / Inspector */}
      {selectedNode && (
        <div className="px-4 py-3 bg-slate-800/80 border-t border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-white shrink-0 mt-0.5 ${
                getRiskColor(selectedNode.risk_band).bg
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-white">
                  {selectedNode.village} ({selectedNode.taluka} Taluka)
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-xs text-slate-300">{selectedNode.farmer_name}</span>
                <span className="text-slate-500">·</span>
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded ${
                    selectedNode.risk_band === 'Critical'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : selectedNode.risk_band === 'Warning'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-slate-700 text-slate-300'
                  }`}
                >
                  {selectedNode.risk_band}
                </span>
              </div>

              <div className="text-xs text-slate-300 mt-0.5">
                <span className="text-slate-400">Suspected Stress: </span>
                <span className="font-medium text-white">{selectedNode.active_issue}</span>
                <span className="text-slate-500 ml-2 font-mono tabular-nums">
                  (Raw Prob: {(selectedNode.raw_probability * 100).toFixed(0)}% · Priority:{' '}
                  {selectedNode.priority_score.toFixed(1)})
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onOpenCase('case-184')}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 shrink-0 self-start sm:self-center"
          >
            <span>{language === 'mr' ? 'तपशील व प्रमाणीकरण' : 'Inspect Case Detail'}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
