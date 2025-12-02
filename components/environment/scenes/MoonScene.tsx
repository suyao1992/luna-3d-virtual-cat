
import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Stars, Html } from '@react-three/drei';
import { Vector3, MathUtils, AdditiveBlending, DoubleSide, Mesh, CanvasTexture, Object3D, InstancedMesh } from 'three';
import { DiscoBall } from '../items/DiscoBall';

interface MoonSceneProps {
    isExploding: boolean;
    onNuke: () => void;
}

export const MoonScene: React.FC<MoonSceneProps> = ({ isExploding, onNuke }) => {
    const explosionRef = useRef<Mesh>(null);
    const rocksRef = useRef<InstancedMesh>(null);

    const moonTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#7c7c7c'; ctx.fillRect(0, 0, 512, 512);
            for(let i=0; i<5000; i++) {
               const v = Math.random() * 60;
               ctx.fillStyle = `rgba(${v},${v},${v}, 0.1)`;
               ctx.fillRect(Math.random()*512, Math.random()*512, 2, 2);
            }
        }
        return new CanvasTexture(canvas);
    }, []);
  
    const earthTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 512; canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#0f2c60'; ctx.fillRect(0, 0, 512, 512);
            ctx.fillStyle = '#2d4c1e';
            ctx.beginPath(); ctx.arc(256, 256, 100, 0, Math.PI*2); ctx.fill();
        }
        return new CanvasTexture(canvas);
    }, []);

    const hazardTexture = useMemo(() => {
        const canvas = document.createElement('canvas');
        canvas.width = 64; canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = '#facc15'; ctx.fillRect(0, 0, 64, 64);
            ctx.fillStyle = '#111';
            for(let i=-64; i<64; i+=20) {
                ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+20,0); ctx.lineTo(i+64+20,64); ctx.lineTo(i+64,64); ctx.fill();
            }
        }
        return new CanvasTexture(canvas);
    }, []);

    useEffect(() => {
        if (rocksRef.current) {
            const tempObj = new Object3D();
            for (let i = 0; i < 400; i++) {
                const angle = Math.random() * Math.PI * 2;
                const r = Math.pow(Math.random(), 2) * 25 + 1; 
                tempObj.position.set(Math.cos(angle) * r, -0.05, Math.sin(angle) * r);
                const scale = Math.random() * 0.2 + 0.05;
                tempObj.scale.set(scale, scale * 0.6, scale);
                tempObj.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
                tempObj.updateMatrix();
                rocksRef.current.setMatrixAt(i, tempObj.matrix);
            }
            rocksRef.current.instanceMatrix.needsUpdate = true;
        }
    }, []);

    useFrame((state, delta) => {
        if (isExploding && explosionRef.current) {
            explosionRef.current.scale.lerp(new Vector3(50, 50, 50), delta * 5);
            if (explosionRef.current.material) {
                // @ts-ignore
                explosionRef.current.material.opacity = MathUtils.lerp(explosionRef.current.material.opacity, 1.1, delta * 3);
            }
        }
    });

    return (
        <group>
            <Stars radius={400} depth={50} count={8000} factor={6} saturation={0} fade speed={0.5} />
            
            <DiscoBall />

            <group position={[0, 35, -100]} rotation={[0,0,0.4]}>
                <mesh><sphereGeometry args={[25, 64, 64]} /><meshStandardMaterial map={earthTexture} roughness={0.6} emissive="#020817" emissiveIntensity={0.2} /></mesh>
                <mesh scale={[1.15, 1.15, 1.15]}><sphereGeometry args={[25, 32, 32]} /><meshBasicMaterial color="#4488ff" transparent opacity={0.2} blending={AdditiveBlending} side={DoubleSide} /></mesh>
            </group>
            <group position={[0, -200, 0]}>
                 <mesh receiveShadow rotation={[-Math.PI/2, 0, 0]}><sphereGeometry args={[200, 256, 256]} /><meshStandardMaterial map={moonTexture} bumpMap={moonTexture} bumpScale={3.0} color="#888888" roughness={1.0} metalness={0.0} /></mesh>
            </group>
            <instancedMesh ref={rocksRef} args={[undefined, undefined, 400]} castShadow receiveShadow>
                <dodecahedronGeometry args={[0.4, 0]} />
                <meshStandardMaterial color="#777" roughness={0.9} />
            </instancedMesh>
            <group position={[3, 0, 3]} rotation={[0, -0.7, 0]}>
                <mesh position={[0, 0, 0]} castShadow><cylinderGeometry args={[0.3, 0.4, 0.8, 6]} /><meshStandardMaterial map={hazardTexture} color="#555" /></mesh>
                <group position={[0, 0.4, 0]}>
                    <mesh><cylinderGeometry args={[0.25, 0.3, 0.1, 32]} /><meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} /></mesh>
                    <mesh position={[0, 0.05, 0]} onClick={(e) => { e.stopPropagation(); onNuke(); }} onPointerOver={() => document.body.style.cursor = 'pointer'} onPointerOut={() => document.body.style.cursor = 'auto'}>
                        <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} /><meshStandardMaterial color="#ff0000" emissive="#ff0000" emissiveIntensity={1.5} toneMapped={false} />
                    </mesh>
                    <mesh position={[0, 0.15, 0]}><sphereGeometry args={[0.2, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} /><meshPhysicalMaterial color="#aaffff" transmission={0.9} opacity={0.3} transparent roughness={0} thickness={0.05} /></mesh>
                </group>
                <Html position={[0, 1.0, 0]} center distanceFactor={8}><div className="bg-yellow-500/90 text-black font-black text-[10px] px-2 py-0.5 rounded border border-black animate-pulse uppercase tracking-widest">⚠️ DANGER</div></Html>
            </group>
            {isExploding && (
                <mesh ref={explosionRef} position={[0, 0, 0]} scale={[0,0,0]}><sphereGeometry args={[1, 32, 32]} /><meshBasicMaterial color="#ffffff" transparent opacity={0} side={DoubleSide} depthTest={false} /></mesh>
            )}
        </group>
    );
};
