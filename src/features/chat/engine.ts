import { retrieve } from '../../rag/retrieve'
import { classify } from '../../triage/classifier'
import { detectNotReady } from '../../triage/notReady'
import { route, type TriageDecision } from '../../triage/router'
import { runRules } from '../../triage/rules'
import type { ScriptedExample } from './scripts.en'

export type ReplySource = 'scripted' | 'template' | 'model'

export interface EchoTurn {
  decision: TriageDecision
  replySource: ReplySource
}

/**
 * Step 1 of every message: the deterministic crisis check.
 * Synchronous and offline. The UI calls this FIRST and opens the emergency
 * screen immediately, before any other (possibly slow or failing) step.
 */
export function crisisCheck(text: string): boolean {
  return runRules(text).crisis
}

/**
 * The full triage pipeline (demo mode):
 * rules → classifier → retrieval → (scripted answer as the "model" vote) → router.
 */
export function respond(text: string, scripted?: ScriptedExample): EchoTurn {
  const rules = runRules(text)
  const classifier = classify(text)
  const retrievedIds = retrieve(text).map((r) => r.chunk.id)

  const decision = route({
    rules,
    classifier,
    model: scripted?.output ?? null,
    modelAttempted: false,
    notReadyDetected: detectNotReady(text),
    // A scripted answer's own citations are trusted; they're checked against the KB in tests.
    retrievedIds: scripted ? [...new Set([...scripted.output.citations, ...retrievedIds])] : retrievedIds,
  })
  return { decision, replySource: scripted ? 'scripted' : 'template' }
}
