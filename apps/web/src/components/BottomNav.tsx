import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Mic,
  Sparkles,
  Bookmark,
  User,
  PhoneCall,
  MessageSquare,
  Users,
  Handshake,
  Cpu,
  Search,
} from 'lucide-react';
import { ViewTab } from '../types';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, setShowVoiceModal, activeMatches, savedSchemeIds, easyMode } =
    useApp();

  const strongMatchesCount = activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length;

  const tabs: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number; isPrimaryVoice?: boolean }[] = [
    { id: 'home', label: 'HOME', icon: <Home className="w-5 h-5" /> },
    {
      id: 'ask',
      label: 'ASK',
      icon: <Mic className="w-6 h-6 text-white" />,
      isPrimaryVoice: true,
    },
    {
      id: 'matches',
      label: 'MY MATCHES',
      icon: <Sparkles className="w-5 h-5" />,
      badge: strongMatchesCount,
    },
    {
      id: 'saved',
      label: 'SAVED',
      icon: <Bookmark className="w-5 h-5" />,
      badge: savedSchemeIds.length > 0 ? savedSchemeIds.length : undefined,
    },
    { id: 'profile', label: 'PROFILE', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Floating Bottom Bar */}
      <nav
        aria-label="Mobile Navigation Bar"
        className={`md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-2 py-1 shadow-lg ${
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
                  <div className="w-13 h-13 rounded-full bg-linear-to-tr from-emerald-700 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/30 group-hover:scale-105 transition-transform">
                    {tab.icon}
                  </div>
                  <span className="text-[10px] font-extrabold text-emerald-800 mt-0.5 tracking-wider">
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
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all cursor-pointer ${
                  isActive ? 'text-emerald-700 font-bold' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  {tab.icon}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border-2 border-white">
                      {tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] tracking-wider mt-0.5 ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Desktop Secondary Navigation Bar */}
      <div className="hidden md:block bg-slate-900 border-b border-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              id="desktop-nav-home"
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'home' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              id="desktop-nav-matches"
              onClick={() => setActiveTab('matches')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'matches' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Find Schemes & Matches</span>
              <span className="bg-emerald-700 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {strongMatchesCount}
              </span>
            </button>

            <button
              id="desktop-nav-voice"
              onClick={() => setShowVoiceModal(true)}
              className="px-3 py-2 text-xs font-bold rounded-md flex items-center gap-1.5 text-emerald-400 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Mic className="w-4 h-4" />
              <span>Voice Assistant</span>
            </button>

            <button
              id="desktop-nav-button-phone"
              onClick={() => setActiveTab('button_phone')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'button_phone' ? 'bg-amber-600 text-white font-bold' : 'text-amber-400 hover:bg-slate-800'
              }`}
            >
              <PhoneCall className="w-4 h-4" />
              <span>Button Phone (IVR Simulator)</span>
            </button>

            <button
              id="desktop-nav-sms"
              onClick={() => setActiveTab('sms')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'sms' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS Access</span>
            </button>

            <button
              id="desktop-nav-family"
              onClick={() => setActiveTab('family')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'family' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Family Mode</span>
            </button>

            <button
              id="desktop-nav-assisted"
              onClick={() => setActiveTab('assisted')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'assisted' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Handshake className="w-4 h-4" />
              <span>Assisted (CSC/Volunteers)</span>
            </button>

            <button
              id="desktop-nav-saved"
              onClick={() => setActiveTab('saved')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'saved' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Saved ({savedSchemeIds.length})</span>
            </button>

            <button
              id="desktop-nav-profile"
              onClick={() => setActiveTab('profile')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'profile' ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>

            <button
              id="desktop-nav-arch"
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-2 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
                activeTab === 'architecture' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>Architecture & Vision</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
