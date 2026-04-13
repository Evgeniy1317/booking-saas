import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Lottie from 'lottie-react'
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X, Instagram, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PublicBookingFormSection } from '@/components/public/PublicBookingFormSection'
import { PublicBookingMobileBar } from '@/components/public/PublicBookingMobileBar'
import { cn } from '@/lib/utils'
import {
  readMassageOrdinarySlotString,
  massageDraftKeyForPublicPageKey,
  isMassageLangScopedTextKey,
  setMassageDraft,
  setMassageDraftLangAware,
  massageDraftStorageKey,
} from '@/lib/massage-draft'

/** Для en/ro не подмешивать русские draft_* салона, если в слоте массажа нет своего текста */
const MASSAGE_PREVIEW_READPUBLIC_FALLTHROUGH_KEYS = new Set<string>(['publicName'])

/** Адрес и координаты карты только из слота массажа — иначе тянутся черновики парикмахерского конструктора и пропадает карта мира по умолчанию */
const MASSAGE_PREVIEW_SLOT_ONLY_KEYS = new Set<string>([
  'publicMapLat',
  'publicMapLng',
  'publicMapEmbedUrl',
  'publicAddress',
  'publicFooterAddress',
  'publicPlaceName',
])
import {
  SALON_PREMIUM_HERO_VIDEO_IDB_MARKER,
  loadSalonPremiumHeroVideoObjectUrl,
} from '@/lib/salon-premium-hero-video-idb'
import {
  MASSAGE_HERO_VIDEO_IDB_MARKER,
  loadMassageHeroVideoObjectUrl,
} from '@/lib/massage-hero-video-idb'
import { isOrdinaryDraggableHeaderTheme } from '@/lib/ordinary-draggable-header-themes'
import heroImage from '@/assets/images/constructor-images/pexels-emirhan-sayar-478511598-35844822.jpg'
import massageClassicHeroBg from '@/assets/images/massage-images/pexels-shkrabaanthony-4599396.jpg'
import massageThaiHeroBg from '@/assets/images/massage-images/pexels-tima-miroshnichenko-6188128.jpg'
import massageStoneHeroBg from '@/assets/images/massage-images/pexels-tima-miroshnichenko-6187657.jpg'
import massageAntistressHeroBg from '@/assets/images/massage-images/pexels-jonathanborba-19641822.jpg'
import massageSportsHeroBg from '@/assets/images/massage-images/pexels-jonathanborba-27730453.jpg'
import cosmetologyHeaderBg from '@/assets/images/constructor-images/pexels-jose-antonio-otegui-auzmendi-2150489988-31261686.jpg'
import coloringHeaderBg from '@/assets/images/constructor-images/pexels-jibarofoto-3093007.jpg'
import manicureHeaderBg from '@/assets/images/constructor-images/pexels-cottonbro-6941115.jpg'
import barberRegularHeroBg from '@/assets/images/constructor-images/pexels-nickoloui-1319459.jpg'
import barberPremiumHeroBg from '@/assets/images/constructor-images/загруженное (2).jpg'
import defaultHeroVideo from '@/assets/images/video/3998440-uhd_4096_2160_25fps.mp4'
import worksDefault1 from '@/assets/images/premium-images/pexels-pavel-danilyuk-7518736.jpg'
import worksDefault2 from '@/assets/images/premium-images/pexels-cottonbro-3993451.jpg'
import worksDefault3 from '@/assets/images/premium-images/pexels-cottonbro-3992875.jpg'
import worksDefault4 from '@/assets/images/premium-images/pexels-thgusstavo-2061820.jpg'
import worksDefault5 from '@/assets/images/premium-images/pexels-cottonbro-3998407.jpg'
import worksCarousel1 from '@/assets/images/constructor-images/pexels-maksgelatin-4663135.jpg'
import worksCarousel2 from '@/assets/images/constructor-images/pexels-maksgelatin-4663136.jpg'
import worksCarousel3 from '@/assets/images/constructor-images/pexels-thefullonmonet-28994396.jpg'
import patternBg from '@/assets/images/seamless-pattern-of-hairdressing-elements-illustration-of-doodle-icons-background-wallpaper-the-concept-of-a-hairdressing-salon-and-a-beauty-salon-vector.jpg'
import manicurePattern from '@/assets/images/constructor-images/manicure-tools-seamless-pattern-for-nail-studio-or-spa-salon-beauty-routine-background-vector.jpg'
import manicurePatternAlt from '@/assets/images/constructor-images/manicure-tools-doodle-seamless-pattern-manicure-scissors-gel-polish-woman-hands-white-background_646079-2612.avif'
import bookingIcon from '@/assets/images/free-icon-write-file-17127339.png'
import successAnimation from '@/animation-success/application-completed.json'
import loadingAnimation from '@/animation-loading/loading.json'
import flagRu from '@/assets/images/russia.png'
import flagEn from '@/assets/images/united-kingdom.png'
import flagRo from '@/assets/images/flag.png'
import { useIsMobile } from '@/hooks/use-mobile'
import CircularGallery from './CircularGallery'
import DraggableHeaderHair from '@/components/public/DraggableHeaderHair'
import PremiumBarberTemplate from '@/components/public/PremiumBarberTemplate'
import {
  HAIR_THEME_DEFAULT_NAME,
  HAIR_THEME_DEFAULT_TAGLINE,
  HAIR_THEME_DEFAULT_BOOKING_TITLE,
  HAIR_THEME_DEFAULT_BOOKING_SUBTITLE,
  HAIR_DEFAULTS_BY_LANG,
  DEFAULT_LOGO_URL,
  FOOTER_DEFAULT_NAME,
  FOOTER_DEFAULT_ADDRESS,
  FOOTER_DEFAULT_HOURS,
  FOOTER_DEFAULT_DAY_OFF,
  FOOTER_DEFAULT_PHONE,
  FOOTER_DEFAULT_EMAIL,
  FOOTER_DEFAULTS_BY_LANG,
  DEFAULT_WORLD_MAP_EMBED_URL,
} from '@/lib/hair-theme-defaults'
import { PREMIUM_PUBLIC_DEFAULTS_BY_LANG } from '@/lib/premium-public-defaults'
import { getCanonicalSalonBusinessName } from '@/lib/salon-business-name'
import {
  getEnabledSiteLangs,
  normalizePublicLangForEnabled,
  type PublicSiteLang,
} from '@/lib/public-site-langs'
import { isMassageOrdinaryTemplateId } from '@/lib/massage-template-registry'
import {
  parseMassageThemeColors,
  resolveMassageThemeColor,
  type MassageThemeColors,
} from '@/lib/massage-theme-palette'
import {
  massageBodyPatternLayerBackgroundSize,
  resolveMassageBodyPatternAssetUrl,
} from '@/lib/massage-body-patterns'
import { getMassageSalonPhotoSlotDefaults } from '@/lib/massage-salon-photo-defaults'
import {
  PREMIUM_HERO_LANG_SCOPED_KEYS,
  isLangScopedPublicDraftKey,
} from '@/lib/public-lang-scoped-draft-keys'
import { localizeFooterDayOffLine, localizeFooterHoursLine } from '@/lib/localize-footer-schedule'
import {
  displayFooterFieldStored,
  isFooterFieldClearedMarker,
  serializeFooterFieldForStorage,
} from '@/lib/public-footer-field-empty'

const ALL_PUBLIC_LANGS: PublicSiteLang[] = ['ru', 'en', 'ro']

/** 5 фотографий по умолчанию для блока «Фотографии салона» (интерьеры шаблонов), порядок слотов 1–5 */
const DEFAULT_WORKS_IMAGES = [
  worksDefault1,
  worksDefault2,
  worksDefault3,
  worksDefault4,
  worksDefault5,
]

/** 3 фотографии по умолчанию для карусели «Галерея работ» (слоты 1–3), пока не заданы свои */
const DEFAULT_WORKS_CAROUSEL_IMAGES = [worksCarousel1, worksCarousel2, worksCarousel3]

/** Начальные позиции хедера по темам (как в статическом шаблоне) — % от ширины/высоты */
const DEFAULT_HEADER_LAYOUT_BY_THEME: Record<string, Record<string, { x: number; y: number }>> = {
  hair: {
    logo: { x: 50, y: 49 },
    title: { x: 50, y: 64 },
    tagline: { x: 50, y: 80 },
    primaryCta: { x: 40, y: 95 },
    secondaryCta: { x: 60, y: 95 },
  },
  barber: {
    logo: { x: 50, y: 49 },
    title: { x: 50, y: 64 },
    tagline: { x: 50, y: 80 },
    primaryCta: { x: 40, y: 95 },
    secondaryCta: { x: 60, y: 95 },
  },
  cosmetology: {
    logo: { x: 50, y: 49 },
    title: { x: 50, y: 64 },
    tagline: { x: 50, y: 80 },
    primaryCta: { x: 40, y: 95 },
    secondaryCta: { x: 60, y: 95 },
  },
  coloring: {
    logo: { x: 50, y: 49 },
    title: { x: 50, y: 64 },
    tagline: { x: 50, y: 80 },
    primaryCta: { x: 40, y: 95 },
    secondaryCta: { x: 60, y: 95 },
  },
  manicure: {
    logo: { x: 50, y: 49 },
    title: { x: 50, y: 64 },
    tagline: { x: 50, y: 80 },
    primaryCta: { x: 40, y: 95 },
    secondaryCta: { x: 60, y: 95 },
  },
}

type FooterContactItem = {
  id: 'address' | 'schedule' | 'phone' | 'email'
  label: string
  value: string
  extra: string | null
  draftKey: string
  extraDraftKey: string | null
}

interface PublicService {
  id: string
  category: string
  name: string
  duration: number
  price: number
  active: boolean
}

interface PublicStaff {
  id: string
  name: string
  category: string
  description?: string
  color: string
  services: string[]
  workingDays: string[]
  workingHours: { start: string; end: string }
  active: boolean
}

interface PublicAppointment {
  date?: string
  time?: string
  startTime?: string
  staff?: string
  master?: string
  status?: string
}

const fallbackServicesByLang: Record<string, PublicService[]> = {
  ru: [
  { id: '1', category: 'Парикмахерская', name: 'Женская стрижка', duration: 60, price: 450, active: true },
  { id: '2', category: 'Маникюр', name: 'Классический маникюр', duration: 60, price: 400, active: true },
  { id: '3', category: 'Косметология', name: 'Уход за лицом', duration: 90, price: 800, active: true },
  ],
  en: [
    { id: '1', category: 'Hairdressing', name: 'Women\'s haircut', duration: 60, price: 450, active: true },
    { id: '2', category: 'Manicure', name: 'Classic manicure', duration: 60, price: 400, active: true },
    { id: '3', category: 'Cosmetology', name: 'Facial care', duration: 90, price: 800, active: true },
  ],
  ro: [
    { id: '1', category: 'Coafură', name: 'Tunsoare damă', duration: 60, price: 450, active: true },
    { id: '2', category: 'Manichiură', name: 'Manichiură clasică', duration: 60, price: 400, active: true },
    { id: '3', category: 'Cosmetologie', name: 'Îngrijire facială', duration: 90, price: 800, active: true },
  ],
}

const fallbackStaffByLang: Record<string, PublicStaff[]> = {
  ru: [
    {
      id: '1', name: 'Анна Петреску', category: 'Стилист',
      description: 'Мягкие техники окрашивания и уход', color: '#3b82f6',
    services: ['Женская стрижка', 'Уход за лицом'],
    workingDays: ['Понедельник', 'Среда', 'Пятница', 'Суббота'],
      workingHours: { start: '10:00', end: '18:00' }, active: true,
    },
    {
      id: '2', name: 'Елена Бондарь', category: 'Мастер маникюра',
      description: 'Комбинированный маникюр и дизайн', color: '#ec4899',
    services: ['Классический маникюр'],
    workingDays: ['Вторник', 'Четверг', 'Суббота'],
      workingHours: { start: '09:00', end: '17:00' }, active: true,
    },
  ],
  en: [
    {
      id: '1', name: 'Anna Petrescu', category: 'Stylist',
      description: 'Soft coloring techniques and care', color: '#3b82f6',
      services: ['Women\'s haircut', 'Facial care'],
      workingDays: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
      workingHours: { start: '10:00', end: '18:00' }, active: true,
    },
    {
      id: '2', name: 'Elena Bondar', category: 'Manicure specialist',
      description: 'Combined manicure and nail design', color: '#ec4899',
      services: ['Classic manicure'],
      workingDays: ['Tuesday', 'Thursday', 'Saturday'],
      workingHours: { start: '09:00', end: '17:00' }, active: true,
    },
  ],
  ro: [
    {
      id: '1', name: 'Anna Petrescu', category: 'Stilist',
      description: 'Tehnici delicate de colorare și îngrijire', color: '#3b82f6',
      services: ['Tunsoare damă', 'Îngrijire facială'],
      workingDays: ['Luni', 'Miercuri', 'Vineri', 'Sâmbătă'],
      workingHours: { start: '10:00', end: '18:00' }, active: true,
    },
    {
      id: '2', name: 'Elena Bondar', category: 'Specialist manichiură',
      description: 'Manichiură combinată și design', color: '#ec4899',
      services: ['Manichiură clasică'],
      workingDays: ['Marți', 'Joi', 'Sâmbătă'],
      workingHours: { start: '09:00', end: '17:00' }, active: true,
    },
  ],
}

const loadServices = (lang: string = 'ru'): PublicService[] => {
  try {
    const stored = localStorage.getItem('services')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading services:', e)
  }
  return fallbackServicesByLang[lang] ?? fallbackServicesByLang.ru
}

const loadStaff = (lang: string = 'ru'): PublicStaff[] => {
  try {
    const stored = localStorage.getItem('staff')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error loading staff:', e)
  }
  return fallbackStaffByLang[lang] ?? fallbackStaffByLang.ru
}

const formatDateInput = (date: Date) => {
  const yyyy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

const loadAppointments = (): PublicAppointment[] => {
  try {
    const stored = localStorage.getItem('appointments')
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        return parsed.filter((apt) => apt?.status !== 'cancelled')
      }
    }
  } catch (e) {
    console.error('Error loading appointments:', e)
  }
  return []
}

const generateSlots = (start: string, end: string, intervalMinutes = 30) => {
  const [startH, startM] = start.split(':').map(Number)
  const [endH, endM] = end.split(':').map(Number)
  const slots: string[] = []
  let current = startH * 60 + startM
  const endMinutes = endH * 60 + endM
  while (current + intervalMinutes <= endMinutes) {
    const h = String(Math.floor(current / 60)).padStart(2, '0')
    const m = String(current % 60).padStart(2, '0')
    slots.push(`${h}:${m}`)
    current += intervalMinutes
  }
  return slots
}

const addMinutesToTime = (time: string, minutesToAdd: number) => {
  const [hours, minutes] = time.split(':').map(Number)
  const total = hours * 60 + minutes + minutesToAdd
  const normalized = ((total % 1440) + 1440) % 1440
  const nextH = String(Math.floor(normalized / 60)).padStart(2, '0')
  const nextM = String(normalized % 60).padStart(2, '0')
  return `${nextH}:${nextM}`
}

const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

  const days: Array<Date | null> = []
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(year, month, i))
  }
  return days
}

const isToday = (date: Date | null) => {
  if (!date) return false
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

const isSelected = (date: Date | null, selectedDateStr: string) => {
  if (!date || !selectedDateStr) return false
  const selected = new Date(selectedDateStr + 'T00:00:00')
  return (
    date.getDate() === selected.getDate() &&
    date.getMonth() === selected.getMonth() &&
    date.getFullYear() === selected.getFullYear()
  )
}

const formatDateToLocalString = (date: Date): string => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type PublicLang = PublicSiteLang

const localeByLang: Record<PublicLang, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  ro: 'ro-RO',
}

const uiText = {
  ru: {
    addSalonPhoto: 'Добавьте фото салона',
    /** Нейтральный плейсхолдер, если в storage нет имени (не подменяет имя из регистрации) */
    defaultSalonName: 'Ваш салон',
    defaultTagline: 'Онлайн запись в удобное время с подтверждением',
    bookOnline: 'Записаться онлайн',
    call: 'Позвонить',
    salonPhotos: 'Фотографии салона',
    galleryImageAlt: 'Фото салона',
    bookingTitle: 'Запись в 4 клика',
    bookingSubtitle: 'Выберите услугу, специалиста и время — мы сразу подтверждаем запись',
    onlineBooking: 'Онлайн запись',
    onlineBookingSubtitle: 'Подберите услугу и мастера, который подходит именно вам',
    step: 'Шаг',
    of: 'из',
    steps: ['Услуга', 'Мастер', 'Дата и время', 'Контакты'],
    weekdaysShort: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'],
    serviceTitle: 'Услуга',
    masterTitle: 'Мастер',
    dateTimeTitle: 'Дата и время',
    contactsTitle: 'Контакты',
    chooseService: 'Выберите услугу:',
    chooseMaster: 'Выберите специалиста:',
    chooseSlot: 'Выберите слот:',
    fillDetails: 'Заполните данные:',
    minutesShort: 'мин',
    schedulePrefix: 'График',
    noMasters: 'Нет доступных мастеров для выбранной услуги.',
    dateLabel: 'Дата',
    timeLabel: 'Время',
    yourBooking: 'Ваша запись',
    serviceLabel: 'Услуга',
    masterLabel: 'Мастер',
    dateTimeLabel: 'Дата и время',
    priceLabel: 'Стоимость',
    notSelected: 'Не выбрано',
    sendRequest: 'Отправить заявку',
    weWillContact: 'Мы свяжемся с вами для подтверждения',
    back: 'Назад',
    next: 'Дальше',
    submit: 'Отправить',
    selectDate: 'Выберите дату',
    selectDatePlaceholder: 'Выберите дату',
    namePlaceholder: 'Имя и фамилия',
    phonePlaceholder: 'Телефон',
    emailPlaceholder: 'Email (необязательно)',
    commentPlaceholder: 'Комментарий (необязательно)',
    contactMethodLabel: 'Выберите соцсеть по которой мы с вами свяжемся для подтверждения:',
    socialNetworkLabel: 'Соцсеть',
    contactMethodPlaceholder: 'Выберите соцсеть',
    contactHandlePlaceholder: 'Юзернейм/ссылка/номер телефона',
    fillRequiredAlert: 'Заполните обязательные поля и выберите услугу, мастера, дату и время.',
    requestSentAlert: 'Заявка отправлена! Мы скоро подтвердим вашу запись.',
    successLine1: 'Заявка отправлена!',
    successLine2: 'Мы свяжемся с вами для подтверждения',
    locationLabel: 'Локация',
    whereToFind: 'Где нас найти',
    whereToFindQuestion: 'Где нас найти?',
    openInMaps: 'Открыть в Google Maps',
    addressLabel: 'Адрес',
    scheduleLabel: 'График',
    phoneLabel: 'Телефон',
    emailLabel: 'Почта',
    addressFallback: 'Адрес уточняется',
    addressPlaceholder: 'Город, улица, дом',
    defaultHours: 'Пн–Сб, 09:00–19:00',
    defaultDayOff: 'Вс — выходной',
    chooseServiceShort: 'Выберите услугу',
    chooseTimeShort: 'Выберите время',
    chooseServiceHint: 'Выберите услугу',
    viewBooking: 'Посмотреть свою запись',
    bookNow: 'Записаться',
    contacts: 'Контакты',
    addrLabel: 'АДРЕС',
    schedLabel: 'ГРАФИК',
    phoneLabel2: 'ТЕЛЕФОН',
    emailLabel2: 'ПОЧТА',
    worksGallery: 'Галерея работ',
    goToConstructor: 'Перейти в конструктор',
    deletePhoto: 'Удалить',
    closeModal: 'Закрыть',
    hideSocial: 'Скрыть',
    hideBlock: 'Скрыть блок',
    language: 'Язык',
  },
  en: {
    addSalonPhoto: 'Add salon photo',
    defaultSalonName: 'Beauty Salon',
    defaultTagline: 'Online booking at a convenient time with confirmation',
    bookOnline: 'Book online',
    call: 'Call',
    salonPhotos: 'Salon photos',
    galleryImageAlt: 'Salon photo',
    bookingTitle: 'Book in 4 clicks',
    bookingSubtitle: 'Choose a service, specialist, and time — we confirm instantly',
    onlineBooking: 'Online booking',
    onlineBookingSubtitle: 'Choose the service and the specialist that fits you',
    step: 'Step',
    of: 'of',
    steps: ['Service', 'Specialist', 'Date & time', 'Contacts'],
    weekdaysShort: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    serviceTitle: 'Service',
    masterTitle: 'Specialist',
    dateTimeTitle: 'Date & time',
    contactsTitle: 'Contacts',
    chooseService: 'Choose a service:',
    chooseMaster: 'Choose a specialist:',
    chooseSlot: 'Choose a slot:',
    fillDetails: 'Fill in details:',
    minutesShort: 'min',
    schedulePrefix: 'Schedule',
    noMasters: 'No specialists available for the selected service.',
    dateLabel: 'Date',
    timeLabel: 'Time',
    yourBooking: 'Your booking',
    serviceLabel: 'Service',
    masterLabel: 'Specialist',
    dateTimeLabel: 'Date & time',
    priceLabel: 'Price',
    notSelected: 'Not selected',
    sendRequest: 'Send request',
    weWillContact: 'We will contact you to confirm',
    back: 'Back',
    next: 'Next',
    submit: 'Submit',
    selectDate: 'Select date',
    selectDatePlaceholder: 'Select date',
    namePlaceholder: 'Full name',
    phonePlaceholder: 'Phone',
    emailPlaceholder: 'Email (optional)',
    commentPlaceholder: 'Comment (optional)',
    contactMethodLabel: 'Choose the social network we should contact you on for confirmation:',
    socialNetworkLabel: 'Social network',
    contactMethodPlaceholder: 'Choose a social network',
    contactHandlePlaceholder: 'Username / link / phone number',
    fillRequiredAlert: 'Fill required fields and choose service, specialist, date, and time.',
    requestSentAlert: 'Request sent! We will confirm soon.',
    successLine1: 'Request sent!',
    successLine2: 'We will contact you to confirm',
    locationLabel: 'Location',
    whereToFind: 'Where to find us',
    whereToFindQuestion: 'Where to find us?',
    openInMaps: 'Open in Google Maps',
    addressLabel: 'Address',
    scheduleLabel: 'Schedule',
    phoneLabel: 'Phone',
    emailLabel: 'Email',
    addressFallback: 'Address pending',
    addressPlaceholder: 'City, street, building',
    defaultHours: 'Mon–Sat, 09:00–19:00',
    defaultDayOff: 'Sun — closed',
    chooseServiceShort: 'Choose a service',
    chooseTimeShort: 'Choose time',
    chooseServiceHint: 'Choose a service',
    viewBooking: 'View your booking',
    bookNow: 'Book now',
    contacts: 'Contacts',
    addrLabel: 'ADDRESS',
    schedLabel: 'SCHEDULE',
    phoneLabel2: 'PHONE',
    emailLabel2: 'EMAIL',
    worksGallery: 'Works gallery',
    goToConstructor: 'Go to constructor',
    deletePhoto: 'Delete',
    closeModal: 'Close',
    hideSocial: 'Hide',
    hideBlock: 'Hide block',
    language: 'Language',
  },
  ro: {
    addSalonPhoto: 'Adăugați o fotografie a salonului',
    defaultSalonName: 'Salon de frumusețe',
    defaultTagline: 'Programare online la o oră convenabilă cu confirmare',
    bookOnline: 'Programează-te online',
    call: 'Sună',
    salonPhotos: 'Fotografii salon',
    galleryImageAlt: 'Foto salon',
    bookingTitle: 'Programare în 4 pași',
    bookingSubtitle: 'Alegeți serviciul, specialistul și ora — confirmăm imediat',
    onlineBooking: 'Programare online',
    onlineBookingSubtitle: 'Alegeți serviciul și specialistul potrivit',
    step: 'Pasul',
    of: 'din',
    steps: ['Serviciu', 'Specialist', 'Dată și oră', 'Contacte'],
    weekdaysShort: ['Lu', 'Ma', 'Mi', 'Jo', 'Vi', 'Sa', 'Du'],
    serviceTitle: 'Serviciu',
    masterTitle: 'Specialist',
    dateTimeTitle: 'Dată și oră',
    contactsTitle: 'Contacte',
    chooseService: 'Alegeți un serviciu:',
    chooseMaster: 'Alegeți un specialist:',
    chooseSlot: 'Alegeți un interval:',
    fillDetails: 'Completați datele:',
    minutesShort: 'min',
    schedulePrefix: 'Program',
    noMasters: 'Nu există specialiști disponibili pentru serviciul selectat.',
    dateLabel: 'Dată',
    timeLabel: 'Oră',
    yourBooking: 'Programarea ta',
    serviceLabel: 'Serviciu',
    masterLabel: 'Specialist',
    dateTimeLabel: 'Dată și oră',
    priceLabel: 'Preț',
    notSelected: 'Neselectat',
    sendRequest: 'Trimite cererea',
    weWillContact: 'Vă contactăm pentru confirmare',
    back: 'Înapoi',
    next: 'Înainte',
    submit: 'Trimite',
    selectDate: 'Alegeți data',
    selectDatePlaceholder: 'Alegeți data',
    namePlaceholder: 'Nume și prenume',
    phonePlaceholder: 'Telefon',
    emailPlaceholder: 'Email (opțional)',
    commentPlaceholder: 'Comentariu (opțional)',
    contactMethodLabel: 'Alegeți rețeaua prin care să vă contactăm pentru confirmare:',
    socialNetworkLabel: 'Rețea socială',
    contactMethodPlaceholder: 'Alegeți o rețea socială',
    contactHandlePlaceholder: 'Nume utilizator / link / număr telefon',
    fillRequiredAlert: 'Completați câmpurile obligatorii și alegeți serviciu, specialist, data și ora.',
    requestSentAlert: 'Cererea a fost trimisă! Vom confirma în curând.',
    successLine1: 'Cererea a fost trimisă!',
    successLine2: 'Vă contactăm pentru confirmare',
    locationLabel: 'Locație',
    whereToFind: 'Unde ne găsiți',
    whereToFindQuestion: 'Unde ne găsiți?',
    openInMaps: 'Deschideți în Google Maps',
    addressLabel: 'Adresă',
    scheduleLabel: 'Program',
    phoneLabel: 'Telefon',
    emailLabel: 'Email',
    addressFallback: 'Adresă în curs',
    addressPlaceholder: 'Oraș, stradă, număr',
    defaultHours: 'Lu–Sa, 09:00–19:00',
    defaultDayOff: 'Du — zi liberă',
    chooseServiceShort: 'Alegeți un serviciu',
    chooseTimeShort: 'Alegeți ora',
    chooseServiceHint: 'Alegeți un serviciu',
    viewBooking: 'Vezi programarea ta',
    bookNow: 'Programează',
    contacts: 'Contacte',
    addrLabel: 'ADRESĂ',
    schedLabel: 'PROGRAM',
    phoneLabel2: 'TELEFON',
    emailLabel2: 'EMAIL',
    worksGallery: 'Galeria lucrărilor',
    goToConstructor: 'Mergi la constructor',
    deletePhoto: 'Șterge',
    closeModal: 'Închide',
    hideSocial: 'Ascunde',
    hideBlock: 'Ascunde bloc',
    language: 'Limba',
  },
} as const

const HERO_CTA_CYRILLIC = /[\u0400-\u04FF]/

