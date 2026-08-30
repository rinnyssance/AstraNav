import {
  BioCoreTelemetry,
  InstrumentStatus,
  ThermalRiskLevel,
  ToxicityRiskLevel,
  VoidRiskLevel,
  RadiationRiskLevel,
  MissionGoNoGo,
} from '../types';

export function calculateBioMetrics(
  raw: Omit<BioCoreTelemetry, 'computed'>
): BioCoreTelemetry['computed'] {
  const { env, gpr, drill, ngms, suit_consumables } = raw;

  // 1. Thermal Risk Logic (Design Doc: surface_temp_k < 40K triggers Cryo-Fatigue warning)
  let thermal_risk: ThermalRiskLevel = 'NOMINAL';
  let thermal_warning_msg = 'Thermal parameters within normal Artemis suit design envelope (40K - 120K).';
  let suit_joint_fatigue_index = 10;

  if (env.surface_temp_k < 35) {
    thermal_risk = 'CRITICAL_CRYO_FATIGUE';
    thermal_warning_msg = `CRITICAL: Extreme cryo-thermal floor (${env.surface_temp_k.toFixed(1)}K < 35K). Immediate bearing elastomer embrittlement risk.`;
    suit_joint_fatigue_index = 95;
  } else if (env.surface_temp_k < 40) {
    thermal_risk = 'CRITICAL_CRYO_FATIGUE';
    thermal_warning_msg = `WARNING: Surface temperature (${env.surface_temp_k.toFixed(1)}K < 40K). Suit joint cryogenic fatigue threshold breached. Max 45m continuous joint flex.`;
    suit_joint_fatigue_index = 75;
  } else if (env.surface_temp_k < 65) {
    thermal_risk = 'ELEVATED';
    thermal_warning_msg = `CAUTION: Low thermal regime (${env.surface_temp_k.toFixed(1)}K). Auxiliary active thermal heating recommended.`;
    suit_joint_fatigue_index = 40;
  }

  // 2. Toxicity Risk Logic (Design Doc: NH3 or H2S > 10ppm = Hazardous for Habitat Pressurization, > 50ppm = Immediate Hazard)
  let toxicity_risk: ToxicityRiskLevel = 'SAFE';
  let toxicity_warning_msg = 'Chemical volatile profile safe for suit ingress and habitat airlock cycling.';

  if (ngms.nh3_ppm > 50 || ngms.h2s_ppm > 50) {
    toxicity_risk = 'LETHAL_IMMEDIATE_HAZARD';
    toxicity_warning_msg = `LETHAL TOXICITY SPIKE: NH3=${ngms.nh3_ppm.toFixed(1)}ppm, H2S=${ngms.h2s_ppm.toFixed(1)}ppm (>50ppm threshold). Immediate abort for crew proximity.`;
  } else if (ngms.nh3_ppm > 10 || ngms.h2s_ppm > 10) {
    toxicity_risk = 'HABITAT_PRESSURIZATION_HAZARD';
    toxicity_warning_msg = `HAZARDOUS CONTAMINANT DETECTED: NH3=${ngms.nh3_ppm.toFixed(1)}ppm, H2S=${ngms.h2s_ppm.toFixed(1)}ppm (>10ppm threshold). Regolith carry-over hazard for airlock pressurization. Scrubbers required.`;
  } else if (ngms.so2_ppm > 15 || ngms.co_ppm > 100) {
    toxicity_risk = 'HABITAT_PRESSURIZATION_HAZARD';
    toxicity_warning_msg = `ELEVATED SECONDARY VOLATILES: SO2=${ngms.so2_ppm.toFixed(1)}ppm, CO=${ngms.co_ppm.toFixed(1)}ppm. Air filtration scrubbing protocol mandatory.`;
  }

  // 3. GPR Void & Structural Collapse Risk
  let void_risk: VoidRiskLevel = 'STABLE';
  let void_warning_msg = 'Subsurface regolith consolidated. Dielectric profile indicates structural stability.';

  if (gpr.void_detected) {
    if (gpr.void_depth_m !== null && gpr.void_depth_m <= 1.8) {
      void_risk = 'CRITICAL_COLLAPSE_RISK';
      void_warning_msg = `CRITICAL GPR VOID DETECTED at shallow depth (${gpr.void_depth_m.toFixed(1)}m, est. volume ~${(gpr.void_volume_m3 || 1.2).toFixed(1)}m³). High risk of regolith breach under crewed rover load (1.8 tonnes).`;
    } else {
      void_risk = 'MODERATE_RISK';
      void_warning_msg = `Deep acoustic cavity/void detected at ${(gpr.void_depth_m || 2.5).toFixed(1)}m. Monitor geotechnical bearing capacity during heavy drilling.`;
    }
  } else if (gpr.collapse_hazard_score > 60) {
    void_risk = 'MODERATE_RISK';
    void_warning_msg = `Unconsolidated porous regolith layer detected. High slip risk on steep slopes.`;
  }

  // 4. Radiation Risk & Solar Particle Event (SPE) Logic
  let radiation_risk: RadiationRiskLevel = 'LOW';
  let radiation_warning_msg = 'GCR background dose rate within Artemis 30-day mission limits.';
  let spe_active = false;

  const speFlux = env.spe_intensity_protons_cm2_sr || 0;
  if (speFlux > 100 || env.radiation_dose_rate_msv_hr > 1.0) {
    radiation_risk = 'CRITICAL_SPE_ABORT';
    radiation_warning_msg = `SOLAR PARTICLE EVENT (SPE) ALERT: Proton flux ${speFlux.toFixed(1)} p+/cm²/sr. High Acute Radiation Syndrome risk. Immediate storm shelter ingress mandated.`;
    spe_active = true;
  } else if (speFlux > 10 || env.radiation_dose_rate_msv_hr > 0.35) {
    radiation_risk = 'HIGH_EXPOSURE';
    radiation_warning_msg = `Elevated energetic proton flux (${speFlux.toFixed(1)} p+/cm²/sr) & dose rate (${env.radiation_dose_rate_msv_hr.toFixed(3)} mSv/hr). Accelerate return traverse.`;
    spe_active = true;
  } else if (env.radiation_dose_rate_msv_hr > 0.12) {
    radiation_risk = 'MODERATE';
    radiation_warning_msg = `Moderate cosmic ray background (${env.radiation_dose_rate_msv_hr.toFixed(3)} mSv/hr). Standard shielding protocols apply.`;
  }

  // 5. Dust Particulate Density Hazard (Lunar Silicosis / Abrasive Joint Wear)
  let dust_hazard = false;
  let dust_warning_msg = 'Regolith particulate density nominal (< 5,000 p/m³).';
  const dustDensity = env.dust_particulate_density_pm3 || 0;

  if (dustDensity > 25000) {
    dust_hazard = true;
    dust_warning_msg = `CRITICAL ABRASIVE DUST PLUME: ${dustDensity.toLocaleString()} particles/m³. Severe joint seal abrasion & airlock contamination hazard.`;
  } else if (dustDensity > 8000) {
    dust_hazard = true;
    dust_warning_msg = `ELEVATED DUST LEVITATION: ${dustDensity.toLocaleString()} particles/m³. Electrostatic particulate adhesion on helmet visor and suit bearings.`;
  }

  // 6. Suit Consumables & Walkback Limit (Minutes)
  // Consumable remaining limits based on 8hr baseline (480 mins)
  const defaultSuit: BioCoreTelemetry['suit_consumables'] = suit_consumables || {
    o2_remaining_percent: 92,
    o2_pressure_kpa: 29.6,
    co2_scrubber_remaining_hrs: 6.4,
    battery_remaining_percent: 85,
    thermal_coolant_water_kg: 3.8,
    status: 'NOMINAL',
  };

  const o2Mins = Math.round((defaultSuit.o2_remaining_percent / 100) * 480);
  const co2Mins = Math.round(defaultSuit.co2_scrubber_remaining_hrs * 60);
  const battMins = Math.round((defaultSuit.battery_remaining_percent / 100) * 420);
  const coolantMins = Math.round((defaultSuit.thermal_coolant_water_kg / 4.5) * 480);

  // Walkback reserve calculation: keep 30% margin for emergency walkback
  const primaryConsumableMin = Math.min(o2Mins, co2Mins, battMins, coolantMins);
  const walkback_limit_minutes = Math.max(0, Math.round(primaryConsumableMin * 0.7));

  // 7. Safe EVA Window Calculation (Minutes)
  // Max standard EVA = 360 min (6 hours). Reduced by thermal, radiation, dust, toxicity, and suit consumables.
  let safe_eva_window_minutes = Math.min(360, walkback_limit_minutes);

  if (thermal_risk === 'CRITICAL_CRYO_FATIGUE') {
    safe_eva_window_minutes = Math.min(safe_eva_window_minutes, env.surface_temp_k < 35 ? 20 : 45);
  } else if (thermal_risk === 'ELEVATED') {
    safe_eva_window_minutes = Math.min(safe_eva_window_minutes, 150);
  }

  if (radiation_risk === 'CRITICAL_SPE_ABORT') {
    safe_eva_window_minutes = 0;
  } else if (radiation_risk === 'HIGH_EXPOSURE') {
    safe_eva_window_minutes = Math.min(safe_eva_window_minutes, 45);
  } else if (radiation_risk === 'MODERATE') {
    safe_eva_window_minutes = Math.min(safe_eva_window_minutes, 180);
  }

  if (toxicity_risk === 'LETHAL_IMMEDIATE_HAZARD') {
    safe_eva_window_minutes = 0;
  } else if (toxicity_risk === 'HABITAT_PRESSURIZATION_HAZARD') {
    safe_eva_window_minutes = Math.min(safe_eva_window_minutes, 90);
  }

  if (dustDensity > 25000) {
    safe_eva_window_minutes = Math.min(safe_eva_window_minutes, 60);
  }

  // 8. Net ISRU Yield Formula: Net_Yield = H2O_ppm - (Drill_Resistance * Depth_Factor)
  const depthFactor = Math.max(0.1, drill.drill_depth_cm / 100);
  const net_isru_yield_index = Math.max(0, Math.round(ngms.h2o_ppm - (drill.resistance_n * depthFactor)));

  // 9. Human Consumption Days Yield
  // Baseline: 2 astronauts consuming 2.5 L of water / day = 5.0 L/day (5,000 g/day).
  const batchMassGrams = 350000; // 350 kg standard ISRU payload hopper
  const extractedWaterGrams = batchMassGrams * (ngms.h2o_ppm / 1000000);
  const human_consumption_days_yield = Number((extractedWaterGrams / 5000).toFixed(1));

  // 10. Extraction Recommendation
  let extraction_recommendation: BioCoreTelemetry['computed']['extraction_recommendation'] = 'NO_EXTRACTION_UNVIABLE';
  if (ngms.h2o_ppm > 600 && drill.resistance_n <= 320 && void_risk !== 'CRITICAL_COLLAPSE_RISK' && toxicity_risk === 'SAFE' && !spe_active) {
    extraction_recommendation = 'MANUAL_CREW_FEASIBLE';
  } else if (ngms.h2o_ppm > 300) {
    extraction_recommendation = 'ROBOTIC_ONLY';
  } else {
    extraction_recommendation = 'NO_EXTRACTION_UNVIABLE';
  }

  // 11. Master Go / No-Go Decision
  let mission_go_no_go: MissionGoNoGo = 'GO';
  if (
    toxicity_risk === 'LETHAL_IMMEDIATE_HAZARD' ||
    void_risk === 'CRITICAL_COLLAPSE_RISK' ||
    radiation_risk === 'CRITICAL_SPE_ABORT' ||
    env.surface_temp_k < 32 ||
    safe_eva_window_minutes === 0 ||
    defaultSuit.o2_remaining_percent < 15 ||
    defaultSuit.battery_remaining_percent < 15
  ) {
    mission_go_no_go = 'NO_GO';
  } else if (
    toxicity_risk === 'HABITAT_PRESSURIZATION_HAZARD' ||
    thermal_risk === 'CRITICAL_CRYO_FATIGUE' ||
    void_risk === 'MODERATE_RISK' ||
    radiation_risk === 'HIGH_EXPOSURE' ||
    radiation_risk === 'MODERATE' ||
    dust_hazard ||
    safe_eva_window_minutes < 120 ||
    defaultSuit.o2_remaining_percent < 35 ||
    defaultSuit.co2_scrubber_remaining_hrs < 2.0
  ) {
    mission_go_no_go = 'CONDITIONAL_GO';
  }

  return {
    thermal_risk,
    thermal_warning_msg,
    toxicity_risk,
    toxicity_warning_msg,
    void_risk,
    void_warning_msg,
    radiation_risk,
    radiation_warning_msg,
    spe_active,
    dust_hazard,
    dust_warning_msg,
    safe_eva_window_minutes,
    walkback_limit_minutes,
    human_consumption_days_yield,
    net_isru_yield_index,
    mission_go_no_go,
    suit_joint_fatigue_index,
    extraction_recommendation,
  };
}

