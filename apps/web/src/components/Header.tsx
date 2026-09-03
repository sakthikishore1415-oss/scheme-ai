import React from 'react';
import { useApp } from '../context/AppContext';
import { LanguageSwitcher } from './LanguageSwitcher';
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#c5c6d0]/60 shadow-xs">
      {/* Top Banner Context Strip */}
      <div className="bg-[#092554] text-white text-xs px-3 sm:px-6 py-1.5 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-[#94f6c4]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#94f6c4] animate-pulse"></span>
            ARIVOM THITTAM
          </div>
          <span className="text-[#90a6dd]/60">|</span>
          <span className="text-[#d9e2ff] font-medium text-[11px]">அறிவோம் திட்டம்</span>
          <span className="hidden md:inline text-[#90a6dd] text-[11px] italic">
            “Know Your Schemes. Claim Your Benefits.”
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {userProfile && userProfile.name ? (
            <div className="flex items-center gap-1.5 text-xs text-white bg-[#243b6b] px-2.5 py-0.5 rounded-full border border-[#90a6dd]/30">
              <User className="w-3.5 h-3.5 text-[#94f6c4]" />
              <span>{userProfile.name}</span>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="text-[11px] text-[#94f6c4] hover:text-white font-semibold underline cursor-pointer"
            >
              Create Profile
            </button>
          )}

          {familyMembers.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 bg-[#243b6b] rounded-md px-2 py-0.5 text-[11px] border border-[#90a6dd]/30">
              <Users className="w-3.5 h-3.5 text-[#d9e2ff]" />
              <select
                id="header-family-selector"
                aria-label="Select Family Member"
                className="bg-transparent text-[#94f6c4] font-semibold cursor-pointer outline-none text-[11px]"
                value={activeFamilyMemberId || ''}
                onChange={(e) => switchFamilyMember(e.target.value)}
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#092554] text-white">
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand & State info */}
        <div className="flex items-center gap-3">
          <button
            id="brand-home-link"
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-2.5 text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-[#092554] text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-[#243b6b] transition-colors">
              அ
            </div>
            <div>
              <div className="font-extrabold text-base text-[#092554] leading-none tracking-tight group-hover:text-[#243b6b] transition-colors">
                Arivom Thittam
              </div>
              <div className="text-[10px] text-[#44464f] font-semibold tracking-wider uppercase mt-0.5">
                CIVIC SCHEME DISCOVERY
              </div>
            </div>
          </button>

          {/* Active State Button */}
          <button
            id="state-selector-btn"
            onClick={() => setShowSetupModal(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f2f4f6] hover:bg-[#edeef0] text-[#191c1e] text-xs font-bold border border-[#c5c6d0]/60 transition-all cursor-pointer"
            title="Click to Change State"
          >
            <MapPin className="w-3.5 h-3.5 text-[#092554]" />
            <span>{currentStateConfig.name}</span>
          </button>

          {/* Quick Language Switcher Dropdown */}
          <LanguageSwitcher />
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Voice Mic Button */}
          <button
            id="header-voice-mic-btn"
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-extrabold text-xs shadow-md shadow-[#092554]/20 transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 animate-pulse text-[#fea619]" />
            <span className="hidden sm:inline">VOICE ASSISTANT</span>
          </button>

          {/* Easy Mode Toggle (Accessibility) */}
          <button
            id="toggle-easy-mode-btn"
            onClick={() => setEasyMode(!easyMode)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              easyMode
                ? 'bg-[#d9e2ff] border-[#092554] text-[#092554] font-bold'
                : 'bg-[#f2f4f6] border-[#c5c6d0]/60 text-[#44464f] hover:bg-[#edeef0]'
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
                ? 'bg-[#ffdad6] border-[#ba1a1a] text-[#ba1a1a]'
                : 'bg-[#f2f4f6] border-[#c5c6d0]/60 text-[#44464f] hover:bg-[#edeef0]'
            }`}
            title={isOfflineMode ? 'Limited Connectivity Mode Active' : 'Online Mode'}
          >
            {isOfflineMode ? <WifiOff className="w-4 h-4 text-[#ba1a1a]" /> : <Wifi className="w-4 h-4 text-[#092554]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
