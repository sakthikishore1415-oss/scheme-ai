import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Mic,
  Sparkles,
  Bookmark,
  User,
  PhoneCall,
  Handshake,
  Cpu,
} from 'lucide-react';
import { ViewTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setShowVoiceModal, activeMatches, savedSchemeIds, t } =
    useApp();

  const strongMatchesCount = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length;

  const mobileTabs: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number; isPrimaryVoice?: boolean }[] = [
    { id: 'home', label: t('nav.home'), icon: <Home className="w-4 h-4" /> },
    {
      id: 'ask',
      label: t('nav.voice'),
      icon: <Mic className="w-5 h-5 text-[#c8a96b]" />,
      isPrimaryVoice: true,
    },
    {
      id: 'matches',
      label: t('nav.matches'),
      icon: <Sparkles className="w-4 h-4" />,
      badge: strongMatchesCount,
    },
    {
      id: 'saved',
      label: t('nav.saved'),
      icon: <Bookmark className="w-4 h-4" />,
      badge: savedSchemeIds.length > 0 ? savedSchemeIds.length : undefined,
    },
    { id: 'profile', label: t('nav.profile'), icon: <User className="w-4 h-4" /> },
  ];

  return (
    <nav
      aria-label="Mobile Navigation Bar"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8e1dc] px-2 py-1 pb-[max(env(safe-area-inset-bottom),0.35rem)] shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {mobileTabs.map((tab) => {
          const isActive = activeTab === tab.id;

          if (tab.isPrimaryVoice) {
            return (
              <button
                key={tab.id}
                id="mobile-nav-ask-btn"
                onClick={() => setShowVoiceModal(true)}
                className="flex flex-col items-center justify-center p-1 cursor-pointer group active:scale-95 transition-transform"
                title={tab.label}
              >
                <div className="w-10 h-10 rounded-full bg-[#4a1f2d] text-white flex items-center justify-center shadow-md border-2 border-white ring-2 ring-[#ffd9e1] group-hover:bg-[#6b3548] transition-colors">
                  <Mic className="w-4 h-4 text-[#c8a96b]" />
                </div>
                <span className="text-[9px] font-bold text-[#4a1f2d] mt-0.5 tracking-tight">
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
                isActive
                  ? 'text-[#4a1f2d] font-bold bg-[#eedfe4]'
                  : 'text-[#756a6f] hover:text-[#21191d]'
              }`}
            >
              <div className="relative">
                {tab.icon}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1 -right-2 bg-[#4a1f2d] text-white text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] tracking-tight mt-0.5 max-w-[56px] truncate ${isActive ? 'font-bold text-[#4a1f2d]' : 'font-medium'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export const DesktopSidebar: React.FC = () => {
  const { activeTab, setActiveTab, setShowVoiceModal, activeMatches, savedSchemeIds, t } =
    useApp();

  const strongMatchesCount = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length;

  const desktopTabs: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: t('nav.home'), icon: <Home className="w-4 h-4" /> },
    {
      id: 'matches',
      label: t('nav.matches'),
      icon: <Sparkles className="w-4 h-4" />,
      badge: strongMatchesCount,
    },
    {
      id: 'saved',
      label: t('nav.saved'),
      icon: <Bookmark className="w-4 h-4" />,
      badge: savedSchemeIds.length > 0 ? savedSchemeIds.length : undefined,
    },
    { id: 'profile', label: t('nav.profile'), icon: <User className="w-4 h-4" /> },
    { id: 'button_phone', label: '1800 IVR', icon: <PhoneCall className="w-4 h-4" /> },
    { id: 'assisted', label: 'Assisted CSC', icon: <Handshake className="w-4 h-4" /> },
    { id: 'architecture', label: 'Architecture', icon: <Cpu className="w-4 h-4" /> },
  ];

  return (
    <aside
      aria-label="Desktop Sidebar Navigation"
      className="hidden md:flex flex-col items-center gap-1.5 py-4 px-2 bg-white rounded-3xl border border-[#e8e1dc] shadow-xs w-16 shrink-0 sticky top-24 self-start my-6 ml-3"
    >
      {/* Voice Assistant Minimized Action Pill */}
      <button
        type="button"
        id="desktop-sidebar-voice-btn"
        onClick={() => setShowVoiceModal(true)}
        className="w-11 h-11 rounded-2xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white flex items-center justify-center shadow-xs transition-transform active:scale-95 cursor-pointer mb-2 group relative"
        title="Open Voice Assistant"
      >
        <Mic className="w-5 h-5 text-[#c8a96b]" />
        <span className="absolute left-full ml-3 px-2 py-1 bg-[#21191d] text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
          Voice Assistant
        </span>
      </button>

      <div className="w-8 h-px bg-[#e8e1dc] mb-1"></div>

      {/* Minimized Icon Navigation Rail */}
      {desktopTabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            id={`desktop-sidebar-${tab.id}-btn`}
            onClick={() => setActiveTab(tab.id)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative group ${
              isActive
                ? 'bg-[#4a1f2d] text-white shadow-xs'
                : 'text-[#756a6f] hover:text-[#21191d] hover:bg-[#faf8f3]'
            }`}
            title={tab.label}
          >
            <span className={isActive ? 'text-[#c8a96b]' : 'text-[#756a6f]'}>
              {tab.icon}
            </span>

            {/* Badge Indicator */}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[#c8a96b] text-[#310a18] text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {tab.badge}
              </span>
            )}

            {/* Hover Tooltip (Appears to the right, never overlaps navigation) */}
            <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#21191d] text-white text-xs font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
              {tab.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
};
