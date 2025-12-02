
import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { AdditiveBlending, DoubleSide, Group } from 'three';

export const DiscoBall = () => {
    const groupRef = useRef<Group>(null);
    
    useFrame((state, delta) => {
        if (groupRef.current) {
            groupRef.current.rotation.y += delta * 0.5;
            groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    return (
        <group ref={groupRef} position={[0, 8, 0]}>
            {/* The Ball */}
            <mesh castShadow>
                <icosahedronGeometry args={[1.2, 1]} />
                <meshStandardMaterial 
                    color="#ffffff" 
                    emissive="#444444" 
                    roughness={0.1} 
                    metalness={0.9} 
                    flatShading 
                />
            </mesh>
            
            {/* Inner Light */}
            <pointLight intensity={3} distance={50} color="#00ffff" />
            
            {/* Volumetric Lasers (Blue/Cyan Theme) */}
            {/* Beams radiating FROM center OUTWARDS */}
            {[...Array(12)].map((_, i) => (
                <group key={i} rotation={[0, (i * Math.PI * 2) / 12, 0]}>
                    {/* Angle the beam downwards (approx 45-60 degrees) */}
                    {/* Add slight variation to angle for dynamic look */}
                    <group rotation={[Math.PI / 3 + Math.sin(i)*0.2, 0, 0]}>
                        {/* 
                           Cylinder Height = 30. 
                           Center is at 0. 
                           Top is at +15, Bottom at -15.
                           We want Top (Narrow) to be at origin (0,0,0).
                           So we shift the mesh DOWN by half height (-15).
                        */}
                        <mesh position={[0, -15, 0]}>
                            <cylinderGeometry args={[0.05, 1.5, 30, 8, 1, true]} />
                            <meshBasicMaterial 
                                // Blue/Cyan Hues (190 - 250)
                                color={`hsl(${200 + i * 15}, 100%, 70%)`} 
                                transparent 
                                opacity={0.25} 
                                blending={AdditiveBlending} 
                                side={DoubleSide} 
                                depthWrite={false} 
                            />
                        </mesh>
                    </group>
                </group>
            ))}
        </group>
    );
};
