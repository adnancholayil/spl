import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatCurrency } from '../../utils/currency';
import { EFootballCard } from '../common/EFootballCard';
import { StadiumBackground } from './StadiumBackground';
import { SPLLogo } from '../common/SPLLogo';
import { storageService } from '../../services/storageService';
import { soundEngine } from '../../services/soundService';
import { TacticalPitchSquad } from './TacticalPitchSquad';
import { Trophy, Shield, TrendingUp, Clock, Award, Users, Flame, Sparkles, FileText, Star, CheckCircle2, Radio, MapPin, Coins, Layers, Zap } from 'lucide-react';

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

// ── 1. IDLE STAGE (CLEAN, MINIMAL & FLAT DESIGN) ─────────────────────────
const IdleStage = ({ tournament, settings = {} }) => {
  const showLogo = settings?.showLogoOnHomeMedia !== false;
  const showBadge = settings?.logoBackgroundBadge !== false;
  const sponsors = Array.isArray(settings?.sponsors) ? settings.sponsors : [];
  const showSponsors = settings?.showSponsors && sponsors.length > 0;
  const tournamentName = tournament?.name || 'SUPER PREMIER LEAGUE 2026';

  // 3-second auto-cycle state for sponsor cards (shows 3 cards at a time)
  const [cycleIndex, setCycleIndex] = useState(0);

  useEffect(() => {
    if (!showSponsors || sponsors.length <= 3) {
      setCycleIndex(0);
      return;
    }
    const interval = setInterval(() => {
      setCycleIndex((prev) => (prev + 3) % sponsors.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [showSponsors, sponsors.length]);

  // Compute up to 3 visible cards
  const visibleSponsors = useMemo(() => {
    if (sponsors.length <= 3) return sponsors;
    const cards = [];
    for (let i = 0; i < 3; i++) {
      const idx = (cycleIndex + i) % sponsors.length;
      cards.push(sponsors[idx]);
    }
    return cards;
  }, [sponsors, cycleIndex]);

  if (!showLogo) {
    return null;
  }

  return (
    <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-8 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="flex flex-col items-center text-center max-w-5xl px-4"
      >
        {/* League Logo with High-Contrast Broadcast Background Badge */}
        <div className="mb-6 md:mb-8 flex items-center justify-center">
          {showBadge ? (
            <div
              className="flex items-center justify-center rounded-full p-5 sm:p-6 md:p-7 relative transition-all duration-300"
              style={{
                background: 'radial-gradient(circle at 50% 35%, rgba(15, 23, 42, 0.92) 0%, rgba(8, 12, 22, 0.97) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: '2px solid rgba(255, 255, 255, 0.22)',
                boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), inset 0 1px 1px rgba(255, 255, 255, 0.3), 0 0 40px rgba(0, 0, 0, 0.5)',
              }}
            >
              <SPLLogo size={160} showGlow={false} />
            </div>
          ) : (
            <SPLLogo size={170} showGlow={false} />
          )}
        </div>

        {/* Clean, Flat Tournament Title */}
        <h1
          className="text-white text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black uppercase tracking-wider"
          style={{
            fontFamily: 'var(--font-broadcast)',
            letterSpacing: '0.06em',
            lineHeight: 1,
            textShadow: '0 4px 24px rgba(0, 0, 0, 0.9), 0 2px 8px rgba(0, 0, 0, 0.8)'
          }}
        >
          {tournamentName}
        </h1>

        {/* Sharp ATM-Style Sponsor Cards (Max 3, 3s Cycle, Zero Text, No Shadows, No Hover) */}
        {showSponsors && (
          <div className="mt-8 md:mt-10 min-h-[120px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={`sponsors-cycle-${cycleIndex}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex items-center justify-center gap-4 md:gap-5 flex-wrap"
              >
                {visibleSponsors.map((sp, idx) => (
                  <div
                    key={`${sp.id || idx}-${idx}`}
                    className="relative overflow-hidden shrink-0"
                    style={{
                      width: 'clamp(150px, 15vw, 210px)',
                      aspectRatio: '85.6 / 53.98',
                      borderRadius: 0,
                      border: '1px solid rgba(255, 255, 255, 0.25)',
                      background: '#0B0F19',
                      boxShadow: 'none',
                    }}
                  >
                    {sp.imageUrl && (
                      <img
                        src={sp.imageUrl}
                        alt="Sponsor Card"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          borderRadius: 0,
                          display: 'block'
                        }}
                      />
                    )}
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
};



// ── MYSTERY CARD BACK COMPONENT (FOR SUSPENSE REVEAL) ────────────────────
export const MysteryCardBack = ({ size = 'xl', customTheme = null, isStudio = false, selectedElement = null, onSelectElement = null, centerVisual = false }) => {
  const [storedTheme, setStoredTheme] = useState(() => storageService.getCardTheme());

  useEffect(() => {
    if (!customTheme) {
      const handleUpdate = () => setStoredTheme(storageService.getCardTheme());
      window.addEventListener('card-theme-updated', handleUpdate);
      return () => window.removeEventListener('card-theme-updated', handleUpdate);
    }
  }, [customTheme]);

  const cfg = customTheme || storedTheme;

  const scaleMap = { sm: 0.65, md: 0.85, lg: 1.1, xl: 1.35 };
  const scale = scaleMap[size] || scaleMap.xl;
  const cardWidth = 320 * scale;
  const cardHeight = 440 * scale;

  // Calculate vertical offset to ensure card is centered in 320x440 viewBox
  const getCardShapeOffsetY = (shape) => {
    switch (shape) {
      case 'shield':
        return -7.5;
      case 'classic':
      case 'notched':
        return 10;
      case 'hex':
      case 'cyber':
        return 5;
      case 'eafc24':
      default:
        return 15;
    }
  };
  const visualOffsetY = centerVisual ? getCardShapeOffsetY(cfg?.cardShape) : 0;
  
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

  const rayColor1 = cfg?.border2 || '#f59e0b';
  const rayColor2 = cfg?.border1 || '#fbbf24';
  const fxIntensity = (cfg?.fxIntensity ?? 100) / 100;
  const effectsOn = cfg?.enableEffects !== false;

  const sheenSpeed = cfg?.fxSheenSpeed !== undefined ? Number(cfg.fxSheenSpeed) : 3.5;
  const sheenLag = cfg?.fxSheenLag !== undefined ? Number(cfg.fxSheenLag) : 1.5;
  const sheenSize = cfg?.fxSheenSize !== undefined ? Number(cfg.fxSheenSize) : 220;
  const sheenOpacity = (cfg?.fxSheenOpacity !== undefined ? Number(cfg.fxSheenOpacity) : 85) / 100;
  const totalSheenCycle = Math.max(0.8, Number((sheenSpeed + sheenLag).toFixed(2)));
  const sweepPercent = Math.min(99, Math.max(15, Math.round((sheenSpeed / totalSheenCycle) * 100)));

  return (
    <div 
      style={{ 
        width: cardWidth, 
        height: cardHeight,
        filter: 'drop-shadow(0 0 50px rgba(0,0,0,0.5)) drop-shadow(0 20px 40px rgba(0,0,0,0.95))'
      }} 
      className="relative select-none"
    >
      {/* ── CARD BACK EFFECTS ── */}
      {effectsOn && (
        <>
          {cfg?.fxBgRays && (
            <div
              className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-visible"
              style={{ transform: 'scale(1.4)' }}
            >
              <div
                style={{
                  width: '180%',
                  height: '180%',
                  position: 'absolute',
                  background: `conic-gradient(from 0deg at 50% 50%, ${rayColor1}45 0deg, transparent 35deg, ${rayColor2}70 90deg, transparent 125deg, ${rayColor1}45 180deg, transparent 215deg, ${rayColor2}70 270deg, transparent 305deg, ${rayColor1}45 360deg)`,
                  animation: 'splFc24RaySpin 10s linear infinite',
                  borderRadius: '50%',
                  filter: 'blur(8px)',
                  opacity: fxIntensity,
                }}
              />
            </div>
          )}

          {cfg?.fxBgParticles && (
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible" style={{ opacity: fxIntensity }}>
              <div className="spl-particle-1 absolute" style={{ bottom: '15%', left: '15%', width: 6, height: 6, borderRadius: '50%', background: '#fff', boxShadow: `0 0 8px ${rayColor1}, 0 0 16px ${rayColor2}` }} />
              <div className="spl-particle-2 absolute" style={{ bottom: '8%', right: '20%', width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: `0 0 10px ${rayColor2}, 0 0 20px #ffffff` }} />
              <div className="spl-particle-3 absolute" style={{ bottom: '25%', left: '48%', width: 5, height: 5, borderRadius: '50%', background: '#fff', boxShadow: `0 0 8px ${rayColor1}, 0 0 14px ${rayColor2}` }} />
            </div>
          )}

          {cfg?.fxBgPulse && (
            <div
              className="absolute -inset-5 pointer-events-none -z-10 rounded-3xl spl-bg-pulse"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${rayColor1}50 0%, ${rayColor2}25 50%, transparent 75%)`,
                filter: 'blur(22px)',
                opacity: fxIntensity,
              }}
            />
          )}
        </>
      )}

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

          {/* Dynamic Specular Sheen Beam */}
          <linearGradient id="mys-sheen-beam" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="38%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity={Math.min(1, Math.max(0.2, sheenOpacity * 1.15))} />
            <stop offset="62%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          <style>{`
            @keyframes sheenAnim-back {
              0% {
                transform: translateX(-160%) skewX(-25deg);
                opacity: 0;
              }
              ${Math.max(4, Math.round(sweepPercent * 0.2))}% {
                opacity: ${Number((sheenOpacity * fxIntensity).toFixed(3))};
              }
              ${Math.max(10, Math.round(sweepPercent * 0.55))}% {
                opacity: ${Number((sheenOpacity * fxIntensity).toFixed(3))};
              }
              ${Math.max(16, Math.round(sweepPercent * 0.88))}% {
                opacity: ${Number((sheenOpacity * fxIntensity * 0.5).toFixed(3))};
              }
              ${Math.max(20, sweepPercent)}% {
                transform: translateX(280%) skewX(-25deg);
                opacity: 0;
              }
              100% {
                transform: translateX(280%) skewX(-25deg);
                opacity: 0;
              }
            }
            .sheen-run-back {
              animation: sheenAnim-back ${totalSheenCycle}s ease-in-out infinite;
              mix-blend-mode: overlay;
              pointer-events: none;
            }
          `}</style>

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

        <g transform={visualOffsetY ? `translate(0, ${visualOffsetY})` : undefined}>
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
            <g
              transform={`translate(${cfg?.backSideLogoX ?? 160}, ${cfg?.backSideLogoY ?? 200}) scale(${(cfg?.backSideLogoScale ?? 100)/100}) translate(-160, -200)`}
              onClick={() => onSelectElement && onSelectElement('backLogo')}
              style={{ cursor: isStudio ? 'pointer' : 'default' }}
            >
              {/* Studio Selection Ring */}
              {isStudio && selectedElement === 'backLogo' && (
                <circle cx="160" cy="200" r="95" fill="rgba(56, 189, 248, 0.12)" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 4" />
              )}

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
            <g
              transform={`translate(${(cfg?.backSideTextX ?? 160) - 160}, ${(cfg?.backSideTextY ?? 315) - 315})`}
              onClick={() => onSelectElement && onSelectElement('backText')}
              style={{ cursor: isStudio ? 'pointer' : 'default' }}
            >
              {/* Studio Selection Box */}
              {isStudio && selectedElement === 'backText' && (
                <rect x="25" y="290" width="270" height="54" rx="6" fill="rgba(56, 189, 248, 0.12)" stroke="#38bdf8" strokeWidth="2" strokeDasharray="6 4" />
              )}

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

          {/* Surface Sheen Sweep */}
          {effectsOn && cfg?.fxSurfaceSheen !== false && (
            <rect
              x="-160"
              y="-100"
              width={sheenSize}
              height="700"
              fill="url(#mys-sheen-beam)"
              className="sheen-run-back"
              style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}
            />
          )}
        </g>

        {/* ── LAYER 4: Outer gold border (drawn last so it's on top) ── */}
        <use href="#mys-shape" fill="none" stroke="url(#mys-gold)" strokeWidth="5" />
        {/* Inner gold accent border */}
        <use href="#mys-shape" fill="none" stroke="rgba(254,240,138,0.2)" strokeWidth="2" />

        {/* Border FX: Perimeter Gleam Tracer */}
        {effectsOn && cfg?.fxBorderGleam && (
          <use
            href="#mys-shape"
            fill="none"
            stroke={cfg?.border1 || '#ffffff'}
            strokeWidth="3.5"
            className="spl-border-gleam-line"
            style={{
              '--border-gleam-color': cfg?.border2 || '#f59e0b',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        )}
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
    <div
      onClick={handleSkip}
      className="relative z-10 w-full h-full flex items-center justify-center select-none"
      style={{ cursor: flipped ? 'default' : 'pointer' }}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1200 }}
        className="flex items-center justify-center"
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
          className="flex items-center justify-center"
        >
          {/* ── BACK FACE (mystery card) ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <MysteryCardBack size="xl" centerVisual={true} />
          </div>

          {/* ── FRONT FACE (player card) — pre-rotated 180° so it starts hidden ── */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', width: CARD_W, height: CARD_H, display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
              <EFootballCard
                player={displayPlayer}
                size="xl"
                theme={cardTheme}
                highlight={false}
                centerVisual={true}
              />
            </div>
          </div>
        </motion.div>
      </motion.div>
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
              centerVisual={true}
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
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center p-2 flex-shrink-0 shadow-xl"
                    style={{
                      background: 'rgba(11, 15, 25, 0.75)',
                      backdropFilter: 'blur(12px)',
                      border: '1.5px solid rgba(255, 255, 255, 0.15)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    {leadingTeam.logoUrl ? (
                      <img 
                        src={leadingTeam.logoUrl} 
                        alt={leadingTeam.name} 
                        className="w-full h-full object-contain" 
                      />
                    ) : (
                      <Shield className="w-10 h-10" style={{ color: leadingTeam.primaryColor || '#38bdf8' }} />
                    )}
                  </div>
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
              centerVisual={true}
            />
            
            {/* EPIC SOLD STAMP */}
            <motion.div
               initial={{ scale: 4, opacity: 0, rotate: -6, x: '-50%', y: '-50%' }}
               animate={{ scale: 1, opacity: 1, rotate: -6, x: '-50%', y: '-50%' }}
               transition={{ type: 'spring', stiffness: 150, damping: 10, delay: 0.8 }}
               style={{
                 position: 'absolute',
                 top: '50%',
                 left: '50%',
                 transformOrigin: 'center center',
               }}
               className="pointer-events-none z-50 flex items-center justify-center"
            >
               <div 
                 className="w-[344px] h-[74px] bg-black/80 backdrop-blur-md border-y-[3.5px] border-red-600 flex items-center justify-center shadow-[0_0_20px_rgba(220,38,38,0.5),0_15px_35px_rgba(0,0,0,0.9)]"
               >
                 <span 
                   className="text-white font-black text-[66px] uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.9)] leading-none select-none text-center" 
                   style={{ 
                     fontFamily: 'var(--font-broadcast)',
                     letterSpacing: '0.2em',
                     marginRight: '-0.2em',
                   }}
                 >
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

// ── DYNAMIC CURSIVE SIGNATURE COMPONENT ─────────────────────────────
const DynamicSignature = ({ playerName = 'Player Signature' }) => {
  return (
    <div className="relative w-full h-full flex items-center justify-start overflow-hidden">
      {/* Animated Signature Ink Paths */}
      <svg 
        viewBox="0 0 380 75" 
        className="w-full h-full max-w-[340px]" 
        style={{ filter: 'drop-shadow(0 1px 2px rgba(15,23,42,0.15))' }}
      >
        {/* Main Initial Flourish Loop */}
        <motion.path
          d="M 20 58 C 25 18, 45 10, 62 16 C 78 22, 68 62, 42 55 C 24 50, 52 38, 85 42"
          fill="transparent"
          stroke="#0f172a"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.8, ease: "easeInOut", delay: 0.15 }}
        />
        {/* Cursive Name Flow */}
        <motion.path
          d="M 85 42 C 100 28, 115 28, 125 44 C 135 30, 148 30, 156 42 C 168 25, 182 22, 188 46 C 198 32, 210 32, 218 42 C 228 20, 242 16, 248 44"
          fill="transparent"
          stroke="#0f172a"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut", delay: 0.75 }}
        />
        {/* Confident Athletic Underline Swoosh & Flourish */}
        <motion.path
          d="M 248 44 Q 275 32 305 38 Q 335 30 360 22 M 30 65 Q 140 54 260 58 T 355 50"
          fill="transparent"
          stroke="#0f172a"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.9, ease: "easeInOut", delay: 1.4 }}
        />
        {/* Signature Accent Dot */}
        <motion.circle
          cx="365"
          cy="24"
          r="3"
          fill="#0f172a"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.2 }}
        />
      </svg>
    </div>
  );
};

// ── 5. SIGNING STAGE (OFFICIAL UNVEILING CEREMONY) ─────────────────────
const SigningStage = ({ stage = 'SIGNING', player, winningTeam, finalPrice, tournament, settings }) => {
  const [viewMode, setViewMode] = useState('pitch'); // 'pitch' by default
  const [squadFormat, setSquadFormat] = useState(() => storageService.getSquadFormat());
  const [teamSquad, setTeamSquad] = useState([]);

  const cardTheme = settings?.cardTheme || 'GOLD';
  const teamColor = winningTeam?.primaryColor || '#22c55e';

  // Sound fanfare on signing unveiling
  useEffect(() => {
    if (stage === 'SIGNING') {
      try {
        soundEngine.playRevealSound();
      } catch (e) {
        console.error('Audio play error:', e);
      }
    }
  }, [stage]);

  // Sync squad format live
  useEffect(() => {
    const handleFormatChange = () => {
      setSquadFormat(storageService.getSquadFormat());
    };
    window.addEventListener('squad-format-updated', handleFormatChange);
    window.addEventListener('storage', handleFormatChange);
    return () => {
      window.removeEventListener('squad-format-updated', handleFormatChange);
      window.removeEventListener('storage', handleFormatChange);
    };
  }, []);

  // Update card to proudly display the new club's crest
  const signingPlayer = useMemo(() => {
    if (!player) return null;
    return {
      ...player,
      clubLogo: winningTeam?.logoUrl || player?.clubLogo,
      teamId: winningTeam?.id || player?.teamId,
    };
  }, [player, winningTeam]);

  // Load squad for the winning team
  useEffect(() => {
    const allPlayers = storageService.getPlayers();
    if (winningTeam?.id) {
      const squad = allPlayers.filter(p => p.teamId === winningTeam.id);
      // Ensure the current signing player is included
      if (signingPlayer && !squad.some(p => p.id === signingPlayer.id)) {
        squad.push(signingPlayer);
      }
      setTeamSquad(squad);
    } else {
      setTeamSquad(signingPlayer ? [signingPlayer] : []);
    }
  }, [winningTeam?.id, signingPlayer]);

  // Default view: EA FC Mobile Tactical Pitch Squad with animated card slotting
  if (viewMode === 'pitch') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-slate-950">
        <TacticalPitchSquad
          stage={stage}
          team={winningTeam}
          squad={teamSquad}
          format={squadFormat}
          signingPlayer={signingPlayer}
          isSigningAnimation={true}
          finalPrice={finalPrice}
          tournament={tournament}
          onViewCertificate={() => setViewMode('certificate')}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center justify-center">
      {/* Floating Toggle to Switch back to Pitch */}
      <div className="absolute top-5 right-6 z-50">
        <button
          onClick={() => setViewMode('pitch')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 border border-emerald-400/60 text-emerald-300 text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer"
          style={{ fontFamily: 'var(--font-display)' }}
          title="Switch to Tactical Pitch Squad"
        >
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Tactical Squad Pitch</span>
        </button>
      </div>

      {/* ── 1. LUMINOUS WHITE & GOLDEN GLOWING GRADIENT (OPAQUE LUXURY BACKDROP) ── */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 30%, #ffffff 0%, #fffdf2 20%, #fef3c7 45%, #fde68a 70%, #f59e0b 95%, #d97706 100%)',
        }}
      />

      {/* ── 2. ROTATING CELEBRATORY SUNBURST LIGHT RAYS (DYNAMIC STAGE SPOTLIGHTS) ── */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        className="absolute w-[1800px] h-[1800px] -top-[450px] -left-[450px] pointer-events-none z-0 opacity-20 mix-blend-overlay"
        style={{
          background: 'repeating-conic-gradient(from 0deg, rgba(255,255,255,0.8) 0deg 15deg, transparent 15deg 30deg)'
        }}
      />

      {/* ── 3. MASSIVE TEAM WATERMARK IN GOLDEN GLOW ── */}
      {winningTeam?.logoUrl && (
        <div className="absolute right-[-8%] top-1/2 -translate-y-1/2 opacity-[0.12] pointer-events-none z-0">
          <motion.img 
            initial={{ scale: 0.8, rotate: -10, opacity: 0 }}
            animate={{ scale: 1.8, rotate: 5, opacity: 1 }}
            transition={{ duration: 2.2, ease: "easeOut" }}
            src={winningTeam.logoUrl} 
            className="w-[900px] h-[900px] object-contain blur-[1px]"
          />
        </div>
      )}

      {/* ── 4. PULSING TEAM AURA BLENDED INTO GOLDEN LIGHT ── */}
      <div 
        className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] blur-[180px] -z-0 rounded-full opacity-30 pointer-events-none"
        style={{ backgroundColor: teamColor }}
      />

      {/* ── 5. FLOATING GOLDEN EMBERS & SPARKLES ── */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ 
              x: ((i * 83) % 1400) - 700, 
              y: 400 + (i * 20), 
              opacity: 0, 
              scale: 0.6 
            }}
            animate={{ 
              y: -400 - (i * 20), 
              opacity: [0, 0.85, 0], 
              scale: [0.6, 1.3, 0.4] 
            }}
            transition={{ 
              duration: 3.5 + (i % 4) * 1.2, 
              repeat: Infinity, 
              delay: (i % 5) * 0.5,
              ease: "easeInOut" 
            }}
            className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full"
            style={{
              backgroundColor: '#fff',
              boxShadow: '0 0 12px #f59e0b, 0 0 20px #fbbf24'
            }}
          />
        ))}
      </div>

      {/* ── 6. MAIN PRESENTATION CONTENT ── */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center p-6 md:p-10 select-none">
        
        {/* TOP MARQUEE: WELCOME TO [CLUB NAME] */}
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6 flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center gap-2 px-5 py-1.5 rounded-full bg-white/80 border border-amber-300 shadow-md mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span 
              className="text-xs font-black uppercase tracking-[0.35em] text-amber-900" 
              style={{ fontFamily: 'var(--font-display)' }}
            >
              OFFICIAL SQUAD UNVEILING • SEASON {tournament?.season || '2026'}
            </span>
          </div>

          <h1 
            className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight text-slate-950 leading-none drop-shadow-sm text-center"
            style={{ fontFamily: 'var(--font-broadcast)' }}
          >
            <span>WELCOME TO </span>
            <span style={{ color: teamColor }}>{winningTeam?.name || 'NEW CLUB'}</span>
          </h1>
        </motion.div>

        {/* 2-COLUMN BROADCAST UNVEILING STAGE */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-14 xl:gap-20 w-full max-w-[1380px]">
          
          {/* LEFT: THE HERO CARD (PROUDLY WEARING NEW CREST) */}
          <motion.div
            initial={{ scale: 0.8, x: -50, opacity: 0 }}
            animate={{ scale: 1, x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 90, damping: 15 }}
            className="relative z-20 shrink-0 flex flex-col items-center"
          >
            {/* Card Glow */}
            <div 
              className="absolute -inset-6 rounded-3xl opacity-50 blur-2xl pointer-events-none -z-10"
              style={{ background: `radial-gradient(circle, ${teamColor} 0%, rgba(245,158,11,0.4) 60%, transparent 100%)` }}
            />

            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ filter: 'drop-shadow(0 25px 40px rgba(180, 83, 9, 0.35))' }}
            >
              <EFootballCard
                player={signingPlayer}
                size="xl"
                theme={cardTheme}
                highlight={true}
                centerVisual={true}
              />
            </motion.div>

            {/* GOLD MEDAL BASE SEAL */}
            <motion.div
              initial={{ scale: 1.8, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 140, damping: 12, delay: 0.4 }}
              className="mt-[-20px] relative z-30 flex items-center justify-center pointer-events-none"
            >
              <div className="px-6 py-2 rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 border-2 border-white shadow-[0_8px_25px_rgba(245,158,11,0.6)] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-950 inline-block" />
                <span 
                  className="text-slate-950 font-black text-sm md:text-base tracking-[0.2em] uppercase leading-none" 
                  style={{ fontFamily: 'var(--font-broadcast)' }}
                >
                  CONTRACT CERTIFIED • 2026
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT: THE OFFICIAL CONTRACT CERTIFICATE & SIGNING PAD */}
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 85, damping: 16, delay: 0.2 }}
            className="flex-1 w-full max-w-[620px] bg-white/85 backdrop-blur-2xl border border-white/90 rounded-[32px] p-7 md:p-8 shadow-[0_30px_70px_rgba(180,83,9,0.18),0_10px_25px_rgba(0,0,0,0.04)] flex flex-col gap-4 md:gap-5 relative overflow-hidden self-center"
          >
            {/* Ambient subtle warm corner glow */}
            <div 
              className="absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none"
              style={{ backgroundColor: teamColor }}
            />

            {/* Header: Club Crest & Verification */}
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-200/80">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 md:w-14 md:h-14 flex items-center justify-center shrink-0">
                  {winningTeam?.logoUrl ? (
                    <img 
                      src={winningTeam.logoUrl} 
                      alt={winningTeam.name} 
                      className="w-full h-full object-contain drop-shadow-md" 
                    />
                  ) : (
                    <Shield className="w-10 h-10 drop-shadow-md" style={{ color: teamColor }} />
                  )}
                </div>
                <div>
                  <div 
                    className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-slate-400 leading-none mb-1.5" 
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    OFFICIAL SQUAD SIGNING
                  </div>
                  <div 
                    className="text-2xl md:text-3xl font-black text-slate-950 uppercase leading-none" 
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {winningTeam?.name || 'FRANCHISE'}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span 
                    className="text-xs font-black uppercase tracking-widest text-emerald-800 leading-none" 
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    RATIFIED
                  </span>
                </div>
              </div>
            </div>

            {/* Player Identity & Roles */}
            <div>
              <div 
                className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.25em] mb-1 leading-none" 
                style={{ fontFamily: 'var(--font-display)' }}
              >
                REGISTERED SQUAD PLAYER
              </div>
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-950 uppercase tracking-tight leading-none mb-2.5" 
                style={{ fontFamily: 'var(--font-broadcast)' }}
              >
                {player.name}
              </h2>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span 
                  className="px-3 py-1 rounded-lg bg-slate-950 text-white text-xs font-black uppercase tracking-wider shadow-sm" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {player.position || 'ST'}
                </span>
                <span 
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {player.overallRating || 98} OVR
                </span>
                <span 
                  className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200/80 text-slate-800 text-xs font-extrabold uppercase tracking-wider" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {player.category || 'FORWARD'}
                </span>
              </div>
            </div>

            {/* Transfer Valuation & Terms (Broadcast Hero Grid) */}
            <div className="grid grid-cols-2 gap-5 py-4 border-y border-slate-200/80">
              <div className="flex flex-col justify-start">
                <div 
                  className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400 mb-1 leading-none" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  FINAL TRANSFER VALUATION
                </div>
                <div 
                  className="text-4xl md:text-5xl font-black text-slate-950 tracking-tight leading-none" 
                  style={{ fontFamily: 'var(--font-broadcast)' }}
                >
                  {formatCurrency(finalPrice, tournament?.currency)}
                </div>
              </div>

              <div className="border-l border-slate-200/80 pl-6 flex flex-col justify-start">
                <div 
                  className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-400 mb-1 leading-none" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  HEAD COACH
                </div>
                <div 
                  className="text-xl md:text-2xl font-black text-slate-950 uppercase tracking-tight leading-tight" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {winningTeam?.managerName || 'CLUB MANAGEMENT'}
                </div>
                <div 
                  className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1 leading-none" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {tournament?.season ? `SEASON ${tournament.season}` : '2026 CAMPAIGN'}
                </div>
              </div>
            </div>

            {/* AUTHENTIC AUTOGRAPH & RATIFICATION SEAL PAD */}
            <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/90 border border-slate-200/80 py-3 px-5 flex items-center justify-between gap-4 shadow-sm relative">
              <div className="flex-1 flex flex-col justify-center min-w-0">
                <div 
                  className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1 flex items-center gap-1.5 leading-none" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  OFFICIAL PLAYER AUTOGRAPH
                </div>

                <div className="h-13 md:h-15 w-full max-w-[300px] flex items-center">
                  <DynamicSignature playerName={player.name} />
                </div>

                <div 
                  className="text-[11px] font-bold text-slate-500 tracking-wide mt-1 truncate leading-none" 
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Ratified by <span className="font-black text-slate-900">{player.name}</span>
                </div>
              </div>

              {/* Gold Certified Medallion Seal */}
              <div className="shrink-0 flex flex-col items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 via-yellow-300 to-amber-600 p-0.5 shadow-md flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-white flex flex-col items-center justify-center p-1 border border-amber-300/60 text-center">
                    <Award className="w-4.5 h-4.5 text-amber-600" />
                    <span 
                      className="text-[7.5px] font-black tracking-widest text-amber-950 uppercase leading-none mt-0.5" 
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      OFFICIAL
                    </span>
                    <span 
                      className="text-[6.5px] font-extrabold tracking-wider text-slate-500 uppercase leading-none mt-0.5" 
                      style={{ fontFamily: 'var(--font-display)' }}
                    >
                      SEAL
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    </div>
  );
};

// ── 6. UNSOLD STAGE ─────────────────────────────────────────────────────
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
            centerVisual={true}
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
  players = [],
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
          <IdleStage tournament={tournament} settings={settings} />
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
        <motion.div
          key={`deal-showcase-${player.id}`}
          className="w-full h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <SigningStage
            stage={stage}
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
