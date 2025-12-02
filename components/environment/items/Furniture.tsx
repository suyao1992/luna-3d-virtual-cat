
import React from 'react';
import { Float, RoundedBox } from '@react-three/drei';

export const CloudChandelier = () => {
  return (
    <group position={[0, 8.5, 0]}>
        <Float speed={1} rotationIntensity={0.1} floatIntensity={0.2}>
            <group position={[0, 0, 0]}>
                <mesh position={[0, 0, 0]}><sphereGeometry args={[1.2, 32, 32]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} /></mesh>
                <mesh position={[1, -0.2, 0]}><sphereGeometry args={[0.9, 32, 32]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} /></mesh>
                <mesh position={[-1, -0.1, 0.5]}><sphereGeometry args={[1.0, 32, 32]} /><meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.8} /></mesh>
                <pointLight intensity={2} distance={15} color="#ffedd5" decay={2} />
            </group>
            <group position={[0.5, -1.5, 0]}>
                <mesh rotation={[0,0,Math.PI/5]}><cylinderGeometry args={[0.02, 0.02, 1.5]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh>
                <mesh position={[0, -0.8, 0]} rotation={[0, 0, Math.PI/4]}>
                    <dodecahedronGeometry args={[0.2, 0]} />
                    <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
                </mesh>
            </group>
             <group position={[-0.8, -1.2, 0.5]}>
                <mesh rotation={[0,0,-Math.PI/10]}><cylinderGeometry args={[0.02, 0.02, 1.0]} /><meshStandardMaterial color="#ffd700" metalness={0.8} /></mesh>
                <mesh position={[0, -0.6, 0]}>
                    <dodecahedronGeometry args={[0.15, 0]} />
                    <meshStandardMaterial color="#ffd700" emissive="#ffd700" emissiveIntensity={0.5} />
                </mesh>
            </group>
        </Float>
    </group>
  );
};

export const SoftCatTree = ({ onClick }: { onClick?: () => void }) => {
    return (
        <group 
            position={[8, 0, -6]} 
            rotation={[0, -0.5, 0]}
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <RoundedBox args={[3, 0.3, 3]} radius={0.15} smoothness={4} position={[0, 0.15, 0]}>
                <meshStandardMaterial color="#e6c9a8" />
            </RoundedBox>
            
            <mesh position={[0.8, 2.5, 0.8]}>
                <cylinderGeometry args={[0.15, 0.15, 5, 32]} />
                <meshStandardMaterial color="#f5deb3" />
            </mesh>
            <group position={[0.8, 5, 0.8]}>
                <RoundedBox args={[1.5, 0.3, 1.5]} radius={0.15} smoothness={4}>
                     <meshStandardMaterial color="#ffc4d6" />
                </RoundedBox>
                <mesh position={[0.6, -0.5, 0.6]}><sphereGeometry args={[0.15]} /><meshStandardMaterial color="cyan" /></mesh>
                <mesh position={[0.6, -0.25, 0.6]}><cylinderGeometry args={[0.01,0.01, 0.5]} /><meshBasicMaterial color="#fff" /></mesh>
            </group>

            <mesh position={[-0.8, 1.5, -0.8]}>
                <cylinderGeometry args={[0.15, 0.15, 3, 32]} />
                <meshStandardMaterial color="#f5deb3" />
            </mesh>
            <group position={[-0.8, 3.5, -0.8]}>
                 <RoundedBox args={[1.8, 1.6, 1.8]} radius={0.4} smoothness={8}>
                     <meshStandardMaterial color="#d7ccc8" />
                 </RoundedBox>
                 <mesh position={[0, 0, 0.9]}>
                     <circleGeometry args={[0.5, 32]} />
                     <meshStandardMaterial color="#5d4037" />
                 </mesh>
            </group>
        </group>
    )
};

export const CloudSofa = ({ onClick }: { onClick?: () => void }) => {
    return (
        <group 
            position={[9, 0, 4]} 
            rotation={[0, -Math.PI/2 - 0.2, 0]}
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            <RoundedBox args={[4, 1.2, 2.5]} radius={0.6} smoothness={8} position={[0, 0.6, 0]}>
                 <meshStandardMaterial color="#a8d8b9" roughness={0.8} />
            </RoundedBox>
            <group position={[0, 1.5, -1.0]}>
                 <mesh position={[0, 0, 0]}><sphereGeometry args={[1.2, 32, 32]} /><meshStandardMaterial color="#a8d8b9" roughness={0.8} /></mesh>
                 <mesh position={[-1.2, -0.2, 0]}><sphereGeometry args={[1.0, 32, 32]} /><meshStandardMaterial color="#a8d8b9" roughness={0.8} /></mesh>
                 <mesh position={[1.2, -0.2, 0]}><sphereGeometry args={[1.0, 32, 32]} /><meshStandardMaterial color="#a8d8b9" roughness={0.8} /></mesh>
            </group>
            <RoundedBox args={[1, 1.5, 2.4]} radius={0.5} smoothness={8} position={[-2.2, 0.75, 0.1]}>
                 <meshStandardMaterial color="#a8d8b9" roughness={0.8} />
            </RoundedBox>
             <RoundedBox args={[1, 1.5, 2.4]} radius={0.5} smoothness={8} position={[2.2, 0.75, 0.1]}>
                 <meshStandardMaterial color="#a8d8b9" roughness={0.8} />
            </RoundedBox>
            
            <group position={[0, 1.3, 0.5]} rotation={[0.2, 0, 0.1]}>
                 <RoundedBox args={[1.2, 0.8, 0.4]} radius={0.4} smoothness={8}>
                      <meshStandardMaterial color="#ffc4d6" roughness={1} />
                 </RoundedBox>
            </group>
        </group>
    )
};

export const PawRug = ({ onClick, onPointerMove }: any) => {
    return (
        <group position={[0, 0.015, 0]} rotation={[-Math.PI/2, 0, 0]}>
            <mesh receiveShadow onClick={onClick} onPointerMove={onPointerMove}>
                <circleGeometry args={[3.5, 64]} />
                <meshStandardMaterial color="#fff5e6" />
            </mesh>
            <mesh position={[0, 2.2, 0.01]}><circleGeometry args={[0.6, 32]} /><meshStandardMaterial color="#ffe0b2" /></mesh>
            <mesh position={[-1.8, 1.5, 0.01]} rotation={[0,0,0.5]}><circleGeometry args={[0.5, 32]} /><meshStandardMaterial color="#ffe0b2" /></mesh>
            <mesh position={[1.8, 1.5, 0.01]} rotation={[0,0,-0.5]}><circleGeometry args={[0.5, 32]} /><meshStandardMaterial color="#ffe0b2" /></mesh>
            <mesh position={[0, -0.5, 0.01]} scale={[1.8, 1.4, 1]}><circleGeometry args={[1, 32]} /><meshStandardMaterial color="#ffe0b2" /></mesh>
        </group>
    )
};
