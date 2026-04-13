/** Hero с drag-and-drop для всех обычных шаблонов: hair, barber, cosmetology, coloring, manicure (не premium). */
import { useState, useRef, useCallback, useEffect, useLayoutEffect, useMemo } from 'react'
import { GripVertical, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { isOrdinaryDraggableHeaderTheme } from '@/lib/ordinary-draggable-header-themes'
import type { PublicSiteLang } from '@/lib/public-site-langs'
import bookingIcon from '@/assets/images/free-icon-write-file-17127339.png'

const SNAP_GUIDES = [0, 25, 50, 75, 100]
const SNAP_THRESHOLD = 5
/** Меньший радиус прилипания для главного названия — привязка только при близком подведении */
const TITLE_SNAP_THRESHOLD = 2
/** Отступ от угла при притягивании в угол (в процентах) — элемент встанет не в 0,0, а с отступом */
const CORNER_PADDING = 3
/** Радиус зоны, в которой срабатывает притягивание к углу с отступом (в %) */
const CORNER_ZONE = 10

/** Зоны для логотипа: где будет логотип в полном размере — в углу с отступом по диагонали вниз (в %) */
const LOGO_ZONE_OFFSET_X = 5
const LOGO_ZONE_OFFSET_Y = 8
const LOGO_ZONE_LEFT: Position = { x: LOGO_ZONE_OFFSET_X, y: LOGO_ZONE_OFFSET_Y }
const LOGO_ZONE_RIGHT: Position = { x: 100 - LOGO_ZONE_OFFSET_X, y: LOGO_ZONE_OFFSET_Y }
/** Прилипание только когда курсор почти у точки (в %) */
const LOGO_ZONE_SNAP_RADIUS = 6

/** Лимиты символов */
const MAX_TITLE_LEN = 60
const MAX_BUTTON_LEN = 30
/** Описание: макс. символов в одной строке */
const MAX_TAGLINE_CHARS_PER_LINE = 120
const MAX_TAGLINE_LINES = 20

type Position = { x: number; y: number }

/** Изначальный дизайн: всё по центру (x: 50 для лого/названия/описания; кнопки 40/60 — пара по центру), одинаковые отступы по вертикали */
const defaultLayout: Record<string, Position> = {
  logo: { x: 50, y: 49 },
  title: { x: 50, y: 64 },
  tagline: { x: 50, y: 80 },
  primaryCta: { x: 40, y: 95 },
  secondaryCta: { x: 60, y: 95 },
}

/** Первый заход с телефона (все обычные draggable-шаблоны): стек по центру — подменяется только если нет сохранённой раскладки */
const ORDINARY_MOBILE_EDIT_DEFAULT: Record<string, Position> = {
  logo: { x: 50, y: 18 },
  title: { x: 50, y: 30 },
  tagline: { x: 50, y: 44 },
  primaryCta: { x: 50, y: 80 },
  secondaryCta: { x: 50, y: 90 },
}

function layoutFallbackForInit(
  headerTheme: string,
  defaultLayoutProp: Record<string, Position> | undefined
): Record<string, Position> {
  const base = defaultLayoutProp ?? defaultLayout
  if (!isOrdinaryDraggableHeaderTheme(headerTheme)) return base
  if (typeof window === 'undefined') return base
  const branch = new URLSearchParams(window.location.search).get('headerLayoutBranch')
  const narrow =
    window.matchMedia('(max-width: 639px)').matches ||
    new URLSearchParams(window.location.search).get('mobileFrame') === '1'
  const useMobileStackDefaults = branch === 'mobile' || (branch !== 'desktop' && narrow)
  if (!useMobileStackDefaults) return base
  return { ...base, ...ORDINARY_MOBILE_EDIT_DEFAULT }
}

/** Логотип стоит на намеренной привязке к углу — не считать «старым» (иначе loadLayout сбрасывал бы раскладку в дефолт) */
function isAtIntentionalLogoCornerSnap(logo: Position): boolean {
  const dLeft = Math.hypot(logo.x - LOGO_ZONE_LEFT.x, logo.y - LOGO_ZONE_LEFT.y)
  const dRight = Math.hypot(logo.x - LOGO_ZONE_RIGHT.x, logo.y - LOGO_ZONE_RIGHT.y)
  return dLeft <= 2.5 || dRight <= 2.5
}

/** Старые левые раскладки (покраска/маникюр) — подменяем на центрированную */
function isOldLeftAlignedLayout(layout: Record<string, Position>): boolean {
  const logo = layout.logo
  const title = layout.title
  if (!logo || !title) return false
  if (isAtIntentionalLogoCornerSnap(logo)) return false
  return logo.x < 22 && title.x > 18 && title.x < 45
}

function loadLayout(
  storageKey: string,
  fallbackDefault?: Record<string, Position>,
  getRaw?: (storageKey: string) => string | null
): Record<string, Position> {
  const base = fallbackDefault ?? defaultLayout
  if (typeof window === 'undefined') return { ...base }
  try {
    const raw = getRaw ? getRaw(storageKey) : window.localStorage.getItem(storageKey)
    if (!raw) return { ...base }
    const parsed = JSON.parse(raw) as Record<string, Position>
    const merged = { ...base, ...parsed }
    if (merged.tagline0 && !merged.tagline) merged.tagline = merged.tagline0
    if (isOldLeftAlignedLayout(merged)) return { ...base }
    return merged
  } catch {
    return { ...base }
  }
}

function saveLayout(storageKey: string, layout: Record<string, Position>, headerTheme: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(layout))
  const branch = storageKey.endsWith('_mobile') ? 'mobile' : 'desktop'
  try {
    window.localStorage.setItem(`constructorLastHeaderLayoutBranch_${headerTheme}`, branch)
  } catch {
    /* ignore */
  }
}

/** Позиции блоков хедера: отдельно для узкого экрана / «Мобильный вид», чтобы не затирать веб-раскладку */
function resolveHeaderLayoutStorageKey(layoutStorageKey: string, useMobileBranch: boolean): string {
  return useMobileBranch ? `${layoutStorageKey}_mobile` : layoutStorageKey
}

/**
 * Узкий iframe превью сохраняет в *_mobile, полная вкладка может быть шире 640px — без подсказки подтянулась бы другая ветка.
 * Проп `headerLayoutBranch` из PublicPage (и ?headerLayoutBranch в URL) — та же ветка, что при последнем saveLayout.
 */
