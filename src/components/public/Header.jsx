import React, { useState, useEffect, useRef } from 'react';
import LiveRateTicker from './LiveRateTicker';
import MobileMenuDrawer from './MobileMenuDrawer';
import { useData } from '../../context/DataContext';

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
          className={`max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-14 sm:h-16' : 'h-16 sm:h-20'
          }`}
        >
          {/* LEFT: Compact Brand Logo */}
          <a href="#" className="flex flex-col group shrink-0 py-1">
            <span className="font-headline font-bold text-accent-gold uppercase tracking-wider text-sm sm:text-base group-hover:text-white transition-colors leading-tight">
              {businessName}
            </span>
            <span className="text-[9px] text-[#F5F2EB]/50 uppercase tracking-widest font-sans font-normal">
              Est. 1990 • Chathencode
            </span>
          </a>

          {/* CENTER: Desktop Navigation (Shown ONLY on 1200px+ to ensure proper spacing without cramped overlap) */}
          <nav className="hidden xl:flex items-center gap-5 sm:gap-6 text-xs font-medium uppercase tracking-[0.08em] text-[#F5F2EB]/80 shrink">
            <a href="#" className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Home
            </a>
            <a href="#about" className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              About
            </a>
            <a href="#services" className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Services
            </a>
            <a href="#catalogue" className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Collections
            </a>
            <a href="#process" className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Process
            </a>
            <a href="#testimonials" className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Testimonials
            </a>
            <a href="#contact" className="hover:text-accent-gold transition-colors py-1 relative hover:after:w-full after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-accent-gold after:transition-all">
              Contact
            </a>
          </nav>

          {/* RIGHT: Utility Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* WhatsApp Contact CTA */}
            <a
              href={`https://wa.me/91${whatsappNum}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border border-accent-gold/40 bg-accent-gold/5 text-accent-gold hover:bg-accent-gold hover:text-[#121212] px-2.5 sm:px-3.5 py-1.5 rounded-md text-[11px] sm:text-xs font-sans tracking-wide transition-all duration-200"
              title="Chat on WhatsApp"
            >
              <span className="material-symbols-outlined text-[16px] sm:text-[18px]">chat</span>
              <span className="hidden sm:inline font-medium">WhatsApp</span>
              <span className="hidden sm:inline text-accent-gold/40">|</span>
              <span className="hidden sm:inline font-semibold tracking-wider">{formattedPhone}</span>
            </a>

            {/* Admin Studio Control (Quiet Secondary Control for Desktop) */}
            <button
              onClick={onOpenAdmin}
              className="hidden sm:inline-flex items-center gap-1.5 text-[11px] text-[#F5F2EB]/50 hover:text-accent-gold uppercase tracking-wider font-medium transition-colors py-1 px-1.5"
              title="Open Admin Studio"
            >
              <span className="material-symbols-outlined text-[14px]">lock</span>
              <span>Admin Studio</span>
            </button>

            {/* Mobile/Tablet Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="xl:hidden w-9 h-9 rounded-md bg-[#181818] border border-[#2A2A2A] text-accent-gold flex items-center justify-center hover:bg-accent-gold hover:text-[#121212] transition-colors"
              aria-label="Open Mobile Menu"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>
          </div>
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
