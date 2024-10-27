import React, { useState, useMemo } from 'react';
import { ChessPiece } from './ChessPiece';
import { MoveIndicator } from './MoveIndicator';
import { isPathClear } from '../utils/chessUtils';
import type { Board, Player, Position } from '../types/chess';

const initialBoard: Board = [
  ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'],
  ['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'],
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
  Array(8).fill(''),
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
    
    // Can't capture your own piece
    if (board[toRow][toCol]) {
      const targetPiece = board[toRow][toCol];
      const isTargetWhite = targetPiece === targetPiece.toUpperCase();
      if (isWhitePiece === isTargetWhite) return false;
    }

    const pieceType = piece.toLowerCase();
    let validBasicMove = false;
    
    switch (pieceType) {
      case 'p': {
        const direction = isWhitePiece ? -1 : 1;
        const startRow = isWhitePiece ? 6 : 1;
        
        if (fromCol === toCol && !board[toRow][toCol]) {
          if (toRow === fromRow + direction) {
            validBasicMove = true;
          } else if (
            fromRow === startRow && 
            toRow === fromRow + 2 * direction && 
            !board[fromRow + direction][fromCol]
          ) {
            validBasicMove = true;
          }
        } else if (
          Math.abs(fromCol - toCol) === 1 && 
          toRow === fromRow + direction && 
          board[toRow][toCol]
        ) {
          validBasicMove = true;
        }
        break;
      }

      case 'r':
        validBasicMove = fromRow === toRow || fromCol === toCol;
        break;

      case 'n': {
        const rowDiff = Math.abs(toRow - fromRow);
        const colDiff = Math.abs(toCol - fromCol);
        validBasicMove = (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
        break;
      }

      case 'b':
        validBasicMove = Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol);
        break;

      case 'q':
        validBasicMove = 
          fromRow === toRow || 
          fromCol === toCol || 
          Math.abs(toRow - fromRow) === Math.abs(toCol - fromCol);
        break;

      case 'k':
        validBasicMove = Math.abs(toRow - fromRow) <= 1 && Math.abs(toCol - fromCol) <= 1;
        break;
    }

    return validBasicMove && isPathClear(board, fromRow, fromCol, toRow, toCol, pieceType);
  };

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

  const handleSquareClick = (row: number, col: number) => {
    if (!selectedPiece) {
      const piece = board[row][col];
      if (!piece) return;
      
      const isWhitePiece = piece === piece.toUpperCase();
      if ((currentPlayer === 'white' && !isWhitePiece) || (currentPlayer === 'black' && isWhitePiece)) return;
      
      setSelectedPiece({ row, col });
    } else {
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        const newBoard = board.map(row => [...row]);
        const piece = newBoard[selectedPiece.row][selectedPiece.col];
        newBoard[row][col] = piece;
        newBoard[selectedPiece.row][selectedPiece.col] = '';
        
        const move = `${piece}${String.fromCharCode(97 + selectedPiece.col)}${8 - selectedPiece.row} → ${String.fromCharCode(97 + col)}${8 - row}`;
        setMoveHistory([...moveHistory, move]);
        
        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');
      }
      setSelectedPiece(null);
    }
  };

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
                    <MoveIndicator isCapture={!!board[rowIndex][colIndex]} />
                  )}
                  <ChessPiece piece={piece} isLightSquare={isLight} />
                </div>
              );
            })
          ))}
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px]">
        <h2 className="text-xl font-bold mb-4 text-slate-800">Move History</h2>
        <div className="max-h-[400px] overflow-y-auto">
          {moveHistory.map((move, index) => (
            <div key={index} className="py-1 border-b text-slate-700">
              {index + 1}. {move}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}