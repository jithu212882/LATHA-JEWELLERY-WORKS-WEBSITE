import React from 'react';

export default function ServicesSection() {
  const services = [
    {
      icon: 'diamond',
      title: 'Custom Gold Jewellery',
      desc: 'Transform your personal sketches or conceptual ideas into breathtaking reality with our master artisans.'
    },
    {
      icon: 'checkroom',
      title: 'Bridal Collections',
      desc: 'Magnificent temple jewellery, heavy necklaces, and complete bridal suites designed for timeless grandeur.'
    },
    {
      icon: 'link',
      title: 'Gold Chains & Necklaces',
      desc: 'Exquisite machine and hand-crafted chains, traditional Palakka mala, and layered statement necklaces.'
    },
    {
      icon: 'radio_button_unchecked',
      title: 'Bangles & Bracelets',
      desc: 'Solid gold kadas, antique finish valayal, and delicate gemstone-studded cuffs crafted for comfort.'
    },
    {
      icon: 'flare',
      title: 'Rings & Earrings',
      desc: 'Statement engagement bands, intricate jimkis, jhumkas, and modern studs forged with precision detailing.'
    },
    {
      icon: 'verified',
      title: 'Purity & Restructuring',
      desc: 'Advanced karat testing, meticulous old gold exchange valuation, and professional jewelry restoration.'
    }
  ];

  return (
    <section id="services" className="py-20 md:py-28 bg-[#181818] border-y border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 lg:mb-16">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 block font-semibold">
              Our Masteries
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-[#F9F6F0]">
              Curated Services & Specialties
            </h2>
          </div>
          <p className="font-body text-sm text-[#F5F2EB]/70 max-w-md mt-4 md:mt-0 font-light">
            From heirloom bridal sets to minimalist daily wear, our atelier provides comprehensive bespoke and traditional jewellery services.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {services.map((svc) => (
            <div
              key={svc.title}
              className="bg-[#121212] p-8 border border-[#2A2A2A] rounded-xl hover:border-accent-gold/50 transition-all group hover:-translate-y-1 duration-300"
            >
              <span className="material-symbols-outlined text-accent-gold text-[36px] mb-6 group-hover:scale-110 transition-transform">
                {svc.icon}
              </span>
              <h3 className="font-headline text-xl font-bold text-[#F9F6F0] mb-3 group-hover:text-accent-gold transition-colors">
                {svc.title}
              </h3>
              <p className="font-body text-sm text-[#F5F2EB]/70 font-light leading-relaxed">
                {svc.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
