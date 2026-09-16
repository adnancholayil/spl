import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { formatCurrency } from '../../utils/currency';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

export const AuctionHistory = () => {
  const { history, tournament, teams } = useTournament();

  const soldCount   = history.filter(r => r.status === 'SOLD').length;
  const unsoldCount = history.filter(r => r.status === 'UNSOLD').length;
  const totalValue  = history.reduce((acc, r) => acc + (r.finalPrice || 0), 0);

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1600, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase' }}>
          OFFICIAL TRANSFER LEDGER
        </div>
        <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff', lineHeight: 0.95, textTransform: 'uppercase', marginBottom: 14 }}>
          Auction History & Transfers
        </h1>

        {/* Summary strip */}
        {history.length > 0 && (
          <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', marginTop: 12 }}>
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

      {/* Transfer list */}
      {history.length === 0 ? (
        <div style={{
          padding: '80px 24px', textAlign: 'center',
          background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
          borderRadius: 10,
        }}>
          <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
            NO TRANSFERS RECORDED YET
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {history.map((record, idx) => {
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
                  transition: 'background 0.12s',
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
