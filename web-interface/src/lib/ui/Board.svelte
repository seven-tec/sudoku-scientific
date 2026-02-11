<script lang="ts">
  import { game } from "../state/game.svelte";
  import Cell from "./Cell.svelte";
  import HintButton from "./HintButton.svelte";

  let selectedId = $state<number | null>(null);

  function handleSelect(id: number) {
    selectedId = id;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (selectedId === null) return;

    // Usar e.code para detectar números independientemente de Shift (e.g., Shift+1 es "!" en e.key, pero "Digit1" en e.code)
    let val: number | null = null;
    if (e.code.startsWith("Digit")) {
      val = parseInt(e.code.slice(5));
    } else if (e.code.startsWith("Numpad")) {
      val = parseInt(e.code.slice(6));
    }

    function formatTime(seconds: number) {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }

    if (val !== null && val >= 1 && val <= 9) {
      if (e.shiftKey) {
        game.toggleCandidate(selectedId, val);
      } else {
        game.makeMove(selectedId, val);
      }
    } else if (e.key === "Backspace" || e.key === "0" || e.key === "Delete") {
      game.makeMove(selectedId, null);
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="board-container">
  <div class="sudoku-grid">
    {#each game.current.board as cell, i}
      <div
        class="cell-wrapper"
        class:border-right={(i + 1) % 3 === 0 && (i + 1) % 9 !== 0}
        class:border-bottom={Math.floor(i / 9) % 3 === 2 &&
          Math.floor(i / 9) !== 8}
      >
        <Cell id={i} {cell} onSelect={handleSelect} />
      </div>
    {/each}
  </div>

  <div class="controls-group">
    <div class="controls">
      <button
        onclick={() => game.newGame("Zen")}
        class:active={game.current.difficulty === "Zen"}
      >
        <span>Zen</span>
        {#if game.current.bestStats.Zen}
          <div class="best-stat">
            🏆 {game.current.bestStats.Zen.score} | 👆 {game.current.bestStats.Zen
              .moves}
          </div>
        {/if}
      </button>
      <button
        onclick={() => game.newGame("Focus")}
        class:active={game.current.difficulty === "Focus"}
      >
        <span>Focus</span>
        {#if game.current.bestStats.Focus}
          <div class="best-stat">
            🏆 {game.current.bestStats.Focus.score} | 👆 {game.current.bestStats
              .Focus.moves}
          </div>
        {/if}
      </button>
      <button
        onclick={() => game.newGame("Master")}
        class:active={game.current.difficulty === "Master"}
      >
        <span>Master</span>
        {#if game.current.bestStats.Master}
          <div class="best-stat">
            🏆 {game.current.bestStats.Master.score} | 👆 {game.current.bestStats
              .Master.moves}
          </div>
        {/if}
      </button>
    </div>
    <HintButton {selectedId} />
  </div>
</div>

<style>
  .board-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    padding: 2rem;
  }

  .sudoku-grid {
    display: grid;
    grid-template-columns: repeat(9, 1fr);
    background: lch(10 2 240);
    border: 3px solid lch(35 5 240);
    box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
    border-radius: 8px;
    overflow: hidden;
    user-select: none;
  }

  .cell-wrapper {
    display: contents;
  }

  /* Gestalt grouping with thick borders */
  .border-right :global(.cell) {
    border-right: 3px solid lch(35 5 240) !important;
  }

  .border-bottom :global(.cell) {
    border-bottom: 3px solid lch(35 5 240) !important;
  }

  .controls-group {
    display: flex;
    align-items: center;
    gap: 3rem;
  }

  .controls {
    display: flex;
    gap: 1rem;
  }

  button {
    background: lch(20 5 240);
    color: lch(80 5 240);
    border: 1px solid lch(30 5 240);
    padding: 0.75rem 1.5rem;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: "Outfit", sans-serif;
    font-weight: 500;
  }

  button:hover {
    background: lch(25 10 240);
    transform: translateY(-2px);
  }

  button.active {
    background: lch(70 40 220);
    color: white;
    border-color: lch(70 40 220);
    box-shadow: 0 0 20px lch(70 40 220 / 0.4);
  }

  .best-stat {
    font-size: 0.65rem;
    margin-top: 0.25rem;
    opacity: 0.8;
    font-weight: 400;
    letter-spacing: 0;
  }
</style>