/** Черновики hero-кнопок по языку: отсекаем кириллицу в en/ro, русский текст, дубли и типичный мусор после смены языка / contentEditable. */
function sanitizeLangScopedHeroCtaButton(
  raw: string,
  lang: PublicLang,
  role: 'bookOnline' | 'whereToFindQuestion',
): string {
  const s = (raw || '').replace(/\u00a0/g, ' ').trim()
  if (!s) return ''
  if (lang === 'ru') return s
  if (HERO_CTA_CYRILLIC.test(s)) return ''
  if (s === uiText.ru[role]) return ''
  const peerEn = uiText.en[role]
  const peerRo = uiText.ro[role]
  if (lang === 'en' && s === peerRo) return ''
  if (lang === 'ro' && s === peerEn) return ''
  const h = Math.floor(s.length / 2)
  if (h >= 8 && s.slice(0, h) === s.slice(h)) return ''
  if (role === 'bookOnline') {
    if (/online\s+online/i.test(s)) return ''
    const compact = s.replace(/\s+/g, '')
    if (/bookonline/i.test(compact) && compact.length >= 20 && /^(.+)\1$/.test(compact)) return ''
  } else {
    if (/\?{2,}\s*$/.test(s)) return ''
    const q = (s.match(/\?/g) || []).length
    if (q > 1) return ''
  }
  return s
}

const TelegramIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M21.5 3.6L2.6 11.4c-.9.4-.9 1.6.1 2l4.8 1.8 1.9 5.9c.2.7 1.1.9 1.7.5l2.7-2 5 3.7c.6.4 1.5.1 1.6-.7l2.9-17.3c.2-.9-.7-1.7-1.8-1.3zm-5.3 14.6l-3.9-2.9 5.6-5.4c.3-.3-.1-.8-.5-.6l-6.7 4.2-3.7-1.4 12.9-5.3-3.7 11.4z"
    />
  </svg>
)

const ViberIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path
      fill="currentColor"
      d="M6.6 10.1c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.9.6.6 0 1 .4 1 1v3.4c0 .6-.4 1-1 1C10.6 20 4 13.4 4 5c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.9.1.4 0 .8-.3 1.1l-2.1 2.1z"
    />
  </svg>
)

const FacebookIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)

const WhatsAppIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const TwitterIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TikTokIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
  </svg>
)

const CONSTRUCTOR_FULL_PREVIEW_STORAGE = '__constructorFullPreview'

/** Запись из конструктора перед «Полный размер» — подставляем slug/тему и черновики, если query обрезан */
function readConstructorFullPreviewIntent(urlSlug: string | undefined): {
  t: number
  slug: string
  theme: string
} | null {
  if (typeof window === 'undefined' || !urlSlug) return null
  try {
    const raw = window.localStorage.getItem(CONSTRUCTOR_FULL_PREVIEW_STORAGE)
    if (!raw) return null
    const o = JSON.parse(raw) as { t: number; slug: string; theme: string }
    if (typeof o.t !== 'number' || typeof o.slug !== 'string' || typeof o.theme !== 'string') return null
    if (Date.now() - o.t > 20_000) return null
    if (o.slug !== urlSlug) return null
    return o
  } catch {
    return null
  }
}

