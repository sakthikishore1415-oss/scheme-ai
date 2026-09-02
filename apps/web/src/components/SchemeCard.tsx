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

  const getScoreBadgeColor = (level: string) => {
    switch (level) {
      case 'STRONG':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'POTENTIAL':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  return (
    <div
      id={`scheme-card-${scheme.id}`}
      className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden ${
        matchLevel === 'STRONG'
          ? 'border-emerald-200/90 ring-1 ring-emerald-500/20'
          : 'border-slate-200'
      } ${easyMode ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}`}
    >
      {/* Header Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-md border flex items-center gap-1 ${getScoreBadgeColor(
                matchLevel
              )}`}
            >
              <Sparkles className="w-3 h-3" />
              {score}% PROFILE MATCH
            </span>

            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                scheme.schemeType === 'central'
                  ? 'bg-blue-50 text-blue-800 border border-blue-200'
                  : 'bg-teal-50 text-teal-800 border border-teal-200'
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
            className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
              isSaved
                ? 'bg-rose-50 text-rose-600 border-rose-200'
                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-600' : ''}`} />
          </button>
        </div>

        {/* Scheme Title & Native Name */}
        <h3
          className={`font-extrabold text-slate-900 leading-snug cursor-pointer hover:text-emerald-700 transition-colors ${
            easyMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          }`}
          onClick={() => setSelectedSchemeDetail(scheme)}
        >
          {scheme.name}
        </h3>
        {scheme.nativeName && (
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {scheme.nativeName}
          </p>
        )}

        {/* Department Info */}
        <p className="text-[11px] text-slate-400 font-medium mt-1 flex items-center gap-1">
          <Building className="w-3 h-3 shrink-0" />
          <span className="truncate">{scheme.department || scheme.authority || 'Government Authority'}</span>
        </p>

        {/* Benefit Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block mb-0.5">
            Potential Benefit
          </span>
          <p className={`font-bold text-emerald-950 ${easyMode ? 'text-base' : 'text-sm'}`}>
            {scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Welfare Entitlement'}
          </p>
          {scheme.benefits?.shortSummary && (
            <p className="text-[11px] text-emerald-800/90 mt-0.5 leading-relaxed line-clamp-2">
              {scheme.benefits.shortSummary}
            </p>
          )}
        </div>

        {/* Criteria Matching Summary Chips */}
        <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
          <span className="inline-flex items-center gap-1 text-slate-600">
            {criteriaBreakdown.age ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            Age
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-slate-600">
            {criteriaBreakdown.income ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            Income
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-slate-600">
            {criteriaBreakdown.occupation ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            Occupation
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 text-slate-600">
            {criteriaBreakdown.location ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            )}
            State
          </span>
        </div>
      </div>

      {/* Action Buttons Bar */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          {/* Why Me Button */}
          <button
            id={`why-me-btn-${scheme.id}`}
            onClick={() => setSelectedWhyMeScheme(matchResult)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-slate-200"
            title="Explain why this scheme matches your profile"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-700" />
            <span>WHY ME?</span>
          </button>

          {/* Spoken Voice Button (Regional Voice) */}
          <button
            id={`hear-scheme-voice-btn-${scheme.id}`}
            onClick={handlePlayVoice}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 border transition-all cursor-pointer ${
              isPlayingVoice
                ? 'bg-emerald-600 text-white border-emerald-700 animate-pulse'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border-emerald-200'
            }`}
            title="Hear explanation in regional language voice"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>{isPlayingVoice ? 'SPEAKING...' : 'HEAR'}</span>
          </button>
        </div>

        {/* View Details Primary Action */}
        <button
          id={`view-details-btn-${scheme.id}`}
          onClick={() => setSelectedSchemeDetail(scheme)}
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1 cursor-pointer"
        >
          <span>DETAILS</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
