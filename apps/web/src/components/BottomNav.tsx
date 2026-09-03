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
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8e1dc] px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom),0.5rem)] shadow-lg ${
          easyMode ? 'pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)]' : ''
        }`}
      >
        <div className="flex items-center justify-around max-w-md mx-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            if (tab.isPrimaryVoice) {
              return (
                <button
                  key={tab.id}
                  id="mobile-nav-ask-btn"
                  onClick={() => setShowVoiceModal(true)}
                  className="-mt-6 flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition-transform"
                >
                  <div className="w-14 h-14 rounded-full bg-[#4a1f2d] text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-[#ffd9e1]/80 group-hover:bg-[#6b3548] transition-colors">
                    <Mic className="w-6 h-6 text-[#c8a96b]" />
                  </div>
                  <span className="text-[10px] font-black text-[#4a1f2d] mt-1 tracking-wider uppercase">
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
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all cursor-pointer ${
                  isActive
                    ? 'text-[#4a1f2d] font-bold bg-[#ffd9e1]/40'
                    : 'text-[#756a6f] hover:text-[#241c20]'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-[#4a1f2d] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-tight mt-0.5 max-w-[68px] truncate ${isActive ? 'font-bold text-[#4a1f2d]' : 'font-medium'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <span className="w-4 h-0.5 bg-[#4a1f2d] rounded-full mt-0.5"></span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sticky Sub-Navigation */}
      <aside
        aria-label="Desktop Sidebar Navigation"
        className="hidden md:flex fixed top-20 left-6 z-30 flex-col gap-2 p-3 bg-white rounded-2xl border border-[#e8e1dc] shadow-sm w-56"
      >
        <div className="px-3 py-1.5 border-b border-[#e8e1dc] mb-1">
          <span className="text-[10px] font-bold tracking-widest text-[#756a6f] uppercase">
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
                    ? 'bg-[#4a1f2d] text-white font-bold shadow-xs'
                    : 'text-[#514346] hover:bg-[#faf8f3] hover:text-[#241c20]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-[#c8a96b]' : 'text-[#756a6f]'}>
                    {tab.icon}
                  </span>
                  <span className="text-xs font-bold block">{tab.label}</span>
                </div>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-[#c8a96b] text-[#310a18]' : 'bg-[#faf8f3] text-[#756a6f] border border-[#e8e1dc]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}

        <div className="pt-2 border-t border-[#e8e1dc] mt-1">
          <button
            id="desktop-nav-voice-btn"
            onClick={() => setShowVoiceModal(true)}
            className="w-full p-3 rounded-xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer border border-[#e8e1dc]"
          >
            <Mic className="w-4 h-4 text-[#c8a96b]" />
            <div className="text-left">
              <span className="block text-xs font-bold">
                {t('home.startVoiceBtn')}
              </span>
              <span className="block text-[9px] text-[#ffd9e1] uppercase tracking-wider">
                {t('home.talkToAssistant')}
              </span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
};
