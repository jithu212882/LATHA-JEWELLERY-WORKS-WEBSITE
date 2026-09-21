import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function BusinessSettingsManager() {
  const { settings, refreshData } = useData();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    business_name: settings?.business_name || 'Latha Jewellery Works',
    established_year: settings?.established_year || '1990',
    phone: settings?.phone || '9487056064',
    whatsapp: settings?.whatsapp || '9487056064',
    email: settings?.email || 'contact@lathajewelleryworks.com',
    address: settings?.address || 'Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikkavu, Chathencode P.O.',
    google_maps_url: settings?.google_maps_url || 'https://maps.google.com/?q=Chathencode+Nadaikkavu+Road+Near+Government+Primary+School+Chathencode',
    working_hours: settings?.working_hours || 'Monday – Saturday: 9:30 AM – 8:00 PM',
    sunday_hours: settings?.sunday_hours || 'Sunday: By Appointment Only',
    meta_title: settings?.meta_title || 'Latha Jewellery Works | Timeless Handcrafted Gold & Silver Masterpieces',
    meta_description: settings?.meta_description || 'Discover authentic handcrafted gold jewelry, antique chains, kolus, and temple designs at Latha Jewellery Works.',
    logo_primary: settings?.logo_primary || '',
    logo_mobile: settings?.logo_mobile || '',
    logo_footer: settings?.logo_footer || ''
  });

  const validateForm = () => {
    if (!formData.business_name.trim()) {
      return 'Business name is required.';
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      return 'Please enter a valid phone number (at least 8 digits).';
    }
    if (!formData.whatsapp.trim() || formData.whatsapp.trim().length < 8) {
      return 'Please enter a valid WhatsApp number (at least 8 digits).';
    }
    if (!formData.address.trim()) {
      return 'Full business address is required.';
    }
    if (formData.email.trim() && (!formData.email.includes('@') || !formData.email.includes('.'))) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await refreshData();
        setSuccessMsg('Contact details and business settings saved successfully! Changes are live across the website.');
      } else {
        const json = await res.json();
        setErrorMsg(json.error || 'Failed to save contact details.');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setErrorMsg('Network error while saving contact details.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            System Configuration
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Admin Contact Details & Brand Settings
          </h1>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px]">warning</span>
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Dedicated CONTACT DETAILS Card */}
        <div className="bg-[#181818] border border-accent-gold/30 p-6 sm:p-8 rounded-2xl space-y-6 shadow-xl">
          <div className="border-b border-[#2A2A2A] pb-4">
            <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase tracking-wide">
              CONTACT DETAILS
            </h3>
            <p className="font-body text-xs text-[#F5F2EB]/60 mt-1">
              Central source of truth for all business contact info. Updates automatically appear everywhere on the website.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Business Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm font-bold text-[#F9F6F0] focus:border-accent-gold outline-none"
                placeholder="Latha Jewellery Works"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Established Year
              </label>
              <input
                type="text"
                value={formData.established_year}
                onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                placeholder="1990"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Phone Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none font-mono"
                placeholder="+91 94870 56064"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                WhatsApp Number <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none font-mono"
                placeholder="+91 94870 56064"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                placeholder="contact@lathajewelleryworks.com"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Full Business Address <span className="text-rose-400">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl p-4 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none resize-none"
                placeholder="Full street address, landmark, area, P.O."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Google Maps / Location Link (URL)
              </label>
              <input
                type="url"
                value={formData.google_maps_url}
                onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                placeholder="https://maps.google.com/..."
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Working Hours (Monday – Saturday)
              </label>
              <input
                type="text"
                value={formData.working_hours}
                onChange={(e) => setFormData({ ...formData, working_hours: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                placeholder="Monday – Saturday: 9:30 AM – 8:00 PM"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Sunday / Appointment Information
              </label>
              <input
                type="text"
                value={formData.sunday_hours}
                onChange={(e) => setFormData({ ...formData, sunday_hours: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                placeholder="Sunday: By Appointment Only"
              />
            </div>
          </div>
        </div>

        {/* Brand Logos & Assets */}
        <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 rounded-2xl space-y-6 shadow-lg">
          <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
            Official Brand Logos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Primary Header Logo
              </label>
              <ImageUploader
                value={formData.logo_primary}
                onChange={(url) => setFormData({ ...formData, logo_primary: url })}
                label="Header Logo"
                sectionTag="Logos"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Mobile Drawer Logo
              </label>
              <ImageUploader
                value={formData.logo_mobile}
                onChange={(url) => setFormData({ ...formData, logo_mobile: url })}
                label="Mobile Logo"
                sectionTag="Logos"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                Footer Emblem Logo
              </label>
              <ImageUploader
                value={formData.logo_footer}
                onChange={(url) => setFormData({ ...formData, logo_footer: url })}
                label="Footer Logo"
                sectionTag="Logos"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-accent-gold text-[#121212] font-bold px-10 py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors shadow-xl disabled:opacity-50"
          >
            {saving ? 'Saving Contact Details...' : 'SAVE CONTACT DETAILS'}
          </button>
        </div>
      </form>
    </div>
  );
}
