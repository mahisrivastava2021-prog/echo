import { useI18n } from '../../i18n/context'
import { isMessageKey, type MessageKey } from '../../i18n/t'
import { getChunk } from '../../rag/retrieve'
import type { Level } from '../../triage/levels'
import type { DecidedBy, TriageDecision } from '../../triage/router'
import { ContactCard } from '../emergency/ContactCard'
import { EMERGENCY_CONTACTS } from '../emergency/contacts'
import type { EchoTurn } from './engine'
import styles from './EchoMessage.module.css'

/** Which contacts to show inside an answer, by level. Code decides this, never the model. */
const CONTACTS_BY_LEVEL: Partial<Record<Level, string[]>> = {
  moderate: ['mom', 'cde'],
  serious: ['cde', 'home'],
}
const STEPS_BY_LEVEL: Partial<Record<Level, MessageKey[]>> = {
  moderate: ['actions.moderate.1', 'actions.moderate.2', 'actions.moderate.3'],
  serious: ['actions.serious.1', 'actions.serious.2', 'actions.serious.3', 'actions.serious.4'],
}

/** Reply text for template mode (no scripted or model reply available). */
function templateReplyKey(d: TriageDecision): MessageKey {
  if (d.level === 'crisis') return 'reply.crisis'
  if (d.notReady) return 'reply.notReady'
  if (d.citations.length === 0 && d.level === 'mild') return 'reply.noMatch'
  return `reply.${d.level}`
}

export function EchoMessage({ turn, onOpenEmergency }: { turn: EchoTurn; onOpenEmergency: () => void }) {
  const { t } = useI18n()
  const d = turn.decision
  const reply = d.reply ?? t(templateReplyKey(d))
  const signalLabels = d.signals.map((id) => `signal.${id}`).filter(isMessageKey).map((k) => t(k))
  // Not-ready: show information only, no calls to action (no pressure).
  const showActions = !d.notReady

  return (
    <article className={`${styles.message} ${styles[d.level]}`}>
      <span className={`${styles.badge} ${styles[`badge_${d.level}`]}`}>{t(`level.${d.level}`)}</span>

      <p className={styles.reply}>{reply}</p>

      {(d.reason || signalLabels.length > 0) && (
        <p className={styles.why}>
          <strong>{t('chat.why')}:</strong> {d.reason ?? `${t('chat.youMentioned')} ${signalLabels.join(', ')}.`}
        </p>
      )}

      {d.level === 'crisis' && (
        <button type="button" className={styles.crisisButton} onClick={onOpenEmergency}>
          {t('actions.crisis.reopen')}
        </button>
      )}

      {d.citations.length > 0 && (
        <section>
          <h3 className={styles.heading}>{d.notReady ? t('saved.title') : t('chat.sources')}</h3>
          <ul className={styles.sources}>
            {d.citations.map((id) => {
              const c = getChunk(id)
              if (!c) return null
              return (
                <li key={id}>
                  <details className={styles.source}>
                    <summary>{c.title}</summary>
                    <p>{c.text.replace(/\*\*/g, '')}</p>
                    {c.quote && (
                      <blockquote>
                        <span className={styles.quoteLabel}>{t('chat.officialWording')}:</span> “{c.quote}”
                      </blockquote>
                    )}
                    <p className={styles.meta}>
                      <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                        {t('chat.source')}: {c.sourceTitle}
                      </a>
                      {c.sourceUpdated && ` · ${t('chat.pageUpdated')} ${c.sourceUpdated}`} · {t('chat.accessed')} {c.accessed}
                    </p>
                  </details>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {showActions && STEPS_BY_LEVEL[d.level] && (
        <section>
          <h3 className={styles.heading}>{t('actions.title')}</h3>
          <ol className={styles.steps}>
            {STEPS_BY_LEVEL[d.level]!.map((k) => (
              <li key={k}>{t(k)}</li>
            ))}
          </ol>
        </section>
      )}

      {(showActions || d.notReady) && CONTACTS_BY_LEVEL[d.level] && (
        <ul className={styles.contacts}>
          {EMERGENCY_CONTACTS.filter((c) => CONTACTS_BY_LEVEL[d.level]!.includes(c.id)).map((c) => (
            <ContactCard key={c.id} contact={c} />
          ))}
        </ul>
      )}

      {(d.level === 'moderate' || d.level === 'serious') && (
        <div className={styles.journal}>
          <button type="button" disabled>
            {t('actions.journal')}
          </button>
          <span>{t('actions.journalSoon')}</span>
        </div>
      )}

      <HowDecided decision={d} source={turn.replySource} />
      <p className={styles.disclaimer}>{t('chat.disclaimer')}</p>
    </article>
  )
}

/** Transparency panel: each layer's vote and the escalate-only result. */
function HowDecided({ decision: d, source }: { decision: TriageDecision; source: EchoTurn['replySource'] }) {
  const { t } = useI18n()
  const layerName: Record<DecidedBy, string> = {
    rules: t('layer.rules'),
    classifier: t('layer.classifier'),
    model: t(`layer.model.${source}`),
  }
  return (
    <details className={styles.how}>
      <summary>{t('chat.howDecided')}</summary>
      <ul>
        {(Object.keys(d.votes) as DecidedBy[]).map((layer) => {
          const vote = d.votes[layer]
          return (
            <li key={layer}>
              {layerName[layer]}: {vote ? t(`level.${vote}`) : t('chat.noVote')}
              {d.decidedBy.includes(layer) && vote ? ' ✓' : ''}
            </li>
          )
        })}
      </ul>
      <p>
        {t('chat.final')}: <strong>{t(`level.${d.level}`)}</strong> ({t('chat.mostSerious')})
      </p>
      {d.usedFallback && <p>{t('chat.fallback')}</p>}
    </details>
  )
}
