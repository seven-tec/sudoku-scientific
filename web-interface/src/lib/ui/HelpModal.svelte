<script lang="ts">
    import { fade, fly } from "svelte/transition";

    let { isOpen, close }: { isOpen: boolean; close: () => void } = $props();
</script>

{#if isOpen}
    <div
        class="modal-overlay"
        transition:fade
        onclick={close}
        role="button"
        tabindex="-1"
        onkeydown={(e) => e.key === "Escape" && close()}
    >
        <div
            class="modal-content"
            transition:fly={{ y: 20, duration: 400 }}
            onclick={(e) => e.stopPropagation()}
            role="none"
        >
            <button class="close-btn" onclick={close} aria-label="Cerrar"
                >✕</button
            >

            <h2>Guía Sudoku Scientific</h2>

            <div class="guide-section">
                <h3>⌨️ Controles de Teclado</h3>
                <ul>
                    <li>
                        <strong>1-9</strong>: Colocar número en la celda
                        seleccionada.
                    </li>
                    <li>
                        <strong>Shift + 1-9</strong>: Alternar notas
                        (candidatos) en la celda.
                    </li>
                    <li>
                        <strong>Backspace / 0 / Delete</strong>: Limpiar el
                        valor de la celda.
                    </li>
                </ul>
            </div>

            <div class="guide-section">
                <h3>🧠 Sistemas Inteligentes</h3>
                <ul>
                    <li>
                        <strong>Tiempo en Flow</strong>: El cronómetro se pausa
                        automáticamente si cambias de pestaña o minimizas el
                        navegador para no penalizar tus métricas.
                    </li>
                    <li>
                        <strong>Persistencia</strong>: Tu partida se guarda
                        automáticamente con cada movimiento. Puedes volver más
                        tarde y seguir exactamente donde lo dejaste.
                    </li>
                    <li>
                        <strong>Dificultades</strong>:
                        <strong>Zen</strong> (Fácil),
                        <strong>Focus</strong> (Medio),
                        <strong>Master</strong> (Científico).
                    </li>
                </ul>
            </div>

            <div class="guide-footer">
                <p>Entrena tu mente con calma y precisión.</p>
            </div>
        </div>
    </div>
{/if}

<style>
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }

    .modal-content {
        background: lch(15 5 240);
        padding: 2.5rem;
        border-radius: 20px;
        border: 1px solid lch(35 10 220);
        max-width: 500px;
        width: 90%;
        position: relative;
        box-shadow: 0 40px 100px rgba(0, 0, 0, 0.8);
    }

    .close-btn {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        background: none;
        border: none;
        color: lch(50 5 240);
        font-size: 1.5rem;
        cursor: pointer;
        transition: color 0.3s ease;
    }

    .close-btn:hover {
        color: lch(90 2 240);
    }

    h2 {
        color: lch(95 2 240);
        margin-top: 0;
        font-weight: 700;
        letter-spacing: -0.5px;
    }

    h3 {
        color: lch(70 40 220);
        font-size: 1rem;
        margin-bottom: 0.75rem;
    }

    .guide-section {
        margin-bottom: 2rem;
        text-align: left;
    }

    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    li {
        color: lch(80 5 240);
        font-size: 0.9rem;
        margin-bottom: 0.6rem;
        line-height: 1.4;
    }

    li strong {
        color: lch(95 2 240);
        font-weight: 600;
    }

    .guide-footer {
        border-top: 1px solid lch(25 5 240);
        padding-top: 1.5rem;
        color: lch(40 2 240);
        font-size: 0.8rem;
        font-style: italic;
    }
</style>
