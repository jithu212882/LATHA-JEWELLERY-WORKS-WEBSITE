import React, { useState, useEffect } from 'react';

export default function Preloader() {
  const [shouldShow, setShouldShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [mounted, setMounted] = useState(true);

  useEffect(() => {
    // Session check: Only show splash screen once per browser session
    try {
      const alreadyShown = sessionStorage.getItem('latha_splash_shown');
      if (alreadyShown) {
        setMounted(false);
        return;
      }
    } catch (e) {
      // Storage fallback: continue showing gracefully if sessionStorage unavailable
    }

    setShouldShow(true);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const holdDuration = prefersReducedMotion ? 1000 : 1500;
    const fadeDuration = prefersReducedMotion ? 200 : 400;

    const timerHold = setTimeout(() => {
      setFadeOut(true);
      const timerUnmount = setTimeout(() => {
        setMounted(false);
        try {
          sessionStorage.setItem('latha_splash_shown', 'true');
        } catch (e) {}
      }, fadeDuration);

      return () => clearTimeout(timerUnmount);
    }, holdDuration);

    return () => clearTimeout(timerHold);
  }, []);

  if (!mounted || !shouldShow) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#0B0C0E] flex flex-col items-center justify-center p-6 transition-opacity duration-500 ease-out select-none ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="flex flex-col items-center text-center max-w-xs sm:max-w-sm">
        {/* Official Brand Logo Mark */}
        <div className="w-36 sm:w-48 aspect-square rounded-2xl overflow-hidden shadow-2xl mb-5 transition-all duration-1000 transform scale-100">
          <img
            src="/assets/latha-jewellery-works-logo.jpeg"
            alt="Latha Jewellery Works Official Logo"
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>

        {/* Minimal Editorial Subtitle */}
        <span className="text-[10px] sm:text-xs text-[#F5F2EB]/50 uppercase tracking-[0.3em] font-light font-sans">
          EST. 1990 • CHATHENCODE
        </span>
      </div>
    </div>
  );
}

