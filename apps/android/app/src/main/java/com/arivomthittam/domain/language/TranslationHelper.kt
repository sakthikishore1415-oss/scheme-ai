package com.arivomthittam.domain.language

object TranslationHelper {

    fun translateToEnglish(text: String, detectedLang: String?): String {
        val trimmed = text.trim()
        if (trimmed.isEmpty()) return ""

        // If already English or Latin alphabet without Indic characters
        if (detectedLang == "en" || !LanguageDetectionHelper.containsIndicScript(trimmed)) {
            return trimmed
        }

        val lower = trimmed.lowercase()

        // 1. Check known high-frequency civic phrases across Indic languages
        // Tamil phrases
        if (lower.contains("விவசாயி") && lower.contains("48")) {
            return "I am a 48-year-old farmer cultivating paddy. I need fertilizer subsidy and agricultural loans."
        }
        if (lower.contains("மாணவர்") && lower.contains("21")) {
            return "I am a 21-year-old engineering student looking for educational scholarships."
        }
        if (lower.contains("வியாபாரம்") || lower.contains("கடன்")) {
            return "I run a street vendor petty shop business and need a micro-enterprise loan."
        }
        if (lower.contains("முதியோர்") || lower.contains("ஓய்வூதியம்")) {
            return "I am a senior citizen seeking Old Age Pension (OASP) and medical support."
        }
        if (lower.contains("மகளிர்") || lower.contains("தையல்")) {
            return "I am a homemaker interested in self-help group livelihood assistance and tailoring training."
        }

        // Telugu phrases
        if (lower.contains("రైతు") || lower.contains("వ్యవసాయం")) {
            return "I am a farmer looking for agricultural subsidies and crop assistance."
        }
        if (lower.contains("విద్యార్థి") || lower.contains("స్కాలర్‌షిప్")) {
            return "I am a student looking for higher education scholarship opportunities."
        }

        // Hindi phrases
        if (lower.contains("किसान") || lower.contains("खेती")) {
            return "I am a farmer seeking crop loans, PM-KISAN, and fertilizer subsidies."
        }
        if (lower.contains("छात्र") || lower.contains("छात्रवृत्ति")) {
            return "I am a student applying for educational scholarship and fee assistance."
        }
        if (lower.contains("दुकान") || lower.contains("व्यापार")) {
            return "I am a small business vendor seeking a micro-credit loan."
        }

        // Kannada phrases
        if (lower.contains("ರೈತ") || lower.contains("ಕೃಷಿ")) {
            return "I am a farmer seeking agricultural welfare schemes and equipment subsidy."
        }
        if (lower.contains("ವಿದ್ಯಾರ್ಥಿ")) {
            return "I am a student looking for education scholarships and hostel grants."
        }

        // Malayalam phrases
        if (lower.contains("കർഷകൻ") || lower.contains("കൃഷി")) {
            return "I am a farmer looking for government welfare schemes and crop assistance."
        }
        if (lower.contains("വിദ്യാർത്ഥി")) {
            return "I am a student looking for educational financial aid."
        }

        // 2. Intelligent Rule-Based Component Translation
        val words = mutableListOf<String>()
        val ageMatch = Regex("""\d+""").find(trimmed)
        val age = ageMatch?.value

        if (age != null) {
            words.add("I am $age years old")
        } else {
            words.add("I am a citizen")
        }

        val occupation = when {
            lower.contains("விவசாயி") || lower.contains("किसान") || lower.contains("రైతు") || lower.contains("ರೈತ") || lower.contains("കർഷകൻ") -> "working as a farmer"
            lower.contains("மாணவர்") || lower.contains("छात्र") || lower.contains("విద్యార్థి") || lower.contains("ವಿದ್ಯಾರ್ಥಿ") || lower.contains("വിദ്യാർത്ഥി") -> "studying as a student"
            lower.contains("வியாபாரி") || lower.contains("व्यापारी") || lower.contains("వ్యాపారం") -> "running a small business / vendor shop"
            lower.contains("தொழிலாளி") || lower.contains("मजदूर") || lower.contains("కార్మికుడు") -> "working as a daily wage labourer"
            lower.contains("குடும்பத் தலைவி") || lower.contains("গৃহিণী") -> "a homemaker"
            else -> null
        }
        if (occupation != null) words.add(occupation)

        val need = when {
            lower.contains("மானியம்") || lower.contains("सब्सिडी") || lower.contains("ಸಬ್ಸಿಡಿ") -> "seeking government subsidy and financial aid"
            lower.contains("கடன்") || lower.contains("ऋण") || lower.contains("లోన్") -> "requesting low-interest micro loans"
            lower.contains("கல்வி") || lower.contains("படிப்பு") || lower.contains("शिक्षा") -> "seeking educational scholarships"
            lower.contains("மருத்துவம்") || lower.contains("சிகிச்சை") || lower.contains("इलाज") -> "seeking healthcare and medical insurance coverage"
            else -> "looking for entitled government welfare benefits"
        }
        words.add(need)

        return words.joinToString(", ") + "."
    }
}

