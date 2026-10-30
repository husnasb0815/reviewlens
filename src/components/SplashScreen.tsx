import React, { useEffect, useState } from 'react';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    // 2.6s loading bar duration, then transition
    const timer = setTimeout(() => {
      setFade(true);
      const closeTimer = setTimeout(onFinish, 400);
      return () => clearTimeout(closeTimer);
    }, 2600);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const handleSkip = () => {
    setFade(true);
    setTimeout(onFinish, 200);
  };

  return (
    <div
      role="status"
      aria-label="Review Lens is loading"
      className={`fixed inset-0 z-50 bg-[#0B1220] flex flex-col items-center justify-center gap-4.5 select-none transition-opacity duration-300 ${
        fade ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background radial indigo glow */}
      <div className="absolute w-[420px] h-[420px] max-w-[90vw] max-h-[90vw] rounded-full bg-[radial-gradient(circle,rgba(79,70,229,0.35),transparent_65%)] animate-splash-glow pointer-events-none" />

      {/* Animated SVG magnifying-glass mark matching Review Lens.html */}
      <svg
        className="relative w-[min(46vw,190px)] h-auto overflow-visible"
        viewBox="0 0 160 160"
        aria-hidden="true"
      >
        <circle
          className="animate-splash-ring"
          cx="70"
          cy="70"
          r="38"
          fill="#141B34"
          stroke="#818CF8"
          strokeWidth="8"
          strokeLinecap="round"
          transform="rotate(-90 70 70)"
        />
        <line
          className="animate-splash-handle"
          x1="98"
          y1="98"
          x2="126"
          y2="126"
          stroke="#818CF8"
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Sentiment bars: Red (Negative), Yellow (Neutral), Green (Positive) */}
        <rect
          className="animate-splash-bar-1"
          x="52"
          y="74"
          width="12"
          height="16"
          rx="3"
          fill="#EF4444"
        />
        <rect
          className="animate-splash-bar-2"
          x="67"
          y="62"
          width="12"
          height="28"
          rx="3"
          fill="#F59E0B"
        />
        <rect
          className="animate-splash-bar-3"
          x="82"
          y="46"
          width="12"
          height="44"
          rx="3"
          fill="#10B981"
        />
        {/* Sparkle */}
        <path
          className="animate-splash-spark"
          d="M110 18 L113.5 26.5 L122 30 L113.5 33.5 L110 42 L106.5 33.5 L98 30 L106.5 26.5 Z"
          fill="#A5B4FC"
        />
      </svg>

      {/* Review Lens Wordmark */}
      <h2 className="relative m-0 text-[clamp(30px,9vw,42px)] font-semibold tracking-tight text-[#F1F5F9] font-display animate-splash-title">
        Review <span className="text-[#818CF8]">Lens</span>
      </h2>

      {/* Tagline */}
      <p className="relative -mt-2 text-[15px] text-[#94A3B8] animate-splash-tag">
        AI feedback analyser
      </p>

      {/* Animated 3-color progress bar */}
      <div className="absolute bottom-[calc(48px+env(safe-area-inset-bottom,0px))] w-[120px] h-[3px] rounded-full bg-[#1E293B] overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#10B981] via-[#F59E0B] to-[#EF4444] animate-splash-progress w-full" />
      </div>

      {/* Skip button for rapid accessibility */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-md bg-slate-800/60 border border-slate-700/50"
      >
        Skip intro
      </button>
    </div>
  );
};
