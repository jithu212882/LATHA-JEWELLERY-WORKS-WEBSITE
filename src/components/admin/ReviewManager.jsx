import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { supabase } from '../../lib/supabaseClient';

export default function ReviewManager() {
  const { token } = useAuth();
  const { refreshData } = useData();
  const [reviews, setReviews] = useState([]);

  const fetchAdminReviews = async () => {
    let loaded = null;
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          loaded = data;
        }
      }
    } catch (err) {
      console.warn('Supabase reviews fetch notice:', err.message);
    }

    try {
      const res = await fetch('/api/reviews/admin', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        if (!loaded || loaded.length === 0) {
          loaded = json;
        }
      }
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
    }

    if (loaded) {
      setReviews(loaded);
    }
  };

  useEffect(() => {
    fetchAdminReviews();
  }, []);

  const handleStatus = async (id, status, featured) => {
    try {
      if (supabase) {
        await supabase
          .from('reviews')
          .update({ status, featured: featured ? 1 : 0 })
          .eq('id', id);
      }
    } catch (err) {
      console.warn('Supabase status update notice:', err.message);
    }

    try {
      await fetch(`/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, featured })
      });
    } catch (err) {
      console.error('Error updating review status via API:', err);
    }

    setReviews(prev => prev.map(r => r.id === id ? { ...r, status, featured: featured ? 1 : 0 } : r));
    refreshData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;

    try {
      if (supabase) {
        await supabase
          .from('reviews')
          .delete()
          .eq('id', id);
      }
    } catch (err) {
      console.warn('Supabase delete review notice:', err.message);
    }

    try {
      await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Error deleting review via API:', err);
    }

    setReviews(prev => prev.filter(r => r.id !== id));
    refreshData();
  };

  const [editingReview, setEditingReview] = useState(null);
  const [formData, setFormData] = useState({ name: '', location: '', rating: 5, review_text: '', status: 'APPROVED', featured: 1 });

  const toggleFeature = async (rev) => {
    const updatedFeatured = rev.featured ? 0 : 1;
    try {
      if (supabase) {
        await supabase
          .from('reviews')
          .update({ featured: updatedFeatured })
          .eq('id', rev.id);
      }
    } catch (err) {
      console.warn('Supabase toggle feature notice:', err.message);
    }

    try {
      await fetch(`/api/reviews/${rev.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ featured: updatedFeatured })
      });
    } catch (err) {
      console.error('Error toggling feature via API:', err);
    }

    setReviews(prev => prev.map(r => r.id === rev.id ? { ...r, featured: updatedFeatured } : r));
    refreshData();
  };

  const openEditModal = (rev) => {
    setFormData({
      name: rev.name,
      location: rev.location || '',
      rating: rev.rating || 5,
      review_text: rev.review_text || '',
      status: rev.status || 'APPROVED',
      featured: rev.featured ? 1 : 0
    });
    setEditingReview(rev);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      if (supabase) {
        await supabase
          .from('reviews')
          .update(formData)
          .eq('id', editingReview.id);
      }
    } catch (err) {
      console.warn('Supabase edit save notice:', err.message);
    }

    try {
      await fetch(`/api/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
    } catch (err) {
      console.error('Error saving review via API:', err);
    }

    setReviews(prev => prev.map(r => r.id === editingReview.id ? { ...r, ...formData } : r));
    refreshData();
    setEditingReview(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Patron Moderation
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Review Moderation Queue
          </h1>
        </div>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-[#181818] border border-[#2A2A2A] rounded-2xl">
            <span className="material-symbols-outlined text-accent-gold text-4xl mb-2">rate_review</span>
            <p className="text-xs text-[#F5F2EB]/60">No reviews submitted yet.</p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h4 className="font-bold text-[#F9F6F0] text-base">{rev.name}</h4>
                  <span className="text-xs text-[#F5F2EB]/60">({rev.location || 'Patron'})</span>
                  <div className="flex text-accent-gold">
                    {[...Array(rev.rating || 5)].map((_, i) => (
                      <span key={i} className="material-symbols-outlined text-[16px]">star</span>
                    ))}
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold ${
                    rev.status === 'APPROVED'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : rev.status === 'PENDING'
                      ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}>
                    {rev.status}
                  </span>
                  <button
                    onClick={() => toggleFeature(rev)}
                    className={`px-2 py-0.5 text-[10px] rounded uppercase font-bold transition-colors ${
                      rev.featured ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-[#121212] text-[#F5F2EB]/50 border border-[#2A2A2A]'
                    }`}
                  >
                    {rev.featured ? '★ Featured' : 'Normal'}
                  </button>
                </div>
                <p className="text-xs text-[#F5F2EB]/80 font-light italic">"{rev.review_text}"</p>
              </div>

              <div className="flex flex-wrap gap-2 shrink-0">
                {rev.status !== 'APPROVED' && (
                  <button
                    onClick={() => handleStatus(rev.id, 'APPROVED', rev.featured)}
                    className="px-3 py-1.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs uppercase font-bold hover:bg-emerald-600 hover:text-white transition-colors"
                  >
                    Approve
                  </button>
                )}
                {rev.status !== 'REJECTED' && (
                  <button
                    onClick={() => handleStatus(rev.id, 'REJECTED', 0)}
                    className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg text-xs uppercase hover:bg-amber-600 hover:text-white transition-colors"
                  >
                    Reject
                  </button>
                )}
                <button
                  onClick={() => openEditModal(rev)}
                  className="px-3 py-1.5 bg-[#121212] border border-[#2A2A2A] text-accent-gold rounded-lg text-xs uppercase font-bold hover:bg-accent-gold hover:text-[#121212] transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(rev.id)}
                  className="px-3 py-1.5 bg-red-500/10 text-red-400 border border-red-500/30 rounded-lg text-xs uppercase hover:bg-red-600 hover:text-white transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingReview && (
        <div className="fixed inset-0 z-[120] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#1C1B1A] border border-[#2A2A2A] max-w-md w-full p-6 rounded-2xl relative shadow-2xl">
            <button
              onClick={() => setEditingReview(null)}
              className="absolute top-4 right-4 text-[#F5F2EB]/60 hover:text-white"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="font-headline text-2xl font-bold text-accent-gold mb-4 uppercase">
              Edit Patron Review
            </h3>

            <form onSubmit={handleEditSave} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Reviewer Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Location / Town
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Rating (1 to 5)
                </label>
                <select
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                >
                  <option value={5}>5 Stars ★★★★★</option>
                  <option value={4}>4 Stars ★★★★</option>
                  <option value={3}>3 Stars ★★★</option>
                  <option value={2}>2 Stars ★★</option>
                  <option value={1}>1 Star ★</option>
                </select>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-supporting-beige mb-1 font-medium">
                  Review Text
                </label>
                <textarea
                  rows="4"
                  required
                  value={formData.review_text}
                  onChange={(e) => setFormData({ ...formData, review_text: e.target.value })}
                  className="w-full bg-[#121212] border border-[#2A2A2A] rounded-lg p-3 text-sm text-[#F9F6F0] focus:border-accent-gold outline-none"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-[#2A2A2A] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2 bg-[#121212] border border-[#2A2A2A] text-[#F5F2EB] rounded-lg text-xs uppercase"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-accent-gold text-[#121212] font-bold rounded-lg text-xs uppercase tracking-wider"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
