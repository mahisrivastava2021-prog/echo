/**
 * Triage evaluation. Run: npm run eval
 *
 * Measures each layer separately (rules, classifier) and the combined router,
 * then writes evals/results/latest.{json,md}.
 *
 * CI GATE: exits with code 1 if the deterministic rules ALONE miss any crisis
 * in the scenarios or in the must-catch list. The rules are the safety net, so
 * they must catch every crisis without help from any model.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { classify } from '../src/triage/classifier'
import { detectNotReady } from '../src/triage/notReady'
import { LEVELS, rank, type Level } from '../src/triage/levels'
import { route } from '../src/triage/router'
import { runRules } from '../src/triage/rules'
import { rulesEn } from '../src/triage/rules/en'
import { retrieve } from '../src/rag/retrieve'

interface Scenario {
  id: string
  text: string
  expected: Level
  tags: string[]
  expected_chunks: string[]
}

const readLines = (path: string) =>
  readFileSync(path, 'utf8')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))

const scenarios: Scenario[] = readLines('evals/scenarios.en.jsonl').map((l) => JSON.parse(l))
const mustCatch = readLines('evals/crisis-phrasings.en.txt')
const holdout = readLines('evals/crisis-holdout.en.txt')
const training = readLines('data/train.en.jsonl').map((l) => rulesEn.normalize(JSON.parse(l).text))

// ── Leakage check: eval sentences must never appear in the training data ──
const trainSet = new Set(training)
const leaked = [...scenarios.map((s) => s.text), ...mustCatch, ...holdout].filter((t) => trainSet.has(rulesEn.normalize(t)))

// ── Predictions per layer ──
type Layer = 'rules' | 'classifier' | 'combined'
function predict(text: string): Record<Layer, Level> {
  const rules = runRules(text)
  const classifier = classify(text)
  const decision = route({
    rules,
    classifier,
    model: null,
    modelAttempted: false,
    notReadyDetected: detectNotReady(text),
    retrievedIds: [],
  })
  return { rules: rules.level ?? 'mild', classifier: classifier?.level ?? 'mild', combined: decision.level }
}

const preds = scenarios.map((s) => ({ s, p: predict(s.text) }))

function metrics(layer: Layer) {
  const confusion = Object.fromEntries(LEVELS.map((e) => [e, Object.fromEntries(LEVELS.map((p) => [p, 0]))])) as Record<
    Level,
    Record<Level, number>
  >
  let correct = 0
  let under = 0
  let over = 0
  for (const { s, p } of preds) {
    const got = p[layer]
    confusion[s.expected][got]++
    if (got === s.expected) correct++
    else if (rank(got) < rank(s.expected)) under++
    else over++
  }
  const crisisCases = preds.filter(({ s }) => s.expected === 'crisis')
  const crisisCaught = crisisCases.filter(({ p }) => p[layer] === 'crisis').length
  const flaggedCrisis = preds.filter(({ p }) => p[layer] === 'crisis')
  const truePos = flaggedCrisis.filter(({ s }) => s.expected === 'crisis').length
  return {
    accuracy: correct / preds.length,
    underTriageRate: under / preds.length,
    overTriageRate: over / preds.length,
    crisisRecall: crisisCaught / crisisCases.length,
    crisisPrecision: flaggedCrisis.length ? truePos / flaggedCrisis.length : 1,
    confusion,
  }
}

const layers = { rules: metrics('rules'), classifier: metrics('classifier'), combined: metrics('combined') }

// ── Must-catch and holdout crisis lists (rules alone) ──
const mustCatchMissed = mustCatch.filter((t) => !runRules(t).crisis)
const holdoutMissedRules = holdout.filter((t) => !runRules(t).crisis)
const holdoutMissedCombined = holdout.filter((t) => predict(t).combined !== 'crisis')

// ── Retrieval recall@3 ──
const withChunks = scenarios.filter((s) => s.expected_chunks.length)
const retrievalHits = withChunks.filter((s) => {
  const ids = retrieve(s.text).map((r) => r.chunk.id)
  return s.expected_chunks.some((c) => ids.includes(c))
})

// ── Borderline accuracy (combined) ──
const borderline = preds.filter(({ s }) => s.tags.some((t) => t.startsWith('borderline')))
const borderlineCorrect = borderline.filter(({ s, p }) => p.combined === s.expected).length

const crisisMissedByRules = preds.filter(({ s, p }) => s.expected === 'crisis' && p.rules !== 'crisis').map(({ s }) => s)
const wrongCombined = preds.filter(({ s, p }) => p.combined !== s.expected).map(({ s, p }) => ({ id: s.id, text: s.text, expected: s.expected, ...p }))

const results = {
  date: new Date().toISOString().slice(0, 10),
  counts: { scenarios: scenarios.length, mustCatch: mustCatch.length, holdout: holdout.length, training: training.length },
  layers,
  borderlineAccuracy: borderlineCorrect / borderline.length,
  mustCatch: { recall: 1 - mustCatchMissed.length / mustCatch.length, missed: mustCatchMissed },
  holdout: {
    rulesRecall: 1 - holdoutMissedRules.length / holdout.length,
    combinedRecall: 1 - holdoutMissedCombined.length / holdout.length,
    missedByRules: holdoutMissedRules,
  },
  retrievalRecallAt3: retrievalHits.length / withChunks.length,
  leaked,
  crisisMissedByRules,
  wrongCombined,
}

// ── Report ──
const pct = (x: number) => `${(x * 100).toFixed(1)}%`
const row = (name: string, m: ReturnType<typeof metrics>) =>
  `| ${name} | ${pct(m.accuracy)} | ${pct(m.crisisRecall)} | ${pct(m.crisisPrecision)} | ${pct(m.underTriageRate)} | ${pct(m.overTriageRate)} |`
const matrix = (m: ReturnType<typeof metrics>) =>
  [
    `| expected ↓ / predicted → | ${LEVELS.join(' | ')} |`,
    `|---|${LEVELS.map(() => '---').join('|')}|`,
    ...LEVELS.map((e) => `| **${e}** | ${LEVELS.map((p) => m.confusion[e][p]).join(' | ')} |`),
  ].join('\n')

const md = `# Triage eval results (${results.date})

${scenarios.length} English scenarios · ${mustCatch.length} must-catch crisis phrasings · ${holdout.length} holdout phrasings · classifier trained on ${training.length} separate examples.

| Layer | Accuracy | Crisis recall | Crisis precision | Under-triage | Over-triage |
|---|---|---|---|---|---|
${row('Rules only', layers.rules)}
${row('Classifier only', layers.classifier)}
${row('**Combined (escalate-only)**', layers.combined)}

- **Must-catch crisis list (rules alone):** ${pct(results.mustCatch.recall)}
- **Holdout crisis list** (never used for tuning): rules ${pct(results.holdout.rulesRecall)}, combined ${pct(results.holdout.combinedRecall)}
- **Borderline cases (combined):** ${pct(results.borderlineAccuracy)}
- **Retrieval recall@3:** ${pct(results.retrievalRecallAt3)}

## Confusion matrix: combined
${matrix(layers.combined)}

## Holdout phrasings missed by the rules
${holdoutMissedRules.length ? holdoutMissedRules.map((t) => `- ${t}`).join('\n') : '- none'}

## Scenarios the combined system got wrong
${wrongCombined.length ? wrongCombined.map((w) => `- \`${w.id}\` "${w.text}": expected **${w.expected}**, got **${w.combined}** (rules ${w.rules}, classifier ${w.classifier})`).join('\n') : '- none'}
`

mkdirSync('evals/results', { recursive: true })
writeFileSync('evals/results/latest.json', JSON.stringify(results, null, 2) + '\n')
writeFileSync('evals/results/latest.md', md)
console.log(md)

// ── Gate ──
const failures: string[] = []
if (leaked.length) failures.push(`eval data leaked into training: ${leaked.join(' | ')}`)
if (crisisMissedByRules.length) failures.push(`rules missed crisis scenarios: ${crisisMissedByRules.map((s) => s.id).join(', ')}`)
if (mustCatchMissed.length) failures.push(`rules missed must-catch phrasings: ${mustCatchMissed.join(' | ')}`)
if (failures.length) {
  console.error('\n✗ EVAL GATE FAILED\n- ' + failures.join('\n- '))
  process.exit(1)
}
console.log('✓ eval gate passed: rules catch 100% of crisis scenarios and must-catch phrasings')
