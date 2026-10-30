import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auctionService } from '../services/auctionService';
import { storageService } from '../services/storageService';
import { broadcastBus } from '../utils/broadcastChannel';
import { useTournament } from './TournamentContext';

const AuctionContext = createContext(null);

export const AuctionProvider = ({ children }) => {
  const { refreshData } = useTournament();
  const [auctionState, setAuctionState] = useState(() => auctionService.getState());
  const [timerActive, setTimerActive] = useState(false);

  useEffect(() => {
    const handleUpdate = () => {
      setAuctionState(auctionService.getState());
      refreshData();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('auction-state-updated', handleUpdate);

    // Listen for cross-tab broadcast state changes
    const unsubscribe = broadcastBus.subscribe((msg) => {
      if (msg?.type === 'AUCTION_STATE_UPDATED' || msg?.type === 'TRANSFERS_RESET' || msg?.type === 'AUCTION_HISTORY_UPDATED') {
        setAuctionState(auctionService.getState());
        refreshData();
      }
    });

    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('auction-state-updated', handleUpdate);
      unsubscribe();
    };
  }, [refreshData]);

  const selectPlayer = (playerId) => {
    const newState = auctionService.selectPlayer(playerId);
    setAuctionState(newState);
    refreshData();
  };

  const startBidding = () => {
    const newState = auctionService.startBidding();
    setAuctionState(newState);
  };

  const placeBid = (teamId, amount) => {
    const newState = auctionService.placeBid(teamId, amount);
    setAuctionState(newState);
  };

  const markSold = () => {
    const result = auctionService.markSold();
    setAuctionState(result.state);
    refreshData();
    return result;
  };

  const triggerSigning = () => {
    const newState = auctionService.triggerSigning();
    setAuctionState(newState);
  };

  const markUnsold = () => {
    const result = auctionService.markUnsold();
    setAuctionState(result.state);
    refreshData();
    return result;
  };

  const revertLastAuction = () => {
    const newState = auctionService.revertLastAuction();
    setAuctionState(newState);
    refreshData();
  };

  const undoLastBid = () => {
    const newState = auctionService.undoLastBid();
    setAuctionState(newState);
  };

  const nextStage = () => {
    const { stage } = auctionState;
    if (stage === 'INTRO') {
      startBidding();
    } else if (stage === 'SOLD') {
      triggerSigning();
    } else if (stage === 'SIGNING' || stage === 'UNSOLD') {
      const allPlayers = storageService.getPlayers();
      const next = allPlayers.find(p => !p.status || p.status === 'UPCOMING');
      if (next) {
        selectPlayer(next.id);
      }
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        auctionState,
        selectPlayer,
        startBidding,
        placeBid,
        markSold,
        triggerSigning,
        markUnsold,
        revertLastAuction,
        undoLastBid,
        nextStage
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
};

export const useAuction = () => useContext(AuctionContext);
