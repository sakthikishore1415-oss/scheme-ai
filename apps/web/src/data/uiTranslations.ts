export interface DualText {
  native: string;
  en: string;
}

export interface AppTranslationStrings {
  // Navigation
  navHome: string;
  navMatches: string;
  navSaved: string;
  navProfile: string;
  navSupport: string;

  // Header & Brand
  appTitle: string;
  appTagline: string;
  selectLanguage: string;
  changeState: string;

  // Home Hero
  heroHeading: string;
  heroSubheading: string;
  startVoiceBtn: string;
  browseCatalogBtn: string;
  checkEligibilityBtn: string;

  // Matches View
  matchesHeading: string;
  matchesSubheading: string;
  strongMatchesBadge: string;
  potentialMatchesBadge: string;
  moreInfoBadge: string;
  noMatchesFound: string;
  noMatchesDesc: string;

  // Common Actions
  continueBtn: string;
  backBtn: string;
  submitBtn: string;
  saveBtn: string;
  savedBtn: string;
  shareBtn: string;
  viewDetailsBtn: string;
  whyThisMatchesBtn: string;
  explainSimplyBtn: string;
  callHelpBtn: string;
  findNearbyCenterBtn: string;

  // Categories
  catAgriculture: string;
  catEducation: string;
  catHousing: string;
  catWomen: string;
  catHealth: string;
  catPension: string;
  catDisability: string;
  catBusiness: string;
  catEmployment: string;
  catGeneral: string;

  // Profile Form
  profileHeading: string;
  profileSubheading: string;
  fullNameLabel: string;
  ageLabel: string;
  genderLabel: string;
  stateLabel: string;
  districtLabel: string;
  occupationLabel: string;
  annualIncomeLabel: string;
  primaryNeedLabel: string;

  // Trust & Privacy
  privacyNotice: string;
  verifiedOfficialBadge: string;
  offlineCenterNote: string;

  // Convenience & Detail Modals
  hearInVoice?: string;
  hear?: string;
  overview?: string;
  documents?: string;
  howToApply?: string;
  simplifiedSummary?: string;
  whyMe?: string;
  close?: string;
  noProfile?: string;
  createProfile?: string;
  createProfileNotice?: string;
  citizenDemographics?: string;
  familyMembers?: string;
}

