<script>
  import RuneIcon from './RuneIcon.svelte';
  import { runeCounts } from './store.js';

  const ALL_RUNES = [
    'El',
    'Eld',
    'Tir',
    'Nef',
    'Eth',
    'Ith',
    'Tal',
    'Ral',
    'Ort',
    'Thul',
    'Amn',
    'Sol',
    'Shael',
    'Dol',
    'Hel',
    'Io',
    'Lum',
    'Ko',
    'Fal',
    'Lem',
    'Pul',
    'Um',
    'Mal',
    'Ist',
    'Gul',
    'Vex',
    'Ohm',
    'Lo',
    'Sur',
    'Ber',
    'Jah',
    'Cham',
    'Zod',
  ];

  let pressingRune = null;
  let pressTimer = null;
  let longPressTriggered = false;
  let savedVisible = false;
  let savedTimer = null;
  let firstRun = true;

  $: totalCount = [...$runeCounts.values()].reduce((a, b) => a + b, 0);

  $: {
    $runeCounts;
    if (firstRun) {
      firstRun = false;
    } else {
      savedVisible = true;
      clearTimeout(savedTimer);
      savedTimer = setTimeout(() => {
        savedVisible = false;
      }, 1200);
    }
  }

  function handlePointerDown(rune, e) {
    e.currentTarget.setPointerCapture(e.pointerId);
    pressingRune = rune;
    longPressTriggered = false;
    pressTimer = setTimeout(() => {
      longPressTriggered = true;
      runeCounts.reset(rune);
      pressingRune = null;
    }, 400);
  }

  function handlePointerUp(rune) {
    clearTimeout(pressTimer);
    pressTimer = null;
    if (!longPressTriggered) {
      runeCounts.increment(rune);
    }
    pressingRune = null;
    longPressTriggered = false;
  }

  function handlePointerCancel(rune) {
    clearTimeout(pressTimer);
    pressTimer = null;
    if (pressingRune === rune) pressingRune = null;
    longPressTriggered = false;
  }
</script>

<div class="rune-selector">
  <div class="selector-header">
    <h2>Select Runes</h2>
    <span class="saved-indicator" class:visible={savedVisible}>Saved</span>
    {#if totalCount > 0}
      <button class="clear-btn" on:click={() => runeCounts.resetAll()}>
        Clear All ({totalCount})
      </button>
    {/if}
  </div>
  <div class="rune-grid">
    {#each ALL_RUNES as rune}
      <RuneIcon
        {rune}
        count={$runeCounts.get(rune) ?? 0}
        pressing={pressingRune === rune}
        on:pointerdown={(e) => handlePointerDown(rune, e)}
        on:pointerup={() => handlePointerUp(rune)}
        on:pointerleave={() => handlePointerCancel(rune)}
        on:pointercancel={() => handlePointerCancel(rune)}
      />
    {/each}
  </div>
</div>

<style>
  .rune-selector {
    width: 100%;
  }

  .selector-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 12px;
  }

  .saved-indicator {
    margin-right: auto;
    font-size: 10px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--d2-gold-dim);
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  .saved-indicator.visible {
    opacity: 1;
  }

  h2 {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--d2-gold-dim);
  }

  .clear-btn {
    background: transparent;
    border: 1px solid var(--d2-gold-dark);
    border-radius: 3px;
    color: var(--d2-gold-dark);
    font-size: 11px;
    padding: 3px 8px;
    cursor: pointer;
    transition:
      border-color 0.15s,
      color 0.15s;
    font-family: inherit;
  }

  .clear-btn:hover {
    border-color: var(--d2-gold);
    color: var(--d2-gold);
  }

  .rune-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(58px, 1fr));
    gap: 6px;
  }

  @media (max-width: 480px) {
    .rune-grid {
      grid-template-columns: repeat(auto-fill, minmax(50px, 1fr));
      gap: 4px;
    }
  }
</style>
