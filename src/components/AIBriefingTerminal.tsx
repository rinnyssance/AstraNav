import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  ShieldAlert, 
  CheckCircle, 
  CheckSquare, 
  Square, 
  Bot, 
  User, 
  BookOpen,
  Terminal,
  FileCheck2,
  Copy,
  Check
} from 'lucide-react';
import { BioCoreTelemetry, AIBriefingResponse, ChatMessage } from '../types';

interface AIBriefingTerminalProps {
  telemetry: BioCoreTelemetry;
  briefing: AIBriefingResponse | null;
  isLoadingBriefing: boolean;
  onRefreshBriefing: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSendingMessage: boolean;
}

export const AIBriefingTerminal: React.FC<AIBriefingTerminalProps> = ({
  telemetry,
  briefing,
  isLoadingBriefing,
  onRefreshBriefing,
  chatMessages,
  onSendMessage,
  isSendingMessage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'BRIEFING' | 'TERMINAL_CHAT' | 'CHECKLIST'>('BRIEFING');
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});
  const [copiedBriefing, setCopiedBriefing] = useState(false);

  // Handle SpeechSynthesis audio playback for authentic flight comms
  const handlePlayVoiceBriefing = () => {
    if (!briefing) return;
    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = `AstraNav Bioastronautics Flight Briefing for Site ${telemetry.siteName}. Status is ${briefing.overallGoNoGo}. ${briefing.flightDirectorBriefing} ${briefing.toxicHazardAnalysis}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 1.05;
    utterance.pitch = 0.95;

    // Pick an English voice if available
    const voices = window.speechSynthesis.getVoices();
    const englishVoice = voices.find((v) => v.lang.startsWith('en') && (v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Zira')));
    if (englishVoice) {
      utterance.voice = englishVoice;
    }

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleToggleCheck = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleCopyBriefing = () => {
    if (!briefing) return;
    const text = `ASTRANAV PSR FLIGHT BRIEFING - ${telemetry.siteName} (${telemetry.siteId})\nSTATUS: ${briefing.overallGoNoGo}\n\n${briefing.flightDirectorBriefing}\n\nTOXIC HAZARD: ${briefing.toxicHazardAnalysis}\nRESOURCE POTENTIAL: ${briefing.resourcePotential.h2o_summary}\nAUTONOMY: ${briefing.resourcePotential.consumption_days_estimate} crew-days\nTRAVERSE ADVICE: ${briefing.traverseRecommendation}\n\nGROUNDING: ${briefing.groundingReference}`;
    navigator.clipboard.writeText(text);
    setCopiedBriefing(true);
    setTimeout(() => setCopiedBriefing(false), 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isSendingMessage) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="bg-[#0A0A0A] rounded-sm border border-zinc-800 p-4 flex flex-col h-full">
      {/* Header with Navigation Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pb-2.5 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-[#005288]/40 border border-[#006BB3]/60 flex items-center justify-center text-sky-300">
            <Sparkles className="w-3.5 h-3.5 text-[#006BB3]" />
          </div>
          <div>
            <h3 className="text-[11px] font-bold text-zinc-400 font-mono tracking-widest uppercase flex items-center gap-2">
              Gemini 3.7 Flash Bioastronautics Lead
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
              NASA AI Decision-Support Briefings &amp; Flight Director Console
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-[#050505] p-0.5 rounded-sm border border-zinc-800 text-[10px] font-mono">
          <button
            onClick={() => setActiveTab('BRIEFING')}
            className={`px-2 py-0.5 rounded-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'BRIEFING'
                ? 'bg-[#005288]/40 text-sky-200 border border-[#006BB3] font-bold'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <FileCheck2 className="w-3 h-3" />
            <span>AI BRIEFING</span>
          </button>

          <button
            onClick={() => setActiveTab('TERMINAL_CHAT')}
            className={`px-2 py-0.5 rounded-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'TERMINAL_CHAT'
                ? 'bg-[#005288]/40 text-sky-200 border border-[#006BB3] font-bold'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <Terminal className="w-3 h-3" />
            <span>FLIGHT Q&amp;A</span>
          </button>

          <button
            onClick={() => setActiveTab('CHECKLIST')}
            className={`px-2 py-0.5 rounded-sm transition-all flex items-center gap-1.5 ${
              activeTab === 'CHECKLIST'
                ? 'bg-[#005288]/40 text-sky-200 border border-[#006BB3] font-bold'
                : 'text-zinc-400 hover:text-zinc-200 border border-transparent'
            }`}
          >
            <CheckSquare className="w-3 h-3" />
            <span>CHECKLIST</span>
          </button>
        </div>
      </div>

      {/* TAB 1: AI Flight Director Briefing */}
      {activeTab === 'BRIEFING' && (
        <div className="flex-1 flex flex-col justify-between pt-2.5">
          {isLoadingBriefing ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-zinc-400 font-mono text-[11px] gap-3">
              <RefreshCw className="w-6 h-6 text-[#006BB3] animate-spin" />
              <span>SYNTHESIZING NASA BIOASTRONAUTICS BRIEFING (GEMINI 3.7 FLASH)...</span>
            </div>
          ) : briefing ? (
            <div className="space-y-2.5 overflow-y-auto pr-1 flex-1 max-h-[380px] scrollbar-thin">
              {/* Executive Briefing Banner */}
              <div className={`p-2.5 rounded-sm border flex flex-col gap-1.5 ${
                briefing.overallGoNoGo === 'GO'
                  ? 'bg-[#050505] border-[#10B981]/50 text-zinc-100'
                  : briefing.overallGoNoGo === 'CONDITIONAL_GO'
                  ? 'bg-[#050505] border-[#F59E0B]/50 text-zinc-100'
                  : 'bg-[#050505] border-[#EF4444]/60 text-zinc-100'
              }`}>
                <div className="flex items-center justify-between text-[10px] font-mono border-b border-zinc-800 pb-1">
                  <span className="font-bold tracking-wider uppercase text-white">
                    FLIGHT DIRECTOR EXECUTIVE DECISION: {briefing.overallGoNoGo}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase">{telemetry.siteName}</span>
                </div>
                <p className="text-xs font-sans leading-relaxed text-zinc-200">
                  {briefing.flightDirectorBriefing}
                </p>
              </div>

              {/* Critical Alerts Strip */}
              {briefing.criticalAlerts && briefing.criticalAlerts.length > 0 && (
                <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
                  <div className="text-[10px] font-mono text-[#F59E0B] font-bold mb-1 flex items-center gap-1.5 uppercase">
                    <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
                    Critical Bioastronautics Observations:
                  </div>
                  <ul className="space-y-1 text-xs font-sans text-zinc-300 pl-4 list-disc marker:text-[#006BB3]">
                    {briefing.criticalAlerts.map((alert, idx) => (
                      <li key={idx}>{alert}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Detailed Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Chemical & Airlock Safety */}
                <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
                  <div className="text-[10px] font-mono text-zinc-400 font-bold mb-1 uppercase">
                    Toxicity &amp; Airlock Safety:
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {briefing.toxicHazardAnalysis}
                  </p>
                </div>

                {/* Resource & Consumption Days */}
                <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
                  <div className="text-[10px] font-mono text-[#10B981] font-bold mb-1 uppercase">
                    Water Ice &amp; Crew Autonomy:
                  </div>
                  <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                    {briefing.resourcePotential.h2o_summary}
                  </p>
                  <div className="text-[10px] font-mono text-[#10B981] mt-1 font-semibold">
                    Estimated Yield: {briefing.resourcePotential.consumption_days_estimate} Crew Days (2 Astronauts)
                  </div>
                </div>
              </div>

              {/* Traverse Corridor Guidance */}
              <div className="p-2.5 rounded-sm bg-[#050505] border border-zinc-800">
                <div className="text-[10px] font-mono text-sky-400 font-bold mb-1 uppercase">
                  Rover Traverse Corridor Recommendation:
                </div>
                <p className="text-xs font-sans text-zinc-300 leading-relaxed">
                  {briefing.traverseRecommendation}
                </p>
              </div>

              {/* NASA Science Grounding Citation */}
              <div className="p-2 rounded-sm bg-[#050505] border border-zinc-800 flex items-center gap-2 text-[9px] font-mono text-zinc-500">
                <BookOpen className="w-3.5 h-3.5 text-[#006BB3] shrink-0" />
                <span className="line-clamp-1">{briefing.groundingReference}</span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-zinc-500 font-mono text-xs">
              <span>NO ACTIVE BRIEFING GENERATED</span>
            </div>
          )}

          {/* Action Toolbar */}
          <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between gap-2 mt-auto">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePlayVoiceBriefing}
                disabled={!briefing}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-[11px] font-mono font-medium border transition-all ${
                  isPlayingAudio
                    ? 'bg-amber-950/60 text-[#F59E0B] border-[#F59E0B] animate-pulse'
                    : 'bg-[#005288]/40 text-sky-200 border-[#006BB3]/60 hover:bg-[#005288]/60'
                }`}
              >
                {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                <span>{isPlayingAudio ? 'STOP VOICE' : 'VOICE READOUT'}</span>
              </button>

              <button
                onClick={handleCopyBriefing}
                disabled={!briefing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white text-[11px] font-mono border border-zinc-800 transition-all"
              >
                {copiedBriefing ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedBriefing ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>

            <button
              onClick={onRefreshBriefing}
              disabled={isLoadingBriefing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-sm bg-zinc-900 text-zinc-200 hover:bg-zinc-800 text-[11px] font-mono font-medium border border-zinc-800 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#006BB3] ${isLoadingBriefing ? 'animate-spin' : ''}`} />
              <span>RE-GENERATE</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: Flight Director Terminal Chat */}
      {activeTab === 'TERMINAL_CHAT' && (
        <div className="flex-1 flex flex-col justify-between pt-2.5">
          {/* Chat message stream */}
          <div className="space-y-2 overflow-y-auto pr-1 flex-1 max-h-[340px] scrollbar-thin">
            {chatMessages.length === 0 ? (
              <div className="text-center py-8 text-xs font-mono text-zinc-500">
                <Bot className="w-8 h-8 text-[#006BB3] mx-auto mb-2 opacity-80" />
                <p className="text-zinc-300">NASA Bioastronautics Lead AI Terminal Ready.</p>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Ask about suit limits, cryo-bearing fatigue, airlock decontamination, or GPR void hazards.
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5 justify-center">
                  <button
                    onClick={() => onSendMessage('Can crew perform manual core extraction here?')}
                    className="px-2 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono text-sky-300 border border-zinc-800"
                  >
                    "Can crew extract samples manually?"
                  </button>
                  <button
                    onClick={() => onSendMessage('What is the habitat airlock protocol for NH3 at this site?')}
                    className="px-2 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono text-sky-300 border border-zinc-800"
                  >
                    "Airlock protocol for NH3?"
                  </button>
                  <button
                    onClick={() => onSendMessage('Explain why the Safe EVA Window is capped at this duration.')}
                    className="px-2 py-1 rounded-sm bg-zinc-900 hover:bg-zinc-800 text-[10px] font-mono text-sky-300 border border-zinc-800"
                  >
                    "Explain Safe EVA Window limit"
                  </button>
                </div>
              </div>
            ) : (
              chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-6 h-6 rounded-sm bg-[#005288]/40 border border-[#006BB3]/60 flex items-center justify-center text-sky-300 shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div
                    className={`max-w-[85%] rounded-sm p-2 text-xs ${
                      msg.sender === 'user'
                        ? 'bg-[#005288]/30 text-sky-100 border border-[#006BB3]/60 font-sans'
                        : 'bg-[#050505] text-zinc-200 border border-zinc-800 font-sans'
                    }`}
                  >
                    <div className="text-[9px] font-mono text-zinc-500 mb-1 flex items-center justify-between uppercase">
                      <span>{msg.sender === 'user' ? 'FLIGHT DIRECTOR' : 'BIOASTRONAUTICS LEAD'}</span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
                  </div>
                  {msg.sender === 'user' && (
                    <div className="w-6 h-6 rounded-sm bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              ))
            )}
            {isSendingMessage && (
              <div className="flex gap-2 items-center text-xs font-mono text-[#006BB3]">
                <Bot className="w-3.5 h-3.5 animate-spin" />
                <span>BIOASTRONAUTICS LEAD COMPUTING RESPONSE...</span>
              </div>
            )}
          </div>

          {/* Chat input box */}
          <form onSubmit={handleSubmit} className="mt-2 pt-2 border-t border-zinc-800 flex gap-1.5">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Flight Director AI Co-Pilot (e.g. 'What is the risk of void collapse?')..."
              className="flex-1 bg-[#050505] border border-zinc-800 rounded-sm px-3 py-1.5 text-xs font-sans text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-[#006BB3]"
            />
            <button
              type="submit"
              disabled={isSendingMessage || !inputText.trim()}
              className="px-3 py-1.5 rounded-sm bg-[#005288] hover:bg-[#006BB3] disabled:opacity-50 text-white font-mono text-xs font-semibold flex items-center gap-1 transition-all border border-[#006BB3]"
            >
              <Send className="w-3 h-3" />
              <span>SEND</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: Actionable Bioastronautics Checklist */}
      {activeTab === 'CHECKLIST' && (
        <div className="flex-1 flex flex-col justify-between pt-2.5">
          <div className="space-y-1.5 overflow-y-auto pr-1 flex-1 max-h-[380px] scrollbar-thin">
            <div className="text-[10px] font-mono text-zinc-500 mb-2 flex items-center justify-between uppercase">
              <span>MISSION EGRESS PROTOCOL (CHECKLIST)</span>
              <span>{Object.values(checkedItems).filter(Boolean).length} / {briefing?.bioastronauticsChecklist?.length || 4} COMPLETED</span>
            </div>

            {(briefing?.bioastronauticsChecklist || [
              `Confirm xEMU suit active heating loop status for ${telemetry.env.surface_temp_k.toFixed(1)}K ambient floor.`,
              `Verify airlock particulate vacuum scrubbers are calibrated for volatile NH3/H2S detection.`,
              `Set countdown timer for safe EVA window: ${telemetry.computed.safe_eva_window_minutes} minutes.`,
              `Verify GPR ground radar continuous scan mode during rover advance.`,
            ]).map((item, idx) => {
              const isChecked = !!checkedItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => handleToggleCheck(idx)}
                  className={`p-2.5 rounded-sm border flex items-start gap-2.5 cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-950/20 border-emerald-800 text-emerald-200'
                      : 'bg-[#050505] border-zinc-800 text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <button className="mt-0.5 text-[#006BB3]">
                    {isChecked ? (
                      <CheckSquare className="w-4 h-4 text-[#10B981]" />
                    ) : (
                      <Square className="w-4 h-4 text-zinc-600" />
                    )}
                  </button>
                  <div className="text-xs font-sans leading-relaxed">
                    <span className={isChecked ? 'line-through opacity-70' : ''}>{item}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2.5 border-t border-zinc-800 flex items-center justify-between text-[10px] font-mono text-zinc-500 uppercase">
            <span>NASA Artemis Flight Controller Ruleset</span>
            <button
              onClick={() => setCheckedItems({})}
              className="text-zinc-600 hover:text-zinc-400 text-[10px]"
            >
              Reset Checklist
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
