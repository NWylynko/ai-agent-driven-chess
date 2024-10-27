import { useMemo, useState, useEffect, Fragment, useRef } from 'react';
import type { Board, Player, Position } from '../types/chess';
import { isPathClear } from '../utils/chessUtils';
import { ChessPiece } from './ChessPiece';
import { MoveIndicator } from './MoveIndicator';
import { generateAIMove } from './generateAIMove';
import { recordGameBoard } from '../actions';

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
  const [moveHistory, setMoveHistory] = useState<{
    from: string;
    to: string;
    reason: string | null;
  }[]>([]);
  const [gameId] = useState<string>(crypto.randomUUID());

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
      case 'r': { // Rook
        // Moves in straight lines only (rows or columns)
        if (fromRow === toRow || fromCol === toCol) {
          validBasicMove = isPathClear(board, fromRow, fromCol, toRow, toCol, 'r');
        }
        break;
      }
      case 'n': { // Knight
        // Moves in L-shapes: two squares in one direction and one in the perpendicular
        const rowDiff = Math.abs(fromRow - toRow);
        const colDiff = Math.abs(fromCol - toCol);
        if ((rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2)) {
          validBasicMove = true;
        }
        break;
      }
      case 'b': { // Bishop
        // Moves diagonally
        if (Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)) {
          validBasicMove = isPathClear(board, fromRow, fromCol, toRow, toCol, 'b');
        }
        break;
      }
      case 'q': { // Queen
        // Combines rook and bishop moves (straight lines and diagonals)
        if (
          fromRow === toRow || fromCol === toCol || 
          Math.abs(fromRow - toRow) === Math.abs(fromCol - toCol)
        ) {
          validBasicMove = isPathClear(board, fromRow, fromCol, toRow, toCol, 'q');
        }
        break;
      }
      case 'k': { // King
        // Moves one square in any direction
        if (
          Math.abs(fromRow - toRow) <= 1 &&
          Math.abs(fromCol - toCol) <= 1
        ) {
          validBasicMove = true;
        }
        break;
      }
      default:
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
    if (currentPlayer === 'black') return; // Prevent user from moving on black's turn
    
    if (!selectedPiece) {
      const piece = board[row][col];
      if (!piece) return;

      const isWhitePiece = piece === piece.toUpperCase();
      if (currentPlayer === 'white' && !isWhitePiece) return;

      if (piece === " ") return; // don't allow selecting whitespace

      setSelectedPiece({ row, col });
    } else {
      if (isValidMove(selectedPiece.row, selectedPiece.col, row, col)) {
        makeMove(selectedPiece, { row, col }, null);
      }
      setSelectedPiece(null);
    }
  };

  const makeMove = (from: Position, to: Position, reason: string | null) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[from.row][from.col];
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = " ";

    const move = {
      from: `${piece}${String.fromCharCode(97 + from.col)}${8 - from.row}`,
      to: `${String.fromCharCode(97 + to.col)}${8 - to.row}`,
      reason
    }
    setMoveHistory([...moveHistory, move]);
  
    setBoard(newBoard);
    setCurrentPlayer(currentPlayer === 'white' ? 'black' : 'white');

    void recordGameBoard(gameId, newBoard)
  };

  useEffect(() => {
    const makeAIMove = async () => {
      const aiMove = await generateAIMove(board);
      makeMove(aiMove.from, aiMove.to, aiMove.reason);
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
        <div className="relative">
          <div className="grid grid-cols-[auto_repeat(8,_1fr)_auto]">
            <div />
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="w-16 h-6 flex items-center justify-center text-slate-800">
                {String.fromCharCode(97 + i)}
              </div>
            ))}
            <div />
            {board.map((row, rowIndex) => (
              <Fragment key={rowIndex}>
                <div className="flex items-center justify-center w-6 text-slate-800">
                  {8 - rowIndex}
                </div>
                {row.map((piece, colIndex) => {
                  const isSelected = selectedPiece?.row === rowIndex && selectedPiece?.col === colIndex;
                  const isLight = (rowIndex + colIndex) % 2 === 0;
                  const isValidMoveSquare = validMoves.has(`${rowIndex},${colIndex}`);
                
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        relative w-16 h-16 flex items-center justify-center
                        ${isLight ? 'bg-zinc-50' : 'bg-indigo-400'}
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
                })}
                <div className="flex items-center justify-center w-6 text-slate-800">
                  {8 - rowIndex}
                </div>
              </Fragment>
            ))}
            <div />
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="w-16 h-6 flex items-center justify-center text-slate-800">
                {String.fromCharCode(97 + i)}
              </div>
            ))}
            <div />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center max-w-[300px]">
        <div className="text-xl font-semibold mb-4 text-slate-800">
          Move History
        </div>
        <div className="max-h-[600px] min-w-[200px] overflow-y-auto">
          {moveHistory.map((move, index) => (
            <MoveHistory key={index}  move={move} index={index} />
          ))}
        </div>
      </div>
    </div>
  );
}

type MoveHistoryProps = {
  move: {
    from: string;
    to: string;
    reason: string | null;
  };
  index: number;
};

const MoveHistory = (props: MoveHistoryProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div ref={ref} className="py-1 text-slate-700">
      <div>
        {props.index + 1}. {props.move.from} → {props.move.to}
      </div>
      <span className="text-sm italic text-slate-500">{props.move.reason}</span>
    </div>
  )
}