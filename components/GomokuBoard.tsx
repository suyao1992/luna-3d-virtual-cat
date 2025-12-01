

import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Trophy } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';

interface GomokuBoardProps {
  onClose: () => void;
  onGameEnd: (winner: 'user' | 'cat') => void;
  language: Language;
}

type Player = 'user' | 'cat' | null;
const BOARD_SIZE = 15;

export const GomokuBoard: React.FC<GomokuBoardProps> = ({ onClose, onGameEnd, language }) => {
  const [board, setBoard] = useState<Player[][]>(
    Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null))
  );
  const [currentPlayer, setCurrentPlayer] = useState<'user' | 'cat'>('user');
  const [winner, setWinner] = useState<Player>(null);
  const [catThinking, setCatThinking] = useState(false);
  
  const t = TRANSLATIONS[language].gomoku;

  // --- GAME LOGIC ---

  const checkWin = (boardState: Player[][], r: number, c: number, player: Player) => {
    const directions = [
      [0, 1],  // Horizontal
      [1, 0],  // Vertical
      [1, 1],  // Diagonal \
      [1, -1]  // Diagonal /
    ];

    for (const [dr, dc] of directions) {
      let count = 1;
      // Check forward
      for (let i = 1; i < 5; i++) {
        const nr = r + dr * i;
        const nc = c + dc * i;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && boardState[nr][nc] === player) {
          count++;
        } else break;
      }
      // Check backward
      for (let i = 1; i < 5; i++) {
        const nr = r - dr * i;
        const nc = c - dc * i;
        if (nr >= 0 && nr < BOARD_SIZE && nc >= 0 && nc < BOARD_SIZE && boardState[nr][nc] === player) {
          count++;
        } else break;
      }
      if (count >= 5) return true;
    }
    return false;
  };

  const getBestMove = useCallback((currentBoard: Player[][]) => {
    let bestScore = -Infinity;
    let bestMove = { r: 7, c: 7 }; // Default center
    
    // Heuristic scoring
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (currentBoard[r][c] === null) {
          let score = 0;
          
          // Directions to check
          const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
          
          for (const [dr, dc] of dirs) {
            // Check for Cat (Attack) and User (Defend)
            for (const type of ['cat', 'user']) {
              let streak = 0;
              let blocked = 0;
              
              // Look forward
              for (let i = 1; i < 5; i++) {
                const nr = r + dr * i;
                const nc = c + dc * i;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) { blocked++; break; }
                if (currentBoard[nr][nc] === type) streak++;
                else if (currentBoard[nr][nc] !== null) { blocked++; break; }
                else break;
              }
               // Look backward
               for (let i = 1; i < 5; i++) {
                const nr = r - dr * i;
                const nc = c - dc * i;
                if (nr < 0 || nr >= BOARD_SIZE || nc < 0 || nc >= BOARD_SIZE) { blocked++; break; }
                if (currentBoard[nr][nc] === type) streak++;
                else if (currentBoard[nr][nc] !== null) { blocked++; break; }
                else break;
              }

              // Scoring weights
              const isAttack = type === 'cat';
              const base = isAttack ? 1.2 : 1.0; // Slightly favor attack

              if (streak >= 4) score += 10000 * base; // Win or critical block
              else if (streak === 3 && blocked === 0) score += 1000 * base; // Open 3
              else if (streak === 3 && blocked === 1) score += 100 * base;
              else if (streak === 2 && blocked === 0) score += 50 * base;
              else if (streak === 1) score += 10 * base;
            }
          }
          
          // Prefer center slightly
          const distToCenter = Math.abs(r - 7) + Math.abs(c - 7);
          score -= distToCenter;

          // Random noise to make it less robotic
          score += Math.random() * 5;

          if (score > bestScore) {
            bestScore = score;
            bestMove = { r, c };
          }
        }
      }
    }
    return bestMove;
  }, []);

  // --- CAT AI TURN ---
  useEffect(() => {
    if (currentPlayer === 'cat' && !winner) {
      setCatThinking(true);
      const timer = setTimeout(() => {
        const move = getBestMove(board);
        handleMove(move.r, move.c);
        setCatThinking(false);
      }, 1000); // 1s delay for "thinking"
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, winner, board, getBestMove]);

  const handleMove = (r: number, c: number) => {
    if (board[r][c] || winner) return;

    const newBoard = board.map(row => [...row]);
    newBoard[r][c] = currentPlayer;
    setBoard(newBoard);

    if (checkWin(newBoard, r, c, currentPlayer)) {
      setWinner(currentPlayer);
      onGameEnd(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === 'user' ? 'cat' : 'user');
    }
  };

  const resetGame = () => {
    setBoard(Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null)));
    setWinner(null);
    setCurrentPlayer('user');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fdf6e3] p-4 md:p-6 rounded-3xl shadow-2xl border-4 border-[#d4a373] max-w-[95vw] max-h-[90vh] flex flex-col items-center relative">
        
        {/* Header */}
        <div className="flex justify-between w-full items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-[#5d4037] flex items-center gap-2">
                <span className="text-2xl">♟️</span> {t.title}
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-[#ebd5b3] rounded-full transition-colors">
                <X className="w-6 h-6 text-[#8d6e63]" />
            </button>
        </div>

        {/* Status */}
        <div className="mb-4 h-8 flex items-center justify-center">
            {winner ? (
                <div className={`px-4 py-1 rounded-full font-bold flex items-center gap-2 animate-bounce ${winner === 'user' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                    <Trophy className="w-4 h-4" /> {winner === 'user' ? t.user_win : t.cat_win}
                </div>
            ) : (
                <div className="text-[#5d4037] font-semibold text-sm flex items-center gap-2">
                   {currentPlayer === 'user' ? (
                       <span className="text-blue-600">{t.user_turn}</span>
                   ) : (
                       <span className="text-orange-600 flex items-center gap-2">
                           {t.cat_turn} {catThinking && <span className="animate-pulse">🐾</span>}
                       </span>
                   )}
                </div>
            )}
        </div>

        {/* Board */}
        <div 
            className="bg-[#deb887] p-1 md:p-3 rounded-lg shadow-inner relative select-none"
            style={{ 
                display: 'grid', 
                gridTemplateColumns: `repeat(${BOARD_SIZE}, 1fr)`,
                gap: '1px'
            }}
        >
            {board.map((row, r) => (
                row.map((cell, c) => (
                    <button
                        key={`${r}-${c}`}
                        onClick={() => currentPlayer === 'user' && !winner && handleMove(r, c)}
                        disabled={!!cell || currentPlayer === 'cat' || !!winner}
                        className="w-5 h-5 md:w-8 md:h-8 relative flex items-center justify-center hover:bg-[#d4a373]/50 focus:outline-none"
                        style={{ boxShadow: 'inset 0 0 2px rgba(0,0,0,0.1)' }}
                    >
                        {/* Grid Lines */}
                        <div className="absolute inset-0 z-0 pointer-events-none">
                            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-[#8b5a2b]"></div>
                            <div className="absolute left-1/2 top-0 h-full w-[1px] bg-[#8b5a2b]"></div>
                            {/* Dots for board reference points (3,3), (11,11), etc */}
                            {((r === 3 || r === 7 || r === 11) && (c === 3 || c === 7 || c === 11)) && (
                                <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-[#5d4037] rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                            )}
                        </div>

                        {/* Pieces */}
                        {cell === 'user' && (
                            <div className="w-[80%] h-[80%] bg-gray-900 rounded-full shadow-lg z-10 transform scale-0 animate-[pop_0.2s_ease-out_forwards]">
                                <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-white/20 rounded-full"></div>
                            </div>
                        )}
                        {cell === 'cat' && (
                            <div className="w-[80%] h-[80%] bg-white border border-gray-300 rounded-full shadow-lg z-10 transform scale-0 animate-[pop_0.2s_ease-out_forwards]">
                                 <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] bg-white rounded-full blur-[1px]"></div>
                            </div>
                        )}
                    </button>
                ))
            ))}
        </div>

        {/* Footer */}
        {winner && (
            <button 
                onClick={resetGame}
                className="mt-4 flex items-center gap-2 bg-[#8d6e63] text-white px-6 py-2 rounded-xl hover:bg-[#795548] transition-all active:scale-95 shadow-lg"
            >
                <RefreshCw className="w-5 h-5" /> {t.play_again}
            </button>
        )}
        
      </div>
      <style>{`
        @keyframes pop {
            0% { transform: scale(0); opacity: 0; }
            70% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};