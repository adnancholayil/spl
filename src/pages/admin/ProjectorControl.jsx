import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuction } from '../../context/AuctionContext';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../utils/currency';
import {
  Tv, Monitor, Eye, EyeOff, LayoutGrid, Users, CheckCircle2,
  Zap, RefreshCw, Shield, Radio, Sparkles, MessageSquare,
  DollarSign, Sliders, RotateCcw, Image as ImageIcon,
  Video, Upload, Trash2, Award, Plus, X
} from 'lucide-react';
import { mediaStorage } from '../../services/mediaStorage';

const optimizeSponsorCardImage = (file) => {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const MAX_W = 600;
      const MAX_H = 380;
      let w = img.width;
      let h = img.height;

      if (w > MAX_W || h > MAX_H) {
        const ratio = Math.min(MAX_W / w, MAX_H / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);

      let compressed = canvas.toDataURL('image/webp', 0.82);
      if (!compressed || compressed.length > 250000) {
        compressed = canvas.toDataURL('image/jpeg', 0.80);
      }
      resolve(compressed);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result || '');
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    };
    img.src = objectUrl;
  });
};

const optimizeDataUrl = (dataUrl) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const MAX_W = 600;
      const MAX_H = 380;
      let w = img.width;
      let h = img.height;
      if (w > MAX_W || h > MAX_H) {
        const ratio = Math.min(MAX_W / w, MAX_H / h);
        w = Math.round(w * ratio);
        h = Math.round(h * ratio);
      }
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, w, h);
      let compressed = canvas.toDataURL('image/webp', 0.82);
      if (!compressed || compressed.length > 250000) {
        compressed = canvas.toDataURL('image/jpeg', 0.80);
      }
      resolve(compressed);
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export const ProjectorControl = () => {
  const { tournament, teams, players } = useTournament();
  const { auctionState } = useAuction();

  // Load live projector settings from storage
  const [settings, setSettings] = useState(() => storageService.getProjectorSettings());
  const [flashSaved, setFlashSaved] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [mediaUrlInput, setMediaUrlInput] = useState('');

  // Sponsor state
  const [sponsorNameInput, setSponsorNameInput] = useState('');
  const [sponsorUrlInput, setSponsorUrlInput] = useState('');
  const [isUploadingSponsor, setIsUploadingSponsor] = useState(false);

  // Sync state to storageService on change (declared first before any effects)
  const updateSettings = (newPartial) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    storageService.saveProjectorSettings(updated);
    setFlashSaved(true);
    setTimeout(() => setFlashSaved(false), 1200);
  };

  // Auto-clean any oversized images in storage so quota is never exceeded
  useEffect(() => {
    if (Array.isArray(settings?.sponsors) && settings.sponsors.length > 0) {
      let oversizedFound = false;
      const sanitize = async () => {
        const cleanList = await Promise.all(
          settings.sponsors.map(async (sp) => {
            if (typeof sp.imageUrl === 'string' && sp.imageUrl.length > 200000 && sp.imageUrl.startsWith('data:image/')) {
              oversizedFound = true;
              try {
                const compressed = await optimizeDataUrl(sp.imageUrl);
                return { ...sp, imageUrl: compressed };
              } catch (_) {
                return sp;
              }
            }
            return sp;
          })
        );
        if (oversizedFound) {
          updateSettings({ sponsors: cleanList });
        }
      };
      sanitize();
    }
  }, []);

  const handleHomeMediaFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg)$/i.test(file.name);
      const mediaType = isVideo ? 'video' : 'image';

      // Save file directly to high-capacity IndexedDB
      await mediaStorage.saveMedia('home_main_media', file);

      // Save settings metadata and sync across tabs
      updateSettings({
        homeMediaCustom: true,
        homeMediaName: file.name,
        homeMediaType: mediaType,
        homeMediaUrl: '',
        homeMediaFullScreen: true,
        homeMediaFit: 'cover',
        showLogoOnHomeMedia: true
      });
    } catch (err) {
      console.error('Failed to upload media:', err);
      alert('Failed to upload media. Please try another file.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleApplyMediaUrl = () => {
    const url = mediaUrlInput.trim();
    if (!url) return;

    const isVideo = /\.(mp4|webm|mov|ogg)($|\?)/i.test(url);
    const mediaType = isVideo ? 'video' : 'image';

    updateSettings({
      homeMediaCustom: false,
      homeMediaName: url.split('/').pop() || 'External Media',
      homeMediaType: mediaType,
      homeMediaUrl: url,
      homeMediaFullScreen: true,
      homeMediaFit: 'cover',
      showLogoOnHomeMedia: true
    });
    setMediaUrlInput('');
  };

  const handleRemoveHomeMedia = async () => {
    try {
      await mediaStorage.deleteMedia('home_main_media');
    } catch (_) {}

    updateSettings({
      homeMediaCustom: false,
      homeMediaName: '',
      homeMediaType: 'none',
      homeMediaUrl: '',
      homeMediaFullScreen: true,
      showLogoOnHomeMedia: true
    });
  };

  // Sponsor Handlers with Auto-Compression & IndexedDB Persistence
  const handleSponsorFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingSponsor(true);
      const optimizedDataUrl = await optimizeSponsorCardImage(file);
      if (!optimizedDataUrl) {
        alert('Could not read image file.');
        setIsUploadingSponsor(false);
        return;
      }

      const newSponsor = {
        id: 'sp_' + Date.now(),
        name: sponsorNameInput.trim() || '',
        imageUrl: optimizedDataUrl
      };

      try {
        await mediaStorage.saveMedia('sponsor_' + newSponsor.id, file);
      } catch (_) {}

      const currentList = Array.isArray(settings.sponsors) ? settings.sponsors : [];
      updateSettings({
        sponsors: [...currentList, newSponsor],
        showSponsors: true
      });
      setSponsorNameInput('');
    } catch (err) {
      console.error('Failed to upload sponsor card:', err);
      alert('Failed to process sponsor card.');
    } finally {
      setIsUploadingSponsor(false);
      e.target.value = '';
    }
  };

  const handleAddSponsorUrl = () => {
    const url = sponsorUrlInput.trim();
    if (!url) return;
    const newSponsor = {
      id: 'sp_' + Date.now(),
      name: sponsorNameInput.trim() || '',
      imageUrl: url
    };
    const currentList = Array.isArray(settings.sponsors) ? settings.sponsors : [];
    updateSettings({
      sponsors: [...currentList, newSponsor],
      showSponsors: true
    });
    setSponsorUrlInput('');
    setSponsorNameInput('');
  };

  const handleRemoveSponsor = async (id) => {
    try {
      await mediaStorage.deleteMedia('sponsor_' + id);
    } catch (_) {}
    const currentList = Array.isArray(settings.sponsors) ? settings.sponsors : [];
    updateSettings({ sponsors: currentList.filter(s => s.id !== id) });
  };

  const handleResetDefaults = () => {
    const defaults = {
      mode: 'AUTO',
      showManagerBalance: true,
      showLiveTicker: true,
      showSquadSummary: true,
      showPlayerAttributes: true,
      showBasePrice: true,
      showSoldBadge: true,
      showTeamLogos: true,
      customTickerText: 'SUPER PREMIER LEAGUE 2026 • OFFICIAL PLAYER AUCTION & SQUAD DRAFT',
      selectedTeamId: teams[0]?.id || '',
      screenTheme: 'DEFAULT',
      showSponsors: false,
      sponsors: []
    };
    updateSettings(defaults);
  };

  const openProjectorWindow = () => {
    window.open('/projector', '_blank', 'width=1280,height=720,toolbar=no,menubar=no');
  };

  const sponsorsList = Array.isArray(settings.sponsors) ? settings.sponsors : [];

  return (
    <div style={{ padding: '14px 20px', maxWidth: 1600, margin: '0 auto', color: '#fff', fontSize: 13 }}>

      {/* ── COMPACT HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 24, color: '#fff', lineHeight: 1, textTransform: 'uppercase', margin: 0 }}>
            Projector Screen Manager
          </h1>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--spl-orange)', letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.25)', padding: '2px 8px', borderRadius: 4 }}>
            BROADCAST ENGINE
          </span>
          {flashSaved && (
            <span style={{ fontSize: 10, fontWeight: 800, color: '#22C55E', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase' }}>
              ✓ Synced
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleResetDefaults}
            className="btn-ghost"
            style={{ padding: '6px 12px', fontSize: 11, gap: 5, height: 32 }}
          >
            <RotateCcw size={13} />
            Reset Defaults
          </button>

          <button
            onClick={openProjectorWindow}
            className="btn-primary"
            style={{ padding: '6px 16px', fontSize: 12, gap: 6, background: 'var(--spl-orange)', height: 32 }}
          >
            <Tv size={14} />
            Launch Projector
          </button>
        </div>
      </div>

      {/* ── 2-COLUMN BALANCED COMPACT GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(400px, 1.15fr) minmax(380px, 1fr)', gap: 14, alignItems: 'start' }}>

        {/* ════════ LEFT COLUMN: BROADCAST MODE, HOME MEDIA, SPONSORS ════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* 1. PROJECTOR DISPLAY MODE (COMPACT TILES) */}
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <LayoutGrid size={13} /> 1. Projector Display Mode
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { id: 'AUTO', label: '🔴 Live Auction' },
                { id: 'CLUBS_OVERVIEW', label: '📊 Club Standings' },
                { id: 'SQUAD_SHOWCASE', label: '🛡️ Team Squad' },
                { id: 'SOLD_SHOWCASE', label: '🌟 Sold Gallery' },
                { id: 'UNSOLD_SHOWCASE', label: '📋 Unsold Pool' },
              ].map(m => {
                const isActive = settings.mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => updateSettings({ mode: m.id })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                      padding: '7px 8px', borderRadius: 6, textAlign: 'center',
                      border: isActive ? '1px solid var(--spl-blue)' : '1px solid var(--border-subtle)',
                      background: isActive ? 'rgba(26,86,219,0.22)' : 'var(--spl-elevated)',
                      color: isActive ? '#fff' : 'var(--text-secondary)',
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: isActive ? 800 : 600,
                      boxShadow: isActive ? '0 0 10px rgba(26,86,219,0.3)' : 'none'
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>

            {/* SQUAD SELECTOR (Only if SQUAD_SHOWCASE active) */}
            {settings.mode === 'SQUAD_SHOWCASE' && (
              <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <select
                  value={settings.selectedTeamId || teams[0]?.id}
                  onChange={e => updateSettings({ selectedTeamId: e.target.value })}
                  style={{
                    width: '100%', padding: '6px 10px', borderRadius: 5,
                    background: 'var(--spl-elevated)', border: '1px solid var(--spl-blue)',
                    color: '#fff', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700
                  }}
                >
                  {teams.map(t => (
                    <option key={t.id} value={t.id} style={{ background: '#0a0d18', color: '#fff' }}>
                      {t.name} (Manager: {t.managerName} • Budget: {formatCurrency(t.currentBalance, tournament?.currency)})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* 2. HOME SCREEN MEDIA (IMAGE / VIDEO) */}
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-orange)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Video size={13} /> 2. Home Screen Media (Full Screen Image / Video)
              </div>
              {(settings.homeMediaCustom || settings.homeMediaUrl) && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.15)', color: '#22C55E', border: '1px solid rgba(34,197,94,0.3)', textTransform: 'uppercase' }}>
                    ✓ {settings.homeMediaType} ACTIVE
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveHomeMedia}
                    style={{ padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#F87171', fontSize: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}
                  >
                    <Trash2 size={10} /> Clear
                  </button>
                </div>
              )}
            </div>

            {/* Compact Upload & URL Controls in a Single Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 6, alignItems: 'center' }}>
              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
                  background: isUploading ? 'rgba(59,130,246,0.15)' : 'var(--spl-elevated)',
                  cursor: isUploading ? 'wait' : 'pointer', fontSize: 11, fontWeight: 700, color: '#fff',
                  whiteSpace: 'nowrap'
                }}
              >
                <input
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleHomeMediaFileUpload}
                  disabled={isUploading}
                  style={{ display: 'none' }}
                />
                {isUploading ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} color="#F59E0B" />}
                {isUploading ? 'Saving...' : 'Upload File'}
              </label>

              <input
                type="text"
                placeholder="Or paste media URL (https://...)"
                value={mediaUrlInput}
                onChange={e => setMediaUrlInput(e.target.value)}
                style={{
                  width: '100%', padding: '6px 10px', borderRadius: 6,
                  background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)',
                  color: '#fff', fontSize: 11, outline: 'none'
                }}
              />

              <button
                type="button"
                onClick={handleApplyMediaUrl}
                style={{
                  padding: '6px 12px', borderRadius: 6, background: 'var(--spl-blue)',
                  color: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', border: 'none',
                  whiteSpace: 'nowrap'
                }}
              >
                Apply
              </button>
            </div>

            {/* Active Media Name Display if set */}
            {(settings.homeMediaCustom || settings.homeMediaUrl) && (
              <div style={{ marginTop: 6, fontSize: 10, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Media:</span>
                <span style={{ color: 'var(--spl-blue-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {settings.homeMediaName || settings.homeMediaUrl}
                </span>
              </div>
            )}

            {/* Display Options: 3 Columns */}
            <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>
                  Media Fit
                </div>
                <select
                  value={settings.homeMediaFit || 'cover'}
                  onChange={e => updateSettings({ homeMediaFit: e.target.value })}
                  style={{ width: '100%', padding: '5px 6px', borderRadius: 5, background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', color: '#fff', fontSize: 10, fontWeight: 700 }}
                >
                  <option value="cover">Full Screen (Cover)</option>
                  <option value="contain">Contain (No Crop)</option>
                </select>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>
                  Logo & Title
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ showLogoOnHomeMedia: settings.showLogoOnHomeMedia === false })}
                  style={{
                    width: '100%', padding: '5px 6px', borderRadius: 5,
                    background: settings.showLogoOnHomeMedia !== false ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    border: settings.showLogoOnHomeMedia !== false ? '1px solid #22C55E' : '1px solid var(--border-subtle)',
                    color: settings.showLogoOnHomeMedia !== false ? '#22C55E' : 'var(--text-muted)',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer', textAlign: 'center'
                  }}
                >
                  {settings.showLogoOnHomeMedia !== false ? '✓ Show Logo' : 'Hide Logo'}
                </button>
              </div>

              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>
                  Logo Background
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ logoBackgroundBadge: settings.logoBackgroundBadge === false })}
                  style={{
                    width: '100%', padding: '5px 6px', borderRadius: 5,
                    background: settings.logoBackgroundBadge !== false ? 'rgba(34,197,94,0.15)' : 'rgba(255,255,255,0.05)',
                    border: settings.logoBackgroundBadge !== false ? '1px solid #22C55E' : '1px solid var(--border-subtle)',
                    color: settings.logoBackgroundBadge !== false ? '#22C55E' : 'var(--text-muted)',
                    fontSize: 10, fontWeight: 700, cursor: 'pointer', textAlign: 'center'
                  }}
                >
                  {settings.logoBackgroundBadge !== false ? '✓ High Contrast' : 'Transparent'}
                </button>
              </div>
            </div>
          </div>

          {/* 3. SPONSORS & PARTNERS CARDS (NEW FEATURE) */}
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-gold-light)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Award size={13} /> 3. Sponsors & Partner Cards ({sponsorsList.length})
              </div>

              {/* SPONSORS ON / OFF TOGGLE BUTTON */}
              <button
                type="button"
                onClick={() => updateSettings({ showSponsors: !settings.showSponsors })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '4px 10px', borderRadius: 16,
                  background: settings.showSponsors ? 'rgba(34,197,94,0.18)' : 'rgba(255,255,255,0.06)',
                  border: settings.showSponsors ? '1px solid #22C55E' : '1px solid var(--border-subtle)',
                  color: settings.showSponsors ? '#22C55E' : 'var(--text-muted)',
                  fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800,
                  letterSpacing: '0.06em', textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: settings.showSponsors ? '0 0 10px rgba(34,197,94,0.25)' : 'none'
                }}
              >
                <span style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: settings.showSponsors ? '#22C55E' : 'var(--text-muted)',
                  boxShadow: settings.showSponsors ? '0 0 6px #22C55E' : 'none'
                }} />
                {settings.showSponsors ? 'SPONSORS ON' : 'SPONSORS OFF'}
              </button>
            </div>

            {/* Upload & Add Sponsor Card Row (ATM Card Graphics) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 6, alignItems: 'center', marginBottom: 8 }}>
              <label
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '6px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
                  background: isUploadingSponsor ? 'rgba(59,130,246,0.15)' : 'var(--spl-elevated)',
                  cursor: isUploadingSponsor ? 'wait' : 'pointer', fontSize: 11, fontWeight: 700, color: '#fff',
                  whiteSpace: 'nowrap'
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSponsorFileUpload}
                  disabled={isUploadingSponsor}
                  style={{ display: 'none' }}
                />
                {isUploadingSponsor ? <RefreshCw size={12} className="animate-spin" /> : <Upload size={12} color="#FBBF24" />}
                {isUploadingSponsor ? 'Uploading...' : 'Upload ATM Card'}
              </label>

              <input
                type="text"
                placeholder="Or paste card image URL (https://...)"
                value={sponsorUrlInput}
                onChange={e => setSponsorUrlInput(e.target.value)}
                style={{
                  padding: '6px 10px', borderRadius: 6,
                  background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)',
                  color: '#fff', fontSize: 11, outline: 'none'
                }}
              />

              <button
                type="button"
                onClick={handleAddSponsorUrl}
                disabled={!sponsorUrlInput.trim()}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  background: sponsorUrlInput.trim() ? 'var(--spl-blue)' : 'rgba(255,255,255,0.06)',
                  color: sponsorUrlInput.trim() ? '#fff' : 'var(--text-muted)',
                  fontSize: 11, fontWeight: 700,
                  cursor: sponsorUrlInput.trim() ? 'pointer' : 'not-allowed',
                  border: 'none', whiteSpace: 'nowrap'
                }}
              >
                <Plus size={12} style={{ display: 'inline', marginRight: 2 }} /> Add Card
              </button>
            </div>

            {/* Uploaded Sponsors: Mini ATM Card Previews */}
            <div style={{ minHeight: 44, background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, padding: '6px 8px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {sponsorsList.length === 0 ? (
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                  No sponsor cards uploaded yet. Click <strong>Upload ATM Card</strong> to display cards on the projector screen.
                </span>
              ) : (
                sponsorsList.map((sp) => (
                  <div
                    key={sp.id}
                    style={{
                      position: 'relative',
                      width: 72,
                      aspectRatio: '85.6 / 53.98',
                      borderRadius: 6,
                      overflow: 'hidden',
                      border: '1.5px solid rgba(255,255,255,0.25)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.6)',
                      background: 'rgba(15, 23, 42, 0.9)',
                      flexShrink: 0
                    }}
                  >
                    {sp.imageUrl && (
                      <img
                        src={sp.imageUrl}
                        alt="Sponsor Card"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSponsor(sp.id)}
                      style={{
                        position: 'absolute', top: 2, right: 2,
                        width: 16, height: 16, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.92)', color: '#fff',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        padding: 0, boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
                      }}
                      title="Remove Sponsor Card"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ════════ RIGHT COLUMN: LIVE PREVIEW & SECONDARY CONTROLS ════════ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

          {/* LIVE IFRAME PROJECTOR PREVIEW (COMPACT 16:9) */}
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-orange)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Monitor size={13} /> LIVE PROJECTOR SCREEN PREVIEW
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 700, color: '#22C55E' }}>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                MODE: {settings.mode}
              </div>
            </div>

            <div style={{ width: '100%', aspectRatio: '16/9', background: '#020617', border: '1.5px solid var(--spl-blue)', borderRadius: 8, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 30px rgba(0,0,0,0.8)' }}>
              <iframe src="/projector" title="Live Projector Preview" style={{ width: '400%', height: '400%', position: 'absolute', top: 0, left: 0, border: 'none', transform: 'scale(0.25)', transformOrigin: 'top left', pointerEvents: 'auto' }} />
            </div>
          </div>

          {/* 4. DISPLAY TOGGLES (COMPACT 3-COLUMN CHIP GRID) */}
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.12em', marginBottom: 8, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sliders size={13} /> 4. Display Toggles (Show / Hide)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
              {[
                { key: 'showManagerBalance', label: 'Budgets', icon: DollarSign },
                { key: 'showLiveTicker', label: 'Live Ticker', icon: Radio },
                { key: 'showSquadSummary', label: 'Squad Counts', icon: Users },
                { key: 'showPlayerAttributes', label: 'FIFA Stats', icon: Sparkles },
                { key: 'showBasePrice', label: 'Base Price', icon: Zap },
                { key: 'showTeamLogos', label: 'Club Logos', icon: Shield },
                { key: 'showSoldBadge', label: 'Sold Badges', icon: CheckCircle2 },
              ].map(item => {
                const isEnabled = settings[item.key];
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => updateSettings({ [item.key]: !isEnabled })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '6px 8px', borderRadius: 5,
                      border: isEnabled ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border-subtle)',
                      background: isEnabled ? 'rgba(34,197,94,0.08)' : 'var(--spl-elevated)',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Icon size={12} color={isEnabled ? '#22C55E' : 'var(--text-muted)'} />
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: isEnabled ? '#fff' : 'var(--text-muted)' }}>
                        {item.label}
                      </span>
                    </div>
                    {isEnabled ? <Eye size={12} color="#22C55E" /> : <EyeOff size={12} color="var(--text-muted)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5. BROADCAST TICKER & STADIUM THEME (COMBINED COMPACT ROW) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 10 }}>

            {/* LIVE BROADCAST TICKER */}
            <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--spl-blue-light)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <MessageSquare size={11} /> 5. Broadcast Ticker
                </div>
                <button
                  type="button"
                  onClick={() => updateSettings({ showLiveTicker: !settings.showLiveTicker })}
                  style={{
                    padding: '2px 8px', borderRadius: 12,
                    background: settings.showLiveTicker ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
                    border: settings.showLiveTicker ? '1px solid #22C55E' : '1px solid #EF4444',
                    color: settings.showLiveTicker ? '#22C55E' : '#EF4444',
                    fontSize: 9, fontWeight: 800, cursor: 'pointer'
                  }}
                >
                  {settings.showLiveTicker ? 'ON' : 'OFF'}
                </button>
              </div>

              <input
                type="text"
                value={settings.customTickerText || ''}
                onChange={e => updateSettings({ customTickerText: e.target.value })}
                placeholder="Ticker message..."
                disabled={!settings.showLiveTicker}
                style={{
                  width: '100%', padding: '5px 8px', fontSize: 11, borderRadius: 5,
                  background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)',
                  color: '#fff', marginBottom: 6, outline: 'none',
                  opacity: settings.showLiveTicker ? 1 : 0.4
                }}
              />

              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {[
                  'SPL 2026 • LIVE AUCTION',
                  'MATCH DAY DRAFT • SQUADS READY',
                  'FINAL ROUND BIDS UNDERWAY',
                ].map((preset, idx) => (
                  <button
                    key={idx}
                    disabled={!settings.showLiveTicker}
                    onClick={() => updateSettings({ customTickerText: preset })}
                    style={{
                      padding: '2px 6px', borderRadius: 4, fontSize: 9, fontWeight: 700,
                      background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)',
                      color: 'var(--text-muted)', cursor: settings.showLiveTicker ? 'pointer' : 'not-allowed'
                    }}
                  >
                    Preset {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* STADIUM THEME PRESET */}
            <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: 10 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--spl-blue-light)', marginBottom: 6, textTransform: 'uppercase' }}>
                6. Stadium Theme
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 5 }}>
                {[
                  { id: 'DEFAULT', name: 'Stadium', bg: 'linear-gradient(135deg, #0A0D18, #1A56DB)' },
                  { id: 'GOLD',    name: 'Champions', bg: 'linear-gradient(135deg, #060811, #D97706)' },
                  { id: 'NEON',    name: 'Derby', bg: 'linear-gradient(135deg, #090A0F, #22C55E)' },
                  { id: 'CYBER',   name: 'Cyber', bg: 'linear-gradient(135deg, #050508, #DC2626)' },
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => updateSettings({ screenTheme: t.id })}
                    style={{
                      padding: '7px 4px', borderRadius: 5,
                      border: settings.screenTheme === t.id ? '2px solid #fff' : '1px solid var(--border-subtle)',
                      background: t.bg, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
