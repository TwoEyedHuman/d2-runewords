import { writable } from 'svelte/store';

const ALL_RUNES = [
  'El', 'Eld', 'Tir', 'Nef', 'Eth', 'Ith', 'Tal', 'Ral', 'Ort', 'Thul',
  'Amn', 'Sol', 'Shael', 'Dol', 'Hel', 'Io', 'Lum', 'Ko', 'Fal', 'Lem',
  'Pul', 'Um', 'Mal', 'Ist', 'Gul', 'Vex', 'Ohm', 'Lo', 'Sur', 'Ber',
  'Jah', 'Cham', 'Zod',
];

function createRuneCounts() {
  const initial = new Map(ALL_RUNES.map((r) => [r, 0]));
  const { subscribe, update, set } = writable(initial);

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
      set(new Map(ALL_RUNES.map((r) => [r, 0])));
    },
  };
}

export const runeCounts = createRuneCounts();
