import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  HeaderHUD 
} from './components/HeaderHUD';
import { 
  TraverseMap 
} from './components/TraverseMap';
import { 
  GPRVisualizer 
} from './components/GPRVisualizer';
import { 
  NGMSSpectrometer 
} from './components/NGMSSpectrometer';
import { 
  DrillAndISRU 
} from './components/DrillAndISRU';
import { 
  BioSafetyOverview 
} from './components/BioSafetyOverview';
import { 
  AIBriefingTerminal 
} from './components/AIBriefingTerminal';
import { 
  TelemetryPayloadEditor 
} from './components/TelemetryPayloadEditor';
import { 
  INITIAL_WAYPOINTS 
} from './data/mockTelemetry';
import { 
  evaluateInstrumentStatuses, 
  calculateBioMetrics 
} from './utils/bioEngine';
import { 
  WaypointNode, 
  BioCoreTelemetry, 
  AIBriefingResponse, 
  ChatMessage 
} from './types';
import { 
  Radio, 
  Layers, 
  Activity, 
  Sparkles, 
  Download, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function App() {
  const [waypoints, setWaypoints] = useState<WaypointNode[]>(INITIAL_WAYPOINTS);
  const [activeWaypointIndex, setActiveWaypointIndex] = useState(0);
  const [isSimulating, setIsSimulating] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [metSeconds, setMetSeconds] = useState(15150); // Mission Elapsed Time in seconds
  const [briefing, setBriefing] = useState<AIBriefingResponse | null>(null);
  const [isLoadingBriefing, setIsLoadingBriefing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [viewMode, setViewMode] = useState<'MISSION_CONTROL' | 'TRAVERSE_FOCUS' | 'INSTRUMENT_FOCUS'>('MISSION_CONTROL');

  const activeWaypoint = waypoints[activeWaypointIndex] || waypoints[0];
  const activeTelemetry = activeWaypoint?.telemetry;

  // Web Audio subtle sound effects
  const playHudBeep = useCallback((freq = 880, type: OscillatorType = 'sine', duration = 0.08) => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be restricted before user gesture
    }
  }, [soundEnabled]);

  // Format MET Clock
  const formatMet = (totalSec: number) => {
    const d = Math.floor(totalSec / 86400);
    const h = Math.floor((totalSec % 86400) / 3600).toString().padStart(2, '0');
    const m = Math.floor((totalSec % 3600) / 60).toString().padStart(2, '0');
    const s = (totalSec % 60).toString().padStart(2, '0');
    return `MET ${d}d ${h}:${m}:${s}`;
  };

  // Fetch AI Briefing whenever active waypoint changes
  const fetchBriefing = useCallback(async (telemetry: BioCoreTelemetry) => {
    setIsLoadingBriefing(true);
    try {
      const res = await fetch('/api/ai/briefing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telemetry }),
      });
      if (res.ok) {
        const data = await res.json();
        setBriefing(data);
      }
    } catch (err) {
      console.error('Failed to load AI briefing:', err);
    } finally {
      setIsLoadingBriefing(false);
    }
  }, []);

  // Initial load & MET ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setMetSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch briefing on active telemetry change
  useEffect(() => {
    if (activeTelemetry) {
      fetchBriefing(activeTelemetry);
      playHudBeep(740, 'triangle', 0.05);
    }
  }, [activeWaypointIndex, activeTelemetry?.siteId, fetchBriefing]);

  // Auto-Traverse Rover Simulation
  useEffect(() => {
    let simInterval: NodeJS.Timeout | null = null;
    if (isSimulating) {
      simInterval = setInterval(() => {
        setActiveWaypointIndex((prev) => {
          const next = (prev + 1) % waypoints.length;
          playHudBeep(1040, 'sine', 0.06);
          return next;
        });
      }, 5000);
    }
    return () => {
      if (simInterval) clearInterval(simInterval);
    };
  }, [isSimulating, waypoints.length, playHudBeep]);

  // Handle select waypoint
  const handleSelectWaypoint = (index: number) => {
    setActiveWaypointIndex(index);
    playHudBeep(880, 'sine', 0.05);
  };

  const handleNextWaypoint = () => {
    setActiveWaypointIndex((prev) => (prev + 1) % waypoints.length);
    playHudBeep(920, 'sine', 0.05);
  };

  const handleResetTraverse = () => {
    setActiveWaypointIndex(0);
    setIsSimulating(false);
    playHudBeep(440, 'sawtooth', 0.1);
  };

  // Ingest custom telemetry
  const handleIngestTelemetry = async (payload: any) => {
    try {
      const res = await fetch('/api/telemetry/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.telemetry) {
        const full = data.telemetry;
        // Update waypoints list with new or updated waypoint
        setWaypoints((prev) => {
          const idx = prev.findIndex((w) => w.telemetry.siteId === full.siteId);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], telemetry: full };
            return updated;
          }
          const newNode: WaypointNode = {
            id: `wp-${Date.now()}`,
            waypointCode: `WP-${prev.length + 1}`,
            name: full.siteName || 'Custom Ingest Site',
            crater: full.craterRegion || 'Shackleton',
            x: Math.min(85, Math.max(15, 20 + prev.length * 8)),
            y: Math.min(85, Math.max(15, 30 + (prev.length % 4) * 15)),
            lat: full.coordinates?.lat || -89.8,
            lon: full.coordinates?.lon || 115.0,
            elevation_m: full.coordinates?.elevation_m || 900,
            shadow_stability_score: 90,
            telemetry: full,
          };
          return [...prev, newNode];
        });
        playHudBeep(1200, 'sine', 0.12);
      }
    } catch (err) {
      console.error('Ingest error:', err);
      throw err;
    }
  };

  // Send message to Flight Director AI
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      text,
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setIsSendingMessage(true);

    try {
      const history = chatMessages.slice(-6).map((m) => ({
        role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
        text: m.text,
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          telemetry: activeTelemetry,
          history,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const aiMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          text: data.reply || 'Mission Control acknowledged.',
        };
        setChatMessages((prev) => [...prev, aiMsg]);
        playHudBeep(980, 'sine', 0.08);
      }
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Export mission report JSON
  const handleExportMissionReport = () => {
    const report = {
      mission: 'AstraNav PSR Bioastronautics Mission Log',
      version: '1.0',
      timestamp: new Date().toISOString(),
      met: formatMet(metSeconds),
      activeWaypoint: activeWaypoint.name,
      activeTelemetry,
      briefing,
      allWaypointsSummary: waypoints.map((w) => ({
        code: w.waypointCode,
        site: w.name,
        goNoGo: w.telemetry.computed.mission_go_no_go,
        temp_k: w.telemetry.env.surface_temp_k,
        h2o_ppm: w.telemetry.ngms.h2o_ppm,
        nh3_ppm: w.telemetry.ngms.nh3_ppm,
        eva_window_min: w.telemetry.computed.safe_eva_window_minutes,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AstraNav_PSR_Mission_Log_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  // 4 Instrument evaluation
  const instrumentStatuses = evaluateInstrumentStatuses(activeTelemetry);

  return (
    <div className="min-h-screen bg-[#050505] text-[#E0E0E0] flex flex-col font-sans selection:bg-[#005288] selection:text-white">
      {/* Top Mission HUD Banner with 4 Instruments Status */}
      <HeaderHUD
        telemetry={activeTelemetry}
        metTime={formatMet(metSeconds)}
        isSimulating={isSimulating}
        onToggleSimulate={() => setIsSimulating(!isSimulating)}
        onNextWaypoint={handleNextWaypoint}
        onReset={handleResetTraverse}
        onOpenJsonEditor={() => setIsJsonModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        instrumentStatuses={instrumentStatuses}
      />

      {/* Main Mission Control Dashboard Workspace */}
      <main className="flex-1 p-2 sm:p-3 max-w-[1600px] w-full mx-auto flex flex-col gap-2.5">
        {/* Layout Navigation & Sub-Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono bg-[#0A0A0A] p-2 rounded-sm border border-zinc-800">
          <div className="flex items-center gap-1">
            <span className="text-zinc-500 mr-2 hidden sm:inline text-[10px] uppercase tracking-wider">VIEWPORT MODE:</span>
            <button
              onClick={() => setViewMode('MISSION_CONTROL')}
              className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 text-[11px] ${
                viewMode === 'MISSION_CONTROL'
                  ? 'bg-[#005288]/40 text-sky-200 border border-[#006BB3] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ALL SUBSYSTEMS</span>
            </button>
            <button
              onClick={() => setViewMode('TRAVERSE_FOCUS')}
              className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 text-[11px] ${
                viewMode === 'TRAVERSE_FOCUS'
                  ? 'bg-[#005288]/40 text-sky-200 border border-[#006BB3] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>TRAVERSE &amp; MAP</span>
            </button>
            <button
              onClick={() => setViewMode('INSTRUMENT_FOCUS')}
              className={`px-3 py-1 rounded-sm transition-all flex items-center gap-1.5 text-[11px] ${
                viewMode === 'INSTRUMENT_FOCUS'
                  ? 'bg-[#005288]/40 text-sky-200 border border-[#006BB3] font-bold'
                  : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>INSTRUMENT SENSORS</span>
            </button>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportMissionReport}
              className="flex items-center gap-1.5 px-3 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-[11px] transition-colors"
            >
              <Download className="w-3 h-3 text-[#006BB3]" />
              <span>EXPORT MISSION LOG</span>
            </button>
          </div>
        </div>

        {/* Dynamic Grid Layout */}
        {viewMode === 'MISSION_CONTROL' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1">
            {/* Left Column (Traverse Map + Bio-Safety Quantization) - 6 cols */}
            <div className="lg:col-span-6 flex flex-col gap-2.5">
              {/* Interactive 2D Lunar South Pole Traverse Map */}
              <div className="flex-1 min-h-[380px]">
                <TraverseMap
                  waypoints={waypoints}
                  activeWaypointIndex={activeWaypointIndex}
                  onSelectWaypoint={handleSelectWaypoint}
                  activeTelemetry={activeTelemetry}
                />
              </div>

              {/* Bioastronautics Risk & Safe EVA Window Engine */}
              <div className="flex-1 min-h-[290px]">
                <BioSafetyOverview telemetry={activeTelemetry} />
              </div>
            </div>

            {/* Right Column (AI Flight Briefing & Instruments) - 6 cols */}
            <div className="lg:col-span-6 flex flex-col gap-2.5">
              {/* Gemini 3.7 Flash AI Flight Director Briefing & Q&A Terminal */}
              <div className="flex-1 min-h-[380px]">
                <AIBriefingTerminal
                  telemetry={activeTelemetry}
                  briefing={briefing}
                  isLoadingBriefing={isLoadingBriefing}
                  onRefreshBriefing={() => fetchBriefing(activeTelemetry)}
                  chatMessages={chatMessages}
                  onSendMessage={handleSendMessage}
                  isSendingMessage={isSendingMessage}
                />
              </div>

              {/* Drill Subsystem & ISRU Net Yield Engine */}
              <div className="flex-1 min-h-[290px]">
                <DrillAndISRU telemetry={activeTelemetry} />
              </div>
            </div>

            {/* Bottom Row: Detailed GPR Radar Cross Section & NGMS Spectrometer (Full Width) */}
            <div className="lg:col-span-6 min-h-[290px]">
              <GPRVisualizer telemetry={activeTelemetry} />
            </div>

            <div className="lg:col-span-6 min-h-[290px]">
              <NGMSSpectrometer telemetry={activeTelemetry} />
            </div>
          </div>
        )}

        {viewMode === 'TRAVERSE_FOCUS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 flex-1">
            <div className="lg:col-span-8 flex flex-col gap-2.5">
              <TraverseMap
                waypoints={waypoints}
                activeWaypointIndex={activeWaypointIndex}
                onSelectWaypoint={handleSelectWaypoint}
                activeTelemetry={activeTelemetry}
              />
              <BioSafetyOverview telemetry={activeTelemetry} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-2.5">
              <AIBriefingTerminal
                telemetry={activeTelemetry}
                briefing={briefing}
                isLoadingBriefing={isLoadingBriefing}
                onRefreshBriefing={() => fetchBriefing(activeTelemetry)}
                chatMessages={chatMessages}
                onSendMessage={handleSendMessage}
                isSendingMessage={isSendingMessage}
              />
            </div>
          </div>
        )}

        {viewMode === 'INSTRUMENT_FOCUS' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 flex-1">
            <GPRVisualizer telemetry={activeTelemetry} />
            <NGMSSpectrometer telemetry={activeTelemetry} />
            <DrillAndISRU telemetry={activeTelemetry} />
            <BioSafetyOverview telemetry={activeTelemetry} />
          </div>
        )}
      </main>

      {/* Footer Info */}
      <footer className="h-10 bg-[#0A0A0A] border-t border-[#222] flex items-center justify-between px-4 sm:px-6 font-mono text-[10px] text-zinc-500">
        <div className="flex items-center space-x-3">
          <span className="text-zinc-500 uppercase">SYSTEM STATUS:</span>
          <span className="flex items-center text-[#10B981]">
            <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full mr-1.5 animate-pulse"></span>
            ALL SYSTEMS NOMINAL
          </span>
          <span className="text-zinc-700 hidden sm:inline">|</span>
          <span className="text-zinc-500 hidden sm:inline">LATENCY: 42ms</span>
        </div>
        <div className="flex items-center space-x-3 text-zinc-500 uppercase">
          <span className="hidden md:inline">Lunar South Pole Data Network</span>
          <span className="text-zinc-800 hidden md:inline">//</span>
          <span>Confidential - NASA Internal Use Only</span>
        </div>
      </footer>

      {/* JSON Telemetry Ingest & Stress-Test Modal */}
      <TelemetryPayloadEditor
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        currentTelemetry={activeTelemetry}
        onIngestTelemetry={handleIngestTelemetry}
      />
    </div>
  );
}
