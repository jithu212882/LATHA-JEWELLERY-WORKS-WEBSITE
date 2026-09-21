import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import JewelleryDetailModal from './JewelleryDetailModal';

export default function CategoryCataloguePage({ categorySlug }) {
  const { categories, jewellery_models, settings } = useData();
  const [activeModalItem, setActiveModalItem] = useState(null);

  const whatsappNum = settings?.whatsapp || '9487056064';

  // Normalize slug matching (e.g., 'chain' or 'chains-necklaces', 'bangles' or 'bangles-bracelets')
  const normalizeSlug = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const matchedCategory = (categories || []).find((c) => {
    const catSlugNorm = normalizeSlug(c.slug);
    const targetSlugNorm = normalizeSlug(categorySlug);
    if (catSlugNorm === targetSlugNorm) return true;
    if (catSlugNorm === 'chain' && (targetSlugNorm.includes('chain') || targetSlugNorm.includes('necklace'))) return true;
    if (catSlugNorm === 'bangles' && (targetSlugNorm.includes('bangle') || targetSlugNorm.includes('bracelet'))) return true;
    if (catSlugNorm === 'kammal' && (targetSlugNorm.includes('kammal') || targetSlugNorm.includes('earring'))) return true;
    if (catSlugNorm === 'kolus' && (targetSlugNorm.includes('kolu') || targetSlugNorm.includes('anklet'))) return true;
    if (catSlugNorm === 'rings' && targetSlugNorm.includes('ring')) return true;
    return false;
  });

  const categoryTitle =
    categorySlug === 'all'
      ? 'All Masterpiece Collections'
      : matchedCategory?.name || `${categorySlug.replace(/-/g, ' ').toUpperCase()} Collection`;

  const categoryDescription =
    categorySlug === 'all'
      ? 'Explore our complete heritage catalogue of handcrafted 22k gold and silver jewellery masterpieces.'
      : matchedCategory?.description ||
        `Handcrafted pure 22k gold ${categoryTitle.toLowerCase()} forged by master artisans in Chathencode.`;

  // Filter models for this specific route
  const categoryModels = (jewellery_models || []).filter((item) => {
    if (!item.active) return false;
    if (categorySlug === 'all') return true;
    if (matchedCategory) {
      return item.category_slug.toLowerCase() === matchedCategory.slug.toLowerCase();
    }
    return item.category_slug.toLowerCase() === categorySlug.toLowerCase();
  });

  const filterableCategories = [
    { slug: 'all', name: 'All Collections' },
    ...(categories || []).filter((c) => c.active)
  ];

  return (
    <div className="min-h-screen bg-[#121212] pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2A2A2A]">
          <a
            href="#/"
            className="inline-flex items-center gap-2 text-accent-gold hover:text-white transition-colors text-xs sm:text-sm font-semibold uppercase tracking-wider bg-[#181818] border border-[#2A2A2A] hover:border-accent-gold/40 px-3.5 py-2 rounded-lg shadow-md"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            <span>Back to Home</span>
          </a>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#F5F2EB]/50 uppercase tracking-widest font-sans">
            <span>Catalogue</span>
            <span>/</span>
            <span className="text-accent-gold font-medium">{categoryTitle}</span>
          </div>
        </div>

        {/* Dedicated Category Header */}
        <div className="bg-gradient-to-b from-[#1A1A1A] to-[#121212] border border-accent-gold/25 rounded-2xl p-6 sm:p-10 mb-8 sm:mb-12 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-accent-gold/5 blur-3xl pointer-events-none"></div>

          <span className="inline-block text-[11px] uppercase tracking-[0.25em] text-accent-gold font-bold mb-2">
            Dedicated Catalogue Route
          </span>
          <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold text-[#F9F6F0] mb-3">
            {categoryTitle}
          </h1>
          <p className="font-body text-xs sm:text-base text-[#F5F2EB]/75 font-light max-w-2xl leading-relaxed">
            {categoryDescription}
          </p>

          {/* Quick Category Badges/Filter */}
          <div className="mt-6 sm:mt-8 pt-6 border-t border-[#2A2A2A] flex flex-wrap gap-2">
            {filterableCategories.map((c) => {
              const isActive =
                (categorySlug === 'all' && c.slug === 'all') ||
                (matchedCategory && matchedCategory.slug === c.slug) ||
                categorySlug.toLowerCase() === c.slug.toLowerCase();

              return (
                <a
                  key={c.slug}
                  href={`#/collections/${c.slug}`}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium tracking-wider transition-all duration-300 border ${
                    isActive
                      ? 'bg-accent-gold text-[#121212] border-accent-gold shadow-lg font-bold'
                      : 'bg-[#181818] text-[#F5F2EB]/80 border-[#2A2A2A] hover:border-accent-gold/50 hover:text-accent-gold'
                  }`}
                >
                  {c.name}
                </a>
              );
            })}
          </div>
        </div>

        {/* Product Grid / Empty State */}
        {categoryModels.length === 0 ? (
          <div className="text-center py-20 bg-[#161616] rounded-2xl border border-[#2A2A2A]">
            <span className="material-symbols-outlined text-accent-gold text-5xl mb-3">diamond</span>
            <h3 className="font-headline text-xl font-bold text-[#F9F6F0] mb-2">
              New Designs Arriving Soon
            </h3>
            <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/60 max-w-md mx-auto mb-6">
              Our master jewellers are hand-forging new models for this category. Contact us for custom orders.
            </p>
            <a
              href={`https://wa.me/91${whatsappNum}?text=Hello%20Latha%20Jewellery%20Works,%20I%20am%20inquiring%20about%20custom%20${encodeURIComponent(
                categoryTitle
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-accent-gold text-[#121212] px-6 py-3 rounded-lg text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all"
            >
              Request Custom Design
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {categoryModels.map((item) => {
              const addImages = Array.isArray(item.additional_images)
                ? item.additional_images
                : typeof item.additional_images === 'string'
                ? JSON.parse(item.additional_images || '[]')
                : [];
              const allImages = Array.from(new Set([item.primary_image, ...addImages].filter(Boolean)));
              const photoCount = allImages.length;

              return (
                <div
                  key={item.id}
                  onClick={() => setActiveModalItem(item)}
                  className="group bg-[#161616] border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-accent-gold/50 transition-all duration-300 flex flex-col cursor-pointer shadow-lg hover:shadow-2xl"
                >
                  {/* Image Container with Consistent Aspect Ratio */}
                  <div className="relative aspect-square overflow-hidden bg-[#0D0D0D] p-2">
                    <img
                      src={item.primary_image || '/assets/latha-logo.jpg'}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/assets/latha-logo.jpg';
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 rounded-lg"
                    />

                    {/* Multi-photo Counter Badge */}
                    {photoCount > 1 && (
                      <div className="absolute top-3 right-3 bg-[#121212]/80 backdrop-blur-md text-accent-gold text-[10px] font-bold px-2 py-0.5 rounded-full border border-accent-gold/30 flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined text-[12px]">photo_library</span>
                        <span>{photoCount} Views</span>
                      </div>
                    )}

                    {item.min_weight && (
                      <div className="absolute bottom-3 left-3 bg-[#121212]/85 backdrop-blur-md border border-accent-gold/40 text-accent-gold text-[10px] uppercase font-bold px-2.5 py-1 rounded-md">
                        Min {item.min_weight}
                      </div>
                    )}
                  </div>

                  {/* Model Information */}
                  <div className="p-3 sm:p-5 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-accent-gold font-semibold block mb-1">
                        {matchedCategory?.name || item.category_slug}
                      </span>
                      <h3 className="font-headline font-bold text-sm sm:text-base text-[#F9F6F0] group-hover:text-accent-gold transition-colors line-clamp-1 mb-1">
                        {item.name}
                      </h3>
                      <p className="font-body text-[11px] sm:text-xs text-[#F5F2EB]/60 line-clamp-2 mb-3 font-light">
                        {item.description}
                      </p>
                    </div>

                    <button className="w-full mt-2 py-2 sm:py-2.5 bg-[#1C1C1C] border border-accent-gold/30 text-accent-gold group-hover:bg-accent-gold group-hover:text-[#121212] rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-1.5">
                      <span>View 360° Photos</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {activeModalItem && (
        <JewelleryDetailModal item={activeModalItem} onClose={() => setActiveModalItem(null)} />
      )}
    </div>
  );
}
