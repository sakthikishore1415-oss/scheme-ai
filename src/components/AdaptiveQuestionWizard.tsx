import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { NEED_CATEGORIES } from '../data/categories';
import { NeedCategory } from '../types';
import { speechService } from '../utils/speech';
import {
  Volume2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Check,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';

export const AdaptiveQuestionWizard: React.FC = () => {
  const {
    userProfile,
    updateUserProfile,
    selectedVoiceLanguageId,
    currentLanguageConfig,
    setActiveTab,
    triggerMatchCelebration,
  } = useApp();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  const [tempNeed, setTempNeed] = useState<NeedCategory>(userProfile.need);
  const [tempOccupation, setTempOccupation] = useState<string>(userProfile.occupation);
  const [tempAge, setTempAge] = useState<number>(userProfile.age);
  const [tempIncome, setTempIncome] = useState<number>(userProfile.annualIncome);
  const [tempLand, setTempLand] = useState<number>(userProfile.landHoldingAcres || 0);

  const speakQuestion = (text: string) => {
    speechService.speak(text, selectedVoiceLanguageId);
  };

  const handleFinishWizard = () => {
    updateUserProfile({
      need: tempNeed,
      occupation: tempOccupation,
      age: tempAge,
      annualIncome: tempIncome,
      landHoldingAcres: tempLand,
    });
    triggerMatchCelebration();
    setActiveTab('matches');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200 shadow-sm space-y-6">
      {/* Header & Step Dots */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-emerald-700 uppercase tracking-widest block">
            STEP-BY-STEP ELIGIBILITY WIZARD
          </span>
          <h3 className="text-lg font-black text-slate-900">
            Step {currentStep} of {totalSteps}
          </h3>
        </div>

        {/* Step dots */}
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((step) => (
            <span
              key={step}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                currentStep === step
                  ? 'bg-emerald-600 w-6'
                  : currentStep > step
                  ? 'bg-emerald-300'
                  : 'bg-slate-200'
              }`}
            ></span>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* QUESTION 1: NEED CATEGORY */}
      {/* ========================================================================= */}
      {currentStep === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-900">
              1. What is your primary need or goal?
            </h4>
            <button
              onClick={() =>
                speakQuestion('உங்களுக்கு எந்த துறையில் அரசு உதவி தேவை?')
              }
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
              title="Hear Question in Regional Language"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {NEED_CATEGORIES.map((cat) => {
              const isSelected = tempNeed === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`wizard-need-${cat.id}`}
                  onClick={() => setTempNeed(cat.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <span className="text-xl mb-1">{cat.icon}</span>
                  <div>
                    <p className="text-xs font-bold leading-tight">{cat.label}</p>
                    <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {cat.tamilLabel}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUESTION 2: OCCUPATION */}
      {/* ========================================================================= */}
      {currentStep === 2 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-900">
              2. What is your primary occupation?
            </h4>
            <button
              onClick={() => speakQuestion('உங்கள் தொழில் என்ன?')}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { label: 'Farmer / Agricultural Laborer', tamil: 'விவசாயி / கூலி' },
              { label: 'Student / College Youth', tamil: 'மாணவர் / இளைஞர்' },
              { label: 'Tailor / Artisan / Craftsman', tamil: 'தையல் / கைவினைஞர்' },
              { label: 'Street Vendor / Small Business', tamil: 'வியாபாரி / கடை' },
              { label: 'Senior Citizen / Retired', tamil: 'முதியோர்' },
              { label: 'Unemployed Job Seeker', tamil: 'வேலை தேடுபவர்' },
              { label: 'Construction / Daily Wage Worker', tamil: 'கட்டுமான தொழிலாளி' },
              { label: 'Self-Employed / Homemaker', tamil: 'குடும்பத்தலைவி' },
            ].map((occ, idx) => {
              const isSelected = tempOccupation.toLowerCase().includes(occ.label.toLowerCase().slice(0, 5));
              return (
                <button
                  key={idx}
                  onClick={() => setTempOccupation(occ.label)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{occ.label}</p>
                  <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {occ.tamil}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUESTION 3: AGE */}
      {/* ========================================================================= */}
      {currentStep === 3 && (
        <div className="space-y-5 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-900">
              3. What is your age?
            </h4>
            <button
              onClick={() => speakQuestion('உங்கள் வயது என்ன?')}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="text-center bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3">
            <span className="text-4xl font-black text-emerald-700">{tempAge}</span>
            <span className="text-xs text-slate-500 block">Years Old</span>

            <input
              type="range"
              min="14"
              max="90"
              value={tempAge}
              onChange={(e) => setTempAge(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />

            {/* Quick age chips */}
            <div className="flex items-center justify-center gap-2 pt-2 flex-wrap">
              {[19, 23, 34, 48, 62, 70].map((age) => (
                <button
                  key={age}
                  onClick={() => setTempAge(age)}
                  className={`px-3 py-1 text-xs rounded-full border font-bold cursor-pointer ${
                    tempAge === age
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {age} yrs
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUESTION 4: ANNUAL INCOME */}
      {/* ========================================================================= */}
      {currentStep === 4 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-900">
              4. What is your approximate annual household income?
            </h4>
            <button
              onClick={() => speakQuestion('உங்கள் குடும்ப ஆண்டு வருமானம் எவ்வளவு?')}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { val: 60000, label: 'Below ₹72,000 / year', desc: 'BPL / Low Income (முழுமையான அரசு மானியம்)' },
              { val: 120000, label: '₹72,000 to ₹1,50,000', desc: 'Lower Middle Class (PM-KISAN / CMCHIS eligible)' },
              { val: 200000, label: '₹1,50,000 to ₹2,50,000', desc: 'Income Tax Exempted Group' },
              { val: 400000, label: 'Above ₹2,50,000', desc: 'Middle Income (MSME & Subsidies)' },
            ].map((inc, idx) => {
              const isSelected = tempIncome === inc.val;
              return (
                <button
                  key={idx}
                  onClick={() => setTempIncome(inc.val)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-xs font-bold">{inc.label}</p>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {inc.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUESTION 5: LAND HOLDING */}
      {/* ========================================================================= */}
      {currentStep === 5 && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-extrabold text-slate-900">
              5. Do you or your family own agricultural land?
            </h4>
            <button
              onClick={() => speakQuestion('உங்களுக்கு விவசாய நிலம் உள்ளதா?')}
              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { val: 0, label: 'No Agricultural Land', desc: 'Landless citizen / Urban worker' },
              { val: 2.5, label: 'Small / Marginal (Up to 5 Acres)', desc: 'Eligible for PM-KISAN, seeds & power subsidy' },
              { val: 8, label: 'Large Farmer (> 5 Acres)', desc: 'Commercial agriculture & drip irrigation' },
            ].map((land, idx) => {
              const isSelected = tempLand === land.val;
              return (
                <button
                  key={idx}
                  onClick={() => setTempLand(land.val)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md font-bold'
                      : 'bg-slate-50 text-slate-800 border-slate-200 hover:border-emerald-300'
                  }`}
                >
                  <p className="text-xs font-bold">{land.label}</p>
                  <p className={`text-[11px] mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-slate-500'}`}>
                    {land.desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Navigation Buttons Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
        {currentStep > 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK</span>
          </button>
        ) : (
          <div></div>
        )}

        {currentStep < totalSteps ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <span>NEXT STEP</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            onClick={handleFinishWizard}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>FIND MY MATCHES NOW</span>
            <Sparkles className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
