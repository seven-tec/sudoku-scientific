// shared/types.ts

export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type Difficulty = 'Zen' | 'Focus' | 'Master';

export interface Cell {
  id: number;           // Índice único de 0 a 80
  value: Digit | null;  // Valor actual de la celda
  isInitial: boolean;   // True si es un número dado por el sistema (inmutable para el usuario)
  candidates: Digit[];  // Notas manuales o automáticas del usuario
  error: boolean;       // Estado de validación lógica
}

export interface SudokuState {
  board: Cell[];
  difficulty: Difficulty;
  isPaused: boolean;
  elapsedTime: number;  // Tiempo en segundos para medir el estado de Flow
  moves: number;        // Número de toques o intentos
  seed: string;         // Semilla aleatoria para reproducir la misma partida
  hintsRemaining: number;
  lastHintId: number | null; // ID de la última celda que recibió una pista para feedback visual
  bestStats: Record<Difficulty, { score: number; moves: number; time: number } | null>;
}
