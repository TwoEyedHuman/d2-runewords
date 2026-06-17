<script>
  import { onMount } from 'svelte';
  import RunewordCard from './RunewordCard.svelte';
  import { filterRunewords } from './filter.js';

  export let runeCounts = new Map();

  let runewords = [];

  onMount(async () => {
    const res = await fetch('/runewords.json');
    runewords = await res.json();
  });

  $: filtered = filterRunewords(runewords, runeCounts);
  $: direct = filtered.filter((rw) => rw.classification === 'direct');
  $: viaCubing = filtered
    .filter((rw) => rw.classification !== 'direct')
    .sort((a, b) =>
      a.classification === b.classification ? 0 : a.classification === 'partial-cube' ? -1 : 1,
    );
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
    {#if direct.length > 0}
      <h3 class="group-label">Available now</h3>
      <div class="grid">
        {#each direct as runeword (runeword.name)}
          <RunewordCard {runeword} />
        {/each}
      </div>
    {/if}
    {#if viaCubing.length > 0}
      <h3 class="group-label">Available via cubing</h3>
      <div class="grid">
        {#each viaCubing as runeword (runeword.name)}
          <RunewordCard {runeword} />
        {/each}
      </div>
    {/if}
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

  .group-label {
    margin: 0 0 12px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--d2-text-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 600px) {
    .grid {
      grid-template-columns: 1fr;
    }
  }
</style>
