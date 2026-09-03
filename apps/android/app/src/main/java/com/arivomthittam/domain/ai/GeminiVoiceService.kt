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

    fun getGreeting(language: String): String {
        return when (language) {
            "ml" -> "നമസ്കാരം! ഞാൻ അറിവോം. നിങ്ങൾക്ക് എന്ത് സർക്കാർ പദ്ധതിയാണ് വേണ്ടത്?"
            "ta" -> "வணக்கம்! நான் அறிவோம். உங்களுக்கு என்ன அரசு திட்டம் வேண்டும்?"
            "te" -> "నమస్కారం! నేను అరివోమ్. మీకు ఏ ప్రభుత్వ పథకం కావాలి?"
            "kn" -> "ನಮಸ್ಕಾರ! ನಾನು ಅರಿವೋಮ್. ನಿಮಗೆ ಯಾವ ಸರಕಾರಿ ಯೋಜನೆ ಬೇಕು?"
            "hi" -> "नमस्ते! मैं अरिवोम हूँ। आपको कौन सी सरकारी योजना की जानकारी चाहिए?"
            "bn" -> "নমস্কার! আমি আরিবোম। আপনার কী সরকারি প্রকল্প প্রয়োজন?"
            "mr" -> "नमस्कार! मी अरिवोम. आपल्याला कोणत्या सरकारी योजनेची माहिती हवी आहे?"
            "gu" -> "નમસ્તે! હું અરિવોમ છું. તમારે કઈ સરકારી યોજનાની જરૂર છે?"
            else -> "Hello! I am Arivom. Which government welfare scheme are you looking for today?"
        }
    }

    val starterSuggestions: Map<String, List<String>> = mapOf(
        "ta" to listOf(
            "விவசாயிகளுக்கான உதவி திட்டங்கள் என்ன?",
            "மாணவர்களுக்கான கல்வி உதவித்தொகை பற்றி கூறுங்கள்.",
            "மகளிர் சுயதொழில் கடன் திட்டங்கள் என்னென்ன?"
        ),
        "ml" to listOf(
            "കർഷകർക്കുള്ള പ്രധാന ആനുകൂല്യങ്ങൾ എന്തൊക്കെയാണ്?",
            "വിദ്യാർത്ഥികൾക്കുള്ള സ്കോളർഷിപ്പുകളെക്കുറിച്ച് പറയൂ.",
            "വനിതാ സ്വയംതൊഴിൽ വായ്പകൾ എന്തൊക്കെയാണ്?"
        ),
        "te" to listOf(
            "రైతుల కోసం ఉన్న ప్రభుత్వ పథకాలు ఏమిటి?",
            "విద్యార్థుల స్కాలర్‌షిప్‌ల గురించి చెప్పండి.",
            "మహిళల స్వయం ఉపాధి రుణాలు ఏమిటి?"
        ),
        "kn" to listOf(
            "ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಯೋಜನೆಗಳು ಯಾವುವು?",
            "ವಿದ್ಯಾರ್ಥಿಗಳಿಗೆ ವಿದ್ಯಾರ್ಥಿವೇತನದ ವಿವರಗಳನ್ನು ತಿಳಿಸಿ.",
            "ಮಹಿಳಾ ಸ್ವಯಂ ಉದ್ಯೋಗ ಸಾಲಗಳು ಯಾವುವು?"
        ),
        "hi" to listOf(
            "किसानों के लिए प्रमुख सरकारी योजनाएं क्या हैं?",
            "उच्च शिक्षा के लिए छात्रवृत्ति कैसे मिलती है?",
            "महिला स्व-रोजगार ऋण योजनाएं क्या हैं?"
        ),
        "en" to listOf(
            "Tell me about welfare initiatives for farmers.",
            "What scholarships are available for college students?",
            "How can women entrepreneurs apply for business loans?"
        )
    )

    /**
     * Generates a context-aware natural conversational reply in the citizen's selected language
     * strictly grounded in verified scheme facts.
     */
    suspend fun generateConversationalReply(
        spokenText: String = "",
        language: String,
        stateName: String,
        profile: CitizenProfile,
        matchingSchemes: List<Scheme> = emptyList(),
        isFastMode: Boolean = true,
        history: List<Pair<String, String>> = emptyList()
    ): String = withContext(Dispatchers.IO) {
        val xaiKey = if (BuildConfig.XAI_API_KEY.isNotBlank()) BuildConfig.XAI_API_KEY else "xai-HGfw0p7ZC3kABWgf29QA7wfqDQvNFQqfu8H336JL5auLBZFI0t1R5ll1DFmTGBPLU025MzsIhhqvhENP"
        val apiKey = if (BuildConfig.GEMINI_API_KEY.isNotBlank()) BuildConfig.GEMINI_API_KEY else "AQ.Ab8RN6JSV7z-KRN41yTnI3bUKbzFOGsw5ekHPVh5zSeoMt7DqA"

        val systemInstruction = when (language) {
            "ml" -> "നിങ്ങൾ അറിവോം (Arivom) എന്ന സർക്കാർ പദ്ധതി ശബ്ദ സഹായിയാണ്. സ്വാഭാവിക മലയാളത്തിൽ മാത്രം സംസാരിക്കുക. തമിഴ് വാക്കുകൾ ഒരിക്കലും ഉപയോഗിക്കരുത്. പദ്ധതി അർഹതകൾ നിർബന്ധമായും താഴെ നൽകിയ വിവരങ്ങളിൽ നിന്ന് മാത്രം നൽകുക."
            "ta" -> "நீங்கள் அறிவோம் (Arivom) அரசு நலத்திட்ட குரல் வழிகாட்டி. இயல்பான தமிழில் மட்டும் பேசவும். அரசு திட்ட தகவல்களை எப்போதும் துல்லியமாக சுருக்கமாக விளக்குங்கள்."
            "te" -> "మీరు అరివోమ్ (Arivom) ప్రభుత్వ పథకాల వాయిస్ అసిస్టెంట్. సహజమైన తెలుగులో మాత్రమే మాట్లాడండి."
            "kn" -> "ನೀವು ಅರಿವೋಮ್ (Arivom) ಸರಕಾರಿ ಯೋಜನೆಗಳ ಧ್ವನಿ ಸಹಾಯಕ. ನೈಸರ್ಗಿಕ ಕನ್ನಡದಲ್ಲಿ ಮಾತ್ರ ಮಾತನಾಡಿ."
            "hi" -> "आप अरिवोम (Arivom) सरकारी कल्याण योजना सहायक हैं। शुद्ध व सरल हिंदी में संक्षेप में उत्तर दें."
            else -> "You are Arivom, a friendly government scheme discovery voice assistant for India ($stateName). Keep responses concise, warm, conversational, and strictly grounded in the provided verified schemes."
        }

        // 1. Try xAI Grok API
        try {
            val xaiUrl = URL("https://api.x.ai/v1/chat/completions")
            val xaiConn = (xaiUrl.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("Authorization", "Bearer $xaiKey")
                doOutput = true
                connectTimeout = 4000
                readTimeout = 4000
            }

            val xaiMessages = JSONArray().apply {
                put(JSONObject().apply {
                    put("role", "system")
                    put("content", systemInstruction)
                })
                put(JSONObject().apply {
                    put("role", "user")
                    put("content", spokenText)
                })
            }

            val xaiBody = JSONObject().apply {
                put("messages", xaiMessages)
                put("model", "grok-beta")
                put("temperature", if (isFastMode) 0.3 else 0.5)
            }

            OutputStreamWriter(xaiConn.outputStream).use { it.write(xaiBody.toString()); it.flush() }

            if (xaiConn.responseCode == 200) {
                val resp = xaiConn.inputStream.bufferedReader().use { it.readText() }
                val choice = JSONObject(resp).optJSONArray("choices")?.optJSONObject(0)
                val grokText = choice?.optJSONObject("message")?.optString("content")
                if (!grokText.isNullOrBlank()) {
                    return@withContext grokText.replace(Regex("[*_#`\\[\\]()]"), "").trim()
                }
            }
        } catch (_: Exception) {}

        // 2. Google Gemini 3.6 Flash Fallback
        try {
            val endpoint = "https://generativelanguage.googleapis.com/v1beta/models/$GEMINI_MODEL:generateContent?key=$apiKey"
            val url = URL(endpoint)
            val connection = (url.openConnection() as HttpURLConnection).apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                doOutput = true
                connectTimeout = 7000
                readTimeout = 7000
            }

            val modeGuidance = if (isFastMode) {
                "⚡ FAST MODE: Keep answer ultra-concise (1-2 sentences maximum), direct, and easy to hear."
            } else {
                "🎙️ STUDIO MODE: Provide clear details on eligibility, benefits, and how to apply in 2-3 sentences."
            }

            val schemeSummary = matchingSchemes.take(3).joinToString("; ") {
                "${it.name} (${it.benefits.shortSummary})"
            }

            val historySummary = history.takeLast(3).joinToString("\n") { (role, txt) ->
                "$role: $txt"
            }

            val prompt = """
                $systemInstruction
                $modeGuidance
                
                Citizen Profile: Age ${profile.age}, Occupation: ${profile.occupation}, District: ${profile.district ?: "General"}, State: $stateName.
                Verified Schemes in Database: $schemeSummary.
                
                Recent Conversation:
                $historySummary
                
                Citizen Spoke / Typed: "$spokenText"
                
                Respond naturally in the citizen's language ($language).
            """.trimIndent()

            val requestJson = JSONObject().apply {
                put("contents", JSONArray().apply {
                    put(JSONObject().apply {
                        put("role", "user")
                        put("parts", JSONArray().apply {
                            put(JSONObject().put("text", prompt))
                        })
                    })
                })
                put("generationConfig", JSONObject().apply {
                    put("temperature", if (isFastMode) 0.3 else 0.5)
                    put("maxOutputTokens", if (isFastMode) 120 else 250)
                })
            }

            OutputStreamWriter(connection.outputStream).use { writer ->
                writer.write(requestJson.toString())
                writer.flush()
            }

            if (connection.responseCode == 200) {
                val responseText = connection.inputStream.bufferedReader().use { it.readText() }
                val json = JSONObject(responseText)
                val candidates = json.optJSONArray("candidates")
                if (candidates != null && candidates.length() > 0) {
                    val contentObj = candidates.getJSONObject(0).optJSONObject("content")
                    val partsArray = contentObj?.optJSONArray("parts")
                    if (partsArray != null) {
                        val sb = StringBuilder()
                        for (i in 0 until partsArray.length()) {
                            val part = partsArray.getJSONObject(i)
                            if (part.has("text")) {
                                sb.append(part.getString("text")).append(" ")
                            }
                        }
                        val resultText = sb.toString().replace(Regex("[*_#`\\[\\]()]"), "").trim()
                        if (resultText.isNotBlank()) {
                            return@withContext resultText
                        }
                    }
                }
            }
        } catch (e: Exception) {
            // Graceful fallback to deterministic local logic
        }

        return@withContext getFallbackReply(spokenText, language, matchingSchemes)
    }

    private fun getFallbackReply(spokenText: String, language: String, matchingSchemes: List<Scheme>): String {
        val top = matchingSchemes.firstOrNull()?.name ?: "பிரதான் மந்திரி கிசான் சம்மான் நிதி"
        return when (language) {
            "ml" -> "തീർച്ചയായും! നിങ്ങൾക്ക് അനുയോജ്യമായ സർക്കാർ പദ്ധതി കണ്ടെത്താം. $top പോലുള്ള പദ്ധതികൾ നിങ്ങൾക്ക് ലഭിക്കാൻ സാധ്യതയുണ്ട്."
            "ta" -> "நிச்சயமாக! உங்கள் தகுதிக்கு ஏற்ற அரசு திட்டங்களை கண்டறியலாம். $top திட்டம் உங்களுக்கு பொருந்தும்."
            "te" -> "తప్పకుండా! మీ అర్హతకు తగిన ప్రభుత్వ పథకాలను మేము కనుగొనవచ్చు. $top మీకు ఉపయోగపడుతుంది."
            "kn" -> "ಖಂಡಿತ! ನಿಮ್ಮ ಅರ್ಹತೆಗೆ ಸೂಕ್ತವಾದ ಸರಕಾರಿ ಯೋಜನೆಗಳನ್ನು ನಾವು ಹುಡುಕಬಹುದು."
            "hi" -> "ज़रूर! आपकी पात्रता के अनुसार उपयुक्त सरकारी योजनाएं खोजी जा रही हैं।"
            else -> "Sure! We can match the best government welfare schemes for you, such as $top."
        }
    }
}