export function evaluateInstrumentStatuses(data: {
  env: BioCoreTelemetry['env'];
  gpr: BioCoreTelemetry['gpr'];
  drill: BioCoreTelemetry['drill'];
  ngms: BioCoreTelemetry['ngms'];
  suit_consumables?: BioCoreTelemetry['suit_consumables'];
}): {
  envStatus: InstrumentStatus;
  gprStatus: InstrumentStatus;
  drillStatus: InstrumentStatus;
  ngmsStatus: InstrumentStatus;
  suitStatus: InstrumentStatus;
} {
  // Env status
  let envStatus: InstrumentStatus = 'NOMINAL';
  if (
    data.env.surface_temp_k < 35 || 
    data.env.radiation_dose_rate_msv_hr > 0.35 ||
    (data.env.spe_intensity_protons_cm2_sr || 0) > 100 ||
    (data.env.dust_particulate_density_pm3 || 0) > 25000
  ) {
    envStatus = 'CRITICAL';
  } else if (
    data.env.surface_temp_k < 40 || 
    data.env.radiation_dose_rate_msv_hr > 0.12 ||
    (data.env.spe_intensity_protons_cm2_sr || 0) > 10 ||
    (data.env.dust_particulate_density_pm3 || 0) > 8000
  ) {
    envStatus = 'CAUTION';
  }

  // GPR status
  let gprStatus: InstrumentStatus = 'NOMINAL';
  if (data.gpr.void_detected && (data.gpr.void_depth_m || 3) < 2.0) {
    gprStatus = 'CRITICAL';
  } else if (data.gpr.void_detected || data.gpr.collapse_hazard_score > 50) {
    gprStatus = 'CAUTION';
  }

  // Drill status
  let drillStatus: InstrumentStatus = 'NOMINAL';
  if (data.drill.resistance_n > 600 || data.drill.bit_temp_k > 280) {
    drillStatus = 'CRITICAL';
  } else if (data.drill.resistance_n > 380 || data.drill.bit_temp_k > 220) {
    drillStatus = 'CAUTION';
  }

  // NGMS status
  let ngmsStatus: InstrumentStatus = 'NOMINAL';
  if (data.ngms.nh3_ppm > 50 || data.ngms.h2s_ppm > 50) {
    ngmsStatus = 'CRITICAL';
  } else if (data.ngms.nh3_ppm > 10 || data.ngms.h2s_ppm > 10 || data.ngms.so2_ppm > 15) {
    ngmsStatus = 'CAUTION';
  }

  // Suit consumables status
  let suitStatus: InstrumentStatus = 'NOMINAL';
  if (data.suit_consumables) {
    if (data.suit_consumables.o2_remaining_percent < 20 || data.suit_consumables.battery_remaining_percent < 20 || data.suit_consumables.co2_scrubber_remaining_hrs < 1.0) {
      suitStatus = 'CRITICAL';
    } else if (data.suit_consumables.o2_remaining_percent < 40 || data.suit_consumables.battery_remaining_percent < 40 || data.suit_consumables.co2_scrubber_remaining_hrs < 2.5) {
      suitStatus = 'CAUTION';
    }
  }

  return { envStatus, gprStatus, drillStatus, ngmsStatus, suitStatus };
}
