package com.arivomthittam.ui.screens.voice

import android.app.Activity
import android.content.Intent
import android.speech.RecognizerIntent
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
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
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.CitizenProfile
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Emerald800
import com.arivomthittam.ui.theme.Slate100
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate900

@Composable
fun VoiceInputScreen(
    currentLanguage: String,
    currentState: String,
    onProfileExtracted: (CitizenProfile) -> Unit,
    onNavigate: (String) -> Unit
) {
    var recognizedText by remember { mutableStateOf("") }
    var isListening by remember { mutableStateOf(false) }

    val speechRecognizerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        isListening = false
        if (result.resultCode == Activity.RESULT_OK && result.data != null) {
            val spokenMatches = result.data?.getStringArrayListExtra(RecognizerIntent.EXTRA_RESULTS)
            if (!spokenMatches.isNullOrEmpty()) {
                recognizedText = spokenMatches[0]
            }
        }
    }

    val launchSpeechRecognition = {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, if (currentLanguage == "ta") "ta-IN" else "en-IN")
            putExtra(RecognizerIntent.EXTRA_PROMPT, "Speak your details (e.g. 45 years old farmer)...")
        }
        isListening = true
        try {
            speechRecognizerLauncher.launch(intent)
        } catch (e: Exception) {
            isListening = false
        }
    }

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Voice Assistant",
                tamilTitle = "குரல் உதவி",
                canNavigateBack = true,
                onNavigateBack = { onNavigate(Screen.Home.route) }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "Speak Your Demographic Details",
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp,
                    color = Slate900
                )
                Text(
                    text = "Mention your age, occupation, and needed welfare support.",
                    fontSize = 13.sp,
                    color = Slate500,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp, bottom = 24.dp)
                )

                // Large Central Mic Touch Target
                Box(
                    modifier = Modifier
                        .size(120.dp)
                        .clip(CircleShape)
                        .background(if (isListening) Color.Red else Emerald600),
                    contentAlignment = Alignment.Center
                ) {
                    IconButton(
                        onClick = { launchSpeechRecognition() },
                        modifier = Modifier.size(120.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = "Tap to Speak",
                            tint = Color.White,
                            modifier = Modifier.size(48.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                Text(
                    text = if (isListening) "LISTENING..." else "TAP TO SPEAK",
                    fontWeight = FontWeight.Black,
                    fontSize = 12.sp,
                    color = if (isListening) Color.Red else Emerald800
                )

                Spacer(modifier = Modifier.height(24.dp))

                if (recognizedText.isNotBlank()) {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate100)
                    ) {
                        Column(modifier = Modifier.padding(16.dp)) {
                            Text(
                                text = "CAPTURED SPOKEN INPUT",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Emerald800
                            )
                            Text(
                                text = "\"$recognizedText\"",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Slate900,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }
            }

            if (recognizedText.isNotBlank()) {
                Button(
                    onClick = {
                        // Create structured profile from voice
                        val profile = CitizenProfile(
                            age = 35,
                            occupation = recognizedText,
                            state = currentState,
                            voiceLanguage = currentLanguage
                        )
                        onProfileExtracted(profile)
                        onNavigate(Screen.Matches.route)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald800)
                ) {
                    Text(
                        text = "CONFIRM & MATCH SCHEMES",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

