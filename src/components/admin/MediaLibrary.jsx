import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function MediaLibrary() {
  const { token } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [tagFilter, setTagFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setMediaItems(json);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media asset?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMedia();
      }
    } catch (err) {
      console.error('Delete media error:', err);
    }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const tags = ['ALL', 'Jewellery', 'Hero', 'Banner', 'Category', 'Logo', 'General'];

  const filteredItems = mediaItems.filter(item => {
    if (tagFilter === 'ALL') return true;
    return item.section_tag === tagFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#2A2A2A] pb-6">
        <div>
          <span className="text-xs text-accent-gold uppercase tracking-widest font-bold">
            Asset Manager
          </span>
          <h1 className="font-headline text-3xl sm:text-4xl text-[#F9F6F0] font-bold mt-1">
            Central Media Library
          </h1>
        </div>
        <span className="text-xs text-[#F5F2EB]/60">
          Total Assets: <strong className="text-accent-gold">{mediaItems.length}</strong>
        </span>
      </div>

      {/* Upload Zone */}
      <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl shadow-lg">
        <h3 className="font-headline text-lg font-bold text-accent-gold uppercase mb-3">
          Upload New Image
        </h3>
        <ImageUploader
          onChange={() => fetchMedia()}
          sectionTag="General"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 no-scrollbar">
        {tags.map((t) => (
          <button
            key={t}
            onClick={() => setTagFilter(t)}
            className={`px-4 py-2 text-xs uppercase tracking-wider rounded-lg transition-colors font-bold ${
              tagFilter === t
                ? 'bg-accent-gold text-[#121212]'
                : 'bg-[#181818] text-[#F5F2EB]/70 border border-[#2A2A2A] hover:border-accent-gold/40'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Grid Display */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 bg-[#181818] border border-[#2A2A2A] rounded-2xl">
          <span className="material-symbols-outlined text-accent-gold text-4xl mb-2">perm_media</span>
          <p className="text-xs text-[#F5F2EB]/60">No media uploaded in this section yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-3 flex flex-col justify-between group hover:border-accent-gold/50 transition-colors shadow-lg"
            >
              <div
                className="w-full h-32 bg-cover bg-center rounded-lg border border-[#2A2A2A] mb-2"
                style={{ backgroundImage: `url('${item.url}')` }}
              />
              <span className="text-xs text-[#F9F6F0] font-medium truncate block" title={item.original_name}>
                {item.original_name}
              </span>
              <span className="text-[10px] text-accent-gold block mt-0.5">
                {(item.size ? (item.size / 1024).toFixed(1) + ' KB' : 'Uploaded')}
              </span>

              <div className="flex gap-2 pt-3 mt-2 border-t border-[#2A2A2A]">
                <button
                  onClick={() => copyUrl(item.url, item.id)}
                  className="flex-1 bg-[#121212] border border-[#2A2A2A] text-xs py-1 rounded text-[#F5F2EB] hover:text-accent-gold transition-colors font-medium text-center"
                >
                  {copiedId === item.id ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1 bg-[#121212] border border-[#2A2A2A] text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"
                  title="Delete Media"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
