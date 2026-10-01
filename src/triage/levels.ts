/** Severity levels, least to most serious. Order matters: it defines "more serious". */
export const LEVELS = ['mild', 'moderate', 'serious', 'crisis'] as const
export type Level = (typeof LEVELS)[number]

export function rank(level: Level): number {
  return LEVELS.indexOf(level)
}

/**
 * Returns the most serious of the given levels (ignoring missing votes).
 * This is the "escalate-only" rule: any layer can raise the level, none can lower it.
 */
export function maxLevel(...levels: (Level | null | undefined)[]): Level {
  return levels.reduce<Level>((max, l) => (l && rank(l) > rank(max) ? l : max), 'mild')
}
