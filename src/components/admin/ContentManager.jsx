import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function ContentManager() {
  const { content, refreshData } = useData();
  const { token } = useAuth();
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const [formData, setFormData] = useState({
    hero_eyebrow: content?.hero_eyebrow || 'Established 1990 • Chathencode',
    hero_title: content?.hero_title || 'Crafting Unique Gold Ornaments Since 1990',
    hero_subtitle: content?.hero_subtitle || 'Where ancestral heritage meets uncompromising contemporary precision. Bespoke gold craftsmanship tailored to your most cherished milestones.',
    about_eyebrow: content?.about_eyebrow || 'Legacy of Excellence',
    about_title: content?.about_title || 'Three Decades of Trusted Craftsmanship',
    about_description: content?.about_description || 'For over 35 years, Latha Jewellery Works has stood as a beacon of purity and peerless artistry in Chathencode.',
    about_years: content?.about_years || '35+',
    about_purity: content?.about_purity || '100%',
    about_image: content?.about_image || '',
    featured_title: content?.featured_title || 'The Heritage Bridal Haram',
    featured_description: content?.featured_description || 'Handcrafted over 120 meticulous hours by our master artisans...',
    featured_image: content?.featured_image || ''
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMsg('');

    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        await refreshData();
        setMsg('Site content updated successfully across public website!');
      }
    } catch (err) {
      console.error('Error saving content:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Page Builder Controls
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Site Content Management
          </h1>
        </div>
      </div>

      {msg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-bold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* HERO SECTION */}
        <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl space-y-4 shadow-lg">
          <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
            1. Hero Section Content
          </h3>
          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
              Eyebrow Badge
            </label>
            <input
              type="text"
              value={formData.hero_eyebrow}
              onChange={(e) => setFormData({ ...formData, hero_eyebrow: e.target.value })}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
              Hero Title
            </label>
            <input
              type="text"
              value={formData.hero_title}
              onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
              Hero Subtitle
            </label>
            <textarea
              rows="2"
              value={formData.hero_subtitle}
              onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            ></textarea>
          </div>
        </div>

        {/* ABOUT SECTION */}
        <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl space-y-4 shadow-lg">
          <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
            2. About Section Content
          </h3>
          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
              About Heading
            </label>
            <input
              type="text"
              value={formData.about_title}
              onChange={(e) => setFormData({ ...formData, about_title: e.target.value })}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
              About Description
            </label>
            <textarea
              rows="3"
              value={formData.about_description}
              onChange={(e) => setFormData({ ...formData, about_description: e.target.value })}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            ></textarea>
          </div>
          <ImageUploader
            label="About Atelier Image"
            value={formData.about_image}
            onChange={(url) => setFormData({ ...formData, about_image: url })}
            sectionTag="About"
          />
        </div>

        {/* FEATURED SPOTLIGHT */}
        <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl space-y-4 shadow-lg">
          <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
            3. Featured Masterpiece Spotlight
          </h3>
          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
              Spotlight Title
            </label>
            <input
              type="text"
              value={formData.featured_title}
              onChange={(e) => setFormData({ ...formData, featured_title: e.target.value })}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
              Spotlight Description
            </label>
            <textarea
              rows="3"
              value={formData.featured_description}
              onChange={(e) => setFormData({ ...formData, featured_description: e.target.value })}
              className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
            ></textarea>
          </div>
          <ImageUploader
            label="Spotlight Masterpiece Image"
            value={formData.featured_image}
            onChange={(url) => setFormData({ ...formData, featured_image: url })}
            sectionTag="Spotlight"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-accent-gold text-[#121212] font-bold py-4 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving Content...' : 'Save All Content Changes'}
        </button>
      </form>
    </div>
  );
}
