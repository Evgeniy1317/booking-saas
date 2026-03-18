/**
 * Премиум-шаблон «Парикмахерская» — структура и стили на основе Hammer & Nails.
 * Хедер: прозрачный в самом верху (под видео hero), при скролле — тёмный фон; только текст ссылок без рамок и фона.
 */
import React, { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MapPin, ChevronLeft, ChevronRight, Instagram, Plus, X, Eye, EyeOff, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DEFAULT_WORLD_MAP_EMBED_URL } from '@/lib/hair-theme-defaults'
import barberHeaderBg from '@/assets/images/constructor-images/загруженное (2).jpg'
import worksDefault1 from '@/assets/images/constructor-images/998b104a5c45e39378ead8e9c3414675.jpg'
import worksDefault2 from '@/assets/images/constructor-images/orig (2).jpg'
import worksDefault3 from '@/assets/images/constructor-images/caa5a2c48f545f5610765afae36e9568.jpg'
import worksCarousel1 from '@/assets/images/constructor-images/pexels-maksgelatin-4663135.jpg'
import worksCarousel2 from '@/assets/images/constructor-images/pexels-maksgelatin-4663136.jpg'
import worksCarousel3 from '@/assets/images/constructor-images/pexels-thefullonmonet-28994396.jpg'
import serviceCardImage from '@/assets/images/premium-images/pexels-cottonbro-3993451.jpg'
import aboutSalon1 from '@/assets/images/constructor-images/pexels-cottonbro-3993118.jpg'
import aboutSalon2 from '@/assets/images/constructor-images/pexels-cottonbro-3993293.jpg'
import aboutSalon3 from '@/assets/images/constructor-images/pexels-cottonbro-3993308.jpg'

/** Стили из Dembrandt: фон страницы и хедера при скролле — чёрный #0b0b0b */
const PREMIUM_COLORS = {
  bg: '#0b0b0b',
  headerScrolledBg: '#0b0b0b',
  gold: '#e3c76c',
  goldHover: '#e7ce7f',
  white: '#ffffff',
  textMuted: 'rgba(255,255,255,0.85)',
} as const

const HEADER_SCROLL_THRESHOLD = 24

/** Фото для карусели блока «О салоне» */
const ABOUT_SALON_IMAGES = [aboutSalon1, aboutSalon2, aboutSalon3]
const ABOUT_SALON_AUTO_INTERVAL_MS = 10000

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

type PremiumLang = 'ru' | 'en' | 'ro'

/** Переводы всех UI-строк премиум-шаблона */
const PREMIUM_UI = {
  ru: {
    navAbout: 'О нас', navServices: 'Услуги', navAddress: 'Адрес', navWorks: 'Наши работы',
    whereToFind: 'Где нас найти', ourServices: 'Наши услуги',
    changePhoto: 'Сменить фото', addPhoto: 'Добавить фото', addProcedure: '+ Добавить процедуру', addCard: 'Добавить карточку',
    hideBlock: 'Скрыть блок', showBlock: 'Показать блок', upload: 'Загрузить', logo: 'Логотип',
    phHeroTitle: 'Заголовок hero (до 280 символов)', phSalonName: 'Название салона',
    phThemeName: 'Название тематики', phProcName: 'Название процедуры', phDesc: 'Описание',
    phSubtitle: 'Подзаголовок', phName: 'Название',
    phAboutTitle: 'Заголовок (до 100 символов)', phAboutDesc: 'Описание (до 400 символов)', phAboutThird: 'Третий текст (до 100 символов)',
    phWorksTitle: 'Заголовок (до 80 символов)', phWorksSub: 'Подзаголовок (до 80 символов)',
    phServicesTitle: 'Наши услуги', phServicesSub: 'Подзаголовок блока',
    phMapLeft: 'Адрес твоего салона', phMapRight: 'Город в котором твой салон находится',
    phCtaTitle: 'Готовы выглядеть лучше?', phCtaSub: 'Запишитесь на приём',
    phAddress: 'Адрес', phSchedule: 'График', phDayOff: 'Выходной', phPhone: 'Телефон', phEmail: 'Почта',
    prevPhoto: 'Предыдущее фото', nextPhoto: 'Следующее фото', photoN: 'Фото',
    clearTitle: 'Очистить название', deleteProcedure: 'Удалить процедуру', deleteCard: 'Удалить карточку',
    deleteLogo: 'Удалить логотип', deleteBlock: 'Удалить блок',
    deleteTelegram: 'Удалить Telegram', deleteViber: 'Удалить Viber', deleteInstagram: 'Удалить Instagram',
    deleteFacebook: 'Удалить Facebook', deleteWhatsapp: 'Удалить WhatsApp', deleteTwitter: 'Удалить Twitter', deleteTiktok: 'Удалить TikTok',
    map: 'Карта',
    defTagline: 'Премиум барбершоп и груминг для мужчин', defBook: 'Записаться',
    defHeroSub: 'Твой салон красоты', defHeroTitle: 'Стрижки, укладки\nи уход в одном месте', defContacts: 'Контакты',
    defAboutTitle: 'О салоне', defAboutDesc: 'Уютное пространство для стрижек, укладок и ухода. Качественный сервис и спокойная атмосфера — без суеты и очередей.', defAboutThird: 'Услуги для всей семьи',
    defWorksTitle: 'Наши работы', defWorksSub: 'Вы заслуживаете выглядеть лучше всех',
    defServicesTitle: 'Наши услуги', defServicesSub: 'Стрижки, уход и процедуры в уютной атмосфере, работаем с качественными средствами',
    defCtaTitle: 'Готовы выглядеть лучше?', defCtaSub: 'Запишитесь на приём',
    defMapLeft: 'Адрес твоего салона', defMapRight: 'Город в котором твой салон находится',
    defAddr: 'Город, улица, дом', defHours: 'Пн–Сб 9:00–21:00',
  },
  en: {
    navAbout: 'About', navServices: 'Services', navAddress: 'Address', navWorks: 'Our Works',
    whereToFind: 'Where to find us', ourServices: 'Our Services',
    changePhoto: 'Change photo', addPhoto: 'Add photo', addProcedure: '+ Add procedure', addCard: 'Add card',
    hideBlock: 'Hide block', showBlock: 'Show block', upload: 'Upload', logo: 'Logo',
    phHeroTitle: 'Hero title (up to 280 characters)', phSalonName: 'Salon name',
    phThemeName: 'Theme name', phProcName: 'Procedure name', phDesc: 'Description',
    phSubtitle: 'Subtitle', phName: 'Name',
    phAboutTitle: 'Title (up to 100 characters)', phAboutDesc: 'Description (up to 400 characters)', phAboutThird: 'Third text (up to 100 characters)',
    phWorksTitle: 'Title (up to 80 characters)', phWorksSub: 'Subtitle (up to 80 characters)',
    phServicesTitle: 'Our Services', phServicesSub: 'Section subtitle',
    phMapLeft: 'Your salon address', phMapRight: 'City where your salon is located',
    phCtaTitle: 'Ready to look better?', phCtaSub: 'Book an appointment',
    phAddress: 'Address', phSchedule: 'Schedule', phDayOff: 'Day off', phPhone: 'Phone', phEmail: 'Email',
    prevPhoto: 'Previous photo', nextPhoto: 'Next photo', photoN: 'Photo',
    clearTitle: 'Clear title', deleteProcedure: 'Delete procedure', deleteCard: 'Delete card',
    deleteLogo: 'Delete logo', deleteBlock: 'Delete block',
    deleteTelegram: 'Delete Telegram', deleteViber: 'Delete Viber', deleteInstagram: 'Delete Instagram',
    deleteFacebook: 'Delete Facebook', deleteWhatsapp: 'Delete WhatsApp', deleteTwitter: 'Delete Twitter', deleteTiktok: 'Delete TikTok',
    map: 'Map',
    defTagline: 'Premium barbershop & grooming for men', defBook: 'Book now',
    defHeroSub: 'Your beauty salon', defHeroTitle: 'Haircuts, styling\nand care in one place', defContacts: 'Contacts',
    defAboutTitle: 'About the salon', defAboutDesc: 'A cozy space for haircuts, styling and care. Quality service and a calm atmosphere — no rush, no queues.', defAboutThird: 'Services for the whole family',
    defWorksTitle: 'Our works', defWorksSub: 'You deserve to look your best',
    defServicesTitle: 'Our Services', defServicesSub: 'Haircuts, care and treatments in a cozy atmosphere, using high-quality products',
    defCtaTitle: 'Ready to look better?', defCtaSub: 'Book an appointment',
    defMapLeft: 'Your salon address', defMapRight: 'City where your salon is located',
    defAddr: 'City, street, building', defHours: 'Mon–Sat 9:00–21:00',
  },
  ro: {
    navAbout: 'Despre noi', navServices: 'Servicii', navAddress: 'Adresă', navWorks: 'Lucrările noastre',
    whereToFind: 'Unde ne găsiți', ourServices: 'Serviciile noastre',
    changePhoto: 'Schimbă foto', addPhoto: 'Adaugă foto', addProcedure: '+ Adaugă procedură', addCard: 'Adaugă card',
    hideBlock: 'Ascunde bloc', showBlock: 'Arată bloc', upload: 'Încarcă', logo: 'Logo',
    phHeroTitle: 'Titlu hero (max 280 caractere)', phSalonName: 'Numele salonului',
    phThemeName: 'Numele temei', phProcName: 'Numele procedurii', phDesc: 'Descriere',
    phSubtitle: 'Subtitlu', phName: 'Nume',
    phAboutTitle: 'Titlu (max 100 caractere)', phAboutDesc: 'Descriere (max 400 caractere)', phAboutThird: 'Text suplimentar (max 100 caractere)',
    phWorksTitle: 'Titlu (max 80 caractere)', phWorksSub: 'Subtitlu (max 80 caractere)',
    phServicesTitle: 'Serviciile noastre', phServicesSub: 'Subtitlu secțiune',
    phMapLeft: 'Adresa salonului tău', phMapRight: 'Orașul în care se află salonul',
    phCtaTitle: 'Ești gata să arăți mai bine?', phCtaSub: 'Programează-te',
    phAddress: 'Adresă', phSchedule: 'Program', phDayOff: 'Zi liberă', phPhone: 'Telefon', phEmail: 'Email',
    prevPhoto: 'Foto anterioară', nextPhoto: 'Foto următoare', photoN: 'Foto',
    clearTitle: 'Șterge titlu', deleteProcedure: 'Șterge procedura', deleteCard: 'Șterge cardul',
    deleteLogo: 'Șterge logo', deleteBlock: 'Șterge bloc',
    deleteTelegram: 'Șterge Telegram', deleteViber: 'Șterge Viber', deleteInstagram: 'Șterge Instagram',
    deleteFacebook: 'Șterge Facebook', deleteWhatsapp: 'Șterge WhatsApp', deleteTwitter: 'Șterge Twitter', deleteTiktok: 'Șterge TikTok',
    map: 'Hartă',
    defTagline: 'Barbershop premium și grooming pentru bărbați', defBook: 'Programează-te',
    defHeroSub: 'Salonul tău de frumusețe', defHeroTitle: 'Tunsori, coafuri\nși îngrijire într-un singur loc', defContacts: 'Contacte',
    defAboutTitle: 'Despre salon', defAboutDesc: 'Un spațiu confortabil pentru tunsori, coafuri și îngrijire. Servicii de calitate într-o atmosferă liniștită.', defAboutThird: 'Servicii pentru toată familia',
    defWorksTitle: 'Lucrările noastre', defWorksSub: 'Meritați să arătați cel mai bine',
    defServicesTitle: 'Serviciile noastre', defServicesSub: 'Tunsori, îngrijire și proceduri într-o atmosferă confortabilă, cu produse de calitate',
    defCtaTitle: 'Ești gata să arăți mai bine?', defCtaSub: 'Programează-te',
    defMapLeft: 'Adresa salonului tău', defMapRight: 'Orașul în care se află salonul',
    defAddr: 'Oraș, stradă, număr', defHours: 'Lun–Sâm 9:00–21:00',
  },
} as const

