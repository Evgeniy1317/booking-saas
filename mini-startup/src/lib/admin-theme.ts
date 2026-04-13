/** Не использовать ключ `theme`: на github.io один origin на все репозитории — значение перетирается чужими сайтами. */
export const ADMIN_THEME_STORAGE_KEY = 'bookera-admin-theme'

export type AdminTheme = 'light' | 'dark'

export function readStoredAdminTheme(): AdminTheme | null {
  try {
    const v = localStorage.getItem(ADMIN_THEME_STORAGE_KEY)
    if (v === 'light' || v === 'dark') return v
    /** Не читаем legacy `theme`: на github.io один localStorage на все Pages — чужое `light` ломает тему. */
  } catch {
    /* private mode / blocked */
  }
  return null
}

/**
 * Тёмная тема в index.css задана в :root; светлая — класс `.light` на html.
 * Класс `dark` на html не используем: в этом проекте нет блока `.dark { … }`, а shadcn/tailwind
 * с `darkMode: class` могут вести себя как в шаблоне «светлый root + .dark» и давать инверсию.
 */
export function applyAdminThemeToDocument(theme: AdminTheme): void {
  const root = document.documentElement
  if (theme === 'light') {
    root.classList.add('light')
  } else {
    root.classList.remove('light')
  }
  root.classList.remove('dark')
}

/** До React: админка и конструктор сразу с корректной темой (по умолчанию тёмная). */
export function applyStoredAdminThemeOrDefault(): AdminTheme {
  const stored = readStoredAdminTheme()
  const effective: AdminTheme = stored ?? 'dark'
  applyAdminThemeToDocument(effective)
  return effective
}
