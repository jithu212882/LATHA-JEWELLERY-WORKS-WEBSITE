import React, { useState, useEffect } from 'react';

export default function Preloader() {
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // 1. Preload logo image object in memory immediately
    const img = new Image();
    img.src = '/assets/latha-jewellery-works-logo.jpeg';

    // 2. Trigger logo opacity & scale reveal instantly on mount
    const timerFadeIn = setTimeout(() => {
      setFadeIn(true);
    }, 20);

    // 3. Hold splash screen for 2.2s while site initializes
    const timerFadeOut = setTimeout(() => {
      setFadeOut(true);

      // 4. Unmount splash screen after crossfade completes (500ms)
      const timerUnmount = setTimeout(() => {
        setMounted(false);
      }, 500);

      return () => clearTimeout(timerUnmount);
    }, 2200);

    return () => {
      clearTimeout(timerFadeIn);
      clearTimeout(timerFadeOut);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-[#0B0C0E] flex flex-col items-center justify-center p-6 transition-opacity duration-500 ease-out select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className={`flex flex-col items-center text-center max-w-xs sm:max-w-sm transition-all duration-700 ease-out transform ${
          fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Official Shop Logo Mark */}
        <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-2xl overflow-hidden shadow-2xl mb-6 p-1 bg-[#121212] border border-accent-gold/40 ring-1 ring-accent-gold/20">
          <img
            src="/assets/latha-jewellery-works-logo.jpeg"
            alt="Latha Jewellery Works Official Logo"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/assets/latha-logo.jpg';
            }}
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Minimal Editorial Subtitle */}
        <span className="text-[11px] sm:text-xs text-[#F5F2EB]/70 uppercase tracking-[0.3em] font-light font-sans mb-1">
          EST. 1990 • CHATHENCODE
        </span>

        {/* Understated Gold Progress Line */}
        <div className="w-28 h-[2px] bg-[#1E1E1E] rounded-full overflow-hidden mt-6">
          <div className="w-full h-full bg-gradient-to-r from-accent-gold/40 via-accent-gold to-accent-gold/40 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}



