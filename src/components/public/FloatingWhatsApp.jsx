import React from 'react';
import { useData } from '../../context/DataContext';

export default function FloatingWhatsApp() {
  const { settings } = useData();
  const whatsappNum = settings?.whatsapp || '9487056064';

  return (
    <a
      href={`https://wa.me/91${whatsappNum}`}
      target="_blank"
      rel="noreferrer"
      aria-label="Direct WhatsApp Chat"
      className="fixed bottom-5 right-4 sm:bottom-6 sm:right-6 z-[90] w-12 h-12 sm:w-14 sm:h-14 bg-accent-gold text-[#121212] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-300 border border-white/20 pb-[env(safe-area-inset-bottom)]"
    >
      <span className="material-symbols-outlined text-[24px] sm:text-[28px]">chat</span>
    </a>
  );
}
