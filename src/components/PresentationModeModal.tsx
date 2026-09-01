import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { speechService } from '../utils/speech';
import {
  Flame,
  X,
  Play,
  Pause,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Mic,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export const PresentationModeModal: React.FC = () => {
  const {
    showPresentationMode,
    setShowPresentationMode,
    loadDemoProfile,
    setActiveTab,
    triggerMatchCelebration,
  } = useApp();

  const [currentSlide, setCurrentSlide] = useState<number>(0);

  if (!showPresentationMode) return null;

  const slides = [
    {
      step: 'STEP 1: THE CITIZEN & THE PROBLEM',
      title: 'Murugan (48, Rural Farmer in Trichy, Tamil Nadu)',
      desc: 'Murugan speaks only Tamil, earns ₹1.5L/year, and owns 2.5 acres. Complex government gazettes with dense bureaucratic jargon leave him unaware of schemes he is entitled to.',
      actionLabel: 'LOAD PROFILE & HEAR VOICE',
      action: () => {
        loadDemoProfile('demo-tn-farmer');
        speechService.speak(
          'வணக்கம்! நான் முருகன், திருச்சி மாவட்டத்தில் விவசாயம் பண்றேன். எனக்கு அரசு உதவி திட்டம் வேணும்.',
          'ta'
        );
      },
    },
    {
      step: 'STEP 2: VOICE-FIRST EXTRACTION & REGIONAL DIALECTS',
      title: 'Zero-Friction Natural Spoken Query',
      desc: 'Murugan speaks naturally in Tamil. Arivom Thittam extracts age (48), occupation (Farmer), and category (Agriculture) without requiring complex form typing.',
      actionLabel: 'EXTRACT PROFILE',
      action: () => {
        speechService.speak(
          'உங்கள் விபரங்கள்: வயது 48, தொழில் விவசாயம், மாநிலம் தமிழ்நாடு. தகுதியான திட்டங்களை சரிபார்க்கிறோம்.',
          'ta'
        );
      },
    },
    {
      step: 'STEP 3: DETERMINISTIC ELIGIBILITY & WHY ME?',
      title: 'Deterministic Rules Engine (No AI Hallucinations)',
      desc: 'Our rule-based engine tests rules against official 2026 Gazettes. Scores 92% for PM-KISAN and Uzhavar Pathukappu with transparent "Why Me?" validation in Tamil voice.',
      actionLabel: 'EVALUATE SCHEMES',
      action: () => {
        triggerMatchCelebration();
        speechService.speak(
          'உங்களுக்கு 3 திட்டங்கள் பொருந்துகிறது. முதலாவது பிரதான் மந்திரி கிசான் சம்மான் நிதி. ஆண்டுக்கு 6000 ரூபாய் வங்கி கணக்கில் வரும்.',
          'ta'
        );
      },
    },
    {
      step: 'STEP 4: BUTTON PHONE (IVR) & INCLUSION PROMISE',
      title: 'Same Engine on ₹1,200 Button Phones',
      desc: 'For 350M+ rural citizens without smartphones or internet, Arivom Thittam provides an identical interactive voice IVR gateway and 2-way SMS summaries.',
      actionLabel: 'OPEN BUTTON PHONE SIMULATOR',
      action: () => {
        setShowPresentationMode(false);
        setActiveTab('button_phone');
      },
    },
  ];

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-700 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-xs flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 fill-white" />
              1-MINUTE HERO DEMO
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Slide {currentSlide + 1} of {slides.length}
            </span>
          </div>

          <button
            onClick={() => {
              speechService.stop();
              setShowPresentationMode(false);
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slide Content */}
        <div className="space-y-4 py-2">
          <span className="text-xs font-extrabold text-amber-400 tracking-widest uppercase block">
            {slide.step}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {slide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
            {slide.desc}
          </p>

          <div className="pt-2">
            <button
              onClick={slide.action}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{slide.actionLabel}</span>
            </button>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            disabled={currentSlide === 0}
            onClick={() => setCurrentSlide((prev) => Math.max(0, prev - 1))}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold text-xs hover:bg-slate-700 disabled:opacity-30 cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PREVIOUS</span>
          </button>

          {/* Dots */}
          <div className="flex items-center gap-1.5">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  currentSlide === i ? 'bg-amber-400 w-6' : 'bg-slate-700'
                }`}
              ></span>
            ))}
          </div>

          {currentSlide < slides.length - 1 ? (
            <button
              onClick={() => {
                slide.action();
                setCurrentSlide((prev) => prev + 1);
              }}
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>NEXT</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setShowPresentationMode(false);
                setActiveTab('matches');
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-md"
            >
              <span>EXPLORE ALL MATCHES</span>
              <Sparkles className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
