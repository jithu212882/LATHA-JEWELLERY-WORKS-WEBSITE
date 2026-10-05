import React from 'react';
import { Sparkles, X } from 'lucide-react';
import './google-ai.css';

/**
 * Dedicated Floating Launcher Button for the Google AI Studio Chatbot.
 * Positioned centered at bottom-6 (left: 50%, -translate-x-1/2) on desktop.
 * On mobile, sits between bottom-left (Custom AI) and bottom-right (Botpress) without collision.
 */
export default function GoogleAIChatButton({ isOpen, onClick, unreadBadge = true }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 select-none">
      <button
        onClick={onClick}
        aria-label={isOpen ? 'Close Google AI Concierge' : 'Open Google AI Studio Concierge'}
        className={`google-ai-chat-launcher-btn relative w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-[#d4af37] focus:outline-none focus:ring-4 focus:ring-[#d4af37]/30 transition-transform duration-300 ${
          isOpen ? 'rotate-90 scale-95' : 'rotate-0 hover:scale-105'
        }`}
        title="Google AI Studio Concierge (Latha Jewellery Works)"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#f5f2eb]" />
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Sparkles Emblem with Gemini Luxury Aura */}
            <Sparkles className="w-6 h-6 text-[#d4af37] animate-pulse" />

            {/* Subtle Luxury Notification Ping */}
            {unreadBadge && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d4af37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#e5c158] border-2 border-[#12131a]"></span>
              </span>
            )}
          </div>
        )}
      </button>

      {/* Floating pill badge on desktop view */}
      {!isOpen && (
        <button
          onClick={onClick}
          className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#161722]/90 border border-[#c5a059]/40 text-xs font-medium text-[#f5f2eb] hover:border-[#d4af37] hover:bg-[#1a1c2a] transition-all shadow-xl backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-[#d4af37] animate-ping" />
          <span className="font-serif italic text-sm text-[#e5c158]">Google AI Studio</span>
          <span className="text-gray-400 text-[11px]">• Gemini Atelier</span>
        </button>
      )}
    </div>
  );
}
