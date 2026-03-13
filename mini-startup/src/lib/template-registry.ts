/**
 * Реестр шаблонов конструктора.
 *
 * Базовые шаблоны (v1) зафиксированы как готовые — структура страницы и блоков не меняется.
 * Премиум-шаблоны: текущие premium-hair / premium-barber пока используют ту же структуру;
 * далее будут добавлены 2 отдельных премиум-сайта с другой структурой (свои страницы/роуты).
 */

/** ID обычных шаблонов — финальная версия, структура зафиксирована */
export const ORDINARY_THEME_IDS = [
  'hair',
  'barber',
  'cosmetology',
  'coloring',
  'manicure',
] as const

export type OrdinaryThemeId = (typeof ORDINARY_THEME_IDS)[number]

/** ID премиум-шаблонов (текущие — та же структура; новые — отдельная структура) */
export const PREMIUM_THEME_IDS_CURRENT = ['premium-hair', 'premium-barber'] as const

/** Слоты для 2 новых премиум-сайтов с другой структурой (добавлять при создании) */
export const PREMIUM_SITES_NEW_IDS = [] as const

/** Блоки базовой структуры (шапка, галерея, запись, галерея работ, карта, футер) — не менять для обычных шаблонов */
export const BASE_BLOCK_IDS = [
  'header',
  'gallery',
  'booking',
  'works',
  'map',
  'footer',
] as const

export function isOrdinaryTheme(themeId: string): boolean {
  return ORDINARY_THEME_IDS.includes(themeId as OrdinaryThemeId)
}

export function isPremiumTheme(themeId: string): boolean {
  return themeId.startsWith('premium-')
}
