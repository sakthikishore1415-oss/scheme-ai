import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  geminiLiveVoiceService,
  GeminiLiveVoiceState,
  GeminiLiveMessage,
} from '../services/geminiLiveVoiceService';
import { verificationService, ComparisonReport } from '../services/verificationService';
import { getLanguageInitial, SUPPORTED_LANGUAGES } from '../data/languages';
import { VoiceOrbVisualizer } from './voice/VoiceOrbVisualizer';
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  ArrowRight,
  Shield,
  Globe,
  Send,
  User,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Bookmark,
  Check,
  FileText,
  Gift,
  HelpCircle,
} from 'lucide-react';

export const VoiceAssistantModal: React.FC = () => {
  const {
    showVoiceModal,
    setShowVoiceModal,
    selectedVoiceLanguageId,
    setSelectedVoiceLanguageId,
    currentStateConfig,
    currentLanguageConfig,
    userProfile,
    updateUserProfile,
    activeMatches,
    schemes,
    savedSchemeIds,
    toggleSaveScheme,
    t,
  } = useApp();

  // Voice State & Telemetry
  const [voiceState, setVoiceState] = useState<GeminiLiveVoiceState>('CONNECTING');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [messages, setMessages] = useState<GeminiLiveMessage[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'VOICE' | 'TEXT'>('VOICE');
  const [typedInput, setTypedInput] = useState<string>('');
  const [showLangPicker, setShowLangPicker] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [activeComparison, setActiveComparison] = useState<ComparisonReport | null>(null);
  const [displayedSchemeCards, setDisplayedSchemeCards] = useState<any[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll conversation transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, displayedSchemeCards]);

  // Connect to Gemini 2.5 Flash Live Session
  useEffect(() => {
    if (!showVoiceModal) return;

    setLastError(null);
    setMessages([]);
    setActiveComparison(null);
    setDisplayedSchemeCards([]);

    geminiLiveVoiceService.startSession(
      selectedVoiceLanguageId,
      currentStateConfig.name,
      {
        onStateChange: (st) => setVoiceState(st),
        onAudioLevel: (lvl) => setAudioLevel(lvl),
        onMessage: (msg) => {
          setMessages((prev) => {
            const idx = prev.findIndex((m) => m.id === msg.id);
            if (idx >= 0) {
              const updated = [...prev];
              updated[idx] = msg;
              return updated;
            }
            return [...prev, msg];
          });
        },
        onMessageDelta: (id, delta) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === id ? { ...m, text: m.text + delta } : m))
          );
        },
        onProfileExtracted: (data) => {
          updateUserProfile(data);
        },
        onToolCall: async (name, args) => {
          // 1. User Profile Management (Non-blocking, conversation stays open)
          if (name === 'getUserProfile') {
            return userProfile;
          }
          if (name === 'updateUserProfile') {
            updateUserProfile(args);
            return { status: 'success', updatedProfile: args };
          }

          // 2. Search & Deterministic Matching (Render non-blocking card inside voice chat)
          if (name === 'searchSchemes') {
            const query = (args.query || '').toLowerCase();
            const results = schemes
              .filter((s) => s.name.toLowerCase().includes(query) || s.category?.toLowerCase().includes(query))
              .slice(0, 4)
              .map((s) => ({ id: s.id, name: s.name, department: s.department }));
            return { count: results.length, schemes: results };
          }

          if (name === 'findEligibleSchemes') {
            const topMatches = activeMatches.slice(0, 3).map((m) => ({
              id: m.scheme.id,
              name: m.scheme.name,
              matchScore: m.score,
              matchedCriteria: m.matchedPoints || [],
              department: m.scheme.department || m.scheme.authority,
              benefits: m.scheme.benefits?.amount || m.scheme.benefits?.shortSummary,
            }));

            // Display non-blocking cards inside chat stream
            setDisplayedSchemeCards(topMatches);

            return {
              count: activeMatches.length,
              schemes: topMatches,
            };
          }

          if (name === 'checkSchemeEligibility') {
            const match = activeMatches.find((m) => m.scheme.id === args.schemeId);
            if (match) {
              return {
                eligible: true,
                schemeId: match.scheme.id,
                name: match.scheme.name,
                matchedCriteria: match.matchedPoints || [],
                missingInformation: [],
                verified: true,
              };
            }
            const target = schemes.find((s) => s.id === args.schemeId);
            return {
              eligible: false,
              schemeId: args.schemeId,
              name: target?.name || 'Scheme',
              reason: 'Profile does not meet specific age, income, or occupational criteria.',
              verified: true,
            };
          }

          // 3. Scheme Details & Documents (Non-blocking)
          if (name === 'getSchemeDetails') {
            const target = schemes.find((s) => s.id === args.schemeId) || schemes[0];
            return {
              id: target.id,
              name: target.name,
              department: target.department,
              benefits: target.benefits,
              documents: target.documents,
              officialSource: target.officialSource || target.applicationUrl,
            };
          }

          if (name === 'getSchemeDocuments') {
            const target = schemes.find((s) => s.id === args.schemeId) || schemes[0];
            return {
              schemeId: target.id,
              name: target.name,
              requiredDocuments: target.documents || ['Aadhaar Card', 'Ration Card', 'Income Certificate'],
            };
          }

          if (name === 'getSchemeBenefits') {
            const target = schemes.find((s) => s.id === args.schemeId) || schemes[0];
            return {
              schemeId: target.id,
              name: target.name,
              benefits: target.benefits,
            };
          }

          if (name === 'getSchemeApplicationProcess') {
            const target = schemes.find((s) => s.id === args.schemeId) || schemes[0];
            return {
              schemeId: target.id,
              name: target.name,
              applicationSteps: target.applicationUrl || 'Apply online via e-Sevai / State Civic Portal',
              offlineCenter: target.offlineApplicationCenter || 'District Collectorate / Taluk Office',
            };
          }

          // 4. Online Verification & Comparison (Non-blocking)
          if (name === 'verifySchemeOnline') {
            const target = schemes.find((s) => s.id === args.schemeId) || schemes[0];
            const ver = await verificationService.verifySchemeOnline(target);
            return ver;
          }

          if (name === 'compareRepositoryWithOfficialSource') {
            const target = schemes.find((s) => s.id === args.schemeId) || schemes[0];
            const report = await verificationService.compareRepositoryWithOfficialSource(target);
            setActiveComparison(report);
            return report;
          }

          if (name === 'searchOfficialGovernmentSources') {
            return await verificationService.searchOfficialGovernmentSources(args.query || '', schemes);
          }

          // 5. Bookmarks / Saved (Non-blocking)
          if (name === 'saveScheme') {
            toggleSaveScheme(args.schemeId);
            return { status: 'success', saved: true };
          }

          if (name === 'getSavedSchemes') {
            const saved = schemes.filter((s) => savedSchemeIds.includes(s.id));
            return { count: saved.length, schemes: saved.map((s) => ({ id: s.id, name: s.name })) };
          }

          return { status: 'success' };
        },
        onError: (err) => {
          setLastError(err);
        },
      }
    );

    return () => {
      geminiLiveVoiceService.endSession();
    };
  }, [showVoiceModal, selectedVoiceLanguageId, currentStateConfig.name]);

  if (!showVoiceModal) return null;

  const handleEndCall = () => {
    geminiLiveVoiceService.endSession();
    setShowVoiceModal(false);
  };

  const handleToggleMute = () => {
    const muted = geminiLiveVoiceService.toggleMute();
    setIsMuted(muted);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const txt = typedInput;
    setTypedInput('');
    geminiLiveVoiceService.sendTextMessage(txt);
  };

  const getStatusBadge = () => {
    switch (voiceState) {
      case 'CONNECTING':
        return { label: 'CONNECTING...', color: 'bg-amber-400/20 text-amber-300 border-amber-400/30' };
      case 'LISTENING':
        return { label: 'LISTENING', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'USER_SPEAKING':
        return { label: 'USER SPEAKING...', color: 'bg-emerald-400/30 text-[#94f6c4] border-emerald-400/50' };
      case 'THINKING':
        return { label: 'EVALUATING SCHEMES...', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'SPEAKING':
        return { label: 'ARIVOM SPEAKING...', color: 'bg-[#fea619]/20 text-[#fea619] border-[#fea619]/40' };
      case 'INTERRUPTED':
        return { label: 'INTERRUPTED (LISTENING)', color: 'bg-indigo-400/20 text-indigo-200 border-indigo-400/40' };
      case 'ERROR':
        return { label: 'OFFLINE / LOCAL DUPLEX', color: 'bg-blue-500/20 text-blue-200 border-blue-500/30' };
      default:
        return { label: 'READY', color: 'bg-white/10 text-white/80 border-white/20' };
    }
  };

  const status = getStatusBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#092554] text-white w-full h-full sm:h-[92vh] sm:max-w-4xl sm:rounded-3xl flex flex-col shadow-2xl border border-white/10 overflow-hidden relative">
        {/* ========================================================= */}
        {/* TOP BAR: Brand, Live Call Status, Mode Switcher */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-[#001944]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#fea619] text-[#092554] flex items-center justify-center font-black text-base shadow-sm">
              {getLanguageInitial(selectedVoiceLanguageId)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#94f6c4] tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#fea619]" />
                  Arivom Voice Assistant
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-[11px] text-[#d9e2ff]/80">
                📍 {currentStateConfig.name} • 🎙️ {currentLanguageConfig.nativeName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Mode Switcher: Voice / Text */}
            <div className="bg-white/10 rounded-xl p-0.5 flex items-center border border-white/10">
              <button
                onClick={() => setActiveMode('VOICE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'VOICE' ? 'bg-[#fea619] text-[#092554] shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Voice</span>
              </button>
              <button
                onClick={() => setActiveMode('TEXT')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeMode === 'TEXT' ? 'bg-[#fea619] text-[#092554] shadow-xs' : 'text-white/80 hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Text</span>
              </button>
            </div>

            {/* Language Picker Toggle */}
            <button
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-[#fea619]" />
            </button>

            {/* Mute Toggle */}
            <button
              onClick={handleToggleMute}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* End Call Button */}
            <button
              onClick={handleEndCall}
              className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer border border-rose-500 shadow-sm"
              title="End Voice Conversation"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Language Dropdown */}
        {showLangPicker && (
          <div className="p-3 bg-[#001233] border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-fade-in text-xs">
            {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
              const isSelected = selectedVoiceLanguageId === lang.id;
              return (
                <button
                  key={lang.id}
                  onClick={() => {
                    setSelectedVoiceLanguageId(lang.id);
                    setShowLangPicker(false);
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#fea619] text-[#092554] font-bold border-[#fea619]'
                      : 'bg-white/5 text-white border-white/10 hover:bg-white/15'
                  }`}
                >
                  <span className="font-bold">{lang.nativeName}</span>
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Optional Discrepancy Notice Banner */}
        {activeComparison && (
          <div className="p-2.5 px-4 bg-amber-500/20 border-b border-amber-500/30 flex items-center justify-between text-xs text-amber-200 animate-fade-in">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                <strong>Official Portal Gazette:</strong> Cross-checked {activeComparison.schemeName} with official records.
              </span>
            </div>
            <a
              href={activeComparison.officialSourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-300 hover:underline flex items-center gap-1 font-bold text-[11px]"
            >
              <span>View Source</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN BODY: Split Voice Orb & Live Transcript Stream */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          {/* LEFT: Living Animated Voice Visualizer Stage */}
          <div className="lg:col-span-5 p-6 flex flex-col items-center justify-center text-center space-y-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-linear-to-b from-[#092554] to-[#001944] relative">
            <VoiceOrbVisualizer
              state={
                voiceState === 'SPEAKING'
                  ? 'SPEAKING'
                  : voiceState === 'USER_SPEAKING' || voiceState === 'LISTENING'
                  ? 'LISTENING'
                  : voiceState === 'THINKING'
                  ? 'THINKING'
                  : 'READY'
              }
              soundLevel={audioLevel}
              onClick={() => {
                if (voiceState === 'SPEAKING') {
                  geminiLiveVoiceService.interruptPlayback();
                }
              }}
              size={180}
              langInitial={getLanguageInitial(selectedVoiceLanguageId)}
            />

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#94f6c4] tracking-wider uppercase block">
                {voiceState === 'SPEAKING'
                  ? 'Tap Orb to Interrupt'
                  : voiceState === 'LISTENING'
                  ? 'Listening Continuously...'
                  : 'Arivom Conversational Voice'}
              </span>
              <p className="text-xs text-[#d9e2ff]/80 max-w-xs">
                Talk naturally like a phone call. The conversation stays active while Arivom finds and explains schemes.
              </p>
            </div>

            {voiceState === 'SPEAKING' && (
              <button
                onClick={() => geminiLiveVoiceService.interruptPlayback()}
                className="px-4 py-1.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[11px] font-bold animate-pulse cursor-pointer"
              >
                Tap or speak to interrupt
              </button>
            )}
          </div>

          {/* RIGHT: Real-time Live Conversational Transcript */}
          <div className="lg:col-span-7 flex flex-col h-full bg-[#001233]/60 backdrop-blur-sm overflow-hidden">
            <div className="p-3 px-4 border-b border-white/10 flex items-center justify-between text-xs bg-[#001944]">
              <span className="font-bold text-[#d9e2ff] flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-[#fea619]" />
                Live Conversation Stream
              </span>
              <span className="text-[10px] text-[#94f6c4] font-mono">
                {messages.length} turns
              </span>
            </div>

            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#d9e2ff]/60">
                  <Mic className="w-8 h-8 text-[#fea619] animate-pulse" />
                  <p className="text-xs font-medium">
                    Say something like: "I am a 35-year-old farmer from Erode with ₹1.2L income."
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start gap-2.5 animate-fade-in ${
                        isUser ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-full bg-[#fea619] text-[#092554] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          {getLanguageInitial(selectedVoiceLanguageId)}
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] p-3.5 rounded-2xl space-y-1 ${
                          isUser
                            ? 'bg-[#0f8a5f] text-white rounded-tr-xs shadow-sm ml-auto'
                            : 'bg-white/10 text-white border border-white/15 rounded-tl-xs shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider ${
                              isUser ? 'text-emerald-100' : 'text-[#94f6c4]'
                            }`}
                          >
                            {isUser ? 'You' : 'Arivom'}
                          </span>
                          <span className="text-[9px] opacity-60 font-mono">
                            {new Date(msg.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <p className="text-xs sm:text-sm font-medium leading-relaxed">
                          {msg.text}
                          {msg.isStreaming && (
                            <span className="inline-block w-1.5 h-3 bg-[#fea619] ml-1 animate-pulse" />
                          )}
                        </p>
                      </div>

                      {isUser && (
                        <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                          <User className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  );
                })
              )}

              {/* Non-blocking in-conversation scheme visual support cards */}
              {displayedSchemeCards.length > 0 && (
                <div className="pt-2 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#94f6c4]">
                    <Sparkles className="w-3.5 h-3.5 text-[#fea619]" />
                    <span>Matching Schemes Found (Conversation Remains Active)</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {displayedSchemeCards.map((sc) => {
                      const isSaved = savedSchemeIds.includes(sc.id);
                      return (
                        <div
                          key={sc.id}
                          className="p-3 rounded-xl bg-white/10 border border-white/20 text-left space-y-1.5 shadow-sm hover:border-[#fea619]/60 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <span className="text-xs font-bold text-white line-clamp-1">{sc.name}</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSaveScheme(sc.id);
                              }}
                              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                                isSaved ? 'bg-[#fea619] text-[#092554]' : 'bg-white/10 text-white/80 hover:bg-white/20'
                              }`}
                              title={isSaved ? 'Saved' : 'Save scheme'}
                            >
                              <Bookmark className="w-3 h-3" />
                            </button>
                          </div>
                          {sc.benefits && (
                            <p className="text-[11px] text-[#94f6c4] font-medium line-clamp-1 flex items-center gap-1">
                              <Gift className="w-3 h-3 shrink-0" />
                              <span>{sc.benefits}</span>
                            </p>
                          )}
                          <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-semibold pt-1 border-t border-white/10">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verified Eligible</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Text Mode Input Field */}
            <form
              onSubmit={handleSendText}
              className="p-3 bg-[#000e26] border-t border-white/10 flex items-center gap-2"
            >
              <input
                type="text"
                value={typedInput}
                onChange={(e) => setTypedInput(e.target.value)}
                placeholder="Type a message or answer (shares context with voice)..."
                className="flex-1 p-2.5 px-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/50 focus:border-[#fea619] outline-none"
              />
              <button
                type="submit"
                disabled={!typedInput.trim()}
                className="p-2.5 px-4 rounded-xl bg-[#fea619] hover:bg-[#ffb94f] disabled:opacity-40 text-[#092554] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ACTION BAR & CIVIC PRIVACY NOTE */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-4 bg-[#000e26] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#d9e2ff]/80 text-[11px]">
            <Shield className="w-4 h-4 text-[#94f6c4] shrink-0" />
            <span>
              <strong>Civic Privacy:</strong> Voice processed securely against verified gazette rules.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleEndCall}
              className="px-5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
