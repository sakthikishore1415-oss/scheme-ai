import Foundation
import Combine

public enum AppLanguage: String, CaseIterable, Identifiable {
    case english = "en"
    case tamil = "ta"

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .english: return "English"
        case .tamil: return "தமிழ்"
        }
    }
}

public class TranslationManager: ObservableObject {
    public static let shared = TranslationManager()

    @Published public var currentLanguage: AppLanguage = .english

    private let strings: [AppLanguage: [String: String]] = [
        .english: [
            "app_title": "Arivom Thittam",
            "tagline": "Know Your Schemes. Claim Your Benefits.",
            "tab_schemes": "Schemes",
            "tab_eligibility": "Eligibility",
            "tab_voice": "Voice Assistant",
            "tab_profile": "Profile",
            "search_placeholder": "Search schemes, departments, benefits...",
            "all_categories": "All",
            "agriculture": "Agriculture",
            "housing": "Housing",
            "health": "Health",
            "women": "Women Welfare",
            "education": "Education",
            "social": "Social Security",
            "apply_now": "Apply on Official Portal",
            "documents_needed": "Required Documents",
            "how_to_apply": "Step-by-Step Application",
            "why_you_qualify": "Why You Qualify",
            "pending_checks": "Pending Verification",
            "central_scheme": "Central Scheme",
            "state_scheme": "State Scheme",
            "check_eligibility_button": "Check Your Eligibility",
            "check_eligibility_desc": "Enter your profile to find government welfare benefits crafted for you.",
            "age": "Age",
            "gender": "Gender",
            "income": "Annual Family Income",
            "state": "State",
            "occupation": "Occupation",
            "disability": "Differently Abled (PwD)",
            "land_holding": "Agricultural Land (Acres)",
            "save_profile": "Evaluate Schemes",
            "matched_schemes": "Matched Schemes",
            "voice_greeting": "Vanakkam! I am your Arivom Thittam civic voice assistant. Ask me about any government welfare scheme.",
            "voice_prompt_placeholder": "Tap microphone or type a question...",
            "offline_office": "Offline Application Center",
            "verified_on": "Last Verified"
        ],
        .tamil: [
            "app_title": "அறிவோம் திட்டம்",
            "tagline": "அரசு திட்டங்களை அறிவோம். உரிமைகளைப் பெறுவோம்.",
            "tab_schemes": "திட்டங்கள்",
            "tab_eligibility": "தகுதி சரிபார்ப்பு",
            "tab_voice": "குரல் உதவி",
            "tab_profile": "சுயவிவரம்",
            "search_placeholder": "திட்டங்கள், துறைகள், பலன்களைத் தேடவும்...",
            "all_categories": "அனைத்தும்",
            "agriculture": "விவசாயம்",
            "housing": "வீட்டுவசதி",
            "health": "மருத்துவம்",
            "women": "மகளிர் நலம்",
            "education": "கல்வி",
            "social": "சமூகப் பாதுகாப்பு",
            "apply_now": "அரசு இணையதளத்தில் விண்ணப்பிக்கவும்",
            "documents_needed": "தேவையான ஆவணங்கள்",
            "how_to_apply": "விண்ணப்பிக்கும் முறை",
            "why_you_qualify": "உங்களுக்கு ஏன் பொருந்துகிறது",
            "pending_checks": "சரிபார்க்கப்பட வேண்டியவை",
            "central_scheme": "மத்திய அரசு திட்டம்",
            "state_scheme": "மாநில அரசு திட்டம்",
            "check_eligibility_button": "உங்கள் தகுதியை சரிபார்க்கவும்",
            "check_eligibility_desc": "உங்கள் தகவல்களை உள்ளிட்டு உங்களுக்குரிய நலத்திட்டங்களை கண்டறியுங்கள்.",
            "age": "வயது",
            "gender": "பாலினம்",
            "income": "ஆண்டு குடும்ப வருமானம்",
            "state": "மாநிலம்",
            "occupation": "தொழில்",
            "disability": "மாற்றுத்திறனாளி",
            "land_holding": "விவசாய நில அளவு (ஏக்கர்)",
            "save_profile": "திட்டங்களை மதிப்பீடு செய்க",
            "matched_schemes": "பொருந்திய திட்டங்கள்",
            "voice_greeting": "வணக்கம்! நான் உங்கள் அறிவோம் திட்டம் குரல் உதவியாளர். அரசு நலத்திட்டங்கள் பற்றி என்னிடம் கேளுங்கள்.",
            "voice_prompt_placeholder": "மைக்கை தொடவும் அல்லது கேள்வியை தட்டச்சு செய்யவும்...",
            "offline_office": "நேரடி விண்ணப்ப மையம்",
            "verified_on": "சரிபார்க்கப்பட்ட நாள்"
        ]
    ]

    public func localized(_ key: String) -> String {
        return strings[currentLanguage]?[key] ?? strings[.english]?[key] ?? key
    }

    public func toggleLanguage() {
        currentLanguage = (currentLanguage == .english) ? .tamil : .english
    }
}
