import React from 'react';
import { PlayerCardShowcase } from '../components/projector/PlayerCardShowcase';

export const LiveBid = ({ player, teams, currentBid, leadingTeamId, tournament, bidHistory }) => {
  const leadingTeam = teams?.find(t => t.id === leadingTeamId);

  return (
    <PlayerCardShowcase
      player={player}
      tournament={tournament}
      stage="BIDDING"
      currentBid={currentBid}
      leadingTeam={leadingTeam}
      bidHistory={bidHistory}
    />
  );
};
