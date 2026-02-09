<script lang="ts">
    import { game } from "../state/game.svelte";
    import { fade } from "svelte/transition";

    let { selectedId } = $props<{ selectedId: number | null }>();

    const hasHints = $derived(game.current.hintsRemaining > 0);
    const canUseOnSelected = $derived(
        selectedId !== null &&
            !game.current.board[selectedId]?.isInitial &&
            game.current.board[selectedId]?.value === null,
    );

    function handleHint() {
        if (selectedId !== null && hasHints) {
            game.useHint(selectedId);
        }
    }
</script>

<div class="hint-container">
    <div class="bulb-wrapper" class:glowing={hasHints}>
        <button
            class="hint-button"
            class:active={hasHints}
            class:shake={hasHints && canUseOnSelected}
            {...{ onclick: handleHint }}
            disabled={!hasHints || selectedId === null || !canUseOnSelected}
            aria-label="Obtener pista"
        >
            <span class="icon">💡</span>
            {#if hasHints}
                <span class="badge" transition:fade
                    >{game.current.hintsRemaining}</span
                >
            {/if}
        </button>
    </div>
</div>

<style>
    .hint-container {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .bulb-wrapper {
        transition: all 0.4s ease;
        border-radius: 50%;
        position: relative;
    }

    .bulb-wrapper.glowing {
        animation: pulse-glow-v2 2.5s infinite ease-in-out;
    }

    .hint-button {
        background: lch(15 2 240);
        border: 2px solid lch(30 5 240);
        width: 60px;
        height: 60px;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        padding: 0;
        z-index: 1;
    }

    .hint-button:disabled {
        cursor: not-allowed;
    }

    .icon {
        font-size: 1.8rem;
        filter: grayscale(1) opacity(0.3);
        transition: all 0.5s ease;
    }

    .glowing .icon {
        filter: grayscale(0) opacity(1);
    }

    .hint-button.active {
        border-color: lch(70 40 220); /* Cyan científico */
    }

    .hint-button.active:hover:not(:disabled) {
        transform: scale(1.1) rotate(5deg);
    }

    .badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: lch(70 40 220);
        color: white;
        font-size: 0.8rem;
        font-weight: 700;
        width: 22px;
        height: 22px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid lch(15 2 240);
        z-index: 2;
    }

    .shake {
        animation: gentle-shake 3s infinite ease-in-out;
    }

    @keyframes pulse-glow-v2 {
        0%,
        100% {
            box-shadow: 0 0 10px lch(70 40 220 / 0.1);
            transform: scale(1);
        }
        50% {
            box-shadow: 0 0 35px lch(70 60 220 / 0.5);
            transform: scale(1.02);
        }
    }

    @keyframes gentle-shake {
        0%,
        90%,
        100% {
            transform: rotate(0);
        }
        92% {
            transform: rotate(5deg);
        }
        94% {
            transform: rotate(-5deg);
        }
        96% {
            transform: rotate(3deg);
        }
        98% {
            transform: rotate(-3deg);
        }
    }
</style>
