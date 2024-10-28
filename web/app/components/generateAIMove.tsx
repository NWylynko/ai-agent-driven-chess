"use server"

import type { Board } from "../types/chess";
import { generateText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai'; // Ensure OPENAI_API_KEY environment variable is set
import { z } from "zod"
import { describeMove } from "./getPieceName";

export type Position = { row: number; col: number };

// Utility function to check if a position is within the board
function isValidPosition(row: number, col: number): boolean {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
}

// Check if a square contains an opponent's piece
function isOpponentPiece(piece: string, targetPiece: string): boolean {
  return targetPiece !== ' ' && targetPiece.toUpperCase() === targetPiece && piece === piece.toLowerCase();
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

  const result = await backup_openai_gpt_choice(board, possibleMoves);

  console.log(result)

  // const response = await fetch(`http://172.20.10.3:5000/weav`, {
  //   method: "POST",
  //   body: JSON.stringify({ board, possibleMoves }),
  //   headers: {
  //     "Content-Type": "application/json"
  //   }
  // })
  // const data = await response.text();

  // console.log(data)

  return result
}

async function backup_openai_gpt_choice(board: Board, possibleMoves: string[]) {
  // const result = await generateObject({
  //   model: openai('gpt-4o'),
  //   schema: z.object({
  //     from: z.object({
  //       row: z.number(),
  //       col: z.number()
  //     }),
  //     to: z.object({
  //       row: z.number(),
  //       col: z.number()
  //     }),
  //     reason: z.string()
  //   }),
  //   prompt: `Given the following chess board and possible moves for black, choose the best move for black:\n\n${board} \n\n possible moves: ${possibleMoves.join(", ")}\n\n`,
  // });

  // console.log(result.object)

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      move: z.string(),
      reason: z.string()
    }),
    prompt: `Given the following chess board and possible moves for black, choose the best move for black. Take into consideration the following: potential threats resulting from the new position formed after the move, potential benefits, and how the opponent might respond. Reply only with the legal move as listed in the 'legal moves'. Here is the game state:\n\n${board} \n\n legal moves: ${possibleMoves.join(", ")}\n\n`,
  
    system: `
    You are an AI chess player. Your task is to play chess by evaluating the current state of the board and making the best possible move from a given list of legal moves. You will be provided with the board in the following format:
    
    - An 8x8 array where each element represents a square on the chessboard.
    - Capital letters indicate White pieces, and lowercase letters indicate Black pieces:
      - 'R'/'r': Rook
      - 'N'/'n': Knight
      - 'B'/'b': Bishop
      - 'Q'/'q': Queen
      - 'K'/'k': King
      - 'P'/'p': Pawn
      - ' ': Empty square
    
    You will also receive a list of possible moves in standard chess notation. Your task is to:
    1. Evaluate the current board position and consider material balance, piece activity, king safety, control of the center, and potential tactics.
    2. Choose the move from the list of possible moves that maximizes advantage or minimizes disadvantage.
    3. Explain your reasoning behind the move selection, considering the strategic and tactical implications.
    
    Make sure your choices are logically sound, aiming to make moves that genuinely improve your position or put pressure on the opponent. Adjust your strategy based on the phase of the game (opening, middle, endgame) to choose the most appropriate moves.
    `
  
  
  });

  console.log(result.object)

  const [_1,_2,from,_3,to] = result.object.move.split(" ");

  const fromRow = 8 - parseInt(from[1]);
  const fromCol = from.charCodeAt(0) - 97;

  const toRow = 8 - parseInt(to[1]);
  const toCol = to.charCodeAt(0) - 97;

  return {
    reason: result.object.reason,
    from: { row: fromRow, col: fromCol },
    to: { row: toRow, col: toCol }
  }

  // return result.object
}


export async function evaluate_players_move(board: Board, moveMade: string) {

  const result = await generateObject({
    model: openai('gpt-4o'),
    schema: z.object({
      analysis: z.string()
    }),
    prompt: `Given the following chess board and the move made by the player, evaluate the move and provide a reason for the evaluation. Here is the game state:\n\n${board} \n\n move made: ${moveMade}\n\n`,
  
    system: `You are an AI chess player.`
  
  
  });

  return(result.object)

}