import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { formatCurrency } from '../../utils/currency';
import { EFootballCard } from '../../components/common/EFootballCard';
import { PlayerCardShowcase } from '../../components/projector/PlayerCardShowcase';
import { PlayerImageUploader } from '../../components/common/PlayerImageUploader';
import { Plus, Edit2, Trash2, X, Search, Grid, List, Upload, Eye, Zap } from 'lucide-react';
import { playerService } from '../../services/playerService';
import { storageService } from '../../services/storageService';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';
import { ConfirmModal } from '../../components/common/ConfirmModal';

const getPosColor = (pos) => {
  const p = (pos || '').toUpperCase();
  if (p === 'GK') return '#F59E0B';
  if (['CB','LB','RB','LWB','RWB'].includes(p)) return '#3B82F6';
  if (['CM','DM','AM','CDM','CAM'].includes(p)) return '#22C55E';
  return '#EF4444';
};

export const Players = () => {
  const { players, teams, tournament, addPlayer, updatePlayer, deletePlayer, refreshData } = useTournament();
  const [filter, setFilter]         = useState('ALL');
  const [search, setSearch]         = useState('');
  const [viewMode, setViewMode]     = useState('table');
  const [showModal, setShowModal]   = useState(false);
  const [showCSVModal, setShowCSVModal] = useState(false);
  const [previewPlayer, setPreviewPlayer] = useState(null);
  const [csvText, setCsvText]       = useState('');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [playerToDelete, setPlayerToDelete] = useState(null);
  const [alertState, setAlertState] = useState(null);
  const [formData, setFormData]     = useState({
    name: '', number: '', position: 'ST', basePrice: 500, category: 'Forward', photoUrl: '', presentationPng: '', photoScale: 1, photoOffsetX: 0, photoOffsetY: 0,
    age: '', height: '', preferredFoot: '', bio: '',
  });

  const filtered = players.filter(p => {
    const matchFilter = filter === 'ALL' || p.status === filter;
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleOpen = (player = null) => {
    if (player) {
      setEditingPlayer(player);
      setFormData({
        ...player,
        photoUrl: player.photoUrl || '',
        presentationPng: player.presentationPng || '',
        photoScale: player.photoScale || 1,
        photoOffsetX: player.photoOffsetX || 0,
        photoOffsetY: player.photoOffsetY || 0,
        age: player.age || '',
        height: player.height || '',
        preferredFoot: player.preferredFoot || '',
        bio: player.bio || ''
      });
    } else {
      setEditingPlayer(null);
      setFormData({
        name: '',
        number: `${players.length + 1}`,
        position: 'ST',
        basePrice: tournament?.minBid || 500,
        category: 'Forward',
        photoUrl: '',
        presentationPng: '',
        photoScale: 1,
        photoOffsetX: 0,
        photoOffsetY: 0,
        age: '',
        height: '',
        preferredFoot: 'Right',
        bio: '',
      });
    }
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalData = { ...formData };
    if (editingPlayer) updatePlayer(editingPlayer.id, finalData);
    else addPlayer(finalData);
    setShowModal(false);
  };

  const handleCSVImport = (e) => {
    e.preventDefault();
    const imported = playerService.parseCSV(csvText);
    if (imported.length > 0) {
      playerService.importBulkPlayers(imported);
      if (refreshData) refreshData();
      setShowCSVModal(false);
      setCsvText('');
    } else {
      setAlertState({ title: 'Invalid CSV Format', message: 'Use: Name, Position, BasePrice, Number on each line.', type: 'danger' });
    }
  };

  const soldCount     = players.filter(p => p.status === 'SOLD').length;
  const upcomingCount = players.filter(p => p.status === 'UPCOMING').length;
  const unsoldCount   = players.filter(p => p.status === 'UNSOLD').length;

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1600, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase' }}>
            PLAYER DATABASE & ROSTER
          </div>
          <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff', lineHeight: 0.95, letterSpacing: '0.01em', textTransform: 'uppercase' }}>
            Player Pool
          </h1>
          <div style={{ display: 'flex', gap: 24, marginTop: 12 }}>
            {[
              { label: 'Total', value: players.length, color: 'var(--text-secondary)' },
              { label: 'Upcoming', value: upcomingCount, color: 'var(--spl-blue-light)' },
              { label: 'Sold', value: soldCount, color: '#22C55E' },
              { label: 'Unsold', value: unsoldCount, color: '#EF4444' },
            ].map(s => (
              <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-broadcast)', fontSize: 24, color: s.color, lineHeight: 1 }}>{s.value}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.12em' }}>{s.label.toUpperCase()}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setShowCSVModal(true)} className="btn-ghost" style={{ padding: '10px 18px', fontSize: 13, gap: 8 }}>
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button onClick={() => handleOpen()} className="btn-primary" style={{ padding: '10px 20px', fontSize: 14, gap: 8 }}>
            <Plus className="w-4 h-4" />
            Add Player
          </button>
        </div>
      </div>

      {/* ── EMPTY BANNER (shown when player count is 0) ── */}
      {players.length === 0 && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20,
          background: 'linear-gradient(135deg, rgba(26,86,219,0.15) 0%, rgba(34,197,94,0.10) 100%)',
          border: '1px solid rgba(26,86,219,0.3)',
          borderRadius: 10, padding: '20px 26px', marginBottom: 24,
        }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              No players currently registered
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Add individual players or use the bulk CSV importer to populate your auction roster.
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setShowCSVModal(true)} className="btn-ghost" style={{ padding: '8px 16px', fontSize: 12 }}>
              Import CSV
            </button>
            <button onClick={() => handleOpen()} className="btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>
              + Add Player
            </button>
          </div>
        </div>
      )}

      {/* ── FILTERS ── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap' }}>
        {/* Status tabs */}
        <div style={{ display: 'flex', gap: 6, background: 'var(--spl-panel)', padding: 5, borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
          {['ALL', 'UPCOMING', 'SOLD', 'UNSOLD'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '7px 18px', borderRadius: 6, border: 'none',
                fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                letterSpacing: '0.08em', cursor: 'pointer',
                background: filter === f ? 'var(--spl-blue)' : 'transparent',
                color: filter === f ? '#fff' : 'var(--text-muted)',
                transition: 'background 0.15s, color 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          {/* View toggle */}
          <div style={{ display: 'flex', background: 'var(--spl-panel)', borderRadius: 6, padding: 4, border: '1px solid var(--border-subtle)', gap: 4 }}>
            {[{ mode: 'table', Icon: List }, { mode: 'grid', Icon: Grid }].map(({ mode, Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                style={{
                  padding: '6px 10px', borderRadius: 5, border: 'none', cursor: 'pointer',
                  background: viewMode === mode ? 'var(--spl-blue)' : 'transparent',
                  color: viewMode === mode ? '#fff' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'background 0.15s',
                }}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search className="w-4 h-4" style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--text-muted)', pointerEvents: 'none',
            }} />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search players..."
              style={{
                padding: '9px 14px 9px 38px',
                background: 'var(--spl-panel)', border: '1px solid var(--border-default)',
                borderRadius: 6, color: 'var(--text-primary)',
                fontFamily: 'var(--font-body)', fontSize: 13, outline: 'none', width: 280,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── GRID VIEW ── */}
      {viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24, justifyItems: 'center' }}>
          {filtered.length > 0 ? filtered.map(player => {
            const team = teams.find(t => t.id === player.teamId);
            return (
              <div key={player.id} style={{ position: 'relative', width: '100%', maxWidth: 300, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  position: 'absolute', top: 10, left: 10, zIndex: 30,
                  display: 'flex', gap: 6,
                  background: 'rgba(0,0,0,0.85)', borderRadius: 6, padding: '5px 7px',
                  backdropFilter: 'blur(6px)', border: '1px solid var(--border-subtle)',
                  opacity: 0, transition: 'opacity 0.15s',
                }}
                  className="card-actions"
                >
                  <button onClick={() => setPreviewPlayer(player)} title="Preview" style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--spl-gold-light)' }}>
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleOpen(player)} title="Edit" style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setPlayerToDelete(player)} title="Delete" style={{ padding: 5, background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <EFootballCard player={player} size="md" onClick={() => setPreviewPlayer(player)} />
                {player.status === 'SOLD' && team && (
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <span className="badge-sold" style={{ fontSize: 11, padding: '4px 10px' }}>→ {team.name} · {formatCurrency(player.soldPrice, tournament?.currency)}</span>
                  </div>
                )}
                {player.status === 'UNSOLD' && (
                  <div style={{ marginTop: 8, textAlign: 'center' }}>
                    <span className="badge-unsold" style={{ fontSize: 11, padding: '4px 10px' }}>UNSOLD</span>
                  </div>
                )}
              </div>
            );
          }) : (
            <div style={{ gridColumn: '1 / -1', padding: '60px 0', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
              NO PLAYERS MATCH FILTER
            </div>
          )}
        </div>
      )}

      {/* ── TABLE VIEW ── */}
      {viewMode === 'table' && (
        <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--spl-elevated)' }}>
                {['Player', 'Position', 'Base Price', 'Status', 'Team', 'Actions'].map(h => (
                  <th key={h} style={{
                    padding: '14px 18px', textAlign: 'left',
                    fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-secondary)', letterSpacing: '0.15em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((player, i) => {
                const team = teams.find(t => t.id === player.teamId);
                const posColor = getPosColor(player.position);
                return (
                  <tr
                    key={player.id}
                    style={{
                      borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                      transition: 'background 0.12s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--spl-elevated)'}
                    onMouseLeave={e => e.currentTarget.style.background = ''}
                  >
                    {/* Player */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 52, borderRadius: 6, overflow: 'hidden', background: 'var(--spl-elevated)', flexShrink: 0, borderLeft: `3px solid ${posColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                        <div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                            {player.name}
                          </div>
                          <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                            #{String(player.number || '10').padStart(2, '0')}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Position */}
                    <td style={{ padding: '14px 18px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4,
                        background: `${posColor}15`, border: `1px solid ${posColor}30`,
                        fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
                        color: posColor, letterSpacing: '0.08em',
                      }}>
                        {(player.position || 'ST').toUpperCase()}
                      </span>
                    </td>

                    {/* Base Price */}
                    <td style={{ padding: '14px 18px', fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: 'var(--spl-gold-light)' }}>
                      {formatCurrency(player.basePrice, tournament?.currency)}
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 18px' }}>
                      {player.status === 'SOLD' && <span className="badge-sold">SOLD</span>}
                      {player.status === 'UNSOLD' && <span className="badge-unsold">UNSOLD</span>}
                      {player.status === 'UPCOMING' && <span className="badge-upcoming">UPCOMING</span>}
                    </td>

                    {/* Team */}
                    <td style={{ padding: '14px 18px' }}>
                      {team ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 4, height: 18, borderRadius: 2, background: team.primaryColor }} />
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                            {team.name}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {[
                          { icon: Eye, action: () => setPreviewPlayer(player), title: 'Preview', color: 'var(--spl-gold-light)' },
                          { icon: Edit2, action: () => handleOpen(player), title: 'Edit', color: 'var(--text-secondary)' },
                          { icon: Trash2, action: () => setPlayerToDelete(player), title: 'Delete', color: '#EF4444' },
                        ].map(({ icon: Icon, action, title, color }) => (
                          <button
                            key={title}
                            onClick={action}
                            title={title}
                            style={{ padding: '7px', background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 5, cursor: 'pointer', color: 'var(--text-muted)', transition: 'color 0.12s' }}
                            onMouseEnter={e => e.currentTarget.style.color = color}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: '50px', textAlign: 'center', fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text-muted)', letterSpacing: '0.15em' }}>
                    NO PLAYERS FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── ADD / EDIT MODAL ── */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '28px 30px', maxWidth: 480, width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 24, color: '#fff', letterSpacing: '0.02em' }}>
                {editingPlayer ? 'EDIT PLAYER' : 'REGISTER PLAYER'}
              </h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <PlayerImageUploader
                photoUrl={formData.photoUrl}
                presentationPng={formData.presentationPng}
                photoScale={formData.photoScale || 1}
                photoOffsetX={formData.photoOffsetX || 0}
                photoOffsetY={formData.photoOffsetY || 0}
                onChangePhoto={newUrl => setFormData(prev => ({ ...prev, photoUrl: newUrl }))}
                onChangePresentationPng={newCutout => setFormData(prev => ({ ...prev, presentationPng: newCutout }))}
                onChangePhotoScale={newScale => setFormData(prev => ({ ...prev, photoScale: newScale }))}
                onChangePhotoOffsetX={newX => setFormData(prev => ({ ...prev, photoOffsetX: newX }))}
                onChangePhotoOffsetY={newY => setFormData(prev => ({ ...prev, photoOffsetY: newY }))}
                playerName={formData.name}
                playerPosition={formData.position}
              />

              {[
                { label: 'Full Name', key: 'name', type: 'text', required: true },
              ].map(field => (
                <div key={field.key}>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={formData[field.key]}
                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    required={field.required}
                    className="input-field"
                    style={{ padding: '8px 12px' }}
                  />
                </div>
              ))}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Jersey #</label>
                  <input type="text" value={formData.number} onChange={e => setFormData({ ...formData, number: e.target.value })} required className="input-field" style={{ padding: '8px 12px' }} />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Position</label>
                  <select value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="input-field" style={{ padding: '8px 12px' }}>
                    {['ST','LW','RW','AM','CM','DM','CAM','CDM','CB','LB','RB','GK'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Base Price</label>
                <input type="number" value={formData.basePrice} onChange={e => setFormData({ ...formData, basePrice: parseInt(e.target.value, 10) })} required className="input-field" style={{ padding: '8px 12px' }} />
              </div>

              {/* Optional fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Age</label>
                  <input type="number" value={formData.age} onChange={e => setFormData({ ...formData, age: e.target.value })} className="input-field" style={{ padding: '8px 12px' }} placeholder="Optional" />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Height</label>
                  <input type="text" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="input-field" style={{ padding: '8px 12px' }} placeholder="e.g. 6'1" />
                </div>
                <div>
                  <label style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.2em', display: 'block', marginBottom: 5 }}>Foot</label>
                  <select value={formData.preferredFoot} onChange={e => setFormData({ ...formData, preferredFoot: e.target.value })} className="input-field" style={{ padding: '8px 12px' }}>
                    <option value="">—</option>
                    <option value="Right">Right</option>
                    <option value="Left">Left</option>
                    <option value="Both">Both</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                <button type="button" onClick={() => setShowModal(false)} className="btn-ghost" style={{ flex: 1, padding: '10px 0', fontSize: 13 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: 13 }}>
                  {editingPlayer ? 'Save Changes' : 'Register Player'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CSV MODAL ── */}
      {showCSVModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-default)', borderRadius: 10, padding: '28px 30px', maxWidth: 480, width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 22, color: '#fff' }}>IMPORT CSV</h3>
              <button onClick={() => setShowCSVModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
              Format: <code style={{ color: 'var(--spl-gold-light)' }}>Name, Position, BasePrice, Number</code> (one per line)
            </p>
            <form onSubmit={handleCSVImport} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea
                rows={6}
                value={csvText}
                onChange={e => setCsvText(e.target.value)}
                placeholder={"Ronaldo, ST, 1500, 7\nMessi, RW, 1500, 10"}
                className="input-field"
                style={{ padding: '10px 12px', fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
                required
              />
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="button" onClick={() => setShowCSVModal(false)} className="btn-ghost" style={{ flex: 1, padding: '10px 0', fontSize: 13 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px 0', fontSize: 13 }}>Import Players</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── PROJECTOR PREVIEW MODAL ── */}
      {previewPlayer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--spl-black)', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            position: 'absolute', top: 16, right: 16, zIndex: 60,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{
              fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700,
              color: 'var(--spl-orange-light)', letterSpacing: '0.2em',
              background: 'rgba(234,88,12,0.15)', border: '1px solid rgba(234,88,12,0.3)',
              padding: '4px 10px', borderRadius: 3,
            }}>
              PROJECTOR PREVIEW
            </span>
            <button
              onClick={() => setPreviewPlayer(null)}
              style={{ padding: 8, background: 'var(--spl-panel)', border: '1px solid var(--border-default)', borderRadius: 5, cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex' }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <PlayerCardShowcase player={previewPlayer} tournament={tournament} stage="INTRO" />
          </div>
        </div>
      )}
      {/* Confirm Delete Player Modal */}
      <ConfirmModal
        isOpen={!!playerToDelete}
        onClose={() => setPlayerToDelete(null)}
        onConfirm={() => {
          if (playerToDelete) {
            deletePlayer(playerToDelete.id);
            setPlayerToDelete(null);
          }
        }}
        title="Delete Player"
        message={`Are you sure you want to delete ${playerToDelete?.name || 'this player'}? This action cannot be undone.`}
        confirmText="Delete Player"
        type="danger"
      />

      {/* Alert Modal */}
      <ConfirmModal
        isOpen={!!alertState}
        onClose={() => setAlertState(null)}
        onConfirm={() => setAlertState(null)}
        title={alertState?.title || 'Notice'}
        message={alertState?.message || ''}
        type={alertState?.type || 'info'}
        isAlert={true}
      />
    </div>
  );
};
