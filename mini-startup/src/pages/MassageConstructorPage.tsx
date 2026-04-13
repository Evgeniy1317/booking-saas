import { useState, useCallback, useMemo, useRef, useEffect, useLayoutEffect, type ChangeEvent } from 'react'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Maximize2,
  Save,
  PanelRightOpen,
  Smartphone,
  Monitor,
  X,
  ChevronLeft,
  ChevronDown,
  Pencil,
  RotateCcw,
  Undo2,
  Gem,
  Plus,
  Video,
  ImageIcon,
  Globe,
  Check,
  Layers,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { spaRouteHref } from '@/lib/spa-path'
import iconMassageClassic from '@/assets/images/massage-images/head-massage.png'
import iconMassageThai from '@/assets/images/massage-images/bath-towel.png'
import iconMassageStone from '@/assets/images/massage-images/spa.png'
import iconMassageAntistress from '@/assets/images/massage-images/spa (1).png'
import iconMassageSports from '@/assets/images/massage-images/massage.png'
import iconPremiumMassage from '@/assets/images/constructor-images/free-icon-premium-4907289.png'
import {
  MASSAGE_DRAFT_PREFIX,
  getMassageDraft,
  setMassageDraft,
  setMassageDraftLangAware,
  getMassageDraftLangAware,
  isMassageLangScopedTextKey,
  removeMassageDraftKey,
  removeMassageDraftLangAware,
  clearMassageDraftsForCurrentTemplate,
  massageCurrentTemplateHasDraftKeys,
  getMassageTemplateSlot,
  setMassageTemplateSlot,
} from '@/lib/massage-draft'
import {
  PREMIUM_MASSAGE_SLOT,
  isMassageOrdinaryTemplateId,
  type MassageOrdinaryTemplateId,
  type MassageTemplateSlotId,
} from '@/lib/massage-template-registry'
import {
  MASSAGE_BODY_PATTERN_BY_TEMPLATE,
  MASSAGE_BODY_PATTERN_ORDER,
} from '@/lib/massage-body-patterns'
import {
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
  formatCatalogPriceDisplay,
  mergeMassageSubscriptionsFromDraft,
  serializeMassageSubscriptionsForDraft,
  MASSAGE_SUBSCRIPTION_PRESETS,
  MASSAGE_SUBSCRIPTION_PRESET_COUNT,
  mergeMassageSpecsFromDraft,
  serializeMassageSpecsForDraft,
  createMassageSpecFromTemplate,
  MASSAGE_SPECS_MAX,
} from '@/lib/massage-template-model'
import MassageTemplate from '@/components/public/MassageTemplate'
import { compressImageForLogo, compressImageForHeroBg, compressImageForCatalog } from '@/lib/compress-image'
import {
  HERO_VIDEO_USE_IDB_MIN_BYTES,
  MASSAGE_HERO_VIDEO_IDB_MARKER,
  saveMassageHeroVideoBlob,
} from '@/lib/massage-hero-video-idb'
import { type PublicSiteLang, getEnabledSiteLangs, setEnabledSiteLangs } from '@/lib/public-site-langs'

