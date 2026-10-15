import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuction } from '../../context/AuctionContext';
import { useProjector } from '../../hooks/useProjector';
import { storageService } from '../../services/storageService';
import { PlayerCardShowcase } from '../../components/projector/PlayerCardShowcase';
import { TacticalPitchSquad } from '../../components/projector/TacticalPitchSquad';
import { EFootballCard } from '../../components/common/EFootballCard';
import { formatCurrency } from '../../utils/currency';
import { Maximize2, Minimize2, Radio, Trophy, Users, Shield, CheckCircle2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { getRandomStadiumImage } from '../../components/projector/StadiumBackground';

export const ProjectorScreen = () => {
  const { tournament, teams, players } = useTournament();
  const { auctionState } = useAuction();
  const { isFullscreen, toggleFullscreen } = useProjector();

  const [projectorSettings, setProjectorSettings] = useState(() => storageService.getProjectorSettings());
  const [squadFormat, setSquadFormat] = useState(() => storageService.getSquadFormat());

  // Listen to live projector settings and squad format changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProjectorSettings(storageService.getProjectorSettings());
      setSquadFormat(storageService.getSquadFormat());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('squad-format-updated', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('squad-format-updated', handleStorageChange);
    };
  }, []);

  const activePlayer = players?.find(p => p.id === auctionState?.currentPlayerId);
  const leadingTeam  = teams?.find(t => t.id === auctionState?.leadingTeamId);
  const winningTeam  = leadingTeam || teams?.find(t => t.id === activePlayer?.teamId);
  const finalPrice   = auctionState?.currentBid || activePlayer?.soldPrice || 0;
  const stage        = auctionState?.stage || 'IDLE';

  const mode = projectorSettings.mode || 'AUTO';

  const handleScroll = (e) => {
    if (e.target.dataset.ignoreScroll === "true") return;
    const channel = new BroadcastChannel('spl_projector_scroll');
    channel.postMessage({
      mode: mode,
      scrollTop: e.target.scrollTop,
      scrollLeft: e.target.scrollLeft
    });
    channel.close();
  };

  useEffect(() => {
    const channel = new BroadcastChannel('spl_projector_scroll');
    channel.onmessage = (e) => {
      if (e.data.mode === mode) {
        const container = document.getElementById(`scroll-container-${mode}`);
        if (container) {
          container.dataset.ignoreScroll = "true";
          container.scrollTop = e.data.scrollTop;
          container.scrollLeft = e.data.scrollLeft;
          clearTimeout(container.scrollTimeout);
          container.scrollTimeout = setTimeout(() => {
            container.dataset.ignoreScroll = "false";
          }, 50);
        }
      }
    };
    return () => channel.close();
  }, [mode]);

  // Mouse hide effect
  useEffect(() => {
    let timer;
    const hide = () => { document.body.style.cursor = 'none'; };
    const show = () => {
      document.body.style.cursor = '';
      clearTimeout(timer);
      timer = setTimeout(hide, 3000);
    };
    window.addEventListener('mousemove', show);
    timer = setTimeout(hide, 3000);
    return () => {
      window.removeEventListener('mousemove', show);
      clearTimeout(timer);
      document.body.style.cursor = '';
    };
  }, []);

  // Keyboard shortcut F for Fullscreen
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'f' || e.key === 'F') toggleFullscreen(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [toggleFullscreen]);

  const selectedTeam = teams?.find(t => t.id === projectorSettings.selectedTeamId) || teams[0];
  const soldPlayers = players?.filter(p => p.status === 'SOLD') || [];
  const unsoldPlayers = players?.filter(p => p.status === 'UNSOLD' || p.status === 'UPCOMING') || [];

  const [bgImage, setBgImage] = useState(() => projectorSettings?.bgImage || getRandomStadiumImage());

  useEffect(() => {
    if (!projectorSettings?.bgImage) {
      setBgImage(getRandomStadiumImage());
    } else {
      setBgImage(projectorSettings.bgImage);
    }
  }, [projectorSettings?.bgImage]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : '0,0,0';
  };

  const themeBg = `linear-gradient(135deg, rgba(${hexToRgb(projectorSettings?.bgFilter1 || '#060503')},${(projectorSettings?.bgFilterOpacity1 ?? 85)/100}) 0%, rgba(${hexToRgb(projectorSettings?.bgFilter2 || '#1c1404')},${(projectorSettings?.bgFilterOpacity2 ?? 90)/100}) 100%)`;
  const panelBg = `rgba(${hexToRgb(projectorSettings?.panelBgColor || '#000000')},${(projectorSettings?.panelBgOpacity ?? 50)/100})`;
  const panelBorder = `rgba(${hexToRgb(projectorSettings?.panelBorderColor || '#ffffff')},${(projectorSettings?.panelBorderOpacity ?? 10)/100})`;
  const shadowOpacity = (projectorSettings?.ambientShadowOpacity ?? 20) / 100;

  const getAmbientColor = () => {
    if (stage === 'BIDDING') return leadingTeam?.primaryColor || '#ea580c';
    if (stage === 'SOLD' || stage === 'SIGNING') return winningTeam?.primaryColor || '#22c55e';
    if (stage === 'UNSOLD') return '#ef4444';
    return '#0ea5e9'; // Default for INTRO and IDLE
  };

  return (
    <div
      className="projector-screen select-none relative"
      style={{ 
        backgroundImage: bgImage ? `${themeBg}, url('${bgImage}')` : themeBg,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        width: '100vw', 
        height: '100vh', 
        overflow: 'hidden', 
        display: 'flex', 
        flexDirection: 'column' 
      }}
    >
      {/* Fullscreen Toggle */}
      <button
        onClick={toggleFullscreen}
        title={isFullscreen ? 'Exit Fullscreen (F)' : 'Go Fullscreen (F)'}
        className="absolute top-4 right-4 z-50 p-2 rounded transition-opacity opacity-0 hover:opacity-100"
        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.5)' }}
      >
        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
      </button>

      {/* RENDER CONTENT BASED ON MODE */}
      <div className="flex-1 w-full h-full relative overflow-hidden">
        {mode === 'AUTO' && (
          <div className="w-full h-full absolute inset-0">
            <AnimatePresence mode="wait">
              {stage === 'IDLE' && (
                <motion.div key="idle" className="w-full h-full absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PlayerCardShowcase stage="IDLE" tournament={tournament} teams={teams} settings={projectorSettings} />
                </motion.div>
              )}
              {stage === 'INTRO' && activePlayer && (
                <motion.div key={`intro-${activePlayer.id}`} className="w-full h-full absolute inset-0" initial={{ x: -1000, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 1000, opacity: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 20 }}>
                  <PlayerCardShowcase stage="INTRO" player={activePlayer} tournament={tournament} settings={projectorSettings} />
                </motion.div>
              )}
              {stage === 'BIDDING' && activePlayer && (
                <motion.div key={`bidding-${activePlayer.id}`} className="w-full h-full absolute inset-0" initial={{ x: -1000, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 1000, opacity: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 20 }}>
                  <PlayerCardShowcase stage="BIDDING" player={activePlayer} tournament={tournament} teams={teams} currentBid={auctionState?.currentBid} leadingTeam={leadingTeam} bidHistory={auctionState?.bidHistory} settings={projectorSettings} />
                </motion.div>
              )}
              {(stage === 'SOLD' || stage === 'SIGNING') && activePlayer && (
                <motion.div
                  key={`deal-${activePlayer.id}`}
                  className="w-full h-full absolute inset-0"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  <PlayerCardShowcase
                    stage={stage}
                    player={activePlayer}
                    tournament={tournament}
                    winningTeam={winningTeam}
                    finalPrice={finalPrice}
                    settings={projectorSettings}
                  />
                </motion.div>
              )}
              {stage === 'UNSOLD' && activePlayer && (
                <motion.div key={`unsold-${activePlayer.id}`} className="w-full h-full absolute inset-0" initial={{ x: -1000, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 1000, opacity: 0 }} transition={{ type: 'spring', stiffness: 150, damping: 20 }}>
                  <PlayerCardShowcase stage="UNSOLD" player={activePlayer} tournament={tournament} settings={projectorSettings} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* CUSTOM MODE: CLUBS OVERVIEW & MANAGER BALANCES */}
        {mode === 'CLUBS_OVERVIEW' && (
          <div className="w-full h-full p-12 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: 'var(--spl-blue-light)', letterSpacing: '0.3em' }}>
                  TOURNAMENT CLUBS & MANAGERS
                </div>
                <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 44, color: '#fff', textTransform: 'uppercase' }}>
                  Club Standings & Budgets
                </h1>
              </div>
              <div className="flex items-center gap-3 bg-blue-900/30 border border-blue-500/30 px-5 py-2.5 rounded-lg">
                <Trophy className="w-6 h-6 text-amber-400" />
                <span style={{ fontFamily: 'var(--font-broadcast)', fontSize: 20, color: '#fff' }}>
                  {tournament?.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-6 my-auto">
              {teams.map(t => {
                const squad = players.filter(p => p.teamId === t.id);
                const spent = t.totalSpent || 0;
                const pct = Math.max(0, Math.min(100, (t.currentBalance / t.startingBudget) * 100));
                return (
                  <div key={t.id} style={{ background: panelBg, border: `2px solid ${t.primaryColor}60`, borderRadius: 12, padding: 20, boxShadow: `0 10px 30px ${t.primaryColor}${Math.round(shadowOpacity * 255).toString(16).padStart(2, '0')}` }}>
                    <div style={{ height: 4, background: t.primaryColor, borderRadius: 2, marginBottom: 14 }} />
                    {projectorSettings.showTeamLogos && t.logoUrl && (
                      <img src={t.logoUrl} alt={t.name} style={{ width: 64, height: 64, objectFit: 'contain', margin: '0 auto 12px' }} />
                    )}
                    <h3 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 22, color: '#fff', textAlign: 'center', textTransform: 'uppercase' }}>
                      {t.name}
                    </h3>
                    {projectorSettings.showManagerBalance && (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 16px' }}>
                        Manager: <strong style={{ color: '#fff' }}>{t.managerName}</strong>
                      </p>
                    )}

                    {projectorSettings.showManagerBalance && (
                      <div style={{ background: 'rgba(0,0,0,0.5)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.15em', marginBottom: 4 }}>REMAINING BUDGET</div>
                        <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 28, color: 'var(--spl-gold-light)' }}>
                          {formatCurrency(t.currentBalance)}
                        </div>
                        <div style={{ height: 5, background: '#000', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${pct}%`, background: t.primaryColor }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--text-muted)' }}>
                          <span>Spent: {formatCurrency(spent)}</span>
                          <span>Total: {formatCurrency(t.startingBudget)}</span>
                        </div>
                      </div>
                    )}

                    {projectorSettings.showSquadSummary && (
                      <div style={{ textAlign: 'center', fontSize: 12, fontWeight: 800, color: 'var(--spl-blue-light)', letterSpacing: '0.1em' }}>
                        {squad.length} PLAYERS SIGNED
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div />
          </div>
        )}

        {/* CUSTOM MODE: SQUAD SHOWCASE (EA FC TACTICAL PITCH SQUAD) */}
        {mode === 'SQUAD_SHOWCASE' && selectedTeam && (
          <div className="w-full h-full relative overflow-hidden">
            <TacticalPitchSquad
              team={selectedTeam}
              squad={players.filter(p => p.teamId === selectedTeam.id)}
              format={squadFormat}
              isSigningAnimation={false}
              tournament={tournament}
            />
          </div>
        )}

        {/* CUSTOM MODE: SOLD PLAYERS GALLERY */}
        {mode === 'SOLD_SHOWCASE' && (
          <div className="w-full h-full p-12 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 800, color: '#22C55E', letterSpacing: '0.3em' }}>
                  OFFICIAL TRANSFERS SHOWCASE
                </div>
                <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 44, color: '#fff', textTransform: 'uppercase' }}>
                  Completed Signings ({soldPlayers.length})
                </h1>
              </div>
            </div>

            <div id={`scroll-container-${mode}`} onScroll={handleScroll} className="grid grid-cols-4 gap-6 my-auto overflow-y-auto max-h-[70vh] p-2">
              {soldPlayers.map(p => {
                const team = teams.find(t => t.id === p.teamId);
                return (
                  <div key={p.id} style={{ background: panelBg, border: '1px solid rgba(34,197,94,0.4)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <img src={p.photoUrl || p.presentationPng} alt={p.name} style={{ width: 64, height: 64, borderRadius: 10, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.2)' }} />
                    <div>
                      <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 18, color: '#fff' }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--spl-orange)', fontWeight: 800 }}>{p.position} • OVR {p.overallRating}</div>
                      {projectorSettings.showSoldBadge && (
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#22C55E', marginTop: 2 }}>
                          Signed by {team?.name || 'Club'}
                        </div>
                      )}
                      <div style={{ fontFamily: 'var(--font-broadcast)', fontSize: 16, color: 'var(--spl-gold-light)', marginTop: 2 }}>
                        {formatCurrency(p.soldPrice)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div />
          </div>
        )}

        {/* CUSTOM MODE: UNSOLD / AVAILABLE POOL */}
        {mode === 'UNSOLD_SHOWCASE' && (
          <div className="w-full h-full p-12 flex flex-col justify-center">
            <div id={`scroll-container-${mode}`} onScroll={handleScroll} className="flex flex-wrap justify-center gap-6 overflow-y-auto w-full p-4">
              {unsoldPlayers.map(p => (
                <EFootballCard key={p.id} player={p} size="md" />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM TICKER BANNER */}
      {projectorSettings.showLiveTicker && (
        <div style={{
          background: 'rgba(6,8,17,0.95)',
          borderTop: '2px solid var(--spl-orange)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          zIndex: 40
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--spl-orange)', color: '#fff',
            padding: '4px 10px', borderRadius: 4,
            fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.1em'
          }}>
            <Radio size={12} className="animate-pulse" /> LIVE BROADCAST
          </div>
          <div style={{
            flex: 1, overflow: 'hidden', whiteSpace: 'nowrap',
            fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
            color: '#fff', letterSpacing: '0.05em'
          }}>
            <marquee scrollamount="6">
              {projectorSettings.customTickerText || 'SUPER PREMIER LEAGUE 2026 • OFFICIAL PLAYER AUCTION'}
            </marquee>
          </div>
        </div>
      )}
    </div>
  );
};
