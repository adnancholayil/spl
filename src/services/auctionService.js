import { storageService } from './storageService';
import { broadcastBus } from '../utils/broadcastChannel';
import { soundEngine } from './soundService';

export const auctionService = {
  getState() {
    return storageService.getAuctionState();
  },

  updateState(partialState, publish = true) {
    const current = storageService.getAuctionState();
    const updated = { ...current, ...partialState };
    storageService.saveAuctionState(updated);
    if (publish) {
      broadcastBus.publish('AUCTION_STATE_UPDATED', updated);
    }
    return updated;
  },

  selectPlayer(playerId) {
    const players = storageService.getPlayers();
    const player = players.find(p => p.id === playerId);
    if (!player) throw new Error('Player not found');

    const state = this.updateState({
      stage: 'INTRO',
      currentPlayerId: playerId,
      currentBid: player.basePrice,
      leadingTeamId: null,
      bidHistory: [],
      timer: 10
    });

    soundEngine.playWhistleSound();
    return state;
  },

  startBidding() {
    return this.updateState({ stage: 'BIDDING' });
  },

  placeBid(teamId, amount) {
    const state = storageService.getAuctionState();
    const teams = storageService.getTeams();
    const players = storageService.getPlayers();

    const team = teams.find(t => t.id === teamId);
    const player = players.find(p => p.id === state.currentPlayerId);

    if (!team) throw new Error('Invalid team');
    if (!player) throw new Error('No active player in auction');
    if (amount < state.currentBid) throw new Error(`Bid amount must be at least $${state.currentBid}`);
    if (amount > team.currentBalance) throw new Error(`Team ${team.name} only has $${team.currentBalance} budget remaining`);

    const newBidRecord = {
      teamId,
      teamName: team.name,
      amount,
      timestamp: Date.now()
    };

    const updatedState = this.updateState({
      currentBid: amount,
      leadingTeamId: teamId,
      bidHistory: [newBidRecord, ...(state.bidHistory || [])],
      timer: 10
    });

    soundEngine.playBidSound();
    return updatedState;
  },

  undoLastBid() {
    const state = storageService.getAuctionState();
    const history = state.bidHistory || [];
    
    if (history.length === 0) {
      throw new Error('No bids to undo for current player');
    }

    const remainingBids = history.slice(1);
    let nextCurrentBid = 0;
    let nextLeadingTeamId = null;

    if (remainingBids.length > 0) {
      const topBid = remainingBids[0];
      nextCurrentBid = topBid.amount;
      nextLeadingTeamId = topBid.teamId;
    } else {
      const player = players.find(p => p.id === state.currentPlayerId);
      nextCurrentBid = player ? player.basePrice : 0;
    }

    const updatedState = this.updateState({
      currentBid: nextCurrentBid,
      leadingTeamId: nextLeadingTeamId,
      bidHistory: remainingBids,
      timer: 10
    });

    return updatedState;
  },

  markSold() {
    const state = storageService.getAuctionState();
    const teams = storageService.getTeams();
    const players = storageService.getPlayers();
    const history = storageService.getAuctionHistory();

    const player = players.find(p => p.id === state.currentPlayerId);
    const leadingTeam = teams.find(t => t.id === state.leadingTeamId);

    if (!player) throw new Error('No active player in auction');
    if (!leadingTeam) throw new Error('Cannot mark SOLD without a leading team bid');

    const finalPrice = state.currentBid;

    // 1. Update player status
    player.status = 'SOLD';
    player.teamId = leadingTeam.id;
    player.soldPrice = finalPrice;
    storageService.savePlayers(players);

    // 2. Update team budget
    leadingTeam.currentBalance -= finalPrice;
    leadingTeam.totalSpent += finalPrice;
    leadingTeam.playersBought += 1;
    storageService.saveTeams(teams);

    // 3. Record auction history
    const historyEntry = {
      id: `hist-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      playerPosition: player.position,
      teamId: leadingTeam.id,
      teamName: leadingTeam.name,
      finalPrice,
      timestamp: new Date().toISOString(),
      status: 'SOLD'
    };

    const updatedHistory = [historyEntry, ...history];
    storageService.saveAuctionHistory(updatedHistory);

    // 4. Update stage to SOLD & play fanfare
    const updatedState = this.updateState({ stage: 'SOLD' });
    soundEngine.playSoldFanfare();

    return { state: updatedState, historyEntry, team: leadingTeam, player };
  },

  triggerSigning() {
    return this.updateState({ stage: 'SIGNING' });
  },

  markUnsold() {
    const state = storageService.getAuctionState();
    const players = storageService.getPlayers();
    const history = storageService.getAuctionHistory();

    const player = players.find(p => p.id === state.currentPlayerId);
    if (!player) throw new Error('No active player in auction');

    player.status = 'UNSOLD';
    storageService.savePlayers(players);

    const historyEntry = {
      id: `hist-${Date.now()}`,
      playerId: player.id,
      playerName: player.name,
      playerPosition: player.position,
      teamId: null,
      teamName: 'Unsold',
      finalPrice: 0,
      timestamp: new Date().toISOString(),
      status: 'UNSOLD'
    };

    storageService.saveAuctionHistory([historyEntry, ...history]);
    const updatedState = this.updateState({ stage: 'UNSOLD' });
    soundEngine.playUnsoldSound();

    return { state: updatedState, player };
  },

  revertLastAuction() {
    const history = storageService.getAuctionHistory();
    if (history.length === 0) throw new Error('No auction history to revert');

    const lastRecord = history[0];
    const remainingHistory = history.slice(1);
    storageService.saveAuctionHistory(remainingHistory);

    const players = storageService.getPlayers();
    const player = players.find(p => p.id === lastRecord.playerId);
    if (player) {
      player.status = 'UPCOMING';
      player.teamId = null;
      player.soldPrice = 0;
      storageService.savePlayers(players);
    }

    if (lastRecord.status === 'SOLD' && lastRecord.teamId) {
      const teams = storageService.getTeams();
      const team = teams.find(t => t.id === lastRecord.teamId);
      if (team) {
        team.currentBalance += lastRecord.finalPrice;
        team.totalSpent -= lastRecord.finalPrice;
        team.playersBought = Math.max(0, team.playersBought - 1);
        storageService.saveTeams(teams);
      }
    }

    const resetState = this.updateState({
      stage: 'IDLE',
      currentPlayerId: null,
      currentBid: 0,
      leadingTeamId: null,
      bidHistory: []
    });

    return resetState;
  },

  resetAllTransfers() {
    // 1. Clear auction history ledger
    storageService.saveAuctionHistory([]);

    // 2. Reset all players that were SOLD or UNSOLD back to UPCOMING
    const players = storageService.getPlayers();
    const updatedPlayers = players.map(p => {
      if (p.status === 'SOLD' || p.status === 'UNSOLD' || p.teamId || p.soldPrice) {
        return {
          ...p,
          status: 'UPCOMING',
          teamId: null,
          soldPrice: 0
        };
      }
      return p;
    });
    storageService.savePlayers(updatedPlayers);

    // 3. Reset all team budgets & spent counters back to startingBudget
    const teams = storageService.getTeams();
    const tournament = storageService.getTournament();
    const defaultBudget = tournament?.defaultBudget || 5000;
    const updatedTeams = teams.map(t => {
      const starting = (typeof t.startingBudget === 'number' && t.startingBudget > 0)
        ? t.startingBudget
        : ((typeof t.currentBalance === 'number' && typeof t.totalSpent === 'number' && (t.currentBalance + t.totalSpent) > 0)
            ? t.currentBalance + t.totalSpent
            : defaultBudget);
      return {
        ...t,
        startingBudget: starting,
        currentBalance: starting,
        totalSpent: 0,
        playersBought: 0
      };
    });
    storageService.saveTeams(updatedTeams);

    // 4. Reset live auction state to IDLE
    const resetState = this.updateState({
      stage: 'IDLE',
      currentPlayerId: null,
      currentBid: 0,
      leadingTeamId: null,
      bidHistory: [],
      timer: 10
    });

    try {
      soundEngine.playFeedbackTone();
    } catch (_) {}

    try {
      window.dispatchEvent(new Event('history-updated'));
      window.dispatchEvent(new Event('teams-updated'));
      window.dispatchEvent(new Event('players-updated'));
      window.dispatchEvent(new Event('storage'));
      broadcastBus.publish('TRANSFERS_RESET', {});
    } catch (e) {
      console.warn('Error dispatching transfer reset events:', e);
    }

    return { success: true, state: resetState };
  },

  revertTransferById(historyId) {
    const history = storageService.getAuctionHistory();
    const targetRecord = history.find(h => h.id === historyId);
    if (!targetRecord) throw new Error('Transfer record not found');

    const remainingHistory = history.filter(h => h.id !== historyId);
    storageService.saveAuctionHistory(remainingHistory);

    // Reset player back to UPCOMING
    if (targetRecord.playerId) {
      const players = storageService.getPlayers();
      const player = players.find(p => p.id === targetRecord.playerId);
      if (player) {
        player.status = 'UPCOMING';
        player.teamId = null;
        player.soldPrice = 0;
        storageService.savePlayers(players);
      }
    }

    // Refund team budget if SOLD
    if (targetRecord.status === 'SOLD' && targetRecord.teamId) {
      const teams = storageService.getTeams();
      const team = teams.find(t => t.id === targetRecord.teamId);
      if (team) {
        team.currentBalance += (targetRecord.finalPrice || 0);
        team.totalSpent = Math.max(0, (team.totalSpent || 0) - (targetRecord.finalPrice || 0));
        team.playersBought = Math.max(0, (team.playersBought || 1) - 1);
        storageService.saveTeams(teams);
      }
    }

    // If live auction was currently showing this player, reset to IDLE
    const state = storageService.getAuctionState();
    if (state.currentPlayerId === targetRecord.playerId) {
      this.updateState({
        stage: 'IDLE',
        currentPlayerId: null,
        currentBid: 0,
        leadingTeamId: null,
        bidHistory: []
      });
    }

    try {
      soundEngine.playFeedbackTone();
    } catch (_) {}

    try {
      window.dispatchEvent(new Event('history-updated'));
      window.dispatchEvent(new Event('teams-updated'));
      window.dispatchEvent(new Event('players-updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    return { success: true, record: targetRecord };
  }
};
