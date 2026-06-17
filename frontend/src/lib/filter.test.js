import { describe, it, expect } from 'vitest';
import { filterRunewords } from './filter.js';
import { RUNE_ORDER, getCubePath } from './cube.js';

const runewords = [
  { name: 'Spirit', runes: ['Tal', 'Thul', 'Ort', 'Amn'] },
  { name: 'Stealth', runes: ['Tal', 'Eth'] },
  { name: 'Insight', runes: ['Ral', 'Tir', 'Tal', 'Sol'] },
];

function owned(entries) {
  return new Map(entries);
}

function direct(rw) {
  return {
    ...rw,
    classification: 'direct',
    runeSlots: rw.runes.map((rune) => ({ rune, cubePath: null })),
  };
}

function withCubePaths(rw, classification, ownedMap) {
  return {
    ...rw,
    classification,
    runeSlots: rw.runes.map((rune) => ({ rune, cubePath: getCubePath(rune, ownedMap) })),
  };
}

describe('filterRunewords', () => {
  it('returns all, classified direct, when all counts zero', () => {
    expect(
      filterRunewords(
        runewords,
        owned([
          ['Tal', 0],
          ['Eth', 0],
        ]),
      ),
    ).toEqual(runewords.map(direct));
  });

  it('classifies direct when raw counts meet requirement exactly', () => {
    expect(
      filterRunewords(
        runewords,
        owned([
          ['Tal', 1],
          ['Eth', 1],
        ]),
      ),
    ).toEqual([direct(runewords[1])]);
  });

  it('excludes runewords with any unavailable slot', () => {
    expect(
      filterRunewords(
        runewords,
        owned([
          ['Tal', 1],
          ['Ort', 1],
          ['Amn', 1],
          ['Thul', 1],
        ]),
      ),
    ).toEqual([direct(runewords[0])]);
  });

  it('classifies full-cube when every slot is satisfied only via cubing', () => {
    const talIndex = RUNE_ORDER.indexOf('Tal');
    const ethIndex = RUNE_ORDER.indexOf('Eth');
    const needed = 3 ** Math.max(talIndex, ethIndex);
    const ownedMap = owned([['El', needed]]);
    const result = filterRunewords([runewords[1]], ownedMap);
    expect(result).toEqual([withCubePaths(runewords[1], 'full-cube', ownedMap)]);
  });

  it('classifies partial-cube when some slots are direct and some are cubed', () => {
    const ethIndex = RUNE_ORDER.indexOf('Eth');
    const needed = 3 ** ethIndex;
    const ownedMap = owned([
      ['Tal', 1],
      ['El', needed],
    ]);
    const result = filterRunewords([runewords[1]], ownedMap);
    expect(result).toEqual([withCubePaths(runewords[1], 'partial-cube', ownedMap)]);
  });

  it('excludes a runeword when a slot is unavailable even via cubing', () => {
    expect(
      filterRunewords(
        [runewords[1]],
        owned([
          ['Tal', 1],
          ['El', 1],
        ]),
      ),
    ).toEqual([]);
  });

  it('mixed inventories: direct, partial-cube, and excluded runewords coexist', () => {
    const ownedMap = owned([
      ['Tal', 5],
      ['Thul', 2],
      ['Ort', 2],
      ['Amn', 2],
      ['El', 81],
    ]);
    const result = filterRunewords(runewords, ownedMap);
    expect(result).toEqual([
      direct(runewords[0]),
      withCubePaths(runewords[1], 'partial-cube', ownedMap),
    ]);
  });
});
