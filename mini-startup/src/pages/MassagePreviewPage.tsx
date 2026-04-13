import { useMemo, useCallback, useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import MassageTemplate from '@/components/public/MassageTemplate'
import {
  useMassageDraftSnapshot,
  getMassageDraft,
  setMassageDraft,
  setMassageDraftLangAware,
  getMassageDraftLangAware,
  isMassageLangScopedTextKey,
  getMassageTemplateSlot,
} from '@/lib/massage-draft'
import {
  MASSAGE_HERO_VIDEO_IDB_MARKER,
  loadMassageHeroVideoObjectUrl,
} from '@/lib/massage-hero-video-idb'
import { parseMassageThemeColors } from '@/lib/massage-theme-palette'

type Lang = 'ru' | 'en' | 'ro'

export default function MassagePreviewPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  /** Перерисовка при изменении черновиков из конструктора (другая вкладка / polling) */
  const massageDraftSnap = useMassageDraftSnapshot()

  const isPreview = searchParams.get('preview') === '1'
  const isFullSizeView = searchParams.get('full') === '1'
  const constructorMobilePreview = searchParams.get('mobileFrame') === '1'

  /** Экран выбора темы в конструкторе: показываем исходный шаблон без черновиков редактирования */
  const isWelcomeTemplate = searchParams.get('welcome') === '1'
  const isEditMode = !isWelcomeTemplate && searchParams.get('edit') === '1'

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('constructor-mobile-frame', constructorMobilePreview)
    return () => document.documentElement.classList.remove('constructor-mobile-frame')
  }, [constructorMobilePreview])

  /** Как в PublicPage: полный экран из конструктора в моб. режиме — узкий layout viewport */
  useEffect(() => {
    if (typeof document === 'undefined') return
    const meta = document.querySelector('meta[name="viewport"]')
    if (!meta) return
    const defaultContent = 'width=device-width, initial-scale=1.0'
    const narrow =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
    const applyNarrowViewport =
      isPreview &&
      isFullSizeView &&
      constructorMobilePreview &&
      !isEditMode &&
      !narrow
    const previous = meta.getAttribute('content') || defaultContent
    if (applyNarrowViewport) {
      meta.setAttribute('content', 'width=430, initial-scale=1, viewport-fit=cover')
    }
    return () => {
      if (applyNarrowViewport) meta.setAttribute('content', previous)
    }
  }, [isPreview, isFullSizeView, constructorMobilePreview, isEditMode])

  const lang: Lang = (typeof window !== 'undefined' ? localStorage.getItem('publicLang') as Lang : null) ?? 'ru'
  const siteName = typeof window !== 'undefined' ? (localStorage.getItem('businessName') || '') : ''
  const slug = typeof window !== 'undefined' ? (localStorage.getItem('publicSlug') || '') : ''

  const [, setPreviewDraftTick] = useState(0)
  const d = (key: string) =>
    isWelcomeTemplate
      ? ''
      : isMassageLangScopedTextKey(key)
        ? getMassageDraftLangAware(key, lang)
        : getMassageDraft(key)
  const massageThemeColors = useMemo(
    () =>
      isWelcomeTemplate
        ? parseMassageThemeColors('')
        : parseMassageThemeColors(getMassageDraft('publicMassageThemeColors')),
    [massageDraftSnap, isWelcomeTemplate]
  )

  const [heroVideoSrc, setHeroVideoSrc] = useState<string | null>(null)
  /**
   * Не привязываемся к massageDraftSnap: он тикает каждые 500ms и раньше на каждом тике
   * срабатывал cleanup → revokeObjectURL → повторная загрузка из IDB → зависание/зацикливание ролика.
   * Обновляем src только когда строка черновика реально меняется + по postMessage из конструктора.
   */
  useEffect(() => {
    let cancelled = false
    let blobUrl: string | null = null
    let lastRaw = '\u0000'
    let loadGen = 0

    const revokeBlob = () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
        blobUrl = null
      }
    }

    const sync = () => {
      if (cancelled) return
      const raw = isWelcomeTemplate ? '' : getMassageDraft('publicMassageHeroVideo')
      if (raw === lastRaw) return
      lastRaw = raw
      loadGen += 1
      const myGen = loadGen
      revokeBlob()

      if (!raw) {
        setHeroVideoSrc(null)
        return
      }
      if (raw !== MASSAGE_HERO_VIDEO_IDB_MARKER) {
        setHeroVideoSrc(raw)
        return
      }

      void (async () => {
        try {
          const u = await loadMassageHeroVideoObjectUrl(getMassageTemplateSlot())
          if (cancelled || myGen !== loadGen) {
            if (u) URL.revokeObjectURL(u)
            return
          }
          blobUrl = u
          setHeroVideoSrc(u)
        } catch {
          if (!cancelled && myGen === loadGen) setHeroVideoSrc(null)
        }
      })()
    }

    sync()
    const pollId = window.setInterval(sync, 500)
    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === 'constructorDraftChange') sync()
    }
    window.addEventListener('message', onMsg)
    return () => {
      cancelled = true
      window.clearInterval(pollId)
      window.removeEventListener('message', onMsg)
      revokeBlob()
    }
  }, [isWelcomeTemplate])

  const onSaveDraft = useCallback(
    (key: string, value: string) => {
      if (isMassageLangScopedTextKey(key)) setMassageDraftLangAware(key, lang, value)
      else setMassageDraft(key, value)
      setPreviewDraftTick(n => n + 1)
      try {
        if (typeof window !== 'undefined' && window.parent !== window) {
          window.parent.postMessage({ type: 'constructorMassageDraftChanged' }, '*')
        }
      } catch {
        /* ignore */
      }
    },
    [lang]
  )

  const handleBookNow = () => {
    if (slug) {
      navigate(`/b/${slug}/booking?returnTo=/massage-preview`)
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <MassageTemplate
      siteName={siteName}
      headerSiteName={d('publicSiteName') || undefined}
      heroTitle1={d('publicHeroTitle1') || undefined}
      heroTitle2={d('publicHeroTitle2') || undefined}
      heroSub={d('publicHeroSub') || undefined}
      heroBookOnline={
        isWelcomeTemplate
          ? undefined
          : (() => {
              const v = d('publicHeroBookOnline').trim()
              return v !== '' ? v : undefined
            })()
      }
      heroWhereFind={
        isWelcomeTemplate
          ? undefined
          : (() => {
              const v = d('publicHeroWhereFind').trim()
              return v !== '' ? v : undefined
            })()
      }
      lang={lang}
      onBookNow={handleBookNow}
      heroImage={d('publicMassageHeroBg') || null}
      heroVideo={heroVideoSrc}
      headerLogoUrl={d('publicLogo') || null}
      headerLogoShape={(d('publicHeaderLogoShape') as 'circle' | 'rounded' | 'square') || 'circle'}
      headerLogoVisible={d('publicHeaderLogoVisible') !== 'false'}
      massageThemeColors={massageThemeColors}
      headerPhone={d('publicPhone') || undefined}
      headerAddress={d('publicAddress') || undefined}
      headerTagline={d('publicTagline') || undefined}
      headerCallUs={d('publicCallUs') || undefined}
      headerContactOnline={d('publicContactOnline') || undefined}
      telegramUrl={d('publicTelegram')}
      viberUrl={d('publicViber')}
      whatsappUrl={d('publicWhatsapp')}
      instagramUrl={d('publicInstagram')}
      facebookUrl={d('publicFacebook')}
      vkUrl={d('publicVk')}
      twitterUrl={d('publicTwitter')}
      tiktokUrl={d('publicTiktok')}
      massageSvcTitle={d('publicMassageSvcTitle') || undefined}
      massageSvcSub={d('publicMassageSvcSub') || undefined}
      massageServicesJson={d('publicMassageServicesJson') || undefined}
      massageAboutTitle={d('publicMassageAboutTitle') || undefined}
      massageAboutText={d('publicMassageAboutText') || undefined}
      massageAboutMission={d('publicMassageAboutMission') || undefined}
      massageAboutAvatar={d('publicMassageAboutAvatar') || null}
      massageAboutAvatarPan={d('publicMassageAboutAvatarPan') || undefined}
      massageGalTitle={d('publicMassageGalTitle') || undefined}
      massageGalSub={d('publicMassageGalSub') || undefined}
      massageGalleryJson={d('publicMassageGalleryJson') || undefined}
      massageSubsTitle={d('publicMassageSubsTitle') || undefined}
      massageSubsJson={d('publicMassageSubsJson') || undefined}
      massageSubsCtaUrl={d('publicMassageSubsCtaUrl') || undefined}
      massageSubsCtaHidden={d('publicMassageSubsCtaHidden') || undefined}
      massageSubsHidden={d('publicMassageSubsHidden') || undefined}
      massageCatalogTitle={d('publicMassageCatalogTitle') || undefined}
      massageCatalogJson={d('publicMassageCatalogJson') || undefined}
      massageCatalogHidden={d('publicMassageCatalogHidden') || undefined}
      massageSpecsTitle={d('publicMassageSpecsTitle') || undefined}
      massageSpecsJson={d('publicMassageSpecsJson') || undefined}
      massageSpecsHidden={d('publicMassageSpecsHidden') || undefined}
      massageCtaTitle={d('publicMassageCtaTitle') || undefined}
      massageCtaSub={d('publicMassageCtaSub') || undefined}
      massageCtaBtn={d('publicMassageCtaBtn') || undefined}
      massageCtaHidden={d('publicMassageCtaHidden') || undefined}
      massageContactTitle={d('publicMassageContactTitle') || undefined}
      massageContactOurHeading={d('publicMassageContactOurHeading') || undefined}
      massageContactSchedule={d('publicMassageContactSchedule') || undefined}
      massageContactEmail={d('publicMassageContactEmail') || undefined}
      massageContactMapLabel={d('publicMassageContactMapLabel') || undefined}
      mapLat={d('publicMapLat') || undefined}
      mapLng={d('publicMapLng') || undefined}
      isEditMode={isEditMode}
      welcomeTemplateView={isWelcomeTemplate}
      {...(isEditMode ? { onSaveDraft } : {})}
    />
  )
}
