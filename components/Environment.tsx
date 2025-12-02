
import React, { useRef, useMemo } from 'react';
import { Environment as ThreeEnvironment } from '@react-three/drei';
import { CatAction, WeatherCondition } from '../types';
import { Vector3, Color } from 'three';
import { MoonScene } from './environment/scenes/MoonScene';
import { LivingRoom } from './environment/scenes/LivingRoom';
import { useFrame } from '@react-three/fiber';

interface EnvironmentProps {
    action: CatAction;
    hygiene: number;
    onWalkCommand?: (point: Vector3) => void;
    onPointerMove?: (point: Vector3) => void;
    targetPosition?: Vector3 | null;
    isDiscoMode: boolean;
    onToggleDisco: () => void;
    onNuke: () => void;
    isEscaping: boolean;
    isExploding: boolean;
    onInteract?: (action: CatAction) => void;
    hasPoop: boolean;
    
    // New Props
    timeOfDay: number;
    weather: WeatherCondition;
    onWindowClick: () => void;
}

export const Environment: React.FC<EnvironmentProps> = ({ 
    action, 
    hygiene, 
    onWalkCommand, 
    onPointerMove, 
    targetPosition,
    isDiscoMode,
    onToggleDisco,
    onNuke,
    isEscaping,
    isExploding,
    onInteract,
    hasPoop,
    timeOfDay,
    weather,
    onWindowClick
}) => {
  const sunLightRef = useRef<any>(null);
  const spotLightRef = useRef<any>(null);

  // Calculate Sun Position & Color based on Time
  const lighting = useMemo(() => {
      let sunPos = new Vector3(20, 30, 20); // Default
      let sunColor = new Color("#fffaf0");
      let sunIntensity = 1.2;
      let ambientColor = new Color("#fff0e6");
      let ambientIntensity = 0.8;

      if (isDiscoMode) {
          return {
              sunPos: new Vector3(20, 30, 20),
              sunColor: new Color("#ffffff"),
              sunIntensity: 1.5,
              ambientColor: new Color("#1a1a2e"), // Dark Blue tint instead of pitch black
              ambientIntensity: 0.3 // Increased so meshes are visible
          }
      }

      // Time Logic (Simple approximation)
      // Sunrise (6-8)
      if (timeOfDay >= 5 && timeOfDay < 8) {
          sunColor = new Color("#ffcc80"); // Orange
          sunIntensity = 0.8;
          ambientColor = new Color("#ffe0b2");
          // Sun coming from East (Left in our scene is -X)
          sunPos.set(-30, 10, 5); 
      }
      // Day (8-17)
      else if (timeOfDay >= 8 && timeOfDay < 17) {
          sunColor = new Color("#fffaf0");
          sunIntensity = 1.5;
          ambientColor = new Color("#ffffff");
          sunPos.set(10, 40, 10);
      }
      // Sunset (17-20)
      else if (timeOfDay >= 17 && timeOfDay < 20) {
          sunColor = new Color("#fd7e14"); // Reddish
          sunIntensity = 0.8;
          ambientColor = new Color("#ffccbc");
          sunPos.set(30, 10, 5); // Setting in West (+X)
      }
      // Night (20-5)
      else {
          sunColor = new Color("#1a237e"); // Blueish moonlight
          sunIntensity = 0.3; // Dim
          ambientColor = new Color("#263238"); // Dark slate
          ambientIntensity = 0.3;
          sunPos.set(-10, 20, -10); // Moon location
      }

      // Weather override
      if (weather === 'rainy' || weather === 'cloudy') {
          sunIntensity *= 0.5;
          ambientIntensity *= 0.8;
          sunColor.lerp(new Color("#cfd8dc"), 0.8); // Greyscale
      }

      return { sunPos, sunColor, sunIntensity, ambientColor, ambientIntensity };
  }, [timeOfDay, weather, isDiscoMode]);

  useFrame(() => {
      if (sunLightRef.current) {
          sunLightRef.current.position.lerp(lighting.sunPos, 0.05);
      }
  });

  return (
    <group>
      {isDiscoMode && <color attach="background" args={['#000000']} />}
      {!isDiscoMode && <color attach="background" args={[lighting.ambientColor.getStyle()]} />}

      <ThreeEnvironment preset={isDiscoMode ? "city" : "apartment"} environmentIntensity={isDiscoMode ? 0.3 : 0.5} />

      <ambientLight intensity={lighting.ambientIntensity} color={lighting.ambientColor} />
      
      <directionalLight 
        ref={sunLightRef}
        position={lighting.sunPos}
        target-position={[0, 0, 0]}
        intensity={lighting.sunIntensity} 
        castShadow 
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        color={lighting.sunColor}
      >
        <orthographicCamera attach="shadow-camera" args={[-25, 25, 25, -25]} />
      </directionalLight>

      {/* STAGE SPOTLIGHT (Disco Mode) - Matches the user's drawing of beams from top */}
      {isDiscoMode && (
          <spotLight
            ref={spotLightRef}
            position={[0, 15, 0]}
            angle={0.6}
            penumbra={0.5}
            intensity={5}
            color="#00ffff"
            castShadow
            distance={40}
            decay={2}
          />
      )}

      {isDiscoMode ? (
          <MoonScene isExploding={isExploding} onNuke={onNuke} />
      ) : (
          <LivingRoom 
            action={action} 
            onWalkCommand={onWalkCommand}
            onPointerMove={onPointerMove}
            targetPosition={targetPosition}
            isDiscoMode={isDiscoMode}
            onToggleDisco={onToggleDisco}
            onInteract={onInteract}
            hasPoop={hasPoop}
            timeOfDay={timeOfDay}
            weather={weather}
            onWindowClick={onWindowClick}
          />
      )}
    </group>
  );
};
