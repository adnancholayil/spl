import React, { useState, useRef, useEffect } from 'react';

export const STUDIO_ELEMENTS = [
  { id: 'photo', label: 'Player Photo', icon: '👤' },
  { id: 'rating', label: 'OVR Rating', icon: '🎯' },
  { id: 'position', label: 'Position', icon: '🏷️' },
  { id: 'flag', label: 'Nation Flag', icon: '🇮🇳' },
  { id: 'clubLogo', label: 'Club Logo', icon: '🛡️' },
  { id: 'name', label: 'Player Name', icon: '✏️' },
  { id: 'stats', label: 'Stats Grid', icon: '📊' },
];

export const STUDIO_BACK_ELEMENTS = [
  { id: 'backLogo', label: 'SPL Emblem', icon: '🛡️' },
  { id: 'backText', label: 'League Text', icon: '🏷️' },
];

/**
 * Canva & Photoshop-style interactive selection & transform overlay for player cards.
 * Operates in the 320x440 virtual SVG coordinate grid.
 */
export const CardStudioTransformOverlay = ({
  cfg,
  player,
  svgRef,
  selectedElement,
  onSelectElement,
  onUpdateTheme,
  onCommitHistory,
}) => {
  const [hoveredElement, setHoveredElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [snapGuideX, setSnapGuideX] = useState(false);
  const dragRef = useRef(null);

  const getVirtualCoords = (clientX, clientY) => {
    if (!svgRef?.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 320;
    const y = ((clientY - rect.top) / rect.height) * 440;
    return { x, y };
  };

  const getElementBounds = (key) => {
    const ratingX = cfg.layoutRatingX ?? 55;
    const ratingY = cfg.layoutRatingY ?? 90;
    const ratingSize = cfg.layoutRatingSize ?? 52;
    const posGapY = cfg.layoutPositionGapY ?? 25;
    const posX = cfg.layoutPositionX ?? 0;
    const posSize = cfg.layoutPositionSize ?? 18;
    const logosGapY = cfg.layoutLogosGapY ?? 15;
    const clubGapY = cfg.layoutClubLogoGapY ?? 8;
    const logosX = cfg.layoutLogosX ?? 0;
    const scaleRatio = (cfg.layoutLogoScale ?? 100) / 100;
    const flagW = (cfg.layoutFlagWidth ?? 36) * scaleRatio;
    const flagH = (cfg.layoutFlagHeight ?? 24) * scaleRatio;
    const clubSize = (cfg.layoutClubLogoSize ?? 28) * scaleRatio;

    const positionY = cfg.showRating !== false ? posGapY : 0;
    const logosStartY = positionY + logosGapY;
    const clubLogoY = logosStartY + flagH + clubGapY;

    switch (key) {
      case 'rating': {
        const w = Math.max(34, ratingSize * 0.95);
        const h = ratingSize * 0.88;
        return {
          x: ratingX - w / 2,
          y: ratingY - ratingSize * 0.82,
          w,
          h,
          label: `Rating (${player?.overallRating || 99})`,
          centerX: ratingX,
          centerY: ratingY,
        };
      }
      case 'position': {
        const w = Math.max(32, posSize * 2.2);
        const h = Math.max(20, posSize * 1.1);
        return {
          x: (ratingX + posX) - w / 2,
          y: (ratingY + posGapY) - posSize * 0.85,
          w,
          h,
          label: `Position (${(player?.position || 'ST').toUpperCase()})`,
          centerX: ratingX + posX,
          centerY: ratingY + posGapY,
        };
      }
      case 'flag': {
        return {
          x: (ratingX + logosX) - flagW / 2,
          y: ratingY + logosStartY,
          w: flagW,
          h: flagH,
          label: 'Flag',
          centerX: ratingX + logosX,
          centerY: ratingY + logosStartY + flagH / 2,
        };
      }
      case 'clubLogo': {
        return {
          x: (ratingX + logosX) - clubSize / 2,
          y: ratingY + clubLogoY,
          w: clubSize,
          h: clubSize,
          label: 'Emblem',
          centerX: ratingX + logosX,
          centerY: ratingY + clubLogoY + clubSize / 2,
        };
      }
      case 'photo': {
        return {
          x: cfg.layoutImageX ?? 40,
          y: cfg.layoutImageY ?? 50,
          w: cfg.layoutImageW ?? 280,
          h: cfg.layoutImageH ?? 280,
          label: 'Player Photo',
          centerX: (cfg.layoutImageX ?? 40) + (cfg.layoutImageW ?? 280) / 2,
          centerY: (cfg.layoutImageY ?? 50) + (cfg.layoutImageH ?? 280) / 2,
        };
      }
      case 'name': {
        const fontSize = cfg.layoutNameFontSize ?? 40;
        const playerName = player?.name || 'CUSTOM PLAYER';
        const w = Math.max(140, Math.min(290, playerName.length * (fontSize * 0.52)));
        const h = fontSize * 1.05;
        return {
          x: (cfg.layoutNameX ?? 160) - w / 2,
          y: (cfg.layoutNameY ?? 280) - fontSize * 0.88,
          w,
          h,
          label: `Name (${playerName})`,
          centerX: cfg.layoutNameX ?? 160,
          centerY: cfg.layoutNameY ?? 280,
        };
      }
      case 'stats': {
        const gapX = cfg.layoutStatsGapX ?? 40;
        const gapY = cfg.layoutStatsGapY ?? 30;
        const w = (gapX * 2) + 64;
        const h = (gapY * 2) + 32;
        return {
          x: (cfg.layoutStatsX ?? 160) - w / 2,
          y: (cfg.layoutStatsY ?? 315) - 18,
          w,
          h,
          label: 'Stats Grid',
          centerX: cfg.layoutStatsX ?? 160,
          centerY: (cfg.layoutStatsY ?? 315) + (gapY * 2) / 2,
        };
      }
      default:
        return null;
    }
  };

  const applyTransform = (elementId, action, deltaX, deltaY, startTheme) => {
    let updates = {};
    let shouldSnapX = false;

    if (action === 'move') {
      switch (elementId) {
        case 'rating': {
          let newX = Math.round((startTheme.layoutRatingX ?? 55) + deltaX);
          let newY = Math.round((startTheme.layoutRatingY ?? 90) + deltaY);
          if (Math.abs(newX - 160) < 4) { newX = 160; shouldSnapX = true; }
          updates = {
            layoutRatingX: Math.max(0, Math.min(220, newX)),
            layoutRatingY: Math.max(20, Math.min(250, newY)),
          };
          break;
        }
        case 'position': {
          let newX = Math.round((startTheme.layoutPositionX ?? 0) + deltaX);
          let newGapY = Math.round((startTheme.layoutPositionGapY ?? 25) + deltaY);
          if (Math.abs(newX) < 3) newX = 0;
          updates = {
            layoutPositionX: Math.max(-50, Math.min(50, newX)),
            layoutPositionGapY: Math.max(0, Math.min(80, newGapY)),
          };
          break;
        }
        case 'flag': {
          let newX = Math.round((startTheme.layoutLogosX ?? 0) + deltaX);
          let newGapY = Math.round((startTheme.layoutLogosGapY ?? 15) + deltaY);
          if (Math.abs(newX) < 3) newX = 0;
          updates = {
            layoutLogosX: Math.max(-50, Math.min(50, newX)),
            layoutLogosGapY: Math.max(0, Math.min(80, newGapY)),
          };
          break;
        }
        case 'clubLogo': {
          let newX = Math.round((startTheme.layoutLogosX ?? 0) + deltaX);
          let newGapY = Math.round((startTheme.layoutClubLogoGapY ?? 8) + deltaY);
          if (Math.abs(newX) < 3) newX = 0;
          updates = {
            layoutLogosX: Math.max(-50, Math.min(50, newX)),
            layoutClubLogoGapY: Math.max(0, Math.min(60, newGapY)),
          };
          break;
        }
        case 'photo': {
          let newX = Math.round((startTheme.layoutImageX ?? 40) + deltaX);
          let newY = Math.round((startTheme.layoutImageY ?? 50) + deltaY);
          const photoW = startTheme.layoutImageW ?? 280;
          if (Math.abs((newX + photoW / 2) - 160) < 4) {
            newX = Math.round(160 - photoW / 2);
            shouldSnapX = true;
          }
          updates = {
            layoutImageX: Math.max(-120, Math.min(220, newX)),
            layoutImageY: Math.max(-160, Math.min(220, newY)),
          };
          break;
        }
        case 'name': {
          let newX = Math.round((startTheme.layoutNameX ?? 160) + deltaX);
          let newY = Math.round((startTheme.layoutNameY ?? 280) + deltaY);
          if (Math.abs(newX - 160) < 4) { newX = 160; shouldSnapX = true; }
          updates = {
            layoutNameX: Math.max(40, Math.min(280, newX)),
            layoutNameY: Math.max(160, Math.min(380, newY)),
          };
          break;
        }
        case 'stats': {
          let newX = Math.round((startTheme.layoutStatsX ?? 160) + deltaX);
          let newY = Math.round((startTheme.layoutStatsY ?? 315) + deltaY);
          if (Math.abs(newX - 160) < 4) { newX = 160; shouldSnapX = true; }
          updates = {
            layoutStatsX: Math.max(40, Math.min(280, newX)),
            layoutStatsY: Math.max(180, Math.min(420, newY)),
          };
          break;
        }
        default:
          break;
      }
    } else {
      // Corner resize handles
      const factorX = (action === 'se' || action === 'ne') ? 1 : -1;
      const factorY = (action === 'se' || action === 'sw') ? 1 : -1;
      const uniformDelta = ((deltaX * factorX) + (deltaY * factorY)) / 2;

      switch (elementId) {
        case 'rating': {
          const newSize = Math.max(20, Math.min(90, Math.round((startTheme.layoutRatingSize ?? 52) + uniformDelta * 0.8)));
          updates = { layoutRatingSize: newSize };
          break;
        }
        case 'position': {
          const newSize = Math.max(10, Math.min(40, Math.round((startTheme.layoutPositionSize ?? 18) + uniformDelta * 0.5)));
          updates = { layoutPositionSize: newSize };
          break;
        }
        case 'flag': {
          const newW = Math.max(12, Math.min(80, Math.round((startTheme.layoutFlagWidth ?? 36) + deltaX * factorX)));
          const newH = Math.max(8, Math.min(60, Math.round((startTheme.layoutFlagHeight ?? 24) + deltaY * factorY)));
          updates = { layoutFlagWidth: newW, layoutFlagHeight: newH };
          break;
        }
        case 'clubLogo': {
          const newSize = Math.max(12, Math.min(80, Math.round((startTheme.layoutClubLogoSize ?? 28) + uniformDelta)));
          updates = { layoutClubLogoSize: newSize };
          break;
        }
        case 'photo': {
          const newW = Math.max(100, Math.min(500, Math.round((startTheme.layoutImageW ?? 280) + deltaX * factorX)));
          const newH = Math.max(100, Math.min(500, Math.round((startTheme.layoutImageH ?? 280) + deltaY * factorY)));
          updates = { layoutImageW: newW, layoutImageH: newH };
          break;
        }
        case 'name': {
          const newSize = Math.max(16, Math.min(70, Math.round((startTheme.layoutNameFontSize ?? 40) + uniformDelta * 0.8)));
          updates = { layoutNameFontSize: newSize };
          break;
        }
        case 'stats': {
          const newGapX = Math.max(10, Math.min(100, Math.round((startTheme.layoutStatsGapX ?? 40) + deltaX * factorX * 0.4)));
          const newGapY = Math.max(10, Math.min(60, Math.round((startTheme.layoutStatsGapY ?? 30) + deltaY * factorY * 0.4)));
          updates = { layoutStatsGapX: newGapX, layoutStatsGapY: newGapY };
          break;
        }
        default:
          break;
      }
    }

    setSnapGuideX(shouldSnapX);
    if (Object.keys(updates).length > 0) {
      onUpdateTheme?.(updates);
    }
  };

  const handlePointerDown = (e, elementId, action) => {
    e.stopPropagation();
    e.preventDefault();

    onSelectElement?.(elementId);

    const startVirtual = getVirtualCoords(e.clientX, e.clientY);
    dragRef.current = {
      elementId,
      action,
      startX: startVirtual.x,
      startY: startVirtual.y,
      startTheme: { ...cfg },
    };
    setIsDragging(true);

    const handlePointerMove = (evt) => {
      if (!dragRef.current) return;
      evt.preventDefault();
      const currentVirtual = getVirtualCoords(evt.clientX, evt.clientY);
      const deltaX = currentVirtual.x - dragRef.current.startX;
      const deltaY = currentVirtual.y - dragRef.current.startY;
      applyTransform(dragRef.current.elementId, dragRef.current.action, deltaX, deltaY, dragRef.current.startTheme);
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setSnapGuideX(false);
      dragRef.current = null;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      onCommitHistory?.();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Background deselect handler
  const handleBackgroundClick = (e) => {
    e.stopPropagation();
    onSelectElement?.(null);
  };

  const selectedBounds = selectedElement ? getElementBounds(selectedElement) : null;

  return (
    <g className="studio-transform-layer">
      {/* Invisible backdrop to deselect when clicking empty area */}
      <rect
        x="0"
        y="0"
        width="320"
        height="440"
        fill="transparent"
        onClick={handleBackgroundClick}
        style={{ pointerEvents: selectedElement ? 'all' : 'none' }}
      />

      {/* Snap Guides */}
      {snapGuideX && (
        <g>
          <line x1="160" y1="0" x2="160" y2="440" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4,4" />
          <rect x="146" y="6" width="28" height="11" rx="2" fill="#0284c7" />
          <text x="160" y="14" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle">160</text>
        </g>
      )}

      {/* Unselected Element Hover & Click Hit Areas (Layer order: photo first, then foreground) */}
      {STUDIO_ELEMENTS.filter(item => item.id !== selectedElement).map(item => {
        const bounds = getElementBounds(item.id);
        if (!bounds) return null;
        const isHovered = hoveredElement === item.id;

        return (
          <g key={item.id} style={{ pointerEvents: 'all' }}>
            <rect
              x={bounds.x}
              y={bounds.y}
              width={bounds.w}
              height={bounds.h}
              fill={isHovered ? 'rgba(0, 229, 255, 0.06)' : 'rgba(0, 0, 0, 0.001)'}
              stroke={isHovered ? '#00e5ff' : 'transparent'}
              strokeWidth="1"
              strokeDasharray={isHovered ? '3,3' : 'none'}
              cursor="pointer"
              onPointerEnter={() => setHoveredElement(item.id)}
              onPointerLeave={() => setHoveredElement(null)}
              onPointerDown={(e) => handlePointerDown(e, item.id, 'move')}
            />
            {isHovered && (
              <g transform={`translate(${bounds.x}, ${Math.max(12, bounds.y) - 12})`} style={{ pointerEvents: 'none' }}>
                <rect x="0" y="0" width={bounds.label.length * 5.5 + 8} height="10" rx="2" fill="rgba(15, 23, 42, 0.85)" stroke="#00e5ff" strokeWidth="0.5" />
                <text x={(bounds.label.length * 5.5 + 8) / 2} y="7.5" fill="#38bdf8" fontSize="6" fontWeight="bold" textAnchor="middle">
                  {bounds.label}
                </text>
              </g>
            )}
          </g>
        );
      })}

      {/* Active Selected Element Box & Handles (Photoshop / Canva Style) */}
      {selectedBounds && (
        <g style={{ pointerEvents: 'all' }}>
          {/* Main selection box */}
          <rect
            x={selectedBounds.x}
            y={selectedBounds.y}
            width={selectedBounds.w}
            height={selectedBounds.h}
            fill="rgba(0, 229, 255, 0.08)"
            stroke="#00e5ff"
            strokeWidth="1.5"
            strokeDasharray={isDragging ? '4,4' : 'none'}
            cursor="move"
            onPointerDown={(e) => handlePointerDown(e, selectedElement, 'move')}
          />

          {/* Floating Pill Badge */}
          {(() => {
            const pillY = Math.max(14, selectedBounds.y) - 14;
            const badgeText = `${selectedBounds.label} • (${Math.round(selectedBounds.centerX)}, ${Math.round(selectedBounds.centerY)})`;
            const pillW = Math.max(70, badgeText.length * 5.5 + 10);
            return (
              <g transform={`translate(${Math.max(4, Math.min(320 - pillW - 4, selectedBounds.x))}, ${pillY})`} style={{ pointerEvents: 'none' }}>
                <rect x="0" y="0" width={pillW} height="12" rx="3" fill="#0284c7" />
                <text x={pillW / 2} y="8.5" fill="#ffffff" fontSize="6.5" fontWeight="bold" textAnchor="middle" style={{ letterSpacing: '0.3px' }}>
                  {badgeText}
                </text>
              </g>
            );
          })()}

          {/* 4 Corner Resize Handles */}
          {(() => {
            const handleSize = 6;
            const half = handleSize / 2;
            const corners = [
              { id: 'nw', x: selectedBounds.x - half, y: selectedBounds.y - half, cursor: 'nwse-resize' },
              { id: 'ne', x: selectedBounds.x + selectedBounds.w - half, y: selectedBounds.y - half, cursor: 'nesw-resize' },
              { id: 'se', x: selectedBounds.x + selectedBounds.w - half, y: selectedBounds.y + selectedBounds.h - half, cursor: 'nwse-resize' },
              { id: 'sw', x: selectedBounds.x - half, y: selectedBounds.y + selectedBounds.h - half, cursor: 'nesw-resize' },
            ];

            return corners.map((c) => (
              <rect
                key={c.id}
                x={c.x}
                y={c.y}
                width={handleSize}
                height={handleSize}
                rx="1"
                fill="#ffffff"
                stroke="#00e5ff"
                strokeWidth="1.5"
                cursor={c.cursor}
                onPointerDown={(e) => handlePointerDown(e, selectedElement, c.id)}
              />
            ));
          })()}
        </g>
      )}
    </g>
  );
};
