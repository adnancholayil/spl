import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EFootballCard } from '../common/EFootballCard';
import { Shield, Users } from 'lucide-react';
import { soundEngine } from '../../services/soundService';

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
 * REAL-WORLD BROADCAST TEAM OVERALL CARD
 * Clean, minimalist, modern television broadcast card
 * ─────────────────────────────────────────────────────────────────────────────
 */
const EAFCOvrBadge = ({ rating = 98 }) => {
  return (
    <div className="relative select-none flex items-center justify-center">
      {/* Clean Glassmorphic Broadcast Card */}
      <div 
        className="w-[80px] h-[86px] rounded-2xl relative overflow-hidden flex flex-col items-center justify-between p-2.5 bg-slate-950/85 border border-white/20 backdrop-blur-xl shadow-[0_12px_32px_rgba(0,0,0,0.85)] group transition-all"
      >
        {/* Top Metallic Gold Accent Line */}
        <div className="absolute top-0 inset-x-0 h-[2.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-90" />

        {/* Soft Glass Sheen Reflection */}
        <div className="absolute -top-6 -right-6 w-16 h-16 bg-white/10 rounded-full blur-md pointer-events-none transform -rotate-45" />

        {/* Top Label: OVR */}
        <div className="z-10 mt-0.5">
          <span 
            className="text-[10px] font-black uppercase tracking-[0.25em] text-amber-400 leading-none pl-[0.25em]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            OVR
          </span>
        </div>

        {/* Big Bold Clean Rating Number */}
        <div className="z-10 flex items-center justify-center my-auto">
          <motion.span 
            key={rating}
            initial={{ scale: 0.9, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-4xl font-black text-white leading-none tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
            style={{ fontFamily: 'var(--font-broadcast)' }}
          >
            {rating}
          </motion.span>
        </div>

        {/* Bottom Accent Pip */}
        <div className="z-10 w-7 h-[2px] rounded-full bg-gradient-to-r from-transparent via-amber-400/80 to-transparent mb-0.5" />
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
  team,
  squad = [],
  format = '11s',
  signingPlayer = null,
  isSigningAnimation = false,
  tournament = null,
}) => {
  const currentFormation = FORMATIONS[format] || FORMATIONS['11s'];
  const teamColor = team?.primaryColor || '#22c55e';

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

  // Smooth & Clean Signing Animation:
  // 1. Starts at Center in Normal Size (showcase size: size="xl", 432x594)
  // 2. Pauses 1.2s at center so card is clearly admired
  // 3. Smoothly glides & scales directly down into target slot (1.35s duration)
  // 4. Cleanly locks into formation slot, position pill fades in below
  useEffect(() => {
    if (!isSigningAnimation || !signingPlayer) {
      setIsMoving(false);
      setIsSlotted(true);
      return;
    }

    setIsSlotted(false);
    setIsMoving(false);

    // After 1.2s at center, trigger smooth glide to target slot
    const tMove = setTimeout(() => {
      setIsMoving(true);
    }, 1200);

    // When card arrives at slot (1.2s pause + 1.35s flight = 2.55s), lock cleanly into slot
    const tLock = setTimeout(() => {
      setIsSlotted(true);
      try {
        soundEngine.playSoldFanfare();
      } catch (e) {
        console.error(e);
      }
    }, 2550);

    return () => {
      clearTimeout(tMove);
      clearTimeout(tLock);
    };
  }, [isSigningAnimation, signingPlayer?.id]);

  // Replay helper function
  const replayAnimation = () => {
    if (!isSigningAnimation || !signingPlayer) return;
    setIsSlotted(false);
    setIsMoving(false);
    setTimeout(() => setIsMoving(true), 1200);
    setTimeout(() => {
      setIsSlotted(true);
      try { soundEngine.playSoldFanfare(); } catch (err) {}
    }, 2550);
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
  }, [isSigningAnimation, signingPlayer]);

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
      <div className="absolute top-0 inset-x-0 z-30 px-8 py-4 flex items-center justify-between">
        
        {/* Left: Club Crest + Team Name (Clean, refined size) + Formation */}
        <div className="flex items-center gap-3.5">
          <div className="w-16 h-16 flex items-center justify-center shrink-0">
            {team?.logoUrl ? (
              <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" />
            ) : (
              <Shield className="w-14 h-14 drop-shadow-[0_4px_12px_rgba(0,0,0,0.85)]" style={{ color: teamColor }} />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <h1 
              className="text-2xl md:text-3xl font-normal uppercase text-white tracking-wider leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
              style={{ fontFamily: 'var(--font-broadcast)', fontWeight: 500 }}
            >
              {team?.name || 'MY TEAM'}
            </h1>
            <div 
              className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-300 leading-none mt-1 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]"
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
          />
        </div>
      </div>

      {/* ── 3. FORMATION SLOTS ON FIELD ── */}
      <div className="absolute inset-0 z-10 pointer-events-none">
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
      </div>

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
                    scale: 0.65, // Scales 256x352 down to exact 166.4x228.8 pitch card size (0.52 / 0.80)
                    opacity: 1,
                  }
                : {
                    left: '50%',
                    top: '50%',
                    x: '-50%',
                    y: '-50%',
                    scale: 1, // Compact, elegant center size
                    opacity: 1,
                  }
            }
            exit={{
              opacity: 0,
              transition: { duration: 0.08 }
            }}
            transition={{
              duration: 1.3,
              ease: [0.22, 1, 0.36, 1], // Buttery smooth natural deceleration
            }}
            style={{
              position: 'absolute',
              transformOrigin: 'center center',
            }}
            className="z-40 pointer-events-none"
          >
            {/* The Authentic Player Card in Compact First View Size (256x352, no bg shadow) */}
            <EFootballCard
              player={{ ...signingPlayer, clubLogo: team?.logoUrl || signingPlayer.clubLogo }}
              size={0.80}
              disableShadow={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 5. RIGHT SIDEBAR: SUBSTITUTES / BENCH CARDS (TOP TO BOTTOM) ── */}
      {benchPlayers.length > 0 && (
        <div 
          className="absolute top-[112px] right-6 z-30 flex flex-col items-center gap-3.5 max-h-[calc(100vh-130px)] overflow-y-auto pointer-events-auto py-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
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
        </div>
      )}

      {/* ── 6. LEFT BOTTOM: BROADCAST MANAGER CARD (Rendered ONLY when manager image is available) ── */}
      {hasManagerPhoto && (
        <div className="absolute bottom-6 left-8 z-30 select-none pointer-events-auto">
          <div 
            className="w-[170px] h-[248px] md:w-[185px] md:h-[270px] rounded-2xl relative overflow-hidden flex flex-col justify-between bg-slate-950/90 border border-white/20 backdrop-blur-xl shadow-[0_20px_45px_rgba(0,0,0,0.9)] group transition-all duration-300 hover:scale-[1.03] hover:border-amber-400/50"
          >
            {/* Top Gold Accent Bar */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-95 z-20" />

            {/* Manager Photo */}
            <div className="relative w-full flex-1 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-950 flex items-center justify-center">
              <img 
                src={team.managerPhotoUrl} 
                alt={team.managerName || 'Manager'} 
                onError={() => setManagerImgFailed(true)}
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />

              {/* Subtle Bottom Gradient Fade into Info Plate */}
              <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent pointer-events-none z-10" />

              {/* Club Logo Badge on Top-Left */}
              {team?.logoUrl && (
                <div className="absolute top-3 left-3 z-20 w-8 h-8 rounded-full bg-black/70 border border-white/25 p-1 flex items-center justify-center shadow-lg">
                  <img src={team.logoUrl} alt={team.name} className="w-full h-full object-contain" />
                </div>
              )}
            </div>

            {/* Lower Third Broadcast Info Plate */}
            <div className="z-20 px-3.5 py-2.5 bg-slate-950/95 border-t border-white/10 flex flex-col items-center text-center">
              <span 
                className="text-[10px] md:text-[11px] font-black uppercase tracking-[0.25em] text-amber-400 leading-none pl-[0.25em]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                MANAGER
              </span>
              <div 
                className="text-sm md:text-base font-black uppercase text-white tracking-wider leading-tight mt-1 truncate max-w-full drop-shadow-[0_2px_5px_rgba(0,0,0,0.9)]"
                style={{ fontFamily: 'var(--font-display)' }}
                title={team?.managerName || 'HEAD COACH'}
              >
                {team?.managerName || 'HEAD COACH'}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
