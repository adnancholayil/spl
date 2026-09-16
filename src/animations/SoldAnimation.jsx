import React from 'react';
import { PlayerCardShowcase } from '../components/projector/PlayerCardShowcase';

export const SoldAnimation = ({ player, winningTeam, finalPrice, tournament }) => {
  return (
    <PlayerCardShowcase
      player={player}
      tournament={tournament}
      stage="SOLD"
      winningTeam={winningTeam}
      finalPrice={finalPrice}
    />
  );
};
