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
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.MicOff
import androidx.compose.material.icons.filled.Radio
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
import kotlinx.coroutines.launch
import java.util.Locale

data class ChatMessage(
    val id: String,
    val sender: String, // "user" or "assistant"
    val text: String,
    val timestamp: Long = System.currentTimeMillis()
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
                    "mr" -> Locale("mr", "IN")
                    "gu" -> Locale("gu", "IN")
                    else -> Locale.ENGLISH
                }
                tts?.language = locale
                tts?.setSpeechRate(voiceSpeed)
                ttsEngine = tts

                // Automatically welcome citizen in chosen language
                val greeting = GeminiVoiceService.getGreeting(currentLanguage)
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

    // In-app Speech Recognizer
    val speechRecognizer = remember {
        try {
            SpeechRecognizer.createSpeechRecognizer(context)
        } catch (e: Exception) {
            null
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
                voiceLanguage = currentLanguage
            )
            onProfileExtracted(profile)

            coroutineScope.launch {
                isThinking = true
                val history = messages.takeLast(4).map { it.sender to it.text }
                val reply = GeminiVoiceService.generateConversationalReply(
                    spokenText = spoken,
                    language = currentLanguage,
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

    val startListening = {
        ttsEngine?.stop()
        isSpeaking = false
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            val bcp47 = when (currentLanguage) {
                "ml" -> "ml-IN"
                "ta" -> "ta-IN"
                "hi" -> "hi-IN"
                "te" -> "te-IN"
                "kn" -> "kn-IN"
                "bn" -> "bn-IN"
                "mr" -> "mr-IN"
                "gu" -> "gu-IN"
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
                Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 10.dp)) {
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
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = PrimaryIndigo)
                            }
                            Column {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "Arivom Voice Live",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp,
                                        color = PrimaryIndigo
                                    )
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(4.dp))
                                            .background(if (isFastMode) Color(0xFFF3E8FF) else Color(0xFFEFF6FF))
                                            .padding(horizontal = 6.dp, vertical = 2.dp)
                                    ) {
                                        Text(
                                            text = if (isFastMode) "⚡ FAST" else "🎙️ STUDIO",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (isFastMode) Color(0xFF7E22CE) else Color(0xFF1D4ED8)
                                        )
                                    }
                                }
                                Text(
                                    text = "📍 $currentState • 🌐 $currentLanguage • ⚡ Gemini Flash",
                                    fontSize = 11.sp,
                                    color = OnSurfaceVariant
                                )
                            }
                        }

                        // Action Controls (Speed, Mode, Mute)
                        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
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
                                    color = PrimaryIndigo,
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                                )
                            }

                            // Fast/Studio Mode Toggle
                            IconButton(onClick = { isFastMode = !isFastMode }) {
                                Icon(
                                    imageVector = if (isFastMode) Icons.Default.FlashOn else Icons.Default.Radio,
                                    contentDescription = "Toggle Fast Mode",
                                    tint = if (isFastMode) Color(0xFF7E22CE) else PrimaryIndigo,
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
                                    tint = if (isMuted) Color(0xFFBA1A1A) else PrimaryIndigo,
                                    modifier = Modifier.size(20.dp)
                                )
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
            val starters = GeminiVoiceService.starterSuggestions[currentLanguage] ?: GeminiVoiceService.starterSuggestions["en"] ?: emptyList()
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
                                color = PrimaryIndigo,
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
                    .fillMaxWidth()
                    .weight(1f)
                    .padding(horizontal = 16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(vertical = 12.dp)
            ) {
                items(messages) { msg ->
                    val isUser = msg.sender == "user"
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
                    ) {
                        Card(
                            shape = RoundedCornerShape(
                                topStart = 16.dp,
                                topEnd = 16.dp,
                                bottomStart = if (isUser) 16.dp else 4.dp,
                                bottomEnd = if (isUser) 4.dp else 16.dp
                            ),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isUser) PrimaryIndigo else SurfaceContainerLowest
                            ),
                            border = if (!isUser) BorderStroke(1.dp, OutlineVariant) else null,
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
                            modifier = Modifier.fillMaxWidth(0.85f)
                        ) {
                            Column(modifier = Modifier.padding(12.dp)) {
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(
                                        text = if (isUser) "YOU" else "ARIVOM ASSISTANT",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isUser) Color(0xFFFFD9E1) else PrimaryIndigo,
                                        letterSpacing = 1.sp
                                    )

                                    if (!isUser) {
                                        IconButton(
                                            onClick = { speakAloud(msg.text) },
                                            modifier = Modifier.size(24.dp)
                                        ) {
                                            Icon(
                                                imageVector = Icons.AutoMirrored.Filled.VolumeUp,
                                                contentDescription = "Replay Audio",
                                                tint = PrimaryIndigo,
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

                if (isThinking) {
                    item {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.Start
                        ) {
                            Surface(
                                shape = RoundedCornerShape(16.dp),
                                color = Color(0xFFF3E8FF),
                                border = BorderStroke(1.dp, Color(0xFFE9D5FF))
                            ) {
                                Row(
                                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 8.dp),
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Icon(Icons.Default.GraphicEq, contentDescription = null, tint = Color(0xFF7E22CE), modifier = Modifier.size(16.dp))
                                    Text(
                                        text = "Gemini is thinking...",
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFF7E22CE)
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
