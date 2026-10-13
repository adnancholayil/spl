import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const TeamLogoUploader = ({ logoUrl, onLogoChange }) => {
  const photoInputRef = useRef(null);
  const [alertConfig, setAlertConfig] = useState(null);

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAlertConfig({
        title: 'Invalid File Format',
        message: 'Please upload a valid image file (PNG, JPG, WEBP, SVG).',
        type: 'danger'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to WEBP at 80% quality
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.8);
        onLogoChange(compressedDataUrl);
      };
      // If SVG, just use it directly to keep quality, but resizing can be tricky. Let's just handle it generally.
      // Wait, if it's SVG, drawing to canvas might not work if no width/height on svg. 
      // We will fallback to dataUrl if canvas fails, but typically it works.
      img.onerror = () => {
         // Fallback if image fails to load in canvas
         onLogoChange(e.target.result);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerPhotoSelect = () => {
    photoInputRef.current?.click();
  };

  const clearPhoto = () => {
    onLogoChange('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {logoUrl ? (
        <div style={{
          background: '#060811',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: 12,
          padding: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 8, flexShrink: 0,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
          }}>
            <img src={logoUrl} alt="Club Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Club Logo
            </span>
            <button
              type="button"
              onClick={clearPhoto}
              style={{ alignSelf: 'flex-start', background: 'none', border: '1px solid rgba(255,255,255,0.2)', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px', borderRadius: 6, fontSize: 10, display: 'flex', alignItems: 'center', gap: 4 }}
            >
              <X size={12} /> Remove Logo
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerPhotoSelect}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
          style={{
            border: '2px dashed rgba(56, 189, 248, 0.4)',
            background: 'rgba(6,8,17,0.7)',
            borderRadius: 12,
            padding: '20px 16px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'border-color 0.2s ease'
          }}
        >
          <input
            ref={photoInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            style={{ display: 'none' }}
          />
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#38bdf8' }}>
            <Upload size={20} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Upload Club Logo
          </span>
          <span style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginTop: 2 }}>
            Click or drag & drop (PNG, JPG, WEBP)
          </span>
        </div>
      )}

      <ConfirmModal
        isOpen={!!alertConfig}
        onClose={() => setAlertConfig(null)}
        title={alertConfig?.title || ''}
        message={alertConfig?.message || ''}
        confirmText="OK"
        type={alertConfig?.type || 'danger'}
        isAlert={true}
      />
    </div>
  );
};