export default function PublicPage() {
  const [publicLang, setPublicLang] = useState<PublicLang>(() => {
    if (typeof window === 'undefined') return 'ru'
    const sp = new URLSearchParams(window.location.search)
    const isConstructorEditPreview = sp.get('preview') === '1' && sp.get('edit') === '1'
    const enabled = isConstructorEditPreview ? getEnabledSiteLangs() : ALL_PUBLIC_LANGS
    const stored = localStorage.getItem('publicLang') as PublicLang | null
    let candidate: PublicLang
    if (stored === 'ru' || stored === 'en' || stored === 'ro') {
      candidate = stored
    } else {
      /** Язык интерфейса админки (`language`) — стартовый язык публичного сайта, пока гость не выбрал другой */
      const adminUiLang = localStorage.getItem('language') as PublicLang | null
      if (adminUiLang === 'ru' || adminUiLang === 'en' || adminUiLang === 'ro') {
        candidate = adminUiLang
      } else {
        const browser = navigator.language?.toLowerCase() || ''
        if (browser.startsWith('ro')) candidate = 'ro'
        else if (browser.startsWith('en')) candidate = 'en'
        else candidate = 'ru'
      }
    }
    const next = normalizePublicLangForEnabled(candidate, enabled)
    try {
      localStorage.setItem('publicLang', next)
    } catch {
      // ignore
    }
    return next
  })
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isLangVisible, setIsLangVisible] = useState(true)
  const [showLoading, setShowLoading] = useState(true)
  type TextKey = Exclude<keyof typeof uiText.ru, 'steps' | 'weekdaysShort'>
  const t = (key: TextKey) => uiText[publicLang][key] || uiText.ru[key]
  const locale = localeByLang[publicLang]
  const steps = uiText[publicLang].steps
  const weekdaysShort = uiText[publicLang].weekdaysShort
  const services = useMemo(() => loadServices(publicLang), [publicLang])
  const staff = useMemo(() => loadStaff(publicLang), [publicLang])
  const activeServices = services.filter((service) => service.active)
  const activeStaff = staff.filter((member) => member.active)
  const isMobile = useIsMobile()
  const location = useLocation()
  const { slug: urlSlug } = useParams<{ slug: string }>()
  const fullPreviewIntent = useMemo(() => readConstructorFullPreviewIntent(urlSlug), [urlSlug])
  const hasFullPreviewIntent = fullPreviewIntent !== null
  const searchParams = new URLSearchParams(location.search)
  /** Свежая метка из конструктора — даёт preview+черновики, даже если в адресе нет ?preview=1 */
  const isPreview =
    searchParams.get('preview') === '1' ||
    hasFullPreviewIntent
  const setLang = (lang: PublicLang) => {
    setPublicLang(lang)
    localStorage.setItem('publicLang', lang)
    setIsLangOpen(false)
    if (isPreview) {
      try {
        window.parent?.postMessage?.({ type: 'constructorPublicLangChanged' }, '*')
      } catch {
        /* ignore */
      }
    }
  }
  const isEditMode = searchParams.get('edit') === '1'
  /** Полный просмотр из конструктора: допускаем full=1 и full=true (некоторые браузеры/редиректы) */
  const fullParam = searchParams.get('full')
  const isFullSizeView = fullParam === '1' || fullParam === 'true'
  /** Явная метка ссылки из конструктора — черновики, даже если full потерялся в URL */
  const constructorPreviewDraft = searchParams.get('constructorPreview') === '1'
  /** Конструктор: кнопка «Мобильный вид» — те же правила, что на телефоне (узкий iframe + этот параметр) */
  const constructorMobilePreview = searchParams.get('mobileFrame') === '1'
  const headerLayoutBranchRaw = searchParams.get('headerLayoutBranch')
  const headerLayoutBranchQuery =
    headerLayoutBranchRaw === 'mobile' || headerLayoutBranchRaw === 'desktop' ? headerLayoutBranchRaw : null
  /** Превью массажного конструктора: те же шаблоны, что у салона, черновики из massage_draft_<slot>_ */
  const massagePreview = searchParams.get('massagePreview') === '1'
  const massageSlotRaw = searchParams.get('massageSlot')
  const validMassageSlot =
    massageSlotRaw && ['hair', 'barber', 'cosmetology', 'coloring', 'manicure'].includes(massageSlotRaw)
      ? massageSlotRaw
      : null
  /** Экран выбора темы в массажном конструкторе: iframe с «чистым» шаблоном, без данных из massage_draft */
  const massageWelcomePreview = searchParams.get('massageWelcome') === '1'
  const isMassagePristineTemplatePreview =
    Boolean(massagePreview && validMassageSlot && massageWelcomePreview)
  /** Демо только на экране выбора темы: превью без редактирования и без режима черновиков конструктора */
  const wantsConstructorDrafts =
    isEditMode ||
    isFullSizeView ||
    constructorPreviewDraft ||
    hasFullPreviewIntent ||
    massagePreview
  const isTemplateDemo = isPreview && !wantsConstructorDrafts
  /**
   * Превью с черновиками конструктора: не гонять тексты через isJunkHeaderText (короткие строки = «мусор»),
   * иначе iframe и «Полный размер» / readOnly показывают разные дефолты. Welcome-массаж — без черновиков.
   */
  const skipHeaderJunkFilterInConstructorPreview =
    isPreview && wantsConstructorDrafts && !isMassagePristineTemplatePreview
  /** Скрыть кнопки превью (полный просмотр / явный constructorPreview) */
  const hidePreviewChrome =
    isFullSizeView || constructorPreviewDraft || (hasFullPreviewIntent && !isEditMode)
  /** Из ссылки «Полный размер» — совпадает с ключами draft_* в конструкторе */
  const draftSlugParam = searchParams.get('draftSlug')
  const draftThemeParam = searchParams.get('draftTheme')
  const slugForDrafts =
    fullPreviewIntent?.slug ||
    (isPreview && draftSlugParam ? draftSlugParam : '') ||
    urlSlug ||
    (typeof window !== 'undefined' ? window.localStorage.getItem('publicSlug') : null) ||
    'salon'

  /** Тема из storage без учёта ?theme= — для fallback в publicHeaderThemeRaw */
  const getStoredHeaderThemePreview = (): string =>
    massagePreview && validMassageSlot
      ? validMassageSlot
      : fullPreviewIntent?.theme
        ? fullPreviewIntent.theme
        : constructorPreviewDraft && draftThemeParam
          ? draftThemeParam
          : localStorage.getItem('draft_publicHeaderTheme') ?? localStorage.getItem('publicHeaderTheme') ?? 'hair'

  const themeFromUrl = searchParams.get('theme')
  const publicHeaderThemeRaw =
    (themeFromUrl === 'premium-hair' || themeFromUrl === 'premium-barber')
      ? themeFromUrl
      : fullPreviewIntent?.theme
        ? fullPreviewIntent.theme
        : constructorPreviewDraft && draftThemeParam
          ? draftThemeParam
          : getStoredHeaderThemePreview() || 'hair'
  const publicHeaderTheme = publicHeaderThemeRaw.startsWith('premium-')
    ? publicHeaderThemeRaw.replace('premium-', '')
    : publicHeaderThemeRaw

  /**
   * Ключи draft_* должны совпадать с ConstructorPage.setDraft / savePremiumDraft:
   * адрес и карта — по полному id темы (premium-hair), остальные поля — themeStorageId (hair).
   * Раньше themeForKey брался только из storage и расходился с URL премиум-превью — черновик писался в один ключ, читался из другого.
   */
  const readPublic = (key: string, fallback = '') => {
    const addressMapKeys = ['publicFooterAddress', 'publicAddress', 'publicMapEmbedUrl']
    const themeForKey = addressMapKeys.includes(key) ? publicHeaderThemeRaw : publicHeaderTheme

    const readLangScopedPublicDraft = (): string | null => {
      if (!isLangScopedPublicDraftKey(key)) return null
      const withLang = `draft_${key}_${slugForDrafts}_${themeForKey}_${publicLang}`
      const v = localStorage.getItem(withLang)
      if (v !== null) return v
      /** Старый ключ без `_ru|en|ro` считаем русским — иначе en/ro показывали бы русский текст */
      if (publicLang === 'ru') {
        return localStorage.getItem(`draft_${key}_${slugForDrafts}_${themeForKey}`)
      }
      return null
    }

    if (!isPreview) {
      if (key === 'publicName') {
        return getCanonicalSalonBusinessName() || fallback
      }
      const ph = readLangScopedPublicDraft()
      if (ph !== null) return ph
      if (isLangScopedPublicDraftKey(key)) {
        return publicLang === 'ru' ? (localStorage.getItem(key) ?? fallback) : fallback
      }
      return localStorage.getItem(key) ?? fallback
    }
    if (key === 'publicHeaderTheme') {
      if (massagePreview && validMassageSlot) return validMassageSlot
      if (fullPreviewIntent?.theme) return fullPreviewIntent.theme
      if (constructorPreviewDraft && draftThemeParam) return draftThemeParam
      return localStorage.getItem('draft_publicHeaderTheme') ?? localStorage.getItem('publicHeaderTheme') ?? fallback
    }
    if (massagePreview && validMassageSlot && isMassagePristineTemplatePreview && typeof window !== 'undefined') {
      if (key === 'publicName') return getCanonicalSalonBusinessName() || fallback
      return ''
    }
    if (massagePreview && validMassageSlot && typeof window !== 'undefined') {
      const mv = readMassageOrdinarySlotString(validMassageSlot, key, publicLang)
      if (mv !== null) return mv
      if (MASSAGE_PREVIEW_SLOT_ONLY_KEYS.has(key)) {
        return ''
      }
      if (publicLang !== 'ru') {
        const mk = massageDraftKeyForPublicPageKey(key)
        if (
          isMassageLangScopedTextKey(mk) &&
          !MASSAGE_PREVIEW_READPUBLIC_FALLTHROUGH_KEYS.has(mk)
        ) {
          return ''
        }
      }
    }
    // Премиум-hero и обычные CTA/подписи футера: черновик на язык; без суффикса — наследие для ru
    if (isLangScopedPublicDraftKey(key)) {
      const withLang = `draft_${key}_${slugForDrafts}_${themeForKey}_${publicLang}`
      let draftVal = localStorage.getItem(withLang)
      if (draftVal === null && publicLang === 'ru') {
        draftVal = localStorage.getItem(`draft_${key}_${slugForDrafts}_${themeForKey}`)
      }
      if (draftVal !== null) return draftVal
      return publicLang === 'ru' ? (localStorage.getItem(key) ?? fallback) : fallback
    } else {
      const draftVal = localStorage.getItem(`draft_${key}_${slugForDrafts}_${themeForKey}`)
      if (draftVal !== null) return draftVal
    }
    if (key === 'publicName') {
      return getCanonicalSalonBusinessName() || fallback
    }
    return localStorage.getItem(key) ?? fallback
  }
  const isPremiumTemplate =
    publicHeaderThemeRaw === 'premium-hair' || publicHeaderThemeRaw === 'premium-barber'

  /**
   * Обычные шаблоны (стандартные темы + массаж): в превью с edit читаем draft_* с запасными slug/темами
   * и глобальными ключами — иначе значение «теряется» и поле откатывается к дефолту.
   */
  const readOrdinaryConstructorFooterField = (key: string): string => {
    const ordinaryFooterKeys = new Set([
      'publicFooterAddress',
      'publicHours',
      'publicDayOff',
      'publicPhone',
      'publicEmail',
    ])
    if (!ordinaryFooterKeys.has(key)) return readPublic(key)

    /**
     * В edit превью сначала draft_* салона (куда пишет onChange), потом слот массажа.
     * Иначе при en/ro без отдельного massage __en читается ru-наследие или readPublic, и поле «отскакивает».
     */
    const readSalonFooterDraftsForEdit = (): string | null => {
      if (
        typeof window === 'undefined' ||
        !isPreview ||
        !isEditMode ||
        isPremiumTemplate ||
        isTemplateDemo
      ) {
        return null
      }
      const slugStored = window.localStorage.getItem('publicSlug') || 'salon'
      const slugCandidates = [...new Set([slugForDrafts, slugStored, 'salon'].filter((s) => String(s).length > 0))]
      const themeCandidates =
        publicHeaderThemeRaw !== publicHeaderTheme
          ? [publicHeaderThemeRaw, publicHeaderTheme]
          : [publicHeaderTheme]
      for (const sp of slugCandidates) {
        for (const th of themeCandidates) {
          const fromDraft = window.localStorage.getItem(`draft_${key}_${sp}_${th}`)
          if (fromDraft !== null) return fromDraft
          if (key === 'publicFooterAddress') {
            const alt = window.localStorage.getItem(`draft_publicAddress_${sp}_${th}`)
            if (alt !== null) return alt
          }
        }
      }
      const legacy = window.localStorage.getItem(key)
      if (legacy !== null) return legacy
      if (key === 'publicFooterAddress') {
        const alt = window.localStorage.getItem('publicAddress')
        if (alt !== null) return alt
      }
      return null
    }

    const fromSalonDraft = readSalonFooterDraftsForEdit()
    if (fromSalonDraft !== null) return fromSalonDraft

    if (massagePreview && validMassageSlot && typeof window !== 'undefined') {
      const mv = readMassageOrdinarySlotString(validMassageSlot, key, publicLang)
      if (mv !== null) return mv
    }

    return readPublic(key)
  }

  const readOrdinaryConstructorFooterNameDraft = (): string | null => {
    if (
      typeof window === 'undefined' ||
      !isPreview ||
      !isEditMode ||
      isPremiumTemplate ||
      isTemplateDemo ||
      isMassagePristineTemplatePreview
    ) {
      return null
    }
    const slugStored = window.localStorage.getItem('publicSlug') || 'salon'
    const slugCandidates = [...new Set([slugForDrafts, slugStored, 'salon'].filter((s) => String(s).length > 0))]
    const themeCandidates =
      publicHeaderThemeRaw !== publicHeaderTheme
        ? [publicHeaderThemeRaw, publicHeaderTheme]
        : [publicHeaderTheme]
    for (const sp of slugCandidates) {
      for (const th of themeCandidates) {
        const v = window.localStorage.getItem(`draft_publicFooterName_${sp}_${th}`)
        if (v !== null) return v
      }
    }
    return null
  }

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null)
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState(formatDateInput(new Date()))
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [clientName, setClientName] = useState('')
  const [clientPhone, setClientPhone] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientComment, setClientComment] = useState('')
  const [clientSocialMethod, setClientSocialMethod] = useState('')
  const [clientSocialHandle, setClientSocialHandle] = useState('')
  const [isMobileSummaryOpen, setIsMobileSummaryOpen] = useState(false)
  const [activeGalleryImage, setActiveGalleryImage] = useState<string | null>(null)
  const bookingSectionRef = useRef<HTMLDivElement>(null)
  const mapSectionRef = useRef<HTMLDivElement>(null)
  const ctaSectionRef = useRef<HTMLDivElement>(null)
  const headerEditContainerRef = useRef<HTMLDivElement>(null)
  const headerSectionRef = useRef<HTMLElement>(null)
  const gallerySectionRef = useRef<HTMLElement>(null)
  const worksSectionRef = useRef<HTMLElement>(null)
  const footerSectionRef = useRef<HTMLElement>(null)
  const [draftVersion, setDraftVersion] = useState(0)
  const draftVersionTrigger = useCallback(() => {
    flushSync(() => setDraftVersion((v) => v + 1))
  }, [])

  /** Drag-and-drop hero в 5 обычных темах массажа: пишем в слот massage_draft_, не в draft_* салона */
  const massageHeroEditStorage = useMemo(() => {
    if (!massagePreview || !validMassageSlot || !isEditMode || typeof window === 'undefined') return null
    const slot = validMassageSlot
    return {
      persistDraft: (key: string, value: string) => {
        if (isMassageLangScopedTextKey(key)) {
          setMassageDraftLangAware(key, publicLang, value)
        } else {
          setMassageDraft(key, value)
        }
        draftVersionTrigger()
        try {
          window.parent?.postMessage({ type: 'constructorMassageDraftChanged' }, '*')
        } catch {
          /* ignore */
        }
      },
      heroLayoutStorage: {
        read: (resolvedKey: string) => window.localStorage.getItem(massageDraftStorageKey(slot, resolvedKey)),
        write: (resolvedKey: string, json: string) => {
          setMassageDraft(resolvedKey, json)
          draftVersionTrigger()
          try {
            window.parent?.postMessage({ type: 'constructorMassageDraftChanged' }, '*')
          } catch {
            /* ignore */
          }
        },
      },
    }
  }, [massagePreview, validMassageSlot, isEditMode, publicLang, draftVersionTrigger])
  /** Раскладка hero: в welcome — дефолт; в edit — слот; иначе чтение из слота без записи (полный просмотр). */
  const massageHeroLayoutStorageForDraggable = useMemo(() => {
    if (!massagePreview || !validMassageSlot || typeof window === 'undefined') return undefined
    const slot = validMassageSlot
    if (isMassagePristineTemplatePreview) {
      return {
        read: () => null,
        write: () => {},
      }
    }
    if (massageHeroEditStorage) return massageHeroEditStorage.heroLayoutStorage
    const read = (resolvedKey: string) =>
      window.localStorage.getItem(massageDraftStorageKey(slot, resolvedKey))
    return { read, write: () => {} }
  }, [
    massagePreview,
    validMassageSlot,
    isMassagePristineTemplatePreview,
    massageHeroEditStorage,
    draftVersion,
  ])

  /** Палитра из массажного конструктора (`publicMassageThemeColors`) для превью 5 обычных тем на PublicPage */
  const massagePreviewThemeColors = useMemo((): MassageThemeColors | undefined => {
    if (
      !massagePreview ||
      !validMassageSlot ||
      !isMassageOrdinaryTemplateId(validMassageSlot) ||
      isMassagePristineTemplatePreview ||
      typeof window === 'undefined'
    ) {
      return undefined
    }
    const raw = readMassageOrdinarySlotString(validMassageSlot, 'publicMassageThemeColors', publicLang)
    return parseMassageThemeColors(raw ?? undefined)
  }, [massagePreview, validMassageSlot, isMassagePristineTemplatePreview, publicLang, draftVersion])

  /**
   * Превью массажа: readPublic сначала читает massage_draft_<slot>_. Если писать только в draft_* салона,
   * первое полное стирание не «держится» — слот по-прежнему отдаёт старый текст.
   */
  const syncSalonFooterFieldToMassageSlot = useCallback(
    (key: string, value: string) => {
      if (!massagePreview || !validMassageSlot || typeof window === 'undefined') return
      if (isMassageLangScopedTextKey(key)) {
        setMassageDraftLangAware(key, publicLang, value)
      } else {
        setMassageDraft(key, value)
      }
      try {
        window.parent?.postMessage?.({ type: 'constructorMassageDraftChanged' }, '*')
      } catch {
        /* ignore */
      }
    },
    [massagePreview, validMassageSlot, publicLang],
  )
  /** Object URL из IndexedDB для премиум hero-видео (маркер в localStorage). */
  const [premiumSalonHeroVideoObjectUrl, setPremiumSalonHeroVideoObjectUrl] = useState<string | null>(null)
  const premiumSalonHeroBlobUrlRef = useRef<string | null>(null)
  const [massageIframeHeroVideoObjectUrl, setMassageIframeHeroVideoObjectUrl] = useState<string | null>(null)
  const massageIframeHeroBlobUrlRef = useRef<string | null>(null)

  /**
   * Как MassagePreviewPage: не привязываемся к частому draftVersion — иначе cleanup отзывал blob URL,
   * оставшийся в state, и <video> оставался с битым src (тёмный фон). Обновление по смене raw, postMessage и poll.
   */
  useEffect(() => {
    const revokeBlob = () => {
      if (premiumSalonHeroBlobUrlRef.current) {
        URL.revokeObjectURL(premiumSalonHeroBlobUrlRef.current)
        premiumSalonHeroBlobUrlRef.current = null
      }
    }

    let cancelled = false
    let lastRaw = '\u0000'
    let loadGen = 0

    const sync = () => {
      if (cancelled) return
      if (!isPremiumTemplate || isTemplateDemo || massagePreview) {
        if (lastRaw !== '\u0001') {
          lastRaw = '\u0001'
          revokeBlob()
          setPremiumSalonHeroVideoObjectUrl(null)
        }
        return
      }
      const raw = readPublic('publicHeroVideo') || ''
      if (raw === lastRaw) return
      lastRaw = raw
      loadGen += 1
      const myGen = loadGen
      revokeBlob()
      setPremiumSalonHeroVideoObjectUrl(null)

      if (!raw) {
        return
      }
      if (raw !== SALON_PREMIUM_HERO_VIDEO_IDB_MARKER) {
        setPremiumSalonHeroVideoObjectUrl(null)
        return
      }

      void (async () => {
        try {
          const slugStored =
            typeof window !== 'undefined' ? (window.localStorage.getItem('publicSlug') || 'salon') : slugForDrafts
          let u = await loadSalonPremiumHeroVideoObjectUrl(slugStored, publicHeaderTheme)
          if (!u && slugForDrafts && slugStored !== slugForDrafts) {
            u = await loadSalonPremiumHeroVideoObjectUrl(slugForDrafts, publicHeaderTheme)
          }
          if (cancelled || myGen !== loadGen) {
            if (u) URL.revokeObjectURL(u)
            return
          }
          if (!u) {
            setPremiumSalonHeroVideoObjectUrl(null)
            return
          }
          premiumSalonHeroBlobUrlRef.current = u
          setPremiumSalonHeroVideoObjectUrl(u)
        } catch {
          if (!cancelled && myGen === loadGen) setPremiumSalonHeroVideoObjectUrl(null)
        }
      })()
    }

    sync()
    const pollId = window.setInterval(sync, 500)
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'constructorDraftChange') sync()
    }
    window.addEventListener('message', onMsg)
    return () => {
      cancelled = true
      window.clearInterval(pollId)
      window.removeEventListener('message', onMsg)
      revokeBlob()
      setPremiumSalonHeroVideoObjectUrl(null)
    }
  }, [
    isPremiumTemplate,
    isTemplateDemo,
    massagePreview,
    slugForDrafts,
    publicHeaderTheme,
    isPreview,
    publicLang,
    publicHeaderThemeRaw,
  ])

  /** Hero-видео: 5 массажных шаблонов в iframe (IDB) */
  useEffect(() => {
    const revokeMassage = () => {
      if (massageIframeHeroBlobUrlRef.current) {
        URL.revokeObjectURL(massageIframeHeroBlobUrlRef.current)
        massageIframeHeroBlobUrlRef.current = null
      }
    }

    let cancelled = false
    let lastMassageSig = '\u0000'
    let massageGen = 0

    const sync = () => {
      if (cancelled) return

      const massageOk =
        massagePreview &&
        validMassageSlot &&
        !isMassagePristineTemplatePreview &&
        !isTemplateDemo

      if (!massageOk) {
        if (lastMassageSig !== '') {
          lastMassageSig = ''
          revokeMassage()
          setMassageIframeHeroVideoObjectUrl(null)
        }
      } else {
        const rawM = readPublic('publicHeroVideo') || ''
        const slot = validMassageSlot
        const sigM = `${slot}|${rawM}`
        if (sigM !== lastMassageSig) {
          lastMassageSig = sigM
          massageGen += 1
          const myGen = massageGen
          revokeMassage()
          setMassageIframeHeroVideoObjectUrl(null)
          if (!rawM || rawM !== MASSAGE_HERO_VIDEO_IDB_MARKER) {
            return
          }
          void (async () => {
            try {
              const u = await loadMassageHeroVideoObjectUrl(slot)
              if (cancelled || myGen !== massageGen) {
                if (u) URL.revokeObjectURL(u)
                return
              }
              if (!u) {
                setMassageIframeHeroVideoObjectUrl(null)
                return
              }
              massageIframeHeroBlobUrlRef.current = u
              setMassageIframeHeroVideoObjectUrl(u)
            } catch {
              if (!cancelled && myGen === massageGen) setMassageIframeHeroVideoObjectUrl(null)
            }
          })()
        }
      }
    }

    sync()
    const pollId = window.setInterval(sync, 500)
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'constructorDraftChange' || e.data?.type === 'constructorMassageDraftChanged') sync()
    }
    window.addEventListener('message', onMsg)
    return () => {
      cancelled = true
      window.clearInterval(pollId)
      window.removeEventListener('message', onMsg)
      revokeMassage()
      setMassageIframeHeroVideoObjectUrl(null)
    }
  }, [
    massagePreview,
    validMassageSlot,
    isMassagePristineTemplatePreview,
    isTemplateDemo,
    draftVersion,
    isPreview,
    publicLang,
    publicHeaderThemeRaw,
  ])

  /** В конструкторе (превью + редактирование) — только языки из сайдбара; на опубликованном сайте и в превью без edit — все три */
  const langsForPublicSwitcher = useMemo((): PublicLang[] => {
    if (typeof window === 'undefined') return ALL_PUBLIC_LANGS
    if (isPreview && isEditMode) return getEnabledSiteLangs()
    return ALL_PUBLIC_LANGS
  }, [draftVersion, isPreview, isEditMode])
  const showPublicLangSwitcher = langsForPublicSwitcher.length > 1
  const [showSuccess, setShowSuccess] = useState(false)
  const successTimeoutRef = useRef<number | null>(null)
  const [isSocialOpen, setIsSocialOpen] = useState(false)
  const [isHeaderDragging, setIsHeaderDragging] = useState(false)
  const navigate = useNavigate()
  const socialRef = useRef<HTMLDivElement>(null)
  const lastScrollYRef = useRef(0)

  useEffect(() => {
    const handleOutside = (event: MouseEvent) => {
      if (socialRef.current && !socialRef.current.contains(event.target as Node)) {
        setIsSocialOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.scrollTo({ top: 0, left: 0 })
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && urlSlug) {
      try {
        window.localStorage.setItem('publicSlug', urlSlug)
      } catch {
        // ignore
      }
    }
  }, [urlSlug])

  /** Подгонка текущего языка под чекбоксы конструктора только в режиме редактирования превью */
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!isPreview || !isEditMode) return
    const enabled = getEnabledSiteLangs()
    setPublicLang((prev) => {
      const next = normalizePublicLangForEnabled(prev, enabled)
      if (next !== prev) {
        try {
          localStorage.setItem('publicLang', next)
        } catch {
          // ignore
        }
      }
      return next
    })
  }, [draftVersion, isPreview, isEditMode])

  useEffect(() => {
    if (!isPreview || typeof window === 'undefined') return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'constructorDraftChange' || e.data?.type === 'constructorMassageDraftChanged') {
        setDraftVersion((v) => v + 1)
      }
      if (e.data?.type === 'scrollToSection' && typeof e.data?.sectionId === 'string') {
        const map: Record<string, React.RefObject<HTMLElement | null>> = {
          header: headerSectionRef,
          gallery: gallerySectionRef,
          booking: bookingSectionRef,
          works: worksSectionRef,
          map: mapSectionRef,
          cta: ctaSectionRef as React.RefObject<HTMLElement | null>,
          footer: footerSectionRef,
        }
        const ref = map[e.data.sectionId]
        if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [isPreview])

  useEffect(() => {
    if (!isPreview || typeof window === 'undefined') return
    /** Превью 5 массажных шаблонов: родительский MassageConstructor не слушает publicPageSectionInView — интервал только тратит main thread при скролле. */
    if (massagePreview) return
    const sections: { id: string; ref: React.RefObject<HTMLElement | null> }[] = [
      { id: 'header', ref: headerSectionRef },
      { id: 'gallery', ref: gallerySectionRef },
      { id: 'booking', ref: bookingSectionRef },
      { id: 'works', ref: worksSectionRef },
      { id: 'map', ref: mapSectionRef },
      { id: 'cta', ref: ctaSectionRef as React.RefObject<HTMLElement | null> },
      { id: 'footer', ref: footerSectionRef },
    ]
    let lastSent = ''
    const timer = window.setInterval(() => {
      const viewHeight = window.innerHeight
      const scrollBottom = window.scrollY + viewHeight
      const pageHeight = document.documentElement.scrollHeight
      const nearBottom = pageHeight - scrollBottom < 60

      let best = ''
      let bestRatio = 0
      for (const { id, ref } of sections) {
        const el = ref.current
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const visibleTop = Math.max(0, rect.top)
        const visibleBottom = Math.min(viewHeight, rect.bottom)
        const visible = Math.max(0, visibleBottom - visibleTop)
        // For the footer, if we're near the bottom of the page give it a full ratio
        const effectiveHeight = (id === 'footer' && nearBottom) ? 1 : Math.min(rect.height, viewHeight)
        const ratio = visible / Math.max(1, effectiveHeight)
        if (ratio > bestRatio) {
          bestRatio = ratio
          best = id
        }
      }
      if (best && best !== lastSent) {
        lastSent = best
        try {
          window.parent?.postMessage?.({ type: 'publicPageSectionInView', sectionId: best }, '*')
        } catch {
          // ignore
        }
      }
    }, 250)
    return () => clearInterval(timer)
  }, [isPreview, massagePreview])

  useEffect(() => {
    let finished = false
    const finishLoading = () => {
      if (finished) return
      finished = true
      window.setTimeout(() => setShowLoading(false), 600)
    }
    if (document.readyState === 'complete') {
      finishLoading()
    } else {
      window.addEventListener('load', finishLoading)
    }
    const fallback = window.setTimeout(finishLoading, 2000)
    return () => {
      window.removeEventListener('load', finishLoading)
      window.clearTimeout(fallback)
    }
  }, [])

  // Скрыть полосу прокрутки при открытии в iframe (превью конструктора)
  useEffect(() => {
    if (typeof window === 'undefined' || window.self === window.top) return
    document.documentElement.classList.add('preview-embed')
    return () => {
      document.documentElement.classList.remove('preview-embed')
    }
  }, [])

  /** Полный размер в отдельной вкладке: те же CSS, что у превью в iframe (ширина title/tagline и т.д.) */
  useEffect(() => {
    if (typeof window === 'undefined' || window.self !== window.top) return
    const parity =
      isPreview &&
      wantsConstructorDrafts &&
      (isFullSizeView || constructorPreviewDraft || hasFullPreviewIntent)
    if (!parity) return
    document.documentElement.classList.add('preview-embed')
    return () => document.documentElement.classList.remove('preview-embed')
  }, [
    isPreview,
    wantsConstructorDrafts,
    isFullSizeView,
    constructorPreviewDraft,
    hasFullPreviewIntent,
  ])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('constructor-mobile-frame', constructorMobilePreview)
    return () => document.documentElement.classList.remove('constructor-mobile-frame')
  }, [constructorMobilePreview])

  /** Полный экран из конструктора в моб. режиме: узкий layout viewport — как в iframe, без отдельного окна (те же @media max-width). */
  useEffect(() => {
    if (typeof document === 'undefined') return
    const meta = document.querySelector('meta[name="viewport"]')
    if (!meta) return
    const defaultContent = 'width=device-width, initial-scale=1.0'
    const narrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
    const applyNarrowViewport =
      isPreview &&
      (isFullSizeView || constructorPreviewDraft || hasFullPreviewIntent) &&
      constructorMobilePreview &&
      !isEditMode &&
      !narrow
    const previous = meta.getAttribute('content') || defaultContent
    if (applyNarrowViewport) {
      meta.setAttribute('content', 'width=430, initial-scale=1, viewport-fit=cover')
    }
    return () => {
      if (applyNarrowViewport) meta.setAttribute('content', previous)
    }
  }, [
    isPreview,
    isFullSizeView,
    constructorPreviewDraft,
    hasFullPreviewIntent,
    constructorMobilePreview,
    isEditMode,
  ])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (!showSuccess) return
    const previousOverflow = document.body.style.overflow
    const previousTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'none'
    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.touchAction = previousTouchAction
    }
  }, [showSuccess])

  useEffect(() => {
    if (typeof document === 'undefined') return
    if (showSuccess) return
    document.documentElement.style.overflow = 'auto'
    document.body.style.overflow = 'auto'
    document.body.style.touchAction = 'auto'
    document.body.style.position = ''
    document.body.style.top = ''
    document.body.style.width = ''
  }, [showSuccess])


  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY
      if (current <= 4) {
        setIsLangVisible(true)
      } else if (current > lastScrollYRef.current + 4) {
        setIsLangVisible(false)
        setIsLangOpen(false)
      } else if (current < lastScrollYRef.current - 4) {
        setIsLangVisible(true)
      }
      lastScrollYRef.current = current
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [setIsLangOpen])


  const selectedService = activeServices.find((service) => service.id === selectedServiceId) || null
  const availableStaff = selectedService
    ? activeStaff.filter((member) => member.services.includes(selectedService.name))
    : activeStaff
  const selectedStaff = availableStaff.find((member) => member.id === selectedStaffId) || null

  const slots = useMemo(() => {
    if (selectedStaff?.workingHours) {
      return generateSlots(selectedStaff.workingHours.start, selectedStaff.workingHours.end)
    }
    return generateSlots('09:00', '18:00')
  }, [selectedStaff])

  const socialOptions = ['Telegram', 'WhatsApp', 'Viber', 'Instagram', 'Facebook']

  const busySlots = useMemo(() => {
    if (!selectedStaff) return new Set<string>()
    const appointments = loadAppointments()
    const staffName = selectedStaff.name
    const slotsForDay = appointments.filter((apt) => {
      const aptStaff = apt.staff || apt.master
      const aptDate = apt.date
      return aptStaff === staffName && aptDate === selectedDate
    })
    const liveBusy = slotsForDay.map((apt) => apt.time || apt.startTime).filter(Boolean)
    // Demo busy slots for testing visibility
    const demoBusy = ['12:00', '15:00', '17:00']
    return new Set([...liveBusy, ...demoBusy])
  }, [selectedDate, selectedStaff])

  const MAX_HEADER_SUBTITLE_LINES = 4
  const normalizeHeaderSubtitle = (value: string) => value.replace(/\r\n|\r/g, '\n')
  const clampHeaderSubtitleLines = (value: string) => {
    const normalized = normalizeHeaderSubtitle(value)
    const lines = normalized.split('\n')
    return lines.length > MAX_HEADER_SUBTITLE_LINES ? lines.slice(0, MAX_HEADER_SUBTITLE_LINES).join('\n') : normalized
  }
  const isJunkHeaderText = (s: string) => {
    if (!s || typeof s !== 'string') return true
    const t = s.trim()
    if (t.length < 2) return true
    /** Сначала «мусор» по шаблону — иначе длинная строка с «салон»/«красоты» не доходила до проверки на повтор символов (ыыыы…). */
    const junkPattern = /(.)\1{3,}|(..)\2{2,}|dsds|sdsd|saaa|sdad|saaf|dassd|^[dsa]{8,}$/i
    if (junkPattern.test(t)) return true
    const hasCyrillic = /[а-яёА-ЯЁ]/.test(t)
    const hasRealWords = hasCyrillic || /\b(the|your|salon|beauty|запись|салон|красоты)\b/i.test(t)
    if (hasRealWords && t.length > 10) return false
    return (t.length > 12 && !hasCyrillic && (t.match(/[aeiou]/gi)?.length ?? 0) < 2)
  }

  const draftNameKey =
    typeof window !== 'undefined' &&
    !isTemplateDemo &&
    !isMassagePristineTemplatePreview &&
    slugForDrafts &&
    publicHeaderTheme
      ? `draft_publicName_${slugForDrafts}_${publicHeaderTheme}`
      : null
  const draftNameRaw = draftNameKey != null && typeof window !== 'undefined' ? window.localStorage.getItem(draftNameKey) : null
  /** Название в футере — отдельный черновик от hero (draft_publicName) */
  const draftFooterNameKey =
    typeof window !== 'undefined' &&
    !isTemplateDemo &&
    !isMassagePristineTemplatePreview &&
    slugForDrafts &&
    publicHeaderTheme
      ? `draft_publicFooterName_${slugForDrafts}_${publicHeaderTheme}`
      : null
  const draftFooterNameRaw =
    typeof window !== 'undefined'
      ? (readOrdinaryConstructorFooterNameDraft() ??
        (draftFooterNameKey != null ? window.localStorage.getItem(draftFooterNameKey) : null))
      : null
  /** Название из регистрации — и в превью выбора шаблона (isTemplateDemo), не только в полном редакторе */
  const salonNameFromRegistration =
    typeof window !== 'undefined' ? getCanonicalSalonBusinessName() : ''
  const defaultSalonNameSet = useMemo(
    () =>
      new Set([
        FOOTER_DEFAULT_NAME,
        uiText.ru.defaultSalonName,
        uiText.en.defaultSalonName,
        uiText.ro.defaultSalonName,
        HAIR_THEME_DEFAULT_NAME,
        'Березницкий',
      ]),
    []
  )
  const isLegacyName = (s: string) => {
    const st = String(s).trim()
    if (!st) return true
    if (defaultSalonNameSet.has(st)) return true
    return st === t('defaultSalonName')
  }
  /** Черновик с дефолтным «Твой салон…» не должен перекрывать имя из регистрации (например Salon Krasoti). */
  const rawName = (() => {
    if (isMassagePristineTemplatePreview) return salonNameFromRegistration || t('defaultSalonName')
    if (isTemplateDemo) return salonNameFromRegistration || t('defaultSalonName')
    if (draftNameRaw !== null && draftNameRaw !== '') {
      if (!isLegacyName(draftNameRaw)) return draftNameRaw
      if (salonNameFromRegistration && !isLegacyName(salonNameFromRegistration)) return salonNameFromRegistration
      return salonNameFromRegistration || t('defaultSalonName')
    }
    return (
      readPublic('publicName') ||
      localStorage.getItem('businessName') ||
      (isPreview ? FOOTER_DEFAULT_NAME : null) ||
      HAIR_THEME_DEFAULT_NAME ||
      t('defaultSalonName')
    )
  })()
  /** В превью конструктора при наличии черновика имя берём как в storage (в т.ч. пустая строка и 1–2 символа), иначе isJunkHeaderText сбрасывает ввод в дефолт */
  const publicName =
    rawName === '' && isPreview && !isTemplateDemo
      ? ''
      : draftNameKey != null && draftNameRaw !== null && isPreview && !isTemplateDemo && !isLegacyName(draftNameRaw)
        ? draftNameRaw
        : skipHeaderJunkFilterInConstructorPreview
          ? rawName
          : isJunkHeaderText(rawName)
            ? t('defaultSalonName')
            : rawName
  const useBuiltInTemplate = isTemplateDemo || isPreview
  const storedName =
    draftNameRaw !== null
      ? draftNameRaw
      : readPublic('publicName') || localStorage.getItem('businessName') || ''
  const headerDisplayName =
    useBuiltInTemplate && storedName !== '' && isLegacyName(storedName || '')
      ? salonNameFromRegistration || t('defaultSalonName')
      : publicName
  const isPremiumTheme = publicHeaderThemeRaw === 'premium-hair' || publicHeaderThemeRaw === 'premium-barber'
  const premiumPd = PREMIUM_PUBLIC_DEFAULTS_BY_LANG[publicLang] ?? PREMIUM_PUBLIC_DEFAULTS_BY_LANG.ru
  const hairLangDef = HAIR_DEFAULTS_BY_LANG[publicLang] ?? HAIR_DEFAULTS_BY_LANG.ru
  const rawTagline = (() => {
    if (isMassagePristineTemplatePreview) return hairLangDef.tagline || t('defaultTagline')
    if (isPremiumTheme) {
      if (isTemplateDemo) return premiumPd.tagline
      if (typeof window === 'undefined') return premiumPd.tagline
      const taglineKey = `draft_publicTagline_${slugForDrafts}_${publicHeaderTheme}`
      const stored = window.localStorage.getItem(taglineKey)
      return stored !== null ? stored : (premiumPd.tagline || t('defaultTagline'))
    }
    if (massagePreview && validMassageSlot && typeof window !== 'undefined') {
      const mv = readMassageOrdinarySlotString(validMassageSlot, 'publicTagline', publicLang)
      if (mv !== null) return mv
      if (publicLang !== 'ru') {
        return hairLangDef.tagline || t('defaultTagline')
      }
    }
    if (isTemplateDemo) return hairLangDef.tagline
    if (typeof window === 'undefined') return hairLangDef.tagline || ''
    const taglineKey = `draft_publicTagline_${slugForDrafts}_${publicHeaderTheme}`
    const stored = window.localStorage.getItem(taglineKey)
    return stored !== null ? stored : (hairLangDef.tagline || t('defaultTagline'))
  })()
  const publicTagline = clampHeaderSubtitleLines(
    rawTagline === ''
      ? ''
      : skipHeaderJunkFilterInConstructorPreview
        ? rawTagline
        : isJunkHeaderText(rawTagline)
          ? (isPremiumTheme ? premiumPd.tagline : hairLangDef.tagline)
          : rawTagline
  )
  const rawFooterName =
    isMassagePristineTemplatePreview
      ? salonNameFromRegistration || t('defaultSalonName')
      : isTemplateDemo
      ? salonNameFromRegistration || t('defaultSalonName')
      : draftFooterNameRaw !== null
        ? draftFooterNameRaw
        : readPublic('publicFooterName') ||
          readPublic('publicName') ||
          localStorage.getItem('businessName') ||
          (isPreview ? t('defaultSalonName') : null) ||
          HAIR_THEME_DEFAULT_NAME ||
          t('defaultSalonName')
  const footerName =
    rawFooterName === '' && isPreview && !isTemplateDemo
      ? ''
      : draftFooterNameKey != null && draftFooterNameRaw !== null && isPreview && !isTemplateDemo
        ? draftFooterNameRaw
        : skipHeaderJunkFilterInConstructorPreview
          ? rawFooterName
          : isJunkHeaderText(rawFooterName)
            ? t('defaultSalonName')
            : rawFooterName
  const storedFooterName =
    draftFooterNameRaw !== null
      ? draftFooterNameRaw
      : readPublic('publicFooterName') ||
        readPublic('publicName') ||
        localStorage.getItem('businessName') ||
        ''
  const footerDisplayName =
    footerName === ''
      ? ''
      : useBuiltInTemplate && isLegacyName(storedFooterName || '')
        ? t('defaultSalonName')
        : (footerName || t('defaultSalonName'))
  const storedAddressRaw = readOrdinaryConstructorFooterField('publicFooterAddress')
  const storedHoursRaw = readOrdinaryConstructorFooterField('publicHours')
  const storedDayOffRaw = readOrdinaryConstructorFooterField('publicDayOff')
  const storedPhoneRaw = readOrdinaryConstructorFooterField('publicPhone')
  const storedEmailRaw = readOrdinaryConstructorFooterField('publicEmail')
  const addressCleared = isFooterFieldClearedMarker(storedAddressRaw)
  const hoursCleared = isFooterFieldClearedMarker(storedHoursRaw)
  const dayOffCleared = isFooterFieldClearedMarker(storedDayOffRaw)
  const phoneCleared = isFooterFieldClearedMarker(storedPhoneRaw)
  const emailCleared = isFooterFieldClearedMarker(storedEmailRaw)
  const storedAddress = addressCleared ? '' : storedAddressRaw
  const storedHours = hoursCleared ? '' : storedHoursRaw
  const storedDayOff = dayOffCleared ? '' : storedDayOffRaw
  const storedPhone = phoneCleared ? '' : storedPhoneRaw
  const storedEmail = emailCleared ? '' : storedEmailRaw
  const isLegacyPhone = (s: string) => !s || /^\+373\s*123\s*456(\s*\d*)?$/.test(String(s).replace(/\s+/g, ' ').trim())
  const isLegacyEmail = (s: string) => {
    const t = String(s).trim()
    if (!t) return true
    return /^hello@bookera\.app$/i.test(t) || /^jane@luxestudio\.com$/i.test(t)
  }
  const isLegacyAddress = (s: string) => {
    const t = String(s).trim()
    if (!t) return true
    if (t === FOOTER_DEFAULT_ADDRESS) return true
    for (const def of Object.values(FOOTER_DEFAULTS_BY_LANG)) {
      if (t === def.address) return true
    }
    if (t.split(/[\s,]+/).length <= 1 && t.length < 25) return true
    /** На en/ro один короткий кириллический фрагмент без запятых («береза») — подставляем адрес-заглушку на языке сайта */
    if (
      publicLang !== 'ru' &&
      /[\u0400-\u04FF]/.test(t) &&
      !t.includes(',') &&
      t.length < 48
    ) {
      return true
    }
    /**
     * RU и др.: 2–3 «слова»-каша на кириллице без цифр и запятых («ыы выв») — раньше не попадало под legacy.
     * Плюс общий мусор (как у подзаголовка hero) и явный повтор символа в короткой строке.
     */
    const looksLikeStreetHint = /\b(ул|улиц|просп|бульв|переул|шоссе|дом|кв|офис|гор\.|г\.)\b/i.test(t)
    if (
      t.length < 48 &&
      !/\d/.test(t) &&
      !t.includes(',') &&
      /[\u0400-\u04FF]/.test(t) &&
      !looksLikeStreetHint &&
      (isJunkHeaderText(t) || (/(.)\1/.test(t) && t.length < 36))
    ) {
      return true
    }
    return false
  }
  const fld = FOOTER_DEFAULTS_BY_LANG[publicLang] ?? FOOTER_DEFAULTS_BY_LANG.ru
  /** Для гостя и превью без edit: заглушки/«мусор» → дефолт на текущем языке (на живом сайте раньше useBuiltInTemplate=false и «береза» не заменялась). */
  const visitorFooterAddressResolved =
    addressCleared
      ? ''
      : isLegacyAddress(storedAddress || '')
        ? fld.address
        : (storedAddress || fld.address)
  /** Адрес для карты: в конструкторе редактируют publicAddress, во футере — publicFooterAddress; для превью учитываем оба.
   *  В режиме редактирования используем только явно установленный адрес (null-safe чтение), чтобы не показывать устаревшие данные. */
  const mapSourceAddress = (() => {
    if (isPreview && isEditMode && typeof window !== 'undefined') {
      const slugStored = window.localStorage.getItem('publicSlug') || 'salon'
      const slugCandidates = [...new Set([slugForDrafts, slugStored, 'salon'].filter((s) => String(s).length > 0))]
      const themeCandidates =
        publicHeaderThemeRaw !== publicHeaderTheme
          ? [publicHeaderThemeRaw, publicHeaderTheme]
          : [publicHeaderThemeRaw]
      for (const slug of slugCandidates) {
        for (const th of themeCandidates) {
          const v =
            window.localStorage.getItem(`draft_publicAddress_${slug}_${th}`) ??
            window.localStorage.getItem(`draft_publicFooterAddress_${slug}_${th}`)
          if (v != null && v !== '') {
            return displayFooterFieldStored(v).trim()
          }
        }
      }
      return ''
    }
    const addrLine = readPublic('publicAddress')
    const addrNorm = (isFooterFieldClearedMarker(addrLine) ? '' : addrLine).trim()
    const publicLineResolved =
      !addrNorm ? '' : isLegacyAddress(addrNorm) ? fld.address : addrNorm
    return (publicLineResolved || visitorFooterAddressResolved).trim()
  })()
  const isLegacyHours = (s: string) => !s || String(s).trim() === ''
  const isLegacyDayOff = (s: string) => !s || String(s).trim() === ''
  /** Превью конструктора с edit=1: адрес без полной isLegacyAddress (не затираем «City» по буквам); часы/выходной — с той же локализацией, что у гостя. */
  const footerInConstructorEdit = isPreview && isEditMode
  /** Демо выбора темы и редактирование: подписи колонок футера из i18n, без publicFooterLabels с другого языка. */
  const useTranslatedFooterColumnLabels = isTemplateDemo || footerInConstructorEdit
  const publicFooterAddress = footerInConstructorEdit
    ? addressCleared
      ? ''
      : displayFooterFieldStored(storedAddressRaw)
    : visitorFooterAddressResolved
  const footerDisplayAddress = publicFooterAddress
  const footerDisplayHoursVisitorRaw =
    hoursCleared
      ? ''
      : isLegacyHours(storedHours || '')
        ? fld.hours
        : (storedHours || fld.hours)
  const footerDisplayDayOffVisitorRaw =
    dayOffCleared
      ? ''
      : isLegacyDayOff(storedDayOff || '')
        ? fld.dayOff
        : (storedDayOff || fld.dayOff)
  const footerDisplayHoursEditRaw =
    hoursCleared
      ? ''
      : footerInConstructorEdit && !isPremiumTemplate
        ? displayFooterFieldStored(storedHoursRaw || '')
        : isLegacyHours(storedHoursRaw || '')
          ? fld.hours
          : (storedHoursRaw || fld.hours)
  const footerDisplayDayOffEditRaw =
    dayOffCleared
      ? ''
      : footerInConstructorEdit && !isPremiumTemplate
        ? displayFooterFieldStored(storedDayOffRaw || '')
        : isLegacyDayOff(storedDayOffRaw || '')
          ? fld.dayOff
          : (storedDayOffRaw || fld.dayOff)
  const footerDisplayHours = footerInConstructorEdit
    ? localizeFooterHoursLine(footerDisplayHoursEditRaw, publicLang, fld.hours)
    : localizeFooterHoursLine(footerDisplayHoursVisitorRaw, publicLang, fld.hours)
  const footerDisplayDayOff = footerInConstructorEdit
    ? localizeFooterDayOffLine(footerDisplayDayOffEditRaw, publicLang, fld.dayOff)
    : localizeFooterDayOffLine(footerDisplayDayOffVisitorRaw, publicLang, fld.dayOff)
  const footerDisplayPhone =
    phoneCleared
      ? ''
      : footerInConstructorEdit && !isPremiumTemplate
        ? displayFooterFieldStored(storedPhoneRaw || '')
        : footerInConstructorEdit
          ? isLegacyPhone(storedPhoneRaw || '')
            ? fld.phone
            : (storedPhoneRaw || fld.phone)
          : isLegacyPhone(storedPhone || '')
            ? fld.phone
            : (storedPhone || fld.phone)
  const footerDisplayEmail =
    emailCleared
      ? ''
      : footerInConstructorEdit && !isPremiumTemplate
        ? displayFooterFieldStored(storedEmailRaw || '')
        : footerInConstructorEdit
          ? isLegacyEmail(storedEmailRaw || '')
            ? fld.email
            : (storedEmailRaw || fld.email)
          : isLegacyEmail(storedEmail || '')
            ? fld.email
            : (storedEmail || fld.email)
  const publicLogoRaw = readPublic('publicLogo')
  /** Старый логотип для хедера (data URL) подменяем на дефолтный файл, чтобы не тянуть огромные data URL */
  const publicLogo =
    publicLogoRaw && publicLogoRaw.startsWith('data:')
      ? DEFAULT_LOGO_URL
      : (publicLogoRaw || DEFAULT_LOGO_URL)
  /** Логотип футера: сначала пытаемся взять отдельный publicFooterLogo, потом общий publicLogoRaw; data URL допускаются */
  const publicFooterLogoRaw = readPublic('publicFooterLogo') || publicLogoRaw || ''
  const publicFooterLogo = publicFooterLogoRaw
  /** Формы логотипов: футер по умолчанию наследует форму основного логотипа */
  const publicLogoShape =
    (readPublic('publicLogoShape') as 'circle' | 'rounded' | 'square') || 'circle'
  const publicFooterLogoShape =
    (readPublic('publicFooterLogoShape') as 'circle' | 'rounded' | 'square') || publicLogoShape
  const footerLogoDisplayShape = publicFooterLogoShape
  const publicPhone = phoneCleared ? '' : (storedPhone || fld.phone)
  const publicEmail = emailCleared ? '' : (storedEmail || fld.email)
  const publicTelegram = readPublic('publicTelegram') || ''
  const publicViber = readPublic('publicViber') || ''
  const publicInstagram = readPublic('publicInstagram') || ''
  const publicFacebook = readPublic('publicFacebook') || ''
  const publicWhatsapp = readPublic('publicWhatsapp') || ''
  const publicTwitter = readPublic('publicTwitter') || ''
  const publicTiktok = readPublic('publicTiktok') || ''
  const rawBookingTitle = readPublic('publicBookingTitle') || ''
  const rawBookingSubtitle = readPublic('publicBookingSubtitle') || ''
  const isTypoBookingTitle = /Запп+ись|клтаврр/.test(rawBookingTitle)
  const isTypoBookingSubtitle = /Вберите|специа{2,}листа/.test(rawBookingSubtitle)
  const publicBookingTitle =
    !rawBookingTitle || isTypoBookingTitle ? hairLangDef.bookingTitle : rawBookingTitle
  const publicBookingSubtitle =
    !rawBookingSubtitle || isTypoBookingSubtitle ? hairLangDef.bookingSub : rawBookingSubtitle
  const publicHeaderPrimaryCta = sanitizeLangScopedHeroCtaButton(
    readPublic('publicHeaderPrimaryCta') || '',
    publicLang,
    'bookOnline',
  )
  const publicHeaderSecondaryCta = sanitizeLangScopedHeroCtaButton(
    readPublic('publicHeaderSecondaryCta') || '',
    publicLang,
    'whereToFindQuestion',
  )
  const publicHeaderExtraText = readPublic('publicHeaderExtraText') || ''
  const publicHeaderPrimaryCtaShape =
    (readPublic('publicHeaderPrimaryCtaShape') as 'square' | 'round') || 'round'
  const publicHeaderSecondaryCtaShape =
    (readPublic('publicHeaderSecondaryCtaShape') as 'square' | 'round') || 'square'
  const publicHeaderLogoPlacement =
    (readPublic('publicHeaderLogoPlacement') as 'corner' | 'left' | 'above' | 'corner-left-title') ||
    'above'
  const publicHeaderLogoShape =
    (readPublic('publicHeaderLogoShape') as 'circle' | 'rounded' | 'square') || 'circle'
  const headerLogoDisplayShape = publicHeaderLogoShape
  const publicHeaderLogoVisible = readPublic('publicHeaderLogoVisible', 'true') !== 'false'
  const publicBodyBackgroundChoice =
    readPublic('publicBodyBackgroundChoice') || 'bg-2'
  const publicFooterLogoVisible = readPublic('publicFooterLogoVisible', 'true') !== 'false'
  /** Один и тот же порядок цветов для названия, описания и кнопок */
  const barberTextOptions = [
    { id: 'gold', color: '#F6C453', glow: '0 0 14px rgba(246,196,83,0.55)' },
    { id: 'blue', color: '#3b82f6', glow: '0 0 14px rgba(59,130,246,0.55)' },
    { id: 'red', color: '#ef4444', glow: '0 0 14px rgba(239,68,68,0.55)' },
    { id: 'pink', color: '#FF4D9D', glow: '0 0 16px rgba(255,77,157,0.6)' },
    { id: 'coral', color: '#FDA4AF', glow: '0 0 16px rgba(253,164,175,0.6)' },
    { id: 'violet', color: '#C7B7FF', glow: '0 0 16px rgba(199,183,255,0.6)' },
    { id: 'orange', color: '#f97316', glow: '0 0 14px rgba(249,115,22,0.55)' },
    { id: 'lime', color: '#84cc16', glow: '0 0 14px rgba(132,204,22,0.55)' },
    { id: 'emerald', color: '#4ADE80', glow: '0 0 16px rgba(74,222,128,0.55)' },
    { id: 'white', color: '#FFFFFF', glow: '0 0 14px rgba(255,255,255,0.55)' },
    { id: 'indigo', color: '#6366f1', glow: '0 0 14px rgba(99,102,241,0.55)' },
    { id: 'gray', color: '#6b7280', glow: '0 0 14px rgba(107,114,128,0.55)' },
    { id: 'brown', color: '#92400e', glow: '0 0 14px rgba(146,64,14,0.55)' },
    { id: 'black', color: '#0b0b0b', glow: '0 0 14px rgba(0,0,0,0.55)' },
  ] as const
  /** Уникальные дефолтные стили темы «Барбершоп»: цвет названия не из палитры, кнопки с градиентом */
  const BARBER_DEFAULT_TITLE_COLOR = '#D4A574'
  const BARBER_DEFAULT_TITLE_STYLE: React.CSSProperties = {
    fontFamily: "'Oswald', sans-serif",
    fontWeight: 600,
    letterSpacing: '0.02em',
    color: BARBER_DEFAULT_TITLE_COLOR,
    textShadow: `0 0 24px rgba(212, 165, 116, 0.6)`,
  }
  const BARBER_DEFAULT_SUBTITLE_STYLE: React.CSSProperties = {
    color: 'rgba(244, 228, 188, 0.92)',
    textShadow: '0 0 20px rgba(201, 162, 39, 0.35)',
  }
  const BARBER_DEFAULT_PRIMARY = {
    background: 'linear-gradient(135deg, #D4A574 0%, #8B6914 100%)',
    text: '#1a1a1a',
    glow: '0 0 20px rgba(139, 105, 20, 0.5)',
    borderColor: '#8B6914',
  }
  const BARBER_DEFAULT_SECONDARY = {
    background: 'linear-gradient(135deg, rgba(212, 165, 116, 0.15) 0%, rgba(139, 105, 20, 0.25) 100%)',
    text: 'rgba(244, 228, 188, 0.95)',
    glow: '0 0 16px rgba(212, 165, 116, 0.25)',
    borderColor: 'rgba(212, 165, 116, 0.85)',
  }
  const barberButtonOptions = [
    { id: 'gold', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
    { id: 'blue', background: '#3b82f6', text: '#ffffff', glow: '0 0 20px rgba(59,130,246,0.6)' },
    { id: 'red', background: '#ef4444', text: '#ffffff', glow: '0 0 18px rgba(239,68,68,0.6)' },
    { id: 'pink', background: '#FF4D9D', text: '#0b0b0b', glow: '0 0 20px rgba(255,77,157,0.55)' },
    { id: 'coral', background: '#FB7185', text: '#0b0b0b', glow: '0 0 18px rgba(251,113,133,0.6)' },
    { id: 'violet', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 18px rgba(167,139,250,0.6)' },
    { id: 'orange', background: '#f97316', text: '#0b0b0b', glow: '0 0 18px rgba(249,115,22,0.6)' },
    { id: 'lime', background: '#84cc16', text: '#0b0b0b', glow: '0 0 18px rgba(132,204,22,0.55)' },
    { id: 'emerald', background: '#4ADE80', text: '#0b0b0b', glow: '0 0 18px rgba(74,222,128,0.55)' },
    { id: 'white', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
    { id: 'indigo', background: '#6366f1', text: '#ffffff', glow: '0 0 18px rgba(99,102,241,0.6)' },
    { id: 'gray', background: '#6b7280', text: '#ffffff', glow: '0 0 18px rgba(107,114,128,0.6)' },
    { id: 'brown', background: '#92400e', text: '#ffffff', glow: '0 0 18px rgba(146,64,14,0.6)' },
    { id: 'black', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
  ] as const
  /** Тема «Косметология»: палитра розовый/матовый/пудровый, градиенты и свой шрифт заголовка */
  const COSMETOLOGY_DEFAULT_TITLE_COLOR = '#F5E6E8'
  const COSMETOLOGY_DEFAULT_TITLE_STYLE: React.CSSProperties = {
    fontFamily: "'Italiana', serif",
    fontWeight: 400,
    letterSpacing: '0.04em',
    color: COSMETOLOGY_DEFAULT_TITLE_COLOR,
    textShadow: `0 0 28px rgba(232, 180, 184, 0.65)`,
  }
  const COSMETOLOGY_DEFAULT_SUBTITLE_STYLE: React.CSSProperties = {
    color: 'rgba(252, 240, 245, 0.94)',
    textShadow: '0 0 18px rgba(205, 150, 165, 0.4)',
  }
  const COSMETOLOGY_DEFAULT_PRIMARY = {
    background: 'linear-gradient(135deg, #E8B4B8 0%, #B76E79 50%, #8B6B7D 100%)',
    text: '#1a0f12',
    glow: '0 0 22px rgba(183, 110, 121, 0.5)',
    borderColor: '#9B6B6B',
  }
  const COSMETOLOGY_DEFAULT_SECONDARY = {
    background: 'linear-gradient(135deg, rgba(232, 180, 184, 0.2) 0%, rgba(139, 107, 125, 0.35) 100%)',
    text: 'rgba(252, 245, 248, 0.96)',
    glow: '0 0 18px rgba(232, 180, 184, 0.3)',
    borderColor: 'rgba(232, 180, 184, 0.9)',
  }
  const cosmetologyButtonOptions = [
    { id: 'rose', background: '#E8B4B8', text: '#1a0f12', glow: '0 0 20px rgba(232,180,184,0.55)' },
    { id: 'mauve', background: '#B76E79', text: '#ffffff', glow: '0 0 20px rgba(183,110,121,0.55)' },
    { id: 'pink', background: '#FF4D9D', text: '#0b0b0b', glow: '0 0 20px rgba(255,77,157,0.55)' },
    { id: 'gold', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
    { id: 'blue', background: '#3b82f6', text: '#ffffff', glow: '0 0 20px rgba(59,130,246,0.6)' },
    { id: 'white', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
    { id: 'violet', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 18px rgba(167,139,250,0.6)' },
    { id: 'black', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
  ] as const
  /** Тема «Покраска волос»: палитра фиолетовый/медный/фуксия, градиенты и выразительный шрифт заголовка */
  const COLORING_DEFAULT_TITLE_COLOR = '#E8DDF5'
  const COLORING_DEFAULT_TITLE_STYLE: React.CSSProperties = {
    fontFamily: "'Great Vibes', cursive",
    fontWeight: 400,
    letterSpacing: '0.02em',
    color: COLORING_DEFAULT_TITLE_COLOR,
    textShadow: `0 0 32px rgba(167, 139, 250, 0.7)`,
  }
  const COLORING_DEFAULT_SUBTITLE_STYLE: React.CSSProperties = {
    color: 'rgba(232, 222, 250, 0.95)',
    textShadow: '0 0 20px rgba(139, 92, 246, 0.45)',
  }
  const COLORING_DEFAULT_PRIMARY = {
    background: 'linear-gradient(135deg, #C084FC 0%, #A855F7 50%, #7C3AED 100%)',
    text: '#faf5ff',
    glow: '0 0 24px rgba(168, 85, 247, 0.55)',
    borderColor: '#A855F7',
  }
  const COLORING_DEFAULT_SECONDARY = {
    background: 'linear-gradient(135deg, rgba(192, 132, 252, 0.22) 0%, rgba(124, 58, 237, 0.38) 100%)',
    text: 'rgba(250, 245, 255, 0.97)',
    glow: '0 0 18px rgba(192, 132, 252, 0.35)',
    borderColor: 'rgba(192, 132, 252, 0.88)',
  }
  const coloringButtonOptions = [
    { id: 'violet', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 20px rgba(167,139,250,0.6)' },
    { id: 'fuchsia', background: '#D946EF', text: '#ffffff', glow: '0 0 20px rgba(217,70,239,0.55)' },
    { id: 'purple', background: '#7C3AED', text: '#ffffff', glow: '0 0 20px rgba(124,58,237,0.55)' },
    { id: 'copper', background: '#B87333', text: '#1a0f0a', glow: '0 0 20px rgba(184,115,51,0.55)' },
    { id: 'pink', background: '#EC4899', text: '#ffffff', glow: '0 0 20px rgba(236,72,153,0.55)' },
    { id: 'gold', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
    { id: 'white', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
    { id: 'black', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
  ] as const
  /** Тема «Маникюр»: палитра нежно-розовый/розовое золото, градиенты и изысканный рукописный шрифт заголовка */
  const MANICURE_DEFAULT_TITLE_COLOR = '#FFE8F0'
  const MANICURE_DEFAULT_TITLE_STYLE: React.CSSProperties = {
    fontFamily: "'Allura', cursive",
    fontWeight: 400,
    letterSpacing: '0.03em',
    color: MANICURE_DEFAULT_TITLE_COLOR,
    textShadow: `0 0 28px rgba(255, 182, 193, 0.7)`,
  }
  const MANICURE_DEFAULT_SUBTITLE_STYLE: React.CSSProperties = {
    color: 'rgba(255, 240, 245, 0.96)',
    textShadow: '0 0 18px rgba(255, 182, 193, 0.45)',
  }
  const MANICURE_DEFAULT_PRIMARY = {
    background: 'linear-gradient(135deg, #F8B4C4 0%, #E8A0B0 50%, #D48494 100%)',
    text: '#2d1519',
    glow: '0 0 22px rgba(232, 160, 176, 0.55)',
    borderColor: '#D48494',
  }
  const MANICURE_DEFAULT_SECONDARY = {
    background: 'linear-gradient(135deg, rgba(248, 180, 196, 0.25) 0%, rgba(212, 132, 148, 0.4) 100%)',
    text: 'rgba(255, 248, 250, 0.97)',
    glow: '0 0 18px rgba(248, 180, 196, 0.35)',
    borderColor: 'rgba(248, 180, 196, 0.9)',
  }
  const manicureButtonOptions = [
    { id: 'blush', background: '#F8B4C4', text: '#2d1519', glow: '0 0 20px rgba(248,180,196,0.55)' },
    { id: 'rose', background: '#E8A0B0', text: '#1a0f12', glow: '0 0 20px rgba(232,160,176,0.55)' },
    { id: 'coral', background: '#F4A6B4', text: '#1a0f12', glow: '0 0 20px rgba(244,166,180,0.55)' },
    { id: 'pink', background: '#EC4899', text: '#ffffff', glow: '0 0 20px rgba(236,72,153,0.55)' },
    { id: 'gold', background: '#E8C9A0', text: '#1a1510', glow: '0 0 20px rgba(232,201,160,0.55)' },
    { id: 'white', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
    { id: 'violet', background: '#C4B5FD', text: '#1a1525', glow: '0 0 20px rgba(196,181,253,0.55)' },
    { id: 'black', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
  ] as const
  const publicHeaderBarberColors = (() => {
    const stored = readPublic('publicHeaderBarberColors')
    if (!stored) {
      return { title: 'default', subtitle: 'default', primary: 'default', secondary: 'default' }
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
      return { title: 'default', subtitle: 'default', primary: 'default', secondary: 'default' }
    }
  })()
  const barberTitleColor =
    publicHeaderTheme === 'barber' && publicHeaderBarberColors.title === 'default'
      ? { id: 'default', color: BARBER_DEFAULT_TITLE_COLOR, glow: BARBER_DEFAULT_TITLE_STYLE.textShadow! }
      : barberTextOptions.find((option) => option.id === publicHeaderBarberColors.title) || barberTextOptions[0]
  const barberSubtitleColor =
    publicHeaderTheme === 'barber' && publicHeaderBarberColors.subtitle === 'default'
      ? { id: 'default', color: BARBER_DEFAULT_SUBTITLE_STYLE.color!, glow: BARBER_DEFAULT_SUBTITLE_STYLE.textShadow! }
      : barberTextOptions.find((option) => option.id === publicHeaderBarberColors.subtitle) || barberTextOptions[1]
  const barberPrimaryColor =
    publicHeaderTheme === 'barber' && publicHeaderBarberColors.primary === 'default'
      ? BARBER_DEFAULT_PRIMARY
      : barberButtonOptions.find((option) => option.id === publicHeaderBarberColors.primary) || barberButtonOptions[0]
  const barberSecondaryColor =
    publicHeaderTheme === 'barber' && publicHeaderBarberColors.secondary === 'default'
      ? BARBER_DEFAULT_SECONDARY
      : barberButtonOptions.find((option) => option.id === publicHeaderBarberColors.secondary) || barberButtonOptions[1]
  const publicHeaderCosmetologyColors = (() => {
    const stored = readPublic('publicHeaderCosmetologyColors')
    if (!stored) {
      return { title: 'default', subtitle: 'default', primary: 'default', secondary: 'default' }
    }
    try {
      const parsed = JSON.parse(stored)
      return {
        title: typeof parsed?.title === 'string' ? parsed.title : 'default',
        subtitle: typeof parsed?.subtitle === 'string' ? parsed.subtitle : 'default',
        primary: typeof parsed?.primary === 'string' ? parsed.primary : 'default',
        secondary: typeof parsed?.secondary === 'string' ? parsed.secondary : 'default',
      }
    } catch {
      return { title: 'default', subtitle: 'default', primary: 'default', secondary: 'default' }
    }
  })()
  const cosmetologyTitleColor =
    publicHeaderTheme === 'cosmetology' && publicHeaderCosmetologyColors.title === 'default'
      ? { id: 'default', color: COSMETOLOGY_DEFAULT_TITLE_COLOR, glow: COSMETOLOGY_DEFAULT_TITLE_STYLE.textShadow! }
      : barberTextOptions.find((option) => option.id === publicHeaderCosmetologyColors.title) || barberTextOptions[0]
  const cosmetologySubtitleColor =
    publicHeaderTheme === 'cosmetology' && publicHeaderCosmetologyColors.subtitle === 'default'
      ? { id: 'default', color: COSMETOLOGY_DEFAULT_SUBTITLE_STYLE.color!, glow: COSMETOLOGY_DEFAULT_SUBTITLE_STYLE.textShadow! }
      : barberTextOptions.find((option) => option.id === publicHeaderCosmetologyColors.subtitle) || barberTextOptions[1]
  const cosmetologyPrimaryColor =
    publicHeaderTheme === 'cosmetology' && publicHeaderCosmetologyColors.primary === 'default'
      ? COSMETOLOGY_DEFAULT_PRIMARY
      : cosmetologyButtonOptions.find((option) => option.id === publicHeaderCosmetologyColors.primary) || cosmetologyButtonOptions[0]
  const cosmetologySecondaryColor =
    publicHeaderTheme === 'cosmetology' && publicHeaderCosmetologyColors.secondary === 'default'
      ? COSMETOLOGY_DEFAULT_SECONDARY
      : cosmetologyButtonOptions.find((option) => option.id === publicHeaderCosmetologyColors.secondary) || cosmetologyButtonOptions[1]
  const publicHeaderColoringColors = (() => {
    const stored = readPublic('publicHeaderColoringColors')
    if (!stored) {
      return { title: 'default', subtitle: 'default', primary: 'default', secondary: 'default' }
    }
    try {
      const parsed = JSON.parse(stored)
      return {
        title: typeof parsed?.title === 'string' ? parsed.title : 'default',
        subtitle: typeof parsed?.subtitle === 'string' ? parsed.subtitle : 'default',
        primary: typeof parsed?.primary === 'string' ? parsed.primary : 'default',
        secondary: typeof parsed?.secondary === 'string' ? parsed.secondary : 'default',
      }
    } catch {
      return { title: 'default', subtitle: 'default', primary: 'default', secondary: 'default' }
    }
  })()
  const coloringTitleColor =
    publicHeaderTheme === 'coloring' && publicHeaderColoringColors.title === 'default'
      ? { id: 'default', color: COLORING_DEFAULT_TITLE_COLOR, glow: COLORING_DEFAULT_TITLE_STYLE.textShadow! }
      : barberTextOptions.find((option) => option.id === publicHeaderColoringColors.title) || barberTextOptions[0]
  const coloringSubtitleColor =
    publicHeaderTheme === 'coloring' && publicHeaderColoringColors.subtitle === 'default'
      ? { id: 'default', color: COLORING_DEFAULT_SUBTITLE_STYLE.color!, glow: COLORING_DEFAULT_SUBTITLE_STYLE.textShadow! }
      : barberTextOptions.find((option) => option.id === publicHeaderColoringColors.subtitle) || barberTextOptions[1]
  const coloringPrimaryColor =
    publicHeaderTheme === 'coloring' && publicHeaderColoringColors.primary === 'default'
      ? COLORING_DEFAULT_PRIMARY
      : coloringButtonOptions.find((option) => option.id === publicHeaderColoringColors.primary) || coloringButtonOptions[0]
  const coloringSecondaryColor =
    publicHeaderTheme === 'coloring' && publicHeaderColoringColors.secondary === 'default'
      ? COLORING_DEFAULT_SECONDARY
      : coloringButtonOptions.find((option) => option.id === publicHeaderColoringColors.secondary) || coloringButtonOptions[1]
  const publicHeaderManicureColors = (() => {
    const stored = readPublic('publicHeaderManicureColors')
    if (!stored) {
      return { title: 'default', subtitle: 'default', primary: 'default', secondary: 'default' }
    }
    try {
      const parsed = JSON.parse(stored)
      return {
        title: typeof parsed?.title === 'string' ? parsed.title : 'default',
        subtitle: typeof parsed?.subtitle === 'string' ? parsed.subtitle : 'default',
        primary: typeof parsed?.primary === 'string' ? parsed.primary : 'default',
        secondary: typeof parsed?.secondary === 'string' ? parsed.secondary : 'default',
      }
    } catch {
      return { title: 'default', subtitle: 'default', primary: 'default', secondary: 'default' }
    }
  })()
  const manicureTitleColor =
    publicHeaderTheme === 'manicure' && publicHeaderManicureColors.title === 'default'
      ? { id: 'default', color: MANICURE_DEFAULT_TITLE_COLOR, glow: MANICURE_DEFAULT_TITLE_STYLE.textShadow! }
      : barberTextOptions.find((option) => option.id === publicHeaderManicureColors.title) || barberTextOptions[0]
  const manicureSubtitleColor =
    publicHeaderTheme === 'manicure' && publicHeaderManicureColors.subtitle === 'default'
      ? { id: 'default', color: MANICURE_DEFAULT_SUBTITLE_STYLE.color!, glow: MANICURE_DEFAULT_SUBTITLE_STYLE.textShadow! }
      : barberTextOptions.find((option) => option.id === publicHeaderManicureColors.subtitle) || barberTextOptions[1]
  const manicurePrimaryColor =
    publicHeaderTheme === 'manicure' && publicHeaderManicureColors.primary === 'default'
      ? MANICURE_DEFAULT_PRIMARY
      : manicureButtonOptions.find((option) => option.id === publicHeaderManicureColors.primary) || manicureButtonOptions[0]
  const manicureSecondaryColor =
    publicHeaderTheme === 'manicure' && publicHeaderManicureColors.secondary === 'default'
      ? MANICURE_DEFAULT_SECONDARY
      : manicureButtonOptions.find((option) => option.id === publicHeaderManicureColors.secondary) || manicureButtonOptions[1]
  const headerPrimaryColor =
    publicHeaderTheme === 'cosmetology'
      ? cosmetologyPrimaryColor
      : publicHeaderTheme === 'coloring'
        ? coloringPrimaryColor
        : publicHeaderTheme === 'manicure'
          ? manicurePrimaryColor
          : barberPrimaryColor
  const headerSecondaryColor =
    publicHeaderTheme === 'cosmetology'
      ? cosmetologySecondaryColor
      : publicHeaderTheme === 'coloring'
        ? coloringSecondaryColor
        : publicHeaderTheme === 'manicure'
          ? manicureSecondaryColor
          : barberSecondaryColor
  const isBarberGradient = (bg: string) => typeof bg === 'string' && bg.includes('gradient')
  const isHeaderGradient = (bg: string) => typeof bg === 'string' && bg.includes('gradient')
  const publicGalleryTitle = readPublic('publicGalleryTitle') || t('salonPhotos')
  const publicGalleryTitleColor = readPublic('publicGalleryTitleColor') || 'default'
  const galleryTitleColorOption =
    publicGalleryTitleColor !== 'default'
      ? barberTextOptions.find((o) => o.id === publicGalleryTitleColor)
      : null
  const publicBookingTitleColor = readPublic('publicBookingTitleColor') || 'default'
  const publicBookingSubtitleColor = readPublic('publicBookingSubtitleColor') || 'default'
  const bookingTitleColorOption =
    publicBookingTitleColor !== 'default'
      ? barberTextOptions.find((o) => o.id === publicBookingTitleColor)
      : null
  const bookingSubtitleColorOption =
    publicBookingSubtitleColor !== 'default'
      ? barberTextOptions.find((o) => o.id === publicBookingSubtitleColor)
      : null
  const headerColorsEnabled = publicHeaderTheme !== 'custom'
  /** В режиме редактирования темы «Парикмахерская»: сначала дефолтные цвета; после перетаскивания или смены цвета в сайдбаре — выбранные */
  const isDraggableHeaderTheme = isOrdinaryDraggableHeaderTheme(publicHeaderTheme)
  const headerLayoutStorageKey = isDraggableHeaderTheme
    ? `draft_headerLayout${publicHeaderTheme.charAt(0).toUpperCase() + publicHeaderTheme.slice(1)}_v6`
    : 'draft_headerLayoutHair_v6'
  /** Черновик раскладки: одинаково для hair, barber, cosmetology, coloring, manicure (ключи draft_headerLayout*). */
  const hasOrdinaryHeaderLayoutDraft =
    isDraggableHeaderTheme &&
    typeof window !== 'undefined' &&
    (!!localStorage.getItem(headerLayoutStorageKey) ||
      !!localStorage.getItem(`${headerLayoutStorageKey}_mobile`))
  const hasMassageOrdinaryHeaderLayoutDraft =
    massagePreview &&
    validMassageSlot &&
    !isMassagePristineTemplatePreview &&
    isDraggableHeaderTheme &&
    typeof window !== 'undefined' &&
    (!!localStorage.getItem(massageDraftStorageKey(validMassageSlot, headerLayoutStorageKey)) ||
      !!localStorage.getItem(massageDraftStorageKey(validMassageSlot, `${headerLayoutStorageKey}_mobile`)))
  /** Превью 5 обычных массажных тем с черновиками (не welcome): палитра и секции синхронны с MassageConstructorPage */
  const massageOrdinaryPreviewLive =
    Boolean(
      massagePreview &&
        validMassageSlot &&
        isMassageOrdinaryTemplateId(validMassageSlot) &&
        !isMassagePristineTemplatePreview &&
        isPreview
    )
  /** Только hair: старый флаг «трогали хедер» без отдельного ключа темы */
  const hasHairLegacyCustomizedFlag =
    publicHeaderTheme === 'hair' &&
    typeof window !== 'undefined' &&
    !!localStorage.getItem('draft_headerHairCustomized')
  const hasHeaderCustomized =
    hasMassageOrdinaryHeaderLayoutDraft ||
    (isDraggableHeaderTheme && publicHeaderTheme !== 'hair') ||
    hasOrdinaryHeaderLayoutDraft ||
    hasHairLegacyCustomizedFlag ||
    publicHeaderBarberColors.title !== 'default' ||
    publicHeaderBarberColors.subtitle !== 'default' ||
    publicHeaderBarberColors.primary !== 'default' ||
    publicHeaderBarberColors.secondary !== 'default' ||
    publicHeaderCosmetologyColors.title !== 'default' ||
    publicHeaderCosmetologyColors.subtitle !== 'default' ||
    publicHeaderCosmetologyColors.primary !== 'default' ||
    publicHeaderCosmetologyColors.secondary !== 'default' ||
    publicHeaderColoringColors.title !== 'default' ||
    publicHeaderColoringColors.subtitle !== 'default' ||
    publicHeaderColoringColors.primary !== 'default' ||
    publicHeaderColoringColors.secondary !== 'default' ||
    publicHeaderManicureColors.title !== 'default' ||
    publicHeaderManicureColors.subtitle !== 'default' ||
    publicHeaderManicureColors.primary !== 'default' ||
    publicHeaderManicureColors.secondary !== 'default'
  /** Полный просмотр / черновики без edit=1: тот же хиро, что после перетаскивания (не статичная сетка) */
  const showDraggableHeroReadOnly =
    isDraggableHeaderTheme &&
    wantsConstructorDrafts &&
    !isTemplateDemo &&
    !isEditMode
  const useDraggableHeaderHero = isDraggableHeaderTheme && (isEditMode || showDraggableHeroReadOnly)
  /** Кастомные цвета на сохранённой странице; в превью — при редактировании или в демо шаблона */
  const applyHeaderColors =
    !isPreview ||
    (massageOrdinaryPreviewLive && !isHeaderDragging && (isEditMode || showDraggableHeroReadOnly)) ||
    (isEditMode && !isHeaderDragging && hasHeaderCustomized) ||
    (showDraggableHeroReadOnly && !isHeaderDragging && hasHeaderCustomized) ||
    (isTemplateDemo && (publicHeaderTheme === 'barber' || publicHeaderTheme === 'cosmetology' || publicHeaderTheme === 'coloring' || publicHeaderTheme === 'manicure'))
  const headerTitleStyle =
    headerColorsEnabled && applyHeaderColors && publicHeaderTheme === 'barber'
      ? publicHeaderBarberColors.title === 'default'
        ? BARBER_DEFAULT_TITLE_STYLE
        : { color: barberTitleColor.color, textShadow: barberTitleColor.glow }
      : headerColorsEnabled && applyHeaderColors && publicHeaderTheme === 'cosmetology'
        ? publicHeaderCosmetologyColors.title === 'default'
          ? COSMETOLOGY_DEFAULT_TITLE_STYLE
          : { color: cosmetologyTitleColor.color, textShadow: cosmetologyTitleColor.glow }
        : headerColorsEnabled && applyHeaderColors && publicHeaderTheme === 'coloring'
          ? publicHeaderColoringColors.title === 'default'
            ? COLORING_DEFAULT_TITLE_STYLE
            : { color: coloringTitleColor.color, textShadow: coloringTitleColor.glow }
          : headerColorsEnabled && applyHeaderColors && publicHeaderTheme === 'manicure'
            ? publicHeaderManicureColors.title === 'default'
              ? MANICURE_DEFAULT_TITLE_STYLE
              : { color: manicureTitleColor.color, textShadow: manicureTitleColor.glow }
            : headerColorsEnabled && applyHeaderColors && publicHeaderBarberColors.title !== 'default'
              ? { color: barberTitleColor.color, textShadow: barberTitleColor.glow }
              : headerColorsEnabled && applyHeaderColors && publicHeaderCosmetologyColors.title !== 'default'
                ? { color: cosmetologyTitleColor.color, textShadow: cosmetologyTitleColor.glow }
                : headerColorsEnabled && applyHeaderColors && publicHeaderColoringColors.title !== 'default'
                  ? { color: coloringTitleColor.color, textShadow: coloringTitleColor.glow }
                  : headerColorsEnabled && applyHeaderColors && publicHeaderManicureColors.title !== 'default'
                    ? { color: manicureTitleColor.color, textShadow: manicureTitleColor.glow }
                    : undefined
  const hairTitleFontSizePx = useMemo(
    () => Math.max(20, Math.min(56, 96 - publicName.length * 1.5)),
    [publicName.length]
  )
  const headerSubtitleStyle =
    headerColorsEnabled && applyHeaderColors && publicHeaderTheme === 'barber'
      ? publicHeaderBarberColors.subtitle === 'default'
        ? BARBER_DEFAULT_SUBTITLE_STYLE
        : { color: barberSubtitleColor.color, textShadow: barberSubtitleColor.glow }
      : headerColorsEnabled && applyHeaderColors && publicHeaderTheme === 'cosmetology'
        ? publicHeaderCosmetologyColors.subtitle === 'default'
          ? COSMETOLOGY_DEFAULT_SUBTITLE_STYLE
          : { color: cosmetologySubtitleColor.color, textShadow: cosmetologySubtitleColor.glow }
        : headerColorsEnabled && applyHeaderColors && publicHeaderTheme === 'coloring'
          ? publicHeaderColoringColors.subtitle === 'default'
            ? COLORING_DEFAULT_SUBTITLE_STYLE
            : { color: coloringSubtitleColor.color, textShadow: coloringSubtitleColor.glow }
          : headerColorsEnabled && applyHeaderColors && publicHeaderTheme === 'manicure'
            ? publicHeaderManicureColors.subtitle === 'default'
              ? MANICURE_DEFAULT_SUBTITLE_STYLE
              : { color: manicureSubtitleColor.color, textShadow: manicureSubtitleColor.glow }
            : headerColorsEnabled && applyHeaderColors && publicHeaderBarberColors.subtitle !== 'default'
              ? { color: barberSubtitleColor.color, textShadow: barberSubtitleColor.glow }
              : headerColorsEnabled && applyHeaderColors && publicHeaderCosmetologyColors.subtitle !== 'default'
                ? { color: cosmetologySubtitleColor.color, textShadow: cosmetologySubtitleColor.glow }
                : headerColorsEnabled && applyHeaderColors && publicHeaderColoringColors.subtitle !== 'default'
                  ? { color: coloringSubtitleColor.color, textShadow: coloringSubtitleColor.glow }
                  : headerColorsEnabled && applyHeaderColors && publicHeaderManicureColors.subtitle !== 'default'
                    ? { color: manicureSubtitleColor.color, textShadow: manicureSubtitleColor.glow }
                    : undefined

  /** Хиро: палитра всегда в превью массажа (не зависит от applyHeaderColors / перетаскивания) */
  const massageHeroPaletteOn =
    massageOrdinaryPreviewLive && massagePreviewThemeColors !== undefined
  const massageSectionPaletteOn =
    massageOrdinaryPreviewLive && massagePreviewThemeColors !== undefined

  const massageM = (k: keyof MassageThemeColors) =>
    resolveMassageThemeColor(k, massagePreviewThemeColors as MassageThemeColors)

  const headerTitleStyleForRender: React.CSSProperties | undefined = massageHeroPaletteOn
    ? {
        ...(headerTitleStyle ?? {}),
        color: massageM('heroLine1'),
        textShadow: '0 2px 28px rgba(0,0,0,0.5)',
      }
    : headerTitleStyle

  const headerSubtitleStyleForRender: React.CSSProperties | undefined = massageHeroPaletteOn
    ? {
        ...(headerSubtitleStyle ?? {}),
        color: massageM('heroSub'),
        textShadow: '0 1px 16px rgba(0,0,0,0.45)',
      }
    : headerSubtitleStyle

  const massageHeroBtnGlow = (hex: string) => `0 0 22px ${hex}55`

  const headerPrimaryColorForRender = massageHeroPaletteOn
    ? {
        background: massageM('heroPrimBtnBg'),
        text: '#ffffff',
        glow: massageHeroBtnGlow(massageM('heroPrimBtnBg')),
        borderColor: massageM('heroCtaBorder'),
      }
    : headerPrimaryColor

  const headerSecondaryColorForRender = massageHeroPaletteOn
    ? {
        background: massageM('heroSecBtnBg'),
        text: '#ffffff',
        glow: massageHeroBtnGlow(massageM('heroSecBtnBg')),
        borderColor: massageM('heroSecBtnBorder'),
      }
    : headerSecondaryColor

  const galleryTitleMergedStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('galTitle'), textShadow: '0 1px 18px rgba(0,0,0,0.35)' }
    : galleryTitleColorOption
      ? { color: galleryTitleColorOption.color, textShadow: galleryTitleColorOption.glow }
      : undefined

  const bookingTitleMergedStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('ctaBlockTitle'), textShadow: '0 1px 18px rgba(0,0,0,0.35)' }
    : bookingTitleColorOption
      ? { color: bookingTitleColorOption.color, textShadow: bookingTitleColorOption.glow }
      : undefined

  const bookingSubtitleMergedStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('ctaBlockSub'), textShadow: '0 1px 12px rgba(0,0,0,0.3)' }
    : bookingSubtitleColorOption
      ? { color: bookingSubtitleColorOption.color, textShadow: bookingSubtitleColorOption.glow }
      : undefined

  const worksGalleryTitleMergedStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('svcBlockTitle'), textShadow: '0 1px 18px rgba(0,0,0,0.35)' }
    : undefined

  const mapLocationLabelMergedStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('contactsLabel') }
    : undefined

  const mapWhereHeadingMergedStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('contactsSectionHeading') }
    : undefined

  const massageFooterBlockTitleStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('contactsBlockTitle') }
    : undefined
  const massageFooterContactLabelStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('contactsLabel') }
    : undefined
  const massageFooterContactBodyStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { color: massageM('contactsBody') }
    : undefined
  const massageFooterColumnRuleStyle: React.CSSProperties | undefined = massageSectionPaletteOn
    ? { backgroundColor: massageM('contactsIcon'), opacity: 0.35 }
    : undefined

  const headerPrimaryCustom =
    headerColorsEnabled &&
    applyHeaderColors &&
    (publicHeaderBarberColors.primary !== 'default' ||
      publicHeaderTheme === 'barber' ||
      publicHeaderCosmetologyColors.primary !== 'default' ||
      publicHeaderTheme === 'cosmetology' ||
      publicHeaderColoringColors.primary !== 'default' ||
      publicHeaderTheme === 'coloring' ||
      publicHeaderManicureColors.primary !== 'default' ||
      publicHeaderTheme === 'manicure')
  const headerSecondaryCustom =
    headerColorsEnabled &&
    applyHeaderColors &&
    (publicHeaderBarberColors.secondary !== 'default' ||
      publicHeaderTheme === 'barber' ||
      publicHeaderCosmetologyColors.secondary !== 'default' ||
      publicHeaderTheme === 'cosmetology' ||
      publicHeaderColoringColors.secondary !== 'default' ||
      publicHeaderTheme === 'coloring' ||
      publicHeaderManicureColors.secondary !== 'default' ||
      publicHeaderTheme === 'manicure')
  const headerPrimaryCustomForRender = massageHeroPaletteOn ? true : headerPrimaryCustom
  const headerSecondaryCustomForRender = massageHeroPaletteOn ? true : headerSecondaryCustom
  const headerUseGlow = publicHeaderTheme === 'barber' || publicHeaderTheme === 'cosmetology' || publicHeaderTheme === 'coloring' || publicHeaderTheme === 'manicure'
  const getPrimaryIconClass = (defaultClass: string) =>
    publicHeaderTheme === 'manicure'
      ? publicHeaderManicureColors.primary === 'black'
        ? 'brightness-0 invert'
        : publicHeaderManicureColors.primary === 'white'
          ? 'brightness-0'
          : publicHeaderManicureColors.primary === 'default'
            ? 'brightness-0'
            : ''
      : publicHeaderTheme === 'coloring'
      ? publicHeaderColoringColors.primary === 'black'
        ? 'brightness-0 invert'
        : publicHeaderColoringColors.primary === 'white'
          ? 'brightness-0'
          : publicHeaderColoringColors.primary === 'default'
            ? 'brightness-0'
            : ''
      : publicHeaderTheme === 'cosmetology'
      ? publicHeaderCosmetologyColors.primary === 'black'
        ? 'brightness-0 invert'
        : publicHeaderCosmetologyColors.primary === 'white'
          ? 'brightness-0'
          : publicHeaderCosmetologyColors.primary === 'default'
            ? 'brightness-0'
            : ''
      : publicHeaderBarberColors.primary === 'black'
        ? 'brightness-0 invert'
        : publicHeaderBarberColors.primary === 'white'
          ? 'brightness-0'
          : publicHeaderTheme === 'barber' && publicHeaderBarberColors.primary === 'default'
            ? 'brightness-0'
            : publicHeaderBarberColors.primary === 'default'
              ? defaultClass
              : ''
  const getPrimaryIconClassForRender = (defaultClass: string) =>
    massageHeroPaletteOn ? 'brightness-0 invert' : getPrimaryIconClass(defaultClass)
  /** Изначальная позиция хедера темы «Парикмахерская» (логотип, название, описание, кнопки) */
  const HAIR_HEADER_INITIAL_PADDING = 'w-full px-4 pb-14 sm:pb-20 pt-40 sm:pt-32 md:pt-44 lg:pt-[22rem] xl:pt-[24rem] text-center justify-center'
  /** Превью массажа: паттерн фона страницы — выбор из сайдбара или дефолт по слоту (в т.ч. спортивный 8498517). */
  const massageBodyPatternChoiceStored =
    massagePreview && validMassageSlot && typeof window !== 'undefined'
      ? readMassageOrdinarySlotString(validMassageSlot, 'publicMassageBodyPatternChoice', publicLang)
      : null
  const massagePreviewBodyPatternImage =
    massagePreview && validMassageSlot && isMassageOrdinaryTemplateId(validMassageSlot)
      ? resolveMassageBodyPatternAssetUrl(massageBodyPatternChoiceStored, validMassageSlot)
      : null
  const bodyBackground =
    publicBodyBackgroundChoice === 'bg-1'
      ? { type: 'image', url: massagePreviewBodyPatternImage ?? patternBg }
      : publicBodyBackgroundChoice === 'bg-2'
        ? { type: 'image', url: massagePreviewBodyPatternImage ?? manicurePattern }
        : publicBodyBackgroundChoice === 'bg-3'
          ? { type: 'image', url: massagePreviewBodyPatternImage ?? manicurePatternAlt }
          : publicBodyBackgroundChoice === 'bg-4'
            ? { type: 'color', color: '#0b0b0b' }
            : publicBodyBackgroundChoice === 'bg-5'
              ? { type: 'color', color: '#e8e4df' }
              : { type: 'image', url: massagePreviewBodyPatternImage ?? patternBg }
  /** Затемнение поверх фона — слабее, чтобы паттерны и фото hero-зоны читались лучше. */
  const bodyBgDarken =
    massagePreviewBodyPatternImage != null
      ? 'linear-gradient(180deg, rgba(0, 0, 0, 0.34), rgba(0, 0, 0, 0.45))'
      : 'linear-gradient(180deg, rgba(0, 0, 0, 0.54), rgba(0, 0, 0, 0.64))'
  const bodyBackgroundImage =
    bodyBackground.type === 'image'
      ? `${bodyBgDarken}, url(${bodyBackground.url})`
      : publicBodyBackgroundChoice === 'bg-5'
        ? 'none'
        : bodyBgDarken
  const bodyBackgroundColor =
    bodyBackground.type === 'color' ? bodyBackground.color : undefined
  /** Паттерн + затемнение: градиент без повтора на весь блок; плитка — `auto`, кроме классического 12634 (фикс. ширина плитки). */
  const bodyPatternTileSize = massageBodyPatternLayerBackgroundSize(bodyBackground.url)
  const bodyShellSurfaceStyle =
    bodyBackground.type === 'image'
      ? {
          backgroundImage: bodyBackgroundImage,
          backgroundColor: bodyBackgroundColor,
          backgroundRepeat: 'no-repeat, repeat',
          backgroundSize: `100% 100%, ${bodyPatternTileSize}`,
          backgroundPosition: '0 0, 0 0',
          minHeight: '100vh',
          width: '100%',
        }
      : {
          backgroundImage: bodyBackgroundImage,
          backgroundColor: bodyBackgroundColor,
          ...(bodyBackgroundImage !== 'none'
            ? { backgroundRepeat: 'no-repeat' as const, backgroundSize: '100% 100%' as const }
            : {}),
          minHeight: '100vh',
          width: '100%',
        }
  const publicAddressRaw = readPublic('publicAddress')
  const publicAddressPrimaryRaw = isFooterFieldClearedMarker(publicAddressRaw) ? '' : publicAddressRaw
  const publicAddressPrimaryResolved =
    !publicAddressPrimaryRaw.trim()
      ? ''
      : isLegacyAddress(publicAddressPrimaryRaw)
        ? fld.address
        : publicAddressPrimaryRaw
  const publicAddress =
    publicAddressPrimaryResolved.trim() !== ''
      ? (publicAddressPrimaryResolved || publicFooterAddress)
      : ''
  const footerVisibility = (() => {
    const stored = readPublic('publicFooterVisibility')
    const defaults = { address: true, schedule: true, dayOff: true, phone: true, email: true }
    if (!stored) {
      return defaults
    }
    try {
      const parsed = JSON.parse(stored)
      const visibility = {
        address: parsed?.address !== false,
        schedule: parsed?.schedule !== false,
        dayOff: parsed?.dayOff !== false,
        phone: parsed?.phone !== false,
        email: parsed?.email !== false,
      }
      // Если вдруг всё выключено – считаем, что это ошибка и включаем всё,
      // чтобы футер не исчезал полностью.
      const anyVisible = visibility.address || visibility.schedule || visibility.phone || visibility.email
      return anyVisible ? visibility : defaults
    } catch {
      return defaults
    }
  })()
  const sectionVisibility = (() => {
    const stored = readPublic('publicSectionVisibility')
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
  })()
  const footerLabels = (() => {
    const stored = readPublic('publicFooterLabels')
    if (!stored) {
      return null
    }
    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  })()
  const socialVisibility = (() => {
    const stored = readPublic('publicSocialVisibility')
    if (!stored) {
      return { telegram: true, viber: true, instagram: true, facebook: true, whatsapp: true, twitter: true, tiktok: true }
    }
    try {
      const parsed = JSON.parse(stored)
      return {
        telegram: parsed?.telegram !== false,
        viber: parsed?.viber !== false,
        instagram: parsed?.instagram !== false,
        facebook: parsed?.facebook !== false,
        whatsapp: parsed?.whatsapp !== false,
        twitter: parsed?.twitter !== false,
        tiktok: parsed?.tiktok !== false,
      }
    } catch {
      return { telegram: true, viber: true, instagram: true, facebook: true, whatsapp: true, twitter: true, tiktok: true }
    }
  })()
  const publicPlaceName = readPublic('publicPlaceName') || ''
  const publicHours = localizeFooterHoursLine(
    hoursCleared ? '' : (storedHours || fld.hours),
    publicLang,
    fld.hours,
  )
  const publicDayOff = localizeFooterDayOffLine(
    dayOffCleared ? '' : (storedDayOff || fld.dayOff),
    publicLang,
    fld.dayOff,
  )
  const mapLat = Number.parseFloat(readPublic('publicMapLat') || '')
  const mapLng = Number.parseFloat(readPublic('publicMapLng') || '')
  const hasCoordsRaw = Number.isFinite(mapLat) && Number.isFinite(mapLng)
  /** В превью редактирования показываем введённый пользователем адрес и координаты; нейтральный — только для демо шаблона или пустого/legacy адреса */
  const useMapBuiltIn = isTemplateDemo || (isPreview && isLegacyAddress(mapSourceAddress))
  const hasCoords = useMapBuiltIn ? false : hasCoordsRaw
  const mapZoom = isMobile ? 15 : 17
  const mapAddressNeutral = FOOTER_DEFAULT_ADDRESS
  const googleMapQuery = (useMapBuiltIn ? mapAddressNeutral : (publicAddress || 'Chisinau')).trim()
  const googleSearchQuery = useMapBuiltIn
    ? mapAddressNeutral
    : [publicPlaceName, publicAddress].filter(Boolean).join(' ')
  const useDefaultWorldMap =
    !hasCoords &&
    (useMapBuiltIn || isLegacyAddress(mapSourceAddress) || !mapSourceAddress)
  const googleMapUrl = useDefaultWorldMap
    ? DEFAULT_WORLD_MAP_EMBED_URL
    : hasCoords
      ? `https://www.google.com/maps?q=${mapLat},${mapLng}&z=${mapZoom}&output=embed&hl=en`
      : `https://www.google.com/maps?q=${encodeURIComponent(googleMapQuery)}&z=${mapZoom}&output=embed&hl=en`
  const googleOpenUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}&hl=en`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleSearchQuery || googleMapQuery)}&hl=en`
  const heroBackgroundDefault =
    massagePreview && validMassageSlot === 'barber'
      ? massageThaiHeroBg
      : massagePreview && validMassageSlot === 'cosmetology'
        ? massageStoneHeroBg
        : massagePreview && validMassageSlot === 'hair'
          ? massageClassicHeroBg
          : massagePreview && validMassageSlot === 'coloring'
            ? massageAntistressHeroBg
            : massagePreview && validMassageSlot === 'manicure'
              ? massageSportsHeroBg
              : publicHeaderTheme === 'barber'
                ? barberRegularHeroBg
                : publicHeaderTheme === 'cosmetology'
                  ? cosmetologyHeaderBg
                  : publicHeaderTheme === 'coloring'
                    ? coloringHeaderBg
                    : publicHeaderTheme === 'manicure'
                      ? manicureHeaderBg
                      : heroImage
  const heroBackgroundUrl = readPublic('publicHeroImage') || heroBackgroundDefault
  /** Только превью массажа: фоновое видео в том же хедере, что у обычных салонов */
  const massagePreviewHeroVideoSrc: string | null = (() => {
    if (
      isTemplateDemo ||
      isPremiumTemplate ||
      !massagePreview ||
      !validMassageSlot ||
      isMassagePristineTemplatePreview
    ) {
      return null
    }
    const raw = readPublic('publicHeroVideo') || ''
    if (!raw) return null
    if (raw === MASSAGE_HERO_VIDEO_IDB_MARKER) return massageIframeHeroVideoObjectUrl
    if (!raw.startsWith('__')) return raw
    return null
  })()
  const galleryValuesRaw = [
    readPublic('publicGallery1') || '',
    readPublic('publicGallery2') || '',
    readPublic('publicGallery3') || '',
    readPublic('publicGallery4') || '',
    readPublic('publicGallery5') || '',
    readPublic('publicGallery6') || '',
    readPublic('publicGallery7') || '',
    readPublic('publicGallery8') || '',
    readPublic('publicGallery9') || '',
    readPublic('publicGallery10') || '',
  ]
  const galleryValues = galleryValuesRaw.map((v, i) => {
    if (v === '__empty__') return ''
    if (v) return v
    if (massagePreview && validMassageSlot && isMassageOrdinaryTemplateId(validMassageSlot)) {
      const md = getMassageSalonPhotoSlotDefaults(validMassageSlot)
      return md[i % md.length] ?? ''
    }
    return DEFAULT_WORKS_CAROUSEL_IMAGES[i] || ''
  })
  const worksImagesRaw = isTemplateDemo
    ? ['', '', '', '', '']
    : [
        readPublic('publicWorks1'),
        readPublic('publicWorks2'),
        readPublic('publicWorks3'),
        readPublic('publicWorks4'),
        readPublic('publicWorks5'),
      ]
  const worksImages = worksImagesRaw.map((v) => (v && v !== '__empty__' ? v : ''))
  const worksDisplayImages = useMemo(() => {
    const massageDefaults =
      massagePreview && validMassageSlot && isMassageOrdinaryTemplateId(validMassageSlot)
        ? getMassageSalonPhotoSlotDefaults(validMassageSlot)
        : null
    return worksImagesRaw.map((img, i) => {
      if (img === '__empty__') return ''
      if (img) return img
      const massageFallback = massageDefaults?.[i]
      if (massageFallback) return massageFallback
      return DEFAULT_WORKS_IMAGES[i] || ''
    })
  }, [
    worksImagesRaw[0],
    worksImagesRaw[1],
    worksImagesRaw[2],
    worksImagesRaw[3],
    worksImagesRaw[4],
    isTemplateDemo,
    massagePreview,
    validMassageSlot,
  ])
  const galleryKey = galleryValues.join('|')
  const galleryPreview = useMemo(
    () => galleryValues.filter(Boolean).slice(0, 10),
    [galleryKey]
  )
  const circularItems = useMemo(
    () =>
      galleryPreview.map((image) => ({
        image,
        text: ''
      })),
    [galleryPreview]
  )

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return t('selectDatePlaceholder')
    const date = new Date(dateStr + 'T00:00:00')
    const formatted = date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  const summaryItems = [
    { label: t('serviceLabel'), value: selectedService?.name || '', filled: Boolean(selectedService) },
    { label: t('masterLabel'), value: selectedStaff?.name || '', filled: Boolean(selectedStaff) },
    {
      label: t('dateTimeLabel'),
      value: selectedTime ? `${formatDisplayDate(selectedDate)} ${selectedTime}` : '',
      filled: Boolean(selectedTime),
    },
    { label: t('namePlaceholder'), value: clientName, filled: Boolean(clientName) },
    { label: t('phonePlaceholder'), value: clientPhone, filled: Boolean(clientPhone) },
    { label: t('emailPlaceholder'), value: clientEmail, filled: Boolean(clientEmail) },
    { label: t('socialNetworkLabel'), value: clientSocialMethod, filled: Boolean(clientSocialMethod) },
    { label: t('contactHandlePlaceholder'), value: clientSocialHandle, filled: Boolean(clientSocialHandle) },
  ]

  const resetForm = () => {
    setSelectedServiceId(null)
    setSelectedStaffId(null)
    setSelectedTime(null)
    setClientName('')
    setClientPhone('')
    setClientEmail('')
    setClientComment('')
    setClientSocialMethod('')
    setClientSocialHandle('')
  }

  const handleSubmit = () => {
    if (!selectedService || !selectedStaff || !selectedTime || !clientName || !clientPhone) {
      alert(t('fillRequiredAlert'))
      return
    }
    setIsMobileSummaryOpen(false)
    const appointmentDate = selectedDate
    const today = formatDateInput(new Date())
    const isFutureDate = appointmentDate >= today
    const status: 'pending' | 'confirmed' = isFutureDate ? 'pending' : 'confirmed'
    const newAppointment = {
      id: Date.now().toString(),
      startTime: selectedTime,
      endTime: addMinutesToTime(selectedTime, selectedService.duration || 0),
      client: clientName.trim(),
      phone: clientPhone,
      email: clientEmail.trim() || undefined,
      service: selectedService.name,
      master: selectedStaff.name,
      date: appointmentDate,
      status,
      source: 'online',
      price: selectedService.price,
      comment: clientComment.trim() || undefined,
      contactMethod: clientSocialMethod || undefined,
      contactHandle: clientSocialHandle.trim() || undefined,
    }

    try {
      const stored = localStorage.getItem('appointments')
      const allAppointments = stored ? JSON.parse(stored) : []
      if (Array.isArray(allAppointments)) {
        allAppointments.push(newAppointment)
        localStorage.setItem('appointments', JSON.stringify(allAppointments))
      } else {
        localStorage.setItem('appointments', JSON.stringify([newAppointment]))
      }
    } catch (e) {
      console.error('Error saving appointment:', e)
      localStorage.setItem('appointments', JSON.stringify([newAppointment]))
    }

    if (successTimeoutRef.current) {
      window.clearTimeout(successTimeoutRef.current)
      successTimeoutRef.current = null
    }
    setShowSuccess(true)
  }

  const canProceed = (step: number) => {
    if (step === 1) return !!selectedService
    if (step === 2) return !!selectedStaff
    if (step === 3) return !!selectedTime
    if (step === 4) return !!clientName && !!clientPhone && !!selectedService && !!selectedStaff && !!selectedTime
    return false
  }

  const canUseDOM = typeof document !== 'undefined'
  const successOverlay = showSuccess ? (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center">
      <div
        className={cn(
          'flex flex-col items-center justify-center text-center h-full',
          isMobile ? 'w-full px-6' : 'w-full max-w-[720px] px-6'
        )}
      >
        <Lottie
          animationData={successAnimation}
          loop={false}
          className={cn(
            'w-full max-w-[520px] object-contain',
            isMobile ? 'h-auto max-h-[50vh]' : 'h-auto max-h-[60vh]'
          )}
          onComplete={() => {
            if (successTimeoutRef.current) {
              window.clearTimeout(successTimeoutRef.current)
            }
            successTimeoutRef.current = window.setTimeout(() => {
              setShowSuccess(false)
              resetForm()
              successTimeoutRef.current = null
              if (location.pathname.endsWith('/booking')) {
                const returnTo = new URLSearchParams(location.search).get('returnTo')
                navigate(returnTo || (urlSlug ? `/b/${urlSlug}${location.search || '?theme=premium-hair'}` : '/'))
              }
            }, 1800)
          }}
        />
        <div className={cn('mt-4 space-y-2')}>
          <p className="text-lg md:text-xl font-semibold text-white">{t('successLine1')}</p>
          <p className="text-sm md:text-base text-white/80">{t('successLine2')}</p>
        </div>
      </div>
    </div>
  ) : null
  const mobileBar = isMobile ? (
    <PublicBookingMobileBar
      t={t as (key: string) => string}
      currentStep={currentStep}
      setCurrentStep={setCurrentStep}
      isMobileSummaryOpen={isMobileSummaryOpen}
      setIsMobileSummaryOpen={setIsMobileSummaryOpen}
      canProceed={canProceed}
      handleSubmit={handleSubmit}
      selectedService={selectedService}
      selectedStaff={selectedStaff}
      formatDisplayDate={formatDisplayDate}
      selectedDate={selectedDate}
      selectedTime={selectedTime}
      clientPhone={clientPhone}
      clientSocialMethod={clientSocialMethod}
      clientSocialHandle={clientSocialHandle}
    />
  ) : null

  /** Общий оверлей календаря: нужен и на главной странице салона, и на отдельном маршруте /booking (запись с массажа и т.д.). */
  const datePickerModal = isDatePickerOpen ? (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10060]"
        onClick={() => setIsDatePickerOpen(false)}
      />
      <div
        className="fixed inset-0 z-[10070] flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setIsDatePickerOpen(false)
          }
        }}
      >
        <Card
          className="w-full max-w-sm backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{t('selectDate')}</h3>
              <Button variant="ghost" size="icon" onClick={() => setIsDatePickerOpen(false)} className="h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(calendarDate)
                  newDate.setMonth(newDate.getMonth() - 1)
                  setCalendarDate(newDate)
                }}
                className="h-8 w-8"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="font-semibold text-sm">
                {calendarDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  const newDate = new Date(calendarDate)
                  newDate.setMonth(newDate.getMonth() + 1)
                  setCalendarDate(newDate)
                }}
                className="h-8 w-8"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekdaysShort.map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {getDaysInMonth(calendarDate).map((date, idx) => {
                if (!date) {
                  return <div key={idx} className="h-9" />
                }
                const dateStr = formatDateToLocalString(date)
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setSelectedDate(dateStr)
                      setSelectedTime(null)
                      setIsDatePickerOpen(false)
                    }}
                    className={cn(
                      'h-9 rounded-lg text-sm transition-all cursor-pointer',
                      isSelected(date, selectedDate)
                        ? 'bg-accent text-accent-foreground font-semibold'
                        : isToday(date)
                          ? 'bg-accent/20 text-accent font-semibold hover:bg-accent/30'
                          : 'text-foreground hover:bg-accent/10 hover:text-accent'
                    )}
                  >
                    {date.getDate()}
                  </button>
                )
              })}
            </div>
          </div>
        </Card>
      </div>
    </>
  ) : null

  const isBookingPage = location.pathname.endsWith('/booking')
  if (isBookingPage) {
    const returnTo = searchParams.get('returnTo')
    const backUrl = returnTo || (urlSlug ? `/b/${urlSlug}${location.search || '?theme=premium-hair'}` : '/')

    return (
      <div className="min-h-screen bg-background">
        {canUseDOM && successOverlay ? createPortal(successOverlay, document.body) : null}
        <div className="flex shrink-0 items-center border-b border-border/60 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))]">
          <button
            type="button"
            onClick={() => navigate(backUrl)}
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-foreground/80"
          >
            <ChevronLeft className="h-5 w-5" />
            {t('back')}
          </button>
        </div>
        <div
          className={cn(
            'p-4',
            isMobile
              ? 'pb-[calc(7.25rem+env(safe-area-inset-bottom,0px))]'
              : 'overflow-auto'
          )}
        >
          <PublicBookingFormSection
            t={t}
            steps={steps}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            activeServices={activeServices}
            selectedServiceId={selectedServiceId}
            setSelectedServiceId={setSelectedServiceId}
            setSelectedStaffId={setSelectedStaffId}
            setSelectedTime={setSelectedTime}
            selectedStaffId={selectedStaffId}
            selectedTime={selectedTime}
            availableStaff={availableStaff}
            slots={slots}
            busySlots={busySlots}
            setCalendarDate={setCalendarDate}
            setIsDatePickerOpen={setIsDatePickerOpen}
            selectedDate={selectedDate}
            formatDisplayDate={formatDisplayDate}
            setSelectedDate={setSelectedDate}
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
            clientEmail={clientEmail}
            setClientEmail={setClientEmail}
            clientComment={clientComment}
            setClientComment={setClientComment}
            clientSocialMethod={clientSocialMethod}
            setClientSocialMethod={setClientSocialMethod}
            isSocialOpen={isSocialOpen}
            setIsSocialOpen={setIsSocialOpen}
            socialOptions={socialOptions}
            clientSocialHandle={clientSocialHandle}
            setClientSocialHandle={setClientSocialHandle}
            canProceed={canProceed}
            handleSubmit={handleSubmit}
            summaryItems={summaryItems}
            selectedService={selectedService}
            isMobile={isMobile}
            socialRef={socialRef}
          />
        </div>
        {isMobile ? (
          <PublicBookingMobileBar
            t={t as (key: string) => string}
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            isMobileSummaryOpen={isMobileSummaryOpen}
            setIsMobileSummaryOpen={setIsMobileSummaryOpen}
            canProceed={canProceed}
            handleSubmit={handleSubmit}
            selectedService={selectedService}
            selectedStaff={selectedStaff}
            formatDisplayDate={formatDisplayDate}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            clientPhone={clientPhone}
            clientSocialMethod={clientSocialMethod}
            clientSocialHandle={clientSocialHandle}
          />
        ) : null}
        {datePickerModal}
      </div>
    )
  }

  const pd = PREMIUM_PUBLIC_DEFAULTS_BY_LANG[publicLang] ?? PREMIUM_PUBLIC_DEFAULTS_BY_LANG.ru

  if (publicHeaderThemeRaw === 'premium-hair' || publicHeaderThemeRaw === 'premium-barber') {
    /** Черновик премиума: те же запасные slug/темы/зеркальные ключи, что и у readDraftNullable — иначе ввод «съезжает» в имя из регистрации. */
    const readPremiumLocalDraft = (draftKey: string, mirrorDraftKey?: string): string | null => {
      if (typeof window === 'undefined' || isTemplateDemo) return null
      const slugStored = window.localStorage.getItem('publicSlug') || 'salon'
      const slugCandidates = [...new Set([slugForDrafts, slugStored, 'salon'].filter((s) => String(s).length > 0))]
      const themeCandidates =
        publicHeaderThemeRaw !== publicHeaderTheme
          ? [publicHeaderThemeRaw, publicHeaderTheme]
          : [publicHeaderTheme]
      const keys = mirrorDraftKey ? [draftKey, mirrorDraftKey] : [draftKey]
      for (const sp of slugCandidates) {
        for (const th of themeCandidates) {
          for (const k of keys) {
            const v = window.localStorage.getItem(`draft_${k}_${sp}_${th}`)
            if (v !== null) return v
          }
        }
      }
      return null
    }
    const premiumSiteNameFromDraft = readPremiumLocalDraft('publicName')
    const premiumSiteNameRaw =
      premiumSiteNameFromDraft !== null
        ? premiumSiteNameFromDraft
        : typeof window !== 'undefined' && !isTemplateDemo
          ? window.localStorage.getItem('publicName')
          : null
    const premiumSiteNameTrimmed = premiumSiteNameRaw?.trim() ?? ''
    const premiumSiteName =
      premiumSiteNameRaw !== null
        ? premiumSiteNameTrimmed === ''
          ? ''
          : isPreview && isEditMode && !isTemplateDemo
            ? premiumSiteNameTrimmed
            : !isLegacyName(premiumSiteNameTrimmed)
              ? premiumSiteNameTrimmed
              : salonNameFromRegistration || headerDisplayName
        : salonNameFromRegistration || headerDisplayName
    const userHeroVideo = isTemplateDemo ? null : (readPublic('publicHeroVideo') || null)
    const userHeroImage = isTemplateDemo ? null : (readPublic('publicHeroImage') || null)
    const isIdbSalonHeroVideo =
      !isTemplateDemo && userHeroVideo === SALON_PREMIUM_HERO_VIDEO_IDB_MARKER
    const resolvedUserHeroVideo = isIdbSalonHeroVideo ? premiumSalonHeroVideoObjectUrl : userHeroVideo
    // Если пользователь загрузил фото — не показываем дефолтное видео поверх него
    const heroVideoUrl = isTemplateDemo
      ? defaultHeroVideo
      : isIdbSalonHeroVideo && resolvedUserHeroVideo === null
        ? null
        : resolvedUserHeroVideo || (userHeroImage ? null : defaultHeroVideo)
    const heroImageUrl = isTemplateDemo ? barberPremiumHeroBg : (userHeroImage || barberPremiumHeroBg)
    /**
     * В режиме редактирования: только черновик для текущего языка; если ещё не сохраняли — чистый pd.*.
     * Старый ключ без суффикса языка не подмешиваем (там мог остаться «битый» текст после багов ввода).
     */
    const rawPremiumHeroSub = !isTemplateDemo
      ? isPreview && skipHeaderJunkFilterInConstructorPreview && typeof window !== 'undefined'
        ? (() => {
            const k = `draft_publicPremiumHeroSubtitle_${slugForDrafts}_${publicHeaderTheme}_${publicLang}`
            const v = window.localStorage.getItem(k)
            if (v !== null) return v
            return pd.heroSubtitle
          })()
        : readPublic('publicPremiumHeroSubtitle', pd.heroSubtitle)
      : pd.heroSubtitle
    const rawPremiumHeroTitle = !isTemplateDemo
      ? isPreview && skipHeaderJunkFilterInConstructorPreview && typeof window !== 'undefined'
        ? (() => {
            const k = `draft_publicPremiumHeroTitle_${slugForDrafts}_${publicHeaderTheme}_${publicLang}`
            const v = window.localStorage.getItem(k)
            if (v !== null) return v
            return pd.heroTitle
          })()
        : readPublic('publicPremiumHeroTitle', pd.heroTitle)
      : pd.heroTitle
    /**
     * Как у обычного tagline: в превью конструктора (в т.ч. полный экран без edit) не применять isJunkHeaderText.
     */
    const premiumHeroSubtitle = isTemplateDemo
      ? pd.heroSubtitle
      : skipHeaderJunkFilterInConstructorPreview
        ? rawPremiumHeroSub.trim() === ''
          ? ''
          : rawPremiumHeroSub
        : rawPremiumHeroSub.trim() === ''
          ? ''
          : !isJunkHeaderText(rawPremiumHeroSub.trim())
            ? rawPremiumHeroSub
            : pd.heroSubtitle
    const premiumHeroTitle = isTemplateDemo
      ? pd.heroTitle
      : skipHeaderJunkFilterInConstructorPreview
        ? rawPremiumHeroTitle.trim() === ''
          ? ''
          : rawPremiumHeroTitle
        : rawPremiumHeroTitle.trim() === ''
          ? ''
          : !isJunkHeaderText(rawPremiumHeroTitle.trim())
            ? rawPremiumHeroTitle
            : pd.heroTitle
    /** Не использовать || после readPublic — пустая строка из черновика снова подменялась дефолтом */
    const premiumHeroContactsLabel = isTemplateDemo
      ? uiText[publicLang].contacts
      : readPublic('publicPremiumHeroContactsLabel', uiText[publicLang].contacts)
    const premiumBookLabel = isTemplateDemo
      ? uiText[publicLang].bookNow
      : readPublic('publicPremiumBookLabel', uiText[publicLang].bookNow)
    const premiumGoldColor = isTemplateDemo ? undefined : (readPublic('publicPremiumGoldColor') || undefined)
    const premiumHeaderBgColor = isTemplateDemo ? undefined : (readPublic('publicPremiumHeaderBgColor') || undefined)
    const premiumHeaderBgGlow = isTemplateDemo ? undefined : (readPublic('publicPremiumHeaderBgGlow') || undefined)
    const premiumHeaderNavColor = isTemplateDemo ? undefined : (readPublic('publicPremiumHeaderNavColor') || undefined)
    const premiumHeaderTitleColor = isTemplateDemo ? undefined : (readPublic('publicPremiumHeaderTitleColor') || undefined)
    const premiumHeroSubtitleColor = isTemplateDemo ? undefined : (readPublic('publicPremiumHeroSubtitleColor') || undefined)
    const premiumHeroTitleColor = isTemplateDemo ? undefined : (readPublic('publicPremiumHeroTitleColor') || undefined)
    const premiumHeroButton1BorderColor = isTemplateDemo ? undefined : (readPublic('publicPremiumHeroButton1BorderColor') || undefined)
    const premiumHeroButton2BorderColor = isTemplateDemo ? undefined : (readPublic('publicPremiumHeroButton2BorderColor') || undefined)
    const premiumHeroButton1Glow = isTemplateDemo ? undefined : (readPublic('publicPremiumHeroButton1Glow') || undefined)
    const premiumHeroButton2Glow = isTemplateDemo ? undefined : (readPublic('publicPremiumHeroButton2Glow') || undefined)
    const rawAboutTitle = !isTemplateDemo ? readPublic('publicAboutSalonTitle', pd.aboutTitle) : null
    const rawAboutDesc = !isTemplateDemo ? readPublic('publicAboutSalonDescription', pd.aboutDesc) : null
    const rawAboutThird = !isTemplateDemo ? readPublic('publicAboutSalonThirdText', pd.aboutThird) : null
    const premiumAboutSalonTitle = isTemplateDemo ? pd.aboutTitle : (rawAboutTitle === '' ? '' : (rawAboutTitle || pd.aboutTitle))
    const premiumAboutSalonDescription = isTemplateDemo ? pd.aboutDesc : (rawAboutDesc === '' ? '' : (rawAboutDesc || pd.aboutDesc))
    const premiumAboutSalonThirdText = isTemplateDemo ? pd.aboutThird : (rawAboutThird === '' ? '' : (rawAboutThird || pd.aboutThird))
    const premiumAboutSalonTitleColor = isTemplateDemo ? undefined : (readPublic('publicAboutSalonTitleColor') || undefined)
    const premiumAboutSalonDescColor = isTemplateDemo ? undefined : (readPublic('publicAboutSalonDescColor') || undefined)
    const premiumAboutSalonThirdColor = isTemplateDemo ? undefined : (readPublic('publicAboutSalonThirdColor') || undefined)
    const premiumAboutSalonButtonBorderColor = isTemplateDemo ? undefined : (readPublic('publicAboutSalonButtonBorderColor') || undefined)
    const premiumAboutSalonPhotoUrls = (() => {
      if (isTemplateDemo) return undefined
      const urls: string[] = []
      for (let i = 1; i <= 10; i++) {
        const v = readPublic(`publicAboutSalon${i}`)
        if (v && v !== '__empty__') urls.push(v)
      }
      return urls.length > 0 ? urls : undefined
    })()
    const draftWorksTitle = typeof window !== 'undefined' && !isTemplateDemo ? window.localStorage.getItem(`draft_publicWorksTitle_${slugForDrafts}_${publicHeaderTheme}`) : null
    const draftWorksSubtitle = typeof window !== 'undefined' && !isTemplateDemo ? window.localStorage.getItem(`draft_publicWorksSubtitle_${slugForDrafts}_${publicHeaderTheme}`) : null
    const premiumWorksTitle = isTemplateDemo ? pd.worksTitle : (draftWorksTitle != null ? draftWorksTitle : pd.worksTitle)
    const premiumWorksSubtitle = isTemplateDemo ? pd.worksSub : (draftWorksSubtitle != null ? draftWorksSubtitle : pd.worksSub)
    const premiumWorksTitleColor = isTemplateDemo ? undefined : (readPublic('publicWorksTitleColor') || undefined)
    const premiumWorksSubtitleColor = isTemplateDemo ? undefined : (readPublic('publicWorksSubtitleColor') || undefined)
    const premiumWorksPhotoUrls = (() => {
      if (isTemplateDemo) return undefined
      const urls: string[] = []
      for (let i = 1; i <= 10; i++) {
        const v = readPublic(`publicWorks${i}`)
        if (v && v !== '__empty__') urls.push(v)
      }
      return urls.length > 0 ? urls : undefined
    })()
    const premiumServiceCards = (() => {
      if (isTemplateDemo) return undefined
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(`draft_publicServiceCards_${slugForDrafts}_${publicHeaderTheme}`) : null
      if (raw == null || raw === '') return undefined
      try {
        const parsed = JSON.parse(raw) as Array<{ imageUrl?: string; title: string; items: Array<{ name: string; desc: string }> }>
        return Array.isArray(parsed) && parsed.length > 0 ? parsed : undefined
      } catch {
        return undefined
      }
    })()
    const premiumFooterTitleColor = isTemplateDemo ? undefined : (readPublic('publicFooterTitleColor') || undefined)
    const premiumFooterTextColor = isTemplateDemo ? undefined : (readPublic('publicFooterTextColor') || undefined)
    const premiumFooterDayOffColor = isTemplateDemo ? undefined : (readPublic('publicFooterDayOffColor') || undefined)
    const readDraftNullable = (key: string): string | null => {
      if (typeof window === 'undefined' || isTemplateDemo) return null
      const addressMapKeys = ['publicFooterAddress', 'publicAddress', 'publicMapEmbedUrl']
      const themeForKey = addressMapKeys.includes(key) ? publicHeaderThemeRaw : publicHeaderTheme
      const slugStored = window.localStorage.getItem('publicSlug') || 'salon'
      const slugCandidates = [...new Set([slugForDrafts, slugStored, 'salon'].filter((s) => String(s).length > 0))]
      const themeCandidates =
        publicHeaderThemeRaw !== publicHeaderTheme ? [publicHeaderThemeRaw, publicHeaderTheme] : [themeForKey]
      for (const sp of slugCandidates) {
        for (const th of themeCandidates) {
          const draftKey = `draft_${key}_${sp}_${th}`
          const fromDraft = window.localStorage.getItem(draftKey)
          if (fromDraft !== null) return fromDraft
          if (key === 'publicFooterAddress') {
            const alt = window.localStorage.getItem(`draft_publicAddress_${sp}_${th}`)
            if (alt !== null) return alt
          }
          if (key === 'publicAddress') {
            const alt = window.localStorage.getItem(`draft_publicFooterAddress_${sp}_${th}`)
            if (alt !== null) return alt
          }
        }
      }
      /** Как readPublic: без наследия `publicFooterAddress` и т.д. v всегда null → в шаблоне ?? ui.defAddr затирал ввод. */
      const legacy = window.localStorage.getItem(key)
      if (legacy !== null) return legacy
      if (key === 'publicFooterAddress') {
        const alt = window.localStorage.getItem('publicAddress')
        if (alt !== null) return alt
      }
      if (key === 'publicAddress') {
        const alt = window.localStorage.getItem('publicFooterAddress')
        if (alt !== null) return alt
      }
      return null
    }
    const footerLangDef = FOOTER_DEFAULTS_BY_LANG[publicLang] ?? FOOTER_DEFAULTS_BY_LANG.ru
    const premiumFooterAddress = (() => {
      const v = readDraftNullable('publicFooterAddress')
      if (v === null) return footerLangDef.address
      if (isFooterFieldClearedMarker(v)) return ''
      return v
    })()
    const premiumFooterPhone = (() => {
      const v = readDraftNullable('publicPhone')
      if (v === null) return footerLangDef.phone
      if (isFooterFieldClearedMarker(v)) return ''
      return v
    })()
    const premiumFooterHours = (() => {
      const v = readDraftNullable('publicHours')
      if (v === null) return footerLangDef.hours
      if (isFooterFieldClearedMarker(v)) return ''
      return localizeFooterHoursLine(v, publicLang, footerLangDef.hours)
    })()
    const premiumFooterDayOff = (() => {
      const v = readDraftNullable('publicDayOff')
      if (v === null) return footerLangDef.dayOff
      if (isFooterFieldClearedMarker(v)) return ''
      return localizeFooterDayOffLine(v, publicLang, footerLangDef.dayOff)
    })()
    const premiumFooterEmail = (() => {
      const v = readDraftNullable('publicEmail')
      if (v === null) return footerLangDef.email
      if (isFooterFieldClearedMarker(v)) return ''
      return v
    })()
    const premiumFooterSiteNameFromDraft = readPremiumLocalDraft('publicFooterSiteName', 'publicFooterName')
    const premiumFooterSiteNameRaw =
      premiumFooterSiteNameFromDraft !== null
        ? premiumFooterSiteNameFromDraft
        : typeof window !== 'undefined' && !isTemplateDemo
          ? window.localStorage.getItem('publicFooterName')
          : null
    const premiumFooterSiteName = premiumFooterSiteNameRaw !== null ? premiumFooterSiteNameRaw : premiumSiteName
    const premiumCtaVisible = (() => {
      const v = readDraftNullable('publicCtaBlockVisible')
      return v !== null ? v !== '0' : true
    })()
    const premiumServicesTitleRaw = readDraftNullable('publicServicesSectionTitle')
    const premiumServicesTitle = premiumServicesTitleRaw !== null ? premiumServicesTitleRaw : pd.servicesTitle
    const premiumServicesSubtitleRaw = readDraftNullable('publicServicesSectionSubtitle')
    const premiumServicesSubtitle = premiumServicesSubtitleRaw !== null ? premiumServicesSubtitleRaw : pd.servicesSub
    const premiumServicesTitleColor = isTemplateDemo ? undefined : (readPublic('publicServicesTitleColor') || undefined)
    const premiumServicesSubtitleColor = isTemplateDemo ? undefined : (readPublic('publicServicesSubtitleColor') || undefined)
    const premiumServicesCardTitleColor = isTemplateDemo ? undefined : (readPublic('publicServicesCardTitleColor') || undefined)
    const premiumServicesProcNameColor = isTemplateDemo ? undefined : (readPublic('publicServicesProcNameColor') || undefined)
    const premiumServicesProcDescColor = isTemplateDemo ? undefined : (readPublic('publicServicesProcDescColor') || undefined)
    const premiumServicesPhotosHidden = (() => {
      const v = readDraftNullable('publicServicesPhotosHidden')
      return v !== null ? v === '1' : false
    })()
    const premiumCtaTitleRaw = readDraftNullable('publicCtaTitle')
    const premiumCtaTitle = premiumCtaTitleRaw !== null ? premiumCtaTitleRaw : pd.ctaTitle
    const premiumCtaSubtitleRaw = readDraftNullable('publicCtaSubtitle')
    const premiumCtaSubtitle = premiumCtaSubtitleRaw !== null ? premiumCtaSubtitleRaw : pd.ctaSub
    const premiumCtaSparkleColor = isTemplateDemo ? undefined : (readPublic('publicCtaSparkleColor') || undefined)
    const premiumCtaTitleColor = isTemplateDemo ? undefined : (readPublic('publicCtaTitleColor') || undefined)
    const premiumCtaSubtitleColor = isTemplateDemo ? undefined : (readPublic('publicCtaSubtitleColor') || undefined)
    const premiumCtaButtonBorderColor = isTemplateDemo ? undefined : (readPublic('publicCtaButtonBorderColor') || undefined)
    const premiumMapLabelLeftRaw = readDraftNullable('publicMapLabelLeft')
    const premiumMapLabelLeft = premiumMapLabelLeftRaw !== null ? premiumMapLabelLeftRaw : pd.mapLeft
    const premiumMapLabelRightRaw = readDraftNullable('publicMapLabelRight')
    const premiumMapLabelRight = premiumMapLabelRightRaw !== null ? premiumMapLabelRightRaw : pd.mapRight
    const premiumMapLabelColor = isTemplateDemo ? undefined : (readPublic('publicMapLabelColor') || undefined)
    const savePremiumDraft = (key: string, value: string) => {
      if (typeof window === 'undefined') return
      const addressMapKeys = ['publicFooterAddress', 'publicAddress', 'publicMapEmbedUrl']
      const themeForKey = addressMapKeys.includes(key) ? publicHeaderThemeRaw : publicHeaderTheme
      const storageKey = PREMIUM_HERO_LANG_SCOPED_KEYS.has(key)
        ? `draft_${key}_${slugForDrafts}_${themeForKey}_${publicLang}`
        : `draft_${key}_${slugForDrafts}_${themeForKey}`
      const prev = window.localStorage.getItem(storageKey) ?? window.localStorage.getItem(key) ?? ''
      try {
        window.parent?.postMessage?.({ type: 'constructorUndoPush', key, value: prev || null, themeId: themeForKey }, '*')
      } catch { /* ignore */ }
      window.localStorage.setItem(storageKey, value)
      if (key === 'publicName') {
        try {
          window.localStorage.setItem('publicName', value)
        } catch {
          /* ignore */
        }
      }
      if (key === 'publicFooterSiteName') {
        const mirrorFooterNameKey = `draft_publicFooterName_${slugForDrafts}_${themeForKey}`
        try {
          window.localStorage.setItem(mirrorFooterNameKey, value)
          window.localStorage.setItem('publicFooterName', value)
        } catch {
          /* ignore */
        }
      }
      /** Карта и open-in-maps читают `publicAddress`; футер — `publicFooterAddress`. Без синхронизации старый primary «дополнял» ввод. */
      if (key === 'publicFooterAddress') {
        const addrKey = `draft_publicAddress_${slugForDrafts}_${themeForKey}`
        const prevAddr = window.localStorage.getItem(addrKey) ?? window.localStorage.getItem('publicAddress') ?? ''
        try {
          window.parent?.postMessage?.({
            type: 'constructorUndoPush',
            key: 'publicAddress',
            value: prevAddr || null,
            themeId: themeForKey,
          }, '*')
        } catch { /* ignore */ }
        window.localStorage.setItem(addrKey, value)
        /**
         * Глобальные ключи — тот же fallback, что readDraftNullable/readPublic после draft_*.
         * Если slug/theme в draft_* и parent-конструкторе расходятся на один кадр, без этого снова читается старый «City, street…».
         */
        try {
          window.localStorage.setItem('publicFooterAddress', value)
          window.localStorage.setItem('publicAddress', value)
        } catch {
          /* ignore */
        }
      }
      window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderThemeRaw}`, '1')
      draftVersionTrigger()
    }
    return (
      <>
      <PremiumBarberTemplate
        siteName={premiumSiteName}
        footerSiteName={premiumFooterSiteName}
        tagline={publicTagline === '' ? '' : publicTagline || pd.tagline}
        onBookNow={() => navigate(urlSlug ? `/b/${urlSlug}/booking${location.search ? location.search : ''}` : '/')}
        bookLabel={premiumBookLabel}
        footerAddress={premiumFooterAddress}
        footerPhone={premiumFooterPhone}
        footerHours={premiumFooterHours}
        footerDayOff={footerVisibility.dayOff ? premiumFooterDayOff : undefined}
        footerEmail={premiumFooterEmail}
        footerLogo={isTemplateDemo ? null : (publicFooterLogo || null)}
        footerLogoShape={footerLogoDisplayShape}
        footerLogoVisible={publicFooterLogoVisible}
        footerVisibility={footerVisibility}
        socialVisibility={socialVisibility}
        footerTitleColor={premiumFooterTitleColor || undefined}
        footerTextColor={premiumFooterTextColor || undefined}
        footerDayOffColor={premiumFooterDayOffColor || undefined}
        telegramUrl={publicTelegram || undefined}
        viberUrl={publicViber || undefined}
        instagramUrl={publicInstagram || undefined}
        facebookUrl={publicFacebook || undefined}
        whatsappUrl={publicWhatsapp || undefined}
        twitterUrl={publicTwitter || undefined}
        tiktokUrl={publicTiktok || undefined}
        addressLabel={
          !isTemplateDemo && footerLabels?.address?.trim() ? footerLabels.address : undefined
        }
        scheduleLabel={
          !isTemplateDemo && footerLabels?.schedule?.trim() ? footerLabels.schedule : undefined
        }
        phoneLabel={!isTemplateDemo && footerLabels?.phone?.trim() ? footerLabels.phone : undefined}
        emailLabel={!isTemplateDemo && footerLabels?.email?.trim() ? footerLabels.email : undefined}
        lang={publicLang}
        mapEmbedUrl={googleMapUrl}
        heroVideoUrl={heroVideoUrl || undefined}
        heroImageUrl={heroImageUrl || undefined}
        isEditMode={isPreview && isEditMode}
        heroSubtitle={premiumHeroSubtitle}
        heroTitle={premiumHeroTitle}
        heroContactsLabel={premiumHeroContactsLabel}
        onSaveDraft={isPreview && isEditMode ? savePremiumDraft : undefined}
        accentColor={premiumGoldColor || undefined}
        headerBgColor={premiumHeaderBgColor || undefined}
        headerBgGlow={premiumHeaderBgGlow || undefined}
        headerNavColor={premiumHeaderNavColor || undefined}
        headerTitleColor={premiumHeaderTitleColor || undefined}
        heroSubtitleColor={premiumHeroSubtitleColor || undefined}
        heroTitleColor={premiumHeroTitleColor || undefined}
        heroButton1BorderColor={premiumHeroButton1BorderColor || undefined}
        heroButton2BorderColor={premiumHeroButton2BorderColor || undefined}
        heroButton1Glow={premiumHeroButton1Glow || undefined}
        heroButton2Glow={premiumHeroButton2Glow || undefined}
        aboutSectionTitle={premiumAboutSalonTitle}
        aboutSectionDescription={premiumAboutSalonDescription}
        aboutSectionThirdText={premiumAboutSalonThirdText}
        aboutSectionTitleColor={premiumAboutSalonTitleColor || undefined}
        aboutSectionDescColor={premiumAboutSalonDescColor || undefined}
        aboutSectionThirdColor={premiumAboutSalonThirdColor || undefined}
        aboutSectionButtonBorderColor={premiumAboutSalonButtonBorderColor || undefined}
        aboutSalonPhotoUrls={premiumAboutSalonPhotoUrls}
        worksSectionTitle={premiumWorksTitle}
        worksSectionSubtitle={premiumWorksSubtitle}
        worksSectionTitleColor={premiumWorksTitleColor || undefined}
        worksSectionSubtitleColor={premiumWorksSubtitleColor || undefined}
        worksPhotoUrls={premiumWorksPhotoUrls}
        serviceCards={premiumServiceCards}
        servicesSectionTitle={premiumServicesTitle}
        servicesSectionSubtitle={premiumServicesSubtitle}
        servicesTitleColor={premiumServicesTitleColor}
        servicesSubtitleColor={premiumServicesSubtitleColor}
        servicesCardTitleColor={premiumServicesCardTitleColor}
        servicesProcNameColor={premiumServicesProcNameColor}
        servicesProcDescColor={premiumServicesProcDescColor}
        servicesPhotosHidden={premiumServicesPhotosHidden}
        ctaBlockVisible={premiumCtaVisible}
        ctaTitle={premiumCtaTitle}
        ctaSubtitle={premiumCtaSubtitle}
        ctaSparkleColor={premiumCtaSparkleColor}
        ctaTitleColor={premiumCtaTitleColor}
        ctaSubtitleColor={premiumCtaSubtitleColor}
        ctaButtonBorderColor={premiumCtaButtonBorderColor}
        mapLabelLeft={premiumMapLabelLeft}
        mapLabelRight={premiumMapLabelRight}
        mapLabelColor={premiumMapLabelColor}
        sectionRefs={{
          header: headerSectionRef,
          gallery: gallerySectionRef,
          booking: bookingSectionRef,
          works: worksSectionRef,
          map: mapSectionRef,
          cta: ctaSectionRef,
          footer: footerSectionRef,
        }}
      />
      {/* Кнопка выбора языка: в превью с edit — только языки из сайдбара конструктора; иначе — все доступные */}
      {showPublicLangSwitcher && (
      <div className="fixed bottom-6 left-6 z-[200]">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="h-11 w-11 rounded-full bg-black/70 border border-white/20 shadow-lg backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition"
            aria-label={t('language')}
          >
            <img
              src={publicLang === 'ru' ? flagRu : publicLang === 'en' ? flagEn : flagRo}
              alt={publicLang === 'ru' ? 'Русский' : publicLang === 'en' ? 'English' : 'Română'}
              className="h-6 w-6 rounded-full"
            />
          </button>
          {isLangOpen && (
            <div className="absolute bottom-full left-0 mb-3 flex flex-col gap-2">
              {([
                { code: 'ru' as const, icon: flagRu, label: 'Русский' },
                { code: 'en' as const, icon: flagEn, label: 'English' },
                { code: 'ro' as const, icon: flagRo, label: 'Română' },
              ] as const)
                .filter((item) => item.code !== publicLang && langsForPublicSwitcher.includes(item.code))
                .map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => { setLang(item.code); setIsLangOpen(false) }}
                    className="h-11 w-11 rounded-full border border-white/20 bg-black/70 hover:bg-black/90 shadow-lg backdrop-blur-md flex items-center justify-center transition"
                    aria-label={item.label}
                  >
                    <img src={item.icon} alt={item.label} className="h-6 w-6 rounded-full" />
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
      )}
      </>
    )
  }

  const showGoToConstructor =
    isPreview &&
    !isEditMode &&
    !hidePreviewChrome &&
    typeof window !== 'undefined' &&
    window.top === window
  const goToConstructorMobile = showGoToConstructor && isMobile

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-b from-background via-background to-card text-foreground overflow-x-hidden',
        goToConstructorMobile && 'pt-[calc(3.35rem+env(safe-area-inset-top,0px))]'
      )}
      data-salon-theme={publicHeaderTheme}
    >
      {showLoading && (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#0b0b0b]">
          <div className="relative flex items-center justify-center">
            <Lottie
              animationData={loadingAnimation}
              loop
              className="w-64 h-64 sm:w-72 sm:h-72"
            />
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-[#0b0b0b]" />
          </div>
        </div>
      )}
      <div style={bodyShellSurfaceStyle}>
      <header
        ref={headerSectionRef}
        className={cn(
          'relative',
          isDraggableHeaderTheme
            ? 'overflow-x-hidden overflow-y-visible sm:overflow-hidden'
            : 'overflow-hidden'
        )}
      >
        <div
          ref={headerEditContainerRef}
          className={cn(
            'w-full bg-center flex items-start',
            isDraggableHeaderTheme
              ? 'overflow-x-hidden overflow-y-visible sm:overflow-hidden'
              : 'overflow-hidden',
            'min-h-[520px] sm:min-h-[620px] md:min-h-[760px] lg:min-h-[860px]',
            isDraggableHeaderTheme &&
              cn('salon-hair-hero', (isEditMode || showDraggableHeroReadOnly) && 'salon-hair-hero--edit')
          )}
          style={{
            backgroundImage: massagePreviewHeroVideoSrc
              ? 'none'
              : heroBackgroundUrl
                ? `url("${heroBackgroundUrl}")`
                : 'linear-gradient(120deg, rgba(17,17,17,0.9), rgba(31,41,55,0.85))',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: publicHeaderTheme === 'barber' ? 'left center' : 'center 0%',
            backgroundColor: '#0b0b0b',
          }}
        >
          {massagePreviewHeroVideoSrc ? (
            <video
              key={massagePreviewHeroVideoSrc}
              className="pointer-events-none absolute inset-0 z-0 h-full w-full object-cover"
              src={massagePreviewHeroVideoSrc}
              muted
              loop
              autoPlay
              playsInline
            />
          ) : null}
          <div
            className={cn(
              'absolute inset-0',
              publicHeaderTheme === 'cosmetology'
                ? 'bg-black/25'
                : publicHeaderTheme === 'coloring'
                  ? 'bg-black/10'
                  : publicHeaderTheme === 'manicure'
                    ? 'bg-transparent'
                    : 'bg-black/45'
            )}
          />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-b from-transparent via-black/35 to-black/65" />
          {publicHeaderTheme === 'custom' && publicHeaderLogoPlacement === 'corner' && publicLogo && publicHeaderLogoVisible && (
            <div
              className={cn(
                'absolute top-2 left-2 z-20 h-32 w-32 overflow-hidden border border-white/30 bg-white/10',
                headerLogoDisplayShape === 'circle'
                  ? 'rounded-full'
                  : headerLogoDisplayShape === 'rounded'
                    ? 'rounded-xl'
                    : 'rounded-none'
              )}
            >
              <img src={publicLogo} alt="Logo" className="h-full w-full object-cover" />
            </div>
          )}
          {publicHeaderTheme === 'custom' && publicHeaderLogoPlacement === 'corner-left-title' && (
            <div className="absolute top-2 left-2 z-20 flex items-center gap-4">
              {publicLogo && publicHeaderLogoVisible && (
                <div
                  className={cn(
                    'h-24 w-24 overflow-hidden border border-white/30 bg-white/10',
                    headerLogoDisplayShape === 'circle'
                      ? 'rounded-full'
                      : headerLogoDisplayShape === 'rounded'
                        ? 'rounded-xl'
                        : 'rounded-none'
                  )}
                >
                  <img src={publicLogo} alt="Logo" className="h-full w-full object-cover" />
                </div>
              )}
              <h1
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-pre-wrap break-words overflow-visible"
                style={headerTitleStyleForRender}
              >
                {headerDisplayName}
              </h1>
            </div>
          )}
          {!heroBackgroundUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white/70 text-sm uppercase tracking-[0.3em]">
                {t('addSalonPhoto')}
              </span>
            </div>
          )}
          <div
            className={cn(
              'relative z-10 text-white flex',
              useDraggableHeaderHero
                ? cn(
                    'absolute inset-0',
                    'salon-hair-hero-edit-wrap',
                    'salon-hair-hero-content',
                    'flex flex-col items-center justify-center text-center'
                  )
                : isDraggableHeaderTheme && !isEditMode
                  ? cn(HAIR_HEADER_INITIAL_PADDING, 'salon-hair-hero-content')
                  : undefined
            )}
          >
            {useDraggableHeaderHero ? (
              <DraggableHeaderHair
                key={`${publicHeaderTheme}-${headerLayoutBranchQuery ?? 'na'}`}
                readOnly={showDraggableHeroReadOnly}
                headerLayoutBranch={headerLayoutBranchQuery}
                layoutStorageKey={headerLayoutStorageKey}
                defaultLayout={
                  DEFAULT_HEADER_LAYOUT_BY_THEME[publicHeaderTheme] ?? DEFAULT_HEADER_LAYOUT_BY_THEME.hair
                }
                headerTheme={publicHeaderTheme}
                onDragStart={() => setIsHeaderDragging(true)}
                onDragEnd={() => setIsHeaderDragging(false)}
                slug={slugForDrafts}
                onDraftChange={() => {
                  draftVersionTrigger()
                }}
                containerRef={headerEditContainerRef}
                publicName={headerDisplayName}
                publicTagline={publicTagline}
                publicExtraText={publicHeaderExtraText}
                publicHeaderPrimaryCta={publicHeaderPrimaryCta}
                publicHeaderSecondaryCta={publicHeaderSecondaryCta}
                publicLogo={publicLogo}
                publicHeaderLogoVisible={publicHeaderLogoVisible}
                publicHeaderLogoShape={headerLogoDisplayShape}
                headerTitleStyle={headerTitleStyleForRender}
                headerSubtitleStyle={headerSubtitleStyleForRender}
                headerPrimaryCustom={headerPrimaryCustomForRender}
                headerSecondaryCustom={headerSecondaryCustomForRender}
                barberPrimaryColor={headerPrimaryColorForRender}
                barberSecondaryColor={headerSecondaryColorForRender}
                publicHeaderPrimaryCtaShape={publicHeaderPrimaryCtaShape}
                publicHeaderSecondaryCtaShape={publicHeaderSecondaryCtaShape}
                getPrimaryIconClass={getPrimaryIconClassForRender}
                onBookClick={() => bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                onMapClick={() => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                bookLabel={t('bookOnline')}
                mapLabel={t('whereToFindQuestion')}
                draftLocale={publicLang}
                persistDraft={massageHeroEditStorage?.persistDraft}
                heroLayoutStorage={
                  massagePreview && validMassageSlot
                    ? massageHeroLayoutStorageForDraggable
                    : massageHeroEditStorage?.heroLayoutStorage
                }
                hairTitleFontSizePx={isDraggableHeaderTheme ? hairTitleFontSizePx : undefined}
                constructorMobilePreview={constructorMobilePreview}
              />
            ) : (
            <div className="w-full text-center">
              {publicHeaderTheme === 'barber' || publicHeaderTheme === 'cosmetology' ? (
                <>
                  {publicLogo && publicHeaderLogoVisible && (
                    <div
                      className={cn(
                        'h-28 w-28 mx-auto mb-5 overflow-hidden border border-white/30 bg-white/10',
                        headerLogoDisplayShape === 'circle'
                          ? 'rounded-full'
                          : headerLogoDisplayShape === 'rounded'
                            ? 'rounded-xl'
                            : 'rounded-none'
                      )}
                    >
                      <img src={publicLogo} alt="Logo" className="h-full w-full object-cover" />
              </div>
                  )}
                  <h1
                    className={cn(
                      'w-full text-center font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-pre-wrap break-words overflow-visible max-w-[90%] mx-auto',
                      publicHeaderTheme === 'barber'
                        ? 'font-barber-title'
                        : publicHeaderTheme === 'cosmetology'
                          ? 'font-cosmetology-title'
                          : 'font-serif'
                    )}
                    style={{ ...headerTitleStyleForRender, fontSize: `${hairTitleFontSizePx}px` }}
                  >
                    {headerDisplayName}
                  </h1>
                  <p
                    className={cn(
                      'mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl text-white/80 text-center mx-auto block w-full',
                      'max-w-[min(100%,calc(100vw-1.5rem))] px-2 whitespace-pre-wrap break-words leading-[1.35]'
                    )}
                    style={headerSubtitleStyleForRender}
                  >
                    {publicTagline}
                  </p>
                </>
              ) : publicHeaderTheme === 'coloring' || publicHeaderTheme === 'manicure' ? (
                <>
                  {publicLogo && publicHeaderLogoVisible && (
                    <div
                      className={cn(
                        'h-28 w-28 mx-auto mb-5 overflow-hidden border border-white/30 bg-white/10',
                        headerLogoDisplayShape === 'circle'
                          ? 'rounded-full'
                          : headerLogoDisplayShape === 'rounded'
                            ? 'rounded-xl'
                            : 'rounded-none'
                      )}
                    >
                      <img src={publicLogo} alt="Logo" className="h-full w-full object-cover" />
                      </div>
                  )}
                  <h1
                      className={cn(
                      'w-full text-center font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-pre-wrap break-words overflow-visible max-w-[90%] mx-auto',
                      publicHeaderTheme === 'coloring'
                        ? 'font-coloring-title'
                        : publicHeaderTheme === 'manicure'
                          ? 'font-manicure-title'
                          : 'font-serif'
                    )}
                    style={{ ...headerTitleStyleForRender, fontSize: `${hairTitleFontSizePx}px` }}
                  >
                    {headerDisplayName}
                  </h1>
                  <p
                    className={cn(
                      'mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl text-white/80 text-center mx-auto block w-full',
                      'max-w-[min(100%,calc(100vw-1.5rem))] px-2 whitespace-pre-wrap break-words leading-[1.35]'
                    )}
                    style={headerSubtitleStyleForRender}
                  >
                    {publicTagline}
                  </p>
                </>
              ) : (
                <>
                  {publicHeaderTheme === 'custom' ? (
                    <div
                      className={cn(
                        'relative w-full',
                        publicHeaderLogoPlacement === 'left'
                          ? 'flex items-center justify-center gap-4'
                          : 'flex flex-col items-center',
                        ''
                      )}
                    >
                      {publicHeaderLogoPlacement !== 'corner' &&
                        publicHeaderLogoPlacement !== 'corner-left-title' &&
                        publicLogo &&
                        publicHeaderLogoVisible && (
                        <div
                          className={cn(
                            'h-32 w-32 overflow-hidden border border-white/30 bg-white/10',
                            headerLogoDisplayShape === 'circle'
                              ? 'rounded-full'
                              : headerLogoDisplayShape === 'rounded'
                                ? 'rounded-xl'
                                : 'rounded-none'
                          )}
                        >
                          <img src={publicLogo} alt="Logo" className="h-full w-full object-cover" />
                    </div>
                  )}
                      {publicHeaderLogoPlacement !== 'corner-left-title' && (
                        <h1
                          className={cn(
                            'text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-serif font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-pre-wrap break-words overflow-visible',
                            publicHeaderLogoPlacement === 'left'
                              ? 'text-left w-auto'
                              : 'text-center w-full'
                          )}
                          style={headerTitleStyleForRender}
                        >
                          {headerDisplayName}
                        </h1>
                      )}
                  </div>
                  ) : (
                    <>
                      {publicLogo && publicHeaderLogoVisible && (
                        <div
                          className={cn(
                            'h-28 w-28 mx-auto mb-5 overflow-hidden border border-white/30 bg-white/10',
                            headerLogoDisplayShape === 'circle'
                              ? 'rounded-full'
                              : headerLogoDisplayShape === 'rounded'
                                ? 'rounded-xl'
                                : 'rounded-none'
                          )}
                        >
                          <img src={publicLogo} alt="Logo" className="h-full w-full object-cover" />
                    </div>
                      )}
                      <h1
                        className={cn(
                          'w-full text-center font-serif font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] overflow-visible max-w-[90%] mx-auto whitespace-pre-wrap break-words',
                          isDraggableHeaderTheme && 'salon-hair-mobile-title'
                        )}
                        style={{ ...headerTitleStyleForRender, fontSize: `${hairTitleFontSizePx}px` }}
                      >
                        {headerDisplayName}
                      </h1>
                    </>
                  )}
                  <p
                        className={cn(
                      'mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl text-white/80 text-center mx-auto',
                      isDraggableHeaderTheme
                        ? 'salon-hair-hero-tagline block w-full max-w-[min(100%,calc(100vw-1.5rem))] px-2 whitespace-pre-wrap break-words leading-[1.35]'
                        : 'inline-block max-w-[min(100%,calc(100vw-1.5rem))] px-2 whitespace-pre-wrap break-words leading-[1.35]'
                    )}
                    style={headerSubtitleStyleForRender}
                  >
                    {publicTagline}
                  </p>
                </>
              )}
              {(isDraggableHeaderTheme || publicHeaderTheme === 'custom') && (
                <div
                        className={cn(
                    'flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-10',
                    'justify-center',
                    isDraggableHeaderTheme && 'salon-hair-cta-row'
                  )}
                >
                  <Button
                              className={cn(
                      publicHeaderPrimaryCtaShape === 'round' ? 'rounded-full' : 'rounded-none',
                      'h-14 sm:h-16 md:h-[4.5rem] px-8 sm:px-12 md:px-14 text-base sm:text-lg md:text-xl border backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] w-full sm:w-auto inline-flex items-center gap-2',
                      headerPrimaryCustomForRender ? '' : 'bg-primary/35 text-white border-primary/50 hover:bg-primary/45'
                    )}
                    style={
                      headerPrimaryCustomForRender
                        ? isHeaderGradient(headerPrimaryColorForRender.background)
                          ? {
                              background: headerPrimaryColorForRender.background,
                              color: headerPrimaryColorForRender.text,
                              boxShadow: headerUseGlow ? headerPrimaryColorForRender.glow : 'none',
                              borderColor:
                                'borderColor' in headerPrimaryColorForRender
                                  ? headerPrimaryColorForRender.borderColor
                                  : headerPrimaryColorForRender.background,
                            }
                          : {
                              backgroundColor: headerPrimaryColorForRender.background,
                              color: headerPrimaryColorForRender.text,
                              boxShadow: headerUseGlow ? headerPrimaryColorForRender.glow : 'none',
                              borderColor: headerPrimaryColorForRender.background,
                            }
                        : undefined
                    }
                    onClick={() => bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  >
                    <img
                      src={bookingIcon}
                      alt=""
                      className={cn(
                        'h-5 w-5 opacity-80 translate-y-[1px]',
                        getPrimaryIconClassForRender('brightness-0 invert')
                      )}
                    />
                    {publicHeaderPrimaryCta || t('bookOnline')}
                  </Button>
                    <Button
                      variant="outline"
                    className={cn(
                      publicHeaderSecondaryCtaShape === 'round' ? 'rounded-full' : 'rounded-none',
                      'h-14 sm:h-16 md:h-[4.5rem] px-8 sm:px-12 md:px-14 text-base sm:text-lg md:text-xl backdrop-blur-xl w-full sm:w-auto inline-flex items-center gap-2',
                      headerSecondaryCustomForRender ? '' : 'border-white/35 text-white bg-white/10 hover:bg-white/20'
                    )}
                    style={
                      headerSecondaryCustomForRender
                        ? isHeaderGradient(headerSecondaryColorForRender.background)
                          ? {
                              background: headerSecondaryColorForRender.background,
                              backgroundColor: 'transparent',
                              color: headerSecondaryColorForRender.text,
                              boxShadow: headerUseGlow ? headerSecondaryColorForRender.glow : 'none',
                              borderColor:
                                'borderColor' in headerSecondaryColorForRender
                                  ? headerSecondaryColorForRender.borderColor
                                  : headerSecondaryColorForRender.background,
                            }
                          : {
                              backgroundColor: headerSecondaryColorForRender.background,
                              color: headerSecondaryColorForRender.text,
                              boxShadow: headerUseGlow ? headerSecondaryColorForRender.glow : 'none',
                              borderColor: headerSecondaryColorForRender.background,
                            }
                        : undefined
                    }
                      onClick={() => {
                      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    <MapPin
                      className="h-8 w-8 translate-y-[1px]"
                      style={{
                        width: 28,
                        height: 28,
                        color: headerSecondaryCustomForRender
                          ? headerSecondaryColorForRender.text
                          : 'rgba(255,255,255,0.8)',
                      }}
                    />
                    {publicHeaderSecondaryCta || t('whereToFindQuestion')}
                    </Button>
                </div>
                  )}
            </div>
                  )}
                </div>
              </div>
      </header>
      <div className="h-20 sm:h-24 md:h-28 bg-gradient-to-b from-black/70 via-black/40 to-transparent" />

      <main
        className={cn(
          'w-full py-8 sm:py-10 md:py-12 pb-16 sm:pb-20 md:pb-12 space-y-8 sm:space-y-10',
          isDraggableHeaderTheme && 'salon-hair-main'
        )}
      >
        {sectionVisibility.gallery && (
          <section ref={gallerySectionRef} className="w-full px-3 sm:px-4 md:px-5 lg:px-6">
            <div className="w-full mb-3 sm:mb-4 md:mb-5 lg:mb-6">
              {(isPreview && isEditMode && typeof window !== 'undefined') ? (
                <input
                  type="text"
                  value={publicGalleryTitle}
                  onChange={(e) => {
                    const v = e.target.value
                    if (typeof window !== 'undefined') {
                      const prev = window.localStorage.getItem(`draft_publicGalleryTitle_${slugForDrafts}_${publicHeaderTheme}`) ?? window.localStorage.getItem('publicGalleryTitle') ?? ''
                      try {
                        window.parent?.postMessage?.({ type: 'constructorUndoPush', key: 'publicGalleryTitle', value: prev || null, themeId: publicHeaderTheme }, '*')
                      } catch { /* ignore */ }
                      window.localStorage.setItem(`draft_publicGalleryTitle_${slugForDrafts}_${publicHeaderTheme}`, v)
                      window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                      draftVersionTrigger()
                    }
                  }
                  }
                  className="w-full text-center text-xl sm:text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground bg-transparent border-b border-transparent hover:border-border/50 focus:border-primary focus:outline-none"
                  style={galleryTitleMergedStyle}
                  placeholder={t('salonPhotos')}
                />
              ) : (
                <h2
                  className="text-center text-xl sm:text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground"
                  style={galleryTitleMergedStyle}
                >
                  {publicGalleryTitle}
                </h2>
              )}
                </div>
            <div className="w-full grid grid-cols-[1.4fr_1fr_1fr] grid-rows-2 gap-3 sm:gap-4 md:gap-5 lg:gap-6 h-[60vh] min-h-[400px] sm:h-[65vh] sm:min-h-[440px] md:h-[70vh] md:min-h-[500px] lg:h-[75vh] lg:min-h-[560px] xl:h-[80vh] xl:min-h-[600px]">
              {[
                { index: 0, className: 'row-span-2 col-span-1' },
                { index: 1, className: '' },
                { index: 2, className: '' },
                { index: 3, className: '' },
                { index: 4, className: '' },
              ].map((slot) => {
                const idx = slot.index + 1
                const key = `publicWorks${idx}`
                const image = worksImages[slot.index]
                const displayImage = worksDisplayImages[slot.index]
                const canEdit = isPreview && isEditMode && typeof window !== 'undefined'
                const hasUserImage = Boolean(image)
                const removePhoto = () => {
                  if (typeof window === 'undefined') return
                  const previousValue =
                    window.localStorage.getItem(`draft_${key}_${slugForDrafts}_${publicHeaderTheme}`) ??
                    window.localStorage.getItem(key) ??
                    ''
                  const wasUserImage = Boolean(image)
                  if (wasUserImage) {
                    window.localStorage.removeItem(`draft_${key}_${slugForDrafts}_${publicHeaderTheme}`)
                  } else {
                    window.localStorage.setItem(`draft_${key}_${slugForDrafts}_${publicHeaderTheme}`, '__empty__')
                  }
                  window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                  try {
                    window.parent?.postMessage?.({ type: 'constructorEditsChanged' }, '*')
                    window.parent?.postMessage?.(
                      { type: 'constructorUndoPush', key, value: wasUserImage ? previousValue || null : null, themeId: publicHeaderTheme },
                      '*'
                    )
                  } catch {
                    /* ignore */
                  }
                  flushSync(() => draftVersionTrigger())
                }
                return (
                  <div
                    key={`public-salon-photos-${slot.index}`}
                        className={cn(
                      'relative min-h-0 min-w-0',
                      canEdit ? 'overflow-visible' : 'overflow-hidden',
                      canEdit && !displayImage && 'border-2 border-dashed border-white/50 bg-black/20',
                      !canEdit && 'bg-card/20 overflow-hidden',
                      slot.className
                    )}
                  >
                    {!canEdit && (
                      <>
                        {displayImage && (
                          <img
                            src={displayImage}
                            alt={`${t('galleryImageAlt')} ${slot.index + 1}`}
                            className="absolute inset-0 h-full w-full object-cover"
                          />
                        )}
                      </>
                    )}
                    {canEdit && displayImage && (
                      <div className="absolute inset-0 z-10 overflow-hidden">
                        <img
                          src={displayImage}
                          alt=""
                          className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                        />
                        <button
                          type="button"
                          onPointerDown={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removePhoto()
                          }}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            removePhoto()
                          }}
                          className="absolute top-3 right-3 z-30 h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 shadow-lg border-2 border-white/30 transition cursor-pointer"
                          aria-label={t('deletePhoto')}
                        >
                          <X className="h-5 w-5 sm:h-6 sm:w-6 stroke-[2.5]" />
                        </button>
                    </div>
                    )}
                    {canEdit && !displayImage ? (
                      <>
                        <input
                          id={`public-salon-photo-${idx}`}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => {
                              const result = reader.result as string
                              if (result && typeof window !== 'undefined') {
                                const prev = window.localStorage.getItem(`draft_${key}_${slugForDrafts}_${publicHeaderTheme}`) ?? window.localStorage.getItem(key) ?? ''
                                try {
                                  window.parent?.postMessage?.({ type: 'constructorUndoPush', key, value: prev || null, themeId: publicHeaderTheme }, '*')
                                } catch { /* ignore */ }
                                window.localStorage.setItem(`draft_${key}_${slugForDrafts}_${publicHeaderTheme}`, result)
                                window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                                draftVersionTrigger()
                              }
                            }
                            reader.readAsDataURL(file)
                            e.target.value = ''
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById(`public-salon-photo-${idx}`)?.click()}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/90 hover:bg-black/20 transition cursor-pointer z-10"
                        >
                          <span className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-dashed border-white/60">
                            <Plus className="h-8 w-8 sm:h-10 sm:w-10" />
                  </span>
                        </button>
                      </>
                    ) : null}
                </div>
                )
              })}
              </div>
          </section>
        )}

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        <section ref={bookingSectionRef} className="text-center max-w-3xl mx-auto space-y-2 sm:space-y-3">
          {(isPreview && isEditMode && typeof window !== 'undefined') ? (
            <>
              <input
                type="text"
                value={publicBookingTitle}
                onChange={(e) => {
                  const v = e.target.value
                  if (typeof window !== 'undefined') {
                    const prev = window.localStorage.getItem(`draft_publicBookingTitle_${slugForDrafts}_${publicHeaderTheme}`) ?? window.localStorage.getItem('publicBookingTitle') ?? ''
                    try {
                      window.parent?.postMessage?.({ type: 'constructorUndoPush', key: 'publicBookingTitle', value: prev || null, themeId: publicHeaderTheme }, '*')
                    } catch { /* ignore */ }
                    window.localStorage.setItem(`draft_publicBookingTitle_${slugForDrafts}_${publicHeaderTheme}`, v)
                    window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                    draftVersionTrigger()
                  }
                }}
                className="w-full text-center text-2xl sm:text-3xl md:text-4xl font-display font-semibold tracking-tight text-foreground bg-transparent rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:border-primary px-3 py-2"
                style={bookingTitleMergedStyle}
                placeholder={t('bookingTitle')}
              />
              <textarea
                value={publicBookingSubtitle}
                onChange={(e) => {
                  const v = e.target.value
                  if (typeof window !== 'undefined') {
                    const prev = window.localStorage.getItem(`draft_publicBookingSubtitle_${slugForDrafts}_${publicHeaderTheme}`) ?? window.localStorage.getItem('publicBookingSubtitle') ?? ''
                    try {
                      window.parent?.postMessage?.({ type: 'constructorUndoPush', key: 'publicBookingSubtitle', value: prev || null, themeId: publicHeaderTheme }, '*')
                    } catch { /* ignore */ }
                    window.localStorage.setItem(`draft_publicBookingSubtitle_${slugForDrafts}_${publicHeaderTheme}`, v)
                    window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                    draftVersionTrigger()
                  }
                }}
                rows={2}
                className="w-full text-center text-xs sm:text-sm md:text-base text-muted-foreground bg-transparent rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:border-primary resize-none placeholder:text-muted-foreground px-3 py-2"
                style={bookingSubtitleMergedStyle}
                placeholder={t('bookingSubtitle')}
              />
            </>
          ) : (
            <>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold tracking-tight text-foreground"
                style={bookingTitleMergedStyle}
              >
                {publicBookingTitle || t('bookingTitle')}
              </h2>
              <p
                className="text-xs sm:text-sm md:text-base text-muted-foreground"
                style={bookingSubtitleMergedStyle}
              >
                {publicBookingSubtitle || t('bookingSubtitle')}
              </p>
            </>
          )}
        </section>

        <PublicBookingFormSection
          t={t}
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          activeServices={activeServices}
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          setSelectedStaffId={setSelectedStaffId}
          setSelectedTime={setSelectedTime}
          selectedStaffId={selectedStaffId}
          selectedTime={selectedTime}
          availableStaff={availableStaff}
          slots={slots}
          busySlots={busySlots}
          setCalendarDate={setCalendarDate}
          setIsDatePickerOpen={setIsDatePickerOpen}
          selectedDate={selectedDate}
          formatDisplayDate={formatDisplayDate}
          setSelectedDate={setSelectedDate}
          clientName={clientName}
          setClientName={setClientName}
          clientPhone={clientPhone}
          setClientPhone={setClientPhone}
          clientEmail={clientEmail}
          setClientEmail={setClientEmail}
          clientComment={clientComment}
          setClientComment={setClientComment}
          clientSocialMethod={clientSocialMethod}
          setClientSocialMethod={setClientSocialMethod}
          isSocialOpen={isSocialOpen}
          setIsSocialOpen={setIsSocialOpen}
          socialOptions={socialOptions}
          clientSocialHandle={clientSocialHandle}
          setClientSocialHandle={setClientSocialHandle}
          canProceed={canProceed}
          handleSubmit={handleSubmit}
          summaryItems={summaryItems}
          selectedService={selectedService}
          isMobile={isMobile}
          socialRef={socialRef}
        />

        {galleryPreview.length > 0 && sectionVisibility.works && (
          <section ref={worksSectionRef} className="flex justify-center">
            <div className="w-full max-w-6xl">
              <h2
                className="text-center text-2xl sm:text-3xl font-display font-semibold tracking-tight text-foreground mb-4 sm:mb-5"
                style={worksGalleryTitleMergedStyle}
              >
                {t('worksGallery')}
              </h2>
              <div
                style={{
                  height: '600px',
                  position: 'relative',
                  width: '100vw',
                  marginLeft: 'calc(50% - 50vw)'
                }}
              >
                <CircularGallery
                  items={circularItems}
                  bend={1}
                  textColor={
                    massageSectionPaletteOn ? massageM('svcCardTitle') : '#ffffff'
                  }
                  borderRadius={0.05}
                  scrollSpeed={2}
                  scrollEase={0.05}
                  onItemClick={(image) => setActiveGalleryImage(image)}
                />
              </div>
          </div>
        </section>
        )}

        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">
        {canUseDOM && mobileBar ? createPortal(mobileBar, document.body) : null}

        {datePickerModal}

        {canUseDOM && activeGalleryImage
          ? createPortal(
              <div
                className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                onClick={() => setActiveGalleryImage(null)}
              >
                <div className="relative max-w-5xl w-full">
                  <img
                    src={activeGalleryImage}
                    alt={t('galleryImageAlt')}
                    className="w-full max-h-[85vh] object-contain rounded-2xl border border-border/40 bg-black/40"
                  />
                  <button
                    type="button"
                    onClick={() => setActiveGalleryImage(null)}
                    className="absolute top-3 right-3 h-9 w-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                    aria-label={t('closeModal')}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>,
              document.body
            )
          : null}

        {canUseDOM && successOverlay ? createPortal(successOverlay, document.body) : null}

        <div className="h-6 md:h-10" />
        {sectionVisibility.map && (
        <section ref={mapSectionRef} className="w-full space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p
                className="text-xs uppercase tracking-[0.3em] text-muted-foreground"
                style={mapLocationLabelMergedStyle}
              >
                {t('locationLabel')}
              </p>
              <h3 className="text-lg font-semibold text-foreground" style={mapWhereHeadingMergedStyle}>
                {t('whereToFind')}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => window.open(googleOpenUrl, '_blank', 'noopener,noreferrer')}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-foreground text-background text-xs sm:text-sm font-semibold shadow-lg hover:bg-foreground/90"
            >
              {t('openInMaps')}
            </button>
          </div>
          <div className="relative h-[18rem] sm:h-[30rem] rounded-lg sm:rounded-[28px] border border-border/60 bg-card/30 overflow-hidden shadow-2xl shadow-black/10">
            <div className="absolute inset-0 bg-gradient-to-br from-background/10 via-transparent to-background/20 pointer-events-none" />
            <iframe
              title="Google Maps"
              src={googleMapUrl}
              className="h-full w-full"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </section>
        )}

        </div>
      </main>
      </div>
      <footer ref={footerSectionRef} className={cn('w-full', isDraggableHeaderTheme && 'salon-hair-footer-root')}>
        <div className="w-full bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b] to-[#111111] shadow-[0_-30px_70px_rgba(0,0,0,0.5)]">
          <div className="w-full px-6 sm:px-10 lg:px-16 pt-12 pb-24 salon-hair-footer-inner">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 -mt-4">
            <div className="flex items-center gap-5">
                {publicFooterLogoVisible && (
                  publicLogo ? (
                <div
                  className={cn(
                    'h-20 w-20 overflow-hidden border border-border/40 bg-background/60 shadow-inner',
                        footerLogoDisplayShape === 'circle'
                          ? 'rounded-full'
                          : footerLogoDisplayShape === 'rounded'
                            ? 'rounded-xl'
                            : 'rounded-none'
                  )}
                >
                  <img src={publicLogo} alt="Logo" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div
                  className={cn(
                    'h-20 w-20 border border-border/40 bg-background/60',
                        footerLogoDisplayShape === 'circle'
                          ? 'rounded-full'
                          : footerLogoDisplayShape === 'rounded'
                            ? 'rounded-xl'
                            : 'rounded-none'
                      )}
                    />
                  )
                )}
                <div className="min-w-0 flex-1">
                  {(isPreview && isEditMode && typeof window !== 'undefined') ? (
                    <input
                      type="text"
                      value={footerDisplayName}
                      onChange={(e) => {
                        const v = e.target.value
                        if (typeof window !== 'undefined') {
                          const footerDraftKey = `draft_publicFooterName_${slugForDrafts}_${publicHeaderTheme}`
                          const prev =
                            window.localStorage.getItem(footerDraftKey) ??
                            window.localStorage.getItem('publicFooterName') ??
                            window.localStorage.getItem('publicName') ??
                            ''
                          try {
                            window.parent?.postMessage?.(
                              { type: 'constructorUndoPush', key: 'publicFooterName', value: prev || null, themeId: publicHeaderTheme },
                              '*'
                            )
                          } catch { /* ignore */ }
                          window.localStorage.setItem(footerDraftKey, v)
                          try {
                            window.localStorage.setItem('publicFooterName', v)
                          } catch {
                            /* ignore */
                          }
                          window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                          draftVersionTrigger()
                        }
                      }}
                      className={cn(
                        'w-full min-w-0 text-3xl md:text-4xl font-display font-semibold text-foreground bg-transparent border-b border-transparent hover:border-border/50 focus:border-primary focus:outline-none focus:ring-0',
                        isDraggableHeaderTheme && 'salon-hair-footer-name-input'
                      )}
                      placeholder={FOOTER_DEFAULT_NAME}
                      style={{
                        minWidth: `${Math.min(40, Math.max(16, (footerDisplayName?.length || 0) + 2))}ch`,
                        ...massageFooterBlockTitleStyle,
                      }}
                    />
                  ) : (
                    <p
                      className={cn(
                        'text-3xl md:text-4xl font-display font-semibold text-foreground',
                        isDraggableHeaderTheme
                          ? 'salon-hair-footer-name max-w-full whitespace-pre-wrap break-words'
                          : 'max-w-[420px] overflow-hidden whitespace-nowrap'
                      )}
                      style={massageFooterBlockTitleStyle}
                    >
                      {footerDisplayName}
                    </p>
                  )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4 w-full justify-center sm:justify-end mt-2 sm:mt-0">
              {[
                {
                    key: 'telegram',
                  label: 'Telegram',
                  value: publicTelegram,
                  className:
                    'bg-gradient-to-r from-[#1FA2FF]/90 via-[#12D8FA]/80 to-[#1FA2FF]/90 text-white hover:brightness-110 border border-white/25',
                  icon: TelegramIcon,
                },
                {
                    key: 'viber',
                  label: 'Viber',
                  value: publicViber,
                  className:
                    'bg-gradient-to-r from-[#7F00FF]/90 to-[#E100FF]/85 text-white hover:brightness-110 border border-white/25',
                  icon: ViberIcon,
                },
                {
                    key: 'instagram',
                  label: 'Instagram',
                  value: publicInstagram,
                  className:
                    'bg-gradient-to-r from-[#F58529]/90 via-[#DD2A7B]/85 to-[#515BD4]/90 text-white hover:brightness-110 border border-white/25',
                  icon: Instagram,
                },
                  {
                    key: 'facebook',
                    label: 'Facebook',
                    value: publicFacebook,
                    className:
                      'bg-gradient-to-r from-[#1877F2]/90 to-[#0C5DC7]/90 text-white hover:brightness-110 border border-white/25',
                    icon: FacebookIcon,
                  },
                  {
                    key: 'whatsapp',
                    label: 'WhatsApp',
                    value: publicWhatsapp,
                    className:
                      'bg-gradient-to-r from-[#25D366]/90 to-[#128C7E]/90 text-white hover:brightness-110 border border-white/25',
                    icon: WhatsAppIcon,
                  },
                  {
                    key: 'twitter',
                    label: '',
                    value: publicTwitter,
                    className:
                      'bg-[#000000] text-white hover:brightness-110 border border-white/25',
                    icon: TwitterIcon,
                    iconClass: 'h-6 w-6',
                  },
                  {
                    key: 'tiktok',
                    label: 'TikTok',
                    value: publicTiktok,
                    className:
                      'bg-[#010101] text-white hover:brightness-110 border border-white/25',
                    icon: TikTokIcon,
                  },
                ]
                  .filter(({ key, value }) => Boolean(value) && socialVisibility[key as keyof typeof socialVisibility])
                  .map(({ key, label, value, className, icon: Icon, iconClass }: any) => {
                    const canEditFooter = isPreview && isEditMode && typeof window !== 'undefined'
                    return (
                      <div key={label} className="relative">
                        {canEditFooter && (
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window === 'undefined') return
                              const storageKey =
                                key === 'telegram' ? 'publicTelegram'
                                  : key === 'viber' ? 'publicViber'
                                  : key === 'instagram' ? 'publicInstagram'
                                  : key === 'facebook' ? 'publicFacebook'
                                  : key === 'whatsapp' ? 'publicWhatsapp'
                                  : key === 'twitter' ? 'publicTwitter'
                                  : 'publicTiktok'
                              const previousValue = window.localStorage.getItem(`draft_${storageKey}_${slugForDrafts}_${publicHeaderTheme}`) ?? window.localStorage.getItem(storageKey) ?? ''
                              window.localStorage.setItem(`draft_${storageKey}_${slugForDrafts}_${publicHeaderTheme}`, '')
                              window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                              draftVersionTrigger()
                              try {
                                window.parent?.postMessage?.({ type: 'constructorUndoPush', key: storageKey, value: previousValue || null, themeId: publicHeaderTheme }, '*')
                              } catch {
                                // ignore
                              }
                            }}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-black/80 flex items-center justify-center z-10"
                            aria-label={t('hideSocial')}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                        <a
                    href={value}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      'h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md',
                      className
                    )}
                  >
                          <Icon className={iconClass || "h-5 w-5"} />
                          {label || null}
                  </a>
                      </div>
                    )
                  })}
            </div>
          </div>

          <div className="mt-20 salon-hair-footer-contacts-wrap">
              <div
                key={`salon-footer-contact-${publicLang}`}
                className="salon-footer-contact-row flex flex-nowrap items-start justify-between gap-3 sm:gap-4 md:gap-6 text-center"
              >
                {(
                  [
                    footerVisibility.address && {
                      id: 'address' as const,
                      label:
                        useTranslatedFooterColumnLabels
                          ? massagePreview && validMassageSlot
                            ? uiText[publicLang].addrLabel
                            : t('addressLabel')
                          : massagePreview && validMassageSlot
                            ? uiText[publicLang].addrLabel
                            : footerLabels?.address?.trim()
                              ? footerLabels.address
                              : t('addressLabel'),
                      value:
                        isPreview && isEditMode
                          ? footerDisplayAddress
                          : footerDisplayAddress || t('addressFallback'),
                      extra: null as string | null,
                      draftKey: 'publicFooterAddress' as const,
                      extraDraftKey: null as string | null,
                    },
                    footerVisibility.schedule && {
                      id: 'schedule' as const,
                      label:
                        useTranslatedFooterColumnLabels
                          ? massagePreview && validMassageSlot
                            ? uiText[publicLang].schedLabel
                            : t('scheduleLabel')
                          : massagePreview && validMassageSlot
                            ? uiText[publicLang].schedLabel
                            : footerLabels?.schedule?.trim()
                              ? footerLabels.schedule
                              : t('scheduleLabel'),
                      value: footerDisplayHours,
                      extra: footerVisibility.dayOff ? footerDisplayDayOff : null,
                      draftKey: 'publicHours' as const,
                      extraDraftKey: footerVisibility.dayOff ? 'publicDayOff' : null,
                    },
                    footerVisibility.phone && {
                      id: 'phone' as const,
                      label:
                        useTranslatedFooterColumnLabels
                          ? massagePreview && validMassageSlot
                            ? uiText[publicLang].phoneLabel2
                            : t('phoneLabel')
                          : massagePreview && validMassageSlot
                            ? uiText[publicLang].phoneLabel2
                            : footerLabels?.phone?.trim()
                              ? footerLabels.phone
                              : t('phoneLabel'),
                      value: footerDisplayPhone,
                      extra: null as string | null,
                      draftKey: 'publicPhone' as const,
                      extraDraftKey: null as string | null,
                    },
                    footerVisibility.email && {
                      id: 'email' as const,
                      label:
                        useTranslatedFooterColumnLabels
                          ? massagePreview && validMassageSlot
                            ? uiText[publicLang].emailLabel2
                            : t('emailLabel')
                          : massagePreview && validMassageSlot
                            ? uiText[publicLang].emailLabel2
                            : footerLabels?.email?.trim()
                              ? footerLabels.email
                              : t('emailLabel'),
                      value: footerDisplayEmail,
                      extra: null as string | null,
                      draftKey: 'publicEmail' as const,
                      extraDraftKey: null as string | null,
                    },
                  ].filter(Boolean) as FooterContactItem[]
                ).map((item, index, arr) => {
                    const canEditFooter = isPreview && isEditMode && typeof window !== 'undefined'
                    return (
                      <div key={`${item.label}-${index}`} className="flex flex-1 min-w-0 items-center justify-center">
                        <div className="relative flex flex-col items-center gap-2 w-full min-w-0">
                          {canEditFooter && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (typeof window === 'undefined') return
                                try {
                                  const stored =
                                    window.localStorage.getItem(`draft_publicFooterVisibility_${slugForDrafts}_${publicHeaderTheme}`) ??
                                    window.localStorage.getItem('publicFooterVisibility')
                                  const previousValue = stored ?? null
                                  const next: {
                                    address: boolean
                                    schedule: boolean
                                    dayOff: boolean
                                    phone: boolean
                                    email: boolean
                                  } = {
                                    address: footerVisibility.address,
                                    schedule: footerVisibility.schedule,
                                    dayOff: footerVisibility.dayOff,
                                    phone: footerVisibility.phone,
                                    email: footerVisibility.email,
                                  }
                                  next[item.id] = false
                                  if (item.id === 'schedule') next.dayOff = false
                                  window.localStorage.setItem(`draft_publicFooterVisibility_${slugForDrafts}_${publicHeaderTheme}`, JSON.stringify(next))
                                  window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                                  draftVersionTrigger()
                                  try {
                                    window.parent?.postMessage?.({ type: 'constructorUndoPush', key: 'publicFooterVisibility', value: previousValue, themeId: publicHeaderTheme }, '*')
                                  } catch {
                                    // ignore
                                  }
                                } catch {
                                  // ignore
                                }
                              }}
                              className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-black/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-black/80 flex items-center justify-center z-10 cursor-pointer"
                              aria-label={t('hideBlock')}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                <p
                            className="text-xs uppercase tracking-[0.3em] text-muted-foreground min-h-[18px]"
                            style={massageFooterContactLabelStyle}
                          >
                            {item.label}
                          </p>
                          {canEditFooter ? (
                            <>
                              <input
                                type="text"
                                value={item.value}
                                onChange={(e) => {
                                  const v = e.target.value
                                  const toStore = serializeFooterFieldForStorage(v)
                                  if (typeof window !== 'undefined') {
                                    const themeForDraft =
                                      item.draftKey === 'publicFooterAddress'
                                        ? publicHeaderThemeRaw
                                        : publicHeaderTheme
                                    const prev =
                                      window.localStorage.getItem(
                                        `draft_${item.draftKey}_${slugForDrafts}_${themeForDraft}`,
                                      ) ?? window.localStorage.getItem(item.draftKey) ?? ''
                                    try {
                                      window.parent?.postMessage?.({
                                        type: 'constructorUndoPush',
                                        key: item.draftKey,
                                        value: prev || null,
                                        themeId: themeForDraft,
                                      }, '*')
                                    } catch { /* ignore */ }
                                    window.localStorage.setItem(
                                      `draft_${item.draftKey}_${slugForDrafts}_${themeForDraft}`,
                                      toStore,
                                    )
                                    if (item.draftKey === 'publicFooterAddress') {
                                      const addrKey = `draft_publicAddress_${slugForDrafts}_${publicHeaderThemeRaw}`
                                      const prevAddr =
                                        window.localStorage.getItem(addrKey) ??
                                        window.localStorage.getItem('publicAddress') ??
                                        ''
                                      try {
                                        window.parent?.postMessage?.({
                                          type: 'constructorUndoPush',
                                          key: 'publicAddress',
                                          value: prevAddr || null,
                                          themeId: publicHeaderThemeRaw,
                                        }, '*')
                                      } catch { /* ignore */ }
                                      window.localStorage.setItem(addrKey, toStore)
                                      try {
                                        window.localStorage.setItem('publicFooterAddress', toStore)
                                        window.localStorage.setItem('publicAddress', toStore)
                                      } catch {
                                        /* ignore */
                                      }
                                    }
                                    syncSalonFooterFieldToMassageSlot(item.draftKey, toStore)
                                    if (item.draftKey === 'publicFooterAddress') {
                                      syncSalonFooterFieldToMassageSlot('publicAddress', toStore)
                                    }
                                    window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                                    draftVersionTrigger()
                                  }
                                }}
                                className="w-full min-w-0 text-foreground text-lg md:text-xl font-semibold leading-relaxed bg-transparent border-b border-transparent hover:border-border/50 focus:border-primary focus:outline-none focus:ring-0 text-center"
                                style={massageFooterContactBodyStyle}
                              />
                              {item.extra != null && item.extraDraftKey && (
                                <input
                                  type="text"
                                  value={item.extra}
                                  onChange={(e) => {
                                    const v = e.target.value
                                    const toStore = serializeFooterFieldForStorage(v)
                                    if (typeof window !== 'undefined') {
                                      const prev = window.localStorage.getItem(`draft_${item.extraDraftKey}_${slugForDrafts}_${publicHeaderTheme}`) ?? window.localStorage.getItem(item.extraDraftKey) ?? ''
                                      try {
                                        window.parent?.postMessage?.({ type: 'constructorUndoPush', key: item.extraDraftKey, value: prev || null, themeId: publicHeaderTheme }, '*')
                                      } catch { /* ignore */ }
                                      window.localStorage.setItem(`draft_${item.extraDraftKey}_${slugForDrafts}_${publicHeaderTheme}`, toStore)
                                      syncSalonFooterFieldToMassageSlot(item.extraDraftKey, toStore)
                                      window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                                      draftVersionTrigger()
                                    }
                                  }}
                                  className={cn(
                                    'w-full min-w-0 text-sm md:text-base bg-transparent border-b border-transparent hover:border-border/50 focus:border-primary focus:outline-none focus:ring-0 text-center',
                                    massageSectionPaletteOn ? '' : 'text-red-500'
                                  )}
                                  style={massageSectionPaletteOn ? massageFooterContactLabelStyle : undefined}
                                />
                              )}
                            </>
                          ) : (
                            <>
                              <p
                                className="text-foreground text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate"
                                style={massageFooterContactBodyStyle}
                              >
                                {item.value}
                              </p>
                              {item.extra && (
                                <p
                                  className={cn(
                                    'text-sm md:text-base min-w-0 truncate',
                                    massageSectionPaletteOn ? '' : 'text-red-500'
                                  )}
                                  style={massageSectionPaletteOn ? massageFooterContactLabelStyle : undefined}
                                >
                                  {item.extra}
                                </p>
                              )}
                            </>
                          )}
              </div>
                        {index < arr.length - 1 && (
                          <div
                            className={cn(
                              'hidden sm:block h-10 w-px shrink-0 mx-2 md:mx-4',
                              !massageSectionPaletteOn && 'bg-primary/30'
                            )}
                            style={massageFooterColumnRuleStyle}
                          />
                        )}
              </div>
                    )
                  })}
            </div>
          </div>
          </div>
        </div>
      </footer>
      {!hidePreviewChrome && showPublicLangSwitcher && (
        <>
      <div
        className={cn(
          "fixed top-4 left-4 z-50 sm:hidden transition-opacity duration-300",
          isLangVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="h-10 w-10 rounded-full bg-background/80 text-foreground border border-border/40 shadow-lg backdrop-blur-md flex items-center justify-center hover:bg-background/90 transition"
            aria-label={t('language')}
          >
            <img
              src={publicLang === 'ru' ? flagRu : publicLang === 'en' ? flagEn : flagRo}
              alt={publicLang === 'ru' ? 'Русский' : publicLang === 'en' ? 'English' : 'Română'}
              className="h-5 w-5 rounded-full"
            />
          </button>
          {isLangOpen && (
            <div className="absolute left-full top-0 ml-2 flex items-center gap-2">
              {[
                { code: 'ru' as const, icon: flagRu, label: 'Русский' },
                { code: 'en' as const, icon: flagEn, label: 'English' },
                { code: 'ro' as const, icon: flagRo, label: 'Română' },
              ]
                .filter((item) => item.code !== publicLang && langsForPublicSwitcher.includes(item.code))
                .map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLang(item.code)}
                    className="h-10 w-10 rounded-full border border-border/40 bg-background/80 hover:bg-background/90 shadow-lg backdrop-blur-md flex items-center justify-center transition"
                    aria-label={item.label}
                  >
                    <img src={item.icon} alt={item.label} className="h-5 w-5 rounded-full" />
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
      <div className="fixed bottom-6 left-6 z-50 hidden sm:block">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsLangOpen((prev) => !prev)}
            className="h-11 w-11 rounded-full bg-background/80 text-foreground border border-border/40 shadow-lg backdrop-blur-md flex items-center justify-center hover:bg-background/90 transition"
            aria-label={t('language')}
          >
            <img
              src={publicLang === 'ru' ? flagRu : publicLang === 'en' ? flagEn : flagRo}
              alt={publicLang === 'ru' ? 'Русский' : publicLang === 'en' ? 'English' : 'Română'}
              className="h-6 w-6 rounded-full"
            />
          </button>
          {isLangOpen && (
            <div className="absolute bottom-full left-0 mb-3 flex flex-col gap-2">
              {[
                { code: 'ru' as const, icon: flagRu, label: 'Русский' },
                { code: 'en' as const, icon: flagEn, label: 'English' },
                { code: 'ro' as const, icon: flagRo, label: 'Română' },
              ]
                .filter((item) => item.code !== publicLang && langsForPublicSwitcher.includes(item.code))
                .map((item) => (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => setLang(item.code)}
                    className="h-11 w-11 rounded-full border border-border/40 bg-background/80 hover:bg-background/90 shadow-lg backdrop-blur-md flex items-center justify-center transition"
                    aria-label={item.label}
                  >
                    <img src={item.icon} alt={item.label} className="h-6 w-6 rounded-full" />
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
        </>
      )}
      {showGoToConstructor && (
        <div
          className={cn(
            'fixed z-[10050]',
            isMobile
              ? 'left-0 right-0 top-0 flex justify-center border-b border-border/40 bg-background/95 px-3 py-2.5 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/85 pt-[max(0.5rem,env(safe-area-inset-top))]'
              : 'bottom-6 right-6'
          )}
        >
          <Link
            to="/constructor"
            className={cn(
              'inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90',
              isMobile ? 'w-full max-w-md text-sm' : 'text-base sm:py-3'
            )}
          >
            {t('goToConstructor')}
          </Link>
        </div>
      )}
    </div>
  )
}
