package com.pacssahayak.domain.language

object AndroidTranslations {

    fun getLogoLetter(lang: String): String = when (lang) {
        "ta" -> "அ"
        "ml" -> "അ"
        "hi" -> "अ"
        "te" -> "అ"
        "kn" -> "ಅ"
        "bn" -> "অ"
        "mr" -> "अ"
        "gu" -> "અ"
        "or" -> "ଓ"
        "pa" -> "ਅ"
        "as" -> "অ"
        else -> "A"
    }

    fun getLanguageDisplayName(lang: String): String = when (lang) {
        "ta" -> "தமிழ்"
        "ml" -> "മലയാളം"
        "hi" -> "हिन्दी"
        "te" -> "తెలుగు"
        "kn" -> "ಕನ್ನಡ"
        "bn" -> "বাংলা"
        "mr" -> "मराठी"
        "gu" -> "ગુજરાતી"
        "or" -> "ଓଡ଼ିଆ"
        "pa" -> "ਪੰਜਾਬੀ"
        "as" -> "অসমীয়া"
        else -> "English"
    }

    fun getString(key: String, lang: String): String {
        val map = when (lang) {
            "ta" -> TA_STRINGS
            "ml" -> ML_STRINGS
            "hi" -> HI_STRINGS
            "te" -> TE_STRINGS
            "kn" -> KN_STRINGS
            "bn" -> BN_STRINGS
            "mr" -> MR_STRINGS
            "gu" -> GU_STRINGS
            "or" -> OR_STRINGS
            "pa" -> PA_STRINGS
            "as" -> AS_STRINGS
            else -> EN_STRINGS
        }
        return map[key] ?: EN_STRINGS[key] ?: key
    }

    private val EN_STRINGS = mapOf(
        // App & Navigation
        "app.name" to "PACS Sahayak",
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
        "profile.saveProfile" to "SAVE PROFILE",
        "home.findMySchemes" to "Find My Schemes",
        "home.speakToAssistant" to "Speak to PACS Sahayak",
        "home.matchedWelfareSchemes" to "Matched Welfare Schemes",
        "scheme.whyMe" to "Why Me?",
        "scheme.viewDetails" to "View Details",
        "scheme.statusEligible" to "100% ELIGIBLE",
        "scheme.statusMoreInfo" to "MORE INFO NEEDED",
        "scheme.statusPending" to "EVALUATION PENDING",
        "matches.title" to "YOUR MATCHES",
        "matches.subtitle" to "Deterministic Entitlements evaluated against official gazette rules.",
        "matches.noMatchesTitle" to "No Scheme Matches Available",
        "matches.noMatchesDesc" to "No government schemes currently loaded from connected repository.",
        "matches.noProfileTitle" to "No Profile Created Yet",
        "matches.noProfileDesc" to "Fill in your basic citizen demographics to evaluate government schemes.",
        "saved.title" to "Saved Schemes",
        "saved.emptyTitle" to "No Saved Schemes Yet",
        "saved.emptyDesc" to "Bookmark schemes you are interested in applying for."
    )

