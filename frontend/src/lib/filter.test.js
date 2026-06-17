import { describe, it, expect } from 'vitest';
import { filterRunewords } from './filter.js';

const runewords = [
  { name: 'Spirit', runes: ['Tal', 'Thul', 'Ort', 'Amn'] },
  { name: 'Stealth', runes: ['Tal', 'Eth'] },
  { name: 'Insight', runes: ['Ral', 'Tir', 'Tal', 'Sol'] },
];

function counts(entries) {
  return new Map(entries);
}

describe('filterRunewords', () => {
  it('returns all when all counts zero', () => {
    expect(filterRunewords(runewords, counts([['Tal', 0], ['Eth', 0]]))).toEqual(runewords);
  });

  it('exact count match', () => {
    expect(filterRunewords(runewords, counts([['Tal', 1], ['Eth', 1]]))).toEqual([runewords[1]]);
  });

  it('count too low — excluded', () => {
    // Stealth needs Eth=1 (missing), Insight needs Ral/Tir/Sol (missing)
    expect(filterRunewords(runewords, counts([['Tal', 1], ['Ort', 1], ['Amn', 1], ['Thul', 1]]))).toEqual([runewords[0]]);
  });

  it('surplus count — included', () => {
    const all = counts([
      ['Tal', 5], ['Thul', 2], ['Ort', 2], ['Amn', 2],
      ['Eth', 3], ['Ral', 1], ['Tir', 1], ['Sol', 1],
    ]);
    expect(filterRunewords(runewords, all)).toEqual(runewords);
  });

  it('Clear All restores full list', () => {
    const zeroed = counts([
      ['Tal', 0], ['Thul', 0], ['Ort', 0], ['Amn', 0],
      ['Eth', 0], ['Ral', 0], ['Tir', 0], ['Sol', 0],
    ]);
    expect(filterRunewords(runewords, zeroed)).toEqual(runewords);
  });
});
