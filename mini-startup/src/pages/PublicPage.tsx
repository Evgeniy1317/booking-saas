import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Lottie from 'lottie-react'
import { useLocation, useParams, Link } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, X, Instagram, MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import heroImage from '@/assets/images/barber-wallpaper-black-marble-background.jpg'
import cosmetologyHeaderBg from '@/assets/images/constructor-images/загруженное.png'
import coloringHeaderBg from '@/assets/images/constructor-images/загруженное (1).png'
import manicureHeaderBg from '@/assets/images/constructor-images/806534aa6d64e65ec11617c1c8df8f8c.jpg'
import barberHeaderBg from '@/assets/images/constructor-images/загруженное (2).jpg'
import worksDefault1 from '@/assets/images/constructor-images/998b104a5c45e39378ead8e9c3414675.jpg'
import worksDefault2 from '@/assets/images/constructor-images/orig (2).jpg'
import worksDefault3 from '@/assets/images/constructor-images/caa5a2c48f545f5610765afae36e9568.jpg'
import worksDefault4 from '@/assets/images/constructor-images/360_F_834954163_kERlfdHRLDAJpTGw4LYaGVhvsUH8sXd4.jpg'
import worksDefault5 from '@/assets/images/constructor-images/istockphoto-1856117770-170667a.jpg'
import worksCarousel1 from '@/assets/images/constructor-images/c612ebeea6a9ada45aba6c8d7c5db8e9.jpeg'
import worksCarousel2 from '@/assets/images/constructor-images/ew_HairSociety_Eclat_7-1000x1000.jpg'
import worksCarousel3 from '@/assets/images/constructor-images/1704.jpg'
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
import {
  HAIR_THEME_DEFAULT_NAME,
  HAIR_THEME_DEFAULT_TAGLINE,
  HAIR_THEME_DEFAULT_BOOKING_TITLE,
  HAIR_THEME_DEFAULT_BOOKING_SUBTITLE,
  DEFAULT_LOGO_URL,
  FOOTER_DEFAULT_NAME,
  FOOTER_DEFAULT_ADDRESS,
  FOOTER_DEFAULT_HOURS,
  FOOTER_DEFAULT_DAY_OFF,
  FOOTER_DEFAULT_PHONE,
  FOOTER_DEFAULT_EMAIL,
} from '@/lib/hair-theme-defaults'

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

const fallbackServices: PublicService[] = [
  { id: '1', category: 'Парикмахерская', name: 'Женская стрижка', duration: 60, price: 450, active: true },
  { id: '2', category: 'Маникюр', name: 'Классический маникюр', duration: 60, price: 400, active: true },
  { id: '3', category: 'Косметология', name: 'Уход за лицом', duration: 90, price: 800, active: true },
]

const fallbackStaff: PublicStaff[] = [
  {
    id: '1',
    name: 'Анна Петреску',
    category: 'Стилист',
    description: 'Мягкие техники окрашивания и уход',
    color: '#3b82f6',
    services: ['Женская стрижка', 'Уход за лицом'],
    workingDays: ['Понедельник', 'Среда', 'Пятница', 'Суббота'],
    workingHours: { start: '10:00', end: '18:00' },
    active: true,
  },
  {
    id: '2',
    name: 'Елена Бондарь',
    category: 'Мастер маникюра',
    description: 'Комбинированный маникюр и дизайн',
    color: '#ec4899',
    services: ['Классический маникюр'],
    workingDays: ['Вторник', 'Четверг', 'Суббота'],
    workingHours: { start: '09:00', end: '17:00' },
    active: true,
  },
]

const loadServices = (): PublicService[] => {
  try {
    const stored = localStorage.getItem('services')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Ошибка загрузки услуг:', e)
  }
  return fallbackServices
}

const loadStaff = (): PublicStaff[] => {
  try {
    const stored = localStorage.getItem('staff')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Ошибка загрузки мастеров:', e)
  }
  return fallbackStaff
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
    console.error('Ошибка загрузки записей:', e)
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

type PublicLang = 'ru' | 'en' | 'ro'

const localeByLang: Record<PublicLang, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  ro: 'ro-RO',
}

const uiText = {
  ru: {
    addSalonPhoto: 'Добавьте фото салона',
    defaultSalonName: 'Салон Орхидея',
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
  },
  ro: {
    addSalonPhoto: 'Adăugați o fotografie a salonului',
    defaultSalonName: 'Salon de frumusețe',
    defaultTagline: 'Programare online la o oră convenabilă cu confirmare',
    bookOnline: 'Programează online',
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
  },
} as const

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

