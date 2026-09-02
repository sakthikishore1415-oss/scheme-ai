package com.arivomthittam.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.arivomthittam.data.model.CitizenProfile
import com.arivomthittam.data.model.EligibilityResult
import com.arivomthittam.data.model.Scheme
import com.arivomthittam.data.repository.LocalSchemeRepository
import com.arivomthittam.data.repository.RepositoryResult
import com.arivomthittam.domain.eligibility.DeterministicEligibilityEngine
import com.arivomthittam.domain.language.LanguageDetectionHelper
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class UiState(
    val userProfile: CitizenProfile? = null,
    val selectedLanguage: String = LanguageDetectionHelper.detectDeviceLanguage(),
    val selectedState: String = "TN",
    val schemes: List<Scheme> = emptyList(),
    val matches: List<EligibilityResult> = emptyList(),
    val savedSchemeIds: Set<String> = emptySet(),
    val checkedDocuments: Set<String> = emptySet(),
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class MainViewModel(
    private val repository: LocalSchemeRepository = LocalSchemeRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(UiState())
    val uiState: StateFlow<UiState> = _uiState.asStateFlow()

    init {
        loadSchemes()
    }

    fun setLanguage(lang: String) {
        _uiState.update { it.copy(selectedLanguage = lang) }
    }

    fun setState(state: String) {
        _uiState.update { it.copy(selectedState = state) }
    }

    fun updateProfile(newProfile: CitizenProfile) {
        viewModelScope.launch {
            val currentState = _uiState.value
            val updated = newProfile.copy(
                state = currentState.selectedState,
                voiceLanguage = currentState.selectedLanguage
            )
            val evaluatedMatches = withContext(Dispatchers.Default) {
                DeterministicEligibilityEngine.evaluateAll(updated, currentState.schemes)
            }
            _uiState.update { state ->
                state.copy(
                    userProfile = updated,
                    matches = evaluatedMatches
                )
            }
        }
    }

    fun toggleSaveScheme(schemeId: String) {
        val isSaved = repository.toggleSaveScheme(schemeId)
        _uiState.update { state ->
            val updatedSet = if (isSaved) {
                state.savedSchemeIds + schemeId
            } else {
                state.savedSchemeIds - schemeId
            }
            state.copy(savedSchemeIds = updatedSet)
        }
    }

    fun isSchemeSaved(schemeId: String): Boolean {
        return _uiState.value.savedSchemeIds.contains(schemeId)
    }

    fun toggleDocumentCheck(documentName: String) {
        _uiState.update { state ->
            val updated = if (state.checkedDocuments.contains(documentName)) {
                state.checkedDocuments - documentName
            } else {
                state.checkedDocuments + documentName
            }
            state.copy(checkedDocuments = updated)
        }
    }

    fun loadSchemes() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, errorMessage = null) }
            when (val result = repository.getSchemes()) {
                is RepositoryResult.Success -> {
                    val evaluatedMatches = withContext(Dispatchers.Default) {
                        DeterministicEligibilityEngine.evaluateAll(_uiState.value.userProfile, result.data)
                    }
                    _uiState.update {
                        it.copy(
                            schemes = result.data,
                            matches = evaluatedMatches,
                            isLoading = false
                        )
                    }
                }
                is RepositoryResult.Empty -> {
                    _uiState.update {
                        it.copy(
                            schemes = emptyList(),
                            matches = emptyList(),
                            isLoading = false
                        )
                    }
                }
                is RepositoryResult.Error -> {
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            errorMessage = result.exception.localizedMessage ?: "Failed to load schemes"
                        )
                    }
                }
            }
        }
    }

    fun getSchemeById(id: String): Scheme? {
        return _uiState.value.schemes.find { it.id == id }
    }

    fun getMatchForScheme(schemeId: String): EligibilityResult? {
        return _uiState.value.matches.find { it.scheme.id == schemeId }
    }
}
