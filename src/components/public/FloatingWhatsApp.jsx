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
      className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-accent-gold text-[#121212] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-transform duration-300 border border-white/20"
    >
      <span className="material-symbols-outlined text-[28px]">chat</span>
    </a>
  );
}
