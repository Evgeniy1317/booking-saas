import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, X, Phone, Mail, Calendar as CalendarIcon, History, CheckCircle2, UserCheck, UserX, XCircle, Globe, User, RotateCcw, ChevronDown, Clock, Trash2, Pencil, ChevronLeft, ChevronRight, FileText, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AVAILABLE_SLOTS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'
import { getTranslation, Language } from '@/lib/translations'
import { getCanonicalSalonBusinessName } from '@/lib/salon-business-name'

export default function Home() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  
  // TODO: Получать из Supabase/контекста когда будет подключено
  // Пока используем данные из localStorage или моковые данные
  const getUserName = () => {
    // Получаем полное имя из localStorage (сохранено при регистрации)
    const storedFullName = localStorage.getItem('fullName')
    if (storedFullName) {
      return storedFullName
    }
    // Fallback: если полного имени нет, используем имя из email
    const storedEmail = localStorage.getItem('userEmail')
    if (storedEmail) {
      const name = storedEmail.split('@')[0]
      return name.charAt(0).toUpperCase() + name.slice(1) || t('common.user')
    }
    return t('common.user')
  }

  const getBusinessName = () => {
    const name = getCanonicalSalonBusinessName()
    return name || t('common.salon')
  }

  const userName = getUserName()
  const businessName = getBusinessName()
  const formatFullDate = (date: Date) => {
    const locale = language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US'
    const formatted = date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [showClientHistory, setShowClientHistory] = useState(false)
  const [historyClient, setHistoryClient] = useState<string | null>(null)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const [isMasterOpen, setIsMasterOpen] = useState(false)
  const [isStartTimeDropdownOpen, setIsStartTimeDropdownOpen] = useState(false)
  const [isContactMethodOpen, setIsContactMethodOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())
  
  const serviceDropdownRef = useRef<HTMLDivElement>(null)
  const masterDropdownRef = useRef<HTMLDivElement>(null)
  const startTimeDropdownRef = useRef<HTMLDivElement>(null)
  const startTimeInputRef = useRef<HTMLInputElement>(null)
  const contactMethodRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)

  // Функция для загрузки услуг из localStorage
  const loadServices = (): string[] => {
    const stored = localStorage.getItem('services')
    if (stored) {
      try {
        const services = JSON.parse(stored)
        // Возвращаем только активные услуги
        return services.filter((s: any) => s.active).map((s: any) => s.name)
      } catch (e) {
        console.error('Ошибка загрузки услуг:', e)
      }
    }
    // Если нет сохраненных услуг, возвращаем пустой массив
    return []
  }

  // Функция для получения цены услуги по названию
  const getServicePrice = (serviceName: string): number | undefined => {
    const stored = localStorage.getItem('services')
    if (stored) {
      try {
        const services = JSON.parse(stored)
        const service = services.find((s: any) => s.name === serviceName && s.active)
        return service ? service.price : undefined
      } catch (e) {
        console.error('Ошибка загрузки услуг для получения цены:', e)
      }
    }
    return undefined
  }

  const [services, setServices] = useState<string[]>(loadServices())
  
  // Функция для загрузки мастеров из localStorage
  const loadMasters = (): string[] => {
    const stored = localStorage.getItem('staff')
    if (stored) {
      try {
        const staff = JSON.parse(stored)
        // Возвращаем только активных мастеров
        return staff.filter((s: any) => s.active).map((s: any) => s.name)
      } catch (e) {
        console.error('Ошибка загрузки мастеров:', e)
      }
    }
    // Если нет сохраненных мастеров, возвращаем пустой массив
    return []
  }

  const [masters, setMasters] = useState<string[]>(loadMasters())
  
  // Обновляем мастеров при монтировании и при изменении localStorage
  useEffect(() => {
    const updateMasters = () => {
      setMasters(loadMasters())
    }
    updateMasters()
    window.addEventListener('storage', updateMasters)
    const interval = setInterval(updateMasters, 1000)
    return () => {
      window.removeEventListener('storage', updateMasters)
      clearInterval(interval)
    }
  }, [])
  
  // Обновляем услуги при монтировании и при изменении localStorage
  useEffect(() => {
    const updateServices = () => {
      setServices(loadServices())
    }
    updateServices()
    window.addEventListener('storage', updateServices)
    const interval = setInterval(updateServices, 1000)
    return () => {
      window.removeEventListener('storage', updateServices)
      clearInterval(interval)
    }
  }, [])

  // Функция для получения актуальной сегодняшней даты (использует локальное время, а не UTC)
  const getToday = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [newAppointmentForm, setNewAppointmentForm] = useState({
    client: '',
    phone: '',
    email: '',
    comment: '',
    contactMethod: '',
    contactHandle: '',
    service: '',
    master: '',
    startTime: '',
    endTime: '',
    date: getToday(),
  })

  const socialOptions = ['Telegram', 'WhatsApp', 'Viber', 'Instagram', 'Facebook']

  // Загрузка записей на сегодня - используем ту же логику, что и в Calendar.tsx
  const loadTodayAppointments = () => {
    const today = getToday()
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const filtered = parsed.filter((apt: any) => apt.status !== 'cancelled')
        const todayAppointments = filtered.filter((apt: any) => {
          const aptDate = apt.date ? apt.date.split('T')[0] : ''
          return aptDate === today
        })
        return todayAppointments
      } catch (e) {
        console.error('Ошибка загрузки записей:', e)
      }
    }
    return []
  }

  const loadAppointments = () => {
    const today = getToday()
    const defaultAppointments = [
      { 
        id: '1', 
        startTime: '09:00', 
        endTime: '10:00',
        client: 'Сара Уильямс',
        phone: '+373 123 456',
        email: 'sara@example.com',
        service: 'Стрижка и укладка', 
        master: 'Алекс Ривера', 
        date: today,
        status: 'pending',
        source: 'online' as const
      },
      { 
        id: '2', 
        startTime: '11:00', 
        endTime: '12:00',
        client: 'Джеймс Смит',
        phone: '+373 234 567',
        email: 'james@example.com',
        service: 'Стрижка бороды', 
        master: 'Майк Джонсон', 
        date: today,
        status: 'pending',
        source: 'online' as const
      },
      { 
        id: '3', 
        startTime: '11:00', 
        endTime: '11:30',
        client: 'Анна Петрова',
        phone: '+373 345 678',
        service: 'Маникюр', 
        master: 'Сара Чен', 
        date: today,
        status: 'pending',
        source: 'online' as const
      },
      { 
        id: '4', 
        startTime: '14:00', 
        endTime: '15:30',
        client: 'Эмили Браун',
        phone: '+373 456 789',
        email: 'emily@example.com',
        service: 'Окрашивание', 
        master: 'Сара Чен', 
        date: today,
        status: 'confirmed',
        source: 'admin' as const
      },
      // Новые записи с лендинга (автоматически добавленные клиентами)
      { 
        id: '5', 
        startTime: '10:00', 
        endTime: '11:00',
        client: 'Марк Иванов',
        phone: '+373 567 890',
        email: 'mark.ivanov@example.com',
        service: 'Стрижка и укладка', 
        master: 'Алекс Ривера', 
        date: today,
        status: 'pending',
        source: 'online' as const
      },
      { 
        id: '6', 
        startTime: '13:00', 
        endTime: '14:00',
        client: 'Ольга Козлова',
        phone: '+373 678 901',
        email: 'olga.kozlova@example.com',
        service: 'Маникюр', 
        master: 'Сара Чен', 
        date: today,
        status: 'pending',
        source: 'online' as const
      },
    ]

    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Удаляем все записи со статусом 'cancelled' и сохраняем обратно в localStorage
        const filtered = parsed.filter((apt: any) => apt.status !== 'cancelled')
        if (filtered.length !== parsed.length) {
          localStorage.setItem('appointments', JSON.stringify(filtered))
        }
        // Фильтруем записи только на сегодня (нормализуем даты для сравнения)
        const todayAppointments = filtered.filter((apt: any) => {
          const aptDate = apt.date ? apt.date.split('T')[0] : ''
          return aptDate === today
        }).map((apt: any) => {
          // Добавляем цену, если её нет
          if (apt.price === undefined && apt.service) {
            apt.price = getServicePrice(apt.service)
            // Обновляем в localStorage
            const stored = localStorage.getItem('appointments')
            if (stored) {
              try {
                const parsed = JSON.parse(stored)
                const updated = parsed.map((storedApt: any) => 
                  storedApt.id === apt.id 
                    ? { ...storedApt, price: apt.price }
                    : storedApt
                )
                localStorage.setItem('appointments', JSON.stringify(updated))
              } catch (e) {
                console.error('Ошибка обновления цены в localStorage:', e)
              }
            }
          }
          return apt
        })
        // Проверяем, есть ли новые тестовые записи (id '5' и '6')
        const hasNewTestRecords = todayAppointments.some((apt: any) => apt.id === '5' || apt.id === '6')
        
        // Если есть записи на сегодня, но нет новых тестовых записей, добавляем их
        if (todayAppointments.length > 0 && !hasNewTestRecords) {
          const newTestRecords = [
            { 
              id: '5', 
              startTime: '10:00', 
              endTime: '11:00',
              client: 'Марк Иванов',
              phone: '+373 567 890',
              email: 'mark.ivanov@example.com',
              service: 'Стрижка и укладка', 
              master: 'Алекс Ривера', 
              date: today,
              status: 'pending',
              source: 'online' as const
            },
            { 
              id: '6', 
              startTime: '13:00', 
              endTime: '14:00',
              client: 'Ольга Козлова',
              phone: '+373 678 901',
              email: 'olga.kozlova@example.com',
              service: 'Маникюр', 
              master: 'Сара Чен', 
              date: today,
              status: 'pending',
              source: 'online' as const
            },
          ]
          return [...todayAppointments, ...newTestRecords]
        }
        
        // Если есть записи на сегодня, возвращаем их
        if (todayAppointments.length > 0) {
          return todayAppointments
        }
      } catch (e) {
        console.error('Ошибка загрузки записей из localStorage:', e)
      }
    }
    // Моковые данные по умолчанию (новые записи - pending, желтые)
    return defaultAppointments
  }

  const [appointments, setAppointments] = useState(() => {
    // Инициализируем с записями на сегодня из localStorage
    return loadTodayAppointments()
  })

  // Обновляем записи при монтировании и при смене дня, чтобы всегда использовать актуальную сегодняшнюю дату
  useEffect(() => {
    const updateTodayAppointments = () => {
      const today = getToday()
      console.log('🔄 Обновление записей для сегодняшней даты:', today)
      
      // Используем ту же логику, что и в Calendar.tsx
      const todayAppointments = loadTodayAppointments()
      
      console.log('=== АНАЛИЗ ЗАПИСЕЙ ===')
      console.log('Сегодняшняя дата:', today)
      console.log('Найдено записей на сегодня:', todayAppointments.length)
      
      todayAppointments.forEach((apt: any) => {
        const aptDate = apt.date ? apt.date.split('T')[0] : ''
        console.log('✓ Запись на сегодня:', apt.client, '| Дата:', aptDate, '| Время:', apt.startTime, '-', apt.endTime)
      })
      
      // Принудительно устанавливаем только записи на сегодня
      setAppointments(todayAppointments)
      
      // ВАЖНО: Обновляем статистику и доход при смене дня
      // Загружаем все записи для пересчета статистики
      const allAppointments = loadAllAppointments()
      const todayDate = new Date(today)
      
      // Пересчитываем статистику для новой даты
      const statsTodayAppointments = allAppointments.filter((apt: any) => {
        const aptDate = apt.date ? apt.date.split('T')[0] : ''
        return aptDate === today
      })
      const todayCount = statsTodayAppointments.length
      
      // Предстоящие записи
      const upcomingCount = allAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.date)
        return aptDate > todayDate && apt.status !== 'completed'
      }).length
      
      // Неявки (только за сегодня)
      const noShowCount = allAppointments.filter((apt: any) => {
        const aptDate = apt.date ? apt.date.split('T')[0] : ''
        return aptDate === today && apt.status === 'no-show'
      }).length
      
      // Вычисляем изменения (сравниваем с предыдущим днем)
      const yesterday = new Date(todayDate)
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      const yesterdayAppointments = allAppointments.filter((apt: any) => {
        const aptDate = apt.date ? apt.date.split('T')[0] : ''
        return aptDate === yesterdayStr
      })
      const yesterdayCount = yesterdayAppointments.length
      
      const todayChange = todayCount - yesterdayCount
      const todayChangeStr = todayChange >= 0 ? `+${todayChange}` : `${todayChange}`
      
      // Для предстоящих
      const yesterdayUpcoming = allAppointments.filter((apt: any) => {
        const aptDate = new Date(apt.date)
        const yesterdayDate = new Date(yesterday)
        return aptDate > yesterdayDate && apt.status !== 'completed'
      }).length
      const upcomingChange = upcomingCount - yesterdayUpcoming
      const upcomingChangeStr = upcomingChange > 0 ? `+${upcomingChange}` : ''
      
      // Для неявок
      const yesterdayNoShow = allAppointments.filter((apt: any) => {
        const aptDate = apt.date ? apt.date.split('T')[0] : ''
        return aptDate === yesterdayStr && apt.status === 'no-show'
      }).length
      const noShowChange = noShowCount - yesterdayNoShow
      const noShowChangeStr = noShowChange >= 0 ? `+${noShowChange}` : `${noShowChange}`
      
      // Обновляем статистику с учетом текущего языка
      const currentLang = (localStorage.getItem('language') || 'ru') as Language
      setStats([
        { 
          label: getTranslation(currentLang, 'stats.todayAppointments'), 
          value: todayCount.toString(), 
          change: todayChangeStr, 
          trend: todayChange >= 0 ? "up" : "down" 
        },
        { 
          label: getTranslation(currentLang, 'stats.upcoming'), 
          value: upcomingCount.toString(), 
          change: upcomingChangeStr, 
          trend: upcomingChange >= 0 ? "up" : "down" 
        },
        { 
          label: getTranslation(currentLang, 'stats.noShows'), 
          value: noShowCount.toString(), 
          change: noShowChangeStr, 
          trend: noShowChange >= 0 ? "up" : "down" 
        },
      ])
      
      // Обновляем доход за сегодня
      const confirmedTodayAppointments = statsTodayAppointments.filter((apt: any) => apt.status === 'confirmed')
      const newTodayRevenue = confirmedTodayAppointments.reduce((total: number, apt: any) => {
        const price = apt.price || 0
        return total + price
      }, 0)
      setTodayRevenue(newTodayRevenue)
    }
    
    // Обновляем при монтировании
    updateTodayAppointments()
    
    // Проверяем смену дня и синхронизируем каждую секунду (как в Calendar.tsx)
    const interval = setInterval(() => {
      updateTodayAppointments()
    }, 1000) // Каждую секунду для быстрой синхронизации
    
    // Слушаем изменения в localStorage из других вкладок
    window.addEventListener('storage', updateTodayAppointments)
    
    return () => {
      clearInterval(interval)
      window.removeEventListener('storage', updateTodayAppointments)
    }
  }, [language]) // Обновляем при смене языка

  // Функция для загрузки всех записей из localStorage
  const loadAllAppointments = () => {
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        return JSON.parse(stored)
      } catch (e) {
        console.error('Ошибка загрузки всех записей:', e)
      }
    }
    return []
  }

  // Вычисление статистики на основе реальных данных
  const calculateStats = () => {
    const allAppointments = loadAllAppointments()
    const today = getToday()
    const todayDate = new Date(today)
    
    // Записи сегодня (нормализуем даты для сравнения)
    const todayAppointments = allAppointments.filter((apt: any) => {
      const aptDate = apt.date ? apt.date.split('T')[0] : ''
      return aptDate === today
    })
    const todayCount = todayAppointments.length
    
    // Предстоящие записи (будущие даты)
    const upcomingAppointments = allAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.date)
      return aptDate > todayDate && apt.status !== 'completed'
    })
    const upcomingCount = upcomingAppointments.length
    
    // Неявки (статус "no-show") только за сегодня
    const noShowAppointments = allAppointments.filter((apt: any) => {
      const aptDate = apt.date ? apt.date.split('T')[0] : ''
      return aptDate === today && apt.status === 'no-show'
    })
    const noShowCount = noShowAppointments.length
    
    // Вычисляем изменения (сравниваем с предыдущим днем)
    const yesterday = new Date(todayDate)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const yesterdayAppointments = allAppointments.filter((apt: any) => apt.date === yesterdayStr)
    const yesterdayCount = yesterdayAppointments.length
    
    const todayChange = todayCount - yesterdayCount
    const todayChangeStr = todayChange >= 0 ? `+${todayChange}` : `${todayChange}`
    
    // Для предстоящих - не показываем отрицательное изменение
    // (записи постоянно переходят из "предстоящих" в "сегодняшние", что создает отрицательные значения)
    // Показываем изменение только если оно положительное (новые предстоящие записи)
    const yesterdayUpcoming = allAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.date)
      const yesterdayDate = new Date(yesterday)
      // Записи, которые были предстоящими вчера (дата > вчера)
      return aptDate > yesterdayDate && apt.status !== 'completed'
    }).length
    const upcomingChange = upcomingCount - yesterdayUpcoming
    // Показываем изменение только если оно положительное, иначе пустая строка
    const upcomingChangeStr = upcomingChange > 0 ? `+${upcomingChange}` : ''
    
    // Для неявок - сравниваем с предыдущим днем
    const yesterdayNoShow = allAppointments.filter((apt: any) => {
      const aptDate = apt.date ? apt.date.split('T')[0] : ''
      return aptDate === yesterdayStr && apt.status === 'no-show'
    }).length
    const noShowChange = noShowCount - yesterdayNoShow
    const noShowChangeStr = noShowChange >= 0 ? `+${noShowChange}` : `${noShowChange}`
    
    // Используем переводы через getTranslation напрямую, так как t() еще не доступен в этой функции
    const saved = localStorage.getItem('language') || 'ru'
    const lang = (saved === 'ru' || saved === 'ro' || saved === 'en') ? saved as Language : 'ru'
    
    return [
      { 
        label: getTranslation(lang, 'stats.todayAppointments'), 
        value: todayCount.toString(), 
        change: todayChangeStr, 
        trend: todayChange >= 0 ? "up" : "down" 
      },
      { 
        label: getTranslation(lang, 'stats.upcoming'), 
        value: upcomingCount.toString(), 
        change: upcomingChangeStr, 
        trend: upcomingChange >= 0 ? "up" : "down" 
      },
      { 
        label: getTranslation(lang, 'stats.noShows'), 
        value: noShowCount.toString(), 
        change: noShowChangeStr, 
        trend: noShowChange >= 0 ? "up" : "down" 
      },
    ]
  }

  const [stats, setStats] = useState(calculateStats)
  const [todayRevenue, setTodayRevenue] = useState(() => {
    const allAppointments = loadAllAppointments()
    const today = getToday()
    const todayAppointments = allAppointments.filter((apt: any) => {
      const aptDate = apt.date ? apt.date.split('T')[0] : ''
      return aptDate === today && apt.status === 'confirmed'
    })
    return todayAppointments.reduce((total: number, apt: any) => {
      const price = apt.price || 0
      return total + price
    }, 0)
  })


  // Обновление статистики
  useEffect(() => {
    const allAppointments = loadAllAppointments()
    const today = getToday()
    const todayDate = new Date(today)
    
    // Записи сегодня (нормализуем даты для сравнения)
    const todayAppointments = allAppointments.filter((apt: any) => {
      const aptDate = apt.date ? apt.date.split('T')[0] : ''
      return aptDate === today
    })
    const todayCount = todayAppointments.length
    
    // Предстоящие записи (будущие даты)
    const upcomingCount = allAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.date)
      return aptDate > todayDate && apt.status !== 'completed'
    }).length
    
    // Неявки (статус "no-show") только за сегодня
    const noShowCount = allAppointments.filter((apt: any) => {
      const aptDate = apt.date ? apt.date.split('T')[0] : ''
      return aptDate === today && apt.status === 'no-show'
    }).length
    
    // Вычисляем изменения (сравниваем с предыдущим днем)
    const yesterday = new Date(todayDate)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]
    const yesterdayAppointments = allAppointments.filter((apt: any) => {
      const aptDate = apt.date ? apt.date.split('T')[0] : ''
      return aptDate === yesterdayStr
    })
    const yesterdayCount = yesterdayAppointments.length
    
    const todayChange = todayCount - yesterdayCount
    const todayChangeStr = todayChange >= 0 ? `+${todayChange}` : `${todayChange}`
    
    // Для предстоящих - показываем изменение только если оно положительное
    // (не показываем отрицательное, так как записи постоянно переходят из "предстоящих" в "сегодняшние")
    const yesterdayUpcoming = allAppointments.filter((apt: any) => {
      const aptDate = new Date(apt.date)
      const yesterdayDate = new Date(yesterday)
      return aptDate > yesterdayDate && apt.status !== 'completed'
    }).length
    const upcomingChange = upcomingCount - yesterdayUpcoming
    // Показываем изменение только если оно положительное, иначе пустая строка
    const upcomingChangeStr = upcomingChange > 0 ? `+${upcomingChange}` : ''
    
    // Для неявок
    const yesterdayNoShow = allAppointments.filter((apt: any) => {
      const aptDate = apt.date ? apt.date.split('T')[0] : ''
      return aptDate === yesterdayStr && apt.status === 'no-show'
    }).length
    const noShowChange = noShowCount - yesterdayNoShow
    const noShowChangeStr = noShowChange >= 0 ? `+${noShowChange}` : `${noShowChange}`
    
    // Прибыль за сегодня (только подтвержденные записи)
    const confirmedTodayAppointments = todayAppointments.filter((apt: any) => apt.status === 'confirmed')
    const todayRevenue = confirmedTodayAppointments.reduce((total: number, apt: any) => {
      const price = apt.price || 0
      return total + price
    }, 0)
    
    setTodayRevenue(todayRevenue)
    setStats([
      { 
        label: t('stats.todayAppointments'), 
        value: todayCount.toString(), 
        change: todayChangeStr, 
        trend: todayChange >= 0 ? "up" : "down" 
      },
      { 
        label: t('stats.upcoming'), 
        value: upcomingCount.toString(), 
        change: upcomingChangeStr, 
        trend: upcomingChange >= 0 ? "up" : "down" 
      },
      { 
        label: t('stats.noShows'), 
        value: noShowCount.toString(), 
        change: noShowChangeStr, 
        trend: noShowChange >= 0 ? "up" : "down" 
      },
    ])
  }, [appointments, language, t])

  const statusConfig = {
    pending: { label: t('status.pending'), color: 'bg-amber-500/40 text-amber-300 border-amber-500/50' },
    confirmed: { label: t('status.confirmed'), color: 'bg-emerald-500/40 text-emerald-300 border-emerald-500/50' },
    'no-show': { label: t('status.noShow'), color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    completed: { label: t('status.completed'), color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  }

  const sourceConfig = {
    online: { label: 'Онлайн', icon: Globe, color: 'text-blue-400' },
    admin: { label: 'Админ', icon: User, color: 'text-green-400' },
    repeat: { label: 'Повтор', icon: RotateCcw, color: 'text-purple-400' },
  }

  // Функция для получения записей, которые пересекаются с временным слотом
  const getAppointmentsForSlot = (slotTime: string) => {
    return appointments.filter(apt => {
      // Пропускаем записи со статусом 'cancelled'
      if ((apt as any).status === 'cancelled') {
        return false
      }
      const slotHour = parseInt(slotTime.split(':')[0])
      const slotMin = parseInt(slotTime.split(':')[1])
      const aptStartHour = parseInt(apt.startTime.split(':')[0])
      const aptStartMin = parseInt(apt.startTime.split(':')[1])
      const aptEndHour = parseInt(apt.endTime.split(':')[0])
      const aptEndMin = parseInt(apt.endTime.split(':')[1])
      
      const slotMinutes = slotHour * 60 + slotMin
      const aptStartMinutes = aptStartHour * 60 + aptStartMin
      const aptEndMinutes = aptEndHour * 60 + aptEndMin
      
      // Запись пересекается со слотом, если она начинается в этом слоте или заканчивается в нем
      return (aptStartMinutes <= slotMinutes && aptEndMinutes > slotMinutes) ||
             (aptStartMinutes >= slotMinutes && aptStartMinutes < slotMinutes + 60)
    })
  }

  const selectedAppointmentData = appointments.find(apt => apt.id === selectedAppointment)

  const handleAppointmentClick = (appointmentId: string) => {
    setSelectedAppointment(appointmentId)
  }

  const handleStatusChange = (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'no-show' | 'completed') => {
    // Обновляем в состоянии
    setAppointments(prev => prev.map(apt => 
      apt.id === appointmentId ? { ...apt, status: newStatus } : apt
    ))
    
    // Сохраняем в localStorage
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const updated = parsed.map((apt: any) => 
          apt.id === appointmentId ? { ...apt, status: newStatus } : apt
        )
        localStorage.setItem('appointments', JSON.stringify(updated))
      } catch (e) {
        console.error('Ошибка сохранения статуса:', e)
      }
    }
    
    // Обновляем статистику
    setTimeout(() => {
      setStats(calculateStats())
    }, 0)
    
    setSelectedAppointment(null)
  }

  const handleShowHistory = (clientName: string) => {
    setHistoryClient(clientName)
    setShowClientHistory(true)
    setSelectedAppointment(null) // Закрываем окно деталей записи
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId)
    if (!appointment) return

    // Подтверждение удаления
    const confirmMessage = `Вы уверены, что хотите удалить запись клиента "${appointment.client}"?`
    if (window.confirm(confirmMessage)) {
      // Удаляем из состояния
      setAppointments(prev => prev.filter(apt => apt.id !== appointmentId))
      
      // Удаляем из localStorage
      const stored = localStorage.getItem('appointments')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const updated = parsed.filter((apt: any) => apt.id !== appointmentId)
          localStorage.setItem('appointments', JSON.stringify(updated))
        } catch (e) {
          console.error('Ошибка удаления записи:', e)
        }
      }
      
      // Обновляем статистику
      setTimeout(() => {
        setStats(calculateStats())
      }, 0)
      
      setSelectedAppointment(null) // Закрываем модальное окно
    }
  }

  const handleOpenNewAppointmentModal = () => {
    // Сбрасываем форму и открываем модальное окно
    const today = getToday()
    setNewAppointmentForm({
      client: '',
      phone: '',
      email: '',
      comment: '',
      contactMethod: '',
      contactHandle: '',
      service: '',
      master: '',
      startTime: '',
      endTime: '',
      date: today,
    })
    // Устанавливаем календарь на сегодняшнюю дату
    setCalendarDate(new Date())
    setShowNewAppointmentModal(true)
  }

  const handleOpenEditAppointmentModal = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId)
    if (!appointment) return
    
    const appointmentDate = appointment.date || getToday()
    
    // Заполняем форму данными записи
    setNewAppointmentForm({
      client: appointment.client,
      phone: appointment.phone,
      email: appointment.email || '',
      comment: (appointment as any).comment || '',
      contactMethod: (appointment as any).contactMethod || '',
      contactHandle: (appointment as any).contactHandle || '',
      service: appointment.service,
      master: appointment.master,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      date: appointmentDate,
    })
    // Устанавливаем календарь на дату записи
    setCalendarDate(new Date(appointmentDate + 'T00:00:00'))
    setEditingAppointmentId(appointmentId)
    setShowEditAppointmentModal(true)
    setSelectedAppointment(null) // Закрываем модальное окно с деталями
  }

  const handleUpdateAppointment = () => {
    if (!editingAppointmentId) return
    
    if (!newAppointmentForm.client || !newAppointmentForm.phone || !newAppointmentForm.service || !newAppointmentForm.master || !newAppointmentForm.startTime) {
      alert(t('appointments.fillAllFields'))
      return
    }

    // Форматируем время начала
    let formattedStartTime = newAppointmentForm.startTime
    if (!formattedStartTime.match(/^\d{2}:\d{2}$/)) {
      const parts = formattedStartTime.split(':')
      if (parts.length === 2) {
        formattedStartTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      } else {
        alert(t('appointments.invalidTimeFormat'))
        return
      }
    }

    // Форматируем время окончания
    let formattedEndTime = newAppointmentForm.endTime || calculateEndTime(formattedStartTime, newAppointmentForm.service)
    if (formattedEndTime && !formattedEndTime.match(/^\d{2}:\d{2}$/)) {
      const parts = formattedEndTime.split(':')
      if (parts.length === 2) {
        formattedEndTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      }
    }

    // Нормализуем дату
    const today = getToday()
    const appointmentDate = newAppointmentForm.date || today
    const normalizedAppointmentDate = appointmentDate.split('T')[0]
    const isToday = normalizedAppointmentDate === today

    // Находим оригинальную запись для сохранения всех полей
    const originalAppointment = appointments.find(apt => apt.id === editingAppointmentId)
    if (!originalAppointment) return

    // Получаем цену услуги
    const servicePrice = getServicePrice(newAppointmentForm.service)
    
    const updatedAppointment = {
      ...originalAppointment,
      client: newAppointmentForm.client,
      phone: newAppointmentForm.phone,
      email: newAppointmentForm.email || undefined,
      comment: newAppointmentForm.comment || undefined,
      contactMethod: newAppointmentForm.contactMethod || undefined,
      contactHandle: newAppointmentForm.contactHandle || undefined,
      service: newAppointmentForm.service,
      master: newAppointmentForm.master,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      date: normalizedAppointmentDate,
      price: servicePrice || originalAppointment.price || 0,
    }

    // Сохраняем в localStorage
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const updated = parsed.map((apt: any) => 
          apt.id === editingAppointmentId 
            ? updatedAppointment
            : apt
        )
        localStorage.setItem('appointments', JSON.stringify(updated))
      } catch (e) {
        console.error('Ошибка сохранения изменений:', e)
      }
    }

    // Обновляем в состоянии
    // Если дата изменилась и запись больше не на сегодня, убираем её из состояния
    // Если дата изменилась и запись стала на сегодня, добавляем её в состояние
    if (isToday) {
      // Запись на сегодня - обновляем или добавляем в состояние
      setAppointments(prev => {
        const exists = prev.some(apt => apt.id === editingAppointmentId)
        if (exists) {
          // Обновляем существующую запись
          return prev.map(apt => 
            apt.id === editingAppointmentId 
              ? updatedAppointment
              : apt
          )
        } else {
          // Добавляем новую запись (если дата изменилась с другой на сегодня)
          return [...prev, updatedAppointment]
        }
      })
    } else {
      // Запись не на сегодня - убираем из состояния (Home показывает только сегодняшние записи)
      setAppointments(prev => prev.filter(apt => apt.id !== editingAppointmentId))
    }

    // Обновляем статистику
    setTimeout(() => {
      setStats(calculateStats())
    }, 0)

    // Закрываем модальное окно и сбрасываем форму
    setShowEditAppointmentModal(false)
    setEditingAppointmentId(null)
    setNewAppointmentForm({
      client: '',
      phone: '',
      email: '',
      service: '',
      master: '',
      startTime: '',
      endTime: '',
      date: today,
    })
  }

  // Открытие модального окна записи при навигации из поиска в хедере
  useEffect(() => {
    const state = location.state as { openAppointmentId?: string } | null
    if (state?.openAppointmentId) {
      setSelectedAppointment(state.openAppointmentId)
      // Очищаем state, чтобы не открывать повторно при обновлении
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

  // Обработка popstate события для открытия записи из поиска в Header
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const state = event.state as { openAppointmentId?: string } | null
      if (state?.openAppointmentId) {
        setSelectedAppointment(state.openAppointmentId)
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceOpen(false)
      }
      if (masterDropdownRef.current && !masterDropdownRef.current.contains(event.target as Node)) {
        setIsMasterOpen(false)
      }
      if (startTimeDropdownRef.current && !startTimeDropdownRef.current.contains(event.target as Node)) {
        setIsStartTimeDropdownOpen(false)
      }
      if (contactMethodRef.current && !contactMethodRef.current.contains(event.target as Node)) {
        setIsContactMethodOpen(false)
      }
    }

    if (showNewAppointmentModal || showEditAppointmentModal) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNewAppointmentModal, showEditAppointmentModal])

  // Автоматически рассчитываем время окончания при изменении времени начала или услуги
  useEffect(() => {
    if (newAppointmentForm.service && newAppointmentForm.startTime && newAppointmentForm.startTime.match(/^\d{2}:\d{2}$/)) {
      const calculatedEndTime = calculateEndTime(newAppointmentForm.startTime, newAppointmentForm.service)
      if (calculatedEndTime && calculatedEndTime !== newAppointmentForm.endTime) {
        setNewAppointmentForm(prev => ({ ...prev, endTime: calculatedEndTime }))
      }
    }
  }, [newAppointmentForm.service, newAppointmentForm.startTime])

  // Вычисляем время окончания на основе услуги
  const calculateEndTime = (startTime: string, serviceName: string) => {
    if (!startTime) return ''
    
    // Загружаем услуги из localStorage и ищем длительность
    const stored = localStorage.getItem('services')
    let duration = 60 // Значение по умолчанию
    
    if (stored) {
      try {
        const services = JSON.parse(stored)
        const service = services.find((s: any) => s.name === serviceName && s.active)
        if (service) {
          duration = service.duration
        }
      } catch (e) {
        console.error('Ошибка загрузки услуг для расчета времени:', e)
      }
    }
    
    const [hours, minutes] = startTime.split(':').map(Number)
    const startMinutes = hours * 60 + minutes
    const endMinutes = startMinutes + duration
    const endHours = Math.floor(endMinutes / 60)
    const endMins = endMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`
  }

  // Находим свободный слот для записи (теперь можно добавлять любое количество записей)
  const findAvailableSlot = (startTime: string) => {
    // Всегда возвращаем true, так как теперь можно добавлять любое количество записей
    // с горизонтальной прокруткой
    return true
  }

  const handleServiceChange = (service: string) => {
    setNewAppointmentForm(prev => {
      const newForm = { ...prev, service }
      if (newForm.startTime) {
        newForm.endTime = calculateEndTime(newForm.startTime, service)
      }
      return newForm
    })
    setIsServiceOpen(false)
  }

  const handleStartTimeChange = (startTime: string) => {
    setNewAppointmentForm(prev => {
      const newForm = { ...prev, startTime }
      if (newForm.service) {
        newForm.endTime = calculateEndTime(startTime, newForm.service)
      }
      return newForm
    })
    setIsStartTimeDropdownOpen(false)
  }

  const handleCreateAppointment = () => {
    if (!newAppointmentForm.client || !newAppointmentForm.phone || !newAppointmentForm.service || !newAppointmentForm.master || !newAppointmentForm.startTime) {
      alert(t('appointments.fillAllFields'))
      return
    }

    // Форматируем время начала, чтобы оно соответствовало формату слотов (ЧЧ:ММ)
    let formattedStartTime = newAppointmentForm.startTime
    if (!formattedStartTime.match(/^\d{2}:\d{2}$/)) {
      const parts = formattedStartTime.split(':')
      if (parts.length === 2) {
        formattedStartTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      } else {
        alert(t('appointments.invalidTimeFormat'))
        return
      }
    }

    // Сохраняем введенное время как есть, не заменяем на ближайший слот
    // Запись будет отображаться в ближайшем временном слоте при отображении

    // Убрали проверку на заполненность слота, так как теперь можно добавлять любое количество записей

    // Форматируем время окончания
    let formattedEndTime = newAppointmentForm.endTime || calculateEndTime(formattedStartTime, newAppointmentForm.service)
    if (formattedEndTime && !formattedEndTime.match(/^\d{2}:\d{2}$/)) {
      const parts = formattedEndTime.split(':')
      if (parts.length === 2) {
        formattedEndTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      }
    }

    // Используем дату из формы, если она указана, иначе сегодня
    const today = getToday()
    const appointmentDate = newAppointmentForm.date || today
    
    // Нормализуем дату (убираем время, если есть)
    const normalizedAppointmentDate = appointmentDate.split('T')[0]
    const normalizedToday = today
    
    // Проверяем, является ли дата будущей (сравниваем только даты без времени)
    const isFutureDate = normalizedAppointmentDate > normalizedToday
    const isToday = normalizedAppointmentDate === normalizedToday

    // Получаем цену услуги
    const servicePrice = getServicePrice(newAppointmentForm.service)
    
    const newAppointment = {
      id: Date.now().toString(),
      startTime: formattedStartTime, // Используем введенное пользователем время
      endTime: formattedEndTime,
      client: newAppointmentForm.client,
      phone: newAppointmentForm.phone,
      email: newAppointmentForm.email || undefined,
      comment: newAppointmentForm.comment || undefined,
      contactMethod: newAppointmentForm.contactMethod || undefined,
      contactHandle: newAppointmentForm.contactHandle || undefined,
      service: newAppointmentForm.service,
      master: newAppointmentForm.master,
      date: normalizedAppointmentDate,
      status: (isFutureDate ? 'pending' : 'confirmed') as const,
      source: 'admin' as const,
      price: servicePrice || 0,
    }

    // Сохраняем в localStorage сначала (все записи, включая будущие)
    const stored = localStorage.getItem('appointments')
    let allAppointments: any[] = []
    if (stored) {
      try {
        allAppointments = JSON.parse(stored)
      } catch (e) {
        console.error('Ошибка загрузки всех записей:', e)
      }
    }
    // Проверяем, нет ли уже записи с таким ID (избегаем дубликатов)
    const existingIndex = allAppointments.findIndex((apt: any) => apt.id === newAppointment.id)
    if (existingIndex === -1) {
      allAppointments.push(newAppointment)
    } else {
      allAppointments[existingIndex] = newAppointment
    }
    localStorage.setItem('appointments', JSON.stringify(allAppointments))

    // Если дата сегодняшняя, добавляем в appointments для отображения в слотах
    // Если дата будущая или в прошлом, не добавляем в состояние (Home показывает только сегодня)
    if (isToday) {
      // Добавляем запись в состояние немедленно
      setAppointments(prev => {
        // Проверяем, нет ли уже записи с таким ID (избегаем дубликатов)
        const exists = prev.some(apt => apt.id === newAppointment.id)
        if (exists) {
          return prev
        }
        console.log('Добавляем запись в состояние (сегодня):', newAppointment)
        return [...prev, newAppointment]
      })
    } else {
      // Для записей не на сегодня, перезагружаем из localStorage, чтобы убедиться в синхронизации
      if (!isFutureDate) {
        // Если запись в прошлом, все равно не показываем на Home (Home показывает только сегодня)
        console.log('Запись не на сегодня, не добавляем в состояние:', newAppointment)
      } else {
        console.log('Запись на будущую дату, не добавляем в состояние:', newAppointment)
      }
      // Перезагружаем записи из localStorage для синхронизации
      const updatedTodayAppointments = loadTodayAppointments()
      setAppointments(updatedTodayAppointments)
    }

    // Обновляем статистику после небольшой задержки, чтобы убедиться, что localStorage обновлен
    setTimeout(() => {
      setStats(calculateStats())
    }, 0)

    setShowNewAppointmentModal(false)
    setNewAppointmentForm({
      client: '',
      phone: '',
      email: '',
      service: '',
      master: '',
      startTime: '',
      endTime: '',
      date: today,
    })
  }

  // Функции для работы с календарем
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1
    
    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
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

  const isSelected = (date: Date | null, selectedDateStr: string) => {
    if (!date || !selectedDateStr) return false
    const selected = new Date(selectedDateStr + 'T00:00:00')
    return date.getDate() === selected.getDate() &&
           date.getMonth() === selected.getMonth() &&
           date.getFullYear() === selected.getFullYear()
  }

  const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return t('home.selectDate')
    const date = new Date(dateStr + 'T00:00:00')
    const locale = language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US'
    return date.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Моковые данные истории посещений
  const getClientHistory = (clientName: string) => {
    const historyData: Record<string, Array<{
      date: string
      service: string
      master: string
      amount: number
      status: string
    }>> = {
      'Сара Уильямс': [
        { date: '2025-01-05', service: 'Стрижка и укладка', master: 'Алекс Ривера', amount: 500, status: 'completed' },
        { date: '2024-12-28', service: 'Окрашивание', master: 'Сара Чен', amount: 1200, status: 'completed' },
        { date: '2024-12-20', service: 'Стрижка и укладка', master: 'Алекс Ривера', amount: 500, status: 'completed' },
      ],
      'Джеймс Смит': [
        { date: '2025-01-04', service: 'Стрижка бороды', master: 'Майк Джонсон', amount: 300, status: 'completed' },
        { date: '2024-12-27', service: 'Стрижка', master: 'Майк Джонсон', amount: 400, status: 'completed' },
      ],
      'Анна Петрова': [
        { date: '2025-01-03', service: 'Маникюр', master: 'Сара Чен', amount: 600, status: 'completed' },
        { date: '2024-12-30', service: 'Маникюр', master: 'Сара Чен', amount: 600, status: 'completed' },
        { date: '2024-12-23', service: 'Педикюр', master: 'Сара Чен', amount: 700, status: 'completed' },
      ],
      'Эмили Браун': [
        { date: '2024-12-29', service: 'Окрашивание', master: 'Сара Чен', amount: 1200, status: 'completed' },
        { date: '2024-12-15', service: 'Стрижка', master: 'Алекс Ривера', amount: 450, status: 'completed' },
      ],
    }
    return historyData[clientName] || []
  }

  const statMeta = [
    {
      icon: CalendarIcon,
      iconClass: 'text-indigo-300',
      iconWrap: 'bg-indigo-500/15 border-indigo-500/30',
      glow: 'bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent',
    },
    {
      icon: Clock,
      iconClass: 'text-emerald-300',
      iconWrap: 'bg-emerald-500/15 border-emerald-500/30',
      glow: 'bg-gradient-to-br from-emerald-500/20 via-transparent to-transparent',
    },
    {
      icon: UserX,
      iconClass: 'text-rose-300',
      iconWrap: 'bg-rose-500/15 border-rose-500/30',
      glow: 'bg-gradient-to-br from-rose-500/20 via-transparent to-transparent',
    },
  ]

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-foreground">
            {t('home.greeting')},{' '}
            <span className="font-semibold text-primary">{userName}</span>
          </h2>
          <p className="text-muted-foreground">
            {t('home.subtitle')}{' '}
            <span className="font-medium text-primary">{businessName}</span>{' '}
            {t('home.todayInSubtitle')}:
          </p>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Button 
            className="rounded-full bg-primary hover:bg-primary/90"
            onClick={() => handleOpenNewAppointmentModal()}
          >
            <Plus className="mr-2 h-4 w-4" /> {t('home.newAppointmentToday')}
          </Button>
          <span className="text-[10px] text-muted-foreground/70 leading-tight text-center">
            {t('home.ifClientWithoutAppointment')}
          </span>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-center">
        {stats.map((stat, i) => {
          const meta = statMeta[i]
          const Icon = meta?.icon
          return (
            <Card
              key={i}
              className="p-5 flex flex-col gap-4 backdrop-blur-xl bg-card/60 border border-border/50 relative hover:border-border/80 transition-all !rounded-none flex-1 min-w-[280px] max-w-none w-full overflow-hidden"
            >
              <div className={cn('absolute inset-0 opacity-70', meta?.glow)} />
              <div className="relative z-10 flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    {stat.label}
                  </span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-display font-bold text-foreground">{stat.value}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (stat.label === t('stats.todayAppointments')) {
                      setShowReportModal(true)
                      return
                    }
                    if (stat.label === t('stats.upcoming')) {
                      navigate('/dashboard/appointments', { state: { filterDate: 'upcoming', filterStatus: 'pending' } })
                      return
                    }
                    if (stat.label === t('stats.noShows')) {
                      navigate('/dashboard/appointments', { state: { filterStatus: 'no-show' } })
                    }
                  }}
                  className={cn(
                    'absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-2xl border flex items-center justify-center shadow-inner transition-all',
                    'hover:scale-[1.03] hover:shadow-md',
                    meta?.iconWrap
                  )}
                  title={stat.label}
                >
                  {Icon && <Icon className={cn('h-6 w-6', meta?.iconClass)} />}
                </button>
              </div>
          </Card>
          )
        })}
      </div>

      <Card className="overflow-hidden backdrop-blur-xl bg-card/60">
        <div className="p-4 border-b border-border bg-muted/30">
          <div className="flex items-center">
            <span className="font-medium">
              {formatFullDate(new Date())}
            </span>
          </div>
        </div>
        
        <div className="md:hidden space-y-3 p-4">
          {AVAILABLE_SLOTS.map((time) => {
            const slotAppointments = getAppointmentsForSlot(time)
            if (slotAppointments.length === 0) return null
            return (
              <div key={time} className="rounded-xl border border-border/50 bg-card/40 p-3">
                <div className="text-xs font-semibold text-muted-foreground">{time}</div>
                <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                  {slotAppointments.map((appointment) => (
                    <button
                      key={appointment.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        handleAppointmentClick(appointment.id)
                      }}
                      className={cn(
                        "min-w-[180px] rounded-lg border p-3 text-left transition-all flex-shrink-0",
                        appointment.status === 'confirmed'
                          ? 'bg-emerald-500/20 border-emerald-500/30'
                          : appointment.status === 'pending'
                          ? 'bg-amber-500/20 border-amber-500/30'
                          : appointment.status === 'no-show'
                          ? 'bg-red-500/20 border-red-500/30'
                          : 'bg-rose-500/20 border-rose-500/30'
                      )}
                    >
                      <div className="text-sm font-semibold text-foreground truncate">
                        {appointment.client}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 truncate">
                        {appointment.service}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1">
                        {appointment.startTime}–{appointment.endTime}
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-1 truncate">
                        • {appointment.master}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {AVAILABLE_SLOTS.every((time) => getAppointmentsForSlot(time).length === 0) && (
            <Card className="p-6 text-center backdrop-blur-xl bg-card/60">
              <p className="text-muted-foreground">{t('home.noAppointments')}</p>
            </Card>
          )}
        </div>

        <div className="hidden md:grid grid-cols-[80px_1fr] divide-x divide-border">
          <div className="divide-y divide-border/50 bg-muted/10">
            {AVAILABLE_SLOTS.map(time => (
              <div key={time} className="h-24 flex items-center justify-center text-xs text-muted-foreground font-medium">
                {time}
              </div>
            ))}
          </div>
          <div className="relative divide-y divide-border/50">
            {AVAILABLE_SLOTS.map((time, index) => {
              // Получаем записи, которые начинаются в этом временном слоте или ближайшие к нему
              // Сортируем по порядку добавления в массив, чтобы новые записи были справа
              const slotHour = parseInt(time.split(':')[0])
              const slotMin = parseInt(time.split(':')[1])
              const slotMinutes = slotHour * 60 + slotMin
              
              const today = getToday()
              console.log('Фильтрация записей для слота', time, '- сегодня:', today)
              const allSlotAppointments = appointments
                .map((apt, idx) => ({ ...apt, originalIndex: idx }))
                .filter(apt => {
                  // Пропускаем записи со статусом 'cancelled'
                  if ((apt as any).status === 'cancelled') {
                    return false
                  }
                  // Показываем только записи на сегодняшнюю дату (нормализуем дату для сравнения)
                  const aptDate = apt.date ? apt.date.split('T')[0] : ''
                  console.log('Проверка записи:', apt.client, 'дата записи:', aptDate, 'сегодня:', today, 'совпадает:', aptDate === today)
                  if (aptDate !== today) {
                    console.log('Запись пропущена - не на сегодня:', apt.client, aptDate, '!==', today)
                    return false
                  }
                  
                  // Если время точно совпадает со слотом
                  if (apt.startTime === time) return true
                  
                  // Если время не из стандартных слотов, находим ближайший слот
                  const aptHour = parseInt(apt.startTime.split(':')[0])
                  const aptMin = parseInt(apt.startTime.split(':')[1])
                  const aptMinutes = aptHour * 60 + aptMin
                  
                  // Запись относится к этому слоту, если она начинается в пределах часа от начала слота
                  // (т.е. если она начинается между началом этого слота и началом следующего)
                  const nextSlotIndex = index + 1
                  if (nextSlotIndex < AVAILABLE_SLOTS.length) {
                    const nextSlot = AVAILABLE_SLOTS[nextSlotIndex]
                    const nextSlotHour = parseInt(nextSlot.split(':')[0])
                    const nextSlotMin = parseInt(nextSlot.split(':')[1])
                    const nextSlotMinutes = nextSlotHour * 60 + nextSlotMin
                    
                    return aptMinutes >= slotMinutes && aptMinutes < nextSlotMinutes
                  } else {
                    // Если это последний слот, записи относятся к нему, если они начинаются после его начала
                    return aptMinutes >= slotMinutes
                  }
                })
                .sort((a, b) => {
                  // Сортируем по оригинальному индексу в массиве - старые слева, новые справа
                  return a.originalIndex - b.originalIndex
                })
              
              // Убираем временное поле originalIndex
              const slotAppointments = allSlotAppointments.map(({ originalIndex, ...apt }) => apt)
              
              // Адаптивная ширина слотов: если записей больше 4, делаем их меньше
              const totalVisibleSlots = Math.max(slotAppointments.length, 4) // Минимум 4 видимых слота
              
              // Вычисляем ширину слотов в зависимости от количества записей
              let slotWidthClass = 'w-[calc(25%-0.5rem)]' // По умолчанию 4 слота по 25%
              let minWidthClass = 'min-w-[150px]'
              
              if (slotAppointments.length === 5) {
                // Если 5 записей, используем 20% ширины (немного меньше)
                slotWidthClass = 'w-[calc(20%-0.5rem)]'
                minWidthClass = 'min-w-[140px]'
              } else if (slotAppointments.length === 6) {
                // Если 6 записей, используем ~16.6% ширины
                slotWidthClass = 'w-[calc(16.666%-0.5rem)]'
                minWidthClass = 'min-w-[130px]'
              } else if (slotAppointments.length === 7) {
                // Если 7 записей, используем ~14.3% ширины
                slotWidthClass = 'w-[calc(14.285%-0.5rem)]'
                minWidthClass = 'min-w-[180px]'
              } else if (slotAppointments.length === 8) {
                // Если 8 записей, используем 12.5% ширины
                slotWidthClass = 'w-[calc(12.5%-0.5rem)]'
                minWidthClass = 'min-w-[170px]'
              } else if (slotAppointments.length > 8) {
                // Если больше 8 записей, используем фиксированную ширину для возможности прокрутки
                slotWidthClass = 'w-[180px]'
                minWidthClass = 'min-w-[180px]'
              }
              
              // Показываем только один пустой слот "Добавить" в конце
              const emptySlotsCount = 1
              
              return (
                <div 
                  key={time} 
                  className="h-24 relative group hover:bg-muted/5 transition-colors"
                >
                  <div 
                    className="absolute inset-0 p-2 flex items-start gap-2 overflow-x-auto overflow-y-hidden scrollbar-hide"
                    style={{ 
                      scrollbarWidth: 'none', 
                      msOverflowStyle: 'none',
                      WebkitOverflowScrolling: 'touch'
                    }}
                    onClick={(e) => {
                      // Если клик был на самом контейнере (не на записи и не на пустом слоте), открываем модальное окно
                      if (e.target === e.currentTarget && slotAppointments.length === 0) {
                        setNewAppointmentForm(prev => ({
                          ...prev,
                          startTime: time,
                          endTime: ''
                        }))
                        setShowNewAppointmentModal(true)
                      }
                    }}
                  >
                    {/* Записи в этом слоте - занимают всю высоту */}
                    {slotAppointments.map((appointment, idx) => (
                      <button
                        key={appointment.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAppointmentClick(appointment.id)
                        }}
                        className={cn(
                          "relative rounded-md border-l-3 transition-all hover:shadow-lg hover:scale-[1.02] flex-shrink-0 h-full flex overflow-hidden",
                          slotWidthClass,
                          minWidthClass,
                      appointment.status === 'confirmed'
                            ? 'bg-emerald-500/40 border-emerald-500 hover:bg-emerald-500/50'
                            : appointment.status === 'pending'
                            ? 'bg-amber-500/40 border-amber-500 hover:bg-amber-500/50'
                            : appointment.status === 'no-show'
                            ? 'bg-red-500/40 border-red-500 hover:bg-red-500/50'
                            : 'bg-rose-500/20 border-rose-500 hover:bg-rose-500/30',
                          slotAppointments.length >= 7 ? 'p-1.5' : 'p-3'
                        )}
                      >
                        {/* Адаптивная структура в зависимости от ширины */}
                        {slotAppointments.length >= 7 ? (
                          <>
                            <div className="flex-1 flex flex-col justify-center items-center text-center px-2 min-w-0">
                              <h4 className="font-bold text-xs text-foreground mb-1 leading-tight line-clamp-1 w-full">
                                {appointment.client}
                              </h4>
                              <p className="text-[10px] font-semibold text-muted-foreground mb-0.5 leading-tight line-clamp-1 w-full">
                                {appointment.service}
                              </p>
                              <p className="text-[9px] text-muted-foreground/80 leading-tight line-clamp-1 w-full">
                                {appointment.master}
                              </p>
                            </div>
                            <div className="flex flex-col items-center justify-center border-l border-border/30 pl-2 pr-2 flex-shrink-0 min-w-[50px]">
                              <div className="flex flex-col items-center gap-0.5 w-full">
                                <span className="text-[10px] font-mono font-bold text-foreground whitespace-nowrap">
                                  {appointment.startTime}
                                </span>
                                <span className="text-[8px] text-muted-foreground">-</span>
                                <span className="text-[10px] font-mono font-bold text-foreground whitespace-nowrap">
                                  {appointment.endTime}
                                </span>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Левая колонка - основная информация */}
                            <div className="flex-1 flex flex-col justify-center items-center pr-2 min-w-0">
                              {/* Имя клиента - по центру, жирно */}
                              <h4 className="font-bold text-sm text-foreground mb-2 text-center leading-tight w-full truncate">
                                {appointment.client}
                              </h4>
                              
                              {/* Услуга - жирно */}
                              <p className="text-xs font-bold text-muted-foreground mb-1.5 text-center leading-tight w-full truncate">
                                {appointment.service}
                              </p>
                              
                              {/* Мастер - жирно */}
                              <p className="text-xs font-bold text-muted-foreground/90 text-center leading-tight w-full truncate">
                                {appointment.master}
                              </p>
                    </div>
                            
                            {/* Средняя колонка - цена */}
                            {(() => {
                              const price = appointment.price !== undefined ? appointment.price : getServicePrice(appointment.service)
                              return price !== undefined && price > 0 ? (
                                <div className="flex flex-col items-center justify-center border-l border-r border-border/30 px-2 flex-shrink-0">
                                  <p className="text-xs font-bold text-emerald-400 bg-gray-800 rounded px-2 py-1 whitespace-nowrap">
                                    {price} MDL
                                  </p>
                                </div>
                              ) : null
                            })()}
                            
                            {/* Правая колонка - время */}
                            <div className="flex flex-col items-center justify-center border-l border-border/30 pl-2 flex-shrink-0 min-w-[55px]">
                              <div className="flex flex-col items-center gap-0.5 w-full">
                                <span className="text-sm font-bold font-mono text-foreground whitespace-nowrap">
                                  {appointment.startTime}
                                </span>
                                <span className="text-[10px] text-muted-foreground">-</span>
                                <span className="text-sm font-bold font-mono text-foreground whitespace-nowrap">
                                  {appointment.endTime}
                                </span>
                              </div>
                            </div>
                          </>
                        )}
                      </button>
                    ))}
                    
                    {/* Пустые слоты справа с пунктирным бордером */}
                    {Array.from({ length: emptySlotsCount }).map((_, emptyIdx) => (
                      <button
                        key={`empty-${emptyIdx}`}
                        onClick={(e) => {
                          e.stopPropagation()
                          setNewAppointmentForm(prev => ({
                            ...prev,
                            startTime: time,
                            endTime: ''
                          }))
                          setShowNewAppointmentModal(true)
                        }}
                        className={cn(
                          "relative rounded-md p-2.5 border-2 border-dashed border-border/30 text-left transition-all hover:border-primary/50 hover:bg-muted/10 flex-shrink-0 h-full flex items-center justify-center group/empty cursor-pointer",
                          slotWidthClass,
                          minWidthClass
                        )}
                      >
                        <span className="text-xs text-muted-foreground/50 group-hover/empty:text-muted-foreground transition-colors font-medium">
                          + {t('common.add')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </Card>

      {/* Модальное окно с деталями записи */}
      {selectedAppointmentData && (selectedAppointmentData as any).status !== 'cancelled' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />
          <Card 
            className="w-full max-w-md backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="p-6 max-h-[85vh] overflow-y-auto">
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedAppointment(null)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="absolute top-4 right-14">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleShowHistory(selectedAppointmentData.client)}
                    className="h-8 w-8"
                    title={t('common.clientHistory')}
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-6 pr-20">{t('calendar.appointmentDetails')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('home.client')}</h4>
                    <p className="text-base font-bold break-words">{selectedAppointmentData.client}</p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1 min-w-0">
                      <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="break-words">{selectedAppointmentData.phone}</span>
                    </div>
                    {selectedAppointmentData.email && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1 min-w-0">
                        <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="break-all max-w-full">{selectedAppointmentData.email}</span>
                      </div>
                    )}
                  </div>
                  {selectedAppointmentData.comment && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {t('calendar.comment')}
                      </h4>
                      <p className="text-sm break-words">{selectedAppointmentData.comment}</p>
                    </div>
                  )}
                  {selectedAppointmentData.contactMethod && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {t('calendar.contactMethod')}
                      </h4>
                      <p className="text-sm break-words">{selectedAppointmentData.contactMethod}</p>
                    </div>
                  )}
                  {selectedAppointmentData.contactHandle && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                        {t('calendar.contactHandle')}
                      </h4>
                      <p className="text-sm break-words">{selectedAppointmentData.contactHandle}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('home.service')}</h4>
                      <p className="text-sm">{selectedAppointmentData.service}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('home.master')}</h4>
                      <p className="text-sm">{selectedAppointmentData.master}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.date')} {t('common.and')} {t('calendar.time')}</h4>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">
                        {new Date(selectedAppointmentData.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}, {selectedAppointmentData.startTime} - {selectedAppointmentData.endTime}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.status')}</h4>
                      <Badge className={cn("text-xs font-medium border", statusConfig[selectedAppointmentData.status].color)}>
                        {statusConfig[selectedAppointmentData.status].label}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.source')}</h4>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const SourceIcon = sourceConfig[selectedAppointmentData.source].icon
                          return <SourceIcon className={cn("w-4 h-4", sourceConfig[selectedAppointmentData.source].color)} />
                        })()}
                        <span className="text-sm">{sourceConfig[selectedAppointmentData.source].label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full text-primary border-primary/30 hover:bg-primary/20 hover:text-primary"
                        onClick={() => handleOpenEditAppointmentModal(selectedAppointmentData.id)}
                        size="sm"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        {t('home.editAppointment')}
                      </Button>
                      {selectedAppointmentData.status === 'pending' && (
                        <>
                          <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                            onClick={() => handleStatusChange(selectedAppointmentData.id, 'confirmed')}
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('home.confirmAppointment')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleStatusChange(selectedAppointmentData.id, 'no-show')}
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t('home.markAsNoShow')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleDeleteAppointment(selectedAppointmentData.id)}
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('home.deleteAppointment')}
                          </Button>
                        </>
                      )}
                      {selectedAppointmentData.status === 'confirmed' && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
                            onClick={() => handleStatusChange(selectedAppointmentData.id, 'pending')}
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t('notifications.cancelConfirmation')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleStatusChange(selectedAppointmentData.id, 'no-show')}
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t('home.markAsNoShow')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleDeleteAppointment(selectedAppointmentData.id)}
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('home.deleteAppointment')}
                          </Button>
                        </>
                      )}
                      {selectedAppointmentData.status === 'no-show' && (
                        <>
                          <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                            onClick={() => handleStatusChange(selectedAppointmentData.id, 'confirmed')}
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('home.confirmAppointment')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
                            onClick={() => handleStatusChange(selectedAppointmentData.id, 'pending')}
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t('home.returnToPending')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleDeleteAppointment(selectedAppointmentData.id)}
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('home.deleteAppointment')}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          </Card>
        </div>
      )}

      {/* Модальное окно отчета за сегодня */}
      {showReportModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowReportModal(false)}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />
          <Card 
            className="w-full max-w-3xl backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 flex-shrink-0 border-b border-border/50">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowReportModal(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-xl font-bold mb-2 pr-12">{t('report.title')}</h3>
              <p className="text-sm text-muted-foreground">
                {formatFullDate(new Date())}
              </p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
              {(() => {
                const allAppointments = loadAllAppointments()
                const today = getToday()
                const todayAppointments = allAppointments
                  .filter((apt: any) => {
                    const aptDate = apt.date ? apt.date.split('T')[0] : ''
                    return aptDate === today && apt.status !== 'cancelled'
                  })
                  .sort((a: any, b: any) => {
                    const timeA = a.startTime || a.time || '00:00'
                    const timeB = b.startTime || b.time || '00:00'
                    return timeA.localeCompare(timeB)
                  })
                
                if (todayAppointments.length === 0) {
                  return (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">{t('report.noAppointments')}</p>
                    </div>
                  )
                }
                
                // Считаем только подтвержденные записи
                const confirmedAppointments = todayAppointments.filter((apt: any) => apt.status === 'confirmed')
                const totalRevenue = confirmedAppointments.reduce((sum: number, apt: any) => sum + (apt.price || 0), 0)
                
                return (
                  <div className="space-y-3">
                    {todayAppointments.map((apt: any, idx: number) => (
                      <Card key={apt.id || idx} className="p-4 backdrop-blur-xl bg-card/60 border-border/50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-bold text-foreground">{apt.client || 'Без имени'}</span>
                              <Badge className={cn("text-xs font-medium border", (statusConfig as any)[apt.status]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
                                {(statusConfig as any)[apt.status]?.label || apt.status}
                              </Badge>
                            </div>
                            <div className="space-y-1 text-xs text-muted-foreground">
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span>{apt.startTime || apt.time || ''} {apt.endTime ? `- ${apt.endTime}` : ''}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{t('report.service')}: {apt.service || t('common.none')}</span>
                              </div>
                              {apt.master && (
                                <div className="flex items-center gap-2">
                                  <span>{t('report.master')}: {apt.master}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 text-right flex-shrink-0">
                            <div className="text-lg font-bold text-emerald-400">
                              {apt.price || 0} MDL
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                    
                    {/* Итоговая сумма */}
                    <Card className="p-4 backdrop-blur-xl bg-card/80 border-2 border-emerald-500/30 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-foreground">{t('report.total')}:</span>
                        <span className="text-2xl font-display font-bold text-emerald-400">
                          {totalRevenue} MDL
                        </span>
                      </div>
                    </Card>
                  </div>
                )
              })()}
            </div>
          </Card>
        </div>
      )}

      {/* Модальное окно истории клиента */}
      {showClientHistory && historyClient && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setShowClientHistory(false)}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />
          <Card 
            className="w-full max-w-2xl backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="p-6 flex-shrink-0">
                <div className="absolute top-4 right-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowClientHistory(false)}
                    className="h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-6 pr-12">{t('appointments.clientHistory')}: {historyClient}</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
                {getClientHistory(historyClient).length > 0 ? (
                  <div className="space-y-4">
                    {getClientHistory(historyClient).map((visit, idx) => (
                      <Card key={idx} className="p-4 backdrop-blur-xl bg-card/60 border-border/50">
                        <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-bold text-foreground">
                                {new Date(visit.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { 
                                  weekday: 'long', 
                                  day: 'numeric', 
                                  month: 'long', 
                                  year: 'numeric' 
                                })}
                              </span>
                        </div>
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">{t('home.service')}:</span>
                                <span className="text-sm font-medium text-foreground">{visit.service}</span>
                      </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">{t('home.master')}:</span>
                                <span className="text-sm font-medium text-foreground">{visit.master}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">Оплата:</span>
                                <span className="text-sm font-bold text-emerald-400">{visit.amount} MDL</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={cn("text-xs font-medium border", statusConfig[visit.status as keyof typeof statusConfig]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
                            {statusConfig[visit.status as keyof typeof statusConfig]?.label || visit.status}
                          </Badge>
                        </div>
                      </Card>
                    ))}
                    
                    {/* Итого */}
                    <Card className="p-4 backdrop-blur-xl bg-card/60 border-border/50 border-2 border-primary/30">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Всего посещений:</span>
                        <span className="text-base font-bold text-foreground">{getClientHistory(historyClient).length}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Общая сумма:</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {getClientHistory(historyClient).reduce((sum, visit) => sum + visit.amount, 0)} MDL
                        </span>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">{t('customers.emptyHistory')}</p>
                    </div>
                  )}
                </div>
          </Card>
        </div>
      )}

      {/* Модальное окно создания новой записи */}
      {/* Модальное окно редактирования записи */}
      {showEditAppointmentModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditAppointmentModal(false)}
          />
          <Card 
            className="relative z-[101] w-full max-w-lg backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowEditAppointmentModal(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="text-xl font-bold mb-6 pr-12">{t('home.editAppointment')}</h3>
              
              <div className="space-y-4">
                {/* Дата записи */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.appointmentDate')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDatePickerOpen(true)
                      if (newAppointmentForm.date) {
                        setCalendarDate(new Date(newAppointmentForm.date + 'T00:00:00'))
                      }
                    }}
                    className="w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-card/60 focus:bg-card/60 focus:ring-2 focus:ring-primary/30 text-sm transition-all outline-none flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className={newAppointmentForm.date ? 'text-foreground' : 'text-muted-foreground'}>
                        {formatDateDisplay(newAppointmentForm.date)}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Имя клиента */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.clientName')} *
                  </label>
                  <Input
                    value={newAppointmentForm.client}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, client: e.target.value }))}
                    placeholder={t('common.enterClientName')}
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>

                {/* Телефон */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.phone')} *
                  </label>
                  <Input
                    value={newAppointmentForm.phone}
                    onChange={(e) => {
                      const raw = e.target.value
                      const sanitized = raw.replace(/[^\d+]/g, '')
                      const normalized = sanitized.startsWith('+')
                        ? `+${sanitized.slice(1).replace(/\+/g, '')}`
                        : sanitized.replace(/\+/g, '')
                      setNewAppointmentForm(prev => ({ ...prev, phone: normalized }))
                    }}
                    placeholder={t('common.enterPhone')}
                    inputMode="tel"
                    pattern="[0-9+]*"
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Email
                  </label>
                  <Input
                    value={newAppointmentForm.email}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('common.enterEmail')}
                    type="email"
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>
                
                {/* Комментарий */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('calendar.comment')} ({t('home.optional')})
                  </label>
                  <textarea
                    value={newAppointmentForm.comment}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder={t('calendar.comment')}
                    className="w-full min-h-[96px] rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
                
                {/* Соцсеть */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('calendar.contactMethod')} ({t('home.optional')})
                  </label>
                  <div ref={contactMethodRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsContactMethodOpen((prev) => !prev)}
                      className={cn(
                        "h-12 w-full rounded-lg bg-card/40 border px-4 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 text-left transition",
                        isContactMethodOpen ? "border-primary/40" : "border-border/50 hover:border-primary/30"
                      )}
                    >
                      {newAppointmentForm.contactMethod || t('calendar.contactMethod')}
                    </button>
                    <ChevronDown
                      className={cn(
                        "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
                        isContactMethodOpen && "rotate-180"
                      )}
                    />
                    {isContactMethodOpen && (
                      <div className="absolute left-0 right-0 mt-2 rounded-lg border border-border/50 bg-card shadow-[0_18px_40px_rgba(0,0,0,0.35)] z-50 overflow-hidden">
                        {socialOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setNewAppointmentForm(prev => ({ ...prev, contactMethod: option }))
                              setIsContactMethodOpen(false)
                            }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm transition",
                              newAppointmentForm.contactMethod === option
                                ? "bg-primary/15 text-foreground"
                                : "text-foreground/90 hover:bg-primary/10"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Юзернейм/ссылка/номер */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('calendar.contactHandle')} ({t('home.optional')})
                  </label>
                  <Input
                    value={newAppointmentForm.contactHandle}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, contactHandle: e.target.value }))}
                    placeholder={t('calendar.contactHandle')}
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>

                {/* Услуга */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.service')} *
                  </label>
                  <div ref={serviceDropdownRef} className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between bg-card/40 backdrop-blur-sm border-border/50"
                      onClick={() => setIsServiceOpen(!isServiceOpen)}
                    >
                      <span className={newAppointmentForm.service ? 'text-foreground' : 'text-muted-foreground'}>
                        {newAppointmentForm.service || t('home.selectService')}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isServiceOpen && "rotate-180")} />
                    </Button>
                    {isServiceOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                        <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                          {services.map((service) => (
                            <button
                              key={service}
                              type="button"
                              onClick={() => handleServiceChange(service)}
                              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 transition-colors"
                            >
                              {service}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Мастер */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.master')} *
                  </label>
                  <div ref={masterDropdownRef} className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between bg-card/40 backdrop-blur-sm border-border/50"
                      onClick={() => setIsMasterOpen(!isMasterOpen)}
                    >
                      <span className={newAppointmentForm.master ? 'text-foreground' : 'text-muted-foreground'}>
                        {newAppointmentForm.master || t('home.selectMaster')}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isMasterOpen && "rotate-180")} />
                    </Button>
                    {isMasterOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                        <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                          {masters.map((master) => (
                            <button
                              key={master}
                              type="button"
                              onClick={() => {
                                setNewAppointmentForm(prev => ({ ...prev, master }))
                                setIsMasterOpen(false)
                              }}
                              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 transition-colors"
                            >
                              {master}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Время начала */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.startTime')} *
                  </label>
                  <div ref={startTimeDropdownRef} className="relative">
                    <div className="relative">
                      <Input
                        ref={startTimeInputRef}
                        value={newAppointmentForm.startTime}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^\d:]/g, '')
                          if (value.length === 2 && !value.includes(':')) {
                            value = value + ':'
                          }
                          if (value.length > 5) {
                            value = value.slice(0, 5)
                          }
                          handleStartTimeChange(value)
                        }}
                        onBlur={(e) => {
                          const value = e.target.value
                          if (value && !value.match(/^\d{2}:\d{2}$/)) {
                            const parts = value.split(':')
                            if (parts.length === 2) {
                              const formatted = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
                              handleStartTimeChange(formatted)
                            }
                          }
                        }}
                        onFocus={() => setIsStartTimeDropdownOpen(true)}
                        placeholder={t('common.enterTime')}
                        className="h-12 bg-card/40 backdrop-blur-sm border-border/50 pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setIsStartTimeDropdownOpen(!isStartTimeDropdownOpen)}
                      >
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isStartTimeDropdownOpen && "rotate-180")} />
                      </Button>
                    </div>
                    {isStartTimeDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                        {AVAILABLE_SLOTS.map((time) => {
                          const isSelected = newAppointmentForm.startTime === time
                          
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setNewAppointmentForm(prev => {
                                  const newForm = { ...prev, startTime: time }
                                  if (newForm.service) {
                                    newForm.endTime = calculateEndTime(time, newForm.service)
                                  }
                                  return newForm
                                })
                                setIsStartTimeDropdownOpen(false)
                                startTimeInputRef.current?.blur()
                              }}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                isSelected
                                  ? 'bg-accent/20 text-accent'
                                  : 'text-foreground hover:bg-accent/10 hover:text-accent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{time}</span>
                                {isSelected && <span className="text-xs text-accent">✓</span>}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Время окончания */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.endTime')}
                  </label>
                  <Input
                    value={newAppointmentForm.endTime}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d:]/g, '')
                      if (value.length === 2 && !value.includes(':')) {
                        value = value + ':'
                      }
                      if (value.length > 5) {
                        value = value.slice(0, 5)
                      }
                      setNewAppointmentForm(prev => ({ ...prev, endTime: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value && !value.match(/^\d{2}:\d{2}$/)) {
                        const parts = value.split(':')
                        if (parts.length === 2) {
                          const formatted = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
                          setNewAppointmentForm(prev => ({ ...prev, endTime: formatted }))
                        }
                      }
                    }}
                    placeholder={t('common.enterEndTime')}
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={handleUpdateAppointment}
                  size="lg"
                >
                  {t('home.saveChanges')}
                </Button>
          </div>
        </div>
      </Card>
        </div>
      )}

      {showNewAppointmentModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewAppointmentModal(false)}
          />
          <Card 
            className="relative z-[101] w-full max-w-lg backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowNewAppointmentModal(false)}
                  className="h-8 w-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <h3 className="text-xl font-bold mb-6 pr-12">{t('appointments.new')}</h3>
              
              <div className="space-y-4">
                {/* Дата записи */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.appointmentDate')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsDatePickerOpen(true)
                      if (newAppointmentForm.date) {
                        setCalendarDate(new Date(newAppointmentForm.date + 'T00:00:00'))
                      }
                    }}
                    className="w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-card/60 focus:bg-card/60 focus:ring-2 focus:ring-primary/30 text-sm transition-all outline-none flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className={newAppointmentForm.date ? 'text-foreground' : 'text-muted-foreground'}>
                        {formatDateDisplay(newAppointmentForm.date)}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>
                
                {/* Имя клиента */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.clientName')} *
                  </label>
                  <Input
                    value={newAppointmentForm.client}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, client: e.target.value }))}
                    placeholder={t('common.enterClientName')}
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>

                {/* Телефон */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.phone')} *
                  </label>
                  <Input
                    value={newAppointmentForm.phone}
                    onChange={(e) => {
                      const raw = e.target.value
                      const sanitized = raw.replace(/[^\d+]/g, '')
                      const normalized = sanitized.startsWith('+')
                        ? `+${sanitized.slice(1).replace(/\+/g, '')}`
                        : sanitized.replace(/\+/g, '')
                      setNewAppointmentForm(prev => ({ ...prev, phone: normalized }))
                    }}
                    placeholder={t('common.enterPhone')}
                    inputMode="tel"
                    pattern="[0-9+]*"
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.email')} ({t('home.optional')})
                  </label>
                  <Input
                    type="email"
                    value={newAppointmentForm.email}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('common.enterEmail')}
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>
                
                {/* Комментарий */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('calendar.comment')} ({t('home.optional')})
                  </label>
                  <textarea
                    value={newAppointmentForm.comment}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, comment: e.target.value }))}
                    placeholder={t('calendar.comment')}
                    className="w-full min-h-[96px] rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />
                </div>
                
                {/* Соцсеть */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('calendar.contactMethod')} ({t('home.optional')})
                  </label>
                  <div ref={contactMethodRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsContactMethodOpen((prev) => !prev)}
                      className={cn(
                        "h-12 w-full rounded-lg bg-card/40 border px-4 pr-10 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 text-left transition",
                        isContactMethodOpen ? "border-primary/40" : "border-border/50 hover:border-primary/30"
                      )}
                    >
                      {newAppointmentForm.contactMethod || t('calendar.contactMethod')}
                    </button>
                    <ChevronDown
                      className={cn(
                        "pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-transform",
                        isContactMethodOpen && "rotate-180"
                      )}
                    />
                    {isContactMethodOpen && (
                      <div className="absolute left-0 right-0 mt-2 rounded-lg border border-border/50 bg-card shadow-[0_18px_40px_rgba(0,0,0,0.35)] z-50 overflow-hidden">
                        {socialOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setNewAppointmentForm(prev => ({ ...prev, contactMethod: option }))
                              setIsContactMethodOpen(false)
                            }}
                            className={cn(
                              "w-full px-4 py-2.5 text-left text-sm transition",
                              newAppointmentForm.contactMethod === option
                                ? "bg-primary/15 text-foreground"
                                : "text-foreground/90 hover:bg-primary/10"
                            )}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Юзернейм/ссылка/номер */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('calendar.contactHandle')} ({t('home.optional')})
                  </label>
                  <Input
                    value={newAppointmentForm.contactHandle}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, contactHandle: e.target.value }))}
                    placeholder={t('calendar.contactHandle')}
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  />
                </div>

                {/* Услуга */}
                <div ref={serviceDropdownRef} className="relative">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.service')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsServiceOpen(!isServiceOpen)}
                    className={`w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between ${
                      isServiceOpen
                        ? 'border-accent/50 ring-2 ring-accent/30'
                        : 'border-border/50 hover:border-accent/30'
                    } ${newAppointmentForm.service ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    <span>{newAppointmentForm.service || 'Выберите услугу'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isServiceOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isServiceOpen && (
                    <div className="absolute z-[102] w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                      <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                        {services.map((service) => (
                          <button
                            key={service}
                            type="button"
                            onClick={() => handleServiceChange(service)}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                              newAppointmentForm.service === service
                                ? 'bg-accent/20 text-accent'
                                : 'text-foreground hover:bg-accent/10 hover:text-accent'
                            }`}
                          >
                            {service}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Мастер */}
                <div ref={masterDropdownRef} className="relative">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.master')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsMasterOpen(!isMasterOpen)}
                    className={`w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between ${
                      isMasterOpen
                        ? 'border-accent/50 ring-2 ring-accent/30'
                        : 'border-border/50 hover:border-accent/30'
                    } ${newAppointmentForm.master ? 'text-foreground' : 'text-muted-foreground'}`}
                  >
                    <span>{newAppointmentForm.master || 'Выберите мастера'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isMasterOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isMasterOpen && (
                    <div className="absolute z-[102] w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                      <div className="py-1">
                        {masters.map((master) => (
                          <button
                            key={master}
                            type="button"
                            onClick={() => {
                              setNewAppointmentForm(prev => ({ ...prev, master }))
                              setIsMasterOpen(false)
                            }}
                            className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                              newAppointmentForm.master === master
                                ? 'bg-accent/20 text-accent'
                                : 'text-foreground hover:bg-accent/10 hover:text-accent'
                            }`}
                          >
                            {master}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Время начала */}
                <div ref={startTimeDropdownRef} className="relative">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.startTime')} * ({t('home.exampleTime')})
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70 z-10 pointer-events-none" />
                    <Input
                      ref={startTimeInputRef}
                      type="text"
                      value={newAppointmentForm.startTime}
                      onChange={(e) => {
                        const value = e.target.value
                        // Разрешаем пустое значение для стирания
                        if (value === '') {
                          setNewAppointmentForm(prev => ({
                            ...prev,
                            startTime: '',
                            endTime: ''
                          }))
                          return
                        }
                        // Разрешаем только формат ЧЧ:ММ
                        if (/^([0-1]?[0-9]|2[0-3]):?([0-5]?[0-9]?)?$/.test(value)) {
                          let formatted = value
                          // Автоматически добавляем двоеточие после 2 цифр
                          if (value.length === 2 && !value.includes(':')) {
                            formatted = value + ':'
                          }
                          // Ограничиваем до 5 символов (ЧЧ:ММ)
                          if (formatted.length <= 5) {
                            setNewAppointmentForm(prev => {
                              const newForm = { ...prev, startTime: formatted }
                              // Пересчитываем время окончания если есть услуга и время полностью введено
                              if (newForm.service && formatted.length === 5 && formatted.match(/^\d{2}:\d{2}$/)) {
                                newForm.endTime = calculateEndTime(formatted, newForm.service)
                              } else if (!formatted.match(/^\d{2}:\d{2}$/)) {
                                // Если время неполное, очищаем время окончания
                                newForm.endTime = ''
                              }
                              return newForm
                            })
                          }
                        }
                      }}
                      onFocus={() => setIsStartTimeDropdownOpen(true)}
                      onBlur={(e) => {
                        // Не закрываем dropdown если клик был внутри него
                        setTimeout(() => {
                          if (!startTimeDropdownRef.current?.contains(document.activeElement)) {
                            setIsStartTimeDropdownOpen(false)
                          }
                        }, 200)
                        
                        // Проверяем и форматируем время при потере фокуса
                        const value = e.target.value
                        if (value && value.length > 0) {
                          const parts = value.split(':')
                          if (parts.length === 1 && parts[0].length === 2) {
                            // Если только часы, добавляем :00
                            const formatted = `${parts[0]}:00`
                            setNewAppointmentForm(prev => ({
                              ...prev,
                              startTime: formatted,
                              endTime: prev.service ? calculateEndTime(formatted, prev.service) : ''
                            }))
                          } else if (parts.length === 2) {
                            // Форматируем минуты до 2 цифр
                            const hours = parts[0].padStart(2, '0')
                            const minutes = parts[1].padStart(2, '0')
                            const formatted = `${hours}:${minutes}`
                            setNewAppointmentForm(prev => ({
                              ...prev,
                              startTime: formatted,
                              endTime: prev.service ? calculateEndTime(formatted, prev.service) : ''
                            }))
                          }
                        } else {
                          // Если поле пустое, очищаем время окончания
                          setNewAppointmentForm(prev => ({
                            ...prev,
                            endTime: ''
                          }))
                        }
                      }}
                      placeholder="10:30 или выберите из списка"
                      className="h-12 pl-10 bg-card/40 backdrop-blur-sm border-border/50"
                    />
                    <ChevronDown 
                      className={`absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-transform pointer-events-none ${isStartTimeDropdownOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                  
                  {/* Выпадающий список с предложениями времени */}
                  {isStartTimeDropdownOpen && (
                    <div className="absolute z-[102] w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                      <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                        {/* Генерируем временные слоты каждые 15 минут от 09:00 до 18:00 */}
                        {Array.from({ length: 37 }, (_, i) => {
                          const hour = Math.floor(i * 15 / 60) + 9
                          const minute = (i * 15) % 60
                          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
                          if (hour >= 18) return null
                          
                          const isAvailable = findAvailableSlot(time)
                          const isSelected = newAppointmentForm.startTime === time
                          
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setNewAppointmentForm(prev => {
                                  const newForm = { ...prev, startTime: time }
                                  if (newForm.service) {
                                    newForm.endTime = calculateEndTime(time, newForm.service)
                                  }
                                  return newForm
                                })
                                setIsStartTimeDropdownOpen(false)
                                startTimeInputRef.current?.blur()
                              }}
                              disabled={!isAvailable}
                              className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                                !isAvailable
                                  ? 'text-muted-foreground/50 cursor-not-allowed'
                                  : isSelected
                                  ? 'bg-accent/20 text-accent'
                                  : 'text-foreground hover:bg-accent/10 hover:text-accent'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span>{time}</span>
                                {!isAvailable && <span className="text-xs text-muted-foreground/50">Занято</span>}
                                {isSelected && <span className="text-xs text-accent">✓</span>}
                              </div>
                            </button>
                          )
                        }).filter(Boolean)}
                      </div>
                    </div>
                  )}
                  
                </div>

                {/* Время окончания */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.endTime')} {newAppointmentForm.service && newAppointmentForm.startTime && (
                      <span className="text-xs font-normal text-muted-foreground">({t('home.calculatedAutomatically')})</span>
                    )}
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/70 z-10 pointer-events-none" />
                    <Input
                      type="text"
                      value={newAppointmentForm.endTime}
                      onChange={(e) => {
                        const value = e.target.value
                        // Разрешаем пустое значение для стирания
                        if (value === '') {
                          setNewAppointmentForm(prev => ({
                            ...prev,
                            endTime: ''
                          }))
                          return
                        }
                        // Разрешаем только формат ЧЧ:ММ
                        if (/^([0-1]?[0-9]|2[0-3]):?([0-5]?[0-9]?)?$/.test(value)) {
                          let formatted = value
                          // Автоматически добавляем двоеточие после 2 цифр
                          if (value.length === 2 && !value.includes(':')) {
                            formatted = value + ':'
                          }
                          // Ограничиваем до 5 символов (ЧЧ:ММ)
                          if (formatted.length <= 5) {
                            setNewAppointmentForm(prev => ({ ...prev, endTime: formatted }))
                          }
                        }
                      }}
                      onBlur={(e) => {
                        // Проверяем и форматируем время при потере фокуса
                        const value = e.target.value
                        if (value && value.length > 0) {
                          const parts = value.split(':')
                          if (parts.length === 1 && parts[0].length === 2) {
                            // Если только часы, добавляем :00
                            const formatted = `${parts[0]}:00`
                            setNewAppointmentForm(prev => ({ ...prev, endTime: formatted }))
                          } else if (parts.length === 2) {
                            // Форматируем минуты до 2 цифр
                            const hours = parts[0].padStart(2, '0')
                            const minutes = parts[1].padStart(2, '0')
                            const formatted = `${hours}:${minutes}`
                            setNewAppointmentForm(prev => ({ ...prev, endTime: formatted }))
                          }
                        } else if (!value && newAppointmentForm.service && newAppointmentForm.startTime) {
                          // Если поле пустое, но есть услуга и время начала, пересчитываем автоматически
                          const autoEndTime = calculateEndTime(newAppointmentForm.startTime, newAppointmentForm.service)
                          if (autoEndTime) {
                            setNewAppointmentForm(prev => ({ ...prev, endTime: autoEndTime }))
                          }
                        }
                      }}
                      placeholder={newAppointmentForm.service && newAppointmentForm.startTime ? t('common.automatically') : t('common.enterEndTime')}
                      className="h-12 pl-10 bg-card/40 backdrop-blur-sm border-border/50"
                      disabled={!newAppointmentForm.service || !newAppointmentForm.startTime}
                    />
                  </div>
                  {newAppointmentForm.service && newAppointmentForm.startTime && !newAppointmentForm.endTime && (
                    <p className="text-xs text-muted-foreground mt-1">{t('home.endTimeWillBeCalculated')}</p>
                  )}
                </div>

                {/* Кнопка создания */}
                <div className="pt-4 border-t border-border/50">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    onClick={handleCreateAppointment}
                    size="lg"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {t('home.createAppointment')}
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Модальное окно выбора даты */}
      {isDatePickerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
            onClick={() => setIsDatePickerOpen(false)}
          />
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsDatePickerOpen(false)
              }
            }}
          >
            <Card 
              className="w-full max-w-sm backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-lg">{t('home.selectDate')}</h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsDatePickerOpen(false)}
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
                  {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(calendarDate).map((date, idx) => {
                    if (!date) {
                      return <div key={idx} className="h-9" />
                    }
                    const dateStr = formatDateToLocalString(date)
                    const today = new Date()
                    const isPast = date < today && !isToday(date)
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          if (!isPast) {
                            setNewAppointmentForm(prev => ({ ...prev, date: dateStr }))
                            setIsDatePickerOpen(false)
                          }
                        }}
                        disabled={isPast}
                        className={cn(
                          "h-9 rounded-lg text-sm transition-all cursor-pointer",
                          isPast && "opacity-30 cursor-not-allowed",
                          isSelected(date, newAppointmentForm.date)
                            ? 'bg-accent text-accent-foreground font-semibold'
                            : isToday(date)
                            ? 'bg-accent/20 text-accent font-semibold hover:bg-accent/30'
                            : 'text-foreground hover:bg-accent/10 hover:text-accent'
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
    </>
  )
}
