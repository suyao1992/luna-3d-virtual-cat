
import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, SoftShadows } from '@react-three/drei';
import { Cat3D } from './components/Cat3D';
import { Environment } from './components/Environment';
import { GameUI } from './components/GameUI';
import { GomokuBoard } from './components/GomokuBoard';
import { XiangqiBoard } from './components/XiangqiBoard';
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

const App: React.FC = () => {
  const [stats, setStats] = useState<CatStats>(INITIAL_STATS);
  const [action, setAction] = useState<CatAction>('idle');
  const [language, setLanguage] = useState<Language>('en');
  
  // Movement and Interaction State
  const [walkTarget, setWalkTarget] = useState<Vector3 | null>(null);
  const [mouseWorldPos, setMouseWorldPos] = useState<Vector3 | null>(null);
  const [nextAction, setNextAction] = useState<CatAction | null>(null);

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

  // Game Loop: Stats updates over time
  useEffect(() => {
    const timer = setInterval(() => {
      setStats(prev => {
        let hungerDecay = 0.4, thirstDecay = 0.6, energyDecay = 0.2, happinessDecay = 0.1;

        if (action === 'sleeping') {
          hungerDecay = 0.1; thirstDecay = 0.2; energyDecay = -3; happinessDecay = 0.05;
        } else if (['playing', 'dancing', 'playing_ball', 'scratching', 'chase'].includes(action)) {
           energyDecay = 1.0; hungerDecay = 0.8; thirstDecay = 1.0;
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
  }, [action, stats.energy]);
  
  // Random idle behaviors
  useEffect(() => {
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
  }, [action, stats.energy]); 

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
      audioService.init();
      if (action !== 'idle' && action !== 'walking') return;
      const flatPoint = new Vector3(point.x, 0, point.z);
      setWalkTarget(flatPoint);
      setAction('walking');
      audioService.playTrill(); 
  };
  
  const handlePointerMove = (point: Vector3) => {
    setMouseWorldPos(point);
  }

  const handleMovementComplete = () => {
      if (nextAction) {
          setAction(nextAction);
          // Special sequence for Game
          if (nextAction === 'preparing_game') {
              audioService.playMeow('greeting');
              // We need to know WHICH game to start after preparing
              // For simplicity, we can store a temp variable or infer.
              // But here, let's just use a timeout to transition to the actual game state
              // The nextAction state flow is: walking -> preparing_game -> playing_XXX
              // This part is tricky because 'nextAction' was just set to 'preparing_game'.
              // We need another step.
          }
      } else {
          setAction('idle');
      }
      // If we just finished walking to prepare, now we prepare
      if (action === 'walking' && nextAction === 'preparing_game') {
          // nextAction is already set above, so 'action' becomes 'preparing_game' on next render
          // We need to schedule the transition to the ACTUAL game.
          // However, we lost the info of WHICH game.
          // Let's rely on a state variable for "pendingGame"
      }
      
      setWalkTarget(null);
      setNextAction(null);
  };

  // Fix for the game transition flow:
  // 1. handleSelectGame sets 'pendingGame' state and sets walk target.
  // 2. movement complete -> setAction('preparing_game')
  // 3. useEffect watches 'preparing_game', waits, then sets Action to 'pendingGame'
  const [pendingGame, setPendingGame] = useState<CatAction | null>(null);

  useEffect(() => {
      if (action === 'preparing_game' && pendingGame) {
           const timer = setTimeout(() => {
               setAction(pendingGame);
               setPendingGame(null);
           }, 2000);
           return () => clearTimeout(timer);
      }
  }, [action, pendingGame]);


  const handleCatClick = () => {
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

  const handlePlayAction = (activity: 'chase' | 'sing' | 'dance' | 'yoga' | 'fish') => {
    audioService.init();
    
    switch(activity) {
        case 'chase':
            setAction('playing'); 
            audioService.playMeow('greeting');
            setTimeout(() => {
                setStats(prev => ({ 
                    ...prev, 
                    happiness: Math.min(100, prev.happiness + 20),
                    energy: Math.max(0, prev.energy - 15),
                    hunger: Math.max(0, prev.hunger - 5),
                    thirst: Math.max(0, prev.thirst - 10)
                }));
                setAction('idle');
            }, 3000);
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
      // Sequence: Walk to Board -> Prepare/Invite -> Play
      // Cat location for Games is (0, 0, 3.5)
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
      
      <Canvas shadows camera={{ position: [0, 8, 12], fov: 45 }}>
        <SoftShadows size={10} samples={16} />
        <OrbitControls 
          enablePan={false} 
          maxPolarAngle={Math.PI / 2 - 0.1} 
          minDistance={5}
          maxDistance={30}
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

      {action === 'playing_gomoku' && (
          <GomokuBoard onClose={handleCloseGame} onGameEnd={handleGameEnd} language={language} />
      )}
      {action === 'playing_xiangqi' && (
          <XiangqiBoard onClose={handleCloseGame} onGameEnd={handleGameEnd} language={language} />
      )}
    </div>
  );
};

export default App;
