import React, { useState, useEffect, useMemo, useRef } from 'react';
import { formatCurrency } from '../../utils/currency';
import { storageService } from '../../services/storageService';
import { CardStudioTransformOverlay } from './CardStudioTransformOverlay';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';

/**
 * Pro-Level EA FC 24 Ultimate Team Player Card Component
 * - Geometric shape with sharp corners and arched top
 * - Advanced CSS masks for player image pop-out and fade
 * - Professional typography and 2x3 stats grid
 */
export const EFootballCard = ({
  player,
  size = 'md',
  theme = 'GOLD', // GOLD | SILVER | ICON | PINK | DARK
  onClick,
  showPrice = false,
  highlight = false,
  disableShadow = false,
  disableBackdrop = false,
  customThemeOverride = null,
  isStudio = false,
  selectedElement = null,
  onSelectElement = null,
  onUpdateTheme = null,
  onCommitHistory = null,
  centerVisual = false,
}) => {
  if (!player) return null;

  // Extract per-player photo alignment properties
  const photoScale = player.photoScale !== undefined ? parseFloat(player.photoScale) : ((player.photoZoom || 100) / 100);
  const photoOffsetX = player.photoOffsetX !== undefined ? parseInt(player.photoOffsetX, 10) : 0;
  const photoOffsetY = player.photoOffsetY !== undefined ? parseInt(player.photoOffsetY, 10) : 0;

  const heroImage = player.presentationPng || player.photoUrl || player.photo || (player.name ? createRealisticPlayerPortrait(player.name, player.position) : null);
  const ovr = player.overallRating || player.rating || player.ovr || (player.stats ? Math.round(Object.values(player.stats).reduce((a,b)=>a+b,0)/Object.values(player.stats).length) : 98);
  const position = (player.position || 'RW').toUpperCase();
  const name = player.name || 'PLAYER';
  
  // Stats (Using fallbacks if not provided)
  const stats = player.stats || { pac: 97, sho: 95, pas: 98, dri: 98, def: 33, phy: 81 };
  
  // Logos
  const countryFlag = player.countryFlag || '/assets/flag.png';
  const clubLogo = player.clubLogo || '/assets/logo.png';
  const isDefaultLogo = !player.clubLogo || player.clubLogo === '/assets/logo.png';

  const isGK = position === 'GK';
  const effectiveTheme = theme;

  // Scale map
  const scaleMap = { pitch: 0.52, xs: 0.45, sm: 0.65, md: 0.85, lg: 1.1, xl: 1.35 };
  const scale = typeof size === 'number' ? size : (scaleMap[size] || scaleMap.md);
  const cardWidth = 320 * scale;
  const cardHeight = 440 * scale;

  const [customTheme, setCustomTheme] = useState(() => storageService.getCardTheme());
  const [gkCustomTheme, setGkCustomTheme] = useState(() => storageService.getGkCardTheme());
  const svgRef = useRef(null);

  useEffect(() => {
    const handleUpdate = () => {
      setCustomTheme(storageService.getCardTheme());
      setGkCustomTheme(storageService.getGkCardTheme());
    };
    window.addEventListener('card-theme-updated', handleUpdate);
    return () => window.removeEventListener('card-theme-updated', handleUpdate);
  }, []);

  const defaultThemeForPlayer = isGK ? gkCustomTheme : customTheme;
  const activeCustomTheme = customThemeOverride || defaultThemeForPlayer;

  // Theme configuration matching EA FC 24 reference cards
  const themeConfig = {
    GOLD: activeCustomTheme, // Customizable theme (Outfield or GK)
    SILVER: {
      bgGrad1: '#ffffff', bgGrad2: '#cbd5e1', bgGrad3: '#94a3b8', bgGrad4: '#1e293b',
      border1: '#ffffff', border2: '#e2e8f0', border3: '#334155',
      textDark: '#0f172a',
      textLight: '#ffffff',
      accent: '#fff',
    },
    ICON: {
      bgGrad1: '#ffffff', bgGrad2: '#f4ebd0', bgGrad3: '#dcd0a8', bgGrad4: '#4d401a',
      border1: '#ffffff', border2: '#f4ebd0', border3: '#4d401a',
      textDark: '#1a1a1a',
      textLight: '#ffffff',
      accent: '#d4af37',
    },
    PINK: {
      bgGrad1: '#ffb3e6', bgGrad2: '#ff33bb', bgGrad3: '#b30077', bgGrad4: '#330022',
      border1: '#ffcceb', border2: '#ff80d5', border3: '#4d002e',
      textDark: '#ffffff',
      textLight: '#ffffff',
      accent: '#ffb3e6',
    },
    DARK: {
      bgGrad1: '#38bdf8', bgGrad2: '#0ea5e9', bgGrad3: '#0f172a', bgGrad4: '#020617',
      border1: '#7dd3fc', border2: '#38bdf8', border3: '#0f172a',
      textDark: '#ffffff',
      textLight: '#ffffff',
      accent: '#38bdf8',
    },
  };
  const cfg = {
    ...activeCustomTheme,
    ...(effectiveTheme !== 'GOLD' && themeConfig[effectiveTheme] ? themeConfig[effectiveTheme] : {})
  };

  const rayColor1 = cfg.border2 || '#f59e0b';
  const rayColor2 = cfg.border1 || '#fbbf24';
  const fxIntensity = (cfg.fxIntensity ?? 100) / 100;
  const effectsOn = cfg.enableEffects !== false;

  // Granular Sheen & Glint Animation Parameters (Speed, Size, Opacity, Lag)
  const sheenSpeed = cfg.fxSheenSpeed !== undefined ? Number(cfg.fxSheenSpeed) : 3.5;
  const sheenLag = cfg.fxSheenLag !== undefined ? Number(cfg.fxSheenLag) : 1.5;
  const sheenSize = cfg.fxSheenSize !== undefined ? Number(cfg.fxSheenSize) : 220;
  const sheenOpacity = (cfg.fxSheenOpacity !== undefined ? Number(cfg.fxSheenOpacity) : 85) / 100;
  const totalSheenCycle = Math.max(0.8, Number((sheenSpeed + sheenLag).toFixed(2)));
  const sweepPercent = Math.min(99, Math.max(15, Math.round((sheenSpeed / totalSheenCycle) * 100)));

  const glintSpeed = cfg.fxGlintSpeed !== undefined ? Number(cfg.fxGlintSpeed) : 2.6;
  const glintLag = cfg.fxGlintLag !== undefined ? Number(cfg.fxGlintLag) : 1.2;
  const glintScale = (cfg.fxGlintSize !== undefined ? Number(cfg.fxGlintSize) : 100) / 100;
  const glintOpacity = (cfg.fxGlintOpacity !== undefined ? Number(cfg.fxGlintOpacity) : 90) / 100;
  const totalGlintCycle = Math.max(1.0, Number((glintSpeed + glintLag).toFixed(2)));
  const glintActivePercent = Math.min(95, Math.max(20, Math.round((glintSpeed / totalGlintCycle) * 100)));

  const idSuffix = useMemo(() => `${player.id || 'p'}-${isGK ? 'gk' : 'out'}-${effectiveTheme}-${Math.floor(Math.random()*1000)}`, [player.id, isGK, effectiveTheme]);

  // Card Shapes
  let cardPath = "M 80 15 Q 160 5 240 15 L 305 55 L 305 345 L 160 405 L 15 345 L 15 55 Z"; // Default eafc24
  let photoClipPath = "M 160 425 L 15 335 L 15 55 L 80 15 L 80 -100 L 240 -100 L 240 15 L 305 55 L 305 335 Z";
  
  if (cfg.cardShape === 'shield') {
    cardPath = "M 15 15 L 305 15 L 305 280 Q 160 440 15 280 Z";
    photoClipPath = "M 160 460 L 15 300 L 15 15 L 15 -100 L 305 -100 L 305 15 L 305 300 Z";
  } else if (cfg.cardShape === 'classic') {
    cardPath = "M 35 15 L 285 15 Q 305 15 305 35 L 305 385 Q 305 405 285 405 L 35 405 Q 15 405 15 385 L 15 35 Q 15 15 35 15 Z";
    photoClipPath = "M 15 405 Q 15 425 35 425 L 285 425 Q 305 425 305 405 L 305 -100 L 15 -100 Z";
  } else if (cfg.cardShape === 'notched') {
    cardPath = "M 45 15 L 275 15 L 305 45 L 305 375 L 275 405 L 45 405 L 15 375 L 15 45 Z";
    photoClipPath = "M 15 375 L 15 45 L 45 15 L 45 -100 L 275 -100 L 275 15 L 305 45 L 305 375 L 275 405 L 45 405 Z";
  } else if (cfg.cardShape === 'hex') {
    cardPath = "M 160 15 L 305 80 L 270 380 L 160 415 L 50 380 L 15 80 Z";
    photoClipPath = "M 160 415 L 50 380 L 15 80 L 15 -100 L 305 -100 L 305 80 L 270 380 Z";
  } else if (cfg.cardShape === 'cyber') {
    cardPath = "M 60 15 L 260 15 L 305 60 L 305 340 L 160 415 L 15 340 L 15 60 Z";
    photoClipPath = "M 160 415 L 15 340 L 15 60 L 60 15 L 60 -100 L 260 -100 L 260 15 L 305 60 L 305 340 Z";
  }

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
  const visualOffsetY = centerVisual ? getCardShapeOffsetY(cfg.cardShape) : 0;

  return (
    <div
      onClick={onClick}
      className={`relative select-none transition-transform duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      style={{
        width: cardWidth,
        height: cardHeight,
        filter: disableShadow ? 'none' : 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.7)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
      }}
    >
      {/* ── REAL CARD VISUAL EFFECTS (Backdrop rays, particles & pulse) ── */}
      {effectsOn && !disableBackdrop && (
        <>
          {cfg.fxBgRays !== false && (
            <div
              className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center overflow-visible"
              style={{ transform: 'scale(1.35)' }}
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

          {cfg.fxBgParticles !== false && (
            <div className="absolute inset-0 pointer-events-none -z-10 overflow-visible" style={{ opacity: fxIntensity }}>
              <div className="spl-particle-1 absolute" style={{ bottom: '15%', left: '15%', width: 6, height: 6, borderRadius: '50%', background: '#fff', boxShadow: `0 0 8px ${rayColor1}, 0 0 16px ${rayColor2}` }} />
              <div className="spl-particle-2 absolute" style={{ bottom: '8%', right: '20%', width: 8, height: 8, borderRadius: '50%', background: '#fff', boxShadow: `0 0 10px ${rayColor2}, 0 0 20px #ffffff` }} />
              <div className="spl-particle-3 absolute" style={{ bottom: '25%', left: '48%', width: 5, height: 5, borderRadius: '50%', background: '#fff', boxShadow: `0 0 8px ${rayColor1}, 0 0 14px ${rayColor2}` }} />
            </div>
          )}

          {cfg.fxBgPulse !== false && (
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
        ref={svgRef}
        viewBox="0 0 1280 1760"
        width={cardWidth}
        height={cardHeight}
        className="w-full h-full overflow-visible"
      >
        <g transform={`scale(4)${visualOffsetY ? ` translate(0, ${visualOffsetY})` : ''}`}>
        <defs>
          <path id={`card-shape-${idSuffix}`} d={cardPath} />

          {/* Background Gradient */}
          <linearGradient id={`card-bg-grad-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.bgGrad1} />
            <stop offset="25%" stopColor={cfg.bgGrad2} />
            <stop offset="60%" stopColor={cfg.bgGrad3} />
            <stop offset="100%" stopColor={cfg.bgGrad4} />
          </linearGradient>

          {/* Border Metallic Gradient */}
          <linearGradient id={`card-border-grad-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.border1} />
            <stop offset="40%" stopColor={cfg.border2} />
            <stop offset="100%" stopColor={cfg.border3} />
          </linearGradient>

          {/* Light flare for metallic shine */}
          <radialGradient id={`flare-${idSuffix}`} cx="30%" cy="20%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Dynamic Specular Sheen Beam */}
          <linearGradient id={`sheen-beam-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="38%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity={Math.min(1, Math.max(0.2, sheenOpacity * 1.15))} />
            <stop offset="62%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* Dynamic keyframes for Sheen & Glints (Custom Speed, Size, Opacity, and Lag) */}
          <style>{`
            @keyframes sheenAnim-${idSuffix} {
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
            .sheen-run-${idSuffix} {
              animation: sheenAnim-${idSuffix} ${totalSheenCycle}s ease-in-out infinite;
              mix-blend-mode: overlay;
              pointer-events: none;
            }
            @keyframes glintStar1-${idSuffix} {
              0% {
                opacity: 0.1;
                transform: scale(${0.5 * glintScale}) rotate(0deg);
              }
              ${Math.round(glintActivePercent * 0.5)}% {
                opacity: ${Number((glintOpacity * fxIntensity).toFixed(3))};
                transform: scale(${1.3 * glintScale}) rotate(90deg);
                filter: drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
              }
              ${glintActivePercent}% {
                opacity: 0;
                transform: scale(${0.4 * glintScale}) rotate(180deg);
              }
              100% {
                opacity: 0;
                transform: scale(${0.4 * glintScale}) rotate(180deg);
              }
            }
            .glint-run1-${idSuffix} {
              animation: glintStar1-${idSuffix} ${totalGlintCycle}s ease-in-out infinite;
              transform-origin: center center;
            }
            @keyframes glintStar2-${idSuffix} {
              0% {
                opacity: 0;
                transform: scale(${0.4 * glintScale}) rotate(0deg);
              }
              ${Math.round(glintActivePercent * 0.3)}% {
                opacity: 0;
                transform: scale(${0.4 * glintScale}) rotate(0deg);
              }
              ${Math.round(glintActivePercent * 0.7)}% {
                opacity: ${Number((glintOpacity * fxIntensity).toFixed(3))};
                transform: scale(${1.25 * glintScale}) rotate(90deg);
                filter: drop-shadow(0 0 6px #ffffff) drop-shadow(0 0 12px rgba(255, 255, 255, 0.8));
              }
              ${glintActivePercent}% {
                opacity: 0;
                transform: scale(${0.4 * glintScale}) rotate(180deg);
              }
              100% {
                opacity: 0;
                transform: scale(${0.4 * glintScale}) rotate(180deg);
              }
            }
            .glint-run2-${idSuffix} {
              animation: glintStar2-${idSuffix} ${totalGlintCycle}s ease-in-out infinite;
              transform-origin: center center;
            }
          `}</style>

          {/* Rainbow Holographic Foil */}
          <linearGradient id={`holo-foil-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff0080" stopOpacity="0.25" />
            <stop offset="25%" stopColor="#7928ca" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#0070f3" stopOpacity="0.25" />
            <stop offset="75%" stopColor="#00dfd8" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ff4d4d" stopOpacity="0.25" />
          </linearGradient>

          {/* Geometric Texture (Subtle triangles) */}
          <pattern id={`texture-geometric-${idSuffix}`} width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <polygon points="30,0 60,30 30,60 0,30" fill="rgba(255,255,255,0.03)" />
            <polygon points="15,15 45,15 30,45" fill="rgba(0,0,0,0.02)" />
          </pattern>

          {/* Hexagon texture (Modern) */}
          <pattern id={`texture-modern-${idSuffix}`} width="28" height="48" patternUnits="userSpaceOnUse" patternTransform="scale(0.8)">
            <path d="M14 0 L28 8 L28 24 L14 32 L0 24 L0 8 Z M14 48 L28 40 L28 24 L14 32 L0 24 L0 40 Z" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
          </pattern>

          {/* Waves (Organic) */}
          <pattern id={`texture-organic-${idSuffix}`} width="100" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(15)">
            <path d="M0 20 Q25 0 50 20 T100 20" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          </pattern>

          {/* Circuit Board (Circuit) */}
          <pattern id={`texture-circuit-${idSuffix}`} width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M10 10 L30 10 L40 20 L40 50 M20 30 L50 30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="40" cy="20" r="2" fill="rgba(255,255,255,0.15)" />
            <circle cx="20" cy="30" r="2" fill="rgba(255,255,255,0.15)" />
          </pattern>

          {/* Carbon Fiber (Carbon) */}
          <pattern id={`texture-carbon-${idSuffix}`} width="8" height="8" patternUnits="userSpaceOnUse">
            <rect width="4" height="4" fill="rgba(255,255,255,0.03)" />
            <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.03)" />
            <path d="M0 0 L4 4 M4 0 L0 4 M4 4 L8 8 M8 4 L4 8" stroke="rgba(0,0,0,0.1)" strokeWidth="0.5" />
          </pattern>

          {/* Halftone Dots (Halftone) */}
          <pattern id={`texture-halftone-${idSuffix}`} width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <circle cx="4" cy="4" r="1.5" fill="rgba(255,255,255,0.08)" />
            <circle cx="12" cy="12" r="3" fill="rgba(255,255,255,0.08)" />
          </pattern>

          {/* Topo Map (Topo) */}
          <pattern id={`texture-topo-${idSuffix}`} width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M0 50 Q25 25 50 50 T100 50 M0 70 Q25 45 50 70 T100 70 M0 30 Q25 5 50 30 T100 30" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
            <path d="M30 0 Q55 25 30 50 T30 100" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
          </pattern>

          {/* Inner Clip Path */}
          <clipPath id={`card-clip-${idSuffix}`}>
            <use href={`#card-shape-${idSuffix}`} />
          </clipPath>

          {/* Photo Clip Path */}
          <clipPath id={`photo-clip-${idSuffix}`}>
            <path d={photoClipPath} />
          </clipPath>


          {/* Alpha mask for player photo (fades smoothly at the bottom) */}
          <linearGradient id={`photo-fade-${idSuffix}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset={`${cfg.layoutImageFadeY ?? 55}%`} stopColor="#ffffff" stopOpacity="1" />
            <stop offset={`${Math.min((cfg.layoutImageFadeY ?? 55) + 30, 100)}%`} stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id={`photo-mask-${idSuffix}`}>
            <rect 
              x={cfg.layoutImageX ?? 0} 
              y={cfg.layoutImageY ?? -10} 
              width={cfg.layoutImageW ?? 320} 
              height={cfg.layoutImageH ?? 320} 
              fill={`url(#photo-fade-${idSuffix})`} 
            />
          </mask>
        </defs>

        {/* 1. Base Card Shape Fill */}
        <use href={`#card-shape-${idSuffix}`} fill={`url(#card-bg-grad-${idSuffix})`} />
        
        {/* 2. Textures based on Design Template */}
        {(cfg?.frontSideDesign === 'geometric' || !cfg?.frontSideDesign) && (
          <use href={`#card-shape-${idSuffix}`} fill={`url(#texture-geometric-${idSuffix})`} />
        )}
        {cfg?.frontSideDesign === 'modern' && (
          <use href={`#card-shape-${idSuffix}`} fill={`url(#texture-modern-${idSuffix})`} />
        )}
        {cfg?.frontSideDesign === 'organic' && (
          <use href={`#card-shape-${idSuffix}`} fill={`url(#texture-organic-${idSuffix})`} />
        )}
        {cfg?.frontSideDesign === 'circuit' && (
          <use href={`#card-shape-${idSuffix}`} fill={`url(#texture-circuit-${idSuffix})`} />
        )}
        {cfg?.frontSideDesign === 'carbon' && (
          <use href={`#card-shape-${idSuffix}`} fill={`url(#texture-carbon-${idSuffix})`} />
        )}
        {cfg?.frontSideDesign === 'halftone' && (
          <use href={`#card-shape-${idSuffix}`} fill={`url(#texture-halftone-${idSuffix})`} />
        )}
        {cfg?.frontSideDesign === 'topo' && (
          <use href={`#card-shape-${idSuffix}`} fill={`url(#texture-topo-${idSuffix})`} />
        )}
        {/* 'minimal' has no internal texture */}

        {/* 3. Outer Border */}
        <use href={`#card-shape-${idSuffix}`} fill="none" stroke={`url(#card-border-grad-${idSuffix})`} strokeWidth="4" />
        
        {/* 4. Metallic Light Flare Overlay */}
        <use href={`#card-shape-${idSuffix}`} fill={`url(#flare-${idSuffix})`} style={{ mixBlendMode: 'overlay' }} />

        {/* PLAYER PHOTO (Using pure SVG mask, protected by 4x global scale) */}
        <g clipPath={`url(#card-clip-${idSuffix})`} mask={`url(#photo-mask-${idSuffix})`}>
          {/* Global Image Area Offset */}
          <g transform={`translate(${cfg.layoutImageX ?? 0}, ${cfg.layoutImageY ?? -10})`}>
            {/* Per-Player Image Alignment & Scale + Visual Effects */}
            <g
              className={`
                ${effectsOn && cfg.fxPlayerParallax !== false ? 'spl-player-parallax' : ''}
                ${effectsOn && cfg.fxPlayerGlow !== false ? 'spl-player-rim-glow' : ''}
                ${effectsOn && cfg.fxPlayerHolo ? 'spl-player-holo' : ''}
              `.trim()}
              style={{ '--player-glow-color': cfg.border2 || '#f59e0b' }}
              transform={`translate(${(cfg.layoutImageW ?? 320) / 2}, ${(cfg.layoutImageH ?? 320) / 2}) scale(${photoScale}) translate(-${(cfg.layoutImageW ?? 320) / 2}, -${(cfg.layoutImageH ?? 320) / 2}) translate(${photoOffsetX}, ${photoOffsetY})`}
            >
              {heroImage ? (
                <image
                  href={heroImage}
                  x="0"
                  y="0"
                  width={cfg.layoutImageW ?? 320}
                  height={cfg.layoutImageH ?? 320}
                  preserveAspectRatio="xMidYMin slice"
                />
              ) : (
                <g opacity="0.3">
                  <circle cx={(cfg.layoutImageW ?? 320) / 2} cy={(cfg.layoutImageH ?? 320) / 2} r={(cfg.layoutImageW ?? 320) * 0.2} fill={cfg.textDark} />
                  <path d={`M${(cfg.layoutImageW ?? 320) * 0.2} ${(cfg.layoutImageH ?? 320) * 0.9} Q ${(cfg.layoutImageW ?? 320) / 2} ${(cfg.layoutImageH ?? 320) * 0.4} ${(cfg.layoutImageW ?? 320) * 0.8} ${(cfg.layoutImageH ?? 320) * 0.9} Z`} fill={cfg.textDark} />
                </g>
              )}
            </g>
          </g>
        </g>

        {/* ── CARD SURFACE & TOP EFFECTS ── */}
        {effectsOn && (
          <g clipPath={`url(#card-clip-${idSuffix})`}>
            {/* Diagonal Glass Sheen Sweep */}
            {cfg.fxSurfaceSheen !== false && (
              <rect
                x="-160"
                y="-100"
                width={sheenSize}
                height="700"
                fill={`url(#sheen-beam-${idSuffix})`}
                className={`sheen-run-${idSuffix}`}
                style={{ pointerEvents: 'none', mixBlendMode: 'overlay' }}
              />
            )}

            {/* Holographic Rainbow Foil */}
            {cfg.fxHoloFoil && (
              <use
                href={`#card-shape-${idSuffix}`}
                fill={`url(#holo-foil-${idSuffix})`}
                style={{ pointerEvents: 'none', mixBlendMode: 'color-dodge', opacity: fxIntensity * 0.7 }}
              />
            )}

            {/* Diamond Glint Stars */}
            {cfg.fxGlintStars !== false && (
              <g style={{ pointerEvents: 'none' }}>
                <g transform="translate(265, 55)" className={`glint-run1-${idSuffix}`}>
                  <path d="M 0 -8 Q 0 0 8 0 Q 0 0 0 8 Q 0 0 -8 0 Q 0 0 0 -8 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                </g>
                <g transform="translate(55, 340)" className={`glint-run2-${idSuffix}`}>
                  <path d="M 0 -7 Q 0 0 7 0 Q 0 0 0 7 Q 0 0 -7 0 Q 0 0 0 7 Z" fill="#ffffff" />
                  <circle cx="0" cy="0" r="2" fill="#ffffff" />
                </g>
              </g>
            )}
          </g>
        )}

        {/* Content Clipped to Card */}
        <g clipPath={`url(#card-clip-${idSuffix})`}>
          
          {/* Header Lines / Inner Accents (Removed per user request) */}
          {/* STATS BACKGROUND GRADIENT (Darkens bottom half for text legibility) */}
          <rect x="0" y={(cfg.layoutShadowY ?? 220) + 20} width="320" height="200" fill={`url(#photo-fade-darken-${idSuffix})`} opacity="0" />
          <linearGradient id={`photo-fade-darken-${idSuffix}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="40%" stopColor="#000000" stopOpacity={(cfg.layoutShadowOpacity ?? 60) * 0.5 / 100} />
            <stop offset="100%" stopColor="#000000" stopOpacity={(cfg.layoutShadowOpacity ?? 60) / 100} />
          </linearGradient>
          <rect x="0" y={cfg.layoutShadowY ?? 220} width="320" height={Math.max(10, 440 - (cfg.layoutShadowY ?? 220))} fill={`url(#photo-fade-darken-${idSuffix})`} />

          {/* RATING & POSITION */}
          {(cfg.showRating !== false || cfg.showLogos !== false) && (
            <g transform={`translate(${cfg.layoutRatingX ?? 55}, ${cfg.layoutRatingY ?? 90})`}>
              {cfg.showRating !== false && (
                <>
                  <text 
                    x="0" 
                    y="0" 
                    fontFamily="var(--font-broadcast), 'Bebas Neue', Impact, sans-serif" 
                    fontSize={cfg.layoutRatingSize ?? 52} 
                    fontWeight="bold" 
                    fill={cfg.textDark} 
                    textAnchor="middle" 
                    style={{ letterSpacing: '0px' }}
                  >
                    {ovr}
                  </text>
                  <text 
                    x={cfg.layoutPositionX ?? 0} 
                    y={cfg.layoutPositionGapY ?? 25} 
                    fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" 
                    fontSize={cfg.layoutPositionSize ?? 18} 
                    fontWeight="800" 
                    fill={cfg.textDark} 
                    textAnchor="middle" 
                    style={{ letterSpacing: '0px' }}
                  >
                    {position}
                  </text>
                </>
              )}
              
              {/* Country and Club logos */}
              {cfg.showLogos !== false && (() => {
                const scaleRatio = (cfg.layoutLogoScale ?? 100) / 100;
                const flagW = (cfg.layoutFlagWidth ?? 36) * scaleRatio;
                const flagH = (cfg.layoutFlagHeight ?? 24) * scaleRatio;
                const clubSize = (cfg.layoutClubLogoSize ?? 28) * scaleRatio;
                const positionY = cfg.showRating !== false ? (cfg.layoutPositionGapY ?? 25) : 0;
                const logosStartY = positionY + (cfg.layoutLogosGapY ?? 15);
                const clubLogoY = logosStartY + flagH + (cfg.layoutClubLogoGapY ?? 8);
                const logosX = cfg.layoutLogosX ?? 0;

                return (
                  <g>
                    <image 
                      href={countryFlag} 
                      x={logosX - (flagW / 2)} 
                      y={logosStartY} 
                      width={flagW} 
                      height={flagH} 
                      preserveAspectRatio="xMidYMid meet" 
                    />
                    <image 
                      href={clubLogo} 
                      x={logosX - (clubSize / 2)} 
                      y={clubLogoY} 
                      width={clubSize} 
                      height={clubSize} 
                      preserveAspectRatio="xMidYMid meet" 
                      style={{ filter: isDefaultLogo ? 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' : 'none' }} 
                    />
                    {isDefaultLogo && (
                      <text 
                        x={logosX} 
                        y={clubLogoY + (clubSize * 0.6)} 
                        fontFamily="var(--font-display), 'Arial Black', sans-serif" 
                        fontSize={Math.max(4, clubSize * 0.23)} 
                        fontWeight="900" 
                        fill="#ffffff" 
                        textAnchor="middle" 
                        style={{ letterSpacing: '0.5px', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }}
                      >
                        SPL
                      </text>
                    )}
                  </g>
                );
              })()}
            </g>
          )}

          {/* PLAYER NAME */}
          {cfg.showName !== false && (
            <text 
              x={cfg.layoutNameX ?? 160} 
              y={cfg.layoutNameY ?? 280} 
              fontFamily="var(--font-broadcast), 'Bebas Neue', Impact, sans-serif" 
              fontSize={name.length > 12 ? Math.max((cfg.layoutNameFontSize ?? 40) - 6, 24) : (cfg.layoutNameFontSize ?? 40)} 
              fontWeight="bold" 
              fill={cfg.textDark} 
              textAnchor="middle" 
              style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
            >
              {name}
            </text>
          )}
          
          {cfg.showStats !== false && (
            <>
              <line 
                x1={(cfg.layoutNameX ?? 160) - 100} 
                y1={(cfg.layoutNameY ?? 280) + 10} 
                x2={(cfg.layoutNameX ?? 160) + 100} 
                y2={(cfg.layoutNameY ?? 280) + 10} 
                stroke={cfg.border2} 
                strokeWidth="1" 
                strokeOpacity="0.5" 
              />

              {/* STATS GRID (2 columns, 3 rows) — Automatic Outfield vs Goalkeeper labels */}
              {(() => {
                const s = {
                  l1Val: isGK ? (stats.div ?? stats.pac ?? 85) : (stats.pac ?? 80),
                  l1Lbl: isGK ? 'DIV' : 'PAC',
                  l2Val: isGK ? (stats.han ?? stats.sho ?? 84) : (stats.sho ?? 80),
                  l2Lbl: isGK ? 'HAN' : 'SHO',
                  l3Val: isGK ? (stats.kic ?? stats.pas ?? 82) : (stats.pas ?? 80),
                  l3Lbl: isGK ? 'KIC' : 'PAS',
                  r1Val: isGK ? (stats.ref ?? stats.dri ?? 88) : (stats.dri ?? 80),
                  r1Lbl: isGK ? 'REF' : 'DRI',
                  r2Val: isGK ? (stats.spd ?? stats.def ?? 55) : (stats.def ?? 80),
                  r2Lbl: isGK ? 'SPD' : 'DEF',
                  r3Val: isGK ? (stats.pos ?? stats.phy ?? 87) : (stats.phy ?? 80),
                  r3Lbl: isGK ? 'POS' : 'PHY',
                };

                return (
                  <g transform={`translate(${cfg.layoutStatsX ?? 160}, ${cfg.layoutStatsY ?? 315})`}>
                    {/* Left Column */}
                    <g transform={`translate(-${cfg.layoutStatsGapX ?? 40}, 0)`}>
                      <text x="-5" y="0" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatNumSize ?? 18} fontWeight="800" fill={cfg.textDark} textAnchor="end">{s.l1Val}</text>
                      <text x="5" y="0" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatLabelSize ?? 18} fontWeight="400" fill={cfg.textDark} textAnchor="start">{s.l1Lbl}</text>
                      
                      <text x="-5" y={cfg.layoutStatsGapY ?? 30} fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatNumSize ?? 18} fontWeight="800" fill={cfg.textDark} textAnchor="end">{s.l2Val}</text>
                      <text x="5" y={cfg.layoutStatsGapY ?? 30} fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatLabelSize ?? 18} fontWeight="400" fill={cfg.textDark} textAnchor="start">{s.l2Lbl}</text>
                      
                      <text x="-5" y={(cfg.layoutStatsGapY ?? 30) * 2} fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatNumSize ?? 18} fontWeight="800" fill={cfg.textDark} textAnchor="end">{s.l3Val}</text>
                      <text x="5" y={(cfg.layoutStatsGapY ?? 30) * 2} fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatLabelSize ?? 18} fontWeight="400" fill={cfg.textDark} textAnchor="start">{s.l3Lbl}</text>
                    </g>
                    
                    {/* Center Divider */}
                    <line x1="0" y1="-15" x2="0" y2={((cfg.layoutStatsGapY ?? 30) * 2) + 5} stroke={cfg.border2} strokeWidth="1" strokeOpacity="0.5" />

                    {/* Right Column */}
                    <g transform={`translate(${cfg.layoutStatsGapX ?? 40}, 0)`}>
                      <text x="-5" y="0" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatNumSize ?? 18} fontWeight="800" fill={cfg.textDark} textAnchor="end">{s.r1Val}</text>
                      <text x="5" y="0" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatLabelSize ?? 18} fontWeight="400" fill={cfg.textDark} textAnchor="start">{s.r1Lbl}</text>
                      
                      <text x="-5" y={cfg.layoutStatsGapY ?? 30} fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatNumSize ?? 18} fontWeight="800" fill={cfg.textDark} textAnchor="end">{s.r2Val}</text>
                      <text x="5" y={cfg.layoutStatsGapY ?? 30} fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatLabelSize ?? 18} fontWeight="400" fill={cfg.textDark} textAnchor="start">{s.r2Lbl}</text>
                      
                      <text x="-5" y={(cfg.layoutStatsGapY ?? 30) * 2} fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatNumSize ?? 18} fontWeight="800" fill={cfg.textDark} textAnchor="end">{s.r3Val}</text>
                      <text x="5" y={(cfg.layoutStatsGapY ?? 30) * 2} fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize={cfg.layoutStatLabelSize ?? 18} fontWeight="400" fill={cfg.textDark} textAnchor="start">{s.r3Lbl}</text>
                    </g>
                  </g>
                );
              })()}
            </>
          )}
        </g>

        {/* Border FX: Perimeter Gleam Tracer */}
        {effectsOn && cfg.fxBorderGleam !== false && (
          <use
            href={`#card-shape-${idSuffix}`}
            fill="none"
            stroke={cfg.border1 || '#ffffff'}
            strokeWidth="3.5"
            className="spl-border-gleam-line"
            style={{
              '--border-gleam-color': cfg.border2 || '#f59e0b',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Border FX: Pulsing Neon Edge */}
        {effectsOn && cfg.fxBorderPulse && (
          <use
            href={`#card-shape-${idSuffix}`}
            fill="none"
            stroke={cfg.border2 || '#38bdf8'}
            strokeWidth="4"
            className="spl-border-pulse"
            style={{
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Canva & Photoshop-style interactive transform layer in studio mode */}
        {isStudio && (
          <CardStudioTransformOverlay
            cfg={cfg}
            player={player}
            svgRef={svgRef}
            selectedElement={selectedElement}
            onSelectElement={onSelectElement}
            onUpdateTheme={onUpdateTheme}
            onCommitHistory={onCommitHistory}
          />
        )}
        </g>
      </svg>
    </div>
  );
};
