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
  const { activeMatches, userProfile, currentStateConfig, easyMode, schemesStatus, setActiveTab, uiStrings, selectedVoiceLanguageId } = useApp();

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
      {/* Header Bar with Dual-Language */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c5c6d0]/60 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-[#94f6c4]/40 text-[#00462d] text-xs px-2.5 py-0.5 rounded-full font-bold border border-[#57b98c]/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              DETERMINISTIC PROFILE MATCHES
            </span>
            <span className="text-xs text-[#757780] font-mono">
              📍 {currentStateConfig.name}
            </span>
          </div>

          <div className="space-y-0.5 mt-1.5">
            <h1 className={`font-black text-[#092554] tracking-tight ${easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
              {uiStrings.matchesHeading}
            </h1>
            {selectedVoiceLanguageId !== 'en' && (
              <p className="text-xs font-bold text-[#757780] uppercase tracking-wider">
                Eligible Schemes & Entitlements
              </p>
            )}
          </div>

          <p className="text-xs text-[#44464f] mt-1">
            {userProfile ? (
              <>
                {uiStrings.matchesSubheading} (<strong>{userProfile.occupation || 'Citizen'}</strong>, {userProfile.district || currentStateConfig.name})
              </>
            ) : (
              uiStrings.profileSubheading
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
          <span>{showWizard ? 'HIDE WIZARD' : 'STEP-BY-STEP QUESTIONS'}</span>
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
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#757780]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, department, or benefits..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#f2f3fa] border border-[#c5c6d0]/60 text-xs text-[#191c1e] placeholder-[#757780] focus:border-[#092554] outline-none"
            />
          </div>

          {/* Level Filter Tabs */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                filterType === 'ALL'
                  ? 'bg-[#092554] text-white'
                  : 'bg-[#f2f3fa] text-[#44464f] hover:bg-[#e1e2ec]'
              }`}
            >
              All ({activeMatches.length})
            </button>
            <button
              onClick={() => setFilterType('STRONG')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                filterType === 'STRONG'
                  ? 'bg-[#00462d] text-white'
                  : 'bg-[#f2f3fa] text-[#44464f] hover:bg-[#e1e2ec]'
              }`}
            >
              {uiStrings.strongMatchesBadge}
            </button>
            <button
              onClick={() => setFilterType('POTENTIAL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                filterType === 'POTENTIAL'
                  ? 'bg-[#684000] text-white'
                  : 'bg-[#f2f3fa] text-[#44464f] hover:bg-[#e1e2ec]'
              }`}
            >
              {uiStrings.potentialMatchesBadge}
            </button>
          </div>
        </div>
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
              {uiStrings.noMatchesFound}
            </h3>
            <p className="text-xs text-[#757780] max-w-md mx-auto leading-relaxed">
              {uiStrings.noMatchesDesc}
            </p>
          </div>
          <button
            onClick={() => setActiveTab('profile')}
            className="px-6 py-3 rounded-2xl bg-[#092554] hover:bg-[#243b6b] text-white font-bold text-xs shadow-md transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>UPDATE PROFILE DETAILS</span>
          </button>
        </div>
      )}
    </div>
  );
};