/** Ссылки хедера — зависят от языка */
function getHeaderLinks(lang: PremiumLang) {
  const ui = PREMIUM_UI[lang]
  return {
    left:  [{ label: ui.navAbout, href: '#about' }, { label: ui.navServices, href: '#services' }],
    right: [{ label: ui.navAddress, href: '#address' }, { label: ui.navWorks, href: '#gallery' }],
  }
}

/** Hero-заголовок с авто-высотой: рамка растягивается вместе с текстом, без скролла внутри */
function HeroTitleTextarea({
  value,
  onSave,
  color,
  maxLength,
  placeholder,
}: {
  value: string
  onSave: (v: string) => void
  color: string
  maxLength: number
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, 72)}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        const v = e.target.value
        if (v.length <= maxLength) onSave(v)
      }}
      maxLength={maxLength}
      rows={2}
      className="font-premium-hero-moonshiner mt-3 w-full max-w-2xl bg-transparent border border-white/40 text-3xl leading-tight uppercase sm:text-4xl md:text-5xl focus:border-white focus:outline-none resize-none overflow-hidden block min-h-[4.5rem]"
      style={{ color }}
      placeholder={placeholder}
    />
  )
}

/** Поле блока «О салоне» с авто-высотой: лимит символов, рамка растягивается, без скролла */
function AboutBlockField({
  value,
  onSave,
  color,
  maxLength,
  placeholder,
  className,
  minHeight = 48,
}: {
  value: string
  onSave: (v: string) => void
  color: string
  maxLength: number
  placeholder: string
  className: string
  minHeight?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`
  }, [value, minHeight])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => {
        const v = e.target.value
        if (v.length <= maxLength) onSave(v)
      }}
      maxLength={maxLength}
      rows={1}
      className={cn('w-full bg-transparent border border-white/40 text-center focus:border-white focus:outline-none resize-none overflow-hidden block', className)}
      style={{ color }}
      placeholder={placeholder}
    />
  )
}

/** Поле названия салона в футере с авто-высотой: без скролла, только нижняя граница */
function FooterTitleField({
  value,
  onSave,
  color,
  placeholder,
}: {
  value: string
  onSave: (v: string) => void
  color: string
  placeholder?: string
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, 44)}px`
  }, [value])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onSave(e.target.value)}
      rows={1}
      className="w-full min-w-0 bg-transparent border-b border-white/30 text-3xl md:text-4xl font-display font-semibold leading-tight focus:border-white focus:outline-none resize-none overflow-hidden break-words"
      style={{ color }}
      placeholder={placeholder}
    />
  )
}

