package com.pacssahayak.ui.screens.matches

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pacssahayak.ui.components.PacsBottomBar
import com.pacssahayak.ui.components.PacsTopAppBar
import com.pacssahayak.ui.components.SchemeCardItem
import com.pacssahayak.ui.navigation.Screen
import com.pacssahayak.ui.theme.OnPrimary
import com.pacssahayak.ui.theme.OnSurface
import com.pacssahayak.ui.theme.OnSurfaceVariant
import com.pacssahayak.ui.theme.OutlineVariant
import com.pacssahayak.ui.theme.PrimaryIndigo
import com.pacssahayak.ui.theme.Surface
import com.pacssahayak.ui.theme.SurfaceContainerLowest
import com.pacssahayak.viewmodel.UiState

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
            PacsTopAppBar(
                title = "PACS Sahayak",
                logoLetter = com.pacssahayak.domain.language.AndroidTranslations.getLogoLetter(uiState.selectedLanguage),
                currentLanguageName = com.pacssahayak.domain.language.AndroidTranslations.getLanguageDisplayName(uiState.selectedLanguage)
            )
        },
        bottomBar = {
            PacsBottomBar(
                currentRoute = Screen.Matches.route,
                selectedLanguage = uiState.selectedLanguage,
                onNavigate = onNavigate
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Column {
                    Text(
                        text = com.pacssahayak.domain.language.AndroidTranslations.getString("matches.title", uiState.selectedLanguage),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = OnSurfaceVariant,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Deterministic Entitlements",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryIndigo,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                    Text(
                        text = com.pacssahayak.domain.language.AndroidTranslations.getString("matches.subtitle", uiState.selectedLanguage),
                        fontSize = 12.sp,
                        color = OnSurfaceVariant
                    )
                }
            }

            if (uiState.schemes.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                        border = BorderStroke(1.dp, OutlineVariant)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = com.pacssahayak.domain.language.AndroidTranslations.getString("matches.noMatchesTitle", uiState.selectedLanguage),
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = OnSurface
                            )
                            Text(
                                text = com.pacssahayak.domain.language.AndroidTranslations.getString("matches.noMatchesDesc", uiState.selectedLanguage),
                                fontSize = 12.sp,
                                color = OnSurfaceVariant,
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
                        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                        border = BorderStroke(1.dp, OutlineVariant)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = com.pacssahayak.domain.language.AndroidTranslations.getString("matches.noProfileTitle", uiState.selectedLanguage),
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = OnSurface
                            )
                            Text(
                                text = com.pacssahayak.domain.language.AndroidTranslations.getString("matches.noProfileDesc", uiState.selectedLanguage),
                                fontSize = 12.sp,
                                color = OnSurfaceVariant,
                                modifier = Modifier.padding(top = 4.dp, bottom = 14.dp)
                            )
                            Button(
                                onClick = { onNavigate(Screen.Profile.route) },
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                            ) {
                                Text("SETUP CITIZEN PROFILE", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = OnPrimary)
                            }
                        }
                    }
                }
            } else {
                items(uiState.matches) { match ->
                    SchemeCardItem(
                        result = match,
                        isSaved = uiState.savedSchemeIds.contains(match.scheme.id),
                        language = uiState.selectedLanguage,
                        onSaveToggle = onSaveToggle,
                        onDetailsClick = onSchemeClick,
                        onWhyMeClick = onWhyMeClick
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}
