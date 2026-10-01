import { describe, expect, it } from 'vitest'
import { classify, ERR_UP_THRESHOLD, type NbModel } from './classifier'
import { maxLevel } from './levels'
import { detectNotReady } from './notReady'
import { route, type TriageInputs } from './router'
import { runRules } from './rules'
import { parseModelOutput, type TriageOutput } from './schema'

const modelSays = (o: Partial<TriageOutput>): TriageOutput => ({
  level: 'mild',
  reason: 'r',
  citations: [],
  not_ready: false,
  reply: 'ok',
  ...o,
})

function inputs(text: string, extra: Partial<TriageInputs> = {}): TriageInputs {
  return {
    rules: runRules(text),
    classifier: null,
    model: null,
    modelAttempted: false,
    notReadyDetected: detectNotReady(text),
    retrievedIds: ['salary-on-time', 'help-report-channels'],
    ...extra,
  }
}

describe('maxLevel', () => {
  it('picks the most serious and ignores missing votes', () => {
    expect(maxLevel('moderate', null, 'serious', undefined)).toBe('serious')
    expect(maxLevel()).toBe('mild')
  })
})

describe('rules', () => {
  it.each([
    ['My madam hit me yesterday', 'crisis'],
    ["I can't take it anymore", 'crisis'],
    ['she locks the door when she goes out', 'crisis'],
    ['Employer took my pasport', 'serious'],
    ['no salary for three months', 'serious'],
    ['my salary is late again', 'moderate'],
    ['I get no day off', 'moderate'],
    ['Can I use my phone at night?', null],
  ])('"%s" → %s', (text, level) => {
    expect(runRules(text).level).toBe(level)
  })

  it('does not treat a work injury as violence', () => {
    expect(runRules('I hurt my back while cleaning').level).not.toBe('crisis')
  })

  it('handles curly apostrophes from phone keyboards', () => {
    expect(runRules('I can’t go on like this').crisis).toBe(true)
  })
})

describe('router: escalate-only', () => {
  it('a model saying "mild" cannot lower a crisis found by rules', () => {
    const d = route(inputs('he hit me', { model: modelSays({ level: 'mild' }), modelAttempted: true }))
    expect(d.level).toBe('crisis')
    expect(d.decidedBy).toEqual(['rules'])
  })

  it('a model can raise the level above the rules', () => {
    const d = route(inputs('my salary is late', { model: modelSays({ level: 'serious' }), modelAttempted: true }))
    expect(d.level).toBe('serious')
    expect(d.decidedBy).toEqual(['model'])
  })

  it('the classifier can raise the level too', () => {
    const probs = { mild: 0.1, moderate: 0.2, serious: 0.6, crisis: 0.1 }
    const d = route(inputs('my salary is late', { classifier: { level: 'serious', probabilities: probs } }))
    expect(d.level).toBe('serious')
  })

  it('defaults to mild when nothing matched', () => {
    expect(route(inputs('can I use my phone at night')).level).toBe('mild')
  })
})

describe('router: fallback and citations', () => {
  it('marks fallback when the model was attempted but returned nothing usable', () => {
    const d = route(inputs('he hit me', { model: parseModelOutput('not json {'), modelAttempted: true }))
    expect(d.usedFallback).toBe(true)
    expect(d.level).toBe('crisis') // rules still protect the user
  })

  it('drops citations the model invented', () => {
    const model = modelSays({ citations: ['salary-on-time', 'made-up-rule-99'] })
    const d = route(inputs('salary late', { model, modelAttempted: true }))
    expect(d.citations).toEqual(['salary-on-time'])
  })

  it('falls back to top retrieved chunks when the model gives no valid citation', () => {
    const d = route(inputs('salary late'))
    expect(d.citations).toEqual(['salary-on-time', 'help-report-channels'])
  })
})

describe('parseModelOutput', () => {
  it('accepts valid JSON (string or object)', () => {
    const ok = modelSays({ level: 'serious' })
    expect(parseModelOutput(JSON.stringify(ok))?.level).toBe('serious')
    expect(parseModelOutput(ok)?.level).toBe('serious')
  })

  it.each([
    ['not json', 'oops {'],
    ['unknown level', { ...modelSays({}), level: 'severe' }],
    ['missing field', { level: 'mild', reason: 'x' }],
    ['reply too long', modelSays({ reply: 'x'.repeat(2000) })],
    ['null', null],
  ])('rejects %s', (_, raw) => {
    expect(parseModelOutput(raw)).toBeNull()
  })
})

describe('not-ready detection', () => {
  it.each(["I'm not ready to report", 'I just want to know my rights', "I'm scared of losing my job"])(
    '"%s" → not ready',
    (text) => expect(detectNotReady(text)).toBe(true),
  )

  it('is not triggered by ordinary questions', () => {
    expect(detectNotReady('How many rest days do I get?')).toBe(false)
  })

  it('a not-ready flag from the model is respected', () => {
    const d = route(inputs('salary late', { model: modelSays({ not_ready: true }), modelAttempted: true }))
    expect(d.notReady).toBe(true)
  })
})

describe('classifier', () => {
  const tiny: NbModel = {
    labels: ['mild', 'moderate', 'serious', 'crisis'],
    logPriors: [Math.log(0.25), Math.log(0.25), Math.log(0.25), Math.log(0.25)],
    // "late" points to moderate, "salary" is slightly more serious than moderate.
    logLikelihoods: { late: [-5, -1, -1.3, -5], salary: [-3, -1, -1.2, -5] },
  }

  it('gives no vote when it knows too few words', () => {
    expect(classify('hello', tiny)).toBeNull()
  })

  it('errs toward the more serious level when it is close', () => {
    const vote = classify('salary late', tiny)!
    expect(vote.probabilities.moderate).toBeGreaterThan(vote.probabilities.serious)
    expect(vote.probabilities.serious).toBeGreaterThanOrEqual(ERR_UP_THRESHOLD)
    expect(vote.level).toBe('serious')
  })
})
