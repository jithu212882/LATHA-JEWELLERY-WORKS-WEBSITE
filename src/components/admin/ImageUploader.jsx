import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { compressImageFile } from '../../utils/imageCompressor';

export default function ImageUploader({ value, onChange, label, sectionTag = 'General' }) {
  const { token } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileUpload = async (file) => {
    if (!file) return;
    setError('');

    setUploading(true);

    try {
      // 1. Attempt Multipart File Upload to server endpoint if available
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section_tag', sectionTag);

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json.url) {
          onChange(json.url);
          setUploading(false);
          return;
        }
      }

      // 2. Compress image client-side to crisp, lightweight Data URL
      const dataUrl = await compressImageFile(file);
      if (dataUrl) {
        onChange(dataUrl);
      } else {
        setError('Error processing image');
      }
    } catch (err) {
      console.warn('Network upload error, converting to local Data URL:', err);
      try {
        const dataUrl = await compressImageFile(file);
        if (dataUrl) onChange(dataUrl);
      } catch (readErr) {
        setError('Error reading image file');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs uppercase tracking-wider text-supporting-beige font-medium">
          {label}
        </label>
      )}

      {/* Image Preview / Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-4 transition-all text-center relative ${
          dragActive
            ? 'border-accent-gold bg-accent-gold/10'
            : 'border-[#2A2A2A] bg-[#121212] hover:border-accent-gold/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
          className="hidden"
        />

        {value ? (
          <div className="space-y-3">
            <div
              className="w-full h-36 bg-cover bg-center rounded-lg border border-[#2A2A2A] relative overflow-hidden"
              style={{ backgroundImage: `url('${value}')` }}
            >
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                title="Remove image"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-[#F5F2EB]/60">
              <span className="truncate max-w-[200px]">{value}</span>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-accent-gold hover:underline font-medium"
              >
                Replace File
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer py-4 flex flex-col items-center justify-center"
          >
            <span className="material-symbols-outlined text-accent-gold text-3xl mb-1">
              cloud_upload
            </span>
            <p className="text-xs text-[#F5F2EB]/80 font-medium">
              {uploading ? 'Uploading Image...' : 'Click to Upload or Drag & Drop'}
            </p>
            <p className="text-[10px] text-[#F5F2EB]/40 mt-1">
              JPG, PNG, WebP, AVIF up to 10MB
            </p>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
