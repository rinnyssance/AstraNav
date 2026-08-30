#!/usr/bin/env python3
"""
AstraNav PSR: Lunar South Pole Rover Traverse Telemetry Simulator
================================================================
Simulates an autonomous or crew-support robotic scout rover traversing 
Permanently Shadowed Regions (PSRs) at the Lunar South Pole (e.g., Shackleton, 
Faustini, Haworth, Shoemaker craters).

Generates realistic time-stamped JSON telemetry data conforming to the 
BioCoreTelemetry schema for:
  - Environmental Sensors (Cryo-temperatures, Atmospheric Pressure, Dust Density, GCR/SPE Radiation)
  - Ground Penetrating Radar (GPR) (Dielectric profiles, Subsurface Void Cavities, Collapse Hazard)
  - Robotic Deep Drill (Resistance, Bit Temp, Torque, Penetration Rate)
  - Next-Gen Mass Spectrometer (NGMS) (H2O Volatiles, Toxic NH3/H2S/SO2, Spectral Peaks)
  - xEMU Spacesuit Consumables (O2 Store, Pressure, CO2 Scrubber, Battery, Coolant)

Usage:
  python3 simulate_rover_traverse.py [--steps 25] [--output simulated_traverse_telemetry.json] [--post-url http://localhost:3000/api/telemetry/ingest]
"""

import json
import math
import random
import time
import argparse
from datetime import datetime, timezone, timedelta

# Definition of realistic terrain segments along the traverse
TERRAIN_SEGMENTS = [
    {
        "name": "Shackleton Crater Rim Crest",
        "crater": "Shackleton",
        "start_lat": -89.70, "start_lon": 110.0, "elevation": 1450,
        "terrain_type": "SUNLIT_REGOLITH_RIDGE",
        "temp_range": (115.0, 130.0),
        "ice_purity_ppm": (20, 90),
        "toxic_nh3_ppm": (0.1, 0.5),
        "toxic_h2s_ppm": (0.05, 0.2),
        "dielectric_range": (2.7, 2.9),
        "void_probability": 0.0,
        "drill_resistance": (110, 180),
        "dust_density_range": (1000, 3000),
        "spe_flux_range": (0.2, 0.6),
    },
    {
        "name": "Upper Shadow Ingress Ramp",
        "crater": "Shackleton",
        "start_lat": -89.76, "start_lon": 113.5, "elevation": 1120,
        "terrain_type": "SHADOW_TRANSITION_SLOPE",
        "temp_range": (60.0, 85.0),
        "ice_purity_ppm": (250, 600),
        "toxic_nh3_ppm": (1.0, 3.5),
        "toxic_h2s_ppm": (0.4, 1.2),
        "dielectric_range": (3.0, 3.3),
        "void_probability": 0.05,
        "drill_resistance": (200, 310),
        "dust_density_range": (3000, 7500),
        "spe_flux_range": (0.5, 1.2),
    },
    {
        "name": "Mid-PSR Subsurface Cavity & Collapse Zone",
        "crater": "Shackleton",
        "start_lat": -89.88, "start_lon": 118.4, "elevation": 680,
        "terrain_type": "UNCONSOLIDATED_POROUS_VOID",
        "temp_range": (42.0, 50.0),
        "ice_purity_ppm": (180, 450),
        "toxic_nh3_ppm": (2.0, 5.0),
        "toxic_h2s_ppm": (0.8, 1.8),
        "dielectric_range": (1.3, 1.9), # Hollow void signature
        "void_probability": 0.90, # High probability of void
        "drill_resistance": (35, 90), # Drop in mechanical resistance
        "dust_density_range": (6000, 14000),
        "spe_flux_range": (1.0, 2.5),
    },
    {
        "name": "Faustini Volatile Vent & Outgassing Pocket",
        "crater": "Faustini",
        "start_lat": -89.62, "start_lon": 128.0, "elevation": 540,
        "terrain_type": "TOXIC_VOLATILE_FISSURE",
        "temp_range": (45.0, 55.0),
        "ice_purity_ppm": (800, 1600),
        "toxic_nh3_ppm": (35.0, 85.0), # Lethal / habitat contamination spike
        "toxic_h2s_ppm": (18.0, 45.0),
        "dielectric_range": (3.2, 3.6),
        "void_probability": 0.15,
        "drill_resistance": (280, 420),
        "dust_density_range": (22000, 38000), # Severe dust plume
        "spe_flux_range": (1.5, 3.5),
    },
    {
        "name": "Faustini High-Purity Permafrost Basin",
        "crater": "Faustini",
        "start_lat": -89.68, "start_lon": 135.5, "elevation": 720,
        "terrain_type": "HIGH_PURITY_ICE_MATRIX",
        "temp_range": (48.0, 58.0),
        "ice_purity_ppm": (2800, 5200), # Prime ISRU target!
        "toxic_nh3_ppm": (1.2, 3.8),
        "toxic_h2s_ppm": (0.3, 0.9),
        "dielectric_range": (3.9, 4.4), # High dielectric of ice
        "void_probability": 0.0,
        "drill_resistance": (240, 360),
        "dust_density_range": (1500, 4000),
        "spe_flux_range": (0.6, 1.4),
    },
    {
        "name": "Haworth Deep Ultra-Cold Cryo-Floor",
        "crater": "Haworth",
        "start_lat": -89.42, "start_lon": 104.0, "elevation": 290,
        "terrain_type": "DEEP_CRYO_FLOOR_CRITICAL_COLD",
        "temp_range": (28.0, 34.5), # Extreme cryogenic cold < 35K
        "ice_purity_ppm": (1900, 3400),
        "toxic_nh3_ppm": (4.5, 12.0),
        "toxic_h2s_ppm": (1.5, 4.0),
        "dielectric_range": (3.7, 4.2),
        "void_probability": 0.10,
        "drill_resistance": (580, 820), # Cryogenic permafrost hard rock
        "dust_density_range": (4000, 9000),
        "spe_flux_range": (1.2, 2.8),
    },
    {
        "name": "Shoemaker Ridge Solar Storm Corridor",
        "crater": "Shoemaker",
        "start_lat": -88.90, "start_lon": 45.0, "elevation": 1200,
        "terrain_type": "SOLAR_PARTICLE_EVENT_EXPOSURE",
        "temp_range": (80.0, 105.0),
        "ice_purity_ppm": (120, 380),
        "toxic_nh3_ppm": (0.5, 2.0),
        "toxic_h2s_ppm": (0.1, 0.5),
        "dielectric_range": (2.8, 3.1),
        "void_probability": 0.0,
        "drill_resistance": (160, 240),
        "dust_density_range": (3000, 6000),
        "spe_flux_range": (120.0, 380.0), # Severe SPE storm event!
    }
]


