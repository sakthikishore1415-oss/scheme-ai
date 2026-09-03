import React from 'react';
import { useApp } from '../context/AppContext';
import { NEED_CATEGORIES } from '../data/categories';
import { SchemeCard } from '../components/SchemeCard';
import { InteractiveIndiaMap } from '../components/InteractiveIndiaMap';
import {
  Mic,
  Sparkles,
  MapPin,
  Volume2,
  PhoneCall,
  ArrowRight,
  UserPlus,
  Info,
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
              <span>Voice: {currentLanguageConfig.name}</span>
            </span>

            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs text-[#94f6c4] hover:text-white font-bold underline cursor-pointer ml-1"
            >
              Change State / Language
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1.5">
            <span className="text-xs font-extrabold text-[#fea619] tracking-wider uppercase">
              அரசு திட்டங்கள் • CIVIC SCHEME DISCOVERY
            </span>
            <h1 className={`font-black text-white tracking-tight ${easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
              உங்களுக்கு என்ன கிடைக்கும்?
            </h1>
            <p className="text-xs sm:text-sm text-[#d9e2ff] font-medium leading-relaxed">
              Find government schemes and welfare entitlements you qualify for — evaluated directly against published gazette guidelines.
            </p>
          </div>

          {/* Primary Voice Mic Action Box */}
          <div className="bg-[#243b6b]/60 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-[#90a6dd]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-bold text-[#94f6c4] uppercase tracking-wider block">
                SPEAK IN YOUR REGIONAL LANGUAGE
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white">
                Tell us your age, occupation, and needs to discover schemes
              </p>
              <p className="text-[11px] text-[#d9e2ff] font-mono">
                {currentLanguageConfig.samplePhrase}
              </p>
            </div>

            <button
              id="home-hero-mic-btn"
              onClick={() => setShowVoiceModal(true)}
              className="px-6 py-3 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-black text-xs sm:text-sm shadow-xl shadow-[#fea619]/20 transition-all flex items-center gap-2.5 shrink-0 cursor-pointer group"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>TALK TO ARIVOM</span>
            </button>
          </div>
        </div>
      </section>

      {/* Onboarding State if no profile */}
      {!userProfile && (
        <section className="bg-white rounded-3xl p-6 sm:p-8 border border-[#c5c6d0]/60 shadow-soft flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d9e2ff] text-[#001944] text-xs font-bold border border-[#b0c6ff]">
              <UserPlus className="w-3.5 h-3.5 text-[#092554]" />
              GET STARTED
            </div>
            <h2 className="text-xl font-bold text-[#092554]">
              Let's create your profile to find schemes you qualify for.
            </h2>
            <p className="text-xs text-[#44464f] leading-relaxed">
              Enter your basic demographic information (age, occupation, income, state) or speak with our regional voice assistant to evaluate government scheme eligibility.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('profile')}
            className="px-6 py-3 rounded-2xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>CREATE YOUR PROFILE</span>
          </button>
        </section>
      )}

      {/* Popular Needs in Current State */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#092554] tracking-wider uppercase">
              EXPLORE BY SECTOR
            </span>
            <h2 className="text-lg font-bold text-[#092554]">
              Popular Needs in {currentStateConfig.name}
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('matches')}
            className="text-xs font-bold text-[#092554] hover:text-[#243b6b] flex items-center gap-1 cursor-pointer"
          >
            <span>View All Sectors</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {NEED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              id={`home-need-card-${cat.id}`}
              onClick={() => quickSearchNeed(cat.id)}
              className="p-4 rounded-2xl bg-white border border-[#c5c6d0]/60 hover:border-[#092554] hover:shadow-card-hover transition-all text-left group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#c5c6d0] group-hover:text-[#092554] transition-colors" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-[#191c1e] group-hover:text-[#092554] transition-colors">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-[#757780] font-medium mt-0.5">
                  {cat.tamilLabel}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Top Matched Schemes for Active Profile */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[#092554] tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#fea619]" />
              PERSONALIZED MATCHES ({currentStateConfig.name})
            </span>
            <h2 className="text-lg font-bold text-[#092554]">
              {userProfile?.name ? `Top Eligible Schemes for ${userProfile.name}` : 'Personalized Scheme Matches'}
            </h2>
          </div>

          {activeMatches.length > 0 && (
            <button
              id="home-view-all-matches-btn"
              onClick={() => setActiveTab('matches')}
              className="px-3.5 py-1.5 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>VIEW ALL ({activeMatches.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {displayMatches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayMatches.map((res) => (
              <SchemeCard key={res.scheme.id} matchResult={res} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 border border-[#c5c6d0]/60 text-center space-y-3 shadow-soft">
            <Info className="w-8 h-8 mx-auto text-[#757780]" />
            <h3 className="font-bold text-[#191c1e] text-sm">
              {!userProfile
                ? 'No scheme matches yet. Complete your profile to discover schemes.'
                : schemesStatus === 'NO_DATA'
                ? 'No government schemes loaded from connected repository.'
                : 'No matching schemes found for your current profile criteria.'}
            </h3>
            <p className="text-xs text-[#44464f] max-w-md mx-auto">
              {!userProfile
                ? 'Fill out your profile or use the voice assistant to calculate your eligibility against official government guidelines.'
                : 'Try adjusting your stated sector need or explore all available sectors above.'}
            </p>
            {!userProfile && (
              <button
                onClick={() => setActiveTab('profile')}
                className="mt-2 px-5 py-2.5 rounded-xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs inline-flex items-center gap-2 cursor-pointer transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Profile</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* Zero Internet Button Phone Feature Highlight */}
      <section className="rounded-3xl bg-[#092554] text-white p-6 sm:p-8 border border-[#243b6b] shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fea619]/20 text-[#fea619] text-xs font-bold border border-[#fea619]/30">
            <PhoneCall className="w-3.5 h-3.5" />
            BUTTON PHONE ACCESSIBILITY
          </div>
          <h3 className="text-xl font-bold text-white">
            Have a Basic Button Phone with No Internet?
          </h3>
          <p className="text-xs text-[#d9e2ff] leading-relaxed">
            Citizens can dial our Toll-Free Civic IVR Helpline <strong className="text-white">1800-425-7000</strong> or send an SMS to receive spoken scheme audio and text summaries without smartphones.
          </p>
        </div>

        <button
          id="home-open-button-phone-btn"
          onClick={() => setActiveTab('button_phone')}
          className="px-6 py-3 rounded-2xl bg-[#fea619] hover:bg-[#ffb95f] text-[#684000] font-bold text-xs shadow-lg shadow-[#fea619]/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <PhoneCall className="w-4 h-4" />
          <span>LAUNCH BUTTON PHONE SIMULATOR</span>
        </button>
      </section>

      {/* Interactive India Map / State Selector */}
      <section className="pt-2">
        <InteractiveIndiaMap />
      </section>
    </div>
  );
};
