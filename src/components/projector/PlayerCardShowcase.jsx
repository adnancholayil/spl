import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/currency';
import { EFootballCard } from '../common/EFootballCard';
import { StadiumBackground } from './StadiumBackground';
import { SPLLogo } from '../common/SPLLogo';
import { storageService } from '../../services/storageService';
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
export const MysteryCardBack = ({ size = 'xl', customTheme = null }) => {
  const [cfg, setCfg] = useState(customTheme);

  useEffect(() => {
    if (!customTheme) {
      setCfg(storageService.getCardTheme());
    } else {
      setCfg(customTheme);
    }
  }, [customTheme]);

  const scaleMap = { sm: 0.65, md: 0.85, lg: 1.1, xl: 1.35 };
  const scale = scaleMap[size] || scaleMap.xl;
  const cardWidth = 320 * scale;
  const cardHeight = 440 * scale;
  
  let cardPath = "M 80 15 Q 160 5 240 15 L 305 55 L 305 345 L 160 405 L 15 345 L 15 55 Z";
  if (cfg?.cardShape === 'shield') {
    cardPath = "M 15 15 L 305 15 L 305 280 Q 160 440 15 280 Z";
  } else if (cfg?.cardShape === 'classic') {
    cardPath = "M 35 15 L 285 15 Q 305 15 305 35 L 305 385 Q 305 405 285 405 L 35 405 Q 15 405 15 385 L 15 35 Q 15 15 35 15 Z";
  } else if (cfg?.cardShape === 'notched') {
    cardPath = "M 45 15 L 275 15 L 305 45 L 305 375 L 275 405 L 45 405 L 15 375 L 15 45 Z";
  } else if (cfg?.cardShape === 'hex') {
    cardPath = "M 160 15 L 305 80 L 270 380 L 160 415 L 50 380 L 15 80 Z";
  } else if (cfg?.cardShape === 'cyber') {
    cardPath = "M 60 15 L 260 15 L 305 60 L 305 340 L 160 415 L 15 340 L 15 60 Z";
  }

  return (
    <div 
      style={{ 
        width: cardWidth, 
        height: cardHeight,
        filter: 'drop-shadow(0 0 50px rgba(0,0,0,0.5)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))'
      }} 
      className="relative select-none"
    >
      <svg
        viewBox="0 0 320 440"
        width={cardWidth}
        height={cardHeight}
        className="w-full h-full overflow-visible"
      >
        <defs>
          <path id="mys-shape" d={cardPath} />
          <clipPath id="mys-clip"><use href="#mys-shape" /></clipPath>

          {/* Rich Obsidian Background */}
          <linearGradient id="mys-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg?.bgGrad1 || '#141824'} />
            <stop offset="25%" stopColor={cfg?.bgGrad2 || '#0B0F1A'} />
            <stop offset="60%" stopColor={cfg?.bgGrad3 || '#0B0F1A'} />
            <stop offset="100%" stopColor={cfg?.bgGrad4 || '#020408'} />
          </linearGradient>

          {/* 5-stop Shimmer Gold Border */}
          <linearGradient id="mys-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg?.border1 || '#FFFDE7'} />
            <stop offset="40%" stopColor={cfg?.border2 || '#F59E0B'} />
            <stop offset="100%" stopColor={cfg?.border3 || '#FDE68A'} />
          </linearGradient>

          {/* Inner border accent */}
          <linearGradient id="mys-gold-inner" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg?.border1 || 'rgba(254,240,138,0.4)'} stopOpacity="0.4" />
            <stop offset="50%" stopColor={cfg?.border2 || 'rgba(245,158,11,0.15)'} stopOpacity="0.15" />
            <stop offset="100%" stopColor={cfg?.border1 || 'rgba(254,240,138,0.4)'} stopOpacity="0.4" />
          </linearGradient>

          {/* Center emblem dark circle */}
          <radialGradient id="mys-emblem-bg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={cfg?.bgGrad4 || '#1A1F30'} />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>

          {/* Radial center spotlight */}
          <radialGradient id="mys-spotlight" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(245,158,11,0.18)" />
            <stop offset="60%" stopColor="rgba(245,158,11,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0)" />
          </radialGradient>

          {/* Diagonal stripe texture (Geometric) */}
          <pattern id="mys-stripes" width="24" height="24" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="1" height="24" fill="rgba(255,255,255,0.05)" />
          </pattern>

          {/* Horizontal lines (Geometric) */}
          <pattern id="mys-hlines" width="320" height="16" patternUnits="userSpaceOnUse">
            <line x1="0" y1="15.5" x2="320" y2="15.5" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
          
          {/* Hexagon texture (Modern) */}
          <pattern id="mys-hex" width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(0.5)">
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z M14 48 L28 40 L28 24 L14 32 L0 24 L0 40 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>
          
          {/* Waves (Organic) */}
          <pattern id="mys-waves" width="100" height="40" patternUnits="userSpaceOnUse">
            <path d="M0 20 Q25 0 50 20 T100 20" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          </pattern>

          {/* Circuit Board (Circuit) */}
          <pattern id="mys-circuit" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10 L30 10 L40 20 L40 50 M20 30 L50 30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="40" cy="20" r="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="20" cy="30" r="2" fill="rgba(255,255,255,0.15)" />
          </pattern>

          {/* Carbon Fiber (Carbon) */}
          <pattern id="mys-carbon" width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="rgba(255,255,255,0.03)" />
            <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.03)" />
            <path d="M0 0 L4 4 M4 0 L0 4 M4 4 L8 8 M8 4 L4 8" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          </pattern>

          {/* Halftone Dots (Halftone) */}
          <pattern id="mys-halftone" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <circle cx="4" cy="4" r="1.5" fill="rgba(255,255,255,0.08)" />
            <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.08)" />
          </pattern>

          {/* Topo Map (Topo) */}
          <pattern id="mys-topo" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 50 Q25 25 50 50 T100 50 M0 70 Q25 45 50 70 T100 70 M0 30 Q25 5 50 30 T100 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <path d="M30 0 Q55 25 30 50 T30 100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>
        </defs>

        {/* ── LAYER 1: Deep background ── */}
        <use href="#mys-shape" fill="url(#mys-bg)" />

        {/* ── LAYER 2: Textures based on Design Template ── */}
        {(cfg?.backSideDesign === 'geometric' || !cfg?.backSideDesign) && (
          <>
            <use href="#mys-shape" fill="url(#mys-stripes)" />
            <use href="#mys-shape" fill="url(#mys-hlines)" />
          </>
        )}
        {cfg?.backSideDesign === 'modern' && (
          <use href="#mys-shape" fill="url(#mys-hex)" />
        )}
        {cfg?.backSideDesign === 'organic' && (
          <use href="#mys-shape" fill="url(#mys-waves)" />
        )}
        {cfg?.backSideDesign === 'circuit' && (
          <use href="#mys-shape" fill="url(#mys-circuit)" />
        )}
        {cfg?.backSideDesign === 'carbon' && (
          <use href="#mys-shape" fill="url(#mys-carbon)" />
        )}
        {cfg?.backSideDesign === 'halftone' && (
          <use href="#mys-shape" fill="url(#mys-halftone)" />
        )}
        {cfg?.backSideDesign === 'topo' && (
          <use href="#mys-shape" fill="url(#mys-topo)" />
        )}
        {/* 'minimal' has no layer 2 texture */}

        {/* ── LAYER 3: Clipped design elements ── */}
        <g clipPath="url(#mys-clip)">
          
          {(cfg?.backSideDesign === 'geometric' || !cfg?.backSideDesign) && (
            <>
              {/* Sweeping diagonal golden light beam (top-left to bottom-right) */}
              <rect x="-40" y="-40" width="80" height="500" transform="rotate(-35, 160, 210)" fill="rgba(255,255,255,0.04)" />
              <rect x="60" y="-40" width="30" height="500" transform="rotate(-35, 160, 210)" fill="rgba(255,255,255,0.03)" />

              {/* Top decorative geometric triangle accent */}
              <polygon points="160,18 130,55 190,55" fill="rgba(255,255,255,0.12)" />
              <polygon points="160,28 140,55 180,55" fill="rgba(255,255,255,0.08)" />

              {/* Horizontal accent lines (top and bottom thirds) */}
              <line x1="30" y1="85" x2="290" y2="85" stroke="url(#mys-gold-inner)" strokeWidth="1" />
              <line x1="30" y1="88" x2="290" y2="88" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <line x1="30" y1="330" x2="290" y2="330" stroke="url(#mys-gold-inner)" strokeWidth="1" />
              <line x1="30" y1="333" x2="290" y2="333" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />

              {/* Corner diamond accents - top */}
              <polygon points="40,60 55,68 40,76" fill="rgba(255,255,255,0.25)" />
              <polygon points="280,60 265,68 280,76" fill="rgba(255,255,255,0.25)" />
            </>
          )}

          {cfg?.backSideDesign === 'modern' && (
            <>
              {/* Sleek diagonal cuts */}
              <polygon points="0,150 320,50 320,100 0,200" fill="url(#mys-gold-inner)" opacity="0.3" />
              <polygon points="0,400 320,300 320,350 0,450" fill="url(#mys-gold-inner)" opacity="0.3" />
              {/* Simple border trace */}
              <use href="#mys-shape" fill="none" stroke="url(#mys-gold-inner)" strokeWidth="4" />
            </>
          )}

          {cfg?.backSideDesign === 'organic' && (
            <>
              {/* Flowing curves */}
              <path d="M -50 150 Q 160 50 370 150 L 370 200 Q 160 100 -50 200 Z" fill="url(#mys-gold-inner)" opacity="0.4" />
              <path d="M -50 300 Q 160 400 370 300 L 370 250 Q 160 350 -50 250 Z" fill="url(#mys-gold-inner)" opacity="0.2" />
            </>
          )}

          {cfg?.backSideDesign === 'circuit' && (
            <>
              {/* Cyberpunk tech nodes */}
              <circle cx="60" cy="80" r="4" fill="rgba(255,255,255,0.3)" />
              <circle cx="260" cy="80" r="4" fill="rgba(255,255,255,0.3)" />
              <circle cx="60" cy="360" r="4" fill="rgba(255,255,255,0.3)" />
              <circle cx="260" cy="360" r="4" fill="rgba(255,255,255,0.3)" />
              <line x1="60" y1="80" x2="60" y2="360" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="260" y1="80" x2="260" y2="360" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            </>
          )}

          {cfg?.backSideDesign === 'carbon' && (
            <>
              {/* Sports dynamic angled bars */}
              <polygon points="0,60 120,60 100,80 0,80" fill="url(#mys-gold-inner)" opacity="0.5" />
              <polygon points="320,380 200,380 220,360 320,360" fill="url(#mys-gold-inner)" opacity="0.5" />
            </>
          )}

          {cfg?.backSideDesign === 'halftone' && (
            <>
              {/* Comic / Pop-art styling */}
              <circle cx="160" cy="220" r="140" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="15" strokeDasharray="1 30" strokeLinecap="round" />
            </>
          )}

          {cfg?.backSideDesign === 'topo' && (
            <>
              {/* Topographic elevation lines */}
              <circle cx="160" cy="220" r="100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
              <circle cx="160" cy="220" r="130" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <circle cx="160" cy="220" r="160" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            </>
          )}
          
          {cfg?.backSideDesign === 'minimal' && (
            <>
              {/* Minimalist inset border */}
              <rect x="20" y="20" width="280" height="400" rx="10" fill="none" stroke="url(#mys-gold-inner)" strokeWidth="1.5" />
            </>
          )}

          {/* Center radial spotlight (all except minimal) */}
          {cfg?.backSideDesign !== 'minimal' && (
            <ellipse cx="160" cy="210" rx="130" ry="100" fill="url(#mys-spotlight)" />
          )}

          {/* ── CENTER EMBLEM SYSTEM ── */}
          {cfg?.showBackSideLogo !== false && (
            <g transform={`translate(160, ${cfg?.backSideLogoY ?? 200}) scale(${(cfg?.backSideLogoScale ?? 100)/100}) translate(-160, -200)`}>
              {/* Outer rings */}
              <circle cx="160" cy="200" r="88" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
              <circle cx="160" cy="200" r="80" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="6 6" />
              <circle cx="160" cy="200" r="70" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />

              {/* Dark emblem background circle */}
              <circle cx="160" cy="200" r="58" fill="url(#mys-emblem-bg)" />
              <circle cx="160" cy="200" r="58" fill="none" stroke="url(#mys-gold)" strokeWidth="2.5" />

              {/* SPL Logo */}
              <image
                href="/assets/logo.png"
                x="122" y="162" width="76" height="76"
                preserveAspectRatio="xMidYMid meet"
                style={{ filter: 'drop-shadow(0px 3px 8px rgba(0,0,0,0.9))' }}
              />
              <foreignObject x="124" y="162" width="76" height="76">
                <div xmlns="http://www.w3.org/1999/xhtml" style={{
                  width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Bebas Neue', Impact, 'Arial Black', sans-serif", fontSize: '16px', fontWeight: 'bold',
                  color: '#FFFFFF', letterSpacing: '2px', textShadow: '0px 1px 5px rgba(0,0,0,0.95)', pointerEvents: 'none'
                }}>SPL</div>
              </foreignObject>
            </g>
          )}

          {/* ── BOTTOM BRANDING SECTION ── */}
          {cfg?.showBackSideText !== false && (
            <g transform={`translate(0, ${(cfg?.backSideTextY ?? 315) - 315})`}>
              {/* Divider dots */}
              <circle cx="140" cy="290" r="1.5" fill="rgba(255,255,255,0.6)" />
              <circle cx="160" cy="290" r="1.5" fill="rgba(255,255,255,0.9)" />
              <circle cx="180" cy="290" r="1.5" fill="rgba(255,255,255,0.6)" />

              {/* SUPER PREMIER LEAGUE text */}
              <text
                x="160" y="315"
                fontFamily="'Bebas Neue', Impact, sans-serif"
                fontSize={cfg?.backSideTextSize ?? 22}
                fontWeight="700"
                fill="url(#mys-gold)"
                textAnchor="middle"
                style={{ letterSpacing: '4px' }}
              >SUPER PREMIER LEAGUE</text>

              {/* Season text */}
              <text
                x="160" y={315 + 17}
                fontFamily="Arial, sans-serif"
                fontSize={Math.max(10, (cfg?.backSideTextSize ?? 22) - 12)}
                fontWeight="400"
                fill="rgba(255,255,255,0.35)"
                textAnchor="middle"
                style={{ letterSpacing: '3px' }}
              >2026 SEASON</text>
            </g>
          )}

          {/* Bottom corner accents (Geometric only) */}
          {(cfg?.backSideDesign === 'geometric' || !cfg?.backSideDesign) && (
            <>
              <polygon points="40,345 55,337 40,329" fill="rgba(255,255,255,0.25)" />
              <polygon points="280,345 265,337 280,329" fill="rgba(255,255,255,0.25)" />
            </>
          )}
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

