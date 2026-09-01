import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Mic,
  MapPin,
  Sparkles,
  PhoneCall,
  Accessibility,
  Wifi,
  WifiOff,
  Flame,
  Volume2,
  Users,
  Layers,
} from 'lucide-react';
import { DEMO_PROFILES } from '../data/demoProfiles';

export const Header: React.FC = () => {
  const {
    currentStateConfig,
    currentLanguageConfig,
    setShowSetupModal,
    setShowVoiceModal,
    setShowPresentationMode,
    easyMode,
    setEasyMode,
    isOfflineMode,
    setIsOfflineMode,
    activeTab,
    setActiveTab,
    familyMembers,
    activeFamilyMemberId,
    switchFamilyMember,
    loadDemoProfile,
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

        <div className="flex items-center gap-2 shrink-0">
          {/* Quick Demo Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-800 rounded-md px-2 py-0.5 text-[11px] border border-slate-700">
            <span className="text-slate-400 font-medium">Demo Persona:</span>
            <select
              id="header-demo-selector"
              aria-label="Select Demo Persona"
              className="bg-transparent text-emerald-300 font-semibold cursor-pointer outline-none text-[11px]"
              onChange={(e) => {
                if (e.target.value) loadDemoProfile(e.target.value);
              }}
              defaultValue=""
            >
              <option value="" disabled className="bg-slate-900 text-slate-400">
                Load Hackathon Demo...
              </option>
              {DEMO_PROFILES.map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                  {p.label} ({p.badge})
                </option>
              ))}
            </select>
          </div>

          {/* Presentation Mode Trigger */}
          <button
            id="header-presentation-btn"
            onClick={() => setShowPresentationMode(true)}
            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-[11px] hover:from-amber-600 hover:to-orange-600 transition-all shadow-xs cursor-pointer"
            title="1-Minute Hackathon Demo Mode"
          >
            <Flame className="w-3.5 h-3.5 fill-white" />
            <span>HERO DEMO</span>
          </button>
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
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold tracking-tight text-slate-900 text-lg">
                  ARIVOM THITTAM
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                  CIVIC-TECH
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium leading-none">
                Voice-First • State-Aware • Inclusive
              </p>
            </div>
          </button>
        </div>

        {/* State & Voice Configuration Badges */}
        <div className="flex items-center gap-2">
          {/* State Selector Badge */}
          <button
            id="header-state-selector-btn"
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-semibold border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Change State or Voice Language"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>{currentStateConfig.name}</span>
            <span className="hidden sm:inline text-slate-400">({currentStateConfig.nativeName})</span>
          </button>

          {/* Voice Language Badge */}
          <button
            id="header-voice-lang-btn"
            onClick={() => setShowSetupModal(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-all cursor-pointer shadow-2xs"
            title="Current Voice Language"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline text-slate-600 font-normal">Voice:</span>
            <span>{currentLanguageConfig.name}</span>
            <span className="text-[11px] font-mono text-emerald-900">({currentLanguageConfig.nativeName})</span>
          </button>

          {/* Family Member Switcher Pill */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 border border-slate-200 rounded-lg p-0.5 text-xs">
            <Users className="w-3.5 h-3.5 ml-1.5 text-slate-500" />
            <select
              id="header-family-dropdown"
              aria-label="Family Member Profile"
              value={activeFamilyMemberId}
              onChange={(e) => switchFamilyMember(e.target.value)}
              className="bg-transparent text-slate-800 font-semibold px-1.5 py-1 text-xs cursor-pointer outline-none"
            >
              {familyMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Easy / Accessibility Mode Toggle */}
          <button
            id="header-easy-mode-btn"
            onClick={() => setEasyMode(!easyMode)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
              easyMode
                ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title="Toggle Accessibility / Easy Mode (Enlarged text & high contrast)"
          >
            <Accessibility className="w-4 h-4" />
            <span className="hidden sm:inline">{easyMode ? 'Easy Mode ON' : 'Easy Mode'}</span>
          </button>

          {/* Offline / Connectivity Mode Toggle */}
          <button
            id="header-offline-toggle-btn"
            onClick={() => setIsOfflineMode(!isOfflineMode)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border transition-all cursor-pointer ${
              isOfflineMode
                ? 'bg-red-700 text-white border-red-800'
                : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
            }`}
            title={isOfflineMode ? 'Currently in Limited Offline Mode' : 'Online Mode'}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-red-200" />
                <span className="hidden sm:inline">Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">Online</span>
              </>
            )}
          </button>

          {/* Primary Quick Voice Microphone CTA */}
          <button
            id="header-quick-mic-btn"
            onClick={() => setShowVoiceModal(true)}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 sm:px-4 py-1.5 rounded-lg font-bold text-xs shadow-sm hover:shadow transition-all cursor-pointer animate-pulse hover:animate-none"
          >
            <Mic className="w-4 h-4" />
            <span className="hidden sm:inline">Talk to Arivom</span>
            <span className="sm:hidden">Talk</span>
          </button>
        </div>
      </div>
    </header>
  );
};
