import React from 'react';

export default function ServicesSection() {
  const services = [
    {
      num: '01',
      title: 'CUSTOM GOLD JEWELLERY',
      desc: 'Transform your sketches, reference images, and conceptual ideas into bespoke 22k gold jewellery.'
    },
    {
      num: '02',
      title: 'BRIDAL COLLECTIONS',
      desc: 'Temple jewellery, grand haram necklaces, valayal sets, and complete bridal suites designed for timeless grandeur.'
    },
    {
      num: '03',
      title: 'JEWELLERY RESTORATION',
      desc: 'Carefully restore treasured heirloom pieces, re-polish, and reinforce links while preserving their character.'
    },
    {
      num: '04',
      title: 'BESPOKE DESIGN CONSULTATION',
      desc: 'Personalized artisan guidance from initial weight and karat selection through final bench completion.'
    },
    {
      num: '05',
      title: 'OLD GOLD EXCHANGE & TESTING',
      desc: 'Transparent karat testing and accurate old gold valuation according to live market rates.'
    },
    {
      num: '06',
      title: 'FINE ENGRAVING & FINISHING',
      desc: 'Traditional die-struck filigree work, hand-chased antique finish, and mirror-polishing by master smiths.'
    }
  ];

  return (
    <section id="services" className="py-16 sm:py-24 md:py-28 bg-[#181818] scroll-mt-28 md:scroll-mt-36 border-y border-[#2A2A2A]/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-4 border-b border-[#2A2A2A] pb-6">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-accent-gold mb-2 block font-semibold">
              OUR MASTERIES
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#F9F6F0] tracking-tight">
              Curated Services
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 max-w-md font-light leading-relaxed">
            From heirloom bridal sets to minimalist daily wear, our Chathencode atelier provides comprehensive bespoke jewellery services.
          </p>
        </div>

        {/* Continuous Premium Editorial List Layout (No rounded container boxes) */}
        <div className="divide-y divide-[#2A2A2A]">
          {services.map((svc) => (
            <div
              key={svc.num}
              className="py-7 sm:py-9 group flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 sm:gap-12 transition-colors"
            >
              {/* Title Column */}
              <div className="flex items-baseline gap-4 sm:w-1/2">
                <span className="font-headline text-xs sm:text-sm font-bold text-accent-gold font-mono tracking-widest shrink-0">
                  {svc.num}
                </span>
                <h3 className="font-headline text-base sm:text-lg lg:text-xl font-bold text-[#F9F6F0] group-hover:text-accent-gold transition-colors tracking-wide">
                  {svc.title}
                </h3>
              </div>

              {/* Description Column (Slightly Increased Spacing) */}
              <div className="sm:w-1/2 pl-8 sm:pl-0 mt-1 sm:mt-0">
                <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/75 font-light leading-relaxed">
                  {svc.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
