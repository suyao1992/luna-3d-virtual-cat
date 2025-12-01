
import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Mesh, Group, Vector3, MathUtils, Euler } from 'three';
import { CatAction, Language, TRANSLATIONS } from '../types';

interface Cat3DProps {
  action: CatAction;
  position?: [number, number, number];
  walkTarget?: Vector3 | null;
  lookAtTarget?: Vector3 | null;
  onMovementComplete?: () => void;
  onClick?: () => void;
  language: Language;
}

// Helper to ease angles
const lerpAngle = (start: number, end: number, alpha: number) => {
    let diff = end - start;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return start + diff * alpha;
};

export const Cat3D: React.FC<Cat3DProps> = ({ action, position = [0, 0, 0], walkTarget, lookAtTarget, onMovementComplete, onClick, language }) => {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Group>(null); 
  const tailRef = useRef<Group>(null);
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
  
  const [time, setTime] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [blink, setBlink] = useState(false);
  
  const restingPosition = useRef<Vector3>(new Vector3(...position));
  const t = TRANSLATIONS[language];

  useEffect(() => {
    if (groupRef.current) {
        groupRef.current.position.set(...position);
    }
  }, []); 

  const ACTION_LOCATIONS: Record<string, Vector3> = {
      eating: new Vector3(-2, 0, 1.5), 
      drinking: new Vector3(-1.1, 0, 1.5), 
      using_litter: new Vector3(5.5, 0.1, 5), 
      sleeping: new Vector3(3, 0, -4), 
      waking_up: new Vector3(3, 0, -4),
      scratching: new Vector3(5.5, 0, -7),
      playing_ball: new Vector3(2, 0, 2.5),
      playing_gomoku: new Vector3(0, 0, 3.5),
      playing_xiangqi: new Vector3(0, 0, 3.5),
      preparing_game: new Vector3(0, 0, 3.5),
      yoga: new Vector3(-2, 0, -3),
      fishing: new Vector3(0, 0, 4),
      singing: new Vector3(0, 0, 0),
      dancing: new Vector3(0, 0, 0),
  };

  useEffect(() => {
      if (action === 'idle' && groupRef.current) {
          restingPosition.current.copy(groupRef.current.position);
          restingPosition.current.y = 0;
      }
  }, [action]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    setTime((t) => t + delta);
    const t = state.clock.getElapsedTime();

    // --- BLINKING ---
    if (action !== 'sleeping' && Math.random() < 0.005) {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
    }
    if (eyelidLRef.current && eyelidRRef.current) {
        const scaleY = blink ? 1 : 0;
        eyelidLRef.current.scale.y = MathUtils.lerp(eyelidLRef.current.scale.y, scaleY, 0.5);
        eyelidRRef.current.scale.y = MathUtils.lerp(eyelidRRef.current.scale.y, scaleY, 0.5);
    }

    // --- MOVEMENT & NAVIGATION ---
    let targetPos = restingPosition.current.clone(); 
    let moveSpeed = 6 * delta;
    
    if (action === 'walking' && walkTarget) targetPos.copy(walkTarget);
    else if (ACTION_LOCATIONS[action]) targetPos.copy(ACTION_LOCATIONS[action]);

    const currentPos = groupRef.current.position;
    const dx = targetPos.x - currentPos.x;
    const dz = targetPos.z - currentPos.z;
    const distanceToTarget = Math.sqrt(dx * dx + dz * dz);
    let isMoving = false;

    if (action === 'walking' || ACTION_LOCATIONS[action]) {
        if (distanceToTarget > 0.1) {
             isMoving = true;
             const factor = Math.min(1, moveSpeed / distanceToTarget);
             groupRef.current.position.x += dx * factor;
             groupRef.current.position.z += dz * factor;
             
             // Rotation while moving
             const angle = Math.atan2(dx, dz);
             groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, angle, 0.15);
        } else {
            // Arrived
            if (action === 'walking') {
                restingPosition.current.copy(groupRef.current.position);
                if (onMovementComplete) onMovementComplete();
            } else {
                 // Snap to target exact pos
                 groupRef.current.position.x = targetPos.x;
                 groupRef.current.position.z = targetPos.z;
                 
                 // Face Camera/Specific direction
                 let targetRotY = 0;
                 if (['eating', 'drinking'].includes(action)) targetRotY = Math.PI;
                 else if (['sleeping', 'waking_up'].includes(action)) targetRotY = -Math.PI/4;
                 else if (['using_litter', 'grooming'].includes(action)) targetRotY = Math.PI/2;
                 else if (action === 'scratching') targetRotY = 1.1;
                 else if (['playing_gomoku', 'playing_xiangqi', 'singing', 'dancing', 'fishing', 'preparing_game'].includes(action)) targetRotY = 0;
                 else if (action === 'yoga') targetRotY = Math.PI/4;
                 
                 groupRef.current.rotation.y = lerpAngle(groupRef.current.rotation.y, targetRotY, 0.1);
            }
        }
    }
    
    // --- POSE SYSTEM ---
    // Mode 0: Quadruped (Default)
    // Mode 1: Bipedal Standing (Singing, Dancing, Preparing)
    // Mode 2: Bipedal Sitting (Fishing, Gomoku, Xiangqi, Yoga)
    
    let mode = 0; // 0 = Quad, 1 = Stand, 2 = Sit
    if (['singing', 'dancing', 'preparing_game'].includes(action)) mode = 1;
    if (['playing_gomoku', 'playing_xiangqi', 'fishing', 'yoga'].includes(action)) mode = 2;

    // Default Targets (Quadruped)
    let tgtBodyPos = new Vector3(0, 0.4, 0);
    let tgtBodyRot = new Euler(0, 0, 0);
    
    let tgtHeadPos = new Vector3(0, 0.65, 0.5);
    let tgtHeadRot = new Euler(0, 0, 0);

    let tgtFLPos = new Vector3(-0.25, 0.2, 0.4);
    let tgtFLRot = new Euler(0, 0, 0);
    let tgtFRPos = new Vector3(0.25, 0.2, 0.4);
    let tgtFRRot = new Euler(0, 0, 0);
    
    let tgtBLPos = new Vector3(-0.25, 0.2, -0.4);
    let tgtBLRot = new Euler(0, 0, 0);
    let tgtBRPos = new Vector3(0.25, 0.2, -0.4);
    let tgtBRRot = new Euler(0, 0, 0);

    let tgtTailRot = new Euler(-0.5, 0, 0);

    // --- APPLY MODE MODIFIERS ---
    
    if (mode === 1) { 
        // --- STANDING (Humanoid) ---
        // Body vertical
        tgtBodyPos.set(0, 0.7, 0);
        tgtBodyRot.set(-Math.PI / 2 + 0.1, 0, 0); // Upright

        // Head on top
        tgtHeadPos.set(0, 1.15, 0.1);
        
        // Back legs as feet (bottom)
        tgtBLPos.set(-0.2, 0.2, 0);
        tgtBRPos.set(0.2, 0.2, 0);
        
        // Front legs as arms (sides/up)
        tgtFLPos.set(-0.35, 0.9, 0.2); // Shoulder height
        tgtFLRot.set(-0.5, 0, -0.5); // T-pose ish
        tgtFRPos.set(0.35, 0.9, 0.2);
        tgtFRRot.set(-0.5, 0, 0.5);

    } else if (mode === 2) {
        // --- SITTING (Humanoid) ---
        // Body upright but low
        tgtBodyPos.set(0, 0.45, 0); // Lower
        tgtBodyRot.set(-Math.PI / 2, 0, 0); // Vertical

        // Head on top
        tgtHeadPos.set(0, 0.9, 0.1);

        // Back legs splayed forward (sitting on bum)
        tgtBLPos.set(-0.3, 0.1, 0.4);
        tgtBLRot.set(-Math.PI / 2, -0.2, 0); // Legs sticking out
        tgtBRPos.set(0.3, 0.1, 0.4);
        tgtBRRot.set(-Math.PI / 2, 0.2, 0);

        // Front legs as arms
        tgtFLPos.set(-0.3, 0.65, 0.3);
        tgtFLRot.set(-1.0, 0, -0.2);
        tgtFRPos.set(0.3, 0.65, 0.3);
        tgtFRRot.set(-1.0, 0, 0.2);
    }

    // --- ANIMATION OVERRIDES ---
    
    if (isMoving && mode === 0) {
        // Walking Cycle
        const speed = 18;
        tgtBodyPos.y += Math.abs(Math.sin(t * speed * 2)) * 0.05;
        tgtHeadPos.y += Math.abs(Math.sin(t * speed * 2 - 0.5)) * 0.03;
        tgtFLRot.x = Math.sin(t * speed) * 0.8;
        tgtFRRot.x = Math.sin(t * speed + Math.PI) * 0.8;
        tgtBLRot.x = Math.sin(t * speed + Math.PI) * 0.8;
        tgtBRRot.x = Math.sin(t * speed) * 0.8;
    } 
    else if (action === 'singing') {
        tgtFRPos.set(0.1, 0.95, 0.4);
        tgtFRRot.set(-1.5, -0.5, 0);
        tgtFLPos.set(-0.4, 0.9 + Math.sin(t*5)*0.1, 0.2);
        tgtFLRot.set(Math.sin(t*5)*0.5, 0, -0.5);
        tgtBodyPos.y += Math.sin(t*10)*0.02;
        tgtHeadRot.z = Math.sin(t*3)*0.1;
    }
    else if (action === 'dancing') {
        tgtFLPos.set(-0.4, 1.1, 0);
        tgtFLRot.set(0, 0, Math.sin(t*10)*0.5 + 2.5);
        tgtFRPos.set(0.4, 0.8, 0.2);
        tgtFRRot.set(Math.cos(t*10)*0.5, 0, -0.5);
        tgtBodyRot.z = Math.sin(t*8)*0.2;
    }
    else if (action === 'fishing') {
        tgtFLPos.set(-0.15, 0.6, 0.5);
        tgtFLRot.set(-1.2, -0.5, 0);
        tgtFRPos.set(0.15, 0.6, 0.5);
        tgtFRRot.set(-1.2, 0.5, 0);
        tgtHeadRot.y = Math.sin(t*0.5)*0.1;
    }
    else if (action === 'yoga') {
        tgtFLPos.set(-0.3, 0.55, 0.3);
        tgtFLRot.set(-0.5, 0, -0.5);
        tgtFRPos.set(0.3, 0.55, 0.3);
        tgtFRRot.set(-0.5, 0, 0.5);
        tgtBodyPos.y += Math.sin(t*2)*0.01;
        tgtHeadRot.x = 0.2;
    }
    else if (action === 'playing_gomoku' || action === 'playing_xiangqi') {
        // Thinking pose - staring at where the board is (Z+ relative to cat)
        tgtFRPos.set(0.2, 0.75, 0.4);
        tgtFRRot.set(-2, 0, 0.5); // Hand to chin
        tgtHeadRot.x = 0.3; // Look down
    }
    else if (action === 'preparing_game') {
        // Standing and inviting
        tgtFRPos.set(0.3, 1.0, 0.3);
        tgtFRRot.set(-0.5, 0, Math.sin(t*10)*0.5 + 0.5); // Waving
        tgtHeadRot.y = Math.sin(t*2)*0.1;
    }
    else if (action === 'sleeping') {
        tgtBodyPos.set(0, 0.1, 0);
        tgtBodyRot.set(0.2, 0, 1.57); 
        tgtHeadPos.set(0, 0.25, 0.5);
        tgtHeadRot.set(0.2, 0, -0.2);
    }
    else if (action === 'petting') {
        tgtBodyRot.x = -0.15;
        tgtBodyPos.y = 0.45;
        tgtHeadRot.x = -0.4;
    }
    else if (action === 'grooming') {
        tgtBodyPos.y = 0.2;
        tgtHeadPos.y = 0.35;
        tgtHeadRot.x = 0.8;
        tgtFRPos.set(0.1, 0.3, 0.5);
        tgtFRRot.set(-1.5, 0, 0);
    }
    else if (action === 'scratching') {
        tgtBodyPos.y = 1.1;
        tgtBodyRot.x = -1.2;
        tgtFLPos.y = 1.4; tgtFRPos.y = 1.4;
        tgtFLRot.x = Math.sin(t*20)*0.5 - 1;
        tgtFRRot.x = Math.cos(t*20)*0.5 - 1;
    }

    // --- LOOK AT CURSOR (Head Only) ---
    if (lookAtTarget && (action === 'idle' || mode !== 0)) { 
        const headWorldPos = new Vector3();
        if(headRef.current) headRef.current.getWorldPosition(headWorldPos);
        const targetDir = lookAtTarget.clone().sub(headWorldPos);
        
        if (mode !== 0) {
            targetDir.applyEuler(new Euler(-tgtBodyRot.x, -groupRef.current.rotation.y, 0));
        } else {
            const invQ = groupRef.current.quaternion.clone().invert();
            targetDir.applyQuaternion(invQ);
        }

        const angleY = Math.atan2(targetDir.x, targetDir.z);
        const angleX = -Math.atan2(targetDir.y, Math.sqrt(targetDir.x**2 + targetDir.z**2));

        tgtHeadRot.y += MathUtils.clamp(angleY, -0.8, 0.8);
        tgtHeadRot.x += MathUtils.clamp(angleX, -0.5, 0.5);
    }

    // --- APPLY LERPS ---
    const LERP_SPEED = 0.15;
    
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
    
    if (tailRef.current) {
        tailRef.current.rotation.x = lerpAngle(tailRef.current.rotation.x, tgtTailRot.x, LERP_SPEED);
        tailRef.current.rotation.z = Math.sin(t * 3) * 0.1;
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
  const EyeMaterial = <meshStandardMaterial color="#1a1a1a" roughness={0.1} />;
  const WhiskerMaterial = <meshBasicMaterial color="#cccccc" />;
  
  // Get status text based on action
  // Hide status text during board games to avoid blocking the 2D board UI
  const hideStatusBubble = action === 'playing_gomoku' || action === 'playing_xiangqi';
  const statusText = (action !== 'idle' && !hideStatusBubble) ? t.status[action as keyof typeof t.status] : null;

  return (
    <group 
        ref={groupRef} 
        onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
    >
      {/* STATUS BUBBLE - Floating HTML */}
      {statusText && (
          <Html position={[0, 1.6, 0]} center style={{ pointerEvents: 'none' }}>
              <div className="whitespace-nowrap bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow-lg border-2 border-white/50 text-sm font-bold text-gray-700 animate-fade-in-up flex flex-col items-center">
                  <div className="absolute -bottom-1 w-2 h-2 bg-white/90 rotate-45 border-r border-b border-white/50"></div>
                  {statusText}
              </div>
          </Html>
      )}

      {/* BODY */}
      <group ref={bodyRef}>
         <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
            <capsuleGeometry args={[0.35, 0.6, 8, 16]} />
            {FurMaterial}
         </mesh>
         <mesh position={[0, -0.05, 0.32]} rotation={[0.2, 0, 0]}>
             <sphereGeometry args={[0.25, 16, 16]} />
             <meshStandardMaterial color="#fff0f5" />
         </mesh>
      </group>

      {/* HEAD */}
      <group ref={headRef}>
        <mesh castShadow scale={[1, 0.85, 0.9]}>
            <sphereGeometry args={[0.5, 32, 32]} />
            {FurMaterial}
        </mesh>

        <group ref={earRRef} position={[0.3, 0.35, 0]} rotation={[0, 0, -0.5]}>
            <mesh castShadow>
                <coneGeometry args={[0.12, 0.25, 32]} />{FurMaterial}
            </mesh>
            <mesh position={[0, -0.02, 0.08]} rotation={[0.1, 0, 0]}>
                 <coneGeometry args={[0.06, 0.18, 32]} />{PinkMaterial}
            </mesh>
        </group>
        <group ref={earLRef} position={[-0.3, 0.35, 0]} rotation={[0, 0, 0.5]}>
            <mesh castShadow>
                <coneGeometry args={[0.12, 0.25, 32]} />{FurMaterial}
            </mesh>
            <mesh position={[0, -0.02, 0.08]} rotation={[0.1, 0, 0]}>
                 <coneGeometry args={[0.06, 0.18, 32]} />{PinkMaterial}
            </mesh>
        </group>

        <group position={[0, 0.05, 0.42]}>
             <group position={[-0.16, 0, 0]} rotation={[0, -0.2, 0]}>
                <mesh><sphereGeometry args={[0.07, 32, 32]} />{EyeMaterial}</mesh>
                <mesh position={[0.02, 0.03, 0.05]}><sphereGeometry args={[0.025, 16, 16]} /><meshBasicMaterial color="white" /></mesh>
                <mesh ref={eyelidLRef} position={[0, 0.08, 0]} rotation={[-0.2, 0, 0]} scale-y={0}>
                    <sphereGeometry args={[0.075, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />{FurMaterial}
                </mesh>
             </group>
             <group position={[0.16, 0, 0]} rotation={[0, 0.2, 0]}>
                <mesh><sphereGeometry args={[0.07, 32, 32]} />{EyeMaterial}</mesh>
                <mesh position={[0.02, 0.03, 0.05]}><sphereGeometry args={[0.025, 16, 16]} /><meshBasicMaterial color="white" /></mesh>
                <mesh ref={eyelidRRef} position={[0, 0.08, 0]} rotation={[-0.2, 0, 0]} scale-y={0}>
                    <sphereGeometry args={[0.075, 32, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />{FurMaterial}
                </mesh>
             </group>
        </group>

        <mesh position={[0, -0.05, 0.48]}> <sphereGeometry args={[0.035, 16, 16]} />{PinkMaterial}</mesh>
        <group position={[0, -0.08, 0.45]}>
             <mesh position={[0.25, 0.02, -0.05]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.25, 0.005, 0.005]} />{WhiskerMaterial}</mesh>
             <mesh position={[0.25, -0.03, -0.05]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.25, 0.005, 0.005]} />{WhiskerMaterial}</mesh>
             <mesh position={[-0.25, 0.02, -0.05]} rotation={[0, 0, -0.1]}><boxGeometry args={[0.25, 0.005, 0.005]} />{WhiskerMaterial}</mesh>
             <mesh position={[-0.25, -0.03, -0.05]} rotation={[0, 0, 0.1]}><boxGeometry args={[0.25, 0.005, 0.005]} />{WhiskerMaterial}</mesh>
        </group>
      </group>

      {/* LEGS */}
      <group>
        <group ref={legFL}><mesh castShadow><capsuleGeometry args={[0.09, 0.35, 8, 16]} />{FurMaterial}</mesh></group>
        <group ref={legFR}><mesh castShadow><capsuleGeometry args={[0.09, 0.35, 8, 16]} />{FurMaterial}</mesh></group>
        <group ref={legBL}><mesh castShadow><capsuleGeometry args={[0.09, 0.35, 8, 16]} />{FurMaterial}</mesh></group>
        <group ref={legBR}><mesh castShadow><capsuleGeometry args={[0.09, 0.35, 8, 16]} />{FurMaterial}</mesh></group>
      </group>

      {/* TAIL */}
      <group position={[0, 0.45, -0.4]}>
        <group ref={tailRef} rotation={[-0.5, 0, 0]}>
             <mesh position={[0, 0.2, -0.1]}><capsuleGeometry args={[0.09, 0.45, 8, 16]} />{FurMaterial}</mesh>
             <mesh position={[0, 0.45, -0.1]}><sphereGeometry args={[0.09]} />{FurMaterial}</mesh>
        </group>
      </group>

      {/* SHADOW */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.55, 32]} />
        <meshBasicMaterial color="#000000" opacity={0.15} transparent />
      </mesh>

      {/* --- PROPS --- */}

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

    </group>
  );
};
