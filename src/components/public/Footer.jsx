import React from 'react';
import { useData } from '../../context/DataContext';
import { navigateTo } from '../../utils/navigation';

export default function Footer() {
  const { settings } = useData();
  const businessName = settings?.business_name || 'Latha Jewellery Works';
  const email = settings?.email || 'lathajewelleryworks@gmail.com';

  return (
    <footer className="w-full bg-[#0D0D0D] border-t border-[#2A2A2A] py-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="w-10 h-10 rounded-lg overflow-hidden border border-accent-gold/30 p-0.5 bg-[#121212] shrink-0">
            <img
              src={settings?.logo_footer || '/assets/latha-jewellery-works-logo.jpeg'}
              alt={businessName}
              className="w-full h-full object-cover rounded-md"
            />
          </div>
          <div className="flex flex-col text-center sm:text-left">
            <span className="font-headline font-bold text-accent-gold uppercase tracking-widest text-sm">
              {businessName}
            </span>
            <span className="text-[11px] text-[#F5F2EB]/50 uppercase tracking-widest mt-0.5">
              © {new Date().getFullYear()} Latha Jewellery Works. Timeless Craftsmanship.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-5 text-xs text-[#F5F2EB]/60 uppercase tracking-wider">
          <a href="/" onClick={(e) => navigateTo('/', e)} className="hover:text-accent-gold transition-colors">Home</a>
          <a href="/collections" onClick={(e) => navigateTo('/collections', e)} className="hover:text-accent-gold transition-colors">Collections</a>
          <a href="#contact" className="hover:text-accent-gold transition-colors">Location</a>
          <a href={`mailto:${email}`} className="text-accent-gold hover:underline normal-case font-mono">{email}</a>
        </div>
      </div>
    </footer>
  );
}
