package com.arivomthittam.ui.screens.home

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Sparkles
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.EligibilityResult
import com.arivomthittam.ui.components.ArivomBottomBar
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.components.SchemeCardItem
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.Emerald50
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Emerald700
import com.arivomthittam.ui.theme.Emerald800
import com.arivomthittam.ui.theme.Emerald900
import com.arivomthittam.ui.theme.Slate200
import com.arivomthittam.ui.theme.Slate50
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate900
import com.arivomthittam.viewmodel.UiState

@Composable
fun HomeScreen(
    uiState: UiState,
    onNavigate: (String) -> Unit,
    onSchemeClick: (String) -> Unit,
    onWhyMeClick: (String) -> Unit,
    onSaveToggle: (String) -> Unit
) {
    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Arivom Thittam",
                tamilTitle = "அறிவோம் திட்டம்",
                onLanguageClick = { onNavigate(Screen.Language.route) }
            )
        },
        bottomBar = {
            ArivomBottomBar(
                currentRoute = Screen.Home.route,
                onNavigate = onNavigate
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hero / Onboarding Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate900)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp)
                    ) {
                        Text(
                            text = if (uiState.userProfile == null) "GET STARTED" else "ACTIVE PROFILE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Emerald600
                        )

                        Text(
                            text = if (uiState.userProfile == null)
                                "Discover schemes crafted for your family"
                            else
                                "Profile: ${uiState.userProfile.occupation.ifBlank { "Citizen" }}, ${uiState.userProfile.age} yrs",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Black,
                            color = Color.White,
                            modifier = Modifier.padding(vertical = 4.dp)
                        )

                        Text(
                            text = if (uiState.userProfile == null)
                                "Complete your demographic profile or speak to find exact government entitlements."
                            else
                                "Evaluating real state and central criteria against your demographic details.",
                            fontSize = 12.sp,
                            color = Slate200
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Button(
                                onClick = { onNavigate(Screen.Profile.route) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
                            ) {
                                Icon(Icons.Default.Person, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(if (uiState.userProfile == null) "Create Profile" else "Edit Profile", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = { onNavigate(Screen.VoiceInput.route) },
                                modifier = Modifier.weight(1f),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald800)
                            ) {
                                Icon(Icons.Default.Mic, contentDescription = null, modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Voice Speak", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            // Quick Category Filter / Links
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Matched Welfare Schemes",
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        color = Slate900
                    )

                    if (uiState.matches.isNotEmpty()) {
                        Text(
                            text = "${uiState.matches.size} Available",
                            fontSize = 12.sp,
                            color = Emerald700,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.clickable { onNavigate(Screen.Matches.route) }
                        )
                    }
                }
            }

            // Empty State or Matched Scheme List
            if (uiState.schemes.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "No Government Schemes Loaded",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Slate900
                            )
                            Text(
                                text = "The repository is configured to receive official API data. No fake schemes are populated.",
                                fontSize = 12.sp,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                            )
                        }
                    }
                }
            } else if (uiState.userProfile == null) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Setup Your Profile to Discover Schemes",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Slate900
                            )
                            Text(
                                text = "Enter your age, occupation, and state to evaluate real deterministic eligibility.",
                                fontSize = 12.sp,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                            )
                            Button(
                                onClick = { onNavigate(Screen.Profile.route) },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Emerald600)
                            ) {
                                Text("SETUP CITIZEN PROFILE", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            } else {
                items(uiState.matches) { match ->
                    SchemeCardItem(
                        result = match,
                        isSaved = uiState.savedSchemeIds.contains(match.scheme.id),
                        onSaveToggle = onSaveToggle,
                        onDetailsClick = onSchemeClick,
                        onWhyMeClick = onWhyMeClick
                    )
                }
            }
        }
    }
}

