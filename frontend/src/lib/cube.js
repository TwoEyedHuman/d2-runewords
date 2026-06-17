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

/**
 * Resolves every rune slot in a runeword's recipe against a single shared
 * pool, so a rune cubed up to satisfy one slot is no longer available raw
 * for another slot in the same recipe (e.g. cubing 3 Eth into 1 Ith leaves
 * none of those Eth free for a slot that needs Eth directly).
 *
 * Required runes are resolved lowest-tier first: a low-tier slot has no
 * alternative supply (only its own raw count, or nothing), while a
 * higher-tier slot can draw from several tiers below it — so the
 * constrained slot must claim its share before the flexible one.
 *
 * Each rune that appears more than once in the recipe (e.g. 2x Um) is
 * resolved one unit at a time rather than as a single batch of N, because
 * the batch can be a mix — one unit covered by an owned rune, the next
 * only reachable by cubing. Resolving unit-by-unit lets each slot instance
 * report its own true status instead of an aggregate that doesn't belong
 * to any single slot.
 *
 * @param {string[]} runes - one entry per slot, duplicates allowed
 * @param {Map<string, number>} owned
 * @returns {Map<string, Array<{
 *   status: 'direct' | 'cubed',
 *   cubePath: string | null,
 *   cubeSources: Array<{ rune: string, count: number }> | null,
 * }>> | null} one entry per slot instance of that rune, in resolution
 *   order; null when the recipe is not buildable even with cubing
 */
export function resolveRuneword(runes, owned) {
  const required = new Map();
  for (const rune of runes) {
    required.set(rune, (required.get(rune) ?? 0) + 1);
  }

  const remaining = new Map(owned);
  const result = new Map();

  const ascendingRunes = [...required.keys()].sort(
    (a, b) => RUNE_ORDER.indexOf(a) - RUNE_ORDER.indexOf(b),
  );

  for (const rune of ascendingRunes) {
    const requiredCount = required.get(rune);
    const slots = [];

    for (let unit = 0; unit < requiredCount; unit++) {
      const contributions = new Map();
      let need = 1;
      let idx = RUNE_ORDER.indexOf(rune);

      while (need > 0) {
        if (idx < 0) return null;
        const runeAtIdx = RUNE_ORDER[idx];
        const availableHere = remaining.get(runeAtIdx) ?? 0;
        const takeDirect = Math.min(availableHere, need);
        if (takeDirect > 0) {
          contributions.set(runeAtIdx, (contributions.get(runeAtIdx) ?? 0) + takeDirect);
        }
        need = (need - takeDirect) * CUBE_RATIO;
        idx -= 1;
      }

      for (const [sourceRune, used] of contributions) {
        remaining.set(sourceRune, (remaining.get(sourceRune) ?? 0) - used);
      }

      const isDirect = contributions.size === 1 && contributions.get(rune) === 1;
      const cubePath = isDirect
        ? null
        : `${RUNE_ORDER.filter((r) => contributions.has(r))
            .map((r) => `${r}^${formatCount(contributions.get(r))}`)
            .join(' + ')} → ${rune}`;
      const cubeSources = isDirect
        ? null
        : RUNE_ORDER.filter((r) => r !== rune && contributions.has(r)).map((r) => ({
            rune: r,
            count: contributions.get(r),
          }));

      slots.push({ status: isDirect ? 'direct' : 'cubed', cubePath, cubeSources });
    }

    result.set(rune, slots);
  }

  return result;
}
