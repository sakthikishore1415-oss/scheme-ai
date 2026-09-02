package com.arivomthittam.data.model

data class CitizenProfile(
    val id: String? = null,
    val name: String? = null,
    val age: Int = 0,
    val gender: String = "all", // "male", "female", "transgender", "all"
    val state: String = "TN",
    val district: String = "",
    val occupation: String = "",
    val annualIncome: Long = 0L,
    val landHoldingAcres: Double? = 0.0,
    val disability: Boolean = false,
    val community: String? = null, // "SC", "ST", "OBC", "MBC", "GENERAL"
    val maritalStatus: String? = null, // "single", "married", "widowed", "deserted"
    val need: String = "general",
    val voiceLanguage: String = "ta"
)

data class FamilyMember(
    val id: String,
    val name: String,
    val relationship: String,
    val age: Int,
    val occupation: String,
    val gender: String,
    val annualIncome: Long? = null
)

