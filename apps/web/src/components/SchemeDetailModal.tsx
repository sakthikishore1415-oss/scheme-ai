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
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

export const SchemeDetailModal: React.FC = () => {
  const {
    selectedSchemeDetail,
    setSelectedSchemeDetail,
    openVoiceAssistantForScheme,
    savedSchemeIds,
    toggleSaveScheme,
    selectedVoiceLanguageId,
    currentLanguageConfig,
    activeMatches,
    setSelectedWhyMeScheme,
    userProfile,
    updateUserProfile,
    triggerMatchCelebration,
    userDocuments,
    toggleUserDocument,
    t,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'DOCUMENTS' | 'APPLY' | 'SIMPLIFIED'>('OVERVIEW');
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [answeredFields, setAnsweredFields] = useState<Record<string, boolean>>({});

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
    const summaryText = `*${scheme.name}*\nDepartment: ${scheme.department || scheme.authority || 'Government Authority'}\nBenefit: ${scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Entitlement'}\nWhere to Apply: ${scheme.offlineApplicationCenter || 'e-Seva Center'}\nOfficial Portal: ${scheme.applicationUrl || scheme.officialSource}\nShared via ${t('header.title')}`;
    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const regionalContent = scheme.languageContent?.[selectedVoiceLanguageId];

  // =========================================================================
  // Determine missing eligibility requirements to ask dynamically
  // =========================================================================
  const questionsToAsk: {
    key: string;
    question: string;
    options: { label: string; action: () => void }[];
  }[] = [];

  // 1. Gender Requirement
  if (
    scheme.eligibility.targetGenders &&
    scheme.eligibility.targetGenders.includes('female') &&
    (!userProfile || userProfile.gender === 'unspecified')
  ) {
    questionsToAsk.push({
      key: 'gender',
      question: 'Is this application for a female head of family or woman applicant?',
      options: [
        {
          label: 'Yes, Female Applicant',
          action: () => {
            updateUserProfile({ gender: 'female' });
            setAnsweredFields((prev) => ({ ...prev, gender: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: 'No, Male / Other',
          action: () => {
            updateUserProfile({ gender: 'male' });
            setAnsweredFields((prev) => ({ ...prev, gender: true }));
          },
        },
      ],
    });
  }

  // 2. Student Requirement
  if (
    scheme.eligibility.requiresStudent &&
    (!userProfile || !userProfile.isStudent)
  ) {
    questionsToAsk.push({
      key: 'student',
      question: 'Are you currently enrolled as a student in school, college, or polytechnic?',
      options: [
        {
          label: 'Yes, I am a Student',
          action: () => {
            updateUserProfile({ isStudent: true, occupation: 'student' });
            setAnsweredFields((prev) => ({ ...prev, student: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: 'No, Not a Student',
          action: () => {
            updateUserProfile({ isStudent: false });
            setAnsweredFields((prev) => ({ ...prev, student: true }));
          },
        },
      ],
    });
  }

  // 3. Landholding Requirement (e.g. PM-KISAN, Subhiksha Keralam)
  if (
    (scheme.eligibility.requiresLandHoldingMaxAcres || (scheme.eligibility as any).requiresLandOwnership) &&
    (!userProfile || (userProfile.landHoldingAcres || 0) === 0)
  ) {
    questionsToAsk.push({
      key: 'land',
      question: 'Do you or your family own cultivable agricultural land?',
      options: [
        {
          label: 'Yes, up to 5 Acres (Small/Marginal Farmer)',
          action: () => {
            updateUserProfile({ landHoldingAcres: 2.5, occupation: 'farmer' });
            setAnsweredFields((prev) => ({ ...prev, land: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: 'No Agricultural Land',
          action: () => {
            updateUserProfile({ landHoldingAcres: 0 });
            setAnsweredFields((prev) => ({ ...prev, land: true }));
          },
        },
      ],
    });
  }

  // 4. Disability Requirement
  if (
    scheme.eligibility.requiresDisability &&
    (!userProfile || !userProfile.hasDisability)
  ) {
    questionsToAsk.push({
      key: 'disability',
      question: 'Do you or a family member have a certified disability or require caregiver assistance?',
      options: [
        {
          label: 'Yes, 40%+ Certified Disability',
          action: () => {
            updateUserProfile({ hasDisability: true });
            setAnsweredFields((prev) => ({ ...prev, disability: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: 'No Disability',
          action: () => {
            updateUserProfile({ hasDisability: false });
            setAnsweredFields((prev) => ({ ...prev, disability: true }));
          },
        },
      ],
    });
  }

  // 5. Income Ceiling Requirement
  if (
    scheme.eligibility.maxAnnualIncome &&
    (!userProfile || (userProfile.annualIncome || 0) > scheme.eligibility.maxAnnualIncome || (userProfile.annualIncome || 0) === 0)
  ) {
    const limit = scheme.eligibility.maxAnnualIncome;
    questionsToAsk.push({
      key: 'income',
      question: `Is your annual family income below ₹${limit.toLocaleString('en-IN')}?`,
      options: [
        {
          label: `Yes, Annual Income below ₹${limit.toLocaleString('en-IN')}`,
          action: () => {
            updateUserProfile({ annualIncome: Math.min(120000, limit - 10000) });
            setAnsweredFields((prev) => ({ ...prev, income: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: `No, Higher than ₹${limit.toLocaleString('en-IN')}`,
          action: () => {
            updateUserProfile({ annualIncome: limit + 50000 });
            setAnsweredFields((prev) => ({ ...prev, income: true }));
          },
        },
      ],
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#21191d]/75 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-civic-overlay border border-[#e8e1dc] overflow-hidden">
        {/* Header Bar */}
        <div className="bg-[#4a1f2d] text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="space-y-1.5 max-w-[85%]">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  scheme.schemeType === 'central'
                    ? 'bg-[#c8a96b]/20 text-[#ffdea0] border border-[#c8a96b]/40'
                    : 'bg-[#71806b]/20 text-[#e8e1dc] border border-[#71806b]/40'
                }`}
              >
                {scheme.schemeType === 'central' ? 'Central Scheme' : `${scheme.stateId || scheme.state || 'State'} Scheme`}
              </span>
              <span className="text-xs text-[#c08494] font-mono">ID: {scheme.id}</span>
              <span className="text-[11px] text-[#c8a96b] font-medium">✓ Official Gazette Rule</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {scheme.name}
            </h2>
            {scheme.nativeName && (
              <p className="text-xs sm:text-sm text-[#ffd9e1] font-medium">
                {scheme.nativeName}
              </p>
            )}
            <p className="text-xs text-[#c08494]">
              Authority: <span className="text-white font-semibold">{scheme.department || scheme.authority || 'Government Authority'}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              id="detail-hear-voice-btn"
              onClick={() => {
                speechService.stop();
                setSelectedSchemeDetail(null);
                openVoiceAssistantForScheme(scheme);
              }}
              className="px-3 py-2 rounded-xl bg-[#c8a96b] hover:bg-[#e3c282] text-[#310a18] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Discuss this scheme in Voice Assistant"
            >
              <Volume2 className="w-4 h-4 text-[#310a18]" />
              <span className="hidden sm:inline">HEAR IN VOICE</span>
              <span className="sm:hidden">HEAR</span>
            </button>

            <button
              id="detail-save-btn"
              onClick={() => toggleSaveScheme(scheme.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                  : 'bg-[#6b3548] text-[#ffd9e1] border-[#e8e1dc]/30 hover:bg-[#874d60]'
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
              className="p-2 rounded-xl bg-[#6b3548] text-[#ffd9e1] border border-[#e8e1dc]/30 hover:bg-[#874d60] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-1 bg-[#faf8f3] p-1.5 border-b border-[#e8e1dc] overflow-x-auto text-xs font-bold">
          <button
            id="detail-subtab-overview"
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'bg-[#4a1f2d] text-white shadow-xs'
                : 'text-[#756a6f] hover:bg-[#eedfe4]'
            }`}
          >
            OVERVIEW & ELIGIBILITY
          </button>
          <button
            id="detail-subtab-docs"
            onClick={() => setActiveSubTab('DOCUMENTS')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'DOCUMENTS'
                ? 'bg-[#4a1f2d] text-white shadow-xs'
                : 'text-[#756a6f] hover:bg-[#eedfe4]'
            }`}
          >
            <span>DOCUMENTS CHECKLIST</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeSubTab === 'DOCUMENTS' ? 'bg-[#6b3548] text-white' : 'bg-[#e8e1dc] text-[#241c20]'
            }`}>
              {scheme.documents?.length || 0}
            </span>
          </button>
          <button
            id="detail-subtab-apply"
            onClick={() => setActiveSubTab('APPLY')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer ${
              activeSubTab === 'APPLY'
                ? 'bg-[#4a1f2d] text-white shadow-xs'
                : 'text-[#756a6f] hover:bg-[#eedfe4]'
            }`}
          >
            HOW TO APPLY
          </button>
          <button
            id="detail-subtab-simplified"
            onClick={() => setActiveSubTab('SIMPLIFIED')}
            className={`px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
              activeSubTab === 'SIMPLIFIED'
                ? 'bg-[#c8a96b] text-[#221700] shadow-xs'
                : 'text-[#6b3548] bg-[#c8a96b]/15 hover:bg-[#c8a96b]/25'
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
              {/* Dynamic Eligibility Missing Question Section */}
              {questionsToAsk.length > 0 && (
                <div className="bg-[#faf8f3] border border-[#c8a96b] rounded-2xl p-4 sm:p-5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-2 text-[#4a1f2d] font-bold text-xs">
                    <HelpCircle className="w-4 h-4 text-[#c8a96b] shrink-0" />
                    <span>Quick Eligibility Check: Answer to verify if you qualify</span>
                  </div>

                  <div className="space-y-3">
                    {questionsToAsk.map((q) => (
                      <div key={q.key} className="bg-white p-3.5 rounded-xl border border-[#e8e1dc] space-y-2">
                        <p className="text-xs font-semibold text-[#241c20]">{q.question}</p>
                        <div className="flex items-center gap-2 flex-wrap">
                          {q.options.map((opt, idx) => (
                            <button
                              key={idx}
                              onClick={opt.action}
                              className="px-3 py-1.5 rounded-lg bg-[#4a1f2d] hover:bg-[#6b3548] text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Match Score & Status Banner */}
              {matchResult && (
                <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                  matchResult.score >= 70
                    ? 'bg-[#71806b]/12 border-[#71806b] text-[#241c20]'
                    : 'bg-[#faf8f3] border-[#e8e1dc] text-[#4a1f2d]'
                }`}>
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-[#71806b]" />
                      <span>
                        Profile Eligibility Match: <strong>{matchResult.score}%</strong> ({matchResult.matchLevel})
                      </span>
                    </div>
                    <p className="text-[#756a6f]">
                      Evaluated using your profile (Age: {userProfile?.age || 35}, Occupation: {userProfile?.occupation || 'General'}, State: {userProfile?.state || 'Current'})
                    </p>
                  </div>
                  <button
                    id="detail-whyme-btn"
                    onClick={() => setSelectedWhyMeScheme(matchResult)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#4a1f2d] text-white font-bold text-xs hover:bg-[#6b3548] shrink-0 cursor-pointer"
                  >
                    VIEW WHY ME
                  </button>
                </div>
              )}

              {/* Voice Readout Banner */}
              <div className="bg-[#faf8f3] border border-[#e8e1dc] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-[#4a1f2d] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#4a1f2d]">
                      Hear Scheme Explanation in {currentLanguageConfig.name}
                    </p>
                    <p className="text-[11px] text-[#514346]">
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
                      ? 'bg-[#4a1f2d] text-white animate-pulse'
                      : 'bg-[#4a1f2d] text-white hover:bg-[#6b3548]'
                  }`}
                >
                  {isPlayingAudio ? 'STOP' : 'HEAR AUDIO'}
                </button>
              </div>

              {/* What is it? */}
              <div>
                <h3 className="text-xs font-bold text-[#4a1f2d] uppercase tracking-wider mb-2">
                  What is this Scheme?
                </h3>
                <p className="text-xs sm:text-sm text-[#241c20] leading-relaxed bg-[#faf8f3] p-4 rounded-2xl border border-[#e8e1dc]">
                  {scheme.benefits?.detailedBenefit || scheme.summarySimple || scheme.name}
                </p>
              </div>

              {/* Benefits Highlight */}
              <div className="bg-[#71806b]/12 border border-[#71806b] rounded-2xl p-4 sm:p-5">
                <span className="text-[11px] font-bold text-[#241c20] uppercase tracking-wider block mb-1">
                  Sanctioned Benefits
                </span>
                <p className="text-lg font-bold text-[#241c20]">
                  {scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Welfare Benefit'}
                </p>
                <div className="mt-3 space-y-1 text-xs text-[#514346]">
                  <p>• <strong>Benefit Type:</strong> {scheme.benefits?.type ? scheme.benefits.type.replace('_', ' ').toUpperCase() : 'WELFARE'}</p>
                  <p>• <strong>Frequency:</strong> {scheme.benefits?.frequency || 'Direct Benefit Transfer / Periodic'}</p>
                  {scheme.benefits?.shortSummary && <p>• <strong>Summary:</strong> {scheme.benefits.shortSummary}</p>}
                </div>
              </div>

              {/* Who Qualifies? (Eligibility Rules) */}
              <div>
                <h3 className="text-xs font-bold text-[#4a1f2d] uppercase tracking-wider mb-2">
                  Who Qualifies?
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e1dc]">
                    <span className="text-[10px] font-bold text-[#756a6f] uppercase block">Age Limit</span>
                    <strong className="text-[#241c20]">
                      {scheme.eligibility?.minAge ? `${scheme.eligibility.minAge} years` : 'No minimum'} - {scheme.eligibility?.maxAge ? `${scheme.eligibility.maxAge} years` : 'No maximum'}
                    </strong>
                  </div>
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e1dc]">
                    <span className="text-[10px] font-bold text-[#756a6f] uppercase block">Income Ceiling</span>
                    <strong className="text-[#241c20]">
                      {scheme.eligibility?.maxAnnualIncome ? `₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')} / year` : 'No restrictive income limit'}
                    </strong>
                  </div>
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e1dc]">
                    <span className="text-[10px] font-bold text-[#756a6f] uppercase block">Target Occupations</span>
                    <strong className="text-[#241c20]">
                      {scheme.eligibility?.allowedOccupations ? scheme.eligibility.allowedOccupations.join(', ') : 'All Occupations'}
                    </strong>
                  </div>
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e1dc]">
                    <span className="text-[10px] font-bold text-[#756a6f] uppercase block">Applicable Location</span>
                    <strong className="text-[#241c20]">
                      {scheme.stateId === 'ALL' || scheme.state === 'ALL' ? 'All States across India' : `${scheme.stateId || scheme.state} State`}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DOCUMENTS CHECKLIST */}
          {activeSubTab === 'DOCUMENTS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-[#faf8f3] p-4 rounded-2xl border border-[#e8e1dc]">
                <h3 className="text-xs font-bold text-[#4a1f2d] uppercase tracking-wider mb-1">
                  Required Citizen Documents
                </h3>
                <p className="text-xs text-[#514346]">
                  Tick the documents you have ready. These are required for physical or online verification.
                </p>
              </div>

              <div className="space-y-2">
                {scheme.documents?.map((doc) => {
                  const hasDoc = !!userDocuments[doc.name];
                  return (
                    <div
                      key={doc.id || doc.name}
                      onClick={() => toggleUserDocument(doc.name)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                        hasDoc
                          ? 'bg-[#71806b]/12 border-[#71806b] shadow-xs'
                          : 'bg-white border-[#e8e1dc] hover:border-[#4a1f2d]'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          hasDoc
                            ? 'bg-[#71806b] border-[#71806b] text-white'
                            : 'border-[#756a6f] bg-white'
                        }`}
                      >
                        {hasDoc && <Check className="w-3.5 h-3.5" />}
                      </div>

                      <div className="flex-1 space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#241c20]">
                            {doc.name}
                          </span>
                          {doc.isMandatory && (
                            <span className="text-[10px] bg-[#ffdad6] text-[#93000a] font-bold px-2 py-0.2 rounded-full">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#514346]">
                          {doc.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: HOW TO APPLY */}
          {activeSubTab === 'APPLY' && (
            <div className="space-y-5 animate-fade-in">
              <div className="bg-[#faf8f3] p-4 rounded-2xl border border-[#e8e1dc]">
                <h3 className="text-xs font-bold text-[#4a1f2d] uppercase tracking-wider mb-1">
                  Step-by-Step Application Process
                </h3>
                <p className="text-xs text-[#514346]">
                  Follow these instructions to submit your official application.
                </p>
              </div>

              <div className="space-y-3">
                {scheme.applicationSteps?.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 rounded-xl bg-white border border-[#e8e1dc]">
                    <div className="w-6 h-6 rounded-full bg-[#4a1f2d] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-[#241c20] font-medium leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>

              {/* Official Links & Offline Center */}
              <div className="p-4 rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] space-y-3">
                {scheme.applicationUrl && (
                  <a
                    href={scheme.applicationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 px-4 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Visit Official Application Portal</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {scheme.offlineApplicationCenter && (
                  <div className="text-xs text-[#514346] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#4a1f2d] shrink-0" />
                    <span><strong>Offline Center:</strong> {scheme.offlineApplicationCenter}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: EXPLAIN SIMPLY */}
          {activeSubTab === 'SIMPLIFIED' && (
            <div className="space-y-5 animate-fade-in">
              <div className="p-5 rounded-3xl bg-[#faf8f3] border border-[#c8a96b] space-y-3">
                <div className="flex items-center gap-2 text-[#4a1f2d] font-bold text-xs uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#c8a96b]" />
                  <span>Simple Explanation (No Jargon)</span>
                </div>

                <p className="text-sm font-semibold text-[#241c20] leading-relaxed">
                  {regionalContent?.summary || scheme.summarySimple}
                </p>

                <div className="bg-white p-4 rounded-2xl border border-[#e8e1dc] space-y-2">
                  <span className="text-xs font-bold text-[#4a1f2d] block">
                    What this means for your family:
                  </span>
                  <p className="text-xs text-[#514346] leading-relaxed">
                    {scheme.benefits?.detailedBenefit || scheme.benefits?.shortSummary}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-4 bg-[#faf8f3] border-t border-[#e8e1dc] flex items-center justify-between gap-3">
          <button
            onClick={handleCopySummary}
            className="px-4 py-2 rounded-xl bg-white border border-[#e8e1dc] text-xs font-bold text-[#241c20] hover:bg-[#eedfe4] transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5 text-[#756a6f]" />
            <span>{copiedLink ? 'Copied!' : 'Copy Summary'}</span>
          </button>

          <button
            onClick={() => {
              speechService.stop();
              setSelectedSchemeDetail(null);
            }}
            className="px-6 py-2.5 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white font-bold text-xs transition-colors cursor-pointer"
          >
            {t('common.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
