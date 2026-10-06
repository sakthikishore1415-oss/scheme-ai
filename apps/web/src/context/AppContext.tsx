import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  UserProfile,
  StateConfig,
  LanguageConfig,
  Scheme,
  MatchResult,
  FamilyMemberProfile,
  CitizenCallSession,
  ViewTab,
  NeedCategory,
} from '../types';
import { STATES_CONFIG } from '../data/states';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import { defaultSchemeRepository } from '../services/schemeRepository';
import { geminiLiveVoiceService } from '../services/geminiLiveVoiceService';
import { matchUserSchemes } from '../engine/eligibilityEngine';
import { getLocalizedScheme } from '../translations/schemeLocalizations';
import confetti from 'canvas-confetti';

interface AppContextType {
  // State & Language
  selectedStateId: string;
  setSelectedStateId: (stateId: string) => void;
  currentStateConfig: StateConfig;
  selectedVoiceLanguageId: string;
  setSelectedVoiceLanguageId: (langId: string) => void;
  currentLanguageConfig: LanguageConfig;

  // Schemes from Repository
  schemes: Scheme[];
  schemesStatus: 'IDLE' | 'LOADING' | 'SUCCESS' | 'NO_DATA' | 'ERROR';
  schemesErrorMessage?: string;
  refreshSchemes: () => Promise<void>;

  // Active User Profile
  userProfile: UserProfile | null;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  clearUserProfile: () => void;
  activeMatches: MatchResult[];

  // Navigation & Modals
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  // Modals & Inspection Drawers
  showSetupModal: boolean;
  setShowSetupModal: (val: boolean) => void;
  showVoiceModal: boolean;
  setShowVoiceModal: (val: boolean) => void;
  taggedSchemeForVoice: Scheme | null;
  setTaggedSchemeForVoice: (scheme: Scheme | null) => void;
  openVoiceAssistantForScheme: (scheme: Scheme) => void;
  selectedSchemeDetail: Scheme | null;
  setSelectedSchemeDetail: (scheme: Scheme | null) => void;
  selectedWhyMeScheme: MatchResult | null;
  setSelectedWhyMeScheme: (result: MatchResult | null) => void;
  selectedExplainSimplyScheme: Scheme | null;
  setSelectedExplainSimplyScheme: (scheme: Scheme | null) => void;

  // Saved Schemes
  savedSchemeIds: string[];
  toggleSaveScheme: (schemeId: string) => void;
  isSchemeSaved: (schemeId: string) => boolean;

  // Document checklist
  userDocuments: Record<string, boolean>;
  toggleUserDocument: (docName: string) => void;

  // Family Mode
  familyMembers: FamilyMemberProfile[];
  activeFamilyMemberId: string | null;
  switchFamilyMember: (id: string) => void;
  addFamilyMember: (member: FamilyMemberProfile) => void;

  // Accessibility & Offline
  easyMode: boolean;
  setEasyMode: (val: boolean) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (val: boolean) => void;

  // Real-time Telemetry for Button Phone & Live Dashboard
  liveSessions: CitizenCallSession[];
  activeLiveSession: CitizenCallSession | null;
  logCitizenCallStep: (session: Partial<CitizenCallSession>) => void;

  // Centralized Localization System
  t: (key: TranslationKey) => string;
  uiStrings: AppTranslationStrings;
  getDual: (key: keyof AppTranslationStrings) => DualText;

  // Helper Actions
  triggerMatchCelebration: () => void;
  quickSearchNeed: (need: NeedCategory) => void;
}

