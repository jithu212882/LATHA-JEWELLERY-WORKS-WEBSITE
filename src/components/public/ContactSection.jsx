import React from 'react';
import { useData } from '../../context/DataContext';

export default function ContactSection() {
  const { settings } = useData();

  const businessName = settings?.business_name || 'Latha Jewellery Works';
  const phone = settings?.phone || '9487056064';
  const whatsapp = settings?.whatsapp || '9487056064';
  const email = settings?.email || 'lathajewelleryworks@gmail.com';
  const address = settings?.address || 'Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikkavu, Chathencode P.O.';
  const mapsUrl = settings?.google_maps_url || 'https://maps.google.com/?q=Chathencode+Nadaikkavu+Road+Near+Government+Primary+School+Chathencode';
  const workingHours = settings?.working_hours || 'Monday – Saturday: 9:30 AM – 8:00 PM\nSunday: By Appointment Only';

  return (
    <section id="contact" className="py-20 md:py-28 max-w-7xl mx-auto px-4 md:px-8 scroll-mt-28 md:scroll-mt-36">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 block font-semibold">
            Visit Our Atelier
          </span>
          <h2 className="font-headline text-3xl sm:text-4xl font-bold text-[#F9F6F0] mb-6">
            Contact & Location
          </h2>
          <p className="font-body text-sm sm:text-base text-[#F5F2EB]/80 mb-8 font-light leading-relaxed">
            We invite you to visit our studio in Chathencode to experience our pure gold craftsmanship firsthand or consult directly with our master jewellers.
          </p>

          <div className="space-y-6 mb-8">
            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-accent-gold text-[24px] mt-1 shrink-0">
                location_on
              </span>
              <div>
                <h4 className="font-headline font-bold text-[#F9F6F0] text-base sm:text-lg">Address</h4>
                <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 font-light leading-relaxed">
                  {address}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-accent-gold text-[24px] mt-1 shrink-0">
                call
              </span>
              <div>
                <h4 className="font-headline font-bold text-[#F9F6F0] text-base sm:text-lg">Phone / WhatsApp</h4>
                <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 font-light">
                  +91 {phone}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-accent-gold text-[24px] mt-1 shrink-0">
                mail
              </span>
              <div>
                <h4 className="font-headline font-bold text-[#F9F6F0] text-base sm:text-lg">Email</h4>
                <a
                  href={`mailto:${email}`}
                  className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 hover:text-accent-gold transition-colors font-light"
                >
                  {email}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <span className="material-symbols-outlined text-accent-gold text-[24px] mt-1 shrink-0">
                schedule
              </span>
              <div>
                <h4 className="font-headline font-bold text-[#F9F6F0] text-base sm:text-lg">Working Hours</h4>
                <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 font-light whitespace-pre-line">
                  {workingHours}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${phone}`}
              className="bg-accent-gold text-[#121212] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:bg-supporting-beige transition-all flex items-center gap-2 shadow-lg"
            >
              <span className="material-symbols-outlined text-[18px]">call</span> Call Now
            </a>
            <a
              href={`https://wa.me/91${whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="border border-[#2A2A2A] bg-[#181818] text-[#F9F6F0] px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:border-accent-gold transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span> WhatsApp
            </a>
            <a
              href={`mailto:${email}`}
              className="border border-[#2A2A2A] bg-[#181818] text-[#F9F6F0] px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:border-accent-gold transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">mail</span> Email Us
            </a>
            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="border border-[#2A2A2A] bg-[#181818] text-[#F9F6F0] px-6 py-3 rounded-xl text-xs uppercase tracking-wider hover:border-accent-gold transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">directions</span> Get Directions
            </a>
          </div>
        </div>

        {/* Map Card */}
        <div>
          <div
            className="w-full h-[360px] sm:h-[450px] bg-cover bg-center border border-[#2A2A2A] rounded-2xl relative overflow-hidden shadow-2xl"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC_ow3iuamIkB-Vbg-s6CsyOG8vCxt0XPs0qHq9FNUMc6ZMGRBX27bdrql1xSiBnAcxvzyCetwGKkqvB_NGWGJGbOUt1pXODfVFv5QAq-Dp03-h7ozE0YGxrbwG-ZNZnPu3-EgZ8ky8iGwl9ZHYc_dr1HUbntyxYaGC63o042eJym8fVnGsgndnJcir8bbJw7zygXGzZd_xvDjafJnJ8eGfOU3eENYmhpQA891YplWIn-K3CrDwN0Kv9A')"
            }}
          >
            <div className="absolute inset-0 bg-[#121212]/30"></div>
            <div className="absolute bottom-6 left-4 right-4 sm:left-6 sm:right-6 bg-[#121212]/95 backdrop-blur-md p-4 border border-[#2A2A2A] rounded-xl flex items-center justify-between shadow-2xl">
              <div>
                <h4 className="font-headline font-bold text-[#F9F6F0] text-sm sm:text-base">
                  {businessName}
                </h4>
                <p className="text-[11px] text-[#F5F2EB]/60">Chathencode, Nadaikkavu</p>
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-accent-gold text-[#121212] font-bold px-4 py-2 rounded-lg text-xs uppercase tracking-wider hover:bg-supporting-beige transition-colors"
              >
                Open Map
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
