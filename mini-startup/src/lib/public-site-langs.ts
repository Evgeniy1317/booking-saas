export type PublicSiteLang = 'ru' | 'en' | 'ro'

const STORAGE_KEY = 'publicSiteLangs'

const ALL: PublicSiteLang[] = ['ru', 'en', 'ro']

/** Языки, доступные на публичном сайте (чекбоксы в конструкторе). По умолчанию — все три. */
export function getEnabledSiteLangs(): PublicSiteLang[] {
  if (typeof window === 'undefined') return [...ALL]
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return [...ALL]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return [...ALL]
    const filtered = parsed.filter((x): x is PublicSiteLang => x === 'ru' || x === 'en' || x === 'ro')
    return filtered.length > 0 ? ALL.filter((c) => filtered.includes(c)) : [...ALL]
  } catch {
    return [...ALL]
  }
}

export function setEnabledSiteLangs(codes: PublicSiteLang[]): void {
  if (typeof window === 'undefined') return
  const uniq = ALL.filter((c) => codes.includes(c))
  if (uniq.length === 0) return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uniq))
}

export function normalizePublicLangForEnabled(
  current: PublicSiteLang,
  enabled: PublicSiteLang[]
): PublicSiteLang {
  if (enabled.length === 0) return 'ru'
  if (enabled.includes(current)) return current
  return enabled[0]
}
