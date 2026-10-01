import { maxLevel, rank, type Level } from './levels'
import type { RuleResult } from './rules'
import type { TriageOutput } from './schema'

export interface ClassifierVote {
  level: Level
  probabilities: Record<Level, number>
}

export interface TriageInputs {
  rules: RuleResult
  classifier: ClassifierVote | null
  /** Validated model output; null if live mode is off, failed, or returned bad JSON. */
  model: TriageOutput | null
  /** Was a model call attempted? Distinguishes "demo mode" from "model failed". */
  modelAttempted: boolean
  notReadyDetected: boolean
  /** Chunk IDs retrieved for this message, best first. */
  retrievedIds: string[]
}

export type DecidedBy = 'rules' | 'classifier' | 'model'

export interface TriageDecision {
  level: Level
  /** Which layer(s) produced the final level. Shown in a "how Echo decided" view. */
  decidedBy: DecidedBy[]
  /** Every layer's individual vote (null = no vote), so the UI can show how the level was reached. */
  votes: Record<DecidedBy, Level | null>
  signals: string[]
  citations: string[]
  notReady: boolean
  /** Model's explanation + reply, if a valid one exists. */
  reason: string | null
  reply: string | null
  /** True when a model call was attempted but gave no usable answer. */
  usedFallback: boolean
}

/**
 * Combines all triage votes into one decision.
 *
 * Escalate-only: the final level is the MOST serious vote. A model can raise
 * the level but never lower what the rules found, so a model mistake can't
 * hide the emergency screen.
 */
export function route(input: TriageInputs): TriageDecision {
  const { rules, classifier, model } = input
  const votes: [DecidedBy, Level | null][] = [
    ['rules', rules.level],
    ['classifier', classifier?.level ?? null],
    ['model', model?.level ?? null],
  ]
  const level = maxLevel(...votes.map(([, l]) => l))
  const decidedBy = votes.filter(([, l]) => l !== null && rank(l) === rank(level)).map(([name]) => name)

  // Only keep citations that point to chunks we actually retrieved (no hallucinated sources).
  const allowed = new Set(input.retrievedIds)
  const modelCitations = (model?.citations ?? []).filter((id) => allowed.has(id))
  const citations = modelCitations.length ? modelCitations : input.retrievedIds.slice(0, 2)

  return {
    level,
    decidedBy: decidedBy.length ? decidedBy : ['rules'], // nothing matched → default mild
    votes: Object.fromEntries(votes) as Record<DecidedBy, Level | null>,
    signals: rules.signals,
    citations,
    notReady: input.notReadyDetected || (model?.not_ready ?? false),
    reason: model?.reason ?? null,
    reply: model?.reply ?? null,
    usedFallback: input.modelAttempted && model === null,
  }
}