    private val TA_STRINGS = mapOf(
        // App & Navigation
        "app.name" to "பேக்ஸ் சகாயக்",
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
        "app.name" to "പാക്സ് സഹായക്",
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

    private val HI_STRINGS = mapOf(
        "app.name" to "पैक्स सहायक",
        "app.tagline" to "सरकारी योजनाओं को जानें, अपने अधिकार पाएं।",
        "nav.home" to "होम",
        "nav.matches" to "योजनाएं",
        "nav.saved" to "सहेजी गई",
        "nav.profile" to "प्रोफ़ाइल",
        "nav.voice" to "वॉइस",
        "nav.settings" to "सेटिंग्स",
        "home.tagline" to "सरकारी कल्याण योजनाएं",
        "home.heroTitle" to "पात्र योजनाएं खोजें",
        "home.heroSubtitle" to "अपनी प्रोफ़ाइल के अनुसार सरकारी कल्याणकारी योजनाएं खोजें।",
        "home.voiceCardTitle" to "वॉइस सहायक से बात करें",
        "home.voiceCardSubtitle" to "स्वाभाविक आवाज़ में योजनाएं खोजें",
        "home.quickNeeds" to "त्वरित आवश्यकताएं",
        "home.eligibleSchemes" to "पात्र योजनाएं",
        "home.viewAll" to "सभी देखें",
        "category.agriculture" to "कृषि",
        "category.education" to "शिक्षा",
        "category.housing" to "आवास",
        "category.employment" to "रोजगार",
        "category.women" to "महिला कल्याण",
        "category.senior" to "वरिष्ठ नागरिक",
        "category.health" to "स्वास्थ्य",
        "category.financial" to "वित्तीय सहायता",
        "action.whyMe" to "मुझे क्यों?",
        "action.save" to "सहेजें",
        "action.saved" to "सहेजा गया",
        "action.details" to "विवरण",
        "action.continue" to "आगे बढ़ें",
        "action.submit" to "जमा करें",
        "action.back" to "पीछे",
        "action.changeLanguage" to "भाषा",
        "profile.title" to "नागरिक प्रोफ़ाइल",
        "profile.fullName" to "पूरा नाम",
        "profile.age" to "आयु",
        "profile.gender" to "लिंग",
        "profile.district" to "जिला",
        "profile.occupation" to "व्यवसाय",
        "profile.annualIncome" to "वार्षिक आय",
        "profile.saveProfile" to "प्रोफ़ाइल सहेजें"
    )

    private val TE_STRINGS = mapOf(
        "app.name" to "ప్యాక్స్ సహాయక్",
        "app.tagline" to "సంక్షేమ పథకాలను తెలుసుకోండి, మీ హక్కులను పొందండి.",
        "nav.home" to "హోమ్",
        "nav.matches" to "పథకాలు",
        "nav.saved" to "సేవ్ చేసినవి",
        "nav.profile" to "ప్రొఫైల్",
        "nav.voice" to "వాయిస్",
        "nav.settings" to "సెట్టింగ్‌లు",
        "home.tagline" to "ప్రభుత్వ సంక్షేమ పథకాలు",
        "home.heroTitle" to "అర్హత పథకాలను కనుగొనండి",
        "home.heroSubtitle" to "మీ ప్రొఫైల్‌కు సరిపోయే సంక్షేమ పథకాలను సులభంగా కనుగొనండి.",
        "home.voiceCardTitle" to "వాయిస్ అసిస్టెంట్‌తో మాట్లాడండి",
        "home.voiceCardSubtitle" to "సహజంగా మాట్లాడి పథకాలను తెలుసుకోండి",
        "home.quickNeeds" to "త్వరిత అవసరాలు",
        "home.eligibleSchemes" to "అర్హత పథకాలు",
        "home.viewAll" to "అన్నీ చూడండి",
        "category.agriculture" to "వ్యవసాయం",
        "category.education" to "విద్య",
        "category.housing" to "గృహం",
        "category.employment" to "ఉపాధి",
        "category.women" to "మహిళా సంక్షేమం",
        "category.senior" to "వృద్ధులు",
        "category.health" to "ఆరోగ్యం",
        "category.financial" to "ఆర్థిక సహాయం",
        "action.whyMe" to "నాకు ఎందుకు?",
        "action.save" to "సేవ్ చేయండి",
        "action.saved" to "సేవ్ చేయబడింది",
        "action.details" to "వివరాలు",
        "action.continue" to "కొనసాగించండి",
        "action.submit" to "సమర్పించండి",
        "action.back" to "వెనుకకు",
        "action.changeLanguage" to "భాష",
        "profile.title" to "పౌరుడి ప్రొఫైల్",
        "profile.fullName" to "పూర్తి పేరు",
        "profile.age" to "వయస్సు",
        "profile.gender" to "లింగం",
        "profile.district" to "జిల్లా",
        "profile.occupation" to "వృత్తి",
        "profile.annualIncome" to "వార్షిక ఆదాయం",
        "profile.saveProfile" to "ప్రొఫైల్ సేవ్ చేయండి"
    )

    private val KN_STRINGS = mapOf(
        "app.name" to "ಪ್ಯಾಕ್ಸ್ ಸಹಾಯಕ",
        "app.tagline" to "ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ತಿಳಿಯಿರಿ, ನಿಮ್ಮ ಹಕ್ಕುಗಳನ್ನು ಪಡೆಯಿರಿ.",
        "nav.home" to "ಮುಖಪುಟ",
        "nav.matches" to "ಯೋಜನೆಗಳು",
        "nav.saved" to "ಉಳಿಸಿದವು",
        "nav.profile" to "ಪ್ರೊಫೈಲ್",
        "nav.voice" to "ಧ್ವನಿ",
        "nav.settings" to "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        "home.tagline" to "ಸರ್ಕಾರಿ ಕಲ್ಯಾಣ ಯೋಜನೆಗಳು",
        "home.heroTitle" to "ಅರ್ಹ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ",
        "home.heroSubtitle" to "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್‌ಗೆ ಸೂಕ್ತವಾದ ಸರ್ಕಾರಿ ಯೋಜನೆಗಳನ್ನು ಕಂಡುಕೊಳ್ಳಿ.",
        "home.voiceCardTitle" to "ಧ್ವನಿ ಸಹಾಯಕರೊಂದಿಗೆ ಮಾತನಾಡಿ",
        "home.voiceCardSubtitle" to "ಧ್ವನಿಯ ಮೂಲಕ ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಿ",
        "home.quickNeeds" to "ತ್ವರಿತ ಅಗತ್ಯಗಳು",
        "home.eligibleSchemes" to "ಅರ್ಹ ಯೋಜನೆಗಳು",
        "home.viewAll" to "ಎಲ್ಲಾ ನೋಡಿ",
        "category.agriculture" to "ಕೃಷಿ",
        "category.education" to "ಶಿಕ್ಷಣ",
        "category.housing" to "ವಸತಿ",
        "category.employment" to "ಉದ್ಯೋಗ",
        "category.women" to "ಮಹಿಳಾ ಕಲ್ಯಾಣ",
        "category.senior" to "ಹಿರಿಯ ನಾಗರಿಕರು",
        "category.health" to "ಆರೋಗ್ಯ",
        "category.financial" to "ಆರ್ಥಿಕ ನೆರವು",
        "action.whyMe" to "ನನಗೆ ಏಕೆ?",
        "action.save" to "ಉಳಿಸಿ",
        "action.saved" to "ಉಳಿಸಲಾಗಿದೆ",
        "action.details" to "ವಿವರಗಳು",
        "action.continue" to "ಮುಂದುವರಿಯಿರಿ",
        "action.submit" to "ಸಲ್ಲಿಸಿ",
        "action.back" to "ಹಿಂದೆ",
        "action.changeLanguage" to "ಭಾಷೆ",
        "profile.title" to "ನಾಗರಿಕ ಪ್ರೊಫೈಲ್",
        "profile.fullName" to "ಪೂರ್ಣ ಹೆಸರು",
        "profile.age" to "ವಯಸ್ಸು",
        "profile.gender" to "ಲಿಂಗ",
        "profile.district" to "ಜಿಲ್ಲೆ",
        "profile.occupation" to "ಉದ್ಯೋಗ",
        "profile.annualIncome" to "ವಾರ್ಷಿಕ ಆದಾಯ",
        "profile.saveProfile" to "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ"
    )

    private val BN_STRINGS = mapOf(
        "app.name" to "প্যাক্স সহায়ক",
        "app.tagline" to "সরকারি প্রকল্প জানুন, নিজের অধিকার বুঝে নিন।",
        "nav.home" to "হোম",
        "nav.matches" to "প্রকল্প",
        "nav.saved" to "সংরক্ষিত",
        "nav.profile" to "প্রোফাইল",
        "nav.voice" to "ভয়েস",
        "nav.settings" to "সেটিংস",
        "home.tagline" to "সরকারি কল্যাণ প্রকল্প",
        "home.heroTitle" to "যোগ্য প্রকল্প খুঁজুন",
        "home.heroSubtitle" to "আপনার প্রোফাইল অনুযায়ী সরকারি প্রকল্প খুঁজুন।",
        "home.voiceCardTitle" to "ভয়েস সহকারীর সাথে কথা বলুন",
        "home.voiceCardSubtitle" to "মুখে কথা বলে প্রকল্প খুঁজুন",
        "home.quickNeeds" to "দ্রুত প্রয়োজন",
        "home.eligibleSchemes" to "যোগ্য প্রকল্প",
        "home.viewAll" to "সকল দেখুন",
        "category.agriculture" to "কৃষি",
        "category.education" to "শিক্ষা",
        "category.housing" to "আবাসন",
        "category.employment" to "কর্মসংস্থান",
        "category.women" to "মহিলা কল্যাণ",
        "category.senior" to "প্রবীণ নাগরিক",
        "category.health" to "স্বাস্থ্য",
        "category.financial" to "আর্থিক সহায়তা",
        "action.whyMe" to "আমার জন্য কেন?",
        "action.save" to "সংরক্ষণ করুন",
        "action.saved" to "সংরক্ষিত",
        "action.details" to "বিস্তারিত",
        "action.continue" to "এগিয়ে যান",
        "action.submit" to "জমা দিন",
        "action.back" to "পেছনে",
        "action.changeLanguage" to "ভাষা",
        "profile.title" to "নাগরিক প্রোফাইল",
        "profile.fullName" to "সম্পূর্ণ নাম",
        "profile.age" to "বয়স",
        "profile.gender" to "লিঙ্গ",
        "profile.district" to "জেলা",
        "profile.occupation" to "পেশা",
        "profile.annualIncome" to "বার্ষিক আয়",
        "profile.saveProfile" to "প্রোফাইল সংরক্ষণ করুন"
    )

    private val MR_STRINGS = mapOf(
        "app.name" to "पॅक्स सहायक",
        "app.tagline" to "शासकीय योजना जाणून घ्या, आपले हक्क मिळवा।",
        "nav.home" to "मुख्यपृष्ठ",
        "nav.matches" to "योजना",
        "nav.saved" to "जतन केलेल्या",
        "nav.profile" to "प्रोफाइल",
        "nav.voice" to "व्हॉइस",
        "nav.settings" to "सेटिंग्ज",
        "home.tagline" to "शासकीय कल्याणकारी योजना",
        "home.heroTitle" to "पात्र योजना शोधा",
        "home.heroSubtitle" to "आपल्या प्रोफाइलनुसार योग्य शासकीय योजना शोधा.",
        "home.voiceCardTitle" to "व्हॉइस सहाय्यकाशी बोला",
        "home.voiceCardSubtitle" to "आवाजाने योजना शोधा",
        "home.quickNeeds" to "तातडीच्या गरजा",
        "home.eligibleSchemes" to "पात्र योजना",
        "home.viewAll" to "सर्व पहा",
        "category.agriculture" to "कृषी",
        "category.education" to "शिक्षण",
        "category.housing" to "गृहनिर्माण",
        "category.employment" to "रोजगार",
        "category.women" to "महिला कल्याण",
        "category.senior" to "ज्येष्ठ नागरिक",
        "category.health" to "आरोग्य",
        "category.financial" to "आर्थिक सहाय्य",
        "action.whyMe" to "माझ्यासाठी का?",
        "action.save" to "जतन करा",
        "action.saved" to "जतन केले",
        "action.details" to "तपशील",
        "action.continue" to "पुढे जा",
        "action.submit" to "सादर करा",
        "action.back" to "मागे",
        "action.changeLanguage" to "भाषा",
        "profile.title" to "नागरिक प्रोफाइल",
        "profile.fullName" to "पूर्ण नाव",
        "profile.age" to "वय",
        "profile.gender" to "लिंग",
        "profile.district" to "जिल्हा",
        "profile.occupation" to "व्यवसाय",
        "profile.annualIncome" to "वार्षिक उत्पन्न",
        "profile.saveProfile" to "प्रोफाइल जतन करा"
    )

    private val GU_STRINGS = mapOf(
        "app.name" to "પેક્સ સહાયક",
        "app.tagline" to "સરકારી યોજનાઓ જાણો, તમારા હક મેળવો.",
        "nav.home" to "હોમ",
        "nav.matches" to "યોજનાઓ",
        "nav.saved" to "સાચવેલ",
        "nav.profile" to "પ્રોફાઇલ",
        "nav.voice" to "વોઇસ",
        "nav.settings" to "સેટિંગ્સ",
        "home.tagline" to "સરકારી કલ્યાણકારી યોજનાઓ",
        "home.heroTitle" to "પાત્ર યોજનાઓ શોધો",
        "home.heroSubtitle" to "તમારી પ્રોફાઇલ મુજબ યોગ્ય સરકારી યોજનાઓ શોધો.",
        "home.voiceCardTitle" to "વોઇસ સહાયક સાથે વાત કરો",
        "home.voiceCardSubtitle" to "અવાજથી યોજનાઓ શોધો",
        "home.quickNeeds" to "ઝડપી જરૂરિયાતો",
        "home.eligibleSchemes" to "પાત્ર યોજનાઓ",
        "home.viewAll" to "બધી જુઓ",
        "category.agriculture" to "ખેતી",
        "category.education" to "શિક્ષણ",
        "category.housing" to "આવાસ",
        "category.employment" to "રોજગાર",
        "category.women" to "મહિલા કલ્યાણ",
        "category.senior" to "વરિષ્ઠ નાગરિકો",
        "category.health" to "આરોગ્ય",
        "category.financial" to "નાણાકીಯ સહાય",
        "action.whyMe" to "મને કેમ?",
        "action.save" to "સાચવો",
        "action.saved" to "સાચવેલ છે",
        "action.details" to "વિગતો",
        "action.continue" to "આગળ વધો",
        "action.submit" to "સબમિટ કરો",
        "action.back" to "પાછળ",
        "action.changeLanguage" to "ભાષા",
        "profile.title" to "નાગરિક પ્રોફાઇલ",
        "profile.fullName" to "પૂરું નામ",
        "profile.age" to "ઉંમર",
        "profile.gender" to "જાતિ",
        "profile.district" to "જિલ્લો",
        "profile.occupation" to "વ્યવસાય",
        "profile.annualIncome" to "વાર્ષિક આવક",
        "profile.saveProfile" to "પ્રોફાઇલ સાચવો"
    )

    private val OR_STRINGS = mapOf(
        "app.name" to "ପ୍ୟାକ୍ସ ସହାୟକ",
        "app.tagline" to "ସରକାରୀ ଯୋଜନା ଜାଣନ୍ତୁ, ନିଜର ଅଧିକାର ପାଆନ୍ତୁ।",
        "nav.home" to "ମୁଖ୍ୟପୃଷ୍ଠା",
        "nav.matches" to "ଯୋଜନା",
        "nav.saved" to "ସଂରକ୍ଷିତ",
        "nav.profile" to "ପ୍ରୋଫାଇଲ୍",
        "nav.voice" to "ଭଏସ୍",
        "nav.settings" to "ସେଟିଙ୍ଗ୍ସ",
        "home.tagline" to "ସରକାରୀ କଲ୍ୟାଣକାରୀ ଯୋଜନା",
        "home.heroTitle" to "ଯୋଗ୍ୟ ଯୋଜନା ଖୋଜନ୍ତୁ",
        "home.heroSubtitle" to "ଆପଣଙ୍କ ପ୍ରୋଫାଇଲ୍ ଅନୁଯାୟୀ ସରକାରୀ ଯୋଜନା ଖୋଜନ୍ତୁ।",
        "home.voiceCardTitle" to "ଭଏସ୍ ସହାୟକଙ୍କ ସହ କଥା ହୁଅନ୍ତୁ",
        "home.voiceCardSubtitle" to "ଭଏସ୍ ମାଧ୍ୟମରେ ଯୋଜନା ଖୋଜନ୍ତୁ",
        "home.quickNeeds" to "ଦ୍ରୁତ ଆବଶ୍ୟକତା",
        "home.eligibleSchemes" to "ଯୋଗ୍ୟ ଯୋଜନା",
        "home.viewAll" to "ସମସ୍ତ ଦେଖନ୍ତୁ",
        "category.agriculture" to "କୃଷି",
        "category.education" to "ଶିକ୍ଷା",
        "category.housing" to "ଆବାସ",
        "category.employment" to "ରୋଜଗାର",
        "category.women" to "ମହିଳା କଲ୍ୟାଣ",
        "category.senior" to "ବରିଷ୍ଠ ନାଗରିକ",
        "category.health" to "ସ୍ୱାସ୍ଥ୍ୟ",
        "category.financial" to "ଆର୍ଥିକ ସହାୟତା",
        "action.whyMe" to "ମୋ ପାଇଁ କାହିଁକି?",
        "action.save" to "ସଂରକ୍ଷଣ କରନ୍ତୁ",
        "action.saved" to "ସଂରକ୍ଷିତ",
        "action.details" to "ବିସ୍ତୃତ",
        "action.continue" to "ଆଗକୁ ବଢ଼ନ୍ତୁ",
        "action.submit" to "ଦାଖଲ କରନ୍ତୁ",
        "action.back" to "ପଛକୁ",
        "action.changeLanguage" to "ଭାଷା",
        "profile.title" to "ନାଗରିକ ପ୍ରୋଫାଇଲ୍",
        "profile.fullName" to "ପୂରା ନାମ",
        "profile.age" to "ବୟସ",
        "profile.gender" to "ଲିଙ୍ଗ",
        "profile.district" to "ଜିଲ୍ଲା",
        "profile.occupation" to "ବୃତ୍ତି",
        "profile.annualIncome" to "ବାର୍ଷିକ ଆୟ",
        "profile.saveProfile" to "ପ୍ରୋଫାଇଲ୍ ସଂରକ୍ଷଣ କରନ୍ତୁ"
    )

    private val PA_STRINGS = mapOf(
        "app.name" to "ਪੈਕਸ ਸਹਾਇਕ",
        "app.tagline" to "ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਜਾਣੋ, ਆਪਣੇ ਹੱਕ ਪ੍ਰਾਪਤ ਕਰੋ।",
        "nav.home" to "ਮੁੱਖ ਸਫ਼ਾ",
        "nav.matches" to "ਸਕੀਮਾਂ",
        "nav.saved" to "ਸੰਭਾਲੀਆਂ ਗਈਆਂ",
        "nav.profile" to "ਪ੍ਰੋਫ਼ਾਈਲ",
        "nav.voice" to "ਵੌਇਸ",
        "nav.settings" to "ਸੈਟਿੰਗਾਂ",
        "home.tagline" to "ਸਰਕਾਰੀ ਭਲਾਈ ਸਕੀਮਾਂ",
        "home.heroTitle" to "ਯੋਗ ਸਕੀਮਾਂ ਲੱਭੋ",
        "home.heroSubtitle" to "ਆਪਣੀ ਪ੍ਰੋਫ਼ਾਈਲ ਅਨੁਸਾਰ ਸਰਕਾਰੀ ਭਲਾਈ ਸਕੀਮਾਂ ਲੱਭੋ।",
        "home.voiceCardTitle" to "ਵੌਇਸ ਸਹਾਇਕ ਨਾਲ ਗੱਲ ਕਰੋ",
        "home.voiceCardSubtitle" to "ਬੋਲ ਕੇ ਸਕੀਮਾਂ ਲੱਭੋ",
        "home.quickNeeds" to "ਤੁਰੰਤ ਲੋੜਾਂ",
        "home.eligibleSchemes" to "ਯੋਗ ਸਕੀਮਾਂ",
        "home.viewAll" to "ਸਾਰੀਆਂ ਵੇਖੋ",
        "category.agriculture" to "ਖੇਤੀਬਾੜੀ",
        "category.education" to "ਸਿੱਖਿਆ",
        "category.housing" to "ਰਿਹਾਇਸ਼",
        "category.employment" to "ਰੁਜ਼ਗਾਰ",
        "category.women" to "ਮਹਿਲਾ ਭਲਾਈ",
        "category.senior" to "ਬਜ਼ੁਰਗ ਨਾਗਰਿਕ",
        "category.health" to "ਸਿਹਤ",
        "category.financial" to "ਵਿੱਤੀ ਸਹਾਇਤਾ",
        "action.whyMe" to "ਮੇਰੇ ਲਈ ਕਿਉਂ?",
        "action.save" to "ਸੰਭਾਲੋ",
        "action.saved" to "ਸੰਭਾਲਿਆ ਗਿਆ",
        "action.details" to "ਵੇਰਵੇ",
        "action.continue" to "ਅੱਗੇ ਵਧੋ",
        "action.submit" to "ਜਮ੍ਹਾਂ ਕਰੋ",
        "action.back" to "ਪਿੱਛੇ",
        "action.changeLanguage" to "ਭਾਸ਼ਾ",
        "profile.title" to "ਨਾਗਰਿਕ ਪ੍ਰੋਫ਼ਾਈਲ",
        "profile.fullName" to "ਪੂਰਾ ਨਾਮ",
        "profile.age" to "ਉਮਰ",
        "profile.gender" to "ਲਿੰਗ",
        "profile.district" to "ਜ਼ਿਲ੍ਹਾ",
        "profile.occupation" to "ਕਿੱਤਾ",
        "profile.annualIncome" to "ਸਾਲਾਨਾ ਆਮਦਨ",
        "profile.saveProfile" to "ਪ੍ਰੋਫ਼ਾਈਲ ਸੰਭਾਲੋ"
    )

    private val AS_STRINGS = mapOf(
        "app.name" to "পেক্স সহায়ক",
        "app.tagline" to "চৰকাৰী আঁচনি জানক, নিজৰ অধিকাৰ লাভ কৰক।",
        "nav.home" to "গৃহ",
        "nav.matches" to "আঁচনিসমূহ",
        "nav.saved" to "সংৰক্ষিত",
        "nav.profile" to "প্রোফাইল",
        "nav.voice" to "ভয়েচ",
        "nav.settings" to "ছেটিংছ",
        "home.tagline" to "চৰকাৰী কল্যাণমূলক আঁচনি",
        "home.heroTitle" to "উপযুক্ত আঁচনি সন্ধান কৰক",
        "home.heroSubtitle" to "আপোনাৰ প্রোফাইল অনুসৰি চৰকাৰী আঁচনি জানক।",
        "home.voiceCardTitle" to "ভয়েচ সহায়কৰ সৈতে কথা পাতক",
        "home.voiceCardSubtitle" to "কথা কৈ আঁচনি বিচাৰক",
        "home.quickNeeds" to "জৰুৰী প্ৰয়োজন",
        "home.eligibleSchemes" to "উপযুক্ত আঁচনি",
        "home.viewAll" to "সকলো চাওক",
        "home.findMySchemes" to "মোৰ আঁচনি বিচাৰক",
        "home.speakToAssistant" to "পেক্স সহায়কৰ সৈতে কথা পাতক",
        "home.matchedWelfareSchemes" to "উপযুক্ত কল্যাণমূলক আঁচনি",
        "category.agriculture" to "কৃষি",
        "category.education" to "শিক্ষা",
        "category.housing" to "গৃহনিৰ্মাণ",
        "category.employment" to "নিয়োগ",
        "category.women" to "মহিলা কল্যাণ",
        "category.senior" to "জেষ্ঠ নাগৰিক",
        "category.health" to "স্বাস্থ্য",
        "category.financial" to "বিত্তীয় সাহায্য",
        "action.whyMe" to "মোৰ বাবে কিয়?",
        "action.save" to "সংৰক্ষণ",
        "action.saved" to "সংৰক্ষিত",
        "action.details" to "বিস্তাৰিত",
        "action.continue" to "আগবাঢ়ক",
        "action.submit" to "জমা দিয়ক",
        "action.back" to "উভতি যাওক",
        "action.changeLanguage" to "ভাষা",
        "profile.title" to "নাগৰিক প্রোফাইল",
        "profile.fullName" to "সম্পূৰ্ণ নাম",
        "profile.age" to "বয়স",
        "profile.gender" to "লিঙ্গ",
        "profile.district" to "জিলা",
        "profile.occupation" to "বৃত্তি",
        "profile.annualIncome" to "বাৰ্ষিক আয়",
        "profile.saveProfile" to "প্রোফাইল সংৰক্ষণ কৰক",
        "scheme.whyMe" to "মোৰ বাবে কিয়?",
        "scheme.viewDetails" to "বিস্তাৰিত চাওক",
        "scheme.statusEligible" to "১০০% যোগ্য",
        "scheme.statusMoreInfo" to "অতিৰিক্ত তথ্য প্ৰয়োজন",
        "scheme.statusPending" to "মূল্যাংকন বাকী",
        "matches.title" to "আপোনাৰ উপযুক্ত আঁচনি",
        "matches.subtitle" to "চৰকাৰী নিয়ম অনুসৰি পৰীক্ষা কৰা হৈছে।",
        "matches.noMatchesTitle" to "কোনো আঁচনি পোৱা নগ'ল",
        "matches.noMatchesDesc" to "বৰ্তমান কোনো আঁচনি উপলব্ধ নহয়।",
        "matches.noProfileTitle" to "প্ৰোফাইল সৃষ্টি কৰা হোৱা নাই",
        "matches.noProfileDesc" to "আঁচনিসমূহ মূল্যাংকন কৰিবলৈ অনুগ্ৰহ কৰি আপোনাৰ তথ্য পূৰণ কৰক।",
        "saved.title" to "সংৰক্ষিত আঁচনিসমূহ",
        "saved.emptyTitle" to "কোনো সংৰক্ষিত আঁচনি নাই",
        "saved.emptyDesc" to "আপুনি সহজে বিচাৰি পাবলৈ আঁচনি সংৰক্ষণ কৰিব পাৰে।"
    )
}

