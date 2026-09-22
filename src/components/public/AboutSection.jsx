import React from 'react';
import { useData } from '../../context/DataContext';

export default function AboutSection() {
  const { content } = useData();

  const eyebrow = content?.about_eyebrow || 'Legacy of Excellence';
  const title = content?.about_title || 'Over 35 Years of Trusted Craftsmanship';
  const description = content?.about_description || 'For over 35 years, Latha Jewellery Works has stood as a beacon of purity and peerless artistry in Chathencode. Every piece that leaves our bench is a testament to generational techniques, unyielding integrity, and an uncompromising dedication to bespoke design.';
  const years = content?.about_years || '35+';
  const purity = content?.about_purity || '100%';
  const image = content?.about_image || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCCMMbqxjOFz1vdZSsKAC3MH8y3AApWLkwVUCI0QWAbbpe6WeLz0kP1d5n-7jpZ42Up_fIqLr_pwxIZCZvQAKh-v1HKvnBTlcbCdZLnSp9oYj0JVRPumTSMc8uiqsSlLho6htC7nRabJhBaXScQ1rZ302qLFRpfIL9jmdB_BOb5FtALnfDh5aUHDwTzPOzX4r-gHSO73GRWy-8hpQD3N1wvVWRg4TRaNngoC_Tjw3IeQxjyvymphe20nA';

  return (
    <section id="about" className="pt-8 sm:pt-16 pb-14 sm:pb-20 md:pb-28 max-w-7xl mx-auto px-4 md:px-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
        {/* Left Column: Image Card */}
        <div className="relative">
          <div className="absolute -top-3 -left-3 w-full h-full border border-accent-gold/30 z-0 hidden sm:block rounded-xl"></div>
          <div className="relative z-10 bg-[#1C1B1A] p-2 border border-[#2A2A2A] rounded-xl overflow-hidden shadow-2xl">
            <div
              className="h-[260px] sm:h-[420px] bg-cover bg-center rounded-lg relative"
              style={{ backgroundImage: `url('${image}')` }}
            >
              {/* Badge positioned bottom-left on mobile, bottom-right on desktop for 0 collision with floating chat button */}
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-auto sm:right-4 bg-[#121212]/95 backdrop-blur-md border border-accent-gold/40 rounded-xl p-2 flex items-center gap-2.5 shadow-2xl z-20 max-w-[calc(100%-1.5rem)]">
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg overflow-hidden border border-accent-gold/40 p-0.5 bg-[#121212] shrink-0">
                  <img
                    src="/assets/latha-jewellery-works-logo.jpeg"
                    alt="Official Hallmark Seal"
                    className="w-full h-full object-cover rounded-md"
                  />
                </div>
                <div className="flex flex-col text-left pr-1 leading-tight">
                  <span className="text-[9px] sm:text-[10px] font-bold text-accent-gold uppercase tracking-wider whitespace-nowrap">Official Hallmark</span>
                  <span className="text-[8px] sm:text-[9px] text-[#F5F2EB]/60 uppercase tracking-widest mt-0.5">Est. 1990</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Copy & Metrics */}
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 font-semibold">
            {eyebrow}
          </span>
          <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl font-bold text-[#F9F6F0] mb-4 sm:mb-6 leading-tight">
            {title}
          </h2>
          <p className="font-body text-xs sm:text-base text-[#F5F2EB]/80 mb-6 sm:mb-8 font-light leading-relaxed">
            {description}
          </p>

          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-[#2A2A2A]">
            <div>
              <span className="font-headline text-2xl sm:text-4xl font-bold text-accent-gold block">
                {years}
              </span>
              <span className="text-[11px] sm:text-xs uppercase text-[#F5F2EB]/60 tracking-wider">
                Years of Experience
              </span>
            </div>
            <div>
              <span className="font-headline text-2xl sm:text-4xl font-bold text-accent-gold block">
                {purity}
              </span>
              <span className="text-[11px] sm:text-xs uppercase text-[#F5F2EB]/60 tracking-wider">
                Certified Purity
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
