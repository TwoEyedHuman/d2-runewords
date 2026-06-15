<script>
  import RuneIcon from './RuneIcon.svelte';

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

  export let selectedRunes = new Set();

  function toggle(rune) {
    const next = new Set(selectedRunes);
    if (next.has(rune)) {
      next.delete(rune);
    } else {
      next.add(rune);
    }
    selectedRunes = next;
  }

  function clearAll() {
    selectedRunes = new Set();
  }
</script>

<div class="rune-selector">
  <div class="selector-header">
    <h2>Select Runes</h2>
    {#if selectedRunes.size > 0}
      <button class="clear-btn" on:click={clearAll}>
        Clear ({selectedRunes.size})
      </button>
    {/if}
  </div>
  <div class="rune-grid">
    {#each ALL_RUNES as rune}
      <RuneIcon {rune} selected={selectedRunes.has(rune)} on:click={() => toggle(rune)} />
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
    margin-bottom: 12px;
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
