import { useState, useCallback, useMemo, useRef, useEffect, type ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Maximize2,
  Save,
  PanelRightOpen,
  X,
  ChevronLeft,
  ChevronDown,
  Pencil,
  RotateCcw,
  Undo2,
  Gem,
  Plus,
  Video,
  ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getMassageDraft, MASSAGE_DRAFT_PREFIX } from '@/lib/massage-draft'
import MassageTemplate, {
  mergeMassageServicesFromDraft,
  serializeMassageServicesForDraft,
  MASSAGE_SERVICES_MAX,
  mergeMassageGalleryFromDraft,
  serializeMassageGalleryForDraft,
  MASSAGE_GALLERY_MAX_SECTIONS,
  MASSAGE_GALLERY_PHOTOS_PER_SECTION,
  MASSAGE_GALLERY_TAB_LABEL_MAX,
  mergeMassageSubscriptionsFromDraft,
  serializeMassageSubscriptionsForDraft,
  MASSAGE_SUBSCRIPTION_PRESETS,
  MASSAGE_SUBSCRIPTION_PRESET_COUNT,
} from '@/components/public/MassageTemplate'
import { compressImageForLogo, compressImageForHeroBg } from '@/lib/compress-image'
import {
  MASSAGE_HEADER_TEXT_OPTIONS,
  parseMassageThemeColors,
  type MassageThemeColors,
} from '@/lib/massage-theme-palette'

type Lang = 'ru' | 'en' | 'ro'

const MASSAGE_BLOCKS = [
  { id: 'header', ru: 'Шапка сайта', en: 'Site header', ro: 'Antet site' },
  { id: 'services', ru: 'Услуги', en: 'Services', ro: 'Servicii' },
  { id: 'about', ru: 'О салоне', en: 'About', ro: 'Despre noi' },
  { id: 'gallery', ru: 'Галерея', en: 'Gallery', ro: 'Galerie' },
  { id: 'subscriptions', ru: 'Абонементы', en: 'Subscriptions', ro: 'Abonamente' },
  { id: 'catalog', ru: 'Каталог', en: 'Catalog', ro: 'Catalog' },
  { id: 'specialists', ru: 'Специалисты', en: 'Specialists', ro: 'Specialiști' },
  { id: 'cta', ru: 'Блок записи', en: 'Booking block', ro: 'Bloc programare' },
  { id: 'contacts', ru: 'Контакты', en: 'Contacts', ro: 'Contacte' },
] as const

/** DOM id секций в MassageTemplate — для скролла и scrollspy */
const MASSAGE_BLOCK_ANCHOR_BY_ID: Record<(typeof MASSAGE_BLOCKS)[number]['id'], string> = {
  header: 'massage-block-header',
  services: 'our-services',
  about: 'about',
  gallery: 'gallery',
  subscriptions: 'promos',
  catalog: 'catalog',
  specialists: 'masters',
  cta: 'massage-block-cta',
  contacts: 'contacts',
}

