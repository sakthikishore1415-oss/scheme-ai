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
  ShieldCheck,
  CheckCircle2,
  Bookmark,
  Users,
  Search,
  Zap,
} from 'lucide-react';
import { DEMO_PROFILES } from '../data/demoProfiles';

export const HomeView: React.FC = () => {
  const {
    currentStateConfig,
    currentLanguageConfig,
    userProfile,
    activeMatches,
    setShowVoiceModal,
    setShowSetupModal,
    setActiveTab,
    quickSearchNeed,
    loadDemoProfile,
    easyMode,
  } = useApp();

  const strongMatches = activeMatches.filter((m) => m.matchLevel === 'STRONG');
  const displayMatches = strongMatches.length > 0 ? strongMatches.slice(0, 4) : activeMatches.slice(0, 4);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome & Quick Voice Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-6 sm:p-10 border border-emerald-900/60 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Top Pill Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs px-3 py-1 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>{currentStateConfig.name}</span>
              <span className="text-emerald-400 font-mono">({currentStateConfig.nativeName})</span>
            </span>

            <span className="bg-teal-500/20 text-teal-300 text-xs px-3 py-1 rounded-full font-bold border border-teal-500/30 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Voice: {currentLanguageConfig.name}</span>
            </span>

            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline cursor-pointer"
            >
              Change State / Language
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className={`font-black text-white tracking-tight ${easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
              Discover Your Entitled Government Schemes
            </h1>
            <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
              State-Aware, Voice-First Civic Platform for All Indian Citizens.
            </p>
          </div>

          {/* Primary Voice Mic Action Box */}
          <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-emerald-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                SPEAK IN YOUR REGIONAL LANGUAGE
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white">
                “I am a farmer from Trichy, I need agricultural aid”
              </p>
              <p className="text-[11px] text-slate-400 font-mono">
                {currentLanguageConfig.samplePhrase}
              </p>
            </div>

            <button
              id="home-hero-mic-btn"
              onClick={() => setShowVoiceModal(true)}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 transition-all flex items-center gap-2.5 shrink-0 cursor-pointer group"
            >
              <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>TALK TO ARIVOM</span>
            </button>
          </div>

          {/* Persona Presets Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 text-xs">
            <span className="text-slate-400 shrink-0 font-medium">Try Preset:</span>
            {DEMO_PROFILES.slice(0, 4).map((d) => (
              <button
                key={d.id}
                onClick={() => loadDemoProfile(d.id)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium shrink-0 border border-slate-700 cursor-pointer"
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Needs in Current State */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
              EXPLORE BY SECTOR
            </span>
            <h2 className="text-lg font-black text-slate-900">
              Popular Needs in {currentStateConfig.name}
            </h2>
          </div>

          <button
            onClick={() => setActiveTab('matches')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
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
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all text-left group cursor-pointer flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{cat.icon}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-emerald-600 transition-colors" />
              </div>
              <div>
                <h3 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {cat.label}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">
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
            <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              PERSONALIZED MATCHES ({currentStateConfig.name})
            </span>
            <h2 className="text-lg font-black text-slate-900">
              Top Eligible Schemes for {userProfile.name || 'Your Profile'}
            </h2>
          </div>

          <button
            id="home-view-all-matches-btn"
            onClick={() => setActiveTab('matches')}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>VIEW ALL ({activeMatches.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayMatches.map((res) => (
            <SchemeCard key={res.scheme.id} matchResult={res} />
          ))}
        </div>
      </section>

      {/* Zero Internet Button Phone Feature Highlight */}
      <section className="rounded-3xl bg-slate-900 text-white p-6 sm:p-8 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
            <PhoneCall className="w-3.5 h-3.5" />
            BUTTON PHONE ACCESSIBILITY
          </div>
          <h3 className="text-xl font-extrabold text-white">
            Have a Basic Button Phone with No Internet?
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Citizens can dial our Toll-Free Civic IVR Helpline <strong className="text-white">1800-425-7000</strong> or send an SMS to receive spoken scheme audio and text summaries without smartphones.
          </p>
        </div>

        <button
          id="home-open-button-phone-btn"
          onClick={() => setActiveTab('button_phone')}
          className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
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
