import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import JewelleryDetailModal from './JewelleryDetailModal';
import { getCategoryRoute, navigateTo } from '../../utils/navigation';

export default function CatalogueSection() {
  const { categories, jewellery_models, settings } = useData();
  const [activeModalItem, setActiveModalItem] = useState(null);

  const whatsappNum = settings?.whatsapp || '9487056064';

  // Homepage displays only curated featured items (or top 4-6 models)
  const featuredModels = (jewellery_models || [])
    .filter((item) => item.active && item.featured)
    .slice(0, 6);

  const categoryBadges = [
    { name: 'ALL COLLECTIONS', route: '/collections' },
    { name: 'CHAINS & NECKLACES', route: '/collections/chains-necklaces' },
    { name: 'KOLUS (ANKLETS)', route: '/collections/kolus' },
    { name: 'KAMMAL (EARRINGS)', route: '/collections/kammal' },
    { name: 'BANGLES & BRACELETS', route: '/collections/bangles-bracelets' },
    { name: 'RINGS', route: '/collections/rings' },
  ];

  (categories || []).filter((c) => c.active).forEach((c) => {
    const route = getCategoryRoute(c.slug);
    if (!categoryBadges.some((cb) => cb.route === route)) {
      categoryBadges.push({ name: c.name.toUpperCase(), route });
    }
  });

  return (
    <section id="catalogue" className="py-14 sm:py-20 md:py-28 bg-[#181818]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        {/* Section Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4">
          <div>
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.2em] text-accent-gold mb-2 block font-semibold">
              Handcrafted Masterpieces
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#F9F6F0]">
              Featured Jewellery Showcase
            </h2>
          </div>

          <a
            href="/collections"
            onClick={(e) => navigateTo('/collections', e)}
            className="inline-flex items-center gap-2 text-accent-gold hover:text-white transition-colors text-xs font-bold uppercase tracking-widest border border-accent-gold/40 bg-accent-gold/5 px-4 py-2.5 rounded-lg shrink-0 self-start md:self-auto"
          >
            <span>View All Collections</span>
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
          </a>
        </div>

        {/* Category Navigation Badges / Chips */}
        <div className="flex flex-nowrap sm:flex-wrap items-center gap-2 overflow-x-auto no-scrollbar pb-3 pt-1 -mx-3 px-3 sm:mx-0 sm:px-0 mb-8 sm:mb-12">
          {categoryBadges.map((badge) => (
            <a
              key={badge.route}
              href={badge.route}
              onClick={(e) => navigateTo(badge.route, e)}
              className="px-3.5 sm:px-4.5 py-2 text-[11px] sm:text-xs uppercase tracking-wider rounded-lg font-medium whitespace-nowrap bg-[#121212] text-[#F5F2EB]/85 border border-[#2A2A2A] hover:border-accent-gold hover:text-accent-gold transition-all shrink-0 active:scale-95 shadow-sm"
            >
              {badge.name}
            </a>
          ))}
        </div>

        {/* Curated Featured Models Grid (2 Columns on Mobile, 3 on Tablet/Desktop) */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-headline font-bold text-base sm:text-lg text-[#F9F6F0] uppercase tracking-wider">
              Signature Highlights
            </h3>
            <span className="text-[11px] text-[#F5F2EB]/50 uppercase">Curated Selection</span>
          </div>

          {featuredModels.length === 0 ? (
            <div className="text-center py-12 border border-[#2A2A2A] rounded-2xl bg-[#121212] px-4">
              <span className="material-symbols-outlined text-accent-gold text-3xl mb-2">diamond</span>
              <p className="font-body text-xs text-[#F5F2EB]/60">Explore our dedicated category collections.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-6">
              {featuredModels.map((item) => {
                const waMsg = `Hello Latha Jewellery Works,%0A%0AI am interested in inquiring about your piece: *${encodeURIComponent(
                  item.name
                )}*`;
                const waUrl = `https://wa.me/91${whatsappNum}?text=${waMsg}`;

                const categoryObj = categories?.find(c => c.slug.toLowerCase() === item.category_slug.toLowerCase());
                const categoryTag = categoryObj?.name || item.category_slug;

                return (
                  <div
                    key={item.id}
                    className="bg-[#121212] border border-[#2A2A2A] rounded-xl sm:rounded-2xl overflow-hidden group hover:border-accent-gold/50 transition-all duration-300 flex flex-col justify-between shadow-lg"
                  >
                    <div
                      onClick={() => setActiveModalItem(item)}
                      className="relative aspect-square w-full bg-[#181818] cursor-pointer overflow-hidden group"
                    >
                      <img
                        src={item.primary_image}
                        alt={item.name}
                        loading="lazy"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/latha-logo.jpg';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-[#121212]/85 backdrop-blur-md px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] text-accent-gold uppercase tracking-wider font-semibold border border-accent-gold/30 rounded shadow-md truncate max-w-[85%]">
                        {categoryTag}
                      </span>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center">
                        <span className="bg-accent-gold text-[#121212] font-bold text-xs uppercase tracking-wider px-3.5 py-1.5 rounded-lg shadow-xl">
                          View Details
                        </span>
                      </div>
                    </div>

                    <div className="p-2.5 sm:p-4 flex flex-col justify-between flex-1">
                      <div>
                        <h3
                          onClick={() => setActiveModalItem(item)}
                          className="font-headline text-xs sm:text-base font-bold text-[#F9F6F0] mb-1 cursor-pointer hover:text-accent-gold transition-colors line-clamp-2 leading-snug"
                          title={item.name}
                        >
                          {item.name}
                        </h3>
                        <p className="font-body text-[10px] sm:text-xs text-[#F5F2EB]/65 mb-3 font-light leading-tight">
                          Min. Weight: <strong className="text-accent-gold font-medium">{item.min_weight || 'Custom'}</strong>
                        </p>
                      </div>

                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-1 sm:gap-1.5 bg-[#1C1B1A] border border-accent-gold/40 text-accent-gold py-1.5 sm:py-2 px-2 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider hover:bg-accent-gold hover:text-[#121212] font-bold transition-all mt-auto active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[14px] sm:text-[16px] shrink-0">chat</span>
                        <span className="truncate">Enquire</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dedicated Catalogue Page CTAs Footer Banner */}
        <div className="bg-[#121212] border border-[#2A2A2A] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <h4 className="font-headline font-bold text-lg sm:text-xl text-[#F9F6F0] mb-1">
              Looking for a Specific Jewellery Category?
            </h4>
            <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/65 font-light">
              Visit our dedicated category catalogue pages for complete designs and weight specifications.
            </p>
          </div>
          <a
            href="/collections"
            onClick={(e) => navigateTo('/collections', e)}
            className="bg-accent-gold text-[#121212] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-all shadow-lg shrink-0"
          >
            Open Dedicated Catalogue
          </a>
        </div>
      </div>

      {/* Item Detail Modal */}
      {activeModalItem && (
        <JewelleryDetailModal
          item={activeModalItem}
          onClose={() => setActiveModalItem(null)}
        />
      )}
    </section>
  );
}


