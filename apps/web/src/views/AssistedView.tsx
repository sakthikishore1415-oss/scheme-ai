import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { matchUserSchemes } from '../engine/eligibilityEngine';
import { UserProfile, MatchResult, NeedCategory } from '../types';
import { NEED_CATEGORIES } from '../data/categories';
import {
  Handshake,
  UserPlus,
  Printer,
  Sparkles,
  FileCheck2,
  Users,
} from 'lucide-react';

interface CitizenRecord {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  occupation: string;
  income: number;
  need: NeedCategory;
  state: string;
  matchesCount: number;
  topSchemeName: string;
  createdAt: string;
}

export const AssistedView: React.FC = () => {
  const { currentStateConfig, setSelectedSchemeDetail, logCitizenCallStep, schemes } = useApp();

  const [records, setRecords] = useState<CitizenRecord[]>([]);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAge, setFormAge] = useState<number | ''>('');
  const [formGender, setFormGender] = useState<'male' | 'female' | 'other'>('male');
  const [formOccupation, setFormOccupation] = useState('');
  const [formIncome, setFormIncome] = useState<number | ''>('');
  const [formNeed, setFormNeed] = useState<NeedCategory>('agriculture');

  const [evaluatedResult, setEvaluatedResult] = useState<MatchResult[] | null>(null);

  const handleEvaluateAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const tempProfile: UserProfile = {
      userId: `cit-${Date.now()}`,
      name: formName.trim(),
      age: formAge === '' ? 0 : Number(formAge),
      gender: formGender,
      state: currentStateConfig.id,
      district: currentStateConfig.districts[0] || '',
      occupation: formOccupation.trim(),
      annualIncome: formIncome === '' ? 0 : Number(formIncome),
      education: '10th',
      maritalStatus: 'unspecified',
      isStudent: false,
      hasDisability: false,
      landHoldingAcres: 0,
      need: formNeed,
      voiceLanguage: currentStateConfig.defaultVoiceLanguage,
      familyRole: 'Self',
    };

    const matches = matchUserSchemes(tempProfile, schemes);
    setEvaluatedResult(matches);

    const newRecord: CitizenRecord = {
      id: `cit-${Date.now().toString().slice(-4)}`,
      name: formName.trim(),
      phone: formPhone.trim() || 'N/A',
      age: formAge === '' ? 0 : Number(formAge),
      gender: formGender,
      occupation: formOccupation.trim() || 'Unspecified',
      income: formIncome === '' ? 0 : Number(formIncome),
      need: formNeed,
      state: currentStateConfig.id,
      matchesCount: matches.filter((m) => m.matchLevel !== 'MORE_INFO').length,
      topSchemeName: matches[0]?.scheme.name || 'None',
      createdAt: 'Just now',
    };

    setRecords((prev) => [newRecord, ...prev]);

    logCitizenCallStep({
      citizenName: formName.trim(),
      device: 'Assisted CSC Desk',
      need: formNeed,
      profile: {
        age: formAge === '' ? 0 : Number(formAge),
        occupation: formOccupation.trim(),
        annualIncome: formIncome === '' ? 0 : Number(formIncome),
      },
      status: 'Assisted Intake Recorded',
      ivrSteps: ['Citizen attended at e-Seva desk', 'Scheme evaluation generated'],
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-[#4a1f2d] text-white rounded-3xl p-6 sm:p-8 border border-[#6b3548] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#6b3548] text-[#ffd9e1] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#e8e1dc]/30 flex items-center gap-1">
              <Handshake className="w-3.5 h-3.5 text-[#c8a96b]" />
              ASSISTED ACCESS DESK (CSC & E-SEVA OPERATORS)
            </span>
            <span className="text-xs text-[#c8a96b] font-mono font-bold">
              State: {currentStateConfig.name}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-2">
            Village Volunteer & Citizen Intake Terminal
          </h1>
          <p className="text-xs sm:text-sm text-[#ffd9e1] mt-1">
            Empowering Village Level Entrepreneurs (VLEs), Anganwadi workers, and CSC operators to onboard rural citizens.
          </p>
        </div>
      </div>

      {/* Citizen Registration Form & Live Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Card */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e1dc] shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#eedfe4] text-[#4a1f2d] flex items-center justify-center font-bold">
              <UserPlus className="w-4 h-4 text-[#4a1f2d]" />
            </div>
            <h3 className="font-bold text-[#21191d] text-sm">
              Citizen Intake & Assessment Form
            </h3>
          </div>

          <form onSubmit={handleEvaluateAndRegister} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#514346] block mb-1">
                  Citizen Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Arumugam K."
                  className="w-full p-2.5 rounded-xl border border-[#e8e1dc] bg-[#faf8f3] font-medium text-[#21191d] focus:border-[#4a1f2d] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#514346] block mb-1">
                  Citizen Mobile Number
                </label>
                <input
                  type="text"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="98421-XXXXX"
                  className="w-full p-2.5 rounded-xl border border-[#e8e1dc] bg-[#faf8f3] font-medium text-[#21191d] focus:border-[#4a1f2d] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#514346] block mb-1">Age</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="120"
                  value={formAge}
                  onChange={(e) => setFormAge(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#e8e1dc] bg-[#faf8f3] font-medium text-[#21191d] focus:border-[#4a1f2d] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#514346] block mb-1">Gender</label>
                <select
                  value={formGender}
                  onChange={(e) => setFormGender(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#e8e1dc] bg-[#faf8f3] font-medium text-[#21191d] focus:border-[#4a1f2d] outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#514346] block mb-1">Annual Income (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  placeholder="e.g. 100000"
                  value={formIncome}
                  onChange={(e) => setFormIncome(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-[#e8e1dc] bg-[#faf8f3] font-medium text-[#21191d] focus:border-[#4a1f2d] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-[#514346] block mb-1">Occupation</label>
                <input
                  type="text"
                  value={formOccupation}
                  onChange={(e) => setFormOccupation(e.target.value)}
                  placeholder="e.g. Farmer / Street Vendor"
                  className="w-full p-2.5 rounded-xl border border-[#e8e1dc] bg-[#faf8f3] font-medium text-[#21191d] focus:border-[#4a1f2d] outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-[#514346] block mb-1">Primary Need Sector</label>
                <select
                  value={formNeed}
                  onChange={(e) => setFormNeed(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-[#e8e1dc] bg-[#faf8f3] font-medium text-[#21191d] capitalize focus:border-[#4a1f2d] outline-none"
                >
                  {NEED_CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label} ({c.tamilLabel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#4a1f2d] hover:bg-[#310a18] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <Sparkles className="w-4 h-4 text-[#c8a96b]" />
              <span>RUN DETERMINISTIC MATCH & ENROLL CITIZEN</span>
            </button>
          </form>
        </div>

        {/* Live Evaluation Results Preview */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e1dc] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-[#21191d] text-sm">
                Generated Citizen Entitlements Dossier
              </h3>
              {evaluatedResult && evaluatedResult.length > 0 && (
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-[#4a1f2d] hover:bg-[#310a18] text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-[#c8a96b]" />
                  <span>PRINT DOSSIER</span>
                </button>
              )}
            </div>

            {evaluatedResult ? (
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] flex items-center justify-between text-xs">
                  <span className="font-bold text-[#4a1f2d]">
                    Found {evaluatedResult.filter((m) => m.matchLevel !== 'MORE_INFO').length} Entitled Schemes for {formName}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#eedfe4] text-[#4a1f2d]">
                    STATE: {currentStateConfig.id}
                  </span>
                </div>

                {evaluatedResult.length > 0 ? (
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {evaluatedResult.slice(0, 4).map((m) => (
                      <div
                        key={m.scheme.id}
                        onClick={() => setSelectedSchemeDetail(m.scheme)}
                        className="p-3 rounded-xl border border-[#e8e1dc] hover:border-[#4a1f2d] bg-[#faf8f3] hover:bg-white transition-all cursor-pointer flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div>
                          <strong className="text-[#21191d]">{m.scheme.name}</strong>
                          <p className="text-[11px] text-[#756a6f]">{m.scheme.benefits?.shortSummary || ''}</p>
                        </div>
                        <span className="text-xs font-bold text-[#4a1f2d] bg-[#eedfe4] px-2 py-0.5 rounded-md shrink-0">
                          {m.score}% Match
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#756a6f] text-center py-4">
                    No schemes in connected repository to evaluate against.
                  </p>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-[#756a6f] space-y-2">
                <FileCheck2 className="w-8 h-8 mx-auto text-[#eedfe4]" />
                <p className="text-xs">
                  Fill in the citizen's demographic details on the left to generate instant scheme matches and printable application dossiers.
                </p>
              </div>
            )}
          </div>

          {/* Village Intake History */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8e1dc] shadow-xs space-y-3">
            <h3 className="font-bold text-[#21191d] text-sm">
              Today's Village Intake Registry
            </h3>

            {records.length === 0 ? (
              <div className="p-6 text-center text-[#756a6f] space-y-1">
                <Users className="w-6 h-6 mx-auto text-[#eedfe4]" />
                <p className="text-xs font-medium">No citizen records available.</p>
              </div>
            ) : (
              <div className="space-y-2 text-xs">
                {records.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] flex items-center justify-between"
                  >
                    <div>
                      <strong className="text-[#21191d]">{r.name}</strong>
                      <div className="text-[11px] text-[#756a6f] mt-0.5">
                        {r.occupation} • Age {r.age} • Phone: {r.phone}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#eedfe4] text-[#4a1f2d] border border-[#e8e1dc]">
                        {r.matchesCount} Schemes
                      </span>
                      <span className="text-[10px] text-[#756a6f] block mt-0.5">{r.createdAt}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
