/**
 * Премиум-шаблон «Парикмахерская» — структура и стили на основе Hammer & Nails.
 * Хедер: прозрачный в самом верху (под видео hero), при скролле — тёмный фон; только текст ссылок без рамок и фона.
 */
import { useEffect, useState } from 'react'
import { MapPin, ChevronLeft, ChevronRight, Instagram } from 'lucide-react'
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

const serviceCategories = [
  {
    title: 'Стрижки и уход за кожей',
    items: [
      { name: 'Классическая стрижка', desc: 'Идеальная стрижка для регулярного ухода. Включает мытьё головы, массаж кожи, горячее полотенце. (~30 мин)', duration: '30 мин' },
      { name: 'Премиум стрижка', desc: 'Расширенное время для сложных укладок и детальной отделки. Бритва, пена, массаж после бритья. (~45 мин)', duration: '45 мин' },
    ],
  },
  {
    title: 'Бритьё и борода',
    items: [
      { name: 'Классическое бритьё', desc: 'Тёплая пена, опасная бритва, горячие и холодные полотенца с маслами. (~30 мин)', duration: '30 мин' },
      { name: 'Уход за бородой', desc: 'Коррекция формы, контур бритвой, горячие полотенца с лавандой, кондиционер и укладка. (~30 мин)', duration: '30 мин' },
    ],
  },
  {
    title: 'Руки и ноги',
    items: [
      { name: 'Классический маникюр', desc: 'Ванночка, обработка ногтей, массаж рук и предплечий, горячее полотенце. (~30 мин)', duration: '30 мин' },
      { name: 'Классический педикюр', desc: 'Ванночка, уход за стопами, обработка ногтей, массаж ног и икр. (~30 мин)', duration: '30 мин' },
    ],
  },
  {
    title: 'Премиум процедуры',
    items: [
      { name: 'Luxe уход за руками', desc: 'Лаванда и 24К золото, горячие камни, CBD-массаж. (~60 мин)', duration: '60 мин' },
      { name: 'Luxe уход за ногами', desc: '24К золото, массаж горячими камнями, парафин. (~60 мин)', duration: '60 мин' },
    ],
  },
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
}: PremiumBarberTemplateProps) {
  const heroBgImage = heroImageUrl || barberHeaderBg
  const gold = accentColor || PREMIUM_COLORS.gold
  const headerBg = headerBgColor || PREMIUM_COLORS.headerScrolledBg
  const defaultMapUrl = DEFAULT_WORLD_MAP_EMBED_URL
  const mapUrl = mapEmbedUrl || defaultMapUrl
  const [headerScrolled, setHeaderScrolled] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const galleryImages = [worksCarousel1, worksCarousel2, worksCarousel3]
  const galleryLen = galleryImages.length
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
    const t = setInterval(() => {
      setAboutCarouselIndex((i) => (i + 1) % ABOUT_SALON_IMAGES.length)
    }, ABOUT_SALON_AUTO_INTERVAL_MS)
    return () => clearInterval(t)
  }, [])

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
          boxShadow: headerScrolled ? '0 6px 20px rgba(255,255,255,0.06)' : 'none',
        }}
      >
        <div className="mx-auto flex h-14 sm:h-16 w-full max-w-[100%] items-center justify-evenly gap-6 sm:gap-10 px-3 sm:px-8">
          {headerLinksLeft.map(({ label, href }) => (
            <a
              key={href}
              href={href}
              onClick={(e) => {
                e.preventDefault()
                scrollToSection(href)
              }}
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white hover:opacity-80 transition shrink-0 cursor-pointer"
            >
              {label}
            </a>
          ))}
          <div className="font-premium-header-name text-lg sm:text-xl font-bold tracking-widest text-white text-center shrink-0 whitespace-nowrap min-w-[8rem]">
            {isEditMode && onSaveDraft ? (
              <input
                type="text"
                value={siteName}
                onChange={(e) => onSaveDraft('publicName', e.target.value)}
                className="w-full min-w-0 bg-transparent border-b border-white/40 text-center focus:border-white focus:outline-none"
                placeholder="Название"
              />
            ) : (
              siteName
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
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white hover:opacity-80 transition shrink-0 cursor-pointer"
            >
              {label}
            </a>
          ))}
        </div>
      </header>

      {/* Hero — видео или картинка (любой размер), поверх затемнение */}
      <section
        className="relative flex min-h-[100vh] min-h-[100dvh] flex-col justify-end bg-cover bg-center bg-no-repeat px-4 pb-16 sm:pb-24 md:pb-32 overflow-hidden"
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
              style={{ color: gold }}
              placeholder="Подзаголовок"
            />
          ) : (
            <p
              className="font-premium-hero-tagline text-sm sm:text-base uppercase tracking-[0.2em]"
              style={{ color: gold }}
            >
              {heroSubtitle}
            </p>
          )}
          {isEditMode && onSaveDraft ? (
            <textarea
              value={heroTitle}
              onChange={(e) => onSaveDraft('publicPremiumHeroTitle', e.target.value)}
              rows={3}
              className="font-premium-hero-moonshiner mt-3 w-full max-w-2xl bg-transparent border border-white/40 text-3xl leading-tight text-white uppercase sm:text-4xl md:text-5xl focus:border-white focus:outline-none resize-y"
              placeholder="Заголовок hero"
            />
          ) : (
            <p className="font-premium-hero-moonshiner mt-3 text-3xl leading-none text-white uppercase sm:text-4xl md:text-5xl lg:text-6xl">
              {String(heroTitle ?? '').split('\n').map((line, i) => (
                <span key={i}>
                  {i > 0 && <br />}
                  {line}
                </span>
              ))}
            </p>
          )}
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            {isEditMode && onSaveDraft ? (
              <input
                type="text"
                value={heroContactsLabel}
                onChange={(e) => onSaveDraft('publicPremiumHeroContactsLabel', e.target.value)}
                className="rounded-none border-2 border-white/60 bg-transparent px-6 py-3 font-semibold uppercase tracking-wider text-white focus:border-white focus:outline-none max-w-[12rem]"
                placeholder="Контакты"
              />
            ) : (
              <Button
                variant="outline"
                className="rounded-none border-2 border-white/60 bg-transparent font-semibold uppercase tracking-wider text-white hover:bg-white/10 font-premium-barber"
                onClick={() => document.getElementById('footer')?.scrollIntoView({ behavior: 'smooth' })}
              >
                {heroContactsLabel}
              </Button>
            )}
            {isEditMode && onSaveDraft ? (
              <input
                type="text"
                value={bookLabel}
                onChange={(e) => onSaveDraft('publicPremiumBookLabel', e.target.value)}
                className="rounded-none border px-6 py-3 font-bold uppercase tracking-wider text-white bg-transparent focus:border-white focus:outline-none max-w-[14rem]"
                style={{ borderWidth: '1px', borderColor: gold }}
                placeholder="Записаться онлайн"
              />
            ) : (
              <button
                type="button"
                onClick={onBookNow}
                className="inline-flex items-center justify-center rounded-none border px-6 py-3 font-bold uppercase tracking-wider text-white transition-all duration-300 hover:text-[#e3c76c] font-premium-barber"
                style={{
                  borderWidth: '1px',
                  borderColor: gold,
                  backgroundColor: 'transparent',
                }}
              >
                {bookLabel}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* О нас — блок «О салоне»: карусель из 3 фото, точки при наведении, стрелки, авто-переключение */}
      <section id="about" className="grid grid-cols-1 gap-0 md:grid-cols-2">
        <div
          className="relative min-h-[400px] md:min-h-[500px] overflow-hidden bg-[#0b0b0b]"
          onMouseEnter={() => setAboutCarouselHover(true)}
          onMouseLeave={() => setAboutCarouselHover(false)}
        >
          {ABOUT_SALON_IMAGES.map((src, i) => (
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
          {aboutCarouselHover && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  setAboutCarouselIndex((i) => (i - 1 + ABOUT_SALON_IMAGES.length) % ABOUT_SALON_IMAGES.length)
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
                  setAboutCarouselIndex((i) => (i + 1) % ABOUT_SALON_IMAGES.length)
                }}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2 bg-black/40 text-white transition hover:bg-black/70"
                style={{ borderColor: gold }}
                aria-label="Следующее фото"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              {/* Точки внизу — при наведении */}
              <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center gap-2">
                {ABOUT_SALON_IMAGES.map((_, i) => (
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
          <h2 className="font-services-broken text-3xl uppercase leading-tight tracking-wide text-white sm:text-4xl md:text-5xl lg:text-6xl">
            О салоне
          </h2>
          <p className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-white/90 sm:text-xl" style={{ color: PREMIUM_COLORS.textMuted }}>
            Уютное пространство для стрижек, укладок и ухода. Качественный сервис и спокойная атмосфера — без суеты и очередей.
          </p>
          <p
            className="mt-4 text-xl font-bold uppercase sm:text-2xl"
            style={{ color: gold }}
          >
            Услуги для всей семьи
          </p>
          <Button
            onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
            className="mt-8 rounded-lg border-2 px-8 py-4 text-lg font-bold uppercase tracking-wider sm:px-10 sm:py-5 sm:text-xl"
            style={{
              borderColor: gold,
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
          <h2 className="font-services-broken text-3xl uppercase leading-tight tracking-wide text-white sm:text-4xl md:text-5xl lg:text-6xl">
            Наши работы
          </h2>
          <p className="mt-3 text-xl font-semibold uppercase tracking-wider sm:text-2xl md:text-3xl whitespace-nowrap" style={{ color: gold }}>
            Вы заслуживаете выглядеть лучше всех
          </p>
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

      {/* Our customized services — 4 колонки с золотой рамкой */}
      <section id="services" className="border-t border-white/10 bg-[#0b0b0b] px-4 py-16 md:py-24">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="font-services-broken text-2xl uppercase tracking-wide text-white sm:text-3xl md:text-4xl lg:text-5xl">
            Наши услуги
          </h2>
          <p className="mx-auto mt-4 max-w-4xl text-base whitespace-nowrap" style={{ color: gold }}>
            Стрижки, уход и процедуры в уютной атмосфере, работаем с качественными средствами
          </p>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {serviceCategories.map((cat) => {
              return (
                <div
                  key={cat.title}
                  className="frame-wood-dark overflow-hidden bg-[#0f0f0f] p-0"
                >
                  <div className="h-28 w-full shrink-0 bg-gray-800 sm:h-32">
                    <img src={serviceCardImage} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold uppercase" style={{ color: gold }}>
                      {cat.title}
                    </h3>
                    <ul className="mt-3 space-y-4">
                      {cat.items.map((item) => (
                        <li key={item.name}>
                          <p className="font-semibold text-sm text-white">
                            {item.name}
                          </p>
                          <p className="mt-1 text-sm leading-relaxed" style={{ color: PREMIUM_COLORS.textMuted }}>
                            {item.desc}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
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
                  ) : (
                    <div
                      className={cn(
                        'h-20 w-20 border border-border/40 bg-background/60',
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
                  <p
                    className="text-3xl md:text-4xl font-display font-semibold whitespace-nowrap overflow-hidden max-w-[420px]"
                    style={{ color: gold }}
                  >
                    {siteName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 w-full justify-center sm:justify-end mt-2 sm:mt-0">
                {telegramUrl && (
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-gradient-to-r from-[#1FA2FF]/90 via-[#12D8FA]/80 to-[#1FA2FF]/90 text-white hover:brightness-110 border border-white/25"
                  >
                    <TelegramIcon className="h-5 w-5" />
                    Telegram
                  </a>
                )}
                {viberUrl && (
                  <a
                    href={viberUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-gradient-to-r from-[#7F00FF]/90 to-[#E100FF]/85 text-white hover:brightness-110 border border-white/25"
                  >
                    <ViberIcon className="h-5 w-5" />
                    Viber
                  </a>
                )}
                {instagramUrl && (
                  <a
                    href={instagramUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="h-12 w-36 rounded-full text-base font-semibold transition inline-flex items-center justify-center gap-2 shadow-[0_10px_24px_rgba(0,0,0,0.28)] backdrop-blur-md bg-gradient-to-r from-[#F58529]/90 via-[#DD2A7B]/85 to-[#515BD4]/90 text-white hover:brightness-110 border border-white/25"
                  >
                    <Instagram className="h-5 w-5" />
                    Instagram
                  </a>
                )}
              </div>
            </div>

            <div className="mt-20">
              <div className="flex flex-nowrap items-start justify-between gap-3 sm:gap-4 md:gap-6 text-center">
                <div className="flex flex-1 min-w-0 items-center justify-center">
                  <div className="flex flex-col items-center gap-2 w-full min-w-0">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground min-h-[18px]">
                      {addressLabel}
                    </p>
                    <p className="text-foreground text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate">
                      {footerAddress}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block h-10 w-px shrink-0 bg-primary/30 mx-2 md:mx-4" />
                <div className="flex flex-1 min-w-0 items-center justify-center">
                  <div className="flex flex-col items-center gap-2 w-full min-w-0">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground min-h-[18px]">
                      {scheduleLabel}
                    </p>
                    <p className="text-foreground text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate">
                      {footerHours}
                    </p>
                    {footerDayOff && (
                      <p className="text-sm md:text-base min-w-0 truncate" style={{ color: gold }}>
                        {footerDayOff}
                      </p>
                    )}
                  </div>
                </div>
                <div className="hidden sm:block h-10 w-px shrink-0 bg-primary/30 mx-2 md:mx-4" />
                <div className="flex flex-1 min-w-0 items-center justify-center">
                  <div className="flex flex-col items-center gap-2 w-full min-w-0">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground min-h-[18px]">
                      {phoneLabel}
                    </p>
                    <p className="text-foreground text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate">
                      {footerPhone}
                    </p>
                  </div>
                </div>
                <div className="hidden sm:block h-10 w-px shrink-0 bg-primary/30 mx-2 md:mx-4" />
                <div className="flex flex-1 min-w-0 items-center justify-center">
                  <div className="flex flex-col items-center gap-2 w-full min-w-0">
                    <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground min-h-[18px]">
                      {emailLabel}
                    </p>
                    <p className="text-foreground text-lg md:text-xl font-semibold leading-relaxed min-w-0 truncate">
                      {footerEmail || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
