export type Lang = 'ru' | 'en' | 'ro'

export type MassageServiceMerged = {
  title: string
  desc: string
  price: string
  image?: string
  hideImage: boolean
}

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

export const MAX_SVC_TITLE_LEN = 200
export const MAX_SVC_DESC_LEN = 600
export const MAX_SVC_PRICE_LEN = 80

export const GAL_TABS: Record<Lang, string[]> = {
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
    { title: 'СПЕЦПРЕДЛОЖЕНИЕ', desc: 'Полная стоимость услуги по акции — уточняйте у администратора', pct: '100%' },
  ],
  en: [
    { title: '3 SESSION PACKAGE', desc: 'A perfect start to explore our services', pct: '5%' },
    { title: '5 SESSION PACKAGE', desc: 'Helps relieve stress and tension', pct: '10%' },
    { title: '10 SESSION PACKAGE', desc: 'Regular care for your health', pct: '15%' },
    { title: '15 SESSION PACKAGE', desc: 'Full recovery and relaxation course', pct: '20%' },
    { title: '20 SESSION PACKAGE', desc: 'Maximum care for your body', pct: '25%' },
    { title: '30 SESSION PACKAGE', desc: 'VIP program for the whole season', pct: '30%' },
    { title: '50 SESSION PACKAGE', desc: 'Unlimited program for loyal clients', pct: '50%' },
    { title: 'SPECIAL OFFER', desc: 'Full discount promo — ask reception for details', pct: '100%' },
  ],
  ro: [
    { title: 'ABONAMENT 3 ȘEDINȚE', desc: 'Un start perfect pentru a explora serviciile noastre', pct: '5%' },
    { title: 'ABONAMENT 5 ȘEDINȚE', desc: 'Ajută la ameliorarea stresului', pct: '10%' },
    { title: 'ABONAMENT 10 ȘEDINȚE', desc: 'Îngrijire regulată pentru sănătatea ta', pct: '15%' },
    { title: 'ABONAMENT 15 ȘEDINȚE', desc: 'Curs complet de recuperare și relaxare', pct: '20%' },
    { title: 'ABONAMENT 20 ȘEDINȚE', desc: 'Maximă grijă pentru corpul tău', pct: '25%' },
    { title: 'ABONAMENT 30 ȘEDINȚE', desc: 'Program VIP pentru tot sezonul', pct: '30%' },
    { title: 'ABONAMENT 50 ȘEDINȚE', desc: 'Program nelimitat pentru clienți fideli', pct: '50%' },
    { title: 'OFERTĂ SPECIALĂ', desc: 'Reducere integrală — întrebați la recepție', pct: '100%' },
  ],
}

export const MASSAGE_SUBSCRIPTION_PRESETS = SUBS

export type MassageSubscriptionItemMerged = {
  id: string
  templateIndex: number
  title?: string
  desc?: string
}

function parseSubscriptionTemplateIndex(v: unknown, catalogLen: number): number {
  let n = 0
  if (typeof v === 'number' && Number.isFinite(v)) n = Math.floor(v)
  else if (typeof v === 'string') {
    const t = v.trim()
    if (/^-?\d+$/.test(t)) n = parseInt(t, 10)
  }
  if (!Number.isFinite(n)) n = 0
  return Math.max(0, Math.min(catalogLen - 1, n))
}

/** Полный набор абонементов по умолчанию (все пресеты скидок по порядку). */
function defaultMassageSubscriptionItemsForLang(lang: Lang): MassageSubscriptionItemMerged[] {
  const catalog = SUBS[lang] ?? SUBS.ru
  return catalog.map((_, i) => ({ id: `sub-${i}`, templateIndex: i }))
}

