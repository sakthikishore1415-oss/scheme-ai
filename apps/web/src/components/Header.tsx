import React from 'react';
import { useApp } from '../context/AppContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { getLanguageInitial } from '../data/languages';
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
    selectedVoiceLanguageId,
    uiStrings,
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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#e8e1dc] shadow-xs">
      {/* Top Banner Context Strip */}
      <div className="bg-[#4a1f2d] text-white text-xs px-3 sm:px-6 py-1.5 flex items-center justify-between overflow-x-auto gap-2">
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 font-bold text-[#c8a96b]">
            <span className="inline-block w-2 h-2 rounded-full bg-[#c8a96b] animate-pulse"></span>
            ARIVOM THITTAM
          </div>
          <span className="text-[#c08494]/60">|</span>
          <span className="text-[#ffd9e1] font-medium text-[11px]">{uiStrings.appTitle}</span>
          <span className="hidden md:inline text-[#c08494] text-[11px] italic">
            “{uiStrings.appTagline}”
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {userProfile && userProfile.name ? (
            <div className="flex items-center gap-1.5 text-xs text-white bg-[#6b3548] px-2.5 py-0.5 rounded-full border border-[#e8e1dc]/30">
              <User className="w-3.5 h-3.5 text-[#c8a96b]" />
              <span>{userProfile.name}</span>
            </div>
          ) : (
            <button
              onClick={() => setActiveTab('profile')}
              className="text-[11px] text-[#c8a96b] hover:text-white font-semibold underline cursor-pointer"
            >
              {uiStrings.profileHeading}
            </button>
          )}

          {familyMembers.length > 1 && (
            <div className="hidden sm:flex items-center gap-1 bg-[#6b3548] rounded-md px-2 py-0.5 text-[11px] border border-[#e8e1dc]/30">
              <Users className="w-3.5 h-3.5 text-[#ffd9e1]" />
              <select
                id="header-family-selector"
                aria-label="Select Family Member"
                className="bg-transparent text-[#ffd9e1] font-semibold cursor-pointer outline-none text-[11px]"
                value={activeFamilyMemberId || ''}
                onChange={(e) => switchFamilyMember(e.target.value)}
              >
                {familyMembers.map((m) => (
                  <option key={m.id} value={m.id} className="bg-[#4a1f2d] text-white">
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
            <div className="w-10 h-10 rounded-xl bg-[#4a1f2d] text-white flex items-center justify-center font-bold text-xl shadow-md group-hover:bg-[#6b3548] transition-colors">
              {getLanguageInitial(selectedVoiceLanguageId)}
            </div>
            <div>
              <div className="font-extrabold text-base text-[#241c20] leading-none tracking-tight group-hover:text-[#4a1f2d] transition-colors">
                {uiStrings.appTitle}
              </div>
              <div className="text-[10px] text-[#756a6f] font-semibold tracking-wider uppercase mt-0.5">
                CIVIC SCHEME DISCOVERY
              </div>
            </div>
          </button>

          {/* Active State Button */}
          <button
            id="state-selector-btn"
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#faf8f3] hover:bg-[#eedfe4] text-[#241c20] text-[11px] sm:text-xs font-bold border border-[#e8e1dc] transition-all cursor-pointer"
            title="Click to Change State"
          >
            <MapPin className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#4a1f2d] shrink-0" />
            <span className="hidden sm:inline">{currentStateConfig.name}</span>
            <span className="sm:hidden">{currentStateConfig.name.split(' ')[0]}</span>
          </button>

          {/* Quick Language Switcher Dropdown */}
          <LanguageSwitcher />
        </div>

        {/* Global Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Quick Voice Mic Button */}
          <button
            id="header-voice-mic-btn"
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
          >
            <Mic className="w-4 h-4 text-[#c8a96b]" />
            <span className="hidden sm:inline">VOICE ASSISTANT</span>
          </button>

          {/* Easy Mode Toggle (Accessibility) */}
          <button
            id="toggle-easy-mode-btn"
            onClick={() => setEasyMode(!easyMode)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              easyMode
                ? 'bg-[#ffd9e1] border-[#4a1f2d] text-[#4a1f2d] font-bold'
                : 'bg-[#faf8f3] border-[#e8e1dc] text-[#756a6f] hover:bg-[#eedfe4]'
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
                : 'bg-[#faf8f3] border-[#e8e1dc] text-[#756a6f] hover:bg-[#eedfe4]'
            }`}
            title={isOfflineMode ? 'Limited Connectivity Mode Active' : 'Online Mode'}
          >
            {isOfflineMode ? <WifiOff className="w-4 h-4 text-[#ba1a1a]" /> : <Wifi className="w-4 h-4 text-[#4a1f2d]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
