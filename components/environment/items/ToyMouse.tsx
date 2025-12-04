
import React, { useRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, Vector3, MathUtils } from 'three';

interface ToyMouseProps {
    isActive: boolean;
    onClick: () => void;
}

export const ToyMouse = React.forwardRef<Group, ToyMouseProps>(({ isActive, onClick }, ref) => {
    const internalRef = useRef<Group>(null);
    useImperativeHandle(ref, () => internalRef.current!, []);
    
    const targetPos = useRef(new Vector3(-0.8, 0, 4.0));
    const timeSinceLastTurn = useRef(0);
    
    useFrame((state, delta) => {
        if (!internalRef.current) return;
        
        if (isActive) {
            const group = internalRef.current;
            const currentPos = group.position;
            const target = targetPos.current;
            
            // Much faster than before (was 14) to outrun cat
            const speed = 22 * delta; 
            
            const dist = currentPos.distanceTo(target);
            
            timeSinceLastTurn.current += delta;

            // Erratic behavior: Change direction randomly or if close to target
            // 1. Reached target
            // 2. Random jitter every 0.5 - 1.5 seconds
            if (dist < 0.5 || timeSinceLastTurn.current > (Math.random() * 1.0 + 0.5)) {
                 timeSinceLastTurn.current = 0;
                 
                 // Pick new random spot 
                 // Constrain to living room area roughly
                 const newX = MathUtils.clamp((Math.random() - 0.5) * 20, -12, 12);
                 const newZ = MathUtils.clamp((Math.random() - 0.5) * 12 + 2, -4, 8);
                 targetPos.current.set(newX, 0, newZ);
            }

            // Move towards target
            const dir = new Vector3().subVectors(target, currentPos).normalize();
            group.position.add(dir.multiplyScalar(speed));
            
            // Smooth look at
            const targetLook = new Vector3().copy(target);
            group.lookAt(targetLook);
            
            // Wiggle animation
            group.rotation.z = Math.sin(state.clock.elapsedTime * 30) * 0.2;
        }
    });

    return (
        <group 
            ref={internalRef} 
            position={[-0.8, 0, 4.0]} 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            onPointerOver={() => document.body.style.cursor = 'pointer'}
            onPointerOut={() => document.body.style.cursor = 'auto'}
            scale={[1.8, 1.8, 1.8]} // Slightly larger as requested
        >
             {/* Body */}
             <mesh position={[0, 0.08, 0]} castShadow>
                 <capsuleGeometry args={[0.08, 0.2, 4, 16]} />
                 <meshStandardMaterial color="#9ca3af" />
             </mesh>
             {/* Ears */}
             <mesh position={[0.06, 0.18, 0.08]} rotation={[0, 0, -0.3]}>
                 <circleGeometry args={[0.04]} />
                 <meshStandardMaterial color="#f472b6" side={2} />
             </mesh>
             <mesh position={[-0.06, 0.18, 0.08]} rotation={[0, 0, 0.3]}>
                 <circleGeometry args={[0.04]} />
                 <meshStandardMaterial color="#f472b6" side={2} />
             </mesh>
             {/* Nose */}
             <mesh position={[0, 0.08, 0.11]}>
                 <sphereGeometry args={[0.02]} />
                 <meshStandardMaterial color="#f472b6" />
             </mesh>
             {/* Tail */}
             <mesh position={[0, 0.05, -0.15]} rotation={[-0.5, 0, 0]}>
                 <cylinderGeometry args={[0.01, 0.02, 0.3]} />
                 <meshStandardMaterial color="#9ca3af" />
             </mesh>
             {/* Wind up key */}
             <group position={[0, 0.2, -0.05]} rotation={[0, 0, Math.PI/2]}>
                 <mesh>
                     <torusGeometry args={[0.04, 0.01, 8, 16]} />
                     <meshStandardMaterial color="gold" />
                 </mesh>
                 <mesh position={[0, -0.05, 0]}>
                     <cylinderGeometry args={[0.01, 0.01, 0.05]} />
                     <meshStandardMaterial color="gold" />
                 </mesh>
             </group>
        </group>
    );
});
