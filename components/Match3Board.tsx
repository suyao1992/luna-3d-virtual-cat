
import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Trophy, Cat, Fish, Heart, Zap, Sparkles } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';
import { audioService } from '../services/audio';

interface Match3BoardProps {
  onClose: () => void;
  onGameEnd: (score: number) => void;
  language: Language;
}

const BOARD_SIZE = 8;
const MOVES_LIMIT = 20;

// Tile Types
type TileType = 'cat' | 'fish' | 'heart' | 'zap' | 'star';
const TILE_TYPES: TileType[] = ['cat', 'fish', 'heart', 'zap', 'star'];

interface Tile {
  id: string;
  type: TileType;
  r: number;
  c: number;
  isMatched?: boolean;
}

interface Effect {
    id: string;
    r: number;
    c: number;
    type: 'particle' | 'score';
    content?: string;
    dx?: number; // drift x
    dy?: number; // drift y
}

export const Match3Board: React.FC<Match3BoardProps> = ({ onClose, onGameEnd, language }) => {
  const [board, setBoard] = useState<Tile[][]>([]);
  const [selectedTile, setSelectedTile] = useState<{r: number, c: number} | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(MOVES_LIMIT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [effects, setEffects] = useState<Effect[]>([]);

  const t = TRANSLATIONS[language].match3;

  // --- INITIALIZATION ---
  
  const generateTile = (r: number, c: number): Tile => ({
      id: `${r}-${c}-${Math.random()}`,
      type: TILE_TYPES[Math.floor(Math.random() * TILE_TYPES.length)],
      r, c
  });

  const createBoard = useCallback(() => {
      const newBoard: Tile[][] = [];
      for (let r = 0; r < BOARD_SIZE; r++) {
          const row: Tile[] = [];
          for (let c = 0; c < BOARD_SIZE; c++) {
              let tile = generateTile(r, c);
              // Prevent initial match-3
              while (
                  (c >= 2 && tile.type === row[c-1].type && tile.type === row[c-2].type) ||
                  (r >= 2 && tile.type === newBoard[r-1][c].type && tile.type === newBoard[r-2][c].type)
              ) {
                  tile = generateTile(r, c);
              }
              row.push(tile);
          }
          newBoard.push(row);
      }
      return newBoard;
  }, []);

  useEffect(() => {
      setBoard(createBoard());
  }, [createBoard]);

  // --- VISUAL EFFECTS ---

  const getColor = (type: TileType) => {
      switch(type) {
          case 'cat': return 'bg-orange-400 border-orange-600';
          case 'fish': return 'bg-blue-400 border-blue-600';
          case 'heart': return 'bg-red-400 border-red-600';
          case 'zap': return 'bg-yellow-400 border-yellow-600';
          case 'star': return 'bg-purple-400 border-purple-600';
      }
  };

  const spawnEffects = (matchedTiles: Tile[]) => {
      const newEffects: Effect[] = [];
      
      matchedTiles.forEach(tile => {
          const colorClass = getColor(tile.type).split(' ')[0]; // Extract bg class
          // Spawn Particles
          for(let i=0; i<6; i++) {
              newEffects.push({
                  id: `p-${tile.id}-${i}-${Math.random()}`,
                  r: tile.r,
                  c: tile.c,
                  type: 'particle',
                  content: colorClass,
                  dx: (Math.random() - 0.5) * 100, // explode direction
                  dy: (Math.random() - 0.5) * 100
              });
          }
      });

      // Score popup at center of match
      if(matchedTiles.length > 0) {
          const centerTile = matchedTiles[Math.floor(matchedTiles.length / 2)];
          newEffects.push({
              id: `s-${Math.random()}`,
              r: centerTile.r,
              c: centerTile.c,
              type: 'score',
              content: `+${matchedTiles.length * 10}`
          });
      }

      setEffects(prev => [...prev, ...newEffects]);

      // Cleanup
      setTimeout(() => {
          setEffects(prev => prev.filter(e => !newEffects.find(ne => ne.id === e.id)));
      }, 800);
  };


  // --- GAME LOGIC ---

  const checkForMatches = (currentBoard: Tile[][]) => {
      const matches = new Set<string>();

      // Horizontal
      for (let r = 0; r < BOARD_SIZE; r++) {
          for (let c = 0; c < BOARD_SIZE - 2; c++) {
              const type = currentBoard[r][c].type;
              if (currentBoard[r][c+1].type === type && currentBoard[r][c+2].type === type) {
                  matches.add(`${r},${c}`);
                  matches.add(`${r},${c+1}`);
                  matches.add(`${r},${c+2}`);
              }
          }
      }

      // Vertical
      for (let c = 0; c < BOARD_SIZE; c++) {
          for (let r = 0; r < BOARD_SIZE - 2; r++) {
              const type = currentBoard[r][c].type;
              if (currentBoard[r+1][c].type === type && currentBoard[r+2][c].type === type) {
                  matches.add(`${r},${c}`);
                  matches.add(`${r+1},${c}`);
                  matches.add(`${r+2},${c}`);
              }
          }
      }
      return matches;
  };

  const processBoard = async (currentBoard: Tile[][], isFirstPass = false) => {
      setIsProcessing(true);
      
      // 1. Check Matches
      const matches = checkForMatches(currentBoard);
      
      if (matches.size === 0) {
          setIsProcessing(false);
          if (movesLeft <= 0 && isFirstPass) {
              setGameOver(true);
              onGameEnd(score);
          }
          return;
      }

      // 2. Spawn Effects First
      const matchedTilesList: Tile[] = [];
      currentBoard.forEach(row => row.forEach(tile => {
          if (matches.has(`${tile.r},${tile.c}`)) matchedTilesList.push(tile);
      }));
      spawnEffects(matchedTilesList);
      audioService.playMeow('happy');
      setScore(prev => prev + matches.size * 10);

      // 3. Mark Matches (Triggers CSS exit animation)
      const matchedBoard = currentBoard.map(row => row.map(tile => {
          if (matches.has(`${tile.r},${tile.c}`)) {
              return { ...tile, isMatched: true };
          }
          return tile;
      }));
      setBoard(matchedBoard);
      
      // Wait for exit animation
      await new Promise(r => setTimeout(r, 400)); 

      // 4. Remove & Drop
      const newBoard: Tile[][] = Array(BOARD_SIZE).fill(null).map(() => []);
      
      for (let c = 0; c < BOARD_SIZE; c++) {
          const remainingTiles = [];
          for (let r = 0; r < BOARD_SIZE; r++) {
              if (!matches.has(`${r},${c}`)) {
                  remainingTiles.push(matchedBoard[r][c]);
              }
          }
          
          const missingCount = BOARD_SIZE - remainingTiles.length;
          for (let i = 0; i < missingCount; i++) {
              newBoard[i][c] = generateTile(i, c);
          }
          
          for (let i = 0; i < remainingTiles.length; i++) {
              newBoard[i + missingCount][c] = {
                  ...remainingTiles[i],
                  r: i + missingCount,
                  c: c,
                  isMatched: false
              };
          }
      }

      setBoard(newBoard);
      audioService.playBoing(); 

      await new Promise(r => setTimeout(r, 300));
      
      // 5. Recursive Check
      processBoard(newBoard);
  };

  const handleTileClick = async (r: number, c: number) => {
      if (isProcessing || gameOver || movesLeft <= 0) return;
      audioService.init();

      if (!selectedTile) {
          setSelectedTile({r, c});
          audioService.playTrill();
          return;
      }

      const { r: r1, c: c1 } = selectedTile;
      
      if (r1 === r && c1 === c) {
          setSelectedTile(null);
          return;
      }

      const dr = Math.abs(r1 - r);
      const dc = Math.abs(c1 - c);
      if (dr + dc !== 1) {
          setSelectedTile({r, c}); 
          audioService.playTrill();
          return;
      }

      // Swap
      const tempBoard = board.map(row => [...row]);
      const tile1 = tempBoard[r1][c1];
      const tile2 = tempBoard[r][c];

      tempBoard[r1][c1] = { ...tile2, r: r1, c: c1 };
      tempBoard[r][c] = { ...tile1, r: r, c: c };
      
      setBoard(tempBoard);
      setSelectedTile(null);
      setIsProcessing(true);

      // Check if valid swap
      const matches = checkForMatches(tempBoard);
      
      if (matches.size > 0) {
          setMovesLeft(prev => prev - 1);
          await processBoard(tempBoard, true);
      } else {
          // Invalid
          audioService.playMeow('grumpy');
          await new Promise(r => setTimeout(r, 300));
          // Revert using simple swap back on state at that moment
          const revertedBoard = board.map(row => [...row]); 
          setBoard(revertedBoard);
          setIsProcessing(false);
      }
  };

  const resetGame = () => {
      setScore(0);
      setMovesLeft(MOVES_LIMIT);
      setGameOver(false);
      setBoard(createBoard());
      setIsProcessing(false);
      setEffects([]);
  };

  const getIcon = (type: TileType) => {
      switch(type) {
          case 'cat': return <Cat className="w-6 h-6 md:w-8 md:h-8 text-white drop-shadow-md" />;
          case 'fish': return <Fish className="w-6 h-6 md:w-8 md:h-8 text-blue-100 drop-shadow-md" />;
          case 'heart': return <Heart className="w-6 h-6 md:w-8 md:h-8 text-pink-100 drop-shadow-md" fill="currentColor" />;
          case 'zap': return <Zap className="w-6 h-6 md:w-8 md:h-8 text-yellow-100 drop-shadow-md" fill="currentColor" />;
          case 'star': return <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-purple-100 drop-shadow-md" />;
      }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in select-none">
       <div className="bg-[#fff0f5] p-3 md:p-6 rounded-3xl shadow-2xl border-4 border-pink-300 max-w-[95vw] w-full md:w-auto flex flex-col items-center relative overflow-hidden">
           
           {/* Header */}
           <div className="flex justify-between w-full items-center mb-4 px-2">
                <h2 className="text-xl md:text-2xl font-bold text-pink-600 flex items-center gap-2">
                    <Cat className="w-8 h-8" /> {t.title}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-pink-200 rounded-full transition-colors">
                    <X className="w-6 h-6 text-pink-600" />
                </button>
           </div>

           {/* Stats Bar */}
           <div className="flex gap-8 mb-4">
               <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-pink-100 flex flex-col items-center">
                   <span className="text-xs text-gray-500 font-bold uppercase">{t.score}</span>
                   <span className="text-2xl font-black text-pink-500">{score}</span>
               </div>
               <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-pink-100 flex flex-col items-center">
                   <span className="text-xs text-gray-500 font-bold uppercase">{t.moves}</span>
                   <span className={`text-2xl font-black ${movesLeft < 5 ? 'text-red-500 animate-pulse' : 'text-blue-500'}`}>
                       {movesLeft}
                   </span>
               </div>
           </div>

           {/* The Board Container */}
           <div className="relative">
                <div className="bg-white p-2 rounded-xl shadow-inner border border-pink-200"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                            gap: '4px'
                        }}
                >
                    {board.map((row, r) => (
                        row.map((tile, c) => {
                            const isSelected = selectedTile?.r === r && selectedTile?.c === c;
                            return (
                                <button
                                    key={tile.id}
                                    onClick={() => handleTileClick(r, c)}
                                    className={`
                                        w-9 h-9 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center
                                        transition-all duration-300 relative
                                        border-b-4 active:border-b-0 active:translate-y-1
                                        ${getColor(tile.type)}
                                        ${isSelected ? 'brightness-125 scale-105 ring-4 ring-white z-10' : 'hover:brightness-110'}
                                        ${tile.isMatched ? 'scale-0 opacity-0 rotate-180' : 'scale-100 opacity-100'}
                                    `}
                                >
                                    {getIcon(tile.type)}
                                </button>
                            );
                        })
                    ))}
                </div>

                {/* EFFECTS LAYER */}
                <div className="absolute inset-0 pointer-events-none overflow-visible">
                    {effects.map(effect => {
                        // Calculate position roughly based on grid
                        // Each cell is approx 3rem + gap
                        const top = `${effect.r * 12.5 + 6}%`; 
                        const left = `${effect.c * 12.5 + 6}%`; 
                        
                        if (effect.type === 'score') {
                            return (
                                <div key={effect.id} 
                                     className="absolute text-2xl font-black text-yellow-400 drop-shadow-md z-20 animate-[floatUp_0.8s_ease-out_forwards]"
                                     style={{ top, left }}
                                >
                                    {effect.content}
                                </div>
                            );
                        }
                        
                        return (
                            <div key={effect.id}
                                 className={`absolute w-3 h-3 rounded-full ${effect.content} z-10`}
                                 style={{ 
                                     top, left,
                                     '--dx': `${effect.dx}px`,
                                     '--dy': `${effect.dy}px`,
                                     animation: `particleExplode 0.6s ease-out forwards`
                                 } as React.CSSProperties}
                            />
                        );
                    })}
                </div>
           </div>

           {/* Game Over Modal Inside */}
           {gameOver && (
               <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center z-50 animate-fade-in">
                    <Trophy className="w-16 h-16 text-yellow-500 mb-4 animate-bounce" />
                    <h2 className="text-3xl font-black text-gray-800 mb-2">{t.game_over}</h2>
                    <p className="text-gray-500 mb-6">{t.final_score}: <span className="text-pink-600 font-bold text-xl">{score}</span></p>
                    
                    <button 
                        onClick={resetGame}
                        className="flex items-center gap-2 bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-pink-600 transition-transform hover:scale-105"
                    >
                        <RefreshCw className="w-5 h-5" /> {t.play_again}
                    </button>
                    <button 
                        onClick={onClose}
                        className="mt-4 text-gray-400 hover:text-gray-600 font-bold text-sm"
                    >
                        {TRANSLATIONS[language].chat.close}
                    </button>
               </div>
           )}

       </div>
       <style>{`
         @keyframes floatUp {
             0% { transform: translateY(0) scale(0.5); opacity: 0; }
             20% { transform: translateY(-10px) scale(1.2); opacity: 1; }
             100% { transform: translateY(-40px) scale(1); opacity: 0; }
         }
         @keyframes particleExplode {
             0% { transform: translate(0,0) scale(1); opacity: 1; }
             100% { transform: translate(var(--dx), var(--dy)) scale(0); opacity: 0; }
         }
       `}</style>
    </div>
  );
};
