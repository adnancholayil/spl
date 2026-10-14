import React, { useState, useEffect, useCallback, useRef } from 'react';
import { storageService, DEFAULT_CARD_THEME, DEFAULT_GK_CARD_THEME } from '../../services/storageService';
import { EFootballCard } from '../../components/common/EFootballCard';
import { MysteryCardBack } from '../../components/projector/PlayerCardShowcase';
import { RotateCcw, Save, CheckCircle2, Undo, Redo, RefreshCcw, AlignCenter, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X, Sparkles, Shield, User, Palette, Layers, Eye } from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { STUDIO_ELEMENTS, STUDIO_BACK_ELEMENTS } from '../../components/common/CardStudioTransformOverlay';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';

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

const NumberInput = ({ label, objectKey, min, max, step = 1, unit = '', theme, handleChange }) => {
  const defaultVal = DEFAULT_CARD_THEME[objectKey] ?? 0;
  const rawVal = theme[objectKey] !== undefined ? theme[objectKey] : defaultVal;
  const val = typeof rawVal === 'number' ? rawVal : (step < 1 ? parseFloat(rawVal) : parseInt(rawVal, 10));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
          {label}
        </label>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--spl-blue-light)' }}>
          {val}{unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={(e) => handleChange(objectKey, step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value, 10))}
        style={{ width: '100%', accentColor: 'var(--spl-blue-light)', height: 4, cursor: 'pointer' }}
      />
    </div>
  );
};

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
  // Role selector: Outfield Player Card vs Goalkeeper (GK) Card
  const [cardRole, setCardRole] = useState('OUTFIELD'); // 'OUTFIELD' | 'GK'
  
  const [theme, setTheme] = useState(DEFAULT_CARD_THEME);
  const [savedTheme, setSavedTheme] = useState(DEFAULT_CARD_THEME);
  const [isSaving, setIsSaving] = useState(false);
  const [modalConfig, setModalConfig] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [showBack, setShowBack] = useState(false);
  const [activeTab, setActiveTab] = useState('theme'); // 'theme', 'layout', 'visibility'
  
  const [history, setHistory] = useState({ past: [], future: [] });
  const commitTimeout = useRef(null);
  const lastCommittedTheme = useRef(DEFAULT_CARD_THEME);

  const hasChanges = JSON.stringify(theme) !== JSON.stringify(savedTheme);

  // Load appropriate theme when role changes
  useEffect(() => {
    const loaded = cardRole === 'GK' ? storageService.getGkCardTheme() : storageService.getCardTheme();
    setTheme(loaded);
    setSavedTheme(loaded);
    lastCommittedTheme.current = loaded;
    setHistory({ past: [], future: [] });
  }, [cardRole]);

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

  const handleDirectThemeUpdate = useCallback((patch) => {
    setTheme(prev => ({ ...prev, ...patch }));
  }, []);

  const handleCommitDirectHistory = useCallback(() => {
    setTheme(curr => {
      pushToHistory(curr);
      return curr;
    });
  }, [pushToHistory]);

  const handleCenterSelected = useCallback(() => {
    if (!selectedElement) return;
    let patch = {};
    if (selectedElement === 'name') patch = { layoutNameX: 160 };
    else if (selectedElement === 'stats') patch = { layoutStatsX: 160 };
    else if (selectedElement === 'photo') patch = { layoutImageX: Math.round(160 - (theme.layoutImageW ?? 280) / 2) };
    else if (selectedElement === 'position') patch = { layoutPositionX: 0 };
    else if (selectedElement === 'flag' || selectedElement === 'clubLogo') patch = { layoutLogosX: 0 };
    else if (selectedElement === 'rating') patch = { layoutRatingX: 55 };
    else if (selectedElement === 'backLogo') patch = { backSideLogoX: 160 };
    else if (selectedElement === 'backText') patch = { backSideTextX: 160 };

    if (Object.keys(patch).length > 0) {
      const updated = { ...theme, ...patch };
      pushToHistory(updated);
      setTheme(updated);
    }
  }, [selectedElement, theme, pushToHistory]);

  const handleNudge = useCallback((dx, dy) => {
    if (!selectedElement) return;
    let patch = {};
    switch (selectedElement) {
      case 'rating':
        patch = {
          layoutRatingX: Math.max(0, Math.min(220, (theme.layoutRatingX ?? 55) + dx)),
          layoutRatingY: Math.max(20, Math.min(250, (theme.layoutRatingY ?? 90) + dy)),
        };
        break;
      case 'position':
        patch = {
          layoutPositionX: Math.max(-50, Math.min(50, (theme.layoutPositionX ?? 0) + dx)),
          layoutPositionGapY: Math.max(0, Math.min(80, (theme.layoutPositionGapY ?? 25) + dy)),
        };
        break;
      case 'flag':
        patch = {
          layoutLogosX: Math.max(-50, Math.min(50, (theme.layoutLogosX ?? 0) + dx)),
          layoutLogosGapY: Math.max(0, Math.min(80, (theme.layoutLogosGapY ?? 15) + dy)),
        };
        break;
      case 'clubLogo':
        patch = {
          layoutLogosX: Math.max(-50, Math.min(50, (theme.layoutLogosX ?? 0) + dx)),
          layoutClubLogoGapY: Math.max(0, Math.min(60, (theme.layoutClubLogoGapY ?? 8) + dy)),
        };
        break;
      case 'photo':
        patch = {
          layoutImageX: Math.max(-120, Math.min(220, (theme.layoutImageX ?? 40) + dx)),
          layoutImageY: Math.max(-160, Math.min(220, (theme.layoutImageY ?? 50) + dy)),
        };
        break;
      case 'name':
        patch = {
          layoutNameX: Math.max(40, Math.min(280, (theme.layoutNameX ?? 160) + dx)),
          layoutNameY: Math.max(160, Math.min(380, (theme.layoutNameY ?? 280) + dy)),
        };
        break;
      case 'stats':
        patch = {
          layoutStatsX: Math.max(40, Math.min(280, (theme.layoutStatsX ?? 160) + dx)),
          layoutStatsY: Math.max(200, Math.min(420, (theme.layoutStatsY ?? 315) + dy)),
        };
        break;
      case 'backLogo':
        patch = {
          backSideLogoX: Math.max(20, Math.min(300, (theme.backSideLogoX ?? 160) + dx)),
          backSideLogoY: Math.max(40, Math.min(350, (theme.backSideLogoY ?? 200) + dy)),
        };
        break;
      case 'backText':
        patch = {
          backSideTextX: Math.max(20, Math.min(300, (theme.backSideTextX ?? 160) + dx)),
          backSideTextY: Math.max(100, Math.min(420, (theme.backSideTextY ?? 315) + dy)),
        };
        break;
      default:
        break;
    }
    if (Object.keys(patch).length > 0) {
      const updated = { ...theme, ...patch };
      pushToHistory(updated);
      setTheme(updated);
    }
  }, [selectedElement, theme, pushToHistory]);

  const handleStepSize = useCallback((delta) => {
    if (!selectedElement) return;
    let patch = {};
    switch (selectedElement) {
      case 'rating':
        patch = { layoutRatingSize: Math.max(20, Math.min(90, (theme.layoutRatingSize ?? 52) + delta)) };
        break;
      case 'position':
        patch = { layoutPositionSize: Math.max(10, Math.min(40, (theme.layoutPositionSize ?? 18) + delta)) };
        break;
      case 'name':
        patch = { layoutNameFontSize: Math.max(16, Math.min(70, (theme.layoutNameFontSize ?? 40) + delta)) };
        break;
      case 'flag':
        patch = {
          layoutFlagWidth: Math.max(12, Math.min(80, (theme.layoutFlagWidth ?? 36) + delta * 2)),
          layoutFlagHeight: Math.max(8, Math.min(60, (theme.layoutFlagHeight ?? 24) + delta)),
        };
        break;
      case 'clubLogo':
        patch = { layoutClubLogoSize: Math.max(12, Math.min(80, (theme.layoutClubLogoSize ?? 28) + delta * 2)) };
        break;
      case 'photo':
        patch = {
          layoutImageW: Math.max(100, Math.min(500, (theme.layoutImageW ?? 280) + delta * 10)),
          layoutImageH: Math.max(100, Math.min(500, (theme.layoutImageH ?? 280) + delta * 10)),
        };
        break;
      case 'stats':
        patch = {
          layoutStatsGapX: Math.max(10, Math.min(100, (theme.layoutStatsGapX ?? 40) + delta)),
          layoutStatsGapY: Math.max(10, Math.min(60, (theme.layoutStatsGapY ?? 30) + delta)),
        };
        break;
      case 'backLogo':
        patch = {
          backSideLogoScale: Math.max(30, Math.min(250, (theme.backSideLogoScale ?? 100) + delta * 5))
        };
        break;
      case 'backText':
        patch = {
          backSideTextSize: Math.max(10, Math.min(45, (theme.backSideTextSize ?? 22) + delta))
        };
        break;
      default:
        break;
    }
    if (Object.keys(patch).length > 0) {
      const updated = { ...theme, ...patch };
      pushToHistory(updated);
      setTheme(updated);
    }
  }, [selectedElement, theme, pushToHistory]);

  // Keyboard navigation & nudging for active studio element
  useEffect(() => {
    if (!selectedElement) return;
    const handleKeyDown = (e) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      const step = e.shiftKey ? 5 : 1;
      if (e.key === 'ArrowLeft') { e.preventDefault(); handleNudge(-step, 0); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); handleNudge(step, 0); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); handleNudge(0, -step); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); handleNudge(0, step); }
      else if (e.key === 'Escape') { e.preventDefault(); setSelectedElement(null); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedElement, handleNudge]);

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

  const handleApply = () => {
    if (commitTimeout.current) clearTimeout(commitTimeout.current);
    if (cardRole === 'GK') {
      storageService.saveGkCardTheme(theme);
    } else {
      storageService.saveCardTheme(theme);
    }
    setSavedTheme(theme);
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 2000);
  };

  const handleResetColors = () => {
    const baseDefault = cardRole === 'GK' ? DEFAULT_GK_CARD_THEME : DEFAULT_CARD_THEME;
    const updatedTheme = {
      ...theme,
      bgGrad1: baseDefault.bgGrad1,
      bgGrad2: baseDefault.bgGrad2,
      bgGrad3: baseDefault.bgGrad3,
      bgGrad4: baseDefault.bgGrad4,
      border1: baseDefault.border1,
      border2: baseDefault.border2,
      border3: baseDefault.border3,
      textDark: baseDefault.textDark,
      textLight: baseDefault.textLight,
      accent: baseDefault.accent,
    };
    if (commitTimeout.current) clearTimeout(commitTimeout.current);
    pushToHistory(updatedTheme);
    setTheme(updatedTheme);
    if (cardRole === 'GK') {
      storageService.saveGkCardTheme(updatedTheme);
    } else {
      storageService.saveCardTheme(updatedTheme);
    }
    setModalConfig({
      isOpen: true,
      title: 'Colors Reset',
      message: `${cardRole === 'GK' ? 'Goalkeeper (GK)' : 'Outfield'} card theme colors have been reset to default.`,
      type: 'success'
    });
  };

  const handleResetLayout = () => {
    const baseDefault = cardRole === 'GK' ? DEFAULT_GK_CARD_THEME : DEFAULT_CARD_THEME;
    const updatedTheme = {
      ...theme,
      layoutRatingX: baseDefault.layoutRatingX,
      layoutRatingY: baseDefault.layoutRatingY,
      layoutPositionGapY: baseDefault.layoutPositionGapY,
      layoutPositionX: baseDefault.layoutPositionX,
      layoutLogosGapY: baseDefault.layoutLogosGapY,
      layoutClubLogoGapY: baseDefault.layoutClubLogoGapY,
      layoutLogosX: baseDefault.layoutLogosX,
      layoutFlagWidth: baseDefault.layoutFlagWidth,
      layoutFlagHeight: baseDefault.layoutFlagHeight,
      layoutClubLogoSize: baseDefault.layoutClubLogoSize,
      layoutNameX: baseDefault.layoutNameX,
      layoutNameY: baseDefault.layoutNameY,
      layoutNameFontSize: baseDefault.layoutNameFontSize,
      layoutStatsX: baseDefault.layoutStatsX,
      layoutStatsY: baseDefault.layoutStatsY,
      layoutStatsGapX: baseDefault.layoutStatsGapX,
      layoutStatsGapY: baseDefault.layoutStatsGapY,
      layoutRatingSize: baseDefault.layoutRatingSize,
      layoutPositionSize: baseDefault.layoutPositionSize,
      layoutStatNumSize: baseDefault.layoutStatNumSize,
      layoutStatLabelSize: baseDefault.layoutStatLabelSize,
      layoutLogoScale: baseDefault.layoutLogoScale,
      layoutImageX: baseDefault.layoutImageX,
      layoutImageY: baseDefault.layoutImageY,
      layoutImageW: baseDefault.layoutImageW,
      layoutImageH: baseDefault.layoutImageH,
      layoutImageFadeY: baseDefault.layoutImageFadeY,
      layoutShadowY: baseDefault.layoutShadowY,
      layoutShadowOpacity: baseDefault.layoutShadowOpacity,
      cardShape: baseDefault.cardShape,
      showRating: baseDefault.showRating,
      showLogos: baseDefault.showLogos,
      showName: baseDefault.showName,
      showStats: baseDefault.showStats,
      frontSideDesign: baseDefault.frontSideDesign,
      backSideDesign: baseDefault.backSideDesign,
      backSideLogoX: baseDefault.backSideLogoX,
      backSideLogoY: baseDefault.backSideLogoY,
      backSideLogoScale: baseDefault.backSideLogoScale,
      showBackSideLogo: baseDefault.showBackSideLogo,
      backSideTextX: baseDefault.backSideTextX,
      backSideTextY: baseDefault.backSideTextY,
      backSideTextSize: baseDefault.backSideTextSize,
      showBackSideText: baseDefault.showBackSideText,
    };
    if (commitTimeout.current) clearTimeout(commitTimeout.current);
    pushToHistory(updatedTheme);
    setTheme(updatedTheme);
    if (cardRole === 'GK') {
      storageService.saveGkCardTheme(updatedTheme);
    } else {
      storageService.saveCardTheme(updatedTheme);
    }
    setModalConfig({
      isOpen: true,
      title: 'Layout Reset',
      message: `${cardRole === 'GK' ? 'Goalkeeper (GK)' : 'Outfield'} card layout has been reset to default.`,
      type: 'success'
    });
  };

  // Demo Player Definitions
  const demoOutfieldPlayer = {
    name: 'WAYNE ROONEY',
    position: 'ST',
    overallRating: 94,
    stats: { pac: 89, sho: 95, pas: 86, dri: 88, def: 52, phy: 92 },
    countryFlag: '/assets/flag.png',
    clubLogo: '/assets/logo.png',
    photoUrl: '/assets/players/roony.png',
  };

  const demoGkPlayer = {
    name: 'THIBAUT COURTOIS',
    position: 'GK',
    overallRating: 90,
    stats: { pac: 85, sho: 89, pas: 76, dri: 93, def: 46, phy: 90, div: 85, han: 89, kic: 76, ref: 93, spd: 46, pos: 90 },
    countryFlag: '/assets/flag.png',
    clubLogo: '/assets/logo.png',
    photoUrl: '/assets/players/Thibaut-Courtois-Real-Madrid-Goalkeeper-8226.png',
  };

  const currentPreviewPlayer = cardRole === 'GK' ? demoGkPlayer : demoOutfieldPlayer;

  // Preset Palettes
  const outfieldPresets = {
    GOLD: { bgGrad1: '#fff3c2', bgGrad2: '#e6b856', bgGrad3: '#c29029', bgGrad4: '#4a3206', border1: '#fff4cc', border2: '#e6c265', border3: '#523403', textDark: '#1c1505', textLight: '#ffffff', accent: '#fff' },
    SILVER: { bgGrad1: '#ffffff', bgGrad2: '#cbd5e1', bgGrad3: '#94a3b8', bgGrad4: '#1e293b', border1: '#ffffff', border2: '#e2e8f0', border3: '#334155', textDark: '#0f172a', textLight: '#ffffff', accent: '#fff' },
    ICON: { bgGrad1: '#ffffff', bgGrad2: '#f4ebd0', bgGrad3: '#dcd0a8', bgGrad4: '#4d401a', border1: '#ffffff', border2: '#f4ebd0', border3: '#4d401a', textDark: '#1a1a1a', textLight: '#ffffff', accent: '#d4af37' },
    DARK: { bgGrad1: '#38bdf8', bgGrad2: '#0ea5e9', bgGrad3: '#0f172a', bgGrad4: '#020617', border1: '#7dd3fc', border2: '#38bdf8', border3: '#0f172a', textDark: '#ffffff', textLight: '#ffffff', accent: '#38bdf8' },
    PINK: { bgGrad1: '#ffb3e6', bgGrad2: '#ff33bb', bgGrad3: '#b30077', bgGrad4: '#330022', border1: '#ffcceb', border2: '#ff80d5', border3: '#4d002e', textDark: '#ffffff', textLight: '#ffffff', accent: '#ffb3e6' },
  };

  const gkPresets = {
    'EMERALD': { bgGrad1: '#e6fffa', bgGrad2: '#34d399', bgGrad3: '#059669', bgGrad4: '#064e3b', border1: '#a7f3d0', border2: '#10b981', border3: '#022c22', textDark: '#064e3b', textLight: '#ffffff', accent: '#34d399' },
    'GOLDEN GLOVE': { bgGrad1: '#fffbeb', bgGrad2: '#fde68a', bgGrad3: '#d97706', bgGrad4: '#78350f', border1: '#fef3c7', border2: '#fbbf24', border3: '#451a03', textDark: '#451a03', textLight: '#ffffff', accent: '#f59e0b' },
    'VIOLET WALL': { bgGrad1: '#faf5ff', bgGrad2: '#c084fc', bgGrad3: '#7e22ce', bgGrad4: '#3b0764', border1: '#e9d5ff', border2: '#a855f7', border3: '#1e013a', textDark: '#3b0764', textLight: '#ffffff', accent: '#c084fc' },
    'COBALT GUARD': { bgGrad1: '#f0f9ff', bgGrad2: '#38bdf8', bgGrad3: '#0284c7', bgGrad4: '#082f49', border1: '#bae6fd', border2: '#0ea5e9', border3: '#031726', textDark: '#082f49', textLight: '#ffffff', accent: '#38bdf8' },
    'STEALTH ONYX': { bgGrad1: '#f8fafc', bgGrad2: '#94a3b8', bgGrad3: '#334155', bgGrad4: '#020617', border1: '#e2e8f0', border2: '#64748b', border3: '#020617', textDark: '#0f172a', textLight: '#ffffff', accent: '#94a3b8' },
  };

  const applyPreset = (presetName) => {
    const activePresetMap = cardRole === 'GK' ? gkPresets : outfieldPresets;
    if (activePresetMap[presetName]) {
      const newTheme = { ...theme, ...activePresetMap[presetName] };
      if (commitTimeout.current) clearTimeout(commitTimeout.current);
      pushToHistory(newTheme);
      setTheme(newTheme);
    }
  };

  return (
    <div style={{
      width: '100%',
      height: 'calc(100vh - 20px)',
      boxSizing: 'border-box',
      padding: '20px 32px',
      display: 'flex',
      gap: 28,
      overflow: 'hidden'
    }}>
      
      {/* ── LEFT COLUMN: STUDIO CONTROLS & INSPECTOR ── */}
      <div style={{
        flex: 1,
        maxWidth: 620,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0
      }}>
        
        {/* Fixed Header */}
        <div style={{ paddingBottom: 14, borderBottom: '1px solid var(--border-subtle)', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--spl-blue-light)', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                AESTHETICS & DISPLAY ENGINE
              </div>
              <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 28, color: '#fff', lineHeight: 1, margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                Player Card Studio
              </h1>
            </div>

            {/* Undo / Redo */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={handleUndo}
                disabled={history.past.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                  background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
                  borderRadius: 6, color: history.past.length === 0 ? 'var(--text-muted)' : '#fff',
                  fontSize: 11, fontWeight: 700, cursor: history.past.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: history.past.length === 0 ? 0.4 : 1
                }}
                title="Undo (Ctrl+Z)"
              >
                <Undo size={13} /> Undo
              </button>
              <button
                onClick={handleRedo}
                disabled={history.future.length === 0}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 11px',
                  background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
                  borderRadius: 6, color: history.future.length === 0 ? 'var(--text-muted)' : '#fff',
                  fontSize: 11, fontWeight: 700, cursor: history.future.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: history.future.length === 0 ? 0.4 : 1
                }}
                title="Redo (Ctrl+Y)"
              >
                <Redo size={13} /> Redo
              </button>
            </div>
          </div>

          {/* ── CARD ROLE SWITCHER: OUTFIELD VS GOALKEEPER (GK) ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, background: 'rgba(15, 23, 42, 0.7)', padding: 4, borderRadius: 10, border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setCardRole('OUTFIELD')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: cardRole === 'OUTFIELD' ? 'var(--spl-blue)' : 'transparent',
                color: cardRole === 'OUTFIELD' ? '#fff' : 'var(--text-secondary)',
                border: cardRole === 'OUTFIELD' ? '1px solid var(--spl-blue-light)' : '1px solid transparent',
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <User size={15} /> Outfield Card (ST/MID/DEF)
            </button>

            <button
              onClick={() => setCardRole('GK')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '8px 12px',
                borderRadius: 8,
                background: cardRole === 'GK' ? '#059669' : 'transparent',
                color: cardRole === 'GK' ? '#fff' : 'var(--text-secondary)',
                border: cardRole === 'GK' ? '1px solid #34d399' : '1px solid transparent',
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Shield size={15} /> Goalkeeper (GK) Card
            </button>
          </div>
        </div>

        {/* ── TABS NAVIGATION ── */}
        <div style={{ display: 'flex', gap: 6, margin: '12px 0', flexShrink: 0 }}>
          {[
            { id: 'theme', label: 'Colors & Theme', icon: Palette },
            { id: 'effects', label: 'Card Effects', icon: Sparkles },
            { id: 'layout', label: 'Layout & Sizes', icon: Layers },
            { id: 'visibility', label: 'Visibility', icon: Eye }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 8px',
                  background: isActive ? 'var(--spl-elevated)' : 'transparent',
                  color: isActive ? '#fff' : 'var(--text-secondary)',
                  border: '1px solid',
                  borderColor: isActive ? 'var(--spl-blue-light)' : 'transparent',
                  borderRadius: 7,
                  fontFamily: 'var(--font-display)',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  transition: 'all 0.15s'
                }}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── SCROLLABLE CONTROLS BODY (Flex 1, with custom thin scrollbar) ── */}
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          paddingRight: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          
          {/* ACTIVE ELEMENT INSPECTOR (Photoshop / Canva Direct Inspector) */}
          {selectedElement && (() => {
            const layerInfo = [...STUDIO_ELEMENTS, ...STUDIO_BACK_ELEMENTS].find(l => l.id === selectedElement);
            return (
              <div style={{
                background: 'linear-gradient(135deg, rgba(2, 132, 199, 0.18), rgba(15, 23, 42, 0.95))',
                border: '1px solid #0284c7',
                borderRadius: 10,
                padding: '12px 14px',
                boxShadow: '0 4px 20px rgba(2, 132, 199, 0.15)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 16 }}>{layerInfo?.icon}</span>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Transforming: {layerInfo?.label}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        Drag canvas box to move • Drag corners to scale
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    <button
                      onClick={handleCenterSelected}
                      title="Align Center Horizontally"
                      style={{ padding: '5px 9px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', borderRadius: 5, color: '#38bdf8', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
                    >
                      <AlignCenter size={11} /> Center
                    </button>
                    <button
                      onClick={() => setSelectedElement(null)}
                      title="Deselect"
                      style={{ padding: '5px 7px', background: 'rgba(255, 255, 255, 0.08)', border: '1px solid var(--border-subtle)', borderRadius: 5, color: 'var(--text-muted)', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, paddingTop: 8, borderTop: '1px solid rgba(2, 132, 199, 0.2)' }}>
                  {selectedElement === 'rating' && (
                    <>
                      <NumberInput label="Rating X" objectKey="layoutRatingX" min={0} max={220} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Rating Y" objectKey="layoutRatingY" min={20} max={250} theme={theme} handleChange={handleChange} />
                      <NumberInput label="OVR Font Size" objectKey="layoutRatingSize" min={20} max={90} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Position Gap (Y)" objectKey="layoutPositionGapY" min={0} max={80} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                  {selectedElement === 'position' && (
                    <>
                      <NumberInput label="Position X Offset" objectKey="layoutPositionX" min={-50} max={50} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Position Gap (Y)" objectKey="layoutPositionGapY" min={0} max={80} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Position Size" objectKey="layoutPositionSize" min={10} max={40} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Logos Gap (Y)" objectKey="layoutLogosGapY" min={0} max={80} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                  {selectedElement === 'flag' && (
                    <>
                      <NumberInput label="Logos X Offset" objectKey="layoutLogosX" min={-50} max={50} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Logos Gap (Y)" objectKey="layoutLogosGapY" min={0} max={80} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Flag Width" objectKey="layoutFlagWidth" min={12} max={80} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Flag Height" objectKey="layoutFlagHeight" min={8} max={60} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                  {selectedElement === 'clubLogo' && (
                    <>
                      <NumberInput label="Logos X Offset" objectKey="layoutLogosX" min={-50} max={50} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Club Logo Gap (Y)" objectKey="layoutClubLogoGapY" min={0} max={60} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Club Logo Size" objectKey="layoutClubLogoSize" min={12} max={80} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Logos Scale (%)" objectKey="layoutLogoScale" min={50} max={200} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                  {selectedElement === 'photo' && (
                    <>
                      <NumberInput label="Image X Offset" objectKey="layoutImageX" min={-120} max={220} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Image Y Offset" objectKey="layoutImageY" min={-160} max={220} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Image Width" objectKey="layoutImageW" min={100} max={500} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Image Height" objectKey="layoutImageH" min={100} max={500} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Photo Fade Start (%)" objectKey="layoutImageFadeY" min={10} max={100} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Shadow Height (Y)" objectKey="layoutShadowY" min={100} max={400} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                  {selectedElement === 'name' && (
                    <>
                      <NumberInput label="Name X" objectKey="layoutNameX" min={40} max={280} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Name Y" objectKey="layoutNameY" min={160} max={380} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Player Name Size" objectKey="layoutNameFontSize" min={16} max={70} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Stats Grid Y" objectKey="layoutStatsY" min={200} max={420} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                  {selectedElement === 'stats' && (
                    <>
                      <NumberInput label="Stats Grid X" objectKey="layoutStatsX" min={40} max={280} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Stats Grid Y" objectKey="layoutStatsY" min={200} max={420} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Stats Gap X" objectKey="layoutStatsGapX" min={10} max={100} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Stats Gap Y" objectKey="layoutStatsGapY" min={10} max={60} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                  {selectedElement === 'backLogo' && (
                    <>
                      <NumberInput label="Emblem Y Position" objectKey="backSideLogoY" min={40} max={350} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Emblem X Position" objectKey="backSideLogoX" min={20} max={300} theme={theme} handleChange={handleChange} />
                      <NumberInput label="Emblem Scale (%)" objectKey="backSideLogoScale" min={30} max={250} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                  {selectedElement === 'backText' && (
                    <>
                      <NumberInput label="League Text Y Position" objectKey="backSideTextY" min={100} max={420} theme={theme} handleChange={handleChange} />
                      <NumberInput label="League Text X Position" objectKey="backSideTextX" min={20} max={300} theme={theme} handleChange={handleChange} />
                      <NumberInput label="League Text Font Size" objectKey="backSideTextSize" min={10} max={45} theme={theme} handleChange={handleChange} />
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          {/* ── TAB 1: COLORS & THEME ── */}
          {activeTab === 'theme' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Presets */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    {cardRole === 'GK' ? '🧤 Goalkeeper (GK) Presets' : '🏃 Outfield Color Presets'}
                  </h3>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Click to apply instant theme</span>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {Object.keys(cardRole === 'GK' ? gkPresets : outfieldPresets).map(p => (
                    <button
                      key={p}
                      onClick={() => applyPreset(p)}
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        fontFamily: 'var(--font-display)',
                        letterSpacing: '0.06em',
                        padding: '7px 14px',
                        background: 'var(--spl-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 6,
                        color: '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--spl-blue-light)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Design Templates & Shape */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>Card Shape</h3>
                  <select value={theme.cardShape || 'eafc24'} onChange={(e) => handleChange('cardShape', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
                    <option value="eafc24">EA FC 24 (Sharp)</option>
                    <option value="shield">Classic Shield</option>
                    <option value="classic">Rounded Rect</option>
                    <option value="notched">Notched Octagon</option>
                    <option value="hex">Sharp Hexagon</option>
                    <option value="cyber">Cyber Cutout</option>
                  </select>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>Front Texture</h3>
                  <select value={theme.frontSideDesign || 'geometric'} onChange={(e) => handleChange('frontSideDesign', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
                    <option value="geometric">Geometric (FUT)</option>
                    <option value="modern">Modern Hex</option>
                    <option value="organic">Organic Waves</option>
                    <option value="circuit">Cyber Circuit</option>
                    <option value="carbon">Carbon Fiber</option>
                    <option value="halftone">Comic Halftone</option>
                    <option value="topo">Topo Map</option>
                    <option value="minimal">Minimalist (Clean)</option>
                  </select>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.08em', marginBottom: 8, textTransform: 'uppercase' }}>Back Texture</h3>
                  <select value={theme.backSideDesign || 'geometric'} onChange={(e) => handleChange('backSideDesign', e.target.value)} style={{ width: '100%', padding: '8px 10px', background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 6, color: '#fff', fontSize: 12, cursor: 'pointer', outline: 'none' }}>
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

              {/* Background Gradients & Borders */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Background Gradients</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <ColorInput label="Top Left" objectKey="bgGrad1" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Upper Mid" objectKey="bgGrad2" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Lower Mid" objectKey="bgGrad3" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Bottom Right" objectKey="bgGrad4" theme={theme} handleChange={handleChange} />
                  </div>
                </div>

                <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Borders & Text</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <ColorInput label="Highlight" objectKey="border1" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Mid Tone" objectKey="border2" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Shadow" objectKey="border3" theme={theme} handleChange={handleChange} />
                    <ColorInput label="Main Text" objectKey="textDark" theme={theme} handleChange={handleChange} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: CARD VISUAL EFFECTS (MODULAR REAL BROADCAST FX) ── */}
          {activeTab === 'effects' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Master Controls & Presets */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                    ✨ Real Broadcast Visual Effects
                  </h3>
                  <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>GPU Accelerated Specular Overlays</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <ToggleInput label="Enable Real Visual Effects" objectKey="enableEffects" theme={theme} handleChange={handleChange} />
                  
                  {theme.enableEffects !== false && (
                    <NumberInput label="Effects Glow & Opacity Intensity (%)" objectKey="fxIntensity" min={20} max={150} theme={theme} handleChange={handleChange} />
                  )}

                  <div style={{ paddingTop: 8, borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 8, letterSpacing: '0.05em' }}>
                      Quick Effect Presets
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        onClick={() => {
                          const patch = {
                            enableEffects: true,
                            fxIntensity: 100,
                            fxBgRays: true,
                            fxBgParticles: true,
                            fxBgPulse: true,
                            fxPlayerGlow: true,
                            fxPlayerParallax: true,
                            fxPlayerHolo: false,
                            fxSurfaceSheen: true,
                            fxSheenSpeed: 3.5,
                            fxSheenSize: 220,
                            fxSheenOpacity: 85,
                            fxSheenLag: 1.5,
                            fxHoloFoil: false,
                            fxGlintStars: true,
                            fxGlintSpeed: 2.6,
                            fxGlintSize: 100,
                            fxGlintOpacity: 90,
                            fxGlintLag: 1.2,
                            fxBorderGleam: true,
                            fxBorderPulse: false
                          };
                          pushToHistory({ ...theme, ...patch });
                          setTheme(prev => ({ ...prev, ...patch }));
                        }}
                        style={{ padding: '6px 12px', background: 'var(--spl-elevated)', border: '1px solid #38bdf8', borderRadius: 6, color: '#38bdf8', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Balanced Pro
                      </button>
                      <button
                        onClick={() => {
                          const patch = {
                            enableEffects: true,
                            fxIntensity: 130,
                            fxBgRays: true,
                            fxBgParticles: true,
                            fxBgPulse: true,
                            fxPlayerGlow: true,
                            fxPlayerParallax: true,
                            fxPlayerHolo: true,
                            fxSurfaceSheen: true,
                            fxSheenSpeed: 2.2,
                            fxSheenSize: 280,
                            fxSheenOpacity: 100,
                            fxSheenLag: 0.8,
                            fxHoloFoil: true,
                            fxGlintStars: true,
                            fxGlintSpeed: 1.8,
                            fxGlintSize: 130,
                            fxGlintOpacity: 100,
                            fxGlintLag: 0.5,
                            fxBorderGleam: true,
                            fxBorderPulse: true
                          };
                          pushToHistory({ ...theme, ...patch });
                          setTheme(prev => ({ ...prev, ...patch }));
                        }}
                        style={{ padding: '6px 12px', background: 'var(--spl-elevated)', border: '1px solid #a855f7', borderRadius: 6, color: '#c084fc', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Max Spectacle
                      </button>
                      <button
                        onClick={() => {
                          const patch = {
                            enableEffects: true,
                            fxIntensity: 80,
                            fxBgRays: false,
                            fxBgParticles: false,
                            fxBgPulse: false,
                            fxPlayerGlow: false,
                            fxPlayerParallax: false,
                            fxPlayerHolo: false,
                            fxSurfaceSheen: true,
                            fxSheenSpeed: 4.5,
                            fxSheenSize: 160,
                            fxSheenOpacity: 55,
                            fxSheenLag: 2.5,
                            fxHoloFoil: false,
                            fxGlintStars: true,
                            fxGlintSpeed: 3.2,
                            fxGlintSize: 80,
                            fxGlintOpacity: 60,
                            fxGlintLag: 2.0,
                            fxBorderGleam: true,
                            fxBorderPulse: false
                          };
                          pushToHistory({ ...theme, ...patch });
                          setTheme(prev => ({ ...prev, ...patch }));
                        }}
                        style={{ padding: '6px 12px', background: 'var(--spl-elevated)', border: '1px solid var(--border-default)', borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        Minimal Clean
                      </button>
                      <button
                        onClick={() => {
                          const patch = { enableEffects: false };
                          pushToHistory({ ...theme, ...patch });
                          setTheme(prev => ({ ...prev, ...patch }));
                        }}
                        style={{ padding: '6px 12px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', borderRadius: 6, color: '#fca5a5', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                      >
                        All Effects Off
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 1: Player Image Visual Effects */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
                  👤 Player Cutout Visual Effects
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <ToggleInput label="Silhouette Rim Glow Halo (Neon outline)" objectKey="fxPlayerGlow" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="2.5D Parallax Depth Float (Breathing float)" objectKey="fxPlayerParallax" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Chromatic Hologram Shimmer (Prism cyan/pink)" objectKey="fxPlayerHolo" theme={theme} handleChange={handleChange} />
                </div>
              </div>

              {/* Section 2: Card Background Stage Lighting */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
                  🌌 Backdrop Stage Lighting & Atmosphere
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <ToggleInput label="Conic 360° Stage Rays (Rotating spotlight beam)" objectKey="fxBgRays" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Stardust Embers & Particles (Rising sparks)" objectKey="fxBgParticles" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Ambient Breathing Neon Aura (Radial aura glow)" objectKey="fxBgPulse" theme={theme} handleChange={handleChange} />
                </div>
              </div>

              {/* Section 3: Surface & Top Glass Overlays */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
                  ✨ Top Glass & Surface Overlays
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  
                  {/* Glass Sheen Sweep Card */}
                  <div style={{ background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 12px' }}>
                    <ToggleInput label="Diagonal Glass Sheen Sweep (EA FC 24 beam sweep)" objectKey="fxSurfaceSheen" theme={theme} handleChange={handleChange} />
                    
                    {theme.fxSurfaceSheen !== false && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        <NumberInput label="Sweep Speed (Duration)" objectKey="fxSheenSpeed" min={0.6} max={8.0} step={0.1} unit="s" theme={theme} handleChange={handleChange} />
                        <NumberInput label="Repeat Lag (Pause between sweeps)" objectKey="fxSheenLag" min={0.0} max={8.0} step={0.1} unit="s" theme={theme} handleChange={handleChange} />
                        <NumberInput label="Beam Size (Width)" objectKey="fxSheenSize" min={60} max={450} step={10} unit="px" theme={theme} handleChange={handleChange} />
                        <NumberInput label="Sheen Opacity / Intensity" objectKey="fxSheenOpacity" min={10} max={100} step={5} unit="%" theme={theme} handleChange={handleChange} />
                      </div>
                    )}
                  </div>

                  {/* Diamond Glint Twinkle Stars Card */}
                  <div style={{ background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 12px' }}>
                    <ToggleInput label="Diamond Glint Twinkle Stars (Specular sparkles)" objectKey="fxGlintStars" theme={theme} handleChange={handleChange} />
                    
                    {theme.fxGlintStars !== false && (
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255, 255, 255, 0.08)', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                        <NumberInput label="Twinkle Speed" objectKey="fxGlintSpeed" min={0.8} max={6.0} step={0.1} unit="s" theme={theme} handleChange={handleChange} />
                        <NumberInput label="Twinkle Lag / Delay" objectKey="fxGlintLag" min={0.0} max={5.0} step={0.1} unit="s" theme={theme} handleChange={handleChange} />
                        <NumberInput label="Diamond Star Size" objectKey="fxGlintSize" min={40} max={220} step={5} unit="%" theme={theme} handleChange={handleChange} />
                        <NumberInput label="Diamond Opacity" objectKey="fxGlintOpacity" min={20} max={100} step={5} unit="%" theme={theme} handleChange={handleChange} />
                      </div>
                    )}
                  </div>

                  {/* Rainbow Holographic Foil */}
                  <div style={{ background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '10px 12px' }}>
                    <ToggleInput label="Rainbow Holographic Foil (Prismatic spectrum)" objectKey="fxHoloFoil" theme={theme} handleChange={handleChange} />
                  </div>

                </div>
              </div>

              {/* Section 4: Perimeter & Border Glow */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>
                  🛡️ Border & Perimeter Visual Effects
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <ToggleInput label="Perimeter Edge Gleam Tracer (Border sweep light)" objectKey="fxBorderGleam" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Pulsing Neon Edge (Rhythmic edge glow)" objectKey="fxBorderPulse" theme={theme} handleChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: LAYOUT & SIZES ── */}
          {activeTab === 'layout' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Rating, Position & Logos Spacing */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Rating, Position & Logos Spacing</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <NumberInput label="Rating X" objectKey="layoutRatingX" min={10} max={150} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Rating Y" objectKey="layoutRatingY" min={20} max={200} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Position Gap (Y)" objectKey="layoutPositionGapY" min={5} max={60} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Position X Offset" objectKey="layoutPositionX" min={-30} max={30} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Logos Gap (Y)" objectKey="layoutLogosGapY" min={5} max={60} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Club Logo Gap (Y)" objectKey="layoutClubLogoGapY" min={2} max={50} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Logos X Offset" objectKey="layoutLogosX" min={-30} max={30} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Logos Scale (%)" objectKey="layoutLogoScale" min={50} max={200} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Flag Width" objectKey="layoutFlagWidth" min={16} max={60} theme={theme} handleChange={handleChange} />
                </div>
              </div>

              {/* Player Name & Stats Position */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Player Name & Stats Position</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <NumberInput label="Name X" objectKey="layoutNameX" min={60} max={260} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Name Y" objectKey="layoutNameY" min={200} max={360} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stats Grid X" objectKey="layoutStatsX" min={60} max={260} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stats Grid Y" objectKey="layoutStatsY" min={250} max={400} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stats Gap X" objectKey="layoutStatsGapX" min={20} max={80} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stats Gap Y" objectKey="layoutStatsGapY" min={15} max={50} theme={theme} handleChange={handleChange} />
                </div>
              </div>

              {/* Font Sizes & Typography */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Font Sizes & Scales</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <NumberInput label="OVR Text Size" objectKey="layoutRatingSize" min={24} max={80} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Position Size" objectKey="layoutPositionSize" min={10} max={36} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Player Name Size" objectKey="layoutNameFontSize" min={20} max={60} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stat Numbers Size" objectKey="layoutStatNumSize" min={10} max={32} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Stat Labels Size" objectKey="layoutStatLabelSize" min={10} max={32} theme={theme} handleChange={handleChange} />
                </div>
              </div>

              {/* Image & Shadow Layout */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Image & Shadow Layout</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <NumberInput label="Image X Offset" objectKey="layoutImageX" min={-100} max={200} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Image Y Offset" objectKey="layoutImageY" min={-150} max={200} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Image Width" objectKey="layoutImageW" min={100} max={500} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Image Height" objectKey="layoutImageH" min={100} max={500} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Photo Fade Start (%)" objectKey="layoutImageFadeY" min={10} max={100} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Shadow Height (Y)" objectKey="layoutShadowY" min={100} max={400} theme={theme} handleChange={handleChange} />
                </div>
              </div>

              {/* Backside Layout & Content Sizing */}
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    Backside Content Positioning & Sizing
                  </h3>
                  {!showBack && (
                    <button
                      onClick={() => setShowBack(true)}
                      style={{ padding: '3px 8px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', borderRadius: 4, color: '#38bdf8', fontSize: 10, fontWeight: 700, cursor: 'pointer' }}
                    >
                      Flip to Back ↺
                    </button>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                  <NumberInput label="Emblem Position Y" objectKey="backSideLogoY" min={40} max={350} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Emblem Position X" objectKey="backSideLogoX" min={20} max={300} theme={theme} handleChange={handleChange} />
                  <NumberInput label="Emblem Scale (%)" objectKey="backSideLogoScale" min={30} max={250} theme={theme} handleChange={handleChange} />
                  <NumberInput label="League Text Position Y" objectKey="backSideTextY" min={100} max={420} theme={theme} handleChange={handleChange} />
                  <NumberInput label="League Text Position X" objectKey="backSideTextX" min={20} max={300} theme={theme} handleChange={handleChange} />
                  <NumberInput label="League Text Size" objectKey="backSideTextSize" min={10} max={45} theme={theme} handleChange={handleChange} />
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: VISIBILITY ── */}
          {activeTab === 'visibility' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Frontside Elements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ToggleInput label="Show Rating & Position" objectKey="showRating" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Show Player Name" objectKey="showName" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Show Stats Grid" objectKey="showStats" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Show Nation & League Logos" objectKey="showLogos" theme={theme} handleChange={handleChange} />
                </div>
              </div>

              <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 12, textTransform: 'uppercase' }}>Backside Elements</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ToggleInput label="Show Backside Emblem" objectKey="showBackSideLogo" theme={theme} handleChange={handleChange} />
                  <ToggleInput label="Show Backside League Text" objectKey="showBackSideText" theme={theme} handleChange={handleChange} />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* ── FIXED ACTION FOOTER (Always visible, perfectly positioned) ── */}
        <div style={{
          paddingTop: 14,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: 10,
          flexShrink: 0
        }}>
          <button
            onClick={handleResetColors}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px', background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
              borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--spl-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--spl-panel)'}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Colors
          </button>

          <button
            onClick={handleResetLayout}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '11px', background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
              borderRadius: 8, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--spl-elevated)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--spl-panel)'}
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Layout
          </button>
          
          <button
            onClick={handleApply}
            disabled={!hasChanges && !isSaving}
            style={{
              flex: 1.4, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '11px', 
              background: isSaving ? '#10b981' : (hasChanges ? 'var(--spl-blue)' : 'var(--spl-panel)'), 
              border: `1px solid ${isSaving ? '#059669' : (hasChanges ? 'var(--spl-blue-light)' : 'var(--border-default)')}`,
              borderRadius: 8, 
              color: hasChanges || isSaving ? '#fff' : 'var(--text-muted)', 
              fontSize: 12, fontWeight: 800, 
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              cursor: hasChanges || isSaving ? 'pointer' : 'not-allowed',
              opacity: hasChanges || isSaving ? 1 : 0.6,
              transition: 'all 0.18s ease-in-out'
            }}
            onMouseEnter={e => { if (hasChanges && !isSaving) e.currentTarget.style.background = '#2563EB'; }}
            onMouseLeave={e => { if (hasChanges && !isSaving) e.currentTarget.style.background = 'var(--spl-blue)'; }}
          >
            {isSaving ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {isSaving ? 'Settings Applied!' : (hasChanges ? `Save ${cardRole === 'GK' ? 'GK' : 'Card'} Theme` : 'No Changes')}
          </button>
        </div>

      </div>

      {/* ── RIGHT COLUMN: CANVAS STUDIO & DIRECT TRANSFORM ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--spl-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
        padding: '20px 24px',
        position: 'relative',
        height: '100%',
        minHeight: 0
      }}>
        
        {/* Top Header Bar */}
        <div style={{ width: '100%', maxWidth: 540, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={16} color="#38bdf8" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#38bdf8', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
              CANVAS STUDIO • {cardRole === 'GK' ? 'GOALKEEPER CARD' : 'OUTFIELD CARD'}
            </span>
          </div>

          <button
            onClick={() => {
              setShowBack(p => !p);
              setSelectedElement(null);
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', background: 'var(--spl-elevated)', border: '1px solid var(--border-default)',
              borderRadius: 6, color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <RefreshCcw className="w-3 h-3" /> Flip ({showBack ? 'Front' : 'Back'})
          </button>
        </div>

        {/* Canva / Photoshop Layer Selection Pills */}
        <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0, margin: '6px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, flexWrap: 'wrap' }}>
            {(showBack ? STUDIO_BACK_ELEMENTS : STUDIO_ELEMENTS).map(layer => {
              const isSelected = selectedElement === layer.id;
              return (
                <button
                  key={layer.id}
                  onClick={() => setSelectedElement(isSelected ? null : layer.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px',
                    background: isSelected ? '#0284c7' : 'var(--spl-elevated)',
                    border: `1px solid ${isSelected ? '#38bdf8' : 'var(--border-subtle)'}`,
                    borderRadius: 20,
                    color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: 11,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    boxShadow: isSelected ? '0 0 12px rgba(56, 189, 248, 0.4)' : 'none'
                  }}
                >
                  <span>{layer.icon}</span>
                  <span>{layer.label}</span>
                </button>
              );
            })}
          </div>

          {/* Quick Action Toolbar */}
          {selectedElement ? (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(15, 23, 42, 0.9)', border: '1px solid #0284c7',
              borderRadius: 8, padding: '5px 10px', backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00e5ff', boxShadow: '0 0 8px #00e5ff' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#38bdf8' }}>
                  {[...STUDIO_ELEMENTS, ...STUDIO_BACK_ELEMENTS].find(l => l.id === selectedElement)?.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <button
                  onClick={handleCenterSelected}
                  style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '3px 8px', background: 'rgba(56, 189, 248, 0.15)', border: '1px solid #0284c7', borderRadius: 5, color: '#38bdf8', fontSize: 10, fontWeight: 600, cursor: 'pointer' }}
                  title="Center Horizontally"
                >
                  <AlignCenter size={11} /> Center
                </button>

                {/* Nudge Buttons */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 5 }}>
                  <button onClick={() => handleNudge(-1, 0)} title="Nudge Left (←)" style={{ padding: '3px 5px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronLeft size={11} /></button>
                  <button onClick={() => handleNudge(0, -1)} title="Nudge Up (↑)" style={{ padding: '3px 5px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronUp size={11} /></button>
                  <button onClick={() => handleNudge(0, 1)} title="Nudge Down (↓)" style={{ padding: '3px 5px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronDown size={11} /></button>
                  <button onClick={() => handleNudge(1, 0)} title="Nudge Right (→)" style={{ padding: '3px 5px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer' }}><ChevronRight size={11} /></button>
                </div>

                {/* Size Step */}
                <div style={{ display: 'flex', alignItems: 'center', background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 5 }}>
                  <button onClick={() => handleStepSize(-1)} title="Decrease Size" style={{ padding: '3px 6px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>−</button>
                  <button onClick={() => handleStepSize(1)} title="Increase Size" style={{ padding: '3px 6px', background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}>+</button>
                </div>

                <button
                  onClick={() => setSelectedElement(null)}
                  title="Deselect (Esc)"
                  style={{ padding: '3px 5px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center', fontSize: 10.5, color: 'var(--text-muted)',
              padding: '4px 10px', background: 'rgba(255, 255, 255, 0.02)',
              borderRadius: 6, border: '1px dashed var(--border-subtle)'
            }}>
              ✨ Click any element on the card to drag, move, and scale with handles
            </div>
          )}
        </div>

        {/* ── CARD STAGE (Perfect Scale & Centered) ── */}
        <div style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 0,
          margin: '10px 0',
          transform: 'scale(1.08)',
          transition: 'transform 0.2s ease'
        }}>
          {showBack ? (
            <MysteryCardBack
              size="lg"
              customTheme={theme}
              isStudio={true}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
            />
          ) : (
            <EFootballCard
              player={currentPreviewPlayer}
              size="lg"
              customThemeOverride={theme}
              isStudio={true}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateTheme={handleDirectThemeUpdate}
              onCommitHistory={handleCommitDirectHistory}
            />
          )}
        </div>

        {/* Bottom Hint Toolbar */}
        <div style={{ flexShrink: 0, paddingTop: 8, borderTop: '1px solid var(--border-subtle)', fontSize: 10.5, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>💡 <b style={{ color: '#fff' }}>Drag</b> element to move</span>
          <span>• <b style={{ color: '#fff' }}>Drag corners</b> to resize</span>
          <span>• <b style={{ color: '#fff' }}>Arrow keys</b> to nudge</span>
          <span>• <b style={{ color: '#fff' }}>Esc</b> to deselect</span>
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
