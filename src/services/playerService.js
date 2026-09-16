import { storageService } from './storageService';
import { createRealisticPlayerPortrait } from '../utils/fifaPlayerGenerator';

export const playerService = {
  getPlayers() {
    return storageService.getPlayers();
  },

  getPlayerById(id) {
    const players = storageService.getPlayers();
    return players.find(p => p.id === id);
  },

  createPlayer(playerData) {
    const players = storageService.getPlayers();
    const finalPhoto = playerData.photoUrl && playerData.photoUrl.trim() !== ''
      ? playerData.photoUrl
      : createRealisticPlayerPortrait(playerData.name || 'Player', playerData.position || 'ST');

    const newPlayer = {
      id: `p-${Date.now()}`,
      status: 'UPCOMING',
      teamId: null,
      soldPrice: 0,
      presentationPng: playerData.presentationPng || '',
      photoScale: playerData.photoScale || 1,
      ...playerData,
      photoUrl: finalPhoto
    };

    players.push(newPlayer);
    storageService.savePlayers(players);
    return newPlayer;
  },

  updatePlayer(id, updates) {
    const players = storageService.getPlayers();
    const index = players.findIndex(p => p.id === id);
    if (index !== -1) {
      const existing = players[index];
      const finalPhoto = updates.photoUrl && updates.photoUrl.trim() !== ''
        ? updates.photoUrl
        : (existing.photoUrl || createRealisticPlayerPortrait(updates.name || existing.name, updates.position || existing.position || 'ST'));

      players[index] = {
        ...existing,
        ...updates,
        photoUrl: finalPhoto,
        presentationPng: updates.presentationPng !== undefined ? updates.presentationPng : (existing.presentationPng || ''),
        photoScale: updates.photoScale !== undefined ? updates.photoScale : (existing.photoScale || 1)
      };
      storageService.savePlayers(players);
      return players[index];
    }
    throw new Error('Player not found');
  },

  deletePlayer(id) {
    let players = storageService.getPlayers();
    players = players.filter(p => p.id !== id);
    storageService.savePlayers(players);
  },

  parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const imported = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      if (values.length >= 2) {
        const name = values[headers.indexOf('name')] || values[0];
        const position = values[headers.indexOf('position')] || values[1] || 'ST';
        const basePrice = parseInt(values[headers.indexOf('baseprice')] || values[2] || '500', 10);
        const number = parseInt(values[headers.indexOf('number')] || values[3] || `${i}`, 10);

        imported.push({
          name,
          position: position.toUpperCase(),
          basePrice: isNaN(basePrice) ? 500 : basePrice,
          number: isNaN(number) ? i : number,
          category: position.includes('GK') ? 'Goalkeeper' : position.includes('B') ? 'Defender' : position.includes('M') ? 'Midfielder' : 'Forward'
        });
      }
    }
    return imported;
  },

  importBulkPlayers(playersList) {
    const existing = storageService.getPlayers();
    const formatted = playersList.map((p, idx) => ({
      id: `p-${Date.now()}-${idx}`,
      name: p.name,
      number: p.number || (idx + 1),
      position: p.position || 'ST',
      basePrice: p.basePrice || 500,
      category: p.category || 'Forward',
      shortBio: p.shortBio || 'Recruited for tournament squad.',
      photoUrl: p.photoUrl || createRealisticPlayerPortrait(p.name, p.position || 'ST'),
      presentationPng: p.presentationPng || '',
      status: 'UPCOMING',
      teamId: null,
      soldPrice: 0
    }));

    const combined = [...existing, ...formatted];
    storageService.savePlayers(combined);
    return formatted;
  }
};
