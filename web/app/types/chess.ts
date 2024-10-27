export type Board = ("r" | "n" | "b" | "q" | "k" | "p" | "R" | "N" | "B" | "Q" | "K" | "P" | " ")[][];
export type Player = 'white' | 'black';
export type Position = { row: number; col: number };