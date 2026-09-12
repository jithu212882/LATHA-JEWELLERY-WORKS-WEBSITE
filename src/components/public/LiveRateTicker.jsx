import React from 'react';
import { useData } from '../../context/DataContext';

export default function LiveRateTicker() {
  const { gold_rates } = useData();

  if (!gold_rates || !gold_rates.ticker_visible) return null;

  return (
    <div className="w-full bg-[#111111] border-b border-[#222222] py-1.5 px-3 sm:px-8 text-[11px] font-sans">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-hidden">
        {/* Left: Section Label */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-accent-gold/80 animate-pulse hidden sm:inline-block" />
          <span className="text-accent-gold uppercase tracking-[0.16em] font-semibold text-[10px] sm:text-[11px]">
            Today's Gold Rates
          </span>
          <span className="text-[#333333] hidden sm:inline">|</span>
        </div>

        {/* Center: Compact Rate Items Ticker */}
        <div className="flex items-center gap-3 sm:gap-5 whitespace-nowrap overflow-x-auto no-scrollbar font-normal text-[#F5F2EB]/85 tracking-wider py-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-accent-gold/90 font-medium text-[10px] sm:text-[11px] uppercase">22K Gold:</span>
            <strong className="text-[#F9F6F0] font-semibold text-[11px] sm:text-xs">₹{gold_rates.rate_22k}</strong>
            <span className="text-[#F5F2EB]/50 text-[10px]">/g</span>
          </div>

          <span className="text-[#333333] text-[10px]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-accent-gold/90 font-medium text-[10px] sm:text-[11px] uppercase">24K Gold:</span>
            <strong className="text-[#F9F6F0] font-semibold text-[11px] sm:text-xs">₹{gold_rates.rate_24k}</strong>
            <span className="text-[#F5F2EB]/50 text-[10px]">/g</span>
          </div>

          <span className="text-[#333333] text-[10px]">•</span>

          <div className="flex items-center gap-1.5">
            <span className="text-accent-gold/90 font-medium text-[10px] sm:text-[11px] uppercase">Silver:</span>
            <strong className="text-[#F9F6F0] font-semibold text-[11px] sm:text-xs">₹{gold_rates.rate_silver}</strong>
            <span className="text-[#F5F2EB]/50 text-[10px]">/g</span>
          </div>
        </div>

        {/* Right: Updated Timestamp */}
        <div className="hidden md:block shrink-0 text-[10px] text-[#F5F2EB]/40 tracking-wider">
          Updated: {gold_rates.last_updated || 'Today'}
        </div>
      </div>
    </div>
  );
}
