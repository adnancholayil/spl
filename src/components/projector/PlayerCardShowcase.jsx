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
  const cardPath = "M 80 15 Q 160 5 240 15 L 305 55 L 305 345 L 160 405 L 15 345 L 15 55 Z";

  return (
    <div style={{ width: cardWidth, height: cardHeight }} className="relative select-none">
      <svg
        viewBox="0 0 320 440"
        width={cardWidth}
        height={cardHeight}
        className="w-full h-full overflow-visible"
        style={{ filter: 'drop-shadow(0 0 50px rgba(212,175,55,0.5)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))' }}
      >
        <defs>
          <path id="mys-shape" d={cardPath} />
          <clipPath id="mys-clip"><use href="#mys-shape" /></clipPath>

          {/* Rich Obsidian Background */}
          <linearGradient id="mys-bg" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%" stopColor="#141824" />
            <stop offset="40%" stopColor="#0B0F1A" />
            <stop offset="100%" stopColor="#020408" />
          </linearGradient>

          {/* 5-stop Shimmer Gold Border */}
          <linearGradient id="mys-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFDE7" />
            <stop offset="20%" stopColor="#F59E0B" />
            <stop offset="50%" stopColor="#FEF08A" />
            <stop offset="80%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>

          {/* Inner border accent */}
          <linearGradient id="mys-gold-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(254,240,138,0.4)" />
            <stop offset="50%" stopColor="rgba(245,158,11,0.15)" />
            <stop offset="100%" stopColor="rgba(254,240,138,0.4)" />
          </linearGradient>

          {/* Center emblem dark circle */}
          <radialGradient id="mys-emblem-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1A1F30" />
            <stop offset="100%" stopColor="#08090F" />
          </radialGradient>

          {/* Radial center spotlight */}
          <radialGradient id="mys-spotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,158,11,0.18)" />
            <stop offset="60%" stopColor="rgba(245,158,11,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Diagonal stripe texture */}
          <pattern id="mys-stripes" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="1" height="24" fill="rgba(245,158,11,0.05)" />
          </pattern>

          {/* Horizontal lines */}
          <pattern id="mys-hlines" width="320" height="16" patternUnits="userSpaceOnUse">
            <line x1="0" y1="15.5" x2="320" y2="15.5" stroke="rgba(245,158,11,0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* ── LAYER 1: Deep background ── */}
        <use href="#mys-shape" fill="url(#mys-bg)" />

        {/* ── LAYER 2: Subtle grid texture ── */}
        <use href="#mys-shape" fill="url(#mys-stripes)" />
        <use href="#mys-shape" fill="url(#mys-hlines)" />

        {/* ── LAYER 3: Clipped design elements ── */}
        <g clipPath="url(#mys-clip)">
          {/* Sweeping diagonal golden light beam (top-left to bottom-right) */}
          <rect x="-40" y="-40" width="80" height="500" transform="rotate(-35, 160, 210)" fill="rgba(245,158,11,0.04)" />
          <rect x="60" y="-40" width="30" height="500" transform="rotate(-35, 160, 210)" fill="rgba(245,158,11,0.03)" />

          {/* Top decorative geometric triangle accent */}
          <polygon points="160,18 130,55 190,55" fill="rgba(245,158,11,0.12)" />
          <polygon points="160,28 140,55 180,55" fill="rgba(245,158,11,0.08)" />

          {/* Horizontal accent lines (top and bottom thirds) */}
          <line x1="30" y1="85" x2="290" y2="85" stroke="url(#mys-gold-inner)" strokeWidth="1" />
          <line x1="30" y1="88" x2="290" y2="88" stroke="rgba(245,158,11,0.06)" strokeWidth="0.5" />
          <line x1="30" y1="330" x2="290" y2="330" stroke="url(#mys-gold-inner)" strokeWidth="1" />
          <line x1="30" y1="333" x2="290" y2="333" stroke="rgba(245,158,11,0.06)" strokeWidth="0.5" />

          {/* Corner diamond accents - top */}
          <polygon points="40,60 55,68 40,76" fill="rgba(245,158,11,0.25)" />
          <polygon points="280,60 265,68 280,76" fill="rgba(245,158,11,0.25)" />

          {/* Center radial spotlight */}
          <ellipse cx="160" cy="210" rx="130" ry="100" fill="url(#mys-spotlight)" />

          {/* ── CENTER EMBLEM SYSTEM ── */}
          {/* Outer rings */}
          <circle cx="160" cy="200" r="88" fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="2" />
          <circle cx="160" cy="200" r="80" fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="1" strokeDasharray="6 6" />
          <circle cx="160" cy="200" r="70" fill="none" stroke="rgba(245,158,11,0.35)" strokeWidth="1.5" />

          {/* Dark emblem background circle */}
          <circle cx="160" cy="200" r="58" fill="url(#mys-emblem-bg)" />
          <circle cx="160" cy="200" r="58" fill="none" stroke="url(#mys-gold)" strokeWidth="2.5" />

          {/* SPL Logo centered perfectly at (160, 200) */}
          <image
            href="/assets/logo.png"
            x="122" y="162" width="76" height="76"
            preserveAspectRatio="xMidYMid meet"
            style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.9))' }}
          />
          {/* SPL text — CSS flex centers it perfectly in the logo's pentagon */}
          <foreignObject x="124" y="162" width="76" height="76">
            <div xmlns="http://www.w3.org/1999/xhtml" style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif",
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              letterSpacing: '2px',
              textShadow: '0px 1px 5px rgba(0,0,0,0.95)',
              pointerEvents: 'none',
            }}>SPL</div>
          </foreignObject>

          {/* ── BOTTOM BRANDING SECTION ── */}
          {/* Divider dots */}
          <circle cx="140" cy="290" r="1.5" fill="rgba(245,158,11,0.6)" />
          <circle cx="160" cy="290" r="1.5" fill="rgba(245,158,11,0.9)" />
          <circle cx="180" cy="290" r="1.5" fill="rgba(245,158,11,0.6)" />

          {/* SUPER PREMIER LEAGUE text */}
          <text
            x="160" y="315"
            fontFamily="'Bebas Neue', Impact, sans-serif"
            fontSize="22"
            fontWeight="700"
            fill="url(#mys-gold)"
            textAnchor="middle"
            style={{ letterSpacing: '4px' }}
          >SUPER PREMIER LEAGUE</text>

          {/* Season text */}
          <text
            x="160" y="332"
            fontFamily="Arial, sans-serif"
            fontSize="10"
            fontWeight="400"
            fill="rgba(255,255,255,0.35)"
            textAnchor="middle"
            style={{ letterSpacing: '3px' }}
          >2026 SEASON</text>

          {/* Bottom corner accents */}
          <polygon points="40,345 55,337 40,329" fill="rgba(245,158,11,0.25)" />
          <polygon points="280,345 265,337 280,329" fill="rgba(245,158,11,0.25)" />
        </g>

        {/* ── LAYER 4: Outer gold border (drawn last so it's on top) ── */}
        <use href="#mys-shape" fill="none" stroke="url(#mys-gold)" strokeWidth="5" />
        {/* Inner gold accent border */}
        <use href="#mys-shape" fill="none" stroke="rgba(254,240,138,0.2)" strokeWidth="2" />
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
  const [flipped, setFlipped] = useState(false);   // triggers the flip
  const [revealed, setRevealed] = useState(false);   // flip animation done
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
                  className={`text-6xl md:text-7xl font-black tracking-tight transition-all duration-300 ${flash ? 'text-orange-400 scale-105' : 'text-amber-400'
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
                            className={`transition-colors ${isHighest ? 'bg-orange-500/20 font-bold' : 'hover:bg-white/5'
                              }`}
                          >
                            <td className="py-3 px-3">
                              <span className={`inline-flex items-center justify-center w-6 h-6 rounded text-xs font-black ${isHighest ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400'
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
                        className={`p-2.5 rounded-lg border flex items-center justify-between ${isLeading ? 'bg-orange-500/15 border-orange-500/50' : 'bg-black/40 border-white/10'
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
