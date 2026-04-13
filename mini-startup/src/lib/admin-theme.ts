/** Не использовать ключ `theme`: на github.io один origin на все репозитории — значение перетирается чужими сайтами. */
export const ADMIN_THEME_STORAGE_KEY = 'bookera-admin-theme'

export type AdminTheme = 'light' | 'dark'

export function readStoredAdminTheme(): AdminTheme | null {
  try {
    const v = localStorage.getItem(ADMIN_THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
    const legacy = localStorage.getItem('theme')
    if (legacy === 'light' || legacy === 'dark') {
      localStorage.setItem(ADMIN_THEME_STORAGE_KEY, legacy)
      return legacy
    }
  } catch {
    /* private mode / blocked */
  }
  return null
}

export function applyAdminThemeToDocument(theme: AdminTheme): void {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
    root.classList.remove('dark')
  } else {
    root.classList.remove('light')
    root.classList.add('dark')
  }
}

/** До React: админка и конструктор сразу с корректной темой (по умолчанию тёмная). */
export function applyStoredAdminThemeOrDefault(): AdminTheme {
  const stored = readStoredAdminTheme()
  const effective: AdminTheme = stored ?? 'dark'
  applyAdminThemeToDocument(effective)
  return effective
}
