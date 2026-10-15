import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EFootballCard } from '../common/EFootballCard';
import { Shield, Users } from 'lucide-react';
import { soundEngine } from '../../services/soundService';
import { formatCurrency } from '../../utils/currency';

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * FORMATION CONFIGURATIONS
 * Calibrated precisely for larger cards on the Full-Screen EA FC 3D Pitch
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const FORMATIONS = {
  '11s': {
    name: '4-3-3 Attack',
    label: '4-3-3',
    type: '11s',
    totalSlots: 11,
    slots: [
      // Attackers (Top Row in perspective)
      { id: 'st',  label: 'ST',  role: 'ST',  x: 50, y: 16 },
      { id: 'lw',  label: 'LW',  role: 'LW',  x: 30, y: 20 },
      { id: 'rw',  label: 'RW',  role: 'RW',  x: 70, y: 20 },
      // Midfielders (Middle Row)
      { id: 'cam', label: 'CAM', role: 'CAM', x: 50, y: 39 },
      { id: 'lcm', label: 'CM',  role: 'CM',  x: 29, y: 44 },
      { id: 'rcm', label: 'CM',  role: 'CM',  x: 71, y: 44 },
      // Defenders (Back Row)
      { id: 'lcb', label: 'CB',  role: 'CB',  x: 39, y: 68 },
      { id: 'rcb', label: 'CB',  role: 'CB',  x: 61, y: 68 },
      { id: 'lb',  label: 'LB',  role: 'LB',  x: 18, y: 65 },
      { id: 'rb',  label: 'RB',  role: 'RB',  x: 82, y: 65 },
      // Goalkeeper (Bottom)
      { id: 'gk',  label: 'GK',  role: 'GK',  x: 50, y: 84 },
    ]
  },
  '7s': {
    name: '2-1-2-1 Diamond',
    label: '2-1-2-1',
    type: '7s',
    totalSlots: 7,
    slots: [
      // Attacker (Top Row)
      { id: 'st',  label: 'ST',  role: 'ST',  x: 50, y: 17 },
      // Upper Midfielders (Row 2)
      { id: 'lcm', label: 'LCM', role: 'CM',  x: 28, y: 35 },
      { id: 'rcm', label: 'RCM', role: 'CM',  x: 72, y: 35 },
      // Central Anchor / Holding Midfielder (Row 3)
      { id: 'cdm', label: 'CDM', role: 'CDM', x: 50, y: 52 },
      // Defenders (Row 4 - open central corridor)
      { id: 'lcb', label: 'LCB', role: 'CB',  x: 30, y: 69 },
      { id: 'rcb', label: 'RCB', role: 'CB',  x: 70, y: 69 },
      // Goalkeeper (Bottom Row - 100% visible and unblocked)
      { id: 'gk',  label: 'GK',  role: 'GK',  x: 50, y: 85 },
    ]
  },
  '5s': {
    name: '2-2 Box',
    label: '2-2',
    type: '5s',
    totalSlots: 5,
    slots: [
      // Attackers
      { id: 'ls',  label: 'LS',  role: 'ST',  x: 36, y: 23 },
      { id: 'rs',  label: 'RS',  role: 'ST',  x: 64, y: 23 },
      // Defenders
      { id: 'lcb', label: 'LCB', role: 'CB',  x: 34, y: 64 },
      { id: 'rcb', label: 'RCB', role: 'CB',  x: 66, y: 64 },
      // Goalkeeper
      { id: 'gk',  label: 'GK',  role: 'GK',  x: 50, y: 84 },
    ]
  }
};

/**
 * Maps player position string to tactical category
 */
const getPositionCategory = (pos) => {
  if (!pos) return 'MID';
  const p = pos.toUpperCase().trim();
  if (p === 'GK') return 'GK';
  if (['LB', 'RB', 'CB', 'LCB', 'RCB', 'LWB', 'RWB', 'DEF'].includes(p)) return 'DEF';
  if (['ST', 'CF', 'LW', 'RW', 'LF', 'RF', 'FWD'].includes(p)) return 'ATT';
  return 'MID';
};

/**
 * Standardized player rating resolver
 */
