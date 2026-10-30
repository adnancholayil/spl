// Offline Persistence Engine — SPL Auction Platform
import { createRealisticPlayerPortrait, createTeamLogoSvg } from '../utils/fifaPlayerGenerator';
import { broadcastBus } from '../utils/broadcastChannel';

const KEYS = {
  TOURNAMENT:       'spl_active_tournament',
  TEAMS:            'spl_teams_data',
  PLAYERS:          'spl_players_data',
  AUCTION_STATE:    'spl_auction_live_state',
  AUCTION_HISTORY:  'spl_auction_history',
  AUTH:             'spl_auth_user',
  SETTINGS:         'spl_app_settings',
  PROJECTOR_SETTINGS: 'spl_projector_settings',
  CARD_THEME:       'spl_card_theme',
  GK_CARD_THEME:    'spl_gk_card_theme',
  DATA_CLEARED:     'spl_user_cleared_data',
  DEMO_WIPED:       'spl_demo_cleared_wipe_v2',
  AUDIO_MUTED:      'spl_audio_muted'
};

const DEFAULT_PROJECTOR_SETTINGS = {
  mode: 'AUTO',
  showManagerBalance: true,
  showLiveTicker: true,
  showSquadSummary: true,
  showPlayerAttributes: true,
  showBasePrice: true,
  showSoldBadge: true,
  showTeamLogos: true,
  customTickerText: 'SUPER PREMIER LEAGUE 2026 • OFFICIAL PLAYER AUCTION & SQUAD DRAFT',
  selectedTeamId: '',
  screenTheme: 'DEFAULT',
  bgImage: '',
  bgFilter1: '#060503',
  bgFilter2: '#1c1404',
  bgFilterOpacity1: 85,
  bgFilterOpacity2: 90,
  panelBgColor: '#000000',
  panelBgOpacity: 50,
  panelBorderColor: '#ffffff',
  panelBorderOpacity: 10,
  ambientShadowOpacity: 20,
  squadFormat: '11s', // '11s' | '7s' | '5s'
  homeMediaUrl: '',
  homeMediaName: '',
  homeMediaType: 'none', // 'image' | 'video' | 'none'
  homeMediaCustom: false,
  homeMediaFullScreen: true,
  homeMediaFit: 'cover', // 'cover' | 'contain'
  showLogoOnHomeMedia: true,
  logoBackgroundBadge: true,
  showSponsors: false,
  showSponsorsOnAllScreens: false,
  sponsors: [],
  introCardFlip: false,
};

const DEFAULT_TOURNAMENT = {
  id: 'tourn-2026-spl',
  name: 'SUPER PREMIER LEAGUE 2026',
  sport: 'Football',
  season: '2026 Season',
  location: 'Super Stadium',
  numberOfTeams: 0,
  currency: '$',
  defaultBudget: 5000,
  minIncrement: 5,
  squadFormat: '11s', // '11s' | '7s' | '5s'
  createdAt: new Date().toISOString()
};

