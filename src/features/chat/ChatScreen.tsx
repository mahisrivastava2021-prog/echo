import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useI18n } from '../../i18n/context'
import { EchoMessage } from './EchoMessage'
import { SCRIPTS_EN, type ScriptedExample } from './scripts.en'
import type { ChatMessage } from './types'
import styles from './ChatScreen.module.css'

interface Props {
  messages: ChatMessage[]
  onSend: (text: string, scripted?: ScriptedExample) => void
  onOpenEmergency: () => void
}

export function ChatScreen({ messages, onSend, onOpenEmergency }: Props) {
  const { t } = useI18n()
  const [draft, setDraft] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view.
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    onSend(text)
    setDraft('')
  }

  return (
    <div className={styles.chat}>
      {messages.length === 0 && (
        <section className={styles.intro}>
          <h1 className={styles.greeting}>{t('home.greeting')}</h1>
          <p>{t('home.intro')}</p>
          <p className={styles.privacy}>{t('home.privacyNote')}</p>
        </section>
      )}

      <ol className={styles.messages} aria-live="polite">
        {messages.map((m) => (
          <li key={m.id} className={m.role === 'user' ? styles.userRow : styles.echoRow}>
            <span className={styles.srOnly}>{m.role === 'user' ? t('chat.you') : t('chat.echo')}:</span>
            {m.role === 'user' ? (
              <p className={styles.userBubble}>{m.text}</p>
            ) : (
              <EchoMessage turn={m} onOpenEmergency={onOpenEmergency} />
            )}
          </li>
        ))}
      </ol>
      <div ref={endRef} />

      <section className={styles.examples} aria-label={t('chat.examples')}>
        <h2 className={styles.examplesTitle}>{t('chat.examples')}</h2>
        <div className={styles.chips}>
          {SCRIPTS_EN.map((s) => (
            <button key={s.id} type="button" className={styles.chip} onClick={() => onSend(s.userText, s)}>
              {s.chip}
            </button>
          ))}
        </div>
      </section>

      <form className={styles.composer} onSubmit={submit}>
        <label htmlFor="chat-input" className={styles.srOnly}>
          {t('chat.inputLabel')}
        </label>
        <textarea
          id="chat-input"
          className={styles.input}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter adds a new line.
            if (e.key === 'Enter' && !e.shiftKey) submit(e)
          }}
          placeholder={t('chat.placeholder')}
          rows={2}
          autoComplete="off"
          spellCheck
        />
        <button type="submit" className={styles.send} disabled={!draft.trim()}>
          {t('chat.send')}
        </button>
      </form>
      <p className={styles.disclaimer}>{t('chat.disclaimer')}</p>
    </div>
  )
}