function effectiveMobileBranch(
  constructorMobilePreview: boolean,
  narrowFromViewport: boolean,
  branchProp: 'mobile' | 'desktop' | null | undefined
): boolean {
  if (branchProp === 'mobile') return true
  if (branchProp === 'desktop') return false
  if (typeof window !== 'undefined') {
    const p = new URLSearchParams(window.location.search).get('headerLayoutBranch')
    if (p === 'mobile') return true
    if (p === 'desktop') return false
  }
  return narrowFromViewport || constructorMobilePreview
}

function snapToGuides(value: number, others: number[] = []): number {
  return snapToGuidesWithThreshold(value, others, SNAP_THRESHOLD)
}

function snapToGuidesWithThreshold(value: number, others: number[], threshold: number): number {
  const candidates = [...SNAP_GUIDES, ...others]
  for (const g of candidates) {
    if (Math.abs(value - g) <= threshold) return g
  }
  return value
}

/** Горизонтальные направляющие «под логотипом» / «под названием» (только визуально, без прилипания) */
const TAGLINE_UNDER_LOGO_OFFSET = 6
const TAGLINE_UNDER_TITLE_OFFSET = 12

/** Точка привязки описания в углу (якорь без snap — только для режима отображения). */
const FIXED_TAGLINE_CORNER_POINT = { x: 2, y: 17 }

/** Притягивание к углу с отступом: если близко к углу — возвращаем (pad, pad) и т.д. */
function applyCornerSnap(x: number, y: number): { x: number; y: number } | null {
  if (x <= CORNER_ZONE && y <= CORNER_ZONE) return { x: CORNER_PADDING, y: CORNER_PADDING }
  if (x >= 100 - CORNER_ZONE && y <= CORNER_ZONE) return { x: 100 - CORNER_PADDING, y: CORNER_PADDING }
  if (x <= CORNER_ZONE && y >= 100 - CORNER_ZONE) return { x: CORNER_PADDING, y: 100 - CORNER_PADDING }
  if (x >= 100 - CORNER_ZONE && y >= 100 - CORNER_ZONE) return { x: 100 - CORNER_PADDING, y: 100 - CORNER_PADDING }
  return null
}

function dist(a: Position, b: Position) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Притягивание логотипа к зоне-точке в верхнем левом или правом углу (по диагонали отступ). */
function applyLogoZoneSnap(x: number, y: number): { x: number; y: number } | null {
  const p = { x, y }
  const dLeft = dist(p, LOGO_ZONE_LEFT)
  const dRight = dist(p, LOGO_ZONE_RIGHT)
  if (dLeft <= LOGO_ZONE_SNAP_RADIUS && dLeft <= dRight) return { ...LOGO_ZONE_LEFT }
  if (dRight <= LOGO_ZONE_SNAP_RADIUS) return { ...LOGO_ZONE_RIGHT }
  return null
}

function getCaretOffsetInElement(el: HTMLElement): number {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return 0
  const range = sel.getRangeAt(0)
  const pre = range.cloneRange()
  pre.selectNodeContents(el)
  pre.setEnd(range.startContainer, range.startOffset)
  return pre.toString().length
}

function setCaretPositionInElement(el: HTMLElement, offset: number): void {
  const sel = window.getSelection()
  if (!sel) return
  const range = document.createRange()
  let current = 0
  function walk(node: Node): boolean {
    if (node.nodeType === Node.TEXT_NODE) {
      const len = (node.textContent ?? '').length
      if (current + len >= offset) {
        range.setStart(node, Math.min(offset - current, len))
        range.setEnd(node, Math.min(offset - current, len))
        return true
      }
      current += len
    } else {
      for (let i = 0; i < node.childNodes.length; i++) {
        if (walk(node.childNodes[i])) return true
      }
    }
    return false
  }
  walk(el)
  sel.removeAllRanges()
  sel.addRange(range)
}

export interface DraggableHeaderHairProps {
  containerRef: React.RefObject<HTMLDivElement | null>
  publicName: string
  publicTagline: string
  publicHeaderPrimaryCta: string
  publicHeaderSecondaryCta: string
  publicLogo: string
  publicHeaderLogoVisible: boolean
  publicHeaderLogoShape: 'circle' | 'rounded' | 'square'
  headerTitleStyle: React.CSSProperties | undefined
  headerSubtitleStyle: React.CSSProperties | undefined
  headerPrimaryCustom: boolean
  headerSecondaryCustom: boolean
  barberPrimaryColor: { background: string; text: string; glow: string }
  barberSecondaryColor: { background: string; text: string; glow: string }
  publicHeaderPrimaryCtaShape: string
  publicHeaderSecondaryCtaShape: string
  getPrimaryIconClass: (s: string) => string
  onBookClick: () => void
  onMapClick: () => void
  bookLabel: string
  mapLabel: string
  publicExtraText?: string
  onDraftChange?: () => void
  onDragStart?: () => void
  onDragEnd?: () => void
  /** Ключ в localStorage для сохранения раскладки (разный для каждой темы) */
  layoutStorageKey?: string
  /** Начальная раскладка «как в шаблоне» — если в storage пусто, подставляется она */
  defaultLayout?: Record<string, Position>
  /** Тема хедера (hair, barber, …) — для точного совпадения размеров шрифта с шаблоном */
  headerTheme?: string
  /** Slug салона для ключей черновиков (draft_X_slug_theme), чтобы запоминание работало при возврате в тему */
  slug?: string
  /** Как в шаблоне PublicPage (hair): тот же расчёт размера заголовка по длине названия */
  hairTitleFontSizePx?: number
  /** Превью конструктора с ?mobileFrame=1 — как на телефоне, даже если matchMedia ведёт себя иначе */
  constructorMobilePreview?: boolean
  /** Полный просмотр без edit=1: раскладка из storage, без drag и правок текста */
  readOnly?: boolean
  /** Совпадает с ?headerLayoutBranch — какой ключ localStorage (*_v6 vs *_v6_mobile) читать при широкой вкладке */
  headerLayoutBranch?: 'mobile' | 'desktop' | null
  /** Превью массажа: тексты hero → massage_draft_<slot>_* */
  persistDraft?: (key: string, value: string) => void
  /** Превью массажа: раскладка drag → тот же ключ, что у салона, но в слоте массажа */
  heroLayoutStorage?: {
    read: (resolvedStorageKey: string) => string | null
    write: (resolvedStorageKey: string, json: string) => void
  }
  /** Язык сайта: тексты hero-кнопок пишутся в `draft_*_*_*_${lang}` (как в PublicPage.readPublic). */
  draftLocale?: PublicSiteLang
}

