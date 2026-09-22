import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import JewelleryDetailModal from './JewelleryDetailModal';
import SEO from '../common/SEO';
import { getCategoryRoute, matchCategoryByRouteSlug, navigateTo, closeCurrentPageToHome } from '../../utils/navigation';

export default function CategoryCataloguePage({ categorySlug, initialProductId, initialSearchQuery = '' }) {
  const { categories, jewellery_models, settings } = useData();
  const [activeModalItem, setActiveModalItem] = useState(null);
  
  // Read search query from URL parameter (?search=...) or initial props
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('search') || initialSearchQuery || '';
    } catch (e) {
      return initialSearchQuery || '';
    }
  });

  // Synchronize state with URL search param on popstate / route changes
  useEffect(() => {
    const handleUrlSearch = () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryFromUrl = urlParams.get('search') || '';
        setSearchQuery(queryFromUrl);
      } catch (e) {}
    };
    window.addEventListener('popstate', handleUrlSearch);
    window.addEventListener('locationchange', handleUrlSearch);
    return () => {
      window.removeEventListener('popstate', handleUrlSearch);
      window.removeEventListener('locationchange', handleUrlSearch);
    };
  }, []);

  const whatsappNum = settings?.whatsapp || '9487056064';
  const matchedCategory = matchCategoryByRouteSlug(categorySlug, categories);
  const routeNorm = (categorySlug || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  let categoryTitle = 'All Masterpiece Collections';
  if (routeNorm === 'chainsnecklaces' || routeNorm === 'chain' || routeNorm === 'chains' || routeNorm === 'necklaces') {
    categoryTitle = 'Chains & Necklaces Collection';
  } else if (routeNorm === 'kolus' || routeNorm === 'kolu' || routeNorm === 'anklet' || routeNorm === 'anklets') {
    categoryTitle = 'Kolus (Anklets) Collection';
  } else if (routeNorm === 'kammal' || routeNorm === 'earring' || routeNorm === 'earrings') {
    categoryTitle = 'Kammal (Earrings) Collection';
  } else if (routeNorm === 'banglesbracelets' || routeNorm === 'bangles' || routeNorm === 'bangle' || routeNorm === 'bracelets') {
    categoryTitle = 'Bangles & Bracelets Collection';
  } else if (routeNorm === 'rings' || routeNorm === 'ring') {
    categoryTitle = 'Rings Collection';
  } else if (categorySlug && categorySlug !== 'all') {
    categoryTitle = matchedCategory?.name || `${categorySlug.replace(/-/g, ' ').toUpperCase()} Collection`;
  }

  const categoryDescription =
    categorySlug === 'all' || !categorySlug
      ? 'Explore our complete heritage catalogue of handcrafted 22k gold and silver jewellery masterpieces.'
      : matchedCategory?.description ||
        `Handcrafted pure 22k gold ${categoryTitle.toLowerCase()} forged by master artisans in Chathencode.`;

  // Handle initialProductId if route is /product/:productId
  useEffect(() => {
    if (initialProductId && jewellery_models && jewellery_models.length > 0) {
      const found = jewellery_models.find(
        (m) => String(m.id) === String(initialProductId) || m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === initialProductId
      );
      if (found) {
        setActiveModalItem(found);
      }
    }
  }, [initialProductId, jewellery_models]);

  // Filter models for this specific route AND search query by name/code
  const categoryModels = (jewellery_models || []).filter((item) => {
    if (!item.active) return false;

    // 1. Category Filter
    let matchesCategory = true;
    if (categorySlug && categorySlug !== 'all') {
      if (matchedCategory) {
        matchesCategory = item.category_slug.toLowerCase() === matchedCategory.slug.toLowerCase();
      } else {
        const itemSlugNorm = (item.category_slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
        matchesCategory = itemSlugNorm === routeNorm;
      }
    }

    if (!matchesCategory) return false;

    // 2. Name / Description / Code Search Filter
    if (!searchQuery || !searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase().trim();
    const nameMatch = (item.name || '').toLowerCase().includes(q);
    const descMatch = (item.description || '').toLowerCase().includes(q);
    const catMatch = (item.category_slug || '').toLowerCase().includes(q);
    const codeMatch = (item.model_code || '').toLowerCase().includes(q);

    return nameMatch || descMatch || catMatch || codeMatch;
  });

  // Required Category Navigation Buttons
  const filterableCategories = [
    { slug: 'all', route: '/collections', name: 'ALL' },
    { slug: 'chains-necklaces', route: '/collections/chains-necklaces', name: 'CHAINS & NECKLACES' },
    { slug: 'kolus', route: '/collections/kolus', name: 'KOLUS (ANKLETS)' },
    { slug: 'kammal', route: '/collections/kammal', name: 'KAMMAL (EARRINGS)' },
    { slug: 'bangles-bracelets', route: '/collections/bangles-bracelets', name: 'BANGLES & BRACELETS' },
    { slug: 'rings', route: '/collections/rings', name: 'RINGS' }
  ];

  // Append any extra active categories created in admin dynamically
  (categories || []).filter((c) => c.active).forEach((c) => {
    const route = getCategoryRoute(c.slug);
    if (!filterableCategories.some((fc) => fc.route === route)) {
      filterableCategories.push({ slug: c.slug, route, name: c.name.toUpperCase() });
    }
  });

  const currentCanonicalRoute = getCategoryRoute(categorySlug);

  return (
    <div className="min-h-screen bg-[#121212] pt-24 sm:pt-28 pb-20">
      {/* Dynamic SEO Meta & JSON-LD Structured Data Injection */}
      <SEO
        title={`${categoryTitle} | Latha Jewellery Works`}
        description={categoryDescription}
        canonicalUrl={`https://latha-jewellery-works.vercel.app${currentCanonicalRoute}`}
        breadcrumbs={[
          { name: 'Home', url: 'https://latha-jewellery-works.vercel.app/' },
          { name: 'Collections', url: 'https://latha-jewellery-works.vercel.app/collections' },
          { name: categoryTitle, url: `https://latha-jewellery-works.vercel.app${currentCanonicalRoute}` }
        ]}
        productSchema={activeModalItem ? {
          name: activeModalItem.name,
          description: activeModalItem.description,
          image: activeModalItem.primary_image
        } : null}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 md:px-8">
        {/* Top Navigation & Breadcrumb */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#2A2A2A]">
          <button
            onClick={(e) => closeCurrentPageToHome(e)}
            className="inline-flex items-center gap-2 text-accent-gold hover:text-[#121212] hover:bg-accent-gold transition-all text-xs sm:text-sm font-semibold uppercase tracking-wider bg-[#181818] border border-accent-gold/50 px-3.5 py-2 rounded-lg shadow-md active:scale-95"
            title="Close page and return to home"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
            <span>Close Page</span>
          </button>

          <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[#F5F2EB]/50 uppercase tracking-widest font-sans">
            <span>Catalogue</span>
            <span>/</span>
            <span className="text-accent-gold font-medium truncate max-w-[120px] sm:max-w-none">{categoryTitle}</span>
          </div>
        </div>

        {/* Dedicated Category Header & Search Input */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center sm:text-left flex-1">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.22em] text-accent-gold mb-2 block font-semibold">
              Dedicated Catalogue Page
            </span>
            <h1 className="font-headline text-2xl sm:text-4xl md:text-5xl font-bold text-[#F9F6F0] mb-3">
              {categoryTitle}
            </h1>
            <p className="font-body text-xs sm:text-base text-[#F5F2EB]/75 font-light max-w-3xl leading-relaxed">
              {categoryDescription}
            </p>
          </div>

          {/* Model Name Search Input */}
          <div className="relative w-full md:w-80 shrink-0">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-accent-gold text-lg pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search model by name (e.g. Palakka, Haram, Jimki)..."
              className="w-full bg-[#181818] border border-[#2A2A2A] focus:border-accent-gold rounded-xl py-2.5 pl-10 pr-10 text-xs sm:text-sm text-[#F9F6F0] outline-none transition-colors shadow-inner placeholder-[#F5F2EB]/40"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#F5F2EB]/50 hover:text-accent-gold transition-colors p-1"
                title="Clear search"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Category Switcher Bar */}
        <div className="flex flex-nowrap items-center gap-2 overflow-x-auto no-scrollbar pb-3 mb-8 -mx-3 px-3 sm:mx-0 sm:px-0 border-b border-[#2A2A2A]/60">
          {filterableCategories.map((cat) => {
            const isCurrent =
              cat.route === currentCanonicalRoute ||
              (matchedCategory && getCategoryRoute(matchedCategory.slug) === cat.route);

            return (
              <a
                key={cat.route}
                href={cat.route}
                onClick={(e) => navigateTo(cat.route, e)}
                className={`px-3.5 sm:px-4 py-2 text-[11px] sm:text-xs uppercase tracking-wider rounded-lg transition-all font-medium whitespace-nowrap shrink-0 ${
                  isCurrent
                    ? 'bg-accent-gold text-[#121212] font-bold shadow-lg scale-[1.02]'
                    : 'bg-[#181818] text-[#F5F2EB]/80 hover:text-accent-gold border border-[#2A2A2A] hover:border-accent-gold/40'
                }`}
              >
                {cat.name}
              </a>
            );
          })}
        </div>

        {/* Active Search Filter Banner */}
        {searchQuery && (
          <div className="flex items-center justify-between bg-[#181818] border border-accent-gold/40 rounded-xl px-4 py-2.5 mb-8 text-xs text-[#F5F2EB]/90 shadow-md">
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-gold text-base">filter_alt</span>
              <span>
                Found <strong className="text-accent-gold font-bold">{categoryModels.length}</strong> design{categoryModels.length === 1 ? '' : 's'} matching "<strong className="text-accent-gold font-bold">{searchQuery}</strong>"
              </span>
            </span>
            <button
              onClick={() => setSearchQuery('')}
              className="text-accent-gold hover:underline font-semibold text-xs uppercase tracking-wider ml-4 shrink-0"
            >
              Clear Search ×
            </button>
          </div>
        )}

        {/* Scalable Product Grid: 2 Columns on Mobile (320px+), 3 on Tablet, 4 on Desktop */}
        {categoryModels.length === 0 ? (
          <div className="text-center py-16 border border-[#2A2A2A] rounded-2xl bg-[#181818] px-4 my-8">
            <span className="material-symbols-outlined text-accent-gold text-4xl mb-3 block">search_off</span>
            <h4 className="font-headline text-lg sm:text-xl font-bold text-[#F9F6F0] mb-2">
              No Jewellery Models Found
            </h4>
            <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/60 max-w-md mx-auto mb-6">
              {searchQuery
                ? `No models matched "${searchQuery}". Try searching for popular terms like "Haram", "Chain", "Palakka", "Jimki", "Bangle", or "Ring".`
                : 'We are adding new handcrafted designs to this dedicated collection.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 bg-accent-gold text-[#121212] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-all"
              >
                Reset Search Filter
              </button>
            ) : (
              <a
                href="#custom-enquiry"
                className="inline-flex items-center gap-2 bg-accent-gold text-[#121212] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-all"
              >
                Request Custom Design
              </a>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {categoryModels.map((item) => {
              const waMsg = `Hello Latha Jewellery Works,%0A%0AI am interested in inquiring about your piece: *${encodeURIComponent(
                item.name
              )}*`;
              const waUrl = `https://wa.me/91${whatsappNum}?text=${waMsg}`;

              const categoryObj = categories?.find(
                (c) => c.slug.toLowerCase() === item.category_slug.toLowerCase()
              );
              const categoryTag = categoryObj?.name || item.category_slug;

              return (
                <div
                  key={item.id}
                  className="bg-[#181818] border border-[#2A2A2A] rounded-xl sm:rounded-2xl overflow-hidden group hover:border-accent-gold/50 transition-all duration-300 flex flex-col justify-between shadow-lg"
                >
                  {/* Product Image Box with Aspect Ratio Guard */}
                  <div
                    onClick={() => setActiveModalItem(item)}
                    className="relative aspect-square w-full bg-[#121212] cursor-pointer overflow-hidden group"
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

                  {/* Card Content & Compact WhatsApp Action */}
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
                      className="w-full flex items-center justify-center gap-1 sm:gap-1.5 bg-[#121212] border border-accent-gold/40 text-accent-gold py-1.5 sm:py-2 px-2 rounded-lg text-[10px] sm:text-xs uppercase tracking-wider hover:bg-accent-gold hover:text-[#121212] font-bold transition-all mt-auto active:scale-95"
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

      {/* Item Detail Modal */}
      {activeModalItem && (
        <JewelleryDetailModal
          item={activeModalItem}
          onClose={() => setActiveModalItem(null)}
        />
      )}
    </div>
  );
}
