import { useState, useRef, useEffect, cloneElement, isValidElement } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Search, Menu, ArrowRight, Phone, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn, matchesSearchQuery } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import notificationIcon from '@/assets/images/admin-icons/notification-bell.png'

interface HeaderProps {
  sidebarContent?: React.ReactNode
}

interface Notification {
  id: string
  title: string
  msg: string
  time: string
  date: string
  type: 'confirmation' | 'reschedule' | 'reminder'
  read: boolean
  appointmentId?: string
}

export default function Header({ sidebarContent }: HeaderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useLanguage()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false)
  const sidebarNode = isValidElement(sidebarContent)
    ? cloneElement(sidebarContent, { onCollapse: () => setIsSidebarOpen(false) })
    : sidebarContent
  const [appointments, setAppointments] = useState<any[]>([])
  const notificationsRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)
  
  const currentView = location.pathname.split('/').pop() || 'dashboard'
  
  // Загружаем appointments из localStorage для поиска
  useEffect(() => {
    const loadAppointments = () => {
      const stored = localStorage.getItem('appointments')
      if (stored) {
        try {
          const allAppointments = JSON.parse(stored)
          // Удаляем все записи со статусом 'cancelled'
          const filtered = allAppointments.filter((apt: any) => apt.status !== 'cancelled')
          if (filtered.length !== allAppointments.length) {
            localStorage.setItem('appointments', JSON.stringify(filtered))
          }
          setAppointments(filtered)
        } catch (e) {
          console.error('Ошибка загрузки записей:', e)
          setAppointments([])
        }
      } else {
        setAppointments([])
      }
    }
    loadAppointments()
    
    // Слушаем изменения в localStorage
    const handleStorageChange = () => {
      loadAppointments()
    }
    window.addEventListener('storage', handleStorageChange)
    
    // Также проверяем изменения каждую секунду (так как storage event не срабатывает в той же вкладке)
    const interval = setInterval(loadAppointments, 1000)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])
  const viewTitleMap: Record<string, string> = {
    'dashboard': t('menu.home'),
    'calendar': t('menu.calendar'),
    'appointments': t('menu.appointments'),
    'services': t('menu.services'),
    'staff': t('menu.staff'),
    'customers': t('menu.customers'),
    'notifications': t('menu.notifications'),
    'settings': t('menu.settings'),
    'analytics': t('menu.analytics')
  }
  const viewTitle = viewTitleMap[currentView] || currentView

  // Моковые данные уведомлений (последние непрочитанные)
  const recentNotifications: Notification[] = [
    { 
      id: '1',
      title: t('notifications.confirmationRequest'), 
      msg: "Сара Уильямс записалась на 'Стрижку и укладку' на 9:00", 
      time: "5 мин назад",
      date: t('common.today'),
      type: "confirmation",
      read: false,
      appointmentId: '1'
    },
    { 
      id: '2',
      title: t('notifications.rescheduleRequest'), 
      msg: "Джеймс Смит хочет перенести запись на завтра", 
      time: "1 час назад",
      date: t('common.today'),
      type: "reschedule",
      read: false,
      appointmentId: '2'
    },
    { 
      id: '3',
      title: t('notifications.reminder'), 
      msg: "Через час запись: Майкл Росс - 'Полное бритье'", 
      time: "3 часа назад",
      date: t('common.today'),
      type: "reminder",
      read: false,
      appointmentId: '4'
    },
  ]

  const unreadCount = recentNotifications.filter(n => !n.read).length

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchDropdownOpen(false)
      }
    }

    if (isNotificationsOpen || isSearchDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isNotificationsOpen, isSearchDropdownOpen])

  const getNotificationIcon = () => (
    <img src={notificationIcon} alt="" className="w-5 h-5 object-contain brightness-0 invert" />
  )

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'confirmation':
        return 'bg-emerald-500/35 text-emerald-50 border-emerald-400/50'
      case 'reschedule':
        return 'bg-yellow-400/45 text-yellow-950 border-yellow-300/60'
      case 'reminder':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      default:
        return 'bg-card/30 text-foreground border-border/50'
    }
  }

  return (
    <header className="h-16 border-b border-border/50 bg-background/40 backdrop-blur-xl pl-0 pr-0 flex items-center justify-between z-10">
      <div className="flex items-center gap-4 pl-6">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 [&>button]:hidden">
            {sidebarNode}
          </SheetContent>
        </Sheet>
        
        <h1 className="text-xl font-display font-semibold capitalize">
          {viewTitle}
        </h1>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {currentView !== 'appointments' && currentView !== 'customers' && (
          <div ref={searchRef} className="relative hidden md:block w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground z-10 pointer-events-none" />
            <input 
              type="text" 
              placeholder={t('common.searchPlaceholder')} 
              value={searchQuery}
              onChange={(e) => {
                let value = e.target.value
                // Автоматически добавляем +373 если начинается с цифр
                if (value && /^\d/.test(value.replace(/\s+/g, ''))) {
                  const digitsOnly = value.replace(/\s+/g, '')
                  if (!digitsOnly.startsWith('+373')) {
                    value = '+373 ' + digitsOnly
                  }
                }
                setSearchQuery(value)
                setIsSearchDropdownOpen(value.trim().length > 0)
              }}
              onFocus={() => {
                if (searchQuery.trim().length > 0) {
                  setIsSearchDropdownOpen(true)
                }
              }}
              onBlur={() => {
                setTimeout(() => setIsSearchDropdownOpen(false), 200)
              }}
              className="w-full h-9 pl-9 pr-4 rounded-full bg-card/30 backdrop-blur-sm border border-border/50 focus:bg-card/50 focus:ring-2 focus:ring-primary/30 text-sm transition-all outline-none"
            />

            {isSearchDropdownOpen && searchQuery && (
              <div className="absolute z-[100] w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden max-h-96 overflow-y-auto scrollbar-hide">
                {(() => {
                  // Фильтруем записи по поисковому запросу
                  const filteredAppointments = appointments.filter(apt => 
                    matchesSearchQuery({ client: apt.client, phone: apt.phone }, searchQuery)
                  )
                  
                  // Получаем уникальных клиентов (по имени + телефону)
                  const uniqueClients = Array.from(
                    new Map(
                      filteredAppointments.map(apt => {
                        const key = `${apt.client}_${apt.phone}`
                        return [key, { 
                          client: apt.client, 
                          phone: apt.phone,
                          appointments: filteredAppointments.filter(a => a.client === apt.client && a.phone === apt.phone)
                        }]
                      })
                    ).values()
                  )
                  
                  if (uniqueClients.length === 0) {
                    return (
                      <div className="p-4 text-center text-muted-foreground text-sm">
                        Ничего не найдено
                      </div>
                    )
                  }
                  
                  return (
                    <div className="py-1">
                      {uniqueClients.map((clientData, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            const firstAppointment = clientData.appointments[0]
                            if (firstAppointment) {
                              // Навигация к записи (используем replace: true, чтобы обновить состояние даже если уже на главной)
                              navigate('/dashboard', { 
                                state: { openAppointmentId: firstAppointment.id },
                                replace: true
                              })
                              setSearchQuery('')
                              setIsSearchDropdownOpen(false)
                            }
                          }}
                          className="w-full px-4 py-3 text-left hover:bg-accent/10 transition-colors border-b border-border/50 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{clientData.client}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <p className="text-sm text-muted-foreground truncate">{clientData.phone}</p>
                              </div>
                              <p className="text-xs text-muted-foreground/70 mt-1">
                                {clientData.appointments.length} {clientData.appointments.length === 1 ? 'запись' : 'записей'}
                              </p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg] flex-shrink-0" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )
                })()}
              </div>
            )}
          </div>
        )}
        <div ref={notificationsRef} className="relative">
          <Button 
            variant="ghost" 
            className="text-muted-foreground relative backdrop-blur-sm mr-4 w-14 h-14"
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
          >
            <img src={notificationIcon} alt="" className="h-11 w-11 object-contain" />
            {unreadCount > 0 && (
              <span className="absolute top-[16px] right-[16px] w-2 h-2 bg-orange-400 rounded-full shadow-lg shadow-orange-400/60" />
            )}
          </Button>

          {isNotificationsOpen && (
            <div className="absolute right-0 top-full mt-2 w-96 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden z-[90]">
              <div className="p-4 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{t('notifications.title')}</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-muted-foreground">{unreadCount} {t('notifications.unread')}</span>
                  )}
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto scrollbar-hide">
                {recentNotifications.length > 0 ? (
                  <div className="divide-y divide-border/50">
                    {recentNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-muted/30 transition-colors cursor-pointer",
                          !notification.read && "bg-muted/10"
                        )}
                        onClick={() => {
                          if (notification.appointmentId) {
                            navigate(`/dashboard/appointments`, { 
                              state: { openAppointmentId: notification.appointmentId } 
                            })
                          }
                          setIsNotificationsOpen(false)
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center border",
                            getNotificationColor(notification.type)
                          )}>
                            {getNotificationIcon()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-sm text-foreground">{notification.title}</h4>
                              {!notification.read && (
                                <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.msg}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">{notification.time}</span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">{notification.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    <img src={notificationIcon} alt="" className="w-10 h-10 mx-auto mb-2 opacity-50 object-contain" />
                    <p className="text-sm">{t('notifications.noNewNotifications')}</p>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  className="w-full justify-between text-sm"
                  onClick={() => {
                    navigate('/dashboard/notifications')
                    setIsNotificationsOpen(false)
                  }}
                >
                  <span>{t('notifications.allNotifications')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
