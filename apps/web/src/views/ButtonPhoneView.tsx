import React from 'react';
import { ButtonPhoneSimulator } from '../components/ButtonPhoneSimulator';
import { SmsSimulator } from '../components/SmsSimulator';
import { LiveSessionTelemetry } from '../components/LiveSessionTelemetry';
import { PhoneCall, ShieldCheck, Zap, Radio, Globe, Layers } from 'lucide-react';

export const ButtonPhoneView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-[#4a1f2d] text-white rounded-3xl p-6 sm:p-8 border border-[#6b3548] shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6b3548] text-[#ffd9e1] text-xs font-bold border border-[#e8e1dc]/30">
            <Radio className="w-3.5 h-3.5 text-[#c8a96b]" />
            ZERO-INTERNET CIVIC ACCESS PLATFORM
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Button Phone (IVR) & 2-Way SMS Gateway
          </h1>
          <p className="text-xs sm:text-sm text-[#ffd9e1] leading-relaxed">
            350M+ Indian citizens do not own a smartphone. Arivom Thittam’s deterministic engine connects directly to standard telecom telephony switches, enabling voice discovery and SMS receipts on any basic ₹1,200 handset.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-4 px-5 rounded-2xl bg-[#310a18] border border-[#e8e1dc]/20 text-center shadow-xs">
            <span className="text-xs text-[#ffd9e1] block font-mono">Toll-Free Helpline</span>
            <strong className="text-xl font-mono text-[#c8a96b]">1800-425-7000</strong>
          </div>
        </div>
      </div>

      {/* Button Phone Simulator (Interactive Hardware) */}
      <section>
        <ButtonPhoneSimulator />
      </section>

      {/* 2-Way SMS Simulator */}
      <section>
        <SmsSimulator />
      </section>

      {/* Live Telemetry Gateway (Real-Time Synchronized Telemetry) */}
      <section>
        <LiveSessionTelemetry />
      </section>
    </div>
  );
};
