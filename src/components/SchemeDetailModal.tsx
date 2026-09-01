import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
import {
  X,
  Volume2,
  Bookmark,
  Share2,
  FileCheck2,
  ExternalLink,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Printer,
  Copy,
  Check,
  Building,
  HelpCircle,
  PhoneCall,
  MessageSquare,
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
    const summaryText = `*${scheme.name}*\nDepartment: ${scheme.department}\nBenefit: ${scheme.benefits.amount || scheme.benefits.shortSummary}\nWhere to Apply: ${scheme.offlineApplicationCenter || 'e-Seva Center'}\nOfficial Portal: ${scheme.applicationUrl || scheme.officialSource}\nShared via Arivom Thittam (அறிவோம் திட்டம்)`;
    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const regionalContent = scheme.languageContent?.[selectedVoiceLanguageId];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider ${
                  scheme.schemeType === 'central'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                }`}
              >
                {scheme.schemeType === 'central' ? 'Central Scheme' : `${scheme.stateId} State Scheme`}
              </span>
              <span className="text-xs text-slate-400 font-mono">ID: {scheme.id}</span>
              <span className="text-[11px] text-emerald-400 font-medium">✓ Verified 2026 Gazette</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {scheme.name}
            </h2>
            {scheme.nativeName && (
              <p className="text-xs sm:text-sm text-emerald-300 font-medium">
                {scheme.nativeName}
              </p>
            )}
            <p className="text-xs text-slate-400">
              Department: <span className="text-slate-200 font-semibold">{scheme.department}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="detail-save-btn"
              onClick={() => toggleSaveScheme(scheme.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-rose-500 text-white border-rose-500'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
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
              className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1.5 border-b border-slate-200 overflow-x-auto text-xs font-bold">
          <button
            id="detail-subtab-overview"
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            OVERVIEW & ELIGIBILITY
          </button>
          <button
            id="detail-subtab-docs"
            onClick={() => setActiveSubTab('DOCUMENTS')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'DOCUMENTS'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>DOCUMENTS CHECKLIST</span>
            <span className="bg-slate-300 text-slate-800 text-[10px] px-1.5 py-0.2 rounded-full">
              {scheme.documents.length}
            </span>
          </button>
          <button
            id="detail-subtab-apply"
            onClick={() => setActiveSubTab('APPLY')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'APPLY'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            HOW TO APPLY
          </button>
          <button
            id="detail-subtab-simplified"
            onClick={() => setActiveSubTab('SIMPLIFIED')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'SIMPLIFIED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>EXPLAIN SIMPLY</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* ========================================================================= */}
          {/* TAB 1: OVERVIEW & ELIGIBILITY */}
          {/* ========================================================================= */}
          {activeSubTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fade-in">
              {/* Voice Readout Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-emerald-700 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">
                      Hear Scheme Explanation in {currentLanguageConfig.name}
                    </p>
                    <p className="text-[11px] text-emerald-700">
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
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer ${
                    isPlayingAudio
                      ? 'bg-emerald-700 text-white animate-pulse'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {isPlayingAudio ? 'STOP' : 'HEAR AUDIO'}
                </button>
              </div>

              {/* What is it? */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  What is this Scheme?
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  {scheme.benefits.detailedBenefit}
                </p>
              </div>

              {/* Benefits Highlight */}
              <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-200 rounded-2xl p-4 sm:p-5">
                <span className="text-[11px] font-extrabold text-emerald-800 uppercase tracking-wider block mb-1">
                  Sanctioned Benefits
                </span>
                <p className="text-lg font-black text-emerald-950">
                  {scheme.benefits.amount || scheme.benefits.shortSummary}
                </p>
                <div className="mt-3 space-y-1 text-xs text-slate-700">
                  <p>• <strong>Benefit Type:</strong> {scheme.benefits.type.replace('_', ' ').toUpperCase()}</p>
                  <p>• <strong>Frequency:</strong> {scheme.benefits.frequency || 'Annual / Per event'}</p>
                  <p>• <strong>Summary:</strong> {scheme.benefits.shortSummary}</p>
                </div>
              </div>

              {/* Who Qualifies? (Eligibility Rules) */}
              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-2">
                  Who Qualifies?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Age Limit</span>
                    <strong className="text-slate-800">
                      {scheme.eligibility.minAge ? `${scheme.eligibility.minAge} years` : 'No minimum'} - {scheme.eligibility.maxAge ? `${scheme.eligibility.maxAge} years` : 'No maximum'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Income Ceiling</span>
                    <strong className="text-slate-800">
                      {scheme.eligibility.maxAnnualIncome ? `₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')} / year` : 'No restrictive income limit'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Target Occupations</span>
                    <strong className="text-slate-800">
                      {scheme.eligibility.allowedOccupations ? scheme.eligibility.allowedOccupations.join(', ') : 'All Occupations'}
                    </strong>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Applicable Location</span>
                    <strong className="text-slate-800">
                      {scheme.stateId === 'ALL' ? 'All States across India' : `${scheme.stateId} State`}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Why Me Shortcut if matched */}
              {matchResult && (
                <div className="bg-slate-100 p-4 rounded-2xl flex items-center justify-between">
                  <div className="text-xs">
                    <p className="font-bold text-slate-900">Calculated Profile Match: {matchResult.score}%</p>
                    <p className="text-slate-500">Based on your age, occupation and state.</p>
                  </div>
                  <button
                    id="detail-whyme-btn"
                    onClick={() => setSelectedWhyMeScheme(matchResult)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                  >
                    VIEW WHY ME
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: DOCUMENTS CHECKLIST */}
          {/* ========================================================================= */}
          {activeSubTab === 'DOCUMENTS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  Required Citizen Documents
                </h3>
                <p className="text-xs text-slate-600">
                  Check off the documents you already possess to verify your readiness before visiting the center.
                </p>
              </div>

              <div className="space-y-2.5">
                {scheme.documents.map((doc, idx) => {
                  const hasDoc = !!userDocuments[doc.name];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleUserDocument(doc.name)}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                        hasDoc
                          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                            hasDoc
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 bg-slate-50'
                          }`}
                        >
                          {hasDoc && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm block">{doc.name}</span>
                          <span className="text-[11px] text-slate-500">{doc.description}</span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          hasDoc ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {hasDoc ? 'I HAVE THIS' : 'PENDING'}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
                💡 Tip: Carry 2 passport-size photographs along with original and photocopies of checked documents.
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: HOW TO APPLY */}
          {/* ========================================================================= */}
          {activeSubTab === 'APPLY' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider block">
                  Where to Apply
                </span>
                <p className="text-sm font-bold text-emerald-950 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  {scheme.offlineApplicationCenter || 'Nearest e-Seva / CSC Centre / Gram Panchayat'}
                </p>
                <p className="text-xs text-emerald-800 mt-1">
                  Official Portal: <strong className="font-mono">{scheme.applicationUrl || scheme.officialSource}</strong>
                </p>
              </div>

              <div>
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider mb-3">
                  Step-by-Step Roadmap:
                </h3>
                <div className="space-y-3">
                  {scheme.applicationSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3 text-xs text-slate-800"
                    >
                      <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <div className="leading-relaxed">
                        <strong className="text-slate-900 block mb-0.5">Step {idx + 1}</strong>
                        {step}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Official Source Link */}
              <div className="pt-2">
                <a
                  id="detail-official-portal-link"
                  href={scheme.applicationUrl || scheme.officialSource}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>VISIT OFFICIAL GOVERNMENT PORTAL</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
                <p className="text-[10px] text-slate-400 text-center mt-1.5">
                  Official Source: {scheme.officialSource}
                </p>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: EXPLAIN SIMPLY (CONVERTED CITIZEN-FRIENDLY TEXT) */}
          {/* ========================================================================= */}
          {activeSubTab === 'SIMPLIFIED' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-700" />
                  <div>
                    <span className="text-xs font-bold text-amber-900 uppercase">
                      Citizen-Friendly Simplified Translation
                    </span>
                    <p className="text-[11px] text-amber-800">
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
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer"
                >
                  HEAR IN {currentLanguageConfig.name.toUpperCase()}
                </button>
              </div>

              {/* English Plain Explanation */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Plain English Explanation:
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {scheme.summarySimple}
                </p>
              </div>

              {/* Regional Plain Explanation */}
              {regionalContent?.summary && (
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    {currentLanguageConfig.name} ({currentLanguageConfig.nativeName}) எளிய விளக்கம்:
                  </h4>
                  <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed font-sans">
                    {regionalContent.summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              id="detail-share-btn"
              onClick={() => setShowShareModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-emerald-700" />
              <span>SHARE SCHEME</span>
            </button>

            <button
              id="detail-copy-summary-btn"
              onClick={handleCopySummary}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 border border-slate-200 cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'COPIED' : 'COPY SUMMARY'}</span>
            </button>
          </div>

          <button
            id="detail-done-btn"
            onClick={() => {
              speechService.stop();
              setSelectedSchemeDetail(null);
            }}
            className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer"
          >
            CLOSE
          </button>
        </div>
      </div>

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Share {scheme.name}
              </h3>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Send this verified scheme breakdown to family members, farmers, or neighbours via WhatsApp or SMS.
            </p>

            <div className="space-y-2">
              <button
                id="share-whatsapp-btn"
                onClick={() => {
                  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `*${scheme.name}*\nBenefit: ${scheme.benefits.amount || scheme.benefits.shortSummary}\nWhere to Apply: ${scheme.offlineApplicationCenter || 'e-Seva Center'}\nPortal: ${scheme.applicationUrl || scheme.officialSource}\nShared via Arivom Thittam (அறிவோம் திட்டம்)`
                  )}`;
                  window.open(url, '_blank');
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" />
                <span>SHARE VIA WHATSAPP</span>
              </button>

              <button
                id="share-sms-format-btn"
                onClick={handleCopySummary}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
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