/** Авто-растягивающееся поле — базовый компонент */
function AutoTextarea({
  value,
  onChange,
  className,
  style,
  placeholder,
  maxLength,
  minHeight = 32,
}: {
  value: string
  onChange: (v: string) => void
  className: string
  style?: React.CSSProperties
  placeholder?: string
  maxLength?: number
  minHeight?: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, minHeight)}px`
  }, [value, minHeight])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      rows={1}
      className={className}
      style={style}
      placeholder={placeholder}
    />
  )
}

function ServiceCardTitleTextarea({ value, onSave, color, placeholder }: { value: string; onSave: (v: string) => void; color?: string; placeholder?: string }) {
  return (
    <AutoTextarea value={value} onChange={onSave} maxLength={60} minHeight={28}
      className="flex-1 min-w-0 bg-transparent border-b border-white/30 text-lg font-bold uppercase focus:border-white focus:outline-none resize-none overflow-hidden text-center leading-snug break-words w-full"
      style={{ color, wordBreak: 'break-word' }} placeholder={placeholder} />
  )
}

function ServiceCardProcNameTextarea({ value, onSave, color, placeholder }: { value: string; onSave: (v: string) => void; color?: string; placeholder?: string }) {
  return (
    <AutoTextarea value={value} onChange={onSave} maxLength={80} minHeight={24}
      className="flex-1 min-w-0 bg-transparent border-b border-white/20 text-sm font-semibold focus:border-white focus:outline-none resize-none overflow-hidden text-center leading-snug break-words w-full"
      style={{ color, wordBreak: 'break-word' }} placeholder={placeholder} />
  )
}

function ServiceCardDescTextarea({ value, onSave, color, placeholder }: { value: string; onSave: (v: string) => void; color?: string; placeholder?: string }) {
  return (
    <AutoTextarea value={value} onChange={onSave} minHeight={44}
      className="mt-0.5 w-full bg-transparent border border-white/20 text-sm leading-relaxed focus:border-white focus:outline-none resize-none overflow-hidden block min-h-[2.75rem] text-center break-words"
      style={{ color: color || PREMIUM_COLORS.textMuted, wordBreak: 'break-word' }} placeholder={placeholder} />
  )
}

/** Одна карточка услуги: опциональное фото, обобщённое название тематики, список процедур (название + описание) */
export type ServiceCardItem = { name: string; desc: string }
export type ServiceCardData = { imageUrl?: string; title: string; items: ServiceCardItem[] }

const DEFAULT_SERVICE_CARDS_BY_LANG: Record<PremiumLang, ServiceCardData[]> = {
  ru: [
    { imageUrl: serviceCardImage, title: 'Стрижки и уход за кожей', items: [{ name: 'Классическая стрижка', desc: 'Идеальная стрижка для регулярного ухода. Включает мытьё головы, массаж кожи, горячее полотенце. (~30 мин)' }, { name: 'Премиум стрижка', desc: 'Расширенное время для сложных укладок и детальной отделки. Бритва, пена, массаж после бритья. (~45 мин)' }] },
    { imageUrl: serviceCardImage, title: 'Бритьё и борода', items: [{ name: 'Классическое бритьё', desc: 'Тёплая пена, опасная бритва, горячие и холодные полотенца с маслами. (~30 мин)' }, { name: 'Уход за бородой', desc: 'Коррекция формы, контур бритвой, горячие полотенца с лавандой, кондиционер и укладка. (~30 мин)' }] },
    { imageUrl: serviceCardImage, title: 'Руки и ноги', items: [{ name: 'Классический маникюр', desc: 'Ванночка, обработка ногтей, массаж рук и предплечий, горячее полотенце. (~30 мин)' }, { name: 'Классический педикюр', desc: 'Ванночка, уход за стопами, обработка ногтей, массаж ног и икр. (~30 мин)' }] },
    { imageUrl: serviceCardImage, title: 'Премиум процедуры', items: [{ name: 'Luxe уход за руками', desc: 'Лаванда и 24К золото, горячие камни, CBD-массаж. (~60 мин)' }, { name: 'Luxe уход за ногами', desc: '24К золото, массаж горячими камнями, парафин. (~60 мин)' }] },
    { imageUrl: serviceCardImage, title: 'Консультации и подбор', items: [{ name: 'Подбор образа', desc: 'Консультация по стилю, форме стрижки и уходу. Рекомендации по домашнему уходу. (~15 мин)' }] },
  ],
  en: [
    { imageUrl: serviceCardImage, title: 'Haircuts & Skin Care', items: [{ name: 'Classic Haircut', desc: 'A perfect haircut for regular grooming. Includes hair wash, scalp massage, hot towel. (~30 min)' }, { name: 'Premium Haircut', desc: 'Extended time for complex styles and detailed finishing. Razor, lather, post-shave massage. (~45 min)' }] },
    { imageUrl: serviceCardImage, title: 'Shaving & Beard', items: [{ name: 'Classic Shave', desc: 'Warm lather, straight razor, hot and cold towels with oils. (~30 min)' }, { name: 'Beard Grooming', desc: 'Shape correction, razor contour, hot lavender towels, conditioner and styling. (~30 min)' }] },
    { imageUrl: serviceCardImage, title: 'Hands & Feet', items: [{ name: 'Classic Manicure', desc: 'Soak, nail treatment, hand and forearm massage, hot towel. (~30 min)' }, { name: 'Classic Pedicure', desc: 'Soak, foot care, nail treatment, leg and calf massage. (~30 min)' }] },
    { imageUrl: serviceCardImage, title: 'Premium Treatments', items: [{ name: 'Luxe Hand Care', desc: 'Lavender and 24K gold, hot stones, CBD massage. (~60 min)' }, { name: 'Luxe Foot Care', desc: '24K gold, hot stone massage, paraffin. (~60 min)' }] },
    { imageUrl: serviceCardImage, title: 'Consultations', items: [{ name: 'Style Consultation', desc: 'Consultation on style, haircut shape and care. Home care recommendations. (~15 min)' }] },
  ],
  ro: [
    { imageUrl: serviceCardImage, title: 'Tunsori și îngrijire', items: [{ name: 'Tunsoare clasică', desc: 'Tunsoare perfectă pentru îngrijire regulată. Include spălare, masaj scalp, prosop cald. (~30 min)' }, { name: 'Tunsoare premium', desc: 'Timp extins pentru coafuri complexe și finisare detaliată. Brici, spumă, masaj post-ras. (~45 min)' }] },
    { imageUrl: serviceCardImage, title: 'Ras și barbă', items: [{ name: 'Ras clasic', desc: 'Spumă caldă, brici clasic, prosoape calde și reci cu uleiuri. (~30 min)' }, { name: 'Îngrijire barbă', desc: 'Corecție formă, contur cu brici, prosoape calde cu lavandă, balsam și coafare. (~30 min)' }] },
    { imageUrl: serviceCardImage, title: 'Mâini și picioare', items: [{ name: 'Manichiură clasică', desc: 'Baie, tratament unghii, masaj mâini și antebrațe, prosop cald. (~30 min)' }, { name: 'Pedichiură clasică', desc: 'Baie, îngrijire tălpi, tratament unghii, masaj picioare și gambe. (~30 min)' }] },
    { imageUrl: serviceCardImage, title: 'Tratamente premium', items: [{ name: 'Luxe îngrijire mâini', desc: 'Lavandă și aur 24K, pietre calde, masaj CBD. (~60 min)' }, { name: 'Luxe îngrijire picioare', desc: 'Aur 24K, masaj cu pietre calde, parafină. (~60 min)' }] },
    { imageUrl: serviceCardImage, title: 'Consultații', items: [{ name: 'Consultație stil', desc: 'Consultație privind stilul, forma tunsoarei și îngrijirea. Recomandări pentru acasă. (~15 min)' }] },
  ],
}
const DEFAULT_SERVICE_CARDS = DEFAULT_SERVICE_CARDS_BY_LANG.ru

export interface PremiumBarberTemplateProps {
  siteName: string
  /** Язык интерфейса */
  lang?: PremiumLang
  /** Отдельное название для футера (если не задано, используется siteName) */
  footerSiteName?: string
  tagline?: string
  onBookNow?: () => void
  bookLabel?: string
  footerAddress?: string
  footerPhone?: string
  footerHours?: string
  footerDayOff?: string
  footerEmail?: string
  footerLogo?: string | null
  footerLogoShape?: 'circle' | 'rounded' | 'square'
  footerLogoVisible?: boolean
  /** Видимость блоков контактов в футере (крестик скрывает блок) */
  footerVisibility?: { address: boolean; schedule: boolean; dayOff: boolean; phone: boolean; email: boolean }
  /** Видимость соцсетей (крестик очищает ссылку) */
  socialVisibility?: { telegram: boolean; viber: boolean; instagram: boolean; facebook: boolean; whatsapp: boolean; twitter: boolean; tiktok: boolean }
  /** Цвет главного названия в футере */
  footerTitleColor?: string
  /** Цвет текста контактов (адрес, график, телефон, почта) */
  footerTextColor?: string
  /** Цвет строки «Выходной» в футере */
  footerDayOffColor?: string
  telegramUrl?: string
  viberUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  whatsappUrl?: string
  twitterUrl?: string
  tiktokUrl?: string
  addressLabel?: string
  scheduleLabel?: string
  phoneLabel?: string
  emailLabel?: string
  /** URL для iframe карты (Google Maps embed, hl=en) из конструктора */
  mapEmbedUrl?: string
  /** URL видео для фона hero (если задан — показывается видео вместо картинки) */
  heroVideoUrl?: string | null
  /** URL картинки для фона hero (используется, если heroVideoUrl не задан) */
  heroImageUrl?: string | null
  /** Режим редактирования в превью: тексты можно править прямо на месте */
  isEditMode?: boolean
  /** Подзаголовок hero (золотая строка «Твой салон красоты») */
  heroSubtitle?: string
  /** Крупный заголовок hero («Стрижки, укладки…») */
  heroTitle?: string
  /** Текст кнопки «Контакты» */
  heroContactsLabel?: string
  /** Сохранить черновик при редактировании в превью */
  onSaveDraft?: (key: string, value: string) => void
  /** Акцентный цвет (золотой) — для кнопок, подзаголовка и т.д. */
  accentColor?: string
  /** Фон хедера при скролле */
  headerBgColor?: string
  /** Эффект свечения хедера при скролле (box-shadow) */
  headerBgGlow?: string
  /** Цвет ссылок в шапке (О нас, Услуги и т.д.) */
  headerNavColor?: string
  /** Цвет главного названия в шапке */
  headerTitleColor?: string
  /** Цвет первого заголовка в hero (подзаголовок) */
  heroSubtitleColor?: string
  /** Цвет второго заголовка в hero (крупный заголовок) */
  heroTitleColor?: string
  /** Цвет рамки первой кнопки (Контакты) */
  heroButton1BorderColor?: string
  /** Цвет рамки второй кнопки (Записаться онлайн) */
  heroButton2BorderColor?: string
  /** Свечение первой кнопки hero */
  heroButton1Glow?: string
  /** Свечение второй кнопки hero */
  heroButton2Glow?: string
  /** Блок «О салоне»: заголовок */
  aboutSectionTitle?: string
  /** Блок «О салоне»: описание */
  aboutSectionDescription?: string
  /** Блок «О салоне»: третий текст (например «Услуги для всей семьи») */
  aboutSectionThirdText?: string
  /** Цвет заголовка блока «О салоне» */
  aboutSectionTitleColor?: string
  /** Цвет описания блока «О салоне» */
  aboutSectionDescColor?: string
  /** Цвет третьего текста блока «О салоне» */
  aboutSectionThirdColor?: string
  /** Цвет рамки кнопки «Наши услуги» в блоке «О салоне» */
  aboutSectionButtonBorderColor?: string
  /** URL фото для карусели «О салоне» (до 10); если пусто — используются 3 дефолтных */
  aboutSalonPhotoUrls?: string[]
  /** Блок «Наши работы»: заголовок 1 */
  worksSectionTitle?: string
  /** Блок «Наши работы»: заголовок 2 (подзаголовок) */
  worksSectionSubtitle?: string
  /** Цвет заголовка 1 блока «Наши работы» */
  worksSectionTitleColor?: string
  /** Цвет заголовка 2 блока «Наши работы» */
  worksSectionSubtitleColor?: string
  /** URL фото для карусели «Наши работы» (до 10); если пусто — 3 дефолтных */
  worksPhotoUrls?: string[]
  /** Карточки блока «Наши услуги» (сохраняются как JSON в publicServiceCards) */
  serviceCards?: ServiceCardData[]
  /** Заголовок блока «Наши услуги» */
  servicesSectionTitle?: string
  /** Подзаголовок блока «Наши услуги» */
  servicesSectionSubtitle?: string
  /** Цвет заголовка блока «Наши услуги» */
  servicesTitleColor?: string
  /** Цвет подзаголовка блока «Наши услуги» */
  servicesSubtitleColor?: string
  /** Цвет названия тематики карточек */
  servicesCardTitleColor?: string
  /** Цвет названия процедур в карточках */
  servicesProcNameColor?: string
  /** Цвет описания процедур в карточках */
  servicesProcDescColor?: string
  /** Скрыть все фото на карточках услуг */
  servicesPhotosHidden?: boolean
  /** Видимость CTA-блока «Готовы выглядеть лучше?» */
  ctaBlockVisible?: boolean
  /** Заголовок CTA-блока */
  ctaTitle?: string
  /** Подзаголовок CTA-блока */
  ctaSubtitle?: string
  /** Цвет иконки-звезды в CTA */
  ctaSparkleColor?: string
  /** Цвет заголовка 1 в CTA */
  ctaTitleColor?: string
  /** Цвет заголовка 2 (подзаголовок) в CTA */
  ctaSubtitleColor?: string
  /** Цвет рамки кнопки в CTA */
  ctaButtonBorderColor?: string
  /** Левая подпись над картой («Адрес твоего салона») */
  mapLabelLeft?: string
  /** Правая подпись над картой («Город в котором твой салон находится») */
  mapLabelRight?: string
  /** Цвет подписей над картой */
  mapLabelColor?: string
  /** Refs для секций — используются конструктором для подсветки активного блока */
  sectionRefs?: {
    header?: React.RefObject<HTMLElement | null>
    gallery?: React.RefObject<HTMLElement | null>
    booking?: React.RefObject<HTMLElement | null>
    works?: React.RefObject<HTMLElement | null>
    map?: React.RefObject<HTMLDivElement | null>
    cta?: React.RefObject<HTMLDivElement | null>
    footer?: React.RefObject<HTMLElement | null>
  }
}

export default function PremiumBarberTemplate(props: PremiumBarberTemplateProps) {
  const lang = props.lang ?? 'ru'
  const ui = PREMIUM_UI[lang] ?? PREMIUM_UI.ru
  const {
    siteName,
    footerSiteName,
    onBookNow,
    footerLogo = null,
    footerLogoShape = 'circle',
    footerLogoVisible = true,
    footerVisibility,
    socialVisibility,
    footerTitleColor,
    footerTextColor,
    footerDayOffColor,
    telegramUrl = '',
    viberUrl = '',
    instagramUrl = '',
    facebookUrl = '',
    whatsappUrl = '',
    twitterUrl = '',
    tiktokUrl = '',
    mapEmbedUrl,
    heroVideoUrl = null,
    heroImageUrl = null,
    isEditMode = false,
    onSaveDraft,
    accentColor,
    headerBgColor,
    headerBgGlow,
    headerNavColor,
    headerTitleColor,
    heroSubtitleColor,
    heroTitleColor,
    heroButton1BorderColor,
    heroButton2BorderColor,
    heroButton1Glow,
    heroButton2Glow,
    aboutSectionTitleColor,
    aboutSectionDescColor,
    aboutSectionThirdColor,
    aboutSectionButtonBorderColor,
    aboutSalonPhotoUrls,
    worksSectionTitleColor,
    worksSectionSubtitleColor,
    worksPhotoUrls,
    serviceCards,
    servicesTitleColor,
    servicesSubtitleColor,
    servicesCardTitleColor,
    servicesProcNameColor,
    servicesProcDescColor,
    servicesPhotosHidden = false,
    ctaBlockVisible = true,
    ctaSparkleColor,
    ctaTitleColor,
    ctaSubtitleColor,
    ctaButtonBorderColor,
    mapLabelColor,
    sectionRefs,
    footerPhone = '+373 22 123 456',
    footerDayOff,
    footerEmail,
  } = props
  const tagline = props.tagline ?? ui.defTagline
  const bookLabel = props.bookLabel ?? ui.defBook
  const footerAddress = props.footerAddress ?? ui.defAddr
  const footerHours = props.footerHours ?? ui.defHours
  const addressLabel = props.addressLabel ?? ui.phAddress.toUpperCase()
  const scheduleLabel = props.scheduleLabel ?? ui.phSchedule.toUpperCase()
  const phoneLabel = props.phoneLabel ?? ui.phPhone.toUpperCase()
  const emailLabel = props.emailLabel ?? ui.phEmail.toUpperCase()
  const heroSubtitle = props.heroSubtitle ?? ui.defHeroSub
  const heroTitle = props.heroTitle ?? ui.defHeroTitle
  const heroContactsLabel = props.heroContactsLabel ?? ui.defContacts
  const aboutSectionTitle = props.aboutSectionTitle ?? ui.defAboutTitle
  const aboutSectionDescription = props.aboutSectionDescription ?? ui.defAboutDesc
  const aboutSectionThirdText = props.aboutSectionThirdText ?? ui.defAboutThird
  const worksSectionTitle = props.worksSectionTitle ?? ui.defWorksTitle
  const worksSectionSubtitle = props.worksSectionSubtitle ?? ui.defWorksSub
  const servicesSectionTitle = props.servicesSectionTitle ?? ui.defServicesTitle
  const servicesSectionSubtitle = props.servicesSectionSubtitle ?? ui.defServicesSub
  const ctaTitle = props.ctaTitle ?? ui.defCtaTitle
  const ctaSubtitle = props.ctaSubtitle ?? ui.defCtaSub
  const mapLabelLeft = props.mapLabelLeft ?? ui.defMapLeft
  const mapLabelRight = props.mapLabelRight ?? ui.defMapRight
  const headerLinks = getHeaderLinks(lang)
  const heroBgImage = heroImageUrl || barberHeaderBg
  const gold = accentColor || PREMIUM_COLORS.gold
  const aboutPhotos = (aboutSalonPhotoUrls && aboutSalonPhotoUrls.length > 0) ? aboutSalonPhotoUrls : ABOUT_SALON_IMAGES
  const galleryImages = (worksPhotoUrls && worksPhotoUrls.length > 0) ? worksPhotoUrls : [worksCarousel1, worksCarousel2, worksCarousel3]
  const galleryLen = galleryImages.length
  const headerBg = headerBgColor || PREMIUM_COLORS.headerScrolledBg
  const headerShadow = headerBgGlow || '0 6px 20px rgba(255,255,255,0.06)'
  const navColor = headerNavColor || PREMIUM_COLORS.white
  const titleColor = headerTitleColor || PREMIUM_COLORS.white
  const heroSubtitleC = heroSubtitleColor || gold
  const heroTitleC = heroTitleColor || PREMIUM_COLORS.white
  const btn1Border = heroButton1BorderColor || 'rgba(255,255,255,0.6)'
  const btn2Border = heroButton2BorderColor || gold
  const defaultMapUrl = DEFAULT_WORLD_MAP_EMBED_URL
  const mapUrl = mapEmbedUrl || defaultMapUrl
  const footerVis = footerVisibility ?? { address: true, schedule: true, dayOff: true, phone: true, email: true }
  const socialVis = socialVisibility ?? { telegram: true, viber: true, instagram: true, facebook: true, whatsapp: true, twitter: true, tiktok: true }
  const footerTextC = footerTextColor ?? PREMIUM_COLORS.white
  const footerDayOffC = footerDayOffColor ?? gold
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [aboutCarouselIndex, setAboutCarouselIndex] = useState(0)
  const [aboutCarouselHover, setAboutCarouselHover] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setHeaderScrolled(window.scrollY > HEADER_SCROLL_THRESHOLD)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const len = aboutPhotos.length
    if (len === 0) return
    const t = setInterval(() => {
      setAboutCarouselIndex((i) => (i + 1) % len)
    }, ABOUT_SALON_AUTO_INTERVAL_MS)
    return () => clearInterval(t)
  }, [aboutPhotos.length])

  const scrollToSection = (href: string) => {
    const id = href.startsWith('#') ? href.slice(1) : href
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-white overflow-x-hidden font-premium-barber">
      {/* Header: закреплённый; в самом верху — полностью прозрачный, только текст ссылок; при скролле — тёмный фон */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 w-full transition-[background-color,border-color,box-shadow] duration-300',
          headerScrolled ? 'border-b border-white/10' : 'border-b border-transparent'
        )}
        style={{
          backgroundColor: headerScrolled ? headerBg : 'transparent',
          boxShadow: headerScrolled ? headerShadow : 'none',
        }}
      >
        <div className="mx-auto flex min-h-14 sm:min-h-16 w-full max-w-[100%] items-center justify-evenly gap-6 sm:gap-10 px-3 sm:px-8 py-2">
          {headerLinks.left.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(href)
              }}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider hover:opacity-80 transition shrink-0 cursor-pointer"
              style={{ color: navColor }}
            >
              {label}
            </a>
          ))}
          <div
            className="font-premium-header-name text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-widest text-center shrink-0 whitespace-normal min-w-[14rem] sm:min-w-[18rem] md:min-w-[22rem] leading-tight"
            style={isEditMode && onSaveDraft ? { minWidth: `max(14rem, ${Math.min(42, Math.max(16, (siteName?.length || 0) + 3))}ch)` } : undefined}
          >
            {isEditMode && onSaveDraft ? (
              <input
                type="text"
                value={siteName}
                onChange={(e) => onSaveDraft('publicName', e.target.value)}
                className="w-full min-w-0 bg-transparent border border-transparent rounded text-center focus:outline-none focus:ring-0 focus:border-white/30 text-2xl sm:text-3xl md:text-4xl font-extrabold"
                style={{ minWidth: `${Math.min(42, Math.max(16, (siteName?.length || 0) + 3))}ch`, color: titleColor }}
                placeholder={ui.phName}
              />
            ) : (
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="bg-transparent border border-transparent rounded p-0 cursor-pointer text-inherit font-inherit tracking-inherit hover:opacity-90 transition-opacity focus:outline-none focus:ring-0 focus:border-transparent"
                style={{ color: titleColor }}
              >
                {siteName}
              </button>
            )}
          </div>
          {headerLinks.right.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(href)
              }}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider hover:opacity-80 transition shrink-0 cursor-pointer"
              style={{ color: navColor }}
            >
              {label}
            </a>
          ))}
        </div>
      </header>

      {/* Hero — видео или картинка (любой размер), поверх затемнение */}
      <section
        ref={sectionRefs?.header as React.RefObject<HTMLElement> | undefined}
        className={cn(
          'relative flex min-h-[100vh] min-h-[100dvh] flex-col justify-end bg-cover bg-center bg-no-repeat px-4 pb-16 sm:pb-24 md:pb-32',
          isEditMode ? 'overflow-visible' : 'overflow-hidden'
        )}
        style={!heroVideoUrl ? { backgroundImage: `url(${heroBgImage})` } : undefined}
      >
        {heroVideoUrl ? (
          <video
            src={heroVideoUrl}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
            aria-hidden
          />
        ) : null}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 w-full max-w-2xl text-left pl-5 sm:pl-10 md:pl-16 lg:pl-24">
          {isEditMode && onSaveDraft ? (
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => onSaveDraft('publicPremiumHeroSubtitle', e.target.value)}
              className="font-premium-hero-tagline w-full max-w-md bg-transparent border-b border-white/40 text-sm sm:text-base uppercase tracking-[0.2em] focus:border-white focus:outline-none"
              style={{ color: heroSubtitleC }}
              placeholder={ui.phSubtitle}
            />
          ) : (
            <p
              className="font-premium-hero-tagline text-sm sm:text-base uppercase tracking-[0.2em]"
              style={{ color: heroSubtitleC }}
            >
              {heroSubtitle}
            </p>
          )}
          {isEditMode && onSaveDraft ? (
            <HeroTitleTextarea
              value={heroTitle ?? ''}
              onSave={(v) => onSaveDraft('publicPremiumHeroTitle', v)}
              color={heroTitleC}
              maxLength={280}
              placeholder={ui.phHeroTitle}
            />
          ) : (
            <p className="font-premium-hero-moonshiner mt-3 text-3xl leading-tight uppercase sm:text-4xl md:text-5xl" style={{ color: heroTitleC }}>
              {String(heroTitle ?? '').split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
            <Button
              variant="outline"
              className="rounded-none border-2 bg-transparent font-semibold uppercase tracking-wider text-white hover:bg-white/10 font-premium-barber"
              style={{ borderColor: btn1Border, color: 'white', boxShadow: heroButton1Glow || undefined }}
              onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {heroContactsLabel}
            </Button>
            <button
              type="button"
              onClick={onBookNow}
              className="inline-flex items-center justify-center rounded-none border px-6 py-3 font-bold uppercase tracking-wider text-white transition-all duration-300 hover:opacity-90 font-premium-barber"
              style={{
                borderWidth: '1px',
                borderColor: btn2Border,
                backgroundColor: 'transparent',
                boxShadow: heroButton2Glow || undefined,
              }}
            >
              {bookLabel}
            </button>
          </div>
        </div>
      </section>

      {/* О нас — блок «О салоне»: карусель фото (до 10), точки при наведении, стрелки, авто-переключение */}
      <section id="about" ref={sectionRefs?.gallery as React.RefObject<HTMLElement> | undefined} className="grid grid-cols-1 gap-0 md:grid-cols-2">
        <div
          className="relative min-h-[400px] md:min-h-[500px] overflow-hidden bg-[#0b0b0b]"
          onMouseEnter={() => setAboutCarouselHover(true)}
          onMouseLeave={() => setAboutCarouselHover(false)}
        >
          {aboutPhotos.map((src, i) => (
            <div
              key={i}
              className={cn(
                'absolute inset-0 bg-cover bg-center transition-opacity duration-500',
                i === aboutCarouselIndex ? 'opacity-100 z-0' : 'opacity-0 z-0 pointer-events-none'
              )}
              style={{ backgroundImage: `url(${src})` }}
            />
          ))}
          {/* Стрелки — видны при наведении */}
          {aboutCarouselHover && aboutPhotos.length > 0 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setAboutCarouselIndex((i) => (i - 1 + aboutPhotos.length) % aboutPhotos.length)
                }}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-black/40 text-white transition hover:bg-black/70"
                style={{ borderColor: gold }}
                aria-label={ui.prevPhoto}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setAboutCarouselIndex((i) => (i + 1) % aboutPhotos.length)
                }}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-black/40 text-white transition hover:bg-black/70"
                style={{ borderColor: gold }}
                aria-label={ui.nextPhoto}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              {/* Точки внизу — при наведении */}
              <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
                {aboutPhotos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setAboutCarouselIndex(i)
                    }}
                    className={cn(
                      'h-2.5 w-2.5 rounded-full border-2 transition-all',
                      i === aboutCarouselIndex
                        ? 'bg-white border-white scale-125'
                        : 'bg-transparent border-white/70 hover:border-white'
                    )}
                    style={i === aboutCarouselIndex ? {} : { borderColor: 'rgba(255,255,255,0.7)' }}
                    aria-label={`${ui.photoN} ${i + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
        <div
          className="flex flex-col items-center justify-center bg-[#0b0b0b] px-6 py-16 text-center md:px-12 md:py-24"
          style={{ backgroundColor: PREMIUM_COLORS.bg }}
        >
          {isEditMode && onSaveDraft ? (
            <AboutBlockField
              value={aboutSectionTitle}
              onSave={(v) => onSaveDraft('publicAboutSalonTitle', v)}
              color={aboutSectionTitleColor ?? PREMIUM_COLORS.white}
              maxLength={100}
              placeholder={ui.phAboutTitle}
              className="font-services-broken max-w-md text-3xl uppercase leading-tight tracking-wide sm:text-4xl md:text-5xl lg:text-6xl"
              minHeight={56}
            />
          ) : (
            <h2 className="font-services-broken text-3xl uppercase leading-tight tracking-wide sm:text-4xl md:text-5xl lg:text-6xl" style={{ color: aboutSectionTitleColor ?? PREMIUM_COLORS.white }}>
              {String(aboutSectionTitle ?? '').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </h2>
          )}
          {isEditMode && onSaveDraft ? (
            <AboutBlockField
              value={aboutSectionDescription}
              onSave={(v) => onSaveDraft('publicAboutSalonDescription', v)}
              color={aboutSectionDescColor ?? PREMIUM_COLORS.textMuted}
              maxLength={400}
              placeholder={ui.phAboutDesc}
              className="mt-6 max-w-xl text-lg font-medium leading-relaxed sm:text-xl"
              minHeight={72}
            />
          ) : (
            <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed sm:text-xl text-center" style={{ color: aboutSectionDescColor ?? PREMIUM_COLORS.textMuted }}>
              {String(aboutSectionDescription ?? '').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </p>
          )}
          {isEditMode && onSaveDraft ? (
            <AboutBlockField
              value={aboutSectionThirdText}
              onSave={(v) => onSaveDraft('publicAboutSalonThirdText', v)}
              color={aboutSectionThirdColor ?? gold}
              maxLength={100}
              placeholder={ui.phAboutThird}
              className="mt-4 max-w-md text-xl font-bold uppercase sm:text-2xl"
              minHeight={44}
            />
          ) : (
            <p className="mt-4 text-xl font-bold uppercase sm:text-2xl" style={{ color: aboutSectionThirdColor ?? gold }}>
              {String(aboutSectionThirdText ?? '').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </p>
          )}
          <Button
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 rounded-lg border-2 px-8 py-4 text-lg font-bold uppercase tracking-wider sm:px-10 sm:py-5 sm:text-xl"
            style={{
              borderColor: aboutSectionButtonBorderColor ?? gold,
              color: PREMIUM_COLORS.white,
              background: 'transparent',
            }}
          >
            {ui.ourServices}
          </Button>
        </div>
      </section>

      {/* Наши работы — циклическая галерея, по центру фото крупнее, стрелки в кружочках */}
      <section id="gallery" ref={sectionRefs?.booking as React.RefObject<HTMLElement> | undefined} className="bg-[#0b0b0b] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          {isEditMode && onSaveDraft ? (
            <AboutBlockField
              value={worksSectionTitle}
              onSave={(v) => onSaveDraft('publicWorksTitle', v)}
              color={worksSectionTitleColor ?? PREMIUM_COLORS.white}
              maxLength={80}
              placeholder={ui.phWorksTitle}
              className="font-services-broken mx-auto max-w-2xl text-3xl uppercase leading-tight tracking-wide sm:text-4xl md:text-5xl lg:text-6xl"
              minHeight={52}
            />
          ) : (
            <h2 className="font-services-broken text-3xl uppercase leading-tight tracking-wide sm:text-4xl md:text-5xl lg:text-6xl" style={{ color: worksSectionTitleColor ?? PREMIUM_COLORS.white }}>
              {String(worksSectionTitle ?? '').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </h2>
          )}
          {isEditMode && onSaveDraft ? (
            <AboutBlockField
              value={worksSectionSubtitle}
              onSave={(v) => onSaveDraft('publicWorksSubtitle', v)}
              color={worksSectionSubtitleColor ?? gold}
              maxLength={80}
              placeholder={ui.phWorksSub}
              className="mt-3 mx-auto max-w-2xl text-xl font-semibold uppercase tracking-wider sm:text-2xl md:text-3xl"
              minHeight={40}
            />
          ) : (
            <p className="mt-3 text-xl font-semibold uppercase tracking-wider sm:text-2xl md:text-3xl" style={{ color: worksSectionSubtitleColor ?? gold }}>
              {String(worksSectionSubtitle ?? '').split('\n').map((line, i) => (
                <span key={i}>{i > 0 && <br />}{line}</span>
              ))}
            </p>
          )}
          <div className="mt-10 flex items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => setGalleryIndex((galleryIndex - 1 + galleryLen) % galleryLen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition hover:bg-white/10"
              style={{ borderColor: gold }}
              aria-label={ui.prevPhoto}
            >
              <ChevronLeft className="h-5 w-5 text-white" />
            </button>
            <div className="flex h-[420px] items-center justify-center gap-4 sm:h-[520px] sm:gap-6" style={{ minWidth: 640 }}>
              <div className="h-60 w-36 shrink-0 overflow-hidden rounded-lg bg-gray-800 sm:h-72 sm:w-44">
                <div key={(galleryIndex - 1 + galleryLen) % galleryLen} className="gallery-photo-fade-in h-full w-full">
                  <img
                    src={galleryImages[(galleryIndex - 1 + galleryLen) % galleryLen]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="h-full w-96 shrink-0 overflow-hidden rounded-lg bg-gray-800 sm:w-[28rem] md:w-[32rem]">
                <div key={galleryIndex} className="gallery-photo-fade-in h-full w-full">
                  <img
                    src={galleryImages[galleryIndex]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
              <div className="h-60 w-36 shrink-0 overflow-hidden rounded-lg bg-gray-800 sm:h-72 sm:w-44">
                <div key={(galleryIndex + 1) % galleryLen} className="gallery-photo-fade-in h-full w-full">
                  <img
                    src={galleryImages[(galleryIndex + 1) % galleryLen]}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setGalleryIndex((galleryIndex + 1) % galleryLen)}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 transition hover:bg-white/10"
              style={{ borderColor: gold }}
              aria-label={ui.nextPhoto}
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Наши услуги — 5 карточек в ряд, редактирование в превью, можно добавлять карточки */}
      <section id="services" ref={sectionRefs?.works as React.RefObject<HTMLElement> | undefined} className="border-t border-white/10 bg-[#0b0b0b] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-[1600px] text-center">
          {isEditMode && onSaveDraft ? (
            <AutoTextarea
              value={servicesSectionTitle}
              onChange={(v) => onSaveDraft('publicServicesSectionTitle', v)}
              minHeight={48}
              className="w-full bg-transparent border-b border-white/20 text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-services-broken uppercase tracking-wide focus:border-white/50 focus:outline-none resize-none overflow-hidden leading-tight"
              style={{ color: servicesTitleColor || PREMIUM_COLORS.white }}
              placeholder={ui.phServicesTitle}
            />
          ) : (
            <h2 className="font-services-broken text-2xl uppercase tracking-wide whitespace-pre-line sm:text-3xl md:text-4xl lg:text-5xl" style={{ color: servicesTitleColor || PREMIUM_COLORS.white }}>
              {servicesSectionTitle}
            </h2>
          )}
          {isEditMode && onSaveDraft ? (
            <AutoTextarea
              value={servicesSectionSubtitle}
              onChange={(v) => onSaveDraft('publicServicesSectionSubtitle', v)}
              minHeight={44}
              className="mx-auto mt-4 block w-full max-w-4xl bg-transparent border-b border-white/20 text-center text-base focus:border-white/50 focus:outline-none resize-none overflow-hidden"
              style={{ color: servicesSubtitleColor || gold }}
              placeholder={ui.phServicesSub}
            />
          ) : (
            <p className="mx-auto mt-4 max-w-4xl text-base whitespace-pre-line" style={{ color: servicesSubtitleColor || gold }}>
              {servicesSectionSubtitle}
            </p>
          )}
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            {(() => {
              const langCards = DEFAULT_SERVICE_CARDS_BY_LANG[lang] ?? DEFAULT_SERVICE_CARDS
              const source = serviceCards ?? langCards
              const cards: ServiceCardData[] = source.length > 0 ? source : langCards
              return cards.map((card, cardIndex) => {
                const updateCards = (next: ServiceCardData[]) => onSaveDraft?.('publicServiceCards', JSON.stringify(next))
                const showImage = !servicesPhotosHidden && Boolean(card.imageUrl && card.imageUrl.length > 0)
                return (
                  <div
                    key={cardIndex}
                    className="frame-wood-dark bg-[#0f0f0f] p-0 flex flex-col w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(20%-1.2rem)] min-w-[180px] relative"
                  >
                    {isEditMode && onSaveDraft && cards.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = cards.filter((_, i) => i !== cardIndex)
                          updateCards(next)
                        }}
                        className="absolute -top-2 -right-2 z-20 h-7 w-7 rounded-full bg-red-600 text-white flex items-center justify-center hover:bg-red-700 shadow-lg border-2 border-black"
                        aria-label={ui.deleteCard}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    {showImage ? (
                      <div className="relative h-28 w-full shrink-0 bg-gray-800 sm:h-32 overflow-hidden">
                        <img src={card.imageUrl!} alt="" className="h-full w-full object-cover" />
                        {isEditMode && onSaveDraft && (
                          <label className="absolute bottom-1 right-1 px-2 py-1 rounded bg-black/60 text-white text-xs cursor-pointer hover:bg-black/80">
                            {ui.changePhoto}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const url = typeof reader.result === 'string' ? reader.result : ''
                                  if (url) {
                                    const next = cards.map((c, i) => i === cardIndex ? { ...c, imageUrl: url } : c)
                                    updateCards(next)
                                  }
                                  e.target.value = ''
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                          </label>
                        )}
                      </div>
                    ) : isEditMode && onSaveDraft && !servicesPhotosHidden ? (
                      <label className="h-28 w-full shrink-0 bg-gray-800/50 sm:h-32 flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed border-white/30 hover:border-white/50">
                        <Plus className="h-8 w-8 text-white/60" />
                        <span className="text-xs text-white/70">{ui.addPhoto}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => {
                              const url = typeof reader.result === 'string' ? reader.result : ''
                              if (url) {
                                const next = cards.map((c, i) => i === cardIndex ? { ...c, imageUrl: url } : c)
                                updateCards(next)
                              }
                              e.target.value = ''
                            }
                            reader.readAsDataURL(file)
                          }}
                        />
                      </label>
                    ) : null}
                    <div className="p-4 flex-1 flex flex-col items-center text-center min-w-0 overflow-hidden">
                      {isEditMode && onSaveDraft ? (
                        <>
                          <div className="w-full flex items-start justify-center gap-1 mb-3">
                            <ServiceCardTitleTextarea
                              value={card.title}
                              color={servicesCardTitleColor || gold}
                              onSave={(v) => {
                                const next = cards.map((c, i) => i === cardIndex ? { ...c, title: v } : c)
                                updateCards(next)
                              }}
                              placeholder={ui.phThemeName}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = cards.map((c, i) => i === cardIndex ? { ...c, title: '' } : c)
                                updateCards(next)
                              }}
                              className="h-7 w-7 shrink-0 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500"
                              aria-label={ui.clearTitle}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <ul className="w-full mt-2 space-y-3">
                            {card.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="space-y-1 flex flex-col items-center">
                                <div className="w-full flex items-start gap-1">
                                  <ServiceCardProcNameTextarea
                                    value={item.name}
                                    color={servicesProcNameColor || PREMIUM_COLORS.white}
                                    onSave={(v) => {
                                      const next = cards.map((c, i) =>
                                        i === cardIndex
                                          ? { ...c, items: c.items.map((it, j) => j === itemIndex ? { ...it, name: v } : it) }
                                          : c
                                      )
                                      updateCards(next)
                                    }}
                                    placeholder={ui.phProcName}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const next = cards.map((c, i) =>
                                        i === cardIndex ? { ...c, items: c.items.filter((_, j) => j !== itemIndex) } : c
                                      )
                                      updateCards(next)
                                    }}
                                    className="h-6 w-6 shrink-0 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500"
                                    aria-label={ui.deleteProcedure}
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="w-full">
                                  <ServiceCardDescTextarea
                                    value={item.desc}
                                    color={servicesProcDescColor}
                                    onSave={(v) => {
                                      const next = cards.map((c, i) =>
                                        i === cardIndex
                                          ? { ...c, items: c.items.map((it, j) => j === itemIndex ? { ...it, desc: v } : it) }
                                          : c
                                      )
                                      updateCards(next)
                                    }}
                                    placeholder={ui.phDesc}
                                  />
                                </div>
                              </li>
                            ))}
                            {card.items.length < 10 && (
                              <li>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const next = cards.map((c, i) =>
                                      i === cardIndex ? { ...c, items: [...c.items, { name: '', desc: '' }] } : c
                                    )
                                    updateCards(next)
                                  }}
                                  className="text-sm flex items-center gap-1 text-white/70 hover:text-white mx-auto"
                                >
                                  <Plus className="h-4 w-4" /> {ui.addProcedure}
                                </button>
                              </li>
                            )}
                          </ul>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold uppercase whitespace-pre-line break-words w-full" style={{ color: servicesCardTitleColor || gold }}>
                            {card.title}
                          </h3>
                          <ul className="mt-3 space-y-4 w-full">
                            {card.items.map((item, idx) => (
                              <li key={idx} className="text-center">
                                <p className="font-semibold text-sm whitespace-pre-line break-words" style={{ color: servicesProcNameColor || PREMIUM_COLORS.white }}>{item.name}</p>
                                <p className="mt-1 text-sm leading-relaxed whitespace-pre-line break-words" style={{ color: servicesProcDescColor || PREMIUM_COLORS.textMuted }}>
                                  {item.desc}
                                </p>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            })()}
            {isEditMode && onSaveDraft && (() => {
              const langCards = DEFAULT_SERVICE_CARDS_BY_LANG[lang] ?? DEFAULT_SERVICE_CARDS
              const source = serviceCards ?? langCards
              const cards: ServiceCardData[] = source.length > 0 ? source : langCards
              if (cards.length >= 5) return null
              return (
                <button
                  type="button"
                  onClick={() => {
                    const next = [...cards, { title: '', items: [{ name: '', desc: '' }] }]
                    onSaveDraft('publicServiceCards', JSON.stringify(next))
                  }}
                  className="frame-wood-dark bg-[#0f0f0f] w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(20%-1.2rem)] min-w-[180px] min-h-[200px] flex flex-col items-center justify-center gap-2 border-2 border-dashed border-white/20 hover:border-white/40 transition-colors cursor-pointer"
                >
                  <Plus className="h-10 w-10 text-white/40" />
                  <span className="text-sm text-white/50 font-medium">{ui.addCard}</span>
                </button>
              )
            })()}
          </div>
        </div>
      </section>

      {/* Локация — карта и адрес в стиле сайта */}
      <section id="address" ref={sectionRefs?.map as unknown as React.RefObject<HTMLElement> | undefined} className="border-t border-white/10 bg-[#0b0b0b] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-services-broken text-2xl uppercase tracking-wide text-white sm:text-3xl md:text-4xl">
            {ui.whereToFind}
          </h2>
          <div className="mt-6 flex w-full items-center justify-between gap-4 text-xs font-bold sm:text-sm">
            {isEditMode && onSaveDraft ? (
              <input
                type="text"
                value={mapLabelLeft}
                onChange={(e) => onSaveDraft('publicMapLabelLeft', e.target.value)}
                className="min-w-0 flex-1 bg-transparent border-b border-white/20 focus:border-white/50 focus:outline-none text-xs sm:text-sm font-bold text-left"
                style={{ color: mapLabelColor || gold }}
                placeholder={ui.phMapLeft}
              />
            ) : (
              <span className="min-w-0 flex-1 text-left" style={{ color: mapLabelColor || gold }}>{mapLabelLeft}</span>
            )}
            {isEditMode && onSaveDraft ? (
              <input
                type="text"
                value={mapLabelRight}
                onChange={(e) => onSaveDraft('publicMapLabelRight', e.target.value)}
                className="min-w-0 flex-1 bg-transparent border-b border-white/20 focus:border-white/50 focus:outline-none text-xs sm:text-sm font-bold text-right"
                style={{ color: mapLabelColor || gold }}
                placeholder={ui.phMapRight}
              />
            ) : (
              <span className="min-w-0 flex-1 text-right" style={{ color: mapLabelColor || gold }}>{mapLabelRight}</span>
            )}
          </div>
          <div className="mt-4 w-full overflow-hidden rounded-xl border-2" style={{ borderColor: 'rgba(227,199,108,0.3)' }}>
            <iframe
              title={ui.map}
              src={mapUrl}
              width="100%"
              height="320"
              style={{ border: 0, display: 'block' }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* CTA block — якорь для кнопки «Записаться», под блоком с картой */}
      {(ctaBlockVisible || isEditMode) && (
      <section
        id="booking"
        ref={sectionRefs?.cta as unknown as React.RefObject<HTMLElement> | undefined}
        className={cn(
          'relative overflow-hidden px-4 py-20 sm:py-28',
          !ctaBlockVisible && isEditMode && 'opacity-40'
        )}
        style={{ background: '#0b0b0b' }}
      >
        {/* Decorative background */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${ctaSparkleColor || gold}08, transparent 70%)` }} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ctaSparkleColor || gold}30, transparent)` }} />
          <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ctaSparkleColor || gold}30, transparent)` }} />
        </div>

        {/* Hide/show button — only in edit mode */}
        {isEditMode && onSaveDraft && (
          <button
            type="button"
            onClick={() => onSaveDraft('publicCtaBlockVisible', ctaBlockVisible ? '0' : '1')}
            className={cn(
              'absolute top-3 right-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-lg',
              ctaBlockVisible
                ? 'bg-red-500/90 text-white hover:bg-red-600'
                : 'bg-emerald-500/90 text-white hover:bg-emerald-600'
            )}
          >
            {ctaBlockVisible ? (
              <><EyeOff className="h-3.5 w-3.5" /> {ui.hideBlock}</>
            ) : (
              <><Eye className="h-3.5 w-3.5" /> {ui.showBlock}</>
            )}
          </button>
        )}

        <div className="relative z-10 flex flex-col items-center text-center max-w-2xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <span className="block w-10 sm:w-16 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ctaSparkleColor || gold})` }} />
            <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: ctaSparkleColor || gold }} />
            <span className="block w-10 sm:w-16 h-px" style={{ background: `linear-gradient(90deg, ${ctaSparkleColor || gold}, transparent)` }} />
          </div>

          {isEditMode && onSaveDraft ? (
            <input
              type="text"
              value={ctaTitle}
              onChange={(e) => onSaveDraft('publicCtaTitle', e.target.value)}
              className="w-full bg-transparent border-b border-white/20 text-center text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide focus:border-white/50 focus:outline-none"
              style={{ color: ctaTitleColor || PREMIUM_COLORS.white }}
              placeholder={ui.phCtaTitle}
            />
          ) : (
            <h2
              className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide"
              style={{ color: ctaTitleColor || PREMIUM_COLORS.white }}
            >
              {ctaTitle}
            </h2>
          )}

          {isEditMode && onSaveDraft ? (
            <input
              type="text"
              value={ctaSubtitle}
              onChange={(e) => onSaveDraft('publicCtaSubtitle', e.target.value)}
              className="mt-3 w-full bg-transparent border-b border-white/20 text-center text-base sm:text-lg tracking-wider uppercase focus:border-white/50 focus:outline-none"
              style={{ color: ctaSubtitleColor || gold }}
              placeholder={ui.phCtaSub}
            />
          ) : (
            <p className="mt-3 text-base sm:text-lg tracking-wider uppercase" style={{ color: ctaSubtitleColor || gold }}>
              {ctaSubtitle}
            </p>
          )}

          <div className="mt-4 flex items-center gap-4">
            <span className="block w-8 sm:w-12 h-px" style={{ background: `linear-gradient(90deg, transparent, ${ctaSparkleColor || gold}60)` }} />
            <span className="block h-1.5 w-1.5 rounded-full" style={{ background: ctaSparkleColor || gold }} />
            <span className="block w-8 sm:w-12 h-px" style={{ background: `linear-gradient(90deg, ${ctaSparkleColor || gold}60, transparent)` }} />
          </div>

          <Button
            onClick={onBookNow}
            className={cn(
              'mt-8 px-8 py-3 rounded-none border font-semibold uppercase tracking-[0.2em] text-sm transition-all duration-300',
              'hover:shadow-[0_0_20px_rgba(227,199,108,0.3)] hover:scale-[1.02]'
            )}
            style={{
              borderColor: ctaButtonBorderColor || gold,
              color: PREMIUM_COLORS.white,
              background: 'transparent',
            }}
          >
            {bookLabel}
          </Button>
        </div>
      </section>
      )}

      {/* Footer — контакты, соцсети; якорь #footer для кнопки «Контакты» */}
      <footer id="footer" ref={sectionRefs?.footer as React.RefObject<HTMLElement> | undefined} className="w-full">
        <div className="w-full bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b] to-[#111111] shadow-[0_-30px_70px_rgba(0,0,0,0.5)]">
          <div className="w-full px-6 sm:px-10 lg:px-16 pt-12 pb-24">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 -mt-4">
              <div className="flex items-center gap-5 min-w-0">
                {footerLogoVisible && (
                  footerLogo ? (
                    <div className="relative shrink-0">
                      <div
                        className={cn(
                          'h-20 w-20 overflow-hidden border border-border/40 bg-background/60 shadow-inner',
                          footerLogoShape === 'circle'
                            ? 'rounded-full'
                            : footerLogoShape === 'rounded'
                              ? 'rounded-xl'
                              : 'rounded-none'
                        )}
                      >
                        <img src={footerLogo} alt="Logo" className="h-full w-full object-cover" />
                      </div>
                      {isEditMode && onSaveDraft && (
                        <>
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicFooterLogo', '')}
                            className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                            aria-label={ui.deleteLogo}
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                          <label className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                            <span className="px-2 py-0.5 rounded bg-black/75 text-white text-[10px] cursor-pointer hover:bg-black/90">
                              {ui.upload}
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const url = typeof reader.result === 'string' ? reader.result : ''
                                  if (url) onSaveDraft('publicFooterLogo', url)
                                  e.target.value = ''
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  ) : isEditMode && onSaveDraft ? (
                    <label
                      className={cn(
                        'h-20 w-20 shrink-0 flex flex-col items-center justify-center gap-0.5 cursor-pointer border-2 border-dashed border-white/30 hover:border-white/50 bg-white/5 rounded-xl',
                        footerLogoShape === 'circle' && 'rounded-full',
                        footerLogoShape === 'rounded' && 'rounded-xl'
                      )}
                    >
                      <Plus className="h-8 w-8 text-white/60" />
                      <span className="text-[11px] text-white/80">{ui.logo}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (!file) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const url = typeof reader.result === 'string' ? reader.result : ''
                            if (url) onSaveDraft('publicFooterLogo', url)
                            e.target.value = ''
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                    </label>
                  ) : (
                    <div
                      className={cn(
                        'h-20 w-20 shrink-0 border border-border/40 bg-background/60',
                        footerLogoShape === 'circle'
                          ? 'rounded-full'
                          : footerLogoShape === 'rounded'
                            ? 'rounded-xl'
                            : 'rounded-none'
                      )}
                    />
                  )
                )}
                <div className="min-w-0 flex-1">
                  {isEditMode && onSaveDraft ? (
                    <FooterTitleField
                      value={footerSiteName ?? siteName}
                      onSave={(v) => onSaveDraft('publicFooterSiteName', v)}
                      color={footerTitleColor ?? gold}
                      placeholder={ui.phSalonName}
                    />
                  ) : (
                    <p
                      className="text-3xl md:text-4xl font-display font-semibold break-words"
                      style={{ color: footerTitleColor ?? gold }}
                    >
                      {footerSiteName ?? siteName}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-4 w-full justify-center sm:justify-end mt-2 sm:mt-0 items-center">
                {telegramUrl && socialVis.telegram && (
                  <div className="relative">
                    {isEditMode && onSaveDraft && (
                      <button
                        type="button"
                        onClick={() => onSaveDraft('publicTelegram', '')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                        aria-label={ui.deleteTelegram}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <a
                      href={telegramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-gradient-to-r from-[#1FA2FF]/90 via-[#12D8FA]/80 to-[#1FA2FF]/90 text-white hover:brightness-110 border border-white/25"
                    >
                      <TelegramIcon className="h-5 w-5" />
                      Telegram
                    </a>
                  </div>
                )}
                {viberUrl && socialVis.viber && (
                  <div className="relative">
                    {isEditMode && onSaveDraft && (
                      <button
                        type="button"
                        onClick={() => onSaveDraft('publicViber', '')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                        aria-label={ui.deleteViber}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <a
                      href={viberUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-gradient-to-r from-[#7F00FF]/90 to-[#E100FF]/85 text-white hover:brightness-110 border border-white/25"
                    >
                      <ViberIcon className="h-5 w-5" />
                      Viber
                    </a>
                  </div>
                )}
                {instagramUrl && socialVis.instagram && (
                  <div className="relative">
                    {isEditMode && onSaveDraft && (
                      <button
                        type="button"
                        onClick={() => onSaveDraft('publicInstagram', '')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                        aria-label={ui.deleteInstagram}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <a
                      href={instagramUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-gradient-to-r from-[#F58529]/90 via-[#DD2A7B]/85 to-[#515BD4]/90 text-white hover:brightness-110 border border-white/25"
                    >
                      <Instagram className="h-5 w-5" />
                      Instagram
                    </a>
                  </div>
                )}
                {facebookUrl && socialVis.facebook && (
                  <div className="relative">
                    {isEditMode && onSaveDraft && (
                      <button
                        type="button"
                        onClick={() => onSaveDraft('publicFacebook', '')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                        aria-label={ui.deleteFacebook}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <a
                      href={facebookUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-gradient-to-r from-[#1877F2]/90 to-[#0C5DC7]/90 text-white hover:brightness-110 border border-white/25"
                    >
                      <FacebookIcon className="h-5 w-5" />
                      Facebook
                    </a>
                  </div>
                )}
                {whatsappUrl && socialVis.whatsapp && (
                  <div className="relative">
                    {isEditMode && onSaveDraft && (
                      <button
                        type="button"
                        onClick={() => onSaveDraft('publicWhatsapp', '')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                        aria-label={ui.deleteWhatsapp}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-gradient-to-r from-[#25D366]/90 to-[#128C7E]/90 text-white hover:brightness-110 border border-white/25"
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                      WhatsApp
                    </a>
                  </div>
                )}
                {twitterUrl && socialVis.twitter && (
                  <div className="relative">
                    {isEditMode && onSaveDraft && (
                      <button
                        type="button"
                        onClick={() => onSaveDraft('publicTwitter', '')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                        aria-label={ui.deleteTwitter}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <a
                      href={twitterUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-[#000000] text-white hover:brightness-110 border border-white/25"
                    >
                      <TwitterIcon className="h-6 w-6" />
                    </a>
                  </div>
                )}
                {tiktokUrl && socialVis.tiktok && (
                  <div className="relative">
                    {isEditMode && onSaveDraft && (
                      <button
                        type="button"
                        onClick={() => onSaveDraft('publicTiktok', '')}
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                        aria-label={ui.deleteTiktok}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <a
                      href={tiktokUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-[#010101] text-white hover:brightness-110 border border-white/25"
                    >
                      <TikTokIcon className="h-5 w-5" />
                      TikTok
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-20">
              <div className="flex flex-nowrap items-start justify-center gap-3 sm:gap-4 md:gap-6 text-center">
                {[
                  footerVis.address && {
                    id: 'address' as const,
                    label: addressLabel,
                    content: (
                      isEditMode && onSaveDraft ? (
                        <input
                          type="text"
                          value={footerAddress}
                          onChange={(e) => onSaveDraft('publicFooterAddress', e.target.value)}
                          className="w-full min-w-0 text-lg md:text-xl font-semibold leading-relaxed bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none text-center"
                          style={{ color: footerTextC }}
                          placeholder={ui.phAddress}
                        />
                      ) : (
                        <p className="text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate" style={{ color: footerTextC }}>
                          {footerAddress}
                        </p>
                      )
                    ),
                  },
                  footerVis.schedule && {
                    id: 'schedule' as const,
                    label: scheduleLabel,
                    content: (
                      isEditMode && onSaveDraft ? (
                        <>
                          <input
                            type="text"
                            value={footerHours}
                            onChange={(e) => onSaveDraft('publicHours', e.target.value)}
                            className="w-full min-w-0 text-lg md:text-xl font-semibold leading-relaxed bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none text-center"
                            style={{ color: footerTextC }}
                            placeholder={ui.phSchedule}
                          />
                          <input
                            type="text"
                            value={footerDayOff || ''}
                            onChange={(e) => onSaveDraft('publicDayOff', e.target.value)}
                            className="w-full min-w-0 text-sm md:text-base bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none text-center"
                            style={{ color: footerDayOffC }}
                            placeholder={ui.phDayOff}
                          />
                        </>
                      ) : (
                        <>
                          <p className="text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate" style={{ color: footerTextC }}>
                            {footerHours}
                          </p>
                          {footerDayOff && (
                            <p className="text-sm md:text-base min-w-0 truncate" style={{ color: footerDayOffC }}>
                              {footerDayOff}
                            </p>
                          )}
                        </>
                      )
                    ),
                  },
                  footerVis.phone && {
                    id: 'phone' as const,
                    label: phoneLabel,
                    content: (
                      isEditMode && onSaveDraft ? (
                        <input
                          type="text"
                          value={footerPhone}
                          onChange={(e) => onSaveDraft('publicPhone', e.target.value)}
                          className="w-full min-w-0 text-lg md:text-xl font-semibold leading-relaxed bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none text-center"
                          style={{ color: footerTextC }}
                          placeholder={ui.phPhone}
                        />
                      ) : (
                        <p className="text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate" style={{ color: footerTextC }}>
                          {footerPhone}
                        </p>
                      )
                    ),
                  },
                  footerVis.email && {
                    id: 'email' as const,
                    label: emailLabel,
                    content: (
                      isEditMode && onSaveDraft ? (
                        <input
                          type="text"
                          value={footerEmail || ''}
                          onChange={(e) => onSaveDraft('publicEmail', e.target.value)}
                          className="w-full min-w-0 text-lg md:text-xl font-semibold leading-relaxed bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none text-center"
                          style={{ color: footerTextC }}
                          placeholder={ui.phEmail}
                        />
                      ) : (
                        <p className="text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate" style={{ color: footerTextC }}>
                          {footerEmail || '—'}
                        </p>
                      )
                    ),
                  },
                ].filter(Boolean).map((item, index) => (
                  <Fragment key={item!.id}>
                    {index > 0 && <div className="hidden sm:block h-10 w-px shrink-0 bg-primary/30 mx-2 md:mx-4" />}
                    <div className="flex flex-1 min-w-0 items-center justify-center relative">
                      {isEditMode && onSaveDraft && (
                        <button
                          type="button"
                          onClick={() => {
                            const next = { ...footerVis, [item!.id]: false }
                            if (item!.id === 'schedule') next.dayOff = false
                            const anyLeft = next.address || next.schedule || next.phone || next.email
                            if (anyLeft) onSaveDraft('publicFooterVisibility', JSON.stringify(next))
                          }}
                          className="absolute -top-2 -right-2 sm:top-0 sm:right-0 h-6 w-6 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                          aria-label={ui.deleteBlock}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                      <div className="flex flex-col items-center gap-2 w-full min-w-0">
                        <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground min-h-[18px]">
                          {item!.label}
                        </p>
                        {item!.content}
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
