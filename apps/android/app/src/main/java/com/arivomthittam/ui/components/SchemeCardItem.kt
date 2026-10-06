package com.arivomthittam.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
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
import com.arivomthittam.data.model.EligibilityStatus
import com.arivomthittam.ui.theme.OnPrimary
import com.arivomthittam.ui.theme.OnSecondaryContainer
import com.arivomthittam.ui.theme.OnSurface
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.OnTertiaryContainer
import com.arivomthittam.ui.theme.OutlineVariant
import com.arivomthittam.ui.theme.PrimaryIndigo
import com.arivomthittam.ui.theme.SecondaryContainer
import com.arivomthittam.ui.theme.SecondaryFixed
import com.arivomthittam.ui.theme.SecondarySaffron
import com.arivomthittam.ui.theme.SurfaceContainerLow
import com.arivomthittam.ui.theme.SurfaceContainerLowest
import com.arivomthittam.ui.theme.TertiaryContainer
import com.arivomthittam.ui.theme.TertiaryFixed

@Composable
fun SchemeCardItem(
    result: EligibilityResult,
    isSaved: Boolean,
    language: String = "en",
    onSaveToggle: (String) -> Unit,
    onDetailsClick: (String) -> Unit,
    onWhyMeClick: (String) -> Unit
) {
    val scheme = result.scheme

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onDetailsClick(scheme.id) },
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
        border = BorderStroke(1.dp, OutlineVariant),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            // Header: Category Badge & Bookmark Action
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Eligibility Badge
                when (result.status) {
                    EligibilityStatus.ELIGIBLE -> {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(TertiaryFixed.copy(alpha = 0.5f))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "${com.arivomthittam.domain.language.AndroidTranslations.getString("scheme.statusEligible", language)} (${result.score}%)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = TertiaryContainer
                            )
                        }
                    }
                    EligibilityStatus.NEEDS_INFORMATION -> {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(SecondaryFixed)
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "${com.arivomthittam.domain.language.AndroidTranslations.getString("scheme.statusMoreInfo", language)} (${result.score}%)",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = OnSecondaryContainer
                            )
                        }
                    }
                    else -> {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(SurfaceContainerLow)
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = com.arivomthittam.domain.language.AndroidTranslations.getString("scheme.statusPending", language),
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = OnSurfaceVariant
                            )
                        }
                    }
                }

                IconButton(
                    onClick = { onSaveToggle(scheme.id) },
                    modifier = Modifier.size(32.dp)
                ) {
                    Icon(
                        imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = "Save Scheme",
                        tint = if (isSaved) SecondarySaffron else OutlineVariant
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Scheme Name & Native Title (Prioritizes Regional Native Title)
            val isRegional = language != "en"
            val cleanNative = if (!scheme.nativeName.isNullOrBlank()) {
                val parts = scheme.nativeName.split("/").map { it.trim() }
                if (language == "ta") parts.find { it.any { ch -> ch in '\u0B80'..'\u0BFF' } } ?: parts.first()
                else if (language == "hi") parts.find { it.any { ch -> ch in '\u0900'..'\u097F' } } ?: parts.first()
                else if (language == "te") parts.find { it.any { ch -> ch in '\u0C00'..'\u0C7F' } } ?: parts.first()
                else if (language == "ml") parts.find { it.any { ch -> ch in '\u0D00'..'\u0D7F' } } ?: parts.first()
                else parts.first()
            } else ""

            val primaryTitle = if (isRegional && cleanNative.isNotBlank()) cleanNative else scheme.name
            val secondaryTitle = if (isRegional && cleanNative.isNotBlank()) scheme.name else cleanNative

            Text(
                text = primaryTitle,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = PrimaryIndigo,
                lineHeight = 24.sp
            )

            if (secondaryTitle.isNotBlank()) {
                Text(
                    text = secondaryTitle,
                    fontSize = 13.sp,
                    color = OnSurfaceVariant,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(top = 2.dp)
                )
            }

            Text(
                text = scheme.summarySimple,
                fontSize = 13.sp,
                color = OnSurface,
                lineHeight = 18.sp,
                modifier = Modifier.padding(top = 6.dp, bottom = 10.dp)
            )

            // Why Me? Match Logic Indicator Box
            val whyMePoint = if (result.whyMeRegional.isNotEmpty()) {
                result.whyMeRegional.first()
            } else if (result.whyMeEnglish.isNotEmpty()) {
                result.whyMeEnglish.first()
            } else {
                null
            }

            if (!whyMePoint.isNullOrBlank()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(SurfaceContainerLow)
                        .padding(horizontal = 10.dp, vertical = 8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = TertiaryContainer,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = whyMePoint,
                            fontSize = 11.sp,
                            color = OnSurface,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = { onWhyMeClick(scheme.id) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    border = BorderStroke(1.dp, PrimaryIndigo)
                ) {
                    Text(
                        text = com.arivomthittam.domain.language.AndroidTranslations.getString("scheme.whyMe", language),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryIndigo
                    )
                }

                Button(
                    onClick = { onDetailsClick(scheme.id) },
                    modifier = Modifier.weight(1f),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                ) {
                    Text(
                        text = com.arivomthittam.domain.language.AndroidTranslations.getString("scheme.viewDetails", language),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = OnPrimary
                    )
                }
            }
        }
    }
}
