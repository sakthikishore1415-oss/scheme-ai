package com.arivomthittam.ui.screens.profile

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.CitizenProfile
import com.arivomthittam.ui.components.ArivomBottomBar
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.OnPrimary
import com.arivomthittam.ui.theme.OnPrimaryFixedVariant
import com.arivomthittam.ui.theme.OnSurface
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.OutlineVariant
import com.arivomthittam.ui.theme.PrimaryFixed
import com.arivomthittam.ui.theme.PrimaryIndigo
import com.arivomthittam.ui.theme.Surface
import com.arivomthittam.ui.theme.SurfaceContainerHigh
import com.arivomthittam.ui.theme.SurfaceContainerLow
import com.arivomthittam.ui.theme.SurfaceContainerLowest

data class OccupationChoice(
    val title: String,
    val tamilTitle: String,
    val emoji: String
)

val OCCUPATIONS = listOf(
    OccupationChoice("Farmer", "விவசாயி", "🌾"),
    OccupationChoice("Worker", "தொழிலாளி", "🧑‍🔧"),
    OccupationChoice("Business", "வியாபாரம்", "🛍"),
    OccupationChoice("Student", "மாணவர்", "🎓"),
    OccupationChoice("Homemaker", "குடும்பத் தலைவி", "👩"),
    OccupationChoice("Other", "மற்றவை", "📦")
)

