import { rulesEn } from './rules/en'

/**
 * Detects when the worker says she isn't ready to act. Echo then applies no
 * pressure: it keeps the information, saves resources for later and stays supportive.
 */
const NOT_READY_EN: RegExp[] = [
  /\bnot ready\b/,
  /\b(don't|do not) want to (report|complain|call|make (a )?(report|complaint)|do anything|get (her|him|them|anyone) in(to)? trouble)\b/,
  /\bjust (want(ed)?|wanna|trying) to (know|ask|understand|check)\b/,
  /\b(afraid|scared|worried) (of|to|about) (lose|losing) (my )?job\b/,
  /\b(afraid|scared|worried) (they|she|he)('ll| will) (send me home|terminate me|fire me|cancel my permit)\b/,
  /\b(don't|do not) want (any )?trouble\b/,
  /\b(maybe )?later\b.{0,10}\b(not now)\b|\bnot now\b/,
  /\bplease (don't|do not) (tell|report)\b/,
  /\bi (can|will) (handle|manage) (it|this)\b/,
  /\bneed (more )?time (to think)?\b/,
]

export function detectNotReady(text: string): boolean {
  const t = rulesEn.normalize(text)
  return NOT_READY_EN.some((p) => p.test(t))
}
