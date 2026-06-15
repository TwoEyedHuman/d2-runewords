<script>
  import RuneSelector from './lib/RuneSelector.svelte';
  import RunewordList from './lib/RunewordList.svelte';

  let selectedRunes = new Set();
</script>

<main>
  <header>
    <h1>D2 Runewords</h1>
  </header>
  <section class="selector-section">
    <RuneSelector bind:selectedRunes />
  </section>
  <RunewordList {selectedRunes} />
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 24px 16px;
  }

  header {
    margin-bottom: 24px;
  }

  h1 {
    margin: 0;
    font-size: 24px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: #c8a84b;
  }

  .selector-section {
    margin-bottom: 32px;
  }
</style>
