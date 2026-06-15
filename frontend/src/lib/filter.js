/**
 * @param {Array} runewords
 * @param {Set<string>} selectedRunes
 * @returns {Array}
 */
export function filterRunewords(runewords, selectedRunes) {
  if (selectedRunes.size === 0) return runewords;
  return runewords.filter(rw =>
    rw.runes.every(r => selectedRunes.has(r))
  );
}
