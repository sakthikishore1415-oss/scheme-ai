package com.arivomthittam.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Bookmark
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Repeat
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.domain.language.AndroidTranslations
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.OnSecondaryContainer
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.SecondaryContainer
import com.arivomthittam.ui.theme.Surface

data class NavigationItem(
    val route: String,
    val titleKey: String,
    val icon: ImageVector
)

val NAV_ITEMS = listOf(
    NavigationItem(Screen.Home.route, "nav.home", Icons.Default.Home),
    NavigationItem(Screen.Matches.route, "nav.matches", Icons.Default.Repeat),
    NavigationItem(Screen.Saved.route, "nav.saved", Icons.Default.Bookmark),
    NavigationItem(Screen.Profile.route, "nav.profile", Icons.Default.Person)
)

@Composable
fun ArivomBottomBar(
    currentRoute: String,
    selectedLanguage: String = "en",
    onNavigate: (String) -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = Surface,
        shadowElevation = 8.dp,
        shape = RoundedCornerShape(topStart = 16.dp, topEnd = 16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 8.dp, vertical = 6.dp),
            horizontalArrangement = Arrangement.SpaceAround,
            verticalAlignment = Alignment.CenterVertically
        ) {
            NAV_ITEMS.forEach { item ->
                val isSelected = currentRoute == item.route
                val label = AndroidTranslations.getString(item.titleKey, selectedLanguage)
                val pillModifier = if (isSelected) {
                    Modifier
                        .clip(RoundedCornerShape(20.dp))
                        .background(SecondaryContainer)
                        .clickable { onNavigate(item.route) }
                        .padding(horizontal = 16.dp, vertical = 6.dp)
                } else {
                    Modifier
                        .clip(RoundedCornerShape(12.dp))
                        .clickable { onNavigate(item.route) }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                }

                Column(
                    modifier = pillModifier,
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = label,
                        tint = if (isSelected) OnSecondaryContainer else OnSurfaceVariant,
                        modifier = Modifier.size(22.dp)
                    )
                    Text(
                        text = label,
                        fontSize = 11.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) OnSecondaryContainer else OnSurfaceVariant
                    )
                }
            }
        }
    }
}
