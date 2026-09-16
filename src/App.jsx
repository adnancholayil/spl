import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TournamentProvider } from './context/TournamentContext';
import { AuctionProvider } from './context/AuctionContext';

import { Login } from './pages/auth/Login';
import { AdminLayout } from './layouts/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { TournamentSetup } from './pages/admin/TournamentSetup';
import { Teams } from './pages/admin/Teams';
import { Players } from './pages/admin/Players';
import { Auction } from './pages/admin/Auction';
import { AuctionHistory } from './pages/admin/AuctionHistory';
import { Settings } from './pages/admin/Settings';
import { ProjectorControl } from './pages/admin/ProjectorControl';
import { ProjectorScreen } from './pages/projector/ProjectorScreen';

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) return null;
  if (!currentUser) return <Navigate to="/login" replace />;
  return children;
};

export function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <AuctionProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/projector" element={<ProjectorScreen />} />

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="setup" element={<TournamentSetup />} />
                <Route path="teams" element={<Teams />} />
                <Route path="players" element={<Players />} />
                <Route path="auction" element={<Auction />} />
                <Route path="history" element={<AuctionHistory />} />
                <Route path="projector-control" element={<ProjectorControl />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Default Redirect */}
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </Router>
        </AuctionProvider>
      </TournamentProvider>
    </AuthProvider>
  );
}

export default App;
