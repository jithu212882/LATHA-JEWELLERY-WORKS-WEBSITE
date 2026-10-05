import React, { useState, useRef } from 'react';

export default function CustomAIInput({ onSend, disabled, placeholder = 'Ask about gold rates, harams, timings...' }) {
  const [text, setText] = useState('');
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 bg-[#141414] border-t border-[#2A2A2A] flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        aria-label="Message to Atelier Concierge"
        className="flex-1 bg-[#1E1E1E] text-[#F9F6F0] placeholder-[#F5F2EB]/40 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-[#333333] focus:outline-none focus:border-accent-gold/80 transition-colors disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={!text.trim() || disabled}
        aria-label="Send message"
        className="w-10 h-10 rounded-xl bg-accent-gold hover:bg-[#c49f2c] text-[#121212] font-bold flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_2px_10px_rgba(212,175,55,0.2)] shrink-0"
      >
        <span className="material-symbols-outlined text-[19px]">
          send
        </span>
      </button>
    </form>
  );
}