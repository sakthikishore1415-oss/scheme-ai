import React from 'react';
import { useApp } from '../context/AppContext';
import { NEED_CATEGORIES } from '../data/categories';
import { SchemeCard } from '../components/SchemeCard';
import { InteractiveIndiaMap } from '../components/InteractiveIndiaMap';
import { DualTextDisplay } from '../components/common/DualTextDisplay';
import {
  Mic,
  Sparkles,
  MapPin,
  Volume2,
  PhoneCall,
  ArrowRight,
  UserPlus,
  Info,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const HomeView: React.FC = () => {
  const {
    currentStateConfig,
    currentLanguageConfig,
    userProfile,
    activeMatches,
    schemesStatus,
    setShowVoiceModal,
    setShowSetupModal,
    setActiveTab,
    quickSearchNeed,
    easyMode,
    uiStrings,
    selectedVoiceLanguageId,
  } = useApp();

  const strongMatches = activeMatches.filter((m) => m.matchLevel === 'STRONG');
  const displayMatches = strongMatches.length > 0 ? strongMatches.slice(0, 4) : activeMatches.slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome & Quick Voice Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#092554] text-white p-6 sm:p-10 border border-[#243b6b] shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#243b6b]/40 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Top Pill Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#243b6b] text-[#d9e2ff] text-xs px-3 py-1 rounded-full font-bold border border-[#90a6dd]/30 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#94f6c4]" />
              <span>{currentStateConfig.name}</span>
              <span className="text-[#94f6c4] font-medium">({currentStateConfig.nativeName})</span>
            </span>

            <span className="bg-[#243b6b] text-[#d9e2ff] text-xs px-3 py-1 rounded-full font-bold border border-[#90a6dd]/30 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#fea619]" />
              <span>{currentLanguageConfig.nativeName} / {currentLanguageConfig.name}</span>
            </span>

            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs text-[#94f6c4] hover:text-white font-bold underline cursor-pointer ml-1"
            >
              {uiStrings.changeState}
            </button>
          </div>

          {/* Heading with Dual-Language */}
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-[#fea619] tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#94f6c4]" />
              {uiStrings.appTitle} • CIVIC SCHEME DISCOVERY
            </span>

            <h1 className={`font-black text-white tracking-tight ${easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
              {uiStrings.heroHeading}
            </h1>
            {selectedVoiceLanguageId !== 'en' && (
              <p className="text-sm font-semibold text-[#94f6c4] tracking-wide">
                Find schemes
              </p>
            )}

            <p className="text-xs sm:text-sm text-[#d9e2ff] font-medium leading-relaxed pt-1">
              {uiStrings.heroSubheading}
            </p>
          </div>

          {/* Primary Voice Mic Action Box */}
          <div className="bg-[#243b6b]/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#90a6dd]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-bold text-[#94f6c4] uppercase tracking-wider block">
                {currentLanguageConfig.nativeName} VOICE ASSISTANT
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white">
                {uiStrings.startVoiceBtn}
              </p>
              <p className="text-[11px] text-[#d9e2ff] font-mono">
                "{currentLanguageConfig.samplePhrase}"
              </p>
            </div>

            <button
              id="home-hero-mic-btn"
              onClick={() => setShowVoiceModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#092554] font-black text-xs sm:text-sm shadow-xl shadow-[#fea619]/20 transition-all flex items-center gap-2.5 shrink-0 cursor-pointer group"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left leading-tight">
                <span className="block">{uiStrings.startVoiceBtn}</span>
                {selectedVoiceLanguageId !== 'en' && (
                  <span className="text-[10px] text-[#092554]/80 block font-normal">
                    Talk to Assistant
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Profile or Matches Notification Banner */}
      {userProfile ? (
        <section className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="font-bold text-emerald-950 block text-sm">
                {userProfile.name ? `${userProfile.name} • ` : ''}{userProfile.occupation || 'Citizen'} ({userProfile.district || currentStateConfig.name})
              </span>
              <p className="text-emerald-800">
                {activeMatches.length} matching welfare schemes evaluated for your profile.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>{uiStrings.navMatches}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      ) : (
        <section className="bg-[#f2f3fa] border border-[#c5c6d0]/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#092554] text-white flex items-center justify-center font-bold">
              ?
            </div>
            <div>
              <span className="font-bold text-[#191c1e] block text-sm">
                {uiStrings.profileHeading}
              </span>
              <p className="text-[#44474f]">
                {uiStrings.profileSubheading}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>{uiStrings.checkEligibilityBtn}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* Need Categories Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-[#191c1e]">
              திட்டப் பிரிவுகள்
            </h2>
            {selectedVoiceLanguageId !== 'en' && (
              <p className="text-xs text-[#757780] font-medium">
                Scheme Categories
              </p>
            )}
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="text-xs text-[#092554] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{uiStrings.browseCatalogBtn}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {NEED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => quickSearchNeed(cat.id)}
              className="p-3.5 rounded-2xl bg-white border border-[#c5c6d0]/60 hover:border-[#092554] hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
            >
              <span className="text-2xl mb-2">{cat.icon || cat.emoji}</span>
              <div>
                <span className="font-bold text-xs text-[#191c1e] group-hover:text-[#092554] transition-colors block">
                  {selectedVoiceLanguageId === 'ta' ? cat.tamilLabel : cat.label}
                </span>
                {selectedVoiceLanguageId !== 'en' && (
                  <span className="text-[10px] text-[#757780] block">
                    {cat.label}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Interactive India Map & State Quick Switch */}
      <section className="space-y-3">
        <InteractiveIndiaMap />
      </section>
    </div>
  );
};
