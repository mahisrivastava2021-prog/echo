import { createContext, useContext } from 'react'
import type { Lang, MessageKey } from './t'

export interface I18nValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: MessageKey) => string
}

export const I18nContext = createContext<I18nValue | null>(null)

export function useI18n(): I18nValue {
  const value = useContext(I18nContext)
  if (!value) throw new Error('useI18n must be used inside <I18nProvider>')
  return value
}
