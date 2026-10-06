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
      <div className="bg-[#4a1f2d] text-white rounded-3xl p-6 sm:p-8 border border-[#6b3548] shadow-sm space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6b3548] text-[#ffd9e1] text-xs font-bold border border-[#e8e1dc]/30">
          <Cpu className="w-3.5 h-3.5 text-[#c8a96b]" />
          TECHNICAL ARCHITECTURE & CIVIC TECH VISION
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          PACS Sahayak System Architecture
        </h1>
        <p className="text-xs sm:text-sm text-[#ffd9e1] max-w-3xl leading-relaxed">
          Designed from the ground up for 1.4 billion Indian citizens. Solving the twin barriers of complex administrative language and the digital divide through voice-first, state-aware, and button-phone inclusive engineering.
        </p>
      </div>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-[#e8e1dc] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eedfe4] text-[#4a1f2d] flex items-center justify-center font-bold">
            <Volume2 className="w-5 h-5 text-[#4a1f2d]" />
          </div>
          <h3 className="font-bold text-[#21191d] text-base">1. Voice-First Interaction</h3>
          <p className="text-xs text-[#514346] leading-relaxed">
            Eliminates complex bureaucratic keyboard typing. Citizens speak naturally in regional Indian languages (Tamil, Malayalam, Kannada, Telugu, Hindi, Bengali, etc.).
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#e8e1dc] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eedfe4] text-[#4a1f2d] flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5 text-[#4a1f2d]" />
          </div>
          <h3 className="font-bold text-[#21191d] text-base">2. Deterministic Rules Engine</h3>
          <p className="text-xs text-[#514346] leading-relaxed">
            No generative AI hallucinations for official eligibility. Rule-based evaluation directly mirrors published 2026 State & Central Government Gazettes.
          </p>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-[#e8e1dc] shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eedfe4] text-[#4a1f2d] flex items-center justify-center font-bold">
            <PhoneCall className="w-5 h-5 text-[#4a1f2d]" />
          </div>
          <h3 className="font-bold text-[#21191d] text-base">3. Zero-Internet Button Phone Reach</h3>
          <p className="text-xs text-[#514346] leading-relaxed">
            Toll-Free 1800 IVR telephony and 2-way SMS shortcodes bring the exact same intelligence to ₹1,200 feature phones without data connectivity.
          </p>
        </div>
      </div>

      {/* Complete Pipeline Diagram Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8e1dc] shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-[#21191d]">
          End-to-End System Pipeline Flow
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 text-xs">
          <div className="p-4 rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] space-y-2">
            <span className="font-mono font-bold text-[#4a1f2d] block text-[10px]">LAYER 01</span>
            <strong className="text-[#21191d] text-sm block">Citizen Channels</strong>
            <p className="text-[#514346] text-[11px] leading-relaxed">
              • Web Smartphone UI<br/>
              • Button Phone (IVR 1800)<br/>
              • 2-Way SMS (51969)<br/>
              • CSC / e-Seva Assisted Desk
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] space-y-2">
            <span className="font-mono font-bold text-[#4a1f2d] block text-[10px]">LAYER 02</span>
            <strong className="text-[#21191d] text-sm block">Speech & NLP Parser</strong>
            <p className="text-[#514346] text-[11px] leading-relaxed">
              • Web Speech API (BCP-47)<br/>
              • Telephony Audio Gateway<br/>
              • Parameter Extraction<br/>
              • Tone Cadence Fallback
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] space-y-2">
            <span className="font-mono font-bold text-[#4a1f2d] block text-[10px]">LAYER 03</span>
            <strong className="text-[#21191d] text-sm block">Deterministic Engine</strong>
            <p className="text-[#514346] text-[11px] leading-relaxed">
              • State Gazette Rules<br/>
              • Age & Income Bounds<br/>
              • Land & Occupation Filters<br/>
              • Weighted Scoring (0-100%)
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] space-y-2">
            <span className="font-mono font-bold text-[#4a1f2d] block text-[10px]">LAYER 04</span>
            <strong className="text-[#21191d] text-sm block">Explainability ("Why Me?")</strong>
            <p className="text-[#514346] text-[11px] leading-relaxed">
              • Criteria Comparison<br/>
              • Plain English Summary<br/>
              • Regional Dialect Spoken Audio<br/>
              • Required Docs Checklist
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf8f3] border border-[#e8e1dc] space-y-2">
            <span className="font-mono font-bold text-[#4a1f2d] block text-[10px]">LAYER 05</span>
            <strong className="text-[#21191d] text-sm block">Action & Fulfillment</strong>
            <p className="text-[#514346] text-[11px] leading-relaxed">
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
