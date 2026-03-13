/**
 * Копирует черновики текущей темы текущего салона в публичные ключи (сохранить).
 * Правки других тем не трогаются; черновики не удаляются.
 */
export function flushDraftsToPublic(): void {
  if (typeof window === 'undefined') return
  const slug = window.localStorage.getItem('publicSlug') || 'salon'
  const themeId =
    window.localStorage.getItem('draft_publicHeaderTheme') ??
    window.localStorage.getItem('publicHeaderTheme') ??
    'hair'
  const theme = themeId.startsWith('premium-') ? themeId.replace('premium-', '') : themeId
  const suffixSlug = `_${slug}_${theme}`
  const suffixLegacy = `_${theme}`
  const keys: string[] = []
  if (window.localStorage.getItem('draft_publicHeaderTheme') != null) keys.push('draft_publicHeaderTheme')
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key?.startsWith('draft_') || key === 'draft_publicHeaderTheme') continue
    if (key.endsWith(suffixLegacy)) keys.push(key)
  }
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key?.startsWith('draft_') || key === 'draft_publicHeaderTheme') continue
    if (key.endsWith(suffixSlug)) keys.push(key)
  }
  keys.forEach((draftKey) => {
    const value = window.localStorage.getItem(draftKey)
    if (value === null) return
    const suffixToStrip = draftKey.endsWith(suffixSlug) ? suffixSlug : draftKey.endsWith(suffixLegacy) ? suffixLegacy : ''
    const publicKey =
      draftKey === 'draft_publicHeaderTheme'
        ? 'publicHeaderTheme'
        : draftKey.replace(/^draft_/, '').replace(new RegExp(`${suffixToStrip.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`), '')
    window.localStorage.setItem(publicKey, value)
  })
}
