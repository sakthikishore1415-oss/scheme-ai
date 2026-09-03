package com.arivomthittam.ui.screens.voice

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.speech.tts.TextToSpeech
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
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Keyboard
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.VolumeOff
import androidx.compose.material.icons.filled.VolumeUp
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface as MaterialSurface
import androidx.compose.material3.Text
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
import com.arivomthittam.domain.language.LanguageDetectionHelper
import com.arivomthittam.domain.language.TranslationHelper
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.OnPrimary
import com.arivomthittam.ui.theme.OnSurface
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.OutlineVariant
import com.arivomthittam.ui.theme.PrimaryFixed
import com.arivomthittam.ui.theme.PrimaryIndigo
import com.arivomthittam.ui.theme.Surface
import com.arivomthittam.ui.theme.SurfaceContainerLow
import com.arivomthittam.ui.theme.SurfaceContainerLowest
import kotlinx.coroutines.launch
import java.util.Locale

data class AndroidConversationTurn(
    val id: String,
    val role: String, // "assistant" or "user"
    val text: String,
    val englishTranslation: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

enum class VoiceAssistantState {
    READY, LISTENING, THINKING, SPEAKING, ERROR
}

@Composable
fun VoiceInputScreen(
    currentLanguage: String,
    currentState: String,
    onProfileExtracted: (CitizenProfile) -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    var assistantState by remember { mutableStateOf(VoiceAssistantState.READY) }
    var recognizedLiveText by remember { mutableStateOf("") }
    var currentSpeakingText by remember { mutableStateOf("") }
    var detectedLanguage by remember { mutableStateOf<String?>(null) }
    var isMuted by remember { mutableStateOf(false) }
    var soundLevel by remember { mutableFloatStateOf(0f) }
    var showKeyboardDrawer by remember { mutableStateOf(false) }
    var typedMessage by remember { mutableStateOf("") }

    val conversationHistory = remember { mutableStateListOf<AndroidConversationTurn>() }

    // In-App Background Speech Recognizer
    val speechRecognizer = remember {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            SpeechRecognizer.createSpeechRecognizer(context)
        } else {
            null
        }
    }

    // Android Native TextToSpeech Engine
    var ttsEngine by remember { mutableStateOf<TextToSpeech?>(null) }

    DisposableEffect(Unit) {
        var tts: TextToSpeech? = null
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val locale = when (currentLanguage) {
                    "ta" -> Locale("ta", "IN")
                    "hi" -> Locale("hi", "IN")
                    "te" -> Locale("te", "IN")
                    "kn" -> Locale("kn", "IN")
                    "ml" -> Locale("ml", "IN")
                    "bn" -> Locale("bn", "IN")
                    "mr" -> Locale("mr", "IN")
                    "gu" -> Locale("gu", "IN")
                    else -> Locale("en", "IN")
                }
                tts?.language = locale
                tts?.setSpeechRate(0.92f) // Respectful, calm civic pace
                ttsEngine = tts
            }
        }

        onDispose {
            try {
                speechRecognizer?.stopListening()
                speechRecognizer?.destroy()
                tts?.stop()
                tts?.shutdown()
            } catch (e: Exception) {}
        }
    }

    val assistantSay: (String) -> Unit = { text ->
        currentSpeakingText = text
        assistantState = VoiceAssistantState.SPEAKING
        val englishTrans = TranslationHelper.translateToEnglish(text, detectedLanguage ?: currentLanguage)

        conversationHistory.add(
            AndroidConversationTurn(
                id = "asst-${System.currentTimeMillis()}",
                role = "assistant",
                text = text,
                englishTranslation = englishTrans
            )
        )

        coroutineScope.launch {
            listState.animateScrollToItem((conversationHistory.size - 1).coerceAtLeast(0))
        }

        if (!isMuted && ttsEngine != null) {
            ttsEngine?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "asst_speech")
        }
    }

    val stopAllSpeech = {
        ttsEngine?.stop()
        assistantState = VoiceAssistantState.READY
    }

    // Initial greeting on opening
    LaunchedEffect(Unit) {
        val greeting = if (currentLanguage == "ta") {
            "வணக்கம்! அறிவோம் திட்டம் உங்களை வரவேற்கிறது. உங்கள் நலனுக்கான அரசு திட்டங்களை கண்டறிய நான் உதவலாமா?"
        } else {
            "Welcome to Arivom Thittam. I am your civic voice guide. May I help you find government welfare schemes you are entitled to?"
        }
        assistantSay(greeting)
    }

    val recognitionListener = remember {
        object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                assistantState = VoiceAssistantState.LISTENING
            }

            override fun onBeginningOfSpeech() {
                assistantState = VoiceAssistantState.LISTENING
            }

            override fun onRmsChanged(rmsdB: Float) {
                soundLevel = (rmsdB.coerceIn(0f, 10f) / 10f)
            }

            override fun onBufferReceived(buffer: ByteArray?) {}

            override fun onEndOfSpeech() {
                assistantState = VoiceAssistantState.THINKING
            }

            override fun onError(error: Int) {
                assistantState = VoiceAssistantState.READY
                recognizedLiveText = ""
            }

            override fun onResults(results: Bundle?) {
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val fullText = matches[0]
                    recognizedLiveText = ""
                    val detected = LanguageDetectionHelper.detectLanguageFromText(fullText)
                    detectedLanguage = detected ?: currentLanguage

                    // Add citizen turn
                    conversationHistory.add(
                        AndroidConversationTurn(
                            id = "user-${System.currentTimeMillis()}",
                            role = "user",
                            text = fullText,
                            englishTranslation = TranslationHelper.translateToEnglish(fullText, detectedLanguage)
                        )
                    )

                    val lower = fullText.lowercase()
                    val occupation = when {
                        lower.contains("விவசாயி") || lower.contains("farmer") || lower.contains("agriculture") -> "farmer"
                        lower.contains("மாணவர்") || lower.contains("student") || lower.contains("scholarship") -> "student"
                        lower.contains("வியாபாரம்") || lower.contains("business") || lower.contains("vendor") -> "business"
                        lower.contains("தொழிலாளி") || lower.contains("worker") || lower.contains("labour") -> "worker"
                        lower.contains("முதியோர்") || lower.contains("senior") -> "senior"
                        else -> "farmer"
                    }

                    val followUp = when (occupation) {
                        "farmer" -> if (currentLanguage == "ta") "நீங்கள் விவசாயி என்று புரிந்துகொண்டேன். உங்களிடம் எவ்வளவு நிலம் உள்ளது?" else "I understand you are a farmer. How many acres of land do you hold?"
                        "student" -> if (currentLanguage == "ta") "நீங்கள் மாணவர் என்று புரிந்துகொண்டேன். எந்த வகுப்பில் படிக்கிறீர்கள்?" else "I understand you are a student. Which course or year of study are you in?"
                        "business" -> if (currentLanguage == "ta") "நீங்கள் வியாபாரம் செய்கிறீர்கள் என்று புரிந்துகொண்டேன். சிறுதொழில் கடன் தேவையா?" else "I understand you run a small business. Do you require micro-credit support?"
                        else -> if (currentLanguage == "ta") "உங்கள் விவரங்களின் அடிப்படையில் திட்டங்களை தேடுகிறேன்..." else "Evaluating matching government welfare schemes..."
                    }

                    assistantSay(followUp)
                } else {
                    assistantState = VoiceAssistantState.READY
                }
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    recognizedLiveText = matches[0]
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) {}
        }
    }

    DisposableEffect(Unit) {
        speechRecognizer?.setRecognitionListener(recognitionListener)
        onDispose {}
    }

    val startInAppListening = {
        stopAllSpeech()
        val bcp47 = when (currentLanguage) {
            "ta" -> "ta-IN"
            "te" -> "te-IN"
            "kn" -> "kn-IN"
            "ml" -> "ml-IN"
            "hi" -> "hi-IN"
            "bn" -> "bn-IN"
            "mr" -> "mr-IN"
            "gu" -> "gu-IN"
            else -> "en-IN"
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, bcp47)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
        }

        try {
            speechRecognizer?.startListening(intent)
            assistantState = VoiceAssistantState.LISTENING
        } catch (e: Exception) {
            assistantState = VoiceAssistantState.ERROR
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) startInAppListening()
    }

    val handleMicToggle = {
        if (assistantState == VoiceAssistantState.LISTENING) {
            speechRecognizer?.stopListening()
            assistantState = VoiceAssistantState.READY
        } else {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                startInAppListening()
            } else {
                permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
            }
        }
    }

    // Pulse animation for central orb
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (assistantState == VoiceAssistantState.LISTENING || assistantState == VoiceAssistantState.SPEAKING) 1.18f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Arivom Voice Guide",
                tamilTitle = "குரல் உரையாடல்",
                canNavigateBack = true,
                onNavigateBack = {
                    stopAllSpeech()
                    onNavigate(Screen.Home.route)
                }
            )
        },
        bottomBar = {
            MaterialSurface(
                modifier = Modifier.fillMaxWidth(),
                color = PrimaryIndigo,
                shadowElevation = 8.dp
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 10.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // Privacy note
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Icon(Icons.Default.Shield, contentDescription = null, tint = Color(0xFF94F6C4), modifier = Modifier.size(14.dp))
                        Text(
                            text = "Privacy: Voice is processed securely to match gazette rules.",
                            fontSize = 10.sp,
                            color = Color(0xFFD9E2FF)
                        )
                    }

                    // Bottom Action Row
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Mute toggle
                        IconButton(onClick = {
                            if (!isMuted) stopAllSpeech()
                            isMuted = !isMuted
                        }) {
                            Icon(
                                imageVector = if (isMuted) Icons.Default.VolumeOff else Icons.Default.VolumeUp,
                                contentDescription = "Mute",
                                tint = Color.White
                            )
                        }

                        // Repeat speech
                        IconButton(onClick = {
                            if (currentSpeakingText.isNotEmpty()) assistantSay(currentSpeakingText)
                        }) {
                            Icon(Icons.Default.Refresh, contentDescription = "Repeat", tint = Color.White)
                        }

                        // Main Big Mic Button
                        Button(
                            onClick = { handleMicToggle() },
                            shape = RoundedCornerShape(24.dp),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (assistantState == VoiceAssistantState.LISTENING) Color(0xFFBA1A1A) else Color(0xFF0F8A5F)
                            ),
                            modifier = Modifier.height(48.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    imageVector = if (assistantState == VoiceAssistantState.LISTENING) Icons.Default.MicOff else Icons.Default.Mic,
                                    contentDescription = null,
                                    tint = Color.White
                                )
                                Text(
                                    text = if (assistantState == VoiceAssistantState.LISTENING) "STOP" else "SPEAK",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = Color.White
                                )
                            }
                        }

                        // Keyboard input fallback toggle
                        IconButton(onClick = { showKeyboardDrawer = !showKeyboardDrawer }) {
                            Icon(Icons.Default.Keyboard, contentDescription = "Type", tint = Color.White)
                        }

                        // View matches button
                        IconButton(onClick = {
                            stopAllSpeech()
                            val profile = CitizenProfile(
                                id = "voice-user-${System.currentTimeMillis()}",
                                name = "Voice Citizen",
                                age = 42,
                                gender = "all",
                                state = currentState,
                                district = "Madurai",
                                occupation = "farmer",
                                annualIncome = 120000L,
                                need = "agriculture",
                                voiceLanguage = detectedLanguage ?: currentLanguage
                            )
                            onProfileExtracted(profile)
                            onNavigate(Screen.Matches.route)
                        }) {
                            Icon(Icons.Default.ArrowForward, contentDescription = "Matches", tint = Color(0xFFFEA619))
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
            // Upper Stage: Ambient Animated Voice Orb
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = PrimaryIndigo),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(110.dp)
                            .clickable { handleMicToggle() },
                        contentAlignment = Alignment.Center
                    ) {
                        // Expanding Halo
                        Box(
                            modifier = Modifier
                                .size(96.dp)
                                .scale(pulseScale)
                                .clip(CircleShape)
                                .background(
                                    if (assistantState == VoiceAssistantState.LISTENING) Color(0xFF0F8A5F).copy(alpha = 0.35f)
                                    else Color(0xFFFEA619).copy(alpha = 0.25f)
                                )
                        )

                        // Core Orb
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(
                                    if (assistantState == VoiceAssistantState.LISTENING) Color(0xFF0F8A5F)
                                    else if (assistantState == VoiceAssistantState.SPEAKING) Color(0xFF387EF5)
                                    else Color(0xFF001944)
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "அ",
                                color = Color.White,
                                fontSize = 24.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }

                    // Status Pill
                    MaterialSurface(
                        shape = RoundedCornerShape(12.dp),
                        color = Color.White.copy(alpha = 0.15f)
                    ) {
                        Text(
                            text = when (assistantState) {
                                VoiceAssistantState.LISTENING -> "Listening to your voice..."
                                VoiceAssistantState.SPEAKING -> "Arivom is speaking..."
                                VoiceAssistantState.THINKING -> "Understanding criteria..."
                                else -> "Ready • Tap orb to speak"
                            },
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFD9E2FF),
                            modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp)
                        )
                    }

                    // Live Speech Preview
                    if (recognizedLiveText.isNotEmpty()) {
                        Text(
                            text = "“$recognizedLiveText”",
                            fontSize = 13.sp,
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold,
                            textAlign = TextAlign.Center
                        )
                    }
                }
            }

            // Keyboard Typing Drawer
            if (showKeyboardDrawer) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = typedMessage,
                        onValueChange = { typedMessage = it },
                        placeholder = { Text("Type details (e.g. 45 வயது விவசாயி)...", fontSize = 12.sp) },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(14.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = PrimaryIndigo,
                            unfocusedBorderColor = OutlineVariant
                        )
                    )
                    IconButton(
                        onClick = {
                            if (typedMessage.trim().isNotEmpty()) {
                                val msg = typedMessage
                                typedMessage = ""
                                conversationHistory.add(
                                    AndroidConversationTurn(
                                        id = "user-${System.currentTimeMillis()}",
                                        role = "user",
                                        text = msg,
                                        englishTranslation = TranslationHelper.translateToEnglish(msg, currentLanguage)
                                    )
                                )
                                assistantSay("விவரங்கள் பெறப்பட்டன. தகுதியான திட்டங்களை சரிபார்க்கவும்.")
                            }
                        }
                    ) {
                        Icon(Icons.Default.Send, contentDescription = "Send", tint = PrimaryIndigo)
                    }
                }
            }

            // Lower Section: Full Interactive Conversational Transcript
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp, vertical = 4.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(conversationHistory) { turn ->
                    val isAsst = turn.role == "assistant"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isAsst) Arrangement.Start else Arrangement.End
                    ) {
                        Card(
                            modifier = Modifier.fillMaxWidth(0.85f),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isAsst) SurfaceContainerLowest else Color(0xFF0F8A5F)
                            ),
                            border = if (isAsst) BorderStroke(1.dp, OutlineVariant) else null
                        ) {
                            Column(
                                modifier = Modifier.padding(12.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Text(
                                    text = if (isAsst) "Arivom Assistant" else "You (Citizen)",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isAsst) PrimaryIndigo else Color(0xFFD9E2FF)
                                )
                                Text(
                                    text = turn.text,
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = if (isAsst) OnSurface else Color.White,
                                    lineHeight = 18.sp
                                )
                                if (turn.englishTranslation != null && turn.englishTranslation != turn.text) {
                                    Text(
                                        text = "“${turn.englishTranslation}”",
                                        fontSize = 11.sp,
                                        color = if (isAsst) OnSurfaceVariant else Color(0xFFD9E2FF),
                                        lineHeight = 15.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
