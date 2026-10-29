import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTournament } from '../../context/TournamentContext';
import { useAuction } from '../../context/AuctionContext';
import { formatCurrency } from '../../utils/currency';
import { EFootballCard } from '../../components/common/EFootballCard';
import {
  Gavel, ArrowRight, CheckCircle2, Clock, Users,
  TrendingUp, Crown, Trophy, Shield, ArrowUpRight,
  Radio, Sparkles, ChevronRight
} from 'lucide-react';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { tournament, teams, players, history } = useTournament();
  const { auctionState } = useAuction();

  const soldPlayers      = players.filter(p => p.status === 'SOLD');
  const remainingPlayers = players.filter(p => p.status === 'UPCOMING');
  const totalSpent       = teams.reduce((acc, t) => acc + (t.totalSpent || 0), 0);
  const highestBid       = history.length > 0 ? Math.max(...history.map(h => h.finalPrice || 0)) : 0;
  const topTeam          = [...teams].sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))[0];

  // Active or upcoming featured player
  const livePlayer = players.find(p => p.id === auctionState?.currentPlayerId);
  const isAuctionLive = Boolean(livePlayer && auctionState?.status === 'BIDDING');
  const featuredPlayer = livePlayer || remainingPlayers[0] || players[0];

  const recentTransfers = history.filter(h => h.status === 'SOLD').slice(0, 6);

  return (
    <div className="h-full flex flex-col p-3 md:p-4.5 xl:p-5 overflow-hidden select-none w-full max-w-[1740px] mx-auto gap-3">

      {/* ── 1. ULTRA-COMPACT TOURNAMENT HERO BAR ── */}
      <div
        className="relative rounded-xl overflow-hidden px-4 py-3 shrink-0 flex items-center justify-between gap-4 border border-white/10 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.96) 0%, rgba(8, 12, 24, 0.98) 100%)',
          backdropFilter: 'blur(20px)',
        }}
      >
        {/* Subtle Pitch Vector Background */}
        <div className="absolute inset-0 overflow-hidden opacity-5 pointer-events-none">
          <svg width="100%" height="100%" viewBox="0 0 800 120" preserveAspectRatio="xMidYMid slice">
            <line x1="0" y1="60" x2="800" y2="60" stroke="white" strokeWidth="1" />
            <circle cx="400" cy="60" r="40" fill="none" stroke="white" strokeWidth="1" />
            <circle cx="400" cy="60" r="2" fill="white" />
          </svg>
        </div>

        {/* Left: Tournament Details */}
        <div className="relative z-10 flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-inner overflow-hidden">
            {tournament?.logoUrl ? (
              <img src={tournament.logoUrl} alt="Event Logo" className="w-full h-full object-contain p-1" />
            ) : (
              <Trophy className="w-5 h-5 text-blue-400" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 leading-none">
                {tournament?.sport || 'FOOTBALL'} · {tournament?.season || 'SEASON 2026'}
              </span>
              <span className="text-xs text-slate-400 truncate">
                {tournament?.location || 'Super Stadium'}
              </span>
            </div>
            <h1
              style={{
                fontFamily: 'var(--font-broadcast)',
                fontSize: 'clamp(22px, 2.2vw, 30px)',
                lineHeight: 1.1,
                letterSpacing: '0.02em'
              }}
              className="text-white uppercase truncate drop-shadow-md mt-0.5"
            >
              {tournament?.name || 'SUPER PREMIER LEAGUE 2026'}
            </h1>
          </div>
        </div>

        {/* Right: Quick Stats & Primary Action */}
        <div className="relative z-10 flex items-center gap-3 shrink-0">
          {/* Budget Info Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 text-xs">
            <span className="text-slate-400">Budget:</span>
            <span className="text-amber-300 font-bold tracking-wide">
              {formatCurrency(tournament?.defaultBudget || 5000, tournament?.currency)}
            </span>
            <span className="text-slate-500 text-[10px]">/ club</span>
          </div>

          {/* Primary Enter Auction CTA */}
          <button
            onClick={() => navigate('/admin/auction')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all shadow-lg hover:brightness-110 active:scale-95 group cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
              fontFamily: 'var(--font-display)',
              fontSize: '13px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              color: '#ffffff',
              boxShadow: '0 4px 18px rgba(234, 88, 12, 0.4)'
            }}
          >
            <Gavel className="w-4 h-4 shrink-0 transition-transform group-hover:rotate-12" />
            <span>Enter Live Auction</span>
            <ArrowRight className="w-4 h-4 shrink-0 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* ── 2. HIGH-IMPACT 6-METRIC KPI RIBBON (SINGLE ROW) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 shrink-0">
        {[
          {
            label: 'Total Clubs',
            value: teams.length,
            sub: 'Registered',
            icon: Users,
            color: '#38bdf8',
            bgGrad: 'linear-gradient(180deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
          },
          {
            label: 'Players Sold',
            value: soldPlayers.length,
            sub: `${players.length ? Math.round((soldPlayers.length / players.length) * 100) : 0}% signed`,
            icon: CheckCircle2,
            color: '#22c55e',
            bgGrad: 'linear-gradient(180deg, rgba(34, 197, 94, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
          },
          {
            label: 'Remaining',
            value: remainingPlayers.length,
            sub: 'In draft pool',
            icon: Clock,
            color: '#f97316',
            bgGrad: 'linear-gradient(180deg, rgba(249, 115, 22, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
          },
          {
            label: 'Total Spent',
            value: formatCurrency(totalSpent, tournament?.currency),
            sub: 'Combined fees',
            icon: TrendingUp,
            color: '#facc15',
            isCurrency: true,
            bgGrad: 'linear-gradient(180deg, rgba(250, 204, 21, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
          },
          {
            label: 'Highest Bid',
            value: formatCurrency(highestBid, tournament?.currency),
            sub: 'Record signing',
            icon: Crown,
            color: '#c084fc',
            isCurrency: true,
            bgGrad: 'linear-gradient(180deg, rgba(192, 132, 252, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)',
          },
          {
            label: 'Top Spender',
            value: topTeam?.name || '—',
            sub: topTeam ? formatCurrency(topTeam.totalSpent || 0, tournament?.currency) : 'No spend yet',
            icon: Trophy,
            color: topTeam?.primaryColor || '#38bdf8',
            isText: true,
            bgGrad: `linear-gradient(180deg, ${topTeam?.primaryColor || '#38bdf8'}18 0%, rgba(15, 23, 42, 0.6) 100%)`,
          },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="relative overflow-hidden rounded-xl border border-white/10 px-3.5 py-2.5 transition-all duration-200 hover:border-white/20 shadow-md flex flex-col justify-between"
              style={{
                background: stat.bgGrad,
                backdropFilter: 'blur(12px)',
                height: '76px',
              }}
            >
              {/* Top Hairline Accent */}
              <div
                className="absolute top-0 inset-x-0 h-[2.5px]"
                style={{ background: stat.color }}
              />

              {/* Title & Icon */}
              <div className="flex items-center justify-between gap-1 leading-none">
                <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider truncate">
                  {stat.label}
                </span>
                <Icon className="w-3.5 h-3.5 shrink-0 opacity-80" style={{ color: stat.color }} />
              </div>

              {/* Metric Value */}
              <div
                style={{
                  fontFamily: stat.isCurrency ? 'var(--font-display)' : (stat.isText ? 'var(--font-display)' : 'var(--font-broadcast)'),
                  fontSize: stat.isText ? 15 : (stat.isCurrency ? 20 : 28),
                  fontWeight: stat.isText ? 800 : (stat.isCurrency ? 800 : 400),
                  color: stat.color,
                  lineHeight: 1,
                  letterSpacing: stat.isText ? '0.02em' : '0.01em',
                }}
                className="truncate"
                title={String(stat.value)}
              >
                {stat.value}
              </div>

              {/* Sub-label */}
              <div className="text-[10px] text-slate-400 font-medium truncate leading-none">
                {stat.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── 3. MAIN WORKSPACE SPLIT (100VH FIT) ── */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-3.5">

        {/* ── LEFT PANE: CLUB BUDGETS & RECENT TRANSFERS ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-3 min-h-0">

          {/* Club Budgets & Squad Tracker */}
          <div
            className="flex-1 min-h-0 flex flex-col rounded-xl border border-white/10 overflow-hidden shadow-xl"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.92) 0%, rgba(9, 13, 26, 0.96) 100%)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Table Header */}
            <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between shrink-0 bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-slate-400" />
                <h2
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="text-xs font-bold uppercase tracking-wider text-slate-200"
                >
                  Club Budgets & Squad Status
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-white/5">
                  {teams.length} clubs
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/teams')}
                className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Clubs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Scrollable Club Rows */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 pr-1">
              {teams.map((team) => {
                const pct = Math.max(0, Math.min(100, (team.currentBalance / (team.startingBudget || 1)) * 100));
                const spent = team.totalSpent || 0;
                const teamColor = team.primaryColor || '#38bdf8';

                return (
                  <div
                    key={team.id}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-all group"
                  >
                    {/* Club Color Bar */}
                    <div
                      className="w-1.5 h-9 rounded-full shrink-0 shadow-sm transition-transform group-hover:scale-y-110"
                      style={{ background: teamColor }}
                    />

                    {/* Club Crest / Logo or Badge */}
                    {team.logoUrl ? (
                      <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-7 h-7 object-contain shrink-0 filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
                      />
                    ) : (
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] text-white shrink-0 shadow-inner border border-white/10"
                        style={{ background: `linear-gradient(135deg, ${teamColor}90, ${teamColor})` }}
                      >
                        {team.shortName || team.name?.slice(0, 3) || 'CLB'}
                      </div>
                    )}

                    {/* Club Name & Manager */}
                    <div className="w-[180px] xl:w-[210px] min-w-0 shrink-0">
                      <div
                        style={{ fontFamily: 'var(--font-display)' }}
                        className="text-sm font-bold uppercase text-white truncate leading-tight tracking-wide group-hover:text-sky-300 transition-colors"
                        title={team.name}
                      >
                        {team.name}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate leading-tight mt-0.5">
                        Mgr: <span className="text-slate-300">{team.managerName || '—'}</span>
                      </div>
                    </div>

                    {/* Squad Count Pill */}
                    <div className="shrink-0 w-[70px] text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[11px] font-extrabold border transition-colors ${
                          (team.playersBought || 0) > 0
                            ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30'
                            : 'bg-black/40 text-slate-400 border-white/10'
                        }`}
                      >
                        {team.playersBought || 0} <span className="text-[9px] font-medium opacity-80">SQUAD</span>
                      </span>
                    </div>

                    {/* Budget Progress Bar */}
                    <div className="flex-1 min-w-[120px] px-2">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1 leading-none font-medium">
                        <span>Balance: {Math.round(pct)}%</span>
                        <span>Used: {Math.round(100 - pct)}%</span>
                      </div>
                      <div className="h-1.5 bg-black/60 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${pct}%`,
                            background: `linear-gradient(90deg, ${teamColor}, #facc15)`,
                            boxShadow: `0 0 10px ${teamColor}70`
                          }}
                        />
                      </div>
                    </div>

                    {/* Budget Balance & Spent */}
                    <div className="text-right shrink-0 w-[125px] xl:w-[135px]">
                      <div
                        style={{ fontFamily: 'var(--font-display)' }}
                        className="text-sm font-extrabold text-amber-300 leading-tight"
                      >
                        {formatCurrency(team.currentBalance, tournament?.currency)}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight mt-0.5">
                        Spent: <span className="text-slate-300 font-semibold">{formatCurrency(spent, tournament?.currency)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {teams.length === 0 && (
                <div className="py-12 text-center flex flex-col items-center justify-center">
                  <Users className="w-8 h-8 text-slate-600 mb-2" />
                  <div className="text-xs font-bold uppercase text-slate-400">No Clubs Registered</div>
                  <button
                    onClick={() => navigate('/admin/teams')}
                    className="mt-3 px-3 py-1 rounded bg-blue-600 text-xs font-bold text-white hover:bg-blue-500"
                  >
                    Register Clubs
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Recent Transfers Feed */}
          <div
            className="rounded-xl border border-white/10 px-4 py-2.5 shrink-0 shadow-lg"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.94) 0%, rgba(8, 12, 24, 0.97) 100%)',
              backdropFilter: 'blur(20px)',
              height: '115px'
            }}
          >
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-white/10">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
                  Latest Transfers
                </span>
              </div>
              <button
                onClick={() => navigate('/admin/history')}
                className="text-[10.5px] font-bold text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Full History</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>

            {recentTransfers.length > 0 ? (
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
                {recentTransfers.map((rec, i) => {
                  const t = teams.find(team => team.id === rec.teamId);
                  const teamColor = t?.primaryColor || '#38bdf8';

                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black/40 border border-white/10 shrink-0 hover:border-white/20 transition-all"
                      style={{ borderLeft: `3px solid ${teamColor}` }}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white truncate max-w-[120px]">
                          {rec.playerName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[120px]">
                          → {rec.teamName}
                        </div>
                      </div>
                      <div
                        style={{ fontFamily: 'var(--font-broadcast)' }}
                        className="text-base text-amber-300 font-bold shrink-0 leading-none pl-1"
                      >
                        {formatCurrency(rec.finalPrice, tournament?.currency)}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-3 text-center">
                No players sold yet. Enter the Live Auction to begin bidding!
              </div>
            )}
          </div>

        </div>

        {/* ── RIGHT PANE: NEXT IN AUCTION SPOTLIGHT ── */}
        <div
          className="w-full lg:w-[310px] xl:w-[325px] shrink-0 rounded-xl border border-white/10 p-3.5 flex flex-col justify-between items-center shadow-2xl relative overflow-hidden min-h-0"
          style={{
            background: 'linear-gradient(180deg, rgba(16, 23, 42, 0.95) 0%, rgba(7, 10, 20, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Ambient Card Spotlight Glow */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none opacity-20 filter blur-3xl"
            style={{ background: isAuctionLive ? '#ef4444' : '#f59e0b' }}
          />

          {/* Card Header & Status */}
          <div className="w-full flex items-center justify-between pb-2 mb-1 border-b border-white/10 z-10 shrink-0">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${isAuctionLive ? 'bg-red-500 animate-ping' : 'bg-amber-400 animate-pulse'}`}
              />
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-slate-200">
                {isAuctionLive ? 'LIVE ON AUCTION' : 'NEXT IN AUCTION'}
              </span>
            </div>
            {featuredPlayer && (
              <span className="text-[10.5px] font-black px-2 py-0.5 rounded bg-black/60 border border-white/15 text-amber-400">
                OVR {featuredPlayer.overallRating || featuredPlayer.rating || 88}
              </span>
            )}
          </div>

          {/* EA FC Ultimate Team Card */}
          <div className="my-auto py-1 flex items-center justify-center relative z-10 drop-shadow-[0_12px_24px_rgba(0,0,0,0.85)]">
            {featuredPlayer ? (
              <EFootballCard
                player={featuredPlayer}
                size={0.70}
                disableBackdrop={true}
                onClick={() => navigate('/admin/auction')}
              />
            ) : (
              <div className="py-16 text-center text-slate-500">
                <Gavel className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <div className="text-xs font-bold uppercase tracking-wider">Draft Pool Exhausted</div>
              </div>
            )}
          </div>

          {/* Bottom Action Chamber */}
          <div className="w-full pt-2 border-t border-white/10 z-10 flex flex-col gap-2 shrink-0">
            {featuredPlayer && (
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-black/50 border border-white/10 text-xs">
                <span className="text-slate-400 font-medium">Base Price</span>
                <span className="font-extrabold text-amber-300 font-broadcast text-base">
                  {formatCurrency(featuredPlayer.basePrice || 1000, tournament?.currency)}
                </span>
              </div>
            )}

            <button
              onClick={() => navigate('/admin/auction')}
              className="w-full py-2.5 px-3 rounded-lg flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider text-white transition-all shadow-md hover:brightness-110 active:scale-95 cursor-pointer"
              style={{
                background: isAuctionLive
                  ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                  : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                boxShadow: isAuctionLive
                  ? '0 4px 14px rgba(239, 68, 68, 0.4)'
                  : '0 4px 14px rgba(59, 130, 246, 0.35)',
              }}
            >
              <Gavel className="w-3.5 h-3.5 shrink-0" />
              <span>{isAuctionLive ? 'Join Live Bidding' : 'Auction This Player'}</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
