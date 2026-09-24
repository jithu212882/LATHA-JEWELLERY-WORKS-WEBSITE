import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useData } from '../../context/DataContext';
import { navigateTo } from '../../utils/navigation';

export default function HeroSection() {
  const { content, banners } = useData();
  const heroRef = useRef(null);
  const textRef = useRef(null);

  const activeBanner = (banners || []).find(b => b.active) || (banners && banners.length > 0 ? banners[0] : null);
  const bgImage = activeBanner?.desktop_image || activeBanner?.mobile_image || content?.hero_bg || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDAkWUGT7Fgqzp1aQblTwVWqhHMkBayKv-F3xfmcpRLMiJjJWhFNuSlAEQxhdaGCgp3i9WPIbA_ogfSZJf8PaTBfSqBb5Mo8ovhcYyY49R-wklPpAl8IGjuEb3UEvMOzLUHbLo4sdvYCSKKQ8C0kjhWTQZfKP4NoJxoRdLkx--H395QT_t0SImVRFcbznj6O-IJ84xsr5lCBxNUmJ9WcOODNdQxfPcGH9wyIA-Jlyg0Fi-NgYHy2hIUog';

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
      className="relative flex items-center justify-center overflow-hidden pt-[6.5rem] sm:pt-32 md:pt-36 lg:pt-40 pb-8 sm:pb-16 md:pb-20 min-h-0 sm:min-h-[75vh] lg:min-h-[82vh] bg-[#121212]"
    >
      {/* Background Image with Controlled Focus & Luxury Visibility */}
      <div
        className="absolute inset-0 bg-cover bg-[center_30%] sm:bg-center opacity-80 md:opacity-85 transition-opacity duration-1000"
        style={{ backgroundImage: `url('${bgImage}')` }}
      />
      {/* Editorial Vignette Overlay for Crisp Contrast & Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#121212]/60 via-[#121212]/35 to-[#121212]/90" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 flex flex-col items-center text-center z-10 w-full">
        <div ref={textRef} className="flex flex-col items-center w-full">
          {/* Established 1990 Badge */}
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 sm:mb-6 border border-accent-gold/40 bg-[#121212]/90 backdrop-blur-md px-3.5 sm:px-4 py-1 sm:py-1.5 rounded-full font-medium inline-block shadow-md">
            {content?.hero_eyebrow || 'Established 1990 • Chathencode'}
          </span>

          {/* Headline */}
          <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-[#F9F6F0] mb-3 sm:mb-6 leading-[1.2] sm:leading-[1.15] max-w-4xl drop-shadow-sm px-1">
            {activeBanner?.title || content?.hero_title || (
              <>
                Crafting Unique Gold Ornaments <span className="italic font-normal text-accent-gold block sm:inline">Since 1990</span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="font-body text-xs sm:text-base md:text-lg text-[#F5F2EB]/85 max-w-2xl mb-5 sm:mb-8 md:mb-10 font-light leading-relaxed px-2">
            {activeBanner?.subtitle || content?.hero_subtitle || 'Where ancestral heritage meets uncompromising contemporary precision. Bespoke gold craftsmanship tailored to your most cherished milestones.'}
          </p>

          {/* Mobile-First Full-Width CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full sm:w-auto px-2">
            <a
              href={activeBanner?.cta_link || "#custom-enquiry"}
              className="w-full sm:w-auto bg-accent-gold text-[#121212] font-bold px-7 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm uppercase tracking-widest hover:bg-supporting-beige transition-all shadow-xl text-center active:scale-95"
            >
              {activeBanner?.cta_label || "Request Custom Design"}
            </a>
            <a
              href="/collections"
              onClick={(e) => navigateTo('/collections', e)}
              className="w-full sm:w-auto border border-[#F5F2EB]/30 text-[#F5F2EB] font-medium px-7 py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm uppercase tracking-widest hover:bg-[#F5F2EB]/10 transition-all text-center active:scale-95"
            >
              Explore Collections
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
