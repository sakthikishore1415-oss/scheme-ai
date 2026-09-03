import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NEED_CATEGORIES } from '../data/categories';
import {
  User,
  Users,
  FileText,
  Check,
  CheckCircle2,
  Sparkles,
  Shield,
  Trash2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { FamilyMemberProfile, NeedCategory } from '../types';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    clearUserProfile,
    currentStateConfig,
    familyMembers,
    activeFamilyMemberId,
    switchFamilyMember,
    addFamilyMember,
    userDocuments,
    toggleUserDocument,
    easyMode,
    selectedStateId,
    selectedVoiceLanguageId,
    setActiveTab: setAppActiveTab,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'FAMILY' | 'DOCUMENTS'>('DETAILS');
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyAge, setNewFamilyAge] = useState<number | ''>('');

  // --- Step 1: Essentials ---
  const [formName, setFormName] = useState(userProfile?.name || '');
  const [formAge, setFormAge] = useState<number | ''>(userProfile?.age || 35);
  const [formGender, setFormGender] = useState<'female' | 'male' | 'other' | 'unspecified'>(
    userProfile?.gender || 'unspecified'
  );
  const [formDistrict, setFormDistrict] = useState(userProfile?.district || currentStateConfig.districts[0] || '');
  const [formIncome, setFormIncome] = useState<number | ''>(
    userProfile?.annualIncome !== undefined && userProfile.annualIncome > 0 ? userProfile.annualIncome : 120000
  );
  const [formNeed, setFormNeed] = useState<NeedCategory | 'general'>(userProfile?.need || 'general');
  const [selectedProfession, setSelectedProfession] = useState<string>(
    userProfile?.occupation?.toLowerCase() || 'farmer'
  );

  // --- Step 2: Adaptive Questions ---
  // Farmer
  const [farmerLandOwnership, setFarmerLandOwnership] = useState('Own Land');
  const [farmerLandAcres, setFarmerLandAcres] = useState<number | ''>(userProfile?.landHoldingAcres || 2.5);
  const [farmerCropType, setFarmerCropType] = useState('Paddy / Rice');
  const [farmerIrrigation, setFarmerIrrigation] = useState('Borewell / Open Well');
  const [farmerRegistration, setFarmerRegistration] = useState('Yes (PM-KISAN / Uzhavan)');

  // Student
  const [studentEducationLevel, setStudentEducationLevel] = useState('Undergraduate Degree');
  const [studentInstitutionType, setStudentInstitutionType] = useState('Government College');
  const [studentCourse, setStudentCourse] = useState('Arts & Science');
  const [studentYear, setStudentYear] = useState('2nd Year');
  const [studentScholarship, setStudentScholarship] = useState('Never received');

  // Worker
  const [workerEmploymentType, setWorkerEmploymentType] = useState('Daily Wage Labourer');
  const [workerSector, setWorkerSector] = useState('Unorganized / Informal');
  const [workerIncomeCycle, setWorkerIncomeCycle] = useState('Daily Wage');
  const [workerRegistration, setWorkerRegistration] = useState('Yes (e-Shram / Welfare Board)');

  // Business
  const [businessType, setBusinessType] = useState('Street Vendor / Petty Shop');
  const [businessYears, setBusinessYears] = useState('1 - 3 years');
  const [businessRegistration, setBusinessRegistration] = useState('Udyam / MSME Registered');
  const [businessTurnover, setBusinessTurnover] = useState('Under ₹5 Lakhs');
  const [businessLoanNeed, setBusinessLoanNeed] = useState('MUDRA Micro Loan (< ₹50k)');

  // Homemaker
  const [homemakerMaritalStatus, setHomemakerMaritalStatus] = useState('Married');
  const [homemakerChildren, setHomemakerChildren] = useState('2 children');
  const [homemakerShg, setHomemakerShg] = useState('Yes (Mahalir Thittam / SHG)');
  const [homemakerTraining, setHomemakerTraining] = useState('Tailoring / Garments');

  // Senior
  const [seniorAgeGroup, setSeniorAgeGroup] = useState('60 - 69 years');
  const [seniorPension, setSeniorPension] = useState('No Pension (Need OASP)');
  const [seniorLiving, setSeniorLiving] = useState('Living with family');
  const [seniorSupport, setSeniorSupport] = useState('Free Healthcare / Medicine');

  // Disability
  const [disabilityType, setDisabilityType] = useState('Locomotor / Physical');
  const [disabilityCert, setDisabilityCert] = useState('Have UDID Card / Medical Certificate');
  const [disabilityPercent, setDisabilityPercent] = useState('40% - 60%');
  const [disabilityEmployment, setDisabilityEmployment] = useState('Seeking Employment / Training');

  const professions = [
    { id: 'farmer', label: 'Farmer / Agriculture', tamil: 'விவசாயி', emoji: '🌾' },
    { id: 'student', label: 'Student', tamil: 'மாணவர்', emoji: '🎓' },
    { id: 'worker', label: 'Worker / Labourer', tamil: 'தொழிலாளி', emoji: '🧑‍🔧' },
    { id: 'business', label: 'Business / Vendor', tamil: 'வியாபாரம்', emoji: '🛍' },
    { id: 'homemaker', label: 'Homemaker / Women', tamil: 'குடும்பத் தலைவி', emoji: '👩' },
    { id: 'senior', label: 'Senior Citizen (60+)', tamil: 'மூத்த குடிமக்கள்', emoji: '🧓' },
    { id: 'disability', label: 'Person with Disability', tamil: 'மாற்றுத்திறனாளி', emoji: '♿' },
    { id: 'other', label: 'Other / General', tamil: 'மற்றவை', emoji: '📦' },
  ];

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: formName.trim() || 'Citizen Profile',
      age: formAge === '' ? 35 : Number(formAge),
      gender: formGender,
      state: selectedStateId,
      district: formDistrict,
      occupation: selectedProfession,
      annualIncome: formIncome === '' ? 120000 : Number(formIncome),
      need: formNeed,
      landHoldingAcres: selectedProfession === 'farmer' ? (farmerLandAcres === '' ? 0 : Number(farmerLandAcres)) : 0,
      isStudent: selectedProfession === 'student',
      hasDisability: selectedProfession === 'disability',
      maritalStatus: selectedProfession === 'homemaker' ? (homemakerMaritalStatus as any) : undefined,
      voiceLanguage: selectedVoiceLanguageId,
    });
    setAppActiveTab('matches');
  };

  const handleCreateFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    const newMember: FamilyMemberProfile = {
      id: `fam-${Date.now()}`,
      relation: newFamilyRelation,
      name: `${newFamilyName} (${newFamilyRelation})`,
      profile: {
        userId: `user-${Date.now()}`,
        name: newFamilyName,
        age: newFamilyAge === '' ? 0 : Number(newFamilyAge),
        gender: 'unspecified',
        state: selectedStateId,
        district: formDistrict || currentStateConfig.districts[0] || '',
        occupation: '',
        annualIncome: 0,
        education: 'other',
        maritalStatus: 'unspecified',
        isStudent: false,
        hasDisability: false,
        landHoldingAcres: 0,
        familyRole: newFamilyRelation,
        need: newFamilyRelation === 'Mother' || newFamilyRelation === 'Father' ? 'senior_citizens' : 'general',
        voiceLanguage: selectedVoiceLanguageId,
      },
    };

    addFamilyMember(newMember);
    setShowAddFamilyModal(false);
    setNewFamilyName('');
    setNewFamilyAge('');
  };

  const documentList = [
    'Aadhaar Card',
    'Smart Family Ration Card',
    'Bank Passbook / Account Details',
    'Land Record / Patta / Chitta / RoR',
    'Income Certificate (Tahsildar / e-Seva)',
    'Community / Caste Certificate',
    'Disability Certificate (UDID Card)',
    '10th / 12th Educational Marksheet',
    'Birth Certificate / Age Proof',
    'Kisan Credit Card (KCC)',
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c5c6d0]/60 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#d9e2ff] text-[#001944] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#b0c6ff] flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-[#092554]" />
              CITIZEN PROFILE
            </span>
            <span className="text-xs text-[#757780] font-mono">
              {userProfile?.name ? `Active Member: ${userProfile.name}` : 'No Profile Loaded'}
            </span>
          </div>
          <h1 className={`font-bold text-[#092554] mt-1 ${easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {userProfile ? 'Profile & Entitlement Questionnaire' : 'Create Citizen Profile'}
          </h1>
          <p className="text-xs text-[#44464f] mt-0.5">
            Your demographic information deterministically checks official government gazette criteria.
          </p>
        </div>

        {familyMembers.length > 0 && (
          <div className="flex items-center gap-1 bg-[#f2f4f6] p-1 rounded-2xl border border-[#c5c6d0]/60 text-xs">
            {familyMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => switchFamilyMember(m.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeFamilyMemberId === m.id
                    ? 'bg-[#092554] text-white shadow-xs'
                    : 'text-[#44464f] hover:text-[#191c1e]'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-[#c5c6d0]/60 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('DETAILS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DETAILS'
              ? 'bg-[#092554] text-white shadow-xs'
              : 'bg-white text-[#44464f] hover:bg-[#f2f4f6] border border-[#c5c6d0]/60'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>CITIZEN DEMOGRAPHICS</span>
        </button>

        <button
          onClick={() => setActiveTab('FAMILY')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'FAMILY'
              ? 'bg-[#092554] text-white shadow-xs'
              : 'bg-white text-[#44464f] hover:bg-[#f2f4f6] border border-[#c5c6d0]/60'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>FAMILY MEMBERS ({familyMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DOCUMENTS'
              ? 'bg-[#092554] text-white shadow-xs'
              : 'bg-white text-[#44464f] hover:bg-[#f2f4f6] border border-[#c5c6d0]/60'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>DOCUMENTS CHECKLIST</span>
        </button>
      </div>

      {/* Tab 1: Citizen Demographics Form (3-Step Adaptive) */}
      {activeTab === 'DETAILS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c5c6d0]/60 shadow-soft space-y-6">
          {/* Step Progress Indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#092554]">
              <span>
                {currentStep === 1
                  ? 'Step 1 of 3: Shared Essentials'
                  : currentStep === 2
                  ? `Step 2 of 3: ${professions.find((p) => p.id === selectedProfession)?.label} Specifics`
                  : 'Step 3 of 3: Verification & Privacy'}
              </span>
              <span className="text-[#44464f] font-normal">{currentStep * 33}% Completed</span>
            </div>
            <div className="w-full bg-[#edeef0] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#092554] h-full transition-all duration-300 rounded-full"
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-6 text-xs text-[#191c1e]">
            {/* ==================================================== */}
            {/* STEP 1: SHARED ESSENTIALS */}
            {/* ==================================================== */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between border-b border-[#edeef0] pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-[#092554]">
                      General Demographics / பொது விவரங்கள்
                    </h3>
                    <p className="text-[11px] text-[#44464f]">
                      Essential information required to match official criteria.
                    </p>
                  </div>
                  {userProfile && (
                    <button
                      type="button"
                      onClick={clearUserProfile}
                      className="text-xs text-[#ba1a1a] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear Profile</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#092554] font-bold block mb-1">
                      Full Name (Optional / விருப்பப்பட்டால்)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Arumugam / செல்வி"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] placeholder-[#757780] font-medium bg-white focus:border-[#092554] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[#092554] font-bold block mb-1">Age (Years / வயது) *</label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      placeholder="e.g. 42"
                      value={formAge}
                      onChange={(e) => setFormAge(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] placeholder-[#757780] font-medium bg-white focus:border-[#092554] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[#092554] font-bold block mb-1">Gender / பாலினம்</label>
                    <select
                      value={formGender}
                      onChange={(e) => setFormGender(e.target.value as any)}
                      className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554] focus:outline-none"
                    >
                      <option value="unspecified">Prefer not to say</option>
                      <option value="female">Female / பெண்</option>
                      <option value="male">Male / ஆண்</option>
                      <option value="other">Transgender / திருநங்கை</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#092554] font-bold block mb-1">District / மாவட்டம் *</label>
                    <select
                      value={formDistrict}
                      onChange={(e) => setFormDistrict(e.target.value)}
                      className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554] focus:outline-none"
                    >
                      {currentStateConfig.districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[#092554] font-bold block mb-1">
                      Annual Household Income (₹ / வருமானம்) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="5000"
                      placeholder="e.g. 120000"
                      value={formIncome}
                      onChange={(e) => setFormIncome(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] placeholder-[#757780] font-medium bg-white focus:border-[#092554] focus:outline-none"
                    />
                    <span className="text-[10px] text-[#44464f] mt-0.5 block">
                      Evaluates BPL / EWS eligibility limit.
                    </span>
                  </div>
                </div>

                <div>
                  <label className="text-[#092554] font-bold block mb-1">
                    Primary Benefit Need / திட்டத் தேவை
                  </label>
                  <select
                    value={formNeed}
                    onChange={(e) => setFormNeed(e.target.value as any)}
                    className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554] focus:outline-none"
                  >
                    <option value="general">General / All Available Sectors</option>
                    {NEED_CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label} ({c.tamilLabel})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Profession Grid Selector */}
                <div>
                  <label className="text-[#092554] font-bold block mb-2">
                    Select Profession / தொழில் நிலை *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {professions.map((p) => {
                      const isSelected = selectedProfession === p.id;
                      return (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => setSelectedProfession(p.id)}
                          className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                            isSelected
                              ? 'bg-[#d9e2ff] border-[#092554] text-[#001944] font-bold'
                              : 'bg-white border-[#c5c6d0] text-[#191c1e] hover:border-[#757780]'
                          }`}
                        >
                          <span className="text-xl">{p.emoji}</span>
                          <div>
                            <span className="block text-xs font-bold leading-tight">{p.label}</span>
                            <span className="text-[10px] text-[#44464f]">{p.tamil}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 2: PROFESSION-ADAPTIVE QUESTIONS */}
            {/* ==================================================== */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#edeef0] pb-3 flex items-center gap-2.5">
                  <span className="text-2xl">
                    {professions.find((p) => p.id === selectedProfession)?.emoji}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm text-[#092554]">
                      {professions.find((p) => p.id === selectedProfession)?.label} Entitlement Questions
                    </h3>
                    <p className="text-[11px] text-[#44464f]">
                      Answer these questions to evaluate targeted government welfare rules.
                    </p>
                  </div>
                </div>

                {/* --- FARMER --- */}
                {selectedProfession === 'farmer' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Land Ownership</label>
                      <select
                        value={farmerLandOwnership}
                        onChange={(e) => setFarmerLandOwnership(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Own Land (சொந்த நிலம்)</option>
                        <option>Tenant / Leased Land (குத்தகை நிலம்)</option>
                        <option>Agricultural Labourer / Landless</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">
                        Landholding Area (Acres / ஏக்கர்)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        placeholder="e.g. 2.5"
                        value={farmerLandAcres}
                        onChange={(e) => setFarmerLandAcres(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] placeholder-[#757780] font-medium bg-white focus:border-[#092554]"
                      />
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Primary Crop Type</label>
                      <select
                        value={farmerCropType}
                        onChange={(e) => setFarmerCropType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Paddy / Rice (நெல்)</option>
                        <option>Millets / Cereals (தானியங்கள்)</option>
                        <option>Cotton / Sugarcane (பருத்தி/கரும்பு)</option>
                        <option>Horticulture / Fruits & Vegetables</option>
                        <option>Other / Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Irrigation Source</label>
                      <select
                        value={farmerIrrigation}
                        onChange={(e) => setFarmerIrrigation(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Borewell / Open Well</option>
                        <option>Canal / River</option>
                        <option>Rainfed / Dryland</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[#092554] font-bold block mb-1">
                        Farmer Registration Status
                      </label>
                      <select
                        value={farmerRegistration}
                        onChange={(e) => setFarmerRegistration(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Yes (Registered on PM-KISAN / Uzhavan Portal)</option>
                        <option>No / Not yet registered</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* --- STUDENT --- */}
                {selectedProfession === 'student' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Education Level</label>
                      <select
                        value={studentEducationLevel}
                        onChange={(e) => setStudentEducationLevel(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>School (1st - 10th)</option>
                        <option>Higher Secondary (11th - 12th)</option>
                        <option>Undergraduate Degree (UG)</option>
                        <option>Postgraduate / PhD (PG)</option>
                        <option>Vocational / ITI / Diploma</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Institution Type</label>
                      <select
                        value={studentInstitutionType}
                        onChange={(e) => setStudentInstitutionType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Government School / College</option>
                        <option>Govt-Aided Institution</option>
                        <option>Private Institution</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Course / Stream</label>
                      <select
                        value={studentCourse}
                        onChange={(e) => setStudentCourse(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Arts & Science</option>
                        <option>Engineering & Technology</option>
                        <option>Medical & Healthcare</option>
                        <option>Commerce & Management</option>
                        <option>Vocational / Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Year of Study</label>
                      <select
                        value={studentYear}
                        onChange={(e) => setStudentYear(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>1st Year / Fresh Admission</option>
                        <option>2nd Year</option>
                        <option>3rd Year</option>
                        <option>4th / Final Year</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[#092554] font-bold block mb-1">Scholarship History</label>
                      <select
                        value={studentScholarship}
                        onChange={(e) => setStudentScholarship(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Never received any scholarship</option>
                        <option>Currently receiving government stipend</option>
                        <option>Applied & awaiting result</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* --- WORKER --- */}
                {selectedProfession === 'worker' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Employment Type</label>
                      <select
                        value={workerEmploymentType}
                        onChange={(e) => setWorkerEmploymentType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Daily Wage Labourer</option>
                        <option>Construction Worker</option>
                        <option>Factory / Industrial Worker</option>
                        <option>Domestic / Sanitation Worker</option>
                        <option>Gig / Delivery / Driver</option>
                        <option>Artisan / Handloom Worker</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Sector Classification</label>
                      <select
                        value={workerSector}
                        onChange={(e) => setWorkerSector(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Unorganized / Informal Sector (அமைப்புசாரா)</option>
                        <option>Organized / Contractual Worker</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[#092554] font-bold block mb-1">
                        Welfare Board / e-Shram Registration
                      </label>
                      <select
                        value={workerRegistration}
                        onChange={(e) => setWorkerRegistration(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Yes (Registered on e-Shram / State Construction Board)</option>
                        <option>No / Not yet registered</option>
                        <option>Don't know / Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* --- BUSINESS --- */}
                {selectedProfession === 'business' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Enterprise Type</label>
                      <select
                        value={businessType}
                        onChange={(e) => setBusinessType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Street Vendor / Petty Shop</option>
                        <option>Retail Shop / Kirana Store</option>
                        <option>Micro-Manufacturing / MSME</option>
                        <option>Service / Repair Center</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Operating Experience</label>
                      <select
                        value={businessYears}
                        onChange={(e) => setBusinessYears(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Less than 1 year (New)</option>
                        <option>1 - 3 years</option>
                        <option>3 - 5 years</option>
                        <option>5+ years</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Registration Status</label>
                      <select
                        value={businessRegistration}
                        onChange={(e) => setBusinessRegistration(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Udyam / MSME Registered</option>
                        <option>GST Registered</option>
                        <option>Unregistered / Informal</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Financing Requirement</label>
                      <select
                        value={businessLoanNeed}
                        onChange={(e) => setBusinessLoanNeed(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>MUDRA / PM SVANidhi Micro Loan</option>
                        <option>Machinery / Equipment Subsidy</option>
                        <option>Working Capital Support</option>
                        <option>None / Self-funded</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* --- HOMEMAKER --- */}
                {selectedProfession === 'homemaker' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Marital Status</label>
                      <select
                        value={homemakerMaritalStatus}
                        onChange={(e) => setHomemakerMaritalStatus(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Married</option>
                        <option>Single / Unmarried</option>
                        <option>Widowed (விதவை)</option>
                        <option>Deserted / Single Mother</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Dependent Children</label>
                      <select
                        value={homemakerChildren}
                        onChange={(e) => setHomemakerChildren(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>No children</option>
                        <option>1 child</option>
                        <option>2 children</option>
                        <option>3 or more children</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[#092554] font-bold block mb-1">
                        Self-Help Group (SHG) Membership
                      </label>
                      <select
                        value={homemakerShg}
                        onChange={(e) => setHomemakerShg(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Yes (Mahalir Thittam / SHG Member)</option>
                        <option>No, but interested to join</option>
                        <option>No / Not interested</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* --- SENIOR --- */}
                {selectedProfession === 'senior' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Age Category</label>
                      <select
                        value={seniorAgeGroup}
                        onChange={(e) => setSeniorAgeGroup(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>60 - 69 years</option>
                        <option>70 - 79 years</option>
                        <option>80+ years (Super Senior)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Pension Status</label>
                      <select
                        value={seniorPension}
                        onChange={(e) => setSeniorPension(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>No Pension (Need Old Age Pension OASP)</option>
                        <option>Receiving Old Age Pension (OASP)</option>
                        <option>Receiving Govt / EPF Pension</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[#092554] font-bold block mb-1">Living Arrangement</label>
                      <select
                        value={seniorLiving}
                        onChange={(e) => setSeniorLiving(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Living with family / children</option>
                        <option>Living alone / with spouse only</option>
                        <option>Old age home / Assisted living</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* --- DISABILITY --- */}
                {selectedProfession === 'disability' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#092554] font-bold block mb-1">Disability Category</label>
                      <select
                        value={disabilityType}
                        onChange={(e) => setDisabilityType(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Locomotor / Physical (உடல் ஊனம்)</option>
                        <option>Visual Impairment (பார்வைக் குறைபாடு)</option>
                        <option>Hearing & Speech (செவித்திறன்/பேச்சு)</option>
                        <option>Intellectual / Autism</option>
                        <option>Multiple Disabilities</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[#092554] font-bold block mb-1">UDID / Disability Card</label>
                      <select
                        value={disabilityCert}
                        onChange={(e) => setDisabilityCert(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>Have UDID Card / Medical Certificate</option>
                        <option>Medical Board Certified</option>
                        <option>Not yet applied / In progress</option>
                        <option>Prefer not to say</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="text-[#092554] font-bold block mb-1">Disability Percentage</label>
                      <select
                        value={disabilityPercent}
                        onChange={(e) => setDisabilityPercent(e.target.value)}
                        className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                      >
                        <option>40% - 60%</option>
                        <option>60% - 80%</option>
                        <option>Severe (80% - 100%)</option>
                        <option>Don't know / Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* --- OTHER --- */}
                {selectedProfession === 'other' && (
                  <div className="p-4 rounded-2xl bg-[#f8f9fb] border border-[#c5c6d0]/60 text-xs text-[#191c1e]">
                    General citizen schemes will be evaluated based on your state, age, and household income ceiling.
                  </div>
                )}
              </div>
            )}

            {/* ==================================================== */}
            {/* STEP 3: REVIEW & PRIVACY VERIFICATION */}
            {/* ==================================================== */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="border-b border-[#edeef0] pb-3">
                  <h3 className="font-bold text-sm text-[#092554] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#fea619]" />
                    Review Profile Summary / சுருக்கம்
                  </h3>
                  <p className="text-[11px] text-[#44464f]">
                    Verify your entered details before calculating entitled government schemes.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#f8f9fb] border border-[#c5c6d0]/60 space-y-2.5">
                  <div className="flex justify-between border-b border-[#edeef0] pb-1.5">
                    <span className="text-[#757780]">Name:</span>
                    <strong className="text-[#092554]">{formName || 'Citizen Profile'}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#edeef0] pb-1.5">
                    <span className="text-[#757780]">Age & Gender:</span>
                    <strong className="text-[#191c1e]">
                      {formAge} years • {formGender.toUpperCase()}
                    </strong>
                  </div>
                  <div className="flex justify-between border-b border-[#edeef0] pb-1.5">
                    <span className="text-[#757780]">District / State:</span>
                    <strong className="text-[#191c1e]">{formDistrict}, {selectedStateId}</strong>
                  </div>
                  <div className="flex justify-between border-b border-[#edeef0] pb-1.5">
                    <span className="text-[#757780]">Profession:</span>
                    <strong className="text-[#092554]">
                      {professions.find((p) => p.id === selectedProfession)?.emoji}{' '}
                      {professions.find((p) => p.id === selectedProfession)?.label}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#757780]">Annual Household Income:</span>
                    <strong className="text-[#00462d]">₹{Number(formIncome).toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Civic Trust Privacy Badge */}
                <div className="p-4 rounded-2xl bg-[#d9e2ff]/40 border border-[#b0c6ff] flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#092554] shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-[#092554] block">
                      Deterministic Civic Privacy Assurance
                    </span>
                    <p className="text-[11px] text-[#44464f] leading-relaxed">
                      Your answers are processed securely in your active session solely to check published government gazette guidelines. Your personal data is never sold or shared with third parties.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Wizard Navigation Buttons */}
            <div className="flex items-center justify-between gap-3 pt-4 border-t border-[#edeef0]">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="px-5 py-2.5 rounded-xl border border-[#c5c6d0] hover:bg-[#f2f4f6] text-[#092554] font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>BACK</span>
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="px-6 py-2.5 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>
                    {currentStep === 1 ? 'CONTINUE TO QUESTIONS' : 'REVIEW SUMMARY'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#fea619]" />
                  <span>SAVE PROFILE & FIND SCHEMES</span>
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Family Members */}
      {activeTab === 'FAMILY' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c5c6d0]/60 shadow-soft space-y-6">
          <div className="flex items-center justify-between border-b border-[#edeef0] pb-4">
            <div>
              <h3 className="font-bold text-base text-[#092554]">Family Member Profiles</h3>
              <p className="text-xs text-[#44464f]">
                Add family members to discover welfare schemes for parents, spouses, or children.
              </p>
            </div>
            <button
              onClick={() => setShowAddFamilyModal(true)}
              className="px-4 py-2 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ ADD MEMBER</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {familyMembers.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-2xl bg-[#f8f9fb] border border-[#c5c6d0]/60 flex items-center justify-between"
              >
                <div className="space-y-0.5">
                  <h4 className="font-bold text-sm text-[#092554]">{m.name}</h4>
                  <p className="text-xs text-[#757780]">
                    Relation: {m.relation} • Age: {m.profile.age} years
                  </p>
                </div>
                <button
                  onClick={() => switchFamilyMember(m.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeFamilyMemberId === m.id
                      ? 'bg-[#00462d] text-white'
                      : 'bg-white text-[#092554] border border-[#c5c6d0]'
                  }`}
                >
                  {activeFamilyMemberId === m.id ? 'ACTIVE' : 'SWITCH'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Documents Checklist */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c5c6d0]/60 shadow-soft space-y-6">
          <div className="border-b border-[#edeef0] pb-4">
            <h3 className="font-bold text-base text-[#092554]">Civic Document Readiness Locker</h3>
            <p className="text-xs text-[#44464f]">
              Check off your ready documents to evaluate immediate application readiness.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {documentList.map((docName) => {
              const hasDoc = !!userDocuments[docName];
              return (
                <button
                  key={docName}
                  type="button"
                  onClick={() => toggleUserDocument(docName)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between text-left transition-all cursor-pointer ${
                    hasDoc
                      ? 'bg-[#94f6c4]/20 border-[#57b98c] text-[#002d1c] font-bold'
                      : 'bg-white border-[#c5c6d0]/60 text-[#191c1e] hover:border-[#757780]'
                  }`}
                >
                  <span className="text-xs">{docName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      hasDoc ? 'bg-[#94f6c4] text-[#002113]' : 'bg-[#edeef0] text-[#757780]'
                    }`}
                  >
                    {hasDoc ? 'READY' : 'PENDING'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Family Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#c5c6d0]/60 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-[#092554]">Add Family Member</h3>
            <form onSubmit={handleCreateFamilyMember} className="space-y-4 text-xs">
              <div>
                <label className="text-[#092554] font-bold block mb-1">Relationship</label>
                <select
                  value={newFamilyRelation}
                  onChange={(e) => setNewFamilyRelation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] font-medium bg-white focus:border-[#092554]"
                >
                  <option>Spouse</option>
                  <option>Father</option>
                  <option>Mother</option>
                  <option>Child (Son/Daughter)</option>
                  <option>Sibling</option>
                  <option>Grandparent</option>
                </select>
              </div>

              <div>
                <label className="text-[#092554] font-bold block mb-1">Member Name</label>
                <input
                  type="text"
                  placeholder="e.g. Meenakshi"
                  value={newFamilyName}
                  onChange={(e) => setNewFamilyName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] placeholder-[#757780] font-medium bg-white focus:border-[#092554]"
                  required
                />
              </div>

              <div>
                <label className="text-[#092554] font-bold block mb-1">Age</label>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  value={newFamilyAge}
                  onChange={(e) => setNewFamilyAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-[#c5c6d0] text-[#191c1e] placeholder-[#757780] font-medium bg-white focus:border-[#092554]"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddFamilyModal(false)}
                  className="px-4 py-2 rounded-xl text-[#44464f] hover:bg-[#edeef0] font-bold cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold cursor-pointer"
                >
                  ADD MEMBER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
