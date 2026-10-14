import React from 'react';
import { navigateTo } from '../../utils/navigation';

/**
 * Parses markdown inline formatting: [links](url) and **bold**
 */
function renderFormattedText(text) {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');

  return lines.map((line, lineIdx) => {
    // Regex for markdown links: [text](url)
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = linkRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderBold(line.substring(lastIndex, match.index)));
      }

      const linkText = match[1];
      const linkUrl = match[2];
      const isInternal = linkUrl.startsWith('/');

      if (isInternal) {
        parts.push(
          <a
            key={`link-${lineIdx}-${match.index}`}
            href={linkUrl}
            onClick={(e) => {
              e.preventDefault();
              navigateTo(linkUrl);
            }}
            className="inline-flex items-center gap-1 text-accent-gold font-semibold underline decoration-accent-gold/60 underline-offset-2 hover:text-[#f3e5ab] hover:decoration-accent-gold transition-colors cursor-pointer"
          >
            <span>{linkText}</span>
            <span className="material-symbols-outlined text-[13px] no-underline">arrow_outward</span>
          </a>
        );
      } else {
        parts.push(
          <a
            key={`ext-${lineIdx}-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent-gold font-semibold underline decoration-accent-gold/60 underline-offset-2 hover:text-[#f3e5ab] transition-colors cursor-pointer"
          >
            <span>{linkText}</span>
            <span className="material-symbols-outlined text-[13px]">open_in_new</span>
          </a>
        );
      }

      lastIndex = linkRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      parts.push(renderBold(line.substring(lastIndex)));
    }

    return (
      <React.Fragment key={`line-${lineIdx}`}>
        {parts.length > 0 ? parts : <br />}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

function renderBold(text) {
  if (!text.includes('**')) return text;
  const segments = text.split('**');
  return segments.map((seg, idx) => {
    if (idx % 2 === 1) {
      return (
        <strong key={`b-${idx}`} className="font-bold text-[#F9F6F0]">
          {seg}
        </strong>
      );
    }
    return seg;
  });
}

export default function CustomAIMessage({ message }) {
  if (!message || typeof message !== 'object') {
    return null;
  }

  const isUser = message.sender === 'user';
  const rawText = typeof message.text === 'string'
    ? message.text
    : (message.text != null ? String(message.text) : '');

  let timeStr = '';
  try {
    if (message.timestamp) {
      timeStr = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  } catch (e) {
    timeStr = '';
  }

  const hasWhatsAppIntent = !isUser && Boolean(
    rawText && (rawText.includes('+91 9487056064') || rawText.includes('WhatsApp'))
  );

  const hasCallIntent = !isUser && Boolean(
    rawText && (rawText.includes('call') || rawText.includes('phone') || rawText.includes('+91 9487056064'))
  );

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`flex items-start max-w-[88%] sm:max-w-[82%] gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {!isUser && (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent-gold/25 to-[#1A1A1A] border border-accent-gold/50 flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            <span className="material-symbols-outlined text-[15px] text-accent-gold">
              diamond
            </span>
          </div>
        )}

        <div
          className={`rounded-2xl px-3.5 py-2.5 text-xs sm:text-[13px] leading-relaxed select-text transition-all ${
            isUser
              ? 'bg-accent-gold/15 text-[#F9F6F0] border border-accent-gold/30 rounded-tr-none shadow-sm'
              : 'bg-[#1D1D1D] text-[#F5F2EB] border border-[#2F2F2F] rounded-tl-none shadow-md'
          }`}
        >
          {!isUser && (
            <div className="flex items-center gap-1.5 mb-1.5 select-none">
              <span className="text-[9px] font-mono tracking-widest text-accent-gold uppercase font-semibold">
                LATHA CONCIERGE
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            </div>
          )}

          <div className="break-words font-normal">
            {renderFormattedText(rawText) || "I'm here to assist you with any questions about Latha Jewellery Works."}
          </div>

          {/* Quick Contact & Escalation Buttons */}
          {hasWhatsAppIntent && (
            <div className="mt-2.5 pt-2 border-t border-[#2A2A2A] flex flex-wrap items-center gap-2">
              <a
                href="https://wa.me/919487056064"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold transition-all hover:scale-[1.02] shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[14px]">chat</span>
                <span>WhatsApp (+91 9487056064)</span>
              </a>

              {hasCallIntent && (
                <a
                  href="tel:+919487056064"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#252525] hover:bg-[#303030] border border-accent-gold/30 text-accent-gold text-[11px] font-medium transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[14px]">call</span>
                  <span>Call Atelier</span>
                </a>
              )}
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