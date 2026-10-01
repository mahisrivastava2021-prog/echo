import { maxLevel, type Level } from '../levels'
import { rulesEn } from './en'
import type { RuleSet } from './types'

const RULE_SETS: Record<string, RuleSet> = { en: rulesEn }

export interface RuleResult {
  /** Most serious matched level, or null if no signal matched (no vote). */
  level: Level | null
  /** IDs of every matched signal, e.g. ['passport-held', 'verbal-abuse']. */
  signals: string[]
  crisis: boolean
}

/**
 * Deterministic triage rules. Synchronous, pure and offline, so they can run
 * BEFORE any network call and still work if everything else fails.
 */
export function runRules(text: string, lang = 'en'): RuleResult {
  const rules = RULE_SETS[lang] ?? rulesEn
  const normalized = rules.normalize(text)
  const matched = rules.signals.filter((s) => s.patterns.some((p) => p.test(normalized)))
  const level = matched.length ? maxLevel(...matched.map((s) => s.level)) : null
  return { level, signals: matched.map((s) => s.id), crisis: level === 'crisis' }
}
