import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  geminiLiveVoiceService,
  GeminiLiveVoiceState,
  GeminiLiveMessage,
} from '../services/geminiLiveVoiceService';
import { getLanguageInitial, SUPPORTED_LANGUAGES, LANGUAGE_LIST } from '../data/languages';
import { VoiceOrbVisualizer } from './voice/VoiceOrbVisualizer';
import {
  Mic,
  MicOff,
  PhoneOff,
  Sparkles,
  Shield,
  Globe,
  Send,
  User,
  MessageSquare,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Radio,
  Waves,
  Keyboard,
  AlertCircle,
  ChevronDown,
  Zap,
} from 'lucide-react';

const BCP47_SPEECH_MAP: Record<string, string> = {
  ta: 'ta-IN (தமிழ்)',
  ml: 'ml-IN (മലയാളം)',
  kn: 'kn-IN (ಕನ್ನಡ)',
  te: 'te-IN (తెలుగు)',
  hi: 'hi-IN (हिंदी)',
  mr: 'mr-IN (मराठी)',
  bn: 'bn-IN (বাংলা)',
  gu: 'gu-IN (ગુજરાતી)',
  or: 'or-IN (ଓଡ଼ିଆ)',
  pa: 'pa-IN (ਪੰਜਾਬੀ)',
  as: 'as-IN (অসমীয়া)',
  en: 'en-IN (English)',
};

