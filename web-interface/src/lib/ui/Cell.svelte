<script lang="ts">
  import type { Cell as CellType } from "../../../../shared/types";
  import { game } from "../state/game.svelte";

  let {
    id,
    cell,
    onSelect,
  }: { id: number; cell: CellType; onSelect: (id: number) => void } = $props();

  const isHinted = $derived(game.current.lastHintId === id);
</script>

<button
  class="cell {cell.isInitial ? 'initial' : 'user-input'}"
  class:error={cell.error}
  class:hinted={isHinted}
  onclick={() => onSelect(id)}
  aria-label="Celda {id}"
>
  <span class="value">{cell.value ?? ""}</span>

  {#if !cell.value}
    <div class="candidates-grid">
      {#each [1, 2, 3, 4, 5, 6, 7, 8, 9] as num}
        <div
          class="candidate"
          class:visible={cell.candidates.includes(num as any)}
        >
          {num}
        </div>
      {/each}
    </div>
  {/if}
</button>

<style>
  .cell {
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
    background: lch(15 2 240);
    border: 0.5px solid lch(25 2 240);
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    padding: 0;
    font-family: "Outfit", sans-serif;
    outline: none;
  }

  .cell:hover {
    background: lch(20 5 240);
    z-index: 10;
    box-shadow: 0 0 15px rgba(0, 0, 0, 0.3);
  }

  .cell:focus {
    background: lch(25 10 240);
    border-color: lch(70 30 230);
    z-index: 10;
  }

  .initial {
    font-weight: 700;
    color: lch(95 2 240);
  }

  .user-input {
    color: lch(75 35 210);
    font-weight: 400;
  }

  .error {
    background: lch(25 40 20) !important;
    color: lch(80 50 20) !important;
  }

  .hinted {
    box-shadow: inset 0 0 15px lch(70 60 220 / 0.8) !important;
    animation: hint-flash 1s alternate infinite ease-in-out;
    z-index: 5;
  }

  .value {
    animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  @keyframes pop {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes hint-flash {
    0% {
      background: lch(70 40 220 / 0.1);
    }
    100% {
      background: lch(70 40 220 / 0.4);
    }
  }

  .candidates-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(3, 1fr);
    width: 100%;
    height: 100%;
    padding: 4px;
    box-sizing: border-box;
    pointer-events: none;
  }

  .candidate {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65rem;
    color: lch(60 15 210);
    opacity: 0;
    transition: opacity 0.2s ease;
    line-height: 1;
  }

  .candidate.visible {
    opacity: 0.6;
  }
</style>
