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
    {#each runeword.runeSlots ?? runeword.runes.map( (rune) => ({ rune, cubeSources: null }), ) as slot}
      <div class="rune-slot">
        {#if slot.cubeSources}
          <div class="cube-chain" title={slot.cubePath}>
            {#each slot.cubeSources as source, i}
              {#if i > 0}<span class="cube-plus">+</span>{/if}
              <RuneIcon
                rune={source.rune}
                count={source.count}
                tone="cube"
                compact
                interactive={false}
              />
            {/each}
            <span class="cube-arrow">→</span>
          </div>
        {/if}
        <RuneIcon rune={slot.rune} interactive={false} />
      </div>
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
    background: var(--d2-surface);
    border: 1px solid var(--d2-border);
    border-radius: 6px;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    transition: border-color 0.15s;
  }

  .runeword-card:hover {
    border-color: var(--d2-border-light);
  }

  .card-header {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
  }

  .name {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--d2-gold);
  }

  .sockets {
    font-size: 11px;
    color: var(--d2-text-muted);
    white-space: nowrap;
    flex-shrink: 0;
  }

  .runes {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .rune-slot {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .cube-chain {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .cube-plus,
  .cube-arrow {
    font-size: 10px;
    font-weight: 700;
    color: #c0392b;
  }

  @media (max-width: 480px) {
    .cube-plus,
    .cube-arrow {
      font-size: 9px;
    }
  }

  .meta {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
    color: var(--d2-gold-dim);
  }

  .description {
    margin: 0;
    font-size: 12px;
    color: var(--d2-text-muted);
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
    border-top: 1px solid var(--d2-border);
    padding-top: 10px;
  }

  .stats li {
    font-size: 12px;
    color: var(--d2-text);
    padding-left: 12px;
    position: relative;
    line-height: 1.4;
  }

  .stats li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--d2-gold-dark);
  }
</style>
