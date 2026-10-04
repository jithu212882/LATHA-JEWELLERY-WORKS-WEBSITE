import React, { useState, useEffect } from 'react';

export default function BotpressGreetingPopup() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // Show robotic greeting after 1.5 seconds delay on public pages
    const timer = setTimeout(() => {
      // Don't show on admin pages
      if (!window.location.pathname.startsWith('/admin')) {
        setVisible(true);
      }
    }, 1500);

    // Listen for Botpress open/close events to auto-hide greeting when chat is active
    const checkBotpress = setInterval(() => {
      if (window.botpress && typeof window.botpress.on === 'function') {
        clearInterval(checkBotpress);
        try {
          window.botpress.on('webchat:opened', () => setIsChatOpen(true));
          window.botpress.on('webchat:closed', () => setIsChatOpen(false));
        } catch (e) {}
      }
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(checkBotpress);
    };
  }, []);

  const handleOpenChat = () => {
    if (window.botpress && typeof window.botpress.open === 'function') {
      window.botpress.open();
    } else {
      // Fallback: try clicking Botpress widget element
      const widget = document.querySelector('#bp-web-widget-container button, div[id^="bp-"] button, button[aria-label*="chat" i]');
      if (widget) widget.click();
    }
    setDismissed(true);
  };

  // Hide if dismissed, chat already open, or before entrance delay
  if (!visible || dismissed || isChatOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-label="Atelier Bot Greeting"
      onClick={handleOpenChat}
      className="fixed bottom-[82px] right-3 sm:right-6 z-[95] max-w-[290px] sm:max-w-[320px] bg-[#181818]/95 backdrop-blur-md border border-accent-gold/60 p-3.5 sm:p-4 rounded-2xl shadow-[0_10px_35px_rgba(0,0,0,0.8),0_0_20px_rgba(212,175,55,0.2)] cursor-pointer select-none transition-all duration-300 hover:scale-[1.02] hover:border-accent-gold animate-robot-float group"
    >
      {/* Close button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setDismissed(true);
        }}
        aria-label="Dismiss greeting"
        className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-[#242424] hover:bg-[#333] border border-accent-gold/40 text-[#F5F2EB]/80 hover:text-white flex items-center justify-center text-xs transition-colors shadow-lg z-10"
      >
        ✕
      </button>

      <div className="flex items-start gap-3">
        {/* Robotic AI Avatar Badge */}
        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#242424] to-[#121212] border border-accent-gold/50 flex items-center justify-center shrink-0 shadow-inner group-hover:border-accent-gold transition-colors">
          <span className="text-xl select-none">🤖</span>
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#181818] animate-ping" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#181818]" />
        </div>

        {/* Content */}
        <div className="flex-1 pr-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[9px] font-mono font-bold tracking-widest text-accent-gold uppercase bg-accent-gold/15 px-1.5 py-0.5 rounded border border-accent-gold/30">
              ATELIER BOT
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
            Ask me for today's live gold rates, jewellery collections, or bespoke designs!
          </p>
        </div>
      </div>

      {/* Action Prompt */}
      <div className="mt-2.5 pt-2 border-t border-[#2A2A2A] flex items-center justify-between text-[11px]">
        <span className="text-accent-gold font-semibold flex items-center gap-1 group-hover:underline">
          <span>Click to chat</span>
          <span className="material-symbols-outlined text-[13px] transform group-hover:translate-x-1 transition-transform">
            arrow_forward
          </span>
        </span>
        <span className="text-[#F5F2EB]/40 text-[10px] font-mono">24/7 AI Guide</span>
      </div>

      {/* Speech bubble pointer pointing down to the Botpress launcher icon */}
      <div className="absolute -bottom-2 right-6 sm:right-7 w-4 h-4 bg-[#181818] border-r border-b border-accent-gold/60 transform rotate-45"></div>
    </div>
  );
}
