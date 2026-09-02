import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STATES_CONFIG } from '../data/states';
import { NEED_CATEGORIES } from '../data/categories';
import {
  User,
  Users,
  FileText,
  Plus,
  Check,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  MapPin,
  Briefcase,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { FamilyMemberProfile, NeedCategory, UserProfile } from '../types';

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
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'FAMILY' | 'DOCUMENTS'>('DETAILS');
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyAge, setNewFamilyAge] = useState<number | ''>('');

  // Profile Form state
  const [formName, setFormName] = useState(userProfile?.name || '');
  const [formAge, setFormAge] = useState<number | ''>(userProfile?.age || '');
  const [formGender, setFormGender] = useState<'female' | 'male' | 'other' | 'unspecified'>(
    userProfile?.gender || 'unspecified'
  );
  const [formDistrict, setFormDistrict] = useState(userProfile?.district || currentStateConfig.districts[0] || '');
  const [formOccupation, setFormOccupation] = useState(userProfile?.occupation || '');
  const [formIncome, setFormIncome] = useState<number | ''>(
    userProfile?.annualIncome !== undefined && userProfile.annualIncome > 0 ? userProfile.annualIncome : ''
  );
  const [formEducation, setFormEducation] = useState(userProfile?.education || 'other');
  const [formNeed, setFormNeed] = useState<NeedCategory | 'general'>(userProfile?.need || 'general');
  const [formLand, setFormLand] = useState<number | ''>(userProfile?.landHoldingAcres || '');
  const [formIsStudent, setFormIsStudent] = useState(userProfile?.isStudent || false);
  const [formHasDisability, setFormHasDisability] = useState(userProfile?.hasDisability || false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      name: formName.trim(),
      age: formAge === '' ? 0 : Number(formAge),
      gender: formGender,
      state: selectedStateId,
      district: formDistrict,
      occupation: formOccupation.trim(),
      annualIncome: formIncome === '' ? 0 : Number(formIncome),
      education: formEducation as any,
      need: formNeed,
      landHoldingAcres: formLand === '' ? 0 : Number(formLand),
      isStudent: formIsStudent,
      hasDisability: formHasDisability,
      voiceLanguage: selectedVoiceLanguageId,
    });
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
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-300 flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              CITIZEN PROFILE
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {userProfile?.name ? `Active Member: ${userProfile.name} (${userProfile.familyRole || 'Self'})` : 'No Profile Loaded'}
            </span>
          </div>
          <h1 className={`font-black text-slate-900 mt-1 ${easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {userProfile ? 'Profile & Document Locker' : 'Create Citizen Profile'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your demographic information drives accurate deterministic scheme matching without exposing private credentials.
          </p>
        </div>

        {/* Member Selector Pill */}
        {familyMembers.length > 0 && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            {familyMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => switchFamilyMember(m.id)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  activeFamilyMemberId === m.id
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {m.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Profile Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('DETAILS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DETAILS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>CITIZEN DEMOGRAPHICS</span>
        </button>

        <button
          onClick={() => setActiveTab('FAMILY')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'FAMILY'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>FAMILY MEMBERS ({familyMembers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DOCUMENTS'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>DOCUMENTS CHECKLIST</span>
        </button>
      </div>

      {/* Tab 1: Citizen Demographics Form */}
      {activeTab === 'DETAILS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                {userProfile ? 'Edit Demographic Information' : 'Citizen Information Form'}
              </h3>
              <p className="text-xs text-slate-500">
                Data entered here is stored only in your active browser session for eligibility evaluation.
              </p>
            </div>
            {userProfile && (
              <button
                type="button"
                onClick={clearUserProfile}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Profile</span>
              </button>
            )}
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Arumugam K."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Age (Years)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  placeholder="e.g. 45"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Gender</label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="unspecified">Unspecified / Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other / Transgender</option>
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">District</label>
                <select
                  value={formDistrict}
                  onChange={(e) => setFormDistrict(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:border-emerald-500 focus:outline-none"
                >
                  {currentStateConfig.districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Annual Household Income (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  placeholder="e.g. 120000"
                  value={formIncome}
                  onChange={(e) => setFormIncome(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Occupation</label>
                <input
                  type="text"
                  placeholder="e.g. Farmer, Student, Street Vendor, Tailor, Unemployed"
                  value={formOccupation}
                  onChange={(e) => setFormOccupation(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Primary Benefit Sector</label>
                <select
                  value={formNeed}
                  onChange={(e) => setFormNeed(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="general">General / All Sectors</option>
                  {NEED_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.tamilLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-slate-700 font-bold block mb-1">Agricultural Landholding (Acres)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="0 (if none)"
                  value={formLand}
                  onChange={(e) => setFormLand(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-700 font-bold block mb-1">Education Level</label>
                <select
                  value={formEducation}
                  onChange={(e) => setFormEducation(e.target.value as any)}
                  className="w-full p-3 rounded-xl border border-slate-200 font-medium bg-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="none">No formal education</option>
                  <option value="10th">10th Standard / Matric</option>
                  <option value="12th">12th Standard / Higher Secondary</option>
                  <option value="graduate">Graduate / Degree / Diploma</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col justify-center space-y-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsStudent}
                    onChange={(e) => setFormIsStudent(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Enrolled Student</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formHasDisability}
                    onChange={(e) => setFormHasDisability(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded"
                  />
                  <span className="font-semibold text-slate-800">Person with Disability (PwD)</span>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>SAVE PROFILE & EVALUATE SCHEMES</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 2: Family Members */}
      {activeTab === 'FAMILY' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Family Members Portfolio</h3>
            <button
              onClick={() => setShowAddFamilyModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>ADD FAMILY MEMBER</span>
            </button>
          </div>

          {familyMembers.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 sm:p-12 border border-slate-200 text-center space-y-3 shadow-sm">
              <Users className="w-10 h-10 mx-auto text-slate-400" />
              <h3 className="font-bold text-slate-800 text-base">No family members added yet.</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Add elderly parents for senior citizen pensions, children for school scholarships, or spouses for women entitlement schemes.
              </p>
              <button
                onClick={() => setShowAddFamilyModal(true)}
                className="mt-2 px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Family Member</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {familyMembers.map((m) => (
                <div
                  key={m.id}
                  onClick={() => switchFamilyMember(m.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    activeFamilyMemberId === m.id
                      ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                      {m.relation}
                    </span>
                    <h4 className="font-extrabold text-sm text-slate-900 mt-1">{m.name}</h4>
                    <p className="text-xs text-slate-500">
                      Age: {m.profile.age || 'N/A'} • {m.profile.occupation || 'Unspecified'}
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 mt-3 block">
                    {activeFamilyMemberId === m.id ? '✓ Active Profile' : 'Click to Switch'}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Add Member Modal */}
          {showAddFamilyModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-200 shadow-2xl space-y-4">
                <h3 className="font-extrabold text-base text-slate-900">Add Family Member</h3>
                <form onSubmit={handleCreateFamilyMember} className="space-y-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Relation</label>
                    <select
                      value={newFamilyRelation}
                      onChange={(e) => setNewFamilyRelation(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium bg-white"
                    >
                      <option value="Spouse">Spouse / Wife / Husband</option>
                      <option value="Mother">Mother</option>
                      <option value="Father">Father</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Son">Son</option>
                      <option value="Other">Other Family Member</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Lakshmi"
                      value={newFamilyName}
                      onChange={(e) => setNewFamilyName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Age</label>
                    <input
                      type="number"
                      min="0"
                      max="120"
                      placeholder="e.g. 68"
                      value={newFamilyAge}
                      onChange={(e) => setNewFamilyAge(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-medium"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAddFamilyModal(false)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                    >
                      Add Member
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Documents Checklist */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900">Document Readiness Checklist</h3>
            <p className="text-xs text-slate-500">
              Check off the government identity and verification documents you currently hold in physical or DigiLocker format.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
            {documentList.map((doc) => {
              const isChecked = !!userDocuments[doc];
              return (
                <div
                  key={doc}
                  onClick={() => toggleUserDocument(doc)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isChecked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span>{doc}</span>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      isChecked ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isChecked ? 'AVAILABLE' : 'NOT SET'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
