import React from 'react';

export type VoiceOrbState = 'READY' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'PAUSED' | 'ERROR';

interface VoiceOrbVisualizerProps {
  state: VoiceOrbState;
  soundLevel?: number; // 0.0 to 1.0
  onClick?: () => void;
  size?: number;
}

export const VoiceOrbVisualizer: React.FC<VoiceOrbVisualizerProps> = ({
  state,
  soundLevel = 0,
  onClick,
  size = 200,
}) => {
  // State specific colors & animations
  const getOrbColors = () => {
    switch (state) {
      case 'LISTENING':
        return {
          glow: 'rgba(15, 138, 95, 0.45)', // Emerald glow
          coreGrad: 'radial-gradient(circle at 35% 35%, #0F8A5F 0%, #00462D 60%, #092554 100%)',
          ringColor: 'rgba(148, 246, 196, 0.6)',
          rippleColor: 'rgba(15, 138, 95, 0.25)',
          label: 'Listening to your voice...',
          statusBadge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        };
      case 'THINKING':
        return {
          glow: 'rgba(254, 166, 25, 0.45)', // Saffron glow
          coreGrad: 'radial-gradient(circle at 35% 35%, #FEA619 0%, #855300 60%, #092554 100%)',
          ringColor: 'rgba(254, 166, 25, 0.6)',
          rippleColor: 'rgba(254, 166, 25, 0.2)',
          label: 'Understanding & finding schemes...',
          statusBadge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
        };
      case 'SPEAKING':
        return {
          glow: 'rgba(56, 126, 245, 0.55)', // Radiant indigo glow
          coreGrad: 'radial-gradient(circle at 35% 35%, #5B95F7 0%, #092554 60%, #001233 100%)',
          ringColor: 'rgba(176, 198, 255, 0.8)',
          rippleColor: 'rgba(91, 149, 247, 0.3)',
          label: 'Arivom Thittam is speaking...',
          statusBadge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        };
      case 'PAUSED':
        return {
          glow: 'rgba(100, 116, 139, 0.25)',
          coreGrad: 'radial-gradient(circle at 35% 35%, #475569 0%, #1e293b 70%, #0f172a 100%)',
          ringColor: 'rgba(148, 163, 184, 0.4)',
          rippleColor: 'rgba(100, 116, 139, 0.1)',
          label: 'Conversation paused',
          statusBadge: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
        };
      case 'ERROR':
        return {
          glow: 'rgba(225, 29, 72, 0.4)',
          coreGrad: 'radial-gradient(circle at 35% 35%, #E11D48 0%, #881337 70%, #092554 100%)',
          ringColor: 'rgba(253, 164, 175, 0.5)',
          rippleColor: 'rgba(225, 29, 72, 0.2)',
          label: 'Speech input paused or interrupted',
          statusBadge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        };
      case 'READY':
      default:
        return {
          glow: 'rgba(9, 37, 84, 0.4)',
          coreGrad: 'radial-gradient(circle at 35% 35%, #1d4ed8 0%, #092554 60%, #000e26 100%)',
          ringColor: 'rgba(148, 246, 196, 0.4)',
          rippleColor: 'rgba(9, 37, 84, 0.15)',
          label: 'Ready to listen — tap to speak',
          statusBadge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
        };
    }
  };

  const orbInfo = getOrbColors();
  const dynamicScale = 1 + Math.min(soundLevel * 0.35, 0.35);

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* Outer Glow & Animated Orb Container */}
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className="relative flex items-center justify-center cursor-pointer group"
        onClick={onClick}
        title="Tap orb to toggle voice interaction"
      >
        {/* Ambient Expanding Ripple 1 */}
        {(state === 'LISTENING' || state === 'SPEAKING') && (
          <div
            className="absolute rounded-full pointer-events-none animate-ping opacity-30"
            style={{
              width: `${size * 0.9}px`,
              height: `${size * 0.9}px`,
              backgroundColor: orbInfo.rippleColor,
              animationDuration: state === 'LISTENING' ? '2.4s' : '1.8s',
            }}
          />
        )}

        {/* Ambient Soft Halo Ring */}
        <div
          className="absolute rounded-full transition-all duration-700 pointer-events-none"
          style={{
            width: `${size * 1.15}px`,
            height: `${size * 1.15}px`,
            boxShadow: `0 0 ${40 + soundLevel * 40}px ${orbInfo.glow}`,
          }}
        />

        {/* Core Living Orb */}
        <div
          className="relative rounded-full transition-transform duration-300 flex items-center justify-center overflow-hidden shadow-2xl border-2"
          style={{
            width: `${size * 0.72}px`,
            height: `${size * 0.72}px`,
            background: orbInfo.coreGrad,
            borderColor: orbInfo.ringColor,
            transform: `scale(${dynamicScale})`,
            boxShadow: `inset 0 -15px 30px rgba(0,0,0,0.6), inset 0 10px 20px rgba(255,255,255,0.3), 0 15px 35px ${orbInfo.glow}`,
          }}
        >
          {/* Internal Organic Liquid Flow Waveforms */}
          <div
            className={`absolute inset-0 opacity-40 mix-blend-overlay ${
              state === 'LISTENING' || state === 'SPEAKING'
                ? 'animate-spin'
                : state === 'THINKING'
                ? 'animate-pulse'
                : ''
            }`}
            style={{
              background:
                'radial-gradient(circle at 50% 120%, #FEA619 0%, transparent 60%), radial-gradient(circle at 10% 20%, #94F6C4 0%, transparent 50%)',
              animationDuration: '8s',
            }}
          />

          {/* Central Animated Waveform Bars during active speech */}
          <div className="relative z-10 flex items-center gap-1.5 h-10 px-4">
            {state === 'LISTENING' && (
              <>
                <span className="w-1.5 h-5 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <span className="w-1.5 h-8 bg-emerald-200 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-1.5 h-7 bg-emerald-200 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="w-1.5 h-4 bg-emerald-300 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </>
            )}

            {state === 'SPEAKING' && (
              <>
                <span className="w-1.5 h-6 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <span className="w-1.5 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-8 bg-amber-300 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-1.5 h-11 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="w-1.5 h-5 bg-blue-200 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </>
            )}

            {state === 'THINKING' && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            {state === 'READY' && (
              <div className="text-white/80 font-bold text-lg tracking-wider flex items-center gap-1">
                <span>அ</span>
              </div>
            )}

            {state === 'PAUSED' && (
              <div className="w-4 h-4 rounded-xs border-2 border-slate-300" />
            )}

            {state === 'ERROR' && (
              <div className="w-3 h-3 rounded-full bg-rose-400" />
            )}
          </div>
        </div>
      </div>

      {/* State Caption Pill */}
      <div className="mt-3">
        <span className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${orbInfo.statusBadge}`}>
          {orbInfo.label}
        </span>
      </div>
    </div>
  );
};
