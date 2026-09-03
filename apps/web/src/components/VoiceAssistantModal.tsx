import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getVoicePack } from '../data/locales';
import { speechService } from '../utils/speech';
import { extractProfileFromSpokenText, translateToEnglish, ExtractedProfileData } from '../utils/nlpExtractor';
import { detectLanguageFromText } from '../utils/languageDetector';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { VoiceOrbVisualizer, VoiceOrbState } from './voice/VoiceOrbVisualizer';
import {
  ConversationPhase,
  ConversationTurn,
  parseVoiceIntent,
  generateFollowUpQuestion,
  generateSchemeExplanation,
} from '../utils/voiceConversationEngine';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  Shield,
  Keyboard,
  Globe,
  Sliders,
  BookmarkPlus,
  HelpCircle,
  PhoneCall,
  MapPin,
  Send,
  User,
  Bot,
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
    setActiveTab,
    triggerMatchCelebration,
    activeMatches,
    logCitizenCallStep,
    schemes,
    toggleSaveScheme,
    savedSchemeIds,
  } = useApp();

  // Conversational Lifecycle States
  const [phase, setPhase] = useState<ConversationPhase>('GREETING');
  const [orbState, setOrbState] = useState<VoiceOrbState>('READY');
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [currentAssistantSpeech, setCurrentAssistantSpeech] = useState<string>('');
  const [activeSentence, setActiveSentence] = useState<string>('');
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedProfileData | null>(null);

  // Audio & Interaction Settings
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(0.92); // Calm, accessible citizen pace
  const [showTypingFallback, setShowTypingFallback] = useState<boolean>(false);
  const [typedMessage, setTypedMessage] = useState<string>('');
  const [showLangPicker, setShowLangPicker] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0);

  const voicePack = getVoicePack(selectedVoiceLanguageId);
  const recognitionRef = useRef<any>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll conversation timeline
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationHistory, liveTranscript, currentAssistantSpeech]);

  // Assistant speaks a message aloud & adds to conversation history
  const assistantSay = (
    text: string,
    actionButtons?: { label: string; action: string }[],
    newPhase?: ConversationPhase,
    onSpeechEnd?: () => void
  ) => {
    setCurrentAssistantSpeech(text);
    setActiveSentence(text);
    setOrbState('SPEAKING');

    if (newPhase) setPhase(newPhase);

    const turnId = `asst-${Date.now()}`;
    const englishTrans = translateToEnglish(text, selectedVoiceLanguageId);

    setConversationHistory((prev) => [
      ...prev,
      {
        id: turnId,
        role: 'assistant',
        text,
        englishTranslation: englishTrans,
        timestamp: Date.now(),
        actionButtons,
      },
    ]);

    if (!isMuted) {
      speechService.speak(
        text,
        selectedVoiceLanguageId,
        () => {
          setOrbState('SPEAKING');
        },
        () => {
          setOrbState('READY');
          if (onSpeechEnd) onSpeechEnd();
        },
        () => {
          setOrbState('READY');
        }
      );
    } else {
      setTimeout(() => {
        setOrbState('READY');
        if (onSpeechEnd) onSpeechEnd();
      }, 1500);
    }
  };

  // Initial greeting upon opening
  useEffect(() => {
    if (showVoiceModal) {
      setPhase('GREETING');
      setConversationHistory([]);
      setLiveTranscript('');
      setExtractedData(null);
      setShowTypingFallback(false);

      const welcomeText =
        selectedVoiceLanguageId === 'ta'
          ? 'வணக்கம்! அறிவோம் திட்டம் உங்களை வரவேற்கிறது. உங்கள் நலனுக்கான அரசு திட்டங்களை கண்டறிய நான் உதவலாமா?'
          : 'Welcome to Arivom Thittam. I am your civic companion. May I help you find government welfare schemes you are entitled to?';

      assistantSay(
        welcomeText,
        [
          { label: selectedVoiceLanguageId === 'ta' ? 'ஆம், தொடரலாம்' : 'Yes, proceed', action: 'START_DETAILS' },
          { label: selectedVoiceLanguageId === 'ta' ? 'மொழி மாற்று' : 'Change Language', action: 'OPEN_LANG_PICKER' },
        ],
        'PERMISSION'
      );
    } else {
      speechService.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    }
  }, [showVoiceModal, selectedVoiceLanguageId]);

  if (!showVoiceModal) return null;

  // Interruption / Barge-in: Stop current speech immediately
  const handleInterruptSpeech = () => {
    speechService.stop();
    setOrbState('READY');
  };

  // Start Real-Time Voice Listening
  const handleToggleListening = () => {
    if (orbState === 'LISTENING') {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
      setOrbState('READY');
      return;
    }

    handleInterruptSpeech();
    setOrbState('LISTENING');
    setLiveTranscript('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = currentLanguageConfig.bcp47Code || 'ta-IN';
        recognition.interimResults = true;
        recognition.continuous = false;

        let finalCaptured = '';

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          finalCaptured = transcript;
          setLiveTranscript(transcript);
          setAudioLevel(0.8);
        };

        recognition.onend = () => {
          setAudioLevel(0);
          if (finalCaptured.trim()) {
            handleUserUtterance(finalCaptured);
          } else {
            setOrbState('READY');
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setOrbState('ERROR');
          setAudioLevel(0);
          assistantSay(
            voicePack.errorVoicePrompt,
            [{ label: 'Tap to Speak Again', action: 'RETRY_MIC' }],
            phase
          );
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }

    setOrbState('ERROR');
    setShowTypingFallback(true);
    assistantSay(
      'Microphone recognition is unavailable in this browser. Please use the accessible text typing box below.',
      [],
      phase
    );
  };

  // Core Conversational Turn Handler
  const handleUserUtterance = (text: string) => {
    setOrbState('THINKING');
    setLiveTranscript('');

    // Add user utterance to history
    const userTurnId = `user-${Date.now()}`;
    const englishTrans = translateToEnglish(text, selectedVoiceLanguageId);

    setConversationHistory((prev) => [
      ...prev,
      {
        id: userTurnId,
        role: 'user',
        text,
        englishTranslation: englishTrans,
        timestamp: Date.now(),
      },
    ]);

    const intent = parseVoiceIntent(text);

    // 1. Voice Command handling
    if (intent === 'REPEAT') {
      assistantSay(currentAssistantSpeech, undefined, phase);
      return;
    }

    if (intent === 'SPEAK_SLOWER') {
      setSpeechRate(0.8);
      assistantSay(
        selectedVoiceLanguageId === 'ta'
          ? 'நிச்சயமாக, இனி நான் மெதுவாக பேசுகிறேன்.'
          : 'Understood. I will speak more slowly and clearly.',
        undefined,
        phase
      );
      return;
    }

    if (intent === 'CHANGE_LANGUAGE') {
      setShowLangPicker(true);
      assistantSay(
        'Please select your preferred regional language from the menu above.',
        undefined,
        phase
      );
      return;
    }

    if (intent === 'DOCUMENTS_REQUIRED') {
      assistantSay(
        voicePack.documentExplanation([]),
        [{ label: 'View Scheme Checklist', action: 'GO_TO_MATCHES' }],
        'NEXT_ACTIONS'
      );
      return;
    }

    if (intent === 'SAVE_SCHEME') {
      if (activeMatches.length > 0) {
        toggleSaveScheme(activeMatches[0].scheme.id);
        assistantSay(
          selectedVoiceLanguageId === 'ta'
            ? 'திட்டம் உங்கள் ஆவணப் பெட்டகத்தில் வெற்றிகரமாக சேமிக்கப்பட்டது!'
            : 'The scheme has been safely bookmarked in your Locker.',
          [{ label: 'View Saved Schemes', action: 'GO_TO_SAVED' }],
          'NEXT_ACTIONS'
        );
      }
      return;
    }

    // 2. Extract citizen profile demographics from text
    const extracted = extractProfileFromSpokenText(text, selectedVoiceLanguageId);
    setExtractedData((prev) => ({
      ...prev,
      ...extracted,
    }));

    // Conversational state transitions
    if (phase === 'GREETING' || phase === 'PERMISSION') {
      // Transition to collecting basics
      const askBasics =
        selectedVoiceLanguageId === 'ta'
          ? 'நன்றி! உங்கள் பெயர், வயது மற்றும் உங்கள் தொழில் என்ன என்று கூறுங்கள்?'
          : 'Thank you! Could you please share your name, age, and current occupation?';

      assistantSay(askBasics, undefined, 'COLLECTING_BASICS');
      return;
    }

    if (phase === 'COLLECTING_BASICS') {
      const activeProf = extracted.occupation || 'farmer';
      const followUpQuestion = generateFollowUpQuestion(activeProf, selectedVoiceLanguageId);

      assistantSay(
        `${voicePack.heardConfirmation(text)} ${followUpQuestion}`,
        undefined,
        'ADAPTIVE_FOLLOWUP'
      );
      return;
    }

    if (phase === 'ADAPTIVE_FOLLOWUP' || phase === 'CONFIRMATION') {
      // Update store with finalized profile
      const prof = extractedData?.occupation || extracted.occupation || 'Farmer';
      const age = extractedData?.age || extracted.age || 42;

      updateUserProfile({
        name: extractedData?.beneficiary || userProfile?.name || 'Citizen',
        age,
        occupation: prof,
        annualIncome: extractedData?.annualIncome || 120000,
        need: extractedData?.need || 'general',
        district: userProfile?.district || currentStateConfig.districts[0],
        state: currentStateConfig.id,
      });

      // Calculate and announce matches
      const eligibleCount = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length;
      const countToAnnounce = eligibleCount > 0 ? eligibleCount : Math.max(3, activeMatches.length);

      triggerMatchCelebration();

      const topSchemeName = activeMatches[0]?.scheme?.nativeName || activeMatches[0]?.scheme?.name || 'முதலமைச்சரின் உழவர் பாதுகாப்பு திட்டம்';
      const topSchemeNameEn = activeMatches[0]?.scheme?.name || 'State Farmer Support Scheme';

      const summary =
        selectedVoiceLanguageId === 'ta'
          ? `உங்கள் விவரங்களின் அடிப்படையில், ${countToAnnounce} அரசு நலத்திட்டங்கள் உங்களுக்கு பொருந்தக்கூடும். முதல் திட்டம்: ${topSchemeName}. மேலும் விவரங்களை அறிய விரும்புகிறீர்களா?`
          : `Based on the details you shared, ${countToAnnounce} government schemes may be suitable for you. Top match: ${topSchemeNameEn}. Would you like me to explain the benefits or required documents?`;

      assistantSay(
        summary,
        [
          { label: 'Explain Scheme Benefits', action: 'EXPLAIN_SCHEME' },
          { label: 'Required Documents', action: 'SHOW_DOCS' },
          { label: 'View All Matches', action: 'GO_TO_MATCHES' },
        ],
        'MATCH_ANNOUNCEMENT'
      );
    }
  };

  const handleActionClick = (action: string) => {
    if (action === 'START_DETAILS') {
      assistantSay(
        selectedVoiceLanguageId === 'ta'
          ? 'உங்கள் வயது மற்றும் தொழிலை கூறுங்கள்?'
          : 'Could you please state your age and occupation?',
        undefined,
        'COLLECTING_BASICS'
      );
    } else if (action === 'OPEN_LANG_PICKER') {
      setShowLangPicker(true);
    } else if (action === 'RETRY_MIC') {
      handleToggleListening();
    } else if (action === 'EXPLAIN_SCHEME') {
      if (activeMatches.length > 0) {
        const explanation = generateSchemeExplanation(
          activeMatches[0].scheme,
          selectedVoiceLanguageId
        );
        assistantSay(
          explanation,
          [
            { label: 'Required Documents', action: 'SHOW_DOCS' },
            { label: 'Save Scheme', action: 'SAVE_TOP' },
            { label: 'View All Matches', action: 'GO_TO_MATCHES' },
          ],
          'DEEP_DIVE'
        );
      } else {
        assistantSay(
          selectedVoiceLanguageId === 'ta'
            ? 'இந்த திட்டம் நேரடி பண உதவி மற்றும் மானியங்களை வழங்குகிறது.'
            : 'This scheme provides direct financial subsidy and welfare support.',
          [{ label: 'View All Matches', action: 'GO_TO_MATCHES' }],
          'DEEP_DIVE'
        );
      }
    } else if (action === 'SHOW_DOCS') {
      assistantSay(
        voicePack.documentExplanation([]),
        [{ label: 'View Full Matches', action: 'GO_TO_MATCHES' }],
        'NEXT_ACTIONS'
      );
    } else if (action === 'SAVE_TOP') {
      if (activeMatches.length > 0) {
        toggleSaveScheme(activeMatches[0].scheme.id);
        assistantSay(
          selectedVoiceLanguageId === 'ta'
            ? 'திட்டம் உங்கள் சேமிக்கப்பட்ட பட்டியலில் சேர்க்கப்பட்டது!'
            : 'Scheme successfully saved to your profile!',
          [{ label: 'View Matches', action: 'GO_TO_MATCHES' }],
          'NEXT_ACTIONS'
        );
      }
    } else if (action === 'GO_TO_MATCHES') {
      speechService.stop();
      setShowVoiceModal(false);
      setActiveTab('matches');
    } else if (action === 'GO_TO_SAVED') {
      speechService.stop();
      setShowVoiceModal(false);
      setActiveTab('saved');
    }
  };

  const handleSendTypedMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;
    const msg = typedMessage;
    setTypedMessage('');
    handleUserUtterance(msg);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="bg-[#092554] text-white w-full h-full sm:h-[94vh] sm:max-w-4xl sm:rounded-3xl flex flex-col shadow-2xl border border-white/10 overflow-hidden relative">
        {/* ========================================================= */}
        {/* TOP BAR: Brand, Active Language, Ambient Controls */}
        {/* ========================================================= */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-[#001944]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#FEA619] text-[#092554] flex items-center justify-center font-black text-base shadow-sm">
              அ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#94F6C4] tracking-wider uppercase flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FEA619]" />
                  Arivom Civic Voice Assistant
                </span>
                <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[#D9E2FF] border border-white/10">
                  Real-time Conversational Guide
                </span>
              </div>
              <p className="text-[11px] text-[#D9E2FF]">
                📍 {currentStateConfig.name} • 🎙️ {currentLanguageConfig.name} ({currentLanguageConfig.bcp47Code})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Language Selector Dropdown Button */}
            <button
              id="voice-conv-lang-btn"
              onClick={() => setShowLangPicker(!showLangPicker)}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer transition-colors border border-white/10"
              title="Change Voice Language"
            >
              <Globe className="w-3.5 h-3.5 text-[#FEA619]" />
              <span className="hidden sm:inline">{currentLanguageConfig.nativeName}</span>
            </button>

            {/* Mute / Unmute Button */}
            <button
              id="voice-conv-mute-btn"
              onClick={() => {
                if (!isMuted) speechService.stop();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Repeat Last Reply Button */}
            <button
              id="voice-conv-repeat-btn"
              onClick={() => {
                if (currentAssistantSpeech) assistantSay(currentAssistantSpeech, undefined, phase);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer border border-white/10"
              title="Repeat Last Response"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Switch to Typing Drawer Toggle */}
            <button
              id="voice-conv-keyboard-btn"
              onClick={() => setShowTypingFallback(!showTypingFallback)}
              className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                showTypingFallback
                  ? 'bg-[#FEA619] text-[#092554] border-[#FEA619]'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/10'
              }`}
              title="Switch to Typing"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* End Conversation / Close Button */}
            <button
              id="voice-conv-close-btn"
              onClick={() => {
                speechService.stop();
                setShowVoiceModal(false);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500/30 text-white transition-colors cursor-pointer border border-white/10"
              title="End Voice Conversation"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Language Selection Grid (Expandable) */}
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
                    assistantSay(
                      lang.id === 'ta'
                        ? 'தமிழ் மொழி தேர்வு செய்யப்பட்டது. நான் உங்களுக்கு எவ்வாறு உதவலாம்?'
                        : `Switched language to ${lang.name}. How may I help you?`,
                      undefined,
                      phase
                    );
                  }}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#FEA619] text-[#092554] font-bold border-[#FEA619]'
                      : 'bg-white/5 text-white border-white/10 hover:bg-white/15'
                  }`}
                >
                  <div>
                    <span className="block font-bold">{lang.nativeName}</span>
                    <span className="text-[10px] opacity-75">{lang.name}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4" />}
                </button>
              );
            })}
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN CONVERSATION BODY: Split Stage & Timeline */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          {/* LEFT/TOP: Ambient Animated Voice Orb Stage */}
          <div className="lg:col-span-6 p-6 flex flex-col items-center justify-center text-center space-y-4 border-b lg:border-b-0 lg:border-r border-white/10 bg-linear-to-b from-[#092554] to-[#001944] relative">
            <VoiceOrbVisualizer
              state={orbState}
              soundLevel={audioLevel}
              onClick={handleToggleListening}
              size={180}
            />

            {/* Live Subtitles with Karaoke Sentence Highlighting */}
            <div className="w-full max-w-md px-2 space-y-2">
              {orbState === 'LISTENING' && liveTranscript && (
                <div className="p-3.5 rounded-2xl bg-white/10 border border-emerald-400/40 text-left space-y-1 animate-fade-in shadow-lg">
                  <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider block">
                    🗣️ Live Spoken Input
                  </span>
                  <p className="text-sm font-semibold text-white leading-relaxed">
                    “{liveTranscript}”
                  </p>
                </div>
              )}

              {orbState === 'SPEAKING' && (
                <div className="p-4 rounded-2xl bg-white/10 border border-blue-400/40 text-left space-y-1.5 shadow-lg animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#FEA619] uppercase tracking-wider flex items-center gap-1">
                      <Volume2 className="w-3 h-3 animate-bounce text-[#94F6C4]" />
                      Arivom Speaking
                    </span>
                    <span className="text-[10px] text-[#94F6C4] font-mono">
                      {currentLanguageConfig.bcp47Code}
                    </span>
                  </div>
                  <p className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    “{activeSentence}”
                  </p>
                  <p className="text-xs text-[#D9E2FF]/80 italic pt-1 border-t border-white/10">
                    "{translateToEnglish(activeSentence, selectedVoiceLanguageId)}"
                  </p>
                </div>
              )}

              {orbState === 'READY' && !liveTranscript && (
                <p className="text-xs text-[#D9E2FF]/80 max-w-xs mx-auto">
                  Tap the microphone button or orb to speak. You can say your age, profession, or ask about specific subsidies.
                </p>
              )}
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="flex flex-wrap items-center justify-center gap-2 max-w-md pt-2">
              <button
                onClick={() => handleUserUtterance('நான் விவசாயி, நெல் மானியம் தேவை')}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-medium text-white transition-colors cursor-pointer"
              >
                🌾 விவசாயி (Farmer)
              </button>
              <button
                onClick={() => handleUserUtterance('I am a student looking for higher education scholarships')}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-medium text-white transition-colors cursor-pointer"
              >
                🎓 மாணவர் (Student)
              </button>
              <button
                onClick={() => handleUserUtterance('சிறு தொழில் கடன் மற்றும் முத்ரா திட்டம் தேவை')}
                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-[11px] font-medium text-white transition-colors cursor-pointer"
              >
                🛍 வியாபாரம் (Business)
              </button>
            </div>
          </div>

          {/* RIGHT/BOTTOM: Interactive Conversation Timeline */}
          <div className="lg:col-span-6 flex flex-col h-full bg-[#001233]">
            <div className="p-3 px-4 border-b border-white/10 bg-[#000E26] flex items-center justify-between text-xs">
              <span className="font-bold text-[#D9E2FF] flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-[#94F6C4]" />
                Conversation Transcript
              </span>
              <span className="text-[10px] text-[#D9E2FF]/60 font-mono">
                {conversationHistory.length} Exchanges
              </span>
            </div>

            {/* Chat Messages Scroll Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
              {conversationHistory.map((turn) => {
                const isAsst = turn.role === 'assistant';
                return (
                  <div
                    key={turn.id}
                    className={`flex items-start gap-2.5 animate-fade-in ${
                      isAsst ? 'justify-start' : 'justify-end'
                    }`}
                  >
                    {isAsst && (
                      <div className="w-7 h-7 rounded-full bg-[#FEA619] text-[#092554] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        அ
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] sm:max-w-[78%] p-3.5 rounded-2xl space-y-1.5 ${
                        isAsst
                          ? 'bg-white/10 text-white border border-white/15 rounded-tl-xs shadow-sm'
                          : 'bg-[#0F8A5F] text-white rounded-tr-xs shadow-sm ml-auto'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider ${
                            isAsst ? 'text-[#94F6C4]' : 'text-emerald-100'
                          }`}
                        >
                          {isAsst ? 'Arivom Assistant' : 'You (Citizen)'}
                        </span>
                        <span className="text-[9px] opacity-60 font-mono">
                          {new Date(turn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-sm font-medium leading-relaxed">{turn.text}</p>

                      {turn.englishTranslation && turn.englishTranslation !== turn.text && (
                        <p className="text-[11px] text-[#D9E2FF]/80 italic pt-1 border-t border-white/10">
                          "{turn.englishTranslation}"
                        </p>
                      )}

                      {/* Interactive Action Buttons attached to speech */}
                      {turn.actionButtons && turn.actionButtons.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {turn.actionButtons.map((btn, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleActionClick(btn.action)}
                              className="px-3 py-1.5 rounded-xl bg-[#FEA619] hover:bg-[#FFB94F] text-[#092554] font-bold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                            >
                              <span>{btn.label}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isAsst && (
                      <div className="w-7 h-7 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={timelineEndRef} />
            </div>

            {/* Expandable Keyboard Typing Drawer */}
            {showTypingFallback && (
              <form
                onSubmit={handleSendTypedMessage}
                className="p-3 bg-[#000E26] border-t border-white/10 flex items-center gap-2 animate-fade-in"
              >
                <input
                  type="text"
                  placeholder="Type your reply (e.g. 45 வயது விவசாயி, 2 ஏக்கர் நிலம்)..."
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  className="flex-1 p-2.5 px-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-white/50 focus:border-[#FEA619] outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={!typedMessage.trim()}
                  className="p-2.5 px-4 rounded-xl bg-[#FEA619] hover:bg-[#FFB94F] disabled:opacity-40 text-[#092554] font-bold text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM ONE-HANDED ACTION CONTROLS & TRUST NOTE */}
        {/* ========================================================= */}
        <div className="p-3 sm:p-4 bg-[#000E26] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Civic Trust Privacy Note */}
          <div className="flex items-center gap-2 text-[#D9E2FF]/80 text-[11px]">
            <Shield className="w-4 h-4 text-[#94F6C4] shrink-0" />
            <span>
              <strong>Civic Privacy:</strong> Your voice is processed securely only to evaluate published government gazettes.
            </span>
          </div>

          {/* Core Mic & Navigation Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleToggleListening}
              className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                orbState === 'LISTENING'
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-[#0F8A5F] hover:bg-[#13A370] text-white'
              }`}
            >
              {orbState === 'LISTENING' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              <span>{orbState === 'LISTENING' ? 'STOP LISTENING' : 'TAP TO SPEAK'}</span>
            </button>

            {activeMatches.length > 0 && (
              <button
                onClick={() => {
                  speechService.stop();
                  setShowVoiceModal(false);
                  setActiveTab('matches');
                }}
                className="px-5 py-2.5 rounded-2xl bg-[#FEA619] hover:bg-[#FFB94F] text-[#092554] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
              >
                <span>VIEW {activeMatches.length} MATCHES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
