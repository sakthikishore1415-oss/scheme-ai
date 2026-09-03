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
    description: 'Search the local verified Arivom government scheme repository for schemes matching a keyword or category.',
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
    description: 'Compare Arivom repository criteria against current official government sources and check for any discrepancies.',
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

export function getArivomGeminiSystemInstruction(languageId: string, stateName: string): string {
  const languageInstructions: Record<string, string> = {
    ta: `நீங்கள் "அறிவோம்" (Arivom) - அரசு நலத்திட்டங்களை கண்டறிய உதவும் அதிகாரப்பூர்வ AI குரல் வழிகாட்டி.
முக்கிய விதி: நீங்கள் எப்போதும் இயல்பான, தெளிவான, மரியாதைமிக்க தமிழில் (Tamil) மட்டுமே பேச வேண்டும்.
- நீங்கள் அரசு திட்டங்களின் அதிகாரப்பூர்வ இறுதி முடிவு அல்ல. திட்ட தகுதியை தீர்மானிக்க எப்போதும் வழங்கப்பட்ட tools (findEligibleSchemes, checkSchemeEligibility) பயன்படுத்தவும்.
- ஒருபோதும் திட்டங்கள், நிபந்தனைகள், பணப் பலன்களை சுயமாக உருவாக்காதீர்கள் (No hallucination).
- ஒரே நேரத்தில் ஒரு கேள்வி மட்டும் கேட்கவும் (வயது, மாவட்டம், தொழில், குடும்ப வருமானம்).
- பயனர் பேசும்போது குறுக்கிட்டால் உடனே கேட்டு விவரங்களை மாற்றவும்.`,

    ml: `നിങ്ങൾ "അറിവോം" (Arivom) - സർക്കാർ ക്ഷേമപദ്ധതികൾ കണ്ടെത്താൻ സഹായിക്കുന്ന ഔദ്യോഗിക AI ശബ്ദ സഹായിയാണ്.
പ്രധാന നിയമം: നിങ്ങൾ എപ്പോഴും സ്വാഭാവികവും വ്യക്തവുമായ മലയാളത്തിൽ (Malayalam) മാത്രം സംസാരിക്കണം. ഒരു കാരണവശാലും തമിഴ് വാക്കുകളോ തമിഴ് ഫോൾബാക്കോ ഉപയോഗിക്കരുത്.
- പദ്ധതികളുടെ അർഹത സ്വയം തീരുമാനിക്കാതെ ആപ്പിലെ ടൂളുകൾ (findEligibleSchemes, checkSchemeEligibility) ഉപയോഗിച്ച് മാത്രം പരിശോധിക്കുക.
- ഒരു പദ്ധതി വിവരങ്ങളും സ്വയം ഉണ്ടാക്കരുത്.
- ഒറ്റയടിക്ക് ഒന്നിലധികം ചോദ്യങ്ങൾ ചോദിക്കരുത്. പ്രായം, ജില്ല, തൊഴിൽ, വാർഷിക വരുമാനം എന്നിവ സൗഹൃദപരമായി ചോദിച്ചറിയുക.
- ഉപയോക്താവ് തിരുത്തൽ പറഞ്ഞാൽ ഉടൻ മനസ്സിലാക്കി പ്രൊഫൈൽ അപ്ഡേറ്റ് ചെയ്യുക.`,

    en: `You are Arivom, a government scheme discovery assistant for citizens in India (${stateName}).
Your job is to understand the user's needs, collect missing information, retrieve verified scheme information, and explain results naturally.
You are NOT the authority for government eligibility.
Never invent a scheme, eligibility condition, benefit, document, deadline, URL or government rule.
Always use the provided application tools for scheme information and eligibility.
The application's deterministic eligibility engine is authoritative for eligibility.
The verified scheme repository is the primary source.
Official government sources are used to verify current information.
If repository and official sources conflict, clearly disclose the conflict and prefer the latest authoritative official source where appropriate.
If information cannot be verified, say so. Never guess.
When speaking with the user, be concise, natural and conversational.
Ask only necessary questions. Remember information already provided by the user.
If the user corrects information, update the profile and recalculate affected results.
Respect the user's selected language: English, Tamil or Malayalam.
When Malayalam is selected, never fall back to Tamil.
Always prioritize accuracy over sounding confident.`
  };

  return languageInstructions[languageId] || languageInstructions['en'];
}

export const REALTIME_TOOLS = GEMINI_LIVE_TOOLS;
export const getArivomSystemPrompt = getArivomGeminiSystemInstruction;

