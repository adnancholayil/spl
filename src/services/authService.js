import { storageService } from './storageService';

const DEMO_USERS = [
  {
    id: 'usr-1',
    email: 'admin@example.com',
    password: 'admin123',
    name: 'Platform Admin',
    role: 'ADMIN'
  },
  {
    id: 'usr-2',
    email: 'host@example.com',
    password: 'host123',
    name: 'Auction Conductor',
    role: 'CONDUCTOR'
  }
];

export const authService = {
  async login(email, password) {
    // Offline authentication mode
    const user = DEMO_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (user) {
      const authData = {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      };
      localStorage.setItem('spl_auth_user', JSON.stringify(authData));
      return authData;
    }

    throw new Error('Invalid credentials.');
  },

  getCurrentUser() {
    const raw = localStorage.getItem('spl_auth_user');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  logout() {
    localStorage.removeItem('spl_auth_user');
  }
};
