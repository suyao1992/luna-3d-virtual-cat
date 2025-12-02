
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Vector3 } from 'three';
import { OrbitControls } from '@react-three/drei';
import { CatStats, CatAction, ChatMessage, Language, WeatherCondition } from './types';
import { geminiService } from './services/gemini';
import { audioService } from './services/audio';
import { GameUI } from './components/GameUI';
import { Environment } from './components/Environment';
import { Cat3D } from './components/Cat3D';
import { StartMenu } from './components/StartMenu';
import { GameLoadingScreen } from './components/GameLoadingScreen';
import { GomokuBoard } from './components/GomokuBoard';
import { XiangqiBoard } from './components/XiangqiBoard';
import { Match3Board } from './components/Match3Board';
import { WeatherPanel } from './components/ui/WeatherPanel';
import { DiscoCamera, ManualFollowCamera } from './components/Cameras';

const App: React.FC = () => {
  // Game State
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Cat State
  const [stats, setStats] = useState<CatStats>({
    hunger: 50,
    happiness: 80,
    energy: 100,
    thirst: 50,
    hygiene: 100
  });
  const [action, setAction] = useState<CatAction>('idle');
  const [targetPos, setTargetPos] = useState<Vector3 | null>(null);
  
  // Environment State
  const [language, setLanguage] = useState<Language>('en');
  const [gameTime, setGameTime] = useState(12); // 0-24
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [isDiscoMode, setIsDiscoMode] = useState(false);
  const [hasPoop, setHasPoop] = useState(false);
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  
  // Interaction State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeGame, setActiveGame] = useState<'gomoku' | 'xiangqi' | 'match3' | null>(null);

  // Easter Eggs
  const [isEscaping, setIsEscaping] = useState(false);
  const [isExploding, setIsExploding] = useState(false);

  // Refs for logic that doesn't need re-renders
  const orbitRef = useRef<any>(null);
  const actionRef = useRef<CatAction>('idle');
  const statsRef = useRef(stats);

  // Sync refs
  useEffect(() => { actionRef.current = action; }, [action]);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // --- GAME LOOP ---
  useEffect(() => {
    if (!hasStarted) return;
    
    const interval = setInterval(() => {
       setStats(prev => ({
           hunger: Math.max(0, prev.hunger - 0.5),
           thirst: Math.max(0, prev.thirst - 0.8),
           happiness: Math.max(0, prev.happiness - 0.2),
           energy: actionRef.current === 'sleeping' ? Math.min(100, prev.energy + 2) : Math.max(0, prev.energy - 0.1),
           hygiene: Math.max(0, prev.hygiene - 0.1)
       }));

       // Time cycle
       setGameTime(prev => (prev + 0.05) % 24);

       // Poop logic
       if (statsRef.current.hunger > 0 && Math.random() < 0.005 && !hasPoop) {
           setHasPoop(true);
           audioService.playPlop();
       }
    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, hasPoop]);

  // --- IDLE BRAIN (Autonomous Behavior) ---
  useEffect(() => {
      if (!hasStarted || activeGame || isReaderOpen || isDiscoMode || isEscaping) return;

      const idleTimer = setInterval(() => {
          const currentStats = statsRef.current;
          const currentAction = actionRef.current;

          // Only interrupt "passive" states
          const isPassive = ['idle', 'walking', 'wandering', 'sitting', 'standing'].includes(currentAction);
          if (!isPassive) return;

          const rand = Math.random();

          // 1. Needs
          if (currentStats.energy < 20) {
              handleSleep(); // Auto sleep if very tired
              return;
          }

          // 2. Random Fun Actions
          if (rand < 0.1) {
              // Watch birds (Window)
              performAction('watching_birds', 12000);
          } else if (rand < 0.2) {
              // Hide in box
              performAction('hiding', 10000);
          } else if (rand < 0.3) {
              // Hunt mouse
              performAction('hunting', 8000);
          } else if (rand < 0.4) {
              // Scratch post
              performAction('scratching', 6000);
              audioService.playScratching();
          } else if (rand < 0.5) {
              // Stretch
              performAction('stretching', 4000);
          } else if (rand < 0.7) {
              // Wander
              handleWander();
          }
      }, 3000); // Check every 3 seconds

      return () => clearInterval(idleTimer);
  }, [hasStarted, activeGame, isReaderOpen, isDiscoMode, isEscaping]);


  // --- ACTIONS ---
  
  const handleStart = () => {
      audioService.init();
      setIsLoading(true);
      // Simulate loading
      let p = 0;
      const loadInt = setInterval(() => {
          p += 2; // Slower loading for effect
          setLoadingProgress(p);
          if (p >= 100) {
              clearInterval(loadInt);
              setIsLoading(false);
              setHasStarted(true);
              // Initial greeting
              handleSendMessage("Hello Luna!");
          }
      }, 50);
  };

  const performAction = (newAction: CatAction, duration = 3000) => {
      setAction(newAction);
      if (duration > 0) {
          setTimeout(() => {
              // Only reset if we haven't started doing something else
              if (actionRef.current === newAction) {
                  setAction('idle');
              }
          }, duration);
      }
  };

  const clearPending = () => {
      setTargetPos(null);
      setAction('idle'); // Reset to idle briefly to break current anim
  };

  const handleWander = () => {
      // Pick random spot on floor (approx room bounds)
      const x = (Math.random() - 0.5) * 8;
      const z = (Math.random() - 0.5) * 8;
      setTargetPos(new Vector3(x, 0, z));
      setAction('wandering');
  };

  const handleFeed = () => {
      if (stats.hunger >= 100) return;
      clearPending();
      performAction('eating');
      setStats(prev => ({ ...prev, hunger: 100, happiness: prev.happiness + 10 }));
      audioService.playEating();
  };

  const handleWater = () => {
      if (stats.thirst >= 100) return;
      clearPending();
      performAction('drinking');
      setStats(prev => ({ ...prev, thirst: 100 }));
      audioService.playDrinking();
  };

  const handleClean = () => {
      if (!hasPoop && stats.hygiene >= 90) return;
      clearPending();
      performAction('using_litter'); 
      setStats(prev => ({ ...prev, hygiene: 100 }));
      setHasPoop(false);
      audioService.playDigging();
      setTimeout(() => setAction('idle'), 4000);
  };

  const handlePlayAction = (type: 'sing' | 'dance' | 'yoga' | 'fish' | 'climb' | 'read') => {
      clearPending();
      if (type === 'sing') {
          performAction('singing', 5000);
          audioService.playSinging();
      } else if (type === 'dance') {
          handleToggleDisco();
      } else if (type === 'yoga') {
          performAction('yoga', 6000);
      } else if (type === 'fish') {
          performAction('fishing', 10000);
      } else if (type === 'climb') {
          performAction('climbing', 8000);
      } else if (type === 'read') {
          performAction('reading', -1); // Indefinite until closed
          setIsReaderOpen(true);
      }
  };

  const handleToggleDisco = () => {
      if (isDiscoMode) {
          setIsDiscoMode(false);
          setAction('idle');
          audioService.stopBGM();
      } else {
          setIsDiscoMode(true);
          setAction('dancing');
          audioService.startBGM();
      }
  };

  const handleNuke = () => {
      if (!isDiscoMode) return;
      
      // 1. Start Escape (Launch Rocket)
      setIsEscaping(true);
      audioService.playAlarm();

      // 2. Trigger Whiteout Explosion after flight
      setTimeout(() => {
          setIsExploding(true);
          audioService.playExplosion();
      }, 4000);

      // 3. Reset to Room
      setTimeout(() => {
          setIsEscaping(false);
          setIsExploding(false);
          setIsDiscoMode(false);
          setAction('falling'); // Re-entry
          audioService.stopBGM();
          setStats(p => ({ ...p, happiness: 100, energy: 0 })); // Exhausted but happy
      }, 5500);
  };

  const handleSleep = () => {
      clearPending();
      // Toggle logic
      if (actionRef.current === 'sleeping') {
          setAction('waking_up');
          setTimeout(() => setAction('idle'), 2000);
      } else {
          setAction('sleeping');
          audioService.playSnore();
      }
  };

  const handleSelectGame = (gameType: 'gomoku' | 'xiangqi' | 'match3') => {
      clearPending();
      // Walk to game area
      const gameLoc = new Vector3(0, 0, 3.5);
      setTargetPos(gameLoc);
      setAction('preparing_game');
      setTimeout(() => {
          setActiveGame(gameType);
          if(gameType === 'gomoku') setAction('playing_gomoku');
          if(gameType === 'xiangqi') setAction('playing_xiangqi');
          if(gameType === 'match3') setAction('playing_match3');
      }, 2000);
  };

  const handleSendMessage = async (text: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);

      const response = await geminiService.chatWithCat(text, stats, language);
      
      const catMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'cat', text: response };
      setMessages(prev => [...prev, catMsg]);
      setIsTyping(false);
      audioService.playMeow('greeting');
  };

  const handleWalkCommand = (point: Vector3) => {
      if (isEscaping || activeGame) return;
      setTargetPos(point);
      setAction('walking');
  };
  
  const handleMovementComplete = () => {
      if (action === 'walking' || action === 'wandering') {
          setAction('idle');
          setTargetPos(null);
      }
      if (action === 'falling') {
          audioService.playMeow('poked'); // Thud sound effect logic inside audioService could be better but reusing existing
          setAction('idle');
      }
  };

  // --- RENDER ---
  
  return (
    <div className={`w-full h-screen relative bg-black overflow-hidden ${isDiscoMode ? 'bg-black' : 'bg-gray-100'} transition-colors duration-1000`}>
        {/* 3D Scene - Always Rendered in Background */}
        <Canvas shadows camera={{ position: [0, 5, 12], fov: 50 }}>
            {isEscaping ? (
                <DiscoCamera isEscaping={isEscaping} />
            ) : (
                <ManualFollowCamera controlsRef={orbitRef} isDiscoMode={isDiscoMode} />
            )}
            
            <Environment 
                action={action} 
                hygiene={stats.hygiene}
                onWalkCommand={handleWalkCommand}
                targetPosition={targetPos}
                isDiscoMode={isDiscoMode}
                onToggleDisco={handleToggleDisco}
                onNuke={handleNuke}
                isEscaping={isEscaping}
                isExploding={isExploding}
                onInteract={(act) => setAction(act)}
                hasPoop={hasPoop}
                timeOfDay={gameTime}
                weather={weather}
                onWindowClick={() => setShowWeatherPanel(true)}
            />

            <Cat3D 
                action={action} 
                walkTarget={targetPos}
                onMovementComplete={handleMovementComplete}
                language={language}
                isEscaping={isEscaping}
                onClick={() => {
                    audioService.playMeow('happy');
                    setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 5) }));
                }}
            />

            {!isEscaping && (
                 <OrbitControls 
                    ref={orbitRef}
                    minPolarAngle={0.5} 
                    maxPolarAngle={1.5} 
                    maxDistance={20}
                    minDistance={5}
                    enablePan={false}
                    autoRotate={isDiscoMode} 
                    autoRotateSpeed={0.5}
                    enabled={!isEscaping}
                 />
            )}
        </Canvas>

        {/* --- OVERLAYS --- */}

        {/* Start Menu */}
        {!hasStarted && !isLoading && (
            <StartMenu onStart={handleStart} language={language} onSetLanguage={setLanguage} />
        )}

        {/* Loading Screen */}
        {isLoading && (
            <GameLoadingScreen progress={loadingProgress} language={language} />
        )}

        {/* Main Game UI */}
        {hasStarted && !isLoading && (
            <GameUI 
                stats={stats}
                currentAction={action}
                messages={messages}
                isTyping={isTyping}
                language={language}
                onSetLanguage={setLanguage}
                onSendMessage={handleSendMessage}
                onFeed={handleFeed}
                onWater={handleWater}
                onClean={handleClean}
                onPlayAction={handlePlayAction}
                onSleep={handleSleep}
                onSelectGame={handleSelectGame}
                onCloseReader={() => { setIsReaderOpen(false); setAction('idle'); }}
            />
        )}

        {/* Full Screen Modals */}
        {(activeGame === 'gomoku') && (
            <GomokuBoard 
                onClose={() => { setActiveGame(null); setAction('idle'); }} 
                onGameEnd={(winner) => {
                    if (winner === 'user') setStats(p => ({ ...p, happiness: 100 }));
                }}
                language={language}
            />
        )}
        {(activeGame === 'xiangqi') && (
            <XiangqiBoard 
                onClose={() => { setActiveGame(null); setAction('idle'); }} 
                onGameEnd={(winner) => {
                    if (winner === 'user') setStats(p => ({ ...p, happiness: 100 }));
                }}
                language={language}
            />
        )}
        {(activeGame === 'match3') && (
            <Match3Board 
                onClose={() => { setActiveGame(null); setAction('idle'); }} 
                onGameEnd={(score) => {
                    setStats(p => ({ ...p, happiness: Math.min(100, p.happiness + score / 10) }));
                }}
                language={language}
            />
        )}

        {showWeatherPanel && (
            <WeatherPanel 
                onClose={() => setShowWeatherPanel(false)}
                weather={weather}
                timeOfDay={gameTime}
                language={language}
            />
        )}
        
    </div>
  );
};

export default App;
