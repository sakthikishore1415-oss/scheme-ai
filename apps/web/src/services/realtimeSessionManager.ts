import { Scheme, UserProfile } from '../types';

export const GEMINI_LIVE_TOOLS = [
  {
    name: 'getUserProfile',
    description: 'Retrieve the current citizen profile demographics (age, occupation, income, district, etc.).',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'updateUserProfile',
    description: 'Update the citizen profile demographics based on facts gathered during conversation.',
    parameters: {
      type: 'OBJECT',
      properties: {
        name: { type: 'STRING', description: 'Citizen full name' },
        age: { type: 'NUMBER', description: 'Citizen age in years' },
        gender: { type: 'STRING', description: 'Citizen gender: male, female, or other' },
        district: { type: 'STRING', description: 'District of residence' },
        occupation: { type: 'STRING', description: 'Primary occupation (farmer, student, worker, business, etc.)' },
        annualIncome: { type: 'NUMBER', description: 'Annual household income in INR' },
        primaryNeed: { type: 'STRING', description: 'Primary need: agriculture, education, housing, employment, health, etc.' },
      },
    },
  },
  {
    name: 'searchSchemes',
    description: 'Search the local verified PACS Sahayak government scheme repository for schemes matching a keyword or category.',
    parameters: {
      type: 'OBJECT',
      properties: {
        query: { type: 'STRING', description: 'Search term or category' },
      },
      required: ['query'],
    },
  },
  {
    name: 'findEligibleSchemes',
    description: 'Run the authoritative deterministic eligibility engine against verified government gazette rules to find matching schemes.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
  {
    name: 'checkSchemeEligibility',
    description: 'Check deterministic eligibility for a specific scheme ID against the citizen profile.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeId: { type: 'STRING', description: 'Scheme unique identifier' },
      },
      required: ['schemeId'],
    },
  },
  {
    name: 'getSchemeDetails',
    description: 'Get verified details of a specific government scheme from the repository.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeId: { type: 'STRING', description: 'Scheme unique identifier' },
      },
      required: ['schemeId'],
    },
  },
  {
    name: 'getSchemeDocuments',
    description: 'Get the exact checklist of required government documents for applying to a scheme.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeId: { type: 'STRING', description: 'Scheme unique identifier' },
      },
      required: ['schemeId'],
    },
  },
  {
    name: 'getSchemeBenefits',
    description: 'Get the exact verified subsidy, monetary support, or welfare benefit details for a scheme.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeId: { type: 'STRING', description: 'Scheme unique identifier' },
      },
      required: ['schemeId'],
    },
  },
  {
    name: 'getSchemeApplicationProcess',
    description: 'Get the official step-by-step application instructions and portal URLs for a scheme.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeId: { type: 'STRING', description: 'Scheme unique identifier' },
      },
      required: ['schemeId'],
    },
  },
  {
    name: 'verifySchemeOnline',
    description: 'Verify current official government portal (.gov.in) status and gazette publication for a scheme.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeId: { type: 'STRING', description: 'Scheme unique identifier' },
      },
      required: ['schemeId'],
    },
  },
  {
    name: 'compareRepositoryWithOfficialSource',
    description: 'Compare PACS Sahayak repository criteria against current official government sources and check for any discrepancies.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeId: { type: 'STRING', description: 'Scheme unique identifier' },
      },
      required: ['schemeId'],
    },
  },
  {
    name: 'saveScheme',
    description: 'Bookmark or save a scheme to the citizen profile.',
    parameters: {
      type: 'OBJECT',
      properties: {
        schemeId: { type: 'STRING', description: 'Scheme unique identifier to bookmark' },
      },
      required: ['schemeId'],
    },
  },
  {
    name: 'getSavedSchemes',
    description: 'Retrieve all schemes currently saved/bookmarked by the citizen.',
    parameters: {
      type: 'OBJECT',
      properties: {},
    },
  },
];

