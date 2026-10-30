import React from 'react';
import { Tv, RefreshCw, AlertTriangle } from 'lucide-react';
import { storageService } from '../../services/storageService';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Projector ErrorBoundary caught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetSettings = () => {
    try {
      storageService.saveProjectorSettings({
        mode: 'AUTO',
        showManagerBalance: true,
        showLiveTicker: true,
        showSquadSummary: true,
        showPlayerAttributes: true,
        showBasePrice: true,
        showSoldBadge: true,
        showTeamLogos: true,
        screenTheme: 'DEFAULT',
        bgImage: '',
        showLogoOnHomeMedia: true,
        logoBackgroundBadge: true
      });
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="w-full h-full flex flex-col items-center justify-center p-8 select-none text-center"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, #0c1527 0%, #060913 100%)',
            color: '#ffffff',
            minHeight: '100vh',
            fontFamily: 'var(--font-body)'
          }}
        >
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-6 shadow-xl shadow-amber-500/10">
            <Tv className="w-8 h-8 text-amber-400" />
          </div>

          <h1 
            className="text-3xl font-black uppercase tracking-wider text-white mb-2"
            style={{ fontFamily: 'var(--font-broadcast)' }}
          >
            Projector Broadcast Engine
          </h1>

          <p className="text-slate-400 max-w-md text-sm mb-6 font-medium">
            The projector screen encountered a display issue ({this.state.error?.message || 'Unexpected display exception'}). Click below to reconnect the live broadcast feed.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={this.handleReload}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reconnect Broadcast
            </button>

            <button
              onClick={this.handleResetSettings}
              className="px-4 py-2.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-slate-300 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Reset Visuals
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
