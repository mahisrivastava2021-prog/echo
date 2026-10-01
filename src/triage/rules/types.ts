import type { Level } from '../levels'

/** One deterministic signal, e.g. "passport-held" → serious. The id is shown to the user as the "why". */
export interface Signal {
  id: string
  level: Exclude<Level, 'mild'>
  patterns: RegExp[]
}

/** A language's rule set. Adding a language = adding a file that exports one of these. */
export interface RuleSet {
  /** Fixes common misspellings and informal words before matching. */
  normalize: (text: string) => string
  signals: Signal[]
}
