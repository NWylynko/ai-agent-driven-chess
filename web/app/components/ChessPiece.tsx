
const pieceUnicode: { [key: string]: string } = {
  // white pieces
  'K': '♔', 
  'Q': '♕', 
  'R': '♖', 
  'B': '♗', 
  'N': '♘', 
  'P': '♙', 
  // black pieces
  'k': '♚', 
  'q': '♛', 
  'r': '♜', 
  'b': '♝', 
  'n': '♞', 
  // 'p': '♟'
  'p': '♙'
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
        text-6xl select-none
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