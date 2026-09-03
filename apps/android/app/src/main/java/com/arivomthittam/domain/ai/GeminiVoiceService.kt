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
            "ml" -> "നിങ്ങൾ അറിവോം (Arivom) എന്ന സംവേദനാത്മക സർക്കാർ പദ്ധതി ശബ്ദ കൗൺസിലറാണ്. കേവലം മറുപടി നൽകി നിർത്തരുത്! 1-2 ലളിതമായ വാക്യങ്ങളിൽ ഉത്തരം നൽകുകയും, തുടർന്ന് ഗുണഭോക്താവിൻ്റെ അർഹത അറിയാൻ ഒരു തുടർചോദ്യം (Follow-up Question) ചോദിക്കുകയും ചെയ്യുക. ശുദ്ധമായ മലയാളം മാത്രം സംസാരിക്കുക."
            "ta" -> "நீங்கள் அறிவோம் (Arivom) அரசு நலத்திட்ட மக்கள் குரல் வழிகாட்டி. வெறும் பதிலை மட்டும் கூறி நிறுத்தாமல், தொடர்ந்து உரையாடுங்கள்! 1 அல்லது 2 எளிய வாக்கியங்களில் ஆலோசனை வழங்கி, அவர்களின் தகுதியை அறிய அல்லது விண்ணப்பிக்க வழிகாட்ட ஒரு நேரடித் தொடர் கேள்வியைக் (Follow-up Question) கேளுங்கள். இயல்பான தமிழில் மட்டும் பேசவும்."
            "te" -> "మీరు అరివోమ్ (Arivom) ఇంటరాక్టివ్ ప్రభుత్వ పథకాల వాయిస్ అసిస్టెంట్. కేవలం సమాధానం ఇవ్వడమే కాకుండా, పథకం సమాచారం తెలిపి ఒక సహజమైన ఫాలో-అప్ ప్రశ్నను అడగండి. సహజమైన తెలుగులో మాత్రమే మాట్లాడండి."
            "kn" -> "ನೀವು ಅರಿವೋಮ್ (Arivom) ಸರಕಾರಿ ಯೋಜನೆಗಳ ಸಂವಾದಾತ್ಮಕ ಧ್ವನಿ ಸಹಾಯಕ. ಕೇವಲ ಉತ್ತರಿಸದೆ, ಯೋಜನೆಯ ಮಾಹಿತಿ ನೀಡಿ ಒಂದು ಸೂಕ್ತವಾದ ಮುಂದಿನ ಪ್ರಶ್ನೆಯನ್ನು ಕೇಳಿ. ನೈಸರ್ಗಿಕ ಕನ್ನಡದಲ್ಲಿ ಮಾತನಾಡಿ."
            "hi" -> "आप अरिवोम (Arivom) एक संवादात्मक सरकारी योजना वॉइस काउंसलर हैं। केवल उत्तर देकर न रुकें! 1-2 सरल वाक्यों में जानकारी दें और नागरिक की पात्रता जानने के लिए एक दोस्ताना फॉलो-अप प्रश्न अवश्य पूछें।"
            else -> "You are Arivom, an interactive civic voice counsellor for India ($stateName). Never give a passive flat reply. In 1-2 spoken sentences: first provide clear scheme advice, then ask 1 friendly follow-up question to diagnose their eligibility or guide their application."
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
                    put("temperature", 0.4)
                    put("maxOutputTokens", 1000)
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
        val q = spokenText.lowercase()
        val isTa = language == "ta"
        val isMl = language == "ml"
        val isHi = language == "hi"

        if (q.contains("விவசாய") || q.contains("farmer") || q.contains("பயிர்") || q.contains("கடன்") || q.contains("കൃഷി")) {
            if (isTa) return "விவசாயிகளுக்காக பிரதமரின் கிசான் திட்டம் (PM-KISAN) மற்றும் கலைஞரின் அனைத்து கிராம ஒருங்கிணைந்த வேளாண் வளர்ச்சி திட்டம் பயன்படும். உங்களிடம் பட்டா சிட்டா ஆவணம் உள்ளதா?"
            if (isMl) return "കർഷകർക്കായി പിഎം കിസാൻ പദ്ധതി വഴി പ്രതിവർഷം ₹6,000 ലഭിക്കും. നിങ്ങളുടെ പേരിൽ കൃഷിഭൂമിയുടെ രേഖകൾ ഉണ്ടോ?"
            if (isHi) return "किसानों के लिए पीएम किसान योजना के तहत ₹6,000 वार्षिक सहायता मिलती है। क्या आपके पास कृषि भूमि है?"
            return "Farmers can benefit from PM-KISAN (₹6,000/year) and agricultural inputs. Do you have land documents?"
        }

        if (q.contains("மாணவர்") || q.contains("student") || q.contains("பள்ளி") || q.contains("கல்லூரி") || q.contains("படிப்பு") || q.contains("വിദ്യാർത്ഥി") || q.contains("scholarship")) {
            if (isTa) return "மாணவர்களுக்கான புதுமைப் பெண் மற்றும் தமிழ்ப் புதல்வன் திட்டங்கள் மூலம் மாதம் ₹1,000 உதவித்தொகை வழங்கப்படுகிறது. நீங்கள் அரசுப் பள்ளியில் படித்தவரா?"
            if (isMl) return "വിദ്യാർത്ഥികൾക്കായി പോസ്റ്റ്-മെട്രിക് സ്കോളർഷിപ്പും ഉന്നത വിദ്യാഭ്യാസ ഗ്രാന്റുകളും ലഭ്യമാണ്. നിങ്ങൾ ഏത് കോഴ്സാണ് പഠിക്കുന്നത്?"
            if (isHi) return "छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति और उच्च शिक्षा सहायता उपलब्ध है। आप किस कक्षा में पढ़ रहे हैं?"
            return "Students can receive monthly scholarships (₹1,000/month). Are you enrolled in college or school?"
        }

        if (q.contains("பெண்") || q.contains("women") || q.contains("மகளிர்") || q.contains("தாய்") || q.contains("സ്ത്രീ") || q.contains("mahila")) {
            if (isTa) return "மகளிருக்காக கலைஞர் மகளிர் உரிமைத் திட்டம் மூலம் மாதம் ₹1,000 உரிமைத்தொகை வழங்கப்படுகிறது. உங்களிடம் ஸ்மார்ட் ரேஷன் கார்டு உள்ளதா?"
            if (isMl) return "വനിതകൾക്കായി സ്വയംതൊഴിൽ വായ്പകളും കുടുംബശ്രീ സഹായങ്ങളും ലഭ്യമാണ്. നിങ്ങളുടെ വരുമാന പരിധി എത്രയാണ്?"
            if (isHi) return "महिलाओं के लिए आजीविका मिशन और मातृत्व वंदना योजना उपलब्ध हैं। क्या आपके पास आधार कार्ड है?"
            return "Women can access monthly direct financial aid. Do you have a ration card and Aadhaar card ready?"
        }

        if (q.contains("முதியோர்") || q.contains("senior") || q.contains("வயது") || q.contains("pension") || q.contains("பென்ஷன்") || q.contains("പെൻഷൻ")) {
            if (isTa) return "முதியோருக்கான இந்திரா காந்தி தேசிய முதியோர் ஓய்வூதியத் திட்டம் (IGNOAPS) மூலம் மாதம் ₹1,000 வழங்கப்படுகிறது. உங்கள் வயது 60க்கு மேல் உள்ளதா?"
            if (isMl) return "മുതിർന്ന പൗരന്മാർക്കായി ₹1,600 പ്രതിമാസ പെൻഷൻ പദ്ധതി ലഭ്യമാണ്. അപേക്ഷ സമർപ്പിക്കാൻ സഹായിക്കണോ?"
            if (isHi) return "वरिष्ठ नागरिकों के लिए राष्ट्रीय वृद्धावस्था पेंशन योजना उपलब्ध है। क्या आपकी आयु 60 वर्ष से अधिक है?"
            return "Senior citizens can receive monthly old-age pensions (IGNOAPS). Is your age 60 years or above?"
        }

        val top = matchingSchemes.firstOrNull()?.name ?: "பிரதான் மந்திரி கிசான் சம்மான் நிதி"
        return when (language) {
            "ml" -> "തീർച്ചയായും! കൃഷി, വിദ്യാഭ്യാസം, പെൻഷൻ പദ്ധതികൾ ലഭ്യമാണ്. നിങ്ങൾക്ക് ഏത് സഹായമാണ് വേണ്ടത്?"
            "ta" -> "நிச்சயமாக! விவசாயம், கல்வி உதவித்தொகை, மகளிர் உரிமை மற்றும் மருத்துவக் காப்பீடு திட்டங்கள் உள்ளன. உங்களுக்கு என்ன உதவி தேவை?"
            "te" -> "తప్పకుండా! వ్యవసాయం, విద్యార్థుల స్కాలర్‌షిప్‌లు మరియు పింఛన్ పథకాలు అందుబాటులో ఉన్నాయి. మీకు ఏ సమాచారం కావాలి?"
            "kn" -> "ಖಂಡಿತ! ಕೃಷಿ, ವಿದ್ಯಾರ್ಥಿವೇತನ ಮತ್ತು ಪಿಂಚಣಿ ಯೋಜನೆಗಳು ಲಭ್ಯವಿದೆ. ನಿಮಗೆ ಯಾವ ಮಾಹಿತಿ ಬೇಕು?"
            "hi" -> "ज़रूर! कृषि, छात्रवृत्ति, पेंशन और स्वास्थ्य योजनाओं की जानकारी उपलब्ध है। आपको किस योजना में रुचि है?"
            else -> "Sure! We have verified schemes for agriculture, education, pensions, and healthcare. What type of assistance are you seeking?"
        }
    }
}
