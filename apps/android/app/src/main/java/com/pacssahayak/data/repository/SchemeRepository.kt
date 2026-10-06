package com.pacssahayak.data.repository

import com.pacssahayak.data.model.Scheme

sealed class RepositoryResult<out T> {
    data class Success<out T>(val data: T) : RepositoryResult<T>()
    data class Empty(val message: String = "No data available") : RepositoryResult<Nothing>()
    data class Error(val exception: Throwable) : RepositoryResult<Nothing>()
}

interface SchemeRepository {
    suspend fun getSchemes(): RepositoryResult<List<Scheme>>
    suspend fun getSchemeById(id: String): Scheme?
    suspend fun searchSchemes(query: String, category: String? = null, state: String? = null): List<Scheme>
}

