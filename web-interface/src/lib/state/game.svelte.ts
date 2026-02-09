// web-interface/src/lib/state/game.svelte.ts
import type { SudokuState, Difficulty } from '../../../../shared/types';
// Importamos el WASM generado
import init, { SudokuCore } from '../wasm/core_engine';

class GameState {
    // Estado reactivo usando Runes
    current = $state<SudokuState>({
        board: [],
        difficulty: 'Zen',
        isPaused: false,
        elapsedTime: 0,
        seed: Math.random().toString(36).substring(2, 9),
        hintsRemaining: 0
    });

    // Propiedad derivada para el progreso (0 a 100)
    progress = $derived.by(() => {
        if (this.current.board.length === 0) return 0;
        const filled = this.current.board.filter(c => c.value !== null).length;
        return Math.floor((filled / 81) * 100);
    });

    isSolved = $derived.by(() => {
        return this.progress === 100 && this.current.board.every(c => !c.error);
    });

    engine: SudokuCore | null = null;
    timerInterval: any = null;
    hasStarted = $state(false);

    constructor() {
        this.initEngine();
        this.setupFocusListeners();
    }

    async initEngine() {
        await init();
        this.engine = new SudokuCore();

        if (!this.load()) {
            this.newGame('Zen');
        } else {
            // Sincronizar el engine con lo cargado de LocalStorage
            this.syncEngine();
        }

        // No iniciamos el timer aquí para esperar al primer movimiento
    }

    private syncEngine() {
        if (!this.engine) return;
        const raw = this.current.board.map(c => c.value === null ? 0 : (c.value as number));
        this.engine.set_board(Uint8Array.from(raw));
    }

    setupFocusListeners() {
        if (typeof window === 'undefined') return;

        window.addEventListener('focus', () => {
            if (this.hasStarted && !this.current.isPaused) {
                this.startTimer();
            }
        });

        window.addEventListener('blur', () => {
            this.stopTimer();
        });
    }

    startTimer() {
        this.stopTimer();
        if (this.current.isPaused) return;

        this.timerInterval = setInterval(() => {
            this.current.elapsedTime += 1;
            if (this.current.elapsedTime % 5 === 0) this.save(); // Guardar cada 5 segundos
        }, 1000);
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    newGame(difficulty: Difficulty) {
        if (!this.engine) return;

        // Llamada al motor de Rust para generar el tablero
        const rawBoard = this.engine.generate_with_seed(this.current.seed, difficulty) as Uint8Array;

        // Transformamos el array simple de Rust al objeto Cell de nuestro contrato
        this.current.board = Array.from(rawBoard).map((value, id) => ({
            id,
            value: value === 0 ? null : (value as any),
            isInitial: value !== 0,
            candidates: [],
            error: false
        }));

        this.current.difficulty = difficulty;
        this.current.elapsedTime = 0;
        this.hasStarted = false;
        this.stopTimer();

        // Inicializar pistas según la propuesta del usuario:
        // Zen: 1, Focus: 2, Master: 3
        this.current.hintsRemaining = difficulty === 'Zen' ? 1 : difficulty === 'Focus' ? 2 : 3;

        this.syncEngine();
        this.save();
    }

    useHint(index: number | null) {
        if (this.current.hintsRemaining <= 0 || !this.engine) return;

        let targetIndex = index;

        // Si no hay celda seleccionada, buscamos la primera vacía o con error
        if (targetIndex === null) {
            const firstEmpty = this.current.board.find(c => !c.isInitial && c.value === null);
            if (firstEmpty) {
                targetIndex = firstEmpty.id;
            } else {
                const firstError = this.current.board.find(c => !c.isInitial && c.error);
                if (firstError) targetIndex = firstError.id;
            }
        }

        if (targetIndex !== null && !this.current.board[targetIndex].isInitial) {
            const correctValue = this.engine.get_hint_value(targetIndex);
            if (correctValue !== 0) {
                this.makeMove(targetIndex, correctValue);
                this.current.hintsRemaining -= 1;
                this.save();
            }
        }
    }

    makeMove(index: number, value: number | null) {
        if (!this.current.board[index].isInitial && this.engine) {
            if (!this.hasStarted) {
                this.hasStarted = true;
                this.startTimer();
            }
            const numValue = value === null ? 0 : value;

            // Actualizar estado local
            this.current.board[index].value = value as any;

            // Sincronizar con el engine de Rust
            this.engine.set_cell(index, numValue);

            // Obtener conflictos de TODO el tablero
            const conflicts = this.engine.get_conflicts() as boolean[];

            // Actualizar errores en todas las celdas
            this.current.board.forEach((cell, i) => {
                cell.error = conflicts[i];
            });

            // Al poner un valor, limpiamos los candidatos
            if (value !== null) {
                this.current.board[index].candidates = [];
            }
            this.save();

            if (this.isSolved) {
                this.stopTimer();
            }
        }
    }

    toggleCandidate(index: number, value: number) {
        if (!this.current.board[index].isInitial && !this.current.board[index].value) {
            const digit = value as any;
            if (this.current.board[index].candidates.includes(digit)) {
                this.current.board[index].candidates = this.current.board[index].candidates.filter(c => c !== digit);
            } else {
                this.current.board[index].candidates = [...this.current.board[index].candidates, digit].sort();
            }
            this.save();
        }
    }

    save() {
        if (typeof localStorage === 'undefined') return;
        localStorage.setItem('sudoku_scientific_state', JSON.stringify(this.current));
    }

    load(): boolean {
        if (typeof localStorage === 'undefined') return false;
        const saved = localStorage.getItem('sudoku_scientific_state');
        if (saved) {
            try {
                const data = JSON.parse(saved) as SudokuState;

                // Migración: Si no tiene hintsRemaining (versión antigua), inicializar según dificultad
                if (data.hintsRemaining === undefined) {
                    data.hintsRemaining = data.difficulty === 'Zen' ? 1 : data.difficulty === 'Focus' ? 2 : 3;
                }

                this.current = data;
                return true;
            } catch (e) {
                console.error("Error al cargar estado:", e);
            }
        }
        return false;
    }
}

export const game = new GameState();
