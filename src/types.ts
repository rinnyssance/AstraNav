export type InstrumentStatus = 'NOMINAL' | 'CAUTION' | 'CRITICAL' | 'OFFLINE';

export type ThermalRiskLevel = 'NOMINAL' | 'ELEVATED' | 'CRITICAL_CRYO_FATIGUE';
export type ToxicityRiskLevel = 'SAFE' | 'HABITAT_PRESSURIZATION_HAZARD' | 'LETHAL_IMMEDIATE_HAZARD';
export type VoidRiskLevel = 'STABLE' | 'MODERATE_RISK' | 'CRITICAL_COLLAPSE_RISK';
export type RadiationRiskLevel = 'LOW' | 'MODERATE' | 'HIGH_EXPOSURE' | 'CRITICAL_SPE_ABORT';
export type MissionGoNoGo = 'GO' | 'CONDITIONAL_GO' | 'NO_GO';

export interface LayerProfile {
  depth_m: number;
  dielectric: number;
  radar_reflectivity_db: number;
  layer_type: 'Regolith' | 'Ice-Regolith Matrix' | 'High-Purity Ice' | 'Cavity/Void' | 'Basement Rock';
}

export interface MassPeak {
  mz: number;
  intensity_cps: number;
  molecule: string;
  hazard_class: 'Resource' | 'Toxin' | 'Volatile' | 'Inert';
  detected_ppm: number;
}

/**
 * Artemis xEMU Suit Consumables Subsystem
 * Units & Expected Range:
 * - o2_remaining_percent: % (0 to 100%). Nominal 8-hr EVA.
 * - o2_pressure_kpa: kPa (20.0 to 32.0 kPa). Normal 29.6 kPa (4.3 psi).
 * - co2_scrubber_remaining_hrs: hours (0.0 to 8.0 hrs). Limit < 1.0 hr.
 * - battery_remaining_percent: % (0 to 100%). PSR active heating draws 150-250W.
 * - thermal_coolant_water_kg: kg (0.0 to 4.5 kg). Sublimator feed for metabolic heat rejection.
 */
export interface SuitConsumables {
  o2_remaining_percent: number;
  o2_pressure_kpa: number;
  co2_scrubber_remaining_hrs: number;
  battery_remaining_percent: number;
  thermal_coolant_water_kg: number;
  status: InstrumentStatus;
}

export interface BioCoreTelemetry {
  id: string;
  timestamp: string;
  mission_elapsed_time: string;
  siteId: string;
  siteName: string;
  craterRegion: 'Shackleton' | 'Haworth' | 'Faustini' | 'Shoemaker' | 'Nobile';
  coordinates: {
    lat: number;
    lon: number;
    depth_m: number;
    elevation_m: number;
    slope_deg: number;
  };
  // 1. Environmental Monitoring (Atmospheric, Radiation, Dust)
  env: {
    surface_temp_k: number; // Cryo-fatigue if < 40K (Range: 25K - 140K)
    subsurface_temp_k: number;
    radiation_dose_rate_msv_hr: number; // mSv/hr (Range: 0.01 - 5.0+ mSv/hr)
    accumulated_radiation_msv: number;
    cosmic_ray_flux_cpm: number;
    atmospheric_pressure_pa: number; // Pascal (Pa). Range: 1e-10 Pa (lunar ambient) to 1e-3 Pa (plumes/leakage)
    dust_particulate_density_pm3: number; // particles/m^3 (Range: 0 - 50,000+). Abrasive silicosis hazard.
    spe_intensity_protons_cm2_sr: number; // protons/cm^2/sr (>10 MeV). Range: 0.1 - 10,000+ (Solar Particle Event)
    status: InstrumentStatus;
  };
  // 2. GPR Subsurface Radar
  gpr: {
    dielectric_constant: number;
    void_detected: boolean;
    void_depth_m: number | null;
    void_volume_m3: number | null;
    collapse_hazard_score: number; // 0-100
    layers: LayerProfile[];
    status: InstrumentStatus;
  };
  // 3. Drill Subsystem
  drill: {
    state: 'IDLE' | 'DRILLING' | 'CORE_EXTRACTION' | 'ABORTED';
    resistance_n: number;
    bit_temp_k: number;
    drill_depth_cm: number;
    torque_nm: number;
    penetration_rate_mm_s: number;
    energy_joules: number;
    drill_energy_to_yield_ratio: number; // J/g H2O
    status: InstrumentStatus;
  };
  // 4. NGMS Mass Spectrometer
  ngms: {
    h2o_ppm: number;
    nh3_ppm: number; // >10 warning, >50 immediate hazard
    h2s_ppm: number; // >10 warning, >50 immediate hazard
    co2_ppm: number;
    co_ppm: number;
    ch4_ppm: number;
    so2_ppm: number;
    peaks: MassPeak[];
    status: InstrumentStatus;
  };
  // 5. Suit Consumables Tracking (O2, CO2, Battery, Coolant)
  suit_consumables: SuitConsumables;
  // Derived Deterministic Bioastronautics Calculations
  computed: {
    thermal_risk: ThermalRiskLevel;
    thermal_warning_msg: string;
    toxicity_risk: ToxicityRiskLevel;
    toxicity_warning_msg: string;
    void_risk: VoidRiskLevel;
    void_warning_msg: string;
    radiation_risk: RadiationRiskLevel;
    radiation_warning_msg: string;
    spe_active: boolean;
    dust_hazard: boolean;
    dust_warning_msg: string;
    safe_eva_window_minutes: number;
    walkback_limit_minutes: number;
    human_consumption_days_yield: number;
    net_isru_yield_index: number;
    mission_go_no_go: MissionGoNoGo;
    suit_joint_fatigue_index: number; // 0-100%
    extraction_recommendation: 'MANUAL_CREW_FEASIBLE' | 'ROBOTIC_ONLY' | 'NO_EXTRACTION_UNVIABLE';
  };
}

export interface WaypointNode {
  id: string;
  waypointCode: string;
  name: string;
  crater: string;
  x: number; // Map percentage 0-100
  y: number; // Map percentage 0-100
  lat: number;
  lon: number;
  elevation_m: number;
  shadow_stability_score: number;
  telemetry: BioCoreTelemetry;
}

export interface AIBriefingResponse {
  flightDirectorBriefing: string;
  overallGoNoGo: MissionGoNoGo;
  toxicHazardAnalysis: string;
  resourcePotential: {
    h2o_summary: string;
    consumption_days_estimate: number;
    mining_method_recommendation: string;
  };
  traverseRecommendation: string;
  criticalAlerts: string[];
  bioastronauticsChecklist: string[];
  groundingReference: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  timestamp: string;
  text: string;
  briefingData?: Partial<AIBriefingResponse>;
}
