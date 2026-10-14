import React, { useEffect, useRef } from 'react';
import CustomAIMessage from './CustomAIMessage';
import CustomAIInput from './CustomAIInput';

const QUICK_PROMPTS = [
  { label: "Today's Gold Rates 🪙", query: "What are today's live gold and silver rates?" },
  { label: "Browse Collections 👑", query: "Show me all jewellery collections and categories" },
  { label: "Chains & Harams 💎", query: "Show me royal interlock chains and bridal harams" },
  { label: "Store Timings & Location 📍", query: "Where is the store located and what are your visiting hours?" },
  { label: "Custom Design Enquiry ✍️", query: "How can I order a custom bespoke jewellery design?" },
  { label: "WhatsApp Goldsmith 💬", query: "How can I contact your master goldsmith on WhatsApp?" }
];

export default function CustomAIChatWindow({
  isOpen,
  onClose,
  messages = [],
  isLoading = false,
  onSend
}) {
  const messagesEndRef = useRef(null);

  // Defensively sanitize messages array: flat list of valid objects only
  const safeMessages = (Array.isArray(messages) ? messages.flat() : []).filter(
    (m) => m && typeof m === 'object' && typeof m.id !== 'undefined'
  );

  useEffect(() => {
    if (isOpen) {
      try {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      } catch (e) {}
    }
  }, [safeMessages.length, isLoading, isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-label="Latha Jewellery Works AI Concierge"
      className="fixed bottom-[74px] sm:bottom-[84px] right-3 sm:right-6 z-[100] w-[calc(100vw-24px)] sm:w-[410px] h-[580px] max-h-[82vh] flex flex-col bg-[#141414] border border-accent-gold/50 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.95),0_0_30px_rgba(212,175,55,0.22)] overflow-hidden backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
    >
      {/* 1. Atelier Header */}
      <div className="px-4 py-3 bg-[#1A1A1A] border-b border-[#2A2A2A] flex items-center justify-between select-none shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-gold to-[#8C6D23] flex items-center justify-center text-[#121212] font-bold shadow-md shrink-0">
            <span className="material-symbols-outlined text-[20px]">diamond</span>
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-[#F9F6F0] font-headline tracking-wide leading-tight flex items-center gap-1.5">
              <span>Latha Atelier Concierge</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" title="Live Support Online"></span>
            </h3>
            <p className="text-[10px] text-accent-gold/80 font-mono tracking-wider uppercase mt-0.5">
              Est. 1990 • Nadaikavu, TN
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close Concierge"
          className="w-7 h-7 rounded-lg bg-[#242424] hover:bg-[#333333] border border-[#3A3A3A] text-[#F5F2EB]/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      {/* 2. Scrollable Messages Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-2 no-scrollbar">
        {/* Welcome Banner */}
        <div className="p-3 rounded-xl bg-accent-gold/5 border border-accent-gold/20 mb-3 text-center">
          <p className="text-xs text-accent-gold font-semibold font-headline tracking-wide">
            Latha Jewellery Works • Est. 1990
          </p>
          <p className="text-[11px] text-[#F5F2EB]/75 mt-1 leading-relaxed">
            Welcome to our digital atelier showroom in Nadaikavu, Tamil Nadu. Ask about today's live gold rates, 22K (BIS 916) collections, or bespoke bridal crafting.
          </p>
        </div>

        {/* Initial Suggestion Grid (shown before first message) */}
        {safeMessages.length <= 1 && (
          <div className="mb-3">
            <p className="text-[10px] font-mono uppercase tracking-widest text-accent-gold/70 mb-1.5 px-0.5">
              Quick Inquiries:
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt.label}
                  onClick={() => onSend(prompt.query)}
                  className="text-left text-[11px] p-2 rounded-lg bg-[#1E1E1E] hover:bg-[#282828] border border-[#333333] hover:border-accent-gold/50 text-[#F5F2EB]/85 hover:text-accent-gold transition-all leading-snug cursor-pointer shadow-sm active:scale-[0.98]"
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Rendered Messages */}
        {safeMessages.map((msg) => (
          <CustomAIMessage key={msg.id} message={msg} />
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center gap-2 mb-2 animate-in fade-in duration-150">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-gold/20 to-[#1A1A1A] border border-accent-gold/40 flex items-center justify-center shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[14px] text-accent-gold animate-spin">
                hourglass_top
              </span>
            </div>
            <div className="px-3 py-2 rounded-2xl rounded-tl-none bg-[#1D1D1D] border border-[#2F2F2F] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="text-[11px] text-[#F5F2EB]/60 font-mono ml-1">Consulting atelier...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Mobile-friendly horizontal quick reply pills */}
      <div className="px-3 py-2 bg-[#171717] border-t border-[#252525] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0 select-none">
        <span className="text-[9px] font-mono text-accent-gold/60 uppercase whitespace-nowrap pl-0.5">Quick:</span>
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt.label}
            onClick={() => onSend(prompt.query)}
            disabled={isLoading}
            className="whitespace-nowrap text-[11px] px-2.5 py-1 rounded-full bg-[#202020] hover:bg-[#2A2A2A] border border-[#353535] hover:border-accent-gold/60 text-[#F5F2EB]/80 hover:text-accent-gold transition-colors shrink-0 disabled:opacity-40 cursor-pointer active:scale-95"
          >
            {prompt.label}
          </button>
        ))}
      </div>

      {/* 4. Input Footer */}
      <CustomAIInput onSend={onSend} disabled={isLoading} />
    </div>
  );
}