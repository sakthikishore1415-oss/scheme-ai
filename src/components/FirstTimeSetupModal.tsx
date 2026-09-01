import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { STATES_LIST, STATES_CONFIG } from '../data/states';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { MapPin, Volume2, Check, Search, Globe, ShieldAlert, Sparkles, X } from 'lucide-react';

export const FirstTimeSetupModal: React.FC = () => {
  const {
    showSetupModal,
    setShowSetupModal,
    selectedStateId,
    setSelectedStateId,
    selectedVoiceLanguageId,
    setSelectedVoiceLanguageId,
    userProfile,
    updateUserProfile,
  } = useApp();

  const [tempStateId, setTempStateId] = useState<string>(selectedStateId);
  const [tempVoiceLangId, setTempVoiceLangId] = useState<string>(selectedVoiceLanguageId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(userProfile.district);
  const [showLanguagePicker, setShowLanguagePicker] = useState<boolean>(false);

  if (!showSetupModal) return null;

  const targetState = STATES_CONFIG[tempStateId] || STATES_CONFIG['TN'];
  const targetVoiceLang = SUPPORTED_LANGUAGES[tempVoiceLangId] || SUPPORTED_LANGUAGES['ta'];

  const filteredStates = STATES_LIST.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStateSelect = (stateId: string) => {
    setTempStateId(stateId);
    const cfg = STATES_CONFIG[stateId];
    if (cfg) {
      setTempVoiceLangId(cfg.defaultVoiceLanguage);
      setSelectedDistrict(cfg.districts[0] || '');
    }
  };

  const handleSaveAndContinue = () => {
    setSelectedStateId(tempStateId);
    setSelectedVoiceLanguageId(tempVoiceLangId);
    updateUserProfile({
      state: tempStateId,
      district: selectedDistrict || targetState.districts[0] || '',
      voiceLanguage: tempVoiceLangId,
    });
    setShowSetupModal(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-500/30 text-emerald-300 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-400/30">
                PERSONALIZATION
              </span>
              <span className="text-xs text-emerald-200">அறிவோம் திட்டம்</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">Let's Personalize Your Experience</h2>
            <p className="text-xs text-emerald-100/90 mt-1">
              Select your state to discover localized government schemes & activate regional voice.
            </p>
          </div>
          <button
            id="close-setup-modal-btn"
            onClick={() => setShowSetupModal(false)}
            className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5">
          {/* Important Principle Alert Box */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
            <Globe className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-900">
              <p className="font-bold mb-0.5">English Visual UI + Regional Voice Architecture</p>
              <p className="text-emerald-800 leading-relaxed">
                The visual smartphone interface remains in <strong>English</strong> by default. Your selected state determines the <strong>voice recognition, voice responses, and spoken explanations</strong>.
              </p>
            </div>
          </div>

          {/* Step 1: Select State */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Which state are you from?
              </label>
              <span className="text-[11px] text-slate-500">Selected: <strong className="text-emerald-700">{targetState.name}</strong></span>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                id="setup-state-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search state (e.g. Tamil Nadu, Kerala, Karnataka)..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              />
            </div>

            {/* State Grid Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50">
              {filteredStates.map((st) => {
                const isSelected = tempStateId === st.id;
                return (
                  <button
                    key={st.id}
                    id={`setup-state-btn-${st.id}`}
                    onClick={() => handleStateSelect(st.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs font-bold'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div>
                      <p className="text-xs font-semibold leading-tight">{st.name}</p>
                      <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                        {st.nativeName}
                      </p>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Selection */}
          {targetState.districts && targetState.districts.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-1.5">
                Select Your District ({targetState.name})
              </label>
              <select
                id="setup-district-select"
                value={selectedDistrict || targetState.districts[0]}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
              >
                {targetState.districts.map((dst) => (
                  <option key={dst} value={dst}>
                    {dst}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Step 2: Voice Language Recommendation */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-0.5">
                  Recommended Voice Language
                </span>
                <div className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-base font-extrabold text-slate-900">
                    {targetVoiceLang.name}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    {targetVoiceLang.nativeName}
                  </span>
                </div>
              </div>

              <button
                id="setup-change-voice-lang-toggle"
                onClick={() => setShowLanguagePicker(!showLanguagePicker)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                {showLanguagePicker ? 'Done' : 'Change Voice Language'}
              </button>
            </div>

            {/* Language Selector Dropdown / Grid if expanded */}
            {showLanguagePicker && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-[11px] text-slate-600 mb-2 font-medium">
                  Choose alternate voice language for speech recognition & TTS:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Object.values(SUPPORTED_LANGUAGES).map((lang) => {
                    const isSelected = tempVoiceLangId === lang.id;
                    return (
                      <button
                        key={lang.id}
                        id={`setup-voice-btn-${lang.id}`}
                        onClick={() => setTempVoiceLangId(lang.id)}
                        className={`p-2 rounded-lg text-left text-xs border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-600 text-white font-bold border-emerald-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                        }`}
                      >
                        <p className="font-semibold">{lang.name}</p>
                        <p className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                          {lang.nativeName}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            id="setup-cancel-btn"
            onClick={() => setShowSetupModal(false)}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-xl cursor-pointer"
          >
            Cancel
          </button>
          <button
            id="setup-continue-btn"
            onClick={handleSaveAndContinue}
            className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
          >
            <span>CONTINUE</span>
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
