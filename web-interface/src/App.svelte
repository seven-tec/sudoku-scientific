<script lang="ts">
  import { onMount } from "svelte";
  import Board from "./lib/ui/Board.svelte";
  import Metrics from "./lib/ui/Metrics.svelte";
  import Victory from "./lib/ui/Victory.svelte";
  import HelpModal from "./lib/ui/HelpModal.svelte";
  import { game } from "./lib/state/game.svelte";

  let showHelp = $state(false);

  onMount(() => {
    console.log("Sudoku Scientific cargado con éxito.");
  });
</script>

<main>
  <Victory />
  <HelpModal isOpen={showHelp} close={() => (showHelp = false)} />

  <header>
    <button
      class="help-trigger"
      onclick={() => (showHelp = true)}
      aria-label="Ayuda"
    >
      ℹ️
    </button>
    <h1>Sudoku <span class="scientific">Scientific</span></h1>
    <div class="stats">
      <span class="seed">Seed: {game.current.seed}</span>
    </div>
  </header>

  <div class="game-layout">
    <Board />
    <Metrics />
  </div>
  <footer>
    <p>Diseño basado en principios neurocientíficos y LCH.</p>
  </footer>
</main>

<style>
  @import url("https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;700&display=swap");

  :global(body) {
    background-color: lch(5 1 240);
    color: lch(90 2 240);
    margin: 0;
    font-family: "Outfit", sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
  }

  main {
    max-width: 900px;
    width: 100%;
    text-align: center;
    padding: 2rem;
  }

  .game-layout {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    gap: 2rem;
  }

  header {
    margin-bottom: 2rem;
    position: relative;
  }

  .help-trigger {
    position: absolute;
    top: 0;
    right: 0;
    background: none;
    border: 1px solid lch(30 5 240);
    border-radius: 50%;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: lch(60 5 240);
    font-size: 0.9rem;
    transition: all 0.3s ease;
  }

  .help-trigger:hover {
    background: lch(25 10 240);
    border-color: lch(70 40 220);
    color: lch(95 2 240);
  }

  h1 {
    font-weight: 300;
    letter-spacing: -1px;
    margin: 0;
    font-size: 2.5rem;
  }

  .scientific {
    font-weight: 700;
    color: lch(70 40 220);
  }

  .stats {
    font-size: 0.8rem;
    color: lch(50 5 240);
    margin-top: 0.5rem;
  }

  footer {
    margin-top: 2rem;
    font-size: 0.75rem;
    color: lch(40 2 240);
  }
</style>
