import { computeEffectiveCounts, resolveRuneword } from './cube.js';

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
      runeSlots: rw.runes.map((rune) => ({ rune, cubePath: null, cubeSources: null })),
    }));
  }

  return runewords
    .map((rw) => {
      const resolved = resolveRuneword(rw.runes, owned);
      if (resolved === null) return null;

      const statuses = [...resolved.values()].flatMap((slots) => slots.map((s) => s.status));
      const allDirect = statuses.every((s) => s === 'direct');
      const allCubed = statuses.every((s) => s === 'cubed');
      const classification = allDirect ? 'direct' : allCubed ? 'full-cube' : 'partial-cube';

      const nextIndex = new Map();
      const runeSlots = rw.runes.map((rune) => {
        const i = nextIndex.get(rune) ?? 0;
        nextIndex.set(rune, i + 1);
        const slot = resolved.get(rune)[i];
        return { rune, cubePath: slot.cubePath, cubeSources: slot.cubeSources };
      });

      return { ...rw, classification, runeSlots };
    })
    .filter((rw) => rw !== null);
}