// ── 3. BIDDING STAGE (PRECISION BROADCAST LAYOUT) ─────────
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

  // bidHistory has newest bids at index 0 (stored via unshift / [newBid, ...rest])
  const recentBids = (bidHistory || []).slice(0, 3);
  const teamColor = leadingTeam?.primaryColor || '#3b82f6';

  return (
    <div className="w-full h-full relative">
      <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-12 select-none overflow-hidden justify-center items-center">

        {/* Top-Right Broadcast Badge */}
        <div className="absolute top-8 right-8 z-30 flex items-center gap-3 bg-black/60 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-2xl">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.9)]" />
          <span className="text-[11px] font-black text-white uppercase tracking-[0.25em]" style={{ fontFamily: 'var(--font-display)' }}>
            Live Auction
          </span>
          {bidHistory && bidHistory.length > 0 && (
            <>
              <span className="w-1 h-1 rounded-full bg-white/25" />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-widest" style={{ fontFamily: 'var(--font-display)' }}>
                Bids: <strong className="text-amber-400 font-black">{bidHistory.length}</strong>
              </span>
            </>
          )}
        </div>

        {/* MAIN STAGE: DUAL-COLUMN BROADCAST GRID */}
        <div className="flex items-center justify-center gap-16 lg:gap-24 w-full max-w-[1300px] my-auto">
          
          {/* LEFT COLUMN: HERO EA FC PLAYER CARD */}
          <motion.div
            initial={{ x: -80, opacity: 0, scale: 0.94 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 20 }}
            className="flex-shrink-0 relative z-20 flex items-center justify-center"
          >
            {/* Dynamic team aura behind card */}
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[540px] blur-[120px] -z-10 rounded-full opacity-25 mix-blend-screen pointer-events-none transition-colors duration-700" 
              style={{ backgroundColor: teamColor }}
            />
            <EFootballCard
              player={player}
              size="xl"
              theme={cardTheme}
              highlight={true}
            />
          </motion.div>

          {/* RIGHT COLUMN: PRECISION ALIGNED BROADCAST DATA STACK */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-full max-w-[460px] relative z-10"
          >
            {/* 1. CURRENT BID SECTION */}
            <div className="flex flex-col items-center w-full text-center">
              <span 
                className="text-xs tracking-[0.45em] text-white/50 uppercase mb-3 font-bold" 
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Current Bid
              </span>
              <span 
                className={`text-[115px] lg:text-[130px] leading-none text-white font-black drop-shadow-2xl transition-all duration-300 ${
                  flash ? 'scale-105 text-amber-400' : ''
                }`} 
                style={{ 
                  fontFamily: 'var(--font-broadcast)',
                  letterSpacing: '0.08em'
                }}
              >
                {formatCurrency(currentBid || player?.basePrice, tournament?.currency)}
              </span>
            </div>

            {/* SEPARATOR 1 */}
            <div className="w-full max-w-[440px] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent my-8" />

            {/* 2. LEADING CLUB SECTION (CLEAN & UNBOXED) */}
            <div className="flex flex-col items-center w-full">
              <span 
                className="text-[11px] tracking-[0.4em] text-white/40 uppercase mb-3 font-bold" 
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {leadingTeam ? 'Leading Club' : 'Awaiting Bids'}
              </span>
              {leadingTeam ? (
                <div className="flex items-center justify-center gap-5">
                  {leadingTeam.logoUrl ? (
                    <img 
                      src={leadingTeam.logoUrl} 
                      alt={leadingTeam.name} 
                      className="w-16 h-16 object-contain drop-shadow-2xl flex-shrink-0" 
                    />
                  ) : (
                    <Shield className="w-14 h-14 flex-shrink-0" style={{ color: leadingTeam.primaryColor || '#38bdf8' }} />
                  )}
                  <span 
                    className="text-4xl lg:text-5xl text-white font-black tracking-widest uppercase drop-shadow-xl" 
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {leadingTeam.name}
                  </span>
                </div>
              ) : (
                <span className="text-2xl text-white/20 font-bold tracking-widest uppercase" style={{ fontFamily: 'var(--font-display)' }}>
                  ...
                </span>
              )}
            </div>

            {/* SEPARATOR 2 (ONLY WHEN BIDS EXIST) */}
            {recentBids.length > 0 && (
              <div className="w-full max-w-[440px] h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent my-8" />
            )}

            {/* 3. RECENT ACTIVITY (STANDARD & MODERN UNBOXED BROADCAST TABLE) */}
            {recentBids.length > 0 && (
              <div className="flex flex-col items-center w-full max-w-[440px]">
                <span 
                  className="text-[11px] tracking-[0.4em] text-white/40 uppercase mb-5 font-bold" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Recent Activity
                </span>
                <div className="flex flex-col gap-4 w-full">
                  {recentBids.map((bid, idx) => {
                    const team = teams.find(t => t.id === bid.teamId) || { name: bid.teamName || 'Club', primaryColor: '#3b82f6' };
                    const isLatest = idx === 0;
                    return (
                      <div 
                        key={bid.id || idx} 
                        className="flex items-center justify-between w-full"
                      >
                        {/* Team Name with indicator */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span 
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              isLatest ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.9)] animate-pulse' : 'bg-white/30'
                            }`} 
                            style={team.primaryColor ? { backgroundColor: team.primaryColor } : {}}
                          />
                          <span 
                            className={`text-sm uppercase tracking-widest font-bold ${
                              isLatest ? 'text-amber-400 font-extrabold' : 'text-white/60'
                            }`} 
                            style={{ fontFamily: 'var(--font-display)' }}
                          >
                            {team.name}
                          </span>
                        </div>

                        {/* Connecting Dotted Line */}
                        <div 
                          className={`flex-1 border-b border-dashed mx-4 ${
                            isLatest ? 'border-amber-400/30' : 'border-white/15'
                          }`} 
                        />

                        {/* Bid Amount with gap on numbers */}
                        <div className="flex items-center flex-shrink-0">
                          <span 
                            className={`text-2xl font-black ${
                              isLatest ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.5)]' : 'text-white/60'
                            }`} 
                            style={{ 
                              fontFamily: 'var(--font-broadcast)',
                              letterSpacing: '0.06em'
                            }}
                          >
                            {formatCurrency(bid.amount, tournament?.currency)}
                          </span>
                        </div>
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
  
  // Use team color or default green for glow
  const teamColor = winningTeam?.primaryColor || '#22c55e';

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* MASSIVE TEAM LOGO AURA BACKGROUND */}
      {winningTeam?.logoUrl && (
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.07] mix-blend-screen pointer-events-none z-0">
          <motion.img 
            initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
            animate={{ scale: 1.8, rotate: 0, opacity: 1 }}
            transition={{ duration: 2, ease: "easeOut" }}
            src={winningTeam.logoUrl} 
            className="w-[800px] h-[800px] object-contain blur-[2px]"
          />
        </div>
      )}
      
      {/* Ambient Color Glow */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] blur-[150px] -z-10 rounded-full opacity-20 pointer-events-none"
        style={{ backgroundColor: teamColor }}
      />

      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-10 select-none">
        
        {/* COLLAB GRAPHIC CONTAINER */}
        <div className="flex flex-col items-center justify-center relative w-full h-full">
          
        {/* HEADER: TEAM NAME */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-8 flex flex-col items-center"
        >
          <div className="text-sm tracking-[0.5em] text-white/70 uppercase mb-4 font-bold" style={{ fontFamily: 'var(--font-display)' }}>
            Official Transfer To
          </div>
          <div 
            className="text-6xl md:text-8xl font-black uppercase tracking-wide drop-shadow-2xl text-center leading-tight" 
            style={{ fontFamily: 'var(--font-broadcast)', color: teamColor }}
          >
            {winningTeam?.name || 'NEW CLUB'}
          </div>
        </motion.div>

        {/* HORIZONTAL COLLAB LAYOUT */}
        <div className="flex items-center justify-center gap-8 md:gap-16 w-full max-w-[1400px]">
          
          {/* LEFT: FINAL TRANSFER FEE */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.6 }}
            className="flex flex-col items-end text-right flex-1"
          >
            <div className="text-sm font-bold text-white/50 uppercase tracking-[0.4em] mb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Final Transfer Fee
            </div>
            <div className="text-[80px] md:text-[110px] font-black text-white tracking-normal drop-shadow-[0_20px_50px_rgba(0,0,0,0.9)] leading-none" style={{ fontFamily: 'var(--font-broadcast)' }}>
              {formatCurrency(finalPrice, tournament?.currency)}
            </div>
          </motion.div>

          {/* CENTER: THE CARD + SOLD STAMP */}
          <motion.div
            initial={{ scale: 0.8, y: 50, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.1 }}
            className="relative z-20 shrink-0"
          >
            <EFootballCard
              player={player}
              size="xl"
              theme={cardTheme}
              highlight={true}
            />
            
            {/* EPIC SOLD STAMP */}
            <motion.div
               initial={{ scale: 4, opacity: 0, rotate: 0 }}
               animate={{ scale: 1, opacity: 1, rotate: -8 }}
               transition={{ type: 'spring', stiffness: 150, damping: 10, delay: 0.8 }}
               className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
            >
               <div className="relative flex flex-col items-center justify-center px-8 py-3 bg-black/60 backdrop-blur-md border-y-[6px] border-red-600 shadow-[0_15px_40px_rgba(0,0,0,0.8)] min-w-[320px]">
                 <span className="text-white font-black text-[120px] tracking-[0.3em] pl-[0.3em] uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] leading-none" style={{ fontFamily: 'var(--font-broadcast)' }}>
                   SOLD
                 </span>
               </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: THE TEAM LOGO */}
          <motion.div
             initial={{ x: 100, opacity: 0 }}
             animate={{ x: 0, opacity: 1 }}
             transition={{ type: 'spring', stiffness: 100, damping: 20, delay: 1.8 }}
             className="flex-1 flex justify-start items-center"
          >
             {winningTeam?.logoUrl ? (
                <img src={winningTeam.logoUrl} alt="Team" className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" />
             ) : (
                <Shield className="w-32 h-32 md:w-48 md:h-48 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]" style={{ color: teamColor }} />
             )}
          </motion.div>

        </div>
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
