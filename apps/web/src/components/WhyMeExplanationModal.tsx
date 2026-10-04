import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
import {
  HelpCircle,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  X,
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
    whyMeEnglish,
    whyMeRegional,
    matchedPoints,
    pendingPoints,
  } = selectedWhyMeScheme;

  const handlePlayAudio = () => {
    speechService.unlockAudio();
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
      return;
    }

    const regionalText =
      whyMeRegional.join('. ') ||
      `${scheme.name}: ${whyMeEnglish.join('. ')}`;

    setIsPlayingAudio(true);
    speechService.speak(
      regionalText,
      selectedVoiceLanguageId,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#c5c6d0]/60 overflow-hidden">
        {/* Header */}
        <div className="bg-[#092554] text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-[#94f6c4]/30 text-[#94f6c4] text-[11px] px-2.5 py-0.5 rounded-full font-bold border border-[#57b98c]/40 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" />
                EXPLAINABILITY ENGINE
              </span>
              <span className="text-xs text-[#90a6dd]">Match Score: {score}%</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Why Did We Show This Scheme?
            </h2>
            <p className="text-xs text-[#d9e2ff] mt-0.5">
              Transparent breakdown for <strong>{scheme.name}</strong>
            </p>
          </div>
          <button
            id="close-why-me-modal-btn"
            onClick={() => {
              speechService.stop();
              setSelectedWhyMeScheme(null);
            }}
            className="p-1.5 rounded-xl bg-[#243b6b] text-[#d9e2ff] hover:bg-[#243b6b]/80 border border-[#90a6dd]/30 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Spoken Voice Explanation Card */}
          {whyMeRegional.length > 0 && (
            <div className="bg-[#d9e2ff]/40 border border-[#b0c6ff] rounded-2xl p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-[#092554]" />
                  <span className="text-xs font-bold text-[#092554] uppercase tracking-wider">
                    Hear in {currentLanguageConfig.name} ({currentLanguageConfig.nativeName})
                  </span>
                </div>
                <button
                  id="why-me-audio-btn"
                  onClick={handlePlayAudio}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                    isPlayingAudio
                      ? 'bg-[#092554] text-white animate-pulse'
                      : 'bg-[#092554] hover:bg-[#243b6b] text-white'
                  }`}
                >
                  <span>{isPlayingAudio ? 'STOP' : 'HEAR AUDIO'}</span>
                </button>
              </div>
              <div className="space-y-1 text-xs text-[#092554] font-medium leading-relaxed bg-white/80 rounded-xl p-3 border border-[#b0c6ff]/40">
                {whyMeRegional.map((point, idx) => (
                  <p key={idx}>{point}</p>
                ))}
              </div>
            </div>
          )}

          {/* Criteria Checklist (English) */}
          <div>
            <h3 className="text-xs font-bold text-[#092554] uppercase tracking-wider mb-2">
              Profile Criteria Comparison:
            </h3>
            <div className="space-y-2">
              {whyMeEnglish.map((line, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#f8f9fb] border border-[#c5c6d0]/60 flex items-start gap-2.5 text-xs text-[#191c1e]"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#00462d] shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{line}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Requirements or Documents */}
          {pendingPoints && pendingPoints.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-[#855300] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-[#fea619]" />
                Special Conditions & Documentation:
              </h3>
              <div className="space-y-2">
                {pendingPoints.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#ffddb8]/40 border border-[#fea619]/60 text-xs text-[#855300] font-medium"
                  >
                    • {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Civic Trust Disclaimer */}
          <div className="p-3.5 rounded-xl bg-[#f2f4f6] border border-[#c5c6d0]/60 text-[11px] text-[#44464f] flex items-start gap-2">
            <Info className="w-4 h-4 text-[#092554] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Important Disclaimer:</strong> Arivom Thittam uses deterministic rule matching based on published government gazette guidelines. Final eligibility is verified and sanctioned exclusively by the respective government department or Grama Niladhari / Revenue Officer.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#f8f9fb] border-t border-[#c5c6d0]/60 flex items-center justify-end">
          <button
            id="close-why-me-footer-btn"
            onClick={() => {
              speechService.stop();
              setSelectedWhyMeScheme(null);
            }}
            className="px-5 py-2 text-xs font-bold text-white bg-[#092554] hover:bg-[#243b6b] rounded-xl cursor-pointer transition-colors"
          >
            GOT IT
          </button>
        </div>
      </div>
    </div>
  );
};