function PublicPage() {
  useParams<{ slug: string }>()
  const [publicLang, setPublicLang] = useState<PublicLang>(() => {
    const stored = localStorage.getItem('publicLang') as PublicLang | null
    if (stored === 'ru' || stored === 'en' || stored === 'ro') {
      return stored
    }
    const browser = navigator.language?.toLowerCase() || ''
    if (browser.startsWith('ro')) return 'ro'
    if (browser.startsWith('en')) return 'en'
    return 'ru'
  })
  const [isLangOpen, setIsLangOpen] = useState(false)
  const [isLangVisible, setIsLangVisible] = useState(true)
  const [showLoading, setShowLoading] = useState(true)
  type TextKey = Exclude<keyof typeof uiText.ru, 'steps' | 'weekdaysShort'>
  const t = (key: TextKey) => uiText[publicLang][key] || uiText.ru[key]
  const locale = localeByLang[publicLang]
  const setLang = (lang: PublicLang) => {
    setPublicLang(lang)
    localStorage.setItem('publicLang', lang)
    setIsLangOpen(false)
  }
  const steps = uiText[publicLang].steps
  const weekdaysShort = uiText[publicLang].weekdaysShort
  const services = useMemo(() => loadServices(), [])
  const staff = useMemo(() => loadStaff(), [])
  const activeServices = services.filter((service) => service.active)
  const activeStaff = staff.filter((member) => member.active)
  const isMobile = useIsMobile()
  const location = useLocation()
  const { slug: urlSlug } = useParams<{ slug: string }>()
  const isPreview = new URLSearchParams(location.search).get('preview') === '1'
  const isEditMode = new URLSearchParams(location.search).get('edit') === '1'
  /** Режим демонстрации шаблонов (выбор темы): показываем только дефолтный дизайн, правки не подставляются */
  const isTemplateDemo = isPreview && !isEditMode
  const readPublic = (key: string, fallback = '') => {
    if (!isPreview) return localStorage.getItem(key) ?? fallback
    if (key === 'publicHeaderTheme')
      return localStorage.getItem('draft_publicHeaderTheme') ?? localStorage.getItem('publicHeaderTheme') ?? fallback
    if (isTemplateDemo) return localStorage.getItem(key) ?? fallback
    const themeRaw =
      localStorage.getItem('draft_publicHeaderTheme') ?? localStorage.getItem('publicHeaderTheme') ?? 'hair'
    const theme = themeRaw.startsWith('premium-') ? themeRaw.replace('premium-', '') : themeRaw
    const slug = urlSlug || 'salon'
    // Только черновики этой темы и этого салона — без подстановки сохранённого key, иначе в другом шаблоне показывался бы адрес из первого
    return localStorage.getItem(`draft_${key}_${slug}_${theme}`) ?? fallback
  }

  const publicHeaderThemeRaw = readPublic('publicHeaderTheme') || 'hair'
  const publicHeaderTheme = publicHeaderThemeRaw.startsWith('premium-')
    ? publicHeaderThemeRaw.replace('premium-', '')
    : publicHeaderThemeRaw
  const isPremiumTemplate =
    publicHeaderThemeRaw === 'premium-hair' || publicHeaderThemeRaw === 'premium-barber'

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
  const headerEditContainerRef = useRef<HTMLDivElement>(null)
  const headerSectionRef = useRef<HTMLElement>(null)
  const gallerySectionRef = useRef<HTMLElement>(null)
  const worksSectionRef = useRef<HTMLElement>(null)
  const footerSectionRef = useRef<HTMLElement>(null)
  const [, setDraftVersion] = useState(0)
  const draftVersionTrigger = useCallback(() => {
    flushSync(() => setDraftVersion((v) => v + 1))
  }, [])
  const [showSuccess, setShowSuccess] = useState(false)
  const successTimeoutRef = useRef<number | null>(null)
  const [isSocialOpen, setIsSocialOpen] = useState(false)
  const [isHeaderDragging, setIsHeaderDragging] = useState(false)
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

  useEffect(() => {
    if (!isPreview || typeof window === 'undefined') return
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'constructorDraftChange') setDraftVersion((v) => v + 1)
      if (e.data?.type === 'scrollToSection' && typeof e.data?.sectionId === 'string') {
        const map: Record<string, React.RefObject<HTMLElement | null>> = {
          header: headerSectionRef,
          gallery: gallerySectionRef,
          booking: bookingSectionRef,
          works: worksSectionRef,
          map: mapSectionRef,
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
    const sections: { id: string; ref: React.RefObject<HTMLElement | null> }[] = [
      { id: 'header', ref: headerSectionRef },
      { id: 'gallery', ref: gallerySectionRef },
      { id: 'booking', ref: bookingSectionRef },
      { id: 'works', ref: worksSectionRef },
      { id: 'map', ref: mapSectionRef },
      { id: 'footer', ref: footerSectionRef },
    ]
    let lastSent = ''
    const timer = window.setInterval(() => {
      let best = ''
      let bestRatio = 0
      for (const { id, ref } of sections) {
        const el = ref.current
        if (!el) continue
        const rect = el.getBoundingClientRect()
        const viewHeight = window.innerHeight
        const visibleTop = Math.max(0, rect.top)
        const visibleBottom = Math.min(viewHeight, rect.bottom)
        const visible = Math.max(0, visibleBottom - visibleTop)
        const ratio = visible / Math.min(rect.height, viewHeight)
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
  }, [isPreview])

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
    const hasCyrillic = /[а-яёА-ЯЁ]/.test(t)
    const hasRealWords = hasCyrillic || /\b(the|your|salon|beauty|запись|салон|красоты)\b/i.test(t)
    if (hasRealWords && t.length > 10) return false
    const junkPattern = /(.)\1{3,}|(..)\2{2,}|dsds|sdsd|saaa|sdad|saaf|dassd|^[dsa]{8,}$/i
    return junkPattern.test(t) || (t.length > 12 && !hasCyrillic && (t.match(/[aeiou]/gi)?.length ?? 0) < 2)
  }

  const rawName =
    isTemplateDemo
      ? FOOTER_DEFAULT_NAME
      : readPublic('publicName') ||
        (isPreview ? FOOTER_DEFAULT_NAME : null) ||
        localStorage.getItem('businessName') ||
        HAIR_THEME_DEFAULT_NAME ||
        t('defaultSalonName')
  const publicName = isJunkHeaderText(rawName) ? FOOTER_DEFAULT_NAME : rawName
  const useBuiltInTemplate = isTemplateDemo || isPreview
  const storedName = readPublic('publicName')
  const isLegacyName = (s: string) => {
    const st = String(s).trim()
    if (!st) return true
    if (st === FOOTER_DEFAULT_NAME) return true
    return (
      st === HAIR_THEME_DEFAULT_NAME ||
      st === 'Березницкий' ||
      st === t('defaultSalonName')
    )
  }
  const headerDisplayName =
    useBuiltInTemplate && isLegacyName(storedName || '')
      ? FOOTER_DEFAULT_NAME
      : publicName
  const rawTagline =
    isTemplateDemo
      ? HAIR_THEME_DEFAULT_TAGLINE
      : readPublic('publicTagline') || HAIR_THEME_DEFAULT_TAGLINE || t('defaultTagline')
  const publicTagline = clampHeaderSubtitleLines(
    isJunkHeaderText(rawTagline) ? HAIR_THEME_DEFAULT_TAGLINE : rawTagline
  )
  const footerDisplayName =
    useBuiltInTemplate && isLegacyName(storedName || '')
      ? FOOTER_DEFAULT_NAME
      : (readPublic('publicName') ? publicName : FOOTER_DEFAULT_NAME)
  const storedAddress = readPublic('publicFooterAddress')
  const storedHours = readPublic('publicHours')
  const storedDayOff = readPublic('publicDayOff')
  const storedPhone = readPublic('publicPhone')
  const storedEmail = readPublic('publicEmail')
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
    return t.split(/[\s,]+/).length <= 1 && t.length < 25
  }
  /** Адрес для карты: в конструкторе редактируют publicAddress, во футере — publicFooterAddress; для превью учитываем оба */
  const mapSourceAddress = (readPublic('publicAddress') || storedAddress || '').trim()
  const isLegacyHours = (s: string) => !s || String(s).trim() === ''
  const isLegacyDayOff = (s: string) => !s || String(s).trim() === ''
  const footerDisplayAddress =
    useBuiltInTemplate && isLegacyAddress(storedAddress || '')
      ? FOOTER_DEFAULT_ADDRESS
      : (storedAddress || FOOTER_DEFAULT_ADDRESS)
  const footerDisplayHours =
    useBuiltInTemplate && isLegacyHours(storedHours || '')
      ? FOOTER_DEFAULT_HOURS
      : (storedHours || FOOTER_DEFAULT_HOURS)
  const footerDisplayDayOff =
    useBuiltInTemplate && isLegacyDayOff(storedDayOff || '')
      ? FOOTER_DEFAULT_DAY_OFF
      : (storedDayOff || FOOTER_DEFAULT_DAY_OFF)
  const footerDisplayPhone =
    useBuiltInTemplate && isLegacyPhone(storedPhone || '')
      ? FOOTER_DEFAULT_PHONE
      : (storedPhone || FOOTER_DEFAULT_PHONE)
  const footerDisplayEmail =
    useBuiltInTemplate && isLegacyEmail(storedEmail || '')
      ? FOOTER_DEFAULT_EMAIL
      : (storedEmail || FOOTER_DEFAULT_EMAIL)
  const publicLogoRaw = readPublic('publicLogo')
  /** Старые сохранённые логотипы (data URL) подменяем на дефолтный файл */
  const publicLogo =
    publicLogoRaw && publicLogoRaw.startsWith('data:')
      ? DEFAULT_LOGO_URL
      : (publicLogoRaw || DEFAULT_LOGO_URL)
  const publicLogoShape =
    (readPublic('publicLogoShape') as 'circle' | 'rounded' | 'square') || 'circle'
  const publicFooterLogoShape =
    (readPublic('publicFooterLogoShape') as 'circle' | 'rounded' | 'square') || publicLogoShape
  const footerLogoDisplayShape = publicFooterLogoShape
  const publicPhone = readPublic('publicPhone') || FOOTER_DEFAULT_PHONE
  const publicEmail = readPublic('publicEmail') || FOOTER_DEFAULT_EMAIL
  const publicTelegram = readPublic('publicTelegram') || ''
  const publicViber = readPublic('publicViber') || ''
  const publicInstagram = readPublic('publicInstagram') || ''
  const publicFooterAddress = readPublic('publicFooterAddress') || FOOTER_DEFAULT_ADDRESS
  const rawBookingTitle = readPublic('publicBookingTitle') || ''
  const rawBookingSubtitle = readPublic('publicBookingSubtitle') || ''
  const isTypoBookingTitle = /Запп+ись|клтаврр/.test(rawBookingTitle)
  const isTypoBookingSubtitle = /Вберите|специа{2,}листа/.test(rawBookingSubtitle)
  const publicBookingTitle =
    !rawBookingTitle || isTypoBookingTitle ? HAIR_THEME_DEFAULT_BOOKING_TITLE : rawBookingTitle
  const publicBookingSubtitle =
    !rawBookingSubtitle || isTypoBookingSubtitle ? HAIR_THEME_DEFAULT_BOOKING_SUBTITLE : rawBookingSubtitle
  const publicHeaderPrimaryCta = readPublic('publicHeaderPrimaryCta') || ''
  const publicHeaderSecondaryCta = readPublic('publicHeaderSecondaryCta') || ''
  const publicHeaderExtraText = readPublic('publicHeaderExtraText') || ''
  const publicHeaderPrimaryCtaShape =
    (readPublic('publicHeaderPrimaryCtaShape') as 'square' | 'round') || 'square'
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
    barberTextOptions.find((option) => option.id === publicHeaderBarberColors.title) || barberTextOptions[0]
  const barberSubtitleColor =
    barberTextOptions.find((option) => option.id === publicHeaderBarberColors.subtitle) || barberTextOptions[1]
  const barberPrimaryColor =
    barberButtonOptions.find((option) => option.id === publicHeaderBarberColors.primary) || barberButtonOptions[0]
  const barberSecondaryColor =
    barberButtonOptions.find((option) => option.id === publicHeaderBarberColors.secondary) || barberButtonOptions[1]
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
  const isDraggableHeaderTheme = ['hair', 'barber', 'cosmetology', 'coloring', 'manicure'].includes(publicHeaderTheme)
  const headerLayoutStorageKey = isDraggableHeaderTheme
    ? `draft_headerLayout${publicHeaderTheme.charAt(0).toUpperCase() + publicHeaderTheme.slice(1)}_v6`
    : 'draft_headerLayoutHair_v6'
  const hasHeaderCustomized =
    publicHeaderTheme !== 'hair' ||
    (typeof window !== 'undefined' &&
      (!!localStorage.getItem('draft_headerHairCustomized') ||
        !!localStorage.getItem('draft_headerLayoutHair_v6') ||
        (publicHeaderTheme !== 'hair' && isDraggableHeaderTheme && !!localStorage.getItem(headerLayoutStorageKey)))) ||
    publicHeaderBarberColors.title !== 'default' ||
    publicHeaderBarberColors.subtitle !== 'default' ||
    publicHeaderBarberColors.primary !== 'default' ||
    publicHeaderBarberColors.secondary !== 'default'
  /** Кастомные цвета на сохранённой странице; в превью редактирования — только если не перетаскиваем и (для hair) уже кастомизировали */
  const applyHeaderColors =
    !isPreview || (isEditMode && !isHeaderDragging && hasHeaderCustomized)
  const headerTitleStyle =
    headerColorsEnabled && applyHeaderColors && publicHeaderBarberColors.title !== 'default'
      ? { color: barberTitleColor.color, textShadow: barberTitleColor.glow }
      : undefined
  const hairTitleFontSizePx = useMemo(
    () => Math.max(20, Math.min(56, 96 - publicName.length * 1.5)),
    [publicName.length]
  )
  const headerSubtitleStyle =
    headerColorsEnabled && applyHeaderColors && publicHeaderBarberColors.subtitle !== 'default'
      ? { color: barberSubtitleColor.color, textShadow: barberSubtitleColor.glow }
      : undefined
  const headerPrimaryCustom =
    headerColorsEnabled && applyHeaderColors && publicHeaderBarberColors.primary !== 'default'
  const headerSecondaryCustom =
    headerColorsEnabled && applyHeaderColors && publicHeaderBarberColors.secondary !== 'default'
  const headerUseGlow = publicHeaderTheme === 'barber'
  const getPrimaryIconClass = (defaultClass: string) =>
    publicHeaderBarberColors.primary === 'black'
      ? 'brightness-0 invert'
      : publicHeaderBarberColors.primary === 'white'
        ? 'brightness-0'
        : publicHeaderBarberColors.primary === 'default'
          ? defaultClass
          : ''
  /** Изначальная позиция хедера темы «Парикмахерская» (логотип, название, описание, кнопки) */
  const HAIR_HEADER_INITIAL_PADDING = 'w-full px-4 pb-14 sm:pb-20 pt-40 sm:pt-32 md:pt-44 lg:pt-[22rem] xl:pt-[24rem] text-center justify-center'
  const bodyBackground =
    publicBodyBackgroundChoice === 'bg-1'
      ? { type: 'image', url: patternBg }
      : publicBodyBackgroundChoice === 'bg-2'
        ? { type: 'image', url: manicurePattern }
        : publicBodyBackgroundChoice === 'bg-3'
          ? { type: 'image', url: manicurePatternAlt }
          : publicBodyBackgroundChoice === 'bg-4'
            ? { type: 'color', color: '#0b0b0b' }
            : publicBodyBackgroundChoice === 'bg-5'
              ? { type: 'color', color: '#e8e4df' }
              : { type: 'image', url: patternBg }
  const bodyBackgroundImage =
    bodyBackground.type === 'image'
      ? `linear-gradient(180deg, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.85)), url(${bodyBackground.url})`
      : publicBodyBackgroundChoice === 'bg-5'
        ? 'none'
        : 'linear-gradient(180deg, rgba(0, 0, 0, 0.78), rgba(0, 0, 0, 0.85))'
  const bodyBackgroundColor =
    bodyBackground.type === 'color' ? bodyBackground.color : undefined
  const publicAddress = readPublic('publicAddress') || publicFooterAddress
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
  })()
  const publicPlaceName = readPublic('publicPlaceName') || ''
  const publicHours = readPublic('publicHours') || FOOTER_DEFAULT_HOURS
  const publicDayOff = readPublic('publicDayOff') || FOOTER_DEFAULT_DAY_OFF
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
  const googleMapUrl = hasCoords
    ? `https://www.google.com/maps?q=${mapLat},${mapLng}&z=${mapZoom}&output=embed&hl=en`
    : `https://www.google.com/maps?q=${encodeURIComponent(googleMapQuery)}&z=${mapZoom}&output=embed&hl=en`
  const googleOpenUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${mapLat},${mapLng}&hl=en`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(googleSearchQuery || googleMapQuery)}&hl=en`
  const heroBackgroundDefault =
    publicHeaderTheme === 'barber'
      ? barberHeaderBg
      : publicHeaderTheme === 'cosmetology'
        ? cosmetologyHeaderBg
        : publicHeaderTheme === 'coloring'
          ? coloringHeaderBg
          : publicHeaderTheme === 'manicure'
            ? manicureHeaderBg
            : heroImage
  const heroBackgroundUrl = readPublic('publicHeroImage') || heroBackgroundDefault
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
  const galleryValues = galleryValuesRaw.map((v, i) =>
    v === '__empty__' ? '' : (v || DEFAULT_WORKS_CAROUSEL_IMAGES[i] || '')
  )
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
  const worksDisplayImages = useMemo(
    () =>
      worksImagesRaw.map((img, i) =>
        img === '__empty__' ? '' : (img || DEFAULT_WORKS_IMAGES[i] || '')
      ),
    [worksImagesRaw[0], worksImagesRaw[1], worksImagesRaw[2], worksImagesRaw[3], worksImagesRaw[4], isTemplateDemo]
  )
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
      console.error('Ошибка сохранения записи:', e)
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
    <div
      className="border-t border-border/50 bg-background/95 overflow-hidden"
      style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        width: '100vw',
        maxWidth: '100vw',
        paddingBottom: 'env(safe-area-inset-bottom)',
        transform: 'translate3d(0, 0, 0)',
        WebkitTransform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
      }}
    >
      {isMobileSummaryOpen && (
        <div className="border-b border-border/50 bg-background">
          <div className="w-full px-4 pt-4 pb-3">
            <div className="rounded-2xl border border-border/60 bg-card/95 shadow-[0_16px_40px_rgba(0,0,0,0.4)]">
              <button
                type="button"
                onClick={() => setIsMobileSummaryOpen(false)}
                className="w-full flex items-center justify-between px-4 py-3 border-b border-border/50"
              >
                <span className="font-semibold text-foreground">{t('yourBooking')}</span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>
              <div className="px-4 py-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('serviceLabel')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {selectedService?.name || t('notSelected')}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('masterLabel')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {selectedStaff?.name || t('notSelected')}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('dateTimeLabel')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {formatDisplayDate(selectedDate)} {selectedTime || ''}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('phonePlaceholder')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {clientPhone || t('notSelected')}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('socialNetworkLabel')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {clientSocialMethod || '—'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <span className="text-muted-foreground">{t('contactHandlePlaceholder')}</span>
                  <span className="font-semibold text-right max-w-[60%] break-words">
                    {clientSocialHandle || '—'}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-3 pt-2 border-t border-border/40">
                  <span className="text-muted-foreground">{t('priceLabel')}</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedService ? `${selectedService.price} MDL` : '—'}
                  </span>
                </div>
                <Button
                  className="w-full mt-4 rounded-full"
                  onClick={handleSubmit}
                  disabled={!canProceed(4)}
                >
                  {t('sendRequest')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="w-full px-4 py-3 min-h-[68px] flex items-center gap-3">
        <button
          type="button"
          onClick={() => setIsMobileSummaryOpen((prev) => !prev)}
          className={cn(
            "flex-1 h-11 rounded-full px-4 text-sm font-semibold text-white border border-white/25",
            "bg-gradient-to-r from-slate-900/85 via-slate-800/80 to-slate-700/85",
            "backdrop-blur-xl",
            "transition hover:brightness-105 active:scale-[0.99]"
          )}
        >
          <span className="inline-flex items-center justify-center gap-2">
            {t('viewBooking')}
            <ChevronUp className={cn('h-4 w-4 transition-transform', isMobileSummaryOpen && 'rotate-180')} />
          </span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {currentStep > 1 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
            >
              {t('back')}
            </Button>
          )}
          <Button
            size="sm"
            onClick={() => {
              if (currentStep < 4) {
                setCurrentStep((prev) => Math.min(4, prev + 1))
              } else {
                setIsMobileSummaryOpen(true)
              }
            }}
            disabled={!canProceed(currentStep)}
          >
            {t('next')}
          </Button>
        </div>
      </div>
    </div>
  ) : null

  if (isPremiumTemplate) {
    return (
      <div className="min-h-screen bg-[#0b0b0b] flex flex-col items-center justify-center text-center px-6">
        <p className="text-white/90 text-xl sm:text-2xl font-medium">Премиум шаблон</p>
        <p className="text-white/60 mt-2">Скоро будет новая структура.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-card text-foreground overflow-x-hidden">
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
      <div
        style={{
          backgroundImage: bodyBackgroundImage,
          backgroundColor: bodyBackgroundColor,
          backgroundRepeat: 'repeat',
          backgroundSize: '720px',
          backgroundPosition: 'center',
        }}
      >
      <header ref={headerSectionRef} className="relative overflow-hidden">
        <div
          ref={headerEditContainerRef}
          className={cn(
            'w-full bg-center flex items-start overflow-hidden',
            'min-h-[520px] sm:min-h-[620px] md:min-h-[760px] lg:min-h-[860px]'
          )}
          style={{
            backgroundImage: heroBackgroundUrl
              ? `url("${heroBackgroundUrl}")`
              : 'linear-gradient(120deg, rgba(17,17,17,0.9), rgba(31,41,55,0.85))',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover',
            backgroundPosition: publicHeaderTheme === 'barber' ? 'left center' : 'center 0%',
            backgroundColor: '#0b0b0b',
          }}
        >
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
                className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-nowrap overflow-visible"
                style={headerTitleStyle}
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
              isDraggableHeaderTheme && isEditMode
                ? 'absolute inset-0'
                : publicHeaderTheme === 'hair'
                  ? !isEditMode && HAIR_HEADER_INITIAL_PADDING
                  : publicHeaderTheme === 'barber'
                    ? !isEditMode && HAIR_HEADER_INITIAL_PADDING
                    : publicHeaderTheme === 'cosmetology'
                      ? !isEditMode && HAIR_HEADER_INITIAL_PADDING
                      : publicHeaderTheme === 'coloring'
                        ? !isEditMode && HAIR_HEADER_INITIAL_PADDING
                        : publicHeaderTheme === 'manicure'
                          ? !isEditMode && HAIR_HEADER_INITIAL_PADDING
                          : undefined
            )}
          >
            {isDraggableHeaderTheme && isEditMode ? (
              <DraggableHeaderHair
                key={publicHeaderTheme}
                layoutStorageKey={headerLayoutStorageKey}
                defaultLayout={DEFAULT_HEADER_LAYOUT_BY_THEME[publicHeaderTheme]}
                headerTheme={publicHeaderTheme}
                onDragStart={() => setIsHeaderDragging(true)}
                onDragEnd={() => setIsHeaderDragging(false)}
                onDraftChange={() => {
                  if (typeof window !== 'undefined') {
                    if (publicHeaderTheme === 'hair') window.localStorage.setItem('draft_headerHairCustomized', '1')
                    window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                  }
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
                headerTitleStyle={headerTitleStyle}
                headerSubtitleStyle={headerSubtitleStyle}
                headerPrimaryCustom={headerPrimaryCustom}
                headerSecondaryCustom={headerSecondaryCustom}
                barberPrimaryColor={barberPrimaryColor}
                barberSecondaryColor={barberSecondaryColor}
                publicHeaderPrimaryCtaShape={publicHeaderPrimaryCtaShape}
                publicHeaderSecondaryCtaShape={publicHeaderSecondaryCtaShape}
                getPrimaryIconClass={getPrimaryIconClass}
                onBookClick={() => bookingSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                onMapClick={() => mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                bookLabel={t('bookOnline')}
                mapLabel={t('whereToFindQuestion')}
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
                    className="w-full text-center font-serif font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-nowrap overflow-visible max-w-[90%] mx-auto"
                    style={{ ...headerTitleStyle, fontSize: `${hairTitleFontSizePx}px` }}
                  >
                    {headerDisplayName}
                  </h1>
                  <p
                    className={cn(
                      'mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl text-white/80 inline-block',
                      'text-center mx-auto',
                      'whitespace-pre leading-[1.35] overflow-visible'
                    )}
                    style={headerSubtitleStyle}
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
                    className="w-full text-center font-serif font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-nowrap overflow-visible max-w-[90%] mx-auto"
                    style={{ ...headerTitleStyle, fontSize: `${hairTitleFontSizePx}px` }}
                  >
                    {headerDisplayName}
                  </h1>
                  <p
                    className={cn(
                      'mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl text-white/80 inline-block',
                      'text-center mx-auto',
                      'whitespace-pre leading-[1.35] overflow-visible'
                    )}
                    style={headerSubtitleStyle}
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
                            'text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-serif font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-nowrap overflow-visible',
                            publicHeaderLogoPlacement === 'left'
                              ? 'text-left w-auto'
                              : 'text-center w-full'
                          )}
                          style={headerTitleStyle}
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
                        className="w-full text-center font-serif font-semibold tracking-[0.08em] text-white drop-shadow-[0_12px_34px_rgba(0,0,0,0.5)] whitespace-nowrap overflow-visible max-w-[90%] mx-auto"
                        style={{ ...headerTitleStyle, fontSize: `${hairTitleFontSizePx}px` }}
                      >
                        {headerDisplayName}
                      </h1>
                    </>
                  )}
                  <p
                    className={cn(
                      'mt-3 sm:mt-4 text-base sm:text-lg md:text-2xl text-white/80 inline-block',
                      'text-center mx-auto',
                      'whitespace-pre leading-[1.35] overflow-visible'
                    )}
                    style={headerSubtitleStyle}
                  >
                    {publicTagline}
                  </p>
                </>
              )}
              {(publicHeaderTheme === 'hair' || publicHeaderTheme === 'cosmetology' || publicHeaderTheme === 'custom' || publicHeaderTheme === 'barber' || publicHeaderTheme === 'coloring' || publicHeaderTheme === 'manicure') && (
                <div
                  className={cn(
                    'flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 sm:mt-10',
                    'justify-center'
                  )}
                >
                  <Button
                    className={cn(
                      publicHeaderPrimaryCtaShape === 'round' ? 'rounded-full' : 'rounded-none',
                      'h-14 sm:h-16 md:h-[4.5rem] px-8 sm:px-12 md:px-14 text-base sm:text-lg md:text-xl border backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.35)] w-full sm:w-auto inline-flex items-center gap-2',
                      headerPrimaryCustom ? '' : 'bg-primary/35 text-white border-primary/50 hover:bg-primary/45'
                    )}
                    style={
                      headerPrimaryCustom
                        ? {
                            backgroundColor: barberPrimaryColor.background,
                            color: barberPrimaryColor.text,
                            boxShadow: headerUseGlow ? barberPrimaryColor.glow : 'none',
                            borderColor: barberPrimaryColor.background,
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
                        getPrimaryIconClass('brightness-0 invert')
                      )}
                    />
                    {publicHeaderPrimaryCta || t('bookOnline')}
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      publicHeaderSecondaryCtaShape === 'round' ? 'rounded-full' : 'rounded-none',
                      'h-14 sm:h-16 md:h-[4.5rem] px-8 sm:px-12 md:px-14 text-base sm:text-lg md:text-xl backdrop-blur-xl w-full sm:w-auto inline-flex items-center gap-2',
                      headerSecondaryCustom ? '' : 'border-white/35 text-white bg-white/10 hover:bg-white/20'
                    )}
                    style={
                      headerSecondaryCustom
                        ? {
                            backgroundColor: barberSecondaryColor.background,
                            color: barberSecondaryColor.text,
                            boxShadow: headerUseGlow ? barberSecondaryColor.glow : 'none',
                            borderColor: barberSecondaryColor.background,
                          }
                        : undefined
                    }
                    onClick={() => {
                      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    }}
                  >
                    <MapPin
                      className="h-8 w-8 translate-y-[1px]"
                      style={{ width: 28, height: 28, color: headerSecondaryCustom ? barberSecondaryColor.text : 'rgba(255,255,255,0.8)' }}
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

      <main className="w-full py-8 sm:py-10 md:py-12 pb-16 sm:pb-20 md:pb-12 space-y-8 sm:space-y-10">
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
                      const prev = window.localStorage.getItem(`draft_publicGalleryTitle_${publicHeaderTheme}`) ?? window.localStorage.getItem('publicGalleryTitle') ?? ''
                      try {
                        window.parent?.postMessage?.({ type: 'constructorUndoPush', key: 'publicGalleryTitle', value: prev || null, themeId: publicHeaderTheme }, '*')
                      } catch { /* ignore */ }
                      window.localStorage.setItem(`draft_publicGalleryTitle_${publicHeaderTheme}`, v)
                      window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                      draftVersionTrigger()
                    }
                  }
                  }
                  className="w-full text-center text-xl sm:text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground bg-transparent border-b border-transparent hover:border-border/50 focus:border-primary focus:outline-none"
                  style={
                    galleryTitleColorOption
                      ? { color: galleryTitleColorOption.color, textShadow: galleryTitleColorOption.glow }
                      : undefined
                  }
                  placeholder={t('salonPhotos')}
                />
              ) : (
                <h2
                  className="text-center text-xl sm:text-2xl md:text-3xl font-display font-semibold tracking-tight text-foreground"
                  style={
                    galleryTitleColorOption
                      ? { color: galleryTitleColorOption.color, textShadow: galleryTitleColorOption.glow }
                      : undefined
                  }
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
                    window.localStorage.getItem(`draft_${key}_${publicHeaderTheme}`) ??
                    window.localStorage.getItem(key) ??
                    ''
                  const wasUserImage = Boolean(image)
                  if (wasUserImage) {
                    window.localStorage.removeItem(`draft_${key}_${publicHeaderTheme}`)
                  } else {
                    window.localStorage.setItem(`draft_${key}_${publicHeaderTheme}`, '__empty__')
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
                          aria-label="Удалить"
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
                                const prev = window.localStorage.getItem(`draft_${key}_${publicHeaderTheme}`) ?? window.localStorage.getItem(key) ?? ''
                                try {
                                  window.parent?.postMessage?.({ type: 'constructorUndoPush', key, value: prev || null, themeId: publicHeaderTheme }, '*')
                                } catch { /* ignore */ }
                                window.localStorage.setItem(`draft_${key}_${publicHeaderTheme}`, result)
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
                    const prev = window.localStorage.getItem(`draft_publicBookingTitle_${publicHeaderTheme}`) ?? window.localStorage.getItem('publicBookingTitle') ?? ''
                    try {
                      window.parent?.postMessage?.({ type: 'constructorUndoPush', key: 'publicBookingTitle', value: prev || null, themeId: publicHeaderTheme }, '*')
                    } catch { /* ignore */ }
                    window.localStorage.setItem(`draft_publicBookingTitle_${publicHeaderTheme}`, v)
                    window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                    draftVersionTrigger()
                  }
                }}
                className="w-full text-center text-2xl sm:text-3xl md:text-4xl font-display font-semibold tracking-tight text-foreground bg-transparent rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:border-primary px-3 py-2"
                style={
                  bookingTitleColorOption
                    ? { color: bookingTitleColorOption.color, textShadow: bookingTitleColorOption.glow }
                    : undefined
                }
                placeholder={t('bookingTitle')}
              />
              <textarea
                value={publicBookingSubtitle}
                onChange={(e) => {
                  const v = e.target.value
                  if (typeof window !== 'undefined') {
                    const prev = window.localStorage.getItem(`draft_publicBookingSubtitle_${publicHeaderTheme}`) ?? window.localStorage.getItem('publicBookingSubtitle') ?? ''
                    try {
                      window.parent?.postMessage?.({ type: 'constructorUndoPush', key: 'publicBookingSubtitle', value: prev || null, themeId: publicHeaderTheme }, '*')
                    } catch { /* ignore */ }
                    window.localStorage.setItem(`draft_publicBookingSubtitle_${publicHeaderTheme}`, v)
                    window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                    draftVersionTrigger()
                  }
                }}
                rows={2}
                className="w-full text-center text-xs sm:text-sm md:text-base text-muted-foreground bg-transparent rounded-lg border border-transparent focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:border-primary resize-none placeholder:text-muted-foreground px-3 py-2"
                style={
                  bookingSubtitleColorOption
                    ? { color: bookingSubtitleColorOption.color, textShadow: bookingSubtitleColorOption.glow }
                    : undefined
                }
                placeholder={t('bookingSubtitle')}
              />
            </>
          ) : (
            <>
              <h2
                className="text-2xl sm:text-3xl md:text-4xl font-display font-semibold tracking-tight text-foreground"
                style={
                  bookingTitleColorOption
                    ? { color: bookingTitleColorOption.color, textShadow: bookingTitleColorOption.glow }
                    : undefined
                }
              >
                {publicBookingTitle || t('bookingTitle')}
              </h2>
              <p
                className="text-xs sm:text-sm md:text-base text-muted-foreground"
                style={
                  bookingSubtitleColorOption
                    ? { color: bookingSubtitleColorOption.color, textShadow: bookingSubtitleColorOption.glow }
                    : undefined
                }
              >
                {publicBookingSubtitle || t('bookingSubtitle')}
              </p>
            </>
          )}
        </section>

        <section className="w-full max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start lg:items-stretch rounded-3xl border border-border/40 bg-card/30 backdrop-blur-xl p-4 sm:p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.35)] overflow-visible">
            <Card className="relative z-30 p-4 sm:p-6 lg:col-span-2 h-full bg-background/40 border-border/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <h3 className="text-xl sm:text-2xl font-display font-semibold mb-2 text-center">{t('onlineBooking')}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-5 sm:mb-6 text-center">
              {t('onlineBookingSubtitle')}
            </p>

              <div className="mb-6 rounded-xl border border-border/50 bg-card/30 px-4 py-3 text-left">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{t('step')} {currentStep} {t('of')} {steps.length}</span>
                  <span>{steps[currentStep - 1]}</span>
                </div>
                <div className="mt-2 h-1.5 w-full rounded-full bg-muted/50">
                  <div
                    className="h-1.5 rounded-full bg-primary transition-all"
                    style={{ width: `${(currentStep / 4) * 100}%` }}
                  />
                </div>
              </div>

            <div className="space-y-8">
              <div className={cn("text-center", currentStep !== 1 && "hidden")}>
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                  <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-[10px] sm:text-xs font-bold text-primary">
                    1
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-semibold">{t('serviceTitle')}</h3>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground/80 text-left mb-3 sm:mb-4">{t('chooseService')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr">
                  {activeServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                    onClick={() => {
                      setSelectedServiceId(service.id)
                      setSelectedStaffId(null)
                      setSelectedTime(null)
                    }}
                      className={cn(
                        'w-full text-left rounded-xl border transition min-h-[48px] sm:min-h-[56px] flex items-stretch focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0',
                        selectedServiceId === service.id
                          ? 'border-primary/60 bg-primary/5'
                          : 'border-border/60 hover:border-primary/40'
                      )}
                    >
                      <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4 flex flex-col justify-center">
                        <h4 className="font-semibold">{service.name}</h4>
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">{service.duration} {t('minutesShort')}</p>
                      </div>
                      <div className="border-l-2 border-dashed border-border/80 flex items-center px-3 py-3 sm:px-4 sm:py-4">
                        <span className="text-xs sm:text-sm font-semibold text-emerald-400">
                          {service.price} MDL
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className={cn("text-center", currentStep !== 2 && "hidden")}>
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                  <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-[10px] sm:text-xs font-bold text-primary">
                    2
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-semibold">{t('masterTitle')}</h3>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground/80 text-left mb-3 sm:mb-4">{t('chooseMaster')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableStaff.map((member) => (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => {
                        setSelectedStaffId(member.id)
                        setSelectedTime(null)
                      }}
                      className={cn(
                        'w-full text-left rounded-xl border p-3 sm:p-4 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-0',
                        selectedStaffId === member.id
                          ? 'border-primary/60 bg-primary/5'
                          : 'border-border/60 hover:border-primary/40'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-semibold"
                          style={{ backgroundColor: member.color }}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-[11px] sm:text-xs text-muted-foreground">{member.category}</p>
                        </div>
                      </div>
                      {member.description && (
                        <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">{member.description}</p>
                      )}
                      <p className="text-[11px] sm:text-xs text-muted-foreground mt-2">
                        {t('schedulePrefix')}: {member.workingHours.start}–{member.workingHours.end}
                      </p>
                    </button>
                  ))}
                  {availableStaff.length === 0 && (
                    <div className="text-sm text-muted-foreground text-center">
                      {t('noMasters')}
                    </div>
                  )}
                </div>
              </div>

              <div className={cn("text-center", currentStep !== 3 && "hidden")}>
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                  <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-[10px] sm:text-xs font-bold text-primary">
                    3
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-semibold">{t('dateTimeTitle')}</h3>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground/80 text-left mb-3 sm:mb-4">{t('chooseSlot')}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-xs sm:text-sm font-medium mb-2">{t('dateLabel')}</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCalendarDate(new Date(selectedDate + 'T00:00:00'))
                        setIsDatePickerOpen(true)
                      }}
                      className="w-full px-4 py-3 sm:py-3.5 rounded-lg border border-border/60 bg-card/40 text-xs sm:text-sm text-foreground flex items-center justify-between hover:border-primary/40 transition"
                    >
                      <span className="text-left leading-snug whitespace-normal">
                        {formatDisplayDate(selectedDate)}
                      </span>
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs sm:text-sm font-medium">{t('timeLabel')}</label>
                    <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => {
                            setSelectedTime(slot)
                          }}
                          disabled={!selectedService || !selectedStaff || busySlots.has(slot)}
                          className={cn(
                            'rounded-lg border px-2 py-2 sm:px-3 sm:py-2.5 text-xs sm:text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
                            selectedTime === slot
                              ? 'border-primary/60 bg-primary text-primary-foreground'
                              : busySlots.has(slot)
                              ? 'border-red-500/40 bg-red-500/15 text-red-400 cursor-not-allowed'
                              : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/15',
                            selectedTime === slot
                              ? 'focus-visible:ring-primary/40'
                              : busySlots.has(slot)
                              ? 'focus-visible:ring-red-500/40'
                              : 'focus-visible:ring-emerald-500/40',
                            (!selectedService || !selectedStaff) && 'opacity-50 cursor-not-allowed'
                          )}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={cn("text-center", currentStep !== 4 && "hidden")}>
                <div className="flex items-center justify-center gap-2 sm:gap-3 mb-2">
                  <span className="inline-flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-[10px] sm:text-xs font-bold text-primary">
                    4
                  </span>
                  <h3 className="text-base sm:text-lg font-display font-semibold">{t('contactsTitle')}</h3>
                </div>
                <p className="text-xs sm:text-sm font-medium text-foreground/80 text-left mb-3 sm:mb-4">{t('fillDetails')}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    placeholder={t('namePlaceholder')}
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="h-11 sm:h-12 text-sm sm:text-base bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                  <Input
                    placeholder={t('phonePlaceholder')}
                    value={clientPhone}
                    onChange={(e) => {
                      const raw = e.target.value
                      const sanitized = raw.replace(/[^\d+]/g, '')
                      const normalized = sanitized.startsWith('+')
                        ? `+${sanitized.slice(1).replace(/\+/g, '')}`
                        : sanitized.replace(/\+/g, '')
                      setClientPhone(normalized)
                    }}
                    inputMode="tel"
                    pattern="[0-9+]*"
                    className="h-11 sm:h-12 text-sm sm:text-base bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                  <Input
                    placeholder={t('emailPlaceholder')}
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="h-11 sm:h-12 text-sm sm:text-base bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                  <Input
                    placeholder={t('commentPlaceholder')}
                    value={clientComment}
                    onChange={(e) => setClientComment(e.target.value)}
                    className="h-11 sm:h-12 text-sm sm:text-base bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                  <div className="space-y-2">
                    <p className="text-xs sm:text-sm font-medium text-foreground/80 whitespace-nowrap">
                      {t('contactMethodLabel')}
                    </p>
                    <div ref={socialRef} className="relative w-full z-40">
                      <button
                        type="button"
                        onClick={() => setIsSocialOpen((prev) => !prev)}
                        className={cn(
                          "h-11 sm:h-12 w-full rounded-md bg-card/40 border px-3 pr-10 text-sm sm:text-base text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 text-left transition",
                          isSocialOpen ? "border-primary/40" : "border-border/60 hover:border-primary/30"
                        )}
                      >
                        {clientSocialMethod || t('contactMethodPlaceholder')}
                      </button>
                      <ChevronDown
                        className={cn(
                          "pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
                          isSocialOpen && "rotate-180"
                        )}
                      />
                      {isSocialOpen && (
                        <div className="absolute left-0 right-0 mt-2 rounded-md border border-border/60 bg-[#1b1f27] shadow-[0_18px_40px_rgba(0,0,0,0.35)] z-50 overflow-hidden">
                          {socialOptions.map((option) => (
                            <button
                              key={option}
                              type="button"
                              onClick={() => {
                                setClientSocialMethod(option)
                                setIsSocialOpen(false)
                              }}
                              className={cn(
                                "w-full px-3 py-2 text-left text-sm sm:text-base transition",
                                clientSocialMethod === option
                                  ? "bg-primary/15 text-foreground"
                                  : "text-foreground/90 hover:bg-primary/10"
                              )}
                            >
                              {option}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-6">
                    <Input
                      placeholder={t('contactHandlePlaceholder')}
                      value={clientSocialHandle}
                      onChange={(e) => setClientSocialHandle(e.target.value)}
                      className="h-11 sm:h-12 text-sm sm:text-base bg-card/40 border-border/60 focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                </div>
              </div>
            </div>

            {!isMobile && (
              <div className="mt-6 flex items-end gap-3">
                <div className="ml-auto flex items-center gap-2">
                  {currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
                    >
                      {t('back')}
                    </Button>
                  )}
                  {currentStep < 4 && (
                    <Button
                      onClick={() => {
                        setCurrentStep((prev) => Math.min(4, prev + 1))
                      }}
                      disabled={!canProceed(currentStep)}
                    >
                      {t('next')}
                    </Button>
                  )}
                  {currentStep === 4 && (
                    <Button onClick={handleSubmit} disabled={!canProceed(4)}>
                      {t('sendRequest')}
                    </Button>
                  )}
                </div>
              </div>
            )}
            </Card>

            <div className="hidden lg:block h-full">
              <div className="h-full min-h-[520px] rounded-2xl border border-border/60 bg-card/70 px-5 py-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] flex flex-col">
                <div className="flex items-center justify-center">
                  <h3 className="text-xl font-display font-bold text-foreground text-center">
                    {t('yourBooking')}
                  </h3>
                </div>
                <div className="mt-5 space-y-3 text-sm flex-1">
                  {summaryItems.map((item) => (
                    <div key={item.label} className="flex items-start justify-between gap-3">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span
                        className={cn(
                          'text-right max-w-[60%] break-words font-semibold',
                          item.filled ? 'text-foreground' : 'text-muted-foreground'
                        )}
                      >
                        {item.filled ? item.value : '—'}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex items-center justify-between rounded-xl border border-border/50 bg-background/40 px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{t('priceLabel')}</span>
                  <span className="font-semibold text-emerald-400">
                    {selectedService ? `${selectedService.price} MDL` : '—'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {galleryPreview.length > 0 && sectionVisibility.works && (
          <section ref={worksSectionRef} className="flex justify-center">
            <div className="w-full max-w-6xl">
              <h2 className="text-center text-2xl sm:text-3xl font-display font-semibold tracking-tight text-foreground mb-4 sm:mb-5">
                Галерея работ
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
                  textColor="#ffffff"
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

        {isDatePickerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
              onClick={() => setIsDatePickerOpen(false)}
            />
            <div
              className="fixed inset-0 z-[70] flex items-center justify-center p-4"
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsDatePickerOpen(false)}
                      className="h-8 w-8"
                    >
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
                      <ChevronLeft className="h-4 w-4" />
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
                      <ChevronRight className="h-4 w-4" />
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
        )}

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
                    aria-label="Закрыть"
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
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                {t('locationLabel')}
              </p>
              <h3 className="text-lg font-semibold text-foreground">{t('whereToFind')}</h3>
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
      <footer ref={footerSectionRef} className="w-full">
        <div className="w-full bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b] to-[#111111] shadow-[0_-30px_70px_rgba(0,0,0,0.5)]">
          <div className="w-full px-6 sm:px-10 lg:px-16 pt-12 pb-24">
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
                          const prev = window.localStorage.getItem(`draft_publicName_${publicHeaderTheme}`) ?? window.localStorage.getItem('publicName') ?? ''
                          try {
                            window.parent?.postMessage?.({ type: 'constructorUndoPush', key: 'publicName', value: prev || null, themeId: publicHeaderTheme }, '*')
                          } catch { /* ignore */ }
                          window.localStorage.setItem(`draft_publicName_${publicHeaderTheme}`, v)
                          window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                          draftVersionTrigger()
                        }
                      }}
                      className="w-full min-w-0 text-3xl md:text-4xl font-display font-semibold text-foreground bg-transparent border-b border-transparent hover:border-border/50 focus:border-primary focus:outline-none focus:ring-0"
                      placeholder={FOOTER_DEFAULT_NAME}
                      style={{ minWidth: `${Math.min(40, Math.max(16, (footerDisplayName?.length || 0) + 2))}ch` }}
                    />
                  ) : (
                    <p className="text-3xl md:text-4xl font-display font-semibold text-foreground whitespace-nowrap overflow-hidden max-w-[420px]">
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
                ]
                  .filter(({ key, value }) => Boolean(value) && socialVisibility[key as keyof typeof socialVisibility])
                  .map(({ key, label, value, className, icon: Icon }) => {
                    const canEditFooter = isPreview && isEditMode && typeof window !== 'undefined'
                    return (
                      <div key={label} className="relative">
                        {canEditFooter && (
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window === 'undefined') return
                              const storageKey =
                                key === 'telegram'
                                  ? 'publicTelegram'
                                  : key === 'viber'
                                    ? 'publicViber'
                                    : 'publicInstagram'
                              const previousValue = window.localStorage.getItem(`draft_${storageKey}_${publicHeaderTheme}`) ?? window.localStorage.getItem(storageKey) ?? ''
                              window.localStorage.setItem(`draft_${storageKey}_${publicHeaderTheme}`, '')
                              window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                              draftVersionTrigger()
                              try {
                                window.parent?.postMessage?.({ type: 'constructorUndoPush', key: storageKey, value: previousValue || null, themeId: publicHeaderTheme }, '*')
                              } catch {
                                // ignore
                              }
                            }}
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-black/70 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-black/80 flex items-center justify-center z-10"
                            aria-label="Скрыть"
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
                          <Icon className="h-5 w-5" />
                          {label}
                        </a>
                      </div>
                    )
                  })}
              </div>
            </div>

            <div className="mt-20">
              <div className="flex flex-nowrap items-start justify-between gap-3 sm:gap-4 md:gap-6 text-center">
                {(
                  [
                    footerVisibility.address && {
                      id: 'address' as const,
                      label: footerLabels?.address || t('addressLabel'),
                      value: footerDisplayAddress || t('addressFallback'),
                      extra: null as string | null,
                      draftKey: 'publicFooterAddress' as const,
                      extraDraftKey: null as string | null,
                    },
                    footerVisibility.schedule && {
                      id: 'schedule' as const,
                      label: footerLabels?.schedule || t('scheduleLabel'),
                      value: footerDisplayHours,
                      extra: footerVisibility.dayOff ? footerDisplayDayOff : null,
                      draftKey: 'publicHours' as const,
                      extraDraftKey: footerVisibility.dayOff ? 'publicDayOff' : null,
                    },
                    footerVisibility.phone && {
                      id: 'phone' as const,
                      label: footerLabels?.phone || t('phoneLabel'),
                      value: footerDisplayPhone,
                      extra: null as string | null,
                      draftKey: 'publicPhone' as const,
                      extraDraftKey: null as string | null,
                    },
                    footerVisibility.email && {
                      id: 'email' as const,
                      label: footerLabels?.email || t('emailLabel'),
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
                                    window.localStorage.getItem(`draft_publicFooterVisibility_${publicHeaderTheme}`) ??
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
                                  window.localStorage.setItem(`draft_publicFooterVisibility_${publicHeaderTheme}`, JSON.stringify(next))
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
                              aria-label="Скрыть блок"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground min-h-[18px]">
                            {item.label}
                          </p>
                          {canEditFooter ? (
                            <>
                              <input
                                type="text"
                                value={item.value}
                                onChange={(e) => {
                                  const v = e.target.value
                                  if (typeof window !== 'undefined') {
                                    const prev = window.localStorage.getItem(`draft_${item.draftKey}_${publicHeaderTheme}`) ?? window.localStorage.getItem(item.draftKey) ?? ''
                                    try {
                                      window.parent?.postMessage?.({ type: 'constructorUndoPush', key: item.draftKey, value: prev || null, themeId: publicHeaderTheme }, '*')
                                    } catch { /* ignore */ }
                                    window.localStorage.setItem(`draft_${item.draftKey}_${publicHeaderTheme}`, v)
                                    window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                                    draftVersionTrigger()
                                  }
                                }}
                                className="w-full min-w-0 text-foreground text-lg md:text-xl font-semibold leading-relaxed bg-transparent border-b border-transparent hover:border-border/50 focus:border-primary focus:outline-none focus:ring-0 text-center"
                              />
                              {item.extra != null && item.extraDraftKey && (
                                <input
                                  type="text"
                                  value={item.extra}
                                  onChange={(e) => {
                                    const v = e.target.value
                                    if (typeof window !== 'undefined') {
                                      const prev = window.localStorage.getItem(`draft_${item.extraDraftKey}_${publicHeaderTheme}`) ?? window.localStorage.getItem(item.extraDraftKey) ?? ''
                                      try {
                                        window.parent?.postMessage?.({ type: 'constructorUndoPush', key: item.extraDraftKey, value: prev || null, themeId: publicHeaderTheme }, '*')
                                      } catch { /* ignore */ }
                                      window.localStorage.setItem(`draft_${item.extraDraftKey}_${publicHeaderTheme}`, v)
                                      window.localStorage.setItem(`constructorHasUserEdits_${publicHeaderTheme}`, '1')
                                      draftVersionTrigger()
                                    }
                                  }}
                                  className="w-full min-w-0 text-red-500 text-sm md:text-base bg-transparent border-b border-transparent hover:border-border/50 focus:border-primary focus:outline-none focus:ring-0 text-center"
                                />
                              )}
                            </>
                          ) : (
                            <>
                              <p className="text-foreground text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate">
                                {item.value}
                              </p>
                              {item.extra && (
                                <p className="text-red-500 text-sm md:text-base min-w-0 truncate">{item.extra}</p>
                              )}
                            </>
                          )}
                        </div>
                        {index < arr.length - 1 && (
                          <div className="hidden sm:block h-10 w-px shrink-0 bg-primary/30 mx-2 md:mx-4" />
                        )}
                      </div>
                    )
                  })}
              </div>
            </div>
          </div>
        </div>
      </footer>
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
            aria-label="Language"
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
                .filter((item) => item.code !== publicLang)
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
            aria-label="Language"
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
                .filter((item) => item.code !== publicLang)
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
      {isPreview && !isEditMode && typeof window !== 'undefined' && window.top === window && (
        <div className="fixed bottom-6 right-6 z-[100]">
          <Link
            to="/constructor"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg hover:bg-primary/90 transition-colors"
          >
            Перейти в конструктор
          </Link>
        </div>
      )}
    </div>
  )
}

export default PublicPage
