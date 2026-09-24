import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useData } from '../../context/DataContext';
import { navigateTo } from '../../utils/navigation';

export default function CatalogueSection() {
  const { content, jewellery_models, categories } = useData();
  const sectionRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mediaQuery.matches && sectionRef.current) {
      gsap.fromTo(
        sectionRef.current.querySelectorAll('.editorial-card'),
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' }
      );
    }
  }, []);

  // Dynamically resolve categories from live state / admin changes
  const activeCategories = (categories || []).filter((c) => c.active !== 0);

  const chainCategory = activeCategories.find(
    (c) => (c.slug || '').toLowerCase() === 'chain' || (c.name || '').toLowerCase().includes('chain')
  );
  const kammalCategory = activeCategories.find(
    (c) => (c.slug || '').toLowerCase() === 'kammal' || (c.name || '').toLowerCase().includes('kammal') || (c.name || '').toLowerCase().includes('earring')
  );
  const bangleCategory = activeCategories.find(
    (c) => (c.slug || '').toLowerCase() === 'bangles' || (c.name || '').toLowerCase().includes('bangle')
  );
  const kolusCategory = activeCategories.find(
    (c) => (c.slug || '').toLowerCase() === 'kolus' || (c.name || '').toLowerCase().includes('kolus') || (c.name || '').toLowerCase().includes('anklet')
  );
  const ringsCategory = activeCategories.find(
    (c) => (c.slug || '').toLowerCase() === 'rings' || (c.name || '').toLowerCase().includes('ring')
  );

  const bridalModel = (jewellery_models || []).find((m) => m.id === 7 || (m.category_slug || '').toLowerCase() === 'chain') || jewellery_models?.[0];
  const chainModel = (jewellery_models || []).find((m) => m.id === 1 || (m.category_slug || '').toLowerCase() === 'chain') || jewellery_models?.[0];
  const kammalModel = (jewellery_models || []).find((m) => m.id === 3 || (m.category_slug || '').toLowerCase() === 'kammal') || jewellery_models?.[1];
  const bangleModel = (jewellery_models || []).find((m) => m.id === 4 || (m.category_slug || '').toLowerCase() === 'bangles') || jewellery_models?.[2];

  // 1. Large Featured Atelier Highlight Card (Left)
  const featuredCard = {
    id: 'bridal',
    title: content?.featured_title || 'Bridal & Temple Jewellery',
    categoryTag: 'ATELIER HIGHLIGHT',
    description: content?.featured_description || 'Ancestral South Indian temple harams and heritage bridal suites hand-forged in 100% certified 22k gold.',
    route: '/collections/chains-necklaces',
    image: content?.featured_image || chainCategory?.image_url || bridalModel?.primary_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAdOahHclHAsBUtElovuX4uYyCXaktJE1cuGdtppl7Hl0O05DUB__51kSRBU-bCpqO7FJIUSboLSL9YFVV34plW3gsNhg3a9vpdXYsJjtlAjB2yf2n3SdiuG5XO0a58T9JEXUm9-6QCc0t6IaQnQO4Pe_Hn0qeo_ndWIDMiJBjAJnSkIrnSe3C7eQru8iDDrzWljbjiOUM0VypUz6C5IYSO1_4yN0_pHxZN9LVsUTvrxGtqhDl56z2MfA'
  };

  // 2. Supporting Category Showcase Cards (Right) - Dynamically using Admin Category Images!
  const supportingCards = [
    {
      id: 'chains',
      title: chainCategory?.name || 'Chains & Necklaces',
      categoryTag: 'ROYAL LINKS',
      route: '/collections/chains-necklaces',
      image: chainCategory?.image_url || chainModel?.primary_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDnskaVKp4AGGJ79HeuyN4y4eMStueunvHzx12Hmb2ujC1ApDVQFiak_UH3jVcFbhBwb6cCO9-3iy42vxquH8x_cY3vFjxrI66X4grNpvOH3ai_XjfbWz1PE3jdivj0IC-sLGEoYhQcNrwt4IHnP1kyUPMEahTpb9kCd01Cu5_bH9LDSob6yISF95MGbG1asDCuOXW8bI_418peCJD2DOmaM5oWQ3HEE48Ln-9FXFdpTwnO_ie3TytU5w'
    },
    {
      id: 'kammal',
      title: kammalCategory?.name || 'Earrings / Kammal',
      categoryTag: 'TEMPLE JIMKIS',
      route: '/collections/kammal',
      image: kammalCategory?.image_url || kammalModel?.primary_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCgXuR9HZ2L03yoh7a4cPcY3dmCjytQ6S3bjHybTIWpFN3-Q3gRZLwhnqvQb6W-Vc0KqXGSOoz3NK8j1cLutVDM0dqMvS1XTmm8QFeMAFXGaZ1qNo2piEPRgQRCSDzSt30sE4JW8HM6iX2zAKpxhKleZPCh2zNOha5rtx4hwdoKUiMsnF4_t1FlCSjl8JNrAM6Ecs2QyC8dYF01waC6UwOqV-z3g198ten31-6HiOnZpEaeuV-hAVdwRw'
    },
    {
      id: 'bangles',
      title: bangleCategory?.name || 'Bangles & Bracelets',
      categoryTag: 'HAND-ENGRAVED',
      route: '/collections/bangles-bracelets',
      image: bangleCategory?.image_url || bangleModel?.primary_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBLl7BdsBtE3bAuXGjSQphqRGgSOlMSn-A62GrkIUdmng0l33UqV3OMvoX5GRSvt09wmFmLxmAzpFV4icbVbUyiviMQcMYUeFwY4xeGI-rnjeR97xrNVJ8H4ETGX16FsVbKGRGH_TppL9-XfcJkS07QQGLXFjJkQ4j4c--88RW24hElwfLSZCGIAp_weUgjY__PhS6AeXylhnRZV1QitOJmwJ88u72vxTEqSqUGCojkj2no13jOsskmaw'
    },
    {
      id: 'kolus',
      title: kolusCategory?.name || 'Kolus (Anklets)',
      categoryTag: 'HERITAGE BELLS',
      route: '/collections/kolus',
      image: kolusCategory?.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuARGVXDagX1I0wU7qeCCwtpbMzlW2w0l8sCdqvHXv2-QxCrdiPh7TX0m0Hd3mcS0QdHzcoeM3jEU4pd5jyBvkqVxjTzZxHDb0x35LpZH-i_e-fDoy10rc7wLGub-ZLDl-DgL1lTPj8SygN5AAVP_7RxyMVQMB3zGKfUUAwRcFING5YxPmGvDbpRkfB5mZc-cESp_NJHU26hF0sPgskmiYog0CQI2tp9FF5Ojw_hP94YUZcy42jhzYg'
    },
    {
      id: 'rings',
      title: ringsCategory?.name || 'Rings Collection',
      categoryTag: 'ROYAL BANDS',
      route: '/collections/rings',
      image: ringsCategory?.image_url || 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjH0Wf92nSb6Ea9999evorQ-Ofyk3D1-TfcWgvTtd11AFIcAjqcps2kNorL-vgVS41vhD91B03s2T5uHFjiPDfNY5Gky0DyihyQ37CchFeP5AIbtCCwgfv-YGZTmbG0WIK042p0OcaQjI3astHLHSVy8rUhi8UgTO-1AEzybWxxfquSXFF-L2jHCUNA2KihtbTyNPyBPwM_ufBvGWLoq4DlKdYhS0Ba-6s5ppWFzdwXp97rOrXjcN2LQ'
    }
  ];

  return (
    <section ref={sectionRef} id="catalogue" className="py-14 sm:py-20 md:py-24 bg-[#181818] border-y border-[#2A2A2A]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Editorial Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-12 gap-4 border-b border-[#2A2A2A]/60 pb-6">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-accent-gold mb-2 block font-semibold">
              SIGNATURE HIGHLIGHTS
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#F9F6F0] tracking-tight">
              Curated Selection
            </h2>
          </div>
          <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 max-w-sm font-light leading-relaxed">
            A considered selection from our signature collections.
          </p>
        </div>

        {/* Asymmetric Editorial Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-10 sm:mb-14 items-stretch">
          
          {/* LARGE FEATURED COLLECTION CARD (Desktop: 6 Columns) */}
          <div className="lg:col-span-6 flex flex-col editorial-card">
            <a
              href={featuredCard.route}
              onClick={(e) => navigateTo(featuredCard.route, e)}
              className="group relative flex-1 bg-[#121212] border border-[#2A2A2A] hover:border-accent-gold/50 rounded-2xl overflow-hidden transition-all duration-500 flex flex-col justify-end min-h-[380px] sm:min-h-[460px] lg:min-h-[520px] p-6 sm:p-8 shadow-xl"
            >
              {/* Clean Jewellery Photograph */}
              <div
                className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                style={{ backgroundImage: `url('${featuredCard.image}')` }}
              />
              {/* Subtle Vignette Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/60 to-transparent opacity-90 group-hover:opacity-95 transition-opacity" />

              {/* Editorial Card Information Panel */}
              <div className="relative z-10 space-y-3">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-accent-gold bg-[#121212]/90 backdrop-blur-md px-3 py-1 rounded border border-accent-gold/30 font-semibold inline-block">
                  {featuredCard.categoryTag}
                </span>
                <h3 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#F9F6F0] group-hover:text-accent-gold transition-colors leading-tight">
                  {featuredCard.title}
                </h3>
                <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/80 font-light max-w-xl leading-relaxed line-clamp-2">
                  {featuredCard.description}
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs text-accent-gold font-semibold uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                  <span>Explore Collection</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </div>
              </div>
            </a>
          </div>

          {/* SUPPORTING COLLECTION CARDS (Desktop: 6 Columns Grid) */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4.5">
            {supportingCards.map((card, idx) => (
              <a
                key={card.id}
                href={card.route}
                onClick={(e) => navigateTo(card.route, e)}
                className={`editorial-card group relative bg-[#121212] border border-[#2A2A2A] hover:border-accent-gold/50 rounded-2xl overflow-hidden transition-all duration-500 flex flex-col justify-end p-4 sm:p-5 min-h-[145px] sm:min-h-[155px] shadow-lg ${
                  idx === supportingCards.length - 1 && supportingCards.length % 2 !== 0 ? 'sm:col-span-2' : ''
                }`}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  style={{ backgroundImage: `url('${card.image}')` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-[#121212]/70 to-transparent opacity-85 group-hover:opacity-95 transition-opacity" />

                <div className="relative z-10 flex items-end justify-between gap-3">
                  <div className="space-y-0.5 max-w-[80%]">
                    <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.2em] text-accent-gold font-medium block">
                      {card.categoryTag}
                    </span>
                    <h4 className="font-headline text-sm sm:text-base font-bold text-[#F9F6F0] group-hover:text-accent-gold transition-colors leading-snug truncate">
                      {card.title}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] sm:text-[11px] text-accent-gold font-bold uppercase tracking-wider shrink-0 group-hover:translate-x-1 transition-transform">
                    <span>Explore</span>
                    <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

        </div>

        {/* Minimal Understated CTA Footer Link */}
        <div className="text-center pt-2">
          <a
            href="/collections"
            onClick={(e) => navigateTo('/collections', e)}
            className="inline-flex items-center gap-2 text-accent-gold hover:text-white border border-accent-gold/40 hover:border-accent-gold bg-[#121212] hover:bg-accent-gold/10 px-8 py-3.5 rounded-xl text-xs uppercase tracking-[0.2em] font-bold transition-all shadow-md group"
          >
            <span>EXPLORE ALL COLLECTIONS</span>
            <span className="material-symbols-outlined text-[16px] group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          </a>
        </div>

      </div>
    </section>
  );
}
