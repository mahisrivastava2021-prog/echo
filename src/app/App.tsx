import { useCallback, useState } from 'react'
import { useI18n } from '../i18n/context'
import { HomeScreen } from '../features/chat/HomeScreen'
import { EmergencyScreen } from '../features/emergency/EmergencyScreen'
import { ExitButton } from '../features/exit/ExitButton'
import { DecoyScreen } from '../features/exit/DecoyScreen'
import { applyDisguise, removeDisguise } from '../features/exit/quickExit'
import styles from './App.module.css'

type Screen = 'home' | 'emergency' | 'decoy'

/**
 * Screens are plain React state, not URL routes. This keeps the browser
 * history free of anything that reveals what the user was looking at.
 */
export function App() {
  const { t } = useI18n()
  const [screen, setScreen] = useState<Screen>('home')

  const quickExit = useCallback(() => {
    // Later milestones also clear the in-memory chat and lock the journal here.
    applyDisguise(t('decoy.title'))
    setScreen('decoy')
    window.scrollTo(0, 0)
  }, [t])

  const returnFromDecoy = useCallback(() => {
    removeDisguise()
    setScreen('home')
  }, [])

  if (screen === 'decoy') return <DecoyScreen onReturn={returnFromDecoy} />

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <span className={styles.brand}>{t('app.name')}</span>
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.sos}
            onClick={() => setScreen('emergency')}
            aria-label={t('sos.aria')}
          >
            {t('sos.label')}
          </button>
          <ExitButton onExit={quickExit} />
        </div>
      </header>

      <p className={styles.banner} role="note">
        {t('demo.banner')}
      </p>

      <main className={styles.content}>
        {screen === 'emergency' ? <EmergencyScreen onBack={() => setScreen('home')} /> : <HomeScreen />}
      </main>
    </div>
  )
}
