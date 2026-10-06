import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchemeCard } from '../components/SchemeCard';
import { AdaptiveQuestionWizard } from '../components/AdaptiveQuestionWizard';
import {
  Sparkles,
  Search,
  Wand2,
  UserPlus,
  Inbox,
  X,
  Building2,
  Landmark,
  Layers,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { MatchResult } from '../types';

export const MyMatchesView: React.FC = () => {
  const {
    activeMatches,
    schemes,
    selectedStateId,
    userProfile,
    currentStateConfig,
    easyMode,
    setActiveTab,
    setShowVoiceModal,
    t,
  } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'STRONG' | 'POTENTIAL' | 'STATE' | 'CENTRAL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWizard, setShowWizard] = useState<boolean>(false);

  // When userProfile exists, use actual activeMatches.
  // When userProfile is null, generate clean catalog results for all schemes in this state / central government.
  const applicableSchemes = schemes.filter(
    (s) =>
      s.stateId === 'ALL' ||
      s.stateId === selectedStateId ||
      s.state === 'ALL' ||
      s.state === selectedStateId
  );

  const catalogMatches: MatchResult[] = applicableSchemes.map((s) => ({
    scheme: s,
    score: 0,
    matchLevel: 'MORE_INFO' as const,
    status: 'NO_DATA' as const,
    criteriaBreakdown: {
      age: false,
      income: false,
      occupation: false,
      location: true,
      gender: false,
      documents: 'MISSING' as const,
    },
    whyMeEnglish: ['Complete your profile to check eligibility criteria.'],
    whyMeRegional: ['தகுதி அறிய உங்கள் விவரங்களை பதிவு செய்யவும்.'],
    matchedPoints: [],
    pendingPoints: ['Citizen profile required to verify eligibility'],
    simpleExplanationEnglish: s.summarySimple || '',
    simpleExplanationRegional: '',
  }));

  const sourceMatches = userProfile ? activeMatches : catalogMatches;

  const categories = [
    { id: 'ALL', label: t('filter.allCategories') },
    { id: 'agriculture', label: `🌾 ${t('category.agriculture')}` },
    { id: 'education', label: `🎓 ${t('category.education')}` },
    { id: 'housing', label: `🏡 ${t('category.housing')}` },
    { id: 'health', label: `🏥 ${t('category.health')}` },
    { id: 'women', label: `👩 ${t('category.women')}` },
    { id: 'senior_citizens', label: `👵 ${t('category.senior')}` },
    { id: 'employment', label: `💼 ${t('category.employment')}` },
    { id: 'business', label: `💰 ${t('category.financial')}` },
    { id: 'disability', label: `♿ ${t('category.disability')}` },
  ];

  // Apply filters
  const filteredMatches = sourceMatches.filter((res) => {
    // 1. Level filter
    if (filterType === 'STRONG' && res.matchLevel !== 'STRONG') return false;
    if (filterType === 'POTENTIAL' && res.matchLevel !== 'POTENTIAL') return false;
    if (filterType === 'STATE' && (res.scheme.stateId === 'ALL' || res.scheme.state === 'ALL')) return false;
    if (filterType === 'CENTRAL' && (res.scheme.stateId !== 'ALL' && res.scheme.state !== 'ALL')) return false;

    // 2. Category filter
    if (selectedCategory !== 'ALL' && res.scheme.category !== selectedCategory) return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = res.scheme.name.toLowerCase().includes(q);
      const matchNative = res.scheme.nativeName?.toLowerCase().includes(q) || false;
      const matchDept = (res.scheme.department || res.scheme.authority || '').toLowerCase().includes(q);
      const matchBen = (res.scheme.benefits?.amount || res.scheme.benefits?.shortSummary || '').toLowerCase().includes(q);
      const matchCat = (res.scheme.category || '').toLowerCase().includes(q);
      if (!matchName && !matchNative && !matchDept && !matchBen && !matchCat) return false;
    }

    return true;
  });

  const hasActiveFilters = filterType !== 'ALL' || selectedCategory !== 'ALL' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setFilterType('ALL');
    setSelectedCategory('ALL');
    setSearchQuery('');
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="bg-[#4a1f2d] text-white rounded-3xl p-6 sm:p-8 border border-[#6b3548] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#6b3548] text-[#ffd9e1] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#e8e1dc]/30 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#c8a96b]" />
              {userProfile ? t('matches.title') : t('home.browseCatalog')}
            </span>
            <span className="text-xs text-[#c8a96b] font-mono font-bold">
              📍 {currentStateConfig.name}
            </span>
          </div>

          <h1 className={`font-black text-white tracking-tight mt-2 ${easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {userProfile ? t('matches.title') : t('home.heroTitle')}
          </h1>

          <p className="text-xs sm:text-sm text-[#ffd9e1] mt-1">
            {userProfile ? (
              <>
                {t('matches.subtitle')} (<strong>{userProfile.occupation || 'Citizen'}</strong>, {userProfile.district || currentStateConfig.name})
              </>
            ) : (
              t('home.heroSubtitle')
            )}
          </p>
        </div>

        <button
          id="toggle-wizard-btn"
          onClick={() => setShowWizard(!showWizard)}
          className="px-5 py-2.5 rounded-xl bg-[#c8a96b] hover:bg-[#e3c282] text-[#310a18] text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs"
        >
          <Wand2 className="w-4 h-4 text-[#310a18]" />
          <span>{showWizard ? t('common.close') : t('profile.title')}</span>
        </button>
      </div>

      {/* Adaptive Wizard if toggled */}
      {showWizard && (
        <div className="animate-fade-in">
          <AdaptiveQuestionWizard />
        </div>
      )}

      {/* If citizen has not created profile, show welcoming guidance banner */}
      {!userProfile && (
        <div className="bg-[#faf8f3] border border-[#e8e1dc] rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#4a1f2d] text-white flex items-center justify-center font-bold shrink-0 shadow-xs">
              <UserPlus className="w-6 h-6 text-[#c8a96b]" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-[#21191d]">
                {t('home.checkEligibility')}
              </h3>
              <p className="text-xs text-[#756a6f] mt-0.5 max-w-xl leading-relaxed">
                {t('home.createProfileNotice')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('profile')}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-[#4a1f2d] hover:bg-[#310a18] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
            >
              <span>{t('header.createProfile')}</span>
              <ArrowRight className="w-4 h-4 text-[#c8a96b]" />
            </button>
            <button
              onClick={() => setShowVoiceModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#faf8f3] text-[#4a1f2d] border border-[#e8e1dc] font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <span>{t('home.startVoiceBtn')?.split(' ')[0] || 'Voice'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e8e1dc] shadow-xs space-y-3.5">
        {/* Row 1: Search Bar & Reset */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#756a6f]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('matches.searchPlaceholder')}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#faf8f3] border border-[#e8e1dc] text-[#111827] placeholder-[#6b7280] focus:border-[#4a1f2d] outline-none text-xs sm:text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#756a6f] hover:text-[#21191d] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 rounded-xl bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#fcd0cb] text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 border border-[#ba1a1a]/30"
            >
              <X className="w-3.5 h-3.5" />
              <span>{t('filter.reset')}</span>
            </button>
          )}
        </div>

        {/* Row 2: Level / Jurisdiction Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-[#756a6f] flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3 text-[#4a1f2d]" />
            <span>{t('filter.type')}</span>
          </span>

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterType === 'ALL'
                ? 'bg-[#4a1f2d] text-white shadow-xs'
                : 'bg-[#faf8f3] text-[#514346] hover:bg-[#eedfe4] border border-[#e8e1dc]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('matches.filterAll')} ({sourceMatches.length})</span>
          </button>

          <button
            onClick={() => setFilterType('STATE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterType === 'STATE'
                ? 'bg-[#4a1f2d] text-white shadow-xs'
                : 'bg-[#faf8f3] text-[#514346] hover:bg-[#eedfe4] border border-[#e8e1dc]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{currentStateConfig.name} {t('filter.stateSchemes')}</span>
          </button>

          <button
            onClick={() => setFilterType('CENTRAL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterType === 'CENTRAL'
                ? 'bg-[#4a1f2d] text-white shadow-xs'
                : 'bg-[#faf8f3] text-[#514346] hover:bg-[#eedfe4] border border-[#e8e1dc]'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>{t('filter.centralSchemes')}</span>
          </button>

          {userProfile && (
            <>
              <button
                onClick={() => setFilterType('STRONG')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
                  filterType === 'STRONG'
                    ? 'bg-[#15803d] text-white shadow-xs'
                    : 'bg-[#faf8f3] text-[#514346] hover:bg-[#eedfe4] border border-[#e8e1dc]'
                }`}
              >
                <span>{t('matches.filterStrong')}</span>
              </button>

              <button
                onClick={() => setFilterType('POTENTIAL')}
                className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
                  filterType === 'POTENTIAL'
                    ? 'bg-[#b45309] text-white shadow-xs'
                    : 'bg-[#faf8f3] text-[#514346] hover:bg-[#eedfe4] border border-[#e8e1dc]'
                }`}
              >
                <span>{t('matches.filterPotential')}</span>
              </button>
            </>
          )}
        </div>

        {/* Row 3: Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-[#e8e1dc]">
          <span className="text-[11px] font-bold text-[#756a6f] mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-[#c8a96b] text-[#310a18] border-[#c8a96b] shadow-xs'
                    : 'bg-[#faf8f3] text-[#514346] border-[#e8e1dc] hover:bg-[#eedfe4]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Summary */}
      <div className="flex items-center justify-between px-1 text-xs text-[#756a6f]">
        <span>
          {t('filter.showingMatches')}: <strong>{filteredMatches.length}</strong> ({userProfile ? t('matches.title') : t('filter.availableSchemes')})
        </span>
      </div>

      {/* Scheme Cards Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((result) => (
            <SchemeCard key={result.scheme.id} matchResult={result} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#e8e1dc] text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#faf8f3] text-[#756a6f] flex items-center justify-center">
            <Inbox className="w-7 h-7 text-[#4a1f2d]" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#21191d]">
              {t('filter.noMatches')}
            </h3>
            <p className="text-xs text-[#756a6f] max-w-md mx-auto leading-relaxed">
              {t('filter.noMatchesDesc')}
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-xl bg-[#4a1f2d] hover:bg-[#310a18] text-white font-bold text-xs shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>{t('filter.reset')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
