import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { LANGUAGE_LIST, SUPPORTED_LANGUAGES } from '../data/languages';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'compact' | 'full' | 'header';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
}) => {
  const { selectedVoiceLanguageId, setSelectedVoiceLanguageId, t } = useApp();
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
    <div className={`relative inline-flex items-center gap-1.5 ${className}`} ref={dropdownRef}>
      {/* Trigger Button for All Regional Languages */}
      <button
        type="button"
        id="language-switcher-btn"
        aria-haspopup="true"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#faf8f3] hover:bg-[#eedfe4] text-[#241c20] text-xs font-bold border border-[#e8e1dc] transition-all cursor-pointer shadow-xs"
        title={t('header.selectLanguage')}
      >
        <Globe className="w-3.5 h-3.5 text-[#4a1f2d]" />
        <span className="font-bold">{currentLang.nativeName}</span>
        <span className="text-[10px] text-[#756a6f] hidden sm:inline">({currentLang.name})</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4a1f2d]/10 text-[#4a1f2d] font-bold tracking-tight">
          {LANGUAGE_LIST.length} Langs
        </span>
        <ChevronDown className={`w-3 h-3 text-[#756a6f] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu with All 12 Supported Languages */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white text-[#241c20] shadow-civic-overlay border border-[#e8e1dc] py-2 z-50 animate-fade-in divide-y divide-[#e8e1dc]">
          <div className="px-4 py-2 bg-[#faf8f3] border-b border-[#e8e1dc] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#4a1f2d] tracking-wider uppercase block">
              {t('header.selectLanguage')}
            </span>
            <span className="text-[10px] text-[#756a6f] font-semibold">
              {LANGUAGE_LIST.length} Languages
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto py-1 divide-y divide-[#faf8f3]">
            {LANGUAGE_LIST.map((lang) => {
              const isSelected = selectedVoiceLanguageId === lang.id;
              return (
                <button
                  key={lang.id}
                  type="button"
                  id={`lang-select-option-${lang.id}`}
                  onClick={() => handleSelectLanguage(lang.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-left text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#4a1f2d] text-white font-bold'
                      : 'text-[#241c20] hover:bg-[#faf8f3]'
                  }`}
                >
                  <div>
                    <span className="text-sm font-bold block">{lang.nativeName}</span>
                    <span className={`text-[11px] block ${isSelected ? 'text-white/80' : 'text-[#756a6f]'}`}>
                      {lang.name}
                    </span>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-white shrink-0 font-bold" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