export function mergeMassageSubscriptionsFromDraft(lang: Lang, raw?: string): MassageSubscriptionItemMerged[] {
  const catalog = SUBS[lang] ?? SUBS.ru
  const defaultItems = (): MassageSubscriptionItemMerged[] => defaultMassageSubscriptionItemsForLang(lang)
  if (!raw?.trim()) return defaultItems()
  try {
    const parsed = JSON.parse(raw) as { items?: unknown }
    if (!parsed || !Array.isArray(parsed.items)) return defaultItems()
    if (parsed.items.length === 0) return []
    const out: MassageSubscriptionItemMerged[] = []
    const seenTemplateIndexes = new Set<number>()
    for (const row of parsed.items) {
      const r = row as { id?: unknown; templateIndex?: unknown; title?: unknown; desc?: unknown }
      const id = typeof r.id === 'string' && r.id ? r.id : `sub-${out.length}`
      const ti = parseSubscriptionTemplateIndex(r.templateIndex, catalog.length)
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

export type MassageCatalogProductMerged = {
  id: string
  name: string
  brand: string
  /** Символ валюты у цены; по умолчанию «$», можно очистить */
  currency: string
  price: number
  oldPrice: number
  info: string[]
  /** data URL превью карточки; без него — градиент и иконка */
  image?: string | null
}

export const MASSAGE_CATALOG_MAX = 24
export const MAX_CATALOG_NAME_LEN = 200
export const MAX_CATALOG_BRAND_LEN = 120
export const MAX_CATALOG_INFO_LINE = 220
export const MAX_CATALOG_TITLE_LEN = 200
const MAX_CATALOG_CURRENCY_LEN = 12

export function formatCatalogPriceDisplay(n: number): string {
  if (!Number.isFinite(n)) return '0'
  if (Number.isInteger(n)) return String(n)
  const s = n.toFixed(2)
  return s.endsWith('.00') ? String(Math.round(n)) : s
}

export function parseCatalogPriceText(s: string): number {
  const n = parseFloat(s.replace(/[^\d.,-]/g, '').replace(',', '.'))
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

export function normalizeCatalogCurrencyInput(s: string): string {
  return s.replace(/\s+/g, '').slice(0, MAX_CATALOG_CURRENCY_LEN)
}

export function mergeMassageCatalogFromDraft(lang: Lang, raw?: string): MassageCatalogProductMerged[] {
  const fallback = (): MassageCatalogProductMerged[] =>
    (PRODUCTS[lang] ?? PRODUCTS.ru).map((row, i) => ({
      id: `cat-${i}`,
      name: row.name,
      brand: row.brand,
      currency: '$',
      price: row.price,
      oldPrice: row.oldPrice,
      info: [...row.info],
    }))
  if (!raw?.trim()) return fallback()
  try {
    const parsed = JSON.parse(raw) as { products?: unknown }
    if (!parsed || !Array.isArray(parsed.products)) return fallback()
    if (parsed.products.length === 0) return []
    const base = PRODUCTS[lang] ?? PRODUCTS.ru
    const out: MassageCatalogProductMerged[] = []
    for (let i = 0; i < Math.min(parsed.products.length, MASSAGE_CATALOG_MAX); i++) {
      const r = parsed.products[i] as Record<string, unknown>
      const def = base[i % base.length]
      const id = typeof r.id === 'string' && r.id ? r.id : `cat-${i}`
      const name =
        typeof r.name === 'string' ? r.name.slice(0, MAX_CATALOG_NAME_LEN) : def.name
      const brand =
        typeof r.brand === 'string' ? r.brand.slice(0, MAX_CATALOG_BRAND_LEN) : def.brand
      const parseNum = (v: unknown, d: number): number => {
        if (typeof v === 'number' && Number.isFinite(v)) return Math.max(0, v)
        if (typeof v === 'string') {
          const n = parseFloat(v.replace(/[^\d.,-]/g, '').replace(',', '.'))
          return Number.isFinite(n) ? Math.max(0, n) : d
        }
        return d
      }
      const price = parseNum(r.price, def.price)
      const oldPrice = parseNum(r.oldPrice, def.oldPrice)
      let info: string[] = []
      if (Array.isArray(r.info)) {
        info = r.info
          .filter((x): x is string => typeof x === 'string')
          .map(x => x.slice(0, MAX_CATALOG_INFO_LINE))
      }
      if (info.length === 0) info = [...def.info]
      let currency = '$'
      if (Object.prototype.hasOwnProperty.call(r, 'currency')) {
        if (typeof r.currency === 'string') {
          currency = r.currency.slice(0, MAX_CATALOG_CURRENCY_LEN)
        }
      }
      let image: string | undefined
      if (typeof r.image === 'string' && r.image.length > 0) image = r.image
      out.push({ id, name, brand, currency, price, oldPrice, info, image })
    }
    return out.length ? out : fallback()
  } catch {
    return fallback()
  }
}

export function serializeMassageCatalogForDraft(merged: MassageCatalogProductMerged[]): string {
  return JSON.stringify({ products: merged })
}

export function createMassageCatalogProductFromTemplate(lang: Lang, templateIndex: number, id: string): MassageCatalogProductMerged {
  const base = PRODUCTS[lang] ?? PRODUCTS.ru
  const row = base[templateIndex % base.length]
  return {
    id,
    name: row.name,
    brand: row.brand,
    currency: '$',
    price: row.price,
    oldPrice: row.oldPrice,
    info: [...row.info],
  }
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

/* ───── Specialists data model ───── */

export type MassageSpecialistMerged = {
  id: string
  name: string
  role: string
  exp: string
  image?: string | null
}

export const MASSAGE_SPECS_MAX = 12
const MAX_SPEC_NAME_LEN = 120
const MAX_SPEC_ROLE_LEN = 120
const MAX_SPEC_EXP_LEN = 300

export function mergeMassageSpecsFromDraft(lang: Lang, raw?: string): MassageSpecialistMerged[] {
  const base = SPECS[lang] ?? SPECS.ru
  const fallback = (): MassageSpecialistMerged[] =>
    base.map((row, i) => ({ id: `spec-${i}`, name: row.name, role: row.role, exp: row.exp }))
  if (!raw?.trim()) return fallback()
  try {
    const parsed = JSON.parse(raw) as { items?: unknown }
    if (!parsed || !Array.isArray(parsed.items)) return fallback()
    if (parsed.items.length === 0) return []
    const out: MassageSpecialistMerged[] = []
    for (let i = 0; i < Math.min(parsed.items.length, MASSAGE_SPECS_MAX); i++) {
      const r = parsed.items[i] as Record<string, unknown>
      const def = base[i % base.length]
      const id = typeof r.id === 'string' && r.id ? r.id : `spec-${i}`
      const name = typeof r.name === 'string' ? r.name.slice(0, MAX_SPEC_NAME_LEN) : def.name
      const role = typeof r.role === 'string' ? r.role.slice(0, MAX_SPEC_ROLE_LEN) : def.role
      const exp = typeof r.exp === 'string' ? r.exp.slice(0, MAX_SPEC_EXP_LEN) : def.exp
      let image: string | undefined
      if (typeof r.image === 'string' && r.image.length > 0) image = r.image
      out.push({ id, name, role, exp, image })
    }
    return out.length ? out : fallback()
  } catch {
    return fallback()
  }
}

export function serializeMassageSpecsForDraft(merged: MassageSpecialistMerged[]): string {
  return JSON.stringify({ items: merged })
}

export function createMassageSpecFromTemplate(lang: Lang, templateIndex: number, id: string): MassageSpecialistMerged {
  const base = SPECS[lang] ?? SPECS.ru
  const row = base[templateIndex % base.length]
  return { id, name: row.name, role: row.role, exp: row.exp }
}
