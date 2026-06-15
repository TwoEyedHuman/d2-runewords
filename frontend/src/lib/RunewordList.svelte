<script>
  import { onMount } from 'svelte';
  import RunewordCard from './RunewordCard.svelte';
  import { filterRunewords } from './filter.js';

  export let selectedRunes = new Set();

  let runewords = [];

  onMount(async () => {
    const res = await fetch('/runewords.json');
    runewords = await res.json();
  });

  $: filtered = filterRunewords(runewords, selectedRunes);
</script>

<section class="runeword-list">
  <div class="list-header">
    <h2>Rune Words</h2>
    {#if runewords.length > 0}
      <span class="match-count">
        Showing {filtered.length} of {runewords.length} rune words
      </span>
    {/if}
  </div>
  {#if filtered.length === 0 && runewords.length > 0}
    <p class="empty-state">No rune words match the selected runes.</p>
  {:else}
    <div class="grid">
      {#each filtered as runeword (runeword.name)}
        <RunewordCard {runeword} />
      {/each}
    </div>
  {/if}
</section>

<style>
  .runeword-list {
    width: 100%;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 16px;
    flex-wrap: wrap;
  }

  h2 {
    margin: 0;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--d2-gold-dim);
  }

  .match-count {
    font-size: 11px;
    color: var(--d2-text-muted);
    letter-spacing: 0.04em;
  }

  .empty-state {
    margin: 48px 0;
    text-align: center;
    font-size: 13px;
    color: var(--d2-text-muted);
    font-style: italic;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
