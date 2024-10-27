"use server"

import { db } from "../db";
import { chessBoard } from "../db/schema";
import type { Board } from "./types/chess"

export const recordGameBoard = async (gameId: string, board: Board) => {
  await db
    .insert(chessBoard)
    .values({
      gameId,
      board,
    })
}