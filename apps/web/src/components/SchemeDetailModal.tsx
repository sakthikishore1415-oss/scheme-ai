import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
import {
  X,
  Volume2,
  Bookmark,
  Share2,
  ExternalLink,
  MapPin,
  Check,
  Building,
  MessageSquare,
  PhoneCall,
  Copy,
  Sparkles,
} from 'lucide-react';

export const SchemeDetailModal: React.FC = () => {
  const {
    selectedSchemeDetail,
    setSelectedSchemeDetail,
    savedSchemeIds,
    toggleSaveScheme,
    selectedVoiceLanguageId,
    currentLanguageConfig,
    activeMatches,
    setSelectedWhyMeScheme,
    userDocuments,
    toggleUserDocument,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'APPLY' | 'SIMPLIFIED'>('OVERVIEW');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);

  if (!selectedSchemeDetail) return null;

  const scheme = selectedSchemeDetail;
  const isSaved = savedSchemeIds.includes(scheme.id);
  const matchResult = activeMatches.find((m) => m.scheme.id === scheme.id);

  const handlePlayVoice = (text: string) => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
      return;
    }

    setIsPlayingAudio(true);
    speechService.speak(
      text,
      selectedVoiceLanguageId,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleCopySummary = () => {
    const summaryText = `*${scheme.name}*\nDepartment: ${scheme.department || scheme.authority || 'Government Authority'}\nBenefit: ${scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Entitlement'}\nWhere to Apply: ${scheme.offlineApplicationCenter || 'e-Seva Center'}\nOfficial Portal: ${scheme.applicationUrl || scheme.officialSource}\nShared via Arivom Thittam (அறிவோம் திட்டம்)`;
    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const regionalContent = scheme.languageContent?.[selectedVoiceLanguageId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#c5c6d0]/60 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#092554] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1.5 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  scheme.schemeType === 'central'
                    ? 'bg-[#d9e2ff] text-[#001944] border border-[#b0c6ff]'
                    : 'bg-[#94f6c4]/30 text-[#94f6c4] border border-[#57b98c]/40'
                }`}
              >
                {scheme.schemeType === 'central' ? 'Central Scheme' : `${scheme.stateId || scheme.state || 'State'} Scheme`}
              </span>
              <span className="text-xs text-[#90a6dd] font-mono">ID: {scheme.id}</span>
              <span className="text-[11px] text-[#94f6c4] font-medium">✓ Official Gazette Rule</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {scheme.name}
            </h2>
            {scheme.nativeName && (
              <p className="text-xs sm:text-sm text-[#d9e2ff] font-medium">
                {scheme.nativeName}
              </p>
            )}
            <p className="text-xs text-[#90a6dd]">
              Authority: <span className="text-white font-semibold">{scheme.department || scheme.authority || 'Government Authority'}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="detail-save-btn"
              onClick={() => toggleSaveScheme(scheme.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                  : 'bg-[#243b6b] text-[#d9e2ff] border-[#90a6dd]/30 hover:bg-[#243b6b]/80'
              }`}
              title={isSaved ? 'Remove from Saved' : 'Save Scheme'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            </button>
            <button
              onClick={() => {
                speechService.stop();
                setSelectedSchemeDetail(null);
              }}
              className="p-2 rounded-xl bg-[#243b6b] text-[#d9e2ff] border border-[#90a6dd]/30 hover:bg-[#243b6b]/80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#f2f4f6] p-1.5 border-b border-[#c5c6d0]/60 overflow-x-auto text-xs font-bold">
          <button
            id="detail-subtab-overview"
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'bg-[#092554] text-white shadow-xs'
                : 'text-[#44464f] hover:bg-[#edeef0]'
            }`}
          >
            OVERVIEW & ELIGIBILITY
          </button>
          <button
            id="detail-subtab-docs"
            onClick={() => setActiveSubTab('DOCUMENTS')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'DOCUMENTS'
                ? 'bg-[#092554] text-white shadow-xs'
                : 'text-[#44464f] hover:bg-[#edeef0]'
            }`}
          >
            <span>DOCUMENTS CHECKLIST</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSubTab === 'DOCUMENTS' ? 'bg-[#243b6b] text-[#94f6c4]' : 'bg-[#e1e2e4] text-[#191c1e]'
            }`}>
              {scheme.documents?.length || 0}
            </span>
          </button>
          <button
            id="detail-subtab-apply"
            onClick={() => setActiveSubTab('APPLY')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'APPLY'
                ? 'bg-[#092554] text-white shadow-xs'
                : 'text-[#44464f] hover:bg-[#edeef0]'
            }`}
          >
            HOW TO APPLY
          </button>
          <button
            id="detail-subtab-simplified"
            onClick={() => setActiveSubTab('SIMPLIFIED')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'SIMPLIFIED'
                ? 'bg-[#fea619] text-[#684000] shadow-xs'
                : 'text-[#855300] bg-[#ffddb8]/60 hover:bg-[#ffddb8]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPLAIN SIMPLY</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: OVERVIEW & ELIGIBILITY */}
          {activeSubTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fade-in">
              {/* Voice Readout Banner */}
              <div className="bg-[#d9e2ff]/50 border border-[#b0c6ff] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-[#092554] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#092554]">
                      Hear Scheme Explanation in {currentLanguageConfig.name}
                    </p>
                    <p className="text-[11px] text-[#243b6b]">
                      {regionalContent?.summary || scheme.summarySimple}
                    </p>
                  </div>
                </div>
                <button
                  id="detail-overview-voice-btn"
                  onClick={() =>
                    handlePlayVoice(
                      regionalContent?.voiceExplanation || scheme.summarySimple
                    )
                  }
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-[#092554] text-white animate-pulse'
                      : 'bg-[#092554] text-white hover:bg-[#243b6b]'
                  }`}
                >
                  {isPlayingAudio ? 'STOP' : 'HEAR AUDIO'}
                </button>
              </div>

              {/* What is it? */}
              <div>
                <h3 className="text-xs font-bold text-[#092554] uppercase tracking-wider mb-2">
                  What is this Scheme?
                </h3>
                <p className="text-xs sm:text-sm text-[#191c1e] leading-relaxed bg-[#f8f9fb] p-4 rounded-2xl border border-[#c5c6d0]/60">
                  {scheme.benefits?.detailedBenefit || scheme.summarySimple || scheme.name}
                </p>
              </div>

              {/* Benefits Highlight */}
              <div className="bg-[#94f6c4]/20 border border-[#57b98c]/40 rounded-2xl p-4 sm:p-5">
                <span className="text-[11px] font-bold text-[#00462d] uppercase tracking-wider block mb-1">
                  Sanctioned Benefits
                </span>
                <p className="text-lg font-bold text-[#002d1c]">
                  {scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Welfare Benefit'}
                </p>
                <div className="mt-3 space-y-1 text-xs text-[#44464f]">
                  <p>• <strong>Benefit Type:</strong> {scheme.benefits?.type ? scheme.benefits.type.replace('_', ' ').toUpperCase() : 'WELFARE'}</p>
                  <p>• <strong>Frequency:</strong> {scheme.benefits?.frequency || 'Direct Benefit Transfer / Periodic'}</p>
                  {scheme.benefits?.shortSummary && <p>• <strong>Summary:</strong> {scheme.benefits.shortSummary}</p>}
                </div>
              </div>

              {/* Who Qualifies? (Eligibility Rules) */}
              <div>
                <h3 className="text-xs font-bold text-[#092554] uppercase tracking-wider mb-2">
                  Who Qualifies?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#c5c6d0]/60">
                    <span className="text-[10px] font-bold text-[#757780] uppercase block">Age Limit</span>
                    <strong className="text-[#191c1e]">
                      {scheme.eligibility?.minAge ? `${scheme.eligibility.minAge} years` : 'No minimum'} - {scheme.eligibility?.maxAge ? `${scheme.eligibility.maxAge} years` : 'No maximum'}
                    </strong>
                  </div>
                  <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#c5c6d0]/60">
                    <span className="text-[10px] font-bold text-[#757780] uppercase block">Income Ceiling</span>
                    <strong className="text-[#191c1e]">
                      {scheme.eligibility?.maxAnnualIncome ? `₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')} / year` : 'No restrictive income limit'}
                    </strong>
                  </div>
                  <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#c5c6d0]/60">
                    <span className="text-[10px] font-bold text-[#757780] uppercase block">Target Occupations</span>
                    <strong className="text-[#191c1e]">
                      {scheme.eligibility?.allowedOccupations ? scheme.eligibility.allowedOccupations.join(', ') : 'All Occupations'}
                    </strong>
                  </div>
                  <div className="bg-[#f8f9fb] p-3 rounded-xl border border-[#c5c6d0]/60">
                    <span className="text-[10px] font-bold text-[#757780] uppercase block">Applicable Location</span>
                    <strong className="text-[#191c1e]">
                      {scheme.stateId === 'ALL' || scheme.state === 'ALL' ? 'All States across India' : `${scheme.stateId || scheme.state} State`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Why Me Shortcut if matched */}
              {matchResult && (
                <div className="bg-[#d9e2ff]/40 border border-[#b0c6ff] p-4 rounded-2xl flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-[#092554]">Calculated Profile Match: {matchResult.score}%</p>
                    <p className="text-[#44464f]">Based on your age, occupation and state.</p>
                  </div>
                  <button
                    id="detail-whyme-btn"
                    onClick={() => setSelectedWhyMeScheme(matchResult)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#092554] text-white font-bold text-xs hover:bg-[#243b6b] cursor-pointer"
                  >
                    VIEW WHY ME
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DOCUMENTS CHECKLIST */}
          {activeSubTab === 'DOCUMENTS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[#f8f9fb] p-4 rounded-2xl border border-[#c5c6d0]/60">
                <h3 className="text-xs font-bold text-[#092554] uppercase tracking-wider mb-1">
                  Required Citizen Documents
                </h3>
                <p className="text-xs text-[#44464f]">
                  Check off the documents you already possess to verify your readiness before visiting the center.
                </p>
              </div>

              <div className="space-y-2.5">
                {(scheme.documents || []).map((doc, idx) => {
                  const hasDoc = !!userDocuments[doc.name];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleUserDocument(doc.name)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                        hasDoc
                          ? 'bg-[#94f6c4]/20 border-[#57b98c] text-[#002d1c] font-semibold'
                          : 'bg-white border-[#c5c6d0]/60 text-[#191c1e] hover:border-[#757780]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                            hasDoc
                              ? 'bg-[#00462d] border-[#00462d] text-white'
                              : 'border-[#c5c6d0] bg-[#f8f9fb]'
                          }`}
                        >
                          {hasDoc && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm block font-bold">{doc.name}</span>
                          <span className="text-[11px] text-[#44464f]">{doc.description}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          hasDoc ? 'bg-[#94f6c4] text-[#002113]' : 'bg-[#edeef0] text-[#757780]'
                        }`}
                      >
                        {hasDoc ? 'I HAVE THIS' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-[#ffddb8]/50 border border-[#fea619]/60 rounded-xl p-3 text-xs text-[#855300]">
                💡 Tip: Carry 2 passport-size photographs along with original and photocopies of checked documents.
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO APPLY */}
          {activeSubTab === 'APPLY' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-[#d9e2ff]/40 border border-[#b0c6ff] rounded-2xl p-4">
                <span className="text-[10px] font-bold text-[#092554] uppercase tracking-wider block">
                  Where to Apply
                </span>
                <p className="text-sm font-bold text-[#092554] mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#092554]" />
                  {scheme.offlineApplicationCenter || 'Nearest e-Seva / CSC Centre / Gram Panchayat'}
                </p>
                {scheme.officialSource && (
                  <p className="text-xs text-[#44464f] mt-1">
                    Official Portal: <strong className="font-mono text-[#092554]">{scheme.applicationUrl || scheme.officialSource}</strong>
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-[#092554] uppercase tracking-wider mb-3">
                  Step-by-Step Roadmap:
                </h3>
                <div className="space-y-3">
                  {(scheme.applicationSteps || []).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-[#f8f9fb] border border-[#c5c6d0]/60 flex items-start gap-3 text-xs text-[#191c1e]"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#092554] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="leading-relaxed">
                        <strong className="text-[#092554] block mb-0.5">Step {idx + 1}</strong>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Source Link */}
              {scheme.officialSource && (
                <div className="pt-2">
                  <a
                    id="detail-official-portal-link"
                    href={scheme.applicationUrl || scheme.officialSource}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>VISIT OFFICIAL GOVERNMENT PORTAL</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-[10px] text-[#757780] text-center mt-1.5">
                    Official Source: {scheme.officialSource}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXPLAIN SIMPLY */}
          {activeSubTab === 'SIMPLIFIED' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-[#ffddb8]/40 border border-[#fea619]/60 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#855300]" />
                  <div>
                    <span className="text-xs font-bold text-[#855300] uppercase">
                      Citizen-Friendly Simplified Translation
                    </span>
                    <p className="text-[11px] text-[#44464f]">
                      Free of government jargon, gazette acronyms, or complex bureau phrases.
                    </p>
                  </div>
                </div>
                <button
                  id="detail-simplified-voice-btn"
                  onClick={() =>
                    handlePlayVoice(
                      regionalContent?.voiceExplanation || scheme.summarySimple
                    )
                  }
                  className="px-3.5 py-1.5 rounded-xl bg-[#fea619] hover:bg-[#855300] text-[#684000] hover:text-white font-bold text-xs cursor-pointer transition-colors"
                >
                  HEAR IN {currentLanguageConfig.name.toUpperCase()}
                </button>
              </div>

              {/* English Plain Explanation */}
              <div className="p-4 rounded-2xl bg-[#f8f9fb] border border-[#c5c6d0]/60 space-y-2">
                <h4 className="text-xs font-bold text-[#092554] uppercase tracking-wider">
                  Plain English Explanation:
                </h4>
                <p className="text-xs sm:text-sm text-[#191c1e] leading-relaxed">
                  {scheme.summarySimple}
                </p>
              </div>

              {/* Regional Plain Explanation */}
              {regionalContent?.summary && (
                <div className="p-4 rounded-2xl bg-[#94f6c4]/20 border border-[#57b98c]/40 space-y-2">
                  <h4 className="text-xs font-bold text-[#00462d] uppercase tracking-wider">
                    {currentLanguageConfig.name} ({currentLanguageConfig.nativeName}) எளிய விளக்கம்:
                  </h4>
                  <p className="text-xs sm:text-sm text-[#002d1c] leading-relaxed font-sans">
                    {regionalContent.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-[#f8f9fb] border-t border-[#c5c6d0]/60 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              id="detail-share-btn"
              onClick={() => setShowShareModal(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#edeef0] text-[#191c1e] font-bold text-xs flex items-center gap-1.5 border border-[#c5c6d0]/60 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-[#092554]" />
              <span>SHARE SCHEME</span>
            </button>

            <button
              id="detail-copy-summary-btn"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl bg-white hover:bg-[#edeef0] text-[#44464f] font-bold text-xs flex items-center gap-1.5 border border-[#c5c6d0]/60 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#00462d]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'COPIED' : 'COPY SUMMARY'}</span>
            </button>
          </div>

          <button
            id="detail-done-btn"
            onClick={() => {
              speechService.stop();
              setSelectedSchemeDetail(null);
            }}
            className="px-6 py-2 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs cursor-pointer transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-[#c5c6d0]/60 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#092554] text-sm">
                Share {scheme.name}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-[#757780] hover:text-[#191c1e] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#44464f]">
              Send this verified scheme breakdown to family members, farmers, or neighbours via WhatsApp or SMS.
            </p>

            <div className="space-y-2">
              <button
                id="share-whatsapp-btn"
                onClick={() => {
                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `*${scheme.name}*\nBenefit: ${scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Welfare Benefit'}\nWhere to Apply: ${scheme.offlineApplicationCenter || 'e-Seva Center'}\nPortal: ${scheme.applicationUrl || scheme.officialSource}\nShared via Arivom Thittam (அறிவோம் திட்டம்)`
                  )}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-[#00462d] hover:bg-[#002d1c] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>SHARE VIA WHATSAPP</span>
              </button>

              <button
                id="share-sms-format-btn"
                onClick={handleCopySummary}
                className="w-full py-2.5 px-3 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <PhoneCall className="w-4 h-4" />
                <span>COPY SMS TEXT (FEATURE PHONES)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
