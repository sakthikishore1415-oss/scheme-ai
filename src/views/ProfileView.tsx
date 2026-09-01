import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STATES_CONFIG } from '../data/states';
import { SUPPORTED_LANGUAGES } from '../data/languages';
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
  ShieldCheck,
} from 'lucide-react';
import { FamilyMemberProfile } from '../types';

export const ProfileView: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    currentStateConfig,
    familyMembers,
    activeFamilyMemberId,
    switchFamilyMember,
    addFamilyMember,
    userDocuments,
    toggleUserDocument,
    easyMode,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'DETAILS' | 'FAMILY' | 'DOCUMENTS'>('DETAILS');
  const [showAddFamilyModal, setShowAddFamilyModal] = useState(false);
  const [newFamilyRelation, setNewFamilyRelation] = useState('Spouse');
  const [newFamilyName, setNewFamilyName] = useState('');
  const [newFamilyAge, setNewFamilyAge] = useState(30);

  const handleCreateFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName.trim()) return;

    const newMember: FamilyMemberProfile = {
      id: `fam-${Date.now()}`,
      relation: newFamilyRelation,
      name: `${newFamilyName} (${newFamilyRelation})`,
      profile: {
        ...userProfile,
        userId: `user-${Date.now()}`,
        name: newFamilyName,
        age: newFamilyAge,
        familyRole: newFamilyRelation,
        need: newFamilyRelation === 'Mother' || newFamilyRelation === 'Father' ? 'senior_citizens' : 'general',
      },
    };

    addFamilyMember(newMember);
    setShowAddFamilyModal(false);
    setNewFamilyName('');
  };

  const documentList = [
    'Aadhaar Card',
    'Smart Family Ration Card',
    'Bank Passbook / Account Details',
    'Land Record / Patta / Chitta / RoR',
    'Income Certificate (Tahshildar / e-Seva)',
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
              Active Member: {userProfile.name} ({userProfile.familyRole || 'Self'})
            </span>
          </div>
          <h1 className={`font-black text-slate-900 mt-1 ${easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            Profile & Document Locker
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your demographic information drives accurate deterministic scheme matching without exposing private credentials.
          </p>
        </div>

        {/* Member Selector Pill */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
          {familyMembers.map((m) => (
            <button
              key={m.id}
              onClick={() => switchFamilyMember(m.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeFamilyMemberId === m.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m.relation}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-slate-100 p-1.5 rounded-2xl flex items-center gap-1 text-xs font-bold w-fit">
        <button
          onClick={() => setActiveTab('DETAILS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'DETAILS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          PROFILE DETAILS
        </button>
        <button
          onClick={() => setActiveTab('FAMILY')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'FAMILY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-emerald-600" />
          <span>FAMILY MEMBERS ({familyMembers.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('DOCUMENTS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'DOCUMENTS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-emerald-600" />
          <span>DOCUMENT LOCKER</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DETAILS */}
      {/* ========================================================================= */}
      {activeTab === 'DETAILS' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
            {/* Full Name */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={userProfile.name}
                onChange={(e) => updateUserProfile({ name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-semibold text-slate-900"
              />
            </div>

            {/* Age */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Age (Years)
              </label>
              <input
                type="number"
                value={userProfile.age}
                onChange={(e) => updateUserProfile({ age: parseInt(e.target.value) || 18 })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-semibold text-slate-900"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Gender
              </label>
              <select
                value={userProfile.gender}
                onChange={(e) => updateUserProfile({ gender: e.target.value as any })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="transgender">Transgender</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Occupation */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Primary Occupation
              </label>
              <input
                type="text"
                value={userProfile.occupation}
                onChange={(e) => updateUserProfile({ occupation: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-semibold text-slate-900"
              />
            </div>

            {/* Annual Income */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Annual Household Income (₹)
              </label>
              <input
                type="number"
                value={userProfile.annualIncome}
                onChange={(e) => updateUserProfile({ annualIncome: parseInt(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-semibold text-slate-900"
              />
            </div>

            {/* Land Holding */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Agricultural Land (Acres)
              </label>
              <input
                type="number"
                step="0.5"
                value={userProfile.landHoldingAcres || 0}
                onChange={(e) => updateUserProfile({ landHoldingAcres: parseFloat(e.target.value) || 0 })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-semibold text-slate-900"
              />
            </div>

            {/* State & District */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                District ({currentStateConfig.name})
              </label>
              <select
                value={userProfile.district || currentStateConfig.districts[0]}
                onChange={(e) => updateUserProfile({ district: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-semibold text-slate-900 bg-white"
              >
                {currentStateConfig.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Student Status */}
            <div>
              <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                Is Currently a Student?
              </label>
              <select
                value={userProfile.isStudent ? 'yes' : 'no'}
                onChange={(e) => updateUserProfile({ isStudent: e.target.value === 'yes' })}
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 outline-none font-semibold text-slate-900 bg-white"
              >
                <option value="no">No</option>
                <option value="yes">Yes (Student)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: FAMILY MEMBERS */}
      {/* ========================================================================= */}
      {activeTab === 'FAMILY' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                Family Beneficiary Tree
              </h3>
              <p className="text-xs text-slate-500">
                Discover specific entitlements for your elderly parents, college students, or spouse under one household account.
              </p>
            </div>
            <button
              onClick={() => setShowAddFamilyModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>ADD FAMILY MEMBER</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {familyMembers.map((member) => {
              const isSelected = activeFamilyMemberId === member.id;
              return (
                <div
                  key={member.id}
                  onClick={() => switchFamilyMember(member.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 shadow-md ring-1 ring-emerald-500'
                      : 'bg-white border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                        {member.relation}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Active Profile
                        </span>
                      )}
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mt-2">{member.name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Age {member.profile.age} • {member.profile.occupation}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs font-semibold text-emerald-700">
                    <span>Stated Need: {member.profile.need}</span>
                    <span>Switch →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: DOCUMENTS CHECKLIST */}
      {/* ========================================================================= */}
      {activeTab === 'DOCUMENTS' && (
        <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-4 animate-fade-in">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm">
              Citizen Digital Document Locker
            </h3>
            <p className="text-xs text-slate-500">
              Toggle the government identity certificates and documents you currently have available.
            </p>
          </div>

          <div className="space-y-2.5">
            {documentList.map((doc, idx) => {
              const hasDoc = !!userDocuments[doc];
              return (
                <div
                  key={idx}
                  onClick={() => toggleUserDocument(doc)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                    hasDoc
                      ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center ${
                        hasDoc ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {hasDoc && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs sm:text-sm">{doc}</span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                      hasDoc ? 'bg-emerald-200 text-emerald-900' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {hasDoc ? 'VERIFIED READY' : 'NOT READY'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add Family Member Modal */}
      {showAddFamilyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <form
            onSubmit={handleCreateFamilyMember}
            className="bg-white rounded-2xl max-w-md w-full p-5 border border-slate-200 shadow-2xl space-y-4"
          >
            <h3 className="font-extrabold text-slate-900 text-sm">
              Add Family Member Profile
            </h3>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Relationship</label>
              <select
                value={newFamilyRelation}
                onChange={(e) => setNewFamilyRelation(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs bg-white"
              >
                <option value="Mother">Mother</option>
                <option value="Father">Father</option>
                <option value="Spouse">Spouse</option>
                <option value="Daughter">Daughter</option>
                <option value="Son">Son</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="e.g. Lakshmi Ammal"
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-700 block mb-1">Age</label>
              <input
                type="number"
                required
                value={newFamilyAge}
                onChange={(e) => setNewFamilyAge(parseInt(e.target.value) || 18)}
                className="w-full p-2 rounded-xl border border-slate-300 text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddFamilyModal(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
              >
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
