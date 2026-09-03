import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav, DesktopSidebar } from './components/BottomNav';
import { FirstTimeSetupModal } from './components/FirstTimeSetupModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { SchemeDetailModal } from './components/SchemeDetailModal';
import { WhyMeExplanationModal } from './components/WhyMeExplanationModal';
import { HomeView } from './views/HomeView';
import { MyMatchesView } from './views/MyMatchesView';
import { SavedSchemesView } from './views/SavedSchemesView';
import { ProfileView } from './views/ProfileView';
import { ButtonPhoneView } from './views/ButtonPhoneView';
import { AssistedView } from './views/AssistedView';
import { AboutArchitectureView } from './views/AboutArchitectureView';
import { SmsSimulator } from './components/SmsSimulator';

const MainLayout: React.FC = () => {
  const { activeTab, easyMode, isOfflineMode } = useApp();

  return (
    <div
      className={`min-h-screen bg-[#fff8f8] text-[#21191d] flex flex-col font-sans transition-all selection:bg-[#4a1f2d] selection:text-white ${
        easyMode ? 'text-lg font-medium' : 'text-sm'
      }`}
    >
      {/* Top Global Header */}
      <Header />

      {/* Offline Mode Banner if active */}
      {isOfflineMode && (
        <div className="bg-[#ba1a1a] text-white text-xs px-4 py-2 text-center font-bold flex items-center justify-center gap-2">
          <span>⚠️ LIMITED CONNECTIVITY MODE ACTIVE — Cached scheme repository & local speech engine in use.</span>
        </div>
      )}

      {/* Main Container: Desktop Sidebar + Main Content Side-by-Side (Zero Overlap) */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex items-start gap-4">
        {/* Desktop Minimized Icon Sidebar (Non-overlapping) */}
        <DesktopSidebar />

        {/* Main Page Content Body */}
        <main className="flex-1 min-w-0 px-3 sm:px-6 py-6 pb-24 md:pb-12">
          {activeTab === 'home' && <HomeView />}
          {activeTab === 'matches' && <MyMatchesView />}
          {activeTab === 'saved' && <SavedSchemesView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'button_phone' && <ButtonPhoneView />}
          {activeTab === 'sms' && (
            <div className="space-y-6 animate-fade-in pb-12">
              <SmsSimulator />
            </div>
          )}
          {activeTab === 'family' && <ProfileView />}
          {activeTab === 'assisted' && <AssistedView />}
          {activeTab === 'architecture' && <AboutArchitectureView />}
        </main>
      </div>

      {/* Mobile Minimized Bottom Navigator */}
      <BottomNav />

      {/* Global Modals & Drawers */}
      <FirstTimeSetupModal />
      <VoiceAssistantModal />
      <SchemeDetailModal />
      <WhyMeExplanationModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