export const VoiceAssistantModal: React.FC = () => {
  const {
    showVoiceModal,
    setShowVoiceModal,
    selectedVoiceLanguageId,
    setSelectedVoiceLanguageId,
    currentStateConfig,
    currentLanguageConfig,
    updateUserProfile,
    activeMatches,
    setActiveTab,
    t,
  } = useApp();

  // Voice State & Telemetry
  const [voiceState, setVoiceState] = useState<GeminiLiveVoiceState>('CONNECTING');
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [messages, setMessages] = useState<GeminiLiveMessage[]>([]);
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTypingFallback, setShowTypingFallback] = useState<boolean>(false);
  const [typedInput, setTypedInput] = useState<string>('');
  const [voiceSpeed, setVoiceSpeed] = useState<number>(geminiLiveVoiceService.getSpeechRate());
  const [voiceMode, setVoiceMode] = useState<'fast' | 'studio'>(geminiLiveVoiceService.getVoiceMode());
  const [lastError, setLastError] = useState<string | null>(null);
  const [isWebSpeechSupported, setIsWebSpeechSupported] = useState<boolean>(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Check Web Speech API support on mount
  useEffect(() => {
    const supported = geminiLiveVoiceService.isSpeechRecognitionSupported();
    setIsWebSpeechSupported(supported);
  }, []);

  // Auto-scroll conversation transcript
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  // Connect to Gemini Voice Live Session & Web Speech Recognition
  useEffect(() => {
    if (!showVoiceModal) return;

    setLastError(null);
    setMessages([]);
    setInterimTranscript('');

    geminiLiveVoiceService.startSession(
      selectedVoiceLanguageId,
      currentStateConfig.name,
      {
        onStateChange: (st) => setVoiceState(st),
        onAudioLevel: (lvl) => setAudioLevel(lvl),
        onInterimTranscript: (txt) => setInterimTranscript(txt),
        onMessage: (msg) => {
          setInterimTranscript('');
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
        onProfileExtracted: (data) => {
          updateUserProfile(data);
        },
        onError: (err) => {
          setLastError(err);
        },
        onStopListening: (_reason) => {
          // Triggered when manual click or automatic 2-second pause triggers stop listening
        },
      }
    );

    return () => {
      geminiLiveVoiceService.endSession();
    };
  }, [showVoiceModal, selectedVoiceLanguageId, currentStateConfig.name]);

  const handleToggleMute = () => {
    const muted = geminiLiveVoiceService.toggleMute();
    setIsMuted(muted);
  };

  const handleEndCall = () => {
    geminiLiveVoiceService.endSession();
    setShowVoiceModal(false);
  };

  const handleToggleListening = () => {
    // Interruption Handler: If assistant is speaking or thinking, immediately halt audio and start listening
    if (voiceState === 'SPEAKING' || voiceState === 'THINKING') {
      geminiLiveVoiceService.interruptAndListen();
      return;
    }
    if (voiceState === 'LISTENING' || voiceState === 'USER_SPEAKING') {
      geminiLiveVoiceService.stopListening();
    } else {
      geminiLiveVoiceService.startListening();
    }
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    const txt = typedInput;
    setTypedInput('');
    geminiLiveVoiceService.sendTextMessage(txt);
  };

  const handleLanguageSelect = (langId: string) => {
    setSelectedVoiceLanguageId(langId);
    geminiLiveVoiceService.setLanguage(langId);
  };

  const handleSpeedChange = (newSpeed: number) => {
    geminiLiveVoiceService.setSpeechRate(newSpeed);
    setVoiceSpeed(newSpeed);
  };

  const handleVoiceModeChange = (mode: 'fast' | 'studio') => {
    geminiLiveVoiceService.setVoiceMode(mode);
    setVoiceMode(mode);
  };

  const handleCommitInterimNow = () => {
    geminiLiveVoiceService.commitInterimNow();
  };

  const getStatusBadge = () => {
    switch (voiceState) {
      case 'CONNECTING':
        return { label: 'CONNECTING...', color: 'bg-[#fef7ee] text-[#b45309] border-[#fde68a]' };
      case 'LISTENING':
        return voiceMode === 'fast'
          ? { label: '⚡ FAST VOICE ACTIVE • LISTENING', color: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' }
          : { label: 'WEB SPEECH ACTIVE • LISTENING', color: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' };
      case 'USER_SPEAKING':
        return { label: 'HEARING YOUR VOICE...', color: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' };
      case 'THINKING':
        return voiceMode === 'fast'
          ? { label: '⚡ STREAMING FAST REPLY...', color: 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]' }
          : { label: 'GEMINI THINKING...', color: 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]' };
      case 'SPEAKING':
        return voiceSpeed > 1.0
          ? { label: `ARIVOM SPEAKING (${voiceSpeed}x) ⚡`, color: 'bg-[#fdf2f8] text-[#9d174d] border-[#fbcfe8]' }
          : { label: 'ARIVOM SPEAKING...', color: 'bg-[#fdf2f8] text-[#9d174d] border-[#fbcfe8]' };
      case 'INTERRUPTED':
        return { label: 'INTERRUPTED (LISTENING)', color: 'bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]' };
      case 'ERROR':
        return { label: 'MICROPHONE NOTICE', color: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]' };
      default:
        return { label: 'READY TO SPEAK', color: 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]' };
    }
  };

  const starterSuggestions: Record<string, string[]> = {
    ta: [
      'வணக்கம்! நீங்கள் எப்படி எனக்கு உதவ முடியும்?',
      'விவசாயிகளுக்கான உதவி திட்டங்கள் என்ன?',
      'மாணவர்களுக்கான கல்வி உதவித்தொகை பற்றி கூறுங்கள்.',
    ],
    ml: [
      'നമസ്കാരം! എനിക്ക് എന്തൊക്കെ സഹായം ലഭിക്കും?',
      'കർഷകർക്കുള്ള പ്രധാന ആനുകൂല്യങ്ങൾ എന്തൊക്കെയാണ്?',
      'വിദ്യാർത്ഥികൾക്കുള്ള സ്കോളർഷിപ്പുകളെക്കുറിച്ച് പറയൂ.',
    ],
    kn: [
      'ನಮಸ್ಕಾರ! ನೀವು ನನಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      'ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಯೋಜನೆಗಳು ಯಾವುವು?',
      'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನದ ವಿವರಗಳನ್ನು ತಿಳಿಸಿ.',
    ],
    te: [
      'నమస్కారం! మీరు నాకు ఎలా సహాయపడగలరు?',
      'రైతుల కోసం ఉన్న ప్రభుత్వ పథకాలు ఏమిటి?',
      'విద్యార్థుల స్కాలర్‌షిప్‌ల గురించి చెప్పండి.',
    ],
    hi: [
      'नमस्ते! आप मेरी कैसे मदद कर सकते हैं?',
      'किसानों के लिए प्रमुख सरकारी योजनाएं क्या हैं?',
      'उच्च शिक्षा के लिए छात्रवृत्ति कैसे मिलती है?',
    ],
    mr: [
      'नमस्कार! तुम्ही मला कशी मदत करू शकता?',
      'शेतकऱ्यांसाठी कोणत्या शासकीय योजना आहेत?',
      'विद्यार्थ्यांसाठी शिष्यवृत्तींची माहिती सांगा.',
    ],
    bn: [
      'নমস্কার! আপনি আমাকে কীভাবে সাহায্য করতে পারেন?',
      'কৃষকদের জন্য সরকারি প্রকল্পগুলো কী কী?',
      'ছাত্রছাত্রীদের স্কলারশিপের তথ্য জানান।',
    ],
    gu: [
      'નમસ્તે! તમે મને કેવી રીતે મદદ કરી શકો છો?',
      'ખેડૂતો માટે કઈ સરકારી સહાય યોજનાઓ છે?',
      'વિદ્યાર્થીઓ માટે શિષ્યવૃત્તિની માહિતી આપો.',
    ],
    or: [
      'ନମସ୍କାର! ଆପଣ ମୋତେ କିପରି ସାହାଯ୍ୟ କରିପାରିବେ?',
      'କୃଷକମାନଙ୍କ ପାଇଁ କ’ଣ ସରକାରୀ ଯୋଜନା ଅଛି?',
      'ଛାତ୍ରବୃତ୍ତି ସମ୍ପର୍କରେ ସୂଚନା ଦିଅନ୍ତୁ।',
    ],
    pa: [
      'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਤੁਸੀਂ ਮੇਰੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦੇ ਹੋ?',
      'ਕਿਸਾਨਾਂ ਲਈ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਕਿਹੜੀਆਂ ਹਨ?',
      'ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਵਜ਼ੀਫ਼ੇ ਦੀ ਜਾਣਕਾਰੀ ਦਿਓ।',
    ],
    as: [
      'নমস্কাৰ! আপুনি মোক কিদৰে সহায় কৰিব পাৰিব?',
      'কৃষকসকলৰ বাবে চৰকাৰী আঁচনি কি কি আছে?',
      'ছাত্ৰ-ছাত্ৰীৰ বাবে জলপানীৰ তথ্য দিয়ক।',
    ],
    en: [
      'Hello! How can you help me today?',
      'Tell me about welfare initiatives for farmers.',
      'What scholarships are available for college students?',
    ],
  };

  const currentStarters = starterSuggestions[selectedVoiceLanguageId] || starterSuggestions.en;
  const status = getStatusBadge();
  const speechLangLabel = BCP47_SPEECH_MAP[selectedVoiceLanguageId] || 'ta-IN';
  const currentLang = SUPPORTED_LANGUAGES[selectedVoiceLanguageId] || SUPPORTED_LANGUAGES['ta'];

  if (!showVoiceModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#21191d]/50 backdrop-blur-xs animate-fade-in">
      {/* Sovereign Light Mode Modal Container */}
      <div className="bg-[#fff8f8] text-[#21191d] w-full h-full sm:h-[92vh] sm:max-w-5xl sm:rounded-3xl flex flex-col shadow-2xl border border-[#e8e1dc] overflow-hidden relative">
        {/* ========================================================= */}
        {/* TOP BAR: Brand, Live Voice Status, Controls (Light Theme) */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#e8e1dc] bg-[#faf8f3]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#4a1f2d] text-white flex items-center justify-center font-black text-base shadow-xs shrink-0">
              {getLanguageInitial(selectedVoiceLanguageId)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#4a1f2d] tracking-wider uppercase flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-[#4a1f2d] animate-pulse" />
                  Web Speech Direct Voice
                </span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold border ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-[11px] text-[#756a6f]">
                🎙️ Speech Locale: <strong className="text-[#21191d]">{speechLangLabel}</strong> • 📍 {currentStateConfig.name} • 🏛️ Civic Scheme Assistant • ⏱️ 2s Auto-Stop on Pause
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Conversation Language Selector Dropdown (All 12 Indian Languages) */}
            <div className="relative">
              <div className="flex items-center rounded-xl bg-white hover:bg-[#faf8f3] border border-[#e8e1dc] px-2.5 py-1.5 transition-colors text-xs font-bold shadow-xs">
                <Globe className="w-3.5 h-3.5 text-[#4a1f2d] shrink-0 mr-1.5" />
                <select
                  id="voice-language-select-dropdown"
                  value={selectedVoiceLanguageId}
                  onChange={(e) => handleLanguageSelect(e.target.value)}
                  className="bg-transparent text-[#21191d] font-bold text-xs outline-none cursor-pointer pr-4 appearance-none"
                  title="Select voice conversation and universal website language"
                >
                  {LANGUAGE_LIST.map((lang) => (
                    <option key={lang.id} value={lang.id} className="bg-white text-[#21191d]">
                      {lang.nativeName} ({lang.name})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-[#756a6f] -ml-3 pointer-events-none shrink-0" />
              </div>
            </div>

            {/* Mute Toggle */}
            <button
              type="button"
              id="voice-mute-toggle-btn"
              onClick={handleToggleMute}
              className={`p-2 rounded-xl transition-colors cursor-pointer border shadow-xs ${
                isMuted
                  ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/40'
                  : 'bg-white hover:bg-[#eedfe4] text-[#21191d] border-[#e8e1dc]'
              }`}
              title={isMuted ? 'Unmute Mic' : 'Mute Mic'}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-[#ba1a1a]" /> : <Mic className="w-4 h-4 text-[#4a1f2d]" />}
            </button>

            {/* End Call Button */}
            <button
              type="button"
              id="voice-end-call-btn"
              onClick={handleEndCall}
              className="p-2 rounded-xl bg-[#ba1a1a] hover:bg-[#93000a] text-white transition-colors cursor-pointer border border-[#ba1a1a] shadow-xs"
              title="End Voice Conversation"
            >
              <PhoneOff className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MULTI-LANGUAGE SELECTOR STRIP: Displays all 12 Languages */}
        {/* ========================================================= */}
        <div className="px-4 py-2.5 bg-[#fbf9f5] border-b border-[#e8e1dc] flex flex-wrap items-center justify-between gap-2.5 text-xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-[10px] font-bold text-[#4a1f2d] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
              <Globe className="w-3.5 h-3.5 text-[#4a1f2d]" />
              Languages ({LANGUAGE_LIST.length}):
            </span>
            {/* Scrollable pill container of all supported languages */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {LANGUAGE_LIST.map((lang) => {
                const isSelected = selectedVoiceLanguageId === lang.id;
                return (
                  <button
                    key={lang.id}
                    type="button"
                    id={`voice-lang-btn-${lang.id}`}
                    onClick={() => handleLanguageSelect(lang.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#4a1f2d] text-white shadow-xs'
                        : 'bg-white text-[#514346] hover:text-[#21191d] hover:bg-[#eedfe4] border border-[#e8e1dc]'
                    }`}
                    title={`Switch voice conversation to ${lang.name} (${lang.nativeName})`}
                  >
                    <span>{lang.nativeName}</span>
                    {isSelected && <CheckCircle2 className="w-3 h-3 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="text-[11px] text-[#756a6f] flex items-center gap-1.5 shrink-0 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-[#15803d] shrink-0 animate-pulse" />
            <span>Universal Sync: applies to voice & entire site</span>
          </div>
        </div>

        {/* Web Speech API browser compatibility notice if unsupported */}
        {!isWebSpeechSupported && (
          <div className="p-3 bg-[#fef2f2] border-b border-[#fecaca] text-[#b91c1c] text-xs flex items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-[#b91c1c] shrink-0" />
              <span>
                Web Speech API is not natively supported in this browser. Please use <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong> for direct microphone speech, or use text typing below.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTypingFallback(true)}
              className="px-2.5 py-1 rounded-lg bg-[#4a1f2d] text-white font-bold text-[11px]"
            >
              Switch to Typing
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN BODY: Split Voice Orb & Live Transcript Stream */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          {/* LEFT: Living Animated Voice Visualizer Stage (Light Theme) */}
          <div className="lg:col-span-5 p-3 sm:p-6 flex flex-col items-center justify-center text-center space-y-2 sm:space-y-4 border-b lg:border-b-0 lg:border-r border-[#e8e1dc] bg-[#faf8f3] relative">
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
              onClick={handleToggleListening}
              size={typeof window !== 'undefined' && window.innerWidth < 640 ? 120 : 170}
              langInitial={getLanguageInitial(selectedVoiceLanguageId)}
            />

            <div className="space-y-1">
              <span className="text-xs font-bold text-[#4a1f2d] tracking-wider uppercase block">
                {voiceState === 'SPEAKING'
                  ? 'Arivom Speaking'
                  : voiceState === 'USER_SPEAKING'
                  ? 'Hearing Your Voice...'
                  : voiceState === 'THINKING'
                  ? 'Gemini Thinking...'
                  : 'Speak Directly to AI'}
              </span>
              <p className="text-xs text-[#514346] max-w-xs leading-relaxed">
                No typing required. Speak aloud in <strong>{currentLang.nativeName} ({currentLang.name})</strong>—pausing for 2 seconds automatically stops listening and asks your query.
              </p>
            </div>

            {/* Direct Speech Recognition Action Button */}
            <button
              type="button"
              id="voice-visualizer-main-action-btn"
              onClick={handleToggleListening}
              className={`px-5 py-2.5 rounded-full font-bold text-xs transition-all cursor-pointer flex items-center gap-2 border shadow-sm ${
                voiceState === 'SPEAKING' || voiceState === 'THINKING'
                  ? 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca] hover:bg-[#fee2e2] active:scale-95 shadow-md'
                  : voiceState === 'LISTENING' || voiceState === 'USER_SPEAKING'
                  ? 'bg-[#15803d] text-white border-[#15803d] hover:bg-[#166534] animate-pulse'
                  : 'bg-[#4a1f2d] hover:bg-[#310a18] text-white border-[#4a1f2d]'
              }`}
              title={
                voiceState === 'SPEAKING' || voiceState === 'THINKING'
                  ? 'Click to stop assistant playback immediately and start listening'
                  : 'Toggle microphone'
              }
            >
              {voiceState === 'SPEAKING' ? (
                <>
                  <MicOff className="w-4 h-4 text-[#b91c1c] animate-pulse" />
                  <span>Tap to Interrupt & Speak</span>
                </>
              ) : voiceState === 'THINKING' ? (
                <>
                  <Mic className="w-4 h-4 text-[#b91c1c]" />
                  <span>Thinking... Tap to Interrupt</span>
                </>
              ) : voiceState === 'USER_SPEAKING' ? (
                <>
                  <Waves className="w-4 h-4 text-white animate-pulse" />
                  <span>Hearing voice • Auto-stops after 2s pause</span>
                </>
              ) : voiceState === 'LISTENING' ? (
                <>
                  <Waves className="w-4 h-4 text-white animate-pulse" />
                  <span>Microphone Active • Speak Now</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 text-white" />
                  <span>Tap to Speak to AI</span>
                </>
              )}
            </button>

            {lastError && (
              <p className="text-[11px] text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] px-3 py-1.5 rounded-xl max-w-xs">
                {lastError}
              </p>
            )}
          </div>

          {/* RIGHT: Real-time Live Conversational Transcript (Light Theme) */}
          <div className="lg:col-span-7 flex flex-col h-full bg-white overflow-hidden">
            <div className="p-2.5 px-4 border-b border-[#e8e1dc] flex flex-wrap items-center justify-between gap-2 text-xs bg-[#faf8f3]">
              <div className="flex items-center gap-2">
                <span className="font-bold text-[#21191d] flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-[#4a1f2d]" />
                  Live Conversation
                </span>
                <span className="text-[10px] text-[#4a1f2d] font-mono font-bold bg-[#eedfe4] px-2 py-0.5 rounded-md">
                  {messages.length} turns
                </span>
              </div>

              {/* Fast Reply & Speech Speed Controls */}
              <div className="flex items-center gap-1.5 ml-auto">
                <div className="flex items-center bg-white border border-[#e8e1dc] rounded-lg p-0.5 shadow-2xs text-[11px]">
                  <button
                    type="button"
                    id="speed-opt-normal"
                    onClick={() => handleSpeedChange(1.0)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
                      voiceSpeed === 1.0 ? 'bg-[#4a1f2d] text-white' : 'text-[#756a6f] hover:text-[#21191d]'
                    }`}
                    title="Normal 1.0x Voice Cadence"
                  >
                    1.0x
                  </button>
                  <button
                    type="button"
                    id="speed-opt-fast"
                    onClick={() => handleSpeedChange(1.15)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                      voiceSpeed === 1.15 ? 'bg-[#15803d] text-white' : 'text-[#756a6f] hover:text-[#15803d]'
                    }`}
                    title="Fast 1.15x Instant Voice Cadence"
                  >
                    ⚡ Fast
                  </button>
                  <button
                    type="button"
                    id="speed-opt-turbo"
                    onClick={() => handleSpeedChange(1.35)}
                    className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer flex items-center gap-0.5 ${
                      voiceSpeed === 1.35 ? 'bg-[#b45309] text-white' : 'text-[#756a6f] hover:text-[#b45309]'
                    }`}
                    title="Turbo 1.35x Rapid Voice Cadence"
                  >
                    🚀 Turbo
                  </button>
                </div>

                {/* Instant Stream vs Studio Mode */}
                <button
                  type="button"
                  id="voice-engine-mode-toggle"
                  onClick={() => handleVoiceModeChange(voiceMode === 'fast' ? 'studio' : 'fast')}
                  className={`px-2 py-1 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                    voiceMode === 'fast'
                      ? 'bg-[#ecfdf5] text-[#15803d] border-[#86efac]'
                      : 'bg-white text-[#756a6f] border-[#e8e1dc] hover:bg-[#faf8f3]'
                  }`}
                  title={voiceMode === 'fast' ? 'Instant Streaming Reply Active (Sub-second)' : 'Studio TTS Active'}
                >
                  {voiceMode === 'fast' ? '⚡ Instant Reply' : '🎙️ Studio Voice'}
                </button>
              </div>
            </div>

            {/* Scrollable Message List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-white">
              {messages.length === 0 && !interimTranscript ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 text-[#756a6f]">
                  <div className="w-14 h-14 rounded-full bg-[#faf8f3] border border-[#e8e1dc] flex items-center justify-center text-[#4a1f2d]">
                    <Mic className="w-7 h-7 animate-pulse" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="text-sm font-bold text-[#21191d]">Speak directly to Arivom</p>
                    <p className="text-xs text-[#514346] leading-relaxed">
                      Powered by the browser's Web Speech API. Ask anything in <strong>{currentLang.nativeName}</strong> without typing.
                    </p>
                  </div>

                  <div className="w-full space-y-1.5 pt-2 max-w-md">
                    <span className="text-[10px] font-bold text-[#4a1f2d] uppercase tracking-wider block text-left">
                      Suggested Voice Questions (Tap to Speak):
                    </span>
                    {currentStarters.map((starter, i) => (
                      <button
                        key={i}
                        type="button"
                        id={`voice-starter-btn-${i}`}
                        onClick={() => geminiLiveVoiceService.sendTextMessage(starter)}
                        className="w-full p-2.5 px-3.5 rounded-xl bg-[#faf8f3] hover:bg-[#eedfe4] border border-[#e8e1dc] text-left text-xs text-[#21191d] transition-colors cursor-pointer flex items-center justify-between group shadow-2xs"
                      >
                        <span className="line-clamp-1">{starter}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-[#4a1f2d] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isUser = msg.role === 'user';
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 animate-fade-in ${
                          isUser ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {!isUser && (
                          <div className="w-7 h-7 rounded-full bg-[#4a1f2d] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 shadow-2xs">
                            {getLanguageInitial(selectedVoiceLanguageId)}
                          </div>
                        )}

                        <div
                          className={`max-w-[85%] p-3.5 rounded-2xl space-y-1 ${
                            isUser
                              ? 'bg-[#4a1f2d] text-white rounded-tr-xs shadow-xs ml-auto border border-[#4a1f2d]'
                              : 'bg-[#faf8f3] text-[#21191d] border border-[#e8e1dc] rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                                isUser ? 'text-white/90' : 'text-[#4a1f2d]'
                              }`}
                            >
                              {isUser ? (
                                <>
                                  <Mic className="w-3 h-3" />
                                  Citizen Voice
                                </>
                              ) : (
                                'Arivom Scheme Advisor'
                              )}
                            </span>
                            <div className="flex items-center gap-2">
                              {!isUser && (
                                <button
                                  type="button"
                                  onClick={() => geminiLiveVoiceService.speak(msg.text)}
                                  className="opacity-80 hover:opacity-100 transition-opacity p-0.5 cursor-pointer text-[#4a1f2d]"
                                  title="Replay voice"
                                >
                                  <Volume2 className="w-3 h-3" />
                                </button>
                              )}
                              <span className={`text-[9px] font-mono ${isUser ? 'text-white/70' : 'text-[#756a6f]'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs sm:text-sm font-medium leading-relaxed">
                            {msg.text}
                            {msg.isStreaming && (
                              <span className="inline-block w-1.5 h-3 bg-[#4a1f2d] ml-1 animate-pulse" />
                            )}
                          </p>
                        </div>

                        {isUser && (
                          <div className="w-7 h-7 rounded-full bg-[#eedfe4] text-[#4a1f2d] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                            <User className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Real-time Web Speech Interim Transcription Bubble */}
                  {interimTranscript && (
                    <div className="flex items-start gap-2.5 justify-end animate-fade-in">
                      <div className="max-w-[85%] p-3 rounded-2xl bg-[#f0fdf4] border border-[#86efac] text-[#166534] rounded-tr-xs shadow-xs ml-auto space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-[10px] text-[#15803d] font-bold uppercase tracking-wider">
                            <Waves className="w-3 h-3 text-[#15803d] animate-pulse" />
                            <span>Hearing your voice...</span>
                            <span className="text-[9px] bg-[#dcfce7] text-[#166534] px-1.5 py-0.5 rounded-full font-mono font-medium">Auto-stops on 2s pause</span>
                          </div>
                          <button
                            type="button"
                            id="interim-send-now-btn"
                            onClick={handleCommitInterimNow}
                            className="px-2 py-0.5 rounded-full bg-[#15803d] text-white text-[10px] font-bold hover:bg-[#166534] transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Reply immediately without 2-second pause"
                          >
                            <span>Reply Now</span>
                            <Zap className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm font-medium italic text-[#166534]">
                          "{interimTranscript}"
                        </p>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-[#bbf7d0] text-[#15803d] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 animate-pulse">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ===================================================== */}
            {/* VOICE-FIRST PRIMARY CONTROL BAR (Bypasses Typing) */}
            {/* ===================================================== */}
            <div className="p-3.5 bg-[#faf8f3] border-t border-[#e8e1dc] space-y-2">
              {/* Active Voice Input Action Bar */}
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  id="voice-main-input-bar-btn"
                  onClick={handleToggleListening}
                  className={`flex-1 p-3 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2.5 border shadow-sm ${
                    voiceState === 'SPEAKING' || voiceState === 'THINKING'
                      ? 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca] hover:bg-[#fee2e2] active:scale-95 shadow-md'
                      : voiceState === 'USER_SPEAKING'
                      ? 'bg-[#15803d] text-white border-[#15803d] shadow-sm animate-pulse'
                      : voiceState === 'LISTENING'
                      ? 'bg-[#15803d] hover:bg-[#166534] text-white border-[#15803d] shadow-sm'
                      : 'bg-[#4a1f2d] hover:bg-[#310a18] text-white border-[#4a1f2d]'
                  }`}
                  title={
                    voiceState === 'SPEAKING' || voiceState === 'THINKING'
                      ? 'Click to interrupt assistant immediately and start speaking'
                      : 'Toggle microphone'
                  }
                >
                  {voiceState === 'SPEAKING' ? (
                    <>
                      <MicOff className="w-4 h-4 text-[#b91c1c] animate-pulse" />
                      <span>Speaking now — Tap to interrupt & speak</span>
                    </>
                  ) : voiceState === 'THINKING' ? (
                    <>
                      <Mic className="w-4 h-4 text-[#b91c1c]" />
                      <span>Generating answer — Tap to cancel & speak</span>
                    </>
                  ) : voiceState === 'USER_SPEAKING' ? (
                    <>
                      <Waves className="w-4 h-4 text-white animate-pulse" />
                      <span>Hearing your voice — Pausing 2s will automatically stop & answer</span>
                    </>
                  ) : voiceState === 'LISTENING' ? (
                    <>
                      <Mic className="w-4 h-4 text-white animate-pulse" />
                      <span>Listening... Speak your query (auto-stops on 2s pause)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Tap to Speak (Web Speech API)</span>
                    </>
                  )}
                </button>

                {/* Secondary Fallback Toggle for Typing */}
                <button
                  type="button"
                  id="toggle-typing-fallback-btn"
                  onClick={() => setShowTypingFallback(!showTypingFallback)}
                  className={`p-3 px-3.5 rounded-2xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    showTypingFallback
                      ? 'bg-[#eedfe4] text-[#4a1f2d] border-[#4a1f2d]/30'
                      : 'bg-white hover:bg-[#eedfe4] text-[#514346] border-[#e8e1dc]'
                  }`}
                  title="Toggle keyboard input fallback"
                >
                  <Keyboard className="w-4 h-4 text-[#4a1f2d]" />
                  <span className="hidden sm:inline">Type</span>
                </button>
              </div>

              {/* Collapsible Typing Fallback (for quiet environments) */}
              {showTypingFallback && (
                <form
                  onSubmit={handleSendText}
                  className="pt-2 flex items-center gap-2 animate-fade-in"
                >
                  <input
                    type="text"
                    id="voice-assistant-typing-input"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder={`Type your question in ${currentLang.nativeName} or English if you cannot speak...`}
                    className="flex-1 p-2.5 px-3 rounded-xl bg-white border border-[#e8e1dc] text-xs text-[#21191d] placeholder-[#756a6f] focus:border-[#4a1f2d] outline-none shadow-xs"
                  />
                  <button
                    type="submit"
                    id="voice-assistant-typing-send-btn"
                    disabled={!typedInput.trim()}
                    className="p-2.5 px-4 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ACTION BAR & CIVIC PRIVACY NOTE */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-4 bg-[#faf8f3] border-t border-[#e8e1dc] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#514346] text-[11px]">
            <Shield className="w-4 h-4 text-[#4a1f2d] shrink-0" />
            <span>
              <strong>Web Speech API:</strong> Direct in-browser speech recognition in {speechLangLabel}. Voice stays on your device.
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {activeMatches.length > 0 && (
              <button
                type="button"
                id="voice-view-matches-btn"
                onClick={() => {
                  geminiLiveVoiceService.endSession();
                  setShowVoiceModal(false);
                  setActiveTab('matches');
                }}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#eedfe4] text-[#4a1f2d] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5 border border-[#e8e1dc] shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#4a1f2d]" />
                <span>View {activeMatches.length} Matches in App</span>
              </button>
            )}

            <button
              type="button"
              id="voice-modal-close-btn"
              onClick={handleEndCall}
              className="px-5 py-2 rounded-xl bg-white hover:bg-[#eedfe4] text-[#21191d] font-bold text-xs transition-colors cursor-pointer border border-[#e8e1dc] shadow-xs"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
