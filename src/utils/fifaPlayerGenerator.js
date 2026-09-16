// Realistic FIFA / EA FC Ultimate Team Card Generator & Team Logo Generator

export const generateFUTStats = (position, basePrice) => {
  // Base stats calculation based on position & value
  const base = Math.min(94, Math.max(72, Math.floor(70 + (basePrice / 100) * 3)));
  
  let pac = base, sho = base, pas = base, dri = base, def = base, phy = base;

  switch (position) {
    case 'ST':
    case 'LW':
    case 'RW':
      pac = Math.min(97, base + 6);
      sho = Math.min(95, base + 5);
      pas = base - 2;
      dri = Math.min(94, base + 4);
      def = Math.max(35, base - 35);
      phy = base + 1;
      break;
    case 'AM':
    case 'CM':
      pac = base + 1;
      sho = base;
      pas = Math.min(96, base + 7);
      dri = Math.min(94, base + 5);
      def = base - 15;
      phy = base - 5;
      break;
    case 'DM':
    case 'CB':
    case 'LB':
    case 'RB':
      pac = position.includes('B') && !position.includes('C') ? base + 5 : base - 4;
      sho = base - 25;
      pas = base - 5;
      dri = base - 10;
      def = Math.min(96, base + 8);
      phy = Math.min(94, base + 6);
      break;
    case 'GK':
      pac = base + 2; // DIV (Diving)
      sho = base + 4; // HAN (Handling)
      pas = base - 2; // KIC (Kicking)
      dri = base + 5; // REF (Reflexes)
      def = base - 5; // SPD (Speed)
      phy = base + 3; // POS (Positioning)
      break;
    default:
      break;
  }

  return { ovr: base, pac, sho, pas, dri, def, phy };
};

