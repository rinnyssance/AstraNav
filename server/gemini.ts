import { GoogleGenAI, Type } from '@google/genai';
import { BioCoreTelemetry, AIBriefingResponse } from '../src/types';

let aiInstance: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

const NASA_SYSTEM_INSTRUCTION = `
You are the NASA Bioastronautics Lead for Artemis Lunar South Pole Operations (AstraNav PSR Mission Control).
Your mission is to evaluate incoming robotic rover telemetry from Permanently Shadowed Regions (PSRs) and translate raw data into actionable human biological safety metrics, ISRU resource yields, and traverse recommendations for Flight Directors.

Domain Rules & NASA Thresholds:
1. Thermal Risk: Surface temperature < 40K triggers "Suit Joint Cryo-Fatigue" (elastomeric seal vitrification and bearing stiffness limit EVA duration to max 45 min). Below 35K is critical abort.
2. Toxicity Risk: Ammonia (NH3) or Hydrogen Sulfide (H2S) > 10 ppm poses severe habitat airlock pressurization hazard and suit ingress contamination. NH3 or H2S > 50 ppm is an immediate LETHAL hazard triggering NO_GO.
3. Subsurface Geotechnical: GPR shallow voids (< 1.8m depth) represent structural collapse hazards under crewed rovers (1.8 - 3.5 tonnes).
4. ISRU Yield: Net Water Yield = H2O_ppm - (Drill_Resistance_N * Depth_Factor). Standard Artemis crew water consumption is 2.5 L/day per astronaut (5.0 L/day for 2 crew, 10.0 L/day for 4 crew).
5. Tone: Decisive, concise, mission-critical flight controller style (clear Go/No-Go declarations, unambiguous risks, actionable checklist items).
`;

