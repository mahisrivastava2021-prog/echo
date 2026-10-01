/**
 * Builds the knowledge base: kb/source/*.md  →  src/kb/kb.en.json
 *
 * Each chunk is one rule, hand-written from an official page. This script
 * validates every chunk so a missing source or duplicate ID fails the build
 * instead of reaching users. Run: npm run kb:build
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'

const SRC_DIR = 'kb/source'
const OUT_FILE = 'src/kb/kb.en.json'

// Only official or established sources may be cited.
const ALLOWED_HOSTS = ['www.mom.gov.sg', 'www.cde.org.sg', 'www.home.org.sg']

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const ChunkSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(5),
  topic: z.string().min(2),
  sourceTitle: z.string().min(5),
  sourceUrl: z.url().refine((u) => ALLOWED_HOSTS.includes(new URL(u).host), 'source must be an allowed official site'),
  sourceUpdated: isoDate.or(z.literal('')), // the page's own "last updated" date, if shown
  accessed: isoDate,
  keywords: z.array(z.string()).min(3),
  text: z.string().min(80),
  quote: z.string(), // verbatim official wording ('' if none)
})

/** Splits "---\nkey: value\n---\nbody" into metadata + body. */
function parse(file: string, raw: string) {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) throw new Error(`${file}: missing frontmatter`)
  const meta: Record<string, string> = {}
  for (const line of match[1].split('\n')) {
    const i = line.indexOf(':')
    meta[line.slice(0, i).trim()] = line.slice(i + 1).trim()
  }
  const body = match[2].trim()
  const quoteLine = body.split('\n').find((l) => l.startsWith('> '))
  const text = body
    .split('\n')
    .filter((l) => !l.startsWith('> '))
    .join('\n')
    .trim()

  return ChunkSchema.parse({
    id: meta.id,
    title: meta.title,
    topic: meta.topic,
    sourceTitle: meta.source_title,
    sourceUrl: meta.source_url,
    sourceUpdated: meta.source_updated ?? '',
    accessed: meta.accessed,
    keywords: (meta.keywords ?? '').split(',').map((k) => k.trim()).filter(Boolean),
    text,
    quote: quoteLine ? quoteLine.slice(2).replace(/^"|"$/g, '') : '',
  })
}

const files = readdirSync(SRC_DIR).filter((f) => f.endsWith('.md')).sort()
const chunks = files.map((f) => {
  try {
    return parse(f, readFileSync(join(SRC_DIR, f), 'utf8'))
  } catch (err) {
    console.error(`✗ ${f}`)
    throw err
  }
})

const ids = new Set<string>()
for (const c of chunks) {
  if (ids.has(c.id)) throw new Error(`duplicate chunk id: ${c.id}`)
  ids.add(c.id)
}

mkdirSync('src/kb', { recursive: true })
writeFileSync(OUT_FILE, JSON.stringify(chunks, null, 2) + '\n')
console.log(`✓ ${chunks.length} chunks → ${OUT_FILE}`)