def generate_gpr_layers(dielectric_mean, is_void):
    """Generate realistic 4-depth subsurface stratigraphy layers for GPR."""
    if is_void:
        return [
            {"depth_m": 0.3, "dielectric": round(random.uniform(2.5, 2.8), 2), "radar_reflectivity_db": -24, "layer_type": "Regolith"},
            {"depth_m": 1.2, "dielectric": round(random.uniform(1.05, 1.35), 2), "radar_reflectivity_db": +6, "layer_type": "Cavity/Void"},
            {"depth_m": 2.6, "dielectric": round(random.uniform(2.1, 2.4), 2), "radar_reflectivity_db": -18, "layer_type": "Regolith"},
            {"depth_m": 4.2, "dielectric": round(random.uniform(4.6, 5.0), 2), "radar_reflectivity_db": -14, "layer_type": "Basement Rock"}
        ]
    elif dielectric_mean > 3.7:
        # High purity ice
        return [
            {"depth_m": 0.2, "dielectric": round(random.uniform(2.7, 2.9), 2), "radar_reflectivity_db": -26, "layer_type": "Regolith"},
            {"depth_m": 0.9, "dielectric": round(dielectric_mean + random.uniform(-0.1, 0.2), 2), "radar_reflectivity_db": -6, "layer_type": "High-Purity Ice"},
            {"depth_m": 2.5, "dielectric": round(dielectric_mean + random.uniform(0.0, 0.3), 2), "radar_reflectivity_db": -5, "layer_type": "High-Purity Ice"},
            {"depth_m": 4.4, "dielectric": round(random.uniform(4.8, 5.2), 2), "radar_reflectivity_db": -10, "layer_type": "Basement Rock"}
        ]
    else:
        # Ice-regolith matrix
        return [
            {"depth_m": 0.4, "dielectric": round(random.uniform(2.6, 2.8), 2), "radar_reflectivity_db": -25, "layer_type": "Regolith"},
            {"depth_m": 1.4, "dielectric": round(dielectric_mean, 2), "radar_reflectivity_db": -16, "layer_type": "Ice-Regolith Matrix"},
            {"depth_m": 2.8, "dielectric": round(dielectric_mean + 0.2, 2), "radar_reflectivity_db": -14, "layer_type": "Ice-Regolith Matrix"},
            {"depth_m": 4.5, "dielectric": round(random.uniform(4.7, 5.1), 2), "radar_reflectivity_db": -11, "layer_type": "Basement Rock"}
        ]