function catalogProductFileInputId(productId: string): string {
  return `massage-catalog-file-${productId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}
function specFileInputId(specId: string): string {
  return `massage-spec-file-${specId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}
import {
  MASSAGE_HEADER_TEXT_OPTIONS,
  parseMassageThemeColors,
  type MassageThemeColors,
} from '@/lib/massage-theme-palette'
import { DEFAULT_WORLD_MAP_EMBED_URL } from '@/lib/hair-theme-defaults'
type Lang = 'ru' | 'en' | 'ro'

const SITE_LANG_ORDER: PublicSiteLang[] = ['ru', 'en', 'ro']

const MASSAGE_BLOCKS = [
  { id: 'header', ru: 'Шапка сайта', en: 'Site header', ro: 'Antet site' },
  { id: 'services', ru: 'Услуги', en: 'Services', ro: 'Servicii' },
  { id: 'about', ru: 'О салоне', en: 'About', ro: 'Despre noi' },
  { id: 'gallery', ru: 'Галерея', en: 'Gallery', ro: 'Galerie' },
  { id: 'subscriptions', ru: 'Абонементы', en: 'Subscriptions', ro: 'Abonamente' },
  { id: 'catalog', ru: 'Каталог', en: 'Catalog', ro: 'Catalog' },
  { id: 'specialists', ru: 'Специалисты', en: 'Specialists', ro: 'Specialiști' },
  { id: 'cta', ru: 'Блок записи', en: 'Booking block', ro: 'Bloc programare' },
  { id: 'contacts', ru: 'Контакты', en: 'Contacts', ro: 'Contacte' },
] as const

/** Те же блоки, что в конструкторе салона (PublicPage) — превью идентично обычным темам */
const SALON_PREVIEW_BLOCKS = [
  { id: 'header', ru: 'Шапка сайта', en: 'Site header', ro: 'Antet site' },
  { id: 'gallery', ru: 'Фотографии салона', en: 'Salon photos', ro: 'Fotografii salon' },
  { id: 'booking', ru: 'Запись клиентов', en: 'Client booking', ro: 'Programare clienți' },
  { id: 'works', ru: 'Галерея работ', en: 'Work gallery', ro: 'Galerie lucrări' },
  { id: 'map', ru: 'Карта и адрес', en: 'Map & address', ro: 'Hartă și adresă' },
  { id: 'footer', ru: 'Контактная информация', en: 'Contact information', ro: 'Informații de contact' },
] as const

/** Иконки выбора темы: классический, тайский, стоун, антистресс, спортивный */
const MASSAGE_CONSTRUCTOR_THEMES: { id: MassageOrdinaryTemplateId; icon: string }[] = [
  { id: 'hair', icon: iconMassageClassic },
  { id: 'barber', icon: iconMassageThai },
  { id: 'cosmetology', icon: iconMassageStone },
  { id: 'coloring', icon: iconMassageAntistress },
  { id: 'manicure', icon: iconMassageSports },
]

const THEME_SIDEBAR_LABEL_KEY: Record<MassageOrdinaryTemplateId, 'themeHair' | 'themeBarber' | 'themeCosmetology' | 'themeColoring' | 'themeManicure'> = {
  hair: 'themeHair',
  barber: 'themeBarber',
  cosmetology: 'themeCosmetology',
  coloring: 'themeColoring',
  manicure: 'themeManicure',
}

/** DOM id секций в MassageTemplate — для скролла и scrollspy */
const MASSAGE_BLOCK_ANCHOR_BY_ID: Record<(typeof MASSAGE_BLOCKS)[number]['id'], string> = {
  header: 'massage-block-header',
  services: 'our-services',
  about: 'about',
  gallery: 'gallery',
  subscriptions: 'promos',
  catalog: 'catalog',
  specialists: 'masters',
  cta: 'massage-block-cta',
  contacts: 'contacts',
}

const SOCIAL_FIELDS = [
  { key: 'publicTelegram', label: 'Telegram', placeholder: 'https://t.me/username' },
  { key: 'publicViber', label: 'Viber', placeholder: 'viber://chat?number=...' },
  { key: 'publicWhatsapp', label: 'WhatsApp', placeholder: 'https://wa.me/123456789' },
  { key: 'publicInstagram', label: 'Instagram', placeholder: 'https://instagram.com/username' },
  { key: 'publicFacebook', label: 'Facebook', placeholder: 'https://facebook.com/username' },
  { key: 'publicVk', label: 'VK', placeholder: 'https://vk.com/username' },
  { key: 'publicTwitter', label: 'X / Twitter', placeholder: 'https://x.com/username' },
  { key: 'publicTiktok', label: 'TikTok', placeholder: 'https://www.tiktok.com/@username' },
] as const

const UI: Record<Lang, Record<string, string>> = {
  ru: {
    constructorTitle: 'Конструктор сайта',
    back: 'Назад',
    fullSize: 'Полный размер',
    mobilePreview: 'Мобильный вид',
    webPreview: 'Веб-версия',
    save: 'Сохранить',
    saved: 'Сохранено ✓',
    close: 'Закрыть',
    allBlocks: 'Все блоки',
    chooseTheme: 'Выбор темы',
    templateHeading: 'Шаблон',
    templatesStandard: 'Стандартные шаблоны',
    templatesPremium: 'Премиум шаблоны',
    themePremiumMassage: 'Премиум студия',
    themeHair: 'Классический',
    themeBarber: 'Тайский массаж',
    themeCosmetology: 'Стоун-терапия',
    themeColoring: 'Антистресс',
    themeManicure: 'Спортивный',
    sitePageBgPattern: 'Фон страницы',
    sitePageBgPatternHint:
      'Нажмите миниатюру — паттерн применится к фону сайта в превью. Без выбора используется фон текущего шаблона.',
    siteLangs: 'Языки на сайте',
    siteLangsHint: 'Отметьте языки, на которых будет доступен сайт. Один — переключатель скрыт.',
    langPickRu: 'Русский',
    langPickEn: 'English',
    langPickRo: 'Română',
    editThisTheme: 'Редактировать эту тему',
    mySite: 'Мой сайт',
    myLastEdits:
      'Последние правки для этой темы. Исходный шаблон в библиотеке не меняется.',
    open: 'Открыть',
    eraseBtn: 'Стереть',
    deleteMySite: 'Стереть изменения?',
    deleteMySiteDesc:
      'Удалить все сохранённые правки этого шаблона (тексты, фото, цвета) и вернуть вид по умолчанию?',
    yes: 'Да',
    designAlready: 'Изначальный дизайн уже используется',
    undoToDesign: 'Вернуть к изначальному дизайну шаблона',
    noUndo: 'Нет изменений для отмены',
    undoLastChange: 'Отменить последнее изменение',
    previewEditHint:
      'Нажмите на текст в превью. Заголовок hero, подзаголовок и подписи кнопок («Записаться онлайн», «Где нас найти») задаются отдельно для каждого языка (переключатель языка на сайте).',
    blockSettingsLater: 'Настройки этого блока появятся позже',
    subsAllAdded: 'Все варианты уже добавлены',
    templateLabel: 'Массажный салон',
    restoreDesign: 'Вернуть изначальный дизайн',
    undoLast: 'Вернуть назад',
    socialLinks: 'Ссылки на соцсети',
    headerLogo: 'Логотип (шапка)',
    logoUpload: 'Загрузить логотип',
    logoChange: 'Сменить логотип',
    logoShape: 'Форма',
    shapeCircle: 'Круг',
    shapeRounded: 'Скруглённый',
    shapeSquare: 'Квадрат',
    showLogo: 'Показывать логотип',
    heroBg: 'Фон главного экрана',
    heroBgHint:
      'Можно загрузить фото или видео на задний план. Если загружены оба — показывается видео. Фото: jpg, png, webp… Видео: только файлы видео (mp4, webm…).',
    addVideo: 'Добавить видео',
    addPhoto: 'Добавить фото',
    addVideoOverPhoto: 'Добавить видео поверх фото',
    videoLoaded: 'Видео загружено',
    videoShownInHero: 'Показывается на главном экране',
    changeVideo: 'Сменить видео',
    changePhoto: 'Сменить фото',
    photoBg: 'Фото фона',
    remove: 'Убрать',
    removeBg: 'Сбросить фон (фото и видео)',
    colorTopBar: 'Фон верхней полосы (контакты)',
    colorNav: 'Фон меню навигации',
    colorNavLinks: 'Ссылки в меню',
    colorSiteName: 'Название салона',
    colorTagline: 'Теглайн',
    colorAddress: 'Адрес',
    colorContactOnline: 'Строка «онлайн»',
    colorCallUs: 'Строка «звоните»',
    colorPhone: 'Телефон',
    colorHero1: 'Hero — первая строка заголовка',
    colorHero2: 'Hero — вторая строка заголовка',
    colorHeroSub: 'Hero — подзаголовок',
    colorHeroPrimBtnBg: 'Hero — фон первой кнопки',
    colorHeroPrimBtnHover: 'Hero — первая кнопка (наведение)',
    colorHeroBtnBorder: 'Hero — рамка первой кнопки',
    colorHeroSecBtnBg: 'Hero — фон второй кнопки',
    colorHeroSecBtnHover: 'Hero — вторая кнопка (наведение)',
    colorHeroSecBtnBorder: 'Hero — рамка второй кнопки',
    byDefault: 'По умолчанию',
    colorsBlock: 'Цвета',
    servicesBlockHint:
      'Заголовки и текст в карточках редактируйте в превью. Здесь — фото для каждой карточки или режим без фото.',
    serviceCardN: 'Карточка',
    servicePhoto: 'Фото',
    svcAllNoPhoto: 'Все без фото',
    svcAllWithPhoto: 'Все с фото',
    colorSvcBlockTitle: 'Блок услуг — заголовок',
    colorSvcBlockSub: 'Блок услуг — подзаголовок',
    colorSvcCardTitle: 'Карточка — название',
    colorSvcCardDesc: 'Карточка — описание',
    colorSvcCardPrice: 'Карточка — цена',
    aboutBlockHint:
      'Три текста редактируйте в превью: Shift+Enter — новая строка. Здесь — фото основателя и цвета.',
    aboutFounderPhoto: 'Фото основателя (аватар)',
    aboutPhotoUpload: 'Загрузить фото',
    aboutPhotoChange: 'Сменить фото',
    colorAboutHeading: 'О салоне — главный заголовок',
    colorAboutBody: 'О салоне — основной текст',
    colorAboutMission: 'О салоне — миссия / подпись',
    galleryBlockHint:
      'Заголовок и подзаголовок галереи — в превью. Название каждой секции задайте здесь; до 6 секций, по 12 фото.',
    galleryAddSection: 'Добавить секцию',
    galleryNewSection: 'Новая секция',
    gallerySectionN: 'Секция',
    gallerySectionLabel: 'Название вкладки',
    gallerySlotPhoto: 'Фото',
    galleryColorSection: 'Цвета галереи',
    catalogBlockHint:
      'Заголовок блока и карточки редактируйте в превью: название, бренд, цена, старая цена, строки описания. Фото товара загружайте ниже — оно появится в верхней части карточки.',
    catalogHideBlock: 'Скрыть блок «Каталог» на сайте',
    catalogAddProduct: 'Добавить товар',
    catalogList: 'Товары',
    catalogProductN: 'Товар',
    catalogProductPhoto: 'Фото на карточке',
    catalogPhotoUpload: 'Загрузить фото',
    catalogPhotoHint: 'Показывается вверху карточки вместо градиента',
    catalogRemovePhoto: 'Убрать фото',
    specsBlockHint: 'Заголовок блока и карточки (имя, должность, опыт) редактируйте в превью. Фото загружайте ниже — оно займёт всю рамку карточки.',
    specsHideBlock: 'Скрыть блок «Специалисты» на сайте',
    specsAddCard: 'Добавить специалиста',
    specsList: 'Специалисты',
    specsCardN: 'Специалист',
    specsCardPhoto: 'Фото специалиста',
    specsPhotoUpload: 'Загрузить фото',
    specsPhotoHint: 'Показывается вместо градиента — на всю рамку',
    specsRemovePhoto: 'Убрать фото',
    colorGalTitle: 'Заголовок',
    colorGalSub: 'Подзаголовок',
    colorGalTabActive: 'Вкладки секций (один цвет)',
    subsBlockHint:
      'Заголовок блока редактируйте в превью. Добавляйте абонементы по скидке, ссылку на кнопку — ниже.',
    subsHideBlock: 'Скрыть блок «Абонементы» на сайте',
    subsHideCta: 'Скрыть кнопку акции в карточках',
    subsCtaUrl: 'Ссылка на кнопку акции',
    subsAddPreset: 'Добавить абонемент',
    subsPickPlaceholder: 'Выберите вариант (скидка)',
    subsList: 'Список',
    subsColorSection: 'Цвета абонементов',
    colorSubsBlockTitle: 'Заголовок блока',
    colorSubsCardTitle: 'Карточка — заголовок',
    colorSubsCardDesc: 'Карточка — подзаголовок',
    colorSubsCardBgFrom: 'Карточка — фон (старт)',
    colorSubsCardBgTo: 'Карточка — фон (конец)',
    colorSubsCtaText: 'Кнопка акции — текст',
    colorSubsCtaBg: 'Кнопка акции — фон',
    ctaHideBlock: 'Скрыть блок «Запись» на сайте',
    ctaBlockHint: 'Заголовок, текст и кнопку редактируйте в превью. Цвета блока — ниже.',
    ctaColorSection: 'Цвета блока записи',
    colorCtaBgFrom: 'Фон блока — начало градиента',
    colorCtaBgTo: 'Фон блока — конец градиента',
    colorCtaTitle: 'Заголовок',
    colorCtaSub: 'Подзаголовок',
    colorCtaBtnBg: 'Кнопка — фон',
    colorCtaBtnText: 'Кнопка — текст',
    contactsBlockHint:
      'Адрес: поиск с подсказками — карта обновится. Тексты и соцсети можно править в превью; ссылки — ниже. В режиме редактирования карта не кликается.',
    contactsAddressTitle: 'Адрес на карте',
    contactsAddressPlaceholder: 'Начните вводить адрес…',
    contactsSearching: 'Поиск…',
    contactsSocialSection: 'Ссылки на мессенджеры и соцсети',
    contactsColorSection: 'Цвета блока «Контакты»',
    colorContactsBlockTitle: 'Заголовок секции',
    colorContactsSectionHeading: 'Подзаголовок «Наши контакты»',
    colorContactsIcon: 'Иконки',
    colorContactsBody: 'Текст (адрес, график, телефон, email)',
    colorContactsLabel: 'Подписи и подпись над картой',
    salonHeroColorsNote:
      'Ниже — цвета баннера как на этой странице превью (без верхней полосы и меню премиум-шаблона). Тексты правьте в превью.',
    salonColorBannerTitle: 'Баннер — название салона',
    salonColorBannerSub: 'Баннер — текст под названием',
    salonGalleryHint: 'Заголовок блока и фотографии сетки редактируйте в превью. Здесь — цвет заголовка «Фотографии салона».',
    salonBookingHint: 'Заголовок и подзаголовок над формой записи редактируйте в превью. Здесь — их цвета.',
    salonWorksHint: 'Карусель и подписи настраиваются в превью. Здесь — цвет заголовка «Галерея работ» и подписей к снимкам.',
    salonMapHint: 'Адрес и встраиваемая карта — в превью или в блоке контактов. Здесь — цвет подписей над картой.',
    salonFooterHint:
      'Тексты в подвале редактируйте в превью. Здесь — цвета названия салона, подписей колонок (адрес, график…), значений, разделителей между колонками.',
  },
  en: {
    constructorTitle: 'Site Constructor',
    back: 'Back',
    fullSize: 'Full size',
    mobilePreview: 'Mobile view',
    webPreview: 'Web version',
    save: 'Save',
    saved: 'Saved ✓',
    close: 'Close',
    allBlocks: 'All blocks',
    chooseTheme: 'Choose theme',
    templateHeading: 'Template',
    templatesStandard: 'Standard templates',
    templatesPremium: 'Premium templates',
    themePremiumMassage: 'Premium studio',
    themeHair: 'Classic',
    themeBarber: 'Thai massage',
    themeCosmetology: 'Stone therapy',
    themeColoring: 'Antistress',
    themeManicure: 'Sports',
    sitePageBgPattern: 'Page background',
    sitePageBgPatternHint:
      'Tap a thumbnail to apply that pattern in the preview. If none is saved, the current template’s pattern is used.',
    siteLangs: 'Site languages',
    siteLangsHint: 'Select languages for the site. One language — the flag switcher is hidden.',
    langPickRu: 'Russian',
    langPickEn: 'English',
    langPickRo: 'Romanian',
    editThisTheme: 'Edit this theme',
    mySite: 'My site',
    myLastEdits: 'Latest edits for this theme. The original template in the library is unchanged.',
    open: 'Open',
    eraseBtn: 'Erase',
    deleteMySite: 'Erase changes?',
    deleteMySiteDesc:
      'Remove all saved edits for this template (text, photos, colors) and restore the default look?',
    yes: 'Yes',
    designAlready: 'Original design is already in use',
    undoToDesign: 'Restore template original design',
    noUndo: 'No changes to undo',
    undoLastChange: 'Undo last change',
    previewEditHint:
      'Click text in the preview to edit. The hero title, subtitle, and button labels (“Book online”, “Where to find us?”) are set per language (site language switcher).',
    blockSettingsLater: 'Settings for this block will be added later',
    subsAllAdded: 'All options are already added',
    templateLabel: 'Massage salon',
    restoreDesign: 'Restore original design',
    undoLast: 'Undo last step',
    socialLinks: 'Social media links',
    headerLogo: 'Logo (header)',
    logoUpload: 'Upload logo',
    logoChange: 'Change logo',
    logoShape: 'Shape',
    shapeCircle: 'Circle',
    shapeRounded: 'Rounded',
    shapeSquare: 'Square',
    showLogo: 'Show logo',
    heroBg: 'Hero background',
    heroBgHint:
      'Upload a photo or video for the background. If both are set, video is shown. Images: jpg, png, webp… Video: video files only (mp4, webm…).',
    addVideo: 'Add video',
    addPhoto: 'Add photo',
    addVideoOverPhoto: 'Add video over photo',
    videoLoaded: 'Video loaded',
    videoShownInHero: 'Shown on hero',
    changeVideo: 'Change video',
    changePhoto: 'Change photo',
    photoBg: 'Photo background',
    remove: 'Remove',
    removeBg: 'Reset background (photo & video)',
    colorTopBar: 'Top bar background',
    colorNav: 'Navigation bar background',
    colorNavLinks: 'Menu links',
    colorSiteName: 'Salon name',
    colorTagline: 'Tagline',
    colorAddress: 'Address',
    colorContactOnline: '“Online” line',
    colorCallUs: '“Call us” line',
    colorPhone: 'Phone',
    colorHero1: 'Hero — title line 1',
    colorHero2: 'Hero — title line 2',
    colorHeroSub: 'Hero — subtitle',
    colorHeroPrimBtnBg: 'Hero — first button background',
    colorHeroPrimBtnHover: 'Hero — first button (hover)',
    colorHeroBtnBorder: 'Hero — first button border',
    colorHeroSecBtnBg: 'Hero — second button background',
    colorHeroSecBtnHover: 'Hero — second button (hover)',
    colorHeroSecBtnBorder: 'Hero — second button border',
    byDefault: 'Default',
    colorsBlock: 'Colors',
    servicesBlockHint:
      'Edit titles and card text in the preview. Here — photo per card or no-photo mode.',
    serviceCardN: 'Card',
    servicePhoto: 'Photo',
    svcAllNoPhoto: 'All without photo',
    svcAllWithPhoto: 'All with photo area',
    colorSvcBlockTitle: 'Services block — title',
    colorSvcBlockSub: 'Services block — subtitle',
    colorSvcCardTitle: 'Card — title',
    colorSvcCardDesc: 'Card — description',
    colorSvcCardPrice: 'Card — price',
    aboutBlockHint:
      'Edit all three texts in the preview: Shift+Enter for a new line. Here — founder photo and colors.',
    aboutFounderPhoto: 'Founder photo (avatar)',
    aboutPhotoUpload: 'Upload photo',
    aboutPhotoChange: 'Change photo',
    colorAboutHeading: 'About — main headline',
    colorAboutBody: 'About — body text',
    colorAboutMission: 'About — mission / tagline',
    galleryBlockHint:
      'Gallery title and subtitle — in the preview. Set each section name here; up to 6 sections, 12 photos each.',
    galleryAddSection: 'Add section',
    galleryNewSection: 'New section',
    gallerySectionN: 'Section',
    gallerySectionLabel: 'Tab label',
    gallerySlotPhoto: 'Photo',
    galleryColorSection: 'Gallery colors',
    catalogBlockHint:
      'Edit the block title and cards in the preview: name, brand, current and old price, spec lines. Upload product photos below — they appear at the top of each card.',
    catalogHideBlock: 'Hide the Catalog block on the site',
    catalogAddProduct: 'Add product',
    catalogList: 'Products',
    catalogProductN: 'Product',
    catalogProductPhoto: 'Card photo',
    catalogPhotoUpload: 'Upload photo',
    catalogPhotoHint: 'Shown at the top of the card instead of the gradient',
    catalogRemovePhoto: 'Remove photo',
    specsBlockHint: 'Edit the block title and card details (name, role, experience) in the preview. Upload photos below — they will fill the entire card frame.',
    specsHideBlock: 'Hide the Specialists block on the site',
    specsAddCard: 'Add specialist',
    specsList: 'Specialists',
    specsCardN: 'Specialist',
    specsCardPhoto: 'Specialist photo',
    specsPhotoUpload: 'Upload photo',
    specsPhotoHint: 'Shown instead of the gradient — fills the entire frame',
    specsRemovePhoto: 'Remove photo',
    colorGalTitle: 'Title',
    colorGalSub: 'Subtitle',
    colorGalTabActive: 'Section tabs (one color)',
    subsBlockHint:
      'Edit the block title in the preview. Add subscriptions by discount; set the promo button link below.',
    subsHideBlock: 'Hide the Subscriptions block on the site',
    subsHideCta: 'Hide promo button in cards',
    subsCtaUrl: 'Promo button link',
    subsAddPreset: 'Add subscription',
    subsPickPlaceholder: 'Choose option (discount)',
    subsList: 'List',
    subsColorSection: 'Subscription colors',
    colorSubsBlockTitle: 'Block title',
    colorSubsCardTitle: 'Card — title',
    colorSubsCardDesc: 'Card — subtitle',
    colorSubsCardBgFrom: 'Card — background (from)',
    colorSubsCardBgTo: 'Card — background (to)',
    colorSubsCtaText: 'Promo button — text',
    colorSubsCtaBg: 'Promo button — background',
    ctaHideBlock: 'Hide the booking block on the site',
    ctaBlockHint: 'Edit the title, text, and button in the preview. Block colors are below.',
    ctaColorSection: 'Booking block colors',
    colorCtaBgFrom: 'Background — gradient start',
    colorCtaBgTo: 'Background — gradient end',
    colorCtaTitle: 'Title',
    colorCtaSub: 'Subtitle',
    colorCtaBtnBg: 'Button — background',
    colorCtaBtnText: 'Button — text',
    contactsBlockHint:
      'Address: search with suggestions — the map updates. Edit text and socials in the preview; paste links below. The map is non-interactive while editing.',
    contactsAddressTitle: 'Address on map',
    contactsAddressPlaceholder: 'Start typing an address…',
    contactsSearching: 'Searching…',
    contactsSocialSection: 'Messenger and social links',
    contactsColorSection: 'Contacts block colors',
    colorContactsBlockTitle: 'Section title',
    colorContactsSectionHeading: '“Our contacts” subtitle',
    colorContactsIcon: 'Icons',
    colorContactsBody: 'Body text (address, hours, phone, email)',
    colorContactsLabel: 'Labels and map caption',
    salonHeroColorsNote:
      'These colors match the banner on this preview page (no premium top bar or menu). Edit texts in the preview.',
    salonColorBannerTitle: 'Banner — salon name',
    salonColorBannerSub: 'Banner — text under the name',
    salonGalleryHint: 'Edit the block title and grid photos in the preview. Here — color of the “Salon photos” heading.',
    salonBookingHint: 'Edit the title and subtitle above the booking form in the preview. Here — their colors.',
    salonWorksHint: 'Carousel and captions are edited in the preview. Here — “Work gallery” heading and image label colors.',
    salonMapHint: 'Address and embed map — in the preview or contacts. Here — label colors above the map.',
    salonFooterHint:
      'Edit footer text in the preview. Here — salon name, column labels (address, hours…), values, and vertical dividers between columns.',
  },
  ro: {
    constructorTitle: 'Constructor site',
    back: 'Înapoi',
    fullSize: 'Dimensiune completă',
    mobilePreview: 'Vizualizare mobilă',
    webPreview: 'Versiune web',
    save: 'Salvează',
    saved: 'Salvat ✓',
    close: 'Închide',
    allBlocks: 'Toate blocurile',
    chooseTheme: 'Alege tema',
    templateHeading: 'Șablon',
    templatesStandard: 'Șabloane standard',
    templatesPremium: 'Șabloane premium',
    themePremiumMassage: 'Studio premium',
    themeHair: 'Clasic',
    themeBarber: 'Masaj thailandez',
    themeCosmetology: 'Terapie cu pietre',
    themeColoring: 'Antistres',
    themeManicure: 'Sportiv',
    sitePageBgPattern: 'Fundal pagină',
    sitePageBgPatternHint:
      'Atingeți o miniatură pentru a aplica modelul în previzualizare. Fără alegere se folosește fundalul șablonului curent.',
    siteLangs: 'Limbi pe site',
    siteLangsHint: 'Alegeți limbile site-ului. O singură limbă — fără comutator.',
    langPickRu: 'Rusă',
    langPickEn: 'Engleză',
    langPickRo: 'Română',
    editThisTheme: 'Editează această temă',
    mySite: 'Site-ul meu',
    myLastEdits: 'Ultimele modificări pentru această temă. Șablonul original nu este modificat.',
    open: 'Deschide',
    eraseBtn: 'Șterge',
    deleteMySite: 'Ștergeți modificările?',
    deleteMySiteDesc: 'Sunteți sigur că doriți să ștergeți ultimele modificări din acest șablon?',
    yes: 'Da',
    designAlready: 'Designul original este deja folosit',
    undoToDesign: 'Restaurează designul original al șablonului',
    noUndo: 'Nicio modificare de anulat',
    undoLastChange: 'Anulează ultima modificare',
    previewEditHint:
      'Faceți clic pe text în previzualizare. Titlul hero, subtitlul și etichetele butoanelor („Programează-te online”, „Unde ne găsiți?”) sunt setate separat pentru fiecare limbă (comutatorul de limbă de pe site).',
    blockSettingsLater: 'Setările acestui bloc vor apărea mai târziu',
    subsAllAdded: 'Toate variantele sunt deja adăugate',
    templateLabel: 'Salon de masaj',
    restoreDesign: 'Restabiliți designul inițial',
    undoLast: 'Înapoi un pas',
    socialLinks: 'Linkuri rețele sociale',
    headerLogo: 'Logo (antet)',
    logoUpload: 'Încarcă logo',
    logoChange: 'Schimbă logo',
    logoShape: 'Formă',
    shapeCircle: 'Cerc',
    shapeRounded: 'Rotunjit',
    shapeSquare: 'Pătrat',
    showLogo: 'Arată logo',
    heroBg: 'Fundal hero',
    heroBgHint: 'Încărcați o imagine pentru fundal. Doar formate imagine: jpg, png, webp etc.',
    heroBgUpload: 'Încarcă fundalul',
    heroBgChange: 'Înlocuiește fundalul',
    removeBg: 'Elimină fundalul',
    remove: 'Elimină',
    colorTopBar: 'Fundal bară superioară',
    colorNav: 'Fundal meniu navigare',
    colorNavLinks: 'Linkuri meniu',
    colorSiteName: 'Nume salon',
    colorTagline: 'Slogan',
    colorAddress: 'Adresă',
    colorContactOnline: 'Rând „online”',
    colorCallUs: 'Rând „sună”',
    colorPhone: 'Telefon',
    colorHero1: 'Hero — titlu linia 1',
    colorHero2: 'Hero — titlu linia 2',
    colorHeroSub: 'Hero — subtitlu',
    colorHeroPrimBtnBg: 'Hero — fundal primul buton',
    colorHeroPrimBtnHover: 'Hero — primul buton (hover)',
    colorHeroBtnBorder: 'Hero — margine primul buton',
    colorHeroSecBtnBg: 'Hero — fundal al doilea buton',
    colorHeroSecBtnHover: 'Hero — al doilea buton (hover)',
    colorHeroSecBtnBorder: 'Hero — margine al doilea buton',
    byDefault: 'Implicit',
    colorsBlock: 'Culori',
    servicesBlockHint:
      'Editați titlurile și textul în previzualizare. Aici — fotografie pentru fiecare card sau fără foto.',
    serviceCardN: 'Card',
    servicePhoto: 'Foto',
    svcAllNoPhoto: 'Toate fără foto',
    svcAllWithPhoto: 'Toate cu zonă foto',
    colorSvcBlockTitle: 'Bloc servicii — titlu',
    colorSvcBlockSub: 'Bloc servicii — subtitlu',
    colorSvcCardTitle: 'Card — titlu',
    colorSvcCardDesc: 'Card — descriere',
    colorSvcCardPrice: 'Card — preț',
    aboutBlockHint:
      'Editați cele trei texte în previzualizare: Shift+Enter pentru linie nouă. Aici — foto fondator și culori.',
    aboutFounderPhoto: 'Foto fondator (avatar)',
    aboutPhotoUpload: 'Încarcă foto',
    aboutPhotoChange: 'Schimbă foto',
    colorAboutHeading: 'Despre — titlu principal',
    colorAboutBody: 'Despre — text principal',
    colorAboutMission: 'Despre — misiune / semnătură',
    galleryBlockHint:
      'Titlul și subtitlul galeriei — în previzualizare. Numele fiecărei secțiuni — aici; până la 6 secțiuni, câte 12 fotografii.',
    galleryAddSection: 'Adaugă secțiune',
    galleryNewSection: 'Secțiune nouă',
    gallerySectionN: 'Secțiune',
    gallerySectionLabel: 'Nume filă',
    gallerySlotPhoto: 'Foto',
    galleryColorSection: 'Culori galerie',
    catalogBlockHint:
      'Titlul blocului și cardurile — în previzualizare: nume, brand, preț curent și vechi, linii descriere. Încărcați fotografiile produselor mai jos — apar în partea de sus a cardului.',
    catalogHideBlock: 'Ascunde blocul „Catalog” pe site',
    catalogAddProduct: 'Adaugă produs',
    catalogList: 'Produse',
    catalogProductN: 'Produs',
    catalogProductPhoto: 'Foto pe card',
    catalogPhotoUpload: 'Încarcă foto',
    catalogPhotoHint: 'Se afișează sus pe card în loc de gradient',
    catalogRemovePhoto: 'Elimină foto',
    specsBlockHint: 'Editați titlul blocului și detaliile cardurilor (nume, rol, experiență) în previzualizare. Încărcați fotografii mai jos — vor ocupa tot cadrul cardului.',
    specsHideBlock: 'Ascunde blocul „Specialiști" pe site',
    specsAddCard: 'Adaugă specialist',
    specsList: 'Specialiști',
    specsCardN: 'Specialist',
    specsCardPhoto: 'Foto specialist',
    specsPhotoUpload: 'Încarcă foto',
    specsPhotoHint: 'Se afișează în loc de gradient — pe tot cadrul',
    specsRemovePhoto: 'Elimină foto',
    colorGalTitle: 'Titlu',
    colorGalSub: 'Subtitlu',
    colorGalTabActive: 'File secțiuni (o culoare)',
    subsBlockHint:
      'Titlul blocului îl editați în previzualizare. Adăugați abonamente după reducere; linkul butonului — mai jos.',
    subsHideBlock: 'Ascunde blocul „Abonamente” pe site',
    subsHideCta: 'Ascunde butonul promoției în carduri',
    subsCtaUrl: 'Link buton promoție',
    subsAddPreset: 'Adaugă abonament',
    subsPickPlaceholder: 'Alegeți varianta (reducere)',
    subsList: 'Listă',
    subsColorSection: 'Culori abonamente',
    colorSubsBlockTitle: 'Titlu bloc',
    colorSubsCardTitle: 'Card — titlu',
    colorSubsCardDesc: 'Card — subtitlu',
    colorSubsCardBgFrom: 'Card — fundal (start)',
    colorSubsCardBgTo: 'Card — fundal (final)',
    colorSubsCtaText: 'Buton promoție — text',
    colorSubsCtaBg: 'Buton promoție — fundal',
    ctaHideBlock: 'Ascunde blocul de programare pe site',
    ctaBlockHint: 'Titlul, textul și butonul le editați în previzualizare. Culorile — mai jos.',
    ctaColorSection: 'Culori bloc programare',
    colorCtaBgFrom: 'Fundal — început gradient',
    colorCtaBgTo: 'Fundal — sfârșit gradient',
    colorCtaTitle: 'Titlu',
    colorCtaSub: 'Subtitlu',
    colorCtaBtnBg: 'Buton — fundal',
    colorCtaBtnText: 'Buton — text',
    contactsBlockHint:
      'Adresă: căutare cu sugestii — harta se actualizează. Textele și rețelele în previzualizare; linkurile mai jos. În editare harta nu e clicabilă.',
    contactsAddressTitle: 'Adresa pe hartă',
    contactsAddressPlaceholder: 'Introduceți adresa…',
    contactsSearching: 'Se caută…',
    contactsSocialSection: 'Linkuri mesagerie și rețele',
    contactsColorSection: 'Culori bloc contacte',
    colorContactsBlockTitle: 'Titlu secțiune',
    colorContactsSectionHeading: 'Subtitlu contacte',
    colorContactsIcon: 'Pictograme',
    colorContactsBody: 'Text (adresă, program, telefon, email)',
    colorContactsLabel: 'Etichete și titlu deasupra hărții',
    salonHeroColorsNote:
      'Culorile de mai jos corespund bannerului din această previzualizare (fără bara de sus din șablonul premium). Textele le editați în previzualizare.',
    salonColorBannerTitle: 'Banner — numele salonului',
    salonColorBannerSub: 'Banner — text sub titlu',
    salonGalleryHint:
      'Titlul blocului și fotografiile din grilă le editați în previzualizare. Aici — culoarea titlului „Fotografii salon”.',
    salonBookingHint: 'Titlul și subtitlul deasupra formularului le editați în previzualizare. Aici — culorile lor.',
    salonWorksHint:
      'Caruselul și legendele le editați în previzualizare. Aici — titlul „Galerie lucrări” și culoarea textului pe imagini.',
    salonMapHint: 'Adresa și harta — în previzualizare sau la contacte. Aici — culorile etichetelor deasupra hărții.',
    salonFooterHint:
      'Textele din subsol le editați în previzualizare. Aici — numele salonului, etichetele coloanelor (adresă, program…), valorile și separatorii verticali.',
  },
}

const MAX_UNDO = 20
const UNDO_MAX_VALUE_LEN = 50_000
const UNDO_SKIP_KEYS = new Set([
  'publicMassageCatalogJson',
  'publicMassageSpecsJson',
  'publicMassageGalleryJson',
  'publicMassageHeroBg',
  'publicMassageHeroVideo',
  'publicMassageAboutAvatar',
  'publicLogo',
])

type UndoEntry = { key: string; prev: string }

function MassageColorRow({
  label,
  colorKey,
  currentId,
  onPick,
  byDefaultLabel,
}: {
  label: string
  colorKey: keyof MassageThemeColors
  currentId: string
  onPick: (key: keyof MassageThemeColors, id: string) => void
  byDefaultLabel: string
}) {
  return (
    <div className="space-y-1.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5 items-center">
        {MASSAGE_HEADER_TEXT_OPTIONS.map(opt => (
          <button
            key={opt.id}
            type="button"
            className={cn(
              'h-7 w-7 rounded-full border-2 transition shrink-0',
              currentId === opt.id ? 'border-primary ring-2 ring-primary/30' : 'border-border/50'
            )}
            style={{ backgroundColor: opt.color }}
            onClick={() => onPick(colorKey, opt.id)}
            title={opt.id}
          />
        ))}
        <button
          type="button"
          className="px-2 py-1 rounded-full border border-border/50 text-xs text-muted-foreground hover:bg-card/50"
          onClick={() => onPick(colorKey, 'default')}
        >
          {byDefaultLabel}
        </button>
      </div>
    </div>
  )
}

export default function MassageConstructorPage() {
  const navigate = useNavigate()
  const sLang: Lang = (typeof window !== 'undefined' ? localStorage.getItem('publicLang') as Lang : null) ?? 'ru'
  const s = UI[sLang] ?? UI.ru

  const [sideOpen, setSideOpen] = useState(true)
  const [saved, setSaved] = useState(false)
  const [panelStage, setPanelStage] = useState<'themes' | 'edit'>('themes')
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
  const [highlightBlockId, setHighlightBlockId] = useState<string | null>('header')
  const [poll, setPoll] = useState(0)
  const [undoStack, setUndoStack] = useState<UndoEntry[]>([])
  /** После «Вернуть изначальный дизайн» кнопка кратко disabled, пока не будет нового изменения */
  const resetJustApplied = useRef(false)
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false)
  const [isSubsPresetOpen, setIsSubsPresetOpen] = useState(false)
  const subsPresetDropdownRef = useRef<HTMLDivElement | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [iframeLoadTick, setIframeLoadTick] = useState(0)
  const sidebarScrollRef = useRef<HTMLDivElement>(null)
  const contactAddrRef = useRef<HTMLDivElement>(null)
  const [contactAddrQuery, setContactAddrQuery] = useState('')
  const [contactAddrResults, setContactAddrResults] = useState<Array<Record<string, unknown>>>([])
  const [contactAddrOpen, setContactAddrOpen] = useState(false)
  const [contactAddrFocused, setContactAddrFocused] = useState(false)
  const [contactAddrLoading, setContactAddrLoading] = useState(false)
  const [siteLangsPick, setSiteLangsPick] = useState<PublicSiteLang[]>(() =>
    typeof window !== 'undefined' ? getEnabledSiteLangs() : [...SITE_LANG_ORDER]
  )

  /** Тот же ключ, что у конструктора салона — единое поведение при переключении между конструкторами */
  const CONSTRUCTOR_MOBILE_PREVIEW_KEY = 'constructorPreviewMobile'
  const [previewMobileFrame, setPreviewMobileFrame] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return sessionStorage.getItem(CONSTRUCTOR_MOBILE_PREVIEW_KEY) === '1'
    } catch {
      return false
    }
  })
  const setPreviewMobileFramePersist = useCallback((next: boolean) => {
    setPreviewMobileFrame(next)
    try {
      sessionStorage.setItem(CONSTRUCTOR_MOBILE_PREVIEW_KEY, next ? '1' : '0')
    } catch {
      /* noop */
    }
  }, [])

  const [constructorShellNarrow, setConstructorShellNarrow] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia('(max-width: 639px)').matches : false
  )
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 639px)')
    const apply = () => setConstructorShellNarrow(mq.matches)
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (!constructorShellNarrow || !previewMobileFrame) return
    setPreviewMobileFramePersist(false)
  }, [constructorShellNarrow, previewMobileFrame, setPreviewMobileFramePersist])

  const toggleSiteLang = useCallback((code: PublicSiteLang) => {
    setSiteLangsPick(prev => {
      let next: PublicSiteLang[]
      if (prev.includes(code) && prev.length > 1) {
        next = prev.filter(c => c !== code)
      } else {
        next = SITE_LANG_ORDER.filter(c => prev.includes(c) || c === code)
      }
      setEnabledSiteLangs(next)
      return next
    })
  }, [])

  const draft = useCallback(
    (key: string) =>
      isMassageLangScopedTextKey(key) ? getMassageDraftLangAware(key, sLang) : getMassageDraft(key),
    [poll, sLang]
  )

  const notifyIframeDraft = useCallback(() => {
    try {
      iframeRef.current?.contentWindow?.postMessage({ type: 'constructorDraftChange' }, '*')
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const pub = localStorage.getItem('publicLang')
    if (pub === 'ru' || pub === 'en' || pub === 'ro') return
    const adm = localStorage.getItem('language')
    if (adm === 'ru' || adm === 'en' || adm === 'ro') {
      try {
        localStorage.setItem('publicLang', adm)
      } catch {
        /* ignore */
      }
      setPoll((n) => n + 1)
    }
  }, [])

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'constructorPublicLangChanged' || e.data?.type === 'constructorMassageDraftChanged') {
        setPoll((n) => n + 1)
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [])

  /** Превью в iframe пишет в localStorage — в том же окне событие storage не срабатывает; слушаем для вкладок/редких случаев */
  useEffect(() => {
    const onStorage = (ev: StorageEvent) => {
      const k = ev.key
      if (!k) return
      if (k.startsWith(MASSAGE_DRAFT_PREFIX) || k === 'massageTemplateSlot') {
        setPoll((n) => n + 1)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  useEffect(() => {
    if (selectedBlockId !== 'contacts') return
    setContactAddrQuery(getMassageDraftLangAware('publicAddress', sLang))
  }, [selectedBlockId, poll, sLang])

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node
      if (contactAddrRef.current && !contactAddrRef.current.contains(target)) {
        setContactAddrOpen(false)
        setContactAddrFocused(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    if (selectedBlockId !== 'contacts' || !contactAddrFocused) return
    const query = contactAddrQuery.trim()
    if (!query || query.length < 3) {
      setContactAddrResults([])
      setContactAddrOpen(false)
      setContactAddrLoading(false)
      return
    }
    setContactAddrLoading(true)
    const handle = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=8&accept-language=${sLang}&q=${encodeURIComponent(query)}`
        )
        const data = await response.json()
        const items = Array.isArray(data) ? data : []
        setContactAddrResults(items as Array<Record<string, unknown>>)
        setContactAddrOpen(true)
      } catch {
        setContactAddrResults([])
      } finally {
        setContactAddrLoading(false)
      }
    }, 350)
    return () => window.clearTimeout(handle)
  }, [contactAddrQuery, contactAddrFocused, selectedBlockId, sLang])

  useLayoutEffect(() => {
    const el = sidebarScrollRef.current
    if (el) el.scrollTop = 0
  }, [selectedBlockId, panelStage])

  const setDraft = useCallback(
    (key: string, value: string) => {
      if (!UNDO_SKIP_KEYS.has(key)) {
        const prev = isMassageLangScopedTextKey(key)
          ? getMassageDraftLangAware(key, sLang)
          : getMassageDraft(key)
        if (prev.length <= UNDO_MAX_VALUE_LEN) {
          setUndoStack(stack => [...stack, { key, prev }].slice(-MAX_UNDO))
        }
      }
      if (isMassageLangScopedTextKey(key)) setMassageDraftLangAware(key, sLang, value)
      else setMassageDraft(key, value)
      setPoll(n => n + 1)
      queueMicrotask(() => notifyIframeDraft())
    },
    [notifyIframeDraft, sLang]
  )

  const handleUndo = useCallback(() => {
    setUndoStack(stack => {
      if (stack.length === 0) return stack
      const last = stack[stack.length - 1]
      if (last.prev) {
        if (isMassageLangScopedTextKey(last.key)) setMassageDraftLangAware(last.key, sLang, last.prev)
        else setMassageDraft(last.key, last.prev)
      } else {
        if (isMassageLangScopedTextKey(last.key)) removeMassageDraftLangAware(last.key, sLang)
        else removeMassageDraftKey(last.key)
      }
      setPoll(n => n + 1)
      queueMicrotask(() => notifyIframeDraft())
      return stack.slice(0, -1)
    })
  }, [notifyIframeDraft, sLang])

  const handleRestore = useCallback(() => {
    resetJustApplied.current = true
    clearMassageDraftsForCurrentTemplate()
    setUndoStack([])
    setContactAddrQuery('')
    setContactAddrOpen(false)
    setContactAddrResults([])
    setPoll(n => n + 1)
    queueMicrotask(() => notifyIframeDraft())
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      /* ignore */
    }
  }, [notifyIframeDraft])

  const handleClearMySiteConfirm = useCallback(() => {
    setShowClearConfirmModal(false)
    handleRestore()
  }, [handleRestore])

  const publicSlug = typeof window !== 'undefined' ? (localStorage.getItem('publicSlug') || 'salon') : 'salon'
  const massageSlotActive = useMemo(() => getMassageTemplateSlot(), [poll])

  const contactsSidebarMapSrc = useMemo(() => {
    const lat = Number.parseFloat(getMassageDraft('publicMapLat') || '')
    const lng = Number.parseFloat(getMassageDraft('publicMapLng') || '')
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=en`
    }
    return DEFAULT_WORLD_MAP_EMBED_URL
  }, [poll])

  const previewUrl = useMemo(() => {
    const q = new URLSearchParams()
    q.set('preview', '1')
    /** Приветственный экран выбора темы — без черновиков, иначе правки редактирования «лезут» в превью шаблона. */
    if (panelStage === 'themes' && massageSlotActive === PREMIUM_MASSAGE_SLOT) q.set('welcome', '1')
    /** Обычные 5 тем: на экране выбора — «чистый» шаблон без massage_draft (правки только в режиме редактирования). */
    if (panelStage === 'themes' && massageSlotActive !== PREMIUM_MASSAGE_SLOT) q.set('massageWelcome', '1')
    /** Обычные темы: edit=1 + сохранение hero в massage_draft (см. PublicPage massageHeroEditStorage). */
    if (panelStage === 'edit') q.set('edit', '1')
    if (previewMobileFrame) q.set('mobileFrame', '1')
    if (massageSlotActive === PREMIUM_MASSAGE_SLOT) {
      return spaRouteHref(`/massage-preview?${q.toString()}`)
    }
    q.set('massagePreview', '1')
    q.set('massageSlot', massageSlotActive)
    return spaRouteHref(`/b/${publicSlug}?${q.toString()}`)
  }, [panelStage, massageSlotActive, publicSlug, poll, previewMobileFrame])

  const previewBlocks =
    massageSlotActive === PREMIUM_MASSAGE_SLOT ? MASSAGE_BLOCKS : SALON_PREVIEW_BLOCKS
  /** Премиум — нижний sheet и затемнение; 5 обычных тем — та же боковая панель, что в ConstructorPage (салон). */
  const isPremiumMassageShell = massageSlotActive === PREMIUM_MASSAGE_SLOT

  const openFullSize = useCallback(() => {
    const slot = getMassageTemplateSlot()
    const narrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
    if (slot === PREMIUM_MASSAGE_SLOT) {
      const q = new URLSearchParams()
      q.set('preview', '1')
      q.set('full', '1')
      if (previewMobileFrame) q.set('mobileFrame', '1')
      q.set('_', String(Date.now()))
      const url = spaRouteHref(`/massage-preview?${q.toString()}`)
      if (narrow) window.location.assign(url)
      else window.open(url, '_blank')
      return
    }
    const q = new URLSearchParams()
    q.set('preview', '1')
    q.set('full', '1')
    q.set('massagePreview', '1')
    q.set('massageSlot', slot)
    if (previewMobileFrame) q.set('mobileFrame', '1')
    q.set('_', String(Date.now()))
    const url = spaRouteHref(`/b/${publicSlug}?${q.toString()}`)
    if (narrow) window.location.assign(url)
    else window.open(url, '_blank')
  }, [publicSlug, previewMobileFrame])

  const showFullSizeButton =
    panelStage === 'edit' && (constructorShellNarrow || !previewMobileFrame)

  const handleSave = useCallback(() => {
    setSaved(true)
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      /* ignore */
    }
    setTimeout(() => setSaved(false), 2000)
  }, [])

  const goToEdit = () => {
    setPanelStage('edit')
    setSelectedBlockId(null)
  }

  const goBackToThemes = () => {
    setPanelStage('themes')
    setSelectedBlockId(null)
  }

  const selectMassageTemplate = useCallback((id: MassageTemplateSlotId) => {
    setMassageTemplateSlot(id)
    setUndoStack([])
    setPoll((n) => n + 1)
    try {
      iframeRef.current?.contentWindow?.location?.reload()
    } catch {
      /* ignore */
    }
  }, [])

  const scrollPreviewToBlock = useCallback(
    (blockId: string) => {
      if (massageSlotActive !== PREMIUM_MASSAGE_SLOT) {
        try {
          iframeRef.current?.contentWindow?.postMessage({ type: 'scrollToSection', sectionId: blockId }, '*')
        } catch {
          /* ignore */
        }
        return
      }
      const doc = iframeRef.current?.contentDocument
      const anchorId = MASSAGE_BLOCK_ANCHOR_BY_ID[blockId as keyof typeof MASSAGE_BLOCK_ANCHOR_BY_ID]
      if (!doc || !anchorId) return
      doc.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    },
    [massageSlotActive]
  )

  /** Подсветка по скроллу — только для премиум-массажа (MassageTemplate); в PublicPage — только по клику */
  useEffect(() => {
    if (panelStage !== 'edit' || selectedBlockId !== null) return
    if (massageSlotActive !== PREMIUM_MASSAGE_SLOT) return

    const iframe = iframeRef.current
    const win = iframe?.contentWindow
    const doc = iframe?.contentDocument
    if (!win || !doc?.documentElement) return

    const getRelativeTop = (el: HTMLElement) => {
      const cr = doc.documentElement.getBoundingClientRect()
      const er = el.getBoundingClientRect()
      return er.top - cr.top + win.scrollY
    }

    let raf = 0
    const updateHighlight = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const scrollTop = win.scrollY || doc.documentElement.scrollTop
        const threshold = scrollTop + Math.min(140, win.innerHeight * 0.12)
        let active: string = MASSAGE_BLOCKS[0].id
        for (const block of MASSAGE_BLOCKS) {
          const el = doc.getElementById(MASSAGE_BLOCK_ANCHOR_BY_ID[block.id])
          if (!el) continue
          const top = getRelativeTop(el)
          if (top <= threshold) active = block.id
        }
        setHighlightBlockId(active)
      })
    }

    updateHighlight()
    win.addEventListener('scroll', updateHighlight, { passive: true })
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(updateHighlight) : null
    ro?.observe(doc.documentElement)
    return () => {
      cancelAnimationFrame(raf)
      win.removeEventListener('scroll', updateHighlight)
      ro?.disconnect()
    }
  }, [panelStage, selectedBlockId, poll, iframeLoadTick, massageSlotActive])

  const massageThemeColors = useMemo(
    () => parseMassageThemeColors(getMassageDraft('publicMassageThemeColors')),
    [poll]
  )

  const setThemeColor = useCallback(
    (key: keyof MassageThemeColors, id: string) => {
      const prev = parseMassageThemeColors(getMassageDraft('publicMassageThemeColors'))
      const next = { ...prev } as Record<string, string | undefined>
      if (id === 'default') {
        delete next[key]
      } else {
        next[key] = id
      }
      setDraft('publicMassageThemeColors', JSON.stringify(next))
    },
    [setDraft]
  )

  const curColor = useCallback(
    (key: keyof MassageThemeColors) => massageThemeColors[key] || 'default',
    [massageThemeColors]
  )

  const applyServiceImage = useCallback(
    (index: number, dataUrl: string) => {
      const m = mergeMassageServicesFromDraft(sLang, getMassageDraft('publicMassageServicesJson'))
      m[index] = { ...m[index], image: dataUrl, hideImage: false }
      setDraft('publicMassageServicesJson', serializeMassageServicesForDraft(m))
    },
    [sLang, setDraft]
  )

  const applyAllServicesHideImage = useCallback(
    (hide: boolean) => {
      const m = mergeMassageServicesFromDraft(sLang, getMassageDraft('publicMassageServicesJson'))
      const next = m.map(row => ({
        ...row,
        hideImage: hide,
        image: hide ? undefined : row.image,
      }))
      setDraft('publicMassageServicesJson', serializeMassageServicesForDraft(next))
    },
    [sLang, setDraft]
  )

  const applyGalleryPhoto = useCallback(
    (sectionIndex: number, photoIndex: number, dataUrl: string) => {
      const cur = mergeMassageGalleryFromDraft(sLang, getMassageDraft('publicMassageGalleryJson'))
      const next = cur.map((row, i) => {
        if (i !== sectionIndex) return row
        const photos = [...row.photos]
        if (photoIndex >= 0 && photoIndex < MASSAGE_GALLERY_PHOTOS_PER_SECTION) {
          photos[photoIndex] = dataUrl
        }
        return { ...row, photos }
      })
      setDraft('publicMassageGalleryJson', serializeMassageGalleryForDraft(next))
    },
    [sLang, setDraft]
  )

  const appendGallerySection = useCallback(() => {
    const cur = mergeMassageGalleryFromDraft(sLang, getMassageDraft('publicMassageGalleryJson'))
    if (cur.length >= MASSAGE_GALLERY_MAX_SECTIONS) return
    const label = UI[sLang]?.galleryNewSection ?? 'New section'
    const next = [
      ...cur,
      {
        id: `g-${Date.now()}`,
        label,
        photos: Array(MASSAGE_GALLERY_PHOTOS_PER_SECTION).fill(null) as (string | null)[],
      },
    ]
    setDraft('publicMassageGalleryJson', serializeMassageGalleryForDraft(next))
  }, [sLang, setDraft])

  const setGallerySectionLabel = useCallback(
    (sectionIndex: number, label: string) => {
      const cur = mergeMassageGalleryFromDraft(sLang, getMassageDraft('publicMassageGalleryJson'))
      const clipped = label.slice(0, MASSAGE_GALLERY_TAB_LABEL_MAX)
      const next = cur.map((row, i) => (i === sectionIndex ? { ...row, label: clipped } : row))
      setDraft('publicMassageGalleryJson', serializeMassageGalleryForDraft(next))
    },
    [sLang, setDraft]
  )

  const appendCatalogProduct = useCallback(() => {
    const cur = mergeMassageCatalogFromDraft(sLang, getMassageDraft('publicMassageCatalogJson'))
    if (cur.length >= MASSAGE_CATALOG_MAX) return
    const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const next = [...cur, createMassageCatalogProductFromTemplate(sLang, cur.length, id)]
    setDraft('publicMassageCatalogJson', serializeMassageCatalogForDraft(next))
  }, [sLang, setDraft])

  const removeCatalogProductById = useCallback(
    (productId: string) => {
      const cur = mergeMassageCatalogFromDraft(sLang, getMassageDraft('publicMassageCatalogJson'))
      const next = cur.filter(row => row.id !== productId)
      setDraft('publicMassageCatalogJson', serializeMassageCatalogForDraft(next))
    },
    [sLang, setDraft]
  )

  const applyCatalogImage = useCallback(
    (productId: string, dataUrl: string) => {
      const cur = mergeMassageCatalogFromDraft(sLang, getMassageDraft('publicMassageCatalogJson'))
      const next = cur.map(row => (row.id === productId ? { ...row, image: dataUrl } : row))
      setDraft('publicMassageCatalogJson', serializeMassageCatalogForDraft(next))
    },
    [sLang, setDraft]
  )

  const clearCatalogImage = useCallback(
    (productId: string) => {
      const cur = mergeMassageCatalogFromDraft(sLang, getMassageDraft('publicMassageCatalogJson'))
      const next = cur.map(row =>
        row.id === productId ? { ...row, image: undefined } : row
      )
      setDraft('publicMassageCatalogJson', serializeMassageCatalogForDraft(next))
    },
    [sLang, setDraft]
  )

  const appendSpec = useCallback(() => {
    const cur = mergeMassageSpecsFromDraft(sLang, getMassageDraft('publicMassageSpecsJson'))
    if (cur.length >= MASSAGE_SPECS_MAX) return
    const id = `spec-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const next = [...cur, createMassageSpecFromTemplate(sLang, cur.length, id)]
    setDraft('publicMassageSpecsJson', serializeMassageSpecsForDraft(next))
  }, [sLang, setDraft])

  const removeSpecById = useCallback(
    (specId: string) => {
      const cur = mergeMassageSpecsFromDraft(sLang, getMassageDraft('publicMassageSpecsJson'))
      const next = cur.filter(row => row.id !== specId)
      setDraft('publicMassageSpecsJson', serializeMassageSpecsForDraft(next))
    },
    [sLang, setDraft]
  )

  const applySpecImage = useCallback(
    (specId: string, dataUrl: string) => {
      const cur = mergeMassageSpecsFromDraft(sLang, getMassageDraft('publicMassageSpecsJson'))
      const next = cur.map(row => (row.id === specId ? { ...row, image: dataUrl } : row))
      setDraft('publicMassageSpecsJson', serializeMassageSpecsForDraft(next))
    },
    [sLang, setDraft]
  )

  const clearSpecImage = useCallback(
    (specId: string) => {
      const cur = mergeMassageSpecsFromDraft(sLang, getMassageDraft('publicMassageSpecsJson'))
      const next = cur.map(row =>
        row.id === specId ? { ...row, image: undefined } : row
      )
      setDraft('publicMassageSpecsJson', serializeMassageSpecsForDraft(next))
    },
    [sLang, setDraft]
  )

  const removeSubItem = useCallback(
    (id: string) => {
      const cur = mergeMassageSubscriptionsFromDraft(sLang, getMassageDraft('publicMassageSubsJson'))
      const next = cur.filter(row => row.id !== id)
      setDraft('publicMassageSubsJson', serializeMassageSubscriptionsForDraft(next))
    },
    [sLang, setDraft]
  )

  const addSubPreset = useCallback(
    (templateIndex: number) => {
      const cur = mergeMassageSubscriptionsFromDraft(sLang, getMassageDraft('publicMassageSubsJson'))
      if (cur.some(x => x.templateIndex === templateIndex)) return
      const uniqCount = new Set(cur.map(x => x.templateIndex)).size
      if (uniqCount >= MASSAGE_SUBSCRIPTION_PRESET_COUNT) return
      const next = [...cur, { id: `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, templateIndex }]
      setDraft('publicMassageSubsJson', serializeMassageSubscriptionsForDraft(next))
    },
    [sLang, setDraft]
  )

  const hasDrafts = typeof window !== 'undefined' && massageCurrentTemplateHasDraftKeys()

  const sidebarTitle =
    selectedBlockId
      ? (previewBlocks.find(b => b.id === selectedBlockId)?.[sLang] ?? s.allBlocks)
      : panelStage === 'themes'
        ? s.chooseTheme
        : s.allBlocks

  /** Одна верхняя кнопка «назад»: из блока → к списку блоков, из списка → к выбору темы */
  const handleSidebarBack = () => {
    if (selectedBlockId != null) setSelectedBlockId(null)
    else goBackToThemes()
  }

  useEffect(() => {
    if (!isSubsPresetOpen) return
    const onDocDown = (e: MouseEvent) => {
      if (!subsPresetDropdownRef.current) return
      const target = e.target as Node | null
      if (target && !subsPresetDropdownRef.current.contains(target)) {
        setIsSubsPresetOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocDown)
    return () => document.removeEventListener('mousedown', onDocDown)
  }, [isSubsPresetOpen])

  useEffect(() => {
    if (selectedBlockId !== 'subscriptions') setIsSubsPresetOpen(false)
  }, [selectedBlockId])

  return (
    <div
      className="h-screen flex flex-col bg-background text-foreground overflow-hidden"
      data-constructor-shell="true"
    >
      {showClearConfirmModal ? (
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
              <h3 className="text-lg font-bold pr-10 mb-3 text-foreground">{s.deleteMySite}</h3>
              <p className="text-sm text-muted-foreground mb-6">{s.deleteMySiteDesc}</p>
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setShowClearConfirmModal(false)}>
                  {s.back}
                </Button>
                <Button onClick={handleClearMySiteConfirm} className="bg-primary text-primary-foreground hover:bg-primary/90">
                  {s.yes}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
      <header
        className={cn(
          'border-b border-border/50 bg-card/40 backdrop-blur supports-[backdrop-filter]:bg-card/60 shrink-0',
          isPremiumMassageShell ? 'z-40' : 'relative z-50'
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4 px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/settings')} className="shrink-0 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation" aria-label={s.back}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-sm sm:text-lg font-semibold truncate">{s.constructorTitle}</h1>
          </div>
          <div className="flex items-center justify-end gap-1.5 sm:gap-2 flex-wrap">
            {previewMobileFrame ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 touch-manipulation bg-primary/10 border-primary/35"
                onClick={() => setPreviewMobileFramePersist(false)}
                aria-label={s.webPreview}
                title={s.webPreview}
              >
                <Monitor className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline text-xs sm:text-sm">{s.webPreview}</span>
              </Button>
            ) : (
              !constructorShellNarrow && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 touch-manipulation"
                  onClick={() => setPreviewMobileFramePersist(true)}
                  aria-label={s.mobilePreview}
                  title={s.mobilePreview}
                >
                  <Smartphone className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline text-xs sm:text-sm">{s.mobilePreview}</span>
                </Button>
              )
            )}
            {showFullSizeButton ? (
              <Button variant="outline" size="sm" className="gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 touch-manipulation" onClick={openFullSize}>
                <Maximize2 className="h-4 w-4 shrink-0" />
                <span className="hidden sm:inline text-xs sm:text-sm">{s.fullSize}</span>
              </Button>
            ) : null}
            <Button size="sm" className="gap-1.5 h-9 sm:h-10 px-2.5 sm:px-3 touch-manipulation" onClick={handleSave}>
              <Save className="h-4 w-4 shrink-0" />
              <span className="text-xs sm:text-sm max-w-[5.5rem] sm:max-w-none truncate">{saved ? s.saved : s.save}</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn('shrink-0 h-9 w-9 sm:h-10 sm:w-10 touch-manipulation', sideOpen && 'bg-primary/10 border-primary/30')}
              onClick={() => setSideOpen(o => !o)}
              aria-label={sideOpen ? s.close : s.allBlocks}
            >
              <PanelRightOpen className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden relative">
        {sideOpen && isPremiumMassageShell ? (
          <button
            type="button"
            className="absolute inset-0 z-20 bg-black/45 backdrop-blur-[2px] sm:hidden touch-manipulation"
            aria-label={s.close}
            onClick={() => setSideOpen(false)}
          />
        ) : null}
        <div
          className={cn(
            'flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden',
            isPremiumMassageShell ? 'p-2 sm:p-4' : 'p-4',
            previewMobileFrame && 'items-center bg-muted/25'
          )}
        >
          <div
            className={cn(
              'flex-1 min-w-0 min-h-0 border border-border/50 bg-card/20 overflow-hidden shadow-inner relative w-full',
              isPremiumMassageShell ? 'rounded-lg sm:rounded-xl' : 'rounded-xl',
              previewMobileFrame && 'max-w-[390px] ring-1 ring-border/50 shadow-xl'
            )}
          >
            <iframe
              key={previewUrl}
              ref={iframeRef}
              title="Massage preview"
              src={previewUrl}
              className={cn(
                'absolute inset-0 h-full w-full border-0 bg-background',
                isPremiumMassageShell ? 'rounded-lg sm:rounded-xl' : 'rounded-xl'
              )}
              onLoad={() => setIframeLoadTick((n) => n + 1)}
            />
          </div>
        </div>

        <div
          className={cn(
            'absolute flex flex-col overflow-hidden border border-border/50 transition-[transform] duration-300 ease-out',
            isPremiumMassageShell
              ? cn(
                  'z-30 isolate bg-card shadow-2xl',
                  'max-sm:inset-x-0 max-sm:bottom-0 max-sm:top-auto max-sm:max-h-[min(78vh,640px)] max-sm:w-full max-sm:rounded-b-none max-sm:rounded-t-2xl max-sm:border-b-0 max-sm:border-x-0',
                  'sm:top-4 sm:right-4 sm:bottom-4 sm:left-auto sm:w-[280px] sm:rounded-xl',
                  'pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]',
                  sideOpen
                    ? 'max-sm:translate-y-0 sm:translate-x-0'
                    : 'max-sm:translate-y-[calc(100%+12px)] sm:translate-x-[calc(100%+1rem)]'
                )
              : cn(
                  'z-40 bg-card/95 shadow-xl backdrop-blur max-sm:left-3 max-sm:right-3 max-sm:top-2 max-sm:max-h-[min(520px,72vh)] max-sm:w-auto max-sm:rounded-xl sm:bottom-4 sm:left-auto sm:right-4 sm:top-4 sm:z-30 sm:w-[280px] sm:max-h-none',
                  sideOpen
                    ? 'translate-x-0'
                    : 'max-sm:translate-x-[calc(100%+2.5rem)] sm:translate-x-[calc(100%+1rem)]'
                )
          )}
        >
          {isPremiumMassageShell ? (
            <div className="flex sm:hidden justify-center pt-2 pb-1 shrink-0" aria-hidden>
              <span className="h-1 w-10 rounded-full bg-muted-foreground/25" />
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-2 px-3 py-2.5 border-b border-border/40 shrink-0">
            <span className="font-semibold text-foreground text-sm truncate min-w-0 pr-2">{sidebarTitle}</span>
            <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 touch-manipulation" onClick={() => setSideOpen(false)} aria-label={s.close}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div ref={sidebarScrollRef} className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-3 sm:p-3 flex flex-col gap-4 scrollbar-hide overscroll-contain">
            {panelStage === 'themes' && (
              <>
                {/* Тот же визуальный паттерн, что в ConstructorPage: иконка в круге, без карточной рамки */}
                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 w-full text-center">
                    {s.templatesStandard}
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 justify-items-center w-full max-w-[200px] mx-auto">
                    {MASSAGE_CONSTRUCTOR_THEMES.map(({ id, icon }) => {
                      const active = massageSlotActive === id
                      const labelKey = THEME_SIDEBAR_LABEL_KEY[id]
                      const label = s[labelKey]
                      return (
                        <button
                          key={id}
                          type="button"
                          onClick={() => selectMassageTemplate(id)}
                          className={cn(
                            'flex flex-col items-center gap-1.5 transition',
                            active ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                          )}
                        >
                          <span
                            className={cn(
                              'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition overflow-hidden',
                              active
                                ? 'border-primary bg-primary/20'
                                : 'border-border/50 bg-card/40 hover:border-primary/50'
                            )}
                            aria-hidden
                          >
                            <img src={icon} alt="" className="h-6 w-6 object-contain" />
                          </span>
                          <span className="text-center text-sm font-bold text-foreground leading-tight">{label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div className="h-px w-full bg-border/50 shrink-0" />

                <div className="flex flex-col items-center">
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 w-full text-center">
                    {s.templatesPremium}
                  </h3>
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 w-full">
                    <button
                      type="button"
                      onClick={() => selectMassageTemplate(PREMIUM_MASSAGE_SLOT)}
                      className={cn(
                        'flex flex-col items-center gap-1.5 transition',
                        massageSlotActive === PREMIUM_MASSAGE_SLOT
                          ? 'opacity-100'
                          : 'opacity-80 hover:opacity-100'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 transition overflow-hidden',
                          massageSlotActive === PREMIUM_MASSAGE_SLOT
                            ? 'border-primary bg-primary/20'
                            : 'border-border/50 bg-card/40 hover:border-primary/50'
                        )}
                        aria-hidden
                      >
                        <img src={iconPremiumMassage} alt="" className="h-6 w-6 object-contain" />
                      </span>
                      <span className="text-center text-sm font-bold text-foreground leading-tight">
                        {s.themePremiumMassage}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-2 border-t border-border/40">
                  <Button className="w-full gap-2" onClick={goToEdit}>
                    <Pencil className="h-4 w-4" />
                    {s.editThisTheme}
                  </Button>
                </div>
                {hasDrafts ? (
                  <div className="pt-2 border-t border-border/40 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.mySite}</p>
                    <p className="text-xs text-muted-foreground">{s.myLastEdits}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={goToEdit}>
                        <Pencil className="h-3.5 w-3.5" />
                        {s.open}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-1.5 border-red-400/50 text-red-600 hover:bg-red-500/10 hover:text-red-500"
                        onClick={() => setShowClearConfirmModal(true)}
                      >
                        {s.eraseBtn}
                      </Button>
                    </div>
                  </div>
                ) : null}
              </>
            )}

            {panelStage === 'edit' && (
              <div className="flex min-w-0 flex-col gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start gap-2 text-muted-foreground shrink-0"
                  onClick={handleSidebarBack}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {selectedBlockId != null ? s.back : s.chooseTheme}
                </Button>

                {selectedBlockId == null && (
                  <div className="w-full flex flex-col min-h-0 shrink-0">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="h-px flex-1 bg-border/50 shrink-0" />
                      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider shrink-0">
                        {s.allBlocks}
                      </h3>
                      <span className="h-px flex-1 bg-border/50 shrink-0" />
                    </div>
                    <ul className="space-y-2">
                      {previewBlocks.map(block => (
                        <li key={block.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setHighlightBlockId(block.id)
                              setSelectedBlockId(block.id)
                              scrollPreviewToBlock(block.id)
                            }}
                            className={cn(
                              'w-full rounded-none border-2 px-4 py-3 text-sm font-bold text-center transition',
                              'border-border/50 bg-card/30 text-foreground hover:bg-card/50 hover:border-primary/50',
                              highlightBlockId === block.id &&
                                'border-primary/70 bg-primary/10 shadow-[0_0_12px_rgba(59,130,246,0.35)]'
                            )}
                          >
                            {block[sLang]}
                          </button>
                        </li>
                      ))}
                    </ul>

                    {massageSlotActive !== PREMIUM_MASSAGE_SLOT ? (
                      <div className="flex flex-col gap-2 pt-4 mt-2 border-t border-border/40">
                        <div className="flex items-center justify-center gap-2">
                          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-inner ring-1 ring-primary/20">
                            <Layers className="h-3.5 w-3.5" aria-hidden />
                          </span>
                          <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/95">
                            {s.sitePageBgPattern}
                          </h3>
                        </div>
                        <p className="text-[10px] leading-relaxed text-muted-foreground text-center px-0.5">
                          {s.sitePageBgPatternHint}
                        </p>
                        <div className="grid grid-cols-5 gap-1.5">
                          {MASSAGE_BODY_PATTERN_ORDER.map(id => {
                            const stored = (draft('publicMassageBodyPatternChoice') || '').trim()
                            const effective: MassageOrdinaryTemplateId = isMassageOrdinaryTemplateId(stored)
                              ? stored
                              : massageSlotActive
                            const active = effective === id
                            const labelKey = THEME_SIDEBAR_LABEL_KEY[id]
                            const label = s[labelKey]
                            return (
                              <button
                                key={id}
                                type="button"
                                title={label}
                                aria-label={label}
                                onClick={() => setDraft('publicMassageBodyPatternChoice', id)}
                                className={cn(
                                  'relative aspect-square overflow-hidden rounded-lg border-2 p-0 transition',
                                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                                  active
                                    ? 'border-primary ring-2 ring-primary/35'
                                    : 'border-border/45 hover:border-border/75'
                                )}
                              >
                                <img
                                  src={MASSAGE_BODY_PATTERN_BY_TEMPLATE[id]}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                                <span className="pointer-events-none absolute inset-x-0 bottom-0 truncate bg-black/55 px-0.5 py-0.5 text-center text-[7px] font-semibold leading-tight text-white/95 sm:text-[8px]">
                                  {label}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-border/40">
                      <div className="flex items-center justify-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary shadow-inner ring-1 ring-primary/20">
                          <Globe className="h-3.5 w-3.5" aria-hidden />
                        </span>
                        <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] text-foreground/95">
                          {s.siteLangs}
                        </h3>
                      </div>
                      <p className="text-[10px] leading-relaxed text-muted-foreground text-center px-0.5">
                        {s.siteLangsHint}
                      </p>
                      <div className="flex flex-col gap-2">
                        {SITE_LANG_ORDER.map(code => {
                          const on = siteLangsPick.includes(code)
                          const flag = code === 'ru' ? '🇷🇺' : code === 'en' ? '🇬🇧' : '🇷🇴'
                          const label = code === 'ru' ? s.langPickRu : code === 'en' ? s.langPickEn : s.langPickRo
                          return (
                            <button
                              key={code}
                              type="button"
                              onClick={() => toggleSiteLang(code)}
                              className={cn(
                                'group flex w-full items-center gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-all duration-200',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card',
                                on
                                  ? 'border-primary/45 bg-primary/12 shadow-[0_0_0_1px_rgba(59,130,246,0.2),0_4px_14px_-4px_rgba(59,130,246,0.35)]'
                                  : 'border-border/35 bg-background/30 hover:border-border/60 hover:bg-muted/25'
                              )}
                            >
                              <span
                                className={cn(
                                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg',
                                  'border border-white/10 bg-gradient-to-b from-white/12 to-white/[0.04]',
                                  'shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]'
                                )}
                                aria-hidden
                              >
                                {flag}
                              </span>
                              <span className="min-w-0 flex-1 text-[13px] font-semibold leading-tight text-foreground">
                                {label}
                              </span>
                              <span
                                className={cn(
                                  'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                                  on
                                    ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_14px_rgba(59,130,246,0.45)]'
                                    : 'border-border/55 bg-transparent text-transparent'
                                )}
                                aria-hidden
                              >
                                {on && <Check className="h-3.5 w-3.5" strokeWidth={2.8} />}
                              </span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {selectedBlockId === 'header' && (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed mb-3 px-1">{s.previewEditHint}</p>

                    {/* Логотип */}
                    <section className="space-y-2 pb-3 border-b border-border/50">
                      <h4 className="text-sm font-semibold text-foreground">{s.headerLogo}</h4>
                      <input
                        id="massage-constructor-header-logo"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file || !file.type.startsWith('image/')) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const result = typeof reader.result === 'string' ? reader.result : ''
                            if (!result) return
                            compressImageForLogo(result, dataUrl => {
                              setDraft('publicLogo', dataUrl)
                            })
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="massage-constructor-header-logo"
                          className={cn(
                            'cursor-pointer shrink-0 overflow-hidden border border-border/50 flex items-center justify-center bg-muted/30 hover:border-primary/50',
                            (draft('publicHeaderLogoShape') || 'circle') === 'circle'
                              ? 'h-14 w-14 rounded-full'
                              : (draft('publicHeaderLogoShape') || 'circle') === 'rounded'
                                ? 'h-14 w-14 rounded-xl'
                                : 'h-14 w-14 rounded-none'
                          )}
                        >
                          {draft('publicLogo') ? (
                            <img src={draft('publicLogo')} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          )}
                        </label>
                        <label
                          htmlFor="massage-constructor-header-logo"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-xs font-medium cursor-pointer"
                        >
                          {draft('publicLogo') ? s.logoChange : s.logoUpload}
                        </label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(
                          [
                            ['circle', s.shapeCircle],
                            ['rounded', s.shapeRounded],
                            ['square', s.shapeSquare],
                          ] as const
                        ).map(([value, label]) => (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setDraft('publicHeaderLogoShape', value)}
                            className={cn(
                              'px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors',
                              (draft('publicHeaderLogoShape') || 'circle') === value
                                ? 'border-primary bg-primary/10 text-foreground'
                                : 'border-border/50 bg-card/30 text-muted-foreground hover:bg-card/50'
                            )}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                      <label className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                        <input
                          type="checkbox"
                          checked={draft('publicHeaderLogoVisible') !== 'false'}
                          onChange={e => setDraft('publicHeaderLogoVisible', e.target.checked ? 'true' : 'false')}
                          className="h-3.5 w-3.5 rounded border-border/60 bg-card"
                        />
                        <span>{s.showLogo}</span>
                      </label>
                    </section>

                    {/* Фон hero: фото + видео (как в основном конструкторе) */}
                    <section className="space-y-3 pb-3 border-b border-border/50">
                      <h4 className="text-sm font-semibold text-foreground">{s.heroBg}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">{s.heroBgHint}</p>
                      {(() => {
                        const heroImage = draft('publicMassageHeroBg')
                        const heroVideo = draft('publicMassageHeroVideo')
                        const onPickVideo = (e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file || !file.type.startsWith('video/')) return
                          const slot = getMassageTemplateSlot()
                          const applyDataUrl = () => {
                            const reader = new FileReader()
                            reader.onload = () => {
                              const r = typeof reader.result === 'string' ? reader.result : ''
                              if (r) setDraft('publicMassageHeroVideo', r)
                            }
                            reader.readAsDataURL(file)
                          }
                          if (file.size >= HERO_VIDEO_USE_IDB_MIN_BYTES) {
                            void (async () => {
                              try {
                                await saveMassageHeroVideoBlob(slot, file)
                                setDraft('publicMassageHeroVideo', MASSAGE_HERO_VIDEO_IDB_MARKER)
                              } catch {
                                applyDataUrl()
                              }
                            })()
                          } else {
                            applyDataUrl()
                          }
                        }
                        const onPickPhoto = (e: ChangeEvent<HTMLInputElement>) => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file || !file.type.startsWith('image/')) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const result = typeof reader.result === 'string' ? reader.result : ''
                            if (!result) return
                            compressImageForHeroBg(result, dataUrl => {
                              setDraft('publicMassageHeroBg', dataUrl)
                            })
                          }
                          reader.readAsDataURL(file)
                        }
                        return (
                          <div className="space-y-3">
                            {heroVideo ? (
                              <div className="rounded-xl overflow-hidden border border-white/10 bg-black">
                                <div className="relative h-20 bg-gradient-to-br from-zinc-900 to-black flex items-center justify-center gap-3">
                                  <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <Video className="h-5 w-5 text-white/70" />
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold text-white/80">{s.videoLoaded}</p>
                                    <p className="text-[11px] text-white/40 mt-0.5">{s.videoShownInHero}</p>
                                  </div>
                                  <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                                </div>
                                <div className="flex flex-wrap gap-2 p-2 bg-zinc-900/80">
                                  <input
                                    id="massage-constructor-hero-video"
                                    type="file"
                                    accept="video/*"
                                    className="sr-only"
                                    onChange={onPickVideo}
                                  />
                                  <label
                                    htmlFor="massage-constructor-hero-video"
                                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-xs font-medium text-white/70 cursor-pointer transition-colors"
                                  >
                                    <Video className="h-3.5 w-3.5 shrink-0" /> {s.changeVideo}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setDraft('publicMassageHeroVideo', '')}
                                    className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors"
                                  >
                                    {s.remove}
                                  </button>
                                </div>
                              </div>
                            ) : heroImage ? (
                              <div className="rounded-xl overflow-hidden border border-border/40">
                                <div className="relative h-20 bg-black">
                                  <img src={heroImage} alt="" className="h-full w-full object-cover opacity-90" />
                                  <span className="absolute bottom-1.5 left-2 text-[11px] font-medium text-white/90 bg-black/50 px-1.5 py-0.5 rounded">
                                    {s.photoBg}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 p-2 bg-card/60">
                                  <input
                                    id="massage-constructor-hero-photo"
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={onPickPhoto}
                                  />
                                  <label
                                    htmlFor="massage-constructor-hero-photo"
                                    className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/50 bg-card/20 hover:bg-card/40 text-xs font-medium text-foreground/80 cursor-pointer transition-colors"
                                  >
                                    <ImageIcon className="h-3.5 w-3.5 shrink-0" /> {s.changePhoto}
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() => setDraft('publicMassageHeroBg', '')}
                                    className="flex-1 min-w-[120px] px-3 py-1.5 rounded-lg border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-xs font-medium text-red-400 transition-colors"
                                  >
                                    {s.remove}
                                  </button>
                                </div>
                              </div>
                            ) : null}

                            {!heroVideo && !heroImage && (
                              <div className="flex flex-col gap-2">
                                <input
                                  id="massage-constructor-hero-video-empty"
                                  type="file"
                                  accept="video/*"
                                  className="sr-only"
                                  onChange={onPickVideo}
                                />
                                <label
                                  htmlFor="massage-constructor-hero-video-empty"
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors"
                                >
                                  <Video className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span>{s.addVideo}</span>
                                </label>
                                <input
                                  id="massage-constructor-hero-photo-empty"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={onPickPhoto}
                                />
                                <label
                                  htmlFor="massage-constructor-hero-photo-empty"
                                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors"
                                >
                                  <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                  <span>{s.addPhoto}</span>
                                </label>
                              </div>
                            )}

                            {!heroVideo && heroImage && (
                              <div>
                                <input
                                  id="massage-constructor-hero-video-over"
                                  type="file"
                                  accept="video/*"
                                  className="sr-only"
                                  onChange={onPickVideo}
                                />
                                <label
                                  htmlFor="massage-constructor-hero-video-over"
                                  className="w-full inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-dashed border-border/50 bg-card/10 hover:border-primary/40 hover:bg-primary/5 text-sm font-medium cursor-pointer transition-colors text-muted-foreground"
                                >
                                  <Video className="h-4 w-4 shrink-0" />
                                  <span>{s.addVideoOverPhoto}</span>
                                </label>
                              </div>
                            )}

                            {(heroVideo || heroImage) && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => {
                                  setDraft('publicMassageHeroVideo', '')
                                  setDraft('publicMassageHeroBg', '')
                                }}
                              >
                                {s.removeBg}
                              </Button>
                            )}
                          </div>
                        )
                      })()}
                    </section>

                    {/* Палитры: премиум — как в MassageTemplate; 5 обычных — только баннер страницы салона в превью */}
                    <section className="space-y-3 pb-3 border-b border-border/50">
                      <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                      {isPremiumMassageShell ? (
                        <>
                          <MassageColorRow
                            label={s.colorTopBar}
                            colorKey="topBarBg"
                            currentId={curColor('topBarBg')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorNav}
                            colorKey="navBg"
                            currentId={curColor('navBg')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorNavLinks}
                            colorKey="navLink"
                            currentId={curColor('navLink')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorSiteName}
                            colorKey="siteName"
                            currentId={curColor('siteName')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorTagline}
                            colorKey="tagline"
                            currentId={curColor('tagline')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorAddress}
                            colorKey="address"
                            currentId={curColor('address')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorContactOnline}
                            colorKey="contactOnline"
                            currentId={curColor('contactOnline')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorCallUs}
                            colorKey="callUs"
                            currentId={curColor('callUs')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorPhone}
                            colorKey="phone"
                            currentId={curColor('phone')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHero1}
                            colorKey="heroLine1"
                            currentId={curColor('heroLine1')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHero2}
                            colorKey="heroLine2"
                            currentId={curColor('heroLine2')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroSub}
                            colorKey="heroSub"
                            currentId={curColor('heroSub')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroPrimBtnBg}
                            colorKey="heroPrimBtnBg"
                            currentId={curColor('heroPrimBtnBg')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroPrimBtnHover}
                            colorKey="heroPrimBtnHover"
                            currentId={curColor('heroPrimBtnHover')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroBtnBorder}
                            colorKey="heroCtaBorder"
                            currentId={curColor('heroCtaBorder')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroSecBtnBg}
                            colorKey="heroSecBtnBg"
                            currentId={curColor('heroSecBtnBg')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroSecBtnHover}
                            colorKey="heroSecBtnHover"
                            currentId={curColor('heroSecBtnHover')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroSecBtnBorder}
                            colorKey="heroSecBtnBorder"
                            currentId={curColor('heroSecBtnBorder')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                        </>
                      ) : (
                        <>
                          <p className="text-[10px] leading-relaxed text-muted-foreground px-0.5">
                            {s.salonHeroColorsNote}
                          </p>
                          <MassageColorRow
                            label={s.salonColorBannerTitle}
                            colorKey="heroLine1"
                            currentId={curColor('heroLine1')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.salonColorBannerSub}
                            colorKey="heroSub"
                            currentId={curColor('heroSub')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroPrimBtnBg}
                            colorKey="heroPrimBtnBg"
                            currentId={curColor('heroPrimBtnBg')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroPrimBtnHover}
                            colorKey="heroPrimBtnHover"
                            currentId={curColor('heroPrimBtnHover')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroBtnBorder}
                            colorKey="heroCtaBorder"
                            currentId={curColor('heroCtaBorder')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroSecBtnBg}
                            colorKey="heroSecBtnBg"
                            currentId={curColor('heroSecBtnBg')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroSecBtnHover}
                            colorKey="heroSecBtnHover"
                            currentId={curColor('heroSecBtnHover')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                          <MassageColorRow
                            label={s.colorHeroSecBtnBorder}
                            colorKey="heroSecBtnBorder"
                            currentId={curColor('heroSecBtnBorder')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                        </>
                      )}
                    </section>

                    <section className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">{s.socialLinks}</h4>
                      <div className="space-y-2">
                        {SOCIAL_FIELDS.map(f => (
                          <div key={f.key} className="space-y-1">
                            <label className="text-xs text-muted-foreground">{f.label}</label>
                            <input
                              type="text"
                              value={draft(f.key)}
                              onChange={e => setDraft(f.key, e.target.value)}
                              placeholder={f.placeholder}
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                  </>
                )}

                {selectedBlockId === 'services' && (() => {
                  const mergedSvc = mergeMassageServicesFromDraft(sLang, draft('publicMassageServicesJson'))
                  return (
                    <div className="flex min-h-0 flex-1 flex-col gap-3 w-full">
                      <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.servicesBlockHint}</p>
                      <div className="flex flex-col gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => applyAllServicesHideImage(true)}
                        >
                          {s.svcAllNoPhoto}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() => applyAllServicesHideImage(false)}
                        >
                          {s.svcAllWithPhoto}
                        </Button>
                      </div>
                      <p className="text-[10px] text-muted-foreground px-1 shrink-0">
                        {mergedSvc.length}/{MASSAGE_SERVICES_MAX}
                      </p>
                      <div className="min-h-[min(52vh,560px)] flex-1 basis-0 overflow-y-auto overflow-x-hidden rounded-lg border border-border/40 bg-muted/10 py-2 px-1.5 space-y-3 scrollbar-hide">
                        {mergedSvc.map((row, i) => (
                          <div
                            key={i}
                            className="rounded-lg border border-border/50 p-2.5 space-y-2 bg-card/30"
                          >
                            <div className="text-xs font-semibold text-foreground">
                              {s.serviceCardN} {i + 1}
                            </div>
                            {row.image && !row.hideImage ? (
                              <div className="relative h-14 w-full rounded-md overflow-hidden border border-border/40">
                                <img src={row.image} alt="" className="h-full w-full object-cover" />
                              </div>
                            ) : null}
                            <input
                              id={`massage-svc-img-${i}`}
                              type="file"
                              accept="image/*"
                              className="sr-only"
                              onChange={e => {
                                const file = e.target.files?.[0]
                                e.target.value = ''
                                if (!file?.type.startsWith('image/')) return
                                const reader = new FileReader()
                                reader.onload = () => {
                                  const r = typeof reader.result === 'string' ? reader.result : ''
                                  if (!r) return
                                  compressImageForLogo(r, dataUrl => applyServiceImage(i, dataUrl))
                                }
                                reader.readAsDataURL(file)
                              }}
                            />
                            <label
                              htmlFor={`massage-svc-img-${i}`}
                              className="flex w-full items-center justify-center gap-2 px-2 py-2 rounded-lg border border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-xs font-medium cursor-pointer"
                            >
                              <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                              {s.servicePhoto}
                            </label>
                          </div>
                        ))}
                      </div>
                      <section className="space-y-3 pt-2 border-t border-border/50 shrink-0">
                        <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                        <MassageColorRow
                          label={s.colorSvcBlockTitle}
                          colorKey="svcBlockTitle"
                          currentId={curColor('svcBlockTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSvcBlockSub}
                          colorKey="svcBlockSub"
                          currentId={curColor('svcBlockSub')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSvcCardTitle}
                          colorKey="svcCardTitle"
                          currentId={curColor('svcCardTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSvcCardDesc}
                          colorKey="svcCardDesc"
                          currentId={curColor('svcCardDesc')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSvcCardPrice}
                          colorKey="svcCardPrice"
                          currentId={curColor('svcCardPrice')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                      </section>
                    </div>
                  )
                })()}

                {selectedBlockId === 'about' && (
                  <>
                    <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.aboutBlockHint}</p>
                    <section className="space-y-3 pb-3 border-b border-border/50 shrink-0">
                      <h4 className="text-sm font-semibold text-foreground">{s.aboutFounderPhoto}</h4>
                      <input
                        id="massage-constructor-about-avatar"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={e => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          if (!file || !file.type.startsWith('image/')) return
                          const reader = new FileReader()
                          reader.onload = () => {
                            const result = typeof reader.result === 'string' ? reader.result : ''
                            if (!result) return
                            compressImageForLogo(result, dataUrl => {
                              setDraft('publicMassageAboutAvatar', dataUrl)
                            })
                          }
                          reader.readAsDataURL(file)
                        }}
                      />
                      <div className="flex items-center gap-3">
                        <label
                          htmlFor="massage-constructor-about-avatar"
                          className="cursor-pointer shrink-0 overflow-hidden border border-border/50 flex items-center justify-center bg-muted/30 hover:border-primary/50 h-20 w-20 rounded-full"
                        >
                          {draft('publicMassageAboutAvatar') ? (
                            <img
                              src={draft('publicMassageAboutAvatar')}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          )}
                        </label>
                        <div className="flex flex-col gap-2 min-w-0">
                          <label
                            htmlFor="massage-constructor-about-avatar"
                            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-xs font-medium cursor-pointer"
                          >
                            {draft('publicMassageAboutAvatar') ? s.aboutPhotoChange : s.aboutPhotoUpload}
                          </label>
                          {draft('publicMassageAboutAvatar') ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full text-xs"
                              onClick={() => setDraft('publicMassageAboutAvatar', '')}
                            >
                              {s.remove}
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </section>
                    <section className="space-y-3 shrink-0">
                      <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                      <MassageColorRow
                        label={s.colorAboutHeading}
                        colorKey="aboutHeading"
                        currentId={curColor('aboutHeading')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorAboutBody}
                        colorKey="aboutBody"
                        currentId={curColor('aboutBody')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorAboutMission}
                        colorKey="aboutMission"
                        currentId={curColor('aboutMission')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>
                  </>
                )}

                {selectedBlockId === 'gallery' &&
                  (isPremiumMassageShell ? (() => {
                  const mergedGal = mergeMassageGalleryFromDraft(sLang, draft('publicMassageGalleryJson'))
                  return (
                    <div className="flex w-full flex-col gap-3">
                      <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.galleryBlockHint}</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 shrink-0"
                        disabled={mergedGal.length >= MASSAGE_GALLERY_MAX_SECTIONS}
                        onClick={appendGallerySection}
                      >
                        <Plus className="h-4 w-4 shrink-0" />
                        {s.galleryAddSection} ({mergedGal.length}/{MASSAGE_GALLERY_MAX_SECTIONS})
                      </Button>
                      <div className="flex flex-col gap-3">
                        {mergedGal.map((sec, si) => (
                          <div
                            key={sec.id}
                            className="rounded-lg border border-border/50 p-2.5 space-y-2 bg-card/30"
                          >
                            <div className="text-xs font-semibold text-foreground">
                              {s.gallerySectionN} {si + 1}
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] text-muted-foreground" htmlFor={`massage-gal-sec-name-${sec.id}`}>
                                {s.gallerySectionLabel}
                              </label>
                              <input
                                id={`massage-gal-sec-name-${sec.id}`}
                                type="text"
                                value={sec.label}
                                onChange={e => setGallerySectionLabel(si, e.target.value)}
                                maxLength={MASSAGE_GALLERY_TAB_LABEL_MAX}
                                className="w-full min-w-0 px-2.5 py-2 rounded-lg border border-border/50 text-sm bg-card/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-1.5">
                              {sec.photos.map((ph, pi) => (
                                <div key={`${sec.id}-${pi}`} className="relative min-w-0">
                                  <input
                                    id={`massage-gal-${sec.id}-${pi}`}
                                    type="file"
                                    accept="image/*"
                                    className="sr-only"
                                    onChange={e => {
                                      const file = e.target.files?.[0]
                                      e.target.value = ''
                                      if (!file?.type.startsWith('image/')) return
                                      const reader = new FileReader()
                                      reader.onload = () => {
                                        const r = typeof reader.result === 'string' ? reader.result : ''
                                        if (!r) return
                                        compressImageForLogo(r, dataUrl => applyGalleryPhoto(si, pi, dataUrl))
                                      }
                                      reader.readAsDataURL(file)
                                    }}
                                  />
                                  <label
                                    htmlFor={`massage-gal-${sec.id}-${pi}`}
                                    className={cn(
                                      'flex aspect-square w-full items-center justify-center rounded-md border border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-[10px] leading-tight cursor-pointer overflow-hidden',
                                      ph && 'border-solid border-border/40 p-0'
                                    )}
                                  >
                                    {ph ? (
                                      <img src={ph} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                      <span className="px-0.5 text-center text-muted-foreground">
                                        {pi + 1}
                                      </span>
                                    )}
                                  </label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <section className="space-y-3 shrink-0 border-t border-border/50 pt-3 mt-1">
                        <h4 className="text-sm font-semibold text-foreground">{s.galleryColorSection}</h4>
                        <MassageColorRow
                          label={s.colorGalTitle}
                          colorKey="galTitle"
                          currentId={curColor('galTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorGalSub}
                          colorKey="galSub"
                          currentId={curColor('galSub')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorGalTabActive}
                          colorKey="galTabActive"
                          currentId={curColor('galTabActive')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                      </section>
                    </div>
                  )
                })()
                  : (
                      <div className="flex w-full flex-col gap-3">
                        <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.salonGalleryHint}</p>
                        <section className="space-y-3 shrink-0">
                          <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                          <MassageColorRow
                            label={s.colorGalTitle}
                            colorKey="galTitle"
                            currentId={curColor('galTitle')}
                            onPick={setThemeColor}
                            byDefaultLabel={s.byDefault}
                          />
                        </section>
                      </div>
                    ))}

                {selectedBlockId === 'booking' && !isPremiumMassageShell && (
                  <div className="flex w-full flex-col gap-3">
                    <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.salonBookingHint}</p>
                    <section className="space-y-3 shrink-0">
                      <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                      <MassageColorRow
                        label={s.colorCtaTitle}
                        colorKey="ctaBlockTitle"
                        currentId={curColor('ctaBlockTitle')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorCtaSub}
                        colorKey="ctaBlockSub"
                        currentId={curColor('ctaBlockSub')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>
                  </div>
                )}

                {selectedBlockId === 'works' && !isPremiumMassageShell && (
                  <div className="flex w-full flex-col gap-3">
                    <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.salonWorksHint}</p>
                    <section className="space-y-3 shrink-0">
                      <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                      <MassageColorRow
                        label={s.colorSvcBlockTitle}
                        colorKey="svcBlockTitle"
                        currentId={curColor('svcBlockTitle')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorSvcCardTitle}
                        colorKey="svcCardTitle"
                        currentId={curColor('svcCardTitle')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>
                  </div>
                )}

                {selectedBlockId === 'map' && !isPremiumMassageShell && (
                  <div className="flex w-full flex-col gap-3">
                    <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.salonMapHint}</p>
                    <section className="space-y-3 shrink-0">
                      <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                      <MassageColorRow
                        label={s.colorContactsLabel}
                        colorKey="contactsLabel"
                        currentId={curColor('contactsLabel')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactsSectionHeading}
                        colorKey="contactsSectionHeading"
                        currentId={curColor('contactsSectionHeading')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>
                  </div>
                )}

                {selectedBlockId === 'footer' && !isPremiumMassageShell && (
                  <div className="flex w-full flex-col gap-3">
                    <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.salonFooterHint}</p>
                    <section className="space-y-3 shrink-0">
                      <h4 className="text-sm font-semibold text-foreground">{s.colorsBlock}</h4>
                      <MassageColorRow
                        label={s.colorContactsBlockTitle}
                        colorKey="contactsBlockTitle"
                        currentId={curColor('contactsBlockTitle')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactsLabel}
                        colorKey="contactsLabel"
                        currentId={curColor('contactsLabel')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactsBody}
                        colorKey="contactsBody"
                        currentId={curColor('contactsBody')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactsIcon}
                        colorKey="contactsIcon"
                        currentId={curColor('contactsIcon')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>
                  </div>
                )}

                {selectedBlockId === 'subscriptions' && (() => {
                  const mergedSubs = mergeMassageSubscriptionsFromDraft(sLang, draft('publicMassageSubsJson'))
                  const presets = MASSAGE_SUBSCRIPTION_PRESETS[sLang] ?? MASSAGE_SUBSCRIPTION_PRESETS.ru
                  const availableIdx = Array.from({ length: MASSAGE_SUBSCRIPTION_PRESET_COUNT }, (_, i) => i).filter(
                    i => !mergedSubs.some(m => m.templateIndex === i)
                  )
                  return (
                    <div className="flex w-full flex-col gap-3">
                      <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.subsBlockHint}</p>
                      <label className="flex items-center gap-2 cursor-pointer text-sm shrink-0">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={draft('publicMassageSubsHidden') === 'true'}
                          onChange={e => setDraft('publicMassageSubsHidden', e.target.checked ? 'true' : 'false')}
                        />
                        <span>{s.subsHideBlock}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-sm shrink-0">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-border"
                          checked={draft('publicMassageSubsCtaHidden') === 'true'}
                          onChange={e => setDraft('publicMassageSubsCtaHidden', e.target.checked ? 'true' : 'false')}
                        />
                        <span>{s.subsHideCta}</span>
                      </label>
                      <div className="space-y-1.5 shrink-0">
                        <label className="text-xs text-muted-foreground" htmlFor="massage-subs-cta-url">
                          {s.subsCtaUrl}
                        </label>
                        <input
                          id="massage-subs-cta-url"
                          type="url"
                          value={draft('publicMassageSubsCtaUrl')}
                          onChange={e => setDraft('publicMassageSubsCtaUrl', e.target.value)}
                          placeholder="https://"
                          className="w-full px-2.5 py-2 rounded-lg border border-border/50 text-sm bg-card/40 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                      </div>
                      <div className="space-y-2 shrink-0">
                        <span className="text-xs font-medium text-foreground">{s.subsAddPreset}</span>
                        <div ref={subsPresetDropdownRef} className="relative">
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 justify-between bg-card/40 backdrop-blur-sm border-border/50"
                            onClick={() => setIsSubsPresetOpen(v => !v)}
                            disabled={availableIdx.length === 0}
                          >
                            <span className="text-sm text-muted-foreground">
                              {availableIdx.length > 0 ? s.subsPickPlaceholder : s.subsAllAdded}
                            </span>
                            <ChevronDown className={cn('w-4 h-4 transition-transform', isSubsPresetOpen && 'rotate-180')} />
                          </Button>
                          {isSubsPresetOpen && availableIdx.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                              <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                                {availableIdx.map(i => (
                                  <button
                                    key={i}
                                    type="button"
                                    onClick={() => {
                                      addSubPreset(i)
                                      setIsSubsPresetOpen(false)
                                    }}
                                    className="w-full px-3 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 transition-colors"
                                  >
                                    <span className="font-semibold">{presets[i].pct}</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-foreground">{s.subsList}</span>
                        <ul className="space-y-2">
                          {mergedSubs.map((row) => {
                            const p = presets[row.templateIndex] ?? presets[0]
                            return (
                              <li
                                key={row.id}
                                className="flex items-start gap-2 rounded-lg border border-border/50 bg-card/30 p-2.5"
                              >
                                <div className="min-w-0 flex-1 text-xs">
                                  <span className="font-semibold text-foreground">{p.pct}</span>
                                  <span className="text-muted-foreground"> — </span>
                                  <span className="text-foreground/90">{p.title}</span>
                                </div>
                                <button
                                  type="button"
                                  className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/70 bg-red-500/10 text-red-600 shadow-sm transition-all hover:-translate-y-px hover:border-red-500 hover:bg-red-500/15 hover:shadow-md"
                                  aria-label={s.remove}
                                  onClick={() => removeSubItem(row.id)}
                                >
                                  <span className="inline-flex h-4 w-4 items-center justify-center text-[18px] font-medium leading-none translate-y-[-0.5px] transition-transform group-hover:scale-105">×</span>
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                      <section className="space-y-3 shrink-0 border-t border-border/50 pt-3 mt-1">
                        <h4 className="text-sm font-semibold text-foreground">{s.subsColorSection}</h4>
                        <MassageColorRow
                          label={s.colorSubsBlockTitle}
                          colorKey="subsBlockTitle"
                          currentId={curColor('subsBlockTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCardTitle}
                          colorKey="subsCardTitle"
                          currentId={curColor('subsCardTitle')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCardDesc}
                          colorKey="subsCardDesc"
                          currentId={curColor('subsCardDesc')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCardBgFrom}
                          colorKey="subsCardBgFrom"
                          currentId={curColor('subsCardBgFrom')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCardBgTo}
                          colorKey="subsCardBgTo"
                          currentId={curColor('subsCardBgTo')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCtaText}
                          colorKey="subsCtaText"
                          currentId={curColor('subsCtaText')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                        <MassageColorRow
                          label={s.colorSubsCtaBg}
                          colorKey="subsCtaBg"
                          currentId={curColor('subsCtaBg')}
                          onPick={setThemeColor}
                          byDefaultLabel={s.byDefault}
                        />
                      </section>
                    </div>
                  )
                })()}

                {selectedBlockId === 'catalog' && (() => {
                  const mergedCat = mergeMassageCatalogFromDraft(sLang, draft('publicMassageCatalogJson'))
                  return (
                    <div className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden">
                      <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.catalogBlockHint}</p>
                      <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          className="rounded border-border"
                          checked={draft('publicMassageCatalogHidden') === 'true'}
                          onChange={e => setDraft('publicMassageCatalogHidden', e.target.checked ? 'true' : 'false')}
                        />
                        <span>{s.catalogHideBlock}</span>
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed shrink-0"
                        disabled={mergedCat.length >= MASSAGE_CATALOG_MAX}
                        onClick={appendCatalogProduct}
                      >
                        <Plus className="h-4 w-4 mr-1 shrink-0" />
                        {s.catalogAddProduct} ({mergedCat.length}/{MASSAGE_CATALOG_MAX})
                      </Button>
                      <span className="text-xs font-semibold text-foreground">{s.catalogList}</span>
                      {mergedCat.map((row, i) => {
                        const catalogFileId = catalogProductFileInputId(row.id)
                        return (
                          <div
                            key={row.id}
                            className="rounded-lg border border-border/50 bg-card/30 p-2.5 space-y-2 min-w-0 max-w-full overflow-hidden"
                          >
                            <div className="flex items-start gap-2">
                              <div className="min-w-0 flex-1 text-xs">
                                <span className="font-semibold text-foreground block">
                                  {s.catalogProductN} {i + 1}
                                </span>
                                <span className="font-medium text-foreground/90 block truncate mt-0.5">{row.name}</span>
                                <span className="text-muted-foreground">
                                  {formatCatalogPriceDisplay(row.price)}
                                  {row.currency ? <span className="ml-0.5">{row.currency}</span> : null}
                                  {row.oldPrice > row.price && (
                                    <span className="line-through ml-1.5 opacity-80">
                                      {formatCatalogPriceDisplay(row.oldPrice)}
                                      {row.currency ? `\u00a0${row.currency}` : ''}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <button
                                type="button"
                                className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/70 bg-red-500/10 text-red-600 shadow-sm transition-all hover:-translate-y-px hover:border-red-500 hover:bg-red-500/15"
                                aria-label={s.remove}
                                onClick={() => removeCatalogProductById(row.id)}
                              >
                                <span className="inline-flex h-4 w-4 items-center justify-center text-[18px] font-medium leading-none translate-y-[-0.5px]">×</span>
                              </button>
                            </div>
                            <div className="space-y-1.5 pt-0.5 border-t border-border/40">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {s.catalogProductPhoto}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-snug">{s.catalogPhotoHint}</p>
                              {row.image ? (
                                <div className="relative h-20 w-full shrink-0 rounded-md overflow-hidden border border-border/40 bg-muted/50">
                                  <img
                                    src={row.image}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                </div>
                              ) : null}
                              <input
                                id={catalogFileId}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                tabIndex={-1}
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  e.target.value = ''
                                  if (!file?.type.startsWith('image/')) return
                                  const reader = new FileReader()
                                  reader.onload = () => {
                                    const r = typeof reader.result === 'string' ? reader.result : ''
                                    if (!r) return
                                    compressImageForCatalog(r, dataUrl => applyCatalogImage(row.id, dataUrl))
                                  }
                                  reader.readAsDataURL(file)
                                }}
                              />
                              <div
                                role="button"
                                tabIndex={0}
                                className="flex w-full items-center justify-center gap-2 px-2 py-2 rounded-lg border border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-xs font-medium cursor-pointer"
                                onClick={() => document.getElementById(catalogFileId)?.click()}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById(catalogFileId)?.click() } }}
                              >
                                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                                {s.catalogPhotoUpload}
                              </div>
                              {row.image ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-7 text-[10px] text-muted-foreground"
                                  onClick={() => clearCatalogImage(row.id)}
                                >
                                  {s.catalogRemovePhoto}
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}

                {selectedBlockId === 'specialists' && (() => {
                  const mergedSpecs = mergeMassageSpecsFromDraft(sLang, draft('publicMassageSpecsJson'))
                  return (
                    <div className="flex flex-col gap-3 min-w-0 max-w-full">
                      <p className="text-xs text-muted-foreground leading-relaxed">{s.specsBlockHint}</p>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={draft('publicMassageSpecsHidden') === 'true'}
                          onChange={e => setDraft('publicMassageSpecsHidden', e.target.checked ? 'true' : '')}
                          className="accent-primary"
                        />
                        {s.specsHideBlock}
                      </label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full border-dashed shrink-0"
                        disabled={mergedSpecs.length >= MASSAGE_SPECS_MAX}
                        onClick={appendSpec}
                      >
                        <Plus className="h-4 w-4 mr-1 shrink-0" />
                        {s.specsAddCard} ({mergedSpecs.length}/{MASSAGE_SPECS_MAX})
                      </Button>
                      <span className="text-xs font-semibold text-foreground">{s.specsList}</span>
                      {mergedSpecs.map((row, i) => {
                        const specFId = specFileInputId(row.id)
                        return (
                          <div
                            key={row.id}
                            className="rounded-lg border border-border/50 bg-card/30 p-2.5 space-y-2 min-w-0 max-w-full overflow-hidden"
                          >
                            <div className="flex items-start gap-2">
                              <div className="min-w-0 flex-1 text-xs">
                                <span className="font-semibold text-foreground block">
                                  {s.specsCardN} {i + 1}
                                </span>
                                <span className="font-medium text-foreground/90 block truncate mt-0.5">{row.name}</span>
                                <span className="text-muted-foreground block truncate">{row.role}</span>
                              </div>
                              <button
                                type="button"
                                className="group relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-red-500/70 bg-red-500/10 text-red-600 shadow-sm transition-all hover:-translate-y-px hover:border-red-500 hover:bg-red-500/15"
                                aria-label={s.remove}
                                onClick={() => removeSpecById(row.id)}
                              >
                                <span className="inline-flex h-4 w-4 items-center justify-center text-[18px] font-medium leading-none translate-y-[-0.5px]">×</span>
                              </button>
                            </div>
                            <div className="space-y-1.5 pt-0.5 border-t border-border/40">
                              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                                {s.specsCardPhoto}
                              </div>
                              <p className="text-[10px] text-muted-foreground leading-snug">{s.specsPhotoHint}</p>
                              {row.image ? (
                                <div className="relative h-28 w-full shrink-0 rounded-md overflow-hidden border border-border/40 bg-muted/50">
                                  <img
                                    src={row.image}
                                    alt=""
                                    className="absolute inset-0 h-full w-full object-cover"
                                  />
                                </div>
                              ) : null}
                              <input
                                id={specFId}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                tabIndex={-1}
                                onChange={e => {
                                  const file = e.target.files?.[0]
                                  e.target.value = ''
                                  if (!file?.type.startsWith('image/')) return
                                  const reader = new FileReader()
                                  reader.onload = () => {
                                    const r = typeof reader.result === 'string' ? reader.result : ''
                                    if (!r) return
                                    compressImageForCatalog(r, dataUrl => applySpecImage(row.id, dataUrl))
                                  }
                                  reader.readAsDataURL(file)
                                }}
                              />
                              <div
                                role="button"
                                tabIndex={0}
                                className="flex w-full items-center justify-center gap-2 px-2 py-2 rounded-lg border border-dashed border-border/60 bg-card/20 hover:border-primary/50 text-xs font-medium cursor-pointer"
                                onClick={() => document.getElementById(specFId)?.click()}
                                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); document.getElementById(specFId)?.click() } }}
                              >
                                <ImageIcon className="h-3.5 w-3.5 shrink-0" />
                                {s.specsPhotoUpload}
                              </div>
                              {row.image ? (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="w-full h-7 text-[10px] text-muted-foreground"
                                  onClick={() => clearSpecImage(row.id)}
                                >
                                  {s.specsRemovePhoto}
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                })()}

                {selectedBlockId === 'contacts' && (
                  <div className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden">
                    <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.contactsBlockHint}</p>
                    <section className="space-y-2 shrink-0 border-t border-border/50 pt-3">
                      <h4 className="text-sm font-semibold text-foreground">{s.contactsAddressTitle}</h4>
                      <div ref={contactAddrRef} className="relative">
                        <input
                          type="text"
                          value={contactAddrQuery}
                          onChange={e => {
                            const v = e.target.value
                            setContactAddrQuery(v)
                            setDraft('publicAddress', v)
                          }}
                          onFocus={() => {
                            setContactAddrFocused(true)
                            if (contactAddrResults.length > 0) setContactAddrOpen(true)
                          }}
                          onBlur={() => {
                            window.setTimeout(() => setContactAddrFocused(false), 120)
                          }}
                          placeholder={s.contactsAddressPlaceholder}
                          className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        />
                        {contactAddrOpen && contactAddrResults.length > 0 ? (
                          <div className="absolute z-50 w-full mt-1 rounded-lg border border-border/50 bg-card shadow-2xl max-h-60 overflow-y-auto">
                            {contactAddrResults.map((result, ri) => {
                              const title = typeof result.display_name === 'string' ? result.display_name : ''
                              const pid = result.place_id
                              const key =
                                typeof pid === 'number' || typeof pid === 'string' ? String(pid) : `addr-${ri}`
                              return (
                                <button
                                  key={key}
                                  type="button"
                                  onMouseDown={e => e.preventDefault()}
                                  onClick={() => {
                                    const formatted = title
                                    const placeName =
                                      (typeof result.name === 'string' && result.name) ||
                                      (formatted ? formatted.split(',')[0].trim() : '')
                                    setContactAddrQuery(formatted)
                                    setDraft('publicAddress', formatted)
                                    const latRaw = result.lat
                                    const lonRaw = result.lon
                                    if (latRaw != null && lonRaw != null) {
                                      setDraft('publicMapLat', String(latRaw))
                                      setDraft('publicMapLng', String(lonRaw))
                                    }
                                    setDraft('publicPlaceName', placeName)
                                    setContactAddrOpen(false)
                                    setContactAddrResults([])
                                  }}
                                  className="w-full px-3 py-2 text-left text-xs sm:text-sm text-foreground hover:bg-accent/10"
                                >
                                  {title}
                                </button>
                              )
                            })}
                            {contactAddrLoading ? (
                              <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border/40">
                                {s.contactsSearching}
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-3 rounded-lg overflow-hidden border border-border/50 bg-muted/20 w-full aspect-video max-h-52">
                        <iframe
                          title="map"
                          src={contactsSidebarMapSrc}
                          className="h-full min-h-[140px] w-full border-0"
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    </section>
                    <section className="space-y-3 shrink-0 border-t border-border/50 pt-3">
                      <h4 className="text-sm font-semibold text-foreground">{s.contactsSocialSection}</h4>
                      <div className="space-y-2">
                        {SOCIAL_FIELDS.map(f => (
                          <div key={f.key} className="space-y-1">
                            <label className="text-xs text-muted-foreground">{f.label}</label>
                            <input
                              type="text"
                              value={draft(f.key)}
                              onChange={e => setDraft(f.key, e.target.value)}
                              placeholder={f.placeholder}
                              className="w-full px-3 py-2 rounded-lg border border-border/50 text-sm bg-card/30 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                            />
                          </div>
                        ))}
                      </div>
                    </section>
                    <section className="space-y-3 shrink-0 border-t border-border/50 pt-3">
                      <h4 className="text-sm font-semibold text-foreground">{s.contactsColorSection}</h4>
                      <MassageColorRow
                        label={s.colorContactsBlockTitle}
                        colorKey="contactsBlockTitle"
                        currentId={curColor('contactsBlockTitle')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactsSectionHeading}
                        colorKey="contactsSectionHeading"
                        currentId={curColor('contactsSectionHeading')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactsIcon}
                        colorKey="contactsIcon"
                        currentId={curColor('contactsIcon')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactsBody}
                        colorKey="contactsBody"
                        currentId={curColor('contactsBody')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorContactsLabel}
                        colorKey="contactsLabel"
                        currentId={curColor('contactsLabel')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>
                  </div>
                )}

                {selectedBlockId === 'cta' && isPremiumMassageShell && (
                  <div className="flex w-full min-w-0 max-w-full flex-col gap-3 overflow-x-hidden">
                    <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        className="rounded border-border accent-primary"
                        checked={draft('publicMassageCtaHidden') === 'true'}
                        onChange={e => setDraft('publicMassageCtaHidden', e.target.checked ? 'true' : '')}
                      />
                      {s.ctaHideBlock}
                    </label>
                    <p className="text-xs text-muted-foreground leading-relaxed px-1 shrink-0">{s.ctaBlockHint}</p>
                    <section className="space-y-3 shrink-0 border-t border-border/50 pt-3">
                      <h4 className="text-sm font-semibold text-foreground">{s.ctaColorSection}</h4>
                      <MassageColorRow
                        label={s.colorCtaBgFrom}
                        colorKey="ctaBlockBgFrom"
                        currentId={curColor('ctaBlockBgFrom')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorCtaBgTo}
                        colorKey="ctaBlockBgTo"
                        currentId={curColor('ctaBlockBgTo')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorCtaTitle}
                        colorKey="ctaBlockTitle"
                        currentId={curColor('ctaBlockTitle')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorCtaSub}
                        colorKey="ctaBlockSub"
                        currentId={curColor('ctaBlockSub')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorCtaBtnBg}
                        colorKey="ctaBlockBtnBg"
                        currentId={curColor('ctaBlockBtnBg')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                      <MassageColorRow
                        label={s.colorCtaBtnText}
                        colorKey="ctaBlockBtnText"
                        currentId={curColor('ctaBlockBtnText')}
                        onPick={setThemeColor}
                        byDefaultLabel={s.byDefault}
                      />
                    </section>
                  </div>
                )}

                {selectedBlockId !== null &&
                  selectedBlockId !== 'header' &&
                  selectedBlockId !== 'services' &&
                  selectedBlockId !== 'about' &&
                  selectedBlockId !== 'gallery' &&
                  selectedBlockId !== 'booking' &&
                  selectedBlockId !== 'works' &&
                  selectedBlockId !== 'map' &&
                  selectedBlockId !== 'footer' &&
                  selectedBlockId !== 'subscriptions' &&
                  selectedBlockId !== 'catalog' &&
                  selectedBlockId !== 'specialists' &&
                  selectedBlockId !== 'cta' &&
                  selectedBlockId !== 'contacts' && (
                  <div className="flex flex-col items-center justify-center gap-4 text-center py-12">
                    <div className="h-14 w-14 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-center">
                      <svg className="h-6 w-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      </svg>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-[220px] leading-relaxed">{s.blockSettingsLater}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {panelStage === 'edit' && (
            <div className="shrink-0 p-3 border-t border-border/40 bg-card">
              {(() => {
                if (resetJustApplied.current && hasDrafts) {
                  resetJustApplied.current = false
                }
                const isResetDisabled =
                  selectedBlockId == null ? !hasDrafts || resetJustApplied.current : undoStack.length === 0
                const resetTitle =
                  selectedBlockId == null
                    ? !hasDrafts || resetJustApplied.current
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
                    title={resetTitle}
                    onClick={selectedBlockId == null ? handleRestore : handleUndo}
                  >
                    {selectedBlockId == null ? (
                      <RotateCcw className="h-4 w-4 shrink-0" />
                    ) : (
                      <Undo2 className="h-4 w-4 shrink-0" />
                    )}
                    {selectedBlockId == null ? s.restoreDesign : s.undoLast}
                  </Button>
                )
              })()}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
