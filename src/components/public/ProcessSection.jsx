import React from 'react';

export default function ProcessSection() {
  const steps = [
    {
      step: '01',
      title: 'Share Your Design',
      desc: 'Reference images, sketches, or describe your dream ornament via WhatsApp or enquiry form.'
    },
    {
      step: '02',
      title: 'Discuss Requirements',
      desc: 'Consult on gold weight, purity (22K/18K), gemstones, sizing, and design specifications.'
    },
    {
      step: '03',
      title: 'Receive Estimation',
      desc: 'Transparent pricing breakdown based on approved requirements, current gold rates, and making charges.'
    },
    {
      step: '04',
      title: 'Craft & Refine',
      desc: 'Master artisans carefully bring the design to life using generational goldsmithing techniques.'
    },
    {
      step: '05',
      title: 'Final Delivery',
      desc: 'The completed piece is inspected and prepared for collection at our Chathencode studio or secure delivery.'
    }
  ];

  return (
    <section id="process" className="py-16 sm:py-24 md:py-28 bg-[#121212] scroll-mt-28 md:scroll-mt-36 border-t border-[#2A2A2A]/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-accent-gold mb-2 block font-semibold">
            STEP BY STEP
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#F9F6F0] tracking-tight">
            The Craftsmanship Journey
          </h2>
          <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 mt-3 font-light leading-relaxed">
            How we bring your bespoke vision to life with complete transparency and generational artistry.
          </p>
        </div>

        {/* Vertical Atelier Timeline System */}
        <div className="relative border-l border-accent-gold/30 ml-4 sm:ml-8 md:ml-12 space-y-10 sm:space-y-12">
          {steps.map((st) => (
            <div key={st.step} className="relative pl-8 sm:pl-12 group">
              {/* Gold Numbered Marker */}
              <div className="absolute -left-4 sm:-left-5 top-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#121212] border border-accent-gold/60 text-accent-gold flex items-center justify-center font-headline text-xs sm:text-sm font-bold shadow-md group-hover:border-accent-gold group-hover:bg-accent-gold group-hover:text-[#121212] transition-all duration-300">
                {st.step}
              </div>

              {/* Step Content */}
              <div className="pt-0.5 space-y-1.5">
                <h3 className="font-headline text-lg sm:text-xl font-bold text-[#F9F6F0] group-hover:text-accent-gold transition-colors tracking-wide">
                  {st.title}
                </h3>
                <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/75 font-light leading-relaxed max-w-xl">
                  {st.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
