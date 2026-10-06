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
    uiStrings,
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
    speechService.unlockAudio();
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
  const langKey = (selectedVoiceLanguageId || 'ta').toLowerCase().split('-')[0].split('_')[0];
  const isTa = langKey === 'ta';
  const isHi = langKey === 'hi';
  const isTe = langKey === 'te';

  if (
    scheme.eligibility.requiresStudent &&
    (!userProfile || !userProfile.isStudent)
  ) {
    const qText = isTa
      ? 'நீங்கள் தற்போது பள்ளி, கல்லூரி அல்லது பாலிடெக்னிக் மாணவராக பயில்கிறீர்களா?'
      : isHi
      ? 'क्या आप वर्तमान में स्कूल, कॉलेज या पॉलिटेक्निक में नामांकित छात्र हैं?'
      : isTe
      ? 'మీరు ప్రస్తుతం పాఠశాల, కళాశాల లేదా పాలిటెక్నిక్‌లో విద్యార్థినా?'
      : 'Are you currently enrolled as a student in school, college, or polytechnic?';
    const yesText = isTa ? 'ஆம், நான் மாணவர்' : isHi ? 'हाँ, मैं छात्र हूँ' : isTe ? 'అవును, నేను విద్యార్థిని' : 'Yes, I am a Student';
    const noText = isTa ? 'இல்லை, மாணவர் அல்ல' : isHi ? 'नहीं, छात्र नहीं हूँ' : isTe ? 'కాదు' : 'No, Not a Student';

    questionsToAsk.push({
      key: 'student',
      question: qText,
      options: [
        {
          label: yesText,
          action: () => {
            updateUserProfile({ isStudent: true, occupation: 'student' });
            setAnsweredFields((prev) => ({ ...prev, student: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: noText,
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
    const qText = isTa
      ? 'உங்களுக்கோ அல்லது உங்கள் குடும்பத்திற்கோ சொந்தமாக விவசாய நிலம் உள்ளதா?'
      : isHi
      ? 'क्या आपके या आपके परिवार के पास कृषि भूमि है?'
      : isTe
      ? 'మీకు లేదా మీ కుటుంబానికి వ్యవసాయ భూమి ఉందా?'
      : 'Do you or your family own cultivable agricultural land?';
    const yesText = isTa
      ? 'ஆம், 5 ஏக்கர் வரை (சிறு/குறு விவசாயி)'
      : isHi
      ? 'हाँ, 5 एकड़ तक (छोटे/सीमांत किसान)'
      : isTe
      ? 'అవును, 5 ఎకరాల వరకు (చిన్న/సన్నకారు రైతు)'
      : 'Yes, up to 5 Acres (Small/Marginal Farmer)';
    const noText = isTa ? 'விவசாய நிலம் இல்லை' : isHi ? 'कृषि भूमि नहीं है' : isTe ? 'వ్యవసాయ భూమి లేదు' : 'No Agricultural Land';

    questionsToAsk.push({
      key: 'land',
      question: qText,
      options: [
        {
          label: yesText,
          action: () => {
            updateUserProfile({ landHoldingAcres: 2.5, occupation: 'farmer' });
            setAnsweredFields((prev) => ({ ...prev, land: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: noText,
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
    const qText = isTa
      ? 'உங்களுக்கோ அல்லது குடும்பத்தினருக்கோ மாற்றுத்திறனாளி சான்றிதழ் உள்ளதா?'
      : isHi
      ? 'क्या आपके पास 40% या अधिक का दिव्यांगता प्रमाणपत्र है?'
      : isTe
      ? 'మీకు లేదా కుటుంబ సభ్యులకు దివ్యాంగుల ధృవీకరణ పత్రం ఉందా?'
      : 'Do you or a family member have a certified disability or require caregiver assistance?';
    const yesText = isTa ? 'ஆம், 40%+ மாற்றுத்திறனாளி சான்றிதழ்' : isHi ? 'हाँ, 40%+ दिव्यांगता प्रमाणपत्र' : isTe ? 'అవును, 40%+ ధృవీకరణ పత్రం' : 'Yes, 40%+ Certified Disability';
    const noText = isTa ? 'இல்லை' : isHi ? 'नहीं' : isTe ? 'లేదు' : 'No Disability';

    questionsToAsk.push({
      key: 'disability',
      question: qText,
      options: [
        {
          label: yesText,
          action: () => {
            updateUserProfile({ hasDisability: true });
            setAnsweredFields((prev) => ({ ...prev, disability: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: noText,
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
    const formatted = limit.toLocaleString('en-IN');
    const qText = isTa
      ? `உங்கள் குடும்பத்தின் ஆண்டு வருமானம் ₹${formatted}க்கு குறைவாக உள்ளதா?`
      : isHi
      ? `क्या आपकी वार्षिक पारिवारिक आय ₹${formatted} से कम है?`
      : isTe
      ? `మీ వార్షిక కుటుంబ ఆదాయం ₹${formatted} కంటే తక్కువగా ఉందా?`
      : `Is your annual family income below ₹${formatted}?`;
    const yesText = isTa
      ? `ஆம், ஆண்டு வருமானம் ₹${formatted}க்கு குறைவு`
      : isHi
      ? `हाँ, वार्षिक आय ₹${formatted} से कम है`
      : isTe
      ? `అవును, ఆదాయం ₹${formatted} కంటే తక్కువ`
      : `Yes, Annual Income below ₹${formatted}`;
    const noText = isTa
      ? `இல்லை, ₹${formatted}க்கு மேல்`
      : isHi
      ? `नहीं, ₹${formatted} से अधिक`
      : isTe
      ? `కాదు, ₹${formatted} కంటే ఎక్కువ`
      : `No, Higher than ₹${formatted}`;

    questionsToAsk.push({
      key: 'income',
      question: qText,
      options: [
        {
          label: yesText,
          action: () => {
            updateUserProfile({ annualIncome: Math.min(120000, limit - 10000) });
            setAnsweredFields((prev) => ({ ...prev, income: true }));
            triggerMatchCelebration();
          },
        },
        {
          label: noText,
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
                {scheme.schemeType === 'central' ? t('scheme.centralScheme') : t('scheme.stateScheme')}
              </span>
              <span className="text-xs text-[#c08494] font-mono">ID: {scheme.id}</span>
              <span className="text-[11px] text-[#c8a96b] font-medium">✓ {t('scheme.ruleGazette')}</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {selectedVoiceLanguageId !== 'en' && scheme.nativeName
                ? (scheme.nativeName.includes('/') ? scheme.nativeName.split('/')[selectedVoiceLanguageId === 'ml' ? 1 : 0].trim() : scheme.nativeName)
                : scheme.name}
            </h2>
            <p className="text-xs sm:text-sm text-[#ffd9e1] font-medium">
              {selectedVoiceLanguageId !== 'en' && scheme.nativeName ? scheme.name : (scheme.nativeName || '')}
            </p>
            <p className="text-xs text-[#c08494]">
              {t('scheme.authority')}: <span className="text-white font-semibold">{scheme.department || scheme.authority || 'Government Authority'}</span>
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
              <span className="hidden sm:inline">{t('scheme.hearInVoice')}</span>
              <span className="sm:hidden">{t('scheme.hear')}</span>
            </button>

            <button
              id="detail-save-btn"
              onClick={() => toggleSaveScheme(scheme.id)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                isSaved
                  ? 'bg-[#ba1a1a] text-white border-[#ba1a1a]'
                  : 'bg-[#6b3548] text-[#ffd9e1] border-[#e8e1dc]/30 hover:bg-[#874d60]'
              }`}
              title={isSaved ? 'Remove from Saved' : t('scheme.save')}
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
            {t('scheme.overviewTab')}
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
            <span>{t('scheme.docsTab')}</span>
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
            {t('scheme.applyTab')}
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
            <span>{t('scheme.explainSimplyTab')}</span>
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
                    <span>
                      {isTa
                        ? 'விரைவு தகுதிச் சரிபார்ப்பு: நீங்கள் தகுதியானவரா என சரிபார்க்கவும்'
                        : isHi
                        ? 'त्वरित पात्रता जांच: उत्तर देकर जांचें कि क्या आप पात्र हैं'
                        : isTe
                        ? 'త్వరిత అర్హత తనిఖీ: మీరు అర్హులా కాదా అని తనిఖీ చేయండి'
                        : 'Quick Eligibility Check: Answer to verify if you qualify'}
                    </span>
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
                        {isTa ? 'சுயவிவர தகுதிப் பொருத்தம்:' : isHi ? 'प्रोफ़ाइल पात्रता मिलान:' : isTe ? 'ప్రొఫైల్ అర్హత సరిపోలిక:' : 'Profile Eligibility Match:'}{' '}
                        <strong>{matchResult.score}%</strong> ({matchResult.matchLevel})
                      </span>
                    </div>
                    <p className="text-[#756a6f]">
                      {isTa
                        ? `உங்கள் சுயவிவரத்தின் அடிப்படையில் கணக்கிடப்பட்டது (வயது: ${userProfile?.age || 35}, தொழில்: ${userProfile?.occupation || 'பொதுவான'}, மாநிலம்: ${userProfile?.state || 'தற்போதைய'})`
                        : isHi
                        ? `आपकी प्रोफ़ाइल के आधार पर मूल्यांकित (आयु: ${userProfile?.age || 35})`
                        : `Evaluated using your profile (Age: ${userProfile?.age || 35}, Occupation: ${userProfile?.occupation || 'General'}, State: ${userProfile?.state || 'Current'})`}
                    </p>
                  </div>
                  <button
                    id="detail-whyme-btn"
                    onClick={() => setSelectedWhyMeScheme(matchResult)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#4a1f2d] text-white font-bold text-xs hover:bg-[#6b3548] shrink-0 cursor-pointer"
                  >
                    {uiStrings.whyMe || 'VIEW WHY ME'}
                  </button>
                </div>
              )}

              {/* Voice Readout Banner */}
              <div className="bg-[#faf8f3] border border-[#e8e1dc] rounded-2xl p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Volume2 className="w-5 h-5 text-[#4a1f2d] shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#4a1f2d]">
                      {isTa
                        ? `திட்டத்தின் நேரடி குரல் விளக்கம் (${currentLanguageConfig.name})`
                        : isHi
                        ? `योजना का ऑडियो विवरण (${currentLanguageConfig.name})`
                        : isTe
                        ? `వాయిస్ వివరణ వినండి (${currentLanguageConfig.name})`
                        : `Hear Scheme Explanation in ${currentLanguageConfig.name}`}
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
                  {isPlayingAudio ? 'STOP' : (uiStrings.hear || 'HEAR AUDIO')}
                </button>
              </div>

              {/* What is it? */}
              <div>
                <h3 className="text-xs font-bold text-[#4a1f2d] uppercase tracking-wider mb-2">
                  {t('scheme.whatIsThis')}
                </h3>
                <p className="text-xs sm:text-sm text-[#241c20] leading-relaxed bg-[#faf8f3] p-4 rounded-2xl border border-[#e8e1dc]">
                  {scheme.benefits?.detailedBenefit || scheme.summarySimple || scheme.name}
                </p>
              </div>

              {/* Benefits Highlight */}
              <div className="bg-[#71806b]/12 border border-[#71806b] rounded-2xl p-4 sm:p-5">
                <span className="text-[11px] font-bold text-[#241c20] uppercase tracking-wider block mb-1">
                  {t('scheme.sanctionedBenefits')}
                </span>
                <p className="text-lg font-bold text-[#241c20]">
                  {scheme.benefits?.amount || scheme.benefits?.shortSummary || 'Welfare Benefit'}
                </p>
                <div className="mt-3 space-y-1 text-xs text-[#514346]">
                  <p>• <strong>{t('scheme.benefitType')}:</strong> {scheme.benefits?.type ? scheme.benefits.type.replace('_', ' ').toUpperCase() : 'WELFARE'}</p>
                  <p>• <strong>{t('scheme.frequency')}:</strong> {scheme.benefits?.frequency || 'Direct Benefit Transfer / Periodic'}</p>
                  {scheme.benefits?.shortSummary && <p>• <strong>Summary:</strong> {scheme.benefits.shortSummary}</p>}
                </div>
              </div>

              {/* Who Qualifies? (Eligibility Rules) */}
              <div>
                <h3 className="text-xs font-bold text-[#4a1f2d] uppercase tracking-wider mb-2">
                  {t('scheme.whoQualifies')}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e1dc]">
                    <span className="text-[10px] font-bold text-[#756a6f] uppercase block">{t('scheme.ageLimit')}</span>
                    <strong className="text-[#241c20]">
                      {scheme.eligibility?.minAge ? `${scheme.eligibility.minAge} ${isTa ? 'வயது' : isHi ? 'वर्ष' : 'years'}` : (isTa ? 'குறைந்தபட்ச வரம்பு இல்லை' : isHi ? 'न्यूनतम सीमा नहीं' : 'No minimum')} - {scheme.eligibility?.maxAge ? `${scheme.eligibility.maxAge} ${isTa ? 'வயது' : isHi ? 'वर्ष' : 'years'}` : (isTa ? 'அதிகபட்ச வரம்பு இல்லை' : isHi ? 'अधिकतम सीमा नहीं' : 'No maximum')}
                    </strong>
                  </div>
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e1dc]">
                    <span className="text-[10px] font-bold text-[#756a6f] uppercase block">{t('scheme.incomeCeiling')}</span>
                    <strong className="text-[#241c20]">
                      {scheme.eligibility?.maxAnnualIncome ? `₹${scheme.eligibility.maxAnnualIncome.toLocaleString('en-IN')} / ${isTa ? 'ஆண்டு' : isHi ? 'वर्ष' : 'year'}` : (isTa ? 'வருமான வரம்பு இல்லை' : isHi ? 'कोई आय सीमा नहीं' : 'No restrictive income limit')}
                    </strong>
                  </div>
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e1dc]">
                    <span className="text-[10px] font-bold text-[#756a6f] uppercase block">{t('scheme.targetOccupations')}</span>
                    <strong className="text-[#241c20]">
                      {scheme.eligibility?.allowedOccupations ? scheme.eligibility.allowedOccupations.join(', ') : (isTa ? 'அனைத்து தொழில்களும்' : isHi ? 'सभी व्यवसाय' : 'All Occupations')}
                    </strong>
                  </div>
                  <div className="bg-[#faf8f3] p-3 rounded-xl border border-[#e8e1dc]">
                    <span className="text-[10px] font-bold text-[#756a6f] uppercase block">{t('scheme.applicableLocation')}</span>
                    <strong className="text-[#241c20]">
                      {scheme.stateId === 'ALL' || scheme.state === 'ALL' ? (isTa ? 'இந்தியா முழுவதும் உள்ள அனைத்து மாநிலங்கள்' : isHi ? 'भारत के सभी राज्य' : 'All States across India') : `${scheme.stateId || scheme.state} State`}
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
                  {t('scheme.requiredDocs')}
                </h3>
                <p className="text-xs text-[#514346]">
                  {t('scheme.docsInstruction')}
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
                              {isTa ? 'கட்டாய ஆவணம்' : isHi ? 'अनिवार्य' : isTe ? 'తప్పనిసరి' : 'Mandatory'}
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
                  {t('scheme.stepByStep')}
                </h3>
                <p className="text-xs text-[#514346]">
                  {t('scheme.howToApply')}
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
                    <span>{t('scheme.onlinePortal')}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {scheme.offlineApplicationCenter && (
                  <div className="text-xs text-[#514346] flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#4a1f2d] shrink-0" />
                    <span><strong>{t('scheme.whereToApply')}:</strong> {scheme.offlineApplicationCenter}</span>
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
                  <span>
                    {isTa
                      ? 'எளிய விளக்கம் (தொழில்நுட்ப சொற்கள் இன்றி)'
                      : isHi
                      ? 'सरल भाषा में विवरण (सरल शब्द)'
                      : isTe
                      ? 'సరళమైన వివరణ'
                      : 'Simple Explanation (No Jargon)'}
                  </span>
                </div>

                <p className="text-sm font-semibold text-[#241c20] leading-relaxed">
                  {regionalContent?.summary || scheme.summarySimple}
                </p>

                <div className="bg-white p-4 rounded-2xl border border-[#e8e1dc] space-y-2">
                  <span className="text-xs font-bold text-[#4a1f2d] block">
                    {isTa
                      ? 'உங்கள் குடும்பத்திற்கு இதன் நேரடி பலன்:'
                      : isHi
                      ? 'आपके परिवार के लिए इसका क्या अर्थ है:'
                      : isTe
                      ? 'మీ కుటుంబానికి దీని ప్రయోజనం:'
                      : 'What this means for your family:'}
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
            <span>
              {copiedLink
                ? (isTa ? 'நகலெடுக்கப்பட்டது!' : 'Copied!')
                : (isTa ? 'விவரங்களை நகலெடு' : 'Copy Summary')}
            </span>
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
