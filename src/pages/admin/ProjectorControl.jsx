import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuction } from '../../context/AuctionContext';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../utils/currency';
import { EFootballCard } from '../../components/common/EFootballCard';
import {
  Tv, Monitor, Eye, EyeOff, LayoutGrid, Users, CheckCircle2,
  Zap, RefreshCw, Volume2, Shield, Radio, Sparkles, MessageSquare,
  DollarSign, Sliders, Play, RotateCcw, AlertTriangle, Image as ImageIcon
} from 'lucide-react';
import { STADIUM_IMAGES, getRandomStadiumImage } from '../../components/projector/StadiumBackground';

export const ProjectorControl = () => {
  const { tournament, teams, players, history } = useTournament();
  const { auctionState } = useAuction();

  // Load live projector settings from storage
  const [settings, setSettings] = useState(() => storageService.getProjectorSettings());
  const [flashSaved, setFlashSaved] = useState(false);
  const [previewBgImg, setPreviewBgImg] = useState(() => getRandomStadiumImage());

  // Sync state to storageService on change
  const updateSettings = (newPartial) => {
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    storageService.saveProjectorSettings(updated);
    setFlashSaved(true);
    setTimeout(() => setFlashSaved(false), 1200);
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
      screenTheme: 'DEFAULT'
    };
    updateSettings(defaults);
  };

  const openProjectorWindow = () => {
    window.open('/projector', '_blank', 'width=1280,height=720,toolbar=no,menubar=no');
  };

  const selectedTeam = teams.find(t => t.id === settings.selectedTeamId) || teams[0];
  const soldPlayers = players.filter(p => p.status === 'SOLD');
  const unsoldPlayers = players.filter(p => p.status === 'UNSOLD' || p.status === 'UPCOMING');

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1600, margin: '0 auto', color: '#fff' }}>

      {/* ── HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--spl-orange)', letterSpacing: '0.25em', textTransform: 'uppercase' }}>
              STADIUM BROADCAST CONTROL ENGINE
            </span>
            {flashSaved && (
              <span style={{ fontSize: 11, fontWeight: 800, color: '#22C55E', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', padding: '3px 10px', borderRadius: 4, textTransform: 'uppercase' }}>
                ✓ Synced to Projector
              </span>
            )}
          </div>
          <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff', lineHeight: 0.95, textTransform: 'uppercase' }}>
            Projector Screen Manager
          </h1>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={handleResetDefaults}
            className="btn-ghost"
            style={{ padding: '10px 18px', fontSize: 13, gap: 8 }}
          >
            <RotateCcw size={16} />
            Reset Defaults
          </button>

          <button
            onClick={openProjectorWindow}
            className="btn-primary"
            style={{ padding: '10px 22px', fontSize: 14, gap: 10, background: 'var(--spl-orange)' }}
          >
            <Tv size={18} />
            Launch Fullscreen Projector
          </button>
        </div>
      </div>

      {/* ── MAIN GRID LAYOUT ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 500px) 1fr', gap: 32 }}>

        {/* LEFT COLUMN: DISPLAY CONTROLS & TOGGLES */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* 1. BROADCAST DISPLAY MODE */}
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.15em', marginBottom: 16, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 8 }}>
              <LayoutGrid size={16} /> 1. Projector Display Mode
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { id: 'AUTO', label: '🔴 Live Auction Mode', desc: 'Auto-sync with live bidding stage (Intro, Bids, Sold, Signing)' },
                { id: 'CLUBS_OVERVIEW', label: '📊 Club Standings & Manager Balances', desc: 'Display all club budgets, manager names & spent balances' },
                { id: 'SQUAD_SHOWCASE', label: '🛡️ Team Squad Showcase', desc: 'Display selected club squad & player roster' },
                { id: 'SOLD_SHOWCASE', label: '🌟 Sold Players Gallery', desc: 'Showcase all completed signings and winning bids' },
                { id: 'UNSOLD_SHOWCASE', label: '📋 Available / Unsold Players Pool', desc: 'Display list of players remaining in the auction pool' },
              ].map(m => {
                const isActive = settings.mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => updateSettings({ mode: m.id })}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 14,
                      padding: '14px 16px', borderRadius: 8, textAlign: 'left',
                      border: isActive ? '1px solid var(--spl-blue)' : '1px solid var(--border-subtle)',
                      background: isActive ? 'rgba(26,86,219,0.18)' : 'var(--spl-elevated)',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                      border: isActive ? '6px solid var(--spl-blue-light)' : '2px solid var(--text-muted)',
                      background: isActive ? '#fff' : 'transparent'
                    }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: isActive ? '#fff' : 'var(--text-primary)' }}>
                        {m.label}
                      </div>
                      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-secondary)', marginTop: 3 }}>
                        {m.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. SQUAD SELECTOR (Only if SQUAD_SHOWCASE active) */}
          {settings.mode === 'SQUAD_SHOWCASE' && (
            <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--spl-blue)', borderRadius: 10, padding: 20 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.15em', marginBottom: 12, textTransform: 'uppercase' }}>
                Select Team to Showcase
              </div>
              <select
                value={settings.selectedTeamId || teams[0]?.id}
                onChange={e => updateSettings({ selectedTeamId: e.target.value })}
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 6,
                  background: 'var(--spl-elevated)', border: '1px solid var(--border-default)',
                  color: '#fff', fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700
                }}
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id} style={{ background: '#0a0d18', color: '#fff' }}>
                    {t.name} (Manager: {t.managerName} • Budget: {formatCurrency(t.currentBalance)})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 3. VISIBILITY TOGGLES (WHAT TO SHOW / HIDE) */}
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.15em', marginBottom: 14, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sliders size={14} /> 2. Display Toggles (Show / Hide)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                { key: 'showManagerBalance', label: 'Manager Budgets', icon: DollarSign },
                { key: 'showLiveTicker', label: 'Live Broadcast Ticker', icon: Radio },
                { key: 'showSquadSummary', label: 'Squad Player Counts', icon: Users },
                { key: 'showPlayerAttributes', label: 'FIFA Player Stats', icon: Sparkles },
                { key: 'showBasePrice', label: 'Player Base Price', icon: Zap },
                { key: 'showTeamLogos', label: 'Club Crest Logos', icon: Shield },
                { key: 'showSoldBadge', label: 'Sold / Unsold Badges', icon: CheckCircle2 },
              ].map(item => {
                const isEnabled = settings[item.key];
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => updateSettings({ [item.key]: !isEnabled })}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '10px 12px', borderRadius: 7,
                      border: isEnabled ? '1px solid rgba(34,197,94,0.4)' : '1px solid var(--border-subtle)',
                      background: isEnabled ? 'rgba(34,197,94,0.08)' : 'var(--spl-elevated)',
                      cursor: 'pointer', transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={14} color={isEnabled ? '#22C55E' : 'var(--text-muted)'} />
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: isEnabled ? '#fff' : 'var(--text-muted)' }}>
                        {item.label}
                      </span>
                    </div>
                    {isEnabled ? <Eye size={14} color="#22C55E" /> : <EyeOff size={14} color="var(--text-muted)" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. BROADCAST TICKER MESSAGE */}
          <div style={{
            background: 'var(--spl-panel)',
            border: settings.showLiveTicker ? '1px solid var(--border-subtle)' : '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: 20,
            transition: 'border-color 0.2s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                <MessageSquare size={14} /> 3. Live Broadcast Ticker Banner
              </div>
              
              {/* TICKER ON / OFF TOGGLE SWITCH */}
              <button
                type="button"
                onClick={() => updateSettings({ showLiveTicker: !settings.showLiveTicker })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '5px 12px', borderRadius: 20,
                  background: settings.showLiveTicker ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)',
                  border: settings.showLiveTicker ? '1px solid #22C55E' : '1px solid #EF4444',
                  color: settings.showLiveTicker ? '#22C55E' : '#EF4444',
                  fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
                  letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: settings.showLiveTicker ? '0 0 10px rgba(34,197,94,0.2)' : 'none'
                }}
              >
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: settings.showLiveTicker ? '#22C55E' : '#EF4444',
                  boxShadow: settings.showLiveTicker ? '0 0 6px #22C55E' : 'none'
                }} />
                {settings.showLiveTicker ? 'TICKER ON' : 'TICKER OFF'}
              </button>
            </div>

            <input
              type="text"
              value={settings.customTickerText || ''}
              onChange={e => updateSettings({ customTickerText: e.target.value })}
              placeholder="Enter ticker message to scroll at bottom of projector..."
              className="input-field"
              disabled={!settings.showLiveTicker}
              style={{
                width: '100%', padding: '10px 14px', fontSize: 12, marginBottom: 10,
                opacity: settings.showLiveTicker ? 1 : 0.4,
                cursor: settings.showLiveTicker ? 'text' : 'not-allowed'
              }}
            />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', opacity: settings.showLiveTicker ? 1 : 0.4 }}>
              {[
                'SUPER PREMIER LEAGUE 2026 • LIVE PLAYER AUCTION',
                'MATCH DAY DRAFT • ALL TEAMS READY AT STADIUM',
                'FINAL ROUND BIDS UNDERWAY • GET YOUR SQUADS READY',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  disabled={!settings.showLiveTicker}
                  onClick={() => updateSettings({ customTickerText: preset })}
                  style={{
                    padding: '4px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                    background: 'var(--spl-elevated)', border: '1px solid var(--border-subtle)',
                    color: 'var(--text-muted)', cursor: settings.showLiveTicker ? 'pointer' : 'not-allowed'
                  }}
                >
                  Preset {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* 5. VISUAL THEME SELECTOR */}
          <div style={{ background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: 20 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.15em', marginBottom: 12, textTransform: 'uppercase' }}>
              4. Stadium Theme Preset
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
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
                    padding: '12px 6px', borderRadius: 6, border: settings.screenTheme === t.id ? '2px solid #fff' : '1px solid var(--border-subtle)',
                    background: t.bg, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 800, color: '#fff', textTransform: 'uppercase' }}>
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE DUAL PREVIEW OF PROJECTOR SCREEN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: 'var(--spl-orange)', letterSpacing: '0.2em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Monitor size={14} /> LIVE PROJECTOR SCREEN PREVIEW
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, color: '#22C55E' }}>
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              MODE: {settings.mode}
            </div>
          </div>

          {/* PREVIEW CONTAINER (SIMULATED PROJECTOR DISPLAY) */}
          <div style={{
            width: '100%',
            height: 520,
            background: '#020617',
            border: '2px solid var(--spl-blue)',
            borderRadius: 12,
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
            display: 'flex',
            flexDirection: 'column',
            justify: 'space-between',
            padding: 20
          }}>
            {/* Background Stadium Photo */}
            <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none' }}>
              <img 
                src={previewBgImg} 
                alt="Stadium Arena" 
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.65) contrast(1.15)' }} 
              />
              <div style={{
                position: 'absolute', inset: 0,
                background: settings.screenTheme === 'GOLD' ? 'linear-gradient(180deg, rgba(8,7,5,0.7) 0%, rgba(29,20,5,0.92) 100%)'
                          : settings.screenTheme === 'NEON' ? 'linear-gradient(180deg, rgba(4,8,6,0.7) 0%, rgba(9,32,17,0.92) 100%)'
                          : settings.screenTheme === 'CYBER' ? 'linear-gradient(180deg, rgba(7,3,4,0.7) 0%, rgba(36,8,9,0.92) 100%)'
                          : 'linear-gradient(180deg, rgba(2,6,23,0.6) 0%, rgba(2,6,23,0.92) 100%)'
              }} />
            </div>

            {/* PREVIEW TOP BAR */}
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontFamily: 'var(--font-broadcast)', fontSize: 18, color: '#fff', letterSpacing: '0.04em' }}>
                  {tournament?.name || 'SUPER PREMIER LEAGUE'}
                </span>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 4, background: 'rgba(26,86,219,0.3)', border: '1px solid rgba(26,86,219,0.5)', color: 'var(--spl-blue-light)' }}>
                  {settings.mode}
                </span>
              </div>
              {settings.showManagerBalance && (
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--spl-gold-light)', fontWeight: 700 }}>
                  {teams.length} CLUBS REGISTERED
                </div>
              )}
            </div>

            {/* PREVIEW BODY BASED ON SELECTED MODE */}
            <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px 0', overflow: 'hidden' }}>

              {/* MODE 1: CLUBS & MANAGERS OVERVIEW */}
              {settings.mode === 'CLUBS_OVERVIEW' && (
                <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                  {teams.map(t => {
                    const squadCount = players.filter(p => p.teamId === t.id).length;
                    return (
                      <div key={t.id} style={{ background: 'rgba(15,23,42,0.8)', border: `1px solid ${t.primaryColor}50`, borderRadius: 8, padding: 12, textAlign: 'center' }}>
                        {settings.showTeamLogos && t.logoUrl && (
                          <img src={t.logoUrl} alt={t.name} style={{ width: 36, height: 36, objectFit: 'contain', margin: '0 auto 6px' }} />
                        )}
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#fff' }}>
                          {t.name}
                        </div>
                        {settings.showManagerBalance && (
                          <>
                            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                              Mgr: {t.managerName}
                            </div>
                            <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 15, color: 'var(--spl-gold-light)', marginTop: 4 }}>
                              {formatCurrency(t.currentBalance)}
                            </div>
                          </>
                        )}
                        {settings.showSquadSummary && (
                          <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--spl-blue-light)', marginTop: 4 }}>
                            {squadCount} Players Acquired
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* MODE 2: SQUAD SHOWCASE */}
              {settings.mode === 'SQUAD_SHOWCASE' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 22, color: selectedTeam.primaryColor || '#fff', textTransform: 'uppercase', marginBottom: 4 }}>
                    {selectedTeam.name} SQUAD
                  </div>
                  {settings.showManagerBalance && (
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
                      Manager: {selectedTeam.managerName} • Budget: {formatCurrency(selectedTeam.currentBalance)}
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 12, overflowX: 'auto', maxWidth: '100%', padding: '8px 0' }}>
                    {players.filter(p => p.teamId === selectedTeam.id).map(p => (
                      <EFootballCard key={p.id} player={p} size="sm" />
                    ))}
                    {players.filter(p => p.teamId === selectedTeam.id).length === 0 && (
                      <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: 30 }}>No players signed yet in this squad</div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 3: SOLD PLAYERS GALLERY */}
              {settings.mode === 'SOLD_SHOWCASE' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 18, color: '#22C55E', textTransform: 'uppercase', marginBottom: 10 }}>
                    COMPLETED SIGNINGS ({soldPlayers.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, overflowY: 'auto', maxHeight: 340 }}>
                    {soldPlayers.map(p => {
                      const t = teams.find(team => team.id === p.teamId);
                      return (
                        <div key={p.id} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                          <img src={p.photoUrl || p.presentationPng} alt={p.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 4px' }} />
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                          {settings.showSoldBadge && <div style={{ fontSize: 9, fontWeight: 800, color: '#22C55E' }}>SOLD to {t?.shortName || t?.name}</div>}
                          <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 13, color: 'var(--spl-gold-light)', marginTop: 2 }}>{formatCurrency(p.soldPrice)}</div>
                        </div>
                      );
                    })}
                    {soldPlayers.length === 0 && (
                      <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', textAlign: 'center', padding: 40, fontSize: 12 }}>No players sold yet</div>
                    )}
                  </div>
                </div>
              )}

              {/* MODE 4: UNSOLD / POOL PLAYERS */}
              {settings.mode === 'UNSOLD_SHOWCASE' && (
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 18, color: 'var(--spl-blue-light)', textTransform: 'uppercase', marginBottom: 10 }}>
                    AVAILABLE AUCTION POOL ({unsoldPlayers.length})
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10, overflowY: 'auto', maxHeight: 340 }}>
                    {unsoldPlayers.map(p => (
                      <div key={p.id} style={{ background: 'rgba(15,23,42,0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 8, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, color: '#fff' }}>{p.name}</div>
                        <div style={{ fontSize: 9, color: 'var(--spl-orange)', fontWeight: 800 }}>{p.position} • OVR {p.overallRating}</div>
                        {settings.showBasePrice && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Base: {formatCurrency(p.basePrice)}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* MODE 5: AUTO LIVE AUCTION MODE */}
              {settings.mode === 'AUTO' && (
                <div style={{ textAlign: 'center', padding: 20 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(234,88,12,0.2)', border: '1px solid rgba(234,88,12,0.4)', color: 'var(--spl-orange)', fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', marginBottom: 12 }}>
                    <Radio size={12} className="animate-pulse" /> LIVE AUCTION STAGE SYNC
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 24, color: '#fff', textTransform: 'uppercase' }}>
                    Stage: {auctionState?.stage || 'IDLE'}
                  </h3>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-muted)', maxWidth: 360, margin: '6px auto 0' }}>
                    Projector screen will automatically transition dramatically when players are introduced, bids are placed, or deals are signed!
                  </p>
                </div>
              )}
            </div>

            {/* PREVIEW BOTTOM TICKER */}
            {settings.showLiveTicker && (
              <div style={{
                background: 'rgba(0,0,0,0.7)',
                borderTop: '1px solid rgba(255,255,255,0.1)',
                padding: '6px 12px',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                overflow: 'hidden'
              }}>
                <span style={{ fontSize: 9, fontWeight: 800, padding: '2px 6px', background: 'var(--spl-orange)', color: '#fff', borderRadius: 3, letterSpacing: '0.1em' }}>
                  TICKER
                </span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {settings.customTickerText}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
