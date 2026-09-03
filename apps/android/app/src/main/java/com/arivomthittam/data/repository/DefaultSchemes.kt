package com.arivomthittam.data.repository

import com.arivomthittam.data.model.DocumentRequirement
import com.arivomthittam.data.model.EligibilityRules
import com.arivomthittam.data.model.Scheme
import com.arivomthittam.data.model.SchemeBenefit

object DefaultSchemes {
    val ALL: List<Scheme> = listOf(
        Scheme(
            id = "pm-kisan",
            name = "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            nativeName = "பிரதமர் கிசான் சம்மான் நிதி / പി.എം. കിസാൻ സമ്മാൻ നിധി",
            authority = "Ministry of Agriculture and Farmers Welfare",
            department = "Agriculture & Farmers Welfare",
            stateId = "ALL",
            schemeType = "central",
            category = "agriculture",
            summarySimple = "Provides ₹6,000 per year in 3 equal installments directly into bank accounts of landholding farmer families.",
            benefits = SchemeBenefit(
                type = "cash_transfer",
                amount = "₹6,000 / year",
                shortSummary = "Direct cash assistance of ₹6,000 annually via Aadhaar DBT",
                detailedBenefit = "Direct income support transferred straight into the bank account of eligible small and marginal farmer families.",
                frequency = "Three equal installments of ₹2,000 every 4 months"
            ),
            eligibility = EligibilityRules(
                allowedOccupations = listOf("farmer", "agriculture"),
                maxLandHoldingAcres = 5.0,
                requiresLandOwnership = true
            ),
            documents = listOf(
                DocumentRequirement("Aadhaar Card", true, "Mandatory identity proof linked with mobile number"),
                DocumentRequirement("Land Ownership Record (Patta / Chitta)", true, "Proof of agricultural landholding"),
                DocumentRequirement("Bank Passbook", true, "Aadhaar-linked active bank account")
            ),
            applicationSteps = listOf(
                "Visit the official PM-KISAN portal (https://pmkisan.gov.in) or visit nearest CSC center.",
                "Click on 'New Farmer Registration' and enter Aadhaar Number.",
                "Submit landholding details and complete biometric e-KYC."
            ),
            applicationUrl = "https://pmkisan.gov.in",
            offlineApplicationCenter = "Village Administrative Officer (VAO) / Agriculture Department",
            officialSource = "https://pmkisan.gov.in",
            lastVerified = "2026-09-01"
        ),
        Scheme(
            id = "pm-awas-gramin",
            name = "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
            nativeName = "பிரதமர் ஊரக வீட்டுவசதி திட்டம் / പി.എം. ആവാസ് യോജന (ഗ്രാമീൺ)",
            authority = "Ministry of Rural Development",
            department = "Rural Housing",
            stateId = "ALL",
            schemeType = "central",
            category = "housing",
            summarySimple = "Financial assistance of ₹1.20 Lakh to ₹1.30 Lakh for construction of a permanent pucca house with basic amenities.",
            benefits = SchemeBenefit(
                type = "subsidy",
                amount = "₹1,20,000 to ₹1,30,000",
                shortSummary = "Direct financial aid up to ₹1.3 Lakh for building a pucca house",
                detailedBenefit = "Financial grant for building a safe, permanent house with toilet provision and unskilled labour support.",
                frequency = "Milestone-based installments"
            ),
            eligibility = EligibilityRules(
                maxAnnualIncome = 150000L
            ),
            documents = listOf(
                DocumentRequirement("Aadhaar Card", true, "Identity proof of family members"),
                DocumentRequirement("Ration Card (BPL)", true, "Proof of inclusion in rural deprivation list"),
                DocumentRequirement("Bank Passbook", true, "Bank account for DBT fund disbursement")
            ),
            applicationSteps = listOf(
                "Contact your Gram Panchayat Secretary or Village Administrative Officer.",
                "Verify household status in PMAY-G beneficiary list.",
                "Submit bank details for geo-tagging approval."
            ),
            applicationUrl = "https://pmayg.nic.in",
            offlineApplicationCenter = "Gram Panchayat Office / Block Development Office (BDO)",
            officialSource = "https://pmayg.nic.in",
            lastVerified = "2026-09-01"
        ),
        Scheme(
            id = "ayushman-bharat-pmjay",
            name = "Ayushman Bharat - PM-JAY",
            nativeName = "ஆயுஷ்மான் பாரத் மருத்துவக் காப்பீடு / ആയുഷ്മാൻ ഭാരത്",
            authority = "National Health Authority",
            department = "Health and Family Welfare",
            stateId = "ALL",
            schemeType = "central",
            category = "health",
            summarySimple = "Free health insurance coverage up to ₹5,00,000 per family per year for secondary and tertiary cashless hospitalization.",
            benefits = SchemeBenefit(
                type = "insurance",
                amount = "₹5,00,000 / family / year",
                shortSummary = "Cashless medical treatment up to ₹5 Lakh annually in empaneled hospitals",
                detailedBenefit = "Covers medical exams, surgery, and hospitalization expenses across empaneled hospitals nationwide.",
                frequency = "Annual cashless family coverage"
            ),
            eligibility = EligibilityRules(
                maxAnnualIncome = 250000L
            ),
            documents = listOf(
                DocumentRequirement("Aadhaar Card", true, "Identity proof"),
                DocumentRequirement("Ration Card", true, "Family ration card")
            ),
            applicationSteps = listOf(
                "Visit any empaneled hospital or nearest CSC centre.",
                "Meet the Ayushman Mitra at helpdesk.",
                "Provide Aadhaar and Ration card to generate Golden Card."
            ),
            applicationUrl = "https://pmjay.gov.in",
            offlineApplicationCenter = "Empaneled Hospitals / CSC Centers",
            officialSource = "https://pmjay.gov.in",
            lastVerified = "2026-09-01"
        ),
        Scheme(
            id = "tn-magalir-urimai",
            name = "Kalaignar Magalir Urimai Thittam",
            nativeName = "கலைஞர் மகளிர் உரிமைத் திட்டம்",
            authority = "Government of Tamil Nadu",
            department = "Special Programme Implementation",
            stateId = "TN",
            schemeType = "state",
            category = "women",
            summarySimple = "Monthly basic income grant of ₹1,000 transferred directly into the bank accounts of women heads of households in Tamil Nadu.",
            benefits = SchemeBenefit(
                type = "cash_transfer",
                amount = "₹1,000 / month (₹12,000 / year)",
                shortSummary = "₹1,000 monthly cash assistance directly to women family heads",
                detailedBenefit = "Empowers women family heads with independent financial dignity and direct social security.",
                frequency = "Monthly direct benefit transfer"
            ),
            eligibility = EligibilityRules(
                minAge = 21,
                genders = listOf("female"),
                maxAnnualIncome = 250000L,
                maxLandHoldingAcres = 5.0
            ),
            documents = listOf(
                DocumentRequirement("Smart Family Card (Ration Card)", true, "Tamil Nadu Smart Family Card"),
                DocumentRequirement("Aadhaar Card", true, "Identity proof of woman head"),
                DocumentRequirement("Electricity Consumer Number", true, "Electricity card indicating consumption below 3600 units/yr")
            ),
            applicationSteps = listOf(
                "Obtain application token from local ration shop.",
                "Attend designated revenue ward camp.",
                "Provide biometric authentication."
            ),
            applicationUrl = "https://kmut.tn.gov.in",
            offlineApplicationCenter = "Revenue Ward Camp / e-Sevai Center",
            officialSource = "https://kmut.tn.gov.in",
            lastVerified = "2026-09-01"
        ),
        Scheme(
            id = "kl-life-mission",
            name = "LIFE Mission Housing Scheme",
            nativeName = "ലൈഫ് മിഷൻ ഭവന നിർമ്മാണ പദ്ധതി",
            authority = "Local Self Government Department, Government of Kerala",
            department = "LSGD Kerala",
            stateId = "KL",
            schemeType = "state",
            category = "housing",
            summarySimple = "Financial assistance of ₹4,00,000 to construct safe permanent houses for homeless families across Kerala.",
            benefits = SchemeBenefit(
                type = "subsidy",
                amount = "₹4,00,000",
                shortSummary = "₹4 Lakh financial assistance for building a permanent home",
                detailedBenefit = "Financial grant to construct durable pucca homes released across 4 construction stages.",
                frequency = "4 construction milestones"
            ),
            eligibility = EligibilityRules(
                maxAnnualIncome = 100000L
            ),
            documents = listOf(
                DocumentRequirement("Ration Card (Kerala)", true, "Digital ration card"),
                DocumentRequirement("Aadhaar Card", true, "Identity proof of family head"),
                DocumentRequirement("Village Income Certificate", true, "Income certificate from Village Officer")
            ),
            applicationSteps = listOf(
                "Apply online via LIFE Mission portal or Akshaya Centre.",
                "Grama Panchayat conducts physical field inspection.",
                "Execute agreement and receive staged funding."
            ),
            applicationUrl = "https://lifemission.kerala.gov.in",
            offlineApplicationCenter = "Grama Panchayat / Municipality / Akshaya Centre",
            officialSource = "https://lifemission.kerala.gov.in",
            lastVerified = "2026-09-01"
        )
    )
}

