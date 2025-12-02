

import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import { Mesh, Group, Vector3, MathUtils, Euler, AdditiveBlending } from 'three';
import { CatAction, Language, TRANSLATIONS } from '../types';
import { audioService } from '../services/audio';

interface Cat3DProps {
  action: CatAction;
  position?: [number, number, number];
  walkTarget?: Vector3 | null;
  lookAtTarget?: Vector3 | null;
  onMovementComplete?: () => void;
  onClick?: () => void;
  language: Language;
  isEscaping?: boolean; // New prop for moon escape
}

// Helper to ease angles
const lerpAngle = (start: number, end: number, alpha: number) => {
    let diff = end - start;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return start + diff * alpha;
};

export const Cat3D: React.FC<Cat3DProps> = ({ action, position = [0, 0, 0], walkTarget, lookAtTarget, onMovementComplete, onClick, language, isEscaping = false }) => {
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null); 
  const tailRef = useRef<Group>(null);
  const tailWrapperRef = useRef<Group>(null); // New ref for moving tail position
  const bodyRef = useRef<Group>(null);
  const legFL = useRef<Group>(null);
  const legFR = useRef<Group>(null);
  const legBL = useRef<Group>(null);
  const legBR = useRef<Group>(null);
  const earLRef = useRef<Group>(null);
  const earRRef = useRef<Group>(null);
  const eyelidLRef = useRef<Mesh>(null);
  const eyelidRRef = useRef<Mesh>(null);
  
  // Props
  const fishingRodRef = useRef<Group>(null);
  const flameRef = useRef<Group>(null);
  
  const [time, setTime] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const actionTimeRef = useRef(0);
  const lastStepTimeRef = useRef(0); // For footsteps
  
  const restingPosition = useRef<Vector3>(new Vector3(...position));
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.position.set(...position);
    }
  }, []); 

  const ACTION_LOCATIONS: Record<string, Vector3> = {
      eating: new Vector3(-2, 0, 1.7), // Adjusted back slightly to avoid head clipping bowl
      drinking: new Vector3(-1.1, 0, 1.7), 
      using_litter: new Vector3(14, 0.35, -6), // Corrected Litter Box Location
      sleeping: new Vector3(3, 0, -4), 
      waking_up: new Vector3(3, 0, -4),
      scratching: new Vector3(5.5, 0, -7),
      playing_ball: new Vector3(2, 0, 2.5),
      playing_gomoku: new Vector3(0, 0, 3.5),
      playing_xiangqi: new Vector3(0, 0, 3.5),
      playing_match3: new Vector3(0, 0, 3.5), // Match 3 at same location
      preparing_game: new Vector3(0, 0, 3.5),
      yoga: new Vector3(-2, 0, -3),
      fishing: new Vector3(0, 0, 4),
      singing: new Vector3(0, 0, 0),
      dancing: new Vector3(0, 0, 0),
      climbing: new Vector3(7.2, 0, -6.2), // Base of Soft Cat Tree
      falling: new Vector3(0, 8, 0), // Start fall from higher ceiling for dramatic effect
      watching_birds: new Vector3(-13, 0, -2), // LEFT wall window
      hiding: new Vector3(-12, 0, 2), // Inside box (Left Side)
      hunting: new Vector3(-0.8, 0, 3), // Near toy mouse on floor
      reading: new Vector3(9, 0.65, 4), // ON TOP of Sofa Cushion (y=0.65)
  };

  useEffect(() => {
      if (action === 'idle' && groupRef.current) {
          restingPosition.current.copy(groupRef.current.position);
          restingPosition.current.y = 0;
      }
      actionTimeRef.current = 0; // Reset local action timer
  }, [action]);

  // CRITICAL FIX: Reset timer when escape starts so the rocket animation plays from the beginning
  useEffect(() => {
      if (isEscaping) {
          actionTimeRef.current = 0;
          if (groupRef.current) {
              groupRef.current.position.set(0, 0, 0);
              groupRef.current.rotation.set(0, 0, 0);
          }
      }
  }, [isEscaping]);

  // RESET POSITION WHEN ESCAPE ENDS
  useEffect(() => {
      if (!isEscaping && groupRef.current) {
          // Reset any lingering Y offset from flight
          if (action !== 'falling') {
            groupRef.current.position.y = 0;
            groupRef.current.rotation.z = 0;
            groupRef.current.rotation.x = 0;
          }
      }
  }, [isEscaping, action]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    setTime((t) => t + delta);
    actionTimeRef.current += delta;
    const t = state.clock.getElapsedTime();
    const actionT = actionTimeRef.current;

    // --- MOUSE TRACKING ---
    // Smoothly rotate head to look at mouse if interactive
    if (headRef.current && lookAtTarget && !isEscaping) {
        // Calculate direction to target relative to cat
        const targetLocal = lookAtTarget.clone().sub(groupRef.current.position);
        
        // Account for cat's body rotation
        const bodyRot = groupRef.current.rotation.y;
        
        // Calculate yaw (left/right) relative to body
        const targetAngleY = Math.atan2(targetLocal.x, targetLocal.z);
        let relativeAngleY = targetAngleY - bodyRot;
        
        // Normalize angle -PI to PI
        while (relativeAngleY > Math.PI) relativeAngleY -= Math.PI * 2;
        while (relativeAngleY < -Math.PI) relativeAngleY += Math.PI * 2;

        // Calculate pitch (up/down)
        const distance = Math.sqrt(targetLocal.x * targetLocal.x + targetLocal.z * targetLocal.z);
        const targetAngleX = Math.atan2(targetLocal.y - 0.5, distance); // 0.5 is approx head height

        // Clamp rotations to realistic neck limits
        const clampedY = MathUtils.clamp(relativeAngleY, -1.0, 1.0); // +/- 60 deg yaw
        const clampedX = MathUtils.clamp(targetAngleX, -0.8, 0.8); // +/- 45 deg pitch

        // Apply smooth interpolation
        headRef.current.rotation.y = lerpAngle(headRef.current.rotation.y, clampedY, 0.1);
        headRef.current.rotation.x = lerpAngle(headRef.current.rotation.x, -clampedX, 0.1); // Invert pitch for three.js coords
    }

    // --- BLINKING & SQUINTING ---
    let forceCloseEyes = false;
    let forceOpenEyes = false;
    
    if (action === 'using_litter' && actionT > 1.5 && actionT < 3.5) forceCloseEyes = true; 
    if ((action === 'eating' || action === 'drinking' || action === 'petting') && Math.sin(t * 8) > 0.2) forceCloseEyes = true; 

    if (action !== 'sleeping' && !forceCloseEyes && Math.random() < 0.005) {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
    }
    
    if (eyelidLRef.current && eyelidRRef.current) {
        let targetY = 0.0; // Open
        if (blink || forceCloseEyes || action === 'sleeping') targetY = 1.0; // Closed
        
        const scaleVal = MathUtils.lerp(eyelidLRef.current.scale.y, targetY > 0.5 ? 0.1 : 1, 0.4);
        
        eyelidLRef.current.scale.y = scaleVal;
        eyelidRRef.current.scale.y = scaleVal;
    }

    // --- ESCAPE SEQUENCE: SHIP FLIGHT ---
    if (isEscaping) {
        const launchStartTime = 1.5;
        const liftT = Math.max(0, actionT - launchStartTime);
        
        if (actionT < launchStartTime) {
            // Violent shake
            groupRef.current.position.x = (Math.random() - 0.5) * 0.15;
            groupRef.current.position.z = (Math.random() - 0.5) * 0.15;
            groupRef.current.position.y = 0; 
            
            if (flameRef.current) {
                const flicker = 0.5 + Math.random() * 0.5;
                flameRef.current.scale.set(flicker, flicker, flicker);
            }
        } 
        else {
            const lift = Math.pow(liftT, 2.5) * 8; 
            groupRef.current.position.y = lift;
            groupRef.current.position.x = 0;
            groupRef.current.position.z = 0;

            groupRef.current.rotation.z = Math.sin(t * 10) * 0.05;
            groupRef.current.rotation.x = -0.1; 
            
            if (flameRef.current) {
                const blast = 2.0 + Math.random() * 0.5 + liftT * 2.0;
                flameRef.current.scale.set(blast * 0.8, blast * 1.5, blast * 0.8);
            }
        }
        return; 
    }

    // --- MOVEMENT & NAVIGATION ---
    let targetPos = restingPosition.current.clone(); 
    let moveSpeed = 6 * delta;
    
    if ((action === 'walking' || action === 'wandering') && walkTarget) targetPos.copy(walkTarget);
    else if (ACTION_LOCATIONS[action]) targetPos.copy(ACTION_LOCATIONS[action]);

    if (action === 'falling') {
         const duration = 1.0;
         const fallProgress = Math.min(1, actionT / duration);
         if (fallProgress < 1) {
             const yVal = 8 * (1 - fallProgress * fallProgress);
             groupRef.current.position.y = yVal;
             groupRef.current.rotation.x = Math.sin(t*20) * 0.2;
             groupRef.current.rotation.z = Math.cos(t*20) * 0.2;
         } else {
             const bounceT = (actionT - duration) * 10;
             groupRef.current.position.y = Math.max(0, Math.sin(bounceT) * 0.2 * Math.exp(-bounceT));
             groupRef.current.rotation.set(0,0,0);
         }
         
         // Manually animate limbs here since we return early
         if(legFL.current) legFL.current.rotation.x = Math.sin(t*40);
         if(legFR.current) legFR.current.rotation.x = Math.cos(t*40);
         if(legBL.current) legBL.current.rotation.x = Math.sin(t*40);
         if(legBR.current) legBR.current.rotation.x = Math.cos(t*40);
         if(tailRef.current) tailRef.current.rotation.x = t*30; 
         if(headRef.current) headRef.current.rotation.x = -0.5;

         if (actionT > duration + 0.5 && onMovementComplete) onMovementComplete();
         return;
    }

    const currentPos = groupRef.current.position;
    const dx = targetPos.x - currentPos.x;
    const dz = targetPos.z - currentPos.z;
    const distanceToTarget = Math.sqrt(dx * dx + dz * dz);
    let isMoving = false;

    if ((action === 'walking' || action === 'wandering' || ACTION_LOCATIONS[action]) && action !== 'climbing') {
        if (distanceToTarget > 0.1) {
             isMoving = true;
             const factor = Math.min(1, moveSpeed / distanceToTarget);
             groupRef.current.position.x += dx * factor;
             groupRef.current.position.z += dz * factor;
             
             // Snap Y to 0 for walking, but lerp to target height if arriving
             if (action !== 'walking' && action !== 'wandering' && ACTION_LOCATIONS[action]) {
                 groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, targetPos.y, 0.2);
             } else {
                 groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, 0.2);
             }

             const angle = Math.atan2(dx, dz);
             groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, angle, 0.15);
        } else {
            if (action === 'walking' || action === 'wandering') {
                restingPosition.current.copy(groupRef.current.position);
                if (onMovementComplete) onMovementComplete();
            } else {
                 // Snap to exact position
                 groupRef.current.position.x = targetPos.x;
                 groupRef.current.position.z = targetPos.z;
                 groupRef.current.position.y = targetPos.y; // Important for sofa sitting

                 let targetRotY = 0;
                 if (['eating', 'drinking'].includes(action)) targetRotY = Math.PI; 
                 else if (['sleeping', 'waking_up', 'petting'].includes(action)) targetRotY = -Math.PI/4;
                 else if (['using_litter', 'grooming'].includes(action)) targetRotY = Math.PI/2;
                 else if (action === 'scratching') targetRotY = 1.1;
                 else if (['playing_gomoku', 'playing_xiangqi', 'playing_match3', 'singing', 'dancing', 'fishing', 'preparing_game'].includes(action)) targetRotY = 0;
                 else if (action === 'yoga') targetRotY = Math.PI/4;
                 else if (action === 'watching_birds') targetRotY = -Math.PI/2;
                 else if (action === 'hiding') targetRotY = Math.PI; 
                 else if (action === 'hunting') targetRotY = Math.PI; 
                 else if (action === 'reading') targetRotY = 0; // Face forward on sofa
                 
                 groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, targetRotY, 0.1);
            }
        }
    } 
    
    // --- POSE SYSTEM ---
    let mode = 0; 
    if (['singing', 'dancing', 'preparing_game'].includes(action)) mode = 1;
    if (['playing_gomoku', 'playing_xiangqi', 'playing_match3', 'fishing', 'yoga', 'watching_birds', 'reading'].includes(action)) mode = 2;

    let tgtBodyPos = new Vector3(0, 0.4, 0);
    let tgtBodyRot = new Euler(0, 0, 0);
    let tgtHeadPos = new Vector3(0, 0.65, 0.5);
    let tgtHeadRot = new Euler(0, 0, 0);
    let tgtFLPos = new Vector3(-0.25, 0.4, 0.4);
    let tgtFLRot = new Euler(0, 0, 0);
    let tgtFRPos = new Vector3(0.25, 0.4, 0.4);
    let tgtFRRot = new Euler(0, 0, 0);
    let tgtBLPos = new Vector3(-0.25, 0.4, -0.4);
    let tgtBLRot = new Euler(0, 0, 0);
    let tgtBRPos = new Vector3(0.25, 0.4, -0.4);
    let tgtBRRot = new Euler(0, 0, 0);
    let tgtTailWrapperPos = new Vector3(0, 0.45, -0.4); // Default tail pos
    let tgtTailRot = new Euler(-0.5, 0, 0);

    // --- APPLY MODE MODIFIERS ---
    
    if (mode === 1) { 
        // --- STANDING (Humanoid) ---
        tgtBodyPos.set(0, 0.65, 0);
        tgtBodyRot.set(-Math.PI / 2 + 0.15, 0, 0); 
        tgtHeadPos.set(0, 1.15, 0.15);
        tgtBLPos.set(-0.25, 0.35, 0);
        tgtBRPos.set(0.25, 0.35, 0);
        tgtBLRot.y = -0.3;
        tgtBRRot.y = 0.3;
        tgtFLPos.set(-0.35, 1.0, 0.2); 
        tgtFLRot.set(-0.5, 0, -0.5); 
        tgtFRPos.set(0.35, 1.0, 0.2);
        tgtFRRot.set(-0.5, 0, 0.5);
        tgtTailWrapperPos.set(0, 0.6, -0.3); // Raise tail base
    } else if (mode === 2) {
        // --- SITTING (Humanoid) ---
        tgtBodyPos.set(0, 0.45, 0); 
        tgtBodyRot.set(-Math.PI / 2, 0, 0); 
        tgtHeadPos.set(0, 0.9, 0.1);
        tgtBLPos.set(-0.3, 0.15, 0.4);
        tgtBLRot.set(-Math.PI / 2, -0.2, 0); 
        tgtBRPos.set(0.3, 0.15, 0.4);
        tgtBRRot.set(-Math.PI / 2, 0.2, 0);
        tgtFLPos.set(-0.3, 0.75, 0.3);
        tgtFLRot.set(-1.0, 0, -0.2);
        tgtFRPos.set(0.3, 0.75, 0.3);
        tgtFRRot.set(-1.0, 0, 0.2);
        tgtTailWrapperPos.set(0, 0.3, -0.4);
    }

    // --- ANIMATION OVERRIDES ---
    if (isMoving && mode === 0 && action !== 'climbing') {
        const speed = 18;
        tgtBodyPos.y += Math.abs(Math.sin(t * speed * 2)) * 0.05;
        tgtHeadPos.y += Math.abs(Math.sin(t * speed * 2 - 0.5)) * 0.03;
        tgtFLRot.x = Math.sin(t * speed) * 0.8;
        tgtFRRot.x = Math.sin(t * speed + Math.PI) * 0.8;
        tgtBLRot.x = Math.sin(t * speed + Math.PI) * 0.8;
        tgtBRRot.x = Math.sin(t * speed) * 0.8;

        const stepInterval = Math.PI / speed;
        if (t - lastStepTimeRef.current > stepInterval) {
            audioService.playStep();
            lastStepTimeRef.current = t;
        }
    } 
    else if (action === 'dancing') {
        // High Energy Dancing!
        const beat = t * 15;
        const danceMove = Math.floor(t / 4) % 4; // Cycle moves every 4 seconds

        // Body Bounce
        tgtBodyPos.y += Math.abs(Math.sin(beat)) * 0.1;
        tgtHeadRot.z = Math.cos(beat * 0.5) * 0.1;

        if (danceMove === 0) {
            // Move 1: The Twist
            tgtBodyRot.y = Math.sin(beat) * 0.5;
            tgtFLRot.z = Math.cos(beat) * 0.5 + 2.5; // Arms Up!
            tgtFRRot.z = Math.cos(beat) * 0.5 - 2.5;
            tgtBLRot.x = Math.sin(beat) * 0.5;
            tgtBRRot.x = -Math.sin(beat) * 0.5;
        } else if (danceMove === 1) {
            // Move 2: The Wave
            tgtFLRot.z = Math.sin(beat) * 0.5 + 2.5;
            tgtFRRot.z = Math.sin(beat + Math.PI) * 0.5 - 2.5;
            tgtBodyRot.z = Math.sin(beat * 0.5) * 0.2;
        } else if (danceMove === 2) {
            // Move 3: Disco Point
            if (Math.sin(beat) > 0) {
                tgtFLRot.x = -Math.PI; tgtFLRot.z = 0.5; // Point Up
                tgtFRRot.x = 0; tgtFRRot.z = -1.0; // Hand on Hip
            } else {
                tgtFLRot.x = 0; tgtFLRot.z = 1.0;
                tgtFRRot.x = -Math.PI; tgtFRRot.z = -0.5;
            }
        } else {
            // Move 4: Double Pump
            tgtFLRot.x = Math.sin(beat * 2) * 0.5 - 1.5;
            tgtFRRot.x = Math.sin(beat * 2) * 0.5 - 1.5;
            tgtHeadRot.x = Math.sin(beat * 2) * 0.2;
        }
        tgtTailRot.z = Math.sin(beat * 2) * 0.5;
    }
    else if (action === 'climbing') {
        const climbTime = actionT;
        // Force snap to start location if not already
        if (groupRef.current) {
             const startPos = ACTION_LOCATIONS['climbing'];
             groupRef.current.position.x = startPos.x;
             groupRef.current.position.z = startPos.z;
             groupRef.current.position.y = 0; // Reset Y here, handle vertical in body
        }

        // Phase 1: Scratching (0s - 1.5s)
        if (climbTime < 1.5) {
            tgtBodyPos.set(0, 0.6, 0);
            tgtBodyRot.set(-Math.PI / 2.5, 0, 0); // Reared up
            
            // Scratching motion
            const scratchSpeed = 20;
            tgtFLPos.set(-0.25, 1.2, 0.3);
            tgtFRPos.set(0.25, 1.2, 0.3);
            tgtFLRot.x = -1.5 + Math.sin(t * scratchSpeed) * 0.2;
            tgtFRRot.x = -1.5 + Math.cos(t * scratchSpeed) * 0.2;
            
            tgtHeadPos.set(0, 1.1, 0.2);
            tgtHeadRot.x = -0.5; // Look up
            tgtTailWrapperPos.set(0, 0.3, -0.3);
        } 
        // Phase 2: Jumping/Climbing Up (1.5s - 2.5s)
        else if (climbTime < 2.5) {
            const progress = (climbTime - 1.5);
            const currentY = MathUtils.lerp(0.6, 5.35, progress);
            
            // Move body UP
            tgtBodyPos.y = currentY;
            // Move body forward/inward onto platform
            tgtBodyPos.z = MathUtils.lerp(0, -0.5, progress); 
            tgtBodyPos.x = MathUtils.lerp(0, 0.5, progress);
            
            tgtBodyRot.x = -Math.PI / 2; // Vertical climb pose
            
            // Shift all body parts up with the body
            tgtHeadPos.y = currentY + 0.5;
            tgtFLPos.y = currentY + 0.3;
            tgtFRPos.y = currentY + 0.3;
            tgtBLPos.y = currentY - 0.3;
            tgtBRPos.y = currentY - 0.3;
            tgtTailWrapperPos.y = currentY - 0.2;

            // Scramble legs
            tgtFLRot.x = Math.sin(t * 30);
            tgtFRRot.x = Math.cos(t * 30);
            tgtBLRot.x = Math.cos(t * 30);
            tgtBRRot.x = Math.sin(t * 30);
        }
        // Phase 3: Perched on top (2.5s+)
        else {
            const topY = 5.35;
            
            // Calculate angle to face camera
            const catPos = ACTION_LOCATIONS['climbing'];
            const dx = camera.position.x - catPos.x;
            const dz = camera.position.z - catPos.z;
            const faceCameraAngle = Math.atan2(dx, dz);
            
            // Apply rotation to entire group for correct facing
            if (groupRef.current) {
                groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, faceCameraAngle, 0.1);
            }

            // Sitting on platform (Relative coords now that group is rotated)
            tgtBodyPos.set(0, topY, 0); 
            
            // Sitting Pose (Humanoid style sitting on edge)
            tgtBodyRot.set(-Math.PI / 2, 0, 0); 
            
            tgtHeadPos.set(0, topY + 0.45, 0.1);
            
            // Back legs sitting
            tgtBLPos.set(-0.3, topY - 0.3, 0.3); 
            tgtBRPos.set(0.3, topY - 0.3, 0.3);
            tgtBLRot.set(-Math.PI/2, -0.2, 0);
            tgtBRRot.set(-Math.PI/2, 0.2, 0);

            // Left paw down (supporting)
            tgtFLPos.set(-0.3, topY + 0.3, 0.2);
            tgtFLRot.set(-1.0, 0, -0.2);
            
            // Right paw HIGH UP (Peace Sign!)
            tgtFRPos.set(0.4, topY + 0.65, 0.2); // Next to head
            tgtFRRot.set(-2.8, 0.5, 0.5); // Raised and angled
            
            // Cute Head Tilt
            tgtHeadRot.z = -0.4; // Tilt towards the raised paw
            
            // Fast Happy Tail
            tgtTailWrapperPos.set(0, topY, -0.4);
            tgtTailRot.x = -0.5;
            tgtTailRot.z = Math.sin(t * 12) * 0.4;
        }
    }
    
    // Apply Lerps (Standard)
    const LERP_SPEED = action === 'dancing' ? 0.3 : 0.15;
    
    if (bodyRef.current) {
        bodyRef.current.position.lerp(tgtBodyPos, LERP_SPEED);
        bodyRef.current.rotation.x = lerpAngle(bodyRef.current.rotation.x, tgtBodyRot.x, LERP_SPEED);
        bodyRef.current.rotation.y = lerpAngle(bodyRef.current.rotation.y, tgtBodyRot.y, LERP_SPEED);
        bodyRef.current.rotation.z = lerpAngle(bodyRef.current.rotation.z, tgtBodyRot.z, LERP_SPEED);
    }
    if (headRef.current) {
        headRef.current.position.lerp(tgtHeadPos, LERP_SPEED);
        headRef.current.rotation.x = lerpAngle(headRef.current.rotation.x, tgtHeadRot.x, LERP_SPEED);
        headRef.current.rotation.y = lerpAngle(headRef.current.rotation.y, tgtHeadRot.y, LERP_SPEED);
        headRef.current.rotation.z = lerpAngle(headRef.current.rotation.z, tgtHeadRot.z, LERP_SPEED);
    }
    
    const applyLeg = (ref: React.RefObject<Group>, pos: Vector3, rot: Euler) => {
        if (!ref.current) return;
        ref.current.position.lerp(pos, LERP_SPEED);
        ref.current.rotation.x = lerpAngle(ref.current.rotation.x, rot.x, LERP_SPEED);
        ref.current.rotation.y = lerpAngle(ref.current.rotation.y, rot.y, LERP_SPEED);
        ref.current.rotation.z = lerpAngle(ref.current.rotation.z, rot.z, LERP_SPEED);
    };

    applyLeg(legFL, tgtFLPos, tgtFLRot);
    applyLeg(legFR, tgtFRPos, tgtFRRot);
    applyLeg(legBL, tgtBLPos, tgtBLRot);
    applyLeg(legBR, tgtBRPos, tgtBRRot);
    
    // Apply Tail Position (Wrapper) and Rotation (Inner)
    if (tailWrapperRef.current) {
        tailWrapperRef.current.position.lerp(tgtTailWrapperPos, LERP_SPEED);
    }
    if (tailRef.current) {
        tailRef.current.rotation.x = lerpAngle(tailRef.current.rotation.x, tgtTailRot.x, LERP_SPEED);
        tailRef.current.rotation.y = lerpAngle(tailRef.current.rotation.y, tgtTailRot.y, LERP_SPEED);
        tailRef.current.rotation.z = lerpAngle(tailRef.current.rotation.z, tgtTailRot.z, LERP_SPEED);
    }
    
    if (fishingRodRef.current && action === 'fishing') {
        fishingRodRef.current.rotation.z = Math.sin(t) * 0.05;
    }
  });

  const handlePointerOver = () => {
      document.body.style.cursor = 'pointer';
      setHovered(true);
  };
  const handlePointerOut = () => {
      document.body.style.cursor = 'auto';
      setHovered(false);
  };

  const furColor = hovered ? "#fff0f5" : "#ffffff";
  const FurMaterial = <meshStandardMaterial color={furColor} roughness={1} />;
  const PinkMaterial = <meshStandardMaterial color="#ffb7d5" roughness={0.5} />;
  const WhiskerMaterial = <meshBasicMaterial color="#cccccc" />;
  
  const hideStatusBubble = action === 'playing_gomoku' || action === 'playing_xiangqi' || action === 'playing_match3' || isEscaping;
  const statusText = (action !== 'idle' && !hideStatusBubble) ? t.status[action as keyof typeof t.status] : null;
  const bubbleY = (action === 'climbing' && actionTimeRef.current > 1) ? 
     Math.min(4.6, 1.6 + (actionTimeRef.current - 1) * 1.5) : 1.6;

  return (
    <group 
        ref={groupRef} 
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
    >
      {/* STATUS BUBBLE */}
      {statusText && (
          <Html position={[0, bubbleY, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="whitespace-nowrap bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border-2 border-white/50 text-sm font-bold text-gray-700 animate-fade-in-up flex flex-col items-center">
                  <div className="absolute -bottom-1 w-2 h-2 bg-white/90 rotate-45 border-r border-b border-white/50"></div>
                  {statusText}
              </div>
          </Html>
      )}

      {/* HEADPHONES */}
      {action === 'dancing' && !isEscaping && (
           <group position={[0, 1.25, 0.15]} rotation={[0, 0, 0]}>
               <mesh position={[0, 0.15, 0]} rotation={[0, 0, Math.PI/2]}>
                   <torusGeometry args={[0.3, 0.03, 16, 32, Math.PI]} />
                   <meshStandardMaterial color="#222" />
               </mesh>
               <mesh position={[-0.32, -0.05, 0]} rotation={[0, 0, Math.PI/2]}>
                   <cylinderGeometry args={[0.08, 0.08, 0.1, 32]} />
                   <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.5} />
               </mesh>
                <mesh position={[0.32, -0.05, 0]} rotation={[0, 0, Math.PI/2]}>
                   <cylinderGeometry args={[0.08, 0.08, 0.1, 32]} />
                   <meshStandardMaterial color="#ff00ff" emissive="#ff00ff" emissiveIntensity={0.5} />
               </mesh>
           </group>
      )}

      {/* ROCKET SHIP (Escape Mode) */}
      {isEscaping && (
          <group position={[0, 1.0, 0]} scale={[3, 3, 3]}>
               <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                   <cylinderGeometry args={[0.6, 0.8, 2.5, 32]} />
                   <meshStandardMaterial color="#f0f0f0" roughness={0.3} metalness={0.4} emissive="#333333" />
               </mesh>
               <mesh position={[0, 2.25, 0]}>
                   <coneGeometry args={[0.6, 1.0, 32]} />
                   <meshStandardMaterial color="#ef4444" roughness={0.2} emissive="#ef4444" emissiveIntensity={0.2} />
               </mesh>
               {[0, 2, 4].map((i) => (
                   <group key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
                       <mesh position={[0.7, -0.5, 0]} rotation={[0, 0, 0.2]}>
                           <boxGeometry args={[0.6, 1.2, 0.1]} />
                           <meshStandardMaterial color="#ef4444" emissive="#7f1d1d" />
                       </mesh>
                   </group>
               ))}
               <mesh position={[0, -0.9, 0]}>
                   <cylinderGeometry args={[0.5, 0.7, 0.4, 32]} />
                   <meshStandardMaterial color="#333" />
               </mesh>
               <group ref={flameRef} position={[0, -0.9, 0]}>
                   <mesh position={[0, -0.75, 0]} rotation={[Math.PI, 0, 0]}>
                       <coneGeometry args={[0.2, 1.5, 16, 1, true]} />
                       <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={AdditiveBlending} depthWrite={false} />
                   </mesh>
               </group>
          </group>
      )}

      {/* NORMAL CAT PARTS */}
      <group visible={!isEscaping}>
        {/* BODY */}
        <group ref={bodyRef}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.35, 0.6, 32, 32]} />
                {FurMaterial}
            </mesh>
        </group>

        {/* HEAD (Cute 1:1 Rebuild) */}
        <group ref={headRef}>
            {/* Main Round Head (Bun Shape) */}
            <mesh castShadow scale={[1.15, 1.0, 1.0]}>
                <sphereGeometry args={[0.52, 64, 64]} />
                {FurMaterial}
            </mesh>

            {/* Ears (Rounder, softer) */}
            <group ref={earRRef} position={[0.35, 0.4, 0]} rotation={[0, 0, -0.5]}>
                <mesh castShadow>
                    <coneGeometry args={[0.15, 0.3, 32]} />{FurMaterial}
                </mesh>
                <mesh position={[0, -0.02, 0.08]} rotation={[0.1, 0, 0]}>
                    <coneGeometry args={[0.08, 0.2, 32]} />{PinkMaterial}
                </mesh>
            </group>
            <group ref={earLRef} position={[-0.35, 0.4, 0]} rotation={[0, 0, 0.5]}>
                <mesh castShadow>
                    <coneGeometry args={[0.15, 0.3, 32]} />{FurMaterial}
                </mesh>
                <mesh position={[0, -0.02, 0.08]} rotation={[0.1, 0, 0]}>
                    <coneGeometry args={[0.08, 0.2, 32]} />{PinkMaterial}
                </mesh>
            </group>

            {/* EYES (Anime Style - Giant) */}
            <group position={[0, 0.02, 0.48]}>
                {/* Left Eye */}
                <group position={[-0.2, 0, 0]} rotation={[0, -0.15, 0]}>
                    {/* Dark Iris/Pupil Background */}
                    <mesh scale={[1, 1.1, 0.6]}>
                        <sphereGeometry args={[0.14, 32, 32]} />
                        <meshStandardMaterial color="#3e2723" roughness={0.1} />
                    </mesh>
                    {/* Big Highlight (Top Right) */}
                    <mesh position={[0.05, 0.06, 0.11]}>
                        <sphereGeometry args={[0.045]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                    {/* Small Highlight (Bottom Left) */}
                    <mesh position={[-0.04, -0.05, 0.11]}>
                        <sphereGeometry args={[0.02]} />
                        <meshBasicMaterial color="white" opacity={0.8} transparent />
                    </mesh>
                    {/* Eyelid (Blink) */}
                    <mesh ref={eyelidLRef} position={[0, 0, 0]} scale={[1, 0.1, 1]}> {/* Starts open (scale 0.1) */}
                         <mesh position={[0, 0.14, 0.05]} rotation={[-0.2, 0, 0]}>
                            <sphereGeometry args={[0.145, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                            {FurMaterial}
                         </mesh>
                    </mesh>
                </group>

                {/* Right Eye */}
                <group position={[0.2, 0, 0]} rotation={[0, 0.15, 0]}>
                    <mesh scale={[1, 1.1, 0.6]}>
                        <sphereGeometry args={[0.14, 32, 32]} />
                        <meshStandardMaterial color="#3e2723" roughness={0.1} />
                    </mesh>
                    <mesh position={[0.05, 0.06, 0.11]}>
                        <sphereGeometry args={[0.045]} />
                        <meshBasicMaterial color="white" />
                    </mesh>
                    <mesh position={[-0.04, -0.05, 0.11]}>
                        <sphereGeometry args={[0.02]} />
                        <meshBasicMaterial color="white" opacity={0.8} transparent />
                    </mesh>
                    <mesh ref={eyelidRRef} position={[0, 0, 0]} scale={[1, 0.1, 1]}>
                         <mesh position={[0, 0.14, 0.05]} rotation={[-0.2, 0, 0]}>
                            <sphereGeometry args={[0.145, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                            {FurMaterial}
                         </mesh>
                    </mesh>
                </group>
                
                {/* Eyebrows (Curved/Arched) */}
                <mesh position={[-0.2, 0.22, 0]} rotation={[0, 0, 0.1]}>
                    <torusGeometry args={[0.06, 0.008, 8, 16, 2.0]} />
                    <meshStandardMaterial color="#5d4037" />
                </mesh>
                <mesh position={[0.2, 0.22, 0]} rotation={[0, 0, 1.0]}>
                    <torusGeometry args={[0.06, 0.008, 8, 16, 2.0]} />
                    <meshStandardMaterial color="#5d4037" />
                </mesh>
            </group>

            {/* Blush (Pink Cheeks) */}
            <group position={[0, -0.12, 0.48]}>
                <mesh position={[-0.28, 0, 0]} rotation={[0, -0.3, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="#ff8a80" transparent opacity={0.4} depthWrite={false} />
                </mesh>
                <mesh position={[0.28, 0, 0]} rotation={[0, 0.3, 0]}>
                    <circleGeometry args={[0.08, 32]} />
                    <meshBasicMaterial color="#ff8a80" transparent opacity={0.4} depthWrite={false} />
                </mesh>
            </group>

            {/* Nose (Tiny Pink Triangle) */}
            <mesh position={[0, -0.1, 0.52]} scale={[1, 0.8, 0.5]} rotation={[Math.PI, 0, 0]}> 
                <coneGeometry args={[0.03, 0.03, 32]} />
                <meshStandardMaterial color="#ff8a80" roughness={0.4} />
            </mesh>
            
            {/* Mouth (Tiny 'w' shape) */}
            <group position={[0, -0.16, 0.5]} scale={[0.5, 0.5, 0.5]}>
                 <mesh position={[-0.05, 0, 0]} rotation={[0, 0, Math.PI]}>
                     <torusGeometry args={[0.05, 0.008, 8, 16, Math.PI]} />
                     <meshBasicMaterial color="#5d4037" />
                 </mesh>
                 <mesh position={[0.05, 0, 0]} rotation={[0, 0, Math.PI]}>
                     <torusGeometry args={[0.05, 0.008, 8, 16, Math.PI]} />
                     <meshBasicMaterial color="#5d4037" />
                 </mesh>
            </group>

            {/* Whiskers */}
            <group position={[0, -0.12, 0.45]}>
                <mesh position={[0.35, 0.02, -0.05]} rotation={[0, -0.3, 0.1]}><boxGeometry args={[0.25, 0.003, 0.003]} />{WhiskerMaterial}</mesh>
                <mesh position={[0.35, -0.04, -0.05]} rotation={[0, -0.3, -0.1]}><boxGeometry args={[0.25, 0.003, 0.003]} />{WhiskerMaterial}</mesh>
                <mesh position={[-0.35, 0.02, -0.05]} rotation={[0, 0.3, -0.1]}><boxGeometry args={[0.25, 0.003, 0.003]} />{WhiskerMaterial}</mesh>
                <mesh position={[-0.35, -0.04, -0.05]} rotation={[0, 0.3, 0.1]}><boxGeometry args={[0.25, 0.003, 0.003]} />{WhiskerMaterial}</mesh>
            </group>
        </group>

        {/* LEGS */}
        <group>
            <group ref={legFL}><mesh castShadow position={[0, -0.2, 0]}><capsuleGeometry args={[0.09, 0.35, 16, 16]} />{FurMaterial}</mesh></group>
            <group ref={legFR}><mesh castShadow position={[0, -0.2, 0]}><capsuleGeometry args={[0.09, 0.35, 16, 16]} />{FurMaterial}</mesh></group>
            <group ref={legBL}><mesh castShadow position={[0, -0.2, 0]}><capsuleGeometry args={[0.09, 0.35, 16, 16]} />{FurMaterial}</mesh></group>
            <group ref={legBR}><mesh castShadow position={[0, -0.2, 0]}><capsuleGeometry args={[0.09, 0.35, 16, 16]} />{FurMaterial}</mesh></group>
        </group>

        {/* TAIL */}
        {/* We use a ref on this wrapper group to move the tail vertically during climbing */}
        <group ref={tailWrapperRef} position={[0, 0.45, -0.4]}>
            <group ref={tailRef} rotation={[-0.5, 0, 0]}>
                <mesh position={[0, 0.2, -0.1]}><capsuleGeometry args={[0.09, 0.45, 16, 16]} />{FurMaterial}</mesh>
                <mesh position={[0, 0.45, -0.1]}><sphereGeometry args={[0.09, 16, 16]} />{FurMaterial}</mesh>
            </group>
        </group>
      </group>

      {/* SHADOW */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={!isEscaping}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#000000" opacity={0.15} transparent />
      </mesh>

      {/* PROPS */}
      {action === 'singing' && (
          <group position={[0.1, 0, 0.7]}>
              <mesh position={[0, 0.6, 0]}><cylinderGeometry args={[0.02, 0.02, 1.2]} /><meshStandardMaterial color="#333" /></mesh>
              <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.2, 0.2, 0.05]} /><meshStandardMaterial color="#111" /></mesh>
              <mesh position={[0, 1.2, 0]}><sphereGeometry args={[0.08]} /><meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} /></mesh>
          </group>
      )}

      {action === 'yoga' && (
          <mesh position={[0, 0.01, 0.3]} rotation={[-Math.PI/2, 0, 0]}>
              <planeGeometry args={[1.5, 2.5]} />
              <meshStandardMaterial color="#ab47bc" roughness={0.8} />
          </mesh>
      )}

      {action === 'fishing' && (
          <group>
               <group position={[0.2, 0.65, 0.5]} rotation={[0, 0, 0]} ref={fishingRodRef}>
                   <mesh position={[0, 0.5, 0.5]} rotation={[0.8, 0, 0]}><cylinderGeometry args={[0.01, 0.02, 2]} /><meshStandardMaterial color="#8d6e63" /></mesh>
                   <mesh position={[0, 1.45, 1.4]} rotation={[0, 0, 0]}><cylinderGeometry args={[0.002, 0.002, 2]} /><meshBasicMaterial color="#fff" /></mesh>
               </group>
               <mesh position={[0, 0.01, 2.5]} rotation={[-Math.PI/2, 0, 0]}>
                   <circleGeometry args={[1.2, 32]} />
                   <meshStandardMaterial color="#4fc3f7" transparent opacity={0.8} />
               </mesh>
          </group>
      )}
      
      {action === 'reading' && (
          <group position={[0, 0.7, 0.5]} rotation={[0.4, 0, 0]}>
              <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
                  <boxGeometry args={[0.35, 0.25, 0.02]} />
                  <meshStandardMaterial color="#3f51b5" />
              </mesh>
              <mesh position={[0, 0, 0.015]}>
                  <boxGeometry args={[0.33, 0.23, 0.02]} />
                  <meshStandardMaterial color="#fff" />
              </mesh>
              <mesh position={[0, 0, 0.02]} rotation={[0, 0.2, 0]}>
                   <boxGeometry args={[0.16, 0.23, 0.005]} />
                   <meshStandardMaterial color="#eee" />
              </mesh>
              <mesh position={[0, 0, 0.02]} rotation={[0, -0.2, 0]}>
                   <boxGeometry args={[0.16, 0.23, 0.005]} />
                   <meshStandardMaterial color="#eee" />
              </mesh>
          </group>
      )}

    </group>
  );
};