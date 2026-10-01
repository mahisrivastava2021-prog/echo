import { useCallback, useRef, useState } from 'react'
import { useI18n } from '../i18n/context'
import { ChatScreen } from '../features/chat/ChatScreen'
import { crisisCheck, respond } from '../features/chat/engine'
import type { ScriptedExample } from '../features/chat/scripts.en'
import type { ChatMessage } from '../features/chat/types'
import { EmergencyScreen } from '../features/emergency/EmergencyScreen'
import { ExitButton } from '../features/exit/ExitButton'
import { DecoyScreen } from '../features/exit/DecoyScreen'
import { applyDisguise, removeDisguise } from '../features/exit/quickExit'
import styles from './App.module.css'

type Screen = 'chat' | 'emergency' | 'decoy'

/**
 * Screens are plain React state, not URL routes. This keeps the browser
 * history free of anything that reveals what the user was looking at.
 */
export function App() {
  const { t } = useI18n()
  const [screen, setScreen] = useState<Screen>('chat')
  const [emergencyMode, setEmergencyMode] = useState<'browse' | 'crisis'>('browse')
  // Chat history exists only in memory: never stored, never sent anywhere.
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const nextId = useRef(1)

  const openEmergency = useCallback((mode: 'browse' | 'crisis') => {
    setEmergencyMode(mode)
    setScreen('emergency')
    window.scrollTo(0, 0)
  }, [])

  const send = useCallback(
    (text: string, scripted?: ScriptedExample) => {
      // 1. Deterministic crisis check FIRST: synchronous, offline, before anything else.
      if (crisisCheck(text)) openEmergency('crisis')

      // 2. Full triage pipeline. If another layer raises the level to crisis, open the screen too.
      const turn = respond(text, scripted)
      if (turn.decision.level === 'crisis') openEmergency('crisis')

      setMessages((prev) => [
        ...prev,
        { id: nextId.current++, role: 'user', text },
        { id: nextId.current++, role: 'echo', ...turn },
      ])
    },
    [openEmergency],
  )

  const quickExit = useCallback(() => {
    applyDisguise(t('decoy.title'))
    setMessages([]) // wipe the conversation from memory
    setScreen('decoy')
    window.scrollTo(0, 0)
  }, [t])

  const returnFromDecoy = useCallback(() => {
    removeDisguise()
    setScreen('chat')
  }, [])

  if (screen === 'decoy') return <DecoyScreen onReturn={returnFromDecoy} />

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.brand}>{t('app.name')}</span>
        <div className={styles.actions}>
          <button type="button" className={styles.sos} onClick={() => openEmergency('browse')} aria-label={t('sos.aria')}>
            {t('sos.label')}
          </button>
          <ExitButton onExit={quickExit} />
        </div>
      </header>

      <p className={styles.banner} role="note">
        {t('demo.banner')}
      </p>

      <main className={styles.content}>
        {screen === 'emergency' ? (
          <EmergencyScreen mode={emergencyMode} onBack={() => setScreen('chat')} />
        ) : (
          <ChatScreen messages={messages} onSend={send} onOpenEmergency={() => openEmergency('crisis')} />
        )}
      </main>
    </div>
  )
}
