/** Конструктор v1 — шаблоны сохранены для конструктора v2 (см. docs/CONSTRUCTOR-V2-PLAN.md, src/templates-v1/README.md) */
import React, { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Bell, Copy, ExternalLink, ChevronDown, PenLine } from 'lucide-react'
import QRCode from 'qrcode'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  HAIR_THEME_DEFAULT_BOOKING_TITLE,
  HAIR_THEME_DEFAULT_BOOKING_SUBTITLE,
  HAIR_DEFAULTS_BY_LANG,
  DEFAULT_WORLD_MAP_EMBED_URL,
  FOOTER_DEFAULT_ADDRESS,
} from '@/lib/hair-theme-defaults'
import heroImage from '@/assets/images/constructor-images/pexels-emirhan-sayar-478511598-35844822.jpg'
import iconMarketing from '@/assets/images/constructor-images/free-icon-marketing-10476712.png'
import { getMassageTemplateSlot } from '@/lib/massage-draft'
import { PREMIUM_MASSAGE_SLOT } from '@/lib/massage-template-registry'
import type { PublicSiteLang } from '@/lib/public-site-langs'
import { displayFooterFieldStored, serializeFooterFieldForStorage } from '@/lib/public-footer-field-empty'

const slugify = (value: string) => {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'salon'
}

const draftKey = (key: string) => `draft_${key}`
const getDraftValue = (key: string) => localStorage.getItem(draftKey(key))
const getDraftOrPublic = (key: string, fallback = '') =>
  getDraftValue(key) ?? localStorage.getItem(key) ?? fallback

function readFooterClearableField(key: string, fallback: string): string {
  return displayFooterFieldStored(getDraftOrPublic(key, fallback))
}
const setDraftValue = (key: string, value: string) => {
  localStorage.setItem(draftKey(key), value)
}
const removeDraftValue = (key: string) => {
  localStorage.removeItem(draftKey(key))
}

function themeStorageId(themeId: string): string {
  if (!themeId) return 'hair'
  return themeId.startsWith('premium-') ? themeId.replace('premium-', '') : themeId
}

function getSalonSlugForDrafts(): string {
  if (typeof window === 'undefined') return 'salon'
  return localStorage.getItem('publicSlug') || 'salon'
}

/** Читает то же, что PublicPage.readPublic для lang-scoped полей салона (slug + theme + publicLang). */
function readOrdinaryLangScopedDraft(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback
  const slug = getSalonSlugForDrafts()
  const themeRaw =
    getDraftValue('publicHeaderTheme') ||
    localStorage.getItem('draft_publicHeaderTheme') ||
    localStorage.getItem('publicHeaderTheme') ||
    'hair'
  const tid = themeStorageId(themeRaw)
  const lang = (localStorage.getItem('publicLang') as PublicSiteLang) || 'ru'
  const withLang = `draft_${key}_${slug}_${tid}_${lang}`
  let v = localStorage.getItem(withLang)
  if (v === null && lang === 'ru') {
    v = localStorage.getItem(`draft_${key}_${slug}_${tid}`)
  }
  if (v !== null) return v
  return getDraftOrPublic(key, fallback)
}

function writeOrdinaryLangScopedDraftTriplet(
  headerTheme: string,
  primaryCta: string,
  secondaryCta: string,
  footerLabelsJson: string,
) {
  if (typeof window === 'undefined') return
  const slug = getSalonSlugForDrafts()
  const tid = themeStorageId(headerTheme)
  const lang = (localStorage.getItem('publicLang') as PublicSiteLang) || 'ru'
  const write = (key: string, value: string) => {
    const base = `draft_${key}_${slug}_${tid}`
    localStorage.setItem(`${base}_${lang}`, value)
    if (lang === 'ru') localStorage.setItem(base, value)
  }
  write('publicHeaderPrimaryCta', primaryCta)
  write('publicHeaderSecondaryCta', secondaryCta)
  write('publicFooterLabels', footerLabelsJson)
}

