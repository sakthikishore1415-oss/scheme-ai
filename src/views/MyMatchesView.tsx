import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SchemeCard } from '../components/SchemeCard';
import { AdaptiveQuestionWizard } from '../components/AdaptiveQuestionWizard';
import { NEED_CATEGORIES } from '../data/categories';
import {
  Sparkles,
  Filter,
  Search,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Layers,
  Wand2,
} from 'lucide-react';

export const MyMatchesView: React.FC = () => {
  const { activeMatches, userProfile, currentStateConfig, easyMode } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'STRONG' | 'POTENTIAL' | 'STATE' | 'CENTRAL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showWizard, setShowWizard] = useState<boolean>(false);

  // Apply filters
  const filteredMatches = activeMatches.filter((res) => {
    // 1. Level filter
    if (filterType === 'STRONG' && res.matchLevel !== 'STRONG') return false;
    if (filterType === 'POTENTIAL' && res.matchLevel !== 'POTENTIAL') return false;
    if (filterType === 'STATE' && res.scheme.stateId === 'ALL') return false;
    if (filterType === 'CENTRAL' && res.scheme.stateId !== 'ALL') return false;

    // 2. Category filter
    if (selectedCategory !== 'ALL' && res.scheme.category !== selectedCategory) return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = res.scheme.name.toLowerCase().includes(q);
      const matchNative = res.scheme.nativeName?.toLowerCase().includes(q) || false;
      const matchDept = res.scheme.department.toLowerCase().includes(q);
      const matchBen = (res.scheme.benefits.amount || '').toLowerCase().includes(q);
      if (!matchName && !matchNative && !matchDept && !matchBen) return false;
    }

    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold border border-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              DETERMINISTIC PROFILE MATCHES
            </span>
            <span className="text-xs text-slate-500 font-mono">
              State: {currentStateConfig.name}
            </span>
          </div>
          <h1 className={`font-black text-slate-900 mt-1 ${easyMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'}`}>
            Eligible Schemes & Entitlements
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Evaluated for: <strong>{userProfile.occupation}</strong>, Age <strong>{userProfile.age}</strong>, Income <strong>₹{userProfile.annualIncome.toLocaleString('en-IN')}</strong> in <strong>{userProfile.district || currentStateConfig.name}</strong>.
          </p>
        </div>

        <button
          id="toggle-wizard-btn"
          onClick={() => setShowWizard(!showWizard)}
          className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
            showWizard
              ? 'bg-slate-800 text-white'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100'
          }`}
        >
          <Wand2 className="w-4 h-4 text-emerald-600" />
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
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              id="matches-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scheme name, department or benefit amount..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>

          {/* Quick Filter Pill Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto text-xs font-semibold">
            {[
              { id: 'ALL', label: `All (${activeMatches.length})` },
              { id: 'STRONG', label: `Strong Match (≥80%)` },
              { id: 'POTENTIAL', label: `Potential` },
              { id: 'STATE', label: `${currentStateConfig.name} Only` },
              { id: 'CENTRAL', label: `Central Govt` },
            ].map((f) => (
              <button
                key={f.id}
                id={`filter-btn-${f.id}`}
                onClick={() => setFilterType(f.id as any)}
                className={`px-3 py-2 rounded-xl shrink-0 transition-all cursor-pointer ${
                  filterType === f.id
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-emerald-600 text-white font-bold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All Categories
          </button>
          {NEED_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg shrink-0 transition-colors cursor-pointer flex items-center gap-1 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Matches Grid */}
      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMatches.map((result) => (
            <SchemeCard key={result.scheme.id} matchResult={result} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 space-y-3">
          <HelpCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Matching Schemes Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try clearing your search query or selecting a broader category filter.
          </p>
          <button
            onClick={() => {
              setFilterType('ALL');
              setSelectedCategory('ALL');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs cursor-pointer"
          >
            RESET ALL FILTERS
          </button>
        </div>
      )}
    </div>
  );
};
