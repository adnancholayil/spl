import React, { useState, useEffect, useCallback, useRef } from 'react';
import { storageService } from '../../services/storageService';
import { EFootballCard } from '../../components/common/EFootballCard';
import { MysteryCardBack } from '../../components/projector/PlayerCardShowcase';
import { RotateCcw, Save, CheckCircle2, Undo, Redo, RefreshCcw } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const DEFAULT_CARD_THEME = {
  bgGrad1: '#fff3c2',
  bgGrad2: '#e6b856',
  bgGrad3: '#c29029',
  bgGrad4: '#4a3206',
  border1: '#fff4cc',
  border2: '#e6c265',
  border3: '#523403',
  textDark: '#1c1505',
  textLight: '#ffffff',
  accent: '#fff',
  layoutRatingX: 55,
  layoutRatingY: 90,
  layoutNameY: 280,
  layoutNameFontSize: 40,
  layoutRatingSize: 52,
  layoutPositionSize: 18,
  layoutStatNumSize: 18,
  layoutStatLabelSize: 18,
  layoutLogoScale: 100,
  cardShape: 'eafc24',
  layoutStatsY: 315,
  layoutStatsGapX: 40,
  layoutStatsGapY: 30,
  showRating: true,
  showLogos: true,
  showName: true,
  showStats: true,
};

