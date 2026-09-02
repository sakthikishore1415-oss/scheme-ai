package com.arivomthittam.ui.screens.details

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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.HelpOutline
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.Scheme
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.Emerald50
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Emerald800
import com.arivomthittam.ui.theme.Emerald900
import com.arivomthittam.ui.theme.Rose600
import com.arivomthittam.ui.theme.Slate100
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate700
import com.arivomthittam.ui.theme.Slate900

@Composable
fun SchemeDetailsScreen(
    scheme: Scheme?,
    isSaved: Boolean,
    onSaveToggle: (String) -> Unit,
    onWhyMeClick: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    if (scheme == null) {
        Scaffold(
            topBar = {
                ArivomTopAppBar(
                    title = "Scheme Details",
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
                Text("Scheme details not found.")
            }
        }
        return
    }

    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Overview", "Documents", "Roadmap")

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = scheme.name,
                tamilTitle = scheme.nativeName,
                canNavigateBack = true,
                onNavigateBack = onNavigateBack
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
        ) {
            // Header card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Slate900)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = if (scheme.schemeType == "central") "CENTRAL SCHEME" else "${scheme.stateId} STATE SCHEME",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = Emerald600
                        )

                        IconButton(onClick = { onSaveToggle(scheme.id) }) {
                            Icon(
                                imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                contentDescription = null,
                                tint = if (isSaved) Rose600 else Color.White
                            )
                        }
                    }

                    Text(
                        text = scheme.name,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )

                    if (!scheme.nativeName.isNullOrBlank()) {
                        Text(
                            text = scheme.nativeName,
                            fontSize = 13.sp,
                            color = Emerald500
                        )
                    }

                    Text(
                        text = "Authority: ${scheme.department}",
                        fontSize = 11.sp,
                        color = Slate500,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }
            }

            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Color.White,
                contentColor = Emerald800,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = Emerald600
                    )
                }
            ) {
                tabs.forEachIndexed { index, title ->
                    Tab(
                        selected = selectedTab == index,
                        onClick = { selectedTab = index },
                        text = {
                            Text(
                                text = title,
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Normal,
                                fontSize = 13.sp
                            )
                        }
                    )
                }
            }

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                when (selectedTab) {
                    0 -> {
                        // Overview
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = Emerald50)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "SANCTIONED BENEFITS",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Emerald800
                                    )
                                    Text(
                                        text = scheme.benefits.amount ?: scheme.benefits.shortSummary,
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Emerald900
                                    )
                                    Text(
                                        text = scheme.benefits.detailedBenefit,
                                        fontSize = 12.sp,
                                        color = Slate700,
                                        modifier = Modifier.padding(top = 6.dp)
                                    )
                                }
                            }
                        }

                        item {
                            Text(
                                text = "Citizen Plain Explanation:",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Slate900
                            )
                            Text(
                                text = scheme.summarySimple,
                                fontSize = 13.sp,
                                color = Slate700,
                                lineHeight = 18.sp,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }

                        item {
                            OutlinedButton(
                                onClick = { onWhyMeClick(scheme.id) },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp)
                            ) {
                                Icon(Icons.Default.HelpOutline, contentDescription = null, modifier = Modifier.padding(end = 6.dp))
                                Text("WHY DID I QUALIFY? (TRANSPARENCY BREAKDOWN)")
                            }
                        }
                    }
                    1 -> {
                        // Documents
                        itemsIndexed(scheme.documents) { index, doc ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                            ) {
                                Column(modifier = Modifier.padding(14.dp)) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween
                                    ) {
                                        Text(
                                            text = "${index + 1}. ${doc.name}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = Slate900
                                        )
                                        Text(
                                            text = if (doc.mandatory) "MANDATORY" else "OPTIONAL",
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (doc.mandatory) Rose600 else Slate500
                                        )
                                    }
                                    Text(
                                        text = doc.description,
                                        fontSize = 12.sp,
                                        color = Slate500,
                                        modifier = Modifier.padding(top = 4.dp)
                                    )
                                }
                            }
                        }
                    }
                    2 -> {
                        // Roadmap
                        itemsIndexed(scheme.applicationSteps) { index, step ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = Color.White),
                                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                            ) {
                                Row(modifier = Modifier.padding(14.dp)) {
                                    Text(
                                        text = "${index + 1}",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 14.sp,
                                        color = Emerald700,
                                        modifier = Modifier.padding(end = 12.dp)
                                    )
                                    Text(
                                        text = step,
                                        fontSize = 13.sp,
                                        color = Slate900,
                                        lineHeight = 18.sp
                                    )
                                }
                            }
                        }

                        item {
                            if (!scheme.officialSource.isNullOrBlank()) {
                                Text(
                                    text = "Official Source: ${scheme.officialSource}",
                                    fontSize = 11.sp,
                                    color = Slate500,
                                    modifier = Modifier.padding(top = 8.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

