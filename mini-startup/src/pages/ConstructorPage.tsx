import { useState, useRef, useEffect, useCallback, Component, type ReactNode } from 'react'
import { flushSync } from 'react-dom'
import { useNavigate } from 'react-router-dom'

/** Показывает сообщение об ошибке вместо белого экрана при падении конструктора */
class ConstructorErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error: Error | null }
> {
  state = { hasError: false, error: null as Error | null }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('ConstructorErrorBoundary:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground">
          <h2 className="text-lg font-semibold text-destructive">{(SIDEBAR_UI[(typeof window !== 'undefined' ? localStorage.getItem('publicLang') as SidebarLang : null) ?? 'ru'] ?? SIDEBAR_UI.ru).errTitle}</h2>
          <p className="mt-2 text-sm text-muted-foreground max-w-md text-center">
            {this.state.error.message}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">{(SIDEBAR_UI[(typeof window !== 'undefined' ? localStorage.getItem('publicLang') as SidebarLang : null) ?? 'ru'] ?? SIDEBAR_UI.ru).errConsole}</p>
        </div>
      )
    }
    return this.props.children
  }
}
import { PanelRightOpen, Save, ArrowLeft, Maximize2, X, ChevronLeft, Pencil, RotateCcw, Plus, Video, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { flushDraftsToPublic } from '@/lib/constructor-save'
import { cn } from '@/lib/utils'
import iconHairCutting from '@/assets/images/constructor-images/free-icon-hair-cutting-4614189.png'
import iconBarbershop from '@/assets/images/constructor-images/free-icon-barbershop-856572.png'
import iconFacial from '@/assets/images/constructor-images/free-icon-facial-5732044.png'
import iconHairstyle from '@/assets/images/constructor-images/free-icon-hairstyle-6174671.png'
import iconNailsPolish from '@/assets/images/constructor-images/free-icon-nails-polish-8167686.png'
import iconPremium1 from '@/assets/images/constructor-images/free-icon-premium-4907289.png'
import iconPremium2 from '@/assets/images/constructor-images/free-icon-premium-2302704.png'
import patternBg from '@/assets/images/seamless-pattern-of-hairdressing-elements-illustration-of-doodle-icons-background-wallpaper-the-concept-of-a-hairdressing-salon-and-a-beauty-salon-vector.jpg'
import manicurePattern from '@/assets/images/constructor-images/manicure-tools-seamless-pattern-for-nail-studio-or-spa-salon-beauty-routine-background-vector.jpg'
import manicurePatternAlt from '@/assets/images/constructor-images/manicure-tools-doodle-seamless-pattern-manicure-scissors-gel-polish-woman-hands-white-background_646079-2612.avif'
import worksCarousel1 from '@/assets/images/constructor-images/pexels-maksgelatin-4663135.jpg'
import worksCarousel2 from '@/assets/images/constructor-images/pexels-maksgelatin-4663136.jpg'
import worksCarousel3 from '@/assets/images/constructor-images/pexels-thefullonmonet-28994396.jpg'
import aboutSalon1 from '@/assets/images/constructor-images/pexels-cottonbro-3993118.jpg'
import aboutSalon2 from '@/assets/images/constructor-images/pexels-cottonbro-3993293.jpg'
import aboutSalon3 from '@/assets/images/constructor-images/pexels-cottonbro-3993308.jpg'
import salonPhoto1 from '@/assets/images/premium-images/pexels-pavel-danilyuk-7518736.jpg'
import salonPhoto2 from '@/assets/images/premium-images/pexels-cottonbro-3993451.jpg'
import salonPhoto3 from '@/assets/images/premium-images/pexels-cottonbro-3992875.jpg'
import salonPhoto4 from '@/assets/images/premium-images/pexels-thgusstavo-2061820.jpg'
import salonPhoto5 from '@/assets/images/premium-images/pexels-cottonbro-3998407.jpg'
import {
  HAIR_THEME_DEFAULT_NAME,
  HAIR_THEME_DEFAULT_TAGLINE,
  HAIR_THEME_DEFAULT_BOOKING_TITLE,
  HAIR_THEME_DEFAULT_BOOKING_SUBTITLE,
  HAIR_DEFAULTS_BY_LANG,
  DEFAULT_LOGO_URL,
  FOOTER_DEFAULT_NAME,
  FOOTER_DEFAULT_ADDRESS,
  FOOTER_DEFAULTS_BY_LANG,
} from '@/lib/hair-theme-defaults'
import { compressImageForLogo } from '@/lib/compress-image'

/** Дефолтные фото для слотов 1–3 карусели «Галерея работ» — отображаются в сайдбаре и в превью, пока не заданы свои */
const WORKS_CAROUSEL_DEFAULTS = [worksCarousel1, worksCarousel2, worksCarousel3]
/** Дефолтные фото для блока «О салоне» (премиум-шаблон) — слоты 1–3 по умолчанию */
const ABOUT_SALON_DEFAULTS = [aboutSalon1, aboutSalon2, aboutSalon3]
/** Дефолтные фото для блока «Salon photos» (обычные шаблоны) — слоты 1–5 по умолчанию */
const SALON_PHOTOS_DEFAULTS = [salonPhoto1, salonPhoto2, salonPhoto3, salonPhoto4, salonPhoto5]

const BODY_BACKGROUND_OPTIONS = [
  { id: 'bg-1', type: 'image' as const, url: patternBg },
  { id: 'bg-2', type: 'image' as const, url: manicurePattern },
  { id: 'bg-3', type: 'image' as const, url: manicurePatternAlt },
  { id: 'bg-4', type: 'color' as const, color: '#0b0b0b' },
  { id: 'bg-5', type: 'color' as const, color: '#e8e4df' },
]

const HEADER_LAYOUT_HAIR_KEY = 'draft_headerLayoutHair_v6'
const HEADER_HAIR_PADDING_KEY = 'draft_headerHairPadding'
const HEADER_HAIR_CUSTOMIZED_KEY = 'draft_headerHairCustomized'
/** Ключи раскладки хедера по темам (drag-and-drop) — для сброса при «Вернуть изначальный дизайн» */
const HEADER_LAYOUT_KEY_BY_THEME: Record<string, string> = {
  hair: HEADER_LAYOUT_HAIR_KEY,
  barber: 'draft_headerLayoutBarber_v6',
  cosmetology: 'draft_headerLayoutCosmetology_v6',
  coloring: 'draft_headerLayoutColoring_v6',
  manicure: 'draft_headerLayoutManicure_v6',
}
/** Флаг по теме: пользователь вносил правки в эту тему — показываем «Мой сайт» и не сбрасываем при переключении */
const CONSTRUCTOR_HAS_USER_EDITS_PREFIX = 'constructorHasUserEdits_'

/** Нормализованный id темы (без premium-) для ключей storage */
function themeStorageId(themeId: string | null): string {
  if (!themeId) return 'hair'
  return themeId.startsWith('premium-') ? themeId.replace('premium-', '') : themeId
}

/** Есть ли сохранённые правки у данной темы (для отображения на карточке темы) */
function themeHasEdits(themeId: string): boolean {
  if (typeof window === 'undefined') return false
  const slug = window.localStorage.getItem('publicSlug') || 'salon'
  const tid = themeStorageId(themeId)
  if (window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid) === '1') return true
  if (window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + tid) === '1') return true
  const suffix = `_${slug}_${tid}`
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k && k.startsWith('draft_') && k !== 'draft_publicHeaderTheme' && k.endsWith(suffix)) return true
  }
  const layoutKey = HEADER_LAYOUT_KEY_BY_THEME[tid]
  if (layoutKey && window.localStorage.getItem(layoutKey)) return true
  return false
}

/** Удалить все черновики и флаг правок только для одной темы; при переданном slug — только черновики этого салона */
function clearThemeDrafts(themeId: string, slug?: string): void {
  if (typeof window === 'undefined') return
  const id = themeStorageId(themeId)
  const suffix = slug ? `_${slug}_${id}` : `_${id}`
  const keysToRemove: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k && (k.endsWith(suffix) || (!slug && k === CONSTRUCTOR_HAS_USER_EDITS_PREFIX + id))) keysToRemove.push(k)
  }
  if (slug) {
    keysToRemove.push(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + id)
    keysToRemove.push(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + id)
  }
  keysToRemove.forEach((k) => window.localStorage.removeItem(k))
  const layoutKey = HEADER_LAYOUT_KEY_BY_THEME[id]
  if (layoutKey) window.localStorage.removeItem(layoutKey)
  if (id === 'hair') {
    window.localStorage.removeItem(HEADER_LAYOUT_HAIR_KEY)
    window.localStorage.removeItem(HEADER_HAIR_PADDING_KEY)
    window.localStorage.removeItem(HEADER_HAIR_CUSTOMIZED_KEY)
  }
}

/** Базовые шаблоны (v1) — зафиксированы, структура не меняется. См. src/lib/template-registry.ts */
const ORDINARY_THEMES = [
  { id: 'hair', label: 'Hairdresser', icon: iconHairCutting },
  { id: 'barber', label: 'Barbershop', icon: iconBarbershop },
  { id: 'cosmetology', label: 'Cosmetology', icon: iconFacial },
  { id: 'coloring', label: 'Hair coloring', icon: iconHairstyle },
  { id: 'manicure', label: 'Manicure', icon: iconNailsPolish },
] as const

/** Премиум-шаблоны */
const PREMIUM_THEMES = [
  { id: 'premium-barber', label: 'Hairdresser / Barbershop', icon: iconPremium1 },
] as const

/** Блоки базовой структуры (зафиксированы для обычных шаблонов). Премиум-сайты с другой структурой — отдельно. */
const BLOCKS = [
  { id: 'header', label: 'Site header' },
  { id: 'gallery', label: 'Salon photos' },
  { id: 'booking', label: 'Client booking' },
  { id: 'works', label: 'Work gallery' },
  { id: 'map', label: 'Map & address' },
  { id: 'cta', label: 'Booking block' },
  { id: 'footer', label: 'Contact information' },
] as const

