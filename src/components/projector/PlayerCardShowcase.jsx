import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/currency';
import { EFootballCard } from '../common/EFootballCard';
import { StadiumBackground } from './StadiumBackground';
import { SPLLogo } from '../common/SPLLogo';
import { soundEngine } from '../../services/soundService';
import { Trophy, Shield, TrendingUp, Clock, Award, Users, Flame } from 'lucide-react';

/**
 * High-End PlayerCardShowcase Component
 * Broadcast-Grade Live Football Auction Engine
 */


const formatTime = (isoString) => {
  if (!isoString) return 'Just now';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return 'Just now';
  }
};

// ── 1. IDLE STAGE ─────────────────────────────────────────────────────────
const IdleStage = ({ tournament, teams }) => (
  <div className="w-full h-full">
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10 select-none">
      
      {/* Center Hero Banner */}
      <motion.div 
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center my-auto flex flex-col items-center gap-4"
      >
        <div className="p-4 bg-slate-900/60 rounded-full border border-amber-400/30 backdrop-blur-md shadow-2xl">
          <SPLLogo size={140} />
        </div>
        <h1 
          className="text-white text-6xl md:text-8xl tracking-wider font-extrabold uppercase drop-shadow-2xl"
          style={{ fontFamily: 'var(--font-broadcast)' }}
        >
          {tournament?.name || 'SUPER PREMIER LEAGUE'}
        </h1>
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600/20 border border-blue-400/40 rounded-full">
          <Flame className="w-5 h-5 text-amber-400" />
          <span className="text-base text-amber-300 tracking-widest uppercase font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
            Season {tournament?.season || '2026'} • Official Draft & Bidding Arena
          </span>
        </div>
      </motion.div>

      {/* Franchise Grid */}
      {teams && teams.length > 0 && (
        <div className="w-full max-w-6xl bg-slate-900/90 border border-white/15 backdrop-blur-xl rounded-2xl p-6 shadow-2xl">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-widest mb-4 text-center" style={{ fontFamily: 'var(--font-display)' }}>
            Participating Franchises ({teams.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {teams.map((t) => (
              <div 
                key={t.id} 
                className="bg-black/50 border border-white/10 rounded-xl p-3 flex items-center gap-3 shadow-lg"
                style={{ borderLeft: `4px solid ${t.primaryColor || '#3b82f6'}` }}
              >
                {t.logoUrl ? (
                  <img src={t.logoUrl} alt={t.name} className="w-10 h-10 object-contain" />
                ) : (
                  <Shield className="w-8 h-8" style={{ color: t.primaryColor }} />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-bold text-white uppercase truncate" style={{ fontFamily: 'var(--font-display)' }}>
                    {t.name}
                  </div>
                  <div className="text-xs text-amber-300 font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                    {formatCurrency(t.currentBalance, '₹')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);



// ── MYSTERY CARD BACK COMPONENT (FOR SUSPENSE REVEAL) ────────────────────
const MysteryCardBack = ({ size = 'xl' }) => {
  const scaleMap = { sm: 0.65, md: 0.85, lg: 1.1, xl: 1.35 };
  const scale = scaleMap[size] || scaleMap.xl;
  const cardWidth = 320 * scale;
  const cardHeight = 440 * scale;

  return (
    <div
      style={{ width: cardWidth, height: cardHeight }}
      className="relative select-none"
    >
      <svg
        viewBox="0 0 320 440"
        width={cardWidth}
        height={cardHeight}
        className="w-full h-full overflow-visible"
        style={{ filter: 'drop-shadow(0 0 30px rgba(212,160,23,0.5)) drop-shadow(0 15px 30px rgba(0,0,0,0.9))' }}
      >
        <defs>
          <path
            id="mystery-card-shape"
            d="M 32 14 Q 160 0 288 14 C 304 16 312 26 312 42 L 312 336 C 312 386 200 426 160 434 C 120 426 8 386 8 336 L 8 42 C 8 26 16 16 32 14 Z"
          />
          <linearGradient id="mystery-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>
          <linearGradient id="mystery-border-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fae3a5" />
            <stop offset="50%" stopColor="#d4a017" />
            <stop offset="100%" stopColor="#7a540b" />
          </linearGradient>
          <pattern id="mystery-holo" width="30" height="30" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="30" stroke="rgba(212,160,23,0.18)" strokeWidth="1.5" />
            <polygon points="0,0 15,8 30,0 15,22" fill="rgba(212,160,23,0.06)" />
          </pattern>
        </defs>

        {/* Outer Gold Bevel Frame */}
        <use href="#mystery-card-shape" fill="none" stroke="url(#mystery-border-grad)" strokeWidth="8" strokeLinejoin="round" />
        
        {/* Inner Shield Fill */}
        <use href="#mystery-card-shape" fill="url(#mystery-bg-grad)" />
        
        {/* Holographic Mesh Overlay */}
        <use href="#mystery-card-shape" fill="url(#mystery-holo)" style={{ mixBlendMode: 'overlay' }} />

        {/* Center Glowing SPL Crest */}
        <g transform="translate(160, 200)">
          {/* Pulsing Energy Rings */}
          <circle cx="0" cy="0" r="70" fill="none" stroke="rgba(212,160,23,0.25)" strokeWidth="2" strokeDasharray="6 4" />
          <circle cx="0" cy="0" r="55" fill="none" stroke="rgba(212,160,23,0.4)" strokeWidth="1.5" />
          
          {/* Mystery Logo */}
          <image href="/assets/logo.png" x="-45" y="-45" width="90" height="90" preserveAspectRatio="xMidYMid meet" />
          
          <text
            x="0"
            y="7"
            fontFamily="system-ui, -apple-system, sans-serif"
            fontSize="18"
            fontWeight="900"
            fill="#FFFFFF"
            textAnchor="middle"
            letterSpacing="0.06em"
            filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
          >
            SPL
          </text>
        </g>

        {/* Top Mystery Text */}
        <text
          x="160"
          y="75"
          fontFamily="var(--font-broadcast), 'Bebas Neue', sans-serif"
          fontSize="24"
          fontWeight="900"
          fill="#d4a017"
          textAnchor="middle"
          letterSpacing="4"
          filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))"
        >
          SUPER PREMIER LEAGUE
        </text>

        {/* Bottom Mystery Question Badge */}
        <g transform="translate(160, 365)">
          <text
            x="0"
            y="0"
            fontFamily="var(--font-broadcast), 'Bebas Neue', Impact, sans-serif"
            fontSize="52"
            fontWeight="900"
            fill="#d4a017"
            textAnchor="middle"
            filter="drop-shadow(0 2px 8px rgba(212,160,23,0.7))"
          >
            ?
          </text>
        </g>
      </svg>
    </div>
  );
};

// ── 2. INTRO STAGE — SIMPLE CARD FLIP REVEAL ──────────────────────────────
//
//  1. Card back is shown first (mystery side)
//  2. After 1.8s it smoothly flips 180° to reveal the player card
//  3. After flip: subtle looping gloss shimmer on the card only
//  4. Info bar gently rises from below
//
const IntroStage = ({ player, tournament, settings }) => {
  const cardTheme = settings?.cardTheme || 'GOLD';
  const [flipped, setFlipped]     = useState(false);   // triggers the flip
  const [revealed, setRevealed]   = useState(false);   // flip animation done
  const [displayPlayer, setDisplayPlayer] = useState(player);

  useEffect(() => {
    if (player?.id !== displayPlayer?.id) {
      setFlipped(false);
      setRevealed(false);
      
      const t1 = setTimeout(() => {
        setDisplayPlayer(player);
        soundEngine.playRevealSound();
      }, 600);
      
      const t2 = setTimeout(() => setFlipped(true), 1400);
      const t3 = setTimeout(() => setRevealed(true), 2500);
      
      return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
    } else {
      setFlipped(false);
      setRevealed(false);
      soundEngine.playRevealSound();
  
      const t1 = setTimeout(() => setFlipped(true), 1800);
      const t2 = setTimeout(() => setRevealed(true), 2900);
  
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [player?.id]);

  // Click to skip suspense
  const handleSkip = () => {
    if (!flipped) {
      setFlipped(true);
      setTimeout(() => setRevealed(true), 1100);
    }
  };

  // Card dimensions matching MysteryCardBack xl scale (1.35)
  const CARD_W = Math.round(320 * 1.35);
  const CARD_H = Math.round(440 * 1.35);

  return (
    <div className="w-full h-full">
      <div
        onClick={handleSkip}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center select-none"
        style={{ cursor: flipped ? 'default' : 'pointer' }}
      >

        {/* ── CENTER: 3D card flip container ── */}
        <div className="flex-1 flex items-center justify-center">
          {/*
            perspective wrapper — required for 3D depth.
            Inner card-flipper rotates from 0 → 180deg.
            Both faces are absolutely stacked; backface-visibility:hidden
            hides the non-active face.
          */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            style={{ perspective: 1200 }}
          >
            {/* Flipper — this is what rotates */}
            <motion.div
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ duration: 1.05, ease: [0.4, 0, 0.2, 1] }}
              style={{
                width: CARD_W,
                height: CARD_H,
                position: 'relative',
                transformStyle: 'preserve-3d',
              }}
            >

              {/* ── BACK FACE (mystery card) ── */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                <MysteryCardBack size="xl" />
              </div>

              {/* ── FRONT FACE (player card) — pre-rotated 180° so it starts hidden ── */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <div style={{ position: 'relative', width: CARD_W, height: CARD_H }}>
                  <EFootballCard
                    player={displayPlayer}
                    size="xl"
                    theme={cardTheme}
                    highlight={false}
                  />
                </div>
              </div>

            </motion.div>
          </motion.div>
        </div>

      </div>
    </div>
  );
};

// ── 3. BIDDING STAGE (CARD POSITION SHIFTED TO LEFT, TABLES ON RIGHT) ─────────
const BiddingStage = ({
  player,
  currentBid,
  leadingTeam,
  bidHistory = [],
  teams = [],
  tournament,
  settings,
}) => {
  const cardTheme = settings?.cardTheme || 'GOLD';
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 400);
    return () => clearTimeout(t);
  }, [currentBid]);

  return (
    <div className="w-full h-full">
      <div className="relative z-10 w-full h-full flex flex-col p-6 select-none overflow-hidden">
        
        {/* Top Live Broadcast Bar */}
        <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-orange-600/30 border border-orange-500/50 px-3.5 py-1.5 rounded-md shadow-lg shadow-orange-500/20">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <span className="text-xs font-black text-orange-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                LIVE AUCTION IN PROGRESS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-300 font-extrabold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            <span>TOTAL BIDS: <strong className="text-amber-300 text-sm">{bidHistory.length}</strong></span>
          </div>
        </div>

        {/* SPLIT SCREEN LAYOUT: CARD POSITIONED ON LEFT, TABLES ON RIGHT */}
        <div className="flex-1 w-full flex gap-8 items-center min-h-0 overflow-hidden">
          
          {/* LEFT SIDE: EA FC PLAYER CARD (POSITION SHIFTED LEFT) */}
          <motion.div
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15 }}
            className="w-[35%] h-full flex flex-col items-center justify-center relative flex-shrink-0"
          >
            <EFootballCard 
              player={player} 
              size="lg" 
              theme={cardTheme}
              highlight={true} 
            />
          </motion.div>

          {/* RIGHT SIDE: BROADCAST DASHBOARD & STANDARD TABLES */}
          <motion.div
            initial={{ x: 120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex-1 h-full flex flex-col gap-4 min-w-0"
          >
            {/* HERO CURRENT BID PANEL */}
            <div 
              className="bg-slate-900/95 border border-white/15 rounded-2xl p-6 relative overflow-hidden flex items-center justify-between shadow-2xl backdrop-blur-xl"
              style={{
                borderLeft: leadingTeam ? `8px solid ${leadingTeam.primaryColor}` : '8px solid #ea580c',
              }}
            >
              <div>
                <div className="text-xs font-black uppercase text-orange-400 tracking-widest mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                  CURRENT HIGHEST BID
                </div>
                <div 
                  className={`text-6xl md:text-7xl font-black tracking-tight transition-all duration-300 ${
                    flash ? 'text-orange-400 scale-105' : 'text-amber-400'
                  }`}
                  style={{ fontFamily: 'var(--font-broadcast)' }}
                >
                  {formatCurrency(currentBid || player?.basePrice, tournament?.currency)}
                </div>
              </div>

              {/* Leading Team Crest */}
              {leadingTeam ? (
                <div className="flex items-center gap-5 bg-black/60 border border-white/15 p-4 rounded-xl shadow-inner">
                  {leadingTeam.logoUrl ? (
                    <img src={leadingTeam.logoUrl} alt={leadingTeam.name} className="w-16 h-16 object-contain" />
                  ) : (
                    <Shield className="w-14 h-14" style={{ color: leadingTeam.primaryColor }} />
                  )}
                  <div>
                    <div className="text-3xl font-black text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-broadcast)', color: leadingTeam.primaryColor }}>
                      {leadingTeam.name}
                    </div>
                    <div className="text-xs text-slate-300 font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                      Budget Left: <span className="text-amber-300 font-extrabold">{formatCurrency(leadingTeam.currentBalance, tournament?.currency)}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 text-sm font-bold uppercase tracking-wider italic" style={{ fontFamily: 'var(--font-display)' }}>
                  Awaiting opening bid...
                </div>
              )}
            </div>

            {/* STANDARD BID HISTORY TABLE */}
            <div className="flex-1 bg-slate-900/90 border border-white/15 rounded-2xl p-4 flex flex-col min-h-0 overflow-hidden backdrop-blur-xl shadow-2xl">
              <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                    Live Bidding History Standard Table
                  </h3>
                </div>
                <span className="text-xs text-slate-400 font-extrabold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                  {bidHistory.length} BIDS RECORDED
                </span>
              </div>

              {/* Standard Table View */}
              <div className="flex-1 overflow-y-auto pr-1">
                {bidHistory && bidHistory.length > 0 ? (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-xs font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                        <th className="py-2.5 px-3">Rank</th>
                        <th className="py-2.5 px-3">Bidding Club</th>
                        <th className="py-2.5 px-3">Amount</th>
                        <th className="py-2.5 px-3">Time</th>
                        <th className="py-2.5 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm" style={{ fontFamily: 'var(--font-display)' }}>
                      {bidHistory.slice().reverse().map((bid, idx) => {
                        const isHighest = idx === 0;
                        const team = teams.find(t => t.id === bid.teamId) || { name: bid.teamName || 'Club', primaryColor: '#3b82f6' };
                        return (
                          <tr 
                            key={bid.id || idx}
                            className={`transition-colors ${
                              isHighest ? 'bg-orange-500/20 font-bold' : 'hover:bg-white/5'
                            }`}
                          >
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-black ${
                                isHighest ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
                              }`}>
                                #{bidHistory.length - idx}
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2.5">
                                <span className="w-3 h-3 rounded-full" style={{ background: team.primaryColor || '#3b82f6' }} />
                                <span className="text-white font-extrabold uppercase tracking-wider" style={{ color: isHighest ? team.primaryColor : '#fff' }}>
                                  {team.name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-extrabold text-amber-300 text-base" style={{ fontFamily: 'var(--font-broadcast)' }}>
                              {formatCurrency(bid.amount, tournament?.currency)}
                            </td>
                            <td className="py-3 px-3 text-xs text-slate-400 font-semibold">
                              {formatTime(bid.timestamp)}
                            </td>
                            <td className="py-3 px-3 text-right">
                              {isHighest ? (
                                <span className="px-2.5 py-1 bg-orange-500/25 border border-orange-500/50 text-orange-400 text-xs font-black uppercase rounded">
                                  LEADER
                                </span>
                              ) : (
                                <span className="text-slate-500 text-xs font-bold uppercase">
                                  OUTBID
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-extrabold tracking-widest py-10" style={{ fontFamily: 'var(--font-display)' }}>
                    <Clock className="w-10 h-10 mb-2 opacity-30 text-orange-400" />
                    NO BIDS PLACED YET. WAITING FOR FIRST BID...
                  </div>
                )}
              </div>
            </div>

            {/* FRANCHISE BUDGETS STANDINGS TABLE */}
            {teams && teams.length > 0 && (
              <div className="bg-slate-900/90 border border-white/15 rounded-xl p-3 backdrop-blur-xl flex-shrink-0">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                  Franchise Budget Balances
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {teams.map(t => {
                    const isLeading = t.id === leadingTeam?.id;
                    return (
                      <div 
                        key={t.id} 
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${
                          isLeading ? 'bg-orange-500/15 border-orange-500/50' : 'bg-black/40 border-white/10'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-extrabold text-white uppercase truncate" style={{ fontFamily: 'var(--font-display)', color: t.primaryColor }}>
                            {t.name}
                          </div>
                          <div className="text-xs font-black text-amber-300" style={{ fontFamily: 'var(--font-display)' }}>
                            {formatCurrency(t.currentBalance, tournament?.currency)}
                          </div>
                        </div>
                        {isLeading && (
                          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
};

// ── 4. SOLD STAGE ───────────────────────────────────────────────────────
const SoldStage = ({ player, winningTeam, finalPrice, tournament, settings }) => {
  const cardTheme = settings?.cardTheme || 'GOLD';

  return (
    <div className="w-full h-full">
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-between p-10 select-none">
        
        {/* Top Banner */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-3 bg-green-950/90 border border-green-500/60 px-8 py-2.5 rounded-full shadow-2xl shadow-green-500/30"
        >
          <Award className="w-7 h-7 text-green-400" />
          <span className="text-2xl font-black text-green-400 tracking-widest uppercase" style={{ fontFamily: 'var(--font-broadcast)' }}>
            OFFICIAL TRANSFER DEAL COMPLETED
          </span>
        </motion.div>

        {/* Center Presentation */}
        <div className="my-auto flex flex-col md:flex-row items-center justify-center gap-12 w-full max-w-5xl">
          
          {/* EA FC Card with SOLD Stamp */}
          <motion.div
            initial={{ scale: 0.6, rotate: -6, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 12 }}
          >
            <EFootballCard 
              player={player} 
              size="lg" 
              theme={cardTheme}
              status="SOLD" 
              highlight={true}
            />
          </motion.div>

          {/* Winning Club Details */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col items-start gap-4 text-left"
          >
            <div className="text-xs font-black text-green-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
              ACQUIRED BY
            </div>

            {winningTeam && (
              <div className="flex items-center gap-6 bg-slate-900/95 border border-white/15 p-6 rounded-2xl shadow-2xl backdrop-blur-xl">
                {winningTeam.logoUrl && (
                  <img src={winningTeam.logoUrl} alt={winningTeam.name} className="w-20 h-20 object-contain" />
                )}
                <div>
                  <h2 
                    className="text-5xl font-black uppercase tracking-wider" 
                    style={{ fontFamily: 'var(--font-broadcast)', color: winningTeam.primaryColor || '#22c55e' }}
                  >
                    {winningTeam.name}
                  </h2>
                  <p className="text-sm text-slate-300 font-extrabold" style={{ fontFamily: 'var(--font-display)' }}>
                    Manager: {winningTeam.managerName || 'Franchise Director'}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-2">
              <div className="text-xs font-black text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                FINAL TRANSFER FEE
              </div>
              <div className="text-7xl font-black text-amber-400 tracking-tight" style={{ fontFamily: 'var(--font-broadcast)' }}>
                {formatCurrency(finalPrice, tournament?.currency)}
              </div>
            </div>
          </motion.div>

        </div>

        {/* Footer */}
        <div className="text-xs font-extrabold text-slate-400 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
          {player?.name} HAS OFFICIALLY JOINED {winningTeam?.name || 'THE CLUB'}
        </div>
      </div>
    </div>
  );
};

// ── 5. UNSOLD STAGE ─────────────────────────────────────────────────────
const UnsoldStage = ({ player, settings }) => {
  const cardTheme = settings?.cardTheme || 'GOLD';

  return (
    <div className="w-full h-full">
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10 select-none text-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-6"
        >
          <EFootballCard 
            player={player} 
            size="lg" 
            theme={cardTheme}
            status="UNSOLD" 
          />

          <h2 className="text-5xl font-black text-red-500 uppercase tracking-widest" style={{ fontFamily: 'var(--font-broadcast)' }}>
            PLAYER UNSOLD
          </h2>
          <p className="text-sm text-slate-400 font-extrabold uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            {player?.name} HAS RETURNED TO THE AUCTION POOL
          </p>
        </motion.div>
      </div>
    </div>
  );
};

// ── MAIN EXPORT ─────────────────────────────────────────────────────────
export const PlayerCardShowcase = ({
  player,
  tournament,
  teams = [],
  stage = 'IDLE',
  currentBid = 0,
  leadingTeam = null,
  bidHistory = [],
  winningTeam = null,
  finalPrice = 0,
  settings = {},
}) => {
  return (
    <AnimatePresence mode="wait">
      {stage === 'IDLE' && (
        <motion.div key="idle" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <IdleStage tournament={tournament} teams={teams} />
        </motion.div>
      )}

      {stage === 'INTRO' && player && (
        <motion.div key={`intro-${player.id}`} className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <IntroStage player={player} tournament={tournament} settings={settings} />
        </motion.div>
      )}

      {stage === 'BIDDING' && player && (
        <motion.div key={`bidding-${player.id}`} className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <BiddingStage 
            player={player} 
            currentBid={currentBid} 
            leadingTeam={leadingTeam} 
            bidHistory={bidHistory} 
            teams={teams}
            tournament={tournament} 
            settings={settings} 
          />
        </motion.div>
      )}

      {(stage === 'SOLD' || stage === 'SIGNING') && player && (
        <motion.div key={`sold-${player.id}`} className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <SoldStage 
            player={player} 
            winningTeam={winningTeam || leadingTeam} 
            finalPrice={finalPrice || currentBid} 
            tournament={tournament} 
            settings={settings} 
          />
        </motion.div>
      )}

      {stage === 'UNSOLD' && player && (
        <motion.div key={`unsold-${player.id}`} className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <UnsoldStage player={player} settings={settings} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
