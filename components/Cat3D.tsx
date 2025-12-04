




import React, { useRef, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import { Mesh, Group, Vector3, MathUtils, Euler, AdditiveBlending, Raycaster, Plane } from 'three';
import { CatAction, Language, TRANSLATIONS, OutfitId } from '../types';
import { audioService } from '../services/audio';

interface Cat3DProps {
  action: CatAction;
  position?: [number, number, number];
  walkTarget?: Vector3 | null;
  lookAtTarget?: Vector3 | null;
  onMovementComplete?: () => void;
  onClick?: () => void;
  onTailClick?: () => void; // New prop for tail interaction
  language: Language;
  isEscaping?: boolean; // New prop for moon escape
  outfit?: OutfitId;
  chaseTarget?: React.RefObject<Group>; // New prop for mouse chasing
}

// Helper to ease angles
const lerpAngle = (start: number, end: number, alpha: number) => {
    let diff = end - start;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return start + diff * alpha;
};

// Global objects to avoid GC
const floorPlane = new Plane(new Vector3(0, 1, 0), 0);
const raycaster = new Raycaster();
const mouseTargetVec = new Vector3();

// --- ACCESSORIES COMPONENT ---
const CatAccessories = ({ outfit }: { outfit: OutfitId }) => {
    return (
        <>
            {/* CASUAL: Red Bowtie */}
            {outfit === 'casual' && (
                <group position={[0, -0.15, 0.45]} rotation={[0.2, 0, 0]}>
                    <mesh position={[-0.12, 0, 0]} rotation={[0, 0, 0.5]}><coneGeometry args={[0.08, 0.2, 32]} /><meshStandardMaterial color="#ef4444" /></mesh>
                    <mesh position={[0.12, 0, 0]} rotation={[0, 0, -0.5]}><coneGeometry args={[0.08, 0.2, 32]} /><meshStandardMaterial color="#ef4444" /></mesh>
                    <mesh><sphereGeometry args={[0.05]} /><meshStandardMaterial color="#b91c1c" /></mesh>
                </group>
            )}

            {/* FORMAL: Tie and Glasses */}
            {outfit === 'formal' && (
                <>
                    {/* Tie */}
                    <group position={[0, -0.35, 0.45]} rotation={[0.1, 0, 0]}>
                         <mesh position={[0, 0.1, 0]}><boxGeometry args={[0.12, 0.1, 0.05]} /><meshStandardMaterial color="#111" /></mesh>
                         <mesh position={[0, -0.1, 0]} rotation={[0, Math.PI/4, Math.PI]}><coneGeometry args={[0.08, 0.4, 4]} /><meshStandardMaterial color="#111" /></mesh>
                    </group>
                    {/* Glasses */}
                    <group position={[0, 0.05, 0.58]}>
                        <mesh position={[-0.18, 0, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.1, 0.015, 8, 32]} /><meshStandardMaterial color="#333" /></mesh>
                        <mesh position={[0.18, 0, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.1, 0.015, 8, 32]} /><meshStandardMaterial color="#333" /></mesh>
                        <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.15, 0.01, 0.01]} /><meshStandardMaterial color="#333" /></mesh>
                    </group>
                </>
            )}

            {/* WINTER: Beanie and Scarf */}
            {outfit === 'winter' && (
                <>
                    {/* Beanie */}
                    <group position={[0, 0.45, 0]}>
                         <mesh position={[0, 0, 0]}><sphereGeometry args={[0.53, 32, 32, 0, Math.PI * 2, 0, Math.PI/2]} /><meshStandardMaterial color="#3b82f6" /></mesh>
                         <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.5, 0.06, 16, 32]} /><meshStandardMaterial color="#1d4ed8" /></mesh>
                         <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.12]} /><meshStandardMaterial color="#eff6ff" /></mesh>
                    </group>
                    {/* Scarf */}
                    <group position={[0, -0.25, 0.1]} rotation={[0.2, 0, 0]}>
                         <mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.38, 0.08, 16, 32]} /><meshStandardMaterial color="#ef4444" /></mesh>
                         <group position={[0.2, -0.1, 0.3]} rotation={[0.2, 0, -0.2]}>
                             <mesh position={[0, -0.15, 0]}><boxGeometry args={[0.12, 0.4, 0.05]} /><meshStandardMaterial color="#ef4444" /></mesh>
                         </group>
                    </group>
                </>
            )}

             {/* SUMMER: Sun Hat and Lei */}
             {outfit === 'summer' && (
                <>
                    {/* Straw Hat */}
                    <group position={[0, 0.4, 0]}>
                         <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.35, 0.5, 0.3]} /><meshStandardMaterial color="#fcd34d" /></mesh>
                         <mesh position={[0, -0.15, 0]}><cylinderGeometry args={[0.8, 0.8, 0.02]} /><meshStandardMaterial color="#fcd34d" /></mesh>
                         <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.36, 0.51, 0.1]} /><meshStandardMaterial color="#ef4444" /></mesh>
                    </group>
                    {/* Sunglasses */}
                     <group position={[0, 0.02, 0.55]}>
                        <mesh position={[-0.18, 0, 0]}><boxGeometry args={[0.2, 0.12, 0.02]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                        <mesh position={[-0.18, 0, 0]}><boxGeometry args={[0.2, 0.12, 0.02]} /><meshStandardMaterial color="#111" roughness={0.2} /></mesh>
                        <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.15, 0.01, 0.01]} /><meshStandardMaterial color="#333" /></mesh>
                    </group>
                    {/* Flower Lei */}
                    <group position={[0, -0.25, 0]} rotation={[0.1, 0, 0]}>
                         <mesh rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.4, 0.06, 8, 12]} /><meshStandardMaterial color="#ec4899" /></mesh>
                    </group>
                </>
            )}

            {/* HALLOWEEN: Witch Hat & Wings */}
            {outfit === 'halloween' && (
                <>
                    {/* Witch Hat */}
                    <group position={[0, 0.4, 0]} rotation={[-0.2, 0, 0]}>
                         <mesh position={[0, 0.4, 0]}><coneGeometry args={[0.3, 1.0, 32]} /><meshStandardMaterial color="#312e81" /></mesh>
                         <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.8, 0.8, 0.02]} /><meshStandardMaterial color="#312e81" /></mesh>
                         <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.32, 0.38, 0.1]} /><meshStandardMaterial color="#fbbf24" /></mesh>
                    </group>
                    {/* Bat Wings (Attached to neck area) */}
                    <group position={[0, -0.2, -0.2]}>
                        <mesh position={[-0.4, 0, 0]} rotation={[0, 0.5, 0]}><planeGeometry args={[0.8, 0.6]} /><meshStandardMaterial color="#111" side={2} /></mesh>
                        <mesh position={[0.4, 0, 0]} rotation={[0, -0.5, 0]}><planeGeometry args={[0.8, 0.6]} /><meshStandardMaterial color="#111" side={2} /></mesh>
                    </group>
                </>
            )}

            {/* CHRISTMAS: Santa Hat & Cape */}
            {outfit === 'christmas' && (
                <>
                    {/* Santa Hat */}
                    <group position={[0, 0.45, 0]} rotation={[0, 0, 0.1]}>
                         {/* White trim */}
                         <mesh position={[0, -0.1, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.5, 0.08, 16, 32]} /><meshStandardMaterial color="#fff" /></mesh>
                         {/* Red Cone */}
                         <mesh position={[0.1, 0.3, 0]} rotation={[0, 0, -0.2]}><coneGeometry args={[0.48, 1.0, 32]} /><meshStandardMaterial color="#dc2626" /></mesh>
                         {/* Pom pom (flopped over) */}
                         <mesh position={[0.6, 0, 0]}><sphereGeometry args={[0.12]} /><meshStandardMaterial color="#fff" /></mesh>
                    </group>
                    {/* Red Cape */}
                    <group position={[0, -0.25, 0]}>
                         <mesh position={[0, -0.3, -0.25]} rotation={[0.2, 0, 0]}>
                            <boxGeometry args={[0.6, 0.8, 0.1]} />
                            <meshStandardMaterial color="#dc2626" />
                         </mesh>
                         <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}><torusGeometry args={[0.36, 0.04, 16, 32]} /><meshStandardMaterial color="#fff" /></mesh>
                    </group>
                </>
            )}

        </>
    );
};


