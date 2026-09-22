import React from 'react';

export default function TrustSection() {
  const specialities = [
    {
      num: '01',
      title: '22K GOLD CRAFTSMANSHIP',
      desc: 'Meticulous hand-forging using 100% certified karat purity and traditional South Indian bench techniques.'
    },
    {
      num: '02',
      title: 'TEMPLE JEWELLERY',
      desc: 'Intricate die-struck jimkis, haram necklaces, and valayal sets inspired by regional heritage and artistry.'
    },
    {
      num: '03',
      title: 'BESPOKE CREATIONS',
      desc: 'Custom ornaments sculpted precisely around your individual vision, weight requirement, and occasion.'
    },
    {
      num: '04',
      title: 'TRADITIONAL TECHNIQUES',
      desc: 'Generational goldsmithing passed down since 1990, combined with modern testing precision.'
    }
  ];

  return (
    <section id="specialities" className="py-16 sm:py-24 md:py-28 bg-[#121212] scroll-mt-28 md:scroll-mt-36 border-b border-[#2A2A2A]/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-accent-gold mb-2 block font-semibold">
            ATELIER CAPABILITIES
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#F9F6F0] tracking-tight">
            Specialities
          </h2>
          <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 mt-3 font-light leading-relaxed">
            The foundational capabilities and craftsmanship pillars of Latha Jewellery Works since 1990.
          </p>
        </div>

        {/* Editorial Feature Grid with Top Gold Rules */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {specialities.map((item) => (
            <div
              key={item.num}
              className="pt-6 border-t border-accent-gold/40 group hover:border-accent-gold transition-colors space-y-3"
            >
              <span className="font-headline text-xs font-bold text-accent-gold font-mono tracking-widest block">
                {item.num}
              </span>
              <h3 className="font-headline text-base sm:text-lg font-bold text-[#F9F6F0] group-hover:text-accent-gold transition-colors tracking-wide leading-snug">
                {item.title}
              </h3>
              <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/75 font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
