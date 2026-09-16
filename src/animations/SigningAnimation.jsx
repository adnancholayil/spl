import React from 'react';
import { PlayerCardShowcase } from '../components/projector/PlayerCardShowcase';

export const SigningAnimation = ({ player, winningTeam, finalPrice, tournament }) => {
  return (
    <PlayerCardShowcase
      player={player}
      tournament={tournament}
      stage="SIGNING"
      winningTeam={winningTeam}
      finalPrice={finalPrice}
    />
  );
};
