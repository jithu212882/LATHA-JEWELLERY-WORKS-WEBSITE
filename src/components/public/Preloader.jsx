import React, { useState, useEffect } from 'react';

export default function Preloader() {
  const [fadeIn, setFadeIn] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // 1. Trigger soft logo fade-in & scale reveal on mount
    const timerFadeIn = setTimeout(() => {
      setFadeIn(true);
    }, 50);

    // 2. Hold logo screen while website initializes (~1.6s)
    const timerFadeOut = setTimeout(() => {
      setFadeOut(true);

      // 3. Unmount splash screen after crossfade out completes (400ms)
      const timerUnmount = setTimeout(() => {
        setMounted(false);
      }, 400);

      return () => clearTimeout(timerUnmount);
    }, 1600);

    return () => {
      clearTimeout(timerFadeIn);
      clearTimeout(timerFadeOut);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0B0C0E] flex flex-col items-center justify-center p-6 transition-opacity duration-500 ease-out select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div
        className={`flex flex-col items-center text-center max-w-xs sm:max-w-sm transition-all duration-700 ease-out transform ${
          fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
      >
        {/* Official Brand Logo Mark */}
        <div className="w-40 sm:w-52 aspect-square rounded-2xl overflow-hidden shadow-2xl mb-5 p-0.5 bg-[#121212] border border-accent-gold/30">
          <img
            src="/assets/latha-jewellery-works-logo.jpeg"
            alt="Latha Jewellery Works Official Logo"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        {/* Minimal Editorial Subtitle */}
        <span className="text-[10px] sm:text-xs text-[#F5F2EB]/60 uppercase tracking-[0.3em] font-light font-sans">
          EST. 1990 • CHATHENCODE
        </span>

        {/* Subtle Luxury Gold Progress Line */}
        <div className="w-24 h-[1.5px] bg-[#1E1E1E] rounded-full overflow-hidden mt-6">
          <div className="w-full h-full bg-accent-gold/80 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}


