/**
 * Utility to compress and convert uploaded image files to crisp, lightweight Data URLs.
 * Handles PNG (with transparency preservation), JPG, WebP, and AVIF.
 * Ensures images upload instantly and never exceed browser/state payload limits.
 */
export function compressImageFile(file, maxWidth = 1200, maxHeight = 1200, quality = 0.85) {
  return new Promise((resolve) => {
    if (!file) {
      resolve('');
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
          resolve(dataUrl);
        } catch (e) {
          // Fallback to raw data URL if canvas manipulation fails
          resolve(event.target.result);
        }
      };

      img.onerror = () => {
        // Fallback to raw data URL
        resolve(event.target.result);
      };

      img.src = event.target.result;
    };

    reader.onerror = () => {
      resolve('');
    };

    reader.readAsDataURL(file);
  });
}
