import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuction } from '../../context/AuctionContext';
import { storageService } from '../../services/storageService';
import { formatCurrency } from '../../utils/currency';
import {
  Tv, Monitor, Eye, EyeOff, LayoutGrid, Users, CheckCircle2,
  Zap, RefreshCw, Volume2, Shield, Radio, Sparkles, MessageSquare,
  DollarSign, Sliders, Play, RotateCcw, AlertTriangle, Image as ImageIcon
} from 'lucide-react';

export const ProjectorControl = () => {
  const { tournament, teams, players, history } = useTournament();
  const { auctionState } = useAuction();

  // Load live projector settings from storage
  const [settings, setSettings] = useState(() => storageService.getProjectorSettings());
  const [flashSaved, setFlashSaved] = useState(false);

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

          {/* LIVE IFRAME PROJECTOR PREVIEW */}
          <div style={{ width: '100%', aspectRatio: '16/9', background: '#020617', border: '2px solid var(--spl-blue)', borderRadius: 12, position: 'relative', overflow: 'hidden', boxShadow: '0 10px 40px rgba(0,0,0,0.8)' }}>
            <iframe src="/projector" title="Live Projector Preview" style={{ width: '400%', height: '400%', position: 'absolute', top: 0, left: 0, border: 'none', transform: 'scale(0.25)', transformOrigin: 'top left', pointerEvents: 'auto' }} />
          </div>
        </div>
      </div>
    </div>
  );
};
