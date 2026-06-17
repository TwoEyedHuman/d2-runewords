import { describe, it, expect, beforeEach, vi } from 'vitest';

function makeLocalStorage() {
  const data = new Map();
  return {
    getItem: (k) => (data.has(k) ? data.get(k) : null),
    setItem: (k, v) => data.set(k, String(v)),
    removeItem: (k) => data.delete(k),
    clear: () => data.clear(),
  };
}

describe('runeCounts localStorage persistence', () => {
  beforeEach(() => {
    globalThis.localStorage = makeLocalStorage();
    vi.resetModules();
  });

  it('restores counts saved under d2runes_inventory', async () => {
    globalThis.localStorage.setItem(
      'd2runes_inventory',
      JSON.stringify([
        ['Tal', 3],
        ['Eth', 1],
      ]),
    );
    const { runeCounts } = await import('./store.js');
    let value;
    runeCounts.subscribe((m) => (value = m))();
    expect(value.get('Tal')).toBe(3);
    expect(value.get('Eth')).toBe(1);
    expect(value.get('El')).toBe(0);
  });

  it('falls back to zero counts on corrupted localStorage value', async () => {
    globalThis.localStorage.setItem('d2runes_inventory', 'not json{{{');
    const { runeCounts } = await import('./store.js');
    let value;
    runeCounts.subscribe((m) => (value = m))();
    expect([...value.values()].every((c) => c === 0)).toBe(true);
  });

  it('writes to localStorage on increment', async () => {
    const { runeCounts } = await import('./store.js');
    runeCounts.increment('El');
    const saved = new Map(JSON.parse(globalThis.localStorage.getItem('d2runes_inventory')));
    expect(saved.get('El')).toBe(1);
  });

  it('resetAll clears the localStorage key', async () => {
    const { runeCounts } = await import('./store.js');
    runeCounts.increment('El');
    runeCounts.resetAll();
    expect(globalThis.localStorage.getItem('d2runes_inventory')).toBeNull();
  });
});
