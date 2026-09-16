import React from 'react';
import { PlayerCardShowcase } from '../components/projector/PlayerCardShowcase';

export const PlayerIntro = ({ player, tournament }) => {
  if (!player) return null;

  return (
    <PlayerCardShowcase
      player={player}
      tournament={tournament}
      stage="INTRO"
    />
  );
};
