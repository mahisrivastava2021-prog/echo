import { z } from 'zod'
import { LEVELS } from './levels'

/**
 * The structured triage output. The same shape is used by:
 * - Gemini (as its JSON response schema),
 * - scripted demo answers,
 * - the safe fallback.
 */
export const TriageOutputSchema = z.object({
  level: z.enum(LEVELS),
  reason: z.string().min(1).max(300), // short "why", shown to the user
  citations: z.array(z.string()).max(5), // knowledge-base chunk IDs
  not_ready: z.boolean(),
  reply: z.string().min(1).max(1200), // empathetic, grounded explanation
})
export type TriageOutput = z.infer<typeof TriageOutputSchema>

/**
 * Parses untrusted model output. Never throws: anything malformed returns
 * null, which the router treats as "the model gets no vote".
 */
export function parseModelOutput(raw: unknown): TriageOutput | null {
  try {
    const value = typeof raw === 'string' ? JSON.parse(raw) : raw
    const result = TriageOutputSchema.safeParse(value)
    return result.success ? result.data : null
  } catch {
    return null
  }
}
