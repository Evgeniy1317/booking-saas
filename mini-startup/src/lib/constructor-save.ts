/**
 * Копирует черновики текущей темы в публичные ключи (сохранить).
 * Правки других тем не трогаются; черновики не удаляются.
 */
export function flushDraftsToPublic(): void {
  if (typeof window === 'undefined') return
  const themeId =
    window.localStorage.getItem('draft_publicHeaderTheme') ??
    window.localStorage.getItem('publicHeaderTheme') ??
    'hair'
  const theme = themeId.startsWith('premium-') ? themeId.replace('premium-', '') : themeId
  const suffix = `_${theme}`
  const keys: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i)
    if (!key?.startsWith('draft_')) continue
    if (key === 'draft_publicHeaderTheme' || key.endsWith(suffix)) keys.push(key)
  }
  keys.forEach((draftKey) => {
    const value = window.localStorage.getItem(draftKey)
    if (value === null) return
    const publicKey =
      draftKey === 'draft_publicHeaderTheme'
        ? 'publicHeaderTheme'
        : draftKey.replace(/^draft_/, '').replace(new RegExp(`${suffix}$`), '')
    window.localStorage.setItem(publicKey, value)
  })
}
