/**
 * Премиум-шаблон «Парикмахерская» — структура и стили на основе Hammer & Nails.
 * Хедер: прозрачный в самом верху (под видео hero), при скролле — тёмный фон; только текст ссылок без рамок и фона.
 */
import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MapPin, ChevronLeft, ChevronRight, Instagram, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DEFAULT_WORLD_MAP_EMBED_URL } from '@/lib/hair-theme-defaults'
import barberHeaderBg from '@/assets/images/constructor-images/загруженное (2).jpg'
import worksDefault1 from '@/assets/images/constructor-images/998b104a5c45e39378ead8e9c3414675.jpg'
import worksDefault2 from '@/assets/images/constructor-images/orig (2).jpg'
import worksDefault3 from '@/assets/images/constructor-images/caa5a2c48f545f5610765afae36e9568.jpg'
import worksCarousel1 from '@/assets/images/constructor-images/c612ebeea6a9ada45aba6c8d7c5db8e9.jpeg'
import worksCarousel2 from '@/assets/images/constructor-images/ew_HairSociety_Eclat_7-1000x1000.jpg'
import worksCarousel3 from '@/assets/images/constructor-images/1704.jpg'
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

/** Ссылки хедера слева и справа от названия — для равномерной сетки из 5 пунктов */
const headerLinksLeft = [
  { label: 'О нас', href: '#about' },
  { label: 'Услуги', href: '#services' },
]
const headerLinksRight = [
  { label: 'Адрес', href: '#address' },
  { label: 'Наши работы', href: '#gallery' },
]

