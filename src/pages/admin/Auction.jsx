import React, { useState, useEffect } from 'react';
import { useAuction } from '../../context/AuctionContext';
import { useTournament } from '../../context/TournamentContext';
import { formatCurrency } from '../../utils/currency';
import {
  Gavel, CheckCircle2, AlertCircle, Play, RotateCcw, Tv, Search,
  Volume2, VolumeX, ChevronRight, ChevronDown, Radio
} from 'lucide-react';
import { soundEngine } from '../../services/soundService';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';
import { ConfirmModal } from '../../components/common/ConfirmModal';

// Position color helper
const getPosColor = (pos) => {
  const p = (pos || '').toUpperCase();
  if (p === 'GK')                                           return '#F59E0B';
  if (['CB','LB','RB','LWB','RWB'].includes(p))             return '#3B82F6';
  if (['CM','DM','AM','CDM','CAM'].includes(p))             return '#22C55E';
  return '#EF4444';
};

export const Auction = () => {
  const { auctionState, selectPlayer, startBidding, placeBid, markSold, triggerSigning, markUnsold, revertLastAuction, undoLastBid, nextStage } = useAuction();
  const { tournament, teams, players, history } = useTournament();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);
  const [bidFlash, setBidFlash] = useState(false);
  const [filter, setFilter] = useState('UPCOMING');

  // Custom modal state
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

  // Flash animation on bid update
  useEffect(() => {
    setBidFlash(true);
    const t = setTimeout(() => setBidFlash(false), 400);
    return () => clearTimeout(t);
  }, [auctionState?.currentBid]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
      if (e.code === 'Space') { e.preventDefault(); nextStage(); }
      else if ((e.key === 's' || e.key === 'S') && auctionState?.stage === 'BIDDING' && leadingTeam) setShowSoldModal(true);
      else if ((e.key === 'u' || e.key === 'U') && auctionState?.stage === 'BIDDING') markUnsold();
      else if ((e.key === 'z' || e.key === 'Z') && auctionState?.stage === 'BIDDING' && auctionState?.bidHistory?.length > 0) undoLastBid();
      else if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key, 10) - 1;
        if (teams[idx] && auctionState?.stage === 'BIDDING') handleTeamBid(teams[idx].id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [auctionState, leadingTeam, teams, undoLastBid]);

  const [showCustomBidModal, setShowCustomBidModal] = useState(false);
  const [customBidInput, setCustomBidInput] = useState('');

  const handleTeamBid = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return;
    // First call starting bid starts at $10
    const nextBid = (!auctionState.leadingTeamId || auctionState.currentBid < 10)
      ? 10
      : auctionState.currentBid + (tournament?.minIncrement || 5);
    try { placeBid(teamId, nextBid); } catch (err) { showAlert('Bid Error', err.message); }
  };

  const handleQuickIncrement = (inc) => {
    if (!auctionState?.leadingTeamId) {
      showAlert('No Leading Bid', 'Please click a club button to place the opening bid ($10) first.', 'warning');
      return;
    }
    try { placeBid(auctionState.leadingTeamId, auctionState.currentBid + inc); } catch (err) { showAlert('Bid Error', err.message); }
  };

  const handleCustomBidSubmit = (e) => {
    e.preventDefault();
    const val = parseFloat(customBidInput);
    if (isNaN(val) || val <= 0) {
      showAlert('Invalid Amount', 'Please enter a valid dollar amount.', 'warning');
      return;
    }
    if (!auctionState?.leadingTeamId) {
      showAlert('No Leading Club', 'Please click a club button to select the bidding club first.', 'warning');
      return;
    }
    try {
      const targetBid = val > auctionState.currentBid ? val : auctionState.currentBid + val;
      placeBid(auctionState.leadingTeamId, targetBid);
      setShowCustomBidModal(false);
      setCustomBidInput('');
    } catch (err) {
      showAlert('Bid Error', err.message);
    }
  };

  const allFiltered = players.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFilter = filter === 'ALL' || p.status === filter;
    return matchSearch && matchFilter;
  });

  const stage = auctionState?.stage || 'IDLE';

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--spl-black)', overflow: 'hidden' }}>

      {/* ── TOP TOOLBAR ── */}
      <div style={{
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        height: 62,
        background: 'var(--spl-navy)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: 'rgba(234,88,12,0.15)',
            border: '1px solid rgba(234,88,12,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Radio className="w-5 h-5" style={{ color: 'var(--spl-orange)' }} />
          </div>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-primary)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}>
              Live Auction Control
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                color: 'var(--text-muted)',
                letterSpacing: '0.1em',
              }}>
                STAGE:
              </span>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: 12,
                fontWeight: 700,
                color: stage === 'BIDDING' ? 'var(--spl-orange)' : stage === 'SOLD' ? '#22C55E' : 'var(--spl-blue-light)',
                letterSpacing: '0.15em',
              }}>
                {stage}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => { setSoundMuted(!soundMuted); soundEngine.setEnabled(soundMuted); }}
            title="Toggle Sound"
            style={{
              padding: '8px 12px', borderRadius: 6,
              background: 'var(--spl-elevated)', border: '1px solid var(--border-default)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-primary)',
            }}
          >
            {soundMuted
              ? <><VolumeX className="w-4 h-4" style={{ color: '#f87171' }} /> <span>Muted</span></>
              : <><Volume2 className="w-4 h-4" style={{ color: '#22C55E' }} /> <span>Audio On</span></>
            }
          </button>

          {stage === 'BIDDING' && (auctionState?.bidHistory?.length || 0) > 0 && (
            <button
              onClick={() => undoLastBid()}
              className="btn-ghost"
              style={{ padding: '8px 14px', fontSize: 13, gap: 6, borderColor: '#f59e0b', color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}
              title="Undo last bid step (Z)"
            >
              <RotateCcw className="w-4 h-4" />
              Undo Bid ({auctionState.bidHistory.length})
            </button>
          )}

          {history.length > 0 && (
            <button
              onClick={() => {
                showConfirm({
                  title: 'Revert Last Auction',
                  message: 'Are you sure you want to revert the last completed auction transaction?',
                  confirmText: 'Revert Auction',
                  type: 'warning',
                  onConfirm: revertLastAuction
                });
              }}
              className="btn-danger"
              style={{ padding: '8px 14px', fontSize: 13, gap: 6 }}
            >
              <RotateCcw className="w-4 h-4" />
              Undo Deal
            </button>
          )}

          <button
            onClick={() => window.open('/projector', '_blank', 'width=1280,height=720,toolbar=no')}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: 13, gap: 6, background: 'var(--spl-orange)' }}
          >
            <Tv className="w-4 h-4" />
            Projector View
          </button>
        </div>
      </div>

      {/* ── THREE COLUMN BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* ─── LEFT: Player Queue ─── */}
        <div style={{
          width: 300,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--spl-navy)',
          borderRight: '1px solid var(--border-subtle)',
        }}>
          {/* Search */}
          <div style={{ padding: '14px 14px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{ position: 'relative' }}>
              <Search className="w-4 h-4" style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                color: 'var(--text-muted)', pointerEvents: 'none',
              }} />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px 9px 36px',
                  background: 'var(--spl-black)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 6, color: 'var(--text-primary)',
                  fontFamily: 'var(--font-body)', fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
            {/* Quick filters */}
            <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
              {['UPCOMING', 'ALL', 'SOLD'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    flex: 1, padding: '6px 0',
                    borderRadius: 5, border: 'none',
                    fontFamily: 'var(--font-display)',
                    fontSize: 11, fontWeight: 700,
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    background: filter === f ? 'var(--spl-blue)' : 'var(--spl-elevated)',
                    color: filter === f ? '#fff' : 'var(--text-muted)',
                    transition: 'background 0.15s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Player list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
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
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '9px 10px', marginBottom: 4,
                    borderRadius: 6, cursor: 'pointer',
                    border: isActive ? `1px solid ${posColor}60` : '1px solid transparent',
                    background: isActive
                      ? `${posColor}15`
                      : (isSold || isUnsold) ? 'transparent' : 'var(--spl-elevated)',
                    opacity: (isSold || isUnsold) ? 0.45 : 1,
                    transition: 'background 0.12s, opacity 0.12s',
                  }}
                >
                  {/* Photo */}
                  <div style={{
                    width: 40, height: 40, borderRadius: 6, overflow: 'hidden',
                    background: 'var(--spl-panel)', flexShrink: 0,
                    border: isActive ? `1px solid ${posColor}` : '1px solid var(--border-subtle)',
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
                      fontFamily: 'var(--font-display)',
                      fontSize: 14, fontWeight: 700,
                      color: isActive ? '#fff' : 'var(--text-primary)',
                      letterSpacing: '0.04em',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {player.name}
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 11,
                      color: posColor,
                      fontWeight: 600,
                    }}>
                      {(player.position || 'ST').toUpperCase()} · {formatCurrency(player.basePrice, tournament?.currency)}
                    </div>
                  </div>

                  {/* Status badge */}
                  {isSold && <span className="badge-sold" style={{ fontSize: 9 }}>SOLD</span>}
                  {isUnsold && <span className="badge-unsold" style={{ fontSize: 9 }}>OUT</span>}
                </button>
              );
            })}

            {allFiltered.length === 0 && (
              <div style={{
                padding: '36px 12px', textAlign: 'center',
                fontFamily: 'var(--font-display)', fontSize: 13,
                color: 'var(--text-muted)', letterSpacing: '0.1em',
              }}>
                NO PLAYERS FOUND
              </div>
            )}
          </div>
        </div>

        {/* ─── CENTER: Active Player Stage ─── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '28px 32px',
          overflowY: 'auto',
          position: 'relative',
          background: 'var(--spl-black)',
        }}>
          {activePlayer ? (
            <div style={{ width: '100%', maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 24, margin: 'auto 0' }}>
              {/* Player presentation card */}
              <div style={{ width: '100%' }}>
                <div style={{
                  display: 'flex', gap: 28, alignItems: 'center',
                  background: 'var(--spl-panel)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  padding: '24px 32px',
                  width: '100%',
                  position: 'relative', overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
                }}>
                  {/* Position accent bar */}
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 4,
                    background: getPosColor(activePlayer.position),
                  }} />

                  {/* Player photo */}
                  <div style={{
                    width: 100, height: 125, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
                    background: 'var(--spl-elevated)',
                    border: '1px solid var(--border-default)',
                  }}>
                    <img
                      src={activePlayer.photoUrl || activePlayer.photo || ''}
                      alt={activePlayer.name}
                      style={{ width: '100%', height: '100%', objectFit: 'contain', transform: `scale(${activePlayer.photoScale || 1})` }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = createRealisticPlayerPortrait(activePlayer.name, activePlayer.position);
                      }}
                    />
                  </div>

                  {/* Player info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Position + Number */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{
                        padding: '3px 9px', borderRadius: 4,
                        background: `${getPosColor(activePlayer.position)}18`,
                        border: `1px solid ${getPosColor(activePlayer.position)}40`,
                        fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                        color: getPosColor(activePlayer.position), letterSpacing: '0.1em',
                      }}>
                        {(activePlayer.position || 'ST').toUpperCase()}
                      </span>
                      <span style={{
                        fontFamily: 'var(--font-broadcast)', fontSize: 20,
                        color: 'rgba(255,255,255,0.35)',
                      }}>
                        #{String(activePlayer.number || '10').padStart(2, '0')}
                      </span>
                    </div>

                    {/* Name */}
                    <div style={{
                      fontFamily: 'var(--font-broadcast)',
                      fontSize: 'clamp(26px, 3.5vw, 42px)',
                      color: '#fff',
                      lineHeight: 1.05,
                      letterSpacing: '0.02em',
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}>
                      {activePlayer.name}
                    </div>

                    {/* Base price */}
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 13,
                      color: 'var(--text-secondary)', letterSpacing: '0.1em',
                    }}>
                      BASE PRICE &nbsp;
                      <span style={{ color: 'var(--spl-gold-light)', fontWeight: 800, fontSize: 17 }}>
                        {formatCurrency(activePlayer.basePrice, tournament?.currency)}
                      </span>
                    </div>
                  </div>

                  {/* Stage badge */}
                  <div style={{
                    position: 'absolute', top: 14, right: 14,
                    padding: '4px 10px', borderRadius: 4,
                    background: stage === 'BIDDING' ? 'rgba(234,88,12,0.18)' : 'rgba(26,86,219,0.15)',
                    border: stage === 'BIDDING' ? '1px solid rgba(234,88,12,0.4)' : '1px solid rgba(26,86,219,0.3)',
                  }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                      letterSpacing: '0.15em',
                      color: stage === 'BIDDING' ? 'var(--spl-orange-light)' : 'var(--spl-blue-light)',
                    }}>
                      {stage}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── BID CONTROL PANEL ── */}
              <div style={{ width: '100%' }}>

                {/* Current bid display */}
                <div style={{
                  background: 'var(--spl-panel)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 12,
                  padding: '22px 28px',
                  marginBottom: 14,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                }}>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                      color: 'var(--text-secondary)', letterSpacing: '0.2em', marginBottom: 6, textTransform: 'uppercase',
                    }}>
                      CURRENT BID
                    </div>
                    <div
                      style={{
                        fontFamily: 'var(--font-broadcast)',
                        fontSize: 'clamp(36px, 5vw, 64px)',
                        color: bidFlash && stage === 'BIDDING' ? 'var(--spl-orange)' : 'var(--spl-gold-light)',
                        lineHeight: 1,
                        transition: 'color 0.3s ease',
                      }}
                    >
                      {formatCurrency(auctionState?.currentBid || activePlayer.basePrice, tournament?.currency)}
                    </div>
                    {leadingTeam ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                        <div style={{ width: 4, height: 20, borderRadius: 2, background: leadingTeam.primaryColor }} />
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
                          color: leadingTeam.primaryColor, letterSpacing: '0.04em', textTransform: 'uppercase',
                        }}>
                          {leadingTeam.name}
                        </span>
                      </div>
                    ) : (
                      <div style={{
                        fontFamily: 'var(--font-body)', fontSize: 13,
                        color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic',
                      }}>
                        No bids yet placed
                      </div>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {stage === 'INTRO' && (
                      <button
                        onClick={startBidding}
                        className="btn-primary"
                        style={{ padding: '14px 28px', fontSize: 16, gap: 8 }}
                      >
                        <Play className="w-5 h-5" style={{ fill: '#fff' }} />
                        START BIDDING
                      </button>
                    )}

                    {stage === 'BIDDING' && (
                      <>
                        <button
                          onClick={() => {
                            if (!leadingTeam) { showAlert('No Bids Placed', 'No bids have been placed for this player yet.', 'warning'); return; }
                            setShowSoldModal(true);
                          }}
                          className="btn-sold"
                          style={{ padding: '14px 26px', fontSize: 16, gap: 8 }}
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          SOLD (S)
                        </button>
                        <button
                          onClick={() => markUnsold()}
                          className="btn-danger"
                          style={{ padding: '10px 18px', fontSize: 13, gap: 6 }}
                        >
                          <AlertCircle className="w-4 h-4" />
                          UNSOLD (U)
                        </button>
                        {(auctionState?.bidHistory?.length || 0) > 0 && (
                          <button
                            onClick={() => undoLastBid()}
                            className="btn-ghost"
                            style={{ padding: '9px 16px', fontSize: 13, gap: 6, borderColor: '#f59e0b', color: '#f59e0b', background: 'rgba(245,158,11,0.1)' }}
                            title="Revert to previous bid (Z)"
                          >
                            <RotateCcw className="w-4 h-4" />
                            UNDO BID (Z)
                          </button>
                        )}
                      </>
                    )}

                    {stage === 'SOLD' && (
                      <button
                        onClick={triggerSigning}
                        className="btn-primary"
                        style={{ padding: '14px 24px', fontSize: 16, gap: 8 }}
                      >
                        SIGNING REVEAL
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Calling / Increment options */}
                {stage === 'BIDDING' && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[5, 10, 20, 30, 50, 100].map(inc => (
                      <button
                        key={inc}
                        onClick={() => handleQuickIncrement(inc)}
                        disabled={!auctionState?.leadingTeamId}
                        style={{
                          flex: '1 0 12%', padding: '10px 8px',
                          background: 'var(--spl-elevated)',
                          border: '1px solid var(--border-default)',
                          borderRadius: 6,
                          fontFamily: 'var(--font-display)',
                          fontSize: 13, fontWeight: 700,
                          color: auctionState?.leadingTeamId ? 'var(--text-primary)' : 'var(--text-muted)',
                          cursor: auctionState?.leadingTeamId ? 'pointer' : 'not-allowed',
                          opacity: auctionState?.leadingTeamId ? 1 : 0.4,
                          letterSpacing: '0.04em',
                          transition: 'all 0.12s',
                        }}
                        onMouseEnter={e => { if (auctionState?.leadingTeamId) e.currentTarget.style.background = 'var(--spl-surface)'; }}
                        onMouseLeave={e => e.currentTarget.style.background = 'var(--spl-elevated)'}
                      >
                        +${inc}
                      </button>
                    ))}
                    
                    {/* Custom Bid Button */}
                    <button
                      onClick={() => setShowCustomBidModal(true)}
                      disabled={!auctionState?.leadingTeamId}
                      style={{
                        flex: '1 0 16%', padding: '10px 10px',
                        background: 'rgba(26,86,219,0.2)',
                        border: '1px solid rgba(26,86,219,0.5)',
                        borderRadius: 6,
                        fontFamily: 'var(--font-display)',
                        fontSize: 13, fontWeight: 800,
                        color: auctionState?.leadingTeamId ? 'var(--spl-blue-light)' : 'var(--text-muted)',
                        cursor: auctionState?.leadingTeamId ? 'pointer' : 'not-allowed',
                        opacity: auctionState?.leadingTeamId ? 1 : 0.4,
                        letterSpacing: '0.04em',
                        transition: 'all 0.12s',
                        textTransform: 'uppercase'
                      }}
                    >
                      Custom
                    </button>
                  </div>
                )}

                {/* Keyboard shortcut hints */}
                <div style={{
                  marginTop: 12,
                  fontFamily: 'var(--font-body)', fontSize: 12,
                  color: 'var(--text-muted)',
                  textAlign: 'center',
                }}>
                  SPACE = Next stage &nbsp;·&nbsp; S = Sold &nbsp;·&nbsp; U = Unsold &nbsp;·&nbsp; Z = Undo Bid &nbsp;·&nbsp; 1-9 = Team bid
                </div>
              </div>
            </div>
          ) : (
            /* Empty state */
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              flex: 1, gap: 16, margin: 'auto 0', textAlign: 'center',
            }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--spl-elevated)', border: '1px solid var(--border-default)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Gavel className="w-10 h-10" style={{ color: 'var(--spl-orange)' }} />
              </div>
              <div>
                <div style={{
                  fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
                  color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6,
                }}>
                  Select a Player to Begin Auction
                </div>
                <div style={{
                  fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-muted)', maxWidth: 400,
                }}>
                  Choose any upcoming player from the queue on the left to load them onto the main stage and begin bidding.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ─── RIGHT: Team Bidding Panel ─── */}
        <div style={{
          width: 330,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--spl-navy)',
          borderLeft: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            padding: '16px 18px 12px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
              color: 'var(--text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase',
            }}>
              Club Bids
            </span>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 11,
              color: 'var(--text-muted)', letterSpacing: '0.1em',
            }}>
              HOTKEYS 1–9
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {teams.map((team, idx) => {
              const isLeading = team.id === auctionState?.leadingTeamId;
              const canBid = team.currentBalance >= (auctionState?.currentBid || 0) && stage === 'BIDDING';
              const pct = Math.max(0, Math.min(100, (team.currentBalance / team.startingBudget) * 100));

              return (
                <div
                  key={team.id}
                  style={{
                    borderRadius: 8,
                    border: isLeading ? `1px solid ${team.primaryColor}70` : '1px solid var(--border-subtle)',
                    background: isLeading ? `${team.primaryColor}14` : 'var(--spl-elevated)',
                    overflow: 'hidden',
                    transition: 'border-color 0.2s, background 0.2s',
                  }}
                >
                  {/* Team color top bar */}
                  <div style={{ height: 4, background: team.primaryColor }} />

                  <div style={{ padding: '12px 14px' }}>
                    {/* Name + Leading badge */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        {team.logoUrl ? (
                          <div style={{ width: 32, height: 32, borderRadius: 6, overflow: 'hidden', flexShrink: 0, padding: 1, background: `${team.primaryColor}15` }}>
                            <img src={team.logoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </div>
                        ) : (
                          <div style={{ width: 32, height: 32, borderRadius: 6, background: `${team.primaryColor}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-broadcast)', color: team.primaryColor, fontSize: 14 }}>
                            {team.shortName || team.name.slice(0, 3)}
                          </div>
                        )}
                        <div>
                          <div style={{
                            fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                            color: isLeading ? team.primaryColor : 'var(--text-primary)',
                            letterSpacing: '0.04em', textTransform: 'uppercase',
                          }}>
                            {team.name}
                          </div>
                          {team.managerName && (
                            <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>
                              {team.managerName}
                            </div>
                          )}
                        </div>
                      </div>
                      {isLeading && (
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800,
                          color: team.primaryColor, letterSpacing: '0.15em', textTransform: 'uppercase',
                          background: `${team.primaryColor}20`, padding: '2px 7px', borderRadius: 4,
                        }}>
                          LEADING
                        </span>
                      )}
                    </div>

                    {/* Budget bar */}
                    <div style={{ marginBottom: 10 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)' }}>Budget</span>
                        <span style={{
                          fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                          color: 'var(--spl-gold-light)',
                        }}>
                          {formatCurrency(team.currentBalance, tournament?.currency)}
                        </span>
                      </div>
                      <div style={{
                        height: 4, borderRadius: 2,
                        background: 'var(--spl-black)',
                        overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 2,
                          width: `${pct}%`,
                          background: team.primaryColor,
                          transition: 'width 0.4s ease',
                        }} />
                      </div>
                    </div>

                    {/* BID button */}
                    <button
                      disabled={!canBid}
                      onClick={() => handleTeamBid(team.id)}
                      style={{
                        width: '100%', padding: '9px 0',
                        borderRadius: 6, border: 'none',
                        background: canBid ? team.primaryColor : 'var(--spl-panel)',
                        color: canBid ? '#fff' : 'var(--text-muted)',
                        fontFamily: 'var(--font-display)',
                        fontSize: 13, fontWeight: 700, letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: canBid ? 'pointer' : 'not-allowed',
                        opacity: canBid ? 1 : 0.4,
                        transition: 'opacity 0.15s, filter 0.15s',
                      }}
                      onMouseEnter={e => { if (canBid) e.currentTarget.style.filter = 'brightness(1.15)'; }}
                      onMouseLeave={e => e.currentTarget.style.filter = ''}
                    >
                      BID ({idx + 1})
                    </button>
                  </div>
                </div>
              );
            })}

            {teams.length === 0 && (
              <div style={{ padding: '36px 12px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                NO CLUBS REGISTERED
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── SOLD CONFIRMATION MODAL ── */}
      {showSoldModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: 'var(--spl-panel)',
            border: '1px solid rgba(34,197,94,0.3)',
            borderRadius: 10,
            padding: '32px 36px',
            maxWidth: 400, width: '90%',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(34,197,94,0.15)',
          }}>
            <CheckCircle2 className="w-14 h-14 mx-auto mb-5" style={{ color: '#22C55E' }} />
            <div style={{
              fontFamily: 'var(--font-broadcast)',
              fontSize: 32, color: '#22C55E', marginBottom: 8,
            }}>
              CONFIRM SOLD
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              Transfer <strong style={{ color: 'var(--spl-gold-light)' }}>{activePlayer?.name}</strong> to{' '}
              <strong style={{ color: '#fff' }}>{leadingTeam?.name}</strong> for{' '}
              <strong style={{ color: '#22C55E' }}>{formatCurrency(auctionState?.currentBid, tournament?.currency)}</strong>?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setShowSoldModal(false)}
                className="btn-ghost"
                style={{ flex: 1, padding: '12px 0', fontSize: 13 }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowSoldModal(false); markSold(); }}
                className="btn-sold"
                style={{ flex: 1, padding: '12px 0', fontSize: 13 }}
              >
                Confirm SOLD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Bid Modal */}
      {showCustomBidModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 60,
          background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
        }}>
          <div style={{
            background: 'var(--spl-panel)',
            border: '1px solid var(--spl-blue)',
            borderRadius: 10, padding: 24, maxWidth: 400, width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.2em', marginBottom: 4 }}>
              CUSTOM BID AMOUNT
            </div>
            <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 22, color: '#fff', marginBottom: 14 }}>
              Place Custom Bid for {leadingTeam?.name || 'Leading Club'}
            </h3>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>
              Current Bid: <strong style={{ color: 'var(--spl-gold-light)' }}>{formatCurrency(auctionState?.currentBid)}</strong>. Enter exact total bid (e.g. 75) or increment value (e.g. +15).
            </p>

            <form onSubmit={handleCustomBidSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <input
                type="number"
                step="1"
                min="1"
                autoFocus
                value={customBidInput}
                onChange={e => setCustomBidInput(e.target.value)}
                placeholder="Enter dollar amount (e.g. 75)..."
                className="input-field"
                style={{ padding: '12px 14px', fontSize: 16, fontFamily: 'var(--font-broadcast)' }}
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button
                  type="button"
                  onClick={() => setShowCustomBidModal(false)}
                  className="btn-ghost"
                  style={{ flex: 1, padding: '10px 0', fontSize: 13 }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 1, padding: '10px 0', fontSize: 13 }}
                >
                  Submit Custom Bid
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
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
