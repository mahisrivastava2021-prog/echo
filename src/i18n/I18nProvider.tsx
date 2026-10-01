import { useCallback, useState, type ReactNode } from 'react'
import { I18nContext } from './context'
import { translate, type Lang, type MessageKey } from './t'

// React "context" makes the current language available to every component
// without passing it down through props. Components read it with useI18n().
export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en')
  const t = useCallback((key: MessageKey) => translate(lang, key), [lang])
  return <I18nContext.Provider value={{ lang, setLang, t }}>{children}</I18nContext.Provider>
}
