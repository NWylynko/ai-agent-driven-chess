"use server"

import type { Board } from "../types/chess";
import { generateText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai'; // Ensure OPENAI_API_KEY environment variable is set
import { z } from "zod"

type Position = { row: number; col: number };

// Convert board coordinates to chess notation
function toChessNotation({ row, col }: Position): string {
  const files = "abcdefgh"; // columns
  const ranks = "87654321"; // rows
  return `${files[col]}${ranks[row]}`;
}

// Utility function to check if a position is within the board
function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Check if a square contains an opponent's piece
function isOpponentPiece(piece: string, targetPiece: string): boolean {
  return targetPiece !== ' ' && targetPiece.toUpperCase() === targetPiece && piece === piece.toLowerCase();
}

// Map piece symbols to names
function getPieceName(piece: string): string {
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
function describeMove(piece: string, from: Position, to: Position, isCapture: boolean): string {
  const pieceName = getPieceName(piece);
  const fromNotation = toChessNotation(from);
  const toNotation = toChessNotation(to);
  return isCapture
    ? `${pieceName} from ${fromNotation} captures on ${toNotation}`
    : `${pieceName} from ${fromNotation} to ${toNotation}`;
}

// Generate possible moves for a black piece
function generateMovesForPiece(piece: string, position: Position, board: Board): string[] {
  const moves: string[] = [];
  const { row, col } = position;

  const addMove = (toRow: number, toCol: number) => {
    if (!isValidPosition(toRow, toCol)) return;
    const targetPiece = board[toRow][toCol];
    const isCapture = isOpponentPiece(piece, targetPiece);
    if (targetPiece === ' ' || isCapture) {
      moves.push(describeMove(piece, position, { row: toRow, col: toCol }, isCapture));
    }
  };

  switch (piece) {
    case 'p': // Pawn
      if (board[row + 1]?.[col] === ' ') addMove(row + 1, col);
      addMove(row + 1, col - 1);
      addMove(row + 1, col + 1);
      break;

    case 'r': // Rook
      for (let i = row + 1; isValidPosition(i, col); i++) { addMove(i, col); if (board[i][col] !== ' ') break; }
      for (let i = row - 1; isValidPosition(i, col); i--) { addMove(i, col); if (board[i][col] !== ' ') break; }
      for (let i = col + 1; isValidPosition(row, i); i++) { addMove(row, i); if (board[row][i] !== ' ') break; }
      for (let i = col - 1; isValidPosition(row, i); i--) { addMove(row, i); if (board[row][i] !== ' ') break; }
      break;

    case 'n': // Knight
      const knightMoves = [
        [2, 1], [2, -1], [-2, 1], [-2, -1],
        [1, 2], [1, -2], [-1, 2], [-1, -2]
      ];
      knightMoves.forEach(([dx, dy]) => addMove(row + dx, col + dy));
      break;

    case 'b': // Bishop
      for (let i = 1; isValidPosition(row + i, col + i); i++) { addMove(row + i, col + i); if (board[row + i][col + i] !== ' ') break; }
      for (let i = 1; isValidPosition(row + i, col - i); i++) { addMove(row + i, col - i); if (board[row + i][col - i] !== ' ') break; }
      for (let i = 1; isValidPosition(row - i, col + i); i++) { addMove(row - i, col + i); if (board[row - i][col + i] !== ' ') break; }
      for (let i = 1; isValidPosition(row - i, col - i); i++) { addMove(row - i, col - i); if (board[row - i][col - i] !== ' ') break; }
      break;

    case 'q': // Queen
      moves.push(...generateMovesForPiece('r', position, board));
      moves.push(...generateMovesForPiece('b', position, board));
      break;

    case 'k': // King
      const kingMoves = [
        [1, 0], [0, 1], [-1, 0], [0, -1],
        [1, 1], [1, -1], [-1, 1], [-1, -1]
      ];
      kingMoves.forEach(([dx, dy]) => addMove(row + dx, col + dy));
      break;
  }

  return moves;
}

// Main function to generate all moves for black
export async function generateAIMove(board: Board) {
  const possibleMoves: string[] = [];

  board.forEach((row, rowIdx) => {
    row.forEach((piece, colIdx) => {
      if (piece === ' ' || piece.toUpperCase() === piece) return; // Skip empty or white pieces

      const moves = generateMovesForPiece(piece, { row: rowIdx, col: colIdx }, board);
      possibleMoves.push(...moves);
    });
  });

  console.log(board)
  console.log(possibleMoves);

  const result = await backup_openai_gpt_choice(board);

  // console.log(result)

  const response = await fetch(`http://172.20.10.3:5000/weav`, {
    method: "POST",
    body: JSON.stringify({ board, possibleMoves }),
    headers: {
      "Content-Type": "application/json"
    }
  })
  const data = await response.text();

  console.log(data)

  return result
}

async function backup_openai_gpt_choice(board: Board) {
  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      from: z.object({
        row: z.number(),
        col: z.number()
      }),
      to: z.object({
        row: z.number(),
        col: z.number()
      }),
      reason: z.string()
    }),
    prompt: `Given the following chess board and possible moves for black, choose the best move for black:\n\n${board}`,
  });

  return result.object
}