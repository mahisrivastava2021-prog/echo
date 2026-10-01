import { useI18n } from '../../i18n/context'
import type { EmergencyContact } from './contacts'
import styles from './ContactCard.module.css'

/** One contact with a one-tap call button. Only verified numbers get a button. */
export function ContactCard({ contact: c }: { contact: EmergencyContact }) {
  const { t } = useI18n()
  return (
    <li className={`${styles.card} ${c.urgent ? styles.urgent : ''}`}>
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
      {c.verified && (
        <a className={styles.call} href={`tel:${c.tel}`} aria-label={`${t('emergency.call')} ${c.name} ${c.display}`}>
          {t('emergency.call')}
          <span className={styles.number}>{c.display}</span>
        </a>
      )}
    </li>
  )
}
