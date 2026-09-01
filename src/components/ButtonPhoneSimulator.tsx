import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
import { STATES_CONFIG } from '../data/states';
import { SUPPORTED_LANGUAGES } from '../data/languages';
import {
  PhoneCall,
  PhoneOff,
  Volume2,
  VolumeX,
  MessageSquare,
  Sparkles,
  Signal,
  Battery,
  Wifi,
  RotateCcw,
  CheckCircle2,
  Flame,
} from 'lucide-react';

export const ButtonPhoneSimulator: React.FC = () => {
  const {
    selectedStateId,
    selectedVoiceLanguageId,
    userProfile,
    activeMatches,
    logCitizenCallStep,
  } = useApp();

  const [callState, setCallState] = useState<'IDLE' | 'DIALING' | 'CONNECTED' | 'ENDED'>('IDLE');
  const [ivrStep, setIvrStep] = useState<number>(0);
  const [screenText, setScreenText] = useState<string>('ARIVOM THITTAM\n1800-425-7000\nPress CALL to start');
  const [audioPrompt, setAudioPrompt] = useState<string>('');
  const [smsNotification, setSmsNotification] = useState<string | null>(null);
  const [currentSelectedLang, setCurrentSelectedLang] = useState<string>(selectedVoiceLanguageId);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const startCall = () => {
    speechService.stop();
    setCallState('DIALING');
    setScreenText('Calling...\n1800-425-7000\nArivom Thittam IVR');
    setSmsNotification(null);
    setIvrStep(0);

    logCitizenCallStep({
      device: 'Button Phone (IVR)',
      status: 'Dialing 1800-425-7000',
      ivrSteps: ['Citizen dialed 1800-425-7000', 'Connecting gateway...'],
    });

    setTimeout(() => {
      setCallState('CONNECTED');
      setIvrStep(1);
      const prompt =
        'வணக்கம்! அறிவோம் திட்டம் கிராமப்புற சேவைக்கு வரவேற்கிறோம். தமிழுக்கு 1 அழுத்தவும். For English press 2. For Malayalam press 3. For Kannada press 4. For Telugu press 5. For Hindi press 6.';
      setAudioPrompt(prompt);
      setScreenText('IVR CONNECTED\n1: Tamil | 2: English\n3: Malayalam | 4: Kannada\n5: Telugu | 6: Hindi');
      speechService.speak(prompt, 'ta');

      logCitizenCallStep({
        status: 'Language Selection IVR',
        ivrSteps: ['Call connected', 'IVR Language Prompt played'],
      });
    }, 1800);
  };

  const endCall = () => {
    speechService.stop();
    setCallState('ENDED');
    setScreenText('Call Ended\nDuration: 01:24\nThank you');
    setTimeout(() => {
      setCallState('IDLE');
      setScreenText('ARIVOM THITTAM\n1800-425-7000\nPress CALL to start');
    }, 2000);
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
          ? 'உங்கள் தேவையை தேர்ந்தெடுக்கவும். விவசாய உதவிக்கு 1 அழுத்தவும். முதியோர் ஓய்வூதியத்திற்கு 2 அழுத்தவும். மகளிர் திட்டங்களுக்கு 3 அழுத்தவும். மாணவர் கல்விக்கு 4 அழுத்தவும்.'
          : 'Please select your need. Press 1 for Agriculture, 2 for Senior Pension, 3 for Women, 4 for Education.';
      setAudioPrompt(prompt);
      setScreenText(`LANG: ${langName}\n1: Agriculture\n2: Senior Pension\n3: Women\n4: Education`);
      speechService.speak(prompt, lang);

      logCitizenCallStep({
        voiceLanguage: lang,
        status: 'Need Selection',
        ivrSteps: [`Selected Language: ${langName}`, 'Playing Category Menu'],
      });
      return;
    }

    // Step 2: Need Selection
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

      setIvrStep(3);
      const prompt =
        currentSelectedLang === 'ta'
          ? 'உங்கள் விபரங்களின்படி தகுதியான திட்டங்கள்: 1. பிரதான் மந்திரி கிசான் சம்மான் நிதி. ஆண்டுக்கு 6000 ரூபாய் வங்கி கணக்கில் நேரடியாக வரும். மற்றும் உழவர் பாதுகாப்பு திட்டம். இந்த விபரங்களை எஸ்.எம்.எஸ் ஆக பெற 1 அழுத்தவும். விண்ணப்பிக்கும் முறையை கேட்க 2 அழுத்தவும்.'
          : 'Based on your profile, 2 schemes matched: PM-KISAN with 6000 rupees per year, and Farmers Welfare Scheme. To receive SMS summary on this phone, press 1. To hear how to apply, press 2.';

      setAudioPrompt(prompt);
      setScreenText(`FOUND: 2 MATCHES\n1: PM-KISAN (₹6000/yr)\n2: Uzhavar Pathukappu\nPress 1 for SMS Summary\nPress 2 to hear details`);
      speechService.speak(prompt, currentSelectedLang);

      logCitizenCallStep({
        need: need as any,
        status: 'Matches Announced via Voice',
        topMatchName: 'PM-KISAN',
        topMatchBenefit: '₹6,000 / year',
        ivrSteps: [`Selected Need: ${needName}`, 'Read aloud PM-KISAN & State scheme'],
      });
      return;
    }

    // Step 3: SMS Dispatch or Details
    if (ivrStep === 3) {
      if (key === '1') {
        setIvrStep(4);
        const confirmVoice =
          currentSelectedLang === 'ta'
            ? 'திட்ட விபரங்கள் உங்கள் மொபைலுக்கு எஸ்.எம்.எஸ் ஆக அனுப்பப்பட்டது. நன்றி!'
            : 'Scheme details have been sent as an SMS to your mobile phone. Thank you for using Arivom Thittam!';
        setAudioPrompt(confirmVoice);
        setScreenText('SMS DISPATCHED!\nGovt Schemes Summary\nSent to 98421-XXXXX\nPress # to Finish');
        speechService.speak(confirmVoice, currentSelectedLang);

        setSmsNotification(
          'Govt Scheme Alert: 1. PM-KISAN (₹6000/yr). 2. Uzhavar Pathukappu Thittam. Apply at nearest e-Seva center with Aadhaar & Land Patta. - Arivom Thittam'
        );

        logCitizenCallStep({
          status: 'SMS Dispatched',
          ivrSteps: ['Citizen requested SMS', 'SMS dispatched to mobile phone'],
        });
      } else if (key === '2') {
        const applyVoice =
          currentSelectedLang === 'ta'
            ? 'விண்ணப்பிக்க: ஆதார் அட்டை, நில பட்டா, வங்கி பாஸ்புக் ஆகியவற்றுடன் உங்கள் அருகில் உள்ள இ-சேவை மையத்திற்கு செல்லவும்.'
            : 'How to apply: Visit nearest e-Seva center with Aadhaar card, Land Record, and Bank Passbook.';
        setAudioPrompt(applyVoice);
        setScreenText('HOW TO APPLY:\n1. Aadhaar Card\n2. Land Patta\n3. Bank Passbook\nVisit nearest e-Seva');
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
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl">
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Side: Hardware Simulator Info & Context */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
            <PhoneCall className="w-3.5 h-3.5" />
            BUTTON PHONE (IVR) SIMULATOR
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            Inclusive Civic Access on ₹1,200 Button Phones
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Over 350 million citizens across rural India rely on basic feature phones without internet or touchscreens.
            Arivom Thittam delivers <strong>real-time voice discovery and SMS follow-ups</strong> through our zero-internet IVR gateway.
          </p>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-amber-400 block mb-0.5">📞 Toll-Free 1800 IVR</span>
              <p className="text-slate-300 text-[11px]">Free call in 12 Indian regional languages without mobile data.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-emerald-400 block mb-0.5">💬 Instant SMS Summary</span>
              <p className="text-slate-300 text-[11px]">Scheme documents and local e-Seva address sent via text message.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-teal-400 block mb-0.5">🎙️ Regional Dialects</span>
              <p className="text-slate-300 text-[11px]">Spoken audio prompts matching state-specific terminology.</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700">
              <span className="font-bold text-blue-400 block mb-0.5">⚡ Real-Time Engine Sync</span>
              <p className="text-slate-300 text-[11px]">Uses the exact same deterministic eligibility engine.</p>
            </div>
          </div>

          {/* Quick Demo Trigger CTA */}
          <div className="pt-2 flex items-center gap-3">
            <button
              id="hero-call-simulator-btn"
              onClick={startCall}
              disabled={callState === 'CONNECTED' || callState === 'DIALING'}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PhoneCall className="w-4 h-4" />
              <span>TEST CALL SIMULATION (HERO DEMO)</span>
            </button>
          </div>

          {/* Simulated SMS Received Notification */}
          {smsNotification && (
            <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/80 space-y-1 animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                <MessageSquare className="w-4 h-4" />
                <span>NEW SMS RECEIVED (FROM: GOV-SCHEME):</span>
              </div>
              <p className="text-xs text-white font-mono bg-slate-900/90 p-2.5 rounded-xl border border-emerald-900 leading-relaxed">
                {smsNotification}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Realistic Physical Button Phone Hardware Mockup */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="w-68 sm:w-74 bg-slate-800 rounded-[44px] p-4 sm:p-5 border-4 border-slate-700 shadow-2xl shadow-black/80 flex flex-col items-center select-none relative">
            {/* Phone Earpiece */}
            <div className="w-14 h-1.5 bg-slate-900 rounded-full mb-3 border border-slate-700"></div>

            {/* Feature Phone Monochrome / Color LCD Screen */}
            <div className="w-full bg-[#1b3d2f] text-[#4af626] font-mono rounded-xl p-3 border-2 border-slate-900 shadow-inner h-44 flex flex-col justify-between overflow-hidden relative">
              {/* Screen Top Status Bar */}
              <div className="flex items-center justify-between text-[10px] text-[#4af626]/80 border-b border-[#4af626]/30 pb-1">
                <div className="flex items-center gap-1">
                  <Signal className="w-3 h-3" />
                  <span>BSNL 4G</span>
                </div>
                <span>12:00 PM</span>
                <Battery className="w-3.5 h-3.5" />
              </div>

              {/* Screen Main Text */}
              <div className="my-auto text-[11px] leading-tight whitespace-pre-line text-center font-bold tracking-wide">
                {screenText}
              </div>

              {/* Screen Bottom Action Labels */}
              <div className="flex items-center justify-between text-[9px] font-bold text-[#4af626]/90 border-t border-[#4af626]/30 pt-1">
                <span>{callState === 'CONNECTED' ? 'OPTIONS' : 'MENU'}</span>
                <span>{callState === 'CONNECTED' ? 'CLEAR' : 'NAMES'}</span>
              </div>
            </div>

            {/* Phone Brand Name */}
            <div className="text-[10px] tracking-widest text-slate-400 font-black my-2 uppercase">
              ARIVOM GURU
            </div>

            {/* D-Pad & Control Buttons */}
            <div className="w-full grid grid-cols-3 gap-2 mb-3">
              <button
                id="phone-btn-green-call"
                onClick={startCall}
                className="py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center shadow cursor-pointer transition-colors"
                title="Call Button"
              >
                <PhoneCall className="w-4 h-4" />
              </button>

              <div className="h-9 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center text-[10px] text-slate-400 font-bold">
                OK
              </div>

              <button
                id="phone-btn-red-end"
                onClick={endCall}
                className="py-2.5 rounded-xl bg-rose-700 hover:bg-rose-600 active:bg-rose-800 text-white font-bold text-xs flex items-center justify-center shadow cursor-pointer transition-colors"
                title="End Call Button"
              >
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>

            {/* Numeric Keypad Matrix (1-9, *, 0, #) */}
            <div className="w-full grid grid-cols-3 gap-2">
              {keys.map((row, rIdx) =>
                row.map((k) => (
                  <button
                    key={k}
                    id={`phone-key-${k}`}
                    onClick={() => handleKeyPress(k)}
                    className={`py-2 rounded-xl text-center border font-bold text-xs transition-all cursor-pointer ${
                      activeKey === k
                        ? 'bg-emerald-500 text-white scale-95'
                        : 'bg-slate-700 text-slate-100 border-slate-600 hover:bg-slate-600 active:bg-slate-800'
                    }`}
                  >
                    <span className="text-sm font-extrabold">{k}</span>
                    <span className="block text-[8px] text-slate-400 -mt-0.5">
                      {k === '1'
                        ? ' '
                        : k === '2'
                        ? 'ABC'
                        : k === '3'
                        ? 'DEF'
                        : k === '4'
                        ? 'GHI'
                        : k === '5'
                        ? 'JKL'
                        : k === '6'
                        ? 'MNO'
                        : k === '7'
                        ? 'PQRS'
                        : k === '8'
                        ? 'TUV'
                        : k === '9'
                        ? 'WXYZ'
                        : ''}
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Phone Microphone Hole */}
            <div className="w-2 h-2 rounded-full bg-slate-900 mt-4 border border-slate-700"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
