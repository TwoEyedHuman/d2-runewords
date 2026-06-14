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
    padding: 8px;
    background: transparent;
    border: 1px solid #3a3020;
    border-radius: 4px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s, box-shadow 0.15s;
  }

  .rune-icon img {
    width: 36px;
    height: 36px;
    opacity: 0.35;
    transition: opacity 0.15s, filter 0.15s;
  }

  .rune-icon:hover img {
    opacity: 0.7;
  }

  .rune-icon.selected img {
    opacity: 1;
    filter: drop-shadow(0 0 5px rgba(200, 168, 75, 0.8));
  }

  .rune-icon.selected {
    border-color: #c8a84b;
    background: rgba(200, 168, 75, 0.12);
  }

  .rune-name {
    font-size: 9px;
    font-family: monospace;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #6b5a30;
    transition: color 0.15s;
  }

  .rune-icon.selected .rune-name {
    color: #c8a84b;
  }
</style>
