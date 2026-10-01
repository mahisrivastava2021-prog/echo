/**
 * Browser-level disguise applied when the user taps Exit.
 * Must be instant and must not depend on the network.
 */

// Calculator icon as an inline SVG data URI, so switching icons makes no network request.
const DECOY_ICON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='4' y='2' width='24' height='28' rx='4' fill='%23555'/%3E%3Crect x='8' y='6' width='16' height='6' rx='1' fill='%23ddd'/%3E%3Cg fill='%23ddd'%3E%3Crect x='8' y='15' width='4' height='4'/%3E%3Crect x='14' y='15' width='4' height='4'/%3E%3Crect x='20' y='15' width='4' height='4'/%3E%3Crect x='8' y='21' width='4' height='4'/%3E%3Crect x='14' y='21' width='4' height='4'/%3E%3Crect x='20' y='21' width='4' height='4'/%3E%3C/g%3E%3C/svg%3E"

let original: { title: string; icon: string | null } | null = null

function iconLink(): HTMLLinkElement | null {
  return document.querySelector<HTMLLinkElement>('link[rel="icon"]')
}

export function applyDisguise(decoyTitle: string): void {
  if (!original) original = { title: document.title, icon: iconLink()?.href ?? null }
  document.title = decoyTitle
  const link = iconLink()
  if (link) link.href = DECOY_ICON
  // Replace (not push) the history entry and drop any #fragment, so the
  // Back button leaves the site instead of returning to Echo.
  history.replaceState(null, '', location.pathname)
}

export function removeDisguise(): void {
  if (!original) return
  document.title = original.title
  const link = iconLink()
  if (link && original.icon) link.href = original.icon
  original = null
}
