import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
import {
  HelpCircle,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  X,
  ShieldCheck,
  Building,
  Info,
} from 'lucide-react';

export const WhyMeExplanationModal: React.FC = () => {
  const {
    selectedWhyMeScheme,
    setSelectedWhyMeScheme,
    selectedVoiceLanguageId,
    currentLanguageConfig,
    userProfile,
  } = useApp();

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!selectedWhyMeScheme) return null;

  const {
    scheme,
    score,
    matchLevel,
    whyMeEnglish,
    whyMeRegional,
    criteriaBreakdown,
    matchedPoints,
    pendingPoints,
  } = selectedWhyMeScheme;

  const handlePlayAudio = () => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
      return;
    }

    const regionalText =
      whyMeRegional.join('. ') ||
      `${scheme.name} திட்டம் உங்கள் வயது ${userProfile.age} மற்றும் தொழில் ${userProfile.occupation} விதிகளுக்கு பொருந்துகிறது.`;

    setIsPlayingAudio(true);
    speechService.speak(
      regionalText,
      selectedVoiceLanguageId,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/30 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                EXPLAINABILITY ENGINE
              </span>
              <span className="text-xs text-slate-400">Match Score: {score}%</span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white">
              Why Did We Show This Scheme?
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Transparent breakdown for <strong>{scheme.name}</strong>
            </p>
          </div>
          <button
            id="close-why-me-modal-btn"
            onClick={() => {
              speechService.stop();
              setSelectedWhyMeScheme(null);
            }}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Spoken Voice Explanation Card */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-5 h-5 text-emerald-700" />
                <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Hear in {currentLanguageConfig.name} ({currentLanguageConfig.nativeName})
                </span>
              </div>
              <button
                id="why-me-audio-btn"
                onClick={handlePlayAudio}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                  isPlayingAudio
                    ? 'bg-emerald-700 text-white animate-pulse'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                <span>{isPlayingAudio ? 'STOP' : 'HEAR AUDIO'}</span>
              </button>
            </div>
            <div className="space-y-1 text-xs text-emerald-950 font-medium leading-relaxed bg-white/70 rounded-xl p-3 border border-emerald-100">
              {whyMeRegional.map((point, idx) => (
                <p key={idx}>{point}</p>
              ))}
            </div>
          </div>

          {/* Criteria Checklist (English) */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Profile Criteria Comparison:
            </h3>
            <div className="space-y-2">
              {whyMeEnglish.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Requirements or Documents */}
          {pendingPoints && pendingPoints.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Special Conditions & Documentation:
              </h3>
              <div className="space-y-2">
                {pendingPoints.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-950 font-medium"
                  >
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Civic Trust Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <p leading-relaxed>
              <strong>Important Disclaimer:</strong> Arivom Thittam uses deterministic rule matching based on published government gazette guidelines. Final eligibility is verified and sanctioned exclusively by the respective government department or Grama Niladhari / Revenue Officer.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            id="close-why-me-footer-btn"
            onClick={() => {
              speechService.stop();
              setSelectedWhyMeScheme(null);
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
