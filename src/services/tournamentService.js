import { storageService } from './storageService';

export const tournamentService = {
  getTournament() {
    return storageService.getTournament();
  },

  updateTournament(updates) {
    const current = storageService.getTournament();
    const updated = { ...current, ...updates };
    return storageService.saveTournament(updated);
  }
};
