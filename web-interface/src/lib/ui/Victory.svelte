<script lang="ts">
    import { game } from "../state/game.svelte";
    import { fade, scale } from "svelte/transition";
    import { backOut } from "svelte/easing";

    let finalTime = $state(0);

    $effect(() => {
        if (game.isSolved) {
            if (finalTime === 0) {
                finalTime = game.current.elapsedTime;
            }
        } else {
            finalTime = 0;
        }
    });

    function handleNewGame() {
        game.newGame(game.current.difficulty);
    }

    function formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }
</script>

{#if game.isSolved}
    <div class="victory-overlay" transition:fade>
        <div
            class="victory-card"
            transition:scale={{ duration: 600, easing: backOut, start: 0.8 }}
        >
            <div class="icon">🏆</div>
            <h2>¡Misión Completa!</h2>
            <p>Has alcanzado el estado de <strong>Flow</strong> absoluto.</p>

            <div class="stats-summary">
                <div class="stat">
                    <span class="stat-label">Tiempo de Foco</span>
                    <span class="stat-value">{formatTime(finalTime)}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Dificultad</span>
                    <span class="stat-value">{game.current.difficulty}</span>
                </div>
            </div>

            <button {...{ onclick: handleNewGame }}> Nueva Partida </button>
        </div>
    </div>
{/if}

<style>
    .victory-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.85);
        backdrop-filter: blur(8px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .victory-card {
        background: lch(15 5 240);
        padding: 3rem;
        border-radius: 24px;
        border: 1px solid lch(35 10 220);
        text-align: center;
        max-width: 400px;
        width: 90%;
        box-shadow:
            0 30px 60px rgba(0, 0, 0, 0.6),
            0 0 40px lch(70 40 220 / 0.2);
    }

    .icon {
        font-size: 4rem;
        margin-bottom: 1rem;
    }

    h2 {
        font-size: 2rem;
        font-weight: 700;
        margin: 0;
        color: lch(95 2 240);
    }

    p {
        color: lch(70 5 240);
        margin: 1rem 0 2rem;
    }

    .stats-summary {
        display: flex;
        justify-content: space-around;
        background: lch(10 2 240);
        padding: 1.5rem;
        border-radius: 16px;
        margin-bottom: 2rem;
    }

    .stat {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    .stat-label {
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: lch(50 5 240);
    }

    .stat-value {
        font-weight: 700;
        color: lch(90 2 240);
    }

    button {
        background: lch(70 50 220);
        color: white;
        border: none;
        padding: 1rem 2rem;
        border-radius: 30px;
        font-size: 1.1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 10px 20px lch(70 50 220 / 0.3);
    }

    button:hover {
        transform: translateY(-3px);
        background: lch(75 55 220);
        box-shadow: 0 15px 30px lch(70 50 220 / 0.4);
    }
</style>
