import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import { formatCurrency } from '../../utils/currency';
import { EFootballCard } from '../../components/common/EFootballCard';
import { Gavel, ArrowRight, CheckCircle2, Clock, Users, TrendingUp } from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { tournament, teams, players, history } = useTournament();

  const soldPlayers      = players.filter(p => p.status === 'SOLD');
  const remainingPlayers = players.filter(p => p.status === 'UPCOMING');
  const totalSpent       = teams.reduce((acc, t) => acc + (t.totalSpent || 0), 0);
  const highestBid       = history.length > 0 ? Math.max(...history.map(h => h.finalPrice || 0)) : 0;
  const topTeam          = [...teams].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0];
  const featuredPlayer   = remainingPlayers[0] || players[0];

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1600, margin: '0 auto' }}>

      {/* ── TOURNAMENT HERO ── */}
      <div style={{
        position: 'relative',
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 32,
        background: 'var(--spl-navy)',
        border: '1px solid var(--border-subtle)',
        padding: '36px 40px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}>
        {/* Subtle pitch lines background */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.05, pointerEvents: 'none' }}>
          <svg width="100%" height="100%" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
            <line x1="0" y1="100" x2="800" y2="100" stroke="white" strokeWidth="1" />
            <circle cx="400" cy="100" r="60" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="400" cy="100" r="2" fill="white" />
          </svg>
        </div>

        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
              color: 'var(--spl-blue-light)', letterSpacing: '0.25em', marginBottom: 10,
            }}>
              {tournament?.sport || 'FOOTBALL'} · {tournament?.season || 'SEASON 2026'}
            </div>
            <h1 style={{
              fontFamily: 'var(--font-broadcast)',
              fontSize: 'clamp(38px, 4.5vw, 64px)',
              color: '#fff',
              lineHeight: 0.95,
              letterSpacing: '0.01em',
              textTransform: 'uppercase',
              marginBottom: 12,
            }}>
              {tournament?.name || 'SPL Tournament'}
            </h1>
            <div style={{
              fontFamily: 'var(--font-body)', fontSize: 15,
              color: 'var(--text-secondary)',
            }}>
              {tournament?.location || 'Stadium'} &nbsp;·&nbsp; Standard Budget:{' '}
              <span style={{ color: 'var(--spl-gold-light)', fontWeight: 700 }}>
                {formatCurrency(tournament?.defaultBudget, tournament?.currency)} per club
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/auction')}
            className="btn-auction"
            style={{ padding: '16px 36px', fontSize: 20, gap: 12, flexShrink: 0 }}
          >
            <Gavel className="w-6 h-6" />
            Enter Live Auction
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 32, alignItems: 'start' }}>

        {/* Left: Stats + Teams */}
        <div>

          {/* 4 Key Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            {[
              { label: 'Total Clubs',  value: teams.length,            icon: Users,        color: 'var(--spl-blue-light)' },
              { label: 'Players Sold', value: soldPlayers.length,      icon: CheckCircle2, color: '#22C55E' },
              { label: 'Remaining',    value: remainingPlayers.length,  icon: Clock,        color: 'var(--spl-orange)' },
              { label: 'Total Spent',  value: formatCurrency(totalSpent, tournament?.currency), icon: TrendingUp, color: 'var(--spl-gold-light)', isLarge: true },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <div key={i} style={{
                  background: 'var(--spl-panel)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 10,
                  padding: '22px 24px',
                  position: 'relative', overflow: 'hidden',
                }}>
                  <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, height: 3,
                    background: stat.color, opacity: 0.8,
                  }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{
                      fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                      color: 'var(--text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase',
                    }}>
                      {stat.label}
                    </span>
                    <Icon className="w-5 h-5" style={{ color: stat.color, opacity: 0.85 }} />
                  </div>
                  <div style={{
                    fontFamily: stat.isLarge ? 'var(--font-display)' : 'var(--font-broadcast)',
                    fontSize: stat.isLarge ? 24 : 44,
                    fontWeight: stat.isLarge ? 800 : 400,
                    color: stat.color,
                    lineHeight: 1,
                    letterSpacing: stat.isLarge ? '-0.01em' : '0.01em',
                  }}>
                    {stat.value}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial highlights */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 24 }}>
            <div style={{
              background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
              borderRadius: 10, padding: '22px 24px',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>
                HIGHEST BID PLACED
              </div>
              <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 34, color: 'var(--spl-gold-light)', lineHeight: 1 }}>
                {formatCurrency(highestBid, tournament?.currency)}
              </div>
            </div>
            <div style={{
              background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
              borderRadius: 10, padding: '22px 24px',
            }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: 8, textTransform: 'uppercase' }}>
                TOP SPENDING CLUB
              </div>
              {topTeam ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 4, height: 34, borderRadius: 2, background: topTeam.primaryColor }} />
                  <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 26, color: topTeam.primaryColor, lineHeight: 1 }}>
                    {topTeam.name}
                  </div>
                </div>
              ) : (
                <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 26, color: 'var(--text-muted)' }}>—</div>
              )}
            </div>
          </div>

          {/* Team budget table */}
          <div style={{
            background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, overflow: 'hidden',
          }}>
            <div style={{
              padding: '18px 24px',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{
                fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                color: 'var(--text-primary)', letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                Club Budgets & Squad Status
              </h2>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)' }}>
                {teams.length} clubs registered
              </span>
            </div>

            <div>
              {teams.map((team, i) => {
                const pct = Math.max(0, Math.min(100, (team.currentBalance / team.startingBudget) * 100));
                return (
                  <div
                    key={team.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 18,
                      padding: '16px 24px',
                      borderBottom: i < teams.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                    }}
                  >
                    {/* Color strip */}
                    <div style={{ width: 4, height: 42, borderRadius: 2, background: team.primaryColor, flexShrink: 0 }} />

                    {/* Name + manager */}
                    <div style={{ minWidth: 160 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
                        color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase',
                        marginBottom: 3,
                      }}>
                        {team.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>
                        Manager: {team.managerName || '—'}
                      </div>
                    </div>

                    {/* Budget bar */}
                    <div style={{ flex: 1 }}>
                      <div style={{
                        height: 6, borderRadius: 3,
                        background: 'var(--spl-black)', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', borderRadius: 3,
                          width: `${pct}%`, background: team.primaryColor,
                          transition: 'width 0.5s ease',
                        }} />
                      </div>
                    </div>

                    {/* Budget numbers */}
                    <div style={{ textAlign: 'right', minWidth: 130 }}>
                      <div style={{
                        fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
                        color: 'var(--spl-gold-light)',
                      }}>
                        {formatCurrency(team.currentBalance, tournament?.currency)}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                        Spent: {formatCurrency(team.totalSpent || 0, tournament?.currency)}
                      </div>
                    </div>

                    {/* Players count */}
                    <div style={{ textAlign: 'center', minWidth: 60 }}>
                      <div style={{
                        fontFamily: 'var(--font-broadcast)', fontSize: 26,
                        color: 'var(--text-secondary)', lineHeight: 1,
                      }}>
                        {team.playersBought || 0}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                        PLAYERS
                      </div>
                    </div>
                  </div>
                );
              })}

              {teams.length === 0 && (
                <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                  <Users className="w-10 h-10 mx-auto mb-3 text-slate-600" />
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em', marginBottom: 12 }}>
                    NO CLUBS REGISTERED YET
                  </div>
                  <button
                    onClick={() => navigate('/admin/teams')}
                    className="btn-primary"
                    style={{ padding: '9px 18px', fontSize: 13 }}
                  >
                    Register Clubs
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent transfers */}
          {history.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                color: 'var(--text-secondary)', letterSpacing: '0.15em', marginBottom: 12, textTransform: 'uppercase',
              }}>
                Recent Transfers
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {history.slice(0, 5).map((record, i) => {
                  const team = teams.find(t => t.id === record.teamId);
                  const isSold = record.status === 'SOLD';
                  return (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
                      borderRadius: 8, padding: '14px 18px',
                      borderLeft: `4px solid ${isSold ? '#22C55E' : '#EF4444'}`,
                    }}>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700,
                          color: 'var(--text-primary)', letterSpacing: '0.03em', textTransform: 'uppercase',
                        }}>
                          {record.playerName}
                        </div>
                        {isSold && team && (
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            → {record.teamName}
                          </div>
                        )}
                      </div>
                      <div style={{
                        fontFamily: 'var(--font-broadcast)', fontSize: 22,
                        color: isSold ? 'var(--spl-gold-light)' : '#EF4444',
                      }}>
                        {isSold ? formatCurrency(record.finalPrice, tournament?.currency) : 'UNSOLD'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Featured Player Card */}
        <div>
          <div style={{
            fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
            color: 'var(--text-secondary)', letterSpacing: '0.2em', textTransform: 'uppercase',
            textAlign: 'center', marginBottom: 14,
          }}>
            NEXT IN AUCTION
          </div>
          {featuredPlayer ? (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <EFootballCard
                player={featuredPlayer}
                size="lg"
                onClick={() => navigate('/admin/auction')}
              />
            </div>
          ) : (
            <div style={{
              background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
              borderRadius: 10, height: 320,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14,
              padding: '24px', textAlign: 'center',
            }}>
              <Gavel className="w-10 h-10 text-slate-600" />
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                NO UPCOMING PLAYERS
              </div>
              <button
                onClick={() => navigate('/admin/players')}
                className="btn-ghost"
                style={{ padding: '8px 16px', fontSize: 12 }}
              >
                Add / Import Players
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
