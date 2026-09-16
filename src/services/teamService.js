import { storageService } from './storageService';

export const teamService = {
  getTeams() {
    return storageService.getTeams();
  },

  getTeamById(id) {
    const teams = storageService.getTeams();
    return teams.find(t => t.id === id);
  },

  createTeam(teamData) {
    const teams = storageService.getTeams();
    const newTeam = {
      id: `team-${Date.now()}`,
      startingBudget: teamData.startingBudget || 5000,
      currentBalance: teamData.startingBudget || 5000,
      totalSpent: 0,
      playersBought: 0,
      ...teamData
    };
    teams.push(newTeam);
    storageService.saveTeams(teams);
    return newTeam;
  },

  updateTeam(id, updates) {
    const teams = storageService.getTeams();
    const index = teams.findIndex(t => t.id === id);
    if (index !== -1) {
      teams[index] = { ...teams[index], ...updates };
      storageService.saveTeams(teams);
      return teams[index];
    }
    throw new Error('Team not found');
  },

  deleteTeam(id) {
    let teams = storageService.getTeams();
    teams = teams.filter(t => t.id !== id);
    storageService.saveTeams(teams);
  }
};
