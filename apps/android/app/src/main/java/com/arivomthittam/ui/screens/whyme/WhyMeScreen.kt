package com.arivomthittam.ui.screens.whyme

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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.EligibilityResult
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.theme.Emerald50
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Emerald700
import com.arivomthittam.ui.theme.Emerald900
import com.arivomthittam.ui.theme.Slate100
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate700
import com.arivomthittam.ui.theme.Slate900

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
                tamilTitle = "எனக்கு ஏன்?",
                canNavigateBack = true,
                onNavigateBack = onNavigateBack
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Emerald50)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "DETERMINISTIC SCORE: ${matchResult.score}%",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Emerald800
                        )
                        Text(
                            text = matchResult.scheme.name,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Black,
                            color = Emerald900,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }
                }
            }

            item {
                Text(
                    text = "Satisfied Statutory Criteria:",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Slate900
                )
            }

            items(matchResult.whyMeEnglish) { point ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = null,
                            tint = Emerald600,
                            modifier = Modifier.padding(end = 10.dp)
                        )
                        Text(
                            text = point,
                            fontSize = 13.sp,
                            color = Slate900,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }

            if (matchResult.pendingPoints.isNotEmpty()) {
                item {
                    Text(
                        text = "Pending Requirements or Limits:",
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                        color = Slate900,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }

                items(matchResult.pendingPoints) { pending ->
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Slate100)
                    ) {
                        Text(
                            text = "• $pending",
                            fontSize = 12.sp,
                            color = Slate700,
                            modifier = Modifier.padding(12.dp)
                        )
                    }
                }
            }

            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(14.dp),
                    colors = CardDefaults.cardColors(containerColor = Slate100)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.Top
                    ) {
                        Icon(
                            imageVector = Icons.Default.Info,
                            contentDescription = null,
                            tint = Slate500,
                            modifier = Modifier.padding(end = 8.dp, top = 2.dp)
                        )
                        Text(
                            text = "Disclaimer: Evaluation uses deterministic gazette rules. Final sanctioning is conducted by respective government revenue officers.",
                            fontSize = 11.sp,
                            color = Slate500,
                            lineHeight = 15.sp
                        )
                    }
                }
            }
        }
    }
}

