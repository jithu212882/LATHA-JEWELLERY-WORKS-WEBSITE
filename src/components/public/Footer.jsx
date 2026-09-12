import React from 'react';
import { useData } from '../../context/DataContext';

export default function Footer({ onOpenAdmin }) {
  const { settings } = useData();
  const businessName = settings?.business_name || 'Latha Jewellery Works';

  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[#2A2A2A] py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div>
          <span className="font-headline font-bold text-accent-gold uppercase tracking-widest text-base block">
            {businessName}
          </span>
          <span className="text-[11px] text-[#F5F2EB]/50 uppercase tracking-widest block mt-0.5">
            © {new Date().getFullYear()} Latha Jewellery Works. Timeless Craftsmanship.
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-[#F5F2EB]/60 uppercase tracking-wider">
          <a href="#" className="hover:text-accent-gold transition-colors">Home</a>
          <a href="#catalogue" className="hover:text-accent-gold transition-colors">Collections</a>
          <a href="#contact" className="hover:text-accent-gold transition-colors">Location</a>
          <button onClick={onOpenAdmin} className="hover:text-accent-gold transition-colors text-accent-gold/80">
            Admin Studio
          </button>
        </div>
      </div>
    </footer>
  );
}