export const DEFAULT_CARD_THEME = {
  bgGrad1: '#fff3c2',
  bgGrad2: '#e6b856',
  bgGrad3: '#c29029',
  bgGrad4: '#4a3206',
  border1: '#fff4cc',
  border2: '#e6c265',
  border3: '#523403',
  textDark: '#1c1505',
  textLight: '#ffffff',
  accent: '#fff',
  // Layout offsets
  layoutRatingX: 55,
  layoutRatingY: 90,
  layoutPositionGapY: 25,
  layoutPositionX: 0,
  layoutLogosGapY: 15,
  layoutClubLogoGapY: 8,
  layoutLogosX: 0,
  layoutFlagWidth: 36,
  layoutFlagHeight: 24,
  layoutClubLogoSize: 28,
  layoutNameX: 160,
  layoutNameY: 280,
  layoutNameFontSize: 40,
  layoutImageX: 40,
  layoutImageY: 50,
  layoutImageW: 280,
  layoutImageH: 280,
  layoutImageFadeY: 55,
  layoutShadowY: 220,
  layoutShadowOpacity: 60,
  layoutRatingSize: 52,
  layoutPositionSize: 18,
  layoutStatNumSize: 18,
  layoutStatLabelSize: 18,
  layoutLogoScale: 100,
  cardShape: 'eafc24', // eafc24, shield, classic
  layoutStatsX: 160,
  layoutStatsY: 315,
  layoutStatsGapX: 40,
  layoutStatsGapY: 30,
  // Visibility Toggles
  showRating: true,
  showLogos: true,
  showName: true,
  showStats: true,
  // Front Side Layout
  frontSideDesign: 'geometric',
  // Back Side Layout
  backSideDesign: 'geometric',
  backSideLogoX: 160,
  backSideLogoY: 200,
  backSideLogoScale: 100,
  showBackSideLogo: true,
  backSideTextX: 160,
  backSideTextY: 315,
  backSideTextSize: 22,
  showBackSideText: true,
  // Card Visual Effects System (Modular, broadcast-grade)
  enableEffects: true,
  fxIntensity: 100,
  fxPlayerGlow: true,
  fxPlayerParallax: true,
  fxPlayerHolo: false,
  fxBgRays: true,
  fxBgParticles: true,
  fxBgPulse: true,
  fxSurfaceSheen: true,
  fxSheenSpeed: 3.5,
  fxSheenSize: 220,
  fxSheenOpacity: 85,
  fxSheenLag: 1.5,
  fxHoloFoil: false,
  fxGlintStars: true,
  fxGlintSpeed: 2.6,
  fxGlintSize: 100,
  fxGlintOpacity: 90,
  fxGlintLag: 1.2,
  fxBorderGleam: true,
  fxBorderPulse: false,
};

export const DEFAULT_GK_CARD_THEME = {
  ...DEFAULT_CARD_THEME,
  // Emerald Guardian GK Palette
  bgGrad1: '#e6fffa',
  bgGrad2: '#34d399',
  bgGrad3: '#059669',
  bgGrad4: '#064e3b',
  border1: '#a7f3d0',
  border2: '#10b981',
  border3: '#022c22',
  textDark: '#064e3b',
  textLight: '#ffffff',
  accent: '#34d399',
  frontSideDesign: 'modern',
  cardShape: 'eafc24',
};

const INITIAL_AUCTION_STATE = {
  stage: 'IDLE',
  currentPlayerId: null,
  currentBid: 0,
  leadingTeamId: null,
  bidHistory: [],
  timer: 10
};

