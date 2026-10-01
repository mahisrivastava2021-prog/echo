import { rulesEn } from './rules/en'

/**
 * Turns a message into classifier features: words + word pairs (bigrams).
 * Bigrams capture meaning single words miss, e.g. "not paid", "day off", "hit me".
 * Shared by training (scripts/train-classifier.ts) and the browser, so both see identical features.
 */
export function features(text: string): string[] {
  const words = rulesEn.normalize(text).split(' ').filter(Boolean)
  const bigrams = words.slice(1).map((w, i) => `${words[i]} ${w}`)
  // Questions ("Is it normal…?", "Can I…?") are usually rights-education (mild) rather than reports.
  const isQuestion = text.includes('?') || /^(can|is|am|are|do|does|what|how|who|when|where|should|may|which)\b/.test(words[0] ?? '')
  return isQuestion ? [...words, ...bigrams, '__question__'] : [...words, ...bigrams]
}