type SidebarLang = 'ru' | 'en' | 'ro'
const SIDEBAR_UI: Record<SidebarLang, Record<string, string>> = {
  ru: {
    header: 'Шапка сайта', gallery: 'Фотографии салона', booking: 'Запись клиентов',
    works: 'Галерея работ', worksP: 'Наши услуги', map: 'Карта и адрес', cta: 'Блок записи', footer: 'Контактная информация',
    heroBg: 'Фон для шапки', heroUploadHint: 'Можно загрузить видео или фото любого размера. Если загружено и то и другое — в шапке показывается видео.',
    videoLoaded: 'Видео загружено', videoShownInHeader: 'Отображается в шапке',
    changeVideo: 'Сменить видео', remove: 'Убрать', changePhoto: 'Сменить фото', photoBg: 'Фото фона', blackBg: 'Чёрный фон',
    addVideo: 'Добавить видео', addPhoto: 'Добавить фото', addVideoOverPhoto: 'Добавить видео поверх фото',
    headerColor: 'Цвет хедера', headerGlow: 'Свечение', navColor: 'Цвет ссылок навигации', titleColor: 'Цвет названия салона',
    heroSubColor: 'Цвет подзаголовка hero', heroTitleColor: 'Цвет заголовка hero',
    btn1Border: 'Цвет рамки кнопки 1', btn2Border: 'Цвет рамки кнопки 2',
    btn1Glow: 'Свечение кнопки 1', btn2Glow: 'Свечение кнопки 2',
    aboutSalon: 'О салоне', aboutSalonDesc: 'Заголовок, описание и третий текст блока редактируются в превью. Цвета настраиваются здесь.',
    aboutTitleColor: 'Цвет заголовка', aboutDescColor: 'Цвет описания', aboutThirdColor: 'Цвет третьего текста', aboutBtnBorder: 'Цвет рамки кнопки',
    aboutPhotos: 'Фото для карусели (до 10)', removeAll: 'Убрать все',
    ourWorks: 'Наши работы', ourWorksDesc: 'Заголовок и подзаголовок блока редактируются в превью. Фото тоже в превью.',
    worksTitleColor: 'Цвет заголовка', worksSubColor: 'Цвет подзаголовка',
    ourServicesP: 'Наши услуги', ourServicesDesc: 'Заголовок и подзаголовок блока редактируются в превью. Карточки тоже — название тематики, процедуры и фото прямо в превью.',
    hidePhotos: 'Скрыть фото на карточках', showPhotos: 'Показать фото на карточках',
    servicesTitleColor: 'Цвет заголовка «Наши услуги»', servicesSubColor: 'Цвет подзаголовка',
    servicesCardColor: 'Цвет названия тематики карточек', servicesProcColor: 'Цвет названия процедур', servicesDescColor: 'Цвет описания процедур',
    ctaBlock: 'Блок записи', ctaDesc: 'Блок с призывом к записи. Тексты редактируются прямо в превью. Цвета настраиваются здесь.',
    showBlockBtn: 'Показать блок', hideBlockBtn: 'Скрыть блок',
    sparkleColor: 'Цвет звезды', ctaTitleColor: 'Цвет заголовка 1', ctaSubColor: 'Цвет заголовка 2', ctaBtnBorder: 'Цвет рамки кнопки',
    mapAddr: 'Карта и адрес', mapAddrDesc: 'Адрес вводится прямо здесь — карта обновляется автоматически.',
    address: 'Адрес', searchAddr: 'Введите адрес салона', mapLabelColor: 'Цвет подписей над картой',
    footerTitle: 'Контактная информация', footerDesc: 'Контактные данные отображаются в футере сайта. Поля редактируются в превью.',
    footerTitleColor: 'Цвет названия', footerTextColor: 'Цвет текста контактов', footerDayOffColor: 'Цвет выходного',
    galleryPhotos: 'Слоты фотографий (1–10)', bookingDesc: 'Форма бронирования находится на отдельной странице.',
    bgStyle: 'Стиль фона страницы', restoreDesign: 'Вернуть изначальный дизайн', undoLast: 'Вернуть назад',
    designAlready: 'Изначальный дизайн уже используется', undoToDesign: 'Вернуть к изначальному дизайну шаблона',
    restoreHeader: 'Вернуть шапку к изначальному расположению', noUndo: 'Нет изменений для отмены', undoLastChange: 'Отменить последнее изменение',
    editThisTheme: 'Редактировать эту тему', fullSize: 'Полный размер', save: 'Сохранить', saving: 'Сохранение...', saved: 'Сохранено ✓',
    premiumTemplates: 'Премиум шаблоны', standardTemplates: 'Стандартные шаблоны',
    deleteMySite: 'Удалить изменения?', deleteMySiteDesc: 'Вы точно хотите удалить последние изменения в этом шаблоне?',
    back: 'Назад', eraseBtn: 'Стереть', mySite: 'Мой сайт', editDesc: 'Перейдите к этому блоку в превью и редактируйте его там.',
    editHeaderDesc: 'Редактируйте шапку в превью: темы, цвета и кнопки настраиваются здесь в сайдбаре.',
    byDefault: 'По умолчанию',
    logoShape: 'Форма логотипа', circle: 'Круг', square: 'Квадрат', rounded: 'Скруглённый',
    errTitle: 'Ошибка в конструкторе', errConsole: 'Откройте консоль (F12) для подробностей.',
    themeHair: 'Парикмахерская', themeBarber: 'Барбершоп', themeCosmetology: 'Косметология', themeColoring: 'Покраска волос', themeManicure: 'Маникюр',
    themePremiumBarber: 'Парикмахерская/Барбершоп',
    constructorTitle: 'Конструктор сайта', close: 'Закрыть', yes: 'Да',
    myLastEdits: 'Ваши последние правки для этой темы. Главный шаблон не изменён.', open: 'Открыть',
    chooseTheme: 'Выбор темы', allBlocks: 'Все блоки',
    premBtnColor: 'Цвет кнопок в шапке', premTitleColor: 'Цвет главного названия в шапке',
    premHeroSub: 'Цвет первого заголовка в hero', premHeroTitle: 'Цвет второго заголовка в hero',
    premBtn1Border: 'Цвет рамки первой кнопки', premBtn2Border: 'Цвет рамки второй кнопки',
    headerLogo: 'Логотип (шапка)', logoAlt: 'Логотип', changeLogo: 'Изменить логотип', uploadLogo: 'Загрузить логотип',
    showHeaderLogo: 'Показывать логотип в шапке', mainTitle: 'Главное название', description: 'Описание',
    buttons: 'Кнопки', firstBtn: 'Первая кнопка', secondBtn: 'Вторая кнопка',
    salonPhotos: 'Фото салона (до 10)', photosHint: 'По умолчанию — 3 примера. Крестик — удалить, клик по слоту — загрузить своё.',
    replacePhoto: 'Заменить фото', deleteBtn: 'Удалить', slot: 'Слот',
    galleryEditHint: 'Надпись блока можно редактировать в превью. Фото загружаются по клику на ячейки в превью.',
    blockLabel: 'Надпись блока', labelColor: 'Цвет надписи',
    bookingEditHint: 'Редактируйте заголовок и описание в превью. Цвета задаются здесь.',
    worksPhotos: 'Фото работ (до 10)', carouselHint: 'До 10 фото для карусели. Они отображаются в превью ниже.',
    footerLogo: 'Логотип (футер)', footerLogoAlt: 'Логотип футера', noLogo: 'Нет', changeLogoFooter: 'Изменить логотип',
    showFooterLogo: 'Показывать логотип в футере', socialLinks: 'Ссылки на соцсети',
    footerColorsPremium: 'Цвета футера (премиум)',
    footerColorsDesc: 'Цвет главного названия, текст контактов и строка «Выходной». Названия блоков (АДРЕС, ГРАФИК и т.д.) не меняются.',
    searching: 'Идёт поиск...',
    mapLabelDesc: 'Цвет для «Адрес твоего салона» и «Город в котором твой салон находится». Текст редактируется прямо в превью.',
    cGold: 'Золото', cBlue: 'Синий', cRed: 'Красный', cPink: 'Розовый', cCoral: 'Корал', cViolet: 'Виолет',
    cOrange: 'Оранжевый', cLime: 'Лайм', cEmerald: 'Изумруд', cWhite: 'Белый', cIndigo: 'Индиго', cGray: 'Серый',
    cBrown: 'Коричневый', cBlack: 'Чёрный', cCyan: 'Бирюза', cYellow: 'Жёлтый', cMagenta: 'Пурпур', cTeal: 'Бирюзовый',
    cSky: 'Небесный', cAmber: 'Янтарный', cFuchsia: 'Фуксия', cMint: 'Мятный',
    cRose: 'Роза', cMauve: 'Бордо', cCopper: 'Медь', cPurple: 'Пурпур', cBlush: 'Румянец',
    footerDefAddr: 'Город, улица, дом', footerDefHours: 'Пн–Сб, 09:00–19:00', footerDefDayOff: 'Пн — выходной',
  },
  en: {
    header: 'Site header', gallery: 'Salon photos', booking: 'Client booking',
    works: 'Work gallery', worksP: 'Our services', map: 'Map & address', cta: 'Booking block', footer: 'Contact information',
    heroBg: 'Header background', heroUploadHint: 'You can upload a video or photo of any size. If both are uploaded, the video is shown.',
    videoLoaded: 'Video uploaded', videoShownInHeader: 'Displayed in header',
    changeVideo: 'Change video', remove: 'Remove', changePhoto: 'Change photo', photoBg: 'Background photo', blackBg: 'Black background',
    addVideo: 'Add video', addPhoto: 'Add photo', addVideoOverPhoto: 'Add video over photo',
    headerColor: 'Header color', headerGlow: 'Glow', navColor: 'Navigation link color', titleColor: 'Salon name color',
    heroSubColor: 'Hero subtitle color', heroTitleColor: 'Hero title color',
    btn1Border: 'Button 1 border color', btn2Border: 'Button 2 border color',
    btn1Glow: 'Button 1 glow', btn2Glow: 'Button 2 glow',
    aboutSalon: 'About the salon', aboutSalonDesc: 'Title, description and third text are edited in preview. Colors are set here.',
    aboutTitleColor: 'Title color', aboutDescColor: 'Description color', aboutThirdColor: 'Third text color', aboutBtnBorder: 'Button border color',
    aboutPhotos: 'Carousel photos (up to 10)', removeAll: 'Remove all',
    ourWorks: 'Our works', ourWorksDesc: 'Title and subtitle are edited in preview. Photos too.',
    worksTitleColor: 'Title color', worksSubColor: 'Subtitle color',
    ourServicesP: 'Our services', ourServicesDesc: 'Title and subtitle are edited in preview. Cards too — theme name, procedures and photos directly in preview.',
    hidePhotos: 'Hide card photos', showPhotos: 'Show card photos',
    servicesTitleColor: 'Services title color', servicesSubColor: 'Subtitle color',
    servicesCardColor: 'Card theme name color', servicesProcColor: 'Procedure name color', servicesDescColor: 'Procedure description color',
    ctaBlock: 'Booking block', ctaDesc: 'Call-to-action block. Texts are edited in preview. Colors are set here.',
    showBlockBtn: 'Show block', hideBlockBtn: 'Hide block',
    sparkleColor: 'Star color', ctaTitleColor: 'Title 1 color', ctaSubColor: 'Title 2 color', ctaBtnBorder: 'Button border color',
    mapAddr: 'Map & address', mapAddrDesc: 'Enter the address here — the map updates automatically.',
    address: 'Address', searchAddr: 'Enter salon address', mapLabelColor: 'Map label color',
    footerTitle: 'Contact information', footerDesc: 'Contact details are displayed in the site footer. Fields are edited in preview.',
    footerTitleColor: 'Name color', footerTextColor: 'Contact text color', footerDayOffColor: 'Day off color',
    galleryPhotos: 'Photo slots (1–10)', bookingDesc: 'The booking form is on a separate page.',
    bgStyle: 'Page background style', restoreDesign: 'Restore original design', undoLast: 'Undo last',
    designAlready: 'Original design is already in use', undoToDesign: 'Restore template original design',
    restoreHeader: 'Restore header to original layout', noUndo: 'No changes to undo', undoLastChange: 'Undo last change',
    editThisTheme: 'Edit this theme', fullSize: 'Full size', save: 'Save', saving: 'Saving...', saved: 'Saved ✓',
    premiumTemplates: 'Premium templates', standardTemplates: 'Standard templates',
    deleteMySite: 'Delete changes?', deleteMySiteDesc: 'Are you sure you want to delete the latest changes in this template?',
    back: 'Back', eraseBtn: 'Erase', mySite: 'My site', editDesc: 'Go to this block in preview and edit it there.',
    editHeaderDesc: 'Edit the header in preview: themes, colors and buttons are configured here in the sidebar.',
    byDefault: 'Default',
    logoShape: 'Logo shape', circle: 'Circle', square: 'Square', rounded: 'Rounded',
    errTitle: 'Constructor error', errConsole: 'Open console (F12) for details.',
    themeHair: 'Hairdresser', themeBarber: 'Barbershop', themeCosmetology: 'Cosmetology', themeColoring: 'Hair coloring', themeManicure: 'Manicure',
    themePremiumBarber: 'Hairdresser / Barbershop',
    constructorTitle: 'Site Constructor', close: 'Close', yes: 'Yes',
    myLastEdits: 'Your recent edits for this theme. The original template is unchanged.', open: 'Open',
    chooseTheme: 'Choose theme', allBlocks: 'All blocks',
    premBtnColor: 'Header button color', premTitleColor: 'Header main title color',
    premHeroSub: 'Hero first heading color', premHeroTitle: 'Hero second heading color',
    premBtn1Border: 'First button border color', premBtn2Border: 'Second button border color',
    headerLogo: 'Logo (header)', logoAlt: 'Logo', changeLogo: 'Change logo', uploadLogo: 'Upload logo',
    showHeaderLogo: 'Show logo in header', mainTitle: 'Main title', description: 'Description',
    buttons: 'Buttons', firstBtn: 'First button', secondBtn: 'Second button',
    salonPhotos: 'Salon photos (up to 10)', photosHint: 'Default — 3 examples. X — delete, click slot — upload yours.',
    replacePhoto: 'Replace photo', deleteBtn: 'Delete', slot: 'Slot',
    galleryEditHint: 'Block label can be edited in preview. Photos are uploaded by clicking cells in preview.',
    blockLabel: 'Block label', labelColor: 'Label color',
    bookingEditHint: 'Edit the title and description in preview. Colors are set here.',
    worksPhotos: 'Work photos (up to 10)', carouselHint: 'Up to 10 photos for the carousel. They are shown in preview below.',
    footerLogo: 'Logo (footer)', footerLogoAlt: 'Footer logo', noLogo: 'None', changeLogoFooter: 'Change logo',
    showFooterLogo: 'Show logo in footer', socialLinks: 'Social media links',
    footerColorsPremium: 'Footer colors (premium)',
    footerColorsDesc: 'Main title color, contact text and "Day off" line. Block labels (ADDRESS, SCHEDULE, etc.) do not change.',
    searching: 'Searching...',
    mapLabelDesc: 'Color for "Your salon address" and "City where your salon is". Text is edited in preview.',
    cGold: 'Gold', cBlue: 'Blue', cRed: 'Red', cPink: 'Pink', cCoral: 'Coral', cViolet: 'Violet',
    cOrange: 'Orange', cLime: 'Lime', cEmerald: 'Emerald', cWhite: 'White', cIndigo: 'Indigo', cGray: 'Gray',
    cBrown: 'Brown', cBlack: 'Black', cCyan: 'Cyan', cYellow: 'Yellow', cMagenta: 'Magenta', cTeal: 'Teal',
    cSky: 'Sky', cAmber: 'Amber', cFuchsia: 'Fuchsia', cMint: 'Mint',
    cRose: 'Rose', cMauve: 'Mauve', cCopper: 'Copper', cPurple: 'Purple', cBlush: 'Blush',
    footerDefAddr: 'City, street, building', footerDefHours: 'Mon–Sat, 09:00–19:00', footerDefDayOff: 'Mon — day off',
  },
  ro: {
    header: 'Antet site', gallery: 'Fotografii salon', booking: 'Programare clienți',
    works: 'Galerie lucrări', worksP: 'Serviciile noastre', map: 'Hartă și adresă', cta: 'Bloc programare', footer: 'Informații de contact',
    heroBg: 'Fundal antet', heroUploadHint: 'Puteți încărca un video sau o fotografie de orice dimensiune. Dacă ambele sunt încărcate, se afișează videoul.',
    videoLoaded: 'Video încărcat', videoShownInHeader: 'Afișat în antet',
    changeVideo: 'Schimbă video', remove: 'Elimină', changePhoto: 'Schimbă foto', photoBg: 'Foto fundal', blackBg: 'Fundal negru',
    addVideo: 'Adaugă video', addPhoto: 'Adaugă foto', addVideoOverPhoto: 'Adaugă video peste foto',
    headerColor: 'Culoare antet', headerGlow: 'Strălucire', navColor: 'Culoare linkuri navigare', titleColor: 'Culoare nume salon',
    heroSubColor: 'Culoare subtitlu hero', heroTitleColor: 'Culoare titlu hero',
    btn1Border: 'Culoare margine buton 1', btn2Border: 'Culoare margine buton 2',
    btn1Glow: 'Strălucire buton 1', btn2Glow: 'Strălucire buton 2',
    aboutSalon: 'Despre salon', aboutSalonDesc: 'Titlul, descrierea și al treilea text se editează în previzualizare. Culorile se setează aici.',
    aboutTitleColor: 'Culoare titlu', aboutDescColor: 'Culoare descriere', aboutThirdColor: 'Culoare text suplimentar', aboutBtnBorder: 'Culoare margine buton',
    aboutPhotos: 'Fotografii carusel (max 10)', removeAll: 'Elimină toate',
    ourWorks: 'Lucrările noastre', ourWorksDesc: 'Titlul și subtitlul se editează în previzualizare. Fotografiile la fel.',
    worksTitleColor: 'Culoare titlu', worksSubColor: 'Culoare subtitlu',
    ourServicesP: 'Serviciile noastre', ourServicesDesc: 'Titlul și subtitlul se editează în previzualizare. Cardurile la fel — numele temei, proceduri și foto direct în previzualizare.',
    hidePhotos: 'Ascunde foto carduri', showPhotos: 'Arată foto carduri',
    servicesTitleColor: 'Culoare titlu servicii', servicesSubColor: 'Culoare subtitlu',
    servicesCardColor: 'Culoare nume temă carduri', servicesProcColor: 'Culoare nume proceduri', servicesDescColor: 'Culoare descriere proceduri',
    ctaBlock: 'Bloc programare', ctaDesc: 'Bloc cu invitație la programare. Textele se editează în previzualizare. Culorile se setează aici.',
    showBlockBtn: 'Arată bloc', hideBlockBtn: 'Ascunde bloc',
    sparkleColor: 'Culoare stea', ctaTitleColor: 'Culoare titlu 1', ctaSubColor: 'Culoare titlu 2', ctaBtnBorder: 'Culoare margine buton',
    mapAddr: 'Hartă și adresă', mapAddrDesc: 'Introduceți adresa aici — harta se actualizează automat.',
    address: 'Adresă', searchAddr: 'Introduceți adresa salonului', mapLabelColor: 'Culoare etichete hartă',
    footerTitle: 'Informații de contact', footerDesc: 'Datele de contact se afișează în subsolul site-ului. Câmpurile se editează în previzualizare.',
    footerTitleColor: 'Culoare nume', footerTextColor: 'Culoare text contact', footerDayOffColor: 'Culoare zi liberă',
    galleryPhotos: 'Sloturi foto (1–10)', bookingDesc: 'Formularul de programare se află pe o pagină separată.',
    bgStyle: 'Stil fundal pagină', restoreDesign: 'Restaurează designul original', undoLast: 'Anulează',
    designAlready: 'Designul original este deja folosit', undoToDesign: 'Restaurează designul original al șablonului',
    restoreHeader: 'Restaurează antetul la aspectul original', noUndo: 'Nicio modificare de anulat', undoLastChange: 'Anulează ultima modificare',
    editThisTheme: 'Editează această temă', fullSize: 'Dimensiune completă', save: 'Salvează', saving: 'Salvare...', saved: 'Salvat ✓',
    premiumTemplates: 'Șabloane premium', standardTemplates: 'Șabloane standard',
    deleteMySite: 'Ștergeți modificările?', deleteMySiteDesc: 'Sunteți sigur că doriți să ștergeți ultimele modificări din acest șablon?',
    back: 'Înapoi', eraseBtn: 'Șterge', mySite: 'Site-ul meu', editDesc: 'Navigați la acest bloc în previzualizare și editați-l acolo.',
    editHeaderDesc: 'Editați antetul în previzualizare: temele, culorile și butoanele se configurează aici în bara laterală.',
    byDefault: 'Implicit',
    logoShape: 'Forma logo', circle: 'Cerc', square: 'Pătrat', rounded: 'Rotunjit',
    errTitle: 'Eroare constructor', errConsole: 'Deschideți consola (F12) pentru detalii.',
    themeHair: 'Coafor', themeBarber: 'Frizerie', themeCosmetology: 'Cosmetologie', themeColoring: 'Vopsit păr', themeManicure: 'Manichiură',
    themePremiumBarber: 'Coafor / Frizerie',
    constructorTitle: 'Constructor site', close: 'Închide', yes: 'Da',
    myLastEdits: 'Ultimele modificări pentru această temă. Șablonul original nu este modificat.', open: 'Deschide',
    chooseTheme: 'Alege tema', allBlocks: 'Toate blocurile',
    premBtnColor: 'Culoare butoane antet', premTitleColor: 'Culoare titlu principal antet',
    premHeroSub: 'Culoare primul titlu hero', premHeroTitle: 'Culoare al doilea titlu hero',
    premBtn1Border: 'Culoare margine primul buton', premBtn2Border: 'Culoare margine al doilea buton',
    headerLogo: 'Logo (antet)', logoAlt: 'Logo', changeLogo: 'Schimbă logo', uploadLogo: 'Încarcă logo',
    showHeaderLogo: 'Arată logo în antet', mainTitle: 'Titlu principal', description: 'Descriere',
    buttons: 'Butoane', firstBtn: 'Primul buton', secondBtn: 'Al doilea buton',
    salonPhotos: 'Fotografii salon (max 10)', photosHint: 'Implicit — 3 exemple. X — șterge, clic pe slot — încarcă propria.',
    replacePhoto: 'Înlocuiește foto', deleteBtn: 'Șterge', slot: 'Slot',
    galleryEditHint: 'Eticheta blocului se editează în previzualizare. Fotografiile se încarcă prin clic pe celule.',
    blockLabel: 'Eticheta blocului', labelColor: 'Culoare etichetă',
    bookingEditHint: 'Editați titlul și descrierea în previzualizare. Culorile se setează aici.',
    worksPhotos: 'Fotografii lucrări (max 10)', carouselHint: 'Până la 10 fotografii pentru carusel. Se afișează în previzualizare.',
    footerLogo: 'Logo (subsol)', footerLogoAlt: 'Logo subsol', noLogo: 'Nu', changeLogoFooter: 'Schimbă logo',
    showFooterLogo: 'Arată logo în subsol', socialLinks: 'Linkuri rețele sociale',
    footerColorsPremium: 'Culori subsol (premium)',
    footerColorsDesc: 'Culoare titlu principal, text contacte și linia «Zi liberă». Etichetele blocurilor (ADRESĂ, PROGRAM etc.) nu se schimbă.',
    searching: 'Se caută...',
    mapLabelDesc: 'Culoare pentru «Adresa salonului tău» și «Orașul salonului tău». Textul se editează în previzualizare.',
    cGold: 'Auriu', cBlue: 'Albastru', cRed: 'Roșu', cPink: 'Roz', cCoral: 'Coral', cViolet: 'Violet',
    cOrange: 'Portocaliu', cLime: 'Lime', cEmerald: 'Smarald', cWhite: 'Alb', cIndigo: 'Indigo', cGray: 'Gri',
    cBrown: 'Maro', cBlack: 'Negru', cCyan: 'Cyan', cYellow: 'Galben', cMagenta: 'Magenta', cTeal: 'Teal',
    cSky: 'Celest', cAmber: 'Chihlimbar', cFuchsia: 'Fucsia', cMint: 'Mentă',
    cRose: 'Trandafir', cMauve: 'Bordo', cCopper: 'Cupru', cPurple: 'Purpuriu', cBlush: 'Rumenire',
    footerDefAddr: 'Oraș, stradă, număr', footerDefHours: 'Lun–Sâm, 09:00–19:00', footerDefDayOff: 'Lun — zi liberă',
  },
}

