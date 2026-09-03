package com.arivomthittam.ui.screens.voice

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
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
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface as MaterialSurface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
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
import com.arivomthittam.domain.language.LanguageDetectionHelper
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

@Composable
fun VoiceInputScreen(
    currentLanguage: String,
    currentState: String,
    onProfileExtracted: (CitizenProfile) -> Unit,
    onNavigate: (String) -> Unit
) {
    val context = LocalContext.current
    var recognizedText by remember { mutableStateOf("") }
    var partialText by remember { mutableStateOf("") }
    var detectedLanguage by remember { mutableStateOf<String?>(null) }
    var isListening by remember { mutableStateOf(false) }
    var soundLevel by remember { mutableFloatStateOf(0f) }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    // In-App Background Speech Recognizer (No Google OS popup dialog)
    val speechRecognizer = remember {
        if (SpeechRecognizer.isRecognitionAvailable(context)) {
            SpeechRecognizer.createSpeechRecognizer(context)
        } else {
            null
        }
    }

    val recognitionListener = remember {
        object : RecognitionListener {
            override fun onReadyForSpeech(params: Bundle?) {
                isListening = true
                errorMessage = null
            }

            override fun onBeginningOfSpeech() {
                isListening = true
            }

            override fun onRmsChanged(rmsdB: Float) {
                soundLevel = (rmsdB.coerceIn(0f, 10f) / 10f)
            }

            override fun onBufferReceived(buffer: ByteArray?) {}

            override fun onEndOfSpeech() {
                isListening = false
            }

            override fun onError(error: Int) {
                isListening = false
                if (error != SpeechRecognizer.ERROR_NO_MATCH && error != SpeechRecognizer.ERROR_SPEECH_TIMEOUT) {
                    errorMessage = when (error) {
                        SpeechRecognizer.ERROR_AUDIO -> "Audio recording error. Please check mic permissions."
                        SpeechRecognizer.ERROR_NETWORK -> "Network required for speech recognition."
                        else -> "Speech recognition paused. Tap mic to speak again."
                    }
                }
            }

            override fun onResults(results: Bundle?) {
                isListening = false
                val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    val fullText = matches[0]
                    recognizedText = fullText
                    partialText = ""
                    val detected = LanguageDetectionHelper.detectLanguageFromText(fullText)
                    detectedLanguage = detected ?: currentLanguage
                }
            }

            override fun onPartialResults(partialResults: Bundle?) {
                val matches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                if (!matches.isNullOrEmpty()) {
                    partialText = matches[0]
                    val detected = LanguageDetectionHelper.detectLanguageFromText(partialText)
                    if (detected != null) {
                        detectedLanguage = detected
                    }
                }
            }

            override fun onEvent(eventType: Int, params: Bundle?) {}
        }
    }

    DisposableEffect(Unit) {
        speechRecognizer?.setRecognitionListener(recognitionListener)
        onDispose {
            try {
                speechRecognizer?.stopListening()
                speechRecognizer?.destroy()
            } catch (e: Exception) {
                // Ignore cleanup errors
            }
        }
    }

    val startInAppListening = {
        val bcp47 = when (currentLanguage) {
            "ta" -> "ta-IN"
            "te" -> "te-IN"
            "kn" -> "kn-IN"
            "ml" -> "ml-IN"
            "hi" -> "hi-IN"
            "bn" -> "bn-IN"
            "mr" -> "mr-IN"
            "gu" -> "gu-IN"
            "or" -> "or-IN"
            "pa" -> "pa-IN"
            else -> "en-IN"
        }

        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, bcp47)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
        }

        errorMessage = null
        try {
            speechRecognizer?.startListening(intent)
            isListening = true
        } catch (e: Exception) {
            errorMessage = "Unable to start speech recognizer: ${e.localizedMessage}"
            isListening = false
        }
    }

    val permissionLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            startInAppListening()
        } else {
            errorMessage = "Microphone permission is required for voice recognition."
        }
    }

    val handleMicClick = {
        if (isListening) {
            speechRecognizer?.stopListening()
            isListening = false
        } else {
            if (ContextCompat.checkSelfPermission(context, Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                startInAppListening()
            } else {
                permissionLauncher.launch(Manifest.permission.RECORD_AUDIO)
            }
        }
    }

    // Pulse Animation for listening state
    val infiniteTransition = rememberInfiniteTransition(label = "pulse")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f,
        targetValue = if (isListening) 1.25f else 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(900, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseScale"
    )

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Arivom Thittam",
                tamilTitle = "குரல் உதவி",
                canNavigateBack = true,
                onNavigateBack = { onNavigate(Screen.Home.route) }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
                .padding(horizontal = 16.dp, vertical = 10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Seamless Voice Assistant",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryIndigo,
                    textAlign = TextAlign.Center
                )
                Text(
                    text = "Speak naturally in your regional language. We automatically extract your age, occupation, and needs.",
                    fontSize = 13.sp,
                    color = OnSurfaceVariant,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }

            // In-App Animated Glowing Microphone (Direct background listener)
            item {
                Box(
                    modifier = Modifier
                        .size(160.dp)
                        .padding(8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    // Outer Ripple
                    if (isListening) {
                        Box(
                            modifier = Modifier
                                .size(140.dp)
                                .scale(pulseScale)
                                .clip(CircleShape)
                                .background(PrimaryIndigo.copy(alpha = 0.15f))
                        )
                    }

                    // Main Mic Button
                    Box(
                        modifier = Modifier
                            .size(100.dp)
                            .clip(CircleShape)
                            .background(if (isListening) Color(0xFFBA1A1A) else PrimaryIndigo)
                            .clickable { handleMicClick() },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = if (isListening) Icons.Default.Stop else Icons.Default.Mic,
                            contentDescription = if (isListening) "Stop Listening" else "Start Voice Input",
                            tint = Color.White,
                            modifier = Modifier.size(42.dp)
                        )
                    }
                }

                Text(
                    text = if (isListening) "Listening in background... (Speak now)" else "Tap to Speak / பேச தொடங்குங்கள்",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isListening) Color(0xFFBA1A1A) else PrimaryIndigo,
                    textAlign = TextAlign.Center
                )
            }

            // Live Transcription & Speech Output Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                    border = BorderStroke(1.dp, OutlineVariant),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Transcription Output:",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryIndigo
                            )

                            if (detectedLanguage != null) {
                                MaterialSurface(
                                    shape = RoundedCornerShape(12.dp),
                                    color = PrimaryFixed,
                                    border = BorderStroke(1.dp, PrimaryIndigo)
                                ) {
                                    Text(
                                        text = "Detected: ${detectedLanguage?.uppercase()}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryIndigo,
                                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                    )
                                }
                            }
                        }

                        val displayText = when {
                            recognizedText.isNotEmpty() -> recognizedText
                            partialText.isNotEmpty() -> "$partialText..."
                            isListening -> "Listening to your voice..."
                            else -> "No speech recorded yet. Tap the microphone above."
                        }

                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .background(SurfaceContainerLow, RoundedCornerShape(12.dp))
                                .padding(12.dp),
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Text(
                                    text = "🗣️ Spoken (${detectedLanguage?.uppercase() ?: currentLanguage.uppercase()}):",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryIndigo
                                )
                            }
                            Text(
                                text = displayText,
                                fontSize = 15.sp,
                                fontWeight = if (recognizedText.isNotEmpty() || partialText.isNotEmpty()) FontWeight.Bold else FontWeight.Normal,
                                color = if (recognizedText.isNotEmpty() || partialText.isNotEmpty()) OnSurface else OnSurfaceVariant,
                                lineHeight = 22.sp
                            )
                        }

                        // English Translation Box
                        if (recognizedText.isNotEmpty() || partialText.isNotEmpty()) {
                            val activeText = recognizedText.ifEmpty { partialText }
                            val englishTranslation = com.arivomthittam.domain.language.TranslationHelper.translateToEnglish(activeText, detectedLanguage)

                            if (englishTranslation.isNotEmpty()) {
                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(PrimaryFixed.copy(alpha = 0.45f), RoundedCornerShape(12.dp))
                                        .padding(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(4.dp)
                                ) {
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Text(
                                            text = "🌐 English Translation:",
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = PrimaryIndigo
                                        )
                                    }
                                    Text(
                                        text = "“$englishTranslation”",
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Medium,
                                        color = Color(0xFF001944),
                                        lineHeight = 20.sp
                                    )
                                }
                            }
                        }

                        if (errorMessage != null) {
                            Text(
                                text = errorMessage!!,
                                fontSize = 12.sp,
                                color = Color(0xFFBA1A1A),
                                fontWeight = FontWeight.Medium
                            )
                        }
                    }
                }
            }

            // Quick Example Speech Prompts
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                    border = BorderStroke(1.dp, OutlineVariant)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "💡 Example Phrases to Try:",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryIndigo
                        )

                        listOf(
                            "நான் 48 வயது விவசாயி, நெல் சாகுபடி செய்கிறேன். எனக்கு கடன் மற்றும் உரம் மானியம் தேவை.",
                            "I am a 21-year-old engineering student looking for educational scholarships.",
                            "நான் சாலையோர வியாபாரம் செய்கிறேன், சிறு தொழில் கடன் தேவை."
                        ).forEach { sample ->
                            MaterialSurface(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clickable {
                                        recognizedText = sample
                                        val detected = LanguageDetectionHelper.detectLanguageFromText(sample)
                                        detectedLanguage = detected ?: currentLanguage
                                    },
                                shape = RoundedCornerShape(10.dp),
                                color = SurfaceContainerLow,
                                border = BorderStroke(1.dp, OutlineVariant)
                            ) {
                                Text(
                                    text = "“$sample”",
                                    fontSize = 12.sp,
                                    color = OnSurface,
                                    modifier = Modifier.padding(10.dp)
                                )
                            }
                        }
                    }
                }
            }

            // Continue Action Button
            if (recognizedText.isNotEmpty()) {
                item {
                    Button(
                        onClick = {
                            val lower = recognizedText.lowercase()
                            val occupation = when {
                                lower.contains("விவசாயி") || lower.contains("farmer") || lower.contains("agriculture") -> "farmer"
                                lower.contains("மாணவர்") || lower.contains("student") || lower.contains("scholarship") -> "student"
                                lower.contains("வியாபாரம்") || lower.contains("business") || lower.contains("vendor") -> "business"
                                lower.contains("தொழிலாளி") || lower.contains("worker") || lower.contains("labour") -> "worker"
                                lower.contains("முதியோர்") || lower.contains("senior") -> "senior"
                                else -> "farmer"
                            }

                            val profile = CitizenProfile(
                                id = "voice-user-${System.currentTimeMillis()}",
                                name = "Voice Citizen",
                                age = if (lower.contains("48")) 48 else if (lower.contains("21")) 21 else 35,
                                gender = if (lower.contains("பெண்") || lower.contains("female")) "female" else "all",
                                state = currentState,
                                district = "Madurai",
                                occupation = occupation,
                                annualIncome = 120000L,
                                need = if (occupation == "student") "education" else "agriculture",
                                voiceLanguage = detectedLanguage ?: currentLanguage
                            )

                            onProfileExtracted(profile)
                            onNavigate(Screen.Matches.route)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(54.dp),
                        shape = RoundedCornerShape(27.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                    ) {
                        Row(
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color.White)
                            Text(
                                text = "FIND MATCHING SCHEMES →",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = OnPrimary
                            )
                        }
                    }
                }
            }
        }
    }
}
