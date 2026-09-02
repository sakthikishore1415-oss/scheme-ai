import React from 'react';
import { ButtonPhoneSimulator } from '../components/ButtonPhoneSimulator';
import { SmsSimulator } from '../components/SmsSimulator';
import { LiveSessionTelemetry } from '../components/LiveSessionTelemetry';
import { PhoneCall, ShieldCheck, Zap, Radio, Globe, Layers } from 'lucide-react';

export const ButtonPhoneView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/40">
            <Radio className="w-3.5 h-3.5" />
            ZERO-INTERNET CIVIC ACCESS PLATFORM
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Button Phone (IVR) & 2-Way SMS Gateway
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            350M+ Indian citizens do not own a smartphone. Arivom Thittam’s deterministic engine connects directly to standard telecom telephony switches, enabling voice discovery and SMS receipts on any basic ₹1,200 handset.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="p-4 rounded-2xl bg-slate-800 border border-slate-700 text-center">
            <span className="text-xs text-slate-400 block font-mono">Toll-Free Helpline</span>
            <strong className="text-lg font-mono text-emerald-400">1800-425-7000</strong>
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
