import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MassageTemplate from '@/components/public/MassageTemplate'
import { useMassageDraftSnapshot, getMassageDraft } from '@/lib/massage-draft'
import { parseMassageThemeColors } from '@/lib/massage-theme-palette'

type Lang = 'ru' | 'en' | 'ro'

export default function MassagePreviewPage() {
  const navigate = useNavigate()
  /** Перерисовка при изменении черновиков из конструктора (другая вкладка / polling) */
  const massageDraftSnap = useMassageDraftSnapshot()

  const lang: Lang = (typeof window !== 'undefined' ? localStorage.getItem('publicLang') as Lang : null) ?? 'ru'
  const siteName = typeof window !== 'undefined' ? (localStorage.getItem('businessName') || '') : ''
  const slug = typeof window !== 'undefined' ? (localStorage.getItem('publicSlug') || '') : ''

  const d = (key: string) => getMassageDraft(key)
  const massageThemeColors = useMemo(
    () => parseMassageThemeColors(getMassageDraft('publicMassageThemeColors')),
    [massageDraftSnap]
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
      lang={lang}
      onBookNow={handleBookNow}
      heroImage={d('publicMassageHeroBg') || null}
      heroVideo={d('publicMassageHeroVideo') || null}
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
    />
  )
}
