import React from 'react';
import { useData } from '../../context/DataContext';

export default function SpotlightSection() {
  const { content, settings } = useData();

  const title = content?.featured_title || 'The Heritage Bridal Haram';
  const description = content?.featured_description || 'Handcrafted over 120 meticulous hours by our master artisans, this grand bridal haram seamlessly fuses traditional South Indian motifs with peerless stone settings. An heirloom destined to be passed down through generations.';
  const image = content?.featured_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdOahHclHAsBUtElovuX4uYyCXaktJE1cuGdtppl7Hl0O05DUB__51kSRBU-bCpqO7FJIUSboLSL9YFVV34plW3gsNhg3a9vpdXYsJjtlAjB2yf2n3SdiuG5XO0a58T9JEXUm9-6QCc0t6IaQnQO4Pe_Hn0qeo_ndWIDMiJBjAJnSkIrnSe3C7eQru8iDDrzWljbjiOUM0VypUz6C5IYSO1_4yN0_pHxZN9LVsUTvrxGtqhDl56z2MfA';
  const whatsappNum = settings?.whatsapp || '9487056064';

  const waMsg = `Hello Latha Jewellery Works,%0A%0AI would like to schedule a viewing or consultation for the piece: *${encodeURIComponent(title)}*`;
  const waUrl = `https://wa.me/91${whatsappNum}?text=${waMsg}`;

  return (
    <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 relative">
          <div
            className="h-[360px] sm:h-[480px] bg-cover bg-center border border-[#2A2A2A] rounded-2xl shadow-2xl overflow-hidden"
            style={{ backgroundImage: `url('${image}')` }}
          />
        </div>
        
        <div className="lg:col-span-5 flex flex-col justify-center">
          <span className="text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 block font-semibold">
            Masterpiece Spotlight
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-[#F9F6F0] mb-6">
            {title}
          </h2>
          <p className="font-body text-sm sm:text-base text-[#F5F2EB]/80 mb-6 font-light leading-relaxed">
            {description}
          </p>

          <ul className="space-y-3 mb-8 text-xs sm:text-sm text-[#F5F2EB]/80 font-light">
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent-gold text-[18px]">check</span> 100% Certified 22K Karat Purity
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent-gold text-[18px]">check</span> Hand-selected Natural Gemstones
            </li>
            <li className="flex items-center gap-3">
              <span className="material-symbols-outlined text-accent-gold text-[18px]">check</span> Completely Bespoke Length & Weight Options
            </li>
          </ul>

          <div>
            <a
              href={waUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-accent-gold text-[#121212] font-bold px-8 py-4 rounded-xl text-xs sm:text-sm uppercase tracking-wider hover:bg-supporting-beige transition-all shadow-xl"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Enquire About This Piece
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
