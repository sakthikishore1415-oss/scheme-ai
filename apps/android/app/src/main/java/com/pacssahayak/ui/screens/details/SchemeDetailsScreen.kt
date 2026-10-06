package com.pacssahayak.ui.screens.details

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
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.BookmarkBorder
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Description
import androidx.compose.material.icons.filled.OpenInNew
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.pacssahayak.data.model.Scheme
import com.pacssahayak.ui.components.PacsTopAppBar
import com.pacssahayak.ui.theme.OnPrimary
import com.pacssahayak.ui.theme.OnSecondaryContainer
import com.pacssahayak.ui.theme.OnSurface
import com.pacssahayak.ui.theme.OnSurfaceVariant
import com.pacssahayak.ui.theme.OnTertiaryContainer
import com.pacssahayak.ui.theme.Outline
import com.pacssahayak.ui.theme.OutlineVariant
import com.pacssahayak.ui.theme.PrimaryFixed
import com.pacssahayak.ui.theme.PrimaryIndigo
import com.pacssahayak.ui.theme.SecondaryContainer
import com.pacssahayak.ui.theme.SecondaryFixed
import com.pacssahayak.ui.theme.SecondarySaffron
import com.pacssahayak.ui.theme.Surface
import com.pacssahayak.ui.theme.SurfaceContainerHigh
import com.pacssahayak.ui.theme.SurfaceContainerLow
import com.pacssahayak.ui.theme.SurfaceContainerLowest
import com.pacssahayak.ui.theme.TertiaryContainer
import com.pacssahayak.ui.theme.TertiaryFixed

