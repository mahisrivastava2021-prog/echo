# Echo: guidance for Claude

Echo is a static React + TypeScript PWA, hosted on GitHub Pages, that helps migrant domestic workers (FDWs) in Singapore understand their rights under MOM rules.
It is a portfolio demo. **Demo mode must always work with zero network requests.**

## Non-negotiables
- No user content (chat, journal) ever leaves the device. The only exception is live-mode chat text sent to `worker/`, and only after the user opts in.
- No analytics, cookies, third-party fonts/CDNs, or new external requests.
- Crisis detection lives in `src/triage/rules` and runs BEFORE any model call (`crisisCheck` in `src/features/chat/engine.ts`).
  Never make it depend on the LLM. The router is escalate-only: the model may raise severity, never lower it.
  Any change to triage must keep the eval gate green (`npm run eval`: rules catch 100% of crisis scenarios + must-catch list).
- Never tune rules to `evals/crisis-holdout.en.txt`; it measures generalisation. Never copy eval text into `data/train.*`.
- Level → actions (steps, contacts, emergency screen) are decided in code (`EchoMessage.tsx`), never by model output.
- Every legal claim must cite a chunk in `kb/source` with an official URL. Never invent rules or phone numbers.
- Emergency numbers come only from `src/features/emergency/contacts.ts`. Each one records its source URL and `verifiedOn` date.
- All UI strings go through `src/i18n`. Never hard-code user-facing text.

## Commands
- `npm run dev`: local dev server
- `npm run build`: type-check and build into `dist/`
- `npm run lint`: oxlint
- `npm test`: unit tests (Vitest)
- `npm run eval`: triage evals + CI safety gate → `evals/results/latest.md`
- `npm run train`: retrain the Naive Bayes classifier from `data/train.en.jsonl`
- `npm run kb:build`: validate `kb/source/*.md` → `src/kb/kb.en.json`

## Style
- Small components, plain CSS modules, explicit types. Comments explain *why*, not what.
- The owner is learning. Explain each change briefly in plain language.
- The build plan lives in `docs/plan.md`. Design decisions go in `docs/decisions/` as short ADRs.