def simulate_traverse(total_steps=20, time_interval_seconds=300):
    """
    Simulates rover traversal across varying lunar terrain zones.
    Returns a list of BioCoreTelemetry dictionaries.
    """
    telemetry_records = []
    base_time = datetime.now(timezone.utc) - timedelta(seconds=total_steps * time_interval_seconds)
    accumulated_radiation = 0.15

    # Spacesuit initial status (for EVA crew companion)
    o2_pct = 98.0
    co2_hrs = 7.8
    batt_pct = 95.0
    coolant_kg = 4.3

    for step in range(total_steps):
        step_time = base_time + timedelta(seconds=step * time_interval_seconds)
        hours = (step * time_interval_seconds) // 3600
        minutes = ((step * time_interval_seconds) % 3600) // 60
        seconds = (step * time_interval_seconds) % 60
        met_str = f"MET {hours:02d}:{minutes:02d}:{seconds:02d}"

        # Determine terrain segment
        seg_idx = min(int((step / total_steps) * len(TERRAIN_SEGMENTS)), len(TERRAIN_SEGMENTS) - 1)
        seg = TERRAIN_SEGMENTS[seg_idx]

        # Coordinates with slight random walk
        progress_in_seg = (step / max(1, total_steps / len(TERRAIN_SEGMENTS))) % 1.0
        lat = seg["start_lat"] + (random.uniform(-0.02, 0.02) * progress_in_seg)
        lon = seg["start_lon"] + (random.uniform(-0.1, 0.5) * progress_in_seg)
        elevation = seg["elevation"] + random.randint(-25, 25)
        slope = round(random.uniform(2.5, 14.2), 1)

        # Environmental Sensors
        surface_temp = round(random.uniform(seg["temp_range"][0], seg["temp_range"][1]), 1)
        subsurface_temp = round(surface_temp - random.uniform(2.0, 6.0), 1)

        # Radiation and SPE
        spe_flux = round(random.uniform(seg["spe_flux_range"][0], seg["spe_flux_range"][1]), 1)
        dose_rate = 0.040 + (spe_flux * 0.003) + (random.uniform(0.005, 0.025) if surface_temp < 50 else 0.0)
        accumulated_radiation += (dose_rate * (time_interval_seconds / 3600))
        cosmic_flux = int(24 + (spe_flux * 1.5) + random.randint(0, 8))

        # Atmospheric pressure (Pa) - spikes during volatile outgassing
        if "VOLATILE" in seg["terrain_type"]:
            atm_press = round(random.uniform(1.5e-5, 6.8e-5), 8)
        else:
            atm_press = round(random.uniform(8.0e-10, 4.5e-9), 11)

        # Dust particulate density
        dust_density = random.randint(seg["dust_density_range"][0], seg["dust_density_range"][1])

        # GPR & Void Mechanics
        is_void = random.random() < seg["void_probability"]
        if is_void:
            dielectric = round(random.uniform(1.2, 1.8), 2)
            void_depth = round(random.uniform(0.8, 1.7), 1)
            void_vol = round(random.uniform(1.5, 4.8), 1)
            collapse_score = random.randint(85, 98)
            gpr_status = "CRITICAL"
        else:
            dielectric = round(random.uniform(seg["dielectric_range"][0], seg["dielectric_range"][1]), 2)
            void_depth = None
            void_vol = None
            collapse_score = random.randint(5, 38)
            gpr_status = "CAUTION" if collapse_score > 30 else "NOMINAL"

        gpr_layers = generate_gpr_layers(dielectric, is_void)

        # NGMS Spectrometry Volatiles
        h2o_ppm = round(random.uniform(seg["ice_purity_ppm"][0], seg["ice_purity_ppm"][1]), 1)
        nh3_ppm = round(random.uniform(seg["toxic_nh3_ppm"][0], seg["toxic_nh3_ppm"][1]), 1)
        h2s_ppm = round(random.uniform(seg["toxic_h2s_ppm"][0], seg["toxic_h2s_ppm"][1]), 1)
        co2_ppm = round(h2o_ppm * random.uniform(0.04, 0.08) + random.uniform(10, 40), 1)
        co_ppm = round(co2_ppm * 0.35 + random.uniform(2, 10), 1)
        ch4_ppm = round(h2o_ppm * 0.008 + random.uniform(0.5, 4.0), 1)
        so2_ppm = round(h2s_ppm * 0.45 + (random.uniform(5.0, 18.0) if nh3_ppm > 20 else 0.1), 1)

        ngms_status = "CRITICAL" if (nh3_ppm > 50 or h2s_ppm > 50) else ("CAUTION" if (nh3_ppm > 10 or h2s_ppm > 10) else "NOMINAL")

        # NGMS Peaks
        peaks = [
            {"mz": 18, "intensity_cps": int(h2o_ppm * 12.5), "molecule": "H2O", "hazard_class": "Resource", "detected_ppm": h2o_ppm},
            {"mz": 17, "intensity_cps": int(nh3_ppm * 140.0), "molecule": "NH3", "hazard_class": "Toxin", "detected_ppm": nh3_ppm},
            {"mz": 34, "intensity_cps": int(h2s_ppm * 150.0), "molecule": "H2S", "hazard_class": "Toxin", "detected_ppm": h2s_ppm},
            {"mz": 44, "intensity_cps": int(co2_ppm * 18.0), "molecule": "CO2", "hazard_class": "Volatile", "detected_ppm": co2_ppm},
            {"mz": 28, "intensity_cps": int(co_ppm * 22.0), "molecule": "CO", "hazard_class": "Volatile", "detected_ppm": co_ppm},
        ]
        if so2_ppm > 1.0:
            peaks.append({"mz": 64, "intensity_cps": int(so2_ppm * 85.0), "molecule": "SO2", "hazard_class": "Toxin", "detected_ppm": so2_ppm})

        # Drill Telemetry
        if is_void:
            drill_state = "ABORTED"
            resistance_n = random.randint(30, 80)
            drill_depth = random.randint(30, 50)
            bit_temp = surface_temp + 8.0
            torque = 2.4
            penetration_rate = 4.8
            drill_status = "CRITICAL"
        else:
            drill_state = random.choice(["DRILLING", "CORE_EXTRACTION", "IDLE"])
            resistance_n = random.randint(seg["drill_resistance"][0], seg["drill_resistance"][1])
            drill_depth = random.randint(45, 110)
            bit_temp = round(surface_temp + random.uniform(12.0, 35.0), 1)
            torque = round(resistance_n * 0.035, 1)
            penetration_rate = round(max(0.2, 2.5 - (resistance_n * 0.003)), 1)
            drill_status = "CRITICAL" if (resistance_n > 600 or bit_temp > 280) else ("CAUTION" if resistance_n > 380 else "NOMINAL")

        energy_joules = int(resistance_n * drill_depth * 0.25)
        drill_energy_to_yield_ratio = round((energy_joules / max(10, h2o_ppm)), 1)

        # Environmental Status
        env_status = "CRITICAL" if (surface_temp < 35 or dose_rate > 0.35 or spe_flux > 100 or dust_density > 25000) else (
            "CAUTION" if (surface_temp < 40 or dose_rate > 0.12 or spe_flux > 10 or dust_density > 8000) else "NOMINAL"
        )

        # Spacesuit Consumables Degradation over traverse
        # Cold temperature draws more battery for heating; high activity consumes more O2
        cooling_factor = 1.4 if surface_temp < 40 else 1.0
        o2_pct = max(10.0, round(o2_pct - random.uniform(1.2, 2.4), 1))
        co2_hrs = max(0.5, round(co2_hrs - (time_interval_seconds / 3600) * 0.95, 1))
        batt_pct = max(12.0, round(batt_pct - (random.uniform(1.5, 3.2) * cooling_factor), 1))
        coolant_kg = max(0.5, round(coolant_kg - random.uniform(0.08, 0.16), 1))
        o2_pressure = round(29.6 - (100 - o2_pct) * 0.012, 1)

        suit_status = "CRITICAL" if (o2_pct < 20 or batt_pct < 20 or co2_hrs < 1.0) else (
            "CAUTION" if (o2_pct < 40 or batt_pct < 40 or co2_hrs < 2.5) else "NOMINAL"
        )

        # Assemble Full Telemetry Object
        telemetry_obj = {
            "id": f"TEL-SIM-{step+1:03d}",
            "timestamp": step_time.isoformat(),
            "mission_elapsed_time": met_str,
            "siteId": f"PSR-{seg['crater'].upper()}-P{step+1:02d}",
            "siteName": f"{seg['name']} (Sample #{step+1})",
            "craterRegion": seg["crater"],
            "coordinates": {
                "lat": round(lat, 4),
                "lon": round(lon, 4),
                "depth_m": round(drill_depth / 100, 2),
                "elevation_m": elevation,
                "slope_deg": slope
            },
            "env": {
                "surface_temp_k": surface_temp,
                "subsurface_temp_k": subsurface_temp,
                "radiation_dose_rate_msv_hr": round(dose_rate, 4),
                "accumulated_radiation_msv": round(accumulated_radiation, 3),
                "cosmic_ray_flux_cpm": cosmic_flux,
                "atmospheric_pressure_pa": atm_press,
                "dust_particulate_density_pm3": dust_density,
                "spe_intensity_protons_cm2_sr": spe_flux,
                "status": env_status
            },
            "gpr": {
                "dielectric_constant": dielectric,
                "void_detected": is_void,
                "void_depth_m": void_depth,
                "void_volume_m3": void_vol,
                "collapse_hazard_score": collapse_score,
                "layers": gpr_layers,
                "status": gpr_status
            },
            "drill": {
                "state": drill_state,
                "resistance_n": resistance_n,
                "bit_temp_k": bit_temp,
                "drill_depth_cm": drill_depth,
                "torque_nm": torque,
                "penetration_rate_mm_s": penetration_rate,
                "energy_joules": energy_joules,
                "drill_energy_to_yield_ratio": drill_energy_to_yield_ratio,
                "status": drill_status
            },
            "ngms": {
                "h2o_ppm": h2o_ppm,
                "nh3_ppm": nh3_ppm,
                "h2s_ppm": h2s_ppm,
                "co2_ppm": co2_ppm,
                "co_ppm": co_ppm,
                "ch4_ppm": ch4_ppm,
                "so2_ppm": so2_ppm,
                "peaks": peaks,
                "status": ngms_status
            },
            "suit_consumables": {
                "o2_remaining_percent": o2_pct,
                "o2_pressure_kpa": o2_pressure,
                "co2_scrubber_remaining_hrs": co2_hrs,
                "battery_remaining_percent": batt_pct,
                "thermal_coolant_water_kg": coolant_kg,
                "status": suit_status
            }
        }

        telemetry_records.append(telemetry_obj)

    return telemetry_records