export const createRealisticPlayerPortrait = (name = 'Player', position = 'ST', kitColor = '#10b981') => {
  const hash = (name || 'Player').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  // Custom player facial profiles
  const cleanName = name.toLowerCase();
  
  // Skin tone selection
  let skin = '#e0ac69'; // default tan
  if (cleanName.includes('ronaldo') || cleanName.includes('neymar') || cleanName.includes('salah')) skin = '#c68642';
  else if (cleanName.includes('mbapp') || cleanName.includes('bellingham') || cleanName.includes('vinícius') || cleanName.includes('vinicius') || cleanName.includes('saka') || cleanName.includes('dijk')) skin = '#8d5524';
  else if (cleanName.includes('messi') || cleanName.includes('haaland') || cleanName.includes('bruyne') || cleanName.includes('modri') || cleanName.includes('lewandowski') || cleanName.includes('kane') || cleanName.includes('courtois') || cleanName.includes('neuer') || cleanName.includes('pedri') || cleanName.includes('griezmann')) skin = '#f1c27d';

  // Hair color & style selection
  let hairColor = '#1a1a1a';
  let hairType = 'SHORT_FADE'; // 'SHORT_FADE', 'SLICK_BACK', 'LONGBALL', 'BEARD_AFRO', 'BUZZ', 'BLONDE_LONG', 'PONYTAIL'

  if (cleanName.includes('haaland')) { hairColor = '#eab308'; hairType = 'BLONDE_LONG'; }
  else if (cleanName.includes('bruyne') || cleanName.includes('kane')) { hairColor = '#d97706'; hairType = 'SHORT_FADE'; }
  else if (cleanName.includes('modri') || cleanName.includes('griezmann')) { hairColor = '#ca8a04'; hairType = 'PONYTAIL'; }
  else if (cleanName.includes('ronaldo')) { hairColor = '#1e1b4b'; hairType = 'SLICK_BACK'; }
  else if (cleanName.includes('messi')) { hairColor = '#3b2314'; hairType = 'BEARD'; }
  else if (cleanName.includes('salah')) { hairColor = '#18181b'; hairType = 'BEARD_AFRO'; }
  else if (cleanName.includes('mbapp') || cleanName.includes('vinicius') || cleanName.includes('bellingham')) { hairColor = '#09090b'; hairType = 'BUZZ'; }
  else if (cleanName.includes('neymar')) { hairColor = '#eab308'; hairType = 'SHORT_FADE'; }

  // Facial Hair
  const hasBeard = cleanName.includes('messi') || cleanName.includes('salah') || cleanName.includes('dijk') || cleanName.includes('carvajal');

  // Hair SVG Paths
  let hairSvg = '';
  if (hairType === 'BLONDE_LONG' || hairType === 'PONYTAIL') {
    hairSvg = `
      <path d="M 130 170 Q 135 85 200 80 Q 265 85 270 170 Q 285 210 275 250 Q 255 120 200 115 Q 145 120 125 250 Z" fill="${hairColor}" />
      <path d="M 142 165 C 135 110, 160 90, 200 88 C 240 90, 265 110, 258 165 C 245 120, 220 105, 200 105 C 180 105, 155 120, 142 165 Z" fill="${hairColor}" opacity="0.9" />
    `;
  } else if (hairType === 'SLICK_BACK') {
    hairSvg = `
      <path d="M 138 165 Q 140 90 200 85 Q 260 90 262 165 Q 248 110 200 105 Q 152 110 138 165 Z" fill="${hairColor}" />
      <path d="M 150 115 Q 200 95 250 115 Q 230 100 200 98 Q 170 100 150 115 Z" fill="rgba(255,255,255,0.2)" />
    `;
  } else if (hairType === 'BEARD_AFRO') {
    hairSvg = `
      <circle cx="200" cy="140" r="75" fill="${hairColor}" />
      <circle cx="160" cy="130" r="45" fill="${hairColor}" />
      <circle cx="240" cy="130" r="45" fill="${hairColor}" />
      <circle cx="200" cy="100" r="50" fill="${hairColor}" />
    `;
  } else if (hairType === 'BUZZ') {
    hairSvg = `
      <path d="M 142 160 Q 145 110 200 105 Q 255 110 258 160 Q 250 118 200 115 Q 150 118 142 160 Z" fill="${hairColor}" />
    `;
  } else {
    // SHORT_FADE
    hairSvg = `
      <path d="M 140 165 Q 145 95 200 90 Q 255 95 260 165 Q 250 115 200 110 Q 150 115 140 165 Z" fill="${hairColor}" />
      <path d="M 145 155 Q 170 120 200 118 Q 230 120 255 155 Z" fill="${hairColor}" opacity="0.8" />
    `;
  }

  // Beard SVG
  const beardSvg = hasBeard ? `
    <path d="M 148 200 Q 150 255 200 262 Q 250 255 252 200 Q 240 250 200 252 Q 160 250 148 200 Z" fill="${hairColor}" opacity="0.9" />
    <path d="M 175 228 Q 200 236 225 228 Q 200 242 175 228 Z" fill="${hairColor}" />
  ` : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 500" width="400" height="500">
    <defs>
      <linearGradient id="bg-glow-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1e293b" />
        <stop offset="50%" stop-color="#0f172a" />
        <stop offset="100%" stop-color="#020617" />
      </linearGradient>
      <radialGradient id="spot-${hash}" cx="50%" cy="30%" r="65%">
        <stop offset="0%" stop-color="#38bdf8" stop-opacity="0.3" />
        <stop offset="100%" stop-color="#000000" stop-opacity="0" />
      </radialGradient>
      <linearGradient id="jersey-grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${kitColor}" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <filter id="shadow-${hash}">
        <feDropShadow dx="0" dy="10" stdDeviation="8" flood-color="#000000" flood-opacity="0.75"/>
      </filter>
    </defs>
    
    <!-- Background & Stadium Lighting -->
    <rect width="400" height="500" fill="url(#bg-glow-${hash})" />
    <circle cx="200" cy="180" r="190" fill="url(#spot-${hash})" />
    
    <!-- Player Front Profile Group -->
    <g filter="url(#shadow-${hash})">
      <!-- Athletic Shoulders & Team Kit Jersey -->
      <path d="M 45 490 Q 60 335 125 305 Q 200 290 275 305 Q 340 335 355 490 Z" fill="url(#jersey-grad-${hash})" />
      
      <!-- Jersey V-Neck / Collar -->
      <path d="M 140 308 Q 200 365 260 308 L 245 303 Q 200 345 155 303 Z" fill="#ffffff" opacity="0.95" />
      <path d="M 160 304 Q 200 345 240 304 L 230 302 Q 200 335 170 302 Z" fill="${kitColor}" />

      <!-- Club Crest Badge on Jersey -->
      <circle cx="235" cy="355" r="16" fill="#ffffff" opacity="0.9" />
      <circle cx="235" cy="355" r="13" fill="${kitColor}" />
      <polygon points="235,346 241,351 239,359 231,359 229,351" fill="#ffffff" />
      
      <!-- Neck & Muscles -->
      <rect x="172" y="235" width="56" height="75" rx="12" fill="${skin}" />
      <path d="M 172 275 Q 200 298 228 275 Z" fill="rgba(0,0,0,0.18)" />
      <path d="M 185 240 L 185 285" stroke="rgba(0,0,0,0.08)" stroke-width="3" />
      <path d="M 215 240 L 215 285" stroke="rgba(0,0,0,0.08)" stroke-width="3" />

      <!-- Ears -->
      <ellipse cx="140" cy="188" rx="11" ry="18" fill="${skin}" />
      <ellipse cx="260" cy="188" rx="11" ry="18" fill="${skin}" />
      <ellipse cx="140" cy="188" rx="6" ry="10" fill="rgba(0,0,0,0.1)" />
      <ellipse cx="260" cy="188" rx="6" ry="10" fill="rgba(0,0,0,0.1)" />

      <!-- Head & Jaw Contour (Front Profile) -->
      <path d="M 146 170 C 144 225, 160 262, 200 264 C 240 262, 256 225, 254 170 C 254 120, 238 100, 200 100 C 162 100, 146 120, 146 170 Z" fill="${skin}" />

      <!-- Beard (if applicable) -->
      ${beardSvg}

      <!-- Hair Style -->
      ${hairSvg}

      <!-- Eyebrows (Athletic Intense Look) -->
      <path d="M 160 162 Q 178 154 192 163" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />
      <path d="M 208 163 Q 222 154 240 162" stroke="${hairColor}" stroke-width="4.5" stroke-linecap="round" fill="none" />
      
      <!-- Eyes & Pupils -->
      <ellipse cx="176" cy="174" rx="9" ry="6" fill="#ffffff" />
      <ellipse cx="224" cy="174" rx="9" ry="6" fill="#ffffff" />
      <circle cx="176" cy="174" r="4.5" fill="#0f172a" />
      <circle cx="224" cy="174" r="4.5" fill="#0f172a" />
      <circle cx="178" cy="173" r="1.5" fill="#ffffff" />
      <circle cx="226" cy="173" r="1.5" fill="#ffffff" />

      <!-- Nose Structure -->
      <path d="M 200 163 L 195 198 L 205 198" stroke="rgba(0,0,0,0.22)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none" />

      <!-- Focused Mouth / Lip Line -->
      <path d="M 178 220 Q 200 228 222 220" stroke="#881337" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 184 220 Q 200 224 216 220" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" fill="none" />
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const createTeamLogoSvg = (teamName = 'Team', shortName = 'SPL', primaryColor = '#F59E0B') => {
  const hash = (teamName || 'SPL').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240">
    <defs>
      <linearGradient id="crest-bg-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${primaryColor}" />
        <stop offset="100%" stop-color="#0f172a" />
      </linearGradient>
      <filter id="shadow-${hash}">
        <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
      </filter>
    </defs>
    <!-- Outer Shield Frame -->
    <path d="M 100 10 L 180 40 L 180 140 C 180 190 100 230 100 230 C 100 230 20 190 20 140 L 20 40 Z" fill="url(#crest-bg-${hash})" stroke="#ffffff" stroke-width="4" filter="url(#shadow-${hash})" />
    <!-- Inner Border -->
    <path d="M 100 22 L 168 48 L 168 135 C 168 178 100 212 100 212 C 100 212 32 178 32 135 L 32 48 Z" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="2" />
    <!-- Star top -->
    <path d="M 100 32 L 103 40 L 111 40 L 105 45 L 107 53 L 100 48 L 93 53 L 95 45 L 89 40 L 97 40 Z" fill="#F59E0B" />
    <!-- Short Code Text -->
    <text x="100" y="115" font-family="Impact, sans-serif" font-size="38" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="2" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.8))">${(shortName || 'SPL').substring(0, 4)}</text>
    <!-- Football icon -->
    <circle cx="100" cy="165" r="18" fill="#ffffff" stroke="${primaryColor}" stroke-width="3" />
    <polygon points="100,153 108,160 105,170 95,170 92,160" fill="#0f172a" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};
