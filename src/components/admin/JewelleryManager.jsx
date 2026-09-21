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

  const [photos, setPhotos] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

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
    setPhotos([]);
    setEditingItem('new');
    setError('');
  };

  const openEditModal = (item) => {
    const additional = Array.isArray(item.additional_images)
      ? item.additional_images
      : typeof item.additional_images === 'string'
      ? JSON.parse(item.additional_images || '[]')
      : [];

    const existingPhotos = [item.primary_image, ...additional].filter(Boolean);

    setFormData({
      name: item.name,
      category_slug: item.category_slug,
      description: item.description || '',
      min_weight: item.min_weight || '',
      primary_image: item.primary_image || '',
      featured: item.featured ? 1 : 0,
      active: item.active ? 1 : 0
    });
    setPhotos(existingPhotos);
    setEditingItem(item);
    setError('');
  };

  const handleBatchPhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setError('');

    // Strict JPG/JPEG validation
    const invalidFile = files.find((f) => {
      const ext = f.name.substring(f.name.lastIndexOf('.')).toLowerCase();
      const validExt = ext === '.jpg' || ext === '.jpeg';
      const validMime = f.type === 'image/jpeg' || f.type === 'image/jpg' || f.type === 'image/pjpeg';
      return !validExt || !validMime;
    });

    if (invalidFile) {
      setError('Only JPG/JPEG images are supported. PNG, WebP, GIF, and AVIF formats are not allowed.');
      return;
    }

    setUploadingPhotos(true);
    const formDataUpload = new FormData();
    files.forEach((file) => formDataUpload.append('files', file));
    formDataUpload.append('section_tag', 'Jewellery');

    try {
      const res = await fetch('/api/media/upload-multiple', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formDataUpload
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || 'Upload failed');
      }

      const json = await res.json();
      const newUrls = json.urls || [];
      setPhotos((prev) => [...prev, ...newUrls]);
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err.message || 'Error uploading JPG/JPEG photos');
    } finally {
      setUploadingPhotos(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSetPrimaryPhoto = (index) => {
    if (index === 0) return;
    setPhotos((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, idx) => idx !== index);
      return [target, ...rest];
    });
  };

  const handleMovePhoto = (index, direction) => {
    const newIdx = index + direction;
    if (newIdx < 0 || newIdx >= photos.length) return;
    setPhotos((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[newIdx];
      copy[newIdx] = temp;
      return copy;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    // Minimum 3 photo validation for publishing
    if (photos.length < 3) {
      setError('Please add at least 3 JPG/JPEG photos for this jewellery model (e.g., Front View, Side Angle, Close-Up Detail).');
      setSaving(false);
      return;
    }

    const primaryImage = photos[0];
    const additionalImages = photos.slice(1);

    const payload = {
      ...formData,
      primary_image: primaryImage,
      additional_images: additionalImages
    };

    const url = editingItem === 'new' ? '/api/jewellery' : `/api/jewellery/${editingItem.id}`;
    const method = editingItem === 'new' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
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
      console.error('Error deleting model:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Master Catalogue Engine
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Jewellery Models Management
          </h1>
        </div>
        <button
          onClick={openNewModal}
          className="bg-accent-gold text-[#121212] font-bold px-6 py-3 rounded-xl text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors flex items-center justify-center gap-2 shadow-lg shrink-0"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>Add New Model</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <span className="material-symbols-outlined absolute left-4 top-3.5 text-[#F5F2EB]/40 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Search jewellery by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#181818] border border-[#2A2A2A] rounded-xl pl-12 pr-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-[#181818] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
        >
          <option value="all">All Categories ({jewellery_models?.length || 0})</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Models Table */}
      <div className="bg-[#181818] border border-[#2A2A2A] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#121212] border-b border-[#2A2A2A] text-xs uppercase tracking-wider text-accent-gold">
              <tr>
                <th className="p-4">Cover Image</th>
                <th className="p-4">Name & Category</th>
                <th className="p-4">Min Weight</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A2A2A]">
              {filteredModels.map((item) => {
                const add = Array.isArray(item.additional_images)
                  ? item.additional_images
                  : typeof item.additional_images === 'string'
                  ? JSON.parse(item.additional_images || '[]')
                  : [];
                const totalPhotos = [item.primary_image, ...add].filter(Boolean).length;

                return (
                  <tr key={item.id} className="hover:bg-[#1C1C1C] transition-colors">
                    <td className="p-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden border border-[#2A2A2A] bg-[#121212] relative">
                        <img
                          src={item.primary_image || '/assets/latha-logo.jpg'}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = '/assets/latha-logo.jpg';
                          }}
                        />
                        {totalPhotos > 1 && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-accent-gold text-[9px] font-bold px-1.5 py-0.5 rounded border border-accent-gold/30">
                            {totalPhotos} photos
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#F9F6F0]">{item.name}</div>
                      <div className="text-xs text-accent-gold font-medium uppercase tracking-wider mt-0.5">
                        {item.category_slug}
                      </div>
                    </td>
                    <td className="p-4 text-[#F5F2EB]/80 font-mono">
                      {item.min_weight || 'Custom'}
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.active ? 'Active' : 'Draft'}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 bg-[#121212] border border-[#2A2A2A] text-accent-gold rounded-lg hover:bg-accent-gold hover:text-[#121212] transition-colors"
                        title="Edit Model"
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 bg-[#121212] border border-[#2A2A2A] text-rose-400 rounded-lg hover:bg-rose-500 hover:text-white transition-colors"
                        title="Delete Model"
                      >
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </td>
                  </tr>
                );
              })}

              {filteredModels.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#F5F2EB]/50">
                    No jewellery models found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog for Add / Edit */}
      {editingItem && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#181818] border border-[#2A2A2A] max-w-3xl w-full rounded-2xl p-6 sm:p-8 relative shadow-2xl my-8">
            <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-4 mb-6">
              <h3 className="font-headline text-2xl font-bold text-accent-gold uppercase">
                {editingItem === 'new' ? 'Add New Jewellery Model' : 'Edit Jewellery Model'}
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="text-[#F5F2EB]/60 hover:text-white bg-[#121212] p-2 rounded-full border border-[#2A2A2A]"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-bold mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                    Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                    placeholder="e.g. Antique Temple Jimki Kammal"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                    Category *
                  </label>
                  <select
                    value={formData.category_slug}
                    onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                  >
                    {categories?.map((c) => (
                      <option key={c.id} value={c.slug}>
                        {c.name} ({c.slug})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                    Minimum Weight (e.g., 24 Grams)
                  </label>
                  <input
                    type="text"
                    value={formData.min_weight}
                    onChange={(e) => setFormData({ ...formData, min_weight: e.target.value })}
                    className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl px-4 py-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                    placeholder="e.g. 24 Grams"
                  />
                </div>

                <div className="flex items-center gap-6 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.featured}
                      onChange={(e) =>
                        setFormData({ ...formData, featured: e.target.checked ? 1 : 0 })
                      }
                      className="w-4 h-4 accent-accent-gold rounded"
                    />
                    <span className="text-xs text-[#F5F2EB] uppercase tracking-wider">Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!formData.active}
                      onChange={(e) =>
                        setFormData({ ...formData, active: e.target.checked ? 1 : 0 })
                      }
                      className="w-4 h-4 accent-accent-gold rounded"
                    />
                    <span className="text-xs text-[#F5F2EB] uppercase tracking-wider">Active</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-2 font-medium">
                  Detailed Craftsmanship Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-xl p-4 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none resize-none"
                  placeholder="Describe the 22k gold purity, gemstone settings, artisan techniques..."
                />
              </div>

              {/* DEDICATED MULTI-PHOTO UPLOAD & REORDERING SECTION */}
              <div className="bg-[#121212] border border-accent-gold/30 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-[#2A2A2A] pb-3">
                  <div>
                    <h4 className="font-headline font-bold text-accent-gold uppercase text-base">
                      Product Photos (Minimum 3 JPG/JPEG Required)
                    </h4>
                    <p className="text-[11px] text-[#F5F2EB]/60">
                      Upload at least 3 photos showing different angles (Front, Side, Detail). The first photo will be used as the Catalogue Cover Image.
                    </p>
                  </div>
                  <span className="text-xs font-bold text-accent-gold bg-accent-gold/10 border border-accent-gold/30 px-3 py-1 rounded-full">
                    {photos.length} Selected
                  </span>
                </div>

                {/* File Upload Input Button */}
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-accent-gold text-[#121212] font-bold px-5 py-2.5 rounded-lg text-xs uppercase tracking-widest hover:bg-supporting-beige transition-colors inline-flex items-center gap-2 shadow-md">
                    <span className="material-symbols-outlined text-[18px]">add_a_photo</span>
                    <span>{uploadingPhotos ? 'Uploading JPGs...' : 'Add Photos from Phone/Device'}</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg"
                      multiple
                      onChange={handleBatchPhotoUpload}
                      disabled={uploadingPhotos}
                      className="hidden"
                    />
                  </label>
                  <span className="text-[11px] text-amber-400/90 font-medium">
                    * JPG / JPEG images only
                  </span>
                </div>

                {/* Photo Previews & Reordering Cards */}
                {photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                    {photos.map((url, idx) => (
                      <div
                        key={idx}
                        className={`relative rounded-lg overflow-hidden border p-1 bg-[#181818] transition-all ${
                          idx === 0
                            ? 'border-accent-gold ring-2 ring-accent-gold/40 shadow-xl'
                            : 'border-[#2A2A2A]'
                        }`}
                      >
                        <div className="aspect-square rounded overflow-hidden relative bg-black">
                          <img src={url} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />

                          {/* Primary Badge */}
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 bg-accent-gold text-[#121212] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shadow">
                              Primary / Cover
                            </span>
                          )}

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-2 right-2 bg-rose-600/90 text-white p-1 rounded-full hover:bg-rose-700 transition-colors shadow"
                            title="Remove Photo"
                          >
                            <span className="material-symbols-outlined text-[14px]">close</span>
                          </button>
                        </div>

                        {/* Controls Bar */}
                        <div className="mt-2 flex items-center justify-between text-[11px] px-1">
                          <span className="text-[#F5F2EB]/60 font-mono">
                            #{idx + 1} {idx === 0 ? '(Cover)' : ''}
                          </span>

                          <div className="flex items-center gap-1">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(idx, -1)}
                                className="p-1 bg-[#242424] text-accent-gold rounded hover:bg-accent-gold hover:text-black"
                                title="Move Left"
                              >
                                <span className="material-symbols-outlined text-[12px]">chevron_left</span>
                              </button>
                            )}

                            {idx < photos.length - 1 && (
                              <button
                                type="button"
                                onClick={() => handleMovePhoto(idx, 1)}
                                className="p-1 bg-[#242424] text-accent-gold rounded hover:bg-accent-gold hover:text-black"
                                title="Move Right"
                              >
                                <span className="material-symbols-outlined text-[12px]">chevron_right</span>
                              </button>
                            )}

                            {idx !== 0 && (
                              <button
                                type="button"
                                onClick={() => handleSetPrimaryPhoto(idx)}
                                className="px-2 py-0.5 bg-accent-gold/20 text-accent-gold border border-accent-gold/40 rounded text-[9px] font-bold hover:bg-accent-gold hover:text-black"
                              >
                                Make Cover
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center border border-dashed border-[#2A2A2A] rounded-lg text-xs text-[#F5F2EB]/50">
                    No photos selected yet. Tap &quot;Add Photos from Phone/Device&quot; to upload 3+ JPG/JPEG photos.
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-6 py-3 bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB] rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-[#242424]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 bg-accent-gold text-[#121212] rounded-xl text-xs uppercase tracking-widest font-bold hover:bg-supporting-beige transition-colors disabled:opacity-50 shadow-lg"
                >
                  {saving ? 'Publishing Model...' : 'Save Jewellery Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
