import React, { useState } from 'react';
import { 
  Compass, 
  Layers, 
  MapPin, 
  Eye, 
  AlertOctagon, 
  Flame, 
  ThermometerSnowflake, 
  ShieldCheck, 
  Navigation,
  Info
} from 'lucide-react';
import { WaypointNode, BioCoreTelemetry } from '../types';

interface TraverseMapProps {
  waypoints: WaypointNode[];
  activeWaypointIndex: number;
  onSelectWaypoint: (index: number) => void;
  activeTelemetry: BioCoreTelemetry;
}

export const TraverseMap: React.FC<TraverseMapProps> = ({
  waypoints,
  activeWaypointIndex,
  onSelectWaypoint,
  activeTelemetry,
}) => {
  const [showBioSafeOverlay, setShowBioSafeOverlay] = useState(true);
  const [showVoidLayer, setShowVoidLayer] = useState(true);
  const [showToxinLayer, setShowToxinLayer] = useState(true);
  const [showCryoLayer, setShowCryoLayer] = useState(true);
  const [hoveredWaypoint, setHoveredWaypoint] = useState<WaypointNode | null>(null);

  const activeWp = waypoints[activeWaypointIndex] || waypoints[0];

  // SVG coordinate path line for the traverse
  const traversePoints = waypoints.map((w) => `${w.x * 6.5},${w.y * 4.2}`).join(' ');

  const getWaypointColor = (node: WaypointNode) => {
    const decision = node.telemetry.computed.mission_go_no_go;
    if (decision === 'NO_GO') return { stroke: '#EF4444', fill: '#450a0a', text: 'text-red-400' };
    if (decision === 'CONDITIONAL_GO') return { stroke: '#F59E0B', fill: '#451a03', text: 'text-amber-400' };
    return { stroke: '#10B981', fill: '#064e3b', text: 'text-emerald-400' };
  };

  return (
    <div className="bg-[#0A0A0A] rounded-sm border border-zinc-800 p-4 flex flex-col h-full">
      {/* Header & Layer Toggles */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800">
        <div>
          <h2 className="text-[11px] font-bold text-zinc-400 font-mono flex items-center gap-2 uppercase tracking-widest">
            <Compass className="w-3.5 h-3.5 text-[#006BB3]" />
            Topographic Bio-Safe Map (Traverse Planner)
          </h2>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
            Shackleton • Faustini • Haworth PSR Corridor
          </p>
        </div>

        {/* Layer Controls */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
          <button
            onClick={() => setShowBioSafeOverlay(!showBioSafeOverlay)}
            className={`px-2 py-0.5 rounded-sm flex items-center gap-1 border transition-all ${
              showBioSafeOverlay
                ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]/50'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-[#10B981]" />
            <span>Bio-Safe</span>
          </button>

          <button
            onClick={() => setShowCryoLayer(!showCryoLayer)}
            className={`px-2 py-0.5 rounded-sm flex items-center gap-1 border transition-all ${
              showCryoLayer
                ? 'bg-[#005288]/30 text-sky-300 border-[#006BB3]/50'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <ThermometerSnowflake className="w-3 h-3 text-[#006BB3]" />
            <span>&lt;40K Cryo</span>
          </button>

          <button
            onClick={() => setShowVoidLayer(!showVoidLayer)}
            className={`px-2 py-0.5 rounded-sm flex items-center gap-1 border transition-all ${
              showVoidLayer
                ? 'bg-[#F59E0B]/20 text-[#F59E0B] border-[#F59E0B]/50'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <AlertOctagon className="w-3 h-3 text-[#F59E0B]" />
            <span>GPR Voids</span>
          </button>

          <button
            onClick={() => setShowToxinLayer(!showToxinLayer)}
            className={`px-2 py-0.5 rounded-sm flex items-center gap-1 border transition-all ${
              showToxinLayer
                ? 'bg-[#EF4444]/20 text-[#EF4444] border-[#EF4444]/50'
                : 'bg-zinc-900 text-zinc-500 border-zinc-800'
            }`}
          >
            <Flame className="w-3 h-3 text-[#EF4444]" />
            <span>Toxicity</span>
          </button>
        </div>
      </div>

      {/* Main Map Visualizer Canvas */}
      <div className="relative my-2.5 rounded-sm overflow-hidden bg-[#000] border border-zinc-800 aspect-[16/10] w-full select-none">
        {/* Sleek top badges */}
        <div className="absolute top-2.5 left-2.5 bg-black/90 px-2 py-0.5 border border-zinc-800 text-[9px] font-mono z-10 text-zinc-400">
          <span className="text-zinc-500">VIEW:</span> TOPOGRAPHIC_BIOSAFE_MAP
        </div>
        <div className="absolute top-2.5 right-2.5 flex space-x-1.5 z-10">
          {showCryoLayer && (
            <div className="bg-red-500/20 border border-red-500/60 px-1.5 py-0.5 text-[8px] font-mono font-bold text-red-400">
              CRYO-FATIGUE RISK
            </div>
          )}
        </div>

        <svg
          viewBox="0 0 650 420"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="shackletonPSR" cx="45%" cy="45%" r="48%">
              <stop offset="0%" stopColor="#000000" stopOpacity="0.98" />
              <stop offset="60%" stopColor="#0a0a0a" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#18181b" stopOpacity="0.3" />
            </radialGradient>

            <radialGradient id="cryoGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#0369a1" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="toxinGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#dc2626" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#991b1b" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="voidGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="75%" stopColor="#d97706" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#b45309" stopOpacity="0" />
            </radialGradient>

            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#18181b" strokeWidth="0.75" />
            </pattern>
          </defs>

          {/* Background Grid */}
          <rect width="650" height="420" fill="#000000" />
          <rect width="650" height="420" fill="url(#grid)" opacity="0.8" />

          {/* South Pole Crater Topography Rings */}
          {/* Shackleton Crater Rim */}
          <ellipse cx="260" cy="190" rx="190" ry="140" fill="none" stroke="#27272a" strokeWidth="1.2" strokeDasharray="4 4" />
          <ellipse cx="260" cy="190" rx="140" ry="100" fill="url(#shackletonPSR)" stroke="#18181b" strokeWidth="1.5" />
          <text x="240" y="110" fill="#52525b" fontSize="10" fontFamily="monospace" fontWeight="600">
            SHACKLETON CRATER PSR (89.9°S)
          </text>

          {/* Faustini Crater Rim */}
          <ellipse cx="480" cy="310" rx="130" ry="85" fill="none" stroke="#27272a" strokeWidth="1" />
          <ellipse cx="480" cy="310" rx="90" ry="60" fill="url(#shackletonPSR)" />
          <text x="440" y="270" fill="#3f3f46" fontSize="9" fontFamily="monospace">
            FAUSTINI PSR
          </text>

          {/* Haworth Crater Rim */}
          <ellipse cx="110" cy="300" rx="100" ry="70" fill="none" stroke="#27272a" strokeWidth="1" />
          <ellipse cx="110" cy="300" rx="70" ry="45" fill="url(#shackletonPSR)" />
          <text x="80" y="275" fill="#3f3f46" fontSize="9" fontFamily="monospace">
            HAWORTH PSR
          </text>

          {/* Connecting Ridge Sunlight Peaks */}
          <path
            d="M 60,60 Q 200,90 320,50 T 560,90"
            fill="none"
            stroke="#eab308"
            strokeWidth="1.2"
            strokeOpacity="0.35"
            strokeDasharray="3 3"
          />
          <text x="70" y="50" fill="#a16207" fontSize="8" fontFamily="monospace">
            ▲ CONNECTING RIDGE (QUASI-CONTINUOUS SUNLIGHT)
          </text>

          {/* Elevation Contours */}
          <path d="M 160,140 Q 240,110 360,130 T 480,180" fill="none" stroke="#18181b" strokeWidth="1" />
          <path d="M 180,220 Q 260,260 380,240 T 440,280" fill="none" stroke="#18181b" strokeWidth="1" />
          <path d="M 140,180 Q 240,220 340,190" fill="none" stroke="#18181b" strokeWidth="1" />

          {/* Overlay Layers */}
          {/* 1. Bio-Safe Corridor Buffer */}
          {showBioSafeOverlay && (
            <path
              d={`M ${traversePoints.split(' ')[0]} L ${traversePoints.split(' ').slice(1, 4).join(' L ')}`}
              fill="none"
              stroke="#10B981"
              strokeWidth="20"
              strokeLinecap="round"
              strokeOpacity="0.12"
            />
          )}

          {/* 2. <40K Cryo-Fatigue Floor Zone */}
          {showCryoLayer && (
            <g>
              <circle cx="403" cy="189" r="60" fill="url(#cryoGradient)" />
              <circle cx="182" cy="302" r="50" fill="url(#cryoGradient)" />
              <text x="365" y="165" fill="#38bdf8" fontSize="8.5" fontFamily="monospace" fontWeight="500">
                ❄ CRYO FLOOR &lt;40K
              </text>
            </g>
          )}

          {/* 3. GPR Subsurface Void Anomaly Zone (WP-05 area) */}
          {showVoidLayer && (
            <g>
              <circle cx="481" cy="252" r="42" fill="url(#voidGradient)" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3 3" />
              <text x="445" y="225" fill="#fbbf24" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                ⚠ GPR VOID HAZARD (1.3m)
              </text>
            </g>
          )}

          {/* 4. Toxicity Volatile Plume (WP-06 area) */}
          {showToxinLayer && (
            <g>
              <circle cx="533" cy="327" r="48" fill="url(#toxinGradient)" stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
              <text x="500" y="300" fill="#f87171" fontSize="8.5" fontFamily="monospace" fontWeight="600">
                ☠ TOXIC NH₃/H₂S PLUME
              </text>
            </g>
          )}

          {/* Traverse Path Lines */}
          <polyline
            points={traversePoints}
            fill="none"
            stroke="#3f3f46"
            strokeWidth="1.5"
            strokeDasharray="4 3"
            opacity="0.6"
          />

          {/* Bio-Optimized Safe Path */}
          <polyline
            points={traversePoints}
            fill="none"
            stroke="#006BB3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Waypoints */}
          {waypoints.map((wp, idx) => {
            const cx = wp.x * 6.5;
            const cy = wp.y * 4.2;
            const isActive = idx === activeWaypointIndex;
            const colors = getWaypointColor(wp);

            return (
              <g
                key={wp.id}
                className="cursor-pointer group"
                onClick={() => onSelectWaypoint(idx)}
                onMouseEnter={() => setHoveredWaypoint(wp)}
                onMouseLeave={() => setHoveredWaypoint(null)}
              >
                {/* Ping animation for active waypoint */}
                {isActive && (
                  <circle cx={cx} cy={cy} r="14" fill="none" stroke="#006BB3" strokeWidth="1.2" className="animate-ping" opacity="0.6" />
                )}

                {/* Outer Ring */}
                <circle
                  cx={cx}
                  cy={cy}
                  r={isActive ? '8' : '6'}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={isActive ? '2' : '1.2'}
                  className="transition-all duration-200"
                />

                {/* Inner Dot */}
                <circle cx={cx} cy={cy} r="2" fill="#ffffff" />

                {/* Waypoint Label */}
                <text
                  x={cx + 9}
                  y={cy + 3.5}
                  fill={isActive ? '#38bdf8' : '#a1a1aa'}
                  fontSize={isActive ? '10' : '9'}
                  fontFamily="monospace"
                  fontWeight={isActive ? '700' : '500'}
                  className="select-none"
                >
                  {wp.waypointCode}
                </text>
              </g>
            );
          })}

          {/* Active Rover Position Marker */}
          {activeWp && (
            <g transform={`translate(${activeWp.x * 6.5}, ${activeWp.y * 4.2})`}>
              <circle r="11" fill="none" stroke="#006BB3" strokeWidth="1" className="animate-ping" />
              <rect x="-7" y="-7" width="14" height="14" rx="2" fill="#005288" stroke="#006BB3" strokeWidth="1.2" />
              <path d="M -3,-2 L 0,-5 L 3,-2 L 0,5 Z" fill="#ffffff" />
              <path d="M 0,0 L 22,-12 A 25 25 0 0 1 22,12 Z" fill="#006BB3" opacity="0.15" />
            </g>
          )}

          {/* Coordinates Telemetry at Bottom Left */}
          <g transform="translate(15, 360)">
            <rect width="120" height="48" rx="2" fill="#050505" opacity="0.9" stroke="#27272a" strokeWidth="0.8" />
            <text x="8" y="15" fill="#71717a" fontSize="8" fontFamily="monospace">LAT: {activeWp?.lat?.toFixed(1) || -89.9}° S</text>
            <text x="8" y="28" fill="#71717a" fontSize="8" fontFamily="monospace">LON: {activeWp?.lon?.toFixed(1) || 0.0}° E</text>
            <text x="8" y="41" fill="#71717a" fontSize="8" fontFamily="monospace">ELEV: {activeWp?.elevation_m || -1420}m</text>
          </g>

          {/* Scale */}
          <g transform="translate(500, 395)">
            <line x1="0" y1="0" x2="60" y2="0" stroke="#71717a" strokeWidth="1.5" />
            <line x1="0" y1="-2" x2="0" y2="2" stroke="#71717a" strokeWidth="1.5" />
            <line x1="60" y1="-2" x2="60" y2="2" stroke="#71717a" strokeWidth="1.5" />
            <text x="18" y="-4" fill="#71717a" fontSize="8" fontFamily="monospace">5.0 km</text>
          </g>
        </svg>

        {/* Hover / Active Telemetry HUD Tooltip Overlay */}
        {(hoveredWaypoint || activeWp) && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/95 border border-zinc-800 rounded-sm p-2 text-[10px] font-mono shadow-2xl max-w-xs pointer-events-none">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-1 mb-1">
              <span className="font-bold text-zinc-200">
                {(hoveredWaypoint || activeWp).waypointCode} — {(hoveredWaypoint || activeWp).name}
              </span>
              <span className={`px-1 py-0.2 rounded-sm text-[9px] font-bold ${
                (hoveredWaypoint || activeWp).telemetry.computed.mission_go_no_go === 'GO'
                  ? 'bg-emerald-950 text-[#10B981] border border-emerald-800'
                  : (hoveredWaypoint || activeWp).telemetry.computed.mission_go_no_go === 'CONDITIONAL_GO'
                  ? 'bg-amber-950 text-[#F59E0B] border border-amber-800'
                  : 'bg-rose-950 text-[#EF4444] border border-rose-800'
              }`}>
                {(hoveredWaypoint || activeWp).telemetry.computed.mission_go_no_go}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-zinc-400">
              <div>Temp: <span className="text-zinc-200">{(hoveredWaypoint || activeWp).telemetry.env.surface_temp_k.toFixed(1)}K</span></div>
              <div>H₂O: <span className="text-[#10B981]">{(hoveredWaypoint || activeWp).telemetry.ngms.h2o_ppm} ppm</span></div>
              <div>NH₃: <span className={(hoveredWaypoint || activeWp).telemetry.ngms.nh3_ppm > 10 ? 'text-[#EF4444] font-bold' : 'text-zinc-300'}>{(hoveredWaypoint || activeWp).telemetry.ngms.nh3_ppm} ppm</span></div>
              <div>EVA: <span className="text-zinc-200">{(hoveredWaypoint || activeWp).telemetry.computed.safe_eva_window_minutes} min</span></div>
            </div>
          </div>
        )}
      </div>

      {/* Waypoint Traversal Strip */}
      <div className="mt-auto pt-1">
        <div className="text-[10px] font-mono text-zinc-500 mb-1 flex items-center justify-between uppercase tracking-wider">
          <span>Traverse Waypoints (Click to target rover):</span>
          <span>{waypoints.length} WAYPOINTS</span>
        </div>
        <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-thin">
          {waypoints.map((wp, idx) => {
            const isActive = idx === activeWaypointIndex;
            const status = wp.telemetry.computed.mission_go_no_go;
            return (
              <button
                key={wp.id}
                onClick={() => onSelectWaypoint(idx)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono border transition-all ${
                  isActive
                    ? 'bg-[#005288]/40 text-sky-200 border-[#006BB3]'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-200'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${
                  status === 'GO' ? 'bg-[#10B981]' : status === 'CONDITIONAL_GO' ? 'bg-[#F59E0B]' : 'bg-[#EF4444]'
                }`} />
                <span className="font-semibold">{wp.waypointCode}</span>
                <span className="text-[10px] text-zinc-500 hidden md:inline">({wp.telemetry.env.surface_temp_k.toFixed(0)}K)</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
