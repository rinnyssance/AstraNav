import React from 'react';
import { 
  Cpu, 
  Flame, 
  Droplets, 
  AlertCircle, 
  ShieldCheck,
  ShieldAlert,
  Wind
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ReferenceLine,
} from 'recharts';
import { BioCoreTelemetry } from '../types';

interface NGMSSpectrometerProps {
  telemetry: BioCoreTelemetry;
}

export const NGMSSpectrometer: React.FC<NGMSSpectrometerProps> = ({ telemetry }) => {
  const { ngms } = telemetry;
  const isToxicDanger = ngms.nh3_ppm > 50 || ngms.h2s_ppm > 50;
  const isToxicWarning = ngms.nh3_ppm > 10 || ngms.h2s_ppm > 10;

  // Mass spectra bar data
  const spectraData = [
    { mz: '16 (CH₄)', intensity: ngms.ch4_ppm * 20, ppm: ngms.ch4_ppm, name: 'Methane', type: 'Volatile' },
    { mz: '17 (NH₃)', intensity: ngms.nh3_ppm * 120, ppm: ngms.nh3_ppm, name: 'Ammonia (Toxin)', type: 'Toxin' },
    { mz: '18 (H₂O)', intensity: ngms.h2o_ppm * 12, ppm: ngms.h2o_ppm, name: 'Water Ice (ISRU)', type: 'Resource' },
    { mz: '28 (CO)', intensity: ngms.co_ppm * 15, ppm: ngms.co_ppm, name: 'Carbon Monoxide', type: 'Volatile' },
    { mz: '34 (H₂S)', intensity: ngms.h2s_ppm * 130, ppm: ngms.h2s_ppm, name: 'Hydrogen Sulfide (Toxin)', type: 'Toxin' },
    { mz: '44 (CO₂)', intensity: ngms.co2_ppm * 10, ppm: ngms.co2_ppm, name: 'Carbon Dioxide', type: 'Volatile' },
    { mz: '64 (SO₂)', intensity: ngms.so2_ppm * 80, ppm: ngms.so2_ppm, name: 'Sulfur Dioxide', type: 'Toxin' },
  ];

  const getPeakColor = (type: string, ppm: number, name: string) => {
    if (name.includes('Ammonia') || name.includes('Hydrogen Sulfide')) {
      if (ppm > 50) return '#EF4444';
      if (ppm > 10) return '#F59E0B';
      return '#006BB3';
    }
    if (type === 'Resource') return '#10B981';
    if (type === 'Toxin') return '#EF4444';
    return '#71717a';
  };

  return (
    <div className="bg-[#0A0A0A] rounded-sm border border-zinc-800 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#005288]/40 border border-[#006BB3]/60 flex items-center justify-center text-sky-300">
            <Cpu className="w-3.5 h-3.5 text-[#006BB3]" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-zinc-400 font-mono tracking-widest uppercase flex items-center gap-2">
              NGMS Mass Spectrometer (Volatiles &amp; Toxins)
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Neutral Gas &amp; Ion Mass Spectrometry • Habitat Pressurization &amp; ECLSS Safety
            </p>
          </div>
        </div>

        {/* Total Water Yield badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-[#050505] border border-zinc-800 text-[10px] font-mono text-[#10B981]">
          <Droplets className="w-3 h-3 text-[#10B981]" />
          <span>H₂O: <strong className="text-white font-bold">{ngms.h2o_ppm} ppm</strong></span>
        </div>
      </div>

      {/* Toxicity Warning Alert */}
      <div className="my-2.5">
        {isToxicDanger ? (
          <div className="p-2.5 rounded-sm bg-[#050505] border border-rose-600 flex items-start gap-2.5 animate-pulse">
            <ShieldAlert className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <div className="font-bold text-[#EF4444] uppercase tracking-wide text-[11px]">
                LETHAL CONTAMINANT SPIKE DETECTED (&gt;50 PPM)
              </div>
              <div className="text-zinc-300 font-sans text-[11px] mt-0.5">
                NH₃: <strong className="text-white">{ngms.nh3_ppm} ppm</strong>, H₂S: <strong className="text-white">{ngms.h2s_ppm} ppm</strong>. Immediate EVA abort. High risk of habitat airlock poisoning upon crew ingress.
              </div>
            </div>
          </div>
        ) : isToxicWarning ? (
          <div className="p-2.5 rounded-sm bg-[#050505] border border-amber-600/70 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            <div className="text-xs font-mono">
              <div className="font-bold text-[#F59E0B] uppercase tracking-wide text-[11px]">
                HABITAT PRESSURIZATION TOXICITY HAZARD (&gt;10 PPM)
              </div>
              <div className="text-zinc-300 font-sans text-[11px] mt-0.5">
                Ammonia ({ngms.nh3_ppm} ppm) or H₂S ({ngms.h2s_ppm} ppm) exceeds safe cabin carry-over limit. Post-EVA vacuum bake-out required before suit hatch opening.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-2 rounded-sm bg-[#050505] border border-emerald-800/60 flex items-center gap-2 text-xs font-mono text-[#10B981]">
            <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
            <span className="text-[11px]">Volatile species within safe biological limits (NH₃ &lt; 10 ppm, H₂S &lt; 10 ppm).</span>
          </div>
        )}
      </div>

      {/* Grid: Chemical Breakdown + Mass Spectra Chart */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 flex-1 min-h-[220px]">
        {/* Volatile Chemical Readout Cards */}
        <div className="md:col-span-4 bg-[#050505] rounded-sm p-2.5 border border-zinc-800 flex flex-col justify-between">
          <div className="text-[10px] font-mono text-zinc-500 border-b border-zinc-800 pb-1 mb-1 flex items-center justify-between uppercase">
            <span>VOLATILE SPECIES</span>
            <span>CONCENTRATION</span>
          </div>

          <div className="space-y-1 text-xs font-mono my-1">
            {/* Water */}
            <div className="flex items-center justify-between p-1.5 rounded-sm bg-emerald-950/20 border border-emerald-800/40">
              <span className="flex items-center gap-1 text-[#10B981] text-[11px]">
                <Droplets className="w-3 h-3 text-[#10B981]" /> H₂O (Water Ice)
              </span>
              <span className="font-bold text-white text-[11px]">{ngms.h2o_ppm} ppm</span>
            </div>

            {/* Ammonia */}
            <div className={`flex items-center justify-between p-1.5 rounded-sm border ${
              ngms.nh3_ppm > 50
                ? 'bg-rose-950/40 border-rose-600 text-[#EF4444] font-bold'
                : ngms.nh3_ppm > 10
                ? 'bg-amber-950/30 border-amber-600/70 text-[#F59E0B]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}>
              <span className="flex items-center gap-1 text-[11px]">
                <Flame className="w-3 h-3 text-[#EF4444]" /> NH₃ (Ammonia)
              </span>
              <span className="text-[11px]">{ngms.nh3_ppm.toFixed(1)} ppm</span>
            </div>

            {/* Hydrogen Sulfide */}
            <div className={`flex items-center justify-between p-1.5 rounded-sm border ${
              ngms.h2s_ppm > 50
                ? 'bg-rose-950/40 border-rose-600 text-[#EF4444] font-bold'
                : ngms.h2s_ppm > 10
                ? 'bg-amber-950/30 border-amber-600/70 text-[#F59E0B]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-300'
            }`}>
              <span className="flex items-center gap-1 text-[11px]">
                <Wind className="w-3 h-3 text-[#F59E0B]" /> H₂S (Hyd. Sulfide)
              </span>
              <span className="text-[11px]">{ngms.h2s_ppm.toFixed(1)} ppm</span>
            </div>

            {/* Carbon Dioxide */}
            <div className="flex items-center justify-between p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px]">
              <span>CO₂ (Carbon Dioxide)</span>
              <span>{ngms.co2_ppm} ppm</span>
            </div>

            {/* CO & CH4 */}
            <div className="flex items-center justify-between p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-zinc-400 text-[10px]">
              <span>CO: {ngms.co_ppm} ppm</span>
              <span>CH₄: {ngms.ch4_ppm.toFixed(1)} ppm</span>
            </div>
          </div>

          <div className="pt-1.5 border-t border-zinc-900 text-[9px] font-mono text-zinc-500 flex justify-between uppercase">
            <span>ION SOURCE: 70 eV EI</span>
            <span>SCAN RATE: 10 Hz</span>
          </div>
        </div>

        {/* Mass Spectra Chart */}
        <div className="md:col-span-8 bg-[#050505] rounded-sm p-2.5 border border-zinc-800 flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 mb-1 uppercase">
            <span className="text-zinc-300 font-semibold">MASS / CHARGE (m/z) ION INTENSITY SPECTRUM</span>
            <span>CPS INTENSITY</span>
          </div>

          <div className="flex-1 w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spectraData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="mz" stroke="#71717a" fontSize={10} tickLine={false} />
                <YAxis stroke="#71717a" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#050505',
                    borderColor: '#3f3f46',
                    borderRadius: '2px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: '#e4e4e7',
                  }}
                  formatter={(val: any, name: string, item: any) => [
                    `${item.payload.ppm} ppm (Ion CPS: ${val})`,
                    `${item.payload.name}`,
                  ]}
                />
                <Bar dataKey="intensity" radius={[2, 2, 0, 0]}>
                  {spectraData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={getPeakColor(entry.type, entry.ppm, entry.name)} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-4 text-[9px] font-mono text-zinc-500 pt-1 uppercase">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#10B981] rounded-sm inline-block" /> H₂O Resource
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-[#EF4444] rounded-sm inline-block" /> Toxic Species (&gt;10/50ppm)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-zinc-500 rounded-sm inline-block" /> Other Volatiles
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
