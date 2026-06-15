<script>
  export let rune;
  export let selected = false;
</script>

<button
  class="rune-icon"
  class:selected
  on:click
  title={rune}
  aria-pressed={selected}
  aria-label={rune}
>
  <img src={`/runes/${rune.toLowerCase()}.svg`} alt="" aria-hidden="true" />
  <span class="rune-name">{rune}</span>
</button>

<style>
  .rune-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 4px;
    background: transparent;
    border: 1px solid var(--d2-border);
    border-radius: 4px;
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s,
      box-shadow 0.15s;
  }

  .rune-icon:hover {
    border-color: var(--d2-border-light);
    background: rgba(200, 168, 75, 0.05);
  }

  .rune-icon img {
    width: 34px;
    height: 34px;
    opacity: 0.35;
    transition:
      opacity 0.15s,
      filter 0.15s;
  }

  .rune-icon:hover img {
    opacity: 0.65;
  }

  .rune-icon.selected img {
    opacity: 1;
    filter: drop-shadow(0 0 5px var(--d2-glow));
  }

  .rune-icon.selected {
    border-color: var(--d2-gold);
    background: rgba(200, 168, 75, 0.12);
  }

  .rune-name {
    font-size: 9px;
    font-family: monospace;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--d2-text-muted);
    transition: color 0.15s;
    line-height: 1;
  }

  .rune-icon.selected .rune-name {
    color: var(--d2-gold);
  }

  @media (max-width: 480px) {
    .rune-icon img {
      width: 28px;
      height: 28px;
    }
  }
</style>
