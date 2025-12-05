
import React from 'react';
import { Float, RoundedBox } from '@react-three/drei';
import { DoubleSide } from 'three';
import { GardenSlot } from '../../../types';

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

export const SoftCatTree = ({ position = [8, 0, -6], onClick }: { position?: [number, number, number], onClick?: () => void }) => {
    return (
        <group 
            position={position} 
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

export const CoffeeTable = ({ position = [7, 0, 6], onClick }: { position?: [number, number, number], onClick?: () => void }) => {
    return (
        <group 
            position={position} 
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
        >
             {/* Table Top */}
             <RoundedBox args={[2.2, 0.1, 1.4]} radius={0.1} smoothness={4} position={[0, 0.5, 0]}>
                 <meshStandardMaterial color="#fdf6e3" roughness={0.5} />
             </RoundedBox>
             
             {/* Legs */}
             <mesh position={[-0.8, 0.25, -0.5]}><cylinderGeometry args={[0.04, 0.03, 0.5]} /><meshStandardMaterial color="#8d6e63" /></mesh>
             <mesh position={[0.8, 0.25, -0.5]}><cylinderGeometry args={[0.04, 0.03, 0.5]} /><meshStandardMaterial color="#8d6e63" /></mesh>
             <mesh position={[-0.8, 0.25, 0.5]}><cylinderGeometry args={[0.04, 0.03, 0.5]} /><meshStandardMaterial color="#8d6e63" /></mesh>
             <mesh position={[0.8, 0.25, 0.5]}><cylinderGeometry args={[0.04, 0.03, 0.5]} /><meshStandardMaterial color="#8d6e63" /></mesh>

             {/* Cat Grass Pot - Big & Detailed */}
             <group position={[0.5, 0.55, 0.2]} scale={[2.5, 2.5, 2.5]}>
                 {/* Pot Body (Rounder/Clay) */}
                 <mesh position={[0, 0.1, 0]}>
                     <cylinderGeometry args={[0.16, 0.12, 0.2, 32]} />
                     <meshStandardMaterial color="#d7ccc8" />
                 </mesh>
                 {/* Rim */}
                 <mesh position={[0, 0.2, 0]} rotation={[Math.PI/2, 0, 0]}>
                     <torusGeometry args={[0.16, 0.02, 16, 32]} />
                     <meshStandardMaterial color="#d7ccc8" />
                 </mesh>
                 
                 {/* Paw Print Detail on Pot */}
                 <group position={[0, 0.1, 0.15]} rotation={[0, 0, -0.2]}>
                     {/* Main Pad */}
                     <mesh position={[0, -0.015, 0]} rotation={[Math.PI/2, 0, 0]}>
                         <circleGeometry args={[0.04, 32]} />
                         <meshStandardMaterial color="#a1887f" />
                     </mesh>
                     {/* Toes */}
                     <mesh position={[-0.045, 0.04, 0]} rotation={[Math.PI/2, 0, 0]}><circleGeometry args={[0.015]} /><meshStandardMaterial color="#a1887f" /></mesh>
                     <mesh position={[0, 0.065, 0]} rotation={[Math.PI/2, 0, 0]}><circleGeometry args={[0.015]} /><meshStandardMaterial color="#a1887f" /></mesh>
                     <mesh position={[0.045, 0.04, 0]} rotation={[Math.PI/2, 0, 0]}><circleGeometry args={[0.015]} /><meshStandardMaterial color="#a1887f" /></mesh>
                 </group>

                 {/* Soil */}
                 <mesh position={[0, 0.18, 0]} rotation={[-Math.PI/2, 0, 0]}>
                     <circleGeometry args={[0.15, 32]} />
                     <meshStandardMaterial color="#3e2723" />
                 </mesh>
                 {/* Grass Blades - Denser and Taller */}
                 {[...Array(50)].map((_, i) => (
                     <mesh key={i} position={[(Math.random()-0.5)*0.2, 0.25, (Math.random()-0.5)*0.2]} rotation={[0, Math.random()*3, (Math.random()-0.5)*0.3]}>
                         <planeGeometry args={[0.03, 0.5 + Math.random() * 0.2]} />
                         <meshStandardMaterial color="#66bb6a" side={DoubleSide} />
                     </mesh>
                 ))}
             </group>
             
             {/* Coaster */}
             <mesh position={[0.5, 0.56, 0.2]} rotation={[-Math.PI/2, 0, 0]}>
                 <circleGeometry args={[0.45, 32]} />
                 <meshStandardMaterial color="#a1887f" />
             </mesh>

             {/* Books Stack with Mug */}
             <group position={[-0.6, 0.55, 0.1]} rotation={[0, 0.2, 0]}>
                 {/* Bottom Book (Green) */}
                 <mesh position={[0, 0.025, 0]}>
                     <boxGeometry args={[0.35, 0.05, 0.5]} />
                     <meshStandardMaterial color="#43a047" />
                 </mesh>
                 <mesh position={[0.01, 0.025, 0]}>
                     <boxGeometry args={[0.33, 0.04, 0.48]} />
                     <meshStandardMaterial color="#fff" />
                 </mesh>

                 {/* Top Book (Red/Brown) */}
                 <group position={[0.03, 0.05, 0.02]} rotation={[0, 0.15, 0]}>
                     <mesh position={[0, 0.025, 0]}>
                         <boxGeometry args={[0.32, 0.05, 0.45]} />
                         <meshStandardMaterial color="#a1887f" />
                     </mesh>
                     <mesh position={[0.01, 0.025, 0]}>
                         <boxGeometry args={[0.3, 0.04, 0.43]} />
                         <meshStandardMaterial color="#fff" />
                     </mesh>

                     {/* Mug */}
                     <group position={[0, 0.05, 0.05]}>
                         {/* Body */}
                         <mesh position={[0, 0.06, 0]}>
                             <cylinderGeometry args={[0.06, 0.06, 0.12, 16]} />
                             <meshStandardMaterial color="#d1c4e9" />
                         </mesh>
                         {/* Handle */}
                         <mesh position={[0.05, 0.06, 0]} rotation={[0, 0, Math.PI/2]}>
                             <torusGeometry args={[0.03, 0.008, 8, 16, Math.PI]} />
                             <meshStandardMaterial color="#d1c4e9" />
                         </mesh>
                         {/* Coffee */}
                         <mesh position={[0, 0.115, 0]} rotation={[-Math.PI/2, 0, 0]}>
                             <circleGeometry args={[0.05, 16]} />
                             <meshStandardMaterial color="#3e2723" />
                         </mesh>
                     </group>
                 </group>
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

export const VegetableGarden = ({ position, onClick }: { position?: [number, number, number], onClick?: () => void }) => {
    return (
        <VegetableGardenWithProps position={position} onClick={onClick} />
    )
}

export const VegetableGardenWithProps = ({ position, onClick, slots }: { position?: [number, number, number], onClick?: () => void, slots?: GardenSlot[] }) => {
    
    // Default slots if not provided (fallback)
    const displaySlots = slots || Array.from({ length: 9 }).map((_, i) => ({
        id: i,
        soilState: i % 2 === 0 ? 'ready' : 'empty', // visual test pattern
        plantType: i === 4 ? 'carrot' : null,
        growthStage: 3,
        growthProgress: 0,
        moisture: 0,
        health: 100,
        hasWeeds: false
    } as GardenSlot));

    const GardenCell = ({ x, z, slot }: { x: number, z: number, slot: GardenSlot }) => {
        const isWet = slot.moisture > 30;
        const soilColor = isWet ? "#3e2723" : "#5d4037"; // Darker when wet
        
        return (
            <group position={[x, 0.25, z]}>
                {/* Soil Mound vs Flat */}
                {slot.soilState === 'ready' ? (
                    <mesh position={[0, 0.05, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <boxGeometry args={[0.6, 0.6, 0.1]} />
                        <meshStandardMaterial color={soilColor} roughness={1} />
                    </mesh>
                ) : (
                    <mesh position={[0, 0, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <planeGeometry args={[0.6, 0.6]} />
                        <meshStandardMaterial color="#8d6e63" roughness={1} />
                    </mesh>
                )}
                
                {/* Weeds Overlay */}
                {slot.hasWeeds && (
                    <group>
                        {[0, 1, 2].map(i => (
                            <mesh key={i} position={[(Math.random()-0.5)*0.4, 0.05, (Math.random()-0.5)*0.4]} rotation={[0, Math.random(), 0]}>
                                <planeGeometry args={[0.1, 0.1]} />
                                <meshStandardMaterial color="#558b2f" side={DoubleSide} />
                            </mesh>
                        ))}
                    </group>
                )}

                {/* Plants */}
                {slot.plantType && (
                    <group scale={[0.5 + slot.growthStage * 0.2, 0.5 + slot.growthStage * 0.2, 0.5 + slot.growthStage * 0.2]}>
                        {/* STAGE 0: Seeds */}
                        {slot.growthStage === 0 && (
                            <mesh position={[0, 0.06, 0]}>
                                <sphereGeometry args={[0.02]} />
                                <meshStandardMaterial color="#f5f5f5" />
                            </mesh>
                        )}

                        {/* STAGE 1: Sprout */}
                        {slot.growthStage >= 1 && (
                            <group>
                                <mesh position={[0, 0.05, 0]} rotation={[0, 1, 0.2]}><planeGeometry args={[0.05, 0.15]} /><meshStandardMaterial color="#8bc34a" side={DoubleSide} /></mesh>
                                <mesh position={[0, 0.05, 0]} rotation={[0, 2, -0.2]}><planeGeometry args={[0.05, 0.15]} /><meshStandardMaterial color="#8bc34a" side={DoubleSide} /></mesh>
                            </group>
                        )}

                        {/* STAGE 2 & 3: Veggie Specifics */}
                        {slot.growthStage >= 2 && slot.plantType === 'carrot' && (
                            <group>
                                {/* Tops */}
                                {[0, 1, 2].map(i => (
                                    <group key={i} position={[0, 0.1, 0]} rotation={[0, i * 2, 0.1]}>
                                        <mesh position={[0, 0.1, 0]}><planeGeometry args={[0.06, 0.3]} /><meshStandardMaterial color="#43a047" side={DoubleSide} /></mesh>
                                    </group>
                                ))}
                                {/* Visible Orange Top if mature */}
                                {slot.growthStage === 3 && (
                                    <mesh position={[0, 0.08, 0]}>
                                        <cylinderGeometry args={[0.04, 0.01, 0.1]} />
                                        <meshStandardMaterial color="#ff7043" />
                                    </mesh>
                                )}
                            </group>
                        )}
                        
                        {slot.growthStage >= 2 && slot.plantType === 'radish' && (
                            <group>
                                {/* Tops */}
                                {[0, 1, 2, 3].map(i => (
                                    <group key={i} position={[0, 0.1, 0]} rotation={[0, i * 1.5, 0.2]}>
                                        <mesh position={[0, 0.1, 0]}><planeGeometry args={[0.08, 0.25]} /><meshStandardMaterial color="#66bb6a" side={DoubleSide} /></mesh>
                                    </group>
                                ))}
                                {/* Visible White Top if mature */}
                                {slot.growthStage === 3 && (
                                    <mesh position={[0, 0.08, 0]}>
                                        <sphereGeometry args={[0.05]} />
                                        <meshStandardMaterial color="#fff" />
                                    </mesh>
                                )}
                            </group>
                        )}
                    </group>
                )}
            </group>
        )
    };

    return (
        <group 
            position={position} 
            onClick={(e) => { e.stopPropagation(); onClick?.(); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            {/* Main Wooden Frame */}
            <group position={[0, 0.2, 0]}>
                {/* 4 Sides */}
                <mesh position={[0, 0, 1.15]}><boxGeometry args={[2.4, 0.4, 0.1]} /><meshStandardMaterial color="#e0c090" /></mesh>
                <mesh position={[0, 0, -1.15]}><boxGeometry args={[2.4, 0.4, 0.1]} /><meshStandardMaterial color="#e0c090" /></mesh>
                <mesh position={[1.15, 0, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[2.2, 0.4, 0.1]} /><meshStandardMaterial color="#e0c090" /></mesh>
                <mesh position={[-1.15, 0, 0]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[2.2, 0.4, 0.1]} /><meshStandardMaterial color="#e0c090" /></mesh>
                
                {/* Corner Posts */}
                <mesh position={[1.15, 0.1, 1.15]}><boxGeometry args={[0.15, 0.6, 0.15]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
                <mesh position={[-1.15, 0.1, 1.15]}><boxGeometry args={[0.15, 0.6, 0.15]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
                <mesh position={[1.15, 0.1, -1.15]}><boxGeometry args={[0.15, 0.6, 0.15]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
                <mesh position={[-1.15, 0.1, -1.15]}><boxGeometry args={[0.15, 0.6, 0.15]} /><meshStandardMaterial color="#d7ccc8" /></mesh>

                {/* Internal Dividers */}
                <mesh position={[0.4, 0, 0]}><boxGeometry args={[0.05, 0.3, 2.2]} /><meshStandardMaterial color="#e0c090" /></mesh>
                <mesh position={[-0.4, 0, 0]}><boxGeometry args={[0.05, 0.3, 2.2]} /><meshStandardMaterial color="#e0c090" /></mesh>
                <mesh position={[0, 0, 0.4]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[0.05, 0.3, 2.2]} /><meshStandardMaterial color="#e0c090" /></mesh>
                <mesh position={[0, 0, -0.4]} rotation={[0, Math.PI/2, 0]}><boxGeometry args={[0.05, 0.3, 2.2]} /><meshStandardMaterial color="#e0c090" /></mesh>
            </group>
            
            {/* Soil Base */}
            <mesh position={[0, 0.3, 0]} rotation={[-Math.PI/2, 0, 0]}>
                <planeGeometry args={[2.2, 2.2]} />
                <meshStandardMaterial color="#4e342e" />
            </mesh>

            {/* Render Grid based on Slots */}
            {displaySlots.map((slot, i) => {
                const x = (i % 3 - 1) * 0.8;
                const z = (Math.floor(i / 3) - 1) * 0.8;
                return <GardenCell key={slot.id} x={x} z={z} slot={slot} />;
            })}

            {/* Signs on Back Edge */}
            {[-0.8, 0, 0.8].map((x, i) => (
                <group key={i} position={[x, 0.6, -1.2]}>
                    <mesh position={[0, 0.15, 0]}><boxGeometry args={[0.3, 0.2, 0.02]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
                    <mesh position={[0, -0.1, 0]}><cylinderGeometry args={[0.02, 0.02, 0.4]} /><meshStandardMaterial color="#a1887f" /></mesh>
                </group>
            ))}

            {/* Tools placed nearby on the right side */}
            <group position={[1.8, 0, 0.5]} rotation={[0, -0.5, 0]}>
                {/* Watering Can */}
                <group position={[0, 0, 0]}>
                    <mesh position={[0, 0.2, 0]}><cylinderGeometry args={[0.2, 0.25, 0.4]} /><meshStandardMaterial color="#bdbdbd" metalness={0.6} roughness={0.3} /></mesh>
                    <mesh position={[0.25, 0.3, 0]} rotation={[0, 0, -0.8]}><cylinderGeometry args={[0.03, 0.05, 0.4]} /><meshStandardMaterial color="#bdbdbd" metalness={0.6} roughness={0.3} /></mesh>
                    <mesh position={[0.4, 0.45, 0]} rotation={[0, 0, -0.8]}><cylinderGeometry args={[0.06, 0.06, 0.05]} /><meshStandardMaterial color="#9e9e9e" /></mesh>
                    <mesh position={[-0.2, 0.3, 0]} rotation={[0, 0, 0]}><torusGeometry args={[0.15, 0.03, 16, 32, Math.PI]} /><meshStandardMaterial color="#757575" /></mesh>
                </group>

                {/* Hand Shovel */}
                <group position={[0.5, 0.02, 0.5]} rotation={[0, 1.5, Math.PI/2]}>
                    <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.025, 0.025, 0.4]} /><meshStandardMaterial color="#8d6e63" /></mesh>
                    <mesh position={[0, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.01, 0.3, 3]} />
                        <meshStandardMaterial color="#546e7a" metalness={0.5} />
                    </mesh>
                </group>
            </group>
        </group>
    )
}
