import { useEffect } from 'react'
import { useI18n } from '../../i18n/context'
import styles from './ExitButton.module.css'

export function ExitButton({ onExit }: { onExit: () => void }) {
  const { t } = useI18n()

  // Keyboard shortcut for desktop: Escape exits immediately.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onExit()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onExit])

  return (
    <button type="button" className={styles.exit} onClick={onExit} aria-label={t('exit.aria')}>
      {t('exit.label')}
    </button>
  )
}
