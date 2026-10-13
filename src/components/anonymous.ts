const GLYPHS = '▚▞▖▗▙▟░▒▓█▛▜▘▝╳';

export function redactName(name: string): string {
  return [...name].map((character, index) => GLYPHS[((character.codePointAt(0) ?? 0) + index * 7) % GLYPHS.length]).join('');
}

export function anonymousShade(name: string): number {
  let hash = 7;
  for (const character of name) hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 1013;
  return 58 + (hash % 6) * 8;
}
