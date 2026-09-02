package com.arivomthittam.ui.screens.language

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.theme.OnPrimary
import com.arivomthittam.ui.theme.OnSurface
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.OutlineVariant
import com.arivomthittam.ui.theme.PrimaryFixed
import com.arivomthittam.ui.theme.PrimaryIndigo
import com.arivomthittam.ui.theme.Surface
import com.arivomthittam.ui.theme.SurfaceContainerLowest

data class LanguageOption(
    val id: String,
    val name: String,
    val nativeName: String,
    val stateCode: String
)

val LANGUAGES = listOf(
    LanguageOption("ta", "Tamil", "தமிழ்", "TN"),
    LanguageOption("en", "English", "English", "ALL"),
    LanguageOption("te", "Telugu", "తెలుగు", "AP"),
    LanguageOption("kn", "Kannada", "ಕನ್ನಡ", "KA"),
    LanguageOption("ml", "Malayalam", "മലയാളം", "KL"),
    LanguageOption("hi", "Hindi", "हिन्दी", "ALL"),
    LanguageOption("bn", "Bengali", "বাংলা", "WB"),
    LanguageOption("mr", "Marathi", "मराठी", "MH")
)

@Composable
fun LanguageSelectionScreen(
    currentLanguage: String,
    onLanguageSelected: (String, String) -> Unit,
    onContinue: () -> Unit
) {
    var selectedLang by remember { mutableStateOf(currentLanguage) }
    var selectedState by remember { mutableStateOf(LANGUAGES.find { it.id == currentLanguage }?.stateCode ?: "TN") }

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Arivom Thittam",
                tamilTitle = "மொழி தேர்வு"
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "Choose Your Language / மொழியைத் தேர்ந்தெடுக்கவும்",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryIndigo,
                    modifier = Modifier.padding(bottom = 4.dp)
                )

                Text(
                    text = "Select your regional language for voice discovery & explanations.",
                    fontSize = 13.sp,
                    color = OnSurfaceVariant,
                    modifier = Modifier.padding(bottom = 16.dp)
                )

                LazyColumn(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    items(LANGUAGES) { lang ->
                        val isSelected = selectedLang == lang.id
                        Card(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clickable {
                                    selectedLang = lang.id
                                    selectedState = lang.stateCode
                                },
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
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(16.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = lang.name,
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 16.sp,
                                        color = if (isSelected) PrimaryIndigo else OnSurface
                                    )
                                    Text(
                                        text = lang.nativeName,
                                        fontSize = 13.sp,
                                        color = if (isSelected) PrimaryIndigo else OnSurfaceVariant
                                    )
                                }

                                if (isSelected) {
                                    Box(
                                        modifier = Modifier
                                            .size(24.dp)
                                            .clip(CircleShape)
                                            .background(PrimaryIndigo),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Check,
                                            contentDescription = null,
                                            tint = OnPrimary,
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }

            Button(
                onClick = {
                    onLanguageSelected(selectedLang, selectedState)
                    onContinue()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(54.dp),
                shape = RoundedCornerShape(27.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
            ) {
                Text(
                    text = "CONTINUE / தொடர்க",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = OnPrimary
                )
            }
        }
    }
}
