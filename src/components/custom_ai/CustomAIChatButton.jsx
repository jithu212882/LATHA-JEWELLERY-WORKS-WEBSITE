import React from 'react';

export default function CustomAIChatButton({ onClick, isOpen, unreadCount = 0 }) {
  return (
    <div className="fixed bottom-5 left-4 sm:left-6 z-[95] flex items-center gap-3">
      <button
        onClick={onClick}
        aria-label={isOpen ? 'Close Latha Atelier Concierge' : 'Open Latha Atelier Concierge'}
        className="group relative flex items-center gap-2.5 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full bg-[#181818]/95 hover:bg-[#202020] border border-accent-gold/60 hover:border-accent-gold shadow-[0_8px_30px_rgba(0,0,0,0.8),0_0_15px_rgba(212,175,55,0.18)] transition-all duration-300 hover:scale-105 active:scale-95 text-left select-none backdrop-blur-md cursor-pointer"
      >
        {/* Atelier Crest Icon */}
        <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-accent-gold to-[#8C6D23] flex items-center justify-center text-[#121212] font-bold shadow-sm shrink-0">
          <span className="material-symbols-outlined text-[18px]">
            {isOpen ? 'close' : 'diamond'}
          </span>

          {!isOpen && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#181818] animate-pulse" />
          )}
        </div>

        {/* Brand Text Labels - visible on mobile and desktop */}
        <div className="flex flex-col pr-1">
          <span className="text-[9px] sm:text-[10px] font-mono tracking-widest text-accent-gold uppercase font-bold leading-none">
            Atelier Concierge
          </span>
          <span className="text-[11px] sm:text-xs font-semibold text-[#F9F6F0] leading-tight mt-0.5 whitespace-nowrap">
            {isOpen ? 'Close Chat' : 'Ask Latha AI'}
          </span>
        </div>

        {/* Unread indicator */}
        {!isOpen && unreadCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold bg-accent-gold text-[#121212] rounded-full">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
}