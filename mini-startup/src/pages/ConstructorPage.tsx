import { useState, useRef, useEffect, useCallback, Component, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'

/** Показывает сообщение об ошибке вместо белого экрана при падении конструктора */
class ConstructorErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ConstructorErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
          <h2 className="text-lg font-semibold text-destructive">Ошибка в конструкторе</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md text-center">
            {this.state.error.message}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">Откройте консоль (F12) для подробностей.</p>
        </div>
      )
    }
    return this.props.children
  }
}
import { PanelRightOpen, Save, ArrowLeft, Maximize2, X, ChevronLeft, Pencil, RotateCcw, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { flushDraftsToPublic } from '@/lib/constructor-save'
import { cn } from '@/lib/utils'
import iconHairCutting from '@/assets/images/constructor-images/free-icon-hair-cutting-4614189.png'
import iconBarbershop from '@/assets/images/constructor-images/free-icon-barbershop-856572.png'
import iconFacial from '@/assets/images/constructor-images/free-icon-facial-5732044.png'
import iconHairstyle from '@/assets/images/constructor-images/free-icon-hairstyle-6174671.png'
import iconNailsPolish from '@/assets/images/constructor-images/free-icon-nails-polish-8167686.png'
import iconPremium1 from '@/assets/images/constructor-images/free-icon-premium-4907289.png'
import iconPremium2 from '@/assets/images/constructor-images/free-icon-premium-2302704.png'
import patternBg from '@/assets/images/seamless-pattern-of-hairdressing-elements-illustration-of-doodle-icons-background-wallpaper-the-concept-of-a-hairdressing-salon-and-a-beauty-salon-vector.jpg'
import manicurePattern from '@/assets/images/constructor-images/manicure-tools-seamless-pattern-for-nail-studio-or-spa-salon-beauty-routine-background-vector.jpg'
import manicurePatternAlt from '@/assets/images/constructor-images/manicure-tools-doodle-seamless-pattern-manicure-scissors-gel-polish-woman-hands-white-background_646079-2612.avif'
import worksCarousel1 from '@/assets/images/constructor-images/c612ebeea6a9ada45aba6c8d7c5db8e9.jpeg'
import worksCarousel2 from '@/assets/images/constructor-images/ew_HairSociety_Eclat_7-1000x1000.jpg'
import worksCarousel3 from '@/assets/images/constructor-images/1704.jpg'
import aboutSalon1 from '@/assets/images/constructor-images/pexels-cottonbro-3993118.jpg'
import aboutSalon2 from '@/assets/images/constructor-images/pexels-cottonbro-3993293.jpg'
import aboutSalon3 from '@/assets/images/constructor-images/pexels-cottonbro-3993308.jpg'
import {
  HAIR_THEME_DEFAULT_NAME,
  HAIR_THEME_DEFAULT_TAGLINE,
  HAIR_THEME_DEFAULT_BOOKING_TITLE,
  HAIR_THEME_DEFAULT_BOOKING_SUBTITLE,
  DEFAULT_LOGO_URL,
  FOOTER_DEFAULT_NAME,
  FOOTER_DEFAULT_ADDRESS,
} from '@/lib/hair-theme-defaults'

/** Дефолтные фото для слотов 1–3 карусели «Галерея работ» — отображаются в сайдбаре и в превью, пока не заданы свои */
const WORKS_CAROUSEL_DEFAULTS = [worksCarousel1, worksCarousel2, worksCarousel3]
/** Дефолтные фото для блока «О салоне» (премиум-шаблон) — слоты 1–3 по умолчанию */
const ABOUT_SALON_DEFAULTS = [aboutSalon1, aboutSalon2, aboutSalon3]

/** Сжимает изображение для логотипа, чтобы влезало в localStorage и отображалось (в т.ч. большие картинки из ChatGPT) */
function compressImageForLogo(dataUrl: string, onDone: (dataUrl: string) => void): void {
  const MAX_LENGTH = 450000
  if (dataUrl.length <= MAX_LENGTH) {
    onDone(dataUrl)
    return
  }
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.onload = () => {
    const max = 800
    let w = img.width
    let h = img.height
    if (w > max || h > max) {
      if (w > h) {
        h = Math.round((h * max) / w)
        w = max
      } else {
        w = Math.round((w * max) / h)
        h = max
      }
    }
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      onDone(dataUrl)
      return
    }
    ctx.drawImage(img, 0, 0, w, h)
    let result = canvas.toDataURL('image/png')
    if (result.length > MAX_LENGTH) result = canvas.toDataURL('image/jpeg', 0.88)
    onDone(result)
  }
  img.onerror = () => onDone(dataUrl)
  img.src = dataUrl
}

const BODY_BACKGROUND_OPTIONS = [
  { id: 'bg-1', type: 'image' as const, url: patternBg },
  { id: 'bg-2', type: 'image' as const, url: manicurePattern },
  { id: 'bg-3', type: 'image' as const, url: manicurePatternAlt },
  { id: 'bg-4', type: 'color' as const, color: '#0b0b0b' },
  { id: 'bg-5', type: 'color' as const, color: '#e8e4df' },
]

const HEADER_LAYOUT_HAIR_KEY = 'draft_headerLayoutHair_v6'
const HEADER_HAIR_PADDING_KEY = 'draft_headerHairPadding'
const HEADER_HAIR_CUSTOMIZED_KEY = 'draft_headerHairCustomized'
/** Ключи раскладки хедера по темам (drag-and-drop) — для сброса при «Вернуть изначальный дизайн» */
const HEADER_LAYOUT_KEY_BY_THEME: Record<string, string> = {
  hair: HEADER_LAYOUT_HAIR_KEY,
  barber: 'draft_headerLayoutBarber_v6',
  cosmetology: 'draft_headerLayoutCosmetology_v6',
  coloring: 'draft_headerLayoutColoring_v6',
  manicure: 'draft_headerLayoutManicure_v6',
}
/** Флаг по теме: пользователь вносил правки в эту тему — показываем «Мой сайт» и не сбрасываем при переключении */
const CONSTRUCTOR_HAS_USER_EDITS_PREFIX = 'constructorHasUserEdits_'

/** Нормализованный id темы (без premium-) для ключей storage */
function themeStorageId(themeId: string | null): string {
  if (!themeId) return 'hair'
  return themeId.startsWith('premium-') ? themeId.replace('premium-', '') : themeId
}

/** Есть ли сохранённые правки у данной темы (для отображения на карточке темы) */
function themeHasEdits(themeId: string): boolean {
  if (typeof window === 'undefined') return false
  const slug = window.localStorage.getItem('publicSlug') || 'salon'
  const tid = themeStorageId(themeId)
  if (window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid) === '1') return true
  if (window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + tid) === '1') return true
  const suffix = `_${slug}_${tid}`
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k && k.startsWith('draft_') && k !== 'draft_publicHeaderTheme' && k.endsWith(suffix)) return true
  }
  const layoutKey = HEADER_LAYOUT_KEY_BY_THEME[tid]
  if (layoutKey && window.localStorage.getItem(layoutKey)) return true
  return false
}

/** Удалить все черновики и флаг правок только для одной темы; при переданном slug — только черновики этого салона */
function clearThemeDrafts(themeId: string, slug?: string): void {
  if (typeof window === 'undefined') return
  const id = themeStorageId(themeId)
  const suffix = slug ? `_${slug}_${id}` : `_${id}`
  const keysToRemove: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k && (k.endsWith(suffix) || (!slug && k === CONSTRUCTOR_HAS_USER_EDITS_PREFIX + id))) keysToRemove.push(k)
  }
  if (slug) {
    keysToRemove.push(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + id)
    keysToRemove.push(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + id)
  }
  keysToRemove.forEach((k) => window.localStorage.removeItem(k))
  const layoutKey = HEADER_LAYOUT_KEY_BY_THEME[id]
  if (layoutKey) window.localStorage.removeItem(layoutKey)
  if (id === 'hair') {
    window.localStorage.removeItem(HEADER_LAYOUT_HAIR_KEY)
    window.localStorage.removeItem(HEADER_HAIR_PADDING_KEY)
    window.localStorage.removeItem(HEADER_HAIR_CUSTOMIZED_KEY)
  }
}

/** Базовые шаблоны (v1) — зафиксированы, структура не меняется. См. src/lib/template-registry.ts */
const ORDINARY_THEMES = [
  { id: 'hair', label: 'Парикмахерская', icon: iconHairCutting },
  { id: 'barber', label: 'Барбершоп', icon: iconBarbershop },
  { id: 'cosmetology', label: 'Косметология', icon: iconFacial },
  { id: 'coloring', label: 'Покраска волос', icon: iconHairstyle },
  { id: 'manicure', label: 'Маникюр', icon: iconNailsPolish },
] as const

/** Премиум-шаблоны: текущие 2 с той же структурой; далее — 2 новых сайта с другой структурой. */
const PREMIUM_THEMES = [
  { id: 'premium-hair', label: 'Парикмахерская', icon: iconPremium2 },
  { id: 'premium-barber', label: 'Барбершоп', icon: iconPremium1 },
] as const

