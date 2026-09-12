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
    <section id="process" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8">
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
    </section>
  );
}
