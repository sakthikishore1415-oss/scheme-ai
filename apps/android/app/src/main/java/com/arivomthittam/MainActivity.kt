package com.arivomthittam

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.navigation.compose.rememberNavController
import com.arivomthittam.ui.navigation.ArivomThittamNavGraph
import com.arivomthittam.ui.theme.PacsSahayakTheme
import com.arivomthittam.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val mainViewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PacsSahayakTheme {
                val navController = rememberNavController()
                ArivomThittamNavGraph(
                    navController = navController,
                    viewModel = mainViewModel
                )
            }
        }
    }
}

