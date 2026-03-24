/** Палитра как в конструкторе салона (ConstructorPage HEADER_TEXT_OPTIONS) */
export const MASSAGE_HEADER_TEXT_OPTIONS = [
  { id: 'gold', color: '#F6C453' },
  { id: 'blue', color: '#3b82f6' },
  { id: 'red', color: '#ef4444' },
  { id: 'pink', color: '#FF4D9D' },
  { id: 'coral', color: '#FDA4AF' },
  { id: 'violet', color: '#C7B7FF' },
  { id: 'orange', color: '#f97316' },
  { id: 'lime', color: '#84cc16' },
  { id: 'emerald', color: '#4ADE80' },
  { id: 'white', color: '#FFFFFF' },
  { id: 'indigo', color: '#6366f1' },
  { id: 'gray', color: '#6b7280' },
  { id: 'brown', color: '#92400e' },
  { id: 'black', color: '#0b0b0b' },
] as const

export type MassageColorId = (typeof MASSAGE_HEADER_TEXT_OPTIONS)[number]['id'] | 'default'

export type MassageThemeColors = {
  topBarBg?: string
  navBg?: string
  navLink?: string
  siteName?: string
  tagline?: string
  address?: string
  contactOnline?: string
  callUs?: string
  phone?: string
  heroLine1?: string
  heroLine2?: string
  heroSub?: string
  heroCtaBorder?: string
  /** Блок «Услуги»: заголовок секции */
  svcBlockTitle?: string
  /** Блок «Услуги»: подзаголовок */
  svcBlockSub?: string
  /** Карточки услуг: название */
  svcCardTitle?: string
  /** Карточки услуг: описание */
  svcCardDesc?: string
  /** Карточки услуг: цена */
  svcCardPrice?: string
  /** Блок «О салоне»: главный заголовок */
  aboutHeading?: string
  /** Блок «О салоне»: текст */
  aboutBody?: string
  /** Блок «О салоне»: миссия / подпись */
  aboutMission?: string
  /** Галерея: главный заголовок */
  galTitle?: string
  /** Галерея: подзаголовок */
  galSub?: string
  /** Галерея: активная вкладка секции (фон и обводка; текст белый) */
  galTabActive?: string
}

const DEFAULTS: Record<keyof MassageThemeColors, string> = {
  topBarBg: '#ffffff',
  navBg: '#ffffff',
  navLink: '#4b5563',
  siteName: '#1a1a1a',
  tagline: '#9ca3af',
  address: '#1a1a1a',
  contactOnline: '#D4908F',
  callUs: '#9ca3af',
  phone: '#1a1a1a',
  heroLine1: '#1a1a1a',
  heroLine2: '#1a1a1a',
  heroSub: '#4b5563',
  heroCtaBorder: '#D4908F',
  svcBlockTitle: '#1a1a1a',
  svcBlockSub: '#9ca3af',
  svcCardTitle: '#1a1a1a',
  svcCardDesc: '#4b5563',
  svcCardPrice: '#1a1a1a',
  aboutHeading: '#1a1a1a',
  aboutBody: '#4b5563',
  aboutMission: '#9ca3af',
  galTitle: '#1a1a1a',
  galSub: '#9ca3af',
  galTabActive: '#D4908F',
}

function hexFromId(id: string | undefined, fallbackHex: string): string {
  if (!id || id === 'default') return fallbackHex
  const opt = MASSAGE_HEADER_TEXT_OPTIONS.find(o => o.id === id)
  return opt?.color ?? fallbackHex
}

export function resolveMassageThemeColor(
  key: keyof MassageThemeColors,
  colors: MassageThemeColors | undefined
): string {
  const raw = colors?.[key]
  return hexFromId(raw, DEFAULTS[key])
}

export function parseMassageThemeColors(json: string | undefined): MassageThemeColors {
  if (!json) return {}
  try {
    const o = JSON.parse(json) as Record<string, unknown>
    if (typeof o !== 'object' || o === null) return {}
    const out: MassageThemeColors = {}
    const keys: (keyof MassageThemeColors)[] = [
      'topBarBg',
      'navBg',
      'navLink',
      'siteName',
      'tagline',
      'address',
      'contactOnline',
      'callUs',
      'phone',
      'heroLine1',
      'heroLine2',
      'heroSub',
      'heroCtaBorder',
      'svcBlockTitle',
      'svcBlockSub',
      'svcCardTitle',
      'svcCardDesc',
      'svcCardPrice',
      'aboutHeading',
      'aboutBody',
      'aboutMission',
      'galTitle',
      'galSub',
      'galTabActive',
    ]
    for (const k of keys) {
      const v = o[k]
      if (typeof v === 'string') out[k] = v
    }
    return out
  } catch {
    return {}
  }
}
