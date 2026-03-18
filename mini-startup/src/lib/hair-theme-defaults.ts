/** Начальные название и описание темы «Парикмахерская» — для превью выбора тем и для кнопки «Вернуть изначальный дизайн» */
export const HAIR_THEME_DEFAULT_NAME = 'Your Beauty Salon'
export const HAIR_THEME_DEFAULT_TAGLINE =
  'Это твой салон красоты — пространство, где сочетаются стиль, уют и забота о каждом госте\nЗдесь каждый может расслабиться, отвлечься от повседневной суеты и посвятить время себе,\nнаслаждаясь приятной атмосферой и качественным сервисом. Это место, где подчеркивают\nестественную красоту, помогают почувствовать уверенность и создают особенное настроение.'

/** Начальные заголовок и подзаголовок блока записи для шаблона «Парикмахерская» */
export const HAIR_THEME_DEFAULT_BOOKING_TITLE = 'Запись в 4 клика'
export const HAIR_THEME_DEFAULT_BOOKING_SUBTITLE =
  'Выберите услугу, специалиста и время — мы сразу подтверждаем запись'

type ThemeLang = 'ru' | 'en' | 'ro'
export const HAIR_DEFAULTS_BY_LANG: Record<ThemeLang, { tagline: string; bookingTitle: string; bookingSub: string }> = {
  ru: {
    tagline: HAIR_THEME_DEFAULT_TAGLINE,
    bookingTitle: HAIR_THEME_DEFAULT_BOOKING_TITLE,
    bookingSub: HAIR_THEME_DEFAULT_BOOKING_SUBTITLE,
  },
  en: {
    tagline: 'This is your beauty salon — a space where style, comfort and care for every guest come together.\nHere everyone can relax, escape from everyday routine and dedicate time to themselves,\nenjoying a pleasant atmosphere and quality service. A place that enhances\nnatural beauty, helps build confidence and creates a special mood.',
    bookingTitle: 'Book in 4 clicks',
    bookingSub: 'Choose a service, specialist and time — we confirm your booking instantly',
  },
  ro: {
    tagline: 'Acesta este salonul tău de frumusețe — un spațiu unde stilul, confortul și grija pentru fiecare oaspete se îmbină.\nAici fiecare se poate relaxa, evada din rutina zilnică și dedica timp pentru sine,\nbucurându-se de o atmosferă plăcută și servicii de calitate. Un loc care subliniază\nfrumusețea naturală, ajută să câștigi încredere și creează o dispoziție specială.',
    bookingTitle: 'Programare în 4 pași',
    bookingSub: 'Alegeți serviciul, specialistul și ora — confirmăm programarea imediat',
  },
}

/** Логотип по умолчанию при первом заходе в конструктор (шапка, футер, все шаблоны) — в public/default-salon-logo.png */
export const DEFAULT_LOGO_URL = '/default-salon-logo.png'

/** Карта по умолчанию во всех шаблонах и в редактировании: мир, английские названия континентов, без метки */
export const DEFAULT_WORLD_MAP_EMBED_URL =
  'https://www.google.com/maps?q=0,0&z=2&output=embed&hl=en'

/** Встроенный шаблон футера для всех шаблонов и первого захода в редактировании — заблокированные значения по умолчанию */
export const FOOTER_DEFAULT_NAME = 'Твой салон красоты'
export const FOOTER_DEFAULT_ADDRESS = 'Город, улица, дом'
export const FOOTER_DEFAULT_HOURS = 'Пн–Сб, 09:00–19:00'
export const FOOTER_DEFAULT_DAY_OFF = 'Пн — выходной'
export const FOOTER_DEFAULT_PHONE = '+XXX XXX XXX XXX'
export const FOOTER_DEFAULT_EMAIL = 'yoursalon@gmail.com'

type FooterLang = 'ru' | 'en' | 'ro'
export const FOOTER_DEFAULTS_BY_LANG: Record<FooterLang, { name: string; address: string; hours: string; dayOff: string; phone: string; email: string }> = {
  ru: { name: 'Твой салон красоты', address: 'Город, улица, дом', hours: 'Пн–Сб, 09:00–19:00', dayOff: 'Пн — выходной', phone: '+XXX XXX XXX XXX', email: 'yoursalon@gmail.com' },
  en: { name: 'Your Beauty Salon', address: 'City, street, building', hours: 'Mon–Sat, 09:00–19:00', dayOff: 'Mon — day off', phone: '+XXX XXX XXX XXX', email: 'yoursalon@gmail.com' },
  ro: { name: 'Salonul tău de frumusețe', address: 'Oraș, stradă, număr', hours: 'Lun–Sâm, 09:00–19:00', dayOff: 'Lun — zi liberă', phone: '+XXX XXX XXX XXX', email: 'yoursalon@gmail.com' },
}
