import { describe, expect, it } from 'vitest'
import { KB, retrieve } from './retrieve'

describe('knowledge base integrity', () => {
  it('has unique ids and an official source for every chunk', () => {
    expect(new Set(KB.map((c) => c.id)).size).toBe(KB.length)
    for (const c of KB) expect(c.sourceUrl).toMatch(/^https:\/\/www\.(mom|cde|home)\.(gov|org)\.sg\//)
  })
})

// Realistic worker questions → the rule that must appear in the top 3 (recall@3).
const CASES: [string, string][] = [
  ['my employer has not paid my salary for 2 months', 'salary-report-unpaid'],
  ['salary always comes late, like the 15th', 'salary-on-time'],
  ['ma’am says she will keep my money for me', 'salary-no-safekeeping'],
  ['they give me less money than my contract', 'salary-full-amount'],
  ['I have no day off at all', 'rest-day-monthly-minimum'],
  ['can I stay at home on my off day', 'rest-day-weekly'],
  ['I worked on sunday, should I get extra pay', 'rest-day-compensation'],
  ['madam took my pasport', 'passport'],
  ['they only give me leftovers, I am hungry', 'food'],
  ['I sleep on the kitchen floor without mattress', 'accommodation'],
  ['there is a camera in my room', 'privacy'],
  ['I am sick but they say I must pay the doctor', 'medical'],
  ['employer took my handphone, cannot call family', 'phone'],
  ['she sends me to clean her mother’s house too', 'work-scope'],
  ['my employer always shouts and insults me', 'ill-treatment-definition'],
  ['sir hit me', 'abuse-police'],
  ['how do I make a complaint to MOM', 'help-report-channels'],
  ['I want to change employer', 'transfer-employer'],
]

describe('retrieval', () => {
  it.each(CASES)('"%s" → %s in top 3', (query, expected) => {
    const ids = retrieve(query).map((r) => r.chunk.id)
    expect(ids).toContain(expected)
  })

  it('returns nothing for unrelated text', () => {
    expect(retrieve('what is the weather tomorrow')).toEqual([])
  })
})
