import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  MapPin,
  Sparkles,
  Accessibility,
  Wifi,
  WifiOff,
  Volume2,
  Users,
  User,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentStateConfig,
    currentLanguageConfig,
    setShowSetupModal,
    setShowVoiceModal,
    easyMode,
    setEasyMode,
    isOfflineMode,
    setIsOfflineMode,
    activeTab,
    setActiveTab,
    familyMembers,
    activeFamilyMemberId,
    switchFamilyMember,
    userProfile,
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Banner Context Strip */}
      <div className="bg-slate-900 text-slate-100 text-xs px-3 sm:px-4 py-1.5 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 font-medium text-emerald-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            ARIVOM THITTAM
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-mono text-[11px]">அறிவோம் திட்டம்</span>
          <span className="hidden md:inline text-slate-400 italic">
            “Know Your Schemes. Claim Your Benefits.”
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {userProfile && userProfile.name ? (
            <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded-full border border-slate-700">
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>{userProfile.name}</span>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="text-[11px] text-emerald-400 hover:text-emerald-300 font-semibold underline cursor-pointer"
            >
              Create Profile
            </button>
          )}

          {familyMembers.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 bg-slate-800 rounded-md px-2 py-0.5 text-[11px] border border-slate-700">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <select
                id="header-family-selector"
                aria-label="Select Family Member"
                className="bg-transparent text-emerald-300 font-semibold cursor-pointer outline-none text-[11px]"
                value={activeFamilyMemberId || ''}
                onChange={(e) => switchFamilyMember(e.target.value)}
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id} className="bg-slate-900 text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-2">
        {/* Brand & State info */}
        <div className="flex items-center gap-3">
          <button
            id="brand-home-link"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-emerald-800 transition-colors">
              அ
            </div>
            <div>
              <div className="font-black text-base text-slate-900 leading-none group-hover:text-emerald-700 transition-colors">
                Arivom Thittam
              </div>
              <div className="text-[10px] text-slate-500 font-medium tracking-wide">
                CIVIC SCHEME DISCOVERY
              </div>
            </div>
          </button>

          {/* Active State / Language Switcher Button */}
          <button
            id="state-lang-selector-btn"
            onClick={() => setShowSetupModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 text-xs font-semibold border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer"
            title="Click to Change State or Language"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span className="font-bold">{currentStateConfig.name}</span>
            <span className="text-slate-400 font-normal">|</span>
            <Volume2 className="w-3.5 h-3.5 text-teal-600" />
            <span>{currentLanguageConfig.name}</span>
          </button>
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Voice Mic Button */}
          <button
            id="header-voice-mic-btn"
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 animate-pulse" />
            <span className="hidden sm:inline">VOICE ASSISTANT</span>
          </button>

          {/* Easy Mode Toggle (Accessibility) */}
          <button
            id="toggle-easy-mode-btn"
            onClick={() => setEasyMode(!easyMode)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              easyMode
                ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title="Toggle High-Contrast Easy Mode"
          >
            <Accessibility className="w-4 h-4" />
          </button>

          {/* Offline Mode Toggle */}
          <button
            id="toggle-offline-mode-btn"
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isOfflineMode
                ? 'bg-red-100 border-red-400 text-red-900'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
            title={isOfflineMode ? 'Limited Connectivity Mode Active' : 'Online Mode'}
          >
            {isOfflineMode ? <WifiOff className="w-4 h-4 text-red-600" /> : <Wifi className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
