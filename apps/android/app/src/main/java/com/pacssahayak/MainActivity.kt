package com.pacssahayak

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.navigation.compose.rememberNavController
import com.pacssahayak.ui.navigation.PacsSahayakNavGraph
import com.pacssahayak.ui.theme.PacsSahayakTheme
import com.pacssahayak.viewmodel.MainViewModel

class MainActivity : ComponentActivity() {

    private val mainViewModel: MainViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            PacsSahayakTheme {
                val navController = rememberNavController()
                PacsSahayakNavGraph(
                    navController = navController,
                    viewModel = mainViewModel
                )
            }
        }
    }
}

