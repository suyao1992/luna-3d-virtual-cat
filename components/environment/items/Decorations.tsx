import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Float, Image } from '@react-three/drei';
import { Group, Vector3, MathUtils, Color } from 'three';

// --- CHRISTMAS TREE ---

const Ornament = ({ position, color }: { position: [number, number, number], color: string }) => {
    return (
        <mesh position={position}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={color} metalness={0.9} roughness={0.1} envMapIntensity={1.5} />
        </mesh>
    );
};

const Light = ({ position, color, speed, offset, isExcited }: { position: [number, number, number], color: string, speed: number, offset: number, isExcited?: boolean }) => {
    const ref = useRef<any>(null);
    useFrame((state) => {
        if (ref.current) {
            const t = state.clock.elapsedTime;
            // Marquee speed
            const effectiveSpeed = isExcited ? 10 : 3; 
            
            // Create a chasing wave pattern
            // sin(t - angle) creates a rotational wave
            const wave = Math.sin(t * effectiveSpeed + offset);
            
            // Map sine wave to intensity: Sharp peaks for blinking effect
            const intensity = Math.pow(Math.max(0, wave), 2) * 3 + 0.2;
            
            ref.current.emissiveIntensity = intensity;
            
            // Random color shift when excited
            if (isExcited && Math.random() < 0.05) {
                 ref.current.material.color.setHSL(Math.random(), 1, 0.5);
                 ref.current.material.emissive.setHSL(Math.random(), 1, 0.5);
            }
        }
    });
    return (
        <mesh position={position} ref={ref}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1} toneMapped={false} />
            <pointLight distance={1.0} intensity={0.5} color={color} decay={2} />
        </mesh>
    );
};

const Present = ({ position, rotation, color, ribbonColor, scale = 1 }: any) => {
    return (
        <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
            <RoundedBox args={[1, 0.8, 1]} radius={0.05} smoothness={4}>
                <meshStandardMaterial color={color} />
            </RoundedBox>
            {/* Ribbons */}
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[1.02, 0.82, 0.15]} />
                <meshStandardMaterial color={ribbonColor} />
            </mesh>
            <mesh position={[0, 0, 0]}>
                <boxGeometry args={[0.15, 0.82, 1.02]} />
                <meshStandardMaterial color={ribbonColor} />
            </mesh>
            {/* Bow */}
            <group position={[0, 0.4, 0]}>
                <mesh position={[0, 0.1, 0]} rotation={[0, 0, 0.2]}><cylinderGeometry args={[0.1, 0.1, 0.2]} /><meshStandardMaterial color={ribbonColor} /></mesh>
                <mesh position={[0.15, 0.05, 0]} rotation={[0, 0, -0.5]}><cylinderGeometry args={[0.1, 0.1, 0.2]} /><meshStandardMaterial color={ribbonColor} /></mesh>
            </group>
        </group>
    );
};

