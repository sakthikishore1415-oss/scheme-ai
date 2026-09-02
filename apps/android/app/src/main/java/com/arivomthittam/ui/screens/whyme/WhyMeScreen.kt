package com.arivomthittam.ui.screens.whyme

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.Info
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
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.EligibilityResult
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.theme.OnPrimary
import com.arivomthittam.ui.theme.OnSecondaryContainer
import com.arivomthittam.ui.theme.OnSurface
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.OnTertiaryContainer
import com.arivomthittam.ui.theme.Outline
import com.arivomthittam.ui.theme.OutlineVariant
import com.arivomthittam.ui.theme.PrimaryFixed
import com.arivomthittam.ui.theme.PrimaryIndigo
import com.arivomthittam.ui.theme.SecondaryContainer
import com.arivomthittam.ui.theme.SecondaryFixed
import com.arivomthittam.ui.theme.SecondarySaffron
import com.arivomthittam.ui.theme.Surface
import com.arivomthittam.ui.theme.SurfaceContainerHigh
import com.arivomthittam.ui.theme.SurfaceContainerLow
import com.arivomthittam.ui.theme.SurfaceContainerLowest
import com.arivomthittam.ui.theme.TertiaryContainer
import com.arivomthittam.ui.theme.TertiaryFixed

@Composable
fun WhyMeScreen(
    matchResult: EligibilityResult?,
    onNavigateBack: () -> Unit
) {
    if (matchResult == null) {
        Scaffold(
            topBar = {
                ArivomTopAppBar(
                    title = "Why Me?",
                    canNavigateBack = true,
                    onNavigateBack = onNavigateBack
                )
            }
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding),
                contentAlignment = Alignment.Center
            ) {
                Text("Match criteria not found.")
            }
        }
        return
    }

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Why Did I Qualify?",
                tamilTitle = "எனக்கு ஏன் இந்த திட்டம்?",
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
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Header Score Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PrimaryIndigo)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Text(
                            text = "DETERMINISTIC EVALUATION",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryFixed,
                            letterSpacing = 1.sp
                        )
                        Text(
                            text = matchResult.scheme.name,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                        Text(
                            text = "Score: ${matchResult.score}% Criteria Compliance",
                            fontSize = 12.sp,
                            color = SecondaryContainer,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }
            }

            // Matched Requirements Section
            item {
                Text(
                    text = "Your Matched Requirements",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = PrimaryIndigo
                )
            }

            items(matchResult.whyMeEnglish) { point ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                    border = BorderStroke(1.dp, OutlineVariant)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(CircleShape)
                                .background(TertiaryFixed.copy(alpha = 0.5f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = TertiaryContainer,
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Text(
                            text = point,
                            fontSize = 13.sp,
                            color = OnSurface,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            // Pending / Missing Information Section
            if (matchResult.pendingPoints.isNotEmpty()) {
                item {
                    Text(
                        text = "What am I missing? / தேவைப்படும் ஆவணங்கள்",
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = PrimaryIndigo,
                        modifier = Modifier.padding(top = 6.dp)
                    )
                }

                items(matchResult.pendingPoints) { pending ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                        border = BorderStroke(1.dp, SecondaryFixed)
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(32.dp)
                                    .clip(CircleShape)
                                    .background(SecondaryFixed),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Description,
                                    contentDescription = null,
                                    tint = OnSecondaryContainer,
                                    modifier = Modifier.size(18.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = pending,
                                    fontSize = 13.sp,
                                    color = OnSurface,
                                    fontWeight = FontWeight.SemiBold
                                )
                                Text(
                                    text = "Required for final statutory sanction.",
                                    fontSize = 11.sp,
                                    color = OnSurfaceVariant
                                )
                            }
                        }
                    }
                }
            }

            // Disclaimer Banner
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceContainerLow)
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = PrimaryIndigo,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Arivom Thittam evaluates eligibility using authoritative deterministic rules published in official gazettes. Final application approval is granted by respective district revenue / nodal officers.",
                            fontSize = 11.sp,
                            color = OnSurfaceVariant,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            // Action Buttons
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Button(
                        onClick = onNavigateBack,
                        modifier = Modifier
                            .weight(1f)
                            .height(48.dp),
                        shape = RoundedCornerShape(24.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                    ) {
                        Text("Back to Schemes", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = OnPrimary)
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}
