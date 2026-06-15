<script>
  import RuneIcon from './RuneIcon.svelte';

  export let runeword;
</script>

<article class="runeword-card">
  <div class="card-header">
    <h3 class="name">{runeword.name}</h3>
    <span class="sockets">{runeword.sockets} sockets</span>
  </div>

  <div class="runes">
    {#each runeword.runes as rune}
      <RuneIcon {rune} />
    {/each}
  </div>

  <div class="meta">
    <span class="types">{runeword.types.join(', ')}</span>
    <span class="level">Req. Level {runeword.requiredLevel}</span>
  </div>

  <p class="description">{runeword.description}</p>

  <ul class="stats">
    {#each runeword.stats as stat}
      <li>{stat}</li>
    {/each}
  </ul>
</article>

<style>
  .runeword-card {
    background: rgba(20, 16, 8, 0.8);
    border: 1px solid #3a3020;
    border-radius: 6px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .name {
    margin: 0;
    font-size: 16px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #c8a84b;
  }

  .sockets {
    font-size: 11px;
    color: #6b5a30;
    white-space: nowrap;
  }

  .runes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .meta {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #8a7040;
  }

  .description {
    margin: 0;
    font-size: 12px;
    color: #7a6a50;
    font-style: italic;
    line-height: 1.5;
  }

  .stats {
    margin: 0;
    padding: 0;
    list-style: none;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .stats li {
    font-size: 12px;
    color: #a89060;
    padding-left: 10px;
    position: relative;
  }

  .stats li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #6b5a30;
  }
</style>
