/** Hero премиум: отдельный черновик на язык (`draft_*_*_*_ru` и т.д.). */
export const PREMIUM_HERO_LANG_SCOPED_KEYS = new Set<string>([
  'publicPremiumHeroSubtitle',
  'publicPremiumHeroTitle',
  'publicPremiumHeroContactsLabel',
  'publicPremiumBookLabel',
])

/** Обычный салон: тексты hero-кнопок и JSON подписей строк футера — по языку, иначе переключатель языка бессилен. */
export const ORDINARY_SALON_LANG_SCOPED_KEYS = new Set<string>([
  'publicHeaderPrimaryCta',
  'publicHeaderSecondaryCta',
  'publicFooterLabels',
])

export function isLangScopedPublicDraftKey(key: string): boolean {
  return PREMIUM_HERO_LANG_SCOPED_KEYS.has(key) || ORDINARY_SALON_LANG_SCOPED_KEYS.has(key)
}
