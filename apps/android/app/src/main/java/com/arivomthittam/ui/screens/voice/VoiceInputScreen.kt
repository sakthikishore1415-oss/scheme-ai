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
import kotlinx.coroutines.launch
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
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
import com.arivomthittam.domain.language.AndroidTranslations
import com.arivomthittam.domain.language.LanguageDetectionHelper
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.OnPrimary
import com.arivomthittam.ui.theme.OnSurface
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.OutlineVariant
import com.arivomthittam.ui.theme.PrimaryContainer
import com.arivomthittam.ui.theme.PrimaryFixed
import com.arivomthittam.ui.theme.PrimaryIndigo
import com.arivomthittam.ui.theme.SecondaryContainer
import com.arivomthittam.ui.theme.Surface
import com.arivomthittam.ui.theme.SurfaceContainerLowest
import com.arivomthittam.ui.theme.TertiaryContainer
import com.arivomthittam.ui.theme.TertiaryFixed
import java.util.Locale

@Composable
fun VoiceInputScreen(
    currentLanguage: String,
    currentState: String,
    onProfileExtracted: (CitizenProfile) -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    var isListening by remember { mutableStateOf(false) }
    var recognizedText by remember { mutableStateOf("") }
    var assistantReply by remember { mutableStateOf("") }
    var detectedLanguage by remember { mutableStateOf<String?>(null) }

    // TTS Engine
    var ttsEngine by remember { mutableStateOf<TextToSpeech?>(null) }

    DisposableEffect(Unit) {
        var tts: TextToSpeech? = null
        tts = TextToSpeech(context) { status ->
            if (status == TextToSpeech.SUCCESS) {
                val locale = when (currentLanguage) {
                    "ml" -> Locale("ml", "IN")
                    "ta" -> Locale("ta", "IN")
                    "hi" -> Locale("hi", "IN")
                    "te" -> Locale("te", "IN")
                    "kn" -> Locale("kn", "IN")
                    "bn" -> Locale("bn", "IN")
                    else -> Locale.ENGLISH
                }
                tts?.language = locale
                ttsEngine = tts
            }
        }
        onDispose {
            tts?.stop()
            tts?.shutdown()
        }
    }

    val speakAloud: (String) -> Unit = { text ->
        assistantReply = text
        ttsEngine?.speak(text, TextToSpeech.QUEUE_FLUSH, null, "arivom_voice")
    }

    // In-app Speech Recognizer
    val speechRecognizer = remember {
        try {
            SpeechRecognizer.createSpeechRecognizer(context)
        } catch (e: Exception) {
            null
        }
    }

    val coroutineScope = androidx.compose.runtime.rememberCoroutineScope()

    val recognitionListener = remember {
        object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                isListening = true
            }
            override fun onBeginningOfSpeech() {
                isListening = true
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
                    val spoken = matches[0]
                    recognizedText = spoken
                    val detected = LanguageDetectionHelper.detectLanguageFromText(spoken)
                    detectedLanguage = detected ?: currentLanguage

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
                        voiceLanguage = detectedLanguage ?: currentLanguage
                    )

                    coroutineScope.launch {
                        val reply = com.arivomthittam.domain.ai.GeminiVoiceService.generateConversationalReply(
                            spokenText = spoken,
                            language = currentLanguage,
                            stateName = currentState,
                            profile = profile,
                            matchingSchemes = emptyList()
                        )
                        speakAloud(reply)
                    }
                }
            }
            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    recognizedText = matches[0]
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

    val startListening = {
        ttsEngine?.stop()
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            val bcp47 = when (currentLanguage) {
                "ml" -> "ml-IN"
                "ta" -> "ta-IN"
                "hi" -> "hi-IN"
                "te" -> "te-IN"
                "kn" -> "kn-IN"
                "bn" -> "bn-IN"
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

    val stopListening = {
        try {
            speechRecognizer?.stopListening()
        } catch (e: Exception) {}
        isListening = false
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startListening()
        }
    }

    // Auto-request microphone permission on screen entry if not already granted
    LaunchedEffect(Unit) {
        if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
        } else {
            startListening()
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

    // Pulse animation while listening
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isListening) 1.25f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(800, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = AndroidTranslations.getString("nav.voice", currentLanguage),
                logoLetter = AndroidTranslations.getLogoLetter(currentLanguage),
                canNavigateBack = true,
                onNavigateBack = {
                    ttsEngine?.stop()
                    speechRecognizer?.stopListening()
                    onNavigate(Screen.Home.route)
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
                .padding(horizontal = 20.dp, vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = AndroidTranslations.getString("home.voiceCardTitle", currentLanguage),
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp,
                    color = PrimaryIndigo,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = AndroidTranslations.getString("home.voiceCardSubtitle", currentLanguage),
                    fontSize = 13.sp,
                    color = OnSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp, bottom = 32.dp)
                )

                // Large Central Mic Touch Target
                Box(
                    modifier = Modifier
                        .size(180.dp)
                        .scale(pulseScale)
                        .clip(CircleShape)
                        .background(if (isListening) Color(0xFFBA1A1A).copy(alpha = 0.2f) else PrimaryFixed.copy(alpha = 0.4f)),
                    contentAlignment = Alignment.Center
                ) {
                    Box(
                        modifier = Modifier
                            .size(130.dp)
                            .clip(CircleShape)
                            .background(if (isListening) Color(0xFFBA1A1A) else PrimaryIndigo),
                        contentAlignment = Alignment.Center
                    ) {
                        IconButton(
                            onClick = { handleMicClick() },
                            modifier = Modifier.size(130.dp)
                        ) {
                            Icon(
                                imageVector = if (isListening) Icons.Default.MicOff else Icons.Default.Mic,
                                contentDescription = "Voice Assistant",
                                tint = Color.White,
                                modifier = Modifier.size(54.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(20.dp))

                Text(
                    text = if (isListening) "LISTENING..." else "TAP TO SPEAK",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = if (isListening) Color(0xFFBA1A1A) else PrimaryIndigo,
                    letterSpacing = 1.sp
                )

                Spacer(modifier = Modifier.height(24.dp))

                // Spoken Transcript Card
                if (recognizedText.isNotBlank()) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                        border = BorderStroke(1.dp, OutlineVariant),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "SPOKEN INPUT:",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = OnSurfaceVariant,
                                letterSpacing = 1.sp
                            )

                            Text(
                                text = "\"$recognizedText\"",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryIndigo,
                                modifier = Modifier.padding(vertical = 8.dp)
                            )

                            if (assistantReply.isNotBlank()) {
                                Text(
                                    text = assistantReply,
                                    fontSize = 13.sp,
                                    color = OnSurfaceVariant,
                                    modifier = Modifier.padding(bottom = 12.dp)
                                )
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                OutlinedButton(
                                    onClick = {
                                        recognizedText = ""
                                        assistantReply = ""
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(20.dp),
                                    border = BorderStroke(1.dp, PrimaryIndigo)
                                ) {
                                    Text("CLEAR", color = PrimaryIndigo, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }

                                Button(
                                    onClick = {
                                        val profile = CitizenProfile(
                                            age = 45,
                                            occupation = recognizedText,
                                            state = currentState,
                                            voiceLanguage = detectedLanguage ?: currentLanguage
                                        )
                                        onProfileExtracted(profile)
                                        onNavigate(Screen.Matches.route)
                                    },
                                    modifier = Modifier.weight(1f),
                                    shape = RoundedCornerShape(20.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                                ) {
                                    Text("VIEW MATCHES", color = OnPrimary, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            Text(
                text = "Voice Assistant processes your spoken words directly to find matching welfare schemes.",
                fontSize = 11.sp,
                color = OnSurfaceVariant,
                textAlign = TextAlign.Center,
                modifier = Modifier.padding(bottom = 8.dp)
            )
        }
    }
}
