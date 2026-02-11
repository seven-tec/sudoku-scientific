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
        moves: 0,
        seed: Math.random().toString(36).substring(2, 9),
        hintsRemaining: 0,
        lastHintId: null,
        bestStats: {
            Zen: null,
            Focus: null,
            Master: null
        }
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

    score = $derived.by(() => {
        if (this.progress === 0) return 0;
        // Fórmula de puntaje: base por progreso - penalización por tiempo y movimientos
        // El tiempo y movimientos pesan menos en el puntaje total para mantener el enfoque en completar
        const baseScore = this.progress * 100;
        const timePenalty = Math.floor(this.current.elapsedTime / 10);
        const movesPenalty = this.current.moves * 2;
        return Math.max(0, baseScore - timePenalty - movesPenalty);
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

        // Generar una nueva semilla para que cada "Nueva Partida" sea un reto distinto
        this.current.seed = Math.random().toString(36).substring(2, 9);

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
        this.current.moves = 0;
        this.hasStarted = false;
        this.stopTimer();

        // Inicializar pistas según la propuesta del usuario:
        // Zen: 1, Focus: 2, Master: 3
        this.current.hintsRemaining = difficulty === 'Zen' ? 1 : difficulty === 'Focus' ? 2 : 3;

        this.syncEngine();
        this.save();
    }

    useHint(index: number | null) {
        if (this.current.hintsRemaining <= 0 || !this.engine || this.isSolved) return;

        let targetIndex: number | null = null;

        // Función auxiliar para verificar si una celda NECESITA ayuda (vacía o con error)
        const needsHelp = (idx: number) => {
            const cell = this.current.board[idx];
            if (cell.isInitial) return false;
            if (cell.value === null) return true;

            // Si tiene valor, verificamos si es incorrecto usando el engine de Rust
            const correctValue = this.engine!.get_hint_value(idx);
            return cell.value !== correctValue;
        };

        // Escenario 1: El usuario tiene algo seleccionado
        if (index !== null && needsHelp(index)) {
            targetIndex = index;
        }

        // Escenario 2: No hay selección O la selección ya es correcta
        // Buscamos proactivamente dónde ayudar
        if (targetIndex === null) {
            // Prioridad A: Celdas con errores visibles
            const visibleError = this.current.board.find(c => !c.isInitial && c.error);
            if (visibleError) {
                targetIndex = visibleError.id;
            } else {
                // Prioridad B: Celdas vacías (buscamos la primera que el solver pueda resolver)
                const emptyCell = this.current.board.find(c => !c.isInitial && c.value === null);
                if (emptyCell) {
                    targetIndex = emptyCell.id;
                } else {
                    // Prioridad C: Errores ocultos (valores que no son correctos pero no marcados como conflicto aún)
                    const hiddenError = this.current.board.find(c => !c.isInitial && needsHelp(c.id));
                    if (hiddenError) targetIndex = hiddenError.id;
                }
            }
        }

        if (targetIndex !== null) {
            const correctValue = this.engine.get_hint_value(targetIndex);
            if (correctValue !== 0) {
                this.makeMove(targetIndex, correctValue);
                this.current.hintsRemaining -= 1;
                this.current.lastHintId = targetIndex;

                // Limpiar el highlight después de un momento
                setTimeout(() => {
                    if (this.current.lastHintId === targetIndex) {
                        this.current.lastHintId = null;
                    }
                }, 2000);

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
            this.current.moves += 1;
            this.save();

            if (this.isSolved) {
                this.stopTimer();
                this.updateBestStats();
            }
        }
    }

    private updateBestStats() {
        const difficulty = this.current.difficulty;
        const currentBest = this.current.bestStats[difficulty];
        const currentScore = this.score;

        if (!currentBest || currentScore > currentBest.score) {
            this.current.bestStats[difficulty] = {
                score: currentScore,
                moves: this.current.moves,
                time: this.current.elapsedTime
            };
            this.save();
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

                if (data.moves === undefined) data.moves = 0;
                if (!data.bestStats) {
                    data.bestStats = {
                        Zen: null,
                        Focus: null,
                        Master: null
                    };
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
