import React from 'react';
import {
  Cpu,
  ShieldCheck,
  PhoneCall,
  Volume2,
  MapPin,
  Sparkles,
  Layers,
  CheckCircle2,
  Globe,
  Database,
  Terminal,
  Zap,
} from 'lucide-react';

export const AboutArchitectureView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/40">
          <Cpu className="w-3.5 h-3.5" />
          TECHNICAL ARCHITECTURE & CIVIC TECH VISION
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Arivom Thittam (அறிவோம் திட்டம்) System Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
          Designed from the ground up for 1.4 billion Indian citizens. Solving the twin barriers of complex administrative language and the digital divide through voice-first, state-aware, and button-phone inclusive engineering.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <Volume2 className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">1. Voice-First Interaction</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eliminates complex bureaucratic keyboard typing. Citizens speak naturally in regional Indian languages (Tamil, Malayalam, Kannada, Telugu, Hindi, Bengali, etc.).
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#ffd9e1] text-[#4a1f2d] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">2. Deterministic Rules Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            No generative AI hallucinations for official eligibility. Rule-based evaluation directly mirrors published 2026 State & Central Government Gazettes.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5" />
          </div>
          <h3 className="font-extrabold text-slate-900 text-base">3. Zero-Internet Button Phone Reach</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Toll-Free 1800 IVR telephony and 2-way SMS shortcodes bring the exact same intelligence to ₹1,200 feature phones without data connectivity.
          </p>
        </div>
      </div>

      {/* Complete Pipeline Diagram Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
        <h2 className="text-lg font-black text-slate-900">
          End-to-End System Pipeline Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-mono font-bold text-emerald-700 block text-[10px]">LAYER 01</span>
            <strong className="text-slate-900 text-sm block">Citizen Channels</strong>
            <p className="text-slate-600 text-[11px]">
              • Web Smartphone UI<br/>
              • Button Phone (IVR 1800)<br/>
              • 2-Way SMS (51969)<br/>
              • CSC / e-Seva Assisted Desk
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-mono font-bold text-emerald-700 block text-[10px]">LAYER 02</span>
            <strong className="text-slate-900 text-sm block">Speech & NLP Parser</strong>
            <p className="text-slate-600 text-[11px]">
              • Web Speech API (BCP-47)<br/>
              • Telephony Audio Gateway<br/>
              • Parameter Extraction<br/>
              • Tone Cadence Fallback
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-mono font-bold text-emerald-700 block text-[10px]">LAYER 03</span>
            <strong className="text-slate-900 text-sm block">Deterministic Engine</strong>
            <p className="text-slate-600 text-[11px]">
              • State Gazette Rules<br/>
              • Age & Income Bounds<br/>
              • Land & Occupation Filters<br/>
              • Weighted Scoring (0-100%)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-mono font-bold text-emerald-700 block text-[10px]">LAYER 04</span>
            <strong className="text-slate-900 text-sm block">Explainability ("Why Me?")</strong>
            <p className="text-slate-600 text-[11px]">
              • Criteria Comparison<br/>
              • Plain English Summary<br/>
              • Regional Dialect Spoken Audio<br/>
              • Required Docs Checklist
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-mono font-bold text-emerald-700 block text-[10px]">LAYER 05</span>
            <strong className="text-slate-900 text-sm block">Action & Fulfillment</strong>
            <p className="text-slate-600 text-[11px]">
              • e-Seva / CSC Navigation<br/>
              • SMS Receipt to Feature Phone<br/>
              • WhatsApp Scheme Sharing<br/>
              • Printable Citizen Dossier
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
