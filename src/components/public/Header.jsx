import React, { useState, useEffect, useRef } from 'react';
import LiveRateTicker from './LiveRateTicker';
import MobileMenuDrawer from './MobileMenuDrawer';
import { useData } from '../../context/DataContext';
import { navigateTo } from '../../utils/navigation';

export default function Header({ onOpenAdmin }) {
  const { settings } = useData();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const businessName = settings?.business_name || 'Latha Jewellery Works';
  const whatsappNum = settings?.whatsapp || '9487056064';

  // Indian Phone Number Formatting: +91 94870 56064
  const formattedPhone = whatsappNum === '9487056064' ? '+91 94870 56064' : `+91 ${whatsappNum}`;

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#121212]/95 backdrop-blur-xl border-b border-[#2A2A2A] shadow-2xl'
            : 'bg-[#121212]/85 backdrop-blur-md border-b border-[#2A2A2A]/40'
        }`}
      >
        {/* Top Gold Rate Bar */}
        <LiveRateTicker />

        {/* Main Header Container */}
        <div
          className={`max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
          }`}
        >
          {/* LEFT: Official Brand Logo & Name */}
          <a href="/" onClick={(e) => navigateTo('/', e)} className="flex items-center gap-3 group shrink-0 py-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden border border-accent-gold/40 shadow-md bg-[#121212] p-0.5 shrink-0 group-hover:border-accent-gold transition-colors">
              <img
                src={settings?.logo_primary || '/assets/latha-jewellery-works-logo.jpeg'}
                alt={businessName}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/assets/latha-jewellery-works-logo.jpeg';
                }}
                className="w-full h-full object-cover rounded-md"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-headline font-bold text-accent-gold uppercase tracking-wider text-sm sm:text-base group-hover:text-white transition-colors leading-tight whitespace-nowrap">
                {businessName}
              </span>
              <span className="text-[9px] sm:text-[10px] text-[#F5F2EB]/55 uppercase tracking-widest font-sans font-normal leading-none mt-0.5">
                Est. 1990 • Chathencode
              </span>
            </div>
          </a>

          {/* RIGHT: Desktop Navigation Links (Shown on lg+ / 1024px+ for clean, spacious presentation) */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs font-medium uppercase tracking-[0.1em] text-[#F5F2EB]/85 shrink-0">
            <a href="/" onClick={(e) => navigateTo('/', e)} className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Home
            </a>
            <a href="/collections" onClick={(e) => navigateTo('/collections', e)} className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Collections
            </a>
            <a href="/collections/kammal" onClick={(e) => navigateTo('/collections/kammal', e)} className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Kammal
            </a>
            <a href="/collections/kolus" onClick={(e) => navigateTo('/collections/kolus', e)} className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Kolus
            </a>
            <a href="/collections/chains-necklaces" onClick={(e) => navigateTo('/collections/chains-necklaces', e)} className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Chains & Necklaces
            </a>
            <a href="/collections/bangles-bracelets" onClick={(e) => navigateTo('/collections/bangles-bracelets', e)} className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Bangles & Bracelets
            </a>
            <a href="/collections/rings" onClick={(e) => navigateTo('/collections/rings', e)} className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Rings
            </a>
          </nav>

          {/* MOBILE / TABLET: Responsive Hamburger Button (<1024px) */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="lg:hidden w-10 h-10 rounded-lg bg-[#181818] border border-[#2A2A2A] text-accent-gold flex items-center justify-center hover:bg-accent-gold hover:text-[#121212] transition-colors shrink-0 ml-auto"
            aria-label="Open Mobile Menu"
          >
            <span className="material-symbols-outlined text-[22px]">menu</span>
          </button>
        </div>
      </header>

      {/* Mobile & Tablet Drawer Menu */}
      <MobileMenuDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenAdmin={onOpenAdmin}
      />
    </>
  );
}
