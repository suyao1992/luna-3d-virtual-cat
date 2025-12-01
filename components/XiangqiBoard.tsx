

import React, { useState, useEffect, useCallback } from 'react';
import { X, RefreshCw, Trophy, AlertTriangle } from 'lucide-react';
import { Language, TRANSLATIONS } from '../types';
import { audioService } from '../services/audio';

interface XiangqiBoardProps {
  onClose: () => void;
  onGameEnd: (winner: 'user' | 'cat') => void;
  language: Language;
}

// Types for Xiangqi
type Faction = 'red' | 'black'; // Red = User (Bottom), Black = Cat (Top)
type PieceType = 'king' | 'advisor' | 'elephant' | 'horse' | 'rook' | 'cannon' | 'pawn';

interface Piece {
  type: PieceType;
  faction: Faction;
  r: number;
  c: number;
  id: string; // Unique ID for keying
}

interface MoveCoords {
    r: number;
    c: number;
}

const ROWS = 10;
const COLS = 9;

// --- INITIAL BOARD SETUP ---
const createInitialPieces = (): Piece[] => {
  const pieces: Piece[] = [];
  let idCounter = 0;
  const add = (type: PieceType, faction: Faction, r: number, c: number) => {
    pieces.push({ type, faction, r, c, id: `${faction}-${type}-${idCounter++}` });
  };

  // Black (Cat, Top, Rows 0-4)
  add('rook', 'black', 0, 0); add('rook', 'black', 0, 8);
  add('horse', 'black', 0, 1); add('horse', 'black', 0, 7);
  add('elephant', 'black', 0, 2); add('elephant', 'black', 0, 6);
  add('advisor', 'black', 0, 3); add('advisor', 'black', 0, 5);
  add('king', 'black', 0, 4);
  add('cannon', 'black', 2, 1); add('cannon', 'black', 2, 7);
  add('pawn', 'black', 3, 0); add('pawn', 'black', 3, 2); add('pawn', 'black', 3, 4); add('pawn', 'black', 3, 6); add('pawn', 'black', 3, 8);

  // Red (User, Bottom, Rows 5-9)
  add('rook', 'red', 9, 0); add('rook', 'red', 9, 8);
  add('horse', 'red', 9, 1); add('horse', 'red', 9, 7);
  add('elephant', 'red', 9, 2); add('elephant', 'red', 9, 6);
  add('advisor', 'red', 9, 3); add('advisor', 'red', 9, 5);
  add('king', 'red', 9, 4);
  add('cannon', 'red', 7, 1); add('cannon', 'red', 7, 7);
  add('pawn', 'red', 6, 0); add('pawn', 'red', 6, 2); add('pawn', 'red', 6, 4); add('pawn', 'red', 6, 6); add('pawn', 'red', 6, 8);

  return pieces;
};

// --- CHINESE CHARACTERS ---
const PIECE_CHARS: Record<Faction, Record<PieceType, string>> = {
  red: { king: '帅', advisor: '仕', elephant: '相', horse: '马', rook: '车', cannon: '炮', pawn: '兵' },
  black: { king: '将', advisor: '士', elephant: '象', horse: '马', rook: '车', cannon: '炮', pawn: '卒' }
};

