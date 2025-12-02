

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows, RoundedBox, Html } from '@react-three/drei';
import { Vector3, MathUtils, DoubleSide } from 'three';
import { CatAction, WeatherCondition } from '../../../types';
import { CloudChandelier, SoftCatTree, CloudSofa, PawRug } from '../items/Furniture';
import { CatTV } from '../items/CatTV';
import { Window } from '../items/Window';
import { audioService } from '../../../services/audio';

interface LivingRoomProps {
    action: CatAction;
    onWalkCommand?: (point: Vector3) => void;
    onPointerMove?: (point: Vector3) => void;
    targetPosition?: Vector3 | null;
    isDiscoMode: boolean;
    onToggleDisco: () => void;
    onInteract?: (action: CatAction) => void;
    hasPoop: boolean;
    
    // New Props
    timeOfDay: number;
    weather: WeatherCondition;
    onWindowClick: () => void;
}

export const LivingRoom: React.FC<LivingRoomProps> = ({ 
    action, 
    onWalkCommand, 
    onPointerMove, 
    targetPosition,
    isDiscoMode,
    onToggleDisco,
    onInteract,
    hasPoop,
    timeOfDay,
    weather,
    onWindowClick
}) => {
    const [isPlayingMusic, setIsPlayingMusic] = useState(false);
    const vinylRef = useRef<any>(null);
    const toneArmRef = useRef<any>(null);

    useFrame((state, delta) => {
        if ((isPlayingMusic || isDiscoMode) && vinylRef.current) {
            vinylRef.current.rotation.z -= delta * 2;
        }
        if (toneArmRef.current) {
            const targetRot = (isPlayingMusic || isDiscoMode) ? 0.3 : 0.6; 
            toneArmRef.current.rotation.z = MathUtils.lerp(toneArmRef.current.rotation.z, targetRot, 0.05);
        }
    });

    const handleFloorClick = (e: any) => {
        e.stopPropagation();
        if (onWalkCommand) onWalkCommand(e.point);
    };

    const handleToggleMusic = (e: any) => {
        e.stopPropagation();
        const playing = audioService.toggleBGM();
        setIsPlayingMusic(playing);
    }

    return (
        <group>
             {/* Floor */}
             <mesh 
                rotation={[-Math.PI / 2, 0, 0]} 
                position={[0, -0.01, 0]} 
                receiveShadow 
                onClick={handleFloorClick}
                onPointerMove={(e) => { e.stopPropagation(); onPointerMove?.(e.point); }}
                onPointerOver={() => document.body.style.cursor = 'crosshair'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
            >
                <planeGeometry args={[40, 40]} />
                <meshStandardMaterial color="#e6d7c3" roughness={0.8} />
             </mesh>
             
             <ContactShadows position={[0, 0.01, 0]} opacity={0.4} scale={20} blur={2} far={1} />
             
             {/* Walls */}
             <group position={[0, 0, -10]}>
                 <mesh position={[0, 5, 0]} receiveShadow>
                     <planeGeometry args={[40, 10]} />
                     <meshStandardMaterial color="#e0d6cc" />
                 </mesh>
                 <group position={[0, 0, 0.1]}>
                    {Array.from({length: 20}).map((_, i) => (
                        <mesh key={i} position={[-18 + i * 2, 5, 0]}>
                            <cylinderGeometry args={[0.3, 0.3, 10, 16]} />
                            <meshStandardMaterial color="#e0d6cc" roughness={0.5} />
                        </mesh>
                    ))}
                 </group>
             </group>

             <group position={[15, 5, 0]} rotation={[0, -Math.PI/2, 0]}>
                  <mesh receiveShadow><planeGeometry args={[40, 10]} /><meshStandardMaterial color="#e0d6cc" /></mesh>
             </group>
             <group position={[-15, 5, 0]} rotation={[0, Math.PI/2, 0]}>
                  <mesh receiveShadow><planeGeometry args={[40, 10]} /><meshStandardMaterial color="#e0d6cc" /></mesh>
             </group>

             {/* Items */}
             <CloudChandelier />
             <CatTV />
             <SoftCatTree onClick={() => onInteract?.('climbing')} />
             <CloudSofa onClick={() => onInteract?.('reading')} />
             
             {/* Floor Items */}
             {(action === 'playing_gomoku' || action === 'playing_xiangqi' || action === 'playing_match3' || action === 'preparing_game') && (
               <group position={[0, 0, 3.5]}>
                  <mesh receiveShadow position={[0, 0.01, 0]}><boxGeometry args={[1.8, 0.05, 1.8]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
                  <mesh position={[0, 0.04, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[1.6, 1.6]} /><meshStandardMaterial color="#fdf6e3" /></mesh>
               </group>
             )}
             
             <group position={[-0.8, 0.05, 4.0]} rotation={[0, 0.5, 0]}>
                <mesh castShadow rotation={[Math.PI/2, 0, 0]}><capsuleGeometry args={[0.08, 0.15, 4, 8]} /><meshStandardMaterial color="gray" /></mesh>
             </group>

             <PawRug onClick={handleFloorClick} onPointerMove={(e: any) => { e.stopPropagation(); onPointerMove?.(e.point); }} />

             {/* Custom Vertical Vinyl Player */}
             <group 
                position={[14.85, 5, -2]} 
                rotation={[0, -Math.PI/2, 0]}
                onClick={handleToggleMusic}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
             >
                  {/* ... Vinyl Player Mesh (Keep existing content) ... */}
                  <mesh position={[0, 0, -0.05]}><boxGeometry args={[3.2, 4.2, 0.1]} /><meshStandardMaterial color="#000000" roughness={0.5} /></mesh>
                  <mesh position={[0, 0, 0]}><boxGeometry args={[2.8, 3.8, 0.2]} /><meshStandardMaterial color="#616161" roughness={0.6} /></mesh>
                  <group position={[0, -1.3, 0.11]}>
                      <mesh><boxGeometry args={[2.2, 0.7, 0.02]} /><meshStandardMaterial color="#eeeeee" /></mesh>
                      <mesh position={[-0.7, 0, 0.02]}><circleGeometry args={[0.1, 32]} /><meshStandardMaterial color={isPlayingMusic ? "#00e676" : "#b0bec5"} emissive={isPlayingMusic ? "#00e676" : "#000000"} emissiveIntensity={isPlayingMusic ? 0.8 : 0} /></mesh>
                      <group position={[0, 0, 0.02]}>
                          <mesh position={[-0.1, 0, 0]}><planeGeometry args={[0.08, 0.25]} /><meshBasicMaterial color="#333" /></mesh>
                          <mesh position={[0.1, 0, 0]}><planeGeometry args={[0.08, 0.25]} /><meshBasicMaterial color="#333" /></mesh>
                      </group>
                      <mesh position={[0.7, 0, 0.02]}><circleGeometry args={[0.12, 32]} /><meshStandardMaterial color="#333" /></mesh>
                  </group>
                  <group position={[0, 0.5, 0.12]} ref={vinylRef}>
                      <mesh rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[1.1, 1.1, 0.02, 64]} /><meshStandardMaterial color="#1a1a1a" roughness={0.3} metalness={0.2} /></mesh>
                      <mesh rotation={[Math.PI/2, 0, 0]} position={[0, 0, 0.02]}><cylinderGeometry args={[0.35, 0.35, 0.01, 32]} /><meshStandardMaterial color="#ef5350" /></mesh>
                      <group position={[-0.15, 0.15, 0.03]} rotation={[Math.PI/2, 0, 0]}><mesh><cylinderGeometry args={[0.08, 0.08, 0.01, 32]} /><meshStandardMaterial color="#fff176" /></mesh><mesh position={[0, 0.01, 0]} rotation={[0, 0, Math.PI/4]}><boxGeometry args={[0.08, 0.01, 0.02]} /><meshBasicMaterial color="#000" /></mesh></group>
                      <group position={[0.15, 0.15, 0.03]} rotation={[Math.PI/2, 0, 0]}><mesh><cylinderGeometry args={[0.08, 0.08, 0.01, 32]} /><meshStandardMaterial color="#fff176" /></mesh><mesh position={[0, 0.01, 0]} rotation={[0, 0, -Math.PI/4]}><boxGeometry args={[0.08, 0.01, 0.02]} /><meshBasicMaterial color="#000" /></mesh></group>
                  </group>
                  <group ref={toneArmRef} position={[1.1, 1.6, 0.2]} rotation={[0, 0, 0.6]}>
                       <mesh position={[0, -0.9, 0]} rotation={[0, 0, 0]}><cylinderGeometry args={[0.04, 0.03, 2.0]} /><meshStandardMaterial color="#222" metalness={0.5} roughness={0.5} /></mesh>
                       <mesh position={[0, 0, 0]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.15, 0.15, 0.1]} /><meshStandardMaterial color="#444" /></mesh>
                       <mesh position={[0, -1.9, -0.05]} rotation={[0, 0, 0]}><boxGeometry args={[0.15, 0.25, 0.15]} /><meshStandardMaterial color="#222" /></mesh>
                  </group>
             </group>

             {/* DJ Switch */}
             <group 
                position={[-7, 4, -9.6]} 
                onClick={(e) => { e.stopPropagation(); onToggleDisco(); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
             >
                  <RoundedBox args={[0.6, 0.8, 0.1]} radius={0.1} smoothness={4}><meshStandardMaterial color="#fff" /></RoundedBox>
                  <mesh position={[0, 0, 0.05]} rotation={[Math.PI/2, 0, 0]}><cylinderGeometry args={[0.2, 0.25, 0.1]} /><meshStandardMaterial color="#eee" /></mesh>
                  <mesh position={[0, 0, 0.1]} rotation={[Math.PI/2, 0, 0]} scale={[1, isDiscoMode ? 0.5 : 1, 1]}>
                      <cylinderGeometry args={[0.15, 0.15, 0.15, 32]} />
                      <meshStandardMaterial color={isDiscoMode ? "#ff00ff" : "#ef5350"} emissive={isDiscoMode ? "#ff00ff" : "#000000"} emissiveIntensity={isDiscoMode ? 2 : 0} />
                  </mesh>
                  <Html position={[0, -0.6, 0]} center distanceFactor={8} style={{ pointerEvents: 'none' }}>
                      <div className={`text-[10px] font-bold px-1 py-0.5 rounded border ${isDiscoMode ? 'bg-fuchsia-500 text-white border-fuchsia-300' : 'bg-gray-200 text-gray-500'}`}>
                          {isDiscoMode ? "PARTY!" : "DISCO"}
                      </div>
                  </Html>
             </group>

             {/* The Interactive Window */}
             <Window onClick={onWindowClick} timeOfDay={timeOfDay} weather={weather} />
             
             {/* Hiding Box */}
             <group 
                position={[-12, 0.6, 2]} 
                rotation={[0, 0.3, 0]}
                onClick={(e) => { e.stopPropagation(); onInteract?.('hiding'); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
             >
                   <mesh castShadow receiveShadow>
                      <boxGeometry args={[1.6, 1.2, 1.8]} />
                      <meshStandardMaterial color="#d7ccc8" side={DoubleSide} />
                  </mesh>
                  <mesh position={[0, 0.01, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[1.5, 1.7]} /><meshStandardMaterial color="#3e2723" /></mesh>
                  <mesh position={[0.8, 0.6, 0]} rotation={[0, 0, 0.5]}><boxGeometry args={[0.5, 0.05, 1.5]} /><meshStandardMaterial color="#d7ccc8" side={DoubleSide} /></mesh>
             </group>

             {/* Litter */}
             <group position={[14, 0.2, -6]}>
                   <RoundedBox args={[2, 0.4, 2.5]} radius={0.2} smoothness={4}><meshStandardMaterial color="#f5f5f5" /></RoundedBox>
                   <mesh position={[0, 0.21, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[1.8, 2.3]} /><meshStandardMaterial color="#d7ccc8" roughness={1} /></mesh>
                   {hasPoop && (
                       <group position={[0, 0.25, 0]}>
                           <mesh position={[0.2, 0, 0.2]} rotation={[0,1,0]}><dodecahedronGeometry args={[0.12, 0]} /><meshStandardMaterial color="#3e2723" /></mesh>
                           <mesh position={[-0.1, 0, -0.1]} rotation={[1,0,2]}><dodecahedronGeometry args={[0.1, 0]} /><meshStandardMaterial color="#3e2723" /></mesh>
                           <mesh position={[0.1, 0.05, -0.05]}><dodecahedronGeometry args={[0.08, 0]} /><meshStandardMaterial color="#3e2723" /></mesh>
                       </group>
                   )}
             </group>
             
             {/* Basket */}
             <group 
                position={[3, 0.15, -4]}
                onClick={(e) => { e.stopPropagation(); onInteract?.('sleeping'); }}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => document.body.style.cursor = 'auto'}
             >
                  <mesh receiveShadow><cylinderGeometry args={[1.2, 1.4, 0.3, 32]} /><meshStandardMaterial color="#f8bbd0" /></mesh>
                  <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[1.1, 32]} /><meshStandardMaterial color="#fff0f5" /></mesh>
             </group>
             
             {/* Bowls */}
             <group position={[-2, 0.05, 1]}>
                  <group 
                    position={[0, 0, 0]}
                    onClick={(e) => { e.stopPropagation(); onInteract?.('eating'); }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                  >
                      <mesh castShadow receiveShadow><cylinderGeometry args={[0.4, 0.3, 0.15, 32]} /><meshStandardMaterial color="#ffcc80" /></mesh>
                      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.35, 32]} /><meshStandardMaterial color="#795548" /></mesh>
                  </group>
                  <group 
                    position={[0.9, 0, 0]}
                    onClick={(e) => { e.stopPropagation(); onInteract?.('drinking'); }}
                    onPointerOver={() => document.body.style.cursor = 'pointer'}
                    onPointerOut={() => document.body.style.cursor = 'auto'}
                  >
                      <mesh castShadow receiveShadow><cylinderGeometry args={[0.4, 0.3, 0.15, 32]} /><meshStandardMaterial color="#90caf9" /></mesh>
                      <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.35, 32]} /><meshStandardMaterial color="#e1f5fe" opacity={0.8} transparent /></mesh>
                  </group>
             </group>

             {/* Marker */}
             {targetPosition && (
                  <mesh position={[targetPosition.x, 0.05, targetPosition.z]} rotation={[-Math.PI/2, 0, 0]}>
                      <ringGeometry args={[0.3, 0.35, 32]} />
                      <meshBasicMaterial color="#ff69b4" opacity={0.6} transparent />
                  </mesh>
             )}
        </group>
    );
};