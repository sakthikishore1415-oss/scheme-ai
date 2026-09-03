import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  realtimeVoiceService,
  RealtimeVoiceState,
  RealtimeMessage,
} from '../services/realtimeVoiceService';
import { getLanguageInitial, SUPPORTED_LANGUAGES } from '../data/languages';
import { VoiceOrbVisualizer } from './voice/VoiceOrbVisualizer';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  PhoneOff,
  Sparkles,
  ArrowRight,
  Shield,
  Keyboard,
  Globe,
  Send,
  User,
  MessageSquare,
  CheckCircle2,
  RefreshCw,
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
    setActiveTab,
    t,
  } = useApp();

  // Session & UI States
  const [voiceState, setVoiceState] = useState<RealtimeVoiceState>('CONNECTING');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<'VOICE' | 'TEXT'>('VOICE');
  const [typedInput, setTypedInput] = useState<string>('');
  const [showLangPicker, setShowLangPicker] = useState<boolean>(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll conversation transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect to Realtime Voice Session on Mount
  useEffect(() => {
    if (!showVoiceModal) return;

    setLastError(null);
    setMessages([]);

    realtimeVoiceService.startSession(
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
          if (name === 'update_citizen_profile') {
            updateUserProfile(args);
            return { status: 'success', updatedProfile: args };
          }
          if (name === 'get_matching_schemes') {
            return {
              count: activeMatches.length,
              schemes: activeMatches.slice(0, 3).map((m) => ({
                id: m.scheme.id,
                name: m.scheme.name,
                benefit: m.scheme.benefits?.amount || m.scheme.benefits?.shortSummary,
                department: m.scheme.department || m.scheme.authority,
              })),
            };
          }
          if (name === 'get_scheme_details') {
            const target = schemes.find((s) => s.id === args.schemeId) || schemes[0];
            return {
              name: target.name,
              benefits: target.benefits,
              documents: target.documents,
              howToApply: target.applicationUrl || target.officialSource,
              whereToApply: target.offlineApplicationCenter,
            };
          }
          return { status: 'success' };
        },
        onError: (err) => {
          setLastError(err);
        },
      }
    );

    return () => {
      realtimeVoiceService.endSession();
    };
  }, [showVoiceModal, selectedVoiceLanguageId, currentStateConfig.name]);

  if (!showVoiceModal) return null;

  const handleEndCall = () => {
    realtimeVoiceService.endSession();
    setShowVoiceModal(false);
  };

  const handleToggleMute = () => {
    const muted = realtimeVoiceService.toggleMute();
    setIsMuted(muted);
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const txt = typedInput;
    setTypedInput('');
    realtimeVoiceService.sendTextMessage(txt);
  };

  const getStatusBadge = () => {
    switch (voiceState) {
      case 'CONNECTING':
        return { label: 'CONNECTING...', color: 'bg-amber-400/20 text-amber-300 border-amber-400/30' };
      case 'LISTENING':
        return { label: 'LISTENING (SPEAK NOW)', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
      case 'USER_SPEAKING':
        return { label: 'USER SPEAKING...', color: 'bg-emerald-400/30 text-[#94f6c4] border-emerald-400/50' };
      case 'THINKING':
        return { label: 'EVALUATING SCHEMES...', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
      case 'SPEAKING':
        return { label: 'ARIVOM SPEAKING...', color: 'bg-[#fea619]/20 text-[#fea619] border-[#fea619]/40' };
      case 'ERROR':
        return { label: 'CONNECTION ERROR', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' };
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
                  Arivom Real-time Voice
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-[11px] text-[#d9e2ff]/80">
                📍 {currentStateConfig.name} • 🎙️ {currentLanguageConfig.nativeName} ({currentLanguageConfig.bcp47Code})
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
                  realtimeVoiceService.interruptPlayback();
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
                  : 'Arivom AI Voice'}
              </span>
              <p className="text-xs text-[#d9e2ff]/80 max-w-xs">
                Speak naturally like a phone call. Arivom will listen, understand, and answer.
              </p>
            </div>

            {/* Quick Interrupt Notice */}
            {voiceState === 'SPEAKING' && (
              <button
                onClick={() => realtimeVoiceService.interruptPlayback()}
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
                {messages.length} messages
              </span>
            </div>

            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2 text-[#d9e2ff]/60">
                  <Mic className="w-8 h-8 text-[#fea619] animate-pulse" />
                  <p className="text-xs font-medium">
                    Say something like: "I am a farmer from Thanjavur, looking for crop assistance."
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
              <div ref={messagesEndRef} />
            </div>

            {/* Text Mode Input Field (Available in both Voice and Text modes) */}
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
              <strong>Civic Privacy:</strong> Real-time audio is processed securely to evaluate verified government gazettes.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeMatches.length > 0 && (
              <button
                onClick={() => {
                  realtimeVoiceService.endSession();
                  setShowVoiceModal(false);
                  setActiveTab('matches');
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#fea619] hover:bg-[#ffb94f] text-[#092554] font-black text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <span>VIEW {activeMatches.length} MATCHES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

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