export async function generateAIBriefing(
  telemetry: BioCoreTelemetry
): Promise<AIBriefingResponse> {
  const ai = getGenAI();

  // If Gemini API is available, generate dynamic response
  if (ai) {
    try {
      const prompt = `
Analyze the following PSR robotic telemetry packet from ${telemetry.siteName} (${telemetry.siteId}):

TELEMETRY PAYLOAD:
${JSON.stringify(telemetry, null, 2)}

Provide a structured Bioastronautics Mission Briefing for the Flight Director.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.7-flash',
        contents: prompt,
        config: {
          systemInstruction: NASA_SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              flightDirectorBriefing: {
                type: Type.STRING,
                description: 'Clear, executive Go/No-Go summary for the Flight Director in 2-3 sentences.',
              },
              overallGoNoGo: {
                type: Type.STRING,
                enum: ['GO', 'CONDITIONAL_GO', 'NO_GO'],
                description: 'Master mission recommendation.',
              },
              toxicHazardAnalysis: {
                type: Type.STRING,
                description: 'Detailed assessment of NH3, H2S, and other volatile chemical species regarding habitat pressurization and suit ingress.',
              },
              resourcePotential: {
                type: Type.OBJECT,
                properties: {
                  h2o_summary: {
                    type: Type.STRING,
                    description: 'Water ice concentration and Net ISRU yield analysis.',
                  },
                  consumption_days_estimate: {
                    type: Type.NUMBER,
                    description: 'Calculated crew consumption days for a standard 350kg extraction batch (2 crew at 5L/day).',
                  },
                  mining_method_recommendation: {
                    type: Type.STRING,
                    description: 'Whether manual crew EVA or robotic-only extraction is advised based on drill resistance and thermal profile.',
                  },
                },
                required: ['h2o_summary', 'consumption_days_estimate', 'mining_method_recommendation'],
              },
              traverseRecommendation: {
                type: Type.STRING,
                description: 'Rover mobility and suit traverse corridor recommendation considering slope, GPR voids, and thermal floors.',
              },
              criticalAlerts: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'List of immediate red/yellow biological alerts.',
              },
              bioastronauticsChecklist: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3 to 5 action items for the Bioastronautics Officer prior to crew egress.',
              },
              groundingReference: {
                type: Type.STRING,
                description: 'NASA source grounding citation (e.g. Artemis III SDT Report / Lunar Sourcebook Section).',
              },
            },
            required: [
              'flightDirectorBriefing',
              'overallGoNoGo',
              'toxicHazardAnalysis',
              'resourcePotential',
              'traverseRecommendation',
              'criticalAlerts',
              'bioastronauticsChecklist',
              'groundingReference',
            ],
          },
        },
      });

      if (response.text) {
        const parsed = JSON.parse(response.text.trim()) as AIBriefingResponse;
        return parsed;
      }
    } catch (err) {
      console.error('Error generating AI briefing with Gemini:', err);
    }
  }

  // Deterministic fallback if API key not present or call fails
  return generateDeterministicBriefing(telemetry);
}

export function generateDeterministicBriefing(telemetry: BioCoreTelemetry): AIBriefingResponse {
  const comp = telemetry.computed;
  const isLethal = comp.toxicity_risk === 'LETHAL_IMMEDIATE_HAZARD';
  const isCavity = comp.void_risk === 'CRITICAL_COLLAPSE_RISK';
  const isCryo = comp.thermal_risk === 'CRITICAL_CRYO_FATIGUE';

  let briefing = '';
  let decision: 'GO' | 'CONDITIONAL_GO' | 'NO_GO' = comp.mission_go_no_go;

  if (isLethal) {
    briefing = `CRITICAL TOXICITY ABORT: NH3 (${telemetry.ngms.nh3_ppm} ppm) and/or H2S (${telemetry.ngms.h2s_ppm} ppm) breach lethal toxicity threshold (>50 ppm). Human approach prohibited; site flagged as lethal habitat contamination hazard.`;
  } else if (isCavity) {
    briefing = `GEOTECHNICAL HAZARD: GPR detected shallow void at ${telemetry.gpr.void_depth_m?.toFixed(1)}m. High risk of regolith breach under crewed rover load. Immediate corridor reroute mandated.`;
  } else if (isCryo) {
    briefing = `CONDITIONAL GO: Cryogenic temperature (${telemetry.env.surface_temp_k.toFixed(1)}K < 40K) induces suit joint bearing embrittlement. EVA duration capped at ${comp.safe_eva_window_minutes} minutes.`;
  } else {
    briefing = `NOMINAL BIOASTRONAUTICS STATUS: All four instrument systems indicate safe EVA operational margins (${comp.safe_eva_window_minutes} min window). Viable water-ice resource detected (${telemetry.ngms.h2o_ppm} ppm).`;
  }

  const criticalAlerts: string[] = [];
  if (comp.toxicity_risk !== 'SAFE') criticalAlerts.push(comp.toxicity_warning_msg);
  if (comp.thermal_risk !== 'NOMINAL') criticalAlerts.push(comp.thermal_warning_msg);
  if (comp.void_risk !== 'STABLE') criticalAlerts.push(comp.void_warning_msg);
  if (telemetry.env.radiation_dose_rate_msv_hr > 0.1) {
    criticalAlerts.push(`Elevated radiation dose rate: ${telemetry.env.radiation_dose_rate_msv_hr.toFixed(3)} mSv/hr.`);
  }

  return {
    flightDirectorBriefing: briefing,
    overallGoNoGo: decision,
    toxicHazardAnalysis: `NGMS analysis reveals H2O: ${telemetry.ngms.h2o_ppm} ppm, NH3: ${telemetry.ngms.nh3_ppm} ppm, H2S: ${telemetry.ngms.h2s_ppm} ppm, CO2: ${telemetry.ngms.co2_ppm} ppm. ${comp.toxicity_warning_msg}`,
    resourcePotential: {
      h2o_summary: `H2O concentration at ${telemetry.ngms.h2o_ppm} ppm. Net ISRU Yield Index: ${comp.net_isru_yield_index}. Drill resistance is ${telemetry.drill.resistance_n} N at ${telemetry.drill.drill_depth_cm} cm.`,
      consumption_days_estimate: comp.human_consumption_days_yield,
      mining_method_recommendation: comp.extraction_recommendation === 'MANUAL_CREW_FEASIBLE'
        ? 'Manual crew core extraction is feasible within safe EVA window.'
        : comp.extraction_recommendation === 'ROBOTIC_ONLY'
        ? 'Robotic pre-extraction recommended prior to crew arrival to avoid excessive suit energy expenditure.'
        : 'Water yield insufficient or extraction energy prohibitive.',
    },
    traverseRecommendation: `Waypoint corridor at ${telemetry.coordinates.slope_deg}° slope. Soil bearing stability: ${comp.void_risk === 'STABLE' ? 'HIGH' : 'COMPROMISED'}. Maintain rover ground speed < 4 km/h.`,
    criticalAlerts: criticalAlerts.length > 0 ? criticalAlerts : ['No critical bio-hazards detected. Parameters within Artemis III standard envelope.'],
    bioastronauticsChecklist: [
      `Confirm xEMU suit active heating loop status for ${telemetry.env.surface_temp_k.toFixed(1)}K ambient floor.`,
      `Verify airlock particulate vacuum scrubbers are calibrated for volatile NH3/H2S detection.`,
      `Set countdown timer for safe EVA window: ${comp.safe_eva_window_minutes} minutes.`,
      `Verify GPR ground radar continuous scan mode during rover advance.`,
    ],
    groundingReference: 'NASA Artemis III Science Definition Team Report (NASA/SP-20205009602) & Lunar Sourcebook Vol. 2 (Bioastronautics ISRU Section).',
  };
}

export async function generateAIChatReply(
  userQuestion: string,
  currentTelemetry: BioCoreTelemetry,
  history: Array<{ role: 'user' | 'model'; text: string }> = []
): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    return `[AstraNav Bio-Lead Deterministic Mode] Telemetry at ${currentTelemetry.siteName}: Status is ${currentTelemetry.computed.mission_go_no_go}. Temp=${currentTelemetry.env.surface_temp_k.toFixed(1)}K, H2O=${currentTelemetry.ngms.h2o_ppm}ppm, NH3=${currentTelemetry.ngms.nh3_ppm}ppm, GPR void=${currentTelemetry.gpr.void_detected ? 'YES (' + currentTelemetry.gpr.void_depth_m + 'm)' : 'NO'}. EVA window=${currentTelemetry.computed.safe_eva_window_minutes}m.`;
  }

  try {
    const formattedHistory = history.map((h) => ({
      role: h.role,
      parts: [{ text: h.text }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [
            {
              text: `CURRENT BIOASTRONAUTICS ROVER TELEMETRY AT ${currentTelemetry.siteName} (${currentTelemetry.siteId}):
${JSON.stringify(currentTelemetry, null, 2)}

USER FLIGHT DIRECTOR QUERY:
${userQuestion}

Answer in the role of the NASA Bioastronautics Lead. Be concise, precise, grounded in NASA mission safety rules, and direct.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: NASA_SYSTEM_INSTRUCTION,
      },
    });

    return response.text || 'No response generated from Bioastronautics AI.';
  } catch (err: any) {
    console.error('Error in AI chat reply:', err);
    return `Communication error with Bioastronautics AI subsystem: ${err?.message || 'Check connection'}`;
  }
}
