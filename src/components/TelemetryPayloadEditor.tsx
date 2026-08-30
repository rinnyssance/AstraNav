import React, { useState, useEffect } from 'react';
import { 
  X, 
  Upload, 
  FileCode, 
  Sliders, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle, 
  Cpu, 
  Radio, 
  Zap, 
  Thermometer 
} from 'lucide-react';
import { BioCoreTelemetry } from '../types';

interface TelemetryPayloadEditorProps {
  isOpen: boolean;
  onClose: () => void;
  currentTelemetry: BioCoreTelemetry;
  onIngestTelemetry: (payload: any) => Promise<void>;
}

export const TelemetryPayloadEditor: React.FC<TelemetryPayloadEditorProps> = ({
  isOpen,
  onClose,
  currentTelemetry,
  onIngestTelemetry,
}) => {
  const [activeMode, setActiveMode] = useState<'SLIDERS' | 'JSON'>('SLIDERS');
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ingestSuccess, setIngestSuccess] = useState(false);

  // Interactive slider values
  const [tempK, setTempK] = useState(currentTelemetry.env.surface_temp_k);
  const [h2oPpm, setH2oPpm] = useState(currentTelemetry.ngms.h2o_ppm);
  const [nh3Ppm, setNh3Ppm] = useState(currentTelemetry.ngms.nh3_ppm);
  const [h2sPpm, setH2sPpm] = useState(currentTelemetry.ngms.h2s_ppm);
  const [drillN, setDrillN] = useState(currentTelemetry.drill.resistance_n);
  const [hasVoid, setHasVoid] = useState(currentTelemetry.gpr.void_detected);
  const [voidDepthM, setVoidDepthM] = useState(currentTelemetry.gpr.void_depth_m || 1.3);
  const [radiationRate, setRadiationRate] = useState(currentTelemetry.env.radiation_dose_rate_msv_hr);

  useEffect(() => {
    if (isOpen) {
      const { computed, ...rawPayload } = currentTelemetry;
      setJsonText(JSON.stringify(rawPayload, null, 2));
      setTempK(currentTelemetry.env.surface_temp_k);
      setH2oPpm(currentTelemetry.ngms.h2o_ppm);
      setNh3Ppm(currentTelemetry.ngms.nh3_ppm);
      setH2sPpm(currentTelemetry.ngms.h2s_ppm);
      setDrillN(currentTelemetry.drill.resistance_n);
      setHasVoid(currentTelemetry.gpr.void_detected);
      setVoidDepthM(currentTelemetry.gpr.void_depth_m || 1.3);
      setRadiationRate(currentTelemetry.env.radiation_dose_rate_msv_hr);
      setJsonError(null);
      setIngestSuccess(false);
    }
  }, [isOpen, currentTelemetry]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetName: string) => {
    if (presetName === 'CRYO_FLOOR') {
      setTempK(32.5); // < 35K critical cryo
      setNh3Ppm(2.0);
      setH2sPpm(0.5);
      setH2oPpm(1900);
      setHasVoid(false);
    } else if (presetName === 'TOXIC_PLUME') {
      setTempK(55.0);
      setNh3Ppm(74.0); // > 50 ppm lethal
      setH2sPpm(32.0);
      setH2oPpm(950);
      setHasVoid(false);
    } else if (presetName === 'SHALLOW_VOID') {
      setTempK(48.0);
      setNh3Ppm(3.0);
      setH2sPpm(1.0);
      setHasVoid(true);
      setVoidDepthM(1.1); // shallow cavity
      setDrillN(80);
    } else if (presetName === 'HIGH_YIELD_ICE') {
      setTempK(52.0);
      setNh3Ppm(1.5);
      setH2sPpm(0.2);
      setH2oPpm(4200);
      setDrillN(240);
      setHasVoid(false);
    }
  };

  const handleIngestFromSliders = async () => {
    setIsSubmitting(true);
    try {
      const payload: any = {
        ...currentTelemetry,
        id: `TEL-CUSTOM-${Date.now().toString().slice(-4)}`,
        timestamp: new Date().toISOString(),
        env: {
          ...currentTelemetry.env,
          surface_temp_k: Number(tempK),
          radiation_dose_rate_msv_hr: Number(radiationRate),
        },
        ngms: {
          ...currentTelemetry.ngms,
          h2o_ppm: Number(h2oPpm),
          nh3_ppm: Number(nh3Ppm),
          h2s_ppm: Number(h2sPpm),
        },
        drill: {
          ...currentTelemetry.drill,
          resistance_n: Number(drillN),
        },
        gpr: {
          ...currentTelemetry.gpr,
          void_detected: hasVoid,
          void_depth_m: hasVoid ? Number(voidDepthM) : null,
          dielectric_constant: hasVoid ? 1.4 : h2oPpm > 1500 ? 3.9 : 2.8,
        },
      };

      delete payload.computed;
      await onIngestTelemetry(payload);
      setIngestSuccess(true);
      setTimeout(() => {
        setIngestSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setJsonError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIngestFromJson = async () => {
    setIsSubmitting(true);
    setJsonError(null);
    try {
      const parsed = JSON.parse(jsonText);
      await onIngestTelemetry(parsed);
      setIngestSuccess(true);
      setTimeout(() => {
        setIngestSuccess(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setJsonError(`JSON Parse/Ingest Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#0A0A0A] border border-zinc-800 rounded-sm shadow-2xl w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden font-mono">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-[#050505]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#005288]/40 border border-[#006BB3]/60 flex items-center justify-center text-sky-300">
              <FileCode className="w-3.5 h-3.5 text-[#006BB3]" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-widest">
                PSR-SOUTH-POLE-LOG Telemetry Ingest Terminal
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">
                Inject custom sensor payloads or stress-test Bioastronautics risk triggers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-sm text-zinc-500 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Toggle & Presets Bar */}
        <div className="px-4 py-2 bg-[#050505] border-b border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 bg-[#0A0A0A] p-0.5 rounded-sm border border-zinc-800">
            <button
              onClick={() => setActiveMode('SLIDERS')}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 transition-all text-[11px] uppercase tracking-wider ${
                activeMode === 'SLIDERS'
                  ? 'bg-[#005288] text-white border border-[#006BB3] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3 h-3" />
              <span>SENSOR SLIDERS</span>
            </button>
            <button
              onClick={() => setActiveMode('JSON')}
              className={`px-2.5 py-1 rounded-sm flex items-center gap-1.5 transition-all text-[11px] uppercase tracking-wider ${
                activeMode === 'JSON'
                  ? 'bg-[#005288] text-white border border-[#006BB3] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>RAW JSON LOG</span>
            </button>
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[9px] text-zinc-500 uppercase tracking-widest">TEST PRESETS:</span>
            <button
              onClick={() => handleApplyPreset('CRYO_FLOOR')}
              className="px-2 py-0.5 rounded-sm bg-[#0A0A0A] text-sky-300 border border-zinc-800 hover:border-[#006BB3] text-[9px] uppercase font-mono"
            >
              ❄ &lt;35K Cryo
            </button>
            <button
              onClick={() => handleApplyPreset('TOXIC_PLUME')}
              className="px-2 py-0.5 rounded-sm bg-[#0A0A0A] text-[#EF4444] border border-zinc-800 hover:border-rose-600 text-[9px] uppercase font-mono"
            >
              ☠ 74ppm NH₃
            </button>
            <button
              onClick={() => handleApplyPreset('SHALLOW_VOID')}
              className="px-2 py-0.5 rounded-sm bg-[#0A0A0A] text-[#F59E0B] border border-zinc-800 hover:border-amber-600 text-[9px] uppercase font-mono"
            >
              ⚠ 1.1m Void
            </button>
            <button
              onClick={() => handleApplyPreset('HIGH_YIELD_ICE')}
              className="px-2 py-0.5 rounded-sm bg-[#0A0A0A] text-[#10B981] border border-zinc-800 hover:border-emerald-600 text-[9px] uppercase font-mono"
            >
              💧 4200ppm Ice
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-4 flex-1 overflow-y-auto max-h-[60vh] bg-[#0A0A0A]">
          {activeMode === 'SLIDERS' ? (
            <div className="space-y-2.5">
              {/* Slider 1: Surface Temperature */}
              <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-bold flex items-center gap-1.5 text-[11px] uppercase">
                    <Thermometer className="w-3.5 h-3.5 text-[#006BB3]" />
                    SURFACE TEMPERATURE (K)
                  </span>
                  <span className={tempK < 40 ? 'text-[#EF4444] font-bold text-[11px]' : 'text-white text-[11px]'}>
                    {tempK.toFixed(1)} K {tempK < 40 ? '(CRYO-FATIGUE WARNING)' : ''}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="130"
                  step="0.5"
                  value={tempK}
                  onChange={(e) => setTempK(parseFloat(e.target.value))}
                  className="w-full accent-[#006BB3] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1 uppercase">
                  <span>20K (Extreme Freeze)</span>
                  <span className="text-[#F59E0B]">40K (Bearing Limit)</span>
                  <span>130K (Rim Sunlight)</span>
                </div>
              </div>

              {/* Slider 2: Water Ice ppm */}
              <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-bold text-[11px] uppercase">NGMS WATER ICE CONCENTRATION (ppm)</span>
                  <span className="text-[#10B981] font-bold text-[11px]">{h2oPpm} ppm</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="5000"
                  step="50"
                  value={h2oPpm}
                  onChange={(e) => setH2oPpm(parseInt(e.target.value, 10))}
                  className="w-full accent-[#10B981] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1 uppercase">
                  <span>0 ppm (Dry Regolith)</span>
                  <span>1000 ppm (Nominal)</span>
                  <span>5000 ppm (High Purity Ice)</span>
                </div>
              </div>

              {/* Slider 3: Ammonia NH3 Toxicity */}
              <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-bold text-[11px] uppercase">AMMONIA (NH₃) TOXICITY (ppm)</span>
                  <span className={nh3Ppm > 50 ? 'text-[#EF4444] font-bold animate-pulse text-[11px]' : nh3Ppm > 10 ? 'text-[#F59E0B] font-bold text-[11px]' : 'text-white text-[11px]'}>
                    {nh3Ppm.toFixed(1)} ppm {nh3Ppm > 50 ? '(LETHAL ABORT)' : nh3Ppm > 10 ? '(AIRLOCK HAZARD)' : '(SAFE)'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.5"
                  value={nh3Ppm}
                  onChange={(e) => setNh3Ppm(parseFloat(e.target.value))}
                  className="w-full accent-[#EF4444] cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1 uppercase">
                  <span>0 ppm (Safe)</span>
                  <span className="text-[#F59E0B]">10 ppm (Airlock Limit)</span>
                  <span className="text-[#EF4444]">50 ppm (Lethal Abort)</span>
                </div>
              </div>

              {/* Slider 4: Drill Resistance (N) */}
              <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-zinc-300 font-bold flex items-center gap-1.5 text-[11px] uppercase">
                    <Zap className="w-3.5 h-3.5 text-zinc-400" />
                    DRILL PENETRATION RESISTANCE (N)
                  </span>
                  <span className="text-white text-[11px]">{drillN} N</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="800"
                  step="10"
                  value={drillN}
                  onChange={(e) => setDrillN(parseInt(e.target.value, 10))}
                  className="w-full accent-zinc-300 cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-zinc-500 mt-1 uppercase">
                  <span>50N (Loose)</span>
                  <span>350N (Manual Crew Limit)</span>
                  <span>800N (Hard Permafrost)</span>
                </div>
              </div>

              {/* Toggle 5: GPR Subsurface Void */}
              <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5 uppercase">
                    <Radio className="w-3.5 h-3.5 text-[#006BB3]" />
                    GPR SUBSURFACE VOID / CAVITY ANOMALY
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasVoid}
                      onChange={(e) => setHasVoid(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#EF4444]"></div>
                  </label>
                </div>

                {hasVoid && (
                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-[#EF4444] text-[11px] uppercase">Void Overburden Depth:</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step="0.1"
                        min="0.4"
                        max="4.5"
                        value={voidDepthM}
                        onChange={(e) => setVoidDepthM(parseFloat(e.target.value))}
                        className="w-16 bg-[#0A0A0A] border border-zinc-800 rounded-sm px-2 py-0.5 text-zinc-100 text-xs text-right font-mono"
                      />
                      <span className="text-zinc-500 text-[10px] uppercase">meters</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <textarea
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                rows={14}
                className="w-full bg-[#050505] border border-zinc-800 rounded-sm p-3 text-xs font-mono text-zinc-300 focus:outline-none focus:border-[#006BB3] scrollbar-thin resize-none"
              />
              {jsonError && (
                <div className="mt-2 p-2 rounded-sm bg-[#050505] border border-rose-600 text-[#EF4444] text-xs font-mono flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{jsonError}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 bg-[#050505] border-t border-zinc-800 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-sm bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 text-xs font-mono transition-colors uppercase tracking-wider"
          >
            CANCEL
          </button>

          <button
            onClick={activeMode === 'SLIDERS' ? handleIngestFromSliders : handleIngestFromJson}
            disabled={isSubmitting}
            className={`px-4 py-1.5 rounded-sm text-xs font-mono font-bold flex items-center gap-2 transition-all uppercase tracking-wider ${
              ingestSuccess
                ? 'bg-[#10B981] text-white border border-[#10B981]'
                : 'bg-[#005288] hover:bg-[#006BB3] text-white border border-[#006BB3]'
            }`}
          >
            {ingestSuccess ? (
              <>
                <CheckCircle className="w-3.5 h-3.5" />
                <span>INGESTION SUCCESSFUL!</span>
              </>
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'INGESTING TO BIO-CORE...' : 'INGEST TELEMETRY PAYLOAD'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
