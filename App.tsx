








import React, { useState, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Vector3, Group } from 'three';
import { OrbitControls } from '@react-three/drei';
import { CatStats, CatAction, ChatMessage, Language, WeatherCondition, OutfitId, ItemId, ITEM_REGISTRY, TRANSLATIONS, GardenSlot, PlantType } from './types';
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
import { FishingGame } from './components/FishingGame';
import { WeatherPanel } from './components/ui/WeatherPanel';
import { BackpackModal } from './components/ui/BackpackModal';
import { GardenModal } from './components/ui/GardenModal';
import { DiscoCamera, ManualFollowCamera } from './components/Cameras';
import { Gift, X } from 'lucide-react'; // Import icons for reward modal

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
    hygiene: 100,
    level: 1,
    experience: 0,
    maxExperience: 100
  });
  const [action, setAction] = useState<CatAction>('idle');
  const [targetPos, setTargetPos] = useState<Vector3 | null>(null);
  const [outfit, setOutfit] = useState<OutfitId>('none');
  
  // Inventory State
  const [inventory, setInventory] = useState<Record<string, number>>({});
  const [showBackpack, setShowBackpack] = useState(false);

  // Garden State
  const [gardenSlots, setGardenSlots] = useState<GardenSlot[]>(
      Array.from({ length: 9 }).map((_, i) => ({
          id: i,
          soilState: 'empty',
          plantType: null,
          growthStage: 0,
          growthProgress: 0,
          moisture: 0,
          health: 100,
          hasWeeds: false
      }))
  );
  const [showGarden, setShowGarden] = useState(false);

  // Environment State
  const [language, setLanguage] = useState<Language>('en');
  const [gameTime, setGameTime] = useState(12); // 0-24
  const [weather, setWeather] = useState<WeatherCondition>('sunny');
  const [isDiscoMode, setIsDiscoMode] = useState(false);
  const [hasPoop, setHasPoop] = useState(false);
  const [showWeatherPanel, setShowWeatherPanel] = useState(false);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(false);
  
  // Interaction State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [activeGame, setActiveGame] = useState<'gomoku' | 'xiangqi' | 'match3' | 'fishing' | null>(null);

  // Reward Modal State - Updated to use translation key
  const [showReward, setShowReward] = useState<{key: string, icon: string} | null>(null);

  // Easter Eggs
  const [isEscaping, setIsEscaping] = useState(false);
  const [isExploding, setIsExploding] = useState(false);

  // Refs for logic that doesn't need re-renders
  const orbitRef = useRef<any>(null);
  const actionRef = useRef<CatAction>('idle');
  const statsRef = useRef(stats);
  const mouseRef = useRef<Group>(null);

  // Sync refs
  useEffect(() => { actionRef.current = action; }, [action]);
  useEffect(() => { statsRef.current = stats; }, [stats]);

  // --- GAME LOOP ---
  useEffect(() => {
    if (!hasStarted) return;
    
    const interval = setInterval(() => {
       setStats(prev => ({
           ...prev,
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

       // --- GARDEN GROWTH TICK (Runs every 1s) ---
       setGardenSlots(prevSlots => prevSlots.map(slot => {
           if (slot.plantType && slot.growthStage < 3) {
               // Growth factors
               let rate = 1.0; 
               if (slot.moisture > 20) rate *= 2.0; // Water boosts growth
               if (slot.hasWeeds) rate *= 0.5; // Weeds slow growth
               if (slot.health < 50) rate *= 0.5; // Sick plants grow slow

               let newProgress = slot.growthProgress + rate;
               let newStage = slot.growthStage;

               if (newProgress >= 100) {
                   newProgress = 0;
                   newStage += 1;
               }

               return {
                   ...slot,
                   growthProgress: newProgress,
                   growthStage: newStage,
                   // Moisture decays
                   moisture: Math.max(0, slot.moisture - 0.5),
                   // Weed spawning chance (1% per tick if empty or growing)
                   hasWeeds: slot.hasWeeds || (Math.random() < 0.002 && slot.growthStage < 3),
                   // Health regen/decay
                   health: slot.hasWeeds ? Math.max(0, slot.health - 0.5) : Math.min(100, slot.health + 0.5)
               };
           } else {
               // Empty soil dries out
               return {
                   ...slot,
                   moisture: Math.max(0, slot.moisture - 1)
               };
           }
       }));

    }, 1000);

    return () => clearInterval(interval);
  }, [hasStarted, hasPoop]);

  // --- EXPERIENCE LOGIC ---
  const addExperience = (amount: number) => {
      setStats(prev => {
          let newExp = prev.experience + amount;
          let newLevel = prev.level;
          let newMaxExp = prev.maxExperience;
          
          if (newExp >= newMaxExp) {
              // Level Up!
              newExp -= newMaxExp;
              newLevel += 1;
              newMaxExp = Math.floor(newMaxExp * 1.5);
              
              // Play Level Up Sound Effect
              audioService.playSinging(); // Re-use singing as celebration for now
          }
          
          return {
              ...prev,
              level: newLevel,
              experience: newExp,
              maxExperience: newMaxExp
          };
      });
  };

  // --- GARDEN HANDLERS ---
  const handleGardenInteract = () => {
      // Walk to garden first
      const gardenPos = new Vector3(-6, 0, 6);
      setTargetPos(gardenPos);
      setAction('walking');
      // Open modal after delay
      setTimeout(() => {
          setShowGarden(true);
      }, 1500);
  };

  const handleTill = (id: number) => {
      setGardenSlots(prev => prev.map(s => s.id === id ? { ...s, soilState: 'ready', hasWeeds: false } : s));
      audioService.playDigging();
      addExperience(2);
  };

  const handlePlant = (id: number, type: PlantType) => {
      setGardenSlots(prev => prev.map(s => s.id === id ? { 
          ...s, 
          plantType: type, 
          growthStage: 0, 
          growthProgress: 0, 
          health: 100 
      } : s));
      audioService.playDrop();
      addExperience(5);
  };

  const handleWaterGarden = (id: number) => {
      setGardenSlots(prev => prev.map(s => s.id === id ? { ...s, moisture: 100 } : s));
      audioService.playSplash();
      addExperience(2);
  };

  const handleWeed = (id: number) => {
      setGardenSlots(prev => prev.map(s => s.id === id ? { ...s, hasWeeds: false, health: 100 } : s));
      audioService.playScratching();
      addExperience(5);
  };

  const handleHarvest = (id: number) => {
      const slot = gardenSlots.find(s => s.id === id);
      if (slot && slot.plantType && slot.growthStage === 3) {
          // Add to inventory
          addToInventory(slot.plantType, 1);
          // Reward
          audioService.playBoing();
          addExperience(20);
          setStats(p => ({ ...p, happiness: Math.min(100, p.happiness + 5) }));
          // Reset Slot
          setGardenSlots(prev => prev.map(s => s.id === id ? { 
              ...s, 
              soilState: 'empty', 
              plantType: null, 
              growthStage: 0,
              growthProgress: 0,
              moisture: 0,
              health: 100,
              hasWeeds: false
          } : s));
      }
  };

  // --- IDLE BRAIN (Autonomous Behavior) ---
  useEffect(() => {
      if (!hasStarted || activeGame || isReaderOpen || isDiscoMode || isEscaping || isMouseActive) return;

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
  }, [hasStarted, activeGame, isReaderOpen, isDiscoMode, isEscaping, isMouseActive]);


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
      if (stats.hunger >= 100) {
          audioService.playMeow('happy');
          return;
      }
      clearPending();
      performAction('eating');
      setStats(prev => ({ ...prev, hunger: 100, happiness: Math.min(100, prev.happiness + 10) }));
      addExperience(10);
      audioService.playEating();
  };

  const handleWater = () => {
      if (stats.thirst >= 100) {
          audioService.playMeow('happy');
          return;
      }
      clearPending();
      performAction('drinking');
      setStats(prev => ({ ...prev, thirst: 100 }));
      addExperience(5);
      audioService.playDrinking();
  };

  const handleClean = () => {
      if (!hasPoop && stats.hygiene >= 90) {
          audioService.playMeow('happy');
          return;
      }
      clearPending();
      performAction('using_litter'); 
      setStats(prev => ({ ...prev, hygiene: 100 }));
      setHasPoop(false);
      addExperience(10);
      audioService.playDigging();
      setTimeout(() => setAction('idle'), 4000);
  };

  const handlePlayAction = (type: 'sing' | 'dance' | 'yoga' | 'fish' | 'climb' | 'read') => {
      clearPending();
      addExperience(5); // Basic play XP
      if (type === 'sing') {
          performAction('singing', 5000);
          audioService.playSinging();
      } else if (type === 'dance') {
          handleToggleDisco();
      } else if (type === 'yoga') {
          performAction('yoga', 6000);
      } else if (type === 'fish') {
          // Open Fishing Minigame
          performAction('fishing', -1);
          // Wait for the cat to walk to the fishing spot
          setTimeout(() => {
              setActiveGame('fishing');
          }, 1500);
      } else if (type === 'climb') {
          performAction('climbing', 8000);
      } else if (type === 'read') {
          performAction('reading', -1); // Indefinite until closed
          setIsReaderOpen(true);
          addExperience(5);
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
          addExperience(5);
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
          addExperience(2); // Sleeping gives a little XP
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

  const handleCatnip = () => {
      clearPending();
      // Coffee Table is at [6.5, 0, 6] but the "sniff" spot should be next to it
      const sniffPos = new Vector3(5.5, 0, 6); 
      setTargetPos(sniffPos);
      setAction('walking'); // Walk there first
      
      // Wait to arrive then trigger HIGH
      setTimeout(() => {
          performAction('catnip_high', 10000); // 10s animation sequence
          audioService.playTrill(); // Excited greeting
          // Stats boost
          setStats(p => ({ 
              ...p, 
              happiness: 100, 
              energy: Math.max(0, p.energy - 10) // Tiring but fun
          }));
          addExperience(25); // Big XP reward
      }, 2000); // Rough walk time estimate
  };

  const handleOpenBlindBox = () => {
      clearPending();
      // Walk to Christmas Tree (Positioned at [-12.5, 0, -7.5])
      const boxPos = new Vector3(-10.5, 0, -5.5);
      setTargetPos(boxPos);
      setAction('walking');

      // Sync Animation
      setTimeout(() => {
          performAction('opening_blind_box', 5000); // 5s Sequence
          
          // Audio: Trill at start
          audioService.playTrill();

          // Wait for "Explosion" impact phase (~1.3s in) to reveal reward
          setTimeout(() => {
              audioService.playBoing(); // Pop sound
              audioService.playMagicEffect(); // Sparkle sound
              
              // Reward Logic
              const rand = Math.random();
              let rewardKey = 'exp_50';
              let rewardIcon = "⭐";
              
              // 30% chance to unlock special outfit if not already worn
              if (rand < 0.3 && outfit !== 'christmas') {
                  setOutfit('christmas');
                  rewardKey = 'outfit_christmas';
                  rewardIcon = "🎄";
              } else if (rand < 0.5 && outfit !== 'formal') {
                  setOutfit('formal');
                  rewardKey = 'outfit_formal';
                  rewardIcon = "👔";
              } else {
                  // Fallback: Big XP
                  addExperience(50);
              }
              
              // Show Modal with Key
              setShowReward({ key: rewardKey, icon: rewardIcon });
              
              setStats(p => ({ ...p, happiness: 100 })); // Max happiness
          }, 1300);

      }, 2000); // Walk time
  };

  const handleSendMessage = async (text: string) => {
      const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text };
      setMessages(prev => [...prev, userMsg]);
      setIsTyping(true);
      addExperience(2); // Chatting gives XP

      const response = await geminiService.chatWithCat(text, stats, language);
      
      const catMsg: ChatMessage = { id: (Date.now() + 1).toString(), sender: 'cat', text: response };
      setMessages(prev => [...prev, catMsg]);
      setIsTyping(false);
      audioService.playMeow('greeting');
  };

  const handleWalkCommand = (point: Vector3) => {
      if (isEscaping || activeGame || isMouseActive) return;
      setTargetPos(point);
      setAction('walking');
  };
  
  const handleMovementComplete = () => {
      if (action === 'walking' || action === 'wandering') {
          // If we were walking to catnip/blindbox, the timeout in handleCatnip will override this,
          // but if we arrived early, we just idle until then.
          setAction('idle');
          setTargetPos(null);
      }
      if (action === 'falling') {
          audioService.playMeow('poked'); // Thud sound effect logic inside audioService could be better but reusing existing
          setAction('idle');
      }
  };

  const handleTailClick = () => {
      if (isEscaping || activeGame || isMouseActive) return;
      
      // Interrupt current action
      clearPending();
      performAction('tail_grabbed', 1500); // 1.5s total animation
      
      // Audio: Grumpy noise
      audioService.playMeow('poked'); // Sharp "Meow!"
      
      // Stats: Slight happiness penalty
      setStats(prev => ({
          ...prev,
          happiness: Math.max(0, prev.happiness - 5)
      }));
  };

  // --- INVENTORY LOGIC ---
  const addToInventory = (itemId: string, amount: number = 1) => {
      setInventory(prev => ({
          ...prev,
          [itemId]: (prev[itemId] || 0) + amount
      }));
  };

  const removeFromInventory = (itemId: string, amount: number = 1) => {
      setInventory(prev => {
          const newState = { ...prev };
          if (newState[itemId]) {
              newState[itemId] -= amount;
              if (newState[itemId] <= 0) delete newState[itemId];
          }
          return newState;
      });
  };

  const handleUseItem = (itemId: string) => {
      // Basic logic: using an item gives stats and consumes it
      const itemDef = ITEM_REGISTRY[itemId as ItemId];
      if (!itemDef) return;

      if (['sardine', 'tuna', 'koi', 'carrot', 'radish'].includes(itemId)) {
          handleFeed(); // It's food!
      } else {
          setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 5) }));
          audioService.playMeow('happy');
          addExperience(5);
      }
      removeFromInventory(itemId);
  };

  const handleSellItem = (itemId: string) => {
      // Placeholder for economy system. Just remove for now and make cat happy.
      audioService.playBoing();
      removeFromInventory(itemId);
      addExperience(2);
  };

  // --- MOUSE TOY LOGIC ---
  const handleMouseClick = () => {
      if (isMouseActive || isEscaping || activeGame) return;
      
      clearPending();
      setIsMouseActive(true);
      setAction('chasing');
      audioService.playTrill();
      addExperience(15);
      
      // Update stats: High physical activity consumes energy but boosts happiness
      setStats(prev => ({
          ...prev,
          energy: Math.max(0, prev.energy - 15), 
          happiness: Math.min(100, prev.happiness + 20)
      }));

      // Run for 10 seconds
      setTimeout(() => {
          setIsMouseActive(false);
          setAction('idle');
      }, 10000);
  };

  // --- RENDER ---
  
  const t = TRANSLATIONS[language];

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
                onInteract={(act) => {
                    // Map 3D interactions to game logic handlers to ensure stats update
                    if (act === 'eating') handleFeed();
                    else if (act === 'drinking') handleWater();
                    else if (act === 'using_litter') handleClean();
                    else if (act === 'sleeping') handleSleep();
                    else if (act === 'climbing') handlePlayAction('climb');
                    else if (act === 'reading') handlePlayAction('read');
                    else if (act === 'catnip_high') handleCatnip();
                    else if (act === 'opening_blind_box') handleOpenBlindBox();
                    else if (act === 'walking') handleGardenInteract(); // Maps garden click to walking + open modal
                    else if (act === 'hiding') {
                        performAction('hiding', 10000);
                        addExperience(2);
                    }
                    else {
                        setAction(act);
                    }
                }}
                hasPoop={hasPoop}
                timeOfDay={gameTime}
                weather={weather}
                onWindowClick={() => setShowWeatherPanel(true)}
                mouseRef={mouseRef}
                isMouseActive={isMouseActive}
                onMouseClick={handleMouseClick}
                language={language}
            />
            
            {/* Inject Garden Slots state into environment for rendering (Need to pass down) */}
            {/* Note: Environment doesn't accept gardenSlots yet, so we just use the internal state there for now or pass props */}
            {/* To properly sync 3D visuals with App logic, we should pass gardenSlots to Environment -> LivingRoom -> VegetableGarden */}
            {/* For now, let's inject a hidden component to sync or modify Environment props */}
            <mesh visible={false} userData={{ gardenSlots }} /> 

            <Cat3D 
                action={action} 
                walkTarget={targetPos}
                onMovementComplete={handleMovementComplete}
                language={language}
                isEscaping={isEscaping}
                outfit={outfit}
                chaseTarget={mouseRef}
                onTailClick={handleTailClick}
                onClick={() => {
                    if (isEscaping) return;
                    
                    const interruptible = ['idle', 'walking', 'wandering', 'sitting', 'standing', 'grooming', 'scratching'].includes(actionRef.current);
                    
                    if (interruptible) {
                        // Randomly choose belly rub (40% chance) or normal petting
                        const isBellyRub = Math.random() < 0.4;

                        if (isBellyRub) {
                            performAction('belly_rub', 4000); // 4 seconds animation
                            audioService.playPurr();
                            audioService.playMeow('happy');
                            setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 20) }));
                            addExperience(10);
                        } else {
                            performAction('petting', 5000); // 5 seconds of love
                            audioService.playMeow('happy');
                            audioService.playPurr();
                            setStats(prev => ({ ...prev, happiness: Math.min(100, prev.happiness + 15) }));
                            addExperience(5);
                        }
                    } else {
                        // If sleeping, toggle sleep (wake up)
                        if (actionRef.current === 'sleeping') {
                            handleSleep();
                        } else {
                            // Busy or non-interruptible
                            audioService.playMeow('poked');
                        }
                    }
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
                currentOutfit={outfit}
                onSetOutfit={setOutfit}
                onOpenBackpack={() => setShowBackpack(true)}
            />
        )}

        {/* GARDEN MODAL */}
        {showGarden && (
            <GardenModal 
                slots={gardenSlots}
                onClose={() => setShowGarden(false)}
                onTill={handleTill}
                onPlant={handlePlant}
                onWater={handleWaterGarden}
                onWeed={handleWeed}
                onHarvest={handleHarvest}
                language={language}
            />
        )}

        {/* REWARD POPUP OVERLAY */}
        {showReward && (
            <div className="absolute inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in pointer-events-auto">
                <div className="bg-white p-8 rounded-3xl shadow-2xl border-4 border-yellow-300 w-full max-w-sm flex flex-col items-center gap-6 animate-bounce-in relative overflow-visible">
                    
                    {/* Confetti Background Effect (CSS only) */}
                    <div className="absolute inset-0 bg-yellow-50 opacity-50 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-transparent to-transparent animate-pulse rounded-3xl"></div>
                    
                    <button 
                        onClick={() => setShowReward(null)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-2 z-20"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    <div className="z-10 flex flex-col items-center relative">
                        <h2 className="text-2xl font-black text-yellow-600 mb-6 uppercase tracking-widest text-center">
                            {t.reward.title}
                        </h2>
                        
                        <div className="relative mb-6">
                            {/* Rotating Rays Background */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-gradient-to-tr from-yellow-300 to-transparent opacity-50 rounded-full animate-[spin_10s_linear_infinite]" 
                                style={{ maskImage: 'radial-gradient(white, transparent 70%)' }}>
                                {/* Rays created via conic gradient for simplicity or just a simple glow */}
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-yellow-200 rounded-full animate-ping opacity-20"></div>

                            {/* Main Icon Container */}
                            <div className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center border-4 border-white shadow-xl relative z-10 animate-[pop_0.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
                                <span className="text-6xl filter drop-shadow-md">{showReward.icon}</span>
                            </div>
                        </div>

                        <p className="text-gray-500 font-bold text-sm uppercase">{t.reward.unlocked}</p>
                        <h3 className="text-3xl font-black text-gray-800 text-center leading-tight mt-1">
                            {/* @ts-ignore */}
                            {t.reward[showReward.key] || "Reward"}
                        </h3>
                    </div>

                    <button 
                        onClick={() => setShowReward(null)}
                        className="z-10 bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-full font-bold shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                    >
                        <Gift className="w-5 h-5" /> {t.reward.claim}
                    </button>
                </div>
                <style>{`
                    @keyframes pop {
                        0% { transform: scale(0); opacity: 0; }
                        80% { transform: scale(1.1); opacity: 1; }
                        100% { transform: scale(1); opacity: 1; }
                    }
                `}</style>
            </div>
        )}

        {/* Full Screen Modals */}
        {(activeGame === 'gomoku') && (
            <GomokuBoard 
                onClose={() => { setActiveGame(null); setAction('idle'); }} 
                onGameEnd={(winner) => {
                    if (winner === 'user') {
                        setStats(p => ({ ...p, happiness: 100 }));
                        addExperience(30);
                    } else {
                        addExperience(10);
                    }
                }}
                language={language}
            />
        )}
        {(activeGame === 'xiangqi') && (
            <XiangqiBoard 
                onClose={() => { setActiveGame(null); setAction('idle'); }} 
                onGameEnd={(winner) => {
                    if (winner === 'user') {
                        setStats(p => ({ ...p, happiness: 100 }));
                        addExperience(30);
                    } else {
                        addExperience(10);
                    }
                }}
                language={language}
            />
        )}
        {(activeGame === 'match3') && (
            <Match3Board 
                onClose={() => { setActiveGame(null); setAction('idle'); }} 
                onGameEnd={(score) => {
                    setStats(p => ({ ...p, happiness: Math.min(100, p.happiness + score / 10) }));
                    addExperience(Math.floor(score / 5));
                }}
                language={language}
            />
        )}
        {(activeGame === 'fishing') && (
            <FishingGame 
                onClose={() => { setActiveGame(null); setAction('idle'); }}
                onCatch={(itemId, score) => {
                    setStats(p => ({ ...p, happiness: Math.min(100, p.happiness + 5), hunger: Math.min(100, p.hunger + 5) }));
                    addToInventory(itemId, 1);
                    addExperience(score > 0 ? 10 : 2);
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
        
        {showBackpack && (
            <BackpackModal 
                inventory={inventory}
                onClose={() => setShowBackpack(false)}
                onUseItem={handleUseItem}
                onSellItem={handleSellItem}
                language={language}
            />
        )}

    </div>
  );
};

export default App;
