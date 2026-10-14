import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, ZoomIn, MoveHorizontal, MoveVertical, RefreshCw } from 'lucide-react';
import { EFootballCard } from './EFootballCard';
import { ConfirmModal } from './ConfirmModal';
import { compressImageFile } from '../../utils/imageCompressor';

/**
 * PlayerImageUploader
 * Drag & Drop photo uploader with real-time live preview card, zoom scaling (photoScale),
 * X-offset positioning (photoOffsetX), Y-offset positioning (photoOffsetY), and image crop controls.
 */
export const PlayerImageUploader = ({
  photoUrl = '',
  photoScale = 1,
  photoOffsetX = 0,
  photoOffsetY = 0,
  onChangePhoto,
  onChangePhotoScale,
  onChangePhotoOffsetX,
  onChangePhotoOffsetY,
  onChange,
  playerName = 'Player',
  playerPosition = 'ST'
}) => {
  const [scale, setScale] = useState(photoScale || 1);
  const [offsetX, setOffsetX] = useState(photoOffsetX || 0);
  const [offsetY, setOffsetY] = useState(photoOffsetY || 0);
  const [alertConfig, setAlertConfig] = useState(null);
  const photoInputRef = useRef(null);

  useEffect(() => {
    if (photoScale !== undefined && photoScale !== scale) setScale(photoScale);
    if (photoOffsetX !== undefined && photoOffsetX !== offsetX) setOffsetX(photoOffsetX);
    if (photoOffsetY !== undefined && photoOffsetY !== offsetY) setOffsetY(photoOffsetY);
  }, [photoScale, photoOffsetX, photoOffsetY]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleScaleChange = useCallback((val) => {
    setScale(val);
    onChangePhotoScale?.(val);
  }, [onChangePhotoScale]);

  const handleOffsetXChange = useCallback((val) => {
    setOffsetX(val);
    onChangePhotoOffsetX?.(val);
  }, [onChangePhotoOffsetX]);

  const handleOffsetYChange = useCallback((val) => {
    setOffsetY(val);
    onChangePhotoOffsetY?.(val);
  }, [onChangePhotoOffsetY]);

  const handleResetAlignment = useCallback(() => {
    handleScaleChange(1.0);
    handleOffsetXChange(0);
    handleOffsetYChange(0);
  }, [handleScaleChange, handleOffsetXChange, handleOffsetYChange]);

  const notifyPhotoChange = useCallback((dataUrl) => {
    if (onChangePhoto) {
      onChangePhoto(dataUrl);
    } else if (onChange) {
      onChange(dataUrl);
    }
  }, [onChangePhoto, onChange]);

  const handleFile = useCallback((file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setAlertConfig({
        title: 'Invalid File Format',
        message: 'Please upload a valid image file (PNG, JPG, WEBP).',
        type: 'danger'
      });
      return;
    }

    // Automatically downscale and compress to lightweight WebP (~30KB) to prevent QuotaExceededError
    compressImageFile(file, 500, 0.82)
      .then((compressedDataUrl) => {
        notifyPhotoChange(compressedDataUrl);
      })
      .catch((err) => {
        console.warn('Compression failed, falling back to FileReader:', err);
        const reader = new FileReader();
        reader.onload = (e) => notifyPhotoChange(e.target.result);
        reader.readAsDataURL(file);
      });
  }, [notifyPhotoChange]);

  const triggerPhotoSelect = useCallback(() => {
    photoInputRef.current?.click();
  }, []);

  const clearPhoto = useCallback(() => {
    notifyPhotoChange('');
  }, [notifyPhotoChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Hidden File Input always mounted so Change / Upload works reliably */}
      <input
        ref={photoInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
            e.target.value = '';
          }
        }}
        style={{ display: 'none' }}
        id="player-photo-input"
      />

      {photoUrl ? (
        <div style={{
          background: '#060811',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: 12,
          padding: 14,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          height: '100%'
        }}>
          {/* Card Preview with Player Photo */}
          <div style={{ flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 4, background: '#090d16' }}>
            <EFootballCard 
              player={{
                name: playerName || 'Preview',
                position: playerPosition || 'ST',
                photoUrl: photoUrl,
                photoScale: scale,
                photoOffsetX: offsetX,
                photoOffsetY: offsetY,
                basePrice: 100
              }}
              size="sm"
            />
          </div>

          {/* Photo Alignment & Scale Controls */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Photo Alignment & Scale
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  type="button"
                  onClick={triggerPhotoSelect}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 4,
                    color: '#cbd5e1',
                    cursor: 'pointer',
                    padding: '2px 6px',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3
                  }}
                  title="Change Photo"
                >
                  <Upload size={10} /> Change
                </button>
                <button
                  type="button"
                  onClick={clearPhoto}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 3 }}
                  title="Remove Photo"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {/* Control 1: Zoom Scale */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <ZoomIn size={12} color="#f59e0b" /> Zoom Scale
                </span>
                <span style={{ color: '#f59e0b', fontFamily: 'monospace', fontSize: 10 }}>{Math.round(scale * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={scale}
                onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: '#f59e0b', cursor: 'pointer', height: 5 }}
              />
            </div>

            {/* Control 2: Horizontal Offset (X) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MoveHorizontal size={12} color="#38bdf8" /> Align Left / Right (X)
                </span>
                <span style={{ color: '#38bdf8', fontFamily: 'monospace', fontSize: 10 }}>{offsetX}px</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                step="2"
                value={offsetX}
                onChange={(e) => handleOffsetXChange(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#38bdf8', cursor: 'pointer', height: 5 }}
              />
            </div>

            {/* Control 3: Vertical Offset (Y) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MoveVertical size={12} color="#22c55e" /> Align Up / Down (Y)
                </span>
                <span style={{ color: '#22c55e', fontFamily: 'monospace', fontSize: 10 }}>{offsetY}px</span>
              </div>
              <input
                type="range"
                min="-80"
                max="80"
                step="2"
                value={offsetY}
                onChange={(e) => handleOffsetYChange(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: '#22c55e', cursor: 'pointer', height: 5 }}
              />
            </div>

            {/* Reset Button */}
            <button
              type="button"
              onClick={handleResetAlignment}
              style={{
                alignSelf: 'flex-start',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 9,
                fontWeight: 700,
                color: '#94a3b8',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 4,
                padding: '3px 8px',
                cursor: 'pointer',
                marginTop: 2
              }}
            >
              <RefreshCw size={10} /> Reset Alignment
            </button>
          </div>
        </div>
      ) : (
        <div style={{
          background: '#060811',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 12,
          padding: 14,
          display: 'flex',
          gap: 14,
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
          height: '100%'
        }}>
          {/* Live Card Preview with Built-in Silhouette */}
          <div style={{ flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 4, background: '#090d16' }}>
            <EFootballCard 
              player={{
                name: playerName || 'New Player',
                position: playerPosition || 'ST',
                basePrice: 100
              }}
              size="sm"
            />
          </div>

          {/* Clean Dropzone on the right */}
          <div
            onClick={triggerPhotoSelect}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
            style={{
              flex: 1,
              height: '100%',
              minHeight: 286,
              border: '2px dashed rgba(245,158,11,0.35)',
              background: 'rgba(6,8,17,0.7)',
              borderRadius: 8,
              padding: '20px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#f59e0b'; e.currentTarget.style.background = 'rgba(245,158,11,0.06)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.35)'; e.currentTarget.style.background = 'rgba(6,8,17,0.7)'; }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px', color: '#f59e0b' }}>
              <Upload size={20} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Upload Player Photo
            </span>
            <span style={{ fontSize: 9, color: '#94a3b8', display: 'block', marginTop: 4 }}>
              Click or drag & drop image
            </span>
            <span style={{ fontSize: 8, color: '#64748b', display: 'block', marginTop: 2 }}>
              PNG, JPG, WEBP
            </span>
          </div>
        </div>
      )}

      {/* Broadcast Alert Modal */}
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
