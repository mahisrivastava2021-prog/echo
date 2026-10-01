import modelEn from './classifier.en.json'
import { features } from './features'
import { LEVELS, type Level } from './levels'
import type { ClassifierVote } from './router'

/**
 * Multinomial Naive Bayes classifier, trained offline by scripts/train-classifier.ts.
 *
 * score(level) = log P(level) + Σ log P(feature | level)
 * The highest score wins. The model is just these numbers in a JSON file, so it is
 * tiny, runs offline in the browser, and every decision can be explained word by word.
 */
export interface NbModel {
  labels: Level[]
  logPriors: number[]
  /** feature → log-likelihood per label (same order as `labels`). */
  logLikelihoods: Record<string, number[]>
}

const model = modelEn as NbModel

/** If the next-more-serious level is at least this likely, choose it ("err toward more serious"). */
export const ERR_UP_THRESHOLD = 0.35
/** Messages with fewer known features than this get no classifier vote (too little evidence). */
const MIN_KNOWN_FEATURES = 2

export function classify(text: string, m: NbModel = model): ClassifierVote | null {
  const known = features(text).filter((f) => f in m.logLikelihoods)
  if (known.length < MIN_KNOWN_FEATURES) return null

  const scores = m.labels.map((_, i) => m.logPriors[i] + known.reduce((sum, f) => sum + m.logLikelihoods[f][i], 0))

  // Softmax: turn log-scores into probabilities that sum to 1.
  const top = Math.max(...scores)
  const exps = scores.map((s) => Math.exp(s - top))
  const total = exps.reduce((a, b) => a + b, 0)
  const probabilities = Object.fromEntries(m.labels.map((l, i) => [l, exps[i] / total])) as Record<Level, number>

  let best = m.labels[scores.indexOf(top)]
  const next = LEVELS[LEVELS.indexOf(best) + 1]
  if (next && probabilities[next] >= ERR_UP_THRESHOLD) best = next

  return { level: best, probabilities }
}
