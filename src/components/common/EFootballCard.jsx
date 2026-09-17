import React from 'react';
import { formatCurrency } from '../../utils/currency';

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
}) => {
  if (!player) return null;

  const heroImage = player.presentationPng || player.photoUrl || player.photo;
  const ovr = player.overallRating || 98;
  const position = (player.position || 'RW').toUpperCase();
  const name = player.name || 'PLAYER';
  
  // Stats (Using fallbacks if not provided)
  const stats = player.stats || { pac: 97, sho: 95, pas: 98, dri: 98, def: 33, phy: 81 };
  
  // Logos
  const countryFlag = player.countryFlag || '/assets/flag.png';
  const clubLogo = player.clubLogo || '/assets/logo.png';
  const isDefaultLogo = !player.clubLogo || player.clubLogo === '/assets/logo.png';

  // Auto-assign SILVER theme for Goalkeepers (GK) if needed
  const effectiveTheme = (position === 'GK' && theme === 'GOLD') ? 'SILVER' : theme;

  // Photo Alignment & Zoom offsets
  const photoScale = player.photoScale || 1.1;
  const photoOffsetX = player.photoOffsetX || 0;
  const photoOffsetY = player.photoOffsetY || 0;

  // Scale map
  const scaleMap = { sm: 0.65, md: 0.85, lg: 1.1, xl: 1.35 };
  const scale = scaleMap[size] || scaleMap.md;
  const cardWidth = 320 * scale;
  const cardHeight = 440 * scale;

  // Theme configuration matching EA FC 24 reference cards
  const themeConfig = {
    GOLD: {
      bgGrad1: '#fff3c2', bgGrad2: '#e6b856', bgGrad3: '#c29029', bgGrad4: '#4a3206',
      border1: '#fff4cc', border2: '#e6c265', border3: '#523403',
      textDark: '#1c1505',
      textLight: '#ffffff',
      accent: '#fff',
    },
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
  const cfg = themeConfig[effectiveTheme] || themeConfig.GOLD;

  const idSuffix = `${player.id || 'p'}-${effectiveTheme}-${Math.floor(Math.random()*1000)}`;

  // FC 24 Geometric Shape
  // Arched top, sharp angled corners
  const cardPath = "M 80 15 Q 160 5 240 15 L 305 55 L 305 345 L 160 405 L 15 345 L 15 55 Z";

  return (
    <div
      onClick={onClick}
      className={`relative select-none transition-transform duration-300 ${onClick ? 'cursor-pointer hover:scale-105' : ''}`}
      style={{
        width: cardWidth,
        height: cardHeight,
        filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.7)) drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5))',
      }}
    >
      <svg
        viewBox="0 0 320 440"
        width={cardWidth}
        height={cardHeight}
        className="w-full h-full overflow-visible"
      >
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

          {/* Geometric Texture (Subtle triangles) */}
          <pattern id={`texture-${idSuffix}`} width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(30)">
            <polygon points="30,0 60,30 30,60 0,30" fill="rgba(255,255,255,0.03)" />
            <polygon points="15,15 45,15 30,45" fill="rgba(0,0,0,0.02)" />
          </pattern>

          {/* Inner Clip Path */}
          <clipPath id={`card-clip-${idSuffix}`}>
            <use href={`#card-shape-${idSuffix}`} />
          </clipPath>

          {/* Photo Clip Path: Matches angled corners perfectly, but extends up at the center for head pop-out */}
          <clipPath id={`photo-clip-${idSuffix}`}>
            <path d="M 160 425 L 15 335 L 15 55 L 80 15 L 80 -100 L 240 -100 L 240 15 L 305 55 L 305 335 Z" />
          </clipPath>

          {/* Alpha mask for player photo (fades smoothly at the bottom) */}
          <linearGradient id={`photo-fade-${idSuffix}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="55%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="85%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <mask id={`photo-mask-${idSuffix}`}>
            <rect x="-20" y="-40" width="360" height="320" fill={`url(#photo-fade-${idSuffix})`} />
          </mask>
        </defs>

        {/* 1. Base Card Shape Fill */}
        <use href={`#card-shape-${idSuffix}`} fill={`url(#card-bg-grad-${idSuffix})`} />
        
        {/* 2. Geometric Texture */}
        <use href={`#card-shape-${idSuffix}`} fill={`url(#texture-${idSuffix})`} />

        {/* 3. Outer Border */}
        <use href={`#card-shape-${idSuffix}`} fill="none" stroke={`url(#card-border-grad-${idSuffix})`} strokeWidth="4" />
        
        {/* 4. Metallic Light Flare Overlay */}
        <use href={`#card-shape-${idSuffix}`} fill={`url(#flare-${idSuffix})`} style={{ mixBlendMode: 'overlay' }} />

        

          {/* PLAYER PHOTO */}
          <g clipPath={`url(#card-clip-${idSuffix})`} mask={`url(#photo-mask-${idSuffix})`}>
            <g transform={`translate(160, 150) scale(${photoScale}) translate(-160, -150) translate(${photoOffsetX}, ${photoOffsetY})`}>
              {heroImage ? (
                <image
                  href={heroImage}
                  x="0"
                  y="-10"
                  width="320"
                  height="320"
                  preserveAspectRatio="xMidYMin slice"
                  style={{ filter: 'drop-shadow(0px 8px 10px rgba(0,0,0,0.4))' }}
                />
              ) : (
                <circle cx="175" cy="160" r="60" fill="rgba(0,0,0,0.1)" />
              )}
            </g>
          </g>

        {/* Content Clipped to Card */}
        <g clipPath={`url(#card-clip-${idSuffix})`}>
          
          {/* Header Lines / Inner Accents */}
          <path d="M 40 70 L 100 70" stroke={cfg.border1} strokeWidth="2" strokeOpacity="0.4" />
          <path d="M 280 70 L 220 70" stroke={cfg.border1} strokeWidth="2" strokeOpacity="0.4" />
          {/* STATS BACKGROUND GRADIENT (Darkens bottom half for text legibility) */}
          <rect x="0" y="240" width="320" height="200" fill="url(#photo-fade-darken)" opacity="0" />
          <linearGradient id="photo-fade-darken" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0" />
            <stop offset="40%" stopColor="#000000" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </linearGradient>
          <rect x="0" y="220" width="320" height="220" fill="url(#photo-fade-darken)" />

          {/* RATING & POSITION (Top Left) */}
          <g transform="translate(55, 90)">
            <text x="0" y="0" fontFamily="var(--font-broadcast), 'Bebas Neue', Impact, sans-serif" fontSize="52" fontWeight="bold" fill={cfg.textDark} textAnchor="middle" style={{ letterSpacing: '-2px' }}>
              {ovr}
            </text>
            <text x="0" y="25" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="800" fill={cfg.textDark} textAnchor="middle" style={{ letterSpacing: '0px' }}>
              {position}
            </text>
            
            {/* Country and Club logos moved to top left below position to match modern FC24 layout */}
            <image href={countryFlag} x="-18" y="40" width="36" height="24" preserveAspectRatio="xMidYMid meet" />
            <image href={clubLogo} x="-14" y="72" width="28" height="28" preserveAspectRatio="xMidYMid meet" style={{ filter: isDefaultLogo ? 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))' : 'none' }} />
            {isDefaultLogo && (
              <text x="0" y="89" fontFamily="var(--font-display), 'Arial Black', sans-serif" fontSize="6.5" fontWeight="900" fill="#ffffff" textAnchor="middle" style={{ letterSpacing: '0.5px', filter: 'drop-shadow(0px 1px 2px rgba(0,0,0,0.8))' }}>SPL</text>
            )}
          </g>

          {/* PLAYER NAME */}
          <text 
            x="160" 
            y="280" 
            fontFamily="var(--font-broadcast), 'Bebas Neue', Impact, sans-serif" 
            fontSize={name.length > 12 ? '34' : '40'} 
            fontWeight="bold" 
            fill={cfg.textDark} 
            textAnchor="middle" 
            style={{ textTransform: 'uppercase', letterSpacing: '1px' }}
          >
            {name}
          </text>
          
          <line x1="60" y1="290" x2="260" y2="290" stroke={cfg.border2} strokeWidth="1" strokeOpacity="0.5" />

          {/* STATS GRID (2 columns, 3 rows) */}
          <g transform="translate(160, 315)">
            {/* Left Column */}
            <g transform="translate(-40, 0)">
              <text x="-5" y="0" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="800" fill={cfg.textDark} textAnchor="end">{stats.pac}</text>
              <text x="5" y="0" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="400" fill={cfg.textDark} textAnchor="start">PAC</text>
              
              <text x="-5" y="30" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="800" fill={cfg.textDark} textAnchor="end">{stats.sho}</text>
              <text x="5" y="30" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="400" fill={cfg.textDark} textAnchor="start">SHO</text>
              
              <text x="-5" y="60" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="800" fill={cfg.textDark} textAnchor="end">{stats.pas}</text>
              <text x="5" y="60" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="400" fill={cfg.textDark} textAnchor="start">PAS</text>
            </g>
            
            {/* Center Divider */}
            <line x1="0" y1="-15" x2="0" y2="65" stroke={cfg.border2} strokeWidth="1" strokeOpacity="0.5" />

            {/* Right Column */}
            <g transform="translate(40, 0)">
              <text x="-5" y="0" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="800" fill={cfg.textDark} textAnchor="end">{stats.dri}</text>
              <text x="5" y="0" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="400" fill={cfg.textDark} textAnchor="start">DRI</text>
              
              <text x="-5" y="30" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="800" fill={cfg.textDark} textAnchor="end">{stats.def}</text>
              <text x="5" y="30" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="400" fill={cfg.textDark} textAnchor="start">DEF</text>
              
              <text x="-5" y="60" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="800" fill={cfg.textDark} textAnchor="end">{stats.phy}</text>
              <text x="5" y="60" fontFamily="'DIN Pro', var(--font-display), Arial, sans-serif" fontSize="18" fontWeight="400" fill={cfg.textDark} textAnchor="start">PHY</text>
            </g>
          </g>
          
        </g>
      </svg>
    </div>
  );
};