export const ChristmasTree = ({ position, scale, onClick, isExcited }: { position: [number, number, number], scale?: [number, number, number], onClick?: () => void, isExcited?: boolean }) => {
    const groupRef = useRef<Group>(null);
    
    // Generate lights positions procedurally - INCREASED DENSITY & MARQUEE OFFSET
    const lights = useMemo(() => {
        const items = [];
        const colors = ["#ff0000", "#00ff00", "#ffff00", "#00ffff", "#ff00ff", "#ff9900"];
        // Spiral placement for better marquee effect
        const count = 60;
        for(let i=0; i<count; i++) { 
            // Normalized height (0 to 1)
            const h = i / count;
            const y = h * 3.5 + 0.5;
            const radius = 1.4 - (y / 4.5) * 1.4;
            
            // Spiral angle: 6 full rotations up the tree
            const angle = h * Math.PI * 12 + (Math.random() * 0.5); 
            
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            
            items.push({ 
                pos: [x, y, z] as [number, number, number], 
                color: colors[i % colors.length],
                speed: 1, 
                // Offset by angle creates the rotating "Marquee" effect
                // Negative angle makes it spiral upwards
                offset: -angle 
            });
        }
        return items;
    }, []);

    // Ornaments
    const ornaments = useMemo(() => {
        const items = [];
        const colors = ["#ef4444", "#fbbf24", "#3b82f6", "#ec4899", "#fcd34d", "#ffffff"];
        for(let i=0; i<35; i++) {
            const y = Math.random() * 3.0 + 0.6;
            const radius = 1.3 - (y / 4.0) * 1.3;
            const angle = Math.random() * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const z = Math.sin(angle) * radius;
            items.push({
                pos: [x, y, z] as [number, number, number],
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
        return items;
    }, []);

    // Procedural Presents Pile
    const randomPresents = useMemo(() => {
        const items = [];
        const boxColors = ["#ef4444", "#3b82f6", "#10b981", "#8b5cf6", "#f59e0b", "#ec4899"];
        const ribbonColors = ["#ffffff", "#facc15", "#fbbf24"];
        
        // Generate 12 random gifts around the base
        for(let i=0; i<12; i++) {
            const angle = (i / 12) * Math.PI * 2 + (Math.random() * 0.5);
            const dist = 1.0 + Math.random() * 1.0; // Distance from trunk
            const s = 0.4 + Math.random() * 0.4; // Scale
            
            items.push({
                pos: [Math.cos(angle) * dist, s * 0.4, Math.sin(angle) * dist] as [number, number, number],
                rot: [0, Math.random() * Math.PI, 0] as [number, number, number],
                color: boxColors[Math.floor(Math.random() * boxColors.length)],
                ribbon: ribbonColors[Math.floor(Math.random() * ribbonColors.length)],
                scale: s
            });
        }
        return items;
    }, []);

    // Memoize the base scale vector to avoid re-creating it every frame
    const baseScaleVec = useMemo(() => {
        const s = scale || [1, 1, 1];
        return new Vector3(s[0], s[1], s[2]);
    }, [scale]);

    useFrame((state) => {
        if (groupRef.current) {
            if (isExcited) {
                // SHAKE EFFECT
                const t = state.clock.elapsedTime * 50;
                groupRef.current.rotation.z = Math.sin(t) * 0.02;
                groupRef.current.rotation.x = Math.cos(t) * 0.02;
                
                // Pulse effect applied RELATIVE to base scale
                const pulse = 1.0 + Math.sin(state.clock.elapsedTime * 15) * 0.03; 
                groupRef.current.scale.copy(baseScaleVec).multiplyScalar(pulse);
            } else {
                // Reset Rotation
                groupRef.current.rotation.z = MathUtils.lerp(groupRef.current.rotation.z, 0, 0.1);
                groupRef.current.rotation.x = MathUtils.lerp(groupRef.current.rotation.x, 0, 0.1);
                
                // Smoothly return to base scale
                groupRef.current.scale.lerp(baseScaleVec, 0.1);
            }
        }
    });

    return (
        <group 
            ref={groupRef}
            position={position} 
            // We set initial scale via ref logic in useFrame to avoid fighting
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            {/* Trunk - Thicker */}
            <mesh position={[0, 0.4, 0]}>
                <cylinderGeometry args={[0.4, 0.5, 1.2, 8]} />
                <meshStandardMaterial color="#3e2723" roughness={0.8} />
            </mesh>

            {/* Tree Layers - Wider and Smoother (16 segments) */}
            <group position={[0, 1.0, 0]}>
                <mesh>
                    <coneGeometry args={[1.8, 2.2, 16]} /> 
                    <meshStandardMaterial color="#15803d" roughness={0.7} />
                </mesh>
            </group>
            <group position={[0, 2.2, 0]}>
                <mesh>
                    <coneGeometry args={[1.4, 1.8, 16]} />
                    <meshStandardMaterial color="#16a34a" roughness={0.7} />
                </mesh>
            </group>
            <group position={[0, 3.2, 0]}>
                <mesh>
                    <coneGeometry args={[0.9, 1.6, 16]} />
                    <meshStandardMaterial color="#22c55e" roughness={0.7} />
                </mesh>
            </group>

            {/* Star - Larger */}
            <mesh position={[0, 4.1, 0]} rotation={[0, 0, 0.2]}>
                <dodecahedronGeometry args={[0.45, 0]} />
                <meshStandardMaterial color="#facc15" emissive="#facc15" emissiveIntensity={isExcited ? 2.0 : 0.8} />
            </mesh>
            <pointLight position={[0, 4.1, 0]} color="#facc15" intensity={isExcited ? 5 : 2} distance={5} />

            {/* Decorations */}
            {lights.map((l, i) => (
                <Light key={`l-${i}`} position={l.pos} color={l.color} speed={l.speed} offset={l.offset} isExcited={isExcited} />
            ))}
            {ornaments.map((o, i) => (
                <Ornament key={`o-${i}`} position={o.pos} color={o.color} />
            ))}

            {/* Main Presents (Hand Placed) */}
            <Present position={[1.0, 0.4, 1.0]} rotation={[0, 0.5, 0]} color="#ef4444" ribbonColor="#facc15" scale={0.7} />
            <Present position={[-1.2, 0.3, 0.5]} rotation={[0, -0.2, 0]} color="#3b82f6" ribbonColor="#fff" scale={0.6} />
            
            {/* Random Pile */}
            {randomPresents.map((p, i) => (
                <Present 
                    key={`rp-${i}`}
                    position={p.pos}
                    rotation={p.rot}
                    color={p.color}
                    ribbonColor={p.ribbon}
                    scale={p.scale}
                />
            ))}
            
            {/* Plushie Bunny underneath */}
            <group position={[1.5, 0.2, -0.5]} rotation={[0, -0.5, -Math.PI/2]}>
                 <mesh><capsuleGeometry args={[0.15, 0.4]} /><meshStandardMaterial color="#fcd34d" /></mesh>
                 <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.18]} /><meshStandardMaterial color="#fcd34d" /></mesh>
                 <mesh position={[-0.1, 0.5, 0]} rotation={[0,0,0.2]}><capsuleGeometry args={[0.05, 0.3]} /><meshStandardMaterial color="#fcd34d" /></mesh>
                 <mesh position={[0.1, 0.5, 0]} rotation={[0,0,-0.2]}><capsuleGeometry args={[0.05, 0.3]} /><meshStandardMaterial color="#fcd34d" /></mesh>
            </group>
        </group>
    );
};

// --- FIREPLACE ---

const Fire = () => {
  const ref = useRef<Group>(null);
  useFrame((state) => {
    if (ref.current) {
        ref.current.children.forEach((child, i) => {
            const t = state.clock.elapsedTime * 4 + i; // Faster flicker
            child.scale.y = 1 + Math.sin(t) * 0.4;
            child.rotation.z = Math.sin(t * 0.8) * 0.2;
            // Flicker opacity
            // @ts-ignore
            if (child.material) child.material.opacity = 0.8 + Math.sin(t * 8) * 0.2;
        });
    }
  });
  return (
      <group ref={ref}>
          {/* Main Flames */}
          <mesh position={[-0.2, 0.25, 0]}><coneGeometry args={[0.2, 0.5, 8]} /><meshBasicMaterial color="#ff5722" transparent /></mesh>
          <mesh position={[0.2, 0.3, 0.05]}><coneGeometry args={[0.18, 0.6, 8]} /><meshBasicMaterial color="#ff9800" transparent /></mesh>
          <mesh position={[0, 0.25, -0.05]}><coneGeometry args={[0.25, 0.55, 8]} /><meshBasicMaterial color="#ffeb3b" transparent /></mesh>
          {/* Smaller Sparks */}
          <mesh position={[0.3, 0.1, 0.1]}><coneGeometry args={[0.1, 0.3, 4]} /><meshBasicMaterial color="#ff5722" transparent /></mesh>
          <mesh position={[-0.3, 0.1, 0.1]}><coneGeometry args={[0.1, 0.3, 4]} /><meshBasicMaterial color="#ff9800" transparent /></mesh>
      </group>
  );
};

export const Fireplace = (props: any) => {
    return (
        <group {...props}>
            {/* STRUCTURE - Built from pieces to allow a hollow center */}
            
            {/* Hearth Base */}
            <mesh position={[0, 0.15, 0]}>
                <boxGeometry args={[2.6, 0.3, 0.8]} />
                <meshStandardMaterial color="#e0e0e0" />
            </mesh>

            {/* Left Pillar */}
            <mesh position={[-0.9, 1.35, 0]}>
                <boxGeometry args={[0.6, 2.1, 0.6]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>

            {/* Right Pillar */}
            <mesh position={[0.9, 1.35, 0]}>
                <boxGeometry args={[0.6, 2.1, 0.6]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>

            {/* Header Block (Above Fire) */}
            <mesh position={[0, 2.15, 0]}>
                <boxGeometry args={[1.2, 0.5, 0.6]} />
                <meshStandardMaterial color="#f5f5f5" />
            </mesh>

            {/* Back Panel (Dark) */}
            <mesh position={[0, 1.2, -0.2]}>
                <boxGeometry args={[1.2, 1.8, 0.1]} />
                <meshStandardMaterial color="#2d2d2d" roughness={0.9} />
            </mesh>

            {/* Mantle */}
            <RoundedBox position={[0, 2.45, 0]} args={[2.8, 0.15, 0.8]} radius={0.02} smoothness={2}>
                <meshStandardMaterial color="#5d4037" />
            </RoundedBox>

            {/* FIRE & LOGS - Positioned visibly on the hearth */}
            <group position={[0, 0.35, 0]}>
                {/* Logs - Crossed Arrangement */}
                {/* Left Log leaning right */}
                <mesh position={[-0.15, 0.2, 0]} rotation={[0, 0, -0.5]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.7]} />
                    <meshStandardMaterial color="#4e342e" />
                </mesh>
                {/* Right Log leaning left */}
                <mesh position={[0.15, 0.2, 0]} rotation={[0, 0, 0.5]}>
                    <cylinderGeometry args={[0.08, 0.08, 0.7]} />
                    <meshStandardMaterial color="#4e342e" />
                </mesh>
                {/* Back/Base Log horizontal */}
                <mesh position={[0, 0.08, 0.1]} rotation={[0, 1.5, 1.57]}>
                     <cylinderGeometry args={[0.07, 0.07, 0.6]} />
                     <meshStandardMaterial color="#3e2723" />
                </mesh>
                
                {/* Fire Effect */}
                <group position={[0, 0.15, 0]}>
                    <Fire />
                    <pointLight position={[0, 0.5, 0.5]} color="#ff6d00" intensity={2.5} distance={5} decay={2} />
                </group>
            </group>

            {/* Stockings */}
            <group position={[0, 2.3, 0.45]}>
                <mesh position={[-0.6, -0.3, 0]} rotation={[0, 0, 0.1]}><capsuleGeometry args={[0.1, 0.4]} /><meshStandardMaterial color="#ef4444" /></mesh>
                <mesh position={[-0.6, -0.5, 0.1]} rotation={[0, 0, 1.2]}><capsuleGeometry args={[0.09, 0.25]} /><meshStandardMaterial color="#ef4444" /></mesh>
                <mesh position={[-0.6, -0.1, 0]}><cylinderGeometry args={[0.11, 0.11, 0.1]} /><meshStandardMaterial color="#fff" /></mesh>

                <mesh position={[0.6, -0.3, 0]} rotation={[0, 0, -0.1]}><capsuleGeometry args={[0.1, 0.4]} /><meshStandardMaterial color="#22c55e" /></mesh>
                <mesh position={[0.6, -0.5, 0.1]} rotation={[0, 0, 1.2]}><capsuleGeometry args={[0.09, 0.25]} /><meshStandardMaterial color="#22c55e" /></mesh>
                <mesh position={[0.6, -0.1, 0]}><cylinderGeometry args={[0.11, 0.11, 0.1]} /><meshStandardMaterial color="#fff" /></mesh>
                
                <mesh position={[0, -0.3, 0]}><capsuleGeometry args={[0.1, 0.4]} /><meshStandardMaterial color="#fff" /></mesh>
                <mesh position={[0, -0.5, 0.1]} rotation={[0, 0, 1.2]}><capsuleGeometry args={[0.09, 0.25]} /><meshStandardMaterial color="#fff" /></mesh>
                <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.11, 0.11, 0.1]} /><meshStandardMaterial color="#ef4444" /></mesh>
            </group>
            
            {/* Wreath - Vertical on wall behind - Moved forward to be in front of pillar */}
            <mesh position={[0, 3.2, -0.5]} rotation={[0, 0, 0]}>
                <torusGeometry args={[0.4, 0.12, 8, 16]} />
                <meshStandardMaterial color="#15803d" />
            </mesh>
            {/* Bow */}
            <group position={[0, 2.85, -0.35]} rotation={[0,0,0]}>
                 <mesh position={[0, 0, 0]} rotation={[0, 0, -0.5]}><coneGeometry args={[0.1, 0.3, 4]} /><meshStandardMaterial color="#ef4444" /></mesh>
                 <mesh position={[0, 0, 0]} rotation={[0, 0, 0.5]}><coneGeometry args={[0.1, 0.3, 4]} /><meshStandardMaterial color="#ef4444" /></mesh>
                 <mesh><sphereGeometry args={[0.08]} /><meshStandardMaterial color="#ef4444" /></mesh>
            </group>
            
            {/* Candles on top */}
            <group position={[-0.8, 2.55, 0]}>
                <mesh position={[0, 0.15, 0]}><cylinderGeometry args={[0.04, 0.04, 0.3]} /><meshStandardMaterial color="#fff" /></mesh>
                <mesh position={[0, 0.35, 0]}><coneGeometry args={[0.02, 0.06]} /><meshBasicMaterial color="#ff9800" /></mesh>
                <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.08, 0.1, 0.05]} /><meshStandardMaterial color="#3e2723" /></mesh>
            </group>
             <group position={[-0.5, 2.55, 0.1]}>
                <mesh position={[0, 0.1, 0]}><cylinderGeometry args={[0.04, 0.04, 0.2]} /><meshStandardMaterial color="#fff" /></mesh>
                <mesh position={[0, 0.25, 0]}><coneGeometry args={[0.02, 0.06]} /><meshBasicMaterial color="#ff9800" /></mesh>
                <mesh position={[0, 0, 0]}><cylinderGeometry args={[0.08, 0.1, 0.05]} /><meshStandardMaterial color="#3e2723" /></mesh>
            </group>
            
            {/* Photo Frame on top */}
            <group position={[0.7, 2.8, -0.1]} rotation={[-0.2, -0.3, 0]}>
                 <mesh><boxGeometry args={[0.5, 0.6, 0.05]} /><meshStandardMaterial color="#5d4037" /></mesh>
                 <mesh position={[0,0,0.03]}><planeGeometry args={[0.4, 0.5]} /><meshBasicMaterial color="#eee" /></mesh>
                 {/* Cat silhouette */}
                 <mesh position={[0,0,0.04]}><circleGeometry args={[0.1]} /><meshBasicMaterial color="#333" /></mesh>
                 <mesh position={[0,-0.12,0.04]}><circleGeometry args={[0.15]} /><meshBasicMaterial color="#333" /></mesh>
            </group>
        </group>
    )
}

