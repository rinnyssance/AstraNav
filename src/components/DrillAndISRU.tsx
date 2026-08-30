import React, { useState } from 'react';
import { 
  Zap, 
  Droplets, 
  Users, 
  Cog, 
  Gauge, 
  ShieldAlert, 
  CheckCircle2, 
  Bot, 
  HandMetal 
} from 'lucide-react';
import { BioCoreTelemetry } from '../types';

interface DrillAndISRUProps {
  telemetry: BioCoreTelemetry;
}

export const DrillAndISRU: React.FC<DrillAndISRUProps> = ({ telemetry }) => {
  const { drill, ngms, computed } = telemetry;
  const [crewSize, setCrewSize] = useState<2 | 4>(2);

  // Dynamic calculation for crew consumption days
  // Standard 350 kg payload hopper extracted
  const extractedWaterLiters = (350 * (ngms.h2o_ppm / 1000000));
  const dailyCrewConsumptionL = crewSize * 2.5; // 2.5L/day per astronaut
  const dynamicConsumptionDays = Number((extractedWaterLiters / dailyCrewConsumptionL).toFixed(1));

  const isHighResistance = drill.resistance_n > 400;
  const isOverheating = drill.bit_temp_k > 200;

  return (
    <div className="bg-[#0A0A0A] rounded-sm border border-zinc-800 p-4 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#005288]/40 border border-[#006BB3]/60 flex items-center justify-center text-sky-300">
            <Zap className="w-3.5 h-3.5 text-[#006BB3]" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-zinc-400 font-mono tracking-widest uppercase flex items-center gap-2">
              Drill Subsystem &amp; ISRU Yield Engine
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Mechanical Core Extraction • Net Water Yield &amp; Crew Autonomy Days
            </p>
          </div>
        </div>

        {/* Drill State Badge */}
        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border ${
          drill.state === 'CORE_EXTRACTION'
            ? 'bg-emerald-950/60 text-[#10B981] border-[#10B981]/50'
            : drill.state === 'DRILLING'
            ? 'bg-[#005288]/40 text-sky-300 border-[#006BB3] animate-pulse'
            : drill.state === 'ABORTED'
            ? 'bg-rose-950/60 text-[#EF4444] border-[#EF4444]/60'
            : 'bg-zinc-900 text-zinc-400 border-zinc-800'
        }`}>
          STATE: {drill.state}
        </span>
      </div>

      {/* Main Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-2.5">
        {/* Metric 1: Resistance */}
        <div className={`p-2.5 rounded-sm border ${
          isHighResistance ? 'bg-[#050505] border-amber-600/60' : 'bg-[#050505] border-zinc-800'
        }`}>
          <div className="text-[9px] font-mono text-zinc-500 flex items-center justify-between uppercase">
            <span>RESISTANCE</span>
            <Cog className="w-3 h-3 text-zinc-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">
            {drill.resistance_n} <span className="text-[10px] text-zinc-500 font-normal">N</span>
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5 uppercase">
            {drill.resistance_n > 500 ? 'Hard Permafrost' : drill.resistance_n > 250 ? 'Medium Matrix' : 'Loose Regolith'}
          </div>
        </div>

        {/* Metric 2: Bit Temperature */}
        <div className={`p-2.5 rounded-sm border ${
          isOverheating ? 'bg-[#050505] border-rose-600/60' : 'bg-[#050505] border-zinc-800'
        }`}>
          <div className="text-[9px] font-mono text-zinc-500 flex items-center justify-between uppercase">
            <span>BIT TEMP</span>
            <Gauge className="w-3 h-3 text-zinc-400" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">
            {drill.bit_temp_k} <span className="text-[10px] text-zinc-500 font-normal">K</span>
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5 uppercase">
            Depth: {drill.drill_depth_cm} cm
          </div>
        </div>

        {/* Metric 3: Net ISRU Yield Index */}
        <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
          <div className="text-[9px] font-mono text-zinc-500 flex items-center justify-between uppercase">
            <span>NET ISRU YIELD</span>
            <Droplets className="w-3 h-3 text-[#10B981]" />
          </div>
          <div className="text-base font-bold font-mono text-[#10B981] mt-1">
            {computed.net_isru_yield_index} <span className="text-[10px] text-emerald-400 font-normal">idx</span>
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5 uppercase">
            H₂O - (N × DepthFactor)
          </div>
        </div>

        {/* Metric 4: Energy Ratio */}
        <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
          <div className="text-[9px] font-mono text-zinc-500 flex items-center justify-between uppercase">
            <span>ENERGY / YIELD</span>
            <Zap className="w-3 h-3 text-[#006BB3]" />
          </div>
          <div className="text-base font-bold font-mono text-white mt-1">
            {drill.drill_energy_to_yield_ratio} <span className="text-[10px] text-zinc-500 font-normal">J/g</span>
          </div>
          <div className="text-[9px] font-mono text-zinc-500 mt-0.5 uppercase">
            Total: {(drill.energy_joules / 1000).toFixed(1)} kJ
          </div>
        </div>
      </div>

      {/* ISRU Autonomy & Extraction Recommendation Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1">
        {/* Human Consumption Days Calculator */}
        <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5 mb-2">
              <span className="text-[11px] font-bold font-mono text-zinc-300 flex items-center gap-1.5 uppercase">
                <Users className="w-3.5 h-3.5 text-[#006BB3]" />
                CREW WATER AUTONOMY YIELD
              </span>
              {/* Crew toggle */}
              <div className="flex items-center gap-1 bg-[#050505] p-0.5 rounded-sm border border-zinc-800 text-[9px] font-mono">
                <button
                  onClick={() => setCrewSize(2)}
                  className={`px-1.5 py-0.5 rounded-sm ${
                    crewSize === 2 ? 'bg-[#005288] text-white font-bold border border-[#006BB3]' : 'text-zinc-500'
                  }`}
                >
                  2 CREW
                </button>
                <button
                  onClick={() => setCrewSize(4)}
                  className={`px-1.5 py-0.5 rounded-sm ${
                    crewSize === 4 ? 'bg-[#005288] text-white font-bold border border-[#006BB3]' : 'text-zinc-500'
                  }`}
                >
                  4 CREW
                </button>
              </div>
            </div>

            <div className="flex items-baseline gap-2 my-1">
              <span className="text-2xl font-bold font-mono text-[#10B981]">
                {dynamicConsumptionDays}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wide">
                DAYS OF LIFE-SUPPORT WATER
              </span>
            </div>

            <p className="text-[10px] text-zinc-400 font-sans mt-1">
              Based on standard 350 kg regolith extraction hopper at {ngms.h2o_ppm} ppm H₂O ({extractedWaterLiters.toFixed(1)} Litres net water extracted @ {dailyCrewConsumptionL} L/day crew baseline).
            </p>
          </div>

          <div className="mt-2 pt-1.5 border-t border-zinc-900 text-[9px] font-mono text-zinc-500 flex justify-between uppercase">
            <span>NASA STANDARD: 2.5 L/day/astronaut</span>
            <span>ECLSS RECOVERY: 98%</span>
          </div>
        </div>

        {/* Mining Feasibility & Operational Mode */}
        <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800 flex flex-col justify-between">
          <div>
            <div className="text-[11px] font-bold font-mono text-zinc-300 border-b border-zinc-800 pb-1.5 mb-2 flex items-center justify-between uppercase">
              <span>MINING FEASIBILITY DIRECTIVE</span>
              {computed.extraction_recommendation === 'MANUAL_CREW_FEASIBLE' ? (
                <span className="flex items-center gap-1 text-[#10B981] text-[9px]">
                  <HandMetal className="w-3 h-3" /> CREW MANUAL
                </span>
              ) : computed.extraction_recommendation === 'ROBOTIC_ONLY' ? (
                <span className="flex items-center gap-1 text-sky-400 text-[9px]">
                  <Bot className="w-3 h-3" /> ROBOTIC PRE-EXTRACTION
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[#EF4444] text-[9px]">
                  <ShieldAlert className="w-3 h-3" /> UNVIABLE
                </span>
              )}
            </div>

            <div className="space-y-1 text-xs font-mono">
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Method:</span>
                <span className="font-semibold text-zinc-200">
                  {computed.extraction_recommendation === 'MANUAL_CREW_FEASIBLE'
                    ? 'Astronaut Manual Coring'
                    : computed.extraction_recommendation === 'ROBOTIC_ONLY'
                    ? 'Robotic Heavy Excavator'
                    : 'Extraction Deprioritized'}
                </span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Torque Load:</span>
                <span className="text-zinc-200">{drill.torque_nm.toFixed(1)} N·m</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                <span>Penetration:</span>
                <span className="text-zinc-200">{drill.penetration_rate_mm_s.toFixed(1)} mm/s</span>
              </div>
            </div>
          </div>

          <div className="mt-2 p-1.5 rounded-sm bg-zinc-900 border border-zinc-800 text-[10px] font-sans text-zinc-300 line-clamp-2">
            {computed.extraction_recommendation === 'MANUAL_CREW_FEASIBLE'
              ? 'Low mechanical resistance allows astronauts to collect high-yield ice samples without exceeding suit metabolic limits.'
              : computed.extraction_recommendation === 'ROBOTIC_ONLY'
              ? 'High mechanical resistance requires robotic auger pre-trenching before Artemis astronauts arrive.'
              : 'Ice concentration is too diffuse relative to drill energy expenditure.'}
          </div>
        </div>
      </div>
    </div>
  );
};
