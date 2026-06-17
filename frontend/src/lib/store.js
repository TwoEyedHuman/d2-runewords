import { writable } from 'svelte/store';

const ALL_RUNES = [
  'El',
  'Eld',
  'Tir',
  'Nef',
  'Eth',
  'Ith',
  'Tal',
  'Ral',
  'Ort',
  'Thul',
  'Amn',
  'Sol',
  'Shael',
  'Dol',
  'Hel',
  'Io',
  'Lum',
  'Ko',
  'Fal',
  'Lem',
  'Pul',
  'Um',
  'Mal',
  'Ist',
  'Gul',
  'Vex',
  'Ohm',
  'Lo',
  'Sur',
  'Ber',
  'Jah',
  'Cham',
  'Zod',
];

const STORAGE_KEY = 'd2runes_inventory';

function zeroMap() {
  return new Map(ALL_RUNES.map((r) => [r, 0]));
}

function loadFromStorage() {
  if (typeof localStorage === 'undefined') return zeroMap();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return zeroMap();
    const entries = JSON.parse(raw);
    const map = zeroMap();
    for (const [rune, count] of entries) {
      if (map.has(rune)) map.set(rune, count);
    }
    return map;
  } catch {
    return zeroMap();
  }
}

function saveToStorage(map) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...map]));
}

function createRuneCounts() {
  const { subscribe, update, set } = writable(loadFromStorage());

  subscribe((m) => saveToStorage(m));

  return {
    subscribe,
    increment(rune) {
      update((m) => {
        const next = new Map(m);
        next.set(rune, (next.get(rune) ?? 0) + 1);
        return next;
      });
    },
    reset(rune) {
      update((m) => {
        const next = new Map(m);
        next.set(rune, 0);
        return next;
      });
    },
    resetAll() {
      set(zeroMap());
      if (typeof localStorage !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    },
  };
}

export const runeCounts = createRuneCounts();
