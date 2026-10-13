import React, { useState } from 'react';
import { useTournament } from '../../context/TournamentContext';
import { storageService } from '../../services/storageService';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Download, Upload, RotateCcw, AlertTriangle, Zap, CheckCircle2, Trash2, Users, Palette, Tv } from 'lucide-react';
import { generateMockData } from '../../utils/mockDataGenerator';
import { createRealisticPlayerPortrait } from '../../utils/fifaPlayerGenerator';
import { useNavigate } from 'react-router-dom';
export const Settings = () => {
  const { refreshData } = useTournament();
  const navigate = useNavigate();

  // Custom Modal State
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    type: 'danger',
    isAlert: false,
    onConfirm: null
  });

  const closeModal = () => setModalConfig(prev => ({ ...prev, isOpen: false }));

  const showAlert = (title, message, type = 'info') => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      confirmText: 'OK',
      type,
      isAlert: true,
      onConfirm: null
    });
  };

  const showConfirm = ({ title, message, confirmText, type = 'danger', onConfirm }) => {
    setModalConfig({
      isOpen: true,
      title,
      message,
      confirmText: confirmText || 'Confirm',
      cancelText: 'Cancel',
      type,
      isAlert: false,
      onConfirm
    });
  };


  const handleExportJSON = () => {
    const data = {
      tournament: storageService.getTournament(),
      teams: storageService.getTeams(),
      players: storageService.getPlayers(),
      auctionState: storageService.getAuctionState(),
      auctionHistory: storageService.getAuctionHistory(),
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `spl_backup_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target.result);
          if (parsed.tournament && parsed.teams && parsed.players) {
            storageService.saveTournament(parsed.tournament);
            storageService.saveTeams(parsed.teams);
            storageService.savePlayers(parsed.players);
            if (parsed.auctionHistory) storageService.saveAuctionHistory(parsed.auctionHistory);
            refreshData();
            showAlert('Import Successful', 'Tournament data and squad backups imported successfully!', 'success');
          } else {
            showAlert('Import Failed', 'Invalid backup file format. Required keys (tournament, teams, players) missing.', 'danger');
          }
        } catch {
          showAlert('Import Error', 'Failed to parse JSON backup file. Please ensure it is valid JSON.', 'danger');
        }
      };
      reader.readAsText(file);
    }
  };


  const handleClearAll = () => {
    showConfirm({
      title: 'Clear All System Data',
      message: 'PERMANENT ACTION: This will completely wipe all teams, players, auction bids, and history (0 teams, 0 players).',
      confirmText: 'Wipe Everything',
      type: 'danger',
      onConfirm: () => {
        storageService.clearAllData();
        refreshData();
        showAlert('System Wiped', 'All teams, players, and auction history have been cleared to an empty slate.', 'info');
      }
    });
  };

  const handleLoadMockData = () => {
    showConfirm({
      title: 'Load Realistic Mock Data',
      message: 'This will add several realistic top clubs and world-class players to your current database. Proceed?',
      confirmText: 'Load Data',
      type: 'info',
      onConfirm: () => {
        const { teams, players } = generateMockData();
        
        // Append teams
        const existingTeams = storageService.getTeams();
        const newTeams = [...existingTeams, ...teams];
        storageService.saveTeams(newTeams);

        // Append players with generated portraits
        const existingPlayers = storageService.getPlayers();
        const playersWithPortraits = players.map(p => ({
          ...p,
          photoUrl: createRealisticPlayerPortrait(p.name, p.position)
        }));
        
        const newPlayers = [...existingPlayers, ...playersWithPortraits];
        storageService.savePlayers(newPlayers);
        
        refreshData();
        showAlert('Data Loaded', 'Successfully added mock teams and players!', 'success');
      }
    });
  };

  return (
    <div style={{ padding: '32px 40px', maxWidth: 880, margin: '0 auto' }}>

      {/* Broadcast Confirm Modal */}
      <ConfirmModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        onConfirm={modalConfig.onConfirm}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        cancelText={modalConfig.cancelText}
        type={modalConfig.type}
        isAlert={modalConfig.isAlert}
      />

      <div style={{ marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700, color: 'var(--spl-blue-light)', letterSpacing: '0.25em', marginBottom: 8, textTransform: 'uppercase' }}>
          SYSTEM CONFIGURATION & BACKUPS
        </div>
        <h1 style={{ fontFamily: 'var(--font-broadcast)', fontSize: 'clamp(32px, 4vw, 48px)', color: '#fff', lineHeight: 0.95, textTransform: 'uppercase' }}>
          Settings & Data
        </h1>
      </div>


      {/* Data management */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 36 }}>
        {/* Export */}
        <button
          onClick={handleExportJSON}
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, padding: '22px 24px', cursor: 'pointer', textAlign: 'left',
            transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--spl-blue)'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--spl-panel)'; }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 8, flexShrink: 0,
            background: 'rgba(26,86,219,0.15)', border: '1px solid rgba(26,86,219,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Download className="w-6 h-6" style={{ color: 'var(--spl-blue-light)' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
              Export Complete Backup (.JSON)
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Download all tournament configuration, clubs, player rosters, and auction history into a backup JSON file.
            </div>
          </div>
        </button>

        {/* Import */}
        <label
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, padding: '22px 24px', cursor: 'pointer',
            transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22C55E'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--spl-panel)'; }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 8, flexShrink: 0,
            background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Upload className="w-6 h-6" style={{ color: '#22C55E' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
              Import Tournament JSON Backup
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Restore tournament settings, clubs, and squad rosters from a previously exported backup file.
            </div>
          </div>
          <input type="file" accept=".json" onChange={handleImportJSON} style={{ display: 'none' }} />
        </label>

        {/* Card Customization */}
        <button
          onClick={() => navigate('/admin/card-customization')}
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, padding: '22px 24px', cursor: 'pointer', textAlign: 'left',
            transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#A855F7'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--spl-panel)'; }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 8, flexShrink: 0,
            background: 'rgba(168, 85, 247, 0.15)', border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Palette className="w-6 h-6" style={{ color: '#A855F7' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
              Player Card Customization
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
              100% customize the primary card theme design, gradients, borders, and typography.
            </div>
          </div>
        </button>

        {/* Projector Customization */}
        <button
          onClick={() => navigate('/admin/projector-customization')}
          style={{
            display: 'flex', alignItems: 'center', gap: 20,
            background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, padding: '22px 24px', cursor: 'pointer', textAlign: 'left',
            transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#0EA5E9'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--spl-panel)'; }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 8, flexShrink: 0,
            background: 'rgba(14, 165, 233, 0.15)', border: '1px solid rgba(14, 165, 233, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Tv className="w-6 h-6" style={{ color: '#0EA5E9' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
              Projector Screen Customization
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Customize the live screen background image, filter gradients, opacity, and ambient shadows.
            </div>
          </div>
        </button>
      </div>

      {/* Demo Data Zone */}
      <div style={{ marginBottom: 36 }}>
        <button
          onClick={handleLoadMockData}
          style={{
            display: 'flex', alignItems: 'center', gap: 20, width: '100%',
            background: 'var(--spl-panel)', border: '1px solid var(--border-subtle)',
            borderRadius: 10, padding: '22px 24px', cursor: 'pointer', textAlign: 'left',
            transition: 'border-color 0.15s, background 0.15s, transform 0.1s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--spl-blue)'; e.currentTarget.style.background = 'var(--spl-elevated)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'var(--spl-panel)'; }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 8, flexShrink: 0,
            background: 'rgba(234, 179, 8, 0.15)', border: '1px solid rgba(234, 179, 8, 0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Users className="w-6 h-6" style={{ color: '#EAB308' }} />
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 4 }}>
              Load Realistic Demo Data
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)' }}>
              Populate your database with top-tier clubs and world-class players for testing and demonstration.
            </div>
          </div>
        </button>
      </div>

      {/* Danger zone */}
      <div style={{
        background: 'rgba(220,38,38,0.06)',
        border: '1px solid rgba(220,38,38,0.25)',
        borderRadius: 10, padding: '24px 28px',
        display: 'flex', flexDirection: 'column', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <AlertTriangle className="w-5 h-5" style={{ color: '#EF4444' }} />
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 700, color: '#EF4444', letterSpacing: '0.15em' }}>
            DANGER ZONE
          </span>
        </div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
          Perform complete database resets or wipe all system data. This will wipe all teams, players, bids, and transfer history.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <button
            onClick={handleClearAll}
            className="btn-danger"
            style={{ padding: '11px 22px', fontSize: 13, gap: 8, background: '#dc2626', color: '#fff' }}
          >
            <Trash2 className="w-4 h-4" />
            Clear All System Data
          </button>
        </div>
      </div>
    </div>
  );
};
