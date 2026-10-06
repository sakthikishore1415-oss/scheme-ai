import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
import { STATES_CONFIG } from '../data/states';
import {
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Signal,
  Battery,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export const ButtonPhoneSimulator: React.FC = () => {
  const {
    selectedStateId,
    selectedVoiceLanguageId,
    userProfile,
    schemes,
    schemesStatus,
    logCitizenCallStep,
  } = useApp();

  const [callState, setCallState] = useState<'IDLE' | 'DIALING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [ivrStep, setIvrStep] = useState<number>(0);
  const [screenText, setScreenText] = useState<string>('PACS SAHAYAK\n1800-425-7000\nPress CALL to start');
  const [audioPrompt, setAudioPrompt] = useState<string>('');
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [currentSelectedLang, setCurrentSelectedLang] = useState<string>(selectedVoiceLanguageId);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [matchedSchemesForCall, setMatchedSchemesForCall] = useState<typeof schemes>([]);

  const startCall = () => {
    speechService.stop();
    setCallState('CONNECTED');
    setSmsNotification(null);
    setIvrStep(1);

    const prompt =
      'வணக்கம்! பேக்ஸ் சகாயக் சேவைக்கு வரவேற்கிறோம். தமிழுக்கு 1 அழுத்தவும். For English press 2. For Malayalam press 3. For Kannada press 4. For Telugu press 5. For Hindi press 6.';
    setAudioPrompt(prompt);
    setScreenText('IVR CONNECTED\n1: Tamil | 2: English\n3: Malayalam | 4: Kannada\n5: Telugu | 6: Hindi');
    speechService.speak(prompt, 'ta');

    logCitizenCallStep({
      device: 'Button Phone (IVR)',
      status: 'Connected to IVR Gateway',
      ivrSteps: ['Citizen dialed 1800-425-7000', 'IVR Language Selection'],
    });
  };

  const endCall = () => {
    speechService.stop();
    setCallState('ENDED');
    setScreenText('Call Ended\nThank you for calling.');
    setCallState('IDLE');
    setIvrStep(0);
  };

  const handleKeyPress = (key: string) => {
    setActiveKey(key);
    setTimeout(() => setActiveKey(null), 200);

    if (callState !== 'CONNECTED') {
      if (key === 'CALL') startCall();
      return;
    }

    // Step 1: Language selection
    if (ivrStep === 1) {
      let lang = 'ta';
      let langName = 'Tamil';
      if (key === '1') {
        lang = 'ta';
        langName = 'Tamil';
      } else if (key === '2') {
        lang = 'en';
        langName = 'English';
      } else if (key === '3') {
        lang = 'ml';
        langName = 'Malayalam';
      } else if (key === '4') {
        lang = 'kn';
        langName = 'Kannada';
      } else if (key === '5') {
        lang = 'te';
        langName = 'Telugu';
      } else if (key === '6') {
        lang = 'hi';
        langName = 'Hindi';
      }

      setCurrentSelectedLang(lang);
      setIvrStep(2);
      const prompt =
        lang === 'ta'
          ? 'உங்கள் தேவையை தேர்ந்தெடுக்கவும். விவசாய உதவிக்கு 1 அழுத்தவும். முதியோர் நலனுக்கு 2 அழுத்தவும். மகளிர் திட்டங்களுக்கு 3 அழுத்தவும். கல்விக்கு 4 அழுத்தவும்.'
          : 'Please select your sector. Press 1 for Agriculture, 2 for Senior Citizens, 3 for Women, 4 for Education.';
      setAudioPrompt(prompt);
      setScreenText(`LANG: ${langName}\n1: Agriculture\n2: Senior Citizens\n3: Women\n4: Education`);
      speechService.speak(prompt, lang);

      logCitizenCallStep({
        voiceLanguage: lang,
        status: 'Sector Selection',
        ivrSteps: [`Selected Language: ${langName}`, 'Playing Sector Menu'],
      });
      return;
    }

    // Step 2: Sector / Need Selection & Real Repository Query
    if (ivrStep === 2) {
      let need = 'agriculture';
      let needName = 'Agriculture';
      if (key === '1') {
        need = 'agriculture';
        needName = 'Agriculture';
      } else if (key === '2') {
        need = 'senior_citizens';
        needName = 'Senior Citizen';
      } else if (key === '3') {
        need = 'women';
        needName = 'Women';
      } else if (key === '4') {
        need = 'education';
        needName = 'Education';
      }

      // Query real schemes
      const matching = schemes.filter(
        (s) =>
          (s.category === need || s.eligibility?.targetCategories?.includes(need as any)) &&
          (s.stateId === 'ALL' || s.state === 'ALL' || s.stateId === selectedStateId || s.state === selectedStateId)
      );

      setMatchedSchemesForCall(matching);
      setIvrStep(3);

      if (matching.length === 0) {
        const noDataPrompt =
          currentSelectedLang === 'ta'
            ? 'மன்னிக்கவும், சேவை தற்காலிகமாக கிடைக்கவில்லை அல்லது இந்த பிரிவில் திட்டங்கள் இல்லை. பின்னர் முயற்சிக்கவும்.'
            : 'Service temporarily unavailable or no matching schemes found for the selected category. Please try again later.';
        setAudioPrompt(noDataPrompt);
        setScreenText(`STATUS:\n${noDataPrompt}\nPress # to Finish`);
        speechService.speak(noDataPrompt, currentSelectedLang);

        logCitizenCallStep({
          need: need as any,
          status: 'No Schemes Available in Repo',
          ivrSteps: [`Selected Sector: ${needName}`, 'Repository returned 0 schemes'],
        });
        return;
      }

      const scheme1 = matching[0];
      const scheme2 = matching[1];
      const prompt =
        currentSelectedLang === 'ta'
          ? `உங்கள் விவரங்களுக்கு ${matching.length} திட்டங்கள் உள்ளன. முதலாவது ${scheme1.name}. விவரங்களை எஸ்.எம்.எஸ் ஆக பெற 1 அழுத்தவும். விண்ணப்பிக்கும் முறையை கேட்க 2 அழுத்தவும்.`
          : `Found ${matching.length} schemes for ${needName}. First is ${scheme1.name}. Press 1 to receive SMS summary on this phone. Press 2 to hear how to apply.`;

      setAudioPrompt(prompt);
      setScreenText(
        `FOUND: ${matching.length} SCHEMES\n1: ${scheme1.name.slice(0, 18)}\n${
          scheme2 ? '2: ' + scheme2.name.slice(0, 18) : ''
        }\nPress 1 for SMS\nPress 2 for Apply Steps`
      );
      speechService.speak(prompt, currentSelectedLang);

      logCitizenCallStep({
        need: need as any,
        status: 'Schemes Found & Announced',
        topMatchName: scheme1.name,
        topMatchBenefit: scheme1.benefits?.amount || 'Entitlement',
        ivrSteps: [`Selected Sector: ${needName}`, `Announced ${matching.length} verified schemes`],
      });
      return;
    }

    // Step 3: Action options
    if (ivrStep === 3) {
      if (key === '1') {
        setIvrStep(4);
        if (matchedSchemesForCall.length === 0) {
          const unavailablePrompt =
            currentSelectedLang === 'ta'
              ? 'மன்னிக்கவும், திட்ட விவரங்கள் கிடைக்கவில்லை.'
              : 'Service temporarily unavailable. Please try again later.';
          setAudioPrompt(unavailablePrompt);
          setScreenText(unavailablePrompt);
          speechService.speak(unavailablePrompt, currentSelectedLang);
          return;
        }

        const confirmVoice =
          currentSelectedLang === 'ta'
            ? 'திட்ட விபரங்கள் உங்கள் மொபைலுக்கு எஸ்.எம்.எஸ் ஆக அனுப்பப்பட்டது. நன்றி!'
            : 'Scheme details dispatched as simulated SMS summary. Thank you for using PACS Sahayak!';
        setAudioPrompt(confirmVoice);
        setScreenText('SIMULATED SMS DISPATCHED\nPress # to End Call');
        speechService.speak(confirmVoice, currentSelectedLang);

        const summaryText = matchedSchemesForCall
          .slice(0, 2)
          .map((s, i) => `${i + 1}. ${s.name}: ${s.benefits?.amount || s.benefits?.shortSummary || ''}`)
          .join('\n');

        setSmsNotification(
          `[Simulation only — no real SMS was sent]\nPACS SAHAYAK:\n${summaryText}\nApply at nearest e-Seva center.`
        );

        logCitizenCallStep({
          status: 'SMS Summary Dispatched (Simulated)',
          ivrSteps: ['Citizen selected SMS option', 'Dispatched real matched scheme summary'],
        });
      } else if (key === '2') {
        const topScheme = matchedSchemesForCall[0];
        const applyVoice =
          topScheme?.offlineApplicationCenter ||
          (currentSelectedLang === 'ta'
            ? 'விண்ணப்பிக்க: தேவையான ஆவணங்களுடன் உங்கள் அருகில் உள்ள இ-சேவை மையத்திற்கு செல்லவும்.'
            : 'How to apply: Visit nearest e-Seva / CSC center with identity proof and documents.');
        setAudioPrompt(applyVoice);
        setScreenText(`HOW TO APPLY:\n${applyVoice.slice(0, 50)}...\nVisit nearest e-Seva`);
        speechService.speak(applyVoice, currentSelectedLang);
      }
    }
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['*', '0', '#'],
  ];

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6">
      {/* Title & Banner */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-xs font-extrabold text-amber-400 tracking-wider uppercase flex items-center gap-1.5">
            <PhoneCall className="w-4 h-4" />
            BUTTON PHONE (1800 IVR) TELEPHONY SIMULATOR
          </span>
          <h2 className="text-xl font-black text-white mt-1">
            Toll-Free Civic Voice Gateway (1800-425-7000)
          </h2>
        </div>
        <span className="text-[11px] font-mono bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
          Simulation Mode • Operates on Connected Repository
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Phone Device Mockup */}
        <div className="md:col-span-5 flex justify-center">
          <div className="w-72 bg-slate-950 p-4 rounded-[40px] border-4 border-slate-800 shadow-2xl space-y-4">
            {/* Phone Screen */}
            <div className="bg-[#8fa382] text-slate-950 font-mono p-3 rounded-2xl h-44 flex flex-col justify-between border-2 border-slate-700 shadow-inner">
              <div className="flex items-center justify-between text-[10px] border-b border-slate-700/30 pb-1">
                <span className="flex items-center gap-1">
                  <Signal className="w-3 h-3" />
                  <span>2G BSNL</span>
                </span>
                <span className="font-bold">1800-425-7000</span>
                <Battery className="w-3 h-3" />
              </div>

              <div className="text-center whitespace-pre-line text-xs font-bold py-1 leading-snug">
                {screenText}
              </div>

              <div className="text-[9px] text-center border-t border-slate-700/30 pt-0.5 text-slate-800">
                {callState === 'CONNECTED' ? '● CALL IN PROGRESS' : 'PACS SAHAYAK'}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between px-2">
              <button
                onClick={startCall}
                disabled={callState === 'CONNECTED'}
                className="w-14 h-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold flex items-center justify-center cursor-pointer shadow-md"
                title="Call"
              >
                <PhoneCall className="w-4 h-4" />
              </button>

              <button
                onClick={endCall}
                className="w-14 h-9 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center justify-center cursor-pointer shadow-md"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-2 px-1">
              {keys.flat().map((k) => (
                <button
                  key={k}
                  onClick={() => handleKeyPress(k)}
                  className={`h-10 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold text-sm hover:bg-slate-800 active:bg-emerald-600 active:border-emerald-500 transition-all flex items-center justify-center cursor-pointer ${
                    activeKey === k ? 'bg-emerald-600 border-emerald-500 scale-95' : ''
                  }`}
                >
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Audio Prompts & SMS Dispatch Area */}
        <div className="md:col-span-7 space-y-4">
          <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                Live Spoken Voice Prompt
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Status: {callState}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 min-h-20 flex items-center">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                {audioPrompt || 'Press the green CALL button on the button phone to dial Toll-Free 1800-425-7000 and start voice navigation.'}
              </p>
            </div>
          </div>

          {/* SMS Notification Banner if triggered */}
          {smsNotification && (
            <div className="bg-emerald-950/80 border border-emerald-600/50 p-4 rounded-2xl space-y-2 animate-fade-in text-xs">
              <div className="flex items-center gap-2 text-emerald-300 font-bold">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Simulated SMS Delivery</span>
              </div>
              <p className="text-slate-200 font-mono whitespace-pre-line text-[11px] bg-slate-900 p-3 rounded-xl border border-slate-800">
                {smsNotification}
              </p>
              <p className="text-[10px] text-slate-400 italic">
                Simulation only — no real SMS was sent over telecommunication carriers.
              </p>
            </div>
          )}

          {/* Telephony Architecture Note */}
          <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 text-xs text-slate-400 space-y-1">
            <strong className="text-slate-300 block font-semibold">Toll-Free Voice Architecture:</strong>
            <p className="text-[11px] leading-relaxed">
              In production, inbound telephony calls to 1800-425-7000 terminate on an Asterisk/FreeSWITCH SIP trunk. DTMF tones and audio streams route directly into the PACS Sahayak deterministic engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
