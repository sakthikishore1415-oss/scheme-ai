package com.arivomthittam.ui.components

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
import androidx.compose.material.icons.filled.Sparkles
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
import com.arivomthittam.data.model.MatchLevel
import com.arivomthittam.ui.theme.Amber100
import com.arivomthittam.ui.theme.Amber600
import com.arivomthittam.ui.theme.Emerald100
import com.arivomthittam.ui.theme.Emerald50
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Emerald800
import com.arivomthittam.ui.theme.Emerald900
import com.arivomthittam.ui.theme.Rose50
import com.arivomthittam.ui.theme.Rose600
import com.arivomthittam.ui.theme.Slate200
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate700
import com.arivomthittam.ui.theme.Slate900

@Composable
fun SchemeCardItem(
    result: EligibilityResult,
    isSaved: Boolean,
    onSaveToggle: (String) -> Unit,
    onDetailsClick: (String) -> Unit,
    onWhyMeClick: (String) -> Unit
) {
    val scheme = result.scheme

    val (badgeBg, badgeText) = when (result.matchLevel) {
        MatchLevel.STRONG -> Pair(Emerald100, Emerald900)
        MatchLevel.POTENTIAL -> Pair(Amber100, Amber600)
        else -> Pair(Slate200, Slate700)
    }

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onDetailsClick(scheme.id) },
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Badges Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(badgeBg)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Sparkles,
                                contentDescription = null,
                                modifier = Modifier.size(12.dp),
                                tint = badgeText
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${result.score}% MATCH",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = badgeText
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(6.dp))

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Emerald50)
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = if (scheme.schemeType == "central") "Central" else "${scheme.stateId} State",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Emerald800
                        )
                    }
                }

                IconButton(onClick = { onSaveToggle(scheme.id) }) {
                    Icon(
                        imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                        contentDescription = if (isSaved) "Remove from Saved" else "Save Scheme",
                        tint = if (isSaved) Rose600 else Slate500
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            // Scheme Name & Native Name
            Text(
                text = scheme.name,
                fontWeight = FontWeight.Black,
                fontSize = 17.sp,
                color = Slate900,
                lineHeight = 22.sp
            )

            if (!scheme.nativeName.isNullOrBlank()) {
                Text(
                    text = scheme.nativeName,
                    fontSize = 13.sp,
                    color = Emerald700,
                    fontWeight = FontWeight.Medium
                )
            }

            Text(
                text = scheme.department,
                fontSize = 11.sp,
                color = Slate500,
                modifier = Modifier.padding(top = 4.dp)
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Benefit Box
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(12.dp))
                    .background(Emerald50)
                    .padding(12.dp)
            ) {
                Column {
                    Text(
                        text = "POTENTIAL BENEFIT",
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = Emerald800
                    )
                    Text(
                        text = scheme.benefits.amount ?: scheme.benefits.shortSummary,
                        fontWeight = FontWeight.Black,
                        fontSize = 15.sp,
                        color = Emerald900
                    )
                    Text(
                        text = scheme.benefits.shortSummary,
                        fontSize = 11.sp,
                        color = Slate700,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                OutlinedButton(
                    onClick = { onWhyMeClick(scheme.id) },
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        Icons.Default.HelpOutline,
                        contentDescription = null,
                        modifier = Modifier.size(14.dp),
                        tint = Emerald700
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("WHY ME?", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Slate900)
                }

                Button(
                    onClick = { onDetailsClick(scheme.id) },
                    colors = ButtonDefaults.buttonColors(containerColor = Emerald600),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("DETAILS", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

