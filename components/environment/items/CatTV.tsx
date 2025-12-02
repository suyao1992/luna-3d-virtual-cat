
import React, { useState } from 'react';
import { Html, RoundedBox } from '@react-three/drei';
import { audioService } from '../../../services/audio';

const CHANNELS = [
    "BV1RhUoBMEjE", 
    "BV1W4411v7z6", 
    "BV1J4411v7g6"  
];

export const CatTV = () => {
    const [tvOn, setTvOn] = useState(true);
    const [channelIndex, setChannelIndex] = useState(0);
    const [remoteLabel, setRemoteLabel] = useState<string | null>(null);

    const toggleTvPower = (e: any) => {
        e.stopPropagation();
        setTvOn(!tvOn);
        audioService.playStep();
    };
  
    const nextChannel = (e: any) => { e.stopPropagation(); setChannelIndex((prev) => (prev + 1) % CHANNELS.length); audioService.playStep(); };
    const prevChannel = (e: any) => { e.stopPropagation(); setChannelIndex((prev) => (prev - 1 + CHANNELS.length) % CHANNELS.length); audioService.playStep(); };

    return (
        <group>
            {/* TV UNIT */}
            <group position={[0, 3.5, -9.0]}>
                <RoundedBox args={[12, 8, 0.5]} radius={0.5} smoothness={4} position={[0, 0, -0.5]}>
                    <meshStandardMaterial color="#fdfcf0" roughness={0.9} />
                </RoundedBox>
                
                <group position={[0, 0, 0]}>
                    <RoundedBox args={[8.8, 5.4, 0.4]} radius={0.8} smoothness={8}>
                        <meshStandardMaterial color="#5d4037" roughness={0.4} />
                    </RoundedBox>
                    <group position={[-3.5, 2.7, -0.1]} rotation={[0, 0, 0.2]}>
                        <mesh><coneGeometry args={[0.8, 1.5, 32]} /><meshStandardMaterial color="#5d4037" /></mesh>
                        <mesh position={[0, 0, 0.21]} rotation={[0.1, 0, 0]}><coneGeometry args={[0.5, 1.0, 32]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
                    </group>
                    <group position={[3.5, 2.7, -0.1]} rotation={[0, 0, -0.2]}>
                        <mesh><coneGeometry args={[0.8, 1.5, 32]} /><meshStandardMaterial color="#5d4037" /></mesh>
                        <mesh position={[0, 0, 0.21]} rotation={[0.1, 0, 0]}><coneGeometry args={[0.5, 1.0, 32]} /><meshStandardMaterial color="#d7ccc8" /></mesh>
                    </group>
                    
                    <RoundedBox args={[8.2, 4.8, 0.1]} radius={0.2} smoothness={4} position={[0, 0, 0.22]}>
                        <meshStandardMaterial color="#111" roughness={0.2} metalness={0.8} />
                    </RoundedBox>

                    {/* CONTENT */}
                    <group position={[0, 0, 0.3]}>
                        {tvOn && (
                            <Html 
                                transform 
                                wrapperClass="tv-screen" 
                                distanceFactor={1.5}
                                position={[0, 0, 0.13]}
                                rotation={[0, 0, 0]}
                                occlude="blending"
                                zIndexRange={[40, 0]} 
                            >
                                <iframe 
                                    src={`//player.bilibili.com/player.html?isOutside=true&bvid=${CHANNELS[channelIndex]}&p=1&autoplay=1&muted=0&high_quality=1&danmaku=0`}
                                    width="1600"
                                    height="900"
                                    scrolling="no" 
                                    frameBorder="0" 
                                    allow="autoplay; encrypted-media; fullscreen" 
                                    allowFullScreen
                                    style={{ borderRadius: '4px', pointerEvents: 'auto', background: 'black' }}
                                />
                            </Html>
                        )}
                        <mesh position={[3.8, -2.2, 0.11]}>
                            <circleGeometry args={[0.08]} />
                            <meshBasicMaterial color={tvOn ? "#00ff00" : "#ff0000"} />
                        </mesh>
                    </group>
                </group>

                <group position={[0, -4.5, 0]}>
                    <RoundedBox args={[14, 2.5, 2.5]} radius={0.3} smoothness={4}>
                        <meshStandardMaterial color="#e6c9a8" roughness={0.6} />
                    </RoundedBox>
                    <group position={[-4, 0, 1.3]}>
                        <RoundedBox args={[3.5, 1.8, 0.1]} radius={0.1} smoothness={2}><meshStandardMaterial color="#dbc1a0" /></RoundedBox>
                        <mesh position={[0, 0, 0.1]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.1, 0.1, 1.5]} /><meshStandardMaterial color="#8d6e63" /></mesh>
                    </group>
                    <group position={[0, 0, 1.3]}>
                        <RoundedBox args={[3.5, 1.8, 0.1]} radius={0.1} smoothness={2}><meshStandardMaterial color="#dbc1a0" /></RoundedBox>
                        <mesh position={[0, 0, 0.1]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.1, 0.1, 1.5]} /><meshStandardMaterial color="#8d6e63" /></mesh>
                    </group>
                    <group position={[4, 0, 1.3]}>
                        <RoundedBox args={[3.5, 1.8, 0.1]} radius={0.1} smoothness={2}><meshStandardMaterial color="#dbc1a0" /></RoundedBox>
                        <mesh position={[0, 0, 0.1]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[0.1, 0.1, 1.5]} /><meshStandardMaterial color="#8d6e63" /></mesh>
                    </group>
                </group>
            </group>

            {/* REMOTE CONTROL */}
            <group 
                position={[1.5, 0.4, 2.5]} 
                rotation={[0, -0.5, 0]}
                onPointerOver={() => document.body.style.cursor = 'pointer'}
                onPointerOut={() => { document.body.style.cursor = 'auto'; setRemoteLabel(null); }}
            >
                <RoundedBox args={[0.3, 0.05, 0.7]} radius={0.02} smoothness={2} castShadow><meshStandardMaterial color="#f5f5f5" /></RoundedBox>
                <mesh position={[0, 0.03, -0.2]} onClick={toggleTvPower} onPointerOver={(e) => { e.stopPropagation(); setRemoteLabel("Power: " + (tvOn ? "ON" : "OFF")); }} onPointerOut={(e) => { e.stopPropagation(); setRemoteLabel(null); }}>
                    <cylinderGeometry args={[0.04, 0.04, 0.02]} /><meshStandardMaterial color="#ef5350" />
                </mesh>
                <mesh position={[-0.06, 0.03, -0.05]} onClick={prevChannel} onPointerOver={(e) => { e.stopPropagation(); setRemoteLabel("Prev Video"); }} onPointerOut={(e) => { e.stopPropagation(); setRemoteLabel(null); }}>
                    <cylinderGeometry args={[0.035, 0.035, 0.02]} /><meshStandardMaterial color="#fdd835" />
                </mesh>
                <mesh position={[0.06, 0.03, -0.05]} onClick={nextChannel} onPointerOver={(e) => { e.stopPropagation(); setRemoteLabel("Next Video"); }} onPointerOut={(e) => { e.stopPropagation(); setRemoteLabel(null); }}>
                    <cylinderGeometry args={[0.035, 0.035, 0.02]} /><meshStandardMaterial color="#42a5f5" />
                </mesh>
                {remoteLabel && (
                    <Html position={[0, 0.3, 0]} center distanceFactor={6} style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                        <div className="bg-black/80 text-white text-xs px-2 py-1 rounded backdrop-blur-md border border-white/20 shadow-xl font-bold tracking-wide">
                            {remoteLabel}
                        </div>
                    </Html>
                )}
            </group>
        </group>
    );
};