const ColorInput = ({ label, objectKey, theme, handleChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
      {label}
    </label>
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '4px 8px' }}>
      <input
        type="color"
        value={theme[objectKey] || '#000000'}
        onChange={(e) => handleChange(objectKey, e.target.value)}
        style={{ width: 24, height: 24, padding: 0, border: 'none', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
      />
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#fff' }}>{theme[objectKey]}</span>
    </div>
  </div>
);

const NumberInput = ({ label, objectKey, min, max, theme, handleChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <label style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
        {label}
      </label>
      <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--spl-blue-light)' }}>{theme[objectKey]}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      value={theme[objectKey] ?? 0}
      onChange={(e) => handleChange(objectKey, parseInt(e.target.value, 10))}
      style={{ width: '100%', accentColor: 'var(--spl-blue-light)', height: 4, cursor: 'pointer' }}
    />
  </div>
);

const ToggleInput = ({ label, objectKey, theme, handleChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', padding: '6px 0' }}>
    <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
      {label}
    </span>
    <input
      type="checkbox"
      checked={theme[objectKey] !== false}
      onChange={(e) => handleChange(objectKey, e.target.checked)}
      style={{ width: 16, height: 16, accentColor: 'var(--spl-blue-light)', cursor: 'pointer' }}
    />
  </label>
);

export const CardCustomization = () => {
  const [theme, setTheme] = useState(DEFAULT_CARD_THEME);
  const [savedTheme, setSavedTheme] = useState(DEFAULT_CARD_THEME);
  const [isSaving, setIsSaving] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [showBack, setShowBack] = useState(false);
  const [activeTab, setActiveTab] = useState('theme'); // 'theme', 'layout', 'visibility'
  
  const [history, setHistory] = useState({ past: [], future: [] });
  const commitTimeout = useRef(null);
  const lastCommittedTheme = useRef(DEFAULT_CARD_THEME);

  const hasChanges = JSON.stringify(theme) !== JSON.stringify(savedTheme);

  useEffect(() => {
    const loaded = storageService.getCardTheme();
    setTheme(loaded);
    setSavedTheme(loaded);
    lastCommittedTheme.current = loaded;
  }, []);

  const pushToHistory = useCallback((newTheme) => {
    setHistory(prev => ({
      past: [...prev.past, lastCommittedTheme.current],
      future: []
    }));
    lastCommittedTheme.current = newTheme;
  }, []);

  const handleChange = (key, value) => {
    setTheme(prev => {
      const next = { ...prev, [key]: value };
      if (commitTimeout.current) clearTimeout(commitTimeout.current);
      commitTimeout.current = setTimeout(() => {
        pushToHistory(next);
      }, 500);
      return next;
    });
  };

  const handleUndo = useCallback(() => {
    if (commitTimeout.current) clearTimeout(commitTimeout.current);
    setHistory(prev => {
      if (prev.past.length === 0) return prev;
      const previousTheme = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, prev.past.length - 1);
      
      setTheme(previousTheme);
      lastCommittedTheme.current = previousTheme;
      
      return {
        past: newPast,
        future: [theme, ...prev.future]
      };
    });
  }, [theme]);

  const handleRedo = useCallback(() => {
    if (commitTimeout.current) clearTimeout(commitTimeout.current);
    setHistory(prev => {
      if (prev.future.length === 0) return prev;
      const nextTheme = prev.future[0];
      const newFuture = prev.future.slice(1);
      
      setTheme(nextTheme);
      lastCommittedTheme.current = nextTheme;
      
      return {
        past: [...prev.past, theme],
        future: newFuture
      };
    });
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const handleApply = () => {
    if (!hasChanges) return;
    storageService.saveCardTheme(theme);
    setSavedTheme(theme);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  const handleResetColors = () => {
    const updatedTheme = {
      ...theme,
      bgGrad1: DEFAULT_CARD_THEME.bgGrad1,
      bgGrad2: DEFAULT_CARD_THEME.bgGrad2,
      bgGrad3: DEFAULT_CARD_THEME.bgGrad3,
      bgGrad4: DEFAULT_CARD_THEME.bgGrad4,
      border1: DEFAULT_CARD_THEME.border1,
      border2: DEFAULT_CARD_THEME.border2,
      border3: DEFAULT_CARD_THEME.border3,
      textDark: DEFAULT_CARD_THEME.textDark,
      textLight: DEFAULT_CARD_THEME.textLight,
      accent: DEFAULT_CARD_THEME.accent,
    };
    if (commitTimeout.current) clearTimeout(commitTimeout.current);
    pushToHistory(updatedTheme);
    setTheme(updatedTheme);
    storageService.saveCardTheme(updatedTheme);
    setModalConfig({
      isOpen: true,
      title: 'Colors Reset',
      message: 'Card theme colors have been reset to default.',
      type: 'success'
    });
  };

  const handleResetLayout = () => {
    const updatedTheme = {
      ...theme,
      layoutRatingX: DEFAULT_CARD_THEME.layoutRatingX,
      layoutRatingY: DEFAULT_CARD_THEME.layoutRatingY,
      layoutNameY: DEFAULT_CARD_THEME.layoutNameY,
      layoutNameFontSize: DEFAULT_CARD_THEME.layoutNameFontSize,
      layoutStatsY: DEFAULT_CARD_THEME.layoutStatsY,
      layoutStatsGapX: DEFAULT_CARD_THEME.layoutStatsGapX,
      layoutStatsGapY: DEFAULT_CARD_THEME.layoutStatsGapY,
      layoutRatingSize: DEFAULT_CARD_THEME.layoutRatingSize,
      layoutPositionSize: DEFAULT_CARD_THEME.layoutPositionSize,
      layoutStatNumSize: DEFAULT_CARD_THEME.layoutStatNumSize,
      layoutStatLabelSize: DEFAULT_CARD_THEME.layoutStatLabelSize,
      layoutLogoScale: DEFAULT_CARD_THEME.layoutLogoScale,
      layoutImageX: DEFAULT_CARD_THEME.layoutImageX,
      layoutImageY: DEFAULT_CARD_THEME.layoutImageY,
      layoutImageW: DEFAULT_CARD_THEME.layoutImageW,
      layoutImageH: DEFAULT_CARD_THEME.layoutImageH,
      layoutImageFadeY: DEFAULT_CARD_THEME.layoutImageFadeY,
      layoutShadowY: DEFAULT_CARD_THEME.layoutShadowY,
      layoutShadowOpacity: DEFAULT_CARD_THEME.layoutShadowOpacity,
      cardShape: DEFAULT_CARD_THEME.cardShape,
      showRating: DEFAULT_CARD_THEME.showRating,
      showLogos: DEFAULT_CARD_THEME.showLogos,
      showName: DEFAULT_CARD_THEME.showName,
      showStats: DEFAULT_CARD_THEME.showStats,
      frontSideDesign: DEFAULT_CARD_THEME.frontSideDesign,
      backSideDesign: DEFAULT_CARD_THEME.backSideDesign,
      backSideLogoY: DEFAULT_CARD_THEME.backSideLogoY,
      backSideLogoScale: DEFAULT_CARD_THEME.backSideLogoScale,
      showBackSideLogo: DEFAULT_CARD_THEME.showBackSideLogo,
      backSideTextY: DEFAULT_CARD_THEME.backSideTextY,
      backSideTextSize: DEFAULT_CARD_THEME.backSideTextSize,
      showBackSideText: DEFAULT_CARD_THEME.showBackSideText,
    };
    if (commitTimeout.current) clearTimeout(commitTimeout.current);
    pushToHistory(updatedTheme);
    setTheme(updatedTheme);
    storageService.saveCardTheme(updatedTheme);
    setModalConfig({
      isOpen: true,
      title: 'Layout Reset',
      message: 'Card layout and visibility have been reset to default.',
      type: 'success'
    });
  };

  const demoPlayer = {
    name: 'CUSTOM PLAYER',
    position: 'ST',
    overallRating: 99,
    stats: { pac: 99, sho: 99, pas: 99, dri: 99, def: 99, phy: 99 },
    countryFlag: '/assets/flag.png', // Fallback to transparent or default
    clubLogo: '/assets/logo.png',
    photoUrl: '/assets/players/roony.png',
  };

  const applyPreset = (presetName) => {
    const presets = {
      GOLD: { bgGrad1: '#fff3c2', bgGrad2: '#e6b856', bgGrad3: '#c29029', bgGrad4: '#4a3206', border1: '#fff4cc', border2: '#e6c265', border3: '#523403', textDark: '#1c1505', textLight: '#ffffff', accent: '#fff' },
      SILVER: { bgGrad1: '#ffffff', bgGrad2: '#cbd5e1', bgGrad3: '#94a3b8', bgGrad4: '#1e293b', border1: '#ffffff', border2: '#e2e8f0', border3: '#334155', textDark: '#0f172a', textLight: '#ffffff', accent: '#fff' },
      ICON: { bgGrad1: '#ffffff', bgGrad2: '#f4ebd0', bgGrad3: '#dcd0a8', bgGrad4: '#4d401a', border1: '#ffffff', border2: '#f4ebd0', border3: '#4d401a', textDark: '#1a1a1a', textLight: '#ffffff', accent: '#d4af37' },
      DARK: { bgGrad1: '#38bdf8', bgGrad2: '#0ea5e9', bgGrad3: '#0f172a', bgGrad4: '#020617', border1: '#7dd3fc', border2: '#38bdf8', border3: '#0f172a', textDark: '#ffffff', textLight: '#ffffff', accent: '#38bdf8' },
      PINK: { bgGrad1: '#ffb3e6', bgGrad2: '#ff33bb', bgGrad3: '#b30077', bgGrad4: '#330022', border1: '#ffcceb', border2: '#ff80d5', border3: '#4d002e', textDark: '#ffffff', textLight: '#ffffff', accent: '#ffb3e6' },
    };
    if (presets[presetName]) {
      const newTheme = { ...theme, ...presets[presetName] };
      if (commitTimeout.current) clearTimeout(commitTimeout.current);
      pushToHistory(newTheme);
      setTheme(newTheme);
    }
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1600, margin: '0 auto', display: 'flex', gap: 40, height: '100%' }}>
      
      {/* LEFT: Controls */}
      <div style={{ flex: 1, maxWidth: 600, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase' }}>
                AESTHETICS & DESIGN
              </div>
              <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff', lineHeight: 0.95, textTransform: 'uppercase' }}>
                Player Card Studio
              </h1>
              <p style={{ color: 'var(--text-secondary)', marginTop: 12, fontSize: 14 }}>
                100% customize the primary card theme used across the projector screen and admin panel. Changes apply in real-time.
              </p>
            </div>
            
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleUndo}
                disabled={history.past.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                  background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
                  borderRadius: 8, color: history.past.length === 0 ? 'var(--text-muted)' : '#fff',
                  fontSize: 12, fontWeight: 600, cursor: history.past.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: history.past.length === 0 ? 0.5 : 1
                }}
                title="Undo (Ctrl+Z)"
              >
                <Undo size={14} /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={history.future.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px',
                  background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
                  borderRadius: 8, color: history.future.length === 0 ? 'var(--text-muted)' : '#fff',
                  fontSize: 12, fontWeight: 600, cursor: history.future.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: history.future.length === 0 ? 0.5 : 1
                }}
                title="Redo (Ctrl+Y)"
              >
                <Redo size={14} /> Redo
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 12 }}>
          {['theme', 'layout', 'visibility'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '8px 16px',
                background: activeTab === tab ? 'var(--spl-blue)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-secondary)',
                border: '1px solid',
                borderColor: activeTab === tab ? 'var(--spl-blue-light)' : 'transparent',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab === 'theme' ? 'Colors & Theme' : tab === 'layout' ? 'Layout & Sizes' : 'Visibility'}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 24 }}>
          
          {/* TAB 1: THEME & COLORS */}
          {activeTab === 'theme' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Presets */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Color Presets</h3>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  {['GOLD', 'SILVER', 'ICON', 'DARK', 'PINK'].map(p => (
                    <button key={p} onClick={() => applyPreset(p)} style={{ fontSize: 12, fontWeight: 600, padding: '8px 16px', background: 'var(--spl-elevated)', border: '1px solid var(--border-default)', borderRadius: 6, color: '#fff', cursor: 'pointer', transition: 'background 0.2s' }}>{p}</button>
                  ))}
                </div>
              </div>

              {/* Design Templates */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Card Shape</h3>
                  <select value={theme.cardShape || 'eafc24'} onChange={(e) => handleChange('cardShape', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                    <option value="eafc24">EA FC 24 (Sharp)</option>
                    <option value="shield">Classic Shield</option>
                    <option value="classic">Rounded Rect</option>
                    <option value="notched">Notched Octagon</option>
                    <option value="hex">Sharp Hexagon</option>
                    <option value="cyber">Cyber Cutout</option>
                  </select>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Front Template</h3>
                  <select value={theme.frontSideDesign || 'geometric'} onChange={(e) => handleChange('frontSideDesign', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                    <option value="geometric">Geometric</option>
                    <option value="modern">Modern Hex</option>
                    <option value="organic">Organic Waves</option>
                    <option value="circuit">Cyber Circuit</option>
                    <option value="carbon">Carbon Fiber</option>
                    <option value="halftone">Comic Halftone</option>
                    <option value="topo">Topo Map</option>
                    <option value="minimal">Minimalist</option>
                  </select>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Back Template</h3>
                  <select value={theme.backSideDesign || 'geometric'} onChange={(e) => handleChange('backSideDesign', e.target.value)} style={{ width: '100%', padding: '10px 14px', background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, color: '#fff', fontSize: 13, cursor: 'pointer', outline: 'none' }}>
                    <option value="geometric">Geometric</option>
                    <option value="modern">Modern Hex</option>
                    <option value="organic">Organic Waves</option>
                    <option value="circuit">Cyber Circuit</option>
                    <option value="carbon">Carbon Fiber</option>
                    <option value="halftone">Comic Halftone</option>
                    <option value="topo">Topo Map</option>
                    <option value="minimal">Minimalist</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Background Gradients</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <ColorInput label="Top Left" objectKey="bgGrad1" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Upper Mid" objectKey="bgGrad2" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Lower Mid" objectKey="bgGrad3" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Bottom Right" objectKey="bgGrad4" theme={theme} handleChange={handleChange} />
                  </div>
                </div>

                <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Borders & Text</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <ColorInput label="Highlight" objectKey="border1" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Mid Tone" objectKey="border2" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Shadow" objectKey="border3" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Main Text" objectKey="textDark" theme={theme} handleChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LAYOUT & SIZES */}
          {activeTab === 'layout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Image & Shadow Layout</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <NumberInput label="Image X Offset" objectKey="layoutImageX" min={-100} max={200} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Image Y Offset" objectKey="layoutImageY" min={-150} max={200} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Image Width" objectKey="layoutImageW" min={100} max={500} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Image Height" objectKey="layoutImageH" min={100} max={500} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Photo Fade Start (%)" objectKey="layoutImageFadeY" min={10} max={100} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Shadow Height (Y)" objectKey="layoutShadowY" min={100} max={400} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Shadow Opacity (%)" objectKey="layoutShadowOpacity" min={0} max={100} theme={theme} handleChange={handleChange} />
                </div>
              </div>

              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Text & Stats Alignment</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <NumberInput label="Rating X" objectKey="layoutRatingX" min={10} max={150} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Rating Y" objectKey="layoutRatingY" min={20} max={200} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Name Y" objectKey="layoutNameY" min={200} max={350} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stats Grid Y" objectKey="layoutStatsY" min={250} max={380} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stats Gap X" objectKey="layoutStatsGapX" min={20} max={80} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stats Gap Y" objectKey="layoutStatsGapY" min={15} max={50} theme={theme} handleChange={handleChange} />
                </div>
              </div>

              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Font Sizes & Scales</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                  <NumberInput label="OVR Text Size" objectKey="layoutRatingSize" min={24} max={80} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Position Size" objectKey="layoutPositionSize" min={10} max={32} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Player Name Size" objectKey="layoutNameFontSize" min={20} max={60} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stat Numbers Size" objectKey="layoutStatNumSize" min={10} max={32} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stat Labels Size" objectKey="layoutStatLabelSize" min={10} max={32} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Logos Scale (%)" objectKey="layoutLogoScale" min={50} max={200} theme={theme} handleChange={handleChange} />
                </div>
              </div>

              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Backside Controls</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                  <NumberInput label="Backside Logo Y" objectKey="backSideLogoY" min={50} max={350} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Backside Logo Scale" objectKey="backSideLogoScale" min={50} max={200} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Backside Text Y" objectKey="backSideTextY" min={200} max={400} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Backside Text Size" objectKey="backSideTextSize" min={10} max={40} theme={theme} handleChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VISIBILITY */}
          {activeTab === 'visibility' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Frontside Elements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ToggleInput label="Show Rating & Position" objectKey="showRating" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Show Player Name" objectKey="showName" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Show Stats Grid" objectKey="showStats" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Show Nation & League Logos" objectKey="showLogos" theme={theme} handleChange={handleChange} />
                </div>
              </div>

              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 16, textTransform: 'uppercase' }}>Backside Elements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <ToggleInput label="Show Backside Emblem" objectKey="showBackSideLogo" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Show Backside League Text" objectKey="showBackSideText" theme={theme} handleChange={handleChange} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ paddingTop: 24, marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 12 }}>
          <button
            onClick={handleResetColors}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: 6,
              padding: '14px', background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
              borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--spl-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--spl-panel)'}
          >
            <RotateCcw className="w-4 h-4" /> Reset Colors
          </button>

          <button
            onClick={handleResetLayout}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: 6,
              padding: '14px', background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
              borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--spl-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--spl-panel)'}
          >
            <RotateCcw className="w-4 h-4" /> Reset Layout
          </button>
          
          <button
            onClick={handleApply}
            disabled={!hasChanges}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: 10,
              padding: '14px', 
              background: isSaving ? '#10b981' : (hasChanges ? 'var(--spl-blue)' : 'var(--spl-panel)'), 
              border: `1px solid ${isSaving ? '#059669' : (hasChanges ? 'var(--spl-blue-light)' : 'var(--border-default)')}`,
              borderRadius: 8, 
              color: hasChanges || isSaving ? '#fff' : 'var(--text-muted)', 
              fontSize: 14, fontWeight: 600, 
              cursor: hasChanges ? 'pointer' : 'not-allowed',
              opacity: hasChanges || isSaving ? 1 : 0.5,
              transition: 'all 0.2s ease-in-out'
            }}
            onMouseEnter={e => { if (hasChanges && !isSaving) e.currentTarget.style.background = '#2563EB' }}
            onMouseLeave={e => { if (hasChanges && !isSaving) e.currentTarget.style.background = 'var(--spl-blue)' }}
            onMouseDown={e => { if (hasChanges && !isSaving) e.currentTarget.style.transform = 'scale(0.98)' }}
            onMouseUp={e => { if (hasChanges && !isSaving) e.currentTarget.style.transform = 'scale(1)' }}
          >
            {isSaving ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Settings Applied!' : (hasChanges ? 'Apply Settings' : 'No Changes')}
          </button>
        </div>
      </div>

      {/* RIGHT: Live Preview */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 16, padding: 40, position: 'relative' }}>
        <button
          onClick={() => setShowBack(p => !p)}
          style={{
            position: 'absolute', top: 20, right: 20,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', background: 'var(--spl-elevated)', border: '1px solid var(--border-default)',
            borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.2s', zIndex: 10
          }}
        >
          <RefreshCcw className="w-4 h-4" /> Flip Card ({showBack ? 'Front' : 'Back'})
        </button>

        <div style={{ transform: 'scale(1.2)' }}>
          {showBack ? (
            <MysteryCardBack size="lg" customTheme={theme} />
          ) : (
            <EFootballCard player={demoPlayer} size="lg" customThemeOverride={theme} isStudio={true} />
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!modalConfig}
        onClose={() => setModalConfig(null)}
        title={modalConfig?.title || ''}
        message={modalConfig?.message || ''}
        confirmText="OK"
        type={modalConfig?.type || 'info'}
        isAlert={true}
      />
    </div>
  );
};
