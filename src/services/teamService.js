import { storageService } from './storageService';

/**
 * Standard auto-generated 3-character club code from club name
 * e.g. "Super Villa" -> "SVI", "Manchester United" -> "MUN", "Arsenal" -> "ARS"
 */
export const generateTeamCode = (name) => {
  if (!name || typeof name !== 'string') return '';
  const clean = name.trim().replace(/[^a-zA-Z0-9\s]/g, '');
  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length === 0) return '';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  if (words.length === 2) {
    const part1 = words[0][0];
    const part2 = words[1].length >= 2 ? words[1].slice(0, 2) : words[1];
    const code = (part1 + part2).toUpperCase();
    return code.length < 3 && words[0].length >= 2 ? (words[0].slice(0, 2) + words[1][0]).toUpperCase() : code;
  }
  return words.map(w => w[0]).join('').slice(0, 4).toUpperCase();
};

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
    const shortName = (teamData.shortName && teamData.shortName.trim())
      ? teamData.shortName.trim().toUpperCase()
      : (generateTeamCode(teamData.name) || 'CLUB');

    const newTeam = {
      id: `team-${Date.now()}`,
      startingBudget: teamData.startingBudget || 5000,
      currentBalance: teamData.startingBudget || 5000,
      totalSpent: 0,
      playersBought: 0,
      ...teamData,
      shortName
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
