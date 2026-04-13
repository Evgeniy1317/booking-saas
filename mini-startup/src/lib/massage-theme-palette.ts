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
  /** Hero: фон первой кнопки */
  heroPrimBtnBg?: string
  /** Hero: фон первой кнопки при наведении */
  heroPrimBtnHover?: string
  /** Hero: рамка первой кнопки */
  heroCtaBorder?: string
  /** Hero: фон второй кнопки */
  heroSecBtnBg?: string
  /** Hero: фон второй кнопки при наведении */
  heroSecBtnHover?: string
  /** Hero: рамка второй кнопки */
  heroSecBtnBorder?: string
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
  /** Абонементы: заголовок блока */
  subsBlockTitle?: string
  /** Абонементы: заголовок карточки */
  subsCardTitle?: string
  /** Абонементы: подзаголовок карточки */
  subsCardDesc?: string
  /** Абонементы: фон карточки — старт градиента */
  subsCardBgFrom?: string
  /** Абонементы: фон карточки — конец градиента */
  subsCardBgTo?: string
  /** Абонементы: кнопка акции — текст */
  subsCtaText?: string
  /** Абонементы: кнопка акции — фон */
  subsCtaBg?: string
  /** Блок записи (CTA): градиент фона — начало */
  ctaBlockBgFrom?: string
  /** Блок записи (CTA): градиент фона — конец */
  ctaBlockBgTo?: string
  /** Блок записи (CTA): заголовок */
  ctaBlockTitle?: string
  /** Блок записи (CTA): подзаголовок */
  ctaBlockSub?: string
  /** Блок записи (CTA): фон кнопки */
  ctaBlockBtnBg?: string
  /** Блок записи (CTA): текст кнопки */
  ctaBlockBtnText?: string
  /** Контакты: главный заголовок секции */
  contactsBlockTitle?: string
  /** Контакты: подзаголовок «Наши контакты» */
  contactsSectionHeading?: string
  /** Контакты: иконки (pin, часы, телефон, почта) */
  contactsIcon?: string
  /** Контакты: основной текст (адрес, график, телефон, email) */
  contactsBody?: string
  /** Контакты: подписи секций (написать онлайн, соцсети, подпись карты) */
  contactsLabel?: string
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
  heroPrimBtnBg: '#D4908F',
  heroPrimBtnHover: '#C07F7E',
  heroCtaBorder: '#D4908F',
  heroSecBtnBg: '#6b7280',
  heroSecBtnHover: '#4b5563',
  heroSecBtnBorder: '#FFFFFF40',
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
  subsBlockTitle: '#1a1a1a',
  subsCardTitle: '#FFFFFF',
  subsCardDesc: '#F6E8EE',
  subsCardBgFrom: '#C7B7FF',
  subsCardBgTo: '#FDA4AF',
  subsCtaText: '#FFFFFF',
  subsCtaBg: '#D4908F',
  ctaBlockBgFrom: '#D4908F',
  ctaBlockBgTo: '#C07F7E',
  ctaBlockTitle: '#FFFFFF',
  ctaBlockSub: '#F5E8EA',
  ctaBlockBtnBg: '#FFFFFF',
  ctaBlockBtnText: '#D4908F',
  contactsBlockTitle: '#1a1a1a',
  contactsSectionHeading: '#1a1a1a',
  contactsIcon: '#D4908F',
  contactsBody: '#1a1a1a',
  contactsLabel: '#9ca3af',
}

/** Пресеты из сайдбара (`gold`, `violet`…) или прямой `#hex` из старых данных */
function resolveColorToken(raw: string | undefined, fallbackHex: string): string {
  if (!raw || raw === 'default') return fallbackHex
  const t = raw.trim()
  if (/^#[0-9A-Fa-f]{3,8}$/i.test(t)) return t
  if (/^rgba?\(/i.test(t)) return t
  const opt = MASSAGE_HEADER_TEXT_OPTIONS.find(o => o.id === raw)
  return opt?.color ?? fallbackHex
}

export function resolveMassageThemeColor(
  key: keyof MassageThemeColors,
  colors: MassageThemeColors | undefined
): string {
  const raw = colors?.[key]
  return resolveColorToken(raw, DEFAULTS[key])
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
      'heroPrimBtnBg',
      'heroPrimBtnHover',
      'heroCtaBorder',
      'heroSecBtnBg',
      'heroSecBtnHover',
      'heroSecBtnBorder',
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
      'subsBlockTitle',
      'subsCardTitle',
      'subsCardDesc',
      'subsCardBgFrom',
      'subsCardBgTo',
      'subsCtaText',
      'subsCtaBg',
      'ctaBlockBgFrom',
      'ctaBlockBgTo',
      'ctaBlockTitle',
      'ctaBlockSub',
      'ctaBlockBtnBg',
      'ctaBlockBtnText',
      'contactsBlockTitle',
      'contactsSectionHeading',
      'contactsIcon',
      'contactsBody',
      'contactsLabel',
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