// --- WALL PHOTOS ---

const PHOTO_URLS = {
    // Use highly reliable Picsum seeds for "Travel" themes
    // Bed: Snow Mountain (Travel memory)
    bed: "https://picsum.photos/seed/mountain/600/400", 
    // Explorer: Flowers
    explorer: "https://picsum.photos/seed/flowers/600/600",
    // Party: Fishing/River
    party: "https://picsum.photos/seed/river/600/800", 
    // Bath: Go/Strategy/Abstract
    bath: "https://picsum.photos/seed/strategy/600/400" 
};

interface WallPhotoProps {
    position: any;
    rotation: any;
    type: keyof typeof PHOTO_URLS;
    size?: [number, number]; // width, height
}

export const WallPhoto = ({ position, rotation, type, size = [1, 1.2] }: WallPhotoProps) => {
    const [w, h] = size;
    return (
        <group position={position} rotation={rotation}>
            {/* Frame */}
            <mesh castShadow position={[0, 0, -0.02]}>
                <boxGeometry args={[w + 0.15, h + 0.15, 0.05]} />
                <meshStandardMaterial color="#5d4037" roughness={0.6} />
            </mesh>
            
            {/* White Matting */}
             <mesh position={[0, 0, -0.01]}>
                <planeGeometry args={[w + 0.02, h + 0.02]} />
                <meshBasicMaterial color="#f5f5f5" />
            </mesh>

            {/* Picture */}
            <Image 
                url={PHOTO_URLS[type]} 
                scale={[w - 0.1, h - 0.1]} 
                position={[0, 0, 0.01]} 
                toneMapped={false}
                transparent
                opacity={0.9}
            />
            
            {/* Glass reflection */}
            <mesh position={[0, 0, 0.02]}>
                <planeGeometry args={[w - 0.1, h - 0.1]} />
                <meshStandardMaterial color="#fff" transparent opacity={0.1} roughness={0} metalness={0.9} />
            </mesh>
        </group>
    );
};