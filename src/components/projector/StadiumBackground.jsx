import React, { useMemo, useState, useEffect } from 'react';

/**
 * StadiumBackground Component
 * Renders high-quality stadium background images randomly from:
 * - /assets/stedium/stedium1.jpg
 * - /assets/stedium/stedium2.png
 * - /assets/stedium/stedium3.png
 * - /assets/stedium/stedium4.jpg
 * - /assets/stedium/stedium5.jpg
 *
 * Includes atmospheric lighting, spotlight cone, and dark vignette shading.
 */
export const STADIUM_IMAGES = [
  '/assets/stedium/stedium1.jpg',
  '/assets/stedium/stedium2.png',
  '/assets/stedium/stedium3.png',
  '/assets/stedium/stedium4.jpg',
  '/assets/stedium/stedium5.jpg',
];

export const getRandomStadiumImage = () => {
  const randomIndex = Math.floor(Math.random() * STADIUM_IMAGES.length);
  return STADIUM_IMAGES[randomIndex];
};

export const StadiumBackground = ({ bgIndex = null, ambientColor = null, children, autoRotate = false, rotateIntervalMs = 30000 }) => {
  // Randomly select one of the stadium background images or use specified index
  const [currentImg, setCurrentImg] = useState(() => {
    if (bgIndex !== null && bgIndex !== undefined && STADIUM_IMAGES[bgIndex]) {
      return STADIUM_IMAGES[bgIndex];
    }
    return getRandomStadiumImage();
  });

  useEffect(() => {
    if (bgIndex !== null && bgIndex !== undefined && STADIUM_IMAGES[bgIndex]) {
      setCurrentImg(STADIUM_IMAGES[bgIndex]);
    }
  }, [bgIndex]);

  // Optional background rotation every interval
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setCurrentImg(prev => {
        const remaining = STADIUM_IMAGES.filter(img => img !== prev);
        return remaining[Math.floor(Math.random() * remaining.length)];
      });
    }, rotateIntervalMs);
    return () => clearInterval(interval);
  }, [autoRotate, rotateIntervalMs]);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none bg-[#020617]">
      
      {/* 1. REAL STADIUM BACKGROUND IMAGE (Randomly Picked) */}
      <div className="absolute inset-0 w-full h-full">
        <img 
          key={currentImg}
          src={currentImg} 
          alt="Stadium Arena Background"
          className="w-full h-full object-cover object-center scale-105 transition-all duration-1000 animate-fade-in"
          style={{
            filter: 'brightness(0.72) contrast(1.12) saturate(1.15)',
          }}
        />
      </div>

      {/* 2. Ambient Lighting Overlay Gradient */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(2, 6, 23, 0.45) 0%, rgba(2, 6, 23, 0.25) 40%, rgba(2, 6, 23, 0.75) 80%, rgba(2, 6, 23, 0.96) 100%)',
        }}
      />

      {/* 3. Center Spotlight Beam Cone illuminating the pitch */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[75%] h-full opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at 50% 35%, rgba(255, 255, 255, 0.35) 0%, rgba(56, 189, 248, 0.15) 45%, transparent 75%)',
        }}
      />

      {/* 4. Dynamic Team / Stage Ambient Glow Overlay */}
      {ambientColor && (
        <div 
          className="absolute inset-0 transition-colors duration-700 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 35%, ${ambientColor}40 0%, transparent 65%)`,
          }}
        />
      )}

      {/* 5. Edge Vignette Shading for maximum card focus */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 30%, rgba(2, 6, 23, 0.7) 75%, rgba(2, 6, 23, 0.98) 100%)',
        }}
      />

      {children}
    </div>
  );
};
