<script>
  export let rune;
  export let count = 0;
  export let pressing = false;
</script>

<button
  class="rune-icon"
  class:active={count > 0}
  class:pressing
  on:click
  on:pointerdown
  on:pointerup
  on:pointerleave
  on:pointercancel
  title={rune}
  aria-label="{rune}{count > 0 ? ` (${count})` : ''}"
>
  {#if count > 0}
    <span class="badge">{count}</span>
  {/if}
  <img src={`/runes/${rune.toLowerCase()}.svg`} alt="" aria-hidden="true" />
  <span class="rune-name">{rune}</span>
</button>

<style>
  .rune-icon {
    position: relative;
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
    user-select: none;
    -webkit-user-select: none;
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

  .rune-icon.active img {
    opacity: 1;
    filter: drop-shadow(0 0 5px var(--d2-glow));
  }

  .rune-icon.active {
    border-color: var(--d2-gold);
    background: rgba(200, 168, 75, 0.12);
  }

  .rune-icon.pressing {
    border-color: #c0392b;
    background: rgba(192, 57, 43, 0.15);
  }

  .rune-icon.pressing img {
    filter: drop-shadow(0 0 5px rgba(192, 57, 43, 0.8));
    opacity: 0.9;
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

  .rune-icon.active .rune-name {
    color: var(--d2-gold);
  }

  .badge {
    position: absolute;
    top: 2px;
    right: 4px;
    color: var(--d2-gold);
    font-size: 10px;
    font-weight: 700;
    font-family: monospace;
    line-height: 1;
  }

  @media (max-width: 480px) {
    .rune-icon img {
      width: 28px;
      height: 28px;
    }
  }
</style>
