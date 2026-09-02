package com.arivomthittam.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.navArgument
import com.arivomthittam.ui.screens.details.SchemeDetailsScreen
import com.arivomthittam.ui.screens.documents.DocumentsScreen
import com.arivomthittam.ui.screens.home.HomeScreen
import com.arivomthittam.ui.screens.language.LanguageSelectionScreen
import com.arivomthittam.ui.screens.matches.MyMatchesScreen
import com.arivomthittam.ui.screens.profile.CitizenProfileScreen
import com.arivomthittam.ui.screens.saved.SavedSchemesScreen
import com.arivomthittam.ui.screens.settings.SettingsScreen
import com.arivomthittam.ui.screens.splash.SplashScreen
import com.arivomthittam.ui.screens.voice.VoiceInputScreen
import com.arivomthittam.ui.screens.whyme.WhyMeScreen
import com.arivomthittam.viewmodel.MainViewModel

@Composable
fun ArivomThittamNavGraph(
    navController: NavHostController,
    viewModel: MainViewModel
) {
    val uiState by viewModel.uiState.collectAsState()

    NavHost(
        navController = navController,
        startDestination = Screen.Splash.route
    ) {
        composable(Screen.Splash.route) {
            SplashScreen(
                onSplashFinished = {
                    navController.navigate(Screen.Language.route) {
                        popUpTo(Screen.Splash.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Language.route) {
            LanguageSelectionScreen(
                currentLanguage = uiState.selectedLanguage,
                onLanguageSelected = { lang, state ->
                    viewModel.setLanguage(lang)
                    viewModel.setState(state)
                },
                onContinue = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Language.route) { inclusive = true }
                    }
                }
            )
        }

        composable(Screen.Home.route) {
            HomeScreen(
                uiState = uiState,
                onNavigate = { route -> navController.navigate(route) },
                onSchemeClick = { schemeId ->
                    navController.navigate(Screen.SchemeDetails.createRoute(schemeId))
                },
                onWhyMeClick = { schemeId ->
                    navController.navigate(Screen.WhyMe.createRoute(schemeId))
                },
                onSaveToggle = { schemeId ->
                    viewModel.toggleSaveScheme(schemeId)
                }
            )
        }

        composable(Screen.Profile.route) {
            CitizenProfileScreen(
                currentProfile = uiState.userProfile,
                currentState = uiState.selectedState,
                currentLanguage = uiState.selectedLanguage,
                onSaveProfile = { profile ->
                    viewModel.updateProfile(profile)
                },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.VoiceInput.route) {
            VoiceInputScreen(
                currentLanguage = uiState.selectedLanguage,
                currentState = uiState.selectedState,
                onProfileExtracted = { profile ->
                    viewModel.updateProfile(profile)
                },
                onNavigate = { route -> navController.navigate(route) }
            )
        }

        composable(Screen.Matches.route) {
            MyMatchesScreen(
                uiState = uiState,
                onNavigate = { route -> navController.navigate(route) },
                onSchemeClick = { schemeId ->
                    navController.navigate(Screen.SchemeDetails.createRoute(schemeId))
                },
                onWhyMeClick = { schemeId ->
                    navController.navigate(Screen.WhyMe.createRoute(schemeId))
                },
                onSaveToggle = { schemeId ->
                    viewModel.toggleSaveScheme(schemeId)
                }
            )
        }

        composable(
            route = Screen.SchemeDetails.route,
            arguments = listOf(navArgument("schemeId") { type = NavType.StringType })
        ) { backStackEntry ->
            val schemeId = backStackEntry.arguments?.getString("schemeId") ?: ""
            val scheme = viewModel.getSchemeById(schemeId)
            SchemeDetailsScreen(
                scheme = scheme,
                isSaved = viewModel.isSchemeSaved(schemeId),
                onSaveToggle = { viewModel.toggleSaveScheme(schemeId) },
                onWhyMeClick = {
                    navController.navigate(Screen.WhyMe.createRoute(schemeId))
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(
            route = Screen.WhyMe.route,
            arguments = listOf(navArgument("schemeId") { type = NavType.StringType })
        ) { backStackEntry ->
            val schemeId = backStackEntry.arguments?.getString("schemeId") ?: ""
            val match = viewModel.getMatchForScheme(schemeId)
            WhyMeScreen(
                matchResult = match,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Documents.route) {
            DocumentsScreen(
                checkedDocuments = uiState.checkedDocuments,
                onToggleDocument = { docId -> viewModel.toggleDocumentCheck(docId) },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Saved.route) {
            SavedSchemesScreen(
                uiState = uiState,
                onNavigate = { route -> navController.navigate(route) },
                onSchemeClick = { schemeId ->
                    navController.navigate(Screen.SchemeDetails.createRoute(schemeId))
                },
                onWhyMeClick = { schemeId ->
                    navController.navigate(Screen.WhyMe.createRoute(schemeId))
                },
                onSaveToggle = { schemeId ->
                    viewModel.toggleSaveScheme(schemeId)
                }
            )
        }

        composable(Screen.Settings.route) {
            SettingsScreen(
                onNavigate = { route -> navController.navigate(route) }
            )
        }
    }
}

