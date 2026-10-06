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
    openVoiceAssistantForScheme,
    toggleSaveScheme,
    isSchemeSaved,
    easyMode,
    userProfile,
    t,
    uiStrings,
  } = useApp();

  const { scheme, score, matchLevel, criteriaBreakdown } = matchResult;
  const isSaved = isSchemeSaved(scheme.id);

  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    openVoiceAssistantForScheme(scheme);
  };

  const getScoreBadgeStyles = (level: string) => {
    switch (level) {
      case 'STRONG':
        return 'bg-[#71806b]/12 text-[#241c20] border-[#71806b]';
      case 'POTENTIAL':
        return 'bg-[#c8a96b]/12 text-[#6b3548] border-[#c8a96b]';
      default:
        return 'bg-[#faf8f3] text-[#756a6f] border-[#e8e1dc]';
    }
  };

  return (
    <div
      id={`scheme-card-${scheme.id}`}
      className={`bg-white rounded-2xl border border-[#e8e1dc] transition-all duration-200 hover:shadow-civic-overlay flex flex-col justify-between overflow-hidden ${
        matchLevel === 'STRONG'
          ? 'ring-1 ring-[#71806b]/25'
          : ''
      } ${easyMode ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}`}
    >
      {/* Header Badges */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            {userProfile ? (
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 ${getScoreBadgeStyles(
                  matchLevel
                )}`}
              >
                <Sparkles className="w-3 h-3" />
                {score}% {matchLevel === 'STRONG' ? uiStrings.strongMatchesBadge : uiStrings.potentialMatchesBadge}
              </span>
            ) : (
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg border flex items-center gap-1 bg-[#faf8f3] text-[#4a1f2d] border-[#e8e1dc]">
                <Sparkles className="w-3 h-3 text-[#c8a96b]" />
                {t('scheme.verifiedBadge')}
              </span>
            )}

            <span
              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-lg uppercase tracking-wider ${
                scheme.schemeType === 'central'
                  ? 'bg-[#c8a96b]/12 text-[#6b3548] border border-[#c8a96b]'
                  : 'bg-[#faf8f3] text-[#4a1f2d] border border-[#e8e1dc]'
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
                ? 'bg-[#ffdad6] text-[#ba1a1a] border-[#ba1a1a]/30'
                : 'bg-[#faf8f3] text-[#756a6f] border-[#e8e1dc] hover:text-[#241c20]'
            }`}
            title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-[#ba1a1a]' : ''}`} />
          </button>
        </div>

        {/* Scheme Title & Native Name */}
        <h3
          className={`font-bold text-[#241c20] leading-snug cursor-pointer hover:text-[#4a1f2d] transition-colors ${
            easyMode ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'
          }`}
          onClick={() => setSelectedSchemeDetail(scheme)}
        >
          {scheme.name}
        </h3>
        {scheme.nativeName && (
          <p className="text-xs text-[#756a6f] font-medium mt-0.5">
            {scheme.nativeName}
          </p>
        )}

        {/* Department Info */}
        <p className="text-[11px] text-[#756a6f] font-medium mt-1 flex items-center gap-1">
          <Building className="w-3 h-3 shrink-0 text-[#4a1f2d]" />
          <span className="truncate">{scheme.department || scheme.authority || 'Government Authority'}</span>
        </p>

        {/* Benefit Box */}
        <div className="mt-3.5 p-3 rounded-xl bg-[#faf8f3] border border-[#e8e1dc]">
          <span className="text-[10px] font-bold text-[#6b3548] uppercase tracking-wider block mb-0.5">
            {t('scheme.benefits')}
          </span>
          <p className={`font-bold text-[#241c20] ${easyMode ? 'text-base' : 'text-sm'}`}>
            {scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Welfare Entitlement'}
          </p>
          {scheme.benefits?.shortSummary && (
            <p className="text-[11px] text-[#514346] mt-0.5 leading-relaxed line-clamp-2">
              {scheme.benefits.shortSummary}
            </p>
          )}
        </div>

        {/* Criteria Matching Summary Chips */}
        {userProfile ? (
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
            <span className="inline-flex items-center gap-1 text-[#514346] font-medium">
              {criteriaBreakdown?.age ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#71806b] shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#c8a96b] shrink-0" />
              )}
              {t('profile.age')}
            </span>
            <span className="text-[#e8e1dc]">•</span>
            <span className="inline-flex items-center gap-1 text-[#514346] font-medium">
              {criteriaBreakdown?.income ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#71806b] shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#c8a96b] shrink-0" />
              )}
              {t('profile.annualIncome')?.split(' ')[0] || 'Income'}
            </span>
            <span className="text-[#e8e1dc]">•</span>
            <span className="inline-flex items-center gap-1 text-[#514346] font-medium">
              {criteriaBreakdown?.occupation ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#71806b] shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#c8a96b] shrink-0" />
              )}
              {t('profile.occupation')?.split(' ')[0] || 'Occupation'}
            </span>
            <span className="text-[#e8e1dc]">•</span>
            <span className="inline-flex items-center gap-1 text-[#514346] font-medium">
              {criteriaBreakdown?.location ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#71806b] shrink-0" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5 text-[#c8a96b] shrink-0" />
              )}
              {t('profile.state')}
            </span>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-2 flex-wrap text-[11px]">
            <span className="text-[#756a6f] font-medium">
              {scheme.category ? `${scheme.category.toUpperCase()}` : 'General'}
            </span>
            <span className="text-[#e8e1dc]">•</span>
            <span className="text-[#756a6f]">
              {scheme.documents?.length || 0} {t('scheme.documents')}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons Bar */}
      <div className="mt-4 pt-3 border-t border-[#e8e1dc] flex items-center justify-between gap-1.5 flex-wrap">
        <div className="flex items-center gap-1.5">
          {userProfile ? (
            <button
              id={`why-me-btn-${scheme.id}`}
              onClick={() => setSelectedWhyMeScheme(matchResult)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf8f3] text-[#4a1f2d] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-[#e8e1dc]"
              title={uiStrings.whyThisMatchesBtn}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#4a1f2d]" />
              <span>{uiStrings.whyThisMatchesBtn || t('matches.whyMatches')}</span>
            </button>
          ) : (
            <button
              id={`criteria-btn-${scheme.id}`}
              onClick={() => setSelectedSchemeDetail(scheme)}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#faf8f3] text-[#4a1f2d] font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-[#e8e1dc]"
              title={uiStrings.checkEligibilityBtn}
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#4a1f2d]" />
              <span>{uiStrings.checkEligibilityBtn || t('home.checkEligibility')}</span>
            </button>
          )}

          {/* Voice Assistant Explanation Button */}
          <button
            id={`hear-scheme-voice-btn-${scheme.id}`}
            onClick={handlePlayVoice}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#eedfe4] text-[#4a1f2d] font-bold text-xs flex items-center gap-1 border border-[#e8e1dc] transition-all cursor-pointer shadow-2xs"
            title={t('home.startVoiceBtn')}
          >
            <Volume2 className="w-3.5 h-3.5 text-[#4a1f2d]" />
            <span>{t('home.startVoiceBtn')?.split(' ')[0] || 'VOICE'}</span>
          </button>
        </div>

        {/* View Details Primary Action */}
        <button
          id={`view-details-btn-${scheme.id}`}
          onClick={() => setSelectedSchemeDetail(scheme)}
          className="px-4 py-2 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>{uiStrings.viewDetailsBtn || t('matches.viewDetails')}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
