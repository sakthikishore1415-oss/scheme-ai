package com.pacssahayak.ui.navigation

sealed class Screen(val route: String, val title: String, val tamilTitle: String) {
    object Splash : Screen("splash", "Splash", "தொடக்கத்திரை")
    object Language : Screen("language", "Language", "மொழி தேர்வு")
    object Home : Screen("home", "Home", "முகப்பு")
    object Profile : Screen("profile", "Citizen Profile", "சுயவிவரம்")
    object VoiceInput : Screen("voice", "Voice Assistant", "குரல் உதவி")
    object Matches : Screen("matches", "My Matches", "பொருந்தும் திட்டங்கள்")
    object SchemeDetails : Screen("scheme_details/{schemeId}", "Scheme Details", "திட்ட விவரம்") {
        fun createRoute(schemeId: String) = "scheme_details/$schemeId"
    }
    object WhyMe : Screen("why_me/{schemeId}", "Why Me?", "எனக்கு ஏன்?") {
        fun createRoute(schemeId: String) = "why_me/$schemeId"
    }
    object Documents : Screen("documents", "Documents Checklist", "ஆவண சரிபார்ப்பு")
    object Saved : Screen("saved", "Saved Schemes", "சேமிக்கப்பட்டவை")
    object Settings : Screen("settings", "Settings", "அமைப்புகள்")
}

