import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X, Phone, Mail, Calendar as CalendarIcon, History, CheckCircle2, XCircle, Globe, User, RotateCcw, ChevronDown, Clock, Trash2, Pencil, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AVAILABLE_SLOTS } from '@/lib/mock-data'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface Appointment {
  id: string
  client: string
  phone: string
  email?: string
  comment?: string
  contactMethod?: string
  contactHandle?: string
  service: string
  master: string
  date: string
  startTime: string
  endTime: string
  status: 'pending' | 'confirmed' | 'no-show' | 'completed'
  source: 'online' | 'admin' | 'repeat'
  price?: number
}

export default function Calendar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { t, language } = useLanguage()
  const [selectedAppointment, setSelectedAppointment] = useState<string | null>(null)
  const [selectedAppointmentData, setSelectedAppointmentData] = useState<Appointment | null>(null)
  const [showClientHistory, setShowClientHistory] = useState(false)
  const [historyClient, setHistoryClient] = useState<string | null>(null)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [isServiceOpen, setIsServiceOpen] = useState(false)
  const [isMasterOpen, setIsMasterOpen] = useState(false)
  const [isStartTimeDropdownOpen, setIsStartTimeDropdownOpen] = useState(false)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  const [calendarDate, setCalendarDate] = useState(new Date())
  // Функция для получения актуальной сегодняшней даты (использует локальное время, а не UTC)
  const getToday = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  const [selectedDate, setSelectedDate] = useState(() => getToday())
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day')
  const [expandedSlot, setExpandedSlot] = useState<{ date: string; time: string } | null>(null)
  const [focusedAppointmentId, setFocusedAppointmentId] = useState<string | null>(null)
  const [selectedMasterFilter, setSelectedMasterFilter] = useState<string>(t('calendar.allMasters'))
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all')
  const [isMasterFilterOpen, setIsMasterFilterOpen] = useState(false)
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false)
  
  const serviceDropdownRef = useRef<HTMLDivElement>(null)
  const masterDropdownRef = useRef<HTMLDivElement>(null)
  const startTimeDropdownRef = useRef<HTMLDivElement>(null)
  const startTimeInputRef = useRef<HTMLInputElement>(null)
  const masterFilterDropdownRef = useRef<HTMLDivElement>(null)
  const statusFilterDropdownRef = useRef<HTMLDivElement>(null)

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

  const [newAppointmentForm, setNewAppointmentForm] = useState({
    client: '',
    phone: '',
    email: '',
    service: '',
    master: '',
    startTime: '',
    endTime: '',
      date: getToday(),
  })

  // Загрузка записей для выбранной даты с применением фильтров
  const loadAppointments = (date: string) => {
    const today = getToday()
    // Если запрашивается сегодняшняя дата, всегда используем актуальную сегодняшнюю дату
    const dateToLoad = date === today ? today : date
    
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        let filtered = parsed.filter((apt: any) => apt.status !== 'cancelled')
        
        // Фильтр по дате
        filtered = filtered.filter((apt: any) => {
          const aptDate = apt.date ? apt.date.split('T')[0] : ''
          return aptDate === dateToLoad
        })
        
        // Фильтр по мастеру
        if (selectedMasterFilter !== t('calendar.allMasters')) {
          filtered = filtered.filter((apt: any) => {
            const aptMaster = apt.master || apt.staff
            return aptMaster === selectedMasterFilter
          })
        }
        
        // Фильтр по статусу
        if (selectedStatusFilter !== 'all') {
          filtered = filtered.filter((apt: any) => apt.status === selectedStatusFilter)
        }
        
        return filtered.map((apt: any) => {
          // Если у записи нет цены, получаем её из услуг
          let price = apt.price
          if (price === undefined && apt.service) {
            price = getServicePrice(apt.service)
          }
          
          return {
            id: apt.id,
            client: apt.client,
            phone: apt.phone,
            email: apt.email,
            comment: apt.comment,
            contactMethod: apt.contactMethod,
            contactHandle: apt.contactHandle,
            service: apt.service,
            master: apt.master || apt.staff,
            date: apt.date || dateToLoad,
            startTime: apt.startTime || apt.time,
            endTime: apt.endTime,
            status: apt.status || 'pending',
            source: apt.source || 'admin',
            price: price,
          } as Appointment
        })
      } catch (e) {
        console.error('Ошибка загрузки записей из localStorage:', e)
      }
    }
    return []
  }

  const [appointments, setAppointments] = useState(() => loadAppointments(selectedDate))

  // Обновляем selectedDate при монтировании, всегда устанавливаем актуальную дату
  useEffect(() => {
    const currentToday = getToday()
    setSelectedDate(currentToday)
  }, [])

  // Обновляем selectedDate, если наступил новый день (отключено принудительное возвращение к today)

  useEffect(() => {
    const updateAppointments = () => {
      if (viewMode === 'day') {
        setAppointments(loadAppointments(selectedDate))
      } else {
        // В недельном виде getAppointmentsForDateAndTime загружает напрямую из localStorage
        // Просто обновляем состояние для перерисовки
        setAppointments((prev: Appointment[]) => [...prev])
      }
    }
    
    updateAppointments()
    window.addEventListener('storage', updateAppointments)
    const interval = setInterval(updateAppointments, 1000)
    
    return () => {
      window.removeEventListener('storage', updateAppointments)
      clearInterval(interval)
    }
  }, [selectedDate, viewMode, selectedMasterFilter, selectedStatusFilter])

  const statusConfig = {
    pending: { label: t('status.pending'), color: 'bg-amber-500/40 text-amber-300 border-amber-500/50' },
    confirmed: { label: t('status.confirmed'), color: 'bg-emerald-500/40 text-emerald-300 border-emerald-500/50' },
    'no-show': { label: t('status.noShow'), color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    completed: { label: t('status.completed'), color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  }

  const sourceConfig = {
    online: { label: t('calendar.sourceOnline'), icon: Globe, color: 'text-blue-400' },
    admin: { label: t('calendar.sourceAdmin'), icon: User, color: 'text-green-400' },
    repeat: { label: t('calendar.sourceRepeat'), icon: RotateCcw, color: 'text-purple-400' },
  }

  const openAppointment = (appointment: Appointment) => {
    setSelectedAppointment(appointment.id)
    setSelectedAppointmentData(appointment)
    if (appointment.date) {
      const normalized = appointment.date.split('T')[0]
      if (normalized && normalized !== selectedDate) {
        setSelectedDate(normalized)
      }
    }
  }

  const handleAppointmentClick = (appointment: Appointment) => {
    openAppointment(appointment)
  }

  const handleStatusChange = (appointmentId: string, newStatus: 'pending' | 'confirmed' | 'no-show' | 'completed') => {
    // Обновляем в состоянии
    setAppointments((prev: Appointment[]) => prev.map((apt: Appointment) => 
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
    
    setSelectedAppointment(null)
    setSelectedAppointmentData(null)
  }

  const handleShowHistory = (clientName: string) => {
    setHistoryClient(clientName)
    setShowClientHistory(true)
    setSelectedAppointment(null)
    setSelectedAppointmentData(null)
  }

  const handleDeleteAppointment = (appointmentId: string) => {
    const appointment = appointments.find((apt: Appointment) => apt.id === appointmentId)
    if (!appointment) {
      // Если запись не найдена в текущем состоянии, пытаемся найти в localStorage
      const stored = localStorage.getItem('appointments')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const foundAppointment = parsed.find((apt: any) => apt.id === appointmentId)
          if (!foundAppointment) return
        } catch (e) {
          console.error('Ошибка поиска записи:', e)
          return
        }
      } else {
        return
      }
    }

    const confirmMessage = `${t('appointments.confirmDeleteAppointment')} "${appointment?.client || t('appointments.unknownClient')}"?`
    if (window.confirm(confirmMessage)) {
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
      
      // Обновляем состояние - перезагружаем записи для текущей даты
      // В недельном виде getAppointmentsForDateAndTime загружает напрямую из localStorage, так что обновление произойдет автоматически
      if (viewMode === 'day') {
        setAppointments(loadAppointments(selectedDate))
      } else {
        // В недельном виде просто обновляем состояние, чтобы вызвать перерисовку
        setAppointments((prev: Appointment[]) => prev.filter((apt: Appointment) => apt.id !== appointmentId))
      }
      
      setSelectedAppointment(null)
      setSelectedAppointmentData(null)
      setExpandedSlot(null)
      setFocusedAppointmentId(null)
    }
  }

  const handleCreateAppointment = () => {
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

    // Используем дату из формы, если она указана, иначе выбранную дату
    const appointmentDate = newAppointmentForm.date || selectedDate
    const normalizedAppointmentDate = appointmentDate.split('T')[0]
    const today = getToday()
    const isFutureDate = normalizedAppointmentDate > today
    const isSelectedDateToday = normalizedAppointmentDate === selectedDate

    // Получаем цену услуги
    const servicePrice = getServicePrice(newAppointmentForm.service)

    const newAppointment = {
      id: Date.now().toString(),
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      client: newAppointmentForm.client,
      phone: newAppointmentForm.phone,
      email: newAppointmentForm.email || undefined,
      service: newAppointmentForm.service,
      master: newAppointmentForm.master,
      date: normalizedAppointmentDate,
      status: (isFutureDate ? 'pending' : 'confirmed') as 'pending' | 'confirmed',
      source: 'admin' as const,
      price: servicePrice,
    }

    // Сохраняем в localStorage
    const stored = localStorage.getItem('appointments')
    let allAppointments: any[] = []
    if (stored) {
      try {
        allAppointments = JSON.parse(stored)
      } catch (e) {
        console.error('Ошибка загрузки всех записей:', e)
      }
    }
    const existingIndex = allAppointments.findIndex((apt: any) => apt.id === newAppointment.id)
    if (existingIndex === -1) {
      allAppointments.push(newAppointment)
    } else {
      allAppointments[existingIndex] = newAppointment
    }
    localStorage.setItem('appointments', JSON.stringify(allAppointments))

    // Если запись на выбранную дату, добавляем в состояние
    if (isSelectedDateToday) {
      setAppointments((prev: Appointment[]) => {
        const exists = prev.some(apt => apt.id === newAppointment.id)
        if (exists) {
          return prev
        }
        return [...prev, newAppointment]
      })
    } else {
      // Если дата изменилась, перезагружаем записи для выбранной даты
      if (viewMode === 'day') {
        const updatedAppointments = loadAppointments(selectedDate)
        setAppointments(updatedAppointments)
      }
    }

    setShowNewAppointmentModal(false)
    setNewAppointmentForm({
      client: '',
      phone: '',
      email: '',
      service: '',
      master: '',
      startTime: '',
      endTime: '',
      date: selectedDate,
    })
  }

  const handleOpenEditAppointmentModal = (appointmentId: string) => {
    // Сначала ищем в текущем состоянии
    let appointment = appointments.find((apt: Appointment) => apt.id === appointmentId)
    
    // Если не найдено в состоянии (например, в недельном виде), ищем в localStorage
    if (!appointment) {
      const stored = localStorage.getItem('appointments')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const found = parsed.find((apt: any) => apt.id === appointmentId && apt.status !== 'cancelled')
          if (found) {
            // Убеждаемся, что все поля присутствуют
            appointment = {
              id: found.id,
              client: found.client,
              phone: found.phone,
              email: found.email,
              service: found.service,
              master: found.master,
              date: found.date || getToday(),
              startTime: found.startTime,
              endTime: found.endTime,
              status: found.status || 'pending',
              source: found.source || 'admin',
              price: found.price,
            } as Appointment
          }
        } catch (e) {
          console.error('Ошибка загрузки записи:', e)
        }
      }
    }
    
    if (!appointment) {
      console.error('Запись не найдена:', appointmentId)
      return
    }
    
    const appointmentDate = appointment.date ? appointment.date.split('T')[0] : getToday()
    
    setNewAppointmentForm({
      client: appointment.client,
      phone: appointment.phone,
      email: appointment.email || '',
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
    // Закрываем все другие модальные окна
    setSelectedAppointment(null)
    setSelectedAppointmentData(null)
    setExpandedSlot(null)
    setFocusedAppointmentId(null)
  }

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

  const handleUpdateAppointment = () => {
    if (!editingAppointmentId) return
    
    if (!newAppointmentForm.client || !newAppointmentForm.phone || !newAppointmentForm.service || !newAppointmentForm.master || !newAppointmentForm.startTime) {
      alert(t('appointments.fillAllFields'))
      return
    }

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

    let formattedEndTime = newAppointmentForm.endTime || calculateEndTime(formattedStartTime, newAppointmentForm.service)
    if (formattedEndTime && !formattedEndTime.match(/^\d{2}:\d{2}$/)) {
      const parts = formattedEndTime.split(':')
      if (parts.length === 2) {
        formattedEndTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      }
    }

    // Находим оригинальную запись для сохранения всех полей
    const originalAppointment = appointments.find((apt: Appointment) => apt.id === editingAppointmentId)
    if (!originalAppointment) return

    const normalizedDate = (newAppointmentForm.date || getToday()).split('T')[0]
    const originalDate = originalAppointment.date ? originalAppointment.date.split('T')[0] : getToday()
    const dateChanged = normalizedDate !== originalDate

    // Получаем цену услуги
    const servicePrice = getServicePrice(newAppointmentForm.service)

    const updatedAppointment = {
      ...originalAppointment,
      client: newAppointmentForm.client,
      phone: newAppointmentForm.phone,
      email: newAppointmentForm.email || undefined,
      service: newAppointmentForm.service,
      master: newAppointmentForm.master,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
      date: normalizedDate,
      price: servicePrice,
    }
    
    // Сохраняем в localStorage
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const existingIndex = parsed.findIndex((apt: any) => apt.id === editingAppointmentId)
        if (existingIndex !== -1) {
          parsed[existingIndex] = updatedAppointment
          localStorage.setItem('appointments', JSON.stringify(parsed))
        }
      } catch (e) {
        console.error('Ошибка сохранения изменений записи:', e)
      }
    }

    // Закрываем все модальные окна перед обновлением
    setShowEditAppointmentModal(false)
    setEditingAppointmentId(null)
    setExpandedSlot(null)
    setFocusedAppointmentId(null)
    setSelectedAppointment(null)
    setSelectedAppointmentData(null)

    // Если дата изменилась, перезагружаем записи для новой даты
    if (dateChanged) {
      // Переключаемся на новую дату
      setSelectedDate(normalizedDate)
      // Перезагружаем записи для новой даты
      if (viewMode === 'day') {
        const updatedAppointments = loadAppointments(normalizedDate)
        setAppointments(updatedAppointments)
      }
      // В недельном виде getAppointmentsForDateAndTime загружает напрямую из localStorage
      // Просто принудительно обновляем состояние для перерисовки
      else {
        setAppointments((prev: Appointment[]) => {
          // Удаляем старую запись и добавляем обновленную
          const filtered = prev.filter((apt: Appointment) => apt.id !== editingAppointmentId)
          return [...filtered, updatedAppointment]
        })
      }
    } else {
      // Если дата не изменилась, обновляем запись в состоянии
      if (viewMode === 'day') {
        setAppointments((prev: Appointment[]) => prev.map((apt: Appointment) => 
          apt.id === editingAppointmentId 
            ? updatedAppointment
            : apt
        ))
      } else {
        // В недельном виде обновляем состояние для перерисовки
        // getAppointmentsForDateAndTime загружает напрямую из localStorage
        // Принудительно обновляем состояние, чтобы вызвать перерисовку
        setAppointments((prev: Appointment[]) => {
          const updated = prev.map((apt: Appointment) => 
            apt.id === editingAppointmentId 
              ? updatedAppointment
              : apt
          )
          // Если запись не была в состоянии (недельный вид), добавляем её
          if (!prev.find(apt => apt.id === editingAppointmentId)) {
            return [...updated, updatedAppointment]
          }
          return updated
        })
      }
    }
    const today = getToday()
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

  useEffect(() => {
    const state = location.state as { openAppointmentId?: string } | null
    if (state?.openAppointmentId) {
      setSelectedAppointment(state.openAppointmentId)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

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
      if (masterFilterDropdownRef.current && !masterFilterDropdownRef.current.contains(event.target as Node)) {
        setIsMasterFilterOpen(false)
      }
      if (statusFilterDropdownRef.current && !statusFilterDropdownRef.current.contains(event.target as Node)) {
        setIsStatusFilterOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  })

  useEffect(() => {
    if (newAppointmentForm.service && newAppointmentForm.startTime && newAppointmentForm.startTime.match(/^\d{2}:\d{2}$/)) {
      const calculatedEndTime = calculateEndTime(newAppointmentForm.startTime, newAppointmentForm.service)
      if (calculatedEndTime && calculatedEndTime !== newAppointmentForm.endTime) {
        setNewAppointmentForm(prev => ({ ...prev, endTime: calculatedEndTime }))
      }
    }
  }, [newAppointmentForm.service, newAppointmentForm.startTime])

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

  const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return t('calendar.selectDate')
    const date = new Date(dateStr + 'T00:00:00')
    const locale = language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US'
    const formatted = date.toLocaleDateString(locale, {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }

  // Навигация по дням/неделям
  const navigateDate = (direction: 'prev' | 'next') => {
    const currentDate = new Date(selectedDate + 'T00:00:00')
    if (viewMode === 'week') {
      currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      currentDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setSelectedDate(formatDateToLocalString(currentDate))
  }

  // Получение дней недели
  const getWeekDays = () => {
    const startDate = new Date(selectedDate + 'T00:00:00')
    const dayOfWeek = startDate.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    startDate.setDate(startDate.getDate() + mondayOffset)
    
    const days = []
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(formatDateToLocalString(date))
    }
    return days
  }

  // Получение записей для конкретной даты и времени с применением фильтров
  const getAppointmentsForDateAndTime = (date: string, time: string) => {
    const currentToday = getToday()
    // Если запрашивается сегодняшняя дата, всегда используем актуальную сегодняшнюю дату
    const dateToLoad = date === currentToday ? currentToday : date
    
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        let filtered = parsed.filter((apt: any) => apt.status !== 'cancelled')
        
        // Фильтр по дате
        filtered = filtered.filter((apt: any) => {
          const aptDate = apt.date ? apt.date.split('T')[0] : ''
          return aptDate === dateToLoad
        })
        
        // Фильтр по мастеру
        if (selectedMasterFilter !== t('calendar.allMasters')) {
          filtered = filtered.filter((apt: any) => {
            const aptMaster = apt.master || apt.staff
            return aptMaster === selectedMasterFilter
          })
        }
        
        // Фильтр по статусу
        if (selectedStatusFilter !== 'all') {
          filtered = filtered.filter((apt: any) => apt.status === selectedStatusFilter)
        }
        
        // Фильтр по времени
        const timeFiltered = filtered.filter((apt: any) => {
          if (apt.startTime === time) return true
          
          const slotHour = parseInt(time.split(':')[0])
          const slotMin = parseInt(time.split(':')[1])
          const slotMinutes = slotHour * 60 + slotMin
          
          const aptHour = parseInt(apt.startTime.split(':')[0])
          const aptMin = parseInt(apt.startTime.split(':')[1])
          const aptMinutes = aptHour * 60 + aptMin
          
          const timeIndex = AVAILABLE_SLOTS.indexOf(time)
          const nextSlotIndex = timeIndex + 1
          if (nextSlotIndex < AVAILABLE_SLOTS.length) {
            const nextSlot = AVAILABLE_SLOTS[nextSlotIndex]
            const nextSlotHour = parseInt(nextSlot.split(':')[0])
            const nextSlotMin = parseInt(nextSlot.split(':')[1])
            const nextSlotMinutes = nextSlotHour * 60 + nextSlotMin
            return aptMinutes >= slotMinutes && aptMinutes < nextSlotMinutes
          } else {
            return aptMinutes >= slotMinutes
          }
        })
        
        // Добавляем цену для записей, у которых её нет
        return timeFiltered.map((apt: any) => {
          let price = apt.price
          if (price === undefined && apt.service) {
            price = getServicePrice(apt.service)
          }
          
          return {
            id: apt.id,
            client: apt.client,
            phone: apt.phone,
            email: apt.email,
            service: apt.service,
            master: apt.master || apt.staff,
            date: apt.date || dateToLoad,
            startTime: apt.startTime || apt.time,
            endTime: apt.endTime,
            status: apt.status || 'pending',
            source: apt.source || 'admin',
            price: price,
          } as Appointment
        })
      } catch (e) {
        console.error('Ошибка загрузки записей:', e)
      }
    }
    return []
  }

  // Проверка, является ли дата выбранной
  const isSelectedDate = (date: Date | null, selectedDateStr: string) => {
    if (!date || !selectedDateStr) return false
    const dateStr = formatDateToLocalString(date)
    return dateStr === selectedDateStr
  }

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
      ],
    }
    return historyData[clientName] || []
  }

  return (
    <>
      <Card className="overflow-hidden backdrop-blur-xl bg-card/60">
        <div className="p-5 border-b border-border bg-muted/30">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate('prev')}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <button
                type="button"
                onClick={() => {
                  setCalendarDate(new Date(selectedDate + 'T00:00:00'))
                  setIsDatePickerOpen(true)
                }}
                className="flex-1 sm:flex-none px-4 py-2.5 sm:px-5 sm:py-3 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-card/60 focus:bg-card/60 focus:ring-2 focus:ring-primary/30 text-sm sm:text-base transition-all outline-none flex items-center gap-2 font-medium"
              >
                <CalendarIcon className="w-5 h-5" />
                {formatDateDisplay(selectedDate)}
              </button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate('next')}
                className="h-9 w-9 sm:h-10 sm:w-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-muted/30 rounded-lg p-1 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setViewMode('day')}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all",
                  viewMode === 'day'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {t('calendar.day')}
              </button>
              <button
                type="button"
                onClick={() => setViewMode('week')}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all",
                  viewMode === 'week'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-primary'
                )}
              >
                {t('calendar.week')}
              </button>
            </div>
          </div>
          {/* Фильтры */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-center gap-3 mt-4">
            {/* Фильтр по мастерам */}
            <div ref={masterFilterDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsMasterFilterOpen(!isMasterFilterOpen)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-card/60 focus:bg-card/60 focus:ring-2 focus:ring-primary/30 text-sm transition-all outline-none flex items-center gap-2 font-medium"
              >
                <User className="w-4 h-4" />
                <span>{selectedMasterFilter}</span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isMasterFilterOpen && "rotate-180")} />
              </button>
              {isMasterFilterOpen && (
                <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedMasterFilter(t('calendar.allMasters'))
                        setIsMasterFilterOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedMasterFilter === t('calendar.allMasters')
                          ? 'bg-accent/20 text-accent'
                          : 'text-foreground hover:bg-accent/10 hover:text-accent'
                      }`}
                    >
                      {t('calendar.allMasters')}
                    </button>
                    {masters.map((master) => (
                      <button
                        key={master}
                        type="button"
                        onClick={() => {
                          setSelectedMasterFilter(master)
                          setIsMasterFilterOpen(false)
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                          selectedMasterFilter === master
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

            {/* Фильтр по статусам */}
            <div ref={statusFilterDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setIsStatusFilterOpen(!isStatusFilterOpen)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-card/60 focus:bg-card/60 focus:ring-2 focus:ring-primary/30 text-sm transition-all outline-none flex items-center gap-2 font-medium"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {selectedStatusFilter === 'all' 
                    ? t('calendar.allStatuses') 
                    : (statusConfig as any)[selectedStatusFilter]?.label || selectedStatusFilter}
                </span>
                <ChevronDown className={cn("w-4 h-4 transition-transform", isStatusFilterOpen && "rotate-180")} />
              </button>
              {isStatusFilterOpen && (
                <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStatusFilter('all')
                        setIsStatusFilterOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedStatusFilter === 'all'
                          ? 'bg-accent/20 text-accent'
                          : 'text-foreground hover:bg-accent/10 hover:text-accent'
                      }`}
                    >
                      {t('calendar.allStatuses')}
                    </button>
                    {Object.entries(statusConfig)
                      .filter(([status]) => status !== 'completed')
                      .map(([status, config]: [string, any]) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => {
                            setSelectedStatusFilter(status)
                            setIsStatusFilterOpen(false)
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            selectedStatusFilter === status
                              ? 'bg-accent/20 text-accent'
                              : 'text-foreground hover:bg-accent/10 hover:text-accent'
                          }`}
                        >
                          {config.label}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {viewMode === 'day' ? (
          <>
          <div className="md:hidden space-y-3 p-4">
            {appointments.length === 0 ? (
              <Card className="p-6 text-center backdrop-blur-xl bg-card/60">
                <p className="text-muted-foreground">{t('report.noAppointments')}</p>
              </Card>
            ) : (
              appointments.map((appointment) => {
                const status = (statusConfig as any)[appointment.status]
                const source = (sourceConfig as any)[appointment.source]
                const SourceIcon = source.icon
                return (
                  <Card
                    key={appointment.id}
                    className="p-4 backdrop-blur-xl bg-card/60 hover:bg-card/80 transition-all"
                    onClick={() => openAppointment(appointment)}
                  >
                    <div className="flex items-start gap-3">
                      <SourceIcon className={cn("w-4 h-4 mt-0.5", source.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground truncate">{appointment.client}</h3>
                          <Badge className={cn("text-xs font-medium border", status.color)}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-semibold text-foreground">
                              {appointment.startTime || appointment.time}
                              {appointment.endTime ? `–${appointment.endTime}` : ''}
                            </span>
                          </div>
                          <div className="truncate">{appointment.service}</div>
                          <div className="text-xs">• {appointment.master}</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                )
              })
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
              const slotHour = parseInt(time.split(':')[0])
              const slotMin = parseInt(time.split(':')[1])
              const slotMinutes = slotHour * 60 + slotMin
              
              const currentToday = getToday()
              // Если selectedDate равна сегодняшней дате, используем актуальную сегодняшнюю дату для сравнения
              const dateToCompare = selectedDate === currentToday ? currentToday : selectedDate
              
              const allSlotAppointments = appointments
                .map((apt: Appointment, idx: number) => ({ ...apt, originalIndex: idx }))
                .filter((apt: Appointment & { originalIndex: number }) => {
                  if ((apt as any).status === 'cancelled') {
                    return false
                  }
                  const aptDate = apt.date ? apt.date.split('T')[0] : ''
                  if (aptDate !== dateToCompare) {
                    return false
                  }
                  
                  if (apt.startTime === time) return true
                  
                  const aptHour = parseInt(apt.startTime.split(':')[0])
                  const aptMin = parseInt(apt.startTime.split(':')[1])
                  const aptMinutes = aptHour * 60 + aptMin
                  
                  const nextSlotIndex = index + 1
                  if (nextSlotIndex < AVAILABLE_SLOTS.length) {
                    const nextSlot = AVAILABLE_SLOTS[nextSlotIndex]
                    const nextSlotHour = parseInt(nextSlot.split(':')[0])
                    const nextSlotMin = parseInt(nextSlot.split(':')[1])
                    const nextSlotMinutes = nextSlotHour * 60 + nextSlotMin
                    
                    return aptMinutes >= slotMinutes && aptMinutes < nextSlotMinutes
                  } else {
                    return aptMinutes >= slotMinutes
                  }
                })
                .sort((a: Appointment & { originalIndex: number }, b: Appointment & { originalIndex: number }) => a.originalIndex - b.originalIndex)
              
              const slotAppointments = allSlotAppointments.map(({ originalIndex, ...apt }: Appointment & { originalIndex: number }) => apt)
              
              let slotWidthClass = 'w-[calc(25%-0.5rem)]'
              let minWidthClass = 'min-w-[150px]'
              
              if (slotAppointments.length === 5) {
                slotWidthClass = 'w-[calc(20%-0.5rem)]'
                minWidthClass = 'min-w-[140px]'
              } else if (slotAppointments.length === 6) {
                slotWidthClass = 'w-[calc(16.666%-0.5rem)]'
                minWidthClass = 'min-w-[130px]'
              } else if (slotAppointments.length === 7) {
                slotWidthClass = 'w-[calc(14.285%-0.5rem)]'
                minWidthClass = 'min-w-[180px]'
              } else if (slotAppointments.length === 8) {
                slotWidthClass = 'w-[calc(12.5%-0.5rem)]'
                minWidthClass = 'min-w-[170px]'
              } else if (slotAppointments.length > 8) {
                slotWidthClass = 'w-[180px]'
                minWidthClass = 'min-w-[180px]'
              }
              
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
                        if (e.target === e.currentTarget && slotAppointments.length === 0) {
                        setNewAppointmentForm(prev => ({
                          ...prev,
                          date: selectedDate,
                          startTime: time,
                          endTime: ''
                        }))
                        setCalendarDate(new Date(selectedDate + 'T00:00:00'))
                        setShowNewAppointmentModal(true)
                      }
                    }}
                  >
                    {slotAppointments.map((appointment: Appointment) => (
                        <button
                          key={appointment.id}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleAppointmentClick(appointment)
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
                              <div className="flex-1 flex flex-col justify-center items-center pr-2 min-w-0">
                                <h4 className="font-bold text-sm text-foreground mb-2 text-center leading-tight w-full truncate">
                                  {appointment.client}
                                </h4>
                                <p className="text-xs font-bold text-muted-foreground mb-1.5 text-center leading-tight w-full truncate">
                                  {appointment.service}
                                </p>
                                <p className="text-xs font-bold text-muted-foreground/90 text-center leading-tight w-full truncate">
                                  {appointment.master}
                                </p>
                      </div>
                              {appointment.price !== undefined && appointment.price > 0 && (
                                <div className="flex flex-col items-center justify-center border-l border-r border-border/30 px-2 flex-shrink-0">
                                  <p className="text-xs font-bold text-emerald-400 bg-gray-800 rounded px-2 py-1 whitespace-nowrap">
                                    {appointment.price} MDL
                                  </p>
                                </div>
                              )}
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
                      
                    {Array.from({ length: emptySlotsCount }).map((_, emptyIdx) => (
                        <button
                        key={`empty-${emptyIdx}`}
                          onClick={(e) => {
                            e.stopPropagation()
                          setNewAppointmentForm(prev => ({
                            ...prev,
                            date: selectedDate,
                            startTime: time,
                            endTime: ''
                          }))
                          setCalendarDate(new Date(selectedDate + 'T00:00:00'))
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
          </>
        ) : (
          <>
          <div className="md:hidden space-y-4 p-4">
            {getWeekDays().map((dayDate) => {
              const dayDateObj = new Date(dayDate + 'T00:00:00')
              const dayAppointments = loadAppointments(dayDate)
              return (
                <Card key={dayDate} className="p-4 backdrop-blur-xl bg-card/60">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-foreground">
                      {dayDateObj.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short',
                      })}
                    </div>
                    <Badge className="text-xs font-medium border bg-primary/15 text-primary border-primary/30">
                      {dayAppointments.length}
                    </Badge>
                  </div>
                  {dayAppointments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t('report.noAppointments')}</p>
                  ) : (
                    <div className="space-y-2">
                      {dayAppointments.map((appointment) => {
                        const status = (statusConfig as any)[appointment.status]
                        const source = (sourceConfig as any)[appointment.source]
                        const SourceIcon = source.icon
                        return (
                          <button
                            key={appointment.id}
                            type="button"
                            onClick={() => openAppointment(appointment)}
                            className="w-full text-left rounded-lg border border-border/50 bg-background/40 px-3 py-2 hover:bg-background/60 transition"
                          >
                            <div className="flex items-start gap-3">
                              <SourceIcon className={cn("w-4 h-4 mt-0.5", source.color)} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-foreground truncate">{appointment.client}</span>
                                  <Badge className={cn("text-[10px] font-medium border", status.color)}>
                                    {status.label}
                                  </Badge>
                                </div>
                                <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-2">
                                  <span className="font-mono text-foreground">{appointment.startTime || appointment.time}</span>
                                  <span className="truncate">{appointment.service}</span>
                                  <span>• {appointment.master}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
          <div className="hidden md:grid grid-cols-[80px_repeat(7,1fr)_80px] divide-x divide-border">
            <div className="divide-y divide-border/50 bg-muted/20 sticky left-0 z-10 border-r border-border">
              <div className="h-12 flex items-center justify-center border-b border-border bg-muted/30">
                <span className="text-xs font-semibold text-muted-foreground">{t('calendar.time')}</span>
              </div>
              {AVAILABLE_SLOTS.map(time => (
                <div key={time} className="h-24 flex items-center justify-center text-xs text-muted-foreground font-semibold bg-muted/20">
                  {time}
                </div>
              ))}
            </div>
            {getWeekDays().map((dayDate) => {
              const dayDateObj = new Date(dayDate + 'T00:00:00')
              const isToday = dayDate === getToday()
              
              return (
                <div key={dayDate} className="divide-y divide-border/50">
                  <div className="h-12 flex flex-col items-center justify-center border-b border-border bg-muted/20">
                    <div className={cn("text-xs font-medium", isToday && "text-primary font-bold")}>
                      {dayDateObj.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short' })}
                    </div>
                    <div className={cn("text-sm font-semibold", isToday && "text-primary")}>
                      {dayDateObj.getDate()}
                    </div>
                  </div>
                  {AVAILABLE_SLOTS.map((time) => {
                    const slotAppointments = getAppointmentsForDateAndTime(dayDate, time)
                    const count = slotAppointments.length
                    const isExpanded = expandedSlot?.date === dayDate && expandedSlot?.time === time
                    
                    return (
                      <div
                        key={`${dayDate}-${time}`}
                        className="h-24 relative group hover:bg-muted/5 transition-colors"
                      >
                        <div className="absolute inset-0 p-2 flex flex-col items-center justify-center gap-2">
                          {count > 0 ? (
                            <>
                              <div className="text-2xl font-bold text-foreground">{count}</div>
                              <button
                                onClick={() => {
                                  if (isExpanded) {
                                    setExpandedSlot(null)
                                  } else {
                                    setExpandedSlot({ date: dayDate, time })
                                  }
                                }}
                                className="text-xs px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                              >
                                {t('calendar.viewAppointments')}
                              </button>
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground/30">-</div>
                          )}
                        </div>
                        
                      </div>
                    )
                  })}
                </div>
              )
            })}
            <div className="divide-y divide-border/50 bg-muted/20 sticky right-0 z-10 border-l border-border">
              <div className="h-12 flex items-center justify-center border-b border-border bg-muted/30">
                <span className="text-xs font-semibold text-muted-foreground">{t('calendar.time')}</span>
              </div>
              {AVAILABLE_SLOTS.map(time => (
                <div key={time} className="h-24 flex items-center justify-center text-xs text-muted-foreground font-semibold bg-muted/20">
                  {time}
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-[80px_repeat(7,1fr)_80px] divide-x divide-border border-t border-border">
            <div className="h-12 flex items-center justify-center bg-muted/20 border-r border-border">
              <span className="text-xs font-semibold text-muted-foreground">{t('calendar.time')}</span>
            </div>
            {getWeekDays().map((dayDate) => {
              const dayDateObj = new Date(dayDate + 'T00:00:00')
              const isToday = dayDate === getToday()
              
              return (
                <div key={dayDate} className="h-12 flex flex-col items-center justify-center bg-muted/20">
                  <div className={cn("text-xs font-medium", isToday && "text-primary font-bold")}>
                    {dayDateObj.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short' })}
                  </div>
                  <div className={cn("text-sm font-semibold", isToday && "text-primary")}>
                    {dayDateObj.getDate()}
                  </div>
                </div>
              )
            })}
            <div className="h-12 flex items-center justify-center bg-muted/20 border-l border-border">
              <span className="text-xs font-semibold text-muted-foreground">{t('calendar.time')}</span>
            </div>
          </div>
          </>
        )}
      </Card>

      {/* Модальное окно с деталями записи */}
          {selectedAppointmentData && (selectedAppointmentData as any).status !== 'cancelled' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setSelectedAppointment(null)
            setSelectedAppointmentData(null)
          }}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />
          <Card 
            className="w-full max-w-md backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative mx-auto max-h-[85vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 max-h-[85vh] overflow-y-auto">
              <div className="absolute top-4 right-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSelectedAppointment(null)
                    setSelectedAppointmentData(null)
                  }}
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
                  title={t('appointments.clientHistory')}
                >
                  <History className="w-4 h-4" />
                </Button>
              </div>
              <h3 className="text-xl font-bold mb-6 pr-20">{t('calendar.appointmentDetails')}</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.client')}</h4>
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
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.service')}</h4>
                    <p className="text-sm">{selectedAppointmentData.service}</p>
                    {selectedAppointmentData.price !== undefined && selectedAppointmentData.price > 0 && (
                      <p className="text-sm font-bold text-foreground mt-1">
                        {selectedAppointmentData.price} MDL
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.master')}</h4>
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
                    <Badge className={cn("text-xs font-medium border", (statusConfig as any)[selectedAppointmentData.status]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
                      {(statusConfig as any)[selectedAppointmentData.status]?.label || selectedAppointmentData.status}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.source')}</h4>
                    <div className="flex items-center gap-2">
                      {(() => {
                        const source = (sourceConfig as any)[selectedAppointmentData.source]
                        const SourceIcon = source?.icon
                        return SourceIcon ? <SourceIcon className={cn("w-4 h-4", source.color)} /> : null
                      })()}
                      <span className="text-sm">{(sourceConfig as any)[selectedAppointmentData.source]?.label || selectedAppointmentData.source}</span>
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

      {/* Множественные модальные окна для записей из недельного вида */}
      {expandedSlot && (() => {
        const slotAppointments = getAppointmentsForDateAndTime(expandedSlot.date, expandedSlot.time)
        if (slotAppointments.length === 0) return null
        
        // Если выбрана конкретная карточка для работы, показываем только её
        if (focusedAppointmentId) {
          const focusedAppointment = slotAppointments.find((apt: any) => apt.id === focusedAppointmentId)
          if (!focusedAppointment) {
            setFocusedAppointmentId(null)
            return null
          }
          
          return (
            <div 
              className="fixed inset-0 z-[60] flex items-center justify-center p-4"
              onClick={() => {
                setExpandedSlot(null)
                setFocusedAppointmentId(null)
              }}
            >
              <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm"
                style={{ zIndex: -1 }}
              />
              <Card 
                className="w-full max-w-md backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative z-[61] animate-in fade-in slide-in-from-bottom-4 duration-300 mx-auto max-h-[85vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 max-h-[85vh] overflow-y-auto">
                  <div className="absolute top-4 right-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setExpandedSlot(null)
                        setFocusedAppointmentId(null)
                        setSelectedAppointment(null)
                        setSelectedAppointmentData(null)
                      }}
                      className="h-8 w-8"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute top-4 right-14">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShowHistory(focusedAppointment.client)
                      }}
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
                      <p className="text-base font-bold">{focusedAppointment.client}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{focusedAppointment.phone}</span>
                      </div>
                      {focusedAppointment.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{focusedAppointment.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('home.service')}</h4>
                        <p className="text-sm">{focusedAppointment.service}</p>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('home.master')}</h4>
                        <p className="text-sm">{focusedAppointment.master}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.date')} {t('common.and')} {t('calendar.time')}</h4>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <p className="text-sm">
                          {new Date(focusedAppointment.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}, {focusedAppointment.startTime} - {focusedAppointment.endTime}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.status')}</h4>
                        <Badge className={cn("text-xs font-medium border", (statusConfig as any)[focusedAppointment.status]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
                          {(statusConfig as any)[focusedAppointment.status]?.label || focusedAppointment.status}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.source')}</h4>
                        <div className="flex items-center gap-2">
                          {(() => {
                            const source = (sourceConfig as any)[focusedAppointment.source]
                            const SourceIcon = source?.icon
                            return SourceIcon ? <SourceIcon className={cn("w-4 h-4", source.color)} /> : null
                          })()}
                          <span className="text-sm">{(sourceConfig as any)[focusedAppointment.source]?.label || focusedAppointment.source}</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t border-border/50">
                      <div className="space-y-2">
                        <Button
                          variant="outline"
                          className="w-full text-primary border-primary/30 hover:bg-primary/20 hover:text-primary"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenEditAppointmentModal(focusedAppointment.id)
                          }}
                          size="sm"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          {t('home.editAppointment')}
                        </Button>
                        {focusedAppointment.status === 'pending' && (
                          <>
                            <Button
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                              onClick={() => {
                                handleStatusChange(focusedAppointment.id, 'confirmed')
                              }}
                              size="sm"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t('home.confirmAppointment')}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(focusedAppointment.id, 'no-show')
                              }}
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {t('home.markAsNoShow')}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAppointment(focusedAppointment.id)
                              }}
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('home.deleteAppointment')}
                            </Button>
                          </>
                        )}
                        {focusedAppointment.status === 'confirmed' && (
                          <>
                            <Button
                              variant="outline"
                              className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
                              onClick={() => {
                                handleStatusChange(focusedAppointment.id, 'pending')
                              }}
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {t('notifications.cancelConfirmation')}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStatusChange(focusedAppointment.id, 'no-show')
                              }}
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {t('home.markAsNoShow')}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAppointment(focusedAppointment.id)
                              }}
                              size="sm"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              {t('home.deleteAppointment')}
                            </Button>
                          </>
                        )}
                        {focusedAppointment.status === 'no-show' && (
                          <>
                            <Button
                              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                              onClick={() => {
                                handleStatusChange(focusedAppointment.id, 'confirmed')
                              }}
                              size="sm"
                            >
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              {t('home.confirmAppointment')}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
                              onClick={() => {
                                handleStatusChange(focusedAppointment.id, 'pending')
                              }}
                              size="sm"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              {t('home.returnToPending')}
                            </Button>
                            <Button
                              variant="outline"
                              className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteAppointment(focusedAppointment.id)
                              }}
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
          )
        }
        
        // Определяем размер карточек в зависимости от количества
        const cardCount = slotAppointments.length
        const cardPadding = cardCount > 4 ? 'p-4' : 'p-6'
        const textSize = cardCount > 6 ? 'text-sm' : 'text-base'
        
        return (
          <div 
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            onClick={() => {
              setExpandedSlot(null)
              setFocusedAppointmentId(null)
            }}
          >
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
              style={{ zIndex: -1 }}
            />
            <div 
              className="relative z-[61] w-full max-w-6xl max-h-[90vh] overflow-y-auto overflow-x-hidden p-4 scrollbar-hide flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`grid gap-4 mx-auto ${
                cardCount === 1 ? 'grid-cols-1 max-w-md' :
                cardCount === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-2xl' :
                cardCount === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-4xl' :
                cardCount === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4 max-w-5xl' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-6xl'
              }`}>
              {slotAppointments.map((appointment: any, index: number) => (
                <Card
                  key={appointment.id}
                  className={`w-full backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative animate-in fade-in slide-in-from-bottom-4 duration-300 max-h-[85vh] overflow-hidden`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className={`${cardPadding} max-h-[85vh] overflow-y-auto`}>
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setExpandedSlot(null)
                          setFocusedAppointmentId(null)
                        }}
                        className="h-8 w-8"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="absolute top-4 right-14">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShowHistory(appointment.client)
                        }}
                        className="h-8 w-8"
                        title={t('common.clientHistory')}
                      >
                        <History className="w-4 h-4" />
                      </Button>
                    </div>
                    <h3 className={`${cardCount > 6 ? 'text-lg' : 'text-xl'} font-bold mb-6 pr-20`}>{t('calendar.appointmentDetails')}</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('home.client')}</h4>
                        <p className={`${textSize} font-bold`}>{appointment.client}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{appointment.phone}</span>
                        </div>
                        {appointment.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{appointment.email}</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('home.service')}</h4>
                          <p className="text-sm">{appointment.service}</p>
                          {appointment.price !== undefined && appointment.price > 0 && (
                            <p className="text-sm font-bold text-foreground mt-1">
                              {appointment.price} MDL
                            </p>
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('home.master')}</h4>
                          <p className="text-sm">{appointment.master}</p>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.date')} {t('common.and')} {t('calendar.time')}</h4>
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm">
                            {new Date(appointment.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}, {appointment.startTime} - {appointment.endTime}
                          </p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.status')}</h4>
                          <Badge className={cn("text-xs font-medium border", (statusConfig as any)[appointment.status]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
                            {(statusConfig as any)[appointment.status]?.label || appointment.status}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.source')}</h4>
                          <div className="flex items-center gap-2">
                            {(() => {
                              const source = (sourceConfig as any)[appointment.source]
                              const SourceIcon = source?.icon
                              return SourceIcon ? <SourceIcon className={cn("w-4 h-4", source.color)} /> : null
                            })()}
                            <span className="text-sm">{(sourceConfig as any)[appointment.source]?.label || appointment.source}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border/50">
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            className="w-full text-primary border-primary/30 hover:bg-primary/20 hover:text-primary"
                            onClick={() => {
                              if (slotAppointments.length === 1) {
                                handleOpenEditAppointmentModal(appointment.id)
                              } else {
                                setFocusedAppointmentId(appointment.id)
                              }
                            }}
                            size="sm"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            {t('home.editAppointment')}
                          </Button>
                          {appointment.status === 'pending' && (
                            <>
                              <Button
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleStatusChange(appointment.id, 'confirmed')
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
                                size="sm"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {t('home.confirmAppointment')}
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleStatusChange(appointment.id, 'no-show')
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {t('home.markAsNoShow')}
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleDeleteAppointment(appointment.id)
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('home.deleteAppointment')}
                              </Button>
                            </>
                          )}
                          {appointment.status === 'confirmed' && (
                            <>
                              <Button
                                variant="outline"
                                className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleStatusChange(appointment.id, 'pending')
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {t('notifications.cancelConfirmation')}
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleStatusChange(appointment.id, 'no-show')
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {t('home.markAsNoShow')}
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleDeleteAppointment(appointment.id)
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
                                size="sm"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {t('home.deleteAppointment')}
                              </Button>
                            </>
                          )}
                          {appointment.status === 'no-show' && (
                            <>
                              <Button
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleStatusChange(appointment.id, 'confirmed')
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
                                size="sm"
                              >
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                {t('home.confirmAppointment')}
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleStatusChange(appointment.id, 'pending')
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
                                size="sm"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                {t('home.returnToPending')}
                              </Button>
                              <Button
                                variant="outline"
                                className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                                onClick={() => {
                                  if (slotAppointments.length === 1) {
                                    handleDeleteAppointment(appointment.id)
                                  } else {
                                    setFocusedAppointmentId(appointment.id)
                                  }
                                }}
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
              ))}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Модальное окно истории клиента */}
      {showClientHistory && historyClient && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={() => setShowClientHistory(false)}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />
          <Card 
            className="w-full max-w-2xl backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative max-h-[90vh] overflow-hidden flex flex-col mx-auto"
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
              <h3 className="text-xl font-bold mb-6 pr-12">{t('calendar.visitHistory')}: {historyClient}</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 pb-6 scrollbar-hide">
              {historyClient && getClientHistory(historyClient).length > 0 ? (
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
                        <Badge className={cn("text-xs font-medium border", (statusConfig as any)[visit.status]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
                          {(statusConfig as any)[visit.status]?.label || visit.status}
                        </Badge>
                      </div>
                    </Card>
                  ))}
          </div>
        ) : (
                <div className="text-center py-12">
                  <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">{t('calendar.empty')}</p>
                </div>
              )}
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
                  <h3 className="font-semibold text-lg">{t('calendar.selectDate')}</h3>
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
                  {(() => {
                    const locale = language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US'
                    const days = []
                    for (let i = 1; i <= 7; i++) {
                      const date = new Date(2024, 0, i) // Январь 2024, дни 1-7 это понедельник-воскресенье
                      days.push(date.toLocaleDateString(locale, { weekday: 'short' }))
                    }
                    return days.map((day) => (
                      <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                        {day}
                      </div>
                    ))
                  })()}
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
                            // Если открыто модальное окно редактирования, обновляем дату в форме
                            if (showEditAppointmentModal || showNewAppointmentModal) {
                              setNewAppointmentForm(prev => ({ ...prev, date: dateStr }))
                            } else {
                              // Иначе обновляем выбранную дату для просмотра
                              setSelectedDate(dateStr)
                            }
                            setIsDatePickerOpen(false)
                          }
                        }}
                        disabled={isPast}
                        className={cn(
                          "h-9 rounded-lg text-sm transition-all cursor-pointer",
                          isPast && "opacity-30 cursor-not-allowed",
                          (showEditAppointmentModal || showNewAppointmentModal) 
                            ? isSelectedDate(date, newAppointmentForm.date)
                              ? 'bg-accent text-accent-foreground font-semibold'
                              : isToday(date)
                              ? 'bg-accent/20 text-accent font-semibold hover:bg-accent/30'
                              : 'text-foreground hover:bg-accent/10 hover:text-accent'
                            : isSelectedDate(date, selectedDate)
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

      {/* Модальное окно редактирования записи */}
      {showEditAppointmentModal && editingAppointmentId && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowEditAppointmentModal(false)}
          />
          <Card 
            className="relative z-[101] w-full max-w-lg backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide mx-auto"
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
                        {newAppointmentForm.date ? new Date(newAppointmentForm.date + 'T00:00:00').toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : t('calendar.selectDate')}
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
                    {t('home.email')}
                  </label>
                  <Input
                    value={newAppointmentForm.email || ''}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('common.enterEmail')}
                    type="email"
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
                        {newAppointmentForm.service || t('calendar.selectService')}
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
                        {newAppointmentForm.master || t('calendar.selectMaster')}
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
                        onFocus={() => setIsStartTimeDropdownOpen(true)}
                        placeholder={t('common.enterTime')}
                        className="h-12 bg-card/40 backdrop-blur-sm border-border/50 pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {isStartTimeDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                        <div className="py-1">
                          {AVAILABLE_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleStartTimeChange(slot)}
                              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 transition-colors"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Время окончания */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.endTime')} *
                  </label>
                  <Input
                    value={newAppointmentForm.endTime || ''}
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
                  Сохранить изменения
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Модальное окно создания новой записи */}
      {showNewAppointmentModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowNewAppointmentModal(false)}
          />
          <Card 
            className="relative z-[101] w-full max-w-lg backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide mx-auto"
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
              
              <h3 className="text-xl font-bold mb-6 pr-12">{t('appointments.newAppointment')}</h3>
              
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
                        {newAppointmentForm.date ? new Date(newAppointmentForm.date + 'T00:00:00').toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : t('calendar.selectDate')}
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
                    {t('home.email')}
                  </label>
                  <Input
                    value={newAppointmentForm.email || ''}
                    onChange={(e) => setNewAppointmentForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder={t('common.enterEmail')}
                    type="email"
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
                        {newAppointmentForm.service || t('calendar.selectService')}
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
                        {newAppointmentForm.master || t('calendar.selectMaster')}
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
                        onFocus={() => setIsStartTimeDropdownOpen(true)}
                        placeholder={t('common.enterTime')}
                        className="h-12 bg-card/40 backdrop-blur-sm border-border/50 pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {isStartTimeDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                        <div className="py-1">
                          {AVAILABLE_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleStartTimeChange(slot)}
                              className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 transition-colors"
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Время окончания */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.endTime')} *
                  </label>
                  <Input
                    value={newAppointmentForm.endTime || ''}
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
                  onClick={handleCreateAppointment}
                  size="lg"
                >
                  {t('home.createAppointment')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  )
}
