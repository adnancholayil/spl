import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, X, ZoomIn, MoveHorizontal, MoveVertical, RefreshCw } from 'lucide-react';
import { EFootballCard } from './EFootballCard';
import { ConfirmModal } from './ConfirmModal';

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

    const reader = new FileReader();
    reader.onload = (e) => notifyPhotoChange(e.target.result);
    reader.readAsDataURL(file);
  }, [notifyPhotoChange]);

  const triggerPhotoSelect = useCallback(() => {
    photoInputRef.current?.click();
  }, []);

  const clearPhoto = useCallback(() => {
    notifyPhotoChange('');
  }, [notifyPhotoChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {photoUrl ? (
          <div style={{
            background: '#060811',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: 12,
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)'
          }}>
            {/* Top Row: Mini Card Preview + Header */}
            <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
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

              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Photo Alignment & Scale
                  </span>
                  <button
                    type="button"
                    onClick={clearPhoto}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}
                    title="Remove Photo"
                  >
                    <X size={16} />
                  </button>
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
          </div>
        ) : (
          <div
            onClick={triggerPhotoSelect}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && handleFile(e.dataTransfer.files[0]); }}
            style={{
              border: '2px dashed rgba(245,158,11,0.4)',
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
              id="photo-input"
            />
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px', color: '#f59e0b' }}>
              <Upload size={20} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#fff', display: 'block', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Upload Main Profile Photo
            </span>
            <span style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginTop: 2 }}>
              Click or drag & drop (PNG, JPG, WEBP)
            </span>
          </div>
        )
      }

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
