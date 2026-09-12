import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function MobileMenuDrawer({ isOpen, onClose, onOpenAdmin }) {
  const drawerRef = useRef(null);
  const itemsRef = useRef([]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(drawerRef.current, {
        x: '0%',
        duration: 0.4,
        ease: 'power3.out'
      });
      gsap.fromTo(
        itemsRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.05, delay: 0.15, ease: 'power2.out' }
      );
    } else {
      document.body.style.overflow = 'auto';
      gsap.to(drawerRef.current, {
        x: '100%',
        duration: 0.3,
        ease: 'power3.in'
      });
    }
  }, [isOpen]);

  const navLinks = [
    { label: 'Home', href: '#' },
    { label: 'About', href: '#about' },
    { label: 'Services', href: '#services' },
    { label: 'Collections', href: '#catalogue' },
    { label: 'Process', href: '#process' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' },
  ];

  return (
    <div
      ref={drawerRef}
      className="fixed inset-0 z-[100] bg-[#121212]/98 backdrop-blur-xl flex flex-col pt-6 px-6 pb-8 transform translate-x-full transition-none"
    >
      <div className="flex justify-between items-center pb-4 border-b border-[#2A2A2A]">
        <div className="flex flex-col leading-tight">
          <span className="font-headline font-bold text-accent-gold text-lg uppercase tracking-widest">
            Latha Jewellery
          </span>
          <span className="text-[11px] text-[#F5F2EB]/50 uppercase tracking-wider">Atelier • Est. 1990</span>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full bg-[#181818] border border-[#2A2A2A] flex items-center justify-center text-accent-gold hover:bg-accent-gold hover:text-[#121212] transition-colors"
          aria-label="Close menu"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      <nav className="flex flex-col gap-4 text-xl font-headline py-8 overflow-y-auto">
        {navLinks.map((link, idx) => (
          <a
            key={link.label}
            ref={(el) => (itemsRef.current[idx] = el)}
            href={link.href}
            onClick={onClose}
            className="text-[#F9F6F0]/80 hover:text-accent-gold transition-colors tracking-wide py-1 border-b border-[#2A2A2A]/40 uppercase text-lg"
          >
            {link.label}
          </a>
        ))}
        <button
          ref={(el) => (itemsRef.current[navLinks.length] = el)}
          onClick={() => {
            onClose();
            onOpenAdmin();
          }}
          className="text-left text-accent-gold hover:text-white transition-colors tracking-wide py-1 text-lg uppercase font-bold flex items-center gap-2 pt-2"
        >
          <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
          Admin Studio
        </button>
      </nav>

      <div className="mt-auto pt-6 border-t border-[#2A2A2A] flex flex-col gap-3">
        <a
          href="https://wa.me/919487056064"
          target="_blank"
          rel="noreferrer"
          className="w-full py-3.5 bg-accent-gold text-[#121212] font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 shadow-lg"
        >
          <span className="material-symbols-outlined text-[20px]">chat</span> WhatsApp | +91 94870 56064
        </a>
        <a
          href="tel:9487056064"
          className="w-full py-3 border border-accent-gold/40 text-accent-gold font-bold text-sm uppercase tracking-widest rounded-lg flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">call</span> Call Atelier
        </a>
      </div>
    </div>
  );
}
