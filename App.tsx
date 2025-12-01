

import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, SoftShadows } from '@react-three/drei';
import { Cat3D } from './components/Cat3D';
import { Environment } from './components/Environment';
import { GameUI } from './components/GameUI';
import { StartMenu } from './components/StartMenu';
import { GomokuBoard } from './components/GomokuBoard';
import { XiangqiBoard } from './components/XiangqiBoard';
import { GameLoadingScreen } from './components/GameLoadingScreen';
import { CatStats, CatAction, ChatMessage, Language } from './types';
import { geminiService } from './services/gemini';
import { audioService } from './services/audio';
import { Vector3 } from 'three';

// Initial Stats
const INITIAL_STATS: CatStats = {
  hunger: 50,
  happiness: 50,
  energy: 80,
  thirst: 60,
  hygiene: 100
};

type AppPhase = 'menu' | 'loading' | 'game';

const App: React.FC = () => {
  const [appPhase, setAppPhase] = useState<AppPhase>('menu');
  
  const [stats, setStats] = useState<CatStats>(INITIAL_STATS);
  const [action, setAction] = useState<CatAction>('sleeping'); // Default sleeping in menu
  const [language, setLanguage] = useState<Language>('en');
  
  // Movement and Interaction State
  const [walkTarget, setWalkTarget] = useState<Vector3 | null>(null);
  const [mouseWorldPos, setMouseWorldPos] = useState<Vector3 | null>(null);
  const [nextAction, setNextAction] = useState<CatAction | null>(null);

  // Game Logic State
  const [pendingGame, setPendingGame] = useState<CatAction | null>(null);
  const [isGameLoading, setIsGameLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'cat', text: 'Meow! Welcome home! 🐱' }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const addMessage = (sender: 'user' | 'cat', text: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), sender, text }]);
  };

  const triggerAiResponse = async (userContext: string) => {
      setIsTyping(true);
      const responseText = await geminiService.chatWithCat(userContext, stats, language);
      setIsTyping(false);
      addMessage('cat', responseText);
      audioService.playMeow('greeting');
  };

  // --- START GAME SEQUENCE ---
  const handleStartGame = () => {
      audioService.init();
      setAppPhase('loading');
      setLoadingProgress(0);
  };

  // Handle Global Loading Phase
  useEffect(() => {
      if (appPhase === 'loading') {
          const interval = setInterval(() => {
              setLoadingProgress(prev => {
                  if (prev >= 100) {
                      clearInterval(interval);
                      return 100;
                  }
                  return prev + 2; // ~1.5s to load
              });
          }, 30);
          return () => clearInterval(interval);
      }
  }, [appPhase]);

  // Transition from Loading to Game
  useEffect(() => {
      if (appPhase === 'loading' && loadingProgress >= 100) {
          const timer = setTimeout(() => {
              setAppPhase('game');
              // Wake up sequence
              setAction('waking_up');
              audioService.playMeow('greeting');
              setTimeout(() => {
                  setAction('stretching');
                  setTimeout(() => setAction('idle'), 3000);
              }, 2000);
          }, 500);
          return () => clearTimeout(timer);
      }
  }, [appPhase, loadingProgress]);


  // Game Loop: Stats updates over time (Only active in 'game' phase)
  useEffect(() => {
    if (appPhase !== 'game') return;

    const timer = setInterval(() => {
      setStats(prev => {
        let hungerDecay = 0.4, thirstDecay = 0.6, energyDecay = 0.2, happinessDecay = 0.1;

        if (action === 'sleeping') {
          hungerDecay = 0.1; thirstDecay = 0.2; energyDecay = -3; happinessDecay = 0.05;
        } else if (['playing', 'dancing', 'playing_ball', 'scratching'].includes(action)) {
           energyDecay = 1.0; hungerDecay = 0.8; thirstDecay = 1.0;
        } else if (action === 'climbing') {
           energyDecay = 1.5; hungerDecay = 1.0; happinessDecay = -1.0;
        } else if (action === 'stretching') {
            energyDecay = 0; happinessDecay = -0.5;
        } else if (action === 'playing_gomoku' || action === 'playing_xiangqi') {
            energyDecay = 0.5; happinessDecay = 0;
        } else if (action === 'yoga') {
            energyDecay = -0.5; 
            happinessDecay = -0.2; 
        } else if (action === 'fishing') {
            energyDecay = 0.1; 
            happinessDecay = -0.2; 
        }

        let newHunger = Math.max(0, prev.hunger - hungerDecay);
        let newThirst = Math.max(0, prev.thirst - thirstDecay);
        let newEnergy = Math.min(100, Math.max(0, prev.energy - energyDecay));
        let newHappiness = prev.happiness;

        if (prev.hygiene < 40) happinessDecay += 0.8;
        if (newHunger < 20 || newThirst < 20) happinessDecay += 0.5;

        newHappiness = Math.min(100, Math.max(0, newHappiness - happinessDecay));

        return { hunger: newHunger, thirst: newThirst, energy: newEnergy, happiness: newHappiness, hygiene: prev.hygiene };
      });

      // Auto wake up logic
      if (action === 'sleeping' && stats.energy >= 100) {
        setAction('waking_up');
        audioService.playMeow('greeting');
        setTimeout(() => {
            setAction('stretching');
            setTimeout(() => setAction('idle'), 3000);
        }, 2000);
      }

    }, 1000);

    return () => clearInterval(timer);
  }, [action, stats.energy, appPhase]);
  
  // Random idle behaviors
  useEffect(() => {
      if (appPhase !== 'game') return;

      let behaviorTimeout: number;
      if (action === 'idle') {
          behaviorTimeout = window.setTimeout(() => {
             const idleActions: CatAction[] = [
                 'using_litter', 'grooming', 'scratching', 
                 'playing_ball', 'singing', 'dancing'
             ];
             const randomAction = idleActions[Math.floor(Math.random() * idleActions.length)];
             
             if (randomAction === 'scratching' && stats.energy < 20) return;
             if (randomAction === 'playing_ball' && stats.energy < 30) return;
             if (randomAction === 'dancing' && stats.energy < 40) return;

             switch(randomAction) {
                 case 'using_litter': handleUseLitterBox(); break;
                 case 'grooming': handleGrooming(); break;
                 case 'scratching': handleScratching(); break;
                 case 'playing_ball': handlePlayBall(); break;
                 case 'singing': handleSinging(); break;
                 case 'dancing': handleDancing(); break;
             }
          }, 10000 + Math.random() * 15000); 
      }
      return () => clearTimeout(behaviorTimeout);
  }, [action, stats.energy, appPhase]); 

  const handleUseLitterBox = () => {
      if (action !== 'idle') return;
      setAction('using_litter');
      audioService.playDigging();
      setTimeout(() => {
          setStats(prev => ({
              ...prev,
              hygiene: Math.max(0, prev.hygiene - 25),
              hunger: Math.max(0, prev.hunger - 5)
          }));
          setAction('idle');
      }, 5000);
  };
  
  const handleGrooming = () => {
      if (action !== 'idle') return;
      setAction('grooming');
      setTimeout(() => {
          setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 3) }));
          setAction('idle');
      }, 6000);
  };
  
  const handleScratching = () => {
      if (action !== 'idle') return;
      setAction('scratching');
      audioService.playScratching();
      setTimeout(() => {
          setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 10) }));
          setAction('idle');
      }, 5000);
  };

  const handlePlayBall = () => {
      if (action !== 'idle') return;
      setAction('playing_ball');
      audioService.playTrill();
      setTimeout(() => {
          setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 8) }));
          setAction('idle');
      }, 4000);
  };

  const handleSinging = () => {
      if (action !== 'idle') return;
      setAction('singing');
      audioService.playSinging();
       setTimeout(() => {
          setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 5) }));
          setAction('idle');
      }, 3000);
  };

  const handleDancing = () => {
      if (action !== 'idle') return;
      setAction('dancing');
      audioService.playMeow('happy');
       setTimeout(() => {
          setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 12) }));
          setAction('idle');
      }, 4000);
  };

  const handleFloorClick = (point: Vector3) => {
      if (appPhase !== 'game') return; // Disable movement in menu
      audioService.init();
      if (action !== 'idle' && action !== 'walking') return;
      const flatPoint = new Vector3(point.x, 0, point.z);
      setWalkTarget(flatPoint);
      setAction('walking');
      audioService.playTrill(); 
  };
  
  const handlePointerMove = (point: Vector3) => {
    if (appPhase === 'game') {
        setMouseWorldPos(point);
    }
  }

  const handleMovementComplete = () => {
      if (nextAction) {
          setAction(nextAction);
          if (nextAction === 'preparing_game') {
              audioService.playMeow('greeting');
          }
          if (nextAction === 'climbing') {
              audioService.playScratching(); // Play scratch sound as climbing starts
          }
      } else {
          setAction('idle');
      }
      
      setWalkTarget(null);
      setNextAction(null);
  };

  // --- MINIGAME START SEQUENCE LOGIC ---
  
  // 1. Wait for 'preparing_game' animation (inviting gesture) to finish (~1.5s)
  // 2. Start Loading Screen
  useEffect(() => {
      if (action === 'preparing_game' && pendingGame && !isGameLoading) {
           const startLoadTimer = setTimeout(() => {
               setIsGameLoading(true);
               setLoadingProgress(0);
           }, 1500);
           return () => clearTimeout(startLoadTimer);
      }
  }, [action, pendingGame, isGameLoading]);

  // 3. Simulate Minigame Loading Progress
  useEffect(() => {
      if (isGameLoading) {
          const interval = setInterval(() => {
              setLoadingProgress(prev => {
                  if (prev >= 100) {
                      clearInterval(interval);
                      return 100;
                  }
                  return prev + 2; // ~1.5 seconds to load
              });
          }, 30);
          return () => clearTimeout(interval);
      }
  }, [isGameLoading]);

  // 4. Finish Minigame Loading and Start Game
  useEffect(() => {
      if (loadingProgress >= 100 && isGameLoading && pendingGame) {
          // Small delay to let user see 100%
          const finishTimer = setTimeout(() => {
              setIsGameLoading(false);
              setAction(pendingGame);
              setPendingGame(null);
              setLoadingProgress(0);
          }, 500);
          return () => clearTimeout(finishTimer);
      }
  }, [loadingProgress, isGameLoading, pendingGame]);


  const handleCatClick = () => {
    if (appPhase !== 'game') return; // Disable interaction in menu
    
    audioService.init();
    if (isTyping || (action !== 'idle' && action !== 'walking' && action !== 'sleeping')) {
      return;
    }

    if (action === 'sleeping') {
        setAction('waking_up');
        setStats(prev => ({ ...prev, happiness: Math.max(0, prev.happiness - 10) }));
        triggerAiResponse("[The user woke you up while you were sleeping. You are grumpy.]");
        audioService.playMeow('grumpy');
        setTimeout(() => {
            setAction('stretching');
            setTimeout(() => setAction('idle'), 3000);
        }, 2000);
        return;
    }

    if (Math.random() < 0.7) {
        setAction('petting');
        setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 10) }));
        triggerAiResponse("[The user is petting you gently. You feel loved and purr.]");
        audioService.playPurr();
        setTimeout(() => setAction('idle'), 2500);
    } else {
        setAction('poked');
        setStats(prev => ({ ...prev, happiness: Math.max(0, prev.happiness - 5) }));
        triggerAiResponse("[The user poked you unexpectedly. You are startled and annoyed.]");
        audioService.playMeow('grumpy');
        setTimeout(() => setAction('idle'), 1000);
    }
  };

  const handleFeed = () => {
    audioService.init();
    setAction('eating');
    audioService.playMeow('demanding'); 
    setTimeout(() => audioService.playEating(), 800); 
    setTimeout(() => {
      setStats(prev => ({ ...prev, hunger: Math.min(100, prev.hunger + 30), happiness: Math.min(100, prev.happiness + 5) }));
      setAction('idle');
    }, 4000);
  };

  const handleWater = () => {
      audioService.init();
      setAction('drinking');
      audioService.playMeow('greeting');
      setTimeout(() => audioService.playDrinking(), 500);
      setTimeout(() => {
          setStats(prev => ({ ...prev, thirst: Math.min(100, prev.thirst + 40), happiness: Math.min(100, prev.happiness + 2) }));
          setAction('idle');
      }, 4000);
  };

  const handleClean = () => {
      audioService.init();
      setStats(prev => ({ ...prev, hygiene: 100, happiness: Math.min(100, prev.happiness + 10) }));
      audioService.playDigging();
  };

  const handlePlayAction = (activity: 'sing' | 'dance' | 'yoga' | 'fish' | 'climb') => {
    audioService.init();
    
    switch(activity) {
        case 'climb':
            // Walk to the base of the scratching post first (near 6, 0, -7)
            setWalkTarget(new Vector3(6, 0, -5.5)); 
            setNextAction('climbing');
            setAction('walking');
            audioService.playTrill();
            
            // Once climbing starts (handled in movement complete), we wait longer
            setTimeout(() => {
                // This timeout is just a fallback/safety cleanup. 
                // The actual climbing anim lasts ~10s, controlled by App logic below?
                // Actually we need to manually reset to idle after the animation.
                // Since Cat3D animation is procedural, we just set a timeout here to match.
                // Walk time (approx 2s) + Climb Time (9s)
            }, 2000);

            // Set a timeout to finish the activity
            // Time to walk ~2s. Animation ~9s. Total ~11-12s.
            setTimeout(() => {
                 setStats(prev => ({ 
                    ...prev, 
                    happiness: Math.min(100, prev.happiness + 25),
                    energy: Math.max(0, prev.energy - 20),
                    hunger: Math.max(0, prev.hunger - 10)
                }));
                setAction('idle');
            }, 12000);
            break;
        case 'sing':
            handleSinging();
            break;
        case 'dance':
            handleDancing();
            break;
        case 'yoga':
            setAction('yoga');
            audioService.playPurr(); 
            setTimeout(() => {
                setStats(prev => ({
                    ...prev,
                    happiness: Math.min(100, prev.happiness + 10),
                    energy: Math.min(100, prev.energy + 5) 
                }));
                setAction('idle');
            }, 5000);
            break;
        case 'fish':
            setAction('fishing');
            audioService.playTrill();
            setTimeout(() => {
                const caught = Math.random() > 0.5;
                if (caught) {
                    audioService.playSplash();
                    setStats(prev => ({
                        ...prev,
                        happiness: Math.min(100, prev.happiness + 15),
                        hunger: Math.min(100, prev.hunger + 10) 
                    }));
                } else {
                    setStats(prev => ({
                        ...prev,
                        happiness: Math.min(100, prev.happiness + 5)
                    }));
                }
                setAction('idle');
            }, 5000);
            break;
    }
  };

  const handleSleep = () => {
    audioService.init();
    setAction('sleeping');
    setTimeout(() => audioService.playSnore(), 1000);
  };

  const handleSelectGame = (gameType: 'gomoku' | 'xiangqi') => {
      audioService.init();
      setPendingGame(gameType === 'gomoku' ? 'playing_gomoku' : 'playing_xiangqi');
      setNextAction('preparing_game');
      setWalkTarget(new Vector3(0, 0, 3.5)); 
      setAction('walking');
      audioService.playTrill();
  }

  const handleCloseGame = () => {
      setAction('idle');
  };

  const handleGameEnd = (winner: 'user' | 'cat') => {
      if (winner === 'user') {
          audioService.playMeow('happy');
          setStats(prev => ({
              ...prev,
              happiness: Math.min(100, prev.happiness + 15),
              energy: Math.max(0, prev.energy - 10)
          }));
      } else {
          audioService.playTrill();
          setStats(prev => ({
              ...prev,
              happiness: Math.min(100, prev.happiness + 20),
              energy: Math.max(0, prev.energy - 10)
          }));
      }
  };

  const handleUserMessage = (text: string) => {
      audioService.init();
      addMessage('user', text);
      triggerAiResponse(text);
  };

  return (
    <div className="w-full h-screen bg-gray-100 relative overflow-hidden" onClick={() => audioService.init()}>
      
      {/* 3D Scene */}
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        <SoftShadows size={10} samples={16} />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2 - 0.1} 
          minDistance={5}
          maxDistance={30}
          autoRotate={appPhase === 'menu'} // Slowly rotate camera in menu for nice effect
          autoRotateSpeed={0.5}
        />
        
        <Environment 
            action={action} 
            hygiene={stats.hygiene} 
            onWalkCommand={handleFloorClick}
            onPointerMove={handlePointerMove}
            targetPosition={walkTarget}
        />
        
        <Cat3D 
            action={action} 
            walkTarget={walkTarget}
            lookAtTarget={mouseWorldPos}
            onMovementComplete={handleMovementComplete}
            onClick={handleCatClick} 
            language={language}
        />
      </Canvas>

      {/* Start Menu Overlay */}
      {appPhase === 'menu' && (
          <StartMenu 
            onStart={handleStartGame} 
            language={language}
            onSetLanguage={setLanguage}
          />
      )}

      {/* Main Game UI (Only in Game Phase) */}
      {appPhase === 'game' && (
          <GameUI 
            stats={stats} 
            currentAction={action}
            messages={messages}
            isTyping={isTyping}
            language={language}
            onSetLanguage={setLanguage}
            onSendMessage={handleUserMessage}
            onFeed={handleFeed}
            onWater={handleWater}
            onClean={handleClean}
            onPlayAction={handlePlayAction}
            onSleep={handleSleep}
            onSelectGame={handleSelectGame}
          />
      )}

      {/* Loading Screen (Global or Minigame) */}
      {(appPhase === 'loading' || isGameLoading) && (
          <GameLoadingScreen progress={loadingProgress} language={language} />
      )}

      {/* Minigames */}
      {appPhase === 'game' && action === 'playing_gomoku' && !isGameLoading && (
          <GomokuBoard onClose={handleCloseGame} onGameEnd={handleGameEnd} language={language} />
      )}
      {appPhase === 'game' && action === 'playing_xiangqi' && !isGameLoading && (
          <XiangqiBoard onClose={handleCloseGame} onGameEnd={handleGameEnd} language={language} />
      )}
    </div>
  );
};

export default App;