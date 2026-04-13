import { useState, useEffect, useCallback } from 'react'
import {
  isMassageTemplateSlotId,
  type MassageOrdinaryTemplateId,
  type MassageTemplateSlotId,
} from '@/lib/massage-template-registry'
import {
  deleteMassageHeroVideoBlob,
  MASSAGE_HERO_VIDEO_IDB_MARKER,
} from '@/lib/massage-hero-video-idb'
import type { PublicSiteLang } from '@/lib/public-site-langs'

export const MASSAGE_DRAFT_PREFIX = 'massage_draft_'

/** Какой из 5 шаблонов активен (черновики изолированы по слоту — те же id, что у стандартных тем парикмахерской). */
const TEMPLATE_SLOT_KEY = 'massageTemplateSlot'

/** Старые слоты m1…m5 → новые id */
const LEGACY_M_TO_NEW: Record<string, MassageOrdinaryTemplateId> = {
  m1: 'hair',
  m2: 'barber',
  m3: 'cosmetology',
  m4: 'coloring',
  m5: 'manicure',
}

const LEGACY_M_SLOT: Record<MassageOrdinaryTemplateId, string> = {
  hair: 'm1',
  barber: 'm2',
  cosmetology: 'm3',
  coloring: 'm4',
  manicure: 'm5',
}

/** Любой ключ вида massage_draft_<slot>_ с известным слотом */
function isSlottedMassageDraftKey(k: string): boolean {
  return /^massage_draft_(m[1-5]|hair|barber|cosmetology|coloring|manicure|premium-massage)_/.test(k)
}

function slottedDraftKey(slot: string, key: string): string {
  return `${MASSAGE_DRAFT_PREFIX}${slot}_${key}`
}

/** Ключ localStorage для черновика массажного слота (экспорт для превью PublicPage). */
export function massageDraftStorageKey(slot: string, key: string): string {
  return slottedDraftKey(slot, key)
}

/** Поля PublicPage ↔ имена ключей в massage draft (где отличаются). */
export function massageDraftKeyForPublicPageKey(publicPageKey: string): string {
  const alias: Record<string, string> = {
    publicHeroImage: 'publicMassageHeroBg',
    publicHeroVideo: 'publicMassageHeroVideo',
  }
  return alias[publicPageKey] ?? publicPageKey
}

/** Старый формат без слота: massage_draft_publicHeroTitle1 */
function legacyDraftKey(key: string): string {
  return MASSAGE_DRAFT_PREFIX + key
}

export function getMassageTemplateSlot(): MassageTemplateSlotId {
  if (typeof window === 'undefined') return 'hair'
  const raw = window.localStorage.getItem(TEMPLATE_SLOT_KEY)
  if (!raw) return 'hair'
  if (isMassageTemplateSlotId(raw)) return raw
  const migrated = LEGACY_M_TO_NEW[raw]
  if (migrated) {
    window.localStorage.setItem(TEMPLATE_SLOT_KEY, migrated)
    return migrated
  }
  return 'hair'
}

export function setMassageTemplateSlot(slot: MassageTemplateSlotId): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(TEMPLATE_SLOT_KEY, slot)
}

export function getMassageDraft(key: string): string {
  if (typeof window === 'undefined') return ''
  const slot = getMassageTemplateSlot()
  const slotted = slottedDraftKey(slot, key)
  const v = window.localStorage.getItem(slotted)
  if (v !== null) return v
  const legacyM = slot === 'premium-massage' ? undefined : LEGACY_M_SLOT[slot]
  if (legacyM) {
    const oldSlotted = slottedDraftKey(legacyM, key)
    const oldV = window.localStorage.getItem(oldSlotted)
    if (oldV !== null) return oldV
  }
  /** Миграция: старые ключи без слота считаются данными слота hair */
  if (slot === 'hair') {
    const leg = window.localStorage.getItem(legacyDraftKey(key))
    if (leg !== null) return leg
  }
  return ''
}

export function setMassageDraft(key: string, value: string): void {
  if (typeof window === 'undefined') return
  const slot = getMassageTemplateSlot()
  if (key === 'publicMassageHeroVideo' && value !== MASSAGE_HERO_VIDEO_IDB_MARKER) {
    void deleteMassageHeroVideoBlob(slot)
  }
  try {
    window.localStorage.setItem(slottedDraftKey(slot, key), value)
  } catch {
    console.warn('[massage-draft] localStorage quota exceeded, write skipped')
  }
}

export function removeMassageDraftKey(key: string): void {
  if (typeof window === 'undefined') return
  const slot = getMassageTemplateSlot()
  if (key === 'publicMassageHeroVideo') {
    void deleteMassageHeroVideoBlob(slot)
  }
  window.localStorage.removeItem(slottedDraftKey(slot, key))
}

/** Тексты, которые задаются отдельно для каждого языка сайта (остальные ключи — общие). */
const MASSAGE_LANG_SCOPED_TEXT_KEYS = new Set<string>([
  'publicSiteName',
  'publicHeroTitle1',
  'publicHeroTitle2',
  'publicHeroSub',
  'publicHeroBookOnline',
  'publicHeroWhereFind',
  'publicAddress',
  'publicName',
  'publicHeaderPrimaryCta',
  'publicHeaderSecondaryCta',
  'publicGalleryTitle',
  'publicBookingTitle',
  'publicBookingSubtitle',
  'publicHours',
  'publicDayOff',
  'publicFooterAddress',
  'publicFooterName',
  'publicPlaceName',
  'publicTagline',
  'publicCallUs',
  'publicContactOnline',
  'publicMassageSvcTitle',
  'publicMassageSvcSub',
  'publicMassageAboutTitle',
  'publicMassageAboutText',
  'publicMassageAboutMission',
  'publicMassageGalTitle',
  'publicMassageGalSub',
  'publicMassageSubsTitle',
  'publicMassageCatalogTitle',
  'publicMassageSpecsTitle',
  'publicMassageCtaTitle',
  'publicMassageCtaSub',
  'publicMassageCtaBtn',
  'publicMassageContactTitle',
  'publicMassageContactOurHeading',
  'publicMassageContactSchedule',
  'publicMassageContactEmail',
  'publicMassageContactMapLabel',
])

