package com.pacssahayak.data.repository

import com.pacssahayak.data.model.Scheme

class LocalSchemeRepository(
    private var initialSchemes: List<Scheme> = DefaultSchemes.ALL
) : SchemeRepository {

    private val savedSchemeIds = mutableSetOf<String>()

    override suspend fun getSchemes(): RepositoryResult<List<Scheme>> {
        return if (initialSchemes.isEmpty()) {
            RepositoryResult.Empty("No government schemes loaded. Connect to verified government API.")
        } else {
            RepositoryResult.Success(initialSchemes)
        }
    }

    override suspend fun getSchemeById(id: String): Scheme? {
        return initialSchemes.find { it.id == id }
    }

    override suspend fun searchSchemes(query: String, category: String?, state: String?): List<Scheme> {
        return initialSchemes.filter { scheme ->
            val matchState = state == null || state == "ALL" || scheme.stateId == "ALL" || scheme.stateId.equals(state, ignoreCase = true)
            val matchCategory = category == null || category == "general" || scheme.category.equals(category, ignoreCase = true)
            val matchQuery = query.isBlank() || scheme.name.contains(query, ignoreCase = true) || scheme.department.contains(query, ignoreCase = true)
            matchState && matchCategory && matchQuery
        }
    }

    fun isSchemeSaved(id: String): Boolean = savedSchemeIds.contains(id)

    fun toggleSaveScheme(id: String): Boolean {
        return if (savedSchemeIds.contains(id)) {
            savedSchemeIds.remove(id)
            false
        } else {
            savedSchemeIds.add(id)
            true
        }
    }

    fun getSavedSchemeIds(): Set<String> = savedSchemeIds.toSet()

    fun updateSchemes(newSchemes: List<Scheme>) {
        this.initialSchemes = newSchemes
    }
}

