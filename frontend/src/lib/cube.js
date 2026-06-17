export const RUNE_ORDER = [
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

const CUBE_RATIO = 3;

/**
 * @param {Map<string, number>} owned
 * @returns {Map<string, number>}
 */
export function computeEffectiveCounts(owned) {
  const effective = new Map();
  let carry = 0;
  for (const rune of RUNE_ORDER) {
    const value = (owned.get(rune) ?? 0) + carry;
    effective.set(rune, value);
    carry = Math.floor(value / CUBE_RATIO);
  }
  return effective;
}

function formatCount(count) {
  return count > 99 ? 'a ton' : String(count);
}

/**
 * @param {string} rune
 * @param {Map<string, number>} owned
 * @returns {string | null}
 */
export function getCubePath(rune, owned) {
  const targetIndex = RUNE_ORDER.indexOf(rune);
  if (targetIndex === -1) return null;
  if ((owned.get(rune) ?? 0) >= 1) return null;

  const contributions = new Map();
  let idx = targetIndex;
  let need = 1;
  while (need > 0) {
    if (idx < 0) return null;
    const runeAtIdx = RUNE_ORDER[idx];
    const ownedHere = owned.get(runeAtIdx) ?? 0;
    const takeDirect = Math.min(ownedHere, need);
    if (takeDirect > 0) {
      contributions.set(runeAtIdx, (contributions.get(runeAtIdx) ?? 0) + takeDirect);
    }
    need = (need - takeDirect) * CUBE_RATIO;
    idx -= 1;
  }

  const parts = RUNE_ORDER.filter((r) => contributions.has(r)).map(
    (r) => `${r}^${formatCount(contributions.get(r))}`,
  );
  return `${parts.join(' + ')} → ${rune}`;
}

/**
 * @param {string} rune
 * @param {number} requiredCount
 * @param {Map<string, number>} owned
 * @returns {'direct' | 'cubed' | 'unavailable'}
 */
export function classifyRuneSlot(rune, requiredCount, owned) {
  if ((owned.get(rune) ?? 0) >= requiredCount) return 'direct';
  const effective = computeEffectiveCounts(owned);
  if ((effective.get(rune) ?? 0) >= requiredCount) return 'cubed';
  return 'unavailable';
}
