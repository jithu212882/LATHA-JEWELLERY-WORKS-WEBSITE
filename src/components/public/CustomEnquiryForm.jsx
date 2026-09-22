import React, { useState } from 'react';
import { useData } from '../../context/DataContext';

export default function CustomEnquiryForm() {
  const { settings } = useData();
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    jewellery_type: 'Necklace / Haram',
    requirements: ''
  });

  const whatsappNum = settings?.whatsapp || '9487056064';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 1. Submit enquiry to persistent database
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const json = await res.json();
      
      // 2. Open WhatsApp pre-filled link
      if (json.whatsappUrl) {
        window.open(json.whatsappUrl, '_blank');
      } else {
        const waMsg = `Hello Latha Jewellery Works,%0A%0A*New Custom Jewellery Enquiry*%0A- *Name:* ${encodeURIComponent(formData.name)}%0A- *Mobile:* ${encodeURIComponent(formData.mobile)}%0A- *Type:* ${encodeURIComponent(formData.jewellery_type)}%0A- *Details:* ${encodeURIComponent(formData.requirements)}`;
        window.open(`https://wa.me/91${whatsappNum}?text=${waMsg}`, '_blank');
      }

      // Reset form
      setFormData({
        name: '',
        mobile: '',
        email: '',
        jewellery_type: 'Necklace / Haram',
        requirements: ''
      });
    } catch (err) {
      console.error('Error submitting enquiry:', err);
      // Fallback direct WhatsApp redirect
      const waMsg = `Hello Latha Jewellery Works,%0A%0A*New Custom Jewellery Enquiry*%0A- *Name:* ${encodeURIComponent(formData.name)}%0A- *Mobile:* ${encodeURIComponent(formData.mobile)}%0A- *Type:* ${encodeURIComponent(formData.jewellery_type)}`;
      window.open(`https://wa.me/91${whatsappNum}?text=${waMsg}`, '_blank');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="custom-enquiry" className="py-14 sm:py-20 md:py-28 bg-[#181818] scroll-mt-28 md:scroll-mt-36 border-y border-[#2A2A2A]">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <div className="bg-[#121212] border border-[#2A2A2A] p-6 sm:p-10 lg:p-12 rounded-2xl shadow-2xl">
          <div className="text-center mb-6 sm:mb-10">
            <span className="text-xs uppercase tracking-[0.2em] text-accent-gold mb-3 block font-semibold">
              Bespoke Atelier
            </span>
            <h2 className="font-headline text-3xl sm:text-4xl font-bold text-[#F9F6F0]">
              Custom Jewellery Enquiry
            </h2>
            <p className="font-body text-xs sm:text-sm text-[#F5F2EB]/70 mt-3 max-w-xl mx-auto font-light leading-relaxed">
              Fill out your details below. Your enquiry will be saved in our atelier database and instantly formatted for direct WhatsApp consultation with our master craftsman.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-2 font-medium">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl p-3.5 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-2 font-medium">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Enter mobile number"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl p-3.5 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-2 font-medium">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl p-3.5 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-2 font-medium">
                  Jewellery Type
                </label>
                <select
                  value={formData.jewellery_type}
                  onChange={(e) => setFormData({ ...formData, jewellery_type: e.target.value })}
                  className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl p-3.5 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                >
                  <option value="Necklace / Haram">Necklace / Haram</option>
                  <option value="Chain">Chain</option>
                  <option value="Bangles / Bracelet">Bangles / Bracelet</option>
                  <option value="Ring">Ring</option>
                  <option value="Earrings / Kammal">Earrings / Kammal</option>
                  <option value="Kolus / Anklet">Kolus / Anklet</option>
                  <option value="Custom Design">Custom Design</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#F5F2EB]/70 mb-2 font-medium">
                Description / Specifications
              </label>
              <textarea
                rows="4"
                placeholder="Describe your design specifications, approximate weight in grams, or special customization requirements..."
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl p-3.5 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-accent-gold text-[#121212] font-bold py-4 rounded-xl text-xs sm:text-sm uppercase tracking-widest hover:bg-supporting-beige transition-all shadow-xl disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[20px]">chat</span>
              {submitting ? 'Processing Enquiry...' : 'Send Enquiry on WhatsApp'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