export const Cat3D: React.FC<Cat3DProps> = ({ action, position = [0, 0, 0], walkTarget, lookAtTarget, onMovementComplete, onClick, onTailClick, language, isEscaping = false, outfit = 'none', chaseTarget }) => {
  const { camera, pointer } = useThree();
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null); 
  const eyeLRef = useRef<Group>(null);
  const eyeRRef = useRef<Group>(null);
  const tailRef = useRef<Group>(null);
  const tailWrapperRef = useRef<Group>(null); 
  const bodyRef = useRef<Group>(null);
  const legFL = useRef<Group>(null);
  const legFR = useRef<Group>(null);
  const legBL = useRef<Group>(null);
  const legBR = useRef<Group>(null);
  const earLRef = useRef<Group>(null);
  const earRRef = useRef<Group>(null);
  const eyelidLRef = useRef<Mesh>(null);
  const eyelidRRef = useRef<Mesh>(null);
  const blushRef = useRef<Group>(null);
  
  // Props
  const fishingRodRef = useRef<Group>(null);
  const flameRef = useRef<Group>(null);
  const shockwaveRef = useRef<Mesh>(null);
  const pillarRef = useRef<Mesh>(null);
  
  const [time, setTime] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  const actionTimeRef = useRef(0);
  const lastStepTimeRef = useRef(0); // For footsteps
  
  const pounceState = useRef({ active: false, time: 0 }); // Track pounce animation
  
  const restingPosition = useRef<Vector3>(new Vector3(...position));
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.position.set(...position);
    }
  }, []); 

  const ACTION_LOCATIONS: Record<string, Vector3> = {
      eating: new Vector3(-2, 0, 1.7), 
      drinking: new Vector3(-1.1, 0, 1.7), 
      using_litter: new Vector3(14, 0.35, -6),
      sleeping: new Vector3(3, 0, -4), 
      waking_up: new Vector3(3, 0, -4),
      scratching: new Vector3(5.5, 0, -7),
      playing_ball: new Vector3(2, 0, 2.5),
      playing_gomoku: new Vector3(0, 0, 3.5),
      playing_xiangqi: new Vector3(0, 0, 3.5),
      playing_match3: new Vector3(0, 0, 3.5),
      preparing_game: new Vector3(0, 0, 3.5),
      yoga: new Vector3(-2, 0, -3),
      fishing: new Vector3(0, 0, 4),
      singing: new Vector3(0, 0, 0),
      dancing: new Vector3(0, 0, 0),
      climbing: new Vector3(7.2, 0, -6.2), 
      falling: new Vector3(0, 8, 0), 
      watching_birds: new Vector3(-13, 0, -2), 
      hiding: new Vector3(-12, 0, 2), 
      hunting: new Vector3(-0.8, 0, 3), 
      reading: new Vector3(9, 0.65, 4), 
      catnip_high: new Vector3(5.5, 0, 6), // Near coffee table
      opening_blind_box: new Vector3(-10.5, 0, -5.5), // Near Christmas Tree (Tree is at -12.5, 0, -7.5)
  };

  useEffect(() => {
      if (action === 'idle' && groupRef.current) {
          restingPosition.current.copy(groupRef.current.position);
          restingPosition.current.y = 0;
      }
      actionTimeRef.current = 0;
      // Reset pounce state on action change
      if (action !== 'chasing') {
          pounceState.current.active = false;
          pounceState.current.time = 0;
      }
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

    // --- BLIND BOX VFX ANIMATION ---
    if (action === 'opening_blind_box') {
        const impactTime = 1.25;
        // Shockwave Expansion
        if (shockwaveRef.current) {
            if (actionT > impactTime && actionT < impactTime + 0.8) {
                const p = (actionT - impactTime) / 0.8;
                shockwaveRef.current.visible = true;
                shockwaveRef.current.scale.setScalar(1 + p * 10);
                // @ts-ignore
                shockwaveRef.current.material.opacity = 1 - p;
            } else {
                shockwaveRef.current.visible = false;
                shockwaveRef.current.scale.setScalar(0);
            }
        }
        // Light Pillar Growth
        if (pillarRef.current) {
            if (actionT > impactTime && actionT < impactTime + 1.0) {
                const p = (actionT - impactTime);
                pillarRef.current.visible = true;
                // Grow up
                pillarRef.current.scale.y = p * 10;
                pillarRef.current.position.y = p * 5;
                // Fade out
                // @ts-ignore
                pillarRef.current.material.opacity = Math.max(0, 0.8 - p * 0.8);
            } else {
                pillarRef.current.visible = false;
            }
        }
    }

    // --- MOUSE/TARGET TRACKING ---
    let effectiveTarget = lookAtTarget;
    
    // Chase target override
    if (action === 'chasing' && chaseTarget?.current) {
        effectiveTarget = chaseTarget.current.position;
    }
    // If no explicit target provided, raycast mouse to floor plane
    else if (!effectiveTarget && !isEscaping) {
        raycaster.setFromCamera(pointer, camera);
        raycaster.ray.intersectPlane(floorPlane, mouseTargetVec);
        effectiveTarget = mouseTargetVec;
    }

    // Smoothly rotate head to look at mouse/target if interactive
    // DISABLE HEAD TRACKING during special animations
    if (headRef.current && effectiveTarget && !isEscaping && 
        !['tail_grabbed', 'catnip_high', 'sleeping', 'waking_up', 'opening_blind_box'].includes(action)) {
        
        const targetLocal = effectiveTarget.clone().sub(groupRef.current.position);
        const bodyRot = groupRef.current.rotation.y;
        
        const targetAngleY = Math.atan2(targetLocal.x, targetLocal.z);
        let relativeAngleY = targetAngleY - bodyRot;
        
        while (relativeAngleY > Math.PI) relativeAngleY -= Math.PI * 2;
        while (relativeAngleY < -Math.PI) relativeAngleY += Math.PI * 2;

        const distance = Math.sqrt(targetLocal.x * targetLocal.x + targetLocal.z * targetLocal.z);
        const targetAngleX = Math.atan2(targetLocal.y - 0.5, distance); 

        const clampedY = MathUtils.clamp(relativeAngleY, -1.0, 1.0);
        const clampedX = MathUtils.clamp(targetAngleX, -0.8, 0.8); 

        // Apply smooth interpolation to HEAD
        // In pounce mid-air, head should track target aggressively
        const headSpeed = pounceState.current.active ? 0.3 : 0.1;
        headRef.current.rotation.y = lerpAngle(headRef.current.rotation.y, clampedY, headSpeed);
        headRef.current.rotation.x = lerpAngle(headRef.current.rotation.x, -clampedX, headSpeed);

        // --- EYE TRACKING ---
        if (eyeLRef.current && eyeRRef.current) {
            let eyeYaw = relativeAngleY - headRef.current.rotation.y;
            while (eyeYaw > Math.PI) eyeYaw -= Math.PI * 2;
            while (eyeYaw < -Math.PI) eyeYaw += Math.PI * 2;
            let eyePitch = -targetAngleX - headRef.current.rotation.x;

            const clampedEyeYaw = MathUtils.clamp(eyeYaw, -0.6, 0.6);
            const clampedEyePitch = MathUtils.clamp(eyePitch, -0.6, 0.6);

            const eyeLerp = 0.2;
            eyeLRef.current.rotation.y = lerpAngle(eyeLRef.current.rotation.y, clampedEyeYaw, eyeLerp);
            eyeLRef.current.rotation.x = lerpAngle(eyeLRef.current.rotation.x, clampedEyePitch, eyeLerp);
            
            eyeRRef.current.rotation.y = lerpAngle(eyeRRef.current.rotation.y, clampedEyeYaw, eyeLerp);
            eyeRRef.current.rotation.x = lerpAngle(eyeRRef.current.rotation.x, clampedEyePitch, eyeLerp);
        }
    } else {
        // Return to neutral if not tracking
        if (eyeLRef.current && eyeRRef.current && action !== 'catnip_high' && action !== 'opening_blind_box') {
            eyeLRef.current.rotation.y = lerpAngle(eyeLRef.current.rotation.y, 0, 0.1);
            eyeLRef.current.rotation.x = lerpAngle(eyeLRef.current.rotation.x, 0, 0.1);
            eyeRRef.current.rotation.y = lerpAngle(eyeRRef.current.rotation.y, 0, 0.1);
            eyeRRef.current.rotation.x = lerpAngle(eyeRRef.current.rotation.x, 0, 0.1);
        }
    }

    // --- BLINKING & EYES ---
    let forceCloseEyes = false;
    let forceOpenEyes = false;
    
    if (action === 'using_litter' && actionT > 1.5 && actionT < 3.5) forceCloseEyes = true; 
    if (action === 'petting') forceCloseEyes = true;
    else if ((action === 'eating' || action === 'drinking') && Math.sin(t * 8) > 0.2) forceCloseEyes = true; 
    
    // BELLY RUB: Half closed eyes during deep enjoyment phase
    if (action === 'belly_rub' && actionT > 1.2 && actionT < 1.6) forceCloseEyes = true;

    // CHASE MODE: Wide eyes, focused
    if (action === 'chasing') forceOpenEyes = true;

    // TAIL GRAB: Wide eyes during shock/turn
    if (action === 'tail_grabbed') forceOpenEyes = true;

    // CATNIP: 
    if (action === 'catnip_high') {
        if (actionT < 0.3) forceOpenEyes = true; // Surprise
        else if (actionT > 2.0 && actionT < 2.6) forceCloseEyes = true; // Collapse
    }

    // BLIND BOX
    if (action === 'opening_blind_box') {
        if (actionT < 0.3) forceOpenEyes = true; // Discovery
        else if (actionT > 1.5 && actionT < 2.0) forceCloseEyes = true; // Happy close eyes
    }

    if (action !== 'sleeping' && !forceCloseEyes && !forceOpenEyes && Math.random() < 0.005) {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
    }
    
    if (eyelidLRef.current && eyelidRRef.current) {
        let targetY = 0.0; // Open
        if (blink || forceCloseEyes) targetY = 1.0; // Closed
        else if (forceOpenEyes) targetY = -0.2; // Extra open
        else if (action === 'sleeping') {
             // Gradual closing over 0.8s
             targetY = Math.min(1.0, actionT * 1.25);
        }

        // CATNIP SPECIFIC EYE LIDS
        if (action === 'catnip_high' && actionT > 0.6 && actionT < 1.2) {
             targetY = 0.5; // Half-lidded "stoned" look
        }

        const scaleVal = MathUtils.lerp(eyelidLRef.current.scale.y, targetY > 0.5 ? 0.1 : 1, 0.2);
        
        eyelidLRef.current.scale.y = scaleVal;
        eyelidRRef.current.scale.y = scaleVal;
    }

    // --- ESCAPE SEQUENCE ---
    if (isEscaping) {
        const launchStartTime = 1.5;
        const liftT = Math.max(0, actionT - launchStartTime);
        
        if (actionT < launchStartTime) {
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
    
    // Fall Animation handled separately
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
         // Animate limbs
         if(legFL.current) legFL.current.rotation.x = Math.sin(t*40);
         if(legFR.current) legFR.current.rotation.x = Math.cos(t*40);
         if(legBL.current) legBL.current.rotation.x = Math.sin(t*40);
         if(legBR.current) legBR.current.rotation.x = Math.cos(t*40);
         if(tailRef.current) tailRef.current.rotation.x = t*30; 
         if(headRef.current) headRef.current.rotation.x = -0.5;

         if (actionT > duration + 0.5 && onMovementComplete) onMovementComplete();
         return;
    }

    // Chase Target Handling
    if (action === 'chasing' && chaseTarget?.current) {
        targetPos.copy(chaseTarget.current.position);
    } else if ((action === 'walking' || action === 'wandering') && walkTarget) {
        targetPos.copy(walkTarget);
    } else if (ACTION_LOCATIONS[action]) {
        targetPos.copy(ACTION_LOCATIONS[action]);
    }

    const currentPos = groupRef.current.position;
    const dx = targetPos.x - currentPos.x;
    const dz = targetPos.z - currentPos.z;
    const distanceToTarget = Math.sqrt(dx * dx + dz * dz);
    let isMoving = false;

    // Movement Logic
    const shouldMove = action === 'chasing' || action === 'walking' || action === 'wandering' || (ACTION_LOCATIONS[action] && action !== 'climbing');
    
    // --- CHASE STATE HANDLING (Overrides normal movement) ---
    if (action === 'chasing' && pounceState.current.active) {
        // While pouncing, we control movement manually in the POSE section below to sync with animation
        isMoving = false; 
        // Rotation: Keep facing target direction (or slight lead?)
        const angle = Math.atan2(dx, dz);
        groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, angle, 0.2);
    }
    else if (shouldMove) {
        // Stop distance
        const stopDistance = action === 'chasing' ? 0.8 : 0.1; // Chasing stop dist triggers pounce
        
        if (distanceToTarget > stopDistance) {
             isMoving = true;
             
             // Chase speed boost
             if (action === 'chasing') moveSpeed = 16 * delta;

             const factor = Math.min(1, moveSpeed / distanceToTarget);
             groupRef.current.position.x += dx * factor;
             groupRef.current.position.z += dz * factor;
             
             // Y axis handling
             if (action !== 'walking' && action !== 'wandering' && action !== 'chasing' && ACTION_LOCATIONS[action]) {
                 groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, targetPos.y, 0.2);
             } else {
                 groupRef.current.position.y = MathUtils.lerp(groupRef.current.position.y, 0, 0.2);
             }

             const angle = Math.atan2(dx, dz);
             groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, angle, 0.2);
        } else {
            // Arrived
            if (action === 'walking' || action === 'wandering') {
                restingPosition.current.copy(groupRef.current.position);
                if (onMovementComplete) onMovementComplete();
            } else if (action !== 'chasing') {
                 // Snap to exact position
                 groupRef.current.position.x = targetPos.x;
                 groupRef.current.position.z = targetPos.z;
                 groupRef.current.position.y = targetPos.y; 

                 let targetRotY = 0;
                 if (['eating', 'drinking'].includes(action)) targetRotY = Math.PI; 
                 else if (['sleeping', 'waking_up', 'petting', 'belly_rub', 'tail_grabbed'].includes(action)) targetRotY = -Math.PI/4;
                 else if (['using_litter', 'grooming'].includes(action)) targetRotY = Math.PI/2;
                 else if (action === 'scratching') targetRotY = 1.1;
                 else if (['playing_gomoku', 'playing_xiangqi', 'playing_match3', 'singing', 'dancing', 'fishing', 'preparing_game'].includes(action)) targetRotY = 0;
                 else if (action === 'yoga') targetRotY = Math.PI/4;
                 else if (action === 'watching_birds') targetRotY = -Math.PI/2;
                 else if (action === 'hiding') targetRotY = Math.PI; 
                 else if (action === 'hunting') targetRotY = Math.PI; 
                 else if (action === 'reading') targetRotY = 0; 
                 else if (action === 'catnip_high') targetRotY = Math.PI/4;
                 else if (action === 'opening_blind_box') targetRotY = Math.PI * 1.25; // Face the tree (roughly)
                 
                 // Don't override rotation if tail grabbed or high (custom rotation logic)
                 if (action !== 'tail_grabbed' && action !== 'catnip_high' && action !== 'sleeping' && action !== 'opening_blind_box') {
                    groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, targetRotY, 0.1);
                 }
            }
        }
    } 
    
    // --- POSE SYSTEM ---
    let mode = 0; 
    if (['singing', 'dancing', 'preparing_game'].includes(action)) mode = 1;
    if (['playing_gomoku', 'playing_xiangqi', 'playing_match3', 'fishing', 'yoga', 'watching_birds', 'reading'].includes(action)) mode = 2;

    let tgtBodyPos = new Vector3(0, 0.4, 0);
    let tgtBodyRot = new Euler(0, 0, 0);
    let tgtBodyScale = new Vector3(1, 1, 1);
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
    let tgtTailWrapperPos = new Vector3(0, 0.45, -0.4); 
    let tgtTailRot = new Euler(-0.5, 0, 0);
    let tgtEarLRot = new Euler(0, 0, 0.5);
    let tgtEarRRot = new Euler(0, 0, -0.5);

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
        tgtTailWrapperPos.set(0, 0.6, -0.3);
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
    
    // === BLIND BOX OPENING ===
    if (action === 'opening_blind_box') {
        const rT = actionTimeRef.current;
        const faceTreeAngle = Math.PI * 1.25;

        // Phase 1: Discovery (0.0 - 0.3s)
        if (rT < 0.3) {
            tgtBodyPos.y = 0.45; // Hop up
            tgtBodyRot.x = -0.2; 
            tgtHeadRot.x = -0.3; // Look up at tree
            
            tgtTailRot.x = 1.0; // Excited tail
            
            groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, faceTreeAngle, 0.1);
        }
        // Phase 2: Inspect (0.3 - 0.7s)
        else if (rT < 0.7) {
            // Walk small arc
            const angleOffset = Math.sin((rT - 0.3) * 10) * 0.5;
            groupRef.current.rotation.y = faceTreeAngle + angleOffset;
            
            // Leaning in
            tgtBodyPos.z = 0.3; 
            tgtHeadPos.z = 0.7; // Neck stretch
            tgtHeadRot.z = Math.sin(rT * 15) * 0.2; // Head tilt scan
        }
        // Phase 3: Charge/Anticipation (0.7 - 1.0s)
        else if (rT < 1.0) {
            // Squash down
            tgtBodyPos.y = 0.25; 
            tgtBodyScale.y = 0.8;
            tgtBodyScale.x = 1.1;
            
            // Wiggle butt
            tgtBodyRot.z = Math.sin(rT * 30) * 0.1;
            tgtTailRot.z = Math.sin(rT * 40) * 0.5;
            
            // Eyes intense (handled in eye logic)
            groupRef.current.rotation.y = faceTreeAngle; // Lock on target
        }
        // Phase 4: COOL JUMP & SPIN (1.0 - 1.25s)
        else if (rT < 1.25) {
            const p = (rT - 1.0) / 0.25;
            // High Jump
            tgtBodyPos.y = 0.3 + Math.sin(p * Math.PI) * 1.5; 
            
            // 360 Spin
            groupRef.current.rotation.y = faceTreeAngle + p * Math.PI * 2;
            
            // Arms Up "SMASH" pose
            tgtFLRot.x = -2.5; 
            tgtFRRot.x = -2.5;
            tgtFLPos.y = 0.8;
            tgtFRPos.y = 0.8;
            
            tgtBodyRot.x = 0;
        }
        // Phase 5: IMPACT (1.25 - 1.5s)
        else if (rT < 1.5) {
            const p = (rT - 1.25) / 0.25;
            
            // Landed
            tgtBodyPos.y = 0.2;
            tgtBodyScale.y = 0.8; // Impact squash
            
            // Paw slam
            tgtFLPos.y = 0.2; tgtFLPos.z = 0.5;
            tgtFRPos.y = 0.2; tgtFRPos.z = 0.5;
            
            tgtHeadRot.x = 0.3; // Head down
        }
        // Phase 6: Victory (1.5s +)
        else {
            const victoryType = Math.floor(rT) % 2; // Alternate logic for variation
            
            if (victoryType === 0) {
                // Bounce
                tgtBodyPos.y = 0.4 + Math.abs(Math.sin(rT * 15)) * 0.3;
                tgtFLRot.z = 2.5; tgtFRRot.z = -2.5; // Cheer
            } else {
                // Spin
                groupRef.current.rotation.y += 0.2;
                tgtBodyRot.z = 0.2;
                tgtTailRot.z = Math.sin(rT * 20);
            }
        }
    }

    // === SLEEPING (Advanced) ===
    else if (action === 'sleeping') {
        const rT = actionTimeRef.current;
        
        // Phase 1: Prepare (0.0 - 0.5s)
        if (rT < 0.5) {
            const p = rT / 0.5;
            tgtBodyPos.y = MathUtils.lerp(0.4, 0.25, p); 
            tgtHeadRot.x = MathUtils.lerp(0, 0.2, p); // Head dip
            tgtTailRot.z = MathUtils.lerp(0, 0.5, p); // Tail tuck
        }
        // Phase 2: Lie Down (0.5 - 1.1s)
        else if (rT < 1.1) {
            const p = (rT - 0.5) / 0.6;
            const easeP = 1 - Math.pow(1 - p, 3); // Ease out
            
            tgtBodyPos.y = 0.2; // Floor
            
            // Rotation transition to side
            tgtBodyRot.z = MathUtils.lerp(0, Math.PI / 2.1, easeP);
            tgtBodyRot.x = MathUtils.lerp(0, 0.2, easeP);
            
            // Squash effect upon landing (around 0.8-1.0)
            if (p > 0.6 && p < 1.0) {
                tgtBodyScale.y = 0.9;
                tgtBodyScale.x = 1.1;
                tgtBodyScale.z = 1.1;
            }

            // Legs tuck
            tgtFLRot.z = MathUtils.lerp(0, -1.0, easeP);
            tgtFRRot.z = MathUtils.lerp(0, 1.0, easeP);
            tgtBLRot.z = MathUtils.lerp(0, -1.0, easeP);
            tgtBRRot.z = MathUtils.lerp(0, 1.0, easeP);
        }
        // Phase 3, 4, 5: Sleep Loop (1.1s+)
        else {
            // Persistent Sleep Pose
            tgtBodyPos.y = 0.22; // Slightly floating for breathing room
            tgtBodyRot.z = Math.PI / 2.1;
            tgtBodyRot.x = 0.2;
            
            tgtHeadRot.z = Math.PI / 3; // Nuzzle into "pillow"
            tgtHeadRot.x = -0.3; // Chin tuck
            
            // Tucked limbs
            tgtFLRot.z = -1.2; tgtFRRot.z = 1.2;
            tgtBLRot.z = -1.2; tgtBRRot.z = 1.2;
            
            // Breathing Animation (Cycle ~2s)
            const breathCycle = (t * 1.5); 
            const breathVal = Math.sin(breathCycle);
            
            // Subtle expansion
            const scaleMag = 0.02;
            tgtBodyScale.y = 1.0 + breathVal * scaleMag;
            tgtBodyScale.x = 1.0 + breathVal * (scaleMag * 0.5);
            tgtBodyScale.z = 1.0 + breathVal * (scaleMag * 0.5);
            
            // Body rise/fall with breath
            tgtBodyPos.y += breathVal * 0.005;

            // Micro-movements (Procedural Twitching)
            // Ear Twitch (Every ~7s approx)
            if (Math.sin(t * 0.9) > 0.98) {
                tgtEarLRot.z += 0.3; // Flick
            }
            // Tail Twitch (Every ~12s)
            if (Math.sin(t * 0.5 + 2) > 0.98) {
                tgtTailRot.x += 0.3;
            }
            // Leg Kick (Dreaming)
            if (Math.sin(t * 1.2 + 4) > 0.98) {
                tgtBLRot.x += 0.4;
            }
        }
    }

    // === WAKING UP ===
    else if (action === 'waking_up') {
        const rT = actionTimeRef.current;
        // Stretch
        tgtBodyPos.y = 0.4;
        tgtBodyRot.x = -0.2; // Arch back up
        tgtBodyRot.z = 0; // Upright
        
        // Big stretch paws out
        tgtFLPos.z = 0.6; tgtFLPos.y = 0.5; tgtFLRot.x = -1.5;
        tgtFRPos.z = 0.6; tgtFRPos.y = 0.5; tgtFRRot.x = -1.5;
        
        tgtHeadRot.x = -0.4; // Look up/yawn
        tgtTailRot.x = 1.0; // Tail up
    }

    // === CATNIP HIGH ===
    else if (action === 'catnip_high') {
        const rT = actionTimeRef.current;
        const targetFaceAngle = Math.PI/4; // Face camera/table
        groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, targetFaceAngle, 0.1);

        // Phase 1: Sniff/Notice (0.0 - 0.3s)
        if (rT < 0.3) {
            tgtBodyPos.y = 0.4;
            tgtHeadPos.y = 0.75; // Lift Head
            tgtHeadRot.x = -0.2; // Look up
            
            tgtEarLRot.x = 0; tgtEarLRot.z = 0; // Erect
            tgtEarRRot.x = 0; tgtEarRRot.z = 0;
            
            tgtTailRot.x = 0.8; // Tail stiff up
        }
        // Phase 2: The Hit (0.3 - 0.6s)
        else if (rT < 0.6) {
            const shiver = Math.sin(rT * 100) * 0.05;
            tgtBodyPos.y = 0.35 + shiver;
            tgtBodyPos.x += shiver;
            tgtHeadRot.z = shiver * 2;
            
            // Cheeks Red
            if (blushRef.current) blushRef.current.scale.set(1.5, 1.5, 1.5);
        }
        // Phase 3: Drunk / Sway (0.6 - 1.2s)
        else if (rT < 1.2) {
            const sway = Math.sin((rT - 0.6) * 5);
            tgtBodyPos.x = sway * 0.2;
            tgtBodyRot.z = sway * 0.2;
            tgtHeadRot.z = -sway * 0.3; // Counter roll
            
            tgtFLPos.y += Math.abs(Math.sin(rT * 10)) * 0.1; // Tapping feet
            tgtFRPos.y += Math.abs(Math.cos(rT * 10)) * 0.1;
            
            tgtTailRot.z = Math.sin(rT * 8) * 0.5; // Loose wag
        }
        // Phase 4: Crazy Mode (1.2 - 2.0s)
        else if (rT < 2.0) {
            // BOUNCE
            const bounce = Math.abs(Math.sin((rT - 1.2) * 20));
            tgtBodyPos.y = 0.4 + bounce * 0.8;
            tgtBodyRot.x = Math.sin(rT * 30) * 0.2;
            tgtBodyRot.z = Math.cos(rT * 25) * 0.2;
            
            tgtHeadRot.x = Math.sin(rT * 40) * 0.3;
            
            // Flail limbs
            tgtFLRot.x = Math.random() * 2 - 1;
            tgtFRRot.x = Math.random() * 2 - 1;
            tgtBLRot.x = Math.random() * 2 - 1;
            tgtBRRot.x = Math.random() * 2 - 1;
            
            if (Math.random() < 0.1) audioService.playMeow('happy');
        }
        // Phase 5: Collapse (2.0 - 2.6s)
        else if (rT < 2.6) {
            const p = (rT - 2.0) / 0.6;
            // Fall to side
            tgtBodyRot.z = MathUtils.lerp(0, Math.PI/2, p);
            tgtBodyPos.y = MathUtils.lerp(0.8, 0.25, p);
            
            tgtHeadRot.z = MathUtils.lerp(0, Math.PI/4, p);
            
            // Splay legs
            tgtFLRot.z = -1.0 * p;
            tgtFRRot.z = 1.0 * p;
            tgtBLRot.z = -1.0 * p;
            tgtBRRot.z = 1.0 * p;
        }
        // Phase 6: Bliss / Afterglow (2.6 - 4.0s+)
        else {
            // Lying on side
            tgtBodyRot.z = Math.PI/2;
            tgtBodyPos.y = 0.25 + Math.sin(rT * 2) * 0.05; // Float/Breathe
            
            tgtHeadRot.z = Math.PI/4 + Math.sin(rT * 1.5) * 0.1;
            tgtHeadRot.x = -0.5; // Chin up
            
            tgtTailRot.z = Math.sin(rT * 2) * 0.2;
            
            // Limbs relaxed
            tgtFLRot.z = -1.5; tgtFRRot.z = 1.5;
            tgtBLRot.z = -1.5; tgtBRRot.z = 1.5;
        }
    }

    else if (action === 'tail_grabbed') {
         const rT = actionTimeRef.current;
         
         // Phase 1: Startle/Reflex (0.0-0.15s)
         if (rT < 0.15) {
             const p = rT / 0.15;
             tgtBodyPos.y = 0.4 + Math.sin(p * Math.PI) * 0.2; // Jump slightly
             tgtHeadRot.y = Math.PI * 0.8 * p; // Start turning head back
             
             // Ears flattened
             tgtEarLRot.x = 0.8 * p;
             tgtEarRRot.x = 0.8 * p;
             tgtEarLRot.z = 1.0 * p;
             tgtEarRRot.z = -1.0 * p;
             
             tgtTailRot.x = 0.5 * p; // Tail snaps up
         }
         // Phase 2: Rapid Turn (0.15-0.35s)
         else if (rT < 0.35) {
             const p = (rT - 0.15) / 0.2;
             tgtBodyRot.y = Math.PI * 0.5 * p; // Body twists
             tgtHeadRot.y = Math.PI * 0.9; // Head fully back looking at tail
             tgtBodyRot.x = -0.2 * p; // Spine curve
             
             tgtEarLRot.x = 0.8;
             tgtEarRRot.x = 0.8;
             
             tgtTailRot.x = 0.5;
             tgtTailRot.z = Math.sin(rT * 40) * 0.2; // Tense twitch
         }
         // Phase 3: Swipe/Counter (0.35-0.55s)
         else if (rT < 0.55) {
             const p = (rT - 0.35) / 0.2;
             tgtBodyRot.y = Math.PI * 0.5;
             tgtHeadRot.y = Math.PI * 0.9;
             
             // Swiping Motion (Right Paw)
             // Lift and bat sideways
             tgtFRPos.y = 0.6 + Math.sin(p * Math.PI) * 0.2;
             tgtFRRot.x = -1.0; 
             tgtFRRot.z = -1.0 * Math.sin(p * Math.PI); // Bat outward
             
             tgtTailRot.x = 0.5;
             tgtTailRot.z = Math.sin(rT * 50) * 0.4; // Angry swish
         }
         // Phase 4: Warning Pose (0.55-0.9s)
         else if (rT < 0.9) {
             tgtBodyRot.y = Math.PI * 0.5;
             tgtBodyRot.x = 0.2; // Arched back
             tgtHeadRot.y = Math.PI * 0.9;
             tgtHeadRot.x = 0.2; // Chin down, staring
             
             tgtFRPos.y = 0.4; // Paw down but alert
             
             tgtTailRot.x = 1.2; // Tail straight up
             tgtTailRot.z = Math.sin(rT * 30) * 0.1; // Twitch
             
             // Keep ears back
             tgtEarLRot.x = 0.8;
             tgtEarRRot.x = 0.8;
         }
         // Phase 5: Recovery (0.9-1.2s)
         else {
             const p = Math.min(1, (rT - 0.9) / 0.3);
             const invP = 1 - p;
             
             tgtBodyRot.y = Math.PI * 0.5 * invP;
             tgtHeadRot.y = Math.PI * 0.9 * invP;
             tgtTailRot.x = 1.2 * invP - 0.5 * p; // Back to normal -0.5
             
             tgtEarLRot.x = 0.8 * invP;
             tgtEarRRot.x = 0.8 * invP;
         }
    }
    else if (action === 'belly_rub') {
        const rT = actionTimeRef.current;
        
        // Position on floor
        tgtBodyPos.set(0, 0.2, 0); 
        tgtHeadPos.set(0, 0.25, 0.5); // Head low
        
        // Phase 1: Roll over (0 to 0.4)
        let rollProgress = Math.min(1, rT / 0.4);
        rollProgress = 1 - Math.pow(1 - rollProgress, 3); // Ease out
        
        const targetRoll = Math.PI * 0.8; // Almost upside down
        
        tgtBodyRot.z = -targetRoll * rollProgress;
        tgtHeadRot.z = -targetRoll * rollProgress * 0.5; // Head doesn't rotate as much, stays looking forward-ish but tilted
        tgtHeadRot.x = -0.5 * rollProgress; // Chin up
        
        // Legs move to "up" position (relative to body center roughly, need manual adjust)
        // FL & FR
        tgtFLPos.set(-0.3, 0.5, 0.3); // In air
        tgtFRPos.set(0.3, 0.5, 0.3);
        tgtFLRot.z = -0.5 * rollProgress;
        tgtFRRot.z = 0.5 * rollProgress;
        
        // Phase 2: Comfort (0.4 to 1.2) - Kicking/Twitching
        if (rT > 0.4 && rT < 1.6) {
            const wiggle = Math.sin((rT - 0.4) * 20) * 0.1;
            
            // Hind legs kick
            tgtBLPos.y += wiggle;
            tgtBRPos.y -= wiggle;
            
            tgtBLRot.x = 1.0 + wiggle * 2;
            tgtBRRot.x = 1.0 - wiggle * 2;
            
            // Paws curl (Front)
            tgtFLRot.x = -1.0 + Math.sin(rT * 10) * 0.2;
            tgtFRRot.x = -1.0 + Math.cos(rT * 10) * 0.2;
            
            // Tail wag
            tgtTailRot.z = Math.sin(rT * 5) * 0.5;
        }
        
        // Phase 3: Deep enjoyment (1.2 to 1.6)
        if (rT > 1.2 && rT < 1.6) {
            // Spine curve (Body arch)
            tgtBodyRot.x = 0.2; 
            
            // Purring heave
            tgtBodyPos.y += Math.sin(rT * 30) * 0.005;
        }
        
        // Phase 4: End (1.6 to 2.0) - transition handled by next state lerp mostly, 
        // but let's smooth it out here if we are still in this action
        if (rT > 1.6) {
            const endProgress = Math.min(1, (rT - 1.6) / 0.4);
            const reverseRoll = 1 - endProgress;
            
            tgtBodyRot.z = -targetRoll * reverseRoll;
            tgtHeadRot.z = -targetRoll * reverseRoll * 0.5;
            
            // Bring legs down
            tgtFLPos.y = MathUtils.lerp(0.5, 0.4, endProgress);
            tgtFRPos.y = MathUtils.lerp(0.5, 0.4, endProgress);
        }
    }
    else if (action === 'chasing') {
         // --- ACTION CHAIN: STALK -> APPROACH -> JUMP -> LAND ---
         
         if (pounceState.current.active) {
             // Increment Pounce Timer
             pounceState.current.time += delta;
             const pt = pounceState.current.time;

             // Forward Impulse (Burst of speed during jump)
             // Moves the cat group physically forward in current direction
             if (pt > 0.1 && pt < 0.4) {
                 const jumpSpeed = 25 * delta;
                 // Get forward vector
                 const forward = new Vector3(0, 0, 1).applyEuler(groupRef.current.rotation);
                 groupRef.current.position.add(forward.multiplyScalar(jumpSpeed));
             }

             // --- PHASE 1: CHARGE (0s - 0.1s) ---
             if (pt < 0.1) {
                // Compress body
                tgtBodyPos.y = 0.2; 
                tgtBodyPos.z = -0.1; 
                tgtBodyRot.x = 0.1;
                tgtBLPos.z = -0.5; // Legs compressed
                tgtBRPos.z = -0.5;
                tgtBLPos.y = 0.1;
                tgtBRPos.y = 0.1;
                tgtHeadRot.x = 0.0;
             } 
             // --- PHASE 2: TAKEOFF (0.1s - 0.2s) ---
             else if (pt < 0.2) {
                const progress = (pt - 0.1) / 0.1;
                // Rise
                tgtBodyPos.y = MathUtils.lerp(0.2, 0.8, progress);
                tgtBodyRot.x = -0.5; // Pitch up
                // Legs Kick
                tgtBLRot.x = 1.0; 
                tgtBRRot.x = 1.0;
                tgtBLPos.z = 0.3; // Push back
                tgtBRPos.z = 0.3;
             }
             // --- PHASE 3: MID-AIR (0.2s - 0.35s) ---
             else if (pt < 0.35) {
                tgtBodyPos.y = 1.2; // Peak height
                tgtBodyRot.x = 0.2; // Level out / arch
                // Paws reach forward
                tgtFLRot.x = -1.5; 
                tgtFRRot.x = -1.5;
                tgtFLPos.y = 0.8;
                tgtFRPos.y = 0.8;
                // Spine arch visualized by head down
                tgtHeadRot.x = -0.5; 
             }
             // --- PHASE 4: LANDING (0.35s - 0.45s+) ---
             else {
                const progress = Math.min(1, (pt - 0.35) / 0.1);
                tgtBodyPos.y = MathUtils.lerp(1.2, 0, progress);
                tgtFLRot.x = 0; // Impact
                tgtFRRot.x = 0;
                tgtBodyRot.x = 0.1;
             }

             // End Pounce
             if (pt > 0.5) {
                pounceState.current.active = false;
                pounceState.current.time = 0;
             }

         } else {
             // --- STALKING / APPROACHING ---
             
             // Check if we should trigger pounce (Distance < 2.5)
             if (distanceToTarget < 2.5 && distanceToTarget > 0.5) {
                 pounceState.current.active = true;
                 pounceState.current.time = 0;
                 audioService.playMeow('poked'); // Effort noise
             }

             // Stalking Pose
             tgtBodyPos.y = 0.3; // Low to ground
             tgtBodyPos.z = 0.2; // Forward lean
             tgtBodyRot.x = 0.2;
             
             // Ears Aerodynamic
             tgtEarLRot.z = 1.0; 
             tgtEarRRot.z = -1.0;
             tgtEarLRot.x = 0.5;
             tgtEarRRot.x = 0.5;

             // Whipping Tail
             tgtTailRot.z = Math.sin(t * 20) * 0.3; 
             tgtTailRot.x = -0.2; 

             // Fast run cycle
             if (isMoving) {
                const speed = 25; 
                tgtFLRot.x = Math.sin(t * speed) * 1.0;
                tgtFRRot.x = Math.sin(t * speed + Math.PI) * 1.0;
                tgtBLRot.x = Math.sin(t * speed + Math.PI) * 1.0;
                tgtBRRot.x = Math.sin(t * speed) * 1.0;
                
                const stepInterval = Math.PI / speed;
                if (t - lastStepTimeRef.current > stepInterval) {
                   audioService.playStep();
                   lastStepTimeRef.current = t;
                }
             }
         }
    }
    else if (isMoving && mode === 0 && action !== 'climbing') {
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
    else if (action === 'petting') {
        // "Sajiao" - Coquettish / Affectionate rubbing animation
        
        // Body: Breathing bounce + slight roll sway
        tgtBodyPos.y = 0.35 + Math.sin(t * 10) * 0.01; 
        tgtBodyRot.x = -Math.PI / 2 + 0.1; 
        tgtBodyRot.z = Math.sin(t * 2) * 0.1; 
        
        // Head: Nuzzling motion (tipping back and side)
        tgtHeadRot.x = -0.5 + Math.sin(t * 3) * 0.15; // Chin up (enjoying)
        tgtHeadRot.z = Math.sin(t * 2.5) * 0.35; // Tilt side to side
        tgtHeadRot.y = Math.sin(t * 1.5) * 0.2; // Turn
        
        // Paws: Kneading / Air biscuits (Happy cat!)
        tgtFLPos.y = 0.5 + Math.max(0, Math.sin(t * 5) * 0.15);
        tgtFLRot.x = -0.8 + Math.max(0, Math.sin(t * 5) * 0.5);
        
        tgtFRPos.y = 0.5 + Math.max(0, Math.sin(t * 5 + Math.PI) * 0.15);
        tgtFRRot.x = -0.8 + Math.max(0, Math.sin(t * 5 + Math.PI) * 0.5);
        
        // Tail: Happy high wag
        tgtTailWrapperPos.y = 0.5;
        tgtTailRot.x = -0.5;
        tgtTailRot.z = Math.sin(t * 15) * 0.6;
    }
    else if (action === 'climbing') {
        const climbTime = actionT;
        // Force snap to start location if not already
        if (groupRef.current) {
             const startPos = ACTION_LOCATIONS['climbing'];
             groupRef.current.position.x = startPos.x;
             groupRef.current.position.z = startPos.z;
             groupRef.current.position.y = 0; 
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
            
            if (groupRef.current) {
                groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, faceCameraAngle, 0.1);
            }

            // Sitting on platform (Relative coords now that group is rotated)
            tgtBodyPos.set(0, topY, 0); 
            
            tgtBodyRot.set(-Math.PI / 2, 0, 0); 
            tgtHeadPos.set(0, topY + 0.45, 0.1);
            
            tgtBLPos.set(-0.3, topY - 0.3, 0.3); 
            tgtBRPos.set(0.3, topY - 0.3, 0.3);
            tgtBLRot.set(-Math.PI/2, -0.2, 0);
            tgtBRRot.set(-Math.PI/2, 0.2, 0);

            tgtFLPos.set(-0.3, topY + 0.3, 0.2);
            tgtFLRot.set(-1.0, 0, -0.2);
            
            // Right paw HIGH UP (Peace Sign!)
            tgtFRPos.set(0.4, topY + 0.65, 0.2); // Next to head
            tgtFRRot.set(-2.8, 0.5, 0.5); // Raised and angled
            
            tgtHeadRot.z = -0.4; 
            
            tgtTailWrapperPos.set(0, topY, -0.4);
            tgtTailRot.x = -0.5;
            tgtTailRot.z = Math.sin(t * 12) * 0.4;
        }
    }
    
    // Apply Lerps (Standard)
    // Chasing needs snappier animation
    // Catnip high needs snappy for bounce, but smooth for sway.
    // Blind Box jump/slam needs to be snappy
    const isCatnipCrazy = action === 'catnip_high' && actionTimeRef.current > 1.2 && actionTimeRef.current < 2.0;
    const isBlindBoxAction = action === 'opening_blind_box' && actionTimeRef.current > 1.0;
    
    const LERP_SPEED = (action === 'dancing' || action === 'chasing' || isCatnipCrazy || isBlindBoxAction) ? 0.3 : action === 'tail_grabbed' ? 0.25 : 0.15;
    
    if (bodyRef.current) {
        bodyRef.current.position.lerp(tgtBodyPos, LERP_SPEED);
        bodyRef.current.rotation.x = lerpAngle(bodyRef.current.rotation.x, tgtBodyRot.x, LERP_SPEED);
        bodyRef.current.rotation.y = lerpAngle(bodyRef.current.rotation.y, tgtBodyRot.y, LERP_SPEED);
        bodyRef.current.rotation.z = lerpAngle(bodyRef.current.rotation.z, tgtBodyRot.z, LERP_SPEED);
        
        // Scale handles breathing/squash
        bodyRef.current.scale.lerp(tgtBodyScale, LERP_SPEED);
    }
    if (headRef.current) {
        headRef.current.position.lerp(tgtHeadPos, LERP_SPEED);
        headRef.current.rotation.x = lerpAngle(headRef.current.rotation.x, tgtHeadRot.x, LERP_SPEED);
        headRef.current.rotation.y = lerpAngle(headRef.current.rotation.y, tgtHeadRot.y, LERP_SPEED);
        headRef.current.rotation.z = lerpAngle(headRef.current.rotation.z, tgtHeadRot.z, LERP_SPEED);
    }
    if (earLRef.current) {
         earLRef.current.rotation.z = lerpAngle(earLRef.current.rotation.z, tgtEarLRot.z, LERP_SPEED);
         earLRef.current.rotation.x = lerpAngle(earLRef.current.rotation.x, tgtEarLRot.x, LERP_SPEED);
    }
    if (earRRef.current) {
         earRRef.current.rotation.z = lerpAngle(earRRef.current.rotation.z, tgtEarRRot.z, LERP_SPEED);
         earRRef.current.rotation.x = lerpAngle(earRRef.current.rotation.x, tgtEarRRot.x, LERP_SPEED);
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
                   <meshStandardMaterial color="#ff0000" emissive="#ff00ff" emissiveIntensity={0.5} />
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
        
        {/* CATNIP VISUAL EFFECTS (Particles) */}
        {action === 'catnip_high' && (
            <group position={[0, 1.2, 0]}>
                <Sparkles count={15} scale={1.5} size={2} speed={0.4} opacity={0.5} color="#fb7185" />
            </group>
        )}

        {/* BLIND BOX IMPACT VFX */}
        {action === 'opening_blind_box' && (
            <group position={[0, 0.5, 2.0]}> {/* Positioned relative to cat, facing the "box" */}
                {/* Shockwave expanding ring */}
                <mesh ref={shockwaveRef} rotation={[-Math.PI/2, 0, 0]} visible={false}>
                    <ringGeometry args={[0.8, 1.2, 32]} />
                    <meshBasicMaterial color="#ffd700" transparent opacity={0.8} />
                </mesh>
                
                {/* Light Pillar */}
                <mesh ref={pillarRef} visible={false}>
                    <cylinderGeometry args={[0.8, 0.8, 10, 16, 1, true]} />
                    <meshBasicMaterial color="#fffbeb" transparent opacity={0.5} blending={AdditiveBlending} depthWrite={false} side={2} />
                </mesh>

                {/* Particles only active during impact phase */}
                {actionTimeRef.current > 1.25 && actionTimeRef.current < 2.5 && (
                    <>
                        <Sparkles count={30} scale={4} size={6} speed={3} opacity={1} color="#facc15" />
                        <Sparkles count={20} scale={3} size={4} speed={2} opacity={0.8} color="#ffffff" />
                        {/* Confetti-like bits */}
                        <Sparkles count={15} scale={2.5} size={8} speed={1.5} opacity={1} color="#ff69b4" noise={1} />
                    </>
                )}
            </group>
        )}

        {/* HEAD (Cute 1:1 Rebuild) */}
        <group ref={headRef}>
            {/* Main Round Head (Bun Shape) */}
            <mesh castShadow scale={[1.15, 1.0, 1.0]}>
                <sphereGeometry args={[0.52, 64, 64]} />
                {FurMaterial}
            </mesh>
            
            {/* Accessories attached to Head */}
            <CatAccessories outfit={outfit as OutfitId} />

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
                    {/* Eyeball that rotates */}
                    <group ref={eyeLRef}>
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
                        
                        {/* STAR EYE OVERLAY */}
                        {(action === 'catnip_high' || (action === 'opening_blind_box' && actionTimeRef.current < 0.5)) && (
                            <group position={[0, 0, 0.12]} scale={[0.5, 0.5, 0.5]}>
                                <Sparkles count={3} scale={0.2} size={10} speed={2} opacity={1} color="#fbbf24" />
                            </group>
                        )}
                    </group>
                    {/* Eyelid (Blink) - Stationary relative to eye socket */}
                    <mesh ref={eyelidLRef} position={[0, 0, 0]} scale={[1, 0.1, 1]}> {/* Starts open (scale 0.1) */}
                         <mesh position={[0, 0.14, 0.05]} rotation={[-0.2, 0, 0]}>
                            <sphereGeometry args={[0.145, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
                            {FurMaterial}
                         </mesh>
                    </mesh>
                </group>

                {/* Right Eye */}
                <group position={[0.2, 0, 0]} rotation={[0, 0.15, 0]}>
                    <group ref={eyeRRef}>
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
                        {/* STAR EYE OVERLAY */}
                        {(action === 'catnip_high' || (action === 'opening_blind_box' && actionTimeRef.current < 0.5)) && (
                            <group position={[0, 0, 0.12]} scale={[0.5, 0.5, 0.5]}>
                                <Sparkles count={3} scale={0.2} size={10} speed={2} opacity={1} color="#fbbf24" />
                            </group>
                        )}
                    </group>
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

            {/* Blush (Pink Cheeks) - Ref attached for catnip redness */}
            <group position={[0, -0.12, 0.48]} ref={blushRef}>
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

        {/* BODY */}
        <group ref={bodyRef}>
            <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
                <capsuleGeometry args={[0.35, 0.6, 32, 32]} />
                {FurMaterial}
            </mesh>
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
        <group 
            ref={tailWrapperRef} 
            position={[0, 0.45, -0.4]} 
            onClick={(e) => { 
                e.stopPropagation(); 
                if (onTailClick) onTailClick(); 
            }}
            onPointerOver={() => { if(!isEscaping) document.body.style.cursor = 'pointer'; }}
            onPointerOut={() => { document.body.style.cursor = 'auto'; }}
        >
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