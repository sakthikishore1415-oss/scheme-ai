import { NeedCategory } from '../types';

export interface CategoryInfo {
  id: NeedCategory;
  label: string;
  emoji: string;
  icon: string;
  tamilLabel: string;
  description: string;
  sampleQueries: {
    en: string;
    ta: string;
    ml: string;
    kn: string;
    te: string;
    hi: string;
  };
}

export const NEED_CATEGORIES: CategoryInfo[] = [
  {
    id: 'agriculture',
    label: 'Agriculture & Farming',
    emoji: '🌾',
    icon: '🌾',
    tamilLabel: 'விவசாயம் மற்றும் பண்ணை',
    description: 'Crop subsidies, PM-KISAN, machinery, fertilizer, irrigation & farm loan waiver',
    sampleQueries: {
      en: 'I am a farmer looking for crop assistance and fertilizer subsidy.',
      ta: 'நான் விவசாயி. பயிர் உதவி மற்றும் உர மானியம் வேண்டும்.',
      ml: 'ഞാൻ ഒരു കർഷകനാണ്. കാർഷിക സബ്സിഡിയും വിള ഇൻഷുറൻസും വേണം.',
      kn: 'ನಾನು ರೈತ. ಬೆಳೆ ಸಹಾಯಧನ ಮತ್ತು ಕೃಷಿ ಯಂತ್ರೋಪಕರಣ ಯೋಜನೆ ಬೇಕು.',
      te: 'నేను రైతును. పంట పెట్టుబడి సాయం மற்றும் ఎరువుల రాయితీ కావాలి.',
      hi: 'मैं एक किसान हूँ। फसल सहायता और कृषि उपकरण सब्सिडी चाहिए।',
    },
  },
  {
    id: 'education',
    label: 'Education & Student',
    emoji: '🎓',
    icon: '🎓',
    tamilLabel: 'கல்வி மற்றும் மாணவர்கள்',
    description: 'Post-matric scholarships, fee concessions, hostel aid & study laptops',
    sampleQueries: {
      en: 'My daughter is studying in college. We need a higher education scholarship.',
      ta: 'என் மகள் கல்லூரியில் படிக்கிறாள். உயர் கல்வி உதவித்தொகை வேண்டும்.',
      ml: 'മകൾ കോളേജിൽ പഠിക്കുന്നു. ഉന്നത വിദ്യാഭ്യാസ സ്കോളർഷിപ്പ് വേണം.',
      kn: 'ನನ್ನ ಮಗಳು ಕಾಲೇಜಿನಲ್ಲಿ ಓದುತ್ತಿದ್ದಾಳೆ. ಉನ್ನತ ಶಿಕ್ಷಣ ವಿದ್ಯಾರ್ಥಿವೇತನ ಬೇಕು.',
      te: 'నా కుమార్తె కళాశాలలో చదువుతోంది. ఉన్నత విద్యా స్కాలర్‌షిప్ కావాలి.',
      hi: 'मेरी बेटी कॉलेज में पढ़ रही है। उच्च शिक्षा छात्रवृत्ति सहायता चाहिए।',
    },
  },
  {
    id: 'housing',
    label: 'Housing & Shelter',
    emoji: '🏠',
    icon: '🏠',
    tamilLabel: 'வீட்டு வசதி மற்றும் நிலம்',
    description: 'PM Awas Yojana, rural pucca house grants, toilet construction grants',
    sampleQueries: {
      en: 'I want financial support to build a permanent pucca house.',
      ta: 'எனக்கு சொந்தமாக கான்கிரீட் வீடு கட்ட அரசு நிதி உதவி வேண்டும்.',
      ml: 'സ്വന്തമായി വീട് നിർമ്മിക്കാൻ സർക്കാരിന്റെ സാമ്പത്തിക സഹായം വേണം.',
      kn: 'ಸ್ವಂತ ಪಕ್ಕಾ ಮನೆ ನಿರ್ಮಿಸಲು ಸರ್ಕಾರದ ಆರ್ಥಿಕ ನೆರವು ಬೇಕು.',
      te: 'సొంత ఇల్లు కట్టుకోవడానికి ప్రభుత్వ గృహ నిర్మాణ సహాయం కావాలి.',
      hi: 'पक्का घर बनाने के लिए सरकारी आवास योजना की आर्थिक मदद चाहिए।',
    },
  },
  {
    id: 'employment',
    label: 'Employment & Youth',
    emoji: '💼',
    icon: '💼',
    tamilLabel: 'வேலைவாய்ப்பு மற்றும் திறன்',
    description: 'Skill training, unemployment stipends, rural job guarantee (MGNREGA), apprentice aid',
    sampleQueries: {
      en: 'I am an unemployed graduate seeking skill development and monthly stipend.',
      ta: 'நான் வேலை இல்லாத பட்டதாரி, வேலைவாய்ப்பு மற்றும் திறன் பயிற்சி தேவை.',
      ml: 'ഞാൻ തൊഴിൽരഹിതനായ ബിരുദധാരിയാണ്, തൊഴിൽ പരിശീലനം വേണം.',
      kn: 'ನಾನು ನಿರುದ್ಯೋಗಿ ಪದವೀಧರ, ಕೌಶಲ್ಯ ತರಬೇತಿ மற்றும் ಭತ್ಯೆ ಬೇಕು.',
      te: 'నేను నిరుద్యోగిని, ఉపాధి అవకాశాలు మరియు నైపుణ్య శిక్షణ కావాలి.',
      hi: 'मैं बेरोजगार युवा हूँ, कौशल विकास प्रशिक्षण और रोजगार सहायता चाहिए।',
    },
  },
  {
    id: 'women',
    label: 'Women Empowerment',
    emoji: '👩',
    icon: '👩',
    tamilLabel: 'மகளிர் மற்றும் குடும்பத்தலைவி',
    description: 'Monthly basic income (Kalaignar Magalir Urimai / Gruha Lakshmi), marriage aid, SHG loans',
    sampleQueries: {
      en: 'I am a woman homemaker looking for monthly entitlement schemes and SHG loans.',
      ta: 'நான் குடும்பத்தலைவி. மாதம் உரிமைத்தொகை மற்றும் மகளிர் சுயஉதவிக்குழு கடன் வேண்டும்.',
      ml: 'ഞാൻ വീട്ടമ്മയാണ്. സ്വയം സഹായ സംഘം വായ്പയും വനിതാ ക്ഷേമ പദ്ധതികളും വേണം.',
      kn: 'ನಾನು ಗೃಹಿಣಿ. ಮಾಸಿಕ ಸಹಾಯಧನ மற்றும் ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಸಂಘದ ಸಾಲ ಬೇಕು.',
      te: 'నేను గృహిణిని. మహిళా ఆర్థిక సహాయం మరియు స్వయం సహాయక సంఘాల రుణం కావాలి.',
      hi: 'मैं महिला हूँ। महिला कल्याण योजना और स्वयं सहायता समूह ऋण चाहिए।',
    },
  },
  {
    id: 'senior_citizens',
    label: 'Senior Citizens',
    emoji: '👴',
    icon: '👴',
    tamilLabel: 'முதியோர் மற்றும் ஓய்வூதியம்',
    description: 'Old-age pensions (IGNOAPS), destitute pension, healthcare assistance & aids',
    sampleQueries: {
      en: 'I am 68 years old. I need old age monthly pension support.',
      ta: 'எனக்கு 68 வயதாகிறது. முதியோர் மாதாந்திர ஓய்வூதியம் வேண்டும்.',
      ml: 'എനിക്ക് 68 വയസ്സുണ്ട്. വാർദ്ധക്യകാല പെൻഷൻ ലഭിക്കാൻ സഹായം വേണം.',
      kn: 'ನನಗೆ 68 ವರ್ಷ. ವೃದ್ಧಾಪ್ಯ ವೇತನ ಪಡೆಯಲು ಅರ್ಜಿ ಸಲ್ಲಿಸಬೇಕು.',
      te: 'నా వయస్సు 68 సంవత్సరాలు. ವೃದ್ಧಾಪ್ಯ పింఛను సహాయం కావాలి.',
      hi: 'मेरी उम्र 68 वर्ष है। मुझे वृद्धावस्था मासिक पेंशन चाहिए।',
    },
  },
  {
    id: 'disability',
    label: 'Disability Support',
    emoji: '♿',
    icon: '♿',
    tamilLabel: 'மாற்றுத்திறனாளிகள் நலன்',
    description: 'Disability maintenance allowance, motorized wheelchair aids, UDID benefits',
    sampleQueries: {
      en: 'I have 60% locomotor disability. I need monthly allowance and assistive device.',
      ta: 'எனக்கு மாற்றுத்திறனாளி மாதாந்திர உதவித்தொகை மற்றும் மூன்று சக்கர வாகனம் வேண்டும்.',
      ml: 'ഭിന്നശേഷിക്കാർക്കുള്ള പ്രതിമാസ സഹായധനവും ഉപകരണങ്ങളും വേണം.',
      kn: 'ವಿಶೇಷ ಚೇತನರಿಗೆ ಮಾಸಿಕ ಭತ್ಯೆ ಮತ್ತು ತ್ರಿಚಕ್ರ ವಾಹನ ಸಹಾಯಧನ ಬೇಕು.',
      te: 'దివ్యాంగుల పింఛను మరియు సహాయక పరికరాలు కావాలి.',
      hi: 'दिव्यांग मासिक पेंशन और सहायक उपकरण के लिए योजना चाहिए।',
    },
  },
  {
    id: 'health',
    label: 'Health & Medical',
    emoji: '🏥',
    icon: '🏥',
    tamilLabel: 'மருத்துவம் மற்றும் காப்பீடு',
    description: 'Ayushman Bharat (PM-JAY), CMCHIS cashless hospital treatment up to ₹5 Lakhs',
    sampleQueries: {
      en: 'My family needs free hospital surgery and health insurance coverage.',
      ta: 'என் குடும்ப மருத்துவ சிகிச்சைக்காக முதலமைச்சரின் விரிவான மருத்துவ காப்பீடு வேண்டும்.',
      ml: 'ആശുപത്രി ചികിത്സയ്ക്കായി കാരുണ്യ ആരോഗ്യ സുരക്ഷാ പദ്ധതി വേണം.',
      kn: 'ಉಚಿತ ಆಸ್ಪತ್ರೆ ಚಿಕಿತ್ಸೆಗಾಗಿ ಆರೋಗ್ಯ ವಿಮಾ ಕಾರ್ಡ್ ಬೇಕು.',
      te: 'ఆసుపత్రి వైద్య చికిత్స కోసం ఆరోగ్యశ్రీ లేదా ఆయుష్మాన్ భారత్ కావాలి.',
      hi: 'अस्पताल में मुफ्त इलाज और आयुष्मान भारत स्वास्थ्य कार्ड चाहिए।',
    },
  },
  {
    id: 'financial',
    label: 'Financial Assistance',
    emoji: '💰',
    icon: '💰',
    tamilLabel: 'நேரடி பண உதவி மற்றும் கடன்',
    description: 'Direct Benefit Transfers, social security pensions, accidental insurance',
    sampleQueries: {
      en: 'I need basic financial assistance and low-cost life and accident insurance.',
      ta: 'அரசு நேரடி பணப் பரிமாற்றம் மற்றும் குறைந்த கட்டண காப்பீடு திட்டம் வேண்டும்.',
      ml: 'സാമ്പത്തിക സഹായവും അപകട ഇൻഷുറൻസ് పరిരക്ഷയും വേണം.',
      kn: 'ಆರ್ಥಿಕ ನೆರವು ಮತ್ತು ಕಡಿಮೆ ಪ್ರೀಮಿಯಂ ವಿಮಾ ಯೋಜನೆಗಳು ಬೇಕು.',
      te: 'ఆర్థిక సహాయం మరియు సామాజిక భద్రతా పథకాలు కావాలి.',
      hi: 'आर्थिक सहायता और सामाजिक सुरक्षा पेंशन योजना चाहिए।',
    },
  },
  {
    id: 'business',
    label: 'Business & Artisans',
    emoji: '🏪',
    icon: '🏪',
    tamilLabel: 'சிறு தொழில் மற்றும் வியாபாரம்',
    description: 'PM SVANidhi (street vendors), PM Vishwakarma (traditional artisans), Mudra loans',
    sampleQueries: {
      en: 'I run a street food stall and need collateral-free working capital loan.',
      ta: 'நான் தெருவோர வியாபாரி, மூலதன கடன் மற்றும் கைவினைஞர் உதவி வேண்டும்.',
      ml: 'ചെറുകിട വഴിയோர കച്ചവടത്തിന് ഈടില്ലാത്ത വായ്പ വേണം.',
      kn: 'ಬೀದಿಬದಿ ವ್ಯಾಪಾರಿಗಳಿಗೆ ಬಡ್ಡಿ ರಹಿತ ಮುದ್ರಾ ಸಾಲ ಯೋಜನೆ ಬೇಕು.',
      te: 'చిరు వ్యాపారులకు పీఎం స్వనిధి లేదా ముద్రా రుణం కావాలి.',
      hi: 'मैं रेहड़ी-पटरी विक्रेता हूँ, व्यवसाय के लिए पीएम स्वनिधि ऋण चाहिए।',
    },
  },
];
