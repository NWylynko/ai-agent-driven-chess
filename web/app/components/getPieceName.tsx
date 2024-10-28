import type { Position } from "./generateAIMove";

// Convert board coordinates to chess notation
export function toChessNotation({ row, col }: Position): string {
  const files = "abcdefgh"; // columns
  const ranks = "87654321"; // rows
  return `${files[col]}${ranks[row]}`;
}
// Map piece symbols to names
export function getPieceName(piece: string): string {
  switch (piece.toLowerCase()) {
    case 'p': return "Pawn";
    case 'r': return "Rook";
    case 'n': return "Knight";
    case 'b': return "Bishop";
    case 'q': return "Queen";
    case 'k': return "King";
    default: return "";
  }
}

// Generate human-readable description of a move
export function describeMove(piece: string, from: Position, to: Position, isCapture: boolean): string {
  const pieceName = getPieceName(piece);
  const fromNotation = toChessNotation(from);
  const toNotation = toChessNotation(to);
  return isCapture
    ? `${pieceName} from ${fromNotation} on ${toNotation}`
    : `${pieceName} from ${fromNotation} to ${toNotation}`;
}