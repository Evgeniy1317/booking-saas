import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, X, ChevronDown, ChevronUp, Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import notificationIcon from '@/assets/images/admin-icons/notification-bell.png'

interface Notification {
  id: string
  title: string
  msg: string
  time: string
  date: string
  type: 'confirmation' | 'reschedule' | 'reminder'
  read: boolean
  appointmentId?: string // ID записи для перехода
}

export default function Notifications() {
  const { t, language } = useLanguage()
  const navigate = useNavigate()
  const [showOldNotifications, setShowOldNotifications] = useState(false)
  const [selectedDateFilter, setSelectedDateFilter] = useState<Date | null>(null)
  const [isDateFilterOpen, setIsDateFilterOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())

  const [notifications, setNotifications] = useState<Notification[]>([
    { 
      id: '1',
      title: "Запрос на подтверждение", 
      msg: "Сара Уильямс записалась на 'Стрижку и укладку' на 9:00", 
      time: "5 мин назад",
      date: "Сегодня",
      type: "confirmation",
      read: false,
      appointmentId: '1'
    },
    { 
      id: '2',
      title: "Запрос на перенос", 
      msg: "Джеймс Смит хочет перенести запись на завтра", 
      time: "1 час назад",
      date: "Сегодня",
      type: "reschedule",
      read: false,
      appointmentId: '2'
    },
    { 
      id: '3',
      title: "Напоминание", 
      msg: "Через час запись: Майкл Росс - 'Полное бритье'", 
      time: "3 часа назад",
      date: "Сегодня",
      type: "reminder",
      read: false,
      appointmentId: '4'
    },
    { 
      id: '4',
      title: "Запрос на подтверждение", 
      msg: "Эмили Браун записалась на 'Окрашивание' на 13:00", 
      time: "14:30",
      date: "Вчера",
      type: "confirmation",
      read: true,
      appointmentId: '3'
    },
    { 
      id: '5',
      title: "Напоминание", 
      msg: "Через 2 часа запись: Анна Петрова - 'Маникюр'", 
      time: "11:00",
      date: "Вчера",
      type: "reminder",
      read: true,
      appointmentId: '5'
    },
    { 
      id: '6',
      title: "Запрос на перенос", 
      msg: "Иван Иванов хочет перенести запись на следующую неделю", 
      time: "16:45",
      date: "27 декабря",
      type: "reschedule",
      read: true,
      appointmentId: '6'
    },
  ])

  const getNotificationIcon = () => (
    <img src={notificationIcon} alt="" className="w-6 h-6 object-contain brightness-0 invert" />
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

  const handleNotificationClick = (notification: Notification) => {
    // Помечаем уведомление как прочитанное, но сохраняем его дату
    // Уведомление останется в разделе старых уведомлений с той же датой
    setNotifications(notifications.map(note => 
      note.id === notification.id 
        ? { ...note, read: true }
        : note
    ))
    
    // Переходим на страницу записей с указанием конкретной записи
    navigate('/dashboard/appointments', { 
      state: { 
        openAppointmentId: notification.appointmentId,
        highlightAppointment: notification.appointmentId
      } 
    })
  }

  const handleGoToSettings = () => {
    navigate('/dashboard/settings', { state: { scrollTo: 'notifications' } })
  }

  const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { day: 'numeric', month: 'long' })
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Понедельник = 0
    
    const days = []
    // Пустые ячейки для начала месяца
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Дни месяца
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear()
  }

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDateFilter) return false
    return date.getDate() === selectedDateFilter.getDate() &&
           date.getMonth() === selectedDateFilter.getMonth() &&
           date.getFullYear() === selectedDateFilter.getFullYear()
  }

  // Группировка уведомлений по датам
  const groupedNotifications = notifications.reduce((acc, note) => {
    if (!acc[note.date]) {
      acc[note.date] = []
    }
    acc[note.date].push(note)
    return acc
  }, {} as Record<string, Notification[]>)

  // Новые уведомления - только непрочитанные с датой "Сегодня"
  const todayStr = t('common.today')
  const todayNotifications = (groupedNotifications[todayStr] || []).filter(note => !note.read)
  
  // Старые уведомления - все прочитанные или с другой датой
  const yesterdayStr = t('customers.yesterday')
  const oldNotifications = Object.entries(groupedNotifications)
    .map(([date, notes]) => {
      // Для "Сегодня" берем только прочитанные
      if (date === todayStr) {
        const readNotes = notes.filter(note => note.read)
        return readNotes.length > 0 ? [date, readNotes] : null
      }
      // Для остальных дат берем все уведомления
      return [date, notes]
    })
    .filter((entry): entry is [string, Notification[]] => entry !== null)
    .sort(([dateA], [dateB]) => {
      // Сначала "Сегодня" (прочитанные), потом "Вчера", потом по датам
      if (dateA === todayStr) return -1
      if (dateB === todayStr) return 1
      if (dateA === yesterdayStr) return -1
      if (dateB === yesterdayStr) return 1
      return dateB.localeCompare(dateA)
    })

  // Фильтрация старых уведомлений по выбранной дате
  const filteredOldNotifications = selectedDateFilter === null
    ? oldNotifications 
    : oldNotifications.filter(([date]) => {
        // Простая проверка - в реальном приложении нужно сравнивать даты
        return true // Пока оставляем все, так как у нас строковые даты
      })

  const days = getDaysInMonth(calendarDate)
  const weekDays = [t('appointments.monday'), t('appointments.tuesday'), t('appointments.wednesday'), t('appointments.thursday'), t('appointments.friday'), t('appointments.saturday'), t('appointments.sunday')]

  return (
    <div className="space-y-6">
      {/* Последние уведомления */}
      {todayNotifications.length > 0 && (
        <div className="space-y-3">
          {todayNotifications.map((note) => (
            <Card 
              key={note.id} 
              onClick={() => handleNotificationClick(note)}
              className={cn(
                "p-4 backdrop-blur-xl bg-card/60 border-border/50 transition-all hover:bg-card/80 cursor-pointer"
              )}
            >
              <div className="flex items-start gap-4">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                  getNotificationColor(note.type)
                )}>
                  {getNotificationIcon()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-bold text-sm text-foreground">{note.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{note.time}</span>
                      {!note.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{note.msg}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Кнопка показать старые уведомления */}
      {oldNotifications.length > 0 && (
        <div>
          <Button
            variant="outline"
            onClick={() => setShowOldNotifications(!showOldNotifications)}
            className="w-full rounded-full border-border/50 bg-card/30 hover:bg-card/50"
          >
            {showOldNotifications ? (
              <>
                <ChevronUp className="w-4 h-4 mr-2" />
                {t('notifications.hideOldNotifications')}
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4 mr-2" />
                {t('notifications.showOldNotifications')}
              </>
            )}
          </Button>
        </div>
      )}

      {/* Старые уведомления */}
      {showOldNotifications && oldNotifications.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {t('notifications.oldNotifications')}
            </h3>
            {/* Календарь фильтр */}
            <div className="relative flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsDateFilterOpen(!isDateFilterOpen)}
                className={`h-9 px-3 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-center gap-2 ${
                  isDateFilterOpen
                    ? 'border-accent/50 ring-2 ring-accent/30'
                    : 'border-border/50 hover:border-accent/30'
                } text-foreground`}
              >
                <CalendarIcon className="w-4 h-4" />
                {selectedDateFilter && (
                  <span className="text-xs text-muted-foreground">
                    {formatDateForDisplay(selectedDateFilter)}
                  </span>
                )}
              </button>
              {selectedDateFilter && (
                <button
                  type="button"
                  onClick={() => setSelectedDateFilter(null)}
                  className="h-9 px-2 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:border-accent/30 transition-all text-foreground"
                  aria-label={t('notifications.resetFilter')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          {/* Модальное окно календаря */}
          {isDateFilterOpen && (
            <>
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9998]"
                onClick={() => setIsDateFilterOpen(false)}
              />
              <div 
                className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setIsDateFilterOpen(false)
                  }
                }}
              >
                <Card 
                  className="w-full max-w-sm backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-lg">{t('appointments.selectDate')}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDateFilterOpen(false)}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newDate = new Date(calendarDate)
                          newDate.setMonth(newDate.getMonth() - 1)
                          setCalendarDate(newDate)
                        }}
                        className="h-8 w-8"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="font-semibold text-sm">
                        {calendarDate.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newDate = new Date(calendarDate)
                          newDate.setMonth(newDate.getMonth() + 1)
                          setCalendarDate(newDate)
                        }}
                        className="h-8 w-8"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {weekDays.map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                      {days.map((date, idx) => {
                        if (!date) {
                          return <div key={idx} className="aspect-square" />
                        }
                        const isTodayDate = isToday(date)
                        const isSelectedDate = isSelected(date)
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              setSelectedDateFilter(date)
                              setIsDateFilterOpen(false)
                            }}
                            className={cn(
                              "aspect-square rounded-lg text-sm transition-all hover:bg-accent/20",
                              isTodayDate && "bg-primary/20 text-primary font-semibold",
                              isSelectedDate && "bg-primary text-primary-foreground font-semibold",
                              !isTodayDate && !isSelectedDate && "hover:text-foreground text-muted-foreground"
                            )}
                          >
                            {date.getDate()}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </Card>
              </div>
            </>
          )}
          
          {filteredOldNotifications.length === 0 ? (
            <Card className="p-8 text-center backdrop-blur-xl bg-card/60">
              <p className="text-muted-foreground text-sm">{t('notifications.noNotificationsForDate')}</p>
            </Card>
          ) : (
            filteredOldNotifications.map(([date, notes]) => (
              <div key={date} className="space-y-3">
                <h4 className="text-xs font-medium text-muted-foreground px-2">{date}</h4>
                {notes.map((note) => (
                  <Card 
                    key={note.id} 
                    onClick={() => handleNotificationClick(note)}
                    className={cn(
                      "p-4 backdrop-blur-xl bg-card/60 border-border/50 transition-all hover:bg-card/80 cursor-pointer opacity-75"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border",
                        getNotificationColor(note.type)
                      )}>
                        {getNotificationIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="font-bold text-sm text-foreground">{note.title}</h3>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{note.time}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{note.msg}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ))
          )}
        </div>
      )}

      {notifications.length === 0 && (
        <Card className="p-12 text-center backdrop-blur-xl bg-card/60">
          <img src={notificationIcon} alt="" className="w-14 h-14 mx-auto mb-4 opacity-50 object-contain" />
          <p className="text-muted-foreground">{t('notifications.noNotifications')}</p>
        </Card>
      )}

      {/* Кнопка настроить уведомления */}
      <div className="pt-6">
        <Button 
          onClick={handleGoToSettings}
          className="w-full rounded-full bg-primary hover:bg-primary/90 flex items-center justify-center gap-2"
        >
          {t('notifications.configureNotifications')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}