const settingsText = {
  ru: {
    notificationsTitle: 'Уведомления',
    emailNotificationsTitle: 'Email уведомления',
    confirmationClient: 'Подтверждение записи клиенту',
    reminder24h: 'Напоминание за 24 часа (у вас)',
    reminder1h: 'Напоминание за 1 час (у вас)',
    ownerNotification: 'Уведомлять владельца о новых записях',
    telegramNotificationsTitle: 'Telegram уведомления',
    enableTelegramNotifications: 'Включить Telegram уведомления',
    telegramConnectHint: 'Для подключения Telegram:',
    connectTelegramBot: 'Подключить Telegram бота',
    publicPageTitle: 'Публичная страница',
    viewClientFlow: 'Посмотреть клиентский флоу',
    publicPageDataTitle: 'Данные публичной страницы',
    serviceNameLabel: 'Название сервиса',
    taglineLabel: 'Слоган',
    phoneLabel: 'Телефон',
    emailLabel: 'Email',
    footerAddressLabel: 'Адрес для футера',
    workingDaysLabel: 'Дни работы',
    fromLabel: 'С',
    toLabel: 'По',
    timeLabel: 'Время',
    dayOffLabel: 'Выходной',
    logoLabel: 'Логотип (публичная страница)',
    noLogo: 'Нет',
    changeLogo: 'Изменить логотип',
    uploadLogo: 'Загрузить логотип',
    logoCircle: 'Круг',
    logoSquare: 'Квадрат',
    pageUrlLabel: 'URL вашей страницы',
    copy: 'Копировать',
    open: 'Открыть',
    qrLabel: 'QR код для печати на визитках и в салоне',
    qrPlaceholder: 'QR код',
    downloadQr: 'Скачать QR код',
    galleryLabel: 'Фотографии салона (до 9)',
    deletePhotoAria: 'Удалить фото',
    upload: 'Загрузить',
    galleryHint: 'Фото появятся в клиентском флоу только после загрузки хотя бы одной картинки.',
    locationTitle: 'Локация вашего бизнеса',
    addressPlaceholder: 'Адрес',
    searchPlaceholder: 'Поиск...',
    geolocationLoading: 'Определяем геопозицию...',
    enableGeolocation: 'Включить геопозицию',
    openGoogleMaps: 'Открыть в Google Maps',
    previewSite: 'Предпросмотр сайта',
    saveChanges: 'Сохранить изменения',
    geoNotAvailable: 'Геопозиция недоступна в этом браузере',
    geoLowAccuracy: 'Низкая точность GPS ({accuracy} м). Включите GPS и попробуйте снова.',
    geoFailed: 'Не удалось получить геопозицию. Разрешите доступ и попробуйте снова.',
    constructorTitle: 'Конструктор сайта',
    constructorSubtitle: 'Одна структура, полная кастомизация для салона красоты.',
    constructorTabHeader: 'Хедер',
    constructorTabHero: 'Хиро',
    constructorTabServices: 'Услуги',
    constructorTabGallery: 'Галерея',
    constructorTabReviews: 'Отзывы',
    constructorTabFooter: 'Футер',
    constructorActiveSection: 'Активный блок',
    constructorBackgroundTitle: 'Фон всего сайта',
    constructorBuiltInBackgrounds: 'Встроенные фоны',
    constructorUploadBackground: 'Загрузить фон',
    constructorFontsTitle: 'Шрифты',
    constructorHeaderNameLabel: 'Название салона',
    constructorHeroTitleLabel: 'Заголовок',
    constructorHeroSubtitleLabel: 'Подзаголовок',
    constructorCtaLabel: 'Текст кнопки',
    constructorSectionHint: 'Настройки блока будут доступны здесь.',
    constructorHeaderBuilderTitle: 'Хедер сайта',
    constructorHeaderBuilderHint: 'Редактируйте текст прямо в превью.',
    constructorHeaderEditHint: 'Кликните по тексту и начните ввод.',
    constructorHeaderPreviewLabel: 'Превью',
    constructorHeaderMenuLabel: 'Меню',
    constructorGalleryCarousel: 'Карусель',
    constructorGalleryGrid: 'Сетка',
    constructorGallerySlots: 'Слоты (до 5)',
    weekDaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    dayOffSuffix: ' — выходной',
    defaultHours: 'Пн–Сб, 09:00–19:00',
    defaultDayOff: 'Вс — выходной',
    salonSiteCardTitle: 'Сайт вашего салона',
    salonSiteCardDescription:
      'Соберите страницу из блоков в конструкторе — шапка, галерея, запись и карта. Результат виден сразу.',
    salonSiteConstructorCta: 'Конструктор',
    salonSiteOpenSite: 'Открыть сайт',
  },
  en: {
    notificationsTitle: 'Notifications',
    emailNotificationsTitle: 'Email notifications',
    confirmationClient: 'Client appointment confirmation',
    reminder24h: 'Reminder 24 hours before (to you)',
    reminder1h: 'Reminder 1 hour before (to you)',
    ownerNotification: 'Notify owner about new appointments',
    telegramNotificationsTitle: 'Telegram notifications',
    enableTelegramNotifications: 'Enable Telegram notifications',
    telegramConnectHint: 'To connect Telegram:',
    connectTelegramBot: 'Connect Telegram bot',
    publicPageTitle: 'Public page',
    viewClientFlow: 'Open client flow',
    publicPageDataTitle: 'Public page data',
    serviceNameLabel: 'Service name',
    taglineLabel: 'Tagline',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    footerAddressLabel: 'Footer address',
    workingDaysLabel: 'Working days',
    fromLabel: 'From',
    toLabel: 'To',
    timeLabel: 'Time',
    dayOffLabel: 'Day off',
    logoLabel: 'Logo (public page)',
    noLogo: 'No',
    changeLogo: 'Change logo',
    uploadLogo: 'Upload logo',
    logoCircle: 'Circle',
    logoSquare: 'Square',
    pageUrlLabel: 'Your page URL',
    copy: 'Copy',
    open: 'Open',
    qrLabel: 'QR code for printing on cards and in the salon',
    qrPlaceholder: 'QR code',
    downloadQr: 'Download QR code',
    galleryLabel: 'Salon photos (up to 9)',
    deletePhotoAria: 'Delete photo',
    upload: 'Upload',
    galleryHint: 'Photos appear in the client flow only after at least one image is uploaded.',
    locationTitle: 'Business location',
    addressPlaceholder: 'Address',
    searchPlaceholder: 'Search...',
    geolocationLoading: 'Detecting geolocation...',
    enableGeolocation: 'Enable geolocation',
    openGoogleMaps: 'Open in Google Maps',
    previewSite: 'Preview site',
    saveChanges: 'Save changes',
    geoNotAvailable: 'Geolocation is not available in this browser',
    geoLowAccuracy: 'Low GPS accuracy ({accuracy} m). Enable GPS and try again.',
    geoFailed: 'Failed to get geolocation. Allow access and try again.',
    constructorTitle: 'Website builder',
    constructorSubtitle: 'One structure, full customization for beauty salons.',
    constructorTabHeader: 'Header',
    constructorTabHero: 'Hero',
    constructorTabServices: 'Services',
    constructorTabGallery: 'Gallery',
    constructorTabReviews: 'Reviews',
    constructorTabFooter: 'Footer',
    constructorActiveSection: 'Active block',
    constructorBackgroundTitle: 'Site background',
    constructorBuiltInBackgrounds: 'Built-in backgrounds',
    constructorUploadBackground: 'Upload background',
    constructorFontsTitle: 'Fonts',
    constructorHeaderNameLabel: 'Salon name',
    constructorHeroTitleLabel: 'Title',
    constructorHeroSubtitleLabel: 'Subtitle',
    constructorCtaLabel: 'Button text',
    constructorSectionHint: 'Block settings will be available here.',
    constructorHeaderBuilderTitle: 'Site header',
    constructorHeaderBuilderHint: 'Edit text directly in the preview.',
    constructorHeaderEditHint: 'Click on text and start typing.',
    constructorHeaderPreviewLabel: 'Preview',
    constructorHeaderMenuLabel: 'Menu',
    constructorGalleryCarousel: 'Carousel',
    constructorGalleryGrid: 'Grid',
    constructorGallerySlots: 'Slots (up to 5)',
    weekDaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    dayOffSuffix: ' — day off',
    defaultHours: 'Mon–Sat, 09:00–19:00',
    defaultDayOff: 'Sun — day off',
    salonSiteCardTitle: 'Your salon website',
    salonSiteCardDescription:
      'Build your page from blocks in the builder — header, gallery, booking, and map. See the result instantly.',
    salonSiteConstructorCta: 'Builder',
    salonSiteOpenSite: 'Open website',
  },
  ro: {
    notificationsTitle: 'Notificări',
    emailNotificationsTitle: 'Notificări email',
    confirmationClient: 'Confirmarea programării clientului',
    reminder24h: 'Memento cu 24 de ore înainte (pentru dvs.)',
    reminder1h: 'Memento cu 1 oră înainte (pentru dvs.)',
    ownerNotification: 'Anunță proprietarul despre programări noi',
    telegramNotificationsTitle: 'Notificări Telegram',
    enableTelegramNotifications: 'Activează notificările Telegram',
    telegramConnectHint: 'Pentru conectarea Telegram:',
    connectTelegramBot: 'Conectează botul Telegram',
    publicPageTitle: 'Pagina publică',
    viewClientFlow: 'Deschide fluxul clienților',
    publicPageDataTitle: 'Datele paginii publice',
    serviceNameLabel: 'Numele serviciului',
    taglineLabel: 'Slogan',
    phoneLabel: 'Telefon',
    emailLabel: 'Email',
    footerAddressLabel: 'Adresă în subsol',
    workingDaysLabel: 'Zile lucrătoare',
    fromLabel: 'De la',
    toLabel: 'Până la',
    timeLabel: 'Ore',
    dayOffLabel: 'Zi liberă',
    logoLabel: 'Logo (pagina publică)',
    noLogo: 'Nu',
    changeLogo: 'Schimbă logo-ul',
    uploadLogo: 'Încarcă logo',
    logoCircle: 'Cerc',
    logoSquare: 'Pătrat',
    pageUrlLabel: 'URL-ul paginii dvs.',
    copy: 'Copiază',
    open: 'Deschide',
    qrLabel: 'Cod QR pentru tipărire pe cărți și în salon',
    qrPlaceholder: 'Cod QR',
    downloadQr: 'Descarcă codul QR',
    galleryLabel: 'Fotografii salon (până la 9)',
    deletePhotoAria: 'Șterge fotografia',
    upload: 'Încarcă',
    galleryHint: 'Fotografiile apar în fluxul clienților doar după încărcarea a cel puțin unei imagini.',
    locationTitle: 'Locația afacerii',
    addressPlaceholder: 'Adresă',
    searchPlaceholder: 'Căutare...',
    geolocationLoading: 'Se detectează geolocația...',
    enableGeolocation: 'Activează geolocația',
    openGoogleMaps: 'Deschide în Google Maps',
    previewSite: 'Previzualizare site',
    saveChanges: 'Salvează modificările',
    geoNotAvailable: 'Geolocația nu este disponibilă în acest browser',
    geoLowAccuracy: 'Acuratețe GPS scăzută ({accuracy} m). Activați GPS și încercați din nou.',
    geoFailed: 'Nu s-a putut obține geolocația. Permiteți accesul și încercați din nou.',
    constructorTitle: 'Constructor site',
    constructorSubtitle: 'O singură structură, personalizare completă pentru saloane.',
    constructorTabHeader: 'Header',
    constructorTabHero: 'Hero',
    constructorTabServices: 'Servicii',
    constructorTabGallery: 'Galerie',
    constructorTabReviews: 'Recenzii',
    constructorTabFooter: 'Footer',
    constructorActiveSection: 'Bloc activ',
    constructorBackgroundTitle: 'Fundalul site-ului',
    constructorBuiltInBackgrounds: 'Fundaluri încorporate',
    constructorUploadBackground: 'Încarcă fundal',
    constructorFontsTitle: 'Fonturi',
    constructorHeaderNameLabel: 'Numele salonului',
    constructorHeroTitleLabel: 'Titlu',
    constructorHeroSubtitleLabel: 'Subtitlu',
    constructorCtaLabel: 'Text buton',
    constructorSectionHint: 'Setările blocului vor fi disponibile aici.',
    constructorHeaderBuilderTitle: 'Header site',
    constructorHeaderBuilderHint: 'Editează textul direct în previzualizare.',
    constructorHeaderEditHint: 'Apasă pe text și începe să scrii.',
    constructorHeaderPreviewLabel: 'Previzualizare',
    constructorHeaderMenuLabel: 'Meniu',
    constructorGalleryCarousel: 'Carusel',
    constructorGalleryGrid: 'Grilă',
    constructorGallerySlots: 'Sloturi (max 5)',
    weekDaysShort: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'],
    dayOffSuffix: ' — zi liberă',
    defaultHours: 'Lu–Sa, 09:00–19:00',
    defaultDayOff: 'Du — zi liberă',
    salonSiteCardTitle: 'Site-ul salonului tău',
    salonSiteCardDescription:
      'Construiește pagina din blocuri în constructor — antet, galerie, programare și hartă. Rezultatul se vede imediat.',
    salonSiteConstructorCta: 'Constructor',
    salonSiteOpenSite: 'Deschide site-ul',
  },
} as const

