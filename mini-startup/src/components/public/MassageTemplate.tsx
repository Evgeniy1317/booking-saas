import { useState, useEffect, useRef, useMemo, useCallback, type MouseEvent } from 'react'
import { cn } from '@/lib/utils'
import type { MassageThemeColors } from '@/lib/massage-theme-palette'
import { resolveMassageThemeColor } from '@/lib/massage-theme-palette'

export type Lang = 'ru' | 'en' | 'ro'

export type MassageServiceMerged = {
  title: string
  desc: string
  price: string
  image?: string
  hideImage: boolean
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
  heroTitle1?: string
  heroTitle2?: string
  heroSub?: string
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
    heroSub: 'Самые эффективные и приятные массажные услуги для вашего здоровья и благополучия',
    heroCta: 'ЗАПИСАТЬСЯ НА ПЕРВИЧНЫЙ СЕАНС',
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
    currency: '$',
    specTitle: 'НАШИ СЕРТИФИЦИРОВАННЫЕ СПЕЦИАЛИСТЫ',
    contactTitle: 'СВЯЖИТЕСЬ С НАМИ ЛЮБЫМ УДОБНЫМ СПОСОБОМ',
    ourContacts: 'Наши контакты',
    salonAddr: 'АДРЕС САЛОНА:',
    writeOnline: 'ПИШИТЕ, МЫ ОНЛАЙН',
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
    heroSub: 'The most effective and pleasant massage services for your health and well-being',
    heroCta: 'BOOK YOUR FIRST SESSION',
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
    currency: '$',
    specTitle: 'OUR CERTIFIED SPECIALISTS',
    contactTitle: 'CONTACT US IN ANY CONVENIENT WAY',
    ourContacts: 'Our contacts',
    salonAddr: 'SALON ADDRESS:',
    writeOnline: 'WRITE TO US ONLINE',
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
    heroSub: 'Cele mai eficiente și plăcute servicii de masaj pentru sănătatea dumneavoastră',
    heroCta: 'PROGRAMEAZĂ PRIMA ȘEDINȚĂ',
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
    currency: 'lei',
    specTitle: 'SPECIALIȘTII NOȘTRI CERTIFICAȚI',
    contactTitle: 'CONTACTAȚI-NE ÎN ORICE MOD CONVENABIL',
    ourContacts: 'Contactele noastre',
    salonAddr: 'ADRESA SALONULUI:',
    writeOnline: 'SCRIȚI-NE ONLINE',
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

export const SERVICES: Record<Lang, { title: string; desc: string; price: string }[]> = {
  ru: [
    { title: 'КЛАССИЧЕСКИЙ МАССАЖ', desc: 'Снимает напряжение и улучшает кровообращение', price: '$32' },
    { title: 'РЕЛАКСАЦИОННЫЙ МАССАЖ', desc: 'Помогает снять стресс и напряжение.', price: '$28' },
    { title: 'ТЕРАПЕВТИЧЕСКИЙ МАССАЖ', desc: 'Улучшает общее состояние и способствует восстановлению', price: '$36' },
    { title: 'ТАЙСКИЙ МАССАЖ', desc: 'Восстанавливает энергетический баланс и гибкость', price: '$40' },
    { title: 'СПОРТИВНЫЙ МАССАЖ', desc: 'Оптимизирует физическую форму и ускоряет восстановление', price: '$34' },
    { title: 'РЕЛАКСАЦИОННЫЙ МАССАЖ', desc: 'Помогает снять стресс и напряжение.', price: '$28' },
    { title: 'АНТИЦЕЛЛЮЛИТНЫЙ МАССАЖ', desc: 'Снижает проявления целлюлита и улучшает тонус кожи', price: '$38' },
    { title: 'АРОМАТЕРАПИЯ', desc: 'Использование эфирных масел для полного расслабления', price: '$28' },
  ],
  en: [
    { title: 'CLASSIC MASSAGE', desc: 'Relieves tension and improves circulation', price: 'from $32' },
    { title: 'RELAXATION MASSAGE', desc: 'Helps relieve stress and tension', price: 'from $28' },
    { title: 'THERAPEUTIC MASSAGE', desc: 'Improves overall condition and aids recovery', price: 'from $36' },
    { title: 'THAI MASSAGE', desc: 'Restores energy balance and flexibility', price: 'from $40' },
    { title: 'SPORTS MASSAGE', desc: 'Optimizes physical form and speeds recovery', price: 'from $34' },
    { title: 'RELAXATION MASSAGE', desc: 'Helps relieve stress and tension', price: 'from $28' },
    { title: 'ANTI-CELLULITE MASSAGE', desc: 'Reduces cellulite and improves skin tone', price: 'from $38' },
    { title: 'AROMATHERAPY', desc: 'Essential oils for complete relaxation', price: 'from $28' },
  ],
  ro: [
    { title: 'MASAJ CLASIC', desc: 'Ameliorează tensiunea și îmbunătățește circulația', price: 'de la 120 lei' },
    { title: 'MASAJ DE RELAXARE', desc: 'Ajută la ameliorarea stresului', price: 'de la 110 lei' },
    { title: 'MASAJ TERAPEUTIC', desc: 'Îmbunătățește starea generală și recuperarea', price: 'de la 130 lei' },
    { title: 'MASAJ THAILANDEZ', desc: 'Restabilește echilibrul energetic și flexibilitatea', price: 'de la 150 lei' },
    { title: 'MASAJ SPORTIV', desc: 'Optimizează forma fizică și recuperarea', price: 'de la 125 lei' },
    { title: 'MASAJ DE RELAXARE', desc: 'Ajută la ameliorarea stresului', price: 'de la 110 lei' },
    { title: 'MASAJ ANTICELULITIC', desc: 'Reduce celulita și îmbunătățește tonusul pielii', price: 'de la 140 lei' },
    { title: 'AROMATERAPIE', desc: 'Uleiuri esențiale pentru relaxare completă', price: 'de la 110 lei' },
  ],
}

/** Макс. карточек услуг; при пустом JSON — 8 карточек по умолчанию */
export const MASSAGE_SERVICES_MAX = 12
export const MASSAGE_SERVICES_DEFAULT_COUNT = 8

/** Слияние дефолтов услуг с JSON из localStorage (конструктор) */
export function mergeMassageServicesFromDraft(lang: Lang, raw?: string): MassageServiceMerged[] {
  const base = SERVICES[lang] ?? SERVICES.ru
  let prev: { title?: string; desc?: string; price?: string; image?: string; noImage?: boolean; hideImage?: boolean }[] = []
  try {
    if (raw?.trim()) prev = JSON.parse(raw)
  } catch {
    prev = []
  }
  if (!Array.isArray(prev)) prev = []

  let len = prev.length
  if (len === 0) len = MASSAGE_SERVICES_DEFAULT_COUNT
  else len = Math.min(Math.max(len, 1), MASSAGE_SERVICES_MAX)

  return Array.from({ length: len }, (_, i) => {
    const b = base[i % base.length]
    const p = prev[i] ?? {}
    return {
      title: typeof p.title === 'string' && p.title.length > 0 ? p.title : b.title,
      desc: typeof p.desc === 'string' && p.desc.length > 0 ? p.desc : b.desc,
      price: typeof p.price === 'string' && p.price.length > 0 ? p.price : b.price,
      image: typeof p.image === 'string' && p.image.length > 0 ? p.image : undefined,
      hideImage: p.noImage === true || p.hideImage === true,
    }
  })
}

export function serializeMassageServicesForDraft(merged: MassageServiceMerged[]): string {
  return JSON.stringify(
    merged.map(m => ({
      title: m.title,
      desc: m.desc,
      price: m.price,
      ...(m.image ? { image: m.image } : {}),
      ...(m.hideImage ? { noImage: true } : {}),
    }))
  )
}

const MAX_SVC_TITLE_LEN = 200
const MAX_SVC_DESC_LEN = 600
const MAX_SVC_PRICE_LEN = 80

const GAL_TABS: Record<Lang, string[]> = {
  ru: ['Сеансы массажа', 'Ароматерапия', 'Холл', 'Интерьер', 'Специалисты'],
  en: ['Massage sessions', 'Aromatherapy', 'Hall', 'Interior', 'Specialists'],
  ro: ['Ședințe de masaj', 'Aromaterapie', 'Hol', 'Interior', 'Specialiști'],
}

export const MASSAGE_GALLERY_MAX_SECTIONS = 6
export const MASSAGE_GALLERY_PHOTOS_PER_SECTION = 12
/** Макс. длина названия вкладки секции (в сайдбаре конструктора) */
export const MASSAGE_GALLERY_TAB_LABEL_MAX = 120

export type MassageGallerySectionMerged = {
  id: string
  label: string
  photos: (string | null)[]
}

function ensureGalleryPhotoSlots(photos: unknown): (string | null)[] {
  const arr = Array.isArray(photos) ? photos : []
  const out: (string | null)[] = []
  for (let i = 0; i < MASSAGE_GALLERY_PHOTOS_PER_SECTION; i++) {
    const v = arr[i]
    out.push(typeof v === 'string' && v.length > 0 ? v : null)
  }
  return out
}

/** Секции галереи + до 12 фото на секцию; по умолчанию — вкладки из GAL_TABS */
export function mergeMassageGalleryFromDraft(lang: Lang, raw?: string): MassageGallerySectionMerged[] {
  const tabs = GAL_TABS[lang] ?? GAL_TABS.ru
  const defaultSections = (): MassageGallerySectionMerged[] =>
    tabs.map((label, i) => ({
      id: `g-${i}`,
      label,
      photos: Array(MASSAGE_GALLERY_PHOTOS_PER_SECTION).fill(null) as (string | null)[],
    }))

  try {
    if (!raw?.trim()) return defaultSections()
    const parsed = JSON.parse(raw) as { sections?: unknown }
    if (!parsed || !Array.isArray(parsed.sections) || parsed.sections.length === 0) return defaultSections()

    const rawSecs = parsed.sections.slice(0, MASSAGE_GALLERY_MAX_SECTIONS)
    const out: MassageGallerySectionMerged[] = []
    for (let i = 0; i < rawSecs.length; i++) {
      const s = rawSecs[i] as { id?: unknown; label?: unknown; photos?: unknown }
      const id = typeof s.id === 'string' && s.id ? s.id : `g-${i}`
      const defaultLabel = tabs[i] ?? tabs[tabs.length - 1] ?? '—'
      /** Пустую строку сохраняем как есть — иначе в сайдбаре нельзя очистить поле и ввести новое название. */
      const label =
        typeof s.label === 'string'
          ? s.label.slice(0, MASSAGE_GALLERY_TAB_LABEL_MAX)
          : defaultLabel
      out.push({ id, label, photos: ensureGalleryPhotoSlots(s.photos) })
    }
    if (out.length === 0) return defaultSections()
    return out
  } catch {
    return defaultSections()
  }
}

export function serializeMassageGalleryForDraft(merged: MassageGallerySectionMerged[]): string {
  return JSON.stringify({
    sections: merged.map(s => ({
      id: s.id,
      label: s.label,
      photos: s.photos,
    })),
  })
}

const SUBS: Record<Lang, { title: string; desc: string; pct: string }[]> = {
  ru: [
    { title: 'АБОНЕМЕНТ НА 3 ПРОЦЕДУРЫ', desc: 'Идеальный старт для знакомства с нашими услугами', pct: '5%' },
    { title: 'АБОНЕМЕНТ НА 5 ПРОЦЕДУР', desc: 'Помогает снять стресс и напряжение', pct: '10%' },
    { title: 'АБОНЕМЕНТ НА 10 ПРОЦЕДУР', desc: 'Регулярный уход за вашим здоровьем', pct: '15%' },
    { title: 'АБОНЕМЕНТ НА 15 ПРОЦЕДУР', desc: 'Полный курс восстановления и расслабления', pct: '20%' },
    { title: 'АБОНЕМЕНТ НА 20 ПРОЦЕДУР', desc: 'Максимальная забота о вашем теле', pct: '25%' },
    { title: 'АБОНЕМЕНТ НА 30 ПРОЦЕДУР', desc: 'VIP программа на весь сезон', pct: '30%' },
    { title: 'АБОНЕМЕНТ НА 50 ПРОЦЕДУР', desc: 'Безлимитная программа для постоянных клиентов', pct: '50%' },
  ],
  en: [
    { title: '3 SESSION PACKAGE', desc: 'A perfect start to explore our services', pct: '5%' },
    { title: '5 SESSION PACKAGE', desc: 'Helps relieve stress and tension', pct: '10%' },
    { title: '10 SESSION PACKAGE', desc: 'Regular care for your health', pct: '15%' },
    { title: '15 SESSION PACKAGE', desc: 'Full recovery and relaxation course', pct: '20%' },
    { title: '20 SESSION PACKAGE', desc: 'Maximum care for your body', pct: '25%' },
    { title: '30 SESSION PACKAGE', desc: 'VIP program for the whole season', pct: '30%' },
    { title: '50 SESSION PACKAGE', desc: 'Unlimited program for loyal clients', pct: '50%' },
  ],
  ro: [
    { title: 'ABONAMENT 3 ȘEDINȚE', desc: 'Un start perfect pentru a explora serviciile noastre', pct: '5%' },
    { title: 'ABONAMENT 5 ȘEDINȚE', desc: 'Ajută la ameliorarea stresului', pct: '10%' },
    { title: 'ABONAMENT 10 ȘEDINȚE', desc: 'Îngrijire regulată pentru sănătatea ta', pct: '15%' },
    { title: 'ABONAMENT 15 ȘEDINȚE', desc: 'Curs complet de recuperare și relaxare', pct: '20%' },
    { title: 'ABONAMENT 20 ȘEDINȚE', desc: 'Maximă grijă pentru corpul tău', pct: '25%' },
    { title: 'ABONAMENT 30 ȘEDINȚE', desc: 'Program VIP pentru tot sezonul', pct: '30%' },
    { title: 'ABONAMENT 50 ȘEDINȚE', desc: 'Program nelimitat pentru clienți fideli', pct: '50%' },
  ],
}

export const MASSAGE_SUBSCRIPTION_PRESETS = SUBS

export type MassageSubscriptionItemMerged = {
  id: string
  templateIndex: number
  title?: string
  desc?: string
}

export function mergeMassageSubscriptionsFromDraft(lang: Lang, raw?: string): MassageSubscriptionItemMerged[] {
  const catalog = SUBS[lang] ?? SUBS.ru
  const defaultItems = (): MassageSubscriptionItemMerged[] =>
    catalog.map((_, i) => ({ id: `sub-${i}`, templateIndex: i }))
  if (!raw?.trim()) return defaultItems()
  try {
    const parsed = JSON.parse(raw) as { items?: unknown }
    if (!parsed || !Array.isArray(parsed.items)) return defaultItems()
    const out: MassageSubscriptionItemMerged[] = []
    const seenTemplateIndexes = new Set<number>()
    for (const row of parsed.items) {
      const r = row as { id?: unknown; templateIndex?: unknown; title?: unknown; desc?: unknown }
      const id = typeof r.id === 'string' && r.id ? r.id : `sub-${out.length}`
      const ti =
        typeof r.templateIndex === 'number' && Number.isFinite(r.templateIndex)
          ? Math.max(0, Math.min(catalog.length - 1, Math.floor(r.templateIndex)))
          : 0
      // Один пресет скидки должен быть только один раз.
      if (seenTemplateIndexes.has(ti)) continue
      seenTemplateIndexes.add(ti)
      const title = typeof r.title === 'string' ? r.title.slice(0, 220) : undefined
      const desc = typeof r.desc === 'string' ? r.desc.slice(0, 320) : undefined
      out.push({ id, templateIndex: ti, title, desc })
    }
    return out
  } catch {
    return defaultItems()
  }
}

export function serializeMassageSubscriptionsForDraft(merged: MassageSubscriptionItemMerged[]): string {
  return JSON.stringify({ items: merged })
}

export const MASSAGE_SUBSCRIPTION_PRESET_COUNT = SUBS.ru.length

const SUBS_VISIBLE = 3

const PRODUCTS: Record<Lang, { name: string; brand: string; price: number; oldPrice: number; info: string[] }[]> = {
  ru: [
    { name: 'Масло массажное лаванда', brand: 'SPA Natural', price: 440, oldPrice: 900, info: ['Бренд: SPA Natural', 'Вид: масло массажное', 'Эффект: расслабление', 'Для кого: для всех'] },
    { name: 'Крем для массажа питательный', brand: 'Organic', price: 1400, oldPrice: 2000, info: ['Бренд: Organic', 'Вид: крем массажный', 'Эффект: питание, увлажнение', 'Для кого: для женщин'] },
    { name: 'Масло эфирное мята', brand: 'AromaLife', price: 780, oldPrice: 900, info: ['Бренд: AromaLife', 'Вид: эфирное масло', 'Эффект: тонизирование', 'Для кого: для всех'] },
    { name: 'Бальзам разогревающий хвойный', brand: 'ThermoSpa', price: 990, oldPrice: 1000, info: ['Бренд: ThermoSpa', 'Вид: бальзам', 'Эффект: разогрев, расслабление', 'Для кого: для всех'] },
    { name: 'Скраб солевой морской', brand: 'OceanSpa', price: 620, oldPrice: 850, info: ['Бренд: OceanSpa', 'Вид: скраб', 'Эффект: пилинг, обновление', 'Для кого: для всех'] },
    { name: 'Масло кокосовое для массажа', brand: 'CocoRelax', price: 530, oldPrice: 750, info: ['Бренд: CocoRelax', 'Вид: масло массажное', 'Эффект: увлажнение', 'Для кого: для всех'] },
    { name: 'Гель охлаждающий ментоловый', brand: 'CoolTouch', price: 350, oldPrice: 500, info: ['Бренд: CoolTouch', 'Вид: гель', 'Эффект: охлаждение, снятие боли', 'Для кого: для спортсменов'] },
    { name: 'Аромасвеча для релаксации', brand: 'ZenLight', price: 280, oldPrice: 400, info: ['Бренд: ZenLight', 'Вид: аромасвеча', 'Эффект: релаксация', 'Для кого: для дома'] },
  ],
  en: [
    { name: 'Lavender massage oil', brand: 'SPA Natural', price: 15, oldPrice: 30, info: ['Brand: SPA Natural', 'Type: massage oil', 'Effect: relaxation'] },
    { name: 'Nourishing massage cream', brand: 'Organic', price: 45, oldPrice: 65, info: ['Brand: Organic', 'Type: massage cream', 'Effect: nourishing'] },
    { name: 'Peppermint essential oil', brand: 'AromaLife', price: 25, oldPrice: 30, info: ['Brand: AromaLife', 'Type: essential oil', 'Effect: invigorating'] },
    { name: 'Warming herbal balm', brand: 'ThermoSpa', price: 32, oldPrice: 35, info: ['Brand: ThermoSpa', 'Type: balm', 'Effect: warming'] },
    { name: 'Sea salt scrub', brand: 'OceanSpa', price: 20, oldPrice: 28, info: ['Brand: OceanSpa', 'Type: scrub', 'Effect: exfoliation'] },
    { name: 'Coconut massage oil', brand: 'CocoRelax', price: 18, oldPrice: 25, info: ['Brand: CocoRelax', 'Type: massage oil', 'Effect: moisturizing'] },
    { name: 'Cooling menthol gel', brand: 'CoolTouch', price: 12, oldPrice: 17, info: ['Brand: CoolTouch', 'Type: gel', 'Effect: cooling, pain relief'] },
    { name: 'Relaxation aroma candle', brand: 'ZenLight', price: 10, oldPrice: 14, info: ['Brand: ZenLight', 'Type: aroma candle', 'Effect: relaxation'] },
  ],
  ro: [
    { name: 'Ulei de masaj lavandă', brand: 'SPA Natural', price: 80, oldPrice: 160, info: ['Brand: SPA Natural', 'Tip: ulei de masaj', 'Efect: relaxare'] },
    { name: 'Cremă de masaj nutritivă', brand: 'Organic', price: 250, oldPrice: 360, info: ['Brand: Organic', 'Tip: cremă masaj', 'Efect: nutriție'] },
    { name: 'Ulei esențial de mentă', brand: 'AromaLife', price: 140, oldPrice: 160, info: ['Brand: AromaLife', 'Tip: ulei esențial', 'Efect: tonifiere'] },
    { name: 'Balsam de încălzire', brand: 'ThermoSpa', price: 180, oldPrice: 190, info: ['Brand: ThermoSpa', 'Tip: balsam', 'Efect: încălzire'] },
    { name: 'Scrub cu sare de mare', brand: 'OceanSpa', price: 110, oldPrice: 150, info: ['Brand: OceanSpa', 'Tip: scrub', 'Efect: exfoliere'] },
    { name: 'Ulei de cocos pentru masaj', brand: 'CocoRelax', price: 95, oldPrice: 135, info: ['Brand: CocoRelax', 'Tip: ulei de masaj', 'Efect: hidratare'] },
    { name: 'Gel răcoritor cu mentol', brand: 'CoolTouch', price: 65, oldPrice: 90, info: ['Brand: CoolTouch', 'Tip: gel', 'Efect: răcorire'] },
    { name: 'Lumânare aromatică', brand: 'ZenLight', price: 50, oldPrice: 72, info: ['Brand: ZenLight', 'Tip: lumânare', 'Efect: relaxare'] },
  ],
}

const SPECS: Record<Lang, { name: string; role: string; exp: string }[]> = {
  ru: [
    { name: 'Анна Петрова', role: 'Главный специалист', exp: 'Опыт 12 лет · Классический, спортивный массаж' },
    { name: 'Мария Иванова', role: 'Массажист', exp: 'Опыт 8 лет · Лимфодренажный, антицеллюлитный' },
    { name: 'Александра Иванова', role: 'Руководитель компании', exp: 'Опыт 15 лет · Управление, стратегия развития' },
    { name: 'Ольга Козлова', role: 'Массажист', exp: 'Опыт 6 лет · Тайский, расслабляющий массаж' },
    { name: 'Елена Смирнова', role: 'Косметолог-массажист', exp: 'Опыт 10 лет · Массаж лица, лифтинг' },
  ],
  en: [
    { name: 'Anna Petrova', role: 'Lead specialist', exp: '12 years · Classic & sports massage' },
    { name: 'Maria Ivanova', role: 'Massage therapist', exp: '8 years · Lymphatic drainage, anti-cellulite' },
    { name: 'Alexandra Ivanova', role: 'Company director', exp: '15 years · Management & strategy' },
    { name: 'Olga Kozlova', role: 'Massage therapist', exp: '6 years · Thai & relaxation massage' },
    { name: 'Elena Smirnova', role: 'Cosmetologist-therapist', exp: '10 years · Facial massage, lifting' },
  ],
  ro: [
    { name: 'Anna Petrova', role: 'Specialist principal', exp: '12 ani · Masaj clasic și sportiv' },
    { name: 'Maria Ivanova', role: 'Terapeut masaj', exp: '8 ani · Drenaj limfatic, anticelulitic' },
    { name: 'Alexandra Ivanova', role: 'Director companie', exp: '15 ani · Management și strategie' },
    { name: 'Olga Kozlova', role: 'Terapeut masaj', exp: '6 ani · Masaj thailandez și de relaxare' },
    { name: 'Elena Smirnova', role: 'Cosmetolog-terapeut', exp: '10 ani · Masaj facial, lifting' },
  ],
}

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
const VISIBLE_GAL = 4

const PINK = '#D4908F'
const PINK_DARK = '#C07F7E'
const PINK_LIGHT = '#F5E0DF'
const BG = '#FAF8F6'

/** Лимиты символов для hero-блока в режиме редактирования конструктора */
const MAX_HERO_TITLE_LINE = 80
const MAX_HERO_SUB = 400
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
  heroTitle1: heroTitle1Prop,
  heroTitle2: heroTitle2Prop,
  heroSub: heroSubProp,
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
}: MassageTemplateProps) {
  const t = UI[lang] ?? UI.ru
  const theme = massageThemeColors
  const col = (k: keyof MassageThemeColors) => resolveMassageThemeColor(k, theme)
  const galTitleCol = col('galTitle')
  const galSubCol = col('galSub')
  const galTabActiveCol = col('galTabActive')
  const subsCtaTextCol = col('subsCtaText')
  const galTabsFallback = GAL_TABS[lang] ?? GAL_TABS.ru
  const logoShapeClass =
    headerLogoShape === 'square' ? 'rounded-none' : headerLogoShape === 'rounded' ? 'rounded-xl' : 'rounded-full'
  const showHeaderLogo = headerLogoVisible !== false && !!headerLogoUrl && headerLogoUrl.length > 0
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
    () => mergeMassageSubscriptionsFromDraft(lang, massageSubsJsonProp),
    [lang, massageSubsJsonProp]
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

  const subsBlockHidden = massageSubsHiddenProp === 'true'
  const navItems = useMemo(() => {
    const labels = NAV[lang] ?? NAV.ru
    const pairs = labels.map((label, i) => ({ label, id: NAV_IDS[i] }))
    if (subsBlockHidden) return pairs.filter(p => p.id !== 'promos')
    return pairs
  }, [lang, subsBlockHidden])

  const removeSubItem = useCallback(
    (id: string) => {
      if (!onSaveDraft) return
      const current = mergeMassageSubscriptionsFromDraft(lang, massageSubsJsonProp)
      const next = current.filter(row => row.id !== id)
      onSaveDraft('publicMassageSubsJson', serializeMassageSubscriptionsForDraft(next))
    },
    [lang, massageSubsJsonProp, onSaveDraft]
  )
  const patchSubItem = useCallback(
    (index: number, patch: Partial<MassageSubscriptionItemMerged>) => {
      if (!onSaveDraft) return
      const current = mergeMassageSubscriptionsFromDraft(lang, massageSubsJsonProp)
      const next = current.map((row, i) => (i === index ? { ...row, ...patch } : row))
      onSaveDraft('publicMassageSubsJson', serializeMassageSubscriptionsForDraft(next))
    },
    [lang, massageSubsJsonProp, onSaveDraft]
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

  const products = PRODUCTS[lang] ?? PRODUCTS.ru
  const specs = SPECS[lang] ?? SPECS.ru

  const name =
    ((headerSiteName !== undefined && headerSiteName !== '' ? headerSiteName : null) ?? siteName) || 'Lotos'
  const heroLine1 = heroTitle1Prop || t.heroTitle1
  const heroLine2 = heroTitle2Prop || t.heroTitle2
  const heroSubText = heroSubProp || t.heroSub

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

  const rootRef = useRef<HTMLDivElement>(null)
  const topBarRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLElement>(null)
  const [heroH, setHeroH] = useState('70vh')
  const [activeGalTab, setActiveGalTab] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)

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

  const galTotal = MASSAGE_GALLERY_PHOTOS_PER_SECTION
  const galCanScroll = galTotal > VISIBLE_GAL
  const [galSlide, setGalSlide] = useState(galCanScroll ? galTotal : 0)
  const [galSmooth, setGalSmooth] = useState(true)

  const subsTotal = displaySubs.length
  const subsCanScroll = subsTotal > SUBS_VISIBLE
  const [subsSlide, setSubsSlide] = useState(subsCanScroll ? subsTotal : 0)
  const [subsSmooth, setSubsSmooth] = useState(true)

  const handleSubsCtaClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const url = massageSubsCtaUrlProp?.trim()
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else onBookNow?.()
  }
  const subsCtaHidden = massageSubsCtaHiddenProp === 'true'

  const CAT_VISIBLE = 4
  const catTotal = products.length
  const [catSlide, setCatSlide] = useState(0)
  const catAtStart = catSlide === 0
  const catAtEnd = catSlide >= catTotal - CAT_VISIBLE

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
  }, [activeGalTab, galTotal, galCanScroll])
  useEffect(() => {
    if (!subsSmooth) requestAnimationFrame(() => requestAnimationFrame(() => setSubsSmooth(true)))
  }, [subsSmooth])

  useEffect(() => {
    setSubsSlide(subsCanScroll ? subsTotal : 0)
  }, [subsTotal, subsCanScroll])

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

      {/* ============ HEADER (шапка: контакты + меню + hero) — якорь для конструктора ============ */}
      <div id="massage-block-header">
      {/* ============ TOP CONTACT BAR ============ */}
      <div
        ref={topBarRef}
        className="w-full border-b border-gray-100"
        style={{ backgroundColor: col('topBarBg') }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-6 flex-wrap">
            {/* Logo + tagline */}
            <div className="flex items-center gap-3 min-w-0">
              {showHeaderLogo && (
                <img
                  src={headerLogoUrl!}
                  alt=""
                  className={`h-14 w-14 shrink-0 object-cover border border-gray-200/80 ${logoShapeClass}`}
                />
              )}
              <span
                className={`text-3xl italic font-bold leading-none${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                style={{ color: col('siteName') }}
                contentEditable={!!isEditMode}
                suppressContentEditableWarning
                onBlur={e => isEditMode && onSaveDraft?.('publicSiteName', e.currentTarget.textContent ?? '')}
              >
                {name}
              </span>
              <span
                className={`text-[11px] leading-snug whitespace-pre-line max-w-[140px] border-l border-gray-200 pl-3${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                style={{ fontFamily: 'sans-serif', color: col('tagline') }}
                contentEditable={!!isEditMode}
                suppressContentEditableWarning
                onBlur={e => isEditMode && onSaveDraft?.('publicTagline', e.currentTarget.textContent ?? '')}
              >
                {headerTagline ?? t.studioTag}
              </span>
            </div>

            {/* Address */}
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: PINK_LIGHT, color: col('contactOnline') }}
              >
                <Pin size="w-5 h-5" />
              </div>
              <div
                className={`text-sm font-semibold${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
                style={{ color: col('address') }}
                contentEditable={!!isEditMode}
                suppressContentEditableWarning
                onBlur={e => isEditMode && onSaveDraft?.('publicAddress', e.currentTarget.textContent ?? '')}
              >
                {headerAddress ?? t.addressDefault}
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 flex-wrap">
              {whatsappUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicWhatsapp', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#25D366"><WhatsAppIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#25D366"><WhatsAppIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {viberUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicViber', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={viberUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#7F00FF"><ViberIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#7F00FF"><ViberIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {telegramUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicTelegram', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#0088cc"><TelegramIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#0088cc"><TelegramIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {instagramUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicInstagram', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#E1306C"><InstagramIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#E1306C"><InstagramIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {facebookUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicFacebook', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#1877F2"><FacebookIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#1877F2"><FacebookIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {vkUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicVk', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={vkUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#4680C2"><VKIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#4680C2"><VKIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {twitterUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicTwitter', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#0f1419"><TwitterIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#0f1419"><TwitterIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
              {tiktokUrl && (
                <div className="relative">
                  {isEditMode && onSaveDraft && (
                    <button type="button" onClick={() => onSaveDraft('publicTiktok', '')} className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] z-10 hover:bg-red-600">✕</button>
                  )}
                  {!isEditMode ? (
                    <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                      <SocialCircle bg="#010101"><TikTokIcon className="w-5 h-5" /></SocialCircle>
                    </a>
                  ) : (
                    <SocialCircle bg="#010101"><TikTokIcon className="w-5 h-5" /></SocialCircle>
                  )}
                </div>
              )}
            </div>

            {/* Contact info */}
            <div className="text-right">
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

      {/* ============ NAVIGATION — sticky globally, starts below header ============ */}
      <nav
        ref={navRef}
        className="sticky top-0 z-20 border-b border-gray-100 shadow-sm"
        style={{ backgroundColor: col('navBg') }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-center gap-8 py-3.5 overflow-x-auto scrollbar-hide">
          {navItems.map(({ label, id }) => (
            <button
              key={id}
              type="button"
              onClick={() => scrollTo(id)}
              className="whitespace-nowrap text-sm transition-colors font-medium tracking-wide hover:opacity-80"
              style={{ fontFamily: 'inherit', color: col('navLink') }}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>

      {/* ============ HERO — fills remaining first screen ============ */}
      <section className="relative overflow-hidden flex items-center" style={{ height: heroH }}>
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

        <div className="relative z-10 w-full px-6 md:px-12 lg:px-20">
          <h1 className="text-7xl md:text-9xl italic font-bold leading-[0.85]">
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
            className={`mt-6 text-base md:text-lg max-w-lg leading-relaxed whitespace-pre-line${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
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
          <button
            onClick={onBookNow}
            className="mt-8 text-white px-8 py-4 rounded-full text-sm font-bold tracking-wider transition-all duration-200 hover:shadow-lg hover:scale-[1.02] border-2 border-solid"
            style={{
              fontFamily: 'sans-serif',
              backgroundColor: PINK,
              borderColor: col('heroCtaBorder'),
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = PINK_DARK
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = PINK
            }}
          >
            {t.heroCta}
          </button>
        </div>
      </section>
      </div>

      {/* ============ SERVICES ============ */}
      <section id="our-services" className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2
            className={`text-3xl md:text-5xl italic font-bold leading-tight text-center${isEditMode ? ' border-b border-dashed border-b-pink-300 cursor-text' : ''}`}
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
      <section id="about" className="py-20 md:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row items-center gap-16 md:gap-20">
          {/* Text */}
          <div className="flex-1 min-w-0">
            <h2
              className={cn(
                'text-4xl md:text-6xl italic font-bold leading-[1.1] max-w-xl whitespace-pre-line',
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
                'mt-8 text-lg md:text-xl leading-relaxed max-w-xl whitespace-pre-line',
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
          <div className="flex-shrink-0 relative flex items-center justify-center w-72 h-80 md:w-80 md:h-96">
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
          <div className="mt-8 relative">
            <div className="overflow-hidden rounded-xl">
              <div
                className="flex"
                style={{
                  transform: galCanScroll
                    ? `translateX(-${galSlide * (100 / VISIBLE_GAL)}%)`
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
                      style={{ width: `${100 / VISIBLE_GAL}%` }}
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-md"
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
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-md"
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
            style={{ color: '#1a1a1a' }}
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
          <div className="mt-10 relative">
            {displaySubs.length === 0 && isEditMode ? (
              <p className="text-sm text-muted-foreground border border-dashed border-border/60 rounded-2xl p-6 text-center">
                {t.subsEmptyHint}
              </p>
            ) : displaySubs.length === 0 ? null : (
            <div className="overflow-hidden rounded-2xl">
              <div
                className="flex"
                style={{
                  transform: `translateX(-${subsSlide * (100 / SUBS_VISIBLE)}%)`,
                  transition: subsSmooth ? 'transform 500ms ease-out' : 'none',
                }}
                onTransitionEnd={handleSubsTransEnd}
              >
                {(subsCanScroll ? [...displaySubs, ...displaySubs, ...displaySubs] : displaySubs).map((sub, i) => {
                  const realIdx = subsCanScroll ? i % displaySubs.length : i
                  const isPrimary = realIdx === 0
                  return (
                    <div
                      key={`${sub.id}-${i}`}
                      className="shrink-0 px-2.5"
                      style={{ width: `${100 / SUBS_VISIBLE}%` }}
                    >
                      <div
                        className="rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden h-full min-h-[220px]"
                        style={{ background: isPrimary ? '#3a3a3a' : '#2D2D2D' }}
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
                            opacity: 0.08,
                            color: 'white',
                          }}
                        >
                          {sub.pct}
                        </span>
                        <div className="relative z-10">
                          <h3
                            className={cn(
                              'italic text-base font-bold tracking-wide whitespace-pre-line',
                              isEditMode && 'border-b border-dashed border-white/40 cursor-text'
                            )}
                            style={{ color: 'white' }}
                            contentEditable={!!isEditMode}
                            suppressContentEditableWarning
                            onKeyDown={e => {
                              if (!isEditMode) return
                              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                            }}
                            onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, 220)}
                            onBlur={e =>
                              isEditMode &&
                              patchSubItem(realIdx, { title: clipHeroText(e.currentTarget.innerText ?? '', 220) })
                            }
                          >
                            {sub.title}
                          </h3>
                          <p
                            className={cn(
                              'text-xs mt-2 whitespace-pre-line',
                              isEditMode && 'border-b border-dashed border-white/30 cursor-text'
                            )}
                            style={{ fontFamily: 'sans-serif', color: 'rgba(255,255,255,0.5)' }}
                            contentEditable={!!isEditMode}
                            suppressContentEditableWarning
                            onKeyDown={e => {
                              if (!isEditMode) return
                              if (e.key === 'Enter' && !e.shiftKey) e.preventDefault()
                            }}
                            onInput={e => isEditMode && enforceHeroMaxLength(e.currentTarget, 320)}
                            onBlur={e =>
                              isEditMode &&
                              patchSubItem(realIdx, { desc: clipHeroText(e.currentTarget.innerText ?? '', 320) })
                            }
                          >
                            {sub.desc}
                          </p>
                        </div>
                        {!subsCtaHidden && (
                          <button
                            type="button"
                            onClick={handleSubsCtaClick}
                            className="text-xs font-bold mt-4 relative z-10 text-left hover:underline"
                            style={{
                              color: subsCtaTextCol,
                              fontFamily: 'sans-serif',
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
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-md"
                  style={{ background: PINK_LIGHT, color: PINK }}
                  onMouseEnter={e => { e.currentTarget.style.background = PINK; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = PINK_LIGHT; e.currentTarget.style.color = PINK }}
                  onClick={subsPrev}
                >
                  <ChevL />
                </button>
                <button
                  type="button"
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-md"
                  style={{ background: PINK_LIGHT, color: PINK }}
                  onMouseEnter={e => { e.currentTarget.style.background = PINK; e.currentTarget.style.color = 'white' }}
                  onMouseLeave={e => { e.currentTarget.style.background = PINK_LIGHT; e.currentTarget.style.color = PINK }}
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
      <section id="catalog" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl italic font-bold text-[#1a1a1a] text-center">{t.catTitle}</h2>
          <div className="mt-12 relative">
            <div className="overflow-hidden">
              <div
                className="flex"
                style={{
                  transform: `translateX(-${catSlide * (100 / CAT_VISIBLE)}%)`,
                  transition: 'transform 500ms ease-out',
                }}
              >
                {products.map((p, i) => {
                  const grad = SVC_COLORS[i % SVC_COLORS.length]
                  const discount = p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0
                  return (
                    <div
                      key={i}
                      className="shrink-0 px-3"
                      style={{ width: `${100 / CAT_VISIBLE}%` }}
                    >
                      <div
                        className="bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full"
                        style={{ border: '1px solid #f0eded' }}
                      >
                        <div
                          className="relative h-56 flex items-center justify-center overflow-hidden"
                          style={{ background: `linear-gradient(160deg, ${grad[0]}, ${grad[1]})` }}
                        >
                          {discount > 0 && (
                            <span
                              className="absolute top-3.5 left-3.5 text-white text-[10px] px-3 py-1 rounded-full font-bold tracking-wide"
                              style={{ background: PINK, fontFamily: 'sans-serif' }}
                            >
                              −{discount}%
                            </span>
                          )}
                          <ImgIcon className="w-16 h-16 text-white/30 group-hover:scale-110 transition-transform duration-300" />
                        </div>
                        <div className="p-5" style={{ fontFamily: 'sans-serif' }}>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-3xl font-bold text-[#1a1a1a]">{p.price}</span>
                            <span className="text-xs text-gray-400 font-medium">{t.currency}</span>
                            {p.oldPrice > p.price && (
                              <span className="text-sm text-gray-300 line-through ml-2">{p.oldPrice}</span>
                            )}
                          </div>
                          <p className="mt-2.5 text-sm font-semibold text-[#1a1a1a] leading-snug">{p.name}</p>
                          <div className="mt-3 space-y-1 border-t border-gray-100 pt-3">
                            {p.info.map((line, j) => (
                              <p key={j} className="text-[11px] text-gray-400 leading-relaxed">{line}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {catTotal > CAT_VISIBLE && (
              <>
                {!catAtStart && (
                  <button
                    onClick={() => setCatSlide(s => Math.max(0, s - 1))}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-md"
                    style={{ background: PINK_LIGHT, color: PINK }}
                    onMouseEnter={e => { e.currentTarget.style.background = PINK; e.currentTarget.style.color = 'white' }}
                    onMouseLeave={e => { e.currentTarget.style.background = PINK_LIGHT; e.currentTarget.style.color = PINK }}
                  >
                    <ChevL />
                  </button>
                )}
                {!catAtEnd && (
                  <button
                    onClick={() => setCatSlide(s => Math.min(catTotal - CAT_VISIBLE, s + 1))}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-11 h-11 rounded-full flex items-center justify-center transition-colors shadow-md"
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
        </div>
      </section>

      {/* ============ SPECIALISTS ============ */}
      <section id="masters" className="py-20 md:py-28 bg-white">
        <div className="max-w-[90rem] mx-auto px-4">
          <h2 className="text-3xl md:text-5xl italic font-bold text-[#1a1a1a] leading-tight max-w-2xl">
            {t.specTitle}
          </h2>
          <div className="mt-12 grid grid-cols-5 gap-5">
            {specs.map((s, i) => {
              const grad = GALLERY_COLORS[i % GALLERY_COLORS.length]
              return (
                <div key={i} className="rounded-2xl overflow-hidden group cursor-pointer" style={{ border: '1px solid #f0eded' }}>
                  <div
                    className="aspect-[3/4] relative flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(180deg, ${grad[0]}, ${grad[1]})` }}
                  >
                    <PersonIcon />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="bg-white px-4 py-5">
                    <p className="italic text-base font-bold text-[#1a1a1a] tracking-wide">{s.name}</p>
                    <p className="text-xs mt-1 font-medium" style={{ color: PINK, fontFamily: 'sans-serif' }}>{s.role}</p>
                    <p className="text-[11px] text-gray-400 mt-2 leading-relaxed" style={{ fontFamily: 'sans-serif' }}>{s.exp}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============ CTA — BOOK NOW ============ */}
      <section
        id="massage-block-cta"
        className="relative py-24 md:py-32 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${PINK}, ${PINK_DARK})` }}
      >
        <div
          className="absolute -top-20 -right-20 w-72 h-72 rounded-full opacity-10"
          style={{ background: 'white' }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full opacity-10"
          style={{ background: 'white' }}
        />
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl italic font-bold text-white leading-[1.1]">
            {t.ctaTitle}
          </h2>
          <p
            className="mt-6 text-white/80 text-base md:text-lg max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: 'sans-serif' }}
          >
            {t.ctaSub}
          </p>
          <button
            onClick={onBookNow}
            className="mt-10 bg-white px-12 py-5 rounded-full text-sm font-bold tracking-wider transition-all duration-200 hover:shadow-2xl hover:scale-[1.03]"
            style={{ color: PINK, fontFamily: 'sans-serif' }}
          >
            {t.ctaBtn}
          </button>
        </div>
      </section>

      {/* ============ CONTACTS ============ */}
      <section id="contacts" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-5xl italic font-bold text-[#1a1a1a] leading-tight max-w-3xl">
            {t.contactTitle}
          </h2>
          <div className="mt-10 flex flex-col md:flex-row gap-10">
            <div className="flex-1 max-w-sm">
              <h3 className="text-2xl italic font-bold">{t.ourContacts}</h3>
              <div className="mt-6 space-y-5 text-sm" style={{ fontFamily: 'sans-serif' }}>
                <div className="flex items-center gap-3" style={{ color: PINK }}>
                  <Pin size="w-5 h-5" />
                  <span className="text-[#1a1a1a]">{headerAddress ?? t.addressDefault}</span>
                </div>
                <div className="flex items-start gap-3" style={{ color: PINK }}>
                  <Clock size="w-5 h-5" />
                  <div className="text-[#1a1a1a]">
                    <p>{t.workHours}</p>
                    <p>{t.workWeekend}</p>
                    <p>{t.dayOff}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3" style={{ color: PINK }}>
                  <Phone size="w-5 h-5" />
                  <span className="text-[#1a1a1a]">{headerPhone ?? t.phone}</span>
                </div>
                <div className="flex items-center gap-3" style={{ color: PINK }}>
                  <Mail size="w-5 h-5" />
                  <span className="text-[#1a1a1a]">{t.email}</span>
                </div>
              </div>
              {(viberUrl || whatsappUrl || telegramUrl) && (
                <>
                  <p className="mt-6 text-[10px] font-bold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'sans-serif' }}>
                    {t.writeOnline}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {viberUrl && (
                      <a href={viberUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <SocialCircle bg="#7F00FF" size={38}>
                          <ViberIcon className="w-[18px] h-[18px]" />
                        </SocialCircle>
                      </a>
                    )}
                    {whatsappUrl && (
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <SocialCircle bg="#25D366" size={38}>
                          <WhatsAppIcon className="w-[18px] h-[18px]" />
                        </SocialCircle>
                      </a>
                    )}
                    {telegramUrl && (
                      <a href={telegramUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <SocialCircle bg="#0088cc" size={38}>
                          <TelegramIcon className="w-[18px] h-[18px]" />
                        </SocialCircle>
                      </a>
                    )}
                  </div>
                </>
              )}
              {(facebookUrl || instagramUrl || vkUrl || twitterUrl || tiktokUrl) && (
                <>
                  <p className="mt-6 text-[11px] font-bold text-gray-400 uppercase tracking-wider" style={{ fontFamily: 'sans-serif' }}>
                    {t.socials}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2.5">
                    {facebookUrl && (
                      <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <SocialCircle bg="#1877F2" size={38}>
                          <FacebookIcon className="w-[18px] h-[18px]" />
                        </SocialCircle>
                      </a>
                    )}
                    {instagramUrl && (
                      <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <SocialCircle bg="linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" size={38}>
                          <InstagramIcon className="w-[18px] h-[18px]" />
                        </SocialCircle>
                      </a>
                    )}
                    {vkUrl && (
                      <a href={vkUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <SocialCircle bg="#4C75A3" size={38}>
                          <VKIcon className="w-[18px] h-[18px]" />
                        </SocialCircle>
                      </a>
                    )}
                    {twitterUrl && (
                      <a href={twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <SocialCircle bg="#0f1419" size={38}>
                          <TwitterIcon className="w-[18px] h-[18px]" />
                        </SocialCircle>
                      </a>
                    )}
                    {tiktokUrl && (
                      <a href={tiktokUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
                        <SocialCircle bg="#010101" size={38}>
                          <TikTokIcon className="w-[18px] h-[18px]" />
                        </SocialCircle>
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex-[2]">
              <p className="text-sm font-medium text-gray-400 mb-2" style={{ fontFamily: 'sans-serif' }}>{t.salonAddr}</p>
              <div className="rounded-xl border border-gray-200 h-80 overflow-hidden">
                <iframe
                  title="map"
                  src="https://www.google.com/maps?q=0,0&z=2&output=embed&hl=en"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SCROLL TO TOP ============ */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="sticky bottom-6 float-right mr-6 w-10 h-10 rounded-full text-white flex items-center justify-center shadow-lg z-20 transition-colors"
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
