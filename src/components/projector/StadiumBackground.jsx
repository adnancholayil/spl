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
  '/assets/stedium/stedium2.png',
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
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none pointer-events-none">
      
      {/* 1. CINEMATIC DARK FILTERED STADIUM BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full bg-[#020617]">
        <img 
          key={currentImg}
          src={currentImg} 
          alt="Stadium Arena Background"
          className="w-full h-full object-cover object-center transition-all duration-1000"
          style={{
            filter: 'brightness(0.55) contrast(1.15) saturate(1.1)',
          }}
        />
      </div>

      {children}
    </div>
  );
};
