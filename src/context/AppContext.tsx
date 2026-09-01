import React, { createContext, useContext, useState, useEffect } from 'react';
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
import { SCHEMES_DATABASE } from '../data/schemes';
import { matchUserSchemes } from '../engine/eligibilityEngine';
import { DEMO_PROFILES } from '../data/demoProfiles';
import confetti from 'canvas-confetti';

interface AppContextType {
  // State & Language
  selectedStateId: string;
  setSelectedStateId: (stateId: string) => void;
  currentStateConfig: StateConfig;
  selectedVoiceLanguageId: string;
  setSelectedVoiceLanguageId: (langId: string) => void;
  currentLanguageConfig: LanguageConfig;

  // Active User Profile
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  activeMatches: MatchResult[];

  // Navigation & Modals
  activeTab: ViewTab;
  setActiveTab: (tab: ViewTab) => void;
  showSetupModal: boolean;
  setShowSetupModal: (val: boolean) => void;
  showVoiceModal: boolean;
  setShowVoiceModal: (val: boolean) => void;
  showPresentationMode: boolean;
  setShowPresentationMode: (val: boolean) => void;
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
  activeFamilyMemberId: string;
  switchFamilyMember: (id: string) => void;
  addFamilyMember: (member: FamilyMemberProfile) => void;

  // Accessibility & Offline
  easyMode: boolean;
  setEasyMode: (val: boolean) => void;
  isOfflineMode: boolean;
  setIsOfflineMode: (val: boolean) => void;

  // Telemetry for Button Phone & Live Dashboard
  liveSessions: CitizenCallSession[];
  activeLiveSession: CitizenCallSession | null;
  logCitizenCallStep: (session: Partial<CitizenCallSession>) => void;

  // Helper Actions
  loadDemoProfile: (demoId: string) => void;
  triggerMatchCelebration: () => void;
  quickSearchNeed: (need: NeedCategory) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_PROFILE: UserProfile = {
  userId: 'user-default-1',
  name: 'Murugan K.',
  age: 48,
  gender: 'male',
  state: 'TN',
  district: 'Tiruchirappalli',
  occupation: 'Farmer',
  annualIncome: 150000,
  education: '10th',
  maritalStatus: 'married',
  isStudent: false,
  hasDisability: false,
  landHoldingAcres: 2.5,
  need: 'agriculture',
  voiceLanguage: 'ta',
  familyRole: 'Self',
};

const INITIAL_FAMILY: FamilyMemberProfile[] = [
  {
    id: 'fam-self',
    relation: 'Self',
    name: 'Murugan (Self)',
    profile: { ...INITIAL_PROFILE },
  },
  {
    id: 'fam-mother',
    relation: 'Mother',
    name: 'Lakshmi Ammal (Mother)',
    profile: {
      userId: 'fam-mother-user',
      name: 'Lakshmi Ammal',
      age: 71,
      gender: 'female',
      state: 'TN',
      district: 'Tiruchirappalli',
      occupation: 'Senior Citizen',
      annualIncome: 40000,
      education: 'none',
      maritalStatus: 'widowed',
      isStudent: false,
      hasDisability: false,
      landHoldingAcres: 0,
      need: 'senior_citizens',
      voiceLanguage: 'ta',
      familyRole: 'Mother',
    },
  },
  {
    id: 'fam-daughter',
    relation: 'Daughter',
    name: 'Kavitha (Daughter)',
    profile: {
      userId: 'fam-daughter-user',
      name: 'Kavitha M.',
      age: 19,
      gender: 'female',
      state: 'TN',
      district: 'Tiruchirappalli',
      occupation: 'Student',
      annualIncome: 0,
      education: '12th',
      maritalStatus: 'unmarried',
      isStudent: true,
      hasDisability: false,
      landHoldingAcres: 0,
      need: 'education',
      voiceLanguage: 'ta',
      familyRole: 'Daughter',
    },
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedStateId, setSelectedStateIdState] = useState<string>('TN');
  const [selectedVoiceLanguageId, setSelectedVoiceLanguageIdState] = useState<string>('ta');
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [savedSchemeIds, setSavedSchemeIds] = useState<string[]>(['TN-01', 'CEN-01']);
  const [userDocuments, setUserDocuments] = useState<Record<string, boolean>>({
    'Aadhaar Card': true,
    'Smart Family Ration Card': true,
    'Bank Passbook / Account Details': true,
    'Land Record / Patta / Chitta / RoR': true,
  });

  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showPresentationMode, setShowPresentationMode] = useState<boolean>(false);
  const [selectedSchemeDetail, setSelectedSchemeDetail] = useState<Scheme | null>(null);
  const [selectedWhyMeScheme, setSelectedWhyMeScheme] = useState<MatchResult | null>(null);
  const [selectedExplainSimplyScheme, setSelectedExplainSimplyScheme] = useState<Scheme | null>(null);