export const XiangqiBoard: React.FC<XiangqiBoardProps> = ({ onClose, onGameEnd, language }) => {
  const [pieces, setPieces] = useState<Piece[]>(createInitialPieces());
  const [turn, setTurn] = useState<Faction>('red');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [winner, setWinner] = useState<'user' | 'cat' | null>(null);
  const [catThinking, setCatThinking] = useState(false);
  const [checkAlert, setCheckAlert] = useState<Faction | null>(null);
  
  // Track the start and end of the last move for visualization
  const [lastMove, setLastMove] = useState<{start: MoveCoords, end: MoveCoords} | null>(null);

  const t = TRANSLATIONS[language].xiangqi;

  // --- MOVEMENT RULES ---
  const getPieceAt = useCallback((r: number, c: number, currentPieces: Piece[]) => {
    return currentPieces.find(p => p.r === r && p.c === c);
  }, []);

  const isValidMove = useCallback((piece: Piece, tr: number, tc: number, currentPieces: Piece[]): boolean => {
    // Basic bounds check
    if (tr < 0 || tr >= ROWS || tc < 0 || tc >= COLS) return false;

    // Cannot capture own piece
    const target = getPieceAt(tr, tc, currentPieces);
    if (target && target.faction === piece.faction) return false;

    const dr = tr - piece.r;
    const dc = tc - piece.c;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);

    switch (piece.type) {
      case 'king':
        // Orthogonal, step 1, confined to palace
        if (absDr + absDc !== 1) return false;
        if (tc < 3 || tc > 5) return false; // Palace cols
        if (piece.faction === 'red' && tr < 7) return false; // Red palace rows 7-9
        if (piece.faction === 'black' && tr > 2) return false; // Black palace rows 0-2
        // Flying General rule (kings facing each other without pieces in between) is ignored for simplicity in this version
        return true;

      case 'advisor':
        // Diagonal, step 1, confined to palace
        if (absDr !== 1 || absDc !== 1) return false;
        if (tc < 3 || tc > 5) return false;
        if (piece.faction === 'red' && tr < 7) return false;
        if (piece.faction === 'black' && tr > 2) return false;
        return true;

      case 'elephant':
        // Diagonal, step 2, cannot cross river, blocking eye
        if (absDr !== 2 || absDc !== 2) return false;
        if (piece.faction === 'red' && tr < 5) return false; // Cannot cross to black side
        if (piece.faction === 'black' && tr > 4) return false; // Cannot cross to red side
        // Check eye
        if (getPieceAt(piece.r + dr / 2, piece.c + dc / 2, currentPieces)) return false;
        return true;

      case 'horse':
        // L shape (2+1), check leg
        if (!((absDr === 2 && absDc === 1) || (absDr === 1 && absDc === 2))) return false;
        // Check leg
        if (absDr === 2) {
            // Moving vertical first
            if (getPieceAt(piece.r + (dr > 0 ? 1 : -1), piece.c, currentPieces)) return false;
        } else {
            // Moving horizontal first
            if (getPieceAt(piece.r, piece.c + (dc > 0 ? 1 : -1), currentPieces)) return false;
        }
        return true;

      case 'rook':
        // Orthogonal, straight line, no obstructions
        if (piece.r !== tr && piece.c !== tc) return false;
        const rStep = piece.r === tr ? 0 : (tr > piece.r ? 1 : -1);
        const cStep = piece.c === tc ? 0 : (tc > piece.c ? 1 : -1);
        let currR = piece.r + rStep;
        let currC = piece.c + cStep;
        while (currR !== tr || currC !== tc) {
            if (getPieceAt(currR, currC, currentPieces)) return false; // Obstruction
            currR += rStep;
            currC += cStep;
        }
        return true;

      case 'cannon':
         // Move like rook, but capture needs 1 platform
         if (piece.r !== tr && piece.c !== tc) return false;
         const crStep = piece.r === tr ? 0 : (tr > piece.r ? 1 : -1);
         const ccStep = piece.c === tc ? 0 : (tc > piece.c ? 1 : -1);
         let platforms = 0;
         let checkR = piece.r + crStep;
         let checkC = piece.c + ccStep;
         while (checkR !== tr || checkC !== tc) {
             if (getPieceAt(checkR, checkC, currentPieces)) platforms++;
             checkR += crStep;
             checkC += ccStep;
         }
         if (target) {
             // Capture: need exactly 1 platform
             return platforms === 1;
         } else {
             // Move: need 0 platforms
             return platforms === 0;
         }

      case 'pawn':
        // Forward 1 step. After river, can also move sideways. Cannot move back.
        // Red moves UP (-row), Black moves DOWN (+row)
        const forward = piece.faction === 'red' ? -1 : 1;
        
        // Cannot move back
        if (piece.faction === 'red' && tr > piece.r) return false;
        if (piece.faction === 'black' && tr < piece.r) return false;

        // Step distance
        if (absDr + absDc !== 1) return false;

        // Before river (Red row > 4, Black row < 5)
        const crossedRiver = piece.faction === 'red' ? piece.r <= 4 : piece.r >= 5;
        
        if (!crossedRiver) {
            // Only forward allowed
            if (dc !== 0) return false;
        }
        return true;
    }
  }, [getPieceAt]);

  const executeMove = (p: Piece, r: number, c: number) => {
    // Check if capture
    const target = getPieceAt(r, c, pieces);
    
    // Audio feedback
    audioService.init();
    if (target) {
        audioService.playDigging();
    } else {
        audioService.playEating(); 
    }

    // Record Move
    setLastMove({
        start: { r: p.r, c: p.c },
        end: { r, c }
    });

    // Create new state
    let nextPieces = pieces.filter(pi => pi.id !== p.id); // Remove moving piece from old pos
    if (target) {
        nextPieces = nextPieces.filter(pi => pi.id !== target.id); // Remove captured piece
        if (target.type === 'king') {
            setWinner(p.faction === 'red' ? 'user' : 'cat');
            onGameEnd(p.faction === 'red' ? 'user' : 'cat');
        }
    }
    // Add piece at new pos
    nextPieces.push({ ...p, r, c });
    
    setPieces(nextPieces);
    setSelectedPieceId(null);
    setTurn(turn === 'red' ? 'black' : 'red');
    setCheckAlert(null); // Clear check logic for now (simple implementation)
  };

  // --- AI LOGIC ---
  const getAIAction = useCallback(() => {
    const aiPieces = pieces.filter(p => p.faction === 'black');
    if (aiPieces.length === 0) return;

    let bestMove = { piece: aiPieces[0], r: 0, c: 0, score: -99999 };

    // Simple material values
    const getVal = (type: PieceType) => {
        switch(type) {
            case 'king': return 1000;
            case 'rook': return 90;
            case 'cannon': return 45;
            case 'horse': return 40;
            case 'elephant': return 20;
            case 'advisor': return 20;
            case 'pawn': return 10;
            default: return 0;
        }
    }

    // Iterate all AI pieces
    for (const p of aiPieces) {
        // Try all board positions (optimization: only nearby or logical ones?)
        // For simplicity, just iterate board and check isValid
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (isValidMove(p, r, c, pieces)) {
                    // Evaluate this move
                    let score = 0;
                    const target = getPieceAt(r, c, pieces);
                    if (target) {
                        score += getVal(target.type) * 10; // Capture value
                        if (target.type === 'king') score += 10000;
                    }
                    
                    // Position heuristics (advance towards general area of red king)
                    // Black wants to increase row (move down) generally
                    if (p.type === 'pawn') score += r; 
                    if (p.type === 'horse' || p.type === 'rook') {
                         // Encourage controlling center
                         score += (4 - Math.abs(c - 4));
                    }

                    // Add some randomness
                    score += Math.random() * 5;

                    if (score > bestMove.score) {
                        bestMove = { piece: p, r, c, score };
                    }
                }
            }
        }
    }

    if (bestMove.score > -90000) {
        executeMove(bestMove.piece, bestMove.r, bestMove.c);
    } else {
        // No moves? Stalemate or trapped.
        setTurn('red'); // Skip or game over logic
    }
  }, [pieces, isValidMove]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (turn === 'black' && !winner) {
        setCatThinking(true);
        // Slightly longer delay for clearer pacing
        const timer = setTimeout(() => {
            getAIAction();
            setCatThinking(false);
        }, 1500);
        return () => clearTimeout(timer);
    }
  }, [turn, winner, getAIAction]);

  const handleSquareClick = (r: number, c: number) => {
      if (turn !== 'red' || winner) return;
      audioService.init();

      const clickedPiece = getPieceAt(r, c, pieces);

      // Select own piece
      if (clickedPiece && clickedPiece.faction === 'red') {
          setSelectedPieceId(clickedPiece.id);
          return;
      }

      // Move selected piece
      if (selectedPieceId) {
          const selectedPiece = pieces.find(p => p.id === selectedPieceId);
          if (selectedPiece && isValidMove(selectedPiece, r, c, pieces)) {
              executeMove(selectedPiece, r, c);
          }
      }
  };

  const resetGame = () => {
      setPieces(createInitialPieces());
      setTurn('red');
      setWinner(null);
      setSelectedPieceId(null);
      setLastMove(null);
  };

  // Determine last moved piece's faction for coloring
  const lastMovedPiece = lastMove ? pieces.find(p => p.r === lastMove.end.r && p.c === lastMove.end.c) : null;
  const lastMoveFaction = lastMovedPiece?.faction;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
        <div className="bg-[#eecfa1] p-2 md:p-4 rounded-xl shadow-2xl border-4 border-[#8d6e63] max-w-[98vw] max-h-[95vh] flex flex-col items-center relative select-none">
            
             {/* Header */}
            <div className="flex justify-between w-full items-center mb-2 px-2">
                <h2 className="text-lg md:text-xl font-bold text-[#5d4037] flex items-center gap-2">
                    <span className="text-2xl text-red-700">帅</span> {t.title}
                </h2>
                <button onClick={onClose} className="p-1.5 hover:bg-[#d7ccc8] rounded-full transition-colors">
                    <X className="w-6 h-6 text-[#5d4037]" />
                </button>
            </div>

            {/* Status */}
             <div className="mb-2 h-6 flex items-center justify-center">
                {winner ? (
                    <div className={`px-4 py-1 rounded-full font-bold flex items-center gap-2 animate-bounce ${winner === 'user' ? 'bg-red-100 text-red-700' : 'bg-gray-800 text-white'}`}>
                        <Trophy className="w-4 h-4" /> {winner === 'user' ? t.user_win : t.cat_win}
                    </div>
                ) : (
                    <div className="text-[#5d4037] font-semibold text-sm flex items-center gap-2">
                        {turn === 'red' ? (
                            <span className="text-red-600 flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>{t.user_turn}</span>
                        ) : (
                            <span className="text-black flex items-center gap-1">{t.cat_turn} {catThinking && "..."}</span>
                        )}
                        {checkAlert && <span className="text-orange-600 flex items-center gap-1 ml-2 font-bold"><AlertTriangle className="w-4 h-4"/> {t.check}</span>}
                    </div>
                )}
            </div>

            {/* THE BOARD */}
            <div 
                className="relative bg-[#deb887] shadow-inner border-2 border-[#8d6e63]"
                style={{
                    width: 'min(90vw, 450px)',
                    height: 'min(100vw, 500px)',
                    display: 'grid',
                    gridTemplateRows: `repeat(${ROWS}, 1fr)`,
                    gridTemplateColumns: `repeat(${COLS}, 1fr)`
                }}
            >
                {/* Board Drawing (Grid Lines) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0" viewBox={`0 0 ${COLS*100} ${ROWS*100}`}>
                    <defs>
                        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#8d6e63" strokeWidth="2"/>
                        </pattern>
                    </defs>
                    
                    {/* Background Grid */}
                    {/* Horizontal Lines */}
                    {Array.from({length: ROWS}).map((_, i) => (
                        <line key={`h-${i}`} x1="50" y1={50 + i*100} x2={COLS*100 - 50} y2={50 + i*100} stroke="#5d4037" strokeWidth="2" />
                    ))}
                    {/* Vertical Lines (Split by river) */}
                    {Array.from({length: COLS}).map((_, i) => (
                        <React.Fragment key={`v-${i}`}>
                            {i !== 0 && i !== COLS-1 && (
                                <>
                                <line x1={50 + i*100} y1="50" x2={50 + i*100} y2="450" stroke="#5d4037" strokeWidth="2" />
                                <line x1={50 + i*100} y1="550" x2={50 + i*100} y2="950" stroke="#5d4037" strokeWidth="2" />
                                </>
                            )}
                            {(i === 0 || i === COLS-1) && (
                                <line x1={50 + i*100} y1="50" x2={50 + i*100} y2="950" stroke="#5d4037" strokeWidth="3" />
                            )}
                        </React.Fragment>
                    ))}

                    {/* Palaces (X shapes) */}
                    {/* Top Palace */}
                    <line x1="350" y1="50" x2="550" y2="250" stroke="#5d4037" strokeWidth="2" />
                    <line x1="550" y1="50" x2="350" y2="250" stroke="#5d4037" strokeWidth="2" />
                    {/* Bottom Palace */}
                    <line x1="350" y1="750" x2="550" y2="950" stroke="#5d4037" strokeWidth="2" />
                    <line x1="550" y1="750" x2="350" y2="950" stroke="#5d4037" strokeWidth="2" />

                    {/* River Text */}
                    <text x="250" y="515" fontSize="40" fill="#5d4037" fontFamily="serif" textAnchor="middle" transform="rotate(0 250,500)">楚河</text>
                    <text x="650" y="515" fontSize="40" fill="#5d4037" fontFamily="serif" textAnchor="middle" transform="rotate(180 650,500)">汉界</text>
                </svg>

                {/* Interaction Grid & Pieces */}
                {Array.from({ length: ROWS }).map((_, r) => (
                    Array.from({ length: COLS }).map((_, c) => {
                        const piece = getPieceAt(r, c, pieces);
                        const isSelected = piece && piece.id === selectedPieceId;
                        
                        // Check if this square is part of the last move
                        const isLastMoveStart = lastMove && lastMove.start.r === r && lastMove.start.c === c;
                        const isLastMoveEnd = lastMove && lastMove.end.r === r && lastMove.end.c === c;

                        return (
                            <div 
                                key={`${r}-${c}`} 
                                className="relative flex items-center justify-center z-10"
                                onClick={() => handleSquareClick(r, c)}
                            >
                                {/* Last Move Highlights - Differentiated by Faction */}
                                {isLastMoveStart && (
                                    <div className={`absolute w-[80%] h-[80%] rounded-full animate-pulse ${lastMoveFaction === 'red' ? 'bg-red-500/30' : 'bg-blue-600/30'}`}></div>
                                )}
                                {isLastMoveEnd && (
                                    <div className={`absolute w-[80%] h-[80%] rounded-full border-2 ${lastMoveFaction === 'red' ? 'bg-red-500/20 border-red-500' : 'bg-blue-600/20 border-blue-600'}`}></div>
                                )}

                                {/* Piece Renderer */}
                                {piece && (
                                    <div className={`
                                        w-[85%] h-[85%] rounded-full shadow-md flex items-center justify-center border-2 
                                        transition-transform duration-200 z-10
                                        ${piece.faction === 'red' 
                                            ? 'bg-[#ffebee] border-red-800 text-red-700' 
                                            : 'bg-[#eeeeee] border-black text-black'
                                        }
                                        ${isSelected ? 'scale-110 ring-2 ring-yellow-400 z-20' : ''}
                                        ${!winner && turn === 'red' && piece.faction === 'red' ? 'cursor-pointer hover:brightness-110' : ''}
                                    `}>
                                        {/* Inner Ring */}
                                        <div className={`w-[85%] h-[85%] rounded-full border border-dashed border-opacity-40 flex items-center justify-center ${piece.faction === 'red' ? 'border-red-800' : 'border-black'}`}>
                                            <span className="font-serif font-bold text-lg md:text-2xl select-none leading-none mt-[-2px]">
                                                {PIECE_CHARS[piece.faction][piece.type]}
                                            </span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Move Indicator (if selected piece can move here) */}
                                {selectedPieceId && !piece && isValidMove(pieces.find(p=>p.id===selectedPieceId)!, r, c, pieces) && (
                                    <div className="w-3 h-3 bg-green-500/50 rounded-full animate-pulse pointer-events-none"></div>
                                )}
                                {/* Capture Indicator */}
                                {selectedPieceId && piece && piece.faction === 'black' && isValidMove(pieces.find(p=>p.id===selectedPieceId)!, r, c, pieces) && (
                                    <div className="absolute w-full h-full border-4 border-red-500/50 rounded-full animate-pulse pointer-events-none"></div>
                                )}
                            </div>
                        );
                    })
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
    </div>
  );
};