/** Блоки базовой структуры (зафиксированы для обычных шаблонов). Премиум-сайты с другой структурой — отдельно. */
const BLOCKS = [
  { id: 'header', label: 'Шапка сайта' },
  { id: 'gallery', label: 'Фотографии салона' },
  { id: 'booking', label: 'Запись клиентов' },
  { id: 'works', label: 'Галерея работ' },
  { id: 'map', label: 'Карта и адрес' },
  { id: 'footer', label: 'Контактная информация' },
]

/** Цвета текста — тот же порядок и те же id, что и у кнопок */
const HEADER_TEXT_OPTIONS = [
  { id: 'gold', label: 'Золото', color: '#F6C453', glow: '0 0 14px rgba(246,196,83,0.55)' },
  { id: 'blue', label: 'Синий', color: '#3b82f6', glow: '0 0 14px rgba(59,130,246,0.55)' },
  { id: 'red', label: 'Красный', color: '#ef4444', glow: '0 0 14px rgba(239,68,68,0.55)' },
  { id: 'pink', label: 'Розовый', color: '#FF4D9D', glow: '0 0 16px rgba(255,77,157,0.6)' },
  { id: 'coral', label: 'Корал', color: '#FDA4AF', glow: '0 0 16px rgba(253,164,175,0.6)' },
  { id: 'violet', label: 'Виолет', color: '#C7B7FF', glow: '0 0 16px rgba(199,183,255,0.6)' },
  { id: 'orange', label: 'Оранжевый', color: '#f97316', glow: '0 0 14px rgba(249,115,22,0.55)' },
  { id: 'lime', label: 'Лайм', color: '#84cc16', glow: '0 0 14px rgba(132,204,22,0.55)' },
  { id: 'emerald', label: 'Изумруд', color: '#4ADE80', glow: '0 0 16px rgba(74,222,128,0.55)' },
  { id: 'white', label: 'Белый', color: '#FFFFFF', glow: '0 0 14px rgba(255,255,255,0.55)' },
  { id: 'indigo', label: 'Индиго', color: '#6366f1', glow: '0 0 14px rgba(99,102,241,0.55)' },
  { id: 'gray', label: 'Серый', color: '#6b7280', glow: '0 0 14px rgba(107,114,128,0.55)' },
  { id: 'brown', label: 'Коричневый', color: '#92400e', glow: '0 0 14px rgba(146,64,14,0.55)' },
  { id: 'black', label: 'Черный', color: '#0b0b0b', glow: '0 0 14px rgba(0,0,0,0.55)' },
] as const

/** Палитра «Цвет хедера» для премиум-шаблона: те же цвета + яркие, с эффектом свечения */
const PREMIUM_HEADER_COLOR_OPTIONS = [
  ...HEADER_TEXT_OPTIONS,
  { id: 'cyan', label: 'Бирюза', color: '#22d3ee', glow: '0 0 14px rgba(34,211,238,0.55)' },
  { id: 'yellow', label: 'Жёлтый', color: '#eab308', glow: '0 0 14px rgba(234,179,8,0.55)' },
  { id: 'magenta', label: 'Пурпур', color: '#d946ef', glow: '0 0 14px rgba(217,70,239,0.55)' },
  { id: 'teal', label: 'Бирюзовый', color: '#2dd4bf', glow: '0 0 14px rgba(45,212,191,0.55)' },
  { id: 'sky', label: 'Небесный', color: '#0ea5e9', glow: '0 0 14px rgba(14,165,233,0.55)' },
  { id: 'amber', label: 'Янтарный', color: '#f59e0b', glow: '0 0 14px rgba(245,158,11,0.55)' },
  { id: 'fuchsia', label: 'Фуксия', color: '#c026d3', glow: '0 0 14px rgba(192,38,211,0.55)' },
  { id: 'mint', label: 'Мятный', color: '#99f6e4', glow: '0 0 14px rgba(153,246,228,0.55)' },
]

