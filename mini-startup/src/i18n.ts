import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { translations } from '@/lib/translations'

const getStoredLanguage = () => {
  try {
    return localStorage.getItem('language')
  } catch {
    return null
  }
}

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: translations.ru },
    ro: { translation: translations.ro },
    en: { translation: translations.en },
  },
  lng: getStoredLanguage() || 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
  keySeparator: '.',
})

export default i18n





