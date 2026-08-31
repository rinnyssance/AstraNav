# AstraNav PSR

**Real-time lunar bioastronautics decision support and traverse planning for the Moon’s South Pole.**

AstraNav PSR is a mission-support platform designed to help crews and robotic scouts operate more safely and productively inside the permanently shadowed regions (PSRs) of the Lunar South Pole. These environments combine extreme cryogenic temperatures, volatile-rich regolith, limited illumination, hazardous terrain, radiation exposure, abrasive dust, and strict spacesuit consumable constraints.

The system combines deterministic safety calculations, simulated multi-sensor telemetry, subsurface and volatile analysis, traverse planning, and Gemini-powered mission briefings to turn complex environmental data into clear operational guidance.

## The Problem

Future Artemis crews exploring the lunar South Pole may operate near or within permanently shadowed craters containing scientifically valuable water ice and other preserved volatiles. These same regions can expose astronauts and hardware to extreme cold, hazardous subsurface voids, toxic volatile plumes, radiation events, dust, and rapidly changing consumable limits.

Mission teams therefore need a way to continuously combine environmental, geological, resource, and crew-health data into actionable **GO / CAUTION / NO-GO** decisions.

## The Solution

AstraNav PSR acts as a digital mission-support layer for lunar EVA and rover operations. It ingests sensor telemetry, calculates bio-safety limits, evaluates resource potential, identifies terrain and subsurface hazards, and generates grounded AI-assisted tactical briefings.

Rather than asking an AI model to make safety calculations directly, AstraNav separates responsibilities:

- **Deterministic math** handles mission-critical thresholds and safety margins.
- **Sensor telemetry** provides environmental, suit, GPR, drilling, and volatile data.
- **Gemini AI** interprets already-calculated results and produces concise mission guidance and crew-facing explanations.

## Core Capabilities

### Bioastronautics Safety Engine

AstraNav evaluates conditions that can directly affect astronaut survival and EVA duration, including:

- Cryogenic surface temperature
- Spacesuit oxygen reserves
- CO2 scrubber lifetime
- Battery capacity under cryogenic heating loads
- Feedwater coolant availability
- Solar particle event exposure
- Abrasive lunar dust density
- Toxic volatile concentrations

A mandatory **30% walkback reserve** is applied when calculating the available EVA window.

### Lunar Environment Monitoring

The system monitors simulated lunar South Pole conditions including:

- Surface temperature
- Ultra-high-vacuum pressure
- Dust particulate density
- Solar energetic particle flux

Critical environmental conditions can automatically reduce the EVA window or trigger a NO-GO state.

### Ground-Penetrating Radar

Subsurface analysis estimates dielectric properties and identifies potential:

- Water-ice-rich regolith
- Dry lunar regolith
- High-purity permafrost
- Cavities and structural voids
- Collapse-risk zones

Detected hazards can trigger traverse rerouting recommendations.

### Deep Drill + ISRU Analysis

A rotary-percussive drilling model evaluates:

- Drill resistance
- Bit temperature
- Torque
- Sampling depth
- Estimated water concentration
- Net ISRU yield

The system also estimates how extracted lunar water could translate into human consumption days.

### Next-Generation Mass Spectrometry

A simulated quadrupole mass spectrometer analyzes volatile compounds from approximately 1–150 amu and tracks hazardous species such as:

- H2O
- NH3
- H2S
- CH4
- CO2
- SO2

Concentration thresholds can produce contamination warnings or immediate mission abort recommendations.

### AI Flight Director

Gemini is used as a grounded mission-support layer for:

- Tactical EVA briefings
- GO / NO-GO explanations
- Hazard summaries
- Crew questions
- Scientific context
- Traverse and sampling guidance

The AI layer is downstream of the deterministic safety engine so that model-generated language does not replace hard safety constraints.

## System Architecture