export const storageService = {
  init() {
    // Check if demo data wipe was executed
    if (!localStorage.getItem(KEYS.DEMO_WIPED)) {
      this.clearAllData();
      localStorage.setItem(KEYS.DEMO_WIPED, 'true');
      return;
    }

    const existingTourn = JSON.parse(localStorage.getItem(KEYS.TOURNAMENT) || 'null');
    if (!existingTourn) {
      localStorage.setItem(KEYS.TOURNAMENT, JSON.stringify(DEFAULT_TOURNAMENT));
    } else {
      let shouldUpdate = false;
      if (!existingTourn.currency) {
        existingTourn.currency = '$';
        shouldUpdate = true;
      }
      if (existingTourn.minIncrement === undefined) {
        existingTourn.minIncrement = 5;
        shouldUpdate = true;
      }
      if (shouldUpdate) {
        localStorage.setItem(KEYS.TOURNAMENT, JSON.stringify(existingTourn));
      }
    }

    if (!localStorage.getItem(KEYS.TEAMS)) localStorage.setItem(KEYS.TEAMS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.PLAYERS)) localStorage.setItem(KEYS.PLAYERS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.AUCTION_STATE)) localStorage.setItem(KEYS.AUCTION_STATE, JSON.stringify(INITIAL_AUCTION_STATE));
    if (!localStorage.getItem(KEYS.AUCTION_HISTORY)) localStorage.setItem(KEYS.AUCTION_HISTORY, JSON.stringify([]));
  },

  getTournament()        { this.init(); return JSON.parse(localStorage.getItem(KEYS.TOURNAMENT)); },
  saveTournament(data)   { 
    localStorage.setItem(KEYS.TOURNAMENT, JSON.stringify(data)); 
    try { window.dispatchEvent(new Event('tournament-updated')); } catch (e) {}
    try { window.dispatchEvent(new Event('storage')); } catch (e) {}
    try { broadcastBus.publish('TOURNAMENT_UPDATED', data); } catch (e) {}
    return data; 
  },

  getCurrency() {
    try {
      const tourn = this.getTournament();
      return tourn?.currency || '$';
    } catch {
      return '$';
    }
  },

  saveCurrency(currency) {
    const tourn = this.getTournament() || DEFAULT_TOURNAMENT;
    tourn.currency = currency;
    return this.saveTournament(tourn);
  },

  getTeams() { 
    this.init(); 
    let teams = JSON.parse(localStorage.getItem(KEYS.TEAMS)) || []; 
    let updated = false;

    // Load players to verify actual player sales
    let players = [];
    try {
      players = JSON.parse(localStorage.getItem(KEYS.PLAYERS)) || [];
    } catch {}

    teams = teams.map(t => {
      // Calculate actual spent from assigned sold players
      const teamPlayers = Array.isArray(players) ? players.filter(p => p.teamId === t.id && p.status === 'SOLD') : [];
      const calculatedSpent = teamPlayers.reduce((sum, p) => sum + (Number(p.soldPrice) || 0), 0);

      // Determine accurate totalSpent: use max of tracked spent and calculated spent from sold players
      const actualSpent = (typeof t.totalSpent === 'number' && t.totalSpent >= 0)
        ? Math.max(t.totalSpent, calculatedSpent)
        : calculatedSpent;

      const startingBudget = (typeof t.startingBudget === 'number' && t.startingBudget > 0)
        ? t.startingBudget
        : (DEFAULT_TOURNAMENT.defaultBudget || 5000);

      // Remaining budget must strictly be startingBudget - actualSpent
      const expectedBalance = startingBudget - actualSpent;

      // Fix if currentBalance is inconsistent with startingBudget and spent (e.g. 58990 instead of 3990)
      if (t.currentBalance !== expectedBalance || t.totalSpent !== actualSpent || t.startingBudget !== startingBudget) {
        updated = true;
        return {
          ...t,
          startingBudget,
          totalSpent: actualSpent,
          currentBalance: expectedBalance,
          playersBought: teamPlayers.length > 0 ? teamPlayers.length : (t.playersBought || 0)
        };
      }
      return t;
    });

    if (updated) {
      localStorage.setItem(KEYS.TEAMS, JSON.stringify(teams));
    }

    return teams; 
  },
  saveTeams(teams)       { 
    localStorage.setItem(KEYS.TEAMS, JSON.stringify(teams)); 
    try { window.dispatchEvent(new Event('teams-updated')); } catch (e) {}
    try { window.dispatchEvent(new Event('storage')); } catch (e) {}
    return teams; 
  },

  getPlayers() { 
    this.init(); 
    let players = JSON.parse(localStorage.getItem(KEYS.PLAYERS)) || []; 
    let updated = false;
    players = players.map(p => {
      if (p.name.toUpperCase().includes('HAALAND') && p.photoUrl === '/assets/players/roony.png') {
        updated = true;
        return { ...p, photoUrl: createRealisticPlayerPortrait('HAALAND') };
      }
      return p;
    });
    if (updated) this.savePlayers(players);
    return players;
  },
  savePlayers(players) {
    try {
      localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players));
      try { window.dispatchEvent(new Event('players-updated')); } catch (e) {}
      try { window.dispatchEvent(new Event('storage')); } catch (e) {}
      return players;
    } catch (err) {
      console.warn('LocalStorage savePlayers failed (possible QuotaExceededError), attempting recovery...', err);
      // Clean up and downscale any giant data URLs in all players
      const sanitized = players.map(p => {
        let photo = p.photoUrl;
        let cutout = p.presentationPng;
        // If a photo string is excessively large (> 90KB), replace with realistic portrait or downscale
        if (photo && typeof photo === 'string' && photo.startsWith('data:image') && photo.length > 90000) {
          photo = createRealisticPlayerPortrait(p.name, p.position);
        }
        if (cutout && typeof cutout === 'string' && cutout.startsWith('data:image') && cutout.length > 90000) {
          cutout = '';
        }
        return { ...p, photoUrl: photo, presentationPng: cutout };
      });

      try {
        localStorage.setItem(KEYS.PLAYERS, JSON.stringify(sanitized));
        try { window.dispatchEvent(new Event('players-updated')); } catch (e) {}
        try { window.dispatchEvent(new Event('storage')); } catch (e) {}
        return sanitized;
      } catch (retryErr) {
        console.error('Fatal LocalStorage quota limit reached:', retryErr);
        // Emergency prune: keep only essential fields for players
        const minimalPlayers = sanitized.map(({ id, name, number, position, basePrice, category, status, teamId, soldPrice, photoScale, photoOffsetX, photoOffsetY }) => ({
          id, name, number, position, basePrice, category, status, teamId, soldPrice, photoScale, photoOffsetX, photoOffsetY,
          photoUrl: createRealisticPlayerPortrait(name, position)
        }));
        try {
          localStorage.setItem(KEYS.PLAYERS, JSON.stringify(minimalPlayers));
          return minimalPlayers;
        } catch (e) {
          console.error('LocalStorage completely exhausted:', e);
          return players;
        }
      }
    }
  },

  getAuctionState()      { this.init(); return JSON.parse(localStorage.getItem(KEYS.AUCTION_STATE)); },
  saveAuctionState(state){ 
    localStorage.setItem(KEYS.AUCTION_STATE, JSON.stringify(state)); 
    try { window.dispatchEvent(new Event('auction-state-updated')); } catch (e) {}
    try { window.dispatchEvent(new Event('storage')); } catch (e) {}
    return state; 
  },

  getAuctionHistory()    { this.init(); return JSON.parse(localStorage.getItem(KEYS.AUCTION_HISTORY)) || []; },
  saveAuctionHistory(h)  { 
    localStorage.setItem(KEYS.AUCTION_HISTORY, JSON.stringify(h)); 
    try { window.dispatchEvent(new Event('history-updated')); } catch (e) {}
    try { window.dispatchEvent(new Event('storage')); } catch (e) {}
    try { broadcastBus.publish('AUCTION_HISTORY_UPDATED', h); } catch (e) {}
    return h; 
  },

  getProjectorSettings() {
    try {
      const data = localStorage.getItem(KEYS.PROJECTOR_SETTINGS);
      return data ? { ...DEFAULT_PROJECTOR_SETTINGS, ...JSON.parse(data) } : DEFAULT_PROJECTOR_SETTINGS;
    } catch {
      return DEFAULT_PROJECTOR_SETTINGS;
    }
  },

  saveProjectorSettings(settings) {
    try {
      localStorage.setItem(KEYS.PROJECTOR_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save full projector settings to localStorage (quota exceeded):', e);
      try {
        // Fallback: strip oversized data strings to ensure critical toggles like showSponsors persist
        const safeSettings = { ...settings };
        if (Array.isArray(safeSettings.sponsors)) {
          safeSettings.sponsors = safeSettings.sponsors.map(s => ({
            id: s.id,
            name: s.name,
            imageUrl: typeof s.imageUrl === 'string' && s.imageUrl.length > 300000 ? '' : s.imageUrl
          }));
        }
        localStorage.setItem(KEYS.PROJECTOR_SETTINGS, JSON.stringify(safeSettings));
      } catch (err2) {
        console.error('Projector settings fallback save also failed:', err2);
      }
    }

    // Always dispatch storage and BroadcastChannel events so other tabs update in real-time
    try {
      window.dispatchEvent(new Event('storage'));
      broadcastBus.publish('PROJECTOR_SETTINGS_UPDATED', settings);
    } catch (_) {}
  },

  getCardTheme() {
    try {
      const data = localStorage.getItem(KEYS.CARD_THEME);
      return data ? { ...DEFAULT_CARD_THEME, ...JSON.parse(data) } : DEFAULT_CARD_THEME;
    } catch {
      return DEFAULT_CARD_THEME;
    }
  },

  saveCardTheme(theme) {
    try {
      localStorage.setItem(KEYS.CARD_THEME, JSON.stringify(theme));
      window.dispatchEvent(new Event('card-theme-updated'));
    } catch (e) {
      console.error('Failed to save card theme', e);
    }
  },

  getGkCardTheme() {
    try {
      const data = localStorage.getItem(KEYS.GK_CARD_THEME);
      return data ? { ...DEFAULT_GK_CARD_THEME, ...JSON.parse(data) } : DEFAULT_GK_CARD_THEME;
    } catch {
      return DEFAULT_GK_CARD_THEME;
    }
  },

  saveGkCardTheme(theme) {
    try {
      localStorage.setItem(KEYS.GK_CARD_THEME, JSON.stringify(theme));
      window.dispatchEvent(new Event('card-theme-updated'));
    } catch (e) {
      console.error('Failed to save GK card theme', e);
    }
  },

  getSquadFormat() {
    try {
      const tourn = this.getTournament();
      if (tourn?.squadFormat) return tourn.squadFormat;
      const proj = this.getProjectorSettings();
      if (proj?.squadFormat) return proj.squadFormat;
      return '11s';
    } catch {
      return '11s';
    }
  },

  saveSquadFormat(format) {
    try {
      const tourn = this.getTournament();
      if (tourn) {
        tourn.squadFormat = format;
        this.saveTournament(tourn);
      }
      const proj = this.getProjectorSettings();
      if (proj) {
        proj.squadFormat = format;
        this.saveProjectorSettings(proj);
      }
      window.dispatchEvent(new Event('squad-format-updated'));
      window.dispatchEvent(new Event('storage'));
      return format;
    } catch (e) {
      console.error('Failed to save squad format', e);
      return format;
    }
  },

  getAudioMuted() {
    try {
      return localStorage.getItem(KEYS.AUDIO_MUTED) === 'true';
    } catch {
      return false;
    }
  },

  saveAudioMuted(muted) {
    try {
      const isMuted = Boolean(muted);
      localStorage.setItem(KEYS.AUDIO_MUTED, String(isMuted));
      window.dispatchEvent(new CustomEvent('audio-settings-updated', { detail: { muted: isMuted } }));
      window.dispatchEvent(new Event('storage'));
      return isMuted;
    } catch (e) {
      console.error('Failed to save audio muted state', e);
      return false;
    }
  },

  clearAllData() {
    localStorage.setItem(KEYS.DATA_CLEARED, 'true');
    localStorage.setItem(KEYS.DEMO_WIPED, 'true');
    localStorage.setItem(KEYS.TOURNAMENT, JSON.stringify(DEFAULT_TOURNAMENT));
    localStorage.setItem(KEYS.TEAMS, JSON.stringify([]));
    localStorage.setItem(KEYS.PLAYERS, JSON.stringify([]));
    localStorage.setItem(KEYS.AUCTION_HISTORY, JSON.stringify([]));
    localStorage.setItem(KEYS.AUCTION_STATE, JSON.stringify(INITIAL_AUCTION_STATE));
  }
};
