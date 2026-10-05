import React, { useState, useEffect, useRef } from 'react';

/**
 * AIAssistantManager
 * Unified AI Testing Suite for Latha Jewellery Works
 * 
 * Supports both:
 * 1. Existing Botpress Assistant (via window.botpress)
 * 2. New Dify Assistant (via official responsive Web App iframe: https://udify.app/agent/5JG9i6iJnvwfdLhK)
 * 
 * Features:
 * - Single premium "AI Assistant" launcher button (avoids multiple confusing bubbles)
 * - Interactive selector modal: [ Botpress ] vs [ Dify ]
 * - One active assistant at a time (automatic switching without full page reload)
 * - Fully responsive (Desktop panel ~460px wide, Mobile 100% full-screen adaptive)
 * - Preserves Latha Jewellery Works luxury aesthetic (Cormorant Garamond, Inter, #D4AF37 gold)
 */
export default function AIAssistantManager() {
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [activeAssistant, setActiveAssistant] = useState(null); // 'botpress' | 'dify' | null
  const [greetingVisible, setGreetingVisible] = useState(false);
  const [greetingDismissed, setGreetingDismissed] = useState(false);
  const selectorRef = useRef(null);

  useEffect(() => {
    // Show robotic greeting callout after 1.5s delay on storefront
    const timer = setTimeout(() => {
      if (!window.location.pathname.startsWith('/admin')) {
        setGreetingVisible(true);
      }
    }, 1500);

    // Listen to Botpress events to track opened/closed status
    const checkBotpress = setInterval(() => {
      if (window.botpress && typeof window.botpress.on === 'function') {
        clearInterval(checkBotpress);
        try {
          window.botpress.on('webchat:opened', () => {
            setActiveAssistant('botpress');
            setGreetingVisible(false);
            setIsSelectorOpen(false);
          });
          window.botpress.on('webchat:closed', () => {
            setActiveAssistant(prev => (prev === 'botpress' ? null : prev));
          });
        } catch (e) {}
      }
    }, 400);

    // Hide native Botpress FAB button so only our unified launcher is visible
    const hideBpFab = () => {
      document.querySelectorAll('.bpFabContainer, .bpFabWrapper, [class*="bpFabContainer"]').forEach(el => {
        el.style.display = 'none';
        el.style.opacity = '0';
        el.style.pointerEvents = 'none';
      });

      document.querySelectorAll('*').forEach(el => {
        if (el.shadowRoot) {
          el.shadowRoot.querySelectorAll('.bpFabContainer, .bpFabWrapper, [class*="bpFab"]').forEach(fab => {
            fab.style.display = 'none';
            fab.style.opacity = '0';
            fab.style.pointerEvents = 'none';
          });
        }
      });
    };

    hideBpFab();
    const fabInterval = setInterval(hideBpFab, 1000);

    // Close selector when clicking outside
    const handleOutsideClick = (e) => {
      if (selectorRef.current && !selectorRef.current.contains(e.target)) {
        setIsSelectorOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      clearTimeout(timer);
      clearInterval(checkBotpress);
      clearInterval(fabInterval);
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  // Handle switching to Botpress
  const handleSelectBotpress = () => {
    setActiveAssistant('botpress');
    setIsSelectorOpen(false);
    setGreetingDismissed(true);

    if (window.botpress && typeof window.botpress.open === 'function') {
      window.botpress.open();
    } else {
      // Fallback selector
      const widget = document.querySelector(
        '#bp-web-widget-container button, div[id^="bp-"] button, button[aria-label*="chat" i]'
      );
      if (widget) widget.click();
    }
  };

  // Handle switching to Dify
  const handleSelectDify = () => {
    // If Botpress was open, close it first
    if (window.botpress && typeof window.botpress.close === 'function') {
      try {
        window.botpress.close();
      } catch (e) {}
    }

    setActiveAssistant('dify');
    setIsSelectorOpen(false);
    setGreetingDismissed(true);
  };

  // Close Dify panel
  const handleCloseDify = () => {
    setActiveAssistant(null);
  };

  // Don't render on Admin pages
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* ============================================================== */}
      {/* 1. ROBOTIC GREETING CALLOUT (appears above the unified button) */}
      {/* ============================================================== */}
      {greetingVisible && !greetingDismissed && !activeAssistant && !isSelectorOpen && (
        <div
          role="dialog"
          aria-label="Atelier Bot Greeting"
          onClick={() => {
            setIsSelectorOpen(true);
            setGreetingDismissed(true);
          }}
          className="fixed bottom-[88px] right-4 sm:right-6 z-[95] max-w-[290px] sm:max-w-[330px] bg-[#181818]/95 backdrop-blur-md border border-accent-gold/60 p-3.5 sm:p-4 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.85),0_0_20px_rgba(212,175,55,0.2)] cursor-pointer select-none transition-all duration-300 hover:scale-[1.02] hover:border-accent-gold animate-robot-float group"
        >
          {/* Dismiss button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setGreetingDismissed(true);
            }}
            aria-label="Dismiss greeting"
            className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#242424] hover:bg-[#333] border border-accent-gold/40 text-[#F5F2EB]/80 hover:text-white flex items-center justify-center text-xs transition-colors shadow-lg z-10"
          >
            ✕
          </button>

          <div className="flex items-start gap-3">
            {/* Robotic Avatar Badge */}
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#242424] to-[#121212] border border-accent-gold/50 flex items-center justify-center shrink-0 shadow-inner group-hover:border-accent-gold transition-colors">
              <span className="text-xl select-none">🤖</span>
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#181818] animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#181818]" />
            </div>

            {/* Content */}
            <div className="flex-1 pr-1">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[9px] font-mono font-bold tracking-widest text-accent-gold uppercase bg-accent-gold/15 px-1.5 py-0.5 rounded border border-accent-gold/30">
                  ATELIER AI
                </span>
                <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  ONLINE
                </span>
              </div>

              <h4 className="text-xs sm:text-[13px] font-bold text-[#F9F6F0] leading-snug">
                May I help you today? ✨
              </h4>

              <p className="text-[11px] text-[#F5F2EB]/70 font-light mt-0.5 leading-relaxed">
                Choose between Botpress or Dify to test live gold rates & custom designs!
              </p>
            </div>
          </div>

          {/* Action Prompt */}
          <div className="mt-2.5 pt-2 border-t border-[#2A2A2A] flex items-center justify-between text-[11px]">
            <span className="text-accent-gold font-semibold flex items-center gap-1 group-hover:underline">
              <span>Choose Assistant</span>
              <span className="material-symbols-outlined text-[13px] transform group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </span>
            <span className="text-[#F5F2EB]/40 text-[10px] font-mono">2 Bots Available</span>
          </div>

          {/* Down-pointer */}
          <div className="absolute -bottom-2 right-6 sm:right-8 w-4 h-4 bg-[#181818] border-r border-b border-accent-gold/60 transform rotate-45"></div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. UNIFIED "AI ASSISTANT" LAUNCHER BUTTON & SELECTOR POPOVER   */}
      {/* ============================================================== */}
      {/* Hidden when Dify or Botpress full chat is actively open to avoid covering the chat */}
      {activeAssistant !== 'dify' && (
        <div ref={selectorRef} className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[95]">
          {/* Selector Popover */}
          {isSelectorOpen && (
            <div className="absolute bottom-full right-0 mb-3 w-[310px] sm:w-[350px] bg-[#161616]/98 backdrop-blur-xl border border-accent-gold/50 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_30px_rgba(212,175,55,0.2)] select-none animate-in fade-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#2A2A2A]">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono tracking-widest text-accent-gold uppercase font-bold bg-accent-gold/15 px-1.5 py-0.5 rounded border border-accent-gold/30">
                      TESTING SUITE
                    </span>
                    <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      ONLINE
                    </span>
                  </div>
                  <h3 className="font-headline text-base font-bold text-[#F9F6F0] tracking-wide mt-1">
                    AI ASSISTANTS
                  </h3>
                </div>
                <button
                  onClick={() => setIsSelectorOpen(false)}
                  className="w-7 h-7 rounded-full bg-[#222] hover:bg-[#333] border border-[#333] text-[#F5F2EB]/70 hover:text-white flex items-center justify-center text-xs transition-colors"
                  aria-label="Close Selector"
                >
                  ✕
                </button>
              </div>

              <p className="text-[11px] text-[#F5F2EB]/65 font-light mt-2.5 mb-3 leading-relaxed">
                Select an assistant to compare answers and gold-rate responses side-by-side:
              </p>

              {/* Botpress Option */}
              <button
                type="button"
                onClick={handleSelectBotpress}
                className={`w-full p-3 rounded-xl border text-left flex items-start gap-3 transition-all duration-200 group cursor-pointer ${
                  activeAssistant === 'botpress'
                    ? 'bg-accent-gold/15 border-accent-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-[#1F1F1F] border-[#2E2E2E] hover:border-accent-gold/60 hover:bg-[#262626]'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-[#282828] border border-accent-gold/30 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  🤖
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F9F6F0] group-hover:text-accent-gold transition-colors">
                      Botpress
                    </span>
                    <span className="text-[9px] font-mono text-accent-gold uppercase tracking-wider bg-accent-gold/10 px-1.5 py-0.5 rounded border border-accent-gold/20">
                      Standard
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#F5F2EB]/65 font-light mt-0.5 truncate">
                    Atelier Custom Agent • Fetch_Gold_Rates
                  </p>
                </div>
                <span className="material-symbols-outlined text-[16px] text-accent-gold self-center">
                  arrow_forward
                </span>
              </button>

              {/* Dify Option */}
              <button
                type="button"
                onClick={handleSelectDify}
                className={`w-full mt-2.5 p-3 rounded-xl border text-left flex items-start gap-3 transition-all duration-200 group cursor-pointer ${
                  activeAssistant === 'dify'
                    ? 'bg-accent-gold/15 border-accent-gold text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                    : 'bg-[#1F1F1F] border-[#2E2E2E] hover:border-accent-gold/60 hover:bg-[#262626]'
                }`}
              >
                <div className="w-9 h-9 rounded-lg bg-[#282828] border border-accent-gold/30 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-transform">
                  ⚡
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F9F6F0] group-hover:text-accent-gold transition-colors">
                      Dify
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                      New
                    </span>
                  </div>
                  <p className="text-[10.5px] text-[#F5F2EB]/65 font-light mt-0.5 truncate">
                    Dify Web App • Agent 5JG9i6iJnvwfdLhK
                  </p>
                </div>
                <span className="material-symbols-outlined text-[16px] text-accent-gold self-center">
                  arrow_forward
                </span>
              </button>

              {/* Speech bubble pointer */}
              <div className="absolute -bottom-2 right-6 sm:right-8 w-4 h-4 bg-[#161616] border-r border-b border-accent-gold/50 transform rotate-45"></div>
            </div>
          )}

          {/* Unified Launcher Pill Button */}
          <button
            type="button"
            onClick={() => {
              setIsSelectorOpen(prev => !prev);
              setGreetingDismissed(true);
            }}
            aria-label="Toggle AI Assistants Selector"
            className="px-4 py-2.5 sm:px-5 sm:py-3 rounded-full bg-[#181818]/95 backdrop-blur-md border border-accent-gold/60 shadow-[0_8px_30px_rgba(0,0,0,0.85),0_0_20px_rgba(212,175,55,0.2)] text-[#F9F6F0] flex items-center gap-2.5 hover:border-accent-gold hover:scale-[1.03] transition-all duration-300 group cursor-pointer select-none"
          >
            <div className="relative w-7 h-7 rounded-full bg-accent-gold/15 border border-accent-gold/40 flex items-center justify-center text-sm shadow-inner group-hover:border-accent-gold transition-colors">
              <span>🤖</span>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#181818] animate-ping" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[#181818]" />
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[12px] sm:text-[13px] font-bold tracking-wide text-[#F9F6F0] leading-none group-hover:text-accent-gold transition-colors">
                AI Assistant
              </span>
              <span className="text-[9px] text-[#F5F2EB]/50 font-mono tracking-wider uppercase mt-0.5">
                Botpress • Dify
              </span>
            </div>

            <span
              className={`material-symbols-outlined text-[16px] text-accent-gold transition-transform duration-300 ${
                isSelectorOpen ? 'rotate-180' : ''
              }`}
            >
              expand_less
            </span>
          </button>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. DIFY DEDICATED CHAT PANEL (Desktop Modal / Mobile Full View)*/}
      {/* ============================================================== */}
      {activeAssistant === 'dify' && (
        <div
          role="dialog"
          aria-label="Dify AI Assistant"
          className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:right-6 z-[100] w-full h-[100dvh] sm:w-[460px] sm:h-[750px] sm:max-h-[calc(100vh-48px)] rounded-none sm:rounded-2xl bg-[#141414] border-0 sm:border sm:border-accent-gold/50 shadow-[0_25px_65px_rgba(0,0,0,0.95),0_0_35px_rgba(212,175,55,0.2)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Header Bar */}
          <div className="h-14 bg-[#1A1A1A] border-b border-[#2A2A2A] px-4 flex items-center justify-between shrink-0 select-none">
            {/* Title / Emblem */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-accent-gold/15 border border-accent-gold/40 flex items-center justify-center text-sm shadow-inner">
                ⚡
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline font-bold text-sm text-[#F9F6F0] tracking-wide">
                    Dify Assistant
                  </span>
                  <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest bg-emerald-400/10 px-1 rounded border border-emerald-400/20">
                    LIVE
                  </span>
                </div>
                <span className="text-[10px] text-[#F5F2EB]/50 font-mono">
                  Latha Jewellery Works Testing
                </span>
              </div>
            </div>

            {/* Actions: Switch to Botpress + Close Button */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectBotpress}
                className="px-2.5 py-1 text-[11px] font-medium bg-[#242424] hover:bg-[#2E2E2E] text-accent-gold border border-accent-gold/30 hover:border-accent-gold/60 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Switch to Botpress Assistant"
              >
                <span>🤖</span>
                <span className="hidden sm:inline">Switch to</span>
                <span>Botpress</span>
              </button>

              <button
                type="button"
                onClick={handleCloseDify}
                className="w-8 h-8 rounded-full bg-[#242424] hover:bg-[#333] border border-[#333] text-[#F5F2EB]/80 hover:text-white flex items-center justify-center text-sm transition-colors cursor-pointer"
                aria-label="Close Dify Chat"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Iframe Container */}
          <div className="flex-1 w-full h-full min-h-0 bg-[#121212] relative overflow-y-auto sm:overflow-hidden">
            {/* EXACT Official Dify iframe specified by User */}
            <iframe
              src="https://udify.app/agent/5JG9i6iJnvwfdLhK"
              style={{ width: '100%', height: '100%', minHeight: '700px' }}
              frameBorder="0"
              allow="microphone;clipboard-write"
              title="Dify Assistant"
              className="w-full h-full border-0 block"
            />
          </div>
        </div>
      )}
    </>
  );
}
