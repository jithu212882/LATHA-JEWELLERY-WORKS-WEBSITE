import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ImageUploader from './ImageUploader';

export default function MediaLibrary() {
  const { token } = useAuth();
  const [mediaItems, setMediaItems] = useState([]);
  const [tagFilter, setTagFilter] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);
  const [uploadMsg, setUploadMsg] = useState('');

  const fetchMedia = async () => {
    try {
      const res = await fetch('/api/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        setMediaItems(Array.isArray(json) ? json : []);
      }
    } catch (err) {
      console.error('Error fetching media:', err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleImageUploaded = async (url) => {
    if (!url) return;
    setUploadMsg('Processing and registering uploaded image...');
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          url,
          section_tag: tagFilter === 'ALL' ? 'General' : tagFilter,
          name: 'Upload ' + new Date().toLocaleTimeString('en-IN')
        })
      });
      const data = await res.json();
      if (data?.media) {
        setMediaItems(prev => [data.media, ...prev.filter(m => m.url !== url)]);
      }
      setUploadMsg('Image uploaded and registered to Central Media Library successfully!');
      setTimeout(() => setUploadMsg(''), 4000);
      fetchMedia();
    } catch (err) {
      console.warn('Media registration notice:', err);
      fetchMedia();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this media asset?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMediaItems(prev => prev.filter(m => String(m.id) !== String(id)));
        fetchMedia();
      }
    } catch (err) {
      console.error('Delete media error:', err);
    }
  };

  const copyUrl = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const tags = ['ALL', 'Jewellery', 'Hero', 'Banner', 'Category', 'Logo', 'General'];

  const filteredItems = mediaItems.filter(item => {
    if (tagFilter === 'ALL') return true;
    return (item.section_tag || '').toLowerCase() === tagFilter.toLowerCase();
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

      {uploadMsg && (
        <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-bold flex items-center gap-2">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{uploadMsg}</span>
        </div>
      )}

      {/* Upload Zone */}
      <div className="bg-[#181818] border border-[#2A2A2A] p-6 rounded-2xl shadow-lg">
        <h3 className="font-headline text-lg font-bold text-accent-gold uppercase mb-3">
          Upload New Image to Cloud Library
        </h3>
        <p className="text-xs text-[#F5F2EB]/60 mb-4">
          Images uploaded here are stored in Supabase Storage with permanent HTTPS URLs, accessible across all devices.
        </p>
        <ImageUploader
          onChange={handleImageUploaded}
          sectionTag={tagFilter === 'ALL' ? 'General' : tagFilter}
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-3 flex flex-col justify-between group hover:border-accent-gold/50 transition-colors shadow-lg"
            >
              <div
                className="w-full h-32 bg-cover bg-center rounded-lg border border-[#2A2A2A] mb-2 relative overflow-hidden"
                style={{ backgroundImage: `url('${item.url}')` }}
              >
                {item.section_tag && (
                  <span className="absolute top-1.5 left-1.5 bg-black/80 text-accent-gold text-[9px] uppercase font-bold px-2 py-0.5 rounded border border-accent-gold/30">
                    {item.section_tag}
                  </span>
                )}
              </div>
              <span className="text-xs text-[#F9F6F0] font-medium truncate block" title={item.name || item.original_name}>
                {item.name || item.original_name || 'Jewellery Asset'}
              </span>
              <span className="text-[10px] text-accent-gold block mt-0.5 truncate font-mono">
                {item.url.startsWith('data:') ? 'Local Data' : 'Cloud Hosted'}
              </span>

              <div className="flex gap-2 pt-3 mt-2 border-t border-[#2A2A2A]">
                <button
                  type="button"
                  onClick={() => copyUrl(item.url, item.id)}
                  className="flex-1 bg-[#121212] border border-[#2A2A2A] text-xs py-1.5 rounded text-[#F5F2EB] hover:text-accent-gold transition-colors font-medium text-center"
                >
                  {copiedId === item.id ? 'Copied!' : 'Copy Link'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 bg-[#121212] border border-[#2A2A2A] text-red-400 rounded hover:bg-red-500 hover:text-white transition-colors"
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
