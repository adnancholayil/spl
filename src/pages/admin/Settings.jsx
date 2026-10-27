import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { storageService } from '../../services/storageService';
import { soundEngine } from '../../services/soundService';
import { formatCurrency } from '../../utils/currency';
import { ConfirmModal } from '../../components/common/ConfirmModal';
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
  Sparkles
} from 'lucide-react';
import { generateMockData } from '../../utils/mockDataGenerator';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { tournament, updateTournament, setCurrency, refreshData } = useTournament();
  const navigate = useNavigate();

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
