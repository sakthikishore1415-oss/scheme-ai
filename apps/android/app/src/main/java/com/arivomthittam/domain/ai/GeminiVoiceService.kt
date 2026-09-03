package com.arivomthittam.domain.ai

import com.arivomthittam.BuildConfig
import com.arivomthittam.data.model.CitizenProfile
import com.arivomthittam.data.model.Scheme
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject
import java.io.OutputStreamWriter
import java.net.HttpURLConnection
import java.net.URL

object GeminiVoiceService {
    const val GEMINI_MODEL = "gemini-3.6-flash"

    /**
     * Generates a context-aware natural conversational reply in the citizen's selected language
     * strictly grounded in verified scheme facts.
     */
    suspend fun generateConversationalReply(
        spokenText: String = "",
        language: String,
        stateName: String,
        profile: CitizenProfile,
        matchingSchemes: List<Scheme>
    ): String = withContext(Dispatchers.IO) {
        val apiKey = BuildConfig.GEMINI_API_KEY
        if (apiKey.isBlank()) {
            return@withContext getFallbackReply(spokenText, language, matchingSchemes)
        }

        try {
            val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/$GEMINI_MODEL:generateContent?key=$apiKey"
            val url = URL(endpoint)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 8000
                readTimeout = 8000
            }

            val systemInstruction = when (language) {
                "ml" -> "നിങ്ങൾ അറിവോം (Arivom) എന്ന സർക്കാർ പദ്ധതി ശബ്ദ സഹായിയാണ്. സ്വാഭാവിക മലയാളത്തിൽ മാത്രം സംസാരിക്കുക. തമിഴ് വാക്കുകൾ ഒരിക്കലും ഉപയോഗിക്കരുത്. പദ്ധതി അർഹതകൾ നിർബന്ധമായും താഴെ നൽകിയ വിവരങ്ങളിൽ നിന്ന് മാത്രം നൽകുക."
                "ta" -> "நீங்கள் அறிவோம் (Arivom) அரசு நலத்திட்ட குரல் வழிகாட்டி. இயல்பான தமிழில் மட்டும் பேசவும். அரசு திட்ட தகவல்களை எப்போதும் துல்லியமாக விளக்குங்கள்."
                else -> "You are Arivom, a friendly government scheme discovery assistant for India ($stateName). Keep responses concise, warm, conversational, and strictly grounded in the provided verified schemes."
            }

            val schemeSummary = matchingSchemes.take(3).joinToString("; ") {
                "${it.name} (${it.benefits.shortSummary})"
            }

            val prompt = """
                Citizen Spoke: "$spokenText"
                Citizen Profile: Age ${profile.age}, Occupation: ${profile.occupation}, District: ${profile.district ?: "General"}, State: $stateName.
                Verified Matching Schemes: $schemeSummary.
                
                Respond in 1-2 natural spoken sentences directly answering the user in the selected language ($language).
            """.trimIndent()

            val requestJson = JSONObject().apply {
                put("contents", JSONArray().apply {
                    put(JSONObject().apply {
                        put("role", "user")
                        put("parts", JSONArray().apply {
                            put(JSONObject().put("text", "$systemInstruction\n\n$prompt"))
                        })
                    })
                })
                put("generationConfig", JSONObject().apply {
                    put("temperature", 0.4)
                    put("maxOutputTokens", 150)
                })
            }

            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(requestJson.toString())
                writer.flush()
            }

            if (connection.responseCode == 200) {
                val responseText = connection.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(responseText)
                val candidateText = json.getJSONArray("candidates")
                    .getJSONObject(0)
                    .getJSONObject("content")
                    .getJSONArray("parts")
                    .getJSONObject(0)
                    .getString("text")
                return@withContext candidateText.trim()
            }
        } catch (e: Exception) {
            // Graceful fallback to deterministic local logic
        }

        return@withContext getFallbackReply(spokenText, language, matchingSchemes)
    }

    private fun getFallbackReply(spokenText: String, language: String, matchingSchemes: List<Scheme>): String {
        val topScheme = matchingSchemes.firstOrNull()?.name ?: "Government Schemes"
        return when (language) {
            "ml" -> if (matchingSchemes.isNotEmpty()) {
                "താങ്കളുടെ വിവരങ്ങൾ പ്രകാരം ${matchingSchemes.size} സർക്കാർ പദ്ധതികൾ ലഭ്യമാണ്. പ്രധാന പദ്ധതി: $topScheme. കൂടുതൽ അറിയണമെന്നുണ്ടോ?"
            } else {
                "താങ്കൾ പറഞ്ഞത് മനസ്സിലായി. അർഹമായ പദ്ധതികൾക്കായി കൂടുതൽ വിവരങ്ങൾ നൽകാം."
            }
            "ta" -> if (matchingSchemes.isNotEmpty()) {
                "உங்கள் தகுதியின் அடிப்படையில் ${matchingSchemes.size} அரசு திட்டங்கள் கண்டறியப்பட்டுள்ளன. முதன்மை திட்டம்: $topScheme. இதன் பலன்களை அறிய விரும்புகிறீர்களா?"
            } else {
                "நீங்கள் கூறியது புரிந்தது. உங்களுக்கு பொருத்தமான அரசு திட்டங்களை தேடுகிறேன்."
            }
            else -> if (matchingSchemes.isNotEmpty()) {
                "Based on your profile, ${matchingSchemes.size} schemes match your criteria, including $topScheme. Would you like to hear the benefits?"
            } else {
                "Understood. Searching verified government welfare schemes matching your profile."
            }
        }
    }
}

