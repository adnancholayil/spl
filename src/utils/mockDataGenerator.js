export const generateMockData = () => {
  const teams = [
    {
      id: 'team-1',
      name: 'Manchester United',
      shortName: 'MUN',
      managerName: 'Erik ten Hag',
      logoUrl: '', // Will be generated or left blank to use svg generator
      managerPhotoUrl: '',
      primaryColor: '#DA291C',
      secondaryColor: '#000000',
      startingBudget: 50000,
      currentBalance: 50000,
      totalSpent: 0,
      playersBought: 0
    },
    {
      id: 'team-2',
      name: 'Real Madrid',
      shortName: 'RMA',
      managerName: 'Carlo Ancelotti',
      logoUrl: '',
      managerPhotoUrl: '',
      primaryColor: '#FFFFFF',
      secondaryColor: '#FEBE10',
      startingBudget: 60000,
      currentBalance: 60000,
      totalSpent: 0,
      playersBought: 0
    },
    {
      id: 'team-3',
      name: 'Bayern Munich',
      shortName: 'BAY',
      managerName: 'Thomas Tuchel',
      logoUrl: '',
      managerPhotoUrl: '',
      primaryColor: '#DC052D',
      secondaryColor: '#0066B2',
      startingBudget: 45000,
      currentBalance: 45000,
      totalSpent: 0,
      playersBought: 0
    },
    {
      id: 'team-4',
      name: 'Paris Saint-Germain',
      shortName: 'PSG',
      managerName: 'Luis Enrique',
      logoUrl: '',
      managerPhotoUrl: '',
      primaryColor: '#004170',
      secondaryColor: '#DA291C',
      startingBudget: 70000,
      currentBalance: 70000,
      totalSpent: 0,
      playersBought: 0
    }
  ];

  const playersData = [
    { name: 'Lionel Messi', position: 'RW', basePrice: 5000, number: 10, category: 'Forward', shortBio: 'Considered one of the greatest of all time.' },
    { name: 'Cristiano Ronaldo', position: 'ST', basePrice: 4800, number: 7, category: 'Forward', shortBio: 'Legendary goalscorer and physical specimen.' },
    { name: 'Kylian Mbappé', position: 'ST', basePrice: 6000, number: 9, category: 'Forward', shortBio: 'Lightning fast attacker with clinical finishing.' },
    { name: 'Kevin De Bruyne', position: 'CM', basePrice: 5500, number: 17, category: 'Midfielder', shortBio: 'Masterful playmaker with incredible vision.' },
    { name: 'Erling Haaland', position: 'ST', basePrice: 5800, number: 9, category: 'Forward', shortBio: 'A true number 9 with unmatched physical power.' },
    { name: 'Virgil van Dijk', position: 'CB', basePrice: 4000, number: 4, category: 'Defender', shortBio: 'A towering presence in defense.' },
    { name: 'Thibaut Courtois', position: 'GK', basePrice: 3500, number: 1, category: 'Goalkeeper', shortBio: 'Elite shot-stopper with great reflexes.' },
    { name: 'Vinícius Júnior', position: 'LW', basePrice: 5200, number: 7, category: 'Forward', shortBio: 'Skillful winger known for his flair.' },
    { name: 'Luka Modrić', position: 'CM', basePrice: 3000, number: 10, category: 'Midfielder', shortBio: 'Ageless maestro who dictates the tempo.' },
    { name: 'Jude Bellingham', position: 'CAM', basePrice: 5500, number: 5, category: 'Midfielder', shortBio: 'Dynamic and powerful box-to-box presence.' },
    { name: 'Mohamed Salah', position: 'RW', basePrice: 4500, number: 11, category: 'Forward', shortBio: 'Prolific winger with a lethal left foot.' },
    { name: 'Ruben Dias', position: 'CB', basePrice: 3800, number: 3, category: 'Defender', shortBio: 'Defensive rock and natural leader.' },
    { name: 'Alisson Becker', position: 'GK', basePrice: 3300, number: 1, category: 'Goalkeeper', shortBio: 'Commanding presence and excellent distribution.' },
    { name: 'Rodri', position: 'CDM', basePrice: 4200, number: 16, category: 'Midfielder', shortBio: 'The engine and anchor of the midfield.' },
    { name: 'Bukayo Saka', position: 'RW', basePrice: 4000, number: 7, category: 'Forward', shortBio: 'Explosive talent on the right flank.' }
  ];

  const players = playersData.map((p, index) => ({
    id: `p-mock-${Date.now()}-${index}`,
    name: p.name,
    number: p.number,
    position: p.position,
    basePrice: p.basePrice,
    category: p.category,
    shortBio: p.shortBio,
    photoUrl: '', // Let generator handle it
    presentationPng: '',
    status: 'UPCOMING',
    teamId: null,
    soldPrice: 0,
    photoScale: 1
  }));

  return { teams, players };
};
