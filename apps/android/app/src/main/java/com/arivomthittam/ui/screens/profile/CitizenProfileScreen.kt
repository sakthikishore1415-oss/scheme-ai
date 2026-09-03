package com.arivomthittam.ui.screens.profile

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.arivomthittam.data.model.CitizenProfile
import com.arivomthittam.ui.components.ArivomTopAppBar
import com.arivomthittam.ui.navigation.Screen
import com.arivomthittam.ui.theme.OnPrimary
import com.arivomthittam.ui.theme.OnSurface
import com.arivomthittam.ui.theme.OnSurfaceVariant
import com.arivomthittam.ui.theme.OutlineVariant
import com.arivomthittam.ui.theme.PrimaryFixed
import com.arivomthittam.ui.theme.PrimaryIndigo
import com.arivomthittam.ui.theme.SecondaryContainer
import com.arivomthittam.ui.theme.Surface
import com.arivomthittam.ui.theme.SurfaceContainerLowest

enum class ProfessionType(val id: String, val title: String, val tamil: String, val emoji: String) {
    FARMER("farmer", "Farmer / Agriculture", "விவசாயி", "🌾"),
    STUDENT("student", "Student", "மாணவர்", "🎓"),
    WORKER("worker", "Worker / Labourer", "தொழிலாளி", "🧑‍🔧"),
    BUSINESS("business", "Business / Vendor", "வியாபாரம்", "🛍"),
    HOMEMAKER("homemaker", "Homemaker / Women", "குடும்பத் தலைவி", "👩"),
    SENIOR("senior", "Senior Citizen (60+)", "மூத்த குடிமக்கள்", "🧓"),
    DISABILITY("disability", "Person with Disability", "மாற்றுத்திறனாளி", "♿"),
    OTHER("other", "Other / General", "மற்றவை", "📦")
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun CitizenProfileScreen(
    currentProfile: CitizenProfile?,
    currentState: String,
    currentLanguage: String,
    onSaveProfile: (CitizenProfile) -> Unit,
    onNavigate: (String) -> Unit
) {
    // Current Step: 1 = Shared Essentials, 2 = Profession Adaptive Questions, 3 = Summary & Disclaimer
    var currentStep by remember { mutableIntStateOf(1) }

    // --- STEP 1: Shared Essentials ---
    var name by remember { mutableStateOf(currentProfile?.name ?: "") }
    var ageText by remember { mutableStateOf(if ((currentProfile?.age ?: 0) > 0) currentProfile!!.age.toString() else "35") }
    var selectedGender by remember { mutableStateOf(currentProfile?.gender ?: "all") }
    var selectedState by remember { mutableStateOf(currentProfile?.state ?: currentState) }
    var district by remember { mutableStateOf(currentProfile?.district ?: "") }
    var annualIncomeText by remember { mutableStateOf(if ((currentProfile?.annualIncome ?: 0) > 0) currentProfile!!.annualIncome.toString() else "120000") }
    var selectedNeed by remember { mutableStateOf(currentProfile?.need ?: "general") }
    var selectedProfession by remember {
        mutableStateOf(
            ProfessionType.entries.find { it.id.equals(currentProfile?.occupation, ignoreCase = true) }
                ?: ProfessionType.FARMER
        )
    }

    // --- STEP 2: Profession-Adaptive Questions ---
    // Farmer fields
    var farmerLandOwnership by remember { mutableStateOf("Own Land") }
    var farmerLandAcres by remember { mutableStateOf(currentProfile?.landHoldingAcres?.toString() ?: "2.5") }
    var farmerCropType by remember { mutableStateOf("Paddy / Rice") }
    var farmerIrrigation by remember { mutableStateOf("Borewell / Well") }
    var farmerRegistration by remember { mutableStateOf("Yes (PM-KISAN / Uzhavan)") }

    // Student fields
    var studentEducationLevel by remember { mutableStateOf("Undergraduate Degree") }
    var studentInstitutionType by remember { mutableStateOf("Government College") }
    var studentCourse by remember { mutableStateOf("Arts & Science") }
    var studentYear by remember { mutableStateOf("2nd Year") }
    var studentScholarshipStatus by remember { mutableStateOf("Never received") }

    // Worker fields
    var workerEmploymentType by remember { mutableStateOf("Daily Wage Labourer") }
    var workerSector by remember { mutableStateOf("Unorganized / Informal") }
    var workerIncomeCycle by remember { mutableStateOf("Daily Wage") }
    var workerRegistration by remember { mutableStateOf("Yes (e-Shram / Board)") }

    // Business fields
    var businessType by remember { mutableStateOf("Street Vendor / Petty Shop") }
    var businessYears by remember { mutableStateOf("1 - 3 years") }
    var businessRegistration by remember { mutableStateOf("Udyam / MSME Registered") }
    var businessTurnover by remember { mutableStateOf("Under ₹5 Lakhs") }
    var businessLoanNeeded by remember { mutableStateOf("MUDRA Micro Loan (< ₹50k)") }

    // Homemaker fields
    var homemakerMaritalStatus by remember { mutableStateOf("Married") }
    var homemakerChildren by remember { mutableStateOf("2 children") }
    var homemakerShgMember by remember { mutableStateOf("Yes (Mahalir Thittam / SHG)") }
    var homemakerInterest by remember { mutableStateOf("Tailoring / Livelihood") }

    // Senior Citizen fields
    var seniorAgeGroup by remember { mutableStateOf("60 - 69 years") }
    var seniorPensionStatus by remember { mutableStateOf("No Pension") }
    var seniorLivingArrangement by remember { mutableStateOf("Living with family") }
    var seniorSupportNeeds by remember { mutableStateOf("Free Healthcare / Medicine") }

    // Disability fields
    var disabilityType by remember { mutableStateOf("Locomotor / Physical") }
    var disabilityCertificate by remember { mutableStateOf("Have UDID Card / Medical Certificate") }
    var disabilityPercentage by remember { mutableStateOf("40% - 60%") }
    var disabilityEmployment by remember { mutableStateOf("Seeking Employment / Training") }

    // Colors for High-Contrast Form Inputs
    val fieldColors = OutlinedTextFieldDefaults.colors(
        focusedTextColor = Color(0xFF191C1E),
        unfocusedTextColor = Color(0xFF191C1E),
        focusedLabelColor = PrimaryIndigo,
        unfocusedLabelColor = Color(0xFF44464F),
        focusedPlaceholderColor = Color(0xFF757780),
        unfocusedPlaceholderColor = Color(0xFF757780),
        focusedBorderColor = PrimaryIndigo,
        unfocusedBorderColor = Color(0xFF757780),
        cursorColor = PrimaryIndigo,
        focusedContainerColor = Color.White,
        unfocusedContainerColor = Color.White
    )

    Scaffold(
        topBar = {
            ArivomTopAppBar(
                title = "Arivom Thittam",
                tamilTitle = "சுயவிவரப் பதிவு"
            )
        },
        bottomBar = {
            Surface(
                modifier = Modifier.fillMaxWidth(),
                color = Surface,
                shadowElevation = 8.dp
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 12.dp),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    if (currentStep > 1) {
                        OutlinedButton(
                            onClick = { currentStep -= 1 },
                            modifier = Modifier
                                .weight(1f)
                                .height(52.dp),
                            shape = RoundedCornerShape(26.dp),
                            border = BorderStroke(1.5.dp, PrimaryIndigo)
                        ) {
                            Text(
                                text = "← BACK",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = PrimaryIndigo
                            )
                        }
                    }

                    Button(
                        onClick = {
                            if (currentStep < 3) {
                                currentStep += 1
                            } else {
                                // Final Save
                                val parsedAge = ageText.toIntOrNull() ?: 35
                                val parsedIncome = annualIncomeText.toLongOrNull() ?: 120000L
                                val parsedLand = farmerLandAcres.toDoubleOrNull() ?: 0.0

                                val profile = CitizenProfile(
                                    id = currentProfile?.id ?: "user-${System.currentTimeMillis()}",
                                    name = name.trim().ifEmpty { "Citizen Profile" },
                                    age = parsedAge,
                                    gender = selectedGender,
                                    state = selectedState.ifEmpty { currentState },
                                    district = district.trim().ifEmpty { "General" },
                                    occupation = selectedProfession.id,
                                    annualIncome = parsedIncome,
                                    landHoldingAcres = if (selectedProfession == ProfessionType.FARMER) parsedLand else 0.0,
                                    disability = selectedProfession == ProfessionType.DISABILITY,
                                    need = selectedNeed,
                                    maritalStatus = if (selectedProfession == ProfessionType.HOMEMAKER) homemakerMaritalStatus else null,
                                    voiceLanguage = currentLanguage
                                )
                                onSaveProfile(profile)
                                onNavigate(Screen.Matches.route)
                            }
                        },
                        modifier = Modifier
                            .weight(if (currentStep > 1) 1.6f else 1f)
                            .height(52.dp),
                        shape = RoundedCornerShape(26.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryIndigo)
                    ) {
                        Text(
                            text = when (currentStep) {
                                1 -> "CONTINUE TO QUESTIONS →"
                                2 -> "REVIEW & VERIFY →"
                                else -> "FIND ELIGIBLE SCHEMES 🎯"
                            },
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = OnPrimary
                        )
                    }
                }
            }
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Surface)
                .padding(padding)
                .padding(horizontal = 16.dp, vertical = 8.dp)
        ) {
            // Step Header & Progress Bar
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = when (currentStep) {
                        1 -> "Step 1 of 3: Essential Demographics"
                        2 -> "Step 2 of 3: Profession Specifics"
                        else -> "Step 3 of 3: Verification & Privacy"
                    },
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryIndigo
                )
                Text(
                    text = "${currentStep * 33}% Completed",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    color = Color(0xFF44464F)
                )
            }

            LinearProgressIndicator(
                progress = { currentStep / 3f },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
                    .height(6.dp)
                    .clip(RoundedCornerShape(3.dp)),
                color = PrimaryIndigo,
                trackColor = PrimaryFixed
            )

            LazyColumn(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                // ==========================================
                // STEP 1: SHARED ESSENTIALS
                // ==========================================
                if (currentStep == 1) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                            border = BorderStroke(1.dp, Color(0xFFC5C6D0)),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                Text(
                                    text = "General Details / பொது விவரங்கள்",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryIndigo
                                )

                                // Name Input
                                OutlinedTextField(
                                    value = name,
                                    onValueChange = { name = it },
                                    label = { Text("Full Name (Optional / விருப்பப்பட்டால்)") },
                                    placeholder = { Text("e.g. Murugan / செல்வி") },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = fieldColors,
                                    singleLine = true
                                )

                                // Age & Gender Row
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    OutlinedTextField(
                                        value = ageText,
                                        onValueChange = { ageText = it },
                                        label = { Text("Age / வயது *") },
                                        placeholder = { Text("e.g. 42") },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        modifier = Modifier.weight(1f),
                                        colors = fieldColors,
                                        singleLine = true
                                    )

                                    OutlinedTextField(
                                        value = district,
                                        onValueChange = { district = it },
                                        label = { Text("District / மாவட்டம் *") },
                                        placeholder = { Text("e.g. Madurai / சேலம்") },
                                        modifier = Modifier.weight(1.3f),
                                        colors = fieldColors,
                                        singleLine = true
                                    )
                                }

                                // Gender Selection Chips
                                Text(
                                    text = "Gender / பாலினம்:",
                                    fontSize = 13.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF191C1E)
                                )
                                FlowRow(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    listOf(
                                        "female" to "Female / பெண்",
                                        "male" to "Male / ஆண்",
                                        "transgender" to "Transgender / திருநங்கை",
                                        "all" to "Prefer not to say"
                                    ).forEach { (id, label) ->
                                        val isSel = selectedGender == id
                                        Surface(
                                            modifier = Modifier.clickable { selectedGender = id },
                                            shape = RoundedCornerShape(20.dp),
                                            color = if (isSel) PrimaryIndigo else Color(0xFFF2F4F6),
                                            border = BorderStroke(1.dp, if (isSel) PrimaryIndigo else Color(0xFFC5C6D0))
                                        ) {
                                            Text(
                                                text = label,
                                                fontSize = 12.sp,
                                                fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                                                color = if (isSel) OnPrimary else Color(0xFF191C1E),
                                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 7.dp)
                                            )
                                        }
                                    }
                                }

                                // Annual Household Income
                                OutlinedTextField(
                                    value = annualIncomeText,
                                    onValueChange = { annualIncomeText = it },
                                    label = { Text("Annual Household Income (₹ / வருமானம்) *") },
                                    placeholder = { Text("e.g. 120000") },
                                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                    supportingText = {
                                        Text(
                                            text = "Used to evaluate BPL / EWS income criteria.",
                                            color = Color(0xFF44464F),
                                            fontSize = 11.sp
                                        )
                                    },
                                    modifier = Modifier.fillMaxWidth(),
                                    colors = fieldColors,
                                    singleLine = true
                                )
                            }
                        }
                    }

                    // Profession Selection Card
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                            border = BorderStroke(1.dp, Color(0xFFC5C6D0)),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                                Text(
                                    text = "Select Profession / தொழில் நிலை *",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PrimaryIndigo
                                )
                                Text(
                                    text = "Choose your occupation to unlock relevant scheme questions.",
                                    fontSize = 12.sp,
                                    color = Color(0xFF44464F)
                                )

                                FlowRow(
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    ProfessionType.entries.forEach { prof ->
                                        val isSelected = selectedProfession == prof
                                        Surface(
                                            modifier = Modifier.clickable { selectedProfession = prof },
                                            shape = RoundedCornerShape(12.dp),
                                            color = if (isSelected) PrimaryFixed else Color(0xFFF2F4F6),
                                            border = BorderStroke(if (isSelected) 2.dp else 1.dp, if (isSelected) PrimaryIndigo else Color(0xFFC5C6D0))
                                        ) {
                                            Row(
                                                modifier = Modifier.padding(horizontal = 12.dp, vertical = 9.dp),
                                                verticalAlignment = Alignment.CenterVertically,
                                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                                            ) {
                                                Text(text = prof.emoji, fontSize = 16.sp)
                                                Column {
                                                    Text(
                                                        text = prof.title,
                                                        fontSize = 13.sp,
                                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                                        color = if (isSelected) PrimaryIndigo else Color(0xFF191C1E)
                                                    )
                                                    Text(
                                                        text = prof.tamil,
                                                        fontSize = 10.sp,
                                                        color = if (isSelected) PrimaryIndigo else Color(0xFF757780)
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

                // ==========================================
                // STEP 2: PROFESSION-ADAPTIVE QUESTIONS
                // ==========================================
                if (currentStep == 2) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                            border = BorderStroke(1.dp, Color(0xFFC5C6D0)),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(text = selectedProfession.emoji, fontSize = 22.sp)
                                    Column {
                                        Text(
                                            text = "${selectedProfession.title} Details",
                                            fontSize = 16.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = PrimaryIndigo
                                        )
                                        Text(
                                            text = "Specific questions to identify exact welfare entitlements",
                                            fontSize = 12.sp,
                                            color = Color(0xFF44464F)
                                        )
                                    }
                                }

                                // ---------------- FARMER ----------------
                                if (selectedProfession == ProfessionType.FARMER) {
                                    AdaptiveChoiceGroup(
                                        title = "1. Land Ownership / நில உரிமை:",
                                        options = listOf("Own Land (சொந்த நிலம்)", "Tenant / Leased Land (குத்தகை நிலம்)", "Agricultural Labourer (விவசாய கூலி)"),
                                        selected = farmerLandOwnership,
                                        onSelected = { farmerLandOwnership = it }
                                    )

                                    OutlinedTextField(
                                        value = farmerLandAcres,
                                        onValueChange = { farmerLandAcres = it },
                                        label = { Text("Landholding Area (Acres / ஏக்கர்)") },
                                        placeholder = { Text("e.g. 2.5") },
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = fieldColors,
                                        singleLine = true
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "2. Primary Crop Type / பயிர் வகை:",
                                        options = listOf("Paddy / Rice (நெல்)", "Millets / Cereals (தானியங்கள்)", "Cotton / Sugarcane (கரும்பு/பருத்தி)", "Horticulture (பழங்கள்/காய்கறிகள்)", "Other / மற்றவை"),
                                        selected = farmerCropType,
                                        onSelected = { farmerCropType = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "3. Irrigation Source / பாசன வசதி:",
                                        options = listOf("Borewell / Open Well (கிணறு/போர்)", "Canal / River (ஆற்றுப்பாசனம்)", "Rainfed / Dryland (மானாவாரி)"),
                                        selected = farmerIrrigation,
                                        onSelected = { farmerIrrigation = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "4. Farmer Registration Status:",
                                        options = listOf("Yes (PM-KISAN / Uzhavan ID)", "No / Not yet registered", "Prefer not to say"),
                                        selected = farmerRegistration,
                                        onSelected = { farmerRegistration = it }
                                    )
                                }

                                // ---------------- STUDENT ----------------
                                if (selectedProfession == ProfessionType.STUDENT) {
                                    AdaptiveChoiceGroup(
                                        title = "1. Current Education Level / கல்வி நிலை:",
                                        options = listOf("School (1st - 10th)", "Higher Secondary (11th - 12th)", "Undergraduate Degree (UG)", "Postgraduate / PhD (PG)", "Vocational / ITI / Diploma"),
                                        selected = studentEducationLevel,
                                        onSelected = { studentEducationLevel = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "2. Institution Type / கல்வி நிறுவனம்:",
                                        options = listOf("Government (அரசு பள்ளி/கல்லூரி)", "Govt-Aided (அரசு உதவிபெறும்)", "Private Institution (தனியார்)"),
                                        selected = studentInstitutionType,
                                        onSelected = { studentInstitutionType = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "3. Course Stream:",
                                        options = listOf("Arts & Science", "Engineering / Technology", "Medical / Nursing", "Commerce / Vocational", "General"),
                                        selected = studentCourse,
                                        onSelected = { studentCourse = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "4. Scholarship History:",
                                        options = listOf("Never received", "Currently receiving stipend", "Applied & awaiting", "Prefer not to say"),
                                        selected = studentScholarshipStatus,
                                        onSelected = { studentScholarshipStatus = it }
                                    )
                                }

                                // ---------------- WORKER ----------------
                                if (selectedProfession == ProfessionType.WORKER) {
                                    AdaptiveChoiceGroup(
                                        title = "1. Employment Type / பணி வகை:",
                                        options = listOf("Daily Wage Construction Worker", "Factory / Industrial Worker", "Domestic / Sanitation Worker", "Artisan / Handicraft", "Gig / Transport Worker"),
                                        selected = workerEmploymentType,
                                        onSelected = { workerEmploymentType = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "2. Sector Category:",
                                        options = listOf("Unorganized / Informal Sector (அமைப்புசாரா)", "Organized / Contractual"),
                                        selected = workerSector,
                                        onSelected = { workerSector = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "3. Welfare Board Registration:",
                                        options = listOf("Yes (e-Shram / State Welfare Board)", "No / Not yet registered", "Don't know / Prefer not to say"),
                                        selected = workerRegistration,
                                        onSelected = { workerRegistration = it }
                                    )
                                }

                                // ---------------- BUSINESS ----------------
                                if (selectedProfession == ProfessionType.BUSINESS) {
                                    AdaptiveChoiceGroup(
                                        title = "1. Enterprise Type / வணிக வகை:",
                                        options = listOf("Street Vendor / Petty Shop (சாலையோர வியாபாரம்)", "Retail Shop / Store", "Micro-Manufacturing / MSME", "Service / Repair Center"),
                                        selected = businessType,
                                        onSelected = { businessType = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "2. Years in Operation:",
                                        options = listOf("Less than 1 year (New)", "1 - 3 years", "3 - 5 years", "5+ years"),
                                        selected = businessYears,
                                        onSelected = { businessYears = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "3. Business Registration:",
                                        options = listOf("Udyam / MSME Registered", "GST Registered", "Unregistered (Informal)", "Prefer not to say"),
                                        selected = businessRegistration,
                                        onSelected = { businessRegistration = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "4. Priority Financial Need:",
                                        options = listOf("MUDRA / PM SVANidhi Micro Loan", "Equipment Subsidy", "Working Capital Support", "Skill Training & Incubation"),
                                        selected = businessLoanNeeded,
                                        onSelected = { businessLoanNeeded = it }
                                    )
                                }

                                // ---------------- HOMEMAKER ----------------
                                if (selectedProfession == ProfessionType.HOMEMAKER) {
                                    AdaptiveChoiceGroup(
                                        title = "1. Marital Status / குடும்ப நிலை:",
                                        options = listOf("Married", "Single / Unmarried", "Widowed (விதவை)", "Deserted / Single Mother", "Prefer not to say"),
                                        selected = homemakerMaritalStatus,
                                        onSelected = { homemakerMaritalStatus = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "2. Dependent Children:",
                                        options = listOf("No children", "1 child", "2 children", "3 or more children"),
                                        selected = homemakerChildren,
                                        onSelected = { homemakerChildren = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "3. Self-Help Group (SHG) Membership:",
                                        options = listOf("Yes (Mahalir Thittam / SHG Member)", "No, but interested to join", "No / Not interested", "Prefer not to say"),
                                        selected = homemakerShgMember,
                                        onSelected = { homemakerShgMember = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "4. Livelihood Training Interest:",
                                        options = listOf("Tailoring / Garments", "Poultry / Dairy Farming", "Food Processing / Baking", "None / Financial Aid only"),
                                        selected = homemakerInterest,
                                        onSelected = { homemakerInterest = it }
                                    )
                                }

                                // ---------------- SENIOR ----------------
                                if (selectedProfession == ProfessionType.SENIOR) {
                                    AdaptiveChoiceGroup(
                                        title = "1. Age Category:",
                                        options = listOf("60 - 69 years", "70 - 79 years", "80+ years (Super Senior)"),
                                        selected = seniorAgeGroup,
                                        onSelected = { seniorAgeGroup = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "2. Pension Status / ஓய்வூதியம்:",
                                        options = listOf("No Pension (முதியோர் உதவித்தொகை தேவை)", "Receiving Old Age Pension (OASP)", "Receiving EPF / Govt Pension", "Prefer not to say"),
                                        selected = seniorPensionStatus,
                                        onSelected = { seniorPensionStatus = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "3. Living Arrangement:",
                                        options = listOf("Living with family / children", "Living alone / spouse only", "Assisted care / Old age home"),
                                        selected = seniorLivingArrangement,
                                        onSelected = { seniorLivingArrangement = it }
                                    )
                                }

                                // ---------------- DISABILITY ----------------
                                if (selectedProfession == ProfessionType.DISABILITY) {
                                    AdaptiveChoiceGroup(
                                        title = "1. Disability Type / வகை:",
                                        options = listOf("Locomotor / Orthopedic (உடல் ஊனம்)", "Visual Impairment (பார்வைக் குறைபாடு)", "Hearing & Speech (செவித்திறன்/பேச்சு)", "Intellectual / Autism", "Multiple Disabilities"),
                                        selected = disabilityType,
                                        onSelected = { disabilityType = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "2. Disability Certificate / UDID Card:",
                                        options = listOf("Have UDID Card / Medical Certificate", "Medical Board certified", "Not yet applied / In progress", "Prefer not to say"),
                                        selected = disabilityCertificate,
                                        onSelected = { disabilityCertificate = it }
                                    )

                                    AdaptiveChoiceGroup(
                                        title = "3. Disability Percentage:",
                                        options = listOf("40% - 60%", "60% - 80%", "Severe (80% - 100%)", "Don't know / Prefer not to say"),
                                        selected = disabilityPercentage,
                                        onSelected = { disabilityPercentage = it }
                                    )
                                }

                                // ---------------- OTHER ----------------
                                if (selectedProfession == ProfessionType.OTHER) {
                                    Text(
                                        text = "General citizen welfare rules will be evaluated based on your state, age, and household income ceiling.",
                                        fontSize = 13.sp,
                                        color = Color(0xFF191C1E)
                                    )
                                }
                            }
                        }
                    }
                }

                // ==========================================
                // STEP 3: SUMMARY & VERIFICATION
                // ==========================================
                if (currentStep == 3) {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = SurfaceContainerLowest),
                            border = BorderStroke(1.dp, Color(0xFFC5C6D0)),
                            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                        ) {
                            Column(modifier = Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = PrimaryIndigo)
                                    Text(
                                        text = "Profile Summary / சுருக்கம்",
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = PrimaryIndigo
                                    )
                                }

                                Column(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .background(Color(0xFFF8F9FB), RoundedCornerShape(12.dp))
                                        .padding(12.dp),
                                    verticalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    SummaryRow("Name", name.ifEmpty { "Citizen Profile" })
                                    SummaryRow("Age", "$ageText years")
                                    SummaryRow("Gender", selectedGender.replaceFirstChar { it.uppercase() })
                                    SummaryRow("Profession", "${selectedProfession.emoji} ${selectedProfession.title}")
                                    SummaryRow("District / State", "${district.ifEmpty { "Default" }}, $selectedState")
                                    SummaryRow("Annual Income", "₹${annualIncomeText.toLongOrNull()?.let { "%,d".format(it) } ?: annualIncomeText}")
                                }
                            }
                        }
                    }

                    // Privacy & Trust Card
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFD9E2FF).copy(alpha = 0.4f)),
                            border = BorderStroke(1.dp, Color(0xFFB0C6FF))
                        ) {
                            Row(
                                modifier = Modifier.padding(16.dp),
                                horizontalArrangement = Arrangement.spacedBy(10.dp),
                                verticalAlignment = Alignment.Top
                            ) {
                                Icon(Icons.Default.Shield, contentDescription = null, tint = PrimaryIndigo, modifier = Modifier.size(22.dp))
                                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text(
                                        text = "Deterministic Civic Privacy",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 13.sp,
                                        color = PrimaryIndigo
                                    )
                                    Text(
                                        text = "Your answers are processed securely on-device solely to check published government gazette criteria. Your personal data is never sold or shared with commercial entities.",
                                        fontSize = 11.sp,
                                        color = Color(0xFF44464F),
                                        lineHeight = 16.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AdaptiveChoiceGroup(
    title: String,
    options: List<String>,
    selected: String,
    onSelected: (String) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = title,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFF191C1E)
        )
        FlowRow(
            horizontalArrangement = Arrangement.spacedBy(6.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            options.forEach { opt ->
                val isSel = selected == opt
                Surface(
                    modifier = Modifier.clickable { onSelected(opt) },
                    shape = RoundedCornerShape(10.dp),
                    color = if (isSel) PrimaryIndigo else Color(0xFFF2F4F6),
                    border = BorderStroke(1.dp, if (isSel) PrimaryIndigo else Color(0xFFC5C6D0))
                ) {
                    Text(
                        text = opt,
                        fontSize = 11.sp,
                        fontWeight = if (isSel) FontWeight.Bold else FontWeight.Normal,
                        color = if (isSel) OnPrimary else Color(0xFF191C1E),
                        modifier = Modifier.padding(horizontal = 10.dp, vertical = 7.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun SummaryRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(text = label, fontSize = 12.sp, color = Color(0xFF757780))
        Text(text = value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color(0xFF191C1E))
    }
}
