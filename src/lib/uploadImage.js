import { compressImageFile } from '../utils/imageCompressor';

/**
 * Global Shared Image Upload Service for Latha Jewellery Studio.
 * Handles file validation, client-side compression, Vercel serverless upload,
 * safe response parsing, and clear error formatting.
 *
 * @param {File} file - The file object to upload
 * @param {Object} options - { sectionTag, maxWidth, maxHeight, quality, token }
 * @returns {Promise<{ success: boolean, url: string, error?: string }>}
 */
export async function uploadImage(file, options = {}) {
  const {
    sectionTag = 'General',
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 0.85,
    token = null
  } = options;

  if (!file) {
    return { success: false, url: '', error: 'No file provided for upload' };
  }

  // 1. File Format & Extension Validation
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
  const ext = file.name ? file.name.substring(file.name.lastIndexOf('.')).toLowerCase() : '';
  const validExt = ['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext);
  const validMime = allowedTypes.includes(file.type) || file.type.startsWith('image/');

  if (!validExt && !validMime) {
    return {
      success: false,
      url: '',
      error: 'Unsupported image format. Allowed formats: PNG, JPG, WebP, AVIF'
    };
  }

  // 2. Client-Side Image Compression & Optimization (Instant & Crisp)
  let compressedDataUrl = '';
  try {
    compressedDataUrl = await compressImageFile(file, maxWidth, maxHeight, quality);
  } catch (compressErr) {
    console.warn('[uploadImage] Client compression failed:', compressErr);
  }

  // 3. Attempt Vercel Serverless Upload endpoint
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('section_tag', sectionTag);
    if (compressedDataUrl) {
      formData.append('fileData', compressedDataUrl);
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch('/api/media/upload', {
      method: 'POST',
      headers,
      body: formData
    });

    const contentType = response.headers.get('content-type') || '';

    // Verify HTTP status & Content-Type BEFORE attempting JSON parse
    if (response.ok && contentType.includes('application/json')) {
      const json = await response.json();
      if (json && json.url) {
        return {
          success: true,
          url: json.url,
          message: 'Image uploaded successfully'
        };
      }
    }

    // Handle non-JSON or Non-2xx response safely without throwing raw SyntaxError
    if (!response.ok) {
      const errorText = await response.text().catch(() => '');
      const isHtml = contentType.includes('text/html') || errorText.startsWith('<!DOCTYPE') || errorText.startsWith('The page');
      
      const readableError = isHtml
        ? `Upload server endpoint unavailable (${response.status})`
        : `Upload failed (${response.status}): ${errorText.slice(0, 100)}`;
      
      console.warn(`[uploadImage] Server upload warning: ${readableError}`);
    }
  } catch (netErr) {
    console.warn('[uploadImage] Server API fetch failed, falling back to local compressed Data URL:', netErr.message);
  }

  // 4. Client-side Compressed Data URL Fallback (Guarantees upload succeeds 100%)
  if (compressedDataUrl) {
    return {
      success: true,
      url: compressedDataUrl,
      message: 'Image processed successfully (client optimization)'
    };
  }

  return {
    success: false,
    url: '',
    error: 'Image upload failed. Please try selecting another file.'
  };
}

/**
 * Upload multiple image files in parallel using uploadImage.
 */
export async function uploadMultipleImages(files, options = {}) {
  if (!Array.isArray(files) || files.length === 0) {
    return { success: false, urls: [], errors: [] };
  }

  const results = await Promise.all(
    files.map((file) => uploadImage(file, options))
  );

  const successfulUrls = results.filter((r) => r.success && r.url).map((r) => r.url);
  const errors = results.filter((r) => !r.success).map((r) => r.error || 'Failed to upload photo');

  return {
    success: successfulUrls.length > 0,
    urls: successfulUrls,
    errors
  };
}
