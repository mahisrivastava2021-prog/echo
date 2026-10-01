/**
 * Minimal pocket-calculator logic for the decoy screen. It is pure and has no
 * UI, so it is easy to test. It deliberately behaves like a basic real
 * calculator (left-to-right, one operator at a time) so the decoy is believable.
 */
export type Op = '+' | '−' | '×' | '÷'
type Digit = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
export type Key = Digit | '.' | Op | '=' | 'C'

// Type guard: tells TypeScript that after this check, `key` is a Digit.
const isDigit = (key: Key): key is Digit => key >= '0' && key <= '9' && key.length === 1

export interface CalcState {
  display: string
  acc: number | null // value stored before the operator
  op: Op | null
  overwrite: boolean // next digit starts a new number
}

export const initialCalc: CalcState = { display: '0', acc: null, op: null, overwrite: true }

function compute(a: number, op: Op, b: number): string {
  const r = op === '+' ? a + b : op === '−' ? a - b : op === '×' ? a * b : b === 0 ? NaN : a / b
  if (!Number.isFinite(r)) return 'Error'
  return String(Number(r.toPrecision(12))) // trims floating-point noise like 0.1+0.2
}

export function press(s: CalcState, key: Key): CalcState {
  if (key === 'C') return initialCalc
  if (isDigit(key)) {
    const display = s.overwrite || s.display === '0' ? key : s.display + key
    return { ...s, display: display.slice(0, 12), overwrite: false }
  }
  if (key === '.') {
    if (s.overwrite) return { ...s, display: '0.', overwrite: false }
    return s.display.includes('.') ? s : { ...s, display: s.display + '.' }
  }
  if (key === '=') {
    if (s.op === null || s.acc === null) return { ...s, overwrite: true }
    return { display: compute(s.acc, s.op, Number(s.display)), acc: null, op: null, overwrite: true }
  }
  // Operator: chain calculations like a real calculator (2 + 3 + → shows 5).
  const display = s.op && s.acc !== null && !s.overwrite ? compute(s.acc, s.op, Number(s.display)) : s.display
  return { display, acc: display === 'Error' ? null : Number(display), op: key, overwrite: true }
}

/**
 * Return code: typing these digits and pressing "=" (with no operator) reopens Echo.
 * This is a fixed demo code, documented in the README so reviewers can get back in.
 * In a real product this would be the user's own secret code.
 */
export const DEMO_RETURN_CODE = '1234'

export function isReturnCode(s: CalcState, key: Key): boolean {
  return key === '=' && s.op === null && !s.overwrite && s.display === DEMO_RETURN_CODE
}
