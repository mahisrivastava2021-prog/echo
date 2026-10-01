import MiniSearch from 'minisearch'
import kbEn from '../kb/kb.en.json'
import type { KbChunk } from '../kb/types'

/**
 * Retrieval: finds the knowledge-base rules most relevant to a message.
 * Runs entirely in the browser (BM25 ranking via MiniSearch), so demo mode
 * needs no server. Live mode sends only these retrieved chunks to the model,
 * which is what keeps answers grounded in real rules.
 */
export const KB: KbChunk[] = kbEn as KbChunk[]
const byId = new Map(KB.map((c) => [c.id, c]))

// Common words that carry no meaning for matching.
const STOP_WORDS = new Set(
  'a an and are am be but by can do does for from had has have he her his how i if in is it its me my no not of on or our she so that the their them they this to was we what when where which who will with you your'.split(' '),
)

const index = new MiniSearch<KbChunk>({
  fields: ['title', 'keywords', 'text'],
  storeFields: ['id'],
  processTerm: (term) => {
    const t = term.toLowerCase()
    return STOP_WORDS.has(t) ? null : t
  },
  searchOptions: {
    // Keywords hold workers' everyday words ("day off", "madam"), so they count most.
    boost: { keywords: 3, title: 2, text: 1 },
    prefix: true, // "pay" also matches "paid", "payment"
    fuzzy: 0.2, // tolerate typos like "pasport"
    combineWith: 'OR',
  },
})
index.addAll(KB)

export interface Retrieved {
  chunk: KbChunk
  score: number
}

/** Returns up to `k` chunks, best first. Weak matches below `minScore` are dropped. */
export function retrieve(query: string, k = 3, minScore = 2): Retrieved[] {
  return index
    .search(query)
    .filter((r) => r.score >= minScore)
    .slice(0, k)
    .map((r) => ({ chunk: byId.get(r.id as string)!, score: r.score }))
}

export function getChunk(id: string): KbChunk | undefined {
  return byId.get(id)
}
