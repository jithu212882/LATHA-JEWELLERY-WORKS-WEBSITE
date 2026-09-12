import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';

export default function JewelleryDetailModal({ item, onClose }) {
  const { settings } = useData();
  const [activeImage, setActiveImage] = useState(item?.primary_image || '');

  useEffect(() => {
    if (item) {
      setActiveImage(item.primary_image);
    }
  }, [item]);

  if (!item) return null;

  const whatsappNum = settings?.whatsapp || '9487056064';

  const additionalImages = Array.isArray(item.additional_images)
    ? item.additional_images
    : typeof item.additional_images === 'string'
    ? JSON.parse(item.additional_images || '[]')
    : [];

  const allImages = [item.primary_image, ...additionalImages].filter(Boolean);

  const whatsappMessage = `Hello Latha Jewellery Works,%0A%0AI am interested in inquiring about your piece: *${encodeURIComponent(
    item.name
  )}*%0A- *Category:* ${encodeURIComponent(item.category_slug)}%0A- *Min Weight:* ${encodeURIComponent(
    item.min_weight || 'Custom'
  )}`;

  const whatsappUrl = `https://wa.me/91${whatsappNum}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 z-[110] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#181818] border border-[#2A2A2A] max-w-3xl w-full rounded-2xl p-6 md:p-8 relative shadow-2xl my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white bg-[#121212] p-2 rounded-full border border-[#2A2A2A] transition-colors"
          aria-label="Close detail modal"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* Gallery Column */}
          <div className="space-y-4">
            <div className="h-72 sm:h-80 bg-cover bg-center rounded-xl border border-[#2A2A2A] overflow-hidden relative shadow-lg">
              <div
                className="w-full h-full bg-cover bg-center transition-all duration-300"
                style={{ backgroundImage: `url('${activeImage}')` }}
              />
              <span className="absolute top-3 left-3 bg-[#121212]/90 backdrop-blur-md px-3 py-1 text-[11px] text-accent-gold uppercase tracking-wider border border-[#2A2A2A] rounded">
                {item.category_slug}
              </span>
            </div>

            {/* Thumbnail Carousel */}
            {allImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {allImages.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`w-16 h-16 rounded-lg bg-cover bg-center border shrink-0 transition-all ${
                      activeImage === imgUrl ? 'border-accent-gold scale-105' : 'border-[#2A2A2A] opacity-60 hover:opacity-100'
                    }`}
                    style={{ backgroundImage: `url('${imgUrl}')` }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Details Column */}
          <div className="flex flex-col h-full justify-between space-y-6">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] text-accent-gold block font-semibold mb-2">
                Atelier Masterpiece
              </span>
              <h3 className="font-headline text-2xl sm:text-3xl font-bold text-[#F9F6F0] mb-3 leading-tight">
                {item.name}
              </h3>
              <div className="flex items-center gap-4 text-xs text-[#F5F2EB]/70 mb-4 pb-4 border-b border-[#2A2A2A]">
                <span>Category: <strong className="text-accent-gold uppercase">{item.category_slug}</strong></span>
                <span>Min Weight: <strong className="text-accent-gold">{item.min_weight || 'On Request'}</strong></span>
              </div>
              <p className="font-body text-sm text-[#F5F2EB]/80 font-light leading-relaxed">
                {item.description || 'Handcrafted using traditional South Indian goldsmithing techniques with 100% certified karat purity.'}
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-[#2A2A2A] space-y-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-accent-gold text-[#121212] font-bold py-4 rounded-xl text-xs sm:text-sm uppercase tracking-widest hover:bg-supporting-beige transition-all shadow-xl"
              >
                <span className="material-symbols-outlined text-[18px]">chat</span>
                Enquire on WhatsApp
              </a>
              <p className="text-[11px] text-[#F5F2EB]/50 text-center">
                Instant response from master craftsmen • Chathencode Atelier
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
