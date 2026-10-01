/** One knowledge-base chunk: a single rule, written from one official source. Built by scripts/build-kb.ts. */
export interface KbChunk {
  id: string
  title: string
  topic: string
  sourceTitle: string
  sourceUrl: string
  sourceUpdated: string
  accessed: string
  keywords: string[]
  text: string
  quote: string
}
