import React from 'react';

export default function CustomAIMessage({ message }) {
  const isUser = message.sender === 'user';
  const timeStr = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  const hasWhatsAppIntent = !isUser && (message.text.includes('+91 9487056064') || message.text.includes('WhatsApp'));

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex items-start max-w-[85%] sm:max-w-[80%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-gold/20 to-[#1A1A1A] border border-accent-gold/40 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[15px] text-accent-gold">
              diamond
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed select-text ${
            isUser
              ? 'bg-accent-gold/15 text-[#F9F6F0] border border-accent-gold/30 rounded-tr-none shadow-sm'
              : 'bg-[#1D1D1D] text-[#F5F2EB] border border-[#2F2F2F] rounded-tl-none shadow-md'
          }`}
        >
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-1 select-none">
              <span className="text-[9px] font-mono tracking-widest text-accent-gold uppercase font-semibold">
                LATHA CONCIERGE
              </span>
              <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
            </div>
          )}

          <div className="whitespace-pre-line break-words">
            {message.text}
          </div>

          {hasWhatsAppIntent && (
            <div className="mt-2 pt-2 border-t border-[#2A2A2A] flex items-center gap-2">
              <a
                href="https://wa.me/919487056064"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-700/30 hover:bg-emerald-700/50 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium transition-colors"
              >
                <span className="material-symbols-outlined text-[13px]">chat</span>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          )}

          {timeStr && (
            <div className={`text-[9px] font-mono mt-1 ${isUser ? 'text-accent-gold/60 text-right' : 'text-[#888888]'}`}>
              {timeStr}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}