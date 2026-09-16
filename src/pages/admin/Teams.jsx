import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { formatCurrency } from '../../utils/currency';
import { EFootballCard } from '../../components/common/EFootballCard';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Plus, Edit2, Trash2, X, Users } from 'lucide-react';

export const Teams = () => {
  const { teams, players, addTeam, updateTeam, deleteTeam, tournament } = useTournament();
  const [showModal, setShowModal] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [deleteConfirmTeam, setDeleteConfirmTeam] = useState(null);
  const [formData, setFormData] = useState({
    name: '', shortName: '', managerName: '',
    primaryColor: '#1A56DB', secondaryColor: '#0C1220',
    startingBudget: 5000
  });

  const handleOpenModal = (team = null) => {
    if (team) { setEditingTeam(team); setFormData({ ...team }); }
    else { setEditingTeam(null); setFormData({ name: '', shortName: '', managerName: '', primaryColor: '#1A56DB', secondaryColor: '#0C1220', startingBudget: tournament?.defaultBudget || 5000 }); }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingTeam) updateTeam(editingTeam.id, formData);
    else addTeam(formData);
    setShowModal(false);
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1600, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase' }}>
            CLUBS & FRANCHISE MANAGEMENT
          </div>
          <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff', lineHeight: 0.95, textTransform: 'uppercase' }}>
            Registered Clubs
          </h1>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary" style={{ padding: '10px 22px', fontSize: 14, gap: 8 }}>
          <Plus className="w-5 h-5" /> Register Club
        </button>
      </div>

      {/* Teams Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 24 }}>
        {teams.map(team => {
          const squad = players.filter(p => p.teamId === team.id);
          const pct = Math.max(0, Math.min(100, (team.currentBalance / team.startingBudget) * 100));
          return (
            <div key={team.id} style={{
              background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
              borderRadius: 10, overflow: 'hidden',
              transition: 'border-color 0.15s, transform 0.15s',
              boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = `${team.primaryColor}60`}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
            >
              {/* Color top bar */}
              <div style={{ height: 4, background: team.primaryColor }} />

              <div style={{ padding: '22px 24px' }}>
                {/* Team name row */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 8, flexShrink: 0,
                      background: `${team.primaryColor}15`,
                      border: `1px solid ${team.primaryColor}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      overflow: 'hidden', padding: 2
                    }}>
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontFamily: 'var(--font-broadcast)', fontSize: 18, color: team.primaryColor, letterSpacing: '0.02em' }}>
                          {team.shortName || team.name.slice(0, 3).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                        {team.name}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', marginTop: 3 }}>
                        Manager: {team.managerName || 'Unassigned'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button onClick={() => handleOpenModal(team)} style={{ padding: 8, background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 5, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'color 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#fff'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteConfirmTeam(team)} style={{ padding: 8, background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 5, cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', transition: 'color 0.12s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#EF4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Budget section */}
                <div style={{ background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '16px 18px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>BUDGET REMAINING</span>
                    <span style={{ fontFamily: 'var(--font-broadcast)', fontSize: 26, color: 'var(--spl-gold-light)' }}>
                      {formatCurrency(team.currentBalance, tournament?.currency)}
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--spl-black)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: team.primaryColor, borderRadius: 3, transition: 'width 0.4s ease' }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>Spent: {formatCurrency(team.totalSpent || 0, tournament?.currency)}</span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)' }}>Total: {formatCurrency(team.startingBudget, tournament?.currency)}</span>
                  </div>
                </div>

                {/* View squad button */}
                <button
                  onClick={() => setSelectedSquad(team)}
                  style={{
                    width: '100%', padding: '11px 0',
                    background: 'var(--spl-elevated)', border: '1px solid var(--border-default)',
                    borderRadius: 6, cursor: 'pointer',
                    fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700,
                    color: 'var(--text-secondary)', letterSpacing: '0.08em',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    transition: 'background 0.12s, color 0.12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = team.primaryColor + '18'; e.currentTarget.style.color = team.primaryColor; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--spl-elevated)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Users className="w-4 h-4" />
                  View Squad ({squad.length} players)
                </button>
              </div>
            </div>
          );
        })}

        {teams.length === 0 && (
          <div style={{
            gridColumn: '1 / -1', padding: '64px 24px', textAlign: 'center',
            background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10,
          }}>
            <Users className="w-12 h-12 mx-auto mb-4 text-slate-600" />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em', marginBottom: 12 }}>
              NO CLUBS REGISTERED YET
            </div>
            <button onClick={() => handleOpenModal()} className="btn-primary" style={{ padding: '10px 20px', fontSize: 13 }}>
              + Register First Club
            </button>
          </div>
        )}
      </div>

      {/* ── SQUAD MODAL ── */}
      {selectedSquad && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--spl-panel)', border: `1px solid ${selectedSquad.primaryColor}30`, borderRadius: 10, padding: '24px 28px', maxWidth: 840, width: '100%', maxHeight: '85vh', display: 'flex', flexDirection: 'column', boxShadow: `0 0 60px ${selectedSquad.primaryColor}10` }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: `1px solid ${selectedSquad.primaryColor}20` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 4, height: 36, borderRadius: 2, background: selectedSquad.primaryColor }} />
                <div>
                  <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 26, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.02em' }}>{selectedSquad.name}</h3>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Manager: {selectedSquad.managerName}</div>
                </div>
              </div>
              <button onClick={() => setSelectedSquad(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {players.filter(p => p.teamId === selectedSquad.id).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, justifyItems: 'center' }}>
                  {players.filter(p => p.teamId === selectedSquad.id).map(p => (
                    <EFootballCard key={p.id} player={p} size="md" />
                  ))}
                </div>
              ) : (
                <div style={{ padding: '48px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                  NO PLAYERS ACQUIRED YET
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '28px 30px', maxWidth: 460, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 22, color: '#fff' }}>
                {editingTeam ? 'EDIT CLUB' : 'REGISTER CLUB'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { label: 'Club Name', key: 'name', type: 'text', required: true },
                { label: 'Manager / Owner', key: 'managerName', type: 'text', required: true },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>{f.label}</label>
                  <input type={f.type} value={formData[f.key]} onChange={e => setFormData({ ...formData, [f.key]: e.target.value })} required={f.required} className="input-field" style={{ padding: '8px 12px' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Short Code</label>
                  <input type="text" maxLength={4} value={formData.shortName} onChange={e => setFormData({ ...formData, shortName: e.target.value.toUpperCase() })} required className="input-field" style={{ padding: '8px 12px', textTransform: 'uppercase' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Club Color</label>
                  <input type="color" value={formData.primaryColor} onChange={e => setFormData({ ...formData, primaryColor: e.target.value })} className="input-field" style={{ padding: '4px', height: 36, cursor: 'pointer' }} />
                </div>
              </div>
              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Starting Budget</label>
                <input type="number" value={formData.startingBudget} onChange={e => setFormData({ ...formData, startingBudget: parseInt(e.target.value, 10) })} required className="input-field" style={{ padding: '8px 12px' }} />
              </div>
              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, padding: '10px 0', fontSize: 13 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: 13 }}>{editingTeam ? 'Save Changes' : 'Register Club'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmTeam}
        onClose={() => setDeleteConfirmTeam(null)}
        onConfirm={() => {
          if (deleteConfirmTeam) deleteTeam(deleteConfirmTeam.id);
        }}
        title="Delete Club"
        message={`Are you sure you want to delete ${deleteConfirmTeam?.name || 'this club'}? Any assigned players will become free agents.`}
        confirmText="Delete Club"
        type="danger"
      />
    </div>
  );
};
