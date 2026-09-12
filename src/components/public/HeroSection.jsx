import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useData } from '../../context/DataContext';

export default function HeroSection() {
  const { content, banners } = useData();
  const heroRef = useRef(null);
  const textRef = useRef(null);

  const activeBanner = banners && banners.length > 0 ? banners[0] : null;
  const bgImage = activeBanner?.desktop_image || content?.hero_bg || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAkWUGT7Fgqzp1aQblTwVWqhHMkBayKv-F3xfmcpRLMiJjJWhFNuSlAEQxhdaGCgp3i9WPIbA_ogfSZJf8PaTBfSqBb5Mo8ovhcYyY49R-wklPpAl8IGjuEb3UEvMOzLUHbLo4sdvYCSKKQ8C0kjhWTQZfKP4NoJxoRdLkx--H395QT_t0SImVRFcbznj6O-IJ84xsr5lCBxNUmJ9WcOODNdQxfPcGH9wyIA-Jlyg0Fi-NgYHy2hIUog';

  useEffect(() => {
    // GSAP reveal animation with reduced-motion check
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches && textRef.current) {
      gsap.fromTo(
        textRef.current.children,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out', delay: 0.1 }
      );
    }
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative min-h-[80vh] sm:min-h-[85vh] lg:min-h-[90vh] flex items-center justify-center overflow-hidden pt-24 sm:pt-28 pb-12 sm:pb-16 bg-[#121212]"
    >
      {/* Background Image with Dark Contrast Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105 transition-transform duration-1000"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      {/* Layered Gradient to guarantee legibility across all screen sizes */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/90 via-[#121212]/75 to-[#121212]" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10 w-full">
        <div ref={textRef} className="flex flex-col items-center w-full">
          {/* Eyebrow badge */}
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-accent-gold mb-4 sm:mb-6 border border-accent-gold/40 bg-accent-gold/10 px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium inline-block">
            {content?.hero_eyebrow || 'Established 1990 • Chathencode'}
          </span>

          {/* Headline */}
          <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F9F6F0] mb-4 sm:mb-6 leading-[1.2] sm:leading-[1.15] max-w-4xl">
            {content?.hero_title || (
              <>
                Crafting Unique Gold Ornaments <span className="italic font-normal text-accent-gold block sm:inline">Since 1990</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="font-body text-xs sm:text-base md:text-lg text-[#F5F2EB]/85 max-w-2xl mb-8 sm:mb-10 font-light leading-relaxed px-2">
            {content?.hero_subtitle || 'Where ancestral heritage meets uncompromising contemporary precision. Bespoke gold craftsmanship tailored to your most cherished milestones.'}
          </p>

          {/* Mobile-First Full-Width CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-2">
            <a
              href="#custom-enquiry"
              className="w-full sm:w-auto bg-accent-gold text-[#121212] font-bold px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm uppercase tracking-widest hover:bg-supporting-beige transition-all shadow-xl text-center active:scale-95"
            >
              Request Custom Design
            </a>
            <a
              href="#catalogue"
              className="w-full sm:w-auto border border-[#F5F2EB]/30 text-[#F5F2EB] font-medium px-8 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm uppercase tracking-widest hover:bg-[#F5F2EB]/10 transition-all text-center active:scale-95"
            >
              Explore Collections
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
