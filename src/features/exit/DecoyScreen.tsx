import { useState } from 'react'
import { initialCalc, isReturnCode, press, type Key } from './calculator'
import styles from './DecoyScreen.module.css'

const KEYS: Key[] = ['C', '.', '÷', '×', '7', '8', '9', '−', '4', '5', '6', '+', '1', '2', '3', '=', '0']

/**
 * Neutral decoy shown after Quick Exit. Contains no Echo branding or text,
 * so it gives nothing away if someone else picks up the phone.
 */
export function DecoyScreen({ onReturn }: { onReturn: () => void }) {
  const [calc, setCalc] = useState(initialCalc)

  const onKey = (key: Key) => {
    if (isReturnCode(calc, key)) {
      setCalc(initialCalc)
      onReturn()
      return
    }
    setCalc((s) => press(s, key))
  }

  return (
    <main className={styles.calc}>
      <output className={styles.display} aria-live="polite">
        {calc.display}
      </output>
      <div className={styles.keys}>
        {KEYS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => onKey(k)}
            className={`${styles.key} ${/[÷×−+=]/.test(k) ? styles.op : ''} ${k === '=' ? styles.equals : ''} ${k === '0' ? styles.zero : ''}`}
          >
            {k}
          </button>
        ))}
      </div>
    </main>
  )
}