export function isMassageLangScopedTextKey(key: string): boolean {
  return MASSAGE_LANG_SCOPED_TEXT_KEYS.has(key)
}

/** Чтение черновика с учётом языка: для текстовых полей — `key__lang`, для ru ещё и старый ключ без суффикса. */
export function getMassageDraftLangAware(key: string, lang: PublicSiteLang): string {
  if (!MASSAGE_LANG_SCOPED_TEXT_KEYS.has(key)) return getMassageDraft(key)
  const scoped = getMassageDraft(`${key}__${lang}`)
  if (scoped !== '') return scoped
  if (lang === 'ru') {
    const legacy = getMassageDraft(key)
    if (legacy !== '') return legacy
  }
  return ''
}

export function setMassageDraftLangAware(key: string, lang: PublicSiteLang, value: string): void {
  if (!MASSAGE_LANG_SCOPED_TEXT_KEYS.has(key)) {
    setMassageDraft(key, value)
    return
  }
  setMassageDraft(`${key}__${lang}`, value)
  if (lang === 'ru') {
    setMassageDraft(key, value)
  }
}

export function removeMassageDraftLangAware(key: string, lang: PublicSiteLang): void {
  if (!MASSAGE_LANG_SCOPED_TEXT_KEYS.has(key)) {
    removeMassageDraftKey(key)
    return
  }
  removeMassageDraftKey(`${key}__${lang}`)
  if (lang === 'ru') {
    removeMassageDraftKey(key)
  }
}

/** Удаляет все черновики текущего шаблона (текущий слот). */
export function clearMassageDraftsForCurrentTemplate(): void {
  if (typeof window === 'undefined') return
  const slot = getMassageTemplateSlot()
  const prefix = `${MASSAGE_DRAFT_PREFIX}${slot}_`
  const toRemove: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k?.startsWith(prefix)) toRemove.push(k)
  }
  toRemove.forEach((k) => window.localStorage.removeItem(k))
  void deleteMassageHeroVideoBlob(slot)
  /** Однократная очистка наследия без слота для hair */
  if (slot === 'hair') {
    const legacy: string[] = []
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (!k?.startsWith(MASSAGE_DRAFT_PREFIX)) continue
      if (isSlottedMassageDraftKey(k)) continue
      if (k === TEMPLATE_SLOT_KEY) continue
      legacy.push(k)
    }
    legacy.forEach((k) => window.localStorage.removeItem(k))
  }
}

/**
 * Значение из `massage_draft_<slot>_…` для превью 5 обычных тем на PublicPage.
 * Для языковых ключей — сначала `key__lang`, для ru ещё наследие без суффикса.
 * `null` = ключа нет, нужен fallback через draft_* / публичные ключи / дефолты.
 */
export function readMassageOrdinarySlotString(
  slot: string,
  publicPageKey: string,
  lang: PublicSiteLang
): string | null {
  if (typeof window === 'undefined') return null
  const mk = massageDraftKeyForPublicPageKey(publicPageKey)
  if (isMassageLangScopedTextKey(mk)) {
    const scoped = window.localStorage.getItem(massageDraftStorageKey(slot, `${mk}__${lang}`))
    if (scoped !== null) return scoped
    if (lang === 'ru') {
      const leg = window.localStorage.getItem(massageDraftStorageKey(slot, mk))
      if (leg !== null) return leg
    }
    return null
  }
  return window.localStorage.getItem(massageDraftStorageKey(slot, mk))
}

export function massageCurrentTemplateHasDraftKeys(): boolean {
  if (typeof window === 'undefined') return false
  const slot = getMassageTemplateSlot()
  const prefix = `${MASSAGE_DRAFT_PREFIX}${slot}_`
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k?.startsWith(prefix) && window.localStorage.getItem(k)) return true
  }
  if (slot === 'hair') {
    for (let i = 0; i < window.localStorage.length; i++) {
      const k = window.localStorage.key(i)
      if (!k?.startsWith(MASSAGE_DRAFT_PREFIX)) continue
      if (isSlottedMassageDraftKey(k)) continue
      if (k === TEMPLATE_SLOT_KEY) continue
      if (window.localStorage.getItem(k)) return true
    }
  }
  return false
}

/** Обновляет превью «Полный размер» при изменении localStorage из другой вкладки и по таймеру */
export function useMassageDraftSnapshot(): number {
  const [v, setV] = useState(0)
  const refresh = useCallback(() => setV((x) => x + 1), [])
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.startsWith(MASSAGE_DRAFT_PREFIX) || e.key === TEMPLATE_SLOT_KEY) refresh()
    }
    window.addEventListener('storage', onStorage)
    const t = window.setInterval(refresh, 500)
    const onVis = () => {
      if (document.visibilityState === 'visible') refresh()
    }
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.clearInterval(t)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [refresh])
  return v
}
