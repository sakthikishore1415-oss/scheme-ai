import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGE_LIST, SUPPORTED_LANGUAGES } from '../data/languages';
import { Globe, Check, Sparkles, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full' | 'header';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { selectedVoiceLanguageId, setSelectedVoiceLanguageId } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang = SUPPORTED_LANGUAGES[selectedVoiceLanguageId] || SUPPORTED_LANGUAGES['ta'];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectLanguage = (langId: string) => {
    setSelectedVoiceLanguageId(langId);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        id="language-switcher-btn"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-800 hover:text-emerald-900 text-xs font-bold border border-slate-200 hover:border-emerald-300 transition-all cursor-pointer shadow-2xs"
        title="Switch Language / மொழி தேர்வு"
      >
        <Globe className="w-3.5 h-3.5 text-emerald-700" />
        <span className="font-extrabold">{currentLang.nativeName}</span>
        <span className="text-slate-400 text-[10px] hidden sm:inline">({currentLang.name})</span>
        <ChevronDown className={`w-3 h-3 text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-slate-500 tracking-wider uppercase">
              SELECT LANGUAGE / மொழி
            </span>
            <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
              <Sparkles className="w-2.5 h-2.5" /> Auto-Detect Active
            </span>
          </div>

          <div className="max-h-72 overflow-y-auto py-1 divide-y divide-slate-50">
            {LANGUAGE_LIST.map((lang) => {
              const isSelected = selectedVoiceLanguageId === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-900'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{lang.nativeName}</span>
                    <span className={`text-[11px] ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {lang.name}
                    </span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
