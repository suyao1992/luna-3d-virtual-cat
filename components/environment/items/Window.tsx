
import React, { useRef, useMemo } from 'react';
import { RoundedBox, Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils, Mesh, Color, Vector3 } from 'three';
import { WeatherCondition } from '../../../types';

interface WindowProps {
    onClick: () => void;
    timeOfDay: number; // 0-24
    weather: WeatherCondition;
}

export const Window: React.FC<WindowProps> = ({ onClick, timeOfDay, weather }) => {
    const sunMoonRef = useRef<Group>(null);
    const skyRef = useRef<Mesh>(null);

    // Calculate sky color based on time
    const skyColor = useMemo(() => {
        const color = new Color();
        // Night (0-5)
        if (timeOfDay < 5) color.set("#0f172a"); 
        // Dawn (5-7)
        else if (timeOfDay < 7) color.set("#fb7185").lerp(new Color("#fcd34d"), (timeOfDay - 5) / 2);
        // Day (7-17)
        else if (timeOfDay < 17) color.set("#38bdf8"); 
        // Dusk (17-19)
        else if (timeOfDay < 19) color.set("#fcd34d").lerp(new Color("#6366f1"), (timeOfDay - 17) / 2);
        // Night (19-24)
        else color.set("#0f172a");

        // Weather overlay
        if (weather === 'rainy') color.lerp(new Color("#64748b"), 0.8);
        else if (weather === 'cloudy') color.lerp(new Color("#94a3b8"), 0.5);

        return color;
    }, [timeOfDay, weather]);

    useFrame(() => {
        if (skyRef.current) {
            // @ts-ignore
            skyRef.current.material.color.lerp(skyColor, 0.05);
        }

        if (sunMoonRef.current) {
            // Cycle Logic: 
            // 6am - 18pm = Day (Sun) -> 0 to PI
            // 18pm - 6am = Night (Moon) -> 0 to PI
            
            let angle = 0;
            // Larger radius so it passes through the window view
            let radius = 2.5; 
            let isDay = timeOfDay >= 6 && timeOfDay < 18;
            
            if (isDay) {
                const progress = (timeOfDay - 6) / 12; // 0 to 1
                angle = Math.PI - (progress * Math.PI); // East (Right in view) to West (Left)
                
                // Position relative to window center
                // Shift down so it rises from bottom
                sunMoonRef.current.position.x = Math.cos(angle) * radius;
                sunMoonRef.current.position.y = Math.sin(angle) * radius - 1.2;
            } else {
                // Night
                let nightTime = timeOfDay >= 18 ? timeOfDay : timeOfDay + 24;
                const progress = (nightTime - 18) / 12;
                angle = Math.PI - (progress * Math.PI);

                sunMoonRef.current.position.x = Math.cos(angle) * radius;
                sunMoonRef.current.position.y = Math.sin(angle) * radius - 1.2;
            }
        }
    });

    const isNight = timeOfDay < 6 || timeOfDay >= 18;

    return (
        <group 
            position={[-14.9, 4, 0]} 
            rotation={[0, Math.PI / 2, 0]}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
        >
            {/* HOLLOW FRAME (Constructed from 4 bars) */}
            <group>
                {/* Top */}
                <RoundedBox args={[3.6, 0.2, 0.3]} radius={0.05} smoothness={4} position={[0, 1.7, 0]}>
                    <meshStandardMaterial color="#fff" />
                </RoundedBox>
                {/* Bottom */}
                <RoundedBox args={[3.6, 0.2, 0.3]} radius={0.05} smoothness={4} position={[0, -1.7, 0]}>
                    <meshStandardMaterial color="#fff" />
                </RoundedBox>
                {/* Left */}
                <RoundedBox args={[0.2, 3.2, 0.3]} radius={0.05} smoothness={4} position={[-1.7, 0, 0]}>
                    <meshStandardMaterial color="#fff" />
                </RoundedBox>
                {/* Right */}
                <RoundedBox args={[0.2, 3.2, 0.3]} radius={0.05} smoothness={4} position={[1.7, 0, 0]}>
                    <meshStandardMaterial color="#fff" />
                </RoundedBox>
            </group>
            
            {/* Mask/Container for Sky */}
            <group position={[0, 0, 0.05]}>
                {/* Sky Background */}
                <mesh ref={skyRef}>
                    <planeGeometry args={[3.2, 3.2]} />
                    <meshBasicMaterial color="#38bdf8" />
                </mesh>

                {/* Stars (Only visible at night) */}
                {isNight && weather !== 'cloudy' && weather !== 'rainy' && (
                    <group scale={[0.5, 0.5, 0.5]} position={[0, 0, 0.01]}>
                        <Stars radius={3} depth={0} count={100} factor={2} saturation={0} fade speed={1} />
                    </group>
                )}

                {/* Celestial Body (Sun/Moon) */}
                <group ref={sunMoonRef} position={[-2, -2, 0.02]}>
                    <mesh>
                        <circleGeometry args={[isNight ? 0.35 : 0.55, 32]} />
                        <meshBasicMaterial 
                            color={isNight ? "#fef08a" : "#fbbf24"} 
                            toneMapped={false}
                        />
                    </mesh>
                    {/* Sun Rays */}
                    {!isNight && (
                        <mesh position={[0, 0, -0.01]}>
                            <circleGeometry args={[0.8, 32]} />
                            <meshBasicMaterial color="#fcd34d" transparent opacity={0.4} />
                        </mesh>
                    )}
                    {/* Moon Craters */}
                    {isNight && (
                        <group position={[0.1, 0.05, 0.01]}>
                            <mesh><circleGeometry args={[0.08]} /><meshBasicMaterial color="#fde047" opacity={0.5} transparent /></mesh>
                        </group>
                    )}
                </group>

                {/* Clouds */}
                {(weather === 'cloudy' || weather === 'rainy') && (
                    <group position={[0, 0, 0.1]}>
                        <mesh position={[-0.8, 0.6, 0]}><circleGeometry args={[0.5]} /><meshBasicMaterial color="white" opacity={0.8} transparent /></mesh>
                        <mesh position={[0.5, 0.3, 0]}><circleGeometry args={[0.6]} /><meshBasicMaterial color="white" opacity={0.7} transparent /></mesh>
                        <mesh position={[-0.2, -0.4, 0]}><circleGeometry args={[0.7]} /><meshBasicMaterial color="#e2e8f0" opacity={0.6} transparent /></mesh>
                    </group>
                )}
                
                {/* Rain */}
                {weather === 'rainy' && (
                     <group position={[0, 0, 0.15]}>
                        {[...Array(10)].map((_, i) => (
                            <mesh key={i} position={[(Math.random()-0.5)*2.5, (Math.random()-0.5)*2.5, 0]} rotation={[0,0,-0.2]}>
                                <planeGeometry args={[0.02, 0.3]} />
                                <meshBasicMaterial color="#93c5fd" transparent opacity={0.6} />
                            </mesh>
                        ))}
                     </group>
                )}
            </group>

            {/* Glass Reflection */}
            <mesh position={[0.5, 0.5, 0.2]} rotation={[0,0,-0.5]}>
                <planeGeometry args={[0.2, 3.5]} />
                <meshBasicMaterial color="white" opacity={0.15} transparent />
            </mesh>
            
            {/* Sill */}
            <RoundedBox position={[0, -1.8, 0.3]} args={[4.0, 0.3, 1.0]} radius={0.1} smoothness={4}>
                <meshStandardMaterial color="#fff" />
            </RoundedBox>
        </group>
    );
};
