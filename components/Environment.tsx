
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CatAction } from '../types';
import { Vector3, Group, MathUtils } from 'three';

interface EnvironmentProps {
    action: CatAction;
    hygiene: number;
    onWalkCommand?: (point: Vector3) => void;
    onPointerMove?: (point: Vector3) => void;
    targetPosition?: Vector3 | null;
}

export const Environment: React.FC<EnvironmentProps> = ({ action, hygiene, onWalkCommand, onPointerMove, targetPosition }) => {
  const boardRef = useRef<Group>(null);

  // Generate random poop positions based on hygiene level
  const poopParticles = useMemo(() => {
    const count = Math.max(0, Math.ceil((100 - hygiene) / 20)); 
    return Array.from({ length: count }).map((_, i) => ({
      x: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8,
      scale: 0.08 + Math.random() * 0.05,
      rotation: Math.random() * Math.PI
    }));
  }, [hygiene]);

  useFrame((state, delta) => {
      // Animate Board pop-up
      if (boardRef.current) {
          const targetScale = (action === 'playing_gomoku' || action === 'playing_xiangqi' || action === 'preparing_game') ? 1 : 0;
          const currentScale = boardRef.current.scale.x;
          const newScale = MathUtils.lerp(currentScale, targetScale, 0.1);
          boardRef.current.scale.set(newScale, newScale, newScale);
      }
  });

  const handleFloorClick = (e: any) => {
      e.stopPropagation();
      if (onWalkCommand) {
          onWalkCommand(e.point);
      }
  };
  
  const handlePointerMove = (e: any) => {
      e.stopPropagation();
      if(onPointerMove) {
          onPointerMove(e.point);
      }
  }

  return (
    <group>
      {/* --- REALISTIC LIGHTING SETUP --- */}
      <hemisphereLight args={['#dbeafe', '#f5f5dc', 0.6]} />
      <directionalLight 
        position={[5, 12, -20]}
        target-position={[0, 0, 0]}
        intensity={1.5} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color="#fffaf0"
      >
        <orthographicCamera attach="shadow-camera" args={[-15, 15, 15, -15]} />
      </directionalLight>
      <pointLight position={[-2, 6, 2]} intensity={0.3} color="#ffedd5" distance={20} decay={2} />

      {/* --- ROOM STRUCTURE --- */}
      <mesh 
        rotation={[-Math.PI / 2, 0, 0]} 
        position={[0, -0.01, 0]} 
        receiveShadow 
        onClick={handleFloorClick}
        onPointerMove={handlePointerMove}
        onPointerOver={() => document.body.style.cursor = 'crosshair'}
        onPointerOut={() => document.body.style.cursor = 'auto'}
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#5d4037" roughness={0.8} /> 
      </mesh>

      {targetPosition && (
          <mesh position={[targetPosition.x, 0.02, targetPosition.z]} rotation={[-Math.PI/2, 0, 0]}>
              <ringGeometry args={[0.3, 0.35, 32]} />
              <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
          </mesh>
      )}

      <mesh position={[0, 5, -10]} receiveShadow><planeGeometry args={[30, 10]} /><meshStandardMaterial color="#fff8e1" roughness={1} /></mesh>
      <mesh position={[0, 0.25, -9.95]}><boxGeometry args={[30, 0.5, 0.1]} /><meshStandardMaterial color="#fff" /></mesh>
      <mesh position={[10, 5, 0]} rotation={[0, -Math.PI/2, 0]} receiveShadow><planeGeometry args={[30, 10]} /><meshStandardMaterial color="#fff8e1" roughness={1} /></mesh>
      <mesh position={[9.95, 0.25, 0]} rotation={[0, -Math.PI/2, 0]}><boxGeometry args={[30, 0.5, 0.1]} /><meshStandardMaterial color="#fff" /></mesh>

      {/* Rug */}
      <group position={[0, 0.02, 0]}>
        <mesh rotation={[-Math.PI/2, 0, 0]} receiveShadow><circleGeometry args={[2.8, 64]} /><meshStandardMaterial color="#b2dfdb" roughness={0.9} /></mesh>
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.001, 0]} receiveShadow><circleGeometry args={[2.2, 64]} /><meshStandardMaterial color="#80cbc4" roughness={0.9} /></mesh>
        <mesh rotation={[-Math.PI/2, 0, 0]} position={[0, 0.002, 0]} receiveShadow><circleGeometry args={[0.5, 64]} /><meshStandardMaterial color="#b2dfdb" roughness={0.9} /></mesh>
      </group>

      {/* Window */}
      <group position={[0, 3.5, -9.9]}>
        <mesh position={[0, 0, -0.2]}><planeGeometry args={[3.2, 2.2]} /><meshBasicMaterial color="#bae6fd" /></mesh>
        <mesh><boxGeometry args={[3, 2, 0.2]} /><meshStandardMaterial color="#e0f2fe" roughness={0.1} metalness={0.1} transparent opacity={0.2} /></mesh>
        <mesh position={[0, 0, 0.05]} castShadow><boxGeometry args={[3.2, 2.2, 0.1]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 0, 0.05]} castShadow><boxGeometry args={[3, 0.1, 0.12]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, 0, 0.05]} castShadow><boxGeometry args={[0.1, 2, 0.12]} /><meshStandardMaterial color="#ffffff" /></mesh>
        <mesh position={[0, -1.15, 0.3]} castShadow><boxGeometry args={[3.4, 0.1, 0.6]} /><meshStandardMaterial color="#ffffff" /></mesh>
      </group>

      {/* Wall Art - "Hajimi" Abstract Cat Food Ad */}
      <group position={[-4, 4, -9.85]}>
          {/* Frame */}
          <mesh castShadow><boxGeometry args={[2.2, 3, 0.1]} /><meshStandardMaterial color="#212121" /></mesh>
          {/* Canvas Background (Pastel Pink) */}
          <mesh position={[0, 0, 0.06]}><planeGeometry args={[2, 2.8]} /><meshStandardMaterial color="#fce4ec" /></mesh>
          
          {/* Poster Content */}
          <group position={[0, 0, 0.07]}>
             {/* Cat Head (Black Circle) */}
             <mesh position={[0, 0.3, 0]}><circleGeometry args={[0.65, 32]} /><meshBasicMaterial color="#212121" /></mesh>
             {/* Ears - Triangles using Circle with 3 segments */}
             <mesh position={[-0.45, 0.8, 0]} rotation={[0,0,0.5]}><circleGeometry args={[0.2, 3]} /><meshBasicMaterial color="#212121" /></mesh>
             <mesh position={[0.45, 0.8, 0]} rotation={[0,0,-0.5]}><circleGeometry args={[0.2, 3]} /><meshBasicMaterial color="#212121" /></mesh>
             
             {/* Eyes (Glowing Yellow) */}
             <mesh position={[-0.2, 0.4, 0.01]}><circleGeometry args={[0.15, 32]} /><meshBasicMaterial color="#ffeb3b" /></mesh>
             <mesh position={[0.2, 0.4, 0.01]}><circleGeometry args={[0.15, 32]} /><meshBasicMaterial color="#ffeb3b" /></mesh>
             {/* Pupils (Slits) */}
             <mesh position={[-0.2, 0.4, 0.02]}><planeGeometry args={[0.05, 0.2]} /><meshBasicMaterial color="#000" /></mesh>
             <mesh position={[0.2, 0.4, 0.02]}><planeGeometry args={[0.05, 0.2]} /><meshBasicMaterial color="#000" /></mesh>

             {/* Red Fish Bone Logo (Abstract Geometric Shapes) */}
             <group position={[0, -0.5, 0.01]} rotation={[0,0,-0.15]}>
                 <mesh><planeGeometry args={[0.8, 0.06]} /><meshBasicMaterial color="#ef5350" /></mesh>
                 <mesh position={[-0.3, 0, 0]}><planeGeometry args={[0.06, 0.3]} /><meshBasicMaterial color="#ef5350" /></mesh>
                 <mesh position={[0, 0, 0]}><planeGeometry args={[0.06, 0.35]} /><meshBasicMaterial color="#ef5350" /></mesh>
                 <mesh position={[0.3, 0, 0]}><planeGeometry args={[0.06, 0.3]} /><meshBasicMaterial color="#ef5350" /></mesh>
                 {/* Simplified ends using squares instead of circles to avoid potential Geometry argument errors */}
                 <mesh position={[0.5, 0, 0]}><planeGeometry args={[0.2, 0.2]} /><meshBasicMaterial color="#ef5350" /></mesh>
                 <mesh position={[-0.5, 0, 0]}><planeGeometry args={[0.2, 0.2]} /><meshBasicMaterial color="#ef5350" /></mesh>
             </group>
             
             {/* Abstract Text Bars (Slogan) */}
             <mesh position={[0, -0.9, 0.01]}><planeGeometry args={[1.2, 0.12]} /><meshBasicMaterial color="#1976d2" /></mesh>
             <mesh position={[0, -1.1, 0.01]}><planeGeometry args={[0.9, 0.1]} /><meshBasicMaterial color="#43a047" /></mesh>
          </group>
      </group>

      {/* Scratching Post */}
      <group position={[6, 0, -7]} rotation={[0, -0.5, 0]}>
          <mesh position={[0, 0.05, 0]} receiveShadow><boxGeometry args={[1.5, 0.1, 1.5]} /><meshStandardMaterial color="#a1887f" /></mesh>
          <mesh position={[0, 1.5, 0]} castShadow receiveShadow><cylinderGeometry args={[0.15, 0.15, 3, 16]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
          <mesh position={[0, 3, 0]} castShadow><cylinderGeometry args={[0.8, 0.8, 0.1, 32]} /><meshStandardMaterial color="#a1887f" /></mesh>
          <mesh position={[0.6, 2.8, 0]}><sphereGeometry args={[0.1]} /><meshStandardMaterial color="#ef5350" /></mesh>
          <mesh position={[0.6, 3, 0]}><cylinderGeometry args={[0.01, 0.01, 0.4]} /><meshBasicMaterial color="#333" /></mesh>
      </group>

      {/* Potted Plant */}
      <group position={[-8, 0, -8]}>
          <mesh position={[0, 0.4, 0]} castShadow><cylinderGeometry args={[0.6, 0.4, 0.8, 16]} /><meshStandardMaterial color="#ffffff" /></mesh>
          <mesh position={[0, 0.75, 0]}><circleGeometry args={[0.55]} /><meshStandardMaterial color="#3e2723" /></mesh>
          <group position={[0, 0.8, 0]}>
              <mesh position={[0, 0.8, 0]} castShadow><sphereGeometry args={[0.7, 16, 16]} /><meshStandardMaterial color="#4caf50" roughness={0.8} /></mesh>
              <mesh position={[0.4, 0.6, 0.3]} castShadow><sphereGeometry args={[0.5, 16, 16]} /><meshStandardMaterial color="#66bb6a" roughness={0.8} /></mesh>
              <mesh position={[-0.3, 1.1, -0.2]} castShadow><sphereGeometry args={[0.4, 16, 16]} /><meshStandardMaterial color="#81c784" roughness={0.8} /></mesh>
          </group>
      </group>

      {/* Yarn Ball Toy */}
      <mesh position={[2, 0.15, 3]} castShadow receiveShadow rotation={[0.5, 0.5, 0]}><sphereGeometry args={[0.15, 16, 16]} /><meshStandardMaterial color="#ff4081" /></mesh>
      
      {/* Stack of Books */}
      <group position={[-5, 0, 4]} rotation={[0, 0.8, 0]}>
           <mesh position={[0, 0.05, 0]} castShadow><boxGeometry args={[0.8, 0.1, 1]} /><meshStandardMaterial color="#1e88e5" /></mesh>
           <mesh position={[0.05, 0.15, 0]} castShadow rotation={[0, 0.2, 0]}><boxGeometry args={[0.7, 0.1, 0.9]} /><meshStandardMaterial color="#43a047" /></mesh>
           <mesh position={[-0.05, 0.25, 0]} castShadow rotation={[0, -0.1, 0]}><boxGeometry args={[0.75, 0.1, 0.95]} /><meshStandardMaterial color="#fdd835" /></mesh>
      </group>

      {/* --- FOOD & WATER AREA --- */}
      <group position={[-2, 0, 1]}>
        <mesh position={[0.5, 0.02, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow><boxGeometry args={[2, 1, 0.05]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
        <group position={[0, 0.1, 0]}>
            <mesh castShadow receiveShadow><cylinderGeometry args={[0.35, 0.25, 0.2, 32]} /><meshStandardMaterial color="#ffab91" /></mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.3, 32]} /><meshStandardMaterial color={action === 'eating' ? "#8d6e63" : "#5d4037"} /></mesh>
        </group>
        <group position={[0.9, 0.1, 0]}>
             <mesh castShadow receiveShadow><cylinderGeometry args={[0.35, 0.25, 0.2, 32]} /><meshStandardMaterial color="#81d4fa" /></mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.3, 32]} /><meshStandardMaterial color="#e1f5fe" opacity={0.8} transparent /></mesh>
        </group>
      </group>

      {/* --- LITTER BOX AREA --- */}
      <group position={[5.5, 0.1, 5]}>
          <mesh castShadow receiveShadow><boxGeometry args={[1.8, 0.25, 1.4]} /><meshStandardMaterial color="#bdbdbd" /></mesh>
          <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}><planeGeometry args={[1.6, 1.2]} /><meshStandardMaterial color="#e0e0e0" roughness={1} /> </mesh>
          {poopParticles.map((poop, i) => (
             <mesh key={i} position={[poop.x, 0.15, poop.z]} rotation={[0, poop.rotation, 0]}>
                <dodecahedronGeometry args={[poop.scale, 0]} /><meshStandardMaterial color="#5d4037" roughness={0.9} />
             </mesh>
          ))}
      </group>

      {/* --- BED AREA --- */}
       <group position={[3, 0.15, -4]}>
        <mesh castShadow receiveShadow><cylinderGeometry args={[1.1, 1.3, 0.35, 32]} /><meshStandardMaterial color="#f48fb1" /></mesh>
         <mesh position={[0, 0.1, 0]} rotation={[-Math.PI/2, 0, 0]}><circleGeometry args={[0.95, 32]} /><meshStandardMaterial color="#fce4ec" roughness={1} /></mesh>
      </group>

      {/* --- 3D GAME TABLE (Shared for Gomoku & Xiangqi) --- */}
      <group ref={boardRef} position={[0, 0, 4.2]} scale={0}>
         {/* Table Legs */}
         <mesh position={[-0.4, 0.15, -0.4]} castShadow><boxGeometry args={[0.1, 0.3, 0.1]} /><meshStandardMaterial color="#5d4037" /></mesh>
         <mesh position={[0.4, 0.15, -0.4]} castShadow><boxGeometry args={[0.1, 0.3, 0.1]} /><meshStandardMaterial color="#5d4037" /></mesh>
         <mesh position={[-0.4, 0.15, 0.4]} castShadow><boxGeometry args={[0.1, 0.3, 0.1]} /><meshStandardMaterial color="#5d4037" /></mesh>
         <mesh position={[0.4, 0.15, 0.4]} castShadow><boxGeometry args={[0.1, 0.3, 0.1]} /><meshStandardMaterial color="#5d4037" /></mesh>
         
         {/* Table Top */}
         <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
             <boxGeometry args={[1.2, 0.1, 1.2]} />
             <meshStandardMaterial color="#deb887" roughness={0.6} />
         </mesh>
         
         {/* Dynamic texture depending on game could be here, but using generic board look for 3D is fine */}
         {/* We simulate a generic grid on the table */}
         <mesh position={[0, 0.401, 0]} rotation={[-Math.PI/2, 0, 0]} receiveShadow>
             <planeGeometry args={[1.0, 1.0]} />
             <meshStandardMaterial color="#000" wireframe />
         </mesh>
         <mesh position={[0, 0.4, 0]} rotation={[-Math.PI/2, 0, 0]}>
             <planeGeometry args={[1.05, 1.05]} />
             <meshStandardMaterial color="#f5deb3" />
         </mesh>

         {/* Bowls for Pieces (Shared) */}
         <group position={[-0.7, 0.35, 0]}>
             <mesh castShadow><cylinderGeometry args={[0.15, 0.12, 0.15]} /><meshStandardMaterial color="#8d6e63" /></mesh>
         </group>
         <group position={[0.7, 0.35, 0]}>
             <mesh castShadow><cylinderGeometry args={[0.15, 0.12, 0.15]} /><meshStandardMaterial color="#8d6e63" /></mesh>
         </group>
      </group>

    </group>
  );
};
