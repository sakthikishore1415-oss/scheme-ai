import React from 'react';
import { useApp } from '../context/AppContext';
import { NEED_CATEGORIES } from '../data/categories';
import { InteractiveIndiaMap } from '../components/InteractiveIndiaMap';
import { TranslationKey } from '../translations';
import {
  Mic,
  Sparkles,
  MapPin,
  Volume2,
  ArrowRight,
} from 'lucide-react';

const categoryKeyMap: Record<string, TranslationKey> = {
  agriculture: 'category.agriculture',
  education: 'category.education',
  housing: 'category.housing',
  employment: 'category.employment',
  women_welfare: 'category.women',
  senior_pension: 'category.senior',
  health: 'category.health',
  business_loan: 'category.financial',
  disability_support: 'category.disability',
  general_welfare: 'category.general',
};

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
    easyMode,
    t,
  } = useApp();

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in pb-12">
      {/* Hero Welcome & Quick Voice Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#4a1f2d] text-white p-6 sm:p-10 border border-[#6b3548] shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Top Pill Info */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="bg-[#6b3548] text-[#ffd9e1] text-xs px-3 py-1 rounded-full font-bold border border-[#e8e1dc]/30 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#c8a96b]" />
              <span>{currentStateConfig.name}</span>
            </span>

            <span className="bg-[#6b3548] text-[#ffd9e1] text-xs px-3 py-1 rounded-full font-bold border border-[#e8e1dc]/30 flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-[#c8a96b]" />
              <span>{currentLanguageConfig.nativeName}</span>
            </span>

            <button
              onClick={() => setShowSetupModal(true)}
              className="text-xs text-[#c8a96b] hover:text-white font-bold underline cursor-pointer ml-1"
            >
              {t('header.changeState')}
            </button>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-[#c8a96b] tracking-wider uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#c8a96b]" />
              {t('header.title')}
            </span>

            <h1 className={`font-bold text-white tracking-tight ${easyMode ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'}`}>
              {t('home.heroTitle')}
            </h1>

            <p className="text-xs sm:text-sm text-[#ffd9e1] font-normal leading-relaxed max-w-2xl">
              {t('home.heroSubtitle')}
            </p>
          </div>

          {/* Primary Voice Mic Action Box */}
          <div className="bg-[#310a18]/70 rounded-2xl p-4 sm:p-5 border border-[#e8e1dc]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-bold text-[#c8a96b] uppercase tracking-wider block">
                {currentLanguageConfig.nativeName}
              </span>
              <p className="text-xs sm:text-sm font-bold text-white">
                {t('home.startVoiceBtn')}
              </p>
              <p className="text-[11px] text-[#ffd9e1] font-mono">
                "{currentLanguageConfig.samplePhrase}"
              </p>
            </div>

            <button
              id="home-hero-mic-btn"
              onClick={() => setShowVoiceModal(true)}
              className="px-6 py-3.5 rounded-xl bg-[#c8a96b] hover:bg-[#e3c282] text-[#310a18] font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2.5 shrink-0 cursor-pointer group"
            >
              <Mic className="w-5 h-5 text-[#310a18] group-hover:scale-110 transition-transform" />
              <div className="text-left leading-tight">
                <span className="block font-bold">{t('home.startVoiceBtn')}</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Profile or Matches Notification Banner */}
      {userProfile ? (
        <section className="bg-[#71806b]/12 border border-[#71806b] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#71806b] text-white flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <span className="font-bold text-[#241c20] block text-sm">
                {userProfile.name ? `${userProfile.name} • ` : ''}{userProfile.occupation || 'Citizen'} ({userProfile.district || currentStateConfig.name})
              </span>
              <p className="text-[#514346]">
                {activeMatches.length} {t('home.matchesNotice')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="px-4 py-2 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>{t('home.viewMatches')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      ) : (
        <section className="bg-[#faf8f3] border border-[#e8e1dc] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#4a1f2d] text-white flex items-center justify-center font-bold">
              ?
            </div>
            <div>
              <span className="font-bold text-[#241c20] block text-sm">
                {t('profile.title')}
              </span>
              <p className="text-[#756a6f]">
                {t('home.createProfileNotice')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="px-4 py-2 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white font-bold cursor-pointer transition-colors shrink-0 flex items-center gap-1.5"
          >
            <span>{t('home.checkEligibility')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </section>
      )}

      {/* Quick Needs / Categories Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#241c20]">
              {t('home.quickNeedsHeading')}
            </h2>
            <p className="text-xs text-[#756a6f] font-normal">
              {t('home.quickNeedsSubtitle')}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('matches')}
            className="text-xs text-[#4a1f2d] font-bold hover:underline cursor-pointer flex items-center gap-1"
          >
            <span>{t('home.browseCatalog')}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {NEED_CATEGORIES.map((cat) => {
            const key = categoryKeyMap[cat.id] || 'category.general';
            return (
              <button
                key={cat.id}
                onClick={() => quickSearchNeed(cat.id)}
                className="p-4 rounded-2xl bg-white border border-[#e8e1dc] hover:border-[#4a1f2d] hover:shadow-civic-overlay transition-all text-left group cursor-pointer flex flex-col justify-between"
              >
                <span className="text-2xl mb-2">{cat.icon || cat.emoji}</span>
                <div>
                  <span className="font-bold text-xs text-[#241c20] group-hover:text-[#4a1f2d] transition-colors block leading-snug">
                    {t(key)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Interactive India Map */}
      <section className="space-y-3">
        <InteractiveIndiaMap />
      </section>
    </div>
  );
};
