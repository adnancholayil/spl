import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../context/TournamentContext';
import { SPLLogo } from '../components/common/SPLLogo';
import {
  LayoutDashboard, Users, UserCheck, Gavel, History,
  Settings, Tv, LogOut, ChevronRight, Menu, X
} from 'lucide-react';

export const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const { tournament } = useTournament();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const openProjectorWindow = () => {
    window.open('/projector', '_blank', 'width=1280,height=720,toolbar=no,menubar=no');
  };

  const navItems = [
    { label: 'Dashboard',        path: '/admin',                   icon: LayoutDashboard, end: true,  num: '01' },
    { label: 'Live Auction',     path: '/admin/auction',           icon: Gavel,           isAuction: true, num: '02' },
    { label: 'Teams',            path: '/admin/teams',             icon: Users,           num: '03' },
    { label: 'Players',          path: '/admin/players',           icon: UserCheck,       num: '04' },
    { label: 'Transfers',        path: '/admin/history',           icon: History,         num: '05' },
    { label: 'Projector Screen', path: '/admin/projector-control', icon: Tv,              num: '06' },
    { label: 'Settings',         path: '/admin/settings',          icon: Settings,        num: '07' },
  ];

  return (
    <div className="h-screen flex flex-col lg:flex-row select-none text-slate-100 overflow-hidden" style={{ background: 'var(--spl-black)' }}>

      {/* ── MOBILE TOPBAR (< 1024px) ── */}
      <header className="lg:hidden flex items-center justify-between px-3.5 py-2.5 z-40 shrink-0 border-b border-white/10" style={{ background: 'var(--spl-navy)' }}>
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white transition-colors"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <SPLLogo size={28} customLogo={tournament?.logoUrl} />

          <div className="min-w-0">
            <div className="text-xs font-bold text-white uppercase truncate tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
              {tournament?.name || 'SUPER PREMIER LEAGUE'}
            </div>
            <div className="flex items-center gap-1.5 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-led-pulse" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Control Center</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openProjectorWindow}
            title="Open Projector Screen"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-wider text-white shadow-sm"
            style={{ background: 'var(--spl-orange)' }}
          >
            <Tv className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Projector</span>
          </button>
        </div>
      </header>

      {/* ── MOBILE BACKDROP OVERLAY ── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 lg:hidden transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ── MOBILE SLIDE-OUT DRAWER (< 1024px) ── */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[275px] max-w-[85vw] flex flex-col justify-between shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'var(--spl-navy)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        <div>
          {/* Drawer Top Header with Close Button */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3 min-w-0">
              <SPLLogo size={34} customLogo={tournament?.logoUrl} />
              <div className="min-w-0">
                <div className="text-sm font-bold text-white uppercase truncate tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
                  {tournament?.name || 'SUPER PREMIER LEAGUE'}
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-led-pulse shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Control Center</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Projector Launch */}
          <div className="px-3 pt-3 pb-1">
            <button
              onClick={() => { openProjectorWindow(); setMobileMenuOpen(false); }}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg font-bold text-xs uppercase tracking-wider text-white shadow-md"
              style={{ background: 'var(--spl-orange)' }}
            >
              <Tv className="w-4 h-4" />
              <span>Open Projector</span>
            </button>
          </div>

          {/* Nav Items */}
          <nav className="px-2.5 pt-2.5 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => [
                    'nav-item',
                    isActive ? 'active' : '',
                    item.isAuction ? 'auction-item' : '',
                  ].join(' ')}
                  style={{
                    padding: '10px 14px',
                    fontSize: '13px',
                    gap: '12px',
                  }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 font-medium tracking-wide">{item.label}</span>
                  {item.isAuction && (
                    <span
                      className="w-2 h-2 rounded-full animate-led-pulse"
                      style={{ background: 'var(--spl-orange)' }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Drawer Bottom: User info & logout */}
        <div className="px-4 py-3.5 border-t border-white/10 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-xs font-bold truncate text-white" style={{ fontFamily: 'var(--font-display)' }}>
              {currentUser?.name || 'Platform Admin'}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider">
              {currentUser?.role || 'Admin'}
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Sign Out"
            className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-red-400"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* ── DESKTOP SIDEBAR (>= 1024px) ── */}
      <aside
        className="hidden lg:flex shrink-0 flex-col justify-between shadow-2xl relative z-30 transition-all duration-200"
        style={{
          width: collapsed ? '68px' : '260px',
          background: 'var(--spl-navy)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Top: Brand */}
        <div>
          <div
            className="flex items-center gap-3.5 px-5 py-5"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <SPLLogo size={40} customLogo={tournament?.logoUrl} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div
                  className="text-base font-bold truncate text-white"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
                  title={tournament?.name || 'SUPER PREMIER LEAGUE'}
                >
                  {tournament?.name || 'SUPER PREMIER LEAGUE'}
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-led-pulse shrink-0" />
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Control Center
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Projector Launch */}
          <div className="px-4 pt-4 pb-2">
            <button
              onClick={openProjectorWindow}
              title="Open Projector Screen"
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-lg transition-all shadow-md hover:brightness-110 active:scale-95"
              style={{
                background: 'var(--spl-orange)',
                fontFamily: 'var(--font-display)',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: '#fff',
              }}
            >
              <Tv className="w-5 h-5 shrink-0" />
              {!collapsed && <span>Open Projector</span>}
            </button>
          </div>

          {/* Nav Items */}
          <nav className="px-3 pt-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  title={collapsed ? item.label : undefined}
                  className={({ isActive }) => [
                    'nav-item',
                    isActive ? 'active' : '',
                    item.isAuction ? 'auction-item' : '',
                  ].join(' ')}
                  style={{
                    padding: '11px 14px',
                    fontSize: '13px',
                    gap: '12px',
                  }}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 font-medium tracking-wide">{item.label}</span>
                      {item.isAuction && (
                        <span
                          className="w-2 h-2 rounded-full animate-led-pulse"
                          style={{ background: 'var(--spl-orange)' }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom: User + collapse */}
        <div style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {!collapsed && (
            <div className="px-5 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <div
                  className="text-sm font-bold truncate"
                  style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}
                >
                  {currentUser?.name || 'Platform Admin'}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {currentUser?.role || 'Admin'}
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-lg transition-colors hover:bg-slate-800"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Collapse toggle */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full py-2.5 flex items-center justify-center transition-colors hover:bg-slate-800"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ChevronRight
              className="w-5 h-5 transition-transform"
              style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)' }}
            />
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        className="flex-1 min-h-0 flex flex-col overflow-y-auto lg:overflow-hidden relative w-full min-w-0"
        style={{ background: 'var(--spl-black)' }}
      >
        <Outlet />
      </main>
    </div>
  );
};

