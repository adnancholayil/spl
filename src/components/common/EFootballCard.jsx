import React from 'react';
import { formatCurrency } from '../../utils/currency';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';

/**
 * Authentic EA FC 24 Ultimate Team Player Card Component
 * - Specs section (PAC SHO PAS DRI DEF PHY) removed as requested
 * - Player Name text size enlarged & perfectly centered
 * - Increased photo bottom fade opacity for seamless blend of camera photos
 * - Clean SVG India Flag & SPL emblem centered at bottom
 */
export const EFootballCard = ({
  player,
  size = 'md',
  theme = 'GOLD', // GOLD | SILVER | ICON | PINK | DARK
  onClick,
  showPrice = false,
  highlight = false,
  status = null, // 'SOLD' | 'UNSOLD' | null
}) => {
  if (!player) return null;

  const heroImage = player.presentationPng || player.photoUrl || player.photo;
  const ovr = player.overallRating || 88;
  const position = (player.position || 'ST').toUpperCase();

  // Auto-assign SILVER theme for Goalkeepers (GK)
  const effectiveTheme = (position === 'GK' && theme === 'GOLD') ? 'SILVER' : theme;

  // Photo Alignment & Zoom offsets
  const photoScale = player.photoScale || 1.0;
  const photoOffsetX = player.photoOffsetX || 0;
  const photoOffsetY = player.photoOffsetY || 0;

  // Scale map
  const scaleMap = {
    sm: 0.65,
    md: 0.85,
    lg: 1.1,
    xl: 1.35,
  };
  const scale = scaleMap[size] || scaleMap.md;
  const cardWidth = 320 * scale;
  const cardHeight = 480 * scale;

  // Theme configuration matching EA FC 24 reference cards
  const themeConfig = {
    GOLD: {
      bgGrad1: '#fae3a5', bgGrad2: '#e6b856', bgGrad3: '#c29029', bgGrad4: '#7a540b',
      border1: '#fff4cc', border2: '#d4a017', border3: '#523403',
      textDark: '#2c1c04',
      textMuted: '#593b0a',
      glow: 'rgba(212, 160, 23, 0.6)',
    },
    SILVER: {
      bgGrad1: '#f8fafc', bgGrad2: '#cbd5e1', bgGrad3: '#94a3b8', bgGrad4: '#475569',
      border1: '#ffffff', border2: '#cbd5e1', border3: '#334155',
      textDark: '#0f172a',
      textMuted: '#334155',
      glow: 'rgba(203, 213, 225, 0.65)',
    },
    ICON: {
      bgGrad1: '#ffffff', bgGrad2: '#f4ebd0', bgGrad3: '#dcd0a8', bgGrad4: '#8c763b',
      border1: '#ffffff', border2: '#d4af37', border3: '#4d401a',
      textDark: '#1a1a1a',
      textMuted: '#4d401a',
      glow: 'rgba(230, 198, 83, 0.7)',
    },
    PINK: {
      bgGrad1: '#ff88d6', bgGrad2: '#e6008b', bgGrad3: '#99005c', bgGrad4: '#4d002e',
      border1: '#ffcceb', border2: '#ff1ab3', border3: '#4d002e',
      textDark: '#ffffff',
      textMuted: '#ffb3e6',
      glow: 'rgba(230, 0, 139, 0.75)',
    },
    DARK: {
      bgGrad1: '#38bdf8', bgGrad2: '#0284c7', bgGrad3: '#0f172a', bgGrad4: '#020617',
      border1: '#7dd3fc', border2: '#0284c7', border3: '#0f172a',
      textDark: '#ffffff',
      textMuted: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.65)',
    },
  };
  const cfg = themeConfig[effectiveTheme] || themeConfig.GOLD;

  // SVG Unique element IDs
  const idSuffix = `${player.id || 'p'}-${effectiveTheme}-${Math.floor(Math.random()*1000)}`;

  return (
    <div
      onClick={onClick}
      className={`relative select-none transition-transform duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      style={{
        width: cardWidth,
        height: cardHeight,
        filter: highlight
          ? `drop-shadow(0 0 35px ${cfg.glow}) drop-shadow(0 20px 40px rgba(0,0,0,0.95))`
          : 'drop-shadow(0 15px 30px rgba(0,0,0,0.85))',
      }}
    >
      <svg
        viewBox="0 0 320 480"
        width={cardWidth}
        height={cardHeight}
        className="w-full h-full overflow-visible"
      >
        <defs>
          {/* EA FC Authentic Curved Shield Path Geometry */}
          <path
            id={`card-shape-${idSuffix}`}
            d="M 32 14 Q 160 0 288 14 C 304 16 312 26 312 42 L 312 372 C 312 422 200 466 160 474 C 120 466 8 422 8 372 L 8 42 C 8 26 16 16 32 14 Z"
          />

          {/* Photo Clip Area (Clipped above name ribbon at y=360) */}
          <clipPath id={`photo-area-clip-${idSuffix}`}>
            <rect x="0" y="0" width="320" height="360" />
          </clipPath>

          {/* Linear Gradient for Photo Alpha Mask (Increased Fade Opacity) */}
          <linearGradient id={`photo-alpha-grad-${idSuffix}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="35%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="68%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="90%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* SVG Alpha Mask applied directly to the player photo element */}
          <mask id={`photo-alpha-mask-${idSuffix}`} maskUnits="userSpaceOnUse" x="0" y="0" width="320" height="360">
            <rect x="0" y="0" width="320" height="360" fill={`url(#photo-alpha-grad-${idSuffix})`} />
          </mask>

          {/* Card Metallic Linear Gradient */}
          <linearGradient id={`card-bg-grad-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.bgGrad1} />
            <stop offset="30%" stopColor={cfg.bgGrad2} />
            <stop offset="70%" stopColor={cfg.bgGrad3} />
            <stop offset="100%" stopColor={cfg.bgGrad4} />
          </linearGradient>

          {/* Border Metallic 3D Bevel Gradient */}
          <linearGradient id={`card-border-grad-${idSuffix}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={cfg.border1} />
            <stop offset="50%" stopColor={cfg.border2} />
            <stop offset="100%" stopColor={cfg.border3} />
          </linearGradient>

          {/* Holographic Geometric Mesh Overlay */}
          <pattern id={`holo-pattern-${idSuffix}`} width="40" height="40" patternUnits="userSpaceOnUse" patternTransform="rotate(25)">
            <line x1="0" y1="0" x2="0" y2="40" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
            <polygon points="0,0 20,10 40,0 20,30" fill="rgba(255,255,255,0.04)" />
          </pattern>

          {/* Clip path for content inside the shield */}
          <clipPath id={`card-clip-${idSuffix}`}>
            <use href={`#card-shape-${idSuffix}`} />
          </clipPath>

          {/* Photo Drop Shadow */}
          <filter id={`photo-shadow-${idSuffix}`}>
            <feDropShadow dx="0" dy="6" stdDeviation="5" floodColor="#000000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* 1. Outer 3D Bevel Border Frame */}
        <use
          href={`#card-shape-${idSuffix}`}
          fill="none"
          stroke={`url(#card-border-grad-${idSuffix})`}
          strokeWidth="8"
          strokeLinejoin="round"
        />

        {/* 2. Inner Card Shield Fill */}
        <use
          href={`#card-shape-${idSuffix}`}
          fill={`url(#card-bg-grad-${idSuffix})`}
        />

        {/* 3. Geometric Mesh Overlay */}
        <use
          href={`#card-shape-${idSuffix}`}
          fill={`url(#holo-pattern-${idSuffix})`}
          style={{ mixBlendMode: 'overlay' }}
        />

        {/* MAIN CARD CONTENT LAYER CLIPPED TO SHIELD */}
        <g clipPath={`url(#card-clip-${idSuffix})`}>

          {/* PLAYER PHOTO LAYER WITH INCREASED FADE OPACITY */}
          <g clipPath={`url(#photo-area-clip-${idSuffix})`}>
            <g mask={`url(#photo-alpha-mask-${idSuffix})`}>
              <g 
                filter={`url(#photo-shadow-${idSuffix})`}
                transform={`translate(${photoOffsetX}, ${photoOffsetY})`}
              >
                {heroImage ? (
                  <image
                    href={heroImage}
                    x={160 - (130 * photoScale)}
                    y={190 - (145 * photoScale)}
                    width={260 * photoScale}
                    height={290 * photoScale}
                    preserveAspectRatio="xMidYMax meet"
                    onError={(e) => {
                      e.target.setAttribute('href', createRealisticPlayerPortrait(player.name, player.position));
                    }}
                  />
                ) : (
                  <image
                    href={createRealisticPlayerPortrait(player.name, player.position)}
                    x={160 - (120 * photoScale)}
                    y={195 - (135 * photoScale)}
                    width={240 * photoScale}
                    height={270 * photoScale}
                    preserveAspectRatio="xMidYMax meet"
                  />
                )}
              </g>
            </g>
          </g>

          {/* TOP LEFT: OVR RATING & POSITION HEADER */}
          <g transform="translate(32, 42)">
            <text
              x="0"
              y="32"
              fontFamily="var(--font-broadcast), 'Bebas Neue', Impact, sans-serif"
              fontSize="48"
              fontWeight="900"
              fill={cfg.textDark}
              letterSpacing="-1"
              filter="drop-shadow(0 1px 2px rgba(255,255,255,0.4))"
            >
              {ovr}
            </text>

            <text
              x="0"
              y="56"
              fontFamily="var(--font-display), 'Oswald', sans-serif"
              fontSize="18"
              fontWeight="800"
              fill={cfg.textDark}
              letterSpacing="1"
            >
              {position}
            </text>
          </g>

          {/* TOP RIGHT: PLAYER NUMBER (#20) */}
          <g transform="translate(288, 42)">
            <text
              x="0"
              y="36"
              fontFamily="var(--font-broadcast), 'Bebas Neue', Impact, sans-serif"
              fontSize="32"
              fontWeight="900"
              fill={cfg.textDark}
              textAnchor="end"
              letterSpacing="0"
              filter="drop-shadow(0 1px 2px rgba(255,255,255,0.4))"
            >
              #{player.number || player.lotNumber || player.id || '10'}
            </text>
          </g>

          {/* PLAYER NAME BANNER (DYNAMIC FONT SIZING & PERFECTLY CENTERED) */}
          <g transform="translate(160, 375)">
            <text
              x="0"
              y="0"
              fontFamily="var(--font-broadcast), 'Bebas Neue', Impact, sans-serif"
              fontSize={(player.name || 'PLAYER').length > 14 ? '26' : (player.name || 'PLAYER').length > 10 ? '32' : '40'}
              fontWeight="900"
              fill={cfg.textDark}
              textAnchor="middle"
              letterSpacing="2"
              filter="drop-shadow(0 1px 3px rgba(255,255,255,0.4))"
            >
              {(player.name || 'PLAYER').toUpperCase()}
            </text>
          </g>

          {/* BOTTOM BADGES (INDIA FLAG + SPL LEAGUE CREST) */}
          <g transform="translate(160, 428)">
            {/* High Quality Indian Tricolor Vector Flag with Ashoka Chakra */}
            <g transform="translate(-24, -8)">
              <rect x="0" y="0" width="24" height="15" rx="2" fill="#FF9933" />
              <rect x="0" y="5" width="24" height="5" fill="#FFFFFF" />
              <rect x="0" y="10" width="24" height="5" fill="#138808" />
              {/* Ashoka Chakra Center Wheel */}
              <circle cx="12" cy="7.5" r="2.2" fill="none" stroke="#000080" strokeWidth="0.6" />
              <circle cx="12" cy="7.5" r="0.7" fill="#000080" />
            </g>

            {/* SPL Shield Crest Badge */}
            <g transform="translate(10, -8)">
              <path d="M 0,0 L 15,0 L 15,10 Q 7.5,16 0,10 Z" fill={cfg.textDark} stroke={cfg.border1} strokeWidth="1" />
              <text x="7.5" y="8" fontFamily="var(--font-display)" fontSize="7" fontWeight="900" fill="#ffffff" textAnchor="middle">
                SPL
              </text>
            </g>
          </g>

        </g>

        {/* STATUS STAMP OVERLAY (SOLD / UNSOLD) */}
        {status && (
          <g transform="translate(160, 240)">
            <rect
              x="-110"
              y="-35"
              width="220"
              height="70"
              rx="8"
              fill={status === 'SOLD' ? 'rgba(6, 78, 41, 0.95)' : 'rgba(127, 29, 29, 0.95)'}
              stroke={status === 'SOLD' ? '#22c55e' : '#ef4444'}
              strokeWidth="4"
              transform="rotate(-12)"
              filter="drop-shadow(0 10px 25px rgba(0,0,0,0.9))"
            />
            <text
              x="0"
              y="14"
              fontFamily="var(--font-broadcast), 'Bebas Neue', sans-serif"
              fontSize="48"
              fontWeight="900"
              fill={status === 'SOLD' ? '#4ade80' : '#fca5a5'}
              textAnchor="middle"
              transform="rotate(-12)"
              letterSpacing="4"
            >
              {status}
            </text>
          </g>
        )}
      </svg>

      {/* Price tag pill below card if showPrice */}
      {showPrice && (
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 px-4 py-1 bg-slate-900/90 border border-amber-400/40 rounded-full shadow-lg">
          <span className="text-xs font-black text-amber-300 tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
            BASE: {formatCurrency(player.basePrice, '₹')}
          </span>
        </div>
      )}
    </div>
  );
};
