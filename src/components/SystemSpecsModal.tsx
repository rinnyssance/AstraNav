import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Activity, 
  ShieldAlert, 
  Radio, 
  Database, 
  Binary, 
  CheckCircle2, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Compass, 
  Wind, 
  Thermometer, 
  Radiation, 
  Sparkles,
  Droplets,
  Layers,
  Zap,
  Gauge
} from 'lucide-react';

interface SystemSpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SystemSpecsModal: React.FC<SystemSpecsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'BIO_MATH' | 'SENSORS' | 'ISRU_MODELS' | 'API_SCHEMA' | 'GROUNDING'>('OVERVIEW');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySchema = () => {
    const schemaExample = {
      $schema: "http://json-schema.org/draft-07/schema#",
      title: "BioCoreTelemetry",
      type: "object",
      required: ["id", "timestamp", "siteId", "env", "gpr", "drill", "ngms", "suit_consumables"],
      properties: {
        id: { type: "string", example: "TEL-SHACKLETON-001" },
        siteName: { type: "string", example: "Shackleton Crater Rim Crest" },
        coordinates: {
          type: "object",
          properties: {
            lat: { type: "number", minimum: -90.0, maximum: -80.0 },
            lon: { type: "number", minimum: 0.0, maximum: 360.0 },
            depth_m: { type: "number" },
            elevation_m: { type: "number" },
            slope_deg: { type: "number" }
          }
        },
        env: {
          type: "object",
          properties: {
            surface_temp_k: { type: "number", description: "Kelvin. Vitrification risk <40K." },
            subsurface_temp_k: { type: "number" },
            radiation_dose_rate_msv_hr: { type: "number", description: "mSv/hr dose rate" },
            accumulated_radiation_msv: { type: "number" },
            cosmic_ray_flux_cpm: { type: "integer" },
            atmospheric_pressure_pa: { type: "number", description: "Pascals. Ambient ~1e-9 Pa" },
            dust_particulate_density_pm3: { type: "integer", description: "Particles/m^3" },
            spe_intensity_protons_cm2_sr: { type: "number", description: "Protons/cm^2/sr (>10 MeV)" }
          }
        },
        gpr: {
          type: "object",
          properties: {
            dielectric_constant: { type: "number", description: "Regolith 2.7-2.9, Ice 3.15-4.4, Void <2.0" },
            void_detected: { type: "boolean" },
            void_depth_m: { type: ["number", "null"] },
            collapse_hazard_score: { type: "number", minimum: 0, maximum: 100 }
          }
        },
        drill: {
          type: "object",
          properties: {
            state: { type: "string", enum: ["IDLE", "DRILLING", "CORE_EXTRACTION", "ABORTED"] },
            resistance_n: { type: "number" },
            bit_temp_k: { type: "number" },
            drill_depth_cm: { type: "number" },
            torque_nm: { type: "number" },
            penetration_rate_mm_s: { type: "number" },
            energy_joules: { type: "number" }
          }
        },
        ngms: {
          type: "object",
          properties: {
            h2o_ppm: { type: "number", description: "Water volatile concentration in PPM" },
            nh3_ppm: { type: "number", description: "Toxic ammonia PPM (>10 warning, >50 abort)" },
            h2s_ppm: { type: "number", description: "Toxic hydrogen sulfide PPM (>10 warning, >50 abort)" },
            co2_ppm: { type: "number" },
            co_ppm: { type: "number" },
            ch4_ppm: { type: "number" },
            so2_ppm: { type: "number" }
          }
        },
        suit_consumables: {
          type: "object",
          properties: {
            o2_remaining_percent: { type: "number" },
            o2_pressure_kpa: { type: "number" },
            co2_scrubber_remaining_hrs: { type: "number" },
            battery_remaining_percent: { type: "number" },
            thermal_coolant_water_kg: { type: "number" }
          }
        }
      }
    };
    navigator.clipboard.writeText(JSON.stringify(schemaExample, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-[#0A0A0A] border border-zinc-700 w-full max-w-5xl h-[92vh] max-h-[850px] rounded-sm flex flex-col shadow-2xl overflow-hidden text-zinc-200 font-sans">
        
        {/* Modal Header */}
        <div className="px-4 py-3 bg-[#050505] border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#005288] border border-[#006BB3] flex items-center justify-center text-white">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-widest uppercase font-mono text-white">
                  AstraNav PSR — System Architecture &amp; Flight Specifications
                </h2>
                <span className="px-1.5 py-0.2 text-[9px] font-mono bg-sky-950 text-sky-400 border border-sky-800 rounded">
                  NASA ARTEMIS III/IV SDT COMPLIANT
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                BIOASTRONAUTICS QUANTIZATION • MULTI-SENSOR TELEMETRY PIPELINE • GEMINI 3.7 FLIGHT DIRECTOR
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-[#080808] px-3 overflow-x-auto text-xs font-mono">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 font-medium transition-all shrink-0 ${
              activeTab === 'OVERVIEW'
                ? 'border-[#006BB3] text-sky-300 bg-[#005288]/20 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>1. MISSION OVERVIEW</span>
          </button>

          <button
            onClick={() => setActiveTab('BIO_MATH')}
            className={`px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 font-medium transition-all shrink-0 ${
              activeTab === 'BIO_MATH'
                ? 'border-[#006BB3] text-sky-300 bg-[#005288]/20 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>2. BIO-CORE MATH &amp; SAFETY</span>
          </button>

          <button
            onClick={() => setActiveTab('SENSORS')}
            className={`px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 font-medium transition-all shrink-0 ${
              activeTab === 'SENSORS'
                ? 'border-[#006BB3] text-sky-300 bg-[#005288]/20 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-emerald-400" />
            <span>3. INSTRUMENTS &amp; PAYLOAD</span>
          </button>

          <button
            onClick={() => setActiveTab('ISRU_MODELS')}
            className={`px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 font-medium transition-all shrink-0 ${
              activeTab === 'ISRU_MODELS'
                ? 'border-[#006BB3] text-sky-300 bg-[#005288]/20 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Droplets className="w-3.5 h-3.5 text-cyan-400" />
            <span>4. ISRU WATER EXTRACTION</span>
          </button>

          <button
            onClick={() => setActiveTab('API_SCHEMA')}
            className={`px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 font-medium transition-all shrink-0 ${
              activeTab === 'API_SCHEMA'
                ? 'border-[#006BB3] text-sky-300 bg-[#005288]/20 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Binary className="w-3.5 h-3.5 text-amber-400" />
            <span>5. TELEMETRY API &amp; SCHEMA</span>
          </button>

          <button
            onClick={() => setActiveTab('GROUNDING')}
            className={`px-3.5 py-2.5 flex items-center gap-1.5 border-b-2 font-medium transition-all shrink-0 ${
              activeTab === 'GROUNDING'
                ? 'border-[#006BB3] text-sky-300 bg-[#005288]/20 font-bold'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-purple-400" />
            <span>6. NASA PLANETARY GROUNDING</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 bg-[#060606] text-xs">
          
          {/* TAB 1: MISSION OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-5 animate-in fade-in duration-100">
              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wider">
                    Executive Mission Summary
                  </span>
                  <span className="text-[10px] font-mono text-zinc-500">OPERATIONAL FLIGHT DIRECTIVE</span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  <strong>AstraNav PSR</strong> is a high-reliability, real-time bioastronautics mission decision-support and traverse planning system designed for crewed and autonomous robotic exploration of <strong>Permanently Shadowed Regions (PSRs)</strong> at the Lunar South Pole (latitudes 80°S to 90°S). PSRs act as ultra-cryogenic cold traps (25K to 90K) holding vital water ice deposits alongside extreme operational hazards.
                </p>
              </div>

              {/* Core Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-1.5">
                  <span className="font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    Bioastronautics Safety
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Deterministic quantization of astronaut life support envelopes, spacesuit elastomer vitrification risks below 40K, volatile toxic inhalation risks (NH3, H2S), abrasive regolith dust levitation, and Solar Particle Event (SPE) proton storms.
                  </p>
                </div>

                <div className="p-3 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-1.5">
                  <span className="font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    Subsurface Multi-Sensor Fusion
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Synchronous processing of Ground Penetrating Radar (dielectric void cavity mapping), Rotary-Percussive Deep Drill telemetry (mechanical penetration resistance), and Next-Gen Mass Spectrometry (subsurface volatile gas peaks).
                  </p>
                </div>

                <div className="p-3 rounded-sm bg-[#0A0A0A] border border-zinc-800 flex flex-col gap-1.5">
                  <span className="font-mono font-bold text-zinc-100 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-sky-400" />
                    Gemini 3.7 AI Flight Copilot
                  </span>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Server-side grounded intelligence executing NASA Artemis Science Definition Team protocols to provide instant Go/No-Go rationales, resource extraction assessments, and tactical natural-language crew debriefings.
                  </p>
                </div>
              </div>

              {/* Target Lunar Crater Theaters */}
              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                <h3 className="font-mono font-bold text-zinc-200 uppercase tracking-wider mb-2">
                  Target Polar Exploration Theaters
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900">
                    <span className="text-sky-400 font-bold block">Shackleton Crater</span>
                    <span className="text-zinc-500">89.9°S • 21km dia • 4.2km depth</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">High ridge illumination &amp; cold floor trap</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900">
                    <span className="text-cyan-400 font-bold block">Faustini Crater</span>
                    <span className="text-zinc-500">87.3°S • 39km dia • 3.1km depth</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">Volatile outgassing vents &amp; rich ice beds</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900">
                    <span className="text-indigo-400 font-bold block">Haworth Crater</span>
                    <span className="text-zinc-500">87.4°S • 35km dia • 3.5km depth</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">Extreme cryogenic floor (&lt;32K cryo-fatigue)</span>
                  </div>
                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900">
                    <span className="text-amber-400 font-bold block">Shoemaker Crater</span>
                    <span className="text-zinc-500">88.1°S • 51km dia • 2.8km depth</span>
                    <span className="text-[10px] text-zinc-400 block mt-1">LCROSS impact site with hydrogen deposits</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BIO-CORE MATH & SAFETY */}
          {activeTab === 'BIO_MATH' && (
            <div className="space-y-4 animate-in fade-in duration-100 font-mono">
              <div className="p-3.5 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                <span className="text-xs font-bold text-sky-400 uppercase tracking-wider block mb-1">
                  1. Deterministic Safe EVA Window Quantization Formula
                </span>
                <div className="p-3 rounded-sm bg-[#050505] border border-zinc-900 text-zinc-200 text-xs">
                  <code>
                    T_safe_EVA = min( 360 min, T_walkback, T_thermal_limit, T_radiation_limit, T_dust_limit, T_toxic_limit )
                  </code>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-2">
                  Baseline nominal EVA is capped at 360 minutes (6.0 hours). The actual safe duration is constrained by the strict minimum across all biological and consumable limiting vectors.
                </p>
              </div>

              {/* Walkback Reserve Margin Model */}
              <div className="p-3.5 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1 flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-emerald-400" />
                  2. Spacesuit Consumables &amp; 30% Walkback Margin Formula
                </span>
                <div className="p-3 rounded-sm bg-[#050505] border border-zinc-900 text-zinc-200 text-xs">
                  <code>
                    T_primary_min = min( (O2_pct / 100) * 480m, CO2_scrub_hrs * 60m, (Batt_pct / 100) * 420m, (Coolant_kg / 4.5) * 480m )<br />
                    T_walkback_limit = round( T_primary_min * 0.70 )  // 30% emergency reserve margin enforced
                  </code>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-2">
                  Astronauts can never exceed 70% of their lowest remaining consumable life support store. 30% of oxygen, battery, and coolant capacity is reserved exclusively for the emergency return traverse.
                </p>
              </div>

              {/* Thermal Vitrification Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5" />
                    3. Cryo-Fatigue &amp; Joint Vitrification Index
                  </span>
                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900 text-[11px]">
                    <code>
                      Fatigue_Index = min( 100, max( 0, ((100 - T_surface_k) / 75) * 100 ) )
                    </code>
                  </div>
                  <ul className="text-[10px] text-zinc-400 font-sans mt-2 space-y-1">
                    <li>• <strong>T &lt; 32K</strong>: Critical Joint Vitrification (EVA window reduced to 20 mins; NO-GO).</li>
                    <li>• <strong>T &lt; 40K</strong>: Cryo-Fatigue Alert (EVA window capped at 45 mins).</li>
                    <li>• <strong>T &lt; 60K</strong>: Elevated Thermal Wear (EVA window capped at 120 mins).</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Radiation className="w-3.5 h-3.5" />
                    4. Solar Particle Event (SPE) Thresholds
                  </span>
                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900 text-[11px]">
                    <code>
                      SPE_Flux &gt; 100 p+/cm²/sr  -&gt; CRITICAL SPE ABORT (T_EVA = 0m)<br />
                      SPE_Flux &gt; 10 p+/cm²/sr   -&gt; HIGH EXPOSURE (T_EVA = 45m)
                    </code>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-sans mt-2">
                    In the absence of a lunar magnetosphere, solar flares produce energetic protons (&gt;10 MeV). Flux &gt;100 triggers immediate retreat into subterranean storm shelters to prevent Acute Radiation Syndrome.
                  </p>
                </div>
              </div>

              {/* Chemical Toxicity & Dust */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block mb-1">
                    5. Volatile Chemical Toxicity Envelopes
                  </span>
                  <ul className="text-[10px] text-zinc-400 font-sans space-y-1">
                    <li>• <strong>NH₃ &gt; 50 ppm OR H₂S &gt; 50 ppm</strong>: LETHAL IMMEDIATE HAZARD (NO-GO).</li>
                    <li>• <strong>NH₃ &gt; 10 ppm OR H₂S &gt; 10 ppm</strong>: HABITAT CONTAMINATION HAZARD (EVA capped at 90m).</li>
                    <li>• Standard xEMU amine scrubbers cannot eliminate ammonia, creating severe ocular/lung toxicity during habitat ingress.</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />
                    6. Lunar Dust Particulate Levitation
                  </span>
                  <ul className="text-[10px] text-zinc-400 font-sans space-y-1">
                    <li>• <strong>Dust &gt; 25,000 p/m³</strong>: Abrasive Plume Hazard (EVA capped at 60m).</li>
                    <li>• <strong>Dust &gt; 8,000 p/m³</strong>: Elevated Electrostatic Levitation.</li>
                    <li>• Sub-micron jagged silica/iron particles cause suit bearing wear, visor scratching, and lunar silicosis.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSTRUMENTS & PAYLOAD */}
          {activeTab === 'SENSORS' && (
            <div className="space-y-4 animate-in fade-in duration-100">
              <div className="p-3 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                <span className="text-xs font-mono font-bold text-zinc-200 uppercase tracking-wider block mb-2">
                  Scientific Payload Sensor Specifications &amp; Flight Analog Heritage
                </span>

                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px] border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400 bg-[#050505]">
                        <th className="p-2">Subsystem / Instrument</th>
                        <th className="p-2">Measurement Range</th>
                        <th className="p-2">Precision / Sampling</th>
                        <th className="p-2">Flight Heritage Analog</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900 text-zinc-300">
                      <tr>
                        <td className="p-2 font-bold text-sky-400">Ground Penetrating Radar (GPR)</td>
                        <td className="p-2">Depth 0.0 - 5.0m<br />Dielectric ε = 1.0 - 6.0</td>
                        <td className="p-2">500 MHz - 2.0 GHz FMCW<br />5 cm vertical resolution</td>
                        <td className="p-2 text-zinc-400">NASA RIMFAX / Chang'e-4 LPR</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-emerald-400">Rotary-Percussive Deep Drill</td>
                        <td className="p-2">Depth 0 - 150 cm<br />Resistance 0 - 1,000 N</td>
                        <td className="p-2">10 Hz load cell &amp; thermocouple<br />Torque 0 - 50 Nm</td>
                        <td className="p-2 text-zinc-400">Honeybee TRIDENT Drill / VIPER</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-indigo-400">Next-Gen Mass Spectrometer (NGMS)</td>
                        <td className="p-2">Mass range 1 - 150 amu<br />Volatiles 0 - 50,000 ppm</td>
                        <td className="p-2">Quadrupole analyzer<br />Sensitivity 0.1 ppm</td>
                        <td className="p-2 text-zinc-400">NASA MSolo / SAM Quadrupole</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-amber-400">Cryogenic Environmental Array</td>
                        <td className="p-2">Temp: 15K - 400K<br />Pressure: 10⁻¹¹ - 10⁻³ Pa</td>
                        <td className="p-2">PT100 Platinum RTDs<br />Micro-Pirani &amp; Ion Gauges</td>
                        <td className="p-2 text-zinc-400">LRO Diviner / Heat Probe (HP3)</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-rose-400">Space Radiation &amp; SPE Dosimeter</td>
                        <td className="p-2">Dose rate: 0.001 - 100 mSv/hr<br />Proton flux: 0.1 - 10⁴ p+/cm²</td>
                        <td className="p-2">Silicon solid-state diodes<br />1 Hz cosmic particle event log</td>
                        <td className="p-2 text-zinc-400">LRO CRaTER / Artemis BioExpt</td>
                      </tr>
                      <tr>
                        <td className="p-2 font-bold text-cyan-400">xEMU Life Support Consumables Monitor</td>
                        <td className="p-2">O₂ pressure (20-35 kPa)<br />Amine bed life (0-8 hrs)</td>
                        <td className="p-2">Telemetry CAN-Bus link<br />0.5 Hz continuous stream</td>
                        <td className="p-2 text-zinc-400">NASA xEMU ECLSS Architecture</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ISRU WATER EXTRACTION */}
          {activeTab === 'ISRU_MODELS' && (
            <div className="space-y-4 animate-in fade-in duration-100 font-mono">
              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block mb-1">
                  1. In-Situ Resource Utilization (ISRU) Net Yield Formula
                </span>
                <div className="p-3 rounded-sm bg-[#050505] border border-zinc-900 text-zinc-200 text-xs">
                  <code>
                    Depth_Factor = max( 0.1, Drill_Depth_cm / 100 )<br />
                    Net_ISRU_Yield_Index = max( 0, round( H2O_ppm - (Drill_Resistance_N * Depth_Factor) ) )
                  </code>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-2">
                  Extracting volatiles from ultra-hard cryogenic permafrost incurs a steep mechanical and thermal energy penalty. If drilling resistance is high (&gt;450 N) and volatile concentration is low (&lt;200 ppm), net extraction produces a negative energy balance.
                </p>
              </div>

              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  2. Human Crew Consumption Days Calculation
                </span>
                <div className="p-3 rounded-sm bg-[#050505] border border-zinc-900 text-zinc-200 text-xs">
                  <code>
                    Standard_Hopper_Mass = 350,000 g  // 350 kg regolith extraction batch<br />
                    Extracted_H2O_Grams = 350,000 * ( H2O_ppm / 1,000,000 )<br />
                    Crew_Consumption_Rate = 5,000 g/day  // 2 astronauts x 2.5 L/day metabolic &amp; hygiene baseline<br />
                    Human_Consumption_Days = Extracted_H2O_Grams / 5,000
                  </code>
                </div>
                <p className="text-[11px] text-zinc-400 font-sans mt-2">
                  A high-grade deposit of 4,000 ppm yielding from a 350 kg batch produces 1,400 g (1.4 L) of potable water, sufficient for 0.3 crew days per single hopper cycle.
                </p>
              </div>

              {/* Extraction Decision Matrix */}
              <div className="p-3.5 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider block mb-2">
                  Extraction Feasibility Decision Logic
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-sm bg-emerald-950/40 border border-emerald-800">
                    <span className="text-emerald-400 font-bold block">MANUAL CREW FEASIBLE</span>
                    <span className="text-zinc-300 block mt-1 font-sans">
                      • H2O &gt; 600 ppm<br />
                      • Resistance &le; 320 N<br />
                      • Toxicity: SAFE<br />
                      • Cavity: STABLE
                    </span>
                  </div>
                  <div className="p-2.5 rounded-sm bg-amber-950/40 border border-amber-800">
                    <span className="text-amber-400 font-bold block">ROBOTIC ONLY</span>
                    <span className="text-zinc-300 block mt-1 font-sans">
                      • H2O &gt; 300 ppm<br />
                      • High resistance or cryogenic hazard<br />
                      • Safe for autonomous tracked excavator
                    </span>
                  </div>
                  <div className="p-2.5 rounded-sm bg-rose-950/40 border border-rose-800">
                    <span className="text-rose-400 font-bold block">NO EXTRACTION / UNVIABLE</span>
                    <span className="text-zinc-300 block mt-1 font-sans">
                      • H2O &lt; 300 ppm OR<br />
                      • Severe toxic vent (NH3 &gt; 50 ppm) OR<br />
                      • Collapse cavity hazard
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: TELEMETRY API & SCHEMA */}
          {activeTab === 'API_SCHEMA' && (
            <div className="space-y-4 animate-in fade-in duration-100 font-mono">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  BioCoreTelemetry JSON Schema Specification
                </span>
                <button
                  onClick={handleCopySchema}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#006BB3]" />}
                  <span>{copied ? 'COPIED TO CLIPBOARD' : 'COPY JSON SCHEMA'}</span>
                </button>
              </div>

              {/* REST API Endpoints */}
              <div className="p-3.5 rounded-sm bg-[#0A0A0A] border border-zinc-800">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block mb-2">
                  Server REST API Endpoints
                </span>
                <div className="space-y-2 text-[11px]">
                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px]">POST</span>
                    <div>
                      <code className="text-zinc-200">/api/telemetry/ingest</code>
                      <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                        Accepts raw telemetry payload, executes bioastronautics quantization engine, and returns fully computed risk metrics.
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px]">POST</span>
                    <div>
                      <code className="text-zinc-200">/api/ai/briefing</code>
                      <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                        Generates a structured Gemini 3.7 Flash AI Flight Director tactical briefing with Go/No-Go rationales and bioastronautics checklists.
                      </p>
                    </div>
                  </div>

                  <div className="p-2 rounded-sm bg-[#050505] border border-zinc-900 flex items-start gap-2">
                    <span className="px-1.5 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded text-[10px]">POST</span>
                    <div>
                      <code className="text-zinc-200">/api/ai/chat</code>
                      <p className="text-[10px] text-zinc-400 font-sans mt-0.5">
                        Interactive conversational agent grounded in lunar polar physics, xEMU suit dynamics, and NASA SDT guidelines.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: NASA PLANETARY GROUNDING */}
          {activeTab === 'GROUNDING' && (
            <div className="space-y-4 animate-in fade-in duration-100 font-mono text-[11px]">
              <div className="p-4 rounded-sm bg-[#0A0A0A] border border-zinc-800 space-y-3">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-purple-400" />
                  <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                    NASA Artemis SDT &amp; Lunar Sourcebook Planetary Reference Constants
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-300 font-sans text-xs">
                  <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-900 space-y-1">
                    <span className="font-mono text-sky-400 font-bold block text-[11px]">PERMANENTLY SHADOWED REGIONS (PSRs)</span>
                    <p className="text-[11px] text-zinc-400">
                      Located in high-latitude craters (80°S to 90°S) where low solar obliquity (1.54°) creates topographical shadows that have remained shielded for &gt;2 billion years.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-900 space-y-1">
                    <span className="font-mono text-emerald-400 font-bold block text-[11px]">SURFACE VACUUM &amp; OUTGASSING</span>
                    <p className="text-[11px] text-zinc-400">
                      Ambient lunar pressure is 10⁻¹⁰ to 10⁻⁷ Pa. Plumes from ISRU thermal extraction or sub-surface venting transiently elevate pressure to 10⁻⁵ Pa. Armstrong limit for blood ebullism is 6.3 kPa.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-900 space-y-1">
                    <span className="font-mono text-amber-400 font-bold block text-[11px]">RADAR DIELECTRIC SIGNATURES</span>
                    <p className="text-[11px] text-zinc-400">
                      • Dry Lunar Regolith: ε = 2.7 - 2.9<br />
                      • Pure Water Ice: ε = 3.15<br />
                      • Ice-Rich Permafrost (&gt;20% ice): ε = 3.4 - 4.4<br />
                      • Subsurface Void / Hollow Cavity: ε &lt; 2.0
                    </p>
                  </div>

                  <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-900 space-y-1">
                    <span className="font-mono text-rose-400 font-bold block text-[11px]">REGOLITH DUST SILICOSIS</span>
                    <p className="text-[11px] text-zinc-400">
                      Lunar dust is jagged and unweathered with sharp aspect ratios and reactive dangling iron bonds. Electrostatic levitation causes adherence to helmet visors and airlock seals.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-4 py-2.5 bg-[#050505] border-t border-zinc-800 flex items-center justify-between text-[11px] font-mono text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span>SPECIFICATION REVISION 1.0.4 • NASA ARTEMIS III / IV / V</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1 rounded-sm bg-[#005288] hover:bg-[#006BB3] text-white font-medium transition-colors"
          >
            CLOSE SPECIFICATIONS
          </button>
        </div>

      </div>
    </div>
  );
};
