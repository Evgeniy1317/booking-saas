import type { PublicSiteLang } from '@/lib/public-site-langs'
import { FOOTER_DEFAULT_DAY_OFF, FOOTER_DEFAULT_HOURS } from '@/lib/hair-theme-defaults'
import { displayFooterFieldStored } from '@/lib/public-footer-field-empty'

const CYRILLIC = /[\u0400-\u04FF]/

function norm(s: string): string {
  return s
    .replace(/\s+/g, ' ')
    .replace(/[–—−-]/g, '-')
    .trim()
    .toLowerCase()
}

const RU_DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const
const EN_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const
/** Как в `FOOTER_DEFAULTS_BY_LANG.ro` (Lun–Sâm, …) */
const RO_DAYS = ['Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm', 'Dum'] as const

function mapRuDays(text: string, lang: PublicSiteLang): string {
  if (lang === 'ru') return text
  const target = lang === 'en' ? EN_DAYS : RO_DAYS
  let out = text
  for (let i = 0; i < RU_DAYS.length; i++) {
    const re = new RegExp(RU_DAYS[i].replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    out = out.replace(re, target[i])
  }
  return out
}

function translateRuDayOffWord(text: string, lang: PublicSiteLang): string {
  if (lang === 'ru') return text
  if (lang === 'en') return text.replace(/выходной/gi, 'day off')
  return text.replace(/выходной/gi, 'zi liberă')
}

/** Строка графика из storage часто на русском — для en/ro показываем дни и дефолт как на текущем языке. */
export function localizeFooterHoursLine(
  text: string,
  publicLang: PublicSiteLang,
  localizedDefaultHours: string,
): string {
  const t = displayFooterFieldStored(text)
  if (!t || publicLang === 'ru') return t
  if (!CYRILLIC.test(t)) return t
  if (norm(t) === norm(FOOTER_DEFAULT_HOURS)) return localizedDefaultHours
  return mapRuDays(t, publicLang)
}

export function localizeFooterDayOffLine(
  text: string,
  publicLang: PublicSiteLang,
  localizedDefaultDayOff: string,
): string {
  const t = displayFooterFieldStored(text)
  if (!t || publicLang === 'ru') return t
  if (!CYRILLIC.test(t)) return t
  if (norm(t) === norm(FOOTER_DEFAULT_DAY_OFF)) return localizedDefaultDayOff
  let out = mapRuDays(t, publicLang)
  out = translateRuDayOffWord(out, publicLang)
  return out
}
