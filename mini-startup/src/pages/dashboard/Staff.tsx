import { useState, useRef, useEffect } from 'react'
import { Plus, MoreVertical, Edit, Trash2, X, ChevronDown, Check, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/contexts/LanguageContext'

interface Staff {
  id: string
  name: string
  category: string
  description?: string
  color: string
  services: string[]
  workingDays: string[]
  workingHours: { start: string; end: string }
  active: boolean
}

const initialStaff: Staff[] = [
  { 
    id: '1', 
    name: 'Алекс Ривера', 
    category: 'Парикмахер', 
    description: 'Специализируется на мужских стрижках и бородах',
    color: '#3b82f6', // синий
    services: ['Мужская стрижка', 'Стрижка бороды'],
    workingDays: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'],
    workingHours: { start: '09:00', end: '18:00' },
    active: true
  },
  { 
    id: '2', 
    name: 'Сара Чен', 
    category: 'Стилист', 
    description: 'Опытный мастер по окрашиванию и укладке',
    color: '#ec4899', // розовый
    services: ['Окрашивание', 'Укладка', 'Классический маникюр'],
    workingDays: ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    workingHours: { start: '10:00', end: '19:00' },
    active: true
  },
  { 
    id: '3', 
    name: 'Майк Джонсон', 
    category: 'Барбер', 
    description: 'Мастер классических и современных стрижек',
    color: '#10b981', // зеленый
    services: ['Мужская стрижка', 'Полное бритье'],
    workingDays: ['Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
    workingHours: { start: '09:00', end: '17:00' },
    active: true
  },
]

// Функция для загрузки мастеров из localStorage
const loadStaff = (): Staff[] => {
  const stored = localStorage.getItem('staff')
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (e) {
      console.error('Ошибка загрузки мастеров:', e)
    }
  }
  // Если нет сохраненных мастеров, сохраняем начальные
  localStorage.setItem('staff', JSON.stringify(initialStaff))
  return initialStaff
}

// Функция для сохранения мастеров в localStorage
const saveStaff = (staff: Staff[]) => {
  localStorage.setItem('staff', JSON.stringify(staff))
}

const categories = ['Парикмахер', 'Барбер', 'Стилист', 'Мастер маникюра', 'Косметолог']

// Функция для загрузки услуг из localStorage
const loadAvailableServices = (): string[] => {
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

const colorOptions = [
  { name: 'Синий', value: '#3b82f6' },
  { name: 'Розовый', value: '#ec4899' },
  { name: 'Зеленый', value: '#10b981' },
  { name: 'Фиолетовый', value: '#8b5cf6' },
  { name: 'Оранжевый', value: '#f59e0b' },
  { name: 'Красный', value: '#ef4444' },
  { name: 'Голубой', value: '#06b6d4' },
  { name: 'Желтый', value: '#eab308' },
]

const daysOfWeek = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье']

export default function Staff() {
  const { t } = useLanguage()
  const [staff, setStaff] = useState<Staff[]>(loadStaff)
  const [availableServices, setAvailableServices] = useState<string[]>(loadAvailableServices())
  const [showForm, setShowForm] = useState(false)
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    color: '#3b82f6',
    services: [] as string[],
    workingDays: [] as string[],
    workingHours: { start: '09:00', end: '18:00' },
  })
  const [isCategoryOpen, setIsCategoryOpen] = useState(false)
  const [isColorOpen, setIsColorOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [showMenu, setShowMenu] = useState<string | null>(null)
  
  const categoryDropdownRef = useRef<HTMLDivElement>(null)
  const colorDropdownRef = useRef<HTMLDivElement>(null)
  const servicesDropdownRef = useRef<HTMLDivElement>(null)
  const menuRefs = useRef<Record<string, HTMLDivElement | null>>({})

  // Обновляем услуги при монтировании и при изменении localStorage
  useEffect(() => {
    const updateServices = () => {
      setAvailableServices(loadAvailableServices())
    }
    updateServices()
    window.addEventListener('storage', updateServices)
    const interval = setInterval(updateServices, 1000)
    return () => {
      window.removeEventListener('storage', updateServices)
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setIsCategoryOpen(false)
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(event.target as Node)) {
        setIsColorOpen(false)
      }
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(event.target as Node)) {
        setIsServicesOpen(false)
      }
      if (showMenu) {
        const menuRef = Object.values(menuRefs.current).find(ref => ref)
        if (menuRef && !menuRef.contains(event.target as Node)) {
          setShowMenu(null)
        }
      }
    }
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside)
    }, 0)
    return () => {
      clearTimeout(timeoutId)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  const toggleDay = (day: string) => {
    const days = formData.workingDays
    if (days.includes(day)) {
      setFormData({ ...formData, workingDays: days.filter(d => d !== day) })
    } else {
      setFormData({ ...formData, workingDays: [...days, day] })
    }
  }

  const toggleService = (service: string) => {
    const services = formData.services
    if (services.includes(service)) {
      setFormData({ ...formData, services: services.filter(s => s !== service) })
    } else {
      setFormData({ ...formData, services: [...services, service] })
    }
  }


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      alert(t('staff.fillName'))
      return
    }
    if (!formData.category) {
      alert(t('staff.selectCategoryRequired'))
      return
    }
    if (formData.workingDays.length === 0) {
      alert(t('staff.selectWorkingDaysRequired'))
      return
    }

    let updatedStaff: Staff[]
    if (editingStaff) {
      updatedStaff = staff.map(s => 
        s.id === editingStaff.id
          ? {
              ...s,
              name: formData.name,
              category: formData.category,
              description: formData.description,
              color: formData.color,
              services: formData.services,
              workingDays: formData.workingDays,
              workingHours: formData.workingHours,
            }
          : s
      )
      setEditingStaff(null)
    } else {
      const newStaff: Staff = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        description: formData.description,
        color: formData.color,
        services: formData.services,
        workingDays: formData.workingDays,
        workingHours: formData.workingHours,
        active: true,
      }
      updatedStaff = [...staff, newStaff]
    }
    
    setStaff(updatedStaff)
    saveStaff(updatedStaff)

    setFormData({
      name: '',
      category: '',
      description: '',
      color: '#3b82f6',
      services: [],
      workingDays: [],
      workingHours: { start: '09:00', end: '18:00' },
    })
    setShowForm(false)
    setShowMenu(null)
  }

  const handleEdit = (staffMember: Staff, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setEditingStaff(staffMember)
    setFormData({
      name: staffMember.name,
      category: staffMember.category,
      description: staffMember.description || '',
      color: staffMember.color,
      services: staffMember.services,
      workingDays: staffMember.workingDays,
      workingHours: staffMember.workingHours,
    })
    setShowForm(true)
    setShowMenu(null)
    setTimeout(() => {
      document.querySelector('[data-staff-form]')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleDelete = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    if (confirm(t('staff.confirmDelete'))) {
      const updatedStaff = staff.filter(s => s.id !== id)
      setStaff(updatedStaff)
      saveStaff(updatedStaff)
      setShowMenu(null)
    }
  }

  const toggleActive = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const updatedStaff = staff.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    )
    setStaff(updatedStaff)
    saveStaff(updatedStaff)
    setShowMenu(null)
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingStaff(null)
    setFormData({
      name: '',
      category: '',
      description: '',
      color: '#3b82f6',
      services: [],
      workingDays: [],
      workingHours: { start: '09:00', end: '18:00' },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end items-center">
        <Button 
          className="rounded-full bg-primary hover:bg-primary/90"
          onClick={() => {
            setShowForm(true)
            setEditingStaff(null)
            setFormData({
              name: '',
              category: '',
              description: '',
              color: '#3b82f6',
              services: [],
              workingDays: [],
              workingHours: { start: '09:00', end: '18:00' },
            })
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> {t('staff.addStaff')}
        </Button>
      </div>

      {showForm && (
        <Card 
          data-staff-form
          className="p-6 backdrop-blur-xl bg-card/60 border-border/50"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">
              {editingStaff ? t('staff.editStaff') : t('staff.addStaff')}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Имя */}
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('staff.staffName')} *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder={t('staff.staffName')}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                  required
                />
              </div>

              {/* Категория */}
              <div ref={categoryDropdownRef} className="relative">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('staff.category')} *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={`w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between ${
                    isCategoryOpen
                      ? 'border-accent/50 ring-2 ring-accent/30'
                      : 'border-border/50 hover:border-accent/30'
                  } ${formData.category ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <span>{formData.category || t('staff.selectCategory')}</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isCategoryOpen && (
                  <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                    <div className="py-1">
                      {categories.map((category) => (
                        <button
                          key={category}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, category })
                            setIsCategoryOpen(false)
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors ${
                            formData.category === category
                              ? 'bg-accent/20 text-accent'
                              : 'text-foreground hover:bg-accent/10 hover:text-accent'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Описание */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('staff.description')}
                </label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder={t('staff.descriptionPlaceholder')}
                  className="h-12 bg-card/40 backdrop-blur-sm border-border/50"
                />
              </div>

              {/* Цвет */}
              <div ref={colorDropdownRef} className="relative">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('staff.color')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsColorOpen(!isColorOpen)}
                  className={`w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between ${
                    isColorOpen
                      ? 'border-accent/50 ring-2 ring-accent/30'
                      : 'border-border/50 hover:border-accent/30'
                  } text-foreground`}
                >
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-5 h-5 rounded-full border-2 border-border/50"
                      style={{ backgroundColor: formData.color }}
                    />
                    <span>{colorOptions.find(c => c.value === formData.color)?.name || t('staff.selectColor')}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isColorOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isColorOpen && (
                  <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden">
                    <div className="py-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, color: color.value })
                            setIsColorOpen(false)
                          }}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                            formData.color === color.value
                              ? 'bg-accent/20 text-accent'
                              : 'text-foreground hover:bg-accent/10 hover:text-accent'
                          }`}
                        >
                          <div 
                            className="w-5 h-5 rounded-full border-2 border-border/50"
                            style={{ backgroundColor: color.value }}
                          />
                          <span>{color.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Услуги */}
              <div ref={servicesDropdownRef} className="relative">
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('staff.services')}
                </label>
                <button
                  type="button"
                  onClick={() => setIsServicesOpen(!isServicesOpen)}
                  className={`w-full h-12 px-4 rounded-lg bg-card/40 backdrop-blur-sm border transition-all flex items-center justify-between ${
                    isServicesOpen
                      ? 'border-accent/50 ring-2 ring-accent/30'
                      : 'border-border/50 hover:border-accent/30'
                  } ${formData.services.length > 0 ? 'text-foreground' : 'text-muted-foreground'}`}
                >
                  <span>
                    {formData.services.length > 0 
                      ? `${t('staff.selected')}: ${formData.services.length}` 
                      : t('staff.selectServices')}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isServicesOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isServicesOpen && (
                  <div className="absolute z-50 w-full mt-1 backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden max-h-60 overflow-y-auto scrollbar-hide">
                    <div className="py-1">
                      {availableServices.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => toggleService(service)}
                          className={`w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center gap-2 ${
                            formData.services.includes(service)
                              ? 'bg-accent/20 text-accent'
                              : 'text-foreground hover:bg-accent/10 hover:text-accent'
                          }`}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded border-2 flex items-center justify-center",
                            formData.services.includes(service)
                              ? "bg-accent border-accent"
                              : "border-border"
                          )}>
                            {formData.services.includes(service) && (
                              <Check className="w-3 h-3 text-accent-foreground" />
                            )}
                          </div>
                          <span>{service}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Рабочие дни */}
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                {t('staff.workingDays')} *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {daysOfWeek.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={cn(
                      "flex items-center p-3 rounded-lg border-2 transition-all text-sm",
                      formData.workingDays.includes(day)
                        ? 'border-accent bg-accent/20 text-accent'
                        : 'border-border/50 hover:border-accent/30 text-foreground'
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border-2 mr-2 flex items-center justify-center",
                      formData.workingDays.includes(day)
                        ? "bg-accent border-accent"
                        : "border-border"
                    )}>
                      {formData.workingDays.includes(day) && (
                        <Check className="w-3 h-3 text-accent-foreground" />
                      )}
                    </div>
                    <span>{day}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Рабочие часы */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('staff.startTime')}
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={formData.workingHours.start}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHours: { ...formData.workingHours, start: e.target.value },
                      })
                    }
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50 text-foreground"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  {t('staff.endTime')}
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    value={formData.workingHours.end}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        workingHours: { ...formData.workingHours, end: e.target.value },
                      })
                    }
                    className="h-12 bg-card/40 backdrop-blur-sm border-border/50 text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Кнопки */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" className="rounded-full">
                <Check className="w-4 h-4 mr-2" />
                {editingStaff ? t('common.save') : t('staff.addStaff')}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} className="rounded-full">
                {t('common.cancel')}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Список мастеров */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {staff.map(staffMember => (
          <Card 
            key={staffMember.id} 
            className={cn(
              "p-5 backdrop-blur-xl bg-card/60 border-border/50 transition-all hover:bg-card/80",
              !staffMember.active && "opacity-70"
            )}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Цветной индикатор вместо аватарки */}
                <div 
                  className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-border/50 flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: staffMember.color }}
                >
                  {staffMember.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground truncate">{staffMember.name}</h3>
                  <p className="text-sm text-muted-foreground">{staffMember.category}</p>
                </div>
              </div>
              
              <div className="relative" ref={(el) => { menuRefs.current[staffMember.id] = el }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowMenu(showMenu === staffMember.id ? null : staffMember.id)
                  }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
                
                {showMenu === staffMember.id && (
                  <div 
                    className="absolute right-0 top-10 z-50 min-w-[160px] backdrop-blur-2xl bg-card border border-border/50 rounded-lg shadow-2xl shadow-black/20 overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={(e) => handleEdit(staffMember, e)}
                        className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        {t('staff.editStaff')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => toggleActive(staffMember.id, e)}
                        className="w-full px-4 py-2.5 text-left text-sm text-foreground hover:bg-accent/10 hover:text-accent transition-colors flex items-center gap-2"
                      >
                        {staffMember.active ? t('staff.disableStaff') : t('staff.enableStaff')}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(staffMember.id, e)}
                        className="w-full px-4 py-2.5 text-left text-sm text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {t('staff.deleteStaff')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {staffMember.description && (
              <p className="text-sm text-muted-foreground mb-3">{staffMember.description}</p>
            )}

            {staffMember.services.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-muted-foreground mb-2">{t('staff.services')}:</p>
                <div className="flex flex-wrap gap-1">
                  {staffMember.services.map((service, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>{staffMember.workingHours.start} - {staffMember.workingHours.end}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {staffMember.workingDays.length} {t('staff.daysPerWeek')}
                </p>
                <Badge 
                  className={cn(
                    "text-xs font-medium border",
                    staffMember.active 
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  )}
                >
                  {staffMember.active ? t('common.active') : t('common.inactive')}
                </Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {staff.length === 0 && (
        <Card className="p-12 text-center backdrop-blur-xl bg-card/60">
          <p className="text-muted-foreground">{t('staff.noStaff')}</p>
        </Card>
      )}
    </div>
  )
}
