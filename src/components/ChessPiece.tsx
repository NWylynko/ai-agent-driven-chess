import React from 'react';

const pieceUnicode: { [key: string]: string } = {
  'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',  // white pieces
  'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'   // black pieces
};

interface ChessPieceProps {
  piece: string;
  isLightSquare: boolean;
}

export function ChessPiece({ piece, isLightSquare }: ChessPieceProps) {
  if (!piece) return null;
  
  const isWhite = piece === piece.toUpperCase();
  
  return (
    <div 
      className={`
        text-4xl select-none
        ${isWhite 
          ? 'text-slate-200 drop-shadow-[0_2px_1px_rgba(0,0,0,0.5)]' 
          : 'text-slate-900 drop-shadow-[0_2px_1px_rgba(255,255,255,0.25)]'
        }
        ${isLightSquare && isWhite ? 'drop-shadow-[0_2px_1px_rgba(0,0,0,0.7)]' : ''}
      `}
    >
      {pieceUnicode[piece]}
    </div>
  );
}