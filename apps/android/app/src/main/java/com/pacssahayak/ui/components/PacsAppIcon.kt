package com.pacssahayak.ui.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import com.pacssahayak.R

/**
 * Official Civic & Agricultural Emblem for PACS Sahayak
 */
@Composable
fun PacsAppIcon(
    modifier: Modifier = Modifier,
    size: Dp = 36.dp,
    isCircle: Boolean = false
) {
    val shape = if (isCircle) CircleShape else RoundedCornerShape(size * 0.28f)

    Box(
        modifier = modifier
            .size(size)
            .clip(shape)
            .background(
                Brush.linearGradient(
                    colors = listOf(
                        Color(0xFFE3C282),
                        Color(0xFFB88E3F),
                        Color(0xFF4A1F2D)
                    )
                )
            )
            .border(1.dp, Color(0xFFC8A96B), shape),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(id = R.drawable.ic_pacs_sahayak_logo),
            contentDescription = "PACS Sahayak Emblem",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )
    }
}
