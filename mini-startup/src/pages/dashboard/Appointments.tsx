import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { 
  CheckCircle2, 
  XCircle, 
  Search,
  Plus,
  Calendar as CalendarIcon,
  ChevronDown,
  X,
  Globe,
  User,
  RotateCcw,
  Phone,
  Mail,
  History,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Trash2,
  Clock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { AVAILABLE_SLOTS } from '@/lib/mock-data'
import { cn, matchesSearchQuery } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface Appointment {
  id: string
  client: string
  phone: string
  email?: string
  service: string
  staff: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'no-show' | 'completed'
  source: 'online' | 'admin' | 'repeat'
}

const mockAppointments: Appointment[] = [
  { id: '1', client: 'Сара Уильямс', phone: '+373 123 456', email: 'sara@example.com', service: 'Стрижка и укладка', staff: 'Алекс Ривера', date: '2025-12-29', time: '09:00', status: 'confirmed', source: 'online' },
  { id: '2', client: 'Джеймс Смит', phone: '+373 234 567', service: 'Стрижка бороды', staff: 'Майк Джонсон', date: '2025-12-29', time: '10:30', status: 'pending', source: 'admin' },
  { id: '3', client: 'Эмили Браун', phone: '+373 345 678', email: 'emily@example.com', service: 'Окрашивание', staff: 'Сара Чен', date: '2025-12-29', time: '13:00', status: 'confirmed', source: 'repeat' },
  { id: '5', client: 'Анна Петрова', phone: '+373 567 890', service: 'Маникюр', staff: 'Сара Чен', date: '2025-12-30', time: '11:00', status: 'pending', source: 'admin' },
  { id: '6', client: 'Иван Иванов', phone: '+373 678 901', service: 'Стрижка', staff: 'Майк Джонсон', date: '2025-12-30', time: '14:30', status: 'confirmed', source: 'repeat' },
]

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

export default function Appointments() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t, language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState('')
  
  const getMastersList = (): string[] => {
    return [t('appointments.allMasters'), ...loadMasters()]
  }

  const statusOptions = [
    { value: 'all', label: t('appointments.allStatuses') },
    { value: 'pending', label: t('status.pending') },
    { value: 'confirmed', label: t('status.confirmed') },
    { value: 'no-show', label: t('status.noShow') },
  ]

  const dateOptions = [
    { value: 'today', label: t('common.today') },
    { value: 'upcoming', label: t('appointments.upcoming') },
  ]

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
  const [selectedDate, setSelectedDate] = useState('today')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [startDateCalendar, setStartDateCalendar] = useState(new Date())
  const [endDateCalendar, setEndDateCalendar] = useState(new Date())
  const [isStartDateOpen, setIsStartDateOpen] = useState(false)
  const [isEndDateOpen, setIsEndDateOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedMaster, setSelectedMaster] = useState(t('appointments.allMasters'))
  const [isDateOpen, setIsDateOpen] = useState(false)
  const [isRangeOpen, setIsRangeOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isMasterOpen, setIsMasterOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showClientHistory, setShowClientHistory] = useState(false)
  const [historyClient, setHistoryClient] = useState<string | null>(null)
  const [showEditAppointmentModal, setShowEditAppointmentModal] = useState(false)
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null)
  const [showNewAppointmentModal, setShowNewAppointmentModal] = useState(false)
  const [newAppointmentForm, setNewAppointmentForm] = useState({
    client: '',
    phone: '',
    email: '',
    service: '',
    staff: '',
    date: '',
    startTime: '',
    endTime: '',
  })
  const [isNewServiceOpen, setIsNewServiceOpen] = useState(false)
  const [isNewMasterOpen, setIsNewMasterOpen] = useState(false)
  const [isNewStartTimeDropdownOpen, setIsNewStartTimeDropdownOpen] = useState(false)
  const [isNewDatePickerOpen, setIsNewDatePickerOpen] = useState(false)
  const [newCalendarDate, setNewCalendarDate] = useState(new Date())
  const [editForm, setEditForm] = useState({
    client: '',
    phone: '',
    email: '',
    service: '',
    staff: '',
    date: '',
    startTime: '',
    endTime: '',
  })
  const [isEditServiceOpen, setIsEditServiceOpen] = useState(false)
  const [isEditMasterOpen, setIsEditMasterOpen] = useState(false)
  const [isEditStartTimeDropdownOpen, setIsEditStartTimeDropdownOpen] = useState(false)
  const [isEditDatePickerOpen, setIsEditDatePickerOpen] = useState(false)
  const [editCalendarDate, setEditCalendarDate] = useState(new Date())
  
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

  const [services, setServices] = useState<string[]>(loadServices())
  const mastersList = ['Алекс Ривера', 'Сара Чен', 'Майк Джонсон']
  
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
  
  const editServiceDropdownRef = useRef<HTMLDivElement>(null)
  const editMasterDropdownRef = useRef<HTMLDivElement>(null)
  const editStartTimeDropdownRef = useRef<HTMLDivElement>(null)
  const editStartTimeInputRef = useRef<HTMLInputElement>(null)
  const editDatePickerRef = useRef<HTMLDivElement>(null)
  
  const newServiceDropdownRef = useRef<HTMLDivElement>(null)
  const newMasterDropdownRef = useRef<HTMLDivElement>(null)
  const newStartTimeDropdownRef = useRef<HTMLDivElement>(null)
  const newStartTimeInputRef = useRef<HTMLInputElement>(null)
  const newDatePickerRef = useRef<HTMLDivElement>(null)
  
  const dateDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const masterDropdownRef = useRef<HTMLDivElement>(null)
  const startDateRef = useRef<HTMLDivElement>(null)
  const endDateRef = useRef<HTMLDivElement>(null)
  const rangeRef = useRef<HTMLDivElement>(null)

  // Загрузка записей из localStorage
  const loadAppointments = (): Appointment[] => {
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Удаляем все записи со статусом 'cancelled' и сохраняем обратно в localStorage
        const filtered = parsed.filter((apt: any) => apt.status !== 'cancelled')
        if (filtered.length !== parsed.length) {
          localStorage.setItem('appointments', JSON.stringify(filtered))
        }
        // Преобразуем формат из Home.tsx (master, startTime) в формат Appointments.tsx (staff, time)
        return filtered
          .map((apt: any) => ({
            id: apt.id,
            client: apt.client,
            phone: apt.phone,
            email: apt.email,
            service: apt.service,
            staff: apt.master || apt.staff, // Поддержка обоих форматов
            date: apt.date,
            time: apt.startTime || apt.time, // Поддержка обоих форматов
            status: apt.status,
            source: apt.source || 'admin',
          }))
      } catch (e) {
        console.error('Ошибка загрузки записей из localStorage:', e)
      }
    }
    // Если нет данных в localStorage, возвращаем моковые данные
    return mockAppointments
  }

  const [appointments, setAppointments] = useState<Appointment[]>(loadAppointments)

  // Обновляем записи при изменении localStorage
  useEffect(() => {
    const updateAppointments = () => {
      setAppointments(loadAppointments())
    }
    
    // Проверяем при монтировании
    updateAppointments()
    
    // Слушаем изменения в localStorage (из других вкладок)
    window.addEventListener('storage', updateAppointments)
    
    // Также проверяем периодически (для обновления из той же вкладки)
    const interval = setInterval(updateAppointments, 500)
    
    return () => {
      window.removeEventListener('storage', updateAppointments)
      clearInterval(interval)
    }
  }, [])

  // Обновляем selectedMaster при изменении языка
  useEffect(() => {
    // Если выбран "Все мастера", обновляем перевод
    if (selectedMaster === t('appointments.allMasters') || !selectedMaster) {
      setSelectedMaster(t('appointments.allMasters'))
    }
  }, [language, t])

  // Открываем запись при переходе из уведомлений или устанавливаем фильтр из главной страницы
  useEffect(() => {
    const state = (location as any).state as { openAppointmentId?: string; filterStatus?: string; filterDate?: string } | null | undefined
    if (state?.openAppointmentId) {
      const appointment = appointments.find(apt => apt.id === state.openAppointmentId)
      if (appointment) {
        setSelectedAppointment(appointment)
      }
      // Очищаем состояние после использования
      navigate(location.pathname, { replace: true, state: {} })
    }
    if (state?.filterStatus) {
      setSelectedStatus(state.filterStatus)
    }
    if (state?.filterDate) {
      setSelectedDate(state.filterDate)
    }
    // Очищаем состояние после использования
    if (state?.filterStatus || state?.filterDate) {
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location, navigate])

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dateDropdownRef.current && !dateDropdownRef.current.contains(event.target as Node)) {
        setIsDateOpen(false)
      }
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false)
      }
      if (masterDropdownRef.current && !masterDropdownRef.current.contains(event.target as Node)) {
        setIsMasterOpen(false)
      }
      if (startDateRef.current && !startDateRef.current.contains(event.target as Node)) {
        setIsStartDateOpen(false)
      }
      if (endDateRef.current && !endDateRef.current.contains(event.target as Node)) {
        setIsEndDateOpen(false)
      }
      if (editServiceDropdownRef.current && !editServiceDropdownRef.current.contains(event.target as Node)) {
        setIsEditServiceOpen(false)
      }
      if (editMasterDropdownRef.current && !editMasterDropdownRef.current.contains(event.target as Node)) {
        setIsEditMasterOpen(false)
      }
      if (editStartTimeDropdownRef.current && !editStartTimeDropdownRef.current.contains(event.target as Node)) {
        setIsEditStartTimeDropdownOpen(false)
      }
      if (newServiceDropdownRef.current && !newServiceDropdownRef.current.contains(event.target as Node)) {
        setIsNewServiceOpen(false)
      }
      if (newMasterDropdownRef.current && !newMasterDropdownRef.current.contains(event.target as Node)) {
        setIsNewMasterOpen(false)
      }
      if (newStartTimeDropdownRef.current && !newStartTimeDropdownRef.current.contains(event.target as Node)) {
        setIsNewStartTimeDropdownOpen(false)
      }
      if (rangeRef.current && !rangeRef.current.contains(event.target as Node)) {
        // Не закрываем диапазон автоматически, только если обе даты выбраны
        if (dateRange.start && dateRange.end) {
          // Можно закрыть, если обе даты выбраны
        }
      }
      if (editServiceDropdownRef.current && !editServiceDropdownRef.current.contains(event.target as Node)) {
        setIsEditServiceOpen(false)
      }
      if (editMasterDropdownRef.current && !editMasterDropdownRef.current.contains(event.target as Node)) {
        setIsEditMasterOpen(false)
      }
      if (editStartTimeDropdownRef.current && !editStartTimeDropdownRef.current.contains(event.target as Node)) {
        setIsEditStartTimeDropdownOpen(false)
      }
      if (editDatePickerRef.current && !editDatePickerRef.current.contains(event.target as Node)) {
        setIsEditDatePickerOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [dateRange])

  const getFilteredAppointments = () => {
    let filtered = appointments

    if (searchQuery) {
      filtered = filtered.filter(apt => 
        matchesSearchQuery({ client: apt.client, phone: apt.phone }, searchQuery)
      )
    }

    // Функция для получения сегодняшней даты в формате YYYY-MM-DD
    const getToday = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    
    const today = getToday()
    
    // Если выбран диапазон дат, используем его
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(apt => {
        const aptDate = apt.date ? apt.date.split('T')[0] : ''
        return aptDate >= dateRange.start && aptDate <= dateRange.end
      })
    } else if (selectedDate === 'today') {
      filtered = filtered.filter(apt => {
        const aptDate = apt.date ? apt.date.split('T')[0] : ''
        return aptDate === today
      })
    } else if (selectedDate === 'upcoming') {
      // Ближайшие записи: все будущие записи (дата > сегодня)
      filtered = filtered.filter(apt => {
        const aptDate = apt.date ? apt.date.split('T')[0] : ''
        return aptDate > today && apt.status !== 'completed'
      })
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === selectedStatus)
    }

    if (selectedMaster !== t('appointments.allMasters')) {
      filtered = filtered.filter(apt => apt.staff === selectedMaster)
    }

    return filtered
  }

  const handleStatusChange = (appointmentId: string, newStatus: Appointment['status']) => {
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
    
    setSelectedAppointment(null)
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
      
      setSelectedAppointment(null) // Закрываем модальное окно
    }
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

  const handleShowHistory = (clientName: string) => {
    setHistoryClient(clientName)
    setShowClientHistory(true)
  }

  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return t('appointments.selectDate')
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const formatDateForList = (dateStr: string): string => {
    if (!dateStr) return ''
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' })
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

  const handleEditServiceChange = (service: string) => {
    setEditForm(prev => {
      const newForm = { ...prev, service }
      if (newForm.startTime) {
        newForm.endTime = calculateEndTime(newForm.startTime, service)
      }
      return newForm
    })
    setIsEditServiceOpen(false)
  }

  const handleEditStartTimeChange = (startTime: string) => {
    setEditForm(prev => {
      const newForm = { ...prev, startTime }
      if (newForm.service) {
        newForm.endTime = calculateEndTime(startTime, newForm.service)
      }
      return newForm
    })
    // Не закрываем выпадающий список при вводе вручную, только при выборе из списка
  }

  const handleOpenEditAppointmentModal = (appointmentId: string) => {
    const appointment = appointments.find(apt => apt.id === appointmentId)
    if (!appointment) return
    
    // Заполняем форму данными записи
    setEditForm({
      client: appointment.client,
      phone: appointment.phone,
      email: appointment.email || '',
      service: appointment.service,
      staff: appointment.staff,
      date: appointment.date,
      startTime: appointment.time,
      endTime: '', // Будет рассчитано автоматически
    })
    // Рассчитываем время окончания если есть услуга и время начала
    if (appointment.service && appointment.time) {
      const endTime = calculateEndTime(appointment.time, appointment.service)
      setEditForm(prev => ({ ...prev, endTime }))
    }
    setEditingAppointmentId(appointmentId)
    if (appointment.date) {
      setEditCalendarDate(new Date(appointment.date + 'T00:00:00'))
    }
    setShowEditAppointmentModal(true)
    setSelectedAppointment(null) // Закрываем модальное окно с деталями
  }

  const handleUpdateAppointment = () => {
    if (!editingAppointmentId) return
    
    if (!editForm.client || !editForm.phone || !editForm.service || !editForm.staff || !editForm.startTime) {
      alert('Заполните все обязательные поля')
      return
    }

    // Форматируем время начала
    let formattedStartTime = editForm.startTime
    if (!formattedStartTime.match(/^\d{2}:\d{2}$/)) {
      const parts = formattedStartTime.split(':')
      if (parts.length === 2) {
        formattedStartTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      } else {
        alert('Некорректный формат времени начала')
        return
      }
    }

    // Форматируем время окончания
    let formattedEndTime = editForm.endTime || calculateEndTime(formattedStartTime, editForm.service)
    if (formattedEndTime && !formattedEndTime.match(/^\d{2}:\d{2}$/)) {
      const parts = formattedEndTime.split(':')
      if (parts.length === 2) {
        formattedEndTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      }
    }

    // Обновляем запись в состоянии
    setAppointments(prev => prev.map(apt => 
      apt.id === editingAppointmentId 
        ? {
            ...apt,
            client: editForm.client,
            phone: editForm.phone,
            email: editForm.email || undefined,
            service: editForm.service,
            staff: editForm.staff,
            date: editForm.date,
            time: formattedStartTime,
          }
        : apt
    ))

    // Сохраняем в localStorage
    const stored = localStorage.getItem('appointments')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const updated = parsed.map((apt: any) => 
          apt.id === editingAppointmentId 
            ? {
                ...apt,
                client: editForm.client,
                phone: editForm.phone,
                email: editForm.email || undefined,
                service: editForm.service,
                master: editForm.staff, // Сохраняем как master для совместимости
                staff: editForm.staff,
                date: editForm.date,
                startTime: formattedStartTime,
                endTime: formattedEndTime,
                time: formattedStartTime, // Для совместимости
              }
            : apt
        )
        localStorage.setItem('appointments', JSON.stringify(updated))
      } catch (e) {
        console.error('Ошибка сохранения изменений:', e)
      }
    }

    // Обновляем записи из localStorage для синхронизации
    const updatedAppointments = loadAppointments()
    setAppointments(updatedAppointments)

    // Закрываем модальное окно и сбрасываем форму
    setShowEditAppointmentModal(false)
    setEditingAppointmentId(null)
    setEditForm({
      client: '',
      phone: '',
      email: '',
      service: '',
      staff: '',
      date: '',
      startTime: '',
      endTime: '',
    })
  }

  const handleCreateAppointment = () => {
    if (!newAppointmentForm.client || !newAppointmentForm.phone || !newAppointmentForm.service || !newAppointmentForm.staff || !newAppointmentForm.startTime) {
      alert('Заполните все обязательные поля')
      return
    }

    // Форматируем время начала
    let formattedStartTime = newAppointmentForm.startTime
    if (!formattedStartTime.match(/^\d{2}:\d{2}$/)) {
      const parts = formattedStartTime.split(':')
      if (parts.length === 2) {
        formattedStartTime = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      } else {
        alert('Некорректный формат времени начала')
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

    const getToday = () => {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const appointmentDate = newAppointmentForm.date || getToday()
    const normalizedDate = appointmentDate.split('T')[0]
    const today = getToday()
    const isFutureDate = normalizedDate > today

    const newAppointment = {
      id: Date.now().toString(),
      client: newAppointmentForm.client,
      phone: newAppointmentForm.phone,
      email: newAppointmentForm.email || undefined,
      service: newAppointmentForm.service,
      staff: newAppointmentForm.staff,
      date: normalizedDate,
      time: formattedStartTime,
      status: (isFutureDate ? 'pending' : 'confirmed') as 'pending' | 'confirmed',
      source: 'admin' as const,
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
    
    // Добавляем запись с полями для совместимости
    const appointmentToSave = {
      ...newAppointment,
      master: newAppointmentForm.staff,
      startTime: formattedStartTime,
      endTime: formattedEndTime,
    }
    
    allAppointments.push(appointmentToSave)
    localStorage.setItem('appointments', JSON.stringify(allAppointments))

    // Обновляем записи из localStorage
    const updatedAppointments = loadAppointments()
    setAppointments(updatedAppointments)

    // Закрываем модальное окно и сбрасываем форму
    setShowNewAppointmentModal(false)
    const todayStr = getToday()
    setNewAppointmentForm({
      client: '',
      phone: '',
      email: '',
      service: '',
      staff: '',
      date: todayStr,
      startTime: '',
      endTime: '',
    })
  }

  const handleNewServiceChange = (service: string) => {
    setNewAppointmentForm(prev => {
      const newForm = { ...prev, service }
      if (newForm.startTime) {
        newForm.endTime = calculateEndTime(newForm.startTime, service)
      }
      return newForm
    })
    setIsNewServiceOpen(false)
  }

  const handleNewStartTimeChange = (startTime: string) => {
    setNewAppointmentForm(prev => {
      const newForm = { ...prev, startTime }
      if (newForm.service) {
        newForm.endTime = calculateEndTime(startTime, newForm.service)
      }
      return newForm
    })
    setIsNewStartTimeDropdownOpen(false)
  }

  // Автоматически рассчитываем время окончания при изменении времени начала или услуги
  useEffect(() => {
    if (newAppointmentForm.service && newAppointmentForm.startTime && newAppointmentForm.startTime.match(/^\d{2}:\d{2}$/)) {
      const calculatedEndTime = calculateEndTime(newAppointmentForm.startTime, newAppointmentForm.service)
      if (calculatedEndTime && calculatedEndTime !== newAppointmentForm.endTime) {
        setNewAppointmentForm(prev => ({ ...prev, endTime: calculatedEndTime }))
      }
    }
  }, [newAppointmentForm.service, newAppointmentForm.startTime])

  const filteredAppointments = getFilteredAppointments()

  const CalendarPicker = ({ 
    isOpen, 
    onClose, 
    selectedDateStr, 
    onSelect, 
    calendarDate, 
    onCalendarDateChange 
  }: {
    isOpen: boolean
    onClose: () => void
    selectedDateStr: string
    onSelect: (date: string) => void
    calendarDate: Date
    onCalendarDateChange: (date: Date) => void
  }) => {
    if (!isOpen) return null

    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
          onClick={onClose}
        />
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          onClick={(e) => {
            // Закрываем только при клике вне карточки
            if (e.target === e.currentTarget) {
              onClose()
            }
          }}
        >
          <Card 
            className="w-full max-w-sm backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Выберите дату</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
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
                    onCalendarDateChange(newDate)
                  }}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-semibold text-sm">
                  {calendarDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newDate = new Date(calendarDate)
                    newDate.setMonth(newDate.getMonth() + 1)
                    onCalendarDateChange(newDate)
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
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        onSelect(dateStr)
                        onClose()
                      }}
                      className={cn(
                        "h-9 rounded-lg text-sm transition-all cursor-pointer",
                        isSelected(date, selectedDateStr)
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
    )
  }

  return (
    <div className="space-y-6 relative">
      {/* Поиск */}
      <div className="relative pl-2 mt-2 pr-2">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10 pointer-events-none" />
        <Input
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
          }}
          className="pl-10 bg-card/40 backdrop-blur-sm border-border/50 focus-visible:ring-2 focus-visible:ring-primary/50"
        />
      </div>

      {/* Фильтры и кнопка "Новая запись" */}
      <div className="flex flex-col gap-3 pl-0 sm:flex-row sm:items-center sm:justify-between">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3 w-full sm:w-auto">
          {/* Фильтр по дате - Сегодня */}
          <div ref={dateDropdownRef} className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsDateOpen(!isDateOpen)}
              className={`h-10 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between w-full sm:min-w-[120px] ${
                isDateOpen
                  ? 'border-accent/50 ring-2 ring-accent/30'
                  : 'border-border/50 hover:border-accent/30'
              } text-foreground text-sm`}
            >
              <span>
                {dateOptions.find(opt => opt.value === selectedDate)?.label || t('common.today')}
              </span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isDateOpen ? 'rotate-180' : ''}`} />
            </button>
            {isDateOpen && (
              <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                <div className="py-1">
                  {dateOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedDate(option.value)
                        setIsDateOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedDate === option.value
                          ? 'bg-accent/20 text-accent'
                          : 'text-foreground hover:bg-accent/10 hover:text-accent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Кнопка выбора диапазона дат */}
          <div className="relative flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant={isRangeOpen || (dateRange.start && dateRange.end) ? 'default' : 'outline'}
              onClick={() => setIsRangeOpen(!isRangeOpen)}
              className="h-10 px-4 rounded-lg w-full sm:w-auto"
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              {dateRange.start && dateRange.end
                ? `${new Date(dateRange.start).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { day: 'numeric', month: 'short' })} - ${new Date(dateRange.end).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { day: 'numeric', month: 'short' })}`
                : t('appointments.selectDateRange')}
            </Button>
            {dateRange.start && dateRange.end && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setDateRange({ start: '', end: '' })
                  setIsRangeOpen(false)
                }}
                className="h-10 w-10 text-muted-foreground hover:text-foreground"
                title={t('appointments.resetRange')}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Фильтр по статусу */}
          <div ref={statusDropdownRef} className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className={`h-10 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between w-full sm:min-w-[140px] ${
                isStatusOpen
                  ? 'border-accent/50 ring-2 ring-accent/30'
                  : 'border-border/50 hover:border-accent/30'
              } text-foreground text-sm`}
            >
              <span>{statusOptions.find(opt => opt.value === selectedStatus)?.label || t('appointments.allStatuses')}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`} />
            </button>
            {isStatusOpen && (
              <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                <div className="py-1">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedStatus(option.value)
                        setIsStatusOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedStatus === option.value
                          ? 'bg-accent/20 text-accent'
                          : 'text-foreground hover:bg-accent/10 hover:text-accent'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Фильтр по мастеру */}
          <div ref={masterDropdownRef} className="relative w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsMasterOpen(!isMasterOpen)}
              className={`h-10 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between w-full sm:min-w-[160px] ${
                isMasterOpen
                  ? 'border-accent/50 ring-2 ring-accent/30'
                  : 'border-border/50 hover:border-accent/30'
              } text-foreground text-sm`}
            >
              <span>{selectedMaster}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isMasterOpen ? 'rotate-180' : ''}`} />
            </button>
            {isMasterOpen && (
              <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                <div className="py-1">
                          {getMastersList().map((master) => (
                    <button
                      key={master}
                      type="button"
                      onClick={() => {
                        setSelectedMaster(master)
                        setIsMasterOpen(false)
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                        selectedMaster === master
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
        </div>

        {/* Кнопка "Новая запись" */}
        <Button 
          className="rounded-full bg-primary hover:bg-primary/90 h-10 w-full sm:w-auto"
          onClick={() => {
            const getToday = () => {
              const today = new Date()
              const year = today.getFullYear()
              const month = String(today.getMonth() + 1).padStart(2, '0')
              const day = String(today.getDate()).padStart(2, '0')
              return `${year}-${month}-${day}`
            }
            setNewAppointmentForm({
              client: '',
              phone: '',
              email: '',
              service: '',
              staff: '',
              date: getToday(),
              startTime: '',
              endTime: '',
            })
            setNewCalendarDate(new Date())
            setShowNewAppointmentModal(true)
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> {t('appointments.new')}
        </Button>
      </div>

      {/* Выбор диапазона дат */}
      {isRangeOpen && (
        <div ref={rangeRef} className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-2 block">{t('appointments.fromDate')}</label>
            <button
              type="button"
              onClick={() => setIsStartDateOpen(true)}
              className="w-full h-10 px-3 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 text-foreground text-sm text-left flex items-center justify-between hover:border-accent/30 transition-colors"
            >
              <span>{dateRange.start ? new Date(dateRange.start).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : t('appointments.selectDate')}</span>
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1">
            <label className="text-xs text-muted-foreground mb-2 block">{t('appointments.toDate')}</label>
            <button
              type="button"
              onClick={() => setIsEndDateOpen(true)}
              className="w-full h-10 px-3 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 text-foreground text-sm text-left flex items-center justify-between hover:border-accent/30 transition-colors"
            >
              <span>{dateRange.end ? new Date(dateRange.end).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : t('appointments.selectDate')}</span>
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          {dateRange.start && dateRange.end && (
            <Button
              size="sm"
              onClick={() => {
                setIsRangeOpen(false)
              }}
              className="h-10"
            >
              Применить
            </Button>
          )}
        </div>
      )}

      {/* Календари */}
      <CalendarPicker
        isOpen={isStartDateOpen}
        onClose={() => setIsStartDateOpen(false)}
        selectedDateStr={dateRange.start}
        onSelect={(date) => {
          const newRange = { ...dateRange, start: date }
          setDateRange(newRange)
          setIsStartDateOpen(false)
          // Не закрываем список - ждем выбора второй даты
        }}
        calendarDate={startDateCalendar}
        onCalendarDateChange={setStartDateCalendar}
      />
      <CalendarPicker
        isOpen={isEndDateOpen}
        onClose={() => setIsEndDateOpen(false)}
        selectedDateStr={dateRange.end}
        onSelect={(date) => {
          const newRange = { ...dateRange, end: date }
          setDateRange(newRange)
          setIsEndDateOpen(false)
          // После выбора второй даты можно закрыть выбор диапазона
        }}
        calendarDate={endDateCalendar}
        onCalendarDateChange={setEndDateCalendar}
      />

      {/* Список записей */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <Card className="p-8 text-center backdrop-blur-xl bg-card/60">
            <p className="text-muted-foreground">{t('appointments.noAppointmentsFound')}</p>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => {
            // Пропускаем записи со статусом 'cancelled' (на случай если они все еще есть в данных)
            if ((appointment as any).status === 'cancelled') {
              return null
            }
            const status = statusConfig[appointment.status as keyof typeof statusConfig]
            if (!status) {
              return null
            }
            const source = sourceConfig[appointment.source]
            const SourceIcon = source.icon

            return (
              <Card
                key={appointment.id}
                className="p-4 backdrop-blur-xl bg-card/60 hover:bg-card/80 transition-all cursor-pointer"
                onClick={() => setSelectedAppointment(appointment)}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0" title={source.label}>
                      <SourceIcon className={cn("w-5 h-5", source.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-base text-foreground truncate">
                          {appointment.client}
                        </h3>
                        <Badge className={cn("text-xs font-medium border", status.color)}>
                          {status.label}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        {appointment.date && (
                          <span className="font-semibold text-foreground">
                            {formatDateForList(appointment.date)}
                          </span>
                        )}
                        <span className="font-mono font-semibold text-foreground">{appointment.time}</span>
                        <span className="truncate">{appointment.service}</span>
                        <span className="text-xs">• {appointment.staff}</span>
                      </div>
                    </div>
                  </div>
                  <div
                    className="flex flex-wrap items-center gap-2 sm:flex-nowrap sm:gap-2 flex-shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {appointment.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange(appointment.id, 'confirmed')}
                        className="h-8 px-3 text-xs w-full sm:w-auto"
                        title={t('appointments.confirm')}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {t('appointments.confirm')}
                      </Button>
                    )}
                    {appointment.status !== 'completed' && appointment.status !== 'no-show' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteAppointment(appointment.id)
                        }}
                        className="h-8 px-3 text-xs text-rose-400 hover:text-rose-300 w-full sm:w-auto"
                        title={t('common.delete')}
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        {t('common.delete')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Модальное окно с деталями записи */}
      {selectedAppointment && (selectedAppointment as any).status !== 'cancelled' && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedAppointment(null)}
        >
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            style={{ zIndex: -1 }}
          />
          <Card 
            className="w-full max-w-md backdrop-blur-2xl bg-card/95 border border-border/50 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
              <div className="p-6">
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
                    onClick={() => handleShowHistory(selectedAppointment.client)}
                    className="h-8 w-8"
                    title={t('common.clientHistory')}
                  >
                    <History className="w-4 h-4" />
                  </Button>
                </div>
                <h3 className="text-xl font-bold mb-6 pr-20">{t('calendar.appointmentDetails')}</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.client')}</h4>
                    <p className="text-base font-bold break-words">{selectedAppointment.client}</p>
                    <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1 min-w-0">
                      <Phone className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                      <span className="break-words">{selectedAppointment.phone}</span>
                    </div>
                    {selectedAppointment.email && (
                      <div className="flex items-start gap-2 text-sm text-muted-foreground mt-1 min-w-0">
                        <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        <span className="break-all max-w-full">{selectedAppointment.email}</span>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.service')}</h4>
                      <p className="text-sm">{selectedAppointment.service}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.master')}</h4>
                      <p className="text-sm">{selectedAppointment.staff}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('appointments.dateAndTime')}</h4>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <p className="text-sm">
                        {new Date(selectedAppointment.date).toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' })}, {selectedAppointment.time}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('calendar.status')}</h4>
                      <Badge className={cn("text-xs font-medium border", statusConfig[selectedAppointment.status as keyof typeof statusConfig]?.color || 'bg-gray-500/20 text-gray-400 border-gray-500/30')}>
                        {statusConfig[selectedAppointment.status as keyof typeof statusConfig]?.label || selectedAppointment.status}
                      </Badge>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">{t('appointments.source')}</h4>
                      <div className="flex items-center gap-2">
                        {(() => {
                          const SourceIcon = sourceConfig[selectedAppointment.source].icon
                          return <SourceIcon className={cn("w-4 h-4", sourceConfig[selectedAppointment.source].color)} />
                        })()}
                        <span className="text-sm">{sourceConfig[selectedAppointment.source].label}</span>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-border/50">
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        className="w-full text-primary border-primary/30 hover:bg-primary/20 hover:text-primary"
                        onClick={() => handleOpenEditAppointmentModal(selectedAppointment.id)}
                        size="sm"
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        {t('appointments.editAppointment')}
                      </Button>
                      {selectedAppointment.status === 'pending' && (
                        <>
                          <Button
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white focus:ring-0 focus:ring-offset-0 focus-visible:ring-0"
                            onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('appointments.confirmAppointment')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('appointments.deleteAppointment')}
                          </Button>
                        </>
                      )}
                      {selectedAppointment.status === 'confirmed' && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
                            onClick={() => handleStatusChange(selectedAppointment.id, 'pending')}
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t('home.returnToPending')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-orange-400 border-orange-500/30 hover:bg-orange-500/20 hover:text-orange-300"
                            onClick={() => handleStatusChange(selectedAppointment.id, 'no-show')}
                            size="sm"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            {t('home.markAsNoShow')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('appointments.deleteAppointment')}
                          </Button>
                        </>
                      )}
                      {selectedAppointment.status === 'no-show' && (
                        <>
                          <Button
                            variant="outline"
                            className="w-full text-amber-400 border-amber-500/30 hover:bg-amber-500/20 hover:text-amber-300"
                            onClick={() => handleStatusChange(selectedAppointment.id, 'pending')}
                            size="sm"
                          >
                            <RotateCcw className="w-4 h-4 mr-2" />
                            {t('home.returnToPending')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20 hover:text-emerald-300"
                            onClick={() => handleStatusChange(selectedAppointment.id, 'confirmed')}
                            size="sm"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            {t('appointments.confirmAppointment')}
                          </Button>
                          <Button
                            variant="outline"
                            className="w-full text-red-400 border-red-500/30 hover:bg-red-500/20 hover:text-red-300"
                            onClick={() => handleDeleteAppointment(selectedAppointment.id)}
                            size="sm"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t('appointments.deleteAppointment')}
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
                <h3 className="text-xl font-bold mb-6 pr-12">{t('appointments.visitHistory')}: {historyClient}</h3>
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
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">{t('appointments.serviceLabel')}</span>
                                <span className="text-sm font-medium text-foreground">{visit.service}</span>
                      </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">{t('appointments.masterLabel')}</span>
                                <span className="text-sm font-medium text-foreground">{visit.master}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide w-20">{t('appointments.paymentLabel')}</span>
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
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('appointments.totalVisits')}</span>
                        <span className="text-base font-bold text-foreground">{getClientHistory(historyClient).length}</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{t('appointments.totalAmount')}</span>
                        <span className="text-lg font-bold text-emerald-400">
                          {getClientHistory(historyClient).reduce((sum, visit) => sum + visit.amount, 0)} MDL
                        </span>
                      </div>
                    </Card>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                    <p className="text-muted-foreground">История посещений пуста</p>
                    </div>
                  )}
                </div>
          </Card>
        </div>
      )}

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
              
              <h3 className="text-xl font-bold mb-6 pr-12">{t('appointments.editAppointment')}</h3>
              
              <div className="space-y-4">
                {/* Дата записи */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    {t('home.appointmentDate')} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditDatePickerOpen(true)
                      if (editForm.date) {
                        setEditCalendarDate(new Date(editForm.date + 'T00:00:00'))
                      }
                    }}
                    className="w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-card/60 focus:bg-card/60 focus:ring-2 focus:ring-primary/30 text-sm transition-all outline-none flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className={editForm.date ? 'text-foreground' : 'text-muted-foreground'}>
                        {formatDateDisplay(editForm.date)}
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
                    value={editForm.client}
                    onChange={(e) => setEditForm(prev => ({ ...prev, client: e.target.value }))}
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
                    value={editForm.phone}
                    onChange={(e) => {
                      const raw = e.target.value
                      const sanitized = raw.replace(/[^\d+]/g, '')
                      const normalized = sanitized.startsWith('+')
                        ? `+${sanitized.slice(1).replace(/\+/g, '')}`
                        : sanitized.replace(/\+/g, '')
                      setEditForm(prev => ({ ...prev, phone: normalized }))
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
                    value={editForm.email}
                    onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
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
                  <div ref={editServiceDropdownRef} className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between bg-card/40 backdrop-blur-sm border-border/50"
                      onClick={() => setIsEditServiceOpen(!isEditServiceOpen)}
                    >
                      <span className={editForm.service ? 'text-foreground' : 'text-muted-foreground'}>
                        {editForm.service || t('home.selectService')}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isEditServiceOpen && "rotate-180")} />
                    </Button>
                    {isEditServiceOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                        <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                          {services.map((service) => (
                            <button
                              key={service}
                              type="button"
                              onClick={() => handleEditServiceChange(service)}
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
                  <div ref={editMasterDropdownRef} className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between bg-card/40 backdrop-blur-sm border-border/50"
                      onClick={() => setIsEditMasterOpen(!isEditMasterOpen)}
                    >
                      <span className={editForm.staff ? 'text-foreground' : 'text-muted-foreground'}>
                        {editForm.staff || t('home.selectMaster')}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isEditMasterOpen && "rotate-180")} />
                    </Button>
                    {isEditMasterOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                        <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                          {mastersList.map((master) => (
                            <button
                              key={master}
                              type="button"
                              onClick={() => {
                                setEditForm(prev => ({ ...prev, staff: master }))
                                setIsEditMasterOpen(false)
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
                  <div ref={editStartTimeDropdownRef} className="relative">
                    <div className="relative">
                      <Input
                        ref={editStartTimeInputRef}
                        value={editForm.startTime}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^\d:]/g, '')
                          if (value.length === 2 && !value.includes(':')) {
                            value = value + ':'
                          }
                          if (value.length > 5) {
                            value = value.slice(0, 5)
                          }
                          handleEditStartTimeChange(value)
                        }}
                        onBlur={(e) => {
                          const value = e.target.value
                          if (value && !value.match(/^\d{2}:\d{2}$/)) {
                            const parts = value.split(':')
                            if (parts.length === 2) {
                              const formatted = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
                              handleEditStartTimeChange(formatted)
                            }
                          }
                        }}
                        onFocus={() => setIsEditStartTimeDropdownOpen(true)}
                        placeholder={t('common.enterTime')}
                        className="h-12 bg-card/40 backdrop-blur-sm border-border/50 pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setIsEditStartTimeDropdownOpen(!isEditStartTimeDropdownOpen)}
                      >
                        <ChevronDown className={cn("w-4 h-4 transition-transform", isEditStartTimeDropdownOpen && "rotate-180")} />
                      </Button>
                    </div>
                    {isEditStartTimeDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                        {AVAILABLE_SLOTS.map((time) => {
                          const isSelected = editForm.startTime === time
                          
                          return (
                            <button
                              key={time}
                              type="button"
                              onClick={() => {
                                setEditForm(prev => {
                                  const newForm = { ...prev, startTime: time }
                                  if (newForm.service) {
                                    newForm.endTime = calculateEndTime(time, newForm.service)
                                  }
                                  return newForm
                                })
                                setIsEditStartTimeDropdownOpen(false)
                                editStartTimeInputRef.current?.blur()
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
                    value={editForm.endTime}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^\d:]/g, '')
                      if (value.length === 2 && !value.includes(':')) {
                        value = value + ':'
                      }
                      if (value.length > 5) {
                        value = value.slice(0, 5)
                      }
                      setEditForm(prev => ({ ...prev, endTime: value }))
                    }}
                    onBlur={(e) => {
                      const value = e.target.value
                      if (value && !value.match(/^\d{2}:\d{2}$/)) {
                        const parts = value.split(':')
                        if (parts.length === 2) {
                          const formatted = `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
                          setEditForm(prev => ({ ...prev, endTime: formatted }))
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
                  {t('appointments.saveChanges')}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Модальное окно выбора даты для редактирования */}
      {isEditDatePickerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
            onClick={() => setIsEditDatePickerOpen(false)}
          />
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsEditDatePickerOpen(false)
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
                    onClick={() => setIsEditDatePickerOpen(false)}
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
                      const newDate = new Date(editCalendarDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setEditCalendarDate(newDate)
                    }}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-sm">
                    {editCalendarDate.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(editCalendarDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setEditCalendarDate(newDate)
                    }}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {[t('appointments.monday'), t('appointments.tuesday'), t('appointments.wednesday'), t('appointments.thursday'), t('appointments.friday'), t('appointments.saturday'), t('appointments.sunday')].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(editCalendarDate).map((date, idx) => {
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
                            setEditForm(prev => ({ ...prev, date: dateStr }))
                            setIsEditDatePickerOpen(false)
                          }
                        }}
                        disabled={isPast}
                        className={cn(
                          "h-9 rounded-lg text-sm transition-all cursor-pointer",
                          isPast && "opacity-30 cursor-not-allowed",
                          isSelected(date, editForm.date)
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
                      setIsNewDatePickerOpen(true)
                      if (newAppointmentForm.date) {
                        setNewCalendarDate(new Date(newAppointmentForm.date + 'T00:00:00'))
                      }
                    }}
                    className="w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border border-border/50 hover:bg-card/60 focus:bg-card/60 focus:ring-2 focus:ring-primary/30 text-sm transition-all outline-none flex items-center justify-between text-left"
                  >
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span className={newAppointmentForm.date ? 'text-foreground' : 'text-muted-foreground'}>
                        {newAppointmentForm.date ? new Date(newAppointmentForm.date + 'T00:00:00').toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { weekday: 'short', day: 'numeric', month: 'short' }) : t('appointments.selectDate')}
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
                  <div ref={newServiceDropdownRef} className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between bg-card/40 backdrop-blur-sm border-border/50"
                      onClick={() => setIsNewServiceOpen(!isNewServiceOpen)}
                    >
                      <span className={newAppointmentForm.service ? 'text-foreground' : 'text-muted-foreground'}>
                        {newAppointmentForm.service || t('home.selectService')}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isNewServiceOpen && "rotate-180")} />
                    </Button>
                    {isNewServiceOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                        <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                          {services.map((service) => (
                            <button
                              key={service}
                              type="button"
                              onClick={() => handleNewServiceChange(service)}
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
                  <div ref={newMasterDropdownRef} className="relative">
                    <Button
                      variant="outline"
                      className="w-full h-12 justify-between bg-card/40 backdrop-blur-sm border-border/50"
                      onClick={() => setIsNewMasterOpen(!isNewMasterOpen)}
                    >
                      <span className={newAppointmentForm.staff ? 'text-foreground' : 'text-muted-foreground'}>
                        {newAppointmentForm.staff || t('home.selectMaster')}
                      </span>
                      <ChevronDown className={cn("w-4 h-4 transition-transform", isNewMasterOpen && "rotate-180")} />
                    </Button>
                    {isNewMasterOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                        <div className="py-1 max-h-60 overflow-y-auto scrollbar-hide">
                          {mastersList.map((master) => (
                            <button
                              key={master}
                              type="button"
                              onClick={() => {
                                setNewAppointmentForm(prev => ({ ...prev, staff: master }))
                                setIsNewMasterOpen(false)
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
                  <div ref={newStartTimeDropdownRef} className="relative">
                    <div className="relative">
                      <Input
                        ref={newStartTimeInputRef}
                        value={newAppointmentForm.startTime}
                        onChange={(e) => {
                          let value = e.target.value.replace(/[^\d:]/g, '')
                          if (value.length === 2 && !value.includes(':')) {
                            value = value + ':'
                          }
                          if (value.length > 5) {
                            value = value.slice(0, 5)
                          }
                          handleNewStartTimeChange(value)
                        }}
                        onFocus={() => setIsNewStartTimeDropdownOpen(true)}
                        placeholder={t('common.enterTime')}
                        className="h-12 bg-card/40 backdrop-blur-sm border-border/50 pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    </div>
                    {isNewStartTimeDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                        <div className="py-1">
                          {AVAILABLE_SLOTS.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => handleNewStartTimeChange(slot)}
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

      {/* Модальное окно выбора даты для создания новой записи */}
      {isNewDatePickerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110]"
            onClick={() => setIsNewDatePickerOpen(false)}
          />
          <div 
            className="fixed inset-0 z-[120] flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsNewDatePickerOpen(false)
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
                    onClick={() => setIsNewDatePickerOpen(false)}
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
                      const newDate = new Date(newCalendarDate)
                      newDate.setMonth(newDate.getMonth() - 1)
                      setNewCalendarDate(newDate)
                    }}
                    className="h-8 w-8"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-semibold text-sm">
                    {newCalendarDate.toLocaleDateString(language === 'ru' ? 'ru-RU' : language === 'ro' ? 'ro-RO' : 'en-US', { month: 'long', year: 'numeric' })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const newDate = new Date(newCalendarDate)
                      newDate.setMonth(newDate.getMonth() + 1)
                      setNewCalendarDate(newDate)
                    }}
                    className="h-8 w-8"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {[t('appointments.monday'), t('appointments.tuesday'), t('appointments.wednesday'), t('appointments.thursday'), t('appointments.friday'), t('appointments.saturday'), t('appointments.sunday')].map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                      {day}
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {getDaysInMonth(newCalendarDate).map((date, idx) => {
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
                            setIsNewDatePickerOpen(false)
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
    </div>
  )
}
