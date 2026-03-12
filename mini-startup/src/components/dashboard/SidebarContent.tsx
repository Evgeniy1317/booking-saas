import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { LogOut, Plus, ChevronDown, Moon, Sun, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { Language } from '@/lib/translations'
import iconHome from '@/assets/images/admin-icons/home.png'
import iconCalendar from '@/assets/images/admin-icons/schedule.png'
import iconAppointments from '@/assets/images/admin-icons/edit.png'
import iconServices from '@/assets/images/admin-icons/scissors.png'
import iconStaff from '@/assets/images/admin-icons/management.png'
import iconCustomers from '@/assets/images/admin-icons/rating.png'
import iconNotifications from '@/assets/images/admin-icons/notification-bell.png'
import iconAnalytics from '@/assets/images/admin-icons/bar-chart.png'
import iconSettings from '@/assets/images/admin-icons/setting.png'
import flagRu from '@/assets/images/russia.png'
import flagEn from '@/assets/images/united-kingdom.png'
import flagRo from '@/assets/images/flag.png'

interface SidebarContentProps {
  onCollapse?: () => void
}

interface MenuItem {
  name: string
  icon: string
  path: string
  badge?: string
  badgeTooltip?: string
}

const menuItemsKeys = [
  { key: 'menu.home', icon: iconHome, path: '/dashboard' },
  { key: 'menu.calendar', icon: iconCalendar, path: '/dashboard/calendar' },
  { key: 'menu.appointments', icon: iconAppointments, path: '/dashboard/appointments' },
  { key: 'menu.services', icon: iconServices, path: '/dashboard/services' },
  { key: 'menu.staff', icon: iconStaff, path: '/dashboard/staff' },
  { key: 'menu.customers', icon: iconCustomers, path: '/dashboard/customers' },
  { key: 'menu.notifications', icon: iconNotifications, path: '/dashboard/notifications' },
  { key: 'menu.analytics', icon: iconAnalytics, path: '/dashboard/analytics', badge: 'Plus', badgeTooltip: 'При покупке профессионального пакета' },
  { key: 'menu.settings', icon: iconSettings, path: '/dashboard/settings' },
]

const languages = [
  { code: 'ru', name: 'Русский', abbr: 'RU', flag: flagRu },
  { code: 'ro', name: 'Romanian', abbr: 'RO', flag: flagRo },
  { code: 'en', name: 'English', abbr: 'EN', flag: flagEn },
]

export default function SidebarContent({ onCollapse }: SidebarContentProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { language, setLanguage, t } = useLanguage()
  const [isLanguageOpen, setIsLanguageOpen] = useState(false)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  const [showThemeNotice, setShowThemeNotice] = useState(false)
  const languageRef = useRef<HTMLDivElement>(null)
  const themeRef = useRef<HTMLDivElement>(null)
  

  // Закрытие выпадающего списка языка при клике вне его
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false)
      }
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setShowThemeNotice(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    if (!showThemeNotice) return
    const timer = setTimeout(() => setShowThemeNotice(false), 2200)
    return () => clearTimeout(timer)
  }, [showThemeNotice])

  const handleLogout = () => {
    // TODO: Очистить сессию/токены когда будет подключен Supabase
    // Например: await supabase.auth.signOut()
    
    // Перенаправление на страницу входа
    navigate('/login')
  }

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    // Применяем тему к приложению
    if (newTheme === 'light') {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')
    }
    // Сохраняем в localStorage
    localStorage.setItem('theme', newTheme)
  }
  
  // Загружаем тему из localStorage при монтировании
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === 'light') {
        document.documentElement.classList.add('light')
        document.documentElement.classList.remove('dark')
      } else {
        document.documentElement.classList.remove('light')
        document.documentElement.classList.add('dark')
      }
    }
  }, [])

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="flex flex-col h-full p-3 pb-1 max-[900px]:p-2.5 max-[800px]:p-2 max-[700px]:p-2 relative">
      {/* Крестик в правом верхнем углу */}
      {onCollapse && (
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onCollapse()
          }}
          className="absolute top-2.5 right-3 w-7 h-7 items-center justify-center rounded-lg text-muted-foreground hover:text-primary transition-colors z-50 group cursor-pointer border border-border/50 hover:border-primary/50 flex"
          aria-label="Закрыть меню"
        >
          <X className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </button>
      )}
      
      <div className="px-2 py-2.5 mb-3 text-center max-[900px]:text-left max-[900px]:py-2 max-[900px]:mb-2 max-[800px]:py-1.5 max-[800px]:mb-2 max-[700px]:py-1 max-[700px]:mb-1">
        <span className="block font-sans font-semibold text-2xl max-[900px]:text-xl max-[800px]:text-lg max-[700px]:text-base tracking-[0.08em] bg-gradient-to-r from-sidebar-foreground to-sidebar-foreground/70 bg-clip-text text-transparent">
          Bookera
        </span>
        <div className="mt-3 max-[900px]:mt-2 max-[800px]:mt-1.5 max-[700px]:mt-1 h-px w-full bg-sidebar-border/70" />
      </div>

      <nav className="flex-1 space-y-1 max-[900px]:space-y-0.5 max-[800px]:space-y-0.5 max-[700px]:space-y-0 mb-3 max-[900px]:mb-2 max-[800px]:mb-2 max-[700px]:mb-1">
        {menuItemsKeys.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={(e) => {
                e.stopPropagation()
                if (onCollapse && window.innerWidth < 1024) onCollapse()
                window.scrollTo({ top: 0, behavior: 'smooth' })
              }}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-2 md:px-3 md:py-2.5 lg:px-3 lg:py-2.5 rounded-xl text-[15px] lg:text-sm font-medium transition-all cursor-pointer backdrop-blur-sm group",
                isActive
                  ? "bg-primary/20 text-foreground border border-primary/30 shadow-lg"
                  : "text-muted-foreground hover:bg-sidebar-accent/30 hover:text-foreground hover:border border-transparent hover:border-border/50"
              )}
              title={item.badgeTooltip}
            >
              <div className="grid grid-cols-[24px_1fr] items-center gap-2.5">
                <span className="w-6 h-6 flex items-center justify-center">
                  <img src={item.icon} alt={t(item.key)} className="w-6 h-6 object-contain block" />
                </span>
                <span>{t(item.key)}</span>
              </div>
              {item.badge && (
                <Badge 
                  variant="outline" 
                  className="text-xs px-1.5 py-0.5 bg-primary/10 text-primary border-primary/30"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto max-[900px]:mt-2 max-[800px]:mt-1 max-[700px]:mt-0.5">
        {/* Выбор языка и темы (над чертой) */}
        <div className="flex items-center gap-2 mb-1 mt-20 max-[900px]:mb-1 max-[900px]:mt-16 max-[800px]:mb-0.5 max-[800px]:mt-14 max-[700px]:mb-0.5 max-[700px]:mt-12">
          {/* Выбор языка */}
          <div ref={languageRef} className="relative flex-1">
            <button
              type="button"
              onClick={() => setIsLanguageOpen(!isLanguageOpen)}
            className={cn(
              "w-full h-9 px-3 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between gap-2 text-sm max-[900px]:h-8 max-[900px]:text-[12px] max-[800px]:h-7 max-[800px]:px-2 max-[800px]:text-[11px] max-[700px]:h-6 max-[700px]:text-[10px]",
                isLanguageOpen
                  ? "border-accent/50 ring-2 ring-accent/30"
                  : "border-border/50 hover:border-accent/30"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full overflow-hidden border border-border/60">
                  <img src={currentLanguage.flag} alt={currentLanguage.name} className="w-full h-full object-cover" />
                </span>
                <span className="text-base w-6 text-center font-medium max-[900px]:text-sm max-[800px]:text-sm max-[700px]:text-[10px]">
                  {currentLanguage.abbr}
                </span>
                <span className="text-foreground text-xs max-[900px]:text-[11px] max-[800px]:text-[10px] max-[700px]:text-[9px]">
                  {currentLanguage.name}
                </span>
              </div>
              <ChevronDown className={cn(
              "w-4 h-4 transition-transform text-muted-foreground max-[900px]:w-3.5 max-[900px]:h-3.5 max-[800px]:w-3 max-[800px]:h-3 max-[700px]:w-2.5 max-[700px]:h-2.5",
                isLanguageOpen && "rotate-180"
              )} />
            </button>
            
            {isLanguageOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden z-50">
                <div className="py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => {
                        setLanguage(lang.code as Language)
                        setIsLanguageOpen(false)
                      }}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2",
                        language === lang.code
                          ? "bg-accent/10 text-accent"
                          : "text-foreground hover:bg-accent/10 hover:text-accent"
                      )}
                    >
                      <span className="w-5 h-5 rounded-full overflow-hidden border border-border/60">
                        <img src={lang.flag} alt={lang.name} className="w-full h-full object-cover" />
                      </span>
                      <span className="text-base w-6 text-center font-medium">{lang.abbr}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Переключатель темы */}
          <div ref={themeRef} className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowThemeNotice(true)
              }}
              className="h-9 w-9 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:border-accent/30 transition-all flex items-center justify-center text-foreground max-[900px]:h-8 max-[900px]:w-8 max-[800px]:h-7 max-[800px]:w-7 max-[700px]:h-6 max-[700px]:w-6"
              aria-label="Переключить тему"
            >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 max-[900px]:w-3.5 max-[900px]:h-3.5 max-[800px]:w-3 max-[800px]:h-3 max-[700px]:w-2.5 max-[700px]:h-2.5" />
            ) : (
              <Moon className="w-4 h-4 max-[900px]:w-3.5 max-[900px]:h-3.5 max-[800px]:w-3 max-[800px]:h-3 max-[700px]:w-2.5 max-[700px]:h-2.5" />
            )}
            </button>
            {showThemeNotice && (
              <div className="absolute bottom-full right-0 mb-2 w-44 rounded-lg border border-border/60 bg-card/95 px-2.5 py-2 text-[11px] text-foreground shadow-xl">
                {language === 'ru' ? (
                  <>
                    Другие темы доступны при подписке{' '}
                    <span className="text-primary font-semibold">Plus+</span>
                  </>
                ) : language === 'ro' ? (
                  <>
                    Alte teme sunt disponibile cu abonamentul{' '}
                    <span className="text-primary font-semibold">Plus+</span>
                  </>
                ) : (
                  <>
                    Other themes are available with the{' '}
                    <span className="text-primary font-semibold">Plus+</span> subscription
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Черта и кнопка выхода */}
        <div className="border-t border-sidebar-border mt-2 pt-2 mb-0 max-[900px]:mt-2 max-[900px]:pt-2 max-[800px]:mt-2 max-[800px]:pt-2 max-[700px]:mt-1 max-[700px]:pt-1">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm py-2 max-[900px]:text-xs max-[900px]:py-1.5 max-[800px]:text-xs max-[800px]:py-1.5 max-[700px]:py-1 max-[700px]:text-[11px]"
          >
            <LogOut className="mr-2 h-4 w-4 max-[900px]:h-3.5 max-[900px]:w-3.5 max-[800px]:h-3.5 max-[800px]:w-3.5 max-[700px]:h-3 max-[700px]:w-3" />
            {t('common.logout')}
          </Button>
        </div>
      </div>
    </div>
  )
}
