<script>
  import { onMount } from 'svelte';
  import RunewordCard from './RunewordCard.svelte';

  let runewords = [];

  onMount(async () => {
    const res = await fetch('/runewords.json');
    runewords = await res.json();
  });
</script>

<section class="runeword-list">
  <div class="list-header">
    <h2>Runewords</h2>
    {#if runewords.length > 0}
      <span class="count">{runewords.length} total</span>
    {/if}
  </div>
  <div class="grid">
    {#each runewords as runeword (runeword.name)}
      <RunewordCard {runeword} />
    {/each}
  </div>
</section>

<style>
  .runeword-list {
    width: 100%;
  }

  .list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  h2 {
    margin: 0;
    font-size: 14px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #8a7040;
  }

  .count {
    font-size: 11px;
    color: #6b5a30;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
</style>
