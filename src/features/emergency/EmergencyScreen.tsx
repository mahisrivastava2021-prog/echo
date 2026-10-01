import { useI18n } from '../../i18n/context'
import { EMERGENCY_CONTACTS } from './contacts'
import styles from './EmergencyScreen.module.css'

// Danger-to-life numbers first; the rest keep their order from contacts.ts.
const ORDERED = [...EMERGENCY_CONTACTS].sort((a, b) => Number(b.urgent) - Number(a.urgent))

/**
 * Static screen that never depends on the network, the LLM or app state.
 * Must always render, even if everything else fails.
 */
export function EmergencyScreen({ onBack }: { onBack: () => void }) {
  const { t } = useI18n()

  return (
    <section className={styles.screen} aria-labelledby="emergency-title">
      <h1 id="emergency-title" className={styles.title}>
        {t('emergency.title')}
      </h1>
      <p className={styles.intro}>{t('emergency.intro')}</p>

      <ul className={styles.list}>
        {ORDERED.map((c) => (
          <li key={c.id} className={`${styles.card} ${c.urgent ? styles.urgent : ''}`}>
            <div className={styles.info}>
              <h2 className={styles.name}>{c.name}</h2>
              <p className={styles.desc}>{t(c.descriptionKey)}</p>
              <p className={styles.meta}>
                {c.display} · {t(c.hoursKey)}
              </p>
              {c.verified ? (
                <p className={styles.meta}>
                  <a href={c.sourceUrl} target="_blank" rel="noreferrer">
                    {t('emergency.source')}
                  </a>{' '}
                  · {t('emergency.checked')} {c.verifiedOn}
                </p>
              ) : (
                <p className={styles.unverified} role="note">
                  ⚠ {t('emergency.unverified')}
                </p>
              )}
            </div>
            {/* Only verified numbers get a one-tap call button. */}
            {c.verified && (
              <a className={styles.call} href={`tel:${c.tel}`} aria-label={`${t('emergency.call')} ${c.name} ${c.display}`}>
                {t('emergency.call')}
                <span className={styles.number}>{c.display}</span>
              </a>
            )}
          </li>
        ))}
      </ul>

      <button type="button" className={styles.back} onClick={onBack}>
        {t('emergency.back')}
      </button>
    </section>
  )
}
