package com.arivomthittam.domain.language

object AndroidTranslations {

    fun getLogoLetter(lang: String): String = when (lang) {
        "ta" -> "அ"
        "ml" -> "അ"
        "hi" -> "अ"
        "te" -> "అ"
        "kn" -> "ಅ"
        "bn" -> "অ"
        else -> "A"
    }

    fun getLanguageDisplayName(lang: String): String = when (lang) {
        "ta" -> "தமிழ்"
        "ml" -> "മലയാളം"
        "hi" -> "हिन्दी"
        "te" -> "తెలుగు"
        "kn" -> "ಕನ್ನಡ"
        "bn" -> "বাংলা"
        else -> "English"
    }

    fun getString(key: String, lang: String): String {
        return when (lang) {
            "ml" -> ML_STRINGS[key] ?: EN_STRINGS[key] ?: key
            "ta" -> TA_STRINGS[key] ?: EN_STRINGS[key] ?: key
            else -> EN_STRINGS[key] ?: key
        }
    }

    private val EN_STRINGS = mapOf(
        // App & Navigation
        "app.name" to "Arivom Thittam",
        "app.tagline" to "Know Your Schemes. Claim Your Benefits.",
        "nav.home" to "Home",
        "nav.matches" to "Matches",
        "nav.saved" to "Saved",
        "nav.profile" to "Profile",
        "nav.voice" to "Voice",
        "nav.settings" to "Settings",

        // Home
        "home.tagline" to "GOVERNMENT WELFARE SCHEMES",
        "home.heroTitle" to "Find Schemes You Qualify For",
        "home.heroSubtitle" to "Discover state & central government welfare schemes matched to your profile.",
        "home.voiceCardTitle" to "Speak with Voice Assistant",
        "home.voiceCardSubtitle" to "Speak naturally to find schemes you qualify for",
        "home.quickNeeds" to "Quick Needs",
        "home.eligibleSchemes" to "Top Matched Schemes",
        "home.viewAll" to "View All",

        // Categories
        "category.agriculture" to "Agriculture",
        "category.education" to "Education",
        "category.housing" to "Housing",
        "category.employment" to "Employment",
        "category.women" to "Women Welfare",
        "category.senior" to "Senior Citizens",
        "category.health" to "Healthcare",
        "category.financial" to "Financial Support",

        // Actions & Buttons
        "action.whyMe" to "Why Me?",
        "action.save" to "Save",
        "action.saved" to "Saved",
        "action.details" to "Details",
        "action.continue" to "CONTINUE",
        "action.submit" to "SUBMIT",
        "action.back" to "BACK",
        "action.changeLanguage" to "Language",

        // Profile Form
        "profile.title" to "Citizen Profile",
        "profile.fullName" to "Full Name",
        "profile.age" to "Age",
        "profile.gender" to "Gender",
        "profile.district" to "District",
        "profile.occupation" to "Occupation",
        "profile.annualIncome" to "Annual Income",
        "profile.saveProfile" to "SAVE PROFILE"
    )

    private val TA_STRINGS = mapOf(
        // App & Navigation
        "app.name" to "அறிவோம் திட்டம்",
        "app.tagline" to "அரசு திட்டங்களை அறிவோம். உரிமைகளைப் பெறுவோம்.",
        "nav.home" to "முகப்பு",
        "nav.matches" to "திட்டங்கள்",
        "nav.saved" to "சேமித்தவை",
        "nav.profile" to "சுயவிவரம்",
        "nav.voice" to "குரல் உதவி",
        "nav.settings" to "அமைப்புகள்",

        // Home
        "home.tagline" to "அரசு நலத்திட்டங்கள்",
        "home.heroTitle" to "உங்களுக்கு என்ன கிடைக்கும்?",
        "home.heroSubtitle" to "உங்கள் தகுதிக்கேற்ப அரசு வழங்கும் உதவிகளை அறிந்து பெறுங்கள்.",
        "home.voiceCardTitle" to "குரல் வழியே தேடுங்கள்",
        "home.voiceCardSubtitle" to "உங்கள் தேவையை தமிழில் பேசி திட்டங்களை கண்டறியுங்கள்",
        "home.quickNeeds" to "முக்கிய தேவைகள்",
        "home.eligibleSchemes" to "உங்களுக்கான திட்டங்கள்",
        "home.viewAll" to "அனைத்தும்",

        // Categories
        "category.agriculture" to "விவசாயம்",
        "category.education" to "கல்வி",
        "category.housing" to "வீட்டு வசதி",
        "category.employment" to "வேலைவாய்ப்பு",
        "category.women" to "மகளிர் நலம்",
        "category.senior" to "மூத்த குடிமக்கள்",
        "category.health" to "மருத்துவம்",
        "category.financial" to "நிதி உதவி",

        // Actions & Buttons
        "action.whyMe" to "எனக்கு ஏன்?",
        "action.save" to "சேமிக்க",
        "action.saved" to "சேமிக்கப்பட்டது",
        "action.details" to "விவரங்கள்",
        "action.continue" to "தொடர்க",
        "action.submit" to "சமர்ப்பிக்கவும்",
        "action.back" to "பின்செல்க",
        "action.changeLanguage" to "மொழி தேர்வு",

        // Profile Form
        "profile.title" to "குடிமக்கள் சுயவிவரம்",
        "profile.fullName" to "முழு பெயர்",
        "profile.age" to "வயது",
        "profile.gender" to "பாலினம்",
        "profile.district" to "மாவட்டம்",
        "profile.occupation" to "தொழில்",
        "profile.annualIncome" to "ஆண்டு வருமானம்",
        "profile.saveProfile" to "சுயவிவரத்தை சேமிக்க"
    )

