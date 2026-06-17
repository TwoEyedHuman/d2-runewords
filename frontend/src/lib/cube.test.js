import { describe, it, expect } from 'vitest';
import {
  RUNE_ORDER,
  computeEffectiveCounts,
  getCubePath,
  classifyRuneSlot,
  resolveRuneword,
} from './cube.js';

function makeOwned(entries) {
  const owned = new Map(RUNE_ORDER.map((r) => [r, 0]));
  for (const [rune, count] of entries) owned.set(rune, count);
  return owned;
}

describe('computeEffectiveCounts', () => {
  it('returns all zero for zero inventory', () => {
    const effective = computeEffectiveCounts(makeOwned([]));
    expect([...effective.values()].every((v) => v === 0)).toBe(true);
  });

  it('exact raw count stays as effective count with no cube-up needed', () => {
    const effective = computeEffectiveCounts(makeOwned([['El', 5]]));
    expect(effective.get('El')).toBe(5);
  });

  it('3 El cubes up to 1 Eld', () => {
    const effective = computeEffectiveCounts(makeOwned([['El', 3]]));
    expect(effective.get('Eld')).toBe(1);
  });

  it('9 El cubes up to 1 Tir', () => {
    const effective = computeEffectiveCounts(makeOwned([['El', 9]]));
    expect(effective.get('Tir')).toBe(1);
  });

  it('6 El + 1 Eld cubes up to 1 Tir', () => {
    const effective = computeEffectiveCounts(
      makeOwned([
        ['El', 6],
        ['Eld', 1],
      ]),
    );
    expect(effective.get('Tir')).toBe(1);
  });

  it('does not inflate effective count display for >99 base runes', () => {
    const effective = computeEffectiveCounts(makeOwned([['El', 150]]));
    expect(effective.get('El')).toBe(150);
  });

  it('cubes a high rune (Ber) all the way up from enough El', () => {
    const berIndex = RUNE_ORDER.indexOf('Ber');
    const needed = CUBE_RATIO_POW(berIndex);
    const effective = computeEffectiveCounts(makeOwned([['El', needed]]));
    expect(effective.get('Ber')).toBeGreaterThanOrEqual(1);
  });
});

function CUBE_RATIO_POW(steps) {
  return 3 ** steps;
}

describe('getCubePath', () => {
  it('returns null when user already has enough raw runes', () => {
    expect(getCubePath('El', makeOwned([['El', 1]]))).toBeNull();
  });

  it('returns "El^3 → Eld" for 3 El', () => {
    expect(getCubePath('Eld', makeOwned([['El', 3]]))).toBe('El^3 → Eld');
  });

  it('returns "El^9 → Tir" for 9 El', () => {
    expect(getCubePath('Tir', makeOwned([['El', 9]]))).toBe('El^9 → Tir');
  });

  it('returns mixed-intermediate path "El^6 + Eld^1 → Tir"', () => {
    const path = getCubePath(
      'Tir',
      makeOwned([
        ['El', 6],
        ['Eld', 1],
      ]),
    );
    expect(path).toBe('El^6 + Eld^1 → Tir');
  });

  it('renders counts over 99 as "a ton" in the path string', () => {
    const talIndex = RUNE_ORDER.indexOf('Tal');
    const needed = 3 ** talIndex;
    expect(needed).toBeGreaterThan(99);
    const path = getCubePath('Tal', makeOwned([['El', needed]]));
    expect(path).toBe('El^a ton → Tal');
  });

  it('cubes a high rune (Ber) all the way up from enough El', () => {
    const berIndex = RUNE_ORDER.indexOf('Ber');
    const needed = 3 ** berIndex;
    const path = getCubePath('Ber', makeOwned([['El', needed]]));
    expect(path).toMatch(/→ Ber$/);
    expect(path).toContain('El^');
  });
});

describe('classifyRuneSlot', () => {
  it('classifies direct when raw count meets requirement', () => {
    expect(classifyRuneSlot('El', 2, makeOwned([['El', 2]]))).toBe('direct');
  });

  it('classifies cubed when only cube-up satisfies requirement', () => {
    expect(classifyRuneSlot('Eld', 1, makeOwned([['El', 3]]))).toBe('cubed');
  });

  it('classifies unavailable when even full cube-up falls short', () => {
    expect(classifyRuneSlot('Tir', 1, makeOwned([['El', 3]]))).toBe('unavailable');
  });
});

describe('resolveRuneword', () => {
  it('classifies each slot direct when raw counts cover every slot', () => {
    const resolved = resolveRuneword(
      ['El', 'Eth'],
      makeOwned([
        ['El', 1],
        ['Eth', 1],
      ]),
    );
    expect(resolved.get('El')[0].status).toBe('direct');
    expect(resolved.get('Eth')[0].status).toBe('direct');
  });

  it("does not let a rune satisfy both its own direct slot and another slot's cube-up", () => {
    // Malice: Ith, El, Eth. 1 El + 3 Eth looks enough in isolation (3 Eth
    // cubes to 1 Ith), but those same 3 Eth are also the recipe's own Eth
    // slot — spending them on Ith leaves nothing for the direct Eth slot.
    const owned = makeOwned([
      ['El', 1],
      ['Eth', 3],
    ]);
    expect(resolveRuneword(['Ith', 'El', 'Eth'], owned)).toBeNull();
  });

  it('still allows cubing when there is enough Eth for both the direct slot and the cube-up', () => {
    const owned = makeOwned([
      ['El', 1],
      ['Eth', 4],
    ]);
    const resolved = resolveRuneword(['Ith', 'El', 'Eth'], owned);
    expect(resolved.get('Eth')[0].status).toBe('direct');
    expect(resolved.get('El')[0].status).toBe('direct');
    expect(resolved.get('Ith')[0].status).toBe('cubed');
    expect(resolved.get('Ith')[0].cubePath).toBe('Eth^3 → Ith');
  });

  it('does not mutate the owned map passed in', () => {
    const owned = makeOwned([['Eth', 4]]);
    resolveRuneword(['Ith'], owned);
    expect(owned.get('Eth')).toBe(4);
  });

  it('resolves duplicate-rune slots independently — one direct, one cubed', () => {
    // Bone-style recipe needing 2x Um: 1 owned directly, the second only
    // reachable via cubing 3 Pul. Each Um slot must report its own truth,
    // not a blended aggregate of "1 direct + 1 cubed" applied to both.
    const owned = makeOwned([
      ['Um', 1],
      ['Pul', 3],
    ]);
    const resolved = resolveRuneword(['Um', 'Um'], owned);
    const slots = resolved.get('Um');
    expect(slots).toHaveLength(2);
    expect(slots[0]).toEqual({ status: 'direct', cubePath: null, cubeSources: null });
    expect(slots[1]).toEqual({
      status: 'cubed',
      cubePath: 'Pul^3 → Um',
      cubeSources: [{ rune: 'Pul', count: 3 }],
    });
  });
});
