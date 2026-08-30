import React from 'react';
import { 
  Activity, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Radio,
  Gauge
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { BioCoreTelemetry } from '../types';

interface GPRVisualizerProps {
  telemetry: BioCoreTelemetry;
}

export const GPRVisualizer: React.FC<GPRVisualizerProps> = ({ telemetry }) => {
  const { gpr } = telemetry;
  const isVoid = gpr.void_detected;

  // Chart data from layers
  const chartData = gpr.layers.map((layer) => ({
    depth: layer.depth_m,
    dielectric: layer.dielectric,
    reflectivity: layer.radar_reflectivity_db,
    layer_type: layer.layer_type,
  }));

  const getLayerColor = (type: string) => {
    switch (type) {
      case 'High-Purity Ice':
        return 'bg-[#005288]/30 border-[#006BB3]/60 text-sky-200';
      case 'Ice-Regolith Matrix':
        return 'bg-zinc-900 border-zinc-700 text-zinc-200';
      case 'Cavity/Void':
        return 'bg-rose-950/40 border-rose-600 text-rose-300 animate-pulse';
      case 'Basement Rock':
        return 'bg-[#050505] border-zinc-800 text-zinc-400';
      default:
        return 'bg-amber-950/30 border-amber-800/40 text-amber-300';
    }
  };

  return (
    <div className="bg-[#0A0A0A] rounded-sm border border-zinc-800 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#005288]/40 border border-[#006BB3]/60 flex items-center justify-center text-sky-300">
            <Radio className="w-3.5 h-3.5 text-[#006BB3]" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-zinc-400 font-mono tracking-widest uppercase flex items-center gap-2">
              GPR Subsurface Radar Stratigraphy
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Ground Penetrating Radar • Subsurface Voids &amp; Geotechnical Stability (0 - 5.0m)
            </p>
          </div>
        </div>

        {/* Dielectric Gauge Badge */}
        <div className="flex items-center gap-2 px-2.5 py-0.5 rounded-sm bg-[#050505] border border-zinc-800 text-[10px] font-mono">
          <span className="text-zinc-500 uppercase">BULK ε:</span>
          <span className="text-white font-bold">{gpr.dielectric_constant.toFixed(2)}</span>
        </div>
      </div>

      {/* Hazard Banner */}
      <div className="my-2.5">
        {isVoid ? (
          <div className="p-2.5 rounded-sm bg-[#050505] border border-rose-600/80 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5 animate-bounce" />
            <div className="text-xs font-mono">
              <div className="font-bold text-[#EF4444] uppercase tracking-wide text-[11px]">
                CRITICAL RADAR VOID DETECTED (COLLAPSE HAZARD)
              </div>
              <div className="text-zinc-300 font-sans text-[11px] mt-0.5">
                Acoustic cavity at depth <strong className="text-white">{gpr.void_depth_m?.toFixed(1)}m</strong> (est. volume {gpr.void_volume_m3?.toFixed(1)} m³). High probability of structural breakthrough under pressurized crewed rover (1.8t).
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-sm bg-[#050505] border border-emerald-800/60 flex items-center gap-2 text-xs font-mono text-[#10B981]">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="text-[11px]">Regolith column consolidated. No shallow acoustic cavities detected in 5.0m radar beam.</span>
          </div>
        )}
      </div>

      {/* Grid: 2D Cross Section Layer Stack + Dielectric Curve Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 flex-1 min-h-[220px]">
        {/* Visual Stratigraphic Column (0m to 5m) */}
        <div className="md:col-span-5 flex flex-col justify-between bg-[#050505] rounded-sm p-2.5 border border-zinc-800">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 border-b border-zinc-800 pb-1 mb-1 uppercase">
            <span>STRATIGRAPHIC LAYERS</span>
            <span>DEPTH (m)</span>
          </div>

          <div className="flex flex-col gap-1.5 flex-1 justify-around my-1">
            {gpr.layers.map((layer, idx) => (
              <div
                key={idx}
                className={`p-1.5 rounded-sm border flex items-center justify-between text-xs font-mono transition-all ${getLayerColor(
                  layer.layer_type
                )}`}
              >
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Layers className="w-3.5 h-3.5 opacity-70" />
                  <span className="font-semibold">{layer.layer_type}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="text-zinc-400">ε: {layer.dielectric.toFixed(1)}</span>
                  <span className="font-bold text-white">{layer.depth_m}m</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-zinc-900 flex items-center justify-between text-[9px] font-mono text-zinc-500 uppercase">
            <span>BEARING CAP: {isVoid ? '4.2 kN (UNSAFE)' : '28.5 kN (SAFE)'}</span>
            <span>RADAR FREQ: 500 MHz</span>
          </div>
        </div>

        {/* Recharts Dielectric & Radar Reflectivity Chart */}
        <div className="md:col-span-7 bg-[#050505] rounded-sm p-2.5 border border-zinc-800 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1 uppercase">
            <span className="text-zinc-300 font-semibold">DIELECTRIC CONSTANT (ε) &amp; REFLECTIVITY (dB)</span>
            <span>DEPTH PROFILE</span>
          </div>

          <div className="flex-1 w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 15, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis 
                  dataKey="depth" 
                  unit="m" 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false}
                />
                <YAxis 
                  stroke="#71717a" 
                  fontSize={10} 
                  tickLine={false}
                  domain={[0, 6]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050505',
                    borderColor: '#3f3f46',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#e4e4e7',
                  }}
                  formatter={(val: any, name: string) => [
                    `${val} ${name === 'dielectric' ? 'ε' : 'dB'}`,
                    name === 'dielectric' ? 'Dielectric Const' : 'Reflectivity',
                  ]}
                  labelFormatter={(label) => `Depth: ${label} meters`}
                />
                {isVoid && gpr.void_depth_m && (
                  <ReferenceLine 
                    x={gpr.void_depth_m} 
                    stroke="#EF4444" 
                    strokeDasharray="4 2" 
                    label={{ value: 'VOID CAVITY', fill: '#EF4444', fontSize: 10, position: 'insideTopLeft' }} 
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="dielectric"
                  stroke="#006BB3"
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#006BB3' }}
                  name="dielectric"
                />
                <Line
                  type="monotone"
                  dataKey="reflectivity"
                  stroke="#a1a1aa"
                  strokeWidth={1.5}
                  strokeDasharray="3 3"
                  dot={{ r: 2.5, fill: '#a1a1aa' }}
                  name="reflectivity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-zinc-500 pt-1 uppercase">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-[#006BB3] inline-block" /> Dielectric ε (Pure Ice ~3.15, Regolith ~2.8)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-0.5 bg-zinc-400 inline-block border-t border-dashed" /> Reflectivity (dB)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
