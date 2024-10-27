import { useMemo, useState, useEffect } from 'react';
import type { Board, Player, Position } from '../types/chess';
import { isPathClear } from '../utils/chessUtils';
import { ChessPiece } from './ChessPiece';
import { MoveIndicator } from './MoveIndicator';

// Dummy function for AI move generation
async function generateAIMove(_board: Board): Promise<{ from: Position; to: Position }> {
  // Here you would replace this with actual AI logic
  // For example, call a minimax function or a backend API for the move

  console.log(_board)

  return {
    from: { row: 1, col: 0 }, // Example move
    to: { row: 3, col: 0 },   // Example move
  };
}

const initialBoard: Board = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  Array(8).fill(' '),
  Array(8).fill(' '),
  Array(8).fill(' '),
  Array(8).fill(' '),
  ['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'],
  ['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R']
];

export function ChessBoard() {
  const [board, setBoard] = useState<Board>(initialBoard);
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player>('white');
  const [moveHistory, setMoveHistory] = useState<string[]>([]);

  const isValidMove = (fromRow: number, fromCol: number, toRow: number, toCol: number): boolean => {
    const piece = board[fromRow][fromCol];
    const isWhitePiece = piece === piece.toUpperCase();
  
    // Check if the destination square is empty or has an opponent's piece
    const targetPiece = board[toRow][toCol];
    if (targetPiece !== " " && isWhitePiece === (targetPiece === targetPiece.toUpperCase())) return false;
  
    const pieceType = piece.toLowerCase();
    let validBasicMove = false;
  
    switch (pieceType) {
      case 'p': {
        const direction = isWhitePiece ? -1 : 1;
        const startRow = isWhitePiece ? 6 : 1;
  
        // Move forward to an empty square
        if (fromCol === toCol && board[toRow][toCol] === " ") {
          if (toRow === fromRow + direction) {
            validBasicMove = true;
          } else if (
            fromRow === startRow && 
            toRow === fromRow + 2 * direction && 
            board[fromRow + direction][fromCol] === " "
          ) {
            validBasicMove = true;
          }
        }
        // Diagonal capture
        else if (
          Math.abs(fromCol - toCol) === 1 &&
          toRow === fromRow + direction &&
          board[toRow][toCol] !== " "
        ) {
          validBasicMove = true;
        }
        break;
      }
      // Other piece types remain the same, no change needed for rook, knight, etc.
    }
    return validBasicMove && isPathClear(board, fromRow, fromCol, toRow, toCol, pieceType);
  };


  // Generates all valid moves for the selected piece
  const validMoves = useMemo(() => {
    if (!selectedPiece) return new Set<string>();

    const moves = new Set<string>();
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
          moves.add(`${row},${col}`);
        }
      }
    }
    return moves;
  }, [selectedPiece, board]);

  // Handles square clicks for user moves
  const handleSquareClick = (row: number, col: number) => {
    if (currentPlayer === 'black') return; // Prevent user from moving on black's turn
    
    if (!selectedPiece) {
      const piece = board[row][col];
      if (!piece) return;

      const isWhitePiece = piece === piece.toUpperCase();
      if (currentPlayer === 'white' && !isWhitePiece) return;

      setSelectedPiece({ row, col });
    } else {
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        makeMove(selectedPiece, { row, col });
      }
      setSelectedPiece(null);
    }
  };
  
  // makeMove function, updating to set empty squares as " "
  const makeMove = (from: Position, to: Position) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = " "; // Set the old position to " "
  
    const move = `${piece}${String.fromCharCode(97 + from.col)}${8 - from.row} → ${String.fromCharCode(97 + to.col)}${8 - to.row}`;
    setMoveHistory([...moveHistory, move]);
  
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
  };

  // Handles AI's move on black's turn
  useEffect(() => {
    const makeAIMove = async () => {
      const aiMove = await generateAIMove(board);
      makeMove(aiMove.from, aiMove.to);
    };

    if (currentPlayer === 'black') {
      makeAIMove();
    }
  }, [currentPlayer]);

  return (
    <div className="flex flex-col md:flex-row items-start gap-8 p-4">
      <div className="flex flex-col items-center">
        <div className="text-xl font-semibold mb-4 text-slate-800">
          {currentPlayer === 'white' ? "White's Turn" : "Black's Turn"}
        </div>
        <div className="grid grid-cols-8 gap-0 bg-slate-800 p-2 rounded-lg shadow-xl">
          {board.map((row, rowIndex) => (
            row.map((piece, colIndex) => {
              const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
              const isLight = (rowIndex + colIndex) % 2 === 0;
              const isValidMoveSquare = validMoves.has(`${rowIndex},${colIndex}`);
              
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`
                    relative w-16 h-16 flex items-center justify-center
                    ${isLight ? 'bg-amber-50' : 'bg-indigo-700'}
                    ${isSelected ? 'ring-4 ring-yellow-400' : ''}
                    transition-all duration-200 hover:opacity-90 cursor-pointer
                  `}
                  onClick={() => handleSquareClick(rowIndex, colIndex)}
                >
                  {isValidMoveSquare && (
                    <MoveIndicator isCapture={board[rowIndex][colIndex] !== " "} />
                  )}
                  <ChessPiece piece={piece} isLightSquare={isLight} />
                </div>
              );
            })
          ))}
        </div>
      </div>
      
      <div className="flex flex-col items-center">
        <div className="text-xl font-semibold mb-4 text-slate-800">
          Move History
        </div>
        <div className="max-h-[400px] min-w-[200px] overflow-y-auto">
          {moveHistory.map((move, index) => (
            <div key={index} className="py-1 text-slate-700">
              {index + 1}. {move}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}