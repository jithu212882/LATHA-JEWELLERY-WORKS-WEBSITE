import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';
import { parseJsonResponse } from '../../utils/apiHelper';

export default function CategoryManager() {
  const { categories, refreshData, saveCategory, deleteCategory } = useData();
  const { token } = useAuth();

  const [editingCat, setEditingCat] = useState(null); // null, 'new', or category object
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    image_url: ''
  });

  const toggleActive = async (cat) => {
    const isNew = false;
    const targetId = cat.id;
    if (saveCategory) {
      saveCategory({ active: cat.active ? 0 : 1 }, isNew, targetId);
    }
    try {
      const res = await fetch(`/api/categories/${cat.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ active: cat.active ? 0 : 1 })
      });
      await parseJsonResponse(res);
    } catch (err) {
      console.error('Toggle category active error:', err);
    }
  };

  const openNewModal = () => {
    setFormData({ name: '', slug: '', description: '', image_url: '', active: 1 });
    setEditingCat('new');
    setError('');
  };

  const openEditModal = (cat) => {
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || '',
      image_url: cat.image_url || '',
      active: cat.active ? 1 : 0
    });
    setEditingCat(cat);
    setError('');
  };

  const handleNameChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: val,
      slug: prev.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const isNew = editingCat === 'new';
    const targetId = isNew ? null : editingCat.id;

    // 1. Immediately persist category in DataContext & localStorage
    if (saveCategory) {
      saveCategory(formData, isNew, targetId);
    }

    // 2. Background API call for server persistence
    const url = isNew ? '/api/categories' : `/api/categories/${targetId}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      await parseJsonResponse(res);
      if (refreshData) await refreshData();
    } catch (err) {
      console.warn('Background category save sync:', err);
    } finally {
      setSaving(false);
      setEditingCat(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    if (deleteCategory) {
      deleteCategory(id);
    }
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      await parseJsonResponse(res);
      if (refreshData) await refreshData();
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Taxonomy Control
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Category Management
          </h1>
        </div>
        <button
          onClick={openNewModal}
          className="bg-accent-gold text-[#121212] font-bold px-4 py-2.5 rounded-lg text-xs uppercase tracking-wider hover:bg-supporting-beige transition-colors"
        >
          + Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(categories || []).map((cat) => (
          <div
            key={cat.id}
            className="bg-[#181818] border border-[#2A2A2A] rounded-2xl p-6 flex flex-col justify-between hover:border-accent-gold/40 transition-colors shadow-lg"
          >
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-headline text-xl font-bold text-accent-gold">{cat.name}</h3>
                  <span className="text-[10px] text-[#F5F2EB]/50 uppercase tracking-widest font-mono">
                    slug: {cat.slug}
                  </span>
                </div>
                <button
                  onClick={() => toggleActive(cat)}
                  className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold transition-colors ${
                    cat.active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/15 text-red-400 border border-red-500/30'
                  }`}
                >
                  {cat.active ? 'Active' : 'Disabled'}
                </button>
              </div>
              {cat.image_url && (
                <div
                  className="w-full h-28 bg-cover bg-center rounded-xl border border-[#2A2A2A]"
                  style={{ backgroundImage: `url('${cat.image_url}')` }}
                />
              )}
              <p className="text-xs text-[#F5F2EB]/70 font-light leading-relaxed">
                {cat.description || 'No description provided.'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-4 mt-4 border-t border-[#2A2A2A] text-xs">
              <button
                onClick={() => openEditModal(cat)}
                className="text-accent-gold hover:underline font-bold uppercase"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="text-red-400 hover:underline font-bold uppercase"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Category Modal */}
      {editingCat && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1B1A] border border-[#2A2A2A] max-w-md w-full p-6 rounded-2xl relative shadow-2xl">
            <button
              onClick={() => setEditingCat(null)}
              className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline text-2xl font-bold text-accent-gold mb-4 uppercase">
              {editingCat === 'new' ? 'Add New Category' : 'Edit Category'}
            </h3>

            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleNameChange}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  placeholder="e.g. Chains & Necklaces"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  URL Slug *
                </label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none font-mono"
                  placeholder="chain"
                />
              </div>

              <ImageUploader
                label="Category Banner Image"
                value={formData.image_url}
                onChange={(url) => setFormData({ ...formData, image_url: url })}
                sectionTag="Category"
              />

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Description
                </label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  placeholder="Short taxonomy summary..."
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="cat-active"
                  checked={!!formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked ? 1 : 0 })}
                  className="accent-accent-gold w-4 h-4"
                />
                <label htmlFor="cat-active" className="text-xs text-[#F5F2EB]/90 cursor-pointer">
                  Enabled on Public Website Filter
                </label>
              </div>

              <div className="pt-4 border-t border-[#2A2A2A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingCat(null)}
                  className="px-4 py-2 bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB] rounded-lg text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-accent-gold text-[#121212] font-bold rounded-lg text-xs uppercase tracking-wider hover:bg-supporting-beige transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
