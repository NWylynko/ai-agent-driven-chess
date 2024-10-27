import { json, pgTable, serial, uuid } from "drizzle-orm/pg-core";

export const chessBoard = pgTable(
  "chessBoard",
  {
    chessBoardId: serial("chessBoardId").primaryKey(),
    gameId: uuid("gameId"),
    board: json("board"),
  }
);