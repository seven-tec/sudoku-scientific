<script lang="ts">
    import { game } from "../state/game.svelte";

    function formatTime(seconds: number) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
</script>

<div class="metrics-panel">
    <div class="metric">
        <span class="label">Toques</span>
        <span class="value">{game.current.moves}</span>
    </div>

    <div class="metric">
        <span class="label">Puntaje</span>
        <span class="value">{game.score}</span>
    </div>

    <div class="metric">
        <span class="label">Tiempo en Flow</span>
        <span class="value">{formatTime(game.current.elapsedTime)}</span>
    </div>

    <div class="metric">
        <div class="progress-info">
            <span class="label">Progreso</span>
            <span class="value">{game.progress}%</span>
        </div>
        <div class="progress-bar-container">
            <div class="progress-bar" style="width: {game.progress}%"></div>
        </div>
    </div>
</div>

<style>
    .metrics-panel {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
        background: lch(12 2 240);
        padding: 1.5rem;
        border-radius: 12px;
        border: 1px solid lch(25 2 240);
        width: 100%;
        max-width: 300px;
        margin: 1rem auto;
    }

    .metric {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .progress-info {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 1px;
        color: lch(50 5 240);
    }

    .value {
        font-weight: 700;
        font-family: "Outfit", sans-serif;
        color: lch(90 2 240);
    }

    .progress-bar-container {
        height: 6px;
        background: lch(5 1 240);
        border-radius: 3px;
        overflow: hidden;
    }

    .progress-bar {
        height: 100%;
        background: linear-gradient(90deg, lch(40 40 220), lch(70 40 220));
        transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow: 0 0 10px lch(70 40 220 / 0.3);
    }
</style>