export default function DraggableHeaderHair({
  containerRef,
  publicName,
  publicTagline,
  publicHeaderPrimaryCta,
  publicHeaderSecondaryCta,
  publicLogo,
  publicHeaderLogoVisible,
  publicHeaderLogoShape,
  headerTitleStyle,
  headerSubtitleStyle,
  headerPrimaryCustom,
  headerSecondaryCustom,
  barberPrimaryColor,
  barberSecondaryColor,
  publicHeaderPrimaryCtaShape,
  publicHeaderSecondaryCtaShape,
  getPrimaryIconClass,
  onBookClick: _onBookClick,
  onMapClick: _onMapClick,
  bookLabel,
  mapLabel,
  publicExtraText = '',
  onDraftChange,
  onDragStart,
  onDragEnd,
  layoutStorageKey = 'draft_headerLayoutHair_v6',
  defaultLayout: defaultLayoutProp,
  headerTheme = 'hair',
  slug = typeof window !== 'undefined' ? window.localStorage.getItem('publicSlug') || 'salon' : 'salon',
  hairTitleFontSizePx: hairTitleFontSizePxProp,
  constructorMobilePreview = false,
  readOnly = false,
  headerLayoutBranch: headerLayoutBranchProp = null,
  persistDraft,
  heroLayoutStorage,
  draftLocale,
}: DraggableHeaderHairProps) {
  const saveDraft = useCallback(
    (key: string, value: string) => {
      if (typeof window === 'undefined') return
      if (persistDraft) {
        persistDraft(key, value)
        onDraftChange?.()
        return
      }
      const base = `draft_${key}_${slug}_${headerTheme}`
      const ctaLangKey =
        key === 'publicHeaderPrimaryCta' || key === 'publicHeaderSecondaryCta'
      const storageKey =
        draftLocale && ctaLangKey ? `${base}_${draftLocale}` : base
      const prev =
        draftLocale && ctaLangKey
          ? window.localStorage.getItem(storageKey) ??
            (draftLocale === 'ru' ? window.localStorage.getItem(base) : null)
          : window.localStorage.getItem(storageKey)
      if (prev === value) return
      window.localStorage.setItem(storageKey, value)
      if (draftLocale && ctaLangKey && draftLocale === 'ru') {
        window.localStorage.setItem(base, value)
      }
      window.localStorage.setItem(`constructorHasUserEdits_${headerTheme}`, '1')
      onDraftChange?.()
    },
    [onDraftChange, headerTheme, slug, persistDraft, draftLocale]
  )

  const readHeroLayoutRaw = useCallback(
    (sk: string) => {
      if (typeof window === 'undefined') return null
      if (heroLayoutStorage) return heroLayoutStorage.read(sk)
      return window.localStorage.getItem(sk)
    },
    [heroLayoutStorage]
  )
  const themeDefault = defaultLayoutProp ?? defaultLayout
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<Position | null>(null)
  const dragStartRef = useRef<{
    id: string
    startX: number
    startY: number
    layoutX: number
    layoutY: number
    pointerId: number
  } | null>(null)
  const pointerCaptureElRef = useRef<HTMLElement | null>(null)
  const dragCommittedRef = useRef(false)
  const titleBlockRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLTextAreaElement | null>(null)
  const taglineMeasureRef = useRef<HTMLSpanElement | null>(null)
  /** Обёртка описания — capture для перетаскивания после порога движения (клик по textarea остаётся для ввода) */
  const taglineDragWrapperRef = useRef<HTMLDivElement | null>(null)
  const taglinePendingCleanupRef = useRef<(() => void) | null>(null)
  const [taglineWidth, setTaglineWidth] = useState(120)
  const taglineBlurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [titleCharCount, setTitleCharCount] = useState(() => publicName.length)
  const titleEditableRef = useRef<HTMLHeadingElement>(null)
  const primaryCtaEditableRef = useRef<HTMLSpanElement>(null)
  const secondaryCtaEditableRef = useRef<HTMLSpanElement>(null)
  const [taglineCharCount, setTaglineCharCount] = useState(() => publicTagline.length)
  const [taglineFocused, setTaglineFocused] = useState(false)
  const [localTagline, setLocalTagline] = useState(publicTagline)
  const [narrowViewport, setNarrowViewport] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 639px)').matches ||
          new URLSearchParams(window.location.search).get('mobileFrame') === '1'
      : false
  )
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 639px)')
    const apply = () =>
      setNarrowViewport(mq.matches || new URLSearchParams(window.location.search).get('mobileFrame') === '1')
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  const narrowViewportEffective = effectiveMobileBranch(constructorMobilePreview, narrowViewport, headerLayoutBranchProp)
  const layoutStorageKeyResolved = useMemo(
    () => resolveHeaderLayoutStorageKey(layoutStorageKey, narrowViewportEffective),
    [layoutStorageKey, narrowViewportEffective]
  )
  const [layout, setLayout] = useState<Record<string, Position>>(() => {
    const initialNarrow =
      typeof window !== 'undefined'
        ? window.matchMedia('(max-width: 639px)').matches ||
          new URLSearchParams(window.location.search).get('mobileFrame') === '1'
        : false
    const initialMobile = effectiveMobileBranch(constructorMobilePreview, initialNarrow, headerLayoutBranchProp)
    return loadLayout(
      resolveHeaderLayoutStorageKey(layoutStorageKey, initialMobile),
      layoutFallbackForInit(headerTheme, defaultLayoutProp),
      (sk) =>
        heroLayoutStorage
          ? heroLayoutStorage.read(sk)
          : typeof window !== 'undefined'
            ? window.localStorage.getItem(sk)
            : null
    )
  })
  const layoutRef = useRef<Record<string, Position>>(layout)
  layoutRef.current = layout
  const prevLayoutBranchKeyRef = useRef<string | null>(null)
  useEffect(() => {
    if (prevLayoutBranchKeyRef.current === null) {
      prevLayoutBranchKeyRef.current = layoutStorageKeyResolved
      return
    }
    if (prevLayoutBranchKeyRef.current === layoutStorageKeyResolved) return
    prevLayoutBranchKeyRef.current = layoutStorageKeyResolved
    const next = loadLayout(
      layoutStorageKeyResolved,
      layoutFallbackForInit(headerTheme, defaultLayoutProp),
      readHeroLayoutRaw
    )
    layoutRef.current = next
    setLayout(next)
  }, [
    layoutStorageKeyResolved,
    headerTheme,
    headerLayoutBranchProp,
    readHeroLayoutRaw,
    defaultLayoutProp,
  ])

  useEffect(() => {
    setTitleCharCount(publicName.length)
  }, [publicName])

  /** Не рендерить {publicName} внутри contentEditable — при ре-рендерах React затирает DOM и ломает ввод. Синхрон только когда поле не в фокусе. */
  useLayoutEffect(() => {
    const el = titleEditableRef.current
    if (!el) return
    if (typeof document !== 'undefined' && document.activeElement === el) return
    if (el.innerText !== publicName) {
      el.textContent = publicName
    }
  }, [publicName])

  const primaryCtaSyncText = publicHeaderPrimaryCta || bookLabel
  const secondaryCtaSyncText = publicHeaderSecondaryCta || mapLabel

  /** Не вставлять текст кнопок как children у contentEditable — ре-рендеры React портят DOM (смешение языков/символов). */
  useLayoutEffect(() => {
    if (readOnly) return
    const el = primaryCtaEditableRef.current
    if (!el) return
    if (typeof document !== 'undefined' && document.activeElement === el) return
    if (el.innerText !== primaryCtaSyncText) {
      el.textContent = primaryCtaSyncText
    }
  }, [primaryCtaSyncText, readOnly])

  useLayoutEffect(() => {
    if (readOnly) return
    const el = secondaryCtaEditableRef.current
    if (!el) return
    if (typeof document !== 'undefined' && document.activeElement === el) return
    if (el.innerText !== secondaryCtaSyncText) {
      el.textContent = secondaryCtaSyncText
    }
  }, [secondaryCtaSyncText, readOnly])

  useEffect(() => {
    setTaglineCharCount(publicTagline.length)
  }, [publicTagline])
  useEffect(() => {
    if (!taglineFocused) setLocalTagline(publicTagline)
  }, [publicTagline, taglineFocused])
  useEffect(() => {
    const measure = () => {
      const span = taglineMeasureRef.current
      if (!span) return
      const w = span.offsetWidth
      const vw =
        typeof window !== 'undefined' ? Math.max(120, window.innerWidth - 32) : 1200
      setTaglineWidth(Math.max(120, Math.min(w + 40, 1200, vw)))
    }
    measure()
    if (typeof window === 'undefined') return
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [publicTagline, taglineCharCount])
  useEffect(() => {
    return () => {
      if (taglineBlurTimeoutRef.current) clearTimeout(taglineBlurTimeoutRef.current)
    }
  }, [])

  useEffect(() => {
    return () => {
      taglinePendingCleanupRef.current?.()
      taglinePendingCleanupRef.current = null
    }
  }, [])

  const DRAG_THRESHOLD_PX = 6

  const clearTaglinePending = useCallback(() => {
    taglinePendingCleanupRef.current?.()
    taglinePendingCleanupRef.current = null
  }, [])

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      const start = dragStartRef.current
      if (!start || e.pointerId !== start.pointerId || !containerRef.current) return
      if (!dragCommittedRef.current) {
        const distPx = Math.hypot(e.clientX - start.startX, e.clientY - start.startY)
        if (distPx < DRAG_THRESHOLD_PX) return
        dragCommittedRef.current = true
        if (start.id === 'title' || start.id === 'tagline') {
          ;(document.activeElement as HTMLElement)?.blur?.()
        }
      }
      const rect = containerRef.current.getBoundingClientRect()
      const w = rect.width
      const h = rect.height
      if (w === 0 || h === 0) return
      const deltaX = ((e.clientX - start.startX) / w) * 100
      const deltaY = ((e.clientY - start.startY) / h) * 100
      let newX = Math.max(0, Math.min(100, start.layoutX + deltaX))
      let newY = Math.max(0, Math.min(100, start.layoutY + deltaY))

      if (start.id === 'tagline') {
        /* Описание: свободно, без прилипания; сетка и пунктирные линии только подсказка */
      } else {
        const others = layoutRef.current
        const otherXs = (Object.keys(others) as (keyof typeof others)[])
          .filter((k) => k !== start.id)
          .map((k) => others[k].x)
        const otherYs = (Object.keys(others) as (keyof typeof others)[])
          .filter((k) => k !== start.id)
          .map((k) => others[k].y)

        let snapped = false
        if (start.id === 'logo') {
          const logoZone = applyLogoZoneSnap(newX, newY)
          if (logoZone) {
            newX = logoZone.x
            newY = logoZone.y
            snapped = true
          }
        }
        if (!snapped) {
          const corner = applyCornerSnap(newX, newY)
          if (corner) {
            newX = corner.x
            newY = corner.y
          } else {
            const snapThreshold = start.id === 'title' ? TITLE_SNAP_THRESHOLD : SNAP_THRESHOLD
            newX = snapToGuidesWithThreshold(newX, otherXs, snapThreshold)
            newY = snapToGuidesWithThreshold(newY, otherYs, snapThreshold)
          }
        }
      }

      setDragPos({ x: newX, y: newY })
      setLayout((prev) => {
        const next = { ...prev, [start.id]: { x: newX, y: newY } }
        layoutRef.current = next
        return next
      })
    },
    [containerRef]
  )

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      if (readOnly) return
      if (e.pointerType === 'mouse' && e.button !== 0) return
      const target = e.target as HTMLElement
      const isTaglineTextarea = id === 'tagline' && !!target.closest('textarea')

      const isTextBlock = id === 'title'
      if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
        if (!isTextBlock) return
      }

      /* Клик по textarea — ввод текста; сдвиг указателя (> порога) — перетаскивание блока */
      if (isTaglineTextarea) {
        clearTaglinePending()
        const startX = e.clientX
        const startY = e.clientY
        const pointerId = e.pointerId
        const pos = layoutRef.current.tagline ?? themeDefault.tagline
        const onMove = (ev: PointerEvent) => {
          if (ev.pointerId !== pointerId) return
          const dist = Math.hypot(ev.clientX - startX, ev.clientY - startY)
          if (dist < DRAG_THRESHOLD_PX) return
          clearTaglinePending()
          ev.preventDefault()
          ;(document.activeElement as HTMLElement)?.blur?.()
          dragCommittedRef.current = true
          dragStartRef.current = {
            id: 'tagline',
            startX,
            startY,
            layoutX: pos.x,
            layoutY: pos.y,
            pointerId,
          }
          const el = taglineDragWrapperRef.current
          try {
            if (el) {
              el.setPointerCapture(pointerId)
              pointerCaptureElRef.current = el
            }
          } catch {
            pointerCaptureElRef.current = null
          }
          onDragStart?.()
          handlePointerMove(ev)
          setDragging('tagline')
        }
        const onUp = (ev: PointerEvent) => {
          if (ev.pointerId !== pointerId) return
          clearTaglinePending()
        }
        window.addEventListener('pointermove', onMove)
        window.addEventListener('pointerup', onUp)
        window.addEventListener('pointercancel', onUp)
        taglinePendingCleanupRef.current = () => {
          window.removeEventListener('pointermove', onMove)
          window.removeEventListener('pointerup', onUp)
          window.removeEventListener('pointercancel', onUp)
        }
        return
      }

      e.preventDefault()
      dragCommittedRef.current = false
      const pos = layout[id] ?? themeDefault[id]
      dragStartRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        layoutX: pos.x,
        layoutY: pos.y,
        pointerId: e.pointerId,
      }
      const el = e.currentTarget as HTMLElement
      try {
        el.setPointerCapture(e.pointerId)
        pointerCaptureElRef.current = el
      } catch {
        pointerCaptureElRef.current = null
      }
      setDragging(id)
      setDragPos({ x: pos.x, y: pos.y })
      onDragStart?.()
    },
    [layout, onDragStart, themeDefault, handlePointerMove, clearTaglinePending, readOnly]
  )

  const enforceMaxLength = useCallback((maxLen: number) => (e: React.FormEvent<HTMLElement>) => {
    const el = e.currentTarget
    if (el.innerText.length <= maxLen) return
    const sel = window.getSelection()
    el.innerText = el.innerText.slice(0, maxLen)
    if (sel) {
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }, [])

  const handleTitleInput = useCallback((e: React.FormEvent<HTMLElement>) => {
    const el = e.currentTarget
    if (el.innerText.length > MAX_TITLE_LEN) {
      const sel = window.getSelection()
      el.innerText = el.innerText.slice(0, MAX_TITLE_LEN)
      if (sel) {
        const range = document.createRange()
        range.selectNodeContents(el)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
      }
    }
    setTitleCharCount(el.innerText.length)
  }, [])

  /** Enter даёт перенос строки (<br>), а не новый блок — чтобы заголовок был одной строкой или с ручными переносами */
  const handleTitleKeyDown = useCallback((e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    document.execCommand('insertLineBreak')
  }, [])

  const normalizeTagline = useCallback((text: string): string => {
    const singleBreaks = text.replace(/\r\n/g, '\n').replace(/\n+/g, '\n').trim()
    const lines = singleBreaks.split('\n').slice(0, MAX_TAGLINE_LINES)
    return lines.map((line) => line.slice(0, MAX_TAGLINE_CHARS_PER_LINE)).join('\n')
  }, [])

  const updateTaglineValue = useCallback((rawValue: string) => {
    if (rawValue === '') {
      saveDraft('publicTagline', '')
      setTaglineCharCount(0)
      return
    }
    const normalized = rawValue.replace(/\r\n|\r/g, '\n')
    const next = normalized
      .split('\n')
      .map((line) => line.slice(0, MAX_TAGLINE_CHARS_PER_LINE))
      .join('\n')
    saveDraft('publicTagline', next)
    setTaglineCharCount(next.length)
  }, [saveDraft])

  const titleFontSizePx = Math.max(20, Math.min(56, 96 - titleCharCount * 1.5))
  /** Как в шаблоне PublicPage: размер с родителя при переданном hairTitleFontSizePx; иначе локальный по длине */
  const titleFontSizePxResolved =
    typeof hairTitleFontSizePxProp === 'number' ? hairTitleFontSizePxProp : titleFontSizePx
  const taglineLineHeight = 1.35
  const taglineSizeClass = isOrdinaryDraggableHeaderTheme(headerTheme)
    ? 'text-base sm:text-lg md:text-2xl leading-[1.35]'
    : 'text-base sm:text-lg md:text-2xl'
  const titleClassName = cn(
    'font-semibold tracking-[0.08em] drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent rounded px-1 min-w-[2ch] inline-block max-w-full text-center',
    !headerTitleStyle?.color && 'text-white',
    isOrdinaryDraggableHeaderTheme(headerTheme) && 'whitespace-pre-wrap break-words salon-hair-mobile-title',
    headerTheme === 'barber'
      ? 'font-barber-title'
      : headerTheme === 'cosmetology'
        ? 'font-cosmetology-title'
        : headerTheme === 'coloring'
          ? 'font-coloring-title'
          : headerTheme === 'manicure'
            ? 'font-manicure-title'
            : 'font-serif'
  )
  const buttonTextClass = 'text-base sm:text-lg md:text-xl'
  const buttonSizeClass = cn(
    'h-14 sm:h-16 md:h-[4.5rem] px-8 sm:px-12 md:px-14',
    isOrdinaryDraggableHeaderTheme(headerTheme) && 'max-sm:w-full max-sm:min-h-[3.25rem] max-sm:justify-center'
  )

  const focusEditableAndMoveCaretToEnd = useCallback((el: HTMLElement | null | undefined) => {
    if (!el) return
    el.focus()
    const sel = window.getSelection()
    if (sel) {
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      sel.removeAllRanges()
      sel.addRange(range)
    }
  }, [])

  const handlePointerUp = useCallback((e?: PointerEvent) => {
    const start = dragStartRef.current
    if (start && e && e.pointerId !== start.pointerId) return
    if (start) {
      if (e && pointerCaptureElRef.current) {
        try {
          pointerCaptureElRef.current.releasePointerCapture(e.pointerId)
        } catch {
          /* noop */
        }
        pointerCaptureElRef.current = null
      }
      if (dragCommittedRef.current) {
        if (heroLayoutStorage) {
          heroLayoutStorage.write(layoutStorageKeyResolved, JSON.stringify(layoutRef.current))
        } else {
          saveLayout(layoutStorageKeyResolved, layoutRef.current, headerTheme)
        }
        if (typeof window !== 'undefined' && !heroLayoutStorage) {
          window.localStorage.setItem(`constructorHasUserEdits_${headerTheme}`, '1')
        }
        onDraftChange?.()
      } else if (start.id === 'title') {
        focusEditableAndMoveCaretToEnd(titleBlockRef.current?.querySelector<HTMLElement>('[contenteditable="true"]'))
      } else if (start.id === 'tagline') {
        taglineRef.current?.focus()
      }
      dragStartRef.current = null
    }
    dragCommittedRef.current = false
    setDragging(null)
    setDragPos(null)
    onDragEnd?.()
  }, [
    layoutStorageKeyResolved,
    focusEditableAndMoveCaretToEnd,
    onDragEnd,
    onDraftChange,
    headerTheme,
    heroLayoutStorage,
  ])

  useEffect(() => {
    if (!dragging) return
    const onMove = (ev: PointerEvent) => handlePointerMove(ev)
    const onUp = (ev: PointerEvent) => handlePointerUp(ev)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
    }
  }, [dragging, handlePointerMove, handlePointerUp])

  const pos = (id: string) => dragging && dragStartRef.current?.id === id ? dragPos! : (layout[id] ?? themeDefault[id])

  const otherPositions = dragging
    ? (Object.keys(layout) as (keyof typeof layout)[]).filter((k) => k !== dragging).map((k) => layout[k])
    : []

  const logoGuidePos = layout.logo ?? themeDefault.logo
  const titleGuidePos = layout.title ?? themeDefault.title

  const taglinePos = pos('tagline')
  const isTaglineAtCorner =
    Math.abs(taglinePos.x - FIXED_TAGLINE_CORNER_POINT.x) < 1 &&
    Math.abs(taglinePos.y - FIXED_TAGLINE_CORNER_POINT.y) < 1
  const displayTagline = taglineFocused ? localTagline : publicTagline

  /** Мобильный режим: якорь описания по верхней кромке — длинный текст не «съедается» вверх как при translate(-50%,-50%). */
  const hairMobileTaglineTopAnchor =
    isOrdinaryDraggableHeaderTheme(headerTheme) && narrowViewportEffective && !isTaglineAtCorner

  return (
    <div
      className={cn(
        'absolute inset-0 z-20 pointer-events-none',
        isOrdinaryDraggableHeaderTheme(headerTheme) && 'salon-hair-draggable-root',
        isOrdinaryDraggableHeaderTheme(headerTheme) && narrowViewportEffective && 'salon-hair-mobile-edit-flow'
      )}
    >
      {/* Сетка при любом перетаскивании; у описания — те же линии + пунктир «под логотипом» / «под названием» (без прилипания) */}
      {dragging && !taglineFocused && !readOnly && (
        <>
          {/* Точки привязки логотипа — только на широком экране; на мобильном в редакторе не показываем */}
          {dragging !== 'tagline' && !narrowViewportEffective && (
            <>
              <div
                className="absolute w-2.5 h-2.5 rounded-full border border-primary/60 bg-primary/20"
                style={{ left: `${LOGO_ZONE_LEFT.x}%`, top: `${LOGO_ZONE_LEFT.y}%`, transform: 'translate(-50%, -50%)' }}
                aria-hidden
              />
              <div
                className="absolute w-2.5 h-2.5 rounded-full border border-primary/60 bg-primary/20"
                style={{ left: `${LOGO_ZONE_RIGHT.x}%`, top: `${LOGO_ZONE_RIGHT.y}%`, transform: 'translate(-50%, -50%)' }}
                aria-hidden
              />
            </>
          )}
          {dragging === 'tagline' && publicLogo && publicHeaderLogoVisible && (
            <div
              className="absolute left-0 right-0 pointer-events-none z-[11] border-t border-dashed border-amber-300/85"
              style={{ top: `${logoGuidePos.y + TAGLINE_UNDER_LOGO_OFFSET}%` }}
              aria-hidden
            />
          )}
          {dragging === 'tagline' && (
            <div
              className="absolute left-0 right-0 pointer-events-none z-[11] border-t border-dashed border-sky-300/85"
              style={{ top: `${titleGuidePos.y + TAGLINE_UNDER_TITLE_OFFSET}%` }}
              aria-hidden
            />
          )}
          {[...SNAP_GUIDES, ...otherPositions.map((p) => p.x)].filter((v, i, a) => a.indexOf(v) === i).map((g) => (
            <div
              key={`v-${g}`}
              className="absolute top-0 bottom-0 w-px bg-primary/60 pointer-events-none z-10"
              style={{ left: `${g}%` }}
            />
          ))}
          {[...SNAP_GUIDES, ...otherPositions.map((p) => p.y)].filter((v, i, a) => a.indexOf(v) === i).map((g) => (
            <div
              key={`h-${g}`}
              className="absolute left-0 right-0 h-px bg-primary/60 pointer-events-none z-10"
              style={{ top: `${g}%` }}
            />
          ))}
        </>
      )}
      {/* Draggable elements - pointer-events-auto on the wrapper so they receive events */}
      <div className="absolute inset-0 pointer-events-auto">
        {publicLogo && publicHeaderLogoVisible && (
          <div
            className={cn('absolute', !readOnly && 'cursor-grab active:cursor-grabbing touch-none select-none')}
            style={{
              left: `${pos('logo').x}%`,
              top: `${pos('logo').y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onPointerDown={readOnly ? undefined : (e) => handlePointerDown(e, 'logo')}
          >
            <div
              className={cn(
                'h-28 w-28 overflow-hidden border border-white/30 bg-white/10',
                publicHeaderLogoShape === 'circle' ? 'rounded-full' : publicHeaderLogoShape === 'rounded' ? 'rounded-xl' : 'rounded-none'
              )}
            >
              <img src={publicLogo} alt="Logo" className="h-full w-full object-cover pointer-events-none" />
            </div>
          </div>
        )}
        <div
          ref={titleBlockRef}
          className={cn(
            'absolute max-w-[90%] w-max min-w-0',
            !readOnly && 'cursor-grab active:cursor-grabbing touch-none',
            isOrdinaryDraggableHeaderTheme(headerTheme) && 'salon-hair-title-block'
          )}
          style={{
            left: `${pos('title').x}%`,
            top: `${pos('title').y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onPointerDown={readOnly ? undefined : (e) => handlePointerDown(e, 'title')}
        >
          <h1
            ref={titleEditableRef}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            className={titleClassName}
            style={{ ...headerTitleStyle, fontSize: `${titleFontSizePxResolved}px` }}
            onInput={readOnly ? undefined : handleTitleInput}
            onKeyDown={readOnly ? undefined : handleTitleKeyDown}
            onBlur={readOnly ? undefined : (e) => saveDraft('publicName', e.currentTarget.innerText.trim())}
          />
        </div>
        {/* Та же разметка, что в редактировании: textarea + ручка; в полном просмотре — readOnly и без drag */}
        <div
          ref={taglineDragWrapperRef}
          className={cn(
            'absolute pointer-events-auto max-w-[min(100%,calc(100vw-1.5rem))] min-w-0 box-border overflow-x-hidden',
            !readOnly && 'cursor-grab active:cursor-grabbing',
            dragging === 'tagline' && 'select-none',
            isOrdinaryDraggableHeaderTheme(headerTheme) && 'salon-hair-tagline-wrap',
            hairMobileTaglineTopAnchor && 'salon-hair-tagline-wrap--top-anchor'
          )}
          style={{
            left: `${taglinePos.x}%`,
            top: `${taglinePos.y}%`,
            transform: isTaglineAtCorner
              ? 'translate(0, 0)'
              : hairMobileTaglineTopAnchor
                ? 'translate(-50%, 0)'
                : 'translate(-50%, -50%)',
            ...(narrowViewportEffective ? { touchAction: 'none' as const } : {}),
          }}
          onPointerDownCapture={readOnly ? undefined : (e) => handlePointerDown(e, 'tagline')}
        >
          {/* Ручка перетаскивания описания — только в режиме редактирования; в «Полный размер» с моб. вёрсткой не показываем */}
          {narrowViewportEffective && !readOnly && (
            <div
              className="mb-1.5 flex h-9 w-full shrink-0 cursor-grab touch-none select-none items-center justify-center rounded-md border border-white/30 bg-white/10 text-white/70 shadow-sm active:cursor-grabbing"
              aria-label="Переместить блок описания"
            >
              <GripVertical className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
          )}
          <span
            ref={taglineMeasureRef}
            aria-hidden
            className={cn('invisible absolute whitespace-nowrap pointer-events-none', taglineSizeClass)}
            style={{
              ...headerSubtitleStyle,
              lineHeight: taglineLineHeight,
              padding: '2px 4px',
              textAlign: 'center',
            }}
          >
            {(displayTagline.split(/\r?\n/).reduce((a, b) => (a.length >= b.length ? a : b), '') || '\u00A0')}
          </span>
          <textarea
            ref={taglineRef}
            readOnly={readOnly}
            tabIndex={readOnly ? -1 : undefined}
            wrap={isOrdinaryDraggableHeaderTheme(headerTheme) && narrowViewportEffective ? 'soft' : 'off'}
            rows={Math.max(
              1,
              isOrdinaryDraggableHeaderTheme(headerTheme) && narrowViewportEffective
                ? Math.max(2, Math.min(14, (displayTagline.match(/\n/g)?.length ?? 0) + 2))
                : (displayTagline.match(/\n/g)?.length ?? 0) + 1
            )}
            placeholder="Введите текст (Shift+Enter — новая строка)"
            className={cn(
              'block max-w-full overflow-x-hidden overflow-y-auto rounded border-0 bg-transparent py-0.5 outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0 min-w-0 min-h-[1.5em] scrollbar-hide break-words [overflow-wrap:anywhere]',
              !headerSubtitleStyle?.color && 'text-white/80 placeholder:text-white/40',
              headerSubtitleStyle?.color && 'placeholder:text-muted-foreground/60',
              isOrdinaryDraggableHeaderTheme(headerTheme) && narrowViewportEffective ? 'resize-y' : 'resize-none',
              readOnly && 'cursor-default resize-none focus:ring-0',
              isOrdinaryDraggableHeaderTheme(headerTheme) &&
                cn(
                  'salon-hair-hero-tagline salon-hair-tagline-field',
                  !narrowViewportEffective && 'mt-3 sm:mt-4'
                ),
              taglineSizeClass,
              isTaglineAtCorner ? 'pl-0 pr-1' : 'px-1'
            )}
            style={{
              ...headerSubtitleStyle,
              lineHeight: taglineLineHeight,
              minHeight: `calc(1em * ${taglineLineHeight})`,
              ...(isOrdinaryDraggableHeaderTheme(headerTheme) && narrowViewportEffective
                ? { width: '100%', maxWidth: '100%', boxSizing: 'border-box', touchAction: readOnly ? undefined : ('pan-y' as const) }
                : {
                    width: `${taglineWidth}px`,
                    maxWidth: 'min(100%, calc(100vw - 1.5rem))',
                    boxSizing: 'border-box',
                  }),
              textAlign: isTaglineAtCorner ? 'left' : 'center',
            }}
            value={readOnly ? publicTagline : taglineFocused ? localTagline : publicTagline}
            onChange={
              readOnly
                ? undefined
                : (e) => {
                    const v = (e.target as HTMLTextAreaElement).value
                    setLocalTagline(v)
                    updateTaglineValue(v)
                  }
            }
            onFocus={
              readOnly
                ? undefined
                : () => {
                    setTaglineFocused(true)
                    const ta = taglineRef.current
                    if (ta) {
                      const len = ta.value.length
                      setTimeout(() => ta.setSelectionRange(len, len), 0)
                    }
                  }
            }
            onBlur={readOnly ? undefined : () => setTaglineFocused(false)}
            onKeyDown={
              readOnly
                ? undefined
                : (e) => {
                    if (e.key !== 'Enter') return
                    if (e.shiftKey) {
                      e.preventDefault()
                      const ta = e.target as HTMLTextAreaElement
                      const start = ta.selectionStart
                      const end = ta.selectionEnd
                      const currentValue = ta.value
                      const newVal = currentValue.slice(0, start) + '\n' + currentValue.slice(end)
                      setLocalTagline(newVal)
                      updateTaglineValue(newVal)
                      setTimeout(() => {
                        taglineRef.current?.setSelectionRange(start + 1, start + 1)
                      }, 0)
                    } else {
                      e.preventDefault()
                    }
                  }
            }
          />
        </div>
        <div
          className={cn(
            'absolute touch-none select-none',
            !readOnly && 'cursor-grab active:cursor-grabbing',
            isOrdinaryDraggableHeaderTheme(headerTheme) && 'salon-hair-edit-cta salon-hair-edit-cta-primary'
          )}
          style={{
            left: `${pos('primaryCta').x}%`,
            top: `${pos('primaryCta').y}%`,
            transform: 'translate(-50%, -50%)',
            ...(isOrdinaryDraggableHeaderTheme(headerTheme) && narrowViewportEffective ? {} : { marginRight: '2rem' }),
          }}
          onPointerDown={readOnly ? undefined : (e) => handlePointerDown(e, 'primaryCta')}
        >
          <Button
            type="button"
            className={cn(
              publicHeaderPrimaryCtaShape === 'round' ? 'rounded-full overflow-hidden' : 'rounded-none',
              buttonSizeClass,
              buttonTextClass,
              'border backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] inline-flex items-center gap-2',
              isOrdinaryDraggableHeaderTheme(headerTheme) && 'w-full sm:w-auto'
            )}
            style={
              headerPrimaryCustom
                ? (() => {
                    const isGrad = typeof barberPrimaryColor.background === 'string' && barberPrimaryColor.background.includes('gradient')
                    const border = 'borderColor' in barberPrimaryColor ? barberPrimaryColor.borderColor : barberPrimaryColor.background
                    return isGrad
                      ? { background: barberPrimaryColor.background, color: barberPrimaryColor.text, boxShadow: barberPrimaryColor.glow, borderColor: border }
                      : { backgroundColor: barberPrimaryColor.background, color: barberPrimaryColor.text, boxShadow: barberPrimaryColor.glow, borderColor: barberPrimaryColor.background }
                  })()
                : undefined
            }
            onClick={readOnly ? (e) => { e.stopPropagation(); _onBookClick() } : undefined}
          >
            <img src={bookingIcon} alt="" className={cn('h-5 w-5 opacity-80 shrink-0', getPrimaryIconClass('brightness-0 invert'))} />
            {readOnly ? (
              <span className={cn('outline-none rounded px-1 min-w-[2ch]', 'cursor-default')}>{primaryCtaSyncText}</span>
            ) : (
              <span
                ref={primaryCtaEditableRef}
                contentEditable
                suppressContentEditableWarning
                className={cn('outline-none rounded px-1 min-w-[2ch]', 'focus:ring-2 focus:ring-white/50')}
                onInput={enforceMaxLength(MAX_BUTTON_LEN)}
                onBlur={(e) => saveDraft('publicHeaderPrimaryCta', e.currentTarget.innerText.trim())}
              />
            )}
          </Button>
        </div>
        <div
          className={cn(
            'absolute touch-none select-none',
            !readOnly && 'cursor-grab active:cursor-grabbing',
            isOrdinaryDraggableHeaderTheme(headerTheme) && 'salon-hair-edit-cta salon-hair-edit-cta-secondary'
          )}
          style={{
            left: `${pos('secondaryCta').x}%`,
            top: `${pos('secondaryCta').y}%`,
            transform: 'translate(-50%, -50%)',
            ...(isOrdinaryDraggableHeaderTheme(headerTheme) && narrowViewportEffective ? {} : { marginLeft: '2rem' }),
          }}
          onPointerDown={readOnly ? undefined : (e) => handlePointerDown(e, 'secondaryCta')}
        >
          <Button
            type="button"
            variant="outline"
            className={cn(
              publicHeaderSecondaryCtaShape === 'round' ? 'rounded-full overflow-hidden' : 'rounded-none',
              buttonSizeClass,
              buttonTextClass,
              'backdrop-blur-xl inline-flex items-center gap-2',
              isOrdinaryDraggableHeaderTheme(headerTheme) && 'w-full sm:w-auto'
            )}
            style={{
              ...(headerSecondaryCustom
                ? (() => {
                    const isGrad = typeof barberSecondaryColor.background === 'string' && barberSecondaryColor.background.includes('gradient')
                    const border = 'borderColor' in barberSecondaryColor ? barberSecondaryColor.borderColor : barberSecondaryColor.background
                    return isGrad
                      ? {
                          background: barberSecondaryColor.background,
                          backgroundColor: 'transparent',
                          color: barberSecondaryColor.text,
                          boxShadow: barberSecondaryColor.glow,
                          borderColor: border,
                        }
                      : { backgroundColor: barberSecondaryColor.background, color: barberSecondaryColor.text, boxShadow: barberSecondaryColor.glow, borderColor: barberSecondaryColor.background }
                  })()
                : {}),
              ...(publicHeaderSecondaryCtaShape === 'round' ? { borderRadius: '9999px' } : {}),
            }}
            onClick={readOnly ? (e) => { e.stopPropagation(); _onMapClick() } : undefined}
          >
            <MapPin className="h-8 w-8 shrink-0" style={{ color: headerSecondaryCustom ? barberSecondaryColor.text : 'rgba(255,255,255,0.8)' }} />
            {readOnly ? (
              <span className={cn('outline-none rounded px-1 min-w-[2ch]', 'cursor-default')}>{secondaryCtaSyncText}</span>
            ) : (
              <span
                ref={secondaryCtaEditableRef}
                contentEditable
                suppressContentEditableWarning
                className={cn('outline-none rounded px-1 min-w-[2ch]', 'focus:ring-2 focus:ring-white/50')}
                onInput={enforceMaxLength(MAX_BUTTON_LEN)}
                onBlur={(e) => saveDraft('publicHeaderSecondaryCta', e.currentTarget.innerText.trim())}
              />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
