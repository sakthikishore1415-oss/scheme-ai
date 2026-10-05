import Foundation

public struct DefaultSchemes {
    public static let all: [Scheme] = [
        Scheme(
            id: "pm-kisan",
            name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
            nativeName: "பிரதமர் கிசான் சம்மான் நிதி",
            authority: "Ministry of Agriculture and Farmers Welfare",
            department: "Agriculture & Farmers Welfare",
            stateId: "ALL",
            schemeType: "central",
            category: "agriculture",
            summarySimple: "Provides ₹6,000 per year in 3 equal installments directly into bank accounts of landholding farmer families.",
            benefits: SchemeBenefit(
                type: "cash_transfer",
                amount: "₹6,000 / year",
                shortSummary: "Direct cash assistance of ₹6,000 annually via Aadhaar DBT",
                detailedBenefit: "Direct income support transferred straight into the bank account of eligible small and marginal farmer families.",
                frequency: "Three equal installments of ₹2,000 every 4 months"
            ),
            eligibility: EligibilityRules(
                allowedOccupations: ["farmer", "agriculture"],
                maxLandHoldingAcres: 5.0,
                requiresLandOwnership: true
            ),
            documents: [
                DocumentRequirement(name: "Aadhaar Card", mandatory: true, description: "Mandatory identity proof linked with mobile number"),
                DocumentRequirement(name: "Land Ownership Record (Patta / Chitta)", mandatory: true, description: "Proof of agricultural landholding"),
                DocumentRequirement(name: "Bank Passbook", mandatory: true, description: "Aadhaar-linked active bank account")
            ],
            applicationSteps: [
                "Visit the official PM-KISAN portal (https://pmkisan.gov.in) or visit nearest CSC center.",
                "Click on 'New Farmer Registration' and enter Aadhaar Number.",
                "Submit landholding details and complete biometric e-KYC."
            ],
            offlineApplicationCenter: "Village Administrative Officer (VAO) / Agriculture Department",
            applicationUrl: "https://pmkisan.gov.in",
            officialSource: "https://pmkisan.gov.in",
            lastVerified: "2026-09-01"
        ),
        Scheme(
            id: "pm-awas-gramin",
            name: "Pradhan Mantri Awas Yojana - Gramin (PMAY-G)",
            nativeName: "பிரதமர் ஊரக வீட்டுவசதி திட்டம்",
            authority: "Ministry of Rural Development",
            department: "Rural Housing",
            stateId: "ALL",
            schemeType: "central",
            category: "housing",
            summarySimple: "Financial assistance of ₹1.20 Lakh to ₹1.30 Lakh for construction of a permanent pucca house with basic amenities.",
            benefits: SchemeBenefit(
                type: "subsidy",
                amount: "₹1,20,000 to ₹1,30,000",
                shortSummary: "Direct financial aid up to ₹1.3 Lakh for building a pucca house",
                detailedBenefit: "Financial grant for building a safe, permanent house with toilet provision and unskilled labour support.",
                frequency: "Milestone-based installments"
            ),
            eligibility: EligibilityRules(
                maxAnnualIncome: 150000
            ),
            documents: [
                DocumentRequirement(name: "Aadhaar Card", mandatory: true, description: "Identity proof of family members"),
                DocumentRequirement(name: "Ration Card (BPL)", mandatory: true, description: "Proof of inclusion in rural deprivation list"),
                DocumentRequirement(name: "Bank Passbook", mandatory: true, description: "Bank account for DBT fund disbursement")
            ],
            applicationSteps: [
                "Contact your Gram Panchayat Secretary or Village Administrative Officer.",
                "Verify household status in PMAY-G beneficiary list.",
                "Submit bank details for geo-tagging approval."
            ],
            offlineApplicationCenter: "Gram Panchayat Office / Block Development Office (BDO)",
            applicationUrl: "https://pmayg.nic.in",
            officialSource: "https://pmayg.nic.in",
            lastVerified: "2026-09-01"
        ),
        Scheme(
            id: "ayushman-bharat-pmjay",
            name: "Ayushman Bharat - PM-JAY",
            nativeName: "ஆயுஷ்மான் பாரத் மருத்துவக் காப்பீடு",
            authority: "National Health Authority",
            department: "Health and Family Welfare",
            stateId: "ALL",
            schemeType: "central",
            category: "health",
            summarySimple: "Free health insurance coverage up to ₹5,00,000 per family per year for secondary and tertiary cashless hospitalization.",
            benefits: SchemeBenefit(
                type: "insurance",
                amount: "₹5,00,000 / family / year",
                shortSummary: "Cashless medical treatment up to ₹5 Lakh annually in empaneled hospitals",
                detailedBenefit: "Covers medical exams, surgery, and hospitalization expenses across empaneled hospitals nationwide.",
                frequency: "Annual cashless family coverage"
            ),
            eligibility: EligibilityRules(
                maxAnnualIncome: 250000
            ),
            documents: [
                DocumentRequirement(name: "Aadhaar Card", mandatory: true, description: "Identity proof"),
                DocumentRequirement(name: "Ration Card", mandatory: true, description: "Family ration card")
            ],
            applicationSteps: [
                "Visit any empaneled hospital or nearest CSC centre.",
                "Meet the Ayushman Mitra at helpdesk.",
                "Provide Aadhaar and Ration card to generate Golden Card."
            ],
            offlineApplicationCenter: "Empaneled Hospitals / CSC Centers",
            applicationUrl: "https://pmjay.gov.in",
            officialSource: "https://pmjay.gov.in",
            lastVerified: "2026-09-01"
        ),
        Scheme(
            id: "tn-magalir-urimai",
            name: "Kalaignar Magalir Urimai Thittam",
            nativeName: "கலைஞர் மகளிர் உரிமைத் திட்டம்",
            authority: "Government of Tamil Nadu",
            department: "Special Programme Implementation",
            stateId: "TN",
            schemeType: "state",
            category: "women",
            summarySimple: "Monthly basic income grant of ₹1,000 transferred directly into the bank accounts of women heads of households in Tamil Nadu.",
            benefits: SchemeBenefit(
                type: "cash_transfer",
                amount: "₹1,000 / month (₹12,000 / year)",
                shortSummary: "₹1,000 monthly cash assistance directly to women family heads",
                detailedBenefit: "Empowers women family heads with independent financial dignity and direct social security.",
                frequency: "Monthly direct benefit transfer"
            ),
            eligibility: EligibilityRules(
                minAge: 21,
                genders: ["female"],
                maxAnnualIncome: 250000,
                maxLandHoldingAcres: 5.0
            ),
            documents: [
                DocumentRequirement(name: "Smart Family Card (Ration Card)", mandatory: true, description: "Tamil Nadu Smart Family Card"),
                DocumentRequirement(name: "Aadhaar Card", mandatory: true, description: "Identity proof of woman head"),
                DocumentRequirement(name: "Electricity Consumer Number", mandatory: true, description: "Electricity card indicating consumption below 3600 units/yr")
            ],
            applicationSteps: [
                "Obtain application token from local ration shop.",
                "Attend designated revenue ward camp.",
                "Provide biometric authentication."
            ],
            offlineApplicationCenter: "Revenue Ward Camp / e-Sevai Center",
            applicationUrl: "https://kmut.tn.gov.in",
            officialSource: "https://kmut.tn.gov.in",
            lastVerified: "2026-09-01"
        ),
        Scheme(
            id: "tn-pudhumai-penn",
            name: "Moovalur Ramamirtham Ammaiyar Pudhumai Penn Thittam",
            nativeName: "புதுமைப் பெண் திட்டம்",
            authority: "Social Welfare and Women Empowerment Department, TN",
            department: "Higher Education & Social Welfare",
            stateId: "TN",
            schemeType: "state",
            category: "education",
            summarySimple: "Monthly scholarship grant of ₹1,000 to girl students who studied classes 6 to 12 in Tamil Nadu government schools until they complete their undergraduate degree.",
            benefits: SchemeBenefit(
                type: "scholarship",
                amount: "₹1,000 / month",
                shortSummary: "₹1,000 monthly financial grant throughout higher education",
                detailedBenefit: "Direct stipend into girl student bank accounts to cover college tuition, books, and educational living expenses.",
                frequency: "Monthly till degree graduation"
            ),
            eligibility: EligibilityRules(
                minAge: 17,
                maxAge: 25,
                genders: ["female"],
                allowedOccupations: ["student"]
            ),
            documents: [
                DocumentRequirement(name: "10th and 12th School TC / Marksheets", mandatory: true, description: "Proof of study in TN Government schools from standard 6 to 12"),
                DocumentRequirement(name: "College Admission Card / Bonafide", mandatory: true, description: "Valid proof of enrollment in recognized higher education institution"),
                DocumentRequirement(name: "Aadhaar Card", mandatory: true, description: "Student's Aadhaar identification"),
                DocumentRequirement(name: "Bank Passbook", mandatory: true, description: "Student's individual bank savings account")
            ],
            applicationSteps: [
                "Submit verification documents to college nodal officer.",
                "College verifies EMIS school records online via penkalvi.tn.gov.in.",
                "Funds disbursed monthly directly into candidate's bank account."
            ],
            offlineApplicationCenter: "College Administration / Nodal Officer Desk",
            applicationUrl: "https://www.penkalvi.tn.gov.in",
            officialSource: "https://www.penkalvi.tn.gov.in",
            lastVerified: "2026-09-01"
        ),
        Scheme(
            id: "tn-cmchis",
            name: "Chief Minister Comprehensive Health Insurance Scheme (CMCHIS)",
            nativeName: "முதலமைச்சரின் விரிவான மருத்துவக் காப்பீட்டுத் திட்டம்",
            authority: "Government of Tamil Nadu",
            department: "Health and Family Welfare",
            stateId: "TN",
            schemeType: "state",
            category: "health",
            summarySimple: "Cashless medical and surgical treatment up to ₹5,00,000 per family per year across empaneled public and private hospitals in Tamil Nadu.",
            benefits: SchemeBenefit(
                type: "insurance",
                amount: "₹5,00,000 / year",
                shortSummary: "Cashless tertiary care coverage up to ₹5 Lakh/family annually",
                detailedBenefit: "Extensive coverage of 1,000+ medical procedures, surgeries, diagnostic tests, and emergency intensive care.",
                frequency: "Annual renewable family floater"
            ),
            eligibility: EligibilityRules(
                maxAnnualIncome: 120000
            ),
            documents: [
                DocumentRequirement(name: "Smart Family Ration Card", mandatory: true, description: "Valid TN Smart Card"),
                DocumentRequirement(name: "Income Certificate", mandatory: true, description: "Certificate from Revenue Inspector/VAO indicating income below ₹1,20,000"),
                DocumentRequirement(name: "Aadhaar Card", mandatory: true, description: "Family members' Aadhaar cards")
            ],
            applicationSteps: [
                "Visit District Collectorate CMCHIS Kiosk or e-Sevai centre.",
                "Submit family smart card and income certificate.",
                "Biometrics captured and smart insurance card issued on the spot."
            ],
            offlineApplicationCenter: "District Collectorate Helpdesk / Empaneled Government Hospitals",
            applicationUrl: "https://cmchistn.com",
            officialSource: "https://cmchistn.com",
            lastVerified: "2026-09-01"
        )
    ]
}