def main():
    parser = argparse.ArgumentParser(description="AstraNav PSR: Lunar Rover Telemetry Simulator")
    parser.add_argument("--steps", type=int, default=24, help="Number of telemetry traverse waypoints to generate")
    parser.add_argument("--interval", type=int, default=300, help="Time interval between waypoints in seconds")
    parser.add_argument("--output", type=str, default="simulated_traverse_telemetry.json", help="Destination JSON file")
    parser.add_argument("--post-url", type=str, default=None, help="Optional HTTP POST URL to stream records to")
    args = parser.parse_args()

    print(f"[*] Simulating AstraNav PSR Lunar South Pole Traverse ({args.steps} waypoints)...")
    records = simulate_traverse(total_steps=args.steps, time_interval_seconds=args.interval)

    # Save to file
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(records, f, indent=2)

    print(f"[+] Successfully generated {len(records)} telemetry logs saved to: {args.output}")
    print(f"[i] Summary of terrain diversity covered:")
    for idx, r in enumerate(records[:5]):
        print(f"    - #{idx+1:02d} [{r['mission_elapsed_time']}] {r['siteName']} | Temp: {r['env']['surface_temp_k']}K | H2O: {r['ngms']['h2o_ppm']}ppm | Dust: {r['env']['dust_particulate_density_pm3']}p/m³ | SPE: {r['env']['spe_intensity_protons_cm2_sr']} p+/cm²")
    if len(records) > 5:
        print(f"    ... and {len(records)-5} more waypoints spanning Shackleton, Faustini, Haworth, and Shoemaker craters.")

    # Optional HTTP Stream to server
    if args.post_url:
        import urllib.request
        print(f"[*] Streaming {len(records)} records to {args.post_url}...")
        for rec in records:
            req = urllib.request.Request(
                args.post_url,
                data=json.dumps(rec).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            try:
                with urllib.request.urlopen(req) as response:
                    print(f"    Posted {rec['id']} -> HTTP {response.status}")
            except Exception as e:
                print(f"    Failed to post {rec['id']}: {e}")
            time.sleep(0.2)


if __name__ == "__main__":
    main()
