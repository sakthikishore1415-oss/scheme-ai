import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Activity,
  PhoneCall,
  Smartphone,
  MapPin,
  Volume2,
  Clock,
  Radio,
} from 'lucide-react';

export const LiveSessionTelemetry: React.FC = () => {
  const { liveSessions } = useApp();

  return (
    <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
          <h3 className="text-sm font-extrabold tracking-wider uppercase text-emerald-400">
            CITIZEN TELEMETRY & GATEWAY
          </h3>
        </div>
        <span className="text-[11px] text-slate-400 font-mono">
          Gateway Status: Ready
        </span>
      </div>

      {liveSessions.length === 0 ? (
        <div className="p-8 text-center text-slate-400 space-y-2">
          <Radio className="w-8 h-8 mx-auto text-slate-500" />
          <h4 className="text-sm font-bold text-slate-300">Live telemetry unavailable.</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Real session telemetry will appear here when citizens interact via IVR telephony, SMS gateways, or direct voice inputs.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {liveSessions.map((session, idx) => (
            <div
              key={session.sessionId + idx}
              className="p-3.5 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                    session.device.includes('Button') || session.device.includes('IVR')
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {session.device.includes('Button') || session.device.includes('IVR') ? (
                    <PhoneCall className="w-4 h-4" />
                  ) : (
                    <Smartphone className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-bold">{session.citizenName}</strong>
                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-slate-700 text-slate-300">
                      {session.device}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-400" />
                      {session.stateId} State
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-teal-400" />
                      {session.voiceLanguage.toUpperCase()} Voice
                    </span>
                    <span>•</span>
                    <span className="capitalize text-emerald-300 font-semibold">
                      {session.need.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between border-t sm:border-t-0 border-slate-700 pt-2 sm:pt-0">
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {session.status}
                </span>
                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {session.timestamp}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