import { detectBrowserLanguage } from '../utils/languageDetector';
import { AppTranslationStrings, DualText, getUITranslations, getDualText } from '../data/uiTranslations';
import { getTranslation, TranslationKey } from '../translations';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStateId, setSelectedStateIdState] = useState<string>(() => {
    return localStorage.getItem('pacs_sahayak_selected_state') || localStorage.getItem('arivom_selected_state') || 'TN';
  });

  const [selectedVoiceLanguageId, setSelectedVoiceLanguageIdState] = useState<string>(() => {
    const saved = localStorage.getItem('pacs_sahayak_selected_lang') || localStorage.getItem('arivom_selected_lang');
    if (saved && SUPPORTED_LANGUAGES[saved]) return saved;
    return detectBrowserLanguage();
  });

  // No mock data loaded by default. User profile is null until created.
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Scheme data loaded from repository
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [schemesStatus, setSchemesStatus] = useState<'IDLE' | 'LOADING' | 'SUCCESS' | 'NO_DATA' | 'ERROR'>('IDLE');
  const [schemesErrorMessage, setSchemesErrorMessage] = useState<string | undefined>(undefined);

  // Saved schemes and document checklist start empty
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>([]);
  const [userDocuments, setUserDocuments] = useState<Record<string, boolean>>({});

  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [taggedSchemeForVoice, setTaggedSchemeForVoice] = useState<Scheme | null>(null);

  const openVoiceAssistantForScheme = (scheme: Scheme) => {
    setTaggedSchemeForVoice(scheme);
    setShowVoiceModal(true);
  };
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<Scheme | null>(null);
  const [selectedWhyMeScheme, setSelectedWhyMeScheme] = useState<MatchResult | null>(null);
  const [selectedExplainSimplyScheme, setSelectedExplainSimplyScheme] = useState<Scheme | null>(null);

  // Family members start empty
  const [familyMembers, setFamilyMembers] = useState<FamilyMemberProfile[]>([]);
  const [activeFamilyMemberId, setActiveFamilyMemberId] = useState<string | null>(null);

  const [easyMode, setEasyMode] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Live telemetry sessions start empty
  const [liveSessions, setLiveSessions] = useState<CitizenCallSession[]>([]);
  const [activeLiveSession, setActiveLiveSession] = useState<CitizenCallSession | null>(null);

  // Fetch schemes from repository
  const refreshSchemes = useCallback(async () => {
    setSchemesStatus('LOADING');
    try {
      const response = await defaultSchemeRepository.getSchemes();
      if (response.status === 'SUCCESS' && response.schemes.length > 0) {
        setSchemes(response.schemes);
        setSchemesStatus('SUCCESS');
        setSchemesErrorMessage(undefined);
      } else {
        setSchemes([]);
        setSchemesStatus('NO_DATA');
        setSchemesErrorMessage(response.message || 'No government schemes available.');
      }
    } catch (err: any) {
      setSchemes([]);
      setSchemesStatus('ERROR');
      setSchemesErrorMessage(err?.message || 'Failed to connect to scheme repository.');
    }
  }, []);

  useEffect(() => {
    refreshSchemes();
  }, [refreshSchemes]);

  // Compute config objects
  const currentStateConfig = STATES_CONFIG[selectedStateId] || STATES_CONFIG['TN'];
  const normalizedVoiceLang = (selectedVoiceLanguageId || 'ta').toLowerCase().split('-')[0].split('_')[0];
  const currentLanguageConfig = SUPPORTED_LANGUAGES[selectedVoiceLanguageId] || SUPPORTED_LANGUAGES[normalizedVoiceLang] || SUPPORTED_LANGUAGES['ta'];

  // Handle State Changes
  const setSelectedStateId = (stateId: string) => {
    setSelectedStateIdState(stateId);
    try {
      localStorage.setItem('pacs_sahayak_selected_state', stateId);
    } catch (_) {}
    const newConfig = STATES_CONFIG[stateId];
    if (newConfig) {
      setSelectedVoiceLanguageIdState(newConfig.defaultVoiceLanguage);
      geminiLiveVoiceService.setLanguage(newConfig.defaultVoiceLanguage);
      try {
        localStorage.setItem('pacs_sahayak_selected_lang', newConfig.defaultVoiceLanguage);
      } catch (_) {}
      if (userProfile) {
        setUserProfile((prev) =>
          prev
            ? {
                ...prev,
                state: stateId,
                district: newConfig.districts[0] || '',
                voiceLanguage: newConfig.defaultVoiceLanguage,
              }
            : null
        );
      }
    }
  };

  const setSelectedVoiceLanguageId = (langId: string) => {
    setSelectedVoiceLanguageIdState(langId);
    geminiLiveVoiceService.setLanguage(langId);
    try {
      localStorage.setItem('pacs_sahayak_selected_lang', langId);
    } catch (_) {}
    if (userProfile) {
      setUserProfile((prev) => (prev ? { ...prev, voiceLanguage: langId } : null));
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const base: UserProfile = prev || {
        userId: `user-${Date.now()}`,
        name: '',
        age: 0,
        gender: 'unspecified',
        state: selectedStateId,
        district: currentStateConfig.districts[0] || '',
        occupation: '',
        annualIncome: 0,
        education: 'other',
        maritalStatus: 'unspecified',
        isStudent: false,
        hasDisability: false,
        landHoldingAcres: 0,
        need: 'general',
        voiceLanguage: selectedVoiceLanguageId,
        familyRole: 'Self',
      };
      const next = { ...base, ...updates };

      if (activeFamilyMemberId) {
        setFamilyMembers((members) =>
          members.map((m) => (m.id === activeFamilyMemberId ? { ...m, profile: next } : m))
        );
      }
      return next;
    });
  };

  const clearUserProfile = () => {
    setUserProfile(null);
    setActiveFamilyMemberId(null);
  };

  // Automatically localize schemes for the currently active language
  const localizedSchemes = useMemo(() => {
    return schemes.map((s) => getLocalizedScheme(s, selectedVoiceLanguageId));
  }, [schemes, selectedVoiceLanguageId]);

  // Evaluate schemes deterministically only when a real citizen profile exists
  const activeMatches = userProfile ? matchUserSchemes(userProfile, localizedSchemes) : [];

  const currentLocalizedSelectedDetail = useMemo(() => {
    if (!selectedSchemeDetail) return null;
    return getLocalizedScheme(selectedSchemeDetail, selectedVoiceLanguageId);
  }, [selectedSchemeDetail, selectedVoiceLanguageId]);

  // Save/Unsave Schemes
  const toggleSaveScheme = (schemeId: string) => {
    setSavedSchemeIds((prev) =>
      prev.includes(schemeId) ? prev.filter((id) => id !== schemeId) : [...prev, schemeId]
    );
  };

  const isSchemeSaved = (schemeId: string) => savedSchemeIds.includes(schemeId);

  // Document Toggle
  const toggleUserDocument = (docName: string) => {
    setUserDocuments((prev) => ({
      ...prev,
      [docName]: !prev[docName],
    }));
  };

  // Family Switch
  const switchFamilyMember = (id: string) => {
    setActiveFamilyMemberId(id);
    const member = familyMembers.find((m) => m.id === id);
    if (member) {
      setUserProfile(member.profile);
      if (member.profile.state) {
        setSelectedStateIdState(member.profile.state);
      }
      if (member.profile.voiceLanguage) {
        setSelectedVoiceLanguageIdState(member.profile.voiceLanguage);
      }
    }
  };

  const addFamilyMember = (member: FamilyMemberProfile) => {
    setFamilyMembers((prev) => [...prev, member]);
    switchFamilyMember(member.id);
  };

  // Log Real Citizen Session
  const logCitizenCallStep = (sessionUpdate: Partial<CitizenCallSession>) => {
    const updated: CitizenCallSession = {
      sessionId: sessionUpdate.sessionId || `session-${Date.now()}`,
      citizenName: sessionUpdate.citizenName || userProfile?.name || 'Citizen',
      device: sessionUpdate.device || 'Direct Input',
      stateId: sessionUpdate.stateId || selectedStateId,
      voiceLanguage: sessionUpdate.voiceLanguage || selectedVoiceLanguageId,
      need: sessionUpdate.need || userProfile?.need || 'general',
      profile: { ...(userProfile || {}), ...(sessionUpdate.profile || {}) },
      matchesCount: sessionUpdate.matchesCount || activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length,
      topMatchName: sessionUpdate.topMatchName || (activeMatches[0]?.scheme.name ?? 'None'),
      topMatchBenefit: sessionUpdate.topMatchBenefit || (activeMatches[0]?.scheme.benefits?.amount ?? 'N/A'),
      status: sessionUpdate.status || 'Active',
      timestamp: 'Just now',
      ivrSteps: sessionUpdate.ivrSteps || [],
    };

    setActiveLiveSession(updated);
    setLiveSessions((prev) => [updated, ...prev.slice(0, 9)]);
  };

  const triggerMatchCelebration = () => {
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#059669', '#10B981', '#34D399', '#3B82F6'],
      });
    } catch (e) {}
  };

  const quickSearchNeed = (need: NeedCategory) => {
    updateUserProfile({ need });
    setActiveTab('matches');
  };

  return (
    <AppContext.Provider
      value={{
        selectedStateId,
        setSelectedStateId,
        currentStateConfig,
        selectedVoiceLanguageId,
        setSelectedVoiceLanguageId,
        currentLanguageConfig,
        schemes: localizedSchemes,
        schemesStatus,
        schemesErrorMessage,
        refreshSchemes,
        userProfile,
        updateUserProfile,
        clearUserProfile,
        activeMatches,
        activeTab,
        setActiveTab,
        showSetupModal,
        setShowSetupModal,
        showVoiceModal,
        setShowVoiceModal,
        taggedSchemeForVoice,
        setTaggedSchemeForVoice,
        openVoiceAssistantForScheme,
        selectedSchemeDetail: currentLocalizedSelectedDetail,
        setSelectedSchemeDetail,
        selectedWhyMeScheme,
        setSelectedWhyMeScheme,
        selectedExplainSimplyScheme,
        setSelectedExplainSimplyScheme,
        savedSchemeIds,
        toggleSaveScheme,
        isSchemeSaved,
        userDocuments,
        toggleUserDocument,
        familyMembers,
        activeFamilyMemberId,
        switchFamilyMember,
        addFamilyMember,
        easyMode,
        setEasyMode,
        isOfflineMode,
        setIsOfflineMode,
        liveSessions,
        activeLiveSession,
        logCitizenCallStep,
        t: (key: TranslationKey) => getTranslation(selectedVoiceLanguageId, key),
        uiStrings: getUITranslations(selectedVoiceLanguageId),
        getDual: (key: keyof AppTranslationStrings) => getDualText(key, selectedVoiceLanguageId),
        triggerMatchCelebration,
        quickSearchNeed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
