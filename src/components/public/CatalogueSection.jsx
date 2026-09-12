import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import JewelleryDetailModal from './JewelleryDetailModal';

export default function CatalogueSection() {
  const { categories, jewellery_models, settings } = useData();
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [activeModalItem, setActiveModalItem] = useState(null);

  const whatsappNum = settings?.whatsapp || '9487056064';

  const filterableCategories = [
    { slug: 'all', name: 'All' },
    ...(categories || []).filter(c => c.active)
  ];

  const filteredModels = (jewellery_models || []).filter(item => {
    if (!item.active) return false;
    if (selectedFilter === 'all') return true;
    return item.category_slug.toLowerCase() === selectedFilter.toLowerCase();
  });

  return (
    <section id="catalogue" className="py-20 md:py-28 bg-[#181818]">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 block font-semibold">
              Exquisite Portfolio
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-[#F9F6F0]">
              The Jewellery Catalogue
            </h2>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mt-6 md:mt-0 overflow-x-auto pb-2 no-scrollbar">
            {filterableCategories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => setSelectedFilter(cat.slug)}
                className={`px-4 py-2 text-xs uppercase tracking-wider rounded-lg transition-all font-medium whitespace-nowrap ${
                  selectedFilter === cat.slug
                    ? 'bg-accent-gold text-[#121212] font-bold shadow-lg'
                    : 'bg-[#121212] text-[#F5F2EB]/80 hover:text-accent-gold border border-[#2A2A2A]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Catalogue Grid */}
        {filteredModels.length === 0 ? (
          <div className="text-center py-16 border border-[#2A2A2A] rounded-2xl bg-[#121212]">
            <span className="material-symbols-outlined text-accent-gold text-4xl mb-2">diamond</span>
            <p className="font-body text-sm text-[#F5F2EB]/70">No models found in this category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredModels.map((item) => {
              const waMsg = `Hello Latha Jewellery Works,%0A%0AI am interested in inquiring about your piece: *${encodeURIComponent(
                item.name
              )}*`;
              const waUrl = `https://wa.me/91${whatsappNum}?text=${waMsg}`;

              return (
                <div
                  key={item.id}
                  className="bg-[#121212] border border-[#2A2A2A] rounded-2xl overflow-hidden group hover:border-accent-gold/50 transition-all duration-300 flex flex-col justify-between"
                >
                  <div
                    onClick={() => setActiveModalItem(item)}
                    className="h-64 sm:h-72 bg-cover bg-center relative cursor-pointer overflow-hidden group"
                  >
                    <div
                      className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-500"
                      style={{ backgroundImage: `url('${item.primary_image}')` }}
                    />
                    <span className="absolute top-4 left-4 bg-[#121212]/80 backdrop-blur-md px-3 py-1 text-[11px] text-accent-gold uppercase tracking-wider border border-[#2A2A2A] rounded">
                      {item.category_slug}
                    </span>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-accent-gold text-[#121212] font-bold text-xs uppercase tracking-wider px-4 py-2 rounded-lg shadow-xl">
                        View Details
                      </span>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <h3
                        onClick={() => setActiveModalItem(item)}
                        className="font-headline text-xl font-bold text-[#F9F6F0] mb-1 cursor-pointer hover:text-accent-gold transition-colors"
                      >
                        {item.name}
                      </h3>
                      <p className="font-body text-xs text-[#F5F2EB]/60 mb-6 font-light">
                        Minimum Weight: <strong className="text-accent-gold">{item.min_weight || 'Custom'}</strong>
                      </p>
                    </div>

                    <div className="space-y-2">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#1C1B1A] border border-accent-gold/40 text-accent-gold py-3 rounded-lg text-xs uppercase tracking-wider hover:bg-accent-gold hover:text-[#121212] font-bold transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">chat</span>
                        Enquire on WhatsApp
                      </a>
                    </div>
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
    </section>
  );
}