  const [familyMembers, setFamilyMembers] = useState<FamilyMemberProfile[]>(INITIAL_FAMILY);
  const [activeFamilyMemberId, setActiveFamilyMemberId] = useState<string>('fam-self');

  const [easyMode, setEasyMode] = useState<boolean>(false);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  // Live telemetry sessions
  const [liveSessions, setLiveSessions] = useState<CitizenCallSession[]>([
    {
      sessionId: 'sess-call-9842',
      citizenName: 'Karuppiah (Thanjavur)',
      device: 'Button Phone (IVR)',
      stateId: 'TN',
      voiceLanguage: 'ta',
      need: 'agriculture',
      profile: { age: 52, occupation: 'Farmer', annualIncome: 130000 },
      matchesCount: 3,
      topMatchName: 'PM-KISAN',
      topMatchBenefit: '₹6,000 / year',
      status: 'Voice Spoken',
      timestamp: '2 mins ago',
      ivrSteps: ['Call connected', 'Language: Tamil (1)', 'Spoke need: Farmer 52yr', 'Read PM-KISAN audio'],
    },
  ]);
  const [activeLiveSession, setActiveLiveSession] = useState<CitizenCallSession | null>(null);

  // Compute config objects
  const currentStateConfig = STATES_CONFIG[selectedStateId] || STATES_CONFIG['TN'];
  const currentLanguageConfig = SUPPORTED_LANGUAGES[selectedVoiceLanguageId] || SUPPORTED_LANGUAGES['ta'];

  // Handle State Changes
  const setSelectedStateId = (stateId: string) => {
    setSelectedStateIdState(stateId);
    const newConfig = STATES_CONFIG[stateId];
    if (newConfig) {
      // Set recommended voice language
      setSelectedVoiceLanguageIdState(newConfig.defaultVoiceLanguage);
      setUserProfile((prev) => ({
        ...prev,
        state: stateId,
        district: newConfig.districts[0] || '',
        voiceLanguage: newConfig.defaultVoiceLanguage,
      }));
    }
  };

  const setSelectedVoiceLanguageId = (langId: string) => {
    setSelectedVoiceLanguageIdState(langId);
    setUserProfile((prev) => ({
      ...prev,
      voiceLanguage: langId,
    }));
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => {
      const next = { ...prev, ...updates };
      // Update in active family member
      setFamilyMembers((members) =>
        members.map((m) => (m.id === activeFamilyMemberId ? { ...m, profile: next } : m))
      );
      return next;
    });
  };

  // Evaluate schemes deterministically
  const activeMatches = matchUserSchemes(userProfile, SCHEMES_DATABASE);

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

  // Log Button Phone / Citizen Session
  const logCitizenCallStep = (sessionUpdate: Partial<CitizenCallSession>) => {
    const updated: CitizenCallSession = {
      sessionId: sessionUpdate.sessionId || `call-${Date.now().toString().slice(-4)}`,
      citizenName: sessionUpdate.citizenName || 'Caller ' + userProfile.district,
      device: sessionUpdate.device || 'Button Phone (IVR)',
      stateId: sessionUpdate.stateId || selectedStateId,
      voiceLanguage: sessionUpdate.voiceLanguage || selectedVoiceLanguageId,
      need: sessionUpdate.need || userProfile.need,
      profile: { ...userProfile, ...(sessionUpdate.profile || {}) },
      matchesCount: sessionUpdate.matchesCount || activeMatches.filter((m) => m.matchLevel !== 'MORE_INFO').length,
      topMatchName: sessionUpdate.topMatchName || (activeMatches[0]?.scheme.name ?? 'PM-KISAN'),
      topMatchBenefit: sessionUpdate.topMatchBenefit || (activeMatches[0]?.scheme.benefits.amount ?? 'Grant'),
      status: sessionUpdate.status || 'Eligibility Checked',
      timestamp: 'Just now',
      ivrSteps: sessionUpdate.ivrSteps || ['Call initialized'],
    };

    setActiveLiveSession(updated);
    setLiveSessions((prev) => [updated, ...prev.slice(0, 7)]);
  };

  // Load demo profile
  const loadDemoProfile = (demoId: string) => {
    const demo = DEMO_PROFILES.find((d) => d.id === demoId);
    if (demo) {
      setUserProfile({ ...demo.profile });
      setSelectedStateIdState(demo.profile.state);
      setSelectedVoiceLanguageIdState(demo.profile.voiceLanguage);
    }
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
        userProfile,
        updateUserProfile,
        activeMatches,
        activeTab,
        setActiveTab,
        showSetupModal,
        setShowSetupModal,
        showVoiceModal,
        setShowVoiceModal,
        showPresentationMode,
        setShowPresentationMode,
        selectedSchemeDetail,
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
        loadDemoProfile,
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
