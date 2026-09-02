import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageSquare, Send, Sparkles, Check, Phone, ArrowRight, AlertCircle } from 'lucide-react';

interface SmsMessage {
  id: string;
  sender: 'user' | 'system';
  text: string;
  time: string;
}

export const SmsSimulator: React.FC = () => {
  const { schemes, schemesStatus } = useApp();

  const [messages, setMessages] = useState<SmsMessage[]>([
    {
      id: 'm1',
      sender: 'system',
      text: 'ARIVOM THITTAM SMS HELPLINE: Send "SCHEME <SECTOR> <STATE>" (e.g. "SCHEME FARMER TN" or "SCHEME EDUCATION KL") to 51969 to query verified government schemes.',
      time: 'Ready',
    },
  ]);
  const [inputText, setInputText] = useState<string>('');

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: SmsMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      time: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Process query against real connected scheme repository
    const lower = text.toLowerCase();
    let reply = '';

    if (schemesStatus === 'NO_DATA' || schemes.length === 0) {
      reply = 'ARIVOM:\nService unavailable.\nPlease try again later.';
    } else {
      // Find matching schemes
      const matched = schemes.filter((s) => {
        const nameMatch = s.name.toLowerCase().includes(lower);
        const catMatch = lower.includes(s.category);
        const stateMatch = s.stateId === 'ALL' || lower.includes(s.stateId.toLowerCase());
        return catMatch || (nameMatch && stateMatch);
      });

      if (matched.length > 0) {
        const list = matched
          .slice(0, 3)
          .map((s, idx) => `${idx + 1}. ${s.name}: ${s.benefits?.amount || s.benefits?.shortSummary || ''}`)
          .join('\n');
        reply = `ARIVOM THITTAM MATCHES:\n${list}\nApply with Aadhaar at nearest e-Seva center.`;
      } else {
        reply = `ARIVOM:\nNo matching schemes found for query "${text}". Send "HELP" or visit your nearest Gram Panchayat e-Seva office.`;
      }
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
          Zero Internet • 2G GSM Gateway Protocol
        </span>
      </div>

      {/* Notice Banner */}
      <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>ℹ️ Simulation only — no real SMS was sent. Operates against connected scheme repository.</span>
      </div>

      {/* Preset Quick Chips */}
      <div className="flex items-center gap-2 flex-wrap text-xs">
        <span className="text-slate-400 font-semibold">Try Query:</span>
        <button
          onClick={() => handleSend('SCHEME AGRICULTURE TN')}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-mono border border-slate-700 cursor-pointer"
        >
          SCHEME AGRICULTURE TN
        </button>
        <button
          onClick={() => handleSend('SCHEME EDUCATION KL')}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-mono border border-slate-700 cursor-pointer"
        >
          SCHEME EDUCATION KL
        </button>
        <button
          onClick={() => handleSend('SCHEME WOMEN')}
          className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-300 text-xs font-mono border border-slate-700 cursor-pointer"
        >
          SCHEME WOMEN
        </button>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-950 rounded-2xl p-4 h-80 overflow-y-auto space-y-3 border border-slate-800 font-sans text-xs flex flex-col justify-end">
        <div className="space-y-3 overflow-y-auto pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl whitespace-pre-line leading-relaxed font-mono ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-xs'
                    : 'bg-slate-800 text-slate-100 rounded-bl-xs border border-slate-700'
                }`}
              >
                {m.text}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Input Message Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex items-center gap-2"
      >
        <input
          type="text"
          placeholder='Type SMS command, e.g. "SCHEME AGRICULTURE TN"...'
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-1 p-3.5 rounded-2xl bg-slate-950 border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
        />
        <button
          type="submit"
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md cursor-pointer flex items-center justify-center"
          title="Send SMS"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