export const getPlayerRating = (player) => {
  if (!player) return 98;
  if (player.overallRating !== undefined && player.overallRating !== null) {
    const num = Number(player.overallRating);
    if (!isNaN(num) && num > 0) return num;
  }
  if (player.rating !== undefined && player.rating !== null) {
    const num = Number(player.rating);
    if (!isNaN(num) && num > 0) return num;
  }
  if (player.ovr !== undefined && player.ovr !== null) {
    const num = Number(player.ovr);
    if (!isNaN(num) && num > 0) return num;
  }
  if (player.stats && typeof player.stats === 'object') {
    const vals = Object.values(player.stats).map(Number).filter(n => !isNaN(n));
    if (vals.length > 0) return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }
  return 98;
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MINIMALIST SHARP-EDGED BROADCAST OVERALL CARD
 * Clean, compact, sharp-edged typography with crisp hairline gold accent
 * ─────────────────────────────────────────────────────────────────────────────
 */
const EAFCOvrBadge = ({ rating = 98 }) => {
  return (
    <div className="relative select-none flex items-center justify-center">
      {/* Clean Compact Sharp-Edged Glassmorphic Card */}
      <div 
        className="w-[64px] h-[72px] md:w-[68px] md:h-[76px] rounded-none relative overflow-hidden flex flex-col items-center justify-between p-2 bg-slate-950/90 border border-white/20 backdrop-blur-md shadow-2xl transition-all duration-200 hover:border-amber-400/60"
      >
        {/* Top Sharp Gold Line */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 z-10" />

        {/* Minimal Clean Label: OVR */}
        <div className="z-10 mt-0.5">
          <span 
            className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 leading-none pl-[0.1em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            OVR
          </span>
        </div>

        {/* Bold Clean Rating Number */}
        <div className="z-10 flex items-center justify-center my-auto">
          <motion.span 
            key={rating}
            initial={{ scale: 0.95, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="text-3xl md:text-[32px] font-black text-white leading-none tracking-tight drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: 'var(--font-broadcast)' }}
          >
            {rating}
          </motion.span>
        </div>

        {/* Bottom Minimal Hairline Pip */}
        <div className="z-10 w-5 h-[1.5px] bg-amber-400/80 mb-0.5" />
      </div>
    </div>
  );
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SLOTTED PLAYER CARD (NORMAL CARD SIZE + POSITION PILL)
 * ─────────────────────────────────────────────────────────────────────────────
 */
const SlottedPlayerCard = ({ player, slot, isNewlySlotted = false }) => {
  if (!player) return null;

  return (
    <div className="relative flex flex-col items-center select-none" style={{ zIndex: 10 }}>
      {/* Authentic EA FC Player Card (Clean, no background shadow) */}
      <EFootballCard player={player} size="pitch" disableShadow={true} />

      {/* Tactical Position Pill Badge */}
      <motion.div 
        initial={isNewlySlotted ? { opacity: 0, y: -4 } : false}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="absolute top-[calc(100%+6px)] px-3 py-0.5 rounded-full bg-slate-950/90 border border-white/25 text-[10px] font-black text-white uppercase tracking-wider shadow-lg whitespace-nowrap pointer-events-none"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {slot.label || player.position || 'ST'}
      </motion.div>
    </div>
  );
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * EMPTY FORMATION SLOT PLACEHOLDER
 * Minimalist translucent glass silhouette showing the 3D turf underneath
 * ─────────────────────────────────────────────────────────────────────────────
 */
const EmptyPitchSlot = ({ slot }) => {
  return (
    <div className="flex items-center justify-center select-none pointer-events-none">
      {/* Position Pill */}
      <div 
        className="px-3 py-0.5 rounded-full bg-slate-950/80 border border-white/20 text-[10px] font-black text-white/75 uppercase tracking-wider shadow-md whitespace-nowrap"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {slot.label}
      </div>
    </div>
  );
};

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * MAIN TACTICAL PITCH SQUAD COMPONENT
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const TacticalPitchSquad = ({
  stage = 'SIGNING',
  team,
  squad = [],
  format = '11s',
  signingPlayer = null,
  isSigningAnimation = false,
  finalPrice = 0,
  tournament = null,
}) => {
  const currentFormation = FORMATIONS[format] || FORMATIONS['11s'];
  const teamColor = team?.primaryColor || '#22c55e';
  const isSoldView = stage === 'SOLD';

  // Signing Animation State:
  // Starts at center in normal size, pauses briefly, then smoothly glides directly to target slot!
  const [isMoving, setIsMoving] = useState(false);
  const [isSlotted, setIsSlotted] = useState(!isSigningAnimation);

  // Manager Card Display: Strictly show ONLY when manager photo is available and valid
  const [managerImgFailed, setManagerImgFailed] = useState(false);
  useEffect(() => {
    setManagerImgFailed(false);
  }, [team?.managerPhotoUrl]);

  const hasManagerPhoto = Boolean(
    team?.managerPhotoUrl && 
    typeof team.managerPhotoUrl === 'string' && 
    team.managerPhotoUrl.trim() !== '' && 
    !managerImgFailed
  );

  // Watertight slot assignment: STRICTLY ZERO DUPLICATES!
  const { assignedSlots, targetSlotObj, benchPlayers, totalOvr, attRating, midRating, defRating } = useMemo(() => {
    const slots = currentFormation.slots;
    const assigned = {};
    const slottedIds = new Set();
    const bench = [];

    // 1. Determine target slot for signingPlayer if present
    let targetSlot = null;
    if (signingPlayer) {
      const signingPos = (signingPlayer.position || 'ST').toUpperCase();
      const signingCat = getPositionCategory(signingPos);

      // Exact role match first (e.g. ST -> ST slot)
      targetSlot = slots.find(s => s.role === signingPos);
      // Category match fallback (e.g. ST -> any ATT slot like CF, LW, RW)
      if (!targetSlot) {
        targetSlot = slots.find(s => getPositionCategory(s.role) === signingCat);
      }
      // General fallback
      if (!targetSlot) {
        targetSlot = slots[0];
      }
    }

    // If signingPlayer is locked into slot, place them in assignedSlots
    if (signingPlayer && isSlotted && targetSlot) {
      assigned[targetSlot.id] = signingPlayer;
      slottedIds.add(signingPlayer.id);
    }

    // 2. Prepare remaining squad players (strictly excluding signingPlayer to prevent duplicates!)
    const remainingPlayers = (squad || []).filter(p => p.id !== signingPlayer?.id);

    // Open slots for other players (excludes targetSlot while signingPlayer is reserving it)
    const openSlots = slots.filter(s => targetSlot ? s.id !== targetSlot.id : true);

    // Assign remaining players to open slots with 3-pass tactical priority:
    // Pass 1: Exact role matches (e.g. GK -> GK, CB -> LCB/RCB, ST -> ST, CM -> LCM/RCM)
    remainingPlayers.forEach(player => {
      if (slottedIds.has(player.id)) return;
      const playerPos = (player.position || 'CM').toUpperCase();
      const slot = openSlots.find(s => !assigned[s.id] && s.role === playerPos);
      if (slot) {
        assigned[slot.id] = player;
        slottedIds.add(player.id);
      }
    });

    // Pass 2: Positional category matches (e.g. DEF -> DEF slot, MID -> MID slot, ATT -> ATT slot)
    remainingPlayers.forEach(player => {
      if (slottedIds.has(player.id)) return;
      const playerPos = (player.position || 'CM').toUpperCase();
      const playerCat = getPositionCategory(playerPos);
      const slot = openSlots.find(s => !assigned[s.id] && getPositionCategory(s.role) === playerCat);
      if (slot) {
        assigned[slot.id] = player;
        slottedIds.add(player.id);
      }
    });

    // Pass 3: Fill any remaining open slots with unassigned squad players (rest go to bench)
    remainingPlayers.forEach(player => {
      if (slottedIds.has(player.id)) return;
      const slot = openSlots.find(s => !assigned[s.id]);
      if (slot) {
        assigned[slot.id] = player;
        slottedIds.add(player.id);
      } else {
        bench.push(player);
      }
    });

    // Calculate real mathematical OVR & positional breakdowns from assigned starting players
    const startingPlayers = Object.values(assigned);

    const attList = [];
    const midList = [];
    const defList = [];

    slots.forEach(slot => {
      const player = assigned[slot.id];
      if (!player) return;
      const cat = getPositionCategory(slot.role || player.position);
      if (cat === 'ATT') attList.push(player);
      else if (cat === 'MID') midList.push(player);
      else defList.push(player); // DEF or GK
    });

    const calcAvg = (list) => {
      if (!list || list.length === 0) return null;
      return Math.round(list.reduce((sum, p) => sum + getPlayerRating(p), 0) / list.length);
    };

    const attOvr = calcAvg(attList);
    const midOvr = calcAvg(midList);
    const defOvr = calcAvg(defList);

    const avgOvr = startingPlayers.length > 0
      ? Math.round(startingPlayers.reduce((sum, p) => sum + getPlayerRating(p), 0) / startingPlayers.length)
      : (signingPlayer ? getPlayerRating(signingPlayer) : 98);

    return {
      assignedSlots: assigned,
      targetSlotObj: targetSlot,
      benchPlayers: bench,
      totalOvr: avgOvr,
      attRating: attOvr,
      midRating: midOvr,
      defRating: defOvr,
    };
  }, [currentFormation, squad, signingPlayer, isSlotted]);

  // Seamless SOLD ➔ SIGNING Animation Workflow:
  // In SOLD view: card remains stationary at center with the SOLD celebration overlay and stamp.
  // In SIGNING view: SOLD elements dissolve (700ms), then card smoothly glides & scales into formation slot (1.35s).
  useEffect(() => {
    if (!isSigningAnimation || !signingPlayer) {
      setIsMoving(false);
      setIsSlotted(true);
      return;
    }

    if (isSoldView) {
      setIsSlotted(false);
      setIsMoving(false);
      return;
    }

    // Entering SIGNING view:
    // Keep stationary at center for 700ms to allow SOLD stamp & overlay to dissolve cleanly
    setIsSlotted(false);
    setIsMoving(false);

    const tMove = setTimeout(() => {
      setIsMoving(true);
    }, 700);

    // After flight arrives (700ms + 1350ms = 2050ms), lock card cleanly into slot
    const tLock = setTimeout(() => {
      setIsSlotted(true);
      try {
        soundEngine.playSoldFanfare();
      } catch (e) {
        console.error(e);
      }
    }, 2050);

    return () => {
      clearTimeout(tMove);
      clearTimeout(tLock);
    };
  }, [isSigningAnimation, signingPlayer?.id, isSoldView]);

  // Replay helper function
  const replayAnimation = () => {
    if (!isSigningAnimation || !signingPlayer || isSoldView) return;
    setIsSlotted(false);
    setIsMoving(false);
    setTimeout(() => setIsMoving(true), 600);
    setTimeout(() => {
      setIsSlotted(true);
      try { soundEngine.playSoldFanfare(); } catch (err) {}
    }, 1950);
  };

  // Replay shortcut on 'r' / 'R' key for testing or re-showcasing
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'r' || e.key === 'R') {
        replayAnimation();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isSigningAnimation, signingPlayer, isSoldView]);

  return (
    <div 
      onClick={replayAnimation}
      className="w-full h-full relative overflow-hidden bg-slate-950 text-white select-none cursor-default"
    >
      
      {/* ── 1. FULL-SCREEN 3D STADIUM PITCH BACKGROUND ── */}
      <img 
        src="/assets/tactical_pitch_3d.jpg" 
        alt="3D Tactical Stadium Pitch"
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
      />

      {/* ── 2. CLEAN TOP HEADER (LEFT: LOGO + NAME + FORMATION | RIGHT: OVR ONLY) ── */}
      <motion.div 
        animate={{ opacity: isSoldView ? 0 : 1, y: isSoldView ? -15 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute top-0 inset-x-0 z-30 px-8 py-4 flex items-center justify-between"
        style={{ pointerEvents: isSoldView ? 'none' : 'auto' }}
      >
        {/* Left: Club Crest + Team Name + Formation (Balanced broadcast size) */}
        <div className="flex items-center gap-3.5 md:gap-4">
          <div className="w-[72px] h-[72px] md:w-[76px] md:h-[76px] flex items-center justify-center shrink-0">
            {team?.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" />
            ) : (
              <Shield className="w-14 h-14 md:w-16 md:h-16 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" style={{ color: teamColor }} />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h1 
              className="text-2xl md:text-3xl lg:text-[32px] font-normal uppercase text-white tracking-wider leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: 'var(--font-broadcast)', fontWeight: 500 }}
            >
              {team?.name || 'MY TEAM'}
            </h1>
            <div 
              className="text-xs md:text-sm lg:text-[14px] font-bold uppercase tracking-[0.16em] text-slate-300 leading-none mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {currentFormation.label}
            </div>
          </div>
        </div>

        {/* Center: Open & clean */}
        <div className="hidden md:block" />

        {/* Right: OVERALL RATING CARD */}
        <div className="flex items-center">
          <EAFCOvrBadge 
            rating={totalOvr} 
            att={attRating}
            mid={midRating}
            def={defRating}
            teamColor={teamColor}
          />
        </div>
      </motion.div>

      {/* ── 3. FORMATION SLOTS ON FIELD ── */}
      <motion.div 
        animate={{ opacity: isSoldView ? 0 : 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="absolute inset-0 z-10 pointer-events-none"
      >
        {currentFormation.slots.map(slot => {
          const isTarget = isSigningAnimation && targetSlotObj?.id === slot.id;
          const playerInSlot = assignedSlots[slot.id];

          // While card is moving from center to target slot, keep target slot as empty outline
          const showAsEmpty = isSigningAnimation && isTarget && !isSlotted;

          return (
            <div
              key={slot.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
              style={{
                left: `${slot.x}%`,
                top: `${slot.y}%`,
              }}
            >
              {playerInSlot && !showAsEmpty ? (
                <SlottedPlayerCard
                  player={playerInSlot}
                  slot={slot}
                  isNewlySlotted={isTarget}
                />
              ) : (
                <EmptyPitchSlot
                  slot={slot}
                />
              )}
            </div>
          );
        })}
      </motion.div>

      {/* ── SOLD CELEBRATION OVERLAY (Smoothly dissolves when entering SIGNING) ── */}
      <AnimatePresence>
        {isSoldView && (
          <motion.div
            key="sold-celebration-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } }}
            className="absolute inset-0 z-30 pointer-events-none select-none"
          >
            {/* Massive Team Logo Ambient Background Aura */}
            {team?.logoUrl && (
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] mix-blend-screen pointer-events-none z-0">
                <motion.img
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1.6, opacity: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  src={team.logoUrl}
                  className="w-[850px] h-[850px] object-contain blur-[2px]"
                />
              </div>
            )}

            {/* Ambient Color Glow */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] blur-[160px] -z-10 rounded-full opacity-25 pointer-events-none"
              style={{ backgroundColor: teamColor }}
            />

            {/* TOP HEADER: OFFICIAL TRANSFER TO [TEAM] */}
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="absolute top-6 md:top-8 inset-x-0 flex flex-col items-center pointer-events-none text-center px-4 z-20"
            >
              <div
                className="text-xs md:text-sm tracking-[0.45em] text-amber-400 uppercase mb-1.5 font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                Official Transfer To
              </div>
              <div
                className="text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-wider drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] leading-none text-white"
                style={{ fontFamily: 'var(--font-broadcast)' }}
              >
                {team?.name || 'NEW CLUB'}
              </div>
            </motion.div>

            {/* LEFT: FINAL TRANSFER FEE (Vertically centered at 50% alongside card) */}
            <div
              style={{
                position: 'absolute',
                left: 'calc(50% - 370px)',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-none z-30 select-none flex flex-col items-center justify-center max-w-[420px]"
            >
              <motion.div
                initial={{ x: -30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -30, opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 90, damping: 18 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="text-xs md:text-sm font-black text-amber-400/90 uppercase tracking-[0.35em] mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  Final Transfer Fee
                </div>
                <div
                  className="text-6xl md:text-7xl lg:text-8xl xl:text-[92px] font-black text-white tracking-normal drop-shadow-[0_20px_50px_rgba(0,0,0,0.95)] leading-none whitespace-nowrap"
                  style={{ fontFamily: 'var(--font-broadcast)' }}
                >
                  {formatCurrency(finalPrice, tournament?.currency)}
                </div>
              </motion.div>
            </div>

            {/* RIGHT: CLUB CREST (Vertically centered at 50%, refined balanced size) */}
            <div
              style={{
                position: 'absolute',
                left: 'calc(50% + 350px)',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              className="pointer-events-none z-30 select-none flex items-center justify-center"
            >
              <motion.div
                initial={{ x: 30, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 30, opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 90, damping: 18 }}
                className="flex items-center justify-center"
              >
                {team?.logoUrl ? (
                  <img
                    src={team.logoUrl}
                    alt={team.name}
                    className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 object-contain drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)]"
                  />
                ) : (
                  <Shield
                    className="w-28 h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 drop-shadow-[0_20px_45px_rgba(0,0,0,0.9)]"
                    style={{ color: teamColor }}
                  />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. SMOOTH SIGNING CARD: STARTS AT CENTER IN CLEAN COMPACT SIZE -> GOES TO SQUAD POSITION ── */}
      <AnimatePresence>
        {isSigningAnimation && signingPlayer && !isSlotted && targetSlotObj && (
          <motion.div
            key="smooth-signing-card"
            initial={{
              left: '50%',
              top: '50%',
              x: '-50%',
              y: '-50%',
              scale: 1,
              opacity: 1,
            }}
            animate={
              isMoving
                ? {
                    left: `${targetSlotObj.x}%`,
                    top: `${targetSlotObj.y}%`,
                    x: '-50%',
                    y: '-50%',
                    scale: 0.52 / 1.35, // Scales 432x594 (size="xl") down to exact 166.4x228.8 pitch card size (size="pitch")
                    opacity: 1,
                  }
                : {
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%',
                    scale: 1, // Grand showcase size matching the old SOLD and SIGNING card size (size="xl")
                    opacity: 1,
                  }
            }
            exit={{
              opacity: 0,
              transition: { duration: 0.08 }
            }}
            transition={{
              duration: 1.35,
              ease: [0.22, 1, 0.36, 1], // Buttery smooth natural deceleration
            }}
            style={{
              position: 'absolute',
              transformOrigin: 'center center',
            }}
            className="z-40 pointer-events-none"
          >
            {/* The Authentic Player Card in Grand Showcase Size (size="xl", matching old view) */}
            <div className="relative">
              <EFootballCard
                player={{ ...signingPlayer, clubLogo: team?.logoUrl || signingPlayer.clubLogo }}
                size="xl"
                highlight={true}
                disableShadow={true}
              />

              {/* EPIC SOLD STAMP BANNER (Visible on card during SOLD stage, dissolves upon entering SIGNING) */}
              <AnimatePresence>
                {isSoldView && (
                  <motion.div
                    key="sold-stamp-banner"
                    initial={{ scale: 2.2, opacity: 0, rotate: -8, x: '-50%', y: '-50%' }}
                    animate={{ scale: 1, opacity: 1, rotate: -8, x: '-50%', y: '-50%' }}
                    exit={{ scale: 0.6, opacity: 0, x: '-50%', y: '-50%', transition: { duration: 0.3, ease: 'easeIn' } }}
                    transition={{ type: 'spring', stiffness: 160, damping: 13 }}
                    style={{
                      position: 'absolute',
                      top: '55.5%',
                      left: '50%',
                      transformOrigin: 'center center',
                    }}
                    className="pointer-events-none z-50 flex items-center justify-center"
                  >
                    {/* Double-bordered Official Auction Stamp Badge */}
                    <div 
                      className="w-[330px] h-[64px] p-1 bg-gradient-to-r from-red-950/95 via-black/95 to-red-950/95 backdrop-blur-md border-[2.5px] border-red-500 rounded-sm flex items-center justify-center shadow-[0_0_28px_rgba(220,38,38,0.7),0_15px_35px_rgba(0,0,0,0.95)]"
                    >
                      <div className="w-full h-full border border-red-400/40 rounded-[2px] flex items-center justify-center px-4">
                        <span 
                          className="text-white font-black text-[50px] uppercase drop-shadow-[0_0_14px_rgba(239,68,68,0.95)] leading-none select-none text-center" 
                          style={{ 
                            fontFamily: 'var(--font-broadcast)',
                            letterSpacing: '0.22em',
                            marginRight: '-0.22em',
                          }}
                        >
                          SOLD
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. RIGHT SIDEBAR: SUBSTITUTES / BENCH CARDS (TOP TO BOTTOM) ── */}
      {benchPlayers.length > 0 && (
        <motion.div 
          animate={{ opacity: isSoldView ? 0 : 1, x: isSoldView ? 30 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute top-[112px] right-6 z-30 flex flex-col items-center gap-3.5 max-h-[calc(100vh-130px)] overflow-y-auto pointer-events-auto py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', pointerEvents: isSoldView ? 'none' : 'auto' }}
        >
          {/* Section Header Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/85 border border-white/20 backdrop-blur-md shadow-xl select-none">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span 
              className="text-[10px] font-black uppercase tracking-widest text-slate-200"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              BENCH ({benchPlayers.length})
            </span>
          </div>

          {/* Cards Stacked Top to Bottom */}
          <div className="flex flex-col items-center gap-3">
            {benchPlayers.map((player) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative flex flex-col items-center select-none transition-transform duration-200 hover:scale-105"
              >
                {/* Compact Authentic EA FC Player Card */}
                <EFootballCard
                  player={{ ...player, clubLogo: team?.logoUrl || player.clubLogo }}
                  size={0.38}
                  disableShadow={true}
                />

                {/* Sub Position Pill */}
                <div 
                  className="mt-1 px-2.5 py-0.5 rounded-full bg-slate-950/90 border border-white/25 text-[9px] font-black text-white uppercase tracking-wider shadow-md whitespace-nowrap pointer-events-none"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {player.position || 'SUB'}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── 6. LEFT BOTTOM: MINIMAL & CLEAN SHARP-EDGED MANAGER CARD ── */}
      {hasManagerPhoto && (
        <motion.div 
          animate={{ opacity: isSoldView ? 0 : 1, y: isSoldView ? 20 : 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="absolute bottom-6 left-8 z-30 select-none pointer-events-auto"
          style={{ pointerEvents: isSoldView ? 'none' : 'auto' }}
        >
          <div 
            className="w-[170px] h-[252px] md:w-[185px] md:h-[272px] rounded-none relative overflow-hidden flex flex-col justify-between bg-slate-950/90 border border-white/20 backdrop-blur-md shadow-2xl transition-all duration-300 hover:border-amber-400/60"
          >
            {/* Top Sharp Gold Line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 z-20" />

            {/* Manager Photo Area */}
            <div className="relative w-full flex-1 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
              <img 
                src={team.managerPhotoUrl} 
                alt={team.managerName || 'Manager'} 
                onError={() => setManagerImgFailed(true)}
                className="w-full h-full object-cover object-top transition-transform duration-300 hover:scale-105"
              />

              {/* Clean Bottom Gradient Fade into Info Plate */}
              <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none z-10" />

              {/* Clean Floating Club Logo on Top-Left */}
              {team?.logoUrl && (
                <div className="absolute top-3 left-3 z-20 w-8 h-8 flex items-center justify-center drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                  <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* Clean Minimalist Lower-Third Nameplate */}
            <div className="z-20 px-3 py-2.5 bg-slate-950/95 border-t border-white/10 flex flex-col items-center text-center">
              <span 
                className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 leading-none pl-[0.25em]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                MANAGER
              </span>
              <div 
                className="text-sm md:text-base font-black uppercase text-white tracking-wider leading-tight mt-1 truncate max-w-full drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]"
                style={{ fontFamily: 'var(--font-broadcast)' }}
                title={team?.managerName || 'HEAD COACH'}
              >
                {team?.managerName || 'HEAD COACH'}
              </div>
            </div>
          </div>
        </motion.div>
      )}

    </div>
  );
};
