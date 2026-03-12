import { createContext, useContext, useState, ReactNode } from 'react'
import i18n from '@/i18n'
import { Language, getTranslation } from '@/lib/translations'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('language') as Language | null
      if (saved === 'ru' || saved === 'ro' || saved === 'en') {
        return saved
      }
    } catch {
      // ignore localStorage access errors
    }
    const initial = i18n.language?.split('-')[0]
    return initial === 'ru' || initial === 'ro' || initial === 'en' ? initial : 'ru'
  })

  const setLanguage = (lang: Language) => {
    try {
      // Проверяем, что язык валидный
      if (lang !== 'ru' && lang !== 'ro' && lang !== 'en') {
        lang = 'ru'
      }
      setLanguageState(lang)
      localStorage.setItem('language', lang)
      i18n.changeLanguage(lang)
    } catch (e) {
      console.error('Error setting language:', e)
    }
  }

  const t = (key: string) => i18n.t(key)

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    // Fallback для случаев, когда контекст еще не инициализирован
    return {
      language: 'ru' as Language,
      setLanguage: () => {},
      t: (key: string) => i18n.t(key)
    }
  }
  return context
}

