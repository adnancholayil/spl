import React from 'react';
import { PlayerCardShowcase } from '../components/projector/PlayerCardShowcase';

export const UnsoldAnimation = ({ player, tournament }) => {
  return (
    <PlayerCardShowcase
      player={player}
      tournament={tournament}
      stage="UNSOLD"
    />
  );
};