export const UI_TRANSLATIONS: Record<string, AppTranslationStrings> = {
  ta: {
    navHome: 'முகப்பு',
    navMatches: 'பொருந்தும் திட்டங்கள்',
    navSaved: 'சேமிக்கப்பட்டவை',
    navProfile: 'சுயவிவரம்',
    navSupport: 'உதவி மையம்',

    appTitle: 'பேக்ஸ் சகாயக்',
    appTagline: 'அரசு நலத்திட்டங்களை அறிந்து உரிமையோடு பெறுங்கள்',
    selectLanguage: 'மொழியை தேர்வு செய்க',
    changeState: 'மாநிலத்தை மாற்றுக',

    heroHeading: 'திட்டங்களை கண்டறியுங்கள்',
    heroSubheading: 'உங்கள் தொழில் மற்றும் குடும்ப தேவைக்கேற்ப அரசு வழங்கும் சலுகைகளை உடனடியாக கண்டறியுங்கள்.',
    startVoiceBtn: 'குரல் வழியே உரையாடுங்கள்',
    browseCatalogBtn: 'அனைத்து திட்டங்கள்',
    checkEligibilityBtn: 'தகுதியை சரிபார்க்கவும்',

    matchesHeading: 'உங்களுக்கான அரசு திட்டங்கள்',
    matchesSubheading: 'அதிகாரப்பூர்வ அரசாணைகளின் அடிப்படையில் கண்டறியப்பட்டவை.',
    strongMatchesBadge: 'நேரடி தகுதி',
    potentialMatchesBadge: 'சாத்தியமான தகுதி',
    moreInfoBadge: 'கூடுதல் தகவல் தேவை',
    noMatchesFound: 'திட்டங்கள் எதுவும் பொருந்தவில்லை',
    noMatchesDesc: 'உங்கள் சுயவிவரத்தை மாற்றியமைத்து மீண்டும் முயற்சிக்கவும்.',

    continueBtn: 'தொடர்க',
    backBtn: 'பின்செல்க',
    submitBtn: 'சமர்ப்பிக்கவும்',
    saveBtn: 'சேமிக்க',
    savedBtn: 'சேமிக்கப்பட்டது',
    shareBtn: 'பகிர்க',
    viewDetailsBtn: 'முழு விவரங்கள்',
    whyThisMatchesBtn: 'ஏன் பொருந்துகிறது?',
    explainSimplyBtn: 'எளிய தமிழில் விளக்கம்',
    callHelpBtn: 'உதவி எண் அழைக்க',
    findNearbyCenterBtn: 'அருகிலுள்ள இ-சேவை மையம்',

    catAgriculture: 'விவசாயம் & உழவர் நலன்',
    catEducation: 'கல்வி & கல்வித்தொகை',
    catHousing: 'வீட்டு வசதி & குடியிருப்பு',
    catWomen: 'மகளிர் நலம் & சுயஉதவி',
    catHealth: 'மருத்துவம் & காப்பீடு',
    catPension: 'முதியோர் & ஓய்வூதியம்',
    catDisability: 'மாற்றுத்திறனாளிகள் நலம்',
    catBusiness: 'சிறுவணிகம் & கடன் உதவி',
    catEmployment: 'தொழிலாளர் & வேலைவாய்ப்பு',
    catGeneral: 'பொது நலத்திட்டங்கள்',

    profileHeading: 'குடிமக்கள் சுயவிவரம்',
    profileSubheading: 'சரியான திட்டங்களை துல்லியமாக கண்டறிய உங்கள் அடிப்படை விவரங்களை பகிருங்கள்.',
    fullNameLabel: 'முழு பெயர்',
    ageLabel: 'வயது',
    genderLabel: 'பாலினம்',
    stateLabel: 'மாநிலம்',
    districtLabel: 'மாவட்டம்',
    occupationLabel: 'முதன்மை தொழில்',
    annualIncomeLabel: 'குடும்ப ஆண்டு வருமானம்',
    primaryNeedLabel: 'முக்கிய தேவை',

    privacyNotice: 'உங்கள் விவரங்கள் அரசாணைகளை சரிபார்க்க மட்டுமே பயன்படுத்தப்படுகிறது.',
    verifiedOfficialBadge: 'அரசாணை சரிபார்க்கப்பட்டது',
    offlineCenterNote: 'இணைய வசதி இல்லாதவர்கள் அருகில் உள்ள இ-சேவை மையத்தை அணுகலாம்.',
  },

  hi: {
    navHome: 'होम',
    navMatches: 'पात्र योजनाएं',
    navSaved: 'सहेजी गई',
    navProfile: 'प्रोफ़ाइल',
    navSupport: 'सहायता केंद्र',

    appTitle: 'पैक्स सहायक',
    appTagline: 'सरकारी योजनाओं को जानें, अपने अधिकार पाएं',
    selectLanguage: 'भाषा चुनें',
    changeState: 'राज्य बदलें',

    heroHeading: 'योजनाएं खोजें',
    heroSubheading: 'अपने व्यवसाय और पारिवारिक जरूरतों के अनुसार सही सरकारी योजनाएं तुरंत खोजें।',
    startVoiceBtn: 'आवाज से पूछें',
    browseCatalogBtn: 'सभी योजनाएं',
    checkEligibilityBtn: 'पात्रता जांचें',

    matchesHeading: 'आपके लिए उपयुक्त योजनाएं',
    matchesSubheading: 'आधिकारिक सरकारी राजपत्रों के अनुसार मूल्यांकित।',
    strongMatchesBadge: 'सीधी पात्रता',
    potentialMatchesBadge: 'संभावित पात्रता',
    moreInfoBadge: 'अधिक जानकारी आवश्यक',
    noMatchesFound: 'कोई योजना नहीं मिली',
    noMatchesDesc: 'कृपया अपनी प्रोफ़ाइल जानकारी अपडेट करके पुनः प्रयास करें।',

    continueBtn: 'आगे बढ़ें',
    backBtn: 'पीछे जाएं',
    submitBtn: 'जमा करें',
    saveBtn: 'सहेजें',
    savedBtn: 'सहेजा गया',
    shareBtn: 'साझा करें',
    viewDetailsBtn: 'पूर्ण विवरण',
    whyThisMatchesBtn: 'यह क्यों उपयुक्त है?',
    explainSimplyBtn: 'सरल भाषा में समझें',
    callHelpBtn: 'हेल्पलाइन कॉल करें',
    findNearbyCenterBtn: 'निकटतम सेवा केंद्र',

    catAgriculture: 'कृषि एवं किसान कल्याण',
    catEducation: 'शिक्षा एवं छात्रवृत्ति',
    catHousing: 'आवास एवं गृह निर्माण',
    catWomen: 'महिला कल्याण एवं स्वयं सहायता',
    catHealth: 'स्वास्थ्य एवं बीमा',
    catPension: 'पेंशन एवं वरिष्ठ नागरिक',
    catDisability: 'दिव्यांगजन कल्याण',
    catBusiness: 'व्यापार एवं सूक्ष्म ऋण',
    catEmployment: 'श्रमिक एवं रोजगार',
    catGeneral: 'सामान्य कल्याण',

    profileHeading: 'नागरिक प्रोफ़ाइल',
    profileSubheading: 'सटीक योजनाओं की खोज के लिए अपनी जानकारी दर्ज करें।',
    fullNameLabel: 'पूरा नाम',
    ageLabel: 'आयु',
    genderLabel: 'लिंग',
    stateLabel: 'राज्य',
    districtLabel: 'जिला',
    occupationLabel: 'मुख्य व्यवसाय',
    annualIncomeLabel: 'वार्षिक पारिवारिक आय',
    primaryNeedLabel: 'प्राथमिक आवश्यकता',

    privacyNotice: 'आपकी जानकारी केवल सरकारी योजनाओं के मिलान के लिए सुरक्षित रखी जाती है।',
    verifiedOfficialBadge: 'आधिकारिक सत्यापित',
    offlineCenterNote: 'नजदीकी सीएससी या ई-सेवा केंद्र पर भी सहायता प्राप्त कर सकते हैं।',
  },

  ml: {
    navHome: 'ഹോം',
    navMatches: 'പദ്ധതികൾ',
    navSaved: 'സൂക്ഷിച്ചവ',
    navProfile: 'പ്രൊഫൈൽ',
    navSupport: 'സഹായം',

    appTitle: 'പാക്സ് സഹായക്',
    appTagline: 'സർക്കാർ ക്ഷേമപദ്ധതികൾ അറിയൂ, അവകാശങ്ങൾ നേടൂ',
    selectLanguage: 'ഭാഷ തിരഞ്ഞെടുക്കൂ',
    changeState: 'സംസ്ഥാനം മാറ്റുക',

    heroHeading: 'പദ്ധതികൾ കണ്ടെത്തുക',
    heroSubheading: 'നിങ്ങളുടെ തൊഴിലിനും വരുമാനത്തിനും അനുയോജ്യമായ സർക്കാർ പദ്ധതികൾ വേഗത്തിൽ കണ്ടെത്തൂ.',
    startVoiceBtn: 'ശബ്ദത്തിലൂടെ സംസാരിക്കൂ',
    browseCatalogBtn: 'എല്ലാ പദ്ധതികളും',
    checkEligibilityBtn: 'അർഹത പരിശോധിക്കൂ',

    matchesHeading: 'നിങ്ങൾക്ക് അനുയോജ്യമായ പദ്ധതികൾ',
    matchesSubheading: 'ഔദ്യോഗിക സർക്കാർ ഗസറ്റുകൾ അടിസ്ഥാനമാക്കി നിർണ്ണയിച്ചത്.',
    strongMatchesBadge: 'പൂർണ്ണ അർഹത',
    potentialMatchesBadge: 'സാധ്യതയുള്ള അർഹത',
    moreInfoBadge: 'കൂടുതൽ വിവരങ്ങൾ ആവശ്യമുണ്ട്',
    noMatchesFound: 'പദ്ധതികൾ ലഭ്യമല്ല',
    noMatchesDesc: 'പ്രൊഫൈൽ വിവരങ്ങൾ മാറ്റി വീണ്ടും ശ്രമിക്കുക.',

    continueBtn: 'തുടരുക',
    backBtn: 'പിന്നോട്ട്',
    submitBtn: 'സമർപ്പിക്കുക',
    saveBtn: 'സൂക്ഷിക്കുക',
    savedBtn: 'സൂക്ഷിച്ചു',
    shareBtn: 'പങ്കുവെക്കുക',
    viewDetailsBtn: 'വിശദവിവരങ്ങൾ',
    whyThisMatchesBtn: 'എന്തുകൊണ്ട് ചേരുന്നു?',
    explainSimplyBtn: 'ലളിത വിവരണം',
    callHelpBtn: 'ഹെൽപ്പ് ലൈൻ വിളിക്കുക',
    findNearbyCenterBtn: 'സമീപ അക്ഷയ കേന്ദ്രം',

    catAgriculture: 'കൃഷിയും കർഷക ക്ഷേമവും',
    catEducation: 'വിദ്യാഭ്യാസവും സ്കോളർഷിപ്പും',
    catHousing: 'ഭവന നിർമ്മാണം',
    catWomen: 'വനിതാ ക്ഷേമം',
    catHealth: 'ആരോഗ്യവും ഇൻഷുറൻസും',
    catPension: 'പെൻഷനും മുതിർന്ന പൗരന്മാരും',
    catDisability: 'ഭിന്നശേഷി ക്ഷേമം',
    catBusiness: 'ചെറുകിട വ്യവസായം & വായ്പ',
    catEmployment: 'തൊഴിലും തൊഴിലാളികളും',
    catGeneral: 'പൊതു ക്ഷേമം',

    profileHeading: 'പൗര പ്രൊഫൈൽ',
    profileSubheading: 'അർഹമായ പദ്ധതികൾ കൃത്യമായി കണ്ടെത്താൻ വിവരങ്ങൾ നൽകുക.',
    fullNameLabel: 'മുഴുവൻ പേര്',
    ageLabel: 'പ്രായം',
    genderLabel: 'ലിംഗഭേദം',
    stateLabel: 'സംസ്ഥാനം',
    districtLabel: 'ജില്ല',
    occupationLabel: 'തൊഴിൽ',
    annualIncomeLabel: 'വാർഷിക വരുമാനം',
    primaryNeedLabel: 'പ്രധാന ആവശ്യം',

    privacyNotice: 'നിങ്ങളുടെ വിവരങ്ങൾ സർക്കാർ പദ്ധതികൾ കണ്ടെത്താൻ മാത്രമാണ് ഉപയോഗിക്കുന്നത്.',
    verifiedOfficialBadge: 'ഔദ്യോഗികമായി പരിശോധിച്ചത്',
    offlineCenterNote: 'സമീപത്തുള്ള അക്ഷയ അല്ലെങ്കിൽ ഇ-സേവാ കേന്ദ്രം സന്ദർശിക്കുക.',
  },

  te: {
    navHome: 'హోమ్',
    navMatches: 'పథకాలు',
    navSaved: 'సేవ్ చేసినవి',
    navProfile: 'ప్రొఫైల్',
    navSupport: 'సహాయ కేంద్రం',

    appTitle: 'ప్యాక్స్ సహాయక్',
    appTagline: 'ప్రభుత్వ సంక్షేమ పథకాలను తెలుసుకోండి, ప్రయోజనాలు పొందండి',
    selectLanguage: 'భాషను ఎంచుకోండి',
    changeState: 'రాష్ట్రాన్ని మార్చండి',

    heroHeading: 'పథకాలను కనుగొనండి',
    heroSubheading: 'మీ వృత్తి మరియు అవసరాలకు తగిన ప్రభుత్వ పథకాలను వెంటనే కనుగొనండి.',
    startVoiceBtn: 'వాయిస్ ద్వారా అడగండి',
    browseCatalogBtn: 'అన్ని పథకాలు',
    checkEligibilityBtn: 'అర్హతను తనిఖీ చేయండి',

    matchesHeading: 'మీకు సరిపోయే ప్రభుత్వ పథకాలు',
    matchesSubheading: 'అధికారిక ప్రభుత్వ నిబంధనల ప్రకారం సరిపోల్చబడింది.',
    strongMatchesBadge: 'ప్రత్యక్ష అర్హత',
    potentialMatchesBadge: 'సంభావ్య అర్హత',
    moreInfoBadge: 'మరింత సమాచారం అవసరం',
    noMatchesFound: 'ఎలాంటి పథకాలు సరిపోలలేదు',
    noMatchesDesc: 'మీ ప్రొఫైల్ వివరాలను నవీకరించి మళ్లీ ప్రయత్నించండి.',

    continueBtn: 'కొనసాగించండి',
    backBtn: 'వెనుకకు',
    submitBtn: 'సమర్పించండి',
    saveBtn: 'సేవ్ చేయండి',
    savedBtn: 'సేవ్ చేయబడింది',
    shareBtn: 'భాగస్వామ్యం చేయండి',
    viewDetailsBtn: 'పూర్తి వివరాలు',
    whyThisMatchesBtn: 'ఎందుకు సరిపోతుంది?',
    explainSimplyBtn: 'సులభ వివరణ',
    callHelpBtn: 'హెల్ప్‌లైన్ కాల్ చేయండి',
    findNearbyCenterBtn: 'సమీప మీ-సేవా కేంద్రం',

    catAgriculture: 'వ్యవసాయం & రైతు సంక్షేమం',
    catEducation: 'విద్య & స్కాలర్‌షిప్‌లు',
    catHousing: 'గృహ నిర్మాణం',
    catWomen: 'మహిళా సంక్షేమం',
    catHealth: 'ఆరోగ్యం & బీమా',
    catPension: 'పెన్షన్ & వృద్ధుల సంక్షేమం',
    catDisability: 'దివ్యాంగుల సంక్షేమం',
    catBusiness: 'వ్యాపారం & రుణాలు',
    catEmployment: 'ఉపాధి & కార్మికులు',
    catGeneral: 'సాధారణ సంక్షేమం',

    profileHeading: 'పౌరుల ప్రొఫైల్',
    profileSubheading: 'సరైన పథకాలను కనుగొనడానికి ప్రాథమిక వివరాలను నమోదు చేయండి.',
    fullNameLabel: 'పూర్తి పేరు',
    ageLabel: 'వయస్సు',
    genderLabel: 'లింగం',
    stateLabel: 'రాష్ట్రం',
    districtLabel: 'జిల్లా',
    occupationLabel: 'ప్రధాన వృత్తి',
    annualIncomeLabel: 'వార్షిక ఆదాయం',
    primaryNeedLabel: 'ప్రధాన అవసరం',

    privacyNotice: 'మీ వివరాలు కేవలం పథకాల అర్హత తనిఖీకి మాత్రమే ఉపయోగించబడతాయి.',
    verifiedOfficialBadge: 'అధికారికంగా ధృవీకరించబడింది',
    offlineCenterNote: 'సమీపంలోని మీ-సేవా కేంద్రాన్ని కూడా సంప్రదించవచ్చు.',
  },

  kn: {
    navHome: 'ಮುಖಪುಟ',
    navMatches: 'ಯೋಜನೆಗಳು',
    navSaved: 'ಉಳಿಸಿದವು',
    navProfile: 'ಪ್ರೊಫೈಲ್',
    navSupport: 'ಸಹಾಯ ಕೇಂದ್ರ',

    appTitle: 'ಪ್ಯಾಕ್ಸ್ ಸಹಾಯಕ',
    appTagline: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತಿಳಿಯಿರಿ, ಸೌಲಭ್ಯಗಳನ್ನು ಪಡೆಯಿರಿ',
    selectLanguage: 'ಭಾಷೆ ಆಯ್ಕೆಮಾಡಿ',
    changeState: 'ರಾಜ್ಯ ಬದಲಾಯಿಸಿ',

    heroHeading: 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ',
    heroSubheading: 'ನಿಮ್ಮ ಉದ್ಯೋಗ ಮತ್ತು ಕುಟುಂಬದ ಅಗತ್ಯಕ್ಕೆ ತಕ್ಕ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತಕ್ಷಣ ಕಂಡುಕೊಳ್ಳಿ.',
    startVoiceBtn: 'ಧ್ವನಿಯ ಮೂಲಕ ಮಾತನಾಡಿ',
    browseCatalogBtn: 'ಎಲ್ಲಾ ಯೋಜನೆಗಳು',
    checkEligibilityBtn: 'ಅರ್ಹತೆ ಪರಿಶೀಲಿಸಿ',

    matchesHeading: 'ನಿಮಗೆ ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳು',
    matchesSubheading: 'ಅಧಿಕೃತ ಸರ್ಕಾರಿ ಆದೇಶಗಳ ಆಧಾರದಲ್ಲಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ.',
    strongMatchesBadge: 'ನೇರ ಅರ್ಹತೆ',
    potentialMatchesBadge: 'ಸಾಧ್ಯವಿರುವ ಅರ್ಹತೆ',
    moreInfoBadge: 'ಹೆಚ್ಚಿನ ಮಾಹಿತಿ ಅಗತ್ಯ',
    noMatchesFound: 'ಯಾವುದೇ ಯೋಜನೆಗಳು ಹೊಂದಾಣಿಕೆಯಾಗಿಲ್ಲ',
    noMatchesDesc: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಬದಲಾಯಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',

    continueBtn: 'ಮುಂದುವರಿಸಿ',
    backBtn: 'ಹಿಂದಕ್ಕೆ',
    submitBtn: 'ಸಲ್ಲಿಸಿ',
    saveBtn: 'ಉಳಿಸಿ',
    savedBtn: 'ಉಳಿಸಲಾಗಿದೆ',
    shareBtn: 'ಹಂಚಿಕೊಳ್ಳಿ',
    viewDetailsBtn: 'ಸಂಪೂರ್ಣ ವಿವರಗಳು',
    whyThisMatchesBtn: 'ಏಕೆ ಹೊಂದಾಣಿಕೆಯಾಗಿದೆ?',
    explainSimplyBtn: 'ಸರಳ ವಿವರಣೆ',
    callHelpBtn: 'ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ',
    findNearbyCenterBtn: 'ಹತ್ತಿರದ ಗ್ರಾಮ್ ಒನ್ ಕೇಂದ್ರ',

    catAgriculture: 'ಕೃಷಿ ಮತ್ತು ರೈತ ಕಲ್ಯಾಣ',
    catEducation: 'ಶಿಕ್ಷಣ ಮತ್ತು ವಿದ್ಯಾರ್ಥಿವೇತನ',
    catHousing: 'ವಸತಿ ಯೋಜನೆಗಳು',
    catWomen: 'ಮಹಿಳಾ ಕಲ್ಯಾಣ',
    catHealth: 'ಆರೋಗ್ಯ ಮತ್ತು ವಿಮೆ',
    catPension: 'ಪಿಂಚಣಿ ಮತ್ತು ಹಿರಿಯ ನಾಗರಿಕರು',
    catDisability: 'ವಿಕಲಚೇತನರ ಕಲ್ಯಾಣ',
    catBusiness: 'ವ್ಯಾಪಾರ ಮತ್ತು ಕಿರು ಸಾಲ',
    catEmployment: 'ಕಾರ್ಮಿಕ ಮತ್ತು ಉದ್ಯೋಗ',
    catGeneral: 'ಸಾಮಾನ್ಯ ಕಲ್ಯಾಣ',

    profileHeading: 'ನಾಗರಿಕ ಪ್ರೊಫೈಲ್',
    profileSubheading: 'ನಿಖರ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ನಿಮ್ಮ ಪ್ರಾಥಮಿಕ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ.',
    fullNameLabel: 'ಪೂರ್ಣ ಹೆಸರು',
    ageLabel: 'ವಯಸ್ಸು',
    genderLabel: 'ಲಿಂಗ',
    stateLabel: 'ರಾಜ್ಯ',
    districtLabel: 'ಜಿಲ್ಲೆ',
    occupationLabel: 'ಮುಖ್ಯ ಉದ್ಯೋಗ',
    annualIncomeLabel: 'ವಾರ್ಷಿಕ ಆದಾಯ',
    primaryNeedLabel: 'ಮುಖ್ಯ ಅಗತ್ಯ',

    privacyNotice: 'ನಿಮ್ಮ ಮಾಹಿತಿಯನ್ನು ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಪರಿಶೀಲಿಸಲು ಮಾತ್ರ ಬಳಸಲಾಗುತ್ತದೆ.',
    verifiedOfficialBadge: 'ಅಧಿಕೃತವಾಗಿ ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    offlineCenterNote: 'ಹತ್ತಿರದ ಗ್ರಾಮ ಒನ್ ಅಥವಾ ಬೆಂಗಳೂರು ಒನ್ ಕೇಂದ್ರಕ್ಕೆ ಭೇಟಿ ನೀಡಿ.',
  },

  bn: {
    navHome: 'হোম',
    navMatches: 'প্রকল্পসমূহ',
    navSaved: 'সংরক্ষিত',
    navProfile: 'প্রোফাইল',
    navSupport: 'সহায়তা কেন্দ্র',

    appTitle: 'প্যাক্স সহায়ক',
    appTagline: 'সরকারি প্রকল্প জানুন, অধিকার বুঝে নিন',
    selectLanguage: 'ভাষা নির্বাচন করুন',
    changeState: 'রাজ্য পরিবর্তন করুন',

    heroHeading: 'প্রকল্প খুঁজুন',
    heroSubheading: 'আপনার পেশা ও পারিবারিক প্রয়োজন অনুযায়ী সরকারি প্রকল্প দ্রুত খুঁজে পান।',
    startVoiceBtn: 'কণ্ঠস্বরে কথা বলুন',
    browseCatalogBtn: 'সকল প্রকল্প',
    checkEligibilityBtn: 'যোগ্যতা যাচাই করুন',

    matchesHeading: 'আপনার উপযোগী সরকারি প্রকল্প',
    matchesSubheading: 'অফিসিয়াল সরকারি নিয়ম অনুযায়ী যাচাইকৃত।',
    strongMatchesBadge: 'সরাসরি যোগ্য',
    potentialMatchesBadge: 'সম্ভাব্য যোগ্য',
    moreInfoBadge: 'অতিরিক্ত তথ্য প্রয়োজন',
    noMatchesFound: 'কোনো প্রকল্প পাওয়া যায়নি',
    noMatchesDesc: 'অনুগ্রহ করে আপনার প্রোফাইল তথ্য পরিবর্তন করে পুনরায় চেষ্টা করুন।',

    continueBtn: 'এগিয়ে যান',
    backBtn: 'পিছনে যান',
    submitBtn: 'জমা দিন',
    saveBtn: 'সংরক্ষণ করুন',
    savedBtn: 'সংরক্ষিত',
    shareBtn: 'শেয়ার করুন',
    viewDetailsBtn: 'সম্পূর্ণ বিবরণ',
    whyThisMatchesBtn: 'কেন উপযুক্ত?',
    explainSimplyBtn: 'সহজ ভাষায় ব্যাখ্যা',
    callHelpBtn: 'হেল্পলাইনে কল করুন',
    findNearbyCenterBtn: 'নিকটবর্তী তথ্যমিত্র কেন্দ্র',

    catAgriculture: 'কৃষি ও কৃষক কল্যাণ',
    catEducation: 'শিক্ষা ও স্কলারশিপ',
    catHousing: 'আবাসন প্রকল্প',
    catWomen: 'নারী কল্যাণ ও স্বনির্ভরতা',
    catHealth: 'স্বাস্থ্য ও বীমা',
    catPension: 'পেনশন ও প্রবীণ নাগরিক',
    catDisability: 'প্রতিবন্ধী কল্যাণ',
    catBusiness: 'ক্ষুদ্র ব্যবসা ও ঋণ',
    catEmployment: 'শ্রমিক ও কর্মসংস্থান',
    catGeneral: 'সাধারণ কল্যাণ',

    profileHeading: 'নাগরিক প্রোফাইল',
    profileSubheading: 'সঠিক প্রকল্প পেতে আপনার মৌলিক তথ্য প্রদান করুন।',
    fullNameLabel: 'সম্পূর্ণ নাম',
    ageLabel: 'বয়স',
    genderLabel: 'লিঙ্গ',
    stateLabel: 'রাজ্য',
    districtLabel: 'জেলা',
    occupationLabel: 'প্রধান পেশা',
    annualIncomeLabel: 'বার্ষিক আয়',
    primaryNeedLabel: 'প্রধান প্রয়োজন',

    privacyNotice: 'আপনার তথ্য কেবল সরকারি প্রকল্প যাচাইয়ের জন্যই সুরক্ষিত রাখা হয়।',
    verifiedOfficialBadge: 'অফিসিয়ালি যাচাইকৃত',
    offlineCenterNote: 'নিকটবর্তী বাংলা সহায়তা কেন্দ্রেও সাহায্য পেতে পারেন।',
  },

  mr: {
    navHome: 'मुख्यपृष्ठ',
    navMatches: 'पात्र योजना',
    navSaved: 'जतन केलेल्या',
    navProfile: 'माहिती',
    navSupport: 'मदत केंद्र',

    appTitle: 'पॅक्स सहायक',
    appTagline: 'सरकारी योजना जाणून घ्या, हक्क मिळवा',
    selectLanguage: 'भाषा निवडा',
    changeState: 'राज्य बदला',

    heroHeading: 'योजना शोधा',
    heroSubheading: 'आपल्या व्यवसायानुसार आणि गरजेनुसार योग्य सरकारी योजना त्वरित शोधा.',
    startVoiceBtn: 'आवाजाद्वारे विचारा',
    browseCatalogBtn: 'सर्व योजना',
    checkEligibilityBtn: 'पात्रता तपासा',

    matchesHeading: 'आपल्यासाठी योग्य योजना',
    matchesSubheading: 'शासकीय नियमांनुसार पडताळणी केलेली.',
    strongMatchesBadge: 'थेट पात्रता',
    potentialMatchesBadge: 'संभाव्य पात्रता',
    moreInfoBadge: 'अधिक माहिती आवश्यक',
    noMatchesFound: 'कोणतीही योजना जुळली नाही',
    noMatchesDesc: 'कृपया प्रोफाइल माहिती बदलून पुन्हा प्रयत्न करा.',

    continueBtn: 'पुढे जा',
    backBtn: 'मागे जा',
    submitBtn: 'सादर करा',
    saveBtn: 'जतन करा',
    savedBtn: 'जतन केले',
    shareBtn: 'शेअर करा',
    viewDetailsBtn: 'सविस्तर माहिती',
    whyThisMatchesBtn: 'का योग्य आहे?',
    explainSimplyBtn: 'सोप्या भाषेत माहिती',
    callHelpBtn: 'हेल्पलाइनवर कॉल करा',
    findNearbyCenterBtn: 'जवळचे आपले सरकार केंद्र',

    catAgriculture: 'शेती व शेतकरी कल्याण',
    catEducation: 'शिक्षण व शिष्यवृत्ती',
    catHousing: 'घरकुल योजना',
    catWomen: 'महिला कल्याण व बचत गट',
    catHealth: 'आरोग्य व विमा',
    catPension: 'पेन्शन व ज्येष्ठ नागरिक',
    catDisability: 'दिव्यांग कल्याण',
    catBusiness: 'व्यवसाय व कर्ज सहाय्य',
    catEmployment: 'कामगार व रोजगार',
    catGeneral: 'सर्वसाधारण कल्याण',

    profileHeading: 'नागरिक प्रोफाइल',
    profileSubheading: 'अचूक योजना शोधण्यासाठी प्राथमिक माहिती भरा.',
    fullNameLabel: 'पूर्ण नाव',
    ageLabel: 'वय',
    genderLabel: 'लिंग',
    stateLabel: 'राज्य',
    districtLabel: 'जिल्हा',
    occupationLabel: 'मुख्य व्यवसाय',
    annualIncomeLabel: 'वार्षिक उत्पन्न',
    primaryNeedLabel: 'मुख्य गरज',

    privacyNotice: 'आपली माहिती केवळ सरकारी योजना तपासण्यासाठी सुरक्षित वापरली जाते.',
    verifiedOfficialBadge: 'शासकीय पडताळणीकृत',
    offlineCenterNote: 'जवळच्या आपले सरकार सेवा केंद्रात मदत मिळवा.',
  },

  gu: {
    navHome: 'મુખ્યપૃષ્ઠ',
    navMatches: 'યોજનાઓ',
    navSaved: 'સાચવેલી',
    navProfile: 'પ્રોફાઇલ',
    navSupport: 'સહાય કેન્દ્ર',

    appTitle: 'પેક્સ સહાયક',
    appTagline: 'સરકારી યોજનાઓ જાણો, અધિકારો મેળવો',
    selectLanguage: 'ભાષા પસંદ કરો',
    changeState: 'રાજ્ય બદલો',

    heroHeading: 'યોજનાઓ શોધો',
    heroSubheading: 'તમારા વ્યવસાય અને પારિવારિક જરૂરિયાત મુજબ સરકારી યોજનાઓ તાત્કાલિક મેળવો.',
    startVoiceBtn: 'અવાજથી પૂછો',
    browseCatalogBtn: 'બધી યોજનાઓ',
    checkEligibilityBtn: 'પાત્રતા ચકાસો',

    matchesHeading: 'તમારા માટે યોગ્ય યોજનાઓ',
    matchesSubheading: 'સરકારી નિયમો મુજબ તૈયાર કરેલી.',
    strongMatchesBadge: 'સીધી પાત્રતા',
    potentialMatchesBadge: 'સંભવિત પાત્રતા',
    moreInfoBadge: 'વધુ વિગત જરૂરી',
    noMatchesFound: 'કોઈ યોજના મળી નથી',
    noMatchesDesc: 'પ્રોફાઇલ વિગતો બદલીને ફરી પ્રયાસ કરો.',

    continueBtn: 'આગળ વધો',
    backBtn: 'પાછા જાઓ',
    submitBtn: 'સબમિટ કરો',
    saveBtn: 'સાચવો',
    savedBtn: 'સાચવેલ છે',
    shareBtn: 'શેર કરો',
    viewDetailsBtn: 'સંપૂર્ણ વિગત',
    whyThisMatchesBtn: 'કેમ યોગ્ય છે?',
    explainSimplyBtn: 'સરળ ભાષામાં વિગત',
    callHelpBtn: 'હેલ્પલાઇન કોલ કરો',
    findNearbyCenterBtn: 'નજીકનું ઈ-ગ્રામ કેન્દ્ર',

    catAgriculture: 'ખેતી અને ખેડૂત કલ્યાણ',
    catEducation: 'શિક્ષણ અને શિષ્યવૃત્તિ',
    catHousing: 'આવાસ યોજના',
    catWomen: 'મહિલા કલ્યાણ',
    catHealth: 'આરોગ્ય અને વીમો',
    catPension: 'પેન્શન અને વરિષ્ઠ નાગરિક',
    catDisability: 'દિવ્યાંગ કલ્યાણ',
    catBusiness: 'વેપાર અને લોન સહાય',
    catEmployment: 'શ્રમિક અને રોજગાર',
    catGeneral: 'સામાન્ય કલ્યાણ',

    profileHeading: 'નાગરિક પ્રોફાઇલ',
    profileSubheading: 'યોગ્ય યોજનાઓ શોધવા માટે પ્રાથમિક વિગતો ભરો.',
    fullNameLabel: 'પૂરું નામ',
    ageLabel: 'ઉંમર',
    genderLabel: 'જાતિ',
    stateLabel: 'રાજ્ય',
    districtLabel: 'જિલ્લો',
    occupationLabel: 'મુખ્ય વ્યવસાય',
    annualIncomeLabel: 'વાર્ષિક આવક',
    primaryNeedLabel: 'મુખ્ય જરૂરિયાત',

    privacyNotice: 'તમારી માહિતી માત્ર સરકારી યોજના ચકાસવા માટે વપરાય છે.',
    verifiedOfficialBadge: 'અધિકૃત ચકાસાયેલ',
    offlineCenterNote: 'નજીકના ઈ-ગ્રામ અથવા જન સેવા કેન્દ્ર પર સંપર્ક કરો.',
  },

  or: {
    navHome: 'ମୁଖ୍ୟପୃଷ୍ଠା',
    navMatches: 'ଯୋଜନାସମୂହ',
    navSaved: 'ସାଇତା ଯାଇଥିବା',
    navProfile: 'ପ୍ରୋଫାଇଲ୍',
    navSupport: 'ସହାୟତା କେନ୍ଦ୍ର',

    appTitle: 'ପ୍ୟାକ୍ସ ସହାୟକ',
    appTagline: 'ସରକାରୀ ଯୋଜନା ଜାଣନ୍ତୁ, ଅଧିକାର ପାଆନ୍ତୁ',
    selectLanguage: 'ଭାଷା ବାଛନ୍ତୁ',
    changeState: 'ରାଜ୍ୟ ବଦଳାନ୍ତୁ',

    heroHeading: 'ଯୋଜନା ଖୋଜନ୍ତୁ',
    heroSubheading: 'ଆପଣଙ୍କ ବୃତ୍ତି ଓ ପରିବାରର ଆବଶ୍ୟକତା ଅନୁଯାୟୀ ସରକାରୀ ଯୋଜନା ତୁରନ୍ତ ଖୋଜନ୍ତୁ।',
    startVoiceBtn: 'ସ୍ୱର ମାଧ୍ୟମରେ କଥା ହୁଅନ୍ତୁ',
    browseCatalogBtn: 'ସମସ୍ତ ଯୋଜନା',
    checkEligibilityBtn: 'ଯୋଗ୍ୟତା ଯାଞ୍ଚ କରନ୍ତୁ',

    matchesHeading: 'ଆପଣଙ୍କ ପାଇଁ ଉପଯୁକ୍ତ ଯୋଜନା',
    matchesSubheading: 'ସରକାରୀ ନିୟମ ଅନୁସାରେ ଯାଞ୍ଚ କରାଯାଇଛି।',
    strongMatchesBadge: 'ପୂର୍ଣ୍ଣ ଯୋଗ୍ୟ',
    potentialMatchesBadge: 'ସମ୍ଭାବ୍ୟ ଯୋଗ୍ୟ',
    moreInfoBadge: 'ଅଧିକ ସୂଚନା ଆବଶ୍ୟକ',
    noMatchesFound: 'କୌଣସି ଯୋଜନା ମିଳିଲା ନାହିଁ',
    noMatchesDesc: 'ପ୍ରୋଫାଇଲ୍ ବିବରଣୀ ପରିବର୍ତ୍ତନ କରି ପୁନର୍ବାର ଚେଷ୍ଟା କରନ୍ତୁ।',

    continueBtn: 'ଆଗକୁ ବଢ଼ନ୍ତୁ',
    backBtn: 'ପଛକୁ ଫେରନ୍ତୁ',
    submitBtn: 'ଦାଖଲ କରନ୍ତୁ',
    saveBtn: 'ସାଇତନ୍ତୁ',
    savedBtn: 'ସାଇତା ହୋଇଛି',
    shareBtn: 'ସେୟାର କରନ୍ତୁ',
    viewDetailsBtn: 'ସମ୍ପୂର୍ଣ୍ଣ ବିବରଣୀ',
    whyThisMatchesBtn: 'କାହିଁକି ଉପଯୁକ୍ତ?',
    explainSimplyBtn: 'ସରଳ ବୁଝାମଣା',
    callHelpBtn: 'ହେଲ୍ପଲାଇନ କଲ୍ କରନ୍ତୁ',
    findNearbyCenterBtn: 'ନିକଟସ୍ଥ ମୋ ସେବା କେନ୍ଦ୍ର',

    catAgriculture: 'କୃଷି ଓ କୃଷକ କଲ୍ୟାଣ',
    catEducation: 'ଶିକ୍ଷା ଓ ବୃତ୍ତି',
    catHousing: 'ଆବାସ ଯୋଜନା',
    catWomen: 'ମହିଳା କଲ୍ୟାଣ',
    catHealth: 'ସ୍ୱାସ୍ଥ୍ୟ ଓ ବୀମା',
    catPension: 'ପେନସନ ଓ ବରିଷ୍ଠ ନାଗରିକ',
    catDisability: 'ଦିବ୍ୟାଙ୍ଗ କଲ୍ୟାଣ',
    catBusiness: 'ବ୍ୟବସାୟ ଓ ଋଣ ସହାୟତା',
    catEmployment: 'ଶ୍ରମିକ ଓ ନିଯୁକ୍ତି',
    catGeneral: 'ସାଧାରଣ କଲ୍ୟାଣ',

    profileHeading: 'ନାଗରିକ ପ୍ରୋଫାଇଲ୍',
    profileSubheading: 'ସଠିକ୍ ଯୋଜନା ପାଇବା ପାଇଁ ମୌଳିକ ସୂଚନା ପ୍ରଦାନ କରନ୍ତୁ।',
    fullNameLabel: 'ପୂରା ନାମ',
    ageLabel: 'ବୟସ',
    genderLabel: 'ଲିଙ୍ଗ',
    stateLabel: 'ରାଜ୍ୟ',
    districtLabel: 'ଜିଲ୍ଲା',
    occupationLabel: 'ମୁଖ୍ୟ ବୃତ୍ତି',
    annualIncomeLabel: 'ବାର୍ଷିକ ଆୟ',
    primaryNeedLabel: 'ପ୍ରାଥମିକ ଆବଶ୍ୟକତା',

    privacyNotice: 'ଆପଣଙ୍କ ତଥ୍ୟ କେବଳ ଯୋଜନା ଯାଞ୍ଚ ପାଇଁ ବ୍ୟବହାର କରାଯାଏ।',
    verifiedOfficialBadge: 'ସରକାରୀ ଭାବେ ଯାଞ୍ଚ ହୋଇଛି',
    offlineCenterNote: 'ନିକଟସ୍ଥ ମୋ ସେବା କେନ୍ଦ୍ରରୁ ସହାୟତା ନିଅନ୍ତୁ।',
  },

  pa: {
    navHome: 'ਮੁੱਖ ਸਫ਼ਾ',
    navMatches: 'ਯੋਜਨਾਵਾਂ',
    navSaved: 'ਸੰਭਾਲੀਆਂ',
    navProfile: 'ਪ੍ਰੋਫਾਈਲ',
    navSupport: 'ਸਹਾਇਤਾ ਕੇਂਦਰ',

    appTitle: 'ਪੈਕਸ ਸਹਾਇਕ',
    appTagline: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਜਾਣੋ, ਲਾਭ ਪ੍ਰਾਪਤ ਕਰੋ',
    selectLanguage: 'ਭਾਸ਼ਾ ਚੁਣੋ',
    changeState: 'ਰਾਜ ਬਦਲੋ',

    heroHeading: 'ਸਕੀਮਾਂ ਲੱਭੋ',
    heroSubheading: 'ਆਪਣੇ ਕਿੱਤੇ ਅਤੇ ਪਰਿਵਾਰਕ ਲੋੜਾਂ ਅਨੁਸਾਰ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਤੁਰੰਤ ਲੱਭੋ।',
    startVoiceBtn: 'ਆਵਾਜ਼ ਰਾਹੀਂ ਪੁੱਛੋ',
    browseCatalogBtn: 'ਸਾਰੀਆਂ ਸਕੀਮਾਂ',
    checkEligibilityBtn: 'ਯੋਗਤਾ ਜਾਂਚੋ',

    matchesHeading: 'ਤੁਹਾਡੇ ਲਈ ਢੁਕਵੀਆਂ ਸਕੀਮਾਂ',
    matchesSubheading: 'ਸਰਕਾਰੀ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਪ੍ਰਮਾਣਿਤ।',
    strongMatchesBadge: 'ਸਿੱਧੀ ਯੋਗਤਾ',
    potentialMatchesBadge: 'ਸੰਭਾਵੀ ਯੋਗਤਾ',
    moreInfoBadge: 'ਹੋਰ ਜਾਣਕਾਰੀ ਦੀ ਲੋੜ',
    noMatchesFound: 'ਕੋਈ ਸਕੀਮ ਨਹੀਂ ਮਿਲੀ',
    noMatchesDesc: 'ਕਿਰਪਾ ਕਰਕੇ ਪ੍ਰੋਫਾਈਲ ਜਾਣਕਾਰੀ ਬਦਲ ਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।',

    continueBtn: 'ਅੱਗੇ ਵਧੋ',
    backBtn: 'ਪਿੱਛੇ ਜਾਓ',
    submitBtn: 'ਜਮ੍ਹਾਂ ਕਰੋ',
    saveBtn: 'ਸੰਭਾਲੋ',
    savedBtn: 'ਸੰਭਾਲਿਆ ਗਿਆ',
    shareBtn: 'ਸਾਂਝਾ ਕਰੋ',
    viewDetailsBtn: 'ਪੂਰਾ ਵੇਰਵਾ',
    whyThisMatchesBtn: 'ਇਹ ਕਿਉਂ ਢੁਕਵੀਂ ਹੈ?',
    explainSimplyBtn: 'ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਜਾਣਕਾਰੀ',
    callHelpBtn: 'ਹੈਲਪਲਾਈਨ ਕਾਲ ਕਰੋ',
    findNearbyCenterBtn: 'ਨੇੜਲਾ ਸੇਵਾ ਕੇਂਦਰ',

    catAgriculture: 'ਖੇਤੀਬਾੜੀ ਅਤੇ ਕਿਸਾਨ ਭਲਾਈ',
    catEducation: 'ਸਿੱਖਿਆ ਅਤੇ ਵਜ਼ੀਫ਼ੇ',
    catHousing: 'ਰਿਹਾਇਸ਼ੀ ਯੋਜਨਾਵਾਂ',
    catWomen: 'ਔਰਤ ਭਲਾਈ',
    catHealth: 'ਸਿਹਤ ਅਤੇ ਬੀਮਾ',
    catPension: 'ਪੈਨਸ਼ਨ ਅਤੇ ਸੀਨੀਅਰ ਸਿਟੀਜ਼ਨ',
    catDisability: 'ਦਿਵਿਆਂਗ ਭਲਾਈ',
    catBusiness: 'ਕਾਰੋਬਾਰ ਅਤੇ ਕਰਜ਼ਾ',
    catEmployment: 'ਮਜ਼ਦੂਰ ਅਤੇ ਰੋਜ਼ਗਾਰ',
    catGeneral: 'ਆਮ ਭਲਾਈ',

    profileHeading: 'ਨਾਗਰਿਕ ਪ੍ਰੋਫਾਈਲ',
    profileSubheading: 'ਸਹੀ ਸਕੀਮਾਂ ਲੱਭਣ ਲਈ ਆਪਣੀ ਮੁੱਢਲੀ ਜਾਣਕਾਰੀ ਭਰੋ।',
    fullNameLabel: 'ਪੂਰਾ ਨਾਮ',
    ageLabel: 'ਉਮਰ',
    genderLabel: 'ਲਿੰਗ',
    stateLabel: 'ਰਾਜ',
    districtLabel: 'ਜ਼ਿਲ੍ਹਾ',
    occupationLabel: 'ਮੁੱਖ ਕੰਮ',
    annualIncomeLabel: 'ਸਾਲਾਨਾ ਆਮਦਨ',
    primaryNeedLabel: 'ਮੁੱਖ ਲੋੜ',

    privacyNotice: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਸਿਰਫ਼ ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਜਾਂਚ ਲਈ ਵਰਤੀ ਜਾਂਦੀ ਹੈ।',
    verifiedOfficialBadge: 'ਸਰਕਾਰੀ ਤਸਦੀਕਸ਼ੁਦਾ',
    offlineCenterNote: 'ਨੇੜਲੇ ਸੁਵਿਧਾ ਜਾਂ ਸੇਵਾ ਕੇਂਦਰ ਵਿੱਚ ਵੀ ਸਹਾਇਤਾ ਪ੍ਰਾਪਤ ਕਰੋ।',
  },

  as: {
    navHome: 'ঘৰ',
    navMatches: 'আঁচনিসমূহ',
    navSaved: 'সংৰক্ষিত',
    navProfile: 'প্ৰফাইল',
    navSupport: 'সহায়তা কেন্দ্ৰ',

    appTitle: 'পেক্স সহায়ক',
    appTagline: 'চৰকাৰী আঁচনি জানক, সুবিধা লাভ কৰক',
    selectLanguage: 'ভাষা বাছক',
    changeState: 'ৰাজ্য সলনি কৰক',

    heroHeading: 'আঁচনি বিচাৰক',
    heroSubheading: 'আপোনাৰ বৃত্তি আৰু প্ৰয়োজন অনুসৰি চৰকাৰী আঁচনি তাৎক্ষণিকভাৱে বিচাৰি উলিয়াওক।',
    startVoiceBtn: 'কণ্ঠৰে কথা পাতক',
    browseCatalogBtn: 'সকলো আঁচনি',
    checkEligibilityBtn: 'যোগ্যতা পৰীক্ষা কৰক',

    matchesHeading: 'আপোনাৰ বাবে উপযুক্ত আঁচনি',
    matchesSubheading: 'চৰকাৰী নিয়মৰ ভিত্তিত নিৰ্ধাৰণ কৰা হৈছে।',
    strongMatchesBadge: 'প্ৰত্যক্ষ যোগ্যতা',
    potentialMatchesBadge: 'সম্ভাব্য যোগ্যতা',
    moreInfoBadge: 'অধিক তথ্য প্ৰয়োজন',
    noMatchesFound: 'কোনো আঁচনি পোৱা নগ’ল',
    noMatchesDesc: 'অনুগ্ৰহ কৰি প্ৰফাইল তথ্য সলনি কৰি পুনৰ চেষ্টা কৰক।',

    continueBtn: 'আগবাঢ়ক',
    backBtn: 'উভতি যাওক',
    submitBtn: 'দাখিল কৰক',
    saveBtn: 'সংৰক্ষণ কৰক',
    savedBtn: 'সংৰক্ষিত হ’ল',
    shareBtn: 'শ্বেয়াৰ কৰক',
    viewDetailsBtn: 'সম্পূৰ্ণ বিৱৰণ',
    whyThisMatchesBtn: 'কিয় উপযুক্ত?',
    explainSimplyBtn: 'সহজ ভাষাত বুজক',
    callHelpBtn: 'হেল্পলাইনলৈ কল কৰক',
    findNearbyCenterBtn: 'ওচৰৰ অৰুণোদয় কেন্দ্ৰ',

    catAgriculture: 'কৃষি আৰু কৃষক কল্যাণ',
    catEducation: 'শিক্ষা আৰু ছাত্ৰবৃত্তি',
    catHousing: 'আবাসিক আঁচনি',
    catWomen: 'মহিলা কল্যাণ',
    catHealth: 'স্বাস্থ্য আৰু বীমা',
    catPension: 'পেঞ্চন আৰু জ্যেষ্ঠ নাগৰিক',
    catDisability: 'দিব্যাংগ কল্যাণ',
    catBusiness: 'ব্যৱসায় আৰু ঋণ',
    catEmployment: 'শ্ৰমিক আৰু কৰ্মসংস্থাপন',
    catGeneral: 'সাধাৰণ কল্যাণ',

    profileHeading: 'নাগৰিক প্ৰফাইল',
    profileSubheading: 'সঠিক আঁচনি লাভ কৰিবলৈ তথ্য প্ৰদান কৰক।',
    fullNameLabel: 'সম্পূৰ্ণ নাম',
    ageLabel: 'বয়স',
    genderLabel: 'লিংগ',
    stateLabel: 'ৰাজ্য',
    districtLabel: 'জিলা',
    occupationLabel: 'প্ৰধান বৃত্তি',
    annualIncomeLabel: 'বাৰ্ষিক আয়',
    primaryNeedLabel: 'প্ৰধান প্ৰয়োজন',

    privacyNotice: 'আপোনাৰ তথ্য কেৱল আঁচনি বিচৰাৰ বাবেহে ব্যৱহাৰ কৰা হয়।',
    verifiedOfficialBadge: 'চৰকাৰীভাৱে পৰীক্ষিত',
    offlineCenterNote: 'ওচৰৰ অৰুণোদয় বা চিএছচি কেন্দ্ৰতো সহায় পাব।',
  },

  en: {
    navHome: 'Home',
    navMatches: 'Matches',
    navSaved: 'Saved',
    navProfile: 'Profile',
    navSupport: 'Support',

    appTitle: 'PACS Sahayak',
    appTagline: 'Know your welfare schemes. Claim your entitlements.',
    selectLanguage: 'Select Language',
    changeState: 'Change State',

    heroHeading: 'Find Schemes',
    heroSubheading: 'Instantly discover official government benefits tailored to your profession and family needs.',
    startVoiceBtn: 'Talk with Voice Assistant',
    browseCatalogBtn: 'Browse Schemes',
    checkEligibilityBtn: 'Check Eligibility',

    matchesHeading: 'Matching Government Schemes',
    matchesSubheading: 'Evaluated against published official government gazettes.',
    strongMatchesBadge: 'Strong Match',
    potentialMatchesBadge: 'Potential Match',
    moreInfoBadge: 'More Info Needed',
    noMatchesFound: 'No Matching Schemes Found',
    noMatchesDesc: 'Try adjusting your profile parameters or explore the full catalog.',

    continueBtn: 'Continue',
    backBtn: 'Back',
    submitBtn: 'Submit',
    saveBtn: 'Save',
    savedBtn: 'Saved',
    shareBtn: 'Share',
    viewDetailsBtn: 'View Details',
    whyThisMatchesBtn: 'Why This Matches?',
    explainSimplyBtn: 'Plain Explanation',
    callHelpBtn: 'Call Helpline',
    findNearbyCenterBtn: 'Find Nearby e-Seva Center',

    catAgriculture: 'Agriculture & Farmers',
    catEducation: 'Education & Scholarships',
    catHousing: 'Housing & Shelter',
    catWomen: 'Women & Self-Help',
    catHealth: 'Health & Insurance',
    catPension: 'Pensions & Senior Citizens',
    catDisability: 'Disability Welfare',
    catBusiness: 'Small Business & Loans',
    catEmployment: 'Workers & Employment',
    catGeneral: 'General Welfare',

    profileHeading: 'Citizen Profile',
    profileSubheading: 'Enter your basic details to find deterministic government entitlement matches.',
    fullNameLabel: 'Full Name',
    ageLabel: 'Age',
    genderLabel: 'Gender',
    stateLabel: 'State',
    districtLabel: 'District',
    occupationLabel: 'Primary Occupation',
    annualIncomeLabel: 'Annual Household Income',
    primaryNeedLabel: 'Primary Need',

    privacyNotice: 'Your details are processed strictly to match published official gazette criteria.',
    verifiedOfficialBadge: 'Official Verified',
    offlineCenterNote: 'Citizens without internet can visit nearby CSC or e-Seva centers.',
  },
};

export function getUITranslations(langId: string): AppTranslationStrings {
  const normalized = (langId || 'en').toLowerCase().split('-')[0].split('_')[0];
  const strings = UI_TRANSLATIONS[normalized] || UI_TRANSLATIONS[langId] || UI_TRANSLATIONS['en'];
  return {
    ...strings,
    whyMe: strings.whyThisMatchesBtn,
    simplifiedSummary: strings.explainSimplyBtn,
    createProfile: strings.profileHeading,
    createProfileNotice: strings.privacyNotice,
  };
}

export function getDualText(key: keyof AppTranslationStrings, langId: string): DualText {
  const normalized = (langId || 'en').toLowerCase().split('-')[0].split('_')[0];
  const native = UI_TRANSLATIONS[normalized]?.[key] || UI_TRANSLATIONS[langId]?.[key] || UI_TRANSLATIONS['en'][key];
  const en = UI_TRANSLATIONS['en'][key];
  return { native, en };
}

