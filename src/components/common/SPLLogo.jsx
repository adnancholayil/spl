import React from 'react';
import { useTournament } from '../../context/TournamentContext';
import { storageService } from '../../services/storageService';

/**
 * SPLLogo — Official Super Premier League / Custom Event Logo
 * Renders custom tournament logo if set, or official colorful geometric starburst ring with transparent center & crisp white "SPL" text.
 */
export const SPLLogo = ({ size = 40, className = '', style = {}, showGlow = false, customLogo }) => {
  let contextTourn = null;
  try {
    const ctx = useTournament();
    contextTourn = ctx?.tournament;
  } catch (_) {}

  // Resolve logo: explicit customLogo prop -> tournament from context -> tournament from storage
  const effectiveLogo = customLogo !== undefined 
    ? customLogo 
    : (contextTourn?.logoUrl || (typeof window !== 'undefined' ? storageService.getTournament()?.logoUrl : ''));

  if (effectiveLogo) {
    return (
      <div
        className={className}
        style={{
          position: 'relative',
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          filter: showGlow ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.45))' : 'none',
          ...style
        }}
      >
        <img
          src={effectiveLogo}
          alt="Tournament Event Logo"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: style?.borderRadius || '4px'
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        filter: showGlow ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 0.35))' : 'none',
        ...style
      }}
    >
      {/* ── Outer Colorful Geometric Ring ── */}
      <img
        src="/assets/logo.png"
        alt="SUPER PREMIER LEAGUE Logo"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
        }}
      />

      {/* ── Crisp White SPL Text (No White Background Box) ── */}
      <span
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Montserrat", "Segoe UI", Roboto, sans-serif',
          fontWeight: 900,
          fontSize: Math.max(7, size * 0.17),
          color: '#FFFFFF',
          letterSpacing: '0.06em',
          lineHeight: 1,
          userSelect: 'none',
          textShadow: '0 2px 6px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)',
          zIndex: 2,
        }}
      >
        SPL
      </span>
    </div>
  );
};

