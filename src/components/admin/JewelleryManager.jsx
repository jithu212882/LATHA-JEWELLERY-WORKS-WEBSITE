import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function JewelleryManager() {
  const { jewellery_models, categories, refreshData } = useData();
  const { token } = useAuth();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingItem, setEditingItem] = useState(null); // null, 'new', or item object
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category_slug: 'chain',
    description: '',
    min_weight: '',
    primary_image: '',
    featured: 0,
    active: 1
  });

  const filteredModels = (jewellery_models || []).filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || item.category_slug.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const openNewModal = () => {
    setFormData({
      name: '',
      category_slug: categories?.[0]?.slug || 'chain',
      description: '',
      min_weight: '',
      primary_image: '',
      featured: 0,
      active: 1
    });
    setEditingItem('new');
    setError('');
  };

  const openEditModal = (item) => {
    setFormData({
      name: item.name,
      category_slug: item.category_slug,
      description: item.description || '',
      min_weight: item.min_weight || '',
      primary_image: item.primary_image || '',
      featured: item.featured ? 1 : 0,
      active: item.active ? 1 : 0
    });
    setEditingItem(item);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const url = editingItem === 'new' ? '/api/jewellery' : `/api/jewellery/${editingItem.id}`;
    const method = editingItem === 'new' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Failed to save model');
      }

      await refreshData();
      setEditingItem(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this jewellery model?')) return;
    try {
      const res = await fetch(`/api/jewellery/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const toggleActive = async (item) => {
    try {
      const res = await fetch(`/api/jewellery/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: item.active ? 0 : 1 })
      });
      if (res.ok) await refreshData();
    } catch (err) {
      console.error('Toggle active error:', err);
    }
  };

  const toggleFeatured = async (item) => {
    try {
      const res = await fetch(`/api/jewellery/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ featured: item.featured ? 0 : 1 })
      });
      if (res.ok) await refreshData();
    } catch (err) {
      console.error('Toggle featured error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Inventory Control
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Jewellery Model Management
          </h1>
        </div>
        <button
          onClick={openNewModal}
          className="bg-accent-gold text-[#121212] font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-supporting-beige transition-colors"
        >
          + Add New Model
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between bg-[#181818] p-4 rounded-xl border border-[#2A2A2A]">
        <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-2 text-xs text-[#F9F6F0] focus:border-accent-gold outline-none w-full sm:w-64"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-[#121212] border border-[#2A2A2A] rounded-lg px-4 py-2 text-xs text-[#F9F6F0] focus:border-accent-gold outline-none"
          >
            <option value="all">All Categories</option>
            {(categories || []).map(c => (
              <option key={c.slug} value={c.slug}>{c.name}</option>
            ))}
          </select>
        </div>
        <span className="text-xs text-[#F5F2EB]/60 uppercase">
          Showing {filteredModels.length} items
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#2A2A2A] text-xs text-supporting-beige uppercase font-bold bg-[#121212]">
              <th className="p-4">Preview</th>
              <th className="p-4">Model Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Min. Weight</th>
              <th className="p-4">Status & Toggles</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2A2A2A] text-xs text-[#F5F2EB]">
            {filteredModels.map((item) => (
              <tr key={item.id} className="hover:bg-[#1C1B1A]/60 transition-colors">
                <td className="p-4">
                  <div
                    className="w-12 h-12 bg-cover bg-center rounded-lg border border-[#2A2A2A]"
                    style={{ backgroundImage: `url('${item.primary_image}')` }}
                  />
                </td>
                <td className="p-4 font-bold text-[#F9F6F0]">{item.name}</td>
                <td className="p-4 uppercase text-accent-gold font-medium">{item.category_slug}</td>
                <td className="p-4 font-light">{item.min_weight || 'N/A'}</td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleActive(item)}
                      className={`px-2 py-1 text-[10px] rounded uppercase font-bold transition-colors ${
                        item.active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                      }`}
                      title="Click to toggle store visibility"
                    >
                      {item.active ? 'Active' : 'Hidden'}
                    </button>
                    <button
                      onClick={() => toggleFeatured(item)}
                      className={`px-2 py-1 text-[10px] rounded uppercase font-bold transition-colors ${
                        item.featured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30' : 'bg-gray-500/10 text-gray-400 border border-gray-500/20 hover:text-white'
                      }`}
                      title="Click to toggle homepage featured status"
                    >
                      {item.featured ? '★ Featured' : 'Normal'}
                    </button>
                  </div>
                </td>
                <td className="p-4 text-right space-x-2">
                  <button
                    onClick={() => openEditModal(item)}
                    className="text-[#F5F2EB]/70 hover:text-accent-gold p-1"
                    title="Edit Model"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-[#F5F2EB]/70 hover:text-red-400 p-1"
                    title="Delete Model"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden space-y-4">
        {filteredModels.map((item) => (
          <div key={item.id} className="bg-[#181818] border border-[#2A2A2A] p-4 rounded-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className="w-14 h-14 bg-cover bg-center rounded-lg border border-[#2A2A2A] shrink-0"
                style={{ backgroundImage: `url('${item.primary_image}')` }}
              />
              <div>
                <h4 className="font-bold text-sm text-[#F9F6F0]">{item.name}</h4>
                <span className="text-[11px] text-accent-gold uppercase font-medium block">
                  {item.category_slug} • {item.min_weight || 'Custom'}
                </span>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => toggleActive(item)}
                    className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold ${
                      item.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {item.active ? 'Active' : 'Hidden'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => openEditModal(item)}
                className="p-2 text-[#F5F2EB]/80 hover:text-accent-gold bg-[#121212] rounded-lg border border-[#2A2A2A]"
              >
                <span className="material-symbols-outlined text-[18px]">edit</span>
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 text-[#F5F2EB]/80 hover:text-red-400 bg-[#121212] rounded-lg border border-[#2A2A2A]"
              >
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1B1A] border border-[#2A2A2A] max-w-xl w-full p-6 rounded-2xl relative my-8 shadow-2xl">
            <button
              onClick={() => setEditingItem(null)}
              className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline text-2xl font-bold text-accent-gold mb-4 uppercase">
              {editingItem === 'new' ? 'Add New Jewellery Model' : 'Edit Model'}
            </h3>

            {error && <p className="text-xs text-red-400 mb-4">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1">
                  Model Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  placeholder="e.g. Royal Antique Nakshi Mala"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  >
                    {(categories || []).map((c) => (
                      <option key={c.slug} value={c.slug}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1">
                    Minimum Weight
                  </label>
                  <input
                    type="text"
                    value={formData.min_weight}
                    onChange={(e) => setFormData({ ...formData, min_weight: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                    placeholder="e.g. 24 Grams"
                  />
                </div>
              </div>

              {/* Drag & Drop Real Image Uploader */}
              <ImageUploader
                label="Primary Model Image *"
                value={formData.primary_image}
                onChange={(url) => setFormData({ ...formData, primary_image: url })}
                sectionTag="Jewellery"
              />

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1">
                  Description
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  placeholder="Detailed specifications, karat purity, stone setting..."
                ></textarea>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-xs text-[#F5F2EB]/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })}
                    className="accent-accent-gold w-4 h-4"
                  />
                  Active on Storefront
                </label>

                <label className="flex items-center gap-2 text-xs text-[#F5F2EB]/90 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked ? 1 : 0 })}
                    className="accent-accent-gold w-4 h-4"
                  />
                  Feature on Homepage
                </label>
              </div>

              <div className="pt-4 border-t border-[#2A2A2A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-4 py-2 bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB] rounded-lg text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-accent-gold text-[#121212] font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-supporting-beige transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
