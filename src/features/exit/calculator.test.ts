import { describe, expect, it } from 'vitest'
import { DEMO_RETURN_CODE, initialCalc, isReturnCode, press, type CalcState, type Key } from './calculator'

// Helper: press a sequence of keys, starting from a fresh calculator.
function run(keys: Key[]): CalcState {
  return keys.reduce(press, initialCalc)
}

describe('decoy calculator', () => {
  it('does basic arithmetic', () => {
    expect(run(['2', '+', '3', '=']).display).toBe('5')
    expect(run(['9', '÷', '4', '=']).display).toBe('2.25')
  })

  it('chains operators like a real calculator', () => {
    expect(run(['2', '+', '3', '×']).display).toBe('5')
  })

  it('hides floating-point noise', () => {
    expect(run(['.', '1', '+', '.', '2', '=']).display).toBe('0.3')
  })

  it('shows Error on division by zero', () => {
    expect(run(['5', '÷', '0', '=']).display).toBe('Error')
  })

  it('recognises the return code only when typed then "="', () => {
    const typed = run(DEMO_RETURN_CODE.split('') as Key[])
    expect(isReturnCode(typed, '=')).toBe(true)
    expect(isReturnCode(typed, '+')).toBe(false)
  })

  it('does not treat a calculated result as the return code', () => {
    // 1000 + 234 = 1234 must not unlock Echo; only typing the digits should.
    const result = run(['1', '0', '0', '0', '+', '2', '3', '4', '='])
    expect(result.display).toBe('1234')
    expect(isReturnCode(result, '=')).toBe(false)
  })
})
