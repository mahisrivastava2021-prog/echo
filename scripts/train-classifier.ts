/**
 * Trains the Naive Bayes triage classifier: data/train.en.jsonl → src/triage/classifier.en.json
 * Run: npm run train
 *
 * Training = counting. For each level, count how often each feature (word or
 * word pair) appears, then convert counts to log-probabilities with add-one
 * (Laplace) smoothing so unseen combinations never get probability zero.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { features } from '../src/triage/features'
import { LEVELS, type Level } from '../src/triage/levels'
import type { NbModel } from '../src/triage/classifier'

const ALPHA = 1 // Laplace smoothing
const MIN_COUNT = 1 // drop nothing for now; the dataset is small

const rows = readFileSync('data/train.en.jsonl', 'utf8')
  .trim()
  .split('\n')
  .map((l) => JSON.parse(l) as { text: string; label: Level })

const labels = [...LEVELS]
const docCount = labels.map(() => 0)
const featureCounts = labels.map(() => new Map<string, number>())
const totalFeatures = labels.map(() => 0)
const vocab = new Set<string>()

for (const { text, label } of rows) {
  const i = labels.indexOf(label)
  if (i < 0) throw new Error(`unknown label "${label}" in: ${text}`)
  docCount[i]++
  for (const f of features(text)) {
    featureCounts[i].set(f, (featureCounts[i].get(f) ?? 0) + 1)
    totalFeatures[i]++
    vocab.add(f)
  }
}

const kept = [...vocab].filter((f) => featureCounts.reduce((s, m) => s + (m.get(f) ?? 0), 0) >= MIN_COUNT)
const round = (x: number) => Math.round(x * 1000) / 1000 // keeps the JSON small

const model: NbModel = {
  labels,
  logPriors: docCount.map((c) => round(Math.log(c / rows.length))),
  logLikelihoods: Object.fromEntries(
    kept.sort().map((f) => [
      f,
      labels.map((_, i) => round(Math.log(((featureCounts[i].get(f) ?? 0) + ALPHA) / (totalFeatures[i] + ALPHA * kept.length)))),
    ]),
  ),
}

writeFileSync('src/triage/classifier.en.json', JSON.stringify(model) + '\n')
console.log(`✓ trained on ${rows.length} examples, ${kept.length} features → src/triage/classifier.en.json`)