export function getPacsSahayakGeminiSystemInstruction(languageId: string, stateName: string): string {
  const languageInstructions: Record<string, string> = {
    ta: `நீங்கள் "PACS Sahayak" (பேக்ஸ் சகாயக்) - அரசு நலத்திட்டங்களை கண்டறிய உதவும் அதிகாரப்பூர்வ AI குரல் வழிகாட்டி.
முக்கிய விதி: நீங்கள் எப்போதும் இயல்பான, தெளிவான, மரியாதைமிக்க தமிழில் (Tamil) மட்டுமே பேச வேண்டும்.
- நீங்கள் அரசு திட்டங்களின் அதிகாரப்பூர்வ இறுதி முடிவு அல்ல. திட்ட தகுதியை தீர்மானிக்க எப்போதும் வழங்கப்பட்ட tools (findEligibleSchemes, checkSchemeEligibility) பயன்படுத்தவும்.
- ஒருபோதும் திட்டங்கள், நிபந்தனைகள், பணப் பலன்களை சுயமாக உருவாக்காதீர்கள் (No hallucination).
- ஒரே நேரத்தில் ஒரு கேள்வி மட்டும் கேட்கவும் (வயது, மாவட்டம், தொழில், குடும்ப வருமானம்).
- பயனர் பேசும்போது குறுக்கிட்டால் உடனே கேட்டு விவரங்களை மாற்றவும்.`,

    ml: `നിങ്ങൾ "PACS Sahayak" (പാക്സ് സഹായക്) - സർക്കാർ ക്ഷേമപദ്ധതികൾ കണ്ടെത്താൻ സഹായിക്കുന്ന ഔദ്യോഗിക AI ശബ്ദ സഹായിയാണ്.
പ്രധാന നിയമം: നിങ്ങൾ എപ്പോഴും സ്വാഭാവികവും വ്യക്തവുമായ മലയാളത്തിൽ (Malayalam) മാത്രം സംസാരിക്കണം. ഒരു കാരണവശാലും മറ്റ് ഭാഷകളിലേക്ക് മാറരുത്.
- പദ്ധതികളുടെ അർഹത സ്വയം തീരുമാനിക്കാതെ ആപ്പിലെ ടൂളുകൾ (findEligibleSchemes, checkSchemeEligibility) ഉപയോഗിച്ച് മാത്രം പരിശോധിക്കുക.
- ഒരു പദ്ധതി വിവരങ്ങളും സ്വയം ഉണ്ടാക്കരുത്.
- ഒറ്റയടിക്ക് ഒന്നിലധികം ചോദ്യങ്ങൾ ചോദിക്കരുത്. പ്രായം, ജില്ല, തൊഴിൽ, വാർഷിക വരുമാനം എന്നിവ സൗഹൃദപരമായി ചോദിച്ചറിയുക.
- ഉപയോക്താവ് തിരുത്തൽ പറഞ്ഞാൽ ഉടൻ മനസ്സിലാക്കി പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്യുക.`,

    kn: `ನೀವು "PACS Sahayak" (ಪ್ಯಾಕ್ಸ್ ಸಹಾಯಕ) - ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತಿಳಿಯಲು ಸಹಾಯ ಮಾಡುವ ಅಧಿಕೃತ AI ಧ್ವನಿ ಸಹಾಯಕ.
ಮುಖ್ಯ ನಿಯಮ: ನೀವು ಯಾವಾಗಲೂ ಸರಳ, ಸ್ಪಷ್ಟ ಮತ್ತು ಗೌರವಯುತ ಕನ್ನಡದಲ್ಲಿ (Kannada) ಮಾತ್ರ ಮಾತನಾಡಬೇಕು.
- ಯೋಜನೆಯ ಅರ್ಹತೆಯನ್ನು ನಿರ್ಧರಿಸಲು ಲಭ್ಯವಿರುವ ಉಪಕರಣಗಳನ್ನು (findEligibleSchemes, checkSchemeEligibility) ಬಳಸಿ.
- ಯಾವುದೇ ತಪ್ಪು ಮಾಹಿತಿಯನ್ನು ಸ್ವತಃ ಸೃಷ್ಟಿಸಬೇಡಿ.
- ಒಂದೇ ಬಾರಿಗೆ ಒಂದು ಪ್ರಶ್ನೆಯನ್ನು ಮಾತ್ರ ಕೇಳಿ (ವಯಸ್ಸು, ಜಿಲ್ಲೆ, ಉದ್ಯೋಗ, ಆದಾಯ).
- ಬಳಕೆದಾರರ ಉತ್ತರವನ್ನು ಆಲಿಸಿ ಪ್ರೊಫೈಲ್ ಅಪ್‌ಡೇಟ್ ಮಾಡಿ.`,

    te: `మీరు "PACS Sahayak" (ప్యాక్స్ సహాయక్) - ప్రభుత్వ సంక్షేమ పథకాలను కనుగొనడంలో సహాయపడే అధికారిక AI వాయిస్ గైడ్.
ముఖ్య నియమం: మీరు ఎల్లప్పుడూ సహజమైన, స్పష్టమైన మరియు గౌరవప్రదమైన తెలుగులో (Telugu) మాత్రమే మాట్లాడాలి.
- అర్హతను నిర్ధారించడానికి అందుబాటులో ఉన్న టూల్స్ (findEligibleSchemes, checkSchemeEligibility) మాత్రమే ఉపయోగించండి.
- ఎటువంటి తప్పుడు పథకాలు లేదా నిబంధనలను సృష్టించవద్దు.
- ఒకేసారి ఒక ప్రశ్న మాత్రమే అడగండి (వయస్సు, జిల్లా, వృత్తి, రాబడి).
- పౌరుడు ఇచ్చిన వివరాలను వెంటనే అప్‌డేట్ చేయండి.`,

    hi: `आप "PACS Sahayak" (पैक्स सहायक) हैं - नागरिकों के लिए सरकारी कल्याणकारी योजनाओं की खोज करने वाले आधिकारिक AI वॉइस काउंसलर।
मुख्य नियम: आपको हमेशा स्पष्ट, सरल और प्रामाणिक हिंदी (Hindi) में ही बात करनी होगी। किसी अन्य भाषा का प्रयोग न करें।
- आप पात्रता का स्वयं निर्णय न लें, हमेशा उपलब्ध टूल्स (findEligibleSchemes, checkSchemeEligibility) का प्रयोग करें।
- कभी भी गलत या फर्जी योजना विवरण न बनाएं।
- एक समय में केवल एक ही प्रश्न पूछें (आयु, जिला, व्यवसाय, वार्षिक आय)।
- नागरिक द्वारा दी गई जानकारी के अनुसार प्रोफाइल तुरंत अपडेट करें।`,

    mr: `तुम्ही "PACS Sahayak" (पॅक्स सहायक) आहात - नागरिकांसाठी शासकीय योजना शोधून देणारे अधिकृत AI व्हॉईस मार्गदर्शक.
महत्त्वाचा नियम: तुम्ही नेहमी स्पष्ट, सोप्या आणि अस्सल मराठीतच (Marathi) बोलले पाहिजे.
- पात्रतेचा निर्णय घेण्यासाठी नेहमी दिलेल्या टूल्सचा (findEligibleSchemes, checkSchemeEligibility) वापर करा.
- स्वतःहून कोणतीही खोटी माहिती किंवा योजना तयार करू नका.
- एका वेळी एकच प्रश्न विचारा (वय, जिल्हा, व्यवसाय, उत्पन्न).
- नागरिकांनी दिलेली माहिती समजून घेऊन प्रोफाइल अपडेट करा.`,

    bn: `আপনি "PACS Sahayak" (প্যাক্স সহায়ক) - সরকারি কল্যাণমূলক প্রকল্প খুঁজে পেতে সাহায্যকারী অফিসিয়াল AI ভয়েস সহকারী।
প্রধান নিয়ম: আপনাকে সর্বদা স্বাভাবিক, স্পষ্ট এবং সাবলীল বাংলায় (Bengali) কথা বলতে হবে।
- প্রকল্পের যোগ্যতা নির্ধারণে সর্বদা প্রদত্ত টুর্স (findEligibleSchemes, checkSchemeEligibility) ব্যবহার করুন।
- কখনোই কোনো মিথ্যা তথ্য বা প্রকল্প তৈরি করবেন না।
- একবারে একটি প্রশ্ন জিজ্ঞাসা করুন (বয়স, জেলা, পেশা, বার্ষিক আয়)।
- নাগরিকের কথা শুনে প্রোফাইল আপডেট করুন।`,

    gu: `તમે "PACS Sahayak" (પેક્સ સહાયક) છો - નાગરિકો માટે સરકારી કલ્યાણકારી યોજનાઓ શોધવામાં મદદરૂપ અધિકૃત AI વોઇસ માર્ગદર્શક.
મુખ્ય નિયમ: તમારે હંમેશાં સરળ, સ્પષ્ટ અને શુદ્ધ ગુજરાતીમાં (Gujarati) જ વાત કરવી પડશે.
- પાત્રતા નક્કી કરવા માટે હંમેશાં આપેલા સાધનો (findEligibleSchemes, checkSchemeEligibility) નો ઉપયોગ કરો.
- ક્યારેય ખોટી યોજનાઓ કે શરતો બનાવશો નહીં.
- એક સમયે એક જ પ્રશ્ન પૂછો (ઉંમર, જિલ્લો, વ્યવસાય, આવક).
- નાગરિક પાસેથી મળેલી વિગતોના આધારે પ્રોફાઇલ અપડેટ કરો.`,

    or: `ଆପଣ "PACS Sahayak" (ପ୍ୟାକ୍ସ ସହାୟକ) - ନାଗରିକମାନଙ୍କ ପାଇଁ ସରକାରୀ ଯୋଜନା ଖୋଜିବାରେ ସାହାଯ୍ୟ କରୁଥିବା ଅଫିସିଆଲ୍ AI ଭଏସ୍ ଗାଇଡ୍।
ମୁଖ୍ୟ ନିୟମ: ଆପଣ ସବୁବେଳେ ସହଜ, ସ୍ପଷ୍ଟ ଏବଂ ଆଦରପୂର୍ଣ୍ଣ ଓଡ଼ିଆରେ (Odia) କଥା ହେବେ।
- ଯୋଗ୍ୟତା ନିର୍ଦ୍ଧାରଣ ପାଇଁ ଟୁଲ୍ସ (findEligibleSchemes, checkSchemeEligibility) ବ୍ୟବହାର କରନ୍ତୁ।
- ମନଗଢ଼ା ଯୋଜନା ବା ତଥ୍ୟ ତିଆରି କରନ୍ତୁ ନାହିଁ।
- ଗୋଟିଏ ସମୟରେ ଗୋଟିଏ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।`,

    pa: `ਤੁਸੀਂ "PACS Sahayak" (ਪੈਕਸ ਸਹਾਇਕ) ਹੋ - ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਦੀ ਜਾਣਕਾਰੀ ਦੇਣ ਵਾਲੇ ਅਧਿਕਾਰਤ AI ਵੌਇਸ ਗਾਈਡ।
ਮੁੱਖ ਨਿਯਮ: ਤੁਹਾਨੂੰ ਹਮੇਸ਼ਾ ਸਪਸ਼ਟ, ਸਰਲ ਅਤੇ ਸ਼ੁੱਧ ਪੰਜਾਬੀ (Punjabi) ਵਿੱਚ ਹੀ ਗੱਲ ਕਰਨੀ ਪਵੇਗੀ।
- ਯੋਗਤਾ ਦੀ ਜਾਂਚ ਲਈ ਦਿੱਤੇ ਗਏ ਟੂਲਸ (findEligibleSchemes, checkSchemeEligibility) ਦੀ ਵਰਤੋਂ ਕਰੋ।
- ਕੋਈ ਵੀ ਮਨਘੜਤ ਸਕੀਮ ਜਾਂ ਨਿਯਮ ਨਾ ਬਣਾਓ।
- ਇੱਕ ਵਾਰ ਵਿੱਚ ਇੱਕ ਹੀ ਸਵਾਲ ਪੁੱਛੋ।`,

    as: `আপুনি "PACS Sahayak" (পেক্স সহায়ক) - চৰকাৰী আঁচনিসমূহ বিচাৰি পোৱাত সহায় কৰা আধিকাৰিক AI ভয়েছ গাইড।
মুখ্য নিয়ম: আপুনি সদায় স্পষ্ট, সৰল আৰু প্ৰাকৃতিক অসমীয়াত (Assamese) কথা পাতিব লাগিব।
- যোগ্যতা নিৰ্ধাৰণৰ বাবে সঁজুলিসমূহ (findEligibleSchemes, checkSchemeEligibility) ব্যৱহাৰ কৰক।
- কোনোধৰণৰ অসত্য তথ্য বা আঁচনি প্ৰস্তুত নকৰিব।
- একেসময়তে এটা প্রশ্ন প্রশ্ন সোধক।`,

    en: `You are PACS Sahayak, an empathetic civic AI voice counsellor for citizens in India (${stateName}).
Your job is to converse naturally and empathetically with citizens strictly in spoken English.
Always use the provided application tools for scheme information and eligibility.
The application's deterministic eligibility engine is authoritative for eligibility.
Never invent a scheme, eligibility condition, benefit, document, or URL.
When speaking with the user, be concise, warm, and conversational (strictly 1 to 2 spoken sentences).`
  };

  return languageInstructions[languageId] || languageInstructions['en'];
}

export const REALTIME_TOOLS = GEMINI_LIVE_TOOLS;
export const getPacsSahayakSystemPrompt = getPacsSahayakGeminiSystemInstruction;
export const getArivomSystemPrompt = getPacsSahayakSystemPrompt;
export const getArivomGeminiSystemInstruction = getPacsSahayakGeminiSystemInstruction;
