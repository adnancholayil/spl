import React, { createContext, useContext, useState, useEffect } from 'react';
import { tournamentService } from '../services/tournamentService';
import { teamService } from '../services/teamService';
import { playerService } from '../services/playerService';
import { storageService } from '../services/storageService';

const TournamentContext = createContext(null);

export const TournamentProvider = ({ children }) => {
  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [players, setPlayers] = useState([]);
  const [history, setHistory] = useState([]);

  const refreshData = () => {
    setTournament(tournamentService.getTournament());
    setTeams(teamService.getTeams());
    setPlayers(playerService.getPlayers());
    setHistory(storageService.getAuctionHistory());
  };

  useEffect(() => {
    refreshData();
  }, []);

  const updateTournament = (updates) => {
    const updated = tournamentService.updateTournament(updates);
    setTournament(updated);
    return updated;
  };

  const addTeam = (teamData) => {
    const newTeam = teamService.createTeam(teamData);
    setTeams(teamService.getTeams());
    return newTeam;
  };

  const updateTeam = (id, updates) => {
    const updated = teamService.updateTeam(id, updates);
    setTeams(teamService.getTeams());
    return updated;
  };

  const deleteTeam = (id) => {
    teamService.deleteTeam(id);
    setTeams(teamService.getTeams());
  };

  const addPlayer = (playerData) => {
    const newPlayer = playerService.createPlayer(playerData);
    setPlayers(playerService.getPlayers());
    return newPlayer;
  };

  const updatePlayer = (id, updates) => {
    const updated = playerService.updatePlayer(id, updates);
    setPlayers(playerService.getPlayers());
    return updated;
  };

  const deletePlayer = (id) => {
    playerService.deletePlayer(id);
    setPlayers(playerService.getPlayers());
  };

  const importBulkPlayers = (list) => {
    const imported = playerService.importBulkPlayers(list);
    setPlayers(playerService.getPlayers());
    return imported;
  };

  const resetAllData = () => {
    storageService.resetAllData();
    refreshData();
  };

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        teams,
        players,
        history,
        refreshData,
        updateTournament,
        addTeam,
        updateTeam,
        deleteTeam,
        addPlayer,
        updatePlayer,
        deletePlayer,
        importBulkPlayers,
        resetAllData
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
};

export const useTournament = () => useContext(TournamentContext);
