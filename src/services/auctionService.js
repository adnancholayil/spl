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
  }
};
