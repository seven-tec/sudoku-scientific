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
        seed: Math.random().toString(36).substring(2, 9)
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

    constructor() {
        this.initEngine();
        this.setupFocusListeners();
    }

    async initEngine() {
        await init();
        this.engine = new SudokuCore();

        if (!this.load()) {
            this.newGame('Zen');
        }

        this.startTimer();
    }

    setupFocusListeners() {
        if (typeof window === 'undefined') return;

        window.addEventListener('focus', () => {
            this.current.isPaused = false;
            this.startTimer();
        });

        window.addEventListener('blur', () => {
            this.current.isPaused = true;
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
        this.save();
    }

    makeMove(index: number, value: number | null) {
        if (!this.current.board[index].isInitial && this.engine) {
            const numValue = value === null ? 0 : value;

            // Validamos con el engine de Rust
            const isValid = numValue === 0 || this.engine.validate_move(index, numValue);

            this.current.board[index].value = value as any;
            this.current.board[index].error = !isValid;

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
                this.current = JSON.parse(saved);
                return true;
            } catch (e) {
                console.error("Error al cargar estado:", e);
            }
        }
        return false;
    }
}

export const game = new GameState();
