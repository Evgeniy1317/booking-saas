/** Дефолтный контент премиум-шаблона (premium-hair / premium-barber) по языку публичного сайта */

export type PremiumPublicLang = 'ru' | 'en' | 'ro'

export const PREMIUM_PUBLIC_DEFAULTS_BY_LANG: Record<
  PremiumPublicLang,
  {
    heroSubtitle: string
    heroTitle: string
    tagline: string
    aboutTitle: string
    aboutDesc: string
    aboutThird: string
    worksTitle: string
    worksSub: string
    servicesTitle: string
    servicesSub: string
    ctaTitle: string
    ctaSub: string
    mapLeft: string
    mapRight: string
    defaultHours: string
    defaultDayOff: string
  }
> = {
  ru: {
    /** Не дублирует название салона / FOOTER_DEFAULT_NAME — подставляется имя из регистрации выше по приоритету */
    heroSubtitle: 'Стиль, комфорт и забота',
    /** Один абзац: в шаблоне отображается caps через CSS */
    heroTitle: 'Стрижки, укладки и уход в одном месте',
    tagline: 'Премиум барбершоп и груминг для мужчин',
    aboutTitle: 'О салоне',
    aboutDesc:
      'Уютное пространство для стрижек, укладок и ухода. Качественный сервис и спокойная атмосфера — без суеты и очередей.',
    aboutThird: 'Услуги для всей семьи',
    worksTitle: 'Наши работы',
    worksSub: 'Вы заслуживаете выглядеть лучше всех',
    servicesTitle: 'Наши услуги',
    servicesSub: 'Стрижки, уход и процедуры в уютной атмосфере, работаем с качественными средствами',
    ctaTitle: 'Готовы выглядеть лучше?',
    ctaSub: 'Запишитесь на приём',
    mapLeft: 'Адрес твоего салона',
    mapRight: 'Город в котором твой салон находится',
    defaultHours: 'Пн–Сб 9:00–21:00',
    defaultDayOff: 'Вс — выходной',
  },
  en: {
    heroSubtitle: 'Your beauty salon',
    heroTitle: 'Haircuts, styling\nand care in one place',
    tagline: 'Premium barbershop & grooming for men',
    aboutTitle: 'About the salon',
    aboutDesc:
      'A cozy space for haircuts, styling and care. Quality service and a calm atmosphere — no rush, no queues.',
    aboutThird: 'Services for the whole family',
    worksTitle: 'Our works',
    worksSub: 'You deserve to look your best',
    servicesTitle: 'Our services',
    servicesSub: 'Haircuts, care and treatments in a cozy atmosphere, using high-quality products',
    ctaTitle: 'Ready to look better?',
    ctaSub: 'Book an appointment',
    mapLeft: 'Your salon address',
    mapRight: 'City where your salon is located',
    defaultHours: 'Mon–Sat 9:00–21:00',
    defaultDayOff: 'Sun — closed',
  },
  ro: {
    heroSubtitle: 'Salonul tău de frumusețe',
    heroTitle: 'Tunsori, coafuri\nși îngrijire într-un singur loc',
    tagline: 'Barbershop premium și grooming pentru bărbați',
    aboutTitle: 'Despre salon',
    aboutDesc:
      'Un spațiu confortabil pentru tunsori, coafuri și îngrijire. Servicii de calitate într-o atmosferă liniștită.',
    aboutThird: 'Servicii pentru toată familia',
    worksTitle: 'Lucrările noastre',
    worksSub: 'Meriți să arăți cel mai bine',
    servicesTitle: 'Serviciile noastre',
    servicesSub:
      'Tunsori, îngrijire și proceduri într-o atmosferă confortabilă, cu produse de calitate',
    ctaTitle: 'Ești gata să arăți mai bine?',
    ctaSub: 'Programează-te',
    mapLeft: 'Adresa salonului tău',
    mapRight: 'Orașul în care se află salonul',
    defaultHours: 'Lu–Sa 9:00–21:00',
    defaultDayOff: 'Du — zi liberă',
  },
}