@Composable
fun SchemeDetailsScreen(
    scheme: Scheme?,
    isSaved: Boolean,
    language: String = "en",
    onSaveToggle: (String) -> Unit,
    onWhyMeClick: (String) -> Unit,
    onNavigateBack: () -> Unit
) {
    if (scheme == null) {
        Scaffold(
            topBar = {
                PacsTopAppBar(
                    title = "Scheme Details",
                    logoLetter = com.pacssahayak.domain.language.AndroidTranslations.getLogoLetter(language),
                    currentLanguageName = com.pacssahayak.domain.language.AndroidTranslations.getLanguageDisplayName(language),
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
            PacsTopAppBar(
                title = scheme.name,
                logoLetter = com.pacssahayak.domain.language.AndroidTranslations.getLogoLetter(language),
                currentLanguageName = com.pacssahayak.domain.language.AndroidTranslations.getLanguageDisplayName(language),
                canNavigateBack = true,
                onNavigateBack = onNavigateBack
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
        ) {
            // Header Hero Banner Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PrimaryIndigo),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(20.dp))
                                .background(PrimaryFixed)
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = if (scheme.schemeType == "central") "CENTRAL SECTOR SCHEME" else "${scheme.stateId} STATE SCHEME",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryIndigo
                            )
                        }

                        IconButton(
                            onClick = { onSaveToggle(scheme.id) },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(
                                imageVector = if (isSaved) Icons.Default.Bookmark else Icons.Default.BookmarkBorder,
                                contentDescription = "Bookmark Scheme",
                                tint = if (isSaved) SecondaryContainer else Color.White
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = scheme.name,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )

                    if (!scheme.nativeName.isNullOrBlank()) {
                        Text(
                            text = scheme.nativeName,
                            fontSize = 13.sp,
                            color = PrimaryFixed,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }

                    Text(
                        text = "Authority: ${scheme.department}",
                        fontSize = 11.sp,
                        color = SurfaceContainerHigh,
                        modifier = Modifier.padding(top = 6.dp)
                    )
                }
            }

            // Tabs
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = Surface,
                contentColor = PrimaryIndigo,
                indicator = { tabPositions ->
                    TabRowDefaults.SecondaryIndicator(
                        Modifier.tabIndicatorOffset(tabPositions[selectedTab]),
                        color = PrimaryIndigo
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
                                fontWeight = if (selectedTab == index) FontWeight.Bold else FontWeight.Medium,
                                fontSize = 13.sp,
                                color = if (selectedTab == index) PrimaryIndigo else OnSurfaceVariant
                            )
                        }
                    )
                }
            }

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                when (selectedTab) {
                    0 -> {
                        // Overview Tab: Sanctioned Benefits
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                                border = BorderStroke(1.dp, OutlineVariant)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "SANCTIONED BENEFITS",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = TertiaryContainer,
                                        letterSpacing = 1.sp
                                    )
                                    Text(
                                        text = scheme.benefits.amount ?: scheme.benefits.shortSummary,
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryIndigo,
                                        modifier = Modifier.padding(top = 4.dp)
                                    )
                                    Text(
                                        text = scheme.benefits.detailedBenefit,
                                        fontSize = 13.sp,
                                        color = OnSurface,
                                        lineHeight = 19.sp,
                                        modifier = Modifier.padding(top = 6.dp)
                                    )
                                }
                            }
                        }

                        // Summary
                        item {
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                                border = BorderStroke(1.dp, OutlineVariant)
                            ) {
                                Column(modifier = Modifier.padding(16.dp)) {
                                    Text(
                                        text = "Plain Explanation / விளக்கம்:",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 14.sp,
                                        color = PrimaryIndigo
                                    )
                                    Text(
                                        text = scheme.summarySimple,
                                        fontSize = 13.sp,
                                        color = OnSurfaceVariant,
                                        lineHeight = 19.sp,
                                        modifier = Modifier.padding(top = 6.dp)
                                    )
                                }
                            }
                        }

                        // Why Me CTA Button
                        item {
                            Button(
                                onClick = { onWhyMeClick(scheme.id) },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(50.dp),
                                shape = RoundedCornerShape(12.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                            ) {
                                Text(
                                    text = "Why Did I Qualify? (Statutory Breakdown)",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = OnPrimary
                                )
                            }
                        }
                    }
                    1 -> {
                        // Documents Tab
                        itemsIndexed(scheme.documents) { index, doc ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
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
                                    Box(
                                        modifier = Modifier
                                            .size(36.dp)
                                            .clip(CircleShape)
                                            .background(if (doc.mandatory) TertiaryFixed.copy(alpha = 0.5f) else SurfaceContainerLow),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.Description,
                                            contentDescription = null,
                                            tint = if (doc.mandatory) TertiaryContainer else Outline,
                                            modifier = Modifier.size(18.dp)
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Column(modifier = Modifier.weight(1f)) {
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.SpaceBetween,
                                            verticalAlignment = Alignment.CenterVertically
                                        ) {
                                            Text(
                                                text = doc.name,
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp,
                                                color = OnSurface
                                            )
                                            Text(
                                                text = if (doc.mandatory) "MANDATORY" else "OPTIONAL",
                                                fontSize = 9.sp,
                                                fontWeight = FontWeight.Bold,
                                                color = if (doc.mandatory) SecondarySaffron else Outline
                                            )
                                        }
                                        Text(
                                            text = doc.description,
                                            fontSize = 12.sp,
                                            color = OnSurfaceVariant,
                                            modifier = Modifier.padding(top = 2.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                    2 -> {
                        // Application Steps / Roadmap
                        itemsIndexed(scheme.applicationSteps) { index, step ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(14.dp),
                                colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                                border = BorderStroke(1.dp, OutlineVariant)
                            ) {
                                Row(modifier = Modifier.padding(14.dp), verticalAlignment = Alignment.Top) {
                                    Box(
                                        modifier = Modifier
                                            .size(28.dp)
                                            .clip(CircleShape)
                                            .background(PrimaryFixed),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = "${index + 1}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 12.sp,
                                            color = PrimaryIndigo
                                        )
                                    }

                                    Spacer(modifier = Modifier.width(12.dp))

                                    Text(
                                        text = step,
                                        fontSize = 13.sp,
                                        color = OnSurface,
                                        lineHeight = 19.sp
                                    )
                                }
                            }
                        }

                        if (!scheme.officialSource.isNullOrBlank()) {
                            item {
                                Card(
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(12.dp),
                                    colors = CardDefaults.cardColors(containerColor = SurfaceContainerLow)
                                ) {
                                    Row(
                                        modifier = Modifier.padding(12.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(
                                            imageVector = Icons.Default.OpenInNew,
                                            contentDescription = null,
                                            tint = PrimaryIndigo,
                                            modifier = Modifier.size(16.dp)
                                        )
                                        Spacer(modifier = Modifier.width(8.dp))
                                        Text(
                                            text = "Official Source: ${scheme.officialSource}",
                                            fontSize = 11.sp,
                                            color = PrimaryIndigo
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
