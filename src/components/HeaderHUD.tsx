import React from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Radio, 
  Compass, 
  Cpu, 
  Thermometer, 
  Zap, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw,
  FileCode2
} from 'lucide-react';
import { BioCoreTelemetry, InstrumentStatus, MissionGoNoGo } from '../types';

interface HeaderHUDProps {
  telemetry: BioCoreTelemetry;
  metTime: string;
  isSimulating: boolean;
  onToggleSimulate: () => void;
  onNextWaypoint: () => void;
  onReset: () => void;
  onOpenJsonEditor: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  instrumentStatuses: {
    envStatus: InstrumentStatus;
    gprStatus: InstrumentStatus;
    drillStatus: InstrumentStatus;
    ngmsStatus: InstrumentStatus;
  };
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  telemetry,
  metTime,
  isSimulating,
  onToggleSimulate,
  onNextWaypoint,
  onReset,
  onOpenJsonEditor,
  soundEnabled,
  onToggleSound,
  instrumentStatuses,
}) => {
  const getStatusColor = (status: InstrumentStatus) => {
    switch (status) {
      case 'NOMINAL':
        return 'bg-[#10B981]';
      case 'CAUTION':
        return 'bg-[#F59E0B]';
      case 'CRITICAL':
        return 'bg-[#EF4444] animate-pulse';
      default:
        return 'bg-zinc-500';
    }
  };

  const getGoNoGoBadge = (decision: MissionGoNoGo) => {
    switch (decision) {
      case 'GO':
        return {
          label: 'MISSION STATUS: GO FOR CREWED EVA',
          bg: 'bg-[#0A0A0A] border-[#10B981]/60 text-[#10B981]',
          icon: <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />,
        };
      case 'CONDITIONAL_GO':
        return {
          label: 'MISSION STATUS: CONDITIONAL GO (RESTRICTED EVA)',
          bg: 'bg-[#0A0A0A] border-[#F59E0B]/60 text-[#F59E0B]',
          icon: <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />,
        };
      case 'NO_GO':
        return {
          label: 'MISSION STATUS: NO-GO / BIO-HAZARD DETECTED',
          bg: 'bg-[#0A0A0A] border-[#EF4444]/80 text-[#EF4444]',
          icon: <ShieldAlert className="w-4 h-4 text-[#EF4444] shrink-0" />,
        };
    }
  };

  const goNoGo = getGoNoGoBadge(telemetry.computed.mission_go_no_go);

  return (
    <header className="border-b border-[#222] bg-[#0A0A0A] px-4 lg:px-6 py-3 text-[#E0E0E0] sticky top-0 z-40">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pb-3 border-b border-[#222]">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 bg-[#005288] flex items-center justify-center rounded-sm border border-[#006BB3] shrink-0">
            <span className="font-bold text-white text-lg tracking-tighter">AN</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-widest uppercase text-white">
                AstraNav PSR
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded bg-[#005288]/30 text-[#006BB3] border border-[#006BB3]/50">
                v1.0.4
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 rounded">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                LUNAR SOUTH POLE
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              Bioastronautics Mission Support • Artemis Ground Station
            </p>
          </div>
        </div>

        {/* Location, MET and Traverse Simulation Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Location</span>
              <span className="text-xs font-mono tracking-tight text-zinc-200">{telemetry.siteName}</span>
            </div>
            <div className="h-8 w-[1px] bg-zinc-800"></div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Mission Time</span>
              <span className="text-xs font-mono text-[#10B981] font-medium">{metTime}</span>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-zinc-800 hidden sm:block"></div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 bg-[#050505] border border-zinc-800 p-1 rounded-sm">
            <button
              onClick={onToggleSimulate}
              title={isSimulating ? 'Pause Rover Auto-Traverse' : 'Start Rover Auto-Traverse'}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-medium rounded-sm transition-colors ${
                isSimulating
                  ? 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40 hover:bg-[#F59E0B]/30'
                  : 'bg-[#005288]/40 text-sky-200 border border-[#006BB3]/60 hover:bg-[#005288]/60'
              }`}
            >
              {isSimulating ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>{isSimulating ? 'AUTO-ROVER' : 'SIMULATE'}</span>
            </button>

            <button
              onClick={onNextWaypoint}
              title="Step to Next Waypoint"
              className="p-1 rounded-sm bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-colors"
            >
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onReset}
              title="Reset Traverse Path"
              className="p-1 rounded-sm bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white border border-zinc-800 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onOpenJsonEditor}
              title="Ingest / Edit PSR Telemetry JSON"
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-mono rounded-sm bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-[#006BB3] border border-zinc-800 transition-colors"
            >
              <FileCode2 className="w-3.5 h-3.5 text-[#006BB3]" />
              <span className="hidden md:inline">JSON INGEST</span>
            </button>

            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute HUD Audio' : 'Enable HUD Audio'}
              className={`p-1 rounded-sm transition-colors border ${
                soundEnabled
                  ? 'bg-zinc-900 text-[#006BB3] border-[#006BB3]/50'
                  : 'bg-zinc-900 text-zinc-600 border-zinc-800'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: Master Go/No-Go banner & 4 Key Instrument Telemetry Status */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2.5">
        {/* Master Go / No-Go */}
        <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-sm border ${goNoGo.bg}`}>
          {goNoGo.icon}
          <div className="flex flex-col">
            <span className="font-mono text-xs font-bold tracking-wider">{goNoGo.label}</span>
            <span className="text-[10px] text-zinc-400 font-sans line-clamp-1">
              {telemetry.computed.thermal_risk !== 'NOMINAL'
                ? telemetry.computed.thermal_warning_msg
                : telemetry.computed.toxicity_risk !== 'SAFE'
                ? telemetry.computed.toxicity_warning_msg
                : telemetry.computed.void_risk !== 'STABLE'
                ? telemetry.computed.void_warning_msg
                : 'All biological and geotechnical thresholds validated for crewed traverse.'}
            </span>
          </div>
        </div>

        {/* 4 Instrument Status Indicator Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Instrument 1: Env Monitoring */}
          <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-sm bg-[#050505] border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1 tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(instrumentStatuses.envStatus)}`} />
                Env Monitoring
              </span>
              <span className="font-mono text-xs font-bold text-zinc-200">
                {telemetry.env.surface_temp_k.toFixed(1)}K <span className="text-[10px] text-zinc-500 font-normal">| {telemetry.env.radiation_dose_rate_msv_hr.toFixed(2)}mSv</span>
              </span>
            </div>
            <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-[#10B981] w-[20%]"></div>
            </div>
          </div>

          {/* Instrument 2: GPR Subsurface Radar */}
          <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-sm bg-[#050505] border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1 tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(instrumentStatuses.gprStatus)}`} />
                Subsurface GPR
              </span>
              <span className="font-mono text-xs font-bold text-zinc-200">
                ε={telemetry.gpr.dielectric_constant.toFixed(1)} <span className="text-[10px] text-zinc-500 font-normal">| {telemetry.gpr.void_detected ? 'ALERT' : 'STABLE'}</span>
              </span>
            </div>
            <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden shrink-0">
              <div className={`h-full ${telemetry.gpr.void_detected ? 'bg-[#F59E0B] w-[65%]' : 'bg-[#10B981] w-[15%]'}`}></div>
            </div>
          </div>

          {/* Instrument 3: Drill Subsystem */}
          <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-sm bg-[#050505] border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1 tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(instrumentStatuses.drillStatus)}`} />
                Drill Subsystem
              </span>
              <span className="font-mono text-xs font-bold text-zinc-200">
                {telemetry.drill.resistance_n}N <span className="text-[10px] text-zinc-500 font-normal">| {telemetry.drill.drill_depth_cm}cm</span>
              </span>
            </div>
            <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-zinc-400 w-[42%]"></div>
            </div>
          </div>

          {/* Instrument 4: NGMS Mass Spectrometer */}
          <div className="flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-sm bg-[#050505] border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-zinc-500 flex items-center gap-1 tracking-wider">
                <span className={`w-1.5 h-1.5 rounded-full ${getStatusColor(instrumentStatuses.ngmsStatus)}`} />
                NGMS Spectra
              </span>
              <span className="font-mono text-xs font-bold text-zinc-200">
                H₂O: {telemetry.ngms.h2o_ppm} <span className="text-[10px] text-zinc-500 font-normal">ppm</span>
              </span>
            </div>
            <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden shrink-0">
              <div className="h-full bg-blue-500 w-[70%]"></div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
