package com.pacssahayak.ui.screens.home

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Agriculture
import androidx.compose.material.icons.filled.Elderly
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Woman
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
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
import com.pacssahayak.ui.theme.SecondaryContainer
import com.pacssahayak.ui.theme.SecondarySaffron
import com.pacssahayak.ui.theme.Surface
import com.pacssahayak.ui.theme.SurfaceContainerLow
import com.pacssahayak.ui.theme.SurfaceContainerLowest
import com.pacssahayak.viewmodel.UiState

data class QuickNeed(
    val id: String,
    val title: String,
    val icon: ImageVector
)

val QUICK_NEEDS = listOf(
    QuickNeed("agriculture", "Agriculture", Icons.Default.Agriculture),
    QuickNeed("education", "Education", Icons.Default.School),
    QuickNeed("housing", "Housing", Icons.Default.Home),
    QuickNeed("employment", "Employment", Icons.Default.Work),
    QuickNeed("women", "Women", Icons.Default.Woman),
    QuickNeed("senior_citizens", "Senior Citizens", Icons.Default.Elderly),
    QuickNeed("health", "Health", Icons.Default.LocalHospital),
    QuickNeed("financial", "Financial Support", Icons.Default.AccountBalanceWallet)
)

@Composable
fun HomeScreen(
    uiState: UiState,
    onNavigate: (String) -> Unit,
    onSchemeClick: (String) -> Unit,
    onWhyMeClick: (String) -> Unit,
    onSaveToggle: (String) -> Unit
) {
    val lang = uiState.selectedLanguage
    val appTitle = com.pacssahayak.domain.language.AndroidTranslations.getString("app.name", lang)
    val logoLetter = com.pacssahayak.domain.language.AndroidTranslations.getLogoLetter(lang)
    val langDisplayName = com.pacssahayak.domain.language.AndroidTranslations.getLanguageDisplayName(lang)

    Scaffold(
        topBar = {
            PacsTopAppBar(
                title = appTitle,
                logoLetter = logoLetter,
                currentLanguageName = langDisplayName,
                onLanguageClick = { onNavigate(Screen.Language.route) }
            )
        },
        bottomBar = {
            PacsBottomBar(
                currentRoute = Screen.Home.route,
                selectedLanguage = lang,
                onNavigate = onNavigate
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // Hero Section
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 16.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = com.pacssahayak.domain.language.AndroidTranslations.getString("home.tagline", lang),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryIndigo,
                        letterSpacing = 2.sp
                    )

                    Spacer(modifier = Modifier.height(4.dp))

                    Text(
                        text = com.pacssahayak.domain.language.AndroidTranslations.getString("home.heroTitle", lang),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold,
                        color = OnSurface,
                        textAlign = TextAlign.Center
                    )

                    Text(
                        text = com.pacssahayak.domain.language.AndroidTranslations.getString("home.heroSubtitle", lang),
                        fontSize = 14.sp,
                        color = OnSurfaceVariant,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                    )

                    // Hero Action Buttons
                    Button(
                        onClick = { onNavigate(Screen.Profile.route) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                    ) {
                        Text(
                            text = com.pacssahayak.domain.language.AndroidTranslations.getString("home.findMySchemes", lang),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = OnPrimary
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedButton(
                        onClick = { onNavigate(Screen.VoiceInput.route) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(12.dp),
                        border = BorderStroke(1.dp, OutlineVariant),
                        colors = ButtonDefaults.outlinedButtonColors(containerColor = SurfaceContainerLow)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Mic,
                            contentDescription = null,
                            tint = PrimaryIndigo,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "🎙 " + com.pacssahayak.domain.language.AndroidTranslations.getString("home.speakToAssistant", lang),
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = PrimaryIndigo
                        )
                    }
                }
            }

            // Quick Needs Section
            item {
                Column {
                    Text(
                        text = com.pacssahayak.domain.language.AndroidTranslations.getString("home.quickNeeds", lang),
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = OnSurface,
                        modifier = Modifier.padding(bottom = 12.dp)
                    )

                    // 2-Column Grid
                    for (i in QUICK_NEEDS.indices step 2) {
                        val item1 = QUICK_NEEDS[i]
                        val item2 = if (i + 1 < QUICK_NEEDS.size) QUICK_NEEDS[i + 1] else null

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(bottom = 10.dp),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            QuickNeedCard(
                                need = item1,
                                modifier = Modifier.weight(1f),
                                onClick = { onNavigate(Screen.Matches.route) }
                            )

                            if (item2 != null) {
                                QuickNeedCard(
                                    need = item2,
                                    modifier = Modifier.weight(1f),
                                    onClick = { onNavigate(Screen.Matches.route) }
                                )
                            } else {
                                Spacer(modifier = Modifier.weight(1f))
                            }
                        }
                    }
                }
            }

            // Matched Schemes Section Header
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = com.pacssahayak.domain.language.AndroidTranslations.getString("home.matchedWelfareSchemes", lang),
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = OnSurface
                    )

                    if (uiState.matches.isNotEmpty()) {
                        Text(
                            text = "${com.pacssahayak.domain.language.AndroidTranslations.getString("home.viewAll", lang)} (${uiState.matches.size})",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryIndigo,
                            modifier = Modifier.clickable { onNavigate(Screen.Matches.route) }
                        )
                    }
                }
            }

            // Matched Scheme Items or Empty State
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
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "No Government Schemes Loaded",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = OnSurface
                            )
                            Text(
                                text = "The application is ready to connect to official gazette APIs. No mock data is populated.",
                                fontSize = 12.sp,
                                color = OnSurfaceVariant,
                                textAlign = TextAlign.Center,
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
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Setup Profile for Exact Match Scoring",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = OnSurface
                            )
                            Text(
                                text = "Provide your age, occupation, and district to evaluate real welfare criteria.",
                                fontSize = 12.sp,
                                color = OnSurfaceVariant,
                                textAlign = TextAlign.Center,
                                modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                            )
                            Button(
                                onClick = { onNavigate(Screen.Profile.route) },
                                shape = RoundedCornerShape(10.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
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
                        language = lang,
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

@Composable
fun QuickNeedCard(
    need: QuickNeed,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .height(96.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
        border = BorderStroke(1.dp, OutlineVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(
                imageVector = need.icon,
                contentDescription = need.title,
                tint = PrimaryIndigo,
                modifier = Modifier.size(32.dp)
            )
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = need.title,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = OnSurface,
                textAlign = TextAlign.Center
            )
        }
    }
}
