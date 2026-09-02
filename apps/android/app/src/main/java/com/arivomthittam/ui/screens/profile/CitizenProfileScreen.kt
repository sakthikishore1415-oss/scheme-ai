package com.arivomthittam.ui.screens.profile

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.CitizenProfile
import com.arivomthittam.ui.components.ArivomBottomBar
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Emerald700
import com.arivomthittam.ui.theme.Emerald800
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate900

@Composable
fun CitizenProfileScreen(
    currentProfile: CitizenProfile?,
    currentState: String,
    currentLanguage: String,
    onSaveProfile: (CitizenProfile) -> Unit,
    onNavigate: (String) -> Unit
) {
    var name by remember { mutableStateOf(currentProfile?.name ?: "") }
    var ageSlider by remember { mutableFloatStateOf((currentProfile?.age ?: 35).toFloat()) }
    var occupation by remember { mutableStateOf(currentProfile?.occupation ?: "") }
    var annualIncomeText by remember { mutableStateOf(currentProfile?.annualIncome?.toString() ?: "120000") }
    var district by remember { mutableStateOf(currentProfile?.district ?: "") }
    var landHoldingText by remember { mutableStateOf(currentProfile?.landHoldingAcres?.toString() ?: "0") }

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Citizen Profile",
                tamilTitle = "சுயவிவரம்"
            )
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
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Demographic Eligibility Profile",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "Information is used locally to evaluate gazette rules deterministically.",
                    fontSize = 12.sp,
                    color = Slate500
                )
            }

            // Name
            item {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Citizen / Family Head Name (Optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp)
                )
            }

            // Age Slider
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("Age (வயது)", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("${ageSlider.toInt()} Years", fontWeight = FontWeight.Black, fontSize = 16.sp, color = Emerald700)
                        }

                        Slider(
                            value = ageSlider,
                            onValueChange = { ageSlider = it },
                            valueRange = 14f..90f,
                            colors = SliderDefaults.colors(
                                thumbColor = Emerald600,
                                activeTrackColor = Emerald600
                            )
                        )
                    }
                }
            }

            // Occupation
            item {
                OutlinedTextField(
                    value = occupation,
                    onValueChange = { occupation = it },
                    label = { Text("Primary Occupation / தொழில் (e.g. Farmer, Student, Artisan)") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp)
                )
            }

            // Annual Income
            item {
                OutlinedTextField(
                    value = annualIncomeText,
                    onValueChange = { annualIncomeText = it },
                    label = { Text("Approximate Household Annual Income (₹ / year)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp)
                )
            }

            // District
            item {
                OutlinedTextField(
                    value = district,
                    onValueChange = { district = it },
                    label = { Text("District / மாவட்டம்") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp)
                )
            }

            // Land Holding
            item {
                OutlinedTextField(
                    value = landHoldingText,
                    onValueChange = { landHoldingText = it },
                    label = { Text("Agricultural Land Owned (in Acres, or 0)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp)
                )
            }

            // Save Button
            item {
                Spacer(modifier = Modifier.height(10.dp))
                Button(
                    onClick = {
                        val parsedIncome = annualIncomeText.toLongOrNull() ?: 0L
                        val parsedLand = landHoldingText.toDoubleOrNull() ?: 0.0
                        val profile = CitizenProfile(
                            name = name.ifBlank { null },
                            age = ageSlider.toInt(),
                            occupation = occupation,
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
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald800)
                ) {
                    Text(
                        text = "SAVE & MATCH SCHEMES",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

