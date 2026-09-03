import React from 'react';

export type VoiceOrbState = 'READY' | 'LISTENING' | 'THINKING' | 'SPEAKING' | 'PAUSED' | 'ERROR';

interface VoiceOrbVisualizerProps {
  state: VoiceOrbState;
  soundLevel?: number; // 0.0 to 1.0
  onClick?: () => void;
  size?: number;
  langInitial?: string;
}

export const VoiceOrbVisualizer: React.FC<VoiceOrbVisualizerProps> = ({
  state,
  soundLevel = 0,
  onClick,
  size = 200,
  langInitial = 'அ',
}) => {
  // State specific colors & animations
  const getOrbColors = () => {
    switch (state) {
      case 'LISTENING':
        return {
          glow: 'rgba(21, 128, 61, 0.3)', // Emerald glow
          coreGrad: 'radial-gradient(circle at 35% 35%, #16a34a 0%, #4a1f2d 70%, #241c20 100%)',
          ringColor: 'rgba(22, 163, 74, 0.6)',
          rippleColor: 'rgba(22, 163, 74, 0.2)',
          label: 'Listening to your voice...',
          statusBadge: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
        };
      case 'THINKING':
        return {
          glow: 'rgba(200, 169, 107, 0.4)', // Champagne Gold glow
          coreGrad: 'radial-gradient(circle at 35% 35%, #c8a96b 0%, #6b3548 70%, #310a18 100%)',
          ringColor: 'rgba(200, 169, 107, 0.6)',
          rippleColor: 'rgba(200, 169, 107, 0.2)',
          label: 'Arivom is thinking...',
          statusBadge: 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]',
        };
      case 'SPEAKING':
        return {
          glow: 'rgba(107, 53, 72, 0.45)', // Rich Plum glow
          coreGrad: 'radial-gradient(circle at 35% 35%, #874d60 0%, #4a1f2d 70%, #241c20 100%)',
          ringColor: 'rgba(255, 181, 203, 0.7)',
          rippleColor: 'rgba(135, 77, 96, 0.25)',
          label: 'Arivom speaking — tap to interrupt',
          statusBadge: 'bg-[#fdf2f8] text-[#9d174d] border-[#fbcfe8]',
        };
      case 'PAUSED':
        return {
          glow: 'rgba(117, 106, 111, 0.25)', // Muted Taupe
          coreGrad: 'radial-gradient(circle at 35% 35%, #756a6f 0%, #372e32 70%, #21191d 100%)',
          ringColor: 'rgba(213, 194, 197, 0.4)',
          rippleColor: 'rgba(117, 106, 111, 0.1)',
          label: 'Conversation paused',
          statusBadge: 'bg-[#fbf9f5] text-[#514346] border-[#e8e1dc]',
        };
      case 'ERROR':
        return {
          glow: 'rgba(186, 26, 26, 0.35)', // Civic error
          coreGrad: 'radial-gradient(circle at 35% 35%, #ba1a1a 0%, #4a1f2d 70%, #241c20 100%)',
          ringColor: 'rgba(255, 218, 214, 0.5)',
          rippleColor: 'rgba(186, 26, 26, 0.2)',
          label: 'Speech input paused or interrupted',
          statusBadge: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
        };
      case 'READY':
      default:
        return {
          glow: 'rgba(74, 31, 45, 0.35)', // Deep Burgundy glow
          coreGrad: 'radial-gradient(circle at 35% 35%, #6b3548 0%, #4a1f2d 70%, #21191d 100%)',
          ringColor: 'rgba(200, 169, 107, 0.5)',
          rippleColor: 'rgba(74, 31, 45, 0.15)',
          label: 'Ready to listen — tap to speak',
          statusBadge: 'bg-white text-[#4a1f2d] border-[#e8e1dc] shadow-2xs',
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
        title={
          state === 'SPEAKING'
            ? 'Arivom is speaking — Click to interrupt immediately and start speaking'
            : state === 'THINKING'
            ? 'Arivom is thinking — Click to cancel and speak'
            : 'Tap orb to toggle voice interaction'
        }
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
            boxShadow: `0 0 ${35 + soundLevel * 35}px ${orbInfo.glow}`,
          }}
        />

        {/* Core Living Orb */}
        <div
          className="relative rounded-full transition-transform duration-300 flex items-center justify-center overflow-hidden shadow-xl border"
          style={{
            width: `${size * 0.72}px`,
            height: `${size * 0.72}px`,
            background: orbInfo.coreGrad,
            borderColor: orbInfo.ringColor,
            transform: `scale(${dynamicScale})`,
            boxShadow: `inset 0 -12px 24px rgba(0,0,0,0.4), inset 0 8px 16px rgba(255,255,255,0.2), 0 10px 25px ${orbInfo.glow}`,
          }}
        >
          {/* Central Animated Waveform Bars during active speech */}
          <div className="relative z-10 flex items-center gap-1.5 h-10 px-4">
            {state === 'LISTENING' && (
              <>
                <span className="w-1.5 h-5 bg-[#faf8f3] rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <span className="w-1.5 h-8 bg-[#c8a96b] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-1.5 h-7 bg-[#c8a96b] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="w-1.5 h-4 bg-[#faf8f3] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </>
            )}

            {state === 'SPEAKING' && (
              <>
                <span className="w-1.5 h-6 bg-[#ffd9e1] rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
                <span className="w-1.5 h-10 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                <span className="w-1.5 h-8 bg-[#c8a96b] rounded-full animate-pulse" style={{ animationDelay: '0.3s' }} />
                <span className="w-1.5 h-11 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                <span className="w-1.5 h-5 bg-[#ffd9e1] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
              </>
            )}

            {state === 'THINKING' && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#c8a96b] animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-[#ffdea0] animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 rounded-full bg-[#c8a96b] animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            {state === 'READY' && (
              <div className="text-white/90 font-bold text-lg tracking-wider flex items-center gap-1">
                <span>{langInitial}</span>
              </div>
            )}

            {state === 'PAUSED' && (
              <div className="w-4 h-4 rounded-xs border-2 border-[#e8e1dc]" />
            )}

            {state === 'ERROR' && (
              <div className="w-3 h-3 rounded-full bg-[#ffdad6]" />
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

