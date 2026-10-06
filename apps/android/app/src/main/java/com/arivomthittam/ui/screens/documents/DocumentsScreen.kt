package com.arivomthittam.ui.screens.documents

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
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.domain.language.AndroidTranslations
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.theme.OnSurface
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.OutlineVariant
import com.arivomthittam.ui.theme.PrimaryIndigo
import com.arivomthittam.ui.theme.Surface
import com.arivomthittam.ui.theme.SurfaceContainerHigh
import com.arivomthittam.ui.theme.SurfaceContainerLowest
import com.arivomthittam.ui.theme.TertiaryContainer

data class StandardDocument(
    val id: String,
    val name: String,
    val tamilName: String,
    val description: String
)

val STANDARD_DOCUMENTS = listOf(
    StandardDocument("aadhaar", "Aadhaar Card", "ஆதார் அட்டை", "Primary identity and residential proof"),
    StandardDocument("ration", "Smart Ration Card", "குடும்ப அட்டை", "Household composition and economic status"),
    StandardDocument("income_cert", "Income Certificate", "வருமானச் சான்றிதழ்", "Issued by Tahsildar / Revenue Department"),
    StandardDocument("community_cert", "Community Certificate", "சாதிச் சான்றிதழ்", "SC/ST/OBC/MBC verification"),
    StandardDocument("land_patta", "Land Patta / Chitta", "பட்டா / சிட்டா", "Proof of agricultural land ownership"),
    StandardDocument("bank_passbook", "Bank Passbook (Aadhaar Seeded)", "வங்கி கணக்கு புத்தகம்", "For Direct Benefit Transfer (DBT)"),
    StandardDocument("disability_cert", "Disability Identity Card (UDID)", "மாற்றுத்திறனாளி அட்டை", "Issued by District Medical Board")
)

@Composable
fun DocumentsScreen(
    language: String = "ta",
    checkedDocuments: Set<String>,
    onToggleDocument: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    val readyCount = checkedDocuments.size
    val totalCount = STANDARD_DOCUMENTS.size
    val progress = if (totalCount > 0) readyCount.toFloat() / totalCount else 0f

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "PACS Sahayak",
                tamilTitle = AndroidTranslations.getString(language, "scheme.documents"),
                currentLanguageName = AndroidTranslations.getLanguageDisplayName(language),
                logoLetter = AndroidTranslations.getLogoLetter(language),
                canNavigateBack = true,
                onNavigateBack = onNavigateBack
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Readiness Summary Card
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                    border = BorderStroke(1.dp, OutlineVariant)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Document Readiness",
                                fontWeight = FontWeight.Bold,
                                fontSize = 15.sp,
                                color = PrimaryIndigo
                            )
                            Text(
                                text = "$readyCount of $totalCount ready",
                                fontWeight = FontWeight.Bold,
                                fontSize = 12.sp,
                                color = TertiaryContainer
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        LinearProgressIndicator(
                            progress = { progress },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(8.dp),
                            color = TertiaryContainer,
                            trackColor = SurfaceContainerHigh
                        )
                    }
                }
            }

            item {
                Text(
                    text = "Citizen Document Checklist",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryIndigo
                )
            }

            items(STANDARD_DOCUMENTS) { doc ->
                val isChecked = checkedDocuments.contains(doc.id)
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clickable { onToggleDocument(doc.id) },
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                    border = BorderStroke(1.dp, OutlineVariant),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Checkbox(
                            checked = isChecked,
                            onCheckedChange = { onToggleDocument(doc.id) },
                            colors = CheckboxDefaults.colors(checkedColor = PrimaryIndigo)
                        )

                        Column(modifier = Modifier.padding(start = 8.dp)) {
                            Text(
                                text = "${doc.name} (${doc.tamilName})",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = OnSurface
                            )
                            Text(
                                text = doc.description,
                                fontSize = 12.sp,
                                color = OnSurfaceVariant
                            )
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}
