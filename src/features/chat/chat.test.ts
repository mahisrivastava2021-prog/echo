import { describe, expect, it } from 'vitest'
import { isMessageKey } from '../../i18n/t'
import { getChunk } from '../../rag/retrieve'
import { rulesEn } from '../../triage/rules/en'
import { TriageOutputSchema } from '../../triage/schema'
import { crisisCheck, respond } from './engine'
import { SCRIPTS_EN } from './scripts.en'

describe('scripted demo answers', () => {
  it.each(SCRIPTS_EN.map((s) => [s.id, s] as const))('%s is valid and consistent', (_, s) => {
    expect(TriageOutputSchema.safeParse(s.output).success).toBe(true)
    for (const id of s.output.citations) expect(getChunk(id), `unknown chunk ${id}`).toBeDefined()

    // After routing, the other layers must agree (not escalate past the scripted level).
    const turn = respond(s.userText, s)
    expect(turn.decision.level).toBe(s.output.level)
    expect(turn.decision.citations).toEqual(s.output.citations)
  })

  it('covers every severity level and the not-ready case', () => {
    const levels = new Set(SCRIPTS_EN.map((s) => s.output.level))
    expect([...levels].sort()).toEqual(['crisis', 'mild', 'moderate', 'serious'])
    expect(SCRIPTS_EN.some((s) => s.output.not_ready)).toBe(true)
  })
})

describe('engine', () => {
  it('flags crisis synchronously', () => {
    expect(crisisCheck('she slapped me')).toBe(true)
    expect(crisisCheck('salary is late')).toBe(false)
  })

  it('free text gets a template reply with KB citations', () => {
    const turn = respond('my employer took my passport')
    expect(turn.replySource).toBe('template')
    expect(turn.decision.level).toBe('serious')
    expect(turn.decision.citations).toContain('passport')
  })
})

describe('i18n coverage', () => {
  it('every rule signal has a plain-language label', () => {
    const missing = rulesEn.signals.map((s) => `signal.${s.id}`).filter((k) => !isMessageKey(k))
    expect(missing).toEqual([])
  })
})