@Composable
fun CitizenProfileScreen(
    currentProfile: CitizenProfile?,
    currentState: String,
    currentLanguage: String,
    onSaveProfile: (CitizenProfile) -> Unit,
    onNavigate: (String) -> Unit
) {
    var name by remember { mutableStateOf(currentProfile?.name ?: "") }
    var ageSlider by remember { mutableFloatStateOf((currentProfile?.age ?: 48).toFloat()) }
    var selectedOccupation by remember { mutableStateOf(currentProfile?.occupation ?: "Farmer") }
    var annualIncomeText by remember { mutableStateOf(currentProfile?.annualIncome?.toString() ?: "120000") }
    var district by remember { mutableStateOf(currentProfile?.district ?: "") }
    var landHoldingText by remember { mutableStateOf(currentProfile?.landHoldingAcres?.toString() ?: "0") }

    Scaffold(
        topBar = {
            Column {
                ArivomTopAppBar(
                    title = "Arivom Thittam",
                    tamilTitle = "சுயவிவர வழிகாட்டி",
                    canNavigateBack = true,
                    onNavigateBack = { onNavigate(Screen.Home.route) }
                )
                LinearProgressIndicator(
                    progress = { 0.75f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(3.dp),
                    color = PrimaryIndigo,
                    trackColor = SurfaceContainerHigh
                )
            }
        },
        bottomBar = {
            ArivomBottomBar(
                currentRoute = Screen.Profile.route,
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
            // Header
            item {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "CITIZEN PROFILE",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = OnSurfaceVariant,
                        letterSpacing = 1.5.sp
                    )
                    Text(
                        text = "What is your demographic details?",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryIndigo,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                    Text(
                        text = "உங்கள் விவரங்களை உள்ளிடவும்",
                        fontSize = 13.sp,
                        color = OnSurfaceVariant
                    )
                }
            }

            // Age Counter & Slider Card
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
                            .padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "What is your age? / வயது",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryIndigo
                        )

                        Spacer(modifier = Modifier.height(12.dp))

                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(20.dp)
                        ) {
                            IconButton(
                                onClick = { if (ageSlider > 18) ageSlider -= 1 },
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(SurfaceContainerLow)
                            ) {
                                Icon(Icons.Default.Remove, contentDescription = "Decrease", tint = PrimaryIndigo)
                            }

                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = "${ageSlider.toInt()}",
                                    fontSize = 44.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryIndigo,
                                    lineHeight = 44.sp
                                )
                                Text(
                                    text = "Years / வயது",
                                    fontSize = 12.sp,
                                    color = OnSurfaceVariant
                                )
                            }

                            IconButton(
                                onClick = { if (ageSlider < 100) ageSlider += 1 },
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(SurfaceContainerLow)
                            ) {
                                Icon(Icons.Default.Add, contentDescription = "Increase", tint = PrimaryIndigo)
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Slider(
                            value = ageSlider,
                            onValueChange = { ageSlider = it },
                            valueRange = 18f..100f,
                            colors = SliderDefaults.colors(
                                thumbColor = PrimaryIndigo,
                                activeTrackColor = PrimaryIndigo,
                                inactiveTrackColor = SurfaceContainerHigh
                            ),
                            modifier = Modifier.fillMaxWidth(0.85f)
                        )
                    }
                }
            }

            // Occupation Grid
            item {
                Text(
                    text = "What do you do? / தொழில்",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryIndigo,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // 2-Column Occupation Selection Grid
            for (i in OCCUPATIONS.indices step 2) {
                val occ1 = OCCUPATIONS[i]
                val occ2 = if (i + 1 < OCCUPATIONS.size) OCCUPATIONS[i + 1] else null

                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        OccupationCard(
                            choice = occ1,
                            isSelected = selectedOccupation == occ1.title,
                            modifier = Modifier.weight(1f),
                            onClick = { selectedOccupation = occ1.title }
                        )

                        if (occ2 != null) {
                            OccupationCard(
                                choice = occ2,
                                isSelected = selectedOccupation == occ2.title,
                                modifier = Modifier.weight(1f),
                                onClick = { selectedOccupation = occ2.title }
                            )
                        } else {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }

            // Income & Details
            item {
                OutlinedTextField(
                    value = annualIncomeText,
                    onValueChange = { annualIncomeText = it },
                    label = { Text("Annual Household Income (₹ / ஆண்டு வருமானம்)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryIndigo,
                        focusedLabelColor = PrimaryIndigo
                    )
                )
            }

            item {
                OutlinedTextField(
                    value = district,
                    onValueChange = { district = it },
                    label = { Text("District / மாவட்டம் (e.g. Madurai, Coimbatore)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryIndigo,
                        focusedLabelColor = PrimaryIndigo
                    )
                )
            }

            item {
                OutlinedTextField(
                    value = landHoldingText,
                    onValueChange = { landHoldingText = it },
                    label = { Text("Agricultural Land (in Acres, or 0)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryIndigo,
                        focusedLabelColor = PrimaryIndigo
                    )
                )
            }

            // Continue Button
            item {
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = {
                        val parsedIncome = annualIncomeText.toLongOrNull() ?: 0L
                        val parsedLand = landHoldingText.toDoubleOrNull() ?: 0.0
                        val profile = CitizenProfile(
                            name = name.ifBlank { null },
                            age = ageSlider.toInt(),
                            occupation = selectedOccupation,
                            annualIncome = parsedIncome,
                            district = district,
                            landHoldingAcres = parsedLand,
                            state = currentState,
                            voiceLanguage = currentLanguage
                        )
                        onSaveProfile(profile)
                        onNavigate(Screen.Matches.route)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(54.dp),
                    shape = RoundedCornerShape(27.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                ) {
                    Text(
                        text = "Continue",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = OnPrimary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(Icons.Default.ArrowForward, contentDescription = null, tint = OnPrimary)
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun OccupationCard(
    choice: OccupationChoice,
    isSelected: Boolean,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    Card(
        modifier = modifier
            .height(108.dp)
            .clickable { onClick() },
        shape = RoundedCornerShape(14.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) PrimaryFixed else SurfaceContainerLowest
        ),
        border = BorderStroke(
            if (isSelected) 2.dp else 1.dp,
            if (isSelected) PrimaryIndigo else OutlineVariant
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            if (isSelected) {
                Box(
                    modifier = Modifier
                        .align(Alignment.TopEnd)
                        .padding(8.dp)
                        .size(20.dp)
                        .clip(CircleShape)
                        .background(PrimaryIndigo),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = null,
                        tint = OnPrimary,
                        modifier = Modifier.size(12.dp)
                    )
                }
            }

            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(10.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center
            ) {
                Text(text = choice.emoji, fontSize = 28.sp)
                Text(
                    text = choice.title,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (isSelected) PrimaryIndigo else OnSurface
                )
                Text(
                    text = choice.tamilTitle,
                    fontSize = 10.sp,
                    color = if (isSelected) OnPrimaryFixedVariant else OnSurfaceVariant
                )
            }
        }
    }
}
