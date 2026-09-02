package com.arivomthittam.ui.screens.saved

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
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
import com.arivomthittam.ui.components.ArivomBottomBar
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.components.SchemeCardItem
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate900
import com.arivomthittam.viewmodel.UiState

@Composable
fun SavedSchemesScreen(
    uiState: UiState,
    onNavigate: (String) -> Unit,
    onSchemeClick: (String) -> Unit,
    onWhyMeClick: (String) -> Unit,
    onSaveToggle: (String) -> Unit
) {
    val savedMatches = uiState.matches.filter { uiState.savedSchemeIds.contains(it.scheme.id) }

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Saved Schemes",
                tamilTitle = "சேமிக்கப்பட்டவை"
            )
        },
        bottomBar = {
            ArivomBottomBar(
                currentRoute = Screen.Saved.route,
                onNavigate = onNavigate
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
                Text(
                    text = "Bookmarked Schemes",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Black,
                    color = Slate900
                )
                Text(
                    text = "Saved locally on your device for offline reference.",
                    fontSize = 12.sp,
                    color = Slate500
                )
            }

            if (savedMatches.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "You haven't saved any schemes yet.",
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = Slate900
                            )
                            Text(
                                text = "Bookmark schemes from matches to view offline anytime.",
                                fontSize = 12.sp,
                                color = Slate500,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }
                    }
                }
            } else {
                items(savedMatches) { match ->
                    SchemeCardItem(
                        result = match,
                        isSaved = true,
                        onSaveToggle = onSaveToggle,
                        onDetailsClick = onSchemeClick,
                        onWhyMeClick = onWhyMeClick
                    )
                }
            }
        }
    }
}

