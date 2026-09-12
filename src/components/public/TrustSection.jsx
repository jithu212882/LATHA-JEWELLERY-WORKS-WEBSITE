import React from 'react';

export default function TrustSection() {
  const trustMetrics = [
    {
      icon: 'military_tech',
      title: '35+ Years',
      desc: 'Decades of uninterrupted dedication to gold craftsmanship in Chathencode.'
    },
    {
      icon: 'history_edu',
      title: 'Established 1990',
      desc: 'A trusted landmark rooted deeply in ancestral techniques and integrity.'
    },
    {
      icon: 'architecture',
      title: 'Custom Designs',
      desc: 'Bespoke creations sculpted precisely to your individual aesthetic specifications.'
    },
    {
      icon: 'handshake',
      title: 'Traditional Craft',
      desc: 'Authentic hand-forged ornaments with uncompromised karat purity.'
    }
  ];

  return (
    <section className="py-16 md:py-20 bg-[#181818] border-y border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {trustMetrics.map((item) => (
            <div key={item.title} className="p-6 bg-[#121212] border border-[#2A2A2A] rounded-xl hover:border-accent-gold/40 transition-colors">
              <span className="material-symbols-outlined text-accent-gold text-[44px] mb-4">
                {item.icon}
              </span>
              <h3 className="font-headline text-xl font-bold text-[#F9F6F0] mb-2">
                {item.title}
              </h3>
              <p className="font-body text-xs text-[#F5F2EB]/60 font-light leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
