import React, { useState } from 'react';
import { MessageSquare, Send, Sparkles, Check, Phone, ArrowRight } from 'lucide-react';

interface SmsMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  time: string;
}

export const SmsSimulator: React.FC = () => {
  const [messages, setMessages] = useState<SmsMessage[]>([
    {
      id: 'm1',
      sender: 'system',
      text: 'ARIVOM THITTAM SMS HELPLINE: Send "SCHEME <NEED> <STATE>" (e.g. "SCHEME FARMER TN" or "SCHEME STUDENT KL") to 51969 to discover eligible government benefits.',
      time: '11:58 AM',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: SmsMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();

      if (lower.includes('farmer') || lower.includes('agri') || lower.includes('tn')) {
        reply =
          'Govt Schemes for TN Farmer:\n1. PM-KISAN: ₹6,000/yr in 3 installments.\n2. Uzhavar Pathukappu: ₹1 Lakh accident + ₹1,000/mo pension + Marriage aid.\n3. CMCHIS: ₹5 Lakhs cashless hospital cover.\nApply at nearest e-Seva with Aadhaar & Land Patta. Portal: tn.gov.in';
      } else if (lower.includes('student') || lower.includes('kl')) {
        reply =
          'Govt Schemes for Kerala Student:\n1. Vidyakiranam Scheme: Free digital study devices & scholarships.\n2. KASP: ₹5 Lakh health cover.\nApply at Akshaya Centre or dte.kerala.gov.in with 10th/12th mark sheet.';
      } else if (lower.includes('senior') || lower.includes('ka')) {
        reply =
          'Govt Schemes for Senior Citizens:\n1. IGNOAPS Pension: ₹1,000-₹1,500/mo direct bank credit.\n2. PM-JAY Ayushman: ₹5 Lakhs free hospital treatment.\nApply at Bangalore One / Grama One with Age Proof & Bank Passbook.';
      } else {
        reply =
          'Arivom Thittam Match:\n1. PM-KISAN / PM SVANidhi (Central Assistance).\n2. Ayushman Bharat Health Insurance (₹5 Lakhs).\nSend "HELP" or visit your nearest Gram Panchayat e-Seva office.';
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: reply,
          time: 'Just now',
        },
      ]);
    }, 1000);
  };

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <span className="text-xs font-bold text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4" />
            SMS CIVIC HELPLINE SIMULATOR
          </span>
          <h3 className="text-xl font-black text-white mt-1">
            2-Way SMS Discovery (Shortcode: 51969)
          </h3>
        </div>
        <span className="text-xs font-mono bg-slate-800 px-3 py-1 rounded-full border border-slate-700 text-slate-300">
          Zero Internet • 2G Network Compatible
        </span>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs text-slate-400 font-semibold">Try SMS Template:</span>
        <button
          onClick={() => handleSend('SCHEME FARMER TN')}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono border border-slate-700 cursor-pointer"
        >
          SCHEME FARMER TN
        </button>
        <button
          onClick={() => handleSend('SCHEME STUDENT KL')}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-mono border border-slate-700 cursor-pointer"
        >
          SCHEME STUDENT KL
        </button>
        <button
          onClick={() => handleSend('SCHEME SENIOR KA')}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-mono border border-slate-700 cursor-pointer"
        >
          SCHEME SENIOR KA
        </button>
      </div>

      {/* SMS Conversation Container */}
      <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 max-h-96 overflow-y-auto space-y-3 font-sans">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm whitespace-pre-line leading-relaxed shadow-sm ${
                m.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-br-none'
                  : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 font-mono text-xs'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
          </div>
        ))}
      </div>

      {/* Send Input Bar */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder='Type SMS keyword (e.g. "SCHEME FARMER TN")...'
          className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-white focus:border-emerald-500 outline-none"
        />
        <button
          onClick={() => handleSend()}
          className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">SEND SMS</span>
        </button>
      </div>
    </div>
  );
};
