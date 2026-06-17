/**
 * @param {Array} runewords
 * @param {Map<string, number>} runeCounts
 * @returns {Array}
 */
export function filterRunewords(runewords, runeCounts) {
  const hasAny = [...runeCounts.values()].some((v) => v > 0);
  if (!hasAny) return runewords;

  return runewords.filter((rw) => {
    const required = new Map();
    for (const rune of rw.runes) {
      required.set(rune, (required.get(rune) ?? 0) + 1);
    }
    for (const [rune, count] of required) {
      if ((runeCounts.get(rune) ?? 0) < count) return false;
    }
    return true;
  });
}
