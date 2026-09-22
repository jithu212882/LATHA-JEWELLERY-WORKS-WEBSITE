import React from 'react';

export default function ProcessSection() {
  const steps = [
    {
      step: '01',
      title: 'Share Your Design',
      desc: 'Send us reference images, sketches, or describe your dream ornament via WhatsApp or enquiry form.'
    },
    {
      step: '02',
      title: 'Discuss Requirements',
      desc: 'We consult on gold weight, purity (22K/18K), gemstone choices, and exact sizing details.'
    },
    {
      step: '03',
      title: 'Receive Estimation',
      desc: 'Transparent breakdown of current gold rates, making charges, and estimated crafting timeline.'
    },
    {
      step: '04',
      title: 'Crafting Process',
      desc: 'Master artisans hand-forge your piece with meticulous attention to detail and traditional skill.'
    },
    {
      step: '05',
      title: 'Delivery',
      desc: 'Inspect and collect your finished masterpiece from our Chathencode studio or securely delivered.'
    }
  ];

  return (
    <section id="process" className="py-16 sm:py-20 md:py-28 bg-[#121212] md:bg-transparent scroll-mt-28 md:scroll-mt-36 border-t md:border-t-0 border-[#2A2A2A]/40">
      
      {/* MOBILE DESIGN (< 768px) - Premium Vertical Timeline */}
      <div className="md:hidden max-w-4xl mx-auto px-4 sm:px-6">
        {/* Mobile Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-accent-gold mb-2 block font-semibold">
            STEP BY STEP
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#F9F6F0] tracking-tight">
            The Craftsmanship Journey
          </h2>
          <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 mt-3 font-light leading-relaxed">
            How we bring your bespoke vision to life with complete transparency and generational artistry.
          </p>
        </div>

        {/* Vertical Atelier Timeline System */}
        <div className="relative border-l border-accent-gold/30 ml-4 sm:ml-8 space-y-10 sm:space-y-12">
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

      {/* DESKTOP ORIGINAL DESIGN (≥ 768px) - Original 5 Card Layout */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 block font-semibold">
            Step by Step
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-[#F9F6F0]">
            The Craftsmanship Journey
          </h2>
          <p className="font-body text-sm sm:text-base text-[#F5F2EB]/70 mt-4 font-light">
            How we bring your bespoke vision to life with complete transparency and generational artistry.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {steps.map((st) => (
            <div
              key={st.step}
              className="bg-[#181818] p-6 border border-[#2A2A2A] rounded-xl flex flex-col justify-between hover:border-accent-gold/50 transition-colors"
            >
              <div>
                <span className="font-headline text-3xl sm:text-4xl font-bold text-accent-gold block mb-4">
                  {st.step}
                </span>
                <h3 className="font-headline text-lg font-bold text-[#F9F6F0] mb-2">
                  {st.title}
                </h3>
                <p className="font-body text-xs text-[#F5F2EB]/70 font-light leading-relaxed">
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
