import React from 'react';
import { useData } from '../../context/DataContext';

export default function LiveRateTicker() {
  const { gold_rates } = useData();

  if (!gold_rates || gold_rates.ticker_visible === 0) return null;

  const rateItems = [
    { label: '22K GOLD', rate: gold_rates.rate_22k || '6,850', unit: '/g' },
    { label: '24K GOLD', rate: gold_rates.rate_24k || '7,460', unit: '/g' },
    { label: '18K GOLD', rate: gold_rates.rate_18k || '5,625', unit: '/g' },
    { label: 'SILVER', rate: gold_rates.rate_silver || '92', unit: '/g' }
  ];

  // Repeat items 4 times for seamless continuous marquee on mobile
  const repeatedItems = [...rateItems, ...rateItems, ...rateItems, ...rateItems];

  return (
    <div className="w-full bg-[#0E0E0E] border-b border-[#262626] py-1.5 sm:py-2 overflow-hidden text-xs font-sans select-none relative z-40 max-w-full">
      {/* DESKTOP VIEW: Centered and properly spaced across the full width (md+) */}
      <div className="hidden md:flex items-center justify-center gap-6 lg:gap-10 px-4 w-full">
        {rateItems.map((item, idx) => (
          <div key={idx} className="flex items-center shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse mr-2" />
            <span className="text-accent-gold uppercase font-bold tracking-wider text-xs">
              {item.label}:
            </span>
            <strong className="text-[#F9F6F0] font-bold text-xs sm:text-[13px] ml-1.5 tracking-wide">
              ₹{item.rate}
            </strong>
            <span className="text-[#F5F2EB]/60 text-[11px] font-normal ml-0.5">
              {item.unit}
            </span>
            {idx < rateItems.length - 1 && (
              <span className="text-accent-gold/40 text-xs ml-6 lg:ml-10">•</span>
            )}
          </div>
        ))}
      </div>

      {/* MOBILE VIEW: Continuous smooth marquee scrolling without clipping (< md) */}
      <div className="md:hidden w-full overflow-hidden flex items-center">
        <div className="animate-ticker-marquee flex items-center whitespace-nowrap">
          {repeatedItems.map((item, idx) => (
            <div key={idx} className="flex items-center shrink-0 px-3 sm:px-4">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-pulse mr-2" />
              <span className="text-accent-gold uppercase font-bold tracking-wider text-[11px]">
                {item.label}:
              </span>
              <strong className="text-[#F9F6F0] font-bold text-xs ml-1.5 tracking-wide">
                ₹{item.rate}
              </strong>
              <span className="text-[#F5F2EB]/60 text-[10px] font-normal ml-0.5">
                {item.unit}
              </span>
              <span className="text-accent-gold/40 text-xs ml-3 sm:ml-4">•</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
