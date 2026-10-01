import en from './en.json'

/**
 * Tiny translation helper. English is the reference: every other language
 * file must provide the same keys (enforced by the Messages type).
 * Adding a language = add `xx.json` + register it in MESSAGES.
 */
export type MessageKey = keyof typeof en
export type Messages = Record<MessageKey, string>
export type Lang = 'en'

const MESSAGES: Record<Lang, Messages> = { en }

export function translate(lang: Lang, key: MessageKey): string {
  // Fall back to English so a missing translation never shows an empty button.
  return MESSAGES[lang][key] ?? MESSAGES.en[key]
}

/** For keys built at runtime (e.g. `signal.${id}`): checks the key exists before using it. */
export function isMessageKey(key: string): key is MessageKey {
  return key in en
}