const COLOR_KEY_MAP: Record<string, string> = {
  gold: 'cGold', blue: 'cBlue', red: 'cRed', pink: 'cPink', coral: 'cCoral', violet: 'cViolet',
  orange: 'cOrange', lime: 'cLime', emerald: 'cEmerald', white: 'cWhite', indigo: 'cIndigo', gray: 'cGray',
  brown: 'cBrown', black: 'cBlack', cyan: 'cCyan', yellow: 'cYellow', magenta: 'cMagenta', teal: 'cTeal',
  sky: 'cSky', amber: 'cAmber', fuchsia: 'cFuchsia', mint: 'cMint',
  rose: 'cRose', mauve: 'cMauve', copper: 'cCopper', purple: 'cPurple', blush: 'cBlush',
}

const HEADER_TEXT_OPTIONS = [
  { id: 'gold', label: 'Gold', color: '#F6C453', glow: '0 0 14px rgba(246,196,83,0.55)' },
  { id: 'blue', label: 'Blue', color: '#3b82f6', glow: '0 0 14px rgba(59,130,246,0.55)' },
  { id: 'red', label: 'Red', color: '#ef4444', glow: '0 0 14px rgba(239,68,68,0.55)' },
  { id: 'pink', label: 'Pink', color: '#FF4D9D', glow: '0 0 16px rgba(255,77,157,0.6)' },
  { id: 'coral', label: 'Coral', color: '#FDA4AF', glow: '0 0 16px rgba(253,164,175,0.6)' },
  { id: 'violet', label: 'Violet', color: '#C7B7FF', glow: '0 0 16px rgba(199,183,255,0.6)' },
  { id: 'orange', label: 'Orange', color: '#f97316', glow: '0 0 14px rgba(249,115,22,0.55)' },
  { id: 'lime', label: 'Lime', color: '#84cc16', glow: '0 0 14px rgba(132,204,22,0.55)' },
  { id: 'emerald', label: 'Emerald', color: '#4ADE80', glow: '0 0 16px rgba(74,222,128,0.55)' },
  { id: 'white', label: 'White', color: '#FFFFFF', glow: '0 0 14px rgba(255,255,255,0.55)' },
  { id: 'indigo', label: 'Indigo', color: '#6366f1', glow: '0 0 14px rgba(99,102,241,0.55)' },
  { id: 'gray', label: 'Gray', color: '#6b7280', glow: '0 0 14px rgba(107,114,128,0.55)' },
  { id: 'brown', label: 'Brown', color: '#92400e', glow: '0 0 14px rgba(146,64,14,0.55)' },
  { id: 'black', label: 'Black', color: '#0b0b0b', glow: '0 0 14px rgba(0,0,0,0.55)' },
] as const

/** Палитра «Цвет хедера» для премиум-шаблона: те же цвета + яркие, с эффектом свечения */
const PREMIUM_HEADER_COLOR_OPTIONS = [
  ...HEADER_TEXT_OPTIONS,
  { id: 'cyan', label: 'Cyan', color: '#22d3ee', glow: '0 0 14px rgba(34,211,238,0.55)' },
  { id: 'yellow', label: 'Yellow', color: '#eab308', glow: '0 0 14px rgba(234,179,8,0.55)' },
  { id: 'magenta', label: 'Magenta', color: '#d946ef', glow: '0 0 14px rgba(217,70,239,0.55)' },
  { id: 'teal', label: 'Teal', color: '#2dd4bf', glow: '0 0 14px rgba(45,212,191,0.55)' },
  { id: 'sky', label: 'Sky', color: '#0ea5e9', glow: '0 0 14px rgba(14,165,233,0.55)' },
  { id: 'amber', label: 'Amber', color: '#f59e0b', glow: '0 0 14px rgba(245,158,11,0.55)' },
  { id: 'fuchsia', label: 'Fuchsia', color: '#c026d3', glow: '0 0 14px rgba(192,38,211,0.55)' },
  { id: 'mint', label: 'Mint', color: '#99f6e4', glow: '0 0 14px rgba(153,246,228,0.55)' },
] as const