/** Цвета кнопок — тот же порядок и те же id, что и у текста */
const HEADER_BUTTON_OPTIONS = [
  { id: 'gold', label: 'Золото', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
  { id: 'blue', label: 'Синий', background: '#3b82f6', text: '#ffffff', glow: '0 0 20px rgba(59,130,246,0.6)' },
  { id: 'red', label: 'Красный', background: '#ef4444', text: '#ffffff', glow: '0 0 18px rgba(239,68,68,0.6)' },
  { id: 'pink', label: 'Розовый', background: '#FF4D9D', text: '#0b0b0b', glow: '0 0 20px rgba(255,77,157,0.55)' },
  { id: 'coral', label: 'Корал', background: '#FB7185', text: '#0b0b0b', glow: '0 0 18px rgba(251,113,133,0.6)' },
  { id: 'violet', label: 'Виолет', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 18px rgba(167,139,250,0.6)' },
  { id: 'orange', label: 'Оранжевый', background: '#f97316', text: '#0b0b0b', glow: '0 0 18px rgba(249,115,22,0.6)' },
  { id: 'lime', label: 'Лайм', background: '#84cc16', text: '#0b0b0b', glow: '0 0 18px rgba(132,204,22,0.55)' },
  { id: 'emerald', label: 'Изумруд', background: '#4ADE80', text: '#0b0b0b', glow: '0 0 18px rgba(74,222,128,0.55)' },
  { id: 'white', label: 'Белый', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
  { id: 'indigo', label: 'Индиго', background: '#6366f1', text: '#ffffff', glow: '0 0 18px rgba(99,102,241,0.6)' },
  { id: 'gray', label: 'Серый', background: '#6b7280', text: '#ffffff', glow: '0 0 18px rgba(107,114,128,0.6)' },
  { id: 'brown', label: 'Коричневый', background: '#92400e', text: '#ffffff', glow: '0 0 18px rgba(146,64,14,0.6)' },
  { id: 'black', label: 'Черный', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
] as const

/** Цвета кнопок для темы «Косметология» — палитра в тонах розового/матового */
const HEADER_BUTTON_OPTIONS_COSMETOLOGY = [
  { id: 'rose', label: 'Роза', background: '#E8B4B8', text: '#1a0f12', glow: '0 0 20px rgba(232,180,184,0.55)' },
  { id: 'mauve', label: 'Бордо', background: '#B76E79', text: '#ffffff', glow: '0 0 20px rgba(183,110,121,0.55)' },
  { id: 'pink', label: 'Розовый', background: '#FF4D9D', text: '#0b0b0b', glow: '0 0 20px rgba(255,77,157,0.55)' },
  { id: 'gold', label: 'Золото', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
  { id: 'blue', label: 'Синий', background: '#3b82f6', text: '#ffffff', glow: '0 0 20px rgba(59,130,246,0.6)' },
  { id: 'white', label: 'Белый', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
  { id: 'violet', label: 'Виолет', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 18px rgba(167,139,250,0.6)' },
  { id: 'black', label: 'Черный', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
] as const

/** Цвета кнопок для темы «Покраска волос» — фиолетовый/фуксия/медный */
const HEADER_BUTTON_OPTIONS_COLORING = [
  { id: 'violet', label: 'Фиолет', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 20px rgba(167,139,250,0.6)' },
  { id: 'fuchsia', label: 'Фуксия', background: '#D946EF', text: '#ffffff', glow: '0 0 20px rgba(217,70,239,0.55)' },
  { id: 'purple', label: 'Пурпур', background: '#7C3AED', text: '#ffffff', glow: '0 0 20px rgba(124,58,237,0.55)' },
  { id: 'copper', label: 'Медь', background: '#B87333', text: '#1a0f0a', glow: '0 0 20px rgba(184,115,51,0.55)' },
  { id: 'pink', label: 'Розовый', background: '#EC4899', text: '#ffffff', glow: '0 0 20px rgba(236,72,153,0.55)' },
  { id: 'gold', label: 'Золото', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
  { id: 'white', label: 'Белый', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
  { id: 'black', label: 'Черный', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
] as const

/** Цвета кнопок для темы «Маникюр» — нежно-розовый, румянец, корал, розовое золото */
const HEADER_BUTTON_OPTIONS_MANICURE = [
  { id: 'blush', label: 'Румянец', background: '#F8B4C4', text: '#2d1519', glow: '0 0 20px rgba(248,180,196,0.55)' },
  { id: 'rose', label: 'Роза', background: '#E8A0B0', text: '#1a0f12', glow: '0 0 20px rgba(232,160,176,0.55)' },
  { id: 'coral', label: 'Корал', background: '#F4A6B4', text: '#1a0f12', glow: '0 0 20px rgba(244,166,180,0.55)' },
  { id: 'pink', label: 'Розовый', background: '#EC4899', text: '#ffffff', glow: '0 0 20px rgba(236,72,153,0.55)' },
  { id: 'gold', label: 'Золото', background: '#E8C9A0', text: '#1a1510', glow: '0 0 20px rgba(232,201,160,0.55)' },
  { id: 'white', label: 'Белый', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
  { id: 'violet', label: 'Виолет', background: '#C4B5FD', text: '#1a1525', glow: '0 0 20px rgba(196,181,253,0.55)' },
  { id: 'black', label: 'Черный', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
] as const

export default function ConstructorPage() {
  const navigate = useNavigate()
  const [sideOpen, setSideOpen] = useState(true)
  const [saved, setSaved] = useState(false)
  const [panelStage, setPanelStage] = useState<'themes' | 'edit'>('themes')
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null)
  const [, setRestoreTick] = useState(0)
  const [, setStoragePoll] = useState(0)
  const [undoStack, setUndoStack] = useState<{ key: string; value: string | null; themeId?: string }[]>([])
  const MAX_UNDO = 50
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)
  const [addressQuery, setAddressQuery] = useState(() => {
    if (typeof window === 'undefined') return ''
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    const theme =
      window.localStorage.getItem('draft_publicHeaderTheme') ??
      window.localStorage.getItem('publicHeaderTheme') ??
      'hair'
    const themeForKey = theme
    return (
      window.localStorage.getItem(`draft_publicAddress_${slug}_${themeForKey}`) ??
      window.localStorage.getItem(`draft_publicAddress_${themeForKey}`) ??
      window.localStorage.getItem('draft_publicAddress') ??
      window.localStorage.getItem('publicAddress') ??
      ''
    )
  })
  const [addressResults, setAddressResults] = useState<any[]>([])
  const [isAddressOpen, setIsAddressOpen] = useState(false)
  const [isAddressLoading, setIsAddressLoading] = useState(false)
  const [isAddressFocused, setIsAddressFocused] = useState(false)
  const addressRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (panelStage !== 'edit') return
    const id = setInterval(() => setStoragePoll((n) => n + 1), 800)
    return () => clearInterval(id)
  }, [panelStage])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'publicPageSectionInView' && typeof e.data?.sectionId === 'string') {
        setVisibleSectionId(e.data.sectionId)
      }
      if (e.data?.type === 'constructorEditsChanged') {
        setStoragePoll((n) => n + 1)
      }
      if (e.data?.type === 'constructorUndoPush' && typeof e.data?.key === 'string') {
        setUndoStack((prev) => {
          const themeId = typeof e.data?.themeId === 'string' ? e.data.themeId : undefined
          const next = [...prev, { key: e.data.key, value: e.data.value ?? null, themeId }]
          return next.slice(-MAX_UNDO)
        })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // При смене темы подставлять в поле адреса черновик этой темы (или пусто — нейтральный placeholder)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const themeId =
      selectedThemeId ??
      window.localStorage.getItem('draft_publicHeaderTheme') ??
      window.localStorage.getItem('publicHeaderTheme') ??
      'hair'
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    const addr = window.localStorage.getItem(`draft_publicAddress_${slug}_${themeId}`) ?? ''
    setAddressQuery(addr)
  }, [selectedThemeId, panelStage])

  const getDraftOrPublic = useCallback(
    (key: string, fallback = '') => {
      if (typeof window === 'undefined') return fallback
      if (key === 'publicHeaderTheme')
        return (
          window.localStorage.getItem('draft_publicHeaderTheme') ??
          window.localStorage.getItem('publicHeaderTheme') ??
          fallback
        )
      const slug = window.localStorage.getItem('publicSlug') || 'salon'
      const themeId =
        selectedThemeId ??
        window.localStorage.getItem('draft_publicHeaderTheme') ??
        window.localStorage.getItem('publicHeaderTheme') ??
        'hair'
      const tid = themeStorageId(themeId)
      const addressMapKeys = ['publicFooterAddress', 'publicAddress', 'publicMapEmbedUrl']
      const themeForKey = addressMapKeys.includes(key) ? themeId : tid
      return (
        window.localStorage.getItem(`draft_${key}_${slug}_${themeForKey}`) ?? fallback
      )
    },
    [selectedThemeId]
  )

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node
      if (addressRef.current && !addressRef.current.contains(target)) {
        setIsAddressOpen(false)
        setIsAddressFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!isAddressFocused) return
    const query = addressQuery.trim()
    if (!query || query.length < 3) {
      setAddressResults([])
      setIsAddressLoading(false)
      return
    }

    setIsAddressLoading(true)
    const handle = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=ru&q=${encodeURIComponent(
            query
          )}`
        )
        const data = await response.json()
        const items = Array.isArray(data) ? data : []
        setAddressResults(items)
        setIsAddressOpen(true)
      } catch (error) {
        console.error('Address search failed:', error)
        setAddressResults([])
      } finally {
        setIsAddressLoading(false)
      }
    }, 350)

    return () => clearTimeout(handle)
  }, [addressQuery, isAddressFocused])

  const currentHeaderTheme = getDraftOrPublic('publicHeaderTheme') || 'hair'

  useEffect(() => {
    if (selectedBlockId == null || panelStage !== 'edit') return
    const isPremium = currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber'
    const sectionId = isPremium && selectedBlockId === 'booking' ? 'gallery' : isPremium && selectedBlockId === 'works' ? 'services' : selectedBlockId
    try {
      iframeRef.current?.contentWindow?.postMessage?.({ type: 'scrollToSection', sectionId }, '*')
    } catch {
      // ignore
    }
  }, [selectedBlockId, panelStage, currentHeaderTheme])

  /** Ключ хранилища цветов хедера: для косметологии, покраски и маникюра — отдельные, чтобы цвета применялись к хедеру темы */
  const headerColorsStorageKey =
    currentHeaderTheme === 'cosmetology'
      ? 'publicHeaderCosmetologyColors'
      : currentHeaderTheme === 'coloring'
        ? 'publicHeaderColoringColors'
        : currentHeaderTheme === 'manicure'
          ? 'publicHeaderManicureColors'
          : 'publicHeaderBarberColors'
  const headerButtonOptionsList =
    currentHeaderTheme === 'cosmetology'
      ? HEADER_BUTTON_OPTIONS_COSMETOLOGY
      : currentHeaderTheme === 'coloring'
        ? HEADER_BUTTON_OPTIONS_COLORING
        : currentHeaderTheme === 'manicure'
          ? HEADER_BUTTON_OPTIONS_MANICURE
          : HEADER_BUTTON_OPTIONS
  /** Есть ли правки у выбранной темы: флаг или реальные черновики — блок «Мой сайт» показываем только для этой темы */
  const currentThemeHasEdits =
    typeof window !== 'undefined' &&
    !!selectedThemeId &&
    (() => {
      const slug = window.localStorage.getItem('publicSlug') || 'salon'
      const tid = themeStorageId(selectedThemeId)
      if (window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid) === '1') return true
      if (window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + tid) === '1') return true
      const suffix = `_${slug}_${tid}`
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i)
        if (k && k.startsWith('draft_') && k !== 'draft_publicHeaderTheme' && k.endsWith(suffix)) return true
      }
      return false
    })()
  const hasHeaderDesignOverride =
    typeof window !== 'undefined' &&
    (!!localStorage.getItem(HEADER_LAYOUT_HAIR_KEY) ||
      !!localStorage.getItem(HEADER_HAIR_PADDING_KEY))

  /** Сбрасывает правки только для одной темы (шаблон темы не меняется). */
  const loadThemeDefaults = useCallback((themeId: string) => {
    if (typeof window === 'undefined') return
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    const valueToStore = themeStorageId(themeId)
    clearThemeDrafts(valueToStore, slug)
    if (valueToStore === 'hair') {
      window.localStorage.setItem(`draft_publicName_${slug}_hair`, FOOTER_DEFAULT_NAME)
      window.localStorage.setItem(`draft_publicTagline_${slug}_hair`, HAIR_THEME_DEFAULT_TAGLINE)
      window.localStorage.setItem(`draft_publicBookingTitle_${slug}_hair`, HAIR_THEME_DEFAULT_BOOKING_TITLE)
      window.localStorage.setItem(`draft_publicBookingSubtitle_${slug}_hair`, HAIR_THEME_DEFAULT_BOOKING_SUBTITLE)
    }
  }, [])

  const handleRestoreInitialHeader = useCallback(() => {
    if (typeof window === 'undefined') return
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    setUndoStack([])
    clearThemeDrafts('hair', slug)
    localStorage.setItem(`draft_publicName_${slug}_hair`, FOOTER_DEFAULT_NAME)
    localStorage.setItem(`draft_publicTagline_${slug}_hair`, HAIR_THEME_DEFAULT_TAGLINE)
    localStorage.setItem(`draft_publicBookingTitle_${slug}_hair`, HAIR_THEME_DEFAULT_BOOKING_TITLE)
    localStorage.setItem(`draft_publicBookingSubtitle_${slug}_hair`, HAIR_THEME_DEFAULT_BOOKING_SUBTITLE)
    setRestoreTick((t) => t + 1)
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // ignore
    }
  }, [])

  const notifyIframeDraft = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'constructorDraftChange' }, '*')
    } catch {
      // ignore
    }
  }, [])

  const setDraft = useCallback(
    (key: string, value: string) => {
      if (typeof window === 'undefined') return
      const slug = window.localStorage.getItem('publicSlug') || 'salon'
      const themeId =
        selectedThemeId ??
        window.localStorage.getItem('draft_publicHeaderTheme') ??
        'hair'
      const tid = themeStorageId(themeId)
      // Адрес и карта для премиум-шаблонов — по полному id темы, чтобы не переходить на другие шаблоны
      const addressMapKeys = ['publicFooterAddress', 'publicAddress', 'publicMapEmbedUrl']
      const themeForKey = addressMapKeys.includes(key) ? themeId : tid
      const storageKey =
        key === 'publicHeaderTheme' ? `draft_${key}` : `draft_${key}_${slug}_${themeForKey}`
      const prev =
        window.localStorage.getItem(storageKey) ??
        (key === 'publicHeaderTheme' ? null : window.localStorage.getItem(key))
      setUndoStack((prevStack) => {
        const next = [...prevStack, { key, value: prev, themeId: themeForKey }]
        return next.slice(-MAX_UNDO)
      })
      window.localStorage.setItem(storageKey, value)
      if (key !== 'publicHeaderTheme')
        window.localStorage.setItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid, '1')
      setStoragePoll((n) => n + 1)
      notifyIframeDraft()
    },
    [notifyIframeDraft, selectedThemeId]
  )

  const handleUndo = useCallback(() => {
    if (typeof window === 'undefined') return
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    setUndoStack((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      const storageKey =
        last.key === 'publicHeaderTheme' || !last.themeId
          ? `draft_${last.key}`
          : `draft_${last.key}_${slug}_${last.themeId}`
      if (last.value === null || last.value === undefined) {
        window.localStorage.removeItem(storageKey)
      } else {
        window.localStorage.setItem(storageKey, last.value)
      }
      setStoragePoll((n) => n + 1)
      notifyIframeDraft()
      return prev.slice(0, -1)
    })
  }, [notifyIframeDraft])

  const handleSave = () => {
    flushDraftsToPublic()
    setUndoStack([])
    setSaved(true)
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // cross-origin or not loaded
    }
    setTimeout(() => setSaved(false), 2000)
  }

  const slug = typeof window !== 'undefined' ? (localStorage.getItem('publicSlug') || 'salon') : 'salon'
  const previewUrl = panelStage === 'edit' ? `/b/${slug}?preview=1&edit=1` : `/b/${slug}?preview=1`
  /** В полном размере — без режима редактирования (без рамок и полосок), с последними изменениями из localStorage (full=1 чтобы подставлялись черновики, не дефолт) */
  const openFullSize = () => {
    const fullViewUrl = `/b/${slug}?preview=1&full=1&_=${Date.now()}`
    window.open(fullViewUrl, '_blank', 'noopener,noreferrer')
  }

  /** Только переключить тему в превью, не сбрасывая правки (чтобы «Мой сайт» / последние правки сохранялись). Сохраняем полный id (premium-hair и т.д.), чтобы PublicPage показывал премиум-шаблон. */
  const selectTheme = (themeId: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('draft_publicHeaderTheme', themeId)
    setSelectedThemeId(themeId)
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // ignore
    }
  }

  const goToEdit = () => {
    if (selectedThemeId && typeof window !== 'undefined') {
      window.localStorage.setItem('draft_publicHeaderTheme', selectedThemeId)
    }
    setSelectedBlockId(null)
    setPanelStage('edit')
  }

  const goBackToThemes = () => {
    setPanelStage('themes')
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // При открытии конструктора подставляем текущую тему из настроек
  useEffect(() => {
    if (typeof window === 'undefined') return
    const theme =
      window.localStorage.getItem('draft_publicHeaderTheme') ||
      window.localStorage.getItem('publicHeaderTheme') ||
      'hair'
    setSelectedThemeId(theme)
  }, [])


  const handleClearMySiteClick = useCallback(() => {
    setShowClearConfirmModal(true)
  }, [])

  const handleClearMySiteConfirm = useCallback(() => {
    if (typeof window === 'undefined') return
    setShowClearConfirmModal(false)
    const themeId = selectedThemeId || currentHeaderTheme || 'hair'
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    const tid = themeStorageId(themeId)
    clearThemeDrafts(tid, slug)
    window.localStorage.removeItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid)
    window.localStorage.removeItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + tid)
    flushSync(() => {
      setAddressQuery('')
      setUndoStack([])
      setStoragePoll((n) => n + 1)
    })
    notifyIframeDraft()
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // ignore
    }
  }, [selectedThemeId, currentHeaderTheme, notifyIframeDraft])

  const handleClearMySite = handleClearMySiteClick

  /** На экране «Все блоки» — вернуть изначальный дизайн только этой темы */
  const handleRestoreInitialDesign = useCallback(() => {
    if (typeof window === 'undefined') return
    if (currentHeaderTheme === 'hair') {
      handleRestoreInitialHeader()
      setAddressQuery('')
      notifyIframeDraft()
      return
    }
    loadThemeDefaults(currentHeaderTheme)
    setAddressQuery('')
    setUndoStack([])
    setStoragePoll((n) => n + 1)
    notifyIframeDraft()
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // ignore
    }
  }, [currentHeaderTheme, loadThemeDefaults, handleRestoreInitialHeader, notifyIframeDraft])

  return (
    <ConstructorErrorBoundary>
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Модальное окно подтверждения «Стереть» */}
      {showClearConfirmModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowClearConfirmModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
          <Card
            className="relative z-[101] w-full max-w-md backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowClearConfirmModal(false)}
                className="absolute top-4 right-4 h-8 w-8"
                aria-label="Закрыть"
              >
                <X className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-bold pr-10 mb-3 text-foreground">
                Удалить изменения?
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                Вы точно хотите удалить последние изменения в этом шаблоне?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirmModal(false)}
                >
                  Назад
                </Button>
                <Button
                  onClick={handleClearMySiteConfirm}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Да
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Шапка конструктора */}
      <header className="border-b border-border/50 bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/60 shrink-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/settings')}
              className="shrink-0"
              aria-label="Назад"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate">Конструктор сайта</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={openFullSize}>
              <Maximize2 className="h-4 w-4" />
              Полный размер
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {saved ? 'Сохранено' : 'Сохранить изменения'}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn('shrink-0', sideOpen && 'bg-primary/10 border-primary/30')}
              onClick={() => setSideOpen((o) => !o)}
              aria-label={sideOpen ? 'Закрыть панель' : 'Инструменты'}
            >
              <PanelRightOpen className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Основная область: превью на всю ширину, панель поверх справа */}
      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden relative">
        {/* Превью на всю область */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 min-w-0 min-h-0 rounded-xl border border-border/50 bg-card/20 overflow-hidden shadow-inner relative">
            <iframe
              ref={iframeRef}
              title="Превью сайта"
              src={previewUrl}
              className="absolute inset-0 w-full h-full border-0 rounded-xl"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Боковая панель справа — поверх превью */}
        <div
          className={cn(
            'absolute top-4 right-4 bottom-4 z-30 w-[280px] border border-border/50 rounded-xl bg-card/95 backdrop-blur shadow-xl flex flex-col overflow-hidden transition-[transform] duration-300 ease-out',
            sideOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'
          )}
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border/40 shrink-0">
            <span className="font-semibold text-foreground text-sm truncate">
              {panelStage === 'themes' ? 'Выбор темы' : 'Блоки и инструменты'}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSideOpen(false)}
              aria-label="Закрыть"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-4 [scrollbar-width:none] [&::-webkit-scrollbar]:[display:none] min-h-0">
            {panelStage === 'themes' && (
              <>
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 w-full text-center">
                    Обычные шаблоны
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 justify-items-center w-full max-w-[200px] mx-auto">
                    {ORDINARY_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => selectTheme(theme.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 transition',
                          selectedThemeId === theme.id
                            ? 'opacity-100'
                            : 'opacity-80 hover:opacity-100'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition overflow-hidden',
                            selectedThemeId === theme.id
                              ? 'border-primary bg-primary/20'
                              : 'border-border/50 bg-card/40 hover:border-primary/50'
                          )}
                        >
                          <img src={theme.icon} alt="" className="h-6 w-6 object-contain" />
                        </span>
                        <span className="text-center text-sm font-bold text-foreground leading-tight">
                          {theme.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-px w-full bg-border/50 shrink-0" />
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 w-full text-center">
                    Премиум шаблоны
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 justify-items-center w-full max-w-[200px] mx-auto">
                    {PREMIUM_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => selectTheme(theme.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 transition',
                          selectedThemeId === theme.id
                            ? 'opacity-100'
                            : 'opacity-80 hover:opacity-100'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition overflow-hidden',
                            selectedThemeId === theme.id
                              ? 'border-primary bg-primary/20'
                              : 'border-border/50 bg-card/40 hover:border-primary/50'
                          )}
                        >
                          <img src={theme.icon} alt="" className="h-6 w-6 object-contain" />
                        </span>
                        <span className="text-center text-sm font-bold text-foreground leading-tight">
                          {theme.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-2 border-t border-border/40">
                  <Button
                    className="w-full gap-2"
                    disabled={!selectedThemeId}
                    onClick={goToEdit}
                  >
                    <Pencil className="h-4 w-4" />
                    Редактировать эту тему
                  </Button>
                </div>
                {currentThemeHasEdits && (
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Мой сайт
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Ваши последние правки для этой темы. Главный шаблон не изменён.
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={goToEdit}>
                        <Pencil className="h-3.5 w-3.5" />
                        Открыть
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 border-red-400/50 text-red-600 hover:bg-red-500/10 hover:text-red-500"
                        onClick={handleClearMySite}
                      >
                        Стереть
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            {panelStage === 'edit' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={() => (selectedBlockId != null ? setSelectedBlockId(null) : goBackToThemes())}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {selectedBlockId != null ? 'Назад' : 'Выбор темы'}
                </Button>
                <div className="w-full flex flex-col min-h-0 shrink-0">
                  {selectedBlockId == null ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-px flex-1 bg-border/50 shrink-0" />
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                          Все блоки
                        </h3>
                        <span className="h-px flex-1 bg-border/50 shrink-0" />
                      </div>
                      <ul className="space-y-2">
                        {BLOCKS.map((block) => {
                          const isPremium = currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber'
                          const label = block.id === 'gallery' && isPremium ? 'О салоне' : block.id === 'booking' && isPremium ? 'Наши работы' : block.id === 'works' && isPremium ? 'Наши услуги' : block.label
                          return (
                          <li key={block.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedBlockId(block.id)}
                              className={cn(
                                'w-full rounded-none border-2 px-4 py-3 text-sm font-bold text-center transition',
                                'border-border/50 bg-card/30 text-foreground hover:bg-card/50 hover:border-primary/50',
                                visibleSectionId === block.id && 'border-primary/70 bg-primary/10 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                              )}
                            >
                              {label}
                            </button>
                          </li>
                          )
                        })}
                      </ul>
                      {!(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <>
                          <div className="flex items-center gap-2 my-5">
                            <span className="h-px flex-1 bg-border/50 shrink-0" />
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                              Задний фон тела сайта
                            </h3>
                            <span className="h-px flex-1 bg-border/50 shrink-0" />
                          </div>
                          <div className="flex gap-4 justify-center pb-2">
                            <div className="flex flex-col gap-3">
                              {BODY_BACKGROUND_OPTIONS.slice(0, 3).map((option) => {
                                const current = getDraftOrPublic('publicBodyBackgroundChoice', 'bg-2')
                                const selected = current === option.id
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setDraft('publicBodyBackgroundChoice', option.id)}
                                    className={cn(
                                      'h-20 w-20 rounded-full border-2 shrink-0 overflow-hidden transition',
                                      selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                                    )}
                                    style={
                                      option.type === 'image'
                                        ? { backgroundImage: `url(${option.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : { backgroundColor: option.color }
                                    }
                                    aria-label={option.id}
                                  />
                                )
                              })}
                            </div>
                            <div className="flex flex-col gap-3">
                              {BODY_BACKGROUND_OPTIONS.slice(3, 5).map((option) => {
                                const current = getDraftOrPublic('publicBodyBackgroundChoice', 'bg-2')
                                const selected = current === option.id
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setDraft('publicBodyBackgroundChoice', option.id)}
                                    className={cn(
                                      'h-20 w-20 rounded-full border-2 shrink-0 overflow-hidden transition',
                                      selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                                    )}
                                    style={
                                      option.type === 'image'
                                        ? { backgroundImage: `url(${option.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : { backgroundColor: option.color }
                                    }
                                    aria-label={option.id}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : selectedBlockId === 'header' ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          Шапка сайта
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                    <div className="space-y-0 pr-1">
                      {/* 1. Фон для шапки: фото или видео (для премиум-шаблона — любое; при наличии видео показывается видео) */}
                      <section className="space-y-2 pt-0 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Фон для шапки</h4>
                        {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                          <p className="text-xs text-muted-foreground">Можно загрузить видео или фото любого размера. Если загружено и то и другое — в шапке показывается видео.</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            id="constructor-hero-upload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              const reader = new FileReader()
                              reader.onload = () => {
                                const result = typeof reader.result === 'string' ? reader.result : ''
                                if (result) {
                                  setDraft('publicHeroImage', result)
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }
                              }
                              reader.readAsDataURL(file)
                              e.target.value = ''
                            }}
                          />
                          <label
                            htmlFor="constructor-hero-upload"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors"
                          >
                            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span>{getDraftOrPublic('publicHeroImage') ? 'Сменить фото' : 'Добавить фото'}</span>
                          </label>
                          {getDraftOrPublic('publicHeroImage') && (
                            <button
                              type="button"
                              onClick={() => {
                                if (typeof window === 'undefined') return
                                window.localStorage.removeItem(`draft_publicHeroImage_${themeStorageId(currentHeaderTheme)}`)
                                window.localStorage.removeItem('publicHeroImage')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className="px-3 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                            >
                              Убрать фото
                            </button>
                          )}
                        </div>
                        {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <input
                              id="constructor-hero-video-upload"
                              type="file"
                              accept="video/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const result = typeof reader.result === 'string' ? reader.result : ''
                                  if (result) {
                                    setDraft('publicHeroVideo', result)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }
                                }
                                reader.readAsDataURL(file)
                                e.target.value = ''
                              }}
                            />
                            <label
                              htmlFor="constructor-hero-video-upload"
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors"
                            >
                              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                              <span>{getDraftOrPublic('publicHeroVideo') ? 'Сменить видео' : 'Добавить видео'}</span>
                            </label>
                            {getDraftOrPublic('publicHeroVideo') && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof window === 'undefined') return
                                  window.localStorage.removeItem(`draft_publicHeroVideo_${themeStorageId(currentHeaderTheme)}`)
                                  window.localStorage.removeItem('publicHeroVideo')
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className="px-3 py-2 rounded-lg border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                              >
                                Убрать видео
                              </button>
                            )}
                          </div>
                        )}
                      </section>
                      {/* Цвет хедера (премиум) — палитра как в других шаблонах, с эффектом свечения */}
                      {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <section className="space-y-3 pt-3 pb-3 border-b border-border/50">
                          <h4 className="text-sm font-semibold text-foreground">Цвет хедера</h4>
                          <div className="flex flex-wrap gap-2">
                            {PREMIUM_HEADER_COLOR_OPTIONS.map((opt) => {
                              const current = getDraftOrPublic('publicPremiumHeaderBgColor') || ''
                              const selected = current === opt.color
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraft('publicPremiumHeaderBgColor', opt.color)
                                    setDraft('publicPremiumHeaderBgGlow', opt.glow)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'h-8 w-8 rounded-full border-2 shrink-0 transition',
                                    selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                                  )}
                                  style={{
                                    backgroundColor: opt.color,
                                    boxShadow: selected ? opt.glow : undefined,
                                  }}
                                  title={opt.label}
                                  aria-label={opt.label}
                                />
                              )
                            })}
                            <button
                              type="button"
                              onClick={() => {
                                setDraft('publicPremiumHeaderBgColor', '')
                                setDraft('publicPremiumHeaderBgGlow', '')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'px-2.5 py-1.5 rounded-full border text-sm font-medium transition-colors',
                                !getDraftOrPublic('publicPremiumHeaderBgColor')
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border/50 text-muted-foreground hover:text-foreground'
                              )}
                            >
                              По умолчанию
                            </button>
                          </div>
                        </section>
                      )}
                      {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <>
                          {[
                            { key: 'publicPremiumHeaderNavColor', keyGlow: '', label: 'Цвет кнопок в шапке' },
                            { key: 'publicPremiumHeaderTitleColor', keyGlow: '', label: 'Цвет главного названия в шапке' },
                            { key: 'publicPremiumHeroSubtitleColor', keyGlow: '', label: 'Цвет первого заголовка в hero' },
                            { key: 'publicPremiumHeroTitleColor', keyGlow: '', label: 'Цвет второго заголовка в hero' },
                            { key: 'publicPremiumHeroButton1BorderColor', keyGlow: 'publicPremiumHeroButton1Glow', label: 'Цвет рамки первой кнопки' },
                            { key: 'publicPremiumHeroButton2BorderColor', keyGlow: 'publicPremiumHeroButton2Glow', label: 'Цвет рамки второй кнопки' },
                          ].map(({ key, keyGlow, label }) => (
                            <section key={key} className="space-y-2 pt-3 pb-3 border-b border-border/50">
                              <h4 className="text-sm font-semibold text-foreground">{label}</h4>
                              <div className="flex flex-wrap gap-2 items-center">
                                {PREMIUM_HEADER_COLOR_OPTIONS.map((opt) => {
                                  const current = getDraftOrPublic(key) || ''
                                  const selected = current === opt.color
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => {
                                        setDraft(key, opt.color)
                                        if (keyGlow) setDraft(keyGlow, opt.glow)
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      }}
                                      className={cn(
                                        'h-8 w-8 rounded-full border-2 shrink-0 transition',
                                        selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                                      )}
                                      style={{
                                        backgroundColor: opt.color,
                                        boxShadow: selected ? opt.glow : undefined,
                                      }}
                                      title={opt.label}
                                      aria-label={opt.label}
                                    />
                                  )
                                })}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraft(key, '')
                                    if (keyGlow) setDraft(keyGlow, '')
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'px-2.5 py-1.5 rounded-full border text-sm font-medium transition-colors',
                                    !getDraftOrPublic(key)
                                      ? 'border-primary bg-primary/10 text-foreground'
                                      : 'border-border/50 text-muted-foreground hover:text-foreground'
                                  )}
                                >
                                  По умолчанию
                                </button>
                              </div>
                            </section>
                          ))}
                        </>
                      )}
                      {!(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                      <>
                      {/* 2. Логотип (шапка) */}
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Логотип (шапка)</h4>
                        <input
                          id="constructor-header-logo-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => {
                              const result = typeof reader.result === 'string' ? reader.result : ''
                              if (!result) return
                              compressImageForLogo(result, (dataUrl) => {
                                setDraft('publicLogo', dataUrl)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              })
                            }
                            reader.readAsDataURL(file)
                            e.target.value = ''
                          }}
                        />
                        <div className="flex items-center gap-3">
                          {(() => {
                            const stored = getDraftOrPublic('publicLogo') || DEFAULT_LOGO_URL
                            const displayUrl = stored.startsWith('data:') ? DEFAULT_LOGO_URL : stored
                            const isDefaultShape = displayUrl === DEFAULT_LOGO_URL
                            const shape = isDefaultShape ? 'circle' : (getDraftOrPublic('publicHeaderLogoShape') || 'circle')
                            return (
                          <label
                            htmlFor="constructor-header-logo-upload"
                            className={cn(
                              'cursor-pointer shrink-0 overflow-hidden border border-border/50 transition hover:border-primary/50 hover:ring-2 hover:ring-primary/30',
                              shape === 'circle' ? 'h-14 w-14 rounded-full' : shape === 'rounded' ? 'h-14 w-14 rounded-xl' : 'h-14 w-14 rounded-none'
                            )}
                          >
                            {displayUrl ? (
                              <img src={displayUrl} alt="Логотип" className="h-full w-full object-cover" />
                            ) : null}
                          </label>
                            )
                          })()}
                          <label
                            htmlFor="constructor-header-logo-upload"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors"
                          >
                            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span>{(getDraftOrPublic('publicLogo') && getDraftOrPublic('publicLogo') !== DEFAULT_LOGO_URL) ? 'Изменить логотип' : 'Загрузить логотип'}</span>
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'circle', label: 'Круг' },
                            { value: 'rounded', label: 'Скругленный квадрат' },
                            { value: 'square', label: 'Квадрат' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setDraft('publicHeaderLogoShape', opt.value)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                                getDraftOrPublic('publicHeaderLogoShape') === opt.value
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border/50 bg-card/30 text-muted-foreground hover:bg-card/50'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3">
                          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(getDraftOrPublic('publicHeaderLogoVisible') || 'true') !== 'false'}
                              onChange={(e) => {
                                setDraft('publicHeaderLogoVisible', e.target.checked ? 'true' : 'false')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className="h-3.5 w-3.5 rounded border-border/60 bg-card"
                            />
                            <span>Показывать логотип в шапке</span>
                          </label>
                        </div>
                      </section>
                      {/* 3. Главное название */}
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Главное название</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const raw = getDraftOrPublic(headerColorsStorageKey)
                                let prev: { title?: string; subtitle?: string; primary?: string; secondary?: string } = {}
                                if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, title: opt.id }))
                                setStoragePoll((n) => n + 1)
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (() => {
                                  const raw = getDraftOrPublic(headerColorsStorageKey)
                                  let cur = 'default'
                                  if (raw) try { cur = JSON.parse(raw)?.title || 'default' } catch { /* ignore */ }
                                  return cur === opt.id ? 'border-primary' : 'border-border/50'
                                })()
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const raw = getDraftOrPublic(headerColorsStorageKey)
                              let prev: Record<string, string> = {}
                              if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                              const next = { ...prev, title: 'default' }
                              setDraft(headerColorsStorageKey, JSON.stringify(next))
                              setStoragePoll((n) => n + 1)
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      {/* 4. Описание */}
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Описание</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const raw = getDraftOrPublic(headerColorsStorageKey)
                                let prev: Record<string, string> = {}
                                if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, subtitle: opt.id }))
                                setStoragePoll((n) => n + 1)
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (() => {
                                  const raw = getDraftOrPublic(headerColorsStorageKey)
                                  let cur = 'default'
                                  if (raw) try { cur = JSON.parse(raw)?.subtitle || 'default' } catch { /* ignore */ }
                                  return cur === opt.id ? 'border-primary' : 'border-border/50'
                                })()
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const raw = getDraftOrPublic(headerColorsStorageKey)
                              let prev: Record<string, string> = {}
                              if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                              setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, subtitle: 'default' }))
                              setStoragePoll((n) => n + 1)
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      {/* 5. Кнопки */}
                      <section className="space-y-4 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Кнопки</h4>
                        {/* Первая кнопка */}
                        <div className="space-y-2 pl-0">
                          <span className="block text-center text-xs text-muted-foreground uppercase tracking-wider">Первая кнопка</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setDraft('publicHeaderPrimaryCtaShape', 'square')}
                              className={cn(
                                'px-2 py-1.5 rounded-lg border text-sm font-medium',
                                getDraftOrPublic('publicHeaderPrimaryCtaShape') === 'square' ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/30'
                              )}
                            >
                              Квадрат
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft('publicHeaderPrimaryCtaShape', 'round')}
                              className={cn(
                                'px-2 py-1.5 rounded-lg border text-sm font-medium',
                                getDraftOrPublic('publicHeaderPrimaryCtaShape') === 'round' ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/30'
                              )}
                            >
                              Круг
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {headerButtonOptionsList.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  const raw = getDraftOrPublic(headerColorsStorageKey)
                                  let prev: Record<string, string> = {}
                                  if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                  setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, primary: opt.id }))
                                  setStoragePoll((n) => n + 1)
                                }}
                                className={cn(
                                  'h-7 w-7 rounded-full border-2',
                                  (() => {
                                    const raw = getDraftOrPublic(headerColorsStorageKey)
                                    let cur = 'default'
                                    if (raw) try { cur = JSON.parse(raw)?.primary || 'default' } catch { /* ignore */ }
                                    return cur === opt.id ? 'border-primary' : 'border-border/50'
                                  })()
                                )}
                                style={{ backgroundColor: opt.background }}
                                aria-label={opt.label}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const raw = getDraftOrPublic(headerColorsStorageKey)
                                let prev: Record<string, string> = {}
                                if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, primary: 'default' }))
                                setStoragePoll((n) => n + 1)
                              }}
                              className="px-2 py-1 rounded-full border border-border/50 text-sm text-muted-foreground"
                            >
                              По умолчанию
                            </button>
                          </div>
                        </div>
                        {/* Вторая кнопка */}
                        <div className="space-y-2 pl-0">
                          <span className="block text-center text-xs text-muted-foreground uppercase tracking-wider">Вторая кнопка</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setDraft('publicHeaderSecondaryCtaShape', 'square')}
                              className={cn(
                                'px-2 py-1.5 rounded-lg border text-sm font-medium',
                                getDraftOrPublic('publicHeaderSecondaryCtaShape') === 'square' ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/30'
                              )}
                            >
                              Квадрат
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft('publicHeaderSecondaryCtaShape', 'round')}
                              className={cn(
                                'px-2 py-1.5 rounded-lg border text-sm font-medium',
                                getDraftOrPublic('publicHeaderSecondaryCtaShape') === 'round' ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/30'
                              )}
                            >
                              Круг
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {headerButtonOptionsList.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  const raw = getDraftOrPublic(headerColorsStorageKey)
                                  let prev: Record<string, string> = {}
                                  if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                  setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, secondary: opt.id }))
                                  setStoragePoll((n) => n + 1)
                                }}
                                className={cn(
                                  'h-7 w-7 rounded-full border-2',
                                  (() => {
                                    const raw = getDraftOrPublic(headerColorsStorageKey)
                                    let cur = 'default'
                                    if (raw) try { cur = JSON.parse(raw)?.secondary || 'default' } catch { /* ignore */ }
                                    return cur === opt.id ? 'border-primary' : 'border-border/50'
                                  })()
                                )}
                                style={{ backgroundColor: opt.background }}
                                aria-label={opt.label}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const raw = getDraftOrPublic(headerColorsStorageKey)
                                let prev: Record<string, string> = {}
                                if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, secondary: 'default' }))
                                setStoragePoll((n) => n + 1)
                              }}
                              className="px-2 py-1 rounded-full border border-border/50 text-sm text-muted-foreground"
                            >
                              По умолчанию
                            </button>
                          </div>
                        </div>
                      </section>
                      </>
                      )}
                    </div>
                    </>
                  ) : selectedBlockId === 'gallery' ? (
                    (currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          О салоне
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        Тексты редактируются в превью. Цвета и фото задаются здесь. До 10 фото в карусели; по умолчанию — 3 примера.
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет заголовка</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicAboutSalonTitleColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicAboutSalonTitleColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicAboutSalonTitleColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет описания</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicAboutSalonDescColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicAboutSalonDescColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicAboutSalonDescColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет третьего текста</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicAboutSalonThirdColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicAboutSalonThirdColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicAboutSalonThirdColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет рамки кнопки</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicAboutSalonButtonBorderColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicAboutSalonButtonBorderColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicAboutSalonButtonBorderColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3">
                        <h4 className="text-sm font-semibold text-foreground">Фото салона (до 10)</h4>
                        <p className="text-xs text-muted-foreground">По умолчанию — 3 примера. Крестик — удалить, клик по слоту — загрузить своё.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                            const image = getDraftOrPublic(`publicAboutSalon${idx}`)
                            const displayImage =
                              image === '__empty__' ? '' : (image || (idx <= 3 ? ABOUT_SALON_DEFAULTS[idx - 1] : ''))
                            const hasImage = Boolean(displayImage)
                            return (
                              <div
                                key={`about-salon-slot-${idx}`}
                                className={cn(
                                  'relative aspect-square rounded-lg border-2 overflow-hidden',
                                  hasImage ? 'border-border/50 bg-card/30' : 'border-dashed border-border/50 bg-card/20'
                                )}
                              >
                                {hasImage ? (
                                  <>
                                    <label
                                      htmlFor={`constructor-about-salon-${idx}`}
                                      className="absolute inset-0 cursor-pointer block"
                                      title="Заменить фото"
                                    >
                                      <img src={displayImage} alt="" className="h-full w-full object-cover" />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (typeof window === 'undefined') return
                                        setDraft(`publicAboutSalon${idx}`, '__empty__')
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      }}
                                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10"
                                      aria-label="Удалить"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </>
                                ) : (
                                  <label
                                    htmlFor={`constructor-about-salon-${idx}`}
                                    className="h-full w-full flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                                  >
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[10px]">Слот {idx}</span>
                                  </label>
                                )}
                                <input
                                  id={`constructor-about-salon-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || typeof window === 'undefined') return
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      const result = typeof reader.result === 'string' ? reader.result : ''
                                      if (!result) return
                                      compressImageForLogo(result, (dataUrl) => {
                                        setDraft(`publicAboutSalon${idx}`, dataUrl)
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      })
                                    }
                                    reader.onerror = () => {
                                      e.target.value = ''
                                    }
                                    reader.readAsDataURL(file)
                                    e.target.value = ''
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    </>
                    ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          Фотографии салона
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        Надпись блока можно редактировать в превью. Фото загружаются по клику на ячейки в превью.
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Надпись блока</h4>
                        <input
                          type="text"
                          value={getDraftOrPublic('publicGalleryTitle')}
                          onChange={(e) => {
                            setDraft('publicGalleryTitle', e.target.value)
                            setStoragePoll((n) => n + 1)
                            notifyIframeDraft()
                          }}
                          placeholder="Фотографии салона"
                          className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет надписи</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicGalleryTitleColor', opt.id)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicGalleryTitleColor') || 'default') === opt.id ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicGalleryTitleColor', 'default')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                    </>
                    )
                  ) : selectedBlockId === 'booking' ? (
                    (currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          Наши работы
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        Тексты редактируются в превью. Цвета и фото задаются здесь. До 10 фото; по умолчанию — 3 примера.
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет заголовка 1</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicWorksTitleColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicWorksTitleColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicWorksTitleColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет заголовка 2</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicWorksSubtitleColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicWorksSubtitleColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicWorksSubtitleColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3">
                        <h4 className="text-sm font-semibold text-foreground">Фото работ (до 10)</h4>
                        <p className="text-xs text-muted-foreground">По умолчанию — 3 примера. Крестик — удалить, клик по слоту — загрузить своё.</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                            const image = getDraftOrPublic(`publicWorks${idx}`)
                            const displayImage =
                              image === '__empty__' ? '' : (image || (idx <= 3 ? WORKS_CAROUSEL_DEFAULTS[idx - 1] : ''))
                            const hasImage = Boolean(displayImage)
                            return (
                              <div
                                key={`works-block-slot-${idx}`}
                                className={cn(
                                  'relative aspect-square rounded-lg border-2 overflow-hidden',
                                  hasImage ? 'border-border/50 bg-card/30' : 'border-dashed border-border/50 bg-card/20'
                                )}
                              >
                                {hasImage ? (
                                  <>
                                    <label
                                      htmlFor={`constructor-works-block-${idx}`}
                                      className="absolute inset-0 cursor-pointer block"
                                      title="Заменить фото"
                                    >
                                      <img src={displayImage} alt="" className="h-full w-full object-cover" />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (typeof window === 'undefined') return
                                        setDraft(`publicWorks${idx}`, '__empty__')
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      }}
                                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10"
                                      aria-label="Удалить"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </>
                                ) : (
                                  <label
                                    htmlFor={`constructor-works-block-${idx}`}
                                    className="h-full w-full flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                                  >
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[10px]">Слот {idx}</span>
                                  </label>
                                )}
                                <input
                                  id={`constructor-works-block-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || typeof window === 'undefined') return
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      const result = typeof reader.result === 'string' ? reader.result : ''
                                      if (!result) return
                                      compressImageForLogo(result, (dataUrl) => {
                                        setDraft(`publicWorks${idx}`, dataUrl)
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      })
                                    }
                                    reader.onerror = () => { e.target.value = '' }
                                    reader.readAsDataURL(file)
                                    e.target.value = ''
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    </>
                    ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          Запись клиентов
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        Редактируйте заголовок и описание в превью. Цвета задаются здесь.
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет заголовка</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicBookingTitleColor', opt.id)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicBookingTitleColor') || 'default') === opt.id ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicBookingTitleColor', 'default')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Цвет описания</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicBookingSubtitleColor', opt.id)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicBookingSubtitleColor') || 'default') === opt.id ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicBookingSubtitleColor', 'default')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            По умолчанию
                          </button>
                        </div>
                      </section>
                    </>
                    )
                  ) : selectedBlockId === 'works' ? (
                    (currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          Наши услуги
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        Карточки услуг редактируются прямо в превью: обобщённое название тематики, процедуры (название и описание) и фото. Всего 5 карточек; у каждой — крестик у фото, у названия и у каждой процедуры для удаления. Текст в карточках растягивается без скролла.
                      </p>
                    </>
                    ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          Галерея работ
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        До 10 фото для карусели. Они отображаются в превью ниже.
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">Слоты фотографий (1–10)</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                            const image = getDraftOrPublic(`publicGallery${idx}`)
                            const displayImage =
                              image === '__empty__' ? '' : (image || (idx <= 3 ? WORKS_CAROUSEL_DEFAULTS[idx - 1] : ''))
                            const hasImage = Boolean(displayImage)
                            return (
                              <div
                                key={`works-slot-${idx}`}
                                className={cn(
                                  'relative aspect-square rounded-lg border-2 overflow-hidden',
                                  hasImage ? 'border-border/50 bg-card/30' : 'border-dashed border-border/50 bg-card/20'
                                )}
                              >
                                {hasImage ? (
                                  <>
                                    <label
                                      htmlFor={`constructor-works-gallery-${idx}`}
                                      className="absolute inset-0 cursor-pointer block"
                                      title="Заменить фото"
                                    >
                                      <img src={displayImage} alt="" className="h-full w-full object-cover" />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (typeof window === 'undefined') return
                                        setDraft(`publicGallery${idx}`, '__empty__')
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      }}
                                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10"
                                      aria-label="Удалить"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </>
                                ) : (
                                  <label
                                    htmlFor={`constructor-works-gallery-${idx}`}
                                    className="h-full w-full flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                                  >
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[10px]">Слот {idx}</span>
                                  </label>
                                )}
                                <input
                                  id={`constructor-works-gallery-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || typeof window === 'undefined') return
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      const result = typeof reader.result === 'string' ? reader.result : ''
                                      if (!result) return
                                      compressImageForLogo(result, (dataUrl) => {
                                        setDraft(`publicGallery${idx}`, dataUrl)
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      })
                                    }
                                    reader.onerror = () => {
                                      e.target.value = ''
                                    }
                                    reader.readAsDataURL(file)
                                    e.target.value = ''
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                    )
                  ) : selectedBlockId === 'footer' ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1 w-full">
                        <span className="flex-1 h-px bg-border/60 min-w-0" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider px-2 text-center shrink-0">
                          Контактная<br />информация
                        </h3>
                        <span className="flex-1 h-px bg-border/60 min-w-0" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        Здесь настраиваются логотип в футере и ссылки на соцсети. Текст в футере редактируется прямо в превью.
                      </p>
                      {/* 1. Логотип футера */}
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Логотип (футер)</h4>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const footerLogoUrl = getDraftOrPublic('publicFooterLogo') || getDraftOrPublic('publicLogo') || DEFAULT_LOGO_URL
                            const footerLogoDisplayUrl = footerLogoUrl.startsWith('data:') ? DEFAULT_LOGO_URL : footerLogoUrl
                            const footerLogoDisplayShape = footerLogoDisplayUrl === DEFAULT_LOGO_URL ? 'circle' : (getDraftOrPublic('publicFooterLogoShape') || getDraftOrPublic('publicLogoShape') || 'circle')
                            return footerLogoUrl ? (
                            <div
                              className={cn(
                                'h-14 w-14 shrink-0 overflow-hidden border border-border/50 rounded-lg',
                                footerLogoDisplayShape === 'circle' ? 'rounded-full' : footerLogoDisplayShape === 'rounded' ? 'rounded-xl' : 'rounded-none'
                              )}
                            >
                              <img
                                src={footerLogoDisplayUrl}
                                alt="Логотип футера"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-14 w-14 shrink-0 border border-dashed border-border/50 rounded-lg flex items-center justify-center bg-card/30 text-xs text-muted-foreground">
                              Нет
                            </div>
                          )
                          })()}
                          <div>
                            <input
                              id="constructor-footer-logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const result = typeof reader.result === 'string' ? reader.result : ''
                                  if (result) {
                                    setDraft('publicFooterLogo', result)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }
                                }
                                reader.readAsDataURL(file)
                                e.target.value = ''
                              }}
                            />
                            <label
                              htmlFor="constructor-footer-logo-upload"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-none border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-xs font-medium cursor-pointer transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span>Изменить логотип</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            { value: 'circle', label: 'Круг' },
                            { value: 'rounded', label: 'Скругленный квадрат' },
                            { value: 'square', label: 'Квадрат' },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setDraft('publicFooterLogoShape', opt.value)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                                (getDraftOrPublic('publicFooterLogoShape') ||
                                  getDraftOrPublic('publicLogoShape') ||
                                  'circle') === opt.value
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border/50 bg-card/30 text-muted-foreground hover:bg-card/50'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3">
                          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(getDraftOrPublic('publicFooterLogoVisible') || 'true') !== 'false'}
                              onChange={(e) => {
                                setDraft('publicFooterLogoVisible', e.target.checked ? 'true' : 'false')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className="h-3.5 w-3.5 rounded border-border/60 bg-card"
                            />
                            <span>Показывать логотип в футере</span>
                          </label>
                        </div>
                      </section>
                      {/* 2. Ссылки на соцсети */}
                      <section className="space-y-3 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Ссылки на соцсети</h4>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Telegram</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicTelegram')}
                              onChange={(e) => setDraft('publicTelegram', e.target.value)}
                              placeholder="https://t.me/username"
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Viber</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicViber')}
                              onChange={(e) => setDraft('publicViber', e.target.value)}
                              placeholder="viber://chat?number=..."
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Instagram</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicInstagram')}
                              onChange={(e) => setDraft('publicInstagram', e.target.value)}
                              placeholder="https://instagram.com/username"
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                      </section>
                      {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <section className="space-y-3 pt-3 pb-3 border-b border-border/50">
                          <h4 className="text-sm font-semibold text-foreground">Цвета футера (премиум)</h4>
                          <p className="text-xs text-muted-foreground">Цвет главного названия, текст контактов и строка «Выходной». Названия блоков (АДРЕС, ГРАФИК и т.д.) не меняются.</p>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">Главное название</span>
                            <div className="flex flex-wrap gap-2 items-center">
                              {HEADER_TEXT_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraft('publicFooterTitleColor', opt.color)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'h-7 w-7 rounded-full border-2 transition',
                                    (getDraftOrPublic('publicFooterTitleColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                                  )}
                                  style={{ backgroundColor: opt.color }}
                                  aria-label={opt.label}
                                />
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setDraft('publicFooterTitleColor', '')
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                              >
                                По умолчанию
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">Текст контактов</span>
                            <div className="flex flex-wrap gap-2 items-center">
                              {HEADER_TEXT_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraft('publicFooterTextColor', opt.color)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'h-7 w-7 rounded-full border-2 transition',
                                    (getDraftOrPublic('publicFooterTextColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                                  )}
                                  style={{ backgroundColor: opt.color }}
                                  aria-label={opt.label}
                                />
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setDraft('publicFooterTextColor', '')
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                              >
                                По умолчанию
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">Строка «Выходной»</span>
                            <div className="flex flex-wrap gap-2 items-center">
                              {HEADER_TEXT_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraft('publicFooterDayOffColor', opt.color)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'h-7 w-7 rounded-full border-2 transition',
                                    (getDraftOrPublic('publicFooterDayOffColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                                  )}
                                  style={{ backgroundColor: opt.color }}
                                  aria-label={opt.label}
                                />
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setDraft('publicFooterDayOffColor', '')
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                              >
                                По умолчанию
                              </button>
                            </div>
                          </div>
                        </section>
                      )}
                    </>
                  ) : selectedBlockId === 'map' ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          Карта и адрес
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        Введите адрес — мы подскажем варианты, а карта в превью обновится автоматически.
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">Адрес</h4>
                        <div ref={addressRef} className="relative">
                          <input
                            type="text"
                            value={addressQuery}
                            onChange={(e) => {
                              const v = e.target.value
                              setAddressQuery(v)
                              setDraft('publicAddress', v)
                              setDraft('publicFooterAddress', v)
                            }}
                            onFocus={() => {
                              setIsAddressFocused(true)
                              if (addressResults.length > 0) setIsAddressOpen(true)
                            }}
                            onBlur={() => {
                              // небольшая задержка, чтобы клик по подсказке успел отработать
                              setTimeout(() => setIsAddressFocused(false), 150)
                            }}
                            placeholder={FOOTER_DEFAULT_ADDRESS}
                            className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          {isAddressOpen && addressResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 rounded-lg border border-border/50 bg-card shadow-2xl max-h-60 overflow-y-auto">
                              {addressResults.map((result) => {
                                const title = result.display_name as string
                                return (
                                  <button
                                    key={result.place_id}
                                    type="button"
                                    onClick={() => {
                                      const formatted = result.display_name as string
                                      const placeName =
                                        (result.name as string) ||
                                        (formatted ? formatted.split(',')[0] : '')
                                      setAddressQuery(formatted)
                                      setDraft('publicAddress', formatted)
                                      setDraft('publicFooterAddress', formatted)
                                      if (result.lat && result.lon) {
                                        setDraft('publicMapLat', String(result.lat))
                                        setDraft('publicMapLng', String(result.lon))
                                      }
                                      setDraft('publicPlaceName', placeName)
                                      setIsAddressOpen(false)
                                      setAddressResults([])
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs sm:text-sm text-foreground hover:bg-accent/10"
                                  >
                                    {title}
                                  </button>
                                )
                              })}
                              {isAddressLoading && (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                  Идёт поиск...
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </section>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {BLOCKS.find((b) => b.id === selectedBlockId)?.label ?? selectedBlockId}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2">
                        {selectedBlockId === 'header'
                          ? 'Редактируйте шапку в превью: темы, цвета и кнопки настраиваются здесь в сайдбаре.'
                          : 'Перейдите к этому блоку в превью и редактируйте его там.'}
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          {panelStage === 'edit' && (
            <div className="shrink-0 p-3 border-t border-border/40 bg-card/95 sticky bottom-0">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 border-red-400/70 bg-red-500/20 text-white hover:bg-red-500/30 hover:border-red-400 hover:text-white disabled:opacity-50 disabled:text-white/80"
                disabled={
                  selectedBlockId == null
                    ? currentHeaderTheme === 'hair'
                      ? !hasHeaderDesignOverride
                      : !currentThemeHasEdits
                    : undoStack.length === 0
                }
                onClick={selectedBlockId == null ? handleRestoreInitialDesign : handleUndo}
                title={
                  selectedBlockId == null
                    ? currentHeaderTheme === 'hair'
                      ? hasHeaderDesignOverride
                        ? 'Вернуть шапку к изначальному расположению'
                        : 'Изначальный дизайн уже используется'
                      : currentThemeHasEdits
                        ? 'Вернуть к изначальному дизайну шаблона'
                        : 'Изначальный дизайн уже используется'
                    : undoStack.length === 0
                    ? 'Нет изменений для отмены'
                    : 'Отменить последнее изменение'
                }
              >
                <RotateCcw className="h-4 w-4 shrink-0" />
                {selectedBlockId == null ? 'Вернуть изначальный дизайн' : 'Вернуть назад'}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
    </ConstructorErrorBoundary>
  )
}
