import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Mic,
  Sparkles,
  Bookmark,
  User,
} from 'lucide-react';
import { ViewTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setShowVoiceModal, activeMatches, savedSchemeIds, easyMode, t } =
    useApp();

  const strongMatchesCount = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length;

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number; isPrimaryVoice?: boolean }[] = [
    { id: 'home', label: t('nav.home'), icon: <Home className="w-5 h-5" /> },
    {
      id: 'ask',
      label: t('nav.voice'),
      icon: <Mic className="w-6 h-6 text-white" />,
      isPrimaryVoice: true,
    },
    {
      id: 'matches',
      label: t('nav.matches'),
      icon: <Sparkles className="w-5 h-5" />,
      badge: strongMatchesCount,
    },
    {
      id: 'saved',
      label: t('nav.saved'),
      icon: <Bookmark className="w-5 h-5" />,
      badge: savedSchemeIds.length > 0 ? savedSchemeIds.length : undefined,
    },
    { id: 'profile', label: t('nav.profile'), icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Floating Bottom Bar */}
      <nav
        aria-label="Mobile Navigation Bar"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-[#c5c6d0]/60 px-2 py-1 shadow-lg ${
          easyMode ? 'py-2.5' : 'py-1'
        }`}
      >
        <div className="flex items-center justify-around">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            if (tab.isPrimaryVoice) {
              return (
                <button
                  key={tab.id}
                  id="mobile-nav-ask-btn"
                  onClick={() => setShowVoiceModal(true)}
                  className="-mt-5 flex flex-col items-center justify-center cursor-pointer group"
                >
                  <div className="w-13 h-13 rounded-full bg-[#092554] text-white flex items-center justify-center shadow-lg shadow-[#092554]/30 group-hover:scale-105 transition-transform">
                    {tab.icon}
                  </div>
                  <span className="text-[10px] font-extrabold text-[#092554] mt-0.5 tracking-wider">
                    {tab.label}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={tab.id}
                id={`mobile-nav-${tab.id}-btn`}
                onClick={() => setActiveTab(tab.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-[#092554] font-bold' : 'text-[#757780] hover:text-[#191c1e]'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#fea619] text-[#684000] text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[11px] tracking-tight mt-0.5 max-w-[75px] truncate ${isActive ? 'font-bold text-[#092554]' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-5 h-0.5 bg-[#fea619] rounded-full mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sticky Sub-Navigation */}
      <aside
        aria-label="Desktop Sidebar Navigation"
        className="hidden md:flex fixed top-20 left-6 z-30 flex-col gap-2 p-3 bg-white/90 backdrop-blur-md rounded-2xl border border-[#c5c6d0]/60 shadow-md w-56"
      >
        <div className="px-3 py-1.5 border-b border-[#e1e2ec] mb-1">
          <span className="text-[10px] font-bold tracking-widest text-[#757780] uppercase">
            {t('header.title')}
          </span>
        </div>

        {tabs
          .filter((t) => !t.isPrimaryVoice)
          .map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`desktop-nav-${tab.id}-btn`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-between p-2.5 px-3 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#092554] text-white font-bold shadow-sm'
                    : 'text-[#44474f] hover:bg-[#f2f3fa] hover:text-[#191c1e]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#fea619]' : 'text-[#757780]'}>
                    {tab.icon}
                  </span>
                  <span className="text-xs font-bold block">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#fea619] text-[#684000]' : 'bg-[#e1e2ec] text-[#44474f]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

        <div className="pt-2 border-t border-[#e1e2ec] mt-1">
          <button
            id="desktop-nav-voice-btn"
            onClick={() => setShowVoiceModal(true)}
            className="w-full p-3 rounded-xl bg-linear-to-tr from-[#00462d] to-[#002d1c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition-opacity cursor-pointer border border-[#94f6c4]/40"
          >
            <Mic className="w-4 h-4 text-[#fea619] animate-pulse" />
            <div className="text-left">
              <span className="block text-xs font-bold">
                {t('home.startVoiceBtn')}
              </span>
              <span className="block text-[9px] text-[#94f6c4] uppercase tracking-wider">
                {t('home.talkToAssistant')}
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
