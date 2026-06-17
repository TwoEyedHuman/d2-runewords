import { computeEffectiveCounts, classifyRuneSlot, getCubePath } from './cube.js';

/**
 * @param {Array} runewords
 * @param {Map<string, number>} owned
 * @returns {Array}
 */
export function filterRunewords(runewords, owned) {
  const effective = computeEffectiveCounts(owned);
  const hasAny = [...effective.values()].some((v) => v > 0);
  if (!hasAny) {
    return runewords.map((rw) => ({
      ...rw,
      classification: 'direct',
      runeSlots: rw.runes.map((rune) => ({ rune, cubePath: null })),
    }));
  }

  return runewords
    .map((rw) => {
      const required = new Map();
      for (const rune of rw.runes) {
        required.set(rune, (required.get(rune) ?? 0) + 1);
      }

      const slotClassifications = [...required].map(([rune, count]) =>
        classifyRuneSlot(rune, count, owned),
      );

      if (slotClassifications.includes('unavailable')) return null;

      const allDirect = slotClassifications.every((c) => c === 'direct');
      const allCubed = slotClassifications.every((c) => c === 'cubed');
      const classification = allDirect ? 'direct' : allCubed ? 'full-cube' : 'partial-cube';

      const runeSlots = rw.runes.map((rune) => ({ rune, cubePath: getCubePath(rune, owned) }));

      return { ...rw, classification, runeSlots };
    })
    .filter((rw) => rw !== null);
}
