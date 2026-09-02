package com.arivomthittam.ui.screens.matches

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.EligibilityResult
import com.arivomthittam.ui.components.ArivomBottomBar
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.components.SchemeCardItem
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate900
import com.arivomthittam.viewmodel.UiState

@Composable
fun MyMatchesScreen(
    uiState: UiState,
    onNavigate: (String) -> Unit,
    onSchemeClick: (String) -> Unit,
    onWhyMeClick: (String) -> Unit,
    onSaveToggle: (String) -> Unit
) {
    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "My Matches",
                tamilTitle = "பொருந்தும் திட்டங்கள்"
            )
        },
        bottomBar = {
            ArivomBottomBar(
                currentRoute = Screen.Matches.route,
                onNavigate = onNavigate
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Text(
                    text = "Deterministic Entitlements",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "Evaluated against official published gazette guidelines.",
                    fontSize = 12.sp,
                    color = Slate500
                )
            }

            if (uiState.schemes.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
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
                                text = "No Scheme Matches Available",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Slate900
                            )
                            Text(
                                text = "No government schemes currently loaded from connected repository.",
                                fontSize = 12.sp,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }
            } else if (uiState.userProfile == null) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "No Profile Created Yet",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = Slate900
                            )
                            Text(
                                text = "Complete your demographic details to discover matching schemes.",
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

