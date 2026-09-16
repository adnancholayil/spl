import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTournament } from '../context/TournamentContext';
import { SPLLogo } from '../components/common/SPLLogo';
import {
  LayoutDashboard, Users, UserCheck, Gavel, History,
  Settings, Tv, LogOut, ChevronRight
} from 'lucide-react';

export const AdminLayout = () => {
  const { currentUser, logout } = useAuth();
  const { tournament } = useTournament();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

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
    <div className="h-screen flex select-none text-slate-100 overflow-hidden" style={{ background: 'var(--spl-black)' }}>

      {/* ── SIDEBAR ── */}
      <aside
        className="shrink-0 flex flex-col justify-between shadow-2xl relative z-30 transition-all duration-200"
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
            <SPLLogo size={40} />
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div
                  className="text-base font-bold truncate text-white"
                  style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.04em' }}
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
        className="flex-1 overflow-y-auto relative w-full h-full"
        style={{ background: 'var(--spl-black)' }}
      >
        <Outlet />
      </main>
    </div>
  );
};
