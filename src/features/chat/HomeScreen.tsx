import { useI18n } from '../../i18n/context'
import styles from './HomeScreen.module.css'

// Placeholder for the chat (built in M3).
export function HomeScreen() {
  const { t } = useI18n()
  return (
    <section className={styles.home}>
      <h1 className={styles.greeting}>{t('home.greeting')}</h1>
      <p>{t('home.intro')}</p>
      <p className={styles.note}>{t('home.comingSoon')}</p>
      <p className={styles.privacy}>{t('home.privacyNote')}</p>
    </section>
  )
}