const SOCIAL_FIELDS = [
  { key: 'publicTelegram', label: 'Telegram', placeholder: 'https://t.me/username' },
  { key: 'publicViber', label: 'Viber', placeholder: 'viber://chat?number=...' },
  { key: 'publicWhatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/123456789' },
  { key: 'publicInstagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'publicFacebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
  { key: 'publicVk', label: 'VK', placeholder: 'https://vk.com/username' },
  { key: 'publicTwitter', label: 'X / Twitter', placeholder: 'https://x.com/username' },
  { key: 'publicTiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@username' },
] as const

const UI: Record<Lang, Record<string, string>> = {
  ru: {
    constructorTitle: 'Конструктор сайта',
    back: 'Назад',
    fullSize: 'Полный размер',
    save: 'Сохранить',
    saved: 'Сохранено ✓',
    close: 'Закрыть',
    allBlocks: 'Все блоки',
    chooseTheme: 'Выбор темы',
    templateHeading: 'Шаблон',
    editThisTheme: 'Редактировать эту тему',
    templateLabel: 'Массажный салон',
    restoreDesign: 'Вернуть изначальный дизайн',
    undoLast: 'Вернуть назад',
    socialLinks: 'Ссылки на соцсети',
    headerLogo: 'Логотип (шапка)',
    logoUpload: 'Загрузить логотип',
    logoChange: 'Сменить логотип',
    logoShape: 'Форма',
    shapeCircle: 'Круг',
    shapeRounded: 'Скруглённый',
    shapeSquare: 'Квадрат',
    showLogo: 'Показывать логотип',
    heroBg: 'Фон главного экрана',
    heroBgHint:
      'Можно загрузить фото или видео на задний план. Если загружены оба — показывается видео. Фото: jpg, png, webp… Видео: только файлы видео (mp4, webm…).',
    addVideo: 'Добавить видео',
    addPhoto: 'Добавить фото',
    addVideoOverPhoto: 'Добавить видео поверх фото',
    videoLoaded: 'Видео загружено',
    videoShownInHero: 'Показывается на главном экране',
    changeVideo: 'Сменить видео',
    changePhoto: 'Сменить фото',
    photoBg: 'Фото фона',
    remove: 'Убрать',
    removeBg: 'Сбросить фон (фото и видео)',
    colorTopBar: 'Фон верхней полосы (контакты)',
    colorNav: 'Фон меню навигации',
    colorNavLinks: 'Ссылки в меню',
    colorSiteName: 'Название салона',
    colorTagline: 'Теглайн',
    colorAddress: 'Адрес',
    colorContactOnline: 'Строка «онлайн»',
    colorCallUs: 'Строка «звоните»',
    colorPhone: 'Телефон',
    colorHero1: 'Hero — первая строка заголовка',
    colorHero2: 'Hero — вторая строка заголовка',
    colorHeroSub: 'Hero — подзаголовок',
    colorHeroBtnBorder: 'Hero — рамка кнопки',
    byDefault: 'По умолчанию',
    colorsBlock: 'Цвета',
    servicesBlockHint:
      'Заголовки и текст в карточках редактируйте в превью. Здесь — фото для каждой карточки или режим без фото.',
    serviceCardN: 'Карточка',
    servicePhoto: 'Фото',
    svcAllNoPhoto: 'Все без фото',
    svcAllWithPhoto: 'Все с фото',
    colorSvcBlockTitle: 'Блок услуг — заголовок',
    colorSvcBlockSub: 'Блок услуг — подзаголовок',
    colorSvcCardTitle: 'Карточка — название',
    colorSvcCardDesc: 'Карточка — описание',
    colorSvcCardPrice: 'Карточка — цена',
    aboutBlockHint:
      'Три текста редактируйте в превью: Shift+Enter — новая строка. Здесь — фото основателя и цвета.',
    aboutFounderPhoto: 'Фото основателя (аватар)',
    aboutPhotoUpload: 'Загрузить фото',
    aboutPhotoChange: 'Сменить фото',
    colorAboutHeading: 'О салоне — главный заголовок',
    colorAboutBody: 'О салоне — основной текст',
    colorAboutMission: 'О салоне — миссия / подпись',
    galleryBlockHint:
      'Заголовок и подзаголовок галереи — в превью. Название каждой секции задайте здесь; до 6 секций, по 12 фото.',
    galleryAddSection: 'Добавить секцию',
    galleryNewSection: 'Новая секция',
    gallerySectionN: 'Секция',
    gallerySectionLabel: 'Название вкладки',
    gallerySlotPhoto: 'Фото',
    galleryColorSection: 'Цвета галереи',
    colorGalTitle: 'Заголовок',
    colorGalSub: 'Подзаголовок',
    colorGalTabActive: 'Вкладки секций (один цвет)',
    subsBlockHint:
      'Заголовок блока редактируйте в превью. Добавляйте абонементы по скидке, ссылку на кнопку — ниже.',
    subsHideBlock: 'Скрыть блок «Абонементы» на сайте',
    subsHideCta: 'Скрыть кнопку акции в карточках',
    subsCtaUrl: 'Ссылка на кнопку акции',
    subsAddPreset: 'Добавить абонемент',
    subsPickPlaceholder: 'Выберите вариант (скидка)',
    subsList: 'Список',
    subsColorSection: 'Цвета абонементов',
    colorSubsBlockTitle: 'Заголовок блока',
    colorSubsCardTitle: 'Карточка — заголовок',
    colorSubsCardDesc: 'Карточка — подзаголовок',
    colorSubsCardBgFrom: 'Карточка — фон (старт)',
    colorSubsCardBgTo: 'Карточка — фон (конец)',
    colorSubsCtaText: 'Кнопка акции — текст',
  },
  en: {
    constructorTitle: 'Site Constructor',
    back: 'Back',
    fullSize: 'Full size',
    save: 'Save',
    saved: 'Saved ✓',
    close: 'Close',
    allBlocks: 'All blocks',
    chooseTheme: 'Choose theme',
    templateHeading: 'Template',
    editThisTheme: 'Edit this theme',
    templateLabel: 'Massage salon',
    restoreDesign: 'Restore original design',
    undoLast: 'Undo last step',
    socialLinks: 'Social media links',
    headerLogo: 'Logo (header)',
    logoUpload: 'Upload logo',
    logoChange: 'Change logo',
    logoShape: 'Shape',
    shapeCircle: 'Circle',
    shapeRounded: 'Rounded',
    shapeSquare: 'Square',
    showLogo: 'Show logo',
    heroBg: 'Hero background',
    heroBgHint:
      'Upload a photo or video for the background. If both are set, video is shown. Images: jpg, png, webp… Video: video files only (mp4, webm…).',
    addVideo: 'Add video',
    addPhoto: 'Add photo',
    addVideoOverPhoto: 'Add video over photo',
    videoLoaded: 'Video loaded',
    videoShownInHero: 'Shown on hero',
    changeVideo: 'Change video',
    changePhoto: 'Change photo',
    photoBg: 'Photo background',
    remove: 'Remove',
    removeBg: 'Reset background (photo & video)',
    colorTopBar: 'Top bar background',
    colorNav: 'Navigation bar background',
    colorNavLinks: 'Menu links',
    colorSiteName: 'Salon name',
    colorTagline: 'Tagline',
    colorAddress: 'Address',
    colorContactOnline: '“Online” line',
    colorCallUs: '“Call us” line',
    colorPhone: 'Phone',
    colorHero1: 'Hero — title line 1',
    colorHero2: 'Hero — title line 2',
    colorHeroSub: 'Hero — subtitle',
    colorHeroBtnBorder: 'Hero — button border',
    byDefault: 'Default',
    colorsBlock: 'Colors',
    servicesBlockHint:
      'Edit titles and card text in the preview. Here — photo per card or no-photo mode.',
    serviceCardN: 'Card',
    servicePhoto: 'Photo',
    svcAllNoPhoto: 'All without photo',
    svcAllWithPhoto: 'All with photo area',
    colorSvcBlockTitle: 'Services block — title',
    colorSvcBlockSub: 'Services block — subtitle',
    colorSvcCardTitle: 'Card — title',
    colorSvcCardDesc: 'Card — description',
    colorSvcCardPrice: 'Card — price',
    aboutBlockHint:
      'Edit all three texts in the preview: Shift+Enter for a new line. Here — founder photo and colors.',
    aboutFounderPhoto: 'Founder photo (avatar)',
    aboutPhotoUpload: 'Upload photo',
    aboutPhotoChange: 'Change photo',
    colorAboutHeading: 'About — main headline',
    colorAboutBody: 'About — body text',
    colorAboutMission: 'About — mission / tagline',
    galleryBlockHint:
      'Gallery title and subtitle — in the preview. Set each section name here; up to 6 sections, 12 photos each.',
    galleryAddSection: 'Add section',
    galleryNewSection: 'New section',
    gallerySectionN: 'Section',
    gallerySectionLabel: 'Tab label',
    gallerySlotPhoto: 'Photo',
    galleryColorSection: 'Gallery colors',
    colorGalTitle: 'Title',
    colorGalSub: 'Subtitle',
    colorGalTabActive: 'Section tabs (one color)',
    subsBlockHint:
      'Edit the block title in the preview. Add subscriptions by discount; set the promo button link below.',
    subsHideBlock: 'Hide the Subscriptions block on the site',
    subsHideCta: 'Hide promo button in cards',
    subsCtaUrl: 'Promo button link',
    subsAddPreset: 'Add subscription',
    subsPickPlaceholder: 'Choose option (discount)',
    subsList: 'List',
    subsColorSection: 'Subscription colors',
    colorSubsBlockTitle: 'Block title',
    colorSubsCardTitle: 'Card — title',
    colorSubsCardDesc: 'Card — subtitle',
    colorSubsCardBgFrom: 'Card — background (from)',
    colorSubsCardBgTo: 'Card — background (to)',
    colorSubsCtaText: 'Promo button — text',
  },
  ro: {
    constructorTitle: 'Constructor site',
    back: 'Înapoi',
    fullSize: 'Dimensiune completă',
    save: 'Salvează',
    saved: 'Salvat ✓',
    close: 'Închide',
    allBlocks: 'Toate blocurile',
    chooseTheme: 'Alege tema',
    templateHeading: 'Șablon',
    editThisTheme: 'Editează această temă',
    templateLabel: 'Salon de masaj',
    restoreDesign: 'Restabiliți designul inițial',
    undoLast: 'Înapoi un pas',
    socialLinks: 'Linkuri rețele sociale',
    headerLogo: 'Logo (antet)',
    logoUpload: 'Încarcă logo',
    logoChange: 'Schimbă logo',
    logoShape: 'Formă',
    shapeCircle: 'Cerc',
    shapeRounded: 'Rotunjit',
    shapeSquare: 'Pătrat',
    showLogo: 'Arată logo',
    heroBg: 'Fundal hero',
    heroBgHint: 'Încărcați o imagine pentru fundal. Doar formate imagine: jpg, png, webp etc.',
    heroBgUpload: 'Încarcă fundalul',
    heroBgChange: 'Înlocuiește fundalul',
    removeBg: 'Elimină fundalul',
    remove: 'Elimină',
    colorTopBar: 'Fundal bară superioară',
    colorNav: 'Fundal meniu navigare',
    colorNavLinks: 'Linkuri meniu',
    colorSiteName: 'Nume salon',
    colorTagline: 'Slogan',
    colorAddress: 'Adresă',
    colorContactOnline: 'Rând „online”',
    colorCallUs: 'Rând „sună”',
    colorPhone: 'Telefon',
    colorHero1: 'Hero — titlu linia 1',
    colorHero2: 'Hero — titlu linia 2',
    colorHeroSub: 'Hero — subtitlu',
    colorHeroBtnBorder: 'Hero — margine buton',
    byDefault: 'Implicit',
    colorsBlock: 'Culori',
    servicesBlockHint:
      'Editați titlurile și textul în previzualizare. Aici — fotografie pentru fiecare card sau fără foto.',
    serviceCardN: 'Card',
    servicePhoto: 'Foto',
    svcAllNoPhoto: 'Toate fără foto',
    svcAllWithPhoto: 'Toate cu zonă foto',
    colorSvcBlockTitle: 'Bloc servicii — titlu',
    colorSvcBlockSub: 'Bloc servicii — subtitlu',
    colorSvcCardTitle: 'Card — titlu',
    colorSvcCardDesc: 'Card — descriere',
    colorSvcCardPrice: 'Card — preț',
    aboutBlockHint:
      'Editați cele trei texte în previzualizare: Shift+Enter pentru linie nouă. Aici — foto fondator și culori.',
    aboutFounderPhoto: 'Foto fondator (avatar)',
    aboutPhotoUpload: 'Încarcă foto',
    aboutPhotoChange: 'Schimbă foto',
    colorAboutHeading: 'Despre — titlu principal',
    colorAboutBody: 'Despre — text principal',
    colorAboutMission: 'Despre — misiune / semnătură',
    galleryBlockHint:
      'Titlul și subtitlul galeriei — în previzualizare. Numele fiecărei secțiuni — aici; până la 6 secțiuni, câte 12 fotografii.',
    galleryAddSection: 'Adaugă secțiune',
    galleryNewSection: 'Secțiune nouă',
    gallerySectionN: 'Secțiune',
    gallerySectionLabel: 'Nume filă',
    gallerySlotPhoto: 'Foto',
    galleryColorSection: 'Culori galerie',
    colorGalTitle: 'Titlu',
    colorGalSub: 'Subtitlu',
    colorGalTabActive: 'File secțiuni (o culoare)',
    subsBlockHint:
      'Titlul blocului îl editați în previzualizare. Adăugați abonamente după reducere; linkul butonului — mai jos.',
    subsHideBlock: 'Ascunde blocul „Abonamente” pe site',
    subsHideCta: 'Ascunde butonul promoției în carduri',
    subsCtaUrl: 'Link buton promoție',
    subsAddPreset: 'Adaugă abonament',
    subsPickPlaceholder: 'Alegeți varianta (reducere)',
    subsList: 'Listă',
    subsColorSection: 'Culori abonamente',
    colorSubsBlockTitle: 'Titlu bloc',
    colorSubsCardTitle: 'Card — titlu',
    colorSubsCardDesc: 'Card — subtitlu',
    colorSubsCardBgFrom: 'Card — fundal (start)',
    colorSubsCardBgTo: 'Card — fundal (final)',
    colorSubsCtaText: 'Buton promoție — text',
  },
}

const MAX_UNDO = 30

type UndoEntry = { key: string; prev: string }

function MassageColorRow({
  label,
  colorKey,
  currentId,
  onPick,
  byDefaultLabel,
}: {
  label: string
  colorKey: keyof MassageThemeColors
  currentId: string
  onPick: (key: keyof MassageThemeColors, id: string) => void
  byDefaultLabel: string
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5 items-center">
        {MASSAGE_HEADER_TEXT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={cn(
              'h-7 w-7 rounded-full border-2 transition shrink-0',
              currentId === opt.id ? 'border-primary ring-2 ring-primary/30' : 'border-border/50'
            )}
            style={{ backgroundColor: opt.color }}
            onClick={() => onPick(colorKey, opt.id)}
            title={opt.id}
          />
        ))}
        <button
          type="button"
          className="px-2 py-1 rounded-full border border-border/50 text-xs text-muted-foreground hover:bg-card/50"
          onClick={() => onPick(colorKey, 'default')}
        >
          {byDefaultLabel}
        </button>
      </div>
    </div>
  )
}

