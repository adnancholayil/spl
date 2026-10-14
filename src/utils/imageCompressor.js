/**
 * Client-Side Image Compression Utility
 * Prevents LocalStorage QuotaExceededError by downscaling and compressing images
 * into lightweight WebP format (~25KB-45KB) while preserving visual sharpness on high-DPI screens.
 */

export const compressImageDataUrl = (dataUrl, maxSize = 500, quality = 0.82) => {
  return new Promise((resolve) => {
    if (!dataUrl || typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image')) {
      return resolve(dataUrl);
    }
    // If it's already tiny (< 60KB), no need to compress further
    if (dataUrl.length < 60000) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.onload = () => {
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // WebP preserves alpha transparency for cutouts while offering 95%+ compression
        let compressed = canvas.toDataURL('image/webp', quality);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(compressed);
      } catch (err) {
        console.warn('Image compression failed, returning original:', err);
        resolve(dataUrl);
      }
    };

    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const compressImageFile = (file, maxSize = 500, quality = 0.82) => {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      return reject(new Error('Invalid image file'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      compressImageDataUrl(e.target.result, maxSize, quality)
        .then(resolve)
        .catch(() => resolve(e.target.result));
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};
