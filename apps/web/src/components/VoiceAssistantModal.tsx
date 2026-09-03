import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { getVoicePack } from '../data/locales';
import { speechService } from '../utils/speech';
import { extractProfileFromSpokenText, translateToEnglish, ExtractedProfileData } from '../utils/nlpExtractor';
import { detectLanguageFromText } from '../utils/languageDetector';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import {
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
  Edit3,
} from 'lucide-react';

type VoiceState =
  | 'READY'
  | 'LISTENING'
  | 'UNDERSTANDING'
  | 'BUILDING_PROFILE'
  | 'CHECKING'
  | 'MATCHED'
  | 'ERROR';

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
    schemesStatus,
  } = useApp();

  const [voiceState, setVoiceState] = useState<VoiceState>('READY');
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedProfileData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState<boolean>(false);
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
      setErrorMessage(null);
      setShowManualEdit(false);

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

  // Start Voice Listening via Web Speech API
  const handleStartListening = () => {
    speechService.stop();
    setVoiceState('LISTENING');
    setErrorMessage(null);

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
          setSpokenTranscript(transcript);
        };

        recognition.onend = () => {
          if (finalCaptured.trim()) {
            processSpokenText(finalCaptured);
          } else {
            setVoiceState('ERROR');
            setErrorMessage('Could not detect clear speech. Please tap Speak again or type your details below.');
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setVoiceState('ERROR');
          setErrorMessage('Microphone input interrupted or permission required. You can also type your information.');
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    }

    setVoiceState('ERROR');
    setErrorMessage('Browser SpeechRecognition not supported on this browser. Please use the text input below.');
  };

  const [detectedLangFeedback, setDetectedLangFeedback] = useState<string | null>(null);

  const processSpokenText = (text: string) => {
    setVoiceState('UNDERSTANDING');

    // Auto-detect language from spoken or transcribed script
    const detectedLang = detectLanguageFromText(text);
    let activeLang = selectedVoiceLanguageId;
    if (detectedLang && detectedLang !== selectedVoiceLanguageId && SUPPORTED_LANGUAGES[detectedLang]) {
      activeLang = detectedLang;
      setSelectedVoiceLanguageId(detectedLang);
      setDetectedLangFeedback(
        `Auto-detected language: ${SUPPORTED_LANGUAGES[detectedLang].nativeName} (${SUPPORTED_LANGUAGES[detectedLang].name})`
      );
    } else {
      setDetectedLangFeedback(null);
    }

    const extracted = extractProfileFromSpokenText(text, activeLang);
    setExtractedData(extracted);
    setVoiceState('BUILDING_PROFILE');

    logCitizenCallStep({
      device: 'Smartphone (Voice Input)',
      need: extracted.need || userProfile?.need || 'general',
      profile: {
        ...(extracted.age ? { age: extracted.age } : {}),
        ...(extracted.occupation ? { occupation: extracted.occupation } : {}),
        ...(extracted.annualIncome ? { annualIncome: extracted.annualIncome } : {}),
      },
      status: 'Voice Input Parsed',
      ivrSteps: ['Smartphone Voice Captured', `Input: "${text.slice(0, 40)}..."`],
    });
  };

  const handleConfirmProfileAndMatch = () => {
    if (extractedData) {
      updateUserProfile({
        ...(extractedData.age ? { age: extractedData.age } : {}),
        ...(extractedData.occupation ? { occupation: extractedData.occupation } : {}),
        ...(extractedData.annualIncome ? { annualIncome: extractedData.annualIncome } : {}),
        ...(extractedData.need ? { need: extractedData.need } : {}),
        ...(extractedData.gender ? { gender: extractedData.gender } : {}),
      });
    }

    setVoiceState('MATCHED');
    const eligibleMatches = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO');

    if (eligibleMatches.length > 0) {
      triggerMatchCelebration();
      const spokenSummary = voicePack.matchedHeading(eligibleMatches.length);
      speechService.speak(spokenSummary, selectedVoiceLanguageId);
    } else {
      const emptySummary =
        selectedVoiceLanguageId === 'ta'
          ? 'உங்கள் தகவல்கள் பதிவு செய்யப்பட்டன. தற்போது திட்டங்கள் எதுவும் பொருந்தவில்லை அல்லது இணைக்கப்படவில்லை.'
          : 'Profile updated. No matching government schemes currently found in repository.';
      speechService.speak(emptySummary, selectedVoiceLanguageId);
    }
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
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center space-y-4">
          {/* 1. READY & LISTENING STATE */}
          {(voiceState === 'READY' || voiceState === 'LISTENING' || voiceState === 'ERROR') && (
            <div className="space-y-6 max-w-md w-full">
              <div className="space-y-2">
                <h3 className="text-lg sm:text-xl font-black text-white">
                  {voiceState === 'LISTENING' ? voicePack.listeningPrompt : voicePack.greetingPrompt}
                </h3>
                <p className="text-xs text-slate-400">
                  Speak clearly in your regional language. For example, mention your age, occupation, or what assistance you need.
                </p>
              </div>

              {/* Central Mic Visualizer Button */}
              <div className="flex justify-center my-4">
                <button
                  onClick={handleStartListening}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl ${
                    voiceState === 'LISTENING'
                      ? 'bg-red-600 animate-pulse ring-8 ring-red-500/30'
                      : 'bg-linear-to-tr from-emerald-600 to-teal-600 hover:scale-105 ring-8 ring-emerald-500/20'
                  }`}
                >
                  <Mic className="w-10 h-10 text-white" />
                  <span className="text-[11px] font-extrabold text-white mt-1 uppercase">
                    {voiceState === 'LISTENING' ? 'Listening...' : 'Tap to Speak'}
                  </span>
                </button>
              </div>

              {/* Error prompt if mic failed */}
              {errorMessage && (
                <div className="bg-red-950/80 border border-red-800 p-3 rounded-2xl text-red-300 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Direct Text Fallback Form */}
              <div className="pt-2 border-t border-slate-800 text-xs space-y-2 text-left">
                <label className="text-slate-400 font-bold block">Or Type Your Query / Details:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 45 years old farmer needing subsidy..."
                    value={customTextInput}
                    onChange={(e) => setCustomTextInput(e.target.value)}
                    className="flex-1 p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                  />
                  <button
                    onClick={() => {
                      if (customTextInput.trim()) processSpokenText(customTextInput);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. UNDERSTANDING & BUILDING PROFILE STATE */}
          {(voiceState === 'UNDERSTANDING' || voiceState === 'BUILDING_PROFILE') && (
            <div className="space-y-4 max-w-md w-full text-left">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                    🗣️ Spoken Input
                  </span>
                  {detectedLangFeedback && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-teal-300 bg-teal-950/80 border border-teal-700/60 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5 text-teal-400" />
                      {detectedLangFeedback}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white">
                  "{spokenTranscript || customTextInput}"
                </p>

                {/* English Translation */}
                <div className="pt-2 border-t border-slate-700/80">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                    🌐 English Translation
                  </span>
                  <p className="text-xs text-amber-100 font-medium italic">
                    "{translateToEnglish(spokenTranscript || customTextInput, extractedData?.detectedLanguage)}"
                  </p>
                </div>
              </div>

              <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-3">
                <h4 className="font-extrabold text-sm text-emerald-400">Extracted Demographic Parameters:</h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Age</span>
                    <strong className="text-white">{extractedData?.age ? `${extractedData.age} Years` : 'Not mentioned'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Occupation</span>
                    <strong className="text-white">{extractedData?.occupation || 'Not specified'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Annual Income</span>
                    <strong className="text-white">
                      {extractedData?.annualIncome ? `₹${extractedData.annualIncome.toLocaleString('en-IN')}` : 'Not mentioned'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Primary Sector</span>
                    <strong className="text-white capitalize">{extractedData?.need?.replace('_', ' ') || 'General'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setVoiceState('READY')}
                  className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                >
                  Speak Again
                </button>
                <button
                  onClick={handleConfirmProfileAndMatch}
                  className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <span>CONFIRM & EVALUATE</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* 3. MATCHED RESULT STATE */}
          {voiceState === 'MATCHED' && (
            <div className="space-y-4 max-w-md w-full">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  {activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length > 0
                    ? `Found ${activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length} Eligible Schemes!`
                    : 'Profile Successfully Updated'}
                </h3>
                <p className="text-xs text-slate-300">
                  {schemesStatus === 'NO_DATA'
                    ? 'No schemes loaded in repository database.'
                    : activeMatches.length > 0
                    ? 'Official eligibility rules evaluated against your spoken criteria.'
                    : 'No matching government schemes found for your stated criteria.'}
                </p>
              </div>

              <button
                onClick={handleGoToMatches}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>VIEW SCHEMES & ENTITLEMENTS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
