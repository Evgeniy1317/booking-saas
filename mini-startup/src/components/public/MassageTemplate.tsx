import { useState, useEffect, useLayoutEffect, useRef, useMemo, useCallback, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import type { MassageThemeColors } from '@/lib/massage-theme-palette'
import { resolveMassageThemeColor } from '@/lib/massage-theme-palette'
import { getMassageDraft } from '@/lib/massage-draft'
import {
  DEFAULT_WORLD_MAP_EMBED_URL,
  FOOTER_DEFAULT_ADDRESS,
  FOOTER_DEFAULTS_BY_LANG,
} from '@/lib/hair-theme-defaults'
import { getEnabledSiteLangs } from '@/lib/public-site-langs'
import flagRu from '@/assets/images/russia.png'
import flagEn from '@/assets/images/united-kingdom.png'
import flagRo from '@/assets/images/flag.png'
import type {
  Lang,
  MassageServiceMerged,
  MassageSubscriptionItemMerged,
  MassageSpecialistMerged,
  MassageCatalogProductMerged,
} from '@/lib/massage-template-model'
import {
  GAL_TABS,
  SERVICES,
  mergeMassageServicesFromDraft,
  serializeMassageServicesForDraft,
  MASSAGE_SERVICES_MAX,
  mergeMassageGalleryFromDraft,
  serializeMassageGalleryForDraft,
  MASSAGE_GALLERY_MAX_SECTIONS,
  MASSAGE_GALLERY_PHOTOS_PER_SECTION,
  MASSAGE_GALLERY_TAB_LABEL_MAX,
  mergeMassageCatalogFromDraft,
  serializeMassageCatalogForDraft,
  createMassageCatalogProductFromTemplate,
  MASSAGE_CATALOG_MAX,
  MAX_CATALOG_NAME_LEN,
  MAX_CATALOG_BRAND_LEN,
  MAX_CATALOG_INFO_LINE,
  formatCatalogPriceDisplay,
  mergeMassageSubscriptionsFromDraft,
  serializeMassageSubscriptionsForDraft,
  MASSAGE_SUBSCRIPTION_PRESETS as SUBS,
  MASSAGE_SUBSCRIPTION_PRESET_COUNT,
  mergeMassageSpecsFromDraft,
  serializeMassageSpecsForDraft,
  createMassageSpecFromTemplate,
  MASSAGE_SPECS_MAX,
  MAX_SVC_TITLE_LEN,
  MAX_SVC_DESC_LEN,
  MAX_SVC_PRICE_LEN,
  MAX_CATALOG_TITLE_LEN,
  parseCatalogPriceText,
  normalizeCatalogCurrencyInput,
} from '@/lib/massage-template-model'

/**
 * В iframe превью проп отстаёт от localStorage до следующего рендера — для мутаций читаем актуальный JSON здесь.
 * В режиме welcomeTemplateView localStorage не трогаем (приветственный экран без черновиков редактирования).
 */
function readMassageSubsJsonRaw(prop: string | undefined, welcomeTemplateView: boolean): string | undefined {
  if (typeof window === 'undefined') return prop
  if (welcomeTemplateView) return prop?.trim() ? prop : undefined
  const v = getMassageDraft('publicMassageSubsJson')
  return v.trim() !== '' ? v : undefined
}

interface MassageTemplateProps {
  siteName?: string
  /** Черновик названия салона (перекрывает siteName) */
  headerSiteName?: string
  lang?: Lang
  heroImage?: string | null
  /** Фон hero — видео (если задано вместе с фото, показывается видео) */
  heroVideo?: string | null
  /** Логотип в шапке (data URL или URL) */
  headerLogoUrl?: string | null
  headerLogoShape?: 'circle' | 'rounded' | 'square'
  /** false — скрыть логотип */
  headerLogoVisible?: boolean
  /** Цвета из конструктора (палитры) */
  massageThemeColors?: MassageThemeColors
  onBookNow?: () => void
  isEditMode?: boolean
  /** Только дефолты шаблона, без черновиков из localStorage (экран выбора темы в конструкторе) */
  welcomeTemplateView?: boolean
  heroTitle1?: string
  heroTitle2?: string
  heroSub?: string
  /** Черновик подписи основной кнопки hero (язык — через суффикс __lang в storage) */
  heroBookOnline?: string
  /** Черновик подписи кнопки «Где нас найти» */
  heroWhereFind?: string
  headerPhone?: string
  headerAddress?: string
  headerTagline?: string
  headerCallUs?: string
  headerContactOnline?: string
  telegramUrl?: string
  viberUrl?: string
  whatsappUrl?: string
  instagramUrl?: string
  facebookUrl?: string
  vkUrl?: string
  twitterUrl?: string
  tiktokUrl?: string
  onSaveDraft?: (key: string, value: string) => void
  /** Черновики блока услуг (конструктор) */
  massageSvcTitle?: string
  massageSvcSub?: string
  /** JSON массива карточек { title, desc, price, image?, noImage? } */
  massageServicesJson?: string
  /** Блок «О салоне» — тексты (черновики) */
  massageAboutTitle?: string
  massageAboutText?: string
  massageAboutMission?: string
  /** Фото основателя (data URL) */
  massageAboutAvatar?: string | null
  /** Кадрирование: JSON `{"x":0-100,"y":0-100}` для object-position (%) */
  massageAboutAvatarPan?: string
  /** Галерея: заголовки и JSON секций с фото */
  massageGalTitle?: string
  massageGalSub?: string
  massageGalleryJson?: string
  /** Блок «Абонементы» */
  massageSubsTitle?: string
  /** JSON списка { items: { id, templateIndex }[] } */
  massageSubsJson?: string
  /** Ссылка для кнопки «Участвовать в акции» (иначе — onBookNow) */
  massageSubsCtaUrl?: string
  /** 'true' — скрыть кнопку акции в карточках */
  massageSubsCtaHidden?: string
  /** 'true' — скрыть блок и пункт меню «Абонементы» */
  massageSubsHidden?: string
  /** Заголовок блока «Каталог» */
  massageCatalogTitle?: string
  /** JSON массива товаров { products: { id, name, brand, price, oldPrice, info[] }[] } */
  massageCatalogJson?: string
  /** 'true' — скрыть блок «Каталог» и пункт меню */
  massageCatalogHidden?: string
  /** Заголовок блока «Специалисты» */
  massageSpecsTitle?: string
  /** JSON списка { items: { id, name, role, exp, image? }[] } */
  massageSpecsJson?: string
  /** 'true' — скрыть блок «Специалисты» */
  massageSpecsHidden?: string
  /** Блок записи (CTA): тексты черновика */
  massageCtaTitle?: string
  massageCtaSub?: string
  massageCtaBtn?: string
  /** 'true' — скрыть блок записи (CTA) на сайте */
  massageCtaHidden?: string
  /** Контакты: переопределение заголовков и текста */
  massageContactTitle?: string
  massageContactOurHeading?: string
  /** Многострочный график работ (\n) */
  massageContactSchedule?: string
  massageContactEmail?: string
  /** Координаты для карты (из поиска адреса в конструкторе) */
  mapLat?: string
  mapLng?: string
  /** Подпись над картой («Адрес салона») */
  massageContactMapLabel?: string
}

const UI: Record<Lang, Record<string, string>> = {
  ru: {
    studioTag: 'Студия массажа.\nРаботаем с 2016 г.',
    addressDefault: 'Город, улица, дом',
    contactOnline: 'Свяжитесь, мы онлайн',
    callUs: 'Звоните, мы работаем Пн-Вс 9:00-21:00',
    phone: '+X (XXX) XXX-XX-XX',
    bookVisit: 'ЗАПИСАТЬСЯ НА ПРИЕМ',
    heroTitle1: 'СТУДИЯ',
    heroTitle2: 'МАССАЖА',
    heroSub:
      'Самые эффективные и приятные услуги в массажных салонах — для вашего здоровья и благополучия',
    heroCta: 'ЗАПИСАТЬСЯ НА ПЕРВИЧНЫЙ СЕАНС',
    heroBookOnline: 'Записаться онлайн',
    heroWhereFind: 'Где нас найти?',
    svcTitle: 'ВЫБЕРИТЕ НУЖНУЮ УСЛУГУ',
    svcSub: 'Мы предлагаем следующие виды массажа',
    svcAddCard: 'Добавить карточку',
    svcDeleteCard: 'Удалить карточку',
    svcCta: 'ОСТАВИТЬ ЗАЯВКУ',
    priceFrom: 'ОТ $50/ЧАС',
    aboutTitle: 'ПРИВЕТ, Я АНАСТАСИЯ — ОСНОВАТЕЛЬНИЦА СТУДИИ',
    aboutText: 'Наш массажный салон предлагает высококачественные услуги по различным видам массажа. Мы гордимся профессионализмом наших массажистов и уютной атмосферой, созданной для вашего полного расслабления.',
    aboutMission: 'Наша миссия – улучшение вашего самочувствия и обеспечение незабываемого опыта',
    avatarDragHint: 'Перетащите фото, чтобы сместить кадр',
    galTitle: 'ПОГРУЗИТЕСЬ В АТМОСФЕРУ УЮТА И СПОКОЙСТВИЯ НАШЕГО САЛОНА',
    galSub: 'Пролистайте нашу галерею, где проходят ваши сеансы',
    galleryNewSection: 'Новая секция',
    subsTitle: 'НАШИ АБОНЕМЕНТЫ',
    subsCta: 'УЧАСТВОВАТЬ В АКЦИИ →',
    subsEmptyHint: 'Добавьте абонементы в панели справа.',
    catTitle: 'КАТАЛОГ НАШИХ ТОВАРОВ',
    catDiscount: '% Скидка',
    catEmptyHint: 'Добавьте товары в панели справа.',
    catOldPriceHint: 'Старая цена (зачёркнутая, если выше текущей)',
    catCurrencyHint: 'Знак валюты у цены (по умолчанию $). Редактируйте вручную.',
    currency: '$',
    specTitle: 'НАШИ СЕРТИФИЦИРОВАННЫЕ СПЕЦИАЛИСТЫ',
    specsHiddenBanner: 'Блок «Специалисты» скрыт на сайте. Снимите галочку в сайдбаре, чтобы снова показать.',
    ctaHiddenBanner: 'Блок записи скрыт на сайте. Снимите галочку в сайдбаре, чтобы снова показать.',
    contactTitle: 'СВЯЖИТЕСЬ С НАМИ ЛЮБЫМ УДОБНЫМ СПОСОБОМ',
    ourContacts: 'Наши контакты',
    salonAddr: 'АДРЕС САЛОНА:',
    socials: 'МЫ В СОЦСЕТЯХ',
    email: 'info@studio.ru',
    workHours: 'Пн-Пт: 9:00 - 18:00',
    workWeekend: 'Сб: 10:00 - 16:00',
    dayOff: 'Вс: выходной',
    ctaTitle: 'НЕ ОТКЛАДЫВАЙТЕ ЗАБОТУ О СЕБЕ',
    ctaSub: 'Запишитесь прямо сейчас и почувствуйте разницу уже после первого сеанса. Ваше тело заслуживает лучшего.',
    ctaBtn: 'ЗАПИСАТЬСЯ НА СЕАНС',
  },
  en: {
    studioTag: 'Massage studio.\nSince 2016.',
    addressDefault: 'City, street, building',
    contactOnline: 'Contact us, we are online',
    callUs: 'Call us, we are open Mon-Sun 9:00-21:00',
    phone: '+X (XXX) XXX-XX-XX',
    bookVisit: 'BOOK AN APPOINTMENT',
    heroTitle1: 'MASSAGE',
    heroTitle2: 'STUDIO',
    heroSub:
      'The most effective and pleasant treatments at our massage salons — for your health and well-being',
    heroCta: 'BOOK YOUR FIRST SESSION',
    heroBookOnline: 'Book online',
    heroWhereFind: 'Where to find us?',
    svcTitle: 'CHOOSE THE SERVICE YOU NEED',
    svcSub: 'We offer the following types of massage',
    svcAddCard: 'Add card',
    svcDeleteCard: 'Remove card',
    svcCta: 'SUBMIT REQUEST',
    priceFrom: 'FROM $50/HR',
    aboutTitle: "HI, I'M ANASTASIA — FOUNDER OF THE STUDIO",
    aboutText: 'Our massage studio offers high-quality services in various types of massage. We take pride in the professionalism of our therapists and the cozy atmosphere created for your complete relaxation.',
    aboutMission: 'Our mission is to improve your well-being and provide an unforgettable experience',
    avatarDragHint: 'Drag the photo to adjust framing',
    galTitle: 'IMMERSE YOURSELF IN THE ATMOSPHERE OF COMFORT AND TRANQUILITY',
    galSub: 'Browse our gallery to see where your sessions take place',
    galleryNewSection: 'New section',
    subsTitle: 'OUR SUBSCRIPTIONS',
    subsCta: 'JOIN PROMOTION →',
    subsEmptyHint: 'Add subscriptions in the right panel.',
    catTitle: 'OUR PRODUCT CATALOG',
    catDiscount: '% Off',
    catEmptyHint: 'Add products in the right panel.',
    catOldPriceHint: 'Old price (strikethrough when higher than current)',
    catCurrencyHint: 'Currency symbol (default $). Edit manually.',
    currency: '$',
    specTitle: 'OUR CERTIFIED SPECIALISTS',
    specsHiddenBanner: 'The Specialists block is hidden on the site. Uncheck it in the sidebar to show it again.',
    ctaHiddenBanner: 'The booking block is hidden on the site. Uncheck it in the sidebar to show it again.',
    contactTitle: 'CONTACT US IN ANY CONVENIENT WAY',
    ourContacts: 'Our contacts',
    salonAddr: 'SALON ADDRESS:',
    socials: 'FOLLOW US',
    email: 'info@studio.com',
    workHours: 'Mon-Fri: 9:00 - 18:00',
    workWeekend: 'Sat: 10:00 - 16:00',
    dayOff: 'Sun: day off',
    ctaTitle: "DON'T PUT OFF TAKING CARE OF YOURSELF",
    ctaSub: 'Book now and feel the difference after your very first session. Your body deserves the best.',
    ctaBtn: 'BOOK A SESSION',
  },
  ro: {
    studioTag: 'Studio de masaj.\nDin 2016.',
    addressDefault: 'Oraș, stradă, număr',
    contactOnline: 'Contactați-ne, suntem online',
    callUs: 'Sunați-ne, suntem deschiși Lun-Dum 9:00-21:00',
    phone: '+X (XXX) XXX-XX-XX',
    bookVisit: 'PROGRAMARE',
    heroTitle1: 'STUDIO',
    heroTitle2: 'DE MASAJ',
    heroSub:
      'Cele mai eficiente și plăcute servicii în saloanele de masaj — pentru sănătatea și confortul dumneavoastră',
    heroCta: 'PROGRAMEAZĂ PRIMA ȘEDINȚĂ',
    heroBookOnline: 'Programează-te online',
    heroWhereFind: 'Unde ne găsiți?',
    svcTitle: 'ALEGEȚI SERVICIUL POTRIVIT',
    svcSub: 'Oferim următoarele tipuri de masaj',
    svcAddCard: 'Adaugă card',
    svcDeleteCard: 'Șterge cardul',
    svcCta: 'TRIMITE CEREREA',
    priceFrom: 'DE LA 200 LEI/ORĂ',
    aboutTitle: 'BUNĂ, SUNT ANASTASIA — FONDATOAREA STUDIOULUI',
    aboutText: 'Studioul nostru de masaj oferă servicii de înaltă calitate în diverse tipuri de masaj. Ne mândrim cu profesionalismul terapeuților noștri și cu atmosfera confortabilă.',
    aboutMission: 'Misiunea noastră este îmbunătățirea stării dumneavoastră de bine',
    avatarDragHint: 'Trageți fotografia pentru a ajusta cadrul',
    galTitle: 'SCUFUNDAȚI-VĂ ÎN ATMOSFERA DE CONFORT A SALONULUI NOSTRU',
    galSub: 'Răsfoiți galeria noastră pentru a vedea unde au loc ședințele',
    galleryNewSection: 'Secțiune nouă',
    subsTitle: 'ABONAMENTELE NOASTRE',
    subsCta: 'PARTICIPĂ LA PROMOȚIE →',
    subsEmptyHint: 'Adăugați abonamente în panoul din dreapta.',
    catTitle: 'CATALOGUL PRODUSELOR NOASTRE',
    catDiscount: '% Reducere',
    catEmptyHint: 'Adăugați produse în panoul din dreapta.',
    catOldPriceHint: 'Preț vechi (tăiat dacă e mai mare decât cel curent)',
    catCurrencyHint: 'Simbol monedă (implicit $). Editați manual.',
    currency: 'lei',
    specTitle: 'SPECIALIȘTII NOȘTRI CERTIFICAȚI',
    specsHiddenBanner: 'Blocul Specialiști este ascuns pe site. Debifați în bara laterală pentru a-l afișa din nou.',
    ctaHiddenBanner: 'Blocul de programare este ascuns pe site. Debifați în bara laterală pentru a-l afișa din nou.',
    contactTitle: 'CONTACTAȚI-NE ÎN ORICE MOD CONVENABIL',
    ourContacts: 'Contactele noastre',
    salonAddr: 'ADRESA SALONULUI:',
    socials: 'URMĂRIȚI-NE',
    email: 'info@studio.ro',
    workHours: 'Lun-Vin: 9:00 - 18:00',
    workWeekend: 'Sâm: 10:00 - 16:00',
    dayOff: 'Dum: zi liberă',
    ctaTitle: 'NU AMÂNA GRIJA PENTRU TINE',
    ctaSub: 'Programează-te acum și simte diferența încă de la prima ședință. Corpul tău merită ce e mai bun.',
    ctaBtn: 'PROGRAMEAZĂ O ȘEDINȚĂ',
  },
}

const NAV: Record<Lang, string[]> = {
  ru: ['Услуги', 'О салоне', 'Галерея', 'Абонементы', 'Каталог', 'Специалисты', 'Контакты'],
  en: ['Services', 'About', 'Gallery', 'Subscriptions', 'Catalog', 'Specialists', 'Contacts'],
  ro: ['Servicii', 'Despre noi', 'Galerie', 'Abonamente', 'Catalog', 'Specialiști', 'Contacte'],
}
const NAV_IDS = ['our-services', 'about', 'gallery', 'promos', 'catalog', 'masters', 'contacts']

function isMassageFooterPlaceholderAddress(addr: string): boolean {
  const t = addr.trim()
  if (!t) return true
  if (t === FOOTER_DEFAULT_ADDRESS) return true
  return (Object.values(FOOTER_DEFAULTS_BY_LANG) as Array<{ address: string }>).some(d => d.address === t)
}

/** Премиум-массаж, экран выбора темы: нейтральные ссылки, чтобы в шапке были иконки соцсетей до заполнения полей */
const MASSAGE_WELCOME_DEMO_SOCIAL = {
  whatsappUrl: 'https://www.whatsapp.com/',
  telegramUrl: 'https://t.me/',
  instagramUrl: 'https://www.instagram.com/',
  vkUrl: 'https://vk.com/',
  facebookUrl: 'https://www.facebook.com/',
} as const

const SVC_COLORS = [
  ['#F5E0DF', '#E8C8C7'],
  ['#F0DFE5', '#E0C8D0'],
  ['#EDE0E8', '#D8C8D5'],
  ['#E8E0E0', '#D0C8C8'],
  ['#F5E8E0', '#E8D0C0'],
  ['#E0E0E8', '#C8C8D5'],
  ['#F0E5E0', '#E0D0C8'],
  ['#E8DFE5', '#D0C0CC'],
]

const GALLERY_COLORS = [
  ['#E8DDD5', '#D5C8BB'],
  ['#E0D5D5', '#D0C0C0'],
  ['#D8D5D0', '#C8C0B8'],
  ['#E0DDD8', '#D0C8C0'],
  ['#E5DAD5', '#D2C5BC'],
  ['#DDD5D0', '#CCC0BB'],
  ['#E2DBD8', '#D0C8C2'],
  ['#E0D8D5', '#D5CBC5'],
]

const PINK = '#D4908F'
const PINK_DARK = '#C07F7E'
const PINK_LIGHT = '#F5E0DF'
const BG = '#FAF8F6'

/** Лимиты символов для hero-блока в режиме редактирования конструктора */
const MAX_HERO_TITLE_LINE = 80
const MAX_HERO_SUB = 400
const MAX_HERO_BTN_LABEL = 80
const MAX_ABOUT_TITLE = 500
const MAX_ABOUT_TEXT = 2500
const MAX_ABOUT_MISSION = 600
const MAX_GAL_TITLE = 600
const MAX_GAL_SUB = 400
const MAX_SUBS_TITLE = 200

function normalizeHeroText(s: string): string {
  return s.replace(/\r\n/g, '\n')
}

function clipHeroText(s: string, max: number): string {
  return normalizeHeroText(s).slice(0, max)
}

/** Обрезка при вводе в contentEditable, чтобы не превышать лимит */
function enforceHeroMaxLength(el: HTMLElement, max: number) {
  const t = normalizeHeroText(el.innerText)
  if (t.length <= max) return
  el.innerText = t.slice(0, max)
  const range = document.createRange()
  range.selectNodeContents(el)
  range.collapse(false)
  const sel = window.getSelection()
  sel?.removeAllRanges()
  sel?.addRange(range)
}

function clamp01to100(n: number): number {
  return Math.min(100, Math.max(0, n))
}

function parseAboutAvatarPan(json: string | undefined): { x: number; y: number } {
  if (!json?.trim()) return { x: 50, y: 50 }
  try {
    const o = JSON.parse(json) as { x?: unknown; y?: unknown }
    if (typeof o.x === 'number' && typeof o.y === 'number') {
      return { x: clamp01to100(o.x), y: clamp01to100(o.y) }
    }
  } catch {
    /* ignore */
  }
  return { x: 50, y: 50 }
}

const Pin = ({ size = 'w-5 h-5' }: { size?: string }) => (
  <svg className={`${size} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
  </svg>
)

const PencilSquare = ({ size = 'w-5 h-5' }: { size?: string }) => (
  <svg className={`${size} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
    />
  </svg>
)
const Clock = ({ size = 'w-5 h-5' }: { size?: string }) => (
  <svg className={`${size} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
)
const Phone = ({ size = 'w-5 h-5' }: { size?: string }) => (
  <svg className={`${size} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z" />
  </svg>
)
const Mail = ({ size = 'w-5 h-5' }: { size?: string }) => (
  <svg className={`${size} shrink-0`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
  </svg>
)

const WhatsAppIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)
const ViberIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M6.6 10.1c1.4 2.7 3.6 4.9 6.3 6.3l2.1-2.1c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.9.6.6 0 1 .4 1 1v3.4c0 .6-.4 1-1 1C10.6 20 4 13.4 4 5c0-.6.4-1 1-1h3.4c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.9.1.4 0 .8-.3 1.1l-2.1 2.1z" />
  </svg>
)
const TelegramIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M21.5 3.6L2.6 11.4c-.9.4-.9 1.6.1 2l4.8 1.8 1.9 5.9c.2.7 1.1.9 1.7.5l2.7-2 5 3.7c.6.4 1.5.1 1.6-.7l2.9-17.3c.2-.9-.7-1.7-1.8-1.3zm-5.3 14.6l-3.9-2.9 5.6-5.4c.3-.3-.1-.8-.5-.6l-6.7 4.2-3.7-1.4 12.9-5.3-3.7 11.4z" />
  </svg>
)
const FacebookIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
)
const InstagramIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
  </svg>
)
const VKIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
    <path fill="currentColor" d="M15.684 0H8.316C1.592 0 0 1.592 0 8.316v7.368C0 22.408 1.592 24 8.316 24h7.368C22.408 24 24 22.408 24 15.684V8.316C24 1.592 22.391 0 15.684 0zm3.692 17.123h-1.744c-.66 0-.862-.525-2.049-1.714-1.033-1.01-1.49-1.135-1.744-1.135-.356 0-.458.102-.458.593v1.575c0 .424-.135.678-1.253.678-1.846 0-3.896-1.12-5.339-3.202-2.17-3.042-2.763-5.32-2.763-5.795 0-.254.102-.491.593-.491h1.744c.44 0 .61.203.78.678.864 2.49 2.303 4.675 2.896 4.675.22 0 .322-.102.322-.66V9.721c-.068-1.186-.695-1.287-.695-1.71 0-.204.17-.407.44-.407h2.744c.373 0 .508.203.508.643v3.473c0 .372.17.508.271.508.22 0 .407-.136.813-.542 1.254-1.406 2.151-3.574 2.151-3.574.119-.254.322-.491.762-.491h1.744c.525 0 .644.27.525.643-.22 1.017-2.354 4.031-2.354 4.031-.186.305-.254.44 0 .78.186.254.796.779 1.203 1.253.745.847 1.32 1.558 1.473 2.049.17.474-.085.72-.576.72z" />
  </svg>
)
/** X (Twitter) */
const TwitterIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)
const TikTokIcon = ({ className = '' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
)
const ImgIcon = ({ className = 'w-10 h-10' }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.8} style={{ color: 'rgba(0,0,0,0.15)' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25a2.25 2.25 0 0 0-2.25-2.25H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
  </svg>
)
const PersonIcon = () => (
  <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={0.7} style={{ color: 'rgba(0,0,0,0.12)' }}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
)
const ChevL = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
)
const ChevR = () => (
  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
)

const SocialCircle = ({ bg, children, size = 42 }: { bg: string; children: React.ReactNode; size?: number }) => (
  <div
    className="rounded-full flex items-center justify-center text-white cursor-pointer hover:scale-105 hover:shadow-lg transition-all duration-200"
    style={{ background: bg, width: size, height: size }}
  >
    {children}
  </div>
)

export default function MassageTemplate({
  siteName = '',
  headerSiteName,
  lang = 'ru',
  heroImage = null,
  heroVideo = null,
  headerLogoUrl = null,
  headerLogoShape = 'circle',
  headerLogoVisible = true,
  massageThemeColors,
  onBookNow,
  isEditMode = false,
  welcomeTemplateView = false,
  heroTitle1: heroTitle1Prop,
  heroTitle2: heroTitle2Prop,
  heroSub: heroSubProp,
  heroBookOnline: heroBookOnlineProp,
  heroWhereFind: heroWhereFindProp,
  headerPhone,
  headerAddress,
  headerTagline,
  headerCallUs,
  headerContactOnline,
  telegramUrl = '',
  viberUrl = '',
  whatsappUrl = '',
  instagramUrl = '',
  facebookUrl = '',
  vkUrl = '',
  twitterUrl = '',
  tiktokUrl = '',
  onSaveDraft,
  massageSvcTitle: massageSvcTitleProp,
  massageSvcSub: massageSvcSubProp,
  massageServicesJson,
  massageAboutTitle: massageAboutTitleProp,
  massageAboutText: massageAboutTextProp,
  massageAboutMission: massageAboutMissionProp,
  massageAboutAvatar: massageAboutAvatarProp,
  massageAboutAvatarPan: massageAboutAvatarPanProp,
  massageGalTitle: massageGalTitleProp,
  massageGalSub: massageGalSubProp,
  massageGalleryJson: massageGalleryJsonProp,
  massageSubsTitle: massageSubsTitleProp,
  massageSubsJson: massageSubsJsonProp,
  massageSubsCtaUrl: massageSubsCtaUrlProp,
  massageSubsCtaHidden: massageSubsCtaHiddenProp,
  massageSubsHidden: massageSubsHiddenProp,
  massageCatalogTitle: massageCatalogTitleProp,
  massageCatalogJson: massageCatalogJsonProp,
  massageCatalogHidden: massageCatalogHiddenProp,
  massageSpecsTitle: massageSpecsTitleProp,
  massageSpecsJson: massageSpecsJsonProp,
  massageSpecsHidden: massageSpecsHiddenProp,
  massageCtaTitle: massageCtaTitleProp,
  massageCtaSub: massageCtaSubProp,
  massageCtaBtn: massageCtaBtnProp,
  massageCtaHidden: massageCtaHiddenProp,
  massageContactTitle: massageContactTitleProp,
  massageContactOurHeading: massageContactOurHeadingProp,
  massageContactSchedule: massageContactScheduleProp,
  massageContactEmail: massageContactEmailProp,
  mapLat: mapLatProp,
  mapLng: mapLngProp,
  massageContactMapLabel: massageContactMapLabelProp,
}: MassageTemplateProps) {
  const t = UI[lang] ?? UI.ru
  const theme = massageThemeColors
  const col = (k: keyof MassageThemeColors) => resolveMassageThemeColor(k, theme)
  const galTitleCol = col('galTitle')
  const galSubCol = col('galSub')
  const galTabActiveCol = col('galTabActive')
  const subsCtaTextCol = col('subsCtaText')
  const subsBlockTitleCol = col('subsBlockTitle')
  const subsCardTitleCol = col('subsCardTitle')
  const subsCardDescCol = col('subsCardDesc')
  const subsCardBgFrom = col('subsCardBgFrom')
  const subsCardBgTo = col('subsCardBgTo')
  const subsCtaBgCol = col('subsCtaBg')
  const contactsBlockTitleCol = col('contactsBlockTitle')
  const contactsSectionHeadingCol = col('contactsSectionHeading')
  const contactsIconCol = col('contactsIcon')
  const contactsBodyCol = col('contactsBody')
  const contactsLabelCol = col('contactsLabel')
  const galTabsFallback = GAL_TABS[lang] ?? GAL_TABS.ru
  const logoShapeClass =
    headerLogoShape === 'square' ? 'rounded-none' : headerLogoShape === 'rounded' ? 'rounded-xl' : 'rounded-full'
  const showHeaderLogo = headerLogoVisible !== false && !!headerLogoUrl && headerLogoUrl.length > 0

  const socialUrls = useMemo(() => {
    if (!welcomeTemplateView) {
      return {
        telegramUrl,
        viberUrl,
        whatsappUrl,
        instagramUrl,
        facebookUrl,
        vkUrl,
        twitterUrl,
        tiktokUrl,
      }
    }
    const d = MASSAGE_WELCOME_DEMO_SOCIAL
    const p = (saved: string, demo: string) => (saved.trim() ? saved : demo)
    return {
      whatsappUrl: p(whatsappUrl, d.whatsappUrl),
      telegramUrl: p(telegramUrl, d.telegramUrl),
      instagramUrl: p(instagramUrl, d.instagramUrl),
      vkUrl: p(vkUrl, d.vkUrl),
      facebookUrl: p(facebookUrl, d.facebookUrl),
      viberUrl: viberUrl.trim(),
      twitterUrl: twitterUrl.trim(),
      tiktokUrl: tiktokUrl.trim(),
    }
  }, [
    welcomeTemplateView,
    telegramUrl,
    viberUrl,
    whatsappUrl,
    instagramUrl,
    facebookUrl,
    vkUrl,
    twitterUrl,
    tiktokUrl,
  ])

  const displayServices = useMemo(
    () => mergeMassageServicesFromDraft(lang, massageServicesJson),
    [lang, massageServicesJson]
  )
  const patchServiceCard = useCallback(
    (index: number, patch: Partial<MassageServiceMerged>) => {
      if (!onSaveDraft) return
      const current = mergeMassageServicesFromDraft(lang, massageServicesJson)
      const next = current.map((row, i) => (i === index ? { ...row, ...patch } : row))
      onSaveDraft('publicMassageServicesJson', serializeMassageServicesForDraft(next))
    },
    [lang, massageServicesJson, onSaveDraft]
  )
  const removeServiceCard = useCallback(
    (index: number) => {
      if (!onSaveDraft) return
      const current = mergeMassageServicesFromDraft(lang, massageServicesJson)
      if (current.length <= 1) return
      const next = current.filter((_, i) => i !== index)
      onSaveDraft('publicMassageServicesJson', serializeMassageServicesForDraft(next))
    },
    [lang, massageServicesJson, onSaveDraft]
  )
  const appendServiceCard = useCallback(() => {
    if (!onSaveDraft) return
    const current = mergeMassageServicesFromDraft(lang, massageServicesJson)
    if (current.length >= MASSAGE_SERVICES_MAX) return
    const base = SERVICES[lang] ?? SERVICES.ru
    const template = base[current.length % base.length]
    const next = [
      ...current,
      {
        title: template.title,
        desc: template.desc,
        price: template.price,
        hideImage: false,
        image: undefined,
      },
    ]
    onSaveDraft('publicMassageServicesJson', serializeMassageServicesForDraft(next))
  }, [lang, massageServicesJson, onSaveDraft])

  const displayGallery = useMemo(
    () => mergeMassageGalleryFromDraft(lang, massageGalleryJsonProp),
    [lang, massageGalleryJsonProp]
  )

  const subsCatalog = SUBS[lang] ?? SUBS.ru
  const displaySubItems = useMemo(
    () =>
      mergeMassageSubscriptionsFromDraft(lang, readMassageSubsJsonRaw(massageSubsJsonProp, welcomeTemplateView)),
    [lang, massageSubsJsonProp, welcomeTemplateView]
  )
  const displaySubs = useMemo(
    () =>
      displaySubItems.map(item => {
        const row = subsCatalog[item.templateIndex] ?? subsCatalog[0]
        return {
          ...row,
          id: item.id,
          templateIndex: item.templateIndex,
          title: item.title != null ? item.title : row.title,
          desc: item.desc != null ? item.desc : row.desc,
        }
      }),
    [displaySubItems, subsCatalog]
  )

  const catalogBlockHidden = massageCatalogHiddenProp === 'true'
  const subsBlockHidden = massageSubsHiddenProp === 'true'
  const specsHidden = massageSpecsHiddenProp === 'true'
  const ctaBlockHidden = massageCtaHiddenProp === 'true'
  const navItems = useMemo(() => {
    const labels = NAV[lang] ?? NAV.ru
    let pairs = labels.map((label, i) => ({ label, id: NAV_IDS[i] }))
    if (subsBlockHidden) pairs = pairs.filter(p => p.id !== 'promos')
    if (catalogBlockHidden) pairs = pairs.filter(p => p.id !== 'catalog')
    if (specsHidden) pairs = pairs.filter(p => p.id !== 'masters')
    return pairs
  }, [lang, subsBlockHidden, catalogBlockHidden, specsHidden])

  const removeSubItem = useCallback(
    (id: string) => {
      if (!onSaveDraft) return
      const current = mergeMassageSubscriptionsFromDraft(
        lang,
        readMassageSubsJsonRaw(massageSubsJsonProp, welcomeTemplateView)
      )
      const next = current.filter(row => row.id !== id)
      onSaveDraft('publicMassageSubsJson', serializeMassageSubscriptionsForDraft(next))
    },
    [lang, massageSubsJsonProp, onSaveDraft, welcomeTemplateView]
  )
  const patchSubItem = useCallback(
    (itemId: string, patch: Partial<MassageSubscriptionItemMerged>) => {
      if (!onSaveDraft) return
      const current = mergeMassageSubscriptionsFromDraft(
        lang,
        readMassageSubsJsonRaw(massageSubsJsonProp, welcomeTemplateView)
      )
      const next = current.map(row => (row.id === itemId ? { ...row, ...patch } : row))
      onSaveDraft('publicMassageSubsJson', serializeMassageSubscriptionsForDraft(next))
    },
    [lang, massageSubsJsonProp, onSaveDraft, welcomeTemplateView]
  )

  const removeGallerySection = useCallback(
    (index: number) => {
      if (!onSaveDraft) return
      const current = mergeMassageGalleryFromDraft(lang, massageGalleryJsonProp)
      if (current.length <= 1) return
      const next = current.filter((_, i) => i !== index)
      onSaveDraft('publicMassageGalleryJson', serializeMassageGalleryForDraft(next))
    },
    [lang, massageGalleryJsonProp, onSaveDraft]
  )

  const displaySpecs = useMemo(
    () => mergeMassageSpecsFromDraft(lang, massageSpecsJsonProp),
    [lang, massageSpecsJsonProp]
  )
  const specsTitleDisplay =
    massageSpecsTitleProp != null && massageSpecsTitleProp.trim() !== ''
      ? massageSpecsTitleProp
      : t.specTitle

  const ctaTitleDisplay =
    massageCtaTitleProp != null && massageCtaTitleProp.trim() !== '' ? massageCtaTitleProp : t.ctaTitle
  const ctaSubDisplay =
    massageCtaSubProp != null && massageCtaSubProp.trim() !== '' ? massageCtaSubProp : t.ctaSub
  const ctaBtnDisplay =
    massageCtaBtnProp != null && massageCtaBtnProp.trim() !== '' ? massageCtaBtnProp : t.ctaBtn

  const ctaBgFrom = col('ctaBlockBgFrom')
  const ctaBgTo = col('ctaBlockBgTo')
  const ctaTitleCol = col('ctaBlockTitle')
  const ctaSubCol = col('ctaBlockSub')
  const ctaBtnBgCol = col('ctaBlockBtnBg')
  const ctaBtnTextCol = col('ctaBlockBtnText')

  const defaultContactSchedule = useMemo(
    () => [t.workHours, t.workWeekend, t.dayOff].join('\n'),
    [t.workHours, t.workWeekend, t.dayOff]
  )
  const contactTitleDisplay =
    massageContactTitleProp != null && massageContactTitleProp.trim() !== ''
      ? massageContactTitleProp
      : t.contactTitle
  const contactOurHeadingDisplay =
    massageContactOurHeadingProp != null && massageContactOurHeadingProp.trim() !== ''
      ? massageContactOurHeadingProp
      : t.ourContacts
  const contactScheduleDisplay =
    massageContactScheduleProp != null && massageContactScheduleProp.trim() !== ''
      ? massageContactScheduleProp
      : defaultContactSchedule
  const contactEmailDisplay =
    massageContactEmailProp != null && massageContactEmailProp.trim() !== ''
      ? massageContactEmailProp
      : t.email
  const contactMapCaptionDisplay =
    massageContactMapLabelProp != null && massageContactMapLabelProp.trim() !== ''
      ? massageContactMapLabelProp
      : t.salonAddr

  const contactMapEmbedSrc = useMemo(() => {
    if (welcomeTemplateView) return DEFAULT_WORLD_MAP_EMBED_URL
    const z = 17
    const lat = mapLatProp ? parseFloat(mapLatProp) : NaN
    const lng = mapLngProp ? parseFloat(mapLngProp) : NaN
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return `https://www.google.com/maps?q=${lat},${lng}&z=${z}&output=embed&hl=en`
    }
    const addrTrim = (headerAddress ?? '').trim()
    if (isMassageFooterPlaceholderAddress(addrTrim)) return DEFAULT_WORLD_MAP_EMBED_URL
    return `https://www.google.com/maps?q=${encodeURIComponent(addrTrim)}&z=${z}&output=embed&hl=en`
  }, [welcomeTemplateView, mapLatProp, mapLngProp, headerAddress])

  const patchSpec = useCallback(
    (specId: string, patch: Partial<MassageSpecialistMerged>) => {
      if (!onSaveDraft) return
      const current = mergeMassageSpecsFromDraft(lang, massageSpecsJsonProp)
      const next = current.map(row => (row.id === specId ? { ...row, ...patch } : row))
      onSaveDraft('publicMassageSpecsJson', serializeMassageSpecsForDraft(next))
    },
    [lang, massageSpecsJsonProp, onSaveDraft]
  )

  const removeSpec = useCallback(
    (specId: string) => {
      if (!onSaveDraft) return
      const current = mergeMassageSpecsFromDraft(lang, massageSpecsJsonProp)
      const next = current.filter(row => row.id !== specId)
      onSaveDraft('publicMassageSpecsJson', serializeMassageSpecsForDraft(next))
    },
    [lang, massageSpecsJsonProp, onSaveDraft]
  )

  const name =
    ((headerSiteName !== undefined && headerSiteName !== '' ? headerSiteName : null) ?? siteName) || 'Lotos'
  const heroLine1 = heroTitle1Prop || t.heroTitle1
  const heroLine2 = heroTitle2Prop || t.heroTitle2
  const heroSubText = heroSubProp || t.heroSub
  const heroBookLabel = welcomeTemplateView
    ? t.heroBookOnline
    : heroBookOnlineProp != null && heroBookOnlineProp.trim() !== ''
      ? heroBookOnlineProp.trim()
      : t.heroBookOnline
  const heroWhereLabel = welcomeTemplateView
    ? t.heroWhereFind
    : heroWhereFindProp != null && heroWhereFindProp.trim() !== ''
      ? heroWhereFindProp.trim()
      : t.heroWhereFind

  const defaultAboutHeadline = `${t.aboutTitle} ${name.toUpperCase()}`
  const aboutHeadlineDisplay =
    massageAboutTitleProp != null && massageAboutTitleProp.trim() !== ''
      ? massageAboutTitleProp
      : defaultAboutHeadline
  const aboutTextDisplay =
    massageAboutTextProp != null && massageAboutTextProp.trim() !== '' ? massageAboutTextProp : t.aboutText
  const aboutMissionDisplay =
    massageAboutMissionProp != null && massageAboutMissionProp.trim() !== ''
      ? massageAboutMissionProp
      : t.aboutMission

  const galTitleDisplay =
    massageGalTitleProp != null && massageGalTitleProp.trim() !== '' ? massageGalTitleProp : t.galTitle
  const galSubDisplay =
    massageGalSubProp != null && massageGalSubProp.trim() !== '' ? massageGalSubProp : t.galSub

  const subsTitleDisplay =
    massageSubsTitleProp != null && massageSubsTitleProp.trim() !== ''
      ? massageSubsTitleProp
      : t.subsTitle

  const catalogTitleDisplay =
    massageCatalogTitleProp != null && massageCatalogTitleProp.trim() !== ''
      ? massageCatalogTitleProp
      : t.catTitle

  const displayCatalog = useMemo(
    () => mergeMassageCatalogFromDraft(lang, massageCatalogJsonProp),
    [lang, massageCatalogJsonProp]
  )

  const patchCatalogProduct = useCallback(
    (index: number, patch: Partial<MassageCatalogProductMerged>) => {
      if (!onSaveDraft) return
      const current = mergeMassageCatalogFromDraft(lang, massageCatalogJsonProp)
      const next = current.map((row, i) => (i === index ? { ...row, ...patch } : row))
      onSaveDraft('publicMassageCatalogJson', serializeMassageCatalogForDraft(next))
    },
    [lang, massageCatalogJsonProp, onSaveDraft]
  )

  const removeCatalogProduct = useCallback(
    (productId: string) => {
      if (!onSaveDraft) return
      const current = mergeMassageCatalogFromDraft(lang, massageCatalogJsonProp)
      const next = current.filter(row => row.id !== productId)
      onSaveDraft('publicMassageCatalogJson', serializeMassageCatalogForDraft(next))
    },
    [lang, massageCatalogJsonProp, onSaveDraft]
  )

  const rootRef = useRef<HTMLDivElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const [heroH, setHeroH] = useState('70vh')
  const [activeGalTab, setActiveGalTab] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isLangOpen, setIsLangOpen] = useState(false)
  const enabledLangs = useMemo(() => getEnabledSiteLangs(), [])
  const showLangSwitcher = enabledLangs.length > 1

  const handleLangChange = useCallback((code: Lang) => {
    setIsLangOpen(false)
    try {
      localStorage.setItem('publicLang', code)
      window.parent.postMessage({ type: 'constructorPublicLangChanged' }, '*')
      window.location.reload()
    } catch { /* ignore */ }
  }, [])

  const gallerySlidesTripled = useMemo(() => {
    const cur =
      displayGallery[activeGalTab]?.photos ??
      (Array(MASSAGE_GALLERY_PHOTOS_PER_SECTION).fill(null) as (string | null)[])
    return [...cur, ...cur, ...cur]
  }, [displayGallery, activeGalTab])

  const savedAboutAvatarPan = useMemo(
    () => parseAboutAvatarPan(massageAboutAvatarPanProp),
    [massageAboutAvatarPanProp]
  )
  const [aboutAvatarPan, setAboutAvatarPan] = useState(savedAboutAvatarPan)
  const [aboutAvatarDragging, setAboutAvatarDragging] = useState(false)
  const aboutAvatarPanDragRef = useRef<{
    startX: number
    startY: number
    startPan: { x: number; y: number }
  } | null>(null)
  const aboutAvatarPanLiveRef = useRef(savedAboutAvatarPan)

  useEffect(() => {
    setAboutAvatarPan(savedAboutAvatarPan)
    aboutAvatarPanLiveRef.current = savedAboutAvatarPan
  }, [savedAboutAvatarPan])

  useEffect(() => {
    const calc = () => {
      const tH = topBarRef.current?.offsetHeight ?? 0
      const nH = navRef.current?.offsetHeight ?? 0
      setHeroH(`calc(100vh - ${tH}px - ${nH}px)`)
    }
    calc()
    window.addEventListener('resize', calc)
    return () => window.removeEventListener('resize', calc)
  }, [])

  /** Карусели: на узком экране 1–2 карточки, на планшете 3, на десктопе как раньше */
  const [visibleGal, setVisibleGal] = useState(4)
  const [visibleSubs, setVisibleSubs] = useState(3)
  const [visibleCat, setVisibleCat] = useState(4)
  useEffect(() => {
    const upd = () => {
      const w = window.innerWidth
      if (w < 480) {
        setVisibleGal(1)
        setVisibleSubs(1)
        setVisibleCat(1)
      } else if (w < 640) {
        setVisibleGal(2)
        setVisibleSubs(2)
        setVisibleCat(2)
      } else if (w < 1024) {
        setVisibleGal(3)
        setVisibleSubs(3)
        setVisibleCat(3)
      } else {
        setVisibleGal(4)
        setVisibleSubs(3)
        setVisibleCat(4)
      }
    }
    upd()
    window.addEventListener('resize', upd)
    return () => window.removeEventListener('resize', upd)
  }, [])

  const galTotal = MASSAGE_GALLERY_PHOTOS_PER_SECTION
  const galCanScroll = galTotal > visibleGal
  const [galSlide, setGalSlide] = useState(galCanScroll ? galTotal : 0)
  const [galSmooth, setGalSmooth] = useState(true)

  const subsTotal = displaySubs.length
  const subsCanScroll = subsTotal > visibleSubs
  const [subsSlide, setSubsSlide] = useState(subsCanScroll ? subsTotal : 0)
  const [subsSmooth, setSubsSmooth] = useState(true)
  /** Пока карусель отключена (≤3 карточек), старый subsSlide от «длинной» карусели уводит ряд за экран до useEffect — обнуляем сразу. */
  const subsSlideVisual = subsCanScroll ? subsSlide : 0

  const handleSubsCtaClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const url = massageSubsCtaUrlProp?.trim()
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else onBookNow?.()
  }
  const subsCtaHidden = massageSubsCtaHiddenProp === 'true'

  const catTotal = displayCatalog.length
  const [catSlide, setCatSlide] = useState(0)
  const catAtStart = catSlide === 0
  const catAtEnd = catTotal <= visibleCat ? true : catSlide >= catTotal - visibleCat

  useEffect(() => {
    setCatSlide(s => {
      const maxStart = Math.max(0, displayCatalog.length - visibleCat)
      return s > maxStart ? maxStart : s
    })
  }, [displayCatalog.length, visibleCat])

  const galPrev = () => { setGalSmooth(true); setGalSlide(s => s - 1) }
  const galNext = () => { setGalSmooth(true); setGalSlide(s => s + 1) }
  const subsPrev = () => { setSubsSmooth(true); setSubsSlide(s => s - 1) }
  const subsNext = () => { setSubsSmooth(true); setSubsSlide(s => s + 1) }

  const handleGalTransEnd = () => {
    if (galSlide >= galTotal * 2) {
      setGalSmooth(false)
      setGalSlide(galSlide - galTotal)
    } else if (galSlide < galTotal) {
      setGalSmooth(false)
      setGalSlide(galSlide + galTotal)
    }
  }
  const handleSubsTransEnd = () => {
    if (subsSlide >= subsTotal * 2) {
      setSubsSmooth(false)
      setSubsSlide(subsSlide - subsTotal)
    } else if (subsSlide < subsTotal) {
      setSubsSmooth(false)
      setSubsSlide(subsSlide + subsTotal)
    }
  }

  useEffect(() => {
    if (!galSmooth) requestAnimationFrame(() => requestAnimationFrame(() => setGalSmooth(true)))
  }, [galSmooth])

  useEffect(() => {
    setActiveGalTab(a => {
      const max = Math.max(0, displayGallery.length - 1)
      return a > max ? max : a
    })
  }, [displayGallery.length])

  /** При добавлении секции в конструкторе — переключаемся на неё, чтобы цвет темы (активная вкладка) сразу применялся */
  const galleryLenPrevRef = useRef<number | null>(null)
  useEffect(() => {
    const n = displayGallery.length
    const prev = galleryLenPrevRef.current
    galleryLenPrevRef.current = n
    if (prev !== null && n > prev) {
      setActiveGalTab(Math.max(0, n - 1))
    }
  }, [displayGallery.length])

  useEffect(() => {
    setGalSlide(galCanScroll ? galTotal : 0)
  }, [activeGalTab, galTotal, galCanScroll, visibleGal])
  useEffect(() => {
    if (!subsSmooth) requestAnimationFrame(() => requestAnimationFrame(() => setSubsSmooth(true)))
  }, [subsSmooth])

  useLayoutEffect(() => {
    setSubsSlide(subsCanScroll ? subsTotal : 0)
  }, [subsTotal, subsCanScroll, visibleSubs])

  useEffect(() => {
    const scrollParent = rootRef.current?.closest('[data-scroll-container]') as HTMLElement | null
    const target = scrollParent || window
    const handler = () => {
      const scrollTop = scrollParent ? scrollParent.scrollTop : window.scrollY
      setShowScrollTop(scrollTop > 400)
    }
    target.addEventListener('scroll', handler, { passive: true })
    return () => target.removeEventListener('scroll', handler)
  }, [])

  const scrollToTop = () => {
    const scrollParent = rootRef.current?.closest('[data-scroll-container]') as HTMLElement | null
    if (scrollParent) scrollParent.scrollTo({ top: 0, behavior: 'smooth' })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const scrollParent = rootRef.current?.closest('[data-scroll-container]') as HTMLElement | null
    if (scrollParent) {
      const rootRect = scrollParent.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const top = elRect.top - rootRect.top + scrollParent.scrollTop
      scrollParent.scrollTo({ top, behavior: 'smooth' })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div
      ref={rootRef}
      className="min-h-screen text-[#1a1a1a]"
      style={{ background: BG, fontFamily: "'Georgia', 'Times New Roman', serif" }}
    >

      {/* ============ TOP CONTACT BAR — в потоке; навигация ниже — sticky (как на десктопе на всех ширинах). ============ */}
      <div
        id="massage-block-header"
        ref={topBarRef}
        className="w-full border-b border-gray-100"
        style={{ backgroundColor: col('topBarBg') }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 py-3 sm:py-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
            {/* Logo + название + теглайн: по центру на мобильных, слева на md+ */}
            <div className="flex flex-col items-center text-center gap-2 w-full min-w-0 md:flex-row md:items-center md:text-left md:justify-start md:gap-3 md:w-auto">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center sm:gap-3">
                {showHeaderLogo && (
                  <img
                    src={headerLogoUrl!}
                    alt=""
                    className={`h-11 w-11 sm:h-14 sm:w-14 shrink-0 object-cover border border-gray-200/80 ${logoShapeClass}`}
                  />
                )}
                <span
                  className={`text-2xl sm:text-3xl italic font-bold leading-tight min-w-0 max-w-full px-1${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                  style={{ color: col('siteName') }}
                  contentEditable={!!isEditMode}
                  suppressContentEditableWarning
                  onBlur={e => isEditMode && onSaveDraft?.('publicSiteName', e.currentTarget.textContent ?? '')}
                >
                  {name}
                </span>
              </div>
              <span
                className={`text-[10px] sm:text-[11px] leading-snug whitespace-pre-line w-full max-w-md md:max-w-[140px] md:border-l border-gray-200 md:pl-3 pt-1 md:pt-0 border-t border-gray-100 md:border-t-0 mt-0.5 md:mt-0${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                style={{ fontFamily: 'sans-serif', color: col('tagline') }}
                contentEditable={!!isEditMode}
                suppressContentEditableWarning
                onBlur={e => isEditMode && onSaveDraft?.('publicTagline', e.currentTarget.textContent ?? '')}
              >
                {headerTagline ?? t.studioTag}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto min-w-0">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: PINK_LIGHT, color: col('contactOnline') }}
              >
                <Pin size="w-5 h-5" />
              </div>
              <div
                className={`text-xs sm:text-sm font-semibold min-w-0 flex-1${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                style={{ color: col('address') }}
                contentEditable={!!isEditMode}
                suppressContentEditableWarning
                onBlur={e => isEditMode && onSaveDraft?.('publicAddress', e.currentTarget.textContent ?? '')}
              >
                {headerAddress ?? t.addressDefault}
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3 flex-wrap w-full md:w-auto">
              {socialUrls.whatsappUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicWhatsapp', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={socialUrls.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#25D366"><WhatsAppIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#25D366"><WhatsAppIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {socialUrls.viberUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicViber', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={socialUrls.viberUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#7F00FF"><ViberIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#7F00FF"><ViberIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {socialUrls.telegramUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicTelegram', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={socialUrls.telegramUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#0088cc"><TelegramIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#0088cc"><TelegramIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {socialUrls.instagramUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicInstagram', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={socialUrls.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#E1306C"><InstagramIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#E1306C"><InstagramIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {socialUrls.facebookUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicFacebook', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={socialUrls.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#1877F2"><FacebookIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#1877F2"><FacebookIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {socialUrls.vkUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicVk', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={socialUrls.vkUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#4680C2"><VKIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#4680C2"><VKIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {socialUrls.twitterUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicTwitter', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={socialUrls.twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#0f1419"><TwitterIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#0f1419"><TwitterIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {socialUrls.tiktokUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicTiktok', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={socialUrls.tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#010101"><TikTokIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#010101"><TikTokIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
            </div>

            {/* Contact info */}
            <div className="text-center md:text-right w-full md:w-auto border-t border-gray-100 md:border-t-0 pt-3 md:pt-0">
              <div
                className={`text-xs font-medium${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                style={{ color: col('contactOnline'), fontFamily: 'sans-serif' }}
                contentEditable={!!isEditMode}
                suppressContentEditableWarning
                onBlur={e => isEditMode && onSaveDraft?.('publicContactOnline', e.currentTarget.textContent ?? '')}
              >
                {headerContactOnline ?? t.contactOnline}
              </div>
              <div
                className={`text-xs mt-0.5${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                style={{ fontFamily: 'sans-serif', color: col('callUs') }}
                contentEditable={!!isEditMode}
                suppressContentEditableWarning
                onBlur={e => isEditMode && onSaveDraft?.('publicCallUs', e.currentTarget.textContent ?? '')}
              >
                {headerCallUs ?? t.callUs}
              </div>
              <div
                className={`text-base font-bold mt-1${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                style={{ fontFamily: 'sans-serif', color: col('phone') }}
                contentEditable={!!isEditMode}
                suppressContentEditableWarning
                onBlur={e => isEditMode && onSaveDraft?.('publicPhone', e.currentTarget.textContent ?? '')}
              >
                {headerPhone ?? t.phone}
              </div>
            </div>
          </div>
        </div>

      {/* ============ NAVIGATION — sticky top (шапка контактов уезжает вверх, меню прилипает). ============ */}
      <nav
        ref={navRef}
        className="sticky top-0 z-30 border-b border-gray-100 shadow-sm"
        style={{ backgroundColor: col('navBg') }}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-5 md:px-6 flex flex-wrap justify-center items-center gap-x-3 sm:gap-x-5 md:gap-8 gap-y-2 py-2.5 sm:py-3.5">
          {navItems.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="text-center text-xs sm:text-sm transition-colors font-medium tracking-wide hover:opacity-80 py-1 px-1.5 touch-manipulation whitespace-nowrap shrink-0"
              style={{ fontFamily: 'inherit', color: col('navLink') }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ============ HERO — fills remaining first screen ============ */}
      <section
        className="relative overflow-hidden flex items-center min-h-[min(52vh,380px)] sm:min-h-0"
        style={{ height: heroH }}
      >
        {heroVideo ? (
          <video
            src={heroVideo}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            autoPlay
            playsInline
            aria-hidden
          />
        ) : heroImage ? (
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(135deg, ${BG} 30%, ${PINK_LIGHT} 100%)` }}
          />
        )}
        {/* Лёгкая вуаль для читаемости текста; для фото/видео — слабее, фон не «гасим» */}
        {heroVideo || heroImage ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-white/25 via-white/10 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-r from-white/80 via-white/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/60 via-transparent to-transparent" />
          </>
        )}

        <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-20 max-w-[100vw] overflow-x-hidden text-center md:text-left">
          <h1 className="text-[clamp(2.25rem,10vw,4.5rem)] sm:text-6xl md:text-7xl lg:text-9xl italic font-bold leading-[0.9] sm:leading-[0.85] break-words mx-auto md:mx-0 max-w-5xl">
            <span
              className={`block whitespace-pre-line${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
              style={{ color: col('heroLine1') }}
              contentEditable={!!isEditMode}
              suppressContentEditableWarning
              onKeyDown={e => {
                if (!isEditMode) return
                /* Перенос строки — Shift+Enter (как в текстовых полях); один Enter не ломает разметку */
                if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
              }}
              onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_HERO_TITLE_LINE)}
              onBlur={e =>
                isEditMode &&
                onSaveDraft?.('publicHeroTitle1', clipHeroText(e.currentTarget.innerText ?? '', MAX_HERO_TITLE_LINE))
              }
            >
              {heroLine1}
            </span>
            <span
              className={`block whitespace-pre-line${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
              style={{ color: col('heroLine2') }}
              contentEditable={!!isEditMode}
              suppressContentEditableWarning
              onKeyDown={e => {
                if (!isEditMode) return
                if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
              }}
              onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_HERO_TITLE_LINE)}
              onBlur={e =>
                isEditMode &&
                onSaveDraft?.('publicHeroTitle2', clipHeroText(e.currentTarget.innerText ?? '', MAX_HERO_TITLE_LINE))
              }
            >
              {heroLine2}
            </span>
          </h1>
          <p
            className={`mt-4 sm:mt-6 text-sm sm:text-base md:text-lg max-w-lg mx-auto md:mx-0 leading-relaxed whitespace-pre-line${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
            style={{ fontFamily: 'sans-serif', color: col('heroSub') }}
            contentEditable={!!isEditMode}
            suppressContentEditableWarning
            onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_HERO_SUB)}
            onBlur={e =>
              isEditMode &&
              onSaveDraft?.('publicHeroSub', clipHeroText(e.currentTarget.innerText ?? '', MAX_HERO_SUB))
            }
          >
            {heroSubText}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col gap-3 w-full max-w-md mx-auto md:mx-0">
            <div
              role="button"
              tabIndex={isEditMode ? -1 : 0}
              onClick={() => {
                if (isEditMode) return
                onBookNow?.()
              }}
              onKeyDown={e => {
                if (isEditMode) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onBookNow?.()
                }
              }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-0 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-full text-sm font-semibold tracking-wide transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 border-solid touch-manipulation cursor-pointer select-none"
              style={{
                fontFamily: 'sans-serif',
                backgroundColor: col('heroPrimBtnBg'),
                borderColor: col('heroCtaBorder'),
              }}
              onMouseEnter={e => {
                if (!isEditMode) e.currentTarget.style.backgroundColor = col('heroPrimBtnHover')
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = col('heroPrimBtnBg')
              }}
              aria-label={heroBookLabel}
            >
              <PencilSquare size="w-5 h-5" />
              {isEditMode && onSaveDraft ? (
                <span
                  key={`hero-book-${lang}-${heroBookLabel}`}
                  className="min-w-0 text-center outline-none border-b border-dashed border-white/70"
                  contentEditable
                  suppressContentEditableWarning
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  onInput={e => enforceHeroMaxLength(e.currentTarget, MAX_HERO_BTN_LABEL)}
                  onBlur={e =>
                    onSaveDraft(
                      'publicHeroBookOnline',
                      clipHeroText(e.currentTarget.innerText ?? '', MAX_HERO_BTN_LABEL)
                    )
                  }
                >
                  {heroBookLabel}
                </span>
              ) : (
                <span>{heroBookLabel}</span>
              )}
            </div>
            <div
              role="button"
              tabIndex={isEditMode ? -1 : 0}
              onClick={() => {
                if (isEditMode) return
                scrollTo('contacts')
              }}
              onKeyDown={e => {
                if (isEditMode) return
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  scrollTo('contacts')
                }
              }}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto min-w-0 rounded-xl px-4 py-3 text-sm font-medium text-white border-2 border-solid touch-manipulation transition-all duration-200 cursor-pointer select-none"
              style={{
                fontFamily: 'sans-serif',
                backgroundColor: col('heroSecBtnBg'),
                borderColor: col('heroSecBtnBorder'),
              }}
              onMouseEnter={e => {
                if (!isEditMode) e.currentTarget.style.backgroundColor = col('heroSecBtnHover')
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundColor = col('heroSecBtnBg')
              }}
              aria-label={heroWhereLabel}
            >
              <Pin size="w-5 h-5" />
              {isEditMode && onSaveDraft ? (
                <span
                  key={`hero-where-${lang}-${heroWhereLabel}`}
                  className="min-w-0 text-center outline-none border-b border-dashed border-white/50"
                  contentEditable
                  suppressContentEditableWarning
                  onMouseDown={e => e.stopPropagation()}
                  onClick={e => e.stopPropagation()}
                  onInput={e => enforceHeroMaxLength(e.currentTarget, MAX_HERO_BTN_LABEL)}
                  onBlur={e =>
                    onSaveDraft(
                      'publicHeroWhereFind',
                      clipHeroText(e.currentTarget.innerText ?? '', MAX_HERO_BTN_LABEL)
                    )
                  }
                >
                  {heroWhereLabel}
                </span>
              ) : (
                <span>{heroWhereLabel}</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section id="our-services" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          <h2
            className={`text-2xl sm:text-3xl md:text-5xl italic font-bold leading-tight text-center px-1${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
            style={{ color: col('svcBlockTitle') }}
            contentEditable={!!isEditMode}
            suppressContentEditableWarning
            onBlur={e =>
              isEditMode && onSaveDraft?.('publicMassageSvcTitle', e.currentTarget.textContent?.trim() ?? '')
            }
          >
            {massageSvcTitleProp ?? t.svcTitle}
          </h2>
          <p
            className={`mt-3 text-sm text-center max-w-2xl mx-auto${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
            style={{ fontFamily: 'sans-serif', color: col('svcBlockSub') }}
            contentEditable={!!isEditMode}
            suppressContentEditableWarning
            onBlur={e =>
              isEditMode && onSaveDraft?.('publicMassageSvcSub', e.currentTarget.textContent?.trim() ?? '')
            }
          >
            {massageSvcSubProp ?? t.svcSub}
          </p>
          <div
            className={cn(
              'mt-10 grid gap-4 md:gap-5',
              isEditMode
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
            )}
          >
            {displayServices.map((svc, i) => (
              <div
                key={i}
                className="relative rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col text-center"
                style={{ background: '#f3eded' }}
              >
                {isEditMode && displayServices.length > 1 && (
                  <button
                    type="button"
                    aria-label={t.svcDeleteCard}
                    onClick={() => removeServiceCard(i)}
                    className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/55 text-white text-lg leading-none hover:bg-red-600 transition-colors shadow-md"
                  >
                    ×
                  </button>
                )}
                {!svc.hideImage && (
                  <div
                    className="relative h-52 w-full flex items-center justify-center overflow-hidden shrink-0"
                    style={
                      svc.image
                        ? undefined
                        : { background: `linear-gradient(160deg, ${SVC_COLORS[i % SVC_COLORS.length][0]}, ${SVC_COLORS[i % SVC_COLORS.length][1]})` }
                    }
                  >
                    {svc.image ? (
                      <img src={svc.image} alt="" className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      <ImgIcon className="relative z-10 w-14 h-14 opacity-40" />
                    )}
                  </div>
                )}
                <div
                  className={cn(
                    'flex flex-col gap-3 flex-1 items-center justify-center text-center px-4 py-5 md:px-5 md:py-6 w-full',
                    svc.hideImage && 'min-h-[min(22rem,65vh)] justify-center py-10'
                  )}
                >
                  <h3
                    className={cn(
                      'italic font-bold tracking-wide leading-snug w-full whitespace-pre-line text-lg md:text-xl',
                      isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
                    )}
                    style={{ color: col('svcCardTitle') }}
                    contentEditable={!!isEditMode}
                    suppressContentEditableWarning
                    onKeyDown={e => {
                      if (!isEditMode) return
                      if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                    }}
                    onBlur={e =>
                      isEditMode &&
                      patchServiceCard(i, {
                        title: (e.currentTarget.innerText ?? '')
                          .replace(/\r\n/g, '\n')
                          .trim()
                          .slice(0, MAX_SVC_TITLE_LEN),
                      })
                    }
                  >
                    {svc.title}
                  </h3>
                  <p
                    className={cn(
                      'leading-relaxed w-full flex-1 whitespace-pre-line text-sm md:text-base',
                      isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
                    )}
                    style={{ fontFamily: 'sans-serif', color: col('svcCardDesc') }}
                    contentEditable={!!isEditMode}
                    suppressContentEditableWarning
                    onKeyDown={e => {
                      if (!isEditMode) return
                      if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                    }}
                    onBlur={e =>
                      isEditMode &&
                      patchServiceCard(i, {
                        desc: (e.currentTarget.innerText ?? '')
                          .replace(/\r\n/g, '\n')
                          .trim()
                          .slice(0, MAX_SVC_DESC_LEN),
                      })
                    }
                  >
                    {svc.desc}
                  </p>
                  <p
                    className={cn(
                      'font-semibold w-full mt-1 text-lg md:text-xl',
                      isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
                    )}
                    style={{ fontFamily: 'sans-serif', color: col('svcCardPrice') }}
                    contentEditable={!!isEditMode}
                    suppressContentEditableWarning
                    onKeyDown={e => {
                      if (!isEditMode) return
                      if (e.key === 'Enter') e.preventDefault()
                    }}
                    onBlur={e =>
                      isEditMode &&
                      patchServiceCard(i, {
                        price: (e.currentTarget.innerText ?? '')
                          .replace(/\r\n/g, ' ')
                          .trim()
                          .slice(0, MAX_SVC_PRICE_LEN),
                      })
                    }
                  >
                    {svc.price}
                  </p>
                </div>
              </div>
            ))}
            {isEditMode && displayServices.length < MASSAGE_SERVICES_MAX && (
              <button
                type="button"
                onClick={appendServiceCard}
                className="rounded-2xl border-2 border-dashed border-gray-400/70 bg-muted/15 min-h-[12rem] flex flex-col items-center justify-center gap-2 px-4 py-8 text-muted-foreground hover:border-primary/60 hover:bg-primary/5 hover:text-foreground transition-colors"
              >
                <span className="text-3xl font-light leading-none">+</span>
                <span className="text-sm font-semibold">{t.svcAddCard}</span>
                <span className="text-[11px] opacity-70">
                  {displayServices.length}/{MASSAGE_SERVICES_MAX}
                </span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ============ ABOUT ============ */}
      <section id="about" className="py-14 sm:py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex flex-col md:flex-row items-center gap-10 sm:gap-16 md:gap-20">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <h2
              className={cn(
                'text-2xl sm:text-3xl md:text-5xl lg:text-6xl italic font-bold leading-[1.15] sm:leading-[1.1] max-w-xl whitespace-pre-line',
                isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
              )}
              style={{ color: col('aboutHeading'), fontFamily: 'sans-serif' }}
              contentEditable={!!isEditMode}
              suppressContentEditableWarning
              onKeyDown={e => {
                if (!isEditMode) return
                if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
              }}
              onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_ABOUT_TITLE)}
              onBlur={e =>
                isEditMode &&
                onSaveDraft?.(
                  'publicMassageAboutTitle',
                  clipHeroText(e.currentTarget.innerText ?? '', MAX_ABOUT_TITLE)
                )
              }
            >
              {aboutHeadlineDisplay}
            </h2>
            <p
              className={cn(
                'mt-5 sm:mt-8 text-base sm:text-lg md:text-xl leading-relaxed max-w-xl whitespace-pre-line',
                isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
              )}
              style={{ fontFamily: 'sans-serif', color: col('aboutBody') }}
              contentEditable={!!isEditMode}
              suppressContentEditableWarning
              onKeyDown={e => {
                if (!isEditMode) return
                if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
              }}
              onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_ABOUT_TEXT)}
              onBlur={e =>
                isEditMode &&
                onSaveDraft?.('publicMassageAboutText', clipHeroText(e.currentTarget.innerText ?? '', MAX_ABOUT_TEXT))
              }
            >
              {aboutTextDisplay}
            </p>
            <p
              className={cn(
                'mt-6 text-base italic leading-relaxed max-w-xl whitespace-pre-line',
                isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
              )}
              style={{ color: col('aboutMission') }}
              contentEditable={!!isEditMode}
              suppressContentEditableWarning
              onKeyDown={e => {
                if (!isEditMode) return
                if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
              }}
              onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_ABOUT_MISSION)}
              onBlur={e =>
                isEditMode &&
                onSaveDraft?.(
                  'publicMassageAboutMission',
                  clipHeroText(e.currentTarget.innerText ?? '', MAX_ABOUT_MISSION)
                )
              }
            >
              {aboutMissionDisplay}
            </p>
          </div>

          {/* Avatar with decorative elements */}
          <div className="flex-shrink-0 relative flex items-center justify-center w-full max-w-[18rem] sm:max-w-none sm:w-72 h-72 sm:h-80 md:w-80 md:h-96 mx-auto md:mx-0">
            {/* Outer decorative ring */}
            <div
              className="absolute inset-0 rounded-[50%] opacity-20"
              style={{ border: `2px solid ${PINK}` }}
            />
            {/* Offset pink circle accent */}
            <div
              className="absolute -right-4 -bottom-4 w-48 h-48 rounded-full opacity-40"
              style={{ background: PINK_LIGHT }}
            />
            {/* Top-left small accent circle */}
            <div
              className="absolute -left-3 top-8 w-16 h-16 rounded-full opacity-30"
              style={{ background: PINK }}
            />
            {/* Decorative arc — top right */}
            <div
              className="absolute -top-3 -right-3 w-24 h-24 rounded-full opacity-15"
              style={{ border: `2px solid ${PINK}` }}
            />
            {/* Main oval photo frame — в режиме редактирования фото можно смещать (кадрирование) */}
            <div
              className={cn(
                'relative w-60 h-72 md:w-64 md:h-80 rounded-[50%] overflow-hidden shadow-2xl flex items-center justify-center select-none',
                isEditMode && massageAboutAvatarProp?.trim() && 'touch-none',
                isEditMode &&
                  massageAboutAvatarProp?.trim() &&
                  (aboutAvatarDragging ? 'cursor-grabbing' : 'cursor-grab')
              )}
              style={{
                border: `3px solid white`,
                boxShadow: `0 20px 60px ${PINK}30, 0 8px 24px rgba(0,0,0,0.08)`,
              }}
              title={
                isEditMode && massageAboutAvatarProp?.trim() ? t.avatarDragHint : undefined
              }
              onPointerDown={e => {
                if (!isEditMode || !massageAboutAvatarProp?.trim() || !onSaveDraft) return
                if (e.button !== 0) return
                e.preventDefault()
                e.currentTarget.setPointerCapture(e.pointerId)
                setAboutAvatarDragging(true)
                aboutAvatarPanDragRef.current = {
                  startX: e.clientX,
                  startY: e.clientY,
                  startPan: { ...aboutAvatarPanLiveRef.current },
                }
              }}
              onPointerMove={e => {
                if (!aboutAvatarPanDragRef.current) return
                const el = e.currentTarget
                const rect = el.getBoundingClientRect()
                const { startX, startY, startPan } = aboutAvatarPanDragRef.current
                const dx = e.clientX - startX
                const dy = e.clientY - startY
                const k = 0.55
                const nx = clamp01to100(
                  startPan.x - (dx / Math.max(rect.width, 1)) * 100 * k
                )
                const ny = clamp01to100(
                  startPan.y - (dy / Math.max(rect.height, 1)) * 100 * k
                )
                const next = { x: nx, y: ny }
                setAboutAvatarPan(next)
                aboutAvatarPanLiveRef.current = next
              }}
              onPointerUp={e => {
                if (!isEditMode || !massageAboutAvatarProp?.trim() || !onSaveDraft) return
                if (aboutAvatarPanDragRef.current) {
                  onSaveDraft(
                    'publicMassageAboutAvatarPan',
                    JSON.stringify(aboutAvatarPanLiveRef.current)
                  )
                }
                aboutAvatarPanDragRef.current = null
                setAboutAvatarDragging(false)
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId)
                } catch {
                  /* ignore */
                }
              }}
              onPointerCancel={e => {
                if (aboutAvatarPanDragRef.current && onSaveDraft && massageAboutAvatarProp?.trim()) {
                  onSaveDraft(
                    'publicMassageAboutAvatarPan',
                    JSON.stringify(aboutAvatarPanLiveRef.current)
                  )
                }
                aboutAvatarPanDragRef.current = null
                setAboutAvatarDragging(false)
                try {
                  e.currentTarget.releasePointerCapture(e.pointerId)
                } catch {
                  /* ignore */
                }
              }}
            >
              {massageAboutAvatarProp?.trim() ? (
                <img
                  src={massageAboutAvatarProp}
                  alt=""
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                  style={{
                    objectPosition: `${aboutAvatarPan.x}% ${aboutAvatarPan.y}%`,
                  }}
                />
              ) : (
                <div
                  className="absolute inset-0 flex items-center justify-center"
                  style={{
                    background: `linear-gradient(160deg, ${PINK_LIGHT}, #EAD0D0)`,
                  }}
                >
                  <PersonIcon />
                </div>
              )}
            </div>
            {/* Bottom decorative dot */}
            <div
              className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full"
              style={{ background: PINK }}
            />
          </div>
        </div>
      </section>

      {/* ============ GALLERY ============ */}
      <section id="gallery" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className={cn(
              'text-3xl md:text-5xl italic font-bold leading-tight max-w-3xl whitespace-pre-line',
              isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
            )}
            style={{ color: galTitleCol }}
            contentEditable={!!isEditMode}
            suppressContentEditableWarning
            onKeyDown={e => {
              if (!isEditMode) return
              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
            }}
            onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_GAL_TITLE)}
            onBlur={e =>
              isEditMode &&
              onSaveDraft?.('publicMassageGalTitle', clipHeroText(e.currentTarget.innerText ?? '', MAX_GAL_TITLE))
            }
          >
            {galTitleDisplay}
          </h2>
          <p
            className={cn(
              'mt-3 text-sm whitespace-pre-line',
              isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
            )}
            style={{ fontFamily: 'sans-serif', color: galSubCol }}
            contentEditable={!!isEditMode}
            suppressContentEditableWarning
            onKeyDown={e => {
              if (!isEditMode) return
              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
            }}
            onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_GAL_SUB)}
            onBlur={e =>
              isEditMode &&
              onSaveDraft?.('publicMassageGalSub', clipHeroText(e.currentTarget.innerText ?? '', MAX_GAL_SUB))
            }
          >
            {galSubDisplay}
          </p>
          <div className="mt-8 flex items-center gap-2 flex-wrap">
            {displayGallery.map((section, i) => (
              <div key={section.id} className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveGalTab(i)}
                  className="px-5 py-2.5 rounded-full text-xs font-medium transition-all duration-200 border max-w-[min(100vw-5rem,14rem)] text-left"
                  style={{
                    background: activeGalTab === i ? galTabActiveCol : 'white',
                    color: activeGalTab === i ? 'white' : '#666',
                    borderColor: activeGalTab === i ? galTabActiveCol : '#e5e5e5',
                    fontFamily: 'sans-serif',
                  }}
                  onMouseEnter={e => {
                    if (activeGalTab !== i) {
                      e.currentTarget.style.borderColor = galTabActiveCol
                      e.currentTarget.style.color = galTabActiveCol
                    }
                  }}
                  onMouseLeave={e => {
                    if (activeGalTab !== i) {
                      e.currentTarget.style.borderColor = '#e5e5e5'
                      e.currentTarget.style.color = '#666'
                    }
                  }}
                >
                  <span
                    className={cn(
                      'block min-w-0 max-w-full truncate select-none pointer-events-none',
                      activeGalTab === i ? 'text-white' : 'text-inherit'
                    )}
                    style={activeGalTab === i ? undefined : { color: 'inherit' }}
                  >
                    {section.label.trim()
                      ? section.label
                      : galTabsFallback[i] ??
                        galTabsFallback[galTabsFallback.length - 1] ??
                        t.galleryNewSection}
                  </span>
                </button>
                {isEditMode && displayGallery.length > 1 && (
                  <button
                    type="button"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-red-500 bg-white text-xl font-semibold leading-none text-red-600 shadow-sm hover:bg-red-50 hover:border-red-600 hover:text-red-700"
                    aria-label={t.svcDeleteCard}
                    onClick={e => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeGallerySection(i)
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
          {/* Carousel */}
          <div className="mt-6 sm:mt-8 relative px-10 sm:px-12 md:px-14">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex"
                style={{
                  transform: galCanScroll
                    ? `translateX(-${galSlide * (100 / visibleGal)}%)`
                    : undefined,
                  transition: galSmooth ? 'transform 500ms ease-out' : 'none',
                }}
                onTransitionEnd={handleGalTransEnd}
              >
                {gallerySlidesTripled.map((photoUrl, i) => {
                  const colors = GALLERY_COLORS[i % GALLERY_COLORS.length]
                  return (
                    <div
                      key={`gal-${activeGalTab}-${i}`}
                      className="shrink-0 px-2"
                      style={{ width: `${100 / visibleGal}%` }}
                    >
                      <div
                        className="aspect-[3/4] rounded-xl flex items-center justify-center overflow-hidden hover:shadow-lg transition-shadow cursor-pointer relative"
                        style={
                          photoUrl
                            ? undefined
                            : { background: `linear-gradient(180deg, ${colors[0]}, ${colors[1]})` }
                        }
                      >
                        {photoUrl ? (
                          <img src={photoUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                        ) : (
                          <ImgIcon className="w-12 h-12 relative z-10 opacity-40" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {galCanScroll && (
              <>
                <button
                  type="button"
                  onClick={galPrev}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors shadow-md touch-manipulation"
                  style={{
                    background: `color-mix(in srgb, ${galTabActiveCol} 22%, white)`,
                    color: galTabActiveCol,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = galTabActiveCol
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = `color-mix(in srgb, ${galTabActiveCol} 22%, white)`
                    e.currentTarget.style.color = galTabActiveCol
                  }}
                >
                  <ChevL />
                </button>
                <button
                  type="button"
                  onClick={galNext}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors shadow-md touch-manipulation"
                  style={{
                    background: `color-mix(in srgb, ${galTabActiveCol} 22%, white)`,
                    color: galTabActiveCol,
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = galTabActiveCol
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = `color-mix(in srgb, ${galTabActiveCol} 22%, white)`
                    e.currentTarget.style.color = galTabActiveCol
                  }}
                >
                  <ChevR />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============ SUBSCRIPTIONS ============ */}
      {!subsBlockHidden && (
      <section id="promos" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className={cn(
              'text-3xl md:text-5xl italic font-bold max-w-4xl',
              isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text'
            )}
            style={{ color: subsBlockTitleCol }}
            contentEditable={!!isEditMode}
            suppressContentEditableWarning
            onKeyDown={e => {
              if (!isEditMode) return
              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
            }}
            onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, MAX_SUBS_TITLE)}
            onBlur={e =>
              isEditMode &&
              onSaveDraft?.('publicMassageSubsTitle', clipHeroText(e.currentTarget.innerText ?? '', MAX_SUBS_TITLE))
            }
          >
            {subsTitleDisplay}
          </h2>
          <div className="mt-8 sm:mt-10 relative px-10 sm:px-12 md:px-14">
            {displaySubs.length === 0 && isEditMode ? (
              <p className="text-sm text-muted-foreground border border-dashed border-border/60 rounded-2xl p-6 text-center">
                {t.subsEmptyHint}
              </p>
            ) : displaySubs.length === 0 ? null : (
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex"
                style={{
                  transform: `translateX(-${subsSlideVisual * (100 / visibleSubs)}%)`,
                  transition: subsSmooth ? 'transform 500ms ease-out' : 'none',
                }}
                onTransitionEnd={handleSubsTransEnd}
              >
                {(subsCanScroll ? [...displaySubs, ...displaySubs, ...displaySubs] : displaySubs).map((sub, i) => {
                  const realIdx = subsCanScroll ? i % displaySubs.length : i
                  const isPrimary = realIdx === 0
                  const cardBg = isPrimary
                    ? `linear-gradient(135deg, ${subsCardBgFrom}, ${subsCardBgTo})`
                    : `linear-gradient(135deg, color-mix(in srgb, ${subsCardBgFrom} 82%, #0c0c0c), color-mix(in srgb, ${subsCardBgTo} 82%, #0c0c0c))`
                  return (
                    <div
                      key={`${sub.id}-${i}`}
                      className="shrink-0 px-2.5"
                      style={{ width: `${100 / visibleSubs}%` }}
                    >
                      <div
                        className="rounded-2xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden h-full min-h-[200px] sm:min-h-[220px]"
                        style={{ background: cardBg }}
                      >
                        {isEditMode && (
                          <button
                            type="button"
                            className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-white text-xl font-semibold leading-none text-red-600 shadow-sm hover:bg-red-50 hover:border-red-600 hover:text-red-700"
                            aria-label={t.svcDeleteCard}
                            onClick={e => {
                              e.preventDefault()
                              e.stopPropagation()
                              removeSubItem(sub.id)
                            }}
                          >
                            ×
                          </button>
                        )}
                        <span
                          className="absolute right-4 bottom-2 font-bold select-none pointer-events-none"
                          style={{
                            fontSize: '6rem',
                            lineHeight: 1,
                            opacity: 0.12,
                            color: subsCardTitleCol,
                          }}
                        >
                          {sub.pct}
                        </span>
                        <div className="relative z-10">
                          <h3
                            className={cn(
                              'italic text-base font-bold tracking-wide whitespace-pre-line',
                              isEditMode && 'border-b border-dashed cursor-text'
                            )}
                            style={{
                              color: subsCardTitleCol,
                              ...(isEditMode ? { borderBottomColor: `${subsCardTitleCol}55` } : {}),
                            }}
                            contentEditable={!!isEditMode}
                            suppressContentEditableWarning
                            onKeyDown={e => {
                              if (!isEditMode) return
                              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                            }}
                            onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, 220)}
                            onBlur={e =>
                              isEditMode &&
                              patchSubItem(sub.id, { title: clipHeroText(e.currentTarget.innerText ?? '', 220) })
                            }
                          >
                            {sub.title}
                          </h3>
                          <p
                            className={cn(
                              'text-xs mt-2 whitespace-pre-line',
                              isEditMode && 'border-b border-dashed cursor-text'
                            )}
                            style={{
                              fontFamily: 'sans-serif',
                              color: subsCardDescCol,
                              ...(isEditMode ? { borderBottomColor: `${subsCardDescCol}66` } : {}),
                            }}
                            contentEditable={!!isEditMode}
                            suppressContentEditableWarning
                            onKeyDown={e => {
                              if (!isEditMode) return
                              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                            }}
                            onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, 320)}
                            onBlur={e =>
                              isEditMode &&
                              patchSubItem(sub.id, { desc: clipHeroText(e.currentTarget.innerText ?? '', 320) })
                            }
                          >
                            {sub.desc}
                          </p>
                        </div>
                        {!subsCtaHidden && (
                          <button
                            type="button"
                            onClick={handleSubsCtaClick}
                            className="mt-4 relative z-10 block w-full text-left text-xs font-bold bg-transparent p-0 m-0 rounded-none border-0 shadow-none ring-0 outline-none transition-opacity hover:opacity-90 hover:underline focus-visible:ring-0 focus-visible:ring-offset-0 appearance-none"
                            style={{
                              fontFamily: 'sans-serif',
                              color: subsCtaTextCol,
                              border: 'none',
                              boxShadow: 'none',
                              WebkitBoxShadow: 'none',
                              WebkitAppearance: 'none',
                              appearance: 'none',
                            }}
                          >
                            {t.subsCta}
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            )}
            {displaySubs.length > 0 && subsCanScroll && (
              <>
                <button
                  type="button"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors shadow-md border border-black/5 touch-manipulation"
                  style={{ backgroundColor: `color-mix(in srgb, ${subsCtaBgCol} 28%, white)`, color: subsCtaBgCol }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = subsCtaBgCol
                    e.currentTarget.style.color = subsCtaTextCol
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${subsCtaBgCol} 28%, white)`
                    e.currentTarget.style.color = subsCtaBgCol
                  }}
                  onClick={subsPrev}
                >
                  <ChevL />
                </button>
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors shadow-md border border-black/5 touch-manipulation"
                  style={{ backgroundColor: `color-mix(in srgb, ${subsCtaBgCol} 28%, white)`, color: subsCtaBgCol }}
                  onMouseEnter={e => {
                    e.currentTarget.style.backgroundColor = subsCtaBgCol
                    e.currentTarget.style.color = subsCtaTextCol
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${subsCtaBgCol} 28%, white)`
                    e.currentTarget.style.color = subsCtaBgCol
                  }}
                  onClick={subsNext}
                >
                  <ChevR />
                </button>
              </>
            )}
          </div>
        </div>
      </section>
      )}

      {/* ============ CATALOG ============ */}
      {!catalogBlockHidden && (displayCatalog.length > 0 || isEditMode) && (
      <section id="catalog" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className={cn(
              'text-3xl md:text-5xl italic font-bold text-[#1a1a1a] text-center',
              isEditMode && 'border-b border-dashed border-b-pink-300 cursor-text outline-none'
            )}
            contentEditable={!!isEditMode}
            suppressContentEditableWarning
            onKeyDown={e => {
              if (!isEditMode) return
              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
            }}
            onBlur={e =>
              isEditMode &&
              onSaveDraft?.(
                'publicMassageCatalogTitle',
                clipHeroText(e.currentTarget.innerText ?? '', MAX_CATALOG_TITLE_LEN)
              )
            }
          >
            {catalogTitleDisplay}
          </h2>
          {displayCatalog.length === 0 && isEditMode ? (
            <p className="mt-10 text-sm text-center text-muted-foreground border border-dashed border-border/60 rounded-2xl p-8">
              {t.catEmptyHint}
            </p>
          ) : displayCatalog.length === 0 ? null : (
          <div className="mt-8 sm:mt-12 relative px-10 sm:px-12 md:px-14">
            <div className="overflow-hidden">
              <div
                className="flex"
                style={{
                  transform: `translateX(-${catSlide * (100 / visibleCat)}%)`,
                  transition: 'transform 500ms ease-out',
                }}
              >
                {displayCatalog.map((p, i) => {
                  const grad = SVC_COLORS[i % SVC_COLORS.length]
                  const discount = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
                  return (
                    <div
                      key={p.id}
                      className="shrink-0 px-3"
                      style={{ width: `${100 / visibleCat}%` }}
                    >
                      <div
                        className="bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full relative"
                        style={{ border: '1px solid #f0eded' }}
                      >
                        {isEditMode && (
                          <button
                            type="button"
                            className="absolute top-2 right-2 z-20 flex h-8 w-8 items-center justify-center rounded-full border-2 border-red-500 bg-white text-xl font-semibold leading-none text-red-600 shadow-sm hover:bg-red-50"
                            aria-label={t.svcDeleteCard}
                            onClick={() => removeCatalogProduct(p.id)}
                          >
                            ×
                          </button>
                        )}
                        <div className="relative h-56 overflow-hidden bg-neutral-100">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt=""
                              className="absolute inset-0 h-full w-full object-cover"
                            />
                          ) : (
                            <div
                              className="absolute inset-0 flex items-center justify-center"
                              style={{ background: `linear-gradient(160deg, ${grad[0]}, ${grad[1]})` }}
                            >
                              <ImgIcon className="w-16 h-16 text-white/30 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                          )}
                          {discount > 0 && (
                            <span
                              className="absolute top-3.5 left-3.5 z-10 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide"
                              style={{ background: PINK, fontFamily: 'sans-serif' }}
                            >
                              −{discount}%
                            </span>
                          )}
                        </div>
                        <div className="p-5" style={{ fontFamily: 'sans-serif' }}>
                          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                            {isEditMode ? (
                              <>
                                <span
                                  className="text-3xl font-bold text-[#1a1a1a] min-w-[3ch] border-b border-dashed border-pink-300/80 outline-none"
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={e =>
                                    patchCatalogProduct(i, {
                                      price: parseCatalogPriceText(e.currentTarget.textContent ?? ''),
                                    })
                                  }
                                >
                                  {formatCatalogPriceDisplay(p.price)}
                                </span>
                                <span
                                  key={`ccy-${p.id}-${p.currency}`}
                                  className="text-3xl font-bold text-gray-500 min-w-[0.5ch] border-b border-dashed border-pink-300/80 outline-none"
                                  contentEditable
                                  suppressContentEditableWarning
                                  title={t.catCurrencyHint}
                                  onBlur={e =>
                                    patchCatalogProduct(i, {
                                      currency: normalizeCatalogCurrencyInput(
                                        e.currentTarget.textContent ?? ''
                                      ),
                                    })
                                  }
                                >
                                  {p.currency}
                                </span>
                                <span
                                  className={cn(
                                    'text-sm border-b border-dashed border-pink-300/80 outline-none min-w-[3ch]',
                                    p.oldPrice > p.price ? 'text-gray-400 line-through' : 'text-gray-500'
                                  )}
                                  title={t.catOldPriceHint}
                                  contentEditable
                                  suppressContentEditableWarning
                                  onBlur={e =>
                                    patchCatalogProduct(i, {
                                      oldPrice: parseCatalogPriceText(e.currentTarget.textContent ?? ''),
                                    })
                                  }
                                >
                                  {formatCatalogPriceDisplay(p.oldPrice)}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-3xl font-bold text-[#1a1a1a]">
                                  {formatCatalogPriceDisplay(p.price)}
                                </span>
                                {p.currency.length > 0 && (
                                  <span className="text-3xl font-bold text-gray-500">{p.currency}</span>
                                )}
                                {p.oldPrice > p.price && (
                                  <span className="text-sm text-gray-400 line-through ml-2">
                                    {formatCatalogPriceDisplay(p.oldPrice)}
                                    {p.currency.length > 0 ? `\u00a0${p.currency}` : ''}
                                  </span>
                                )}
                              </>
                            )}
                          </div>
                          <p
                            className={cn(
                              'mt-2.5 text-sm font-semibold text-[#1a1a1a] leading-snug',
                              isEditMode && 'border-b border-dashed border-pink-300/80 outline-none'
                            )}
                            contentEditable={!!isEditMode}
                            suppressContentEditableWarning
                            onKeyDown={e => {
                              if (!isEditMode) return
                              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                            }}
                            onBlur={e =>
                              isEditMode &&
                              patchCatalogProduct(i, {
                                name: clipHeroText(e.currentTarget.innerText ?? '', MAX_CATALOG_NAME_LEN),
                              })
                            }
                          >
                            {p.name}
                          </p>
                          <p
                            className={cn(
                              'mt-1 text-xs text-gray-500',
                              isEditMode && 'border-b border-dashed border-pink-300/60 outline-none'
                            )}
                            contentEditable={!!isEditMode}
                            suppressContentEditableWarning
                            onKeyDown={e => {
                              if (!isEditMode) return
                              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                            }}
                            onBlur={e =>
                              isEditMode &&
                              patchCatalogProduct(i, {
                                brand: clipHeroText(e.currentTarget.innerText ?? '', MAX_CATALOG_BRAND_LEN),
                              })
                            }
                          >
                            {p.brand}
                          </p>
                          <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                            {p.info.map((line, j) => (
                              <p
                                key={j}
                                className={cn(
                                  'text-[11px] text-gray-400 leading-relaxed',
                                  isEditMode && 'border-b border-dashed border-pink-200/70 outline-none'
                                )}
                                contentEditable={!!isEditMode}
                                suppressContentEditableWarning
                                onKeyDown={e => {
                                  if (!isEditMode) return
                                  if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                                }}
                                onBlur={e => {
                                  if (!isEditMode) return
                                  const next = [...p.info]
                                  next[j] = clipHeroText(e.currentTarget.innerText ?? '', MAX_CATALOG_INFO_LINE)
                                  patchCatalogProduct(i, { info: next })
                                }}
                              >
                                {line}
                              </p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {catTotal > visibleCat && (
              <>
                {!catAtStart && (
                  <button
                    type="button"
                    onClick={() => setCatSlide(s => Math.max(0, s - 1))}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors shadow-md touch-manipulation"
                    style={{ background: PINK_LIGHT, color: PINK }}
                    onMouseEnter={e => { e.currentTarget.style.background = PINK; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = PINK_LIGHT; e.currentTarget.style.color = PINK }}
                  >
                    <ChevL />
                  </button>
                )}
                {!catAtEnd && (
                  <button
                    type="button"
                    onClick={() => setCatSlide(s => Math.min(catTotal - visibleCat, s + 1))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-colors shadow-md touch-manipulation"
                    style={{ background: PINK_LIGHT, color: PINK }}
                    onMouseEnter={e => { e.currentTarget.style.background = PINK; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = PINK_LIGHT; e.currentTarget.style.color = PINK }}
                  >
                    <ChevR />
                  </button>
                )}
              </>
            )}
          </div>
          )}
        </div>
      </section>
      )}

      {/* ============ SPECIALISTS ============ */}
      {specsHidden && isEditMode && (
        <section
          id="masters"
          className="py-10 md:py-12 bg-amber-50 border-y border-dashed border-amber-300/80"
        >
          <div className="max-w-[90rem] mx-auto px-4 text-center">
            <p className="text-sm font-medium text-amber-950 max-w-lg mx-auto leading-relaxed">
              {t.specsHiddenBanner}
            </p>
          </div>
        </section>
      )}
      {!specsHidden && (displaySpecs.length > 0 || isEditMode) && (
      <section id="masters" className="py-20 md:py-28 bg-white">
        <div className="max-w-[90rem] mx-auto px-4">
          {isEditMode ? (
            <h2
              className="text-3xl md:text-5xl italic font-bold text-[#1a1a1a] leading-tight max-w-2xl outline-none"
              contentEditable
              suppressContentEditableWarning
              onBlur={e => onSaveDraft?.('publicMassageSpecsTitle', e.currentTarget.textContent ?? '')}
            >
              {specsTitleDisplay}
            </h2>
          ) : (
            <h2 className="text-3xl md:text-5xl italic font-bold text-[#1a1a1a] leading-tight max-w-2xl">
              {specsTitleDisplay}
            </h2>
          )}
          <div className="mt-8 sm:mt-12 grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
            {displaySpecs.map((s, i) => {
              const grad = GALLERY_COLORS[i % GALLERY_COLORS.length]
              return (
                <div key={s.id} className="rounded-2xl overflow-hidden group cursor-pointer relative" style={{ border: '1px solid #f0eded' }}>
                  {isEditMode && (
                    <button
                      type="button"
                      className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-red-500/80 text-white shadow hover:bg-red-600 transition-colors"
                      onClick={() => removeSpec(s.id)}
                    >
                      <span className="text-sm font-bold leading-none">×</span>
                    </button>
                  )}
                  <div
                    className="aspect-[3/4] relative flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(180deg, ${grad[0]}, ${grad[1]})` }}
                  >
                    {s.image ? (
                      <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                      <PersonIcon />
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="bg-white px-4 py-5">
                    {isEditMode ? (
                      <>
                        <p
                          className="italic text-base font-bold text-[#1a1a1a] tracking-wide outline-none"
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => patchSpec(s.id, { name: (e.currentTarget.textContent ?? '').slice(0, 120) })}
                        >
                          {s.name}
                        </p>
                        <p
                          className="text-xs mt-1 font-medium outline-none"
                          style={{ color: PINK, fontFamily: 'sans-serif' }}
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => patchSpec(s.id, { role: (e.currentTarget.textContent ?? '').slice(0, 120) })}
                        >
                          {s.role}
                        </p>
                        <p
                          className="text-[11px] text-gray-400 mt-2 leading-relaxed outline-none"
                          style={{ fontFamily: 'sans-serif' }}
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => patchSpec(s.id, { exp: (e.currentTarget.textContent ?? '').slice(0, 300) })}
                        >
                          {s.exp}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="italic text-base font-bold text-[#1a1a1a] tracking-wide">{s.name}</p>
                        <p className="text-xs mt-1 font-medium" style={{ color: PINK, fontFamily: 'sans-serif' }}>{s.role}</p>
                        <p className="text-[11px] text-gray-400 mt-2 leading-relaxed" style={{ fontFamily: 'sans-serif' }}>{s.exp}</p>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
      )}

      {/* ============ CTA — BOOK NOW ============ */}
      {ctaBlockHidden && isEditMode && (
        <section
          id="massage-block-cta"
          className="py-10 md:py-12 bg-amber-50 border-y border-dashed border-amber-300/80"
        >
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-sm font-medium text-amber-950 leading-relaxed">{t.ctaHiddenBanner}</p>
          </div>
        </section>
      )}
      {!ctaBlockHidden && (
      <section
        id="massage-block-cta"
        className="relative py-24 md:py-32 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${ctaBgFrom}, ${ctaBgTo})` }}
      >
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'white' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10"
          style={{ background: 'white' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {isEditMode ? (
            <h2
              className="text-3xl sm:text-4xl md:text-6xl italic font-bold leading-[1.12] sm:leading-[1.1] outline-none"
              style={{ color: ctaTitleCol }}
              contentEditable
              suppressContentEditableWarning
              onBlur={e =>
                onSaveDraft?.('publicMassageCtaTitle', (e.currentTarget.textContent ?? '').slice(0, 320))
              }
            >
              {ctaTitleDisplay}
            </h2>
          ) : (
            <h2 className="text-3xl sm:text-4xl md:text-6xl italic font-bold leading-[1.12] sm:leading-[1.1]" style={{ color: ctaTitleCol }}>
              {ctaTitleDisplay}
            </h2>
          )}
          {isEditMode ? (
            <p
              className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed outline-none"
              style={{ fontFamily: 'sans-serif', color: ctaSubCol }}
              contentEditable
              suppressContentEditableWarning
              onBlur={e =>
                onSaveDraft?.('publicMassageCtaSub', (e.currentTarget.textContent ?? '').slice(0, 720))
              }
            >
              {ctaSubDisplay}
            </p>
          ) : (
            <p
              className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg max-w-xl mx-auto leading-relaxed"
              style={{ fontFamily: 'sans-serif', color: ctaSubCol }}
            >
              {ctaSubDisplay}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              if (!isEditMode) onBookNow?.()
            }}
            className="mt-8 sm:mt-10 w-full sm:w-auto max-w-md sm:max-w-none mx-auto sm:mx-0 px-8 sm:px-12 py-4 sm:py-5 rounded-full text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 hover:shadow-2xl hover:scale-[1.03] touch-manipulation"
            style={{ background: ctaBtnBgCol, color: ctaBtnTextCol, fontFamily: 'sans-serif' }}
          >
            {isEditMode ? (
              <span
                className="outline-none"
                contentEditable
                suppressContentEditableWarning
                onBlur={e =>
                  onSaveDraft?.('publicMassageCtaBtn', (e.currentTarget.textContent ?? '').slice(0, 120))
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') e.preventDefault()
                }}
              >
                {ctaBtnDisplay}
              </span>
            ) : (
              ctaBtnDisplay
            )}
          </button>
        </div>
      </section>
      )}

      {/* ============ CONTACTS ============ */}
      <section id="contacts" className="py-14 sm:py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-3 sm:px-4">
          {isEditMode ? (
            <h2
              className="text-2xl sm:text-3xl md:text-5xl italic font-bold leading-tight max-w-3xl outline-none"
              style={{ color: contactsBlockTitleCol }}
              contentEditable
              suppressContentEditableWarning
              onBlur={e =>
                onSaveDraft?.('publicMassageContactTitle', (e.currentTarget.textContent ?? '').slice(0, 280))
              }
            >
              {contactTitleDisplay}
            </h2>
          ) : (
            <h2
              className="text-2xl sm:text-3xl md:text-5xl italic font-bold leading-tight max-w-3xl"
              style={{ color: contactsBlockTitleCol }}
            >
              {contactTitleDisplay}
            </h2>
          )}
          <div className="mt-8 sm:mt-10 flex flex-col lg:flex-row gap-8 lg:gap-10">
            <div className="flex-1 w-full lg:max-w-sm min-w-0">
              {isEditMode ? (
                <h3
                  className="text-xl sm:text-2xl italic font-bold outline-none"
                  style={{ color: contactsSectionHeadingCol }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e =>
                    onSaveDraft?.('publicMassageContactOurHeading', (e.currentTarget.textContent ?? '').slice(0, 120))
                  }
                >
                  {contactOurHeadingDisplay}
                </h3>
              ) : (
                <h3 className="text-xl sm:text-2xl italic font-bold" style={{ color: contactsSectionHeadingCol }}>
                  {contactOurHeadingDisplay}
                </h3>
              )}
              <div className="mt-4 sm:mt-6 space-y-4 sm:space-y-5 text-xs sm:text-sm" style={{ fontFamily: 'sans-serif' }}>
                <div className="flex items-center gap-3">
                  <span className="shrink-0 flex items-center" style={{ color: contactsIconCol }}>
                    <Pin size="w-5 h-5" />
                  </span>
                  {isEditMode ? (
                    <span
                      className="min-w-0 flex-1 outline-none border-b border-dashed border-b-pink-300/60 cursor-text"
                      style={{ color: contactsBodyCol }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => onSaveDraft?.('publicAddress', (e.currentTarget.textContent ?? '').slice(0, 400))}
                    >
                      {headerAddress ?? t.addressDefault}
                    </span>
                  ) : (
                    <span className="min-w-0" style={{ color: contactsBodyCol }}>
                      {headerAddress ?? t.addressDefault}
                    </span>
                  )}
                </div>
                <div className="flex items-start gap-3">
                  <span className="shrink-0 pt-0.5" style={{ color: contactsIconCol }}>
                    <Clock size="w-5 h-5" />
                  </span>
                  {isEditMode ? (
                    <div
                      className="min-w-0 flex-1 whitespace-pre-line outline-none border-b border-dashed border-b-pink-300/60 cursor-text"
                      style={{ color: contactsBodyCol }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e =>
                        onSaveDraft?.('publicMassageContactSchedule', (e.currentTarget.textContent ?? '').slice(0, 600))
                      }
                    >
                      {contactScheduleDisplay}
                    </div>
                  ) : (
                    <div className="min-w-0 whitespace-pre-line" style={{ color: contactsBodyCol }}>
                      {contactScheduleDisplay}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="shrink-0" style={{ color: contactsIconCol }}>
                    <Phone size="w-5 h-5" />
                  </span>
                  {isEditMode ? (
                    <span
                      className="min-w-0 flex-1 outline-none border-b border-dashed border-b-pink-300/60 cursor-text"
                      style={{ color: contactsBodyCol }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => onSaveDraft?.('publicPhone', (e.currentTarget.textContent ?? '').slice(0, 80))}
                    >
                      {headerPhone ?? t.phone}
                    </span>
                  ) : (
                    <span className="min-w-0" style={{ color: contactsBodyCol }}>
                      {headerPhone ?? t.phone}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="shrink-0" style={{ color: contactsIconCol }}>
                    <Mail size="w-5 h-5" />
                  </span>
                  {isEditMode ? (
                    <span
                      className="min-w-0 flex-1 outline-none border-b border-dashed border-b-pink-300/60 cursor-text"
                      style={{ color: contactsBodyCol }}
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e =>
                        onSaveDraft?.('publicMassageContactEmail', (e.currentTarget.textContent ?? '').slice(0, 120))
                      }
                    >
                      {contactEmailDisplay}
                    </span>
                  ) : (
                    <span className="min-w-0" style={{ color: contactsBodyCol }}>
                      {contactEmailDisplay}
                    </span>
                  )}
                </div>
              </div>
              {(isEditMode ||
                socialUrls.viberUrl ||
                socialUrls.whatsappUrl ||
                socialUrls.telegramUrl ||
                socialUrls.facebookUrl ||
                socialUrls.instagramUrl ||
                socialUrls.vkUrl ||
                socialUrls.twitterUrl ||
                socialUrls.tiktokUrl) && (
                <>
                  <p
                    className="mt-6 text-[11px] font-bold uppercase tracking-wider"
                    style={{ fontFamily: 'sans-serif', color: contactsLabelCol }}
                  >
                    {t.socials}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {socialUrls.viberUrl && (
                      <div className="relative inline-block">
                        {isEditMode && onSaveDraft && (
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicViber', '')}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                        {!isEditMode ? (
                          <a href={socialUrls.viberUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <SocialCircle bg="#7F00FF" size={38}>
                              <ViberIcon className="w-[18px] h-[18px]" />
                            </SocialCircle>
                          </a>
                        ) : (
                          <SocialCircle bg="#7F00FF" size={38}>
                            <ViberIcon className="w-[18px] h-[18px]" />
                          </SocialCircle>
                        )}
                      </div>
                    )}
                    {socialUrls.whatsappUrl && (
                      <div className="relative inline-block">
                        {isEditMode && onSaveDraft && (
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicWhatsapp', '')}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                        {!isEditMode ? (
                          <a href={socialUrls.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <SocialCircle bg="#25D366" size={38}>
                              <WhatsAppIcon className="w-[18px] h-[18px]" />
                            </SocialCircle>
                          </a>
                        ) : (
                          <SocialCircle bg="#25D366" size={38}>
                            <WhatsAppIcon className="w-[18px] h-[18px]" />
                          </SocialCircle>
                        )}
                      </div>
                    )}
                    {socialUrls.telegramUrl && (
                      <div className="relative inline-block">
                        {isEditMode && onSaveDraft && (
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicTelegram', '')}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                        {!isEditMode ? (
                          <a href={socialUrls.telegramUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <SocialCircle bg="#0088cc" size={38}>
                              <TelegramIcon className="w-[18px] h-[18px]" />
                            </SocialCircle>
                          </a>
                        ) : (
                          <SocialCircle bg="#0088cc" size={38}>
                            <TelegramIcon className="w-[18px] h-[18px]" />
                          </SocialCircle>
                        )}
                      </div>
                    )}
                    {socialUrls.facebookUrl && (
                      <div className="relative inline-block">
                        {isEditMode && onSaveDraft && (
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicFacebook', '')}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                        {!isEditMode ? (
                          <a href={socialUrls.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <SocialCircle bg="#1877F2" size={38}>
                              <FacebookIcon className="w-[18px] h-[18px]" />
                            </SocialCircle>
                          </a>
                        ) : (
                          <SocialCircle bg="#1877F2" size={38}>
                            <FacebookIcon className="w-[18px] h-[18px]" />
                          </SocialCircle>
                        )}
                      </div>
                    )}
                    {socialUrls.instagramUrl && (
                      <div className="relative inline-block">
                        {isEditMode && onSaveDraft && (
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicInstagram', '')}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                        {!isEditMode ? (
                          <a href={socialUrls.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <SocialCircle
                              bg="linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
                              size={38}
                            >
                              <InstagramIcon className="w-[18px] h-[18px]" />
                            </SocialCircle>
                          </a>
                        ) : (
                          <SocialCircle
                            bg="linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)"
                            size={38}
                          >
                            <InstagramIcon className="w-[18px] h-[18px]" />
                          </SocialCircle>
                        )}
                      </div>
                    )}
                    {socialUrls.vkUrl && (
                      <div className="relative inline-block">
                        {isEditMode && onSaveDraft && (
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicVk', '')}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                        {!isEditMode ? (
                          <a href={socialUrls.vkUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <SocialCircle bg="#4C75A3" size={38}>
                              <VKIcon className="w-[18px] h-[18px]" />
                            </SocialCircle>
                          </a>
                        ) : (
                          <SocialCircle bg="#4C75A3" size={38}>
                            <VKIcon className="w-[18px] h-[18px]" />
                          </SocialCircle>
                        )}
                      </div>
                    )}
                    {socialUrls.twitterUrl && (
                      <div className="relative inline-block">
                        {isEditMode && onSaveDraft && (
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicTwitter', '')}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                        {!isEditMode ? (
                          <a href={socialUrls.twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <SocialCircle bg="#0f1419" size={38}>
                              <TwitterIcon className="w-[18px] h-[18px]" />
                            </SocialCircle>
                          </a>
                        ) : (
                          <SocialCircle bg="#0f1419" size={38}>
                            <TwitterIcon className="w-[18px] h-[18px]" />
                          </SocialCircle>
                        )}
                      </div>
                    )}
                    {socialUrls.tiktokUrl && (
                      <div className="relative inline-block">
                        {isEditMode && onSaveDraft && (
                          <button
                            type="button"
                            onClick={() => onSaveDraft('publicTiktok', '')}
                            className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600"
                          >
                            ✕
                          </button>
                        )}
                        {!isEditMode ? (
                          <a href={socialUrls.tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                            <SocialCircle bg="#010101" size={38}>
                              <TikTokIcon className="w-[18px] h-[18px]" />
                            </SocialCircle>
                          </a>
                        ) : (
                          <SocialCircle bg="#010101" size={38}>
                            <TikTokIcon className="w-[18px] h-[18px]" />
                          </SocialCircle>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex-[2] min-w-0">
              {isEditMode ? (
                <p
                  className="text-sm font-medium mb-2 outline-none"
                  style={{ fontFamily: 'sans-serif', color: contactsLabelCol }}
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e =>
                    onSaveDraft?.('publicMassageContactMapLabel', (e.currentTarget.textContent ?? '').slice(0, 80))
                  }
                >
                  {contactMapCaptionDisplay}
                </p>
              ) : (
                <p className="text-sm font-medium mb-2" style={{ fontFamily: 'sans-serif', color: contactsLabelCol }}>
                  {contactMapCaptionDisplay}
                </p>
              )}
              <div className="rounded-xl border border-gray-200 h-[min(52vh,22rem)] sm:h-72 md:h-80 overflow-hidden bg-muted/20">
                <iframe
                  title="map"
                  src={contactMapEmbedSrc}
                  className={cn('w-full h-full border-0', isEditMode && 'pointer-events-none')}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ LANGUAGE SWITCHER ============ */}
      {showLangSwitcher && (
        <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] left-4 sm:left-6 z-50">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsLangOpen(prev => !prev)}
              className="h-11 w-11 rounded-full bg-black/70 border border-white/20 shadow-lg backdrop-blur-md flex items-center justify-center hover:bg-black/90 transition"
            >
              <img
                src={lang === 'ru' ? flagRu : lang === 'en' ? flagEn : flagRo}
                alt={lang === 'ru' ? 'Русский' : lang === 'en' ? 'English' : 'Română'}
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
                  .filter(item => item.code !== lang && enabledLangs.includes(item.code))
                  .map(item => (
                    <button
                      key={item.code}
                      type="button"
                      onClick={() => handleLangChange(item.code)}
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

      {/* ============ SCROLL TO TOP ============ */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="sticky bottom-4 sm:bottom-6 float-right mr-3 sm:mr-6 mb-4 w-11 h-11 sm:w-10 sm:h-10 rounded-full text-white flex items-center justify-center shadow-lg z-20 transition-colors touch-manipulation"
          style={{ background: PINK }}
          onMouseEnter={e => (e.currentTarget.style.background = PINK_DARK)}
          onMouseLeave={e => (e.currentTarget.style.background = PINK)}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
          </svg>
        </button>
      )}
    </div>
  )
}
