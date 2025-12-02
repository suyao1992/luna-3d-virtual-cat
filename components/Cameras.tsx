
import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface DiscoCameraProps {
    isEscaping: boolean;
}

export const DiscoCamera: React.FC<DiscoCameraProps> = ({ isEscaping }) => {
    const { camera } = useThree();
    const escapeStartTime = useRef<number | null>(null);

    useFrame((state) => {
        if (isEscaping) {
            if (escapeStartTime.current === null) {
                escapeStartTime.current = state.clock.getElapsedTime();
                camera.position.set(0, 5, 35);
                camera.lookAt(0, 5, 0);
            }

            const now = state.clock.getElapsedTime();
            const elapsed = now - escapeStartTime.current;
            const launchDelay = 1.5;
            
            let rocketY = 0;
            if (elapsed > launchDelay) {
                const liftT = elapsed - launchDelay;
                rocketY = Math.pow(liftT, 2.5) * 8;
            }

            const targetPos = new Vector3(0, rocketY + 3, 0);
            const cameraOffset = new Vector3(0, 0, 45);
            const desiredCamPos = new Vector3(0, rocketY + 2, 0).add(cameraOffset);
            
            if (elapsed < launchDelay) {
                 desiredCamPos.x += (Math.random() - 0.5) * 0.2;
                 desiredCamPos.y += (Math.random() - 0.5) * 0.2;
            }

            camera.position.copy(desiredCamPos);
            camera.lookAt(targetPos);
        } else {
            escapeStartTime.current = null;
        }
    });

    return null;
};

export const ManualFollowCamera: React.FC<{
  controlsRef: React.MutableRefObject<any>;
  isDiscoMode: boolean;
}> = ({ controlsRef }) => {
  useFrame(() => {
     if (controlsRef.current) {
         const target = new Vector3(0, 0.5, 0);
         controlsRef.current.target.lerp(target, 0.1);
         controlsRef.current.update();
     }
  });
  return null;
};
