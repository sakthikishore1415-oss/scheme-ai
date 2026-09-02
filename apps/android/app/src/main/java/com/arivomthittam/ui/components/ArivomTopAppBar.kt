package com.arivomthittam.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Translate
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.ui.text.font.FontWeight
import com.arivomthittam.ui.theme.Emerald800
import com.arivomthittam.ui.theme.Slate50

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ArivomTopAppBar(
    title: String,
    tamilTitle: String? = null,
    canNavigateBack: Boolean = false,
    onNavigateBack: () -> Unit = {},
    onLanguageClick: (() -> Unit)? = null
) {
    TopAppBar(
        title = {
            Text(
                text = if (tamilTitle != null) "$title ($tamilTitle)" else title,
                fontWeight = FontWeight.Bold
            )
        },
        navigationIcon = {
            if (canNavigateBack) {
                IconButton(onClick = onNavigateBack) {
                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                        contentDescription = "Back"
                    )
                }
            }
        },
        actions = {
            if (onLanguageClick != null) {
                IconButton(onClick = onLanguageClick) {
                    Icon(
                        imageVector = Icons.Default.Translate,
                        contentDescription = "Select Language"
                    )
                }
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = Emerald800,
            titleContentColor = Slate50,
            navigationIconContentColor = Slate50,
            actionIconContentColor = Slate50
        )
    )
}

