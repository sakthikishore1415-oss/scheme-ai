import React, { useState } from 'react';
import { MatchResult } from '../types';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
import {
  Sparkles,
  HelpCircle,
  Volume2,
  Bookmark,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';

interface SchemeCardProps {
  matchResult: MatchResult;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({ matchResult }) => {
  const {
    setSelectedSchemeDetail,
    setSelectedWhyMeScheme,
    toggleSaveScheme,
    isSchemeSaved,
    selectedVoiceLanguageId,
    easyMode,
  } = useApp();

  const { scheme, score, matchLevel, criteriaBreakdown } = matchResult;
  const isSaved = isSchemeSaved(scheme.id);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);

  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingVoice) {
      speechService.stop();
      setIsPlayingVoice(false);
      return;
    }

    const textToSpeak =
      scheme.languageContent?.[selectedVoiceLanguageId]?.voiceExplanation ||
      scheme.summarySimple ||
      scheme.name;

    setIsPlayingVoice(true);
    speechService.speak(
      textToSpeak,
      selectedVoiceLanguageId,
      () => setIsPlayingVoice(true),
      () => setIsPlayingVoice(false)
    );
  };

  const getScoreBadgeStyles = (level: string) => {
    switch (level) {
      case 'STRONG':
        return 'bg-[#94f6c4]/40 text-[#00462d] border-[#57b98c]/50';
      case 'POTENTIAL':
        return 'bg-[#ffddb8] text-[#855300] border-[#fea619]/60';
      default:
        return 'bg-[#edeef0] text-[#44464f] border-[#c5c6d0]';
    }
  };

  return (
    <div
      id={`scheme-card-${scheme.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-card-hover flex flex-col justify-between overflow-hidden ${
        matchLevel === 'STRONG'
          ? 'border-[#57b98c]/60 ring-1 ring-[#00462d]/10'
          : 'border-[#c5c6d0]/60'
      } ${easyMode ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}`}
    >
      {/* Header Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${getScoreBadgeStyles(
                matchLevel
              )}`}
            >
              <Sparkles className="w-3 h-3" />
              {score}% PROFILE MATCH
            </span>

            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                scheme.schemeType === 'central'
                  ? 'bg-[#d9e2ff] text-[#001944] border border-[#b0c6ff]'
                  : 'bg-[#f2f4f6] text-[#092554] border border-[#c5c6d0]'
              }`}
            >
              {scheme.schemeType === 'central' ? 'Central Scheme' : `${scheme.stateId || scheme.state || 'State'} Scheme`}
            </span>
          </div>

          <button
            id={`save-scheme-btn-${scheme.id}`}
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveScheme(scheme.id);
            }}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]'
                : 'bg-[#f2f4f6] text-[#757780] border-[#c5c6d0]/60 hover:text-[#191c1e]'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#ba1a1a]' : ''}`} />
          </button>
        </div>

        {/* Scheme Title & Native Name */}
        <h3
          className={`font-bold text-[#092554] leading-snug cursor-pointer hover:text-[#243b6b] transition-colors ${
            easyMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          }`}
          onClick={() => setSelectedSchemeDetail(scheme)}
        >
          {scheme.name}
        </h3>
        {scheme.nativeName && (
          <p className="text-xs text-[#44464f] font-medium mt-0.5">
            {scheme.nativeName}
          </p>
        )}

        {/* Department Info */}
        <p className="text-[11px] text-[#757780] font-medium mt-1 flex items-center gap-1">
          <Building className="w-3 h-3 shrink-0 text-[#092554]" />
          <span className="truncate">{scheme.department || scheme.authority || 'Government Authority'}</span>
        </p>

        {/* Benefit Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-[#f2f4f6] border border-[#c5c6d0]/60">
          <span className="text-[10px] font-bold text-[#855300] uppercase tracking-wider block mb-0.5">
            Potential Benefit
          </span>
          <p className={`font-bold text-[#002d1c] ${easyMode ? 'text-base' : 'text-sm'}`}>
            {scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Welfare Entitlement'}
          </p>
          {scheme.benefits?.shortSummary && (
            <p className="text-[11px] text-[#44464f] mt-0.5 leading-relaxed line-clamp-2">
              {scheme.benefits.shortSummary}
            </p>
          )}
        </div>

        {/* Criteria Matching Summary Chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="inline-flex items-center gap-1 text-[#44464f] font-medium">
            {criteriaBreakdown.age ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00462d] shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-[#fea619] shrink-0" />
            )}
            Age
          </span>
          <span className="text-[#c5c6d0]">•</span>
          <span className="inline-flex items-center gap-1 text-[#44464f] font-medium">
            {criteriaBreakdown.income ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00462d] shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-[#fea619] shrink-0" />
            )}
            Income
          </span>
          <span className="text-[#c5c6d0]">•</span>
          <span className="inline-flex items-center gap-1 text-[#44464f] font-medium">
            {criteriaBreakdown.occupation ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00462d] shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-[#fea619] shrink-0" />
            )}
            Occupation
          </span>
          <span className="text-[#c5c6d0]">•</span>
          <span className="inline-flex items-center gap-1 text-[#44464f] font-medium">
            {criteriaBreakdown.location ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00462d] shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-[#fea619] shrink-0" />
            )}
            State
          </span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="mt-4 pt-3 border-t border-[#edeef0] flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          {/* Why Me Button */}
          <button
            id={`why-me-btn-${scheme.id}`}
            onClick={() => setSelectedWhyMeScheme(matchResult)}
            className="px-2.5 py-1.5 rounded-xl bg-[#d9e2ff]/60 hover:bg-[#d9e2ff] text-[#001944] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-[#b0c6ff]/60"
            title="Explain why this scheme matches your profile"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#092554]" />
            <span>WHY ME?</span>
          </button>

          {/* Spoken Voice Button (Regional Voice) */}
          <button
            id={`hear-scheme-voice-btn-${scheme.id}`}
            onClick={handlePlayVoice}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              isPlayingVoice
                ? 'bg-[#092554] text-white border-[#092554] animate-pulse'
                : 'bg-[#f2f4f6] hover:bg-[#edeef0] text-[#092554] border-[#c5c6d0]/60'
            }`}
            title="Hear explanation in regional language voice"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#092554]" />
            <span>{isPlayingVoice ? 'SPEAKING...' : 'HEAR'}</span>
          </button>
        </div>

        {/* View Details Primary Action */}
        <button
          id={`view-details-btn-${scheme.id}`}
          onClick={() => setSelectedSchemeDetail(scheme)}
          className="px-3.5 py-1.5 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>DETAILS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
