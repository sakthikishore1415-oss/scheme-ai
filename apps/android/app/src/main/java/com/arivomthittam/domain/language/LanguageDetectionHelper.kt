package com.arivomthittam.domain.language

import java.util.Locale

object LanguageDetectionHelper {

    /**
     * Unicode script ranges for Indian regional languages
     */
    fun detectLanguageFromText(text: String): String? {
        if (text.isBlank()) return null

        for (char in text) {
            val code = char.code
            when (code) {
                in 0x0B80..0x0BFF -> return "ta" // Tamil
                in 0x0C00..0x0C7F -> return "te" // Telugu
                in 0x0C80..0x0CFF -> return "kn" // Kannada
                in 0x0D00..0x0D7F -> return "ml" // Malayalam
                in 0x0900..0x097F -> return "hi" // Devanagari (Hindi / Marathi)
                in 0x0980..0x09FF -> return "bn" // Bengali / Assamese
                in 0x0A80..0x0AFF -> return "gu" // Gujarati
                in 0x0B00..0x0B7F -> return "or" // Odia
                in 0x0A00..0x0A7F -> return "pa" // Punjabi / Gurmukhi
            }
        }

        // If English / Latin characters are present
        if (text.any { it in 'a'..'z' || it in 'A'..'Z' }) {
            return "en"
        }

        return null
    }

    /**
     * Detects system device language on initial app startup
     */
    fun detectDeviceLanguage(): String {
        val deviceLang = Locale.getDefault().language.lowercase()
        return when (deviceLang) {
            "ta" -> "ta"
            "te" -> "te"
            "kn" -> "kn"
            "ml" -> "ml"
            "hi" -> "hi"
            "bn" -> "bn"
            "mr" -> "mr"
            "gu" -> "gu"
            "pa" -> "pa"
            else -> "en"
        }
    }
}
