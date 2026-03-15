import { useState, useRef, useCallback, useEffect } from 'react'
import { MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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

/** Старые левые раскладки (покраска/маникюр) — подменяем на центрированную */
function isOldLeftAlignedLayout(layout: Record<string, Position>): boolean {
  const logo = layout.logo
  const title = layout.title
  if (!logo || !title) return false
  return logo.x < 22 && title.x > 18 && title.x < 45
}

function loadLayout(
  storageKey: string,
  fallbackDefault?: Record<string, Position>
): Record<string, Position> {
  const base = fallbackDefault ?? defaultLayout
  if (typeof window === 'undefined') return { ...base }
  try {
    const raw = window.localStorage.getItem(storageKey)
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

function saveLayout(storageKey: string, layout: Record<string, Position>) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(storageKey, JSON.stringify(layout))
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

/** Привязка описания: под логотип, под название, центр по вертикали/горизонтали */
const TAGLINE_SNAP_THRESHOLD = 5
/** Смещение Y вниз от центра логотипа/названия до линии «под элементом» (в %) */
const TAGLINE_UNDER_LOGO_OFFSET = 6
/** Отступ описания вниз от названия при прилипании «под заголовком» (только это прилипание остаётся) */
const TAGLINE_UNDER_TITLE_OFFSET = 12
/** Радиус (в %) от точки «под названием»: при отпускании прилипает только если описание в этом радиусе, иначе остаётся где положили */
const TAGLINE_UNDER_TITLE_SNAP_RADIUS = 5
/** Половина ширины логотипа в % — для привязки «под начало логотипа» (левый край) */
const LOGO_HALF_WIDTH_PERCENT = 5
/** Точка под логотипом: смещение Y вниз от линии «под логотипом» */
const TAGLINE_CORNER_POINT_Y_EXTRA = 3

/** Точка привязки описания в углу. К ней прилипает первая буква первой строки. */
const FIXED_TAGLINE_CORNER_POINT = { x: 2, y: 17 }
/** Радиус прилипания к угловой точке (в %) — большой, чтобы точка уверенно срабатывала */
const TAGLINE_CORNER_SNAP_RADIUS = 12

function snapToNearest(value: number, candidates: number[], threshold: number): number {
  for (const g of candidates) {
    if (Math.abs(value - g) <= threshold) return g
  }
  return value
}

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
}: DraggableHeaderHairProps) {
  const saveDraft = useCallback(
    (key: string, value: string) => {
      if (typeof window === 'undefined') return
      const storageKey = `draft_${key}_${slug}_${headerTheme}`
      const prev = window.localStorage.getItem(storageKey)
      if (prev === value) return
      window.localStorage.setItem(storageKey, value)
      window.localStorage.setItem(`constructorHasUserEdits_${headerTheme}`, '1')
      onDraftChange?.()
    },
    [onDraftChange, headerTheme, slug]
  )
  const themeDefault = defaultLayoutProp ?? defaultLayout
  const [layout, setLayout] = useState<Record<string, Position>>(() =>
    loadLayout(layoutStorageKey, themeDefault)
  )
  const layoutRef = useRef<Record<string, Position>>(layout)
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragPos, setDragPos] = useState<Position | null>(null)
  const dragStartRef = useRef<{ id: string; startX: number; startY: number; layoutX: number; layoutY: number } | null>(null)
  const dragCommittedRef = useRef(false)
  const titleBlockRef = useRef<HTMLDivElement>(null)
  const taglineRef = useRef<HTMLTextAreaElement | null>(null)
  const taglineMeasureRef = useRef<HTMLSpanElement | null>(null)
  const [taglineWidth, setTaglineWidth] = useState(120)
  const taglineBlurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [titleCharCount, setTitleCharCount] = useState(() => publicName.length)
  const [taglineCharCount, setTaglineCharCount] = useState(() => publicTagline.length)
  const [taglineFocused, setTaglineFocused] = useState(false)
  const [localTagline, setLocalTagline] = useState(publicTagline)
  layoutRef.current = layout

  useEffect(() => {
    setTitleCharCount(publicName.length)
  }, [publicName])
  useEffect(() => {
    setTaglineCharCount(publicTagline.length)
  }, [publicTagline])
  useEffect(() => {
    if (!taglineFocused) setLocalTagline(publicTagline)
  }, [publicTagline, taglineFocused])
  useEffect(() => {
    const span = taglineMeasureRef.current
    if (!span) return
    const w = span.offsetWidth
    setTaglineWidth(Math.max(120, Math.min(w + 40, 1200)))
  }, [publicTagline, taglineCharCount])
  useEffect(() => {
    return () => {
      if (taglineBlurTimeoutRef.current) clearTimeout(taglineBlurTimeoutRef.current)
    }
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, id: string) => {
      const target = e.target as HTMLElement
      const isTextBlock = id === 'title'
      if (target.isContentEditable || target.closest('[contenteditable="true"]')) {
        if (!isTextBlock) return
      }
      e.preventDefault()
      dragCommittedRef.current = false
      const pos = layout[id] ?? themeDefault[id]
      dragStartRef.current = { id, startX: e.clientX, startY: e.clientY, layoutX: pos.x, layoutY: pos.y }
      setDragging(id)
      setDragPos({ x: pos.x, y: pos.y })
      onDragStart?.()
    },
    [layout, onDragStart]
  )

  const DRAG_THRESHOLD_PX = 6

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const start = dragStartRef.current
      if (!start || !containerRef.current) return
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
        /* Описание перемещается свободно, без прилипания при драге; прилипание только при отпускании под названием */
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
  const taglineLineHeight = 1.35
  const taglineSizeClass = 'text-base sm:text-lg md:text-2xl'
  const titleClassName = cn(
    'font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-nowrap outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-transparent rounded px-1 min-w-[2ch]',
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
  const buttonSizeClass = 'h-14 sm:h-16 md:h-[4.5rem] px-8 sm:px-12 md:px-14'

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

  const handleMouseUp = useCallback(() => {
    const start = dragStartRef.current
    if (start) {
      if (dragCommittedRef.current) {
        if (start.id === 'tagline') {
          const layout = layoutRef.current
          const titlePos = layout.title ?? themeDefault.title
          const taglinePos = layout.tagline
          const underTitleY = titlePos.y + TAGLINE_UNDER_TITLE_OFFSET
          const snapTarget = { x: titlePos.x, y: underTitleY }
          const dist = taglinePos
            ? Math.hypot(taglinePos.x - snapTarget.x, taglinePos.y - snapTarget.y)
            : Infinity
          if (taglinePos && dist <= TAGLINE_UNDER_TITLE_SNAP_RADIUS) {
            const snapped = { ...layout, tagline: { x: snapTarget.x, y: snapTarget.y } }
            layoutRef.current = snapped
            setLayout(snapped)
            saveLayout(layoutStorageKey, snapped)
          } else {
            saveLayout(layoutStorageKey, layout)
          }
        } else {
          saveLayout(layoutStorageKey, layoutRef.current)
        }
        if (typeof window !== 'undefined') {
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
  }, [layoutStorageKey, themeDefault, focusEditableAndMoveCaretToEnd, onDragEnd, onDraftChange])

  useEffect(() => {
    if (!dragging) return
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [dragging, handleMouseMove, handleMouseUp])

  const pos = (id: string) => dragging && dragStartRef.current?.id === id ? dragPos! : (layout[id] ?? themeDefault[id])

  const otherPositions = dragging
    ? (Object.keys(layout) as (keyof typeof layout)[]).filter((k) => k !== dragging).map((k) => layout[k])
    : []

  /* У описания свободное перемещение, направляющие не показываем; прилипание только при отпускании под названием */
  const taglineSnapGuides = null

  const taglinePos = pos('tagline')
  const isTaglineAtCorner =
    Math.abs(taglinePos.x - FIXED_TAGLINE_CORNER_POINT.x) < 1 &&
    Math.abs(taglinePos.y - FIXED_TAGLINE_CORNER_POINT.y) < 1
  const displayTagline = taglineFocused ? localTagline : publicTagline

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Сетка для описания: под логотип, под название, центр */}
      {taglineSnapGuides && (
        <>
          {taglineSnapGuides.x.map((g) => (
            <div
              key={`tagline-v-${g}`}
              className="absolute top-0 bottom-0 w-px bg-primary/50 pointer-events-none z-10"
              style={{ left: `${g}%` }}
            />
          ))}
          {taglineSnapGuides.y.map((g) => (
            <div
              key={`tagline-h-${g}`}
              className="absolute left-0 right-0 h-px bg-primary/50 pointer-events-none z-10"
              style={{ top: `${g}%` }}
            />
          ))}
          {/* Точка под логотипом в углу — сюда прилипает описание (прибита) */}
          {taglineSnapGuides.cornerPoint && (
            <div
              className="absolute w-3 h-3 rounded-full border-2 border-primary bg-primary/30 pointer-events-none z-10"
              style={{
                left: `${taglineSnapGuides.cornerPoint.x}%`,
                top: `${taglineSnapGuides.cornerPoint.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              aria-hidden
            />
          )}
        </>
      )}
      {/* Сетка и точки — только при перетаскивании других элементов */}
      {dragging && !taglineFocused && dragging !== 'tagline' && (
        <>
          {/* Точки для логотипа: в углу с отступом по диагонали вниз, в том же стиле что и сетка */}
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
          {/* Линии привязки: 0, 25, 50, 75, 100% + центры других элементов */}
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
            className="absolute cursor-grab active:cursor-grabbing select-none"
            style={{
              left: `${pos('logo').x}%`,
              top: `${pos('logo').y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseDown={(e) => handleMouseDown(e, 'logo')}
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
          className="absolute cursor-grab active:cursor-grabbing max-w-[90%]"
          style={{
            left: `${pos('title').x}%`,
            top: `${pos('title').y}%`,
            transform: 'translate(-50%, -50%)',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'title')}
        >
          <h1
            contentEditable
            suppressContentEditableWarning
            className={titleClassName}
            style={{ ...headerTitleStyle, fontSize: `${titleFontSizePx}px` }}
            onInput={handleTitleInput}
            onBlur={(e) => saveDraft('publicName', e.currentTarget.innerText.trim())}
          >
            {publicName}
          </h1>
        </div>
        <div
          className={cn(
            'absolute cursor-grab active:cursor-grabbing overflow-visible pointer-events-auto',
            dragging === 'tagline' && 'select-none'
          )}
          style={{
            left: `${taglinePos.x}%`,
            top: `${taglinePos.y}%`,
            transform: isTaglineAtCorner ? 'translate(0, 0)' : 'translate(-50%, -50%)',
          }}
          onMouseDownCapture={(e) => handleMouseDown(e, 'tagline')}
        >
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
            wrap="off"
            rows={Math.max(1, (displayTagline.match(/\n/g)?.length ?? 0) + 1)}
            placeholder="Введите текст (Shift+Enter — новая строка)"
            className={cn(
              'block resize-none overflow-x-auto overflow-y-auto rounded border-0 bg-transparent py-0.5 text-white/80 placeholder:text-white/40 outline-none focus:ring-2 focus:ring-white/40 focus:ring-offset-0 min-w-[120px] max-w-[90vw] [scrollbar-width:none] [ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
              taglineSizeClass,
              isTaglineAtCorner ? 'pl-0 pr-1' : 'px-1'
            )}
            style={{
              ...headerSubtitleStyle,
              lineHeight: taglineLineHeight,
              minHeight: `calc(1em * ${taglineLineHeight})`,
              width: `${taglineWidth}px`,
              textAlign: isTaglineAtCorner ? 'left' : 'center',
            }}
            value={taglineFocused ? localTagline : publicTagline}
            onChange={(e) => {
              const v = (e.target as HTMLTextAreaElement).value
              setLocalTagline(v)
              updateTaglineValue(v)
            }}
            onFocus={() => {
              setTaglineFocused(true)
              const ta = taglineRef.current
              if (ta) {
                const len = ta.value.length
                setTimeout(() => ta.setSelectionRange(len, len), 0)
              }
            }}
            onBlur={() => setTaglineFocused(false)}
            onKeyDown={(e) => {
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
            }}
          />
        </div>
        <div
          className="absolute cursor-grab active:cursor-grabbing select-none"
          style={{
            left: `${pos('primaryCta').x}%`,
            top: `${pos('primaryCta').y}%`,
            transform: 'translate(-50%, -50%)',
            marginRight: '2rem',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'primaryCta')}
        >
          <Button
            className={cn(
              publicHeaderPrimaryCtaShape === 'round' ? 'rounded-full overflow-hidden' : 'rounded-none',
              buttonSizeClass,
              buttonTextClass,
              'border backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] inline-flex items-center gap-2'
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
          >
            <img src={bookingIcon} alt="" className={cn('h-5 w-5 opacity-80 shrink-0', getPrimaryIconClass('brightness-0 invert'))} />
            <span
              contentEditable
              suppressContentEditableWarning
              className="outline-none focus:ring-2 focus:ring-white/50 rounded px-1 min-w-[2ch]"
              onInput={enforceMaxLength(MAX_BUTTON_LEN)}
              onBlur={(e) => saveDraft('publicHeaderPrimaryCta', e.currentTarget.innerText.trim())}
            >
              {publicHeaderPrimaryCta || bookLabel}
            </span>
          </Button>
        </div>
        <div
          className="absolute cursor-grab active:cursor-grabbing select-none"
          style={{
            left: `${pos('secondaryCta').x}%`,
            top: `${pos('secondaryCta').y}%`,
            transform: 'translate(-50%, -50%)',
            marginLeft: '2rem',
          }}
          onMouseDown={(e) => handleMouseDown(e, 'secondaryCta')}
        >
          <Button
            variant="outline"
            className={cn(
              publicHeaderSecondaryCtaShape === 'round' ? 'rounded-full overflow-hidden' : 'rounded-none',
              buttonSizeClass,
              buttonTextClass,
              'backdrop-blur-xl inline-flex items-center gap-2'
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
          >
            <MapPin className="h-8 w-8 shrink-0" style={{ color: headerSecondaryCustom ? barberSecondaryColor.text : 'rgba(255,255,255,0.8)' }} />
            <span
              contentEditable
              suppressContentEditableWarning
              className="outline-none focus:ring-2 focus:ring-white/50 rounded px-1 min-w-[2ch]"
              onInput={enforceMaxLength(MAX_BUTTON_LEN)}
              onBlur={(e) => saveDraft('publicHeaderSecondaryCta', e.currentTarget.innerText.trim())}
            >
              {publicHeaderSecondaryCta || mapLabel}
            </span>
          </Button>
        </div>
      </div>
    </div>
  )
}