export default function Settings() {
  const { language } = useLanguage()
  const st = (<T extends keyof typeof settingsText.ru>(key: T): typeof settingsText.ru[T] =>
    (settingsText[language]?.[key] ?? settingsText.ru[key]) as typeof settingsText.ru[T])
  const weekDays = [...(settingsText[language]?.weekDaysShort ?? settingsText.ru.weekDaysShort)]
  const dayOffSuffixes = Object.values(settingsText).map((item) => item.dayOffSuffix)
  const stripDayOffSuffix = (value: string) =>
    dayOffSuffixes.reduce((acc, suffix) => acc.replace(suffix, ''), value).trim()
  const getWeekDayIndex = (value: string) => {
    const lists: string[][] = Object.values(settingsText).map((item) => [...item.weekDaysShort])
    for (const list of lists) {
      const index = list.indexOf(value)
      if (index !== -1) return index
    }
    return -1
  }

  const location = useLocation()
  const navigate = useNavigate()
  const notificationsRef = useRef<HTMLDivElement>(null)
  const headerTitleRef = useRef<HTMLHeadingElement>(null)
  const headerSubtitleRef = useRef<HTMLParagraphElement>(null)
  const headerSubtitleInputRef = useRef<HTMLTextAreaElement>(null)
  const headerPrimaryCtaRef = useRef<HTMLSpanElement>(null)
  const headerSecondaryCtaRef = useRef<HTMLSpanElement>(null)
  const hoursFromRef = useRef<HTMLDivElement>(null)
  const hoursToRef = useRef<HTMLDivElement>(null)
  const hoursStartRef = useRef<HTMLDivElement>(null)
  const hoursEndRef = useRef<HTMLDivElement>(null)
  const dayOffRef = useRef<HTMLDivElement>(null)
  const addressRef = useRef<HTMLDivElement>(null)
  const skipNextAddressSearchRef = useRef(false)

  const MAX_HEADER_SUBTITLE_LINES = 4
  const normalizeHeaderSubtitle = (value: string) =>
    value.replace(/[\u200B\uFEFF]/g, '').replace(/\r\n|\r/g, '\n')
  const clampHeaderSubtitleLines = (value: string) => {
    const normalized = normalizeHeaderSubtitle(value)
    const lines = normalized.split('\n')
    return lines.length > MAX_HEADER_SUBTITLE_LINES ? lines.slice(0, MAX_HEADER_SUBTITLE_LINES).join('\n') : normalized
  }
  const getHeaderSubtitleLineCount = (value: string) => normalizeHeaderSubtitle(value).split('\n').length
  const _insertHeaderSubtitleBreak = () => {
    if (!headerSubtitleInputRef.current) return
    const currentText = headerSubtitleInputRef.current.value || ''
    if (getHeaderSubtitleLineCount(currentText) >= MAX_HEADER_SUBTITLE_LINES) return

    const input = headerSubtitleInputRef.current
    const start = input.selectionStart ?? currentText.length
    const end = input.selectionEnd ?? currentText.length
    const nextValue = clampHeaderSubtitleLines(
      `${currentText.slice(0, start)}\n${currentText.slice(end)}`
    )
    updateHeaderSubtitleValue(nextValue)
    requestAnimationFrame(() => {
      if (!headerSubtitleInputRef.current) return
      const nextPos = Math.min(start + 1, headerSubtitleInputRef.current.value.length)
      headerSubtitleInputRef.current.focus()
      headerSubtitleInputRef.current.setSelectionRange(nextPos, nextPos)
      resizeHeaderSubtitleInput()
    })
  }
  
  const [business] = useState(() => {
    const storedName = typeof window !== 'undefined' ? localStorage.getItem('businessName') : null
    return {
      name: storedName || 'Luxe Studio',
      description: 'Professional beauty services',
      logo: null as File | null,
      primary_color: '#1a1a1a',
      phone: '+373 123 456 789',
      address: 'Chisinau, str. Example 1',
      email: 'jane@luxestudio.com',
    }
  })

  const [notificationSettings, setNotificationSettings] = useState({
    email: {
      confirmation: true,
      reminder24h: true,
      reminder1h: false,
      ownerNotification: true,
    },
    telegram: {
      enabled: false,
      ownerNotification: true,
    },
  })
  const [publicWorks, setPublicWorks] = useState<string[]>(() => {
    return [1, 2, 3, 4, 5].map((idx) => getDraftOrPublic(`publicWorks${idx}`, ''))
  })
  const [qrCodeUrl, setQrCodeUrl] = useState('')
  const [publicPage, setPublicPage] = useState(() => ({
    name: getDraftOrPublic('publicName', business.name),
    tagline: getDraftOrPublic('publicTagline', business.description),
    phone: readFooterClearableField('publicPhone', business.phone),
    email: readFooterClearableField('publicEmail', business.email),
    footerAddress: readFooterClearableField('publicFooterAddress', business.address),
    address: readFooterClearableField('publicAddress', business.address),
    placeName: getDraftOrPublic('publicPlaceName', ''),
    telegram: getDraftOrPublic('publicTelegram', ''),
    viber: getDraftOrPublic('publicViber', ''),
    instagram: getDraftOrPublic('publicInstagram', ''),
    hours: readFooterClearableField('publicHours', st('defaultHours')),
    dayOff: readFooterClearableField('publicDayOff', st('defaultDayOff')),
    mapLat: getDraftOrPublic('publicMapLat', '47.0105'),
    mapLng: getDraftOrPublic('publicMapLng', '28.8575'),
    logo: getDraftOrPublic('publicLogo', ''),
    logoShape:
      (getDraftOrPublic('publicLogoShape') as 'circle' | 'rounded' | 'square') || 'circle',
  }))
  const [headerSubtitleLineCount, setHeaderSubtitleLineCount] = useState(() =>
    getHeaderSubtitleLineCount(getDraftOrPublic('publicTagline', business.description))
  )
  const updateHeaderSubtitleValue = (rawValue: string) => {
    const nextValue = clampHeaderSubtitleLines(rawValue)
    setPublicPage((prev) => ({
      ...prev,
      tagline: nextValue,
    }))
    setHeaderSubtitleLineCount(getHeaderSubtitleLineCount(nextValue))
  }
  const resizeHeaderSubtitleInput = () => {
    if (!headerSubtitleInputRef.current) return
    const el = headerSubtitleInputRef.current
    const styles = window.getComputedStyle(el)
    const lineHeight = Number.parseFloat(styles.lineHeight || '0') || 14
    const paddingTop = Number.parseFloat(styles.paddingTop || '0') || 0
    const paddingBottom = Number.parseFloat(styles.paddingBottom || '0') || 0
    const lines = Math.max(1, (el.value || '').split('\n').length)
    el.style.height = 'auto'
    el.style.height = `${Math.ceil(lineHeight * lines + paddingTop + paddingBottom)}px`
    el.style.width = 'auto'
    el.style.width = `${Math.max(120, Math.ceil(el.scrollWidth + 2))}px`
  }
  const _headerSubtitleBreaksMaxed = headerSubtitleLineCount >= MAX_HEADER_SUBTITLE_LINES
  const defaultHeaderBuilder = {
    brand: publicPage.name || business.name,
    menu: [],
    heroTitle: publicPage.name || business.name,
    heroSubtitle: publicPage.tagline || business.description,
    primaryCta: st('viewClientFlow'),
    secondaryCta: st('openGoogleMaps'),
    background: heroImage,
  }
  const [headerBuilder] = useState<{
    brand: string
    menu: string[]
    heroTitle: string
    heroSubtitle: string
    primaryCta: string
    secondaryCta: string
    background: string
  }>(() => {
    const stored = localStorage.getItem('headerBuilder')
    if (!stored) return defaultHeaderBuilder
    try {
      const parsed = JSON.parse(stored)
      const brand = typeof parsed?.brand === 'string' ? parsed.brand : defaultHeaderBuilder.brand
      const heroTitle = typeof parsed?.heroTitle === 'string' ? parsed.heroTitle : defaultHeaderBuilder.heroTitle
      const heroSubtitle = typeof parsed?.heroSubtitle === 'string' ? parsed.heroSubtitle : defaultHeaderBuilder.heroSubtitle
      const primaryCta = typeof parsed?.primaryCta === 'string' ? parsed.primaryCta : defaultHeaderBuilder.primaryCta
      const secondaryCta = typeof parsed?.secondaryCta === 'string' ? parsed.secondaryCta : defaultHeaderBuilder.secondaryCta
      const background =
        typeof parsed?.background === 'string' && parsed.background.trim().length > 0
          ? parsed.background
          : defaultHeaderBuilder.background
      const menu = Array.isArray(parsed?.menu)
        ? parsed.menu.filter((item: unknown) => typeof item === 'string').slice(0, 6)
        : defaultHeaderBuilder.menu
      return {
        brand,
        menu: menu.length ? menu : defaultHeaderBuilder.menu,
        heroTitle,
        heroSubtitle,
        primaryCta,
        secondaryCta,
        background,
      }
    } catch {
      return defaultHeaderBuilder
    }
  })
  const [_constructorSection, _setConstructorSection] = useState('hero')
  const [constructorBackground, setConstructorBackground] = useState(() => ({
    id: localStorage.getItem('constructorBackgroundId') || 'soft',
    custom: localStorage.getItem('constructorBackgroundCustom') || '',
  }))
  const [constructorFont, _setConstructorFont] = useState(
    localStorage.getItem('constructorFontId') || 'modern'
  )
  const [constructorCopy, _setConstructorCopy] = useState(() => ({
    businessName: localStorage.getItem('constructorBusinessName') || business.name,
    heroTitle: localStorage.getItem('constructorHeroTitle') || 'Студия красоты, где вам комфортно',
    heroSubtitle:
      localStorage.getItem('constructorHeroSubtitle') ||
      'Премиальные услуги, внимательный сервис и атмосфера, в которую хочется возвращаться.',
    ctaText: localStorage.getItem('constructorCtaText') || 'Записаться',
  }))
  const settingsHairDef = HAIR_DEFAULTS_BY_LANG[(language as 'ru' | 'en' | 'ro')] ?? HAIR_DEFAULTS_BY_LANG.ru
  const [bookingPreview, _setBookingPreview] = useState(() => ({
    title:
      localStorage.getItem('constructorBookingTitle') || settingsHairDef.bookingTitle,
    subtitle:
      localStorage.getItem('constructorBookingSubtitle') ||
      settingsHairDef.bookingSub,
  }))
  const [headerCtas, setHeaderCtas] = useState(() => ({
    primary: readOrdinaryLangScopedDraft('publicHeaderPrimaryCta', 'Записаться онлайн'),
    secondary: readOrdinaryLangScopedDraft('publicHeaderSecondaryCta', 'Где нас найти?'),
  }))
  const [headerCtaShapes, setHeaderCtaShapes] = useState(() => ({
    primary:
      (getDraftOrPublic('publicHeaderPrimaryCtaShape') as 'square' | 'round') || 'square',
    secondary:
      (getDraftOrPublic('publicHeaderSecondaryCtaShape') as 'square' | 'round') || 'square',
  }))
  /** Тот же порядок и те же id для названия, описания и кнопок */
  const barberTextOptions = [
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
  const barberButtonOptions = [
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
  const [barberHeaderColors, setBarberHeaderColors] = useState(() => {
    const stored = getDraftOrPublic('publicHeaderBarberColors')
    if (!stored) {
      return {
        title: 'default',
        subtitle: 'default',
        primary: 'default',
        secondary: 'default',
      }
    }
    try {
      const parsed = JSON.parse(stored)
      const mapLegacy = (v: string) => {
        if (v === 'amber') return 'orange'
        if (v === 'ice') return 'blue'
        if (v === 'silver') return 'red'
        if (v === 'rose') return 'pink'
        if (v === 'mint') return 'emerald'
        if (v === 'neon') return 'emerald'
        if (v === 'cyan') return 'white'
        return v
      }
      return {
        title: mapLegacy(typeof parsed?.title === 'string' ? parsed.title : 'default'),
        subtitle: mapLegacy(typeof parsed?.subtitle === 'string' ? parsed.subtitle : 'default'),
        primary: mapLegacy(typeof parsed?.primary === 'string' ? parsed.primary : 'default'),
        secondary: mapLegacy(typeof parsed?.secondary === 'string' ? parsed.secondary : 'default'),
      }
    } catch {
      return {
        title: 'default',
        subtitle: 'default',
        primary: 'default',
        secondary: 'default',
      }
    }
  })
  const [headerLogoShape, _setHeaderLogoShape] = useState(() => (
    (getDraftOrPublic('publicHeaderLogoShape') as 'circle' | 'rounded' | 'square') || 'circle'
  ))
  const [headerLogoPlacement, _setHeaderLogoPlacement] = useState(() => (
    (getDraftOrPublic('publicHeaderLogoPlacement') as 'corner' | 'left' | 'above' | 'corner-left-title') ||
      'above'
  ))
  const [headerLogoVisible, _setHeaderLogoVisible] = useState(
    getDraftOrPublic('publicHeaderLogoVisible', 'true') !== 'false'
  )
  const [footerLogoVisible, _setFooterLogoVisible] = useState(
    getDraftOrPublic('publicFooterLogoVisible', 'true') !== 'false'
  )
  const [headerTheme, setHeaderTheme] = useState(
    getDraftOrPublic('publicHeaderTheme', 'hair')
  )
  useEffect(() => {
    resizeHeaderSubtitleInput()
  }, [publicPage.tagline, headerTheme])
  const [headerCustomImage, setHeaderCustomImage] = useState(
    getDraftOrPublic('publicHeroImage', '')
  )
  const [bodyBackgroundChoice, _setBodyBackgroundChoice] = useState(
    getDraftOrPublic('publicBodyBackgroundChoice', 'bg-2')
  )
  const [footerLabels, _setFooterLabels] = useState(() => {
    const stored = readOrdinaryLangScopedDraft('publicFooterLabels', '')
    if (!stored) {
      return {
        address: 'Адрес',
        schedule: 'График',
        phone: 'Телефон',
        email: 'Почта',
      }
    }
    try {
      const parsed = JSON.parse(stored)
      return {
        address: parsed?.address || 'Адрес',
        schedule: parsed?.schedule || 'График',
        phone: parsed?.phone || 'Телефон',
        email: parsed?.email || 'Почта',
      }
    } catch {
      return {
        address: 'Адрес',
        schedule: 'График',
        phone: 'Телефон',
        email: 'Почта',
      }
    }
  })
  const [footerVisibility, _setFooterVisibility] = useState(() => {
    const stored = getDraftOrPublic('publicFooterVisibility')
    if (!stored) {
      return { address: true, schedule: true, dayOff: true, phone: true, email: true }
    }
    try {
      const parsed = JSON.parse(stored)
      return {
        address: parsed?.address !== false,
        schedule: parsed?.schedule !== false,
        dayOff: parsed?.dayOff !== false,
        phone: parsed?.phone !== false,
        email: parsed?.email !== false,
      }
    } catch {
      return { address: true, schedule: true, dayOff: true, phone: true, email: true }
    }
  })
  const [sectionVisibility, _setSectionVisibility] = useState(() => {
    const stored = getDraftOrPublic('publicSectionVisibility')
    if (!stored) {
      return { gallery: true, works: true, reviews: true, map: true }
    }
    try {
      const parsed = JSON.parse(stored)
      return {
        gallery: parsed?.gallery !== false,
        works: parsed?.works !== false,
        reviews: parsed?.reviews !== false,
        map: parsed?.map !== false,
      }
    } catch {
      return { gallery: true, works: true, reviews: true, map: true }
    }
  })
  const [socialVisibility, _setSocialVisibility] = useState(() => {
    const stored = getDraftOrPublic('publicSocialVisibility')
    if (!stored) {
      return { telegram: true, viber: true, instagram: true }
    }
    try {
      const parsed = JSON.parse(stored)
      return {
        telegram: parsed?.telegram !== false,
        viber: parsed?.viber !== false,
        instagram: parsed?.instagram !== false,
      }
    } catch {
      return { telegram: true, viber: true, instagram: true }
    }
  })
  const [galleryLayout] = useState(
    localStorage.getItem('constructorGalleryLayout') || 'carousel'
  )
  const [addressQuery, setAddressQuery] = useState(() => (
    localStorage.getItem('publicAddress') || business.address
  ))
  const [addressResults, setAddressResults] = useState<any[]>([])
  const [isAddressOpen, setIsAddressOpen] = useState(false)
  const [isAddressLoading, setIsAddressLoading] = useState(false)
  const [isAddressFocused, setIsAddressFocused] = useState(false)
  const [isGeolocating, setIsGeolocating] = useState(false)
  const [geolocationError, setGeolocationError] = useState<string | null>(null)

  useEffect(() => {
    if (location.state?.scrollTo === 'notifications' && notificationsRef.current) {
      setTimeout(() => {
        notificationsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [location.state])

  useEffect(() => {
    setPublicPage((prev) => ({
      ...prev,
      name: prev.name || business.name,
      tagline: prev.tagline || business.description,
      phone: prev.phone || business.phone,
      email: prev.email || business.email,
      footerAddress: prev.footerAddress || business.address,
      address: prev.address || business.address,
    }))
  }, [business.name, business.description, business.phone, business.email, business.address])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (hoursFromRef.current && !hoursFromRef.current.contains(target)) setIsHoursFromOpen(false)
      if (hoursToRef.current && !hoursToRef.current.contains(target)) setIsHoursToOpen(false)
      if (hoursStartRef.current && !hoursStartRef.current.contains(target)) setIsHoursStartOpen(false)
      if (hoursEndRef.current && !hoursEndRef.current.contains(target)) setIsHoursEndOpen(false)
      if (dayOffRef.current && !dayOffRef.current.contains(target)) setIsDayOffOpen(false)
      if (addressRef.current && !addressRef.current.contains(target)) {
        setIsAddressOpen(false)
        setIsAddressFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (skipNextAddressSearchRef.current) {
      skipNextAddressSearchRef.current = false
      return
    }
    if (!addressQuery || addressQuery.trim().length < 3) {
      setAddressResults([])
      setIsAddressLoading(false)
      return
    }

    setIsAddressLoading(true)
    const handle = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=${language}&q=${encodeURIComponent(addressQuery)}`
        )
        const data = await response.json()
        const items = Array.isArray(data) ? data : []
        const scored = items
          .map((item) => {
            const address = item.address || {}
            const score =
              (address.house_number ? 3 : 0) +
              (address.road || address.pedestrian || address.footway ? 2 : 0) +
              (address.city || address.town || address.village ? 1 : 0)
            return { item, score }
          })
          .sort((a, b) => b.score - a.score)
          .map((entry) => entry.item)
        setAddressResults(scored)
        if (isAddressFocused) setIsAddressOpen(true)
      } catch (error) {
        console.error('Address search failed:', error)
        setAddressResults([])
      } finally {
        setIsAddressLoading(false)
      }
    }, 350)

    return () => clearTimeout(handle)
  }, [addressQuery, isAddressFocused])



  const formatAddressShort = (result: any) => {
    const address = result.address || {}
    const city =
      address.city ||
      address.town ||
      address.village ||
      address.state ||
      ''
    const district = address.suburb || address.district || address.neighbourhood || ''
    const street = address.road || address.pedestrian || address.footway || ''
    const house = address.house_number || ''
    const country = address.country || ''

    const line = [street, house].filter(Boolean).join(' ')
    const tail = [district, city].filter(Boolean).join(', ')
    if (!line) return ''
    return [line, tail, country].filter(Boolean).join(', ')
  }

  useEffect(() => {
    setDraftValue('publicName', publicPage.name)
    setDraftValue('publicTagline', publicPage.tagline)
    setDraftValue('publicPhone', serializeFooterFieldForStorage(publicPage.phone))
    setDraftValue('publicEmail', serializeFooterFieldForStorage(publicPage.email))
    setDraftValue('publicFooterAddress', serializeFooterFieldForStorage(publicPage.footerAddress))
    setDraftValue('publicAddress', serializeFooterFieldForStorage(publicPage.address))
    setDraftValue('publicPlaceName', publicPage.placeName)
    setDraftValue('publicTelegram', publicPage.telegram)
    setDraftValue('publicViber', publicPage.viber)
    setDraftValue('publicInstagram', publicPage.instagram)
    setDraftValue('publicHours', serializeFooterFieldForStorage(publicPage.hours))
    setDraftValue('publicDayOff', serializeFooterFieldForStorage(publicPage.dayOff))
    setDraftValue('publicMapLat', publicPage.mapLat)
    setDraftValue('publicMapLng', publicPage.mapLng)
    setDraftValue('publicLogoShape', publicPage.logoShape)
    if (publicPage.logo) {
      setDraftValue('publicLogo', publicPage.logo)
    } else {
      removeDraftValue('publicLogo')
    }
  }, [publicPage])
  useEffect(() => {
    localStorage.setItem('headerBuilder', JSON.stringify(headerBuilder))
  }, [headerBuilder])
  useEffect(() => {
    localStorage.setItem('constructorBackgroundId', constructorBackground.id)
    if (constructorBackground.custom) {
      localStorage.setItem('constructorBackgroundCustom', constructorBackground.custom)
    } else {
      localStorage.removeItem('constructorBackgroundCustom')
    }
  }, [constructorBackground])
  useEffect(() => {
    setDraftValue('publicHeaderTheme', headerTheme)
  }, [headerTheme])
  useEffect(() => {
    setDraftValue('publicBodyBackgroundChoice', bodyBackgroundChoice)
  }, [bodyBackgroundChoice])
  useEffect(() => {
    setDraftValue('publicHeaderPrimaryCta', headerCtas.primary)
    setDraftValue('publicHeaderSecondaryCta', headerCtas.secondary)
    setDraftValue('publicFooterLabels', JSON.stringify(footerLabels))
    writeOrdinaryLangScopedDraftTriplet(
      headerTheme,
      headerCtas.primary,
      headerCtas.secondary,
      JSON.stringify(footerLabels),
    )
  }, [headerCtas, footerLabels, headerTheme])
  useEffect(() => {
    setDraftValue('publicHeaderPrimaryCtaShape', headerCtaShapes.primary)
    setDraftValue('publicHeaderSecondaryCtaShape', headerCtaShapes.secondary)
  }, [headerCtaShapes])
  useEffect(() => {
    setDraftValue('publicHeaderLogoShape', headerLogoShape)
  }, [headerLogoShape])
  useEffect(() => {
    setDraftValue('publicHeaderLogoPlacement', headerLogoPlacement)
  }, [headerLogoPlacement])
  useEffect(() => {
    setDraftValue('publicHeaderLogoVisible', String(headerLogoVisible))
  }, [headerLogoVisible])
  useEffect(() => {
    setDraftValue('publicFooterLogoVisible', String(footerLogoVisible))
  }, [footerLogoVisible])
  useEffect(() => {
    setDraftValue('publicHeaderBarberColors', JSON.stringify(barberHeaderColors))
  }, [barberHeaderColors])
  useEffect(() => {
    setDraftValue('publicFooterVisibility', JSON.stringify(footerVisibility))
  }, [footerVisibility])
  useEffect(() => {
    setDraftValue('publicSocialVisibility', JSON.stringify(socialVisibility))
  }, [socialVisibility])
  useEffect(() => {
    setDraftValue('publicSectionVisibility', JSON.stringify(sectionVisibility))
  }, [sectionVisibility])
  useEffect(() => {
    setDraftValue('publicBookingTitle', bookingPreview.title)
    setDraftValue('publicBookingSubtitle', bookingPreview.subtitle)
  }, [bookingPreview])
  useEffect(() => {
    setDraftValue('publicGalleryLayout', galleryLayout)
  }, [galleryLayout])
  useEffect(() => {
    if (headerTheme === 'custom' && headerCustomImage) {
      setDraftValue('publicHeroImage', headerCustomImage)
    } else {
      removeDraftValue('publicHeroImage')
    }
  }, [headerTheme, headerCustomImage])

  useEffect(() => {
    localStorage.setItem('constructorFontId', constructorFont)
  }, [constructorFont])

  useEffect(() => {
    localStorage.setItem('constructorBusinessName', constructorCopy.businessName)
    localStorage.setItem('constructorHeroTitle', constructorCopy.heroTitle)
    localStorage.setItem('constructorHeroSubtitle', constructorCopy.heroSubtitle)
    localStorage.setItem('constructorCtaText', constructorCopy.ctaText)
  }, [constructorCopy])
  useEffect(() => {
    localStorage.setItem('constructorBookingTitle', bookingPreview.title)
    localStorage.setItem('constructorBookingSubtitle', bookingPreview.subtitle)
  }, [bookingPreview])
  useEffect(() => {
    localStorage.setItem('constructorGalleryLayout', galleryLayout)
  }, [galleryLayout])

  const publicSlug = slugify(publicPage.name || business.name || 'salon')
  const publicUrl = `yoursite.com/b/${publicSlug}`
  const publicShareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${import.meta.env.BASE_URL}b/${publicSlug}`
      : publicUrl
  const previewShareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}${import.meta.env.BASE_URL}b/${publicSlug}?preview=1`
      : `${publicUrl}?preview=1`

  useEffect(() => {
    let isActive = true
    const generateQr = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(publicShareUrl, {
          width: 512,
          margin: 2,
        })
        if (isActive) setQrCodeUrl(dataUrl)
      } catch (error) {
        console.error('QR generation failed:', error)
        if (isActive) setQrCodeUrl('')
      }
    }
    generateQr()
    return () => {
      isActive = false
    }
  }, [publicShareUrl])

  const timeOptions = [
    '08:00', '09:00', '10:00', '11:00', '12:00', '13:00',
    '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ]
  const dropdownTriggerClass =
    'w-full h-9 px-3 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-card/60 focus:bg-card/60 focus:ring-2 focus:ring-primary/30 text-sm transition-all outline-none flex items-center justify-between text-left'

  const [hoursFromDay, setHoursFromDay] = useState<string>(weekDays[0])
  const [hoursToDay, setHoursToDay] = useState<string>(weekDays[5])
  const [hoursStartTime, setHoursStartTime] = useState<string>('09:00')
  const [hoursEndTime, setHoursEndTime] = useState<string>('19:00')
  const [isHoursFromOpen, setIsHoursFromOpen] = useState(false)
  const [isHoursToOpen, setIsHoursToOpen] = useState(false)
  const [isHoursStartOpen, setIsHoursStartOpen] = useState(false)
  const [isHoursEndOpen, setIsHoursEndOpen] = useState(false)
  const [isDayOffOpen, setIsDayOffOpen] = useState(false)

  useEffect(() => {
    const fromIndex = getWeekDayIndex(hoursFromDay)
    if (fromIndex >= 0) {
      setHoursFromDay(weekDays[fromIndex])
    }
    const toIndex = getWeekDayIndex(hoursToDay)
    if (toIndex >= 0) {
      setHoursToDay(weekDays[toIndex])
    }
    const offIndex = getWeekDayIndex(stripDayOffSuffix(publicPage.dayOff))
    if (offIndex >= 0) {
      setPublicPage((prev) => ({ ...prev, dayOff: `${weekDays[offIndex]}${st('dayOffSuffix')}` }))
    }
  }, [language])

  useEffect(() => {
    setPublicPage((prev) => ({
      ...prev,
      hours: `${hoursFromDay}–${hoursToDay}, ${hoursStartTime}–${hoursEndTime}`,
    }))
  }, [hoursFromDay, hoursToDay, hoursStartTime, hoursEndTime])

  const mapLat = Number.parseFloat(publicPage.mapLat)
  const mapLng = Number.parseFloat(publicPage.mapLng)
  const hasCoords = Number.isFinite(mapLat) && Number.isFinite(mapLng)
  const googleMapQuery = (publicPage.address || 'Chisinau').trim()
  const googleSearchQuery = [publicPage.placeName, publicPage.address].filter(Boolean).join(' ')
  const useDefaultWorldMap =
    !hasCoords &&
    (!googleMapQuery || googleMapQuery === 'Chisinau' || googleMapQuery === FOOTER_DEFAULT_ADDRESS)
  const googleMapUrl = useDefaultWorldMap
    ? DEFAULT_WORLD_MAP_EMBED_URL
    : hasCoords
      ? `https://www.google.com/maps?q=${mapLat},${mapLng}&z=17&output=embed&hl=en`
      : `https://www.google.com/maps?q=${encodeURIComponent(googleMapQuery)}&output=embed&hl=en`
  const googleOpenUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleSearchQuery || googleMapQuery)}&hl=en`

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setGeolocationError(st('geoNotAvailable'))
      return
    }
    setGeolocationError(null)
    setIsGeolocating(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords
        const lat = latitude.toFixed(6)
        const lng = longitude.toFixed(6)

        if (accuracy && accuracy > 150) {
          setIsGeolocating(false)
          setGeolocationError(
            st('geoLowAccuracy').replace('{accuracy}', String(Math.round(accuracy)))
          )
          return
        }

        let resolvedAddress = ''
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=${language}&lat=${lat}&lon=${lng}`
          )
          const data = await response.json()
          resolvedAddress = data?.display_name || ''
        } catch (error) {
          resolvedAddress = ''
        }

        setPublicPage((prev) => ({
          ...prev,
          mapLat: lat,
          mapLng: lng,
          address: resolvedAddress || prev.address,
        }))
        if (resolvedAddress) {
          skipNextAddressSearchRef.current = true
          setAddressQuery(resolvedAddress)
        }
        setIsGeolocating(false)
      },
      (error) => {
        setIsGeolocating(false)
        setGeolocationError(st('geoFailed'))
        console.error('Geolocation error:', error)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    )
  }

  const handlePublicLogoChange = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setPublicPage((prev) => ({ ...prev, logo: result }))
    }
    reader.readAsDataURL(file)
  }

  const _handleWorksChange = (index: number, file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      setPublicWorks((prev) => {
        const next = [...prev]
        next[index] = result
        setDraftValue(`publicWorks${index + 1}`, result)
        return next
      })
    }
    reader.readAsDataURL(file)
  }

  const _handleWorksRemove = (index: number) => {
    setPublicWorks((prev) => {
      const next = [...prev]
      next[index] = ''
      removeDraftValue(`publicWorks${index + 1}`)
      return next
    })
  }
  const handleSaveChanges = () => {
    const latestHeaderTitle = headerTitleRef.current?.textContent || publicPage.name
    const latestHeaderSubtitle = headerSubtitleRef.current?.innerText || publicPage.tagline
    const latestPrimaryCta = headerPrimaryCtaRef.current?.textContent || headerCtas.primary
    const latestSecondaryCta = headerSecondaryCtaRef.current?.textContent || headerCtas.secondary

    setPublicPage((prev) => ({
      ...prev,
      name: latestHeaderTitle,
      tagline: latestHeaderSubtitle,
    }))
    setHeaderCtas((prev) => ({
      ...prev,
      primary: latestPrimaryCta,
      secondary: latestSecondaryCta,
    }))
    localStorage.setItem('publicName', publicPage.name)
    localStorage.setItem('businessName', publicPage.name)
    localStorage.setItem('publicTagline', publicPage.tagline)
    localStorage.setItem('publicPhone', serializeFooterFieldForStorage(publicPage.phone))
    localStorage.setItem('publicEmail', serializeFooterFieldForStorage(publicPage.email))
    localStorage.setItem('publicFooterAddress', serializeFooterFieldForStorage(publicPage.footerAddress))
    localStorage.setItem('publicAddress', serializeFooterFieldForStorage(publicPage.address))
    localStorage.setItem('publicPlaceName', publicPage.placeName)
    localStorage.setItem('publicTelegram', publicPage.telegram)
    localStorage.setItem('publicViber', publicPage.viber)
    localStorage.setItem('publicInstagram', publicPage.instagram)
    localStorage.setItem('publicHours', serializeFooterFieldForStorage(publicPage.hours))
    localStorage.setItem('publicDayOff', serializeFooterFieldForStorage(publicPage.dayOff))
    localStorage.setItem('publicMapLat', publicPage.mapLat)
    localStorage.setItem('publicMapLng', publicPage.mapLng)
    localStorage.setItem('publicLogoShape', publicPage.logoShape)
    if (publicPage.logo) {
      localStorage.setItem('publicLogo', publicPage.logo)
    } else {
      localStorage.removeItem('publicLogo')
    }
    ;[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((idx) => {
      const value = getDraftOrPublic(`publicGallery${idx}`, '')
      if (value) {
        localStorage.setItem(`publicGallery${idx}`, value)
      } else {
        localStorage.removeItem(`publicGallery${idx}`)
      }
    })
    publicWorks.slice(0, 5).forEach((image, index) => {
      if (image) {
        localStorage.setItem(`publicWorks${index + 1}`, image)
      } else {
        localStorage.removeItem(`publicWorks${index + 1}`)
      }
    })
    localStorage.setItem('publicBookingTitle', bookingPreview.title)
    localStorage.setItem('publicBookingSubtitle', bookingPreview.subtitle)
    localStorage.setItem('publicHeaderPrimaryCta', latestPrimaryCta)
    localStorage.setItem('publicHeaderSecondaryCta', latestSecondaryCta)
    localStorage.setItem('publicHeaderPrimaryCtaShape', headerCtaShapes.primary)
    localStorage.setItem('publicHeaderSecondaryCtaShape', headerCtaShapes.secondary)
    localStorage.setItem('publicHeaderLogoShape', headerLogoShape)
    localStorage.setItem('publicHeaderLogoPlacement', headerLogoPlacement)
    localStorage.setItem('publicBodyBackgroundChoice', bodyBackgroundChoice)
    localStorage.setItem('publicHeaderLogoVisible', String(headerLogoVisible))
    localStorage.setItem('publicFooterLogoVisible', String(footerLogoVisible))
    localStorage.setItem('publicHeaderBarberColors', JSON.stringify(barberHeaderColors))
    localStorage.setItem('publicHeaderTheme', headerTheme)
    if (headerTheme === 'custom' && headerCustomImage) {
      localStorage.setItem('publicHeroImage', headerCustomImage)
    } else {
      localStorage.removeItem('publicHeroImage')
    }
    localStorage.setItem('publicGalleryLayout', galleryLayout)
    localStorage.setItem('publicFooterVisibility', JSON.stringify(footerVisibility))
    localStorage.setItem('publicFooterLabels', JSON.stringify(footerLabels))
    writeOrdinaryLangScopedDraftTriplet(
      headerTheme,
      latestPrimaryCta,
      latestSecondaryCta,
      JSON.stringify(footerLabels),
    )
    localStorage.setItem('publicSocialVisibility', JSON.stringify(socialVisibility))
    localStorage.setItem('publicSectionVisibility', JSON.stringify(sectionVisibility))

    ;[
      'publicName',
      'publicTagline',
      'publicPhone',
      'publicEmail',
      'publicFooterAddress',
      'publicAddress',
      'publicPlaceName',
      'publicTelegram',
      'publicViber',
      'publicInstagram',
      'publicHours',
      'publicDayOff',
      'publicMapLat',
      'publicMapLng',
      'publicLogo',
      'publicLogoShape',
      'publicHeaderPrimaryCta',
      'publicHeaderSecondaryCta',
      'publicHeaderPrimaryCtaShape',
      'publicHeaderSecondaryCtaShape',
      'publicHeaderLogoShape',
      'publicHeaderLogoPlacement',
      'publicHeaderLogoVisible',
      'publicFooterLogoVisible',
      'publicHeaderBarberColors',
      'publicHeaderTheme',
      'publicHeroImage',
      'publicHeroVideo',
      'publicPremiumHeroSubtitle',
      'publicPremiumHeroTitle',
      'publicPremiumHeroContactsLabel',
      'publicPremiumBookLabel',
      'publicPremiumGoldColor',
      'publicPremiumHeaderBgColor',
      'publicPremiumHeaderBgGlow',
      'publicPremiumHeaderNavColor',
      'publicPremiumHeaderTitleColor',
      'publicPremiumHeroSubtitleColor',
      'publicPremiumHeroTitleColor',
      'publicPremiumHeroButton1BorderColor',
      'publicPremiumHeroButton2BorderColor',
      'publicPremiumHeroButton1Glow',
      'publicPremiumHeroButton2Glow',
      'publicBodyBackgroundChoice',
      'publicBookingTitle',
      'publicBookingSubtitle',
      'publicGalleryLayout',
      'publicFooterVisibility',
      'publicFooterLabels',
      'publicSocialVisibility',
      'publicSectionVisibility',
    ].forEach((key) => removeDraftValue(key))
    ;[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach((idx) => removeDraftValue(`publicGallery${idx}`))
    ;[1, 2, 3, 4, 5].forEach((idx) => removeDraftValue(`publicWorks${idx}`))
  }

  const _handleHeaderCustomUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) return
      setHeaderCustomImage(result)
      setHeaderTheme('custom')
    }
    reader.readAsDataURL(file)
  }

  const _handleBackgroundUpload = (file: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : ''
      if (!result) return
      setConstructorBackground({ id: 'custom', custom: result })
    }
    reader.readAsDataURL(file)
  }

  const _barberTitleColor =
    barberTextOptions.find((option) => option.id === barberHeaderColors.title) || null
  const _barberSubtitleColor =
    barberTextOptions.find((option) => option.id === barberHeaderColors.subtitle) || null
  const _barberPrimaryColor =
    barberButtonOptions.find((option) => option.id === barberHeaderColors.primary) || null
  const _barberSecondaryColor =
    barberButtonOptions.find((option) => option.id === barberHeaderColors.secondary) || null
  const _getPrimaryIconClass = (defaultClass: string) =>
    barberHeaderColors.primary === 'black'
      ? 'brightness-0 invert'
      : barberHeaderColors.primary === 'white'
        ? 'brightness-0'
        : barberHeaderColors.primary === 'default'
          ? defaultClass
          : ''

  const _renderHeaderTextPalette = (target: 'title' | 'subtitle') => (
    <div className="mt-1 flex items-center gap-1.5">
      {barberTextOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() =>
            setBarberHeaderColors((prev) => ({
              ...prev,
              [target]: option.id,
            }))
          }
          className={cn(
            'h-4 w-4 rounded-full border',
            barberHeaderColors[target] === option.id ? 'border-white' : 'border-white/30'
          )}
          style={{
            backgroundColor: option.color,
            boxShadow: option.glow,
          }}
          aria-label={option.label}
        />
      ))}
      <button
        type="button"
        onClick={() =>
          setBarberHeaderColors((prev) => ({
            ...prev,
            [target]: 'default',
          }))
        }
        className="ml-1 px-1.5 py-0.5 rounded-full border border-white/30 text-[9px] uppercase tracking-[0.2em] text-white/70 hover:text-white"
      >
        Default
      </button>
    </div>
  )

  const _renderHeaderButtonPalette = (target: 'primary' | 'secondary') => (
    <div className="mt-1 flex items-center gap-1.5">
      {barberButtonOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() =>
            setBarberHeaderColors((prev) => ({
              ...prev,
              [target]: option.id,
            }))
          }
          className={cn(
            'h-4 w-4 rounded-full border',
            barberHeaderColors[target] === option.id ? 'border-white' : 'border-white/30'
          )}
          style={{
            backgroundColor: option.background,
            boxShadow: option.glow,
          }}
          aria-label={option.label}
        />
      ))}
      <button
        type="button"
        onClick={() =>
          setBarberHeaderColors((prev) => ({
            ...prev,
            [target]: 'default',
          }))
        }
        className="ml-1 px-1.5 py-0.5 rounded-full border border-white/30 text-[9px] uppercase tracking-[0.2em] text-white/70 hover:text-white"
      >
        Default
      </button>
    </div>
  )
  const _renderCtaShapeToggle = (target: 'primary' | 'secondary') => (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() =>
          setHeaderCtaShapes((prev) => ({
            ...prev,
            [target]: 'square',
          }))
        }
        className={cn(
          'px-2 py-0.5 rounded-full border text-[8px] uppercase tracking-[0.2em] transition',
          headerCtaShapes[target] === 'square'
            ? 'border-primary/60 text-primary'
            : 'border-white/30 text-white/70 hover:text-white'
        )}
      >
        Квадрат
      </button>
      <button
        type="button"
        onClick={() =>
          setHeaderCtaShapes((prev) => ({
            ...prev,
            [target]: 'round',
          }))
        }
        className={cn(
          'px-2 py-0.5 rounded-full border text-[8px] uppercase tracking-[0.2em] transition',
          headerCtaShapes[target] === 'round'
            ? 'border-primary/60 text-primary'
            : 'border-white/30 text-white/70 hover:text-white'
        )}
      >
        Круг
      </button>
    </div>
  )

  const PageLayout = (p: { children: React.ReactNode }) => (
    <div className="space-y-6 w-full max-w-none">
      <div className="space-y-6">{p.children}</div>
    </div>
  )
  const content = (
    <PageLayout>
        {/* Сайт вашего салона — CTA-блок */}
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary/8 via-card to-primary/5 shadow-2xl shadow-black/20">
          <div className="absolute top-0 right-0 w-[min(80%,320px)] h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-8 px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex shrink-0 items-center justify-center">
                  <img src={iconMarketing} alt="" className="h-12 w-12 object-contain" />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                  {st('salonSiteCardTitle')}
                </h3>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-md">
                {st('salonSiteCardDescription')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="default"
                size="lg"
                className="rounded-xl h-11 px-6 font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-shadow gap-2"
                onClick={() => {
                  try {
                    localStorage.setItem('publicLang', language)
                  } catch {
                    /* ignore */
                  }
                  const bt = localStorage.getItem('businessType') || ''
                  navigate(bt === 'massage' ? '/constructor-massage' : '/constructor')
                }}
              >
                <PenLine className="h-4 w-4" />
                {st('salonSiteConstructorCta')}
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-xl h-11 px-6 font-semibold border-2 border-primary/40 bg-transparent hover:bg-primary/10 hover:border-primary/60 transition-colors gap-2"
                onClick={() => {
                  try {
                    localStorage.setItem('publicLang', language)
                  } catch {
                    /* ignore */
                  }
                  const bt = localStorage.getItem('businessType') || ''
                  if (bt === 'massage') {
                    const slot = getMassageTemplateSlot()
                    const slugForMassage =
                      (typeof window !== 'undefined' && localStorage.getItem('publicSlug')) || publicSlug
                    const q = new URLSearchParams()
                    q.set('preview', '1')
                    q.set('full', '1')
                    q.set('_', String(Date.now()))
                    const base = import.meta.env.BASE_URL
                    const path =
                      slot === PREMIUM_MASSAGE_SLOT
                        ? `${base}massage-preview?${q.toString()}`
                        : (() => {
                            q.set('massagePreview', '1')
                            q.set('massageSlot', slot)
                            return `${base}b/${slugForMassage}?${q.toString()}`
                          })()
                    window.open(path, '_blank')
                  } else {
                    window.open(`${import.meta.env.BASE_URL}b/${publicSlug}?preview=1`, '_blank')
                  }
                }}
              >
                <ExternalLink className="h-4 w-4" />
                {st('salonSiteOpenSite')}
              </Button>
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card
          ref={notificationsRef}
          className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary/8 via-card to-primary/5 shadow-2xl shadow-black/20"
        >
          <div className="absolute top-0 right-0 w-[min(80%,320px)] h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            {st('notificationsTitle')}
          </h3>
          
          {/* Email notifications */}
          <div className="space-y-4 mb-6">
            <h4 className="text-sm font-semibold text-foreground">{st('emailNotificationsTitle')}</h4>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() =>
                  setNotificationSettings({
                    ...notificationSettings,
                    email: {
                      ...notificationSettings.email,
                      confirmation: !notificationSettings.email.confirmation,
                    },
                  })
                }
                className={cn(
                  'px-4 py-2 rounded-full border text-sm font-medium transition inline-flex items-center',
                  notificationSettings.email.confirmation
                    ? 'border-primary/40 bg-primary/15 text-foreground'
                    : 'border-border/50 bg-card/40 text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'mr-2 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                    notificationSettings.email.confirmation
                      ? 'border-primary/60 bg-primary/30'
                      : 'border-border/60 bg-transparent'
                  )}
                >
                  {notificationSettings.email.confirmation && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </span>
                {st('confirmationClient')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setNotificationSettings({
                    ...notificationSettings,
                    email: {
                      ...notificationSettings.email,
                      reminder24h: !notificationSettings.email.reminder24h,
                    },
                  })
                }
                className={cn(
                  'px-4 py-2 rounded-full border text-sm font-medium transition inline-flex items-center',
                  notificationSettings.email.reminder24h
                    ? 'border-primary/40 bg-primary/15 text-foreground'
                    : 'border-border/50 bg-card/40 text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'mr-2 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                    notificationSettings.email.reminder24h
                      ? 'border-primary/60 bg-primary/30'
                      : 'border-border/60 bg-transparent'
                  )}
                >
                  {notificationSettings.email.reminder24h && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </span>
                {st('reminder24h')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setNotificationSettings({
                    ...notificationSettings,
                    email: {
                      ...notificationSettings.email,
                      reminder1h: !notificationSettings.email.reminder1h,
                    },
                  })
                }
                className={cn(
                  'px-4 py-2 rounded-full border text-sm font-medium transition inline-flex items-center',
                  notificationSettings.email.reminder1h
                    ? 'border-primary/40 bg-primary/15 text-foreground'
                    : 'border-border/50 bg-card/40 text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'mr-2 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                    notificationSettings.email.reminder1h
                      ? 'border-primary/60 bg-primary/30'
                      : 'border-border/60 bg-transparent'
                  )}
                >
                  {notificationSettings.email.reminder1h && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </span>
                {st('reminder1h')}
              </button>
              <button
                type="button"
                onClick={() =>
                  setNotificationSettings({
                    ...notificationSettings,
                    email: {
                      ...notificationSettings.email,
                      ownerNotification: !notificationSettings.email.ownerNotification,
                    },
                  })
                }
                className={cn(
                  'px-4 py-2 rounded-full border text-sm font-medium transition inline-flex items-center',
                  notificationSettings.email.ownerNotification
                    ? 'border-primary/40 bg-primary/15 text-foreground'
                    : 'border-border/50 bg-card/40 text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'mr-2 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                    notificationSettings.email.ownerNotification
                      ? 'border-primary/60 bg-primary/30'
                      : 'border-border/60 bg-transparent'
                  )}
                >
                  {notificationSettings.email.ownerNotification && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </span>
                {st('ownerNotification')}
              </button>
            </div>
          </div>

          {/* Telegram notifications */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">{st('telegramNotificationsTitle')}</h4>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() =>
                  setNotificationSettings({
                    ...notificationSettings,
                    telegram: {
                      ...notificationSettings.telegram,
                      enabled: !notificationSettings.telegram.enabled,
                    },
                  })
                }
                className={cn(
                  'px-4 py-2 rounded-full border text-sm font-medium transition inline-flex items-center',
                  notificationSettings.telegram.enabled
                    ? 'border-primary/40 bg-primary/15 text-foreground'
                    : 'border-border/50 bg-card/40 text-muted-foreground hover:text-foreground'
                )}
              >
                <span
                  className={cn(
                    'mr-2 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border',
                    notificationSettings.telegram.enabled
                      ? 'border-primary/60 bg-primary/30'
                      : 'border-border/60 bg-transparent'
                  )}
                >
                  {notificationSettings.telegram.enabled && (
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  )}
                </span>
                {st('enableTelegramNotifications')}
              </button>
              {notificationSettings.telegram.enabled && (
                <div className="p-4 bg-accent/10 rounded-lg border border-accent/20 backdrop-blur-sm">
                  <p className="text-sm text-muted-foreground mb-3">
                    {st('telegramConnectHint')}
                  </p>
                  <Button
                    size="sm"
                    className="rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
                  >
                    {st('connectTelegramBot')}
                  </Button>
                </div>
              )}
            </div>
          </div>
          </div>
        </Card>

        {/* QR block */}
        <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary/8 via-card to-primary/5 shadow-2xl shadow-black/20">
          <div className="absolute top-0 right-0 w-[min(80%,320px)] h-full bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-primary/10 blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
          <div className="relative z-10 px-6 py-10 sm:px-10 sm:py-12">
            <div className="flex items-center gap-4 mb-6">
              <h3 className="text-lg font-bold">{st('qrLabel')}</h3>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-32 h-32 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center bg-card/30 backdrop-blur-sm overflow-hidden">
                {qrCodeUrl ? (
                  <img src={qrCodeUrl} alt="QR code" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-muted-foreground text-sm">{st('qrPlaceholder')}</span>
                )}
              </div>
              <div className="space-y-2" />
            </div>
            <Button
              variant="outline"
              size="lg"
              className="mt-4 w-full sm:w-auto rounded-full"
              disabled={!qrCodeUrl}
              asChild
            >
              <a href={qrCodeUrl || '#'} download={`qr-${publicSlug}.png`}>
                {st('downloadQr')}
              </a>
            </Button>
          </div>
        </Card>
    </PageLayout>
  );
  return content;
}
