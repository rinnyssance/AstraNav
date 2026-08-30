import React from 'react';
import { 
  Clock, 
  Thermometer, 
  Radiation, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  Zap,
  Activity,
  HeartPulse,
  Wind,
  Gauge,
  Battery,
  Droplets,
  Sun,
  Sparkles
} from 'lucide-react';
import { BioCoreTelemetry } from '../types';

interface BioSafetyOverviewProps {
  telemetry: BioCoreTelemetry;
}

export const BioSafetyOverview: React.FC<BioSafetyOverviewProps> = ({ telemetry }) => {
  const { computed, env, gpr, ngms, suit_consumables } = telemetry;

  const isCryoFatigue = computed.thermal_risk === 'CRITICAL_CRYO_FATIGUE';
  const isToxicityHazard = computed.toxicity_risk !== 'SAFE';
  const isVoidHazard = computed.void_risk !== 'STABLE';
  const isSpeActive = computed.spe_active;
  const isDustHazard = computed.dust_hazard;

  // Format EVA Window
  const evaMinutes = computed.safe_eva_window_minutes;
  const evaHours = Math.floor(evaMinutes / 60);
  const remainingMins = evaMinutes % 60;

  // Suit consumables defaults
  const suit = suit_consumables || {
    o2_remaining_percent: 90,
    o2_pressure_kpa: 29.6,
    co2_scrubber_remaining_hrs: 6.0,
    battery_remaining_percent: 80,
    thermal_coolant_water_kg: 3.5,
    status: 'NOMINAL',
  };

  return (
    <div className="bg-[#0A0A0A] rounded-sm border border-zinc-800 p-4 flex flex-col h-full space-y-3 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#005288]/40 border border-[#006BB3]/60 flex items-center justify-center text-sky-300">
            <HeartPulse className="w-3.5 h-3.5 text-[#006BB3]" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-zinc-400 font-mono tracking-widest uppercase flex items-center gap-2">
              Bioastronautics Safety &amp; Risk Quantization
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Human Biological Envelope • xEMU Consumables • Space Weather &amp; Dust Ingestion
            </p>
          </div>
        </div>

        {/* Master Go/No-Go status pill */}
        <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold border ${
          computed.mission_go_no_go === 'GO'
            ? 'bg-emerald-950/60 text-[#10B981] border-[#10B981]/50'
            : computed.mission_go_no_go === 'CONDITIONAL_GO'
            ? 'bg-amber-950/60 text-[#F59E0B] border-[#F59E0B]/50'
            : 'bg-rose-950/60 text-[#EF4444] border-[#EF4444]/60 animate-pulse'
        }`}>
          {computed.mission_go_no_go}
        </span>
      </div>

      {/* Hero: Safe EVA Window & Suit Walkback Display */}
      <div className="p-3 rounded-sm bg-[#050505] border border-zinc-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-sm border shrink-0 ${
            evaMinutes === 0
              ? 'bg-rose-950/40 border-rose-600 text-[#EF4444]'
              : evaMinutes < 60
              ? 'bg-amber-950/40 border-amber-600 text-[#F59E0B]'
              : 'bg-emerald-950/40 border-emerald-600 text-[#10B981]'
          }`}>
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
              QUANTIZED SAFE EVA DURATION (BOUNDED BY THERMAL, SPE &amp; CONSUMABLES)
            </div>
            <div className="text-xl font-bold font-mono text-white flex items-baseline gap-1.5">
              {evaMinutes === 0 ? (
                <span className="text-[#EF4444]">0 MIN (EVA ABORT / NO-GO)</span>
              ) : (
                <>
                  <span className="text-zinc-100">{evaHours}h {remainingMins}m</span>
                  <span className="text-xs text-zinc-500 font-normal font-mono">({evaMinutes} total mins | Walkback Limit: {computed.walkback_limit_minutes}m)</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Suit Joint Fatigue Gauge */}
        <div className="w-full lg:w-48 flex flex-col gap-1">
          <div className="flex justify-between text-[10px] font-mono text-zinc-400">
            <span>SUIT JOINT FATIGUE:</span>
            <span className={computed.suit_joint_fatigue_index > 70 ? 'text-[#EF4444] font-bold' : 'text-zinc-200'}>
              {computed.suit_joint_fatigue_index}%
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                computed.suit_joint_fatigue_index > 70
                  ? 'bg-[#EF4444]'
                  : computed.suit_joint_fatigue_index > 40
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#10B981]'
              }`}
              style={{ width: `${computed.suit_joint_fatigue_index}%` }}
            />
          </div>
          <div className="text-[9px] font-mono text-zinc-500 text-right uppercase">
            {isCryoFatigue ? 'Cryo elastomer vitrification' : 'Nominal flexibility'}
          </div>
        </div>
      </div>

      {/* Suit Consumables Telemetry Strip */}
      <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-[#006BB3]" />
            xEMU Spacesuit Life Support Consumables
          </span>
          <span className="text-[9px] font-mono text-zinc-500 uppercase">
            Walkback Reserve: 30% Margin Enforced
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
          {/* O2 Level */}
          <div className="p-2 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><Wind className="w-3 h-3 text-sky-400" /> O₂ STORE</span>
              <span className={suit.o2_remaining_percent < 30 ? 'text-[#EF4444] font-bold' : 'text-white'}>{suit.o2_remaining_percent}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-sky-400" style={{ width: `${suit.o2_remaining_percent}%` }} />
            </div>
            <span className="text-[9px] text-zinc-500">{suit.o2_pressure_kpa.toFixed(1)} kPa (4.3 psi)</span>
          </div>

          {/* CO2 Scrubber */}
          <div className="p-2 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-emerald-400" /> CO₂ SCRUB</span>
              <span className={suit.co2_scrubber_remaining_hrs < 2.0 ? 'text-[#F59E0B] font-bold' : 'text-white'}>{suit.co2_scrubber_remaining_hrs}h</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981]" style={{ width: `${(suit.co2_scrubber_remaining_hrs / 8) * 100}%` }} />
            </div>
            <span className="text-[9px] text-zinc-500">Amine bed life</span>
          </div>

          {/* Suit Battery */}
          <div className="p-2 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><Battery className="w-3 h-3 text-amber-400" /> BATTERY</span>
              <span className={suit.battery_remaining_percent < 30 ? 'text-[#EF4444] font-bold' : 'text-white'}>{suit.battery_remaining_percent}%</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className={`h-full ${suit.battery_remaining_percent < 30 ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'}`} style={{ width: `${suit.battery_remaining_percent}%` }} />
            </div>
            <span className="text-[9px] text-zinc-500">Cryo-heater load: 180W</span>
          </div>

          {/* Feedwater Coolant */}
          <div className="p-2 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1"><Droplets className="w-3 h-3 text-cyan-400" /> COOLANT</span>
              <span className="text-white">{suit.thermal_coolant_water_kg} kg</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-cyan-400" style={{ width: `${(suit.thermal_coolant_water_kg / 4.5) * 100}%` }} />
            </div>
            <span className="text-[9px] text-zinc-500">Sublimator ice bed</span>
          </div>

          {/* Walkback limit */}
          <div className="p-2 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span>WALKBACK</span>
              <span className="text-[#10B981] font-bold">{computed.walkback_limit_minutes}m</span>
            </div>
            <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981]" style={{ width: '85%' }} />
            </div>
            <span className="text-[9px] text-zinc-500">Safe return margin</span>
          </div>
        </div>
      </div>

      {/* 4 Bioastronautics Risk Vector Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
        {/* 1. Thermal Cryo-Fatigue Card */}
        <div className={`p-2.5 rounded-sm border flex flex-col justify-between ${
          isCryoFatigue
            ? 'bg-[#050505] border-rose-600/70'
            : computed.thermal_risk === 'ELEVATED'
            ? 'bg-[#050505] border-amber-600/60'
            : 'bg-[#050505] border-zinc-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-[11px]">
                <Thermometer className="w-3.5 h-3.5 text-[#006BB3]" />
                1. THERMAL CRYO-FATIGUE
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
                isCryoFatigue ? 'bg-rose-950 text-[#EF4444] border-rose-800' : 'bg-zinc-900 text-zinc-400 border-zinc-800'
              }`}>
                {computed.thermal_risk}
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-300 mt-1">
              Surface Temp: <strong className="text-white">{env.surface_temp_k.toFixed(1)} K</strong> (Subsurface: {env.subsurface_temp_k.toFixed(1)} K)
            </div>
            <p className="text-[10px] text-zinc-400 font-sans mt-1">
              {computed.thermal_warning_msg}
            </p>
          </div>
          <div className="text-[9px] font-mono text-zinc-600 pt-1.5 border-t border-zinc-900 mt-2 uppercase">
            Significance: Vitrification of elastomeric seals below 40K induces suit joint seizure.
          </div>
        </div>

        {/* 2. Chemical Toxicity & Dust Plume Card */}
        <div className={`p-2.5 rounded-sm border flex flex-col justify-between ${
          computed.toxicity_risk === 'LETHAL_IMMEDIATE_HAZARD'
            ? 'bg-[#050505] border-rose-600'
            : computed.toxicity_risk === 'HABITAT_PRESSURIZATION_HAZARD' || isDustHazard
            ? 'bg-[#050505] border-amber-600/70'
            : 'bg-[#050505] border-zinc-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-[11px]">
                <ShieldAlert className="w-3.5 h-3.5 text-[#EF4444]" />
                2. TOXINS &amp; DUST PARTICULATES
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
                computed.toxicity_risk === 'SAFE' && !isDustHazard
                  ? 'bg-emerald-950 text-[#10B981] border-emerald-800'
                  : 'bg-rose-950 text-[#EF4444] border-rose-800'
              }`}>
                {computed.toxicity_risk}
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-300 mt-1">
              NH₃: <strong className={ngms.nh3_ppm > 10 ? 'text-[#EF4444]' : 'text-zinc-200'}>{ngms.nh3_ppm} ppm</strong> | H₂S: <strong className={ngms.h2s_ppm > 10 ? 'text-[#EF4444]' : 'text-zinc-200'}>{ngms.h2s_ppm} ppm</strong>
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              Dust: <strong className={isDustHazard ? 'text-[#F59E0B]' : 'text-zinc-200'}>{(env.dust_particulate_density_pm3 || 1200).toLocaleString()} p/m³</strong> (Atm P: {env.atmospheric_pressure_pa.toExponential(2)} Pa)
            </div>
            <p className="text-[10px] text-zinc-400 font-sans mt-1">
              {computed.toxicity_warning_msg} {isDustHazard ? `• ${computed.dust_warning_msg}` : ''}
            </p>
          </div>
          <div className="text-[9px] font-mono text-zinc-600 pt-1.5 border-t border-zinc-900 mt-2 uppercase">
            Significance: Lunar silicosis &amp; volatile carry-over poisoning during habitat cycling.
          </div>
        </div>

        {/* 3. Geotechnical Collapse Hazard Card */}
        <div className={`p-2.5 rounded-sm border flex flex-col justify-between ${
          computed.void_risk === 'CRITICAL_COLLAPSE_RISK'
            ? 'bg-[#050505] border-rose-600'
            : computed.void_risk === 'MODERATE_RISK'
            ? 'bg-[#050505] border-amber-600/70'
            : 'bg-[#050505] border-zinc-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-[11px]">
                <Activity className="w-3.5 h-3.5 text-[#F59E0B]" />
                3. GEOTECHNICAL STABILITY
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
                computed.void_risk === 'STABLE' ? 'bg-emerald-950 text-[#10B981] border-emerald-800' : 'bg-amber-950 text-[#F59E0B] border-amber-800'
              }`}>
                {computed.void_risk}
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-300 mt-1">
              GPR Void: <strong className={gpr.void_detected ? 'text-[#EF4444]' : 'text-[#10B981]'}>{gpr.void_detected ? 'DETECTED' : 'CLEAR'}</strong> (Hazard: {gpr.collapse_hazard_score}/100)
            </div>
            <p className="text-[10px] text-zinc-400 font-sans mt-1">
              {computed.void_warning_msg}
            </p>
          </div>
          <div className="text-[9px] font-mono text-zinc-600 pt-1.5 border-t border-zinc-900 mt-2 uppercase">
            Significance: 1.8t crewed rover ground bearing limit &amp; sudden regolith shear failure.
          </div>
        </div>

        {/* 4. Radiation Dose & Solar Particle Event (SPE) Card */}
        <div className={`p-2.5 rounded-sm border flex flex-col justify-between ${
          computed.radiation_risk === 'CRITICAL_SPE_ABORT'
            ? 'bg-[#050505] border-rose-600'
            : isSpeActive
            ? 'bg-[#050505] border-amber-600/70'
            : 'bg-[#050505] border-zinc-800'
        }`}>
          <div>
            <div className="flex items-center justify-between text-xs font-mono mb-1">
              <span className="font-bold text-zinc-200 flex items-center gap-1.5 text-[11px]">
                <Radiation className="w-3.5 h-3.5 text-[#006BB3]" />
                4. RADIATION &amp; SPE INTENSITY
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border ${
                computed.radiation_risk === 'LOW'
                  ? 'bg-emerald-950 text-[#10B981] border-emerald-800'
                  : 'bg-rose-950 text-[#EF4444] border-rose-800'
              }`}>
                {computed.radiation_risk}
              </span>
            </div>
            <div className="text-xs font-mono text-zinc-300 mt-1">
              Dose Rate: <strong className="text-white">{env.radiation_dose_rate_msv_hr.toFixed(3)} mSv/hr</strong> (Acc: {env.accumulated_radiation_msv.toFixed(2)} mSv)
            </div>
            <div className="text-[11px] font-mono text-zinc-400 mt-0.5">
              SPE Flux: <strong className={isSpeActive ? 'text-[#EF4444]' : 'text-zinc-200'}>{(env.spe_intensity_protons_cm2_sr || 0.4).toFixed(1)} p+/cm²/sr</strong> (&gt;10 MeV)
            </div>
            <p className="text-[10px] text-zinc-400 font-sans mt-1">
              {computed.radiation_warning_msg}
            </p>
          </div>
          <div className="text-[9px] font-mono text-zinc-600 pt-1.5 border-t border-zinc-900 mt-2 uppercase">
            Significance: Solar energetic protons induce Acute Radiation Syndrome (ARS) without geomagnetic deflection.
          </div>
        </div>
      </div>
    </div>
  );
};
