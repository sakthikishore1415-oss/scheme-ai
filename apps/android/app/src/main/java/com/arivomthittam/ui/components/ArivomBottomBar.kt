package com.arivomthittam.ui.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.Emerald600
import com.arivomthittam.ui.theme.Slate100
import com.arivomthittam.ui.theme.Slate500
import com.arivomthittam.ui.theme.Slate900

@Composable
fun ArivomBottomBar(
    currentRoute: String?,
    onNavigate: (String) -> Unit
) {
    val items = listOf(
        Triple(Screen.Home.route, "Home", Icons.Default.Home),
        Triple(Screen.Matches.route, "Matches", Icons.Default.CheckCircle),
        Triple(Screen.Saved.route, "Saved", Icons.Default.Bookmark),
        Triple(Screen.Profile.route, "Profile", Icons.Default.Person)
    )

    NavigationBar(
        containerColor = Slate900,
        contentColor = Slate100
    ) {
        items.forEach { (route, label, icon) ->
            val selected = currentRoute == route
            NavigationBarItem(
                icon = { Icon(icon, contentDescription = label) },
                label = { Text(label) },
                selected = selected,
                onClick = { onNavigate(route) },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Slate900,
                    selectedTextColor = Emerald600,
                    indicatorColor = Emerald600,
                    unselectedIconColor = Slate500,
                    unselectedTextColor = Slate500
                )
            )
        }
    }
}

