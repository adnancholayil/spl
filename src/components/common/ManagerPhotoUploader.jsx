import React, { useRef, useState } from 'react';
import { Upload, X, User, Camera } from 'lucide-react';
import { ConfirmModal } from './ConfirmModal';

export const ManagerPhotoUploader = ({ managerPhotoUrl, onPhotoChange, managerName = '' }) => {
  const fileInputRef = useRef(null);
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
        const MAX_SIZE = 300;
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

        // Compress to WEBP at 85% quality
        const compressedDataUrl = canvas.toDataURL('image/webp', 0.85);
        onPhotoChange(compressedDataUrl);
      };

      img.onerror = () => {
        onPhotoChange(e.target.result);
      };

      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const clearPhoto = (e) => {
    e.stopPropagation();
    onPhotoChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{
        fontFamily: 'var(--font-display)',
        fontSize: 9,
        fontWeight: 700,
        color: 'var(--text-muted)',
        letterSpacing: '0.2em',
        display: 'block',
        textTransform: 'uppercase'
      }}>
        Manager Photo
      </label>

      {managerPhotoUrl ? (
        <div style={{
          background: '#060811',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
        }}>
          {/* Avatar preview */}
          <div style={{
            width: 52,
            height: 52,
            borderRadius: 10,
            flexShrink: 0,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}>
            <img 
              src={managerPhotoUrl} 
              alt={managerName || 'Manager'} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
            />
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {managerName || 'Manager Photo'}
            </span>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                type="button"
                onClick={triggerSelect}
                style={{
                  background: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <Camera size={11} /> Change
              </button>
              <button
                type="button"
                onClick={clearPhoto}
                style={{
                  background: 'none',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 10,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <X size={11} /> Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={triggerSelect}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]);
          }}
          style={{
            border: '2px dashed rgba(245, 158, 11, 0.35)',
            background: 'rgba(6,8,17,0.7)',
            borderRadius: 12,
            padding: '16px 14px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12
          }}
        >
          <div style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#f59e0b',
            shrink: 0
          }}>
            <User size={18} />
          </div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Upload Manager Photo
            </span>
            <span style={{ fontSize: 9, color: '#94a3b8', display: 'block', marginTop: 1 }}>
              Click or drag & drop (PNG, JPG, WEBP)
            </span>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
        style={{ display: 'none' }}
      />

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
