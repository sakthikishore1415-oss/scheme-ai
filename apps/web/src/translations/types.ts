export interface TranslationDictionary {
  // Navigation
  'nav.home': string;
  'nav.matches': string;
  'nav.saved': string;
  'nav.profile': string;
  'nav.voice': string;
  'nav.support': string;

  // Header & Brand
  'header.title': string;
  'header.tagline': string;
  'header.createProfile': string;
  'header.selectLanguage': string;
  'header.changeState': string;

  // Home Screen
  'home.heroTitle': string;
  'home.heroSubtitle': string;
  'home.startVoiceBtn': string;
  'home.talkToAssistant': string;
  'home.browseCatalog': string;
  'home.checkEligibility': string;
  'home.quickNeedsHeading': string;
  'home.quickNeedsSubtitle': string;
  'home.matchesNotice': string;
  'home.viewMatches': string;
  'home.createProfileNotice': string;

  // Categories
  'category.agriculture': string;
  'category.education': string;
  'category.housing': string;
  'category.employment': string;
  'category.women': string;
  'category.senior': string;
  'category.health': string;
  'category.financial': string;
  'category.disability': string;
  'category.general': string;

  // Professions
  'profession.farmer': string;
  'profession.student': string;
  'profession.worker': string;
  'profession.business': string;
  'profession.homemaker': string;
  'profession.senior': string;
  'profession.pwd': string;

  // Profile Form & Questions
  'profile.title': string;
  'profile.subtitle': string;
  'profile.step1': string;
  'profile.step2': string;
  'profile.step3': string;
  'profile.fullName': string;
  'profile.age': string;
  'profile.gender': string;
  'profile.state': string;
  'profile.district': string;
  'profile.occupation': string;
  'profile.annualIncome': string;
  'profile.primaryNeed': string;
  'profile.genderMale': string;
  'profile.genderFemale': string;
  'profile.genderOther': string;
  'profile.saveProfile': string;

  // Matches Screen
  'matches.title': string;
  'matches.subtitle': string;
  'matches.filterAll': string;
  'matches.filterStrong': string;
  'matches.filterPotential': string;
  'matches.filterMoreInfo': string;
  'matches.searchPlaceholder': string;
  'matches.emptyTitle': string;
  'matches.emptySubtitle': string;
  'matches.updateProfileBtn': string;
  'matches.whyMatches': string;
  'matches.viewDetails': string;

  // Saved Schemes & Checklist
  'saved.title': string;
  'saved.subtitle': string;
  'saved.emptyTitle': string;
  'saved.emptySubtitle': string;
  'saved.readinessTitle': string;
  'saved.readinessSubtitle': string;
  'saved.printBtn': string;
  'saved.discoverBtn': string;

  // Scheme Details & Common Actions
  'scheme.benefits': string;
  'scheme.documents': string;
  'scheme.howToApply': string;
  'scheme.whereToApply': string;
  'scheme.officialSource': string;
  'scheme.verifiedBadge': string;
  'scheme.save': string;
  'scheme.saved': string;
  'scheme.share': string;

  // Voice Assistant
  'voice.readyTitle': string;
  'voice.listeningTitle': string;
  'voice.thinkingTitle': string;
  'voice.speakingTitle': string;
  'voice.tapToSpeak': string;
  'voice.stopListening': string;
  'voice.typePlaceholder': string;
  'voice.privacyNote': string;
  'voice.viewMatchesBtn': string;

  // Common Buttons & Messages
  'common.continue': string;
  'common.back': string;
  'common.submit': string;
  'common.close': string;
  'common.loading': string;
  'common.error': string;
  'common.retry': string;
}

export type TranslationKey = keyof TranslationDictionary;