/** Цвета кнопок — тот же порядок и те же id, что и у текста */
const HEADER_BUTTON_OPTIONS = [
  { id: 'gold', label: 'Gold', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
  { id: 'blue', label: 'Blue', background: '#3b82f6', text: '#ffffff', glow: '0 0 20px rgba(59,130,246,0.6)' },
  { id: 'red', label: 'Red', background: '#ef4444', text: '#ffffff', glow: '0 0 18px rgba(239,68,68,0.6)' },
  { id: 'pink', label: 'Pink', background: '#FF4D9D', text: '#0b0b0b', glow: '0 0 20px rgba(255,77,157,0.55)' },
  { id: 'coral', label: 'Coral', background: '#FB7185', text: '#0b0b0b', glow: '0 0 18px rgba(251,113,133,0.6)' },
  { id: 'violet', label: 'Violet', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 18px rgba(167,139,250,0.6)' },
  { id: 'orange', label: 'Orange', background: '#f97316', text: '#0b0b0b', glow: '0 0 18px rgba(249,115,22,0.6)' },
  { id: 'lime', label: 'Lime', background: '#84cc16', text: '#0b0b0b', glow: '0 0 18px rgba(132,204,22,0.55)' },
  { id: 'emerald', label: 'Emerald', background: '#4ADE80', text: '#0b0b0b', glow: '0 0 18px rgba(74,222,128,0.55)' },
  { id: 'white', label: 'White', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
  { id: 'indigo', label: 'Indigo', background: '#6366f1', text: '#ffffff', glow: '0 0 18px rgba(99,102,241,0.6)' },
  { id: 'gray', label: 'Gray', background: '#6b7280', text: '#ffffff', glow: '0 0 18px rgba(107,114,128,0.6)' },
  { id: 'brown', label: 'Brown', background: '#92400e', text: '#ffffff', glow: '0 0 18px rgba(146,64,14,0.6)' },
  { id: 'black', label: 'Black', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
] as const

/** Цвета кнопок для темы «Косметология» — палитра в тонах розового/матового */
const HEADER_BUTTON_OPTIONS_COSMETOLOGY = [
  { id: 'rose', label: 'Rose', background: '#E8B4B8', text: '#1a0f12', glow: '0 0 20px rgba(232,180,184,0.55)' },
  { id: 'mauve', label: 'Mauve', background: '#B76E79', text: '#ffffff', glow: '0 0 20px rgba(183,110,121,0.55)' },
  { id: 'pink', label: 'Pink', background: '#FF4D9D', text: '#0b0b0b', glow: '0 0 20px rgba(255,77,157,0.55)' },
  { id: 'gold', label: 'Gold', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
  { id: 'blue', label: 'Blue', background: '#3b82f6', text: '#ffffff', glow: '0 0 20px rgba(59,130,246,0.6)' },
  { id: 'white', label: 'White', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
  { id: 'violet', label: 'Violet', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 18px rgba(167,139,250,0.6)' },
  { id: 'black', label: 'Black', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
] as const

/** Цвета кнопок для темы «Покраска волос» — фиолетовый/фуксия/медный */
const HEADER_BUTTON_OPTIONS_COLORING = [
  { id: 'violet', label: 'Violet', background: '#A78BFA', text: '#0b0b0b', glow: '0 0 20px rgba(167,139,250,0.6)' },
  { id: 'fuchsia', label: 'Fuchsia', background: '#D946EF', text: '#ffffff', glow: '0 0 20px rgba(217,70,239,0.55)' },
  { id: 'purple', label: 'Purple', background: '#7C3AED', text: '#ffffff', glow: '0 0 20px rgba(124,58,237,0.55)' },
  { id: 'copper', label: 'Copper', background: '#B87333', text: '#1a0f0a', glow: '0 0 20px rgba(184,115,51,0.55)' },
  { id: 'pink', label: 'Pink', background: '#EC4899', text: '#ffffff', glow: '0 0 20px rgba(236,72,153,0.55)' },
  { id: 'gold', label: 'Gold', background: '#E3B04B', text: '#111111', glow: '0 0 18px rgba(227,176,75,0.6)' },
  { id: 'white', label: 'White', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
  { id: 'black', label: 'Black', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
] as const

/** Цвета кнопок для темы «Маникюр» — нежно-розовый, румянец, корал, розовое золото */
const HEADER_BUTTON_OPTIONS_MANICURE = [
  { id: 'blush', label: 'Blush', background: '#F8B4C4', text: '#2d1519', glow: '0 0 20px rgba(248,180,196,0.55)' },
  { id: 'rose', label: 'Rose', background: '#E8A0B0', text: '#1a0f12', glow: '0 0 20px rgba(232,160,176,0.55)' },
  { id: 'coral', label: 'Coral', background: '#F4A6B4', text: '#1a0f12', glow: '0 0 20px rgba(244,166,180,0.55)' },
  { id: 'pink', label: 'Pink', background: '#EC4899', text: '#ffffff', glow: '0 0 20px rgba(236,72,153,0.55)' },
  { id: 'gold', label: 'Gold', background: '#E8C9A0', text: '#1a1510', glow: '0 0 20px rgba(232,201,160,0.55)' },
  { id: 'white', label: 'White', background: '#FFFFFF', text: '#0b0b0b', glow: '0 0 16px rgba(255,255,255,0.6)' },
  { id: 'violet', label: 'Violet', background: '#C4B5FD', text: '#1a1525', glow: '0 0 20px rgba(196,181,253,0.55)' },
  { id: 'black', label: 'Black', background: '#0b0b0b', text: '#ffffff', glow: '0 0 18px rgba(0,0,0,0.6)' },
] as const

export default function ConstructorPage() {
  const navigate = useNavigate()
  const sLang: SidebarLang = (typeof window !== 'undefined' ? localStorage.getItem('publicLang') as SidebarLang : null) ?? 'ru'
  const s = SIDEBAR_UI[sLang] ?? SIDEBAR_UI.ru
  const [sideOpen, setSideOpen] = useState(true)
  const [saved, setSaved] = useState(false)
  const [panelStage, setPanelStage] = useState<'themes' | 'edit'>('themes')
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null)
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [visibleSectionId, setVisibleSectionId] = useState<string | null>(null)
  const [, setRestoreTick] = useState(0)
  const [, setStoragePoll] = useState(0)
  const [undoStack, setUndoStack] = useState<{ key: string; value: string | null; themeId?: string }[]>([])
  const MAX_UNDO = 50
  /** true пока после сброса к исходному дизайну не было ни одного нового изменения */
  const resetJustApplied = useRef(false)
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)
  const [addressQuery, setAddressQuery] = useState(() => {
    if (typeof window === 'undefined') return ''
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    const theme =
      window.localStorage.getItem('draft_publicHeaderTheme') ??
      window.localStorage.getItem('publicHeaderTheme') ??
      'hair'
    const themeForKey = theme
    return (
      window.localStorage.getItem(`draft_publicAddress_${slug}_${themeForKey}`) ??
      window.localStorage.getItem(`draft_publicAddress_${themeForKey}`) ??
      window.localStorage.getItem('draft_publicAddress') ??
      window.localStorage.getItem('publicAddress') ??
      ''
    )
  })
  const [addressResults, setAddressResults] = useState<any[]>([])
  const [isAddressOpen, setIsAddressOpen] = useState(false)
  const [isAddressLoading, setIsAddressLoading] = useState(false)
  const [isAddressFocused, setIsAddressFocused] = useState(false)
  const addressRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (panelStage !== 'edit') return
    const id = setInterval(() => {
      // Если после сброса были inline-правки в превью — снимаем флаг, кнопка снова становится активной
      if (resetJustApplied.current && typeof window !== 'undefined') {
        const slug = window.localStorage.getItem('publicSlug') || 'salon'
        const themeRaw = window.localStorage.getItem('draft_publicHeaderTheme') ?? window.localStorage.getItem('publicHeaderTheme') ?? 'hair'
        const tid = themeStorageId(themeRaw)
        const hasEdits =
          window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid) === '1' ||
          window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + tid) === '1' ||
          window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + themeRaw) === '1'
        if (hasEdits) resetJustApplied.current = false
      }
      setStoragePoll((n) => n + 1)
    }, 800)
    return () => clearInterval(id)
  }, [panelStage])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'publicPageSectionInView' && typeof e.data?.sectionId === 'string') {
        setVisibleSectionId(e.data.sectionId)
      }
      if (e.data?.type === 'constructorEditsChanged') {
        setStoragePoll((n) => n + 1)
      }
      if (e.data?.type === 'constructorUndoPush' && typeof e.data?.key === 'string') {
        setUndoStack((prev) => {
          const themeId = typeof e.data?.themeId === 'string' ? e.data.themeId : undefined
          const next = [...prev, { key: e.data.key, value: e.data.value ?? null, themeId }]
          return next.slice(-MAX_UNDO)
        })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  // При смене темы подставлять в поле адреса черновик этой темы (или пусто — нейтральный placeholder)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const themeId =
      selectedThemeId ??
      window.localStorage.getItem('draft_publicHeaderTheme') ??
      window.localStorage.getItem('publicHeaderTheme') ??
      'hair'
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    const addr = window.localStorage.getItem(`draft_publicAddress_${slug}_${themeId}`) ?? ''
    setAddressQuery(addr)
  }, [selectedThemeId, panelStage])

  const getDraftOrPublic = useCallback(
    (key: string, fallback = '') => {
      if (typeof window === 'undefined') return fallback
      if (key === 'publicHeaderTheme')
        return (
          window.localStorage.getItem('draft_publicHeaderTheme') ??
          window.localStorage.getItem('publicHeaderTheme') ??
          fallback
        )
      const slug = window.localStorage.getItem('publicSlug') || 'salon'
      const themeId =
        selectedThemeId ??
        window.localStorage.getItem('draft_publicHeaderTheme') ??
        window.localStorage.getItem('publicHeaderTheme') ??
        'hair'
      const tid = themeStorageId(themeId)
      const addressMapKeys = ['publicFooterAddress', 'publicAddress', 'publicMapEmbedUrl']
      const themeForKey = addressMapKeys.includes(key) ? themeId : tid
      return (
        window.localStorage.getItem(`draft_${key}_${slug}_${themeForKey}`) ?? fallback
      )
    },
    [selectedThemeId]
  )

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node
      if (addressRef.current && !addressRef.current.contains(target)) {
        setIsAddressOpen(false)
        setIsAddressFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (!isAddressFocused) return
    const query = addressQuery.trim()
    if (!query || query.length < 3) {
      setAddressResults([])
      setIsAddressLoading(false)
      return
    }

    setIsAddressLoading(true)
    const handle = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=${sLang}&q=${encodeURIComponent(
            query
          )}`
        )
        const data = await response.json()
        const items = Array.isArray(data) ? data : []
        setAddressResults(items)
        setIsAddressOpen(true)
      } catch (error) {
        console.error('Address search failed:', error)
        setAddressResults([])
      } finally {
        setIsAddressLoading(false)
      }
    }, 350)

    return () => clearTimeout(handle)
  }, [addressQuery, isAddressFocused])

  const currentHeaderTheme = getDraftOrPublic('publicHeaderTheme') || 'hair'

  useEffect(() => {
    if (selectedBlockId == null || panelStage !== 'edit') return
    const isPremium = currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber'
    const sectionId = selectedBlockId
    try {
      iframeRef.current?.contentWindow?.postMessage?.({ type: 'scrollToSection', sectionId }, '*')
    } catch {
      // ignore
    }
  }, [selectedBlockId, panelStage, currentHeaderTheme])

  /** Ключ хранилища цветов хедера: для косметологии, покраски и маникюра — отдельные, чтобы цвета применялись к хедеру темы */
  const headerColorsStorageKey =
    currentHeaderTheme === 'cosmetology'
      ? 'publicHeaderCosmetologyColors'
      : currentHeaderTheme === 'coloring'
        ? 'publicHeaderColoringColors'
        : currentHeaderTheme === 'manicure'
          ? 'publicHeaderManicureColors'
          : 'publicHeaderBarberColors'
  const headerButtonOptionsList =
    currentHeaderTheme === 'cosmetology'
      ? HEADER_BUTTON_OPTIONS_COSMETOLOGY
      : currentHeaderTheme === 'coloring'
        ? HEADER_BUTTON_OPTIONS_COLORING
        : currentHeaderTheme === 'manicure'
          ? HEADER_BUTTON_OPTIONS_MANICURE
          : HEADER_BUTTON_OPTIONS
  /** Есть ли правки у выбранной темы: флаг или реальные черновики — блок «Мой сайт» показываем только для этой темы */
  const currentThemeHasEdits =
    typeof window !== 'undefined' &&
    !!selectedThemeId &&
    (() => {
      const slug = window.localStorage.getItem('publicSlug') || 'salon'
      const tid = themeStorageId(selectedThemeId)
      if (window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid) === '1') return true
      if (window.localStorage.getItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + tid) === '1') return true
      const suffix = `_${slug}_${tid}`
      for (let i = 0; i < window.localStorage.length; i++) {
        const k = window.localStorage.key(i)
        if (k && k.startsWith('draft_') && k !== 'draft_publicHeaderTheme' && k.endsWith(suffix)) return true
      }
      return false
    })()
  const hasHeaderDesignOverride =
    typeof window !== 'undefined' &&
    (!!localStorage.getItem(HEADER_LAYOUT_HAIR_KEY) ||
      !!localStorage.getItem(HEADER_HAIR_PADDING_KEY))

  /** Сбрасывает правки только для одной темы (шаблон темы не меняется). */
  const hairDef = HAIR_DEFAULTS_BY_LANG[sLang] ?? HAIR_DEFAULTS_BY_LANG.ru

  const loadThemeDefaults = useCallback((themeId: string) => {
    if (typeof window === 'undefined') return
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    const valueToStore = themeStorageId(themeId)
    clearThemeDrafts(valueToStore, slug)
    if (valueToStore === 'hair') {
      const footerDef = FOOTER_DEFAULTS_BY_LANG[sLang] ?? FOOTER_DEFAULTS_BY_LANG.ru
      window.localStorage.setItem(`draft_publicName_${slug}_hair`, footerDef.name)
      window.localStorage.setItem(`draft_publicTagline_${slug}_hair`, hairDef.tagline)
      window.localStorage.setItem(`draft_publicBookingTitle_${slug}_hair`, hairDef.bookingTitle)
      window.localStorage.setItem(`draft_publicBookingSubtitle_${slug}_hair`, hairDef.bookingSub)
    }
  }, [hairDef, sLang])

  const handleRestoreInitialHeader = useCallback(() => {
    if (typeof window === 'undefined') return
    resetJustApplied.current = true
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    setUndoStack([])
    clearThemeDrafts('hair', slug)
    const footerDef = FOOTER_DEFAULTS_BY_LANG[sLang] ?? FOOTER_DEFAULTS_BY_LANG.ru
    localStorage.setItem(`draft_publicName_${slug}_hair`, footerDef.name)
    localStorage.setItem(`draft_publicTagline_${slug}_hair`, hairDef.tagline)
    localStorage.setItem(`draft_publicBookingTitle_${slug}_hair`, hairDef.bookingTitle)
    localStorage.setItem(`draft_publicBookingSubtitle_${slug}_hair`, hairDef.bookingSub)
    setRestoreTick((t) => t + 1)
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // ignore
    }
  }, [hairDef])

  const notifyIframeDraft = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'constructorDraftChange' }, '*')
    } catch {
      // ignore
    }
  }, [])

  const setDraft = useCallback(
    (key: string, value: string) => {
      if (typeof window === 'undefined') return
      resetJustApplied.current = false
      const slug = window.localStorage.getItem('publicSlug') || 'salon'
      const themeId =
        selectedThemeId ??
        window.localStorage.getItem('draft_publicHeaderTheme') ??
        'hair'
      const tid = themeStorageId(themeId)
      // Адрес и карта для премиум-шаблонов — по полному id темы, чтобы не переходить на другие шаблоны
      const addressMapKeys = ['publicFooterAddress', 'publicAddress', 'publicMapEmbedUrl']
      const themeForKey = addressMapKeys.includes(key) ? themeId : tid
      const storageKey =
        key === 'publicHeaderTheme' ? `draft_${key}` : `draft_${key}_${slug}_${themeForKey}`
      const prev =
        window.localStorage.getItem(storageKey) ??
        (key === 'publicHeaderTheme' ? null : window.localStorage.getItem(key))
      setUndoStack((prevStack) => {
        const next = [...prevStack, { key, value: prev, themeId: themeForKey }]
        return next.slice(-MAX_UNDO)
      })
      window.localStorage.setItem(storageKey, value)
      if (key !== 'publicHeaderTheme')
        window.localStorage.setItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid, '1')
      setStoragePoll((n) => n + 1)
      notifyIframeDraft()
    },
    [notifyIframeDraft, selectedThemeId]
  )

  const handleUndo = useCallback(() => {
    if (typeof window === 'undefined') return
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    setUndoStack((prev) => {
      if (prev.length === 0) return prev
      const last = prev[prev.length - 1]
      const storageKey =
        last.key === 'publicHeaderTheme' || !last.themeId
          ? `draft_${last.key}`
          : `draft_${last.key}_${slug}_${last.themeId}`
      if (last.value === null || last.value === undefined) {
        window.localStorage.removeItem(storageKey)
      } else {
        window.localStorage.setItem(storageKey, last.value)
      }
      setStoragePoll((n) => n + 1)
      notifyIframeDraft()
      return prev.slice(0, -1)
    })
  }, [notifyIframeDraft])

  const handleSave = () => {
    flushDraftsToPublic()
    setUndoStack([])
    setSaved(true)
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // cross-origin or not loaded
    }
    setTimeout(() => setSaved(false), 2000)
  }

  const slug = typeof window !== 'undefined' ? (localStorage.getItem('publicSlug') || 'salon') : 'salon'
  const previewUrl = panelStage === 'edit' ? `/b/${slug}?preview=1&edit=1` : `/b/${slug}?preview=1`
  /** В полном размере — без режима редактирования (без рамок и полосок), с последними изменениями из localStorage (full=1 чтобы подставлялись черновики, не дефолт) */
  const openFullSize = () => {
    const fullViewUrl = `/b/${slug}?preview=1&full=1&_=${Date.now()}`
    window.open(fullViewUrl, '_blank', 'noopener,noreferrer')
  }

  /** Только переключить тему в превью, не сбрасывая правки (чтобы «Мой сайт» / последние правки сохранялись). Сохраняем полный id (premium-hair и т.д.), чтобы PublicPage показывал премиум-шаблон. */
  const selectTheme = (themeId: string) => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('draft_publicHeaderTheme', themeId)
    setSelectedThemeId(themeId)
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // ignore
    }
  }

  const goToEdit = () => {
    if (selectedThemeId && typeof window !== 'undefined') {
      window.localStorage.setItem('draft_publicHeaderTheme', selectedThemeId)
    }
    setSelectedBlockId(null)
    setPanelStage('edit')
  }

  const goBackToThemes = () => {
    setPanelStage('themes')
  }

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // При открытии конструктора подставляем текущую тему из настроек
  useEffect(() => {
    if (typeof window === 'undefined') return
    const theme =
      window.localStorage.getItem('draft_publicHeaderTheme') ||
      window.localStorage.getItem('publicHeaderTheme') ||
      'hair'
    setSelectedThemeId(theme)
  }, [])


  const handleClearMySiteClick = useCallback(() => {
    setShowClearConfirmModal(true)
  }, [])

  const handleClearMySiteConfirm = useCallback(() => {
    if (typeof window === 'undefined') return
    setShowClearConfirmModal(false)
    const themeId = selectedThemeId || currentHeaderTheme || 'hair'
    const slug = window.localStorage.getItem('publicSlug') || 'salon'
    const tid = themeStorageId(themeId)
    clearThemeDrafts(tid, slug)
    window.localStorage.removeItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + slug + '_' + tid)
    window.localStorage.removeItem(CONSTRUCTOR_HAS_USER_EDITS_PREFIX + tid)
    flushSync(() => {
      setAddressQuery('')
      setUndoStack([])
      setStoragePoll((n) => n + 1)
    })
    notifyIframeDraft()
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // ignore
    }
  }, [selectedThemeId, currentHeaderTheme, notifyIframeDraft])

  const handleClearMySite = handleClearMySiteClick

  /** На экране «Все блоки» — вернуть изначальный дизайн только этой темы */
  const handleRestoreInitialDesign = useCallback(() => {
    if (typeof window === 'undefined') return
    resetJustApplied.current = true
    if (currentHeaderTheme === 'hair') {
      handleRestoreInitialHeader()
      setAddressQuery('')
      notifyIframeDraft()
      return
    }
    loadThemeDefaults(currentHeaderTheme)
    setAddressQuery('')
    setUndoStack([])
    setStoragePoll((n) => n + 1)
    notifyIframeDraft()
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      // ignore
    }
  }, [currentHeaderTheme, loadThemeDefaults, handleRestoreInitialHeader, notifyIframeDraft])

  return (
    <ConstructorErrorBoundary>
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* Модальное окно подтверждения «Стереть» */}
      {showClearConfirmModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={() => setShowClearConfirmModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden />
          <Card
            className="relative z-[101] w-full max-w-md backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowClearConfirmModal(false)}
                className="absolute top-4 right-4 h-8 w-8"
                aria-label={s.close}
              >
                <X className="w-4 h-4" />
              </Button>
              <h3 className="text-lg font-bold pr-10 mb-3 text-foreground">
                {s.deleteMySite}
              </h3>
              <p className="text-sm text-muted-foreground mb-6">
                {s.deleteMySiteDesc}
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowClearConfirmModal(false)}
                >
                  {s.back}
                </Button>
                <Button
                  onClick={handleClearMySiteConfirm}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {s.yes}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Шапка конструктора */}
      <header className="border-b border-border/50 bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/60 shrink-0">
        <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard/settings')}
              className="shrink-0"
              aria-label={s.back}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold truncate">{s.constructorTitle}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-2" onClick={openFullSize}>
              <Maximize2 className="h-4 w-4" />
              {s.fullSize}
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Save className="h-4 w-4" />
              {saved ? s.saved : s.save}
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn('shrink-0', sideOpen && 'bg-primary/10 border-primary/30')}
              onClick={() => setSideOpen((o) => !o)}
              aria-label={sideOpen ? s.close : s.allBlocks}
            >
              <PanelRightOpen className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Основная область: превью на всю ширину, панель поверх справа */}
      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden relative">
        {/* Превью на всю область */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col p-4 overflow-hidden">
          <div className="flex-1 min-w-0 min-h-0 rounded-xl border border-border/50 bg-card/20 overflow-hidden shadow-inner relative">
            <iframe
              ref={iframeRef}
              title={s.fullSize}
              src={previewUrl}
              className="absolute inset-0 w-full h-full border-0 rounded-xl"
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        </div>

        {/* Боковая панель справа — поверх превью */}
        <div
          className={cn(
            'absolute top-4 right-4 bottom-4 z-30 w-[280px] border border-border/50 rounded-xl bg-card/95 backdrop-blur shadow-xl flex flex-col overflow-hidden transition-[transform] duration-300 ease-out',
            sideOpen ? 'translate-x-0' : 'translate-x-[calc(100%+1rem)]'
          )}
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border/40 shrink-0">
            <span className="font-semibold text-foreground text-sm truncate">
              {panelStage === 'themes' ? s.chooseTheme : s.allBlocks}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => setSideOpen(false)}
              aria-label={s.close}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 flex flex-col gap-4 scrollbar-hide min-h-0">
            {panelStage === 'themes' && (
              <>
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 w-full text-center">
                    {s.standardTemplates}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 justify-items-center w-full max-w-[200px] mx-auto">
                    {ORDINARY_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => selectTheme(theme.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 transition',
                          selectedThemeId === theme.id
                            ? 'opacity-100'
                            : 'opacity-80 hover:opacity-100'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition overflow-hidden',
                            selectedThemeId === theme.id
                              ? 'border-primary bg-primary/20'
                              : 'border-border/50 bg-card/40 hover:border-primary/50'
                          )}
                        >
                          <img src={theme.icon} alt="" className="h-6 w-6 object-contain" />
                        </span>
                        <span className="text-center text-sm font-bold text-foreground leading-tight">
                          {s['theme' + theme.id.charAt(0).toUpperCase() + theme.id.slice(1)] ?? theme.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="h-px w-full bg-border/50 shrink-0" />
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 w-full text-center">
                    {s.premiumTemplates}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 w-full">
                    {PREMIUM_THEMES.map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => selectTheme(theme.id)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 transition',
                          selectedThemeId === theme.id
                            ? 'opacity-100'
                            : 'opacity-80 hover:opacity-100'
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition overflow-hidden',
                            selectedThemeId === theme.id
                              ? 'border-primary bg-primary/20'
                              : 'border-border/50 bg-card/40 hover:border-primary/50'
                          )}
                        >
                          <img src={theme.icon} alt="" className="h-6 w-6 object-contain" />
                        </span>
                        <span className="text-center text-sm font-bold text-foreground leading-tight">
                          {s.themePremiumBarber}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-auto pt-2 border-t border-border/40">
                  <Button
                    className="w-full gap-2"
                    disabled={!selectedThemeId}
                    onClick={goToEdit}
                  >
                    <Pencil className="h-4 w-4" />
                    {s.editThisTheme}
                  </Button>
                </div>
                {currentThemeHasEdits && (
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {s.mySite}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.myLastEdits}
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={goToEdit}>
                        <Pencil className="h-3.5 w-3.5" />
                        {s.open}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 border-red-400/50 text-red-600 hover:bg-red-500/10 hover:text-red-500"
                        onClick={handleClearMySite}
                      >
                        {s.eraseBtn}
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
            {panelStage === 'edit' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground"
                  onClick={() => (selectedBlockId != null ? setSelectedBlockId(null) : goBackToThemes())}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {selectedBlockId != null ? s.back : s.chooseTheme}
                </Button>
                <div className="w-full flex flex-col min-h-0 shrink-0">
                  {selectedBlockId == null ? (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="h-px flex-1 bg-border/50 shrink-0" />
                        <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                          {s.allBlocks}
                        </h3>
                        <span className="h-px flex-1 bg-border/50 shrink-0" />
                      </div>
                      <ul className="space-y-2">
                        {BLOCKS.filter((block) => {
                          const isPremium = currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber'
                          if (block.id === 'cta' && !isPremium) return false
                          return true
                        }).map((block) => {
                          const isPremium = currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber'
                          const label = block.id === 'gallery' && isPremium ? s.aboutSalon : block.id === 'booking' && isPremium ? s.ourWorks : block.id === 'works' && isPremium ? s.worksP : (s[block.id] ?? block.label)
                          return (
                          <li key={block.id}>
                            <button
                              type="button"
                              onClick={() => setSelectedBlockId(block.id)}
                              className={cn(
                                'w-full rounded-none border-2 px-4 py-3 text-sm font-bold text-center transition',
                                'border-border/50 bg-card/30 text-foreground hover:bg-card/50 hover:border-primary/50',
                                visibleSectionId === block.id && 'border-primary/70 bg-primary/10 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                              )}
                            >
                              {label}
                            </button>
                          </li>
                          )
                        })}
                      </ul>
                      {!(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <>
                          <div className="flex items-center gap-2 my-5">
                            <span className="h-px flex-1 bg-border/50 shrink-0" />
                            <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                              {s.bgStyle}
                            </h3>
                            <span className="h-px flex-1 bg-border/50 shrink-0" />
                          </div>
                          <div className="flex gap-4 justify-center pb-2">
                            <div className="flex flex-col gap-3">
                              {BODY_BACKGROUND_OPTIONS.slice(0, 3).map((option) => {
                                const current = getDraftOrPublic('publicBodyBackgroundChoice', 'bg-2')
                                const selected = current === option.id
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setDraft('publicBodyBackgroundChoice', option.id)}
                                    className={cn(
                                      'h-20 w-20 rounded-full border-2 shrink-0 overflow-hidden transition',
                                      selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                                    )}
                                    style={
                                      option.type === 'image'
                                        ? { backgroundImage: `url(${option.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : { backgroundColor: option.color }
                                    }
                                    aria-label={option.id}
                                  />
                                )
                              })}
                            </div>
                            <div className="flex flex-col gap-3">
                              {BODY_BACKGROUND_OPTIONS.slice(3, 5).map((option) => {
                                const current = getDraftOrPublic('publicBodyBackgroundChoice', 'bg-2')
                                const selected = current === option.id
                                return (
                                  <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setDraft('publicBodyBackgroundChoice', option.id)}
                                    className={cn(
                                      'h-20 w-20 rounded-full border-2 shrink-0 overflow-hidden transition',
                                      selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                                    )}
                                    style={
                                      option.type === 'image'
                                        ? { backgroundImage: `url(${option.url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                                        : { backgroundColor: option.color }
                                    }
                                    aria-label={option.id}
                                  />
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  ) : selectedBlockId === 'header' ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.header}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                    <div className="space-y-0 pr-1">
                      {/* 1. Фон для шапки: фото или видео */}
                      <section className="space-y-3 pt-0 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.heroBg}</h4>
                        {(() => {
                          const heroImage = getDraftOrPublic('publicHeroImage')
                          const heroVideo = getDraftOrPublic('publicHeroVideo')
                          const isPremium = currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber'
                          const slug = typeof window !== 'undefined' ? (window.localStorage.getItem('publicSlug') || 'salon') : 'salon'
                          const tid = themeStorageId(currentHeaderTheme)

                          const removePhoto = () => {
                            if (typeof window === 'undefined') return
                            window.localStorage.removeItem(`draft_publicHeroImage_${slug}_${tid}`)
                            window.localStorage.removeItem(`draft_publicHeroImage_${tid}`)
                            window.localStorage.removeItem('publicHeroImage')
                            setStoragePoll((n) => n + 1)
                            notifyIframeDraft()
                          }
                          const removeVideo = () => {
                            if (typeof window === 'undefined') return
                            // Убираем видео + фото → чёрный фон
                            window.localStorage.removeItem(`draft_publicHeroVideo_${slug}_${tid}`)
                            window.localStorage.removeItem(`draft_publicHeroVideo_${tid}`)
                            window.localStorage.removeItem('publicHeroVideo')
                            window.localStorage.removeItem(`draft_publicHeroImage_${slug}_${tid}`)
                            window.localStorage.removeItem(`draft_publicHeroImage_${tid}`)
                            window.localStorage.removeItem('publicHeroImage')
                            setStoragePoll((n) => n + 1)
                            notifyIframeDraft()
                          }

                          return (
                            <div className="space-y-3">
                              {/* Текущий фон — визуальная карточка */}
                              {heroVideo ? (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                                  {/* Имитация тёмного видео-превью */}
                                  <div className="relative h-20 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                      <Video className="h-5 w-5 text-white/70" />
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold text-white/80">{s.videoLoaded}</p>
                                      <p className="text-[11px] text-white/40 mt-0.5">{s.videoShownInHeader}</p>
                                    </div>
                                    {/* Пульсирующая точка */}
                                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                  </div>
                                  <div className="flex gap-2 p-2 bg-zinc-900/80">
                                    <input id="constructor-hero-video-upload" type="file" accept="video/*" className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]; if (!file) return
                                        const reader = new FileReader()
                                        reader.onload = () => { const r = typeof reader.result === 'string' ? reader.result : ''; if (r) { setDraft('publicHeroVideo', r); setStoragePoll((n) => n + 1); notifyIframeDraft() } }
                                        reader.readAsDataURL(file); e.target.value = ''
                                      }}
                                    />
                                    <label htmlFor="constructor-hero-video-upload" className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-white/70 cursor-pointer transition-colors">
                                      <Video className="h-3.5 w-3.5" /> {s.changeVideo}
                                    </label>
                                    <button type="button" onClick={removeVideo} className="flex-1 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors">
                                      {s.remove}
                                    </button>
                                  </div>
                                </div>
                              ) : heroImage ? (
                                <div className="rounded-xl overflow-hidden border border-border/40">
                                  {/* Превью фотографии */}
                                  <div className="relative h-20 bg-black">
                                    <img src={heroImage} alt="" className="h-full w-full object-cover opacity-80" />
                                    <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white/80 bg-black/50 px-1.5 py-0.5 rounded">
                                      {s.photoBg}
                                    </span>
                                  </div>
                                  <div className="flex gap-2 p-2 bg-card/60">
                                    <input id="constructor-hero-upload" type="file" accept="image/*" className="hidden"
                                      onChange={(e) => {
                                        const file = e.target.files?.[0]; if (!file) return
                                        const reader = new FileReader()
                                        reader.onload = () => { const r = typeof reader.result === 'string' ? reader.result : ''; if (r) { setDraft('publicHeroImage', r); setStoragePoll((n) => n + 1); notifyIframeDraft() } }
                                        reader.readAsDataURL(file); e.target.value = ''
                                      }}
                                    />
                                    <label htmlFor="constructor-hero-upload" className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-card/20 hover:bg-card/40 text-xs font-medium text-foreground/70 cursor-pointer transition-colors">
                                      <ImageIcon className="h-3.5 w-3.5" /> {s.changePhoto}
                                    </label>
                                    <button type="button" onClick={removePhoto} className="flex-1 px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors">
                                      {s.remove}
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                /* Пустой фон — показываем чёрный блок */
                                <div className="rounded-xl overflow-hidden border border-white/10">
                                  <div className="h-14 bg-black flex items-center justify-center gap-2">
                                    <span className="text-xs text-white/30">{s.blackBg}</span>
                                  </div>
                                </div>
                              )}

                              {/* Кнопки загрузки (если нет ни видео, ни фото — или докинуть второй тип) */}
                              {!heroVideo && !heroImage && (
                                <div className="flex flex-col gap-2">
                                  {isPremium && (
                                    <>
                                      <input id="constructor-hero-video-upload" type="file" accept="video/*" className="hidden"
                                        onChange={(e) => {
                                          const file = e.target.files?.[0]; if (!file) return
                                          const reader = new FileReader()
                                          reader.onload = () => { const r = typeof reader.result === 'string' ? reader.result : ''; if (r) { setDraft('publicHeroVideo', r); setStoragePoll((n) => n + 1); notifyIframeDraft() } }
                                          reader.readAsDataURL(file); e.target.value = ''
                                        }}
                                      />
                                      <label htmlFor="constructor-hero-video-upload" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors">
                                        <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
                                        <span>{s.addVideo}</span>
                                      </label>
                                    </>
                                  )}
                                  <input id="constructor-hero-upload" type="file" accept="image/*" className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]; if (!file) return
                                      const reader = new FileReader()
                                      reader.onload = () => { const r = typeof reader.result === 'string' ? reader.result : ''; if (r) { setDraft('publicHeroImage', r); setStoragePoll((n) => n + 1); notifyIframeDraft() } }
                                      reader.readAsDataURL(file); e.target.value = ''
                                    }}
                                  />
                                  <label htmlFor="constructor-hero-upload" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors">
                                    <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                    <span>{s.addPhoto}</span>
                                  </label>
                                </div>
                              )}
                              {/* Если есть фото но нет видео — для премиума показываем кнопку добавить видео */}
                              {!heroVideo && heroImage && isPremium && (
                                <div className="pt-1">
                                  <input id="constructor-hero-video-upload" type="file" accept="video/*" className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0]; if (!file) return
                                      const reader = new FileReader()
                                      reader.onload = () => { const r = typeof reader.result === 'string' ? reader.result : ''; if (r) { setDraft('publicHeroVideo', r); setStoragePoll((n) => n + 1); notifyIframeDraft() } }
                                      reader.readAsDataURL(file); e.target.value = ''
                                    }}
                                  />
                                  <label htmlFor="constructor-hero-video-upload" className="w-full inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border/50 bg-card/10 hover:border-primary/40 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors text-muted-foreground">
                                    <Video className="h-4 w-4 shrink-0" />
                                    <span>{s.addVideoOverPhoto}</span>
                                  </label>
                                </div>
                              )}
                            </div>
                          )
                        })()}
                      </section>
                      {/* Цвет хедера (премиум) — палитра как в других шаблонах, с эффектом свечения */}
                      {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <section className="space-y-3 pt-3 pb-3 border-b border-border/50">
                          <h4 className="text-sm font-semibold text-foreground">{s.headerColor}</h4>
                          <div className="flex flex-wrap gap-2">
                            {PREMIUM_HEADER_COLOR_OPTIONS.map((opt) => {
                              const current = getDraftOrPublic('publicPremiumHeaderBgColor') || ''
                              const selected = current === opt.color
                              return (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraft('publicPremiumHeaderBgColor', opt.color)
                                    setDraft('publicPremiumHeaderBgGlow', opt.glow)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'h-8 w-8 rounded-full border-2 shrink-0 transition',
                                    selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                                  )}
                                  style={{
                                    backgroundColor: opt.color,
                                    boxShadow: selected ? opt.glow : undefined,
                                  }}
                                  title={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                                  aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                                />
                              )
                            })}
                            <button
                              type="button"
                              onClick={() => {
                                setDraft('publicPremiumHeaderBgColor', '')
                                setDraft('publicPremiumHeaderBgGlow', '')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'px-2.5 py-1.5 rounded-full border text-sm font-medium transition-colors',
                                !getDraftOrPublic('publicPremiumHeaderBgColor')
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border/50 text-muted-foreground hover:text-foreground'
                              )}
                            >
                              {s.byDefault}
                            </button>
                          </div>
                        </section>
                      )}
                      {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <>
                          {[
                            { key: 'publicPremiumHeaderNavColor', keyGlow: '', label: s.premBtnColor },
                            { key: 'publicPremiumHeaderTitleColor', keyGlow: '', label: s.premTitleColor },
                            { key: 'publicPremiumHeroSubtitleColor', keyGlow: '', label: s.premHeroSub },
                            { key: 'publicPremiumHeroTitleColor', keyGlow: '', label: s.premHeroTitle },
                            { key: 'publicPremiumHeroButton1BorderColor', keyGlow: 'publicPremiumHeroButton1Glow', label: s.premBtn1Border },
                            { key: 'publicPremiumHeroButton2BorderColor', keyGlow: 'publicPremiumHeroButton2Glow', label: s.premBtn2Border },
                          ].map(({ key, keyGlow, label }) => (
                            <section key={key} className="space-y-2 pt-3 pb-3 border-b border-border/50">
                              <h4 className="text-sm font-semibold text-foreground">{label}</h4>
                              <div className="flex flex-wrap gap-2 items-center">
                                {PREMIUM_HEADER_COLOR_OPTIONS.map((opt) => {
                                  const current = getDraftOrPublic(key) || ''
                                  const selected = current === opt.color
                                  return (
                                    <button
                                      key={opt.id}
                                      type="button"
                                      onClick={() => {
                                        setDraft(key, opt.color)
                                        if (keyGlow) setDraft(keyGlow, opt.glow)
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      }}
                                      className={cn(
                                        'h-8 w-8 rounded-full border-2 shrink-0 transition',
                                        selected ? 'border-primary ring-2 ring-primary/30' : 'border-border/50 hover:border-primary/50'
                                      )}
                                      style={{
                                        backgroundColor: opt.color,
                                        boxShadow: selected ? opt.glow : undefined,
                                      }}
                                      title={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                                      aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                                    />
                                  )
                                })}
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDraft(key, '')
                                    if (keyGlow) setDraft(keyGlow, '')
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'px-2.5 py-1.5 rounded-full border text-sm font-medium transition-colors',
                                    !getDraftOrPublic(key)
                                      ? 'border-primary bg-primary/10 text-foreground'
                                      : 'border-border/50 text-muted-foreground hover:text-foreground'
                                  )}
                                >
                                  {s.byDefault}
                                </button>
                              </div>
                            </section>
                          ))}
                        </>
                      )}
                      {!(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                      <>
                      {/* 2. Логотип (шапка) */}
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.headerLogo}</h4>
                        <input
                          id="constructor-header-logo-upload"
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            const reader = new FileReader()
                            reader.onload = () => {
                              const result = typeof reader.result === 'string' ? reader.result : ''
                              if (!result) return
                              compressImageForLogo(result, (dataUrl) => {
                                setDraft('publicLogo', dataUrl)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              })
                            }
                            reader.readAsDataURL(file)
                            e.target.value = ''
                          }}
                        />
                        <div className="flex items-center gap-3">
                          {(() => {
                            const stored = getDraftOrPublic('publicLogo') || DEFAULT_LOGO_URL
                            const displayUrl = stored.startsWith('data:') ? DEFAULT_LOGO_URL : stored
                            const isDefaultShape = displayUrl === DEFAULT_LOGO_URL
                            const shape = isDefaultShape ? 'circle' : (getDraftOrPublic('publicHeaderLogoShape') || 'circle')
                            return (
                          <label
                            htmlFor="constructor-header-logo-upload"
                            className={cn(
                              'cursor-pointer shrink-0 overflow-hidden border border-border/50 transition hover:border-primary/50 hover:ring-2 hover:ring-primary/30',
                              shape === 'circle' ? 'h-14 w-14 rounded-full' : shape === 'rounded' ? 'h-14 w-14 rounded-xl' : 'h-14 w-14 rounded-none'
                            )}
                          >
                            {displayUrl ? (
                              <img src={displayUrl} alt={s.logoAlt} className="h-full w-full object-cover" />
                            ) : null}
                          </label>
                            )
                          })()}
                          <label
                            htmlFor="constructor-header-logo-upload"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-none border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors"
                          >
                            <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <span>{(getDraftOrPublic('publicLogo') && getDraftOrPublic('publicLogo') !== DEFAULT_LOGO_URL) ? s.changeLogo : s.uploadLogo}</span>
                          </label>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { value: 'circle', label: s.circle },
                            { value: 'rounded', label: s.rounded },
                            { value: 'square', label: s.square },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setDraft('publicHeaderLogoShape', opt.value)}
                              className={cn(
                                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                                getDraftOrPublic('publicHeaderLogoShape') === opt.value
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border/50 bg-card/30 text-muted-foreground hover:bg-card/50'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3">
                          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(getDraftOrPublic('publicHeaderLogoVisible') || 'true') !== 'false'}
                              onChange={(e) => {
                                setDraft('publicHeaderLogoVisible', e.target.checked ? 'true' : 'false')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className="h-3.5 w-3.5 rounded border-border/60 bg-card"
                            />
                            <span>{s.showHeaderLogo}</span>
                          </label>
                        </div>
                      </section>
                      {/* 3. Главное название */}
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.mainTitle}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const raw = getDraftOrPublic(headerColorsStorageKey)
                                let prev: { title?: string; subtitle?: string; primary?: string; secondary?: string } = {}
                                if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, title: opt.id }))
                                setStoragePoll((n) => n + 1)
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (() => {
                                  const raw = getDraftOrPublic(headerColorsStorageKey)
                                  let cur = 'default'
                                  if (raw) try { cur = JSON.parse(raw)?.title || 'default' } catch { /* ignore */ }
                                  return cur === opt.id ? 'border-primary' : 'border-border/50'
                                })()
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const raw = getDraftOrPublic(headerColorsStorageKey)
                              let prev: Record<string, string> = {}
                              if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                              const next = { ...prev, title: 'default' }
                              setDraft(headerColorsStorageKey, JSON.stringify(next))
                              setStoragePoll((n) => n + 1)
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      {/* 4. Описание */}
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.description}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                const raw = getDraftOrPublic(headerColorsStorageKey)
                                let prev: Record<string, string> = {}
                                if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, subtitle: opt.id }))
                                setStoragePoll((n) => n + 1)
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (() => {
                                  const raw = getDraftOrPublic(headerColorsStorageKey)
                                  let cur = 'default'
                                  if (raw) try { cur = JSON.parse(raw)?.subtitle || 'default' } catch { /* ignore */ }
                                  return cur === opt.id ? 'border-primary' : 'border-border/50'
                                })()
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              const raw = getDraftOrPublic(headerColorsStorageKey)
                              let prev: Record<string, string> = {}
                              if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                              setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, subtitle: 'default' }))
                              setStoragePoll((n) => n + 1)
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      {/* 5. Кнопки */}
                      <section className="space-y-4 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.buttons}</h4>
                        {/* Первая кнопка */}
                        <div className="space-y-2 pl-0">
                          <span className="block text-center text-xs text-muted-foreground uppercase tracking-wider">{s.firstBtn}</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setDraft('publicHeaderPrimaryCtaShape', 'square')}
                              className={cn(
                                'px-2 py-1.5 rounded-lg border text-sm font-medium',
                                getDraftOrPublic('publicHeaderPrimaryCtaShape') === 'square' ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/30'
                              )}
                            >
                              {s.square}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft('publicHeaderPrimaryCtaShape', 'round')}
                              className={cn(
                                'px-2 py-1.5 rounded-lg border text-sm font-medium',
                                getDraftOrPublic('publicHeaderPrimaryCtaShape') === 'round' ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/30'
                              )}
                            >
                              {s.circle}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {headerButtonOptionsList.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  const raw = getDraftOrPublic(headerColorsStorageKey)
                                  let prev: Record<string, string> = {}
                                  if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                  setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, primary: opt.id }))
                                  setStoragePoll((n) => n + 1)
                                }}
                                className={cn(
                                  'h-7 w-7 rounded-full border-2',
                                  (() => {
                                    const raw = getDraftOrPublic(headerColorsStorageKey)
                                    let cur = 'default'
                                    if (raw) try { cur = JSON.parse(raw)?.primary || 'default' } catch { /* ignore */ }
                                    return cur === opt.id ? 'border-primary' : 'border-border/50'
                                  })()
                                )}
                                style={{ backgroundColor: opt.background }}
                                aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const raw = getDraftOrPublic(headerColorsStorageKey)
                                let prev: Record<string, string> = {}
                                if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, primary: 'default' }))
                                setStoragePoll((n) => n + 1)
                              }}
                              className="px-2 py-1 rounded-full border border-border/50 text-sm text-muted-foreground"
                            >
                              {s.byDefault}
                            </button>
                          </div>
                        </div>
                        {/* Вторая кнопка */}
                        <div className="space-y-2 pl-0">
                          <span className="block text-center text-xs text-muted-foreground uppercase tracking-wider">{s.secondBtn}</span>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => setDraft('publicHeaderSecondaryCtaShape', 'square')}
                              className={cn(
                                'px-2 py-1.5 rounded-lg border text-sm font-medium',
                                getDraftOrPublic('publicHeaderSecondaryCtaShape') === 'square' ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/30'
                              )}
                            >
                              {s.square}
                            </button>
                            <button
                              type="button"
                              onClick={() => setDraft('publicHeaderSecondaryCtaShape', 'round')}
                              className={cn(
                                'px-2 py-1.5 rounded-lg border text-sm font-medium',
                                getDraftOrPublic('publicHeaderSecondaryCtaShape') === 'round' ? 'border-primary bg-primary/10' : 'border-border/50 bg-card/30'
                              )}
                            >
                              {s.circle}
                            </button>
                          </div>
                          <div className="flex flex-wrap gap-2 items-center">
                            {headerButtonOptionsList.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  const raw = getDraftOrPublic(headerColorsStorageKey)
                                  let prev: Record<string, string> = {}
                                  if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                  setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, secondary: opt.id }))
                                  setStoragePoll((n) => n + 1)
                                }}
                                className={cn(
                                  'h-7 w-7 rounded-full border-2',
                                  (() => {
                                    const raw = getDraftOrPublic(headerColorsStorageKey)
                                    let cur = 'default'
                                    if (raw) try { cur = JSON.parse(raw)?.secondary || 'default' } catch { /* ignore */ }
                                    return cur === opt.id ? 'border-primary' : 'border-border/50'
                                  })()
                                )}
                                style={{ backgroundColor: opt.background }}
                                aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                const raw = getDraftOrPublic(headerColorsStorageKey)
                                let prev: Record<string, string> = {}
                                if (raw) try { prev = JSON.parse(raw) } catch { /* ignore */ }
                                setDraft(headerColorsStorageKey, JSON.stringify({ ...prev, secondary: 'default' }))
                                setStoragePoll((n) => n + 1)
                              }}
                              className="px-2 py-1 rounded-full border border-border/50 text-sm text-muted-foreground"
                            >
                              {s.byDefault}
                            </button>
                          </div>
                        </div>
                      </section>
                      </>
                      )}
                    </div>
                    </>
                  ) : selectedBlockId === 'gallery' ? (
                    (currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.aboutSalon}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.aboutSalonDesc}
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.aboutTitleColor}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicAboutSalonTitleColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicAboutSalonTitleColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicAboutSalonTitleColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.aboutDescColor}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicAboutSalonDescColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicAboutSalonDescColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicAboutSalonDescColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.aboutThirdColor}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicAboutSalonThirdColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicAboutSalonThirdColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicAboutSalonThirdColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.aboutBtnBorder}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicAboutSalonButtonBorderColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicAboutSalonButtonBorderColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicAboutSalonButtonBorderColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3">
                        <h4 className="text-sm font-semibold text-foreground">{s.salonPhotos}</h4>
                        <p className="text-xs text-muted-foreground">{s.photosHint}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                            const image = getDraftOrPublic(`publicAboutSalon${idx}`)
                            const displayImage =
                              image === '__empty__' ? '' : (image || (idx <= 3 ? ABOUT_SALON_DEFAULTS[idx - 1] : ''))
                            const hasImage = Boolean(displayImage)
                            return (
                              <div
                                key={`about-salon-slot-${idx}`}
                                className={cn(
                                  'relative aspect-square rounded-lg border-2 overflow-hidden',
                                  hasImage ? 'border-border/50 bg-card/30' : 'border-dashed border-border/50 bg-card/20'
                                )}
                              >
                                {hasImage ? (
                                  <>
                                    <label
                                      htmlFor={`constructor-about-salon-${idx}`}
                                      className="absolute inset-0 cursor-pointer block"
                                      title={s.replacePhoto}
                                    >
                                      <img src={displayImage} alt="" className="h-full w-full object-cover" />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (typeof window === 'undefined') return
                                        setDraft(`publicAboutSalon${idx}`, '__empty__')
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      }}
                                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10"
                                      aria-label={s.deleteBtn}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </>
                                ) : (
                                  <label
                                    htmlFor={`constructor-about-salon-${idx}`}
                                    className="h-full w-full flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                                  >
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[10px]">{s.slot} {idx}</span>
                                  </label>
                                )}
                                <input
                                  id={`constructor-about-salon-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || typeof window === 'undefined') return
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      const result = typeof reader.result === 'string' ? reader.result : ''
                                      if (!result) return
                                      compressImageForLogo(result, (dataUrl) => {
                                        setDraft(`publicAboutSalon${idx}`, dataUrl)
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      })
                                    }
                                    reader.onerror = () => {
                                      e.target.value = ''
                                    }
                                    reader.readAsDataURL(file)
                                    e.target.value = ''
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    </>
                    ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.gallery}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.galleryEditHint}
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.blockLabel}</h4>
                        <input
                          type="text"
                          value={getDraftOrPublic('publicGalleryTitle')}
                          onChange={(e) => {
                            setDraft('publicGalleryTitle', e.target.value)
                            setStoragePoll((n) => n + 1)
                            notifyIframeDraft()
                          }}
                          placeholder={s.gallery}
                          className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.labelColor}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicGalleryTitleColor', opt.id)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicGalleryTitleColor') || 'default') === opt.id ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicGalleryTitleColor', 'default')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                    </>
                    )
                  ) : selectedBlockId === 'booking' ? (
                    (currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.ourWorks}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.ourWorksDesc}
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.worksTitleColor}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicWorksTitleColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicWorksTitleColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicWorksTitleColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.worksSubColor}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicWorksSubtitleColor', opt.color)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicWorksSubtitleColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicWorksSubtitleColor', '')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3">
                        <h4 className="text-sm font-semibold text-foreground">{s.worksPhotos}</h4>
                        <p className="text-xs text-muted-foreground">{s.photosHint}</p>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                            const image = getDraftOrPublic(`publicWorks${idx}`)
                            const displayImage =
                              image === '__empty__' ? '' : (image || (idx <= 5 ? SALON_PHOTOS_DEFAULTS[idx - 1] : ''))
                            const hasImage = Boolean(displayImage)
                            return (
                              <div
                                key={`works-block-slot-${idx}`}
                                className={cn(
                                  'relative aspect-square rounded-lg border-2 overflow-hidden',
                                  hasImage ? 'border-border/50 bg-card/30' : 'border-dashed border-border/50 bg-card/20'
                                )}
                              >
                                {hasImage ? (
                                  <>
                                    <label
                                      htmlFor={`constructor-works-block-${idx}`}
                                      className="absolute inset-0 cursor-pointer block"
                                      title={s.replacePhoto}
                                    >
                                      <img src={displayImage} alt="" className="h-full w-full object-cover" />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (typeof window === 'undefined') return
                                        setDraft(`publicWorks${idx}`, '__empty__')
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      }}
                                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10"
                                      aria-label={s.deleteBtn}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </>
                                ) : (
                                  <label
                                    htmlFor={`constructor-works-block-${idx}`}
                                    className="h-full w-full flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                                  >
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[10px]">{s.slot} {idx}</span>
                                  </label>
                                )}
                                <input
                                  id={`constructor-works-block-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || typeof window === 'undefined') return
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      const result = typeof reader.result === 'string' ? reader.result : ''
                                      if (!result) return
                                      compressImageForLogo(result, (dataUrl) => {
                                        setDraft(`publicWorks${idx}`, dataUrl)
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      })
                                    }
                                    reader.onerror = () => { e.target.value = '' }
                                    reader.readAsDataURL(file)
                                    e.target.value = ''
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </section>
                    </>
                    ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.booking}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.bookingEditHint}
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.worksTitleColor}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicBookingTitleColor', opt.id)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicBookingTitleColor') || 'default') === opt.id ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicBookingTitleColor', 'default')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                      <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.worksSubColor}</h4>
                        <div className="flex flex-wrap gap-2 items-center">
                          {HEADER_TEXT_OPTIONS.map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => {
                                setDraft('publicBookingSubtitleColor', opt.id)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'h-7 w-7 rounded-full border-2 transition',
                                (getDraftOrPublic('publicBookingSubtitleColor') || 'default') === opt.id ? 'border-primary' : 'border-border/50'
                              )}
                              style={{ backgroundColor: opt.color }}
                              aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                            />
                          ))}
                          <button
                            type="button"
                            onClick={() => {
                              setDraft('publicBookingSubtitleColor', 'default')
                              setStoragePoll((n) => n + 1)
                              notifyIframeDraft()
                            }}
                            className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                          >
                            {s.byDefault}
                          </button>
                        </div>
                      </section>
                    </>
                    )
                  ) : selectedBlockId === 'works' ? (
                    (currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.ourServicesP}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.ourServicesDesc}
                      </p>
                      <section className="space-y-3 pt-2 pb-3 border-b border-border/50">
                        {(() => {
                          const photosHidden = getDraftOrPublic('publicServicesPhotosHidden') === '1'
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setDraft('publicServicesPhotosHidden', photosHidden ? '0' : '1')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                                photosHidden
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                              )}
                            >
                              {photosHidden ? (
                                <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg> {s.showPhotos}</>
                              ) : (
                                <><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg> {s.hidePhotos}</>
                              )}
                            </button>
                          )
                        })()}
                      </section>
                      {[
                        { key: 'publicServicesTitleColor', label: s.servicesTitleColor },
                        { key: 'publicServicesSubtitleColor', label: s.servicesSubColor },
                        { key: 'publicServicesCardTitleColor', label: s.servicesCardColor },
                        { key: 'publicServicesProcNameColor', label: s.servicesProcColor },
                        { key: 'publicServicesProcDescColor', label: s.servicesDescColor },
                      ].map((item) => (
                        <section key={item.key} className="space-y-2 pt-3 pb-3 border-b border-border/50">
                          <h4 className="text-sm font-semibold text-foreground">{item.label}</h4>
                          <div className="flex flex-wrap gap-2 items-center">
                            {HEADER_TEXT_OPTIONS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setDraft(item.key, opt.color)
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className={cn(
                                  'h-7 w-7 rounded-full border-2 transition',
                                  (getDraftOrPublic(item.key) || '') === opt.color ? 'border-primary' : 'border-border/50'
                                )}
                                style={{ backgroundColor: opt.color }}
                                aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setDraft(item.key, '')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                            >
                              {s.byDefault}
                            </button>
                          </div>
                        </section>
                      ))}
                    </>
                    ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.works}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.carouselHint}
                      </p>
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-foreground">{s.galleryPhotos}</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((idx) => {
                            const image = getDraftOrPublic(`publicGallery${idx}`)
                            const displayImage =
                              image === '__empty__' ? '' : (image || (idx <= 3 ? WORKS_CAROUSEL_DEFAULTS[idx - 1] : ''))
                            const hasImage = Boolean(displayImage)
                            return (
                              <div
                                key={`works-slot-${idx}`}
                                className={cn(
                                  'relative aspect-square rounded-lg border-2 overflow-hidden',
                                  hasImage ? 'border-border/50 bg-card/30' : 'border-dashed border-border/50 bg-card/20'
                                )}
                              >
                                {hasImage ? (
                                  <>
                                    <label
                                      htmlFor={`constructor-works-gallery-${idx}`}
                                      className="absolute inset-0 cursor-pointer block"
                                      title={s.replacePhoto}
                                    >
                                      <img src={displayImage} alt="" className="h-full w-full object-cover" />
                                    </label>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        if (typeof window === 'undefined') return
                                        setDraft(`publicGallery${idx}`, '__empty__')
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      }}
                                      className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10"
                                      aria-label={s.deleteBtn}
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </>
                                ) : (
                                  <label
                                    htmlFor={`constructor-works-gallery-${idx}`}
                                    className="h-full w-full flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
                                  >
                                    <Plus className="h-5 w-5" />
                                    <span className="text-[10px]">{s.slot} {idx}</span>
                                  </label>
                                )}
                                <input
                                  id={`constructor-works-gallery-${idx}`}
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (!file || typeof window === 'undefined') return
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      const result = typeof reader.result === 'string' ? reader.result : ''
                                      if (!result) return
                                      compressImageForLogo(result, (dataUrl) => {
                                        setDraft(`publicGallery${idx}`, dataUrl)
                                        setStoragePoll((n) => n + 1)
                                        notifyIframeDraft()
                                      })
                                    }
                                    reader.onerror = () => {
                                      e.target.value = ''
                                    }
                                    reader.readAsDataURL(file)
                                    e.target.value = ''
                                  }}
                                />
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </>
                    )
                  ) : selectedBlockId === 'footer' ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1 w-full">
                        <span className="flex-1 h-px bg-border/60 min-w-0" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider px-2 text-center shrink-0">
                          {s.footerTitle}
                        </h3>
                        <span className="flex-1 h-px bg-border/60 min-w-0" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.footerDesc}
                      </p>
                      {/* 1. Логотип футера */}
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.footerLogo}</h4>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const footerLogoUrl = getDraftOrPublic('publicFooterLogo') || getDraftOrPublic('publicLogo') || DEFAULT_LOGO_URL
                            const footerLogoDisplayUrl = footerLogoUrl
                            const footerLogoDisplayShape =
                              getDraftOrPublic('publicFooterLogoShape') ||
                              getDraftOrPublic('publicLogoShape') ||
                              'circle'
                            return footerLogoUrl ? (
                            <div
                              className={cn(
                                'h-14 w-14 shrink-0 overflow-hidden border border-border/50 rounded-lg',
                                footerLogoDisplayShape === 'circle' ? 'rounded-full' : footerLogoDisplayShape === 'rounded' ? 'rounded-xl' : 'rounded-none'
                              )}
                            >
                              <img
                                src={footerLogoDisplayUrl}
                                alt={s.footerLogoAlt}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-14 w-14 shrink-0 border border-dashed border-border/50 rounded-lg flex items-center justify-center bg-card/30 text-xs text-muted-foreground">
                              {s.noLogo}
                            </div>
                          )
                          })()}
                          <div>
                            <input
                              id="constructor-footer-logo-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (!file) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const result = typeof reader.result === 'string' ? reader.result : ''
                                  if (result) {
                                    setDraft('publicFooterLogo', result)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }
                                }
                                reader.readAsDataURL(file)
                                e.target.value = ''
                              }}
                            />
                            <label
                              htmlFor="constructor-footer-logo-upload"
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-none border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-xs font-medium cursor-pointer transition-colors"
                            >
                              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                              <span>{s.changeLogoFooter}</span>
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {[
                            { value: 'circle', label: s.circle },
                            { value: 'rounded', label: s.rounded },
                            { value: 'square', label: s.square },
                          ].map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => {
                                setDraft('publicFooterLogoShape', opt.value)
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors',
                                (getDraftOrPublic('publicFooterLogoShape') ||
                                  getDraftOrPublic('publicLogoShape') ||
                                  'circle') === opt.value
                                  ? 'border-primary bg-primary/10 text-foreground'
                                  : 'border-border/50 bg-card/30 text-muted-foreground hover:bg-card/50'
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                        <div className="mt-3">
                          <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                            <input
                              type="checkbox"
                              checked={(getDraftOrPublic('publicFooterLogoVisible') || 'true') !== 'false'}
                              onChange={(e) => {
                                setDraft('publicFooterLogoVisible', e.target.checked ? 'true' : 'false')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className="h-3.5 w-3.5 rounded border-border/60 bg-card"
                            />
                            <span>{s.showFooterLogo}</span>
                          </label>
                        </div>
                      </section>
                      {/* 2. Ссылки на соцсети */}
                      <section className="space-y-3 pt-3 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.socialLinks}</h4>
                        <div className="space-y-2">
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Telegram</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicTelegram')}
                              onChange={(e) => setDraft('publicTelegram', e.target.value)}
                              placeholder="https://t.me/username"
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Viber</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicViber')}
                              onChange={(e) => setDraft('publicViber', e.target.value)}
                              placeholder="viber://chat?number=..."
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Instagram</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicInstagram')}
                              onChange={(e) => setDraft('publicInstagram', e.target.value)}
                              placeholder="https://instagram.com/username"
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">Facebook</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicFacebook')}
                              onChange={(e) => setDraft('publicFacebook', e.target.value)}
                              placeholder="https://facebook.com/username"
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">WhatsApp</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicWhatsapp')}
                              onChange={(e) => setDraft('publicWhatsapp', e.target.value)}
                              placeholder="https://wa.me/123456789"
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">X (Twitter)</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicTwitter')}
                              onChange={(e) => setDraft('publicTwitter', e.target.value)}
                              placeholder="https://x.com/username"
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-muted-foreground">TikTok</label>
                            <input
                              type="text"
                              value={getDraftOrPublic('publicTiktok')}
                              onChange={(e) => setDraft('publicTiktok', e.target.value)}
                              placeholder="https://tiktok.com/@username"
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        </div>
                      </section>
                      {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <section className="space-y-3 pt-3 pb-3 border-b border-border/50">
                          <h4 className="text-sm font-semibold text-foreground">{s.footerColorsPremium}</h4>
                          <p className="text-xs text-muted-foreground">{s.footerColorsDesc}</p>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{s.footerTitleColor}</span>
                            <div className="flex flex-wrap gap-2 items-center">
                              {HEADER_TEXT_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraft('publicFooterTitleColor', opt.color)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'h-7 w-7 rounded-full border-2 transition',
                                    (getDraftOrPublic('publicFooterTitleColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                                  )}
                                  style={{ backgroundColor: opt.color }}
                                  aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                                />
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setDraft('publicFooterTitleColor', '')
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                              >
                                {s.byDefault}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{s.footerTextColor}</span>
                            <div className="flex flex-wrap gap-2 items-center">
                              {HEADER_TEXT_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraft('publicFooterTextColor', opt.color)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'h-7 w-7 rounded-full border-2 transition',
                                    (getDraftOrPublic('publicFooterTextColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                                  )}
                                  style={{ backgroundColor: opt.color }}
                                  aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                                />
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setDraft('publicFooterTextColor', '')
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                              >
                                {s.byDefault}
                              </button>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <span className="text-xs text-muted-foreground">{s.footerDayOffColor}</span>
                            <div className="flex flex-wrap gap-2 items-center">
                              {HEADER_TEXT_OPTIONS.map((opt) => (
                                <button
                                  key={opt.id}
                                  type="button"
                                  onClick={() => {
                                    setDraft('publicFooterDayOffColor', opt.color)
                                    setStoragePoll((n) => n + 1)
                                    notifyIframeDraft()
                                  }}
                                  className={cn(
                                    'h-7 w-7 rounded-full border-2 transition',
                                    (getDraftOrPublic('publicFooterDayOffColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                                  )}
                                  style={{ backgroundColor: opt.color }}
                                  aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                                />
                              ))}
                              <button
                                type="button"
                                onClick={() => {
                                  setDraft('publicFooterDayOffColor', '')
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                              >
                                {s.byDefault}
                              </button>
                            </div>
                          </div>
                        </section>
                      )}
                    </>
                  ) : selectedBlockId === 'cta' ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.ctaBlock}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.ctaDesc}
                      </p>
                      <section className="space-y-3 pt-2 pb-3 border-b border-border/50">
                        {(() => {
                          const ctaHidden = getDraftOrPublic('publicCtaBlockVisible') === '0'
                          return (
                            <button
                              type="button"
                              onClick={() => {
                                setDraft('publicCtaBlockVisible', ctaHidden ? '1' : '0')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className={cn(
                                'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all',
                                ctaHidden
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                                  : 'bg-red-500/15 text-red-400 border border-red-500/30 hover:bg-red-500/25'
                              )}
                            >
                              {ctaHidden ? (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg>
                                  {s.showBlockBtn}
                                </>
                              ) : (
                                <>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"/><path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"/><path d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"/><path d="m2 2 20 20"/></svg>
                                  {s.hideBlockBtn}
                                </>
                              )}
                            </button>
                          )
                        })()}
                      </section>
                      {[
                        { key: 'publicCtaSparkleColor', label: s.sparkleColor },
                        { key: 'publicCtaTitleColor', label: s.ctaTitleColor },
                        { key: 'publicCtaSubtitleColor', label: s.ctaSubColor },
                        { key: 'publicCtaButtonBorderColor', label: s.ctaBtnBorder },
                      ].map((item) => (
                        <section key={item.key} className="space-y-2 pt-3 pb-3 border-b border-border/50">
                          <h4 className="text-sm font-semibold text-foreground">{item.label}</h4>
                          <div className="flex flex-wrap gap-2 items-center">
                            {HEADER_TEXT_OPTIONS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setDraft(item.key, opt.color)
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className={cn(
                                  'h-7 w-7 rounded-full border-2 transition',
                                  (getDraftOrPublic(item.key) || '') === opt.color ? 'border-primary' : 'border-border/50'
                                )}
                                style={{ backgroundColor: opt.color }}
                                aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setDraft(item.key, '')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                            >
                              {s.byDefault}
                            </button>
                          </div>
                        </section>
                      ))}
                    </>
                  ) : selectedBlockId === 'map' ? (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {s.mapAddr}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2 mb-4">
                        {s.mapAddrDesc}
                      </p>
                      <section className="space-y-2 pt-2 pb-3 border-b border-border/50">
                        <h4 className="text-sm font-semibold text-foreground">{s.address}</h4>
                        <div ref={addressRef} className="relative">
                          <input
                            type="text"
                            value={addressQuery}
                            onChange={(e) => {
                              const v = e.target.value
                              setAddressQuery(v)
                              setDraft('publicAddress', v)
                              setDraft('publicFooterAddress', v)
                            }}
                            onFocus={() => {
                              setIsAddressFocused(true)
                              if (addressResults.length > 0) setIsAddressOpen(true)
                            }}
                            onBlur={() => {
                              // небольшая задержка, чтобы клик по подсказке успел отработать
                              setTimeout(() => setIsAddressFocused(false), 150)
                            }}
                            placeholder={s.footerDefAddr}
                            className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          />
                          {isAddressOpen && addressResults.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 rounded-lg border border-border/50 bg-card shadow-2xl max-h-60 overflow-y-auto">
                              {addressResults.map((result) => {
                                const title = result.display_name as string
                                return (
                                  <button
                                    key={result.place_id}
                                    type="button"
                                    onClick={() => {
                                      const formatted = result.display_name as string
                                      const placeName =
                                        (result.name as string) ||
                                        (formatted ? formatted.split(',')[0] : '')
                                      setAddressQuery(formatted)
                                      setDraft('publicAddress', formatted)
                                      setDraft('publicFooterAddress', formatted)
                                      if (result.lat && result.lon) {
                                        setDraft('publicMapLat', String(result.lat))
                                        setDraft('publicMapLng', String(result.lon))
                                      }
                                      setDraft('publicPlaceName', placeName)
                                      setIsAddressOpen(false)
                                      setAddressResults([])
                                    }}
                                    className="w-full px-3 py-2 text-left text-xs sm:text-sm text-foreground hover:bg-accent/10"
                                  >
                                    {title}
                                  </button>
                                )
                              })}
                              {isAddressLoading && (
                                <div className="px-3 py-2 text-xs text-muted-foreground">
                                  {s.searching}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </section>
                      {(currentHeaderTheme === 'premium-hair' || currentHeaderTheme === 'premium-barber') && (
                        <section className="space-y-2 pt-3 pb-3 border-b border-border/50">
                          <h4 className="text-sm font-semibold text-foreground">{s.mapLabelColor}</h4>
                          <p className="text-xs text-muted-foreground">{s.mapLabelDesc}</p>
                          <div className="flex flex-wrap gap-2 items-center">
                            {HEADER_TEXT_OPTIONS.map((opt) => (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                  setDraft('publicMapLabelColor', opt.color)
                                  setStoragePoll((n) => n + 1)
                                  notifyIframeDraft()
                                }}
                                className={cn(
                                  'h-7 w-7 rounded-full border-2 transition',
                                  (getDraftOrPublic('publicMapLabelColor') || '') === opt.color ? 'border-primary' : 'border-border/50'
                                )}
                                style={{ backgroundColor: opt.color }}
                                aria-label={s[COLOR_KEY_MAP[opt.id]] ?? opt.label}
                              />
                            ))}
                            <button
                              type="button"
                              onClick={() => {
                                setDraft('publicMapLabelColor', '')
                                setStoragePoll((n) => n + 1)
                                notifyIframeDraft()
                              }}
                              className="ml-0.5 px-2.5 py-1 rounded-full border border-border/50 text-sm text-muted-foreground hover:text-foreground"
                            >
                              {s.byDefault}
                            </button>
                          </div>
                        </section>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-4 mt-1">
                        <span className="flex-1 h-px bg-border/60" />
                        <h3 className="text-base font-bold text-foreground uppercase tracking-wider shrink-0 px-2">
                          {(selectedBlockId && s[selectedBlockId]) || BLOCKS.find((b) => b.id === selectedBlockId)?.label || selectedBlockId}
                        </h3>
                        <span className="flex-1 h-px bg-border/60" />
                      </div>
                      <p className="text-sm leading-snug text-muted-foreground text-center py-2">
                        {selectedBlockId === 'header'
                          ? s.editHeaderDesc
                          : s.editDesc}
                      </p>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
          {panelStage === 'edit' && (
            <div className="shrink-0 p-3 border-t border-border/40 bg-card/95 sticky bottom-0">
              {(() => {
                // Если есть реальные правки после сброса — снимаем флаг немедленно (render-time sync)
                if (resetJustApplied.current && currentThemeHasEdits) {
                  resetJustApplied.current = false
                }
                const isResetDisabled = selectedBlockId == null
                  ? currentHeaderTheme === 'hair'
                    ? !hasHeaderDesignOverride
                    : !currentThemeHasEdits || resetJustApplied.current
                  : undoStack.length === 0
                const resetTitle = selectedBlockId == null
                  ? currentHeaderTheme === 'hair'
                    ? hasHeaderDesignOverride
                      ? s.restoreHeader
                      : s.designAlready
                    : (!currentThemeHasEdits || resetJustApplied.current)
                      ? s.designAlready
                      : s.undoToDesign
                  : undoStack.length === 0
                  ? s.noUndo
                  : s.undoLastChange
                return (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 border-red-400/70 bg-red-500/20 text-white hover:bg-red-500/30 hover:border-red-400 hover:text-white disabled:opacity-50 disabled:text-white/80"
                    disabled={isResetDisabled}
                    onClick={selectedBlockId == null ? handleRestoreInitialDesign : handleUndo}
                    title={resetTitle}
                  >
                    <RotateCcw className="h-4 w-4 shrink-0" />
                    {selectedBlockId == null ? s.restoreDesign : s.undoLast}
                  </Button>
                )
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
    </ConstructorErrorBoundary>
  )
}
