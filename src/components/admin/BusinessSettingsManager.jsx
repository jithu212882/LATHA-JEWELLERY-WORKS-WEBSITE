import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function BusinessSettingsManager() {
  const { settings, refreshData } = useData();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [formData, setFormData] = useState({
    business_name: settings?.business_name || 'Latha Jewellery Works',
    established_year: settings?.established_year || '1990',
    phone: settings?.phone || '9487056064',
    whatsapp: settings?.whatsapp || '9487056064',
    email: settings?.email || 'contact@lathajewelleryworks.com',
    address: settings?.address || 'Chathencode to Nadaikkavu Road, Near Government Primary School, Nadaikkavu, Chathencode P.O.',
    google_maps_url: settings?.google_maps_url || 'https://maps.google.com/?q=Chathencode+Nadaikkavu+Road+Near+Government+Primary+School+Chathencode',
    working_hours: settings?.working_hours || 'Monday – Saturday: 9:30 AM – 8:00 PM\nSunday: By Appointment Only',
    meta_title: settings?.meta_title || 'Latha Jewellery Works | Timeless Handcrafted Gold & Silver Masterpieces',
    meta_description: settings?.meta_description || 'Discover authentic handcrafted gold jewelry, antique chains, kolus, and temple designs at Latha Jewellery Works.',
    logo_primary: settings?.logo_primary || '',
    logo_mobile: settings?.logo_mobile || '',
    logo_footer: settings?.logo_footer || ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

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
        setMsg('Business settings, logos & SEO meta tags updated!');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
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
            Business, Logo & SEO Settings
          </h1>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Business Profile */}
          <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 rounded-2xl space-y-4 shadow-lg">
            <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
              Atelier Profile & Contact
            </h3>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                Business Name
              </label>
              <input
                type="text"
                required
                value={formData.business_name}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  WhatsApp Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                Official Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                Physical Address
              </label>
              <textarea
                rows="2"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                Google Maps Location URL
              </label>
              <input
                type="text"
                value={formData.google_maps_url}
                onChange={(e) => setFormData({ ...formData, google_maps_url: e.target.value })}
                className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
              />
            </div>
          </div>

          {/* SEO Settings */}
          <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 rounded-2xl space-y-4 shadow-lg flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
                SEO & Meta Tags
              </h3>

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Meta Title
                </label>
                <input
                  type="text"
                  value={formData.meta_title}
                  onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Meta Description
                </label>
                <textarea
                  rows="4"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* LOGO MANAGEMENT */}
        <div className="bg-[#181818] border border-[#2A2A2A] p-6 sm:p-8 rounded-2xl space-y-6 shadow-lg">
          <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
            Logo & Brand Asset Management
          </h3>
          <p className="text-xs text-[#F5F2EB]/60">
            Upload custom high-resolution logos for desktop header, mobile drawer menu, and website footer.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ImageUploader
              label="Primary Desktop Logo"
              value={formData.logo_primary}
              onChange={(url) => setFormData({ ...formData, logo_primary: url })}
              sectionTag="Logo"
            />
            <ImageUploader
              label="Mobile Header / Drawer Logo"
              value={formData.logo_mobile}
              onChange={(url) => setFormData({ ...formData, logo_mobile: url })}
              sectionTag="Logo"
            />
            <ImageUploader
              label="Footer Brand Logo"
              value={formData.logo_footer}
              onChange={(url) => setFormData({ ...formData, logo_footer: url })}
              sectionTag="Logo"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent-gold text-[#121212] font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving Settings...' : 'Save All Business & Logo Settings'}
        </button>
      </form>
    </div>
  );
}
