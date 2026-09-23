/**
 * Utility to compress and convert uploaded image files to crisp, lightweight Data URLs.
 * Handles PNG (with transparency preservation), JPG, WebP, and AVIF.
 * Ensures images upload instantly and stay safely below Vercel's 4.5MB serverless payload limit.
 */
export function compressImageFile(file, maxWidth = 1600, maxHeight = 1600, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file) {
      resolve({ success: false, dataUrl: '', error: 'No file provided' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            } else {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          // Preserve transparency for PNGs
          const isPng = file.type === 'image/png' || file.name?.toLowerCase().endsWith('.png');
          if (!isPng) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, width, height);
          }

          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = isPng ? 'image/png' : 'image/jpeg';
          const dataUrl = canvas.toDataURL(mimeType, quality);

          // Calculate payload size in Megabytes (Base64 string length * 0.75)
          const sizeInBytes = Math.round(dataUrl.length * 0.75);
          const sizeInMb = sizeInBytes / (1024 * 1024);

          // Enforce 3.5 MB safe limit for Vercel 4.5 MB function limit
          if (sizeInMb > 3.5) {
            resolve({
              success: false,
              dataUrl: '',
              error: `Compressed image is too large (${sizeInMb.toFixed(2)} MB). Maximum allowed payload size is 3.5 MB.`
            });
            return;
          }

          resolve({ success: true, dataUrl, error: null });
        } catch (e) {
          const rawUrl = event.target.result || '';
          const sizeInBytes = Math.round(rawUrl.length * 0.75);
          const sizeInMb = sizeInBytes / (1024 * 1024);
          if (sizeInMb > 3.5) {
            resolve({
              success: false,
              dataUrl: '',
              error: `Image file is too large (${sizeInMb.toFixed(2)} MB). Please select a file under 3.5 MB.`
            });
          } else {
            resolve({ success: true, dataUrl: rawUrl, error: null });
          }
        }
      };

      img.onerror = () => {
        resolve({ success: false, dataUrl: '', error: 'Failed to read image file.' });
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      resolve({ success: false, dataUrl: '', error: 'Error reading image file from disk.' });
    };

    reader.readAsDataURL(file);
  });
}
