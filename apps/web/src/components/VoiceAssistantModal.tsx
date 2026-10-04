import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
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
  Square,
  Globe,
  Send,
  User,
  MessageSquare,
  Volume2,
  CheckCircle2,
  Radio,
  Waves,
  Keyboard,
  AlertCircle,
  ChevronDown,
  Zap,
  X,
  Sparkles,
} from 'lucide-react';

const BCP47_SPEECH_MAP: Record<string, string> = {
  ta: 'தமிழ்',
  ml: 'മലയാളം',
  kn: 'ಕನ್ನಡ',
  te: 'తెలుగు',
  hi: 'हिंदी',
  mr: 'मराठी',
  bn: 'বাংলা',
  gu: 'ગુજરાતી',
  or: 'ଓଡ଼ିଆ',
  pa: 'ਪੰਜਾਬੀ',
  as: 'অসমীয়া',
  en: 'English',
};

export const VoiceAssistantModal: React.FC = () => {
  const {
    showVoiceModal,
    setShowVoiceModal,
    taggedSchemeForVoice,
    setTaggedSchemeForVoice,
    selectedVoiceLanguageId,
    setSelectedVoiceLanguageId,
    currentStateConfig,
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
  const [showTypingFallback, setShowTypingFallback] = useState<boolean>(false);
  const [typedInput, setTypedInput] = useState<string>('');
  const [lastError, setLastError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

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
            // Ignore immediate duplicate consecutive messages with identical content
            const last = prev[prev.length - 1];
            if (last && last.role === msg.role && last.text.trim() === msg.text.trim() && !msg.isStreaming) {
              return prev;
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
          // Triggered when turn completes or pauses
        },
      }
    );

    // If a specific scheme was tagged (e.g. from HEAR button), automatically trigger its explanation in the chosen language
    if (taggedSchemeForVoice) {
      const scheme = taggedSchemeForVoice;
      const lang = selectedVoiceLanguageId;
      const initialPrompts: Record<string, string> = {
        ta: `"${scheme.name}" (${scheme.nativeName || ''}) திட்டம் பற்றி எளிய தமிழில் விளக்குங்கள். இதன் நன்மைகள், தகுதிகள் மற்றும் தேவையான ஆவணங்கள் என்ன?`,
        hi: `"${scheme.name}" (${scheme.nativeName || ''}) योजना के बारे में सरल हिंदी में बताएं। इसके लाभ, पात्रता और आवश्यक दस्तावेज क्या हैं?`,
        ml: `"${scheme.name}" (${scheme.nativeName || ''}) പദ്ധതിയെക്കുറിച്ച് ലളിതമായ മലയാളത്തിൽ പറയൂ. ഇതിന്റെ ആനുകൂല്യങ്ങളും അർഹതയും രേഖകളും എന്തൊക്കെയാണ്?`,
        te: `"${scheme.name}" (${scheme.nativeName || ''}) పథకం గురించి సులభమైన తెలుగులో వివరించండి. దీని ప్రయోజనాలు, అర్హతలు మరియు కావలసిన పత్రాలు ఏమిటి?`,
        kn: `"${scheme.name}" (${scheme.nativeName || ''}) ಯೋಜನೆಯ ಬಗ್ಗೆ ಸರಳ ಕನ್ನಡದಲ್ಲಿ ತಿಳಿಸಿ. ಇದರ ಪ್ರಯೋಜನಗಳು, ಅರ್ಹತೆ ಮತ್ತು ಅಗತ್ಯ ದಾಖಲೆಗಳು ಯಾವುವು?`,
        mr: `"${scheme.name}" (${scheme.nativeName || ''}) योजनेबद्दल सोप्या मराठीत सांगा. याचे फायदे, पात्रता आणि आवश्यक कागदपत्रे कोणती आहेत?`,
        bn: `"${scheme.name}" (${scheme.nativeName || ''}) প্রকল্প সম্পর্কে সহজ বাংলায় বিবরণ দিন। এর সুবিধা, যোগ্যতা ও প্রয়োজনীয় কাগজপত্র কী কী?`,
        gu: `"${scheme.name}" (${scheme.nativeName || ''}) યોજના વિશે સરળ ગુજરાતીમાં સમજાવો. તેના લાભો, પાત્રતા અને જરૂરી દસ્તાવેજો કયા છે?`,
        or: `"${scheme.name}" (${scheme.nativeName || ''}) ଯୋଜନା ବିଷୟରେ ସରଳ ଓଡ଼ିଆରେ କୁହନ୍ତୁ। ଏହାର ଲାଭ, ଯୋଗ୍ୟତା ଏବଂ ଆବଶ୍ୟକ କାଗଜପତ୍ର କ’ଣ?`,
        pa: `"${scheme.name}" (${scheme.nativeName || ''}) ਸਕੀਮ ਬਾਰੇ ਸਰਲ ਪੰਜਾਬੀ ਵਿੱਚ ਦੱਸੋ। ਇਸਦੇ ਲਾਭ, ਯੋਗਤਾ ਅਤੇ ਜ਼ਰੂਰੀ ਦਸਤਾਵੇਜ਼ ਕਿਹੜੇ ਹਨ?`,
        as: `"${scheme.name}" (${scheme.nativeName || ''}) আঁচনিৰ বিষয়ে সৰল অসমীয়াত বুজাই দিয়ক। ইয়াৰ সুবিধা, যোগ্যতা আৰু প্ৰয়োজনীয় নথিপত্ৰ কি কি?`,
        en: `Please explain the scheme "${scheme.name}" (${scheme.nativeName || ''}) in simple terms in English. Tell me what benefit it provides, who is eligible, and what documents are required.`,
      };
      const initialPrompt = initialPrompts[lang] || initialPrompts.en;
      setTimeout(() => {
        geminiLiveVoiceService.sendTextMessage(initialPrompt);
      }, 600);
    }

    return () => {
      geminiLiveVoiceService.endSession();
    };
  }, [showVoiceModal, selectedVoiceLanguageId, currentStateConfig.name, taggedSchemeForVoice]);

  const handleEndCall = () => {
    geminiLiveVoiceService.endSession();
    setTaggedSchemeForVoice(null);
    setShowVoiceModal(false);
  };

  /**
   * One-Tap Stop: Instantly halts AI speech playback / generation without disabling voice,
   * keeping listening ready for the citizen's next query.
   */
  const handleStopEverything = () => {
    geminiLiveVoiceService.stopEverything();
  };

  /**
   * One-Tap to Speak: Immediate 1-tap activation / interruption / commit.
   */
  const handleToggleListening = () => {
    speechService.unlockAudio();
    if (voiceState === 'SPEAKING' || voiceState === 'THINKING') {
      geminiLiveVoiceService.stopEverything();
      return;
    }
    if (voiceState === 'USER_SPEAKING') {
      geminiLiveVoiceService.commitInterimNow();
      return;
    }
    if (voiceState === 'LISTENING') {
      geminiLiveVoiceService.stopListening('manual');
      return;
    }
    geminiLiveVoiceService.startListening();
  };

  const handleSendText = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedInput.trim()) return;
    speechService.unlockAudio();
    const txt = typedInput;
    setTypedInput('');
    geminiLiveVoiceService.sendTextMessage(txt);
  };

  const handleLanguageSelect = (langId: string) => {
    speechService.unlockAudio();
    setSelectedVoiceLanguageId(langId);
    geminiLiveVoiceService.setLanguage(langId);
  };

  const getStatusBadge = () => {
    switch (voiceState) {
      case 'CONNECTING':
        return { label: 'Connecting...', color: 'bg-[#fef7ee] text-[#b45309] border-[#fde68a]' };
      case 'LISTENING':
        return { label: 'Listening...', color: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]' };
      case 'USER_SPEAKING':
        return { label: 'Hearing you...', color: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]' };
      case 'THINKING':
        return { label: 'Thinking...', color: 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]' };
      case 'SPEAKING':
        return { label: 'Arivom Speaking...', color: 'bg-[#fdf2f8] text-[#9d174d] border-[#fbcfe8]' };
      case 'IDLE':
        return { label: 'Paused / Idle', color: 'bg-[#f3f4f6] text-[#4b5563] border-[#e5e7eb]' };
      default:
        return { label: 'Ready', color: 'bg-[#f8fafc] text-[#475569] border-[#e2e8f0]' };
    }
  };

  const starterSuggestions: Record<string, string[]> = {
    ta: [
      'விவசாயிகளுக்கான உதவி திட்டங்கள் என்ன?',
      'மாணவர்களுக்கான கல்வி உதவித்தொகை பற்றி கூறுங்கள்.',
      'மகளிர் உரிமைத்தொகை பெற என்ன தகுதி வேண்டும்?',
    ],
    ml: [
      'കർഷകർക്കുള്ള പ്രധാന ആനുകൂല്യങ്ങൾ എന്തൊക്കെയാണ്?',
      'വിദ്യാർത്ഥികൾക്കുള്ള സ്കോളർഷിപ്പുകളെക്കുറിച്ച് പറയൂ.',
      'വനിതാ സ്വയംതൊഴിൽ വായ്പകൾ എന്തൊക്കെയാണ്?',
    ],
    hi: [
      'किसानों के लिए प्रमुख सरकारी योजनाएं क्या हैं?',
      'उच्च शिक्षा के लिए छात्रवृत्ति कैसे मिलती है?',
      'महिलाओं के लिए स्वरोजगार योजनाएं कौन सी हैं?',
    ],
    te: [
      'రైతుల కోసం ఉన్న ప్రభుత్వ పథకాలు ఏమిటి?',
      'విద్యార్థుల స్కాలర్‌షిప్‌ల గురించి చెప్పండి.',
      'మహిళా సంక్షేమ పథకాలు ఏమిటి?',
    ],
    kn: [
      'ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಯೋಜನೆಗಳು ಯಾವುವು?',
      'ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನದ ವಿವರಗಳನ್ನು ತಿಳಿಸಿ.',
      'ಮಹಿಳಾ ಸ್ವಯಂ ಉದ್ಯೋಗ ಯೋಜನೆಗಳು ಯಾವುವು?',
    ],
    mr: [
      'शेतकऱ्यांसाठी कोणत्या शासकीय योजना आहेत?',
      'विद्यार्थ्यांसाठी शिष्यवृत्तींची माहिती सांगा.',
      'महिलांसाठी स्वयंरोजगार योजना कोणत्या आहेत?',
    ],
    bn: [
      'কৃষকদের জন্য সরকারি প্রকল্পগুলো কী কী?',
      'ছাত্রছাত্রীদের স্কলারশিপের তথ্য জানান।',
      'মহিলাদের জন্য স্বনির্ভর প্রকল্প কী কী আছে?',
    ],
    gu: [
      'ખેડૂતો માટે કઈ સરકારી સહાય યોજનાઓ છે?',
      'વિદ્યાર્થીઓ માટે શિષ્યવૃત્તિની માહિતી આપો.',
      'મહિલાઓ માટે સહાય યોજનાઓ કઈ છે?',
    ],
    or: [
      'କୃଷକମାନଙ୍କ ପାଇଁ କ’ଣ ସରକାରୀ ଯୋଜନା ଅଛି?',
      'ଛାତ୍ରବୃତ୍ତି ସମ୍ପର୍କରେ ସୂଚନା ଦିଅନ୍ତୁ।',
      'ମହିଳାମାନଙ୍କ ପାଇଁ କଲ୍ୟାଣ ଯୋଜନା କ’ଣ?',
    ],
    pa: [
      'ਕਿਸਾਨਾਂ ਲਈ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਕਿਹੜੀਆਂ ਹਨ?',
      'ਵਿਦਿਆਰਥੀਆਂ ਲਈ ਵਜ਼ੀਫ਼ੇ ਦੀ ਜਾਣਕਾਰੀ ਦਿਓ।',
      'ਔਰਤਾਂ ਲਈ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਸਕੀਮਾਂ ਕਿਹੜੀਆਂ ਹਨ?',
    ],
    as: [
      'কৃষকসকলৰ বাবে চৰকাৰী আঁচনি কি কি আছে?',
      'ছাত্ৰ-ছাত্ৰীৰ বাবে জলপানীৰ তথ্য দিয়ক।',
      'মহিলাসকলৰ বাবে কি আঁচনি আছে?',
    ],
    en: [
      'Tell me about welfare schemes for farmers.',
      'What scholarships are available for students?',
      'What are the pension schemes for seniors?',
    ],
  };

  const currentStarters = starterSuggestions[selectedVoiceLanguageId] || starterSuggestions.en;
  const status = getStatusBadge();
  const currentLang = SUPPORTED_LANGUAGES[selectedVoiceLanguageId] || SUPPORTED_LANGUAGES['ta'];

  if (!showVoiceModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-[#21191d]/60 backdrop-blur-xs animate-fade-in">
      {/* Sovereign Light Mode Modal Container */}
      <div className="bg-[#fff8f8] text-[#21191d] w-full h-full sm:h-[90vh] sm:max-w-4xl sm:rounded-3xl flex flex-col shadow-2xl border border-[#e8e1dc] overflow-hidden relative">
        
        {/* ========================================================= */}
        {/* COMPACT CLEAN HEADER */}
        {/* ========================================================= */}
        <div className="px-4 py-3 sm:px-6 sm:py-3.5 flex items-center justify-between border-b border-[#e8e1dc] bg-[#faf8f3] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#4a1f2d] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {getLanguageInitial(selectedVoiceLanguageId)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#4a1f2d] truncate">
                  Arivom Voice
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${status.color}`}>
                  {status.label}
                </span>
              </div>
              <p className="text-[11px] text-[#756a6f] truncate hidden sm:block">
                📍 {currentStateConfig.name} • 🌐 {currentLang.nativeName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <div className="flex items-center rounded-xl bg-white hover:bg-[#faf8f3] border border-[#e8e1dc] px-2.5 py-1.5 transition-colors text-xs font-bold shadow-xs">
                <Globe className="w-3.5 h-3.5 text-[#4a1f2d] shrink-0 mr-1.5" />
                <select
                  id="voice-language-select-dropdown"
                  value={selectedVoiceLanguageId}
                  onChange={(e) => handleLanguageSelect(e.target.value)}
                  className="bg-transparent text-[#21191d] font-bold text-xs outline-none cursor-pointer pr-4 appearance-none"
                  title="Select voice language"
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

            {/* Matches Quick Link */}
            {activeMatches.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  geminiLiveVoiceService.endSession();
                  setShowVoiceModal(false);
                  setActiveTab('matches');
                }}
                className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#eedfe4] text-[#4a1f2d] hover:bg-[#e2cbd3] text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                <Sparkles className="w-3 h-3" />
                <span>{activeMatches.length} Matches</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              id="voice-modal-close-icon-btn"
              onClick={handleEndCall}
              className="p-1.5 sm:p-2 rounded-xl bg-white hover:bg-[#ffdad6] text-[#756a6f] hover:text-[#ba1a1a] border border-[#e8e1dc] transition-colors cursor-pointer shadow-xs"
              title="Close Voice Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN BODY: Spacious Visualizer + Conversational Feed */}
        {/* ========================================================= */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0 relative">
          
          {/* LEFT: Compact Live Orb Stage (Visible on Desktop / Compact on Mobile) */}
          <div className="lg:col-span-4 p-3 sm:p-6 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-[#e8e1dc] bg-[#faf8f3] shrink-0">
            <div className="my-auto py-2 flex flex-col items-center">
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
                size={typeof window !== 'undefined' && window.innerWidth < 1024 ? 90 : 150}
                langInitial={getLanguageInitial(selectedVoiceLanguageId)}
              />

              <div className="mt-3 space-y-1">
                <p className="text-xs font-bold text-[#4a1f2d]">
                  {voiceState === 'SPEAKING'
                    ? 'Arivom Speaking'
                    : voiceState === 'USER_SPEAKING'
                    ? 'Hearing you...'
                    : voiceState === 'THINKING'
                    ? 'Thinking...'
                    : voiceState === 'LISTENING'
                    ? 'Listening... Speak now'
                    : 'Tap Mic to Speak'}
                </p>
                <p className="text-[11px] text-[#756a6f] max-w-[220px] hidden lg:block leading-tight">
                  Speak in <strong>{currentLang.nativeName}</strong>. 2-second pause automatically answers.
                </p>
              </div>
            </div>

            {lastError && (
              <p className="text-[11px] text-[#b91c1c] bg-[#fef2f2] border border-[#fecaca] px-3 py-1 rounded-xl max-w-xs mt-2">
                {lastError}
              </p>
            )}
          </div>

          {/* RIGHT: Live Conversational Transcript (Spacious & Clean) */}
          <div className="lg:col-span-8 flex flex-col h-full bg-white overflow-hidden">
            
            {/* Tagged Scheme Banner (if launched via HEAR button) */}
            {taggedSchemeForVoice && (
              <div className="px-4 py-2.5 bg-[#4a1f2d] text-white border-b border-[#6b3548] flex items-center justify-between gap-2 shrink-0 animate-fade-in">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-[#c8a96b] text-[#310a18] flex items-center justify-center font-bold text-xs shrink-0">
                    📌
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-[#c8a96b] uppercase tracking-wider block leading-none">
                      Discussing Tagged Scheme
                    </span>
                    <p className="text-xs font-bold text-white truncate mt-0.5">
                      {taggedSchemeForVoice.name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      const lang = selectedVoiceLanguageId;
                      const eligibilityPrompts: Record<string, string> = {
                        ta: `நான் "${taggedSchemeForVoice.name}" திட்டத்திற்கு தகுதியானவனா?`,
                        hi: `क्या मैं "${taggedSchemeForVoice.name}" योजना के लिए पात्र हूँ?`,
                        ml: `ഞാൻ "${taggedSchemeForVoice.name}" പദ്ധതിക്ക് അർഹനാണോ?`,
                        te: `నేను "${taggedSchemeForVoice.name}" పథకానికి అర్హుడనా?`,
                        kn: `ನಾನು "${taggedSchemeForVoice.name}" ಯೋಜನೆಗೆ ಅರ್ಹನೇ?`,
                        mr: `मी "${taggedSchemeForVoice.name}" योजनेसाठी पात्र आहे का?`,
                        bn: `আমি কি "${taggedSchemeForVoice.name}" প্রকল্পের জন্য যোগ্য?`,
                        gu: `શું હું "${taggedSchemeForVoice.name}" યોજના માટે યોગ્ય છું?`,
                        or: `ମୁଁ "${taggedSchemeForVoice.name}" ଯୋଜନା ପାଇଁ ଯୋଗ୍ୟ କି?`,
                        pa: `ਕੀ ਮੈਂ "${taggedSchemeForVoice.name}" ਸਕੀਮ ਲਈ ਯੋਗ ਹਾਂ?`,
                        as: `মই "${taggedSchemeForVoice.name}" আঁচনিৰ বাবে যোগ্য নেকি?`,
                        en: `Am I eligible for ${taggedSchemeForVoice.name}?`,
                      };
                      geminiLiveVoiceService.sendTextMessage(eligibilityPrompts[lang] || eligibilityPrompts.en);
                    }}
                    className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-[#6b3548] hover:bg-[#874d60] text-white text-[11px] font-bold transition-colors cursor-pointer border border-[#e8e1dc]/20"
                  >
                    Eligibility?
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const lang = selectedVoiceLanguageId;
                      const docPrompts: Record<string, string> = {
                        ta: `"${taggedSchemeForVoice.name}" திட்டத்திற்கு என்னென்ன ஆவணங்கள் தேவை?`,
                        hi: `"${taggedSchemeForVoice.name}" योजना के लिए कौन से दस्तावेज आवश्यक हैं?`,
                        ml: `"${taggedSchemeForVoice.name}" പദ്ധതിക്ക് ഏതെല്ലാം രേഖകൾ വേണം?`,
                        te: `"${taggedSchemeForVoice.name}" పథకానికి ఏ పత్రాలు అవసరం?`,
                        kn: `"${taggedSchemeForVoice.name}" ಯೋಜನೆಗೆ ಯಾವ ದಾಖಲೆಗಳು ಬೇಕು?`,
                        mr: `"${taggedSchemeForVoice.name}" योजनेसाठी कोणती कागदपत्रे लागतील?`,
                        bn: `"${taggedSchemeForVoice.name}" প্রকল্পের জন্য কী কী কাগজপত্র প্রয়োজন?`,
                        gu: `"${taggedSchemeForVoice.name}" યોજના માટે કયા દસ્તાવેજો જોઈએ?`,
                        or: `"${taggedSchemeForVoice.name}" ଯୋଜନା ପାଇଁ କେଉଁ କାଗଜପତ୍ର ଆବଶ୍ୟକ?`,
                        pa: `"${taggedSchemeForVoice.name}" ਸਕੀਮ ਲਈ ਕਿਹੜੇ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ ਹਨ?`,
                        as: `"${taggedSchemeForVoice.name}" আঁচনিৰ বাবে কি কি নথিপত্ৰ লাগে?`,
                        en: `What documents are required for ${taggedSchemeForVoice.name}?`,
                      };
                      geminiLiveVoiceService.sendTextMessage(docPrompts[lang] || docPrompts.en);
                    }}
                    className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-[#6b3548] hover:bg-[#874d60] text-white text-[11px] font-bold transition-colors cursor-pointer border border-[#e8e1dc]/20"
                  >
                    Documents?
                  </button>
                  <button
                    type="button"
                    onClick={() => setTaggedSchemeForVoice(null)}
                    className="text-[11px] text-[#ffd9e1] hover:text-white underline font-semibold cursor-pointer"
                    title="Clear scheme tag to ask general questions"
                  >
                    ✕ Clear
                  </button>
                </div>
              </div>
            )}

            {/* Scrollable Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3.5 bg-white">
              {messages.length === 0 && !interimTranscript ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4 space-y-4 text-[#756a6f] my-auto">
                  <div className="w-12 h-12 rounded-full bg-[#faf8f3] border border-[#e8e1dc] flex items-center justify-center text-[#4a1f2d]">
                    <Mic className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1 max-w-sm">
                    <p className="text-sm font-bold text-[#21191d]">Speak directly to Arivom</p>
                    <p className="text-xs text-[#514346] leading-relaxed">
                      Ask any government scheme question in <strong>{currentLang.nativeName}</strong>.
                    </p>
                  </div>

                  <div className="w-full space-y-1.5 pt-2 max-w-md">
                    <span className="text-[10px] font-bold text-[#4a1f2d] uppercase tracking-wider block text-left">
                      Suggested Questions (Tap to Ask):
                    </span>
                    {currentStarters.map((starter, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => geminiLiveVoiceService.sendTextMessage(starter)}
                        className="w-full p-2.5 px-3.5 rounded-xl bg-[#faf8f3] hover:bg-[#eedfe4] border border-[#e8e1dc] text-left text-xs font-medium text-[#21191d] transition-colors cursor-pointer shadow-2xs"
                      >
                        💬 {starter}
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
                              {isUser ? 'Citizen' : 'Arivom AI'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              {!isUser && (
                                <button
                                  type="button"
                                  onClick={() => geminiLiveVoiceService.speak(msg.text)}
                                  className="opacity-80 hover:opacity-100 transition-opacity p-0.5 cursor-pointer text-[#4a1f2d]"
                                  title="Replay audio"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
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

                  {/* Real-time Interim Transcription Bubble */}
                  {interimTranscript && (
                    <div className="flex items-start gap-2.5 justify-end animate-fade-in">
                      <div className="max-w-[85%] p-3 rounded-2xl bg-[#f0fdf4] border border-[#86efac] text-[#166534] rounded-tr-xs shadow-xs ml-auto space-y-1">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#15803d] font-bold uppercase tracking-wider">
                          <Waves className="w-3 h-3 text-[#15803d] animate-pulse" />
                          <span>Hearing you...</span>
                        </div>
                        <p className="text-xs sm:text-sm font-medium italic text-[#166534]">
                          "{interimTranscript}"
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* ===================================================== */}
            {/* UNIFIED STREAMLINED CONTROL DOCK WITH STOP BUTTON */}
            {/* ===================================================== */}
            <div className="p-3 sm:p-4 bg-[#faf8f3] border-t border-[#e8e1dc] space-y-2 shrink-0">
              <div className="flex items-center gap-2">
                
                {/* 1. Main Mic / Speak Button */}
                <button
                  type="button"
                  id="voice-main-toggle-btn"
                  onClick={handleToggleListening}
                  className={`flex-1 py-3 px-4 rounded-2xl font-bold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 border shadow-sm ${
                    voiceState === 'SPEAKING' || voiceState === 'THINKING'
                      ? 'bg-[#ecfdf5] text-[#15803d] border-[#86efac] hover:bg-[#dcfce7]'
                      : voiceState === 'USER_SPEAKING' || voiceState === 'LISTENING'
                      ? 'bg-[#15803d] hover:bg-[#166534] text-white border-[#15803d] animate-pulse'
                      : 'bg-[#4a1f2d] hover:bg-[#310a18] text-white border-[#4a1f2d]'
                  }`}
                  title="Toggle Microphone"
                >
                  {voiceState === 'SPEAKING' ? (
                    <>
                      <Waves className="w-4 h-4 text-[#15803d] animate-pulse" />
                      <span>Speaking... Tap to interrupt</span>
                    </>
                  ) : voiceState === 'THINKING' ? (
                    <>
                      <Mic className="w-4 h-4 text-[#7e22ce] animate-pulse" />
                      <span>Thinking... Tap to interrupt</span>
                    </>
                  ) : voiceState === 'USER_SPEAKING' || voiceState === 'LISTENING' ? (
                    <>
                      <Mic className="w-4 h-4 text-white animate-pulse" />
                      <span>Listening... (Tap to Send)</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-white" />
                      <span>One Tap to Speak</span>
                    </>
                  )}
                </button>

                {/* 2. DEDICATED STOP BUTTON (Instant Speech Halt & Keeps Voice Active) */}
                <button
                  type="button"
                  id="voice-stop-everything-btn"
                  onClick={handleStopEverything}
                  className="py-3 px-4 rounded-2xl bg-[#ba1a1a] hover:bg-[#991b1b] active:scale-95 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 border border-[#ba1a1a] shadow-sm shrink-0"
                  title="Stop AI speech immediately without disabling voice"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Stop Speech</span>
                </button>

                {/* 3. Keyboard Toggle Button */}
                <button
                  type="button"
                  id="voice-keyboard-toggle-btn"
                  onClick={() => setShowTypingFallback(!showTypingFallback)}
                  className={`p-3 rounded-2xl border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
                    showTypingFallback
                      ? 'bg-[#eedfe4] text-[#4a1f2d] border-[#4a1f2d]/30'
                      : 'bg-white hover:bg-[#eedfe4] text-[#514346] border-[#e8e1dc]'
                  }`}
                  title="Toggle typing input"
                >
                  <Keyboard className="w-4 h-4 text-[#4a1f2d]" />
                </button>
              </div>

              {/* Expandable Text Input (Collapsible) */}
              {showTypingFallback && (
                <form
                  onSubmit={handleSendText}
                  className="pt-1 flex items-center gap-2 animate-fade-in"
                >
                  <input
                    type="text"
                    id="voice-assistant-typing-input"
                    value={typedInput}
                    onChange={(e) => setTypedInput(e.target.value)}
                    placeholder={`Type question in ${currentLang.nativeName} or English...`}
                    className="flex-1 p-2.5 px-3.5 rounded-xl bg-white border border-[#4a1f2d]/40 text-xs font-semibold text-[#111827] placeholder-[#6b7280] focus:border-[#4a1f2d] focus:ring-1 focus:ring-[#4a1f2d] outline-none shadow-xs"
                  />
                  <button
                    type="submit"
                    disabled={!typedInput.trim()}
                    className="p-2.5 px-3.5 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] disabled:opacity-40 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
