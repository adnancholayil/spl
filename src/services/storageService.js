// Offline Persistence Engine — SPL Auction Platform
import { createRealisticPlayerPortrait, createTeamLogoSvg } from '../utils/fifaPlayerGenerator';

const KEYS = {
  TOURNAMENT:       'spl_active_tournament',
  TEAMS:            'spl_teams_data',
  PLAYERS:          'spl_players_data',
  AUCTION_STATE:    'spl_auction_live_state',
  AUCTION_HISTORY:  'spl_auction_history',
  AUTH:             'spl_auth_user',
  SETTINGS:         'spl_app_settings',
  PROJECTOR_SETTINGS: 'spl_projector_settings',
  DATA_CLEARED:     'spl_user_cleared_data',
  DEMO_WIPED:       'spl_demo_cleared_wipe_v2'
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
  createdAt: new Date().toISOString()
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
    if (!existingTourn || existingTourn.name !== 'SUPER PREMIER LEAGUE 2026' || existingTourn.currency !== '$') {
      localStorage.setItem(KEYS.TOURNAMENT, JSON.stringify({
        ...(existingTourn || DEFAULT_TOURNAMENT),
        currency: '$',
        minIncrement: 5
      }));
    }

    if (!localStorage.getItem(KEYS.TEAMS)) localStorage.setItem(KEYS.TEAMS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.PLAYERS)) localStorage.setItem(KEYS.PLAYERS, JSON.stringify([]));
    if (!localStorage.getItem(KEYS.AUCTION_STATE)) localStorage.setItem(KEYS.AUCTION_STATE, JSON.stringify(INITIAL_AUCTION_STATE));
    if (!localStorage.getItem(KEYS.AUCTION_HISTORY)) localStorage.setItem(KEYS.AUCTION_HISTORY, JSON.stringify([]));
  },

  getTournament()        { this.init(); return JSON.parse(localStorage.getItem(KEYS.TOURNAMENT)); },
  saveTournament(data)   { localStorage.setItem(KEYS.TOURNAMENT, JSON.stringify(data)); return data; },

  getTeams()             { this.init(); return JSON.parse(localStorage.getItem(KEYS.TEAMS)) || []; },
  saveTeams(teams)       { localStorage.setItem(KEYS.TEAMS, JSON.stringify(teams)); return teams; },

  getPlayers()           { this.init(); return JSON.parse(localStorage.getItem(KEYS.PLAYERS)) || []; },
  savePlayers(players)   { localStorage.setItem(KEYS.PLAYERS, JSON.stringify(players)); return players; },

  getAuctionState()      { this.init(); return JSON.parse(localStorage.getItem(KEYS.AUCTION_STATE)); },
  saveAuctionState(state){ localStorage.setItem(KEYS.AUCTION_STATE, JSON.stringify(state)); return state; },

  getAuctionHistory()    { this.init(); return JSON.parse(localStorage.getItem(KEYS.AUCTION_HISTORY)) || []; },
  saveAuctionHistory(h)  { localStorage.setItem(KEYS.AUCTION_HISTORY, JSON.stringify(h)); return h; },

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
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to save projector settings', e);
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
