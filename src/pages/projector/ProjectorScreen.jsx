import React, { useState, useEffect } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { useAuction } from '../../context/AuctionContext';
import { useProjector } from '../../hooks/useProjector';
import { storageService } from '../../services/storageService';
import { PlayerCardShowcase } from '../../components/projector/PlayerCardShowcase';
import { TacticalPitchSquad } from '../../components/projector/TacticalPitchSquad';
import { EFootballCard } from '../../components/common/EFootballCard';
import { formatCurrency } from '../../utils/currency';
import { Maximize2, Minimize2, Radio, Trophy, Users, Shield, CheckCircle2, User, Coins, Crown, TrendingUp, ArrowUpDown } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { getRandomStadiumImage } from '../../components/projector/StadiumBackground';
import { mediaStorage } from '../../services/mediaStorage';
import { broadcastBus } from '../../utils/broadcastChannel';

export const ProjectorScreen = () => {
  const { tournament, teams, players } = useTournament();
  const { auctionState } = useAuction();
  const { isFullscreen, toggleFullscreen } = useProjector();

  const [projectorSettings, setProjectorSettings] = useState(() => storageService.getProjectorSettings());
  const [squadFormat, setSquadFormat] = useState(() => storageService.getSquadFormat());
  const [homeMediaBlobUrl, setHomeMediaBlobUrl] = useState(null);
  const [soldFilterClub, setSoldFilterClub] = useState('ALL');
  const [soldSortBy, setSoldSortBy] = useState('PRICE_DESC');

  // Listen to live projector settings and squad format changes
  useEffect(() => {
    const handleStorageChange = () => {
      setProjectorSettings(storageService.getProjectorSettings());
      setSquadFormat(storageService.getSquadFormat());
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('squad-format-updated', handleStorageChange);

    // Cross-tab real-time BroadcastChannel sync
    const unsubscribe = broadcastBus.subscribe((msg) => {
      if (msg?.type === 'PROJECTOR_SETTINGS_UPDATED' && msg?.payload) {
        setProjectorSettings(msg.payload);
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('squad-format-updated', handleStorageChange);
      unsubscribe();
    };
  }, []);

  // Load custom full-screen video/image media for home page
  useEffect(() => {
    let activeUrl = null;
    let isCancelled = false;

    const loadHomeMedia = async () => {
      if (projectorSettings?.homeMediaUrl && !projectorSettings?.homeMediaCustom) {
        if (!isCancelled) setHomeMediaBlobUrl(projectorSettings.homeMediaUrl);
        return;
      }

      if (projectorSettings?.homeMediaCustom) {
        try {
          const blob = await mediaStorage.getMedia('home_main_media');
          if (blob && !isCancelled) {
            activeUrl = URL.createObjectURL(blob);
            setHomeMediaBlobUrl(activeUrl);
            return;
          }
        } catch (e) {
          console.warn('Failed to load media blob from IndexedDB:', e);
        }
      }

      if (!isCancelled) setHomeMediaBlobUrl(null);
    };

    loadHomeMedia();

    return () => {
      isCancelled = true;
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [
    projectorSettings?.homeMediaUrl,
    projectorSettings?.homeMediaCustom,
    projectorSettings?.homeMediaType,
    projectorSettings?.homeMediaName
  ]);

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

  const safeTeams = teams || [];
  const safePlayers = players || [];
  const selectedTeam = safeTeams.find(t => t.id === projectorSettings.selectedTeamId) || safeTeams[0];
  const soldPlayers = safePlayers.filter(p => p.status === 'SOLD');
  const unsoldPlayers = safePlayers.filter(p => p.status === 'UNSOLD' || p.status === 'UPCOMING');

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
    if (mode === 'HOME') return '#0ea5e9';
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

      {/* FULL SCREEN HOME MEDIA (IMAGE OR VIDEO) */}
      {(mode === 'HOME' || (mode === 'AUTO' && stage === 'IDLE')) && homeMediaBlobUrl && (
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
          {projectorSettings?.homeMediaType === 'video' ? (
            <video
              key={homeMediaBlobUrl}
              src={homeMediaBlobUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full"
              style={{ objectFit: projectorSettings?.homeMediaFit || 'cover' }}
            />
          ) : (
            <img
              key={homeMediaBlobUrl}
              src={homeMediaBlobUrl}
              alt="Home Screen Background"
              className="w-full h-full"
              style={{ objectFit: projectorSettings?.homeMediaFit || 'cover' }}
            />
          )}
        </div>
      )}

      {/* RENDER CONTENT BASED ON MODE */}
      <div className="flex-1 w-full h-full relative overflow-hidden z-10">
        {mode === 'AUTO' && (
          <div className="w-full h-full absolute inset-0">
            <PlayerCardShowcase
              stage={stage}
              player={activePlayer}
              tournament={tournament}
              teams={teams}
              players={players}
              currentBid={auctionState?.currentBid}
              leadingTeam={leadingTeam}
              bidHistory={auctionState?.bidHistory}
              winningTeam={winningTeam}
              finalPrice={finalPrice}
              settings={projectorSettings}
            />
          </div>
        )}

        {/* CUSTOM MODE: HOME SCREEN / MAIN PAGE */}
        {mode === 'HOME' && (
          <div className="w-full h-full absolute inset-0">
            <PlayerCardShowcase
              stage="IDLE"
              tournament={tournament}
              settings={projectorSettings}
            />
          </div>
        )}

        {/* CUSTOM MODE: CLUBS OVERVIEW & MANAGER BALANCES */}
        {mode === 'CLUBS_OVERVIEW' && (() => {
          // Dynamic balanced row calculation:
          // e.g. 6 teams -> [3, 3]
          //      7 teams -> [4, 3]
          //      8 teams -> [4, 4]
          //      <=5 teams -> single balanced row [N]
          const getBalancedTeamRows = (list) => {
            if (!list || list.length === 0) return [];
            const n = list.length;
            if (n <= 5) return [list];

            const numRows = Math.ceil(n / 5);
            const baseCount = Math.floor(n / numRows);
            const remainder = n % numRows;

            const rows = [];
            let currentIndex = 0;
            for (let r = 0; r < numRows; r++) {
              const countThisRow = baseCount + (r < remainder ? 1 : 0);
              rows.push(list.slice(currentIndex, currentIndex + countThisRow));
              currentIndex += countThisRow;
            }
            return rows;
          };

          const teamRows = getBalancedTeamRows(safeTeams);

          return (
            <div className="w-full h-full p-4 md:p-8 flex flex-col justify-center items-center relative z-10 select-none overflow-y-auto">
              {/* 1. BROADCAST PAGE TITLE */}
              <div className="w-full text-center mb-5 md:mb-7">
                <div
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 11,
                    fontWeight: 800,
                    color: 'var(--spl-blue-light)',
                    letterSpacing: '0.3em'
                  }}
                  className="uppercase mb-1"
                >
                  SUPER PREMIER LEAGUE 2026
                </div>
                <h1
                  style={{
                    fontFamily: 'var(--font-broadcast)',
                    fontSize: 'clamp(30px, 3.2vw, 42px)',
                    color: '#ffffff',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    lineHeight: 1
                  }}
                  className="drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)]"
                >
                  Club Standings & Budgets
                </h1>
                <div
                  className="w-20 h-0.5 mx-auto mt-2 rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, transparent, var(--spl-gold-light), transparent)'
                  }}
                />
              </div>

              {/* 2. DYNAMICALLY BALANCED ROWS */}
              <div className="w-full flex flex-col items-center justify-center gap-4 max-w-[1350px] mx-auto">
                {teamRows.map((row, rowIndex) => (
                  <div
                    key={rowIndex}
                    className="flex flex-wrap items-stretch justify-center gap-4 w-full"
                  >
                    {row.map(t => {
                      const squad = players.filter(p => p.teamId === t.id);
                      const spent = t.totalSpent || 0;
                      const pct = Math.max(0, Math.min(100, (t.currentBalance / (t.startingBudget || 1)) * 100));
                      const teamColor = t.primaryColor || '#38bdf8';

                      return (
                        <div
                          key={t.id}
                          className="relative overflow-hidden rounded-2xl flex flex-col justify-between transition-all duration-300"
                          style={{
                            width: '240px',
                            maxWidth: '245px',
                            minWidth: '225px',
                            flex: '0 0 240px',
                            background: 'rgba(12, 17, 32, 0.94)',
                            backdropFilter: 'blur(20px)',
                            WebkitBackdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                            padding: '16px 14px'
                          }}
                        >
                          {/* HERO CLUB LOGO (NO BOUNDING BOX - DIRECT FLOATING CREST) */}
                          {projectorSettings.showTeamLogos && (
                            <div className="flex items-center justify-center h-14 my-1">
                              {t.logoUrl ? (
                                <img
                                  src={t.logoUrl}
                                  alt={t.name}
                                  className="max-h-14 max-w-[72px] object-contain transition-transform duration-300"
                                  style={{
                                    filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.85))'
                                  }}
                                />
                              ) : (
                                <Shield
                                  className="w-11 h-11"
                                  style={{
                                    width: 44,
                                    height: 44,
                                    color: teamColor,
                                    filter: `drop-shadow(0 4px 12px ${teamColor}60)`
                                  }}
                                />
                              )}
                            </div>
                          )}

                          {/* Team Name */}
                          <h3
                            style={{
                              fontFamily: 'var(--font-broadcast)',
                              fontSize: 18,
                              color: '#ffffff',
                              textAlign: 'center',
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              lineHeight: 1.15
                            }}
                            className="truncate mt-1 px-1"
                            title={t.name}
                          >
                            {t.name}
                          </h3>

                          {/* Clean Broadcast Manager Line */}
                          {projectorSettings.showManagerBalance && (
                            <div className="text-center text-[10.5px] font-bold tracking-[0.1em] text-slate-400 uppercase mt-0.5 mb-2 truncate">
                              <span className="text-slate-500 font-semibold">MGR:</span>{' '}
                              <span className="text-slate-200">{t.managerName || 'TBD'}</span>
                            </div>
                          )}

                          {/* Integrated Broadcast Chamber: Squad Count & Financials */}
                          {(projectorSettings.showSquadSummary || projectorSettings.showManagerBalance) && (
                            <div
                              className="rounded-xl p-2.5 shadow-inner mt-1"
                              style={{
                                background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.04) 0%, rgba(0, 0, 0, 0.45) 100%)',
                                border: '1px solid rgba(255, 255, 255, 0.08)',
                                boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.06)'
                              }}
                            >
                              {/* DEDICATED PLAYERS COUNT SECTION */}
                              {projectorSettings.showSquadSummary && (
                                <div
                                  className="flex items-center justify-between px-2.5 py-1.5 rounded-lg mb-2 transition-all"
                                  style={{
                                    background: squad.length > 0
                                      ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.14) 0%, rgba(14, 165, 233, 0.04) 100%)'
                                      : 'rgba(255, 255, 255, 0.03)',
                                    border: `1px solid ${squad.length > 0 ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.06)'}`,
                                  }}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <Users size={13} className={squad.length > 0 ? "text-sky-400" : "text-slate-400"} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-300">
                                      Bidded Players
                                    </span>
                                  </div>
                                  <div className="flex items-baseline gap-1">
                                    <span
                                      style={{
                                        fontFamily: 'var(--font-broadcast)',
                                        fontSize: 16,
                                        color: squad.length > 0 ? '#38bdf8' : '#94a3b8',
                                        lineHeight: 1
                                      }}
                                    >
                                      {squad.length}
                                    </span>
                                    <span className="text-[9.5px] font-extrabold uppercase text-slate-400 tracking-wider">
                                      {squad.length === 1 ? 'Player' : 'Players'}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* REMAINING BUDGET & FINANCIAL BREAKDOWN */}
                              {projectorSettings.showManagerBalance && (
                                <>
                                  <div className="flex items-center justify-between mb-0.5">
                                    <span className="text-[9px] font-black uppercase tracking-[0.16em] text-slate-400">
                                      Remaining Budget
                                    </span>
                                    <span
                                      className="text-[9.5px] font-extrabold px-1.5 py-0.2 rounded"
                                      style={{
                                        background: pct > 50 ? 'rgba(34, 197, 94, 0.15)' : pct > 25 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                        color: pct > 50 ? '#4ade80' : pct > 25 ? '#facc15' : '#f87171'
                                      }}
                                    >
                                      {Math.round(pct)}%
                                    </span>
                                  </div>

                                  <div
                                    style={{
                                      fontFamily: 'var(--font-broadcast)',
                                      fontSize: 24,
                                      color: 'var(--spl-gold-light)',
                                      lineHeight: 1,
                                      letterSpacing: '0.02em',
                                      textShadow: '0 2px 10px rgba(255, 215, 0, 0.25)'
                                    }}
                                    className="my-1 text-center"
                                  >
                                    {formatCurrency(t.currentBalance, tournament?.currency)}
                                  </div>

                                  {/* Progress Bar */}
                                  <div className="h-1 bg-black/40 rounded-full overflow-hidden my-1.5 border border-white/5">
                                    <div
                                      className="h-full rounded-full transition-all duration-500"
                                      style={{
                                        width: `${pct}%`,
                                        background: `linear-gradient(90deg, ${teamColor}, #facc15)`,
                                        boxShadow: `0 0 8px ${teamColor}`
                                      }}
                                    />
                                  </div>

                                  {/* Spent vs Total Breakdown */}
                                  <div className="flex items-center justify-between text-[10px] font-medium pt-0.5">
                                    <span className="text-slate-400">
                                      Spent: <strong className="text-white font-bold">{formatCurrency(spent, tournament?.currency)}</strong>
                                    </span>
                                    <span className="text-slate-400">
                                      Total: <strong className="text-slate-300 font-semibold">{formatCurrency(t.startingBudget, tournament?.currency)}</strong>
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

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
        {mode === 'SOLD_SHOWCASE' && (() => {
          try {
            // Clubs that have made signings
            const map = new Map();
            soldPlayers.forEach(p => {
              if (p.teamId) {
                map.set(p.teamId, (map.get(p.teamId) || 0) + 1);
              }
            });
            const clubsWithSignings = Array.from(map.entries()).map(([teamId, count]) => {
              const t = safeTeams.find(team => team.id === teamId);
              return {
                id: teamId,
                name: t?.name || 'Club',
                shortName: t?.shortName || t?.name?.slice(0, 3) || 'CLB',
                logoUrl: t?.logoUrl,
                primaryColor: t?.primaryColor || '#38bdf8',
                count
              };
            });

            // Filter and Sort (Default highest price first)
            let displayedList = [...soldPlayers];
            if (soldFilterClub !== 'ALL') {
              displayedList = displayedList.filter(p => p.teamId === soldFilterClub);
            }
            displayedList.sort((a, b) => (Number(b.soldPrice) || 0) - (Number(a.soldPrice) || 0));

            return (
              <div className="w-full h-full p-4 md:p-6 lg:p-7 flex flex-col justify-between relative z-10 select-none overflow-hidden">
                {/* 1. SHARP BROADCAST HEADER */}
                <div className="flex items-center justify-between gap-4 pb-3 mb-2 border-b border-white/10 shrink-0">
                  {/* Title & Deals Badge */}
                  <div className="flex items-center gap-3">
                    <h1
                      style={{
                        fontFamily: 'var(--font-broadcast)',
                        fontSize: 'clamp(24px, 2.5vw, 34px)',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        letterSpacing: '0.05em'
                      }}
                      className="drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]"
                    >
                      Completed Signings
                    </h1>
                    <span className="px-2.5 py-0.5 rounded-[5px] text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 tracking-wider">
                      {soldPlayers.length} SOLD
                    </span>
                  </div>

                  {/* Sharp Club Filter Chips */}
                  {clubsWithSignings.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                      <button
                        onClick={() => setSoldFilterClub('ALL')}
                        className="flex items-center gap-1.5 px-3 py-1 rounded-[6px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                        style={{
                          background: soldFilterClub === 'ALL' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(15, 23, 42, 0.75)',
                          border: `1px solid ${soldFilterClub === 'ALL' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(255, 255, 255, 0.12)'}`,
                          color: soldFilterClub === 'ALL' ? '#38bdf8' : '#94a3b8',
                          boxShadow: soldFilterClub === 'ALL' ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none'
                        }}
                      >
                        <span>All ({soldPlayers.length})</span>
                      </button>

                      {clubsWithSignings.map(c => {
                        const isActive = soldFilterClub === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => setSoldFilterClub(c.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[6px] text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
                            style={{
                              background: isActive ? `${c.primaryColor}30` : 'rgba(15, 23, 42, 0.75)',
                              border: `1px solid ${isActive ? `${c.primaryColor}80` : 'rgba(255, 255, 255, 0.12)'}`,
                              color: isActive ? '#ffffff' : '#cbd5e1',
                              boxShadow: isActive ? `0 0 12px ${c.primaryColor}40` : 'none'
                            }}
                          >
                            {c.logoUrl ? (
                              <img src={c.logoUrl} alt={c.name} className="w-3.5 h-3.5 object-contain" />
                            ) : (
                              <Shield size={11} style={{ color: c.primaryColor }} />
                            )}
                            <span>{c.shortName || c.name}</span>
                            <span className="text-[10px] opacity-75">({c.count})</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* 2. SHARP MODERN CARDS GRID (BALANCED SPACING & FACE-CENTERED) */}
                <div
                  id={`scroll-container-${mode}`}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto pr-1 py-2 flex flex-col justify-center"
                >
                  {displayedList.length > 0 ? (
                    <div className="flex flex-wrap justify-center content-center gap-4.5 md:gap-5 w-full max-w-[1360px] mx-auto my-auto pb-4">
                      {displayedList.map((p) => {
                        const team = safeTeams.find(t => t.id === p.teamId);
                        const teamColor = team?.primaryColor || '#38bdf8';

                        return (
                          <div
                            key={p.id}
                            className="flex flex-col items-center transition-all duration-300 hover:scale-[1.04] hover:-translate-y-1.5"
                            style={{ width: '198px', flex: '0 0 198px' }}
                          >
                            {/* EA FC Ultimate Team Authentic Card with Studio Positioning */}
                            <div className="relative drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
                              <EFootballCard
                                player={{
                                  ...p,
                                  clubLogo: team?.logoUrl || p.clubLogo,
                                }}
                                size={0.62}
                                disableBackdrop={true}
                              />
                            </div>

                            {/* Sleek Golden Price Banner Plate */}
                            <div
                              className="mt-2 w-full flex items-center justify-between px-2.5 py-1.5 rounded-[6px] shadow-[0_6px_18px_rgba(0,0,0,0.7)]"
                              style={{
                                background: 'linear-gradient(180deg, rgba(16, 21, 35, 0.96) 0%, rgba(8, 11, 20, 0.98) 100%)',
                                border: '1px solid rgba(250, 204, 21, 0.35)',
                                borderTop: `2px solid ${teamColor}`,
                                boxShadow: `0 4px 16px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1), 0 0 12px ${teamColor}25`
                              }}
                            >
                              <div className="flex items-center gap-1.5 min-w-0 pr-1">
                                {team?.logoUrl ? (
                                  <img src={team.logoUrl} alt={team.name} className="w-3.5 h-3.5 object-contain" />
                                ) : (
                                  <Shield size={11} style={{ color: teamColor }} />
                                )}
                                <span className="text-[10.5px] font-black uppercase text-slate-300 truncate tracking-wider">
                                  {team?.shortName || team?.name || 'Club'}
                                </span>
                              </div>

                              <div
                                style={{
                                  fontFamily: 'var(--font-broadcast)',
                                  fontSize: 18,
                                  color: 'var(--spl-gold-light)',
                                  letterSpacing: '0.02em',
                                  lineHeight: 1,
                                  textShadow: '0 2px 8px rgba(255, 215, 0, 0.4)'
                                }}
                                className="font-bold shrink-0 ml-1"
                              >
                                {formatCurrency(p.soldPrice, tournament?.currency)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-24 text-center flex flex-col items-center justify-center">
                      <Trophy className="w-16 h-16 text-slate-600 mb-3" />
                      <div className="text-base font-bold text-slate-300 uppercase tracking-wider mb-1">
                        No Signings Found
                      </div>
                      <p className="text-xs text-slate-500 max-w-sm">
                        {soldFilterClub !== 'ALL'
                          ? 'This club has not signed any players yet.'
                          : 'No players have been marked as SOLD in the tournament yet.'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          } catch (err) {
            console.error('SOLD_SHOWCASE render error:', err);
            return (
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-300">
                <Trophy className="w-16 h-16 text-amber-500 mb-4 animate-bounce" />
                <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">Sold Showcase Initializing</h2>
                <p className="text-sm text-slate-400">Loading transfer data...</p>
              </div>
            );
          }
        })()}

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

      {/* BOTTOM TICKER BANNER (HIDE IN IDLE, INTRO STAGE & HOME MODE FOR PURE CLEAN MINIMAL LOOK, POSITIONED ABSOLUTE TO PREVENT DISPLACING VERTICAL CENTER) */}
      {projectorSettings.showLiveTicker && stage !== 'IDLE' && stage !== 'INTRO' && mode !== 'HOME' && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
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

          {/* SPONSOR ATM CARDS IN TICKER (PURE CARD GRAPHIC, ZERO TEXT) */}
          {projectorSettings?.showSponsors && Array.isArray(projectorSettings?.sponsors) && projectorSettings.sponsors.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 12, borderLeft: '1px solid rgba(255,255,255,0.15)', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {projectorSettings.sponsors.map(sp => (
                  <div
                    key={sp.id}
                    style={{
                      height: 22,
                      aspectRatio: '85.6 / 54',
                      borderRadius: 3,
                      overflow: 'hidden',
                      border: '1px solid rgba(255,255,255,0.25)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                      background: 'rgba(15, 23, 42, 0.9)',
                      flexShrink: 0
                    }}
                  >
                    {sp.imageUrl && (
                      <img
                        src={sp.imageUrl}
                        alt="Sponsor Card"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
