import { TranslationDictionary } from './types';

export const hi: TranslationDictionary = {
  // Navigation
  'nav.home': 'होम',
  'nav.matches': 'पात्र योजनाएं',
  'nav.saved': 'सहेजी गई',
  'nav.profile': 'प्रोफ़ाइल',
  'nav.voice': 'वॉइस सहायता',
  'nav.support': 'सहायता केंद्र',

  // Header & Brand
  'header.title': 'पैक्स सहायक',
  'header.tagline': 'सरकारी योजनाओं को जानें, अपने अधिकार पाएं',
  'header.createProfile': 'प्रोफ़ाइल बनाएं',
  'header.selectLanguage': 'भाषा चुनें',
  'header.changeState': 'राज्य बदलें',

  // Home Screen
  'home.heroTitle': 'सरकारी योजनाएं खोजें',
  'home.heroSubtitle': 'अपने व्यवसाय, परिवार और वित्तीय स्थिति के अनुसार सरकारी कल्याणकारी योजनाओं का तुरंत पता लगाएं।',
  'home.startVoiceBtn': 'आवाज़ से बात करें',
  'home.talkToAssistant': 'एआई सहायक से बात करें',
  'home.browseCatalog': 'सभी योजनाएं देखें',
  'home.checkEligibility': 'पात्रता जांचें',
  'home.quickNeedsHeading': 'त्वरित आवश्यकताएं',
  'home.quickNeedsSubtitle': 'विशिष्ट नागरिक श्रेणी के अनुसार कल्याणकारी योजनाओं को देखें',
  'home.matchesNotice': 'सरकारी योजनाएं आपकी प्रोफ़ाइल से मेल खाती हैं।',
  'home.viewMatches': 'योजनाएं देखें',
  'home.createProfileNotice': 'अपनी योग्य योजनाएं जानने के लिए प्रोफ़ाइल पूरी करें।',

  // Categories
  'category.agriculture': 'कृषि एवं किसान कल्याण',
  'category.education': 'शिक्षा एवं छात्रवृत्ति',
  'category.housing': 'आवास एवं भूमि',
  'category.employment': 'रोजगार एवं श्रमिक',
  'category.women': 'महिला कल्याण एवं स्वयं सहायता',
  'category.senior': 'वरिष्ठ नागरिक एवं पेंशन',
  'category.health': 'स्वास्थ्य एवं चिकित्सा बीमा',
  'category.financial': 'वित्तीय सहायता एवं ऋण',
  'category.disability': 'दिव्यांगजन कल्याण',
  'category.general': 'सामान्य कल्याण',

  // Professions
  'profession.farmer': 'किसान / कृषक',
  'profession.student': 'छात्र / विद्यार्थी',
  'profession.worker': 'श्रमिक / मजदूर',
  'profession.business': 'व्यापारी / व्यवसायी',
  'profession.homemaker': 'गृहिणी',
  'profession.senior': 'वरिष्ठ नागरिक',
  'profession.pwd': 'दिव्यांगजन',

  // Profile Form & Questions
  'profile.title': 'नागरिक प्रोफ़ाइल',
  'profile.subtitle': 'सटीक योजनाएं खोजने के लिए अपनी बुनियादी जानकारी दर्ज करें।',
  'profile.step1': 'बुनियादी जानकारी',
  'profile.step2': 'व्यवसाय विवरण',
  'profile.step3': 'आवश्यकताएं एवं प्राथमिकताएं',
  'profile.fullName': 'पूरा नाम',
  'profile.age': 'आयु (वर्ष)',
  'profile.gender': 'लिंग',
  'profile.state': 'राज्य',
  'profile.district': 'जिला',
  'profile.occupation': 'मुख्य व्यवसाय',
  'profile.annualIncome': 'वार्षिक पारिवारिक आय (₹)',
  'profile.primaryNeed': 'मुख्य आवश्यकता',
  'profile.genderMale': 'पुरुष',
  'profile.genderFemale': 'महिला',
  'profile.genderOther': 'अन्य',
  'profile.saveProfile': 'प्रोफ़ाइल सहेजें एवं योजनाएं देखें',

  // Matches Screen
  'matches.title': 'पात्र सरकारी योजनाएं',
  'matches.subtitle': 'आधिकारिक सरकारी राजपत्रों एवं नियमों के आधार पर जांची गई।',
  'matches.filterAll': 'सभी योजनाएं',
  'matches.filterStrong': 'पूर्ण पात्र',
  'matches.filterPotential': 'संभावित पात्र',
  'matches.filterMoreInfo': 'अधिक जानकारी आवश्यक',
  'matches.searchPlaceholder': 'योजना का नाम, विभाग या लाभ खोजें...',
  'matches.emptyTitle': 'कोई मेल खाती योजना नहीं मिली',
  'matches.emptySubtitle': 'नए मानदंडों के लिए अपनी प्रोफ़ाइल जानकारी अपडेट करें।',
  'matches.updateProfileBtn': 'प्रोफ़ाइल अपडेट करें',
  'matches.whyMatches': 'यह क्यों मेल खाती है?',
  'matches.viewDetails': 'विवरण देखें',

  // Saved Schemes & Checklist
  'saved.title': 'सहेजी गई योजनाएं एवं चेकलिस्ट',
  'saved.subtitle': 'ई-सेवा / सीएससी केंद्र में आवेदन के लिए तैयार आपकी पसंदीदा योजनाएं।',
  'saved.emptyTitle': 'अभी कोई योजना सहेजी नहीं गई',
  'saved.emptySubtitle': 'आवेदन चेकलिस्ट बनाने के लिए अपनी योजनाओं को बुकमार्क करें।',
  'saved.readinessTitle': 'दस्तावेज़ तैयारी की स्थिति',
  'saved.readinessSubtitle': 'अनिवार्य दस्तावेज़ सत्यापित',
  'saved.printBtn': 'आवेदन चेकलिस्ट प्रिंट करें',
  'saved.discoverBtn': 'योजनाएं खोजें',

  // Scheme Details & Common Actions
  'scheme.benefits': 'प्रमुख योजना लाभ',
  'scheme.documents': 'आवश्यक दस्तावेज़',
  'scheme.howToApply': 'आवेदन कैसे करें',
  'scheme.whereToApply': 'आवेदन कहां करें',
  'scheme.officialSource': 'आधिकारिक पोर्टल',
  'scheme.verifiedBadge': 'सरकारी राजपत्र सत्यापित',
  'scheme.save': 'सहेजें',
  'scheme.saved': 'सहेजा गया',
  'scheme.share': 'साझा करें',

  // Voice Assistant
  'voice.readyTitle': 'सुनने के लिए तैयार — बोलने के लिए टैप करें',
  'voice.listeningTitle': 'आपकी आवाज़ सुन रहे हैं...',
  'voice.thinkingTitle': 'नियमों का मूल्यांकन किया जा रहा है...',
  'voice.speakingTitle': 'पैक्स सहायक बोल रहा है...',
  'voice.tapToSpeak': 'बोलने के लिए टैप करें',
  'voice.stopListening': 'सुनना बंद करें',
  'voice.typePlaceholder': 'अपना सवाल या विवरण यहाँ लिखें...',
  'voice.privacyNote': 'नागरिक गोपनीयता: आपकी आवाज़ का उपयोग केवल पात्रता जांच के लिए किया जाता है।',
  'voice.viewMatchesBtn': 'पात्र योजनाएं देखें',

  // Common Buttons & Messages
  'common.continue': 'आगे बढ़ें',
  'common.back': 'पीछे जाएं',
  'common.submit': 'जमा करें',
  'common.close': 'बंद करें',
  'common.loading': 'जानकारी लोड हो रही है...',
  'common.error': 'त्रुटि हुई। कृपया पुनः प्रयास करें।',
  'common.retry': 'पुनः प्रयास करें',
};
