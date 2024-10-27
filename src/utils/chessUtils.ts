import { Board } from '../types/chess';

export const isPathClear = (
  board: Board,
  fromRow: number,
  fromCol: number,
  toRow: number,
  toCol: number,
  pieceType: string
): boolean => {
  // Knights can jump over pieces
  if (pieceType.toLowerCase() === 'n') return true;

  const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
  const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;

  // Check all squares between start and end (exclusive)
  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol] !== '') {
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }

  return true;
};