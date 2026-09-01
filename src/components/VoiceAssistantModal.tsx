import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getVoicePack } from '../data/locales';
import { speechService } from '../utils/speech';
import { extractProfileFromSpokenText, ExtractedProfileData } from '../utils/nlpExtractor';
import {
  Mic,
  MicOff,
  Volume2,
  Brain,
  UserCheck,
  Search,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  Edit3,
  ArrowRight,
  X,
  VolumeX,
} from 'lucide-react';
import { NEED_CATEGORIES } from '../data/categories';

type VoiceState =
  | 'READY'
  | 'LISTENING'
  | 'UNDERSTANDING'
  | 'BUILDING_PROFILE'
  | 'CHECKING'
  | 'MATCHED';

export const VoiceAssistantModal: React.FC = () => {
  const {
    showVoiceModal,
    setShowVoiceModal,
    selectedVoiceLanguageId,
    currentStateConfig,
    currentLanguageConfig,
    userProfile,
    updateUserProfile,
    setActiveTab,
    triggerMatchCelebration,
    activeMatches,
    logCitizenCallStep,
  } = useApp();

  const [voiceState, setVoiceState] = useState<VoiceState>('READY');
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedProfileData | null>(null);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState<boolean>(false);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [customTextInput, setCustomTextInput] = useState<string>('');
  const [showManualEdit, setShowManualEdit] = useState<boolean>(false);

  const voicePack = getVoicePack(selectedVoiceLanguageId);
  const recognitionRef = useRef<any>(null);

  // Play spoken prompt on modal open
  useEffect(() => {
    if (showVoiceModal) {
      setVoiceState('READY');
      setSpokenTranscript('');
      setExtractedData(null);
      setShowManualEdit(false);

      // Speak initial localized welcome prompt
      const promptToSpeak = voicePack.greetingPrompt;
      setIsSpeakingPrompt(true);
      speechService.speak(
        promptToSpeak,
        selectedVoiceLanguageId,
        () => setIsSpeakingPrompt(true),
        () => setIsSpeakingPrompt(false)
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

  // Start Voice Listening via Web Speech API or Simulation
  const handleStartListening = () => {
    speechService.stop();
    setVoiceState('LISTENING');

    // Check if Web Speech Recognition API is available
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;
        recognition.lang = currentLanguageConfig.bcp47Code || 'ta-IN';
        recognition.interimResults = true;
        recognition.continuous = false;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          setSpokenTranscript(transcript);
        };

        recognition.onend = () => {
          if (spokenTranscript) {
            processSpokenText(spokenTranscript);
          } else {
            // If mic captured silence, use natural sample phrase
            useSamplePhrase(currentLanguageConfig.samplePhrase);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition fallback on error:', err);
          useSamplePhrase(currentLanguageConfig.samplePhrase);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('Speech recognition init error:', err);
      }
    }

    // Fallback simulation timer if Web Speech is unavailable
    setTimeout(() => {
      useSamplePhrase(currentLanguageConfig.samplePhrase);
    }, 2800);
  };

  const useSamplePhrase = (text: string) => {
    setSpokenTranscript(text);
    processSpokenText(text);
  };

  const processSpokenText = (text: string) => {
    setVoiceState('UNDERSTANDING');

    setTimeout(() => {
      setVoiceState('BUILDING_PROFILE');
      const extracted = extractProfileFromSpokenText(text, selectedVoiceLanguageId);
      setExtractedData(extracted);

      // Log telemetry for live session demo
      logCitizenCallStep({
        device: 'Smartphone (Voice)',
        need: extracted.need || userProfile.need,
        profile: {
          age: extracted.age || userProfile.age,
          occupation: extracted.occupation || userProfile.occupation,
          annualIncome: extracted.annualIncome || userProfile.annualIncome,
        },
        status: 'Profile Created',
        ivrSteps: ['Smartphone Voice Activated', `Understood: ${text.slice(0, 30)}...`],
      });
    }, 1200);
  };

  const handleConfirmProfileAndMatch = () => {
    if (extractedData) {
      updateUserProfile({
        ...(extractedData.age ? { age: extractedData.age } : {}),
        ...(extractedData.occupation ? { occupation: extractedData.occupation } : {}),
        ...(extractedData.annualIncome ? { annualIncome: extractedData.annualIncome } : {}),
        ...(extractedData.need ? { need: extractedData.need } : {}),
      });
    }

    setVoiceState('CHECKING');
    setActiveStepIndex(0);

    // Sequential matching animation steps
    const timer1 = setTimeout(() => setActiveStepIndex(1), 600);
    const timer2 = setTimeout(() => setActiveStepIndex(2), 1200);
    const timer3 = setTimeout(() => setActiveStepIndex(3), 1800);
    const timer4 = setTimeout(() => {
      setVoiceState('MATCHED');
      triggerMatchCelebration();

      // Speak match summary in regional language
      const matchCount = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length;
      const spokenSummary = voicePack.matchedHeading(matchCount);
      speechService.speak(spokenSummary, selectedVoiceLanguageId);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  const handleGoToMatches = () => {
    setShowVoiceModal(false);
    setActiveTab('matches');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 text-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-700/80 overflow-hidden relative">
        {/* Top Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold">
              அ
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-emerald-400 uppercase">
                Voice Assistant
              </span>
              <p className="text-[11px] text-slate-400">
                📍 {currentStateConfig.name} • 🎙️ {currentLanguageConfig.name} ({currentLanguageConfig.nativeName})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="voice-modal-replay-btn"
              onClick={() => {
                speechService.speak(voicePack.greetingPrompt, selectedVoiceLanguageId);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
              title="Repeat Spoken Prompt"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            <button
              id="voice-modal-close-btn"
              onClick={() => {
                speechService.stop();
                setShowVoiceModal(false);
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Assistant Content Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center">
          {/* ======================================================== */}
          {/* STATE 1: READY */}
          {/* ======================================================== */}
          {voiceState === 'READY' && (
            <div className="w-full space-y-6 animate-fade-in">
              <div className="space-y-2">
                <span className="text-xs font-bold text-emerald-400 tracking-widest uppercase">
                  WHAT DO YOU NEED HELP WITH?
                </span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-white">
                  “Tell us what you need.”
                </h3>
                {/* Spoken voice prompt in regional language */}
                <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-3.5 mt-2 flex items-center justify-center gap-2">
                  <Volume2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <p className="text-sm font-semibold text-emerald-200 font-sans">
                    {voicePack.greetingPrompt}
                  </p>
                </div>
              </div>

              {/* Central Pulsing Microphone Button */}
              <div className="py-4 flex flex-col items-center justify-center">
                <button
                  id="voice-modal-tap-mic-btn"
                  onClick={handleStartListening}
                  className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all cursor-pointer"
                >
                  <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping"></span>
                  <Mic className="w-10 h-10 sm:w-12 sm:h-12 relative z-10 text-white" />
                </button>
                <span className="text-xs font-bold text-slate-300 mt-3 uppercase tracking-wider">
                  Tap microphone to speak
                </span>
              </div>

              {/* Sample Natural Voice Phrases for quick 1-click test */}
              <div className="text-left bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Or click sample natural speech phrase:
                </p>
                <div className="space-y-2">
                  <button
                    id="voice-sample-btn-1"
                    onClick={() => useSamplePhrase(currentLanguageConfig.samplePhrase)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-600 text-xs transition-all cursor-pointer"
                  >
                    <span className="text-emerald-300 font-semibold block leading-relaxed">
                      “{currentLanguageConfig.samplePhrase}”
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5 block italic">
                      ({currentLanguageConfig.sampleTranscription})
                    </span>
                  </button>

                  <button
                    id="voice-sample-btn-2"
                    onClick={() =>
                      useSamplePhrase(
                        selectedVoiceLanguageId === 'ta'
                          ? 'என் மகளுடைய கல்லூரி படிப்புக்கு உதவித்தொகை வேண்டும்.'
                          : 'I need college education scholarship assistance for my daughter.'
                      )
                    }
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-600 text-xs transition-all cursor-pointer"
                  >
                    <span className="text-emerald-300 font-semibold block">
                      {selectedVoiceLanguageId === 'ta'
                        ? '“என் மகளுடைய கல்லூரி படிப்புக்கு உதவித்தொகை வேண்டும்.”'
                        : '“I need college education scholarship assistance for my daughter.”'}
                    </span>
                  </button>

                  <button
                    id="voice-sample-btn-3"
                    onClick={() =>
                      useSamplePhrase(
                        selectedVoiceLanguageId === 'ta'
                          ? 'எனக்கு சொந்தமாக கான்கிரீட் வீடு கட்ட அரசு நிதி உதவி வேண்டும்.'
                          : 'I need financial assistance to construct a permanent pucca house.'
                      )
                    }
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-600 text-xs transition-all cursor-pointer"
                  >
                    <span className="text-emerald-300 font-semibold block">
                      {selectedVoiceLanguageId === 'ta'
                        ? '“எனக்கு சொந்தமாக கான்கிரீட் வீடு கட்ட அரசு நிதி உதவி வேண்டும்.”'
                        : '“I need financial assistance to construct a permanent pucca house.”'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE 2: LISTENING */}
          {/* ======================================================== */}
          {voiceState === 'LISTENING' && (
            <div className="w-full space-y-6 py-6 animate-fade-in">
              <div className="flex items-center justify-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-xs font-extrabold text-red-400 uppercase tracking-widest">
                  LISTENING IN {currentLanguageConfig.name.toUpperCase()}...
                </span>
              </div>

              <h3 className="text-xl font-bold text-white">
                {voicePack.listeningPrompt}
              </h3>

              {/* Animated Audio Waveform */}
              <div className="flex items-center justify-center gap-1.5 h-20 my-4">
                {[40, 70, 90, 60, 100, 75, 45, 85, 95, 60, 40].map((h, i) => (
                  <span
                    key={i}
                    className="w-2 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${i * 0.1}s`,
                      animationDuration: '0.8s',
                    }}
                  ></span>
                ))}
              </div>

              <p className="text-xs text-slate-400 italic">
                {spokenTranscript || 'Speak naturally in ' + currentLanguageConfig.name + '...'}
              </p>

              <button
                id="voice-modal-stop-listening-btn"
                onClick={() => processSpokenText(spokenTranscript || currentLanguageConfig.samplePhrase)}
                className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 transition-colors cursor-pointer border border-slate-600"
              >
                DONE SPEAKING
              </button>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE 3: UNDERSTANDING */}
          {/* ======================================================== */}
          {voiceState === 'UNDERSTANDING' && (
            <div className="w-full space-y-5 py-8 animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center mx-auto animate-spin">
                <Brain className="w-8 h-8" />
              </div>
              <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase block">
                UNDERSTANDING INTENT
              </span>
              <h3 className="text-lg font-bold text-white">
                “{spokenTranscript}”
              </h3>
              <p className="text-xs text-slate-400">
                Extracting age, occupation, and stated need from spoken input...
              </p>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE 4: BUILDING PROFILE & CONFIRMATION */}
          {/* ======================================================== */}
          {voiceState === 'BUILDING_PROFILE' && extractedData && (
            <div className="w-full space-y-4 animate-fade-in text-left">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                  TRANSCRIPTION & PROFILE
                </span>
                <h3 className="text-lg font-extrabold text-white">Is this information correct?</h3>
              </div>

              {/* I Heard Card */}
              <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 space-y-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    I HEARD (ENGLISH TRANSLATION):
                  </span>
                  <p className="text-sm font-semibold text-emerald-300 mt-0.5">
                    “{extractedData.rawTranscribedEnglish}”
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 italic">
                    Original voice input: “{spokenTranscript}”
                  </p>
                </div>

                <div className="border-t border-slate-700/80 pt-3">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    EXTRACTED PROFILE:
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Age</span>
                      <strong className="text-white text-sm">
                        {extractedData.age || userProfile.age} years
                      </strong>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Occupation</span>
                      <strong className="text-white text-sm">
                        {extractedData.occupation || userProfile.occupation}
                      </strong>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Need Category</span>
                      <strong className="text-emerald-400 text-sm capitalize">
                        {(extractedData.need || userProfile.need).replace('_', ' ')}
                      </strong>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">State & District</span>
                      <strong className="text-white text-sm">
                        {currentStateConfig.name} ({userProfile.district || 'All'})
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  id="voice-edit-profile-btn"
                  onClick={() => setShowManualEdit(!showManualEdit)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>{showManualEdit ? 'HIDE EDIT' : 'EDIT DETAILS'}</span>
                </button>
                <button
                  id="voice-confirm-profile-btn"
                  onClick={handleConfirmProfileAndMatch}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>YES, CONTINUE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Manual Quick Edit Drawer if user clicked Edit */}
              {showManualEdit && (
                <div className="mt-3 p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-400 block">Age</label>
                      <input
                        id="voice-edit-age"
                        type="number"
                        defaultValue={extractedData.age || userProfile.age}
                        onChange={(e) =>
                          setExtractedData((prev) =>
                            prev ? { ...prev, age: parseInt(e.target.value) || 48 } : null
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 block">Occupation</label>
                      <input
                        id="voice-edit-occupation"
                        type="text"
                        defaultValue={extractedData.occupation || userProfile.occupation}
                        onChange={(e) =>
                          setExtractedData((prev) =>
                            prev ? { ...prev, occupation: e.target.value } : null
                          )
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-white text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE 5: CHECKING SCHEMES (ANIMATION STEPS) */}
          {/* ======================================================== */}
          {voiceState === 'CHECKING' && (
            <div className="w-full space-y-5 py-4 animate-fade-in text-left max-w-md mx-auto">
              <div className="text-center space-y-1">
                <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase">
                  DETERMINISTIC ELIGIBILITY ENGINE
                </span>
                <h3 className="text-lg font-bold text-white">
                  Checking Schemes for {currentStateConfig.name}...
                </h3>
              </div>

              <div className="space-y-3 bg-slate-800/90 p-4 rounded-2xl border border-slate-700 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Understanding profile...</span>
                  {activeStepIndex >= 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-600 animate-pulse"></span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Checking age & income rules...</span>
                  {activeStepIndex >= 1 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-600 animate-pulse"></span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Checking location ({currentStateConfig.name})...</span>
                  {activeStepIndex >= 2 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-600 animate-pulse"></span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300">Finding best potential matches...</span>
                  {activeStepIndex >= 3 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-slate-600 animate-pulse"></span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* STATE 6: MATCHED */}
          {/* ======================================================== */}
          {voiceState === 'MATCHED' && (
            <div className="w-full space-y-5 py-4 animate-fade-in text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  MATCHING COMPLETE
                </span>
                <h3 className="text-2xl font-black text-white mt-1">
                  🎉 We Found {activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length} Potential Matches
                </h3>
                <p className="text-xs text-emerald-200 mt-1 font-medium">
                  {voicePack.matchedHeading(activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length)}
                </p>
              </div>

              {/* Quick Top Match Preview */}
              {activeMatches[0] && (
                <div className="bg-slate-800/90 rounded-2xl p-4 border border-emerald-600/60 text-left text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700">
                      TOP MATCH: {activeMatches[0].score}% MATCH
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {activeMatches[0].scheme.schemeType.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm">
                    {activeMatches[0].scheme.name}
                  </h4>
                  <p className="text-slate-300 text-xs">
                    {activeMatches[0].scheme.benefits.shortSummary}
                  </p>
                </div>
              )}

              <button
                id="voice-view-matches-btn"
                onClick={handleGoToMatches}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-600/30 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <span>VIEW ALL MATCHED SCHEMES</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