/** Hero-заголовок с авто-высотой: рамка растягивается вместе с текстом, без скролла внутри */
function HeroTitleTextarea({
  value,
  onSave,
  color,
  maxLength,
}: {
  value: string
  onSave: (v: string) => void
  color: string
  maxLength: number
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
      placeholder="Заголовок hero (до 280 символов)"
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

/** Поле описания процедуры с авто-высотой: без скролла, рамка растягивается */
function ServiceCardDescTextarea({
  value,
  onSave,
}: {
  value: string
  onSave: (v: string) => void
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
      className="mt-0.5 w-full bg-transparent border border-white/20 text-sm leading-relaxed focus:border-white focus:outline-none resize-none overflow-hidden block min-h-[2.75rem] text-center"
      style={{ color: PREMIUM_COLORS.textMuted }}
      placeholder="Описание"
    />
  )
}

/** Одна карточка услуги: опциональное фото, обобщённое название тематики, список процедур (название + описание) */
export type ServiceCardItem = { name: string; desc: string }
export type ServiceCardData = { imageUrl?: string; title: string; items: ServiceCardItem[] }

const DEFAULT_SERVICE_CARDS: ServiceCardData[] = [
  { imageUrl: serviceCardImage, title: 'Стрижки и уход за кожей', items: [{ name: 'Классическая стрижка', desc: 'Идеальная стрижка для регулярного ухода. Включает мытьё головы, массаж кожи, горячее полотенце. (~30 мин)' }, { name: 'Премиум стрижка', desc: 'Расширенное время для сложных укладок и детальной отделки. Бритва, пена, массаж после бритья. (~45 мин)' }] },
  { imageUrl: serviceCardImage, title: 'Бритьё и борода', items: [{ name: 'Классическое бритьё', desc: 'Тёплая пена, опасная бритва, горячие и холодные полотенца с маслами. (~30 мин)' }, { name: 'Уход за бородой', desc: 'Коррекция формы, контур бритвой, горячие полотенца с лавандой, кондиционер и укладка. (~30 мин)' }] },
  { imageUrl: serviceCardImage, title: 'Руки и ноги', items: [{ name: 'Классический маникюр', desc: 'Ванночка, обработка ногтей, массаж рук и предплечий, горячее полотенце. (~30 мин)' }, { name: 'Классический педикюр', desc: 'Ванночка, уход за стопами, обработка ногтей, массаж ног и икр. (~30 мин)' }] },
  { imageUrl: serviceCardImage, title: 'Премиум процедуры', items: [{ name: 'Luxe уход за руками', desc: 'Лаванда и 24К золото, горячие камни, CBD-массаж. (~60 мин)' }, { name: 'Luxe уход за ногами', desc: '24К золото, массаж горячими камнями, парафин. (~60 мин)' }] },
  { imageUrl: serviceCardImage, title: 'Консультации и подбор', items: [{ name: 'Подбор образа', desc: 'Консультация по стилю, форме стрижки и уходу. Рекомендации по домашнему уходу. (~15 мин)' }] },
]

export interface PremiumBarberTemplateProps {
  siteName: string
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
  socialVisibility?: { telegram: boolean; viber: boolean; instagram: boolean }
  /** Цвет главного названия в футере */
  footerTitleColor?: string
  /** Цвет текста контактов (адрес, график, телефон, почта) */
  footerTextColor?: string
  /** Цвет строки «Выходной» в футере */
  footerDayOffColor?: string
  telegramUrl?: string
  viberUrl?: string
  instagramUrl?: string
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
}

export default function PremiumBarberTemplate({
  siteName,
  tagline = 'Премиум барбершоп и груминг для мужчин',
  onBookNow,
  bookLabel = 'Записаться',
  footerAddress = 'г. Кишинёв',
  footerPhone = '+373 22 123 456',
  footerHours = 'Пн–Сб 9:00–21:00',
  footerDayOff,
  footerEmail,
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
  addressLabel = 'АДРЕС',
  scheduleLabel = 'ГРАФИК',
  phoneLabel = 'ТЕЛЕФОН',
  emailLabel = 'ПОЧТА',
  mapEmbedUrl,
  heroVideoUrl = null,
  heroImageUrl = null,
  isEditMode = false,
  heroSubtitle = 'Твой салон красоты',
  heroTitle = 'Стрижки, укладки\nи уход в одном месте',
  heroContactsLabel = 'Контакты',
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
  aboutSectionTitle = 'О салоне',
  aboutSectionDescription = 'Уютное пространство для стрижек, укладок и ухода. Качественный сервис и спокойная атмосфера — без суеты и очередей.',
  aboutSectionThirdText = 'Услуги для всей семьи',
  aboutSectionTitleColor,
  aboutSectionDescColor,
  aboutSectionThirdColor,
  aboutSectionButtonBorderColor,
  aboutSalonPhotoUrls,
  worksSectionTitle = 'Наши работы',
  worksSectionSubtitle = 'Вы заслуживаете выглядеть лучше всех',
  worksSectionTitleColor,
  worksSectionSubtitleColor,
  worksPhotoUrls,
  serviceCards,
}: PremiumBarberTemplateProps) {
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
  const socialVis = socialVisibility ?? { telegram: true, viber: true, instagram: true }
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
          {headerLinksLeft.map(({ label, href }) => (
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
                placeholder="Название"
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
          {headerLinksRight.map(({ label, href }) => (
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
              placeholder="Подзаголовок"
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
      <section id="about" className="grid grid-cols-1 gap-0 md:grid-cols-2">
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
                aria-label="Предыдущее фото"
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
                aria-label="Следующее фото"
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
                    aria-label={`Фото ${i + 1}`}
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
              placeholder="Заголовок (до 100 символов)"
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
              placeholder="Описание (до 400 символов)"
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
              placeholder="Третий текст (до 100 символов)"
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
            Наши услуги
          </Button>
        </div>
      </section>

      {/* Наши работы — циклическая галерея, по центру фото крупнее, стрелки в кружочках */}
      <section id="gallery" className="bg-[#0b0b0b] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          {isEditMode && onSaveDraft ? (
            <AboutBlockField
              value={worksSectionTitle}
              onSave={(v) => onSaveDraft('publicWorksTitle', v)}
              color={worksSectionTitleColor ?? PREMIUM_COLORS.white}
              maxLength={80}
              placeholder="Заголовок (до 80 символов)"
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
              placeholder="Подзаголовок (до 80 символов)"
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
              aria-label="Предыдущее фото"
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
              aria-label="Следующее фото"
            >
              <ChevronRight className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </section>

      {/* Наши услуги — 5 карточек в ряд, редактирование в превью, можно добавлять карточки */}
      <section id="services" className="border-t border-white/10 bg-[#0b0b0b] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-[1600px] text-center">
          <h2 className="font-services-broken text-2xl uppercase tracking-wide text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Наши услуги
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-base" style={{ color: gold }}>
            Стрижки, уход и процедуры в уютной атмосфере, работаем с качественными средствами
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {(() => {
              const source = serviceCards ?? DEFAULT_SERVICE_CARDS
              const cards: ServiceCardData[] = Array.from({ length: 5 }, (_, i) => source[i] ?? { ...DEFAULT_SERVICE_CARDS[i]!, title: '', items: [] })
              return cards.map((card, cardIndex) => {
                const updateCards = (next: ServiceCardData[]) => onSaveDraft?.('publicServiceCards', JSON.stringify(next))
                const hasImage = Boolean(card.imageUrl && card.imageUrl.length > 0)
                return (
                  <div
                    key={cardIndex}
                    className="frame-wood-dark overflow-hidden bg-[#0f0f0f] p-0 flex flex-col"
                  >
                    {hasImage ? (
                      <div className="relative h-28 w-full shrink-0 bg-gray-800 sm:h-32">
                        <img src={card.imageUrl!} alt="" className="h-full w-full object-cover" />
                        {isEditMode && onSaveDraft && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const next = cards.map((c, i) => i === cardIndex ? { ...c, imageUrl: '' } : c)
                                updateCards(next)
                              }}
                              className="absolute top-1 right-1 h-7 w-7 rounded-full bg-red-500/90 text-white flex items-center justify-center hover:bg-red-600 z-10"
                              aria-label="Удалить фото"
                            >
                              <X className="h-4 w-4" />
                            </button>
                            <label className="absolute bottom-1 right-1 px-2 py-1 rounded bg-black/60 text-white text-xs cursor-pointer hover:bg-black/80">
                              Сменить фото
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
                          </>
                        )}
                      </div>
                    ) : isEditMode && onSaveDraft ? (
                      <label className="h-28 w-full shrink-0 bg-gray-800/50 sm:h-32 flex flex-col items-center justify-center gap-1 cursor-pointer border-2 border-dashed border-white/30 hover:border-white/50">
                        <Plus className="h-8 w-8 text-white/60" />
                        <span className="text-xs text-white/70">Добавить фото</span>
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
                    <div className={cn('p-4 flex-1 flex flex-col items-center text-center', !hasImage && 'justify-center')}>
                      {isEditMode && onSaveDraft ? (
                        <>
                          <div className="w-full flex items-start justify-center gap-1 mb-3">
                            <input
                              type="text"
                              value={card.title}
                              onChange={(e) => {
                                const next = cards.map((c, i) => i === cardIndex ? { ...c, title: e.target.value } : c)
                                updateCards(next)
                              }}
                              className="flex-1 min-w-0 bg-transparent border-b border-white/30 text-lg font-bold uppercase focus:border-white focus:outline-none text-center"
                              style={{ color: gold }}
                              placeholder="Название тематики"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const next = cards.map((c, i) => i === cardIndex ? { ...c, title: '' } : c)
                                updateCards(next)
                              }}
                              className="h-7 w-7 shrink-0 rounded-full bg-red-500/80 text-white flex items-center justify-center hover:bg-red-500"
                              aria-label="Очистить название"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <ul className="w-full mt-2 space-y-3">
                            {card.items.map((item, itemIndex) => (
                              <li key={itemIndex} className="space-y-1 flex flex-col items-center">
                                <div className="w-full flex items-start gap-1">
                                  <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => {
                                      const next = cards.map((c, i) =>
                                        i === cardIndex
                                          ? { ...c, items: c.items.map((it, j) => j === itemIndex ? { ...it, name: e.target.value } : it) }
                                          : c
                                      )
                                      updateCards(next)
                                    }}
                                    className="flex-1 min-w-0 bg-transparent border-b border-white/20 text-sm font-semibold text-white focus:border-white focus:outline-none text-center"
                                    placeholder="Название процедуры"
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
                                    aria-label="Удалить процедуру"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                </div>
                                <div className="w-full">
                                  <ServiceCardDescTextarea
                                    value={item.desc}
                                    onSave={(v) => {
                                      const next = cards.map((c, i) =>
                                        i === cardIndex
                                          ? { ...c, items: c.items.map((it, j) => j === itemIndex ? { ...it, desc: v } : it) }
                                          : c
                                      )
                                      updateCards(next)
                                    }}
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
                                  <Plus className="h-4 w-4" /> Добавить процедуру
                                </button>
                              </li>
                            )}
                          </ul>
                        </>
                      ) : (
                        <>
                          <h3 className="text-lg font-bold uppercase" style={{ color: gold }}>
                            {card.title}
                          </h3>
                          <ul className="mt-3 space-y-4 w-full">
                            {card.items.map((item, idx) => (
                              <li key={idx} className="text-center">
                                <p className="font-semibold text-sm text-white">{item.name}</p>
                                <p className="mt-1 text-sm leading-relaxed" style={{ color: PREMIUM_COLORS.textMuted }}>
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
          </div>
        </div>
      </section>

      {/* Локация — карта и адрес в стиле сайта */}
      <section id="address" className="border-t border-white/10 bg-[#0b0b0b] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="font-services-broken text-2xl uppercase tracking-wide text-white sm:text-3xl md:text-4xl">
            Где нас найти
          </h2>
          <div className="mt-6 flex w-full items-center justify-between gap-4 text-left text-xs font-bold sm:text-sm" style={{ color: gold }}>
            <span className="shrink-0">Адрес твоего салона</span>
            <span className="shrink-0">Город в котором твой салон находится</span>
          </div>
          <div className="mt-4 w-full overflow-hidden rounded-xl border-2" style={{ borderColor: 'rgba(227,199,108,0.3)' }}>
            <iframe
              title="Карта"
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
      <section
        id="booking"
        className="relative flex min-h-[40vh] flex-col items-center justify-center bg-cover bg-center px-4 py-24"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.75), rgba(0,0,0,0.75)), url(${barberHeaderBg})`,
        }}
      >
        <h2 className="text-center text-2xl font-semibold uppercase sm:text-3xl md:text-4xl">
          Готовы выглядеть лучше?
        </h2>
        <p className="mt-2 text-lg uppercase" style={{ color: PREMIUM_COLORS.textMuted }}>
          Запишитесь на приём
        </p>
        <Button
          onClick={onBookNow}
          className={cn(
            'mt-10 rounded-lg border-2 font-semibold uppercase tracking-wider',
            'hover:bg-white/10 transition'
          )}
          style={{
            borderColor: gold,
            color: PREMIUM_COLORS.white,
            background: 'transparent',
          }}
        >
          {bookLabel}
        </Button>
      </section>

      {/* Footer — контакты, соцсети; якорь #footer для кнопки «Контакты» */}
      <footer id="footer" className="w-full">
        <div className="w-full bg-gradient-to-b from-[#0b0b0b] via-[#0b0b0b] to-[#111111] shadow-[0_-30px_70px_rgba(0,0,0,0.5)]">
          <div className="w-full px-6 sm:px-10 lg:px-16 pt-12 pb-24">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 -mt-4">
              <div className="flex items-center gap-5">
                {footerLogoVisible && (
                  footerLogo ? (
                    <div
                      className={cn(
                        'h-20 w-20 shrink-0 overflow-hidden border border-border/40 bg-background/60 shadow-inner',
                        footerLogoShape === 'circle'
                          ? 'rounded-full'
                          : footerLogoShape === 'rounded'
                            ? 'rounded-xl'
                            : 'rounded-none'
                      )}
                    >
                      <img src={footerLogo} alt="Logo" className="h-full w-full object-cover" />
                    </div>
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
                <div className="min-w-0 flex-1 max-w-[600px] sm:max-w-[720px]">
                  {isEditMode && onSaveDraft ? (
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => onSaveDraft('publicName', e.target.value)}
                      className="text-3xl md:text-4xl font-display font-semibold w-full min-w-0 bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none break-words"
                      style={{ color: footerTitleColor ?? gold }}
                      placeholder="Название салона"
                    />
                  ) : (
                    <p
                      className="text-3xl md:text-4xl font-display font-semibold break-words"
                      style={{ color: footerTitleColor ?? gold }}
                    >
                      {siteName}
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
                        aria-label="Удалить Telegram"
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
                        aria-label="Удалить Viber"
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
                        aria-label="Удалить Instagram"
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
                          placeholder="Адрес"
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
                            placeholder="График"
                          />
                          <input
                            type="text"
                            value={footerDayOff || ''}
                            onChange={(e) => onSaveDraft('publicDayOff', e.target.value)}
                            className="w-full min-w-0 text-sm md:text-base bg-transparent border-b border-transparent hover:border-white/30 focus:border-white focus:outline-none text-center"
                            style={{ color: footerDayOffC }}
                            placeholder="Выходной"
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
                          placeholder="Телефон"
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
                          placeholder="Почта"
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
                          aria-label="Удалить блок"
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
