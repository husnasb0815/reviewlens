import React from 'react';

interface ReviewLensLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  onClick?: () => void;
}

export const ReviewLensLogo: React.FC<ReviewLensLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  onClick,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const textStyles = {
    sm: 'text-base font-semibold',
    md: 'text-lg font-bold',
    lg: 'text-2xl font-bold',
  }[size];

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      <div className={`relative ${iconDimensions} shrink-0`}>
        <svg
          viewBox="0 0 160 160"
          className="w-full h-full overflow-visible"
          aria-hidden="true"
        >
          <circle
            cx="70"
            cy="70"
            r="38"
            fill="#141B34"
            stroke="#818CF8"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <line
            x1="98"
            y1="98"
            x2="126"
            y2="126"
            stroke="#818CF8"
            strokeWidth="10"
            strokeLinecap="round"
          />
          {/* Sentiment bars: Red, Amber, Emerald */}
          <rect x="52" y="74" width="12" height="16" rx="3" fill="#EF4444" />
          <rect x="67" y="62" width="12" height="28" rx="3" fill="#F59E0B" />
          <rect x="82" y="46" width="12" height="44" rx="3" fill="#10B981" />
          {/* Spark */}
          <path
            d="M110 18 L113.5 26.5 L122 30 L113.5 33.5 L110 42 L106.5 33.5 L98 30 L106.5 26.5 Z"
            fill="#A5B4FC"
          />
        </svg>
      </div>

      {showText && (
        <span className={`font-display tracking-tight text-slate-900 dark:text-slate-100 ${textStyles}`}>
          Review<span className="text-indigo-600 dark:text-[#818CF8]">Lens</span>
        </span>
      )}
    </div>
  );
};
