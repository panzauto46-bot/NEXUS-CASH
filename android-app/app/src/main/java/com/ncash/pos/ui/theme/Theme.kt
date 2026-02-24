package com.ncash.pos.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable

private val LightColors = lightColorScheme(
    primary = Mint,
    onPrimary = CardLight,
    secondary = Cyan,
    error = Danger,
    background = SurfaceLight,
    surface = CardLight,
    onBackground = TextLight,
    onSurface = TextLight
)

private val DarkColors = darkColorScheme(
    primary = Mint,
    onPrimary = TextDark,
    secondary = Cyan,
    error = Danger,
    background = SurfaceDark,
    surface = CardDark,
    onBackground = TextDark,
    onSurface = TextDark
)

@Composable
fun NCashTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        typography = NCashTypography,
        content = content
    )
}
