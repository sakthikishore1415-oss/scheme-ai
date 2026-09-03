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
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  const strongMatchesCount = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length;

  const desktopTabs: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number; description?: string }[] = [
    { id: 'home', label: t('nav.home'), icon: <Home className="w-4 h-4 shrink-0" />, description: 'Overview' },
    {
      id: 'matches',
      label: t('nav.matches'),
      icon: <Sparkles className="w-4 h-4 shrink-0" />,
      badge: strongMatchesCount,
      description: 'Eligible Schemes',
    },
    {
      id: 'saved',
      label: t('nav.saved'),
      icon: <Bookmark className="w-4 h-4 shrink-0" />,
      badge: savedSchemeIds.length > 0 ? savedSchemeIds.length : undefined,
      description: 'Bookmarks Locker',
    },
    { id: 'profile', label: t('nav.profile'), icon: <User className="w-4 h-4 shrink-0" />, description: 'Demographics' },
    { id: 'button_phone', label: '1800 IVR Flow', icon: <PhoneCall className="w-4 h-4 shrink-0" />, description: 'Feature Phone' },
    { id: 'assisted', label: 'Assisted CSC', icon: <Handshake className="w-4 h-4 shrink-0" />, description: 'Operator Portal' },
  ];

  return (
    <aside
      aria-label="Desktop Dynamic Sidebar Navigation"
      className={`hidden md:flex flex-col gap-1.5 p-2.5 bg-white rounded-3xl border border-[#e8e1dc] shadow-xs sticky top-24 self-start my-6 ml-3 transition-all duration-300 ease-in-out shrink-0 z-30 ${
        isExpanded ? 'w-56' : 'w-16 items-center'
      }`}
    >
      {/* Dynamic Expand / Collapse Header */}
      <div className="flex items-center justify-between w-full px-1.5 py-1 mb-1">
        {isExpanded && (
          <span className="text-[10px] font-black tracking-widest text-[#756a6f] uppercase truncate animate-fade-in">
            Navigation
          </span>
        )}
        <button
          type="button"
          id="sidebar-dynamic-toggle-btn"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1.5 rounded-xl hover:bg-[#faf8f3] text-[#756a6f] hover:text-[#21191d] transition-colors cursor-pointer ${
            !isExpanded ? 'mx-auto' : ''
          }`}
          title={isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span className="text-xs font-bold">{isExpanded ? '◀' : '▶'}</span>
        </button>
      </div>

      {/* Voice Assistant Action Button */}
      <button
        type="button"
        id="desktop-sidebar-voice-btn"
        onClick={() => setShowVoiceModal(true)}
        className={`rounded-2xl bg-[#4a1f2d] hover:bg-[#6b3548] text-white flex items-center transition-all active:scale-95 cursor-pointer shadow-xs group relative ${
          isExpanded
            ? 'w-full p-2.5 px-3 justify-start gap-2.5'
            : 'w-11 h-11 justify-center mb-1'
        }`}
        title="Open Voice Assistant"
      >
        <Mic className="w-5 h-5 text-[#c8a96b] shrink-0" />
        {isExpanded ? (
          <div className="text-left leading-tight truncate animate-fade-in">
            <span className="block text-xs font-bold text-white">Voice Assistant</span>
            <span className="block text-[9px] text-[#ffd9e1]">Tap to Speak</span>
          </div>
        ) : (
          <span className="absolute left-full ml-3 px-2 py-1 bg-[#21191d] text-white text-[10px] font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            Voice Assistant
          </span>
        )}
      </button>

      <div className={`h-px bg-[#e8e1dc] my-1 ${isExpanded ? 'w-full' : 'w-8'}`}></div>

      {/* Dynamic Nav Items */}
      <div className="flex flex-col gap-1 w-full">
        {desktopTabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              id={`desktop-sidebar-${tab.id}-btn`}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-2xl flex items-center transition-all cursor-pointer relative group ${
                isExpanded
                  ? `w-full p-2 px-3 justify-between ${
                      isActive
                        ? 'bg-[#4a1f2d] text-white shadow-xs font-bold'
                        : 'text-[#514346] hover:bg-[#faf8f3] hover:text-[#21191d]'
                    }`
                  : `w-11 h-11 justify-center ${
                      isActive
                        ? 'bg-[#4a1f2d] text-white shadow-xs'
                        : 'text-[#756a6f] hover:text-[#21191d] hover:bg-[#faf8f3]'
                    }`
              }`}
              title={tab.label}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <span className={isActive ? 'text-[#c8a96b]' : 'text-[#756a6f]'}>
                  {tab.icon}
                </span>
                {isExpanded && (
                  <div className="text-left leading-tight truncate animate-fade-in">
                    <span className="block text-xs font-bold truncate">{tab.label}</span>
                    <span className={`block text-[9px] truncate ${isActive ? 'text-[#ffd9e1]' : 'text-[#756a6f]'}`}>
                      {tab.description}
                    </span>
                  </div>
                )}
              </div>

              {/* Badge Indicator */}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  className={`${
                    isExpanded
                      ? `text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isActive ? 'bg-[#c8a96b] text-[#310a18]' : 'bg-[#faf8f3] text-[#756a6f] border border-[#e8e1dc]'
                        }`
                      : 'absolute top-1.5 right-1.5 bg-[#c8a96b] text-[#310a18] text-[9px] font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center'
                  }`}
                >
                  {tab.badge}
                </span>
              )}

              {/* Hover Tooltip (Only when collapsed) */}
              {!isExpanded && (
                <span className="absolute left-full ml-3 px-2.5 py-1 bg-[#21191d] text-white text-xs font-bold rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
