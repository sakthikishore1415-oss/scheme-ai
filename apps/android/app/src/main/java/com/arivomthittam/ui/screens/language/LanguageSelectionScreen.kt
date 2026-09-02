package com.arivomthittam.ui.screens.language

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
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Emerald700
import com.arivomthittam.ui.theme.Emerald800
import com.arivomthittam.ui.theme.Slate100
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate900

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
                title = "Choose Language",
                tamilTitle = "மொழி தேர்வு"
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column {
                Text(
                    text = "Select your regional language for voice discovery & explanations",
                    fontSize = 13.sp,
                    color = Slate500,
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
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(
                                containerColor = if (isSelected) Emerald600 else Color.White
                            ),
                            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
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
                                        color = if (isSelected) Color.White else Slate900
                                    )
                                    Text(
                                        text = lang.nativeName,
                                        fontSize = 13.sp,
                                        color = if (isSelected) Slate100 else Emerald700
                                    )
                                }

                                if (isSelected) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = null,
                                        tint = Color.White
                                    )
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
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = Emerald800)
            ) {
                Text(
                    text = "CONTINUE / தொடர்க",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

