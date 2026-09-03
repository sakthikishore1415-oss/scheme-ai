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
        className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#092554] hover:bg-[#133873] text-white text-xs font-bold border border-[#90a6dd]/40 transition-all cursor-pointer shadow-sm"
        title="Switch Language / மொழி தேர்வு"
      >
        <Globe className="w-4 h-4 text-[#fea619]" />
        <span className="font-extrabold">{currentLang.nativeName}</span>
        <span className="text-[#d9e2ff] text-[11px]">/ {currentLang.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[#94f6c4] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-[#092554] text-white shadow-2xl border border-[#90a6dd]/40 py-2 z-50 animate-fade-in divide-y divide-white/10">
          <div className="px-4 py-2 border-b border-white/10 flex items-center justify-between">
            <span className="text-[10px] font-extrabold text-[#94f6c4] tracking-wider uppercase">
              SELECT LANGUAGE / மொழி தேர்வு
            </span>
            <span className="flex items-center gap-1 text-[10px] text-[#fea619] bg-white/10 px-2 py-0.5 rounded-full font-bold">
              <Sparkles className="w-2.5 h-2.5" /> 12 Indian Languages
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto py-1 divide-y divide-white/5">
            {LANGUAGE_LIST.map((lang) => {
              const isSelected = selectedVoiceLanguageId === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  onClick={() => handleSelectLanguage(lang.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#fea619] text-[#092554] font-bold shadow-xs'
                      : 'text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-bold">{lang.nativeName}</span>
                    <span className={`text-xs ${isSelected ? 'text-[#092554]/80' : 'text-[#d9e2ff]/70'}`}>
                      / {lang.name}
                    </span>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-[#092554] shrink-0 font-bold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
