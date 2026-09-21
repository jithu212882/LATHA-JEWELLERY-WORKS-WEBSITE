import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

export default function JewelleryDetailModal({ item, onClose }) {
  const { settings } = useData();
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(null);
  const [touchEndX, setTouchEndX] = useState(null);

  useEffect(() => {
    if (item) {
      setActiveIndex(0);
    }
  }, [item]);

  if (!item) return null;

  const whatsappNum = settings?.whatsapp || '9487056064';

  const additionalImages = Array.isArray(item.additional_images)
    ? item.additional_images
    : typeof item.additional_images === 'string'
    ? JSON.parse(item.additional_images || '[]')
    : [];

  const rawImages = [item.primary_image, ...additionalImages].filter(Boolean);
  // Deduplicate images while preserving order
  const allImages = Array.from(new Set(rawImages));
  if (allImages.length === 0) {
    allImages.push('/assets/latha-logo.jpg');
  }

  const currentImage = allImages[activeIndex] || allImages[0];

  const handleNext = () => {
    if (allImages.length > 1) {
      setActiveIndex((prev) => (prev + 1) % allImages.length);
    }
  };

  const handlePrev = () => {
    if (allImages.length > 1) {
      setActiveIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    }
  };

  const handleTouchStart = (e) => {
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchEndX(null);
  };

  const handleTouchMove = (e) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    const minSwipeDistance = 35;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const whatsappMessage = `Hello Latha Jewellery Works,%0A%0AI am interested in inquiring about your piece: *${encodeURIComponent(
    item.name
  )}*%0A- *Category:* ${encodeURIComponent(item.category_slug)}%0A- *Min Weight:* ${encodeURIComponent(
    item.min_weight || 'Custom'
  )}`;

  const whatsappUrl = `https://wa.me/91${whatsappNum}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-[#181818] border border-[#2A2A2A] max-w-3xl w-full rounded-2xl p-5 sm:p-8 relative shadow-2xl my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white bg-[#121212]/80 hover:bg-[#121212] p-2 rounded-full border border-[#2A2A2A] transition-colors z-20"
          aria-label="Close detail modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
          {/* Gallery Column */}
          <div className="space-y-3">
            <div
              className="h-72 sm:h-80 bg-[#121212] rounded-xl border border-[#2A2A2A] overflow-hidden relative shadow-lg group select-none touch-pan-y"
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="w-full h-full bg-contain bg-no-repeat bg-center transition-all duration-300"
                style={{ backgroundImage: `url('${currentImage}')` }}
              />

              {/* Category Badge */}
              <span className="absolute top-3 left-3 bg-[#121212]/90 backdrop-blur-md px-3 py-1 text-[11px] text-accent-gold uppercase tracking-wider border border-accent-gold/30 rounded font-bold shadow">
                {item.category_slug}
              </span>

              {/* Photo Counter Badge */}
              {allImages.length > 1 && (
                <span className="absolute top-3 right-12 bg-black/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/20 shadow">
                  {activeIndex + 1} / {allImages.length}
                </span>
              )}

              {/* Next/Prev Navigation Arrows (Desktop & Touch) */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-accent-gold flex items-center justify-center border border-accent-gold/30 transition-all opacity-80 group-hover:opacity-100 z-10"
                    aria-label="Previous photo"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/70 hover:bg-black text-accent-gold flex items-center justify-center border border-accent-gold/30 transition-all opacity-80 group-hover:opacity-100 z-10"
                    aria-label="Next photo"
                  >
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Carousel & Touch Dots */}
            {allImages.length > 1 && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 max-w-full">
                  {allImages.map((imgUrl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-[#0D0D0D] p-0.5 ${
                        idx === activeIndex
                          ? 'border-accent-gold scale-105 shadow-md'
                          : 'border-[#2A2A2A] opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover rounded"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/assets/latha-logo.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Mobile Swipe Instructions */}
                <div className="text-center text-[10px] text-[#F5F2EB]/50 uppercase tracking-widest font-sans flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">swipe</span>
                  <span>Swipe or tap thumbnails to view 360° angles</span>
                </div>
              </div>
            )}
          </div>

          {/* Product Info Column */}
          <div className="flex flex-col justify-between h-full space-y-5">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-accent-gold font-bold block mb-1">
                Handcrafted Gold Masterpiece
              </span>
              <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#F9F6F0] mb-3">
                {item.name}
              </h2>

              <div className="flex items-center gap-3 mb-4">
                <span className="bg-[#121212] border border-accent-gold/40 text-accent-gold text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  22K Pure Gold
                </span>
                {item.min_weight && (
                  <span className="bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB]/80 text-xs font-mono px-3 py-1 rounded-full">
                    Min {item.min_weight}
                  </span>
                )}
              </div>

              <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/80 leading-relaxed font-light mb-6">
                {item.description ||
                  'Authentic handcrafted 22k gold jewellery piece forged using traditional South Indian goldsmithing methods at Latha Jewellery Works.'}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-4 border-t border-[#2A2A2A]">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full py-3.5 bg-accent-gold text-[#121212] font-bold text-xs uppercase tracking-widest rounded-xl flex items-center justify-center gap-2 shadow-xl hover:bg-supporting-beige transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">chat</span>
                <span>Inquire on WhatsApp</span>
              </a>

              <button
                onClick={onClose}
                className="w-full py-3 bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB]/70 font-semibold text-xs uppercase tracking-widest rounded-xl hover:text-white hover:bg-[#242424] transition-all"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
