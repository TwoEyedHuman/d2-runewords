<script>
  import RuneSelector from './lib/RuneSelector.svelte';
  import RunewordList from './lib/RunewordList.svelte';
  import { runeCounts } from './lib/store.js';
</script>

<main>
  <header>
    <h1>D2 Runewords</h1>
    <p class="subtitle">Diablo II: Resurrected rune word reference</p>
  </header>
  <section class="selector-section">
    <RuneSelector />
  </section>
  <RunewordList runeCounts={$runeCounts} />
</main>

<style>
  main {
    max-width: 960px;
    margin: 0 auto;
    padding: 32px 16px 48px;
    width: 100%;
  }

  header {
    margin-bottom: 32px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--d2-border);
  }

  h1 {
    margin: 0 0 4px;
    font-size: 26px;
    font-weight: 600;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--d2-gold);
  }

  .subtitle {
    margin: 0;
    font-size: 12px;
    color: var(--d2-text-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
  }

  .selector-section {
    margin-bottom: 32px;
  }

  @media (max-width: 600px) {
    main {
      padding: 20px 12px 32px;
    }

    h1 {
      font-size: 20px;
    }
  }
</style>
