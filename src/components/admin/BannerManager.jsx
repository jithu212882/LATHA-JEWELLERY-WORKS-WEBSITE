import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function BannerManager() {
  const { banners, refreshData } = useData();
  const { token } = useAuth();
  const [editingBanner, setEditingBanner] = useState(null); // null, 'new', or banner object
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    desktop_image: '',
    mobile_image: '',
    cta_label: 'Enquire Now',
    cta_link: '#catalogue',
    active: 1
  });

  const openNewModal = () => {
    setFormData({
      title: '',
      subtitle: '',
      desktop_image: '',
      mobile_image: '',
      cta_label: 'Enquire Now',
      cta_link: '#catalogue',
      active: 1
    });
    setEditingBanner('new');
  };

  const openEditModal = (banner) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || '',
      desktop_image: banner.desktop_image || '',
      mobile_image: banner.mobile_image || banner.desktop_image || '',
      cta_label: banner.cta_label || 'Enquire Now',
      cta_link: banner.cta_link || '#catalogue',
      active: banner.active ? 1 : 0
    });
    setEditingBanner(banner);
  };

  const toggleActive = async (banner) => {
    try {
      const res = await fetch(`/api/banners/${banner.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: banner.active ? 0 : 1 })
      });
      if (res.ok) await refreshData();
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner?')) return;
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) await refreshData();
    } catch (err) {
      console.error('Delete banner error:', err);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const url = editingBanner === 'new' ? '/api/banners' : `/api/banners/${editingBanner.id}`;
    const method = editingBanner === 'new' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await refreshData();
        setEditingBanner(null);
      }
    } catch (err) {
      console.error('Error saving banner:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Visual Presentation
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Banner & Hero Management
          </h1>
        </div>
        <button
          onClick={openNewModal}
          className="bg-accent-gold text-[#121212] font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-supporting-beige transition-colors"
        >
          + Add New Banner
        </button>
      </div>

      <div className="space-y-6">
        {(banners || []).map((banner) => (
          <div
            key={banner.id}
            className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl flex flex-col md:flex-row gap-6 items-center shadow-lg"
          >
            <div
              className="w-full md:w-64 h-40 bg-cover bg-center rounded-xl border border-[#2A2A2A] shrink-0"
              style={{ backgroundImage: `url('${banner.desktop_image}')` }}
            />
            <div className="flex-1 space-y-2 text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-between gap-2">
                <h3 className="font-headline text-xl font-bold text-accent-gold">{banner.title}</h3>
                <button
                  onClick={() => toggleActive(banner)}
                  className={`px-2.5 py-0.5 text-[10px] rounded uppercase font-bold transition-colors ${
                    banner.active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {banner.active ? 'Live' : 'Disabled'}
                </button>
              </div>
              <p className="text-xs text-[#F5F2EB]/80">{banner.subtitle}</p>
              <p className="text-[11px] text-[#F5F2EB]/50">
                CTA: <strong className="text-accent-gold">{banner.cta_label}</strong> ({banner.cta_link})
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openEditModal(banner)}
                className="px-4 py-2.5 bg-accent-gold text-[#121212] font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-supporting-beige transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(banner.id)}
                className="px-3 py-2.5 bg-red-500/10 border border-red-500/30 text-red-400 font-bold rounded-lg text-xs uppercase hover:bg-red-600 hover:text-white transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingBanner && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1B1A] border border-[#2A2A2A] max-w-lg w-full p-6 rounded-2xl relative shadow-2xl">
            <button
              onClick={() => setEditingBanner(null)}
              className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline text-2xl font-bold text-accent-gold mb-4 uppercase">
              {editingBanner === 'new' ? 'Add Hero Banner' : 'Edit Hero Banner'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Banner Heading *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Subheading
                </label>
                <textarea
                  rows="2"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                ></textarea>
              </div>

              <ImageUploader
                label="Desktop Banner Image *"
                value={formData.desktop_image}
                onChange={(url) => setFormData({ ...formData, desktop_image: url, mobile_image: formData.mobile_image || url })}
                sectionTag="Banner"
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={formData.cta_label}
                    onChange={(e) => setFormData({ ...formData, cta_label: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                    CTA Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.cta_link}
                    onChange={(e) => setFormData({ ...formData, cta_link: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="banner-active"
                  checked={!!formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })}
                  className="accent-accent-gold w-4 h-4"
                />
                <label htmlFor="banner-active" className="text-xs text-[#F5F2EB]/90 cursor-pointer">
                  Publish Banner as Active
                </label>
              </div>

              <div className="pt-4 border-t border-[#2A2A2A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB] rounded-lg text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-accent-gold text-[#121212] font-bold rounded-lg text-xs uppercase tracking-wider"
                >
                  {saving ? 'Saving...' : 'Save Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