```text
Multi-Sensor Telemetry
        |
        v
Deterministic Safety + ISRU Engine
        |
        +--> EVA Window / Walkback Reserve
        +--> Cryogenic Hazard State
        +--> Toxicity State
        +--> Radiation / Dust Risk
        +--> Subsurface Risk
        +--> Resource Yield
        |
        v
Gemini AI Flight Director
        |
        +--> Tactical Briefing
        +--> GO / CAUTION / NO-GO Explanation
        +--> Crew Q&A
        v
React Mission Dashboard
```

## API

The server exposes mission-support endpoints including:

```text
POST /api/telemetry/ingest
POST /api/ai/briefing
POST /api/ai/chat
GET  /api/health
```

`/api/telemetry/ingest` processes raw sensor frames and calculates deterministic mission-safety metrics before AI interpretation.

## Tech Stack

- React 19
- TypeScript
- Vite
- Express
- Google Gemini via `@google/genai`
- Tailwind CSS
- Recharts
- Motion
- Lucide React
- Bun / Node.js tooling
- Python rover-traverse simulation

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/rinnyssance/AstraNav.git
cd AstraNav
```

### 2. Install dependencies

Using Bun:

```bash
bun install
```

Or with npm:

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then provide your Gemini API key:

```env
GEMINI_API_KEY="your_api_key_here"
APP_URL="http://localhost:3000"
```

### 4. Start development mode

```bash
bun run dev
```

or:

```bash
npm run dev
```

## Build

```bash
npm run build
npm start
```

The production build bundles the Vite frontend and Express server.

## Rover Traverse Simulation

The repository includes a Python-based rover traverse simulator:

```bash
python simulate_rover_traverse.py
```

Generated simulated telemetry can be used to exercise the dashboard and mission-safety logic.

## Mission Safety Logic

Representative rules currently include:

| Condition | System Response |
| --- | --- |
| Surface temperature below 32 K | Critical cryogenic hazard; EVA window reduced and mission marked NO-GO |
| Surface temperature below 40 K | Cryo-fatigue warning; EVA duration capped |
| NH3 or H2S above critical limits | Toxic plume NO-GO |
| Elevated NH3 or H2S | Contamination warning and reduced EVA duration |
| Critical solar particle flux | Immediate abort / shelter directive |
| High dust density | Visor and suit-seal abrasion warning |
| High-confidence subsurface void | Traverse reroute |

These thresholds are encoded as deterministic operational constraints rather than free-form AI judgments.

## Target Mission Context

AstraNav PSR is conceptually designed around future crewed and robotic exploration of lunar South Pole regions associated with Artemis III, IV, and V mission objectives, with particular emphasis on permanently shadowed regions near craters such as:

- Shackleton
- Faustini
- Haworth
- Shoemaker
- Nobile

## Standards & Reference Frameworks

The system architecture is informed by human-spaceflight and lunar exploration frameworks including:

- NASA-STD-3001 human-system considerations
- Artemis Science Definition Team polar science objectives
- EVA consumables and operational margin concepts

> **Important:** AstraNav PSR is a prototype / research demonstration. It is not NASA-certified flight software and must not be used for real-world mission-critical decision making.

## Why AstraNav Matters

Lunar exploration is not only a navigation problem. It is simultaneously a **human physiology, geology, resource utilization, radiation, environmental, and operational decision problem**.

AstraNav explores what mission software could look like when those systems are considered together—and when AI is used to explain and assist rather than replace deterministic safety engineering.

## Project Status

AstraNav PSR currently includes:

- Lunar mission dashboard
- Deterministic bio-safety calculations
- Simulated telemetry ingestion
- EVA consumable modeling
- GPR / subsurface risk modeling
- ISRU yield calculations
- Volatile and toxicity monitoring
- Gemini-powered mission briefings and chat
- Rover traverse simulation data

Additional validation, testing, scientific calibration, and hardware integration would be required before any operational use.

## Author

**Erin Joel Moore**  
Scientist · Creative Technologist

## License

No open-source license has been declared yet. All rights are reserved unless a license is added to this repository.
