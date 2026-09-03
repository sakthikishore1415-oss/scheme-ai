export interface RegionalVoicePack {
  langId: string;
  greetingPrompt: string;
  sessionWelcomeConfirmation: string;
  languageSwitchConfirmation: string;
  listeningPrompt: string;
  understandingPrompt: string;
  heardConfirmation: (transcript: string) => string;
  professionFollowUp: (profession: string) => string;
  eligibilitySummary: (count: number) => string;
  documentExplanation: (docs: string[]) => string;
  ageQuestion: string;
  occupationQuestion: string;
  incomeQuestion: string;
  districtQuestion: string;
  needQuestion: string;
  evaluatingPrompt: string;
  matchedHeading: (count: number) => string;
  whyMeHeading: string;
  explainSimplyIntro: string;
  ivrWelcome: string;
  ivrLanguagePrompt: string;
  ivrSchemeIntro: (index: number, name: string) => string;
  ivrSchemeDetailsPrompt: string;
  ivrSchemeNavigation: string;
  smsWelcome: string;
  smsCategoryMenu: string;
  smsResultIntro: (count: number) => string;
  errorVoicePrompt: string;
}

export const REGIONAL_VOICE_PACKS: Record<string, RegionalVoicePack> = {
  ta: {
    langId: 'ta',
    greetingPrompt: 'வணக்கம்! அறிவோம் திட்டம் உங்களை வரவேற்கிறது. உங்கள் தேவையை சொல்லுங்கள்.',
    sessionWelcomeConfirmation: 'வணக்கம்! நான் உங்களிடம் தமிழில் பேசுவேன். நீங்கள் எப்போது வேண்டுமானாலும் மொழியை மாற்றலாம். உங்களுக்கு என்ன உதவி தேவை?',
    languageSwitchConfirmation: 'மொழி தமிழாக மாற்றப்பட்டது. நான் உங்களிடம் தமிழில் பேசுவேன். உங்களுக்கு எவ்வாறு உதவலாம்?',
    listeningPrompt: 'உங்கள் குரலை கவனிக்கிறோம்... பேசுங்கள்.',
    understandingPrompt: 'உங்கள் தேவையை புரிந்து கொள்கிறோம்...',
    heardConfirmation: (transcript) => `நீங்கள் கூறியதை கேட்டேன்: "${transcript}".`,
    professionFollowUp: (prof) => {
      const p = prof.toLowerCase();
      if (p.includes('farmer') || p.includes('விவசாய')) {
        return 'நீங்கள் விவசாயி என்று புரிந்துகொண்டேன். உங்களிடம் எவ்வளவு நிலம் உள்ளது?';
      }
      if (p.includes('student') || p.includes('மாணவ')) {
        return 'நீங்கள் மாணவர் என்று புரிந்துகொண்டேன். எந்த வகுப்பில் அல்லது படிப்பில் உள்ளீர்கள்?';
      }
      if (p.includes('worker') || p.includes('தொழிலாள')) {
        return 'நீங்கள் தொழிலாளி என்று புரிந்துகொண்டேன். அமைப்புசாரா வாரியத்தில் பதிவு செய்துள்ளீர்களா?';
      }
      if (p.includes('business') || p.includes('வியாபார')) {
        return 'நீங்கள் வியாபாரம் செய்கிறீர்கள் என்று புரிந்துகொண்டேன். உங்களுக்கு சிறுதொழில் கடன் தேவையா?';
      }
      if (p.includes('homemaker') || p.includes('குடும்ப')) {
        return 'நீங்கள் குடும்பத்தலைவி என்று புரிந்துகொண்டேன். மகளிர் சுயஉதவிக்குழுவில் இணைந்துள்ளீர்களா?';
      }
      if (p.includes('senior') || p.includes('முதியோ')) {
        return 'நீங்கள் மூத்த குடிமக்கள் என்று புரிந்துகொண்டேன். முதியோர் ஓய்வூதியம் பெறுகிறீர்களா?';
      }
      return 'உங்கள் தொழிலை புரிந்துகொண்டேன். மேலும் தகுதி விவரங்களை சரிபார்க்கவும்.';
    },
    eligibilitySummary: (count) => `உங்கள் விவரங்களின் அடிப்படையில், ${count} திட்டங்கள் உங்களுக்கு பொருந்தக்கூடும்.`,
    documentExplanation: (_docs) => 'இந்த திட்டத்திற்கு ஆதார் அட்டை, வருமானச் சான்று மற்றும் வங்கி கணக்கு விவரங்கள் தேவை.',
    ageQuestion: 'உங்கள் வயது என்ன?',
    occupationQuestion: 'உங்கள் தொழில் என்ன? (எ.கா: விவசாயி, மாணவர், கூலித்தொழிலாளி, வியாபாரி)',
    incomeQuestion: 'உங்கள் குடும்பத்தின் தோராயமான ஆண்டு வருமானம் என்ன?',
    districtQuestion: 'நீங்கள் எந்த மாவட்டத்தைச் சேர்ந்தவர்?',
    needQuestion: 'உங்களுக்கு எந்த பிரிவில் உதவி வேண்டும்? (விவசாயம், கல்வி, வீடு, மகளிர் நலன்)',
    evaluatingPrompt: 'உங்கள் தகவல்களை வைத்து தகுதியான அரசு திட்டங்களை தேடுகிறோம்...',
    matchedHeading: (count) => `வாழ்த்துகள்! உங்கள் தகுதிக்கு ஏற்ப ${count} சாத்தியமான திட்டங்கள் கண்டறியப்பட்டுள்ளன.`,
    whyMeHeading: 'இந்த திட்டம் உங்களுக்கு ஏன் பொருந்துகிறது?',
    explainSimplyIntro: 'எளிய தமிழில் விளக்கம்:',
    ivrWelcome: 'அறிவோம் திட்டம் — உங்கள் திட்டங்களை அறியுங்கள், பயன்களை பெறுங்கள்.',
    ivrLanguagePrompt: 'தமிழில் தொடர 1 அழுத்தவும். For English press 2. മലയാളത്തിന് 3 അമർത്തുക.',
    ivrSchemeIntro: (idx, name) => `திட்டம் ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'இந்த திட்டம் உங்கள் தொழில் மற்றும் வருமான தகவலுடன் பொருந்தக்கூடும். மேலும் விவரங்களை கேட்க 1 அழுத்தவும்.',
    ivrSchemeNavigation: 'அடுத்த திட்டத்திற்கு 2, மீண்டும் கேட்க 4, முதன்மை பக்கத்திற்கு 9 அழுத்தவும்.',
    smsWelcome: 'அறிவோம் திட்டம்: அரசு திட்டங்களை அறிய 1 அழுத்தி உங்கள் தேவையை தேர்வு செய்யவும்.',
    smsCategoryMenu: '1 கல்வி | 2 விவசாயம் | 3 வீடு | 4 மகளிர் | 5 மருத்துவம் | 6 மற்றவை',
    smsResultIntro: (count) => `உங்கள் விவரங்களுக்கு ${count} திட்டங்கள் உள்ளன. விவரங்களுக்கு எண்ணை அனுப்பவும்.`,
    errorVoicePrompt: 'என்னால் தெளிவாகக் கேட்க முடியவில்லை. மீண்டும் சொல்லுங்கள் அல்லது தட்டச்சு செய்யுங்கள்.',
  },
  hi: {
    langId: 'hi',
    greetingPrompt: 'नमस्ते! अरिवोम थित्तम में आपका स्वागत है। कृपया अपनी आवश्यकता बताएं।',
    sessionWelcomeConfirmation: 'नमस्ते! मैं आपसे हिंदी में बात करूँगा। आप कभी भी भाषा बदल सकते हैं। आपको क्या सहायता चाहिए?',
    languageSwitchConfirmation: 'भाषा हिंदी में बदल दी गई है। मैं आपकी कैसे मदद कर सकता हूँ?',
    listeningPrompt: 'सुन रहे हैं... कृपया बोलिए।',
    understandingPrompt: 'आपकी आवश्यकता का विश्लेषण किया जा रहा है...',
    heardConfirmation: (transcript) => `मैंने सुना: "${transcript}".`,
    professionFollowUp: (prof) => {
      const p = prof.toLowerCase();
      if (p.includes('farmer') || p.includes('किसान')) {
        return 'मैं समझ गया कि आप किसान हैं। आपके पास कितनी कृषि भूमि है?';
      }
      if (p.includes('student') || p.includes('छात्र')) {
        return 'मैं समझ गया कि आप छात्र हैं। आप किस कक्षा या कोर्स में पढ़ रहे हैं?';
      }
      if (p.includes('business') || p.includes('व्यापारी')) {
        return 'मैं समझ गया कि आप छोटा व्यवसाय करते हैं। क्या आपको मुद्रा लोन की आवश्यकता है?';
      }
      return 'आपकी जानकारी समझ आ गई है। कृपया पात्रता विवरण जांचें।';
    },
    eligibilitySummary: (count) => `आपकी जानकारी के आधार पर, ${count} सरकारी योजनाएं आपके लिए उपयुक्त हो सकती हैं।`,
    documentExplanation: (_docs) => 'इस योजना के लिए आधार कार्ड, आय प्रमाण पत्र और बैंक खाता पासबुक आवश्यक हैं।',
    ageQuestion: 'आपकी आयु क्या है?',
    occupationQuestion: 'आपका व्यवसाय क्या है? (किसान, छात्र, व्यापारी, श्रमिक, गृहिणी)',
    incomeQuestion: 'आपके परिवार की अनुमानित वार्षिक आय कितनी है?',
    districtQuestion: 'आप किस जिले से हैं?',
    needQuestion: 'आपको किस क्षेत्र में सहायता चाहिए? (कृषि, शिक्षा, आवास, स्वास्थ्य, पेंशन)',
    evaluatingPrompt: 'आपकी योग्यता के अनुसार उपयुक्त सरकारी योजनाओं की खोज हो रही है...',
    matchedHeading: (count) => `बधाई हो! आपकी जानकारी के अनुसार ${count} संभावित योजनाएं पाई गई हैं।`,
    whyMeHeading: 'यह योजना आपके लिए क्यों उपयुक्त है?',
    explainSimplyIntro: 'सरल भाषा में जानकारी:',
    ivrWelcome: 'अरिवोम थित्तम में आपका स्वागत है।',
    ivrLanguagePrompt: 'हिंदी के लिए 1 दबाएं। For English press 2.',
    ivrSchemeIntro: (idx, name) => `योजना ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'यह योजना आपकी उम्र और व्यवसाय के अनुकूल है। अधिक जानकारी के लिए 1 दबाएं।',
    ivrSchemeNavigation: 'अगली योजना के लिए 2, पुनः सुनने के लिए 4 दबाएं।',
    smsWelcome: 'अरिवोम थित्तम: सरकारी योजनाओं की जानकारी के लिए श्रेणी चुनें।',
    smsCategoryMenu: '1 कृषि | 2 शिक्षा | 3 आवास | 4 महिला कल्याण | 5 स्वास्थ्य',
    smsResultIntro: (count) => `आपकी प्रोफाइल के अनुसार ${count} योजनाएं उपलब्ध हैं।`,
    errorVoicePrompt: 'माफ़ कीजिए, स्पष्ट सुनाई नहीं दिया। कृपया पुनः बोलें या टाइप करें।',
  },
  ml: {
    langId: 'ml',
    greetingPrompt: 'നമസ്കാരം! അറിവോം തിട്ടം. നിങ്ങൾക്ക് എന്ത് സർക്കാർ സഹായമാണ് വേണ്ടത്?',
    sessionWelcomeConfirmation: 'നമസ്കാരം! ഞാൻ നിങ്ങളോട് മലയാളത്തിൽ സംസാരിക്കും. നിങ്ങൾക്ക് എപ്പോൾ വേണമെങ്കിലും ഭാഷ മാറ്റാം. എന്ത് സഹായമാണ് വേണ്ടത്?',
    languageSwitchConfirmation: 'ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി. ഞാൻ എങ്ങനെ സഹായിക്കണം?',
    listeningPrompt: 'കേൾക്കുന്നു... സംസാരിക്കൂ.',
    understandingPrompt: 'താങ്കളുടെ ആവശ്യം പരിശോധിക്കുന്നു...',
    heardConfirmation: (transcript) => `താങ്കൾ പറഞ്ഞത് കേട്ടു: "${transcript}".`,
    professionFollowUp: (prof) => {
      const p = prof.toLowerCase();
      if (p.includes('farmer') || p.includes('കർഷക')) {
        return 'താങ്കൾ കർഷകനാണെന്ന് മനസ്സിലായി. എത്ര ഏക്കർ കൃഷിഭൂമിയുണ്ട്?';
      }
      if (p.includes('student') || p.includes('വിദ്യാർത്ഥി')) {
        return 'താങ്കൾ വിദ്യാർത്ഥിയാണെന്ന് മനസ്സിലായി. ഏത് ക്ലാസ്സിലാണ് പഠിക്കുന്നത്?';
      }
      return 'താങ്കളുടെ തൊഴിൽ വിവരങ്ങൾ മനസ്സിലായി.';
    },
    eligibilitySummary: (count) => `നിങ്ങളുടെ വിവരങ്ങൾ അനുസരിച്ച് ${count} പദ്ധതികൾ ലഭ്യമായേക്കാം.`,
    documentExplanation: (_docs) => 'ഈ പദ്ധതിക്ക് ആധാർ കാർഡ്, വരുമാന സർട്ടിഫിക്കറ്റ്, ബാങ്ക് പാസ്ബുക്ക് എന്നിവ ആവശ്യമാണ്.',
    ageQuestion: 'നിങ്ങളുടെ പ്രായം എത്രയാണ്?',
    occupationQuestion: 'നിങ്ങളുടെ തൊഴിൽ എന്താണ്? (കർഷകൻ, വിദ്യാർത്ഥി, തൊഴിലാളി, കച്ചവടക്കാരൻ)',
    incomeQuestion: 'കുടുംബത്തിന്റെ ഏകദേശ വാർഷിക വരുമാനം എത്രയാണ്?',
    districtQuestion: 'ഏത് ജില്ലയിലാണ് താമസം?',
    needQuestion: 'ഏത് മേഖലയിലാണ് സഹായം ആവശ്യം? (കൃഷി, വിദ്യാഭ്യാസം, വീട്, ആരോഗ്യം)',
    evaluatingPrompt: 'നിങ്ങൾക്ക് അനുയോജ്യമായ പദ്ധതികൾ കണ്ടെത്തുന്നു...',
    matchedHeading: (count) => `അഭിനന്ദനങ്ങൾ! താങ്കൾക്ക് അനുയോജ്യമായ ${count} പദ്ധതികൾ ലഭ്യമാണ്.`,
    whyMeHeading: 'ഈ പദ്ധതി താങ്കൾക്ക് എന്തുകൊണ്ട് അനുയോജ്യമാണ്?',
    explainSimplyIntro: 'ലളിതമായ വിശദീകരണം:',
    ivrWelcome: 'അറിവോം തിട്ടത്തിലേക്ക് സ്വാഗതം.',
    ivrLanguagePrompt: 'മലയാളത്തിന് 1 അമർത്തുക. For English press 2. தமிழுக்கு 3 அழுத்தவும்.',
    ivrSchemeIntro: (idx, name) => `പദ്ധതി ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'ഈ പദ്ധതി നിങ്ങളുടെ പ്രായവും വരുമാനവുമായി യോജിക്കുന്നു. കൂടുതൽ വിവരങ്ങൾക്ക് 1 അമർത്തുക.',
    ivrSchemeNavigation: 'അടുത്ത പദ്ധതിക്ക് 2, വീണ്ടും കേൾക്കാൻ 4 അമർത്തുക.',
    smsWelcome: 'അറിവോം തിട്ടം: സഹായം ലഭിക്കാൻ നമ്പർ മറുപടി നൽകുക.',
    smsCategoryMenu: '1 വിദ്യാഭ്യാസം | 2 കൃഷി | 3 വീട് | 4 ആരോഗ്യം | 5 പെൻഷൻ',
    smsResultIntro: (count) => `താങ്കളുടെ വിവരങ്ങൾ പ്രകാരം ${count} പദ്ധതികൾ ലഭ്യമാണ്.`,
    errorVoicePrompt: 'ക്ഷമിക്കണം, ശബ്ദം വ്യക്തമായില്ല. ദയവായി വീണ്ടും പറയുക അല്ലെങ്കിൽ ടൈപ്പ് ചെയ്യുക.',
  },
  kn: {
    langId: 'kn',
    greetingPrompt: 'ನಮಸ್ಕಾರ! ಅರಿವೋಮ್ ತಿಟ್ಟಂ ಗೆ ಸ್ವಾಗತ. ನಿಮಗೆ ಯಾವ ಸರ್ಕಾರದ ಸಹಾಯ ಬೇಕು?',
    sessionWelcomeConfirmation: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮ್ಮೊಂದಿಗೆ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡುತ್ತೇನೆ. ನೀವು ಯಾವಾಗ ಬೇಕಾದರೂ ಭಾಷೆಯನ್ನು ಬದಲಾಯಿಸಬಹುದು. ನಿಮಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?',
    languageSwitchConfirmation: 'ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ. ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
    listeningPrompt: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ... ಮಾತನಾಡಿ.',
    understandingPrompt: 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸುತ್ತಿದ್ದೇವೆ...',
    heardConfirmation: (transcript) => `ನೀವು ಹೇಳಿದ್ದು ಕೇಳಿಸಿತು: "${transcript}".`,
    professionFollowUp: (prof) => {
      const p = prof.toLowerCase();
      if (p.includes('farmer') || p.includes('ರೈತ')) {
        return 'ನೀವು ರೈತರು ಎಂದು ತಿಳಿಯಿತು. ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಜಮೀನಿದೆ?';
      }
      return 'ನಿಮ್ಮ ವಿವರಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ.';
    },
    eligibilitySummary: (count) => `ನಿಮ್ಮ ವಿವರಗಳ ಪ್ರಕಾರ ${count} ಯೋಜನೆಗಳು ನಿಮಗೆ ಲಭ್ಯವಾಗಬಹುದು.`,
    documentExplanation: (_docs) => 'ಈ ಯೋಜನೆಗೆ ಆಧಾರ್ ಕಾರ್ಡ್, ಆದಾಯ ಪ್ರಮಾಣಪತ್ರ ಮತ್ತು ಬ್ಯಾಂಕ್ ವಿವರಗಳು ಅಗತ್ಯವಿದೆ.',
    ageQuestion: 'ನಿಮ್ಮ ವಯಸ್ಸು ಎಷ್ಟು?',
    occupationQuestion: 'ನಿಮ್ಮ ಉದ್ಯೋಗವೇನು? (ರೈತ, ವಿದ್ಯಾರ್ಥಿ, ವ್ಯಾಪಾರಿ, ಕಾರ್ಮಿಕ)',
    incomeQuestion: 'ನಿಮ್ಮ ಕುಟುಂಬದ ವಾರ್ಷಿಕ ಆದಾಯ ಎಷ್ಟು?',
    districtQuestion: 'ನೀವು ಯಾವ ಜಿಲ್ಲೆಯವರು?',
    needQuestion: 'ಯಾವ ಕ್ಷೇತ್ರದಲ್ಲಿ ನೆರವು ಬೇಕು? (ಕೃಷಿ, ಶಿಕ್ಷಣ, ವಸತಿ, ಮಹಿಳಾ ಕಲ್ಯಾಣ)',
    evaluatingPrompt: 'ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಸೂಕ್ತವಾದ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲಾಗುತ್ತಿದೆ...',
    matchedHeading: (count) => `ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಅರ್ಹತೆಗೆ ತಕ್ಕಂತೆ ${count} ಯೋಜನೆಗಳು ಲಭ್ಯವಿದೆ.`,
    whyMeHeading: 'ಈ ಯೋಜನೆ ನಿಮಗೆ ಏಕೆ ಸೂಕ್ತವಾಗಿದೆ?',
    explainSimplyIntro: 'ಸರಳ ವಿವರಣೆ:',
    ivrWelcome: 'ಅರಿವೋಮ್ ತಿಟ್ಟಂ ಯೋಜನೆಗಳ ವೇದಿಕೆಗೆ ಸ್ವಾಗತ.',
    ivrLanguagePrompt: 'ಕನ್ನಡಕ್ಕೆ 1 ಒತ್ತಿ. For English press 2.',
    ivrSchemeIntro: (idx, name) => `ಯೋಜನೆ ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'ಹೆಚ್ಚಿನ ವಿವರಗಳಿಗಾಗಿ 1 ಒತ್ತಿ.',
    ivrSchemeNavigation: 'ಮುಂದಿನ ಯೋಜನೆಗೆ 2, ಪುನಃ ಕೇಳಲು 4 ಒತ್ತಿ.',
    smsWelcome: 'ಅರಿವೋಮ್ ತಿಟ್ಟಂ: ಸರ್ಕಾರದ ಯೋಜನೆಗಳನ್ನು ತಿಳಿಯಲು ಸಂಖ್ಯೆ ಕಳುಹಿಸಿ.',
    smsCategoryMenu: '1 ಕೃಷಿ | 2 ಶಿಕ್ಷಣ | 3 ವಸತಿ | 4 ಮಹಿಳಾ ಯೋಜನೆ | 5 ಆರೋಗ್ಯ',
    smsResultIntro: (count) => `ನಿಮ್ಮ ವಿವರಗಳಿಗೆ ${count} ಯೋಜನೆಗಳು ಹೊಂದಾಣಿಕೆಯಾಗುತ್ತವೆ.`,
    errorVoicePrompt: 'ಕ್ಷಮಿಸಿ, ಧ್ವನಿ ಸ್ಪಷ್ಟವಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಮಾತನಾಡಿ ಅಥವಾ ಟೈಪ್ ಮಾಡಿ.',
  },
  te: {
    langId: 'te',
    greetingPrompt: 'నమస్కారం! అరివోమ్ తిట్టం కు స్వాగతం. మీకు ఏ ప్రభుత్వ పథకం సహాయం కావాలి?',
    sessionWelcomeConfirmation: 'నమస్కారం! నేను మీతో తెలుగులో మాట్లాడతాను. మీరు ఎప్పుడైనా భాషను మార్చవచ్చు. మీకు ఏమి సహాయం కావాలి?',
    languageSwitchConfirmation: 'భాష తెలుగులోకి మార్చబడింది. నేను మీకు ఎలా సహాయపడగలను?',
    listeningPrompt: 'వింటున్నాము... మాట్లాడండి.',
    understandingPrompt: 'మీ అభ్యర్థనను పరిశీలిస్తున్నాము...',
    heardConfirmation: (transcript) => `మీరు చెప్పింది విన్నాను: "${transcript}".`,
    professionFollowUp: (prof) => {
      const p = prof.toLowerCase();
      if (p.includes('farmer') || p.includes('రైతు')) {
        return 'మీరు రైతు అని అర్థమైంది. మీకు ఎంత వ్యవసాయ భూమి ఉంది?';
      }
      return 'మీ వివరాలను అర్థం చేసుకున్నాము.';
    },
    eligibilitySummary: (count) => `మీ వివరాల ఆధారంగా ${count} పథకాలు మీకు వర్తించవచ్చు.`,
    documentExplanation: (_docs) => 'ఈ పథకానికి ఆధార్ కార్డు, ఆదాయ ధృవీకరణ పత్రం మరియు బ్యాంక్ వివరాలు అవసరం.',
    ageQuestion: 'మీ వయస్సు ఎంత?',
    occupationQuestion: 'మీ వృత్తి ఏమిటి? (రైతు, విద్యార్థి, మహిళా పారిశ్రామికవేత్త, కూలీ)',
    incomeQuestion: 'మీ కుటుంబ వార్షిక ఆదాయం సుమారుగా ఎంత?',
    districtQuestion: 'మీ జిల్లా ఏది?',
    needQuestion: 'మీకు ఏ రంగంలో సహాయం కావాలి? (వ్యవసాయం, చదువు, ఇల్లు, మహిళా సంక్షేమం)',
    evaluatingPrompt: 'మీ అర్హతకు తగిన ప్రభుత్వ పథకాలను వెతుకుతున్నాము...',
    matchedHeading: (count) => `అభినందనలు! మీ వివరాలకు సంబంధించి ${count} పథకాలు లభించాయి.`,
    whyMeHeading: 'ఈ పథకం మీకు ఎందుకు సరిపోతుంది?',
    explainSimplyIntro: 'సులభమైన వివరణ:',
    ivrWelcome: 'அரிவோమ్ తిట్టం కు స్వాగతం.',
    ivrLanguagePrompt: 'తెలుగు కోసం 1 నొక్కండి. For English press 2.',
    ivrSchemeIntro: (idx, name) => `పథకం ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'ఈ పథకం వివరాలు వినడానికి 1 నొక్కండి.',
    ivrSchemeNavigation: 'తరువాతి పథకం కోసం 2, మళ్లీ వినడానికి 4 నొక్కండి.',
    smsWelcome: 'అరివోమ్ తిట్టం: ప్రభుత్వ పథకాల సమాచారం కోసం నంబర్ పంపండి.',
    smsCategoryMenu: '1 చదువు | 2 వ్యవసాయం | 3 ఇల్లు | 4 మహిళ | 5 ఆరోగ్యం',
    smsResultIntro: (count) => `మీ వివరాల ఆధారంగా ${count} పథకాలు ఉన్నాయి.`,
    errorVoicePrompt: 'క్షమించండి, మీ స్వరం స్పష్టంగా లేదు. దయచేసి మళ్ళీ చెప్పండి లేదా టైప్ చేయండి.',
  },
  bn: {
    langId: 'bn',
    greetingPrompt: 'নমস্কার! অরিভোম থিত্তমে আপনাকে স্বাগতম। আপনার কি ধরণের সরকারি সাহায্য প্রয়োজন?',
    sessionWelcomeConfirmation: 'নমস্কার! আমি আপনার সাথে বাংলায় কথা বলব। আপনি যে কোনো সময় ভাষা পরিবর্তন করতে পারেন। আপনার কি সাহায্য প্রয়োজন?',
    languageSwitchConfirmation: 'ভাষা বাংলায় পরিবর্তিত হয়েছে। আমি আপনাকে কিভাবে সাহায্য করতে পারি?',
    listeningPrompt: 'শুনছি... বলুন।',
    understandingPrompt: 'আপনার প্রয়োজন যাচাই করা হচ্ছে...',
    heardConfirmation: (transcript) => `আমি শুনেছি: "${transcript}".`,
    professionFollowUp: (_prof) => 'আপনার পেশা বুঝতে পেরেছি। কত জমি বা যোগ্যতা আছে?',
    eligibilitySummary: (count) => `আপনার তথ্যের ভিত্তিতে ${count}টি প্রকল্প আপনার জন্য প্রযোজ্য হতে পারে।`,
    documentExplanation: (_docs) => 'এই প্রকল্পের জন্য আধার কার্ড, আয়ের শংসাপত্র এবং ব্যাঙ্ক পাসবুক প্রয়োজন।',
    ageQuestion: 'আপনার বয়স কত?',
    occupationQuestion: 'আপনার পেশা কি? (কৃষক, ছাত্র, দিনমজুর, ক্ষুদ্র ব্যবসায়ী)',
    incomeQuestion: 'আপনার পরিবারের আনুমানিক বার্ষিক আয় কত?',
    districtQuestion: 'আপনার জেলা কোনটি?',
    needQuestion: 'কোন বিষয়ে সাহায্য চাই? (কৃষি, শিক্ষা, আবাসন, স্বাস্থ্য, কর্মসংস্থান)',
    evaluatingPrompt: 'আপনার জন্য উপযুক্ত সরকারি প্রকল্প খোঁজা হচ্ছে...',
    matchedHeading: (count) => `অভিনন্দন! আপনার জন্য ${count}টি সম্ভাব্য প্রকল্প পাওয়া গেছে।`,
    whyMeHeading: 'এই প্রকল্প আপনার জন্য কেন উপযুক্ত?',
    explainSimplyIntro: 'সহজ ভাষায় বিবরণ:',
    ivrWelcome: 'অরিভোম থিত্তম সরকারি প্রকল্প সহায়তায় স্বাগতম।',
    ivrLanguagePrompt: 'বাংলার জন্য 1 টিপুন। For English press 2.',
    ivrSchemeIntro: (idx, name) => `প্রকল্প ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'বিস্তারিত জানতে 1 টিপুন।',
    ivrSchemeNavigation: 'পরবর্তী প্রকল্পের জন্য 2, পুনরায় শুনতে 4 টিপুন।',
    smsWelcome: 'অরিভোম থিত্তম: সরকারি প্রকল্প জানতে মেসেজ করুন।',
    smsCategoryMenu: '1 শিক্ষা | 2 কৃষি | 3 বাড়ি | 4 নারী কল্যাণ | 5 স্বাস্থ্য',
    smsResultIntro: (count) => `আপনার তথ্যের ভিত্তিতে ${count}টি প্রকল্প পাওয়া গেছে।`,
    errorVoicePrompt: 'দুঃখিত, আওয়াজ পরিষ্কার বোঝা যায়নি। অনুগ্রহ করে আবার বলুন বা টাইপ করুন।',
  },
  mr: {
    langId: 'mr',
    greetingPrompt: 'नमस्कार! अरिवोम थित्तम मध्ये आपले स्वागत आहे. आपणास कोणत्या सरकारी मदतीची गरज आहे?',
    sessionWelcomeConfirmation: 'नमस्कार! मी तुमच्याशी मराठीत बोलेन. तुम्ही कधीही भाषा बदलू शकता. तुम्हाला कोणती मदत हवी आहे?',
    languageSwitchConfirmation: 'भाषा मराठीमध्ये बदलली आहे. मी तुम्हाला कशी मदत करू शकतो?',
    listeningPrompt: 'ऐकत आहोत... बोला.',
    understandingPrompt: 'तुमची माहिती तपासत आहोत...',
    heardConfirmation: (transcript) => `मी ऐकले: "${transcript}".`,
    professionFollowUp: (_prof) => 'तुमचा व्यवसाय समजला. तुमच्याकडे किती शेतजमीन आहे?',
    eligibilitySummary: (count) => `तुमच्या माहितीनुसार ${count} योजना तुमच्यासाठी योग्य असू शकतात.`,
    documentExplanation: (_docs) => 'या योजनेसाठी आधार कार्ड, उत्पन्न प्रमाणपत्र आणि बँक खाते आवश्यक आहे.',
    ageQuestion: 'आपले वय किती आहे?',
    occupationQuestion: 'आपला व्यवसाय काय आहे? (शेतकरी, विद्यार्थी, कामगार, महिला उद्योजक)',
    incomeQuestion: 'कुटुंबाचे अंदाजे वार्षिक उत्पन्न किती आहे?',
    districtQuestion: 'आपला जिल्हा कोणता?',
    needQuestion: 'कोणत्या क्षेत्रात मदत हवी आहे? (शेती, शिक्षण, घरकुल, आरोग्य)',
    evaluatingPrompt: 'तुमच्यासाठी योग्य योजना शोधत आहोत...',
    matchedHeading: (count) => `अभिनंदन! आपल्या पात्रतेनुसार ${count} योजना उपलब्ध आहेत.`,
    whyMeHeading: 'ही योजना आपल्यासाठी का योग्य आहे?',
    explainSimplyIntro: 'सोप्या भाषेत माहिती:',
    ivrWelcome: 'अरिवोम थित्तम मध्ये आपले स्वागत आहे.',
    ivrLanguagePrompt: 'मराठीसाठी 1 दाबा. For English press 2.',
    ivrSchemeIntro: (idx, name) => `योजना ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'अधिक माहितीसाठी 1 दाबा.',
    ivrSchemeNavigation: 'पुढील योजनेसाठी 2, पुन्हा ऐकण्यासाठी 4 दाबा.',
    smsWelcome: 'अरिवोम थित्तम: योजना माहितीसाठी पर्याय निवडा.',
    smsCategoryMenu: '1 शेती | 2 शिक्षण | 3 घरकुल | 4 महिला | 5 आरोग्य',
    smsResultIntro: (count) => `आपल्यासाठी ${count} योजना उपलब्ध आहेत.`,
    errorVoicePrompt: 'माफ करा, आवाज स्पष्ट आला नाही. कृपया पुन्हा बोला किंवा टाइप करा.',
  },
  gu: {
    langId: 'gu',
    greetingPrompt: 'નમસ્તે! અરિવોમ થિત્તમમાં તમારું સ્વાગત છે. તમને કઈ સરકારી યોજનાની મદદ જોઈએ છે?',
    sessionWelcomeConfirmation: 'નમસ્તે! હું તમારી સાથે ગુજરાતીમાં વાત કરીશ. તમે ગમે ત્યારે ભાષા બદલી શકો છો. તમને કઈ મદદ જોઈએ છે?',
    languageSwitchConfirmation: 'ભાષા ગુજરાતીમાં બદલાઈ ગઈ છે. હું તમને કેવી રીતે મદદ કરી શકું?',
    listeningPrompt: 'સાંભળી રહ્યા છીએ... બોલો.',
    understandingPrompt: 'તમારી વિગતો ચકાસી રહ્યા છીએ...',
    heardConfirmation: (transcript) => `મેં સાંભળ્યું: "${transcript}".`,
    professionFollowUp: (_prof) => 'તમારો વ્યવસાય સમજાયો. તમારી પાસે કેટલી જમીન છે?',
    eligibilitySummary: (count) => `તમારી વિગતો મુજબ ${count} યોજનાઓ તમારા માટે યોગ્ય હોઈ શકે છે.`,
    documentExplanation: (_docs) => 'આ યોજના માટે આધાર કાર્ડ, આવકનું પ્રમાણપત્ર અને બેંક પાસબુક જરૂરી છે.',
    ageQuestion: 'તમારી ઉંમર કેટલી છે?',
    occupationQuestion: 'તમારો વ્યવસાય શું છે? (ખેડૂત, વિદ્યાર્થી, વેપારી, કારીગર)',
    incomeQuestion: 'તમારા કુટુંબની અંદાજિત વાર્ષિક આવક કેટલી છે?',
    districtQuestion: 'તમારો જિલ્લો કયો છે?',
    needQuestion: 'કયા ક્ષેત્રમાં મદદ જોઈએ છે? (ખેતી, શિક્ષણ, આવાસ, ધંધો)',
    evaluatingPrompt: 'તમારા માટે યોગ્ય યોજનાઓ શોધી રહ્યા છીએ...',
    matchedHeading: (count) => `અભિનંદન! તમારી યોગ્યતા મુજબ ${count} સંભવિત યોજનાઓ મળી છે.`,
    whyMeHeading: 'આ યોજના તમારા માટે કેમ યોગ્ય છે?',
    explainSimplyIntro: 'સરળ ભાષામાં સમજૂતી:',
    ivrWelcome: 'અરિવોમ થિત્તમમાં સ્વાગત છે.',
    ivrLanguagePrompt: 'ગુજરાતી માટે 1 દબાવો. For English press 2.',
    ivrSchemeIntro: (idx, name) => `યોજના ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'વધુ વિગત માટે 1 દબાવો.',
    ivrSchemeNavigation: 'આગળની યોજના માટે 2, ફરી સાંભળવા 4 દબાવો.',
    smsWelcome: 'અરિવોમ થિત્તમ: સરકારી યોજનાઓ જાણવા માટે નંબર મોકલો.',
    smsCategoryMenu: '1 ખેતી | 2 શિક્ષણ | 3 આવાસ | 4 મહિલા | 5 સ્વાસ્થ્ય',
    smsResultIntro: (count) => `તમારી વિગતો મુજબ ${count} યોજનાઓ ઉપલબ્ધ છે.`,
    errorVoicePrompt: 'માફ કરશો, અવાજ સ્પષ્ટ નહોતો. કૃપા કરીને ફરી બોલો અથવા ટાઈપ કરો.',
  },
  or: {
    langId: 'or',
    greetingPrompt: 'ନମସ୍କାର! ଅରିଭୋମ୍ ଥିତ୍ତମକୁ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ଆପଣଙ୍କୁ କେଉଁ ସରକାରୀ ଯୋଜନା ସାହାଯ୍ୟ ଦରକାର?',
    sessionWelcomeConfirmation: 'ନମସ୍କାର! ମୁଁ ଆପଣଙ୍କ ସହ ଓଡ଼ିଆରେ କଥା ହେବି। ଆପଣ ଯେକୌଣସି ସମୟରେ ଭାଷା ବଦଳାଇ ପାରିବେ। ଆପଣଙ୍କୁ କ’ଣ ସାହାଯ୍ୟ ଦରକାର?',
    languageSwitchConfirmation: 'ଭାଷା ଓଡ଼ିଆରେ ପରିବର୍ତ୍ତିତ ହୋଇଛି। ମୁଁ ଆପଣଙ୍କୁ କିପରି ସାହାଯ୍ୟ କରିପାରିବି?',
    listeningPrompt: 'ଶୁଣୁଛୁ... କୁହନ୍ତୁ।',
    understandingPrompt: 'ଆପଣଙ୍କର ଆବଶ୍ୟକତା ଯାଞ୍ଚ ହେଉଛି...',
    heardConfirmation: (transcript) => `ମୁଁ ଶୁଣିଲି: "${transcript}".`,
    professionFollowUp: (_prof) => 'ଆପଣଙ୍କ ବୃତ୍ତି ବୁଝିପାରିଲି।',
    eligibilitySummary: (count) => `ଆପଣଙ୍କ ବିବରଣୀ ଅନୁଯାୟୀ ${count}ଟି ଯୋଜନା ଉପଲବ୍ଧ ହୋଇପାରେ।`,
    documentExplanation: (_docs) => 'ଏହି ଯୋଜନା ପାଇଁ ଆଧାର କାର୍ଡ, ଆୟ ପ୍ରମାଣପତ୍ର ଏବଂ ବ୍ୟାଙ୍କ ପାସବୁକ୍ ଆବଶ୍ୟକ।',
    ageQuestion: 'ଆପଣଙ୍କ ବୟସ କେତେ?',
    occupationQuestion: 'ଆପଣଙ୍କ ବୃତ୍ତି କ’ଣ? (ଚାଷୀ, ଛାତ୍ର, ଶ୍ରମିକ, ବ୍ୟବସାୟୀ)',
    incomeQuestion: 'ପରିବାରର ଆନୁମାନିକ ବାର୍ଷିକ ଆୟ କେତେ?',
    districtQuestion: 'ଆପଣ କେଉଁ ଜିଲ୍ଲାର?',
    needQuestion: 'କେଉଁ ବିଷୟରେ ସାହାଯ୍ୟ ଦରକାର? (କୃଷି, ଶିକ୍ଷା, ଆବାସ, ସ୍ୱାସ୍ଥ୍ୟ)',
    evaluatingPrompt: 'ଆପଣଙ୍କ ପାଇଁ ଯୋଜନା ଖୋଜା ଚାଲିଛି...',
    matchedHeading: (count) => `ଅଭିନନ୍ଦନ! ଆପଣଙ୍କ ପାଇଁ ${count}ଟି ଯୋଜନା ମିଳିଛି।`,
    whyMeHeading: 'ଏହି ଯୋଜନା ଆପଣଙ୍କ ପାଇଁ କାହିଁକି ଉପଯୁକ୍ତ?',
    explainSimplyIntro: 'ସରଳ ଭାଷାରେ ବିବରଣୀ:',
    ivrWelcome: 'ଅରିଭୋମ୍ ଥିତ୍ତମକୁ ସ୍ୱାଗତ।',
    ivrLanguagePrompt: 'ଓଡ଼ିଆ ପାଇଁ 1 ଦବାନ୍ତୁ। For English press 2.',
    ivrSchemeIntro: (idx, name) => `ଯୋଜନା ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'ଅଧିକ ଜାଣିବା ପାଇଁ 1 ଦବାନ୍ତୁ।',
    ivrSchemeNavigation: 'ପରବର୍ତ୍ତୀ ଯୋଜନା ପାଇଁ 2, ପୁନର୍ବାର ଶୁଣିବାକୁ 4 ଦବାନ୍ତୁ।',
    smsWelcome: 'ଅରିଭୋମ୍ ଥିତ୍ତମ: ଯୋଜନା ଜାଣିବା ପାଇଁ ନମ୍ବର ପଠାନ୍ତୁ।',
    smsCategoryMenu: '1 କୃଷି | 2 ଶିକ୍ଷା | 3 ଘର | 4 ମହିଳା | 5 ସ୍ୱାସ୍ଥ୍ୟ',
    smsResultIntro: (count) => `ଆପଣଙ୍କ ପାଇଁ ${count}ଟି ଯୋଜନା ଉପଲବ୍ଧ।`,
    errorVoicePrompt: 'କ୍ଷମା କରିବେ, ସ୍ୱର ସ୍ପଷ୍ଟ ହେଲାନାହିଁ। ଦୟାକରି ପୁଣି କୁହନ୍ତୁ କିମ୍ବା ଟାଇପ୍ କରନ୍ତୁ।',
  },
  pa: {
    langId: 'pa',
    greetingPrompt: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਅਰੀਵੋਮ ਥਿੱਤਮ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਤੁਹਾਨੂੰ ਕਿਹੜੀ ਸਰਕਾਰੀ ਸਹਾਇਤਾ ਚਾਹੀਦੀ ਹੈ?',
    sessionWelcomeConfirmation: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡੇ ਨਾਲ ਪੰਜਾਬੀ ਵਿੱਚ ਗੱਲ ਕਰਾਂਗਾ। ਤੁਸੀਂ ਕਿਸੇ ਵੀ ਸਮੇਂ ਭਾਸ਼ਾ ਬਦਲ ਸਕਦੇ ਹੋ। ਤੁਹਾਨੂੰ ਕੀ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?',
    languageSwitchConfirmation: 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਦਿੱਤੀ ਗਈ ਹੈ। ਮੈਂ ਤੁਹਾਡੀ ਕਿਵੇਂ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ?',
    listeningPrompt: 'ਸੁਣ ਰਹੇ ਹਾਂ... ਬੋਲੋ।',
    understandingPrompt: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਦੀ ਜਾਂਚ ਕੀਤੀ ਜਾ ਰਹੀ ਹੈ...',
    heardConfirmation: (transcript) => `ਮੈਂ ਸੁਣਿਆ: "${transcript}".`,
    professionFollowUp: (_prof) => 'ਮੈਨੂੰ ਤੁਹਾਡਾ ਕੰਮ ਸਮਝ ਆ ਗਿਆ ਹੈ। ਤੁਹਾਡੇ ਕੋਲ ਕਿੰਨੀ ਜ਼ਮੀਨ ਹੈ?',
    eligibilitySummary: (count) => `ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਅਨੁਸਾਰ ${count} ਯੋਜਨਾਵਾਂ ਤੁਹਾਡੇ ਲਈ ਢੁਕਵੀਆਂ ਹੋ ਸਕਦੀਆਂ ਹਨ।`,
    documentExplanation: (_docs) => 'ਇਸ ਸਕੀਮ ਲਈ ਆਧਾਰ ਕਾਰਡ, ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਬੈਂਕ ਖਾਤਾ ਜ਼ਰੂਰੀ ਹੈ।',
    ageQuestion: 'ਤੁਹਾਡੀ ਉਮਰ ਕਿੰਨੀ ਹੈ?',
    occupationQuestion: 'ਤੁਹਾਡਾ ਕੰਮ ਕੀ ਹੈ? (ਕਿਸਾਨ, ਵਿਦਿਆਰਥੀ, ਕਾਰੀਗਰ, ਮਜ਼ਦੂਰ)',
    incomeQuestion: 'ਤੁਹਾਡੀ ਸਾਲਾਨਾ ਪਰਿਵਾਰਕ ਆਮਦਨ ਕਿੰਨੀ ਹੈ?',
    districtQuestion: 'ਤੁਹਾਡਾ ਜ਼ਿਲ੍ਹਾ ਕਿਹੜਾ ਹੈ?',
    needQuestion: 'ਕਿਸ ਖੇਤਰ ਵਿੱਚ ਸਹਾਇਤਾ ਚਾਹੀਦੀ ਹੈ? (ਖੇਤੀਬਾੜੀ, ਸਿੱਖਿਆ, ਮਕਾਨ, ਸਿਹਤ)',
    evaluatingPrompt: 'ਤੁਹਾਡੇ ਲਈ ਢੁਕਵੀਆਂ ਯੋਜਨਾਵਾਂ ਲੱਭ ਰਹੇ ਹਾਂ...',
    matchedHeading: (count) => `ਮੁਬਾਰਕਾਂ! ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਮੁਤਾਬਕ ${count} ਯੋਜਨਾਵਾਂ ਮਿਲੀਆਂ ਹਨ।`,
    whyMeHeading: 'ਇਹ ਯੋਜਨਾ ਤੁਹਾਡੇ ਲਈ ਕਿਉਂ ਢੁਕਵੀਂ ਹੈ?',
    explainSimplyIntro: 'ਸਰਲ ਭਾਸ਼ਾ ਵਿੱਚ ਜਾਣਕਾਰੀ:',
    ivrWelcome: 'ਅਰੀਵੋਮ ਥਿੱਤਮ ਵਿੱਚ ਸਵਾਗਤ ਹੈ।',
    ivrLanguagePrompt: 'ਪੰਜਾਬੀ ਲਈ 1 ਦਬਾਓ। For English press 2.',
    ivrSchemeIntro: (idx, name) => `ਯੋਜਨਾ ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'ਵਧੇਰੇ ਜਾਣਕਾਰੀ ਲਈ 1 ਦਬਾਓ।',
    ivrSchemeNavigation: 'ਅਗਲੀ ਯੋਜਨਾ ਲਈ 2, ਦੁਬਾਰਾ ਸੁਣਨ ਲਈ 4 ਦਬਾਓ।',
    smsWelcome: 'ਅਰੀਵੋਮ ਥਿੱਤਮ: ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਜਾਣਨ ਲਈ ਨੰਬਰ ਚੁਣੋ।',
    smsCategoryMenu: '1 ਖੇਤੀਬਾੜੀ | 2 ਸਿੱਖਿਆ | 3 ਮਕਾਨ | 4 ਔਰਤਾਂ | 5 ਸਿਹਤ',
    smsResultIntro: (count) => `ਤੁਹਾਡੇ ਲਈ ${count} ਸਕੀਮਾਂ ਉਪਲਬਧ ਹਨ।`,
    errorVoicePrompt: 'ਮਾਫ਼ ਕਰਨਾ, ਆਵਾਜ਼ ਸਾਫ਼ ਨਹੀਂ ਸੀ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਬੋਲੋ ਜਾਂ ਟਾਈਪ ਕਰੋ।',
  },
  as: {
    langId: 'as',
    greetingPrompt: 'নমস্কাৰ! অৰিভোম থিত্তমলৈ আপোনাক স্বাগতম। আপোনাক কি চৰকাৰী আঁচনিৰ সাহায্য লাগে?',
    sessionWelcomeConfirmation: 'নমস্কাৰ! মই আপোনাৰ লগত অসমীয়াত কথা পাতিম। আপুনি যিকোনো সময়তে ভাষা সলনি কৰিব পাৰে। আপোনাক কি সাহায্য লাগে?',
    languageSwitchConfirmation: 'ভাষা অসমীয়ালৈ সলনি কৰা হৈছে। মই আপোনাক কেনেকৈ সহায় কৰিব পাৰোঁ?',
    listeningPrompt: 'শুনি আছোঁ... কওক।',
    understandingPrompt: 'আপোনাৰ প্ৰয়োজন চালিজাৰি চোৱা হৈছে...',
    heardConfirmation: (transcript) => `মই শুনিলোঁ: "${transcript}".`,
    professionFollowUp: (_prof) => 'আপোনাৰ বৃত্তি বুজি পালোঁ।',
    eligibilitySummary: (count) => `আপোনাৰ তথ্যৰ ভিত্তিত ${count}খন আঁচনি আপোনাৰ বাবে প্ৰযোজ্য হব পাৰে।`,
    documentExplanation: (_docs) => 'এই আঁচনিৰ বাবে আধাৰ কাৰ্ড, আয়ৰ প্ৰমাণপত্ৰ আৰু বেংক পাছবুক প্ৰয়োজন।',
    ageQuestion: 'আপোনাৰ বয়স কিমান?',
    occupationQuestion: 'আপোনাৰ বৃত্তি কি? (কৃষক, ছাত্ৰ, হস্তশিল্পী, শ্ৰমিক)',
    incomeQuestion: 'আপোনাৰ পৰিয়ালৰ আনুমানিক বাৰ্ষিক আয় কিমান?',
    districtQuestion: 'আপোনাৰ জিলা কি?',
    needQuestion: 'কোন ক্ষেত্ৰত সাহায্য লাগে? (কৃষি, শিক্ষা, গৃহ, স্বাস্থ্য)',
    evaluatingPrompt: 'আপোনাৰ বাবে উপযুক্ত আঁচনি বিচৰা হৈছে...',
    matchedHeading: (count) => `অভিনন্দন! আপোনাৰ তথ্যৰ ভিত্তিত ${count}খন আঁচনি পোৱা গৈছে।`,
    whyMeHeading: 'এই আঁচনিখন আপোনাৰ বাবে কিয় উপযুক্ত?',
    explainSimplyIntro: 'সহজ ভাষাত বিৱৰণ:',
    ivrWelcome: 'অৰিভোম থিত্তমলৈ স্বাগতম।',
    ivrLanguagePrompt: 'অসমীয়াৰ বাবে 1 টিপক। For English press 2.',
    ivrSchemeIntro: (idx, name) => `আঁচনি ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'অধিক তথ্যৰ বাবে 1 টিপক।',
    ivrSchemeNavigation: 'পৰৱৰ্তী আঁচনিৰ বাবে 2, পুনৰ শুনিবলৈ 4 টিপক।',
    smsWelcome: 'অৰিভোম থিত্তম: চৰকাৰী আঁচনি জানিবলৈ উত্তৰ দিয়ক।',
    smsCategoryMenu: '1 কৃষি | 2 শিক্ষা | 3 ঘৰ | 4 মহিলা | 5 স্বাস্থ্য',
    smsResultIntro: (count) => `আপোনাৰ বাবে ${count}খন আঁচনি উপলব্ধ।`,
    errorVoicePrompt: 'ক্ষমা কৰিব, স্পষ্টকৈ শুনা নগল। অনুগ্ৰহ কৰি পুনৰ কওক বা টাইপ কৰক।',
  },
  en: {
    langId: 'en',
    greetingPrompt: 'Welcome to Arivom Thittam. What government assistance do you need today?',
    sessionWelcomeConfirmation: 'Welcome! I will speak with you in English. You can change the language anytime. What assistance do you need?',
    languageSwitchConfirmation: 'Language switched to English. How may I help you today?',
    listeningPrompt: 'Listening carefully... please speak.',
    understandingPrompt: 'Analyzing your situation and intent...',
    heardConfirmation: (transcript) => `I heard: "${transcript}".`,
    professionFollowUp: (prof) => {
      const p = prof.toLowerCase();
      if (p.includes('farmer')) return 'I understand you are a farmer. How many acres of land do you hold?';
      if (p.includes('student')) return 'I understand you are a student. Which course or year of study are you in?';
      if (p.includes('worker')) return 'I understand you are a worker. Are you registered with the unorganized welfare board?';
      if (p.includes('business')) return 'I understand you run a small business. Do you require a MUDRA micro-loan?';
      if (p.includes('homemaker')) return 'I understand you are a homemaker. Are you part of a Self-Help Group (SHG)?';
      if (p.includes('senior')) return 'I understand you are a senior citizen. Do you currently receive an Old Age Pension?';
      return 'I have recorded your profession. Let us check your eligible schemes.';
    },
    eligibilitySummary: (count) => `Based on your details, ${count} government schemes may match your eligibility.`,
    documentExplanation: (_docs) => 'This scheme typically requires Aadhaar Card, Income Certificate, and Bank Passbook.',
    ageQuestion: 'What is your age?',
    occupationQuestion: 'What is your occupation? (e.g. Farmer, Student, Artisan, Street Vendor, Homemaker)',
    incomeQuestion: 'What is your approximate annual family income?',
    districtQuestion: 'Which district are you from?',
    needQuestion: 'Which area do you need support in? (Agriculture, Education, Housing, Health, Pension)',
    evaluatingPrompt: 'Checking deterministic eligibility criteria across Central and State schemes...',
    matchedHeading: (count) => `We found ${count} potential scheme matches based on your profile.`,
    whyMeHeading: 'Why did we match this scheme to you?',
    explainSimplyIntro: 'Plain Citizen-Friendly Summary:',
    ivrWelcome: 'Welcome to Arivom Thittam — Know Your Schemes. Claim Your Benefits.',
    ivrLanguagePrompt: 'For English press 1. தமிழிற்கு 2 அழுத்தவும். മലയാളത്തിന് 3 അമർത്തുക.',
    ivrSchemeIntro: (idx, name) => `Scheme ${idx}: ${name}.`,
    ivrSchemeDetailsPrompt: 'This matches your reported occupation and income criteria. Press 1 to hear benefits.',
    ivrSchemeNavigation: 'Press 2 for next scheme, 4 to repeat, 9 for main menu.',
    smsWelcome: 'Arivom Thittam: Reply with a number to discover schemes for your family.',
    smsCategoryMenu: '1 Education | 2 Agriculture | 3 Housing | 4 Women | 5 Health | 6 Business',
    smsResultIntro: (count) => `Found ${count} matching schemes for your profile. Reply with scheme number for details.`,
    errorVoicePrompt: 'Sorry, we could not hear clearly. Please speak again or type your details.',
  },
};

export function getVoicePack(langId: string): RegionalVoicePack {
  return REGIONAL_VOICE_PACKS[langId] || REGIONAL_VOICE_PACKS['en'];
}
