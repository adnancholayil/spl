import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import { formatCurrency } from '../../utils/currency';
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  X,
  ArrowUpRight,
  History,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { ConfirmModal } from '../../components/common/ConfirmModal';

export const AuctionHistory = () => {
  const navigate = useNavigate();
  const { history, tournament, teams, resetAllTransfers, revertTransfer } = useTournament();

  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'SOLD' | 'UNSOLD'
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 4500);
  };

  const soldCount   = history.filter(r => r.status === 'SOLD').length;
  const unsoldCount = history.filter(r => r.status === 'UNSOLD').length;
  const totalValue  = history.reduce((acc, r) => acc + (r.finalPrice || 0), 0);

  const handlePromptResetAll = () => {
    if (history.length === 0) return;

    setModalConfig({
      isOpen: true,
      title: 'Reset All Transfers & Restore Roster?',
      message: `PERMANENT ACTION: This will completely wipe all ${history.length} transfer records from the official auction ledger, reset all player statuses back to UPCOMING (unassigned), and restore all team balances to their starting budget. Proceed?`,
      confirmText: 'Yes, Reset All Transfers',
      cancelText: 'Cancel',
      type: 'danger',
      isAlert: false,
      onConfirm: () => {
        closeModal();
        if (typeof resetAllTransfers === 'function') {
          resetAllTransfers();
          showToast('All transfers have been reset. All players returned to auction pool & team budgets restored.');
        }
      }
    });
  };

  const handlePromptRevertSingle = (record) => {
    const isSold = record.status === 'SOLD';
    setModalConfig({
      isOpen: true,
      title: `Revert Transfer: ${record.playerName}`,
      message: isSold
        ? `Reverting this transfer will refund ${record.teamName} ${formatCurrency(record.finalPrice, tournament?.currency)}, remove the player from the squad, and set ${record.playerName} back to UPCOMING. Proceed?`
        : `Reverting this will remove ${record.playerName} from UNSOLD and return them to the UPCOMING pool. Proceed?`,
      confirmText: 'Revert Transfer',
      cancelText: 'Cancel',
      type: 'warning',
      isAlert: false,
      onConfirm: () => {
        closeModal();
        if (typeof revertTransfer === 'function') {
          revertTransfer(record.id);
          showToast(`Transfer for ${record.playerName} successfully reverted.`);
        }
      }
    });
  };

  // Filtered and searched records
  const filteredHistory = history.filter(record => {
    if (filter === 'SOLD' && record.status !== 'SOLD') return false;
    if (filter === 'UNSOLD' && record.status !== 'UNSOLD') return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchPlayer = record.playerName?.toLowerCase().includes(q);
      const matchTeam = record.teamName?.toLowerCase().includes(q);
      const matchPos = record.playerPosition?.toLowerCase().includes(q);
      if (!matchPlayer && !matchTeam && !matchPos) return false;
    }
    return true;
  });

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1600, margin: '0 auto' }}>

      {/* Floating / Top Toast Notification */}
      {toastMessage && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 14, padding: '14px 22px', marginBottom: 24,
          background: 'rgba(16, 185, 129, 0.14)', border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: 8, color: '#34D399', boxShadow: '0 4px 20px rgba(16, 185, 129, 0.15)',
          animation: 'fadeIn 0.2s ease',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span style={{ fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600 }}>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            style={{ background: 'transparent', border: 'none', color: '#34D399', cursor: 'pointer', padding: 4 }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
          <div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
              color: 'var(--spl-blue-light)', letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--spl-blue-light)', boxShadow: '0 0 8px var(--spl-blue-light)' }} />
              OFFICIAL TRANSFER LEDGER
            </div>
            <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: 14 }}>
              Auction History & Transfers
            </h1>
          </div>

          {/* Master Actions Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            {/* Reset All Transfers Button */}
            <button
              onClick={handlePromptResetAll}
              disabled={history.length === 0}
              title={history.length === 0 ? 'No transfers to reset' : 'Undo all transfers and restore team budgets'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '11px 20px',
                borderRadius: 8,
                fontFamily: 'var(--font-display)',
                fontSize: 13,
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                border: history.length > 0 ? '1px solid rgba(239, 68, 68, 0.45)' : '1px solid rgba(255, 255, 255, 0.08)',
                background: history.length > 0
                  ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.22) 0%, rgba(153, 27, 27, 0.3) 100%)'
                  : 'rgba(255, 255, 255, 0.03)',
                color: history.length > 0 ? '#FCA5A5' : 'var(--text-muted)',
                cursor: history.length > 0 ? 'pointer' : 'not-allowed',
                boxShadow: history.length > 0 ? '0 0 16px rgba(220, 38, 38, 0.15)' : 'none',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => {
                if (history.length > 0) {
                  e.currentTarget.style.background = 'rgba(220, 38, 38, 0.35)';
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.65)';
                  e.currentTarget.style.boxShadow = '0 0 22px rgba(220, 38, 38, 0.35)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                if (history.length > 0) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, rgba(220, 38, 38, 0.22) 0%, rgba(153, 27, 27, 0.3) 100%)';
                  e.currentTarget.style.color = '#FCA5A5';
                  e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.45)';
                  e.currentTarget.style.boxShadow = '0 0 16px rgba(220, 38, 38, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESET ALL TRANSFERS</span>
              {history.length > 0 && (
                <span style={{
                  padding: '2px 7px',
                  borderRadius: 999,
                  background: 'rgba(239, 68, 68, 0.3)',
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 900
                }}>
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Summary strip */}
        {history.length > 0 && (
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 16 }}>
            {[
              { label: 'Total Transfers', value: history.length, color: 'var(--text-secondary)' },
              { label: 'Sold', value: soldCount, color: '#22C55E' },
              { label: 'Unsold', value: unsoldCount, color: '#EF4444' },
              { label: 'Total Value', value: formatCurrency(totalValue, tournament?.currency), color: 'var(--spl-gold-light)', isText: true },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontFamily: s.isText ? 'var(--font-display)' : 'var(--font-broadcast)', fontSize: s.isText ? 20 : 28, fontWeight: 700, color: s.color, lineHeight: 1 }}>
                  {s.value}
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>{s.label.toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filter and Search Bar (When history exists) */}
      {history.length > 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 16, marginBottom: 20, flexWrap: 'wrap'
        }}>
          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {[
              { id: 'ALL', label: `ALL (${history.length})` },
              { id: 'SOLD', label: `SOLD (${soldCount})` },
              { id: 'UNSOLD', label: `UNSOLD (${unsoldCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 6,
                  fontFamily: 'var(--font-display)',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.06em',
                  cursor: 'pointer',
                  border: filter === tab.id ? '1px solid var(--spl-blue-light)' : '1px solid var(--border-subtle)',
                  background: filter === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'var(--spl-panel)',
                  color: filter === tab.id ? 'var(--spl-blue-light)' : 'var(--text-secondary)',
                  transition: 'all 0.15s ease'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{
            position: 'relative',
            minWidth: 260,
            maxWidth: 380,
            flex: '1 1 auto'
          }}>
            <Search className="w-4 h-4" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by player, team, or position..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 36px',
                borderRadius: 6,
                background: 'var(--spl-panel)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)',
                fontSize: 13,
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--spl-blue-light)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Transfer list */}
      {history.length === 0 ? (
        <div style={{
          padding: '80px 24px', textAlign: 'center',
          background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
          borderRadius: 12,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16
          }}>
            <RotateCcw className="w-8 h-8 text-blue-400 opacity-60" />
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.1em', marginBottom: 8 }}>
            NO TRANSFERS RECORDED YET
          </div>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--text-secondary)', maxWidth: 460, margin: '0 auto 20px', lineHeight: 1.5 }}>
            The official transfer ledger is currently clean. All players are available in the auction pool, and team budgets are intact.
          </p>
          <button
            onClick={() => navigate('/admin/auction')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 8,
              background: 'linear-gradient(135deg, #1A56DB 0%, #3B82F6 100%)',
              color: '#fff', border: 'none',
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)'
            }}
          >
            <span>GO TO LIVE AUCTION</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div style={{
          padding: '60px 24px', textAlign: 'center',
          background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
          borderRadius: 10,
        }}>
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-500" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>
            NO MATCHING TRANSFERS FOUND
          </div>
          <button
            onClick={() => { setFilter('ALL'); setSearchQuery(''); }}
            style={{
              marginTop: 12, padding: '6px 14px', borderRadius: 6,
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-body)'
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredHistory.map((record, idx) => {
            const team = teams.find(t => t.id === record.teamId);
            const isSold = record.status === 'SOLD';

            return (
              <div
                key={record.id || idx}
                style={{
                  display: 'flex', alignItems: 'center', gap: 18,
                  background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
                  borderLeft: `5px solid ${isSold ? '#22C55E' : '#EF4444'}`,
                  borderRadius: '0 8px 8px 0',
                  padding: '16px 22px',
                  transition: 'background 0.12s, border-color 0.12s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--spl-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--spl-panel)'}
              >
                {/* Status icon */}
                <div style={{ flexShrink: 0 }}>
                  {isSold
                    ? <CheckCircle2 className="w-6 h-6" style={{ color: '#22C55E' }} />
                    : <XCircle className="w-6 h-6" style={{ color: '#EF4444' }} />
                  }
                </div>

                {/* Player info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700,
                      color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase',
                    }}>
                      {record.playerName}
                    </span>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                      color: 'var(--spl-blue-light)',
                      background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.25)',
                      padding: '2px 8px', borderRadius: 3, letterSpacing: '0.1em',
                    }}>
                      {record.playerPosition}
                    </span>
                  </div>

                  {isSold && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>Acquired by</span>
                      <ArrowRight className="w-3.5 h-3.5" style={{ color: 'var(--spl-gold-light)' }} />
                      {team && <div style={{ width: 4, height: 16, borderRadius: 2, background: team.primaryColor }} />}
                      <span style={{
                        fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                        color: team ? team.primaryColor : 'var(--text-primary)', letterSpacing: '0.04em',
                      }}>
                        {record.teamName}
                      </span>
                    </div>
                  )}
                </div>

                {/* Price + time */}
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-broadcast)', fontSize: 26,
                    color: isSold ? 'var(--spl-gold-light)' : 'rgba(239,68,68,0.5)',
                    lineHeight: 1,
                  }}>
                    {isSold ? formatCurrency(record.finalPrice, tournament?.currency) : 'UNSOLD'}
                  </div>
                  <div style={{
                    fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 4,
                  }}>
                    {new Date(record.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                {/* Revert Single Transfer Button */}
                <div style={{ flexShrink: 0, paddingLeft: 6 }}>
                  <button
                    onClick={() => handlePromptRevertSingle(record)}
                    title={`Revert transfer for ${record.playerName}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-display)',
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: '0.06em',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                      e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                      e.currentTarget.style.color = '#F87171';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>REVERT</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Broadcast Alert / Confirm Modal */}
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
