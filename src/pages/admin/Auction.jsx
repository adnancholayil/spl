import React, { useState, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { useTournament } from '../../context/TournamentContext';
import { formatCurrency } from '../../utils/currency';
import {
  Gavel, CheckCircle2, AlertCircle, Play, RotateCcw, Tv, Search,
  Volume2, VolumeX, ChevronRight, Radio, Crown,
  DollarSign, X, Zap, Sliders, Shield, ArrowUpRight, Check
} from 'lucide-react';
import { soundEngine } from '../../services/soundService';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';
import { ConfirmModal } from '../../components/common/ConfirmModal';

// Position color helper
const getPosColor = (pos) => {
  const p = (pos || '').toUpperCase();
  if (p === 'GK')                                           return '#F59E0B'; // Amber
  if (['CB','LB','RB','LWB','RWB'].includes(p))             return '#3B82F6'; // Blue
  if (['CM','DM','AM','CDM','CAM'].includes(p))             return '#10B981'; // Emerald
  return '#EF4444'; // Red
};

// Check if hex color is bright/white to avoid invisible text
const isLightColor = (hex) => {
  if (!hex) return false;
  const c = hex.replace('#', '');
  if (c.length !== 6) return false;
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return yiq >= 180;
};

export const Auction = () => {
  const { auctionState, selectPlayer, startBidding, placeBid, markSold, triggerSigning, markUnsold, revertLastAuction, undoLastBid, nextStage } = useAuction();
  const { tournament, teams, players, history } = useTournament();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [bidFlash, setBidFlash] = useState(false);
  const [filter, setFilter] = useState('UPCOMING');

  // Active increment mode: 5 ($5) or 10 ($10) for keyboard hotkeys 1-9
  const [activeIncrement, setActiveIncrement] = useState(5);

  // Custom Bid Modal state
  const [showCustomBidModal, setShowCustomBidModal] = useState(false);
  const [customBidTeamId, setCustomBidTeamId] = useState(null);
  const [customBidInput, setCustomBidInput] = useState('');

  // Generic confirm / alert modal config
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

  const showAlert = (title, message, type = 'danger') => {
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

  const activePlayer = players.find(p => p.id === auctionState?.currentPlayerId);
  const leadingTeam  = teams.find(t => t.id === auctionState?.leadingTeamId);

  // Trigger flash animation on bid update
  useEffect(() => {
    setBidFlash(true);
    const t = setTimeout(() => setBidFlash(false), 450);
    return () => clearTimeout(t);
  }, [auctionState?.currentBid]);

  // Execute a bid for a specific team
  const handleTeamBid = (teamId, increment = 5) => {
    if (auctionState?.stage !== 'BIDDING') return;

    // Prevent bidding if this team is ALREADY leading
    if (auctionState?.leadingTeamId === teamId) {
      showAlert('Already Leading', 'This club is already holding the highest bid and cannot bid against itself.', 'warning');
      return;
    }

    const team = teams.find(t => t.id === teamId);
    if (!team) return;

    // Calculate target bid
    let nextBid;
    if (!auctionState.leadingTeamId) {
      nextBid = increment === 10
        ? auctionState.currentBid + 10
        : auctionState.currentBid;
    } else {
      nextBid = auctionState.currentBid + increment;
    }

    if (nextBid > team.currentBalance) {
      showAlert(
        'Insufficient Budget',
        `${team.name} has only ${formatCurrency(team.currentBalance, tournament?.currency)} remaining. Target bid requires ${formatCurrency(nextBid, tournament?.currency)}.`,
        'warning'
      );
      return;
    }

    try {
      placeBid(teamId, nextBid);
    } catch (err) {
      showAlert('Bid Error', err.message);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (showCustomBidModal || showSoldModal || modalConfig.isOpen) return;

      if (e.code === 'Space') {
        e.preventDefault();
        nextStage();
      } else if ((e.key === 's' || e.key === 'S') && auctionState?.stage === 'BIDDING' && leadingTeam) {
        setShowSoldModal(true);
      } else if ((e.key === 'u' || e.key === 'U') && auctionState?.stage === 'BIDDING') {
        markUnsold();
      } else if ((e.key === 'z' || e.key === 'Z') && auctionState?.stage === 'BIDDING' && (auctionState?.bidHistory?.length || 0) > 0) {
        undoLastBid();
      } else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (teams[idx] && auctionState?.stage === 'BIDDING') {
          if (teams[idx].id === auctionState?.leadingTeamId) return;
          handleTeamBid(teams[idx].id, activeIncrement);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [auctionState, leadingTeam, teams, undoLastBid, showCustomBidModal, showSoldModal, modalConfig.isOpen, activeIncrement]);

  // Open custom bid modal for a specific team or the first eligible competing team
  const openCustomBid = (teamId = null) => {
    if (auctionState?.stage !== 'BIDDING') return;

    if (teamId) {
      if (teamId === auctionState?.leadingTeamId) {
        showAlert('Already Leading', 'This club is already holding the highest bid.', 'warning');
        return;
      }
      setCustomBidTeamId(teamId);
    } else {
      const competingTeam = teams.find(t => t.id !== auctionState?.leadingTeamId && t.currentBalance > auctionState?.currentBid);
      setCustomBidTeamId(competingTeam ? competingTeam.id : teams[0]?.id || null);
    }

    setCustomBidInput('');
    setShowCustomBidModal(true);
  };

  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    if (!customBidTeamId) {
      showAlert('No Club Selected', 'Please select a club to place the bid for.', 'warning');
      return;
    }

    const team = teams.find(t => t.id === customBidTeamId);
    if (!team) return;

    if (customBidTeamId === auctionState?.leadingTeamId) {
      showAlert('Already Leading', 'This club is already holding the highest bid and cannot bid against itself.', 'warning');
      return;
    }

    const val = parseFloat(customBidInput.trim().replace('$', ''));
    if (isNaN(val) || val <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid numeric dollar amount.', 'warning');
      return;
    }

    let targetBid = val > auctionState.currentBid ? val : auctionState.currentBid + val;

    if (targetBid <= auctionState.currentBid && auctionState.leadingTeamId) {
      showAlert('Bid Too Low', `Bid must be greater than current bid (${formatCurrency(auctionState.currentBid, tournament?.currency)}).`, 'warning');
      return;
    }

    if (targetBid > team.currentBalance) {
      showAlert('Insufficient Budget', `${team.name} only has ${formatCurrency(team.currentBalance, tournament?.currency)} remaining budget.`, 'warning');
      return;
    }

    try {
      placeBid(customBidTeamId, targetBid);
      setShowCustomBidModal(false);
      setCustomBidInput('');
    } catch (err) {
      showAlert('Bid Error', err.message);
    }
  };

  // Filter player queue
  const allFiltered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'ALL' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const stage = auctionState?.stage || 'IDLE';

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#070A0F',
      color: 'var(--text-primary)',
      overflow: 'hidden',
      userSelect: 'none'
    }}>

      {/* ── TOP HEADER TOOLBAR ── */}
      <header style={{
        height: 62,
        flexShrink: 0,
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#0B101B',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        zIndex: 20
      }}>
        {/* Left: Brand & Stage Info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: 'rgba(234,88,12,0.15)',
            border: '1px solid rgba(234,88,12,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Radio className="w-5 h-5 text-orange-500" />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: 16, fontWeight: 800,
              color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase'
            }}>
              Live Auction Control
            </span>

            {/* Stage Pill */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 10px', borderRadius: 999,
              background: stage === 'BIDDING' ? 'rgba(234,88,12,0.15)' : stage === 'SOLD' ? 'rgba(34,197,94,0.15)' : 'rgba(59,130,246,0.15)',
              border: stage === 'BIDDING' ? '1px solid rgba(234,88,12,0.4)' : stage === 'SOLD' ? '1px solid rgba(34,197,94,0.4)' : '1px solid rgba(59,130,246,0.3)',
            }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: stage === 'BIDDING' ? '#F97316' : stage === 'SOLD' ? '#22C55E' : '#3B82F6',
              }} />
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
                letterSpacing: '0.1em', color: stage === 'BIDDING' ? '#F97316' : stage === 'SOLD' ? '#22C55E' : '#60A5FA'
              }}>
                {stage}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Sound Toggle */}
          <button
            onClick={() => { setSoundMuted(!soundMuted); soundEngine.setEnabled(soundMuted); }}
            title={soundMuted ? 'Unmute Audio' : 'Mute Audio'}
            style={{
              padding: '7px 14px', borderRadius: 6,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text-primary)'
            }}
          >
            {soundMuted ? (
              <><VolumeX className="w-4 h-4 text-red-400" /> <span style={{ color: '#F87171' }}>Muted</span></>
            ) : (
              <><Volume2 className="w-4 h-4 text-emerald-400" /> <span style={{ color: '#E2E8F0' }}>Audio On</span></>
            )}
          </button>

          {/* Undo Bid */}
          {stage === 'BIDDING' && (auctionState?.bidHistory?.length || 0) > 0 && (
            <button
              onClick={() => undoLastBid()}
              style={{
                padding: '7px 14px', borderRadius: 6,
                background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.35)',
                color: '#F59E0B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700
              }}
              title="Undo last bid step (Z)"
            >
              <RotateCcw className="w-4 h-4" />
              Undo Bid ({auctionState.bidHistory.length})
            </button>
          )}

          {/* Undo Deal */}
          {history.length > 0 && (
            <button
              onClick={() => {
                showConfirm({
                  title: 'Revert Last Auction Deal',
                  message: 'Are you sure you want to revert the last completed auction transaction?',
                  confirmText: 'Revert Deal',
                  type: 'warning',
                  onConfirm: revertLastAuction
                });
              }}
              style={{
                padding: '7px 14px', borderRadius: 6,
                background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#F87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700
              }}
            >
              <RotateCcw className="w-4 h-4" />
              Undo Deal
            </button>
          )}

          {/* Projector Window */}
          <button
            onClick={() => window.open('/projector', '_blank', 'width=1280,height=720,toolbar=no')}
            style={{
              padding: '8px 18px', borderRadius: 6,
              background: 'var(--spl-orange)', border: 'none',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800,
              letterSpacing: '0.04em', textTransform: 'uppercase'
            }}
          >
            <Tv className="w-4 h-4" />
            Projector View
          </button>
        </div>
      </header>

      {/* ── THREE COLUMN BALANCED WORKSPACE ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ─── LEFT: PLAYER QUEUE DRAWER (310px) ─── */}
        <aside style={{
          width: 310,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: '#0B101B',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          {/* Search & Tabs */}
          <div style={{ padding: '14px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ position: 'relative', marginBottom: 10 }}>
              <Search className="w-4 h-4" style={{
                position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none'
              }} />
              <input
                type="text"
                placeholder="Search player name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '8px 30px 8px 34px',
                  background: '#070A0F', border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: 6, color: '#fff', fontFamily: 'var(--font-body)',
                  fontSize: 13, outline: 'none'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  style={{
                    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer'
                  }}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { id: 'UPCOMING', label: 'Upcoming' },
                { id: 'ALL',      label: 'All' },
                { id: 'SOLD',     label: 'Sold' },
              ].map(tab => {
                const isCur = filter === tab.id;
                const count = players.filter(p => tab.id === 'ALL' || p.status === tab.id).length;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    style={{
                      flex: 1, padding: '6px 0', borderRadius: 5, border: 'none',
                      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                      cursor: 'pointer',
                      background: isCur ? 'var(--spl-blue)' : 'rgba(255, 255, 255, 0.05)',
                      color: isCur ? '#fff' : 'var(--text-secondary)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5
                    }}
                  >
                    <span>{tab.label}</span>
                    <span style={{ fontSize: 10, opacity: 0.75, background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: 99 }}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* List */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px' }}>
            {allFiltered.map((player) => {
              const isActive = player.id === auctionState?.currentPlayerId;
              const isSold = player.status === 'SOLD';
              const isUnsold = player.status === 'UNSOLD';
              const posColor = getPosColor(player.position);

              return (
                <button
                  key={player.id}
                  onClick={() => selectPlayer(player.id)}
                  style={{
                    width: '100%', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '9px 12px', marginBottom: 5,
                    borderRadius: 7, cursor: 'pointer',
                    border: isActive ? `1.5px solid ${posColor}` : '1px solid transparent',
                    background: isActive ? `${posColor}18` : (isSold || isUnsold) ? 'transparent' : 'rgba(255,255,255,0.03)',
                    opacity: (isSold || isUnsold) ? 0.45 : 1,
                    boxShadow: isActive ? `0 4px 14px ${posColor}20` : 'none',
                    transition: 'all 0.12s ease'
                  }}
                >
                  {/* Photo */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 6, overflow: 'hidden',
                    background: '#070A0F', flexShrink: 0,
                    border: isActive ? `1.5px solid ${posColor}` : '1px solid rgba(255,255,255,0.08)'
                  }}>
                    <img
                      src={player.photoUrl || player.photo || ''}
                      alt=""
                      style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${player.photoScale || 1})` }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = createRealisticPlayerPortrait(player.name, player.position);
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 13.5, fontWeight: 700,
                      color: isActive ? '#fff' : 'var(--text-primary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {player.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800,
                        color: posColor, background: `${posColor}15`, padding: '1px 5px', borderRadius: 3
                      }}>
                        {(player.position || 'ST').toUpperCase()}
                      </span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--spl-gold-light)' }}>
                        {formatCurrency(player.basePrice, tournament?.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Badge */}
                  {isSold && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#22C55E', padding: '2px 6px', borderRadius: 4, background: 'rgba(34,197,94,0.15)' }}>SOLD</span>}
                  {isUnsold && <span style={{ fontSize: 9.5, fontWeight: 800, color: '#EF4444', padding: '2px 6px', borderRadius: 4, background: 'rgba(239,68,68,0.15)' }}>OUT</span>}
                </button>
              );
            })}

            {allFiltered.length === 0 && (
              <div style={{ padding: '36px 12px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-muted)' }}>
                NO PLAYERS FOUND
              </div>
            )}
          </div>
        </aside>

        {/* ─── CENTER: PERFECTLY ALIGNED HERO BROADCAST ARENA (FLEX 1) ─── */}
        <main style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 32px',
          overflowY: 'auto',
          background: 'radial-gradient(ellipse at 50% 30%, #0F172A 0%, #070A0F 85%)'
        }}>
          {activePlayer ? (
            <div style={{
              width: '100%',
              maxWidth: 840,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              margin: 'auto 0'
            }}>

              {/* ── UNIFIED HERO BROADCAST COMMAND CARD ── */}
              <div style={{
                background: '#0D1322',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
              }}>
                {/* Top Accent Strip with Player Position Color */}
                <div style={{ height: 4, background: getPosColor(activePlayer.position) }} />

                <div style={{ padding: '24px 28px' }}>

                  {/* ── ROW 1: HERO PLAYER DETAILS (FULL WIDTH, NEVER WRAPS!) ── */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 20 }}>
                    {/* Photo Frame */}
                    <div style={{
                      width: 115, height: 145, borderRadius: 10, overflow: 'hidden', flexShrink: 0,
                      background: '#070A0F',
                      border: `2px solid ${getPosColor(activePlayer.position)}60`,
                      boxShadow: `0 8px 24px ${getPosColor(activePlayer.position)}25`
                    }}>
                      <img
                        src={activePlayer.photoUrl || activePlayer.photo || ''}
                        alt={activePlayer.name}
                        style={{
                          width: '100%', height: '100%', objectFit: 'contain',
                          transform: `scale(${activePlayer.photoScale || 1})`
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = createRealisticPlayerPortrait(activePlayer.name, activePlayer.position);
                        }}
                      />
                    </div>

                    {/* Middle: Player Name, Position, Base Price with FULL WIDTH */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      {/* Meta Pill Row - NEVER WRAPS */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'nowrap' }}>
                        {/* Position */}
                        <span style={{
                          padding: '3px 9px', borderRadius: 5,
                          background: `${getPosColor(activePlayer.position)}20`,
                          border: `1px solid ${getPosColor(activePlayer.position)}50`,
                          fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 800,
                          color: getPosColor(activePlayer.position), letterSpacing: '0.08em',
                          whiteSpace: 'nowrap'
                        }}>
                          {(activePlayer.position || 'ST').toUpperCase()}
                        </span>

                        {/* Jersey Number */}
                        <span style={{
                          fontFamily: 'var(--font-broadcast)', fontSize: 22,
                          color: 'rgba(255,255,255,0.4)',
                          letterSpacing: '0.05em',
                          whiteSpace: 'nowrap'
                        }}>
                          #{String(activePlayer.number || '10').padStart(2, '0')}
                        </span>

                        {/* Stage Badge - NEVER WRAPS */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '3px 10px',
                          borderRadius: 999,
                          whiteSpace: 'nowrap',
                          background: stage === 'BIDDING' ? 'rgba(234,88,12,0.18)' : stage === 'SOLD' ? 'rgba(34,197,94,0.18)' : 'rgba(59,130,246,0.18)',
                          border: stage === 'BIDDING' ? '1px solid rgba(234,88,12,0.45)' : stage === 'SOLD' ? '1px solid rgba(34,197,94,0.45)' : '1px solid rgba(59,130,246,0.4)',
                          fontFamily: 'var(--font-display)',
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: '0.08em',
                          color: stage === 'BIDDING' ? '#F97316' : stage === 'SOLD' ? '#22C55E' : '#60A5FA'
                        }}>
                          <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: stage === 'BIDDING' ? '#F97316' : stage === 'SOLD' ? '#22C55E' : '#3B82F6',
                            boxShadow: `0 0 8px ${stage === 'BIDDING' ? '#F97316' : stage === 'SOLD' ? '#22C55E' : '#3B82F6'}`
                          }} />
                          <span>{stage === 'BIDDING' ? 'LIVE ON STAGE' : stage}</span>
                        </span>
                      </div>

                      {/* Player Full Name - Single Bold Line */}
                      <h1 style={{
                        fontFamily: 'var(--font-broadcast)',
                        fontSize: 'clamp(32px, 3.8vw, 46px)',
                        color: '#fff',
                        lineHeight: 1.1,
                        letterSpacing: '0.02em',
                        textTransform: 'uppercase',
                        marginBottom: 8,
                        whiteSpace: 'normal',
                        wordBreak: 'keep-all'
                      }}>
                        {activePlayer.name}
                      </h1>

                      {/* Base Price */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                          BASE PRICE:
                        </span>
                        <span style={{ color: 'var(--spl-gold-light)', fontWeight: 800, fontSize: 19, fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}>
                          {formatCurrency(activePlayer.basePrice, tournament?.currency)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ── ROW 2: LIVE BIDDING & DECISION CONSOLE (PERFECTLY GROUPED) ── */}
                  <div style={{
                    background: '#070A0F',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: 12,
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 20
                  }}>
                    {/* Left: Current Bid & Leading Team Status */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
                        color: 'var(--text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: 2
                      }}>
                        Current Highest Bid
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-broadcast)',
                        fontSize: 'clamp(44px, 4.8vw, 64px)',
                        color: bidFlash && stage === 'BIDDING' ? 'var(--spl-orange)' : 'var(--spl-gold-light)',
                        lineHeight: 1,
                        textShadow: '0 0 24px rgba(245,158,11,0.25)',
                        transition: 'all 0.3s ease',
                        marginBottom: 8
                      }}>
                        {formatCurrency(auctionState?.currentBid || activePlayer.basePrice, tournament?.currency)}
                      </div>

                      {/* Leading Team Display */}
                      {leadingTeam ? (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 10,
                          background: 'rgba(255, 255, 255, 0.04)',
                          border: `1.5px solid ${leadingTeam.primaryColor || '#F59E0B'}60`,
                          padding: '6px 14px',
                          borderRadius: 8
                        }}>
                          {leadingTeam.logoUrl ? (
                            <div style={{ width: 24, height: 24, borderRadius: 5, overflow: 'hidden', flexShrink: 0 }}>
                              <img src={leadingTeam.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                          ) : (
                            <div style={{
                              width: 24, height: 24, borderRadius: 5,
                              background: `${leadingTeam.primaryColor || '#3B82F6'}30`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-broadcast)', fontSize: 11,
                              color: isLightColor(leadingTeam.primaryColor) ? '#fff' : (leadingTeam.primaryColor || '#fff')
                            }}>
                              {leadingTeam.shortName || leadingTeam.name.slice(0, 3)}
                            </div>
                          )}

                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span style={{
                              fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800,
                              color: '#fff', textTransform: 'uppercase', letterSpacing: '0.04em'
                            }}>
                              {leadingTeam.name}
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800,
                              color: 'var(--spl-gold-light)', letterSpacing: '0.08em',
                              background: 'rgba(245,158,11,0.15)', padding: '1px 6px', borderRadius: 4
                            }}>
                              LEADING
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          fontFamily: 'var(--font-body)', fontSize: 12,
                          color: 'var(--text-muted)', fontStyle: 'italic',
                          display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--spl-orange)' }} />
                          Awaiting opening bid from clubs...
                        </div>
                      )}
                    </div>

                    {/* Right: Stage Decision Action Buttons (Clean & Solid!) */}
                    <div style={{ minWidth: 200, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
                      {stage === 'INTRO' && (
                        <button
                          onClick={startBidding}
                          style={{
                            padding: '16px 26px', borderRadius: 8,
                            background: 'linear-gradient(135deg, #1A56DB 0%, #1E40AF 100%)',
                            border: 'none', color: '#fff', cursor: 'pointer',
                            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.06em',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            boxShadow: '0 4px 18px rgba(26,86,219,0.4)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Play className="w-5 h-5 fill-white" />
                          START (SPACE)
                        </button>
                      )}

                      {stage === 'BIDDING' && (
                        <>
                          <button
                            onClick={() => {
                              if (!leadingTeam) {
                                showAlert('No Bids Placed', 'No bids have been placed for this player yet.', 'warning');
                                return;
                              }
                              setShowSoldModal(true);
                            }}
                            style={{
                              padding: '13px 22px', borderRadius: 8,
                              background: 'linear-gradient(135deg, #16A34A 0%, #15803D 100%)',
                              border: 'none', color: '#fff', cursor: 'pointer',
                              fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.06em',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              boxShadow: '0 4px 16px rgba(22,163,74,0.35)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            SOLD (S)
                          </button>

                          <button
                            onClick={() => markUnsold()}
                            style={{
                              padding: '9px 18px', borderRadius: 8,
                              background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.35)',
                              color: '#F87171', cursor: 'pointer',
                              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            UNSOLD (U)
                          </button>
                        </>
                      )}

                      {stage === 'SOLD' && (
                        <button
                          onClick={triggerSigning}
                          style={{
                            padding: '16px 26px', borderRadius: 8,
                            background: 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)',
                            border: 'none', color: '#fff', cursor: 'pointer',
                            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 800, letterSpacing: '0.06em',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            boxShadow: '0 4px 18px rgba(34,197,94,0.4)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          SIGNING REVEAL
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}

                      {stage === 'SIGNING' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'stretch' }}>
                          <div style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                            padding: '7px 12px', borderRadius: 6,
                            background: 'rgba(34, 197, 94, 0.12)',
                            border: '1px solid rgba(34, 197, 94, 0.35)',
                            color: '#4ADE80',
                            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '0.06em',
                            whiteSpace: 'nowrap'
                          }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ADE80', display: 'inline-block', boxShadow: '0 0 8px #4ADE80' }} />
                            PROJECTOR: REVEAL ACTIVE
                          </div>

                          <button
                            onClick={() => {
                              const upcoming = players.filter(p => !p.status || p.status === 'UPCOMING');
                              if (upcoming.length > 0) {
                                selectPlayer(upcoming[0].id);
                              } else {
                                showAlert('Draft Complete', 'All players in the draft pool have been auctioned!', 'success');
                              }
                            }}
                            style={{
                              padding: '12px 18px', borderRadius: 8,
                              background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                              border: 'none', color: '#fff', cursor: 'pointer',
                              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.05em',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                              boxShadow: '0 4px 18px rgba(59,130,246,0.35)',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            <span>NEXT PLAYER (SPACE)</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      )}

                      {stage === 'UNSOLD' && (
                        <button
                          onClick={() => {
                            const upcoming = players.filter(p => !p.status || p.status === 'UPCOMING');
                            if (upcoming.length > 0) {
                              selectPlayer(upcoming[0].id);
                            } else {
                              showAlert('Draft Complete', 'All players in the draft pool have been auctioned!', 'success');
                            }
                          }}
                          style={{
                            padding: '14px 22px', borderRadius: 8,
                            background: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
                            border: 'none', color: '#fff', cursor: 'pointer',
                            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800, letterSpacing: '0.05em',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: '0 4px 18px rgba(59,130,246,0.35)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <span>NEXT PLAYER (SPACE)</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ── ROW 3: HOTKEY BID MODE (KEYS 1-9) - NEVER WRAPS! ── */}
                  {stage === 'BIDDING' && (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      borderRadius: 8,
                      padding: '8px 16px',
                      marginTop: 12
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 800,
                          color: 'var(--text-secondary)', letterSpacing: '0.08em', textTransform: 'uppercase',
                          whiteSpace: 'nowrap'
                        }}>
                          Hotkey Mode (1–9):
                        </span>
                      </div>

                      {/* Segmented Increment Mode Pills - NEVER WRAPS */}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => setActiveIncrement(5)}
                          style={{
                            padding: '5px 14px', borderRadius: 6,
                            border: activeIncrement === 5 ? '1px solid var(--spl-blue-light)' : '1px solid rgba(255,255,255,0.08)',
                            background: activeIncrement === 5 ? 'var(--spl-blue)' : 'rgba(255,255,255,0.04)',
                            color: activeIncrement === 5 ? '#fff' : 'var(--text-muted)',
                            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {activeIncrement === 5 && <Check className="w-3 h-3" />}
                          +$5 Bid
                        </button>

                        <button
                          onClick={() => setActiveIncrement(10)}
                          style={{
                            padding: '5px 14px', borderRadius: 6,
                            border: activeIncrement === 10 ? '1px solid var(--spl-orange)' : '1px solid rgba(255,255,255,0.08)',
                            background: activeIncrement === 10 ? 'var(--spl-orange)' : 'rgba(255,255,255,0.04)',
                            color: activeIncrement === 10 ? '#fff' : 'var(--text-muted)',
                            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {activeIncrement === 10 && <Check className="w-3 h-3" />}
                          +$10 Bid
                        </button>

                        <button
                          onClick={() => openCustomBid(null)}
                          style={{
                            padding: '5px 14px', borderRadius: 6,
                            border: '1px solid rgba(139,92,246,0.3)',
                            background: 'rgba(139,92,246,0.12)',
                            color: '#DDD6FE',
                            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 4,
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <Sliders className="w-3 h-3 text-purple-400" />
                          Custom Bid...
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>

              {/* ── KEYBOARD SHORTCUTS BAR ── */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
                padding: '4px 0'
              }}>
                {[
                  { key: '1–9', desc: 'Club Bid' },
                  { key: 'SPACE', desc: 'Next Stage' },
                  { key: 'S', desc: 'Sold' },
                  { key: 'U', desc: 'Unsold' },
                  { key: 'Z', desc: 'Undo' }
                ].map(item => (
                  <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      padding: '2px 7px', borderRadius: 4,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      fontFamily: 'var(--font-display)', fontSize: 10.5, fontWeight: 800, color: '#fff',
                      whiteSpace: 'nowrap'
                    }}>
                      {item.key}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 11.5, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {item.desc}
                    </span>
                  </div>
                ))}
              </div>

            </div>
          ) : (
            /* Empty State */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: 16, textAlign: 'center'
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: 'rgba(234,88,12,0.12)', border: '1px solid rgba(234,88,12,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Gavel className="w-10 h-10 text-orange-500" />
              </div>
              <h3 style={{
                fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800,
                color: '#fff', textTransform: 'uppercase', letterSpacing: '0.06em'
              }}>
                Select a Player to Begin Auction
              </h3>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', maxWidth: 400 }}>
                Choose any upcoming player from the queue on the left to load them onto the main stage.
              </p>
            </div>
          )}
        </main>

        {/* ─── RIGHT: CLUB BIDS CONSOLE (370px) ─── */}
        <aside style={{
          width: 370,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: '#0B101B',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
        }}>
          {/* Header */}
          <div style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 800,
                color: 'var(--text-secondary)', letterSpacing: '0.12em', textTransform: 'uppercase'
              }}>
                Club Bids
              </span>
              <span style={{
                fontSize: 11, background: 'rgba(255,255,255,0.06)', color: 'var(--text-muted)',
                padding: '2px 7px', borderRadius: 999, fontWeight: 700
              }}>
                {teams.length}
              </span>
            </div>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
              color: 'var(--text-muted)', letterSpacing: '0.08em'
            }}>
              HOTKEYS 1–9
            </span>
          </div>

          {/* Teams List */}
          <div style={{
            flex: 1, overflowY: 'auto',
            padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10
          }}>
            {teams.map((team, idx) => {
              const isLeading = team.id === auctionState?.leadingTeamId;
              const hasBudgetFor5 = team.currentBalance >= (auctionState?.currentBid ? auctionState.currentBid + 5 : 0);
              const hasBudgetFor10 = team.currentBalance >= (auctionState?.currentBid ? auctionState.currentBid + 10 : 0);
              const pct = Math.max(0, Math.min(100, (team.currentBalance / team.startingBudget) * 100));

              // Compute next amounts for display preview
              const next5 = !auctionState?.leadingTeamId
                ? auctionState?.currentBid
                : auctionState?.currentBid + 5;
              const next10 = !auctionState?.leadingTeamId
                ? auctionState?.currentBid + 10
                : auctionState?.currentBid + 10;

              return (
                <div
                  key={team.id}
                  style={{
                    borderRadius: 10,
                    border: isLeading
                      ? `1.5px solid ${team.primaryColor || '#F59E0B'}`
                      : '1px solid rgba(255, 255, 255, 0.08)',
                    background: isLeading
                      ? `linear-gradient(135deg, ${team.primaryColor}15 0%, #111827 100%)`
                      : '#101624',
                    boxShadow: isLeading ? `0 0 16px ${team.primaryColor}20` : 'none',
                    overflow: 'hidden',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {/* Team Top Color Stripe */}
                  <div style={{ height: 4, background: team.primaryColor || 'var(--spl-blue)' }} />

                  <div style={{ padding: '12px 14px' }}>
                    {/* Header: Crest + Name + Hotkey Pill / Leading Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                        {team.logoUrl ? (
                          <div style={{
                            width: 30, height: 30, borderRadius: 6, overflow: 'hidden', flexShrink: 0,
                            padding: 1, background: '#070A0F', border: '1px solid rgba(255,255,255,0.08)'
                          }}>
                            <img src={team.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div style={{
                            width: 30, height: 30, borderRadius: 6,
                            background: `${team.primaryColor || '#3B82F6'}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'var(--font-broadcast)', fontSize: 12,
                            color: isLightColor(team.primaryColor) ? '#fff' : (team.primaryColor || '#fff'),
                            flexShrink: 0
                          }}>
                            {team.shortName || team.name.slice(0, 3)}
                          </div>
                        )}

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{
                            fontFamily: 'var(--font-display)', fontSize: 14.5, fontWeight: 700,
                            color: isLeading ? (isLightColor(team.primaryColor) ? '#fff' : team.primaryColor) : '#fff',
                            letterSpacing: '0.03em', textTransform: 'uppercase',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                          }}>
                            {team.name}
                          </div>
                          {team.managerName && (
                            <div style={{
                              fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                            }}>
                              {team.managerName}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pill on Top Right */}
                      {isLeading ? (
                        <span style={{
                          display: 'flex', alignItems: 'center', gap: 4,
                          fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800,
                          color: 'var(--spl-gold-light)', background: 'rgba(245,158,11,0.15)',
                          border: '1px solid rgba(245,158,11,0.3)', padding: '2px 7px', borderRadius: 4,
                          whiteSpace: 'nowrap'
                        }}>
                          <Crown className="w-3 h-3" />
                          LEADING
                        </span>
                      ) : (
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800,
                          color: 'var(--text-muted)', background: 'rgba(255,255,255,0.06)',
                          padding: '2px 6px', borderRadius: 4,
                          whiteSpace: 'nowrap'
                        }}>
                          KEY {idx + 1}
                        </span>
                      )}
                    </div>

                    {/* Remaining Budget Bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>
                          Remaining Budget
                        </span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--spl-gold-light)' }}>
                          {formatCurrency(team.currentBalance, tournament?.currency)}
                        </span>
                      </div>
                      <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${pct}%`,
                          background: team.primaryColor || 'var(--spl-blue)', transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>

                    {/* ── BIDDING ACTIONS ROW ── */}
                    {stage === 'BIDDING' && (
                      <div>
                        {/* CASE 1: ALREADY LEADING TEAM -> NO CALL/BID BUTTONS */}
                        {isLeading ? (
                          <div style={{
                            height: 44, borderRadius: 7,
                            background: 'linear-gradient(90deg, rgba(245,158,11,0.16) 0%, rgba(245,158,11,0.06) 100%)',
                            border: '1px solid rgba(245,158,11,0.35)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                            fontFamily: 'var(--font-display)', fontSize: 12.5, fontWeight: 800,
                            color: 'var(--spl-gold-light)', letterSpacing: '0.04em', textTransform: 'uppercase',
                            whiteSpace: 'nowrap'
                          }}>
                            <Crown className="w-4 h-4 text-amber-400" />
                            <span>HOLDING HIGHEST BID · {formatCurrency(auctionState?.currentBid, tournament?.currency)}</span>
                          </div>
                        ) : (
                          /* CASE 2: COMPETING CLUBS -> UNIFIED 3 BUTTONS ($5, $10, CUSTOM) */
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 7 }}>
                            {/* +$5 Bid Button */}
                            <button
                              disabled={!hasBudgetFor5}
                              onClick={() => handleTeamBid(team.id, 5)}
                              style={{
                                height: 44, borderRadius: 7,
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                background: hasBudgetFor5 ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                                color: hasBudgetFor5 ? '#fff' : 'var(--text-muted)',
                                fontFamily: 'var(--font-display)', cursor: hasBudgetFor5 ? 'pointer' : 'not-allowed',
                                opacity: hasBudgetFor5 ? 1 : 0.4,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.12s ease'
                              }}
                              onMouseEnter={e => { if (hasBudgetFor5) e.currentTarget.style.background = 'rgba(255,255,255,0.14)'; }}
                              onMouseLeave={e => { if (hasBudgetFor5) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                            >
                              <span style={{ fontSize: 13, fontWeight: 800 }}>+$5</span>
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--spl-gold-light)' }}>
                                {formatCurrency(next5, tournament?.currency)}
                              </span>
                            </button>

                            {/* +$10 Bid Button */}
                            <button
                              disabled={!hasBudgetFor10}
                              onClick={() => handleTeamBid(team.id, 10)}
                              style={{
                                height: 44, borderRadius: 7,
                                border: '1px solid rgba(255, 255, 255, 0.12)',
                                background: hasBudgetFor10 ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.02)',
                                color: hasBudgetFor10 ? '#fff' : 'var(--text-muted)',
                                fontFamily: 'var(--font-display)', cursor: hasBudgetFor10 ? 'pointer' : 'not-allowed',
                                opacity: hasBudgetFor10 ? 1 : 0.4,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.12s ease'
                              }}
                              onMouseEnter={e => { if (hasBudgetFor10) e.currentTarget.style.background = 'rgba(234,88,12,0.2)'; }}
                              onMouseLeave={e => { if (hasBudgetFor10) e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                            >
                              <span style={{ fontSize: 13, fontWeight: 800 }}>+$10</span>
                              <span style={{ fontSize: 10.5, fontWeight: 700, color: '#FDBA74' }}>
                                {formatCurrency(next10, tournament?.currency)}
                              </span>
                            </button>

                            {/* Custom Bid Button */}
                            <button
                              disabled={team.currentBalance <= (auctionState?.currentBid || 0)}
                              onClick={() => openCustomBid(team.id)}
                              style={{
                                height: 44, borderRadius: 7,
                                border: '1px solid rgba(139, 92, 246, 0.35)',
                                background: 'rgba(139, 92, 246, 0.12)',
                                color: '#DDD6FE',
                                fontFamily: 'var(--font-display)',
                                cursor: team.currentBalance > (auctionState?.currentBid || 0) ? 'pointer' : 'not-allowed',
                                opacity: team.currentBalance > (auctionState?.currentBid || 0) ? 1 : 0.4,
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.12s ease'
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.25)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'rgba(139, 92, 246, 0.12)'}
                            >
                              <span style={{ fontSize: 12, fontWeight: 800, color: '#C084FC' }}>CUSTOM</span>
                              <span style={{ fontSize: 10, color: '#A855F7' }}>Amount...</span>
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {teams.length === 0 && (
              <div style={{ padding: '36px 12px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-muted)' }}>
                NO CLUBS REGISTERED
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── SOLD CONFIRMATION MODAL ── */}
      {showSoldModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: '#111827', border: '1px solid rgba(34,197,94,0.35)',
            borderRadius: 14, padding: '30px 32px', maxWidth: 420, width: '90%', textAlign: 'center'
          }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 32, color: '#22C55E', marginBottom: 8 }}>
              CONFIRM PLAYER SOLD
            </h3>

            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>
              Transfer <strong style={{ color: 'var(--spl-gold-light)' }}>{activePlayer?.name}</strong> to{' '}
              <strong style={{ color: '#fff' }}>{leadingTeam?.name}</strong> for{' '}
              <strong style={{ color: '#22C55E', fontSize: 17 }}>
                {formatCurrency(auctionState?.currentBid, tournament?.currency)}
              </strong>?
            </p>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowSoldModal(false)}
                className="btn-ghost"
                style={{ flex: 1, padding: '11px 0', fontSize: 13, borderRadius: 6 }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowSoldModal(false); markSold(); }}
                className="btn-sold"
                style={{ flex: 1, padding: '11px 0', fontSize: 13, borderRadius: 6 }}
              >
                Confirm Deal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── CUSTOM BID MODAL ── */}
      {showCustomBidModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 70,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: '#111827', border: '1px solid rgba(139, 92, 246, 0.4)',
            borderRadius: 14, padding: 24, maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
                color: '#A78BFA', letterSpacing: '0.12em', textTransform: 'uppercase'
              }}>
                Custom Bid Entry
              </div>
              <button
                onClick={() => setShowCustomBidModal(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 26, color: '#fff', marginBottom: 16 }}>
              Place Custom Amount Bid
            </h3>

            {/* Select Club */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Bidding Club:
              </label>
              <select
                value={customBidTeamId || ''}
                onChange={e => setCustomBidTeamId(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', background: '#070A0F',
                  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 7, color: '#fff',
                  fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none'
                }}
              >
                {teams.map(t => {
                  const isCurLeading = t.id === auctionState?.leadingTeamId;
                  return (
                    <option key={t.id} value={t.id} disabled={isCurLeading}>
                      {t.name} {isCurLeading ? '(Already Leading)' : `(Budget: ${formatCurrency(t.currentBalance, tournament?.currency)})`}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Context bar */}
            <div style={{
              background: 'rgba(0,0,0,0.3)', borderRadius: 7, padding: '10px 12px', marginBottom: 14,
              display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-display)', fontSize: 12
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>CURRENT: </span>
                <strong style={{ color: 'var(--spl-gold-light)' }}>
                  {formatCurrency(auctionState?.currentBid, tournament?.currency)}
                </strong>
              </div>
              {customBidTeamId && (
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>BUDGET: </span>
                  <strong style={{ color: '#fff' }}>
                    {formatCurrency(teams.find(t => t.id === customBidTeamId)?.currentBalance, tournament?.currency)}
                  </strong>
                </div>
              )}
            </div>

            {/* Quick chips */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>
                Quick Add:
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[15, 25, 50, 100].map(addVal => (
                  <button
                    key={addVal}
                    type="button"
                    onClick={() => {
                      const base = auctionState?.currentBid || 0;
                      setCustomBidInput(String(base + addVal));
                    }}
                    style={{
                      flex: 1, padding: '7px 0', borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)',
                      fontFamily: 'var(--font-display)', fontSize: 11.5, fontWeight: 700, color: '#fff', cursor: 'pointer'
                    }}
                  >
                    +${addVal}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleCustomBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 6 }}>
                  Target Bid Amount (Total or Jump):
                </label>
                <div style={{ position: 'relative' }}>
                  <DollarSign className="w-5 h-5" style={{
                    position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                    color: 'var(--spl-gold-light)', pointerEvents: 'none'
                  }} />
                  <input
                    type="number"
                    step="1"
                    min="1"
                    autoFocus
                    value={customBidInput}
                    onChange={e => setCustomBidInput(e.target.value)}
                    placeholder={`e.g. ${(auctionState?.currentBid || 5000) + 25}`}
                    style={{
                      width: '100%', padding: '11px 14px 11px 36px',
                      fontSize: 18, fontFamily: 'var(--font-broadcast)',
                      background: '#070A0F', border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: 7, color: 'var(--spl-gold-light)', outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  type="button"
                  onClick={() => setShowCustomBidModal(false)}
                  className="btn-ghost"
                  style={{ flex: 1, padding: '10px 0', fontSize: 13, borderRadius: 6 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px 0', fontSize: 13, borderRadius: 6 }}
                >
                  Submit Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Alert/Confirm Modal */}
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
    </div>
  );
};
