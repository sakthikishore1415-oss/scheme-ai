package com.arivomthittam.ui.screens.voice

import android.Manifest
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
import android.speech.tts.UtteranceProgressListener
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.automirrored.filled.VolumeMute
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.GraphicEq
import androidx.compose.material.icons.filled.Keyboard
import androidx.compose.material.icons.filled.Language
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Radio
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.arivomthittam.data.model.CitizenProfile
import com.arivomthittam.domain.ai.GeminiVoiceService
import com.arivomthittam.domain.language.AndroidTranslations
import com.arivomthittam.domain.language.LanguageDetectionHelper
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.*
import kotlinx.coroutines.launch
import java.util.Locale

data class ChatMessage(
    val id: String,
    val sender: String, // "user" or "assistant"
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
)

data class VoiceLanguageItem(
    val code: String,
    val name: String,
    val nativeName: String,
    val bcp47: String
)

val VOICE_LANGUAGES = listOf(
    VoiceLanguageItem("ta", "Tamil", "தமிழ்", "ta-IN"),
    VoiceLanguageItem("hi", "Hindi", "हिन्दी", "hi-IN"),
    VoiceLanguageItem("te", "Telugu", "తెలుగు", "te-IN"),
    VoiceLanguageItem("kn", "Kannada", "ಕನ್ನಡ", "kn-IN"),
    VoiceLanguageItem("ml", "Malayalam", "മലയാളം", "ml-IN"),
    VoiceLanguageItem("mr", "Marathi", "मराठी", "mr-IN"),
    VoiceLanguageItem("bn", "Bengali", "বাংলা", "bn-IN"),
    VoiceLanguageItem("gu", "Gujarati", "ગુજરાતી", "gu-IN"),
    VoiceLanguageItem("or", "Odia", "ଓଡ଼ିଆ", "or-IN"),
    VoiceLanguageItem("pa", "Punjabi", "ਪੰਜਾਬੀ", "pa-IN"),
    VoiceLanguageItem("as", "Assamese", "অসমীয়া", "as-IN"),
    VoiceLanguageItem("en", "English", "English", "en-IN")
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun VoiceInputScreen(
    currentLanguage: String,
    currentState: String,
    onProfileExtracted: (CitizenProfile) -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberLazyListState()

    // State Variables
    var activeLanguage by remember { mutableStateOf(currentLanguage) }
    var showLanguageDialog by remember { mutableStateOf(false) }
    var isListening by remember { mutableStateOf(false) }
    var isThinking by remember { mutableStateOf(false) }
    var isSpeaking by remember { mutableStateOf(false) }
    var isMuted by remember { mutableStateOf(false) }
    var isFastMode by remember { mutableStateOf(true) }
    var voiceSpeed by remember { mutableFloatStateOf(1.0f) }
    var interimTranscript by remember { mutableStateOf("") }
    var textInput by remember { mutableStateOf("") }
    var showKeyboard by remember { mutableStateOf(false) }

    val messages = remember { mutableStateListOf<ChatMessage>() }

    // TTS Engine
    var ttsEngine by remember { mutableStateOf<TextToSpeech?>(null) }

    val speakAloud: (String) -> Unit = { text ->
        if (!isMuted && ttsEngine != null) {
            isSpeaking = true
            ttsEngine?.setSpeechRate(voiceSpeed)
            ttsEngine?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "arivom_voice")
        }
    }

    // In-app Speech Recognizer
    val speechRecognizer = remember {
        try {
            SpeechRecognizer.createSpeechRecognizer(context)
        } catch (e: Exception) {
            null
        }
    }

    val startListening: () -> Unit = {
        ttsEngine?.stop()
        isSpeaking = false
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            val bcp47 = when (activeLanguage) {
                "ta" -> "ta-IN"
                "hi" -> "hi-IN"
                "te" -> "te-IN"
                "kn" -> "kn-IN"
                "ml" -> "ml-IN"
                "mr" -> "mr-IN"
                "bn" -> "bn-IN"
                "gu" -> "gu-IN"
                "or" -> "or-IN"
                "pa" -> "pa-IN"
                "as" -> "as-IN"
                else -> "en-IN"
            }
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, bcp47)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
        }
        try {
            speechRecognizer?.startListening(intent)
            isListening = true
        } catch (e: Exception) {
            isListening = false
        }
    }

    val stopListening: () -> Unit = {
        try {
            speechRecognizer?.stopListening()
        } catch (e: Exception) {}
        isListening = false
    }

    val switchLanguage: (String) -> Unit = { newLang ->
        activeLanguage = newLang
        ttsEngine?.stop()
        isSpeaking = false
        val locale = when (newLang) {
            "ta" -> Locale("ta", "IN")
            "hi" -> Locale("hi", "IN")
            "te" -> Locale("te", "IN")
            "kn" -> Locale("kn", "IN")
            "ml" -> Locale("ml", "IN")
            "mr" -> Locale("mr", "IN")
            "bn" -> Locale("bn", "IN")
            "gu" -> Locale("gu", "IN")
            "or" -> Locale("or", "IN")
            "pa" -> Locale("pa", "IN")
            "as" -> Locale("as", "IN")
            else -> Locale.ENGLISH
        }
        ttsEngine?.language = locale
        val greeting = GeminiVoiceService.getGreeting(newLang)
        messages.add(ChatMessage(id = "msg_switch_${System.currentTimeMillis()}", sender = "assistant", text = greeting))
        speakAloud(greeting)
    }

    DisposableEffect(Unit) {
        var tts: TextToSpeech? = null
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val locale = when (activeLanguage) {
                    "ta" -> Locale("ta", "IN")
                    "hi" -> Locale("hi", "IN")
                    "te" -> Locale("te", "IN")
                    "kn" -> Locale("kn", "IN")
                    "ml" -> Locale("ml", "IN")
                    "mr" -> Locale("mr", "IN")
                    "bn" -> Locale("bn", "IN")
                    "gu" -> Locale("gu", "IN")
                    "or" -> Locale("or", "IN")
                    "pa" -> Locale("pa", "IN")
                    "as" -> Locale("as", "IN")
                    else -> Locale.ENGLISH
                }
                tts?.language = locale
                tts?.setSpeechRate(voiceSpeed)
                tts?.setOnUtteranceProgressListener(object : UtteranceProgressListener() {
                    override fun onStart(utteranceId: String?) {
                        isSpeaking = true
                    }
                    override fun onDone(utteranceId: String?) {
                        isSpeaking = false
                        // Automatically re-listen so citizen can speak back to assistant's question
                        (context as? Activity)?.runOnUiThread {
                            if (!isListening) {
                                startListening()
                            }
                        }
                    }
                    override fun onError(utteranceId: String?) {
                        isSpeaking = false
                    }
                })
                ttsEngine = tts

                // Automatically welcome citizen in chosen language
                val greeting = GeminiVoiceService.getGreeting(activeLanguage)
                messages.add(ChatMessage(id = "msg_welcome", sender = "assistant", text = greeting))
                if (!isMuted) {
                    tts?.speak(greeting, TextToSpeech.QUEUE_FLUSH, null, "arivom_voice_greeting")
                }
            }
        }
        onDispose {
            tts?.stop()
            tts?.shutdown()
        }
    }

    val processCitizenInput: (String) -> Unit = { spoken ->
        if (spoken.isNotBlank()) {
            ttsEngine?.stop()
            isSpeaking = false
            interimTranscript = ""
            messages.add(ChatMessage(id = "msg_${System.currentTimeMillis()}", sender = "user", text = spoken))

            val lower = spoken.lowercase()
            val occupation = when {
                lower.contains("விவசாயி") || lower.contains("കർഷകൻ") || lower.contains("farmer") || lower.contains("agriculture") -> "farmer"
                lower.contains("மாணவர்") || lower.contains("വിദ്യാർത്ഥി") || lower.contains("student") || lower.contains("scholarship") -> "student"
                lower.contains("வியாபாரம்") || lower.contains("ബിസിനസ്") || lower.contains("business") || lower.contains("vendor") -> "business"
                lower.contains("தொழிலாளி") || lower.contains("തൊഴിലാളി") || lower.contains("worker") || lower.contains("labour") -> "worker"
                lower.contains("முதியோர்") || lower.contains("മുതിർന്ന") || lower.contains("senior") || lower.contains("pension") -> "senior"
                else -> "farmer"
            }

            val profile = CitizenProfile(
                age = 45,
                occupation = occupation,
                state = currentState,
                voiceLanguage = activeLanguage
            )
            onProfileExtracted(profile)

            coroutineScope.launch {
                isThinking = true
                val history = messages.takeLast(4).map { it.sender to it.text }
                val reply = GeminiVoiceService.generateConversationalReply(
                    spokenText = spoken,
                    language = activeLanguage,
                    stateName = currentState,
                    profile = profile,
                    matchingSchemes = emptyList(),
                    isFastMode = isFastMode,
                    history = history
                )
                isThinking = false
                messages.add(ChatMessage(id = "msg_${System.currentTimeMillis()}", sender = "assistant", text = reply))
                speakAloud(reply)
                listState.animateScrollToItem(messages.size - 1)
            }
        }
    }

    val recognitionListener = remember {
        object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                isListening = true
            }
            override fun onBeginningOfSpeech() {
                isListening = true
                ttsEngine?.stop()
                isSpeaking = false
            }
            override fun onRmsChanged(rmsdB: Float) {}
            override fun onBufferReceived(buffer: ByteArray?) {}
            override fun onEndOfSpeech() {
                isListening = false
            }
            override fun onError(error: Int) {
                isListening = false
            }
            override fun onResults(results: Bundle?) {
                isListening = false
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    processCitizenInput(matches[0])
                }
            }
            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    interimTranscript = matches[0]
                }
            }
            override fun onEvent(eventType: Int, params: Bundle?) {}
        }
    }

    DisposableEffect(Unit) {
        speechRecognizer?.setRecognitionListener(recognitionListener)
        onDispose {
            speechRecognizer?.destroy()
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startListening()
        }
    }

    LaunchedEffect(Unit) {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        }
    }

    val handleMicClick = {
        if (isListening) {
            stopListening()
        } else {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                startListening()
            } else {
                permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
            }
        }
    }

    // Mic Pulse Animation
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isListening) 1.2f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(700, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Scaffold(
        topBar = {
            Surface(
                color = Surface,
                shadowElevation = 2.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 8.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            IconButton(onClick = {
                                ttsEngine?.stop()
                                speechRecognizer?.stopListening()
                                onNavigate(Screen.Home.route)
                            }) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = SovereignMaroon)
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "Arivom Voice Live",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp,
                                        color = SovereignMaroon
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(if (isFastMode) SovereignGoldLight.copy(alpha = 0.3f) else SovereignRosePill)
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = if (isFastMode) "⚡ FAST" else "🎙️ STUDIO",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isFastMode) SovereignMaroonDeep else SovereignMaroon
                                        )
                                    }
                                }
                                val activeLangObj = VOICE_LANGUAGES.find { it.code == activeLanguage }
                                Text(
                                    text = "📍 $currentState • 🌐 ${activeLangObj?.nativeName ?: activeLanguage} • ⚡ Gemini Live",
                                    fontSize = 11.sp,
                                    color = OnSurfaceVariant
                                )
                            }
                        }

                        // Action Controls (Language, Speed, Mode, Mute)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                            // Language Switch Button
                            IconButton(onClick = { showLanguageDialog = true }) {
                                Icon(
                                    imageVector = Icons.Default.Language,
                                    contentDescription = "Switch Language",
                                    tint = SovereignMaroon,
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            // Speed Button
                            Surface(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable {
                                        voiceSpeed = when (voiceSpeed) {
                                            1.0f -> 1.25f
                                            1.25f -> 1.5f
                                            1.5f -> 0.8f
                                            else -> 1.0f
                                        }
                                        ttsEngine?.setSpeechRate(voiceSpeed)
                                    },
                                color = SurfaceContainerLowest,
                                border = BorderStroke(1.dp, OutlineVariant)
                            ) {
                                Text(
                                    text = "${voiceSpeed}x",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = SovereignMaroon,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                            }

                            // Fast/Studio Mode Toggle
                            IconButton(onClick = { isFastMode = !isFastMode }) {
                                Icon(
                                    imageVector = if (isFastMode) Icons.Default.FlashOn else Icons.Default.Radio,
                                    contentDescription = "Toggle Fast Mode",
                                    tint = if (isFastMode) SovereignGold else SovereignMaroon,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            // Mute/Unmute
                            IconButton(onClick = {
                                isMuted = !isMuted
                                if (isMuted) ttsEngine?.stop()
                            }) {
                                Icon(
                                    imageVector = if (isMuted) Icons.AutoMirrored.Filled.VolumeMute else Icons.AutoMirrored.Filled.VolumeUp,
                                    contentDescription = "Mute Audio",
                                    tint = if (isMuted) Color(0xFFBA1A1A) else SovereignMaroon,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // Horizontal Language Chip Strip (All 12 Languages)
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(6.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(VOICE_LANGUAGES) { lang ->
                            val isSelected = activeLanguage == lang.code
                            Surface(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .clickable { switchLanguage(lang.code) },
                                color = if (isSelected) SovereignMaroon else SurfaceContainerLowest,
                                border = BorderStroke(
                                    1.dp,
                                    if (isSelected) SovereignMaroon else OutlineVariant
                                )
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(4.dp),
                                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 5.dp)
                                ) {
                                    Text(
                                        text = lang.nativeName,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        color = if (isSelected) Color.White else OnSurfaceVariant
                                    )
                                    if (isSelected) {
                                        Icon(
                                            imageVector = Icons.Default.Check,
                                            contentDescription = null,
                                            tint = Color.White,
                                            modifier = Modifier.size(12.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },
        bottomBar = {
            Surface(
                color = Surface,
                shadowElevation = 8.dp,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    // Interim Transcript Preview
                    if (interimTranscript.isNotBlank()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFFFEF3C7))
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = "🎙️ Listening: \"$interimTranscript\"",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF92400E)
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    // Keyboard input fallback if toggled
                    if (showKeyboard) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedTextField(
                                value = textInput,
                                onValueChange = { textInput = it },
                                placeholder = { Text("Type in ${AndroidTranslations.getString("language", currentLanguage)}...") },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(24.dp),
                                colors = TextFieldDefaults.colors(
                                    focusedContainerColor = SurfaceContainerLowest,
                                    unfocusedContainerColor = SurfaceContainerLowest
                                ),
                                singleLine = true
                            )
                            IconButton(
                                onClick = {
                                    if (textInput.isNotBlank()) {
                                        processCitizenInput(textInput)
                                        textInput = ""
                                        showKeyboard = false
                                    }
                                },
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(PrimaryIndigo)
                            ) {
                                Icon(Icons.AutoMirrored.Filled.Send, contentDescription = "Send", tint = Color.White)
                            }
                        }
                    } else {
                        // Main Voice Controls Bar
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(onClick = { showKeyboard = true }) {
                                Icon(Icons.Default.Keyboard, contentDescription = "Type text", tint = OnSurfaceVariant)
                            }

                            // Large Mic Button with Animated Pulse
                            Box(
                                modifier = Modifier
                                    .size(80.dp)
                                    .scale(pulseScale)
                                    .clip(CircleShape)
                                    .background(if (isListening) Color(0xFFBA1A1A).copy(alpha = 0.2f) else PrimaryFixed.copy(alpha = 0.4f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(62.dp)
                                        .clip(CircleShape)
                                        .background(if (isListening) Color(0xFFBA1A1A) else PrimaryIndigo),
                                    contentAlignment = Alignment.Center
                                ) {
                                    IconButton(
                                        onClick = { handleMicClick() },
                                        modifier = Modifier.size(62.dp)
                                    ) {
                                        Icon(
                                            imageVector = if (isListening) Icons.Default.MicOff else Icons.Default.Mic,
                                            contentDescription = "Mic",
                                            tint = Color.White,
                                            modifier = Modifier.size(30.dp)
                                        )
                                    }
                                }
                            }

                            Button(
                                onClick = { onNavigate(Screen.Matches.route) },
                                shape = RoundedCornerShape(20.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                            ) {
                                Icon(Icons.Default.AutoAwesome, contentDescription = "Matches", tint = Color.White, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Matches", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
        ) {
            // Suggestion Starter Chips Bar
            val starters = GeminiVoiceService.starterSuggestions[activeLanguage] ?: GeminiVoiceService.starterSuggestions["en"] ?: emptyList()
            if (starters.isNotEmpty()) {
                LazyRow(
                    contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(starters) { prompt ->
                        Surface(
                            modifier = Modifier
                                .clip(RoundedCornerShape(16.dp))
                                .clickable { processCitizenInput(prompt) },
                            color = SurfaceContainerLowest,
                            border = BorderStroke(1.dp, OutlineVariant)
                        ) {
                            Text(
                                text = "💬 $prompt",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = SovereignMaroon,
                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                            )
                        }
                    }
                }
            }

            // Scrollable Conversation Transcript List
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 16.dp)
            ) {
                items(messages, key = { it.id }) { msg ->
                    val isUser = msg.sender == "user"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
                    ) {
                        Surface(
                            shape = RoundedCornerShape(
                                topStart = 18.dp,
                                topEnd = 18.dp,
                                bottomStart = if (isUser) 18.dp else 4.dp,
                                bottomEnd = if (isUser) 4.dp else 18.dp
                            ),
                            color = if (isUser) SovereignMaroon else SurfaceContainerLowest,
                            border = BorderStroke(1.dp, if (isUser) SovereignMaroon else OutlineVariant),
                            shadowElevation = 1.dp,
                            modifier = Modifier.fillMaxWidth(if (msg.text.length < 30) 0.6f else 0.88f)
                        ) {
                            Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = if (isUser) "You (Citizen)" else "Arivom AI",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isUser) Color.White.copy(alpha = 0.8f) else SovereignMaroon
                                    )
                                    if (!isUser) {
                                        IconButton(
                                            onClick = { speakAloud(msg.text) },
                                            modifier = Modifier.size(24.dp)
                                        ) {
                                            Icon(
                                                Icons.AutoMirrored.Filled.VolumeUp,
                                                contentDescription = "Speak",
                                                tint = SovereignMaroon,
                                                modifier = Modifier.size(16.dp)
                                            )
                                        }
                                    }
                                }

                                Text(
                                    text = msg.text,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Normal,
                                    color = if (isUser) Color.White else OnSurface,
                                    modifier = Modifier.padding(top = 4.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // Language Selection Dialog
    if (showLanguageDialog) {
        AlertDialog(
            onDismissRequest = { showLanguageDialog = false },
            title = {
                Text(
                    text = "Select Voice Language",
                    fontWeight = FontWeight.Bold,
                    color = SovereignMaroon
                )
            },
            text = {
                LazyColumn(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    items(VOICE_LANGUAGES) { lang ->
                        val isSelected = activeLanguage == lang.code
                        Surface(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .clickable {
                                    switchLanguage(lang.code)
                                    showLanguageDialog = false
                                },
                            color = if (isSelected) SovereignRosePill else SurfaceContainerLowest,
                            border = BorderStroke(1.dp, if (isSelected) SovereignMaroon else OutlineVariant)
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 16.dp, vertical = 12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = lang.nativeName,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = SovereignMaroon
                                    )
                                    Text(
                                        text = "${lang.name} (${lang.bcp47})",
                                        fontSize = 12.sp,
                                        color = OnSurfaceVariant
                                    )
                                }
                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Selected",
                                        tint = SovereignMaroon,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                            }
                        }
                    }
                }
            },
            confirmButton = {
                TextButton(onClick = { showLanguageDialog = false }) {
                    Text("Done", color = SovereignMaroon, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}
