import React, { useState, useEffect, useRef } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { storageService } from '../../services/storageService';
import { soundEngine } from '../../services/soundService';
import { formatCurrency } from '../../utils/currency';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { SPLLogo } from '../../components/common/SPLLogo';
import {
  Download,
  Upload,
  RotateCcw,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Trash2,
  Users,
  Palette,
  Tv,
  Coins,
  Check,
  Sparkles,
  RefreshCw,
  Image as ImageIcon
} from 'lucide-react';
import { generateMockData } from '../../utils/mockDataGenerator';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { tournament, updateTournament, setCurrency, refreshData } = useTournament();
  const navigate = useNavigate();

  // Event Identity & Global Branding State (Logo & Tournament Name)
  const [eventNameInput, setEventNameInput] = useState(() => tournament?.name || 'SUPER PREMIER LEAGUE 2026');
  const [logoUrlInput, setLogoUrlInput] = useState('');
  const [eventBrandingSavedToast, setEventBrandingSavedToast] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const logoFileInputRef = useRef(null);

  useEffect(() => {
    if (tournament?.name) {
      setEventNameInput(tournament.name);
    }
  }, [tournament?.name]);

  const [squadFormat, setSquadFormat] = useState(() => storageService.getSquadFormat());
  const [formatSavedToast, setFormatSavedToast] = useState(false);

  // Currency State — Dollar ($), Rupee (₹), and BRICS (India, Russia, China collab currency)
  const activeCurrency = tournament?.currency || storageService.getCurrency() || '$';
  const [currencySavedToast, setCurrencySavedToast] = useState(false);
  const [customCurrencyInput, setCustomCurrencyInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleFormatSelect = (fmt) => {
    setSquadFormat(fmt);
    storageService.saveSquadFormat(fmt);
    setFormatSavedToast(true);
    setTimeout(() => setFormatSavedToast(false), 2500);
  };

  const handleSelectCurrency = (symbol) => {
    if (!symbol) return;
    const clean = symbol.trim();
    if (typeof setCurrency === 'function') {
      setCurrency(clean);
    } else {
      updateTournament({ currency: clean });
    }
    storageService.saveCurrency(clean);
    try {
      soundEngine.playFeedbackTone();
    } catch (_) {}
    setCurrencySavedToast(true);
    setTimeout(() => setCurrencySavedToast(false), 2500);
  };

  // ── EVENT BRANDING & LOGO HANDLERS ──
  const handleSaveEventName = (e) => {
    if (e) e.preventDefault();
    const cleanName = eventNameInput.trim() || 'SUPER PREMIER LEAGUE 2026';
    updateTournament({ name: cleanName });
    try { soundEngine.playFeedbackTone(); } catch (_) {}
    setEventBrandingSavedToast(true);
    setTimeout(() => setEventBrandingSavedToast(false), 2500);
  };

  const handleResetEventName = () => {
    const defaultName = 'SUPER PREMIER LEAGUE 2026';
    setEventNameInput(defaultName);
    updateTournament({ name: defaultName });
    try { soundEngine.playFeedbackTone(); } catch (_) {}
    setEventBrandingSavedToast(true);
    setTimeout(() => setEventBrandingSavedToast(false), 2500);
  };

  const handleLogoFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showAlert('Invalid File Format', 'Please upload a valid image file (PNG, JPG, SVG, WEBP).', 'danger');
      return;
    }

    setIsLogoUploading(true);

    // If SVG, preserve vector sharpness via raw dataURL
    if (file.type === 'image/svg+xml') {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target.result;
        updateTournament({ logoUrl: dataUrl });
        setIsLogoUploading(false);
        try { soundEngine.playFeedbackTone(); } catch (_) {}
        setEventBrandingSavedToast(true);
        setTimeout(() => setEventBrandingSavedToast(false), 2500);
      };
      reader.onerror = () => {
        setIsLogoUploading(false);
        showAlert('Upload Failed', 'Could not read image file.', 'danger');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }

    // For raster images, resize with Canvas to sharp crisp dimension (max 400px)
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIM = 400;
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > MAX_DIM) {
            h = Math.round((h * MAX_DIM) / w);
            w = MAX_DIM;
          }
        } else {
          if (h > MAX_DIM) {
            w = Math.round((w * MAX_DIM) / h);
            h = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);

        const compressedDataUrl = canvas.toDataURL('image/webp', 0.9);
        updateTournament({ logoUrl: compressedDataUrl });
        setIsLogoUploading(false);
        try { soundEngine.playFeedbackTone(); } catch (_) {}
        setEventBrandingSavedToast(true);
        setTimeout(() => setEventBrandingSavedToast(false), 2500);
      };
      img.onerror = () => {
        updateTournament({ logoUrl: evt.target.result });
        setIsLogoUploading(false);
        try { soundEngine.playFeedbackTone(); } catch (_) {}
        setEventBrandingSavedToast(true);
        setTimeout(() => setEventBrandingSavedToast(false), 2500);
      };
      img.src = evt.target.result;
    };
    reader.onerror = () => {
      setIsLogoUploading(false);
      showAlert('Upload Failed', 'Could not read image file.', 'danger');
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleApplyLogoUrl = () => {
    const url = logoUrlInput.trim();
    if (!url) return;
    updateTournament({ logoUrl: url });
    setLogoUrlInput('');
    try { soundEngine.playFeedbackTone(); } catch (_) {}
    setEventBrandingSavedToast(true);
    setTimeout(() => setEventBrandingSavedToast(false), 2500);
  };

  const handleResetLogo = () => {
    updateTournament({ logoUrl: '' });
    try { soundEngine.playFeedbackTone(); } catch (_) {}
    setEventBrandingSavedToast(true);
    setTimeout(() => setEventBrandingSavedToast(false), 2500);
  };

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    isAlert: false,
    onConfirm: null
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const showAlert = (title, message, type = 'info') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      confirmText: 'OK',
      type,
      isAlert: true,
      onConfirm: null
    });
  };

  const showConfirm = ({ title, message, confirmText, type = 'danger', onConfirm }) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      confirmText: confirmText || 'Confirm',
      cancelText: 'Cancel',
      type,
      isAlert: false,
      onConfirm
    });
  };

  const handleExportJSON = () => {
    const data = {
      tournament: storageService.getTournament(),
      teams: storageService.getTeams(),
      players: storageService.getPlayers(),
      auctionState: storageService.getAuctionState(),
      auctionHistory: storageService.getAuctionHistory(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spl_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed.tournament && parsed.teams && parsed.players) {
            storageService.saveTournament(parsed.tournament);
            storageService.saveTeams(parsed.teams);
            storageService.savePlayers(parsed.players);
            if (parsed.auctionHistory) storageService.saveAuctionHistory(parsed.auctionHistory);
            refreshData();
            showAlert('Import Successful', 'Tournament data and squad backups imported successfully!', 'success');
          } else {
            showAlert('Import Failed', 'Invalid backup file format. Required keys (tournament, teams, players) missing.', 'danger');
          }
        } catch {
          showAlert('Import Error', 'Failed to parse JSON backup file. Please ensure it is valid JSON.', 'danger');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleClearAll = () => {
    showConfirm({
      title: 'Clear All System Data',
      message: 'PERMANENT ACTION: This will completely wipe all teams, players, auction bids, and history (0 teams, 0 players).',
      confirmText: 'Wipe Everything',
      type: 'danger',
      onConfirm: () => {
        storageService.clearAllData();
        refreshData();
        showAlert('System Wiped', 'All teams, players, and auction history have been cleared to an empty slate.', 'info');
      }
    });
  };

  const handleLoadMockData = () => {
    showConfirm({
      title: 'Load Realistic Mock Data',
      message: 'This will add several realistic top clubs and world-class players to your current database. Proceed?',
      confirmText: 'Load Data',
      type: 'info',
      onConfirm: () => {
        const { teams, players } = generateMockData();
        
        // Append teams
        const existingTeams = storageService.getTeams();
        const newTeams = [...existingTeams, ...teams];
        storageService.saveTeams(newTeams);

        // Append players with generated portraits
        const existingPlayers = storageService.getPlayers();
        const playersWithPortraits = players.map(p => ({
          ...p,
          photoUrl: createRealisticPlayerPortrait(p.name, p.position)
        }));
        
        const newPlayers = [...existingPlayers, ...playersWithPortraits];
        storageService.savePlayers(newPlayers);
        
        refreshData();
        showAlert('Data Loaded', 'Successfully added mock teams and players!', 'success');
      }
    });
  };

  return (
    <div style={{ 
      padding: '24px 36px', 
      width: '100%', 
      boxSizing: 'border-box',
      display: 'flex', 
      flexDirection: 'column', 
      gap: 18 
    }}>

      {/* Broadcast Confirm Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        isAlert={modalConfig.isAlert}
      />

      {/* ── SQUAD FORMAT TOAST ── */}
      {formatSavedToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid #38BDF8',
          borderRadius: 10,
          padding: '14px 20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(56,189,248,0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backdropFilter: 'blur(12px)',
        }}>
          <CheckCircle2 style={{ width: 20, height: 20, color: '#38BDF8' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
              Format Synchronized
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: '#94a3b8' }}>
              Squad strength set to <strong>{squadFormat.toUpperCase()}</strong>. Projector displays updated in real-time.
            </div>
          </div>
        </div>
      )}

      {/* ── CURRENCY SYNCHRONIZED TOAST ── */}
      {currencySavedToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid #F59E0B',
          borderRadius: 10,
          padding: '14px 20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(245,158,11,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 style={{ width: 20, height: 20, color: '#F59E0B' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
              Currency Synchronized
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: '#94a3b8' }}>
              Tournament currency set to <strong style={{ color: '#F59E0B' }}>{activeCurrency}</strong>. All live bids, team budgets, and projector ticker updated in real-time.
            </div>
          </div>
        </div>
      )}

      {/* ── EVENT BRANDING SYNCHRONIZED TOAST ── */}
      {eventBrandingSavedToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9999,
          background: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid #38BDF8',
          borderRadius: 10,
          padding: '14px 20px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(56,189,248,0.35)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          backdropFilter: 'blur(12px)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <CheckCircle2 style={{ width: 20, height: 20, color: '#38BDF8' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
              Event Branding Synchronized
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: '#94a3b8' }}>
              Event Name & Official Logo updated live across top navigation, projector screen, and player cards!
            </div>
          </div>
        </div>
      )}

      {/* ── BROADCAST HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 4, height: 36, borderRadius: 2, background: 'var(--spl-blue-light, #38BDF8)' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#38BDF8', letterSpacing: '0.22em', textTransform: 'uppercase' }}>
              SYSTEM CONFIGURATION & PLATFORM ENGINE
            </div>
            <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 30, color: '#fff', textTransform: 'uppercase', lineHeight: 1, margin: '3px 0 0', letterSpacing: '0.03em' }}>
              Settings & Tournament Control
            </h1>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {/* Active Tournament Brand Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 20, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
            <SPLLogo size={18} customLogo={tournament?.logoUrl} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff', letterSpacing: '0.08em', textTransform: 'uppercase', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tournament?.name || 'SUPER PREMIER LEAGUE 2026'}
            </span>
          </div>

          {/* Active Currency Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 20, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#F59E0B', letterSpacing: '0.12em' }}>
              CURRENCY: <strong style={{ color: '#fff' }}>{activeCurrency}</strong> ({formatCurrency(5000, activeCurrency)})
            </span>
          </div>

          {/* Active Squad Format Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 15px', borderRadius: 20, background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.25)' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#38BDF8', letterSpacing: '0.12em' }}>
              SQUAD: <strong style={{ color: '#fff' }}>{squadFormat.toUpperCase()}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* ── 0. EVENT IDENTITY & OFFICIAL BRANDING (NAME & LOGO) ── */}
      <div style={{
        background: 'var(--spl-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 12,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(56, 189, 248, 0.15)', border: '1px solid rgba(56, 189, 248, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38BDF8'
            }}>
              <Sparkles size={16} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#38BDF8', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                EVENT IDENTITY & GLOBAL BRANDING
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                Configure tournament name and official logo — live synchronized across top-left navigation, projector screen home page, and player cards
              </div>
            </div>
          </div>

          {/* Status Pill */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px', borderRadius: 20,
            background: tournament?.logoUrl ? 'rgba(34, 197, 94, 0.1)' : 'rgba(56, 189, 248, 0.1)',
            border: `1px solid ${tournament?.logoUrl ? 'rgba(34, 197, 94, 0.25)' : 'rgba(56, 189, 248, 0.25)'}`
          }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: tournament?.logoUrl ? '#22C55E' : '#38BDF8' }} />
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, color: tournament?.logoUrl ? '#22C55E' : '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {tournament?.logoUrl ? 'CUSTOM EVENT LOGO ACTIVE' : 'DEFAULT SPL LOGO ACTIVE'}
            </span>
          </div>
        </div>

        {/* Two Columns Grid: Event Name (Left) & Event Logo with Live Previews (Right) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(400px, 1.25fr)', gap: 20, alignItems: 'stretch' }}>
          
          {/* Left Column: Event / Tournament Name */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(255,255,255,0.02)', padding: '18px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <label style={{ fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 800, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Event / Tournament Name
              </label>
              <p style={{ fontSize: 11.5, color: 'var(--text-secondary)', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                Shown on top-left sidebar header, projector screen home page title, player signing cards, and live broadcast ticker.
              </p>

              <form onSubmit={handleSaveEventName} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  value={eventNameInput}
                  onChange={e => setEventNameInput(e.target.value)}
                  placeholder="e.g. SUPER PREMIER LEAGUE 2026"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: 'var(--spl-elevated)',
                    border: '1px solid rgba(56, 189, 248, 0.4)',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    fontFamily: 'var(--font-display)',
                    letterSpacing: '0.04em',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="submit"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 16px', borderRadius: 6,
                      background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
                      color: '#fff', fontSize: 11.5, fontWeight: 800,
                      fontFamily: 'var(--font-display)', letterSpacing: '0.08em',
                      textTransform: 'uppercase', border: 'none', cursor: 'pointer',
                      boxShadow: '0 2px 10px rgba(2,132,199,0.3)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.15)'}
                    onMouseLeave={e => e.currentTarget.style.filter = 'none'}
                  >
                    <Check size={14} />
                    Save Name
                  </button>

                  <button
                    type="button"
                    onClick={handleResetEventName}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      padding: '8px 14px', borderRadius: 6,
                      background: 'rgba(255,255,255,0.05)',
                      color: '#94a3b8', fontSize: 11.5, fontWeight: 700,
                      fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                      border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94a3b8'; }}
                  >
                    <RotateCcw size={12} />
                    Reset Default
                  </button>
                </div>
              </form>
            </div>

            {/* Live Broadcast Text Preview */}
            <div style={{ marginTop: 'auto', paddingTop: 12, borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: '#64748b', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 4 }}>
                LIVE BROADCAST DISPLAY PREVIEW:
              </div>
              <div style={{
                fontFamily: 'var(--font-broadcast)',
                fontSize: 22,
                color: '#38BDF8',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                lineHeight: 1.15,
                wordBreak: 'break-word',
                textShadow: '0 2px 8px rgba(0,0,0,0.6)'
              }}>
                {eventNameInput || 'SUPER PREMIER LEAGUE 2026'}
              </div>
            </div>
          </div>

          {/* Right Column: Event Logo & Dual Live Previews */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, background: 'rgba(255,255,255,0.02)', padding: '18px 20px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 800, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', display: 'block' }}>
                  Official Event Logo
                </label>
                <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
                  Upload high-res PNG, JPG, SVG, or WEBP (or paste image URL).
                </span>
              </div>

              {tournament?.logoUrl && (
                <button
                  type="button"
                  onClick={handleResetLogo}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '5px 10px', borderRadius: 6,
                    background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444', fontSize: 10.5, fontWeight: 800,
                    fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                    cursor: 'pointer'
                  }}
                  title="Remove custom logo and restore official SPL logo"
                >
                  <RotateCcw size={12} />
                  Restore SPL Logo
                </button>
              )}
            </div>

            {/* Dual Mockup Preview: Projector Badge + Sidebar Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              
              {/* Preview 1: Projector Screen Home Badge Preview */}
              <div style={{
                background: 'radial-gradient(circle at 50% 30%, #0f172a 0%, #050811 100%)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 8,
                padding: '12px 10px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 }}>
                  Projector Screen Preview
                </div>
                <div style={{
                  width: 82, height: 82, borderRadius: '50%',
                  background: 'radial-gradient(circle at 50% 35%, rgba(15, 23, 42, 0.95) 0%, rgba(8, 12, 22, 0.98) 100%)',
                  border: '2px solid rgba(255, 255, 255, 0.22)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: 8
                }}>
                  <SPLLogo size={64} showGlow={false} customLogo={tournament?.logoUrl} />
                </div>
                <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 12, color: '#fff', marginTop: 8, letterSpacing: '0.04em', textTransform: 'uppercase', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {eventNameInput || 'SUPER PREMIER LEAGUE 2026'}
                </div>
              </div>

              {/* Preview 2: Leftside Top Sidebar Preview */}
              <div style={{
                background: 'var(--spl-navy)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                padding: 12,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                position: 'relative'
              }}>
                <div style={{ fontSize: 9.5, fontWeight: 800, color: '#94a3b8', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 10 }}>
                  Leftside Top Sidebar Preview
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <SPLLogo size={38} customLogo={tournament?.logoUrl} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {eventNameInput || 'SUPER PREMIER LEAGUE'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 3 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80' }} />
                      <span style={{ fontSize: 9.5, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        CONTROL CENTER
                      </span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Logo Upload & URL Controls */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 8, alignItems: 'center' }}>
                
                {/* File Upload Button */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 6,
                  background: isLogoUploading ? 'rgba(59,130,246,0.2)' : 'var(--spl-elevated)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: '#fff', fontSize: 11, fontWeight: 700,
                  cursor: isLogoUploading ? 'wait' : 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}>
                  <input
                    ref={logoFileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    onChange={handleLogoFileUpload}
                    disabled={isLogoUploading}
                    style={{ display: 'none' }}
                  />
                  {isLogoUploading ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} color="#F59E0B" />}
                  {isLogoUploading ? 'Optimizing...' : 'Upload Logo File'}
                </label>

                {/* Paste URL Input */}
                <input
                  type="text"
                  placeholder="Or paste logo URL (https://...)"
                  value={logoUrlInput}
                  onChange={e => setLogoUrlInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleApplyLogoUrl(); } }}
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 6,
                    background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)',
                    color: '#fff', fontSize: 11.5, outline: 'none', boxSizing: 'border-box'
                  }}
                />

                {/* Apply URL Button */}
                <button
                  type="button"
                  onClick={handleApplyLogoUrl}
                  disabled={!logoUrlInput.trim()}
                  style={{
                    padding: '8px 14px', borderRadius: 6,
                    background: logoUrlInput.trim() ? 'var(--spl-blue)' : 'rgba(255,255,255,0.1)',
                    color: '#fff', fontSize: 11, fontWeight: 800,
                    fontFamily: 'var(--font-display)', letterSpacing: '0.06em',
                    textTransform: 'uppercase', border: 'none',
                    cursor: logoUrlInput.trim() ? 'pointer' : 'not-allowed',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Apply
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ── 1. MATCH FORMAT & TACTICAL PITCH FORMATION ── */}
      <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 12, padding: '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#38BDF8', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
              MATCH FORMAT & SQUAD STRENGTH
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>• Controls field slot layout on both Projector Signing Reveal and Squad Showcase</span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          {[
            {
              id: '11s',
              name: '11s Standard',
              formation: '4-3-3 ATTACK',
              slots: '11 Pitch Slots (4-3-3)',
              desc: 'Standard 11-a-side pitch with GK, 4 Defenders, 3 Midfielders, and 3 Attackers.',
              accent: '#38BDF8',
            },
            {
              id: '7s',
              name: '7s Arena',
              formation: '2-1-2-1 DIAMOND',
              slots: '7 Pitch Slots (2-1-2-1)',
              desc: '7-a-side arena tactical pitch with GK, 2 Defenders, 1 Holding Mid, 2 Attack Mids, and 1 Striker.',
              accent: '#22C55E',
            },
            {
              id: '5s',
              name: '5s Box / Futsal',
              formation: '2-2 BOX',
              slots: '5 Pitch Slots (2-2)',
              desc: '5-a-side fast-paced box formation with GK, 2 Defenders, and 2 Strikers.',
              accent: '#F59E0B',
            },
          ].map(opt => {
            const isSelected = squadFormat === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => handleFormatSelect(opt.id)}
                style={{
                  background: isSelected ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.02)',
                  border: isSelected ? `2px solid ${opt.accent}` : '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 10,
                  padding: '14px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: isSelected ? `0 0 20px ${opt.accent}25, 0 4px 12px rgba(0,0,0,0.3)` : '0 2px 8px rgba(0,0,0,0.2)',
                  transition: 'all 0.18s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: 9,
                    background: isSelected ? `${opt.accent}25` : 'rgba(255,255,255,0.05)',
                    border: `1px solid ${isSelected ? opt.accent : 'rgba(255,255,255,0.1)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: 'var(--font-broadcast)',
                    fontSize: 18,
                    fontWeight: 900,
                    color: isSelected ? opt.accent : '#94a3b8',
                    flexShrink: 0
                  }}>
                    {opt.id.toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 17, color: '#fff', lineHeight: 1.1, letterSpacing: '0.02em' }}>
                      {opt.formation}
                    </div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 700, color: opt.accent, letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 3 }}>
                      {opt.slots}
                    </div>
                  </div>
                </div>

                <div style={{
                  padding: '5px 12px',
                  borderRadius: 6,
                  background: isSelected ? opt.accent : 'rgba(255,255,255,0.06)',
                  color: isSelected ? '#0f172a' : '#94a3b8',
                  fontSize: 10.5,
                  fontWeight: 900,
                  fontFamily: 'var(--font-display)',
                  letterSpacing: '0.12em',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  flexShrink: 0
                }}>
                  {isSelected && <CheckCircle2 size={12} />}
                  {isSelected ? 'ACTIVE' : 'SELECT'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 2. TOURNAMENT CURRENCY (Compact Small Single-Row Strip) ── */}
      <div style={{
        background: 'var(--spl-panel)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
        padding: '10px 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 12
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 30,
            height: 30,
            borderRadius: 7,
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#F59E0B'
          }}>
            <Coins size={15} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 800, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              CURRENCY TYPE
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
              Active currency across bids, team purses, and projector screens
            </div>
          </div>
        </div>

        {/* The 3 Currencies: Rupees (₹), Dollar ($), and BRICS (India/Russia/China) + Custom */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'INR', symbol: '₹', label: 'Rupees (₹)', sub: 'INR', color: '#22C55E' },
            { id: 'USD', symbol: '$', label: 'Dollar ($)', sub: 'USD', color: '#38BDF8' },
            { id: 'BRICS', symbol: 'BRICS', label: 'BRICS Unit', sub: 'IND • RUS • CHN', color: '#F59E0B' },
          ].map(curr => {
            const isSelected = activeCurrency === curr.symbol;
            return (
              <button
                key={curr.id}
                onClick={() => handleSelectCurrency(curr.symbol)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                  padding: '6px 14px',
                  borderRadius: 7,
                  cursor: 'pointer',
                  border: isSelected ? `1.5px solid ${curr.color}` : '1px solid rgba(255, 255, 255, 0.08)',
                  background: isSelected ? `${curr.color}22` : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? '#fff' : 'var(--text-secondary)',
                  boxShadow: isSelected ? `0 0 12px ${curr.color}35` : 'none',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = `${curr.color}66`;
                    e.currentTarget.style.background = 'var(--spl-elevated)';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{
                  fontFamily: 'var(--font-broadcast)',
                  fontSize: 16,
                  fontWeight: 900,
                  color: isSelected ? curr.color : '#fff',
                  lineHeight: 1
                }}>
                  {curr.symbol}
                </span>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: '0.04em'
                }}>
                  {curr.label}
                </span>
                {isSelected && (
                  <span style={{
                    padding: '2px 5px',
                    borderRadius: 4,
                    background: curr.color,
                    color: '#0f172a',
                    fontSize: 9,
                    fontWeight: 900,
                    fontFamily: 'var(--font-display)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 2
                  }}>
                    <Check size={9} /> ACTIVE
                  </span>
                )}
              </button>
            );
          })}

          {/* Tiny Custom Currency Trigger */}
          {showCustomInput ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (customCurrencyInput.trim()) {
                  handleSelectCurrency(customCurrencyInput.trim());
                  setShowCustomInput(false);
                  setCustomCurrencyInput('');
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <input
                type="text"
                placeholder="Custom..."
                value={customCurrencyInput}
                onChange={e => setCustomCurrencyInput(e.target.value)}
                maxLength={8}
                autoFocus
                style={{
                  width: 85,
                  padding: '5px 8px',
                  borderRadius: 6,
                  background: 'var(--spl-elevated)',
                  border: '1px solid #F59E0B',
                  color: '#fff',
                  fontFamily: 'var(--font-display)',
                  fontSize: 11,
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
              <button
                type="submit"
                disabled={!customCurrencyInput.trim()}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  background: '#F59E0B',
                  color: '#0f172a',
                  border: 'none',
                  fontFamily: 'var(--font-display)',
                  fontSize: 10.5,
                  fontWeight: 800,
                  cursor: customCurrencyInput.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Set
              </button>
              <button
                type="button"
                onClick={() => setShowCustomInput(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0 4px',
                  fontSize: 13
                }}
              >
                ✕
              </button>
            </form>
          ) : (
            <button
              onClick={() => setShowCustomInput(true)}
              style={{
                padding: '6px 11px',
                borderRadius: 7,
                cursor: 'pointer',
                border: (!['$', '₹', 'BRICS'].includes(activeCurrency)) ? '1.5px solid #F59E0B' : '1px dashed rgba(255, 255, 255, 0.15)',
                background: (!['$', '₹', 'BRICS'].includes(activeCurrency)) ? 'rgba(245, 158, 11, 0.18)' : 'transparent',
                color: (!['$', '₹', 'BRICS'].includes(activeCurrency)) ? '#F59E0B' : 'var(--text-muted)',
                fontFamily: 'var(--font-display)',
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <Sparkles size={11} />
              <span>{!['$', '₹', 'BRICS'].includes(activeCurrency) ? `Custom: ${activeCurrency}` : '+ Custom'}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── 3. DUAL-COLUMN MANAGEMENT MATRIX (Width 100%, 50% / 50% Columns — Exact Old Layout) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
        
        {/* LEFT COLUMN: Studio & Display Customization + Demo Data */}
        <div style={{
          background: 'var(--spl-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#A855F7', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
            STUDIO & DISPLAY CUSTOMIZATION
          </div>

          {/* Card Customization */}
          <button
            onClick={() => navigate('/admin/card-customization')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#A855F7'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Palette className="w-5 h-5" style={{ color: '#A855F7' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                Player Card Customization
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                Customize card themes, gradients, border glow, stat badges, and typography
              </div>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#A855F7', background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.25)', padding: '6px 12px', borderRadius: 6, flexShrink: 0 }}>
              OPEN STUDIO
            </span>
          </button>

          {/* Projector Customization */}
          <button
            onClick={() => navigate('/admin/projector-customization')}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#0EA5E9'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Tv className="w-5 h-5" style={{ color: '#0EA5E9' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                Projector Screen Customization
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                Customize live stadium backgrounds, theme filters, ambient shadows, and opacity
              </div>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#0EA5E9', background: 'rgba(14, 165, 233, 0.12)', border: '1px solid rgba(14, 165, 233, 0.25)', padding: '6px 12px', borderRadius: 6, flexShrink: 0 }}>
              OPEN STUDIO
            </span>
          </button>

          {/* Load Realistic Demo Data */}
          <button
            onClick={handleLoadMockData}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#EAB308'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Users className="w-5 h-5" style={{ color: '#EAB308' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                Load Demo Clubs & Players
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                Populate your database with top-tier clubs, managers, and world-class players
              </div>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#EAB308', background: 'rgba(234, 179, 8, 0.12)', border: '1px solid rgba(234, 179, 8, 0.25)', padding: '6px 12px', borderRadius: 6, flexShrink: 0 }}>
              LOAD DATA
            </span>
          </button>
        </div>

        {/* RIGHT COLUMN: Backups & Danger Zone */}
        <div style={{
          background: 'var(--spl-panel)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          padding: '18px 22px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#38BDF8', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: 2 }}>
            SYSTEM BACKUP & DATABASE CONTROL
          </div>

          {/* Export Backup JSON */}
          <button
            onClick={handleExportJSON}
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--spl-blue-light)'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Download className="w-5 h-5" style={{ color: '#38BDF8' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                Export Database Backup (.JSON)
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                Download offline JSON copy of all clubs, squads, players, and auction history
              </div>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#38BDF8', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.25)', padding: '6px 12px', borderRadius: 6, flexShrink: 0 }}>
              EXPORT
            </span>
          </button>

          {/* Import Backup JSON */}
          <label
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 10, padding: '14px 18px', cursor: 'pointer', textAlign: 'left',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--spl-green-light)'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Upload className="w-5 h-5" style={{ color: '#22C55E' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                Import Database Backup (.JSON)
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                Restore clubs, players, and tournament data from a local JSON file
              </div>
            </div>
            <span style={{ fontSize: 11, fontFamily: 'var(--font-display)', fontWeight: 800, color: '#22C55E', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', padding: '6px 12px', borderRadius: 6, flexShrink: 0 }}>
              IMPORT
            </span>
            <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
          </label>

          {/* Danger Zone: Clear System Data */}
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.25)',
              borderRadius: 10, padding: '14px 18px',
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 10, flexShrink: 0,
              background: 'rgba(220,38,38,0.15)', border: '1px solid rgba(220,38,38,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Trash2 className="w-5 h-5" style={{ color: '#EF4444' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, color: '#EF4444', letterSpacing: '0.04em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                Reset & Wipe System Data
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 12.5, color: 'var(--text-secondary)', marginTop: 3 }}>
                Permanently wipes all teams, players, bids, and transfer history
              </div>
            </div>
            <button
              onClick={handleClearAll}
              className="btn-danger"
              style={{
                padding: '8px 16px',
                fontSize: 11,
                fontFamily: 'var(--font-display)',
                fontWeight: 800,
                letterSpacing: '0.08em',
                background: '#dc2626',
                color: '#fff',
                borderRadius: 6,
                cursor: 'pointer',
                flexShrink: 0
              }}
            >
              WIPE DATA
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
