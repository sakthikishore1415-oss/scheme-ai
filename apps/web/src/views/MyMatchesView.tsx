import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchemeCard } from '../components/SchemeCard';
import { AdaptiveQuestionWizard } from '../components/AdaptiveQuestionWizard';
import { NEED_CATEGORIES } from '../data/categories';
import {
  Sparkles,
  Search,
  RotateCcw,
  Wand2,
  UserPlus,
  Inbox,
} from 'lucide-react';

export const MyMatchesView: React.FC = () => {
  const { activeMatches, userProfile, currentStateConfig, easyMode, schemesStatus, setActiveTab } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'STRONG' | 'POTENTIAL' | 'STATE' | 'CENTRAL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWizard, setShowWizard] = useState<boolean>(false);

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
      const matchBen = (res.scheme.benefits.amount || '').toLowerCase().includes(q);
      if (!matchName && !matchNative && !matchDept && !matchBen) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c5c6d0]/60 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#94f6c4]/40 text-[#00462d] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#57b98c]/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              DETERMINISTIC PROFILE MATCHES
            </span>
            <span className="text-xs text-[#757780] font-mono">
              State: {currentStateConfig.name}
            </span>
          </div>
          <h1 className={`font-bold text-[#092554] mt-1 ${easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            Eligible Schemes & Entitlements
          </h1>
          <p className="text-xs text-[#44464f] mt-0.5">
            {userProfile ? (
              <>
                Evaluated for: <strong>{userProfile.occupation || 'Unspecified'}</strong>, Age <strong>{userProfile.age || 'N/A'}</strong>, Income <strong>₹{(userProfile.annualIncome || 0).toLocaleString('en-IN')}</strong> in <strong>{userProfile.district || currentStateConfig.name}</strong>.
              </>
            ) : (
              'Complete your profile to discover schemes you qualify for.'
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
          <span>{showWizard ? 'HIDE WIZARD' : 'OPEN STEP WIZARD'}</span>
        </button>
      </div>

      {/* Adaptive Wizard if toggled */}
      {showWizard && (
        <div className="animate-fade-in">
          <AdaptiveQuestionWizard />
        </div>
      )}

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#c5c6d0]/60 shadow-soft space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#757780] absolute left-3.5 top-3" />
            <input
              id="matches-search-input"
              type="text"
              placeholder="Search scheme name, department, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#f8f9fb] rounded-xl border border-[#c5c6d0]/60 text-xs font-medium focus:bg-white focus:border-[#092554] focus:outline-none transition-all"
            />
          </div>

          {/* Level Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {(['ALL', 'STRONG', 'POTENTIAL', 'STATE', 'CENTRAL'] as const).map((lvl) => (
              <button
                key={lvl}
                id={`filter-lvl-${lvl.toLowerCase()}`}
                onClick={() => setFilterType(lvl)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                  filterType === lvl
                    ? 'bg-[#092554] text-white shadow-xs'
                    : 'bg-[#f2f4f6] text-[#44464f] hover:bg-[#edeef0]'
                }`}
              >
                {lvl === 'ALL'
                  ? 'All'
                  : lvl === 'STRONG'
                  ? 'Strong Match'
                  : lvl === 'POTENTIAL'
                  ? 'Potential'
                  : lvl === 'STATE'
                  ? 'State Schemes'
                  : 'Central Schemes'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#092554] text-white'
                : 'bg-[#f2f4f6] text-[#44464f] hover:bg-[#edeef0]'
            }`}
          >
            All Sectors
          </button>
          {NEED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                selectedCategory === cat.id
                  ? 'bg-[#092554] text-white'
                  : 'bg-[#f2f4f6] text-[#44464f] hover:bg-[#edeef0]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scheme Cards Output Grid */}
      {!userProfile ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#c5c6d0]/60 text-center space-y-4 shadow-soft">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#d9e2ff] text-[#092554] flex items-center justify-center font-bold">
            <UserPlus className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-[#092554]">
              No scheme matches yet. Complete your profile to discover schemes.
            </h3>
            <p className="text-xs text-[#44464f] max-w-md mx-auto leading-relaxed">
              Arivom Thittam evaluates official government criteria deterministically against your verified demographic information.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="px-6 py-3 rounded-2xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>CREATE CITIZEN PROFILE</span>
          </button>
        </div>
      ) : filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((res) => (
            <SchemeCard key={res.scheme.id} matchResult={res} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 sm:p-12 border border-[#c5c6d0]/60 text-center space-y-3 shadow-soft">
          <Inbox className="w-10 h-10 mx-auto text-[#757780]" />
          <h3 className="text-base font-bold text-[#191c1e]">
            {schemesStatus === 'NO_DATA'
              ? 'No government schemes loaded from connected repository.'
              : 'No matching schemes found for the selected criteria.'}
          </h3>
          <p className="text-xs text-[#44464f] max-w-md mx-auto">
            {schemesStatus === 'NO_DATA'
              ? 'Connect a live government scheme database or API endpoint to evaluate entitlements.'
              : 'Try clearing your search query or selecting "All Sectors".'}
          </p>
          {(filterType !== 'ALL' || selectedCategory !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setFilterType('ALL');
                setSelectedCategory('ALL');
                setSearchQuery('');
              }}
              className="mt-2 px-4 py-2 rounded-xl bg-[#f2f4f6] hover:bg-[#edeef0] text-[#191c1e] font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
