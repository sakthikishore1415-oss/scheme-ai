import React, { useState } from 'react';

interface PacsAppIconProps {
  size?: number;
  className?: string;
  variant?: 'squircle' | 'circle';
  showBorder?: boolean;
}

export const PacsAppIcon: React.FC<PacsAppIconProps> = ({
  size = 40,
  className = '',
  variant = 'squircle',
  showBorder = true,
}) => {
  const [imageError, setImageError] = useState(false);

  const roundedClass = variant === 'circle' ? 'rounded-full' : 'rounded-2xl';

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 overflow-hidden ${roundedClass} ${
        showBorder ? 'ring-1 ring-[#c8a96b]/60 shadow-sm' : ''
      } ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: 'linear-gradient(135deg, #e3c282 0%, #b88e3f 30%, #5c2033 100%)',
      }}
      title="PACS Sahayak"
    >
      {!imageError ? (
        <img
          src="/pacs-icon.png"
          alt="PACS Sahayak Emblem"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        /* Crisp Vector SVG Fallback with Shield, Wheat Sheaves, and Sprout */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full p-1 text-[#ffd9e1]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer Sunburst Ray Glow */}
          <path d="M50 8 L52 18 L50 20 L48 18 Z" fill="#ffd572" opacity="0.8" />
          <path d="M38 12 L43 20 L41 21 L36 14 Z" fill="#ffd572" opacity="0.6" />
          <path d="M62 12 L64 14 L59 21 L57 20 Z" fill="#ffd572" opacity="0.6" />

          {/* Left Wheat Sheaf */}
          <path
            d="M20 68 C 16 52 20 32 34 22 C 30 28 28 38 29 48 C 24 45 22 40 22 36 C 21 42 22 50 25 56 C 21 54 19 50 19 46 C 18 54 21 62 25 68 Z"
            fill="#e5c158"
          />
          {/* Right Wheat Sheaf */}
          <path
            d="M80 68 C 84 52 80 32 66 22 C 70 28 72 38 71 48 C 76 45 78 40 78 36 C 79 42 78 50 75 56 C 79 54 81 50 81 46 C 82 54 79 62 75 68 Z"
            fill="#e5c158"
          />

          {/* Golden Shield Rim */}
          <path
            d="M50 16 L74 27 C 74 54 62 73 50 82 C 38 73 26 54 26 27 Z"
            fill="#3d1422"
            stroke="#e5c158"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Inner Shield Wine Plate */}
          <path
            d="M50 22 L69 31 C 69 52 59 68 50 75 C 41 68 31 52 31 31 Z"
            fill="#521b2f"
          />

          {/* Central Supporting Hands (Golden) */}
          <path
            d="M37 46 C 36 50 39 56 43 62 C 45 65 47 70 47 74 L 43 74 C 41 68 37 64 34 58 C 32 54 32 49 34 46 C 35 44 37 44 37 46 Z"
            fill="#f6d365"
          />
          <path
            d="M63 46 C 64 50 61 56 57 62 C 55 65 53 70 53 74 L 57 74 C 59 68 63 64 66 58 C 68 54 68 49 66 46 C 65 44 63 44 63 46 Z"
            fill="#f6d365"
          />

          {/* Green Seedling / Sprout of Growth */}
          {/* Center Leaf */}
          <path
            d="M50 30 C 56 38 54 48 50 56 C 46 48 44 38 50 30 Z"
            fill="#22c55e"
          />
          {/* Left Leaf */}
          <path
            d="M50 46 C 42 40 37 44 38 50 C 44 52 48 50 50 46 Z"
            fill="#16a34a"
          />
          {/* Right Leaf */}
          <path
            d="M50 46 C 58 40 63 44 62 50 C 56 52 52 50 50 46 Z"
            fill="#16a34a"
          />
          {/* Stem */}
          <path
            d="M49 46 L 51 46 L 50.5 64 L 49.5 64 Z"
            fill="#15803d"
          />
        </svg>
      )}
    </div>
  );
};
