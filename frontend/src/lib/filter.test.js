import { describe, it, expect } from 'vitest';
import { filterRunewords } from './filter.js';

const runewords = [
  { name: 'Spirit', runes: ['Tal', 'Thul', 'Ort', 'Amn'] },
  { name: 'Stealth', runes: ['Tal', 'Eth'] },
  { name: 'Insight', runes: ['Ral', 'Tir', 'Tal', 'Sol'] },
];

describe('filterRunewords', () => {
  it('returns all when selection empty', () => {
    expect(filterRunewords(runewords, new Set())).toEqual(runewords);
  });

  it('exact match', () => {
    const selected = new Set(['Tal', 'Eth']);
    expect(filterRunewords(runewords, selected)).toEqual([runewords[1]]);
  });

  it('superset match — user has extra runes', () => {
    const selected = new Set(['Tal', 'Eth', 'Ral', 'Tir', 'Sol', 'Amn', 'Thul', 'Ort']);
    const result = filterRunewords(runewords, selected);
    expect(result).toEqual(runewords);
  });

  it('no match — missing required rune', () => {
    const selected = new Set(['Tal', 'Ort', 'Amn']); // missing Thul for Spirit
    expect(filterRunewords(runewords, selected)).toEqual([]);
  });
});
