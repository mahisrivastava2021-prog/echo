import { useI18n } from '../../i18n/context'
import { ContactCard } from './ContactCard'
import { EMERGENCY_CONTACTS } from './contacts'
import styles from './EmergencyScreen.module.css'

// Danger-to-life numbers first; the rest keep their order from contacts.ts.
const ORDERED = [...EMERGENCY_CONTACTS].sort((a, b) => Number(b.urgent) - Number(a.urgent))

/**
 * Static screen that never depends on the network, the LLM or app state.
 * mode "crisis" = opened automatically by triage: gentler heading, a reminder
 * that she stays in control, and a no-pressure way back.
 */
export function EmergencyScreen({ mode, onBack }: { mode: 'browse' | 'crisis'; onBack: () => void }) {
  const { t } = useI18n()
  const crisis = mode === 'crisis'

  return (
    <section className={`${styles.screen} ${crisis ? styles.crisis : ''}`} aria-labelledby="emergency-title">
      <h1 id="emergency-title" className={styles.title}>
        {t(crisis ? 'emergency.crisisTitle' : 'emergency.title')}
      </h1>
      <p className={styles.intro}>{t('emergency.intro')}</p>
      <p className={styles.control}>{t('emergency.control')}</p>

      <ul className={styles.list}>
        {ORDERED.map((c) => (
          <ContactCard key={c.id} contact={c} />
        ))}
      </ul>

      <button type="button" className={styles.back} onClick={onBack}>
        {t(crisis ? 'emergency.notReady' : 'emergency.back')}
      </button>
    </section>
  )
}
