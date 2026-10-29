import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, RotateCcw, Image as ImageIcon, Video, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { mediaStorage } from '../../services/mediaStorage';

export const ProjectorScreenCustomization = () => {
  const navigate = useNavigate();
  const defaultSettings = storageService.getProjectorSettings();

  const [settings, setSettings] = useState({
    bgImage: '',
    bgFilter1: '#060503',
    bgFilter2: '#1c1404',
    bgFilterOpacity1: 85,
    bgFilterOpacity2: 90,
    panelBgColor: '#000000',
    panelBgOpacity: 50,
    panelBorderColor: '#ffffff',
    panelBorderOpacity: 10,
    ambientShadowOpacity: 20,
    ...defaultSettings
  });

  const [saved, setSaved] = useState(false);

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    storageService.saveProjectorSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all projector visuals to default?')) {
      const reset = {
        ...settings,
        bgImage: '',
        bgFilter1: '#060503',
        bgFilter2: '#1c1404',
        bgFilterOpacity1: 85,
        bgFilterOpacity2: 90,
        panelBgColor: '#000000',
        panelBgOpacity: 50,
        panelBorderColor: '#ffffff',
        panelBorderOpacity: 10,
        ambientShadowOpacity: 20,
      };
      setSettings(reset);
      storageService.saveProjectorSettings(reset);
    }
  };

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(file.name)) {
      mediaStorage.saveMedia('home_main_media', file).then(() => {
        handleChange('homeMediaCustom', true);
        handleChange('homeMediaName', file.name);
        handleChange('homeMediaType', 'video');
        handleChange('homeMediaFullScreen', true);
      });
      return;
    }

    // If image, save to IndexedDB as well for large sizes
    mediaStorage.saveMedia('home_main_media', file).then(() => {
      handleChange('homeMediaCustom', true);
      handleChange('homeMediaName', file.name);
      handleChange('homeMediaType', 'image');
      handleChange('homeMediaFullScreen', true);
    });

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1920;
        const MAX_HEIGHT = 1080;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        handleChange('bgImage', dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Convert hex to rgb string for the preview
  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '0,0,0';
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'var(--spl-black)' }}>
      {/* HEADER */}
      <div className="shrink-0 flex flex-wrap items-center justify-between px-4 sm:px-8 py-4 gap-3" style={{ background: 'var(--spl-navy)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 rounded hover:bg-slate-800 transition-colors" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>Projector Customization</h1>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live Screen Aesthetics</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleReset} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', background: 'transparent' }}>
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSave} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#fff', background: saved ? '#22C55E' : 'var(--spl-blue)', transition: 'background 0.2s' }}>
            <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Theme'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden">
        {/* LEFT PANEL: CONTROLS */}
        <div className="w-full lg:w-[450px] shrink-0 overflow-y-auto border-b lg:border-b-0 lg:border-r border-[var(--border-subtle)] bg-[var(--spl-navy)]">
          <div className="p-4 sm:p-6 flex flex-col gap-6 sm:gap-8 pb-28 lg:pb-8">
            
            {/* Background Image & Video */}
            <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
              <div className="flex items-center justify-between mb-4">
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                  Background Image / Video
                </h3>
                {settings.homeMediaCustom && (
                  <button
                    onClick={async () => {
                      await mediaStorage.deleteMedia('home_main_media');
                      handleChange('homeMediaCustom', false);
                      handleChange('homeMediaName', '');
                      handleChange('homeMediaType', 'none');
                      handleChange('bgImage', '');
                    }}
                    style={{ fontSize: 11, color: '#F87171', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove Media
                  </button>
                )}
              </div>
              <div className="flex gap-4">
                <input 
                  type="text" 
                  value={settings.bgImage || ''} 
                  onChange={e => handleChange('bgImage', e.target.value)}
                  placeholder="https://... (Leave blank for default stadium)"
                  style={{ flex: 1, padding: '10px 14px', background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none' }}
                />
                <label
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 16px', background: 'var(--spl-blue)', color: '#fff',
                    borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                    transition: 'opacity 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                >
                  <Video className="w-4 h-4 mr-2" /> Upload
                  <input type="file" accept="image/*,video/*" onChange={handleMediaUpload} style={{ display: 'none' }} />
                </label>
              </div>
              {settings.homeMediaCustom && (
                <div className="mt-2 text-xs text-emerald-400 font-bold">
                  ✓ Active Full Screen {settings.homeMediaType === 'video' ? 'Video' : 'Image'}: {settings.homeMediaName}
                </div>
              )}
            </div>

            {/* Gradient Overlay */}
            <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Dark Overlay Gradient</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Top-Left Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={settings.bgFilter1} onChange={e => handleChange('bgFilter1', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <input type="text" value={settings.bgFilter1} onChange={e => handleChange('bgFilter1', e.target.value)} style={{ flex: 1, background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 12, width: '100%' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Opacity: {settings.bgFilterOpacity1}%</label>
                  <input type="range" min="0" max="100" value={settings.bgFilterOpacity1} onChange={e => handleChange('bgFilterOpacity1', parseInt(e.target.value))} className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Bottom-Right Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={settings.bgFilter2} onChange={e => handleChange('bgFilter2', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                    <input type="text" value={settings.bgFilter2} onChange={e => handleChange('bgFilter2', e.target.value)} style={{ flex: 1, background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 4, padding: '4px 8px', color: '#fff', fontSize: 12, width: '100%' }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Opacity: {settings.bgFilterOpacity2}%</label>
                  <input type="range" min="0" max="100" value={settings.bgFilterOpacity2} onChange={e => handleChange('bgFilterOpacity2', parseInt(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>

            {/* Ambient Shadows & Panels */}
            <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Panels & Shadows</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Panel Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={settings.panelBgColor} onChange={e => handleChange('panelBgColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Panel Opacity: {settings.panelBgOpacity}%</label>
                  <input type="range" min="0" max="100" value={settings.panelBgOpacity} onChange={e => handleChange('panelBgOpacity', parseInt(e.target.value))} className="w-full" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Border Color</label>
                  <div className="flex gap-2 items-center">
                    <input type="color" value={settings.panelBorderColor} onChange={e => handleChange('panelBorderColor', e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Border Opacity: {settings.panelBorderOpacity}%</label>
                  <input type="range" min="0" max="100" value={settings.panelBorderOpacity} onChange={e => handleChange('panelBorderOpacity', parseInt(e.target.value))} className="w-full" />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Glow / Shadow Intensity: {settings.ambientShadowOpacity}%</label>
                <input type="range" min="0" max="100" value={settings.ambientShadowOpacity} onChange={e => handleChange('ambientShadowOpacity', parseInt(e.target.value))} className="w-full" />
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW */}
        <div className="flex-1 relative overflow-hidden min-h-[380px] lg:min-h-0" style={{ background: '#000' }}>
          
          {/* Background Image & Filter Preview */}
          <div 
            className="absolute inset-0"
            style={{ 
              backgroundImage: settings.bgImage ? `linear-gradient(135deg, rgba(${hexToRgb(settings.bgFilter1)},${settings.bgFilterOpacity1/100}) 0%, rgba(${hexToRgb(settings.bgFilter2)},${settings.bgFilterOpacity2/100}) 100%), url('${settings.bgImage}')` : `linear-gradient(135deg, rgba(${hexToRgb(settings.bgFilter1)},${settings.bgFilterOpacity1/100}) 0%, rgba(${hexToRgb(settings.bgFilter2)},${settings.bgFilterOpacity2/100}) 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />

          {/* Fake Projector Content to show Panels */}
          <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8 md:p-12">
            
            <div 
              style={{ 
                width: '100%', 
                maxWidth: 900, 
                maxHeight: '90%',
                background: `rgba(${hexToRgb(settings.panelBgColor)},${settings.panelBgOpacity/100})`, 
                border: `1px solid rgba(${hexToRgb(settings.panelBorderColor)},${settings.panelBorderOpacity/100})`,
                borderRadius: 20,
                boxShadow: `0 20px 60px rgba(0,0,0,${settings.ambientShadowOpacity/100}), 0 0 100px rgba(14,165,233,${(settings.ambientShadowOpacity/100)*0.3})`,
                display: 'flex',
                flexDirection: 'column',
                padding: 'clamp(16px, 3vw, 40px)',
                position: 'relative',
                backdropFilter: 'blur(10px)'
              }}
            >
               <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, color: '#fff', marginBottom: 20 }}>Live Screen Preview</h2>
               <div style={{ flex: 1, display: 'flex', gap: 20 }}>
                  <div style={{ flex: 1, background: `rgba(${hexToRgb(settings.panelBgColor)},${settings.panelBgOpacity/100})`, border: `1px solid rgba(${hexToRgb(settings.panelBorderColor)},${settings.panelBorderOpacity/100})`, borderRadius: 12 }}></div>
                  <div style={{ flex: 1, background: `rgba(${hexToRgb(settings.panelBgColor)},${settings.panelBgOpacity/100})`, border: `1px solid rgba(${hexToRgb(settings.panelBorderColor)},${settings.panelBorderOpacity/100})`, borderRadius: 12 }}></div>
               </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
