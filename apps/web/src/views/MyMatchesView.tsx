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
} from 'lucide-react';

export const MyMatchesView: React.FC = () => {
  const { activeMatches, userProfile, currentStateConfig, easyMode, setActiveTab, t } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'STRONG' | 'POTENTIAL' | 'STATE' | 'CENTRAL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWizard, setShowWizard] = useState<boolean>(false);

  const categories = [
    { id: 'ALL', label: 'All Categories' },
    { id: 'agriculture', label: '🌾 Agriculture' },
    { id: 'education', label: '🎓 Education' },
    { id: 'housing', label: '🏡 Housing' },
    { id: 'health', label: '🏥 Health' },
    { id: 'women', label: '👩 Women' },
    { id: 'senior_citizens', label: '👵 Senior Citizens' },
    { id: 'employment', label: '💼 Employment' },
    { id: 'business', label: '💰 Business & Loans' },
    { id: 'disability', label: '♿ Disability' },
  ];

  // Apply filters
  const filteredMatches = activeMatches.filter((res) => {
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
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c5c6d0]/60 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#94f6c4]/40 text-[#00462d] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#57b98c]/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              {t('matches.title')}
            </span>
            <span className="text-xs text-[#757780] font-mono">
              📍 {currentStateConfig.name}
            </span>
          </div>

          <h1 className={`font-black text-[#092554] tracking-tight mt-1.5 ${easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            {t('matches.title')}
          </h1>

          <p className="text-xs text-[#44464f] mt-1">
            {userProfile ? (
              <>
                {t('matches.subtitle')} (<strong>{userProfile.occupation || 'Citizen'}</strong>, {userProfile.district || currentStateConfig.name})
              </>
            ) : (
              t('profile.subtitle')
            )}
          </p>
        </div>

        <button
          id="toggle-wizard-btn"
          onClick={() => setShowWizard(!showWizard)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            showWizard
              ? 'bg-[#092554] text-white'
              : 'bg-[#d9e2ff] text-[#001944] border border-[#b0c6ff] hover:bg-[#b0c6ff]'
          }`}
        >
          <Wand2 className="w-4 h-4 text-[#092554]" />
          <span>{showWizard ? t('common.close') : t('profile.title')}</span>
        </button>
      </div>

      {/* Adaptive Wizard if toggled */}
      {showWizard && (
        <div className="animate-fade-in">
          <AdaptiveQuestionWizard />
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#c5c6d0]/60 shadow-soft space-y-3.5">
        {/* Row 1: Search Bar & Reset */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#757780]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('matches.searchPlaceholder')}
              className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-[#f2f3fa] border border-[#c5c6d0]/60 text-xs text-[#191c1e] placeholder-[#757780] focus:border-[#092554] outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-[#757780] hover:text-[#191c1e] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1 border border-rose-200"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        {/* Row 2: Level / Jurisdiction Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-[#757780] flex items-center gap-1 mr-1 shrink-0">
            <Filter className="w-3 h-3" />
            <span>Type:</span>
          </span>

          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterType === 'ALL'
                ? 'bg-[#092554] text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#44464f] hover:bg-[#e1e2ec]'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Schemes ({activeMatches.length})</span>
          </button>

          <button
            onClick={() => setFilterType('STATE')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterType === 'STATE'
                ? 'bg-[#00462d] text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#44464f] hover:bg-[#e1e2ec]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>{currentStateConfig.name} State Schemes</span>
          </button>

          <button
            onClick={() => setFilterType('CENTRAL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
              filterType === 'CENTRAL'
                ? 'bg-[#684000] text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#44464f] hover:bg-[#e1e2ec]'
            }`}
          >
            <Landmark className="w-3.5 h-3.5" />
            <span>Central Government Schemes</span>
          </button>

          <button
            onClick={() => setFilterType('STRONG')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              filterType === 'STRONG'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#44464f] hover:bg-[#e1e2ec]'
            }`}
          >
            <span>{t('matches.filterStrong')}</span>
          </button>

          <button
            onClick={() => setFilterType('POTENTIAL')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              filterType === 'POTENTIAL'
                ? 'bg-amber-700 text-white shadow-xs'
                : 'bg-[#f2f3fa] text-[#44464f] hover:bg-[#e1e2ec]'
            }`}
          >
            <span>{t('matches.filterPotential')}</span>
          </button>
        </div>

        {/* Row 3: Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs pt-1 border-t border-[#e1e2ec]">
          <span className="text-[11px] font-bold text-[#757780] mr-1 shrink-0">
            Category:
          </span>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer shrink-0 border ${
                  isSelected
                    ? 'bg-[#fea619] text-[#092554] border-[#fea619] font-bold shadow-xs'
                    : 'bg-[#f2f3fa] text-[#44464f] border-[#c5c6d0]/40 hover:bg-[#e1e2ec]'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header Summary */}
      <div className="flex items-center justify-between px-1 text-xs text-[#757780]">
        <span>
          Showing <strong>{filteredMatches.length}</strong> matching schemes
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
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#c5c6d0]/60 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#f2f3fa] text-[#757780] flex items-center justify-center">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-black text-[#191c1e]">
              No schemes match your filter
            </h3>
            <p className="text-xs text-[#757780] max-w-md mx-auto leading-relaxed">
              Try adjusting your category, keyword search, or resetting filters to view all available schemes.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-2xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <span>Reset All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};
