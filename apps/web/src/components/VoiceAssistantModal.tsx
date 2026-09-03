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
  VolumeX,
  RotateCcw,
  Sparkles,
  ArrowRight,
  X,
  AlertCircle,
  CheckCircle2,
  FileCheck2,
  Shield,
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
    schemesStatus,
  } = useApp();

  const [voiceState, setVoiceState] = useState<VoiceState>('READY');
  const [spokenTranscript, setSpokenTranscript] = useState<string>('');
  const [extractedData, setExtractedData] = useState<ExtractedProfileData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAssistantSpeech, setCurrentAssistantSpeech] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState<boolean>(false);
  const [customTextInput, setCustomTextInput] = useState<string>('');
  const [detectedLangFeedback, setDetectedLangFeedback] = useState<string | null>(null);

  const voicePack = getVoicePack(selectedVoiceLanguageId);
  const recognitionRef = useRef<any>(null);

  const speakAloud = (text: string, langId: string = selectedVoiceLanguageId) => {
    setCurrentAssistantSpeech(text);
    if (isMuted) return;
    setIsSpeakingPrompt(true);
    speechService.speak(
      text,
      langId,
      () => setIsSpeakingPrompt(true),
      () => setIsSpeakingPrompt(false),
      () => setIsSpeakingPrompt(false)
    );
  };

  // Play spoken greeting on modal open
  useEffect(() => {
    if (showVoiceModal) {
      setVoiceState('READY');
      setSpokenTranscript('');
      setExtractedData(null);
      setErrorMessage(null);
      setCustomTextInput('');

      const prompt = voicePack.greetingPrompt;
      speakAloud(prompt, selectedVoiceLanguageId);
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
    setCurrentAssistantSpeech(voicePack.listeningPrompt);

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
            const err = voicePack.errorVoicePrompt;
            setErrorMessage(err);
            speakAloud(err, selectedVoiceLanguageId);
          }
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition error:', err);
          setVoiceState('ERROR');
          const errText = voicePack.errorVoicePrompt;
          setErrorMessage(errText);
          speakAloud(errText, selectedVoiceLanguageId);
        };

        recognition.start();
        return;
      } catch (err) {
        console.warn('Speech recognition start error:', err);
      }
    }

    setVoiceState('ERROR');
    const fallbackMsg = 'Browser SpeechRecognition not supported on this browser. Please type below.';
    setErrorMessage(fallbackMsg);
    speakAloud(fallbackMsg, selectedVoiceLanguageId);
  };

  const processSpokenText = (text: string) => {
    setVoiceState('UNDERSTANDING');

    // Auto-detect language
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

    const currentPack = getVoicePack(activeLang);
    const extracted = extractProfileFromSpokenText(text, activeLang);
    setExtractedData(extracted);
    setVoiceState('BUILDING_PROFILE');

    // Assistant confirms transcript + asks profession-specific follow-up question aloud
    const heardLine = currentPack.heardConfirmation(text);
    const followUpLine = extracted.occupation
      ? currentPack.professionFollowUp(extracted.occupation)
      : currentPack.ageQuestion;

    const fullSpokenReply = `${heardLine} ${followUpLine}`;
    speakAloud(fullSpokenReply, activeLang);

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
    const currentPack = getVoicePack(selectedVoiceLanguageId);
    const eligibleMatches = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO');

    if (eligibleMatches.length > 0) {
      triggerMatchCelebration();
      const matchSpeech = currentPack.eligibilitySummary(eligibleMatches.length);
      const docSpeech = currentPack.documentExplanation([]);
      const combinedSpeech = `${matchSpeech} ${docSpeech}`;
      speakAloud(combinedSpeech, selectedVoiceLanguageId);
    } else {
      const emptySpeech =
        selectedVoiceLanguageId === 'ta'
          ? 'உங்கள் தகவல்கள் பதிவு செய்யப்பட்டன. தற்போது திட்டங்கள் எதுவும் பொருந்தவில்லை.'
          : 'Profile updated. No matching schemes currently found for your criteria.';
      speakAloud(emptySpeech, selectedVoiceLanguageId);
    }
  };

  const handleGoToMatches = () => {
    speechService.stop();
    setShowVoiceModal(false);
    setActiveTab('matches');
  };

  const handleToggleMute = () => {
    if (!isMuted) {
      speechService.stop();
      setIsMuted(true);
    } else {
      setIsMuted(false);
      if (currentAssistantSpeech) {
        speechService.speak(currentAssistantSpeech, selectedVoiceLanguageId);
      }
    }
  };

  const handleRepeatSpeech = () => {
    if (currentAssistantSpeech) {
      speakAloud(currentAssistantSpeech, selectedVoiceLanguageId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#092554] text-white rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#b0c6ff]/30 overflow-hidden relative">
        {/* Top Bar */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-white/10 bg-[#001944]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#fea619] text-[#092554] flex items-center justify-center font-bold text-sm shadow-sm">
              அ
            </div>
            <div>
              <span className="text-xs font-bold tracking-wider text-[#94f6c4] uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Regional Voice Assistant
              </span>
              <p className="text-[11px] text-[#d9e2ff]">
                📍 {currentStateConfig.name} • 🎙️ {currentLanguageConfig.name} ({currentLanguageConfig.bcp47Code})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute / Unmute Button */}
            <button
              id="voice-modal-mute-btn"
              onClick={handleToggleMute}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isMuted ? 'bg-rose-500/30 text-rose-300 border border-rose-500/40' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
              title={isMuted ? 'Unmute Speech' : 'Mute Speech'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Repeat Audio Button */}
            <button
              id="voice-modal-repeat-btn"
              onClick={handleRepeatSpeech}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Repeat Spoken Prompt"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              id="voice-modal-close-btn"
              onClick={() => {
                speechService.stop();
                setShowVoiceModal(false);
              }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Assistant Content Body */}
        <div className="p-5 sm:p-6 flex-1 overflow-y-auto flex flex-col items-center justify-center text-center space-y-4">
          {/* Active Spoken Speech Card (Always displays the exact spoken reply on screen) */}
          {currentAssistantSpeech && (
            <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 text-left space-y-1.5 shadow-md">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#fea619] uppercase tracking-wider flex items-center gap-1">
                  <Volume2 className={`w-3.5 h-3.5 ${isSpeakingPrompt ? 'animate-bounce text-[#94f6c4]' : ''}`} />
                  Assistant Speaking ({currentLanguageConfig.bcp47Code})
                </span>
                {isSpeakingPrompt && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#94f6c4]/30 text-[#94f6c4] border border-[#94f6c4]/40 animate-pulse">
                    PLAYING AUDIO
                  </span>
                )}
              </div>
              <p className="text-sm font-semibold text-white leading-relaxed">
                “{currentAssistantSpeech}”
              </p>
            </div>
          )}

          {/* 1. READY & LISTENING STATE */}
          {(voiceState === 'READY' || voiceState === 'LISTENING' || voiceState === 'ERROR') && (
            <div className="space-y-5 max-w-md w-full">
              {/* Central Mic Button */}
              <div className="flex justify-center my-2">
                <button
                  onClick={handleStartListening}
                  className={`w-28 h-28 rounded-full flex flex-col items-center justify-center transition-all cursor-pointer shadow-2xl ${
                    voiceState === 'LISTENING'
                      ? 'bg-rose-600 animate-pulse ring-8 ring-rose-500/30'
                      : 'bg-linear-to-tr from-[#00462d] to-[#002d1c] hover:scale-105 ring-8 ring-[#94f6c4]/20 border-2 border-[#94f6c4]'
                  }`}
                >
                  <Mic className="w-10 h-10 text-white" />
                  <span className="text-[11px] font-bold text-white mt-1 uppercase">
                    {voiceState === 'LISTENING' ? 'Listening...' : 'Tap to Speak'}
                  </span>
                </button>
              </div>

              {/* Error prompt if mic failed */}
              {errorMessage && (
                <div className="bg-rose-950/80 border border-rose-800 p-3 rounded-2xl text-rose-200 text-xs flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Direct Text Fallback Form */}
              <div className="pt-3 border-t border-white/10 text-xs space-y-2 text-left">
                <label className="text-[#d9e2ff] font-bold block">Or Type Your Query / Details:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 48 வயது விவசாயி, உரம் மானியம் தேவை..."
                    value={customTextInput}
                    onChange={(e) => setCustomTextInput(e.target.value)}
                    className="flex-1 p-3 rounded-xl bg-white/10 border border-white/20 text-xs text-white placeholder-[#d9e2ff]/50 focus:border-[#fea619] outline-none"
                  />
                  <button
                    onClick={() => {
                      if (customTextInput.trim()) processSpokenText(customTextInput);
                    }}
                    className="px-5 py-3 rounded-xl bg-[#fea619] hover:bg-[#ffb94f] text-[#092554] font-bold cursor-pointer transition-colors"
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
              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#94f6c4] uppercase tracking-wider block">
                    🗣️ Spoken Input
                  </span>
                  {detectedLangFeedback && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-[#d9e2ff] bg-white/10 border border-white/20 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-2.5 h-2.5 text-[#fea619]" />
                      {detectedLangFeedback}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold text-white">
                  "{spokenTranscript || customTextInput}"
                </p>

                {/* English Translation */}
                <div className="pt-2 border-t border-white/10">
                  <span className="text-[10px] font-bold text-[#fea619] uppercase tracking-wider block mb-1">
                    🌐 English Translation
                  </span>
                  <p className="text-xs text-[#d9e2ff] font-medium italic">
                    "{translateToEnglish(spokenTranscript || customTextInput, extractedData?.detectedLanguage)}"
                  </p>
                </div>
              </div>

              <div className="bg-white/10 p-4 rounded-2xl border border-white/20 space-y-3">
                <h4 className="font-bold text-xs text-[#94f6c4] uppercase tracking-wider">
                  Extracted Demographic Parameters:
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#001944] border border-white/10">
                    <span className="text-[#d9e2ff]/70 block text-[10px]">Age</span>
                    <strong className="text-white">{extractedData?.age ? `${extractedData.age} Years` : 'Not mentioned'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#001944] border border-white/10">
                    <span className="text-[#d9e2ff]/70 block text-[10px]">Occupation</span>
                    <strong className="text-white">{extractedData?.occupation || 'Not specified'}</strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#001944] border border-white/10">
                    <span className="text-[#d9e2ff]/70 block text-[10px]">Annual Income</span>
                    <strong className="text-white">
                      {extractedData?.annualIncome ? `₹${extractedData.annualIncome.toLocaleString('en-IN')}` : 'Not mentioned'}
                    </strong>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#001944] border border-white/10">
                    <span className="text-[#d9e2ff]/70 block text-[10px]">Primary Sector</span>
                    <strong className="text-white capitalize">{extractedData?.need?.replace('_', ' ') || 'General'}</strong>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setVoiceState('READY')}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  Speak Again
                </button>
                <button
                  onClick={handleConfirmProfileAndMatch}
                  className="flex-1 py-3 rounded-xl bg-[#fea619] hover:bg-[#ffb94f] text-[#092554] font-bold text-xs cursor-pointer shadow-md flex items-center justify-center gap-1.5 transition-colors"
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
              <div className="w-14 h-14 mx-auto rounded-full bg-[#94f6c4]/20 text-[#94f6c4] flex items-center justify-center border border-[#94f6c4]/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-white">
                  {activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length > 0
                    ? `Found ${activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length} Eligible Schemes!`
                    : 'Profile Successfully Updated'}
                </h3>
                <p className="text-xs text-[#d9e2ff]">
                  {schemesStatus === 'NO_DATA'
                    ? 'No schemes loaded in repository database.'
                    : activeMatches.length > 0
                    ? 'Official eligibility rules evaluated against your spoken criteria.'
                    : 'No matching government schemes found for your stated criteria.'}
                </p>
              </div>

              {/* Required Documents Callout */}
              <div className="p-3.5 rounded-2xl bg-[#001944] border border-white/10 text-left space-y-1 text-xs">
                <span className="text-[10px] font-bold text-[#fea619] uppercase tracking-wider flex items-center gap-1">
                  <FileCheck2 className="w-3.5 h-3.5" />
                  Key Required Documents Explained
                </span>
                <p className="text-[11px] text-[#d9e2ff] leading-relaxed">
                  Aadhaar Card, Income Certificate, and Bank Account Passbook are recommended for immediate application.
                </p>
              </div>

              <button
                onClick={handleGoToMatches}
                className="w-full py-3.5 rounded-2xl bg-[#fea619] hover:bg-[#ffb94f] text-[#092554] font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
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