    private val ML_STRINGS = mapOf(
        // App & Navigation
        "app.name" to "അറിവോം തിട്ടം",
        "app.tagline" to "സർക്കാർ പദ്ധതികൾ അറിയൂ, ആനുകൂല്യങ്ങൾ നേടൂ.",
        "nav.home" to "ഹോം",
        "nav.matches" to "പദ്ധതികൾ",
        "nav.saved" to "സംരക്ഷിച്ചവ",
        "nav.profile" to "പ്രൊഫൈൽ",
        "nav.voice" to "ശബ്ദ സഹായം",
        "nav.settings" to "ക്രമീകരണങ്ങൾ",

        // Home
        "home.tagline" to "സർക്കാർ ക്ഷേമപദ്ധതികൾ",
        "home.heroTitle" to "നിങ്ങൾക്ക് അർഹമായ പദ്ധതികൾ",
        "home.heroSubtitle" to "നിങ്ങളുടെ യോഗ്യതയ്ക്കനുസരിച്ചുള്ള സർക്കാർ സഹായങ്ങൾ വേഗത്തിൽ കണ്ടെത്തൂ.",
        "home.voiceCardTitle" to "ശബ്ദത്തിലൂടെ സംസാരിക്കൂ",
        "home.voiceCardSubtitle" to "ആവശ്യങ്ങൾ മലയാളത്തിൽ സംസാരിച്ച് പദ്ധതികൾ കണ്ടെത്തൂ",
        "home.quickNeeds" to "ദ്രുത ആവശ്യങ്ങൾ",
        "home.eligibleSchemes" to "അനുയോജ്യമായ പദ്ധതികൾ",
        "home.viewAll" to "എല്ലാം കാണുക",

        // Categories
        "category.agriculture" to "കൃഷി",
        "category.education" to "വിദ്യാഭ്യാസം",
        "category.housing" to "ഭവനം",
        "category.employment" to "തൊഴിൽ",
        "category.women" to "സ്ത്രീ ക്ഷേമം",
        "category.senior" to "മുതിർന്ന പൗരന്മാർ",
        "category.health" to "ആരോഗ്യം",
        "category.financial" to "സാമ്പത്തിക സഹായം",

        // Actions & Buttons
        "action.whyMe" to "എന്തുകൊണ്ട്?",
        "action.save" to "സൂക്ഷിക്കുക",
        "action.saved" to "സൂക്ഷിച്ചു",
        "action.details" to "വിശദാംശങ്ങൾ",
        "action.continue" to "തുടരുക",
        "action.submit" to "സമർപ്പിക്കുക",
        "action.back" to "പിന്നോട്ട്",
        "action.changeLanguage" to "ഭാഷ മാറ്റുക",

        // Profile Form
        "profile.title" to "പൗര പ്രൊഫൈൽ",
        "profile.fullName" to "മുഴുവൻ പേര്",
        "profile.age" to "പ്രായം",
        "profile.gender" to "ലിംഗഭേദം",
        "profile.district" to "ജില്ല",
        "profile.occupation" to "തൊഴിൽ",
        "profile.annualIncome" to "വാർഷിക വരുമാനം",
        "profile.saveProfile" to "പ്രൊഫൈൽ സംരക്ഷിക്കുക"
    )
}

