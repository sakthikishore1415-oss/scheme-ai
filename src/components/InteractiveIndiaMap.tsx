import React from 'react';
import { useApp } from '../context/AppContext';
import { STATES_LIST, STATES_CONFIG } from '../data/states';
import { MapPin, CheckCircle2, ChevronRight, Volume2 } from 'lucide-react';

export const InteractiveIndiaMap: React.FC = () => {
  const { selectedStateId, setSelectedStateId, currentStateConfig } = useApp();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase">
            GEOGRAPHIC INTELLIGENCE
          </span>
          <h3 className="text-lg font-black text-slate-900">
            Select State / Union Territory
          </h3>
        </div>
        <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
          <MapPin className="w-3.5 h-3.5" />
          <span>Active: {currentStateConfig.name}</span>
        </div>
      </div>

      <p className="text-xs text-slate-600 leading-relaxed">
        Government welfare schemes vary significantly across state boundaries. Selecting your state filters relevant state-specific gazettes, local departments, and configures the regional voice engine.
      </p>

      {/* Interactive State Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 pt-1">
        {STATES_LIST.map((st) => {
          const isSelected = selectedStateId === st.id;
          const config = STATES_CONFIG[st.id];

          return (
            <button
              key={st.id}
              id={`map-state-btn-${st.id}`}
              onClick={() => setSelectedStateId(st.id)}
              className={`p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                  : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                    isSelected ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {st.id}
                  </span>
                  {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
                <h4 className="text-xs font-extrabold mt-1 leading-tight">{st.name}</h4>
                <p className={`text-[11px] font-mono mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                  {st.nativeName}
                </p>
              </div>

              <div className={`mt-2 pt-2 border-t text-[10px] flex items-center justify-between ${
                isSelected ? 'border-emerald-500 text-emerald-100' : 'border-slate-200 text-slate-500'
              }`}>
                <span>{config?.districts.length || 38} Districts</span>
                <span className="font-semibold">{config?.defaultVoiceLanguage.toUpperCase()} Voice</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