function setDraftStorage(key: string, value: string) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(MASSAGE_DRAFT_PREFIX + key, value)
}
function clearAllDrafts() {
  if (typeof window === 'undefined') return
  const toRemove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k?.startsWith(MASSAGE_DRAFT_PREFIX)) toRemove.push(k)
  }
  toRemove.forEach(k => localStorage.removeItem(k))
}

export default function MassageConstructorPage() {
  const navigate = useNavigate()
  const sLang: Lang = (typeof window !== 'undefined' ? localStorage.getItem('publicLang') as Lang : null) ?? 'ru'
  const s = UI[sLang] ?? UI.ru

  const [sideOpen, setSideOpen] = useState(true)
  const [saved, setSaved] = useState(false)
  const [panelStage, setPanelStage] = useState<'themes' | 'edit'>('themes')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [highlightBlockId, setHighlightBlockId] = useState<string | null>('header')
  const [poll, setPoll] = useState(0)
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([])
  const [isSubsPresetOpen, setIsSubsPresetOpen] = useState(false)
  const subsPresetDropdownRef = useRef<HTMLDivElement | null>(null)
  const siteName = typeof window !== 'undefined' ? (localStorage.getItem('businessName') || '') : ''

  const draft = useCallback((key: string) => getMassageDraft(key), [poll]) // eslint-disable-line react-hooks/exhaustive-deps

  const setDraft = useCallback((key: string, value: string) => {
    const prev = getMassageDraft(key)
    setUndoStack(stack => [...stack, { key, prev }].slice(-MAX_UNDO))
    setDraftStorage(key, value)
    setPoll(n => n + 1)
  }, [])

  const handleUndo = useCallback(() => {
    setUndoStack(stack => {
      if (stack.length === 0) return stack
      const last = stack[stack.length - 1]
      if (last.prev) {
        setDraftStorage(last.key, last.prev)
      } else {
        if (typeof window !== 'undefined') window.localStorage.removeItem(MASSAGE_DRAFT_PREFIX + last.key)
      }
      setPoll(n => n + 1)
      return stack.slice(0, -1)
    })
  }, [])

  const handleRestore = useCallback(() => {
    clearAllDrafts()
    setUndoStack([])
    setPoll(n => n + 1)
  }, [])

  const openFullSize = useCallback(() => {
    window.open('/massage-preview', '_blank')
  }, [])

  const handleSave = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const goToEdit = () => {
    setPanelStage('edit')
    setSelectedBlockId(null)
  }

  const goBackToThemes = () => {
    setPanelStage('themes')
    setSelectedBlockId(null)
  }

  const previewScrollRef = useRef<HTMLDivElement>(null)

  const scrollPreviewToBlock = useCallback((blockId: (typeof MASSAGE_BLOCKS)[number]['id']) => {
    const container = previewScrollRef.current
    const anchorId = MASSAGE_BLOCK_ANCHOR_BY_ID[blockId]
    if (!container || !anchorId) return
    const el = document.getElementById(anchorId)
    if (!el) return
    const rootRect = container.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    const top = elRect.top - rootRect.top + container.scrollTop
    container.scrollTo({ top, behavior: 'smooth' })
  }, [])

  /** Подсветка пункта «Все блоки» по текущей позиции скролла в превью */
  useEffect(() => {
    if (panelStage !== 'edit' || selectedBlockId !== null) return

    const container = previewScrollRef.current
    if (!container) return

    const getRelativeTop = (el: HTMLElement) => {
      const cr = container.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      return er.top - cr.top + container.scrollTop
    }

    let raf = 0
    const updateHighlight = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const scrollTop = container.scrollTop
        const threshold = scrollTop + Math.min(140, container.clientHeight * 0.12)
        let active: (typeof MASSAGE_BLOCKS)[number]['id'] = MASSAGE_BLOCKS[0].id
        for (const block of MASSAGE_BLOCKS) {
          const el = document.getElementById(MASSAGE_BLOCK_ANCHOR_BY_ID[block.id])
          if (!el) continue
          const top = getRelativeTop(el)
          if (top <= threshold) active = block.id
        }
        setHighlightBlockId(active)
      })
    }

    updateHighlight()
    container.addEventListener('scroll', updateHighlight, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateHighlight) : null
    ro?.observe(container)
    return () => {
      cancelAnimationFrame(raf)
      container.removeEventListener('scroll', updateHighlight)
      ro?.disconnect()
    }
  }, [panelStage, selectedBlockId, poll])

  const headerSiteName = draft('publicSiteName') || undefined
  const heroTitle1 = draft('publicHeroTitle1') || undefined
  const heroTitle2 = draft('publicHeroTitle2') || undefined
  const heroSub = draft('publicHeroSub') || undefined
  const headerPhone = draft('publicPhone') || undefined
  const headerAddress = draft('publicAddress') || undefined
  const headerTagline = draft('publicTagline') || undefined
  const headerCallUs = draft('publicCallUs') || undefined
  const headerContactOnline = draft('publicContactOnline') || undefined
  const telegramUrl = draft('publicTelegram')
  const viberUrl = draft('publicViber')
  const whatsappUrl = draft('publicWhatsapp')
  const instagramUrl = draft('publicInstagram')
  const facebookUrl = draft('publicFacebook')
  const vkUrl = draft('publicVk')
  const twitterUrl = draft('publicTwitter')
  const tiktokUrl = draft('publicTiktok')

  const massageThemeColors = useMemo(
    () => parseMassageThemeColors(getMassageDraft('publicMassageThemeColors')),
    [poll]
  )

  const setThemeColor = useCallback(
    (key: keyof MassageThemeColors, id: string) => {
      const prev = parseMassageThemeColors(getMassageDraft('publicMassageThemeColors'))
      const next = { ...prev } as Record<string, string | undefined>
      if (id === 'default') {
        delete next[key]
      } else {
        next[key] = id
      }
      setDraft('publicMassageThemeColors', JSON.stringify(next))
    },
    [setDraft]
  )

  const curColor = useCallback(
    (key: keyof MassageThemeColors) => massageThemeColors[key] || 'default',
    [massageThemeColors]
  )

  const applyServiceImage = useCallback(
    (index: number, dataUrl: string) => {
      const m = mergeMassageServicesFromDraft(sLang, getMassageDraft('publicMassageServicesJson'))
      m[index] = { ...m[index], image: dataUrl, hideImage: false }
      setDraft('publicMassageServicesJson', serializeMassageServicesForDraft(m))
    },
    [sLang, setDraft]
  )

  const applyAllServicesHideImage = useCallback(
    (hide: boolean) => {
      const m = mergeMassageServicesFromDraft(sLang, getMassageDraft('publicMassageServicesJson'))
      const next = m.map(row => ({
        ...row,
        hideImage: hide,
        image: hide ? undefined : row.image,
      }))
      setDraft('publicMassageServicesJson', serializeMassageServicesForDraft(next))
    },
    [sLang, setDraft]
  )

  const applyGalleryPhoto = useCallback(
    (sectionIndex: number, photoIndex: number, dataUrl: string) => {
      const cur = mergeMassageGalleryFromDraft(sLang, getMassageDraft('publicMassageGalleryJson'))
      const next = cur.map((row, i) => {
        if (i !== sectionIndex) return row
        const photos = [...row.photos]
        if (photoIndex >= 0 && photoIndex < MASSAGE_GALLERY_PHOTOS_PER_SECTION) {
          photos[photoIndex] = dataUrl
        }
        return { ...row, photos }
      })
      setDraft('publicMassageGalleryJson', serializeMassageGalleryForDraft(next))
    },
    [sLang, setDraft]
  )

  const appendGallerySection = useCallback(() => {
    const cur = mergeMassageGalleryFromDraft(sLang, getMassageDraft('publicMassageGalleryJson'))
    if (cur.length >= MASSAGE_GALLERY_MAX_SECTIONS) return
    const label = UI[sLang]?.galleryNewSection ?? 'New section'
    const next = [
      ...cur,
      {
        id: `g-${Date.now()}`,
        label,
        photos: Array(MASSAGE_GALLERY_PHOTOS_PER_SECTION).fill(null) as (string | null)[],
      },
    ]
    setDraft('publicMassageGalleryJson', serializeMassageGalleryForDraft(next))
  }, [sLang, setDraft])

  const setGallerySectionLabel = useCallback(
    (sectionIndex: number, label: string) => {
      const cur = mergeMassageGalleryFromDraft(sLang, getMassageDraft('publicMassageGalleryJson'))
      const clipped = label.slice(0, MASSAGE_GALLERY_TAB_LABEL_MAX)
      const next = cur.map((row, i) => (i === sectionIndex ? { ...row, label: clipped } : row))
      setDraft('publicMassageGalleryJson', serializeMassageGalleryForDraft(next))
    },
    [sLang, setDraft]
  )

  const removeSubItem = useCallback(
    (id: string) => {
      const cur = mergeMassageSubscriptionsFromDraft(sLang, getMassageDraft('publicMassageSubsJson'))
      const next = cur.filter(row => row.id !== id)
      setDraft('publicMassageSubsJson', serializeMassageSubscriptionsForDraft(next))
    },
    [sLang, setDraft]
  )

  const addSubPreset = useCallback(
    (templateIndex: number) => {
      const cur = mergeMassageSubscriptionsFromDraft(sLang, getMassageDraft('publicMassageSubsJson'))
      if (cur.some(x => x.templateIndex === templateIndex)) return
      const uniqCount = new Set(cur.map(x => x.templateIndex)).size
      if (uniqCount >= MASSAGE_SUBSCRIPTION_PRESET_COUNT) return
      const next = [...cur, { id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, templateIndex }]
      setDraft('publicMassageSubsJson', serializeMassageSubscriptionsForDraft(next))
    },
    [sLang, setDraft]
  )

  const hasDrafts = typeof window !== 'undefined' && (() => {
    for (let i = 0; i < localStorage.length; i++) {
      if (localStorage.key(i)?.startsWith(MASSAGE_DRAFT_PREFIX)) return true
    }
    return false
  })()

  const sidebarTitle =
    selectedBlockId
      ? (MASSAGE_BLOCKS.find(b => b.id === selectedBlockId)?.[sLang] ?? s.allBlocks)
      : panelStage === 'themes'
        ? s.chooseTheme
        : s.allBlocks

  /** Одна верхняя кнопка «назад»: из блока → к списку блоков, из списка → к выбору темы */
  const handleSidebarBack = () => {
    if (selectedBlockId != null) setSelectedBlockId(null)
    else goBackToThemes()
  }

  useEffect(() => {
    if (!isSubsPresetOpen) return
    const onDocDown = (e: MouseEvent) => {
      if (!subsPresetDropdownRef.current) return
      const target = e.target as Node | null
      if (target && !subsPresetDropdownRef.current.contains(target)) {
        setIsSubsPresetOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [isSubsPresetOpen])

  useEffect(() => {
    if (selectedBlockId !== 'subscriptions') setIsSubsPresetOpen(false)
  }, [selectedBlockId])

  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      <header className="border-b border-border/50 bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/60 shrink-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/settings')} className="shrink-0" aria-label={s.back}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate">{s.constructorTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={openFullSize}>
              <Maximize2 className="h-4 w-4" />
              {s.fullSize}
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {saved ? s.saved : s.save}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn('shrink-0', sideOpen && 'bg-primary/10 border-primary/30')}
              onClick={() => setSideOpen(o => !o)}
              aria-label={sideOpen ? s.close : s.allBlocks}
            >
              <PanelRightOpen className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden relative">
        <div className="flex-1 min-w-0 min-h-0 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 min-w-0 min-h-0 rounded-xl border border-border/50 bg-card/20 overflow-hidden shadow-inner relative">
            <div
              ref={previewScrollRef}
              className="absolute inset-0 overflow-auto scrollbar-hide"
              data-scroll-container
            >
              <MassageTemplate
                siteName={siteName}
                lang={sLang}
                isEditMode={panelStage === 'edit'}
                {...(panelStage === 'edit'
                  ? {
                      headerSiteName,
                      heroTitle1,
                      heroTitle2,
                      heroSub,
                      headerPhone,
                      headerAddress,
                      headerTagline,
                      headerCallUs,
                      headerContactOnline,
                      telegramUrl,
                      viberUrl,
                      whatsappUrl,
                      instagramUrl,
                      facebookUrl,
                      vkUrl,
                      twitterUrl,
                      tiktokUrl,
                      heroImage: draft('publicMassageHeroBg') || null,
                      heroVideo: draft('publicMassageHeroVideo') || null,
                      headerLogoUrl: draft('publicLogo') || null,
                      headerLogoShape:
                        (draft('publicHeaderLogoShape') as 'circle' | 'rounded' | 'square') || 'circle',
                      headerLogoVisible: draft('publicHeaderLogoVisible') !== 'false',
                      massageThemeColors,
                      massageSvcTitle: draft('publicMassageSvcTitle') || undefined,
                      massageSvcSub: draft('publicMassageSvcSub') || undefined,
                      massageServicesJson: draft('publicMassageServicesJson') || undefined,
                      massageAboutTitle: draft('publicMassageAboutTitle') || undefined,
                      massageAboutText: draft('publicMassageAboutText') || undefined,
                      massageAboutMission: draft('publicMassageAboutMission') || undefined,
                      massageAboutAvatar: draft('publicMassageAboutAvatar') || null,
                      massageAboutAvatarPan: draft('publicMassageAboutAvatarPan') || undefined,
                      massageGalTitle: draft('publicMassageGalTitle') || undefined,
                      massageGalSub: draft('publicMassageGalSub') || undefined,
                      massageGalleryJson: draft('publicMassageGalleryJson') || undefined,
                      massageSubsTitle: draft('publicMassageSubsTitle') || undefined,
                      massageSubsJson: draft('publicMassageSubsJson') || undefined,
                      massageSubsCtaUrl: draft('publicMassageSubsCtaUrl') || undefined,
                      massageSubsCtaHidden: draft('publicMassageSubsCtaHidden') || undefined,
                      massageSubsHidden: draft('publicMassageSubsHidden') || undefined,
                      onSaveDraft: setDraft,
                    }
                  : {})}
              />
            </div>
          </div>
        </div>

        <div
          className={cn(
            'absolute top-4 right-4 bottom-4 z-30 w-[280px] flex flex-col overflow-hidden rounded-xl isolate',
            'border border-border/50 bg-card shadow-xl',
            'transition-[transform] duration-300 ease-out',
            sideOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'
          )}
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border/40 shrink-0">
            <span className="font-semibold text-foreground text-sm truncate">{sidebarTitle}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={() => setSideOpen(false)} aria-label={s.close}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-4 scrollbar-hide">
            {panelStage === 'themes' && (
              <>
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-4 w-full text-center">
                    {s.templateHeading}
                  </h3>
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/20 shadow-[0_0_14px_rgba(59,130,246,0.45)] ring-2 ring-primary/40 overflow-hidden"
                      aria-hidden
                    >
                      <Gem className="h-6 w-6 text-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                    </span>
                    <span className="text-center text-sm font-bold text-foreground leading-tight max-w-[200px]">
                      {s.templateLabel}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-2 border-t border-border/40">
                  <Button className="w-full gap-2" onClick={goToEdit}>
                    <Pencil className="h-4 w-4" />
                    {s.editThisTheme}
                  </Button>
                </div>
              </>
            )}

            {panelStage === 'edit' && (
              <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground shrink-0"
                  onClick={handleSidebarBack}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {selectedBlockId != null ? s.back : s.chooseTheme}
                </Button>

                {selectedBlockId == null && (
                  <div className="w-full flex flex-col min-h-0 shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-px flex-1 bg-border/50 shrink-0" />
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                        {s.allBlocks}
                      </h3>
                      <span className="h-px flex-1 bg-border/50 shrink-0" />
                    </div>
                    <ul className="space-y-2">
                      {MASSAGE_BLOCKS.map(block => (
                        <li key={block.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setHighlightBlockId(block.id)
                              setSelectedBlockId(block.id)
                              scrollPreviewToBlock(block.id)
                            }}
                            className={cn(
                              'w-full rounded-none border-2 px-4 py-3 text-sm font-bold text-center transition',
                              'border-border/50 bg-card/30 text-foreground hover:bg-card/50 hover:border-primary/50',
                              highlightBlockId === block.id &&
                                'border-primary/70 bg-primary/10 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                            )}
                          >
                            {block[sLang]}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedBlockId === 'header' && (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 px-1">
                      {sLang === 'ru'
                        ? 'Нажмите на текст в превью, чтобы отредактировать'
                        : sLang === 'ro'
                          ? 'Faceți clic pe text în previzualizare pentru a edita'
                          : 'Click on text in the preview to edit'}
                    </p>

                    {/* Логотип */}
                    <section className="space-y-2 pb-3 border-b border-border/50">
                      <h4 className="text-sm font-semibold text-foreground">{s.headerLogo}</h4>
                      <input
                        id="massage-constructor-header-logo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file || !file.type.startsWith('image/')) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const result = typeof reader.result === 'string' ? reader.result : ''
                            if (!result) return
                            compressImageForLogo(result, dataUrl => {
                              setDraft('publicLogo', dataUrl)
                            })
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="massage-constructor-header-logo"
                          className={cn(
                            'cursor-pointer shrink-0 overflow-hidden border border-border/50 flex items-center justify-center bg-muted/30 hover:border-primary/50',
                            (draft('publicHeaderLogoShape') || 'circle') === 'circle'
                              ? 'h-14 w-14 rounded-full'
                              : (draft('publicHeaderLogoShape') || 'circle') === 'rounded'
                                ? 'h-14 w-14 rounded-xl'
                                : 'h-14 w-14 rounded-none'
                          )}
                        >
                          {draft('publicLogo') ? (
                            <img src={draft('publicLogo')} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          )}
                        </label>
                        <label
                          htmlFor="massage-constructor-header-logo"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-xs font-medium cursor-pointer"
                        >
                          {draft('publicLogo') ? s.logoChange : s.logoUpload}
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ['circle', s.shapeCircle],
                            ['rounded', s.shapeRounded],
                            ['square', s.shapeSquare],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setDraft('publicHeaderLogoShape', value)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                              (draft('publicHeaderLogoShape') || 'circle') === value
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border/50 bg-card/30 text-muted-foreground hover:bg-card/50'
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft('publicHeaderLogoVisible') !== 'false'}
                          onChange={e => setDraft('publicHeaderLogoVisible', e.target.checked ? 'true' : 'false')}
                          className="h-3.5 w-3.5 rounded border-border/60 bg-card"
                        />
                        <span>{s.showLogo}</span>
                      </label>
                    </section>

                    {/* Фон hero: фото + видео (как в основном конструкторе) */}
                    <section className="space-y-3 pb-3 border-b border-border/50">
                      <h4 className="text-sm font-semibold text-foreground">{s.heroBg}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{s.heroBgHint}</p>
                      {(() => {
                        const heroImage = draft('publicMassageHeroBg')
                        const heroVideo = draft('publicMassageHeroVideo')
                        const onPickVideo = (e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file || !file.type.startsWith('video/')) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const r = typeof reader.result === 'string' ? reader.result : ''
                            if (r) setDraft('publicMassageHeroVideo', r)
                          }
                          reader.readAsDataURL(file)
                        }
                        const onPickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file || !file.type.startsWith('image/')) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const result = typeof reader.result === 'string' ? reader.result : ''
                            if (!result) return
                            compressImageForHeroBg(result, dataUrl => {
                              setDraft('publicMassageHeroBg', dataUrl)
                            })
                          }
                          reader.readAsDataURL(file)
                        }
                        return (
                          <div className="space-y-3">
                            {heroVideo ? (
                              <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                                <div className="relative h-20 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Video className="h-5 w-5 text-white/70" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-white/80">{s.videoLoaded}</p>
                                    <p className="text-[11px] text-white/40 mt-0.5">{s.videoShownInHero}</p>
                                  </div>
                                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <div className="flex flex-wrap gap-2 p-2 bg-zinc-900/80">
                                  <input
                                    id="massage-constructor-hero-video"
                                    type="file"
                                    accept="video/*"
                                    className="sr-only"
                                    onChange={onPickVideo}
                                  />
                                  <label
                                    htmlFor="massage-constructor-hero-video"
                                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-white/70 cursor-pointer transition-colors"
                                  >
                                    <Video className="h-3.5 w-3.5 shrink-0" /> {s.changeVideo}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setDraft('publicMassageHeroVideo', '')}
                                    className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors"
                                  >
                                    {s.remove}
                                  </button>
                                </div>
                              </div>
                            ) : heroImage ? (
                              <div className="rounded-xl overflow-hidden border border-border/40">
                                <div className="relative h-20 bg-black">
                                  <img src={heroImage} alt="" className="h-full w-full object-cover opacity-90" />
                                  <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white/90 bg-black/50 px-1.5 py-0.5 rounded">
                                    {s.photoBg}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 p-2 bg-card/60">
                                  <input
                                    id="massage-constructor-hero-photo"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={onPickPhoto}
                                  />
                                  <label
                                    htmlFor="massage-constructor-hero-photo"
                                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-card/20 hover:bg-card/40 text-xs font-medium text-foreground/80 cursor-pointer transition-colors"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5 shrink-0" /> {s.changePhoto}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setDraft('publicMassageHeroBg', '')}
                                    className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors"
                                  >
                                    {s.remove}
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            {!heroVideo && !heroImage && (
                              <div className="flex flex-col gap-2">
                                <input
                                  id="massage-constructor-hero-video-empty"
                                  type="file"
                                  accept="video/*"
                                  className="sr-only"
                                  onChange={onPickVideo}
                                />
                                <label
                                  htmlFor="massage-constructor-hero-video-empty"
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors"
                                >
                                  <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span>{s.addVideo}</span>
                                </label>
                                <input
                                  id="massage-constructor-hero-photo-empty"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={onPickPhoto}
                                />
                                <label
                                  htmlFor="massage-constructor-hero-photo-empty"
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors"
                                >
                                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span>{s.addPhoto}</span>
                                </label>
                              </div>
                            )}

                            {!heroVideo && heroImage && (
                              <div>
                                <input
                                  id="massage-constructor-hero-video-over"
                                  type="file"
                                  accept="video/*"
                                  className="sr-only"
                                  onChange={onPickVideo}
                                />
                                <label
                                  htmlFor="massage-constructor-hero-video-over"
                                  className="w-full inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border/50 bg-card/10 hover:border-primary/40 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors text-muted-foreground"
                                >
                                  <Video className="h-4 w-4 shrink-0" />
                                  <span>{s.addVideoOverPhoto}</span>
                                </label>
                              </div>
                            )}

                            {(heroVideo || heroImage) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => {
                                  setDraft('publicMassageHeroVideo', '')
                                  setDraft('publicMassageHeroBg', '')
                                }}
                              >
                                {s.removeBg}
                              </Button>
                            )}
                          </div>
                        )
                      })()}
                    </section>

                    {/* Палитры */}
                    <section className="space-y-3 pb-3 border-b border-border/50">
                      <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                      <MassageColorRow
                        label={s.colorTopBar}
                        colorKey="topBarBg"
                        currentId={curColor('topBarBg')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorNav}
                        colorKey="navBg"
                        currentId={curColor('navBg')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorNavLinks}
                        colorKey="navLink"
                        currentId={curColor('navLink')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorSiteName}
                        colorKey="siteName"
                        currentId={curColor('siteName')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorTagline}
                        colorKey="tagline"
                        currentId={curColor('tagline')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorAddress}
                        colorKey="address"
                        currentId={curColor('address')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactOnline}
                        colorKey="contactOnline"
                        currentId={curColor('contactOnline')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorCallUs}
                        colorKey="callUs"
                        currentId={curColor('callUs')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorPhone}
                        colorKey="phone"
                        currentId={curColor('phone')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorHero1}
                        colorKey="heroLine1"
                        currentId={curColor('heroLine1')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorHero2}
                        colorKey="heroLine2"
                        currentId={curColor('heroLine2')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorHeroSub}
                        colorKey="heroSub"
                        currentId={curColor('heroSub')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorHeroBtnBorder}
                        colorKey="heroCtaBorder"
                        currentId={curColor('heroCtaBorder')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>

                    <section className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">{s.socialLinks}</h4>
                      <div className="space-y-2">
                        {SOCIAL_FIELDS.map(f => (
                          <div key={f.key} className="space-y-1">
                            <label className="text-xs text-muted-foreground">{f.label}</label>
                            <input
                              type="text"
                              value={draft(f.key)}
                              onChange={e => setDraft(f.key, e.target.value)}
                              placeholder={f.placeholder}
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {selectedBlockId === 'services' && (() => {
                  const mergedSvc = mergeMassageServicesFromDraft(sLang, draft('publicMassageServicesJson'))
                  return (
                    <div className="flex min-h-0 flex-1 flex-col gap-3 w-full">
                      <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.servicesBlockHint}</p>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => applyAllServicesHideImage(true)}
                        >
                          {s.svcAllNoPhoto}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => applyAllServicesHideImage(false)}
                        >
                          {s.svcAllWithPhoto}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1 shrink-0">
                        {mergedSvc.length}/{MASSAGE_SERVICES_MAX}
                      </p>
                      <div className="min-h-[min(52vh,560px)] flex-1 basis-0 overflow-y-auto overflow-x-hidden rounded-lg border border-border/40 bg-muted/10 py-2 px-1.5 space-y-3 scrollbar-hide">
                        {mergedSvc.map((row, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-border/50 p-2.5 space-y-2 bg-card/30"
                          >
                            <div className="text-xs font-semibold text-foreground">
                              {s.serviceCardN} {i + 1}
                            </div>
                            {row.image && !row.hideImage ? (
                              <div className="relative h-14 w-full rounded-md overflow-hidden border border-border/40">
                                <img src={row.image} alt="" className="h-full w-full object-cover" />
                              </div>
                            ) : null}
                            <input
                              id={`massage-svc-img-${i}`}
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={e => {
                                const file = e.target.files?.[0]
                                e.target.value = ''
                                if (!file?.type.startsWith('image/')) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const r = typeof reader.result === 'string' ? reader.result : ''
                                  if (!r) return
                                  compressImageForLogo(r, dataUrl => applyServiceImage(i, dataUrl))
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                            <label
                              htmlFor={`massage-svc-img-${i}`}
                              className="flex w-full items-center justify-center gap-2 px-2 py-2 rounded-lg border border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-xs font-medium cursor-pointer"
                            >
                              <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                              {s.servicePhoto}
                            </label>
                          </div>
                        ))}
                      </div>
                      <section className="space-y-3 pt-2 border-t border-border/50 shrink-0">
                        <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                        <MassageColorRow
                          label={s.colorSvcBlockTitle}
                          colorKey="svcBlockTitle"
                          currentId={curColor('svcBlockTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSvcBlockSub}
                          colorKey="svcBlockSub"
                          currentId={curColor('svcBlockSub')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSvcCardTitle}
                          colorKey="svcCardTitle"
                          currentId={curColor('svcCardTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSvcCardDesc}
                          colorKey="svcCardDesc"
                          currentId={curColor('svcCardDesc')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSvcCardPrice}
                          colorKey="svcCardPrice"
                          currentId={curColor('svcCardPrice')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                      </section>
                    </div>
                  )
                })()}

                {selectedBlockId === 'about' && (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.aboutBlockHint}</p>
                    <section className="space-y-3 pb-3 border-b border-border/50 shrink-0">
                      <h4 className="text-sm font-semibold text-foreground">{s.aboutFounderPhoto}</h4>
                      <input
                        id="massage-constructor-about-avatar"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file || !file.type.startsWith('image/')) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const result = typeof reader.result === 'string' ? reader.result : ''
                            if (!result) return
                            compressImageForLogo(result, dataUrl => {
                              setDraft('publicMassageAboutAvatar', dataUrl)
                            })
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="massage-constructor-about-avatar"
                          className="cursor-pointer shrink-0 overflow-hidden border border-border/50 flex items-center justify-center bg-muted/30 hover:border-primary/50 h-20 w-20 rounded-full"
                        >
                          {draft('publicMassageAboutAvatar') ? (
                            <img
                              src={draft('publicMassageAboutAvatar')}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          )}
                        </label>
                        <div className="flex flex-col gap-2 min-w-0">
                          <label
                            htmlFor="massage-constructor-about-avatar"
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-xs font-medium cursor-pointer"
                          >
                            {draft('publicMassageAboutAvatar') ? s.aboutPhotoChange : s.aboutPhotoUpload}
                          </label>
                          {draft('publicMassageAboutAvatar') ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => setDraft('publicMassageAboutAvatar', '')}
                            >
                              {s.remove}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </section>
                    <section className="space-y-3 shrink-0">
                      <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                      <MassageColorRow
                        label={s.colorAboutHeading}
                        colorKey="aboutHeading"
                        currentId={curColor('aboutHeading')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorAboutBody}
                        colorKey="aboutBody"
                        currentId={curColor('aboutBody')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorAboutMission}
                        colorKey="aboutMission"
                        currentId={curColor('aboutMission')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>
                  </>
                )}

                {selectedBlockId === 'gallery' && (() => {
                  const mergedGal = mergeMassageGalleryFromDraft(sLang, draft('publicMassageGalleryJson'))
                  return (
                    <div className="flex w-full flex-col gap-3">
                      <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.galleryBlockHint}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 shrink-0"
                        disabled={mergedGal.length >= MASSAGE_GALLERY_MAX_SECTIONS}
                        onClick={appendGallerySection}
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        {s.galleryAddSection} ({mergedGal.length}/{MASSAGE_GALLERY_MAX_SECTIONS})
                      </Button>
                      <div className="flex flex-col gap-3">
                        {mergedGal.map((sec, si) => (
                          <div
                            key={sec.id}
                            className="rounded-lg border border-border/50 p-2.5 space-y-2 bg-card/30"
                          >
                            <div className="text-xs font-semibold text-foreground">
                              {s.gallerySectionN} {si + 1}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground" htmlFor={`massage-gal-sec-name-${sec.id}`}>
                                {s.gallerySectionLabel}
                              </label>
                              <input
                                id={`massage-gal-sec-name-${sec.id}`}
                                type="text"
                                value={sec.label}
                                onChange={e => setGallerySectionLabel(si, e.target.value)}
                                maxLength={MASSAGE_GALLERY_TAB_LABEL_MAX}
                                className="w-full min-w-0 px-2.5 py-2 rounded-lg border border-border/50 text-sm bg-card/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {sec.photos.map((ph, pi) => (
                                <div key={`${sec.id}-${pi}`} className="relative min-w-0">
                                  <input
                                    id={`massage-gal-${sec.id}-${pi}`}
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={e => {
                                      const file = e.target.files?.[0]
                                      e.target.value = ''
                                      if (!file?.type.startsWith('image/')) return
                                      const reader = new FileReader()
                                      reader.onload = () => {
                                        const r = typeof reader.result === 'string' ? reader.result : ''
                                        if (!r) return
                                        compressImageForLogo(r, dataUrl => applyGalleryPhoto(si, pi, dataUrl))
                                      }
                                      reader.readAsDataURL(file)
                                    }}
                                  />
                                  <label
                                    htmlFor={`massage-gal-${sec.id}-${pi}`}
                                    className={cn(
                                      'flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-[10px] leading-tight cursor-pointer overflow-hidden',
                                      ph && 'border-solid border-border/40 p-0'
                                    )}
                                  >
                                    {ph ? (
                                      <img src={ph} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="px-0.5 text-center text-muted-foreground">
                                        {pi + 1}
                                      </span>
                                    )}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <section className="space-y-3 shrink-0 border-t border-border/50 pt-3 mt-1">
                        <h4 className="text-sm font-semibold text-foreground">{s.galleryColorSection}</h4>
                        <MassageColorRow
                          label={s.colorGalTitle}
                          colorKey="galTitle"
                          currentId={curColor('galTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorGalSub}
                          colorKey="galSub"
                          currentId={curColor('galSub')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorGalTabActive}
                          colorKey="galTabActive"
                          currentId={curColor('galTabActive')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                      </section>
                    </div>
                  )
                })()}

                {selectedBlockId === 'subscriptions' && (() => {
                  const mergedSubs = mergeMassageSubscriptionsFromDraft(sLang, draft('publicMassageSubsJson'))
                  const presets = MASSAGE_SUBSCRIPTION_PRESETS[sLang] ?? MASSAGE_SUBSCRIPTION_PRESETS.ru
                  const availableIdx = Array.from({ length: MASSAGE_SUBSCRIPTION_PRESET_COUNT }, (_, i) => i).filter(
                    i => !mergedSubs.some(m => m.templateIndex === i)
                  )
                  return (
                    <div className="flex w-full flex-col gap-3">
                      <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.subsBlockHint}</p>
                      <label className="flex items-center gap-2 cursor-pointer text-sm shrink-0">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={draft('publicMassageSubsHidden') === 'true'}
                          onChange={e => setDraft('publicMassageSubsHidden', e.target.checked ? 'true' : 'false')}
                        />
                        <span>{s.subsHideBlock}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm shrink-0">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={draft('publicMassageSubsCtaHidden') === 'true'}
                          onChange={e => setDraft('publicMassageSubsCtaHidden', e.target.checked ? 'true' : 'false')}
                        />
                        <span>{s.subsHideCta}</span>
                      </label>
                      <div className="space-y-1.5 shrink-0">
                        <label className="text-xs text-muted-foreground" htmlFor="massage-subs-cta-url">
                          {s.subsCtaUrl}
                        </label>
                        <input
                          id="massage-subs-cta-url"
                          type="url"
                          value={draft('publicMassageSubsCtaUrl')}
                          onChange={e => setDraft('publicMassageSubsCtaUrl', e.target.value)}
                          placeholder="https://"
                          className="w-full px-2.5 py-2 rounded-lg border border-border/50 text-sm bg-card/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div className="space-y-2 shrink-0">
                        <span className="text-xs font-medium text-foreground">{s.subsAddPreset}</span>
                        <div ref={subsPresetDropdownRef} className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 justify-between bg-card/40 backdrop-blur-sm border-border/50"
                            onClick={() => setIsSubsPresetOpen(v => !v)}
                            disabled={availableIdx.length === 0}
                          >
                            <span className="text-sm text-muted-foreground">
                              {availableIdx.length > 0 ? s.subsPickPlaceholder : sLang === 'ru' ? 'Все варианты уже добавлены' : sLang === 'ro' ? 'Toate variantele sunt deja adăugate' : 'All options already added'}
                            </span>
                            <ChevronDown className={cn('w-4 h-4 transition-transform', isSubsPresetOpen && 'rotate-180')} />
                          </Button>
                          {isSubsPresetOpen && availableIdx.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                              <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                                {availableIdx.map(i => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      addSubPreset(i)
                                      setIsSubsPresetOpen(false)
                                    }}
                                    className="w-full px-3 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 transition-colors"
                                  >
                                    <span className="font-semibold">{presets[i].pct}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-foreground">{s.subsList}</span>
                        <ul className="space-y-2">
                          {mergedSubs.map((row) => {
                            const p = presets[row.templateIndex] ?? presets[0]
                            return (
                              <li
                                key={row.id}
                                className="flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 p-2.5"
                              >
                                <div className="min-w-0 flex-1 text-xs">
                                  <span className="font-semibold text-foreground">{p.pct}</span>
                                  <span className="text-muted-foreground"> — </span>
                                  <span className="text-foreground/90">{p.title}</span>
                                </div>
                                <button
                                  type="button"
                                  className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/70 bg-red-500/10 text-red-600 shadow-sm transition-all hover:-translate-y-px hover:border-red-500 hover:bg-red-500/15 hover:shadow-md"
                                  aria-label={s.remove}
                                  onClick={() => removeSubItem(row.id)}
                                >
                                  <span className="inline-flex h-4 w-4 items-center justify-center text-[18px] font-medium leading-none translate-y-[-0.5px] transition-transform group-hover:scale-105">×</span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <section className="space-y-3 shrink-0 border-t border-border/50 pt-3 mt-1">
                        <h4 className="text-sm font-semibold text-foreground">{s.subsColorSection}</h4>
                        <MassageColorRow
                          label={s.colorSubsBlockTitle}
                          colorKey="subsBlockTitle"
                          currentId={curColor('subsBlockTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCardTitle}
                          colorKey="subsCardTitle"
                          currentId={curColor('subsCardTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCardDesc}
                          colorKey="subsCardDesc"
                          currentId={curColor('subsCardDesc')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCardBgFrom}
                          colorKey="subsCardBgFrom"
                          currentId={curColor('subsCardBgFrom')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCardBgTo}
                          colorKey="subsCardBgTo"
                          currentId={curColor('subsCardBgTo')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCtaText}
                          colorKey="subsCtaText"
                          currentId={curColor('subsCtaText')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                      </section>
                    </div>
                  )
                })()}

                {selectedBlockId !== null &&
                  selectedBlockId !== 'header' &&
                  selectedBlockId !== 'services' &&
                  selectedBlockId !== 'about' &&
                  selectedBlockId !== 'gallery' &&
                  selectedBlockId !== 'subscriptions' && (
                  <div className="flex flex-col items-center justify-center gap-4 text-center py-12">
                    <div className="h-14 w-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center">
                      <svg className="h-6 w-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">
                      {sLang === 'ru'
                        ? 'Настройки этого блока появятся позже'
                        : sLang === 'ro'
                          ? 'Setările acestui bloc vor apărea mai târziu'
                          : 'Settings for this block coming soon'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {panelStage === 'edit' && (
            <div className="shrink-0 p-3 border-t border-border/40 bg-card">
              {selectedBlockId === null ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-red-400/70 bg-red-500/20 text-white hover:bg-red-500/30 hover:border-red-400 hover:text-white disabled:opacity-50 disabled:text-white/80"
                  disabled={!hasDrafts}
                  onClick={handleRestore}
                >
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  {s.restoreDesign}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 border-red-400/70 bg-red-500/20 text-white hover:bg-red-500/30 hover:border-red-400 hover:text-white disabled:opacity-50 disabled:text-white/80"
                  disabled={undoStack.length === 0}
                  onClick={handleUndo}
                >
                  <Undo2 className="h-4 w-4 shrink-0" />
                  {s.undoLast}
                </Button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
